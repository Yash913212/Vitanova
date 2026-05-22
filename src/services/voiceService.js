/**
 * NutriVision AI — Voice Service (TTS + STT)
 */
import * as Speech from 'expo-speech';
import { LANGUAGES } from '../utils/constants';

let isSpeakingNow = false;

/**
 * Speak text aloud using expo-speech.
 */
export async function speak(text, languageCode = 'en') {
  if (!text) return;

  try {
    // Stop any current speech
    await stop();

    const lang = LANGUAGES.find((l) => l.code === languageCode);
    const ttsCode = lang?.ttsCode || 'en-US';

    isSpeakingNow = true;
    Speech.speak(text, {
      language: ttsCode,
      pitch: 1.0,
      rate: 0.9,
      onDone: () => { isSpeakingNow = false; },
      onError: () => { isSpeakingNow = false; },
      onStopped: () => { isSpeakingNow = false; },
    });
  } catch (e) {
    console.error('Voice speak error:', e);
    isSpeakingNow = false;
  }
}

/**
 * Stop speech.
 */
export async function stop() {
  try {
    Speech.stop();
    isSpeakingNow = false;
  } catch (e) {
    console.error('Voice stop error:', e);
  }
}

/**
 * Check if currently speaking.
 */
export function isSpeaking() {
  return isSpeakingNow;
}

/**
 * Check if STT is available.
 * For now returns false — STT requires @react-native-voice/voice + dev client.
 */
export function isSTTAvailable() {
  return false;
}

/**
 * Get available TTS voices (languages).
 */
export async function getAvailableVoices() {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices;
  } catch (e) {
    console.error('getAvailableVoices error:', e);
    return [];
  }
}
