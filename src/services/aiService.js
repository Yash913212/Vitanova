/**
 * VitaNova AI — OpenRouter AI Service
 * Modular adapter for vision + conversational AI with robust caching, fallbacks, and offline support.
 */
import { getAIConfig, isAPIConfigured } from '../utils/config';
import { getCachedNutrition, cacheNutrition, searchOfflineFood } from './sqlite/database';
import { lookupNutrition } from './nutritionService';
import { retrieveKnowledge } from './rag/retriever';

// Robust vision model fallback chain
const VISION_FALLBACKS = [
  'google/gemini-2.5-flash',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'qwen/qwen-2-vl-7b-instruct:free'
];

// Robust conversational chat model fallback chain
const CHAT_FALLBACKS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free'
];

/**
 * Recognize food items in an image using OpenRouter vision model.
 * Performs caching and retry fallbacks.
 * @param {string} base64Image - Base64 encoded image
 * @returns {Object} { item, confidence, summary, raw }
 */
export async function recognizeImage(base64Image) {
  if (!isAPIConfigured()) {
    throw new AIError('API key not configured. Go to Settings to add your OpenRouter API key.', 'CONFIG_ERROR');
  }

  // 1. Check SQLite vision cache first
  const cacheKey = `vision_${base64Image.length}_${base64Image.substring(0, 100)}`;
  const cachedResponse = await getCachedNutrition(cacheKey);
  if (cachedResponse) {
    console.log('[AI Service] Vision response retrieved from local SQLite cache.');
    return cachedResponse;
  }

  const config = getAIConfig();
  
  // Make a list of models to try in order: primary model then the fallbacks
  const modelChain = [config.visionModel, ...VISION_FALLBACKS];
  let lastError = null;

  for (let i = 0; i < modelChain.length; i++) {
    const activeModel = modelChain[i];
    console.log(`[AI Service] Attempting vision scan with model (${i + 1}/${modelChain.length}): ${activeModel}`);

    const controller = new AbortController();
    // Enforce a strict 15-second timeout
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://vitanova.app',
          'X-Title': 'VitaNova AI',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: activeModel,
          max_tokens: config.maxTokensVision,
          messages: [
            {
              role: 'system',
              content: `You are a vision AI that identifies food items. Analyze the image carefully.

If the image contains food, respond in this exact JSON format (no markdown):
{"item":"food name","confidence":0.85,"summary":"Brief 1-sentence nutrition description","multiple":false,"items":["item1"],"isFood":true,"description":""}

If the image does NOT contain food, still describe what you see. Respond in this exact JSON format (no markdown):
{"item":"unknown","confidence":0.1,"summary":"Not a food item","multiple":false,"items":[],"isFood":false,"description":"Detailed 2-3 sentence description of the object, including what it is, its purpose, notable features, and any interesting facts about it."}

Always include the "description" and "isFood" fields.`,
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'What food item is in this image? Identify it precisely.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
              ],
            },
          ],
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new AIError(`API error: ${response.status} ${errBody}`, 'API_ERROR');
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new AIError('Empty response from AI', 'EMPTY_RESPONSE');
      }

      // Parse the JSON response
      let result;
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        result = {
          item: parsed.item || 'unknown',
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
          summary: parsed.summary || `Detected: ${parsed.item}`,
          multiple: parsed.multiple || false,
          items: parsed.items || [parsed.item],
          isFood: parsed.isFood !== false,
          description: parsed.description || '',
          raw: content,
        };
      } catch {
        // Fallback: extract item name from text
        const itemMatch = content.match(/(?:item|food|detect)[:\s]*["']?(\w[\w\s]+)/i);
        result = {
          item: itemMatch ? itemMatch[1].trim() : 'unknown',
          confidence: 0.5,
          summary: content.substring(0, 150),
          multiple: false,
          items: [],
          raw: content,
        };
      }

      // Cache successful response in SQLite
      await cacheNutrition(cacheKey, result);
      return result;

    } catch (error) {
      clearTimeout(timeout);
      console.warn(`[AI Service] Vision model ${activeModel} failed:`, error.message);
      
      // If we are completely offline/network disconnected, fail fast and don't loop
      if (error.message && (error.message.includes('Network request failed') || error.code === 'NETWORK_ERROR')) {
        throw new AIError('Network unreachable. Please check your connection.', 'NETWORK_ERROR');
      }

      lastError = error;
    }
  }

  // If all models failed, throw timeout/unreachable
  if (lastError && lastError.name === 'AbortError') {
    throw new AIError('Request timed out. The AI service is currently congested. Try manual entry.', 'TIMEOUT');
  }
  
  throw new AIError(lastError ? lastError.message : 'All vision services failed. Please type manually.', 'OFFLINE_FALLBACK');
}

