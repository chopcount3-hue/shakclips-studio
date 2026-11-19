// ================================================================ "This Mountain Spins Every Four Minutes"
// Lane: extremes (the largest ultra-fast rotator) + a what-if (standing on it). One light per frame: the Sun.
const SHOTS = [], CUES = [];
const A = (i, d = -0.06) => S(i) + d;
const WT = (i, w) => wordT(i, w) - A(i);
function shot(a, draw, o = {}) { SHOTS.push({ a, draw, cam: o.cam, ui: o.ui }); (o.cues || []).forEach(c => CUES.push(c)); if (!o.noWhoosh) CUES.push([a, 'whoosh']); }
const YEL = '#FFD24A', ROSE = '#FF6B5A', ICE = '#9FD8FF', MINT = '#7CF2B0', VIO = '#B48CFF', AMBER = '#FFB347', IRC = '#FF5A3A';
const D2R = Math.PI / 180, TAU = Math.PI * 2;
const _cache = {};
function cached(key, fn) { return _cache[key] || (_cache[key] = fn()); }
const take = (tl) => tag("SHAK'S TAKE", 260, 90, tl, 0.15, { size: 44, bg: VIO, col: '#fff' });
const fast = (txt, tl) => tag(txt || 'TIME SPED UP', 230, 1010, tl, 0.2, { size: 28, bg: 'rgba(255,255,255,0.85)' });

// ---------------------------------------------------------------- backgrounds
function space(t, o = {}) {
  sky(o.top || '#02040b', o.bot || '#070d1e');
  if (o.neb) COS.nebula(o.nebSeed || 3, { t, alpha: o.neb, hues: o.hues || ['#2a3a6a', '#4a2a5a'] });
  if (o.mw) COS.milkyWay({ y: o.mwY === undefined ? 470 : o.mwY, rot: o.mwRot === undefined ? -0.28 : o.mwRot, thick: 230, alpha: o.mw, seed: 31 });
  COS.starfield(o.seed || 7, { density: o.density || 1, twinkleT: t, drift: (o.drift || 0) * t, alpha: o.starA });
}
function vig(k = 0.55) { COS.vignette(k); }
function sun(x, y, r, t, a = 1) { COS.star(x, y, r, { t, core: '#fffef6', mid: '#ffe6a8', out: '#ffb24a', alpha: a, rayN: 14, seed: 4 }); }

