/**
 * NutriVision AI — SQLite queries for daily nutrition logs
 */

import { executeRaw } from '../sqlite.js';

/**
 * Log a meal/food consumption.
 */
export async function addNutritionLog(log) {
  const { food_name, calories, protein, carbs, fats, fiber, timestamp, meal_type, synced = 0 } = log;
  try {
    const query = `
      INSERT INTO nutrition_logs (food_name, calories, protein, carbs, fats, fiber, timestamp, meal_type, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const res = await executeRaw(query, [
      food_name,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      timestamp || new Date().toISOString(),
      meal_type || 'snack',
      synced
    ]);
    return res.insertId;
  } catch (error) {
    console.error('[SQLite] Error adding nutrition log:', error);
    return null;
  }
}

/**
 * Fetch all nutrition logs sorted by timestamp descending.
 */
export async function getNutritionLogs(limit = 100) {
  try {
    const query = 'SELECT * FROM nutrition_logs ORDER BY timestamp DESC LIMIT ?;';
    return await executeRaw(query, [limit]);
  } catch (error) {
    console.error('[SQLite] Error fetching nutrition logs:', error);
    return [];
  }
}

/**
 * Fetch nutrition logs logged on a specific date (YYYY-MM-DD format).
 */
export async function getNutritionLogsByDate(dateString) {
  try {
    const query = `
      SELECT * FROM nutrition_logs 
      WHERE timestamp LIKE ? 
      ORDER BY timestamp DESC;
    `;
    return await executeRaw(query, [`${dateString}%`]);
  } catch (error) {
    console.error('[SQLite] Error fetching nutrition logs by date:', error);
    return [];
  }
}

/**
 * Calculate sum of macro/calorie intakes for a specific date (YYYY-MM-DD).
 */
export async function getDailyNutritionStats(dateString) {
  try {
    const query = `
      SELECT 
        COALESCE(SUM(calories), 0) as totalCalories,
        COALESCE(SUM(protein), 0) as totalProtein,
        COALESCE(SUM(carbs), 0) as totalCarbs,
        COALESCE(SUM(fats), 0) as totalFats,
        COALESCE(SUM(fiber), 0) as totalFiber
      FROM nutrition_logs
      WHERE timestamp LIKE ?;
    `;
    const res = await executeRaw(query, [`${dateString}%`]);
    return res[0] || { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0, totalFiber: 0 };
  } catch (error) {
    console.error('[SQLite] Error aggregating daily nutrition stats:', error);
    return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0, totalFiber: 0 };
  }
}

/**
 * Delete a specific nutrition log.
 */
export async function deleteNutritionLog(id) {
  try {
    const query = 'DELETE FROM nutrition_logs WHERE id = ?;';
    await executeRaw(query, [id]);
    return true;
  } catch (error) {
    console.error('[SQLite] Error deleting nutrition log:', error);
    return false;
  }
}

/**
 * Clear all nutrition logs.
 */
export async function clearNutritionLogs() {
  try {
    await executeRaw('DELETE FROM nutrition_logs;');
    return true;
  } catch (error) {
    console.error('[SQLite] Error clearing nutrition logs:', error);
    return false;
  }
}

/**
 * Fetch all unsynced nutrition logs.
 */
export async function getUnsyncedNutritionLogs() {
  try {
    return await executeRaw('SELECT * FROM nutrition_logs WHERE synced = 0;');
  } catch (error) {
    console.error('[SQLite] Error getting unsynced nutrition logs:', error);
    return [];
  }
}

/**
 * Mark a batch of nutrition logs as synced.
 */
export async function markNutritionLogsSynced(ids) {
  if (!ids || ids.length === 0) return;
  try {
    const placeholders = ids.map(() => '?').join(',');
    const query = `UPDATE nutrition_logs SET synced = 1 WHERE id IN (${placeholders});`;
    await executeRaw(query, ids);
  } catch (error) {
    console.error('[SQLite] Error marking nutrition logs synced:', error);
  }
}
