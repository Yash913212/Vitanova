/**
 * NutriVision AI — Nutrition Provider (SQLite Powered)
 */
import React, { createContext, useContext, useCallback } from 'react';
import { lookupNutrition, searchFoods, getAllFoods } from '../services/nutritionService.js';
import { generateGuidance, answerQuestion } from '../services/guidanceService.js';

const NutritionContext = createContext(null);

export function NutritionProvider({ children }) {
  // Direct async SQLite lookups
  const getNutrition = useCallback(async (itemName, lang = 'en') => {
    return lookupNutrition(itemName, lang);
  }, []);

  const getGuidance = useCallback((nutritionData, profile) => {
    return generateGuidance(nutritionData, profile);
  }, []);

  const askQuestion = useCallback((question, nutritionData, profile) => {
    return answerQuestion(question, nutritionData, profile);
  }, []);

  const search = useCallback(async (query, lang = 'en') => {
    return searchFoods(query, lang);
  }, []);

  const fetchAll = useCallback(async (lang = 'en') => {
    return getAllFoods(lang);
  }, []);

  return (
    <NutritionContext.Provider
      value={{ 
        getNutrition, 
        getGuidance, 
        askQuestion, 
        searchFoods: search, 
        getAllFoods: fetchAll 
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition() {
  const ctx = useContext(NutritionContext);
  if (!ctx) throw new Error('useNutrition must be used within NutritionProvider');
  return ctx;
}
