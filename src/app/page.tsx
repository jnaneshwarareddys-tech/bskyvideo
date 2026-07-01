'use client';

import { useState } from 'react';
import AdBanner from '@/components/AdBanner';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    mediaType?: 'video' | 'images',
    playlist?: string, 
    thumbnail?: string, 
    images?: any[],
    text: string 
  } | null>(null);
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

      setResult({
        mediaType: data.mediaType,
        playlist: data.playlist,
        thumbnail: data.thumbnail,
        images: data.images,
        text: data.text || 'Download ready! Click below to save your file.'
      });
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
        <span className="text-2xl font-extrabold tracking-tight text-corporate-blue">bskyvideo</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-8 mt-12 w-full max-w-3xl mx-auto space-y-12">
        
        {/* Ad Placement 1 */}
        <AdBanner dataKey="ff67f388d02f31fc48868e6a5124ba4e" width={728} height={90} />

        <div className="w-full text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">Bluesky Video Downloader</h1>
          <p className="text-lg text-slate-500">The fastest tool to download Bluesky videos and GIFs to your device in MP4 format.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleExtract} className="w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="relative">
            <input 
              type="url" 
              required
              placeholder="https://bsky.app/profile/username/post/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-5 pr-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-corporate-blue focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none text-lg transition-all bg-slate-50 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  if (text) setUrl(text);
                } catch (err) {
                  console.error('Failed to read clipboard', err);
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-corporate-blue bg-white dark:bg-slate-800 p-2 rounded-lg transition-colors"
              title="Paste from clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              </svg>
            </button>
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
            {result.mediaType === 'video' || result.playlist ? (
              <>
                <div className="w-full sm:w-1/2 rounded-xl overflow-hidden shadow-md">
                  <img src={result.thumbnail} alt="Video Thumbnail" className="w-full h-auto object-cover" />
                </div>
                <div className="w-full sm:w-1/2 space-y-6">
                  <p className="text-slate-600 dark:text-slate-300 italic line-clamp-3">"{result.text}"</p>
                  
                  <a 
                    href={`/api/download?playlistUrl=${encodeURIComponent(result.playlist || '')}`}
                    download="bluesky_video.mp4"
                    className="block w-full p-4 text-center rounded-xl bg-corporate-blue text-white font-bold hover:bg-corporate-blue-hover transition-colors shadow-md"
                  >
                    Download Video (.mp4)
                  </a>
                  <p className="text-xs text-slate-400 text-center">Downloads directly to your device. Plays seamlessly on all modern devices.</p>
                </div>
              </>
            ) : (
              <div className="w-full flex flex-col space-y-6">
                {result.text && <p className="text-slate-600 dark:text-slate-300 italic text-center">"{result.text}"</p>}
                <div className={`grid gap-6 ${result.images && result.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
                  {result.images?.map((img, idx) => (
                    <div key={idx} className="flex flex-col space-y-3">
                      <div className="w-full rounded-xl overflow-hidden shadow-md bg-slate-100 dark:bg-slate-800">
                        <img src={img.thumb || img.fullsize} alt={`Image ${idx + 1}`} className="w-full h-auto object-cover aspect-auto" />
                      </div>
                      <a 
                        href={`/api/downloadImage?url=${encodeURIComponent(img.fullsize)}`}
                        download={`bluesky_image_${idx + 1}.jpg`}
                        className="block w-full p-3 text-center rounded-xl bg-corporate-blue text-white font-bold hover:bg-corporate-blue-hover transition-colors shadow-sm text-sm"
                      >
                        Download HD Image
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Content Section */}
        <section className="w-full max-w-2xl text-left space-y-8 mt-12 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How to Download Bluesky Videos</h2>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>Open the Bluesky app or website and find the post with the video or GIF you want to save.</li>
              <li>Click the <strong>Share</strong> button and select <strong>Copy Link</strong>.</li>
              <li>Paste the copied URL into our <strong>Bluesky video downloader</strong> input box above.</li>
              <li>Click <strong>Extract Video</strong> and save the high-quality MP4 file directly to your device!</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Best Bsky Video Downloader</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              bskyvideo.com is the fastest and most secure <strong>Bluesky video downloader</strong> on the web. Our tool extracts media directly from the Bluesky (bsky.app) CDN, ensuring you get the highest quality MP4 files without any watermarks or compression. 
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Whether you are looking to <strong>download a bsky video</strong> on your iPhone, Android, or PC, our service is 100% free and requires no software installation or account sign-ups. Simply paste the link and download!
            </p>
          </div>
        </section>

        {/* Ad Placement 2 */}
        <div className="mt-12">
          <AdBanner dataKey="1f7f1ca1c92d1afb51d731ef97d253ed" width={300} height={250} />
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full p-8 border-t border-slate-200 dark:border-slate-800 mt-auto text-center text-slate-500 text-sm bg-white dark:bg-slate-900">
        <p>&copy; {new Date().getFullYear()} bskyvideo.com. Not affiliated with Bluesky.</p>
      </footer>
    </div>
  );
}