/**
 * Chat with AI assistant.
 * Performs caching, model fallbacks, and local offline RAG compilation on failure.
 * @param {Array} messages - Chat messages [{role, content}]
 * @param {string} systemPrompt - System context
 * @returns {string} AI response text
 */
export async function chatWithAI(messages, systemPrompt) {
  if (!isAPIConfigured()) {
    throw new AIError('API key not configured.', 'CONFIG_ERROR');
  }

  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const cacheKey = `chat_${lastUserMessage.toLowerCase().trim()}`;

  // 1. Check chat response cache
  const cachedResponse = await getCachedNutrition(cacheKey);
  if (cachedResponse && typeof cachedResponse === 'string') {
    console.log('[AI Service] Chat response retrieved from SQLite cache.');
    return cachedResponse;
  }

  const config = getAIConfig();
  const modelChain = [config.chatModel, ...CHAT_FALLBACKS];
  let lastError = null;

  for (let i = 0; i < modelChain.length; i++) {
    const activeModel = modelChain[i];
    console.log(`[AI Service] Attempting chat with model (${i + 1}/${modelChain.length}): ${activeModel}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const allMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
      ];

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://vitanova.app',
          'X-Title': 'VitaNova AI',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: activeModel,
          max_tokens: config.maxTokensChat,
          messages: allMessages,
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new AIError(`API error: ${response.status}`, 'API_ERROR');
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new AIError('Empty response from AI', 'EMPTY_RESPONSE');
      }

      const trimmedContent = content.trim();
      
      // Save in cache
      await cacheNutrition(cacheKey, trimmedContent);
      return trimmedContent;

    } catch (error) {
      clearTimeout(timeout);
      console.warn(`[AI Service] Chat model ${activeModel} failed:`, error.message);
      
      if (error.message && error.message.includes('Network request failed')) {
        break; // Network unreachable, break out to trigger local offline fallback directly
      }

      lastError = error;
    }
  }

  // ==========================================
  // OFFLINE FALLBACK: Local-RAG SQL Retrieval
  // ==========================================
  console.log('[AI Service] API request failed. Compiling a local database offline response...');
  
  // Extract key search terms from user's message (e.g. "Tell me about chicken", "Is milk healthy?")
  const cleanMessage = lastUserMessage.toLowerCase();
  const stopwords = ['the', 'is', 'a', 'an', 'and', 'or', 'but', 'how', 'what', 'why', 'who', 'where', 'when', 'tell', 'me', 'about', 'healthy', 'good', 'bad', 'for', 'you', 'to', 'eat'];
  const keywords = cleanMessage
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.includes(word));

  // Search each keyword in local SQLite food database
  for (const keyword of keywords) {
    const localMatches = await searchOfflineFood(keyword);
    if (localMatches && localMatches.length > 0) {
      const food = localMatches[0];
      const offlineMsg = `📡 **[Offline Mode — Verified Local Database]**
I couldn't connect to the AI servers. However, I retrieved these verified nutritional details directly from your local offline database:

🍏 **${food.name}** (${food.category})
• **Calories:** ${food.calories} kcal per 100g
• **Protein:** ${food.protein}g
• **Carbohydrates:** ${food.carbs}g
• **Dietary Fiber:** ${food.fiber}g
• **Fats:** ${food.fats}g
• **Water Hydration:** ${food.hydration}%

✨ **Benefits:** ${food.benefits}
⏰ **Ideal Consumption Time:** ${food.bestTime} (Recommended: ${food.recommendedQty})
💊 **Rich In:** ${[...food.vitamins, ...food.minerals].slice(0, 5).join(', ')}`;
      
      return offlineMsg;
    }
  }

  // Generic offline fallback if no keyword matches
  return `📡 **[Offline Mode]**
I am currently unable to reach the AI servers (Timeout or Network Disconnection).

I searched your offline database for terms matching your query but couldn't find a matching food item. 

💡 *Try asking about standard foods in our local DB, such as:*
Apple, Banana, Rice, Chicken Breast, Eggs, Whole Milk, Avocado, Spinach, Oats, paneer, or Salmon.`;
}

/**
 * Upgrade the VitaNova AI image analysis system to perform dietician-level nutrition breakdown.
 * Orchestrates: Vision Detection -> Cache Check -> DB Retrieval -> RAG doc match -> OpenRouter enhancement -> Cache.
 */
export async function analyzeFoodImageAndGenerateInsights(base64Image, profile, settings, isOnline) {
  // 1. Identify primary food item name from image using Vision AI
  const visionResult = await recognizeImage(base64Image);
  if (!visionResult.isFood) {
    return {
      ...visionResult,
      detailedAnalysis: null
    };
  }

  const foodName = visionResult.item;

  // 2. Check local SQLite cache first for detailed dietician breakdown
  const cacheKey = `detailed_${foodName.toLowerCase().replace(/\s+/g, '_')}`;
  const cachedResponse = await getCachedNutrition(cacheKey);
  if (cachedResponse) {
    console.log('[AI Service] Enriched detailed response retrieved from local SQLite cache.');
    return {
      ...visionResult,
      detailedAnalysis: cachedResponse
    };
  }

  // 3. Local DB retrieval & RAG retrieval
  const dbNutrition = lookupNutrition(foodName);
  const language = settings?.ttsLanguage || 'en';
  const retrievedDocs = retrieveKnowledge(foodName, { language, topK: 1 });
  const ragDoc = retrievedDocs && retrievedDocs.length > 0 ? retrievedDocs[0] : null;

  // 4. Generate or compile analysis
  let detailedAnalysis = null;

  if (isOnline && isAPIConfigured()) {
    const config = getAIConfig();
    const modelChain = [config.chatModel, ...CHAT_FALLBACKS];
    let lastError = null;

    const systemPrompt = `You are a Professional AI Dietician and Nutrition Coach. Generate a comprehensive dietician-level nutritional analysis for the food item: "${foodName}".
We have verified local information:
- Category: ${dbNutrition?.category || 'General'}
- Macros (per 100g): Calories: ${dbNutrition?.calories || 'N/A'}, Protein: ${dbNutrition?.protein || 'N/A'}g, Carbs: ${dbNutrition?.carbs || 'N/A'}g, Fats: ${dbNutrition?.fats || 'N/A'}g, Fiber: ${dbNutrition?.fiber || 'N/A'}g
- Hydration: ${dbNutrition?.hydration || 'N/A'}%
- Vitamins: ${dbNutrition?.vitamins?.join(', ') || 'N/A'}
- Minerals: ${dbNutrition?.minerals?.join(', ') || 'N/A'}
${ragDoc ? `- RAG Health Benefits: ${ragDoc.benefits}` : ''}
${ragDoc ? `- RAG Recommended Portion: ${ragDoc.recommendedIntake}` : ''}
${ragDoc ? `- RAG Optimal Time: ${ragDoc.bestTime}` : ''}
${ragDoc ? `- RAG Cautions: ${ragDoc.warnings}` : ''}

Use this context to enhance your response. The response must be a detailed, motivational, intelligent, dietician-style analysis in the exact JSON format specified below. Do not include any markdown fences or conversational preambles outside the JSON.

JSON Schema format:
{
  "foodIdentification": {
    "name": "string",
    "category": "string",
    "ingredients": ["string"],
    "portionEstimation": "string",
    "preparationStyle": "string"
  },
  "nutritionBreakdown": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "fiber": number,
    "sugar": number,
    "sodium": number,
    "vitamins": ["string"],
    "minerals": ["string"],
    "nutrientQualityScore": number,
    "healthRating": "Excellent"
  },
  "healthExplanation": "string",
  "consumptionGuidance": {
    "frequency": "Daily",
    "healthyQuantity": "string",
    "idealServingSize": "string",
    "avoidExcessWarning": "string"
  },
  "healthBenefits": {
    "immunitySupport": "string",
    "digestionBenefits": "string",
    "heartHealth": "string",
    "muscleGrowth": "string",
    "hydration": "string",
    "energyBoost": "string"
  },
  "healthRisks": {
    "highSugarWarning": "string or 'None'",
    "excessOilWarning": "string or 'None'",
    "processedFoodRisk": "string or 'None'",
    "sodiumWarning": "string or 'None'",
    "overeatingEffects": "string"
  },
  "bestTimeToEat": {
    "timing": "string",
    "explanation": "string"
  },
  "whoShouldEatThis": {
    "demographics": ["string"],
    "cautions": ["string"]
  },
  "portionEstimationDetails": {
    "servingSize": "string",
    "approxGrams": number,
    "estimatedQuantity": "string"
  },
  "aiFoodScore": {
    "healthScore": number,
    "nutritionScore": number,
    "proteinScore": number,
    "hydrationScore": number
  },
  "aiAlternatives": [
    {
      "name": "string",
      "benefit": "string",
      "method": "string"
    }
  ],
  "aiMealCombination": {
    "pairsWellWith": ["string"],
    "recommendedSides": ["string"],
    "avoidCombining": ["string"]
  },
  "hydrationAndDigestion": {
    "hydrationSupport": "High",
    "digestionSpeed": "Moderate",
    "mealStatus": "Light Meal"
  }
}`;

    const userMessage = `Please analyze "${foodName}" under the following user profile:
Goal: ${profile?.fitnessGoal || 'maintenance'}
Diet Preference: ${profile?.dietPreference || 'none'}`;

    for (let i = 0; i < modelChain.length; i++) {
      const activeModel = modelChain[i];
      console.log(`[AI Service] Generating premium dietician insights with model (${i + 1}/${modelChain.length}): ${activeModel}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://vitanova.app',
            'X-Title': 'VitaNova AI',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: activeModel,
            max_tokens: config.maxTokensChat,
            temperature: 0.3,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
          }),
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new AIError(`API error: ${response.status}`, 'API_ERROR');
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
          throw new AIError('Empty response from AI', 'EMPTY_RESPONSE');
        }

        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        detailedAnalysis = JSON.parse(cleaned);
        break;

      } catch (error) {
        clearTimeout(timeout);
        console.warn(`[AI Service] Dietician Chat model ${activeModel} failed:`, error.message);
        lastError = error;
      }
    }
  }

  // 5. Fallback to compiled offline data
  if (!detailedAnalysis) {
    console.log('[AI Service] Compiling high-fidelity offline dietician fallback details...');
    detailedAnalysis = compileOfflineDetailedAnalysis(foodName, dbNutrition, ragDoc, profile);
  }

  // 6. Cache detailed response
  await cacheNutrition(cacheKey, detailedAnalysis);

  return {
    ...visionResult,
    detailedAnalysis
  };
}

