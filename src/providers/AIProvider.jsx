/**
 * VitaNova AI — AI Provider
 * Now with graceful offline fallback — never hard-blocks.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { recognizeImage, chatWithAI, AIError, analyzeFoodImageAndGenerateInsights } from '../services/aiService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { generateRAGResponse } from '../services/rag/ragService';

const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState(null);
  const network = useNetworkStatus();

  // isOnline checks both connected AND internet reachable
  const isOnline = network.isConnected && network.isInternetReachable;

  const recognizeFood = useCallback(async (base64Image, profile = null, settings = null) => {
    setIsProcessing(true);
    setLastError(null);
    try {
      const result = await analyzeFoodImageAndGenerateInsights(base64Image, profile, settings, isOnline);
      return result;
    } catch (error) {
      setLastError(error.message);
      // Re-throw with an offline hint so caller can fallback
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        throw new AIError(
          'Could not reach AI server. Showing offline data if available.',
          'OFFLINE_FALLBACK'
        );
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isOnline]);

  const chat = useCallback(async (messages, context = {}) => {
    setIsProcessing(true);
    setLastError(null);
    try {
      const userMessage = messages[messages.length - 1]?.content || '';
      const chatHistory = messages.slice(0, -1);

      const result = await generateRAGResponse(
        userMessage,
        {
          profile: context.profile,
          language: context.language || 'en',
          chatHistory,
          scannedFood: context.scannedFood,
        },
        isOnline
      );

      return result.response;
    } catch (error) {
      setLastError(error.message);
      throw new AIError(
        error.message || 'AI unavailable',
        error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT' || error.code === 'OFFLINE_FALLBACK'
          ? 'OFFLINE_FALLBACK'
          : error.code || 'API_ERROR'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [isOnline]);

  return (
    <AIContext.Provider
      value={{ recognizeFood, chat, isProcessing, lastError, isOnline }}
    >
      {children}
    </AIContext.Provider>
  );
}

function buildSystemPrompt(context) {
  let prompt = `You are VitaNova AI, a friendly nutrition and health assistant. Keep responses concise (2-3 sentences), conversational, and voice-friendly. Focus on nutrition, health, and dietary advice.`;

  if (context.languageInstruction) {
    prompt += context.languageInstruction;
  }
  if (context.currentFood) {
    prompt += `\nThe user recently scanned: ${context.currentFood}.`;
  }
  if (context.profile) {
    const p = context.profile;
    if (p.fitnessGoal) prompt += `\nUser's goal: ${p.fitnessGoal.replace('_', ' ')}.`;
    if (p.dietPreference && p.dietPreference !== 'no_preference') {
      prompt += `\nDiet: ${p.dietPreference.replace('_', ' ')}.`;
    }
  }
  if (context.nutritionData) {
    prompt += `\nNutrition data available: ${context.nutritionData.calories} kcal, ${context.nutritionData.protein}g protein.`;
  }

  return prompt;
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
}
