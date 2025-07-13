
import { storage } from './storageService';

export interface SavedPrompt {
  id: string;
  title: string;
  category: string;
  prompt: string; // This is the user's original template
  optimizedPrompt?: string; // The AI-optimized version
  createdAt: string;
  variables: Record<string, string>;
}

const HISTORY_KEY = 'prompt_optimizer_history_v3';

export const getHistory = async (): Promise<SavedPrompt[]> => {
  const history = await storage.get<SavedPrompt[]>(HISTORY_KEY);
  return Array.isArray(history) ? history : [];
};

export const saveHistory = async (history: SavedPrompt[]): Promise<void> => {
  await storage.set(HISTORY_KEY, history);
};

export const addPromptToHistory = async (prompt: SavedPrompt): Promise<void> => {
  if (!prompt || !prompt.prompt) return;
  const history = await getHistory();
  // Add to the beginning of the array
  const newHistory = [prompt, ...history];
  await saveHistory(newHistory);
};

export const deletePromptFromHistory = async (id: string): Promise<void> => {
  let history = await getHistory();
  history = history.filter(p => p.id !== id);
  await saveHistory(history);
};
