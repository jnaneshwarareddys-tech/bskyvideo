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

    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { randomUUID } = require('crypto');

    // 2. Create a temporary file path
    const tmpPath = path.join(os.tmpdir(), `${randomUUID()}.mp4`);

    // 3. Remux HLS to MP4 format and save to the temp file
    await new Promise((resolve, reject) => {
      ffmpeg(variantUrl)
        .inputOptions([
          '-reconnect 1',
          '-reconnect_streamed 1',
          '-reconnect_delay_max 5'
        ])
        .outputOptions([
          '-c copy',             // Copy streams without re-encoding
          '-bsf:a aac_adtstoasc', // Convert AAC ADTS to ASC for valid MP4
          '-f mp4'               // Output format is MP4
        ])
        .save(tmpPath)
        .on('error', (err: any) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .on('end', () => {
          console.log('FFmpeg processing finished successfully');
          resolve(null);
        });
    });

    // 4. Read the perfect MP4 file from disk
    const fileStream = fs.createReadStream(tmpPath);

    // 5. Convert Node stream to Web ReadableStream for Next.js Response
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => {
          controller.close();
          // Clean up temp file immediately after download finishes
          fs.unlink(tmpPath, () => {});
        });
        fileStream.on('error', (err) => {
          controller.error(err);
          fs.unlink(tmpPath, () => {});
        });
      },
      cancel() {
        fileStream.destroy();
        fs.unlink(tmpPath, () => {});
      }
    });

    // 6. Stream the true MP4 container directly to the user
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
