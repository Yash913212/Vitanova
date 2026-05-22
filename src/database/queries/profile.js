/**
 * NutriVision AI — User Profile SQLite Queries
 * Manages physical metrics, dietary preferences, and localized goal targets.
 */

import { runQuery, getFirst } from '../sqlite.js';

const DEFAULT_PROFILE = {
  age: 25,
  gender: 'no_preference',
  height: 170,
  weight: 65,
  goal: 'maintenance',
  diet_preference: 'no_preference',
  preferred_language: 'en'
};

/**
 * Fetch the user's physical profile.
 * Creates a default entry if none exists.
 * @returns {Promise<object>} The active user profile
 */
export async function getUserProfile() {
  try {
    let row = await getFirst('SELECT * FROM user_profile WHERE id = 1;');
    if (!row) {
      // Insert default profile if database is unpopulated
      await runQuery(
        `INSERT INTO user_profile (
          id, age, gender, height, weight, goal, diet_preference, preferred_language, synced
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, 0);`,
        [
          DEFAULT_PROFILE.age,
          DEFAULT_PROFILE.gender,
          DEFAULT_PROFILE.height,
          DEFAULT_PROFILE.weight,
          DEFAULT_PROFILE.goal,
          DEFAULT_PROFILE.diet_preference,
          DEFAULT_PROFILE.preferred_language
        ]
      );
      row = { id: 1, ...DEFAULT_PROFILE, synced: 0 };
    }
    return row;
  } catch (error) {
    console.error('[SQLite] Error fetching user profile:', error);
    return { ...DEFAULT_PROFILE, synced: 0 };
  }
}

/**
 * Update the user's profile metrics.
 * @param {object} profile - Object containing the metrics to update
 * @param {number} synced - Sync status: 0 = unsynced, 1 = synced
 * @returns {Promise<boolean>} Resolves to true on success
 */
export async function updateUserProfile(profile, synced = 0) {
  try {
    const active = await getUserProfile();
    const merged = { ...active, ...profile };
    
    await runQuery(
      `UPDATE user_profile SET 
        age = ?, gender = ?, height = ?, weight = ?, 
        goal = ?, diet_preference = ?, preferred_language = ?,
        synced = ?
      WHERE id = 1;`,
      [
        merged.age,
        merged.gender,
        merged.height,
        merged.weight,
        merged.goal,
        merged.diet_preference,
        merged.preferred_language,
        synced
      ]
    );
    return true;
  } catch (error) {
    console.error('[SQLite] Error updating user profile:', error);
    return false;
  }
}

