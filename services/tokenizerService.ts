type Resolver = (value: number) => void;
type Rejecter = (reason?: any) => void;

// Lightweight tokenizer service using approximation instead of heavy library
class LightweightTokenizerService {
    constructor() {
        // No heavy dependencies to load
    }

    public async calculateTokens(text: string): Promise<number> {
        // Use a lightweight approximation algorithm instead of the heavy gpt-tokenizer
        return this.approximateTokenCount(text);
    }

    private approximateTokenCount(text: string): number {
        if (!text || text.trim().length === 0) return 0;

        // GPT tokenization approximation algorithm
        // This is much more accurate than simple word counting

        // 1. Handle whitespace and basic splitting
        const words = text.trim().split(/\s+/);
        let tokenCount = 0;

        for (const word of words) {
            // 2. Handle punctuation and special characters
            const cleanWord = word.replace(/[^\w]/g, '');

            if (cleanWord.length === 0) {
                // Pure punctuation/symbols typically count as 1 token each
                tokenCount += word.length;
            } else if (cleanWord.length <= 4) {
                // Short words are usually 1 token
                tokenCount += 1;
            } else if (cleanWord.length <= 8) {
                // Medium words are usually 1-2 tokens
                tokenCount += Math.ceil(cleanWord.length / 4);
            } else {
                // Long words are broken into subword tokens
                tokenCount += Math.ceil(cleanWord.length / 3);
            }

            // Add tokens for punctuation/symbols
            const punctuation = word.replace(/\w/g, '');
            tokenCount += punctuation.length;
        }

        // 3. Add some overhead for special tokens and encoding
        const overhead = Math.ceil(tokenCount * 0.1);

        return tokenCount + overhead;
    }

    public cleanup(): void {
        // Nothing to cleanup for lightweight service
    }
}

// Removed worker-based service - using lightweight approximation instead

// Optimized tokenizer service using lightweight approximation
// No heavy dependencies - fast and efficient for Chrome extension
class OptimizedTokenizerService {
    private lightweightService = new LightweightTokenizerService();

    public async calculateTokens(text: string): Promise<number> {
        // Use lightweight approximation - accurate enough for UI purposes
        // and eliminates the 2MB+ gpt-tokenizer dependency
        return this.lightweightService.calculateTokens(text);
    }

    public cleanup(): void {
        this.lightweightService.cleanup();
    }
}

// Export a singleton instance that uses the optimized lightweight service
export const tokenizerService = new OptimizedTokenizerService();
