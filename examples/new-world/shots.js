// "A New World Was Just Found Beyond Pluto" — 2026 ED138. Facts from 2+ sources (see description.txt).
// Spectacle lane: scale + discovery. Neutral tone. Every body is a shaded COS sphere, one light per frame.
const SHOTS = [], CUES = [];
const A = (i, d = -0.06) => S(i) + d;
const WT = (i, w) => wordT(i, w) - A(i);
function shot(a, draw, o = {}) { SHOTS.push({ a, draw, cam: o.cam, ui: o.ui }); (o.cues || []).forEach(c => CUES.push(c)); if (!o.noWhoosh) CUES.push([a, 'whoosh']); }
const YEL = '#FFD24A', ROSE = '#FF6B5A', ICE = '#9FD8FF', EDC = '#E58A5E', MINT = '#7CF2B0';
const geoL = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), clamp(u, 0, 1)));
const D2R = Math.PI / 180;

// ---------------------------------------------------------------- bodies (custom COS presets)
const P_ED = { kind: 'rock', base: '#8d6a57', atmo: null, soft: 0.08, spec: 0.35, tilt: 0.12,
  craters: { seed: 4242, n: 210, big: 0.055, dark: '#3e2a20', lit: '#e2bca0' }, maria: { seed: 4250, n: 12, col: '#5a3a2c', a: 0.6 }, glow: '#b07050' };
const P_PLUTO = { kind: 'rock', base: '#c6a487', atmo: null, soft: 0.08, spec: 0.35, tilt: 0.1,
  craters: { seed: 5151, n: 50, big: 0.04, dark: '#6b4c39', lit: '#ecd8bf' }, maria: { seed: 5160, n: 7, col: '#7a5038', a: 0.55 }, glow: null };
const P_CERES = { kind: 'rock', base: '#7f7a74', atmo: null, soft: 0.07, spec: 0.4, tilt: 0.08,
  craters: { seed: 6161, n: 140, big: 0.05, dark: '#3f3b37', lit: '#c4beb4' }, maria: { seed: 6170, n: 5, col: '#5d5853', a: 0.35 }, glow: null };
const P_ERIS = { kind: 'rock', base: '#d8d4cc', atmo: null, soft: 0.08, spec: 0.5, tilt: 0.1,
  craters: { seed: 7171, n: 50, big: 0.035, dark: '#9a948a', lit: '#f4f1ea' }, maria: { seed: 7180, n: 4, col: '#b8b2a8', a: 0.3 }, glow: null };
const P_MAKE = { kind: 'rock', base: '#b88d6c', atmo: null, soft: 0.08, spec: 0.4, tilt: 0.1,
  craters: { seed: 8181, n: 60, big: 0.04, dark: '#6d4c36', lit: '#e3c2a2' }, maria: { seed: 8190, n: 6, col: '#8a5d40', a: 0.4 }, glow: null };
const P_NEPT = { kind: 'gas', base: '#3d6fd0', atmo: '#9cc4ff', atmoThick: 0.05, halo: 0.6, soft: 0.38, spec: 0.5, tilt: 0.1,
  pal: ['#4a7fe0', '#3563c4', '#5b8fea', '#2c55ad', '#6aa0f0', '#3f72d4'], bandSeed: 181, spots: [[-20, 40, 0.09, 0.04, '#22408a']], glow: '#5a8ae8' };
const P_URAN = { kind: 'gas', base: '#8fd2dc', atmo: '#c8f2f6', atmoThick: 0.05, halo: 0.5, soft: 0.4, spec: 0.5, tilt: 0.1,
  pal: ['#97d8e0', '#86c8d2', '#a6e2e8', '#7cbcc8'], bandSeed: 191, spots: [], glow: '#9fe0ea' };
const P_SAT = { kind: 'gas', base: '#d9c08e', atmo: '#f2e2b8', atmoThick: 0.04, halo: 0.4, soft: 0.4, spec: 0.5, tilt: 0.1,
  pal: ['#e2cb98', '#cdb27c', '#ead8ae', '#c4a26c', '#dcc08a'], bandSeed: 201, spots: [], glow: '#e8d29e' };
const P_VENUS = { kind: 'gas', base: '#e6cf98', atmo: '#fff0c8', atmoThick: 0.05, halo: 0.5, soft: 0.45, spec: 0.4, tilt: 0.1,
  pal: ['#ead6a2', '#e0c68a', '#f0dfb2'], bandSeed: 211, spots: [], glow: '#f4dfa8' };
const P_MERC = { kind: 'rock', base: '#9a928a', atmo: null, soft: 0.06, spec: 0.4, tilt: 0.05,
  craters: { seed: 9191, n: 80, big: 0.05, dark: '#5a544e', lit: '#cfc8be' }, glow: null };
const PRE = { ed: P_ED, pluto: P_PLUTO, ceres: P_CERES, eris: P_ERIS, make: P_MAKE, nept: P_NEPT, uran: P_URAN, sat: P_SAT, venus: P_VENUS, merc: P_MERC };
const LIGHT_L = COS.light(-152, 34);        // the Sun is off to the left in every close-up
function body(key, x, y, r, o = {}) {
  const pre = PRE[key] || key;
  return COS.planet(x, y, r, pre, { light: o.light || LIGHT_L, spin: o.spin || 0, alpha: o.alpha, ink: o.ink === undefined ? 'rgba(10,14,28,0.5)' : o.ink, rings: o.rings, clouds: o.clouds, lights: o.lights });
}
const ed = (x, y, r, t, o = {}) => body('ed', x, y, r, Object.assign({ spin: 40 + t * 5 }, o));
// light vector from a body toward a point (the Sun on a map)
const lightTo = (x, y, sx, sy) => COS.light(Math.atan2(sy - y, sx - x) / D2R, 6);

// ---------------------------------------------------------------- backgrounds
function space(t, o = {}) {
  sky(o.top || '#02040b', o.bot || '#081226');
  if (o.neb) COS.nebula(o.nebSeed || 3, { t, alpha: o.neb });
  if (o.mw) COS.milkyWay({ y: o.mwY === undefined ? 470 : o.mwY, rot: o.mwRot === undefined ? -0.28 : o.mwRot, thick: o.mwThick || 230, alpha: o.mw, seed: 31 });
  COS.starfield(o.seed || 7, { density: o.density || 1, twinkleT: t, drift: (o.drift || 0) * t, alpha: o.starA });
}
function sunPoint(x, y, k, t) {   // the Sun seen from 46 AU: a blazing point, no disc
  COS.glow(x, y, 260 * k, '#ffe7b0', 0.45); COS.glow(x, y, 90 * k, '#fff4d6', 0.8);
  ctx.save(); ctx.strokeStyle = 'rgba(255,246,220,0.55)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  const L = 150 * k * (1 + 0.04 * Math.sin(t * 2));
  ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L * 0.8); ctx.lineTo(x, y + L * 0.8); ctx.stroke(); ctx.restore();
  circle(x, y, 5 * k); shape('#fffdf6', null);
}
function vig(k = 0.55) { COS.vignette(k); }

// ---------------------------------------------------------------- solar system map (linear AU)
const PLAN = [['MERCURY', 0.39, 'merc', 5, -0.55], ['VENUS', 0.72, 'venus', 8, 0.5], ['EARTH', 1, 'earth', 8, -0.3], ['MARS', 1.52, 'mars', 6, 0.34],
  ['JUPITER', 5.2, 'jupiter', 20, -0.2], ['SATURN', 9.54, 'sat', 17, 0.15], ['URANUS', 19.2, 'uran', 12, -0.1], ['NEPTUNE', 30.1, 'nept', 12, 0.07], ['PLUTO', 39.5, 'pluto', 6, -0.075]];
