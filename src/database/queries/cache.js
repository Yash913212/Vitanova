/**
 * NutriVision AI — AI Cache SQLite Queries
 * Optimizes mobile data transfer and response speed by caching repetitive AI responses locally.
 */

import { runQuery, getFirst } from '../sqlite.js';

/**
 * Fetch a cached response for a query string.
 * @param {string} rawQuery - The prompt query
 * @returns {Promise<string|null>} The cached AI response or null
 */
export async function getCachedResponse(rawQuery) {
  try {
    const normalized = rawQuery.trim().toLowerCase();
    const row = await getFirst(
      'SELECT response FROM ai_cache WHERE query = ?;',
      [normalized]
    );
    return row ? row.response : null;
  } catch (error) {
    console.error('[SQLite] Error fetching cached response:', error);
    return null;
  }
}

/**
 * Cache an AI response.
 * @param {string} rawQuery - The prompt query
 * @param {string} response - The AI generated answer
 * @returns {Promise<boolean>}
 */
export async function setCachedResponse(rawQuery, response) {
  try {
    const normalized = rawQuery.trim().toLowerCase();
    const timestamp = new Date().toISOString();
    
    await runQuery(
      `INSERT OR REPLACE INTO ai_cache (query, response, timestamp)
       VALUES (?, ?, ?);`,
      [normalized, response, timestamp]
    );
    return true;
  } catch (error) {
    console.error('[SQLite] Error setting cached response:', error);
    return false;
  }
}

/**
 * Prune old cached answers to manage storage.
 * @param {number} daysKeep - Number of days to retain cache
 * @returns {Promise<boolean>}
 */
export async function pruneCache(daysKeep = 7) {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysKeep);
    const thresholdStr = thresholdDate.toISOString();
    
    await runQuery(
      'DELETE FROM ai_cache WHERE timestamp < ?;',
      [thresholdStr]
    );
    return true;
  } catch (error) {
    console.error('[SQLite] Error pruning AI cache:', error);
    return false;
  }
}

/**
 * Wipes the cache entirely.
 * @returns {Promise<boolean>}
 */
export async function clearCache() {
  try {
    await runQuery('DELETE FROM ai_cache;');
    return true;
  } catch (error) {
    console.error('[SQLite] Error clearing cache:', error);
    return false;
  }
}
