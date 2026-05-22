/**
 * NutriVision AI — RAG Vector Store (SQLite Powered)
 * Memory-resident vector store and similarity index loaded dynamically from SQLite.
 */

import { getAll } from '../../database/sqlite.js';
import { tokenize, computeTF, cosineSimilarity, createEmbeddingVector } from './embeddings.js';

// Internal memory-resident index state
const documentIndex = [];
const idfModel = {};
let masterVocabulary = new Set();
let isInitialized = false;

// Reconstructed memory cache of the multilingual items
let cachedKnowledgeBase = [];

/**
 * Extract all search text from a multilingual knowledge item.
 * Combines all language variants (EN, HI, TE) to make cross-lingual searches work.
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
 * Initialize and build the TF-IDF vector store index from SQLite records.
 * Only runs once and caches in memory for super-fast lookups.
 */
export async function initializeVectorStore() {
  if (isInitialized) return;

  try {
    console.log('[RAG VectorStore] Loading articles from SQLite database...');
    const rows = await getAll('SELECT * FROM foods;');
    
    if (!rows || rows.length === 0) {
      console.warn('[RAG VectorStore] Database foods table is empty. Seeding is required.');
      return;
    }

    // Group rows by id to reconstruct multilingual articles
    const docsMap = {};
    for (const row of rows) {
      if (!docsMap[row.id]) {
        let vitaminsArr = [];
        let mineralsArr = [];
        try {
          vitaminsArr = JSON.parse(row.vitamins || '[]');
          mineralsArr = JSON.parse(row.minerals || '[]');
        } catch {
          // Fallback if parsing fails
        }

        docsMap[row.id] = {
          id: row.id,
          category: row.category,
          nutritionFacts: {
            calories: row.calories,
            protein: `${row.protein}g`,
            carbs: `${row.carbs}g`,
            fats: `${row.fats}g`,
            fiber: `${row.fiber}g`,
            vitamins: vitaminsArr,
            minerals: mineralsArr,
            hydration: `${row.hydration}%`
          },
          title: {},
          benefits: {},
          recommendedIntake: {},
          bestTime: {},
          warnings: {},
          relatedFoods: []
        };
      }
      const lang = row.language_code;
      docsMap[row.id].title[lang] = row.name;
      docsMap[row.id].benefits[lang] = row.benefits;
      docsMap[row.id].recommendedIntake[lang] = row.recommended_quantity;
      docsMap[row.id].bestTime[lang] = row.best_time;
      docsMap[row.id].warnings[lang] = row.warnings;
    }

    cachedKnowledgeBase = Object.values(docsMap);

    // Build smart category-based relationships dynamically
    for (const doc of cachedKnowledgeBase) {
      doc.relatedFoods = cachedKnowledgeBase
        .filter(d => d.category === doc.category && d.id !== doc.id)
        .map(d => d.id)
        .slice(0, 4);
    }

    const totalDocs = cachedKnowledgeBase.length;
    const docFrequency = {};

    // Phase 1: Tokenize all documents and record term counts
    const tempDocs = cachedKnowledgeBase.map(item => {
      const textContent = extractSearchText(item);
      const tokens = tokenize(textContent);
      const tf = computeTF(tokens);
      const uniqueTokens = new Set(tokens);

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

    // Phase 2: Compute Inverse Document Frequency (IDF)
    for (const token of masterVocabulary) {
      const freq = docFrequency[token] || 0;
      idfModel[token] = Math.log(1 + (totalDocs / (1 + freq)));
    }

    // Phase 3: Create TF-IDF vectors
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
    console.log(`[RAG VectorStore] Dynamic initialization complete. Indexed ${totalDocs} articles from SQLite with ${masterVocabulary.size} terms.`);
  } catch (error) {
    console.error('[RAG VectorStore] Error initializing dynamic vector store:', error);
  }
}

/**
 * Perform a vector similarity search on the local knowledge base.
 * @param {string} query - user question or query
 * @param {number} topK - max results to return
 * @returns {Array<Object>} list of { item, score } sorted by score descending
 */
export function similaritySearch(query, topK = 3) {
  if (!isInitialized) {
    console.warn('[RAG VectorStore] Search attempted before initialization completed.');
    return [];
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
    .filter(res => res.score > 0.02)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
}

/**
 * Retrieve a specific document by its ID.
 * @param {string} id 
 * @returns {Object|null}
 */
export function getDocumentById(id) {
  return cachedKnowledgeBase.find(item => item.id === id) || null;
}

/**
 * Retrieve the entire memory-resident multilingual corpus.
 * @returns {Array<Object>}
 */
export function getCorpus() {
  return cachedKnowledgeBase;
}

/**
 * Wipe dynamic cache (used during migrations/testing)
 */
export function clearVectorStoreCache() {
  documentIndex.length = 0;
  masterVocabulary.clear();
  cachedKnowledgeBase = [];
  isInitialized = false;
}
