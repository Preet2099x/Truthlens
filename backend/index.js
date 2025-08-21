const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const chalk = require('chalk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE SETUP ---
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later.'
    },
});

// --- API ENDPOINTS ---
app.get('/health', (req, res) => {
    res.json({
        status: 'Server is running',
        port: PORT
    });
});

app.post('/check', limiter, async (req, res) => {
    try {
        const {
            claim
        } = req.body;

        if (!claim || typeof claim !== 'string' || claim.length > 500) {
            return res.status(400).json({
                error: 'Invalid claim. Must be a string under 500 characters.'
            });
        }

        console.log(`Checking claim: "${claim}"`);
        const searchResults = await searchWithSerper(claim);
        const geminiResponse = await analyzeWithGemini(claim, searchResults);
        res.json(geminiResponse);

    } catch (error) {
        console.error('Error in /check endpoint:', error.message);
        res.status(500).json({
            error: 'An internal server error occurred.',
            details: error.message,
        });
    }
});

// --- HELPER FUNCTIONS ---

async function searchWithSerper(query) {
    if (!process.env.SERPER_API_KEY) {
        console.warn('Serper API key not found. Skipping web search.');
        return [];
    }
    try {
        const response = await axios.post('https://google.serper.dev/search', {
            q: `latest news on "${query}"`,
            gl: 'in', // Geolocation for India
            hl: 'en', // Language English
            tbs: "qdr:w", // Filter results to the past week for relevance
        }, {
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        return (response.data.organic || []).slice(0, 8).map(result => ({
            title: result.title,
            snippet: result.snippet,
            link: result.link,
            source: new URL(result.link).hostname,
        }));
    } catch (error) {
        console.error(chalk.red('[Serper Error]'), error.message);
        return [];
    }
}

async function analyzeWithGemini(claim, searchResults) {
    if (!process.env.GEMINI_API_KEY) {
        return {
            verdict: "Error",
            explanation: "The server is missing its AI API key. Please contact the administrator.",
            reasoning: "Misconfigured server.",
            sources: [],
        };
    }
    try {
        const searchContext = searchResults.length > 0 ?
            searchResults.map((r, i) => `[${i+1}] ${r.title} (${r.source}): "${r.snippet}"`).join('\n\n') :
            "No relevant web search results were found. Rely solely on internal knowledge.";

        // A more detailed and robust prompt for higher quality analysis.
        const prompt = `
            You are a meticulous fact-checking AI assistant. Your task is to analyze a claim using the provided web search context and your own internal knowledge.

            **Claim to Verify:** "${claim}"

            **Web Search Context (Sources from the last week):**
            ---
            ${searchContext}
            ---

            **Instructions for Analysis:**
            1.  **Synthesize:** Carefully review both the web search context and your internal knowledge.
            2.  **Prioritize Recency:** For topics about current events, give strong preference to the provided web search context.
            3.  **Use Internal Knowledge:** For general knowledge (math, history, science), rely on your established training.
            4.  **Be Decisive:** If evidence is strong, provide a "Real" or "Fake" verdict. Use "Unverified" only if the evidence is truly contradictory, sparse, or from non-reputable sources.

            **Output Format:**
            Respond in this exact JSON format. Do not include any text, markdown, or commentary before or after the JSON object.
            {
              "verdict": "Real" | "Fake" | "Unverified",
              "explanation": "A neutral, concise summary (3-5 sentences) explaining your conclusion based on the evidence.",
              "reasoning": "A single sentence explaining the primary basis for your verdict (e.g., 'Based on corroborating reports from major news outlets.' or 'Based on fundamental scientific principles.').",
              "sources": ["URL1", "URL2", "URL3"]
            }
        `;

        const modelName = 'gemini-2.0-flash';

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    response_mime_type: "application/json",
                    temperature: 0.1
                },
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            }
        );

        const geminiJson = JSON.parse(response.data.candidates[0].content.parts[0].text);
        geminiJson.sources = searchResults.slice(0, 3).map(r => r.link);
        return geminiJson;

    } catch (error) {
        console.error(chalk.red('[Gemini Error]'), error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        return {
            verdict: "Error",
            explanation: "The AI analysis failed due to a technical error while communicating with the API.",
            reasoning: "The connection to the language model failed or the response was invalid.",
            sources: searchResults.slice(0, 3).map(r => r.link),
        };
    }
}

// --- STARTUP VALIDATION & SERVER LAUNCH ---

async function validateApiKeys() {
    console.log('--- Validating API Keys & Services ---');

    // Validate Serper API Key
    if (!process.env.SERPER_API_KEY) {
        console.log(chalk.red('❌ SERPER_API_KEY: Not found in .env file.'));
    } else {
        try {
            await axios.post('https://google.serper.dev/search', {
                q: 'test'
            }, {
                headers: {
                    'X-API-KEY': process.env.SERPER_API_KEY
                }
            });
            console.log(chalk.green('✅ Serper API Key: Valid and working.'));
        } catch (error) {
            const status = error.response ? `Status: ${error.response.status}` : 'Connection Failed';
            console.log(chalk.red(`❌ Serper API Key: Invalid or failed to connect. (${status})`));
        }
    }

    // Validate Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
        console.log(chalk.red('❌ Gemini API Key: Not found in .env file.'));
    } else {
        try {
            const modelName = 'gemini-2.0-flash';
            await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    contents: [{
                        parts: [{
                            text: "hello"
                        }]
                    }]
                }
            );
            console.log(chalk.green(`✅ Gemini API Key: Valid and working with model '${modelName}'.`));
        } catch (error) {
            const status = error.response ? `Status: ${error.response.status}` : 'Connection Failed';
            console.log(chalk.red(`❌ Gemini API Key: Invalid or failed to connect. Check key and API settings. (${status})`));
        }
    }
    console.log('------------------------------------');
}

async function startServer() {
    console.log(chalk.blue(`🚀 Misinformation Checker backend starting on port ${PORT}`));
    await validateApiKeys();
    app.listen(PORT, () => {
        console.log(chalk.green('✅ Server is now running and ready for requests.'));
    });
}

// for production
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is now running on port ${PORT}`);
});

startServer();