const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Seeker = require('./Seeker');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// 5-Model Fallback Helper
async function generateWithFallback(options) {
    const models = [
        "llama-3.1-8b-instant",
        "llama-3.3-70b-versatile",
        "gemma2-9b-it",
        "mixtral-8x7b-32768",
        "llama3-8b-8192"
    ];
    let lastError = null;
    for (const model of models) {
        try {
            const completion = await groq.chat.completions.create({
                ...options,
                model
            });
            return completion;
        } catch (err) {
            console.warn(`Groq Model ${model} failed, trying next... Error: ${err.message}`);
            lastError = err;
        }
    }
    throw new Error(`All 5 fallback models failed. Last error: ${lastError?.message}`);
}

// Initialize Groq SDK
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// 1. Live AI Salary Negotiator & Headhunter Chat Route
router.post('/chat', async (req, res) => {
    try {
        const { messages, systemPrompt } = req.body;
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: "llama-3.1-8b-instant", // Fast model suitable for chat
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
        });

        res.json({ reply: chatCompletion.choices[0]?.message?.content || "No response" });
    } catch (error) {
        console.error("Groq Chat Error:", error);
        res.status(500).json({ error: "Failed to generate AI response" });
    }
});

// 2. Instant AI Pitch Generator
router.post('/pitch', async (req, res) => {
    try {
        const { userProfile, job } = req.body;
        
        const prompt = `You are an expert career coach and copywriter. 
Write a highly compelling, short, and professional cold-email/DM pitch (max 100 words) for the user to send to the hiring manager for the following job.
Do not use placeholders like [Your Name], use the provided user details if available. Be persuasive and highlight the match.

Job Title: ${job.title}
Company: ${job.company}
Job Description Snippet: ${job.description}

User Profile:
Name: ${userProfile?.name || 'A passionate professional'}
Bio: ${userProfile?.bio || 'Experienced in the field'}
Skills: ${userProfile?.skills?.join(', ') || 'Relevant skills'}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", // Use a stronger model for copywriting
            temperature: 0.8,
            max_tokens: 250,
        });

        res.json({ pitch: completion.choices[0]?.message?.content });
    } catch (error) {
        console.error("Groq Pitch Error:", error);
        res.status(500).json({ error: "Failed to generate pitch" });
    }
});

// 3. Resume Roaster & ATS Optimizer
router.post('/resume', async (req, res) => {
    try {
        const { bulletPoint } = req.body;

        const prompt = `You are a strict, top-tier FAANG recruiter. The user is providing a bullet point from their resume.
1. "Roast" it constructively (tell them why it's weak or generic in 1 sentence).
2. Provide 3 optimized, high-impact variations using strong action verbs and (placeholder) quantifiable metrics that they can fill in.

Format exactly like this:
**The Roast:** [your roast]

**Optimized Variations:**
1. [variation 1]
2. [variation 2]
3. [variation 3]

Original Bullet: "${bulletPoint}"`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 300,
        });

        res.json({ analysis: completion.choices[0]?.message?.content });
    } catch (error) {
        console.error("Groq Resume Error:", error);
        res.status(500).json({ error: "Failed to optimize resume" });
    }
});

// 3. Smart AI Job Matcher
router.post('/match', async (req, res) => {
    try {
        const { userProfile, jobs, email } = req.body;
        
        if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
            return res.json({ matches: [] });
        }

        // Try fetching seeker from DB to use saved scores
        let seeker = null;
        if (email) {
            seeker = await Seeker.findOne({ email });
        }

        const validMatches = [];
        const jobsToEvaluate = [];
        const now = new Date();

        // Check if any job matches are already cached and fresh (< 7 days)
        for (const job of jobs) {
            const savedMatch = seeker?.aiMatches?.find(m => m.jobId?.toString() === job._id?.toString());
            if (savedMatch && (now - new Date(savedMatch.lastEvaluated)) < 7 * 24 * 60 * 60 * 1000) {
                validMatches.push({
                    jobIndex: jobs.indexOf(job),
                    matchScore: savedMatch.score,
                    reason: savedMatch.reason
                });
            } else {
                jobsToEvaluate.push({ ...job, originalIndex: jobs.indexOf(job) });
            }
        }

        if (jobsToEvaluate.length === 0) {
            return res.json({ matches: validMatches });
        }

        const safeBio = (userProfile?.bio || '').slice(0, 200);
        const safeSkills = (userProfile?.skills?.join(', ') || '').slice(0, 200);
        const prompt = `You are an elite AI recruitment algorithm.
Compare the user's profile to the following list of jobs.
For each job, calculate a "matchScore" between 0 and 100 based on skill overlap, location, and experience.
Also provide a short 1-sentence "reason" explaining why they are a fit.

User Profile:
Name: ${userProfile?.name || 'Anonymous'}
Bio: ${safeBio}
Skills: ${safeSkills}
Location: ${userProfile?.location || ''}

Jobs (EVALUATE EVERY SINGLE ONE OF THESE JOBS):
${jobsToEvaluate.map((j) => `[Job Index: ${j.originalIndex}] Title: ${j.title}, Company: ${j.company}, Location: ${j.location}, Desc: ${(j.description || '').slice(0, 100)}`).join('\n')}

Output Format MUST be exactly this JSON object, and it MUST contain exactly ${jobsToEvaluate.length} items in the "matches" array:
{
  "matches": [
    { "jobIndex": 0, "matchScore": 85, "reason": "Your React skills strongly align with their frontend requirements." }
  ]
}`;

        console.log("Match prompt length:", prompt.length);

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        let rawContent = completion.choices[0]?.message?.content || "{}";
        let parsed = { matches: [] };
        try {
            parsed = JSON.parse(rawContent);
        } catch(e) {
            console.error("JSON parse error on match output:", e);
        }

        // Save newly generated scores to DB
        if (seeker && parsed.matches?.length > 0) {
            for (const newMatch of parsed.matches) {
                const job = jobs[newMatch.jobIndex];
                if (!job || !job._id) continue;
                
                const existingIdx = seeker.aiMatches?.findIndex(m => m.jobId?.toString() === job._id.toString());
                if (existingIdx !== -1 && seeker.aiMatches) {
                    seeker.aiMatches[existingIdx].score = newMatch.matchScore;
                    seeker.aiMatches[existingIdx].reason = newMatch.reason;
                    seeker.aiMatches[existingIdx].lastEvaluated = new Date();
                } else {
                    if (!seeker.aiMatches) seeker.aiMatches = [];
                    seeker.aiMatches.push({
                        jobId: job._id,
                        score: newMatch.matchScore,
                        reason: newMatch.reason
                    });
                }
            }
            try {
                await seeker.save();
            } catch (saveErr) {
                if (saveErr.name === 'VersionError') {
                    try {
                        const freshSeeker = await Seeker.findById(seeker._id);
                        if (freshSeeker) {
                            for (const newMatch of parsed.matches) {
                                const job = jobs[newMatch.jobIndex];
                                if (!job || !job._id) continue;
                                const existingIdx = freshSeeker.aiMatches?.findIndex(m => m.jobId?.toString() === job._id.toString());
                                if (existingIdx !== -1 && freshSeeker.aiMatches) {
                                    freshSeeker.aiMatches[existingIdx].score = newMatch.matchScore;
                                    freshSeeker.aiMatches[existingIdx].reason = newMatch.reason;
                                    freshSeeker.aiMatches[existingIdx].lastEvaluated = new Date();
                                } else {
                                    if (!freshSeeker.aiMatches) freshSeeker.aiMatches = [];
                                    freshSeeker.aiMatches.push({ jobId: job._id, score: newMatch.matchScore, reason: newMatch.reason });
                                }
                            }
                            await freshSeeker.save();
                        }
                    } catch (retryErr) {
                        console.error("Retry save failed:", retryErr.message);
                    }
                } else {
                    console.error("Save failed:", saveErr.message);
                }
            }
        }

        const finalMatches = [...validMatches, ...(parsed.matches || [])];
        res.json({ matches: finalMatches });
    } catch (error) {
        console.error("Groq Match Error:", error);
        res.status(500).json({ error: "Failed to score matches" });
    }
});

// 5. AI Interview Prep
router.post('/interview-prep', async (req, res) => {
    try {
        const { userProfile, job } = req.body;
        
        const prompt = `You are an elite technical interviewer.
Based on the job title "${job.title}" at "${job.company}" and the candidate's skills (${userProfile?.skills?.join(', ')}), generate the top 3 most likely interview questions they will face. Provide a brief tip for answering each.

Output Format MUST be exactly this JSON object:
{
  "questions": [
    { "question": "...", "tip": "..." }
  ]
}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        let rawContent = completion.choices[0]?.message?.content || "{}";
        let parsed = { questions: [] };
        try {
            parsed = JSON.parse(rawContent);
        } catch(e) {}

        res.json({ questions: parsed.questions || [] });
    } catch (error) {
        console.error("Groq Interview Prep Error:", error);
        res.status(500).json({ error: "Failed to generate interview prep" });
    }
});

// 6. AI Bio Generator
router.post('/bio', async (req, res) => {
    try {
        const { userProfile } = req.body;
        
        const prompt = `You are an expert career coach.
Based on the candidate's name (${userProfile.name}), location (${userProfile.location || 'Unknown'}), and skills (${userProfile.skills?.join(', ') || 'Various skills'}), write a compelling, professional, and confident 3-sentence LinkedIn-style bio. Do not include placeholders like [Your Name], use the actual data.

Output Format MUST be exactly this JSON object:
{
  "bio": "..."
}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        let rawContent = completion.choices[0]?.message?.content || "{}";
        let parsed = { bio: "A driven professional looking for new opportunities." };
        try {
            parsed = JSON.parse(rawContent);
        } catch(e) {}

        res.json({ bio: parsed.bio });
    } catch (error) {
        console.error("Groq Bio Error:", error);
        res.status(500).json({ error: "Failed to generate bio" });
    }
});

// --- AI CAREER SUITE ROUTES ---

// 10. Resume Parser (PDF/DOCX to JSON)
router.post('/resume-parse', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        
        let resumeText = "";
        
        // Detect file type
        const mimetype = req.file.mimetype;
        if (mimetype === 'application/pdf') {
            const data = await pdfParse(req.file.buffer);
            resumeText = data.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            req.file.originalname.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            resumeText = result.value;
        } else {
            return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or DOCX." });
        }

        resumeText = resumeText.slice(0, 4000); // Limit length
        
        const prompt = `Extract the following information from this resume text into a structured JSON format.
Ensure the output matches exactly this JSON schema:
{
  "personal": { "name": "", "email": "", "phone": "", "location": "" },
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "experience": [{ "role": "", "company": "", "duration": "", "description": "" }],
  "skills": ["skill1", "skill2"],
  "projects": [{ "name": "", "description": "" }]
}

Resume Text:
${resumeText}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        let rawContent = completion.choices[0]?.message?.content || "{}";
        let parsed = JSON.parse(rawContent);
        res.json({ parsed, rawText: resumeText });
    } catch (error) {
        console.error("Parse Error:", error);
        res.status(500).json({ error: "Failed to parse resume" });
    }
});

// 11. ATS Analyzer
router.post('/ats-analyze', async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        
        const prompt = `You are an expert ATS (Applicant Tracking System). Analyze this resume against the job description.
Provide exactly this JSON format:
{
  "matchScore": 85, // 0 to 100
  "missingKeywords": ["keyword1", "keyword2"],
  "strengths": ["strength1", "strength2"],
  "improvementSuggestions": ["suggestion1", "suggestion2"]
}

Resume Text: ${resumeText.slice(0, 3000)}
Job Description: ${jobDescription.slice(0, 3000)}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
        console.error("ATS Error:", error);
        res.status(500).json({ error: "Failed to analyze ATS score" });
    }
});

// 12. Cover Letter Generator
router.post('/cover-letter', async (req, res) => {
    try {
        const { resumeText, jobTitle, company, jobDescription } = req.body;
        
        const prompt = `You are an expert career coach and copywriter.
Write a highly professional, tailored, and persuasive cover letter for the following job.
Do not use generic placeholders like [Your Address]. Use the resume details provided. Make it compelling and highlight exact matches between the resume and job requirements.

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription.slice(0, 2000)}

Candidate Resume:
${resumeText.slice(0, 3000)}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
            max_tokens: 1500
        });

        res.json({ coverLetter: completion.choices[0]?.message?.content || "" });
    } catch (error) {
        console.error("Cover Letter Error:", error);
        res.status(500).json({ error: "Failed to generate cover letter" });
    }
});

