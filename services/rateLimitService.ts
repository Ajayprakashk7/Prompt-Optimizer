
import { storage } from './storageService';

const USAGE_STORAGE_KEY = 'prompt_optimizer_usage_v1';
export const DAILY_RATE_LIMIT = 5;

export interface DailyUsage {
    count: number;
    date: string; // YYYY-MM-DD format
}

/**
 * Gets the current date as a string in YYYY-MM-DD format using local timezone.
 * This ensures consistent daily rate limiting regardless of user's timezone.
 */
const getTodayString = (): string => {
    const today = new Date();
    // Use local timezone instead of UTC to ensure consistent daily resets
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Retrieves the user's daily usage statistics from storage.
 * Resets the count if the stored date is not today.
 * @returns The daily usage object.
 */
export const getUsage = async (): Promise<DailyUsage> => {
    const today = getTodayString();
    const usage = await storage.get<DailyUsage>(USAGE_STORAGE_KEY);
    
    // If the stored date is today, return it
    if (usage && usage.date === today) {
        return usage;
    }
    
    // Otherwise, return a reset value for today
    return { count: 0, date: today };
};

/**
 * Saves the user's daily usage statistics to storage.
 * @param usage The daily usage object to save.
 */
const saveUsage = async (usage: DailyUsage): Promise<void> => {
    await storage.set(USAGE_STORAGE_KEY, usage);
};

/**
 * Records a single request, incrementing the daily usage count.
 */
export const recordRequest = async (): Promise<void> => {
    const usage = await getUsage();
    usage.count += 1;
    await saveUsage(usage);
};

/**
 * Checks if the user has exceeded the daily rate limit for the free tier.
 * @returns True if the user is rate-limited, false otherwise.
 */
export const isRateLimited = async (): Promise<boolean> => {
    const usage = await getUsage();
    return usage.count >= DAILY_RATE_LIMIT;
};

/**
 * Gets the number of remaining requests for the free tier today.
 * @returns The number of requests left.
 */
export const getRemainingRequests = async (): Promise<number> => {
    const usage = await getUsage();
    const remaining = DAILY_RATE_LIMIT - usage.count;
    return Math.max(0, remaining);
};
