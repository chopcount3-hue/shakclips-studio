// Chop Count — WebGL2 cutting engine (banana)
'use strict';
const W = 1080, Hh = 1920;
const KL = 20, KH = 4.2;                  // knife blade length / height (cm) — a real chef's knife next to a banana
const GRAV = 980;   // real gravity, cm/s^2
const BOARD = { x0: -38, x1: 38, z0: -24, z1: 26, y0: -3, y1: 0 };
// Calories in one medium banana. USDA FoodData Central, "Bananas, raw" (FDC ID 173944, SR Legacy):
// 89 kcal per 100 g; USDA's standard portion for a medium banana (7" to 7-7/8" long) is 118 g,
// 118 g x 0.89 kcal/g = 105 kcal. Approximate — rounded to the nearest 5 kcal, as USDA publishes it.
const VALUE = 105;

// ---------------------------------------------------------------- banana shape
// A banana is a tube swept along a circular arc that lies flat in the x-z plane (the fruit
// resting on its side on the board), with an elliptical, 5-ridged cross-section that tapers
// to a blunt facetted tip at each end, plus a short stem stub at the s=0 end.
const BAN = {
  R: 14.6,          // arc radius (cm)
  PHI: 1.30,        // arc sweep (rad) -> 19.0 cm along the curve, ~3.1 cm of sag
  YC: 1.70,         // spine height above the board
  RA: 1.82,         // cross-section half width  (along the in-plane normal)
  RB: 1.70,         // cross-section half height (along y)
  RIDGE: 0.052,     // longitudinal ridge amplitude (fraction of the radius)
  RPH: 0.40,        // ridge phase
  STEM: 1.75,       // stem stub length
  STEMR: 0.40,      // stem stub radius
  CX: 0, CZ: 0,     // arc centre in x-z (filled in below so the bbox is centred on the origin)
};
BAN.AH = BAN.PHI * 0.5;
BAN.CZ = -BAN.R * (Math.cos(BAN.AH) + 1) * 0.5;   // centre the spine's z span on 0

// taper of the cross-section radius along the banana, s in [0,1]
function banTaper(s) {
  const e = 2 * s - 1, a = Math.abs(e);
  const p = e < 0 ? 3.2 : 2.4, q = e < 0 ? 0.30 : 0.34;
  return 0.20 + 0.80 * Math.pow(Math.max(1 - Math.pow(a, p), 0), q);
}
function banRidgeAmp(s) { return BAN.RIDGE * (1 + 1.7 * Math.pow(Math.abs(2 * s - 1), 3)); }
// local coords: s along the arc, u outward in-plane, v vertical; oe = distance past the end plane
function banLocal(x, y, z) {
  const dx = x - BAN.CX, dz = z - BAN.CZ;
  const a = Math.atan2(dx, dz), ah = BAN.AH;
  const ac = Math.max(-ah, Math.min(ah, a));
  const s = (ac + ah) / BAN.PHI;
  let u, oe = 0;
  if (a >= -ah && a <= ah) u = Math.hypot(dx, dz) - BAN.R;
  else {
    const sa = Math.sin(ac), ca = Math.cos(ac);
    const wx = dx - BAN.R * sa, wz = dz - BAN.R * ca;
    u = wx * sa + wz * ca;
    oe = (wx * ca - wz * sa) * Math.sign(a);
  }
  return { s, u, v: y - BAN.YC, oe };
}
function banSection(s, u, v) {
  const t = banTaper(s), ra = BAN.RA * t, rb = BAN.RB * t;
  const qx = u / ra, qy = v / rb;
  const th = Math.atan2(qy, qx);
  const k = 1 + banRidgeAmp(s) * Math.cos(5 * th + BAN.RPH);
  return (Math.hypot(qx, qy) - k) * Math.min(ra, rb);
}
function banStemSeg() {
  const ah = BAN.AH, sa = Math.sin(-ah), ca = Math.cos(-ah);
  const px = BAN.CX + BAN.R * sa, pz = BAN.CZ + BAN.R * ca;      // spine point at the stem end
  const d = [-Math.cos(ah), 0.30, -Math.sin(ah)];
  const l = Math.hypot(d[0], d[1], d[2]);
  return { p0: [px, BAN.YC, pz], d: [d[0] / l, d[1] / l, d[2] / l] };
}
const STEMSEG = banStemSeg();
function sdStem(x, y, z) {
  const { p0, d } = STEMSEG;
  const wx = x - p0[0], wy = y - p0[1], wz = z - p0[2];
  const t = Math.max(0, Math.min(BAN.STEM, wx * d[0] + wy * d[1] + wz * d[2]));
  const r = BAN.STEMR * (1 - 0.30 * t / BAN.STEM);
  return Math.hypot(wx - d[0] * t, wy - d[1] * t, wz - d[2] * t) - r;
}
function sdBanana(x, y, z) {
  const L = banLocal(x, y, z);
  const ds = banSection(L.s, L.u, L.v);
  let d;
  if (L.oe <= 0) d = ds;
  else d = Math.hypot(Math.max(ds, 0), L.oe) + Math.min(Math.max(ds, L.oe), 0);
  return Math.min(d, sdStem(x, y, z));
}
// bbox (computed once, then the shape is shifted so the box is centred in x and z and sits on y=0)
const SD = (() => {
  let xn = 1e9, xp = -1e9, yp = -1e9, yn = 1e9, zn = 1e9, zp = -1e9;
  for (let i = 0; i <= 400; i++) {
    const s = i / 400, t = banTaper(s), a = -BAN.AH + s * BAN.PHI;
    for (let j = 0; j < 72; j++) {
      const th = j / 72 * 6.2831853;
      const k = 1 + banRidgeAmp(s) * Math.cos(5 * th + BAN.RPH);
      const u = BAN.RA * t * k * Math.cos(th), v = BAN.RB * t * k * Math.sin(th);
      const x = BAN.CX + (BAN.R + u) * Math.sin(a), z = BAN.CZ + (BAN.R + u) * Math.cos(a), y = BAN.YC + v;
      xn = Math.min(xn, x); xp = Math.max(xp, x); zn = Math.min(zn, z); zp = Math.max(zp, z);
      yn = Math.min(yn, y); yp = Math.max(yp, y);
    }
  }
  const { p0, d } = STEMSEG;
  for (const t of [0, BAN.STEM]) {
    const r = BAN.STEMR;
    xn = Math.min(xn, p0[0] + d[0] * t - r); xp = Math.max(xp, p0[0] + d[0] * t + r);
    zn = Math.min(zn, p0[2] + d[2] * t - r); zp = Math.max(zp, p0[2] + d[2] * t + r);
    yp = Math.max(yp, p0[1] + d[1] * t + r);
  }
  BAN.CX -= (xn + xp) / 2; BAN.CZ -= (zn + zp) / 2; BAN.YC -= yn;
  STEMSEG.p0[0] -= (xn + xp) / 2; STEMSEG.p0[2] -= (zn + zp) / 2; STEMSEG.p0[1] -= yn;
  return [(xp - xn) + 0.02, (yp - yn) + 0.02, (zp - zn) + 0.02];
})();

// ---------------------------------------------------------------- rounds
// Same escalation as the cake (5 / 13 / 41 / 126 / 345 / 1000 cuts), but the cuts are split
// between the axes in proportion to the banana's bounding box so the pieces stay cube-ish.
// cell: voxel edge used to carve the shape. When the cells are finer than the cut grid the
// cells are grouped into pieces (only the shell of each piece is emitted); when they are not,
// one cell is one piece, exactly as in the cake engine.
const ROUNDS = [
  { nx: 5,   ny: 0,   nz: 0,   dt: 0.34,   intro: 1.05, tw: 0.9, hold: 0.95, tr: 0.30, mode: 'cube',  cell: 0.085, coin: true },
  { nx: 13,  ny: 0,   nz: 0,   dt: 0.150,  intro: 0.50, tw: 1.1, hold: 0.80, tr: 0.24, mode: 'cube',  cell: 0.090, coin: true },
  { nx: 27,  ny: 4,   nz: 10,  dt: 0.068,  intro: 0.50, tw: 1.4, hold: 0.70, tr: 0.20, mode: 'point', cell: 0.075, exact: true },
  { nx: 83,  ny: 13,  nz: 30,  dt: 0.030,  intro: 0.50, tw: 1.7, hold: 0.70, tr: 0.20, mode: 'point', cell: 0.070, exact: true },
  { nx: 228, ny: 37,  nz: 80,  dt: 0.0135, intro: 0.50, tw: 1.9, hold: 0.80, tr: 0.20, mode: 'point', cell: 0.060 },
  { nx: 661, ny: 107, nz: 232, dt: 0.0062, intro: 1.15, tw: 2.3, hold: 1.70, tr: 0.20, mode: 'point', cell: 0.048 },
];
const END_DUR = 3.5;
const END_SPEED = 5.0 / 3.5;
const DOWN = 0.55; // fraction of a cut cycle spent on the down stroke

// ---------------------------------------------------------------- voxels
// Carve the banana out of a regular grid: a cell is kept only when its centre is inside the
// signed distance function, so the instance count follows the fruit, not the bounding box.
const CELLCACHE = {};
function buildCells(ce, infl) {
  const key = ce.toFixed(4) + (infl ? 'i' : '');
  if (CELLCACHE[key]) return CELLCACHE[key];
  const cg = [Math.ceil(SD[0] / ce), Math.ceil(SD[1] / ce), Math.ceil(SD[2] / ce)];
  const ps = [SD[0] / cg[0], SD[1] / cg[1], SD[2] / cg[2]];
  const n = cg[0] * cg[1] * cg[2];
  const inside = new Uint8Array(n);
  const M = infl ? 0.5 * Math.hypot(ps[0], ps[1], ps[2]) : 0;   // half a cell diagonal
  let count = 0;
  for (let iz = 0; iz < cg[2]; iz++) {
    const z = -SD[2] / 2 + (iz + 0.5) * ps[2];
    for (let ix = 0; ix < cg[0]; ix++) {
      const x = -SD[0] / 2 + (ix + 0.5) * ps[0];
      const L = banLocal(x, 0, z);
      const t = banTaper(L.s), ra = BAN.RA * t + M, rb = BAN.RB * t + M;
      const q = L.u / ra;
      let y0 = 1, y1 = -1;
      if (L.oe <= M && Math.abs(q) < 1) {   // ridges are a sub-millimetre detail; the ellipse is enough here
        const vm = rb * Math.sqrt(1 - q * q) * (1 + banRidgeAmp(L.s) * 0.4);
        y0 = BAN.YC - vm; y1 = BAN.YC + vm;
      }
      const nearStem = Math.abs(x - STEMSEG.p0[0]) < BAN.STEM + 1 && Math.abs(z - STEMSEG.p0[2]) < BAN.STEM + 1;
      for (let iy = 0; iy < cg[1]; iy++) {
        const y = (iy + 0.5) * ps[1];
        let on = y >= y0 && y <= y1;
        if (!on && nearStem) on = sdStem(x, y, z) < M;
        if (on) { inside[(iz * cg[1] + iy) * cg[0] + ix] = 1; count++; }
      }
    }
  }
  return (CELLCACHE[key] = { cg, ps, inside, count, ce, infl: !!infl });
}
// how many pieces a round's cut planes actually make (empty slots in the bounding box don't count)
function countPiecesFine(r) {
  // slots smaller than the reference voxel: count occupied slots analytically, column by column
  const wx = SD[0] / (r.nx + 1), wy = SD[1] / (r.ny + 1), wz = SD[2] / (r.nz + 1);
  let n = 0;
  for (let jz = 0; jz <= r.nz; jz++) {
    const z = -SD[2] / 2 + (jz + 0.5) * wz;
    for (let jx = 0; jx <= r.nx; jx++) {
      const x = -SD[0] / 2 + (jx + 0.5) * wx;
      const L = banLocal(x, 0, z);
      const t = banTaper(L.s), ra = BAN.RA * t, rb = BAN.RB * t;
      const q = L.u / ra;
      let j0 = 1, j1 = 0;
      if (L.oe <= 0 && Math.abs(q) < 1) {
        const vm = rb * Math.sqrt(1 - q * q);
        j0 = Math.max(0, Math.ceil((BAN.YC - vm) / wy - 0.5));
        j1 = Math.min(r.ny, Math.floor((BAN.YC + vm) / wy - 0.5));
        if (j1 >= j0) n += j1 - j0 + 1;
      }
      if (Math.abs(x - STEMSEG.p0[0]) < BAN.STEM + 1 && Math.abs(z - STEMSEG.p0[2]) < BAN.STEM + 1) {
        for (let jy = 0; jy <= r.ny; jy++) {
          if (jy >= j0 && jy <= j1) continue;
          if (sdStem(x, (jy + 0.5) * wy, z) < 0) n++;
        }
      }
    }
  }
  return n;
}
function countPiecesCoarse(r, C) {
  // slots bigger than the reference voxel: flood fill the voxels so that a cut plane that
  // splits the fruit into two separate lumps counts as two pieces, not one.
  const { cg, ps, inside } = C;
  const nx1 = r.nx + 1, ny1 = r.ny + 1, nz1 = r.nz + 1;
  const sx = new Int32Array(cg[0]), sy = new Int32Array(cg[1]), sz = new Int32Array(cg[2]);
  for (let i = 0; i < cg[0]; i++) sx[i] = Math.min(r.nx, Math.floor((i + 0.5) / cg[0] * nx1));
  for (let i = 0; i < cg[1]; i++) sy[i] = Math.min(r.ny, Math.floor((i + 0.5) / cg[1] * ny1));
  for (let i = 0; i < cg[2]; i++) sz[i] = Math.min(r.nz, Math.floor((i + 0.5) / cg[2] * nz1));
  const N = cg[0] * cg[1] * cg[2];
  const seen = new Uint8Array(N);
  const stack = new Int32Array(N);     // every cell is marked seen before it is pushed, so N is enough
  const idx = (ix, iy, iz) => (iz * cg[1] + iy) * cg[0] + ix;
  let comps = 0;
  for (let iz = 0; iz < cg[2]; iz++) for (let iy = 0; iy < cg[1]; iy++) for (let ix = 0; ix < cg[0]; ix++) {
    const i0 = idx(ix, iy, iz);
    if (!inside[i0] || seen[i0]) continue;
    comps++; seen[i0] = 1; let sp = 0; stack[sp++] = i0;
    const S = [sx[ix], sy[iy], sz[iz]];
    while (sp > 0) {
      const c = stack[--sp];
      const cx = c % cg[0], cy = ((c / cg[0]) | 0) % cg[1], cz = (c / (cg[0] * cg[1])) | 0;
      for (let d = 0; d < 6; d++) {
        const nxp = cx + (d === 0 ? 1 : d === 1 ? -1 : 0), nyp = cy + (d === 2 ? 1 : d === 3 ? -1 : 0), nzp = cz + (d === 4 ? 1 : d === 5 ? -1 : 0);
        if (nxp < 0 || nyp < 0 || nzp < 0 || nxp >= cg[0] || nyp >= cg[1] || nzp >= cg[2]) continue;
        const ni = idx(nxp, nyp, nzp);
        if (!inside[ni] || seen[ni]) continue;
        if (sx[nxp] !== S[0] || sy[nyp] !== S[1] || sz[nzp] !== S[2]) continue;
        seen[ni] = 1; stack[sp++] = ni;
      }
    }
  }
  return comps;
}

// one piece = one connected lump of voxels that every cut plane leaves on the same side
function isPieceDriven(r, C) {
  const NC = C.cg[0] * C.cg[1] * C.cg[2];
  const slots = (r.nx + 1) * (r.ny + 1) * (r.nz + 1);
  return NC > slots * 2.2 && C.cg[0] > r.nx + 1 && C.cg[1] > r.ny + 1 && C.cg[2] > r.nz + 1;
}
(function buildTimeline() {
  let g = 0;
  for (const r of ROUNDS) {
    r.start = g;
    r.phases = [{ axis: 0, n: r.nx }, { axis: 2, n: r.nz }, { axis: 1, n: r.ny }];
    let t = r.intro;
    for (let i = 0; i < 3; i++) {
      const p = r.phases[i];
      p.t0 = t; p.t1 = t + p.n * r.dt; t = p.t1;
      if (i < 2 && p.n > 0) t += r.tr;
    }
    r.cutEnd = t;
    r.exitEnd = t + 0.3;
    r.tc = t + 0.06;
    r.dur = r.tc + r.tw + 1.1 + r.hold;
    // the piece count has to be the one the viewer can actually see falling apart
    const C = buildCells(r.cell, r.mode === 'cube');
    r.pd = isPieceDriven(r, C);
    r.total = r.pd ? countPiecesCoarse(r, C) : countPiecesFine(r);
    g += r.dur;
  }
  window.END_START = g;
  window.TOTAL_DUR = g + END_DUR;
})();

