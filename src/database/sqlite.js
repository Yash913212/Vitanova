/**
 * NutriVision AI — SQLite Database Core
 * Manages database connection lifecycle asynchronously using Expo SQLite.
 */

import * as SQLite from 'expo-sqlite';

let dbInstance = null;

/**
 * Open or retrieve the cached database connection.
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function getDatabase() {
  if (!dbInstance) {
    try {
      dbInstance = await SQLite.openDatabaseAsync('vitanova.db');
      // Enable foreign keys
      await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
    } catch (error) {
      console.error('[SQLite] Failed to open database:', error);
      throw error;
    }
  }
  return dbInstance;
}

/**
 * Execute an INSERT, UPDATE, or DELETE query.
 * @param {string} sql
 * @param {Array<any>} params
 * @returns {Promise<{lastInsertRowId: number, changes: number}>}
 */
export async function runQuery(sql, params = []) {
  const db = await getDatabase();
  try {
    return await db.runAsync(sql, params);
  } catch (error) {
    console.error(`[SQLite] Error running query: ${sql}`, error);
    throw error;
  }
}

/**
 * Execute a query that returns a single first row.
 * @param {string} sql
 * @param {Array<any>} params
 * @returns {Promise<any | null>}
 */
export async function getFirst(sql, params = []) {
  const db = await getDatabase();
  try {
    return await db.getFirstAsync(sql, params);
  } catch (error) {
    console.error(`[SQLite] Error getting first row: ${sql}`, error);
    throw error;
  }
}

/**
 * Execute a query that returns multiple rows.
 * @param {string} sql
 * @param {Array<any>} params
 * @returns {Promise<Array<any>>}
 */
export async function getAll(sql, params = []) {
  const db = await getDatabase();
  try {
    return await db.getAllAsync(sql, params);
  } catch (error) {
    console.error(`[SQLite] Error getting all rows: ${sql}`, error);
    throw error;
  }
}

/**
 * Execute a raw query string containing multiple statements.
 * @param {string} sql
 * @returns {Promise<void>}
 */
export async function executeRaw(sql) {
  const db = await getDatabase();
  try {
    await db.execAsync(sql);
  } catch (error) {
    console.error(`[SQLite] Error executing raw SQL`, error);
    throw error;
  }
}

/**
 * Execute multiple queries within an ACID transaction automatically.
 * @param {function} callback - Async function executing SQLite operations
 * @returns {Promise<void>}
 */
export async function withTransaction(callback) {
  const db = await getDatabase();
  try {
    await db.withTransactionAsync(callback);
  } catch (error) {
    console.error('[SQLite] Transaction rolled back due to error:', error);
    throw error;
  }
}
