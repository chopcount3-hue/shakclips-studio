// usage: node short.js <t0> <t1> "<headline line 1>" "<headline line 2>" <out.mp4> ["END|TEXT"]
// renders a vertical 1080x1920 Short from this project's shots, cutting mix.wav to match
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs');
const [t0, t1] = [Number(process.argv[2]), Number(process.argv[3])], h1 = process.argv[4] || '', h2 = process.argv[5] || '', OUT = process.argv[6] || 'short.mp4', ENDT = process.argv[7] || 'FULL STORY|ON THE CHANNEL';
const FPS = 30, TAIL = 1.8, DUR = t1 - t0 + TAIL, N = Math.round(DUR * FPS), DIR = __dirname;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('[err]', e.message.slice(0, 500)));
  await p.goto('file://' + DIR + '/vshort.html'); await p.evaluate(() => window.ready);
  await p.evaluate(o => window.setShort(o), { t0, t1, headline: [h1, h2], endText: ENDT });
  const tmp = DIR + '/short_video.tmp.mp4';
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp]);
  const done = new Promise(r => ff.on('close', r));
  for (let f = 0; f < N; f++) { await p.evaluate(t => window.renderV(t), f / FPS); const buf = await p.screenshot({ type: 'jpeg', quality: 92 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 300 === 0) console.log('short frame', f, '/', N); }
  ff.stdin.end(); const code = await done; await b.close(); if (code !== 0) { console.log('ffmpeg failed'); process.exit(1); }
  const fo = (t1 - t0 - 0.4).toFixed(2);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-ss', String(t0), '-t', (t1 - t0).toFixed(2), '-i', DIR + '/mix.wav', '-filter_complex', `[1:a]afade=t=in:d=0.05,afade=t=out:st=${fo}:d=0.4,apad=whole_dur=${DUR.toFixed(2)}[a]`, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', DIR + '/' + OUT]);
  fs.unlinkSync(tmp); console.log('SHORT DONE', OUT, DUR.toFixed(2) + 's');
})();