// ---------------------------------------------------------------- math
const M3 = {            // 3x3 rotations, row-major
  I: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  rx: (a) => { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, -s], [0, s, c]]; },
  ry: (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; },
  rz: (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; },
  mul: (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j])),
  toAA: (m) => {         // -> [axis, angle] via a quaternion, stable near pi
    const tr = m[0][0] + m[1][1] + m[2][2]; let w, x, y, z;
    if (tr > 0) { const S = Math.sqrt(tr + 1) * 2; w = 0.25 * S; x = (m[2][1] - m[1][2]) / S; y = (m[0][2] - m[2][0]) / S; z = (m[1][0] - m[0][1]) / S; }
    else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) { const S = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2; w = (m[2][1] - m[1][2]) / S; x = 0.25 * S; y = (m[0][1] + m[1][0]) / S; z = (m[0][2] + m[2][0]) / S; }
    else if (m[1][1] > m[2][2]) { const S = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2; w = (m[0][2] - m[2][0]) / S; x = (m[0][1] + m[1][0]) / S; y = 0.25 * S; z = (m[1][2] + m[2][1]) / S; }
    else { const S = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2; w = (m[1][0] - m[0][1]) / S; x = (m[0][2] + m[2][0]) / S; y = (m[1][2] + m[2][1]) / S; z = 0.25 * S; }
    if (w < 0) { w = -w; x = -x; y = -y; z = -z; }
    const sn = Math.hypot(x, y, z); if (sn < 1e-9) return [[0, 1, 0], 0];
    return [[x / sn, y / sn, z / sn], 2 * Math.atan2(sn, w)];
  },
};
const V3 = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sc: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};
const M4 = {
  mul(a, b) { const o = new Float32Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; },
  persp(fy, as, n, f) { const t = 1 / Math.tan(fy / 2), o = new Float32Array(16); o[0] = t / as; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; },
  ortho(l, r, b, t, n, f) { const o = new Float32Array(16); o[0] = 2 / (r - l); o[5] = 2 / (t - b); o[10] = -2 / (f - n); o[12] = -(r + l) / (r - l); o[13] = -(t + b) / (t - b); o[14] = -(f + n) / (f - n); o[15] = 1; return o; },
  lookAt(e, c, u) {
    const z = V3.norm(V3.sub(e, c)), x = V3.norm(V3.cross(u, z)), y = V3.cross(z, x), o = new Float32Array(16);
    o[0] = x[0]; o[4] = x[1]; o[8] = x[2]; o[1] = y[0]; o[5] = y[1]; o[9] = y[2]; o[2] = z[0]; o[6] = z[1]; o[10] = z[2];
    o[12] = -V3.dot(x, e); o[13] = -V3.dot(y, e); o[14] = -V3.dot(z, e); o[15] = 1; return o;
  },
};
const Q = {
  aa(ax, a) { const s = Math.sin(a / 2), n = V3.norm(ax); return [n[0] * s, n[1] * s, n[2] * s, Math.cos(a / 2)]; },
  mul(a, b) { return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; },
  slerp(a, b, t) {
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; let bb = b;
    if (d < 0) { d = -d; bb = b.map(v => -v); }
    if (d > 0.9995) { const o = a.map((v, i) => v + (bb[i] - v) * t); const l = Math.hypot(...o); return o.map(v => v / l); }
    const th = Math.acos(d), s = Math.sin(th), wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
    return a.map((v, i) => v * wa + bb[i] * wb);
  },
  mat(q, p) {
    const [x, y, z, w] = q, o = new Float32Array(16);
    o[0] = 1 - 2 * (y * y + z * z); o[1] = 2 * (x * y + z * w); o[2] = 2 * (x * z - y * w);
    o[4] = 2 * (x * y - z * w); o[5] = 1 - 2 * (x * x + z * z); o[6] = 2 * (y * z + x * w);
    o[8] = 2 * (x * z + y * w); o[9] = 2 * (y * z - x * w); o[10] = 1 - 2 * (x * x + y * y);
    o[12] = p[0]; o[13] = p[1]; o[14] = p[2]; o[15] = 1; return o;
  },
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- GL
const cv = document.getElementById('gl');
const gl = cv.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, alpha: false });
const anisoExt = gl.getExtension('EXT_texture_filter_anisotropic');

const GLSL_COMMON = `
precision highp float; precision highp int; precision highp sampler2DShadow;
uniform mat4 uVP; uniform mat4 uLVP; uniform vec3 uCam; uniform vec3 uL; uniform vec3 uKey;
uniform highp sampler2DShadow uShadow;
const vec3 SD = vec3(${SD[0].toFixed(4)}, ${SD[1].toFixed(4)}, ${SD[2].toFixed(4)});
const float BR = ${BAN.R.toFixed(4)}, BPHI = ${BAN.PHI.toFixed(4)}, BAH = ${BAN.AH.toFixed(4)};
const float BYC = ${BAN.YC.toFixed(4)}, BCX = ${BAN.CX.toFixed(4)}, BCZ = ${BAN.CZ.toFixed(4)};
const float BRA = ${BAN.RA.toFixed(4)}, BRB = ${BAN.RB.toFixed(4)}, BRIDGE = ${BAN.RIDGE.toFixed(4)}, BRPH = ${BAN.RPH.toFixed(4)};
const float BSTEM = ${BAN.STEM.toFixed(4)}, BSTEMR = ${BAN.STEMR.toFixed(4)};
const vec3 BSP0 = vec3(${STEMSEG.p0.map(v => v.toFixed(4)).join(', ')});
const vec3 BSDIR = vec3(${STEMSEG.d.map(v => v.toFixed(4)).join(', ')});
const float BLEN = ${(BAN.R * BAN.PHI).toFixed(3)};
float hash11(float p){ p = fract(p*.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y)*p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash12(i), hash12(i+vec2(1,0)), u.x), mix(hash12(i+vec2(0,1)), hash12(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i=0;i<4;i++){ s += a*vnoise(p); p *= 2.03; a *= 0.5; } return s; }
vec3 s2l(vec3 c){ return pow(c, vec3(2.2)); }
float gRim = 1.0;
float gLOD = 0.0;   // 1 = a voxel is only a couple of pixels wide, skip the fine detail
const vec2 PD[8] = vec2[8](vec2(-0.613,0.617), vec2(0.170,-0.040), vec2(-0.299,-0.791), vec2(0.645,0.493), vec2(-0.651,-0.232), vec2(0.421,-0.528), vec2(-0.081,0.290), vec2(0.958,-0.036));
float shadowAt(vec3 wp, vec3 n){
  vec4 lp = uLVP * vec4(wp + n*0.05, 1.0);
  vec3 c = lp.xyz/lp.w*0.5 + 0.5;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;
  float z = c.z - 0.00045; float s = 0.0;
  for (int i = 0; i < 8; i++) s += texture(uShadow, vec3(c.xy + PD[i]*(2.4/2048.0), z));
  return s/8.0;
}
float shadow4(vec3 wp, vec3 n){
  vec4 lp = uLVP * vec4(wp + n*0.05, 1.0);
  vec3 c = lp.xyz/lp.w*0.5 + 0.5;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;
  float z = c.z - 0.00045; float s = 0.0;
  for (int i = 0; i < 4; i++) s += texture(uShadow, vec3(c.xy + PD[i*2]*(2.0/2048.0), z));
  return s/4.0;
}
float shadow1(vec3 wp, vec3 n){
  vec4 lp = uLVP * vec4(wp + n*0.05, 1.0);
  vec3 c = lp.xyz/lp.w*0.5 + 0.5;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;
  return texture(uShadow, vec3(c.xy, c.z - 0.0006));
}
vec3 lightIt(vec3 alb, vec3 n, vec3 wp, float spec, float pw, float ao, float sh){
  vec3 V = normalize(uCam - wp);
  float ndl = max(dot(n, uL), 0.0);
  vec3 H = normalize(uL + V);
  float sp = spec * pow(max(dot(n, H), 0.0), pw) * (pw + 8.0)/25.0;
  vec3 amb = mix(vec3(0.13,0.11,0.09), vec3(0.34,0.36,0.40), n.y*0.5 + 0.5);
  vec3 fill = vec3(0.24,0.25,0.28) * max(dot(n, normalize(vec3(0.7,0.35,1.0))), 0.0);
  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
  vec3 rim = vec3(0.55, 0.68, 0.98)*0.85*fres*smoothstep(-0.25, 0.65, dot(n, normalize(vec3(0.45, 0.55, -0.75))));
  return alb*((amb + fill)*ao + uKey*ndl*sh) + uKey*sp*sh*(0.6 + 0.8*fres*gRim) + rim*(0.35 + 0.65*ao)*gRim;
}
vec3 tone(vec3 c){ c *= 0.95; vec3 a = (c*(2.51*c + 0.03))/(c*(2.43*c + 0.59) + 0.14); return pow(clamp(a, 0.0, 1.0), vec3(1.0/2.2)); }
// ---- banana: signed distance + materials -------------------------------------------------
float banTaper(float s){ float e = 2.0*s - 1.0, a = abs(e);
  float p = e < 0.0 ? 3.2 : 2.4, q = e < 0.0 ? 0.30 : 0.34;
  return 0.20 + 0.80*pow(max(1.0 - pow(a, p), 0.0), q); }
float banAmp(float s){ return BRIDGE*(1.0 + 1.7*pow(abs(2.0*s - 1.0), 3.0)); }
// x = s along the arc, y = u outward in the plane of the curve, z = v vertical, w = past the end cap
vec4 banLocal(vec3 p){
  float dx = p.x - BCX, dz = p.z - BCZ;
  float a = atan(dx, dz);
  float ac = clamp(a, -BAH, BAH);
  float u, oe = 0.0;
  if (a > -BAH && a < BAH) u = length(vec2(dx, dz)) - BR;
  else { float sa = sin(ac), ca = cos(ac);
    float wx = dx - BR*sa, wz = dz - BR*ca;
    u = wx*sa + wz*ca; oe = (wx*ca - wz*sa)*sign(a); }
  return vec4((ac + BAH)/BPHI, u, p.y - BYC, oe);
}
float banStemD(vec3 p, out float ts){
  vec3 w = p - BSP0; ts = clamp(dot(w, BSDIR), 0.0, BSTEM);
  return length(w - BSDIR*ts) - BSTEMR*(1.0 - 0.30*ts/BSTEM);
}
vec3 bananaMat(vec3 p, float peel, out float spec){
  vec4 L = banLocal(p);
  float s = clamp(L.x, 0.0, 1.0);
  float t = banTaper(s), ra = BRA*t, rb = BRB*t;
  vec2 q = vec2(L.y/ra, L.z/rb);
  float th = atan(q.y, q.x);
  float rr = length(q);
  float ts; float dst = banStemD(p, ts);
  if (dst < 0.06 && L.w > -0.08) {                       // the stem stub
    spec = 0.05;
    vec3 c = mix(vec3(0.33,0.32,0.16), vec3(0.21,0.16,0.09), smoothstep(0.25, 1.0, ts/BSTEM));
    c *= 0.84 + 0.32*vnoise(vec2(ts*11.0, atan(p.y - BSP0.y, p.x - BSP0.x)*2.5));
    return s2l(c);
  }
  float arc = s*BLEN;                                     // cm along the fruit
  if (peel > 0.5) {
    float ridge = cos(5.0*th + BRPH);
    vec3 c = vec3(0.905, 0.650, 0.075);
    c = mix(c, vec3(0.93, 0.760, 0.19), 0.35 + 0.35*sin(arc*1.7 + th*1.3));
    c = mix(c, vec3(0.60, 0.70, 0.15), smoothstep(0.19, 0.015, s)*0.88);          // green shoulder by the stem
    float tip = clamp(0.55*smoothstep(0.030, 0.002, s) + smoothstep(0.935, 0.997, s), 0.0, 1.0);
    c = mix(c, vec3(0.28, 0.185, 0.095), tip*0.93);                               // browned tips
    if (gLOD < 0.5) {
      vec2 fg = vec2(arc*1.45, th*2.55);
      vec2 id = floor(fg), f = fract(fg) - 0.5;
      float h = hash12(id);
      vec2 off = (vec2(hash12(id + 5.3), hash12(id + 9.1)) - 0.5)*0.66;
      float fd = length((f - off)*vec2(1.0, 0.78));
      float spot = (1.0 - smoothstep(0.09, 0.19, fd))*step(0.70, h)*smoothstep(0.04, 0.14, s)*smoothstep(0.99, 0.88, s);
      c = mix(c, vec3(0.34, 0.215, 0.10), spot*(0.55 + 0.45*hash12(id + 1.9)));   // freckles
      c *= 0.955 + 0.075*vnoise(vec2(arc*7.0, th*8.0));
    }
    c *= 0.83 + 0.17*(0.5 + 0.5*ridge);                                           // ridge valleys
    spec = 0.07 + 0.06*(0.5 + 0.5*ridge);
    return s2l(c);
  }
  // cut face: cream flesh, the faint three-segment star, seed dots, then pith and skin at the rim
  vec3 c = vec3(0.880, 0.845, 0.700);
  if (gLOD < 0.5) c *= 0.955 + 0.06*vnoise(vec2(arc*4.5 + rr*2.5, th*3.0));
  c = mix(c, vec3(0.870, 0.810, 0.620), (1.0 - smoothstep(0.0, 0.6, rr))*0.5);
  float seg = abs(mod(th - 0.45 + 1.0471976, 2.0943951) - 1.0471976);             // 3 carpels
  float line = (1.0 - smoothstep(0.030, 0.110, seg))*smoothstep(0.95, 0.40, rr)*smoothstep(0.02, 0.20, rr);
  c = mix(c, vec3(0.745, 0.700, 0.520), line*0.85);
  if (gLOD < 0.5) {
    float sdh = hash12(vec2(floor(arc*8.0), floor((th + 3.2)*1.43)));
    float seed = (1.0 - smoothstep(0.035, 0.085, abs(rr - 0.16 - 0.12*sdh)))*(1.0 - smoothstep(0.02, 0.075, seg))*step(0.30, sdh);
    c = mix(c, vec3(0.20, 0.155, 0.10), seed*0.92);
  }
  c = mix(c, vec3(0.905, 0.885, 0.800), smoothstep(0.80, 0.90, rr)*0.85);         // pith
  c = mix(c, vec3(0.88, 0.70, 0.14), smoothstep(0.935, 0.975, rr));               // skin seen edge on
  c = mix(c, vec3(0.70, 0.60, 0.22), smoothstep(0.985, 1.0, rr));
  spec = 0.06 + 0.06*smoothstep(0.9, 1.0, rr);
  return s2l(c);
}
mat3 rotAA(vec3 ax, float a){ float c = cos(a), s = sin(a), t = 1.0 - c;
  return mat3(t*ax.x*ax.x + c, t*ax.x*ax.y + s*ax.z, t*ax.x*ax.z - s*ax.y,
              t*ax.x*ax.y - s*ax.z, t*ax.y*ax.y + c, t*ax.y*ax.z + s*ax.x,
              t*ax.x*ax.z + s*ax.y, t*ax.y*ax.z - s*ax.x, t*ax.z*ax.z + c); }
`;

