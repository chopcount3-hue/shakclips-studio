const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => window.ready);
  const r = await p.evaluate(() => ({ cues: window.getCues(), total: window.TOTAL_DUR, storyEnd: STORY_END, sec: { fall: S(47) - 0.1, death: S(52) - 0.1, callback: S(52) - 0.1 } }));
  require('fs').writeFileSync('cues.json', JSON.stringify(r)); const ty = {}; r.cues.forEach(c => ty[c[1]] = (ty[c[1]] || 0) + 1); console.log(r.total, JSON.stringify(ty)); await b.close(); })();
