const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 2700 } });
  await p.goto('file://' + __dirname + '/thumb.html'); await p.evaluate(() => document.fonts.ready);
  await (await p.$('#yt')).screenshot({ path: __dirname + '/ShakClips_Banana_thumbnail.png' });
  await (await p.$('#cover')).screenshot({ path: __dirname + '/ShakClips_Banana_cover.png' });
  await b.close();
})();
