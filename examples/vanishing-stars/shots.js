const SHOTS = [], CUES = [];
const A = (i, d = -0.06) => S(i) + d;
const WT = (i, w) => wordT(i, w) - A(i);
function shot(a, draw, o = {}) { SHOTS.push({ a, draw, cam: o.cam, ui: o.ui }); (o.cues || []).forEach(c => CUES.push(c)); if (!o.noWhoosh) CUES.push([a, 'whoosh']); }
const YEL = '#FFD24A', ROSE = '#FF6B5A', ICE = '#9FD8FF', FL = '#FFC46B', MINT = '#7CF2B0', VIO = '#B48CFF', PINK = '#FF8FC8';
const D2R = Math.PI / 180, TAU = Math.PI * 2;
const LIGHT_L = COS.light(-152, 30);

// ---------------------------------------------------------------- caches (pure: seeded once)
const _cache = {};
function cached(key, fn) { return _cache[key] || (_cache[key] = fn()); }
function gauss(r) { return (r() + r() + r() + r() - 2) / 2; }

// ---------------------------------------------------------------- backgrounds
function space(t, o = {}) {
  sky(o.top || '#02040b', o.bot || '#071022');
  if (o.neb) COS.nebula(o.nebSeed || 3, { t, alpha: o.neb, hues: o.hues });
  if (o.mw) COS.milkyWay({ y: o.mwY === undefined ? 470 : o.mwY, rot: o.mwRot === undefined ? -0.28 : o.mwRot, thick: o.mwThick || 230, alpha: o.mw, seed: 31 });
  COS.starfield(o.seed || 7, { density: o.density || 1, twinkleT: t, drift: (o.drift || 0) * t, alpha: o.starA });
}
function vig(k = 0.55) { COS.vignette(k); }
function deep(t, o = {}) {   // intergalactic dark: few stars, distant galaxies as smudges
  sky('#010208', '#050a18');
  COS.starfield(o.seed || 11, { density: 0.35, twinkleT: t, drift: (o.drift || 0) * t, alpha: 0.7 });
  const pts = cached('smudge' + (o.seed || 11), () => { const r = rnd(o.seed || 11); return Array.from({ length: 46 }, () => [r() * 2200 - 140, r() * 1080, 3 + r() * 9, r() * 3, r()]); });
  pts.forEach(([x, y, s, a, c]) => { const xx = ((x - (o.drift || 0) * t * (0.5 + c)) % 2200 + 2200) % 2200 - 140; ctx.save(); ctx.translate(xx, y); ctx.rotate(a); ctx.scale(1, 0.45); COS.glow(0, 0, s * 3, c > 0.5 ? '#ffe0b8' : '#cfe0ff', 0.5); ctx.restore(); });
}

// ---------------------------------------------------------------- galaxies
function galaxyPts(seed, n, arms) {
  return cached('g' + seed + '_' + n, () => { const r = rnd(seed), out = [];
    for (let i = 0; i < n; i++) { const arm = i % arms, d = Math.pow(r(), 0.7), th = arm * TAU / arms + d * 4.6 + gauss(r) * 0.5 * (1.2 - d);
      const knot = r() < 0.05; out.push([Math.cos(th) * d, Math.sin(th) * d, d, r(), knot]); }
    return out; });
}
function galaxy(x, y, R, o = {}) {   // a spiral seen at an angle; self-luminous
  const pts = galaxyPts(o.seed || 5, o.n || 1100, o.arms || 2), rot = (o.rot || 0) + (o.t || 0) * (o.spin || 0), sq = o.tilt === undefined ? 0.55 : o.tilt, A = o.alpha === undefined ? 1 : o.alpha;
  ctx.save(); ctx.globalAlpha = A; ctx.translate(x, y);
  COS.glow(0, 0, R * 1.25, o.halo || '#7d8fd8', 0.16);
  ctx.save(); ctx.scale(1, sq); COS.glow(0, 0, R * 0.95, '#a9b8ff', 0.3); COS.glow(0, 0, R * 0.55, '#c9d2ff', 0.3); ctx.restore();
  const c = Math.cos(rot), s = Math.sin(rot);
  for (const [px, py, d, b, knot] of pts) { const X = (px * c - py * s) * R, Y = (px * s + py * c) * R * sq;
    if (knot) { ctx.fillStyle = 'rgba(255,140,200,0.75)'; ctx.fillRect(X - 2, Y - 2, 4, 4); continue; }
    const a = Math.min(1, (0.45 + 0.6 * b) * (1.25 - d)); ctx.fillStyle = d < 0.25 ? `rgba(255,228,190,${a})` : `rgba(190,210,255,${a})`; const z = (1 + (b > 0.9 ? 1.2 : 0)) * Math.max(1.6, R / 140); ctx.fillRect(X, Y, z, z); }
  ctx.save(); ctx.scale(1, sq); COS.glow(0, 0, R * 0.32, o.core || '#ffe2b0', 0.75); COS.glow(0, 0, R * 0.1, '#fff4dc', 0.85); ctx.restore();
  ctx.restore();
}

