import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
f, out = sys.argv[1], sys.argv[2]; off = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
m = WhisperModel('small.en', device='cpu', compute_type='int8', cpu_threads=2)
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
segs, _ = m.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, beam_size=5, language='en', word_timestamps=True, vad_filter=True,
                       vad_parameters={'min_silence_duration_ms': 300}, condition_on_previous_text=False)
res = {'segments': []}
for s in segs:
    res['segments'].append({'s': s.start + off, 'e': s.end + off, 't': s.text.strip(), 'words': [{'w': w.word.strip(), 's': round(w.start + off, 2), 'e': round(w.end + off, 2), 'p': round(w.probability, 2)} for w in (s.words or [])]})
    print(f"{s.start:7.1f} {s.text.strip()[:110]}", flush=True)
json.dump(res, open(out, 'w'))
