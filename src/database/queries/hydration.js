/**
 * NutriVision AI — SQLite queries for daily hydration logs
 */

import { executeRaw } from '../sqlite.js';

/**
 * Log a hydration record.
 */
export async function addHydrationLog(amount_ml, timestamp, synced = 0) {
  try {
    const query = `
      INSERT INTO hydration_logs (amount_ml, timestamp, synced)
      VALUES (?, ?, ?);
    `;
    const res = await executeRaw(query, [
      amount_ml,
      timestamp || new Date().toISOString(),
      synced
    ]);
    return res.insertId;
  } catch (error) {
    console.error('[SQLite] Error adding hydration log:', error);
    return null;
  }
}

/**
 * Get all hydration logs.
 */
export async function getHydrationLogs(limit = 100) {
  try {
    const query = 'SELECT * FROM hydration_logs ORDER BY timestamp DESC LIMIT ?;';
    return await executeRaw(query, [limit]);
  } catch (error) {
    console.error('[SQLite] Error fetching hydration logs:', error);
    return [];
  }
}

/**
 * Get daily aggregated hydration total (in ml) for a specific date (YYYY-MM-DD).
 */
export async function getDailyHydration(dateString) {
  try {
    const query = `
      SELECT COALESCE(SUM(amount_ml), 0) as totalHydration
      FROM hydration_logs
      WHERE timestamp LIKE ?;
    `;
    const res = await executeRaw(query, [`${dateString}%`]);
    return res[0]?.totalHydration || 0;
  } catch (error) {
    console.error('[SQLite] Error aggregating daily hydration:', error);
    return 0;
  }
}

/**
 * Delete a hydration log.
 */
export async function deleteHydrationLog(id) {
  try {
    const query = 'DELETE FROM hydration_logs WHERE id = ?;';
    await executeRaw(query, [id]);
    return true;
  } catch (error) {
    console.error('[SQLite] Error deleting hydration log:', error);
    return false;
  }
}

/**
 * Clear all hydration logs.
 */
export async function clearHydrationLogs() {
  try {
    await executeRaw('DELETE FROM hydration_logs;');
    return true;
  } catch (error) {
    console.error('[SQLite] Error clearing hydration logs:', error);
    return false;
  }
}

/**
 * Get unsynced hydration logs.
 */
export async function getUnsyncedHydrationLogs() {
  try {
    return await executeRaw('SELECT * FROM hydration_logs WHERE synced = 0;');
  } catch (error) {
    console.error('[SQLite] Error getting unsynced hydration logs:', error);
    return [];
  }
}

/**
 * Mark hydration logs as synced.
 */
export async function markHydrationLogsSynced(ids) {
  if (!ids || ids.length === 0) return;
  try {
    const placeholders = ids.map(() => '?').join(',');
    const query = `UPDATE hydration_logs SET synced = 1 WHERE id IN (${placeholders});`;
    await executeRaw(query, ids);
  } catch (error) {
    console.error('[SQLite] Error marking hydration logs synced:', error);
  }
}
