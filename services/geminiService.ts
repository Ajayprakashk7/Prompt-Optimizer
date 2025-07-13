
import { GoogleGenAI, Type } from "@google/genai";
import { META_PROMPT_ENGINE } from '../constants';
import * as configService from './configService';
import * as rateLimitService from './rateLimitService';

/**
 * A custom error to indicate that the user has hit the daily free tier rate limit.
 */
export class RateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RateLimitError';
    }
}

const model = "gemini-2.5-flash";

const getClient = async () => {
    try {
        const apiKey = await configService.getActiveApiKey();
        return new GoogleGenAI({ apiKey });
    } catch (error) {
        // This will be caught by the UI and a specific message will be shown
        throw new Error("API key is not available. Please set your key in the settings.");
    }
};

const checkAndReserveRateLimit = async () => {
    // Only check rate limit if the user is on the shared (free) key
    const isPersonal = await configService.hasPersonalApiKey();
    if (!isPersonal) {
        if (await rateLimitService.isRateLimited()) {
            throw new RateLimitError(`You have reached the daily limit of ${rateLimitService.DAILY_RATE_LIMIT} requests for the free tier. Please add your own API key in Settings to continue.`);
        }
        // Immediately reserve a slot to prevent race conditions
        await rateLimitService.recordRequest();
    }
};

const recordUsage = async () => {
    // Only record usage if the user is on the shared (free) key
    const isPersonal = await configService.hasPersonalApiKey();
    if (!isPersonal) {
        await rateLimitService.recordRequest();
    }
};


export const organizePrompt = async (prompt: string): Promise<{ title: string, category: string }> => {
    await checkAndReserveRateLimit();
    const ai = await getClient();
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Analyze the following prompt and return a concise title and a general category for it.

PROMPT:
---
${prompt}
---
`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "A concise, descriptive title for the prompt (max 5 words)."
                        },
                        category: {
                            type: Type.STRING,
                            description: "A single, relevant category from a general list such as: Software Development, Data Science, Creative Writing, Business, Marketing, Cybersecurity, Education, Productivity, etc."
                        }
                    },
                    required: ["title", "category"]
                },
            },
        });
        
        const rawText = response.text ? response.text.trim() : '';
        let jsonString = '';
        
        // The model can be "chatty". First, try to find a markdown JSON block.
        const markdownMatch = rawText.match(/```json\n([\s\S]*?)\n```/);

        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1];
        } else {
            // If no markdown block, fall back to finding the first and last curly braces.
            const firstBrace = rawText.indexOf('{');
            const lastBrace = rawText.lastIndexOf('}');

            if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
                 throw new Error("Could not find a valid JSON object in the API response.");
            }
            jsonString = rawText.substring(firstBrace, lastBrace + 1);
        }

        try {
            const parsed = JSON.parse(jsonString);

            // Validate the structure of the parsed object
            if (typeof parsed.title === 'string' && typeof parsed.category === 'string') {
                // Usage was already recorded when we reserved the rate limit slot
                return parsed;
            } else {
                throw new Error("Parsed JSON does not match the expected schema.");
            }
        } catch (e) {
            console.error("Failed to parse or validate JSON response:", e, "Raw response:", jsonString);
            throw new Error("Received an invalid or malformed JSON response from the API for organization.");
        }
    } catch (error) {
        console.error("Error organizing prompt:", error);
        // Rethrow original RateLimitError if that was the cause
        if (error instanceof RateLimitError) throw error;
        // Otherwise, throw the new or existing error
        throw error instanceof Error ? error : new Error("An unexpected error occurred during prompt organization.");
    }
};

export async function* optimizePrompt(userInput: string, mode: string): AsyncGenerator<string, void, unknown> {
    await checkAndReserveRateLimit();
    const ai = await getClient();

    const userRequest = `
## USER'S RAW PROMPT:
\`\`\`
${userInput}
\`\`\`

## REQUESTED MODE:
${mode}
    `;

    const fullPrompt = `${META_PROMPT_ENGINE}\n\n${userRequest.trim()}`;

    try {
        const response = await ai.models.generateContentStream({
            model: model,
            contents: fullPrompt,
        });
        
        let fullResponse = '';
        for await (const chunk of response) {
            const text = chunk.text;
            if (typeof text === 'string' && text.length > 0) {
                yield text;
                fullResponse += text;
            }
        }

        // Usage was already recorded when we reserved the rate limit slot
        // No need to record again

    } catch (error) {
        console.error("An unexpected error occurred while optimizing the prompt:", error);
        throw new Error(`Failed to optimize prompt: ${error instanceof Error ? error.message : String(error)}`);
    }
};