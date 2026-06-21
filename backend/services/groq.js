import Groq from 'groq-sdk';

let groqClient = null;

export const getGroq = () => {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({ 
            apiKey: process.env.GROQ_API_KEY,
            maxRetries: 2,
            timeout: 30000 // 30s timeout
        });
    }
    return groqClient;
};

/**
 * Sleep helper for retry delays.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Resilient wrapper that retries Groq API calls on failure with exponential backoff.
 * Handles rate limits (429), server errors (500/502/503), and connection issues.
 */
const resilientCall = async (fn, maxRetries = 3) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const status = error?.status || error?.statusCode || error?.error?.status_code;
            const isRetryable = 
                status === 429 ||   // Rate limited
                status === 503 ||   // Service unavailable
                status === 502 ||   // Bad gateway
                status === 500 ||   // Internal server error
                error.code === 'ECONNRESET' ||
                error.code === 'ETIMEDOUT' ||
                error.code === 'ENOTFOUND' ||
                error.message?.includes('Connection error') ||
                error.message?.includes('fetch failed') ||
                error.message?.includes('ECONNREFUSED');

            if (!isRetryable || attempt === maxRetries) {
                console.error(`[Groq] Failed after ${attempt} attempt(s):`, error.message || error);
                throw error;
            }

            // Exponential backoff: 2s, 4s, 8s (with jitter)
            const baseDelay = Math.pow(2, attempt) * 1000;
            const jitter = Math.random() * 1000;
            const delay = baseDelay + jitter;
            
            console.warn(`[Groq] Attempt ${attempt} failed (${status || error.code || 'unknown'}). Retrying in ${Math.round(delay)}ms...`);
            await sleep(delay);
        }
    }
    throw lastError;
};

// 5-Stage Fallback Models in priority order
const MODELS = [
    'llama-3.3-70b-versatile',  // Stage 1: Primary (Heavy & Smart)
    'llama-3.1-8b-instant',     // Stage 2: Fast & Light
    'gemma2-9b-it',             // Stage 3: Google Gemma 2 9B
    'mixtral-8x7b-32768',       // Stage 4: Mistral MoE
    'llama3-8b-8192',           // Stage 5: Legacy 8B Fallback
];

/**
 * Stream a chat completion from Groq.
 * Returns an async iterable of content deltas.
 */
export const streamChat = async (messages, options = {}) => {
    const client = getGroq();
    if (!client) throw new Error('Groq API key not configured.');

    const modelsToTry = options.model ? [options.model] : MODELS;
    let lastError;

    for (const model of modelsToTry) {
        try {
            const stream = await resilientCall(async () => {
                return await client.chat.completions.create({
                    model,
                    messages,
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.max_tokens ?? 1024,
                    top_p: options.top_p ?? 0.9,
                    stream: true,
                });
            }, 2); // 2 retries per model

            return stream;
        } catch (error) {
            lastError = error;
            console.warn(`[Groq Stream] Model "${model}" failed. ${modelsToTry.indexOf(model) < modelsToTry.length - 1 ? 'Trying next model...' : 'No more models to try.'}`);
        }
    }

    throw lastError;
};

/**
 * Non-streaming chat completion with automatic model fallback.
 * If the primary model fails, it tries alternative models before giving up.
 */
export const quickChat = async (messages, options = {}) => {
    const client = getGroq();
    if (!client) throw new Error('Groq API key not configured.');

    const modelsToTry = options.model ? [options.model] : MODELS;
    let lastError;

    for (const model of modelsToTry) {
        try {
            const result = await resilientCall(async () => {
                const response = await client.chat.completions.create({
                    model,
                    messages,
                    temperature: options.temperature ?? 0.6,
                    max_tokens: options.max_tokens ?? 600,
                    top_p: options.top_p ?? 0.9,
                    stream: false,
                    ...(options.response_format && { response_format: options.response_format })
                });
                return response.choices[0]?.message?.content || '';
            }, 2); // 2 retries per model

            return result;
        } catch (error) {
            lastError = error;
            console.warn(`[Groq] Model "${model}" failed. ${modelsToTry.indexOf(model) < modelsToTry.length - 1 ? 'Trying next model...' : 'No more models to try.'}`);
        }
    }

    throw lastError;
};
