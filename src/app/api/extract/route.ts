import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Parse Bluesky URL: https://bsky.app/profile/username.bsky.social/post/3kl24
    const urlPattern = /bsky\.app\/profile\/([^\/]+)\/post\/([a-zA-Z0-9]+)/;
    const match = url.match(urlPattern);

    if (!match) {
      return NextResponse.json({ error: 'Invalid Bluesky URL format' }, { status: 400 });
    }

    const handle = match[1];
    const postId = match[2];

    // 1. Resolve Handle to DID
    const resolveRes = await fetch(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`);
    if (!resolveRes.ok) {
      return NextResponse.json({ error: 'Could not resolve user handle' }, { status: 404 });
    }
    const resolveData = await resolveRes.json();
    const did = resolveData.did;

    // 2. Fetch Post Thread
    const uri = `at://${did}/app.bsky.feed.post/${postId}`;
    const threadRes = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${uri}&depth=0`);
    
    if (!threadRes.ok) {
      return NextResponse.json({ error: 'Could not fetch post data' }, { status: 404 });
    }

    const threadData = await threadRes.json();
    
    // 3. Extract Media (Video or Images)
    const post = threadData.thread?.post;
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let playlist = null;
    let thumbnail = null;
    let images = null;

    const extractMedia = (embedObj: any) => {
      if (!embedObj) return;

      if (embedObj.$type === 'app.bsky.embed.video#view') {
        playlist = embedObj.playlist;
        thumbnail = embedObj.thumbnail;
      } else if (embedObj.$type === 'app.bsky.embed.images#view') {
        images = embedObj.images; // Array of { fullsize, thumb, alt }
      } else if (embedObj.$type === 'app.bsky.embed.recordWithMedia#view') {
        extractMedia(embedObj.media);
      } else if (embedObj.$type === 'app.bsky.embed.record#view') {
        if (embedObj.record?.embeds) {
          embedObj.record.embeds.forEach(extractMedia);
        }
      }
    };

    extractMedia(post.embed);

    if (!playlist && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'No video or images found in this post' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      mediaType: playlist ? 'video' : 'images',
      playlist,
      thumbnail,
      images,
      text: post.record?.text || ''
    });

  } catch (error) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
