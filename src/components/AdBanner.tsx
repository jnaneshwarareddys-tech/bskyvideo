'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  dataKey: string;
  width: number;
  height: number;
}

export default function AdBanner({ dataKey, width, height }: AdBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the ad has already been appended to prevent duplicates in strict mode
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const conf = document.createElement('script');
      conf.type = 'text/javascript';
      conf.innerHTML = `atOptions = {
        'key' : '${dataKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };`;

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.highperformanceformat.com/${dataKey}/invoke.js`;
      script.async = true;

      bannerRef.current.append(conf);
      bannerRef.current.append(script);
    }
  }, [dataKey, height, width]);

  return (
    <div 
      className="w-full flex justify-center items-center overflow-hidden bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800/50 transition-all"
      style={{ minHeight: `${height}px` }}
      ref={bannerRef}
    >
      {/* The Adsterra iframe will be injected here */}
    </div>
  );
}
