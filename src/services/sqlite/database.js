/**
 * VitaNova AI — SQLite Database Manager
 * Managed local storage for caching, offline sync queue, and local food directory.
 * Web platform gracefully falls back to persistent localStorage to prevent WebAssembly/OPFS worker crashes.
 */
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import NUTRITION_DB from '../../data/nutritionDB';

let dbInstance = null;

// LocalStorage Helper Keys for Web Platform Fallback
const WEBLOCALSTORAGE_FAVS_KEY = 'vitanova_favorites';
const WEBLOCALSTORAGE_CACHE_KEY = 'vitanova_nutrition_cache';
const WEBLOCALSTORAGE_UPLOADS_KEY = 'vitanova_pending_uploads';

function getWebFavorites() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const favs = window.localStorage.getItem(WEBLOCALSTORAGE_FAVS_KEY);
      return favs ? JSON.parse(favs) : [];
    }
  } catch (e) {
    console.warn('[SQLite DB Web] Failed to read favorites from localStorage:', e);
  }
  return [];
}

function saveWebFavorites(favs) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(WEBLOCALSTORAGE_FAVS_KEY, JSON.stringify(favs));
    }
  } catch (e) {
    console.warn('[SQLite DB Web] Failed to save favorites to localStorage:', e);
  }
}

function getWebCache() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cache = window.localStorage.getItem(WEBLOCALSTORAGE_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    }
  } catch (e) {
    console.warn('[SQLite DB Web] Failed to read cache from localStorage:', e);
  }
  return {};
}

function saveWebCache(cache) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(WEBLOCALSTORAGE_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (e) {
    console.warn('[SQLite DB Web] Failed to save cache to localStorage:', e);
  }
}

function getWebUploads() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const uploads = window.localStorage.getItem(WEBLOCALSTORAGE_UPLOADS_KEY);
      return uploads ? JSON.parse(uploads) : [];
    }
  } catch (e) {
    console.warn('[SQLite DB Web] Failed to read uploads from localStorage:', e);
  }
  return [];
}

function saveWebUploads(uploads) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(WEBLOCALSTORAGE_UPLOADS_KEY, JSON.stringify(uploads));
    }
  } catch (e) {
    console.warn('[SQLite DB Web] Failed to save uploads to localStorage:', e);
  }
}

/**
 * Get or open the SQLite database instance asynchronously.
 */
export async function getDB() {
  if (Platform.OS === 'web') {
    return null;
  }
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('vitanova.db');
  return dbInstance;
}

/**
 * Initialize all required SQLite tables.
 */
