'use client';

import { useState } from "react";

// Helper component for the Search Icon
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Helper component for the Logo
const FavGrabLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
    <path d="M12 6L12 12M12 12L15.5 15.5M12 12L8.5 15.5M12 12L15.5 8.5M12 12L8.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Result Card Component
const ResultCard = ({ iconUrl, title, downloadFilename }: { iconUrl: string, title: string, downloadFilename: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(iconUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    fetch(iconUrl)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        console.error('Download failed:', err);
        alert('Download failed!');
      });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="w-full h-32 bg-slate-50 rounded-md flex items-center justify-center mb-4 border">
        <img src={iconUrl} alt={title} className="max-w-full max-h-24 object-contain" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-2 truncate">{title}</h3>
      <div className="mt-auto flex items-center space-x-2">
        <button onClick={handleCopy} className="flex-1 text-center text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md transition-colors">
          {copied ? 'Copied!' : 'Copy URL'}
        </button>
        <button onClick={downloadImage} className="flex-1 text-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors">
          Download
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [faviconData, setFaviconData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');

  const fetchFavicon = async (url: string) => {
    setLoading(true);
    setError(null);
    setFaviconData(null);
    try {
      let fullUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        fullUrl = 'https://' + url;
      }
      const response = await fetch(`/api/favicon?url=${encodeURIComponent(fullUrl)}`);
      const data = await response.json();
      if (response.ok && (data.favicon || data.logo)) {
        setFaviconData(data);
      } else {
        setError(data.error || 'Could not find icons for this URL. Please check the address.');
      }
    } catch (err) {
      setError('Network request failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetFavicon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl) {
      fetchFavicon(inputUrl);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Header & Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <FavGrabLogo />
              <span className="text-xl font-semibold text-white">FavGrab</span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              GitHub
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-12 pb-20 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-5">Instantly Grab Website Icons</h1>
            <p className="text-lg text-white/70 max-w-3xl mx-auto mb-8">
              The perfect tool for developers and designers. Enter any website URL to extract its favicon and logo in seconds.
            </p>
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleGetFavicon} className="relative mb-5">
                <div className="flex items-center bg-white rounded-lg p-1.5 shadow-lg">
                  <div className="pl-4 pr-2 text-gray-400">
                    <SearchIcon />
                  </div>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Enter a website URL (e.g., google.com)"
                    className="w-full py-2.5 text-gray-900 placeholder-gray-500 bg-transparent focus:outline-none"
                  // required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleGetFavicon}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-md font-semibold transition-colors"
                  >
                    {loading ? 'Grabbing...' : 'Grab Icons'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-200 rounded-lg text-red-800 flex items-center justify-center space-x-3">
            <span>{error}</span>
          </div>
        )}

        {faviconData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {faviconData.favicon && (
              <ResultCard
                iconUrl={faviconData.favicon}
                title="Favicon"
                downloadFilename="favicon.ico"
              />
            )}
            {faviconData.logo && (
              <ResultCard
                iconUrl={faviconData.logo}
                title="Logo"
                downloadFilename="logo.png"
              />
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}