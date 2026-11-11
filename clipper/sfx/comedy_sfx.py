#!/usr/bin/env python3
"""Original comedy / meme-style SFX, synthesized from scratch (no samples, so no copyright or Content ID risk).
usage: python3 comedy_sfx.py outdir   -> outdir/<name>.wav (48 kHz mono, peak -1 dBFS)"""
import os, sys, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000; rng = np.random.default_rng(3)
def t(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def nz(n): return rng.standard_normal(n)
def env(n, a, d): e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na); e[na:] = np.exp(-np.arange(n - na) / SR / d); return e
def osc(freq, wave='sine'):
    ph = 2 * np.pi * np.cumsum(freq) / SR
    if wave == 'saw': return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if wave == 'square': return np.sign(np.sin(ph))
    if wave == 'tri': return 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1
    return np.sin(ph)
def mix(parts, d):
    out = np.zeros(int(d * SR))
    for off, y in parts:
        a = int(off * SR); m = min(len(y), len(out) - a)
        if m > 0: out[a:a + m] += y[:m]
    return out
def verb(x, wet=0.25, size=0.08):
    y = x.copy()
    for k, g in [(1.0, 0.5), (1.37, 0.4), (1.71, 0.33), (2.13, 0.27), (2.9, 0.2)]:
        dl = int(size * k * SR); z = np.zeros_like(x); z[dl:] = x[:-dl] * g; y += z * wet
    return lp(y, 7000)
def hz(m): return 440 * 2 ** ((m - 69) / 12)

def boom():          # deep cinematic "boom" hit with a long tail (meme-style punchline hit)
    d = 2.2; x = t(d); f = 42 + 80 * np.exp(-x / 0.06)
    y = np.tanh(2.2 * osc(f) * np.exp(-x / 0.55)) + 0.5 * lp(nz(len(x)), 220) * np.exp(-x / 0.12)
    return verb(y, 0.35, 0.09)
def bonk():          # wooden head bonk
    d = 0.45; x = t(d); y = osc(820 * np.exp(-x / 0.25) + 300) * np.exp(-x / 0.06) + bp(nz(len(x)), 900, 4000) * np.exp(-x / 0.012) * 0.8
    return y + 0.4 * osc(np.full(len(x), 1650.0)) * np.exp(-x / 0.03)
def boing():         # cartoon spring
    d = 0.9; x = t(d); f = 260 + 140 * np.sin(2 * np.pi * 15 * x) * np.exp(-x / 0.35) + 160 * (1 - np.exp(-x / 0.05))
    return osc(f) * env(len(x), 0.004, 0.32) + 0.25 * osc(2 * f) * env(len(x), 0.004, 0.15)
def slide(up=True):  # slide whistle
    d = 0.75; x = t(d); u = x / d; f = (550 + 1400 * u ** 1.3) if up else (1950 - 1400 * u ** 0.8)
    f = f * (1 + 0.012 * np.sin(2 * np.pi * 7 * x)); y = osc(f) + 0.08 * bp(nz(len(x)), 1500, 5000)
    return y * np.sin(np.pi * np.clip(u * 1.05, 0, 1)) ** 0.4
def scratch():       # record scratch (needle dragged back and forth)
    d = 0.7; x = t(d); speed = np.sin(2 * np.pi * 3.2 * x) * (1 - x / d * 0.4)
    carrier = nz(len(x)); out = np.zeros(len(x)); step = int(0.02 * SR)
    for i in range(0, len(x), step):
        c = 800 + 2600 * abs(speed[i]); out[i:i + step] = bp(carrier[i:i + step], c * 0.6, min(c * 1.8, 20000))[:len(out[i:i + step])]
    return out * (0.4 + 0.6 * np.abs(speed)) * np.sin(np.pi * x / d) ** 0.3
