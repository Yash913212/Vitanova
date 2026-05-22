/**
 * NutriVision AI — Utility Helpers
 */

import * as FileSystem from 'expo-constants';

/**
 * Generate a unique ID.
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Format a timestamp to a readable string.
 */
export function formatTimestamp(ts) {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Truncate text to a max length.
 */
export function truncateText(text, maxLen = 100) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

/**
 * Capitalize first letter.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Simple fuzzy match — checks if query words appear in target.
 * Returns a score 0–1.
 */
export function fuzzyMatch(query, target) {
  if (!query || !target) return 0;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (t === q) return 1;
  if (t.includes(q)) return 0.9;
  if (q.includes(t)) return 0.8;

  const qWords = q.split(/\s+/);
  const matched = qWords.filter((w) => t.includes(w));
  return matched.length / qWords.length * 0.7;
}

/**
 * Convert an image URI to base64 string.
 * Uses fetch + blob reader for cross-platform compatibility.
 */
export async function imageToBase64(uri) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('imageToBase64 error:', error);
    throw new Error('Failed to convert image to base64');
  }
}

/**
 * Get confidence level info.
 */
export function getConfidenceLevel(score) {
  if (score >= 0.75) return { label: 'High', color: '#10B981' };
  if (score >= 0.4) return { label: 'Medium', color: '#F59E0B' };
  return { label: 'Low', color: '#EF4444' };
}

/**
 * Delay utility.
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse.
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
