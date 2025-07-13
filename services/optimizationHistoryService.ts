
import { storage } from './storageService';

export interface OptimizationHistoryEntry {
  id: string;
  rawPrompt: string;
  optimizedPrompt: string;
  variables: Record<string, string>;
  mode: string;
  createdAt: string;
}

const HISTORY_KEY = 'prompt_optimizer_optimization_history_v1';

export const getOptimizationHistory = async (): Promise<OptimizationHistoryEntry[]> => {
  const history = await storage.get<OptimizationHistoryEntry[]>(HISTORY_KEY);
  // Sort by date descending (newest first) upon retrieval for consistent ordering
  if (Array.isArray(history)) {
      return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return [];
};

const saveOptimizationHistory = async (history: OptimizationHistoryEntry[]): Promise<void> => {
  await storage.set(HISTORY_KEY, history);
};

export const addOptimizationHistoryEntry = async (entry: Omit<OptimizationHistoryEntry, 'id' | 'createdAt'>): Promise<void> => {
  if (!entry || !entry.rawPrompt || !entry.optimizedPrompt) return;
  
  const history = await getOptimizationHistory();
  
  const newEntry: OptimizationHistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    createdAt: new Date().toISOString(),
  };

  // Add to the beginning of the array
  const newHistory = [newEntry, ...history];
  await saveOptimizationHistory(newHistory);
};

export const deleteOptimizationHistoryEntry = async (id: string): Promise<void> => {
  let history = await getOptimizationHistory();
  history = history.filter(p => p.id !== id);
  await saveOptimizationHistory(history);
};

export const clearOptimizationHistory = async (): Promise<void> => {
  await storage.remove(HISTORY_KEY);
};