// ---------------------------------------------------------------- the asteroid: a real shaded 3D mesh
function v3n(p) { const l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l]; }
function icosphere(n) {
  return cached('ico' + n, () => {
    const t = (1 + Math.sqrt(5)) / 2;
    let v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(v3n);
    let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    for (let k = 0; k < n; k++) {
      const mid = {}, nf = [];
      const m = (a, b) => { const key = a < b ? a + '_' + b : b + '_' + a; if (mid[key] !== undefined) return mid[key]; const p = v3n([(v[a][0] + v[b][0]) / 2, (v[a][1] + v[b][1]) / 2, (v[a][2] + v[b][2]) / 2]); v.push(p); return (mid[key] = v.length - 1); };
      f.forEach(([a, b, c]) => { const ab = m(a, b), bc = m(b, c), ca = m(c, a); nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); });
      f = nf;
    }
    return { v, f };
  });
}
// kind: 'mono' (cratered, coherent) | 'rubble' (boulder-covered pile)
function rockMesh(seed, kind, n) {
  return cached('rock' + seed + kind + n, () => {
    const ico = icosphere(n), r = rnd(seed), feats = [];
    const lobes = Array.from({ length: 7 }, () => [v3n([r() - 0.5, r() - 0.5, r() - 0.5]), 0.45 + r() * 0.6, (r() - 0.45) * 0.3]);
    const nCr = kind === 'rubble' ? 6 : 30, nBo = kind === 'rubble' ? 170 : 0;
    for (let i = 0; i < nCr; i++) feats.push([v3n([r() - 0.5, r() - 0.5, r() - 0.5]), 0.08 + Math.pow(r(), 2) * 0.34, 'c']);
    for (let i = 0; i < nBo; i++) feats.push([v3n([r() - 0.5, r() - 0.5, r() - 0.5]), 0.05 + r() * 0.09, 'b']);
    const ax = kind === 'rubble' ? [1.05, 0.95, 0.88] : [1.22, 0.96, 0.8];
    const albedo = [];
    const V = ico.v.map((p) => {
      let d = 1;
      lobes.forEach(([c, w, h]) => { const dot = p[0] * c[0] + p[1] * c[1] + p[2] * c[2]; d += h * Math.exp(-(1 - dot) / (w * 0.5)); });
      let alb = 0.9;
      feats.forEach(([c, w, ty]) => { const dot = p[0] * c[0] + p[1] * c[1] + p[2] * c[2], ang = Math.acos(Math.min(1, dot)), x = ang / w;
        if (x > 1.6) return;
        if (ty === 'c') { d += (x < 1 ? -0.32 * w * (1 - x * x) * (1 - x * x) : 0) + 0.07 * w * Math.exp(-((x - 1.0) * (x - 1.0)) / 0.05); if (x < 1) alb -= 0.05 * (1 - x * x); }
        else { if (x < 1) { d += 0.55 * w * Math.sqrt(1 - x * x); alb += 0.05; } } });
      const nz = Math.sin(p[0] * 9 + seed) * Math.sin(p[1] * 8) * Math.sin(p[2] * 10);
      albedo.push(Math.max(0.55, Math.min(1.1, alb + nz * 0.08)));
      d *= 1 + nz * 0.012;
      return [p[0] * d * ax[0], p[1] * d * ax[1], p[2] * d * ax[2]];
    });
    const F = ico.f.map(([a, b, c]) => { const A = V[a], B = V[b], C = V[c];
      const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
      const nn = v3n([u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]);
      return { a, b, c, n: nn, alb: (albedo[a] + albedo[b] + albedo[c]) / 3 }; });
    const VN = V.map(() => [0, 0, 0]);
    ico.f.forEach(([p, q, r2], k) => { const n = F[k].n; [p, q, r2].forEach((vi) => { VN[vi][0] += n[0]; VN[vi][1] += n[1]; VN[vi][2] += n[2]; }); });
    return { V, F, VN: VN.map(v3n), VA: albedo };
  });
}
// body -> view: spin phi about body z, then tilt so z points up the screen (with `incl` toward the viewer), then roll.
function rockXf(o) {
  const phi = o.phi || 0, inc = (o.incl === undefined ? 18 : o.incl) * D2R, roll = (o.roll || 0) * D2R;
  const cp = Math.cos(phi), sp = Math.sin(phi), ci = Math.cos(inc), si = Math.sin(inc), cr = Math.cos(roll), sr = Math.sin(roll);
  return (p) => { const x = p[0] * cp - p[1] * sp, y = p[0] * sp + p[1] * cp, z = p[2];
    // view: X right, Y up, Z toward viewer. body z -> up (rotated toward viewer by inc), body y -> toward viewer
    const X = x, Y = z * ci + y * si, Z = z * si - y * ci;   // a proper rotation (det +1)
    return [X * cr - Y * sr, X * sr + Y * cr, Z]; };
}
const SUNL = v3n([-0.78, 0.32, 0.53]);
let _off = null, _octx = null;
function rock(cx, cy, R, o = {}) {   // software-rasterised, smooth-shaded (per-pixel normals, z-buffer)
  const mesh = rockMesh(o.seed || 491, o.kind || 'mono', o.n || (R > 110 ? 4 : 3)), xf = rockXf(o), L = o.L || SUNL;
  const base = o.col || [168, 154, 138], amb = o.amb === undefined ? 0.05 : o.amb, A = o.alpha === undefined ? 1 : o.alpha;
  if (A <= 0.004 || R < 0.5) return;
  if (o.halo !== false) COS.glow(cx, cy, R * 1.5, '#9fb4d8', 0.05 * A);
  const P = mesh.V.map(xf), N = mesh.VN.map(xf), VA = mesh.VA;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of P) { const sx = cx + p[0] * R, sy = cy - p[1] * R; if (sx < x0) x0 = sx; if (sx > x1) x1 = sx; if (sy < y0) y0 = sy; if (sy > y1) y1 = sy; }
  x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; const w = Math.ceil(x1) - x0 + 2, h = Math.ceil(y1) - y0 + 2;
  if (w <= 0 || h <= 0 || w * h > 9e6) return;
  if (!_off) { _off = document.createElement('canvas'); _octx = _off.getContext('2d'); }
  if (_off.width < w || _off.height < h) { _off.width = Math.max(_off.width, w); _off.height = Math.max(_off.height, h); }
  const img = _octx.createImageData(w, h), D = img.data, zb = new Float32Array(w * h).fill(-1e9);
  const SX = new Float32Array(P.length), SY = new Float32Array(P.length);
  for (let i = 0; i < P.length; i++) { SX[i] = cx + P[i][0] * R - x0; SY[i] = cy - P[i][1] * R - y0; }
  const Lx = L[0], Ly = L[1], Lz = L[2];
  for (const f of mesh.F) {
    const ia = f.a, ib = f.b, ic = f.c;
    const ax = SX[ia], ay = SY[ia], bx = SX[ib], by = SY[ib], qx = SX[ic], qy = SY[ic];
    const area = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax); if (Math.abs(area) < 1e-6) continue;
    const fz = (P[ib][0] - P[ia][0]) * (P[ic][1] - P[ia][1]) - (P[ib][1] - P[ia][1]) * (P[ic][0] - P[ia][0]); if (fz <= 0) continue;   // back face
    const mnx = Math.max(0, Math.floor(Math.min(ax, bx, qx))), mxx = Math.min(w - 1, Math.ceil(Math.max(ax, bx, qx)));
    const mny = Math.max(0, Math.floor(Math.min(ay, by, qy))), mxy = Math.min(h - 1, Math.ceil(Math.max(ay, by, qy)));
    const za = P[ia][2], zbb = P[ib][2], zc = P[ic][2], na = N[ia], nb = N[ib], nc = N[ic], aa = VA[ia], ab = VA[ib], ac = VA[ic], inv = 1 / area;
    for (let y = mny; y <= mxy; y++) { const py = y + 0.5;
      for (let x = mnx; x <= mxx; x++) { const px = x + 0.5;
        let w0 = ((bx - px) * (qy - py) - (by - py) * (qx - px)) * inv, w1 = ((qx - px) * (ay - py) - (qy - py) * (ax - px)) * inv, w2 = 1 - w0 - w1;
        if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
        const z = w0 * za + w1 * zbb + w2 * zc, k0 = y * w + x; if (z <= zb[k0]) continue; zb[k0] = z;
        let nx = w0 * na[0] + w1 * nb[0] + w2 * nc[0], ny = w0 * na[1] + w1 * nb[1] + w2 * nc[1], nz = w0 * na[2] + w1 * nb[2] + w2 * nc[2];
        const l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= l; ny /= l; nz /= l;
        const lam = Math.max(0, (nx * Lx + ny * Ly + nz * Lz + 0.12) / 1.12), alb = w0 * aa + w1 * ab + w2 * ac;
        const kk = (amb + (1 - amb) * Math.pow(lam, 0.85)) * alb, rim = Math.pow(Math.max(0, 1 - nz), 3) * 0.12 * Math.max(0, nx * Lx + ny * Ly);
        const p4 = k0 * 4; D[p4] = Math.min(255, base[0] * kk + rim * 255); D[p4 + 1] = Math.min(255, base[1] * kk + rim * 240); D[p4 + 2] = Math.min(255, base[2] * kk + rim * 220); D[p4 + 3] = 255;
      } }
  }
  _octx.clearRect(0, 0, w, h); _octx.putImageData(img, 0, 0);
  ctx.save(); ctx.globalAlpha *= A; ctx.drawImage(_off, 0, 0, w, h, x0, y0, w, h); ctx.restore();
}
// project a body-frame point to the screen with the same transform (for particles, markers, axes)
function rockPt(cx, cy, R, o, p) { const q = rockXf(o)(p); return [cx + q[0] * R, cy - q[1] * R, q[2]]; }
function spinAxis(cx, cy, R, o, a = 1, col = YEL) {
  const top = rockPt(cx, cy, R, o, [0, 0, 1.5]), bot = rockPt(cx, cy, R, o, [0, 0, -1.5]);
  ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([18, 14]); line(bot[0], bot[1], top[0], top[1], 6, col); ctx.setLineDash([]); ctx.restore();
  return { top, bot };
}
function spinArrow(cx, cy, rx, ry, tl, a = 1, col = YEL) {   // a curved arrow around the spin axis
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineCap = 'round';
  const s0 = 0.15 * Math.PI + tl * 0.8, s1 = s0 + 1.25 * Math.PI;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, s0, s1); ctx.stroke();
  const ex = cx + Math.cos(s1) * rx, ey = cy + Math.sin(s1) * ry, tx = -Math.sin(s1) * rx, ty = Math.cos(s1) * ry, tn = Math.hypot(tx, ty), ux = tx / tn, uy = ty / tn;
  ctx.beginPath(); ctx.moveTo(ex + ux * 26, ey + uy * 26); ctx.lineTo(ex - uy * 18, ey + ux * 18); ctx.lineTo(ex + uy * 18, ey - ux * 18); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.restore();
}
// spin phase for a body that turns once every `per` seconds of screen time
const ph = (t, per) => TAU * t / per;

