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

// ---------------------------------------------------------------- recurring frames
const VP = 12;   // screen seconds per turn in "sped up" hero shots (real: 251 s)
function hero(t, o = {}) {
  space(t, { density: o.density || 1.1, neb: o.neb === undefined ? 0.22 : o.neb, nebSeed: o.nebSeed || 5, mw: o.mw });
  COS.glow(-200, 300, 900, '#fff1c8', 0.10);
  rock(o.x || 960, o.y || 540, o.R || 330, { phi: o.phi === undefined ? ph(t, o.per || VP) : o.phi, incl: o.incl === undefined ? 18 : o.incl, roll: o.roll || 8, seed: 491 });
  if (o.vig !== false) vig(0.5);
}
function mn45(x, y, R, t, per = 3) { rock(x, y, R, { phi: ph(t, per), seed: 45, incl: 25, roll: -10 }); }
function bennu(x, y, R, t, per = 30) { rock(x, y, R, { phi: ph(t, per), kind: 'rubble', seed: 101, incl: 10, col: [118, 110, 102] }); }

// ================================================================ HOOK (1-11)
shot(0, (tl, d, t) => hero(t, { R: lerp(80, 300, easeIO(tl / Math.max(1, d))), per: 40 }), { noWhoosh: true, cues: [[0.2, 'rise']] });
shot(A(2), (tl, d, t) => hero(t, { R: 330, per: 40 }), { ui: (tl) => tag('≈ 2.5 KM ACROSS', 960, 960, tl, WT(2, 'two'), { size: 56, bg: YEL }), cues: [[wordT(2, 'two'), 'pop']] });
shot(A(3), (tl, d, t) => { hero(t, { R: 340, per: lerp(40, 10, ss(0, 2, tl)) }); spinArrow(960, 540, 470, 120, tl, ss(0.2, 0.6, tl)); }, { cam: [[960, 540, 1.0], [960, 540, 1.1]], ui: (tl) => fast(null, tl), cues: [[A(3) + 0.2, 'whooshes']] });
shot(A(4), (tl, d, t) => { space(t, { density: 0.9 }); sun(-120, 540, 120, t, 0.8); COS.planet(960, 560, 330, 'earth', { light: COS.light(-160, 10), spin: 200 + t * 3, clouds: true }); vig(0.4); }, { ui: (tl) => tag('EARTH: 1 TURN A DAY', 960, 110, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(4) + 0.3, 'pop']] });
shot(A(5), (tl, d, t) => { space(t, { density: 0.9 }); bennu(960, 540, 300, t, 26); vig(0.45); }, { ui: (tl) => tag('MOST BIG ASTEROIDS: HOURS PER TURN', 960, 110, tl, WT(5, 'hours'), { size: 46, bg: '#fff' }), cues: [[wordT(5, 'hours'), 'pop']] });
shot(A(6), (tl, d, t) => { hero(t, { R: 340, per: VP }); }, { cam: [[960, 540, 1.0], [960, 540, 1.15]], ui: (tl) => { bigText('ONE TURN ≈ 4 MINUTES', 960, 130, 92, YEL, tl, WT(6, 'four')); fast(null, tl); }, cues: [[wordT(6, 'four'), 'dun']] });
shot(A(7), (tl, d, t) => { hero(t, { R: 300, per: 8, x: 960 }); }, { ui: (tl) => stamp(960, 930, 1.0, 'SHOULD FALL APART', ROSE, -0.06, tl, WT(7, 'hold')), cues: [[wordT(7, 'hold'), 'stamp']] });
shot(A(8), (tl, d, t) => { space(t, { density: 1.0 }); breakup(960, 540, 260, clamp(tl / Math.max(2.5, d), 0, 1), t, { seed: 8 }); vig(0.45); }, { ui: (tl) => tag('WHAT A RUBBLE PILE WOULD DO', 960, 110, tl, 0.3, { size: 48, bg: '#fff' }), cues: [[A(8) + 0.5, 'crash']] });
shot(A(9), (tl, d, t) => { observatory(t, { open: ss(0, 1.5, tl) }); vig(0.45); }, { cam: [[960, 600, 1.15], [960, 560, 1.0]], ui: (tl) => tag('FOUND · OCTOBER 2026', 960, 110, tl, WT(9, 'found'), { size: 52, bg: YEL }), cues: [[wordT(9, 'found'), 'pop']] });
shot(A(10), (tl, d, t) => { hero(t, { R: 330, per: VP }); qmark(1400, 330, 1.3, tl, WT(10, 'holding'), YEL); }, { ui: (tl) => fast(null, tl), cues: [[wordT(10, 'holding'), 'boing']] });
shot(A(11), (tl, d, t) => { horizonView(t, 0.12 + tl * 0.02); astro(980, 830, 0.9, 0.05); }, { cam: [[960, 600, 1.0], [980, 700, 1.15]], ui: (tl) => qmark(1240, 480, 1.0, tl, WT(11, 'stand'), YEL), cues: [[wordT(11, 'stand'), 'boing']] });

