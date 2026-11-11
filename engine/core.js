// Shak Clips 2D stick-figure engine (Canvas 2D). Original character designs.
const W = 1920, H = 1080;
const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
const T = window.TIMING;
const S = (i) => T.times[i - 1][0], E = (i) => T.times[i - 1][1];
function wordT(i, w, frac = 0) { const txt = T.sentences[i - 1]; const k = txt.toLowerCase().indexOf(w.toLowerCase()); return S(i) + (E(i) - S(i)) * (Math.max(0, k) + frac * w.length) / txt.length; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeIO = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const back = (t) => { t = clamp(t, 0, 1); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const pop = (tl, t0, d = 0.35) => tl < t0 ? 0 : back((tl - t0) / d);
function rnd(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const INK = '#1d1a1a', LW = 7;
const FONT = (w, s) => `${w} ${s}px "Inter Display", Inter, sans-serif`;

// ---------------------------------------------------------------- primitives
function shape(fill, stroke = INK, lw = LW) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); } }
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function ellipse(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function line(x1, y1, x2, y2, lw = LW, col = INK) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); }
function poly(pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
function text(str, x, y, size, col = '#fff', weight = 900, align = 'center', stroke = INK, sw = 10) {
  ctx.font = FONT(weight, size); ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineWidth = sw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = col; ctx.fillText(str, x, y);
}
function withT(x, y, rot, sc, fn) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sc !== undefined && sc !== 1) ctx.scale(sc, sc); fn(); ctx.restore(); }

// ---------------------------------------------------------------- characters
const CAST = {
  lustig: { suit: '#2F3B5E', tie: '#C8312B', hat: 'top', mus: 'thin', monocle: true, hair: 'slick', hairCol: '#2a201c', skin: '#F2D5B8', body: 'thin' },
  poisson: { suit: '#8B5E3C', tie: '#2F7D4F', hat: null, mus: null, glasses: true, hair: 'bald', skin: '#F0CDA8', body: 'round' },
  wife: { dress: '#7B4B94', hat: null, hair: 'bun', hairCol: '#5a3a26', skin: '#F2D3B5', body: 'dress', lips: true },
  d1: { suit: '#6E6E6E', tie: '#2f2f2f', hat: 'bowler', mus: 'walrus', hairCol: '#5b4636', skin: '#EBC7A4', body: 'thin' },
  d2: { suit: '#7A6A3A', tie: '#9b2d2d', hat: 'cap', mus: null, beard: true, hairCol: '#3d2f26', skin: '#E2B996', body: 'thin' },
  d3: { suit: '#4E5D49', tie: '#c49a32', hat: 'bowler', mus: 'thin', hairCol: '#222', skin: '#F0D0B0', body: 'round' },
  d4: { suit: '#5B4A63', tie: '#d7d7d7', hat: null, hair: 'side', hairCol: '#8a6a42', mus: 'walrus', skin: '#EDC9A6', body: 'thin' },
  cop: { suit: '#27407A', tie: '#27407A', hat: 'kepi', mus: 'thin', hairCol: '#222', skin: '#EFCCAA', body: 'thin' },
  capone: { suit: '#3a3a40', stripes: true, tie: '#e8e1cf', hat: 'fedora', hatCol: '#e7e2d6', bandCol: '#222', mus: null, scar: true, hairCol: '#222', skin: '#E0B48E', body: 'round' },
  agent: { suit: '#C9A46A', tie: '#3b3b3b', hat: 'fedora', hatCol: '#5b5048', bandCol: '#222', mus: null, hairCol: '#222', skin: '#EFCCAA', body: 'thin', coat: true },
  agent2: { suit: '#9a8a70', tie: '#7a1f1f', hat: 'fedora', hatCol: '#3b3f46', bandCol: '#111', mus: 'thin', hairCol: '#222', skin: '#D9AE87', body: 'thin', coat: true },
  aristo: { suit: '#1f1f22', tie: '#ffffff', hat: 'top', mus: 'walrus', hairCol: '#bbb', skin: '#F3D9C2', body: 'thin', monocle: true },
  aristo2: { dress: '#2f5f6b', hat: null, hair: 'bun', hairCol: '#c9c2b4', skin: '#F3D9C2', body: 'dress', lips: true },
  reader: { suit: '#7d8a9c', tie: '#c97f2b', hat: 'cap', hatCol: '#6b5a48', mus: null, hairCol: '#333', skin: '#E7C2A0', body: 'thin' },
  reader2: { suit: '#9c7d7d', tie: '#2b5fc9', hat: null, hair: 'side', hairCol: '#3a2a1a', mus: 'thin', skin: '#F0CFB0', body: 'thin' },
  worker: { suit: '#3D6FA8', tie: '#3D6FA8', hat: 'cap', hatCol: '#3a3a3a', mus: null, hairCol: '#333', skin: '#E0B48E', body: 'thin' },
};
// pose: {aL:[shoulder, elbow], aR, lL:[hip, knee], lR, lean, headTilt}
// Leg-angle convention: the left leg is drawn from hip x -14 and the right from +14, so the shipped idle
// (lL +0.06 / lR -0.06) CONVERGES the feet. Copying that sign pattern at a bigger angle crosses the legs.
// Any pose that needs a wide stance uses the opposite signs. Also: setting `bob` turns off the idle breath.
const POSES = {
  idle: (t = 0) => ({ aL: [0.12 + 0.03 * Math.sin(t * 2), 0.15], aR: [-0.12 - 0.03 * Math.sin(t * 2), -0.15], lL: [0.06, 0], lR: [-0.06, 0] }),
  hips: () => ({ aL: [0.9, -1.9], aR: [-0.9, 1.9], lL: [0.12, 0], lR: [-0.12, 0] }),
  point: (t = 0) => ({ aL: [0.12, 0.15], aR: [-1.45 - 0.05 * Math.sin(t * 6), -0.1], lL: [0.08, 0], lR: [-0.08, 0] }),
  pointL: (t = 0) => ({ aL: [1.45 + 0.05 * Math.sin(t * 6), 0.1], aR: [-0.12, -0.15], lL: [0.08, 0], lR: [-0.08, 0] }),
  armsUp: (t = 0) => ({ aL: [2.5 + 0.12 * Math.sin(t * 9), 0.2], aR: [-2.5 - 0.12 * Math.sin(t * 9 + 1), -0.2], lL: [0.15, 0], lR: [-0.15, 0] }),
  shrug: () => ({ aL: [0.9, 1.5], aR: [-0.9, -1.5], lL: [0.08, 0], lR: [-0.08, 0] }),
  hold: () => ({ aL: [0.55, -1.35], aR: [-0.55, 1.35], lL: [0.07, 0], lR: [-0.07, 0] }),
  holdUp: () => ({ aL: [1.9, -0.9], aR: [-1.9, 0.9], lL: [0.07, 0], lR: [-0.07, 0] }),
  chin: () => ({ aL: [0.1, 0.15], aR: [-0.5, 2.5], lL: [0.07, 0], lR: [-0.07, 0] }),
  shh: () => ({ aL: [0.1, 0.15], aR: [-0.35, 2.75], lL: [0.07, 0], lR: [-0.07, 0] }),
  heart: () => ({ aL: [0.1, 0.15], aR: [-0.25, 2.3], lL: [0.07, 0], lR: [-0.07, 0] }),
  face: () => ({ aL: [0.35, -2.75], aR: [-0.35, 2.75], lL: [0.07, 0], lR: [-0.07, 0] }),
  cross: () => ({ aL: [0.55, -1.9], aR: [-0.55, 1.9], lL: [0.07, 0], lR: [-0.07, 0] }),
  wave: (t = 0) => ({ aL: [0.12, 0.15], aR: [-2.3, -0.5 + 0.45 * Math.sin(t * 10)], lL: [0.07, 0], lR: [-0.07, 0] }),
  rub: (t = 0) => ({ aL: [0.5 + 0.08 * Math.sin(t * 14), -1.5], aR: [-0.5 - 0.08 * Math.sin(t * 14), 1.5], lL: [0.07, 0], lR: [-0.07, 0] }),
  sit: () => ({ aL: [0.45, -1.2], aR: [-0.45, 1.2], lL: [1.45, -1.45], lR: [1.35, -1.45] }),
  give: () => ({ aL: [0.12, 0.15], aR: [-1.15, -0.25], lL: [0.07, 0], lR: [-0.07, 0] }),
  climb: (t = 0) => ({ aL: [2.75 + 0.15 * Math.sin(t * 6), 0.2], aR: [-2.75 + 0.15 * Math.sin(t * 6), -0.2], lL: [0.5 + 0.3 * Math.sin(t * 6), -0.8], lR: [-0.3 - 0.3 * Math.sin(t * 6), -0.6] }),
};
function walkPose(ph, amp = 1) { const s = Math.sin(ph); return { aL: [-0.5 * s * amp, 0.2], aR: [-0.5 * s * amp, -0.2], lL: [0.45 * s * amp, -Math.max(0, -Math.cos(ph)) * 0.5 * amp], lR: [-0.45 * s * amp, -Math.max(0, Math.cos(ph)) * 0.5 * amp], bob: Math.abs(Math.cos(ph)) * 6 * amp }; }
function runPose(ph) { const s = Math.sin(ph); return { aL: [-1.0 * s, 1.2], aR: [1.0 * s, -1.2], lL: [0.85 * s, -0.9 * Math.max(0, -Math.cos(ph)) - 0.3], lR: [-0.85 * s, -0.9 * Math.max(0, Math.cos(ph)) - 0.3], lean: 0.18, bob: Math.abs(Math.cos(ph)) * 12 }; }

