async function test() {
  const url = 'https://fxbsky.app/profile/cydelian.bsky.social/post/3kqj2m2g2kk2x';
  const res = await fetch(url);
  const text = await res.text();
  const match = text.match(/<meta property="og:video" content="([^"]+)"/);
  if (match) {
    console.log('Found MP4! ->', match[1]);
  } else {
    console.log('No video found in fxbsky html');
  }
}
test();
