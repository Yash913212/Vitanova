/**
 * NutriVision AI — RAG Embedding & Tokenizer Engine
 * Pure JS lightweight vector space model supporting English, Hindi, and Telugu.
 */

// Common English stopwords to ignore in text search
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cant', 'cannot', 'could', 'couldnt',
  'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during',
  'each',
  'few', 'for', 'from', 'further',
  'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows',
  'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself',
  'lets',
  'me', 'more', 'most', 'mustnt', 'my', 'myself',
  'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
  'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt',
  'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves',
  // Hindi transliterated helper stopwords
  'hai', 'ke', 'ka', 'ki', 'ko', 'se', 'me', 'par', 'bhi', 'aur', 'ya', 'tha', 'thi', 'the', 'jo', 'kar', 'kya',
  // Telugu transliterated helper stopwords
  'lo', 'ki', 'nu', 'tho', 'mariyu', 'leka', 'kuda', 'gurinchi'
]);

/**
 * Tokenize a text string into an array of normalized terms.
 * Supports English alphanumeric and Hindi (\u0900-\u097F) / Telugu (\u0C00-\u0C7F) scripts.
 * @param {string} text 
 * @returns {Array<string>}
 */
export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  
  return text
    .toLowerCase()
    // Replace punctuation but preserve English characters, numbers, Hindi unicode, and Telugu unicode
    .replace(/[^\w\s\u0900-\u097F\u0C00-\u0C7F]/gu, ' ')
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Compute the term frequencies (TF) of tokens in a document.
 * @param {Array<string>} tokens 
 * @returns {Object} { token: frequency }
 */
export function computeTF(tokens) {
  const tf = {};
  if (!tokens || tokens.length === 0) return tf;

  const total = tokens.length;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // Normalize frequency
  for (const token in tf) {
    tf[token] = tf[token] / total;
  }

  return tf;
}

/**
 * Compute Cosine Similarity between two numeric vectors.
 * @param {Object} vecA - { index: weight } or Array
 * @param {Object} vecB - { index: weight } or Array
 * @returns {number} similarity score between 0 and 1
 */
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  // Handle dense arrays
  if (Array.isArray(vecA) && Array.isArray(vecB)) {
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }
  } else {
    // Handle sparse object vectors { token: weight }
    const keysA = Object.keys(vecA);
    const keysB = Object.keys(vecB);
    const uniqueKeys = new Set([...keysA, ...keysB]);

    for (const key of uniqueKeys) {
      const valA = vecA[key] || 0;
      const valB = vecB[key] || 0;
      dotProduct += valA * valB;
      magnitudeA += valA * valA;
      magnitudeB += valB * valB;
    }
  }

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

/**
 * Generate a sparse TF-IDF vector representing a piece of text.
 * @param {string} text 
 * @param {Object} idfModel - { token: idfWeight }
 * @returns {Object} sparse vector representation { token: tfIdfWeight }
 */
export function createEmbeddingVector(text, idfModel) {
  const tokens = tokenize(text);
  const tf = computeTF(tokens);
  const vector = {};

  for (const token in tf) {
    if (idfModel[token]) {
      vector[token] = tf[token] * idfModel[token];
    }
  }

  return vector;
}
