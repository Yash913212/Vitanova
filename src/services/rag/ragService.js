/**
 * NutriVision AI — RAG Service Orchestrator
 * Seamlessly manages indexing, retrieval, prompt assembly, and online/offline workflows.
 */

import { initializeVectorStore, getDocumentById } from './vectorStore';
import { retrieveKnowledge } from './retriever';
import { buildRAGSystemPrompt } from './promptBuilder';
import { chatWithAI } from '../aiService';

// We initialize vector store dynamically inside retrieveKnowledge

/**
 * Orchestrates the full Retrieval-Augmented Generation query cycle.
 * Handles online AI request compilation and offline template fallbacks.
 * 
 * @param {string} query - The user query
 * @param {Object} context - { profile, language, chatHistory, scannedFood }
 * @param {boolean} isOnline - Network availability state
 * @returns {Promise<Object>} { response: string, retrievedDocs: Array }
 */
export async function generateRAGResponse(query, context = {}, isOnline = true) {
  const language = context.language || 'en';
  const profile = context.profile || {};
  const chatHistory = context.chatHistory || [];
  const scannedFood = context.scannedFood || null;

  // 1. Run Retriever to get RAG Context
  const retrievedDocs = await retrieveKnowledge(query, {
    language,
    topK: 2,
    scannedFood
  });

  // 2. Handle Online Mode (OpenRouter LLM + RAG Prompt Context)
  if (isOnline) {
    try {
      const systemPrompt = buildRAGSystemPrompt(retrievedDocs, {
        language,
        profile,
        scannedFood
      });

      // Prepare conversation history for the AI API
      const apiMessages = [
        ...chatHistory.slice(-6), // Send the last 6 messages to stay within prompt tokens
        { role: 'user', content: query }
      ];

      const aiResponse = await chatWithAI(apiMessages, systemPrompt);
      
      return {
        response: aiResponse,
        retrievedDocs,
        source: 'online_rag'
      };
    } catch (apiError) {
      console.warn('[RAG Service] Online generation failed, falling back to local offline RAG rules:', apiError);
      // Fall through to offline handling
    }
  }

  // 3. Handle Offline Mode (Fully Local, Multilingual Rule-Based RAG Compiler)
  const offlineResponse = compileOfflineResponse(retrievedDocs, {
    query,
    language,
    profile
  });

  return {
    response: `📡 (Offline Mode)\n\n${offlineResponse}`,
    retrievedDocs,
    source: 'offline_rag'
  };
}

/**
 * Formulate a conversational and highly personalized offline nutrition response locally.
 */