// ---------------------------------------------------------------- rubble pile coming apart
function breakup(cx, cy, R, u, t, o = {}) {   // u 0..1: pile spins up, equator grains lift off
  const phi = o.phi0 === undefined ? 0 : o.phi0, spin = phi + t * (0.4 + 2.6 * u * u);
  const ro = { phi: spin, kind: 'rubble', seed: o.seed || 77, incl: 14 };
  const pts = cached('grav' + (o.seed || 77), () => { const r = rnd(o.seed || 77); return Array.from({ length: 220 }, () => [r() * TAU, (r() - 0.5) * 0.5, 0.25 + r() * 0.75, r()]); });
  const lift = ss(0.35, 1, u);
  const behind = [], front = [];
  pts.forEach(([a0, lat, sp, b]) => { const k = clamp((lift - b * 0.5) / 0.5, 0, 1); if (k <= 0) return;
    const d = 1.02 + k * k * 2.6 * sp, a = a0 + spin + k * 0.9, p = rockPt(cx, cy, R, ro, [Math.cos(a) * d, Math.sin(a) * d, lat * 0.6]);
    (p[2] < 0 ? behind : front).push([p, b, k]); });
  const dot = ([p, b, k]) => { const s = 3 + b * 7; circle(p[0], p[1], s); shape(`rgb(${110 + b * 50},${100 + b * 44},${90 + b * 38})`, null); };
  behind.forEach(dot); rock(cx, cy, R, ro); front.forEach(dot);
}

