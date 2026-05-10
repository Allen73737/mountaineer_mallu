import Groq from 'groq-sdk';

let groqClient = null;

export const getGroq = () => {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
};

/**
 * Stream a chat completion from Groq.
 * Returns an async iterable of content deltas.
 */
export const streamChat = async (messages, options = {}) => {
    const client = getGroq();
    if (!client) throw new Error('Groq API key not configured.');

    const stream = await client.chat.completions.create({
        model: options.model || 'llama-3.3-70b-versatile',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1024,
        top_p: options.top_p ?? 0.9,
        stream: true,
    });

    return stream;
};

/**
 * Non-streaming chat completion (for quick peak info).
 */
export const quickChat = async (messages, options = {}) => {
    const client = getGroq();
    if (!client) throw new Error('Groq API key not configured.');

    const response = await client.chat.completions.create({
        model: options.model || 'llama-3.3-70b-versatile',
        messages,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.max_tokens ?? 600,
        top_p: options.top_p ?? 0.9,
        stream: false,
    });

    return response.choices[0]?.message?.content || '';
};
