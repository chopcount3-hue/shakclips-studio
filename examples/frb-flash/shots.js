// "This Flash Travelled 10 Billion Years to Reach Earth" — FRB 20240304B. Facts from 2+ sources (see description.txt).
// Spectacle lane: mechanism / journey ("follow one flash"). Neutral tone. One light per frame; galaxies are self-lit.
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
function dwarf(x, y, R, o = {}) {   // small, irregular, star-forming: blue-white with pink knots
  const pts = cached('dw' + (o.seed || 9), () => { const r = rnd(o.seed || 9), out = [];
    const cs = Array.from({ length: 9 }, (_, k) => [gauss(r) * 0.55, gauss(r) * 0.4, 0.18 + r() * 0.3]); for (let i = 0; i < 900; i++) { const c = cs[Math.floor(r() * (r() < 0.5 ? 3 : 9))]; out.push([c[0] + gauss(r) * c[2] * 1.6, c[1] + gauss(r) * c[2] * 1.3, r(), r() < 0.06]); } return out; });
  const A = o.alpha === undefined ? 1 : o.alpha, burst = o.burst || 0;
  ctx.save(); ctx.globalAlpha = A; ctx.translate(x, y); ctx.rotate(o.rot || 0.3);
  COS.glow(0, 0, R * 1.7, '#8fb0ff', 0.22); COS.glow(0, 0, R * 0.9, '#c8d8ff', 0.25);
  for (const [px, py, b, knot] of pts) { const X = px * R * 2.1, Y = py * R * 2.1;
    if (knot) { COS.glow(X, Y, R * 0.12, PINK, 0.55 + 0.2 * Math.sin((o.t || 0) * 2 + b * 9)); continue; }
    ctx.fillStyle = `rgba(205,222,255,${0.3 + 0.55 * b})`; const z = b > 0.93 ? 3.4 : 2.2; ctx.fillRect(X, Y, z, z); }
  COS.glow(R * 0.05, 0, R * 0.4, '#dfe8ff', 0.5);
  ctx.restore();
  if (burst > 0) flash(x + R * 0.18, y - R * 0.08, burst, { r: R * 0.5 });
}
function cluster(x, y, R, t, o = {}) {   // the Virgo Cluster: a crowd of elliptical and spiral galaxies
  const gs = cached('cl', () => { const r = rnd(64); return Array.from({ length: 70 }, () => { const d = Math.pow(r(), 0.8), a = r() * TAU; return [Math.cos(a) * d, Math.sin(a) * d * 0.7, 6 + r() * 26 * (1.1 - d), r() * 3, r()]; }); });
  ctx.save(); COS.glow(x, y, R * 1.2, '#ffd9b0', 0.12);
  gs.forEach(([px, py, s, a, c], i) => { const X = x + px * R, Y = y + py * R, S2 = s * (o.k || 1);
    if (c < 0.2) galaxy(X, Y, S2 * 2.2, { seed: 300 + i, n: 160, rot: a, tilt: 0.5, alpha: 0.9 });
    else { ctx.save(); ctx.translate(X, Y); ctx.rotate(a); ctx.scale(1, 0.6 + 0.3 * c); COS.glow(0, 0, S2 * 1.6, '#ffe4c2', 0.7); COS.glow(0, 0, S2 * 0.4, '#fff2dc', 0.85); ctx.restore(); } });
  ctx.restore();
}
function web(t, o = {}) {   // the cosmic web: filaments of thin gas between galaxies
  const N = cached('web', () => { const r = rnd(77); const nodes = Array.from({ length: 46 }, () => [r() * 2300 - 190, r() * 1300 - 110, 0.5 + r()]); const edges = [];
    nodes.forEach((a, i) => { const ds = nodes.map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j]).sort((p, q) => p[0] - q[0]); for (let k = 1; k <= 3; k++) if (ds[k][1] > i) edges.push([i, ds[k][1]]); }); return { nodes, edges }; });
  const A = o.alpha === undefined ? 1 : o.alpha, dx = (o.drift || 0) * 6 * Math.sin(t * 0.07);
  ctx.save(); ctx.globalAlpha = A; ctx.lineCap = 'round';
  N.edges.forEach(([i, j]) => { const a = N.nodes[i], b = N.nodes[j]; ctx.strokeStyle = 'rgba(110,160,255,0.045)'; ctx.lineWidth = 110; ctx.beginPath(); ctx.moveTo(a[0] - dx, a[1]); ctx.lineTo(b[0] - dx, b[1]); ctx.stroke(); ctx.strokeStyle = 'rgba(120,170,255,0.06)'; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(a[0] - dx, a[1]); ctx.lineTo(b[0] - dx, b[1]); ctx.stroke(); ctx.strokeStyle = 'rgba(150,200,255,0.10)'; ctx.lineWidth = 6; ctx.stroke(); });
  N.nodes.forEach(([x, y, s]) => { COS.glow(x - dx, y, 140 * s, '#7fa8ff', 0.16); COS.glow(x - dx, y, 60 * s, '#9fc0ff', 0.25); COS.glow(x - dx, y, 10 * s, '#ffe9cc', 0.7); });
  ctx.restore();
}

// ---------------------------------------------------------------- the flash
function flash(x, y, u, o = {}) {   // u 0..1 life of the burst
  if (u <= 0) return; u = Math.min(u, 1); const I = Math.max(0.2, u < 0.12 ? u / 0.12 : Math.exp(-(u - 0.12) * 4.2)), R = o.r || 220;
  COS.glow(x, y, R * (1.4 + u * 2.2), FL, 0.55 * I); COS.glow(x, y, R * 0.55, '#fff0d0', 0.85 * I);
  ctx.save(); ctx.globalAlpha = 0.7 * I; const g = ctx.createLinearGradient(x - R * 4, y, x + R * 4, y); g.addColorStop(0, 'rgba(255,196,107,0)'); g.addColorStop(0.5, 'rgba(255,240,215,0.9)'); g.addColorStop(1, 'rgba(255,196,107,0)'); ctx.fillStyle = g; ctx.fillRect(x - R * 4, y - 3, R * 8, 6); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.6 * (1 - u); circle(x, y, R * (0.3 + u * 2.6)); ctx.strokeStyle = FL; ctx.lineWidth = 6 * (1 - u) + 1; ctx.stroke(); ctx.restore();
}
function packet(x, y, o = {}) {   // the travelling burst: a bright head with a trail; o.spread splits it by frequency
  const L = o.len || 420, sp = o.spread || 0, ang = o.ang || 0, k = o.k || 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k);
  const bands = sp > 0 ? [['#b48cff', 0], ['#7fb2ff', 0.25], ['#7cf2b0', 0.5], ['#ffd24a', 0.75], ['#ff7a5a', 1]] : [[FL, 0]];
  bands.forEach(([col, f]) => { const off = -f * sp * 260, yy = sp > 0 ? (f - 0.5) * 70 * sp : 0;
    const g = ctx.createLinearGradient(off - L, 0, off, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, col); ctx.globalAlpha = 0.75; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(off - L, yy - 2); ctx.lineTo(off, yy - 9); ctx.lineTo(off, yy + 9); ctx.lineTo(off - L, yy + 2); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; COS.glow(off, yy, 60, col, 0.6); COS.glow(off, yy, 16, '#fff6e6', 0.85); });
  ctx.restore();
}