const GLSL_MOTION = `
uniform float uT; uniform vec3 uPS; uniform float uGrav; uniform float uPD;
float gTImp = -1.0;
// orig/rest/ex/imp describe the PIECE; every cell that belongs to it rides along, offset by aLoc.
void motion(float fid, float s, vec3 orig, vec4 rest, vec4 ex, vec4 imp, out vec3 pos, out mat3 R, out float land, out float moving){
  float tt = uT - rest.w;
  R = mat3(1.0); pos = orig; land = 0.0; moving = 0.0; gTImp = -1.0;
  if (tt <= 0.0) return;
  moving = 1.0;
  float drop = orig.y - imp.y;
  bool falls = drop > 0.05;
  float Tf = falls ? sqrt(2.0*drop/uGrav) : 0.16;
  float Ts = imp.w;
  if (tt < Tf) {
    float u = tt/Tf;
    pos.xz = mix(orig.xz, imp.xz, u);
    pos.y = falls ? mix(orig.y, imp.y, u*u) : mix(orig.y, imp.y, u) + (min(s, 1.0)*0.5 + (imp.y - orig.y)*0.4)*sin(3.14159*u);
  } else {
    float ts = tt - Tf; gTImp = ts;
    float v = Ts > 0.001 ? clamp(ts/Ts, 0.0, 1.0) : 1.0;
    float e = 1.0 - (1.0 - v)*(1.0 - v);
    pos = mix(imp.xyz, rest.xyz, e);
    float bh = min(s*0.3, 0.5)*clamp(drop*0.1, 0.0, 1.0);
    pos.y += bh*abs(sin(ts*28.0))*exp(-ts*12.0);
    pos.y += min(s, 1.0)*0.18*abs(sin(ts*34.0 + fid))*(1.0 - v);
  }
  float Tt = Tf + Ts;
  land = clamp((tt - Tt)/0.3, 0.0, 1.0);
  float tau = clamp(tt/max(Tt, 0.05), 0.0, 1.0);
  float ang = length(ex.xyz);
  if (ang > 1e-4) R = rotAA(ex.xyz/ang, ang*(1.0 - (1.0 - tau)*(1.0 - tau)));
  if (gTImp >= 0.0) {  // settles with a little rocking after it lands
    vec3 wax = normalize(vec3(hash11(fid*1.3) - 0.5, 0.0, hash11(fid*2.9) - 0.5) + vec3(0.001));
    float wang = 0.22*exp(-gTImp*5.5)*sin(gTImp*17.0)*clamp(drop*0.08 + 0.3, 0.0, 1.0);
    R = rotAA(wax, wang)*R;
  }
}
// aLoc.xyz: this cell's offset from its piece's centre. aLoc.w: the piece's size (bounce scale).
// When the cells are not finer than the cut grid each cell is its own piece and uPD is 0.
vec4 cellLoc(vec4 aLoc){ return uPD > 0.5 ? aLoc : vec4(0.0, 0.0, 0.0, (uPS.x + uPS.y + uPS.z)/3.0); }
float peelBit(float mask, vec3 nl){
  int b = nl.x > 0.5 ? 0 : nl.x < -0.5 ? 1 : nl.y > 0.5 ? 2 : nl.y < -0.5 ? 3 : nl.z > 0.5 ? 4 : 5;
  return mod(floor(mask/pow(2.0, float(b))), 2.0);
}
float cutBit(float mask, vec3 nl){       // bits 6-11: the face lies on a cut plane between two pieces
  int b = nl.x > 0.5 ? 0 : nl.x < -0.5 ? 1 : nl.y > 0.5 ? 2 : nl.y < -0.5 ? 3 : nl.z > 0.5 ? 4 : 5;
  return mod(floor(mask/pow(2.0, float(b + 6))), 2.0);
}
`;

function mkProg(vsBody, fsBody, shadow) {
  const head = '#version 300 es\n' + (shadow ? '#define SHADOW\n' : '');
  const vs = head + GLSL_COMMON + vsBody, fs = head + GLSL_COMMON + fsBody;
  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s);
      const lines = src.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
      throw new Error('shader: ' + log + '\n' + lines.slice(0, 200));
    }
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  ['aPos', 'aNor', 'aAux', 'aRest', 'aEx', 'aImp'].forEach((n, i) => gl.bindAttribLocation(p, i, n));
  gl.bindAttribLocation(p, 6, 'aOrig'); gl.bindAttribLocation(p, 7, 'aLoc'); gl.bindAttribLocation(p, 8, 'aMask');
  gl.bindAttribLocation(p, 9, 'aHalf'); gl.bindAttribLocation(p, 10, 'aLo'); gl.bindAttribLocation(p, 11, 'aHi');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}

// ---- env (counter, board, wall)
const ENV_VS = `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec2 aAux;
out vec3 vW; out vec3 vN; flat out float vMat;
void main(){ vW = aPos; vN = aNor; vMat = aAux.x;
#ifdef SHADOW
  gl_Position = uLVP*vec4(aPos,1.0);
#else
  gl_Position = uVP*vec4(aPos,1.0);
#endif
}`;
const ENV_FS = `
in vec3 vW; in vec3 vN; flat in float vMat; out vec4 o;
void main(){
#ifdef SHADOW
  o = vec4(1.0); return;
#else
  gRim = 0.0;
  vec3 n = normalize(vN); vec3 p = vW; vec3 alb; float spec = 0.03, pw = 20.0;
  if (vMat < 0.5) {
    float nn = fbm(p.xz*0.08);
    alb = s2l(vec3(0.13,0.13,0.135))*(0.75 + 0.5*nn); spec = 0.10; pw = 30.0;
  } else if (vMat < 1.5) {
    float warp = fbm(vec2(p.x*0.02, p.z*0.25))*3.0;
    float g = sin((p.z*1.6 + warp*2.2 + fbm(vec2(p.x*0.05, p.z*0.6))*1.5)*3.14159);
    float fine = vnoise(vec2(p.x*0.6, p.z*14.0));
    vec3 c = mix(vec3(0.87,0.68,0.44), vec3(0.75,0.53,0.31), smoothstep(-0.2, 1.0, g)*0.6 + fine*0.15);
    if (n.y < 0.5) c *= 0.75;
    alb = s2l(c); spec = 0.12; pw = 22.0;
  } else {
    float row = floor(p.y/7.5); float xo = p.x + mod(row, 2.0)*7.5;
    vec2 cell = vec2(floor(xo/15.0), row);
    vec2 f = vec2(fract(xo/15.0)*15.0, fract(p.y/7.5)*7.5);
    float grout = min(min(f.x, 15.0 - f.x), min(f.y, 7.5 - f.y));
    float gm = smoothstep(0.16, 0.30, grout);
    vec3 tile = vec3(0.050, 0.135, 0.095)*(0.75 + 0.45*hash12(cell));
    tile *= 1.0 + 0.35*(1.0 - smoothstep(0.3, 1.1, grout));
    alb = s2l(mix(vec3(0.17,0.18,0.17), tile, gm)); spec = 0.45*gm; pw = 70.0;
  }
  float sh = shadowAt(p, n);
  vec3 col = lightIt(alb, n, p, spec, pw, 1.0, sh);
  if (vMat > 1.5) {
    float pool = exp(-pow((p.x + 10.0)/75.0, 2.0) - pow((p.y - 26.0)/42.0, 2.0));
    col += alb*vec3(1.0, 0.92, 0.80)*1.5*pool;
  }
  if (vMat > 0.5 && vMat < 1.5 && n.y > 0.5) {
    // soft contact darkening under the fruit
    vec2 d = max(abs(p.xz) - vec2(SD.x, SD.z)*0.42, 0.0);
    col *= mix(0.84, 1.0, smoothstep(0.0, 1.6, length(d))) ;
  }
  o = vec4(tone(col), 1.0);
#endif
}`;

// ---- the intact banana (smooth swept mesh, with the cut lines scored on it)
const BOX_VS = `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor;
uniform vec3 uXf; // sxz, sy, yoff
out vec3 vW; out vec3 vP; out vec3 vN;
void main(){
  vP = aPos;
  vW = vec3(vP.x*uXf.x, vP.y*uXf.y + uXf.z, vP.z*uXf.x);
  vN = normalize(aNor*vec3(uXf.y, uXf.x, uXf.y));
#ifdef SHADOW
  gl_Position = uLVP*vec4(vW,1.0);
#else
  gl_Position = uVP*vec4(vW,1.0);
#endif
}`;
const BOX_FS = `
in vec3 vW; in vec3 vP; in vec3 vN; out vec4 o;
uniform vec3 uN; uniform vec3 uDone; uniform vec4 uAct;
float lineM(vec3 p, vec3 n){
  float keep = 1.0;
  for (int a=0; a<3; a++){
    if (abs(n[a]) > 0.65) continue;
    float N = uN[a]; if (N < 0.5) continue;
    float spacing = SD[a]/(N + 1.0);
    float coord = p[a] + (a == 1 ? 0.0 : SD[a]*0.5);
    float f = coord/spacing; float k = floor(f + 0.5); float idx = k - 1.0;
    float d = abs(f - k)*spacing;
    float fw = max(fwidth(coord), 1e-5);
    float hw = max(0.022, fw*0.6);
    float m = 1.0 - smoothstep(hw - fw*0.5, hw + fw*0.5, d);
    float avg = clamp(2.0*hw/spacing, 0.0, 1.0)*0.40;
    float bl = smoothstep(2.5, 6.0, spacing/fw);
    float valid = 0.0;
    if (idx >= 0.0 && idx < N) {
      if (idx < uDone[a] - 0.5) valid = 1.0;
      else if (int(uAct.x + 0.5) == a && abs(idx - uAct.y) < 0.5) valid = (a == 1) ? step(uAct.z, p.z) : step(uAct.z, p.y);
    }
    keep *= 1.0 - valid*mix(avg, m, bl)*(1.0 - 0.55*abs(n[a]));
  }
  return 1.0 - keep;
}
void main(){
#ifdef SHADOW
  o = vec4(1.0); return;
#else
  gRim = 0.40;
  vec3 n = normalize(vN);
  float spec; vec3 alb = bananaMat(vP, 1.0, spec);
  float lm = lineM(vP, n);
  alb *= 1.0 - 0.80*lm;
  float sh = shadowAt(vW, n);
  vec3 col = lightIt(alb, n, vW, spec, 34.0, 1.0, sh);
  o = vec4(tone(col), 1.0);
#endif
}`;

// ---- pieces as instanced cubes (one cube per voxel, moved by the piece it belongs to)
const CUBE_VS = GLSL_MOTION + `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=3) in vec4 aRest; layout(location=4) in vec4 aEx; layout(location=5) in vec4 aImp;
layout(location=6) in vec3 aOrig; layout(location=7) in vec4 aLoc; layout(location=8) in float aMask;
out vec3 vW; out vec3 vN; out vec3 vRest; flat out vec3 vNl; out float vAo; flat out float vPeel; flat out float vCut;
// the piece's rigid transform, so the fragment shader can trace the true surface in rest space
flat out vec3 vPos; flat out vec3 vOrig; flat out vec3 vR0; flat out vec3 vR1; flat out vec3 vR2; flat out vec3 vS; flat out vec3 vCC;
void main(){
  vec4 LC = cellLoc(aLoc);
  vec3 orig = aOrig - LC.xyz;                   // the piece's centre
  vec3 pos; mat3 R; float land, mv;
  motion(float(gl_InstanceID), LC.w, orig, aRest, aEx, aImp, pos, R, land, mv);
  vec3 lp = aPos*uPS;
  float sq = gTImp >= 0.0 ? 0.20*exp(-gTImp*8.0)*cos(gTImp*24.0)*clamp(orig.y*0.20 + 0.3, 0.0, 1.0) : 0.0;
  vec3 S = vec3(1.0 + 0.5*sq, 1.0 - sq, 1.0 + 0.5*sq);
  pos.y -= sq*LC.w*0.5;
  vW = pos + S*(R*(LC.xyz + lp)); vN = normalize((R*aNor)/S); vRest = aOrig + lp; vNl = aNor;
  vAo = mix(1.0, aEx.w, land);
  vPeel = peelBit(aMask, aNor); vCut = cutBit(aMask, aNor);
  vPos = pos; vOrig = orig; vR0 = R[0]; vR1 = R[1]; vR2 = R[2]; vS = S; vCC = aOrig;
#ifdef SHADOW
  gl_Position = uLVP*vec4(vW,1.0);
#else
  gl_Position = uVP*vec4(vW,1.0);
#endif
}`;
const CUBE_FS = `
uniform vec3 uPS;
in vec3 vW; in vec3 vN; in vec3 vRest; flat in vec3 vNl; in float vAo; flat in float vPeel; flat in float vCut; out vec4 o;
flat in vec3 vPos; flat in vec3 vOrig; flat in vec3 vR0; flat in vec3 vR1; flat in vec3 vR2; flat in vec3 vS; flat in vec3 vCC;
// signed distance to the fruit (same shape the cells were carved from), in rest space
float banSec(float s, float u, float v){ float t = banTaper(s), ra = BRA*t, rb = BRB*t;
  vec2 q = vec2(u/ra, v/rb); float th = atan(q.y, q.x);
  return (length(q) - (1.0 + banAmp(s)*cos(5.0*th + BRPH)))*min(ra, rb); }
float sdBan(vec3 p){ vec4 L = banLocal(p); float ds = banSec(clamp(L.x, 0.0, 1.0), L.y, L.z);
  float d = L.w <= 0.0 ? ds : length(vec2(max(ds, 0.0), L.w)) + min(max(ds, L.w), 0.0);
  float ts; return min(d, banStemD(p, ts)); }
vec3 banNormal(vec3 p){ vec2 e = vec2(0.012, 0.0);
  return normalize(vec3(sdBan(p + e.xyy) - sdBan(p - e.xyy), sdBan(p + e.yxy) - sdBan(p - e.yxy), sdBan(p + e.yyx) - sdBan(p - e.yyx))); }
void main(){
#ifdef SHADOW
  if (sdBan(vRest) > 0.5*length(uPS)) discard;   // cheap: no shadow from cells that are mostly air
  o = vec4(1.0); return;
#else
  gRim = 0.40;
  mat3 R = mat3(vR0, vR1, vR2);
  vec3 hb = uPS*0.5;
  vec3 rdw = normalize(vW - uCam);
  if (dot(vN, rdw) > 0.0) discard;              // back faces: a cell is entered through its front face only
  vec3 rd = normalize(transpose(R)*(rdw/vS));     // world = pos + S*(R*x), so invert S first, then R
  vec3 p = vRest;                                 // entry point on this cell's face
  float d = sdBan(p);
  bool peel = false;
  if (d > 0.0) {                                  // the face is in air: march to the real peel inside the cell
    bool hit = false;
    bool left = false;
    for (int i = 0; i < 48; i++) {
      p += rd*max(d*0.85, 0.0035);
      d = sdBan(p);
      if (d < 0.0025) { hit = true; break; }      // test the surface before the exit, so a crossing at the edge still counts
      vec3 q = abs(p - vCC) - hb;
      if (max(q.x, max(q.y, q.z)) > 0.0015) { left = true; break; }
    }
    if (!left) hit = true;                        // still inside the cell after the budget: we are grazing the peel
    if (!hit) discard;
    peel = true;
  } else if (vCut < 0.5) {
    peel = true;                                  // only a face on a cut plane shows flesh; anything else inside the fruit is skin
  }
  // a face inside the fruit is a cut face (interior faces between cells are hidden by depth)
  vec3 nr = peel ? banNormal(p) : vNl;
  float spec; vec3 alb = bananaMat(p, peel ? 1.0 : 0.0, spec);
  if (!peel) {                                    // cut flesh: soft relief, a little darker so the key light can't wash it out
    float b1 = vnoise(p.xz*9.0 + p.y*7.0), b2 = vnoise(p.zy*13.0 - p.x*5.0);
    vec3 bump = vec3(b1 - 0.5, b2 - 0.5, vnoise(p.xy*11.0) - 0.5);
    nr = normalize(nr + 0.10*(bump - nr*dot(bump, nr)));
    alb *= 0.86*vec3(1.0, 0.975, 0.90);   // creamier
    spec = 0.20;                                  // moist sheen
  }
  vec3 n = normalize((R*nr)/vS);
  vec3 wp = vPos + vS*(R*(p - vOrig));
  vec4 cp = uVP*vec4(wp, 1.0); gl_FragDepth = clamp(cp.z/cp.w*0.5 + 0.5, 0.0, 1.0);
  float sh = shadow4(wp, n);
  float ao = vAo;
  if (!peel) ao *= 0.80 + 0.20*smoothstep(0.0, 0.35, -sdBan(p));   // the flesh darkens toward the peel
  vec3 col = lightIt(alb, n, wp, spec, peel ? 34.0 : 60.0, ao, sh);
  o = vec4(tone(col), 1.0);
#endif
}`;

