const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2]; const ts = process.argv[3].split(',').map(Number);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('[err]', e.message.slice(0, 2000))); p.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text().slice(0, 500)); });
  await p.goto('file://' + __dirname + '/index.html'); console.log(JSON.stringify(await p.evaluate(() => window.ready)));
  for (const t of ts) { const t0 = Date.now(); const r = await p.evaluate(t => window.renderFrame(t), t); await p.screenshot({ path: `${out}_${t}.jpg`, type: 'jpeg', quality: 80 }); console.log(t, JSON.stringify(r), Date.now() - t0, 'ms'); }
  await b.close();
})();