// ---------------------------------------------------------------- the suspect
const P_NS = { kind: 'gas', base: '#dfe8ff', atmo: '#bcd4ff', atmoThick: 0.04, halo: 0.7, soft: 0.42, spec: 0.7, tilt: 0.1, pal: ['#e6eeff', '#d2deff', '#eef3ff', '#c8d6fa'], bandSeed: 5, spots: [], glow: '#9fc4ff' };
function fieldLines(x, y, r, t, o = {}) {
  const tilt = (o.tilt || 0.35) + Math.sin(t * 0.6) * 0.05, A = o.alpha === undefined ? 1 : o.alpha;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.lineWidth = 3; ctx.globalAlpha = A;
  [2.2, 3.2, 4.6, 6.4, 8.8].forEach((Lk, i) => { [1, -1].forEach(side => { ctx.beginPath();
    for (let j = 0; j <= 80; j++) { const th = 0.06 + j / 80 * (Math.PI - 0.12); const rr = r * Lk * Math.pow(Math.sin(th), 2); if (rr < r * 0.98 && j > 0 && j < 80) { } const px = side * rr * Math.sin(th), py = -rr * Math.cos(th);
      j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    const kink = o.snap && i === 2 && side === 1 ? o.snap : 0;
    ctx.strokeStyle = kink ? `rgba(255,220,150,${0.9})` : `rgba(160,205,255,${0.55 - i * 0.07})`; ctx.stroke(); }); });
  // polar beams
  [-1, 1].forEach(sgn => { const g = ctx.createLinearGradient(0, 0, 0, sgn * -r * 9); g.addColorStop(0, 'rgba(200,225,255,0.55)'); g.addColorStop(1, 'rgba(200,225,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-r * 0.3, 0); ctx.lineTo(-r * 1.3, sgn * -r * 9); ctx.lineTo(r * 1.3, sgn * -r * 9); ctx.lineTo(r * 0.3, 0); ctx.closePath(); ctx.fill(); });
  ctx.restore();
}
function magnetar(x, y, r, t, o = {}) {
  COS.glow(x, y, r * 6, '#6f9cff', 0.18);
  fieldLines(x, y, r, t, o);
  COS.planet(x, y, r, P_NS, { light: LIGHT_L, spin: t * 30, ink: null });
  COS.glow(x, y, r * 1.6, '#cfe0ff', 0.35);
  if (o.snap) { const s = o.snap; const px = x + Math.cos(-0.9) * r * 3.2, py = y + Math.sin(-0.9) * r * 3.2; flash(px, py, s, { r: r * 2.2 }); }
}
function supernova(x, y, u, t) {
  if (u < 0.35) { const k = u / 0.35; COS.star(x, y, 40 + 60 * k, { t, core: '#fff6e0', mid: '#ffb36b', out: '#ff6a3c' }); }
  else { const v = (u - 0.35) / 0.65; COS.glow(x, y, 120 + 600 * v, '#ff9a5c', 0.5 * (1 - v)); COS.shockwave(x, y, v, { r0: 60, r1: 620, thick: 40 });
    COS.glow(x, y, 60 * (1 - v) + 18, '#cfe0ff', 0.85); }
}

// ---------------------------------------------------------------- telescopes
function dish(x, y, s, o = {}) {   // a radio dish: pedestal, yoke, bowl tilted to the sky
  const el = o.el === undefined ? -0.75 : o.el, lit = o.lit || '#e9edf3', dark = o.dark || '#7d8796';
  withT(x, y, 0, s, () => {
    poly([[-34, 0], [34, 0], [16, -150], [-16, -150]]); const g = ctx.createLinearGradient(-34, 0, 34, 0); g.addColorStop(0, lit); g.addColorStop(1, dark); shape(g, 'rgba(10,14,28,0.6)', 3);
    rrect(-30, -175, 60, 34, 8); shape(dark, 'rgba(10,14,28,0.6)', 3);
    withT(0, -175, el, 1, () => {
      ctx.beginPath(); ctx.ellipse(0, -40, 150, 52, 0, 0, Math.PI * 2); const gb = ctx.createLinearGradient(-150, -80, 150, 0); gb.addColorStop(0, '#ffffff'); gb.addColorStop(0.5, lit); gb.addColorStop(1, dark); ctx.fillStyle = gb; ctx.fill(); ctx.strokeStyle = 'rgba(10,14,28,0.55)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -46, 128, 40, 0, Math.PI, 0); ctx.strokeStyle = 'rgba(10,14,28,0.25)'; ctx.lineWidth = 2; ctx.stroke();
      line(-90, -60, 0, -190, 4, dark); line(90, -60, 0, -190, 4, dark); circle(0, -192, 10); shape(lit, 'rgba(10,14,28,0.6)', 3); });
  });
}
function karoo(t, o = {}) {   // MeerKAT at night: dishes on a dry plain under the Milky Way
  space(t, { mw: o.mw === undefined ? 1.0 : o.mw, mwY: 360, mwRot: -0.35, mwThick: 260, density: 1.6 });
  const hy = 760; const g = ctx.createLinearGradient(0, hy, 0, H); g.addColorStop(0, '#2a2420'); g.addColorStop(1, '#0d0b0a'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-50, H + 40); ctx.lineTo(-50, hy); for (let x = -50; x <= 1980; x += 40) ctx.lineTo(x, hy - 28 * Math.max(0, Math.sin(x * 0.004 + 0.7)) - 10 * Math.sin(x * 0.02)); ctx.lineTo(1980, H + 40); ctx.closePath(); ctx.fill();
  const rows = cached('dishes', () => { const r = rnd(64); const out = []; for (let i = 0; i < 26; i++) { const d = r(); out.push([r() * 2000 - 40, hy + 8 + d * 220, 0.18 + d * 0.62]); } return out.sort((a, b) => a[1] - b[1]); });
  const el = o.el === undefined ? -0.75 : o.el;
  rows.forEach(([x, y, s]) => dish(x, y, s, { el, lit: '#c8ccd4', dark: '#4a5260' }));
}
function jwst(x, y, s, t) {   // Webb: 18 gold hexagons above a layered sunshield
  withT(x, y, Math.sin(t * 0.3) * 0.03, s, () => {
    // sunshield (behind/below)
    for (let i = 0; i < 5; i++) { poly([[-360 + i * 10, 150 + i * 8], [0, 60 + i * 8], [360 - i * 10, 150 + i * 8], [0, 250 + i * 8]]); shape(`rgba(${190 - i * 18},${170 - i * 16},${220 - i * 12},0.95)`, 'rgba(10,14,28,0.5)', 2); }
    line(0, 120, 0, 40, 10, '#6a6f7a');
    const hx = (q, r) => [q * 52 * 1.5, (r + q / 2) * 52 * Math.sqrt(3)];
    const cells = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -2], [1, -2], [2, -2], [2, -1], [2, 0], [1, 1], [0, 2], [-1, 2], [-2, 2], [-2, 1], [-2, 0], [-1, -1]];
    cells.forEach(([q, r], i) => { const [cx, cy] = hx(q, r); ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; const px = cx + Math.cos(a) * 49, py = cy - 30 + Math.sin(a) * 49; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath();
      const g = ctx.createLinearGradient(cx - 50, cy - 80, cx + 50, cy + 20); g.addColorStop(0, '#fff0b0'); g.addColorStop(0.45, '#e6b84a'); g.addColorStop(1, '#8a5a18'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(40,24,6,0.7)'; ctx.lineWidth = 3; ctx.stroke(); });
    line(-150, 60, 0, -330, 5, '#6a6f7a'); line(150, 60, 0, -330, 5, '#6a6f7a'); line(0, 120, 0, -330, 4, '#6a6f7a'); circle(0, -330, 16); shape('#e6b84a', 'rgba(40,24,6,0.7)', 3);
    COS.glow(-60, -100, 160, '#fff0c0', 0.25);
  });
}
function exposure(x, y, w, h, t, o = {}) {   // a deep image of one patch of sky
  rrect(x - 8, y - 8, w + 16, h + 16, 10); shape('#11151f', '#cfd6e4', 5);
  ctx.save(); rrect(x, y, w, h, 4); ctx.clip(); ctx.fillStyle = '#03050a'; ctx.fillRect(x, y, w, h);
  COS.starfield(o.seed || 21, { box: [x, y, w, h], density: o.density || 0.5 });
  if (o.gal) dwarf(x + w / 2, y + h / 2, (o.galR || 60), { alpha: o.gal, seed: 9, t });
  if (o.ir) { ctx.fillStyle = `rgba(80,30,10,${0.25 * o.ir})`; ctx.fillRect(x, y, w, h); }
  ctx.restore();
  if (o.cross !== undefined) { const k = o.cross; ctx.save(); ctx.globalAlpha = k; circle(x + w / 2, y + h / 2, 70); ctx.strokeStyle = o.crossCol || MINT; ctx.lineWidth = 5; ctx.stroke(); [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([a, b]) => line(x + w / 2 + a * 90, y + h / 2 + b * 90, x + w / 2 + a * 120, y + h / 2 + b * 120, 5, o.crossCol || MINT)); ctx.restore(); }
  if (o.label) text(o.label, x + w / 2, y + h + 52, 38, '#fff', 900, 'center', INK, 8);
}
function dome(x, y, s, t, o = {}) {   // a ground observatory on a summit at night (Keck-like, generic)
  withT(x, y, 0, s, () => { rrect(-170, -120, 340, 130, 6); shape('#d9dde6', 'rgba(10,14,28,0.6)', 4); ctx.beginPath(); ctx.arc(0, -120, 170, Math.PI, 0); ctx.closePath(); const g = ctx.createLinearGradient(-170, -290, 170, -120); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#8c94a3'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(10,14,28,0.6)'; ctx.lineWidth = 4; ctx.stroke();
    rrect(-34, -288, 68, 168, 6); shape('#1b2030', null); if (o.beam) { ctx.save(); ctx.globalAlpha = 0.25 * o.beam; poly([[-30, -280], [30, -280], [260, -900], [-120, -900]]); shape('#cfe8ff', null); ctx.restore(); } });
}
function summit(t, o = {}) {
  space(t, { density: 1.5, mw: 0.6, mwY: 300, mwRot: 0.3 });
  ctx.fillStyle = '#17110f'; ctx.beginPath(); ctx.moveTo(-50, H + 40); ctx.lineTo(-50, 900); ctx.lineTo(500, 780); ctx.lineTo(900, 820); ctx.lineTo(1300, 760); ctx.lineTo(1980, 880); ctx.lineTo(1980, H + 40); ctx.closePath(); ctx.fill();
  dome(o.x || 960, 800, o.s || 1, t, { beam: o.beam });
}

// ---------------------------------------------------------------- charts and diagrams
function waterfall(x, y, w, h, u, o = {}) {   // frequency (up) against arrival time (right); dispersion bends the track
  rrect(x - 20, y - 20, w + 40, h + 40, 18); shape('rgba(8,12,26,0.92)', '#cfd8ea', 4);
  line(x + 60, y + h - 40, x + w - 20, y + h - 40, 5, '#cfd8ea'); line(x + 60, y + h - 40, x + 60, y + 20, 5, '#cfd8ea');
  text('HIGH', x + 40, y + 50, 26, '#cfd8ea', 900, 'right', null); text('LOW', x + 40, y + h - 60, 26, '#cfd8ea', 900, 'right', null);
  text('ARRIVAL TIME →', x + w / 2, y + h + 6, 28, '#cfd8ea', 900, 'center', null);
  const disp = o.disp === undefined ? 1 : o.disp, n = 60;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i <= n; i++) { const f = i / n; if (f > u) break; const freq = 1 - f; // top to bottom
    const fr = 0.5 + 0.5 * freq; const delay = disp * (1 / (fr * fr) - 1) / 3; const px = x + 110 + delay * (w - 220), py = y + 40 + f * (h - 100);
    const col = `hsl(${270 - f * 260},90%,65%)`; COS.glow(px, py, 26, col, 0.6); circle(px, py, 6); shape('#fff6e6', null); }
  ctx.restore();
}
function timeline(x, y, w, uFlash, o = {}) {   // cosmic history, 0 to 13.8 billion years
  const X = (g) => x + w * g / 13.8;
  rrect(x - 10, y - 14, w + 20, 28, 14); const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#3a2a6a'); g.addColorStop(0.5, '#23407a'); g.addColorStop(1, '#2a5a8a'); shape(g, '#cfd8ea', 4);
  text('BIG BANG', x, y + 62, 30, '#fff', 900, 'center', INK, 6); text('TODAY', x + w, y + 62, 30, '#fff', 900, 'center', INK, 6);
  (o.marks || []).forEach(([gyr, lab, col, k]) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, k); line(X(gyr), y - 30, X(gyr), y + 30, 5, col); text(lab, X(gyr), y - 52, 28, col, 900, 'center', INK, 6); ctx.restore(); });
  if (uFlash !== undefined) { const g0 = 13.8 - 10.8, gx = X(g0 + (13.8 - g0) * clamp(uFlash, 0, 1)); ctx.save(); ctx.beginPath(); ctx.moveTo(X(g0), y); ctx.lineTo(gx, y); ctx.strokeStyle = FL; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); COS.glow(gx, y, 60, FL, 0.7); circle(gx, y, 9); shape('#fff6e6', null); }
}
function eye(x, y, s, open) { withT(x, y, 0, s, () => { ctx.beginPath(); ctx.moveTo(-120, 0); ctx.quadraticCurveTo(0, -95 * open - 4, 120, 0); ctx.quadraticCurveTo(0, 95 * open + 4, -120, 0); ctx.closePath(); shape('#f6f2ea', INK, 7); if (open > 0.15) { ctx.save(); ctx.clip(); circle(0, 0, 46); shape('#3b6fd6', INK, 5); circle(0, 0, 20); shape('#0b0f1a', null); circle(-14, -14, 8); shape('#fff', null); ctx.restore(); } }); }
function bar(x, y, w, k, col, label) { rrect(x, y - 26, Math.max(8, w * k), 52, 26); shape(col, INK, 5); if (label) text(label, x, y - 56, 34, '#fff', 900, 'left', INK, 7); }
function iconCard(x, y, k, label, draw) { if (k <= 0) return; withT(x, y, 0, k, () => { rrect(-250, -230, 500, 460, 30); shape('rgba(12,18,36,0.88)', '#cfd8ea', 5); ctx.save(); ctx.translate(0, -40); draw(); ctx.restore(); text(label, 0, 165, 40, '#fff', 900, 'center', INK, 8); }); }
function take(tl) { tag("SHAK'S TAKE", 260, 90, tl, 0.15, { size: 44, bg: VIO, col: '#fff' }); }
function sunCal(x, y, tl, t) { COS.star(x, y, 120, { t }); }
function earthAt(x, y, r, t, o = {}) { COS.planet(x, y, r, 'earth', { light: o.light || LIGHT_L, spin: 40 + t * 6, clouds: true, alpha: o.alpha }); }
function nebulaCollapse(x, y, u, t) {   // a gas cloud falling in on itself, then a star lighting up
  const pts = cached('neb', () => { const r = rnd(51); return Array.from({ length: 520 }, () => [r() * TAU, 0.3 + r() * 0.7, r()]); });
  const R = lerp(520, 40, easeIO(u));
  pts.forEach(([a, d, b]) => { const aa = a + u * 3 * (1.2 - d); const X = x + Math.cos(aa) * d * R, Y = y + Math.sin(aa) * d * R * 0.6; ctx.fillStyle = `rgba(255,${150 + b * 80},${120 + b * 60},${0.35 + 0.4 * b})`; ctx.fillRect(X, Y, 2.4, 2.4); });
  COS.glow(x, y, R * 0.9, '#ff9a6c', 0.25);
  if (u > 0.7) COS.star(x, y, 90 * ss(0.7, 1, u), { t });
}
function dino(x, y, s, flip = 1) {   // generic long-necked silhouette
  withT(x, y, 0, s, () => { ctx.scale(flip, 1); ctx.beginPath(); ctx.moveTo(-160, 0); ctx.quadraticCurveTo(-120, -70, -20, -80); ctx.quadraticCurveTo(60, -90, 90, -150); ctx.quadraticCurveTo(110, -230, 150, -235); ctx.quadraticCurveTo(175, -232, 170, -215); ctx.quadraticCurveTo(140, -210, 130, -150); ctx.quadraticCurveTo(120, -60, 80, -20); ctx.lineTo(70, 40); ctx.lineTo(50, 40); ctx.lineTo(40, -10); ctx.lineTo(-60, -10); ctx.lineTo(-70, 40); ctx.lineTo(-90, 40); ctx.lineTo(-100, -10); ctx.quadraticCurveTo(-200, 0, -300, 20); ctx.quadraticCurveTo(-200, -10, -160, 0); ctx.closePath(); ctx.fillStyle = '#0c0a10'; ctx.fill(); });
}
function scaleBalance(x, y, s, tilt, tl, t) {   // a balance: the universe's hidden gas on one pan
  withT(x, y, 0, s, () => { poly([[-40, 300], [40, 300], [12, -10], [-12, -10]]); shape('#d6dbe6', INK, 5); withT(0, -10, tilt, 1, () => { line(-330, 0, 330, 0, 14, '#d6dbe6'); line(-330, 0, -330, 0, 1);
    [-330, 330].forEach((px, i) => withT(px, 0, -tilt, 1, () => { line(0, 0, -90, 170, 4, '#d6dbe6'); line(0, 0, 90, 170, 4, '#d6dbe6'); ctx.beginPath(); ctx.ellipse(0, 175, 120, 26, 0, 0, Math.PI); shape('#d6dbe6', INK, 5);
      if (i === 0) { COS.glow(0, 130, 120, '#7fa8ff', 0.6); COS.glow(0, 135, 50, '#cfe0ff', 0.7); } })); }); circle(0, -10, 18); shape(YEL, INK, 5); });
}
function distDots(t, tl, o = {}) {   // localised bursts by distance: most near, this one far
  const x0 = 220, x1 = 1700, y = 600; line(x0, y, x1, y, 6, '#cfd8ea'); text('NEAR', x0, y + 70, 34, '#cfd8ea', 900, 'center', null); text('FAR', x1, y + 70, 34, '#cfd8ea', 900, 'center', null);
  const ds = cached('dd', () => { const r = rnd(5); return Array.from({ length: 70 }, () => [Math.pow(r(), 2.2) * 0.36, (r() - 0.5) * 220]); });
  ds.forEach(([f, dy], i) => { const k = pop(tl, 0.2 + i * 0.012); if (k <= 0) return; circle(x0 + f * (x1 - x0), y - 40 + dy * 0.6 - 80, 9 * Math.min(k, 1.2)); shape('#9fc0ff', INK, 3); });
  if (o.far) { const k = pop(tl, o.far); if (k > 0) { const px = x0 + 0.86 * (x1 - x0), py = y - 120; COS.glow(px, py, 80 * k, FL, 0.7); circle(px, py, 16 * k); shape(FL, INK, 4); } }
}
function ska(t, o = {}) {   // many more dishes on the plain: a bigger array coming
  karoo(t, { mw: 0.9 });
  const r = rnd(91); for (let i = 0; i < 26; i++) { const d = r(), x = r() * 2000 - 40, y = 790 + d * 200, k = pop(o.tl || 9, 0.2 + i * 0.05); if (k <= 0) continue; dish(x, y, (0.15 + d * 0.5) * Math.min(1, k), { lit: '#f2e6c8', dark: '#6a5a40' }); }
}

// ================================================================ HOOK (1-12)
shot(0, (tl, d, t) => { karoo(t); flash(1300, 210, clamp((tl - 1.6) / 3.0, 0, 1), { r: 160 }); vig(); },
  { cam: [[960, 560, 1.06], [960, 520, 1.0]], ui: (tl) => { tag('4 MARCH 2024', 960, 110, tl, 0.4, { size: 54, bg: YEL }); tag('SOUTH AFRICA', 960, 1000, tl, WT(1, 'south'), { size: 40, bg: '#fff' }); }, cues: [[0.2, 'rise'], [0.4, 'pop'], [A(1) + 1.6, 'sparkle']] });
shot(A(2), (tl, d, t) => { space(t, { density: 0.6 }); flash(960, 540, clamp(tl / 2.2, 0, 1), { r: 260 }); vig(); },
  { ui: (tl) => tag('A FEW THOUSANDTHS OF A SECOND', 960, 940, tl, 0.3, { size: 54, bg: YEL }), cues: [[A(2) + 0.05, 'sparkle']] });
shot(A(3), (tl, d, t) => { deep(t, { drift: 60 }); web(t, { alpha: 0.5, drift: 40 }); packet(500 + tl * 130, 540, { len: 520 }); vig(); },
  { ui: (tl) => { bigText('10,000,000,000+', 960, 220, 120, FL, tl, WT(3, 'ten')); bigText('YEARS IN TRANSIT', 960, 340, 60, '#fff', tl, WT(3, 'years')); }, cues: [[wordT(3, 'ten'), 'dun']] });
shot(A(4), (tl, d, t) => { space(t, { density: 0.8 }); dwarf(960, 560, 230, { t, burst: clamp((tl - 0.6) / 2.5, 0, 1) }); vig(); },
  { cam: [[960, 540, 1.15], [960, 540, 1.0]], ui: (tl) => tag('UNIVERSE: ~3 BILLION YEARS OLD', 960, 960, tl, WT(4, 'three'), { size: 50, bg: '#fff' }), cues: [[A(4) + 0.6, 'sparkle'], [wordT(4, 'three'), 'pop']] });
shot(A(5), (tl, d, t) => { space(t, { density: 0.9 }); COS.star(960, 540, 120, { t, alpha: 0.25 }); ctx.save(); ctx.fillStyle = 'rgba(2,4,11,0.55)'; ctx.fillRect(0, 0, W, H); ctx.restore(); stamp(960, 540, 1.3, 'NO SUN YET', ROSE, -0.1, tl, 0.3); vig(); }, { cues: [[A(5) + 0.3, 'stamp']] });
shot(A(6), (tl, d, t) => { space(t, { density: 0.9 }); earthAt(960, 560, 260, t, { alpha: 0.22 }); stamp(960, 540, 1.3, 'NO EARTH YET', ROSE, 0.08, tl, 0.3); vig(); }, { cues: [[A(6) + 0.3, 'stamp']] });
shot(A(7), (tl, d, t) => { space(t, { density: 0.6 }); flash(960, 520, 0.2 + 0.05 * Math.sin(tl * 3), { r: 200 }); vig(); },
  { ui: (tl) => { bigText('FAST RADIO BURST', 960, 860, 110, '#fff', tl, WT(7, 'fast')); }, cues: [[wordT(7, 'fast'), 'dun']] });
shot(A(8), (tl, d, t) => { space(t, { density: 0.7 }); timeline(220, 640, 1480, ss(0.2, 2.2, tl), { marks: [[3, 'IT LEFT HERE', FL, pop(tl, 0.2)]] }); vig(0.4); },
  { ui: (tl) => tag('MOST DISTANT EVER TRACED TO ITS GALAXY', 960, 140, tl, WT(8, 'distant'), { size: 46, bg: YEL }), cues: [[A(8) + 0.2, 'slide'], [wordT(8, 'distant'), 'ding']] });
shot(A(9), (tl, d, t) => { bgPlain('#16203a', '#060a14'); bar(300, 440, 640, ss(0.2, 0.9, tl), '#7fa8e8', 'PREVIOUS RECORD'); bar(300, 680, 1340, ss(0.6, 1.8, tl), FL, 'FRB 20240304B'); },
  { ui: (tl) => tag('MORE THAN 2× THE DISTANCE', 960, 900, tl, WT(9, 'doubles'), { size: 52, bg: YEL }), cues: [[A(9) + 0.2, 'slide'], [A(9) + 0.6, 'slide'], [wordT(9, 'doubles'), 'ding']] });
shot(A(10), (tl, d, t) => { space(t, { density: 0.6 }); vig(0.4); },
  { ui: (tl) => { bigText('FRB 20240304B', 960, 420, 150, '#fff', tl, 0.15); const k = ss(WT(10, 'twenty'), WT(10, 'twenty') + 0.5, tl); if (k > 0) { ctx.save(); ctx.globalAlpha = k; tag('2024', 760, 620, tl, WT(10, 'twenty'), { size: 44, bg: YEL }); tag('03', 1000, 620, tl, WT(10, 'oh three'), { size: 44, bg: YEL }); tag('04', 1170, 620, tl, WT(10, 'oh four'), { size: 44, bg: YEL }); ctx.restore(); } tag('= YEAR · MONTH · DAY OF ARRIVAL', 960, 760, tl, WT(10, 'oh four') + 0.3, { size: 40, bg: '#fff' }); }, cues: [[A(10) + 0.15, 'dun'], [wordT(10, 'oh four') + 0.3, 'pop']] });
shot(A(11), (tl, d, t) => { summit(t, { beam: ss(0.2, 1.0, tl) }); exposure(1300, 160, 460, 320, t, { cross: 1 }); vig(0.4); },
  { ui: (tl) => stamp(1530, 320, 0.9, 'NOTHING', ROSE, -0.12, tl, WT(11, 'nothing')), cues: [[A(11) + 0.2, 'slide'], [wordT(11, 'nothing'), 'stamp']] });
shot(A(12), (tl, d, t) => { deep(t, { drift: 40 }); packet(300 + tl * 140, 520, { len: 420 }); qmark(1500, 480, 2.0, tl, WT(12, 'journey'), YEL); vig(); },
  { ui: (tl) => { tag('HOW POWERFUL?', 560, 180, tl, WT(12, 'powerful'), { size: 52, bg: '#fff' }); tag('WHAT HAPPENED ON THE WAY?', 1100, 900, tl, WT(12, 'journey'), { size: 52, bg: YEL }); }, cues: [[wordT(12, 'powerful'), 'pop'], [wordT(12, 'journey'), 'boing']] });

// ================================================================ THE FLASH (13-28)
shot(A(13), (tl, d, t) => { space(t, { density: 0.7 }); flash(960, 540, 0.3, { r: 220 }); }, { ui: (tl) => titleCard('THE FLASH', tl, 0, 1.3, '#C8812B'), cues: [[A(13), 'sting']] });
shot(A(14), (tl, d, t) => { space(t, { density: 1.0, mw: 0.5 }); const u = (tl % 2.4) / 2.4; flash(1200, 380, u, { r: 180 }); earthAt(360, 860, 300, t); vig(); },
  { ui: (tl) => tag('A BLAST OF RADIO WAVES', 960, 110, tl, WT(14, 'radio'), { size: 52, bg: YEL }), cues: [[A(14) + 0.1, 'sparkle'], [wordT(14, 'radio'), 'pop']] });
shot(A(15), (tl, d, t) => { bgPlain('#16203a', '#060a14'); const k = ss(0.2, 1.6, tl); const bands = [['RADIO', 0.012, '#ffb36b'], ['MICROWAVE', 0.03, '#ffd24a'], ['INFRARED', 0.07, '#ff7a7a'], ['VISIBLE', 0.15, '#9fd8ff'], ['X-RAY', 0.4, '#b48cff']];
  bands.forEach(([lab, f, col], i) => { const y = 180 + i * 170; if (k * 5 < i) return; ctx.save(); ctx.beginPath(); for (let x = 420; x <= 1700; x += 4) { const yy = y + 40 * Math.sin((x - 420) * f); x === 420 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.strokeStyle = col; ctx.lineWidth = i === 0 ? 10 : 5; ctx.stroke(); ctx.restore(); text(lab, 380, y + 14, 38, col, 900, 'right', INK, 7); });
  if (tl > WT(15, 'eyes')) { rrect(1380, 650, 360, 90, 20); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke(); } },
  { ui: (tl) => { tag('ALL OF THESE ARE LIGHT', 960, 1010, tl, WT(15, 'light'), { size: 46, bg: '#fff' }); tag('OUR EYES', 1560, 790, tl, WT(15, 'eyes'), { size: 34, bg: ICE }); }, cues: [[A(15) + 0.3, 'slide'], [wordT(15, 'light'), 'pop'], [wordT(15, 'eyes'), 'pop']] });
shot(A(16), (tl, d, t) => { bgPlain('#16203a', '#060a14'); const x0 = 260, x1 = 1660, y = 560; line(x0, y + 160, x1, y + 160, 5, '#cfd8ea'); for (let i = 0; i <= 10; i++) line(x0 + i * 140, y + 150, x0 + i * 140, y + 170, 4, '#cfd8ea');
  const u = ss(0.2, 2.2, tl), px = lerp(x0, x1, u); ctx.save(); ctx.beginPath(); for (let x = x0; x <= px; x += 3) { const g = Math.exp(-Math.pow((x - 960) / 40, 2)); x === x0 ? ctx.moveTo(x, y + 140) : ctx.lineTo(x, y + 140 - 300 * g); } ctx.strokeStyle = FL; ctx.lineWidth = 8; ctx.stroke(); ctx.restore(); },
  { ui: (tl) => { tag('ONE SECOND', 960, 830, tl, 0.3, { size: 40, bg: '#fff' }); tag('A FEW MILLISECONDS', 960, 140, tl, WT(16, 'milliseconds'), { size: 54, bg: YEL }); }, cues: [[A(16) + 0.2, 'slide'], [wordT(16, 'milliseconds'), 'ding']] });
shot(A(17), (tl, d, t) => { karoo(t, { mw: 0.7, el: -0.9 }); vig(0.5); }, { cam: [[960, 640, 1.2], [960, 600, 1.1]], ui: (tl) => bigText('FIRST REPORTED: 2007', 960, 200, 96, '#fff', tl, WT(17, 'two')), cues: [[wordT(17, 'two'), 'dun']] });
shot(A(18), (tl, d, t) => { space(t, { density: 0.7 }); flash(960, 520, 0.25, { r: 200 }); qmark(960, 520, 2.6, tl, 0.3, YEL); vig(); }, { ui: (tl) => tag('CAUSE: NOT SETTLED', 960, 940, tl, WT(18, 'settled'), { size: 52, bg: '#fff' }), cues: [[A(18) + 0.3, 'boing']] });
shot(A(19), (tl, d, t) => { bgPlain('#16203a', '#060a14'); const n = Math.floor(ss(0.2, 2.6, tl) * 96); for (let i = 0; i < n; i++) { const x = 330 + (i % 16) * 84, y = 260 + Math.floor(i / 16) * 100; rrect(x - 30, y - 34, 60, 68, 8); shape(i % 7 === 3 ? '#ffd9a0' : '#e8eefc', INK, 3); line(x - 16, y - 10, x + 16, y - 10, 3, '#8890a0'); line(x - 16, y + 6, x + 12, y + 6, 3, '#8890a0'); } },
  { ui: (tl) => tag('NEARLY 100 IDEAS', 960, 940, tl, WT(19, 'hundred'), { size: 56, bg: YEL }), cues: [[A(19) + 0.2, 'scribble'], [wordT(19, 'hundred'), 'ding']] });
shot(A(20), (tl, d, t) => { space(t, { density: 1.2, mw: 0.6 }); const r = rnd(20); for (let i = 0; i < 9; i++) { const x = 160 + r() * 1600, y = 120 + r() * 800, t0 = 0.2 + i * 0.45; flash(x, y, clamp((tl - t0) / 1.4, 0, 1), { r: 90 }); } vig(); },
  { ui: (tl) => tag('AT RANDOM · ANY DIRECTION', 960, 980, tl, WT(20, 'random'), { size: 50, bg: '#fff' }), cues: [[A(20) + 0.2, 'sparkle'], [A(20) + 1.6, 'sparkle'], [A(20) + 3.0, 'sparkle']] });
shot(A(21), (tl, d, t) => { space(t, { density: 0.7 }); flash(960, 540, clamp(tl / 3, 0, 1) * 0.4 + 0.12, { r: 300 }); vig(); }, { cam: [[960, 540, 1.0], [960, 540, 1.12]], ui: (tl) => tag('STRONG, EVEN FOR AN FRB', 960, 940, tl, 0.3, { size: 52, bg: YEL }), cues: [[A(21) + 0.3, 'pop']] });
shot(A(22), (tl, d, t) => { space(t, { density: 0.6 }); flash(1500, 540, 0.2, { r: 200 }); vig(0.4); },
  { ui: (tl) => { bigText('≈ 10⁴¹ ERGS', 760, 520, 170, FL, tl, WT(22, 'ten')); tag('ESTIMATED ENERGY', 760, 700, tl, WT(22, 'energy'), { size: 46, bg: '#fff' }); }, cues: [[wordT(22, 'ten'), 'dun'], [wordT(22, 'energy'), 'pop']] });
shot(A(23), (tl, d, t) => { space(t, { density: 0.7 }); COS.star(560, 540, 150, { t }); const n = Math.floor(ss(0.3, 3.0, tl) * 10);
  for (let i = 0; i < n; i++) { const x = 1040 + (i % 5) * 160, y = 400 + Math.floor(i / 5) * 200; withT(x, y, (i % 2 ? 0.05 : -0.05), 1, () => { rrect(-62, -70, 124, 140, 12); shape('#f6f2ea', INK, 5); rrect(-62, -70, 124, 36, 12); shape(ROSE, INK, 5); text('MONTH', 0, 28, 24, INK, 900, 'center', null); }); } vig(0.4); },
  { ui: (tl) => tag('≈ MANY MONTHS OF OUR SUN', 960, 130, tl, WT(23, 'months'), { size: 52, bg: YEL }), cues: [[A(23) + 0.3, 'page'], [A(23) + 1.2, 'page'], [A(23) + 2.1, 'page'], [wordT(23, 'months'), 'ding']] });
shot(A(24), (tl, d, t) => { space(t, { density: 0.6 }); const n = 6; for (let i = 0; i < n; i++) { const x = 1040 + (i % 5) * 160; } flash(960, 540, clamp(tl / 1.6, 0, 1), { r: 340 }); vig(); },
  { ui: (tl) => tag('ALL IN A FEW MILLISECONDS', 960, 940, tl, 0.2, { size: 54, bg: YEL }), cues: [[A(24) + 0.05, 'sparkle']] });
shot(A(25), (tl, d, t) => { bgPlain('#16203a', '#060a14'); const blink = Math.max(0, Math.sin(clamp((tl - 0.6) / 0.5, 0, 1) * Math.PI)); eye(560, 520, 1.6, 1 - blink); bar(1000, 420, 700, ss(0.3, 1.2, tl), '#9fc0ff', 'ONE BLINK'); bar(1000, 680, 18, 1, FL, 'THE FLASH'); },
  { ui: (tl) => tag('SHORTER THAN A BLINK', 960, 930, tl, WT(25, 'blink'), { size: 54, bg: '#fff' }), cues: [[A(25) + 0.6, 'shh'], [wordT(25, 'blink'), 'pop']] });
shot(A(26), (tl, d, t) => { space(t, { density: 0.8, neb: 0.4, hues: ['#3a4fa8', '#5a3aa8'] }); flash(960, 540, 0.22, { r: 220 }); vig(); }, { ui: (tl) => take(tl), cues: [[A(26) + 0.15, 'ding']] });
shot(A(27), (tl, d, t) => { space(t, { density: 0.8 }); dwarf(960, 540, 260, { t, alpha: 0.9 }); ctx.save(); circle(1007, 520, 50); ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fill(); ctx.restore(); qmark(1007, 520, 0.9, tl, 0.3, YEL); vig(); },
  { ui: (tl) => { take(tl); tag('THE SOURCE: UNSEEN', 960, 950, tl, WT(27, 'see'), { size: 52, bg: '#fff' }); }, cues: [[A(27) + 0.3, 'boing']] });
shot(A(28), (tl, d, t) => { bgPlain('#16203a', '#060a14');
  iconCard(600, 520, pop(tl, WT(28, 'flash')), 'CLUE 1: THE FLASH', () => { flash(0, 0, 0.2, { r: 90 }); });
  iconCard(1320, 520, pop(tl, WT(28, 'galaxy')), 'CLUE 2: ITS GALAXY', () => { dwarf(0, 0, 90, { t, seed: 9 }); }); },
  { ui: (tl) => take(tl), cues: [[wordT(28, 'flash'), 'pop'], [wordT(28, 'galaxy'), 'pop']] });

// ================================================================ THE SUSPECT (29-42)
shot(A(29), (tl, d, t) => { space(t, { density: 0.8 }); magnetar(960, 540, 60, t, { alpha: 0.3 }); }, { ui: (tl) => titleCard('THE SUSPECT', tl, 0, 1.3, '#3a5fc8'), cues: [[A(29), 'sting']] });
shot(A(30), (tl, d, t) => { space(t, { density: 0.9 }); magnetar(960, 560, 70, t); vig(); }, { cam: [[960, 560, 0.8], [960, 560, 1.05]], ui: (tl) => bigText('MAGNETAR', 960, 160, 130, ICE, tl, WT(30, 'magnetar')), cues: [[wordT(30, 'magnetar'), 'dun']] });
shot(A(31), (tl, d, t) => { space(t, { density: 1.0 }); supernova(960, 540, clamp(tl / Math.max(2.5, d - 0.3), 0, 1), t); vig(); },
  { ui: (tl) => { tag('A MASSIVE STAR', 960, 120, tl, 0.2, { size: 48, bg: '#fff' }); tag('SUPERNOVA', 960, 960, tl, WT(31, 'supernova'), { size: 60, bg: ROSE, col: '#fff' }); }, cues: [[A(31) + 0.2, 'rise'], [wordT(31, 'supernova'), 'crash']] });
shot(A(32), (tl, d, t) => { space(t, { density: 0.9 }); const k = ss(0.2, 2.0, tl); COS.glow(960, 540, lerp(500, 120, k), '#ff9a5c', 0.3 * (1 - k)); COS.planet(960, 540, lerp(260, 70, easeIO(k)), P_NS, { light: LIGHT_L, spin: t * 20, ink: null }); vig(); },
  { ui: (tl) => { tag('NEUTRON STAR', 960, 120, tl, WT(32, 'neutron'), { size: 56, bg: ICE }); tag('> THE SUN\'S MASS', 600, 900, tl, WT(32, 'mass'), { size: 46, bg: YEL }); tag('≈ CITY-SIZED', 1340, 900, tl, WT(32, 'city'), { size: 46, bg: '#fff' }); }, cues: [[A(32) + 0.2, 'whooshes'], [wordT(32, 'neutron'), 'pop'], [wordT(32, 'mass'), 'pop'], [wordT(32, 'city'), 'pop']] });
shot(A(33), (tl, d, t) => { space(t, { density: 0.9 }); magnetar(960, 560, 70, t, { alpha: ss(0.2, 1.2, tl) }); vig(); }, { ui: (tl) => tag('EXTREME MAGNETIC FIELD', 960, 120, tl, WT(33, 'magnetic'), { size: 54, bg: ICE }), cues: [[wordT(33, 'magnetic'), 'sparkle']] });
shot(A(34), (tl, d, t) => { space(t, { density: 0.9 }); magnetar(960, 560, 80, t); vig(); }, { cam: [[960, 560, 1.0], [960, 560, 1.25]], ui: (tl) => tag('STRONGEST KNOWN', 960, 120, tl, WT(34, 'strongest'), { size: 60, bg: YEL }), cues: [[wordT(34, 'strongest'), 'ding']] });
shot(A(35), (tl, d, t) => { space(t, { density: 0.9 }); const u = clamp((tl - WT(35, 'snaps')) / 2.2, 0, 1); magnetar(960, 600, 70, t, { snap: u }); vig(); },
  { ui: (tl) => tag('ONE IDEA: THE FIELD SNAPS', 960, 120, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[wordT(35, 'snaps'), 'crash'], [wordT(35, 'burst'), 'sparkle']] });
shot(A(36), (tl, d, t) => { space(t, { density: 0.9 }); magnetar(700, 600, 60, t, { snap: clamp(tl / 2.5, 0, 1) }); packet(1100 + tl * 160, 420, { len: 380, ang: -0.1 }); vig(); }, { cues: [[A(36) + 0.1, 'sparkle']] });
shot(A(37), (tl, d, t) => { space(t, { density: 0.8 }); dwarf(1300, 540, 220, { t }); magnetar(520, 560, 55, t); COS.arrow(ctx, 680, 560, 1060, 545, { col: '#fff', lw: 8 }); vig(); }, { ui: (tl) => tag('DATA POINT TO: A YOUNG MAGNETAR', 960, 120, tl, WT(37, 'young'), { size: 50, bg: MINT }), cues: [[wordT(37, 'young'), 'ding']] });
shot(A(38), (tl, d, t) => { space(t, { density: 0.9 }); const u = ss(0.2, 2.6, tl), a = t * 2.2 * (1 + 3 * u), R = lerp(260, 70, u); [0, Math.PI].forEach(p => COS.planet(960 + Math.cos(a + p) * R, 540 + Math.sin(a + p) * R * 0.5, 46, P_NS, { light: LIGHT_L, ink: null })); vig(); },
  { ui: (tl) => tag('IDEA 2: TWO NEUTRON STARS COLLIDE', 960, 120, tl, WT(38, 'collision'), { size: 48, bg: '#fff' }), cues: [[A(38) + 0.2, 'whooshes'], [wordT(38, 'collision'), 'pop']] });
shot(A(39), (tl, d, t) => { space(t, { density: 0.9 }); const a = t * 3; [0, Math.PI].forEach(p => COS.planet(960 + Math.cos(a + p) * 140, 560 + Math.sin(a + p) * 70, 46, P_NS, { light: LIGHT_L, ink: null, alpha: 0.5 })); stamp(960, 560, 1.2, 'VERY UNLIKELY', ROSE, -0.1, tl, WT(39, 'unlikely')); vig(); },
  { ui: (tl) => tag('MANISHA CALEB · LEAD RESEARCHER', 960, 110, tl, 0.2, { size: 42, bg: '#fff' }), cues: [[wordT(39, 'unlikely'), 'stamp']] });
shot(A(40), (tl, d, t) => { space(t, { density: 0.8 }); magnetar(960, 560, 55, t, { alpha: 0.6 }); vig(); }, { ui: (tl) => tag('XAVIER PROCHASKA · CO-AUTHOR', 960, 120, tl, WT(40, 'xavier'), { size: 44, bg: '#fff' }), cues: [[wordT(40, 'xavier'), 'pop']] });
shot(A(41), (tl, d, t) => { bgPlain('#16203a', '#060a14'); withT(960, 500, -0.02, pop(tl, 0.2), () => { rrect(-700, -200, 1400, 400, 30); shape('#f6f2ea', INK, 7); text('"We observationalists can only', 0, -50, 64, INK, 900, 'center', null); text('kill models, never prove them."', 0, 50, 64, INK, 900, 'center', null); text('— J. Xavier Prochaska', 300, 150, 38, '#555', 900, 'center', null); }); },
  { cues: [[A(41) + 0.2, 'paper']] });
shot(A(42), (tl, d, t) => { space(t, { density: 0.8 }); magnetar(960, 560, 60, t); vig(); }, { ui: (tl) => { tag('BEST SUSPECT', 700, 940, tl, WT(42, 'best'), { size: 54, bg: MINT }); tag('NOT A CLOSED CASE', 1260, 940, tl, WT(42, 'closed'), { size: 54, bg: '#fff' }); }, cues: [[wordT(42, 'best'), 'pop'], [wordT(42, 'closed'), 'pop']] });

// ================================================================ THE JOURNEY (43-66)
const TL_Y = 980;
function journeyBar(tl, u, marks) { ctx.save(); ctx.globalAlpha = 0.95; timeline(260, TL_Y, 1400, u, { marks: marks || [] }); ctx.restore(); }
shot(A(43), (tl, d, t) => { deep(t, { drift: 30 }); packet(800, 520, { len: 500 }); }, { ui: (tl) => titleCard('THE JOURNEY', tl, 0, 1.3, '#2F6FD6'), cues: [[A(43), 'sting']] });
shot(A(44), (tl, d, t) => { space(t, { density: 0.7 }); dwarf(480, 520, 220, { t, burst: clamp(tl / 2.4, 0, 1) }); packet(700 + Math.max(0, tl - 1.2) * 260, 500, { len: 420 }); journeyBar(tl, 0, [[3, 'DEPARTS', FL, pop(tl, WT(44, 'three'))]]); vig(0.4); },
  { ui: (tl) => tag('UNIVERSE AGE ≈ 3 BILLION YEARS', 1160, 120, tl, WT(44, 'three'), { size: 46, bg: '#fff' }), cues: [[A(44) + 0.1, 'sparkle'], [wordT(44, 'three'), 'pop']] });
shot(A(45), (tl, d, t) => { space(t, { density: 0.6 }); timeline(260, 560, 1400, 0, { marks: [[3, 'DEPARTS', FL, 1]] }); const k = ss(0.4, 2.0, tl); rrect(260 + 1400 * 3 / 13.8, 520, 1400 * 10.8 / 13.8 * k, 80, 20); ctx.fillStyle = 'rgba(255,196,107,0.25)'; ctx.fill(); vig(0.4); },
  { ui: (tl) => bigText('≈ 80% OF COSMIC HISTORY', 1060, 360, 90, FL, tl, WT(45, 'eighty')), cues: [[A(45) + 0.4, 'slide'], [wordT(45, 'eighty'), 'dun']] });
shot(A(46), (tl, d, t) => { deep(t, { drift: 120 }); packet(960, 540, { len: 640 }); journeyBar(tl, 0.12 + tl * 0.01); }, { cues: [[A(46) + 0.2, 'whoosh']] });
shot(A(47), (tl, d, t) => { space(t, { density: 0.8 }); const k = ss(0, d, tl); galaxy(700 + 120 * k, 470, 220, { seed: 12, rot: 0.4 + k * 0.6, tilt: 0.5 }); galaxy(1260 - 140 * k, 600, 180, { seed: 13, rot: -0.8 - k * 0.5, tilt: 0.65, alpha: 0.9 }); packet(200 + tl * 180, 880, { len: 420, k: 0.7 }); journeyBar(tl, 0.2 + tl * 0.01); vig(0.4); },
  { ui: (tl) => tag('GALAXIES FORM AND MERGE', 960, 110, tl, 0.3, { size: 50, bg: '#fff' }), cues: [[A(47) + 0.3, 'whooshes']] });
shot(A(48), (tl, d, t) => { space(t, { density: 1.4, neb: 0.6, hues: ['#a8453a', '#a83a7a'] }); const r = rnd(48); for (let i = 0; i < 8; i++) { const x = 200 + r() * 1520, y = 120 + r() * 700; if (i % 2) supernova(x, y, clamp((tl - i * 0.35) / 2.2, 0, 1) * 0.9, t); else COS.star(x, y, 14 + r() * 12, { t, alpha: ss(i * 0.3, i * 0.3 + 0.6, tl) }); } journeyBar(tl, 0.28 + tl * 0.01); vig(0.4); },
  { ui: (tl) => tag('STARS: BORN AND DYING', 960, 110, tl, 0.3, { size: 50, bg: '#fff' }), cues: [[A(48) + 0.4, 'sparkle'], [A(48) + 1.4, 'sparkle']] });
shot(A(49), (tl, d, t) => { deep(t, { drift: 40 }); const k = ss(0.2, Math.max(1.5, d - 0.4), tl); ctx.save(); ctx.beginPath(); for (let x = 120; x <= 1800; x += 4) { const f = lerp(0.05, 0.05 / (1 + 2.1 * k), (x - 120) / 1680); const yy = 540 + 90 * Math.sin((x - 120) * f * (1 + 0 * k)); x === 120 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.strokeStyle = FL; ctx.lineWidth = 8; ctx.stroke(); ctx.restore(); journeyBar(tl, 0.36 + tl * 0.01); vig(0.4); },
  { ui: (tl) => tag('SPACE EXPANDS → THE WAVES STRETCH', 960, 160, tl, WT(49, 'stretching'), { size: 50, bg: ICE }), cues: [[wordT(49, 'stretching'), 'slide']] });
shot(A(50), (tl, d, t) => { space(t, { density: 0.9 }); nebulaCollapse(960, 500, ss(0.3, d + 0.6, tl), t); journeyBar(tl, 0.5, [[9.2, 'SUN', YEL, pop(tl, 0.3)]]); vig(0.4); },
  { ui: (tl) => tag('MORE THAN 5 BILLION YEARS INTO THE TRIP', 960, 110, tl, WT(50, 'five'), { size: 46, bg: '#fff' }), cues: [[wordT(50, 'five'), 'pop'], [A(50) + 0.6, 'rise']] });
shot(A(51), (tl, d, t) => { space(t, { density: 0.9 }); COS.star(960, 500, 120 * ss(0, 0.8, tl) + 20, { t }); journeyBar(tl, 0.55, [[9.2, 'SUN', YEL, 1]]); vig(0.4); }, { ui: (tl) => bigText('OUR SUN', 960, 160, 110, YEL, tl, WT(51, 'sun')), cues: [[wordT(51, 'sun'), 'ding']] });
shot(A(52), (tl, d, t) => { space(t, { density: 0.9 }); COS.star(200, 380, 110, { t }); earthAt(1150, 520, 250 * ss(0, 1.2, tl) + 10, t, { light: COS.light(-165, 10) }); journeyBar(tl, 0.57, [[9.2, 'SUN + EARTH', YEL, 1]]); vig(0.4); }, { ui: (tl) => bigText('EARTH', 1150, 860, 90, ICE, tl, WT(52, 'earth')), cues: [[wordT(52, 'earth'), 'pop']] });
shot(A(53), (tl, d, t) => { deep(t, { drift: 140 }); packet(980, 520, { len: 700 }); journeyBar(tl, 0.62 + tl * 0.02, [[9.2, 'SUN + EARTH', YEL, 1]]); }, { cues: [[A(53) + 0.1, 'whoosh']] });
shot(A(54), (tl, d, t) => { space(t, { density: 0.7 }); earthAt(960, 520, 330, t, { light: COS.light(-160, 15) }); const r = rnd(54); for (let i = 0; i < 18; i++) { const a = r() * TAU, rr = r() * 280; const x = 960 + Math.cos(a) * rr, y = 520 + Math.sin(a) * rr; const k = pop(tl, 0.3 + i * 0.08); if (k <= 0) continue; COS.glow(x, y, 20 * Math.min(1, k), MINT, 0.6); } journeyBar(tl, 0.75, [[9.2, 'EARTH', YEL, 1]]); vig(0.4); },
  { ui: (tl) => tag('LIFE APPEARS', 960, 110, tl, 0.3, { size: 54, bg: MINT }), cues: [[A(54) + 0.3, 'sparkle']] });
shot(A(55), (tl, d, t) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1c1436'); g.addColorStop(0.6, '#c2603a'); g.addColorStop(1, '#f0a050'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); COS.glow(1400, 700, 220, '#ffd090', 0.6);
  const sx = lerp(400, 1250, ss(WT(55, 'disappear') - 0.6, WT(55, 'disappear') + 0.2, tl)), sy = lerp(-50, 620, ss(WT(55, 'disappear') - 0.6, WT(55, 'disappear') + 0.2, tl)); if (tl > WT(55, 'disappear') - 0.6) { packet(sx, sy, { len: 300, ang: 0.75, k: 0.8 }); } if (tl > WT(55, 'disappear') + 0.2) COS.impactFlash(1250, 640, clamp((tl - WT(55, 'disappear') - 0.2) / 1.2, 0, 1), {});
  ctx.fillStyle = '#0c0a10'; ctx.fillRect(0, 820, W, 300); dino(560, 820, 1.1); dino(980, 822, 0.7, -1); dino(300, 824, 0.5); journeyBar(tl, 0.98, [[13.8 - 0.066, 'DINOSAURS', ROSE, 1]]); },
  { ui: (tl) => tag('THE DINOSAURS RISE AND FALL', 960, 110, tl, 0.3, { size: 50, bg: '#fff' }), cues: [[A(55) + 0.3, 'pop'], [wordT(55, 'disappear'), 'crash']] });
shot(A(56), (tl, d, t) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#34507a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); COS.starfield(56, { density: 0.8, twinkleT: t }); ctx.fillStyle = '#121418'; ctx.fillRect(0, 820, W, 300); dish(960, 830, 1.3, { el: -0.6 }); journeyBar(tl, 0.995); },
  { ui: (tl) => tag('THE FIRST RADIO TELESCOPES', 960, 110, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(56) + 0.3, 'clang']] });
shot(A(57), (tl, d, t) => { deep(t, { drift: 160 }); packet(1100, 520, { len: 760 }); journeyBar(tl, 0.998); }, { ui: (tl) => tag('STILL ON ITS WAY', 960, 160, tl, 0.3, { size: 56, bg: FL }), cues: [[A(57) + 0.1, 'whoosh']] });
shot(A(58), (tl, d, t) => { deep(t, { drift: 50 }); web(t, { alpha: ss(0.2, 2.0, tl) * 0.8, drift: 20 }); packet(900, 540, { len: 520 }); vig(0.5); }, { ui: (tl) => tag('NOT A PERFECT VACUUM', 960, 120, tl, WT(58, 'vacuum'), { size: 54, bg: '#fff' }), cues: [[wordT(58, 'vacuum'), 'pop']] });
shot(A(59), (tl, d, t) => { deep(t, { drift: 30 }); web(t, { alpha: 1, drift: 20 }); vig(0.5); }, { cam: [[960, 540, 1.0], [960, 540, 1.12]], ui: (tl) => tag('A THIN FOG OF GAS', 960, 120, tl, WT(59, 'fog'), { size: 56, bg: ICE }), cues: [[wordT(59, 'fog'), 'sparkle']] });
shot(A(60), (tl, d, t) => { deep(t, { drift: 30 }); web(t, { alpha: 0.7, drift: 20 }); packet(1100, 540, { len: 520, spread: ss(0.4, 2.8, tl) }); vig(0.5); },
  { ui: (tl) => { tag('HIGH FREQUENCIES: AHEAD', 1300, 880, tl, WT(60, 'higher'), { size: 42, bg: '#b9a4ff' }); tag('LOW: SLOWED MORE', 620, 880, tl, WT(60, 'lower'), { size: 42, bg: '#ff9a7a' }); }, cues: [[A(60) + 0.4, 'slide'], [wordT(60, 'lower'), 'pop'], [wordT(60, 'higher'), 'pop']] });
shot(A(61), (tl, d, t) => { bgPlain('#121a32', '#04070f'); waterfall(360, 160, 1200, 740, ss(0.2, 2.0, tl)); }, { ui: (tl) => tag('SMEARED OUT', 960, 1020, tl, 0.3, { size: 46, bg: YEL }), cues: [[A(61) + 0.2, 'slide']] });
shot(A(62), (tl, d, t) => { bgPlain('#121a32', '#04070f'); waterfall(360, 160, 1200, 740, 1); const k = ss(WT(62, 'low'), WT(62, 'low') + 0.6, tl); if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([16, 12]); line(470, 860, 1440, 860, 6, ROSE); ctx.restore(); } },
  { ui: (tl) => { tag('HIGH NOTES FIRST', 820, 110, tl, WT(62, 'high'), { size: 44, bg: '#b9a4ff' }); tag('LOW NOTES TRAIL', 1300, 1020, tl, WT(62, 'low'), { size: 44, bg: '#ff9a7a' }); }, cues: [[wordT(62, 'high'), 'pop'], [wordT(62, 'low'), 'pop']] });
