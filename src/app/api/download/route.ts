import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { PassThrough } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max duration for Vercel Hobby tier is 10s usually, but we declare 60s in case they are on Pro.

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playlistUrl = searchParams.get('playlistUrl');

  if (!playlistUrl) {
    return new NextResponse('Missing playlistUrl parameter', { status: 400 });
  }

  try {
    // 1. Fetch the master playlist to find the highest quality video
    const masterRes = await fetch(playlistUrl);
    const masterText = await masterRes.text();

    const lines = masterText.split('\n');
    let variantUrl = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('.m3u8') && !lines[i].startsWith('#')) {
        variantUrl = lines[i].trim();
        if (!variantUrl.startsWith('http')) {
          const baseUrl = playlistUrl.substring(0, playlistUrl.lastIndexOf('/') + 1);
          variantUrl = baseUrl + variantUrl;
        }
        break; 
      }
    }

    if (!variantUrl) {
       variantUrl = playlistUrl;
    }

    // 2. Setup the PassThrough stream to capture FFmpeg output
    const passThrough = new PassThrough();

    // 3. Convert Node stream to Web ReadableStream for Next.js Response
    const webStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      },
      cancel() {
        passThrough.destroy();
      }
    });

    // 4. Remux HLS directly to MP4 format using FFmpeg
    ffmpeg(variantUrl)
      .inputOptions([
        '-reconnect 1',
        '-reconnect_streamed 1',
        '-reconnect_delay_max 5'
      ])
      .outputOptions([
        '-c copy',     // Copy streams without re-encoding (extremely fast, 0 server load)
        '-f mp4',      // Output format is MP4
        '-movflags frag_keyframe+empty_moov' // Crucial for streaming MP4 over a pipe
      ])
      .on('error', (err) => {
        console.error('FFmpeg streaming error:', err);
        passThrough.destroy(err);
      })
      .on('end', () => {
        console.log('FFmpeg stream finished successfully');
      })
      .pipe(passThrough, { end: true });

    // 5. Stream the true MP4 container directly to the user
    return new NextResponse(webStream, {
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