// ---------------------------------------------------------------- Bennu touch-and-go
function probe(x, y, s, rot = 0, o = {}) {   // a generic sample-return spacecraft with a long arm (original design)
  withT(x, y, rot, s, () => {
    rrect(-46, -260, 92, 120, 12); shape('#d8dde6', INK, 4);
    rrect(-180, -238, 120, 60, 6); shape('#2b4c8a', '#9fb4d8', 3); rrect(60, -238, 120, 60, 6); shape('#2b4c8a', '#9fb4d8', 3);
    for (let i = 1; i < 4; i++) { line(-180 + i * 30, -238, -180 + i * 30, -178, 2, '#9fb4d8'); line(60 + i * 30, -238, 60 + i * 30, -178, 2, '#9fb4d8'); }
    line(0, -140, 0, -10, 8, '#c9ced6'); circle(0, -4, 14); shape('#e8edf3', INK, 3);
    if (o.puff) { const k = o.puff; const r = rnd(9); for (let i = 0; i < 26; i++) { const a = -Math.PI + r() * Math.PI, d = 20 + k * (60 + r() * 140); circle(Math.cos(a) * d, -4 - Math.abs(Math.sin(a)) * d * 0.7, 4 + r() * 6); shape(`rgba(170,160,150,${0.8 * (1 - k * 0.6)})`, null); } }
  });
}
function rubbleGround(t, y0, o = {}) {   // a close-up of a pebble-and-boulder surface
  const g = ctx.createLinearGradient(0, y0 - 60, 0, H); g.addColorStop(0, '#3e3832'); g.addColorStop(1, '#1a1714'); ctx.fillStyle = g; ctx.fillRect(-200, y0, W + 400, H - y0 + 200);
  const pts = cached('peb' + (o.seed || 5), () => { const r = rnd(o.seed || 5); return Array.from({ length: 420 }, () => [r() * 2300 - 190, r(), 6 + Math.pow(r(), 3) * 70, r()]); });
  pts.forEach(([x, f, s, b]) => { const y = y0 + f * (H - y0 + 40) + 10; const ss2 = s * (0.5 + f); const gg = ctx.createRadialGradient(x - ss2 * 0.35, y - ss2 * 0.4, 1, x, y, ss2); gg.addColorStop(0, `rgb(${100 + b * 70 | 0},${92 + b * 62 | 0},${82 + b * 52 | 0})`); gg.addColorStop(1, `rgb(${28 + b * 20 | 0},${25 + b * 18 | 0},${22 + b * 16 | 0})`); ellipse(x + ss2 * 0.2, y + ss2 * 0.35, ss2, ss2 * 0.5); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); ellipse(x, y, ss2, ss2 * (0.5 + b * 0.25)); ctx.fillStyle = gg; ctx.fill(); });
}

