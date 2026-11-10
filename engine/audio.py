#!/usr/bin/env python3
"""Original sneaky-swing score + synthesized SFX for the Lustig story; mixes with the voice to -14 LUFS (two-pass in ffmpeg)."""
import json, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000; C = json.load(open('cues.json')); TOT = C['total']; N = int((TOT + 0.2) * SR); t_all = np.arange(N) / SR
SEC = C['sec']; END0 = C['storyEnd']
rng = np.random.default_rng(1)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def ss(a, b, x): u = np.clip((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def nz(n, seed=None): return (np.random.default_rng(seed) if seed is not None else rng).standard_normal(n)
def place(buf, x, t0, g=1.0, pan=0.0):
    i0 = int(t0 * SR); i1 = min(len(buf), i0 + len(x))
    if i1 <= i0 or i0 < 0: return
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i0:i1, 0] += x[:i1 - i0] * g * l; buf[i0:i1, 1] += x[:i1 - i0] * g * r
def env(n, a, d): e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na); e[na:] = np.exp(-np.arange(n - na) / SR / d); return e
def tt(d): return np.arange(int(d * SR)) / SR

# ------------------------------------------------------------------ music: sneaky swing in D minor, 112 bpm
BPM = 112; BEAT = 60 / BPM; BAR = 4 * BEAT
PROG = [[50, 53, 57, 60], [50, 53, 57, 60], [55, 58, 62, 65], [55, 58, 62, 65], [52, 55, 58, 62], [57, 61, 64, 67], [50, 53, 57, 60], [57, 61, 64, 67]]   # Dm7 Dm7 Gm7 Gm7 Em7b5 A7 Dm7 A7
ROOTS = [38, 38, 43, 43, 40, 45, 38, 45]
mode = np.zeros(N)            # 0 groove, 1 tense, 2 somber, 3 bright
fall0, alc0, death0, cb0 = SEC['fall'], SEC.get('alcatraz', 0), SEC['death'], SEC['callback']
def mode_at(t):
    if t < fall0: return 0
    if t < death0: return 1
    if t < cb0 - 0.2: return 2
    return 3
mus = np.zeros((N, 2))
lvl = lambda t: 1.0
nb = int(TOT / BAR) + 1
for b in range(nb):
    t0 = b * BAR; md = mode_at(t0); pi = b % 8
    if md == 2: continue
    ch = PROG[pi] if md != 3 else [[50, 54, 57, 62], [55, 59, 62, 66], [57, 61, 64, 67], [50, 54, 57, 62]][b % 4]
    root = ROOTS[pi] if md != 3 else [38, 43, 45, 38][b % 4]
    # walking pizzicato bass (quarter notes)
    walk = [root, root + 3 if md != 3 else root + 4, root + 7, root + 5]
    for k in range(4):
        if md == 1 and k % 2: continue
        n = int(0.42 * SR); x = tt(0.42)[:n]; f = hz(walk[k])
        y = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(4 * np.pi * f * x) + 0.15 * np.sin(6 * np.pi * f * x)) * env(n, 0.004, 0.16)
        place(mus, lp(y, 900), t0 + k * BEAT, 0.20, -0.15)
    # brushes / ride (swing 8ths) except tense mode
    if md in (0, 3):
        for k in range(4):
            for sw in (0, 2 / 3):
                n = int(0.12 * SR); y = hp(nz(n), 6000) * env(n, 0.001, 0.035 if sw == 0 else 0.02)
                place(mus, y, t0 + (k + sw) * BEAT, 0.035 if sw == 0 else 0.022, 0.35)
            if k in (1, 3):
                n = int(0.2 * SR); y = bp(nz(n), 1500, 6000) * env(n, 0.003, 0.07)
                place(mus, y, t0 + k * BEAT, 0.05, -0.2)
    # muted piano stabs on 2 and the "and" of 3
    if md in (0, 3):
        for kb in (1, 2 + 2 / 3):
            n = int(0.35 * SR); x = tt(0.35)[:n]
            y = sum(np.sin(2 * np.pi * hz(m + 12) * x) * (1 + 0.3 * np.sin(4 * np.pi * hz(m + 12) * x)) for m in ch) * env(n, 0.003, 0.09)
            place(mus, lp(y, 2800), t0 + kb * BEAT, 0.035, 0.2)
