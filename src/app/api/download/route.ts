import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playlistUrl = searchParams.get('playlistUrl');

  if (!playlistUrl) {
    return new NextResponse('Missing playlistUrl parameter', { status: 400 });
  }

  try {
    // 1. Fetch the master playlist
    const masterRes = await fetch(playlistUrl);
    const masterText = await masterRes.text();

    // 2. Find the highest quality variant playlist
    const lines = masterText.split('\n');
    let variantUrl = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('.m3u8') && !lines[i].startsWith('#')) {
        variantUrl = lines[i].trim();
        // If it's a relative path, resolve it against the master playlist URL
        if (!variantUrl.startsWith('http')) {
          const baseUrl = playlistUrl.substring(0, playlistUrl.lastIndexOf('/') + 1);
          variantUrl = baseUrl + variantUrl;
        }
        break; // Just take the first one for speed
      }
    }

    if (!variantUrl) {
       // If it's not a master playlist but a media playlist directly, use the original URL
       variantUrl = playlistUrl;
    }

    // 3. Fetch the media playlist
    const mediaRes = await fetch(variantUrl);
    const mediaText = await mediaRes.text();

    // 4. Extract all .ts segment URLs
    const mediaLines = mediaText.split('\n');
    const segments: string[] = [];
    const baseUrl = variantUrl.substring(0, variantUrl.lastIndexOf('/') + 1);

    for (const line of mediaLines) {
      if (line.trim() && !line.startsWith('#')) {
        let segmentUrl = line.trim();
        if (!segmentUrl.startsWith('http')) {
          segmentUrl = baseUrl + segmentUrl;
        }
        segments.push(segmentUrl);
      }
    }

    if (segments.length === 0) {
      return new NextResponse('No video segments found', { status: 404 });
    }

    // 5. Create a ReadableStream that fetches and yields chunks sequentially
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (const url of segments) {
            const segmentRes = await fetch(url);
            if (!segmentRes.ok) {
              console.error(`Failed to fetch segment: ${url}`);
              continue;
            }
            
            const reader = segmentRes.body?.getReader();
            if (!reader) continue;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.      enqueue(value);
            }
          }
          controller.close();
        } catch (err) {
          console.error('Streaming error:', err);
          controller.error(err);
        }
      }
    });

    // 6. Return the stream with download headers
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="bluesky_video.mp4"',
      }
    });

  } catch (error) {
    console.error('Download Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