// ---------------------------------------------------------------- Rubin: a mountaintop observatory at night
function observatory(t, o = {}) {
  sky('#020512', '#0d1838'); COS.milkyWay({ y: 380, rot: -0.38, thick: 260, alpha: 0.75, seed: 31 }); COS.starfield(21, { density: 1.3, twinkleT: t });
  ctx.fillStyle = '#05070d'; poly([[-100, 1080], [-100, 820], [260, 760], [560, 700], [820, 640], [1100, 660], [1420, 740], [1700, 790], [2040, 830], [2040, 1080]]); ctx.fill();
  const x = o.x || 960, y = 650, s = o.s || 1;
  withT(x, y, 0, s, () => {
    rrect(-210, -40, 420, 120, 8); shape('#c9cfd8', '#0a0e18', 4);
    rrect(-150, -170, 300, 140, 6); shape('#dfe4ea', '#0a0e18', 4);
    ctx.beginPath(); ctx.moveTo(-160, -170); ctx.lineTo(-120, -260); ctx.lineTo(120, -260); ctx.lineTo(160, -170); ctx.closePath(); shape('#eef1f5', '#0a0e18', 4);
    const op = o.open === undefined ? 1 : o.open; rrect(-34 * op, -258, 68 * op, 88, 4); shape('#0b1020', null);
    if (op > 0.5) { ctx.save(); ctx.globalAlpha = 0.25 * (op - 0.5) * 2; ctx.fillStyle = '#bfd8ff'; poly([[-30, -258], [30, -258], [260, -1100], [80, -1100]]); ctx.fill(); ctx.restore(); }
    for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(255,90,60,0.8)'; ctx.fillRect(-190 + i * 52, 10, 8, 6); }
  });
}
function cameraCCD(x, y, s, tl) {   // the focal plane: a round mosaic of square sensors
  withT(x, y, 0, s, () => {
    circle(0, 0, 330); shape('#1a2236', '#cfd8ea', 8);
    const n = 5, w = 104; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { if (Math.abs(i) === 2 && Math.abs(j) === 2) continue; const k = clamp((tl - 0.08 * (i + j + 4)) / 0.4, 0, 1); if (k <= 0) continue;
      ctx.save(); ctx.globalAlpha = k; rrect(i * (w + 8) - w / 2, j * (w + 8) - w / 2, w, w, 4); const g = ctx.createLinearGradient(-300, -300, 300, 300); g.addColorStop(0, '#5a6fb0'); g.addColorStop(0.5, '#a4b4ea'); g.addColorStop(1, '#3a4a86'); shape(g, '#0a0e18', 3); ctx.restore(); }
  });
}
// a sky image with moving asteroid dots and brightness pips
function skyPatch(x, y, w, h, tl, o = {}) {
  rrect(x - w / 2, y - h / 2, w, h, 16); shape('#04060c', '#cfd8ea', 5);
  ctx.save(); rrect(x - w / 2, y - h / 2, w, h, 16); ctx.clip();
  const r = rnd(o.seed || 17); for (let i = 0; i < 140; i++) { const px = x - w / 2 + r() * w, py = y - h / 2 + r() * h; COS.glow(px, py, 2 + r() * 7, '#dfe6ff', 0.45); }
  const m = rnd(5); for (let i = 0; i < (o.n || 14); i++) { const px = x - w / 2 + m() * w + tl * 40 * (m() - 0.3), py = y - h / 2 + m() * h + tl * 18 * (m() - 0.5), b = 0.55 + 0.45 * Math.sin(tl * (2 + m() * 6) + i);
    COS.glow(px, py, 34 * b + 10, '#ffd9a0', 0.9 * b); circle(px, py, 4 + 4 * b); shape('#fff3dc', null); circle(px, py, 26); ctx.strokeStyle = 'rgba(124,242,176,0.75)'; ctx.lineWidth = 2.5; ctx.stroke(); }
  ctx.restore();
}

