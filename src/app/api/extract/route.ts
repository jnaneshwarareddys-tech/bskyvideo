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
    
    // 3. Extract Video Playlist (m3u8)
    const post = threadData.thread?.post;
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const embed = post.embed;
    if (!embed || embed.$type !== 'app.bsky.embed.video#view') {
      return NextResponse.json({ error: 'No video found in this post' }, { status: 400 });
    }

    const playlist = embed.playlist;
    const thumbnail = embed.thumbnail;

    return NextResponse.json({
      success: true,
      playlist,
      thumbnail,
      text: post.record?.text || ''
    });

  } catch (error) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