shot(A(63), (tl, d, t) => { bgPlain('#121a32', '#04070f'); waterfall(360, 160, 1200, 740, 1); },
  { ui: (tl) => tag('DELAY → HOW MUCH GAS', 960, 1020, tl, WT(63, 'gas'), { size: 50, bg: YEL }), cues: [[wordT(63, 'gas'), 'ding']] });
shot(A(64), (tl, d, t) => { space(t, { density: 0.6 }); cluster(1100, 520, 420, t); packet(300 + tl * 150, 860, { len: 440, ang: -0.05 }); vig(0.4); }, { cam: [[1100, 520, 1.1], [960, 540, 1.0]], ui: (tl) => tag('THE VIRGO CLUSTER', 960, 110, tl, WT(64, 'virgo'), { size: 56, bg: '#fff' }), cues: [[wordT(64, 'virgo'), 'pop']] });
shot(A(65), (tl, d, t) => { space(t, { density: 1.0 }); galaxy(960, 560, 520, { seed: 5, rot: -0.3, tilt: 0.42, t, spin: 0.01 }); packet(300 + tl * 260, 380, { len: 420, ang: 0.15 }); vig(0.4); }, { ui: (tl) => tag('OUR MILKY WAY', 960, 110, tl, WT(65, 'milky'), { size: 56, bg: '#fff' }), cues: [[wordT(65, 'milky'), 'pop']] });
shot(A(66), (tl, d, t) => { space(t, { density: 0.9 }); earthAt(1000, 560, 330, t, { light: COS.light(-160, 15) }); const u = ss(0.4, 2.2, tl); packet(lerp(-200, 760, u), lerp(240, 480, u), { len: 520, ang: 0.25 }); if (u >= 1) flash(760, 480, clamp((tl - 2.2) / 1.2, 0, 1), { r: 120 }); journeyBar(tl, 1); vig(0.4); },
  { ui: (tl) => tag('4 MARCH 2024: ARRIVAL', 960, 110, tl, WT(66, 'fourth'), { size: 54, bg: YEL }), cues: [[wordT(66, 'fourth'), 'pop'], [A(66) + 2.2, 'sparkle']] });

