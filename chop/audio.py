"""Chop Count — sound design (all synthesized, original).

OBJ picks the profile: money (bill stack), cake (sponge), banana (soft wet fruit).
The banana profile is pure ASMR: no music bed, a softer and wetter chop than cake, and a
collapse that starts as separate soft plops and ends as a sand-like pour.
"""
import json, os, numpy as np
OBJ = os.environ.get('OBJ', 'money')
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
rng = np.random.default_rng(7)
D = json.load(open('/home/claude/chop/' + os.environ.get('TL', 'audio_timeline.json')))
INFO, CUTS, HISTS = D['info'], D['cuts'], D['hists']
ROUNDS = INFO['rounds']
TOTAL = INFO['TOTAL_DUR']; END = INFO['END_START']
N = int(np.ceil((TOTAL + 0.5) * SR))
sfx = np.zeros((2, N), np.float32)
mus = np.zeros((2, N), np.float32)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)
def t_(dur): return np.arange(int(dur * SR)) / SR
def expenv(dur, tau, att=0.002):
    t = t_(dur); return np.minimum(1, t / att) * np.exp(-t / tau)
def place(buf, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= buf.shape[1] or i + len(sig) <= 0: return
    j0 = max(0, -i); s = sig[j0:]; i = max(i, 0)
    n = min(len(s), buf.shape[1] - i)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + n] += s[:n] * gain * l * 1.414
    buf[1, i:i + n] += s[:n] * gain * r * 1.414
def sweep(f0, f1, dur, tau):
    t = t_(dur); f = f1 + (f0 - f1) * np.exp(-t / (dur * 0.25))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * expenv(dur, tau)

# ------------------------------------------------------------- sample banks
def board_thud():
    s = sweep(170 + rng.uniform(-15, 15), 95, 0.12, 0.035) * 0.9
    knock = np.sin(2 * np.pi * (720 + rng.uniform(-60, 60)) * t_(0.06)) * expenv(0.06, 0.012) * 0.35
    click = hp(rng.standard_normal(int(0.004 * SR)), 2500) * expenv(0.004, 0.0012) * 0.5
    out = np.zeros(int(0.12 * SR)); out[:len(knock)] += knock; out[:len(click)] += click; out += s
    return out
def paper_crunch(dur=0.075):
    if OBJ == 'banana': return banana_squish(dur)
    n = rng.standard_normal(int(dur * SR))
    if OBJ == 'cake':   # soft sponge squish
        grains = (rng.random(len(n)) < 0.02) * rng.standard_normal(len(n)) * 2
        return bp(n * 0.6 + grains, 350, 3200) * expenv(dur * 1.3, dur * 0.5, 0.008)[:len(n)]
    grains = (rng.random(len(n)) < 0.06) * rng.standard_normal(len(n)) * 3
    x = bp(n * 0.5 + grains, 1400, 7500) * expenv(dur, dur * 0.35, 0.004)
    return x
def slice_swish(dur=0.05):
    if OBJ == 'banana':   # soft fruit: the blade whispers rather than hisses
        return bp(rng.standard_normal(int(dur * SR)), 2200, 7000) * expenv(dur, dur * 0.45, 0.007) * 0.75
    x = bp(rng.standard_normal(int(dur * SR)), 3500, 11000) * expenv(dur, dur * 0.4, 0.006)
    return x
def banana_squish(dur=0.085):
    # wet, low, short: flesh parting, with a faint snick where the skin breaks
    n = int(dur * SR)
    body = bp(rng.standard_normal(n), 220, 1700) * expenv(dur, dur * 0.40, 0.006)
    wet = lp(rng.standard_normal(n), 700) * expenv(dur, dur * 0.22, 0.004) * 0.55
    snick = hp(rng.standard_normal(int(0.006 * SR)), 3200) * expenv(0.006, 0.0016) * 0.20
    out = body * 0.95 + wet
    out[:len(snick)] += snick
    return out
def banana_board():
    # nothing to crunch through, so the blade reaches the board with a clean little tock
    s = sweep(215 + rng.uniform(-18, 18), 120, 0.085, 0.022) * 0.72
    knock = np.sin(2 * np.pi * (860 + rng.uniform(-70, 70)) * t_(0.045)) * expenv(0.045, 0.009) * 0.30
    click = hp(rng.standard_normal(int(0.003 * SR)), 2800) * expenv(0.003, 0.0009) * 0.32
    out = np.zeros(int(0.085 * SR)); out += s
    out[:len(knock)] += knock; out[:len(click)] += click
    return out