// ================================================================ "The Stars That Die Without Exploding"
// Lane: mechanism (a star that collapses without a supernova) + the census that hints at it.
// One light per frame: the star is the light, or the frame is self-lit (galaxies, black holes).
const IR = '#FF4A3A', AMBER = '#FFB347', STEEL = '#8a96b0';
function sGiant(x, y, r, t, o = {}) {   // red supergiant: limb-darkened, slow convection cells; o.alpha fades it
  const A = o.alpha === undefined ? 1 : o.alpha; if (A <= 0.003) return;
  COS.star(x, y, r, { t, core: '#ffe0b0', mid: '#ff8a40', out: '#c83a22', alpha: A, rayN: 20, seed: o.seed || 8 });
  const cells = cached('cells' + (o.seed || 8), () => { const R = rnd(o.seed || 8); return Array.from({ length: 18 }, () => [R() * TAU, Math.sqrt(R()) * 0.85, 0.16 + R() * 0.24, R() * TAU]); });
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  cells.forEach(([a, dd, s, ph]) => { const px = x + Math.cos(a + t * 0.01) * dd * r, py = y + Math.sin(a + t * 0.01) * dd * r, k = 0.5 + 0.5 * Math.sin(t * 0.35 + ph);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * s); g.addColorStop(0, `rgba(255,236,190,${0.24 * k * A})`); g.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = g; ctx.fillRect(px - r * s, py - r * s, 2 * r * s, 2 * r * s); });
  const g = ctx.createRadialGradient(x - r * 0.1, y - r * 0.1, r * 0.45, x, y, r); g.addColorStop(0, 'rgba(90,12,0,0)'); g.addColorStop(1, `rgba(90,12,0,${0.6 * A})`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
}
function blast(x, y, u, t, o = {}) {   // a supernova: flash, expanding shell, fading
  if (u <= 0) return; const R = o.R || 700;
  const I = u < 0.1 ? u / 0.1 : Math.exp(-(u - 0.1) * 2.2);
  COS.glow(x, y, R * (0.4 + u * 1.3), '#ffb070', 0.5 * I); COS.glow(x, y, R * 0.18, '#fff2dc', 0.85 * I);
  COS.shockwave(x, y, Math.min(1, u * 1.1), { r0: 40, r1: R, thick: 60 });
  const pts = cached('ej', () => { const r = rnd(33); return Array.from({ length: 260 }, () => [r() * TAU, 0.6 + r() * 0.45, r()]); });
  pts.forEach(([a, f, b]) => { const rr = R * f * easeOut(Math.min(1, u * 1.2)); ctx.fillStyle = b > 0.5 ? `rgba(255,190,120,${0.7 * (1 - u * 0.6)})` : `rgba(160,200,255,${0.6 * (1 - u * 0.6)})`; ctx.fillRect(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 3, 3); });
}
function bh(x, y, r, t, o = {}) { COS.glow(x, y, r * 3.2, '#ffcf9a', 0.08 * (o.alpha === undefined ? 1 : o.alpha)); COS.blackHole(x, y, r, { t, disc: o.disc === undefined ? true : o.disc, tilt: o.tilt || 0.2, alpha: o.alpha, seed: o.seed }); }
function bareBH(x, y, r) {   // a black hole with no disc: lensed starlight ring around a true-black shadow
  COS.glow(x, y, r * 3.4, '#7fa8ff', 0.16); COS.glow(x, y, r * 1.7, '#dbe8ff', 0.32);
  ctx.save(); ctx.lineWidth = r * 0.3; ctx.strokeStyle = 'rgba(170,200,255,0.18)'; ctx.beginPath(); ctx.arc(x, y, r * 1.45, 0, TAU); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.lineWidth = r * 0.12; ctx.strokeStyle = 'rgba(200,225,255,0.35)'; ctx.beginPath(); ctx.arc(x, y, r * 1.18, 0, TAU); ctx.stroke();
  ctx.lineWidth = r * 0.05; ctx.strokeStyle = 'rgba(235,245,255,0.75)'; ctx.beginPath(); ctx.arc(x, y, r * 1.04, 0, TAU); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
}
function collapse(x, y, r, u, t, o = {}) {   // a giant star falls in on itself; no flash. u 0..1
  const k = easeIO(clamp(u / 0.85, 0, 1)), rr = lerp(r, r * 0.06, k);
  sGiant(x, y, rr, t, { alpha: 1 - ss(0.55, 0.95, u) });
  const pts = cached('inf', () => { const R = rnd(7); return Array.from({ length: 240 }, () => [R() * TAU, 1 + R() * 0.8, R()]); });
  ctx.save(); pts.forEach(([a, f, b]) => { const d = r * f * (1 - ss(0, 0.9, u + b * 0.1)); if (d < rr * 0.9) return; const aa = a + u * 1.8 * (1.4 - f * 0.5);
    ctx.fillStyle = `rgba(255,${120 + b * 90},80,${0.55 * ss(0, 0.2, u) * (1 - ss(0.8, 1, u))})`; ctx.fillRect(x + Math.cos(aa) * d, y + Math.sin(aa) * d, 3, 3); }); ctx.restore();
  if (u > 0.7) { const a = ss(0.7, 1, u); bareBH(x, y, r * 0.09 * a + 2); }
  if (o.dust && u > 0.85) { const a = ss(0.85, 1, u); COS.glow(x, y, r * 1.6, IR, 0.22 * a); }
}
function dustGlow(x, y, R, t, a = 1) {   // the lingering infrared glow: warm dust round an empty spot
  const pts = cached('dust', () => { const r = rnd(41); return Array.from({ length: 380 }, () => [r() * TAU, 0.3 + r() * 0.9, r()]); });
  COS.glow(x, y, R * 1.4, IR, 0.2 * a); COS.glow(x, y, R * 0.6, '#ff8a5a', 0.2 * a);
  pts.forEach(([an, f, b]) => { const aa = an + t * 0.02 * (1.3 - f); ctx.fillStyle = `rgba(255,${90 + b * 70},60,${(0.25 + 0.4 * b) * a})`; ctx.fillRect(x + Math.cos(aa) * f * R, y + Math.sin(aa) * f * R * 0.85, 2.6, 2.6); });
}
function onion(x, y, R, o = {}) {   // a cut-open massive star: fusion shells, iron core in the middle
  const cs = o.core === undefined ? 1 : o.core, A = o.alpha === undefined ? 1 : o.alpha;
  const L = [[1, '#c8452a', 'HYDROGEN'], [0.62, '#e8743a', 'HELIUM'], [0.4, '#f2a24a', 'CARBON, OXYGEN'], [0.24, '#f6d27a', 'SILICON'], [0.12 * cs, STEEL, 'IRON CORE']];
  ctx.save(); ctx.globalAlpha = A; COS.glow(x, y, R * 1.6, '#ff7a3c', 0.18);
  L.forEach(([f, col], i) => { const g = ctx.createRadialGradient(x - R * f * 0.2, y - R * f * 0.2, 0, x, y, R * f); g.addColorStop(0, shade(col, 0.25)); g.addColorStop(1, shade(col, -0.25)); ctx.beginPath(); ctx.arc(x, y, Math.max(1, R * f), 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(10,14,28,0.5)'; ctx.lineWidth = 3; ctx.stroke(); });
  if (o.labels) L.forEach(([f, col, lab], i) => { const k = pop(o.tl || 9, 0.3 + i * 0.35); if (k <= 0) return; const a = -0.55 + i * 0.32, rr = R * (i < 4 ? (f + L[i + 1][0]) / 2 : f * 0.5), px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    ctx.save(); ctx.globalAlpha = A * Math.min(1, k); line(px, py, x + R + 80, y - 300 + i * 150, 3, '#e8eefc'); text(lab, x + R + 100, y - 300 + i * 150, 38, '#fff', 900, 'left', INK, 7); ctx.restore(); });
  ctx.restore();
}
function shockRing(x, y, r, a = 1, col = '#fff2dc') { ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 10; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); COS.glow(x, y, r * 1.05, col, 0.15 * a); }
function neutrinos(x, y, R, tl, a = 1) { const pts = cached('nu', () => { const r = rnd(5); return Array.from({ length: 160 }, () => [r() * TAU, r()]); });
  pts.forEach(([an, ph]) => { const f = (tl * 0.6 + ph) % 1, d = f * R; ctx.fillStyle = `rgba(190,240,255,${0.8 * a * (1 - f)})`; ctx.fillRect(x + Math.cos(an) * d - 2, y + Math.sin(an) * d - 2, 4, 4); }); }
function infall(x, y, R, tl, a = 1) { for (let i = 0; i < 14; i++) { const an = i / 14 * TAU + 0.2, f = 1 - ((tl * 0.5 + i * 0.13) % 1), d0 = R * (0.4 + f * 0.6);
  ctx.save(); ctx.globalAlpha = a * (0.3 + 0.7 * f); COS.arrow(ctx, x + Math.cos(an) * d0, y + Math.sin(an) * d0, x + Math.cos(an) * (d0 - R * 0.22), y + Math.sin(an) * (d0 - R * 0.22), { col: '#ffe2c0', lw: 6 }); ctx.restore(); } }
function balance(x, y, R, tl, o = {}) {   // gravity in, pressure out
  const n = 10; for (let i = 0; i < n; i++) { const an = i / n * TAU + 0.31;
    if (o.inA) { ctx.save(); ctx.globalAlpha = o.inA; COS.arrow(ctx, x + Math.cos(an) * R * 1.55, y + Math.sin(an) * R * 1.55, x + Math.cos(an) * R * 1.12, y + Math.sin(an) * R * 1.12, { col: ICE, lw: 9 }); ctx.restore(); }
    if (o.outA) { const a2 = an + Math.PI / n; ctx.save(); ctx.globalAlpha = o.outA; COS.arrow(ctx, x + Math.cos(a2) * R * 0.45, y + Math.sin(a2) * R * 0.45, x + Math.cos(a2) * R * 0.9, y + Math.sin(a2) * R * 0.9, { col: YEL, lw: 9 }); ctx.restore(); } }
}
// --------- telescope "images": a dark frame of field stars, one target at the crosshair
function frame(x, y, w, h, lab, starA, o = {}) {
  rrect(x - w / 2, y - h / 2, w, h, 16); shape('#04060c', '#cfd8ea', 5);
  ctx.save(); rrect(x - w / 2, y - h / 2, w, h, 16); ctx.clip();
  const r = rnd(o.seed || 17); for (let i = 0; i < 90; i++) { const px = x - w / 2 + r() * w, py = y - h / 2 + r() * h, s = 1 + r() * 3; COS.glow(px, py, s * 3, '#dfe6ff', 0.45); ctx.fillStyle = '#eef2ff'; ctx.fillRect(px - 1, py - 1, 2, 2); }
  if (o.ir) COS.glow(x, y, 46, IR, 0.5 * o.ir);
  if (starA > 0.002) { COS.glow(x, y, 70 * starA + 8, '#ffc890', 0.85 * starA); COS.glow(x, y, 16 * starA + 3, '#fff3e0', 0.9 * starA); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(124,242,176,0.85)'; ctx.lineWidth = 3; [[-60, -24], [24, 60]].forEach(([a, b]) => { line(x + a, y, x + b, y, 3, 'rgba(124,242,176,0.85)'); line(x, y + a, x, y + b, 3, 'rgba(124,242,176,0.85)'); }); ctx.restore();
  text(lab, x, y + h / 2 + 50, 44, '#fff', 900, 'center', INK, 8);
}
function lightCurve(x, y, w, h, u, o = {}) {   // DS1 brightness, 2005-2023 (shape simplified): IR bump 2014, fade from 2016
  const X = yr => x + (yr - 2005) / 18 * w;
  rrect(x - 40, y - h - 40, w + 80, h + 120, 20); shape('rgba(8,12,26,0.9)', '#cfd8ea', 4);
  line(x, y, x + w, y, 4, '#cfd8ea'); line(x, y, x, y - h, 4, '#cfd8ea');
  [2005, 2014, 2016, 2023].forEach(yr => { line(X(yr), y, X(yr), y + 12, 3, '#cfd8ea'); text(String(yr), X(yr), y + 44, 30, '#cfd8ea', 900, 'center', null); });
  text('BRIGHTNESS', x - 10, y - h - 2, 28, '#cfd8ea', 900, 'left', null);
  const f = yr => yr < 2014 ? 0.78 : yr < 2016 ? 0.78 + 0.12 * Math.sin((yr - 2014) / 2 * Math.PI) * (o.ir ? 1 : 0.4) : 0.78 * Math.exp(-(yr - 2016) * 0.75) + 0.01;
  const end = 2005 + 18 * clamp(u, 0, 1);
  ctx.save(); ctx.beginPath(); for (let yr = 2005; yr <= end; yr += 0.05) { const px = X(yr), py = y - f(yr) * h; yr === 2005 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.strokeStyle = AMBER; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  COS.glow(X(end), y - f(end) * h, 30, AMBER, 0.7);
}
// --------- gravitational waves
function ripples(x, y, t, o = {}) {   // two-armed spiral of wave crests from an orbiting pair
  const R = o.R || 1000, gap = o.gap || 170, om = o.om || 2.4, A = o.alpha === undefined ? 1 : o.alpha, flat = o.flat || 0.62, st = 7;
  ctx.save(); ctx.lineCap = 'round';
  for (let arm = 0; arm < 2; arm++) for (let r = o.r0 || 60; r < R; r += st) { const a1 = -r / gap * Math.PI - t * om + arm * Math.PI, a2 = -(r + st) / gap * Math.PI - t * om + arm * Math.PI, f = A * (1 - r / R);
    ctx.strokeStyle = `rgba(159,216,255,${0.6 * f})`; ctx.lineWidth = (o.lw || 7) * (1 - 0.6 * r / R); ctx.beginPath(); ctx.moveTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r * flat); ctx.lineTo(x + Math.cos(a2) * (r + st), y + Math.sin(a2) * (r + st) * flat); ctx.stroke(); }
  ctx.restore();
}
function pair(x, y, sep, ang, r1, r2) { const m = r1 + r2; bareBH(x + Math.cos(ang) * sep * r2 / m, y + Math.sin(ang) * sep * r2 / m * 0.62, r1); bareBH(x - Math.cos(ang) * sep * r1 / m, y - Math.sin(ang) * sep * r1 / m * 0.62, r2); }
function merger(x, y, u, t, o = {}) {   // inspiral → merge → ring; u 0..1
  const s = o.s || 1, sep = lerp(360, 0, Math.pow(clamp(u / 0.8, 0, 1), 1.6)) * s, ang = t * 1.2 + 14 * Math.pow(clamp(u / 0.8, 0, 1), 3);
  ripples(x, y, t * (1 + 2 * u), { alpha: 0.4 + 0.6 * u, gap: lerp(220, 120, u) * s, R: 1100 * s, om: 2 + 5 * u });
  if (u < 0.8) pair(x, y, sep, ang, 46 * s, 52 * s); else { const k = ss(0.8, 0.9, u); COS.glow(x, y, 260 * s * (1 - k) + 40, '#cfe6ff', 0.6 * (1 - k)); bareBH(x, y, 70 * s); }
}
function ligo(x, y, s, t, o = {}) {   // an L-shaped detector from above: two 4 km arms
  const st = o.strain || 0, wob = Math.sin(t * 9) * st;
  withT(x, y, 0, s, () => {
    const g = ctx.createLinearGradient(-200, -700, 900, 200); g.addColorStop(0, '#2c3a2a'); g.addColorStop(1, '#1a2418'); ctx.fillStyle = g; ctx.fillRect(-1400, -1400, 3600, 2600);
    const ax = 700 * (1 + 0.05 * wob), ay = 640 * (1 - 0.05 * wob);
    rrect(0, -22, ax, 44, 20); shape('#c9ced6', 'rgba(10,14,28,0.6)', 3); rrect(-22, -ay, 44, ay, 20); shape('#b5bbc6', 'rgba(10,14,28,0.6)', 3);
    rrect(-80, -60, 140, 120, 14); shape('#e9edf3', 'rgba(10,14,28,0.6)', 3); rrect(ax - 30, -50, 90, 100, 12); shape('#dfe3ea', 'rgba(10,14,28,0.6)', 3); rrect(-50, -ay - 60, 100, 90, 12); shape('#dfe3ea', 'rgba(10,14,28,0.6)', 3);
    if (o.beam) { ctx.save(); ctx.globalAlpha = o.beam; line(20, 0, ax - 10, 0, 6, '#ff5a4a'); line(0, -20, 0, -ay + 10, 6, '#ff5a4a'); COS.glow(ax - 10, 0, 30, '#ff5a4a', 0.6); COS.glow(0, -ay + 10, 30, '#ff5a4a', 0.6); ctx.restore(); }
    if (o.label) { text('4 KM', ax / 2, 90, 54, '#fff', 900, 'center', INK, 8); text('4 KM', -110, -ay / 2, 54, '#fff', 900, 'center', INK, 8); }
  });
}
// --------- the census: one dot per merger, stacked by the heavier black hole's mass (shape simplified)
const BINS = [[6, 14], [8, 95], [10, 80], [12, 1], [14, 2], [16, 9], [18, 8], [20, 7], [22, 6], [24, 5], [26, 4], [28, 4], [30, 3], [32, 3], [34, 3], [36, 2], [38, 2], [40, 2], [42, 1], [44, 1]];
const HX0 = 330, HPX = 30, HY = 900, DOT = 15;   // x of 4 suns, px per sun, baseline, dot pitch
const hx = m => HX0 + (m - 4) * HPX;
function census(u, o = {}) {
  line(hx(4), HY, hx(47), HY, 5, '#cfd8ea');
  [6, 10, 12, 16, 20, 30, 40].forEach(m => { line(hx(m), HY, hx(m), HY + 14, 4, '#cfd8ea'); text(String(m), hx(m), HY + 48, 34, '#cfd8ea', 900, 'center', null); });
  text('MASS OF THE HEAVIER BLACK HOLE (SUNS)', hx(25), HY + 105, 32, '#cfd8ea', 900, 'center', null);
  if (o.simpl !== false) text('SHAPE SIMPLIFIED', 1840, 60, 24, 'rgba(207,216,234,0.7)', 900, 'right', null);
  let n = 0; const N = 250;
  BINS.forEach(([m, c]) => { const per = 3; for (let j = 0; j < c; j++) { n++; if (n / N > u) continue; const col = j % per, row = Math.floor(j / per); const px = hx(m) + 8 + col * DOT, py = HY - 12 - row * DOT;
    const hl = (o.peak && m >= 8 && m < 12) ? o.peak : 0, dim = o.dimRest && !(m >= 8 && m < 12) ? 0.45 : 1;
    ctx.globalAlpha = dim; circle(px, py, 6.5); shape(hl ? '#000' : '#0b0f1a', hl ? `rgba(255,210,74,${0.6 + 0.4 * hl})` : 'rgba(159,196,255,0.9)', 2.5); ctx.globalAlpha = 1; } });
  if (o.peak) { const k = o.peak; COS.glow(hx(10), HY - 200, 260, YEL, 0.25 * k); }
  if (o.gap) { const k = o.gap; ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([16, 12]); rrect(hx(12) + 2, HY - 540, hx(16) - hx(12) - 4, 525, 10); ctx.strokeStyle = ROSE; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = k * 0.18; ctx.fillStyle = ROSE; ctx.fillRect(hx(12) + 2, HY - 540, hx(16) - hx(12) - 4, 525); ctx.restore(); }
  if (o.fam) { const k = o.fam; ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.ellipse(hx(10) + 8, HY - 250, 100, 290, 0, 0, TAU); ctx.strokeStyle = MINT; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx(30), HY - 70, 450, 110, 0, 0, TAU); ctx.strokeStyle = VIO; ctx.stroke(); ctx.restore(); }
}
function spinCurves(u, o = {}) {   // spread of spins: narrow for the ~10-sun family, wide for the heavier one (shape simplified)
  const x0 = 360, x1 = 1560, y = 820; line(x0, y, x1, y, 5, '#cfd8ea'); text('SPIN →', x1, y + 50, 34, '#cfd8ea', 900, 'right', null); text('SHAPE SIMPLIFIED', 1840, 60, 24, 'rgba(207,216,234,0.7)', 900, 'right', null);
  const curve = (mu, sd, hgt, col, k, lab) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, k); ctx.beginPath(); for (let i = 0; i <= 200; i++) { const xx = x0 + (x1 - x0) * i / 200, z = (i / 200 - mu) / sd; const yy = y - hgt * Math.exp(-z * z / 2) * Math.min(1, k); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.lineTo(x1, y); ctx.lineTo(x0, y); ctx.closePath(); ctx.fillStyle = col.replace(')', ',0.25)').replace('rgb', 'rgba'); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    const lx = lab === 'HEAVIER FAMILY' ? x0 + (x1 - x0) * 0.78 : x0 + (x1 - x0) * mu, ly = lab === 'HEAVIER FAMILY' ? y - hgt * 0.75 : y - hgt - 40; text(lab, lx, ly, 40, '#fff', 900, 'center', INK, 8); };
  curve(0.5, 0.2, 260, 'rgb(180,140,255)', o.wide || 0, 'HEAVIER FAMILY');
  curve(0.45, 0.07, 480, 'rgb(124,242,176)', o.narrow || 0, '≈ 10 SUNS');
}
function paper(x, y, s, head, sub, col, tl) { withT(x, y, 0.03, pop(tl, 0.2) * s, () => { rrect(-330, -380, 660, 760, 20); shape('#f6f2ea', INK, 7); rrect(-330, -380, 660, 140, 20); shape(col, INK, 7); text(head, 0, -310, head.length > 12 ? 50 : 72, '#fff', 900, 'center', null); text(sub, 0, -150, 44, INK, 900, 'center', null); for (let i = 0; i < 7; i++) line(-260, -60 + i * 60, 260 - (i % 3) * 60, -60 + i * 60, 6, '#b8b2a6'); }); }
function skyline(y, s = 1) { const r = rnd(12); ctx.fillStyle = '#0c1220'; let x = -20; while (x < W + 20) { const w = (40 + r() * 90) * s, h = (60 + r() * 260) * s; ctx.fillRect(x, y - h, w, h + 400); for (let i = 0; i < 6; i++) { if (r() < 0.5) continue; ctx.fillStyle = 'rgba(255,200,120,0.55)'; ctx.fillRect(x + 8 + r() * (w - 20), y - h + 10 + r() * (h - 20), 6, 9); ctx.fillStyle = '#0c1220'; } x += w + 4 * s; } }
function earthDetect(t, tl, o = {}) { space(t, { density: 0.8 }); COS.planet(1180, 560, 330, 'earth', { light: COS.light(-160, 15), spin: 260 + t * 4, clouds: true });
  if (o.wave) { const u = clamp(tl / 2.6, 0, 1); for (let i = 0; i < 6; i++) { const xx = lerp(-300, 1500, u) - i * 90; ctx.save(); ctx.globalAlpha = 0.5 * (1 - i / 6); ctx.strokeStyle = ICE; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(xx, 560, 60, 520, 0, 0, TAU); ctx.stroke(); ctx.restore(); } } }

const take = (tl) => tag("SHAK'S TAKE", 260, 90, tl, 0.15, { size: 44, bg: VIO, col: '#fff' });
const LT = COS.light(-150, 20);
// ================================================================ HOOK (1-12)
shot(0, (tl, d, t) => { space(t, { density: 1.1, neb: 0.35, hues: ['#5a2a3a', '#2a2a5a'], nebSeed: 4 }); sGiant(960, 540, 300, t); vig(); }, { cam: [[960, 540, 1.0], [960, 540, 1.08]], noWhoosh: true, cues: [[0.2, 'rise']] });
shot(A(2), (tl, d, t) => { space(t, { density: 1.0 }); sGiant(1180, 540, 330, t); COS.star(360, 540, 30, { t }); }, { ui: (tl) => { tag('THE SUN', 360, 660, tl, 0.3, { size: 40, bg: '#fff' }); tag('10+ SUNS OF MASS', 1180, 960, tl, WT(2, 'ten'), { size: 52, bg: YEL }); }, cues: [[wordT(2, 'ten'), 'pop']] });
shot(A(3), (tl, d, t) => { space(t, { density: 1.0 }); galaxy(960, 560, 520, { seed: 5, rot: -0.3, tilt: 0.42, t, spin: 0.01, alpha: 0.85 }); blast(1180, 470, clamp((tl - 0.6) / 4, 0, 1) * 0.35, t, { R: 380 }); vig(0.4); }, { ui: (tl) => tag('EXPECTED: A SUPERNOVA', 960, 110, tl, WT(3, 'explode'), { size: 54, bg: '#fff' }), cues: [[wordT(3, 'explode'), 'dun']] });
shot(A(4), (tl, d, t) => { space(t, { density: 1.0 }); sGiant(960, 540, 300, t); vig(); }, { cam: [[960, 540, 1.0], [960, 540, 1.18]] });
shot(A(5), (tl, d, t) => { space(t, { density: 1.0 }); sGiant(960, 540, lerp(300, 260, ss(0, d, tl)), t); vig(); }, { ui: (tl) => stamp(960, 900, 1.0, 'NO BLAST', ROSE, -0.1, tl, 0.15), cues: [[A(5) + 0.15, 'stamp']] });
shot(A(6), (tl, d, t) => { space(t, { density: 1.0 }); sGiant(960, 540, lerp(260, 200, ss(0, d, tl)), t, { alpha: 0.9 }); vig(); }, { ui: (tl) => stamp(960, 900, 1.0, 'NO FLASH', ROSE, 0.08, tl, 0.15), cues: [[A(6) + 0.15, 'stamp']] });
shot(A(7), (tl, d, t) => { space(t, { density: 1.0 }); collapse(960, 540, 200, clamp(tl / Math.max(2.2, d), 0, 1), t); vig(0.6); }, { noWhoosh: true, cues: [[A(7) + 0.2, 'shh']] });
shot(A(8), (tl, d, t) => { space(t, { density: 1.2 }); galaxy(960, 560, 640, { seed: 21, rot: 0.55, tilt: 0.3, t, spin: 0.006 }); const k = pop(tl, 1.2); if (k > 0) { circle(1290, 470, 46 * Math.min(k, 1.1)); ctx.strokeStyle = MINT; ctx.lineWidth = 6; ctx.stroke(); } vig(0.4); }, { cam: [[960, 540, 1.0], [1100, 510, 1.15]], ui: (tl) => tag('THE ANDROMEDA GALAXY', 960, 110, tl, WT(8, 'andromeda'), { size: 56, bg: '#fff' }), cues: [[wordT(8, 'andromeda'), 'pop']] });
shot(A(9), (tl, d, t) => { deep(t, { drift: 20 }); merger(960, 540, clamp(tl / Math.max(2.5, d), 0, 1), t, { s: 0.9 }); vig(0.4); }, { ui: (tl) => tag('NEW STUDY · NOVEMBER 2026', 960, 110, tl, WT(9, 'study'), { size: 52, bg: YEL }), cues: [[wordT(9, 'study'), 'pop'], [A(9) + 0.3, 'whooshes']] });
shot(A(10), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(ss(0.1, 2.4, tl), { peak: ss(WT(10, 'ten'), WT(10, 'ten') + 0.5, tl) }); }, { ui: (tl) => bigText('≈ 10 SUNS', 760, 240, 110, YEL, tl, WT(10, 'ten')), cues: [[A(10) + 0.2, 'reel'], [wordT(10, 'ten'), 'dun']] });
shot(A(11), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { peak: 1, gap: ss(0.2, 0.7, tl) }); }, { ui: (tl) => bigText('14 SUNS? ALMOST NONE', 1180, 240, 80, ROSE, tl, WT(11, 'fourteen')), cues: [[wordT(11, 'fourteen'), 'stamp']] });
shot(A(12), (tl, d, t) => { space(t, { density: 1.0 }); const u = clamp((tl - 0.3) / 3.5, 0, 1); sGiant(560, 540, 220 * (1 - ss(0.3, 1, u)) + 4, t, { alpha: 1 - ss(0.6, 1, u) }); bh(1360, 540, 70, t); qmark(960, 520, 1.6, tl, WT(12, 'what'), YEL); vig(); }, { cues: [[wordT(12, 'what'), 'boing']] });