// ================================================================ THE CATCH (67-80)
shot(A(67), (tl, d, t) => { karoo(t); vig(0.5); }, { cam: [[960, 700, 1.2], [960, 560, 1.0]], ui: (tl) => { titleCard('THE CATCH', tl, 0, 1.3, '#2a8a5a'); tag('MeerKAT · 64 DISHES', 960, 110, tl, WT(67, 'sixty'), { size: 56, bg: YEL }); }, cues: [[A(67), 'sting'], [wordT(67, 'sixty'), 'pop']] });
shot(A(68), (tl, d, t) => { karoo(t, { el: -0.7 }); vig(0.5); }, { cam: [[700, 760, 1.5], [800, 740, 1.6]], ui: (tl) => tag('AN ORDINARY NIGHT', 960, 110, tl, 0.3, { size: 54, bg: '#fff' }), cues: [[A(68) + 0.3, 'pop']] });
shot(A(69), (tl, d, t) => { bgPlain('#121a32', '#04070f'); rrect(260, 200, 1400, 600, 24); shape('#0a0f1e', '#cfd8ea', 5); const r = rnd(69); ctx.save(); rrect(260, 200, 1400, 600, 24); ctx.clip(); for (let i = 0; i < 1200; i++) { const x = 260 + r() * 1400, y = 200 + r() * 600; ctx.fillStyle = `rgba(120,160,220,${0.1 + 0.25 * r()})`; ctx.fillRect(x, y, 3, 3); } const sc = 260 + ((tl * 380) % 1400); line(sc, 200, sc, 800, 4, MINT); ctx.restore(); if (tl > 2.0) { const k = pop(tl, 2.0); withT(1180, 500, 0, k, () => { circle(0, 0, 70); ctx.strokeStyle = YEL; ctx.lineWidth = 6; ctx.stroke(); }); COS.glow(1180, 500, 40, FL, 0.8); } },
  { ui: (tl) => { tag('MeerTRAP: WATCHING IN REAL TIME', 960, 110, tl, WT(69, 'meertrap'), { size: 50, bg: MINT }); tag('BURST!', 1180, 640, tl, 2.0, { size: 46, bg: YEL }); }, cues: [[wordT(69, 'meertrap'), 'pop'], [A(69) + 2.0, 'ding']] });
