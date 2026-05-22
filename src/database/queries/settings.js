/**
 * NutriVision AI — Application Settings SQLite Queries
 * Stores local app settings (TTS/STT, offline state).
 */

import { runQuery, getFirst } from '../sqlite.js';

const DEFAULT_SETTINGS = {
  auto_tts: 1, // 1 = enabled, 0 = disabled
  tts_language: 'en',
  stt_language: 'en',
  offline_mode: 0 // 0 = online, 1 = offline first
};

/**
 * Fetch settings. Creates a default entry if none exists.
 * @returns {Promise<object>} The application settings
 */
export async function getSettings() {
  try {
    let row = await getFirst('SELECT * FROM settings WHERE id = 1;');
    if (!row) {
      await runQuery(
        `INSERT INTO settings (
          id, auto_tts, tts_language, stt_language, offline_mode
        ) VALUES (1, ?, ?, ?, ?);`,
        [
          DEFAULT_SETTINGS.auto_tts,
          DEFAULT_SETTINGS.tts_language,
          DEFAULT_SETTINGS.stt_language,
          DEFAULT_SETTINGS.offline_mode
        ]
      );
      row = { id: 1, ...DEFAULT_SETTINGS };
    }
    
    // Map SQLite numeric values back to booleans
    return {
      id: row.id,
      auto_tts: row.auto_tts === 1,
      tts_language: row.tts_language,
      stt_language: row.stt_language,
      offline_mode: row.offline_mode === 1
    };
  } catch (error) {
    console.error('[SQLite] Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update app settings.
 * @param {object} updates - Object containing fields to update
 * @returns {Promise<boolean>} Resolves to true on success
 */
export async function updateSettings(updates) {
  try {
    const active = await getSettings();
    const merged = { ...active, ...updates };
    
    // Convert boolean back to SQLite integer
    const autoTtsInt = merged.auto_tts ? 1 : 0;
    const offlineInt = merged.offline_mode ? 1 : 0;
    
    await runQuery(
      `UPDATE settings SET 
        auto_tts = ?, tts_language = ?, stt_language = ?, offline_mode = ?
      WHERE id = 1;`,
      [autoTtsInt, merged.tts_language, merged.stt_language, offlineInt]
    );
    return true;
  } catch (error) {
    console.error('[SQLite] Error updating settings:', error);
    return false;
  }
}
