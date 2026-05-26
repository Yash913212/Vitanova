/**
 * NutriVision AI — Supabase Storage Upload Service
 * Safe binary uploads utilizing base64-arraybuffer to bypass standard React Native Blob crashes.
 */
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';

/**
 * Upload a compressed local image file to Supabase Storage.
 * @param {string} localUri - Persistent local file URI (file://...)
 * @param {string} userId - Current authenticated user ID (optional)
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export async function uploadImageToSupabase(localUri, userId = 'guest') {
  if (!localUri) {
    throw new Error('No local image URI provided for upload.');
  }

  try {
    console.log('[Upload Service] Starting upload for:', localUri);

    // 1. Read local file as a Base64 string
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!base64) {
      throw new Error('Failed to read local image file contents as base64.');
    }

    // 2. Decode Base64 to ArrayBuffer (safe for React Native memory & OS bridges)
    const arrayBuffer = decode(base64);

    // 3. Define storage paths (organized by user / guest scope)
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${userId}/${fileName}`;

    console.log(`[Upload Service] Uploading to bucket 'scans' at path: ${filePath}`);

    // 4. Perform upload using Supabase Storage
    const { data, error } = await supabase.storage
      .from('scans')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      // Check if bucket needs creation, or throw directly
      console.error('[Upload Service] Supabase Storage upload error:', error);
      throw error;
    }

    // 5. Get public URL of the uploaded asset
    const { data: urlData } = supabase.storage
      .from('scans')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to retrieve public URL of uploaded asset.');
    }

    console.log('[Upload Service] Image upload successful. Public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('[Upload Service] uploadImageToSupabase failed:', error.message);
    throw error;
  }
}