def banana_plop(size):
    # a lump of banana landing: low, soft, wet, no crackle at all
    f = float(np.interp(size, [0.2, 3.0], [380, 95]))
    body = sweep(f * 1.5, f, 0.13, 0.025 + size * 0.012) * min(1, 0.35 + size * 0.22)
    squish = lp(rng.standard_normal(int(0.05 * SR)), 1400) * expenv(0.05, 0.011) * 0.35
    out = np.zeros(int(0.13 * SR)); out += body; out[:len(squish)] += squish
    return out
if OBJ == 'banana':
    CHOP_V = [(banana_board(), banana_squish(), slice_swish()) for _ in range(10)]
    CHOP_H = [(banana_squish(0.11), slice_swish(0.09)) for _ in range(10)]
else:
    CHOP_V = [(board_thud(), paper_crunch(), slice_swish()) for _ in range(10)]
    CHOP_H = [(paper_crunch(0.12), slice_swish(0.09)) for _ in range(10)]

def big_thud():
    s = sweep(110, 48, 0.45, 0.12)
    body = lp(rng.standard_normal(int(0.25 * SR)), 380) * expenv(0.25, 0.05) * 1.2
    slap = bp(rng.standard_normal(int(0.09 * SR)), 900, 4500) * expenv(0.09, 0.02) * 0.6
    out = np.zeros(int(0.45 * SR)); out += s; out[:len(body)] += body; out[:len(slap)] += slap
    return out
def whoosh(dur=0.35, lo=500, hi=3500):
    t = t_(dur); env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return bp(rng.standard_normal(len(t)), lo, hi) * env
def flop(size):
    # a falling chunk of bills landing: low body + paper slap, pitched by size
    f = np.interp(size, [0.3, 10], [420, 75])
    body = sweep(f * 1.4, f, 0.16, 0.03 + size * 0.006) * min(1, 0.3 + size * 0.1)
    slap = bp(rng.standard_normal(int(0.06 * SR)), 900, 6000) * expenv(0.06, 0.012) * 0.5
    out = np.zeros(int(0.16 * SR)); out += body; out[:len(slap)] += slap
    return out
def ding(freq, dur=1.2, g=1.0):
    t = t_(dur)
    x = (np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.5) + 0.45 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / 0.18)
         + 0.25 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t / 0.07))
    return x * np.minimum(1, t / 0.002) * g