// ================================================================ THE NORMAL DEATH (13-25)
shot(A(13), (tl, d, t) => { space(t, { density: 1.0 }); sGiant(960, 540, 260, t, { alpha: 0.6 }); }, { ui: (tl) => titleCard('HOW BIG STARS DIE', tl, 0, 1.4, '#C8812B'), cues: [[A(13), 'sting']] });
shot(A(14), (tl, d, t) => { space(t, { density: 0.8 }); onion(960, 540, 380, { labels: true, tl }); vig(0.4); }, { cam: [[760, 540, 1.0], [860, 540, 0.95]], cues: [[A(14) + 0.3, 'pop'], [A(14) + 1.0, 'pop'], [A(14) + 1.7, 'pop']] });
shot(A(15), (tl, d, t) => { space(t, { density: 0.8 }); sGiant(960, 540, 300, t); balance(960, 540, 300, tl, { inA: ss(0, 0.4, tl) }); vig(0.4); }, { ui: (tl) => tag('GRAVITY ▶ IN', 960, 110, tl, 0.2, { size: 56, bg: ICE }), cues: [[A(15) + 0.2, 'thud']] });
shot(A(16), (tl, d, t) => { space(t, { density: 0.8 }); sGiant(960, 540, 300, t); balance(960, 540, 300, tl, { inA: 1, outA: ss(0, 0.4, tl) }); vig(0.4); }, { ui: (tl) => tag('FUSION HEAT ▶ OUT', 960, 110, tl, 0.2, { size: 56, bg: YEL }), cues: [[A(16) + 0.2, 'pop']] });
shot(A(17), (tl, d, t) => { space(t, { density: 0.9 }); COS.star(330, 560, 40, { t }); sGiant(1150, 540, 300, t); }, { ui: (tl) => { tag('THE SUN', 330, 680, tl, 0.3, { size: 40, bg: '#fff' }); tag('≈ 8 SUNS OR MORE', 1150, 960, tl, WT(17, 'eight'), { size: 54, bg: YEL }); }, cues: [[wordT(17, 'eight'), 'pop']] });
shot(A(18), (tl, d, t) => { space(t, { density: 0.7 }); onion(960, 540, 380, { core: 1 }); const k = ss(0.3, 1.2, tl); COS.glow(960, 540, 60, '#ffffff', 0.0); }, { cam: [[960, 540, 1.0], [960, 540, 1.6]], ui: (tl) => tag('THE IRON CORE: OUT OF FUEL', 960, 110, tl, WT(18, 'fuel'), { size: 52, bg: '#fff' }), cues: [[wordT(18, 'fuel'), 'pop']] });
shot(A(19), (tl, d, t) => { space(t, { density: 0.7 }); onion(960, 540, 380, { core: lerp(1, 0.25, ss(0.2, 0.6, tl)) }); infall(960, 540, 120, tl, ss(0.1, 0.3, tl)); }, { cam: [[960, 540, 1.6], [960, 540, 1.9]], ui: (tl) => tag('A FRACTION OF A SECOND', 960, 980, tl, 0.6, { size: 52, bg: YEL }), cues: [[A(19) + 0.2, 'thud']] });
shot(A(20), (tl, d, t) => { space(t, { density: 0.9 }); sGiant(960, 540, 260, t, { alpha: 1 - ss(0.5, 1.2, tl) }); blast(960, 540, clamp((tl - 0.5) / 4, 0, 1), t, { R: 700 }); vig(0.4); }, { ui: (tl) => bigText('SUPERNOVA', 960, 150, 120, AMBER, tl, WT(20, 'supernova')), cues: [[wordT(20, 'supernova') - 0.1, 'crash']] });
shot(A(21), (tl, d, t) => { space(t, { density: 0.8 }); onion(960, 540, 380, { core: 0.25, alpha: 1 - ss(0.3, 1.6, tl) }); shockRing(960, 540, lerp(50, 760, ss(0, 1.8, tl)), 1 - ss(1.4, 2.2, tl)); blast(960, 540, clamp((tl - 0.6) / 3.5, 0, 1) * 0.8, t, { R: 760 }); }, { cues: [[A(21) + 0.1, 'whoosh']] });
shot(A(22), (tl, d, t) => { space(t, { density: 1.0 }); galaxy(960, 560, 560, { seed: 5, rot: -0.3, tilt: 0.42, t, spin: 0.01 }); const u = clamp((tl - 0.3) / 2.5, 0, 1); COS.glow(1230, 450, 180 + 220 * u, '#ffd8a0', 0.75 * Math.sin(Math.min(1, u * 1.5) * Math.PI * 0.5)); COS.glow(1230, 450, 40, '#fff4e0', 0.85 * Math.min(1, u * 3)); vig(0.4); }, { ui: (tl) => tag('ONE STAR ▶ AS BRIGHT AS A GALAXY', 960, 110, tl, WT(22, 'outshine'), { size: 48, bg: YEL }), cues: [[wordT(22, 'outshine'), 'sparkle']] });
shot(A(23), (tl, d, t) => { space(t, { density: 0.8 }); blast(700, 540, 0.85, t, { R: 420 }); COS.planet(700, 540, 26, { kind: 'gas', base: '#dfe8ff', atmo: '#bcd4ff', atmoThick: 0.04, halo: 0.7, soft: 0.42, spec: 0.7, tilt: 0.1, pal: ['#e6eeff', '#d2deff', '#eef3ff', '#c8d6fa'], bandSeed: 5, spots: [], glow: '#9fc4ff' }, { light: LT, ink: null }); bh(1300, 540, 60, t); }, { ui: (tl) => { tag('NEUTRON STAR', 700, 900, tl, WT(23, 'neutron'), { size: 46, bg: ICE }); tag('BLACK HOLE', 1300, 900, tl, WT(23, 'black'), { size: 46, bg: '#fff' }); }, cues: [[wordT(23, 'neutron'), 'pop'], [wordT(23, 'black'), 'pop']] });
shot(A(24), (tl, d, t) => { bgPlain('#16203a', '#060a14'); paper(960, 540, 0.9, 'TEXTBOOK', 'HOW STARS DIE', '#3a5fc8', tl); }, { cues: [[A(24) + 0.2, 'page']] });
shot(A(25), (tl, d, t) => { space(t, { density: 0.9 }); const r = rnd(25); for (let i = 0; i < 6; i++) { const x = 260 + i * 280, y = 320 + (i % 2) * 380; blast(x, y, clamp((tl - i * 0.25) / 2.5, 0, 1) * 0.7, t, { R: 220 }); } vig(0.4); }, { ui: (tl) => bigText('ALWAYS A BANG?', 960, 540, 110, '#fff', tl, WT(25, 'bang')), cues: [[A(25) + 0.1, 'crash'], [wordT(25, 'bang'), 'dun']] });
shot(A(26), (tl, d, t) => { space(t, { density: 0.9 }); sGiant(960, 540, 260, t); vig(); }, { cam: [[960, 540, 1.0], [960, 540, 1.1]], ui: (tl) => take(tl), cues: [[A(26) + 0.15, 'ding']] });
shot(A(27), (tl, d, t) => { space(t, { density: 0.9 }); collapse(960, 540, 260, clamp((tl - 0.4) / Math.max(2.4, d - 0.4), 0, 1), t); vig(0.6); }, { ui: (tl) => take(tl), cues: [[A(27) + 0.3, 'shh']] });
shot(A(28), (tl, d, t) => { space(t, { density: 1.6 }); const r = rnd(28); for (let i = 0; i < 40; i++) { const x = 100 + r() * 1720, y = 80 + r() * 900; COS.glow(x, y, 10 + r() * 16, r() < 0.5 ? '#ffd8b0' : '#cfe0ff', 0.7); } const k = ss(1.0, 3.0, tl); COS.glow(1310, 400, 30, '#ffb07a', 0.8 * (1 - k)); circle(1310, 400, 60); ctx.strokeStyle = `rgba(124,242,176,${0.9 * k})`; ctx.lineWidth = 5; ctx.stroke(); vig(0.4); }, { ui: (tl) => { take(tl); tag('EASY TO MISS', 960, 980, tl, WT(28, 'miss'), { size: 52, bg: '#fff' }); }, cues: [[wordT(28, 'miss'), 'pop']] });

