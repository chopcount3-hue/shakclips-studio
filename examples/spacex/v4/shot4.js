const { chromium } = require('playwright');
(async () => { const [q, out] = [process.argv[2] || '', process.argv[3] || 'catch4_full.png'];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto('file://' + __dirname + '/catch4.html' + q); await p.evaluate(() => window.draw()); await p.screenshot({ path: __dirname + '/' + out }); await b.close(); })();