def pop(f0=500, f1=900):
    t = t_(0.08); f = np.linspace(f0, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * expenv(0.08, 0.02)

# ------------------------------------------------------------- knife cuts
for c in CUTS:
    r = ROUNDS[c['ri']]; dt = r['dt']
    a = float(np.clip((dt / 0.09) ** 0.55, 0.16, 1.0))
    t = c['t']
    pan = rng.uniform(-0.15, 0.15)
    GS, GC, GT = (0.26, 0.62, 0.58) if OBJ == 'banana' else (0.30, 0.55, 0.75)
    if c['axis'] == 1:
        crunch, sw = CHOP_H[rng.integers(10)]
        place(sfx, sw, t - min(0.05, dt * 0.5), GS * 1.17 * a, pan)
        place(sfx, crunch, t - min(0.06, dt * 0.55), GC * a, pan)
    else:
        thud, crunch, sw = CHOP_V[rng.integers(10)]
        place(sfx, sw, t - min(0.045, dt * 0.5), GS * a, pan)
        place(sfx, crunch, t - min(0.05, dt * 0.45), GC * a, pan)
        place(sfx, thud, t, GT * a, pan)

# ------------------------------------------------------------- per-round events
NOTE = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0]
for ri, r in enumerate(ROUNDS):
    s0 = r['start']
    if ri > 0: place(sfx, whoosh(0.22, 700, 5000), s0 - 0.08, 0.22); place(sfx, pop(380, 640), s0, 0.12)
    place(sfx, whoosh(0.26, 300, 1600), s0 + 0.02, 0.18)
    place(sfx, big_thud(), s0 + 0.30, 0.38 if OBJ == 'banana' else 0.85)
    place(sfx, whoosh(0.4, 600, 4200), s0 + r['phases'][0]['t0'] - 0.42, 0.22, 0.4)          # knife comes in
    for k in (0, 1): place(sfx, whoosh(0.25, 800, 5000), s0 + r['phases'][k]['t1'] + 0.02, 0.12, 0.3)
    place(sfx, whoosh(0.3, 600, 4500), s0 + r['cutEnd'], 0.18, 0.5)                              # knife leaves
    # collapse
    h = HISTS[ri]; hist = np.array(h['hist']); t0 = h['t0']
    total = r['total']
    if total <= 3000:
        if OBJ == 'banana':
            size = float(np.cbrt(157.0 / total))          # one banana is about 157 cm3 with its skin on
            g = float(np.interp(np.log10(max(total, 2)), [1.0, 2.0, 3.0], [0.50, 0.26, 0.12]))
            bank = [banana_plop(size) for _ in range(12)]
        else:
            size = float(np.cbrt(31.2 * 27.5 * 13.2 / total))
            g = {18: 0.55, 126: 0.32}.get(total, 0.10)
            bank = [flop(size) for _ in range(12)]
        for b, cnt in enumerate(hist):
            for _ in range(int(round(cnt))):
                place(sfx, bank[rng.integers(12)], t0 + (b + rng.random()) * 0.01, g * rng.uniform(0.6, 1.0), rng.uniform(-0.6, 0.6))
    else:
        dur = len(hist) * 0.01 + 0.6
        n = int(dur * SR)
        rate = np.interp(np.arange(n) / SR, (np.arange(len(hist)) + 0.5) * 0.01, hist, left=0, right=0)
        rate = lp(rate, 18) ; rate = np.maximum(rate, 0)
        e = (rate / rate.max()) ** 0.5
        if OBJ == 'banana':
            # soft wet mush early, dry sand-like pour once the pieces are tiny: the grain
            # band and the hiss both climb with the piece count, the low rumble falls away
            f = float(np.clip((np.log10(total) - 4.0) / 2.0, 0.0, 1.0))      # 10k -> 1M
            loud = 0.55 + 0.30 * f
            HLO, HHI = 500 + 700 * f, 4200 + 3300 * f
            GLO, GHI = 700 + 1100 * f, 4500 + 3200 * f
            HG, GG, RG, DENS = 0.34 + 0.22 * f, 1.4 + 0.8 * f, 1.0 - 0.72 * f, 1600 + 1800 * f
        else:
            loud = {65856: 0.55, 1285312: 0.75}.get(total, 0.9)
            HLO, HHI, GLO, GHI = (700, 5000, 900, 5500) if OBJ == 'cake' else (1500, 9000, 1800, 8000)
            HG, GG, RG, DENS = 0.45, 1.8, 0.9, 2500
        hiss = bp(rng.standard_normal(n), HLO, HHI) * e * HG
        # grains: density follows rate, capped
        dens = np.clip(rate / rate.max() * DENS, 0, DENS) / SR
        imp = (rng.random(n) < dens) * rng.uniform(0.3, 1.0, n)
        grains = bp(imp, GLO, GHI) * GG
        rumble = lp(rng.standard_normal(n), 220) * e * RG
        L = (hiss + grains + rumble) * loud
        R = (bp(rng.standard_normal(n), HLO, HHI) * e * HG + bp((rng.random(n) < dens) * rng.uniform(0.3, 1.0, n), GLO, GHI) * GG + rumble) * loud
        i = int(t0 * SR); m = min(n, N - i)
        sfx[0, i:i + m] += L[:m].astype(np.float32); sfx[1, i:i + m] += R[:m].astype(np.float32)
    # reward ding when the pile settles
    place(sfx, ding(NOTE[ri], 1.2, 0.18), s0 + r['tc'] + 0.0 + (r['dur'] - r['tc']) * 0.62, 0.0)

# final round: boom
R6 = ROUNDS[5]['start']
boom = sweep(90, 38, 1.2, 0.35) * 1.0
boom[:int(0.2 * SR)] += lp(rng.standard_normal(int(0.2 * SR)), 900) * expenv(0.2, 0.04) * 0.8
place(sfx, boom, R6 + 0.05, 0.40 if OBJ == 'banana' else 0.6)
# riser into the final round
rt = t_(1.2); riser = bp(rng.standard_normal(len(rt)), 900, 7000) * (rt / 1.2) ** 2.5
place(sfx, riser, R6 - 1.2, 0.18)

# end card
ES = 3.5 / 5.0
place(sfx, whoosh(0.5, 300, 3000), END - 0.05, 0.3)
place(sfx, pop(300, 700), END + 0.15 * ES, 0.3)
place(sfx, pop(500, 800), END + 0.85 * ES, 0.15)
click = hp(rng.standard_normal(int(0.01 * SR)), 2000) * expenv(0.01, 0.002)
for ta in (1.95, 2.7, 3.45): place(sfx, click, END + ta * ES, 0.5)
place(sfx, ding(1318.5, 1.0, 0.35), END + 2.0 * ES, 0.0)                       # subscribed
place(sfx, ding(1568.0, 0.9, 0.3) + 0, END + 2.72 * ES, 0.2)                   # bell
place(sfx, ding(2093.0, 0.9, 0.22), END + 2.86 * ES, 0.2)
place(sfx, pop(600, 1100), END + 3.47 * ES, 0.35)                              # like