shot(A(70), (tl, d, t) => { karoo(t); const r = rnd(70); ctx.save(); for (let i = 0; i < 10; i++) { const x = 100 + r() * 1700, y = 820 + r() * 150; const k = ss(0.2, 1.8, tl); line(x, y - 120, lerp(x, 1500, k), lerp(y - 120, 180, k), 3, 'rgba(124,242,176,0.7)'); } ctx.restore(); if (tl > 1.8) { COS.glow(1500, 180, 60, FL, 0.8); } vig(0.4); },
  { ui: (tl) => tag('MANY DISHES → A PRECISE POSITION', 960, 110, tl, WT(70, 'precisely'), { size: 48, bg: '#fff' }), cues: [[A(70) + 0.2, 'slide'], [wordT(70, 'precisely'), 'ding']] });
shot(A(71), (tl, d, t) => { space(t, { density: 1.6 }); const k = ss(0.2, 1.4, tl); circle(960, 540, lerp(500, 60, k)); ctx.strokeStyle = MINT; ctx.lineWidth = 6; ctx.stroke(); COS.glow(960, 540, 30, FL, 0.7); vig(); }, { ui: (tl) => tag('THE ADDRESS', 960, 960, tl, WT(71, 'address'), { size: 60, bg: MINT }), cues: [[A(71) + 0.2, 'whooshes'], [wordT(71, 'address'), 'pop']] });
shot(A(72), (tl, d, t) => { space(t, { density: 1.6 }); circle(960, 540, 60); ctx.strokeStyle = MINT; ctx.lineWidth = 6; ctx.stroke(); qmark(960, 540, 0.9, tl, 0.4, YEL); vig(); }, { ui: (tl) => tag('NOW: FIND THE HOUSE', 960, 960, tl, WT(72, 'house'), { size: 56, bg: YEL }), cues: [[wordT(72, 'house'), 'boing']] });
shot(A(73), (tl, d, t) => { summit(t, { beam: ss(0.2, 1.4, tl) }); vig(0.4); }, { ui: (tl) => tag('THE BIGGEST GROUND TELESCOPES', 960, 110, tl, 0.3, { size: 50, bg: '#fff' }), cues: [[A(73) + 0.3, 'crank']] });
shot(A(74), (tl, d, t) => { summit(t, { beam: 1, s: 1.25 }); vig(0.4); }, { cam: [[960, 700, 1.0], [960, 680, 1.15]], ui: (tl) => { tag('KECK · HAWAII', 960, 110, tl, WT(74, 'keck'), { size: 56, bg: '#fff' }); tag('MIRROR: 10 METRES', 960, 220, tl, WT(74, 'ten'), { size: 46, bg: YEL }); }, cues: [[wordT(74, 'keck'), 'pop'], [wordT(74, 'ten'), 'pop']] });
shot(A(75), (tl, d, t) => { bgPlain('#121a32', '#04070f'); exposure(220, 220, 700, 520, t, { cross: 1, label: 'VISIBLE', seed: 75 }); exposure(1000, 220, 700, 520, t, { cross: pop(tl, WT(75, 'near')), label: 'NEAR INFRARED', seed: 76, ir: 1 }); }, { cues: [[A(75) + 0.2, 'pop'], [wordT(75, 'near'), 'pop']] });
shot(A(76), (tl, d, t) => { bgPlain('#121a32', '#04070f'); exposure(560, 160, 800, 600, t, { cross: 1, seed: 75 }); }, { ui: (tl) => tag('XAVIER PROCHASKA', 960, 900, tl, 0.3, { size: 46, bg: '#fff' }), cues: [[A(76) + 0.3, 'hmm']] });
shot(A(77), (tl, d, t) => { bgPlain('#121a32', '#04070f'); exposure(560, 160, 800, 600, t, { cross: 1, crossCol: ROSE, seed: 75 }); }, { ui: (tl) => { stamp(960, 460, 1.1, 'NOTHING TO SEE', ROSE, -0.1, tl, WT(77, 'nothing')); tag('"There was simply nothing to see."', 960, 900, tl, 0.2, { size: 44, bg: '#f6f2ea' }); }, cues: [[wordT(77, 'nothing'), 'stamp']] });
shot(A(78), (tl, d, t) => { space(t, { density: 1.1 }); jwst(960, 560, lerp(0.7, 1.0, ss(0, d, tl)), t); vig(0.4); }, { ui: (tl) => tag('JAMES WEBB SPACE TELESCOPE', 960, 110, tl, WT(78, 'james'), { size: 54, bg: YEL }), cues: [[wordT(78, 'james'), 'sparkle']] });
shot(A(79), (tl, d, t) => { space(t, { density: 1.1 }); jwst(560, 600, 0.75, t); exposure(1060, 260, 700, 520, t, { seed: 75, ir: 1, density: 0.9 }); vig(0.4); }, { ui: (tl) => { tag('INFRARED', 1410, 880, tl, WT(79, 'infrared'), { size: 46, bg: ROSE, col: '#fff' }); tag('BUILT FOR FAINT, EARLY LIGHT', 960, 110, tl, WT(79, 'faint'), { size: 50, bg: '#fff' }); }, cues: [[wordT(79, 'infrared'), 'pop'], [wordT(79, 'faint'), 'pop']] });
shot(A(80), (tl, d, t) => { bgPlain('#121a32', '#04070f'); exposure(560, 160, 800, 600, t, { seed: 75, ir: 1, gal: ss(WT(80, 'galaxy') - 0.4, WT(80, 'galaxy') + 0.6, tl), galR: 70, cross: 1 }); }, { cam: [[960, 460, 1.0], [960, 460, 1.25]], ui: (tl) => tag('A GALAXY', 960, 900, tl, WT(80, 'galaxy'), { size: 60, bg: MINT }), cues: [[wordT(80, 'galaxy'), 'ding']] });

