import sys, json, os, subprocess
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=os.cpu_count())
for f in sys.argv[1:]:
    out = f.rsplit('.', 1)[0] + '.tx.json'
    if os.path.exists(out): continue
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    segs, _ = m.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, beam_size=1, language='en', vad_filter=True, condition_on_previous_text=False)
    res = []
    for s in segs:
        res.append({'s': round(s.start, 1), 'e': round(s.end, 1), 't': s.text.strip()})
    json.dump(res, open(out, 'w'))
    print(f, len(res), 'segments', flush=True)
