const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto('file://' + __dirname + '/pro.html');
  for (const v of ['sold', 'capone', 'shadow']) { await p.evaluate(v => { const c = document.getElementById('c'); c.getContext('2d').setTransform(1, 0, 0, 1, 0, 0); c.getContext('2d').clearRect(0, 0, 1920, 1080); return window.draw({ v }); }, v); await p.screenshot({ path: `${__dirname}/pro_${v}.png` }); }
  await b.close(); })();
