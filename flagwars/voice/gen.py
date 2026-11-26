import json, os, sys, time, torch, torchaudio
from chatterbox.tts import ChatterboxTTS
torch.set_num_threads(2); os.makedirs('wav', exist_ok=True)
m = ChatterboxTTS.from_pretrained(device='cpu')
jobs = [(f'p_{k}{i}', t, 1.25) for k, v in json.load(open('lines.json')).items() for i, t in enumerate(v)]
jobs += [(f'n_{c}', t, 1.0) for c, t in json.load(open('names.json')).items()]
only = set(sys.argv[1:])
cur = None; t0 = time.time()
for i, (key, text, ex) in enumerate(jobs):
    if (only and key not in only) or (not only and os.path.exists(f'wav/{key}.wav')): continue
    if cur != ex: m.prepare_conditionals('k_bm_george.wav', exaggeration=ex); cur = ex
    wav = m.generate(text, exaggeration=ex, cfg_weight=0.3, temperature=0.8)
    torchaudio.save(f'wav/{key}.wav', wav, m.sr); print(i + 1, '/', len(jobs), key, round(time.time() - t0), 's', flush=True)
print('DONE', flush=True)
