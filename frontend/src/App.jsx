import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import OCRTest from './components/OCRTest.jsx'
import URLCrawler from './components/URLCrawler.jsx'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'ocr':
        return <OCRTest />;
      case 'crawler':
        return <URLCrawler />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4">TruthLens</h1>
              <p className="text-xl mb-8">AI-Powered Fact Checking Platform</p>
              <div className="space-x-4">
                <button
                  onClick={() => setCurrentPage('ocr')}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Test OCR Fact Checker
                </button>
                <button
                  onClick={() => setCurrentPage('crawler')}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Test URL Crawler
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className="text-xl font-bold text-green-600 hover:text-green-700"
              >
                TruthLens
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('ocr')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'ocr'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                OCR Test
              </button>
              <button
                onClick={() => setCurrentPage('crawler')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'crawler'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                URL Crawler
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={currentPage === 'home' ? '' : 'py-8'}>
        {renderPage()}
      </main>
    </div>
  )
}

export default App
