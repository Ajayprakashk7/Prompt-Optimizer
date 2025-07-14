

import { storage } from './storageService';

const API_KEY_STORAGE_KEY = 'prompt_optimizer_user_api_key';

/**
 * Validates a Google AI API key format
 * @param key The API key string to validate
 * @returns Object with validation result and error message
 */
export const validateApiKey = (key: string): { isValid: boolean; error?: string } => {
    if (!key || key.trim().length === 0) {
        return { isValid: false, error: 'API key is required' };
    }

    if (key.length < 20) {
        return { isValid: false, error: 'API key appears to be too short' };
    }

    if (!key.startsWith('AI')) {
        return { isValid: false, error: 'Google AI API keys should start with "AI"' };
    }

    if (!/^[A-Za-z0-9_-]+$/.test(key)) {
        return { isValid: false, error: 'API key contains invalid characters' };
    }

    return { isValid: true };
};

/**
 * Saves the user's personal Google AI API key to storage.
 * @param key The API key string.
 */
export const saveApiKey = async (key: string): Promise<void> => {
    const validation = validateApiKey(key);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }
    await storage.set(API_KEY_STORAGE_KEY, key.trim());
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

    if (!defaultApiKey || defaultApiKey.includes("YOUR_") || defaultApiKey.includes("PLACEHOLDER")) {
        throw new Error("No API key available. Please set your personal API key in Settings to continue.");
    }

    return defaultApiKey;
};
