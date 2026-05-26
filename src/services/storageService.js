/**
 * VitaNova AI — AsyncStorage Wrapper Service
 * Supports user-scoped keys for multi-account data isolation.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getData(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('StorageService getData error:', e);
    return null;
  }
}

export async function setData(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('StorageService setData error:', e);
    return false;
  }
}

export async function removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error('StorageService removeData error:', e);
    return false;
  }
}

/**
 * Build a user-scoped storage key.
 * e.g. getUserKey('@vitanova_profile', 'user@example.com')
 *      => '@vitanova_profile__user@example.com'
 * Falls back to the base key if no userEmail is provided.
 */
export function getUserKey(baseKey, userEmail) {
  if (!userEmail) return baseKey;
  return `${baseKey}__${userEmail.toLowerCase().trim()}`;
}
