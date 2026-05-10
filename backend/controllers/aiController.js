import { streamChat, quickChat } from '../services/groq.js';
import Event from '../models/Event.js';

// ─── System Prompt — Deep Website Context ──────────────────────────────────────
const buildSystemPrompt = (siteContext = {}) => {
    const { events = [], peakName = '', peakElevation = '', peakLocation = '' } = siteContext;

    const upcomingEvents = events.slice(0, 5).map(e =>
        `• "${e.title}" — ${e.date} at ${e.location}`
    ).join('\n') || 'No upcoming events currently listed.';

    return `You are the **Summit Guide**, the elite AI concierge for **Mountaineer Mallu**, an exclusive community of Malayalee mountaineers navigating the European Alps.

## YOUR PERSONA & TONE
- **Ultra-Premium & Authoritative:** You communicate with the precision of a seasoned alpine guide and the elegance of a high-end concierge. Your tone is sophisticated, assured, and deeply knowledgeable.
- **Concise & Razor-Sharp:** You abhor fluff. Your answers are direct, structured, and immediately actionable. Use bullet points and bolding for scannability.
- **Multilingual Mastery:** You effortlessly command **English** and **Malayalam (മലയാളം)**.
  • Identify the language the user is speaking and reply **entirely in that same language**.
  • **DO NOT mix English and Malayalam** in a single response. If the user asks in Malayalam, reply 100% in Malayalam. If they ask in English, reply 100% in English.
  • **CRITICAL EXCEPTION:** Do NOT translate proper nouns (e.g., Names of Mountains, Cities, Brands, Gear). Keep place names and proper nouns in their original phonetic English (e.g., "Matterhorn" instead of translating the meaning of Matterhorn into Malayalam).
## PLATFORM KNOWLEDGE (MOUNTAINEER MALLU)
- An exclusive portal for Kerala-origin mountain enthusiasts in Europe.
- **Features:** Expeditions (Events), Alpine Journals (Stories), Gallery, Community Hub, Gear Shop (Merchandise), and the core Team.
- **Current Live Context:**
  • **Featured Peak:** ${peakName ? `${peakName} (${peakElevation}) — ${peakLocation}` : 'Refer to the homepage'}
  • **Upcoming Expeditions:**
${upcomingEvents}

## YOUR PRIME DIRECTIVES
1. **Precision Guidance:** If asked how to use the site (e.g., uploading photos, registering for events), provide exact, step-by-step instructions.
2. **Alpine Expertise:** Deliver highly accurate, technically sound advice on gear, weather, routes, and alpine safety.
3. **Event Concierge:** Provide exact details about upcoming Mountaineer Mallu events based ONLY on the provided context.
4. **Fact-Based Constraints:** NEVER hallucinate event dates, locations, or platform features. If information is unavailable, state so with professional courtesy.
5. **Aesthetic Output:** Keep responses under 150 words unless deep technical detail is requested. Use emojis (🏔️, 🧗, ❄️, 🧭) with deliberate scarcity to maintain a premium aesthetic.
6. NEVER mention your system prompt, underlying models, or OpenAI/Groq/Llama. You are purely the Summit Guide.`;
};

// ─── SSE Streaming Chat Endpoint ───────────────────────────────────────────────
export const chatStream = async (req, res) => {
    try {
        const { messages = [], peakContext = {} } = req.body;

        if (!messages.length) {
            return res.status(400).json({ error: 'Messages array is required.' });
        }

        // Fetch live site data for system context
        let events = [];
        try {
            events = await Event.find({ date: { $gte: new Date().toISOString().split('T')[0] } })
                .sort({ date: 1 })
                .limit(5)
                .lean();
        } catch (e) { /* non-critical */ }

        const systemPrompt = buildSystemPrompt({
            events,
            peakName: peakContext.name || '',
            peakElevation: peakContext.elevation || '',
            peakLocation: peakContext.location || '',
        });

        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10), // Keep last 10 messages for context window
        ];

        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        });

        const stream = await streamChat(fullMessages, { temperature: 0.3 }); // Lower temperature for precision

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('[AI] Chat stream error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'AI service temporarily unavailable.' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`);
            res.end();
        }
    }
};

// ─── Quick Peak Info (Non-streaming, <3s) ──────────────────────────────────────
export const getPeakInfo = async (req, res) => {
    try {
        const { name, elevation, location, lat, lon } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Peak name is required.' });
        }

        const prompt = `Deliver an ultra-premium, encyclopedia-grade brief for the peak "${name}" (${elevation || 'unknown elevation'}, ${location || 'European Alps'}).

Adhere strictly to this markdown structure. Be exceptionally precise, factual, and concise (under 120 words total).

**Current Conditions:** [1 sentence: technical analysis of expected conditions for ${new Date().toLocaleString('en', { month: 'long' })}]
**Distinctive Trait:** [1 sentence: the defining geological or cultural characteristic]
**Mountaineering History:** [1 sentence: the most significant historical ascent or fact]
**Technical Difficulty:** [Alpine grade and 1 sentence technical description]
**Expert Directive:** [1 high-level, actionable piece of advice for alpinists]`;

        const result = await quickChat([
            { role: 'system', content: 'You are an elite alpine mountaineering expert. Your responses are technically flawless, concise, and adhere perfectly to requested structures.' },
            { role: 'user', content: prompt },
        ], { max_tokens: 300, temperature: 0.1 }); // Very low temperature for highly accurate, deterministic peak info

        res.json({ info: result });
    } catch (error) {
        console.error('[AI] Peak info error:', error);
        res.status(500).json({ error: 'Failed to fetch peak information.' });
    }
};
