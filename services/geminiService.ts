
import { GoogleGenAI } from "@google/genai";
import { META_PROMPT } from '../constants';
import { getApiKey } from './configService';
import { canUseBuiltInAPI, incrementUsage } from './usageService';

// Built-in API key (from environment)
const BUILT_IN_API_KEY = 'AIzaSyBCfA7krqvnaZgPLhusQVaw2X2HokXcW90';

export const optimizePrompt = async (userInput: string, vibe: string, persona: string): Promise<string> => {
    let apiKey = await getApiKey();
    let usingBuiltInAPI = false;
    
    // If no user API key, check if we can use built-in API
    if (!apiKey) {
        const canUseBuiltIn = await canUseBuiltInAPI();
        if (canUseBuiltIn) {
            apiKey = BUILT_IN_API_KEY;
            usingBuiltInAPI = true;
        } else {
            throw new Error(`Daily limit reached! You've used all 3 free optimizations today. Add your own Gemini API key in Settings for unlimited usage.`);
        }
    }
    
    if (!apiKey) {
        throw new Error("API key not found. Please set it in the settings.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    try {
        const userRequest = `
## USER'S RAW PROMPT:
\`\`\`
${userInput}
\`\`\`

## REQUESTED PERSONA:
${persona}

## REQUESTED VIBE:
${vibe}
    `;

        const fullPrompt = `${META_PROMPT}\n\n${userRequest.trim()}`;

        // Use correct API structure for @google/genai package
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{
                role: "user",
                parts: [{ text: fullPrompt }]
            }]
        });
        
        // Clean up potential markdown code block fences
        let text = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        const fenceRegex = /^```(\w*\s*)?\n?(.*?)\n?\s*```$/s;
        const match = text.match(fenceRegex);
        if (match && match[2]) {
            text = match[2].trim();
        }

        // If we used the built-in API, increment the usage counter
        if (usingBuiltInAPI) {
            await incrementUsage();
        }

        return text;

    } catch (error) {
        // Avoid logging full error objects that might contain sensitive data
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error calling Gemini API - sanitized:", { 
            type: error instanceof Error ? error.constructor.name : typeof error,
            message: errorMessage.substring(0, 200) // Limit message length
        });
        
        if (error instanceof Error) {
            // Check for common API key-related errors
            if (error.message.includes('API_KEY_INVALID') || error.message.includes('permission')) {
                throw new Error(`Your API key is invalid or lacks permissions. Please check it in Settings.`);
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while communicating with the Gemini API.");
    }
};
