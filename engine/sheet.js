const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('[err]', e.message.slice(0, 2000)));
  require('fs').mkdirSync(__dirname + '/pv', { recursive: true }); await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => window.ready);
  const mids = await p.evaluate(() => SHOTS.map(s => s.a + (s.b - s.a) * 0.7));
  const frac = Number(process.env.FRAC || 0.7);
  const ts = await p.evaluate((f) => SHOTS.map(s => s.a + (s.b - s.a) * f), frac);
  for (let i = 0; i < ts.length; i++) { await p.evaluate(t => window.renderFrame(t), ts[i]); await p.screenshot({ path: `${__dirname}/pv/s_${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 }); }
  console.log('done', ts.length); await b.close();
})();