def sad_trombone():  # wah wah wah waaah
    notes = [(0.0, 58, 0.42), (0.45, 57, 0.42), (0.9, 56, 0.42), (1.35, 55, 1.4)]; parts = []
    for off, m, ln in notes:
        x = t(ln); vib = 1 + (0.03 * np.sin(2 * np.pi * 6 * x) * np.clip((x - 0.25) / 0.3, 0, 1) if ln > 1 else 0)
        sw = osc(hz(m) * vib, 'saw'); br = np.exp(-x / 0.12); y = (lp(sw, 1800) * br + lp(sw, 900) * (1 - br)) * env(len(x), 0.03, ln * 0.6)
        y *= (0.6 + 0.4 * np.sin(2 * np.pi * 2.2 * x) ** 2) if ln < 1 else 1; parts.append((off, y))
    return mix(parts, 2.9)
def kick(): x = t(0.35); return osc(50 + 110 * np.exp(-x / 0.03)) * np.exp(-x / 0.12)
def snare(): x = t(0.3); return bp(nz(len(x)), 1500, 8000) * np.exp(-x / 0.07) + 0.5 * osc(np.full(len(x), 190.0)) * np.exp(-x / 0.05)
def tom(f): x = t(0.4); return osc(f * (1 + 0.6 * np.exp(-x / 0.03))) * np.exp(-x / 0.15)
def cymbal(d=1.6): x = t(d); return hp(nz(len(x)), 5000) * np.exp(-x / 0.45) * 0.6
def rimshot():       # ba-dum-tss
    return verb(mix([(0, tom(170) * 0.9), (0.18, tom(120) * 0.9), (0.36, kick() * 0.7), (0.36, cymbal() * 0.8)], 2.0), 0.15)
def airhorn():       # party horn blasts (synth brass, not a sample)
    def blast(d):
        x = t(d); f = 466 * (1 + 0.01 * np.sin(2 * np.pi * 5 * x))
        y = sum(osc(f * k, 'saw') for k in (1.0, 1.005, 0.995, 1.5)) / 4
        return np.tanh(3 * lp(y, 2600)) * env(len(x), 0.015, d * 0.8) * (x < d - 0.03)
    return mix([(0, blast(0.22)), (0.28, blast(0.22)), (0.56, blast(0.9))], 1.6)
def pop():           # cartoon pop
    x = t(0.12); return osc(1400 * np.exp(-x / 0.02) + 300) * np.exp(-x / 0.03) + bp(nz(len(x)), 2000, 9000) * np.exp(-x / 0.004)
def honk():          # clown horn
    def h(d):
        x = t(d); y = osc(np.full(len(x), 420.0), 'square') * 0.6 + osc(np.full(len(x), 630.0), 'square') * 0.4
        return bp(y, 500, 3200) * env(len(x), 0.01, d)
    return mix([(0, h(0.18)), (0.24, h(0.32))], 0.65)
def drumroll_crash():
    parts = [(i * (0.07 - 0.02 * i / 28), snare() * (0.35 + 0.5 * i / 28)) for i in range(28)]
    return verb(mix(parts + [(1.55, cymbal(2.0) * 1.2), (1.55, kick())], 3.4), 0.2)
def dun_dun_duun():  # dramatic sting
    def stab(m, d):
        x = t(d); y = sum(lp(osc(hz(m + o) * (1 + 0.004 * k), 'saw'), 1400) for k, o in enumerate((0, 12, 7, -12))) / 4
        return np.tanh(2 * y) * env(len(x), 0.01, d * 0.5)
    return verb(mix([(0, stab(48, 0.35) + kick()[:int(0.35 * SR)]), (0.42, stab(48, 0.35)), (0.84, stab(44, 2.2)), (0.84, tom(70) * 1.2)], 3.3), 0.3, 0.1)
def glitch():        # digital stutter
    base = osc(np.full(int(0.08 * SR), 600.0), 'square') * 0.4 + bp(nz(int(0.08 * SR)), 1000, 8000) * 0.5; parts = []
    for i in range(10):
        seg = base[: int(len(base) * (0.3 + 0.7 * rng.random()))] * (1 if i % 3 else 0.5)
        parts.append((i * 0.055, seg * np.hanning(len(seg)) ** 0.2))
    return mix(parts, 0.65)
def bass_drop():
    d = 2.4; x = t(d); rise = hp(nz(len(x)), 1500) * np.clip(x / 1.2, 0, 1) ** 2 * (x < 1.2) * 0.4
    sub = np.tanh(2 * osc(np.where(x < 1.2, 0, 55 + 200 * np.exp(-(x - 1.2) / 0.15)))) * (x >= 1.2) * np.exp(-np.clip(x - 1.2, 0, None) / 0.7)
    return rise + sub