// ================================================================ THE SPEED LIMIT (12-29)
shot(A(12), (tl, d, t) => { space(t, { density: 0.9 }); bennu(960, 560, 280, t, 30); }, { ui: (tl) => titleCard('THE SPEED LIMIT', tl, 0, 1.4, '#2F6FD6'), cues: [[A(12), 'sting']] });
shot(A(13), (tl, d, t) => { space(t, { density: 0.9 }); bennu(960, 560, 380, t, 40); vig(0.5); }, { cam: [[960, 560, 1.0], [960, 600, 1.25]], ui: (tl) => tag('NOT ONE SOLID ROCK', 960, 110, tl, WT(13, 'solid'), { size: 52, bg: '#fff' }), cues: [[wordT(13, 'solid'), 'pop']] });
shot(A(14), (tl, d, t) => { space(t, { density: 0.9 }); bennu(1180, 640, 300, t, 40); probe(lerp(420, 640, ss(0, d, tl)), lerp(200, 300, ss(0, d, tl)), 0.9, 0.5); vig(0.45); }, { ui: (tl) => { tag('BENNU · ≈ 0.5 KM WIDE', 1180, 1000, tl, WT(14, 'bennu'), { size: 46, bg: '#fff' }); tag('2020 · NASA OSIRIS-REx', 960, 110, tl, 0.3, { size: 46, bg: YEL }); }, cues: [[wordT(14, 'bennu'), 'pop']] });
shot(A(15), (tl, d, t) => { sky('#000', '#05070d'); rubbleGround(t, 560); probe(960, 470 + 90 * ss(0.3, 1.4, tl), 1.4, 0, { puff: ss(1.2, 3.2, tl) }); }, { cam: [[960, 560, 1.0], [960, 600, 1.12]], cues: [[A(15) + 1.2, 'thud'], [A(15) + 1.3, 'whooshes']] });
shot(A(16), (tl, d, t) => { space(t, { density: 0.9 }); bennu(960, 540, 360, t, 30); }, { ui: (tl) => bigText('A RUBBLE PILE', 960, 960, 100, YEL, tl, 0.3), cues: [[A(16) + 0.3, 'dun']] });
shot(A(17), (tl, d, t) => { sky('#000', '#05070d'); rubbleGround(t, 300, { seed: 9 }); }, { cam: [[900, 600, 1.0], [1000, 640, 1.2]], ui: (tl) => { tag('BOULDERS', 520, 330, tl, WT(17, 'boulders'), { size: 48, bg: '#fff' }); tag('GRAVEL', 960, 330, tl, WT(17, 'gravel'), { size: 48, bg: '#fff' }); tag('DUST', 1400, 330, tl, WT(17, 'dust'), { size: 48, bg: '#fff' }); tag('HELD BY WEAK GRAVITY', 960, 980, tl, WT(17, 'weak'), { size: 50, bg: ICE }); }, cues: [[wordT(17, 'boulders'), 'pop'], [wordT(17, 'gravel'), 'pop'], [wordT(17, 'dust'), 'pop']] });
shot(A(18), (tl, d, t) => { space(t, { density: 0.9 }); breakup(960, 540, 300, 0.25 * ss(0, d, tl), t, { seed: 11 }); spinArrow(960, 540, 420, 110, tl * (1 + tl), 0.9); }, { ui: (tl) => fast('FASTER ▶', tl), cues: [[A(18) + 0.2, 'whooshes']] });
shot(A(19), (tl, d, t) => { space(t, { density: 0.9 }); breakup(960, 540, 300, 0.3 + 0.1 * ss(0, d, tl), t, { seed: 11, phi0: 2 }); forceArrows(1270, 540, tl, { t2: WT(19, 'harder') }); }, { cues: [[wordT(19, 'harder'), 'thud']] });
shot(A(20), (tl, d, t) => { space(t, { density: 0.9 }); breakup(960, 540, 300, lerp(0.45, 0.7, ss(0, d, tl)), t, { seed: 11, phi0: 4 }); }, { ui: (tl) => tag('EQUATOR ROCKS LIFT OFF', 960, 110, tl, 0.3, { size: 50, bg: '#fff' }), cues: [[A(20) + 0.3, 'whooshes']] });
shot(A(21), (tl, d, t) => { space(t, { density: 0.9 }); breakup(960, 540, 300, lerp(0.7, 1, ss(0, d, tl)), t, { seed: 11, phi0: 6 }); vig(0.5); }, { cues: [[A(21) + 0.2, 'crash']] });
shot(A(22), (tl, d, t) => { bgPlain('#121a32', '#04070f'); barrierPlot(tl, { dots: ss(0, 2.2, tl) }); }, { cues: [[A(22) + 0.2, 'reel']] });
shot(A(23), (tl, d, t) => { bgPlain('#121a32', '#04070f'); barrierPlot(tl, { dots: 1, bar: ss(WT(23, 'never'), WT(23, 'never') + 1.2, tl) }); }, { ui: (tl) => tag('BIGGER THAN ≈ 150 M', 1140, 250, tl, WT(23, 'hundred'), { size: 44, bg: '#fff' }), cues: [[wordT(23, 'hundred'), 'pop'], [wordT(23, 'never'), 'slide']] });
shot(A(24), (tl, d, t) => { bgPlain('#121a32', '#04070f'); barrierPlot(tl, { dots: 1, bar: 1 }); }, { ui: (tl) => bigText('THE SPIN BARRIER', 960, 540, 110, ROSE, tl, 0.2), cues: [[A(24) + 0.2, 'dun']] });
shot(A(25), (tl, d, t) => { space(t, { density: 0.8 }); bennu(1380, 560, 240, t, 30); }, { ui: (tl) => speedSign(620, 470, 1.15, tl, 0.2), cues: [[A(25) + 0.2, 'clang']] });
shot(A(26), (tl, d, t) => { space(t, { density: 0.8 }); const r = rnd(26); for (let i = 0; i < 5; i++) { const x = 300 + i * 330, y = 520 + (i % 2) * 80; rock(x, y, 100 + r() * 30, { phi: ph(t, 20 + i * 6), kind: i % 2 ? 'rubble' : 'mono', seed: 200 + i, incl: 15 }); } }, { ui: (tl) => { for (let i = 0; i < 5; i++) check(300 + i * 330, 790, 0.6, tl, 0.3 + i * 0.25); }, cues: [[A(26) + 0.3, 'ding'], [A(26) + 0.8, 'ding'], [A(26) + 1.3, 'ding']] });
shot(A(27), (tl, d, t) => { space(t, { density: 0.8 }); bennu(1380, 560, 220, t, 30); }, { ui: (tl) => { take(tl); speedSign(620, 470, 1.0, tl, 0.0); }, cues: [[A(27) + 0.15, 'ding']] });
shot(A(28), (tl, d, t) => { space(t, { density: 0.8 }); bennu(1380, 560, 220, t, 30); }, { ui: (tl) => { take(tl); speedSign(620, 470, 1.0, tl, 0.0); xMark(620, 380, 1.4, tl, WT(28, 'breaks')); }, cues: [[wordT(28, 'breaks'), 'stamp']] });
shot(A(29), (tl, d, t) => { hero(t, { R: 300, per: 6, x: 1100 }); }, { ui: (tl) => { take(tl); tag('BUILT DIFFERENTLY', 1100, 980, tl, WT(29, 'built'), { size: 52, bg: YEL }); fast(null, tl); }, cues: [[wordT(29, 'built'), 'pop']] });