// 13. Smart Skill Recommendations
router.post('/skill-gap', async (req, res) => {
    try {
        const { currentSkills, targetRole } = req.body;
        
        const prompt = `You are a technical career advisor.
The user wants to become a "${targetRole}".
Their current skills are: ${currentSkills.join(', ')}.

Provide a JSON object exactly like this:
{
  "missingSkills": ["skill1", "skill2"],
  "recommendedCertifications": ["cert1", "cert2"],
  "learningPath": ["Step 1: Learn X", "Step 2: Build Y"]
}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
        console.error("Skill Gap Error:", error);
        res.status(500).json({ error: "Failed to generate skill recommendations" });
    }
});

// 14. Resume Builder (JSON to Markdown)
router.post('/resume-build', async (req, res) => {
    try {
        const { resumeData } = req.body;
        
        const prompt = `You are an expert resume writer. Take the following JSON data and generate a highly professional, beautifully formatted ATS-friendly Markdown resume.
Use standard markdown formatting (# for name, ## for sections, bolding, bullet points).
Make sure to improve the bullet points to be action-oriented if they are too basic.

Resume Data:
${JSON.stringify(resumeData, null, 2)}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 2000
        });

        res.json({ markdown: completion.choices[0]?.message?.content || "" });
    } catch (error) {
        console.error("Resume Build Error:", error);
        res.status(500).json({ error: "Failed to build resume markdown" });
    }
});

