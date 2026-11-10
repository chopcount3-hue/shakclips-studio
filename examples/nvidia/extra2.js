// Cast + props for "How an Alleged Chinese Spy Got Close to Nvidia's CEO". Real people = neutral stick figures with name tags.
// Alice Huang is drawn only as a silhouette with a question mark (no face, no likeness).
Object.assign(CAST, {
  jensen: { suit: '#1c1c20', tee: '#0e0e10', tie: '#0e0e10', hat: null, hair: 'side', hairCol: '#D4D4D8', glasses: true, skin: '#EAC39E', body: 'thin' },
  alice: { dress: '#23232d', hat: null, hair: 'bun', hairCol: '#0d0d12', skin: '#33333f', body: 'dress' },
  spoke: { suit: '#3a4a3a', tie: '#76B900', hat: null, hair: 'side', hairCol: '#5a3a22', skin: '#EBC4A0', body: 'thin' },
  guo: { suit: '#262a36', tie: '#8a2a2a', hat: null, hair: 'side', hairCol: '#141414', skin: '#EFCDA8', body: 'thin' },
  rep1: { suit: '#2c3550', tie: '#C8312B', hat: null, hair: 'side', hairCol: '#8a8a8a', skin: '#F2D0B2', body: 'round' },
  rep2: { dress: '#7a2a32', hat: null, hair: 'bun', hairCol: '#c9a46a', skin: '#F3D5B8', body: 'dress', lips: true },
  dir1: { suit: '#3a3f4a', tie: '#2F6FD6', hat: null, hair: 'side', hairCol: '#b0b0b0', skin: '#EFCCAA', body: 'thin' },
  dir2: { dress: '#4a3a5a', hat: null, hair: 'bun', hairCol: '#3a2a1a', skin: '#C88E68', body: 'dress', lips: true },
  dir3: { suit: '#4a4036', tie: '#d7d7d7', hat: null, hair: 'bald', skin: '#E2B996', body: 'round', glasses: true },
  trader: { suit: '#2c3e64', tie: '#e8c34a', hat: null, hair: 'side', hairCol: '#3a2a1a', skin: '#F0CFB0', body: 'thin' },
  trader2: { suit: '#5a2c2c', tie: '#fff', hat: null, hair: 'slick', hairCol: '#222', skin: '#D9AE87', body: 'thin', glasses: true },
});
const NV = '#76B900', SPY = '#C8312B';
// silhouette figure (Alice Huang): dark figure, glowing rim, question mark over the face
function shadowFig(x, y, s, t, o = {}) {
  ctx.save(); ctx.shadowColor = o.glow || 'rgba(255,70,60,0.85)'; ctx.shadowBlur = 40; person('alice', { x, y, s, t, face: 'neutral', pose: o.pose || POSES.idle(t), flip: o.flip }); ctx.restore();
  person('alice', { x, y, s, t, face: 'neutral', pose: o.pose || POSES.idle(t), flip: o.flip });
  const hy = y - (292 + 74) * s; ellipse(x, hy, 66 * s, 66 * s); shape('#23232d', INK, 6 * s);
  text('?', x, hy + 6 * s, 96 * s, '#ff5a4a', 900, 'center', INK, 8 * s);
}
function chip(x, y, s, t = 0) {
  withT(x, y, 0, s, () => {
    rrect(-170, -170, 340, 340, 20); shape('#2E6B3A'); for (let i = -6; i <= 6; i++) { for (const sd of [-1, 1]) { rrect(i * 24 - 6, sd * 170 - (sd > 0 ? 0 : 22), 12, 22, 2); shape('#E2B84A', INK, 2.5); rrect(sd * 170 - (sd > 0 ? 0 : 22), i * 24 - 6, 22, 12, 2); shape('#E2B84A', INK, 2.5); } }
    for (let k = 0; k < 6; k++) line(-150, -120 + k * 48, -110, -120 + k * 48, 4, 'rgba(255,255,255,0.35)');
    rrect(-95, -95, 190, 190, 14); shape('#1d1d22'); ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 4); rrect(-95, -95, 190, 190, 14); shape(null, NV, 6); ctx.restore();
    text('AI', 0, 4, 84, NV, 900, 'center', null);
  });
}
function phoneMsg(x, y, s, head, lines, tl, t0, o = {}) {
  const k = pop(tl, t0, 0.35); if (k <= 0) return;
  withT(x, y, o.rot || 0, s * k, () => {
    rrect(-230, -420, 460, 840, 50); shape('#18181c'); rrect(-205, -370, 410, 720, 20); shape('#F7F7F2', INK, 4); rrect(-50, -400, 100, 14, 7); shape('#333', null);
    rrect(-205, -370, 410, 90, 20); shape(o.headCol || '#2b3550', null); text(head, 0, -325, 34, '#fff', 900, 'center', null);
    const n = o.reveal === undefined ? lines.length : Math.floor(o.reveal);
    lines.slice(0, n).forEach((l, i) => { rrect(-180, -250 + i * 120, 360, 96, 18); shape('#E6ECF7', INK, 3); text(l, 0, -202 + i * 120, 30, INK, 800, 'center', null); });
  });
}
function stockChart(x, y, w, h, pts, tl, t0, o = {}) {   // pts: values 0..1 (1 = top); draws progressively
  rrect(x - 30, y - h - 70, w + 60, h + 130, 18); shape(o.bg || '#141923', INK, 6);
  for (let k = 0; k <= 4; k++) line(x, y - h * k / 4, x + w, y - h * k / 4, 2, 'rgba(255,255,255,0.12)');
  const prog = clamp((tl - t0) / (o.dur || 2.2), 0, 1), n = pts.length, upto = prog * (n - 1);
  ctx.beginPath(); for (let i = 0; i <= Math.floor(upto); i++) { const px = x + w * i / (n - 1), py = y - h * pts[i]; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  const fi = Math.floor(upto), fr = upto - fi; let ex = x, ey = y - h * pts[0];
  if (fi < n - 1) { ex = x + w * (fi + fr) / (n - 1); ey = y - h * lerp(pts[fi], pts[fi + 1], fr); ctx.lineTo(ex, ey); } else { ex = x + w; ey = y - h * pts[n - 1]; }
  ctx.strokeStyle = o.col || '#ff4a3d'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.stroke();
  circle(ex, ey, 12); shape(o.col || '#ff4a3d', '#fff', 4);
  if (o.label) text(o.label, x + 10, y - h - 30, 44, '#fff', 900, 'left', null);
  if (o.value && prog >= 1) text(o.value, x + w - 10, y - h - 30, 50, o.col || '#ff4a3d', 900, 'right', null);
}
function tickerTile(x, y, name, val, up, tl, t0) {
  const k = pop(tl, t0, 0.3); if (k <= 0) return;
  withT(x, y, 0, k, () => { rrect(-210, -110, 420, 220, 20); shape('#141923', INK, 6); text(name, 0, -45, 50, '#fff', 900, 'center', null); text((up ? '▲ ' : '▼ ') + val, 0, 40, 64, up ? '#3ddc84' : '#ff4a3d', 900, 'center', null); });
}
function memo(x, y, s, tl, t0, o = {}) {
  withT(x, y, o.rot || -0.04, s, () => {
    rrect(-230, -300, 460, 600, 10); shape('#F4EEDC'); text(o.head || 'MEMO', 0, -240, 34, INK, 900, 'center', null); line(-180, -200, 180, -200, 4);
    for (let k = 0; k < 9; k++) { const w = k % 3 === 2 ? 220 : 340; rrect(-170, -160 + k * 46, w, 16, 6); shape(k === 4 || k === 5 ? '#111' : '#cfc6b0', null); }
  });
  stamp(x + 20 * s, y + 160 * s, s * 1.0, o.stamp || 'CLASSIFIED', SPY, -0.18, tl, t0);
}
function photo(x, y, s, rot, tl, t0) {   // polaroid: Jensen + a silhouette, no faces of real people
  const k = pop(tl, t0, 0.3); if (k <= 0) return;
  withT(x, y, rot, s * k, () => {
    rrect(-200, -220, 400, 460, 10); shape('#fff'); rrect(-170, -190, 340, 330, 4); shape('#3a3030', INK, 4);
    ctx.save(); rrect(-170, -190, 340, 330, 4); ctx.clip();
    ctx.fillStyle = 'rgba(255,190,120,0.25)'; ctx.fillRect(-170, -190, 340, 330);
    withT(0, 0, 0, 1, () => { person('jensen', { x: 60, y: 260, s: 0.62, face: 'smile', t: 0 }); shadowFig(-70, 260, 0.62, 0, {}); });
    ctx.restore();
  });
}
function magnifier(x, y, s, rot = 0.5) { withT(x, y, rot, s, () => { rrect(-16, 70, 32, 150, 12); shape('#6B4226'); circle(0, 0, 80); shape('rgba(200,230,255,0.35)', INK, 14); ctx.beginPath(); ctx.arc(-18, -18, 46, Math.PI * 1.1, Math.PI * 1.5); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 8; ctx.stroke(); }); }
function spotlight(x, y, r) { ctx.save(); const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(5,5,12,0.82)'); ctx.fillStyle = g; ctx.fillRect(-2000, -2000, W + 4000, H + 4000); ctx.restore(); }
function bgSpy(t) { bgPlain('#1a1d2b', '#07080d'); for (let i = 0; i < 9; i++) line(-200 + i * 260, 0, -40 + i * 260, H, 60, 'rgba(255,255,255,0.025)'); }
function bgTrading(t) { bgPlain('#141a28', '#090c14'); for (let i = 0; i < 7; i++) { rrect(80 + i * 260, 90, 220, 130, 10); shape('#0c1018', '#2a3550', 4); const up = (i * 7) % 3 !== 0; text(up ? '▲' : '▼', 190 + i * 260, 155, 60, up ? '#3ddc84' : '#ff4a3d', 900, 'center', null); } }
function mapAsia(tl, o = {}) {
  bgPlain('#9CC9E6', '#6FA8D4');
  ctx.fillStyle = '#E8D9A8'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(300, -40); ctx.bezierCurveTo(900, -60, 1500, -40, 1640, 160); ctx.bezierCurveTo(1560, 330, 1330, 380, 1240, 470); ctx.bezierCurveTo(1150, 600, 1060, 640, 980, 600); ctx.bezierCurveTo(880, 560, 760, 700, 720, 820); ctx.bezierCurveTo(690, 900, 640, 900, 610, 820); ctx.bezierCurveTo(560, 680, 420, 520, 300, 420); ctx.closePath(); ctx.fill(); ctx.stroke();
  ellipse(1395, 560, 34, 70, 0.3); shape('#E8D9A8');   // Taiwan
  ellipse(735, 900, 22, 14); shape('#E8D9A8');            // Singapore
  const pin = (x, y, lab, t0, col) => { const k = pop(tl, t0, 0.3); if (k <= 0) return; withT(x, y, 0, k, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-34, -40, -30, -80, 0, -80); ctx.bezierCurveTo(30, -80, 34, -40, 0, 0); shape(col || SPY); circle(0, -52, 12); shape('#fff', null); }); tag(lab, x, y + 50, tl, t0 + 0.1, { size: 40 }); };
  (o.pins || []).forEach(p => pin(...p));
  if (o.route) { const [a, b, t0] = o.route, k = clamp((tl - t0) / 1.2, 0, 1); if (k > 0) { ctx.save(); ctx.setLineDash([22, 16]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); const mx = (a[0] + b[0]) / 2 + 160, my = (a[1] + b[1]) / 2; ctx.quadraticCurveTo(mx, my, lerp(a[0], b[0], k), lerp(a[1], b[1], k)); ctx.strokeStyle = SPY; ctx.lineWidth = 9; ctx.stroke(); ctx.restore(); } }
}
function dataCenter(x, y, s, t) { withT(x, y, 0, s, () => { for (let i = -2; i <= 2; i++) { rrect(i * 170 - 70, -420, 140, 420, 10); shape('#2a2f3a'); for (let k = 0; k < 8; k++) { rrect(i * 170 - 52, -400 + k * 50, 104, 34, 5); shape('#1b1f27', INK, 3); circle(i * 170 + 34, -383 + k * 50, 6); shape(((k + i + Math.floor(t * 3)) % 3) ? NV : '#ffcf3a', null); } } }); }
function boardTable(t, faces) {
  bgOffice(t, { wall: '#3b3a48' }); rrect(260, 760, 1400, 60, 14); shape('#5E3B23');
  [['dir1', 520], ['dir2', 820], ['dir3', 1110], ['dir1', 1400]].forEach(([id, x], i) => person(id, { x, y: 900, s: 0.95, face: (faces && faces[i]) || 'neutral', t: t + i, pose: POSES.hold(), flip: x > 960 }));
  rrect(260, 780, 1400, 200, 14); shape('#6B4226');
}
