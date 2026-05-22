/**
 * NutriVision AI — Supabase Sync Service
 * Manages bi-directional cloud backup and sync between SQLite and Supabase.
 */

import NetInfo from '@react-native-community/netinfo';
import { supabase } from './client';
import { getUserProfile, updateUserProfile } from '../../database/queries/profile';
import { getUnsyncedScanHistory, markScanHistorySynced, addScanHistoryEntry, getScanHistory } from '../../database/queries/history';
import { getUnsyncedNutritionLogs, markNutritionLogsSynced, addNutritionLog, getNutritionLogs } from '../../database/queries/nutrition';
import { getUnsyncedHydrationLogs, markHydrationLogsSynced, addHydrationLog, getHydrationLogs } from '../../database/queries/hydration';
import { getUnsyncedReminders, markRemindersSynced, addReminder, getReminders, updateReminder } from '../../database/queries/reminders';

let isSyncing = false;

/**
 * Check if the device is currently online.
 * @returns {Promise<boolean>}
 */
export async function isOnline() {
  const state = await NetInfo.fetch();
  return !!state.isConnected && !!state.isInternetReachable;
}

/**
 * Perform a full bi-directional synchronization of user profile and scan history.
 * Runs in the background and catches all errors to prevent app disruptions.
 * @returns {Promise<boolean>} Resolves to true if sync completed or skipped safely
 */
export async function syncData() {
  if (isSyncing) {
    console.log('[SyncService] Sync already in progress, skipping.');
    return false;
  }

  // 1. Verify Internet Connection
  const online = await isOnline();
  if (!online) {
    console.log('[SyncService] Device is offline. Sync deferred.');
    return false;
  }

  // 2. Verify Authenticated Supabase Session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) {
    console.log('[SyncService] No active user session. Sync skipped.');
    return false;
  }

  const userId = session.user.id;
  isSyncing = true;
  console.log(`[SyncService] Starting background sync for user: ${userId}`);

  try {
    // --- PHASE 1: USER PROFILE SYNC ---
    await syncUserProfile(userId);

    // --- PHASE 2: SCAN HISTORY SYNC ---
    await syncScanHistory(userId);

    // --- PHASE 3: NUTRITION LOGS SYNC ---
    await syncNutritionLogs(userId);

    // --- PHASE 4: HYDRATION LOGS SYNC ---
    await syncHydrationLogs(userId);

    // --- PHASE 5: REMINDERS SYNC ---
    await syncReminders(userId);

    console.log('[SyncService] Background synchronization completed successfully.');
    return true;
  } catch (error) {
    console.error('[SyncService] Error during background synchronization:', error);
    return false;
  } finally {
    isSyncing = false;
  }
}

/**
 * Syncs the local and remote user profiles bi-directionally.
 * @param {string} userId
 */
async function syncUserProfile(userId) {
  const localProfile = await getUserProfile();

  if (localProfile.synced === 0) {
    console.log('[SyncService] Pushing local profile updates to Supabase...');
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        age: localProfile.age,
        gender: localProfile.gender,
        height: localProfile.height,
        weight: localProfile.weight,
        goal: localProfile.goal,
        diet_preference: localProfile.diet_preference,
        preferred_language: localProfile.preferred_language,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[SyncService] Failed to upsert profile to Supabase:', error.message);
    } else {
      await updateUserProfile(localProfile, 1); // Mark local as synced
      console.log('[SyncService] Profile successfully synced to cloud.');
    }
  } else {
    // Local is synced, check if Supabase has newer data (e.g. from another device)
    console.log('[SyncService] Pulling profile data from Supabase...');
    const { data: cloudProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('[SyncService] Error fetching cloud profile:', error.message);
    } else if (cloudProfile) {
      // If different from local, overwrite local profile
      if (
        localProfile.age !== cloudProfile.age ||
        localProfile.gender !== cloudProfile.gender ||
        localProfile.height !== cloudProfile.height ||
        localProfile.weight !== cloudProfile.weight ||
        localProfile.goal !== cloudProfile.goal ||
        localProfile.diet_preference !== cloudProfile.diet_preference ||
        localProfile.preferred_language !== cloudProfile.preferred_language
      ) {
        console.log('[SyncService] Cloud profile contains newer metrics. Merging locally...');
        await updateUserProfile({
          age: cloudProfile.age,
          gender: cloudProfile.gender,
          height: cloudProfile.height,
          weight: cloudProfile.weight,
          goal: cloudProfile.goal,
          diet_preference: cloudProfile.diet_preference,
          preferred_language: cloudProfile.preferred_language,
        }, 1);
      }
    }
  }
}

