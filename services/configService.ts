

import { storage } from './storageService';

const API_KEY_STORAGE_KEY = 'prompt_optimizer_user_api_key';

/**
 * Saves the user's personal Google AI API key to storage.
 * @param key The API key string.
 */
export const saveApiKey = async (key: string): Promise<void> => {
    await storage.set(API_KEY_STORAGE_KEY, key);
};

/**
 * Retrieves the user's personal Google AI API key from storage.
 * @returns The stored API key, or null if not found.
 */
export const getApiKey = async (): Promise<string | null> => {
    return await storage.get<string>(API_KEY_STORAGE_KEY);
};

/**
 * Clears the user's personal Google AI API key from storage.
 */
export const clearApiKey = async (): Promise<void> => {
    await storage.remove(API_KEY_STORAGE_KEY);
};

/**
 * Checks if a personal API key is currently stored.
 * @returns True if a personal API key exists, false otherwise.
 */
export const hasPersonalApiKey = async (): Promise<boolean> => {
    const key = await getApiKey();
    return !!key;
};

/**
 * Gets the currently active API key.
 * Prefers the user's personal key, but falls back to the shared,
 * built-in key if a personal one is not set.
 * @returns The active API key string.
 * @throws {Error} if no API key is available (neither personal nor shared).
 */
export const getActiveApiKey = async (): Promise<string> => {
    const personalKey = await getApiKey();
    if (personalKey) {
        return personalKey;
    }

    // Built-in API key for shared usage with daily limits
    const defaultApiKey = "AIzaSyBCfA7krqvnaZgPLhusQVaw2X2HokXcW90";

    if (!defaultApiKey || defaultApiKey === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error("No API key available. Please set your personal API key in Settings to continue.");
    }

    return defaultApiKey;
};
