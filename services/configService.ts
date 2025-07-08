declare const chrome: any;

// A small wrapper to handle storage for both chrome extension and web app
const storage = {
    get: (key: string): Promise<{ [key: string]: any }> => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            return chrome.storage.sync.get(key);
        }
        return Promise.resolve({ [key]: localStorage.getItem(key) });
    },
    set: (items: { [key: string]: any }): Promise<void> => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            return chrome.storage.sync.set(items);
        }
        Object.keys(items).forEach(key => {
            localStorage.setItem(key, items[key]);
        });
        return Promise.resolve();
    }
};

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const saveApiKey = async (apiKey: string): Promise<void> => {
    await storage.set({ [API_KEY_STORAGE_KEY]: apiKey });
};

export const getApiKey = async (): Promise<string | null> => {
    const result = await storage.get(API_KEY_STORAGE_KEY);
    return result[API_KEY_STORAGE_KEY] || null;
};
