const instances = [
  'https://api.invidious.io',
  'https://invidious.io',
  'https://redirect.invidious.io',
  'https://yewtu.be',
];

const endpoints = ['/api/v1/trending', '/api/v1/explore', '/api/v1/search?q=test'];

async function probe() {
  console.log('Probing Invidious instances for common API endpoints (checking Content-Type)...');
  for (const inst of instances) {
    console.log(`Instance: ${inst}`);
    for (const ep of endpoints) {
      const url = `${inst}${ep}`;
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
        clearTimeout(timeout);
        const ms = Date.now() - start;
        const ct = res.headers.get('content-type') || '';
        if (!res.ok) {
          console.log(`  ${ep} -> HTTP ${res.status} (${ms}ms) Content-Type: ${ct}`);
          continue;
        }
        if (ct.includes('application/json') || ct.includes('json')) {
          const json = await res.json();
          console.log(`  ${ep} -> JSON OK (${ms}ms), items: ${Array.isArray(json) ? json.length : 'n/a'}`);
          console.log('  sample:', JSON.stringify((json || []).slice(0,3), null, 2));
        } else {
          const text = await res.text();
          console.log(`  ${ep} -> NON-JSON (${ms}ms), Content-Type: ${ct}`);
          console.log('  sample:', text.slice(0, 300).replace(/\n/g, ' '));
        }
      } catch (err) {
        console.log(`  ${ep} -> ERROR (${err && err.message ? err.message : err})`);
      }
    }
    console.log('---');
  }
}

probe();
