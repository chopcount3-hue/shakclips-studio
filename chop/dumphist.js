const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + __dirname + '/' + (process.env.ENGINE || 'engine.html')); await p.evaluate(() => window.ready);
  const out = { info: await p.evaluate(() => window.getInfo()), cuts: await p.evaluate(() => window.cutTimes()), hists: [] };
  for (let i = 0; i < 6; i++) { await p.evaluate(ri => window.setupRound(ri), i); out.hists.push(await p.evaluate(() => { const h = window.getHist(); return { t0: h.t0, hist: h.hist, N: 0 }; })); }
  fs.writeFileSync(__dirname + '/' + (process.env.OUT || 'audio_timeline.json'), JSON.stringify(out)); await b.close(); console.log('ok');
})();