const ED_AU = 46, ED_TH = 0.035;
function mapPos(au, th, ppa, sx = 110, sy = 560) { return [sx + au * ppa * Math.cos(th), sy + au * ppa * Math.sin(th)]; }
function solarMap(t, ppa, o = {}) {
  const sx = 110, sy = 560;
  space(t, { density: 0.75 });
  ctx.save(); ctx.lineWidth = 2;
  PLAN.forEach(p => { const r = p[1] * ppa; if (r < 24 || r > 4000) return; ctx.beginPath(); ctx.arc(sx, sy, r, -1.0, 1.0); ctx.strokeStyle = `rgba(150,185,255,${p[0] === 'PLUTO' ? 0.22 : 0.16})`; ctx.stroke(); });
  if (o.edOrbit) { ctx.setLineDash([10, 12]); ctx.beginPath(); ctx.arc(sx, sy, ED_AU * ppa, -1.0, 1.0); ctx.strokeStyle = `rgba(255,150,110,${0.45 * o.edOrbit})`; ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore();
  if (o.kb) { const R = rnd(77); ctx.save(); for (let i = 0; i < 1100; i++) { const au = 30 + R() * 20, th = (R() - 0.5) * 1.6, a = (0.2 + 0.45 * R()) * o.kb; const x = sx + au * ppa * Math.cos(th), y = sy + au * ppa * Math.sin(th); if (x < -10 || x > W + 10 || y < -10 || y > H + 10) { continue; } ctx.fillStyle = `rgba(185,212,255,${Math.min(1, a * 1.4)})`; ctx.fillRect(x, y, 3.2, 3.2); } ctx.restore(); }
  COS.star(sx, sy, clamp(ppa * 0.06, 16, 44), { t });
  { const step = ppa > 150 ? 1 : ppa > 60 ? 5 : 10, yR = 1010; ctx.save(); ctx.globalAlpha = 0.85; line(sx, yR, Math.min(W - 40, sx + 60 * ppa), yR, 4, '#9fb3d6');
    for (let au = 0; au * ppa < W; au += step) { const x = sx + au * ppa; if (x > W - 40) break; line(x, yR - 12, x, yR + 12, 4, '#9fb3d6'); if (au > 0 && x < W - 90) text(au + ' AU', x, yR - 30, 24, '#cfd8ea', 800, 'center', null); } ctx.restore(); }
  const pos = {};
  PLAN.forEach(p => { const [x, y] = mapPos(p[1], p[4], ppa, sx, sy); pos[p[0]] = [x, y]; if (x > W + 40 || p[1] * ppa < 30) return;
    const r = p[3] * (o.bs || 1.9); const pr = p[2] === 'earth' || p[2] === 'mars' || p[2] === 'jupiter' ? p[2] : PRE[p[2]];
    COS.planet(x, y, r, pr, { light: lightTo(x, y, sx, sy), lights: false, rings: p[0] === 'SATURN' ? { tilt: 0.32 } : undefined, ink: 'rgba(10,14,28,0.5)' }); });
  if (o.ed) { const [x, y] = mapPos(ED_AU, ED_TH, ppa, sx, sy); pos.ED = [x, y]; COS.glow(x, y, 46, '#ff9a6a', 0.35 * o.ed); body('ed', x, y, 7, { light: lightTo(x, y, sx, sy), alpha: o.ed });
    ctx.save(); ctx.globalAlpha = o.ed; circle(x, y, 26 + 4 * Math.sin(t * 4)); ctx.strokeStyle = EDC; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
  return pos;
}
function mapLabel(name, p, tl, t0, o = {}) { if (!p) return; tag(name, p[0] + (o.dx || 0), p[1] + (o.dy === undefined ? -62 : o.dy), tl, t0, { size: Math.round((o.size || 30) * 1.25), bg: o.bg || '#fff', col: o.col }); }

// ---------------------------------------------------------------- size comparisons (true relative sizes)
const KM = { edLo: 600, edHi: 1500, ceres: 940, pluto: 2377, moon: 3475, eris: 2326, make: 1430 };
function ghost(x, y, r, col = '#fff', a = 0.8, dash = [14, 12]) { ctx.save(); ctx.setLineDash(dash); circle(x, y, r); ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
function edRange(x, y, kmpp, t, o = {}) {      // ED138 drawn at its largest estimate, with the smallest as a dashed ring
  const rHi = KM.edHi / kmpp / 2, rLo = KM.edLo / kmpp / 2;
  ed(x, y, rHi, t, { alpha: o.alpha });
  ghost(x, y, rLo, o.loCol || '#fff', o.loA === undefined ? 0.85 : o.loA);
  return { rHi, rLo };
}
function sizeCaption(txt, sub, x, y, tl, t0, col = '#fff') { const k = pop(tl, t0); if (k <= 0) return; withT(x, y, 0, k, () => { text(txt, 0, 0, 44, col, 900, 'center', INK, 9); if (sub) text(sub, 0, 46, 30, '#cfd8ea', 800, 'center', INK, 6); }); }

// ---------------------------------------------------------------- props
function observatory(x, y, s, t, o = {}) {      // a generic survey-telescope dome on a ridge (not a likeness of any logo)
  withT(x, y, 0, s, () => {
    const g1 = ctx.createLinearGradient(-260, 0, 260, 0); g1.addColorStop(0, '#6d7686'); g1.addColorStop(0.5, '#b9c1cf'); g1.addColorStop(1, '#4a5260');
    rrect(-260, -120, 520, 120, 6); ctx.fillStyle = g1; ctx.fill(); ctx.strokeStyle = '#1a1e28'; ctx.lineWidth = 5; ctx.stroke();
    rrect(-170, -250, 340, 140, 6); ctx.fillStyle = g1; ctx.fill(); ctx.stroke();
    const g2 = ctx.createRadialGradient(-70, -360, 20, 0, -250, 230); g2.addColorStop(0, '#f2f5fa'); g2.addColorStop(0.55, '#aeb7c6'); g2.addColorStop(1, '#4d5564');
    ctx.beginPath(); ctx.arc(0, -250, 180, Math.PI, 0); ctx.closePath(); ctx.fillStyle = g2; ctx.fill(); ctx.stroke();
    const op = o.open === undefined ? 1 : o.open;
    ctx.save(); ctx.beginPath(); ctx.arc(0, -250, 180, Math.PI, 0); ctx.closePath(); ctx.clip(); rrect(-30 * op, -440, 60 * op, 200, 4); ctx.fillStyle = '#0b1020'; ctx.fill(); ctx.restore();
    for (let i = 0; i < 5; i++) { rrect(-230 + i * 95, -90, 50, 40, 4); shape(i % 2 ? '#ffd98a' : '#9fb3d1', null); }
    if (o.beam) { ctx.save(); ctx.globalAlpha = 0.18 * o.beam; ctx.beginPath(); ctx.moveTo(-30, -360); ctx.lineTo(30, -360); ctx.lineTo(260, -1400); ctx.lineTo(80, -1400); ctx.closePath(); ctx.fillStyle = '#bcd6ff'; ctx.fill(); ctx.restore(); }
  });
}
function ridge(yBase, col = '#05070d') { ctx.beginPath(); ctx.moveTo(-50, H + 50); ctx.lineTo(-50, yBase + 60); [[200, yBase + 10], [420, yBase - 40], [640, yBase - 70], [860, yBase - 110], [1080, yBase - 120], [1300, yBase - 70], [1520, yBase - 20], [1740, yBase + 30], [1980, yBase + 70]].forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(1980, H + 50); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
function nightScene(t, o = {}) { space(t, { mw: o.mw === undefined ? 1 : o.mw, mwY: 330, mwRot: -0.42, mwThick: 260, density: 1.3 }); ridge(880, '#04060b'); }
function sensor(x, y, R, tl, o = {}) {        // a mosaic of square detectors inside a round focal plane
  ctx.save(); circle(x, y, R + 18); shape('#20252f', '#8a93a6', 6); circle(x, y, R); ctx.clip();
  ctx.fillStyle = '#0d1018'; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
  const n = 13, c = (2 * R) / n, rr = rnd(5);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const cx = x - R + i * c, cy = y - R + j * c; const d = Math.hypot(cx + c / 2 - x, cy + c / 2 - y); if (d > R + c * 0.2) continue;
    const on = o.wave === undefined ? 1 : ss(0, 0.25, o.wave - d / R * 0.8); const v = rr();
    ctx.fillStyle = `rgb(${Math.round(lerp(40, 70 + 60 * v, on))},${Math.round(lerp(48, 90 + 70 * v, on))},${Math.round(lerp(70, 140 + 80 * v, on))})`; ctx.fillRect(cx + 3, cy + 3, c - 6, c - 6); }
  ctx.restore();
}
function frame(x, y, w, h, label, t, o = {}) {   // a telescope exposure: star field in a box
  rrect(x - 8, y - 8, w + 16, h + 16, 10); shape('#11151f', '#cfd6e4', 5);
  ctx.save(); rrect(x, y, w, h, 4); ctx.clip(); ctx.fillStyle = '#04060c'; ctx.fillRect(x, y, w, h);
  COS.starfield(o.seed || 21, { box: [x, y, w, h], density: o.density || 0.55, twinkleT: o.tw ? t : undefined });
  if (o.dot) { const [dx, dy] = o.dot; circle(x + dx, y + dy, o.dotR || 3.2); shape(o.dotCol || '#ffd0b0', null); if (o.ring) { circle(x + dx, y + dy, 26); ctx.strokeStyle = o.ringCol || ROSE; ctx.lineWidth = 4; ctx.stroke(); } }
  ctx.restore();
  if (label) text(label, x + w / 2, y + h + 50, 36, '#fff', 900, 'center', INK, 7);
}
function thermo(x, y, s, level, col, tl) { withT(x, y, 0, s, () => { rrect(-34, -360, 68, 380, 34); shape('#f4f6fb', INK, 6); circle(0, 40, 62); shape('#f4f6fb', INK, 6); const h = 330 * level; rrect(-18, 10 - h, 36, h + 20, 18); shape(col, null); circle(0, 40, 46); shape(col, null); for (let i = 0; i < 7; i++) line(34, -320 + i * 50, 58, -320 + i * 50, 5); }); }
function terrain(t, o = {}) {          // the icy surface, Sun low on the left: long sharp shadows to the right
  const k = o.dim === undefined ? 1 : o.dim, hy = o.hy || 720;
  const g = ctx.createLinearGradient(0, hy - 40, 0, H); g.addColorStop(0, `rgba(${Math.round(92 * k)},${Math.round(74 * k)},${Math.round(68 * k)},1)`); g.addColorStop(1, `rgba(${Math.round(36 * k)},${Math.round(28 * k)},${Math.round(30 * k)},1)`);
  ctx.beginPath(); ctx.moveTo(-50, H + 50); ctx.lineTo(-50, hy + 10); for (let x = -50; x <= 1980; x += 60) ctx.lineTo(x, hy + 14 * Math.sin(x * 0.011) + 9 * Math.sin(x * 0.037 + 1)); ctx.lineTo(1980, H + 50); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  const r = rnd(31);
  for (let i = 0; i < 16; i++) { const x = r() * 2000 - 40, y = hy + 40 + r() * 320, s = (0.4 + r() * 1.1) * (0.4 + (y - hy) / 360);
    ctx.save(); ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.ellipse(x + 210 * s, y + 6, 240 * s, 16 * s, 0, 0, Math.PI * 2); ctx.fillStyle = '#07060a'; ctx.fill(); ctx.restore();   // shadow
    const bw = 64 * s * (0.8 + 0.5 * r()), bh = 46 * s * (0.7 + 0.6 * r());
    ctx.beginPath(); ctx.moveTo(x - bw, y); ctx.bezierCurveTo(x - bw * 1.05, y - bh * 0.9, x - bw * 0.3, y - bh * 1.25, x + bw * 0.25, y - bh * 1.05); ctx.bezierCurveTo(x + bw * 0.9, y - bh * 0.85, x + bw * 1.05, y - bh * 0.3, x + bw, y); ctx.closePath();
    const gr = ctx.createLinearGradient(x - bw, y - bh, x + bw, y); gr.addColorStop(0, `rgb(${Math.round(196 * k)},${Math.round(176 * k)},${Math.round(178 * k)})`); gr.addColorStop(0.45, `rgb(${Math.round(110 * k)},${Math.round(88 * k)},${Math.round(82 * k)})`); gr.addColorStop(1, `rgb(${Math.round(34 * k)},${Math.round(26 * k)},${Math.round(28 * k)})`); ctx.fillStyle = gr; ctx.fill(); }   // frost-lit on the Sun side
  for (let i = 0; i < 60; i++) { const x = r() * 1920, y = hy + 20 + r() * 340; ctx.fillStyle = `rgba(230,236,255,${0.25 * k * r()})`; ctx.fillRect(x, y, 3, 2); }
}
function blob(x, y, R, rough, t, seed = 3) {   // a lumpy body relaxing into a sphere
  const rr = rnd(seed), ph = [rr() * 6, rr() * 6, rr() * 6];
  ctx.beginPath(); for (let i = 0; i <= 90; i++) { const a = i / 90 * Math.PI * 2; const d = R * (1 + rough * (0.22 * Math.sin(2 * a + ph[0]) + 0.14 * Math.sin(3 * a + ph[1]) + 0.08 * Math.sin(5 * a + ph[2]))); const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.96; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath();
  const g = ctx.createRadialGradient(x - R * 0.45, y - R * 0.3, R * 0.1, x, y, R * 1.3); g.addColorStop(0, '#d9ad8e'); g.addColorStop(0.55, '#8d6a57'); g.addColorStop(1, '#2a1c16'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(10,14,28,0.6)'; ctx.lineWidth = 4; ctx.stroke();
}
function orbit3d(cx, cy, R, inc, el, o = {}) {   // a circle of radius R in a plane tilted by `inc` about the x axis, seen from elevation el
  const pts = [];
  for (let i = 0; i <= 120; i++) { const p = i / 120 * Math.PI * 2; const X = R * Math.cos(p) * Math.cos(inc), Y = R * Math.cos(p) * Math.sin(inc), Z = R * Math.sin(p); pts.push([cx + X, cy + Z * Math.sin(el) - Y * Math.cos(el), Z]); }
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = o.lw || 4;
  for (let i = 0; i < 120; i++) { const a = pts[i], b = pts[i + 1]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.strokeStyle = o.col || '#8fb6ff'; ctx.globalAlpha = (a[2] > 0 ? 1 : 0.35) * (o.alpha === undefined ? 0.8 : o.alpha); ctx.stroke(); }
  ctx.restore();
}
const pos3d = (cx, cy, R, inc, el, p) => { const X = R * Math.cos(p) * Math.cos(inc), Y = R * Math.cos(p) * Math.sin(inc), Z = R * Math.sin(p); return [cx + X, cy + Z * Math.sin(el) - Y * Math.cos(el), Z, Y]; };
function plane3d(cx, cy, R, el, a = 0.16) { ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, R, R * Math.sin(el), 0, 0, Math.PI * 2); const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, R); g.addColorStop(0, `rgba(120,170,255,${a * 1.4})`); g.addColorStop(1, `rgba(120,170,255,${a * 0.2})`); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = `rgba(160,200,255,${a * 2.2})`; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
function iconCard(x, y, k, label, draw) { if (k <= 0) return; withT(x, y, 0, k, () => { rrect(-250, -230, 500, 460, 30); shape('rgba(12,18,36,0.88)', '#cfd8ea', 5); ctx.save(); ctx.translate(0, -40); draw(); ctx.restore(); text(label, 0, 165, 42, '#fff', 900, 'center', INK, 8); }); }
function tracks(t, n, seed, o = {}) {   // detections linked into tracks: dots that line up across nights
  const r = rnd(seed); ctx.save();
  for (let i = 0; i < n; i++) { const x = r() * 1920, y = r() * 1080, a = r() * 6.28, l = 18 + r() * 40, br = r();
    const hi = o.hi !== undefined && i === o.hi;
    for (let j = 0; j < 4; j++) { const px = x + Math.cos(a) * l * j, py = y + Math.sin(a) * l * j; circle(px, py, hi ? 6 : 2.6); ctx.fillStyle = hi ? '#ffb38a' : `rgba(160,200,255,${0.35 + 0.4 * br})`; ctx.fill(); }
    if (o.link) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l * 3 * clamp(o.link, 0, 1), y + Math.sin(a) * l * 3 * clamp(o.link, 0, 1)); ctx.strokeStyle = hi ? '#ffb38a' : 'rgba(160,200,255,0.25)'; ctx.lineWidth = hi ? 4 : 1.5; ctx.stroke(); } }
  ctx.restore();
}

// ================================================================ HOOK
shot(0, (tl, d, t) => { space(t, { mw: 0.85, mwY: 560, mwRot: -0.2, density: 1.4, drift: 0.4 }); sunPoint(230, 300, 0.7, t); ed(1250, 600, lerp(150, 260, easeIO(tl / 6)), t); vig(); },
  { cam: [[960, 540, 1.0], [1060, 560, 1.12]], ui: (tl) => tag('4,000,000,000 MILES FROM THE SUN', 960, 110, tl, 0.6, { size: 50, bg: YEL }), cues: [[0.2, 'rise'], [0.6, 'pop']] });
shot(A(2), (tl, d, t) => { space(t, { density: 1.2, drift: 0.4 }); sunPoint(140, 220, 0.5, t); ed(960, 560, 380, t); vig(); },
  { cam: [[960, 540, 1.0], [960, 540, 1.06]], ui: (tl) => { bigText('2026 ED138', 960, 150, 120, '#fff', tl, WT(2, 'twenty')); tag('NEW WORLD', 960, 960, tl, WT(2, 'thirty'), { size: 52, bg: EDC, col: '#fff' }); }, cues: [[wordT(2, 'twenty'), 'dun'], [wordT(2, 'thirty'), 'pop']] });
shot(A(3), (tl, d, t) => { space(t, { density: 1.1 }); ed(960, 560, 360, t); const k = ss(0.3, 1.2, tl); ctx.save(); ctx.setLineDash([18, 12]); line(960 - 360 * k, 560, 960 + 360 * k, 560, 8, YEL); ctx.restore(); circle(960 - 360 * k, 560, 12); shape(YEL, INK, 4); circle(960 + 360 * k, 560, 12); shape(YEL, INK, 4); vig(); },
  { ui: (tl) => { tag('UP TO 930 MILES WIDE', 960, 120, tl, WT(3, 'nine'), { size: 58, bg: YEL }); tag('(1,500 KM)', 960, 960, tl, WT(3, 'miles'), { size: 40, bg: '#fff' }); }, cues: [[A(3) + 0.3, 'slide'], [wordT(3, 'nine'), 'pop']] });
shot(A(4), (tl, d, t) => { space(t, { density: 1.0, drift: 0.3 }); body('nept', 420, 620, 230, { spin: t * 4 }); ed(1450, 470, 120, t); vig(); },
  { cam: [[960, 540, 1.0], [1100, 520, 1.05]], ui: (tl) => { tag('NEPTUNE', 420, 920, tl, 0.2, { size: 44, bg: '#fff' }); tag('ONE OF THE LARGEST EVER FOUND OUT HERE', 1200, 130, tl, WT(4, 'largest'), { size: 44, bg: YEL }); }, cues: [[A(4) + 0.2, 'pop'], [wordT(4, 'largest'), 'ding']] });
shot(A(5), (tl, d, t) => { space(t, { density: 0.6 }); qmark(960, 520, 2.4, tl, 0.15, YEL); vig(); }, { ui: (tl) => tag('THE STRANGE PART', 960, 930, tl, 0.3, { size: 60, bg: ROSE, col: '#fff' }), cues: [[A(5) + 0.15, 'boing']] });
shot(A(6), (tl, d, t) => { bgPlain('#16203a', '#060a14'); [2016, 2019, 2022, 2026].forEach((yr, i) => { const k = pop(tl, 0.2 + i * 0.35); if (k <= 0) return; withT(300 + i * 440, 520 + (i % 2) * 40, (i - 1.5) * 0.04, k, () => { frame(-180, -170, 360, 300, String(yr), t, { seed: 21, dot: [180 + i * 12, 150 - i * 6], ring: i === 3 || tl > 2.4, dotR: 3 }); }); }); },
  { ui: (tl) => tag('IN TELESCOPE IMAGES SINCE 2016', 960, 110, tl, WT(6, 'twenty'), { size: 50, bg: YEL }), cues: [[A(6) + 0.2, 'pop'], [A(6) + 0.55, 'pop'], [A(6) + 0.9, 'pop'], [A(6) + 1.25, 'pop'], [wordT(6, 'twenty'), 'ding']] });
shot(A(7), (tl, d, t) => { space(t, { mw: 1.2, mwY: 540, mwRot: -0.12, mwThick: 320, density: 3.2 }); const x = 980 + tl * 6, y = 560; circle(x, y, 3.2); shape('#ffcfaf', null); const sx = 960 + Math.sin(tl * 1.3) * 520, sy = 540 + Math.cos(tl * 0.9) * 220; circle(sx, sy, 80); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; ctx.stroke(); line(sx - 110, sy, sx - 60, sy, 4, '#fff'); line(sx + 60, sy, sx + 110, sy, 4, '#fff'); vig(0.4); },
  { ui: (tl) => tag('HIDING IN FRONT OF THE MILKY WAY', 960, 110, tl, WT(7, 'milky'), { size: 50, bg: '#fff' }), cues: [[wordT(7, 'milky'), 'pop']] });
shot(A(8), (tl, d, t) => { nightScene(t); observatory(1180, 900, 0.9, t, { beam: ss(0.2, 1.2, tl) }); const k = ss(0.8, 2.4, tl); circle(1520 + 30 * k, 210 - 10 * k, 4); shape('#ffcfaf', null); for (let i = 0; i < 4; i++) { circle(1520 + 10 * i * k, 210 - 3.3 * i * k, 2.5); shape('rgba(255,207,175,0.4)', null); } vig(0.4); },
  { ui: (tl) => { ribbon('CHILE', tl, 0.2); tag('CAUGHT IT MOVING', 1520, 320, tl, WT(8, 'moving'), { size: 50, bg: ROSE, col: '#fff' }); }, cues: [[A(8) + 0.2, 'slide'], [wordT(8, 'moving'), 'ding']] });
shot(A(9), (tl, d, t) => { space(t, { density: 1.1 }); ed(960, 560, 300, t); vig(); }, { cam: [[960, 540, 1.0], [960, 540, 1.08]], ui: (tl) => { tag('THE NEXT DWARF PLANET?', 960, 130, tl, WT(9, 'dwarf'), { size: 58, bg: YEL }); }, cues: [[wordT(9, 'dwarf'), 'dun']] });
shot(A(10), (tl, d, t) => { bgPlain('#16203a', '#060a14');
  iconCard(380, 520, pop(tl, WT(10, 'far')), 'HOW FAR?', () => { line(-170, 0, 170, 0, 10, '#fff'); circle(-170, 0, 22); shape(YEL, INK, 4); circle(170, 0, 14); shape(EDC, INK, 4); });
  iconCard(960, 520, pop(tl, WT(10, 'big')), 'HOW BIG?', () => { circle(-70, 10, 90); shape('#c6a487', INK, 5); circle(110, 40, 55); shape(EDC, INK, 5); });
  iconCard(1540, 520, pop(tl, WT(10, 'stood')), 'WHAT IS IT LIKE?', () => { poly([[-180, 70], [-60, -10], [40, 40], [180, -30], [180, 90], [-180, 90]]); shape('#6b5650', INK, 5); circle(-120, -110, 14); shape('#fff6d8', null); }); },
  { cues: [[wordT(10, 'far'), 'pop'], [wordT(10, 'big'), 'pop'], [wordT(10, 'stood'), 'pop']] });

// ================================================================ HOW FAR?
shot(A(11), (tl, d, t) => { solarMap(t, 600, {}); }, { ui: (tl) => titleCard('HOW FAR?', tl, 0, 1.2, '#2F6FD6'), cues: [[A(11), 'sting']] });
shot(A(12), (tl, d, t) => { const p = solarMap(t, 600, {}); }, { ui: (tl) => tag('ASTRONOMICAL UNITS (AU)', 960, 110, tl, WT(12, 'astronomical'), { size: 54, bg: YEL }), cues: [[wordT(12, 'astronomical'), 'pop']] });
shot(A(13), (tl, d, t) => { const p = solarMap(t, 600, {}); const k = ss(0.3, 1.6, tl), e = p.EARTH; ctx.save(); line(110, 760, 110 + (e[0] - 110) * k, 760, 8, YEL); ctx.restore(); circle(110, 760, 10); shape(YEL, INK, 4); if (k > 0.98) { circle(e[0], 760, 10); shape(YEL, INK, 4); } },
  { ui: (tl) => { tag('1 AU', 460, 830, tl, 1.6, { size: 54, bg: YEL }); tag('≈ 93 MILLION MILES', 460, 940, tl, WT(13, 'ninety'), { size: 44, bg: '#fff' }); tag('EARTH', 760, 430, tl, 0.2, { size: 34, bg: '#fff' }); }, cues: [[A(13) + 0.3, 'slide'], [wordT(13, 'ninety'), 'pop']] });
shot(A(14), (tl, d, t) => { const ppa = geoL(600, 520, tl / 2); const p = solarMap(t, ppa, {}); mapLabel('MARS · 1.5 AU', p.MARS, tl, 0.3, { size: 34 }); mapLabel('EARTH', p.EARTH, tl, -1, { size: 28 }); }, { cues: [[A(14) + 0.3, 'pop']] });
shot(A(15), (tl, d, t) => { const ppa = geoL(520, 250, easeIO(tl / 1.4)); const p = solarMap(t, ppa, {}); mapLabel('JUPITER · 5 AU', p.JUPITER, tl, 1.0, { size: 34 }); mapLabel('MARS', p.MARS, tl, -1, { size: 26 }); }, { cues: [[A(15) + 1.0, 'pop']] });
shot(A(16), (tl, d, t) => { const ppa = geoL(250, 50, easeIO(tl / 4.5)); const p = solarMap(t, ppa, {}); mapLabel('SATURN · 10', p.SATURN, tl, WT(16, 'saturn'), { size: 30 }); mapLabel('URANUS · 19', p.URANUS, tl, WT(16, 'uranus'), { size: 30, dy: 50 }); mapLabel('NEPTUNE · 30 AU', p.NEPTUNE, tl, WT(16, 'thirty'), { size: 32, bg: YEL }); },
  { cues: [[wordT(16, 'saturn'), 'pop'], [wordT(16, 'uranus'), 'pop'], [wordT(16, 'thirty'), 'ding']] });
shot(A(17), (tl, d, t) => { const ppa = geoL(50, 34, easeIO(tl / 2.5)); const p = solarMap(t, ppa, { kb: ss(0.4, 2.0, tl) }); mapLabel('NEPTUNE', p.NEPTUNE, tl, -1, { size: 28 }); },
  { ui: (tl) => tag('THE KUIPER BELT', 1500, 130, tl, WT(17, 'kuiper'), { size: 56, bg: ICE }), cues: [[A(17) + 0.4, 'sparkle'], [wordT(17, 'kuiper'), 'pop']] });
shot(A(18), (tl, d, t) => { const p = solarMap(t, 34, { kb: 1 }); mapLabel('PLUTO · 40 AU', p.PLUTO, tl, WT(18, 'forty'), { size: 34, bg: YEL }); mapLabel('NEPTUNE', p.NEPTUNE, tl, -1, { size: 26, dy: 50 }); }, { cues: [[A(18) + 0.2, 'pop'], [wordT(18, 'forty'), 'ding']] });
shot(A(19), (tl, d, t) => { solarMap(t, 34, { kb: 0.7 }); ctx.save(); ctx.globalAlpha = 0.9; rrect(560, 300, 800, 420, 30); shape('rgba(8,12,26,0.9)', '#cfd8ea', 5); ctx.restore();
  const cx = 960, cy = 520; orbit3d(cx, cy, 150, 0, 0.5, { col: '#c6a487', alpha: 0.9, lw: 5 }); COS.star(cx, cy, 18, { t }); const u = clamp(tl / Math.max(1, d), 0, 1) * 0.37; const pp = pos3d(cx, cy, 150, 0, 0.5, Math.PI / 2 + u * Math.PI * 2); body('pluto', pp[0], pp[1], 18, { light: lightTo(pp[0], pp[1], cx, cy) });
  ctx.save(); ctx.lineWidth = 12; ctx.strokeStyle = YEL; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.ellipse(cx, cy, 150, 150 * Math.sin(0.5), 0, Math.PI / 2, Math.PI / 2 + u * Math.PI * 2); ctx.stroke(); ctx.restore(); },
  { ui: (tl) => { tag('DISCOVERED 1930', 960, 360, tl, WT(19, 'nineteen'), { size: 44, bg: '#fff' }); tag('NOT ONE FULL LAP YET', 960, 680, tl, WT(19, 'finished'), { size: 48, bg: YEL }); }, cues: [[wordT(19, 'nineteen'), 'pop'], [wordT(19, 'finished'), 'ding']] });
shot(A(20), (tl, d, t) => { const p = solarMap(t, 34, { kb: 1, ed: ss(0, 0.5, tl), edOrbit: 1 }); mapLabel('PLUTO', p.PLUTO, tl, -1, { size: 26, dy: 50 }); mapLabel('2026 ED138 · 46 AU', p.ED, tl, WT(20, 'forty'), { size: 32, bg: EDC, col: '#fff', dx: -60, dy: 80 }); },
  { cam: [[960, 540, 1.0], [1500, 560, 1.25]], cues: [[A(20) + 0.2, 'sparkle'], [wordT(20, 'forty'), 'ding']] });
shot(A(21), (tl, d, t) => { const p = solarMap(t, 34, { kb: 1, ed: 1, edOrbit: 1 }); const e = p.ED, k = ss(0.2, 1.8, tl); ctx.save(); ctx.setLineDash([16, 12]); line(130, 860, 130 + (e[0] - 130) * k, 860, 7, YEL); ctx.restore(); },
  { ui: (tl) => { tag('≈ 4.3 BILLION MILES', 960, 940, tl, WT(21, 'four'), { size: 60, bg: YEL }); }, cues: [[A(21) + 0.2, 'slide'], [wordT(21, 'four'), 'dun']] });
shot(A(22), (tl, d, t) => { const p = solarMap(t, 34, { kb: 1, ed: 1, edOrbit: 0.6 }); const pl = p.PLUTO, k = clamp(tl / Math.max(1, d - 0.3), 0, 1); const x = lerp(150, pl[0], easeIO(k)), y = lerp(560, pl[1], easeIO(k)); withT(x, y, -0.05, 0.9, () => { rrect(-26, -10, 52, 20, 4); shape('#e9e2d0', INK, 3); line(-26, 0, -60, -22, 4, '#cfc8b8'); line(26, 0, 60, -22, 4, '#cfc8b8'); circle(0, -20, 14); shape('#f4efe2', INK, 3); }); mapLabel('PLUTO', pl, tl, -1, { size: 26, dy: 50 }); },
  { ui: (tl) => { tag('NEW HORIZONS', 520, 130, tl, 0.3, { size: 48, bg: '#fff' }); tag('9.5 YEARS TO PLUTO', 1300, 130, tl, WT(22, 'nine'), { size: 48, bg: YEL }); }, cues: [[A(22) + 0.3, 'whoosh'], [wordT(22, 'nine'), 'pop']] });
shot(A(23), (tl, d, t) => { const p = solarMap(t, geoL(34, 34, 0), { kb: 1, ed: 1, edOrbit: 1 }); const pl = p.PLUTO, e = p.ED; const k = ss(0.1, 1.0, tl); line(pl[0] + 30, pl[1] + 90, pl[0] + 30 + (e[0] - pl[0]) * k, pl[1] + 90, 7, EDC); },
  { cam: [[960, 540, 1.0], [1450, 560, 1.5]], ui: (tl) => tag('…AND FARTHER STILL', 960, 130, tl, 0.2, { size: 56, bg: EDC, col: '#fff' }), cues: [[A(23) + 0.2, 'pop']] });
shot(A(24), (tl, d, t) => { const p = solarMap(t, 34, { kb: 0.8, ed: 1, edOrbit: 0.6 }); const e = p.EARTH, x2 = p.ED; const k = clamp(tl / Math.max(1, d), 0, 1); const x = lerp(e[0], x2[0], k), y = lerp(e[1], x2[1], k);
  ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < 14; i++) { const kk = clamp(k - i * 0.012, 0, 1); circle(lerp(e[0], x2[0], kk), lerp(e[1], x2[1], kk), 9 - i * 0.5); ctx.fillStyle = `rgba(255,246,200,${0.8 - i * 0.05})`; ctx.fill(); } ctx.restore(); COS.glow(x, y, 60, '#fff2b8', 0.6); },
  { ui: (tl, d) => { tag('LIGHT: 6+ HOURS', 960, 120, tl, WT(24, 'six'), { size: 58, bg: YEL }); clock(1720, 900, 0.8, tl * 3); }, cues: [[A(24) + 0.1, 'rise'], [wordT(24, 'six'), 'pop']] });
shot(A(25), (tl, d, t) => { bgPlain('#f2e6cf', '#d8c6a6'); [['BREAKFAST', 'send', 420, 0.35], ['AFTERNOON', 'arrive', 960, 0.0], ['EVENING', 'arrive', 1500, -0.35]].forEach(([lab, w, x], i) => { if (i === 2) return; const k = pop(tl, i === 0 ? WT(25, 'breakfast') : WT(25, 'afternoon')); if (k <= 0) return; withT(x, 500, 0, k, () => { clock(0, 0, 1.4, (i === 0 ? 7 : 13.4) * 2 * Math.PI); text(lab, 0, 230, 58, INK, 900, 'center', null); }); });
  const k = ss(WT(25, 'sent'), WT(25, 'afternoon'), tl); withT(lerp(560, 820, k), 360, 0, 1, () => { rrect(-60, -34, 120, 68, 12); shape('#fff', INK, 5); line(-60, -34, 0, 6, 5); line(60, -34, 0, 6, 5); }); },
  { ui: (tl) => tag('A MESSAGE AT LIGHT SPEED', 960, 110, tl, 0.2, { size: 50, bg: YEL }), cues: [[wordT(25, 'breakfast'), 'pop'], [wordT(25, 'afternoon'), 'ding']] });
shot(A(26), (tl, d, t) => { bgPlain('#3a2f58', '#141026'); [['BREAKFAST', 420], ['AFTERNOON', 960], ['EVENING', 1500]].forEach(([lab, x], i) => { const k = i < 2 ? 1 : pop(tl, WT(26, 'evening')); if (k <= 0) return; withT(x, 500, 0, k, () => { clock(0, 0, 1.4, [7, 13.4, 19.75][i] * 2 * Math.PI); text(lab, 0, 230, 58, '#fff', 900, 'center', INK, 8); }); }); const k = ss(0.1, WT(26, 'evening'), tl); withT(lerp(1100, 1360, k), 360, Math.PI, 1, () => { rrect(-60, -34, 120, 68, 12); shape('#fff', INK, 5); line(-60, -34, 0, 6, 5); line(60, -34, 0, 6, 5); }); },
  { ui: (tl) => tag('THE REPLY', 1230, 230, tl, 0.3, { size: 48, bg: '#fff' }), cues: [[A(26) + 0.3, 'pop'], [wordT(26, 'evening'), 'ding']] });

// ================================================================ HOW BIG?
shot(A(27), (tl, d, t) => { space(t); ed(960, 560, 300, t); vig(); }, { ui: (tl) => titleCard('HOW BIG?', tl, 0, 1.2, EDC), cues: [[A(27), 'sting']] });
shot(A(28), (tl, d, t) => { space(t); ed(960, 560, 300, t); qmark(1350, 360, 1.6, tl, 0.4, YEL); vig(); }, { ui: (tl) => tag('NOBODY KNOWS EXACTLY YET', 960, 960, tl, WT(28, 'nobody'), { size: 54, bg: '#fff' }), cues: [[A(28) + 0.4, 'boing']] });
shot(A(29), (tl, d, t) => { const k = easeIO(clamp(tl / 2.2, 0, 1)); space(t, { density: 1.5 }); if (k < 0.97) ed(960, 560, lerp(300, 3, k), t, { alpha: 1 - ss(0.75, 0.97, k) }); circle(960, 560, 3.4); shape('#ffd6bc', null); const kr = ss(1.6, 2.2, tl); if (kr > 0) { ctx.save(); ctx.globalAlpha = kr; circle(960, 560, 60); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([a, b]) => line(960 + a * 70, 560 + b * 70, 960 + a * 110, 560 + b * 110, 3, '#fff')); ctx.restore(); } },
  { ui: (tl) => tag('JUST A DOT OF LIGHT', 960, 860, tl, WT(29, 'dot'), { size: 54, bg: YEL }), cues: [[A(29) + 0.1, 'whoosh'], [wordT(29, 'dot'), 'pop']] });
