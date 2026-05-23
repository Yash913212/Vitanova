/**
 * NutriVision AI — RAG Vector Store
 * Memory-resident vector store and similarity index for nutrition intelligence.
 */

import { KNOWLEDGE_BASE } from './knowledgeBase.js';
import { tokenize, computeTF, cosineSimilarity, createEmbeddingVector } from './embeddings.js';

// Internal memory-resident index state
const documentIndex = [];
const idfModel = {};
let masterVocabulary = new Set();
let isInitialized = false;

/**
 * Extract all search text from a multilingual knowledge item.
 * Combines all language variants (EN, HI, TE) to make cross-lingual searches work seamlessly.
 */
function extractSearchText(item) {
  const parts = [
    item.id,
    item.category
  ];

  if (item.title) {
    if (item.title.en) parts.push(item.title.en);
    if (item.title.hi) parts.push(item.title.hi);
    if (item.title.te) parts.push(item.title.te);
  }

  if (item.benefits) {
    if (item.benefits.en) parts.push(item.benefits.en);
    if (item.benefits.hi) parts.push(item.benefits.hi);
    if (item.benefits.te) parts.push(item.benefits.te);
  }

  if (item.recommendedIntake) {
    if (item.recommendedIntake.en) parts.push(item.recommendedIntake.en);
    if (item.recommendedIntake.hi) parts.push(item.recommendedIntake.hi);
    if (item.recommendedIntake.te) parts.push(item.recommendedIntake.te);
  }

  if (item.bestTime) {
    if (item.bestTime.en) parts.push(item.bestTime.en);
    if (item.bestTime.hi) parts.push(item.bestTime.hi);
    if (item.bestTime.te) parts.push(item.bestTime.te);
  }

  if (item.warnings) {
    if (item.warnings.en) parts.push(item.warnings.en);
    if (item.warnings.hi) parts.push(item.warnings.hi);
    if (item.warnings.te) parts.push(item.warnings.te);
  }

  return parts.join(' ');
}

/**
 * Initialize and build the TF-IDF vector store index.
 * Only runs once and is lightning-fast.
 */
export function initializeVectorStore() {
  if (isInitialized) return;

  const totalDocs = KNOWLEDGE_BASE.length;
  const docFrequency = {};

  // Phase 1: Tokenize all documents and record term counts
  const tempDocs = KNOWLEDGE_BASE.map(item => {
    const textContent = extractSearchText(item);
    const tokens = tokenize(textContent);
    const tf = computeTF(tokens);
    const uniqueTokens = new Set(tokens);

    // Track corpus-wide frequencies
    for (const token of uniqueTokens) {
      docFrequency[token] = (docFrequency[token] || 0) + 1;
      masterVocabulary.add(token);
    }

    return {
      item,
      tf,
      tokens
    };
  });

  // Phase 2: Compute Inverse Document Frequency (IDF) for all words in vocabulary
  // We use smooth IDF: ln(1 + totalDocs / (1 + docFreq))
  for (const token of masterVocabulary) {
    const freq = docFrequency[token] || 0;
    idfModel[token] = Math.log(1 + (totalDocs / (1 + freq)));
  }

  // Phase 3: Create TF-IDF vectors for all documents
  for (const doc of tempDocs) {
    const vector = {};
    for (const token in doc.tf) {
      vector[token] = doc.tf[token] * idfModel[token];
    }
    
    documentIndex.push({
      item: doc.item,
      vector: vector
    });
  }

  isInitialized = true;
  console.log(`[RAG VectorStore] Initialized successfully. Indexed ${totalDocs} articles with ${masterVocabulary.size} unique terms.`);
}

/**
 * Perform a vector similarity search on the local knowledge base.
 * @param {string} query - user question or query
 * @param {number} topK - max results to return
 * @returns {Array<Object>} list of { item, score } sorted by score descending
 */
export function similaritySearch(query, topK = 3) {
  // Ensure initialized
  if (!isInitialized) {
    initializeVectorStore();
  }

  if (!query || query.trim() === '') return [];

  // Generate query vector
  const queryVector = createEmbeddingVector(query, idfModel);

  // Compute similarities
  const results = documentIndex
    .map(doc => {
      const score = cosineSimilarity(queryVector, doc.vector);
      return {
        item: doc.item,
        score: score
      };
    })
    // Keep only actual matches (score > 0)
    .filter(res => res.score > 0.02)
    // Sort descending by score
    .sort((a, b) => b.score - a.score)
    // Limit to top K
    .slice(0, topK);

  return results;
}

/**
 * Retrieve a specific document by its ID.
 * @param {string} id 
 * @returns {Object|null}
 */
export function getDocumentById(id) {
  return KNOWLEDGE_BASE.find(item => item.id === id) || null;
}
