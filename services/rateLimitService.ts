
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

/**
 * Gets detailed rate limit information including reset time
 * @returns Rate limit status with reset information
 */
export const getRateLimitStatus = async (): Promise<{
    isLimited: boolean;
    remaining: number;
    total: number;
    resetTime: Date;
    hoursUntilReset: number;
}> => {
    const usage = await getUsage();
    const isLimited = usage.count >= DAILY_RATE_LIMIT;
    const remaining = Math.max(0, DAILY_RATE_LIMIT - usage.count);

    // Calculate reset time (next midnight)
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0);

    const hoursUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60));

    return {
        isLimited,
        remaining,
        total: DAILY_RATE_LIMIT,
        resetTime,
        hoursUntilReset
    };
};

/**
 * Enhanced rate limit error with helpful information
 */
export class RateLimitError extends Error {
    constructor(message: string, public resetTime?: Date, public remaining?: number) {
        super(message);
        this.name = 'RateLimitError';
    }
}

/**
 * Checks and reserves a rate limit slot, throwing detailed error if exceeded
 * @throws RateLimitError with helpful information
 */
export const checkAndReserveRateLimit = async (): Promise<void> => {
    const status = await getRateLimitStatus();

    if (status.isLimited) {
        throw new RateLimitError(
            `Daily limit of ${status.total} requests exceeded. ` +
            `Limit resets in ${status.hoursUntilReset} hours. ` +
            `Consider using your own API key for unlimited access.`,
            status.resetTime,
            status.remaining
        );
    }

    // Reserve the slot
    await recordRequest();
};