shot(A(30), (tl, d, t) => { bgPlain('#16203a', '#060a14');
  iconCard(380, 520, pop(tl, WT(30, 'bright')), 'BRIGHTNESS', () => { COS.glow(0, 0, 120, '#ffe2b8', 0.8); circle(0, 0, 10); shape('#fff', null); });
  iconCard(960, 520, pop(tl, WT(30, 'far')), 'DISTANCE', () => { line(-170, 0, 170, 0, 8, '#fff'); text('46 AU', 0, -50, 50, YEL, 900, 'center', INK, 6); circle(-170, 0, 12); shape(YEL, null); circle(170, 0, 9); shape(EDC, null); });
  iconCard(1540, 520, pop(tl, WT(30, 'reflects')), 'REFLECTIVITY', () => { body('ed', 0, 10, 90, {}); COS.glow(70, -40, 60, '#fff', 0.5); }); },
  { ui: (tl) => tag('HOW TO WEIGH A DOT', 960, 110, tl, 0.2, { size: 50, bg: YEL }), cues: [[wordT(30, 'bright'), 'pop'], [wordT(30, 'far'), 'pop'], [wordT(30, 'reflects'), 'pop']] });
shot(A(31), (tl, d, t) => { space(t, { density: 0.8 }); const k1 = pop(tl, WT(31, 'dark')), k2 = pop(tl, WT(31, 'shiny'));
  if (k1 > 0) withT(560, 520, 0, k1, () => COS.planet(0, 0, 230, { kind: 'rock', base: '#3a2c26', soft: 0.1, spec: 0.2, craters: { seed: 11, n: 80, big: 0.05, dark: '#1d1512', lit: '#5a463c' } }, { light: LIGHT_L, ink: 'rgba(160,170,200,0.5)' }));
  if (k2 > 0) withT(1400, 520, 0, k2, () => COS.planet(0, 0, 120, { kind: 'rock', base: '#e9e4dc', soft: 0.06, spec: 0.8, craters: { seed: 12, n: 50, big: 0.04, dark: '#b8b2a8', lit: '#ffffff' } }, { light: LIGHT_L })); },
  { ui: (tl) => { tag('DARK → BIGGER', 560, 860, tl, WT(31, 'bigger'), { size: 52, bg: '#fff' }); tag('SHINY → SMALLER', 1400, 860, tl, WT(31, 'smaller'), { size: 52, bg: YEL }); tag('SAME BRIGHTNESS', 960, 110, tl, 0.3, { size: 46, bg: '#fff' }); }, cues: [[wordT(31, 'dark'), 'pop'], [wordT(31, 'shiny'), 'pop']] });