// ================================================================ THE CAMERA THAT CAUGHT IT (30-51)
shot(A(30), (tl, d, t) => { observatory(t, { open: 1 }); }, { cam: [[960, 540, 1.0], [960, 600, 1.12]], ui: (tl) => { titleCard('THE CAMERA THAT CAUGHT IT', tl, 0, 1.4, '#7a2a5a'); tag('CERRO PACHÓN, CHILE', 960, 980, tl, 1.5, { size: 46, bg: '#fff' }); }, cues: [[A(30), 'sting'], [A(30) + 1.5, 'pop']] });
shot(A(31), (tl, d, t) => { bgPlain('#16203a', '#060a14'); cameraCCD(960, 520, 1.25, tl); }, { ui: (tl) => { tag('VERA C. RUBIN OBSERVATORY', 960, 90, tl, 0.2, { size: 50, bg: '#fff' }); tag('≈ 3,200 MEGAPIXELS', 960, 990, tl, WT(31, 'megapixels') - 0.6, { size: 56, bg: YEL }); }, cues: [[A(31) + 0.2, 'pop'], [wordT(31, 'megapixels') - 0.6, 'dun']] });
shot(A(32), (tl, d, t) => { observatory(t, { open: 1, s: 0.8 }); const n = Math.floor(ss(0, d, tl) * 48); for (let i = 0; i < n; i++) { const x = 140 + (i % 12) * 140, y = 120 + Math.floor(i / 12) * 110; rrect(x, y, 120, 90, 6); shape('rgba(159,216,255,0.16)', 'rgba(159,216,255,0.7)', 2); } }, { ui: (tl) => tag('WHOLE SOUTHERN SKY · EVERY FEW NIGHTS', 960, 1000, tl, 0.3, { size: 42, bg: '#fff' }), cues: [[A(32) + 0.3, 'scribble']] });
shot(A(33), (tl, d, t) => { bgPlain('#121a32', '#04070f'); skyPatch(960, 520, 1400, 760, tl); }, { cam: [[960, 520, 1.0], [960, 520, 1.08]], cues: [[A(33) + 0.3, 'sparkle']] });
shot(A(34), (tl, d, t) => { bgPlain('#121a32', '#04070f'); skyPatch(960, 520, 1400, 760, tl + 3, { n: 1 }); }, { cam: [[960, 520, 1.0], [700, 480, 1.6]], ui: (tl) => tag('BRIGHTNESS = THE CLUE', 960, 1000, tl, 0.3, { size: 50, bg: YEL }), cues: [[A(34) + 0.3, 'pop']] });
shot(A(35), (tl, d, t) => { space(t, { density: 0.8 }); rock(960, 540, 300, { phi: 0.3 + tl * 0.15, seed: 491, incl: 4 }); }, { ui: (tl) => tag('LUMPY · STRETCHED', 960, 960, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(35) + 0.3, 'pop']] });
shot(A(36), (tl, d, t) => { space(t, { density: 0.8 }); const p = ph(t, 6); rock(560, 540, 260, { phi: p, seed: 491, incl: 4 }); const b = 0.5 + 0.5 * Math.cos(2 * p); COS.glow(1420, 540, 120 + 260 * b, '#ffd9a0', 0.25 + 0.6 * b); circle(1420, 540, 14 + 14 * b); shape('#fff6e0', null); }, { ui: (tl) => { tag('WIDE SIDE = BRIGHT', 1420, 820, tl, WT(36, 'wide'), { size: 40, bg: YEL }); tag('NARROW SIDE = DIM', 1420, 900, tl, WT(36, 'narrow'), { size: 40, bg: '#fff' }); fast(null, tl); }, cues: [[wordT(36, 'wide'), 'pop'], [wordT(36, 'narrow'), 'pop']] });
shot(A(37), (tl, d, t) => { bgPlain('#121a32', '#04070f'); lightCurve(300, 900, 1320, 560, ss(0, d, tl), { turns: 2 }); }, { ui: (tl) => tag('LIKE A SLOW LIGHTHOUSE', 960, 110, tl, WT(37, 'lighthouse'), { size: 48, bg: '#fff' }), cues: [[A(37) + 0.2, 'slide']] });
shot(A(38), (tl, d, t) => { bgPlain('#121a32', '#04070f'); lightCurve(300, 900, 1320, 560, 1, { turns: 2, mark: 'ONE TURN' }); }, { cues: [[A(38) + 0.3, 'tick']] });
shot(A(39), (tl, d, t) => { bgPlain('#16203a', '#060a14'); const n = Math.floor(ss(0.3, d, tl) * 400); const r = rnd(39); for (let i = 0; i < n; i++) { const x = 120 + (i % 40) * 42, y = 260 + Math.floor(i / 40) * 62; circle(x, y, 12); shape('rgba(159,196,255,0.7)', null); } }, { ui: (tl) => { tag('LED BY DMITRII VAVILOV · UNIV. OF WASHINGTON', 960, 100, tl, WT(39, 'dmitrii'), { size: 40, bg: '#fff' }); tag('9,000+ ASTEROIDS CHECKED', 960, 990, tl, WT(39, 'nine'), { size: 52, bg: YEL }); }, cues: [[wordT(39, 'dmitrii'), 'pop'], [wordT(39, 'nine'), 'dun']] });
shot(A(40), (tl, d, t) => { bgPlain('#121a32', '#04070f'); barrierPlot(tl, { dots: 1, bar: 1 }); const r = rnd(40); const k = ss(0.2, 1.6, tl); for (let i = 0; i < 66; i++) { const km = Math.pow(10, -2 + r() * 2.1 * (i < 60 ? 0.75 : 1)), hr = Math.pow(10, -1.6 + r() * 1.7); if (i / 66 > k) continue; circle(pX(km), pY(Math.min(hr, 1.8)), 8); shape(ROSE, INK, 2); } }, { ui: (tl) => bigText('66 TOO FAST', 1180, 300, 90, ROSE, tl, WT(40, 'sixty')), cues: [[wordT(40, 'sixty'), 'dun']] });
shot(A(41), (tl, d, t) => { space(t, { density: 0.8 }); const r = rnd(41); for (let i = 0; i < 9; i++) rock(220 + i * 185, 420 + (i % 3) * 120, 34 + r() * 16, { phi: ph(t, 2 + r() * 2), seed: 300 + i, incl: 20 }); }, { ui: (tl) => tag('MOST: SMALL', 960, 960, tl, 0.2, { size: 54, bg: '#fff' }), cues: [[A(41) + 0.2, 'pop']] });
shot(A(42), (tl, d, t) => { space(t, { density: 0.8 }); const r = rnd(41); for (let i = 0; i < 9; i++) rock(220 + i * 185, 420 + (i % 3) * 120, 34 + r() * 16, { phi: ph(t, 2 + r() * 2), seed: 300 + i, incl: 20, alpha: 1 - ss(0, 0.5, tl) }); rock(960, 540, 340 * easeOut(ss(0.1, 0.9, tl)) + 1, { phi: ph(t, VP), seed: 491 }); vig(0.5); }, { cues: [[A(42) + 0.2, 'crash']] });
shot(A(43), (tl, d, t) => { hero(t, { R: 330 }); }, { ui: (tl) => { bigText('ASTEROID 491384', 960, 130, 100, '#fff', tl, 0.2); fast(null, tl); }, cues: [[A(43) + 0.2, 'sting']] });
shot(A(44), (tl, d, t) => { hero(t, { R: 330 }); const k = ss(0.2, 1.0, tl); ctx.save(); ctx.globalAlpha = k; line(960 - 380, 900, 960 + 380, 900, 6, YEL); line(580, 880, 580, 920, 6, YEL); line(1340, 880, 1340, 920, 6, YEL); ctx.restore(); }, { ui: (tl) => { tag('≈ 2.5 KM', 960, 970, tl, 0.6, { size: 56, bg: YEL }); fast(null, tl); }, cues: [[A(44) + 0.6, 'pop']] });
shot(A(45), (tl, d, t) => { space(t, { density: 1.0 }); rock(760, 540, 300, { phi: TAU * clamp(tl / Math.max(2.5, d - 0.4), 0, 1), seed: 491 }); const secs = Math.min(251, Math.floor(251 * clamp(tl / Math.max(2.5, d - 0.4), 0, 1))); text(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 1460, 540, 150, '#fff', 900, 'center', INK, 14); }, { ui: (tl) => { tag('ONE TURN: 4.18 MINUTES', 1460, 720, tl, WT(45, 'four'), { size: 46, bg: YEL }); fast('CLOCK SPED UP', tl); }, cues: [[A(45) + 0.2, 'tick'], [wordT(45, 'four'), 'dun']] });
shot(A(46), (tl, d, t) => { bgPlain('#121a32', '#04070f'); barrierPlot(tl, { dots: 1, bar: 1, star: pop(tl, 0.3) }); }, { ui: (tl) => bigText('30× FASTER THAN THE LIMIT', 960, 1020, 64, YEL, tl, WT(46, 'thirty')), cues: [[A(46) + 0.3, 'sparkle'], [wordT(46, 'thirty'), 'dun']] });
shot(A(47), (tl, d, t) => { hero(t, { R: 340, mw: 0.3 }); }, { cam: [[960, 540, 1.0], [960, 540, 1.1]], ui: (tl) => { tag('LARGEST ULTRA-FAST ROTATOR KNOWN', 960, 110, tl, WT(47, 'largest'), { size: 48, bg: YEL }); fast(null, tl); }, cues: [[wordT(47, 'largest'), 'pop']] });
shot(A(48), (tl, d, t) => { space(t, { density: 0.9 }); rock(620, 540, 280, { phi: ph(t, VP), seed: 491 }); rock(1360, 560, 220, { phi: ph(t, VP * 5.34 / 4.18), seed: 566, incl: 30, roll: -12 }); }, { ui: (tl) => { tag('491384 · ≈ 2.5 KM · 4.18 MIN', 620, 940, tl, 0.2, { size: 40, bg: YEL }); tag('566130 · ≈ 2 KM · 5.3 MIN', 1360, 940, tl, WT(48, 'second'), { size: 40, bg: MINT }); fast(null, tl); }, cues: [[wordT(48, 'second'), 'pop']] });
shot(A(49), (tl, d, t) => { space(t, { density: 0.9 }); mn45(960, 540, 200, t, 4.5); }, { ui: (tl) => { tag('JANUARY 2026 · 2025 MN45', 960, 110, tl, WT(49, 'january'), { size: 50, bg: ICE }); fast(null, tl); }, cues: [[wordT(49, 'january'), 'pop']] });
shot(A(50), (tl, d, t) => { space(t, { density: 0.9 }); mn45(960, 540, 200, t, 4.5); }, { ui: (tl) => { tag('ONE TURN: UNDER 2 MIN', 960, 860, tl, WT(50, 'under'), { size: 46, bg: '#fff' }); tag('≈ 700 M WIDE', 960, 950, tl, WT(50, 'seven'), { size: 46, bg: ICE }); fast(null, tl); }, cues: [[wordT(50, 'under'), 'pop'], [wordT(50, 'seven'), 'pop']] });
shot(A(51), (tl, d, t) => { space(t, { density: 0.9 }); mn45(520, 600, 90, t, 4.5); rock(1220, 540, 330, { phi: ph(t, VP), seed: 491 }); }, { ui: (tl) => { tag('2025 MN45', 520, 780, tl, 0.2, { size: 40, bg: ICE }); tag('491384', 1220, 960, tl, 0.2, { size: 44, bg: YEL }); fast(null, tl); }, cues: [[A(51) + 0.2, 'pop']] });

