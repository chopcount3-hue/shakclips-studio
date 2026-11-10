const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto('file://' + __dirname + '/mid.html');
  for (const v of (process.argv[2] || 'wave,history').split(',')) { await p.evaluate(v => { const c = document.getElementById('c'); const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1920, 1080); return window.draw({ v }); }, v); await p.screenshot({ path: `${__dirname}/mid_${v}.png` }); }
  await b.close(); })();
