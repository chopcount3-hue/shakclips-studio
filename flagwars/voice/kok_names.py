import json, wave, numpy as np
from kokoro_onnx import Kokoro
k = Kokoro('/home/claude/untrusted/kokoro/kokoro-v1.0.onnx', '/home/claude/untrusted/kokoro/voices-v1.0.bin')
for c, t in json.load(open('names.json')).items():
    a, sr = k.create(t, voice='bm_george', speed=1.0, lang='en-gb')
    w = wave.open(f'wav/n_{c}.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(a * 1.0, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
print('names done')
