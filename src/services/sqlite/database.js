/**
 * NutriVision AI — SQLite Database Manager
 * Managed local storage for caching, offline sync queue, and local food directory.
 */
import * as SQLite from 'expo-sqlite';
import NUTRITION_DB from '../../data/nutritionDB';

let dbInstance = null;

/**
 * Get or open the SQLite database instance asynchronously.
 */
export async function getDB() {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('vitanova.db');
  return dbInstance;
}

/**
 * Initialize all required SQLite tables.
 */
export async function initDatabaseAsync() {
  const db = await getDB();

  // Create tables using execAsync
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS pending_uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      local_uri TEXT UNIQUE,
      synced INTEGER DEFAULT 0,
      retry_count INTEGER DEFAULT 0,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS nutrition_cache (
      query_key TEXT PRIMARY KEY,
      response_json TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS food_nutrition (
      key TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      calories REAL,
      protein REAL,
      carbs REAL,
      fiber REAL,
      fats REAL,
      vitamins TEXT,
      minerals TEXT,
      benefits TEXT,
      best_time TEXT,
      recommended_qty TEXT,
      hydration REAL
    );
  `);

  console.log('[SQLite DB] Schema check/setup completed successfully.');

  // Pre-populate offline food DB if empty
  await prePopulateFoodNutrition(db);
}

/**
 * Pre-populates the SQLite database with foods from static nutritionDB.js.
 */
async function prePopulateFoodNutrition(db) {
  try {
    const rowCountResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM food_nutrition;');
    const count = rowCountResult ? rowCountResult.count : 0;

    if (count > 0) {
      console.log(`[SQLite DB] food_nutrition already has ${count} records. Skipping pre-population.`);
      return;
    }

    console.log('[SQLite DB] Pre-populating food_nutrition database...');

    // We populate in a single transaction-like batch
    const insertStmt = 'INSERT INTO food_nutrition (key, name, category, calories, protein, carbs, fiber, fats, vitamins, minerals, benefits, best_time, recommended_qty, hydration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    for (const [key, food] of Object.entries(NUTRITION_DB)) {
      await db.runAsync(
        insertStmt,
        key,
        food.name || '',
        food.category || '',
        food.calories || 0,
        food.protein || 0,
        food.carbs || 0,
        food.fiber || 0,
        food.fats || 0,
        JSON.stringify(food.vitamins || []),
        JSON.stringify(food.minerals || []),
        food.benefits || '',
        food.bestTime || '',
        food.recommendedQty || '',
        food.hydration || 0
      );
    }

    const verifyCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM food_nutrition;');
    console.log(`[SQLite DB] Successfully populated ${verifyCount ? verifyCount.count : 0} food nutrition records.`);
  } catch (error) {
    console.error('[SQLite DB] Failed to pre-populate food database:', error);
  }
}

/**
 * Search local offline food nutrition details by query string (structured lookup).
 */
export async function searchOfflineFood(query) {
  if (!query) return [];
  const db = await getDB();
  const lowerQuery = `%${query.toLowerCase().trim()}%`;
  
  try {
    const rows = await db.getAllAsync(
      `SELECT * FROM food_nutrition 
       WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(key) LIKE ?
       ORDER BY 
         CASE WHEN LOWER(name) = ? THEN 0
              WHEN LOWER(name) LIKE ? THEN 1
              ELSE 2
         END, name ASC LIMIT 10`,
      lowerQuery,
      lowerQuery,
      lowerQuery,
      query.toLowerCase().trim(),
      `${query.toLowerCase().trim()}%`
    );

    return rows.map(r => ({
      key: r.key,
      name: r.name,
      category: r.category,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fiber: r.fiber,
      fats: r.fats,
      vitamins: JSON.parse(r.vitamins || '[]'),
      minerals: JSON.parse(r.minerals || '[]'),
      benefits: r.benefits,
      bestTime: r.best_time,
      recommendedQty: r.recommended_qty,
      hydration: r.hydration
    }));
  } catch (error) {
    console.error('[SQLite DB] searchOfflineFood failed:', error);
    return [];
  }
}

/**
 * Retrieve cached nutrition response for an image/query identifier.
 */
export async function getCachedNutrition(queryKey) {
  if (!queryKey) return null;
  const db = await getDB();
  try {
    const row = await db.getFirstAsync(
      'SELECT response_json FROM nutrition_cache WHERE query_key = ?',
      queryKey.trim()
    );
    if (row && row.response_json) {
      return JSON.parse(row.response_json);
    }
  } catch (error) {
    console.error('[SQLite DB] getCachedNutrition failed:', error);
  }
  return null;
}

/**
 * Cache nutrition response for an image/query.
 */
export async function cacheNutrition(queryKey, data) {
  if (!queryKey || !data) return;
  const db = await getDB();
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO nutrition_cache (query_key, response_json, created_at) VALUES (?, ?, ?)',
      queryKey.trim(),
      JSON.stringify(data),
      Date.now()
    );
    // Auto-prune cache elements older than 7 days to manage storage size
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    await db.runAsync('DELETE FROM nutrition_cache WHERE created_at < ?', sevenDaysAgo);
  } catch (error) {
    console.error('[SQLite DB] cacheNutrition failed:', error);
  }
}

/**
 * Clear cached nutrition table.
 */
export async function clearNutritionCache() {
  const db = await getDB();
  try {
    await db.runAsync('DELETE FROM nutrition_cache');
    console.log('[SQLite DB] Caches cleared.');
  } catch (error) {
    console.error('[SQLite DB] clearNutritionCache failed:', error);
  }
}

/**
 * Add a file URI to the pending upload sync queue.
 */
export async function addPendingUpload(localUri) {
  if (!localUri) return;
  const db = await getDB();
  try {
    await db.runAsync(
      'INSERT OR IGNORE INTO pending_uploads (local_uri, synced, retry_count, created_at) VALUES (?, 0, 0, ?)',
      localUri,
      Date.now()
    );
    console.log('[SQLite DB] Added pending upload to queue:', localUri);
  } catch (error) {
    console.error('[SQLite DB] addPendingUpload failed:', error);
  }
}

/**
 * Get all unsynced uploads from the queue.
 */
export async function getPendingUploads() {
  const db = await getDB();
  try {
    return await db.getAllAsync(
      'SELECT * FROM pending_uploads WHERE synced = 0 ORDER BY created_at ASC'
    );
  } catch (error) {
    console.error('[SQLite DB] getPendingUploads failed:', error);
    return [];
  }
}

/**
 * Delete / Remove a pending upload after successful synchronization.
 */
export async function deletePendingUpload(id) {
  const db = await getDB();
  try {
    await db.runAsync('DELETE FROM pending_uploads WHERE id = ?', id);
    console.log(`[SQLite DB] Deleted synced upload entry ID ${id}.`);
  } catch (error) {
    console.error('[SQLite DB] deletePendingUpload failed:', error);
  }
}

/**
 * Mark a pending upload as synced (alternative/preservative strategy).
 */
export async function markPendingUploadSynced(id) {
  const db = await getDB();
  try {
    await db.runAsync('UPDATE pending_uploads SET synced = 1 WHERE id = ?', id);
    console.log(`[SQLite DB] Marked upload ID ${id} as synced.`);
  } catch (error) {
    console.error('[SQLite DB] markPendingUploadSynced failed:', error);
  }
}

/**
 * Increment the retry count of an entry to avoid infinite syncing loops of broken files.
 */
export async function incrementRetryCount(id) {
  const db = await getDB();
  try {
    await db.runAsync(
      'UPDATE pending_uploads SET retry_count = retry_count + 1 WHERE id = ?',
      id
    );
  } catch (error) {
    console.error('[SQLite DB] incrementRetryCount failed:', error);
  }
}
