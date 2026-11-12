import json, os, subprocess, sys, numpy as np, glob
from faster_whisper import WhisperModel
FF = '/home/claude/untrusted/ffmpeg/ffmpeg-master-latest-linux64-gpl/bin/ffmpeg'
wm = WhisperModel('small.en', device='cpu', compute_type='int8', cpu_threads=4)
for f in sorted(glob.glob('/home/claude/untrusted/gta6_clips/*.mp4')):
    out = '/home/claude/gta6vid/tx/' + os.path.basename(f)[:-4] + '.json'
    if os.path.exists(out): continue
    pcm = subprocess.run([FF, '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    words = []
    for opts in ({'vad_filter': False}, {'vad_filter': True}):
        try:
            segs, _ = wm.transcribe(x, beam_size=3, word_timestamps=True, condition_on_previous_text=False, **opts)
            words = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2), 'p': round(w.probability, 2)} for s in segs for w in (s.words or [])]
            break
        except Exception as ex:
            print('retry', os.path.basename(f), type(ex).__name__, flush=True)
    json.dump({'dur': len(x) / 16000, 'words': words}, open(out, 'w'))
    print(os.path.basename(f)[:40], round(len(x) / 16000), 's', ' '.join(w['w'] for w in words)[:160], flush=True)