export async function initDatabaseAsync() {
  if (Platform.OS === 'web') {
    console.log('[SQLite DB] Web platform detected. Operating in high-performance localStorage hybrid mode.');
    return;
  }

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

    CREATE TABLE IF NOT EXISTS favorites (
      key TEXT PRIMARY KEY,
      added_at INTEGER
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
  if (Platform.OS === 'web') return;
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

  if (Platform.OS === 'web') {
    const lowerQuery = query.toLowerCase().trim();
    return Object.entries(NUTRITION_DB)
      .filter(([key, food]) => 
        (food.name || '').toLowerCase().includes(lowerQuery) || 
        (food.category || '').toLowerCase().includes(lowerQuery) || 
        key.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10)
      .map(([key, food]) => ({
        key,
        name: food.name || '',
        category: food.category || '',
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fiber: food.fiber || 0,
        fats: food.fats || 0,
        vitamins: food.vitamins || [],
        minerals: food.minerals || [],
        benefits: food.benefits || '',
        bestTime: food.bestTime || '',
        recommendedQty: food.recommendedQty || '',
        hydration: food.hydration || 0
      }));
  }

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

  if (Platform.OS === 'web') {
    const cache = getWebCache();
    const entry = cache[queryKey];
    if (entry && entry.response_json) {
      try {
        return JSON.parse(entry.response_json);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

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

  if (Platform.OS === 'web') {
    const cache = getWebCache();
    cache[queryKey] = {
      response_json: JSON.stringify(data),
      created_at: Date.now()
    };
    // Prune cache elements older than 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const k in cache) {
      if (cache[k].created_at < sevenDaysAgo) {
        delete cache[k];
      }
    }
    saveWebCache(cache);
    return;
  }

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
  if (Platform.OS === 'web') {
    saveWebCache({});
    console.log('[SQLite DB] Caches cleared.');
    return;
  }

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

  if (Platform.OS === 'web') {
    const uploads = getWebUploads();
    if (!uploads.some(u => u.local_uri === localUri)) {
      uploads.push({
        id: Date.now(),
        local_uri: localUri,
        synced: 0,
        retry_count: 0,
        created_at: Date.now()
      });
      saveWebUploads(uploads);
    }
    console.log('[SQLite DB] Added pending upload to queue (Web):', localUri);
    return;
  }

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
  if (Platform.OS === 'web') {
    const uploads = getWebUploads();
    return uploads.filter(u => u.synced === 0);
  }

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
  if (Platform.OS === 'web') {
    const uploads = getWebUploads();
    saveWebUploads(uploads.filter(u => u.id !== id));
    console.log(`[SQLite DB] Deleted synced upload entry ID ${id} (Web).`);
    return;
  }

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
  if (Platform.OS === 'web') {
    const uploads = getWebUploads();
    const u = uploads.find(item => item.id === id);
    if (u) u.synced = 1;
    saveWebUploads(uploads);
    console.log(`[SQLite DB] Marked upload ID ${id} as synced (Web).`);
    return;
  }

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
  if (Platform.OS === 'web') {
    const uploads = getWebUploads();
    const u = uploads.find(item => item.id === id);
    if (u) u.retry_count += 1;
    saveWebUploads(uploads);
    return;
  }

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

/**
 * Add a food key to user favorites list.
 */
export async function addFavoriteAsync(key) {
  if (!key) return;

  if (Platform.OS === 'web') {
    const favs = getWebFavorites();
    if (!favs.includes(key)) {
      favs.push(key);
      saveWebFavorites(favs);
    }
    console.log('[SQLite DB] Added food to favorites (Web):', key);
    return;
  }

  const db = await getDB();
  try {
    await db.runAsync(
      'INSERT OR IGNORE INTO favorites (key, added_at) VALUES (?, ?)',
      key,
      Date.now()
    );
    console.log('[SQLite DB] Added food to favorites:', key);
  } catch (error) {
    console.error('[SQLite DB] addFavoriteAsync failed:', error);
  }
}

/**
 * Remove a food key from user favorites list.
 */
export async function removeFavoriteAsync(key) {
  if (!key) return;

  if (Platform.OS === 'web') {
    const favs = getWebFavorites();
    const newFavs = favs.filter(k => k !== key);
    saveWebFavorites(newFavs);
    console.log('[SQLite DB] Removed food from favorites (Web):', key);
    return;
  }

  const db = await getDB();
  try {
    await db.runAsync('DELETE FROM favorites WHERE key = ?', key);
    console.log('[SQLite DB] Removed food from favorites:', key);
  } catch (error) {
    console.error('[SQLite DB] removeFavoriteAsync failed:', error);
  }
}

/**
 * Fetch all favorited food keys from user favorites.
 */
export async function getFavoritesAsync() {
  if (Platform.OS === 'web') {
    return getWebFavorites();
  }

  const db = await getDB();
  try {
    const rows = await db.getAllAsync('SELECT key FROM favorites ORDER BY added_at DESC');
    return rows.map(r => r.key);
  } catch (error) {
    console.error('[SQLite DB] getFavoritesAsync failed:', error);
    return [];
  }
}

/**
 * Check if a food key is favorited.
 */
export async function isFavoriteAsync(key) {
  if (!key) return false;

  if (Platform.OS === 'web') {
    return getWebFavorites().includes(key);
  }

  const db = await getDB();
  try {
    const row = await db.getFirstAsync('SELECT key FROM favorites WHERE key = ?', key);
    return !!row;
  } catch (error) {
    console.error('[SQLite DB] isFavoriteAsync failed:', error);
    return false;
  }
}
