type Resolver = (value: number) => void;
type Rejecter = (reason?: any) => void;

class TokenizerService {
    private worker: Worker | null = null;
    private requests: Map<number, { resolve: Resolver, reject: Rejecter }> = new Map();
    private requestId = 0;
    private initializationPromise: Promise<void> | null = null;

    constructor() {
        // Don't initialize worker immediately - wait until first use
    }

    private async createWorker(): Promise<void> {
        try {
            // Use the file-based worker instead of a blob URL worker
            this.worker = new Worker(new URL('../workers/tokenizer.worker.ts', import.meta.url), { type: 'module' });

            this.worker.onmessage = (e: MessageEvent) => {
                const { id, tokens, error } = e.data || {};

                // Validate message structure to prevent memory leaks
                if (typeof id !== 'number' || !this.requests.has(id)) {
                    console.warn('Received invalid or unknown worker message:', e.data);
                    return;
                }

                const request = this.requests.get(id)!;
                this.requests.delete(id); // Always clean up the request

                if (error) {
                    request.reject(new Error(error));
                } else if (typeof tokens === 'number') {
                    request.resolve(tokens);
                } else {
                    request.reject(new Error('Invalid token count received from worker'));
                }
            };

            this.worker.onerror = (e: ErrorEvent) => {
                e.preventDefault();
                const errorMessage = `Tokenizer worker error: ${e.message} (at ${e.filename}:${e.lineno})`;
                console.error(errorMessage, e);

                this.requests.forEach((request) => {
                    request.reject(new Error(errorMessage));
                });
                this.requests.clear();
            };
        } catch (error) {
            console.error("Fatal error during TokenizerService initialization:", error);
            // This rejection will be caught by any subsequent call to calculateTokens.
            throw error;
        }
    }

    public async calculateTokens(text: string): Promise<number> {
        // Lazy initialization - only create worker when first needed
        if (!this.initializationPromise) {
            this.initializationPromise = this.createWorker();
        }

        try {
            // This ensures that we don't try to use the worker before it's ready.
            // If createWorker() failed, its thrown error will be re-thrown here.
            await this.initializationPromise;

            if (!this.worker) {
                throw new Error("Tokenizer worker is not initialized. The service may have failed to start.");
            }

            return new Promise((resolve, reject) => {
                const id = this.requestId++;

                // Set up timeout to prevent hanging promises
                const timeoutId = setTimeout(() => {
                    this.requests.delete(id);
                    reject(new Error("Token calculation timed out after 10 seconds"));
                }, 10000);

                this.requests.set(id, {
                    resolve: (value: number) => {
                        clearTimeout(timeoutId);
                        resolve(value);
                    },
                    reject: (error: any) => {
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                });

                this.worker!.postMessage({ text, id });
            });
        } catch (error) {
            // If worker initialization fails, clean up any pending requests
            this.requests.forEach((request) => {
                request.reject(new Error("Tokenizer service initialization failed"));
            });
            this.requests.clear();
            throw error;
        }
    }

    /**
     * Cleanup method to properly terminate the worker and reject pending requests
     */
    public cleanup(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

        // Reject all pending requests
        this.requests.forEach((request) => {
            request.reject(new Error("TokenizerService is being cleaned up"));
        });
        this.requests.clear();

        // Reset initialization promise
        this.initializationPromise = null;
    }
}

// Export a singleton instance.
// The app will use this single instance throughout its lifecycle.
export const tokenizerService = new TokenizerService();