# sneaky clarinet-ish motif every 4 bars in groove mode
MOTIF = [(0, 62, 0.5), (0.5, 65, 0.5), (1, 64, 0.5), (1.5, 62, 1.0), (2.67, 69, 0.33), (3, 68, 0.5), (3.5, 69, 0.75)]
for b in range(0, nb, 4):
    t0 = b * BAR
    if mode_at(t0) not in (0, 3) or t0 > END0: continue
    for off, m, ln in MOTIF:
        if mode_at(t0) == 3: m += 0 if m in (62, 69) else 1
        n = int((ln * BEAT + 0.15) * SR); x = tt(n / SR)[:n]; f = hz(m)
        vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * x) * ss(0.1, 0.3, x)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        y = (np.sin(ph) + 0.33 * np.sin(3 * ph) + 0.12 * np.sin(5 * ph)) * env(n, 0.03, ln * BEAT * 0.9)
        place(mus, lp(y, 3200), t0 + off * BEAT, 0.045, 0.1)
# tense section: low drone + heartbeat
x = t_all; tense = ss(fall0 - 0.3, fall0 + 0.5, x) * (1 - ss(death0 - 0.4, death0, x))
drone = (np.sin(2 * np.pi * 36.7 * x) + 0.5 * np.sin(2 * np.pi * 55 * x + 0.3 * np.sin(2 * np.pi * 0.2 * x)) + 0.25 * lp(nz(N), 200) * 4) * tense
mus += (drone * 0.06)[:, None]
# somber: soft pad (Dm add9) for the death line
som = ss(death0 - 0.2, death0 + 1.0, x) * (1 - ss(cb0 - 0.6, cb0, x))
pad = sum(np.sin(2 * np.pi * hz(m) * x + i) for i, m in enumerate([50, 57, 62, 64, 65])) * som
mus += (lp(pad, 1200) * 0.022)[:, None]
# end-card button: bright resolving chord
n = int(2.6 * SR); y = sum(np.sin(2 * np.pi * hz(m) * tt(2.6)[:n]) for m in [50, 54, 57, 62, 66]) * env(n, 0.01, 0.8)
place(mus, y, END0 + 0.05, 0.05)
mus *= (1 - ss(TOT - 0.8, TOT, t_all))[:, None]
# room
dl = [int(0.029 * SR), int(0.053 * SR), int(0.087 * SR)]
rv = np.zeros_like(mus)
for d, g in zip(dl, [0.22, 0.15, 0.1]): rv[d:, 0] += mus[:-d, 1] * g; rv[d:, 1] += mus[:-d, 0] * g
mus += lp(rv.T, 3500).T

# ------------------------------------------------------------------ SFX
def whoosh(d=0.35, f0=600, f1=3000, seed=None):
    n = int(d * SR); x = nz(n, seed); out = np.zeros(n); seg = 8
    for i in range(seg):
        a, b = i * n // seg, (i + 1) * n // seg; f = f0 * (f1 / f0) ** (i / seg)
        out[a:b] = bp(x, max(80, f * 0.6), min(20000, f * 1.6))[a:b]
    return out / (np.std(out) + 1e-9) * np.sin(np.pi * np.arange(n) / n) ** 2 * 0.12
def blip(f0=700, f1=320, d=0.09): x = tt(d); return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(x))) / SR) * env(len(x), 0.002, d / 3)
def bell(f, d=1.0): x = tt(d); return (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 2.0 * x) * np.exp(-x / 0.15) + 0.3 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x / 0.2)) * env(len(x), 0.002, d / 3)
def thump(f=60, d=0.4): x = tt(d); return np.sin(2 * np.pi * np.cumsum(f + 90 * np.exp(-x / 0.03)) / SR) * np.exp(-x / (d / 3)) + lp(nz(len(x)), 400) * 0.3 * np.exp(-x / 0.05)
def metal(d=1.2, base=420, seed=0):
    x = tt(d); r = np.random.default_rng(seed); return sum(np.sin(2 * np.pi * base * k * x + r.random()) * np.exp(-x / (d / (1 + k * 0.6))) for k in (1, 1.47, 2.09, 2.56, 3.21, 4.1)) / 4
def paper(d=0.3, seed=None): n = int(d * SR); x = bp(nz(n, seed), 1800, 7000); return x / np.std(x) * np.sin(np.pi * np.arange(n) / n) ** 1.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * np.arange(n) / SR)) * 0.1
def steps(k=4, rate=3.3, seed=0):
    out = np.zeros(int((k / rate + 0.2) * SR))
    for i in range(k):
        n = int(0.09 * SR); y = bp(nz(n, seed + i), 300, 2500) * env(n, 0.001, 0.02) * 2 + thump(90, 0.09)[:n] * 0.5
        a = int(i / rate * SR); out[a:a + n] += y[:len(out) - a]
    return out * 0.5