// ================================================================ HOW BIG (52-62)
// one shared world in metres; the camera zooms out geometrically
const GY = 900, GX = 260;
function world(t, mpp, o = {}) {
  const sk = ss(Math.log(3), Math.log(12), Math.log(mpp));
  sky(sk > 0.5 ? '#04060f' : '#7fb0de', sk > 0.5 ? '#0b1430' : '#dbe9f5'); if (sk > 0.02) { ctx.save(); ctx.globalAlpha = sk; sky('#04060f', '#0b1430'); COS.starfield(7, { density: 0.8, twinkleT: t }); ctx.restore(); }
  ctx.fillStyle = '#2b2f3a'; ctx.fillRect(-200, GY, W + 400, 400); line(-200, GY, W + 200, GY, 4, '#5b6474');
  SCALE.draw('human', mpp, { x: GX, y: GY });
  const nb = o.burj || 0; for (let i = 0; i < nb; i++) { const k = clamp(nb - i, 0, 1); SCALE.draw('burj', mpp, { x: GX + 90, y: GY - i * 828 / mpp, alpha: k }); }
  if (o.rock) { const R = 1265 / mpp; rock(GX + 300 + R, GY - R, R, { phi: ph(t, VP), seed: 491, alpha: o.rock }); }
  if (o.bennu) { const R = 245 / mpp; rock(1610, GY - R, R, { phi: ph(t, 30), kind: 'rubble', seed: 101, col: [118, 110, 102], alpha: o.bennu }); }
  if (o.mn) { const R = 355 / mpp; rock(1800, GY - R, R, { phi: ph(t, 4.5), seed: 45, alpha: o.mn }); }
}
const geoZ = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), easeIO(u)));
shot(A(52), (tl, d, t) => { world(t, 0.004); }, { ui: (tl) => titleCard('HOW BIG IS 2.5 KM?', tl, 0, 1.4, '#C8812B'), cues: [[A(52), 'sting']] });
shot(A(53), (tl, d, t) => { world(t, geoZ(0.004, 0.006, ss(0, d, tl))); }, { ui: (tl) => tag('A PERSON · 1.7 M', 760, 300, tl, 0.3, { size: 50, bg: '#fff' }), cues: [[A(53) + 0.3, 'pop']] });
shot(A(54), (tl, d, t) => { world(t, geoZ(0.006, 1.15, ss(0, 2.4, tl)), { burj: ss(1.0, 2.2, tl) }); }, { ui: (tl) => tag('BURJ KHALIFA · 828 M', 960, 110, tl, WT(54, 'eight'), { size: 52, bg: YEL }), cues: [[A(54) + 0.1, 'whooshes'], [wordT(54, 'eight'), 'pop']] });
shot(A(55), (tl, d, t) => { const mpp = geoZ(1.15, 3.2, ss(0, 1.4, tl)); world(t, mpp, { burj: 1 + 2 * ss(0.4, 2.0, tl), rock: ss(WT(55, 'width') - 0.4, WT(55, 'width') + 0.4, tl) }); }, { ui: (tl) => { tag('× 3', 404, 60, tl, 1.6, { size: 60, bg: YEL }); tag('491384 · ≈ 2.5 KM', 955, 990, tl, WT(55, 'width'), { size: 50, bg: '#fff' }); }, cues: [[A(55) + 0.6, 'thud'], [A(55) + 1.2, 'thud'], [A(55) + 1.8, 'thud'], [wordT(55, 'width'), 'pop']] });
shot(A(56), (tl, d, t) => { world(t, 3.2, { burj: 3, rock: 1, bennu: ss(0.3, 0.8, tl) }); }, { ui: (tl) => tag('BENNU · ≈ 0.5 KM', 1560, 970, tl, WT(56, 'bennu'), { size: 40, bg: '#fff' }), cues: [[wordT(56, 'bennu'), 'pop']] });
shot(A(57), (tl, d, t) => { world(t, 3.2, { burj: 3, rock: 1, bennu: 1, mn: ss(0.3, 0.8, tl) }); }, { ui: (tl) => tag('2025 MN45 · ≈ 0.7 KM', 1660, 610, tl, WT(57, 'record'), { size: 40, bg: ICE }), cues: [[wordT(57, 'record'), 'pop']] });
shot(A(58), (tl, d, t) => { hero(t, { R: 380, per: lerp(60, VP, ss(0, d, tl)), mw: 0.3 }); }, { cam: [[960, 540, 1.15], [960, 540, 1.0]], ui: (tl) => fast(null, tl), cues: [[A(58) + 0.2, 'whooshes']] });
shot(A(59), (tl, d, t) => { hero(t, { R: 330, per: VP }); spinArrow(960, 540, 470, 120, tl, 0.85); const day = Math.max(0, Math.cos(ph(t, VP))); COS.glow(-200, 540, 900, '#fff1c8', 0.12 * day); }, { ui: (tl) => fast(null, tl), cues: [[A(59) + 0.3, 'whooshes']] });
shot(A(60), (tl, d, t) => { hero(t, { R: 300, per: VP, x: 1180 }); }, { ui: (tl) => take(tl), cues: [[A(60) + 0.15, 'ding']] });
shot(A(61), (tl, d, t) => { space(t, { density: 0.9 }); COS.planet(560, 540, 280, 'earth', { light: COS.light(-150, 10), spin: 200 + tl * 6, clouds: true }); rock(1400, 540, 160, { phi: ph(t, 1.2), seed: 491 }); }, { ui: (tl) => { take(tl); tag('EARTH: 1 TURN', 560, 900, tl, 0.3, { size: 46, bg: '#fff' }); }, cues: [[A(61) + 0.3, 'pop']] });
shot(A(62), (tl, d, t) => { space(t, { density: 0.9 }); COS.planet(560, 540, 280, 'earth', { light: COS.light(-150, 10), spin: 200 + tl * 6, clouds: true }); rock(1400, 540, 160, { phi: ph(t, 0.9), seed: 491 }); const n = Math.round(340 * ss(0.2, Math.max(1.5, d - 0.6), tl)); text(String(n), 1400, 860, 120, YEL, 900, 'center', INK, 14); }, { ui: (tl) => { take(tl); tag('TURNS IN ONE EARTH DAY', 1400, 980, tl, 0.6, { size: 40, bg: '#fff' }); }, cues: [[A(62) + 0.2, 'reel'], [wordT(62, 'three'), 'dun']] });