// ================================================================ THE HOME (81-93)
shot(A(81), (tl, d, t) => { space(t, { density: 0.7 }); dwarf(960, 540, 300, { t }); vig(); }, { cam: [[960, 540, 0.85], [960, 540, 1.05]], ui: (tl) => titleCard('THE HOME', tl, 0, 1.3, '#a03a8a'), cues: [[A(81), 'sting']] });
shot(A(82), (tl, d, t) => { space(t, { density: 0.7 }); dwarf(960, 540, 320, { t }); vig(); }, { ui: (tl) => tag('A SURPRISE', 960, 960, tl, WT(82, 'surprised'), { size: 56, bg: YEL }), cues: [[wordT(82, 'surprised'), 'pop']] });
shot(A(83), (tl, d, t) => { space(t, { density: 0.7 }); dwarf(1440, 560, 220, { t, alpha: 0.9 }); withT(700, 520, -0.02, pop(tl, 0.2), () => { rrect(-560, -260, 1120, 520, 30); shape('#f6f2ea', INK, 7); ['"The galaxy hosting this burst is', 'surprisingly small, metal-poor and', 'undergoing a very active episode', 'of star formation."'].forEach((s, i) => text(s, 0, -150 + i * 84, 50, INK, 900, 'center', null)); text('— Laura Driessen, University of Sydney', 0, 200, 34, '#555', 900, 'center', null); }); },
  { cues: [[A(83) + 0.2, 'paper'], [wordT(83, 'small'), 'pop'], [wordT(83, 'metal'), 'pop'], [wordT(83, 'active'), 'pop']] });