// ================================================================ THE STAR THAT VANISHED (29-50)
shot(A(29), (tl, d, t) => { space(t, { density: 1.2 }); galaxy(1180, 560, 520, { seed: 21, rot: 0.55, tilt: 0.3, t, spin: 0.006 }); galaxy(260, 860, 120, { seed: 5, rot: -0.3, tilt: 0.5, alpha: 0.8 }); vig(0.4); }, { ui: (tl) => { titleCard('THE STAR THAT VANISHED', tl, 0, 1.4, '#7a2a5a'); tag('OUR MILKY WAY', 260, 1010, tl, 1.4, { size: 36, bg: '#fff' }); tag('≈ 2.5 MILLION LIGHT-YEARS', 1180, 110, tl, WT(29, 'million'), { size: 50, bg: YEL }); }, cues: [[A(29), 'sting'], [wordT(29, 'million'), 'pop']] });
shot(A(30), (tl, d, t) => { space(t, { density: 1.4, neb: 0.25, hues: ['#3a2a5a', '#2a3a6a'] }); sGiant(960, 540, 230, t); vig(); }, { cam: [[960, 540, 0.7], [960, 540, 1.0]], ui: (tl) => tag('M31-2014-DS1', 960, 940, tl, WT(30, 'thirty'), { size: 60, bg: '#fff' }), cues: [[A(30) + 0.2, 'whooshes'], [wordT(30, 'thirty'), 'pop']] });
shot(A(31), (tl, d, t) => { bgPlain('#121a32', '#04070f'); lightCurve(360, 860, 1200, 560, ss(0.2, 2.6, tl) * (11 / 18), { ir: 1 }); }, { ui: (tl) => tag('2014: BRIGHTER IN INFRARED', 960, 110, tl, WT(31, 'infrared'), { size: 52, bg: IR, col: '#fff' }), cues: [[A(31) + 0.2, 'slide'], [wordT(31, 'infrared'), 'pop']] });
shot(A(32), (tl, d, t) => { bgPlain('#121a32', '#04070f'); lightCurve(360, 860, 1200, 560, lerp(11 / 18, 13.5 / 18, ss(0.2, 2.0, tl)), { ir: 1 }); }, { ui: (tl) => tag('2016: FADING', 960, 110, tl, WT(32, 'faded'), { size: 54, bg: '#fff' }), cues: [[wordT(32, 'faded'), 'pop']] });
shot(A(33), (tl, d, t) => { bgPlain('#121a32', '#04070f'); lightCurve(360, 860, 1200, 560, lerp(13.5 / 18, 15 / 18, ss(0, 0.8, tl)), { ir: 1 }); }, { cam: [[960, 600, 1.0], [1150, 700, 1.25]], cues: [[A(33), 'thud']] });
shot(A(34), (tl, d, t) => { bgPlain('#121a32', '#04070f'); frame(560, 480, 640, 560, 'BEFORE', 1, { seed: 3 }); frame(1360, 480, 640, 560, '2023', 1 - ss(0.4, 1.6, tl) * 0.99, { seed: 3 }); }, { ui: (tl) => tag('≈ 10,000× FAINTER', 960, 960, tl, WT(34, 'thousand'), { size: 60, bg: YEL }), cues: [[wordT(34, 'thousand'), 'dun']] });
shot(A(35), (tl, d, t) => { bgPlain('#121a32', '#04070f'); frame(960, 500, 900, 700, '', 0.01, { seed: 3 }); qmark(960, 500, 1.0, tl, 0.8, YEL); }, { cam: [[960, 500, 1.0], [960, 500, 1.15]], cues: [[A(35) + 0.8, 'boing']] });
shot(A(36), (tl, d, t) => { space(t, { density: 0.8 }); galaxy(960, 560, 600, { seed: 21, rot: 0.55, tilt: 0.3, t, spin: 0.006, alpha: 0.5 }); vig(0.4); }, { ui: (tl) => tag('KISHALAY DE · LEAD RESEARCHER', 960, 110, tl, WT(36, 'kishalay'), { size: 48, bg: '#fff' }), cues: [[wordT(36, 'kishalay'), 'pop']] });
shot(A(37), (tl, d, t) => { bgPlain('#16203a', '#060a14'); quoteCard('"This star used to be one of the most\nluminous stars in the Andromeda Galaxy,\nand now it was nowhere to be seen."', 'Kishalay De', 960, 520, tl, 0.2, { size: 50 }); }, { cues: [[A(37) + 0.2, 'paper']] });
shot(A(38), (tl, d, t) => { bgPlain('#16203a', '#060a14'); paper(960, 540, 0.9, 'SCIENCE', 'FEBRUARY 2026', '#8a1c2a', tl); }, { cues: [[A(38) + 0.2, 'page']] });
shot(A(39), (tl, d, t) => { space(t, { density: 1.0 }); dustGlow(960, 540, 300, t, ss(0, 1.2, tl)); vig(); }, { cam: [[960, 540, 1.0], [960, 540, 1.1]], cues: [[A(39) + 0.2, 'shh']] });
shot(A(40), (tl, d, t) => { space(t, { density: 1.0 }); collapse(960, 540, 300, clamp(tl / Math.max(2.5, d), 0, 1), t); vig(0.5); }, { ui: (tl) => tag('CORE ▶ BLACK HOLE', 960, 110, tl, WT(40, 'black'), { size: 54, bg: '#fff' }), cues: [[wordT(40, 'black'), 'thud']] });
shot(A(41), (tl, d, t) => { space(t, { density: 1.0 }); bareBH(960, 540, 22); dustGlow(960, 540, lerp(120, 360, ss(0, d, tl)), t, ss(0, 1.0, tl)); vig(); }, { ui: (tl) => tag('WARM DUST ▶ INFRARED GLOW', 960, 110, tl, WT(41, 'dust'), { size: 52, bg: IR, col: '#fff' }), cues: [[wordT(41, 'dust'), 'sparkle']] });
shot(A(42), (tl, d, t) => { space(t, { density: 1.0 }); qmark(960, 520, 2.2, tl, 0.2, YEL); vig(); }, { ui: (tl) => tag('NOT THE FIRST SUSPECT', 960, 940, tl, 0.3, { size: 54, bg: '#fff' }), cues: [[A(42) + 0.2, 'boing']] });
shot(A(43), (tl, d, t) => { space(t, { density: 1.1 }); galaxy(960, 560, 560, { seed: 46, rot: 1.1, tilt: 0.85, arms: 3, t, spin: 0.01 }); const u = clamp((tl - WT(43, 'flared')) / 3, 0, 1); COS.glow(1200, 420, 30 + 90 * Math.sin(Math.min(1, u * 2) * Math.PI * 0.5) * (1 - ss(0.5, 1, u)), '#ffc890', 0.85); vig(0.4); }, { ui: (tl) => { tag('NGC 6946 · 2009', 960, 110, tl, WT(43, 'galaxy'), { size: 52, bg: '#fff' }); tag('≈ 25 SUNS', 1200, 300, tl, WT(43, 'twenty'), { size: 40, bg: YEL }); }, cues: [[wordT(43, 'galaxy'), 'pop'], [wordT(43, 'flared'), 'sparkle']] });
shot(A(44), (tl, d, t) => { bgPlain('#121a32', '#04070f'); frame(560, 480, 640, 560, '2009', 1, { seed: 9 }); frame(1360, 480, 640, 560, '2015 · HUBBLE', 0, { seed: 9 }); stamp(1360, 480, 0.9, 'GONE', ROSE, -0.12, tl, WT(44, 'longer')); }, { cues: [[wordT(44, 'longer'), 'stamp']] });
shot(A(45), (tl, d, t) => { bgPlain('#121a32', '#04070f'); frame(960, 480, 900, 640, 'JAMES WEBB · INFRARED', 0, { seed: 9, ir: ss(0.3, 1.5, tl) }); }, { cues: [[A(45) + 0.3, 'sparkle']] });
shot(A(46), (tl, d, t) => { space(t, { density: 0.9 }); const u = ss(0, Math.max(2.5, d), tl), a = t * 2 + u * 6, s = lerp(260, 30, u); COS.star(960 + Math.cos(a) * s, 540 + Math.sin(a) * s * 0.5, 70, { t, core: '#fff0d8', mid: '#ffb070', out: '#e06030' }); COS.star(960 - Math.cos(a) * s, 540 - Math.sin(a) * s * 0.5, 55, { t, core: '#f0f4ff', mid: '#a8c4ff', out: '#6a8ae0', seed: 9 }); vig(); }, { ui: (tl) => tag('OR: TWO STARS MERGED?', 960, 110, tl, WT(46, 'merged'), { size: 54, bg: '#fff' }), cues: [[wordT(46, 'merged'), 'boing']] });
shot(A(47), (tl, d, t) => { bgPlain('#121a32', '#04070f'); frame(960, 480, 900, 640, '', 0, { seed: 9, ir: 1 }); }, { ui: (tl) => stamp(960, 900, 1.0, 'CASE STILL OPEN', YEL, -0.06, tl, 0.3), cues: [[A(47) + 0.3, 'stamp']] });
shot(A(48), (tl, d, t) => { space(t, { density: 0.9 }); dustGlow(960, 540, 200, t, 0.8); vig(); }, { ui: (tl) => tag('ONE STAR = ONE STORY', 960, 940, tl, 0.3, { size: 54, bg: '#fff' }), cues: [[A(48) + 0.3, 'pop']] });
shot(A(49), (tl, d, t) => { space(t, { density: 1.6 }); const r = rnd(49); for (let i = 0; i < 60; i++) { const k = pop(tl, 0.2 + i * 0.03); if (k <= 0) continue; const x = 140 + (i % 12) * 150, y = 200 + Math.floor(i / 12) * 160; COS.glow(x, y, 24 * Math.min(k, 1), r() < 0.5 ? '#ffc890' : '#cfe0ff', 0.75); } vig(0.4); }, { ui: (tl) => tag('NEEDED: A POPULATION', 960, 1010, tl, WT(49, 'population'), { size: 52, bg: YEL }), cues: [[A(49) + 0.2, 'reel']] });
shot(A(50), (tl, d, t) => { deep(t, { drift: 30 }); ripples(960, 540, t, { alpha: ss(0.2, 1.5, tl) }); vig(0.4); }, { cues: [[A(50) + 0.2, 'whoosh']] });