// one shared camera (km per pixel) for the size ladder: ED138 -> Ceres -> Pluto -> the Moon
const ROW_Y = 520;
shot(A(32), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = 3.4; const k = ss(0.2, 1.0, tl); ed(960, ROW_Y, KM.edHi / kmpp / 2 * (0.6 + 0.4 * k), t); if (tl > 1.0) ghost(960, ROW_Y, KM.edLo / kmpp / 2); vig(0.4); },
  { ui: (tl) => { bigText('370 – 930 MILES', 960, 940, 96, YEL, tl, WT(32, 'three')); tag('(600 – 1,500 KM)', 960, 110, tl, WT(32, 'across'), { size: 44, bg: '#fff' }); sizeCaption('SMALLEST GUESS', null, 960, 300, tl, 1.1); }, cues: [[wordT(32, 'three'), 'dun'], [A(32) + 1.1, 'pop']] });
shot(A(33), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = 3.4; edRange(700, ROW_Y, kmpp, t); const k = pop(tl, WT(33, 'ceres')); if (k > 0) withT(1320, ROW_Y, 0, k, () => body('ceres', 0, 0, KM.ceres / kmpp / 2, {})); vig(0.4); },
  { ui: (tl) => { sizeCaption('2026 ED138', '370–930 mi', 700, 860, tl, -1, EDC); sizeCaption('CERES', '≈ 580 mi', 1320, 860, tl, WT(33, 'ceres') + 0.2); tag('LARGEST IN THE ASTEROID BELT', 1320, 120, tl, WT(33, 'asteroid'), { size: 40, bg: '#fff' }); }, cues: [[wordT(33, 'ceres'), 'pop']] });
shot(A(34), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = 3.4; edRange(700, ROW_Y, kmpp, t, { loCol: YEL, loA: 1 }); body('ceres', 1320, ROW_Y, KM.ceres / kmpp / 2, {}); const lo = KM.edLo / kmpp / 2; COS.glow(700, ROW_Y, lo * 1.6, '#ffe07a', 0.25 * ss(0.2, 0.6, tl)); vig(0.4); },
  { ui: (tl) => { sizeCaption('LOW END', '< CERES', 700, 860, tl, 0.3, YEL); sizeCaption('CERES', '≈ 580 mi', 1320, 860, tl, -1); }, cues: [[A(34) + 0.3, 'pop']] });
shot(A(35), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = 3.4; edRange(700, ROW_Y, kmpp, t, { loA: 0.4 }); body('ceres', 1320, ROW_Y, KM.ceres / kmpp / 2, {}); const hi = KM.edHi / kmpp / 2; ctx.save(); circle(700, ROW_Y, hi + 10); ctx.strokeStyle = YEL; ctx.lineWidth = 7; ctx.globalAlpha = ss(0.1, 0.4, tl); ctx.stroke(); ctx.restore(); vig(0.4); },
  { ui: (tl) => { sizeCaption('HIGH END', '> CERES', 700, 860, tl, 0.3, YEL); sizeCaption('CERES', '≈ 580 mi', 1320, 860, tl, -1); }, cues: [[A(35) + 0.3, 'pop']] });
shot(A(36), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = 3.4; edRange(960, ROW_Y, kmpp, t); qmark(1290, 300, 1.2, tl, 0.2, YEL); vig(0.4); }, { ui: (tl) => tag('A HUGE UNCERTAINTY', 960, 940, tl, 0.2, { size: 56, bg: ROSE, col: '#fff' }), cues: [[A(36) + 0.2, 'boing']] });
shot(A(37), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = 3.4, lo = KM.edLo / kmpp / 2, hi = KM.edHi / kmpp / 2; const k = ss(0.3, 1.2, tl);
  body('ed', 560, ROW_Y, lo, { spin: 60 }); ed(1260, ROW_Y, hi, t); line(560 - lo, ROW_Y + hi + 40, 560 + lo, ROW_Y + hi + 40, 8, '#fff'); line(1260 - hi, ROW_Y + hi + 40, 1260 - hi + 2 * hi * k, ROW_Y + hi + 40, 8, YEL); vig(0.4); },
  { ui: (tl) => { sizeCaption('SMALLEST', '370 mi', 560, 210, tl, 0.1); sizeCaption('BIGGEST', '930 mi', 1260, 210, tl, 0.6, YEL); tag('MORE THAN 2× WIDER', 960, 990, tl, WT(37, 'twice'), { size: 50, bg: YEL }); }, cues: [[A(37) + 0.6, 'pop'], [wordT(37, 'twice'), 'ding']] });