def seqmix(parts, d):
    out = np.zeros(int(d * SR))
    for off, y in parts:
        a = int(off * SR); m = min(len(y), len(out) - a)
        if m > 0: out[a:a + m] += y[:m]
    return out
SFX = {
    'whoosh': lambda: whoosh(0.32, 500, 2600),
    'pop': lambda: blip(800, 420, 0.08) * 0.6,
    'steps': lambda: steps(4, 3.3),
    'stamp': lambda: seqmix([(0, thump(70, 0.35) * 0.9), (0, paper(0.12) * 3)], 0.4),
    'buzz': lambda: np.sign(np.sin(2 * np.pi * 140 * tt(0.4))) * env(int(0.4 * SR), 0.01, 0.25) * 0.25,
    'ding': lambda: bell(1568, 1.0) * 0.35,
    'thud': lambda: thump(55, 0.5),
    'boing': lambda: np.sin(2 * np.pi * np.cumsum(300 + 260 * ss(0, 0.12, tt(0.5)) + 40 * np.sin(2 * np.pi * 14 * tt(0.5)) * np.exp(-tt(0.5) / 0.2)) / SR) * env(int(0.5 * SR), 0.005, 0.18) * 0.4,
    'train': lambda: np.concatenate([np.sum([np.pad(bp(nz(int(0.12 * SR), 30 + i), 200, 2200) * env(int(0.12 * SR), 0.005, 0.04), (int(i * 0.24 * SR), 0)) [:int(1.6 * SR)] if False else 0 for i in range(1)], axis=0) * 0 + chug(), np.zeros(1)]),
    'cash': lambda: cash(),
    'sting': lambda: sting(),
    'sparkle': lambda: seqmix([(i * 0.06, bell(hz(m), 0.6) * 0.2) for i, m in enumerate([88, 91, 95, 100])], 0.9),
    'paper': lambda: paper(0.35),
    'page': lambda: paper(0.18) * 0.8,
    'scribble': lambda: bp(nz(int(0.9 * SR)), 2500, 8000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * tt(0.9)))) * np.sin(np.pi * tt(0.9) / 0.9) * 0.18,
    'whooshes': lambda: seqmix([(i * 0.22, whoosh(0.3, 700, 3000, i)) for i in range(3)], 1.0),
    'crash': lambda: seqmix([(0, metal(1.0, 380, 3) * 0.5), (0, thump(50, 0.6) * 0.6), (0.15, metal(0.6, 610, 4) * 0.3)], 1.0),
    'shh': lambda: bp(nz(int(0.7 * SR)), 2500, 9000) * np.sin(np.pi * tt(0.7) / 0.7) ** 0.7 * 0.12,
    'crowd': lambda: crowd(),
    'reel': lambda: seqmix([(i * 0.045, bp(nz(int(0.012 * SR), i), 2000, 8000) * 0.4) for i in range(20)], 1.0),
    'hmm': lambda: hmm(),
    'sad': lambda: sadtromb(),
    'slide': lambda: bp(nz(int(0.6 * SR)), 1200, 5000) * np.sin(np.pi * tt(0.6) / 0.6) * 0.08,
    'tick': lambda: seqmix([(i * 0.5, bp(nz(int(0.02 * SR), i), 2500, 7000) * 0.5) for i in range(4)], 2.0),
    'slam': lambda: thump(65, 0.35) + bp(nz(int(0.35 * SR)), 300, 3000) * env(int(0.35 * SR), 0.001, 0.05) * 0.5,
    'crickets': lambda: crickets(),
    'whistle': lambda: np.sin(2 * np.pi * np.cumsum(2700 + 180 * np.sign(np.sin(2 * np.pi * 26 * tt(0.9)))) / SR) * env(int(0.9 * SR), 0.02, 0.6) * 0.18,
    'run': lambda: steps(9, 9.0, 40),
    'horn': lambda: lp(sum(np.sign(np.sin(2 * np.pi * f * tt(1.4))) for f in (98, 147)), 600) * env(int(1.4 * SR), 0.08, 0.9) * 0.2,
    'crank': lambda: seqmix([(i * 0.07, metal(0.08, 1800, i) * 0.4) for i in range(12)], 1.0),
    'dun': lambda: dun(),
    'lock': lambda: metal(0.4, 900, 7) * 0.5 + thump(120, 0.15)[:int(0.4 * SR)] * 0.5 if False else np.pad(metal(0.4, 900, 7) * 0.5, (0, 0)) + np.pad(thump(120, 0.15) * 0.5, (0, int(0.25 * SR)))[:int(0.4 * SR)],
    'grab': lambda: whoosh(0.25, 300, 1500) + np.pad(thump(80, 0.2), (int(0.18 * SR), 0))[:int(0.25 * SR)] * 0,
    'rope': lambda: bp(nz(int(1.2 * SR)), 250, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * tt(1.2))) * 0.15,
    'clang': lambda: metal(1.8, 260, 9) * 0.6 + thump(45, 0.6)[:int(1.8 * SR)].tolist() and (metal(1.8, 260, 9) * 0.6 + np.pad(thump(45, 0.6), (0, int(1.2 * SR)))[:int(1.8 * SR)]),
    'gull': lambda: gull(),
}
def chug():
    out = np.zeros(int(1.8 * SR))
    for i in range(7):
        n = int(0.12 * SR); y = bp(nz(n, 30 + i), 150, 1800) * env(n, 0.005, 0.04); a = int(i * 0.24 * SR); out[a:a + n] += y * 1.4
    x = tt(1.0); wh = (np.sin(2 * np.pi * 700 * x) + 0.6 * np.sin(2 * np.pi * 880 * x)) * env(len(x), 0.05, 0.5) * 0.15
    out[int(0.5 * SR):int(0.5 * SR) + len(wh)] += wh
    return out * 0.6