// ---------------------------------------------------------------- charts
function lightCurve(x, y, w, h, u, o = {}) {   // double-peaked brightness from an elongated spinner (shape simplified)
  rrect(x - 40, y - h - 50, w + 80, h + 130, 20); shape('rgba(8,12,26,0.9)', '#cfd8ea', 4);
  line(x, y, x + w, y, 4, '#cfd8ea'); line(x, y, x, y - h, 4, '#cfd8ea');
  text('BRIGHTNESS', x + 8, y - h - 18, 28, '#cfd8ea', 900, 'left', null); text('TIME →', x + w, y + 44, 30, '#cfd8ea', 900, 'right', null);
  const turns = o.turns || 2, f = (q) => 0.55 + 0.32 * Math.cos(q * TAU * 2) + 0.04 * Math.cos(q * TAU);
  const end = clamp(u, 0, 1);
  ctx.save(); ctx.beginPath(); for (let q = 0; q <= end + 1e-6; q += 0.003) { const px = x + q * w, py = y - f(q * turns) * h; q ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.strokeStyle = AMBER; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  COS.glow(x + end * w, y - f(end * turns) * h, 30, AMBER, 0.8);
  if (o.mark) { for (let k = 0; k <= turns; k++) { const px = x + k / turns * w; if (k / turns > end + 0.01) break; ctx.save(); ctx.setLineDash([10, 10]); line(px, y, px, y - h, 3, MINT); ctx.restore(); }
    if (end > 1 / turns) { const a = x, b = x + w / turns; line(a, y - h - 4, b, y - h - 4, 5, MINT); text(o.mark, (a + b) / 2, y - h - 34, 34, MINT, 900, 'center', INK, 6); } }
  text('SHAPE SIMPLIFIED', 1840, 60, 24, 'rgba(207,216,234,0.7)', 900, 'right', null);
}
// diameter (km, log) vs rotation period (hours, log): the spin barrier (dots illustrative)
const PX0 = 300, PX1 = 1620, PY0 = 900, PY1 = 170;
const pX = (km) => PX0 + (Math.log10(km) + 2) / 3 * (PX1 - PX0), pY = (hr) => PY0 - (Math.log10(hr) + 2) / 4 * (PY0 - PY1);
function barrierPlot(tl, o = {}) {
  rrect(PX0 - 120, PY1 - 70, PX1 - PX0 + 200, PY0 - PY1 + 200, 20); shape('rgba(8,12,26,0.92)', '#cfd8ea', 4);
  line(PX0, PY0, PX1, PY0, 4, '#cfd8ea'); line(PX0, PY0, PX0, PY1, 4, '#cfd8ea');
  [[0.01, '10 m'], [0.1, '100 m'], [1, '1 km'], [10, '10 km']].forEach(([k, l]) => { line(pX(k), PY0, pX(k), PY0 + 12, 3, '#cfd8ea'); text(l, pX(k), PY0 + 42, 28, '#cfd8ea', 900, 'center', null); });
  [[0.01, '36 s'], [0.1, '6 MIN'], [1, '1 H'], [10, '10 H'], [100, '100 H']].forEach(([h, l]) => { line(PX0 - 12, pY(h), PX0, pY(h), 3, '#cfd8ea'); text(l, PX0 - 22, pY(h), 26, '#cfd8ea', 900, 'right', null); });
  text('SIZE →', PX1, PY0 + 84, 30, '#cfd8ea', 900, 'right', null); text('TIME FOR ONE TURN', PX0 - 100, PY1 - 36, 28, '#cfd8ea', 900, 'left', null); text('▲ SLOWER', PX0 + 260, PY1 - 36, 26, 'rgba(207,216,234,0.7)', 900, 'left', null);
  text('DOTS ILLUSTRATIVE', 1840, 60, 24, 'rgba(207,216,234,0.7)', 900, 'right', null);
  const pts = cached('bp', () => { const r = rnd(13), a = []; for (let i = 0; i < 520; i++) { const lk = -2 + r() * 3, km = Math.pow(10, lk); let lh;
    if (km > 0.15) lh = Math.log10(2.3) + Math.pow(r(), 1.3) * 1.8; else lh = -1.9 + r() * 3.7; if (lh > 1.95) lh = 1.95 - r() * 0.2; a.push([km, Math.pow(10, lh), r()]); } return a; });
  const n = Math.floor(pts.length * clamp((o.dots === undefined ? 1 : o.dots), 0, 1));
  for (let i = 0; i < n; i++) { const [km, hr] = pts[i]; circle(pX(km), pY(hr), 5.5); shape('rgba(159,196,255,0.75)', null); }
  if (o.bar) { const k = o.bar; ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([22, 14]); line(pX(0.15), pY(2.2), lerp(pX(0.15), PX1, k), pY(2.2), 7, ROSE); ctx.setLineDash([]); ctx.fillStyle = 'rgba(255,107,90,0.12)'; ctx.fillRect(pX(0.15), pY(2.2), PX1 - pX(0.15), PY0 - pY(2.2)); ctx.restore();
    if (k > 0.6) text('2.2 HOURS', PX1 - 10, pY(2.2) - 34, 40, ROSE, 900, 'right', INK, 7); }
  const star = (km, hr, lab, a, col, dx = 0, dy = 60) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, a); COS.glow(pX(km), pY(hr), 46, col, 0.7); circle(pX(km), pY(hr), 13); shape(col, INK, 4); text(lab, pX(km) + dx, pY(hr) + dy, 34, '#fff', 900, 'center', INK, 7); ctx.restore(); };
  star(0.71, 1.88 / 60, '2025 MN45', o.mn || 0, ICE, -40, -54);
  star(1.99, 5.34 / 60, '566130', o.b2 || 0, MINT, -10, -54);
  star(2.53, 4.18 / 60, '491384', o.star || 0, YEL, 60, 60);
}
function speedSign(x, y, s, tl, t0 = 0, top = 'SPIN LIMIT', mid = '1 TURN', bot = 'PER 2.2 HOURS') {
  const k = pop(tl, t0); if (k <= 0) return;
  withT(x, y, 0, s * k, () => { line(0, 120, 0, 420, 22, '#9aa3b0'); rrect(-190, -230, 380, 360, 24); shape('#f7f7f2', INK, 10); rrect(-170, -210, 340, 320, 16); shape(null, INK, 5);
    text(top, 0, -160, 46, INK, 900, 'center', null); text(mid, 0, -60, 84, INK, 900, 'center', null); text(bot, 0, 40, 42, INK, 900, 'center', null); });
}
function forceArrows(cx, cy, tl, o = {}) {   // a person on the rim: a tiny gravity arrow vs a long outward arrow
  const gk = ss(0.1, 0.5, tl), ok = ss(o.t2 || 1.0, (o.t2 || 1.0) + 0.6, tl);
  if (gk > 0) { ctx.save(); ctx.globalAlpha = gk; COS.arrow(ctx, cx, cy - 10, cx, cy + 30, { col: ICE, lw: 10 }); ctx.restore(); text('GRAVITY', cx + 30, cy + 40, 34, ICE, 900, 'left', INK, 7); }
  if (ok > 0) { ctx.save(); ctx.globalAlpha = ok; COS.arrow(ctx, cx, cy - 30, cx, cy - 30 - 520 * ok, { col: ROSE, lw: 18 }); ctx.restore(); text('SPIN: OUTWARD', cx + 60, cy - 330, 40, ROSE, 900, 'left', INK, 7); }
}
// a simple original spacesuit figure (scale only, never a presenter)
function astro(x, y, s, rot = 0, o = {}) {
  withT(x, y, rot, s, () => {
    const suit = '#eef1f5';
    line(-18, -60, -24, 0, 22, suit); line(18, -60, 26 + (o.kick || 0) * 30, -2, 22, suit);
    rrect(-46, -170, 92, 120, 26); shape(suit, INK, 5); rrect(-60, -160, 22, 86, 10); shape('#c9ced6', INK, 4);
    const aL = o.armL === undefined ? 0.4 : o.armL, aR = o.armR === undefined ? -0.4 : o.armR;
    line(-40, -150, -40 + Math.sin(aL) * 80, -150 + Math.cos(aL) * 80, 18, suit); line(40, -150, 40 + Math.sin(aR) * 80, -150 + Math.cos(aR) * 80, 18, suit);
    circle(0, -210, 52); shape(suit, INK, 5); ellipse(8, -210, 34, 28); const g = ctx.createLinearGradient(-20, -240, 30, -180); g.addColorStop(0, '#ffd27a'); g.addColorStop(1, '#a8701e'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ellipse(-2, -224, 10, 6); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
  });
}
function pebble(x, y, r, rot = 0) { withT(x, y, rot, 1, () => { ellipse(0, 0, r, r * 0.75); const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r); g.addColorStop(0, '#b9ab98'); g.addColorStop(1, '#4a4038'); ctx.fillStyle = g; ctx.fill(); }); }
// the curved horizon of a small, fast-turning world; sun position and star wheel from phase q (0..1 = one turn)
function horizonView(t, q, o = {}) {
  const day = Math.max(0, Math.sin(q * TAU));
  sky(day > 0.02 ? '#000000' : '#01030a', '#03060f');
  ctx.save(); ctx.translate(960, 1500); ctx.rotate(-q * TAU * (o.wheel === undefined ? 1 : o.wheel)); ctx.translate(-960, -1500);
  COS.starfield(41, { density: 1.6, twinkleT: t, alpha: 1 - 0.6 * day }); ctx.restore();
  const a = Math.PI - q * TAU, sx = 960 + Math.cos(a) * 980, sy = 1100 - Math.sin(a) * 900;
  if (sy < 1060) { COS.glow(sx, sy, 380, '#fff1c8', 0.25); sun(sx, sy, 46, t); }
  // ground: a big curved limb, lit by the low sun from its side
  const R = 1700, gx = 960, gy = 820 + R;
  ctx.beginPath(); ctx.arc(gx, gy, R, 0, TAU); const lit = clamp(day * 1.4, 0, 1), g = ctx.createLinearGradient(sx < 960 ? 0 : W, 0, sx < 960 ? W : 0, 0);
  g.addColorStop(0, `rgb(${40 + 110 * lit | 0},${36 + 98 * lit | 0},${32 + 84 * lit | 0})`); g.addColorStop(1, `rgb(${18 + 40 * lit | 0},${16 + 36 * lit | 0},${14 + 30 * lit | 0})`); ctx.fillStyle = g; ctx.fill();
  const pts = cached('hz', () => { const r = rnd(8); return Array.from({ length: 70 }, () => [r() * 2200 - 140, r(), 8 + Math.pow(r(), 2.5) * 60]); });
  pts.forEach(([x, f, s]) => { const y = gy - Math.sqrt(Math.max(0, R * R - (x - gx) * (x - gx))) + 10 + f * 260; ellipse(x, y, s, s * 0.5); ctx.fillStyle = `rgba(${20 + 70 * lit | 0},${18 + 62 * lit | 0},${16 + 54 * lit | 0},0.9)`; ctx.fill(); });
  return { sx, sy, day };
}
function paper(x, y, s, head, sub, col, tl) { withT(x, y, 0.03, pop(tl, 0.2) * s, () => { rrect(-330, -380, 660, 760, 20); shape('#f6f2ea', INK, 7); rrect(-330, -380, 660, 140, 20); shape(col, INK, 7); text(head, 0, -310, head.length > 12 ? 50 : 72, '#fff', 900, 'center', null); text(sub, 0, -150, 40, INK, 900, 'center', null); for (let i = 0; i < 7; i++) line(-260, -50 + i * 60, 260 - (i % 3) * 60, -50 + i * 60, 10, '#c9c2b4'); }); }
function strengthBar(x, y, w, lab, val, k, col, sub) {
  rrect(x, y - 34, w, 68, 34); shape('rgba(255,255,255,0.08)', '#cfd8ea', 3); if (k > 0) { rrect(x, y - 34, Math.max(68, w * val * k), 68, 34); shape(col, INK, 4); }
  text(lab, x, y - 72, 40, '#fff', 900, 'left', INK, 7); if (sub && k > 0.6) text(sub, x + w, y - 72, 40, col, 900, 'right', INK, 7);
}
// YORP: sunlight in, infrared out unevenly, a slow torque
function yorpRays(cx, cy, R, tl, a = 1) {
  for (let i = 0; i < 7; i++) { const yy = cy - R * 0.9 + i * R * 0.3, f = ((tl * 0.7 + i * 0.17) % 1);
    ctx.save(); ctx.globalAlpha = a * (0.4 + 0.6 * (1 - f)); COS.arrow(ctx, cx - R * 2.6 + f * R * 0.9, yy, cx - R * 1.45 + f * R * 0.9, yy, { col: YEL, lw: 8 }); ctx.restore(); }
}
function irGlow(cx, cy, R, tl, a = 1, bias = 1) {
  for (let i = 0; i < 9; i++) { const an = -1.1 + i * 0.28, f = ((tl * 0.55 + i * 0.13) % 1), len = (i > 4 ? 1.0 + 0.6 * bias : 0.7) * R * 0.55;
    const x0 = cx + Math.cos(an) * R * 1.12, y0 = cy + Math.sin(an) * R * 0.95;
    ctx.save(); ctx.globalAlpha = a * (0.25 + 0.75 * (1 - f)); COS.arrow(ctx, x0 + Math.cos(an) * f * 30, y0 + Math.sin(an) * f * 30, x0 + Math.cos(an) * (len + f * 30), y0 + Math.sin(an) * (len + f * 30), { col: IRC, lw: i > 4 ? 10 : 6 }); ctx.restore(); }
}
function dartProbe(x, y, s, rot) { withT(x, y, rot, s, () => { rrect(-30, -30, 60, 60, 6); shape('#d8dde6', INK, 3); rrect(-160, -16, 120, 32, 4); shape('#2b4c8a', '#9fb4d8', 2); rrect(40, -16, 120, 32, 4); shape('#2b4c8a', '#9fb4d8', 2); }); }
function belt(t, o = {}) {   // the inner solar system from above with a crowd of asteroid dots
  const cx = o.cx || 960, cy = o.cy || 560, k = o.k || 1;
  sun(cx, cy, 34, t);
  [[150, '#c9b8a0'], [220, '#e8d2a0'], [300, '#6fa8ff'], [410, '#d8704a']].forEach(([r, c], i) => { COS.orbitPath(cx, cy, r, r * 0.42, 0, { col: 'rgba(160,190,255,0.25)', lw: 2 }); const p = COS.orbitPos(cx, cy, r, r * 0.42, 0, (t * 0.02 / (1 + i)) % 1); circle(p.x || p[0], p.y || p[1], 9); shape(c, null); });
  const n = Math.floor((o.n || 1400) * k); const pts = cached('belt', () => { const r = rnd(3); return Array.from({ length: 3000 }, () => [520 + (r() + r() + r() - 1.5) * 150, r() * TAU, r()]); });
  for (let i = 0; i < n && i < pts.length; i++) { const [rr, a0, b] = pts[i], a = a0 + t * 0.02 * (600 / rr); ctx.fillStyle = `rgba(220,205,180,${0.35 + 0.5 * b})`; ctx.fillRect(cx + Math.cos(a) * rr - 1.5, cy + Math.sin(a) * rr * 0.42 - 1.5, 3, 3); }
}
