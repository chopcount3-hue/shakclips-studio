import sys, time, wave, numpy as np
from kokoro_onnx import Kokoro
k = Kokoro('/home/claude/untrusted/kokoro/kokoro-v1.0.onnx', '/home/claude/untrusted/kokoro/voices-v1.0.bin')
for v in sys.argv[2].split(','):
    t = time.time(); a, sr = k.create(sys.argv[1], voice=v, speed=1.12, lang='en-gb' if v.startswith('b') else 'en-us')
    w = wave.open(f"k_{v}.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()); w.close(); print(v, round(time.time() - t, 1), 's for', round(len(a) / sr, 1), 's audio')