def cash():
    out = np.zeros(int(1.0 * SR)); out[:int(0.15 * SR)] += bp(nz(int(0.15 * SR)), 2000, 9000) * env(int(0.15 * SR), 0.001, 0.04) * 0.6
    b = bell(2093, 0.9) * 0.3; out[int(0.08 * SR):int(0.08 * SR) + len(b)] += b[:len(out) - int(0.08 * SR)]
    for i in range(6):
        c = bell(3000 + 900 * rng.random(), 0.2) * 0.08; a = int((0.1 + i * 0.05) * SR); out[a:a + len(c)] += c[:len(out) - a]
    return out
def sting():
    x = tt(1.4); y = sum(np.sign(np.sin(2 * np.pi * hz(m) * x)) * 0.5 + np.sin(2 * np.pi * hz(m) * x) for m in (50, 57, 62, 65)) * env(len(x), 0.005, 0.35)
    return lp(y, 2200) * 0.06 + thump(50, 0.8)[:len(x)].copy() * 0.0 + np.pad(thump(50, 0.8) * 0.5, (0, len(x) - int(0.8 * SR)))
def crowd():
    d = 2.6; n = int(d * SR); out = np.zeros(n)
    for k in range(10):
        f = 300 + 900 * rng.random(); m = 0.5 + 0.5 * np.sin(2 * np.pi * (3 + 4 * rng.random()) * tt(d) + rng.random() * 6)
        out += bp(nz(n, 70 + k), f * 0.8, f * 1.4) * m
    return out / np.std(out) * np.sin(np.pi * tt(d) / d) ** 0.5 * 0.05
def hmm(): x = tt(0.7); f = 150 + 10 * np.sin(2 * np.pi * 2 * x); y = lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 700) * env(len(x), 0.06, 0.4); return y * 0.12
def sadtromb():
    out = np.zeros(int(1.8 * SR))
    for i, m in enumerate([55, 54, 53, 52]):
        d = 0.32 if i < 3 else 0.9; x = tt(d); f = hz(m) * (1 + (0.02 * np.sin(2 * np.pi * 6 * x) if i == 3 else 0))
        y = lp(np.sign(np.sin(2 * np.pi * np.cumsum(f * np.ones(len(x))) / SR)) * 0.6 + np.sin(2 * np.pi * np.cumsum(f * np.ones(len(x))) / SR), 1400) * env(len(x), 0.02, d * 0.7)
        a = int(i * 0.32 * SR); out[a:a + len(y)] += y[:len(out) - a]
    return out * 0.1
def crickets():
    out = np.zeros(int(1.6 * SR))
    for i in range(6):
        x = tt(0.12); y = np.sin(2 * np.pi * 4300 * x) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 45 * x))) * np.sin(np.pi * x / 0.12); a = int((0.1 + i * 0.25) * SR); out[a:a + len(y)] += y * 0.08
    return out
def dun():
    out = np.zeros(int(1.2 * SR))
    for i, a0 in enumerate([0, 0.35]):
        x = tt(0.6); y = lp(sum(np.sign(np.sin(2 * np.pi * hz(m) * x)) for m in (38, 45, 50)), 500) * env(len(x), 0.005, 0.25) * 0.12 + thump(48, 0.6) * 0.5
        a = int(a0 * SR); out[a:a + len(y)] += y[:len(out) - a]
    return out
