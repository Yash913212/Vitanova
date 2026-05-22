/**
 * NutriVision AI — Scan History SQLite Queries
 * Tracks user-logged nutrition scans and AI responses.
 */

import { runQuery, getAll } from '../sqlite.js';

/**
 * Add a new scan entry.
 * @param {string} foodName
 * @param {string} imageUri
 * @param {object} nutritionSnapshot - Will be stored as stringified JSON
 * @param {string} aiResponse
 * @param {number} confidence
 * @returns {Promise<number|null>} Inserted row ID or null
 */
export async function addScanHistoryEntry(
  foodName,
  imageUri,
  nutritionSnapshot,
  aiResponse,
  confidence,
  synced = 0
) {
  try {
    const timestamp = new Date().toISOString();
    const snapshotStr = JSON.stringify(nutritionSnapshot || {});
    
    const result = await runQuery(
      `INSERT INTO scan_history (
        food_name, image_uri, nutrition_snapshot, ai_response, confidence, timestamp, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [foodName, imageUri, snapshotStr, aiResponse, confidence, timestamp, synced]
    );
    return result.lastInsertRowId || null;
  } catch (error) {
    console.error('[SQLite] Error adding scan history entry:', error);
    return null;
  }
}

/**
 * Retrieve all unsynced scan history records.
 * @returns {Promise<Array>} Unsynced scan records
 */
export async function getUnsyncedScanHistory() {
  try {
    const rows = await getAll(
      'SELECT * FROM scan_history WHERE synced = 0 ORDER BY timestamp ASC;'
    );
    return rows.map(row => {
      try {
        row.nutrition_snapshot = JSON.parse(row.nutrition_snapshot);
      } catch {
        row.nutrition_snapshot = {};
      }
      return row;
    });
  } catch (error) {
    console.error('[SQLite] Error getting unsynced scan history:', error);
    return [];
  }
}

/**
 * Mark a batch of scan history records as synced.
 * @param {Array<number>} ids - List of scan IDs
 * @returns {Promise<boolean>}
 */
export async function markScanHistorySynced(ids) {
  if (!ids || ids.length === 0) return true;
  try {
    const placeholders = ids.map(() => '?').join(',');
    await runQuery(`UPDATE scan_history SET synced = 1 WHERE id IN (${placeholders});`, ids);
    return true;
  } catch (error) {
    console.error('[SQLite] Error marking scan history synced:', error);
    return false;
  }
}


/**
 * Retrieve the scan history log, ordered by newest first.
 * @param {number} limit - Maximum number of rows
 * @returns {Promise<Array>} List of scan records
 */
export async function getScanHistory(limit = 50) {
  try {
    const rows = await getAll(
      'SELECT * FROM scan_history ORDER BY timestamp DESC LIMIT ?;',
      [limit]
    );
    return rows.map(row => {
      try {
        row.nutrition_snapshot = JSON.parse(row.nutrition_snapshot);
      } catch {
        row.nutrition_snapshot = {};
      }
      return row;
    });
  } catch (error) {
    console.error('[SQLite] Error getting scan history:', error);
    return [];
  }
}

/**
 * Delete a specific history log entry.
 * @param {number} id - Record ID
 * @returns {Promise<boolean>}
 */
export async function deleteHistoryItem(id) {
  try {
    await runQuery('DELETE FROM scan_history WHERE id = ?;', [id]);
    return true;
  } catch (error) {
    console.error(`[SQLite] Error deleting history item ${id}:`, error);
    return false;
  }
}

/**
 * Wipe all history records.
 * @returns {Promise<boolean>}
 */
export async function clearScanHistory() {
  try {
    await runQuery('DELETE FROM scan_history;');
    return true;
  } catch (error) {
    console.error('[SQLite] Error clearing scan history:', error);
    return false;
  }
}
