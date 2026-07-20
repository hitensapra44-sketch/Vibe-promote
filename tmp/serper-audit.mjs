const https = require('https');

const SERPER_API_KEY = process.env.SERPER_API_KEY;
if (!SERPER_API_KEY) {
  console.error('Missing SERPER_API_KEY environment variable');
  process.exit(1);
}

const patterns = [
  { label: '1', q: 'site:reddit.com marketing automation' },
  { label: '2', q: 'reddit.com/r/SaaS marketing automation' },
  { label: '3', q: 'site:reddit.com/r/SaaS marketing automation' },
  { label: '4', q: 'marketing automation' },
  { label: '5', q: 'SaaS marketing automation reddit' },
];

function request(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ q: query, num: 10 });
    const options = {
      hostname: 'google.serper.dev',
      path: '/search',
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const p of patterns) {
    console.log(`\n=== Testing pattern ${p.label}: "${p.q}" ===`);
    try {
      const res = await request(p.q);
      console.log(`Status: ${res.status}`);
      console.log(`Body: ${res.body}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
})();
