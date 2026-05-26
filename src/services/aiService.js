/**
 * VitaNova AI — OpenRouter AI Service
 * Modular adapter for vision + conversational AI with robust caching, fallbacks, and offline support.
 */
import { getAIConfig, isAPIConfigured } from '../utils/config';
import { getCachedNutrition, cacheNutrition, searchOfflineFood } from './sqlite/database';

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
 * Custom AI error class.
 */
export class AIError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AIError';
    this.code = code;
  }
}