// ---- big pieces as exact shapes: one bounding box per piece, the banana ∩ its slab traced per pixel.
// No voxels, so no stair-steps, no hollow shells and no seams: the peel is the real surface and the cut
// face is the real knife plane. Used for the first rounds, where the pieces are big and close to camera.
const PIECE_VS = GLSL_MOTION + `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=3) in vec4 aRest; layout(location=4) in vec4 aEx; layout(location=5) in vec4 aImp;
layout(location=6) in vec3 aOrig; layout(location=7) in vec4 aLoc; layout(location=9) in vec3 aHalf; layout(location=10) in vec3 aLo; layout(location=11) in vec3 aHi;
out vec3 vW; out vec3 vRest; out vec3 vN;
flat out vec3 vPos; flat out vec3 vOrig; flat out vec3 vR0; flat out vec3 vR1; flat out vec3 vR2; flat out vec3 vS;
flat out vec3 vC; flat out vec3 vH; flat out vec3 vLo; flat out vec3 vHi; flat out float vAo;
void main(){
  vec3 orig = aOrig - aLoc.xyz;                 // pivot = the piece's centre of mass
  vec3 pos; mat3 R; float land, mv;
  motion(float(gl_InstanceID), aLoc.w, orig, aRest, aEx, aImp, pos, R, land, mv);
  float sq = gTImp >= 0.0 ? 0.16*exp(-gTImp*8.0)*cos(gTImp*24.0)*clamp(orig.y*0.20 + 0.3, 0.0, 1.0) : 0.0;
  vec3 S = vec3(1.0 + 0.5*sq, 1.0 - sq, 1.0 + 0.5*sq);
  vec3 lp = aPos*(2.0*aHalf);
  vRest = aOrig + lp;
  vW = pos + S*(R*(vRest - orig)); vN = normalize((R*aNor)/S);
  vPos = pos; vOrig = orig; vR0 = R[0]; vR1 = R[1]; vR2 = R[2]; vS = S; vC = aOrig; vH = aHalf; vLo = aLo; vHi = aHi;
  vAo = mix(1.0, aEx.w, land);
#ifdef SHADOW
  gl_Position = uLVP*vec4(vW,1.0);
#else
  gl_Position = uVP*vec4(vW,1.0);
#endif
}`;
const PIECE_FS = `
in vec3 vW; in vec3 vRest; in vec3 vN; out vec4 o;
flat in vec3 vPos; flat in vec3 vOrig; flat in vec3 vR0; flat in vec3 vR1; flat in vec3 vR2; flat in vec3 vS;
flat in vec3 vC; flat in vec3 vH; flat in vec3 vLo; flat in vec3 vHi; flat in float vAo;
float banSec(float s, float u, float v){ float t = banTaper(s), ra = BRA*t, rb = BRB*t;
  vec2 q = vec2(u/ra, v/rb); float th = atan(q.y, q.x);
  return (length(q) - (1.0 + banAmp(s)*cos(5.0*th + BRPH)))*min(ra, rb); }
float sdBan(vec3 p){ vec4 L = banLocal(p); float ds = banSec(clamp(L.x, 0.0, 1.0), L.y, L.z);
  float d = L.w <= 0.0 ? ds : length(vec2(max(ds, 0.0), L.w)) + min(max(ds, L.w), 0.0);
  float ts; return min(d, banStemD(p, ts)); }
// the knife box around this piece, its edges softened a touch like real diced fruit (coins: x planes only)
float boxR(vec3 b){ return min(0.035, 0.18*min(b.x, min(b.y, b.z))); }
vec3 slab3(vec3 p){ vec3 b = 0.5*(vHi - vLo); return abs(p - 0.5*(vLo + vHi)) - b + boxR(b); }
float slab(vec3 p){ vec3 q = slab3(p); return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - boxR(0.5*(vHi - vLo)); }
float shape(vec3 p){ return max(sdBan(p), slab(p)); }
vec3 banNormal(vec3 p){ vec2 e = vec2(0.010, 0.0);
  return normalize(vec3(sdBan(p + e.xyy) - sdBan(p - e.xyy), sdBan(p + e.yxy) - sdBan(p - e.yxy), sdBan(p + e.yyx) - sdBan(p - e.yyx))); }
void main(){
  mat3 R = mat3(vR0, vR1, vR2);
#ifdef SHADOW
  vec3 rdw = -normalize(uL);
#else
  vec3 rdw = normalize(vW - uCam);
#endif
  vec3 rd = normalize(transpose(R)*(rdw/vS));
  vec3 p = vRest;
  bool hit = false;
  float d = shape(p);
  for (int i = 0; i < 96; i++) {
    if (d < 0.002) { hit = true; break; }
    p += rd*max(d*0.8, 0.004);
    vec3 q = abs(p - vC) - vH;
    if (max(q.x, max(q.y, q.z)) > 0.004) break;
    d = shape(p);
  }
  if (!hit) discard;
  vec3 wp = vPos + vS*(R*(p - vOrig));
#ifdef SHADOW
  vec4 cl = uLVP*vec4(wp, 1.0); gl_FragDepth = clamp(cl.z/cl.w*0.5 + 0.5, 0.0, 1.0);
  o = vec4(1.0); return;
#else
  gRim = 0.40;
  float sb = sdBan(p), sl = slab(p);
  bool cut = sl > sb - 0.004;                    // the knife plane is the active surface: flesh
  vec3 q3 = slab3(p);
  int ax = q3.x >= q3.y && q3.x >= q3.z ? 0 : q3.y >= q3.z ? 1 : 2;      // which knife plane
  vec3 nr = cut ? normalize(sign(p - 0.5*(vLo + vHi))*max(q3, 0.0) + vec3(1e-6)) : banNormal(p);
  float spec; vec3 alb = bananaMat(p, cut ? 0.0 : 1.0, spec);
  float ao = vAo;
  if (cut) {
    vec2 uv = ax == 0 ? p.yz : ax == 1 ? p.xz : p.xy;
    float b1 = vnoise(uv*9.0 + p[ax]*7.0), b2 = vnoise(uv.yx*13.0 - p[ax]*5.0);
    vec3 bump = vec3(b1 - 0.5, b2 - 0.5, b1 - b2); bump[ax] = 0.0;
    nr = normalize(nr + 0.10*bump);
    alb *= 0.90*vec3(1.0, 0.92, 0.66);            // warm cream, not grey or paper white
    spec = 0.20;                                 // moist sheen
    ao *= 0.80 + 0.20*smoothstep(0.0, 0.35, -sb); // the flesh darkens toward the peel
  }
  vec3 n = normalize((R*nr)/vS);
  vec4 cp = uVP*vec4(wp, 1.0); gl_FragDepth = clamp(cp.z/cp.w*0.5 + 0.5, 0.0, 1.0);
  float sh = shadow4(wp, n);
  vec3 col = lightIt(alb, n, wp, spec, cut ? 60.0 : 34.0, ao, sh);
  if (cut) col += alb*vec3(1.0, 0.86, 0.55)*0.12*ao;   // light glowing through the soft flesh
  o = vec4(tone(col), 1.0);
#endif
}`;

// ---- pieces as points (tiny pieces)
const PT_VS = GLSL_MOTION + `
layout(location=3) in vec4 aRest; layout(location=4) in vec4 aEx; layout(location=5) in vec4 aImp;
layout(location=6) in vec3 aOrig; layout(location=7) in vec4 aLoc; layout(location=8) in float aMask;
uniform float uPx; uniform float uLPx; uniform vec3 uFwd; uniform float uLOD;
flat out vec3 vCol; flat out float vPs; flat out float vImp; flat out float vWs;
flat out vec3 vCx; flat out vec3 vCy; flat out vec3 vCz; flat out vec3 vR0; flat out vec3 vR1; flat out vec3 vR2;
void main(){
  vec4 LC = cellLoc(aLoc);
  vec3 orig = aOrig - LC.xyz;
  vec3 pos; mat3 R; float land, mv;
  motion(float(gl_VertexID), LC.w, orig, aRest, aEx, aImp, pos, R, land, mv);
  pos += R*LC.xyz;
  float s = max(uPS.x, max(uPS.y, uPS.z));
#ifdef SHADOW
  vec4 cp = uLVP*vec4(pos,1.0);
  gl_Position = cp; gl_PointSize = max(s*uLPx*1.25, 1.0);
  vCol = vec3(1.0); vPs = 1.0; vImp = 0.0; vWs = 0.0;
#else
  // each grain is a real little cube: light its three visible faces here, trace which one a pixel sees in PT_FS
  vec3 V = -uFwd;
  gRim = 0.40; gLOD = uLOD;
  float sp; vec3 albP = bananaMat(aOrig, 1.0, sp); float spP = sp;
  vec3 albF = bananaMat(aOrig, 0.0, sp) * 0.95*vec3(1.0, 0.92, 0.66); float spF = 0.16;
  float jit = 0.95 + 0.22*hash11(float(gl_VertexID)*0.618);
  float ao = mix(1.0, 0.35 + 0.65*aEx.w, land);
  vec3 cf[3]; float best = -1.0; int bk = 1;
  for (int k = 0; k < 3; k++) {
    float d = dot(R[k], V);
    vec3 nl = vec3(0.0); nl[k] = d >= 0.0 ? 1.0 : -1.0;
    float peel = peelBit(aMask, nl);
    vec3 nw = R*nl;
    float sh = shadow1(pos + nw*s*0.5, nw);
    vec3 col = lightIt((peel > 0.5 ? albP : albF)*jit, nw, pos, peel > 0.5 ? spP : spF, 34.0, ao, 0.42 + 0.58*sh);
    if (peel < 0.5) col += albF*vec3(1.0, 0.86, 0.55)*0.12*ao;
    vec3 tc = tone(col); float lum = dot(tc, vec3(0.299, 0.587, 0.114));
    cf[k] = clamp(mix(vec3(lum), tc, 1.22)*1.06, 0.0, 1.0);
    if (abs(d) > best) { best = abs(d); bk = k; }
  }
  vCx = cf[0]; vCy = cf[1]; vCz = cf[2]; vCol = cf[bk];
  vR0 = R[0]; vR1 = R[1]; vR2 = R[2];
  vec4 cp = uVP*vec4(pos,1.0);
  gl_Position = cp;
  float e0 = uPx*s/cp.w;                          // cube edge in pixels
  vImp = e0*1.18 >= 4.0 ? 1.0 : 0.0;              // big enough to show its shape
  float ps = vImp > 0.5 ? e0*1.78 : e0*1.18;      // a turned cube needs up to sqrt(3) x its edge
  gl_PointSize = max(ps, 1.0); vPs = ps; vWs = max(ps, 1.0)*cp.w/uPx;
#endif
}`;
const PT_FS = `
uniform vec3 uFwd; uniform vec3 uPS;
flat in vec3 vCol; flat in float vPs; flat in float vImp; flat in float vWs;
flat in vec3 vCx; flat in vec3 vCy; flat in vec3 vCz; flat in vec3 vR0; flat in vec3 vR1; flat in vec3 vR2;
out vec4 o;
void main(){
#ifdef SHADOW
  o = vec4(1.0); return;
#else
  if (vImp < 0.5) { o = vec4(vCol, 1.0); return; }
  vec2 pc = gl_PointCoord - 0.5;
  vec3 rt = normalize(cross(uFwd, vec3(0.0, 1.0, 0.0))), up = cross(rt, uFwd);
  mat3 Rt = transpose(mat3(vR0, vR1, vR2));
  vec3 lo = Rt*((rt*pc.x - up*pc.y)*vWs - uFwd*vWs), ld = Rt*uFwd;
  vec3 h = uPS*0.5;
  vec3 iv = 1.0/(sign(ld)*max(abs(ld), vec3(1e-5)) + vec3(ld.x == 0.0 ? 1e-5 : 0.0, ld.y == 0.0 ? 1e-5 : 0.0, ld.z == 0.0 ? 1e-5 : 0.0));
  vec3 t1 = (-h - lo)*iv, t2 = (h - lo)*iv, tn = min(t1, t2), tf = max(t1, t2);
  float tN = max(tn.x, max(tn.y, tn.z)), tF = min(tf.x, min(tf.y, tf.z));
  if (tN > tF) discard;
  int k = tn.x >= tn.y && tn.x >= tn.z ? 0 : tn.y >= tn.z ? 1 : 2;
  vec3 col = k == 0 ? vCx : k == 1 ? vCy : vCz;
  vec3 hp = abs(lo + ld*tN)/h; hp[k] = 0.0;
  float m = max(hp.x, max(hp.y, hp.z));
  col *= 1.0 - 0.26*smoothstep(0.70, 1.0, m)*smoothstep(4.0, 9.0, vPs);   // soft dark edge so each grain reads as a cube
  o = vec4(col, 1.0);
#endif
}`;

// ---- knife
const KNIFE_VS = `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec2 aAux;
uniform mat4 uModel;
out vec3 vW; out vec3 vN; out vec3 vL; flat out float vMat; out float vE;
void main(){
  vec4 w = uModel*vec4(aPos,1.0); vW = w.xyz; vN = mat3(uModel)*aNor; vL = aPos; vMat = aAux.x; vE = aAux.y;
#ifdef SHADOW
  gl_Position = uLVP*w;
#else
  gl_Position = uVP*w;
#endif
}`;
const KNIFE_FS = `
uniform float uAlpha; uniform float uGhost;
in vec3 vW; in vec3 vN; in vec3 vL; flat in float vMat; in float vE; out vec4 o;
void main(){
#ifdef SHADOW
  o = vec4(1.0); return;
#else
  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
  vec3 V = normalize(uCam - vW);
  vec3 col;
  if (vMat < 0.5) {
    vec3 R = reflect(-V, n);
    float env = mix(0.05, 0.70, smoothstep(-0.35, 0.75, R.y));
    env += 0.35*smoothstep(0.2, 0.0, abs(R.y - 0.12));
    env += 3.0*pow(max(dot(R, uL), 0.0), 70.0);
    env += 0.8*pow(max(dot(R, normalize(vec3(0.7,0.35,1.0))), 0.0), 18.0);
    float brushed = 0.86 + 0.14*vnoise(vec2(vL.x*0.35, vL.y*38.0));
    float sh = shadowAt(vW, n);
    col = vec3(0.70,0.72,0.75)*env*brushed*(0.7 + 0.3*sh) + vec3(0.10,0.10,0.11);
    float bev = 1.0 - smoothstep(0.0, 0.9, vE);
    col = mix(col, vec3(0.92,0.93,0.95)*(0.55 + 0.6*env), bev*0.7);
  } else if (vMat < 1.5) {
    vec3 alb = s2l(vec3(0.075,0.065,0.06));
    float riv = 0.0;
    for (int i=0;i<3;i++){ float rx = -2.48 - float(i)*2.48; riv = max(riv, 1.0 - smoothstep(0.21, 0.27, length(vL.xy - vec2(rx, -0.83)))); }
    alb = mix(alb, s2l(vec3(0.78,0.78,0.75)), riv);
    float sh = shadowAt(vW, n);
    col = lightIt(alb, n, vW, 0.30 + riv*0.6, 50.0, 1.0, sh);
  } else {
    vec3 R = reflect(-V, n);
    float env = mix(0.06, 0.9, smoothstep(-0.3, 0.7, R.y)) + 2.0*pow(max(dot(R, uL), 0.0), 60.0);
    col = vec3(0.62)*env;
  }
  vec3 tc = tone(col);
  tc = mix(tc, vec3(0.97, 0.98, 1.0), uGhost*0.55);
  o = vec4(tc, uAlpha);
#endif
}`;