// ================================================================ STANDING ON IT (63-82)
shot(A(63), (tl, d, t) => { hero(t, { R: 320, per: 40 }); const u = ss(0, d, tl); dartProbe(lerp(1700, 1240, u), lerp(160, 360, u), 0.5, -0.4); }, { ui: (tl) => titleCard('STANDING ON IT', tl, 0, 1.4, '#3a8a5a'), cues: [[A(63), 'sting']] });
shot(A(64), (tl, d, t) => { horizonView(t, 0.2); astro(960, lerp(560, 830, ss(0.2, 2.4, tl)), 0.9, 0); }, { ui: (tl) => tag('LANDING NEAR THE EQUATOR', 960, 110, tl, 0.3, { size: 48, bg: '#fff' }), cues: [[A(64) + 2.3, 'thud']] });
shot(A(65), (tl, d, t) => { horizonView(t, 0.03 + tl * 0.012); astro(1100, 830, 0.8, 0.05, { armR: -2.2 }); }, { cam: [[960, 640, 1.1], [960, 600, 1.0]], cues: [[A(65) + 0.3, 'rise']] });
shot(A(66), (tl, d, t) => { horizonView(t, clamp(tl / Math.max(2.5, d), 0, 1) * 0.5); astro(1100, 830, 0.8, 0.05); }, { ui: (tl) => { tag('SUNRISE TO SUNSET ≈ 2 MIN', 960, 110, tl, WT(66, 'two'), { size: 48, bg: YEL }); fast(null, tl); }, cues: [[wordT(66, 'two'), 'pop']] });
shot(A(67), (tl, d, t) => { horizonView(t, 0.5 + clamp(tl / Math.max(2.5, d), 0, 1) * 0.45, { wheel: 1 }); astro(1100, 830, 0.8, 0.05); }, { ui: (tl) => { tag('NIGHT ≈ 2 MIN', 960, 110, tl, 0.3, { size: 48, bg: '#fff' }); fast(null, tl); }, cues: [[A(67) + 0.3, 'shh']] });
shot(A(68), (tl, d, t) => { horizonView(t, 0.95 + tl * 0.04); astro(1100, 830, 0.8, 0.05); }, { cues: [[A(68) + 0.2, 'sparkle']] });
shot(A(69), (tl, d, t) => { horizonView(t, 0.22, { wheel: 0 }); const off = (tl * 520) % 2400; ctx.save(); ctx.globalAlpha = 0.35; for (let i = 0; i < 8; i++) line(-200 + ((i * 300 + off) % 2400), 300 + i * 30, -50 + ((i * 300 + off) % 2400), 300 + i * 30, 4, '#fff'); ctx.restore(); astro(1000, 830, 0.8, -0.1); }, { cues: [[A(69) + 0.2, 'whoosh']] });
shot(A(70), (tl, d, t) => { space(t, { density: 0.9 }); const o = { phi: ph(t, VP), seed: 491 }; rock(960, 540, 320, o); const tip = rockPt(960, 540, 320, o, [1.2, 0, 0]); if (tip[2] > -0.3) { COS.glow(tip[0], tip[1], 40, YEL, 0.8); } }, { ui: (tl) => { tag('MY ROUGH MATH', 260, 90, tl, 0.2, { size: 40, bg: VIO, col: '#fff' }); bigText('≈ 100 KM/H', 960, 960, 100, YEL, tl, WT(70, 'hundred')); fast(null, tl); }, cues: [[wordT(70, 'hundred'), 'dun']] });
shot(A(71), (tl, d, t) => { horizonView(t, 0.25, { wheel: 0 }); const off = (tl * 900) % 2400; ctx.save(); ctx.globalAlpha = 0.4; for (let i = 0; i < 10; i++) line(-200 + ((i * 260 + off) % 2400), 250 + i * 34, -20 + ((i * 260 + off) % 2400), 250 + i * 34, 5, '#fff'); ctx.restore(); }, { ui: (tl) => tag('HIGHWAY SPEED', 960, 980, tl, 0.3, { size: 54, bg: YEL }), cues: [[A(71) + 0.2, 'whooshes']] });
shot(A(72), (tl, d, t) => { horizonView(t, 0.25, { wheel: 0 }); astro(960, 830, 0.8, 0); forceArrows(1060, 760, tl, { t2: 99 }); }, { ui: (tl) => tag('GRAVITY: TINY', 960, 110, tl, 0.3, { size: 52, bg: ICE }), cues: [[A(72) + 0.3, 'pop']] });
shot(A(73), (tl, d, t) => { horizonView(t, 0.25, { wheel: 0 }); astro(960, 830, 0.8, 0); forceArrows(1060, 760, tl, { t2: 0.3 }); }, { cues: [[A(73) + 0.3, 'thud']] });
shot(A(74), (tl, d, t) => { bgPlain('#121a32', '#04070f'); const k = ss(WT(74, 'hundreds'), WT(74, 'hundreds') + 1.2, tl); rrect(560, 840, 120, -6, 4); shape(ICE, INK, 4); text('GRAVITY', 620, 920, 40, ICE, 900, 'center', INK, 7); rrect(1180, 840, 140, -640 * k - 6, 6); shape(ROSE, INK, 4); text('SPIN', 1250, 920, 40, ROSE, 900, 'center', INK, 7); line(440, 840, 1480, 840, 5, '#cfd8ea'); }, { ui: (tl) => { tag('ASSUMING A TYPICAL DENSITY', 960, 100, tl, 0.2, { size: 40, bg: '#fff' }); bigText('HUNDREDS OF TIMES STRONGER', 960, 1010, 60, ROSE, tl, WT(74, 'hundreds') + 0.8); }, cues: [[wordT(74, 'hundreds'), 'rise'], [wordT(74, 'stronger'), 'dun']] });
shot(A(75), (tl, d, t) => { horizonView(t, 0.25, { wheel: 0 }); astro(960, 830 - 40 * ss(0.3, d, tl), 0.8, 0.1 * Math.sin(tl * 2)); }, { ui: (tl) => stamp(960, 260, 1.0, 'NO STANDING', ROSE, -0.08, tl, 0.3), cues: [[A(75) + 0.3, 'stamp']] });
shot(A(76), (tl, d, t) => { horizonView(t, 0.25, { wheel: 0 }); astro(960, 800 - 20 * Math.sin(tl * 2), 0.8, 0.12, { armL: 2.6, kick: 1 }); ctx.save(); ctx.setLineDash([10, 10]); line(900, 850, 1040, 850, 4, MINT); ctx.restore(); }, { cam: [[960, 760, 1.6], [960, 760, 1.7]], ui: (tl) => tag('A GAP UNDER THE BOOTS', 960, 980, tl, 0.4, { size: 46, bg: '#fff' }), cues: [[A(76) + 0.4, 'pop']] });
shot(A(77), (tl, d, t) => { const u = ss(WT(77, 'turns') - 0.4, d, tl); horizonView(t, 0.25 + u * 0.08, { wheel: 0 }); ctx.save(); line(1100, 820, 1100, 760, 10, '#c9ced6'); ctx.restore(); astro(lerp(1060, 700, u), lerp(800, 260, u * u), 0.8, -0.3 - u * 1.4, { armR: 2.4 }); }, { ui: (tl) => tag('LET GO = DRIFT AWAY', 960, 110, tl, WT(77, 'let'), { size: 50, bg: ROSE, col: '#fff' }), cues: [[wordT(77, 'let'), 'grab'], [wordT(77, 'drift'), 'whooshes']] });
shot(A(78), (tl, d, t) => { horizonView(t, 0.25, { wheel: 0 }); const u = ss(0.4, d, tl); pebble(lerp(980, 1240, u), lerp(760, 200, u * u), 22, tl * 3); astro(960, 830, 0.8, 0, { armR: 1.6 }); }, { cues: [[A(78) + 0.4, 'boing']] });
shot(A(79), (tl, d, t) => { space(t, { density: 0.9 }); const o = { phi: ph(t, VP), seed: 491 }; rock(960, 540, 300, o); const r = rnd(79); for (let i = 0; i < 70; i++) { const a = r() * TAU, f = ((tl * 0.3 + r()) % 1), d0 = 330 + f * 600; ctx.fillStyle = `rgba(170,160,150,${0.7 * (1 - f)})`; ctx.fillRect(960 + Math.cos(a) * d0, 540 + Math.sin(a) * d0 * 0.35, 4, 4); } }, { ui: (tl) => { tag('LOOSE DUST: THROWN OFF', 960, 110, tl, 0.3, { size: 48, bg: '#fff' }); fast(null, tl); }, cues: [[A(79) + 0.3, 'whooshes']] });
shot(A(80), (tl, d, t) => { const o = { phi: ph(t, VP), seed: 491 }; hero(t, { R: 300 }); spinAxis(960, 540, 300, o, ss(0.2, 0.8, tl)); }, { ui: (tl) => fast(null, tl), cues: [[A(80) + 0.3, 'ding']] });
shot(A(81), (tl, d, t) => { const o = { phi: ph(t, VP), seed: 491 }; hero(t, { R: 300 }); const ax = spinAxis(960, 540, 300, o, 1, MINT); COS.glow(ax.top[0], ax.top[1] + 120, 60, MINT, 0.8); }, { ui: (tl) => { tag('POLE: SAFE', 1320, 180, tl, WT(81, 'poles'), { size: 50, bg: MINT }); fast(null, tl); }, cues: [[wordT(81, 'poles'), 'pop']] });
shot(A(82), (tl, d, t) => { const o = { phi: ph(t, VP), seed: 491 }; hero(t, { R: 300 }); spinAxis(960, 540, 300, o, 1, MINT); const r = rnd(82); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, f = ((tl * 0.5 + r()) % 1), d0 = 340 + f * 520; ctx.save(); ctx.globalAlpha = 0.8 * (1 - f); COS.arrow(ctx, 960 + Math.cos(a) * d0, 540 + Math.sin(a) * d0 * 0.3, 960 + Math.cos(a) * (d0 + 70), 540 + Math.sin(a) * (d0 + 70) * 0.3, { col: ROSE, lw: 6 }); ctx.restore(); } }, { ui: (tl) => { tag('EVERYWHERE ELSE: THROWN', 960, 980, tl, 0.3, { size: 48, bg: ROSE, col: '#fff' }); fast(null, tl); }, cues: [[A(82) + 0.3, 'whooshes']] });

