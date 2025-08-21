// controllers/factCheckController.js
import { searchWithSerper } from '../services/serperService.js';
import { analyzeWithGemini } from '../services/geminiService.js';

export const handleFactCheck = async (req, res) => { // Use export
    try {
        const { claim } = req.body;
        if (!claim || typeof claim !== 'string' || claim.length > 500) {
            return res.status(400).json({ error: 'Invalid claim provided.' });
        }
        console.log(`Processing claim: "${claim}"`);
        const searchResults = await searchWithSerper(claim);
        const analysis = await analyzeWithGemini(claim, searchResults);
        analysis.sources = searchResults.slice(0, 3).map(r => r.link);
        res.json(analysis);
    } catch (error) {
        console.error('Error in factCheckController:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};