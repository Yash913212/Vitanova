/**
 * NutriVision AI — Foods SQLite Queries
 * Handles multilingual food lookups, categories, and keyword searches.
 */

import { getFirst, getAll } from '../sqlite.js';

/**
 * Fetch a single food item by ID and language.
 * @param {string} id - The unique food ID (e.g. 'banana')
 * @param {string} lang - Language code ('en', 'hi', 'te')
 * @returns {Promise<object|null>} The food row or null
 */
export async function getFoodById(id, lang = 'en') {
  try {
    const row = await getFirst(
      'SELECT * FROM foods WHERE id = ? AND language_code = ?;',
      [id, lang]
    );
    if (row && typeof row.vitamins === 'string') {
      row.vitamins = JSON.parse(row.vitamins);
      row.minerals = JSON.parse(row.minerals);
    }
    return row || null;
  } catch (error) {
    console.error(`[SQLite] Error fetching food ${id}:`, error);
    return null;
  }
}

/**
 * Keyword search for foods by name.
 * @param {string} queryText - User's search text
 * @param {string} lang - Language code
 * @returns {Promise<Array>} List of matching food items
 */
export async function searchFoodsByName(queryText, lang = 'en') {
  try {
    const wildcard = `%${queryText}%`;
    const rows = await getAll(
      'SELECT * FROM foods WHERE name LIKE ? AND language_code = ? LIMIT 10;',
      [wildcard, lang]
    );
    return rows.map(row => {
      if (typeof row.vitamins === 'string') {
        row.vitamins = JSON.parse(row.vitamins);
        row.minerals = JSON.parse(row.minerals);
      }
      return row;
    });
  } catch (error) {
    console.error('[SQLite] Error searching foods:', error);
    return [];
  }
}

/**
 * Fetch all food items for a specific language.
 * @param {string} lang - Language code
 * @returns {Promise<Array>} List of all foods
 */
export async function getAllFoods(lang = 'en') {
  try {
    const rows = await getAll(
      'SELECT * FROM foods WHERE language_code = ?;',
      [lang]
    );
    return rows.map(row => {
      if (typeof row.vitamins === 'string') {
        row.vitamins = JSON.parse(row.vitamins);
        row.minerals = JSON.parse(row.minerals);
      }
      return row;
    });
  } catch (error) {
    console.error('[SQLite] Error fetching all foods:', error);
    return [];
  }
}

/**
 * Fetch foods in a specific category.
 * @param {string} category - Category name (e.g., 'fruits', 'proteins')
 * @param {string} lang - Language code
 * @returns {Promise<Array>} List of category foods
 */
export async function getFoodsByCategory(category, lang = 'en') {
  try {
    const rows = await getAll(
      'SELECT * FROM foods WHERE category = ? AND language_code = ?;',
      [category, lang]
    );
    return rows.map(row => {
      if (typeof row.vitamins === 'string') {
        row.vitamins = JSON.parse(row.vitamins);
        row.minerals = JSON.parse(row.minerals);
      }
      return row;
    });
  } catch (error) {
    console.error(`[SQLite] Error fetching foods by category ${category}:`, error);
    return [];
  }
}
