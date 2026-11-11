// Clean (no overlay) renders for thumbnails: node thumbshots.js outdir "ri:tl,..."
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2]; const shots = process.argv[3].split(',').map(s => s.split(':').map(Number));
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('[err]', e.message.slice(0, 1500)));
  await p.goto('file://' + __dirname + '/' + (process.env.ENGINE || 'engine.html')); await p.evaluate(() => window.ready);
  const info = await p.evaluate(() => window.getInfo());
  let cur = -1;
  for (const [ri, tl] of shots) {
    if (ri !== cur) { await p.evaluate(ri => window.setupRound(ri), ri); cur = ri; }
    await p.evaluate(t => window.renderFrame(t), info.rounds[ri].start + tl);
    await p.evaluate(() => { for (const id of ['vig','wm','wm2','cuts','pieces','ppp','hook','banner','flash']) document.getElementById(id).style.visibility = 'hidden'; });
    await p.screenshot({ path: `${out}/r${ri}_${tl}.png`, type: 'png' });
    await p.evaluate(() => { for (const id of ['vig','wm','wm2','cuts','pieces','ppp','hook','banner','flash']) document.getElementById(id).style.visibility = ''; });
    console.log('shot', ri, tl);
  }
  await b.close();
})();