// ================================================================ LISTENING (51-63)
shot(A(51), (tl, d, t) => { earthDetect(t, tl, { wave: true }); vig(0.4); }, { ui: (tl) => { titleCard('LISTENING TO BLACK HOLES', tl, 0, 1.4, '#2F6FD6'); tag('14 SEPTEMBER 2015', 600, 110, tl, 1.4, { size: 52, bg: '#fff' }); }, cues: [[A(51), 'sting'], [A(51) + 1.5, 'pop']] });
shot(A(52), (tl, d, t) => { deep(t, { drift: 10 }); merger(960, 540, clamp(tl / Math.max(3, d), 0, 0.99), t); vig(0.4); }, { ui: (tl) => { tag('≈ 29 SUNS', 560, 180, tl, WT(52, 'twenty'), { size: 46, bg: '#fff' }); tag('≈ 36 SUNS', 1360, 180, tl, WT(52, 'thirty'), { size: 46, bg: '#fff' }); }, cues: [[wordT(52, 'twenty'), 'pop'], [wordT(52, 'thirty'), 'pop'], [wordT(52, 'merged'), 'thud']] });
shot(A(53), (tl, d, t) => { space(t, { density: 1.0 }); ripples(1300, 540, t, { R: 1400, alpha: 0.7 }); bareBH(1300, 540, 60); COS.planet(260, 540, 90, 'earth', { light: COS.light(0, 10), spin: t * 4, clouds: true }); }, { ui: (tl) => tag('≈ 1.3 BILLION LIGHT-YEARS', 960, 110, tl, WT(53, 'billion'), { size: 54, bg: YEL }), cues: [[wordT(53, 'billion'), 'pop']] });
shot(A(54), (tl, d, t) => { deep(t, { drift: 10 }); merger(960, 540, lerp(0.8, 1, ss(0, 1.2, tl)), t); vig(0.4); }, { ui: (tl) => tag('≈ 3 SUNS OF MASS ▶ GRAVITATIONAL WAVES', 960, 110, tl, WT(54, 'three'), { size: 46, bg: ICE }), cues: [[wordT(54, 'three'), 'dun']] });
shot(A(55), (tl, d, t) => { ligo(560, 860, 0.85, t, { strain: ss(0.2, 0.8, tl), beam: 1 }); }, { ui: (tl) => tag('STRETCH · SQUEEZE (EXAGGERATED)', 1320, 110, tl, 0.3, { size: 42, bg: '#fff' }), cues: [[A(55) + 0.3, 'wave']] });
shot(A(56), (tl, d, t) => { ligo(560, 860, 0.85, t, { beam: ss(0.2, 0.8, tl), label: true }); }, { cam: [[960, 540, 1.1], [960, 540, 1.0]], cues: [[wordT(56, 'four'), 'pop']] });
shot(A(57), (tl, d, t) => { bgPlain('#121a32', '#04070f'); const k = ss(0.3, 2.4, tl); const R = lerp(320, 0.5, k); COS.glow(960, 520, 360, '#ff9a6c', 0.25); circle(960, 520, 320); shape('rgba(255,140,100,0.35)', '#ffb08a', 5); text('A PROTON', 960, 900, 44, '#fff', 900, 'center', INK, 8); line(960 - 320, 520, 960 - 320 + 640 * 0.0001 + 2, 520, 6, YEL); }, { ui: (tl) => tag('CHANGE < 1/10,000 OF ITS WIDTH', 960, 110, tl, WT(57, 'ten'), { size: 50, bg: YEL }), cues: [[wordT(57, 'ten'), 'dun']] });
shot(A(58), (tl, d, t) => { bgPlain('#121a32', '#04070f'); const n = Math.floor(ss(0.2, 2.6, tl) * 300); for (let i = 0; i < n; i++) { const x = 190 + (i % 25) * 63, y = 220 + Math.floor(i / 25) * 52; circle(x, y, 13); shape('#000', 'rgba(159,196,255,0.9)', 3); } }, { ui: (tl) => { tag('LIGO · VIRGO · KAGRA', 960, 110, tl, WT(58, 'ligo'), { size: 52, bg: '#fff' }); bigText('300+', 1640, 960, 110, YEL, tl, WT(58, 'three')); }, cues: [[A(58) + 0.2, 'reel'], [wordT(58, 'three'), 'dun']] });
shot(A(59), (tl, d, t) => { deep(t, { drift: 10 }); merger(960, 540, 0.5, t, { s: 0.9 }); vig(0.4); }, { ui: (tl) => tag('EVERY COLLISION HAS A LABEL', 960, 110, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(59) + 0.3, 'pop']] });
shot(A(60), (tl, d, t) => { deep(t, { drift: 10 }); merger(960, 560, 0.35, t, { s: 0.9 }); }, { ui: (tl) => { tag('MASS', 640, 940, tl, WT(60, 'heavy'), { size: 60, bg: YEL }); tag('SPIN', 1280, 940, tl, WT(60, 'spinning'), { size: 60, bg: MINT }); }, cues: [[wordT(60, 'heavy'), 'pop'], [wordT(60, 'spinning'), 'pop']] });
shot(A(61), (tl, d, t) => { bgPlain('#121a32', '#04070f'); const n = Math.floor(ss(0.1, 2.0, tl) * 250); const r = rnd(61); for (let i = 0; i < 250; i++) { const x = 160 + r() * 1600, y = 180 + r() * 720; if (i < n) { circle(x, y, 9); shape('#000', 'rgba(159,196,255,0.9)', 2.5); } } }, { ui: (tl) => tag('A BLACK HOLE CENSUS', 960, 110, tl, WT(61, 'census'), { size: 56, bg: YEL }), cues: [[wordT(61, 'census'), 'pop']] });
shot(A(62), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(ss(0.1, Math.max(1.5, d), tl), {}); }, { cues: [[A(62) + 0.2, 'reel']] });
shot(A(63), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(0.55, {}); qmark(1500, 420, 1.4, tl, 0.2, YEL); }, { cues: [[A(63) + 0.2, 'boing']] });