// ---- crumbs flying off the blade
const CRUMB_VS = `
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor;
uniform float uPx; flat out vec3 vCol; flat out float vPs; out float vA;
void main(){
  vec3 alb = s2l(aNor);
  vec3 n = normalize(vec3(0.2, 1.0, 0.3));
  float sh = shadow1(aPos, n);
  vCol = tone(lightIt(alb, n, aPos, 0.1, 30.0, 1.0, 0.5 + 0.5*sh));
  vec4 cp = uVP*vec4(aPos, 1.0); gl_Position = cp;
  vPs = max(uPx*0.22/cp.w, 2.0); gl_PointSize = vPs;
}`;
const CRUMB_FS = `
flat in vec3 vCol; flat in float vPs; out vec4 o;
void main(){ vec2 q = gl_PointCoord - 0.5; if (dot(q, q) > 0.25) discard; o = vec4(vCol*(1.0 - 0.35*length(q)*2.0), 1.0); }`;
// ---- post-processing
const POST_VS = `#version 300 es
out vec2 vUv; void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); vUv = p; gl_Position = vec4(p*2.0 - 1.0, 0.0, 1.0); }`;
const BRIGHT_FS = `#version 300 es
precision highp float; uniform sampler2D uTex; uniform vec2 uTx; in vec2 vUv; out vec4 o;
void main(){
  vec3 c = 0.25*(texture(uTex, vUv + vec2(-uTx.x, -uTx.y)).rgb + texture(uTex, vUv + vec2(uTx.x, -uTx.y)).rgb + texture(uTex, vUv + vec2(-uTx.x, uTx.y)).rgb + texture(uTex, vUv + vec2(uTx.x, uTx.y)).rgb);
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  o = vec4(c*smoothstep(0.88, 1.0, l), 1.0);
}`;
const BLUR_FS = `#version 300 es
precision highp float; uniform sampler2D uTex; uniform vec2 uDir; in vec2 vUv; out vec4 o;
void main(){
  vec3 s = texture(uTex, vUv).rgb*0.2270;
  s += (texture(uTex, vUv + uDir*1.3846).rgb + texture(uTex, vUv - uDir*1.3846).rgb)*0.3162;
  s += (texture(uTex, vUv + uDir*3.2308).rgb + texture(uTex, vUv - uDir*3.2308).rgb)*0.0703;
  o = vec4(s, 1.0);
}`;
const COMP_FS = `#version 300 es
precision highp float; uniform sampler2D uScene; uniform sampler2D uB1; uniform sampler2D uB2; uniform float uFrame; in vec2 vUv; out vec4 o;
float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y)*p3.z); }
void main(){
  vec3 c = texture(uScene, vUv).rgb;
  vec3 bl = texture(uB1, vUv).rgb*0.55 + texture(uB2, vUv).rgb*0.75;
  c = 1.0 - (1.0 - c)*(1.0 - bl*0.30);                       // screen-blend glow
  c = mix(c, c*c*(3.0 - 2.0*c), 0.22);                        // gentle filmic S-curve
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, 1.08);                                  // a touch more colour
  c += vec3(0.020, 0.010, -0.012)*smoothstep(0.45, 1.0, l);   // warm highlights
  c += vec3(-0.008, 0.002, 0.016)*(1.0 - smoothstep(0.0, 0.35, l)); // cool shadows
  c += (h(gl_FragCoord.xy + uFrame*17.31) - 0.5)*0.022;       // fine film grain
  o = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;
let POST = null, PP = {};
function postProg(fs) {
  const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error('post shader: ' + gl.getShaderInfoLog(x)); return x; };
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, POST_VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('post link: ' + gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}
function buildPost() {
  const samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES));
  const msFbo = gl.createFramebuffer(), msC = gl.createRenderbuffer(), msD = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, msC); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA8, W, Hh);
  gl.bindRenderbuffer(gl.RENDERBUFFER, msD); gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, W, Hh);
  gl.bindFramebuffer(gl.FRAMEBUFFER, msFbo);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, msC);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, msD);
  const mk = (w, h) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, f, w, h };
  };
  POST = { msFbo, scene: mk(W, Hh), a1: mk(W / 4, Hh / 4), a2: mk(W / 4, Hh / 4), b1: mk(W / 8, Hh / 8), b2: mk(W / 8, Hh / 8) };
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  PP.bright = postProg(BRIGHT_FS); PP.blur = postProg(BLUR_FS); PP.comp = postProg(COMP_FS);
  PP.vao = gl.createVertexArray();
}
let frameNo = 0;
function runPost() {
  gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, POST.msFbo); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, POST.scene.f);
  gl.blitFramebuffer(0, 0, W, Hh, 0, 0, W, Hh, gl.COLOR_BUFFER_BIT, gl.NEAREST);
  gl.bindVertexArray(PP.vao);
  const pass = (pr, dst, setup) => { gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.f : null); gl.viewport(0, 0, dst ? dst.w : W, dst ? dst.h : Hh); gl.useProgram(pr.p); setup(pr.u); gl.drawArrays(gl.TRIANGLES, 0, 3); };
  const tex = (unit, t, loc) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, unit); };
  pass(PP.bright, POST.a1, u => { tex(0, POST.scene.t, u.uTex); gl.uniform2f(u.uTx, 1 / W, 1 / Hh); });
  pass(PP.blur, POST.a2, u => { tex(0, POST.a1.t, u.uTex); gl.uniform2f(u.uDir, 4 / W, 0); });
  pass(PP.blur, POST.a1, u => { tex(0, POST.a2.t, u.uTex); gl.uniform2f(u.uDir, 0, 4 / Hh); });
  pass(PP.blur, POST.b2, u => { tex(0, POST.a1.t, u.uTex); gl.uniform2f(u.uDir, 8 / W, 0); });
  pass(PP.blur, POST.b1, u => { tex(0, POST.b2.t, u.uTex); gl.uniform2f(u.uDir, 0, 8 / Hh); });
  pass(PP.comp, null, u => { tex(0, POST.scene.t, u.uScene); tex(1, POST.a1.t, u.uB1); tex(2, POST.b1.t, u.uB2); gl.uniform1f(u.uFrame, frameNo++ % 997); });
  gl.bindVertexArray(null);
}
// ---- crumbs: spawned where the blade meets the board / leaves the cake
const CRUMB_COLS = [[0.99,0.96,0.88],[0.99,0.96,0.88],[0.98,0.94,0.83],[0.97,0.93,0.80],[0.99,0.95,0.86],[0.96,0.80,0.22],[0.93,0.76,0.18],[0.99,0.86,0.30],[0.55,0.40,0.16],[0.99,0.96,0.90]];
let crumbBuf = null, crumbVao = null;
function crumbData(r, tl) {
  const out = [], cols = [];
  const life = 0.85, g = 980;
  for (const p of r.phases) {
    const k0 = Math.max(0, Math.floor((tl - life - p.t0) / r.dt) - 1), k1 = Math.min(p.n - 1, Math.floor((tl - p.t0) / r.dt));
    const per = Math.max(2, Math.round(16 * Math.min(1, r.dt / 0.12)));   // banana sheds fewer, wetter bits than cake
    for (let k = k0; k <= k1; k++) {
      const te = p.t0 + (k + DOWN) * r.dt; const a = tl - te; if (a < 0 || a > life) continue;
      const rr = mulberry(9001 + k * 131 + p.axis * 7 + Math.round(r.dt * 1e5));
      const c = planeCoord(p.axis, p.n, cutIndex(p.axis, p.n, k));
      // spawn where the blade actually meets the fruit, not at the corner of the bounding box
      let cx, cz;
      if (p.axis === 0) { if (Math.abs((c - BAN.CX) / BAN.R) > 0.999) continue; cx = c; cz = BAN.CZ + BAN.R * Math.cos(Math.asin((c - BAN.CX) / BAN.R)); }
      else if (p.axis === 2) { const t2 = (c - BAN.CZ) / BAN.R; if (t2 < Math.cos(BAN.AH) || t2 > 1) continue; cz = c; cx = BAN.CX + BAN.R * Math.sin(Math.acos(t2)); }
      else { const aa = (rr() - 0.5) * 2 * BAN.AH; cx = BAN.CX + BAN.R * Math.sin(aa); cz = BAN.CZ + BAN.R * Math.cos(aa); }
      for (let j = 0; j < per; j++) {
        let x, y, z, vx, vy, vz;
        const u = rr(), v = rr();
        if (p.axis === 0) { x = cx; z = cz + 0.4 + u * 1.1; y = 0.4 + v * 1.5; vx = (rr() - 0.5) * 45; vz = 22 + rr() * 42; vy = 32 + rr() * 62; }
        else if (p.axis === 2) { z = cz; x = cx + 0.3 - u * 1.1; y = 0.4 + v * 1.5; vz = (rr() - 0.5) * 45; vx = 22 + rr() * 42; vy = 32 + rr() * 62; }
        else { y = Math.min(c, 2.6); x = cx; z = cz + 0.3 + v * 0.8; vx = 8 + rr() * 30; vz = 22 + rr() * 38; vy = 16 + rr() * 42; }
        let px = x + vx * a, pz = z + vz * a, py = y + vy * a - 0.5 * g * a * a;
        if (py < 0.15) { const tg = (vy + Math.sqrt(vy * vy + 2 * g * (y - 0.15))) / g; const rem = Math.max(0, a - tg); px = x + vx * tg + vx * 0.25 * Math.min(rem, 0.2); pz = z + vz * tg + vz * 0.25 * Math.min(rem, 0.2); py = 0.15; }
        const fade = Math.min(1, (life - a) / 0.25);
        if (fade <= 0) continue;
        out.push(px, py - (1 - fade) * 0.4, pz);
        cols.push(...CRUMB_COLS[Math.floor(rr() * CRUMB_COLS.length)]);
        if (out.length > 3 * 4000) break;
      }
    }
  }
  return { pos: new Float32Array(out), col: new Float32Array(cols) };
}
function drawCrumbs(r, tl, shadow) {
  if (shadow || tl < r.phases[0].t0 || tl > r.cutEnd + 1.0) return;
  const d = crumbData(r, tl); const n = d.pos.length / 3; if (!n) return;
  if (!crumbVao) {
    crumbVao = gl.createVertexArray(); gl.bindVertexArray(crumbVao);
    crumbBuf = [gl.createBuffer(), gl.createBuffer()];
    gl.bindBuffer(gl.ARRAY_BUFFER, crumbBuf[0]); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, crumbBuf[1]); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
  }
  gl.bindVertexArray(crumbVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, crumbBuf[0]); gl.bufferData(gl.ARRAY_BUFFER, d.pos, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, crumbBuf[1]); gl.bufferData(gl.ARRAY_BUFFER, d.col, gl.DYNAMIC_DRAW);
  const u = useProg(P.crumb); gl.uniform1f(u.uPx, PXSCALE);
  gl.drawArrays(gl.POINTS, 0, n);
}

// ---------------------------------------------------------------- geometry
function vaoFrom(arrs, idx) {
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  for (const [loc, data, size] of arrs) {
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }
  let ib = null;
  if (idx) { ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW); }
  gl.bindVertexArray(null);
  return vao;
}
function boxGeom(x0, x1, y0, y1, z0, z1, mat, out) {
  const faces = [
    [[1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]]],
    [[-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]],
    [[0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]]],
    [[0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]],
    [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
    [[0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]]],
  ];
  for (const [n, q] of faces) {
    const b = out.pos.length / 3;
    for (const v of q) { out.pos.push(...v); out.nor.push(...n); out.aux.push(mat, 1); }
    out.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
}
function newGeo() { return { pos: [], nor: [], aux: [], idx: [] }; }
function geoVao(g) {
  return { vao: vaoFrom([[0, new Float32Array(g.pos), 3], [1, new Float32Array(g.nor), 3], [2, new Float32Array(g.aux), 2]], new Uint32Array(g.idx)), n: g.idx.length };
}

let ENV, BOX, KNIFE, CUBE;
const TAU = Math.PI * 2;
// a point on the banana skin: s along the arc, th around the cross-section
function banSurf(s, th) {
  const t = banTaper(s), ra = BAN.RA * t, rb = BAN.RB * t;
  const k = 1 + banRidgeAmp(s) * Math.cos(5 * th + BAN.RPH);
  const u = ra * k * Math.cos(th), v = rb * k * Math.sin(th);
  const a = -BAN.AH + s * BAN.PHI;
  return [BAN.CX + (BAN.R + u) * Math.sin(a), BAN.YC + v, BAN.CZ + (BAN.R + u) * Math.cos(a)];
}
function bananaMesh() {
  const g = newGeo();
  const NS = 160, NT = 48;
  const grid = [];
  for (let i = 0; i <= NS; i++) { const row = []; for (let j = 0; j < NT; j++) row.push(banSurf(i / NS, j / NT * TAU)); grid.push(row); }
  const at = (i, j) => grid[clamp(i, 0, NS)][(j + NT) % NT];
  const base = g.pos.length / 3;
  for (let i = 0; i <= NS; i++) for (let j = 0; j < NT; j++) {
    const p = grid[i][j];
    const ds = V3.sub(at(i + 1, j), at(i - 1, j)), dt = V3.sub(at(i, j + 1), at(i, j - 1));
    let n = V3.norm(V3.cross(ds, dt));
    const aa = -BAN.AH + i / NS * BAN.PHI;
    const spine = [BAN.CX + BAN.R * Math.sin(aa), BAN.YC, BAN.CZ + BAN.R * Math.cos(aa)];
    if (V3.dot(n, V3.sub(p, spine)) < 0) n = V3.sc(n, -1);      // make every normal point out of the fruit
    g.pos.push(...p); g.nor.push(...n); g.aux.push(0, 0);
  }
  for (let i = 0; i < NS; i++) for (let j = 0; j < NT; j++) {
    const a = base + i * NT + j, b = base + i * NT + (j + 1) % NT;
    g.idx.push(a, b + NT, b, a, a + NT, b + NT);     // wound so the outside faces out
  }
  // end caps
  for (const end of [0, 1]) {
    const a = -BAN.AH + end * BAN.PHI;
    const nrm = end ? [Math.cos(BAN.AH), 0, -Math.sin(BAN.AH)] : [-Math.cos(BAN.AH), 0, -Math.sin(BAN.AH)];
    const c = [BAN.CX + BAN.R * Math.sin(a), BAN.YC, BAN.CZ + BAN.R * Math.cos(a)];
    const b0 = g.pos.length / 3;
    g.pos.push(...c); g.nor.push(...nrm); g.aux.push(0, 0);
    for (let j = 0; j < NT; j++) { g.pos.push(...banSurf(end, j / NT * TAU)); g.nor.push(...nrm); g.aux.push(0, 0); }
    for (let j = 0; j < NT; j++) {
      const i1 = b0 + 1 + j, i2 = b0 + 1 + (j + 1) % NT;
      if (end) g.idx.push(b0, i1, i2); else g.idx.push(b0, i2, i1);
    }
  }
  // stem stub
  {
    const d = STEMSEG.d, p0 = STEMSEG.p0;
    const up = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const e1 = V3.norm(V3.cross(d, up)), e2 = V3.cross(d, e1);
    const NR = 7, NC = 16, b0 = g.pos.length / 3;
    for (let i = 0; i <= NR; i++) {
      const f = i / NR, l = BAN.STEM * f;
      const rad = BAN.STEMR * (1 - 0.30 * f) * (i === NR ? 0.55 : 1);
      for (let j = 0; j < NC; j++) {
        const th = j / NC * TAU, cs = Math.cos(th), sn = Math.sin(th);
        const rv = V3.add(V3.sc(e1, cs), V3.sc(e2, sn));
        const wob = 1 + 0.08 * Math.cos(th * 3 + f * 5);
        g.pos.push(...V3.add(V3.add(p0, V3.sc(d, l - 0.5)), V3.sc(rv, rad * wob)));
        g.nor.push(...V3.norm(V3.add(rv, V3.sc(d, 0.25 * f))));
        g.aux.push(0, 0);
      }
    }
    for (let i = 0; i < NR; i++) for (let j = 0; j < NC; j++) {
      const a = b0 + i * NC + j, b = b0 + i * NC + (j + 1) % NC;
      g.idx.push(a, b, b + NC, a, b + NC, a + NC);
    }
    const tip = g.pos.length / 3;
    g.pos.push(...V3.add(p0, V3.sc(d, BAN.STEM - 0.4))); g.nor.push(...d); g.aux.push(0, 0);
    for (let j = 0; j < NC; j++) g.idx.push(tip, b0 + NR * NC + j, b0 + NR * NC + (j + 1) % NC);
  }
  return g;
}
function buildGeometry() {
  const e = newGeo();
  const quad = (p0, p1, p2, p3, n, mat) => { const b = e.pos.length / 3; for (const v of [p0, p1, p2, p3]) { e.pos.push(...v); e.nor.push(...n); e.aux.push(mat, 0); } e.idx.push(b, b + 1, b + 2, b, b + 2, b + 3); };
  quad([-300, -3, -45], [-300, -3, 300], [300, -3, 300], [300, -3, -45], [0, 1, 0], 0);           // counter
  quad([-300, -3, -45], [300, -3, -45], [300, 300, -45], [-300, 300, -45], [0, 0, 1], 2);          // wall
  boxGeom(BOARD.x0, BOARD.x1, BOARD.y0, BOARD.y1, BOARD.z0, BOARD.z1, 1, e);                         // board
  ENV = geoVao(e);
  BOX = geoVao(bananaMesh());
  const c = newGeo(); boxGeom(-0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0, c);
  CUBE = { pos: new Float32Array(c.pos), nor: new Float32Array(c.nor), idx: new Uint32Array(c.idx) };
  // knife (scaled to a real chef's knife beside a 20 cm banana)
  const k = newGeo();
  const KS = KL / 44;
  const NS = 72, NR = 8;
  const spineY = (x) => x < 0.6 * KL ? 0 : -0.62 * KH * Math.pow((x - 0.6 * KL) / (0.4 * KL), 2);
  const edgeY = (x) => x < 0.62 * KL ? -KH : -KH + 0.38 * KH * Math.pow((x - 0.62 * KL) / (0.38 * KL), 1.7);
  const thick = (fr) => 0.13 * KS * Math.pow(clamp(fr, 0, 1), 0.55);
  for (const side of [1, -1]) {
    const base = k.pos.length / 3;
    const P = [];
    for (let i = 0; i <= NS; i++) {
      const x = (i / NS) * KL * 0.9995;
      const ys = spineY(x), ye = edgeY(x);
      for (let j = 0; j <= NR; j++) {
        const fr = j / NR; const y = ye + (ys - ye) * fr;
        P.push([x, y, side * thick(fr), (y - ye)]);
      }
    }
    const at = (i, j) => P[clamp(i, 0, NS) * (NR + 1) + clamp(j, 0, NR)];
    for (let i = 0; i <= NS; i++) for (let j = 0; j <= NR; j++) {
      const p = at(i, j);
      const tx = V3.sub(at(i + 1, j), at(i - 1, j)), ty = V3.sub(at(i, j + 1), at(i, j - 1));
      let n = V3.norm(V3.cross(tx, ty)); if (n[2] * side < 0) n = V3.sc(n, -1);
      k.pos.push(p[0], p[1], p[2]); k.nor.push(...n); k.aux.push(0, p[3]);
    }
    for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) {
      const a = base + i * (NR + 1) + j, b = a + NR + 1;
      k.idx.push(a, b, b + 1, a, b + 1, a + 1);
    }
  }
  boxGeom(-14 * KS, -1.2 * KS, -3.0 * KS, 0.2 * KS, -0.95 * KS, 0.95 * KS, 1, k);   // handle
  boxGeom(-1.2 * KS, 0.25 * KS, -3.7 * KS, 0.35 * KS, -0.5 * KS, 0.5 * KS, 2, k);    // bolster
  KNIFE = geoVao(k);
}

// ---------------------------------------------------------------- shadow map
const SM = 2048; let smTex, smFbo;
function buildShadow() {
  smTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, smTex);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT32F, SM, SM);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  smFbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, smFbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, smTex, 0);
  gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

// ---------------------------------------------------------------- camera / light
const CAM = { target: [0, 1.9, 0.6], yaw: 27 * Math.PI / 180, elev: 27 * Math.PI / 180, dist: 96, fov: 30 * Math.PI / 180 };
const LDIR = V3.norm([-0.62, 1.0, 0.22]);
let VP, LVP, CAMPOS, FWD, PXSCALE;
function setupCamera() {
  const t = CAM.target;
  CAMPOS = [t[0] + Math.sin(CAM.yaw) * Math.cos(CAM.elev) * CAM.dist, t[1] + Math.sin(CAM.elev) * CAM.dist, t[2] + Math.cos(CAM.yaw) * Math.cos(CAM.elev) * CAM.dist];
  FWD = V3.norm(V3.sub(t, CAMPOS));
  const P = M4.persp(CAM.fov, W / Hh, 5, 900), V = M4.lookAt(CAMPOS, t, [0, 1, 0]);
  VP = M4.mul(P, V);
  PXSCALE = Hh / (2 * Math.tan(CAM.fov / 2));
  const lt = [0, 2, 2];
  const LP = M4.ortho(-44, 44, -44, 44, 1, 240), LV = M4.lookAt(V3.add(lt, V3.sc(LDIR, 110)), lt, [0, 1, 0]);
  LVP = M4.mul(LP, LV);
}

// ---------------------------------------------------------------- programs
let P = {};
function buildPrograms() {
  P.env = mkProg(ENV_VS, ENV_FS, false); P.envS = mkProg(ENV_VS, ENV_FS, true);
  P.box = mkProg(BOX_VS, BOX_FS, false); P.boxS = mkProg(BOX_VS, BOX_FS, true);
  P.cube = mkProg(CUBE_VS, CUBE_FS, false); P.cubeS = mkProg(CUBE_VS, CUBE_FS, true);
  P.piece = mkProg(PIECE_VS, PIECE_FS, false); P.pieceS = mkProg(PIECE_VS, PIECE_FS, true);
  P.pt = mkProg(PT_VS, PT_FS, false); P.ptS = mkProg(PT_VS, PT_FS, true);
  P.knife = mkProg(KNIFE_VS, KNIFE_FS, false); P.knifeS = mkProg(KNIFE_VS, KNIFE_FS, true);
  P.crumb = mkProg(CRUMB_VS, CRUMB_FS, false);
}
function useProg(pr) {
  gl.useProgram(pr.p); const u = pr.u;
  if (u.uVP) gl.uniformMatrix4fv(u.uVP, false, VP);
  if (u.uLVP) gl.uniformMatrix4fv(u.uLVP, false, LVP);
  if (u.uCam) gl.uniform3fv(u.uCam, CAMPOS);
  if (u.uL) gl.uniform3fv(u.uL, LDIR);
  if (u.uKey) gl.uniform3fv(u.uKey, [2.55, 2.40, 2.15]);
  if (u.uShadow) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, smTex); gl.uniform1i(u.uShadow, 0); }
  return u;
}

// ---------------------------------------------------------------- pieces for a round
let CUR = null; // {ri, ps, N, vao, mode, hist, cdf}
// Build one round: carve the banana into voxels, group the voxels into the pieces the cut
// planes make, then run the pile simulation once per PIECE (not per voxel) so that one cut
// moves two big banana halves instead of two hundred loose cubes.
function setupRound(ri) {
  const r = ROUNDS[ri];
  const C = buildCells(r.cell, r.mode === 'cube');
  const cg = C.cg, ps = C.ps, inside = C.inside;
  const NC = cg[0] * cg[1] * cg[2];
  // piece-driven only while the voxels are finer than the cut grid; past that one voxel is one piece
  const pd = r.pd;
  const SX = new Int32Array(cg[0]), SY = new Int32Array(cg[1]), SZ = new Int32Array(cg[2]);
  for (let i = 0; i < cg[0]; i++) SX[i] = Math.min(r.nx, Math.floor((i + 0.5) / cg[0] * (r.nx + 1)));
  for (let i = 0; i < cg[1]; i++) SY[i] = Math.min(r.ny, Math.floor((i + 0.5) / cg[1] * (r.ny + 1)));
  for (let i = 0; i < cg[2]; i++) SZ[i] = Math.min(r.nz, Math.floor((i + 0.5) / cg[2] * (r.nz + 1)));
  const gid = new Int32Array(NC).fill(-1);
  const idx = (ix, iy, iz) => (iz * cg[1] + iy) * cg[0] + ix;
  let NG = 0;
  if (pd) {
    const stack = new Int32Array(NC);
    for (let iz = 0; iz < cg[2]; iz++) for (let iy = 0; iy < cg[1]; iy++) for (let ix = 0; ix < cg[0]; ix++) {
      const i0 = idx(ix, iy, iz);
      if (!inside[i0] || gid[i0] >= 0) continue;
      const g = NG++; gid[i0] = g;
      const s0 = SX[ix], s1 = SY[iy], s2 = SZ[iz];
      let sp = 0; stack[sp++] = i0;
      while (sp > 0) {
        const c = stack[--sp];
        const cx = c % cg[0], cy = ((c / cg[0]) | 0) % cg[1], cz = (c / (cg[0] * cg[1])) | 0;
        for (let d = 0; d < 6; d++) {
          const nx = cx + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = cy + (d === 2 ? 1 : d === 3 ? -1 : 0), nz = cz + (d === 4 ? 1 : d === 5 ? -1 : 0);
          if (nx < 0 || ny < 0 || nz < 0 || nx >= cg[0] || ny >= cg[1] || nz >= cg[2]) continue;
          const ni = idx(nx, ny, nz);
          if (!inside[ni] || gid[ni] >= 0) continue;
          if (SX[nx] !== s0 || SY[ny] !== s1 || SZ[nz] !== s2) continue;
          gid[ni] = g; stack[sp++] = ni;
        }
      }
    }
  } else {
    for (let i = 0; i < NC; i++) if (inside[i]) gid[i] = NG++;
  }
  // which voxels do we actually draw: when a piece is many voxels, only its shell is visible
  const cellId = [], cellG = [], cellMask = [];
  for (let iz = 0; iz < cg[2]; iz++) for (let iy = 0; iy < cg[1]; iy++) for (let ix = 0; ix < cg[0]; ix++) {
    const i0 = idx(ix, iy, iz);
    if (!inside[i0]) continue;
    let mask = 0, open = 0;
    for (let d = 0; d < 6; d++) {
      const nx = ix + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = iy + (d === 2 ? 1 : d === 3 ? -1 : 0), nz = iz + (d === 4 ? 1 : d === 5 ? -1 : 0);
      const out = nx < 0 || ny < 0 || nz < 0 || nx >= cg[0] || ny >= cg[1] || nz >= cg[2] || !inside[idx(nx, ny, nz)];
      if (out) { mask |= 1 << d; open++; }                       // that face is original skin
      else if (gid[idx(nx, ny, nz)] !== gid[i0]) {
        open++;
        // flesh only where a knife plane really runs between the two cells, not where the flood fill split a piece
        if (!pd || SX[nx] !== SX[ix] || SY[ny] !== SY[iy] || SZ[nz] !== SZ[iz]) mask |= 1 << (6 + d);
      }
    }
    if (pd && open === 0 && C.infl) {
      // surface-traced cells: the outer layer can be mostly air, so the solid layer under it must stay too
      for (let d = 0; d < 6 && open === 0; d++) {
        const nx = ix + (d === 0 ? 2 : d === 1 ? -2 : 0), ny = iy + (d === 2 ? 2 : d === 3 ? -2 : 0), nz = iz + (d === 4 ? 2 : d === 5 ? -2 : 0);
        if (nx < 0 || ny < 0 || nz < 0 || nx >= cg[0] || ny >= cg[1] || nz >= cg[2] || !inside[idx(nx, ny, nz)] || gid[idx(nx, ny, nz)] !== gid[i0]) open++;
      }
    }
    if (pd && open === 0) continue;                              // buried inside its own piece
    cellId.push(i0); cellG.push(gid[i0]); cellMask.push(mask);
  }
  let N = cellId.length;
  let mode = r.mode;
  if (mode === 'cube' && N > 150000) mode = 'point';             // degrade rather than crawl
  // ---- per piece: centre, footprint, size
  const gx = new Float32Array(NG), gy = new Float32Array(NG), gz = new Float32Array(NG), gn = new Float32Array(NG);
  const bx0 = new Float32Array(NG).fill(1e9), bx1 = new Float32Array(NG).fill(-1e9);
  const by0 = new Float32Array(NG).fill(1e9), by1 = new Float32Array(NG).fill(-1e9);
  const bz0 = new Float32Array(NG).fill(1e9), bz1 = new Float32Array(NG).fill(-1e9);
  const cellPos = (i0) => {
    const ix = i0 % cg[0], iy = ((i0 / cg[0]) | 0) % cg[1], iz = (i0 / (cg[0] * cg[1])) | 0;
    return [-SD[0] / 2 + (ix + 0.5) * ps[0], (iy + 0.5) * ps[1], -SD[2] / 2 + (iz + 0.5) * ps[2]];
  };
  for (let i = 0; i < NC; i++) {
    const g = gid[i]; if (g < 0) continue;
    const p = cellPos(i);
    gx[g] += p[0]; gy[g] += p[1]; gz[g] += p[2]; gn[g]++;
    if (p[0] < bx0[g]) bx0[g] = p[0]; if (p[0] > bx1[g]) bx1[g] = p[0];
    if (p[1] < by0[g]) by0[g] = p[1]; if (p[1] > by1[g]) by1[g] = p[1];
    if (p[2] < bz0[g]) bz0[g] = p[2]; if (p[2] > bz1[g]) bz1[g] = p[2];
  }
  const cellVol = ps[0] * ps[1] * ps[2];
  const gsz = new Float32Array(NG);
  let avg = 0;
  for (let g = 0; g < NG; g++) { gx[g] /= gn[g]; gy[g] /= gn[g]; gz[g] /= gn[g]; gsz[g] = Math.cbrt(gn[g] * cellVol); avg += gsz[g]; }
  avg /= NG;
  const big = avg > 1.2;
  // ---- pile simulation, once per piece (same model as the cake engine)
  const rnd = mulberry(1234 + ri * 77);
  const gauss = () => { let u = 0, v = 0; while (u === 0) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v); };
  const rest = new Float32Array(NG * 4), ex = new Float32Array(NG * 4), imp = new Float32Array(NG * 4);
  const OX = new Float32Array(NG), OZ = new Float32Array(NG), VX = new Float32Array(NG), VZ = new Float32Array(NG);
  const hgt = new Float32Array(NG), fx = new Float32Array(NG), fz = new Float32Array(NG), tland = new Float32Array(NG);
  const tc = r.tc, Tw = r.tw, WP = 0.85;
  // the fruit lets go from the stem end and the wave runs along its length
  const xFrontAt = (t) => { const f = clamp((t - tc) / Tw, 0, 1); return -SD[0] / 2 + SD[0] * Math.pow(f, 1 / WP); };
  const SPREAD = 0.55;
  for (let g = 0; g < NG; g++) {
    const ox = gx[g], oy = gy[g], oz = gz[g];
    OX[g] = ox; OZ[g] = oz;
    const xf = (ox + SD[0] / 2) / SD[0], yf = oy / SD[1];
    const t0 = Math.max(tc + 0.005, tc + Tw * Math.pow(xf, WP) + gauss() * 0.040 * Tw + 0.05 * yf + 0.01);
    rest[g * 4 + 3] = t0;
    VZ[g] = (10 + 30 * rnd() * rnd() + 20 * yf * rnd()) * SPREAD;
    VX[g] = ((ox / (SD[0] / 2)) * (4 + 10 * rnd()) + gauss() * 4) * SPREAD + 6 * SPREAD;
    if (big) { VZ[g] = (22 + 46 * rnd() * (0.4 + yf)) * SPREAD; VX[g] *= 1.7; }
    let axv, ang;
    const hx = Math.max(ps[0], bx1[g] - bx0[g] + ps[0]) * 0.5, hy = Math.max(ps[1], by1[g] - by0[g] + ps[1]) * 0.5, hz = Math.max(ps[2], bz1[g] - bz0[g] + ps[2]) * 0.5;
    if (big && r.coin && rnd() < 0.88) {
      const sg = rnd() < 0.5 ? 1 : -1;
      axv = V3.norm([(rnd() - 0.5) * 0.10, (rnd() - 0.5) * 0.10, 1]);
      ang = sg * (Math.PI / 2 + (rnd() - 0.5) * 0.14);
      hgt[g] = hx * 2; fx[g] = hy; fz[g] = hz;
    } else if (big) {
      const k = rnd() < 0.7 ? 1 : (rnd() < 0.5 ? 2 : 3);
      axv = V3.norm([1, (rnd() - 0.5) * 0.12, (rnd() - 0.5) * 0.12]);
      ang = k * Math.PI / 2 + (rnd() - 0.5) * 0.18;
      if (k % 2) { hgt[g] = hz * 2; fx[g] = hx; fz[g] = hy; } else { hgt[g] = hy * 2; fx[g] = hx; fz[g] = hz; }
    } else if (r.exact) {
      // a real chunk settles on one of its faces, at any heading, with a little tilt
      const f = Math.floor(rnd() * 6), yaw = rnd() * 6.2831853, tl = (rnd() - 0.5) * 0.16;
      const Bm = [M3.I, M3.rx(Math.PI), M3.rx(Math.PI / 2), M3.rx(-Math.PI / 2), M3.rz(Math.PI / 2), M3.rz(-Math.PI / 2)][f];
      const aa = M3.toAA(M3.mul(M3.ry(yaw), M3.mul(M3.rx(tl), Bm)));
      axv = aa[0]; ang = aa[1] + (rnd() < 0.35 ? 6.2831853 : 0);
      const up = f < 2 ? hy : f < 4 ? hz : hx, fa = f < 4 ? hx : hy, fb = f < 2 ? hz : f < 4 ? hy : hz;
      const cy = Math.abs(Math.cos(yaw)), sy = Math.abs(Math.sin(yaw));
      hgt[g] = up * 2; fx[g] = cy * fa + sy * fb; fz[g] = sy * fa + cy * fb;
    } else {
      axv = V3.norm([0.8 + rnd(), (rnd() - 0.5) * 1.2, (rnd() - 0.5) * 1.6]);
      ang = (1 + Math.floor(rnd() * 3)) * Math.PI / 2 + (rnd() - 0.5) * 0.6;
      hgt[g] = gsz[g]; fx[g] = gsz[g] * 0.5; fz[g] = gsz[g] * 0.5;
    }
    ex[g * 4] = axv[0] * ang; ex[g * 4 + 1] = axv[1] * ang; ex[g * 4 + 2] = axv[2] * ang;
    tland[g] = t0 + Math.sqrt(2 * Math.max(oy - 0.5, 0.15) / GRAV);
  }
  // process pieces in the order they reach the pile
  const NB = 8192, tA = tc, tB = tc + Tw + 0.8;
  const cnt = new Uint32Array(NB + 1), bin = new Uint16Array(NG);
  for (let i = 0; i < NG; i++) { const bb = clamp(Math.floor((tland[i] - tA) / (tB - tA) * NB), 0, NB - 1); bin[i] = bb; cnt[bb + 1]++; }
  for (let bb = 0; bb < NB; bb++) cnt[bb + 1] += cnt[bb];
  const order = new Uint32Array(NG);
  for (let i = 0; i < NG; i++) order[cnt[bin[i]]++] = i;
  const DX0 = -64, DX1 = 64, DZ0 = -43, DZ1 = 50;
  const columnMode = NG > 20000;
  const cell = columnMode ? clamp(avg * 1.7, 0.16, 0.7) : clamp(Math.min(ps[0], ps[1], ps[2]) * 2.2, 0.16, 0.6);
  const GX = Math.ceil((DX1 - DX0) / cell), GZ = Math.ceil((DZ1 - DZ0) / cell);
  const hm = new Float32Array(GX * GZ);
  for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) {
    const x = DX0 + (i + 0.5) * cell, z = DZ0 + (j + 0.5) * cell;
    hm[j * GX + i] = (x > BOARD.x0 && x < BOARD.x1 && z > BOARD.z0 && z < BOARD.z1) ? 0 : -3;
  }
  const ci = (x) => clamp(Math.floor((x - DX0) / cell), 0, GX - 1), cj = (z) => clamp(Math.floor((z - DZ0) / cell), 0, GZ - 1);
  const footMax = (x, z, hx, hz) => {
    const i0 = ci(x - hx), i1 = ci(x + hx), j0 = cj(z - hz), j1 = cj(z + hz);
    let m = -1e9; for (let j = j0; j <= j1; j++) { const row = j * GX; for (let i = i0; i <= i1; i++) { const v = hm[row + i]; if (v > m) m = v; } } return m;
  };
  const stamp = (x, z, hx, hz, v) => {
    const i0 = ci(x - hx), i1 = ci(x + hx), j0 = cj(z - hz), j1 = cj(z + hz);
    for (let j = j0; j <= j1; j++) { const row = j * GX; for (let i = i0; i <= i1; i++) if (hm[row + i] < v) hm[row + i] = v; }
  };
  const hist = new Float32Array(Math.ceil((tB - tA + 1.5) * 100));
  const scaleCount = r.total / NG;
  const cellOf = new Uint32Array(NG);
  const hEffUnit = cellVol / (cell * cell) * 1.7;   // how much one voxel of fruit raises a pile column
  const slope = 1.05;
  const nb = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
  for (let k = 0; k < NG; k++) {
    const g = order[k];
    const ox = gx[g], oy = gy[g], oz = gz[g], hx = fx[g], hz = fz[g], h = hgt[g];
    const off = columnMode ? gsz[g] * 0.45 : h / 2;
    const surf = columnMode ? (x, z) => hm[cj(z) * GX + ci(x)] : (x, z) => footMax(x, z, hx * 0.45, hz * 0.45);
    let xi = ox, zi = oz, Tf = 0.16;
    for (let it = 0; it < 3; it++) {
      const drop = oy - (surf(xi, zi) + off);
      Tf = drop > 0.05 ? Math.sqrt(2 * drop / GRAV) : 0.16;
      xi = ox + VX[g] * Tf; zi = oz + VZ[g] * Tf;
    }
    const tl = rest[g * 4 + 3] + Tf;
    const xfr = xFrontAt(tl);
    const standing = xfr < SD[0] / 2 - 0.05;          // once the whole fruit has gone, nothing blocks the far end
    const blocked = (x, z) => standing && x > xfr + 0.1 && Math.abs(z) < SD[2] / 2 + 0.2;
    if (standing && xi > xfr - 0.1 && Math.abs(zi) < SD[2] / 2 + 0.2) xi = xfr - 0.1 - rnd() * 0.3;
    xi = clamp(xi, DX0 + 1, DX1 - 1); zi = clamp(zi, DZ0 + 1, DZ1 - 1);
    const yi = surf(xi, zi) + off;
    imp[g * 4] = xi; imp[g * 4 + 1] = yi; imp[g * 4 + 2] = zi;
    let rx, ry, rz;
    if (columnMode) {
      let i = ci(xi), j = cj(zi);
      for (let it = 0; it < 160; it++) {
        const hc = hm[j * GX + i];
        let bi = -1, bj = -1, bd = 0;
        const o = (k * 7 + it) & 7;
        for (let d = 0; d < 8; d++) {
          const dd = nb[(d + o) & 7]; const ni = i + dd[0], nj = j + dd[1];
          if (ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue;
          if (blocked(DX0 + (ni + 0.5) * cell, DZ0 + (nj + 0.5) * cell)) continue;
          const dr = hc - hm[nj * GX + ni] - slope * cell * ((dd[0] && dd[1]) ? 1.414 : 1);
          if (dr > bd) { bd = dr; bi = ni; bj = nj; }
        }
        if (bi < 0) break;
        i = bi; j = bj;
      }
      const c = j * GX + i, y = hm[c];
      hm[c] = y + gn[g] * hEffUnit; cellOf[g] = c;
      rx = DX0 + (i + rnd()) * cell; ry = y + off; rz = DZ0 + (j + rnd()) * cell;
    } else {
      let x = xi, z = zi, y = footMax(x, z, hx * 0.45, hz * 0.45);
      const step = Math.max(hx, hz) * 0.9 + cell;
      for (let it = 0; it < 40; it++) {
        let best = y, bx = x, bz = z;
        const o = (k + it) & 7;
        for (let d = 0; d < 8; d++) {
          const dd = dirs[(d + o) & 7];
          const nx = clamp(x + dd[0] * step, DX0 + 1, DX1 - 1), nz = clamp(z + dd[1] * step, DZ0 + 1, DZ1 - 1);
          if (blocked(nx, nz)) continue;
          const ny = footMax(nx, nz, hx * 0.45, hz * 0.45);
          if (ny < best - (big ? 0.28 : 0.42) * step) { best = ny; bx = nx; bz = nz; }
        }
        if (bx === x && bz === z) break;
        x = bx; z = bz; y = best;
      }
      stamp(x, z, hx * 0.8, hz * 0.8, y + h);
      rx = x; ry = y + off; rz = z;
      OX[g] = x; OZ[g] = z;
    }
    rest[g * 4] = rx; rest[g * 4 + 1] = ry; rest[g * 4 + 2] = rz;
    const dist = Math.hypot(rx - xi, ry - yi, rz - zi);
    imp[g * 4 + 3] = dist < 0.05 ? 0 : Math.min(1.0, dist / (16 + 24 * rnd()));
    const hb = Math.floor((tl - tA) * 100); if (hb >= 0 && hb < hist.length) hist[hb] += scaleCount;
  }
  for (let g = 0; g < NG; g++) {
    if (columnMode) { const depth = hm[cellOf[g]] - rest[g * 4 + 1]; ex[g * 4 + 3] = clamp(1 - depth / (4 * avg + 0.3), 0.45, 1); }
    else { const top = footMax(OX[g], OZ[g], fx[g] * 0.5, fz[g] * 0.5); const depth = top - (rest[g * 4 + 1] + hgt[g] / 2); ex[g * 4 + 3] = clamp(1 - depth / (5 * hgt[g] + 0.3), 0.45, 1); }
  }
  // ---- exact rounds: one exact-shape instance per piece (see PIECE_FS). The piece is the banana inside
  // its knife box; coin rounds only have x planes, so their box is open in y and z.
  let aHalf = null, aLo = null, aHi = null;
  if ((r.coin || r.exact) && pd) {
    const W = [SD[0] / (r.nx + 1), SD[1] / (r.ny + 1), SD[2] / (r.nz + 1)], O = [-SD[0] / 2, 0, -SD[2] / 2];
    const MG = r.coin ? 0.30 : Math.max(ps[0], ps[1], ps[2]) * 1.2 + 0.02;   // margin so the ridged peel always fits
    const sl = new Int32Array(NG * 3).fill(-1);
    for (let i = 0; i < NC; i++) { const g = gid[i]; if (g < 0 || sl[g * 3] >= 0) continue;
      const ix = i % cg[0], iy = ((i / cg[0]) | 0) % cg[1], iz = (i / (cg[0] * cg[1])) | 0;
      sl[g * 3] = SX[ix]; sl[g * 3 + 1] = SY[iy]; sl[g * 3 + 2] = SZ[iz]; }
    N = NG;
    cellG.length = 0; for (let g = 0; g < NG; g++) cellG.push(g);
    aHalf = new Float32Array(NG * 3); aLo = new Float32Array(NG * 3); aHi = new Float32Array(NG * 3);
    var pieceC = new Float32Array(NG * 3);
    const B0 = [bx0, by0, bz0], B1 = [bx1, by1, bz1];
    for (let g = 0; g < NG; g++) for (let a = 0; a < 3; a++) {
      const open = r.coin && a > 0;
      const k0 = open ? -1e3 : O[a] + sl[g * 3 + a] * W[a], k1 = open ? 1e3 : k0 + W[a];
      const lo = Math.max(k0, B0[a][g] - ps[a] / 2 - MG), hi = Math.min(k1, B1[a][g] + ps[a] / 2 + MG);
      pieceC[g * 3 + a] = (lo + hi) / 2; aHalf[g * 3 + a] = (hi - lo) / 2;
      aLo[g * 3 + a] = k0; aHi[g * 3 + a] = k1;
    }
    mode = 'piece';
  }
  // ---- per voxel attributes
  const aRest = new Float32Array(N * 4), aEx = new Float32Array(N * 4), aImp = new Float32Array(N * 4);
  const aOrig = new Float32Array(N * 3), aLoc = pd ? new Float32Array(N * 4) : null, aMask = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const g = cellG[i], p = mode === 'piece' ? [pieceC[g * 3], pieceC[g * 3 + 1], pieceC[g * 3 + 2]] : cellPos(cellId[i]);
    for (let c = 0; c < 4; c++) { aRest[i * 4 + c] = rest[g * 4 + c]; aEx[i * 4 + c] = ex[g * 4 + c]; aImp[i * 4 + c] = imp[g * 4 + c]; }
    aOrig[i * 3] = p[0]; aOrig[i * 3 + 1] = p[1]; aOrig[i * 3 + 2] = p[2];
    if (pd) { aLoc[i * 4] = p[0] - gx[g]; aLoc[i * 4 + 1] = p[1] - gy[g]; aLoc[i * 4 + 2] = p[2] - gz[g]; aLoc[i * 4 + 3] = gsz[g]; }
    aMask[i] = mode === 'piece' ? 0 : cellMask[i];
  }
  // ---- GPU
  if (CUR && CUR.bufs) { CUR.bufs.forEach(b => gl.deleteBuffer(b)); gl.deleteVertexArray(CUR.vao); }
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const bufs = [];
  const add = (loc, data, size, div) => { const b = gl.createBuffer(); bufs.push(b); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); gl.vertexAttribDivisor(loc, div); };
  const div = (mode === 'cube' || mode === 'piece') ? 1 : 0;
  if (mode === 'cube' || mode === 'piece') { add(0, CUBE.pos, 3, 0); add(1, CUBE.nor, 3, 0); }
  if (mode === 'piece') { add(9, aHalf, 3, 1); add(10, aLo, 3, 1); add(11, aHi, 3, 1); }
  add(3, aRest, 4, div); add(4, aEx, 4, div); add(5, aImp, 4, div);
  add(6, aOrig, 3, div); add(8, aMask, 1, div);
  if (pd) add(7, aLoc, 4, div);
  if (mode === 'cube' || mode === 'piece') { const ib = gl.createBuffer(); bufs.push(ib); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, CUBE.idx, gl.STATIC_DRAW); }
  gl.bindVertexArray(null);
  const cdf = new Float32Array(hist.length); let acc = 0, tot = 0; for (let i = 0; i < hist.length; i++) tot += hist[i];
  for (let i = 0; i < hist.length; i++) { acc += hist[i]; cdf[i] = tot > 0 ? acc / tot : 1; }
  CUR = { ri, ps, N, NG, pd, vao, bufs, mode, hist: Array.from(hist), histT0: r.start + tA, cdf, cdfT0: tA };
  return { N, NG, pd, mode, total: r.total, cells: C.count, cell: r.cell, grid: cg.join('x') };
}

// ---------------------------------------------------------------- knife / cutting state
const qX = Q.aa([0, 1, 0], Math.PI / 2);
const qZ = Q.aa([0, 1, 0], Math.PI);
const qY = Q.mul(Q.aa([1, 0, 0], Math.PI / 2), qZ);
function planeCoord(axis, n, i) { const c = (i + 1) * SD[axis] / (n + 1); return axis === 1 ? c : c - SD[axis] / 2; }
function cutIndex(axis, n, k) { return axis === 0 ? k : n - 1 - k; }
const TOPY = SD[1] + 2.2, FRONTZ = SD[2] / 2 + 2.6;
const KOX = SD[0] / 2 + 3.2, KOZ = SD[2] / 2 + 3.2;   // where the blade sits so it clears the whole fruit
function knifePose(axis, c, s, rockOn) {
  // s: 0 = raised, 1 = fully through
  if (axis === 1) {
    const ez = FRONTZ + (-SD[2] / 2 - 0.6 - FRONTZ) * s;
    return { pos: [KOX, c, ez + KH], q: qY, edge: ez };
  }
  const ey = TOPY + (-0.05 - TOPY) * s;
  const rock = rockOn ? Q.aa([0, 0, 1], -0.13 * (1 - s)) : [0, 0, 0, 1];
  if (axis === 0) return { pos: [c, ey + KH, KOZ], q: Q.mul(qX, rock), edge: ey };
  return { pos: [KOX, ey + KH, c], q: Q.mul(qZ, rock), edge: ey };
}
function lerpPose(a, b, t, lift) {
  const p = V3.lerp(a.pos, b.pos, t); p[1] += lift * Math.sin(Math.PI * t);
  return { pos: p, q: Q.slerp(a.q, b.q, t) };
}
function cutState(r, tl) {
  const done = [0, 0, 0]; let act = [-1, -1, 0, 0]; let pose = null;
  const ph = r.phases;
  const rockOn = r.dt > 0.05;
  const raised = (pi, k) => { const p = ph[pi]; const kk = clamp(k, 0, p.n - 1); return knifePose(p.axis, planeCoord(p.axis, p.n, cutIndex(p.axis, p.n, kk)), 0, rockOn); };
  const offPose = (base) => ({ pos: V3.add(base.pos, [18, 22, 9]), q: base.q });
  if (tl < ph[0].t0) {
    const first = raised(0, 0);
    const a = clamp((tl - (ph[0].t0 - 0.42)) / 0.42, 0, 1);
    pose = a <= 0 ? null : lerpPose(offPose(first), first, ss(0, 1, a), 0);
  } else if (tl >= r.cutEnd) {
    done[0] = ph[0].n; done[2] = ph[1].n; done[1] = ph[2].n;
    const last = raised(2, ph[2].n - 1);
    const a = clamp((tl - r.cutEnd) / 0.3, 0, 1);
    pose = a >= 1 ? null : lerpPose(last, offPose(last), a * a, 0);
  } else {
    for (let pi = 0; pi < 3; pi++) {
      const p = ph[pi];
      if (tl >= p.t1) { done[p.axis] = p.n; continue; }
      if (tl < p.t0) { // transition from previous phase
        const a = (tl - ph[pi - 1].t1) / r.tr;
        pose = lerpPose(raised(pi - 1, ph[pi - 1].n - 1), raised(pi, 0), ss(0, 1, a), 6);
        break;
      }
      const f = (tl - p.t0) / r.dt; const k = Math.floor(f); const s = f - k;
      done[p.axis] = k;
      const i = cutIndex(p.axis, p.n, k), c = planeCoord(p.axis, p.n, i);
      if (s < DOWN) {
        const d = s / DOWN; const e = r.dt > 0.05 ? d * d * (3 - 2 * d) : d;
        pose = knifePose(p.axis, c, e, rockOn);
        act = [p.axis, i, pose.edge, 1];
      } else {
        done[p.axis] = k + 1;
        const u = (s - DOWN) / (1 - DOWN);
        const kn = k + 1;
        let cn = c;
        if (kn < p.n) cn = planeCoord(p.axis, p.n, cutIndex(p.axis, p.n, kn));
        const e = r.dt > 0.05 ? ss(0, 1, u) : u;
        const pp = knifePose(p.axis, c + (cn - c) * e, 1 - e, rockOn);
        pose = pp;
      }
      break;
    }
  }
  return { done, act, pose };
}
function totalCuts(done) { return done[0] + done[1] + done[2]; }

// ---------------------------------------------------------------- overlay
const $ = (id) => document.getElementById(id);
const fmt = (n) => Math.round(n).toLocaleString('en-US');
function fmtCal(v) {
  if (v >= 100) return fmt(v);
  if (v >= 1) return v.toFixed(1);
  return v.toPrecision(2);
}
let lastTxt = {};
function setTxt(el, s) { if (lastTxt[el] !== s) { lastTxt[el] = s; $(el).querySelector('.num, .pill b, .p') ? null : null; } }
function setHTML(id, sel, s) { const k = id + sel; if (lastTxt[k] !== s) { lastTxt[k] = s; document.querySelector('#' + id + ' ' + sel).textContent = s; } }

const LOGO_SVG = (sz) => {
  const k = 0.866, P = (a) => a.map(p => p.join(',')).join(' ');
  const cubeS = (cx, cy, s, letter) => {
    const top = [[cx, cy - s], [cx + k * s, cy - 0.5 * s], [cx, cy], [cx - k * s, cy - 0.5 * s]];
    const left = [[cx - k * s, cy - 0.5 * s], [cx, cy], [cx, cy + s], [cx - k * s, cy + 0.5 * s]];
    const right = [[cx, cy], [cx + k * s, cy - 0.5 * s], [cx + k * s, cy + 0.5 * s], [cx, cy + s]];
    let g = `<polygon points="${P(top)}" fill="#FFE27A"/><polygon points="${P(left)}" fill="#FF8A3D"/><polygon points="${P(right)}" fill="#E8343A"/>`;
    if (letter) g += `<g transform="matrix(${k},-0.5,0,1,${cx},${cy})"><text x="${s / 2}" y="${s * 0.8}" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="${s * 0.86}" fill="#fff">${letter}</text></g>`;
    return g;
  };
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 100 100"><defs><radialGradient id="lgb${sz}" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#2050b8"/><stop offset=".6" stop-color="#0f2560"/><stop offset="1" stop-color="#070d24"/></radialGradient></defs><rect x="2" y="2" width="96" height="96" rx="24" fill="url(#lgb${sz})"/>${cubeS(45, 52, 26, 'S')}${cubeS(74, 21, 6)}${cubeS(83, 34, 4)}${cubeS(64, 12, 3)}</svg>`;
};
const THUMB = (c) => `<svg width="68" height="68" viewBox="0 0 24 24"><path fill="${c}" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>`;
const BELL = (c) => `<svg width="66" height="66" viewBox="0 0 24 24"><path fill="${c}" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`;

