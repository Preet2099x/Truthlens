// services/serperService.js
import axios from 'axios';

export async function searchWithSerper(query) { // Use export
    // ... function logic is the same
    if (!process.env.SERPER_API_KEY) {
        console.warn('Serper API key not found. Skipping web search.');
        return [];
    }
    try {
        const response = await axios.post('https://google.serper.dev/search', {
            q: `latest news on "${query}"`,
            gl: 'in',
            tbs: "qdr:w",
        }, {
            headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        });
        return (response.data.organic || []).slice(0, 5).map(result => ({
            title: result.title,
            snippet: result.snippet,
            link: result.link,
        }));
    } catch (error) {
        console.error('[Serper Service Error]', error.message);
        return [];
    }
}