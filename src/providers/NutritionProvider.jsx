/**
 * NutriVision AI — Nutrition Provider
 */
import React, { createContext, useContext, useCallback } from 'react';
import { lookupNutrition, searchFoods, getAllFoods } from '../services/nutritionService';
import { generateGuidance, answerQuestion } from '../services/guidanceService';

const NutritionContext = createContext(null);

export function NutritionProvider({ children }) {
  const getNutrition = useCallback((itemName) => {
    return lookupNutrition(itemName);
  }, []);

  const getGuidance = useCallback((nutritionData, profile) => {
    return generateGuidance(nutritionData, profile);
  }, []);

  const askQuestion = useCallback((question, nutritionData, profile) => {
    return answerQuestion(question, nutritionData, profile);
  }, []);

  const search = useCallback((query) => {
    return searchFoods(query);
  }, []);

  return (
    <NutritionContext.Provider
      value={{ getNutrition, getGuidance, askQuestion, searchFoods: search, getAllFoods }}
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