// ================================================================ THE PEAK AND THE GAP (64-84)
shot(A(64), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { simpl: false }); }, { ui: (tl) => titleCard('THE PEAK AND THE GAP', tl, 0, 1.4, '#2a8a5a'), cues: [[A(64), 'sting']] });
shot(A(65), (tl, d, t) => { bgPlain('#16203a', '#060a14'); const r = rnd(65); for (let i = 0; i < 250; i++) { const k = pop(tl, 0.2 + i * 0.008); if (k <= 0) continue; const x = 180 + (i % 25) * 64, y = 300 + Math.floor(i / 25) * 52; circle(x, y, 12 * Math.min(1, k)); shape('#000', 'rgba(159,196,255,0.9)', 3); } }, { ui: (tl) => { tag('ISAAC LEGRED · KATERINA CHATZIIOANNOU', 960, 110, tl, WT(65, 'isaac'), { size: 42, bg: '#fff' }); tag('≈ 250 MERGING PAIRS', 960, 960, tl, WT(65, 'hundred'), { size: 54, bg: YEL }); }, cues: [[wordT(65, 'isaac'), 'pop'], [A(65) + 0.3, 'reel'], [wordT(65, 'hundred'), 'pop']] });
shot(A(66), (tl, d, t) => { bgPlain('#16203a', '#060a14'); paper(960, 540, 0.9, 'PHYSICAL REVIEW D', '10 NOVEMBER 2026', '#2a4a8a', tl); }, { cues: [[A(66) + 0.2, 'page']] });
shot(A(67), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(ss(0.1, Math.max(2, d), tl), {}); }, { cues: [[A(67) + 0.2, 'reel']] });
shot(A(68), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { peak: ss(0.3, 1.0, tl) }); }, { cam: [[960, 540, 1.0], [760, 700, 1.25]], cues: [[A(68) + 0.3, 'rise']] });
shot(A(69), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { peak: 1 }); }, { cam: [[760, 700, 1.25], [760, 680, 1.3]], ui: (tl) => bigText('≈ 10 SUNS', 1300, 300, 130, YEL, tl, WT(69, 'ten')), cues: [[wordT(69, 'ten'), 'dun']] });
shot(A(70), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { peak: 1, dimRest: true }); }, { ui: (tl) => tag('≈ 3 IN 4 PAIRS', 1300, 300, tl, WT(70, 'three'), { size: 64, bg: YEL }), cues: [[wordT(70, 'three'), 'pop']] });
shot(A(71), (tl, d, t) => { bgPlain('#16203a', '#060a14'); quoteCard('"A vast majority of the merging black holes\nin the universe are about 10 times\nthe mass of our Sun."', 'Katerina Chatziioannou, Caltech', 960, 520, tl, 0.2, { size: 50 }); }, { cues: [[A(71) + 0.2, 'paper']] });
shot(A(72), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { peak: 0.4 }); }, { cam: [[960, 540, 1.0], [760, 640, 1.3]], cues: [[A(72) + 0.2, 'hmm']] });
shot(A(73), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { peak: 0.4, gap: ss(WT(73, 'twelve'), WT(73, 'twelve') + 0.6, tl) }); }, { cam: [[760, 640, 1.3], [760, 620, 1.35]], ui: (tl) => tag('12–16 SUNS: ALMOST NONE', 960, 110, tl, WT(73, 'twelve'), { size: 54, bg: ROSE, col: '#fff' }), cues: [[wordT(73, 'twelve'), 'stamp']] });
shot(A(74), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 1 }); }, { ui: (tl) => bigText('THE GAP', 1050, 300, 110, ROSE, tl, 0.3), cues: [[A(74) + 0.3, 'dun']] });
shot(A(75), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 1 }); }, { cam: [[760, 600, 1.2], [960, 660, 1.25]], ui: (tl) => tag('16+: BACK AGAIN, MORE VARIED', 1200, 110, tl, WT(75, 'sixteen'), { size: 48, bg: VIO, col: '#fff' }), cues: [[wordT(75, 'sixteen'), 'pop']] });
shot(A(76), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 0.6, fam: ss(0.2, 0.9, tl) }); }, { ui: (tl) => bigText('TWO FAMILIES?', 1250, 260, 100, '#fff', tl, WT(76, 'two')), cues: [[wordT(76, 'two'), 'dun']] });
shot(A(77), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 0.6, fam: 1 }); }, { ui: (tl) => { tag('CROWDED · ≈ 10 SUNS', hx(10) + 60, 230, tl, WT(77, 'crowded'), { size: 42, bg: MINT }); tag('HEAVIER · MORE VARIED', hx(30), 560, tl, WT(77, 'heavier'), { size: 42, bg: VIO, col: '#fff' }); }, cues: [[wordT(77, 'crowded'), 'pop'], [wordT(77, 'heavier'), 'pop']] });
shot(A(78), (tl, d, t) => { deep(t, { drift: 10 }); const a = t * 3; [[700, 480], [1220, 600]].forEach(([x, y], i) => { bareBH(x, y, 70 - i * 10); ctx.save(); ctx.strokeStyle = MINT; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(x, y, 120, 40, 0, a + i, a + i + 4); ctx.stroke(); ctx.restore(); }); vig(0.4); }, { ui: (tl) => tag('CLUE #2: SPIN', 960, 110, tl, 0.3, { size: 56, bg: MINT }), cues: [[A(78) + 0.3, 'pop']] });
shot(A(79), (tl, d, t) => { bgPlain('#121a32', '#04070f'); spinCurves(0, { wide: ss(0.2, 1.0, tl), narrow: ss(WT(79, 'narrower'), WT(79, 'narrower') + 0.8, tl) }); }, { cues: [[A(79) + 0.2, 'slide'], [wordT(79, 'narrower'), 'pop']] });
shot(A(80), (tl, d, t) => { bgPlain('#121a32', '#04070f'); spinCurves(0, { wide: 0.5, narrow: 1 }); }, { ui: (tl) => tag('SAME WEIGHT + SAME SPIN ▶ SAME ORIGIN?', 960, 110, tl, WT(80, 'same'), { size: 46, bg: YEL }), cues: [[wordT(80, 'same'), 'ding']] });
shot(A(81), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 1 }); ctx.fillStyle = 'rgba(4,7,15,0.55)'; ctx.fillRect(0, 0, W, H); }, { ui: (tl) => take(tl), cues: [[A(81) + 0.15, 'ding']] });
shot(A(82), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { peak: 1 - ss(WT(82, 'gap'), WT(82, 'gap') + 0.5, tl), gap: ss(WT(82, 'gap'), WT(82, 'gap') + 0.5, tl) }); }, { cam: [[760, 640, 1.2], [760, 640, 1.35]], ui: (tl) => take(tl), cues: [[wordT(82, 'gap'), 'dun']] });
shot(A(83), (tl, d, t) => { bgPlain('#121a32', '#04070f'); line(hx(4), HY, hx(47), HY, 5, '#cfd8ea'); ctx.save(); ctx.beginPath(); for (let m = 4; m <= 47; m += 0.25) { const yy = HY - 380 * Math.exp(-Math.pow((m - 9) / 6, 2)) - 40 * Math.exp(-(m - 4) / 20); m === 4 ? ctx.moveTo(hx(m), yy) : ctx.lineTo(hx(m), yy); } ctx.strokeStyle = 'rgba(159,196,255,0.9)'; ctx.lineWidth = 8; ctx.stroke(); ctx.restore(); }, { ui: (tl) => { take(tl); tag('SMOOTH = NO GAP', 960, 160, tl, WT(83, 'smooth'), { size: 54, bg: '#fff' }); }, cues: [[wordT(83, 'smooth'), 'pop']] });
shot(A(84), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 1 }); }, { cam: [[760, 640, 1.25], [760, 640, 1.35]], ui: (tl) => { take(tl); bigText('SOMETHING IS CHOOSING', 1060, 95, 80, ROSE, tl, WT(84, 'choosing')); }, cues: [[wordT(84, 'choosing'), 'dun']] });

