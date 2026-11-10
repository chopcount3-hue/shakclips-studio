const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const FPS = 30, DIR = __dirname + '/scenes', SEG = 1200;
(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('[err]', e.message.slice(0, 2000)));
  await p.goto('file://' + __dirname + '/index.html'); const info = await p.evaluate(() => window.ready);
  const N = Math.round(info.total * FPS);
  for (let s = 0; s * SEG < N; s++) {
    const fin = `${DIR}/s${String(s).padStart(2, '0')}.mp4`, tmp = fin.replace('.mp4', '.tmp.mp4');
    if (fs.existsSync(fin)) { console.log('skip', s); continue; }
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp]);
    ff.stderr.on('data', d => process.stdout.write('[ff] ' + d)); const done = new Promise(r => ff.on('close', r)); const t0 = Date.now();
    for (let f = s * SEG; f < Math.min(N, (s + 1) * SEG); f++) {
      await p.evaluate(t => window.renderFrame(t), f / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 300 === 0) console.log(`frame ${f}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); const code = await done;
    if (code === 0) { fs.renameSync(tmp, fin); console.log(`seg ${s} done ${((Date.now() - t0) / 1000).toFixed(0)}s`); } else console.log('ffmpeg failed', code);
  }
  await b.close(); console.log('RENDER DONE', N);
})();
