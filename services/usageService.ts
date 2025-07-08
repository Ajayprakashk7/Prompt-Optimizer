// Service to track daily usage of the built-in API
declare const chrome: any;

export interface UsageData {
  date: string;
  count: number;
}

const USAGE_STORAGE_KEY = 'daily_usage';
const DAILY_LIMIT = 3;

// Storage wrapper that works for both extension and web app
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

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const getTodaysUsage = async (): Promise<number> => {
  const today = getTodayDateString();
  const result = await storage.get(USAGE_STORAGE_KEY);
  const usageDataStr = result[USAGE_STORAGE_KEY];
  
  if (!usageDataStr) {
    return 0;
  }

  try {
    const usageData: UsageData = JSON.parse(usageDataStr);
    // If it's a different day, reset the count
    if (usageData.date !== today) {
      return 0;
    }
    return usageData.count;
  } catch {
    return 0;
  }
};

export const incrementUsage = async (): Promise<number> => {
  const today = getTodayDateString();
  const currentUsage = await getTodaysUsage();
  const newUsage = currentUsage + 1;
  
  const usageData: UsageData = {
    date: today,
    count: newUsage
  };
  
  await storage.set({ [USAGE_STORAGE_KEY]: JSON.stringify(usageData) });
  return newUsage;
};

export const canUseBuiltInAPI = async (): Promise<boolean> => {
  const usage = await getTodaysUsage();
  return usage < DAILY_LIMIT;
};

export const getRemainingUsage = async (): Promise<number> => {
  const usage = await getTodaysUsage();
  return Math.max(0, DAILY_LIMIT - usage);
};

export const getDailyLimit = (): number => {
  return DAILY_LIMIT;
};