/**
 * Syncs local and remote scan history records.
 * @param {string} userId
 */
async function syncScanHistory(userId) {
  // 1. Upload unsynced local records
  const unsynced = await getUnsyncedScanHistory();
  if (unsynced.length > 0) {
    console.log(`[SyncService] Found ${unsynced.length} unsynced local scans. Uploading...`);
    
    // Process in lightweight batches of 10 to protect network metrics
    const batchSize = 10;
    for (let i = 0; i < unsynced.length; i += batchSize) {
      const batch = unsynced.slice(i, i + batchSize);
      const rowsToInsert = batch.map(item => ({
        user_id: userId,
        food_name: item.food_name,
        image_uri: item.image_uri,
        nutrition_snapshot: item.nutrition_snapshot,
        ai_response: item.ai_response,
        confidence: item.confidence,
        timestamp: item.timestamp,
      }));

      const { error } = await supabase
        .from('scan_history')
        .insert(rowsToInsert);

      if (error) {
        console.error('[SyncService] Error inserting scan history batch:', error.message);
        break; // Stop syncing this batch, try next cycle
      } else {
        const ids = batch.map(item => item.id);
        await markScanHistorySynced(ids);
        console.log(`[SyncService] Synced batch of ${batch.length} scans to cloud.`);
      }
    }
  }

  // 2. Pull cloud records to populate local DB on new/multiple devices
  console.log('[SyncService] Checking for new cloud scan history entries...');
  const { data: cloudScans, error } = await supabase
    .from('scan_history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[SyncService] Failed to pull cloud scan history:', error.message);
    return;
  }

  if (cloudScans && cloudScans.length > 0) {
    const localScans = await getScanHistory(100);
    const localTimestamps = new Set(localScans.map(s => s.timestamp));

    let newInsertsCount = 0;
    for (const remote of cloudScans) {
      // Prevent duplicates by checking remote timestamp
      if (!localTimestamps.has(remote.timestamp)) {
        await addScanHistoryEntry(
          remote.food_name,
          remote.image_uri,
          remote.nutrition_snapshot,
          remote.ai_response,
          remote.confidence,
          1 // Mark as already synced (synced = 1)
        );
        newInsertsCount++;
      }
    }

    if (newInsertsCount > 0) {
      console.log(`[SyncService] Downloaded ${newInsertsCount} new history scans from cloud.`);
    }
  }
}

/**
 * Bi-directionally sync daily nutrition logs.
 */
async function syncNutritionLogs(userId) {
  // 1. Push local unsynced logs
  const unsynced = await getUnsyncedNutritionLogs();
  if (unsynced.length > 0) {
    console.log(`[SyncService] Found ${unsynced.length} unsynced nutrition logs. Syncing to cloud...`);
    const rows = unsynced.map(log => ({
      user_id: userId,
      food_name: log.food_name,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fats: log.fats,
      fiber: log.fiber,
      timestamp: log.timestamp,
      meal_type: log.meal_type
    }));

    const { error } = await supabase
      .from('nutrition_logs')
      .insert(rows);

    if (error) {
      console.error('[SyncService] Failed to upload nutrition logs:', error.message);
    } else {
      const ids = unsynced.map(log => log.id);
      await markNutritionLogsSynced(ids);
      console.log(`[SyncService] Successfully synced ${ids.length} nutrition logs to cloud.`);
    }
  }

  // 2. Pull down cloud entries
  console.log('[SyncService] Checking for new cloud nutrition logs...');
  const { data: cloudLogs, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[SyncService] Failed to pull cloud nutrition logs:', error.message);
    return;
  }

  if (cloudLogs && cloudLogs.length > 0) {
    const localLogs = await getNutritionLogs(100);
    const localTimestamps = new Set(localLogs.map(l => l.timestamp));

    let newInserts = 0;
    for (const remote of cloudLogs) {
      if (!localTimestamps.has(remote.timestamp)) {
        await addNutritionLog({
          food_name: remote.food_name,
          calories: remote.calories,
          protein: remote.protein,
          carbs: remote.carbs,
          fats: remote.fats,
          fiber: remote.fiber,
          timestamp: remote.timestamp,
          meal_type: remote.meal_type,
          synced: 1
        });
        newInserts++;
      }
    }
    if (newInserts > 0) {
      console.log(`[SyncService] Downloaded ${newInserts} new nutrition logs from cloud.`);
    }
  }
}