function compileOfflineResponse(retrievedDocs, context) {
  const language = context.language || 'en';
  const profile = context.profile || {};
  const goal = profile.fitnessGoal || 'maintenance';

  if (!retrievedDocs || retrievedDocs.length === 0) {
    if (language === 'hi') {
      return 'मुझे ऑफ़लाइन स्वास्थ्य डेटाबेस में कोई सीधा मिलान नहीं मिला। सामान्य तौर पर, स्वस्थ रहने के लिए अधिक फाइबर वाली हरी सब्जियों, दालों जैसे प्रोटीन स्रोतों और पर्याप्त पानी पीने पर ध्यान दें! ऑनलाइन होने पर मैं आपको विस्तृत विश्लेषण दे सकूँगा।';
    } else if (language === 'te') {
      return 'నా ఆఫ్ లైన్ డేటాబేస్ లో దీనికి సంబంధించిన సమాచారం లభించలేదు. సాధారణంగా ఆరోగ్యంగా ఉండటానికి పీచు ఎక్కువగా ఉండే ఆకుకూరలు, పప్పుధాన్యాల వంటి ప్రోటీన్లు మరియు తగినంత నీరు తాగడం మంచిది! ఆన్ లైన్ లోకి వచ్చినప్పుడు పూర్తి సమాచారం ఇవ్వగలను.';
    } else {
      return "I couldn't find a direct match in my local offline health database. Generally, prioritize nutrient-dense vegetables, clean protein sources (like lentils or eggs), and drink plenty of water! Once you are back online, I can run a deeper analysis.";
    }
  }

  // Compile the top matching article
  const topDoc = retrievedDocs[0];
  let response = '';

  if (language === 'hi') {
    response += `स्थानीय डेटाबेस के अनुसार: **${topDoc.title}** (${topDoc.category}) पोषण के लिए बेहतरीन है।\n`;
    if (topDoc.benefits) response += `• **लाभ**: ${topDoc.benefits}\n`;
    if (topDoc.recommendedIntake) response += `• **अनुशंसित मात्रा**: ${topDoc.recommendedIntake}\n`;
    if (topDoc.bestTime) response += `• **सही समय**: ${topDoc.bestTime}\n`;
    if (topDoc.warnings) response += `⚠️ **चेतावनी**: ${topDoc.warnings}\n`;
  } else if (language === 'te') {
    response += `స్థానిక డేటాబేస్ ప్రకారం: **${topDoc.title}** (${topDoc.category}) పోషణకు చాలా మంచిది.\n`;
    if (topDoc.benefits) response += `• **ప్రయోజనాలు**: ${topDoc.benefits}\n`;
    if (topDoc.recommendedIntake) response += `• **తీసుకోవలసిన పరిమాణం**: ${topDoc.recommendedIntake}\n`;
    if (topDoc.bestTime) response += `• **సరైన సమయం**: ${topDoc.bestTime}\n`;
    if (topDoc.warnings) response += `⚠️ **హెచ్చరిక**: ${topDoc.warnings}\n`;
  } else {
    response += `According to the local database: **${topDoc.title}** (${topDoc.category}) is highly nutritious.\n`;
    if (topDoc.benefits) response += `• **Benefits**: ${topDoc.benefits}\n`;
    if (topDoc.recommendedIntake) response += `• **Recommended Intake**: ${topDoc.recommendedIntake}\n`;
    if (topDoc.bestTime) response += `• **Best Consumption Time**: ${topDoc.bestTime}\n`;
    if (topDoc.warnings) response += `⚠️ **Warnings**: ${topDoc.warnings}\n`;
  }

  // Apply goal-based personalized tip in offline mode
  let goalTip = '';
  if (goal === 'fat_loss') {
    if (language === 'hi') goalTip = '\n💡 **फैट लॉस टिप**: यह भोजन आपके फैट लॉस गोल में फिट बैठता है। हालांकि, कैलोरी घाटा (deficit) बनाए रखने के लिए मात्रा नियंत्रण पर विशेष ध्यान दें।';
    else if (language === 'te') goalTip = '\n💡 **ఫ్యాట్ లాస్ చిట్కా**: ఈ ఆహారం మీ కొవ్వు నియంత్రణకు సరిపోతుంది. అయితే కేలరీలను అదుపులో ఉంచడానికి మోతాదుపై శ్రద్ధ పెట్టండి.';
    else goalTip = '\n💡 **Fat Loss Tip**: This can fit your goal. However, portion control is critical to maintain a mild calorie deficit.';
  } else if (goal === 'muscle_gain') {
    if (language === 'hi') goalTip = '\n💡 **मसल गेन टिप**: कंडल निर्माण और वर्कआउट रिकवरी के लिए इसे समय पर लें। पर्याप्त प्रोटीन से समृद्ध भोजन के साथ इसका सेवन करें।';
    else if (language === 'te') goalTip = '\n💡 **మజిల్ గెయిన్ చిట్కా**: కండరాల రికవరీ కోసం చాలా మంచిది! తగినంత ప్రోటీన్ ఉన్న ఆహారంతో దీనిని జత చేయండి.';
    else goalTip = '\n💡 **Muscle Gain Tip**: Excellent to fuel muscle recovery! Be sure to pair this with an adequate, protein-rich diet.';
  }

  response += goalTip;

  // Add related foods if any
  if (topDoc.relatedFoods && topDoc.relatedFoods.length > 0) {
    const relatedList = topDoc.relatedFoods.map(rf => rf.title).join(', ');
    if (language === 'hi') {
      response += `\n\n🔍 **संबंधित विकल्प**: ${relatedList}`;
    } else if (language === 'te') {
      response += `\n\n🔍 **సంబంధిత ఆహారాలు**: ${relatedList}`;
    } else {
      response += `\n\n🔍 **Related Options**: ${relatedList}`;
    }
  }

  return response;
}
