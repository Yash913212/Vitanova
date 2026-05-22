/**
 * NutriVision AI — SQLite Schema Initializer
 * Constructs all 5 tables and search performance indexes.
 */

import { executeRaw } from './sqlite.js';

/**
 * Initialize all database tables and indexes if they do not exist.
 * @returns {Promise<boolean>} Resolves to true on success
 */
export async function initializeDatabase() {
  console.log('[SQLite] Initializing database schema...');
  try {
    // Construct database tables
    await executeRaw(`
      -- 1. Foods Table (Multilingual nutrition DB)
      CREATE TABLE IF NOT EXISTS foods (
        id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        calories INTEGER NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fats REAL NOT NULL,
        fiber REAL NOT NULL,
        vitamins TEXT NOT NULL, -- JSON stringified array/object
        minerals TEXT NOT NULL, -- JSON stringified array/object
        hydration INTEGER NOT NULL,
        benefits TEXT NOT NULL,
        best_time TEXT NOT NULL,
        recommended_quantity TEXT NOT NULL,
        warnings TEXT NOT NULL,
        language_code TEXT NOT NULL, -- 'en', 'hi', 'te'
        PRIMARY KEY (id, language_code)
      );

      -- Indexes for foods queries
      CREATE INDEX IF NOT EXISTS idx_foods_id ON foods (id);
      CREATE INDEX IF NOT EXISTS idx_foods_name_lang ON foods (name, language_code);
      CREATE INDEX IF NOT EXISTS idx_foods_category ON foods (category);

      -- 2. Scan History Table
      CREATE TABLE IF NOT EXISTS scan_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_name TEXT NOT NULL,
        image_uri TEXT NOT NULL,
        nutrition_snapshot TEXT NOT NULL, -- JSON string
        ai_response TEXT NOT NULL,
        confidence REAL NOT NULL,
        timestamp TEXT NOT NULL,
        synced INTEGER DEFAULT 0 -- 0 = unsynced, 1 = synced
      );

      CREATE INDEX IF NOT EXISTS idx_history_timestamp ON scan_history (timestamp DESC);

      -- 3. User Profile Table
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        age INTEGER,
        gender TEXT,
        height REAL,
        weight REAL,
        goal TEXT, -- 'maintenance', 'fat_loss', 'muscle_gain', 'weight_gain'
        diet_preference TEXT, -- 'no_preference', 'vegetarian', 'vegan', 'keto'
        preferred_language TEXT, -- 'en', 'hi', 'te'
        synced INTEGER DEFAULT 0 -- 0 = unsynced, 1 = synced
      );

      -- 4. App Settings Table
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        auto_tts INTEGER DEFAULT 1, -- 0 or 1
        tts_language TEXT DEFAULT 'en',
        stt_language TEXT DEFAULT 'en',
        offline_mode INTEGER DEFAULT 0 -- 0 or 1
      );

      -- 5. AI Chat Query Cache
      CREATE TABLE IF NOT EXISTS ai_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT UNIQUE NOT NULL,
        response TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cache_query ON ai_cache (query);

      -- 6. Nutrition Daily Logs Table
      CREATE TABLE IF NOT EXISTS nutrition_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_name TEXT NOT NULL,
        calories INTEGER NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fats REAL NOT NULL,
        fiber REAL NOT NULL,
        timestamp TEXT NOT NULL, -- ISO Date string
        meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
        synced INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_timestamp ON nutrition_logs (timestamp DESC);

      -- 7. Hydration Daily Logs Table
      CREATE TABLE IF NOT EXISTS hydration_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount_ml INTEGER NOT NULL,
        timestamp TEXT NOT NULL, -- ISO Date string
        synced INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_hydration_timestamp ON hydration_logs (timestamp DESC);

      -- 8. Reminders Table
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        time TEXT NOT NULL, -- 'HH:MM'
        type TEXT NOT NULL, -- 'water', 'meal', 'workout'
        enabled INTEGER DEFAULT 1, -- 0 or 1
        synced INTEGER DEFAULT 0
      );
    `);


    // Self-healing migration for existing databases
    try {
      await executeRaw('ALTER TABLE scan_history ADD COLUMN synced INTEGER DEFAULT 0;');
      console.log('[SQLite Migration] Added synced column to scan_history');
    } catch (e) {
      // Column already exists
    }

    try {
      await executeRaw('ALTER TABLE user_profile ADD COLUMN synced INTEGER DEFAULT 0;');
      console.log('[SQLite Migration] Added synced column to user_profile');
    } catch (e) {
      // Column already exists
    }

    try {
      await executeRaw('ALTER TABLE settings ADD COLUMN has_onboarded INTEGER DEFAULT 0;');
      console.log('[SQLite Migration] Added has_onboarded column to settings');
    } catch (e) {
      // Column already exists
    }

    try {
      await executeRaw('ALTER TABLE settings ADD COLUMN has_configured_profile INTEGER DEFAULT 0;');
      console.log('[SQLite Migration] Added has_configured_profile column to settings');
    } catch (e) {
      // Column already exists
    }

    console.log('[SQLite] Schema and indexes configured successfully.');
    return true;
  } catch (error) {
    console.error('[SQLite] Failed to initialize database schema:', error);
    return false;
  }
}
