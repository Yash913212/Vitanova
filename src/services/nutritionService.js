/**
 * NutriVision AI — Nutrition Lookup Service (SQLite Powered)
 */
import { getFoodById, getAllFoods as sqliteGetAllFoods } from '../database/queries/foods.js';
import { fuzzyMatch } from '../utils/helpers';

/**
 * Look up nutrition data for a food item by name.
 * Uses SQLite records and applies fuzzy matching.
 * @param {string} itemName - Scanned or queried name
 * @param {string} lang - Preferred language ('en', 'hi', 'te')
 */
export async function lookupNutrition(itemName, lang = 'en') {
  if (!itemName) return null;

  const query = itemName.toLowerCase().trim();

  // 1. Direct key match (replace spaces with underscores to check standard ID formats)
  const directKey = query.replace(/\s+/g, '_');
  const exactDoc = await getFoodById(directKey, lang);
  if (exactDoc) {
    return { ...exactDoc, matchScore: 1 };
  }

  // 2. Fuzzy search across all SQLite food records
  const allFoods = await sqliteGetAllFoods(lang);
  let bestMatch = null;
  let bestScore = 0;

  for (const food of allFoods) {
    const nameScore = fuzzyMatch(query, food.name);
    const idScore = fuzzyMatch(query, food.id);
    const score = Math.max(nameScore, idScore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { ...food, matchScore: score };
    }
  }

  // Return if similarity matches our threshold
  return bestScore >= 0.3 ? bestMatch : null;
}

/**
 * Get all food items in the active database language.
 * @param {string} lang
 */
export async function getAllFoods(lang = 'en') {
  return sqliteGetAllFoods(lang);
}

/**
 * Search foods by query over SQLite records.
 * @param {string} query
 * @param {string} lang
 */
export async function searchFoods(query, lang = 'en') {
  const allFoods = await sqliteGetAllFoods(lang);
  if (!query) return allFoods;

  return allFoods
    .map((food) => ({
      ...food,
      matchScore: Math.max(
        fuzzyMatch(query, food.name),
        fuzzyMatch(query, food.category)
      ),
    }))
    .filter((f) => f.matchScore > 0.2)
    .sort((a, b) => b.matchScore - a.matchScore);
}
