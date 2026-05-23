/**
 * NutriVision AI — Nutrition Lookup Service
 */
import NUTRITION_DB from '../data/nutritionDB';
import { fuzzyMatch } from '../utils/helpers';

/**
 * Look up nutrition data for a food item by name.
 * Uses fuzzy matching to find the best match.
 */
export function lookupNutrition(itemName) {
  if (!itemName) return null;

  const query = itemName.toLowerCase().trim();

  // Direct key match
  const directKey = query.replace(/\s+/g, '_');
  if (NUTRITION_DB[directKey]) {
    return { ...NUTRITION_DB[directKey], matchScore: 1 };
  }

  // Fuzzy search across all entries
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, data] of Object.entries(NUTRITION_DB)) {
    const nameScore = fuzzyMatch(query, data.name);
    const keyScore = fuzzyMatch(query, key);
    const score = Math.max(nameScore, keyScore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { ...data, matchScore: score };
    }
  }

  // Only return if match is reasonable
  return bestScore >= 0.3 ? bestMatch : null;
}

/**
 * Get all food items in the database.
 */
export function getAllFoods() {
  return Object.values(NUTRITION_DB);
}

/**
 * Search foods by query.
 */
export function searchFoods(query) {
  if (!query) return getAllFoods();

  return Object.values(NUTRITION_DB)
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
