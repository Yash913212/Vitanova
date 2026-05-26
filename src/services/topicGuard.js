/**
 * VitaNova AI — Topic Guard
 * Client-side pre-filter that blocks off-topic questions BEFORE sending to OpenRouter.
 * Saves API costs and enforces instant refusal for obviously non-nutrition queries.
 */

// Nutrition-related keywords — if query contains ANY of these, it's likely on-topic
const NUTRITION_KEYWORDS = [
  // Foods
  'food', 'eat', 'drink', 'cook', 'recipe', 'meal', 'snack', 'breakfast', 'lunch', 'dinner',
  'fruit', 'vegetable', 'grain', 'protein', 'dairy', 'nut', 'seed', 'legume', 'meat', 'fish',
  'chicken', 'egg', 'milk', 'rice', 'wheat', 'oat', 'bread', 'roti', 'dal', 'paneer', 'tofu',
  'apple', 'banana', 'mango', 'orange', 'tomato', 'carrot', 'spinach', 'broccoli', 'potato',
  'avocado', 'almond', 'walnut', 'yogurt', 'cheese', 'butter', 'oil', 'ghee', 'honey',
  'lentil', 'chickpea', 'bean', 'pea', 'corn', 'mushroom', 'onion', 'garlic', 'ginger',
  'salad', 'soup', 'juice', 'smoothie', 'tea', 'coffee', 'water',
  // Nutrients
  'calorie', 'kcal', 'protein', 'carb', 'fat', 'fiber', 'sugar', 'sodium', 'cholesterol',
  'vitamin', 'mineral', 'iron', 'calcium', 'potassium', 'zinc', 'magnesium', 'omega',
  'antioxidant', 'nutrient', 'macro', 'micro', 'amino', 'fatty acid',
  // Health/Diet
  'diet', 'nutrition', 'health', 'healthy', 'weight', 'calorie', 'bmi', 'metabolism',
  'digest', 'immunity', 'immune', 'muscle', 'energy', 'hydrat', 'detox', 'cleanse',
  'fasting', 'intermittent', 'keto', 'vegan', 'vegetarian', 'gluten', 'lactose',
  'diabetic', 'diabetes', 'cholesterol', 'blood pressure', 'heart health',
  'workout', 'exercise', 'gym', 'fitness', 'pre-workout', 'post-workout',
  'supplement', 'probiotic', 'prebiotic', 'gut', 'bloat', 'constipat',
  'serving', 'portion', 'intake', 'recommend', 'daily', 'consume', 'quantity',
  'lose weight', 'gain weight', 'build muscle', 'fat loss', 'lean', 'bulk',
  // Hindi nutrition terms
  'khana', 'pani', 'khaana', 'bhojan', 'aahar', 'poshan', 'swasth', 'sehat',
  'sabzi', 'phal', 'doodh', 'chawal', 'daal', 'atta', 'ghee',
  // Telugu nutrition terms
  'aahaaram', 'tinandi', 'neeru', 'pandu', 'kooragaayalu', 'annam',
];

// Blocked topic keywords — if query is DOMINATED by these (and has no nutrition keywords), it's off-topic
const BLOCKED_KEYWORDS = [
  // Politics
  'politics', 'minister', 'president', 'election', 'government', 'congress', 'bjp', 'parliament',
  'modi', 'trump', 'biden', 'putin', 'vote', 'political', 'democracy', 'republic',
  // Coding
  'code', 'coding', 'python', 'java', 'javascript', 'html', 'css', 'react', 'flutter',
  'programming', 'developer', 'software', 'algorithm', 'debug', 'compile', 'github',
  'api', 'database', 'server', 'frontend', 'backend', 'deploy', 'docker',
  // Hacking
  'hack', 'hacking', 'exploit', 'vulnerability', 'malware', 'phishing', 'ddos',
  'password crack', 'brute force', 'sql injection', 'bypass', 'instagram hack',
  // Religion
  'religion', 'god', 'pray', 'church', 'mosque', 'temple', 'bible', 'quran', 'hindu',
  'muslim', 'christian', 'buddhist', 'spiritual', 'soul', 'heaven', 'hell',
  // Entertainment
  'movie', 'film', 'bollywood', 'hollywood', 'actor', 'actress', 'celebrity', 'singer',
  'cricket', 'football', 'ipl', 'worldcup', 'world cup', 'match', 'score', 'team',
  'game', 'gaming', 'playstation', 'xbox', 'fortnite', 'minecraft',
  // Adult/Violence
  'sex', 'porn', 'nude', 'kill', 'murder', 'weapon', 'gun', 'bomb', 'terrorism',
  'drug', 'cocaine', 'marijuana', 'weed', 'meth',
  // General knowledge
  'capital of', 'who is the', 'who won', 'when was', 'where is', 'history of',
  'invented', 'discovered', 'planet', 'space', 'nasa', 'earth', 'moon',
  // Misc off-topic
  'joke', 'story', 'poem', 'song', 'lyrics', 'write me', 'create a', 'generate',
  'translate', 'math', 'calculate', 'equation', 'formula', 'physics', 'chemistry',
  'bitcoin', 'crypto', 'stock', 'trading', 'investment', 'money', 'salary',
  'girlfriend', 'boyfriend', 'relationship', 'love', 'marriage', 'divorce',
  'weather', 'temperature', 'forecast',
];

