#!/usr/bin/env node
/* ============================================================================
   render.js - drive gl3d.html in headless Chromium and write PNGs.

   usage:
     node render.js <scene> <out.png> [WxH] [ss] [--mask out_mask.png] [--steps N]

   examples:
     node render.js nvidia-chip frame.png 1920x1080 2 --mask frame_mask.png
     node render.js nvidia-chip prev.png 640x360 1

   Deterministic: the page uses no Math.random() and no time uniform, so the
   same arguments always produce the same bytes.
   ========================================================================= */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const flags = {};
const pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { flags[argv[i].slice(2)] = argv[i + 1]; i++; }
  else pos.push(argv[i]);
}
const scene = pos[0] || 'nvidia-chip';
const outPath = path.resolve(pos[1] || 'frame.png');
const res = (pos[2] || '1920x1080').split('x').map(Number);
const ss = pos[3] || '2';
const W = res[0], H = res[1];

function writeDataURL(url, file) {
  const b64 = url.split(',')[1];
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  return fs.statSync(file).size;
}

(async () => {
  const t0 = Date.now();
  const browser = await chromium.launch({
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-lcd-text']
  });
  const page = await browser.newPage({ viewport: { width: 400, height: 300 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('[pageerror] ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || /ERROR/.test(m.text())) errs.push('[console] ' + m.text()); });

  let q = `?scene=${encodeURIComponent(scene)}&w=${W}&h=${H}&ss=${ss}`;
  if (flags.steps) q += `&steps=${flags.steps}`;
  if (flags.q) q += '&' + flags.q;   // raw extra params, e.g. --q "p.bloom=0&p.maxCoC=0"
  const url = 'file://' + path.join(__dirname, 'gl3d.html') + q;
  await page.goto(url, { timeout: 600000 });
  await page.waitForFunction(() => window.done === true, null, { timeout: 600000 });

  const err = await page.evaluate(() => window.err || null);
  if (err) { console.error('SHADER/RUNTIME ERROR:\n' + err); errs.forEach(e => console.error(e)); await browser.close(); process.exit(1); }

  const stats = await page.evaluate(() => window.stats);
  const beauty = await page.evaluate(() => window.outBeauty);
  const sz = writeDataURL(beauty, outPath);
  let msz = 0;
  if (flags.mask) {
    const mask = await page.evaluate(() => window.outMask);
    msz = writeDataURL(mask, path.isAbsolute(flags.mask) ? flags.mask : path.resolve(flags.mask));
  }
  await browser.close();
  const wall = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(JSON.stringify({
    scene, out: outPath, res: `${W}x${H}`, ss: Number(ss),
    gpu_ms: stats.ms, passes: stats.log, wall_s: Number(wall),
    bytes: sz, mask: flags.mask ? { path: flags.mask, bytes: msz } : null
  }, null, 1));
  if (errs.length) { console.error(errs.join('\n')); }
})();