// draw a person; o: {x, y, s, face, pose, flip, look, t, talk, blink, prop(fnInHandSpace)}
function person(id, o) {
  // seed defaults to a hash of the cast id: without it every figure blinks and breathes in lockstep.
  if (o.seed === undefined) { let h = 0; for (let i = 0; i < String(id).length; i++) h = (h * 31 + String(id).charCodeAt(i)) % 997; o = Object.assign({}, o, { seed: h / 97 }); }
  const c = CAST[id], s = o.s || 1, p = Object.assign({}, typeof o.pose === 'function' ? o.pose(o.t || 0) : (o.pose || POSES.idle(o.t || 0)));
  const breath = p.bob === undefined ? 2.5 * Math.sin((o.t || 0) * 2.6 + (o.seed || 0)) : 0;
  ctx.save(); ctx.translate(o.x, o.y - ((p.bob || 0) + breath) * s); ctx.scale((o.flip ? -1 : 1) * s, s); ctx.rotate((o.lean || 0) + (p.lean || 0));
  const hipY = -150, shY = -292, headY = shY - 74, R = 68;
  const limb = (x0, y0, a1, a2, l1, l2, col, lw) => {
    const x1 = x0 + Math.sin(a1) * l1, y1 = y0 + Math.cos(a1) * l1, x2 = x1 + Math.sin(a1 + a2) * l2, y2 = y1 + Math.cos(a1 + a2) * l2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    if (col) { ctx.strokeStyle = col; ctx.lineWidth = lw - 9; ctx.stroke(); }
    return [x2, y2, a1 + a2];
  };
  const sitting = p.lL[0] > 1;
  // legs
  const legCol = c.body === 'dress' ? '#2d2a2a' : shade(c.suit, -0.25);
  const fL = limb(-14, hipY, p.lL[0], p.lL[1], 78, 76, c.body === 'dress' ? null : legCol, 19);
  const fR = limb(14, hipY, p.lR[0], p.lR[1], 78, 76, c.body === 'dress' ? null : legCol, 19);
  for (const f of [fL, fR]) { ellipse(f[0] + 12, f[1] + 2, 20, 10, 0); shape('#1d1a1a', INK, 4); }
  // body
  if (c.body === 'dress') { poly([[-34, shY + 10], [34, shY + 10], [70, hipY + 70], [-70, hipY + 70]]); shape(c.dress); line(-26, shY + 70, 26, shY + 70, 6, shade(c.dress, -0.3)); }
  else if (c.body === 'round') { ellipse(0, (hipY + shY) / 2 + 6, 64, 84); shape(c.suit); }
  else { poly([[-42, shY], [42, shY], [32, hipY + 6], [-32, hipY + 6]]); shape(c.suit); }
  if (c.stripes) { ctx.save(); ellipse(0, (hipY + shY) / 2 + 6, 60, 80); ctx.clip(); for (let x = -60; x <= 60; x += 16) line(x, shY - 10, x, hipY + 20, 2.5, 'rgba(255,255,255,0.45)'); ctx.restore(); ellipse(0, (hipY + shY) / 2 + 6, 64, 84); shape(null); }
  if (c.coat) { line(0, shY + 6, 0, hipY + 4, 4, shade(c.suit, -0.35)); }
  if (c.tee && c.body !== 'dress') { poly([[-22, shY + 1], [22, shY + 1], [14, hipY - 4], [-14, hipY - 4]]); shape(c.tee, null); ctx.beginPath(); ctx.arc(0, shY + 2, 16, 0, Math.PI); shape(null, INK, 4); line(-24, shY + 2, -12, hipY + 2, 4, shade(c.suit, 0.25)); line(24, shY + 2, 12, hipY + 2, 4, shade(c.suit, 0.25)); line(16, shY + 30, 16, hipY - 6, 3, '#9a9aa2'); }
  else if (c.body !== 'dress') { poly([[-15, shY + 2], [15, shY + 2], [0, shY + 40]]); shape('#fff', INK, 4); poly([[-6, shY + 10], [6, shY + 10], [9, shY + 64], [0, shY + 74], [-9, shY + 64]]); shape(c.tie, INK, 3.5); }
  // arms (shoulder at y=shY+8)
  const armCol = c.body === 'dress' ? c.skin : c.suit;
  const hL = limb(-40, shY + 8, p.aL[0], p.aL[1], 70, 68, armCol, 18);
  const hR = limb(40, shY + 8, p.aR[0], p.aR[1], 70, 68, armCol, 18);
  circle(hL[0], hL[1], 12); shape(c.skin, INK, 5); circle(hR[0], hR[1], 12); shape(c.skin, INK, 5);
  if (o.prop) { ctx.save(); ctx.translate(hR[0], hR[1]); o.prop(); ctx.restore(); }
  if (o.propL) { ctx.save(); ctx.translate(hL[0], hL[1]); o.propL(); ctx.restore(); }
  // head
  ctx.save(); ctx.translate(0, headY); ctx.rotate(p.headTilt || o.tilt || 0);
  head(c, R, o);
  ctx.restore();
  ctx.restore();
}
function shade(hex, k) { let r, g, b;
  if (hex[0] === '#') { let h = hex.slice(1); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; const n = parseInt(h, 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; }
  else { const m = String(hex).match(/[\d.]+/g) || [0, 0, 0]; r = +m[0]; g = +m[1]; b = +m[2]; }   // accept rgb() too, so shade() nests
  const f = (v) => clamp(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255); return `rgb(${f(r)},${f(g)},${f(b)})`; }
function head(c, R, o) {
  const t = o.t || 0, face = o.face || 'neutral', look = o.look || 0;
  // hair behind
  if (c.hair === 'bun') { circle(0, -R - 6, 28); shape(c.hairCol); }
  circle(0, 0, R); shape(c.skin, INK, LW);
  if (c.hair === 'bald') { ellipse(-22, -40, 14, 7, -0.5); shape('rgba(255,255,255,0.6)', null); ctx.beginPath(); ctx.arc(0, 0, R, Math.PI * 0.85, Math.PI * 1.08); ctx.strokeStyle = '#8b6b52'; ctx.lineWidth = 10; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, R, -0.08 * Math.PI, 0.15 * Math.PI); ctx.stroke(); }
  if (c.hair === 'slick' || c.hair === 'side' || c.hair === 'bun') { ctx.beginPath(); ctx.arc(0, 0, R, Math.PI * 1.08, Math.PI * 1.92); ctx.quadraticCurveTo(10, -R * 0.55, -R * 0.95, -R * 0.25); ctx.closePath(); shape(c.hairCol, INK, 5); }
  // face
  const ex = 24, ey = -6;
  const blink = ((t * 0.8 + (o.seed || 0)) % 3.3) < 0.12;
  const eye = (x, kind) => {
    if (blink && kind !== 'closed' && kind !== 'dollar') kind = 'closed';
    if (kind === 'dot') { ellipse(x + look * 6, ey, 7.5, 9); shape(INK, null); }
    else if (kind === 'wide') { circle(x, ey, 15); shape('#fff', INK, 4); circle(x + look * 5, ey, 5.5); shape(INK, null); }
    else if (kind === 'closed') { ctx.beginPath(); ctx.arc(x, ey + 2, 9, Math.PI * 0.1, Math.PI * 0.9); ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.stroke(); }
    else if (kind === 'happy') { ctx.beginPath(); ctx.arc(x, ey + 4, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.stroke(); }
    else if (kind === 'half') { ellipse(x + look * 5, ey + 2, 7.5, 7); shape(INK, null); line(x - 11, ey - 3, x + 11, ey - 3, 4.5); }
    else if (kind === 'dollar') { text('$', x, ey, 34, '#2f9e44', 900, 'center', INK, 5); }
  };
  const brow = (x, ang, dy = 0) => { ctx.save(); ctx.translate(x, ey - 24 + dy); ctx.rotate(ang); line(-11, 0, 11, 0, 5); ctx.restore(); };
  const F = {
    neutral: ['dot', 'dot', 0, 0, 'flat'], smile: ['dot', 'dot', 0, -3, 'smile'], grin: ['happy', 'happy', -0.1, -6, 'grin'], sly: ['half', 'dot', 0.3, -6, 'smirk', 'r'],
    shock: ['wide', 'wide', -0.15, -10, 'O'], worried: ['dot', 'dot', -0.38, -4, 'wavy', 'in'], angry: ['dot', 'dot', 0.45, 2, 'frown'], sad: ['dot', 'dot', -0.42, -2, 'frown', 'in'],
    sus: ['half', 'dot', 0.35, 0, 'side'], bored: ['half', 'half', 0, 0, 'flat'], embarrassed: ['closed', 'closed', -0.35, -4, 'wavy', 'in'], dollar: ['dollar', 'dollar', 0, -8, 'grin'],
    wink: ['closed', 'dot', 0.2, -6, 'smirk'], proud: ['closed', 'closed', 0.15, -6, 'smile'], talk: ['dot', 'dot', 0, -3, 'talk'], scared: ['wide', 'wide', -0.4, -8, 'wavy', 'in'],
  }[face] || ['dot', 'dot', 0, 0, 'flat'];
  eye(-ex, F[0]); eye(ex, F[1]);
  if (F[5] === 'in') { brow(-ex, F[2], F[3]); brow(ex, -F[2], F[3]); }
  else if (F[5] === 'r') { brow(-ex, 0.05, 0); brow(ex, -0.35, F[3] - 6); }
  else { brow(-ex, F[2], F[3]); brow(ex, -F[2], F[3]); }
  const my = 30, m = o.talk ? (Math.sin(t * 22) > 0 ? 'talk' : F[4]) : F[4];
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineCap = 'round';
  if (m === 'flat') line(-12, my, 12, my, 5);
  else if (m === 'smile') { ctx.beginPath(); ctx.arc(0, my - 12, 16, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  else if (m === 'grin' || m === 'talk') { ctx.beginPath(); if (m === 'grin') { ctx.moveTo(-22, my - 6); ctx.quadraticCurveTo(0, my + 26, 22, my - 6); ctx.closePath(); } else ellipse(0, my, 11, 9); shape('#7a2020', INK, 4.5); if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-17, my - 3); ctx.lineTo(17, my - 3); ctx.lineTo(13, my + 3); ctx.lineTo(-13, my + 3); ctx.closePath(); shape('#fff', null); } }
  else if (m === 'smirk') { ctx.beginPath(); ctx.moveTo(-14, my + 2); ctx.quadraticCurveTo(4, my + 8, 18, my - 6); ctx.stroke(); }
  else if (m === 'O') { ellipse(0, my + 4, 11, 15); shape('#7a2020', INK, 4.5); }
  else if (m === 'frown') { ctx.beginPath(); ctx.arc(0, my + 14, 14, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  else if (m === 'wavy') { ctx.beginPath(); ctx.moveTo(-15, my); ctx.quadraticCurveTo(-7, my - 6, 0, my); ctx.quadraticCurveTo(7, my + 6, 15, my); ctx.stroke(); }
  else if (m === 'side') { line(-4, my + 2, 16, my - 2, 5); }
  if (c.lips && (m === 'flat' || m === 'side' || m === 'smile')) { /* small lip tint */ ellipse(0, my, 7, 3); shape('#b84a5a', null); }
  if (face === 'embarrassed' || face === 'proud' || o.blush) { ellipse(-38, 16, 11, 6); shape('rgba(230,90,90,0.55)', null); ellipse(38, 16, 11, 6); shape('rgba(230,90,90,0.55)', null); }
  if (face === 'worried' || face === 'scared' || o.sweat) { ctx.beginPath(); ctx.moveTo(56, -36); ctx.quadraticCurveTo(46, -18, 56, -12); ctx.quadraticCurveTo(66, -18, 56, -36); shape('#8fd3ff', INK, 3); }
  if (face === 'angry') { ctx.fillStyle = 'rgba(220,60,60,0.18)'; circle(0, 0, R - 4); ctx.fill(); }
  // mustache / beard / scar
  if (c.mus === 'thin') { ctx.beginPath(); ctx.moveTo(-20, my - 10); ctx.quadraticCurveTo(-8, my - 16, 0, my - 11); ctx.quadraticCurveTo(8, my - 16, 20, my - 10); ctx.quadraticCurveTo(26, my - 14, 28, my - 20); ctx.moveTo(-20, my - 10); ctx.quadraticCurveTo(-26, my - 14, -28, my - 20); ctx.strokeStyle = c.hairCol || INK; ctx.lineWidth = 5; ctx.stroke(); }
  if (c.mus === 'walrus') { ctx.beginPath(); ctx.moveTo(-26, my - 2); ctx.quadraticCurveTo(-20, my - 22, 0, my - 14); ctx.quadraticCurveTo(20, my - 22, 26, my - 2); ctx.quadraticCurveTo(0, my - 8, -26, my - 2); shape(c.hairCol || '#4a3a2a', INK, 3.5); }
  if (c.beard) { ctx.beginPath(); ctx.arc(0, 8, R - 2, Math.PI * 0.12, Math.PI * 0.88); ctx.quadraticCurveTo(0, R + 34, R * 0.94, 8 + R * 0.39); shape(c.hairCol, INK, 4); if (true) { /* mouth over beard */ line(-10, my + 2, 10, my + 2, 5, '#5a3030'); } }
  if (c.scar) { line(30, -2, 44, 26, 4, '#a0524a'); line(34, 6, 42, 4, 3, '#a0524a'); line(37, 14, 45, 12, 3, '#a0524a'); }
  if (c.glasses) { circle(-ex, ey, 17); shape('rgba(255,255,255,0.15)', INK, 4.5); circle(ex, ey, 17); shape('rgba(255,255,255,0.15)', INK, 4.5); line(-ex + 17, ey, ex - 17, ey, 4.5); }
  if (c.monocle) { circle(ex, ey, 19); shape('rgba(220,240,255,0.25)', '#c9a227', 5); ctx.beginPath(); ctx.moveTo(ex + 14, ey + 13); ctx.quadraticCurveTo(ex + 30, ey + 60, ex + 10, ey + 90); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3; ctx.stroke(); }
  // hats
  if (c.hat === 'top') { rrect(-58, -R - 4, 116, 14, 6); shape('#1f1f22'); rrect(-40, -R - 92, 80, 92, 6); shape('#1f1f22'); rrect(-40, -R - 22, 80, 14, 2); shape('#7a1f1f', INK, 4); }
  if (c.hat === 'bowler') { ctx.beginPath(); ctx.arc(0, -R + 8, 50, Math.PI, 0); ctx.closePath(); shape('#232020'); rrect(-64, -R + 2, 128, 13, 7); shape('#232020'); }
  if (c.hat === 'cap') { ctx.beginPath(); ctx.ellipse(0, -R + 14, 64, 34, 0, Math.PI, 0); ctx.closePath(); shape(c.hatCol || '#6b5a48'); ctx.beginPath(); ctx.ellipse(36, -R + 16, 40, 10, 0.1, 0, Math.PI * 2); shape(shade(c.hatCol || '#6b5a48', -0.25)); }
  if (c.hat === 'kepi') { poly([[-48, -R + 14], [48, -R + 14], [40, -R - 46], [-40, -R - 46]]); shape('#27407A'); rrect(-42, -R - 52, 84, 16, 6); shape('#C8312B'); ctx.beginPath(); ctx.ellipse(10, -R + 16, 54, 9, 0.05, 0, Math.PI); shape('#111'); circle(0, -R - 8, 7); shape('#e8c34a', INK, 3); }
  if (c.hat === 'fedora') { ctx.beginPath(); ctx.ellipse(0, -R + 8, 84, 16, 0, 0, Math.PI * 2); shape(c.hatCol); ctx.beginPath(); ctx.moveTo(-46, -R + 6); ctx.quadraticCurveTo(-48, -R - 62, 0, -R - 54); ctx.quadraticCurveTo(48, -R - 62, 46, -R + 6); ctx.closePath(); shape(c.hatCol); rrect(-46, -R - 12, 92, 14, 3); shape(c.bandCol, INK, 4); ctx.beginPath(); ctx.moveTo(-14, -R - 54); ctx.quadraticCurveTo(0, -R - 38, 14, -R - 54); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); }
  if (o.crown) { poly([[-40, -R - 92], [-40, -R - 130], [-20, -R - 110], [0, -R - 140], [20, -R - 110], [40, -R - 130], [40, -R - 92]]); shape('#F2C230', INK, 5); }
}

// ---------------------------------------------------------------- props
function money(x, y, s = 1, n = 3, label) {
  withT(x, y, 0, s, () => { for (let i = 0; i < n; i++) { rrect(-70, -18 - i * 16, 140, 26, 4); shape('#7BB06A', INK, 4.5); rrect(-62, -14 - i * 16, 124, 18, 3); shape(null, '#3f6b35', 2.5); circle(0, -5 - i * 16, 7); shape('#9fd08d', '#3f6b35', 2); }
    rrect(-10, -18 - (n - 1) * 16, 20, 26 + (n - 1) * 16, 2); shape('#E9D9A8', INK, 3); if (label) text(label, 0, 40, 34, '#fff', 900); });
}
function bill(x, y, s = 1, rot = 0, txt = '$') { withT(x, y, rot, s, () => { rrect(-70, -32, 140, 64, 6); shape('#86BC74', INK, 4.5); rrect(-60, -24, 120, 48, 4); shape(null, '#3f6b35', 2.5); text(txt, 0, 2, 30, '#2f5f2a', 900, 'center', null); }); }
function envelope(x, y, s = 1, rot = 0, cash = false) { withT(x, y, rot, s, () => { if (cash) { bill(0, -26, 0.8, -0.1); } rrect(-80, -50, 160, 100, 6); shape('#F3E6C8'); poly([[-80, -50], [0, 10], [80, -50]]); shape(null, INK, 4); circle(0, 4, 12); shape('#B3261E', INK, 3); }); }
function newspaper(x, y, s, head, sub, rot = 0, col = '#F4EEDC') {
  withT(x, y, rot, s, () => {
    rrect(-260, -170, 520, 340, 4); shape(col); text('LE PETIT PARISIEN', 0, -135, 30, INK, 900, 'center', null);
    line(-235, -112, 235, -112, 4); line(-235, -104, 235, -104, 2);
    const lines = head.split('\n'); lines.forEach((l, i) => text(l, 0, -66 + i * 50, 46, INK, 900, 'center', null));
    if (sub) text(sub, 0, -60 + lines.length * 50, 22, '#555', 700, 'center', null);
    for (let i = 0; i < 6; i++) { line(-235, 40 + i * 20, -20, 40 + i * 20, 5, '#bdb39a'); line(20, 40 + i * 20, 235, 40 + i * 20, 5, '#bdb39a'); }
  });
}
function letterhead(x, y, s, rot = 0, written = 1) {
  withT(x, y, rot, s, () => {
    rrect(-230, -300, 460, 600, 4); shape('#FBF6E9');
    circle(0, -232, 40); shape('#2F3B5E', INK, 4); text('RF', 0, -232, 34, '#F2C230', 900, 'center', null);
    text('MINISTÈRE DES POSTES', 0, -168, 28, '#2F3B5E', 900, 'center', null); text('ET TÉLÉGRAPHES', 0, -136, 28, '#2F3B5E', 900, 'center', null);
    line(-190, -112, 190, -112, 3, '#2F3B5E');
    const n = Math.floor(9 * written); for (let i = 0; i < 9; i++) { const w = i === 8 ? 180 : 380; const ww = i < n ? w : i === n ? w * ((written * 9) % 1) : 0; if (ww > 0) line(-190, -70 + i * 34, -190 + ww, -70 + i * 34, 5, '#3a3a52'); }
    if (written > 0.95) { circle(120, 230, 44); shape('rgba(179,38,30,0.15)', '#B3261E', 5); text('OFFICIEL', 120, 230, 18, '#B3261E', 900, 'center', null); }
  });
}
function sign(x, y, s, txt, col = '#F4EEDC', tcol = '#B3261E', rot = 0, w = 360) { withT(x, y, rot, s, () => { line(-w * 0.3, -60, 0, -150, 5); line(w * 0.3, -60, 0, -150, 5); circle(0, -150, 8); shape('#888', INK, 3); rrect(-w / 2, -60, w, 120, 10); shape(col); text(txt, 0, 2, 52, tcol, 900, 'center', null); }); }
function stamp(x, y, s, txt, col = '#C8312B', rot = -0.18, tl = 99, t0 = 0) {
  const k = tl < t0 ? 0 : Math.min(1, (tl - t0) / 0.18); if (k <= 0) return; const sc = s * (1 + (1 - easeOut(k)) * 1.6);
  withT(x, y, rot, sc, () => { ctx.globalAlpha = Math.min(1, k * 1.5) * 0.92; ctx.font = FONT(900, 110); const w = ctx.measureText(txt).width + 60; rrect(-w / 2, -75, w, 150, 14); shape(null, col, 12); rrect(-w / 2 + 14, -61, w - 28, 122, 8); shape(null, col, 4); text(txt, 0, 4, 110, col, 900, 'center', null); ctx.globalAlpha = 1; });
}
function xMark(x, y, s, tl, t0) { const k = ss(t0, t0 + 0.25, tl); if (k <= 0) return; withT(x, y, 0, s, () => { const d = 90; line(-d, -d, -d + 2 * d * Math.min(1, k * 2), -d + 2 * d * Math.min(1, k * 2), 26, '#D7263D'); if (k > 0.5) line(d, -d, d - 2 * d * (k - 0.5) * 2, -d + 2 * d * (k - 0.5) * 2, 26, '#D7263D'); }); }
function check(x, y, s, tl, t0) { const k = ss(t0, t0 + 0.3, tl); if (k <= 0) return; withT(x, y, 0, s, () => { ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-20, 50); if (k > 0.4) ctx.lineTo(-20 + 110 * (k - 0.4) / 0.6, 50 - 120 * (k - 0.4) / 0.6); ctx.strokeStyle = '#2f9e44'; ctx.lineWidth = 28; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }); }
function bulb(x, y, s, tl, t0) { const k = pop(tl, t0); if (k <= 0) return; withT(x, y, 0, s * k, () => { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(Math.cos(a) * 62, Math.sin(a) * 62 - 10, Math.cos(a) * 82, Math.sin(a) * 82 - 10, 6, '#F2C230'); } circle(0, -10, 44); shape('#FFE47A'); rrect(-20, 30, 40, 26, 5); shape('#9aa'); }); }
function qmark(x, y, s, tl, t0, col = '#F2C230') { const k = pop(tl, t0); if (k <= 0) return; withT(x, y, Math.sin(tl * 3) * 0.1, s * k, () => text('?', 0, 0, 120, col, 900, 'center', INK, 12)); }
function excl(x, y, s, tl, t0, col = '#E8343A') { const k = pop(tl, t0); if (k <= 0) return; withT(x, y, 0, s * k, () => text('!', 0, 0, 130, col, 900, 'center', INK, 12)); }
function fish(x, y, s, rot = 0) { withT(x, y, rot, s, () => { ctx.beginPath(); ctx.ellipse(0, 0, 70, 38, 0, 0, Math.PI * 2); shape('#5DA9E9'); poly([[60, 0], [110, -36], [104, 36]]); shape('#5DA9E9'); circle(-38, -8, 8); shape('#fff', INK, 3); circle(-38, -8, 3.5); shape(INK, null); ctx.beginPath(); ctx.arc(-10, 0, 26, -0.9, 0.9); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); }); }
function clock(x, y, s, ang) { withT(x, y, 0, s, () => { circle(0, 0, 90); shape('#FBF6E9'); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(Math.sin(a) * 72, -Math.cos(a) * 72, Math.sin(a) * 82, -Math.cos(a) * 82, 6); } line(0, 0, Math.sin(ang / 12) * 45, -Math.cos(ang / 12) * 45, 10); line(0, 0, Math.sin(ang) * 68, -Math.cos(ang) * 68, 6, '#C8312B'); circle(0, 0, 8); shape(INK, null); }); }
function calendar(x, y, s, txt, sub) { withT(x, y, 0, s, () => { rrect(-110, -120, 220, 240, 14); shape('#FBF6E9'); rrect(-110, -120, 220, 64, 14); shape('#C8312B'); circle(-60, -122, 10); shape('#888', INK, 3); circle(60, -122, 10); shape('#888', INK, 3); text(sub || '', 0, -88, 30, '#fff', 900, 'center', null); text(txt, 0, 26, 92, INK, 900, 'center', null); }); }
function briefcase(x, y, s, open = 0) { withT(x, y, 0, s, () => { rrect(-30, -90, 60, 26, 10); shape(null, INK, 9); rrect(-110, -70, 220, 140, 14); shape('#6B4226'); line(-110, -20, 110, -20, 5); rrect(-16, -30, 32, 22, 4); shape('#D9B44A', INK, 4); if (open) { money(0, -60 - open * 40, 0.9, 3); } }); }
function moneyBox(x, y, s, tl) { withT(x, y, 0, s, () => { rrect(-170, -120, 340, 240, 12); shape('#8B5A2B'); for (let i = 0; i < 4; i++) line(-170, -60 + i * 50, 170, -60 + i * 50, 3, '#6a4220'); rrect(-120, -150, 240, 30, 6); shape('#6a4220'); rrect(-70, -150, 140, 14, 4); shape(INK, null); circle(190, -20, 16); shape('#aaa', INK, 4); const a = tl * 6; line(190, -20, 190 + Math.cos(a) * 52, -20 + Math.sin(a) * 52, 9); circle(190 + Math.cos(a) * 52, -20 + Math.sin(a) * 52, 12); shape('#C8312B', INK, 4); rrect(-90, 70, 180, 20, 4); shape(INK, null); }); }
function eiffel(x, y, h, opts = {}) {
  // stylized lattice tower, base center at (x,y), height h
  const s = h / 1000; const col = opts.col || '#8A5A3B', dark = shade(col, -0.35);
  withT(x, y, 0, s, () => {
    const L = (yy) => { // half-width profile
      if (yy > -330) return lerp(300, 150, (-yy) / 330);
      if (yy > -600) return lerp(110, 62, (-yy - 330) / 270);
      return lerp(48, 6, (-yy - 600) / 380);
    };
    // legs + arch
    const out = [[-300, 0], [-150, -330], [-110, -340], [-62, -600], [-48, -610], [-6, -980], [6, -980], [48, -610], [62, -600], [110, -340], [150, -330], [300, 0], [205, 0], [150, -110], [80, -170], [0, -190], [-80, -170], [-150, -110], [-205, 0]];
    poly(out); shape(col, INK, 9);
    // lattice
    ctx.save(); poly(out); ctx.clip();
    for (let yy = -20; yy > -980; yy -= 46) { const w1 = L(yy), w2 = L(yy - 46); line(-w1, yy, w2, yy - 46, 3, dark); line(w1, yy, -w2, yy - 46, 3, dark); }
    ctx.restore();
    // platforms
    rrect(-180, -350, 360, 30, 4); shape(col, INK, 7); rrect(-82, -616, 164, 22, 4); shape(col, INK, 7); rrect(-22, -930, 44, 26, 4); shape(col, INK, 6);
    line(0, -980, 0, -1030, 8); circle(0, -1032, 8); shape(INK, null);
    if (opts.rust) { const r = rnd(5); for (let i = 0; i < 26; i++) { const yy = -40 - r() * 900; const w = L(yy) * 0.8; ellipse((r() * 2 - 1) * w, yy, 14 + r() * 26, 8 + r() * 14, r()); shape('rgba(150,60,20,0.75)', null); } }
  });
}
function crowd(x, y, n, s, t, signs) { const r = rnd(9); for (let i = 0; i < n; i++) { const ids = ['d1', 'd2', 'reader', 'reader2', 'd4', 'worker']; const id = ids[i % ids.length]; const px = x + (i - (n - 1) / 2) * 150 * s + (r() - 0.5) * 40, bob = Math.abs(Math.sin(t * 8 + i)) * 10; person(id, { x: px, y: y - bob + (i % 2) * 20, s: s * (0.9 + r() * 0.15), face: 'angry', t, seed: i, pose: POSES.armsUp(t + i), propL: signs && i % 2 === 0 ? () => sign(0, -40, 0.55, signs[i % signs.length], '#fff', '#C8312B', 0, 300) : null }); } }

