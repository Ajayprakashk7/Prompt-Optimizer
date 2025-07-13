// Optimized tokenizer worker with lazy loading
// Only load the heavy tokenizer when actually needed

let encode: ((text: string) => number[]) | null = null;

interface WorkerData {
    text: string;
    id: number;
}

self.onmessage = async (e: MessageEvent<WorkerData>) => {
    const { text, id } = e.data;
    try {
        // Lazy load the tokenizer only when first needed
        if (!encode) {
            const { encode: gptEncode } = await import('gpt-tokenizer');
            encode = gptEncode;
        }

        const tokens = encode(text).length;
        self.postMessage({ id, tokens });
    } catch (error) {
        self.postMessage({ id, error: error instanceof Error ? error.message : 'Worker tokenization failed' });
    }
};