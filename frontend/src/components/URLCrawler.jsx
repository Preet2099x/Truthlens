import { useState } from 'react';

const URLCrawler = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Failed to analyze URL: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setUrl('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          URL Content Fact Checker
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter a website URL to extract and verify factual claims from its content
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a complete URL starting with http:// or https://
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!url.trim() || loading}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              !url.trim() || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing URL...</span>
              </div>
            ) : (
              'Analyze URL Content'
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-8 space-y-6">
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
                <button
                  onClick={clearResults}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Results
                </button>
              </div>

              {/* URL and Title */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Analyzed URL:</h3>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {result.url}
                </a>
                {result.title && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Page Title:</p>
                    <p className="font-medium text-gray-800">{result.title}</p>
                  </div>
                )}
              </div>

              {/* Content Summary */}
              {result.summary && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-800 mb-2">Content Summary:</h3>
                  <p className="text-blue-700">{result.summary}</p>
                </div>
              )}

              {/* Extracted Claims */}
              {result.extractedClaims && result.extractedClaims.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-purple-800 mb-2">Extracted Claims:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.extractedClaims.map((claim, index) => (
                      <li key={index} className="text-purple-700">
                        {claim}
                        {result.verifiedClaim === claim && (
                          <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                            ✓ Verified
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verified Claim */}
              {result.verifiedClaim && (
                <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-indigo-800 mb-2">Claim Being Verified:</h3>
                  <p className="text-indigo-700 italic">"{result.verifiedClaim}"</p>
                </div>
              )}

              {/* Fact Check Result */}
              {result.factCheck && (
                <div className={`rounded-lg p-4 border-l-4 ${
                  result.factCheck.verdict === 'Real' 
                    ? 'bg-green-50 border-green-500' 
                    : result.factCheck.verdict === 'Fake'
                    ? 'bg-red-50 border-red-500'
                    : result.factCheck.verdict === 'No Claims'
                    ? 'bg-gray-50 border-gray-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      result.factCheck.verdict === 'Real' 
                        ? 'bg-green-500' 
                        : result.factCheck.verdict === 'Fake'
                        ? 'bg-red-500'
                        : result.factCheck.verdict === 'No Claims'
                        ? 'bg-gray-500'
                        : 'bg-yellow-500'
                    }`}>
                      {result.factCheck.verdict === 'Real' ? '✓' : 
                       result.factCheck.verdict === 'Fake' ? '✗' : 
                       result.factCheck.verdict === 'No Claims' ? '-' : '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        result.factCheck.verdict === 'Real' 
                          ? 'text-green-800' 
                          : result.factCheck.verdict === 'Fake'
                          ? 'text-red-800'
                          : result.factCheck.verdict === 'No Claims'
                          ? 'text-gray-800'
                          : 'text-yellow-800'
                      }`}>
                        Verdict: {result.factCheck.verdict}
                      </h3>
                      <p className={`mt-2 ${
                        result.factCheck.verdict === 'Real' 
                          ? 'text-green-700' 
                          : result.factCheck.verdict === 'Fake'
                          ? 'text-red-700'
                          : result.factCheck.verdict === 'No Claims'
                          ? 'text-gray-700'
                          : 'text-yellow-700'
                      }`}>
                        {result.factCheck.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default URLCrawler;