# ------------------------------------------------------------- music (original, 96 BPM, Am-F-C-G)
MUSG = 0.0 if OBJ == 'banana' else 0.55      # the banana cut is pure ASMR, no bed
BPM = 96; beat = 60 / BPM; bar = beat * 4
def kick():
    return sweep(130, 50, 0.32, 0.09)
def clap():
    x = np.zeros(int(0.16 * SR))
    for o in (0, 0.008, 0.017):
        b = bp(rng.standard_normal(int(0.14 * SR)), 900, 5200) * expenv(0.14, 0.03)
        i = int(o * SR); x[i:i + len(b)] += b[:len(x) - i]
    return x
def hat(open_=False):
    d = 0.18 if open_ else 0.04
    return hp(rng.standard_normal(int(d * SR)), 7000) * expenv(d, d * 0.3, 0.001)
def pluck(f, dur=0.45):
    t = t_(dur)
    x = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t) * np.exp(-t * (6 + 4 * k)) for k in range(5))
    return x * np.minimum(1, t / 0.003)
def pad(freqs, dur):
    t = t_(dur); x = np.zeros(len(t))
    for f in freqs:
        for det in (-0.4, 0.4):
            ph = 2 * np.pi * (f + det) * t
            x += np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    env = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4)
    return lp(x, 1600) * env / (len(freqs) * 2)
CH = [([220.0, 261.6, 329.6], 110.0), ([174.6, 220.0, 261.6], 87.3), ([261.6, 329.6, 392.0], 130.8), ([196.0, 246.9, 293.7], 98.0)]
ARP = [[440, 523.3, 659.3, 523.3], [349.2, 440, 523.3, 440], [392, 523.3, 659.3, 523.3], [392, 493.9, 587.3, 493.9]]
KB, HB = kick(), [hat() for _ in range(6)]
CL = clap(); OH = hat(True)
nbars = int(np.ceil(TOTAL / bar)) + 1 if MUSG > 0 else 0
r3 = ROUNDS[2]['start']; r6 = ROUNDS[5]['start']
for b in range(nbars):
    tb = b * bar
    if tb > TOTAL: break
    chord, root = CH[b % 4]
    place(mus, pad(chord, bar + 0.3), tb, 0.30)
    for q in range(8):
        t = tb + q * beat / 2 + (0.018 if q % 2 else 0)
        if t > END + 4.5: break
        if t < END: place(mus, HB[(b + q) % 6], t, 0.10 if q % 2 else 0.16, 0.3)
        place(mus, pluck(ARP[b % 4][q % 4] * (2 if t >= r6 and q % 2 else 1)), t, 0.07 if t < r3 else 0.10, -0.35 + 0.7 * (q % 2))
    if tb >= ROUNDS[1]['start'] - 0.01 and tb < END:
        for q in (0, 2): place(mus, KB, tb + q * beat, 0.55)
        if tb >= r3: place(mus, KB, tb + 2.5 * beat, 0.35)
        for q in (1, 3): place(mus, CL, tb + q * beat, 0.16 if tb >= r3 else 0.08)
        bl = np.sin(2 * np.pi * root * t_(beat * 1.4)) * expenv(beat * 1.4, 0.35, 0.01)
        bl = bl + 0.3 * np.sin(2 * np.pi * root * 2 * t_(beat * 1.4)) * expenv(beat * 1.4, 0.2, 0.01)
        place(mus, bl, tb, 0.30); place(mus, bl, tb + 2.5 * beat, 0.22)
    if tb >= r6 and tb < END: place(mus, OH, tb + 3.5 * beat, 0.12, 0.3)
# fade music out over the last second
fo = np.ones(N); i0 = int((TOTAL - 1.0) * SR); i1 = int(TOTAL * SR)
fo[i0:i1] = np.linspace(1, 0, i1 - i0); fo[i1:] = 0
mus *= fo
mi = np.clip((np.arange(N) / SR - (END - 0.4)) / 0.4, 0, 1)
mus *= mi

# duck music under dense SFX a little
env = np.abs(sfx).mean(0); env = lp(env, 6); env = env / (env.max() + 1e-9)
mus *= (1 - 0.45 * np.clip(env * 2.5, 0, 1))

mix = sfx * 1.0 + mus * MUSG
mix = mix[:, :int(TOTAL * SR)]
peak = np.abs(mix).max(); mix = mix / peak * 0.89
wavfile.write('/home/claude/chop/' + os.environ.get('WAV', 'mix_raw.wav'), SR, mix.T.astype(np.float32))
for name, x in (('sfx', sfx), ('mus', mus)):
    print(name, 'rms dB', 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12))
print('written', mix.shape[1] / SR, 's')