shot(A(84), (tl, d, t) => { space(t, { density: 0.8 }); galaxy(760, 540, 560, { seed: 5, rot: -0.3, tilt: 0.42, t, spin: 0.01 }); const k = pop(tl, WT(84, 'dwarf')); if (k > 0) dwarf(1600, 380, 70 * Math.min(1, k), { t }); vig(0.4); },
  { ui: (tl) => { tag('THE MILKY WAY', 760, 940, tl, WT(84, 'milky'), { size: 46, bg: '#fff' }); tag('DWARF GALAXY', 1600, 520, tl, WT(84, 'dwarf'), { size: 42, bg: MINT }); tag('(SIZES ILLUSTRATIVE)', 1600, 1010, tl, 0.6, { size: 28, bg: '#fff' }); }, cues: [[wordT(84, 'dwarf'), 'pop'], [wordT(84, 'milky'), 'pop']] });
shot(A(85), (tl, d, t) => { bgPlain('#16203a', '#060a14'); [['H', 'HYDROGEN', 560], ['He', 'HELIUM', 960]].forEach(([s, n, x], i) => { const k = pop(tl, WT(85, i ? 'helium' : 'hydrogen')); if (k <= 0) return; withT(x, 500, 0, k, () => { rrect(-150, -170, 300, 340, 26); shape(i ? '#ffd9a0' : '#9fd8ff', INK, 7); text(s, 0, 10, 150, INK, 900, 'center', null); text(n, 0, 130, 34, INK, 900, 'center', null); }); });
  const k2 = pop(tl, WT(85, 'metal')); if (k2 > 0) withT(1440, 520, 0, k2 * 0.7, () => { rrect(-150, -170, 300, 340, 26); shape('#5a6070', INK, 7); text('Fe', 0, 10, 130, '#c8ccd4', 900, 'center', null); text('"METALS": FEW', 0, 130, 30, '#fff', 900, 'center', null); }); },
  { ui: (tl) => tag('METAL-POOR', 960, 120, tl, 0.2, { size: 56, bg: YEL }), cues: [[wordT(85, 'hydrogen'), 'pop'], [wordT(85, 'helium'), 'pop']] });
shot(A(86), (tl, d, t) => { space(t, { density: 0.7 }); dwarf(960, 540, 340, { t }); const r = rnd(86); for (let i = 0; i < 12; i++) { const a = r() * TAU, rr = r() * 260; const k = pop(tl, 0.3 + i * 0.15); if (k > 0) COS.star(960 + Math.cos(a) * rr, 540 + Math.sin(a) * rr * 0.7, 10 * Math.min(k, 1), { t }); } vig(); },
  { ui: (tl) => tag('BUILDING NEW STARS FAST', 960, 960, tl, WT(86, 'building'), { size: 54, bg: PINK }), cues: [[A(86) + 0.3, 'sparkle'], [A(86) + 1.3, 'sparkle']] });
shot(A(87), (tl, d, t) => { space(t, { density: 1.0, neb: 0.5, hues: ['#a83a8a', '#3a6aa8'] }); COS.star(700, 520, 70, { t, core: '#f0f6ff', mid: '#9fc4ff', out: '#5a8aff' }); COS.star(1280, 600, 26, { t, alpha: 0.9 }); vig(); },
  { ui: (tl) => { tag('THE BIGGEST STARS', 700, 860, tl, WT(87, 'biggest'), { size: 46, bg: ICE }); tag('DIE YOUNG', 700, 960, tl, WT(87, 'young'), { size: 46, bg: ROSE, col: '#fff' }); }, cues: [[wordT(87, 'biggest'), 'pop'], [wordT(87, 'young'), 'pop']] });
shot(A(88), (tl, d, t) => { space(t, { density: 1.0 }); const u = clamp(tl / 2.6, 0, 1); if (u < 0.85) supernova(960, 540, u, t); if (tl > 2.0) magnetar(960, 540, 50 * ss(2.0, 2.6, tl) + 1, t, { alpha: ss(2.0, 2.6, tl) }); vig(); },
  { ui: (tl) => tag('A NEWBORN MAGNETAR', 960, 960, tl, WT(88, 'magnetars'), { size: 54, bg: ICE }), cues: [[A(88) + 0.3, 'crash'], [wordT(88, 'magnetars'), 'sparkle']] });
shot(A(89), (tl, d, t) => { space(t, { density: 0.7 }); dwarf(960, 540, 320, { t }); magnetar(1010, 520, 14, t, { alpha: 0.9 }); vig(); }, { ui: (tl) => { tag('THE GALAXY', 600, 940, tl, 0.3, { size: 46, bg: MINT }); tag('✓ FITS THE MAGNETAR IDEA', 1220, 940, tl, WT(89, 'fits'), { size: 46, bg: '#fff' }); }, cues: [[wordT(89, 'fits'), 'ding']] });
shot(A(90), (tl, d, t) => { space(t, { density: 0.8, neb: 0.35, hues: ['#5a3aa8', '#3a4fa8'] }); dwarf(960, 540, 240, { t, alpha: 0.6 }); vig(); }, { ui: (tl) => take(tl), cues: [[A(90) + 0.15, 'ding']] });
shot(A(91), (tl, d, t) => { bgPlain('#121a32', '#04070f'); exposure(160, 200, 700, 520, t, { cross: 1, crossCol: ROSE, seed: 75, label: 'GROUND: NOTHING' }); exposure(1060, 200, 700, 520, t, { seed: 75, ir: 1, gal: ss(0.6, 2.0, tl), galR: 70, cross: 1, label: 'FOUND BY FOLLOWING THE FLASH' }); },
  { ui: (tl) => take(tl), cues: [[A(91) + 0.6, 'sparkle']] });
shot(A(92), (tl, d, t) => { space(t, { density: 0.8 }); dwarf(960, 540, 260, { t, burst: 0.2 }); vig(); }, { ui: (tl) => { take(tl); tag('NOT JUST THE DISCOVERY…', 960, 960, tl, 0.3, { size: 52, bg: '#fff' }); }, cues: [[A(92) + 0.3, 'pop']] });
shot(A(93), (tl, d, t) => { space(t, { density: 0.7 }); dwarf(1400, 540, 180, { t }); const k = ss(0.1, 0.8, tl); ctx.save(); ctx.globalAlpha = 0.5 * k; poly([[120, 520], [120, 560], [1400, 640], [1400, 440]]); const g = ctx.createLinearGradient(120, 0, 1400, 0); g.addColorStop(0, 'rgba(255,236,190,0.9)'); g.addColorStop(1, 'rgba(255,196,107,0.05)'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); COS.glow(120, 540, 90, FL, 0.8); vig(); },
  { ui: (tl) => { take(tl); bigText('THE FLASHLIGHT', 960, 900, 110, FL, tl, WT(93, 'flashlight')); }, cues: [[wordT(93, 'flashlight'), 'dun']] });

