/**
 * NutriVision AI — Secure Configuration Loader
 * Reads environment variables / constants. Never hardcodes secrets.
 */

import Constants from 'expo-constants';
import { AI_CONFIG } from './constants';

/**
 * Get the OpenRouter API key from environment.
 * Checks expo-constants extra, then process.env fallback.
 */
export function getApiKey() {
  // Expo SDK 49+ loads EXPO_PUBLIC_* env vars into process.env at build time
  if (process.env.EXPO_PUBLIC_OPENROUTER_API_KEY) {
    return process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  }

  // Fallback: try Expo Constants extra
  const extra = Constants.expoConfig?.extra;
  if (extra?.openRouterApiKey) {
    return extra.openRouterApiKey;
  }

  return null;
}

/**
 * Get the full API configuration.
 */
export function getAIConfig() {
  return {
    apiKey: getApiKey(),
    apiUrl: AI_CONFIG.API_URL,
    visionModel: AI_CONFIG.VISION_MODEL,
    chatModel: AI_CONFIG.CHAT_MODEL,
    timeoutMs: AI_CONFIG.TIMEOUT_MS,
    maxTokensVision: AI_CONFIG.MAX_TOKENS_VISION,
    maxTokensChat: AI_CONFIG.MAX_TOKENS_CHAT,
  };
}

/**
 * Check whether the API is configured (key is present).
 */
export function isAPIConfigured() {
  const key = getApiKey();
  return key !== null && key !== '' && key !== 'your_openrouter_api_key_here';
}