shot(A(38), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = geoL(3.4, 6.6, easeIO(tl / 1.6)); const xs = [430, 760, 1350]; edRange(xs[0], ROW_Y, kmpp, t); body('ceres', xs[1], ROW_Y, KM.ceres / kmpp / 2, {}); const k = pop(tl, WT(38, 'pluto')); if (k > 0) withT(xs[2], ROW_Y, 0, k, () => body('pluto', 0, 0, KM.pluto / kmpp / 2, { spin: 120 })); vig(0.4); },
  { ui: (tl) => { sizeCaption('ED138', null, 430, 800, tl, -1, EDC); sizeCaption('CERES', null, 760, 800, tl, -1); sizeCaption('PLUTO', '≈ 1,480 mi', 1350, 900, tl, WT(38, 'fourteen')); }, cues: [[wordT(38, 'pluto'), 'pop'], [wordT(38, 'fourteen'), 'ding']] });
shot(A(39), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = 6.6, xs = [430, 760, 1350]; const r = edRange(xs[0], ROW_Y, kmpp, t); body('ceres', xs[1], ROW_Y, KM.ceres / kmpp / 2, {}); const rp = KM.pluto / kmpp / 2; body('pluto', xs[2], ROW_Y, rp, { spin: 120 });
  const k = ss(0.2, 1.0, tl); ctx.save(); ctx.setLineDash([16, 12]); line(xs[0], ROW_Y - r.rHi, xs[0] + (xs[2] - xs[0]) * k, ROW_Y - r.rHi, 5, YEL); line(xs[2] - rp - 30, ROW_Y - rp, xs[2] + rp + 30, ROW_Y - rp, 5, '#fff'); ctx.restore(); vig(0.4); },
  { ui: (tl) => tag('EVEN AT MOST: WELL UNDER PLUTO', 960, 110, tl, WT(39, 'well'), { size: 48, bg: YEL }), cues: [[A(39) + 0.2, 'slide'], [wordT(39, 'well'), 'pop']] });
shot(A(40), (tl, d, t) => { space(t, { density: 0.8 }); const kmpp = geoL(6.6, 9.6, easeIO(tl / 1.4)); const xs = [300, 520, 860, 1430]; edRange(xs[0], ROW_Y + 80, kmpp, t); body('ceres', xs[1], ROW_Y + 80, KM.ceres / kmpp / 2, {}); body('pluto', xs[2], ROW_Y + 80, KM.pluto / kmpp / 2, { spin: 120 }); const k = pop(tl, WT(40, 'moon')); if (k > 0) withT(xs[3], ROW_Y + 80, 0, k, () => COS.planet(0, 0, KM.moon / kmpp / 2, 'moon', { light: LIGHT_L })); vig(0.4); },
  { ui: (tl) => { sizeCaption('ED138', null, 300, 950, tl, -1, EDC); sizeCaption('CERES', null, 520, 950, tl, -1); sizeCaption('PLUTO', null, 860, 950, tl, -1); sizeCaption('OUR MOON', null, 1430, 950, tl, WT(40, 'moon') + 0.2); }, cues: [[wordT(40, 'moon'), 'pop']] });
shot(A(41), (tl, d, t) => { bgPlain('#16203a', '#060a14'); bigText('THE PART THAT', 960, 420, 120, '#fff', tl, 0.1); bigText('MATTERS', 960, 600, 170, YEL, tl, 0.45); }, { cues: [[A(41) + 0.1, 'pop'], [A(41) + 0.45, 'dun']] });
shot(A(42), (tl, d, t) => { space(t, { density: 0.8 }); const k = easeIO(clamp(tl / Math.max(1, d - 0.5), 0, 1)); if (k < 0.98) blob(960, 540, 260, 1 - k, t); else ed(960, 540, 260, t); const a = 1 - ss(0.6, 0.95, k);
  if (a > 0) for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; ctx.save(); ctx.globalAlpha = a; COS.arrow(ctx, 960 + Math.cos(an) * 420, 540 + Math.sin(an) * 420, 960 + Math.cos(an) * 310, 540 + Math.sin(an) * 310, { col: ICE, lw: 8 }); ctx.restore(); } vig(0.4); },
  { ui: (tl) => tag('GRAVITY PULLS IT ROUND', 960, 110, tl, WT(42, 'round') - 0.6, { size: 54, bg: ICE }), cues: [[A(42) + 0.2, 'rise'], [wordT(42, 'round'), 'ding']] });
shot(A(43), (tl, d, t) => { bgPlain('#f2e6cf', '#d8c6a6'); withT(960, 540, -0.015, 1, () => { rrect(-420, -330, 840, 660, 24); shape('#fffdf6', INK, 7); text('DWARF PLANET TEST', 0, -250, 62, INK, 900, 'center', null); line(-360, -200, 360, -200, 5, '#ddd'); rrect(-330, -120, 80, 80, 12); shape('#fff', INK, 6); text('ROUND?', 40, -78, 64, INK, 900, 'center', null); }); check(670, 460, 0.8, tl, WT(43, 'round') + 0.2); ed(1560, 760, 120, t, { ink: INK }); },
  { cues: [[wordT(43, 'round') + 0.2, 'ding']] });
shot(A(44), (tl, d, t) => { space(t, { density: 0.8 }); body('ceres', 600, 540, 150, {}); body('pluto', 1320, 540, 250, { spin: 120 }); check(600, 280, 1.0, tl, WT(44, 'ceres')); check(1320, 200, 1.0, tl, WT(44, 'pluto')); vig(0.4); },
  { ui: (tl) => { sizeCaption('CERES', 'ROUND ✓', 600, 820, tl, WT(44, 'ceres')); sizeCaption('PLUTO', 'ROUND ✓', 1320, 920, tl, WT(44, 'pluto')); }, cues: [[wordT(44, 'ceres'), 'ding'], [wordT(44, 'pluto'), 'ding']] });

// ================================================================ HIDDEN IN PLAIN SIGHT
shot(A(45), (tl, d, t) => { space(t, { mw: 1, mwY: 540, mwRot: -0.15, density: 2.2 }); vig(0.5); }, { ui: (tl) => { titleCard('HIDDEN IN PLAIN SIGHT', tl, 0, 1.25, '#5b3fb8'); tag('HOW DID EVERYONE MISS IT?', 960, 960, tl, 1.3, { size: 50, bg: YEL }); }, cues: [[A(45), 'sting'], [A(45) + 1.3, 'pop']] });
shot(A(46), (tl, d, t) => { nightScene(t); vig(0.4); }, { cam: [[960, 600, 1.08], [960, 520, 1.0]], ui: (tl) => tag('IT IS ABOUT WHERE IT SITS', 960, 980, tl, 0.3, { size: 48, bg: '#fff' }), cues: [[A(46) + 0.3, 'pop']] });
shot(A(47), (tl, d, t) => { nightScene(t); const k = ss(WT(47, 'band'), WT(47, 'band') + 0.5, tl); ctx.save(); ctx.globalAlpha = k; circle(1130, 260, 70 + 6 * Math.sin(t * 4)); ctx.strokeStyle = ROSE; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); vig(0.4); },
  { ui: (tl) => tag('IT IS IN HERE', 1130, 400, tl, WT(47, 'band') + 0.3, { size: 46, bg: ROSE, col: '#fff' }), cues: [[wordT(47, 'band') + 0.3, 'pop']] });
shot(A(48), (tl, d, t) => { space(t, { mw: 1.3, mwY: 540, mwRot: -0.1, mwThick: 420, density: 5 }); vig(0.3); }, { cam: [[960, 540, 1.0], [960, 540, 1.15]], ui: (tl) => tag('MILLIONS OF STARS', 960, 110, tl, WT(48, 'millions'), { size: 58, bg: YEL }), cues: [[A(48) + 0.1, 'sparkle'], [wordT(48, 'millions'), 'pop']] });
shot(A(49), (tl, d, t) => { space(t, { mw: 1.3, mwY: 540, mwRot: -0.1, mwThick: 420, density: 5 }); circle(1010 + tl * 4, 500, 3); shape('#ffd0b8', null); const sx = 960 + Math.sin(tl * 1.1) * 600, sy = 540 + Math.sin(tl * 0.7 + 1) * 280; circle(sx, sy, 90); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 4; ctx.stroke(); vig(0.3); },
  { cam: [[960, 540, 1.15], [960, 540, 1.2]], ui: (tl) => tag('CAN YOU SPOT IT?', 960, 110, tl, 0.3, { size: 58, bg: '#fff' }), cues: [[A(49) + 0.3, 'pop']] });
shot(A(50), (tl, d, t) => { nightScene(t); observatory(960, 900, 1.15, t, { beam: ss(0.4, 1.4, tl) }); vig(0.4); }, { cam: [[960, 640, 1.15], [960, 560, 1.0]], ui: (tl) => tag('VERA RUBIN OBSERVATORY', 960, 110, tl, WT(50, 'rubin'), { size: 54, bg: YEL }), cues: [[wordT(50, 'rubin'), 'dun']] });
shot(A(51), (tl, d, t) => { nightScene(t, { mw: 0.7 }); observatory(560, 930, 0.8, t, { beam: 1 }); sensor(1340, 500, 300, tl, { wave: tl - WT(51, 'camera') + 0.6 }); },
  { ui: (tl) => { ribbon('CHILE', tl, WT(51, 'chile')); tag('BIGGEST DIGITAL CAMERA', 1340, 920, tl, WT(51, 'camera'), { size: 48, bg: YEL }); }, cues: [[wordT(51, 'chile'), 'slide'], [wordT(51, 'camera'), 'sparkle']] });
shot(A(52), (tl, d, t) => { bgPlain('#16203a', '#060a14'); sensor(620, 540, 360, tl, { wave: tl + 0.5 }); },
  { ui: (tl) => { const v = SCALE.count(tl, { to: 3200, t0: 0.3, dur: 1.4 }); bigText(SCALE.fmtNum(v, 0), 1420, 470, 170, YEL, tl, 0.2); bigText('MEGAPIXELS', 1420, 640, 80, '#fff', tl, 0.4); tag('PER PICTURE', 1420, 780, tl, 1.4, { size: 46, bg: '#fff' }); }, cues: [[A(52) + 0.3, 'tick'], [A(52) + 1.7, 'ding']] });
shot(A(53), (tl, d, t) => { space(t, { density: 0.9 }); const cx = 960, cy = 980, R = 820; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 2 * Math.PI); ctx.closePath(); ctx.fillStyle = 'rgba(30,50,100,0.35)'; ctx.fill(); ctx.clip();
  const n = Math.floor(clamp(tl / Math.max(1, d), 0, 1) * 160), r = rnd(4); for (let i = 0; i < 160; i++) { const x = cx - R + r() * 2 * R, y = cy - r() * R; if (i >= n) continue; const a = clamp(1 - (n - i) / 40, 0.25, 1); rrect(x - 40, y - 40, 80, 80, 4); ctx.fillStyle = `rgba(150,200,255,${0.35 * a})`; ctx.fill(); ctx.strokeStyle = `rgba(200,225,255,${0.7 * a})`; ctx.lineWidth = 2; ctx.stroke(); } ctx.restore(); ridge(900, '#04060b'); },
  { ui: (tl) => { tag('NIGHT ' + Math.max(1, Math.floor(tl * 6) + 1), 300, 110, tl, 0.1, { size: 50, bg: YEL }); tag('THE WHOLE SOUTHERN SKY', 1360, 110, tl, WT(53, 'southern'), { size: 46, bg: '#fff' }); }, cues: [[A(53) + 0.1, 'tick'], [wordT(53, 'southern'), 'pop']] });
shot(A(54), (tl, d, t) => { bgPlain('#16203a', '#060a14'); for (let i = 0; i < 6; i++) { const k = pop(tl, 0.2 + i * 0.25); if (k <= 0) continue; withT(330 + i * 255, 520 + (i % 2 ? 30 : -30), (i - 2.5) * 0.03, k * 0.9, () => frame(-120, -100, 240, 200, '', t, { seed: 21, density: 0.4, dot: [120 + i * 9, 100 - i * 3], dotR: 2.6 })); } },
  { ui: (tl) => tag('A 10-YEAR TIME-LAPSE OF THE SKY', 960, 120, tl, WT(54, 'ten'), { size: 50, bg: YEL }), cues: [[A(54) + 0.2, 'slide'], [wordT(54, 'ten'), 'pop']] });
shot(A(55), (tl, d, t) => { bgPlain('#16203a', '#060a14'); frame(170, 230, 700, 560, 'NIGHT 1', t, { seed: 33, density: 0.7 }); frame(1050, 230, 700, 560, 'NIGHT 2', t, { seed: 33, density: 0.7 }); },
  { ui: (tl) => tag('STARS STAY PUT', 960, 110, tl, WT(55, 'stay'), { size: 56, bg: '#fff' }), cues: [[wordT(55, 'stay'), 'pop']] });
shot(A(56), (tl, d, t) => { bgPlain('#16203a', '#060a14'); frame(170, 230, 700, 560, 'NIGHT 1', t, { seed: 33, density: 0.7, dot: [330, 300], dotR: 4.5, ring: tl > 0.6, ringCol: ROSE }); frame(1050, 230, 700, 560, 'NIGHT 2', t, { seed: 33, density: 0.7, dot: [370, 288], dotR: 4.5, ring: tl > 0.9, ringCol: ROSE }); },
  { ui: (tl) => tag('SOLAR SYSTEM OBJECTS MOVE', 960, 110, tl, WT(56, 'move'), { size: 52, bg: ROSE, col: '#fff' }), cues: [[A(56) + 0.6, 'pop'], [wordT(56, 'move'), 'ding']] });
