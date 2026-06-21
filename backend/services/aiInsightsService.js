import { quickChat } from './groq.js';

// ═══════════════════════════════════════════════════════════════
//   AI INSIGHTS SERVICE — Domain-Specific Groq Wrappers
//   Powers: Adaptive Theme, Route Briefing, Security Digest,
//           Campaign Autopilot, Story Writer, Gallery Tagger,
//           Review Summarizer
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an adaptive color theme based on an expedition's terrain/location.
 * Returns a JSON palette for the user portal.
 */
export const generateThemeSuggestion = async (event) => {
    const prompt = `You are a premium UI color designer. Based on this expedition, return ONLY a valid JSON object (no markdown, no explanation) with an adaptive color palette.

Expedition: "${event.title}"
Location: ${event.location}
Difficulty: ${event.difficulty}
Type: ${event.type || 'Trek'}

Return this exact JSON structure:
{
  "primary": "#hex",
  "glow": "#hex",
  "accent": "#hex",
  "bgGradientFrom": "#hex",
  "bgGradientTo": "#hex",
  "mood": "one word describing the mood"
}

Rules:
- Snowy/glacier/winter expeditions → icy blues, cool whites, frosty teals
- Forest/jungle treks → deep emeralds, earth browns, mossy greens
- Desert/arid → warm ambers, burnt oranges, sandy golds
- High altitude/extreme → deep navy, electric blues, stark whites
- Make colors feel premium and sophisticated, NOT garish`;

    try {
        const result = await quickChat([
            { role: 'system', content: 'You are a JSON-only response bot. Return ONLY valid JSON, nothing else.' },
            { role: 'user', content: prompt }
        ], { max_tokens: 200, temperature: 0.3 });

        // Parse JSON from response (handle potential markdown wrapping)
        const jsonStr = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('[AI Insights] Theme suggestion failed:', error.message);
        // Fallback palette
        return {
            primary: '#A3C9E2',
            glow: '#4A6A8C',
            accent: '#E2A071',
            bgGradientFrom: '#0B192C',
            bgGradientTo: '#050505',
            mood: 'alpine'
        };
    }
};

/**
 * Generate a personalized AI route briefing for an expedition.
 */
export const generateRouteBriefing = async (event, userExpeditionCount = 0) => {
    const prompt = `You are an elite alpine guide writing a personalized route briefing. Be precise, technical, and actionable.

Expedition: "${event.title}"
Location: ${event.location}
Difficulty: ${event.difficulty}
Date: ${event.date}
Time: ${event.time}
Type: ${event.type || 'Trek'}
Description: ${event.description || 'No additional details provided'}
User's total past expeditions: ${userExpeditionCount}

Return ONLY a valid JSON object with this structure:
{
  "summary": "2-3 sentence overview of what to expect",
  "difficultyAnalysis": "1-2 sentences comparing this difficulty to the user's experience level",
  "keyWaypoints": ["waypoint tip 1", "waypoint tip 2", "waypoint tip 3"],
  "weatherGuidance": "1-2 sentences about expected conditions for the date/location",
  "gearTip": "One critical gear recommendation",
  "motivationalNote": "One short inspiring sentence"
}`;

    try {
        const result = await quickChat([
            { role: 'system', content: 'You are a JSON-only response bot. Return ONLY valid JSON, nothing else. You are an expert mountaineering guide.' },
            { role: 'user', content: prompt }
        ], { max_tokens: 500, temperature: 0.4 });

        const jsonStr = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('[AI Insights] Route briefing failed:', error.message);
        return null;
    }
};

/**
 * Analyze security logs and generate a natural-language anomaly digest.
 */
