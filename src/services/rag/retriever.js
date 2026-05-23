/**
 * NutriVision AI — RAG Retriever
 * Fetches relevant knowledge base articles, applies localizations, and expands relations.
 */

import { similaritySearch, getDocumentById } from './vectorStore.js';
import { KNOWLEDGE_BASE } from './knowledgeBase.js';
import { tokenize } from './embeddings.js';

/**
 * Perform RAG retrieval with dual matching (exact direct match + semantic search).
 * 
 * @param {string} query - user's text query
 * @param {Object} options - { language: 'en'|'hi'|'te', category: string, topK: number }
 * @returns {Array<Object>} localized matching documents with scores and expanded related items.
 */
export function retrieveKnowledge(query, options = {}) {
  const language = options.language || 'en';
  const topK = options.topK || 3;
  const category = options.category || null;

  if (!query || query.trim() === '') return [];

  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = tokenize(normalizedQuery);

  let matches = [];

  // 1. Direct Keyword Matching (Highest Priority)
  // Check if any keyword in the query is an exact ID match or appears in a title
  for (const item of KNOWLEDGE_BASE) {
    let isDirectMatch = false;

    // Check ID match
    if (normalizedQuery.includes(item.id.replace('_', ' '))) {
      isDirectMatch = true;
    }

    // Check multilingual title matches
    if (!isDirectMatch && item.title) {
      for (const lang in item.title) {
        const titleVal = item.title[lang].toLowerCase();
        if (normalizedQuery.includes(titleVal) || titleVal.includes(normalizedQuery)) {
          isDirectMatch = true;
          break;
        }
      }
    }

    if (isDirectMatch) {
      matches.push({
        item,
        score: 1.0 // Maximum priority score for direct match
      });
    }
  }

  // 2. TF-IDF Semantic Cosine Similarity Search
  const semanticMatches = similaritySearch(normalizedQuery, topK + 2);
  
  // Combine lists, avoiding duplicates
  for (const semMatch of semanticMatches) {
    const exists = matches.some(m => m.item.id === semMatch.item.id);
    if (!exists) {
      matches.push(semMatch);
    }
  }

  // 3. Category Filter
  if (category) {
    matches = matches.filter(m => m.item.category === category);
  }

  // Sort by score descending and take topK
  matches = matches.sort((a, b) => b.score - a.score).slice(0, topK);

  // 4. Localize and Expand Documents
  return matches.map(match => {
    const doc = match.item;
    
    // Resolve localized strings (fallback to English if requested language isn't found)
    const localizedTitle = doc.title?.[language] || doc.title?.en || doc.id;
    const localizedBenefits = doc.benefits?.[language] || doc.benefits?.en || '';
    const localizedRecommendedIntake = doc.recommendedIntake?.[language] || doc.recommendedIntake?.en || '';
    const localizedBestTime = doc.bestTime?.[language] || doc.bestTime?.en || '';
    const localizedWarnings = doc.warnings?.[language] || doc.warnings?.en || '';

    // Expand related foods to simple title and id pairs for UI rendering
    const expandedRelated = (doc.relatedFoods || [])
      .map(refId => {
        const refDoc = getDocumentById(refId);
        if (!refDoc) return null;
        return {
          id: refDoc.id,
          title: refDoc.title?.[language] || refDoc.title?.en || refDoc.id,
          category: refDoc.category
        };
      })
      .filter(Boolean);

    return {
      id: doc.id,
      category: doc.category,
      title: localizedTitle,
      nutritionFacts: doc.nutritionFacts || null,
      benefits: localizedBenefits,
      recommendedIntake: localizedRecommendedIntake,
      bestTime: localizedBestTime,
      warnings: localizedWarnings,
      relatedFoods: expandedRelated,
      score: match.score,
      raw: doc // Preserve raw multilingual object if needed
    };
  });
}