// ================================================================ WHAT HOLDS IT TOGETHER (83-95)
function cutaway(x, y, R, kind, tl, a = 1) {   // a cut-open asteroid: a solid block, or packed grains
  ctx.save(); ctx.globalAlpha = a; circle(x, y, R); ctx.save(); ctx.clip();
  const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, 10, x, y, R); g.addColorStop(0, kind === 'mono' ? '#8a8076' : '#6e665e'); g.addColorStop(1, '#2e2a26'); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
  if (kind === 'mono') { const r = rnd(5); for (let i = 0; i < 9; i++) { const y0 = y - R + r() * 2 * R; line(x - R, y0, x + R, y0 + (r() - 0.5) * 80, 3, 'rgba(255,255,255,0.08)'); } }
  else { const r = rnd(6); for (let i = 0; i < 900; i++) { const px = x + (r() * 2 - 1) * R, py = y + (r() * 2 - 1) * R, s = 3 + r() * 9; circle(px, py, s); shape(`rgb(${110 + r() * 50 | 0},${102 + r() * 44 | 0},${92 + r() * 38 | 0})`, 'rgba(20,18,16,0.6)', 1.2); } }
  ctx.restore(); circle(x, y, R); shape(null, '#cfd8ea', 5); ctx.restore();
}
shot(A(83), (tl, d, t) => { space(t, { density: 0.9 }); rock(960, 540, 300, { phi: ph(t, VP), seed: 491 }); }, { ui: (tl) => { titleCard('WHAT HOLDS IT TOGETHER', tl, 0, 1.4, '#5a3a8a'); stamp(960, 930, 0.9, 'NOT LOOSE RUBBLE', ROSE, -0.06, tl, WT(83, 'not loose')); }, cues: [[A(83), 'sting'], [wordT(83, 'not loose'), 'stamp']] });
shot(A(84), (tl, d, t) => { bgPlain('#16203a', '#060a14'); cutaway(960, 520, 330, 'mono', tl, ss(0, 0.6, tl)); }, { ui: (tl) => tag('HOW STRONG MUST IT BE?', 960, 960, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(84) + 0.3, 'hmm']] });
shot(A(85), (tl, d, t) => { bgPlain('#16203a', '#060a14'); cutaway(560, 540, 280, 'mono', tl); forceArrows(560, 260, tl + 2, { t2: 0 }); }, { ui: (tl) => { bigText('≈ 2.3 MPa', 1350, 470, 130, YEL, tl, WT(85, 'two')); tag('INTERNAL STRENGTH NEEDED', 1350, 640, tl, WT(85, 'internal'), { size: 44, bg: '#fff' }); }, cues: [[wordT(85, 'two'), 'dun']] });
shot(A(86), (tl, d, t) => { space(t, { density: 0.9 }); const o = { phi: ph(t, VP), seed: 491 }; rock(960, 540, 300, o); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2; ctx.save(); ctx.globalAlpha = 0.85; COS.arrow(ctx, 960 + Math.cos(a) * 480, 540 + Math.sin(a) * 300, 960 + Math.cos(a) * 340, 540 + Math.sin(a) * 210, { col: MINT, lw: 8 }); ctx.restore(); } }, { ui: (tl) => { tag('THE GRIP THAT BEATS THE SPIN', 960, 110, tl, 0.3, { size: 48, bg: MINT }); fast(null, tl); }, cues: [[A(86) + 0.3, 'lock']] });
shot(A(87), (tl, d, t) => { bgPlain('#16203a', '#060a14'); cutaway(560, 540, 260, 'mono', tl, ss(0, 0.5, tl)); cutaway(1360, 540, 260, 'grain', tl, ss(0.3, 0.8, tl)); text('?', 960, 540, 140, YEL, 900, 'center', INK, 14); }, { cues: [[A(87) + 0.2, 'pop'], [A(87) + 0.5, 'pop']] });
shot(A(88), (tl, d, t) => { bgPlain('#16203a', '#060a14'); cutaway(560, 540, 300, 'mono', tl); cutaway(1360, 540, 260, 'grain', tl, 0.3); }, { ui: (tl) => tag('A MONOLITH: ONE SOLID BLOCK', 560, 920, tl, WT(88, 'solid'), { size: 42, bg: '#fff' }), cues: [[wordT(88, 'solid'), 'pop']] });
shot(A(89), (tl, d, t) => { bgPlain('#16203a', '#060a14'); cutaway(560, 540, 260, 'mono', tl, 0.3); cutaway(1360, 540, 300, 'grain', tl); }, { cam: [[960, 540, 1.0], [1360, 540, 1.3]], ui: (tl) => tag('FINE GRAINS THAT STICK', 1360, 920, tl, WT(89, 'grains'), { size: 42, bg: YEL }), cues: [[wordT(89, 'grains'), 'pop']] });
shot(A(90), (tl, d, t) => { bgPlain('#16203a', '#060a14'); cutaway(560, 540, 260, 'mono', tl, 0.3); cutaway(1360, 540, 300, 'grain', tl); check(1360, 540, 1.4, tl, WT(90, 'cohesion')); }, { ui: (tl) => tag("THE AUTHORS' LEAN: COHESION", 960, 110, tl, WT(90, 'lean'), { size: 46, bg: '#fff' }), cues: [[wordT(90, 'cohesion'), 'ding']] });
shot(A(91), (tl, d, t) => { bgPlain('#1b2442', '#070b16'); }, { ui: (tl) => quoteCard('To survive such a fast spin,\nthey must have significant\ninternal cohesion.', 'VAVILOV, EGGL & GREENSTREET · arXiv PREPRINT, 2026', 960, 520, tl, 0.2, { size: 66 }), cues: [[A(91) + 0.2, 'paper']] });
shot(A(92), (tl, d, t) => { space(t, { density: 0.9 }); mn45(560, 560, 120, t, 4.5); rock(1320, 540, 300, { phi: ph(t, VP), seed: 491 }); }, { ui: (tl) => { take(tl); fast(null, tl); }, cues: [[A(92) + 0.15, 'ding']] });
shot(A(93), (tl, d, t) => { bgPlain('#121a32', '#04070f'); strengthBar(360, 420, 1200, '2025 MN45 (≈ 0.7 KM)', 1, ss(0.3, 1.4, tl), ICE, 'CLOSE TO SOLID ROCK'); }, { ui: (tl) => take(tl), cues: [[A(93) + 0.3, 'slide']] });
shot(A(94), (tl, d, t) => { bgPlain('#121a32', '#04070f'); strengthBar(360, 420, 1200, '2025 MN45 (≈ 0.7 KM)', 1, 1, ICE, 'CLOSE TO SOLID ROCK'); strengthBar(360, 720, 1200, '491384 (≈ 2.5 KM)', 0.3, ss(0.3, 1.4, tl), YEL, 'MUCH LESS'); }, { ui: (tl) => { take(tl); text("BY THE TEAM'S NUMBERS · BARS NOT TO SCALE", 960, 1030, 26, 'rgba(207,216,234,0.75)', 900, 'center', null); }, cues: [[A(94) + 0.3, 'slide']] });
shot(A(95), (tl, d, t) => { hero(t, { R: 330, per: VP }); }, { cam: [[960, 540, 1.0], [960, 540, 1.12]], ui: (tl) => { take(tl); tag('BIGGER, AND GENTLER ON ITSELF', 960, 980, tl, 0.4, { size: 48, bg: YEL }); }, cues: [[A(95) + 0.4, 'pop']] });

