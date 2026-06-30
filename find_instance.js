async function findInstance() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/imputnet/cobalt/current/instances.json');
    if (!res.ok) {
      console.log('Failed to fetch instances list from Github');
      return;
    }
    const data = await res.json();
    console.log('Total instances:', data.length);
    
    for (const instance of data) {
      const url = instance.api || instance.url;
      if (!url) continue;
      
      const testUrl = url.endsWith('/') ? `${url}api/json` : `${url}/api/json`;
      console.log('Testing', testUrl);
      
      try {
        // Test CORS Preflight
        const optRes = await fetch(testUrl, {
          method: 'OPTIONS',
          headers: {
            'Origin': 'https://bskyvideo.com',
            'Access-Control-Request-Method': 'POST'
          }
        });
        
        if (optRes.ok) {
          console.log('SUCCESS! Active instance allowing CORS:', testUrl);
          return testUrl;
        } else {
          console.log(`Failed OPTIONS on ${testUrl} with status: ${optRes.status}`);
        }
      } catch (err) {
        console.log(`Error testing ${testUrl}: ${err.message}`);
      }
    }
  } catch(e) {
    console.error(e);
  }
}
findInstance();
