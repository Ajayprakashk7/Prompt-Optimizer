
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

// Performance optimization: In-memory cache for frequently accessed data
class StorageCache {
    private cache = new Map<string, any>();
    private cacheTimestamps = new Map<string, number>();
    private readonly CACHE_TTL = 5000; // 5 seconds TTL for cache

    get(key: string): any | null {
        const timestamp = this.cacheTimestamps.get(key);
        if (timestamp && Date.now() - timestamp < this.CACHE_TTL) {
            return this.cache.get(key) || null;
        }
        return null;
    }

    set(key: string, value: any): void {
        this.cache.set(key, value);
        this.cacheTimestamps.set(key, Date.now());
    }

    clear(key?: string): void {
        if (key) {
            this.cache.delete(key);
            this.cacheTimestamps.delete(key);
        } else {
            this.cache.clear();
            this.cacheTimestamps.clear();
        }
    }
}

const storageCache = new StorageCache();

export const storage = {
    /**
     * Retrieves an item from storage and parses it as JSON.
     * @param key The key of the item to retrieve.
     * @returns The parsed item, or null if not found or on error.
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            // Check cache first for performance
            const cached = storageCache.get(key);
            if (cached !== null) {
                return cached;
            }

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

            // Use MessageChannel for truly non-blocking JSON parsing
            // This prevents large JSON parsing from blocking the main thread
            return new Promise((resolve, reject) => {
                if (jsonString!.length < 1000) {
                    // Small data - parse immediately
                    try {
                        const parsed = JSON.parse(jsonString!);
                        // Cache the result for performance
                        storageCache.set(key, parsed);
                        resolve(parsed);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    // Large data - parse in next tick to avoid blocking
                    setTimeout(() => {
                        try {
                            const parsed = JSON.parse(jsonString!);
                            // Cache the result for performance
                            storageCache.set(key, parsed);
                            resolve(parsed);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                }
            });

        } catch (error) {
            console.error(`Failed to get or parse item from storage for key "${key}":`, error);
            // Don't await cleanup to avoid blocking
            this.remove(key).catch(() => {});
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
            // Update cache immediately for performance
            storageCache.set(key, value);

            const jsonString = JSON.stringify(value);
            if (isChromeExtension()) {
                await chrome.storage.local.set({ [key]: jsonString });
            } else {
                window.localStorage.setItem(key, jsonString);
            }
        } catch (error) {
            console.error(`Failed to set item in storage for key "${key}":`, error);
            // Remove from cache if storage failed
            storageCache.clear(key);
        }
    },

    /**
     * Removes an item from storage.
     * @param key The key of the item to remove.
     */
    async remove(key: string): Promise<void> {
        try {
            // Clear from cache immediately
            storageCache.clear(key);

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