// ================================================================ WHO SPUN IT UP (96-110)
shot(A(96), (tl, d, t) => { hero(t, { R: 300, per: VP }); }, { ui: (tl) => titleCard('WHO SPUN IT UP?', tl, 0, 1.4, '#C8812B'), cues: [[A(96), 'sting']] });
shot(A(97), (tl, d, t) => { hero(t, { R: 300, per: lerp(80, VP, ss(0, d, tl)) }); qmark(1360, 320, 1.2, tl, 0.3, YEL); }, { cues: [[A(97) + 0.3, 'boing']] });
shot(A(98), (tl, d, t) => { space(t, { density: 0.8 }); sun(120, 540, 150, t); rock(1260, 540, 260, { phi: ph(t, 40), seed: 491, L: v3n([-1, 0, 0.35]) }); yorpRays(1260, 540, 260, tl, ss(0.2, 0.8, tl)); }, { ui: (tl) => tag('SUSPECT: SUNLIGHT', 1260, 980, tl, WT(98, 'sunlight'), { size: 52, bg: YEL }), cues: [[wordT(98, 'sunlight'), 'pop']] });
shot(A(99), (tl, d, t) => { space(t, { density: 0.8 }); sun(120, 540, 150, t); rock(1260, 540, 260, { phi: ph(t, 40), seed: 491, L: v3n([-1, 0, 0.35]) }); yorpRays(1260, 540, 260, tl); irGlow(1260, 540, 260, tl, ss(WT(99, 'infrared') - 0.3, WT(99, 'infrared') + 0.4, tl), 0); }, { ui: (tl) => tag('HEAT OUT AS INFRARED', 1260, 980, tl, WT(99, 'infrared'), { size: 50, bg: IRC, col: '#fff' }), cues: [[wordT(99, 'infrared'), 'pop']] });
shot(A(100), (tl, d, t) => { space(t, { density: 0.8 }); sun(120, 540, 150, t); rock(1260, 540, 260, { phi: ph(t, 40), seed: 491, L: v3n([-1, 0, 0.35]) }); yorpRays(1260, 540, 260, tl, 0.5); irGlow(1260, 540, 260, tl, 1, 1); }, { ui: (tl) => tag('LOPSIDED PUSH', 1260, 980, tl, WT(100, 'harder'), { size: 52, bg: '#fff' }), cues: [[wordT(100, 'harder'), 'pop']] });
shot(A(101), (tl, d, t) => { space(t, { density: 0.8 }); rock(960, 540, 300, { phi: ph(t, 60), seed: 491 }); spinArrow(960, 540, 430, 110, tl * 0.2, 0.35); }, { ui: (tl) => tag('UNIMAGINABLY WEAK', 960, 980, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(101) + 0.3, 'shh']] });
shot(A(102), (tl, d, t) => { space(t, { density: 0.8 }); rock(960, 540, 300, { phi: ph(t, 30), seed: 491 }); spinArrow(960, 540, 430, 110, tl * 0.5, 0.6); }, { ui: (tl) => tag('BUT IT NEVER STOPS', 960, 980, tl, 0.3, { size: 52, bg: YEL }), cues: [[A(102) + 0.3, 'tick']] });
shot(A(103), (tl, d, t) => { const u = ss(0, d, tl); space(t, { density: 0.8 }); rock(960, 540, 300, { phi: ph(t, lerp(30, 6, u)), seed: 491 }); spinArrow(960, 540, 430, 110, tl * (0.5 + 2 * u), 0.8); text('MILLIONS OF YEARS', 960, 130, 64, '#fff', 900, 'center', INK, 10); }, { ui: (tl) => { tag('ILLUSTRATION', 1640, 1010, tl, 0.2, { size: 28, bg: 'rgba(255,255,255,0.85)' }); fast(null, tl); }, cues: [[A(103) + 0.2, 'rise']] });
shot(A(104), (tl, d, t) => { space(t, { density: 0.8 }); sun(120, 540, 150, t); rock(1260, 540, 260, { phi: ph(t, 20), seed: 491, L: v3n([-1, 0, 0.35]) }); yorpRays(1260, 540, 260, tl, 0.6); irGlow(1260, 540, 260, tl, 0.8, 1); }, { ui: (tl) => bigText('THE YORP EFFECT', 960, 120, 100, YEL, tl, WT(104, 'yorp')), cues: [[wordT(104, 'yorp'), 'dun']] });
shot(A(105), (tl, d, t) => { space(t, { density: 0.9 }); breakup(960, 540, 260, lerp(0.4, 0.75, ss(0, d, tl)), t, { seed: 31 }); }, { ui: (tl) => tag('SHEDDING FROM THE EQUATOR', 960, 110, tl, WT(105, 'sheds'), { size: 48, bg: '#fff' }), cues: [[wordT(105, 'sheds'), 'whooshes']] });
shot(A(106), (tl, d, t) => { space(t, { density: 0.9 }); bennu(800, 540, 240, t, 14); const u = ss(0, d, tl); const r = rnd(106); for (let i = 0; i < 40; i++) { const a = r() * TAU, dd = lerp(300 + r() * 300, 520, u); ctx.fillStyle = 'rgba(160,150,140,0.8)'; ctx.fillRect(800 + Math.cos(a + t * 0.3) * dd - 3, 540 + Math.sin(a + t * 0.3) * dd * 0.35 - 3, 6, 6); } if (u > 0.5) rock(800 + Math.cos(t * 0.3) * 520, 540 + Math.sin(t * 0.3) * 520 * 0.35, 46 * ss(0.5, 1, u), { phi: t, kind: 'rubble', seed: 7 }); }, { ui: (tl) => tag('A SMALL MOON CAN FORM', 960, 980, tl, WT(106, 'moon'), { size: 50, bg: YEL }), cues: [[wordT(106, 'moon'), 'sparkle']] });
shot(A(107), (tl, d, t) => { space(t, { density: 0.9 }); bennu(760, 540, 220, t, 14); const p = { x: 760 + Math.cos(t * 0.5) * 520, y: 540 + Math.sin(t * 0.5) * 180 }; rock(p.x, p.y, 50, { phi: t, kind: 'rubble', seed: 7 }); const u = ss(WT(107, 'dart'), WT(107, 'dart') + 1.6, tl); if (u < 1) dartProbe(lerp(1900, p.x, u), lerp(120, p.y, u), 0.3, 0.3); else COS.impactFlash(p.x, p.y, ss(0, 1.2, tl - WT(107, 'dart') - 1.6), { r: 90 }); }, { ui: (tl, d, t) => { tag('DIDYMOS', 760, 820, tl, WT(107, 'didymos'), { size: 44, bg: '#fff' }); tag('DIMORPHOS', 760 + Math.cos(t * 0.5) * 520, 540 + Math.sin(t * 0.5) * 180 - 90, tl, WT(107, 'dimorphos'), { size: 40, bg: ICE }); tag('NASA DART · 2022', 960, 1000, tl, WT(107, 'dart'), { size: 44, bg: YEL }); }, cues: [[wordT(107, 'didymos'), 'pop'], [wordT(107, 'dimorphos'), 'pop'], [wordT(107, 'dart') + 1.6, 'crash']] });
shot(A(108), (tl, d, t) => { bgPlain('#121a32', '#04070f'); barrierPlot(tl, { dots: 1, bar: 1 }); const k = pop(tl, 0.3); if (k > 0) { COS.glow(pX(0.78), pY(2.26), 40, MINT, 0.7); circle(pX(0.78), pY(2.26), 12); shape(MINT, INK, 4); text('DIDYMOS · ≈ 2¼ H', pX(0.78) - 30, pY(2.26) + 56, 34, '#fff', 900, 'center', INK, 7); } }, { cues: [[A(108) + 0.3, 'pop']] });
shot(A(109), (tl, d, t) => { bgPlain('#121a32', '#04070f'); barrierPlot(tl, { dots: 1, bar: 1, star: pop(tl, 0.3) }); }, { ui: (tl) => check(1720, 560, 1.0, tl, WT(109, 'did not')), cues: [[A(109) + 0.3, 'sparkle'], [wordT(109, 'did not'), 'ding']] });
shot(A(110), (tl, d, t) => { space(t, { density: 0.9 }); sun(200, 300, 90, t); rock(1100, 560, 300, { phi: ph(t, VP), seed: 491 }); qmark(1550, 300, 1.1, tl, WT(110, 'nobody'), YEL); }, { ui: (tl) => { tag('SUNLIGHT?', 380, 520, tl, 0.3, { size: 44, bg: YEL }); tag('A COLLISION?', 380, 640, tl, WT(110, 'collision'), { size: 44, bg: '#fff' }); fast(null, tl); }, cues: [[wordT(110, 'collision'), 'pop'], [wordT(110, 'nobody'), 'boing']] });