shot(A(57), (tl, d, t) => { bgPlain('#16203a', '#060a14'); const on = Math.floor(tl * 2.2) % 2; frame(410, 170, 1100, 700, on ? 'NIGHT 2' : 'NIGHT 1', t, { seed: 34, density: 0.9, dot: on ? [610, 380] : [560, 396], dotR: 5 });
  ctx.save(); ctx.setLineDash([8, 10]); line(410 + 540, 170 + 400, 410 + 640, 170 + 368, 4, 'rgba(255,140,110,0.8)'); ctx.restore(); },
  { ui: (tl) => tag('FIND THE DOT THAT SHIFTS', 960, 980, tl, WT(57, 'shift'), { size: 50, bg: YEL }), cues: [[A(57) + 0.45, 'tick'], [A(57) + 0.9, 'tick'], [A(57) + 1.35, 'tick'], [wordT(57, 'shift'), 'pop']] });
shot(A(58), (tl, d, t) => { space(t, { density: 0.7 }); tracks(t, 260, 9, { link: ss(0.2, 1.6, tl) }); },
  { ui: (tl) => { tag('MOSTLY ORDINARY ASTEROIDS', 960, 110, tl, WT(58, 'asteroids'), { size: 52, bg: '#fff' }); }, cues: [[A(58) + 0.2, 'sparkle'], [wordT(58, 'asteroids'), 'pop']] });
shot(A(59), (tl, d, t) => { space(t, { density: 0.7 }); tracks(t, 420, 10, { link: ss(1.0, 4.0, tl) }); calendar(1640, 300, 1.0, '13', 'OCT 2026'); },
  { cam: [[960, 540, 1.0], [960, 540, 1.06]], ui: (tl) => { nameTag('MATTHEW HOLMAN · ASTRONOMER', 700, 110, tl, WT(59, 'matthew')); tag('BILLIONS OF MOVING DOTS', 700, 960, tl, WT(59, 'billions'), { size: 50, bg: YEL }); }, cues: [[wordT(59, 'october'), 'pop'], [wordT(59, 'matthew'), 'pop'], [wordT(59, 'billions'), 'sparkle']] });
shot(A(60), (tl, d, t) => { space(t, { density: 0.7 }); ctx.save(); ctx.globalAlpha = 0.45; tracks(t, 420, 10, { link: 1 }); ctx.restore(); tracks(t, 1, 99, { link: 1, hi: 0 }); const r = rnd(99); const x = r() * 1920, y = r() * 1080; COS.glow(x, y, 120, '#ff9a6a', 0.5 * ss(0.2, 0.8, tl)); },
  { ui: (tl) => tag('UNUSUALLY BRIGHT', 960, 980, tl, WT(60, 'bright'), { size: 56, bg: ROSE, col: '#fff' }), cues: [[A(60) + 0.2, 'rise'], [wordT(60, 'bright'), 'ding']] });
shot(A(61), (tl, d, t) => { bgPlain('#f2e6cf', '#d8c6a6'); quoteCard('My first reaction was one\nof excited disbelief.', 'Matthew Holman, Center for Astrophysics', 960, 520, tl, 0.2, { accent: '#C8312B', size: 66 }); }, { cues: [[A(61) + 0.2, 'pop']] });
shot(A(62), (tl, d, t) => { bgPlain('#16203a', '#060a14'); withT(860, 520, 0, 1, () => { rrect(-520, -320, 1040, 640, 20); shape('#0d1424', '#cfd8ea', 5); for (let i = 0; i < 9; i++) { const w = 300 + ((i * 137) % 400); rrect(-460, -260 + i * 62, w, 22, 6); ctx.fillStyle = i % 3 === 0 ? '#7CF2B0' : i % 3 === 1 ? '#9FD8FF' : '#FFD24A'; ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1; } });
  const k = clamp(tl / Math.max(1, d), 0, 1); withT(560 + 600 * k, 380 + 220 * Math.sin(k * 6), 0, 1, () => { circle(0, 0, 90); ctx.lineWidth = 16; ctx.strokeStyle = '#e8e2d4'; ctx.stroke(); line(64, 64, 150, 150, 22, '#e8e2d4'); }); },
  { ui: (tl) => tag('DOUBLE-CHECK EVERYTHING', 960, 980, tl, 0.3, { size: 50, bg: YEL }), cues: [[A(62) + 0.3, 'pop']] });
shot(A(63), (tl, d, t) => { space(t, { density: 0.8 }); ed(1450, 560, 170, t); check(700, 520, 2.2, tl, 0.15); }, { ui: (tl) => bigText("THEY HADN'T.", 700, 900, 110, YEL, tl, 0.2), cues: [[A(63) + 0.15, 'ding']] });
shot(A(64), (tl, d, t) => { bgPlain('#16203a', '#060a14'); const months = ['MAR', 'APR', 'MAY', 'JUN', 'JUL']; months.forEach((m, i) => { text(m, 300 + i * 330, 300, 46, '#cfd8ea', 900, 'center', INK, 6); line(170 + i * 330, 340, 170 + i * 330, 820, 3, 'rgba(200,215,240,0.3)'); });
  const r = rnd(64), n = Math.floor(SCALE.count(tl, { to: 30, t0: 0.3, dur: 2.6 })); for (let i = 0; i < 30; i++) { const x = 190 + r() * 1580, y = 400 + r() * 380; if (i >= n) continue; circle(x, y, 12); shape('#ffb38a', INK, 3); } },
  { ui: (tl) => { const n = Math.floor(SCALE.count(tl, { to: 30, t0: 0.3, dur: 2.6 })); tag(n + ' DETECTIONS', 620, 110, tl, 0.3, { size: 54, bg: YEL }); tag('20 NIGHTS', 1300, 110, tl, WT(64, 'twenty'), { size: 54, bg: '#fff' }); tag('MARCH – JULY 2026', 960, 960, tl, WT(64, 'march'), { size: 46, bg: '#fff' }); }, cues: [[A(64) + 0.3, 'tick'], [wordT(64, 'twenty'), 'pop'], [wordT(64, 'march'), 'pop']] });
shot(A(65), (tl, d, t) => { bgPlain('#16203a', '#060a14'); line(160, 620, 1760, 620, 8, '#cfd8ea'); for (let y = 2016; y <= 2026; y++) { const x = 160 + (y - 2016) * 160; circle(x, 620, 10); shape('#cfd8ea', null); text(String(y), x, 690, 34, '#cfd8ea', 900, 'center', INK, 5); }
  const k = ss(0.4, 2.2, tl); ctx.save(); ctx.lineWidth = 14; ctx.strokeStyle = EDC; ctx.beginPath(); ctx.moveTo(1760, 620); ctx.lineTo(1760 - 1600 * k, 620); ctx.stroke(); ctx.restore(); withT(1760 - 1600 * k, 460, 0, 0.9, () => frame(-130, -110, 260, 200, '', t, { seed: 40, density: 0.5, dot: [130, 100], ring: true })); },
  { ui: (tl) => tag('OLDER IMAGES: BACK TO 2016', 960, 120, tl, WT(65, 'twenty'), { size: 52, bg: YEL }), cues: [[A(65) + 0.4, 'slide'], [wordT(65, 'twenty'), 'ding']] });
shot(A(66), (tl, d, t) => { space(t, { mw: 0.9, mwY: 540, mwRot: -0.1, density: 2.5 }); const k = ss(0.1, 2.4, tl); ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i <= 10; i++) { const u = i / 10; if (u > k) break; const x = 260 + u * 1400, y = 640 - u * 220 - Math.sin(u * 3) * 30; circle(x, y, 8); shape(i === 10 ? EDC : '#ffb38a', null); if (i % 2 === 0) text(String(2016 + i), x, y + 50, 28, '#fff', 900, 'center', INK, 5); } ctx.restore(); vig(0.4); },
  { ui: (tl) => tag('10+ YEARS · HIDING IN PLAIN SIGHT', 960, 110, tl, 0.3, { size: 50, bg: YEL }), cues: [[A(66) + 0.3, 'pop']] });

// ================================================================ A TILTED ORBIT
const EL = 0.38, OC = [960, 560];
function solarDisk(t, o = {}) { space(t, { density: 0.9 }); plane3d(OC[0], OC[1], 760, EL, o.planeA === undefined ? 0.14 : o.planeA); COS.star(OC[0], OC[1], 26, { t });
  [[160, 'earth', 9, 0.9], [260, 'mars', 7, 0.6], [400, 'jupiter', 20, 0.35], [520, 'sat', 16, 0.25], [620, 'uran', 12, 0.17], [700, 'nept', 12, 0.13]].forEach(([R, k, r, sp], i) => { orbit3d(OC[0], OC[1], R, 0, EL, { col: '#8fb6ff', alpha: 0.45, lw: 2.5 }); const p = pos3d(OC[0], OC[1], R, 0, EL, i * 1.3 + t * sp * (o.speed || 1)); const pr = k === 'earth' || k === 'mars' || k === 'jupiter' ? k : PRE[k]; COS.planet(p[0], p[1], r * (o.marbles ? 1.5 : 1), pr, { light: lightTo(p[0], p[1], OC[0], OC[1]), lights: false, ink: 'rgba(10,14,28,0.5)' }); }); }
function edOrbit(t, inc, o = {}) { orbit3d(OC[0], OC[1], 740, inc, EL, { col: EDC, alpha: 0.95, lw: 5 }); const p = pos3d(OC[0], OC[1], 740, inc, EL, (o.ph === undefined ? 1.2 : o.ph) + t * 0.12); COS.glow(p[0], p[1], 50, '#ff9a6a', 0.35); body('ed', p[0], p[1], 16, { light: lightTo(p[0], p[1], OC[0], OC[1]) }); return p; }
shot(A(67), (tl, d, t) => { space(t, { density: 0.9 }); const k = ss(0.4, 2.6, tl); const r = rnd(67); for (let i = 0; i < 12; i++) { const ph = i / 12 * Math.PI * 1.6 + 0.5, p = pos3d(OC[0], OC[1], 740, 25 * D2R, EL, ph); circle(p[0] + (r() - 0.5) * 16, p[1] + (r() - 0.5) * 16, 8); shape('#ffb38a', null); } if (k > 0) { ctx.save(); ctx.globalAlpha = k; orbit3d(OC[0], OC[1], 740, 25 * D2R, EL, { col: EDC, alpha: 0.9, lw: 5 }); ctx.restore(); } COS.star(OC[0], OC[1], 26, { t }); },
  { ui: (tl) => { titleCard('A TILTED ORBIT', tl, 0, 1.2, '#C8312B'); tag('POSITIONS → PATH', 960, 980, tl, 1.4, { size: 50, bg: YEL }); }, cues: [[A(67), 'sting'], [A(67) + 1.4, 'pop']] });
shot(A(68), (tl, d, t) => { solarDisk(t); }, { cam: [[960, 560, 1.06], [960, 560, 1.0]], ui: (tl) => tag('ONE FLAT PLANE', 960, 110, tl, WT(68, 'flat'), { size: 56, bg: ICE }), cues: [[wordT(68, 'flat'), 'pop']] });
shot(A(69), (tl, d, t) => { solarDisk(t, { planeA: 0.3, marbles: true, speed: 3 }); }, { ui: (tl) => tag('MARBLES ON A TABLETOP', 960, 110, tl, WT(69, 'marbles'), { size: 54, bg: YEL }), cues: [[wordT(69, 'marbles'), 'pop']] });
shot(A(70), (tl, d, t) => { solarDisk(t, { planeA: 0.22 }); const inc = 25 * D2R * ss(0.3, 1.8, tl); edOrbit(t, inc, {}); const a0 = Math.PI, p = pos3d(OC[0], OC[1], 740, inc, EL, Math.PI); line(OC[0], OC[1], OC[0] - 740, OC[1], 4, 'rgba(255,255,255,0.6)'); },
  { ui: (tl) => { bigText('≈ 25°', 1600, 300, 130, EDC, tl, WT(70, 'twenty')); tag('TILTED', 1600, 450, tl, WT(70, 'tilted'), { size: 50, bg: '#fff' }); }, cues: [[A(70) + 0.3, 'rise'], [wordT(70, 'twenty'), 'dun']] });
shot(A(71), (tl, d, t) => { solarDisk(t, { planeA: 0.22 }); const p = edOrbit(t * 3, 25 * D2R, { ph: 0.6 }); },
  { ui: (tl) => { tag('HIGH ABOVE ↑', 960, 120, tl, WT(71, 'above'), { size: 50, bg: '#fff' }); tag('↓ FAR BELOW', 960, 980, tl, WT(71, 'below'), { size: 50, bg: '#fff' }); }, cues: [[wordT(71, 'above'), 'pop'], [wordT(71, 'below'), 'pop']] });
