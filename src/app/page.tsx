'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ playlist: string, thumbnail: string, text: string } | null>(null);
  const [error, setError] = useState('');

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Artificial delay to increase ad dwell time (per business strategy)
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract video');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 p-6 flex justify-center items-center bg-white dark:bg-slate-900 shadow-sm z-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-corporate-blue">bskyvideo</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-8 mt-12 w-full max-w-3xl mx-auto space-y-12">
        
        {/* Ad Placement 1 */}
        <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-lg text-sm text-slate-400">
          Top Ad Placement (728x90)
        </div>

        <div className="w-full text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">Download Bluesky Videos</h2>
          <p className="text-lg text-slate-500">Paste any public Bluesky post URL to securely download the native video.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleExtract} className="w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <input 
              type="url" 
              required
              placeholder="https://bsky.app/profile/username/post/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-corporate-blue focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none text-lg transition-all bg-slate-50 dark:bg-slate-800 dark:text-white"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-5 rounded-xl bg-corporate-blue hover:bg-corporate-blue-hover text-white font-bold text-lg transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Extracting Media...</span>
              </span>
            ) : "Extract Video"}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="w-full p-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Result State */}
        {result && (
          <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="w-full sm:w-1/2 rounded-xl overflow-hidden shadow-md">
              <img src={result.thumbnail} alt="Video Thumbnail" className="w-full h-auto object-cover" />
            </div>
            <div className="w-full sm:w-1/2 space-y-6">
              <p className="text-slate-600 dark:text-slate-300 italic line-clamp-3">"{result.text}"</p>
              
              <a 
                href={result.playlist} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full p-4 text-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Open / Download Video stream
              </a>
              <p className="text-xs text-slate-400 text-center">Right-click the video and save, or use an HLS player.</p>
            </div>
          </div>
        )}

        {/* Ad Placement 2 */}
        <div className="w-full h-[250px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-lg text-sm text-slate-400 mt-12">
          Content Ad Placement (300x250)
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full p-8 border-t border-slate-200 dark:border-slate-800 mt-auto text-center text-slate-500 text-sm bg-white dark:bg-slate-900">
        <p>&copy; {new Date().getFullYear()} bskyvideo.com. Not affiliated with Bluesky.</p>
      </footer>
    </div>
  );
}
