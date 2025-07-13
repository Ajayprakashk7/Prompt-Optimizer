
declare const chrome: any;

const isChromeExtension = (): boolean => {
    return (
        typeof chrome !== 'undefined' &&
        chrome.runtime &&
        chrome.runtime.id &&
        chrome.storage &&
        chrome.storage.local
    );
};

export const storage = {
    /**
     * Retrieves an item from storage and parses it as JSON.
     * @param key The key of the item to retrieve.
     * @returns The parsed item, or null if not found or on error.
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            let jsonString: string | null = null;
            if (isChromeExtension()) {
                const result = await chrome.storage.local.get(key);
                jsonString = result[key] || null;
            } else {
                jsonString = window.localStorage.getItem(key);
            }
            if (!jsonString) {
                return null;
            }
            
            // By wrapping the synchronous, potentially blocking JSON.parse in a resolved promise's .then(),
            // we defer its execution into a microtask. This allows the main thread to complete its
            // current work (like the initial UI render) before this potentially long-running task executes,
            // preventing the UI from freezing on startup when parsing large history files.
            return Promise.resolve().then(() => JSON.parse(jsonString!));

        } catch (error) {
            console.error(`Failed to get or parse item from storage for key "${key}":`, error);
            // Attempt to clean up corrupted data to prevent future errors
            await this.remove(key);
            return null;
        }
    },

    /**
     * Saves an item to storage by serializing it to a JSON string.
     * @param key The key under which to store the item.
     * @param value The value to store. It will be JSON.stringified.
     */
    async set(key: string, value: any): Promise<void> {
        try {
            const jsonString = JSON.stringify(value);
            if (isChromeExtension()) {
                await chrome.storage.local.set({ [key]: jsonString });
            } else {
                window.localStorage.setItem(key, jsonString);
            }
        } catch (error) {
            console.error(`Failed to set item in storage for key "${key}":`, error);
        }
    },

    /**
     * Removes an item from storage.
     * @param key The key of the item to remove.
     */
    async remove(key: string): Promise<void> {
        try {
            if (isChromeExtension()) {
                await chrome.storage.local.remove(key);
            } else {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Failed to remove item from storage for key "${key}":`, error);
        }
    }
};
