// services/geminiService.js
import axios from 'axios';

export async function analyzeWithGemini(claim, searchResults) { // Use export
    // ... function logic is the same
    if (!process.env.GEMINI_API_KEY) {
        return { verdict: "Error", explanation: "Server is missing AI API key." };
    }
    try {
        const searchContext = searchResults.length > 0 ?
            searchResults.map((r, i) => `[${i+1}] ${r.title}: "${r.snippet}"`).join('\n') :
            "No relevant web search results were found.";

        const prompt = `
            Analyze this claim: "${claim}"
            Use this web search context:
            ---
            ${searchContext}
            ---
            Respond ONLY with a valid JSON object in this exact format:
            {
              "verdict": "Real" | "Fake" | "Unverified",
              "explanation": "A concise, neutral summary of your conclusion."
            }
        `;
        const modelName = 'gemini-1.5-flash-latest';
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" },
            }
        );
        return JSON.parse(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error('[Gemini Service Error]', error.message);
        return { verdict: "Error", explanation: "The AI analysis failed." };
    }
}