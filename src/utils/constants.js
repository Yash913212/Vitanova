/**
 * VitaNova AI — Application Constants
 */

// AsyncStorage keys
export const STORAGE_KEYS = {
  SETTINGS: '@vitanova_settings',
  PROFILE: '@vitanova_profile',
  HISTORY: '@vitanova_history',
  CHAT_MESSAGES: '@vitanova_chat',
  AUTH: '@vitanova_auth',
};

// Supported languages
export const LANGUAGES = [
  { code: 'en', label: 'English', ttsCode: 'en-US', sttCode: 'en-US' },
  { code: 'hi', label: 'Hindi', ttsCode: 'hi-IN', sttCode: 'hi-IN' },
  { code: 'te', label: 'Telugu', ttsCode: 'te-IN', sttCode: 'te-IN' },
];

// Fitness goals
export const FITNESS_GOALS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'maintenance', label: 'Maintenance' },
];

// Diet preferences
export const DIET_PREFERENCES = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'non_veg', label: 'Non-Vegetarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'no_preference', label: 'No Preference' },
];

// Gender options
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_say', label: 'Prefer not to say' },
];

// Default settings
export const DEFAULT_SETTINGS = {
  autoTTS: false,
  ttsLanguage: 'en',
  sttLanguage: 'en',
  theme: 'light',
};

// Default profile
export const DEFAULT_PROFILE = {
  name: '',
  email: '',
  nickname: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  fitnessGoal: 'maintenance',
  dietPreference: 'no_preference',
  preferredLanguage: 'en',
};

// AI config
export const AI_CONFIG = {
  VISION_MODEL: 'meta-llama/llama-4-maverick',
  CHAT_MODEL: 'meta-llama/llama-4-maverick',
  API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  TIMEOUT_MS: 20000,
  MAX_TOKENS_VISION: 500,
  MAX_TOKENS_CHAT: 400,
};

// Confidence levels
export const CONFIDENCE_LEVELS = {
  HIGH: { min: 0.75, label: 'High', color: '#10B981' },
  MEDIUM: { min: 0.4, label: 'Medium', color: '#F59E0B' },
  LOW: { min: 0, label: 'Low', color: '#EF4444' },
};

// Tab icons (using emoji as simple icons)
export const TAB_ICONS = {
  scan: '📷',
  assistant: '🤖',
  history: '📋',
  settings: '⚙️',
};

// Duplicate detection window (ms)
export const DUPLICATE_WINDOW_MS = 30000;