export const analyzeSecurityLogs = async (securityData) => {
    const { failedLogins, successfulLogins, topFailedUsers, pageViewSpikes, recentAdminActions } = securityData;

    const prompt = `You are a cybersecurity analyst for a mountaineering platform. Analyze this 24-hour security data and generate an intelligence report.

Data:
- Failed login attempts: ${failedLogins}
- Successful logins: ${successfulLogins}
- Top users with failed logins: ${JSON.stringify(topFailedUsers || [])}
- Page view anomalies: ${JSON.stringify(pageViewSpikes || [])}
- Recent admin actions: ${recentAdminActions || 0}

Return ONLY a valid JSON object:
{
  "overallStatus": "normal" | "elevated" | "critical",
  "alerts": [
    { "severity": "info" | "warning" | "critical", "message": "natural language description", "metric": "relevant number" }
  ],
  "summary": "1-2 sentence executive summary",
  "recommendation": "One actionable recommendation"
}

Rules:
- 5+ failed logins from same user = warning
- 10+ failed logins total = elevated
- Login success rate below 70% = warning
- Be specific with usernames/IPs when flagging anomalies
- If everything is normal, say so confidently`;

    try {
        const result = await quickChat([
            { role: 'system', content: 'You are a JSON-only security analyst bot. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
        ], { max_tokens: 500, temperature: 0.2 });

        const jsonStr = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('[AI Insights] Security analysis failed:', error.message);
        return {
            overallStatus: 'normal',
            alerts: [],
            summary: 'Security analysis temporarily unavailable.',
            recommendation: 'Check back shortly.'
        };
    }
};

/**
 * Generate a marketing campaign from a natural language prompt.
 */
export const generateCampaignContent = async (adminPrompt, platformContext = {}) => {
    const { totalUsers = 0, upcomingEvents = [], recentEventNames = [] } = platformContext;

    const prompt = `You are an elite marketing strategist for "Mountaineer Mallu", a premium Malayalee mountaineering community in the European Alps.

Admin's Campaign Request: "${adminPrompt}"

Platform Context:
- Total registered users: ${totalUsers}
- Upcoming events: ${recentEventNames.join(', ') || 'None'}

Generate a complete email campaign. Return ONLY valid JSON:
{
  "subject": "compelling email subject line (with one emoji)",
  "preheader": "short preview text for email clients",
  "headline": "bold hero headline for the email body",
  "bodyHtml": "2-3 paragraphs of premium email body copy in HTML. Use <strong> for emphasis. Keep it concise, exciting, and action-oriented.",
  "ctaText": "call-to-action button text",
  "ctaUrl": "relative URL path (e.g., /events, /gallery, /shop)",
  "audienceCriteria": {
    "description": "natural language description of who should receive this",
    "filters": {
      "hasExpeditions": true | false | null,
      "minExpeditions": number | null,
      "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Expert" | null
    }
  },
  "estimatedImpact": "one sentence predicting the impact"
}

Rules:
- Subject lines must be 6-10 words max
- Body copy should feel exclusive and premium, not salesy
- Use the Mountaineer Mallu brand voice: sophisticated, adventurous, community-focused
- CTA text should be action-oriented (e.g., "Secure Your Spot", "Explore Now")`;

    try {
        const result = await quickChat([
            { role: 'system', content: 'You are a JSON-only marketing AI. Return ONLY valid JSON, nothing else.' },
            { role: 'user', content: prompt }
        ], { max_tokens: 800, temperature: 0.6 });

        const jsonStr = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('[AI Insights] Campaign generation failed:', error.message);
        return null;
    }
};

/**
 * AI Story Writer: Given a title, region, and optional rough notes,
 * returns a structured story outline + polished draft in HTML.
 */
export const generateStoryDraft = async (storyMeta) => {
    const { title, region, notes, language } = storyMeta;

    const langMap = { en: 'English', de: 'German', ml: 'Malayalam', mg: 'Manglish (Malayalam written in English script)' };
    const writeLang = langMap[language] || 'English';

    const prompt = `You are a gifted mountaineering storyteller writing for "Mountaineer Mallu", a premium Malayalee trekking community in the European Alps.

Story title: "${title}"
Region: ${region}
User's rough notes/ideas: ${notes || 'None — be creative'}
Writing language: ${writeLang}

Return ONLY a valid JSON object. IMPORTANT: Do NOT use literal newline characters inside JSON string values. Use escaped \\n or write HTML as a single continuous string.
{
  "outline": [
    { "section": "section heading", "hint": "2-sentence guide of what to write here" }
  ],
  "draftHtml": "A 3-5 paragraph HTML story draft. Use <h3> for section breaks, <strong> for emphasis, <em> for scenic descriptions. Make it vivid, personal, and immersive. Write in ${writeLang}.",
  "suggestedExcerpt": "A compelling 1-2 sentence excerpt for the story card preview.",
  "toneNote": "A one-line note on the tone and style used."
}

Rules:
- Write in ${writeLang}
- The story should feel authentic, personal, and cinematic
- Include sensory details: weather, sounds, emotions
- Keep paragraphs short for mobile readability
- The draft should be publish-ready but editable
- CRITICAL: Ensure the response is perfectly valid JSON without any unescaped control characters.`;

    try {
        const result = await quickChat([
            { role: 'system', content: 'You are a JSON-only creative writing bot. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
        ], { max_tokens: 3000, temperature: 0.7, response_format: { type: 'json_object' } });

        const jsonStr = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('[AI Insights] Story draft failed:', error.message);
        return null;
    }
};

/**
 * AI Image Search Query Generator: Given context (title, region, notes, content, description),
 * deeply analyzes ALL provided information and returns a precise, visual search query
 * optimized for Unsplash to find the most relevant cover image.
 */
export const generateImageSearchQuery = async (context) => {
    // Build a rich, structured prompt that forces the AI to actually read the content
    const parts = [];
    if (context.title) parts.push(`Title: "${context.title}"`);
    if (context.region) parts.push(`Region/Location: "${context.region}"`);
    if (context.location) parts.push(`Location: "${context.location}"`);
    if (context.type) parts.push(`Type/Category: "${context.type}"`);
    if (context.difficulty) parts.push(`Difficulty: "${context.difficulty}"`);
    if (context.notes) parts.push(`User Notes: "${context.notes}"`);
    if (context.description) parts.push(`Description: "${context.description}"`);
    if (context.content) parts.push(`Content (excerpt): "${context.content.substring(0, 800)}"`);

    const contextBlock = parts.join('\n');

    const prompt = `You are an expert visual content curator for a premium mountaineering and outdoor adventure platform. Your job is to analyze ALL of the following information carefully — every word matters — and produce the single most precise Unsplash search query that would return a stunning, relevant cover photo.

ANALYZE THIS CONTENT CAREFULLY:
${contextBlock}

INSTRUCTIONS:
1. Read every detail: the title, region, description, content excerpt. Identify the PRIMARY VISUAL SUBJECT.
2. Consider the specific location, terrain, weather, season, activity, and mood described.
3. If a specific mountain, trail, region, or landmark is mentioned (e.g., "Western Ghats", "Mont Blanc", "Munnar", "Himalayas"), INCLUDE it in the query.
4. If a specific activity is described (e.g., trekking, rock climbing, kayaking, camping), INCLUDE it.
5. If weather or time of day is mentioned (e.g., sunrise, monsoon, snow, fog), INCLUDE it.
6. Produce a 3-5 word search query that is SPECIFIC and VISUAL. Avoid generic terms like "nature" or "beautiful".

EXAMPLES of good queries:
- Title "Dawn at Meesapulimala" + Region "Munnar" → "misty Munnar mountain sunrise"
- Title "Rock Climbing in Hampi" → "Hampi bouldering rock climbing"  
- Title "Monsoon Trek to Dudhsagar" → "Dudhsagar waterfall monsoon"
- Title "Winter Camp at Kedarkantha" → "Kedarkantha snow camping tent"
- Title "Community Cleanup Drive" + Content about beach → "beach cleanup volunteers"

Return ONLY a valid JSON object with no extra text:
{
  "searchQuery": "your 3-5 word precise search phrase",
  "reasoning": "one sentence explaining why this query matches the content"
}`;

    try {
        const result = await quickChat([
            { role: 'system', content: 'You are a JSON-only response bot. Analyze the provided content deeply and return a precise visual search query. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
        ], { max_tokens: 150, temperature: 0.4, response_format: { type: 'json_object' } });

        const jsonStr = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        console.log(`[AI Insights] Image query: "${parsed.searchQuery}" — ${parsed.reasoning || 'no reasoning'}`);
        return parsed.searchQuery;
    } catch (error) {
        console.error('[AI Insights] Image search query generation failed:', error.message);
        // Smarter fallback: use the title directly if available
        if (context.title) return context.title;
        if (context.region) return context.region + ' landscape';
        return 'mountains landscape';
    }
};

/**
 * Smart Gallery Tagger: Given a gallery image's title, URL, and context,
 * returns an array of descriptive AI-generated tags.
 */
export const generateGalleryTags = async (item) => {
    const prompt = `You are a photo taxonomy AI for a mountaineering platform. Analyze this gallery item and generate descriptive tags.

Title: "${item.title}"
Type: ${item.type}
Upload date: ${item.createdAt || 'Unknown'}

Return ONLY a valid JSON object:
{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Rules:
- Generate exactly 5 tags
- Tags should cover: activity type, terrain, weather/season, mood, location hint
- Tags should be lowercase, 1-2 words each
- Be specific: "alpine meadow" > "nature", "ice climbing" > "climbing"
- Base tags on the title text and common mountaineering contexts`;

    try {
        const result = await quickChat([
            { role: 'system', content: 'You are a JSON-only response bot. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
        ], { max_tokens: 100, temperature: 0.3 });

        const jsonStr = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.tags || [];
    } catch (error) {
        console.error('[AI Insights] Gallery tagging failed:', error.message);
        return [];
    }
};

/**
 * AI Review Summarizer: Given an array of reviews, produces a
 * sentiment dashboard with themes and trends.
 */
export const summarizeReviews = async (reviews) => {
    const reviewsText = reviews.map(r =>
        `[${r.rating}/5 by ${r.author?.name || 'Anonymous'}] "${r.content}"`
    ).join('\n');

    const prompt = `You are a customer insights analyst for a premium mountaineering community. Analyze these user reviews and generate a comprehensive sentiment summary.

Reviews (${reviews.length} total):
${reviewsText}

Return ONLY a valid JSON object:
{
  "overallSentiment": "very positive" | "positive" | "mixed" | "negative" | "very negative",
  "averageRating": number,
  "summary": "2-3 sentence executive summary of what users are saying",
  "themes": [
    { "theme": "theme name", "sentiment": "positive" | "neutral" | "negative", "mentions": number, "quote": "one representative quote" }
  ],
  "highlights": ["top positive point 1", "top positive point 2"],
  "concerns": ["top concern 1 (if any)"],
  "recommendation": "One actionable recommendation based on the feedback"
}

Rules:
- Identify 3-5 recurring themes
- Quote directly from reviews when possible
- Be honest about negative feedback
- If all reviews are positive, say so confidently
- The recommendation should be specific and actionable`;

    try {
        const result = await quickChat([
            { role: 'system', content: 'You are a JSON-only analytics bot. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
        ], { max_tokens: 800, temperature: 0.3 });

        const jsonStr = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('[AI Insights] Review summary failed:', error.message);
        return null;
    }
};
