async function search() {
  const res = await fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=video&limit=20');
  const data = await res.json();
  for (const post of data.posts) {
    if (post.embed && post.embed.$type === 'app.bsky.embed.video#view') {
      console.log('Found video post:', post.uri);
      
      const record = post.record;
      if (record?.embed?.video) {
        const videoBlob = record.embed.video;
        if (videoBlob.ref && videoBlob.ref.$link) {
          const cid = videoBlob.ref.$link;
          const did = post.author.did;
          const blobUrl = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${cid}`;
          console.log('Blob URL:', blobUrl);

          const headRes = await fetch(blobUrl, { method: 'HEAD' });
          console.log('Blob fetch status:', headRes.status);
          console.log('Blob content-type:', headRes.headers.get('content-type'));
          console.log('Blob length:', headRes.headers.get('content-length'));
          return;
        }
      }
    }
  }
  console.log('No video found in search');
}
search();