// 15. Resume Improvement Assistant
router.post('/resume-improve', async (req, res) => {
    try {
        const { resumeText } = req.body;
        
        const prompt = `You are an elite career coach. Review the provided resume text and suggest 3-5 specific, highly impactful improvements to the bullet points or summary.
Focus on quantifying achievements, using strong action verbs, and making the content more compelling to recruiters.
Output exactly in this JSON format:
{
  "suggestions": [
    {
      "original": "Short quote of original text",
      "improved": "The newly rewritten, high-impact version",
      "reason": "Why this is better"
    }
  ]
}

Resume Text:
${resumeText.slice(0, 3000)}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
        console.error("Resume Improve Error:", error);
        res.status(500).json({ error: "Failed to generate improvements" });
    }
});

// 16. AI Recruiter Copilot (RAG Assistant)
router.post('/employer-copilot', async (req, res) => {
    try {
        const { message, contextData } = req.body;
        // contextData contains stringified info about jobs/applicants
        const prompt = `You are an elite AI Recruiter Copilot embedded in an employer dashboard.
Your job is to assist the employer with their hiring tasks, answer questions about their data, draft emails, or summarize applicants based on the context provided.
Context Data (Active Jobs & Applicants):
${contextData.slice(0, 4000)}

Employer's Message: ${message}

Provide a helpful, professional, and insightful response.`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
            max_tokens: 1500
        });

        res.json({ reply: completion.choices[0]?.message?.content || "I'm unable to answer that right now." });
    } catch (error) {
        console.error("Copilot Error:", error);
        res.status(500).json({ error: "Failed to generate copilot response" });
    }
});

// 17. AI Candidate Summary
router.post('/candidate-summary', async (req, res) => {
    try {
        const { candidateData } = req.body;
        
        const prompt = `You are an expert technical recruiter. Read this candidate's data (bio, experience, skills) and provide a concise, high-impact bulleted summary of their strongest attributes, and overall suitability.
Do not invent information.
Candidate Data:
${candidateData.slice(0, 3000)}

Output exactly in this JSON format:
{
  "summary": ["Point 1", "Point 2", "Point 3"],
  "topSkills": ["Skill 1", "Skill 2"],
  "overallSuitability": "A 1-2 sentence verdict"
}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
        console.error("Candidate Summary Error:", error);
        res.status(500).json({ error: "Failed to summarize candidate" });
    }
});