// ---------------------------------------------------------------- backgrounds
function sky(top, bot) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(-2000, -2000, W + 4000, H + 4000); }
function cloud(x, y, s, col = '#FFF4E0') { withT(x, y, 0, s, () => { ctx.beginPath(); ctx.arc(-60, 10, 40, 0, Math.PI * 2); ctx.arc(0, -10, 55, 0, Math.PI * 2); ctx.arc(60, 10, 42, 0, Math.PI * 2); ctx.rect(-60, 10, 120, 40); shape(col, null); }); }
function building(x, y, w, h, col, roof = '#5d6b7a', win = '#3b4a5c', lit) { rrect(x, y - h, w, h, 3); shape(col, INK, 5); poly([[x - 8, y - h], [x + w + 8, y - h], [x + w - 10, y - h - 40], [x + 10, y - h - 40]]); shape(roof, INK, 5); for (let yy = y - h + 30; yy < y - 60; yy += 70) for (let xx = x + 22; xx < x + w - 40; xx += 56) { rrect(xx, yy, 30, 44, 3); shape(lit && ((xx * 7 + yy) % 3 === 0) ? '#FFD37A' : win, INK, 3); } }
function bgParis(t, o = {}) {
  sky(o.top || '#F3C98B', o.bot || '#F8E7C4');
  circle(o.sunX || 1500, o.sunY || 330, 90); shape('#FFE7A8', null);
  cloud(300 + (t * 8) % 300, 180, 1.2); cloud(1200 - (t * 6) % 200, 120, 0.9); cloud(1650, 240, 0.7);
  if (o.tower !== false) eiffel(o.tx || 1350, o.ty || 860, o.th || 760, { rust: o.rust });
  const r = rnd(3); for (let i = 0; i < 9; i++) { const bx = -100 + i * 240 + (r() - 0.5) * 30; if (o.tower !== false && Math.abs(bx + 110 - (o.tx || 1350)) < 200) continue; building(bx, 900, 210, 220 + r() * 140, ['#E6CFA8', '#DCC09A', '#EBD7B5'][i % 3], '#6F7D8C', '#56677a'); }
  ctx.fillStyle = '#B9A07E'; ctx.fillRect(-2000, 900, W + 4000, 400); line(-2000, 900, W + 2000, 900, 6);
  ctx.fillStyle = '#A88E6B'; for (let x = -100; x < W + 200; x += 180) ctx.fillRect(x, 960, 100, 10);
}
function bgRoom(t, o = {}) {
  ctx.fillStyle = o.wall || '#C79A6B'; ctx.fillRect(-2000, -2000, W + 4000, H + 4000);
  for (let x = -40; x < W + 40; x += 90) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x, 0, 40, 760); }
  ctx.fillStyle = o.wain || '#7A4E32'; ctx.fillRect(-2000, 760, W + 4000, 400); line(-2000, 760, W + 2000, 760, 6);
  if (o.window !== false) { const wx = o.wx || 1350; rrect(wx - 170, 150, 340, 440, 10); shape('#F6D9A0'); ctx.save(); rrect(wx - 170, 150, 340, 440, 10); ctx.clip(); sky('#F3C98B', '#F8E7C4'); eiffel(wx + 30, 640, 420); ctx.restore(); rrect(wx - 170, 150, 340, 440, 10); shape(null, INK, 9); line(wx, 150, wx, 590, 8); line(wx - 170, 370, wx + 170, 370, 8); poly([[wx - 200, 130], [wx - 150, 130], [wx - 150, 620], [wx - 220, 640]]); shape('#8E2B2B'); poly([[wx + 200, 130], [wx + 150, 130], [wx + 150, 620], [wx + 220, 640]]); shape('#8E2B2B'); }
  if (o.chandelier !== false) { const cx = o.cx || 700; line(cx, -20, cx, 90, 5); ctx.beginPath(); ctx.ellipse(cx, 110, 110, 26, 0, 0, Math.PI); shape('#D9B44A'); for (let i = -2; i <= 2; i++) { line(cx + i * 45, 110, cx + i * 45, 80, 4); ellipse(cx + i * 45, 70, 7, 14); shape('#FFE7A8', INK, 3); } }
}
function table(x, y, w) { rrect(x - w / 2, y, w, 34, 6); shape('#5E3B23'); rrect(x - w / 2 + 30, y + 34, 22, 160, 4); shape('#4a2e1b'); rrect(x + w / 2 - 52, y + 34, 22, 160, 4); shape('#4a2e1b'); }
function chair(x, y, s) { withT(x, y, 0, s, () => { rrect(-70, -330, 22, 330, 4); shape('#6B4226'); rrect(-80, -170, 150, 20, 4); shape('#7a4e2e'); rrect(46, -150, 18, 150, 4); shape('#6B4226'); rrect(-70, -150, 18, 150, 4); shape('#6B4226'); }); }
function bgPlain(col, col2) { const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1200); g.addColorStop(0, col); g.addColorStop(1, col2 || shade(col, -0.25)); ctx.fillStyle = g; ctx.fillRect(-2000, -2000, W + 4000, H + 4000); }
function bgMap(t, o) {
  ctx.fillStyle = '#E9D9B4'; ctx.fillRect(-2000, -2000, W + 4000, H + 4000);
  const r = rnd(4); for (let i = 0; i < 30; i++) { ellipse(r() * W, r() * H, 80 + r() * 160, 30 + r() * 60, r()); shape('rgba(160,130,80,0.06)', null); }
  if (o.sea) { ctx.fillStyle = '#9CC3CF'; ctx.fillRect(-2000, -2000, W + 4000, H + 4000); for (let i = 0; i < 18; i++) { const wx = (i * 233) % W, wy = (i * 157) % H; ctx.beginPath(); ctx.arc(wx, wy, 26, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; ctx.stroke(); } }
  for (const land of (o.lands || [])) { poly(land.pts); shape(land.col || '#D8C08F', INK, 6); }
  for (const p of (o.pins || [])) { circle(p.x, p.y, 16); shape(p.col || '#C8312B', INK, 5); text(p.label, p.x + (p.dx ?? 0), p.y + (p.dy ?? -50), 46, '#fff', 900); }
  if (o.route) { const [a, b, k, bend] = o.route; const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - (bend || 0); ctx.setLineDash([22, 16]); ctx.beginPath(); ctx.moveTo(a.x, a.y); const N = 40; for (let i = 1; i <= N * k; i++) { const u = i / N; ctx.lineTo((1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x, (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * my + u * u * b.y); } ctx.strokeStyle = '#C8312B'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke(); ctx.setLineDash([]);
    const u = k; const px = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x, py = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * my + u * u * b.y; if (o.vehicle) o.vehicle(px, py); }
}
function bgSea(t) { sky('#9FC6E0', '#E6F1F6'); cloud(300, 200, 1); cloud(1400, 150, 1.2); ctx.fillStyle = '#3F7FA6'; ctx.fillRect(-2000, 700, W + 4000, 800); for (let i = 0; i < 14; i++) { const x = ((i * 170 - t * 120) % (W + 300) + W + 300) % (W + 300) - 150; ctx.beginPath(); ctx.arc(x, 760 + (i % 3) * 90, 40, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 6; ctx.stroke(); } }
function ship(x, y, s, t) { withT(x, y + Math.sin(t * 2) * 6, Math.sin(t * 1.6) * 0.02, s, () => { poly([[-300, -40], [300, -40], [240, 60], [-250, 60]]); shape('#2b2b33'); rrect(-200, -110, 360, 70, 6); shape('#F4EEDC'); for (let i = 0; i < 6; i++) { circle(-170 + i * 60, -75, 12); shape('#9CC3CF', INK, 3); } rrect(-80, -210, 60, 100, 4); shape('#C8312B'); rrect(20, -210, 60, 100, 4); shape('#C8312B'); rrect(-80, -210, 60, 24, 4); shape(INK, null); rrect(20, -210, 60, 24, 4); shape(INK, null); for (let k = 0; k < 3; k++) { const ph = (t * 0.6 + k / 3) % 1; circle(-50 + ph * -60, -230 - ph * 160, 20 + ph * 30); shape(`rgba(120,120,120,${0.5 * (1 - ph)})`, null); } }); }
function train(x, y, s, t) { withT(x, y, 0, s, () => { rrect(-340, -160, 420, 150, 10); shape('#2E5E4E'); for (let i = 0; i < 4; i++) { rrect(-310 + i * 98, -135, 70, 60, 6); shape('#F6D9A0', INK, 4); } rrect(90, -130, 170, 120, 10); shape('#2b2b2b'); rrect(200, -200, 40, 70, 4); shape('#2b2b2b'); poly([[260, -10], [300, -10], [280, -60]]); shape('#C8312B'); for (let i = 0; i < 5; i++) { const wx = -300 + i * 130; circle(wx, -5, 32); shape('#444', INK, 6); line(wx, -5, wx + Math.cos(t * 10 + i) * 26, -5 + Math.sin(t * 10 + i) * 26, 5); } for (let k = 0; k < 3; k++) { const ph = (t * 0.9 + k / 3) % 1; circle(220 - ph * 140, -230 - ph * 120, 24 + ph * 34); shape(`rgba(235,235,235,${0.7 * (1 - ph)})`, '#aaa', 3); } }); }
function bgCountry(t) { sky('#AFD3E6', '#EEF3E2'); cloud(400 - (t * 60) % 600, 180, 1); cloud(1500 - (t * 40) % 700, 120, 0.8); const off = (t * 420) % 600; for (let i = -1; i < 5; i++) { const x = i * 600 - off; ctx.beginPath(); ctx.ellipse(x + 300, 760, 420, 160, 0, Math.PI, 0); shape('#8DB86B', INK, 5); } ctx.fillStyle = '#7CA65C'; ctx.fillRect(-2000, 760, W + 4000, 500); for (let i = -1; i < 12; i++) { const x = i * 200 - (t * 900) % 200; line(x, 880, x + 120, 880, 10, '#5a4a3a'); } line(-2000, 870, W + 2000, 870, 6, '#555'); }
function bgNYC(t, o = {}) { sky(o.top || '#F2B880', o.bot || '#F7DDBA'); const r = rnd(12); for (let i = 0; i < 14; i++) { const bx = i * 150 - 40, h = 260 + r() * 380; rrect(bx, 900 - h, 130, h, 3); shape(o.dark ? '#3a3f4f' : ['#8C8FA8', '#9A8C86', '#7E8A9C'][i % 3], INK, 5); if (r() < 0.4) { poly([[bx + 30, 900 - h], [bx + 100, 900 - h], [bx + 65, 900 - h - 90]]); shape(o.dark ? '#3a3f4f' : '#8C8FA8', INK, 5); } for (let yy = 900 - h + 30; yy < 860; yy += 50) for (let xx = bx + 18; xx < bx + 112; xx += 36) { rrect(xx, yy, 18, 26, 2); shape(o.dark ? (r() < 0.5 ? '#FFD37A' : '#2a2e3a') : '#c9d3e0', null); } } ctx.fillStyle = '#6b6560'; ctx.fillRect(-2000, 900, W + 4000, 400); line(-2000, 900, W + 2000, 900, 6); }
function bgOffice(t, o = {}) { ctx.fillStyle = o.wall || '#4E3B30'; ctx.fillRect(-2000, -2000, W + 4000, H + 4000); for (let x = 0; x < W; x += 160) line(x, 0, x, 760, 4, 'rgba(0,0,0,0.25)'); rrect(1250, 140, 420, 420, 8); shape('#2c3550'); ctx.save(); rrect(1250, 140, 420, 420, 8); ctx.clip(); bgNYC(t, { dark: true, top: '#1c2238', bot: '#39426a' }); ctx.restore(); rrect(1250, 140, 420, 420, 8); shape(null, INK, 9); line(1460, 140, 1460, 560, 8); ctx.fillStyle = '#2d211a'; ctx.fillRect(-2000, 760, W + 4000, 400); line(-2000, 760, W + 2000, 760, 6); }
function bgJail(t, o = {}) { ctx.fillStyle = o.wall || '#8C8780'; ctx.fillRect(-2000, -2000, W + 4000, H + 4000); for (let y = 0; y < 760; y += 60) for (let x = (y / 60 % 2) * 60; x < W; x += 120) { rrect(x, y, 116, 56, 4); shape(shade(o.wall || '#8C8780', ((x * 13 + y) % 7) / 60 - 0.05), 'rgba(0,0,0,0.25)', 3); } ctx.fillStyle = '#5c5852'; ctx.fillRect(-2000, 760, W + 4000, 400); line(-2000, 760, W + 2000, 760, 6); }
function bars(x, y, w, h) { for (let xx = x; xx <= x + w; xx += 60) line(xx, y, xx, y + h, 14, '#2b2b2b'); line(x - 10, y, x + w + 10, y, 18, '#2b2b2b'); line(x - 10, y + h, x + w + 10, y + h, 18, '#2b2b2b'); }
function alcatraz(t) { sky('#9AA6B3', '#D7DDE2'); ctx.fillStyle = '#56707f'; ctx.fillRect(-2000, 700, W + 4000, 800); poly([[300, 720], [520, 520], [1450, 480], [1700, 720]]); shape('#6f6a5e'); rrect(620, 330, 760, 200, 4); shape('#D8D2C4'); for (let i = 0; i < 12; i++) { rrect(650 + i * 60, 370, 26, 40, 2); shape('#3a3a3a', null); rrect(650 + i * 60, 440, 26, 40, 2); shape('#3a3a3a', null); } rrect(1250, 170, 50, 180, 4); shape('#E9E3D6'); rrect(1238, 150, 74, 30, 4); shape('#3a3a3a'); for (let k = 0; k < 2; k++) { ctx.fillStyle = `rgba(230,235,240,${0.35 + 0.1 * k})`; ctx.fillRect(-2000, 560 + k * 90 + Math.sin(t + k) * 10, W + 4000, 60); } for (let i = 0; i < 10; i++) { const x = ((i * 220 - t * 40) % (W + 200) + W + 200) % (W + 200) - 100; ctx.beginPath(); ctx.arc(x, 820 + (i % 3) * 70, 34, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 5; ctx.stroke(); } }

// ---------------------------------------------------------------- UI overlays
function tag(txt, x, y, tl, t0, o = {}) {
  const k = pop(tl, t0, 0.3); if (k <= 0) return; const out = o.out !== undefined ? 1 - ss(o.out, o.out + 0.25, tl) : 1; if (out <= 0) return;
  ctx.save(); ctx.globalAlpha = out; ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(k, k);
  const size = o.size || 54; ctx.font = FONT(900, size); const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.55;
  rrect(-w / 2 + 6, -h / 2 + 8, w, h, 16); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
  rrect(-w / 2, -h / 2, w, h, 16); shape(o.bg || '#FFF4DC', INK, 6); text(txt, 0, 2, size, o.col || INK, 900, 'center', null);
  ctx.restore();
}
function bigText(txt, x, y, size, col, tl, t0, o = {}) { const k = pop(tl, t0, 0.32); if (k <= 0) return; withT(x, y, o.rot || 0, k, () => text(txt, 0, 0, size, col, 900, 'center', INK, Math.max(10, size * 0.14))); }
function titleCard(txt, tl, t0, d = 1.25, col = '#C8312B') {
  const k = tl - t0; if (k < 0 || k > d) return;
  const inn = easeOut(k / 0.25), out = 1 - ss(d - 0.25, d, k);
  ctx.save(); ctx.globalAlpha = out; ctx.fillStyle = col; ctx.fillRect(0, H / 2 - 150 * inn, W, 300 * inn);
  line(0, H / 2 - 150 * inn, W, H / 2 - 150 * inn, 8); line(0, H / 2 + 150 * inn, W, H / 2 + 150 * inn, 8);
  withT(W / 2 + (1 - inn) * -300, H / 2, -0.02, 1, () => text(txt, 0, 0, 130, '#FFF4DC', 900, 'center', INK, 16));
  ctx.restore();
}
function ribbon(txt, tl, t0) { const k = easeOut((tl - t0) / 0.4); if (k <= 0) return; ctx.save(); ctx.translate(-420 * (1 - k), 0); poly([[0, 60], [520, 60], [470, 120], [520, 180], [0, 180]]); shape('#C8312B', INK, 6); text(txt, 250, 120, 54, '#FFF4DC', 900, 'center', INK, 8); ctx.restore(); }
function watermark() { ctx.save(); ctx.globalAlpha = 0.8; circle(W - 78, H - 74, 44); shape('#0f2560', '#fff', 4); withT(W - 80, H - 72, 0, 0.55, () => { const k = 0.866, s = 34; poly([[0, -s], [k * s, -0.5 * s], [0, 0], [-k * s, -0.5 * s]]); shape('#FFE27A', null); poly([[-k * s, -0.5 * s], [0, 0], [0, s], [-k * s, 0.5 * s]]); shape('#FF8A3D', null); poly([[0, 0], [k * s, -0.5 * s], [k * s, 0.5 * s], [0, s]]); shape('#E8343A', null); text('S', 18, 14, 30, '#fff', 900, 'center', null); }); ctx.restore(); }