def gull():
    out = np.zeros(int(1.4 * SR))
    for a0 in (0.0, 0.45):
        x = tt(0.35); f = 1300 + 700 * np.sin(np.pi * x / 0.35) + 60 * np.sin(2 * np.pi * 30 * x); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / 0.35) * 0.06
        a = int(a0 * SR); out[a:a + len(y)] += y
    return out
SFX['train'] = chug
SFX['clang'] = lambda: seqmix([(0, metal(1.8, 260, 9) * 0.6), (0, thump(45, 0.6))], 1.8)
SFX['lock'] = lambda: seqmix([(0, metal(0.4, 900, 7) * 0.5), (0, thump(120, 0.15) * 0.5)], 0.4)
SFX['grab'] = lambda: seqmix([(0, whoosh(0.25, 300, 1500)), (0.05, thump(80, 0.2) * 0.6)], 0.4)
SFX['sting'] = lambda: seqmix([(0, lp(sum(np.sign(np.sin(2 * np.pi * hz(m) * tt(1.4))) * 0.5 + np.sin(2 * np.pi * hz(m) * tt(1.4)) for m in (50, 57, 62, 65)) * env(int(1.4 * SR), 0.005, 0.35), 2200) * 0.06), (0, thump(50, 0.8) * 0.5)], 1.4)
GAIN = {'whoosh': 0.6, 'pop': 0.5, 'steps': 0.45, 'stamp': 0.6, 'buzz': 0.5, 'ding': 0.5, 'thud': 0.6, 'boing': 0.5, 'train': 0.5, 'cash': 0.6, 'sting': 0.8, 'sparkle': 0.5,
        'paper': 0.6, 'page': 0.5, 'scribble': 0.6, 'whooshes': 0.5, 'crash': 0.5, 'shh': 0.5, 'crowd': 0.6, 'reel': 0.5, 'hmm': 0.5, 'sad': 0.6, 'slide': 0.6, 'tick': 0.5, 'slam': 0.6,
        'crickets': 0.7, 'whistle': 0.5, 'run': 0.5, 'horn': 0.6, 'crank': 0.5, 'dun': 0.8, 'lock': 0.5, 'grab': 0.5, 'rope': 0.6, 'clang': 0.6, 'gull': 0.6}

SFX['rise'] = lambda: whoosh(0.9, 250, 4000) * 0.9 + seqmix([(0.0, np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, int(0.9 * SR))) / SR) * np.linspace(0, 0.08, int(0.9 * SR)))], 0.9)
SFX['wave'] = lambda: lp(nz(int(2.4 * SR), 99), 900) * np.sin(np.pi * np.clip(tt(2.4) / 2.4, 0, 1)) ** 1.5 * 0.35 + seqmix([(1.2, thump(45, 1.0) * 0.5)], 2.4)
def cheer():
    d = 2.4; n = int(d * SR); out = crowd() * 0.0
    out = np.zeros(n)
    for k in range(14):
        f = 500 + 1500 * rng.random(); m = 0.6 + 0.4 * np.sin(2 * np.pi * (2 + 3 * rng.random()) * tt(d) + rng.random() * 6)
        out += bp(nz(n, 200 + k), f * 0.8, f * 1.5) * m
    out = out / np.std(out) * np.minimum(1, tt(d) / 0.15) * np.exp(-tt(d) / 1.6) * 0.06
    for i in range(40):
        a = int(rng.random() * (d - 0.2) * SR); c = bp(nz(int(0.03 * SR), 300 + i), 800, 5000) * env(int(0.03 * SR), 0.001, 0.008) * 0.25 * np.exp(-a / SR / 1.4)
        out[a:a + len(c)] += c
    return out
SFX['cheer'] = cheer
GAIN.update({'rise': 0.5, 'wave': 0.7, 'cheer': 0.8})
fx = np.zeros((N, 2)); last = {}
for t0, kind in C['cues']:
    if kind == 'whoosh' and t0 < 0.05: continue
    if kind == 'whoosh' and t0 - last.get('whoosh', -9) < 0.6: continue
    last[kind] = t0
    x = SFX[kind]()
    place(fx, np.asarray(x, dtype=np.float64), max(0, t0 - (0.12 if kind == 'whoosh' else 0)), GAIN[kind], (rng.random() - 0.5) * 0.5)
def wr(name, x):
    wavfile.write(name, SR, (x / max(1.0, np.max(np.abs(x)) / 0.95)).astype(np.float32))
    print(name, 'rms dB %.1f' % (20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)), 'peak %.2f' % np.max(np.abs(x)))
wr('audio_music.wav', mus); wr('audio_sfx.wav', fx)