// 18. AI Hiring Analytics
router.post('/hiring-analytics', async (req, res) => {
    try {
        const { statsData } = req.body;
        
        const prompt = `You are a Chief Talent Officer AI. Analyze this employer's current recruitment metrics and provide actionable hiring insights, trend predictions, and suggestions to optimize their time-to-hire or candidate quality.
Metrics:
${statsData}

Output exactly in this JSON format:
{
  "insights": ["Insight 1", "Insight 2"],
  "predictions": "Short prediction of hiring trends based on data",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 1200,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
        console.error("Hiring Analytics Error:", error);
        res.status(500).json({ error: "Failed to generate analytics" });
    }
});

// 19. Semantic Candidate Search
router.post('/semantic-search', async (req, res) => {
    try {
        const { query, candidates } = req.body;
        
        const prompt = `You are an advanced Semantic Search AI for recruiters.
The user is searching for: "${query}"
Below is a JSON list of candidates. Understand the meaning of the search (e.g. "backend dev" should match Node.js or Python experience).
Filter the candidates and return ONLY the IDs of the candidates that match the semantic intent of the query, along with a 1-sentence reason for each match.

Candidates:
${JSON.stringify(candidates.map(c => ({ id: c._id, text: c.bio + " " + c.experience + " " + c.location }))).slice(0, 6000)}

Output exactly in this JSON format:
{
  "matchedIds": ["id1", "id2"],
  "matchReasons": { "id1": "Reason 1", "id2": "Reason 2" }
}`;

        const completion = await generateWithFallback({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
        console.error("Semantic Search Error:", error);
        res.status(500).json({ error: "Failed to perform semantic search" });
    }
});

module.exports = router;