def tick_tock(): return mix([(i * 0.5, bp(nz(int(0.03 * SR)), 2500 if i % 2 == 0 else 1800, 7000) * np.exp(-t(0.03) / 0.008)) for i in range(6)], 3.0)
def ding_correct(): return mix([(0, osc(np.full(int(0.6 * SR), hz(84))) * env(int(0.6 * SR), 0.002, 0.25)), (0.12, osc(np.full(int(0.9 * SR), hz(88))) * env(int(0.9 * SR), 0.002, 0.35))], 1.1)
def buzzer_wrong(): x = t(0.8); return lp(osc(np.full(len(x), 110.0), 'saw') + osc(np.full(len(x), 116.0), 'saw'), 1800) * env(len(x), 0.01, 0.6) * 0.6
def zip_away():      # cartoon run-off
    x = t(0.55); f = 300 + 3000 * (x / 0.55) ** 2; return osc(f) * np.sin(np.pi * x / 0.55) * 0.6 + mix([(i * 0.03, bp(nz(int(0.01 * SR)), 800, 3000)) for i in range(15)], 0.55) * 0.6
def crickets():      # awkward silence
    out = np.zeros(int(2.9 * SR))
    for k in range(5):
        x = t(0.12); ch = osc(np.full(len(x), 4400.0)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 45 * x))) * np.sin(np.pi * x / 0.12)
        for j in range(3): a = int((0.35 + k * 0.48 + j * 0.13) * SR); out[a:a + len(ch)] += ch * 0.3
    return out
def heartbeat(): return mix([(i * 0.85 + o, kick() * g) for i in range(3) for o, g in ((0, 1.0), (0.18, 0.7))], 2.7)
def riser(): x = t(1.8); u = x / 1.8; n_ = nz(len(x)); return ((hp(n_, 3000) * u + bp(n_, 600, 3000) * (1 - u)) * 0.5 + osc(200 + 1800 * u ** 2) * 0.3) * u ** 2
def wow_choir():     # "ooooh" crowd-like reaction pad
    x = t(1.6); y = sum(bp(osc(hz(m) * (1 + 0.003 * np.sin(2 * np.pi * (4 + k) * x)), 'saw'), 300, 1400) for k, m in enumerate((57, 61, 64, 69)))
    return y * env(len(x), 0.25, 0.7) * 0.5
def cash():          # cha-ching
    bell = lambda f, d: osc(np.full(int(d * SR), f)) * env(int(d * SR), 0.002, d / 3) + 0.4 * osc(np.full(int(d * SR), f * 2.76)) * env(int(d * SR), 0.002, d / 6)
    return mix([(0, bp(nz(int(0.08 * SR)), 2000, 9000) * 0.6), (0.06, bell(2093, 0.9)), (0.1, bell(2637, 0.9))], 1.0)

KIT = [('boom', boom), ('bonk', bonk), ('boing', boing), ('slide_up', lambda: slide(True)), ('slide_down', lambda: slide(False)),
       ('record_scratch', scratch), ('sad_trombone', sad_trombone), ('rimshot', rimshot), ('airhorn', airhorn), ('pop', pop),
       ('clown_honk', honk), ('drumroll_crash', drumroll_crash), ('dun_dun_duun', dun_dun_duun), ('glitch', glitch),
       ('bass_drop', bass_drop), ('tick_tock', tick_tock), ('ding_correct', ding_correct), ('buzzer_wrong', buzzer_wrong),
       ('zip_away', zip_away), ('crickets', crickets), ('heartbeat', heartbeat), ('riser', riser), ('wow_choir', wow_choir), ('cha_ching', cash)]

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for name, fn in KIT:
        y = np.asarray(fn(), dtype=np.float64); y = hp(y, 30); y = y / max(1e-9, np.abs(y).max()) * 0.89
        wavfile.write(f'{out}/{name}.wav', SR, (y * 32767).astype(np.int16))
    print(len(KIT), 'sounds ->', out)
