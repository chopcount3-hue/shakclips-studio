import json, subprocess, sys, numpy as np
from faster_whisper import WhisperModel
src, out, model = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else 'medium.en')
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
wm = WhisperModel(model, device='cpu', compute_type='int8', cpu_threads=8)
segs, _ = wm.transcribe(x, beam_size=5, word_timestamps=True, condition_on_previous_text=False, vad_filter=False)
words, lines = [], []
for s in segs:
    lines.append(f'{s.start:7.1f} {s.text.strip()}'); print(lines[-1], flush=True)
    words += [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2), 'p': round(w.probability, 2)} for w in (s.words or [])]
json.dump({'dur': len(x) / 16000, 'words': words}, open(out, 'w'))
