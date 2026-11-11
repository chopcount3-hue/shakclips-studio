const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto('file://' + __dirname + '/compose.html'); await p.evaluate(() => window.draw());
  await p.screenshot({ path: __dirname + '/thumb_full.png' }); await b.close(); })();
