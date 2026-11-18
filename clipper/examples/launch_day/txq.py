# transcribe each HQ window (medium.en, VAD) as soon as it is downloaded; words json next to it
import glob, json, os, subprocess, sys, time, numpy as np
from faster_whisper import WhisperModel
wm = WhisperModel(sys.argv[1] if len(sys.argv) > 1 else 'medium.en', device='cpu', compute_type='int8', cpu_threads=2)
PROMPT = 'Twitch streamer live reaction to GTA 6 launch. Chat, bro, Rockstar, GTA six, Vice City, Lucia, Jason.'
done = set()
while True:
    fs = sorted(f for f in glob.glob('/home/claude/untrusted/launch/hq/*.mp4') if not f.endswith('.raw.mp4'))
    todo = [f for f in fs if f not in done and not os.path.exists(f[:-4] + '.words.json')]
    if not todo:
        if os.path.exists('/home/claude/launch/hq.log') and 'HQ_DONE' in open('/home/claude/launch/hq.log').read(): break
        time.sleep(5); continue
    f = todo[0]; done.add(f)
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = wm.transcribe(x, beam_size=5, word_timestamps=True, initial_prompt=PROMPT, condition_on_previous_text=False, vad_filter=True)
    words, text = [], []
    for s in segs:
        text.append(s.text.strip()); words += [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2), 'p': round(w.probability, 2)} for w in (s.words or [])]
    json.dump({'segments': [{'s': 0, 'e': len(x) / 16000, 't': ' '.join(text), 'words': words}]}, open(f[:-4] + '.words.json', 'w'))
    print(os.path.basename(f), '|', ' '.join(text)[:400], flush=True)
print('TX_DONE')