/**
 * Standard offline dietician-level breakdown compiler mapping SQLite & RAG to standard schema.
 */
export function compileOfflineDetailedAnalysis(itemName, localDbNutrition, ragDoc, profile) {
  const name = localDbNutrition?.name || itemName;
  const category = localDbNutrition?.category || 'General';
  const cals = localDbNutrition?.calories || 120;
  const protein = localDbNutrition?.protein || 2;
  const carbs = localDbNutrition?.carbs || 15;
  const fats = localDbNutrition?.fats || 1;
  const fiber = localDbNutrition?.fiber || 1;
  const hydration = localDbNutrition?.hydration || 50;
  const vitamins = localDbNutrition?.vitamins || ['Vitamin C'];
  const minerals = localDbNutrition?.minerals || ['Potassium'];

  const healthScore = Math.min(98, Math.max(25, Math.round(85 - (cals > 250 ? 15 : 0) + (fiber > 2 ? 10 : 0) + (protein > 10 ? 10 : 0))));
  const nutritionScore = Math.min(95, Math.max(30, Math.round(75 + (fiber > 1 ? 10 : 0) + (vitamins.length * 4))));
  const proteinScore = Math.min(100, Math.max(5, Math.round(protein * 5)));
  const hydrationScore = hydration;

  const sugar = Math.round(carbs * 0.15);
  const sodium = category === 'protein' ? 120 : 25;

  const alternative = localDbNutrition ? `Organic or homemade version of ${name}` : `Fresh steamed vegetables`;

  return {
    foodIdentification: {
      name,
      category,
      ingredients: localDbNutrition ? [name] : [itemName],
      portionEstimation: localDbNutrition?.recommendedQty || '1 serving',
      preparationStyle: 'Standard / Prepared raw or steamed'
    },
    nutritionBreakdown: {
      calories: cals,
      protein,
      carbs,
      fats,
      fiber,
      sugar,
      sodium,
      vitamins,
      minerals,
      nutrientQualityScore: healthScore,
      healthRating: healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : 'Moderate'
    },
    healthExplanation: localDbNutrition?.benefits || `This is ${name}, a food item which provides an array of macronutrients including ${carbs}g carbs, ${protein}g protein, and is beneficial as part of a balanced diet.`,
    consumptionGuidance: {
      frequency: healthScore > 85 ? 'Daily' : healthScore > 65 ? '2-3x/Week' : 'Occasionally',
      healthyQuantity: localDbNutrition?.recommendedQty || '1 standard portion',
      idealServingSize: localDbNutrition?.recommendedQty || '1 standard portion',
      avoidExcessWarning: 'Be mindful of portion sizes to avoid excessive calorie intake.'
    },
    healthBenefits: {
      immunitySupport: ragDoc?.benefits || 'Provides essential micronutrients that help keep your body\'s immune defense systems active.',
      digestionBenefits: fiber > 2.5 ? 'High fiber count aids regular digestion and gut microbiome health.' : 'Easy to digest and highly compatible with standard meal intervals.',
      heartHealth: fats < 3 ? 'Low saturated fat density supports healthy blood pressure and cholesterol.' : 'Contains healthy fatty acids that feed vascular linings.',
      muscleGrowth: `${protein}g of protein provides standard amino acids to support skeletal muscle repairs.`,
      hydration: `${hydration}% water volume supports cellular hydration and osmotic fluid levels.`,
      energyBoost: `${carbs}g carbohydrates provide vital direct energy to support physical actions.`
    },
    healthRisks: {
      highSugarWarning: sugar > 15 ? 'Contains moderate-to-high natural sugars.' : 'None',
      excessOilWarning: fats > 15 ? 'Contains significant lipids. Limit preparation oils.' : 'None',
      processedFoodRisk: 'None (Whole food source)',
      sodiumWarning: sodium > 300 ? 'Higher sodium levels. Season carefully.' : 'None',
      overeatingEffects: 'Eating in surplus of your daily expenditure can lead to excess body fat accumulation.'
    },
    bestTimeToEat: {
      timing: localDbNutrition?.bestTime || 'Breakfast or Mid-Day Snack',
      explanation: 'Provides optimal nutrient absorption and sustains energy levels during active hours.'
    },
    whoShouldEatThis: {
      demographics: [
        profile?.fitnessGoal === 'weight_loss' ? 'Weight Loss Seekers' : 'Healthy Lifestyles',
        protein > 10 ? 'Gym Enthusiasts' : 'General Fitness',
        'Vegans & Vegetarians'
      ],
      cautions: [
        ragDoc?.warnings || 'Always practice moderate seasoning and proper cooking sanitation.'
      ]
    },
    portionEstimationDetails: {
      servingSize: '1 portion',
      approxGrams: 100,
      estimatedQuantity: localDbNutrition?.recommendedQty || '1 serving'
    },
    aiFoodScore: {
      healthScore,
      nutritionScore,
      proteinScore,
      hydrationScore
    },
    aiAlternatives: [
      {
        name: alternative,
        benefit: 'Reduces heavy processing or excess fats',
        method: 'Prepare by air-frying or baking instead of deep-frying.'
      }
    ],
    aiMealCombination: {
      pairsWellWith: ['Leafy Greens', 'Quinoa', 'Brown Rice'],
      recommendedSides: ['Steamed broccoli', 'Cucumber slices'],
      avoidCombining: ['High-calorie sweetened beverages', 'Deep-fried appetizers']
    },
    hydrationAndDigestion: {
      hydrationSupport: hydration > 70 ? 'High' : hydration > 40 ? 'Medium' : 'Low',
      digestionSpeed: fiber > 3 ? 'Slow' : 'Moderate',
      mealStatus: cals < 150 ? 'Light Meal' : 'Heavy Meal'
    }
  };
}

/**
 * Custom AI error class.
 */
export class AIError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AIError';
    this.code = code;
  }
}
