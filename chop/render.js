// Full render: one encoded mp4 per scene (6 rounds + end card), then concat.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const FPS = 30;
(async () => {
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  fs.mkdirSync(__dirname + '/' + (process.env.SCENES || 'scenes'), { recursive: true });
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('[err]', e.message.slice(0, 2000)));
  await p.goto('file://' + __dirname + '/' + (process.env.ENGINE || 'engine.html'));
  await p.evaluate(() => window.ready);
  const info = await p.evaluate(() => window.getInfo());
  fs.writeFileSync(__dirname + '/' + (process.env.SCENES || 'scenes') + '_timeline.json', JSON.stringify({ info, cuts: await p.evaluate(() => window.cutTimes()) }));
  const scenes = info.rounds.map((r, i) => ({ i, a: r.start, b: r.start + r.dur }));
  scenes.push({ i: 6, a: info.END_START, b: info.TOTAL_DUR });
  const hists = {};
  for (const sc of scenes) {
    if (only && !only.includes(sc.i)) continue;
    if (sc.i === 6 && only && !only.includes(5)) await p.evaluate(() => window.setupRound(5));  // end card shows the final pile
    if (sc.i < 6) { await p.evaluate(ri => window.setupRound(ri), sc.i); hists[sc.i] = await p.evaluate(() => window.getHist()); fs.writeFileSync(__dirname + `/${process.env.SCENES || 'scenes'}_hist_${sc.i}.json`, JSON.stringify(hists[sc.i])); }
    const f0 = Math.ceil(sc.a * FPS - 1e-6), f1 = Math.ceil(sc.b * FPS - 1e-6);
    const tmp = __dirname + `/${process.env.SCENES || 'scenes'}/s${sc.i}.tmp.mp4`, fin = __dirname + `/${process.env.SCENES || 'scenes'}/s${sc.i}.mp4`;
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp]);
    ff.stderr.on('data', d => process.stdout.write('[ff] ' + d));
    const done = new Promise(res => ff.on('close', res));
    const t0 = Date.now();
    for (let f = f0; f < f1; f++) {
      await p.evaluate(t => window.renderFrame(t), f / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 30 === 0) console.log(`scene ${sc.i} frame ${f - f0}/${f1 - f0} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    const code = await done;
    if (code === 0) { fs.renameSync(tmp, fin); console.log(`scene ${sc.i} done ${f1 - f0} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
    else console.log('ffmpeg failed', code);
  }
  await b.close();
  console.log('ALL DONE');
})();
