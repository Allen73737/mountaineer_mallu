import { generateStoryDraft } from './services/aiInsightsService.js';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    try {
        console.log("Generating...");
        const result = await generateStoryDraft({
            title: "My climb",
            region: "Alps",
            notes: "It was cold",
            language: "en"
        });
        console.log("Result:", result);
    } catch(e) {
        console.error("Error:", e);
    }
}
test();