// ================================================================ WHY IT MATTERS (94-109)
shot(A(94), (tl, d, t) => { deep(t, { drift: 20 }); web(t, { alpha: 0.9, drift: 10 }); }, { ui: (tl) => titleCard('WHY IT MATTERS', tl, 0, 1.3, '#C8312B'), cues: [[A(94), 'sting']] });
shot(A(95), (tl, d, t) => { space(t, { density: 0.8 }); const r = rnd(95); for (let i = 0; i < 6; i++) galaxy(220 + i * 300, 420 + (i % 2) * 220, 110, { seed: 400 + i, n: 380, rot: r() * 3, tilt: 0.5 }); qmark(960, 540, 1.6, tl, WT(95, 'find'), YEL); vig(0.4); },
  { ui: (tl) => tag('ORDINARY MATTER: A LARGE SHARE MISSING', 960, 110, tl, WT(95, 'share'), { size: 46, bg: '#fff' }), cues: [[wordT(95, 'find'), 'boing'], [wordT(95, 'share'), 'pop']] });
shot(A(96), (tl, d, t) => { deep(t, { drift: 20 }); web(t, { alpha: ss(0.2, 1.6, tl), drift: 10 }); vig(0.4); }, { cam: [[960, 540, 1.2], [960, 540, 1.0]], ui: (tl) => tag('HIDING IN THE GAS BETWEEN GALAXIES', 960, 110, tl, WT(96, 'hiding'), { size: 48, bg: ICE }), cues: [[A(96) + 0.2, 'sparkle']] });
shot(A(97), (tl, d, t) => { deep(t, { drift: 20 }); web(t, { alpha: 0.8, drift: 10 }); packet(200 + tl * 280, 540, { len: 500, spread: 0.6 }); vig(0.4); }, { ui: (tl) => tag('ONE OF THE FEW WAYS TO MEASURE IT', 960, 110, tl, WT(97, 'measure'), { size: 48, bg: YEL }), cues: [[wordT(97, 'measure'), 'pop']] });
shot(A(98), (tl, d, t) => { deep(t, { drift: 20 }); web(t, { alpha: 0.8, drift: 10 }); [[300, 0.0], [520, 0.5], [150, 1.0]].forEach(([y, o], i) => packet(((tl * 420 + i * 600) % 2300) - 200, y + i * 160, { len: 420, spread: 0.3 + i * 0.25, k: 0.8 })); vig(0.4); },
  { ui: (tl) => tag('EVERY BURST: A GAS READING', 960, 110, tl, 0.3, { size: 50, bg: '#fff' }), cues: [[A(98) + 0.3, 'whooshes']] });
shot(A(99), (tl, d, t) => { bgPlain('#121a32', '#04070f'); scaleBalance(960, 560, 1.1, Math.sin(clamp(tl / 1.5, 0, 1) * Math.PI * 1.5) * 0.12 * (1 - ss(1.5, 3, tl)), tl, t); }, { ui: (tl) => tag('"WEIGHING" THE UNIVERSE', 960, 110, tl, WT(99, 'weigh'), { size: 56, bg: YEL }), cues: [[wordT(99, 'weigh'), 'clang']] });
shot(A(100), (tl, d, t) => { bgPlain('#121a32', '#04070f'); distDots(t, tl); }, { ui: (tl) => tag('BURSTS WITH KNOWN HOMES: MOSTLY NEAR', 960, 110, tl, 0.3, { size: 46, bg: '#fff' }), cues: [[A(100) + 0.3, 'pop']] });
shot(A(101), (tl, d, t) => { bgPlain('#121a32', '#04070f'); distDots(t, 9, { far: 0.3 }); }, { ui: (tl) => { tag('FRB 20240304B', 1500, 360, tl, 0.5, { size: 44, bg: FL }); tag('≈ 80% OF COSMIC HISTORY', 960, 900, tl, WT(101, 'eighty'), { size: 50, bg: YEL }); }, cues: [[A(101) + 0.3, 'ding'], [wordT(101, 'eighty'), 'pop']] });
shot(A(102), (tl, d, t) => { deep(t, { drift: 30 }); web(t, { alpha: 0.7, drift: 15 }); packet(400 + tl * 200, 540, { len: 900, spread: 0.4 }); vig(0.4); }, { ui: (tl) => tag('ONE OF THE DEEPEST READINGS YET', 960, 110, tl, WT(102, 'deepest'), { size: 50, bg: YEL }), cues: [[wordT(102, 'deepest'), 'ding']] });
shot(A(103), (tl, d, t) => { bgPlain('#16203a', '#060a14'); withT(960, 520, 0.03, pop(tl, 0.2), () => { rrect(-330, -380, 660, 760, 20); shape('#f6f2ea', INK, 7); rrect(-330, -380, 660, 140, 20); shape('#8a1c2a', INK, 7); text('SCIENCE', 0, -290, 72, '#fff', 900, 'center', null); text('OCTOBER 2026', 0, -150, 44, INK, 900, 'center', null); for (let i = 0; i < 7; i++) line(-260, -60 + i * 60, 260 - (i % 3) * 60, -60 + i * 60, 8, '#b8b2a8'); }); }, { ui: (tl) => tag('PEER-REVIEWED', 960, 1000, tl, WT(103, 'published'), { size: 46, bg: MINT }), cues: [[A(103) + 0.2, 'paper'], [wordT(103, 'published'), 'stamp']] });
shot(A(104), (tl, d, t) => { karoo(t, { mw: 0.9 }); vig(0.4); }, { cam: [[960, 560, 1.0], [960, 600, 1.12]], ui: (tl) => tag('BIGGER TELESCOPES ARE COMING', 960, 110, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(104) + 0.3, 'rise']] });
shot(A(105), (tl, d, t) => { ska(t, { tl }); vig(0.4); }, { ui: (tl) => { tag('SQUARE KILOMETRE ARRAY', 960, 110, tl, WT(105, 'square'), { size: 54, bg: YEL }); tag('SOUTH AFRICA + AUSTRALIA', 960, 220, tl, WT(105, 'australia') - 0.6, { size: 44, bg: '#fff' }); }, cues: [[wordT(105, 'square'), 'pop'], [A(105) + 0.4, 'clang']] });
shot(A(106), (tl, d, t) => { deep(t, { drift: 30 }); packet(900, 540, { len: 700 }); }, { ui: (tl) => take(tl), cues: [[A(106) + 0.15, 'ding']] });
shot(A(107), (tl, d, t) => { space(t, { density: 0.6 }); timeline(260, 560, 1400, ss(0.2, 2.0, tl), { marks: [[3, 'DEPARTS', FL, 1]] }); vig(0.4); }, { ui: (tl) => { take(tl); bigText('10 BILLION+ YEARS', 960, 340, 100, FL, tl, WT(107, 'ten')); }, cues: [[wordT(107, 'ten'), 'dun']] });
shot(A(108), (tl, d, t) => { karoo(t); flash(1300, 210, clamp((tl - WT(108, 'over')) / 1.2, 0, 1), { r: 140 }); vig(); }, { ui: (tl) => { take(tl); tag('OVER IN MILLISECONDS', 960, 1000, tl, WT(108, 'milliseconds'), { size: 50, bg: YEL }); }, cues: [[wordT(108, 'over'), 'sparkle']] });
shot(A(109), (tl, d, t) => { bgPlain('#16203a', '#060a14');
  iconCard(380, 520, pop(tl, WT(109, 'dishes')), 'THE RIGHT DISHES', () => { dish(0, 110, 0.75, {}); });
  iconCard(960, 520, pop(tl, WT(109, 'software')), 'THE RIGHT SOFTWARE', () => { waterfall(-150, -110, 300, 210, 1); });
  iconCard(1540, 520, pop(tl, WT(109, 'space')), 'A SPACE TELESCOPE', () => { jwst(0, 20, 0.3, t); }); },
  { ui: (tl) => take(tl), cues: [[wordT(109, 'dishes'), 'pop'], [wordT(109, 'software'), 'pop'], [wordT(109, 'space'), 'pop']] });

// ================================================================ ENDING (110-115)
shot(A(110), (tl, d, t) => { space(t, { density: 0.6 }); flash(960, 540, clamp(tl / 2.4, 0, 1), { r: 260 }); vig(); }, { ui: (tl) => tag('A FEW THOUSANDTHS OF A SECOND', 960, 940, tl, 0.3, { size: 52, bg: YEL }), cues: [[A(110) + 0.05, 'sparkle']] });
shot(A(111), (tl, d, t) => { deep(t, { drift: 100 }); web(t, { alpha: 0.5, drift: 40 }); packet(960, 540, { len: 700 }); vig(); }, { ui: (tl) => tag('10 BILLION+ YEARS ON THE ROAD', 960, 160, tl, 0.3, { size: 52, bg: FL }), cues: [[A(111) + 0.1, 'whoosh']] });
shot(A(112), (tl, d, t) => { karoo(t); flash(1300, 210, clamp((tl - 0.3) / 3.0, 0, 1), { r: 160 }); vig(); }, { cam: [[960, 520, 1.0], [960, 560, 1.06]], ui: (tl) => { tag('OLDER THAN THE SUN', 560, 110, tl, WT(112, 'sun'), { size: 44, bg: '#fff' }); tag('OLDER THAN THE EARTH', 1360, 110, tl, WT(112, 'earth'), { size: 44, bg: '#fff' }); }, cues: [[wordT(112, 'sun'), 'pop'], [wordT(112, 'earth'), 'pop']] });
shot(A(113), (tl, d, t) => { space(t, { density: 0.8 }); magnetar(1400, 540, 50, t, { alpha: 0.7 }); qmark(700, 520, 2.4, tl, 0.15, YEL); vig(0.5); }, { ui: (tl) => tag('A QUESTION FOR YOU', 700, 930, tl, 0.3, { size: 54, bg: '#fff' }), cues: [[A(113) + 0.15, 'boing']] });
shot(A(114), (tl, d, t) => { bgPlain('#16203a', '#060a14'); [['A MAGNETAR?', 'magnetar', 560, '#3B6FD6'], ['SOMETHING NEW?', 'nobody', 1360, '#5b3fb8']].forEach(([lab, w, x, col]) => { const k = pop(tl, WT(114, w)); if (k <= 0) return; withT(x, 540, 0, k, () => { rrect(-330, -170, 660, 340, 30); shape(col, INK, 7); text(lab, 0, 10, 64, '#fff', 900, 'center', INK, 9); }); }); },
  { cues: [[wordT(114, 'magnetar'), 'pop'], [wordT(114, 'nobody'), 'pop']] });
shot(A(115), (tl, d, t) => { bgPlain('#16203a', '#060a14'); [['A MAGNETAR?', 560, '#3B6FD6'], ['SOMETHING NEW?', 1360, '#5b3fb8']].forEach(([lab, x, col]) => withT(x, 470, 0, 0.9, () => { rrect(-330, -170, 660, 340, 30); shape(col, INK, 7); text(lab, 0, 10, 64, '#fff', 900, 'center', INK, 9); })); },
  { ui: (tl) => tag('💬 TELL ME IN THE COMMENTS', 960, 880, tl, 0.2, { size: 56, bg: YEL }), cues: [[A(115) + 0.2, 'pop']] });

window.MUSIC_SEC = { fall: S(29) - 0.1, death: S(73) - 0.1, callback: S(78) - 0.1 };
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
