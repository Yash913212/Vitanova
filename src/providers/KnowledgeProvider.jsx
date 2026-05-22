/**
 * NutriVision AI — Knowledge Provider
 * Global React context provider for managing retrieval states and scanned food memory.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { retrieveKnowledge } from '../services/rag/retriever';

const KnowledgeContext = createContext(null);

export function KnowledgeProvider({ children }) {
  const [currentScannedFood, setCurrentScannedFoodState] = useState(null);
  const [lastRetrieval, setLastRetrieval] = useState([]);

  /**
   * Query the local RAG knowledge base.
   * Saves retrieval in state and returns the localized documents.
   */
  const queryKnowledge = useCallback((query, options = {}) => {
    try {
      const results = retrieveKnowledge(query, options);
      setLastRetrieval(results);
      return results;
    } catch (err) {
      console.error('[KnowledgeProvider] Error retrieving knowledge:', err);
      return [];
    }
  }, []);

  /**
   * Set the active scanned food context for conversational RAG memory.
   */
  const setScannedFood = useCallback((foodItem) => {
    setCurrentScannedFoodState(foodItem);
  }, []);

  /**
   * Clear active scanned food context.
   */
  const clearScannedFood = useCallback(() => {
    setCurrentScannedFoodState(null);
  }, []);

  return (
    <KnowledgeContext.Provider
      value={{
        currentScannedFood,
        setScannedFood,
        clearScannedFood,
        queryKnowledge,
        lastRetrieval
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

/**
 * Hook to consume the KnowledgeContext.
 */
export function useKnowledge() {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return ctx;
}
