/**
 * NutriVision AI — SQLite queries for timing reminders
 */

import { executeRaw } from '../sqlite.js';

/**
 * Add a reminder.
 */
export async function addReminder(reminder) {
  const { title, time, type, enabled = 1, synced = 0 } = reminder;
  try {
    const query = `
      INSERT INTO reminders (title, time, type, enabled, synced)
      VALUES (?, ?, ?, ?, ?);
    `;
    const res = await executeRaw(query, [
      title,
      time,
      type,
      enabled,
      synced
    ]);
    return res.insertId;
  } catch (error) {
    console.error('[SQLite] Error adding reminder:', error);
    return null;
  }
}

/**
 * Get all reminders.
 */
export async function getReminders() {
  try {
    const query = 'SELECT * FROM reminders ORDER BY time ASC;';
    return await executeRaw(query);
  } catch (error) {
    console.error('[SQLite] Error fetching reminders:', error);
    return [];
  }
}

/**
 * Update a specific reminder.
 */
export async function updateReminder(id, updates) {
  try {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach((key) => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });
    
    // Always mark as unsynced on modification unless specified
    if (!updates.hasOwnProperty('synced')) {
      fields.push('synced = 0');
    }
    
    values.push(id);
    const query = `UPDATE reminders SET ${fields.join(', ')} WHERE id = ?;`;
    await executeRaw(query, values);
    return true;
  } catch (error) {
    console.error('[SQLite] Error updating reminder:', error);
    return false;
  }
}

/**
 * Delete a specific reminder.
 */
export async function deleteReminder(id) {
  try {
    const query = 'DELETE FROM reminders WHERE id = ?;';
    await executeRaw(query, [id]);
    return true;
  } catch (error) {
    console.error('[SQLite] Error deleting reminder:', error);
    return false;
  }
}

/**
 * Get unsynced reminders.
 */
export async function getUnsyncedReminders() {
  try {
    return await executeRaw('SELECT * FROM reminders WHERE synced = 0;');
  } catch (error) {
    console.error('[SQLite] Error getting unsynced reminders:', error);
    return [];
  }
}

/**
 * Mark reminders as synced.
 */
export async function markRemindersSynced(ids) {
  if (!ids || ids.length === 0) return;
  try {
    const placeholders = ids.map(() => '?').join(',');
    const query = `UPDATE reminders SET synced = 1 WHERE id IN (${placeholders});`;
    await executeRaw(query, ids);
  } catch (error) {
    console.error('[SQLite] Error marking reminders synced:', error);
  }
}
