#!/usr/bin/env python3
"""Original phonk-style beds for Shorts (synthesized here, so no copyright or Content ID risk).

usage: python music.py out.wav [--seconds 60] [--bpm 130] [--seed 1] [--style phonk|trap|drill]
phonk: distorted 808 with slides, cowbell riff, 16th hats with rolls, clap on 2 and 4, a short riser into each 8-bar section.
"""
import argparse, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--seconds', type=float, default=60)
    ap.add_argument('--bpm', type=float, default=130); ap.add_argument('--seed', type=int, default=1); ap.add_argument('--style', default='phonk')
    a = ap.parse_args(); rng = np.random.default_rng(a.seed)
    beat = 60 / a.bpm; n = int(a.seconds * SR); out = np.zeros((n, 2))
    def put(x, t, g=1.0, pan=0.0):
        i = int(t * SR); j = min(n, i + len(x))
        if j > i: out[i:j, 0] += x[:j - i] * g * (1 - pan); out[i:j, 1] += x[:j - i] * g * (1 + pan)
    tt = lambda d: np.arange(int(d * SR)) / SR
    key = 41 + int(rng.integers(0, 5))                    # F..A minor roots
    scale = [0, 3, 5, 7, 10, 12]
    riff = [scale[int(rng.integers(0, len(scale)))] for _ in range(8)]
    bass_pat = [0, 0, 7, 0, 3, 0, 10, 5]
    bars = int(a.seconds / (4 * beat)) + 1
    for bar in range(bars):
        t0 = bar * 4 * beat; sect = (bar // 8) % 2
        for k in range(4):                                # kick + 808
            if k in (0, 2) or (k == 3 and bar % 2):
                x = tt(0.35); put(np.sin(2 * np.pi * np.cumsum(45 + 120 * np.exp(-x / 0.025)) / SR) * np.exp(-x / 0.12), t0 + k * beat, 0.9)
        for k in range(2):                                # 808 notes with slides
            m = key + bass_pat[(bar * 2 + k) % 8] - 12; d = 2 * beat; x = tt(d)
            f0 = hz(m); f1 = hz(key + bass_pat[(bar * 2 + k + 1) % 8] - 12)
            f = f0 + (f1 - f0) * np.clip((x - d * 0.8) / (d * 0.2), 0, 1)
            y = np.tanh(3.0 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-x / (d * 0.9))
            put(lp(y, 900), t0 + k * 2 * beat, 0.42)
        for k in (1, 3):                                  # clap
            x = tt(0.25); c = sum(np.roll(bp(rng.standard_normal(len(x)), 900, 5000) * np.exp(-x / 0.05), int(o * SR)) for o in (0, 0.012, 0.024))
            put(c, t0 + k * beat, 0.28)
        for s in range(16):                               # hats (16ths, rolls on the last beat of every 2nd bar)
            sub = [0.0] if not (bar % 2 and s >= 12) else [0.0, 1 / 3, 2 / 3]
            for o in sub:
                x = tt(0.05); h = hp(rng.standard_normal(len(x)), 7000) * np.exp(-x / 0.012)
                put(h, t0 + (s + o) * beat / 4, 0.10 if s % 2 else 0.14, 0.3)
        if a.style == 'phonk':                            # cowbell riff (two detuned squares through a band-pass), 8ths
            for s in range(8):
                if sect == 0 and s % 2: continue
                m = key + 24 + riff[(s + bar) % 8]; x = tt(beat / 2 * 0.95)
                y = sum(np.sign(np.sin(2 * np.pi * hz(m) * r * x)) for r in (1.0, 1.48)) * np.exp(-x / 0.09)
                put(bp(y, 500, 3800), t0 + s * beat / 2, 0.09, -0.2)
        if bar % 8 == 7:                                  # riser into the next section
            x = tt(4 * beat); put(hp(rng.standard_normal(len(x)), 2000) * (x / x[-1]) ** 2, t0, 0.12)
    out = np.tanh(out * 1.2) * 0.85
    fade = int(1.5 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    wavfile.write(a.out, SR, (out / np.abs(out).max() * 0.89 * 32767).astype(np.int16))
    print(a.out, f'{a.seconds:.0f}s {a.bpm:.0f} bpm {a.style}')

if __name__ == '__main__':
    main()
