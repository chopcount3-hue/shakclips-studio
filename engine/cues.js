// Exports SFX cues + music sections for audio.py. Edit `sec` per video:
//   fall: tense music starts, death: somber pad starts, callback: bright music returns (use S(i) sentence starts).
//   Leave all three = TOTAL_DUR for a video that stays upbeat. alcatraz is optional.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + __dirname + '/index.html'); await p.evaluate(() => window.ready);
  const r = await p.evaluate(() => ({ cues: window.getCues(), total: window.TOTAL_DUR, storyEnd: STORY_END,
    sec: (window.MUSIC_SEC || { fall: window.TOTAL_DUR, death: window.TOTAL_DUR, callback: window.TOTAL_DUR }) }));
  require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify(r)); const ty = {}; r.cues.forEach(c => ty[c[1]] = (ty[c[1]] || 0) + 1); console.log(r.total, JSON.stringify(ty)); await b.close(); })();