function initOverlay() {
  $('wm').innerHTML = LOGO_SVG(58) + '<span>@ShakClips</span>';
  document.querySelector('#end .logo').innerHTML = LOGO_SVG(250);
}
function updateOverlay(ri, tl, cs) {
  const r = ROUNDS[ri];
  const cuts = totalCuts(cs.done);
  // pieces are counted as they break away and hit the pile (like the format leaders), so $ per piece drops live
  let pieces = 1;
  if (tl >= r.tc && CUR && CUR.ri === ri) {
    const k = clamp(Math.floor((tl - CUR.cdfT0) / 0.01), 0, CUR.cdf.length - 1);
    const f = tl - CUR.cdfT0 < 0 ? 0 : CUR.cdf[k];
    pieces = f >= 0.9995 ? r.total : Math.max(1, Math.round(1 + (r.total - 1) * f));
  }
  setHTML('cuts', '.num', fmt(cuts));
  setHTML('pieces', '.num', fmt(pieces));
  setHTML('ppp', '.pill b', fmtCal(VALUE / pieces));
  // hook (round 1)
  let ho = 0;
  if (ri === 0) ho = ss(0.0, 0.18, tl) * (1 - ss(1.0, 1.22, tl));
  $('hook').style.opacity = ho.toFixed(3);
  $('cuts').style.opacity = ri === 0 ? ss(1.05, 1.3, tl).toFixed(3) : '1';
  $('hook').style.transform = `scale(${(0.92 + 0.08 * ss(0.05, 0.3, tl)).toFixed(3)})`;
  // final banner
  let bo = 0, bs = 1;
  if (ri === ROUNDS.length - 1) { bo = ss(0.05, 0.18, tl) * (1 - ss(0.95, 1.15, tl)); bs = 0.7 + 0.3 * easeOutBack(clamp((tl - 0.05) / 0.3, 0, 1)); }
  $('banner').style.opacity = bo.toFixed(3);
  $('banner').style.transform = `scale(${bs.toFixed(3)})`;
  // number pulse on cut
  const pulse = r.dt > 0.1 ? Math.max(0, 1 - ((tl - r.phases[0].t0) % r.dt) / 0.12) * (tl > r.phases[0].t0 && tl < r.cutEnd ? 1 : 0) : 0;
  document.querySelector('#cuts .num').style.transform = `scale(${(1 + 0.06 * pulse).toFixed(3)})`;
  // flash at round start
  $('flash').style.opacity = ri > 0 ? (0.22 * Math.max(0, 1 - tl / 0.16)).toFixed(3) : '0';
}

