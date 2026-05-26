/**
 * NutriVision AI — Background Upload Sync Hook
 * Detects online status and processes SQLite pending_uploads queue.
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useHistory } from '../providers/HistoryProvider';
import { useAuth } from '../providers/AuthProvider';
import {
  getPendingUploads,
  deletePendingUpload,
  incrementRetryCount,
} from '../services/sqlite/database';
import { uploadImageToSupabase } from '../services/uploadService';

export function useUploadSync() {
  const { isConnected } = useNetworkStatus();
  const { updateEntryImageUri } = useHistory();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const syncInProgress = useRef(false);

  /**
   * Process all outstanding offline-queued uploads.
   */
  const processQueue = useCallback(async () => {
    if (syncInProgress.current || !isConnected) return;
    syncInProgress.current = true;

    try {
      console.log('[Sync Queue] Wake-up: checking pending uploads in SQLite...');
      const pendingItems = await getPendingUploads();
      
      if (pendingItems.length === 0) {
        console.log('[Sync Queue] Queue is clean. Zero pending uploads.');
        syncInProgress.current = false;
        return;
      }

      console.log(`[Sync Queue] Processing ${pendingItems.length} pending uploads...`);

      for (const item of pendingItems) {
        // Skip items that have repeatedly failed to prevent burning battery/bandwidth
        if (item.retry_count >= 5) {
          console.warn(`[Sync Queue] Skipping upload ID ${item.id} because retry count (${item.retry_count}) >= 5.`);
          continue;
        }

        try {
          console.log(`[Sync Queue] Syncing file: ${item.local_uri}`);
          
          // 1. Upload compressed local image persistently
          const publicUrl = await uploadImageToSupabase(item.local_uri, userId);

          // 2. Update existing entries in the user history with the live Supabase storage URL
          await updateEntryImageUri(item.local_uri, publicUrl);

          // 3. Delete synced item from the SQLite queue upon complete success
          await deletePendingUpload(item.id);
        } catch (uploadError) {
          console.error(`[Sync Queue] Error syncing upload ID ${item.id}:`, uploadError.message);
          
          // Increment retry attempt
          await incrementRetryCount(item.id);
        }
      }
    } catch (error) {
      console.error('[Sync Queue] Sync loop failed:', error);
    } finally {
      syncInProgress.current = false;
      console.log('[Sync Queue] Background upload sync processor finished.');
    }
  }, [isConnected, userId, updateEntryImageUri]);

  // Trigger whenever connectivity goes back to online
  useEffect(() => {
    if (isConnected) {
      processQueue();
    }
  }, [isConnected, processQueue]);

  return { processQueue };
}
export default useUploadSync;
