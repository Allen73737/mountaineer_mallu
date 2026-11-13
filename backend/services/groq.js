import Groq from 'groq-sdk';

/**
 * Groq access with a 7-step model fallback chain.
 *
 * Groq retires models often (the old Llama 3.x / Gemma 2 / Mixtral line-up is gone), so the chain is
 * not hard-coded blindly: a preferred list is intersected with the models this API key can actually
 * use (GET /models, cached for an hour), and any newer general-purpose chat models Groq adds are
 * appended automatically until there are seven. Each step gets one fast attempt with a short timeout;
 * a model that is missing, rate-limited, slow or returns nothing hands over to the next immediately.
 */

let groqClient = null;

export const getGroq = () => {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY,
            maxRetries: 0,   // the fallback chain is the retry strategy — no hidden SDK retries stacking up
            timeout: 20000,
        });
    }
    return groqClient;
};

const CHAIN_LENGTH = 7;

// Preferred order: strongest reasoning first, then fast and capable, then light fallbacks.
// Newer IDs listed here are picked up the moment they appear on the account.
const PREFERRED = [
    'openai/gpt-oss-120b',      // 1 · best quality; reasoning kept "low" for chat latency
    'qwen/qwen3.8-27b',         // 2 · fast (~0.4 s) and strong
    'openai/gpt-oss-20b',       // 3 · quick reasoning model
    'qwen/qwen3-32b',           // older Qwen, if the account still has it
    'moonshotai/kimi-k2-instruct-0905',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'llama-3.3-70b-versatile',
    'allam-2-7b',               // small, very fast last resort (4k context)
];

// Groq also hosts speech, transcription and safety-classifier models — never use those for chat
const NOT_CHAT = /whisper|orpheus|tts|playai|guard|safeguard|distil-whisper/i;

let chainCache = { models: null, at: 0 };
const CHAIN_TTL = 60 * 60 * 1000;

/** Resolve the 7-step chain for this API key (cached; falls back to PREFERRED if /models is unreachable). */
export const getModelChain = async () => {
    if (chainCache.models && Date.now() - chainCache.at < CHAIN_TTL) return chainCache.models;
    const client = getGroq();
    try {
        const list = await client.models.list();
        const available = (list.data || []).filter(m => m.active !== false && !NOT_CHAT.test(m.id));
        const ids = new Set(available.map(m => m.id));
        const chain = PREFERRED.filter(id => ids.has(id));
        // Newest unknown chat models fill any remaining slots
        available
            .sort((a, b) => (b.created || 0) - (a.created || 0))
            .forEach(m => { if (chain.length < CHAIN_LENGTH && !chain.includes(m.id)) chain.push(m.id); });
        if (chain.length) {
            chainCache = { models: chain.slice(0, CHAIN_LENGTH), at: Date.now() };
            console.log(`[Groq] Model chain (${chainCache.models.length}/${CHAIN_LENGTH}): ${chainCache.models.join(' → ')}`);
            return chainCache.models;
        }
    } catch (err) {
        console.warn('[Groq] Could not list models, using the preferred list:', err.message);
    }
    return PREFERRED.slice(0, CHAIN_LENGTH);
};

// Per-model request tweaks: reasoning models think in a separate channel, so keep it short for chat
const tune = (model, body) => {
    if (model.startsWith('openai/gpt-oss')) return { ...body, reasoning_effort: body.reasoning_effort || 'low' };
    if (model.startsWith('qwen/')) return { ...body, reasoning_format: 'hidden' };
    if (model === 'allam-2-7b') return { ...body, max_tokens: Math.min(body.max_tokens || 600, 1500) };
    return body;
};

const statusOf = (error) => error?.status || error?.statusCode || error?.error?.status_code;
const describe = (error) => `${statusOf(error) || error?.code || 'error'}: ${(error?.message || String(error)).slice(0, 120)}`;

// A model that answers with an unknown parameter gets one retry without the tuning
const isParamError = (error) => statusOf(error) === 400 && /reasoning|property|parameter|unsupported/i.test(error?.message || '');

const attempt = async (model, body) => {
    const client = getGroq();
    try {
        return await client.chat.completions.create(tune(model, { ...body, model }));
    } catch (error) {
        if (isParamError(error)) return client.chat.completions.create({ ...body, model });
        throw error;
    }
};

/**
 * Stream a chat completion. Returns an async iterable of chunks (same shape as the Groq SDK).
 * Falls through the chain until a model starts streaming real content.
 */
export const streamChat = async (messages, options = {}) => {
    if (!getGroq()) throw new Error('Groq API key not configured.');
    const chain = options.model ? [options.model] : (options.chain || await getModelChain());
    let lastError;

    for (const [i, model] of chain.entries()) {
        try {
            const stream = await attempt(model, {
                messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens ?? 1024,
                top_p: options.top_p ?? 0.9,
                stream: true,
            });
            // Peek until the first visible token so an empty or failing stream can still fall back
            const iterator = stream[Symbol.asyncIterator]();
            const buffered = [];
            let gotContent = false;
            while (!gotContent) {
                const { value, done } = await iterator.next();
                if (done) break;
                buffered.push(value);
                if (value?.choices?.[0]?.delta?.content) gotContent = true;
            }
            if (!gotContent) throw new Error('empty response');
            if (i > 0) console.warn(`[Groq Stream] Served by fallback step ${i + 1}: ${model}`);
            return (async function* () {
                yield* buffered;
                for (;;) {
                    const { value, done } = await iterator.next();
                    if (done) return;
                    yield value;
                }
            })();
        } catch (error) {
            lastError = error;
            console.warn(`[Groq Stream] Step ${i + 1}/${chain.length} ${model} failed (${describe(error)})${i < chain.length - 1 ? ' → next' : ''}`);
        }
    }
    throw lastError || new Error('No Groq model available.');
};

/**
 * Non-streaming completion with the same fallback chain. Returns the message text.
 */
export const quickChat = async (messages, options = {}) => {
    if (!getGroq()) throw new Error('Groq API key not configured.');
    const chain = options.model ? [options.model] : (options.chain || await getModelChain());
    let lastError;

    for (const [i, model] of chain.entries()) {
        try {
            const response = await attempt(model, {
                messages,
                temperature: options.temperature ?? 0.6,
                // Reasoning models spend tokens thinking; leave room so the answer isn't cut off
                max_tokens: Math.max(options.max_tokens ?? 600, model.startsWith('openai/gpt-oss') ? 1200 : 0),
                top_p: options.top_p ?? 0.9,
                stream: false,
                ...(options.response_format && { response_format: options.response_format }),
            });
            const content = (response.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            if (!content) throw new Error('empty response');
            if (i > 0) console.warn(`[Groq] Served by fallback step ${i + 1}: ${model}`);
            return content;
        } catch (error) {
            lastError = error;
            console.warn(`[Groq] Step ${i + 1}/${chain.length} ${model} failed (${describe(error)})${i < chain.length - 1 ? ' → next' : ''}`);
        }
    }
    throw lastError || new Error('No Groq model available.');
};