shot(A(72), (tl, d, t) => { solarDisk(t, { planeA: 0.18 }); orbit3d(OC[0], OC[1], 640, 17 * D2R * ss(0.2, 1.2, tl), EL, { col: '#c6a487', alpha: 0.95, lw: 5 }); const p = pos3d(OC[0], OC[1], 640, 17 * D2R, EL, 2.0 + t * 0.1); body('pluto', p[0], p[1], 14, { light: lightTo(p[0], p[1], OC[0], OC[1]) }); },
  { ui: (tl) => { tag('PLUTO: ≈ 17°', 1550, 160, tl, WT(72, 'seventeen'), { size: 52, bg: '#fff' }); }, cues: [[wordT(72, 'seventeen'), 'pop']] });
shot(A(73), (tl, d, t) => { solarDisk(t, { planeA: 0.18 }); orbit3d(OC[0], OC[1], 640, 17 * D2R, EL, { col: '#c6a487', alpha: 0.7, lw: 4 }); edOrbit(t, 25 * D2R); },
  { ui: (tl) => { tag('PLUTO: ≈ 17°', 1550, 160, tl, -1, { size: 44, bg: '#fff' }); tag('ED138: ≈ 25°', 1550, 260, tl, 0.3, { size: 52, bg: EDC, col: '#fff' }); }, cues: [[A(73) + 0.3, 'pop']] });
shot(A(74), (tl, d, t) => { solarMap(t, 34, { kb: 1, ed: 1 }); }, { cam: [[1400, 560, 1.4], [1450, 560, 1.55]], ui: (tl) => tag('A "HOT CLASSICAL" KUIPER BELT OBJECT', 960, 110, tl, WT(74, 'hot'), { size: 46, bg: YEL }), cues: [[wordT(74, 'hot'), 'pop']] });
shot(A(75), (tl, d, t) => { solarDisk(t, { planeA: 0.18 }); ctx.save(); ctx.setLineDash([14, 12]); orbit3d(OC[0], OC[1], 740, 0, EL, { col: '#ffffff', alpha: 0.6, lw: 3 }); ctx.restore(); const inc = 25 * D2R * ss(0.6, 2.0, tl); edOrbit(t, inc); const k = pop(tl, 0.5); if (k > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, k); COS.arrow(ctx, 360, 900, 300, 640, { col: ROSE, lw: 12 }); ctx.restore(); } },
  { ui: (tl) => { tag('ORIGINAL PATH?', 520, 980, tl, 0.3, { size: 44, bg: '#fff' }); tag('SHOVED OFF COURSE', 1480, 120, tl, WT(75, 'shoved'), { size: 50, bg: ROSE, col: '#fff' }); }, cues: [[A(75) + 0.5, 'whoosh'], [wordT(75, 'shoved'), 'thud']] });
shot(A(76), (tl, d, t) => { space(t, { density: 0.8 }); body('nept', 960, 560, 330, { spin: t * 5 }); vig(0.5); }, { cam: [[960, 560, 0.95], [960, 560, 1.05]], ui: (tl) => { bigText('NEPTUNE', 960, 150, 120, '#fff', tl, WT(76, 'neptune')); tag('THE LIKELY SUSPECT', 960, 970, tl, WT(76, 'suspect'), { size: 54, bg: YEL }); }, cues: [[wordT(76, 'suspect'), 'dun']] });
shot(A(77), (tl, d, t) => { space(t, { density: 0.8 }); body('nept', 760, 600, 200, { spin: t * 5 }); const r = rnd(77); for (let i = 0; i < 26; i++) { const a = -1.4 + r() * 2.8, sp = 120 + r() * 520, k = clamp(tl / 3.5, 0, 1); const d0 = 230 + sp * k; const x = 760 + Math.cos(a) * d0, y = 600 + Math.sin(a) * d0 * 0.8 - 120 * k * Math.sin(a * 2); ctx.save(); ctx.globalAlpha = 0.5; line(760 + Math.cos(a) * 230, 600 + Math.sin(a) * 184, x, y, 2.5, '#bcd6ff'); ctx.restore(); circle(x, y, 4 + r() * 5); shape('#d9c3b0', null); } vig(0.5); },
  { ui: (tl) => tag('SCATTERED, LONG AGO', 1400, 120, tl, WT(77, 'scattered'), { size: 52, bg: '#fff' }), cues: [[A(77) + 0.2, 'whoosh'], [wordT(77, 'scattered'), 'pop']] });
shot(A(78), (tl, d, t) => { space(t, { density: 0.9 }); orbit3d(OC[0], OC[1], 600, 25 * D2R, EL, { col: EDC, alpha: 0.9, lw: 5 }); COS.star(OC[0], OC[1], 24, { t }); const k = clamp(tl / Math.max(1, d - 0.2), 0, 1); const p = pos3d(OC[0], OC[1], 600, 25 * D2R, EL, Math.PI / 2 + k * Math.PI * 2); body('ed', p[0], p[1], 18, { light: lightTo(p[0], p[1], OC[0], OC[1]) }); },
  { ui: (tl) => { const k = clamp(tl / 4, 0, 1); tag('ONE LAP ≈ 3 CENTURIES', 960, 110, tl, WT(78, 'three'), { size: 54, bg: YEL }); }, cues: [[A(78) + 0.2, 'rise'], [wordT(78, 'three'), 'ding']] });
shot(A(79), (tl, d, t) => { bgPlain('#f2e6cf', '#d8c6a6'); const k1 = ss(0.2, 1.4, tl), k2 = ss(0.6, 1.8, tl); rrect(220, 380, 1480 * k1, 110, 20); shape(EDC, INK, 6); rrect(220, 600, 1230 * k2, 110, 20); shape('#3B6FD6', INK, 6); if (k1 > 0.3) text('ONE LAP (≈ 3 CENTURIES)', 260, 436, 52, '#fff', 900, 'left', INK, 8); if (k2 > 0.3) text('THE USA (SINCE 1776)', 260, 656, 52, '#fff', 900, 'left', INK, 8); },
  { ui: (tl) => tag('LONGER THAN THE UNITED STATES HAS EXISTED', 960, 160, tl, WT(79, 'united'), { size: 44, bg: YEL }), cues: [[A(79) + 0.2, 'slide'], [wordT(79, 'united'), 'pop']] });

// ================================================================ THE VIEW FROM THERE
function surfaceSky(t, o = {}) { space(t, { mw: 0.85, mwY: 260, mwRot: -0.18, mwThick: 200, density: 1.6 }); }
shot(A(80), (tl, d, t) => { surfaceSky(t); sunPoint(360, 250, 0.9, t); terrain(t, { dim: 0.85 }); vig(0.45); }, { cam: [[960, 640, 1.12], [960, 560, 1.0]], ui: (tl) => titleCard('THE VIEW FROM THERE', tl, 0, 1.3, '#2F6FD6'), cues: [[A(80), 'sting']] });
shot(A(81), (tl, d, t) => { surfaceSky(t); sunPoint(360, 250, 0.9, t); terrain(t, { dim: 0.85 }); vig(0.45); }, { cam: [[960, 700, 1.25], [1100, 740, 1.32]], ui: (tl) => { tag('ICE + ROCK', 600, 980, tl, WT(81, 'ice'), { size: 52, bg: ICE }); tag('COLDER THAN ANYTHING ON EARTH', 1300, 120, tl, WT(81, 'colder'), { size: 46, bg: '#fff' }); }, cues: [[wordT(81, 'ice'), 'pop'], [wordT(81, 'colder'), 'pop']] });
shot(A(82), (tl, d, t) => { bgPlain('#1c2a4a', '#070b16'); body('pluto', 1350, 540, 260, { spin: 120 }); thermo(560, 640, 1.2, lerp(0.9, 0.12, ss(0.3, 1.8, tl)), '#5fb0ff', tl); },
  { ui: (tl) => { tag('PLUTO', 1350, 900, tl, 0.2, { size: 48, bg: '#fff' }); bigText('−375 TO −400 °F', 960, 140, 96, ICE, tl, WT(82, 'minus')); }, cues: [[A(82) + 0.3, 'rise'], [wordT(82, 'minus'), 'dun']] });
shot(A(83), (tl, d, t) => { bgPlain('#1c2a4a', '#070b16'); body('pluto', 1180, 540, 150, { spin: 120 }); ed(1620, 540, 90, t); thermo(560, 640, 1.2, 0.12 - 0.07 * ss(0.3, 1.2, tl), '#5fb0ff', tl); COS.arrow(ctx, 1290, 760, 1560, 760, { col: EDC, lw: 10 }); },
  { ui: (tl) => tag('EVEN FARTHER OUT', 1400, 900, tl, WT(83, 'farther'), { size: 50, bg: EDC, col: '#fff' }), cues: [[wordT(83, 'farther'), 'pop']] });
shot(A(84), (tl, d, t) => { bgPlain('#16203a', '#060a14'); rrect(160, 220, 720, 560, 20); shape('#8fc4ff', INK, 6); COS.star(520, 470, 80, { t }); text('FROM EARTH', 520, 850, 48, '#fff', 900, 'center', INK, 8);
  rrect(1040, 220, 720, 560, 20); shape('#05070d', INK, 6); ctx.save(); rrect(1040, 220, 720, 560, 20); ctx.clip(); COS.starfield(5, { box: [1040, 220, 720, 560], density: 0.6, twinkleT: t }); sunPoint(1400, 470, 0.6 * pop(tl, WT(84, 'disk')), t); ctx.restore(); text('FROM ED138', 1400, 850, 48, '#fff', 900, 'center', INK, 8); },
  { ui: (tl) => tag('NO LONGER A DISK', 960, 110, tl, WT(84, 'disk'), { size: 54, bg: YEL }), cues: [[wordT(84, 'disk'), 'pop']] });
shot(A(85), (tl, d, t) => { const k = easeIO(clamp(tl / 3.0, 0, 1)); space(t, { density: 1.2 }); if (k < 0.97) COS.star(960, 520, lerp(260, 6, k), { t, alpha: 1 - ss(0.85, 0.97, k) }); sunPoint(960, 520, ss(0.6, 1.0, k), t); },
  { ui: (tl) => tag('A SINGLE BLAZING POINT', 960, 960, tl, WT(85, 'blazing'), { size: 56, bg: YEL }), cues: [[A(85) + 0.2, 'whoosh'], [wordT(85, 'blazing'), 'sparkle']] });
function lightBars(tl, n) { const rows = [['SUNLIGHT ON EARTH', 1, '#FFD24A'], ['SUNLIGHT AT ED138', (6 - 3.33) / 6, EDC], ['FULL MOON ON EARTH', (6 - 5.6) / 6, '#cfd8ea']]; rows.forEach(([lab, f, col], i) => { if (i >= n) return; const k = ss(0.1 + i * 0.3, 0.9 + i * 0.3, tl); const bw = Math.max(30, 1600 * f * k); rrect(160, 300 + i * 190, bw, 110, 18); shape(col, INK, 5); if (bw > 700) text(lab, 190, 356 + i * 190, 46, INK, 900, 'left', '#fff', 7); else text(lab, 160 + bw + 30, 356 + i * 190, 46, '#fff', 900, 'left', INK, 8); }); }
shot(A(86), (tl, d, t) => { bgPlain('#16203a', '#060a14'); lightBars(tl, 2); }, { ui: (tl) => { tag('≈ 2,000× WEAKER', 1400, 600, tl, WT(86, 'thousand'), { size: 56, bg: ROSE, col: '#fff' }); tag('LOG SCALE', 1700, 1000, tl, 0.2, { size: 30, bg: '#fff' }); }, cues: [[A(86) + 0.1, 'slide'], [wordT(86, 'thousand'), 'dun']] });
shot(A(87), (tl, d, t) => { bgPlain('#16203a', '#060a14'); lightBars(tl + 0.6, 3); }, { ui: (tl) => { tag('STILL FAR BRIGHTER THAN A FULL MOON', 960, 130, tl, WT(87, 'brighter'), { size: 46, bg: YEL }); tag('LOG SCALE', 1700, 1000, tl, -1, { size: 30, bg: '#fff' }); }, cues: [[A(87) + 0.6, 'slide'], [wordT(87, 'brighter'), 'pop']] });
shot(A(88), (tl, d, t) => { surfaceSky(t); sunPoint(300, 300, 0.85, t); terrain(t, { dim: 0.7 }); vig(0.6); }, { cam: [[960, 600, 1.0], [1050, 600, 1.08]], ui: (tl) => tag('A PERMANENT TWILIGHT', 1300, 120, tl, WT(88, 'twilight'), { size: 52, bg: '#fff' }), cues: [[wordT(88, 'twilight'), 'pop']] });
shot(A(89), (tl, d, t) => { surfaceSky(t); sunPoint(560, 330, 0.85, t); terrain(t, { dim: 0.7 }); const k = ss(0.4, 0.9, tl); ctx.save(); ctx.globalAlpha = k; circle(612, 318, 22); ctx.strokeStyle = ICE; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); vig(0.6); },
  { ui: (tl) => tag('EARTH IS IN HERE · TOO FAINT TO SEE', 960, 120, tl, WT(89, 'earth'), { size: 44, bg: ICE }), cues: [[wordT(89, 'earth'), 'pop']] });