/**
 * Check if a user message is on-topic (nutrition/food/health related).
 * Returns { allowed: boolean, refusalMessage?: string }
 */
export function checkTopicGuard(message, language = 'en') {
  if (!message || message.trim().length === 0) {
    return { allowed: true };
  }

  const text = message.toLowerCase().trim();
  
  // Very short messages (≤3 words) — let them through (could be food names)
  const wordCount = text.split(/\s+/).length;
  if (wordCount <= 3) {
    // But check if it's a single blocked keyword
    const hasBlocked = BLOCKED_KEYWORDS.some(kw => text.includes(kw));
    const hasNutrition = NUTRITION_KEYWORDS.some(kw => text.includes(kw));
    if (hasBlocked && !hasNutrition) {
      return { allowed: false, refusalMessage: getRefusalMessage(language) };
    }
    return { allowed: true };
  }

  // Check for nutrition keywords
  const hasNutritionContext = NUTRITION_KEYWORDS.some(kw => text.includes(kw));
  
  // Check for blocked keywords
  const blockedMatches = BLOCKED_KEYWORDS.filter(kw => text.includes(kw));
  const hasBlockedContext = blockedMatches.length > 0;

  // If it has nutrition context, always allow (even if it mentions something blocked)
  // e.g. "Is coffee good for muscle gain?" mentions both food + fitness
  if (hasNutritionContext) {
    return { allowed: true };
  }

  // If it has blocked keywords and NO nutrition context — block it
  if (hasBlockedContext) {
    return { allowed: false, refusalMessage: getRefusalMessage(language) };
  }

  // For longer messages with no nutrition or blocked keywords — let AI handle it
  // The system prompt will catch anything that slips through
  return { allowed: true };
}

/**
 * Get a friendly refusal message in the user's language.
 */
function getRefusalMessage(language = 'en') {
  const messages = {
    en: "I'm VitaNova AI, your personal nutrition coach 🥗\n\nI can only help with food, nutrition, diet, and wellness topics.\n\n💡 Try asking me:\n• \"How much protein is in eggs?\"\n• \"Best foods for weight loss?\"\n• \"Can I eat banana daily?\"\n• \"Healthy breakfast ideas?\"",
    hi: "मैं VitaNova AI हूँ, आपका पोषण कोच 🥗\n\nमैं केवल भोजन, पोषण, आहार और स्वास्थ्य विषयों में सहायता कर सकता हूँ।\n\n💡 मुझसे ये पूछें:\n• \"अंडों में कितना प्रोटीन होता है?\"\n• \"वजन घटाने के लिए सबसे अच्छा भोजन?\"\n• \"क्या मैं रोज़ केला खा सकता हूँ?\"\n• \"स्वस्थ नाश्ते के विचार?\"",
    te: "నేను VitaNova AI, మీ పోషణ కోచ్ 🥗\n\nనేను ఆహారం, పోషణ, ఆహారం మరియు ఆరోగ్యం గురించి మాత్రమే సహాయం చేయగలను.\n\n💡 నన్ను ఇవి అడగండి:\n• \"గుడ్లలో ఎంత ప్రోటీన్ ఉంటుంది?\"\n• \"బరువు తగ్గడానికి ఉత్తమ ఆహారాలు?\"\n• \"రోజూ అరటిపండు తినవచ్చా?\"\n• \"ఆరోగ్యకరమైన అల్పాహార ఆలోచనలు?\"",
  };
  return messages[language] || messages.en;
}