// ---------------------------------------------------------------- draw
function drawScene(ri, tl, shadow) {
  const r = ROUNDS[ri];
  const cs = cutState(r, tl);
  const collapsed = tl >= r.tc && CUR && CUR.ri === ri;
  // stack intro transform
  let yoff = 0, sy = 1, sxz = 1;
  const dropT = 0.30;
  if (tl < dropT) { const e = tl / dropT; yoff = 13 * (1 - e) * (1 - e); }
  else if (tl < dropT + 0.5) { const e = tl - dropT; const w = Math.exp(-e * 7) * Math.cos(e * 30); sy = 1 - 0.09 * w; sxz = 1 + 0.045 * w; }
  if (tl > r.phases[0].t0 && tl < r.tc) {  // soft wobble from each chop
    let last = -1;
    for (const p of r.phases) { if (tl >= p.t0 + DOWN * r.dt) { const k = Math.min(p.n - 1, Math.floor((tl - p.t0 - DOWN * r.dt) / r.dt)); last = Math.max(last, p.t0 + (k + DOWN) * r.dt); } }
    if (last >= 0) { const e = tl - last; const w = (r.dt > 0.1 ? 1 : 0.35) * Math.exp(-e * 9) * Math.cos(e * 34); sy *= 1 - 0.022 * w; sxz *= 1 + 0.011 * w; }
  }
  // pieces or box
  if (!collapsed) {
    const u = useProg(shadow ? P.boxS : P.box);
    gl.uniform3fv(u.uXf, [sxz, sy, yoff]);
    if (!shadow) {
      gl.uniform3fv(u.uN, [r.nx, r.ny, r.nz]);
      gl.uniform3fv(u.uDone, cs.done);
      gl.uniform4fv(u.uAct, cs.act);
    }
    gl.bindVertexArray(BOX.vao); gl.drawElements(gl.TRIANGLES, BOX.n, gl.UNSIGNED_INT, 0);
  } else {
    const isCube = CUR.mode === 'cube' || CUR.mode === 'piece';
    const isPiece = CUR.mode === 'piece';
    const u = useProg(isPiece ? (shadow ? P.pieceS : P.piece) : isCube ? (shadow ? P.cubeS : P.cube) : (shadow ? P.ptS : P.pt));
    gl.uniform1f(u.uT, tl); gl.uniform3fv(u.uPS, CUR.ps); gl.uniform1f(u.uGrav, GRAV); gl.uniform1f(u.uPD, CUR.pd ? 1 : 0);
    if (!isCube) {
      if (u.uPx) gl.uniform1f(u.uPx, PXSCALE);
      if (u.uLPx) gl.uniform1f(u.uLPx, SM / 104);
      if (u.uFwd) gl.uniform3fv(u.uFwd, FWD);
      if (u.uLOD) gl.uniform1f(u.uLOD, CUR.ps[0] < 0.07 ? 1 : 0);
    }
    gl.bindVertexArray(CUR.vao);
    if (isCube) gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_INT, 0, CUR.N);
    else gl.drawArrays(gl.POINTS, 0, CUR.N);
  }
  return cs;
}
function drawKnife(r, tl, shadow) {
  const frame = 1 / 30;
  let K = 1;
  if (!shadow && tl > r.phases[0].t0 && tl < r.cutEnd) K = r.dt > 0.1 ? 1 : clamp(Math.ceil(frame / r.dt * 2.5), 2, 8);
  gl.disable(gl.CULL_FACE);
  const u = useProg(shadow ? P.knifeS : P.knife);
  gl.bindVertexArray(KNIFE.vao);
  if (K > 1) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); }
  for (let j = K - 1; j >= 0; j--) {
    const tk = tl - j * frame / K;
    const cs = cutState(r, tk);
    if (!cs.pose) continue;
    gl.uniformMatrix4fv(u.uModel, false, Q.mat(cs.pose.q, cs.pose.pos));
    if (!shadow) { gl.uniform1f(u.uAlpha, K > 1 ? Math.min(1, 2.0 / K) * (j === 0 ? 1.3 : 1) : 1); gl.uniform1f(u.uGhost, j === 0 ? 0 : 1); }
    gl.drawElements(gl.TRIANGLES, KNIFE.n, gl.UNSIGNED_INT, 0);
  }
  if (K > 1) { gl.disable(gl.BLEND); gl.depthMask(true); }
}
function locate(t) {
  for (let i = 0; i < ROUNDS.length; i++) { const r = ROUNDS[i]; if (t < r.start + r.dur) return [i, t - r.start]; }
  return [-1, t - window.END_START];
}
let endMode = false;
function renderRound(ri, tl) {
  const r = ROUNDS[ri];
  // shadow pass
  gl.bindFramebuffer(gl.FRAMEBUFFER, smFbo); gl.viewport(0, 0, SM, SM);
  gl.enable(gl.DEPTH_TEST); gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
  drawScene(ri, tl, true);
  drawKnife(r, tl, true);
  // main pass
  gl.bindFramebuffer(gl.FRAMEBUFFER, POST.msFbo); gl.viewport(0, 0, W, Hh);
  gl.clearColor(0.02, 0.02, 0.02, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  useProg(P.env); gl.bindVertexArray(ENV.vao); gl.drawElements(gl.TRIANGLES, ENV.n, gl.UNSIGNED_INT, 0);
  const cs = drawScene(ri, tl, false);
  drawCrumbs(r, tl, false);
  drawKnife(r, tl, false);
  gl.bindVertexArray(null);
  runPost();
  return cs;
}
window.renderFrame = function (t) {
  const [ri, tl] = locate(t);
  if (ri >= 0) {
    if (endMode) { endMode = false; $('end').style.display = 'none'; $('still').style.display = 'none'; cv.style.display = 'block'; ['cuts', 'pieces', 'ppp', 'wm', 'wm2'].forEach(i => $(i).style.display = ''); }
    const cs = renderRound(ri, tl);
    updateOverlay(ri, tl, cs);
    gl.finish();
    return { ri, tl };
  }
  // end card
  if (!endMode) {
    endMode = true;
    const last = ROUNDS.length - 1, r = ROUNDS[last];
    renderRound(last, r.dur - 0.01); gl.finish();
    $('still').src = cv.toDataURL('image/jpeg', 0.95);
    $('still').style.display = 'block'; cv.style.display = 'none';
    $('end').style.display = 'block';
  }
  endCard(tl);
  return { ri: -1, tl };
};
function endCard(te) {
  te *= END_SPEED;
  const blur = ss(0, 0.45, te);
  $('still').style.filter = `blur(${(blur * 16).toFixed(1)}px) brightness(${(1 - 0.35 * blur).toFixed(3)})`;
  ['cuts', 'pieces', 'ppp', 'hook', 'banner'].forEach(i => $(i).style.opacity = (1 - ss(0, 0.3, te)).toFixed(3));
  $('wm').style.opacity = (0.82 * (1 - ss(0, 0.3, te))).toFixed(3); $('wm2').style.opacity = '0';
  $('end').querySelector('.dim').style.opacity = ss(0, 0.45, te).toFixed(3);
  const pop = (el, t0, d = 0.35) => { const a = clamp((te - t0) / d, 0, 1); el.style.opacity = ss(0, 0.6, a).toFixed(3); el.style.transform = `translateY(${((1 - a) * 40).toFixed(1)}px) scale(${(0.6 + 0.4 * easeOutBack(a)).toFixed(3)})`; };
  const q = (s) => $('end').querySelector(s);
  pop(q('.logo'), 0.15, 0.4); pop(q('.word'), 0.32); pop(q('.handle'), 0.42); pop(q('.q'), 0.6); pop(q('.row'), 0.85); pop(q('.foot'), 1.1);
  // tap choreography
  const tap = $('tap');
  const subBtn = $('subBtn'), bell = $('bellBtn'), like = $('likeBtn');
  const rowY = 1150 + 66;
  // approximate centers (row is centered: like 132 | 28 | sub ~ 470 | 28 | bell 132)
  const subW = subBtn.offsetWidth || 470; const total = 132 + 28 + subW + 28 + 132; const x0 = (1080 - total) / 2;
  const cLike = [x0 + 66, rowY], cSub = [x0 + 132 + 28 + subW / 2, rowY], cBell = [x0 + 132 + 28 + subW + 28 + 66, rowY];
  const path = [[1.35, [880, 1650]], [1.85, cSub], [2.25, cSub], [2.6, cBell], [2.95, cBell], [3.3, cLike], [3.7, cLike], [4.2, [900, 1700]]];
  let pos = path[0][1];
  for (let i = 0; i < path.length - 1; i++) { const [ta, pa] = path[i], [tb, pb] = path[i + 1]; if (te >= ta && te <= tb) { const e = ss(ta, tb, te); pos = V3.lerp([...pa, 0], [...pb, 0], e); } else if (te > tb) pos = pb; }
  const tapAt = [1.95, 2.7, 3.45];
  let press = 0; for (const ta of tapAt) press = Math.max(press, Math.max(0, 1 - Math.abs(te - ta) / 0.12));
  tap.style.left = (pos[0] - 45).toFixed(1) + 'px'; tap.style.top = (pos[1] - 45).toFixed(1) + 'px';
  tap.style.opacity = (ss(1.3, 1.45, te) * (1 - ss(4.0, 4.25, te))).toFixed(3);
  tap.style.transform = `scale(${(1 - 0.25 * press).toFixed(3)})`;
  const subbed = te >= tapAt[0];
  subBtn.classList.toggle('done', subbed);
  setHTML('subBtn', '#subTxt', subbed ? 'FOLLOWING' : 'FOLLOW');
  subBtn.style.transform = `scale(${(1 + 0.08 * Math.max(0, 1 - Math.abs(te - tapAt[0] - 0.08) / 0.15)).toFixed(3)})`;
  const belled = te >= tapAt[1];
  const bk = 'bell' + (belled ? 1 : 0); if (lastTxt.bell !== bk) { lastTxt.bell = bk; bell.innerHTML = BELL(belled ? '#FFD24A' : '#ffffff'); }
  const wig = belled ? Math.sin((te - tapAt[1]) * 40) * Math.exp(-(te - tapAt[1]) * 4) * 22 : 0;
  bell.firstChild.style.transform = `rotate(${wig.toFixed(1)}deg)`;
  const liked = te >= tapAt[2];
  const lk = 'like' + (liked ? 1 : 0); if (lastTxt.like !== lk) { lastTxt.like = lk; like.innerHTML = THUMB(liked ? '#7CF29A' : '#ffffff'); }
  like.style.transform = `scale(${(1 + 0.18 * (liked ? Math.max(0, 1 - (te - tapAt[2]) / 0.25) : 0)).toFixed(3)})`;
}

// ---------------------------------------------------------------- init
window.ready = (async () => {
  await Promise.all([document.fonts.load('900 66px "Inter Display"'), document.fonts.load('800 40px "Inter Display"')]);
  buildGeometry(); buildShadow(); setupCamera(); buildPrograms(); buildPost();
  initOverlay();
  $('likeBtn').innerHTML = THUMB('#fff'); $('bellBtn').innerHTML = BELL('#fff');
  return true;
})();
window.setupRound = setupRound;
window.getInfo = () => ({ END_START: window.END_START, TOTAL_DUR: window.TOTAL_DUR, rounds: ROUNDS.map(r => ({ start: r.start, dur: r.dur, tc: r.tc, cutEnd: r.cutEnd, total: r.total, dt: r.dt, phases: r.phases, intro: r.intro })) });
window.getHist = () => ({ hist: CUR.hist, t0: CUR.histT0 });
window.cutTimes = function () {
  // global time of each cut impact (bottom of down stroke)
  const out = [];
  ROUNDS.forEach((r, ri) => { for (const p of r.phases) for (let k = 0; k < p.n; k++) out.push({ t: r.start + p.t0 + (k + DOWN) * r.dt, ri, axis: p.axis }); });
  return out;
};
window.setCam = (o) => { Object.assign(CAM, o); setupCamera(); };