/**
 * Bi-directionally sync daily hydration logs.
 */
async function syncHydrationLogs(userId) {
  // 1. Push local unsynced logs
  const unsynced = await getUnsyncedHydrationLogs();
  if (unsynced.length > 0) {
    console.log(`[SyncService] Found ${unsynced.length} unsynced hydration logs. Syncing to cloud...`);
    const rows = unsynced.map(log => ({
      user_id: userId,
      amount_ml: log.amount_ml,
      timestamp: log.timestamp
    }));

    const { error } = await supabase
      .from('hydration_logs')
      .insert(rows);

    if (error) {
      console.error('[SyncService] Failed to upload hydration logs:', error.message);
    } else {
      const ids = unsynced.map(log => log.id);
      await markHydrationLogsSynced(ids);
      console.log(`[SyncService] Successfully synced ${ids.length} hydration logs to cloud.`);
    }
  }

  // 2. Pull down cloud entries
  console.log('[SyncService] Checking for new cloud hydration logs...');
  const { data: cloudLogs, error } = await supabase
    .from('hydration_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[SyncService] Failed to pull cloud hydration logs:', error.message);
    return;
  }

  if (cloudLogs && cloudLogs.length > 0) {
    const localLogs = await getHydrationLogs(100);
    const localTimestamps = new Set(localLogs.map(l => l.timestamp));

    let newInserts = 0;
    for (const remote of cloudLogs) {
      if (!localTimestamps.has(remote.timestamp)) {
        await addHydrationLog(remote.amount_ml, remote.timestamp, 1);
        newInserts++;
      }
    }
    if (newInserts > 0) {
      console.log(`[SyncService] Downloaded ${newInserts} new hydration logs from cloud.`);
    }
  }
}

/**
 * Bi-directionally sync reminders.
 */
async function syncReminders(userId) {
  // 1. Push local unsynced reminders
  const unsynced = await getUnsyncedReminders();
  if (unsynced.length > 0) {
    console.log(`[SyncService] Found ${unsynced.length} unsynced reminders. Syncing to cloud...`);
    for (const rem of unsynced) {
      const { error } = await supabase
        .from('reminders')
        .upsert({
          user_id: userId,
          title: rem.title,
          time: rem.time,
          type: rem.type,
          enabled: rem.enabled === 1,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,title,time' });

      if (error) {
        console.error('[SyncService] Failed to upsert reminder to cloud:', error.message);
      } else {
        await markRemindersSynced([rem.id]);
      }
    }
    console.log('[SyncService] Local reminders successfully synced.');
  }

  // 2. Download cloud entries
  console.log('[SyncService] Checking for cloud reminders...');
  const { data: cloudRems, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('[SyncService] Failed to pull cloud reminders:', error.message);
    return;
  }

  if (cloudRems && cloudRems.length > 0) {
    const localRems = await getReminders();
    
    for (const remote of cloudRems) {
      const match = localRems.find(r => r.title === remote.title && r.time === remote.time);
      if (!match) {
        await addReminder({
          title: remote.title,
          time: remote.time,
          type: remote.type,
          enabled: remote.enabled ? 1 : 0,
          synced: 1
        });
      } else {
        const remoteEnabledInt = remote.enabled ? 1 : 0;
        if (match.enabled !== remoteEnabledInt && match.synced === 1) {
          await updateReminder(match.id, {
            enabled: remoteEnabledInt,
            synced: 1
          });
        }
      }
    }
  }
}