// ================================================================ INSIDE A FAILED SUPERNOVA (85-105)
shot(A(85), (tl, d, t) => { space(t, { density: 0.8 }); onion(960, 540, 360, {}); vig(0.4); }, { ui: (tl) => titleCard('INSIDE A FAILED SUPERNOVA', tl, 0, 1.4, '#8a2a2a'), cues: [[A(85), 'sting']] });
shot(A(86), (tl, d, t) => { space(t, { density: 0.8 }); onion(960, 540, 360, { core: 1.5 }); const k = ss(WT(86, 'compact'), WT(86, 'compact') + 0.6, tl); if (k > 0) { circle(960, 540, 360 * 0.18 + 20); ctx.strokeStyle = `rgba(255,210,74,${k})`; ctx.lineWidth = 7; ctx.stroke(); } vig(0.4); }, { ui: (tl) => { tag('≈ 12–14 SUNS', 960, 110, tl, WT(86, 'twelve'), { size: 56, bg: YEL }); tag('UNUSUALLY COMPACT CORE', 960, 980, tl, WT(86, 'compact'), { size: 50, bg: '#fff' }); }, cues: [[wordT(86, 'twelve'), 'pop'], [wordT(86, 'compact'), 'ding']] });
shot(A(87), (tl, d, t) => { space(t, { density: 0.8 }); onion(960, 540, 360, { core: lerp(1.5, 0.4, ss(0.2, 1.0, tl)) }); vig(0.4); }, { cam: [[960, 540, 1.0], [960, 540, 1.3]], ui: (tl) => tag('FAIL TO EXPLODE?', 960, 980, tl, WT(87, 'fail'), { size: 56, bg: ROSE, col: '#fff' }), cues: [[wordT(87, 'fail'), 'boing']] });
shot(A(88), (tl, d, t) => { space(t, { density: 0.8 }); onion(960, 540, 360, {}); vig(0.4); }, { cam: [[960, 540, 1.3], [960, 540, 2.0]], cues: [[A(88) + 0.2, 'whoosh']] });
shot(A(89), (tl, d, t) => { space(t, { density: 0.6 }); onion(960, 540, 1100, { core: lerp(1, 0.1, ss(0, 1.0, tl)) }); COS.glow(960, 540, 60, '#cfe0ff', 0.9 * ss(0.8, 1.4, tl)); infall(960, 540, 300, tl, 1 - ss(0.8, 1.4, tl)); }, { ui: (tl) => tag('NEUTRON STAR FORMS', 960, 980, tl, WT(89, 'neutron'), { size: 54, bg: ICE }), cues: [[A(89) + 0.1, 'thud'], [wordT(89, 'neutron'), 'pop']] });
shot(A(90), (tl, d, t) => { space(t, { density: 0.6 }); onion(960, 540, 1100, { core: 0.1 }); neutrinos(960, 540, 900, tl, 1); COS.glow(960, 540, 60, '#cfe0ff', 0.9); shockRing(960, 540, lerp(60, 380, ss(0.5, 2.5, tl))); }, { ui: (tl) => { tag('NEUTRINOS', 600, 160, tl, WT(90, 'neutrinos'), { size: 50, bg: ICE }); tag('SHOCK WAVE', 1300, 980, tl, WT(90, 'shock'), { size: 50, bg: '#fff' }); }, cues: [[wordT(90, 'neutrinos'), 'sparkle'], [wordT(90, 'shock'), 'whoosh']] });
shot(A(91), (tl, d, t) => { space(t, { density: 0.6 }); onion(960, 540, 1100, { core: 0.1 }); neutrinos(960, 540, 900, tl, 0.5); COS.glow(960, 540, 60, '#cfe0ff', 0.9); const r = 380 + 30 * (1 - Math.exp(-tl * 1.5)) - 60 * ss(1.2, 2.5, tl); shockRing(960, 540, r, 1 - 0.5 * ss(1.0, 2.5, tl), '#ffd0b0'); }, { ui: (tl) => stamp(960, 980, 1.0, 'STALLED', ROSE, -0.08, tl, WT(91, 'stalls')), cues: [[wordT(91, 'stalls'), 'stamp']] });
shot(A(92), (tl, d, t) => { space(t, { density: 0.6 }); onion(960, 540, 700, { core: 0.15 }); COS.glow(960, 540, 50, '#cfe0ff', 0.9); }, { cam: [[960, 540, 1.3], [960, 540, 1.0]], ui: (tl) => tag('NOTHING PUSHES OUT', 960, 110, tl, 0.3, { size: 54, bg: '#fff' }), cues: [[A(92) + 0.3, 'hmm']] });
shot(A(93), (tl, d, t) => { space(t, { density: 0.8 }); const u = ss(0, Math.max(2.4, d), tl); onion(960, 540, lerp(420, 120, u), { core: 0.4 }); infall(960, 540, lerp(520, 200, u), tl, 1); }, { ui: (tl) => tag('IT FALLS BACK IN', 960, 980, tl, 0.4, { size: 56, bg: ROSE, col: '#fff' }), cues: [[A(93) + 0.2, 'rope']] });
shot(A(94), (tl, d, t) => { space(t, { density: 1.0 }); const u = ss(0, 1.6, tl); COS.glow(960, 540, 80 * (1 - u), '#cfe0ff', 0.9 * (1 - u)); if (u > 0.4) bareBH(960, 540, 70 * ss(0.4, 1, u)); vig(); }, { cam: [[960, 540, 1.4], [960, 540, 1.2]], ui: (tl) => bigText('BLACK HOLE', 960, 180, 110, '#fff', tl, WT(94, 'black')), cues: [[wordT(94, 'black'), 'dun']] });
shot(A(95), (tl, d, t) => { space(t, { density: 1.0 }); galaxy(960, 560, 560, { seed: 5, rot: -0.3, tilt: 0.42, t, spin: 0.01 }); vig(0.4); }, { ui: (tl) => stamp(960, 900, 1.0, 'NO SUPERNOVA', ROSE, -0.08, tl, 0.4), cues: [[A(95) + 0.4, 'stamp']] });
shot(A(96), (tl, d, t) => { space(t, { density: 1.0 }); bareBH(960, 540, 40); dustGlow(960, 540, lerp(160, 420, ss(0, d, tl)), t, ss(0, 1.2, tl)); vig(); }, { ui: (tl) => tag('A FAINT INFRARED GLOW', 960, 110, tl, WT(96, 'glows'), { size: 52, bg: IR, col: '#fff' }), cues: [[wordT(96, 'glows'), 'sparkle']] });
shot(A(97), (tl, d, t) => { space(t, { density: 1.0 }); const a = 1 - ss(0.3, 2.0, tl); dustGlow(960, 540, 420, t, 0.6 * a); bareBH(960, 540, 40 * a + 0.5); vig(); }, { noWhoosh: true, cues: [[A(97) + 0.2, 'shh']] });
shot(A(98), (tl, d, t) => { space(t, { density: 0.8 }); collapse(620, 540, 260, clamp(tl / Math.max(2.5, d), 0, 1), t); const k = ss(1.5, 2.5, tl); if (k > 0) { ctx.save(); ctx.globalAlpha = k; COS.arrow(ctx, 860, 540, 1160, 540, { col: '#fff', lw: 10 }); ctx.restore(); bareBH(1400, 540, 60 * k + 1); } vig(0.4); }, { ui: (tl) => tag('MOST OF THE STAR ▶ THE BLACK HOLE', 960, 110, tl, 0.4, { size: 48, bg: '#fff' }), cues: [[A(98) + 1.5, 'whoosh']] });
shot(A(99), (tl, d, t) => { space(t, { density: 0.8 }); for (let i = 0; i < 5; i++) { const x = 260 + i * 350, u = clamp((tl - i * 0.35) / 2.4, 0, 1); collapse(x, 360, 110, u, t); const k = pop(tl, 2.4 + i * 0.12); if (k > 0) { circle(x, 780, 22 * Math.min(1, k)); shape('#000', 'rgba(124,242,176,0.9)', 4); } } }, { ui: (tl) => tag('SIMILAR STARS ▶ SIMILAR BLACK HOLES', 960, 980, tl, 2.6, { size: 46, bg: MINT }), cues: [[A(99) + 2.4, 'reel']] });
shot(A(100), (tl, d, t) => { space(t, { density: 0.8 }); bareBH(960, 540, 90); qmark(1250, 380, 0.9, tl, 0.3, YEL); vig(); }, { cam: [[960, 540, 0.8], [960, 540, 1.1]], cues: [[A(100) + 0.3, 'boing']] });
shot(A(101), (tl, d, t) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04060f'); g.addColorStop(1, '#16203a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); COS.starfield(101, { density: 0.8, twinkleT: t }); bareBH(960, 400, 230); skyline(1010, 1); const k = ss(0.5, 1.4, tl); ctx.save(); ctx.globalAlpha = k; line(960 - 230, 700, 960 + 230, 700, 6, YEL); line(960 - 230, 680, 960 - 230, 720, 6, YEL); line(960 + 230, 680, 960 + 230, 720, 6, YEL); ctx.restore(); }, { ui: (tl) => { tag('≈ 60 KM ACROSS', 960, 780, tl, WT(101, 'sixty'), { size: 56, bg: YEL }); text('NOT TO SCALE WITH THE CITY', 1840, 60, 24, 'rgba(207,216,234,0.7)', 900, 'right', null); }, cues: [[wordT(101, 'sixty'), 'dun']] });
shot(A(102), (tl, d, t) => { space(t, { density: 0.9 }); const u = ss(0.1, 2.2, tl); sGiant(960, 540, lerp(460, 6, easeIO(u)), t, { alpha: 1 - ss(0.75, 1, u) }); if (u > 0.8) bareBH(960, 540, 30 * ss(0.8, 1, u)); vig(); }, { cues: [[A(102) + 0.2, 'whoosh']] });
shot(A(103), (tl, d, t) => { space(t, { density: 0.9 }); bareBH(960, 540, 60); vig(); }, { ui: (tl) => take(tl), cues: [[A(103) + 0.15, 'ding']] });
shot(A(104), (tl, d, t) => { space(t, { density: 1.0 }); for (let i = 0; i < 7; i++) { const x = 220 + i * 245, y = 540 + (i % 2 ? 140 : -140); collapse(x, y, 90, clamp((tl - i * 0.3) / Math.max(3, d), 0, 1), t); } vig(0.4); }, { ui: (tl) => { take(tl); tag('QUIETEST DEATH · COMMON BLACK HOLES?', 960, 980, tl, WT(104, 'common'), { size: 44, bg: '#fff' }); }, cues: [[wordT(104, 'common'), 'pop']] });
shot(A(105), (tl, d, t) => { space(t, { density: 1.0 }); vig(0.7); }, { ui: (tl) => { take(tl); bigText('NO LIGHT', 960, 540, 140, '#fff', tl, WT(105, 'light')); }, cues: [[wordT(105, 'light'), 'dun']] });

// ================================================================ WHAT'S STILL UNKNOWN (106-118)
shot(A(106), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 0.6 }); }, { ui: (tl) => titleCard("WHAT WE DON'T KNOW YET", tl, 0, 1.4, '#555f7a'), cues: [[A(106), 'sting']] });
shot(A(107), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 0.6 }); }, { ui: (tl) => stamp(960, 300, 1.2, 'NOT PROOF', ROSE, -0.08, tl, WT(107, 'proof')), cues: [[wordT(107, 'proof'), 'stamp']] });
shot(A(108), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 0.6 }); }, { ui: (tl) => { tag('CONSISTENT WITH A GAP ✓', 960, 140, tl, WT(108, 'consistent'), { size: 50, bg: MINT }); tag('NOT YET REQUIRED', 960, 260, tl, WT(108, 'require'), { size: 50, bg: '#fff' }); }, cues: [[wordT(108, 'consistent'), 'pop'], [wordT(108, 'require'), 'pop']] });
shot(A(109), (tl, d, t) => { space(t, { density: 1.0 }); collapse(960, 540, 240, 0.55, t); qmark(1300, 380, 1.0, tl, 0.3, YEL); vig(); }, { ui: (tl) => tag('NOT CONFIRMED DIRECTLY', 960, 980, tl, WT(109, 'confirmed'), { size: 52, bg: '#fff' }), cues: [[wordT(109, 'confirmed'), 'pop']] });
shot(A(110), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 0.4 }); const k = ss(WT(110, 'sixteen'), WT(110, 'sixteen') + 0.5, tl); if (k > 0) { ctx.save(); ctx.globalAlpha = k; line(hx(16) + 2, HY - 560, hx(16) + 2, HY, 6, VIO); ctx.restore(); } }, { cam: [[960, 540, 1.0], [760, 640, 1.3]], ui: (tl) => { tag('WHY 16?', 1300, 200, tl, WT(110, 'sixteen'), { size: 60, bg: VIO, col: '#fff' }); }, cues: [[wordT(110, 'sixteen'), 'boing']] });
shot(A(111), (tl, d, t) => { bgPlain('#16203a', '#060a14'); quoteCard('"Why are, say, 14 solar-mass\nblack holes so rare?"', 'Isaac Legred', 960, 520, tl, 0.2, { size: 60 }); }, { cues: [[A(111) + 0.2, 'paper']] });
shot(A(112), (tl, d, t) => { deep(t, { drift: 10 }); merger(960, 540, clamp(tl / Math.max(2.5, d), 0, 1), t, { s: 0.8 }); vig(0.4); }, { ui: (tl) => tag('MORE COLLISIONS', 960, 110, tl, 0.3, { size: 54, bg: '#fff' }), cues: [[A(112) + 0.3, 'whooshes']] });
shot(A(113), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: 0.4 }); const k = pop(tl, 0.6); if (k > 0) { circle(hx(10) + 8 + 2 * DOT, HY - 12 - 27 * DOT - 30 * (1 - Math.min(k, 1)), 6.5); shape('#000', YEL, 3); COS.glow(hx(10) + 8 + 2 * DOT, HY - 12 - 27 * DOT, 30, YEL, 0.6); } }, { ui: (tl) => tag('+1', hx(10) + 70, HY - 520, tl, 0.6, { size: 54, bg: YEL }), cues: [[A(113) + 0.6, 'pop']] });
shot(A(114), (tl, d, t) => { bgPlain('#121a32', '#04070f'); census(1, { gap: ss(0.3, 1.5, tl) }); }, { cam: [[960, 540, 1.0], [760, 640, 1.25]], ui: (tl) => tag('REAL GAP ▶ GETS SHARPER', 960, 110, tl, WT(114, 'sharper'), { size: 52, bg: ROSE, col: '#fff' }), cues: [[wordT(114, 'sharper'), 'ding']] });
shot(A(115), (tl, d, t) => { space(t, { density: 1.4, mw: 0.6 }); vig(0.4); }, { cam: [[960, 540, 1.0], [960, 540, 1.1]], ui: (tl) => tag('THE OTHER HALF: TELESCOPES', 960, 110, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(115) + 0.3, 'pop']] });
shot(A(116), (tl, d, t) => { bgPlain('#121a32', '#04070f'); lightCurve(360, 860, 1200, 560, ss(0.2, Math.max(2.5, d), tl), { ir: 1 }); }, { ui: (tl) => tag('BRIGHTEN A LITTLE ▶ DISAPPEAR', 960, 110, tl, 0.3, { size: 50, bg: AMBER }), cues: [[A(116) + 0.2, 'slide']] });
shot(A(117), (tl, d, t) => { bgPlain('#121a32', '#04070f'); frame(960, 480, 800, 600, 'ONE CASE', 0.02, { seed: 3, ir: 0.6 }); }, { cues: [[A(117) + 0.2, 'pop']] });
shot(A(118), (tl, d, t) => { bgPlain('#121a32', '#04070f'); for (let i = 0; i < 12; i++) { const k = pop(tl, 0.2 + i * 0.12); if (k <= 0) continue; const x = 260 + (i % 4) * 466, y = 230 + Math.floor(i / 4) * 300; withT(x, y, 0, Math.min(1, k), () => { rrect(-180, -120, 360, 240, 14); shape('#04060c', '#cfd8ea', 4); COS.glow(0, 0, 40, IR, 0.4); }); } }, { ui: (tl) => tag('HOW OFTEN?', 960, 1010, tl, WT(118, 'often'), { size: 54, bg: YEL }), cues: [[A(118) + 0.2, 'reel']] });