// ================================================================ STILL UNKNOWN (111-118)
shot(A(111), (tl, d, t) => { bgPlain('#16203a', '#060a14'); paper(960, 560, 0.9, 'arXiv PREPRINT', 'OCTOBER 2026', '#3a5fc8', tl); }, { ui: (tl) => titleCard('THE CAREFUL PART', tl, 0, 1.3, '#4a5a7a'), cues: [[A(111), 'sting']] });
shot(A(112), (tl, d, t) => { bgPlain('#16203a', '#060a14'); paper(960, 560, 0.9, 'arXiv PREPRINT', 'OCTOBER 2026', '#3a5fc8', tl + 1); }, { ui: (tl) => tag('PREPRINT', 960, 110, tl, WT(112, 'preprint'), { size: 52, bg: YEL }), cues: [[wordT(112, 'preprint'), 'page']] });
shot(A(113), (tl, d, t) => { bgPlain('#16203a', '#060a14'); paper(960, 560, 0.9, 'arXiv PREPRINT', 'OCTOBER 2026', '#3a5fc8', tl + 1); }, { ui: (tl) => stamp(960, 600, 1.0, 'PEER REVIEW: NOT YET', ROSE, -0.12, tl, 0.3), cues: [[A(113) + 0.3, 'stamp']] });
shot(A(114), (tl, d, t) => { space(t, { density: 0.8 }); rock(960, 540, 300, { phi: ph(t, VP), seed: 491, col: [lerp(150, 90, 0.5 + 0.5 * Math.sin(tl * 2)), lerp(138, 84, 0.5 + 0.5 * Math.sin(tl * 2)), lerp(124, 76, 0.5 + 0.5 * Math.sin(tl * 2))] }); }, { ui: (tl) => { tag('SIZE = BRIGHTNESS + HOW DARK IT IS', 960, 110, tl, 0.3, { size: 46, bg: '#fff' }); fast(null, tl); }, cues: [[A(114) + 0.3, 'pop']] });
shot(A(115), (tl, d, t) => { bgPlain('#121a32', '#04070f'); const x0 = 360, x1 = 1560, km = (k) => lerp(x0, x1, (k - 1.5) / 2); line(x0, 640, x1, 640, 5, '#cfd8ea'); [1.5, 2, 2.5, 3, 3.5].forEach(k => { line(km(k), 640, km(k), 656, 4, '#cfd8ea'); text(k + ' KM', km(k), 700, 32, '#cfd8ea', 900, 'center', null); }); const k = ss(0.2, 1.4, tl); rrect(km(2.5) - (km(2.5) - km(2.11)) * k, 560, (km(2.85) - km(2.11)) * k, 60, 30); shape('rgba(255,210,74,0.5)', YEL, 4); circle(km(2.53), 590, 14); shape(YEL, INK, 4); }, { ui: (tl) => { tag('≈ 2.1 KM', 600, 470, tl, WT(115, 'two point one'), { size: 46, bg: '#fff' }); tag('≈ 2.9 KM', 1320, 470, tl, WT(115, 'two point nine'), { size: 46, bg: '#fff' }); }, cues: [[wordT(115, 'two point one'), 'pop'], [wordT(115, 'two point nine'), 'pop']] });
shot(A(116), (tl, d, t) => { observatory(t, { open: 1 }); }, { ui: (tl) => tag('EARLY DATA ONLY', 960, 110, tl, 0.3, { size: 52, bg: '#fff' }), cues: [[A(116) + 0.3, 'pop']] });
shot(A(117), (tl, d, t) => { space(t, { density: 0.7 }); belt(t, { k: ss(0, d, tl) }); }, { ui: (tl) => { tag('10-YEAR SURVEY', 960, 90, tl, WT(117, 'ten'), { size: 50, bg: '#fff' }); tag('MILLIONS OF ASTEROIDS', 960, 1000, tl, WT(117, 'millions'), { size: 52, bg: YEL }); }, cues: [[wordT(117, 'ten'), 'pop'], [wordT(117, 'millions'), 'sparkle']] });
shot(A(118), (tl, d, t) => { space(t, { density: 0.7 }); belt(t, { k: 1 }); const k = pop(tl, 0.6); if (k > 0) { COS.glow(1420, 640, 60, YEL, 0.8 * Math.min(1, k)); circle(1420, 640, 40 * Math.min(1.1, k)); ctx.strokeStyle = YEL; ctx.lineWidth = 5; ctx.stroke(); } }, { cam: [[960, 560, 1.0], [1300, 620, 1.5]], ui: (tl) => qmark(1520, 520, 0.8, tl, 0.8, YEL), cues: [[A(118) + 0.6, 'boing']] });

// ================================================================ ENDING (119-126)
shot(A(119), (tl, d, t) => hero(t, { R: lerp(300, 340, ss(0, d, tl)), per: 40 }), { cues: [[A(119) + 0.2, 'rise']] });
shot(A(120), (tl, d, t) => hero(t, { R: 340, per: 40, mw: 0.25 }), { ui: (tl) => tag('≈ 2.5 KM · NO GROUND UNDER IT', 960, 980, tl, 0.3, { size: 48, bg: '#fff' }), cues: [[A(120) + 0.3, 'pop']] });
shot(A(121), (tl, d, t) => { horizonView(t, (tl * 0.12) % 1); }, { ui: (tl) => { tag('SUNRISE EVERY ≈ 4 MIN', 960, 110, tl, 0.3, { size: 50, bg: YEL }); fast(null, tl); }, cues: [[A(121) + 0.3, 'sparkle']] });
shot(A(122), (tl, d, t) => hero(t, { R: 300, per: VP, mw: 0.4, neb: 0.35 }), { cam: [[960, 540, 1.0], [960, 540, 0.85]], ui: (tl) => fast(null, tl), cues: [[A(122) + 0.3, 'whoosh']] });
shot(A(123), (tl, d, t) => { observatory(t, { open: 1 }); }, { cam: [[960, 600, 1.2], [960, 560, 1.0]], ui: (tl) => tag('A CAMERA THE SIZE OF A CAR', 960, 110, tl, WT(123, 'camera'), { size: 48, bg: '#fff' }), cues: [[wordT(123, 'camera'), 'pop']] });
shot(A(124), (tl, d, t) => { const o = { phi: ph(t, VP), seed: 491 }; hero(t, { R: 300 }); spinAxis(960, 540, 300, o, 1, MINT); }, { ui: (tl) => fast(null, tl), cues: [[A(124) + 0.2, 'ding']] });
shot(A(125), (tl, d, t) => { const o = { phi: ph(t, VP), seed: 491 }; hero(t, { R: 300 }); spinAxis(960, 540, 300, o, 1, MINT); }, { ui: (tl) => { tag('THE POLES?', 400, 300, tl, WT(125, 'poles'), { size: 54, bg: MINT }); tag('THE EQUATOR?', 1520, 760, tl, WT(125, 'equator'), { size: 54, bg: ROSE, col: '#fff' }); fast(null, tl); }, cues: [[wordT(125, 'poles'), 'pop'], [wordT(125, 'equator'), 'pop']] });
shot(A(126), (tl, d, t) => hero(t, { R: 300, per: VP }), { ui: (tl) => tag('TELL ME IN THE COMMENTS', 960, 980, tl, 0.2, { size: 52, bg: YEL }), cues: [[A(126) + 0.2, 'ding']] });

window.MUSIC_SEC = { fall: S(63) - 0.1, death: S(111) - 0.1, callback: S(119) - 0.1 };
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
