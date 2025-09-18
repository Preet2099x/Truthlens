import axios from 'axios';
import * as cheerio from 'cheerio';
import URL from 'url-parse';
import { handleFactCheck } from './factCheckController.js';

// Function to validate if URL is accessible and safe
async function validateURL(urlString) {
  try {
    const url = new URL(urlString);
    
    // Basic URL validation
    if (!url.protocol || !url.hostname) {
      throw new Error('Invalid URL format');
    }
    
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are allowed');
    }
    
    // Block common malicious or problematic domains
    const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0', '192.168.'];
    if (blockedDomains.some(domain => url.hostname.includes(domain))) {
      throw new Error('Local or private network URLs are not allowed');
    }
    
    return url;
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
}

// Function to extract main content from HTML using Gemini
async function extractContentWithGemini(htmlContent, url) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing for content extraction");
  }

  try {
    // Clean up HTML content (remove scripts, styles, etc.)
    const $ = cheerio.load(htmlContent);
    $('script, style, nav, header, footer, .advertisement, .ads, .social-share').remove();
    
    // Extract text content
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Limit content length for Gemini API
    const limitedContent = textContent.substring(0, 8000);

    const prompt = `
You are analyzing content from a web page to extract factual claims that can be verified.

URL: ${url}
Content: "${limitedContent}"

Instructions:
1. Extract 1-3 main factual claims or statements from this content
2. Focus on verifiable facts, not opinions or subjective statements  
3. Ignore advertisements, navigation, or irrelevant content
4. Make claims clear and concise
5. If no meaningful claims can be found, respond with "NO_CLAIMS"

Respond ONLY with a JSON object in this format:
{
  "title": "Page title or main topic",
  "claims": ["First factual claim", "Second factual claim", "Third factual claim"],
  "summary": "Brief summary of the content"
}

If no claims found:
{
  "title": "Page title",
  "claims": [],
  "summary": "Content summary but no verifiable claims found"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }

    const geminiResponse = data.candidates[0].content.parts[0].text.trim();
    
    try {
      const parsed = JSON.parse(geminiResponse);
      return parsed;
    } catch (parseError) {
      // Fallback: extract basic content without Gemini
      const $ = cheerio.load(htmlContent);
      const title = $('title').text() || $('h1').first().text() || 'Unknown Title';
      const paragraphs = $('p').map((i, el) => $(el).text().trim()).get()
                              .filter(text => text.length > 50)
                              .slice(0, 3);
      
      return {
        title: title.substring(0, 200),
        claims: paragraphs,
        summary: paragraphs.join(' ').substring(0, 500)
      };
    }
  } catch (error) {
    console.error('Error extracting content with Gemini:', error);
    
    // Fallback: basic HTML parsing
    const $ = cheerio.load(htmlContent);
    const title = $('title').text() || $('h1').first().text() || 'Unknown Title';
    const paragraphs = $('p').map((i, el) => $(el).text().trim()).get()
                            .filter(text => text.length > 50)
                            .slice(0, 3);
    
    return {
      title: title.substring(0, 200),
      claims: paragraphs,
      summary: paragraphs.join(' ').substring(0, 500)
    };
  }
}

// Function to scrape URL content
async function scrapeURL(url) {
  try {
    const response = await axios.get(url.href, {
      timeout: 15000, // 15 second timeout
      maxRedirects: 5,
      headers: {
        'User-Agent': 'TruthLens-FactChecker/1.0 (Content Analysis Bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    });

    // Check if response is HTML
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html')) {
      throw new Error('URL does not contain HTML content');
    }

    return response.data;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      throw new Error('Website not found or unreachable');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - website took too long to respond');
    } else if (error.response) {
      throw new Error(`Website returned error: ${error.response.status} ${error.response.statusText}`);
    } else {
      throw new Error(`Failed to access website: ${error.message}`);
    }
  }
}

export const crawlAndVerify = async (req, res) => {
  try {
    const { url: urlString } = req.body;

    if (!urlString) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    const url = await validateURL(urlString);

    // Scrape the URL content
    const htmlContent = await scrapeURL(url);

    // Extract meaningful content using Gemini
    const extractedContent = await extractContentWithGemini(htmlContent, url.href);

    if (!extractedContent.claims || extractedContent.claims.length === 0) {
      return res.json({
        url: url.href,
        title: extractedContent.title,
        summary: extractedContent.summary,
        extractedClaims: [],
        factCheck: {
          verdict: "No Claims",
          explanation: "No verifiable factual claims could be extracted from this webpage."
        }
      });
    }

    // Use the first (most relevant) claim for fact-checking
    const claimToVerify = extractedContent.claims[0];

    // Create a mock request object for the fact check controller
    const mockReq = {
      body: { claim: claimToVerify }
    };

    // Create a mock response object to capture the fact check result
    let factCheckResult;
    const mockRes = {
      status: (statusCode) => ({
        json: (data) => {
          factCheckResult = { statusCode, data };
        }
      }),
      json: (data) => {
        factCheckResult = { statusCode: 200, data };
      }
    };

    // Call the fact check controller
    await handleFactCheck(mockReq, mockRes);

    // Return comprehensive result
    res.json({
      url: url.href,
      title: extractedContent.title,
      summary: extractedContent.summary,
      extractedClaims: extractedContent.claims,
      verifiedClaim: claimToVerify,
      factCheck: factCheckResult.data
    });

  } catch (error) {
    console.error('Crawler error:', error);
    res.status(500).json({ 
      error: 'Failed to crawl and verify URL', 
      details: error.message 
    });
  }
};