/**
 * NutriVision AI — RAG Prompt Builder
 * Assembles system prompts, user profiles, retrieved context, and multi-language instructions.
 */

/**
 * Construct an optimized system prompt based on retrieved facts and user context.
 * 
 * @param {Array<Object>} retrievedDocs - List of localized retrieved documents
 * @param {Object} context - { language, profile, scannedFood }
 * @returns {string} Fully compiled system prompt
 */
export function buildRAGSystemPrompt(retrievedDocs, context = {}) {
  const language = context.language || 'en';
  const profile = context.profile || {};
  const scannedFood = context.scannedFood || null;

  let prompt = `You are NutriVision AI, a friendly, professional, and certified nutrition and health assistant. 
Your goal is to provide accurate, personalized, and conversational health guidance.

=== GENERAL RESPONSE STYLE ===
- Keep responses concise (2-3 sentences, maximum 60 words).
- Make the tone warm, conversational, and highly voice-friendly.
- Focus strictly on nutrition, fitness, health, and foods.
- Do not repeat raw database structures or sound robotic. Incorporate the information naturally.
`;

  // 1. Inject Multilingual Output Instruction
  if (language === 'hi') {
    prompt += `\n=== LANGUAGE CONSTRAINT ===
- IMPORTANT: You MUST respond in Hindi language using clean, natural Devanagari script.
- Keep the language conversational, like a friendly dietitian talking to a client in Hindi.
- Keep English food terms in parentheses where helpful (e.g., "केला (Banana) में पोटेशियम होता है...").
`;
  } else if (language === 'te') {
    prompt += `\n=== LANGUAGE CONSTRAINT ===
- IMPORTANT: You MUST respond in Telugu language using clear, natural Telugu script.
- Keep the language conversational and simple, like a local dietitian talking in Telugu.
- Use English food terms in parentheses where helpful (e.g., "అరటిపండు (Banana) లో పొటాషియం ఉంటుంది...").
`;
  } else {
    prompt += `\n=== LANGUAGE CONSTRAINT ===
- Respond in clear, engaging, and grammatically correct English.
`;
  }

  // 2. Inject Retrieved RAG Context
  if (retrievedDocs && retrievedDocs.length > 0) {
    prompt += `\n=== TRUSTED KNOWLEDGE CONTEXT (RAG SOURCE VERIFIED) ===
Use the following verified local nutrition database information to answer the query accurately. Do not invent contradictory nutrition facts.
`;
    for (const doc of retrievedDocs) {
      prompt += `
- Food/Topic: ${doc.title} (Category: ${doc.category})
  * Benefits: ${doc.benefits}
  * Recommended Qty/Intake: ${doc.recommendedIntake}
  * Ideal Timing: ${doc.bestTime}
  * Warnings/Cautions: ${doc.warnings}`;

      if (doc.nutritionFacts) {
        const facts = doc.nutritionFacts;
        prompt += `\n  * Nutrition per 100g: Calories: ${facts.calories} kcal, Protein: ${facts.protein || 'N/A'}, Carbs: ${facts.carbs || 'N/A'}, Fats: ${facts.fats || 'N/A'}, Fiber: ${facts.fiber || 'N/A'}`;
        if (facts.potassium) prompt += `, Potassium: ${facts.potassium}`;
        if (facts.vitaminC) prompt += `, Vitamin C: ${facts.vitaminC}`;
        if (facts.iron) prompt += `, Iron: ${facts.iron}`;
      }

      if (doc.relatedFoods && doc.relatedFoods.length > 0) {
        const relatedStr = doc.relatedFoods.map(rf => `${rf.title} (${rf.category})`).join(', ');
        prompt += `\n  * Related foods you can suggest: ${relatedStr}`;
      }
      prompt += `\n`;
    }
  } else {
    prompt += `\n=== NO LOCAL MATCH FOUND ===
Provide general healthy eating advice related to the user's question. Clearly state healthy options and guide them.
`;
  }

  // 3. Inject User Profile & Customization Rules
  if (profile && Object.keys(profile).length > 0) {
    prompt += `\n=== USER HEALTH PROFILE AND TARGETING RULES ===\n`;
    
    // Physical stats
    if (profile.age) prompt += `- User's age: ${profile.age} years old\n`;
    if (profile.weight) prompt += `- User's weight: ${profile.weight} kg\n`;

    // Fitness Goal adaptation rules
    const goal = profile.fitnessGoal || 'maintenance';
    if (goal === 'fat_loss') {
      prompt += `- GOAL: FAT LOSS. 
  * Recommend lower calorie portions.
  * Emphasize calorie control and higher dietary fiber to promote satiety.
  * If a food is calorie-dense (e.g. nuts, grains), gently warn them about portions.\n`;
    } else if (goal === 'muscle_gain') {
      prompt += `- GOAL: MUSCLE GAIN. 
  * Prioritize protein content and protein synthesis.
  * Mention workout meal timing (e.g. post-workout protein + fast carbs for recovery).\n`;
    } else if (goal === 'weight_gain') {
      prompt += `- GOAL: WEIGHT GAIN. 
  * Recommend combining low-calorie foods with healthy fats (like avocados or nut butter) to increase calorie density safely.\n`;
    } else {
      prompt += `- GOAL: MAINTENANCE. Recommend balanced portions of proteins, healthy fats, and complex carbohydrates.\n`;
    }

    // Diet Preference compliance rules
    const diet = profile.dietPreference || 'no_preference';
    if (diet === 'vegetarian') {
      prompt += `- DIET PREFERENCE: VEGETARIAN. 
  * Under NO circumstances should you recommend meat, poultry, or fish.
  * If the user asks about animal meat, explain that it conflicts with their diet, and immediately suggest high-protein vegetarian alternatives (e.g., paneer, lentils, tofu).\n`;
    } else if (diet === 'vegan') {
      prompt += `- DIET PREFERENCE: VEGAN. 
  * Under NO circumstances should you recommend meat, poultry, fish, eggs, dairy, paneer, honey, or milk.
  * If they ask about animal products, suggest plant-based vegan alternatives (e.g., tofu, oats, almonds, lentils).\n`;
    } else if (diet === 'keto') {
      prompt += `- DIET PREFERENCE: KETO. Recommend high-fat, moderate-protein, and extremely low-carbohydrate choices. Warn against high-carb grains or high-sugar fruits.\n`;
    }
  }

  // 4. Inject Recently Scanned Foods Memory
  if (scannedFood) {
    prompt += `\n=== SCAN CONTEXT MEMORY ===
- The user is currently scanning/viewing details for: "${scannedFood}".
- Focus your nutrition answers or comparisons around this food item, and remember it as the active food in discussion.
`;
  }

  prompt += `\n=== GENERATION SAFEGUARDS ===
- Keep advice nutrition-oriented and health-focused.
- If asked about serious medical conditions, provide helpful nutrition guidelines, but add a brief warning to consult a doctor.
- Answer user's question directly and concisely.`;

  return prompt;
}