// ================================================================ ENDING (119-127)
shot(A(119), (tl, d, t) => { space(t, { density: 1.1, neb: 0.35, hues: ['#5a2a3a', '#2a2a5a'], nebSeed: 4 }); sGiant(960, 540, 300, t); vig(); }, { cam: [[960, 540, 1.08], [960, 540, 1.0]], cues: [[A(119) + 0.2, 'rise']] });
shot(A(120), (tl, d, t) => { space(t, { density: 1.1 }); sGiant(960, 540, 300, t); vig(); }, { ui: (tl) => tag('EVERYONE WAITS FOR THE BANG', 960, 960, tl, WT(120, 'waits'), { size: 52, bg: '#fff' }), cues: [[wordT(120, 'waits'), 'tick']] });
shot(A(121), (tl, d, t) => { space(t, { density: 1.0 }); collapse(960, 540, 300, clamp(tl / Math.max(2.4, d), 0, 1), t); vig(0.6); }, { noWhoosh: true, cues: [[A(121) + 0.2, 'shh']] });
shot(A(122), (tl, d, t) => { deep(t, { drift: 10 }); merger(960, 540, clamp(tl / Math.max(2.5, d), 0, 0.95), t); vig(0.4); }, { cues: [[A(122) + 0.3, 'whooshes']] });
shot(A(123), (tl, d, t) => { earthDetect(t, tl, { wave: true }); vig(0.4); }, { cues: [[A(123) + 0.3, 'wave']] });
shot(A(124), (tl, d, t) => { ligo(560, 860, 0.85, t, { strain: 0.4 * (1 - ss(1.5, 3, tl)), beam: 1 }); }, { ui: (tl) => tag('THE STAR NEVER EXPLODED', 1320, 110, tl, WT(124, 'never'), { size: 48, bg: ROSE, col: '#fff' }), cues: [[wordT(124, 'never'), 'dun']] });
shot(A(125), (tl, d, t) => { space(t, { density: 0.9 }); qmark(960, 520, 2.4, tl, 0.15, YEL); vig(0.5); }, { ui: (tl) => tag('A QUESTION FOR YOU', 960, 930, tl, 0.3, { size: 54, bg: '#fff' }), cues: [[A(125) + 0.15, 'boing']] });
shot(A(126), (tl, d, t) => { bgPlain('#16203a', '#060a14'); [['EXPLODE?', 'explode', 560, '#C8812B'], ['DISAPPEAR?', 'disappear', 1360, '#5b3fb8']].forEach(([lab, w, x, col]) => { const k = pop(tl, WT(126, w)); if (k <= 0) return; withT(x, 540, 0, k, () => { rrect(-330, -170, 660, 340, 30); shape(col, INK, 7); text(lab, 0, 10, 72, '#fff', 900, 'center', INK, 9); }); }); }, { cues: [[wordT(126, 'explode'), 'pop'], [wordT(126, 'disappear'), 'pop']] });
shot(A(127), (tl, d, t) => { bgPlain('#16203a', '#060a14'); [['EXPLODE?', 560, '#C8812B'], ['DISAPPEAR?', 1360, '#5b3fb8']].forEach(([lab, x, col]) => withT(x, 470, 0, 0.9, () => { rrect(-330, -170, 660, 340, 30); shape(col, INK, 7); text(lab, 0, 10, 72, '#fff', 900, 'center', INK, 9); })); }, { ui: (tl) => tag('💬 TELL ME IN THE COMMENTS', 960, 880, tl, 0.2, { size: 56, bg: YEL }), cues: [[A(127) + 0.2, 'pop']] });

window.MUSIC_SEC = { fall: S(85) - 0.1, death: S(95) - 0.1, callback: S(119) - 0.1 };
// ---------- END CARD
const STORY_END = T.total + 0.3, END_DUR = 4.0;
window.TOTAL_DUR = STORY_END + END_DUR;
shot(STORY_END, (tl, d, t) => { bgPlain('#173a7a', '#050915'); const k = pop(tl, 0.1); withT(560, 470, 0, 1.6 * k, () => { circle(0, 0, 80); shape('#0f2560', '#fff', 5); withT(0, 2, 0, 1.1, () => { const kk = 0.866, s = 46; poly([[0, -s], [kk * s, -0.5 * s], [0, 0], [-kk * s, -0.5 * s]]); shape('#FFE27A', INK, 3); poly([[-kk * s, -0.5 * s], [0, 0], [0, s], [-kk * s, 0.5 * s]]); shape('#FF8A3D', INK, 3); poly([[0, 0], [kk * s, -0.5 * s], [kk * s, 0.5 * s], [0, s]]); shape('#E8343A', INK, 3); text('S', 24, 20, 40, '#fff', 900, 'center', null); }); }); text('SHAK', 560, 720, 110, '#fff', 900, 'center', INK, 12); text('CLIPS', 560, 830, 110, '#FFD24A', 900, 'center', INK, 12); rrect(1060, 200, 720, 405, 18); shape('rgba(255,255,255,0.06)', 'rgba(255,255,255,0.35)', 4); text('NEXT STORY ▶', 1420, 402, 54, '#fff', 900, 'center', null); const sk = pop(tl, 0.6); if (sk > 0) withT(1420, 800, 0, sk, () => { rrect(-230, -60, 460, 120, 60); shape('#E8343A', INK, 6); text('SUBSCRIBE', 0, 4, 58, '#fff', 900, 'center', null); }); }, { cues: [[STORY_END + 0.1, 'ding'], [STORY_END + 0.6, 'pop']] });

SHOTS.sort((a, b) => a.a - b.a);
SHOTS.forEach((s, i) => { s.b = i < SHOTS.length - 1 ? SHOTS[i + 1].a : window.TOTAL_DUR; });
CUES.sort((a, b) => a[0] - b[0]);
window.ready = (async () => { await document.fonts.load('900 64px "Inter Display"'); return { shots: SHOTS.length, total: window.TOTAL_DUR, cues: CUES.length }; })();
window.getCues = () => CUES.map(c => [Math.max(0, c[0]), c[1]]);
window.renderFrame = function (t) {
  let i = SHOTS.length - 1; while (i > 0 && SHOTS[i].a > t) i--;
  const sh = SHOTS[i], tl = t - sh.a, d = sh.b - sh.a;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (sh.cam) { const u = easeIO(tl / Math.max(0.01, d)); const [a, b] = sh.cam; const cx = lerp(a[0], b[0], u), cy = lerp(a[1], b[1], u), z = lerp(a[2], b[2], u); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); }
  sh.draw(tl, d, t);
  ctx.restore();
  if (sh.ui) sh.ui(tl, d, t);
  if (t < STORY_END) watermark();
  return { shot: i, tl };
};