shot(A(90), (tl, d, t) => { space(t, { density: 0.9 }); ed(960, 560, 320, t * 6); qmark(1400, 330, 1.4, tl, 0.3, YEL); vig(0.5); }, { ui: (tl) => tag('HOW LONG IS A DAY?', 960, 960, tl, 0.2, { size: 56, bg: YEL }), cues: [[A(90) + 0.3, 'boing']] });
shot(A(91), (tl, d, t) => { space(t, { density: 0.9 }); ed(700, 560, 260, t * 6); clock(1420, 520, 2.0, t * 3); qmark(1420, 520, 1.0, tl, 0.6, YEL); vig(0.5); }, { ui: (tl) => tag('SPIN: NOT MEASURED YET', 960, 960, tl, WT(91, 'measured'), { size: 52, bg: '#fff' }), cues: [[A(91) + 0.6, 'boing'], [wordT(91, 'measured'), 'pop']] });

// ================================================================ WHAT COMES NEXT
shot(A(92), (tl, d, t) => { space(t, { density: 0.9 }); ed(960, 560, 300, t); stamp(960, 560, 1.4, 'CANDIDATE', '#C8312B', -0.12, tl, 1.4); vig(0.5); }, { ui: (tl) => titleCard('WHAT COMES NEXT', tl, 0, 1.2, '#5b3fb8'), cues: [[A(92), 'sting'], [A(92) + 1.4, 'stamp']] });
function thermal(x, y, r, k) { ctx.save(); circle(x, y, r); ctx.clip(); const g = ctx.createRadialGradient(x - r * 0.45, y - r * 0.2, r * 0.05, x, y, r * 1.1); g.addColorStop(0, '#fff3a0'); g.addColorStop(0.25, '#ff9a3c'); g.addColorStop(0.5, '#e0306a'); g.addColorStop(0.75, '#6a2ca0'); g.addColorStop(1, '#141a5a'); ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
shot(A(93), (tl, d, t) => { space(t, { density: 0.9 }); ed(960, 560, 300, t); thermal(960, 560, 300, ss(WT(93, 'infrared'), WT(93, 'infrared') + 0.8, tl)); vig(0.5); }, { ui: (tl) => { tag('INFRARED = HEAT', 960, 110, tl, WT(93, 'infrared'), { size: 56, bg: ROSE, col: '#fff' }); tag('(FALSE COLOUR)', 960, 960, tl, WT(93, 'infrared') + 0.4, { size: 36, bg: '#fff' }); }, cues: [[wordT(93, 'infrared'), 'sparkle']] });
shot(A(94), (tl, d, t) => { space(t, { density: 0.9 }); thermal(560, 540, 220, 1); const k = ss(WT(94, 'dark'), WT(94, 'dark') + 0.6, tl); body('ed', 1360, 540, 220, {}); ctx.save(); ctx.globalAlpha = k; ghost(1360, 540, 260, YEL, 1); ctx.restore(); COS.arrow(ctx, 820, 540, 1080, 540, { col: '#fff', lw: 10 }); },
  { ui: (tl) => { tag('HEAT', 560, 850, tl, 0.2, { size: 48, bg: ROSE, col: '#fff' }); tag('→ HOW DARK → HOW BIG', 1360, 850, tl, WT(94, 'big'), { size: 48, bg: YEL }); }, cues: [[A(94) + 0.2, 'pop'], [wordT(94, 'big'), 'ding']] });
const DW = [['PLUTO', 'pluto', 2377, 260, 'pluto'], ['CERES', 'ceres', 940, 1530, 'ceres'], ['ERIS', 'eris', 2326, 640, 'eris'], ['HAUMEA', 'haumea', 1600, 990, 'haumea'], ['MAKEMAKE', 'make', 1430, 1290, 'makemake']];
function dwarfRow(tl, t, ks, o = {}) { const kmpp = 7.0, y = 520;
  DW.forEach(([nm, key, km, x, w], i) => { const k = ks[i]; if (k <= 0) return; withT(x, y, 0, k, () => { if (key === 'haumea') { ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 150, 78, 0.15, 0, Math.PI * 2); const g = ctx.createRadialGradient(-60, -30, 10, 0, 0, 170); g.addColorStop(0, '#f4f2ee'); g.addColorStop(0.6, '#b9b4ac'); g.addColorStop(1, '#55514c'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); } else body(key, 0, 0, km / kmpp / 2, { spin: 80 }); }); });
  if (o.ed) { const k = o.ed; withT(1760, y, 0, k, () => { body('ed', 0, 0, KM.edHi / kmpp / 2, {}); ghost(0, 0, KM.edLo / kmpp / 2, '#fff', 0.8); }); } }
shot(A(95), (tl, d, t) => { space(t, { density: 0.8 }); dwarfRow(tl, t, DW.map((_, i) => pop(tl, 0.3 + i * 0.18))); vig(0.4); }, { ui: (tl) => tag('5 OFFICIAL DWARF PLANETS', 960, 110, tl, WT(95, 'five'), { size: 56, bg: YEL }), cues: [[wordT(95, 'five'), 'dun'], [A(95) + 0.3, 'pop'], [A(95) + 0.66, 'pop'], [A(95) + 1.02, 'pop']] });
shot(A(96), (tl, d, t) => { space(t, { density: 0.8 }); dwarfRow(tl, t, [1, 1, 1, 1, 1]); vig(0.4); }, { ui: (tl) => { DW.forEach(([nm, key, km, x, w]) => sizeCaption(nm, null, x, 860, tl, WT(96, w))); }, cues: DW.map(r => [wordT(96, r[4]), 'pop']) });
shot(A(97), (tl, d, t) => { space(t, { density: 0.8 }); dwarfRow(tl, t, [1, 1, 1, 1, 1], { ed: pop(tl, 0.3) }); qmark(1760, 330, 0.8, tl, 0.6, YEL); vig(0.4); }, { ui: (tl) => { DW.forEach(([nm, key, km, x]) => sizeCaption(nm, null, x, 860, tl, -1)); sizeCaption('ED138?', null, 1760, 860, tl, 0.3, EDC); tag('A VERY SMALL FAMILY', 960, 110, tl, WT(97, 'family'), { size: 54, bg: '#fff' }); }, cues: [[A(97) + 0.3, 'pop'], [wordT(97, 'family'), 'ding']] });
shot(A(98), (tl, d, t) => { const n = Math.floor(clamp(tl / 2.4, 0, 1) * 40); const p = solarMap(t, 34, { kb: 1, ed: 1 }); const r = rnd(98); for (let i = 0; i < 40; i++) { const au = 32 + r() * 18, th = (r() - 0.5) * 1.2; if (i >= n) continue; const [x, y] = mapPos(au, th, 34); circle(x, y, 14); ctx.strokeStyle = YEL; ctx.lineWidth = 3; ctx.stroke(); } },
  { cam: [[1300, 560, 1.3], [1300, 560, 1.4]], ui: (tl) => tag('PROBABLY NOT THE LAST', 960, 110, tl, 0.3, { size: 56, bg: YEL }), cues: [[A(98) + 0.3, 'sparkle']] });
shot(A(99), (tl, d, t) => { nightScene(t); observatory(960, 900, 1.0, t, { beam: 1 }); }, { ui: (tl) => { tag('10-YEAR SURVEY', 520, 120, tl, WT(99, 'ten'), { size: 52, bg: YEL }); tag('BEGAN JUNE 2026', 1400, 120, tl, WT(99, 'june'), { size: 52, bg: '#fff' }); }, cues: [[wordT(99, 'ten'), 'pop'], [wordT(99, 'june'), 'pop']] });
shot(A(100), (tl, d, t) => { bgPlain('#16203a', '#060a14'); tracks(t, 300, 100, { link: 1 }); ctx.save(); ctx.fillStyle = 'rgba(6,10,20,0.55)'; ctx.fillRect(0, 0, W, H); ctx.restore(); },
  { ui: (tl) => { const a = SCALE.count(tl, { to: 11000, t0: WT(100, 'eleven') - 0.2, dur: 1.4 }); bigText(SCALE.fmtNum(a, 0) + '+', 560, 470, 150, YEL, tl, WT(100, 'eleven') - 0.2); bigText('NEW ASTEROIDS', 560, 620, 64, '#fff', tl, WT(100, 'eleven')); const b = SCALE.count(tl, { to: 380, t0: WT(100, 'three'), dur: 1.0 }); bigText('≈ ' + SCALE.fmtNum(b, 0), 1380, 470, 150, EDC, tl, WT(100, 'three')); bigText('BEYOND NEPTUNE', 1380, 620, 64, '#fff', tl, WT(100, 'three') + 0.2); tag('REPORTED BEFORE THE SURVEY BEGAN', 960, 900, tl, 0.3, { size: 42, bg: '#fff' }); }, cues: [[wordT(100, 'eleven'), 'tick'], [wordT(100, 'three'), 'tick']] });
shot(A(101), (tl, d, t) => { space(t, { mw: 1, mwY: 540, mwRot: -0.15, density: 2.2 }); const r = rnd(101); for (let i = 0; i < 14; i++) { const x = 120 + r() * 1680, y = 120 + r() * 840, t0 = 0.3 + i * 0.22; const k = pop(tl, t0); if (k <= 0) continue; circle(x, y, 4); shape('#ffd0b8', null); ctx.save(); ctx.globalAlpha = Math.min(1, k); circle(x, y, 28 * k); ctx.strokeStyle = YEL; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); } vig(0.4); },
  { ui: (tl) => tag('EVERY IMAGE: ANOTHER CHANCE', 960, 110, tl, 0.2, { size: 52, bg: YEL }), cues: [[A(101) + 0.3, 'sparkle'], [A(101) + 1.4, 'sparkle']] });

// ================================================================ ENDING
shot(A(102), (tl, d, t) => { space(t, { mw: 0.85, mwY: 560, mwRot: -0.2, density: 1.4, drift: 0.4 }); sunPoint(230, 300, 0.7, t); ed(1250, 600, lerp(260, 200, easeIO(tl / 6)), t); vig(); }, { cam: [[1060, 560, 1.12], [960, 540, 1.0]], ui: (tl) => tag('4 BILLION MILES AWAY', 960, 110, tl, 0.4, { size: 54, bg: YEL }), cues: [[A(102) + 0.4, 'pop']] });
shot(A(103), (tl, d, t) => { bgPlain('#16203a', '#060a14');
  iconCard(380, 520, pop(tl, WT(103, 'camera')), 'THE BIGGEST CAMERA', () => { sensor(0, 0, 120, 3, {}); });
  iconCard(960, 520, pop(tl, WT(103, 'photos')), '10 YEARS OF PHOTOS', () => { frame(-150, -110, 300, 200, '', 0, { seed: 21, density: 0.35, dot: [150, 100], ring: true }); });
  iconCard(1540, 520, pop(tl, WT(103, 'astronomer')), 'ONE CAREFUL LOOK', () => { circle(-20, -10, 80); ctx.lineWidth = 16; ctx.strokeStyle = '#e8e2d4'; ctx.stroke(); line(40, 50, 120, 130, 22, '#e8e2d4'); }); },
  { cues: [[wordT(103, 'camera'), 'pop'], [wordT(103, 'photos'), 'pop'], [wordT(103, 'astronomer'), 'pop']] });
shot(A(104), (tl, d, t) => { space(t, { density: 0.9 }); ed(1500, 560, 200, t); qmark(700, 520, 2.4, tl, 0.15, YEL); vig(0.5); }, { ui: (tl) => tag('A QUESTION FOR YOU', 700, 930, tl, 0.3, { size: 54, bg: '#fff' }), cues: [[A(104) + 0.15, 'boing']] });
shot(A(105), (tl, d, t) => { bgPlain('#16203a', '#060a14'); [['PLANET?', 'planet', 380, '#3B6FD6'], ['DWARF PLANET?', 'dwarf', 960, EDC], ['SOMETHING ELSE?', 'else', 1540, '#5b3fb8']].forEach(([lab, w, x, col]) => { const k = pop(tl, WT(105, w)); if (k <= 0) return; withT(x, 540, 0, k, () => { rrect(-260, -170, 520, 340, 30); shape(col, INK, 7); text(lab, 0, 10, 56, '#fff', 900, 'center', INK, 9); }); }); },
  { cues: [[wordT(105, 'planet'), 'pop'], [wordT(105, 'dwarf'), 'pop'], [wordT(105, 'else'), 'pop']] });
shot(A(106), (tl, d, t) => { bgPlain('#16203a', '#060a14'); [['PLANET?', 380, '#3B6FD6'], ['DWARF PLANET?', 960, EDC], ['SOMETHING ELSE?', 1540, '#5b3fb8']].forEach(([lab, x, col]) => withT(x, 470, 0, 0.9, () => { rrect(-260, -170, 520, 340, 30); shape(col, INK, 7); text(lab, 0, 10, 56, '#fff', 900, 'center', INK, 9); })); },
  { ui: (tl) => tag('💬 TELL ME IN THE COMMENTS', 960, 880, tl, 0.2, { size: 56, bg: YEL }), cues: [[A(106) + 0.2, 'pop']] });

window.MUSIC_SEC = { fall: S(45) - 0.1, death: S(80) - 0.1, callback: S(92) - 0.1 };
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
