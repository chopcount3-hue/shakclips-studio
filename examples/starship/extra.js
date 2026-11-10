// Extra cast + props for the 2026 midterms explainer. Real people are drawn as neutral stick figures with name tags (no likenesses).
Object.assign(CAST, {
  elsayed: { suit: '#2B3F66', tie: '#2B3F66', hat: null, hair: 'side', hairCol: '#1d1715', beard: true, skin: '#D9A77E', body: 'thin' },
  trump: { suit: '#1f2a4a', tie: '#C8312B', hat: null, hair: 'side', hairCol: '#E2B860', skin: '#F0C49A', body: 'round' },
  vance: { suit: '#27324f', tie: '#3b6fc4', hat: null, hair: 'side', hairCol: '#4a3426', beard: true, skin: '#F1CDAA', body: 'thin' },
  cruz: { suit: '#2d2d33', tie: '#9b2d2d', hat: null, hair: 'slick', hairCol: '#2c2c2c', beard: true, skin: '#EDC6A0', body: 'thin' },
  rogers: { suit: '#5b6270', tie: '#C8312B', hat: null, hair: 'side', hairCol: '#c9c9c9', skin: '#F2D0B2', body: 'thin' },
  stevens: { dress: '#3b6fc4', hat: null, hair: 'bun', hairCol: '#E2C27A', skin: '#F3D5B8', body: 'dress', lips: true },
  musk: { suit: '#202024', tie: '#202024', hat: null, hair: 'side', hairCol: '#3a2a20', skin: '#F0CDAE', body: 'thin' },
  obama: { suit: '#2e2e36', tie: '#5a7fc4', hat: null, hair: 'bald', skin: '#8D5A3B', body: 'thin' },
  staffer: { suit: '#3a4256', tie: '#7a5fc4', hat: null, hair: 'side', hairCol: '#6b4a2a', skin: '#EBC4A0', body: 'thin' },
  kid: { suit: '#E58A3A', tie: '#E58A3A', hat: null, hair: 'side', hairCol: '#1d1715', skin: '#D9A77E', body: 'thin' },
  voterB: { suit: '#3b6fc4', tie: '#fff', hat: 'cap', hatCol: '#3b6fc4', hairCol: '#333', skin: '#E7C2A0', body: 'thin' },
  voterR: { suit: '#C8312B', tie: '#fff', hat: 'cap', hatCol: '#C8312B', hairCol: '#333', skin: '#F0CFB0', body: 'thin' },
  voterG: { suit: '#6E8B5A', tie: '#e8e1cf', hat: null, hair: 'bun', hairCol: '#4a3426', skin: '#C88E68', body: 'dress', dress: '#6E8B5A', lips: true },
});
const BLUE = '#2F6FD6', RED = '#D63A32', GOLD = '#F2C230';
function capitol(x, y, s, col = '#F4EEDC') {
  withT(x, y, 0, s, () => {
    rrect(-420, -150, 840, 150, 4); shape(col); for (let i = -6; i <= 6; i++) { rrect(i * 60 - 9, -140, 18, 130, 3); shape('#e6dcc4', INK, 3); }
    rrect(-170, -230, 340, 80, 4); shape(col); for (let i = -2; i <= 2; i++) { rrect(i * 60 - 9, -222, 18, 64, 3); shape('#e6dcc4', INK, 3); }
    ctx.beginPath(); ctx.ellipse(0, -232, 150, 170, 0, Math.PI, 0); shape(col); for (let i = -3; i <= 3; i++) line(i * 38, -232, i * 30, -380 + Math.abs(i) * 8, 3, '#cdbf9f');
    rrect(-24, -440, 48, 60, 6); shape(col); circle(0, -452, 14); shape(col); rrect(-60, -10, 120, 10, 2); shape('#cdbf9f', INK, 3);
  });
}
function hemicycle(x, y, r0, nb, nr, ng, tl, t0 = 0, dur = 1.6) {
  // 100 seats in 5 rows, filled left (blue) -> right (red), grey in the middle at the end
  const rows = [14, 17, 20, 23, 26]; const seats = [];
  rows.forEach((n, ri) => { for (let k = 0; k < n; k++) { const a = Math.PI - k / (n - 1) * Math.PI; seats.push([a, r0 + ri * 46]); } });
  seats.sort((p, q) => q[0] - p[0]);
  const shown = Math.floor(100 * clamp((tl - t0) / dur, 0, 1));
  seats.forEach(([a, r], i) => { const col = i >= shown ? '#d8d2c4' : i < nb ? BLUE : i < nb + ng ? '#9a9a9a' : RED; circle(x + Math.cos(a) * r, y - Math.sin(a) * r, 17); shape(col, INK, 3.5); });
}
function barChart(x, y, w, h, vals, cols, labels, tl, t0, maxV, vlab) {
  vals.forEach((v, i) => { const k = easeOut((tl - t0 - i * 0.25) / 0.9); const bh = h * v / maxV * k; rrect(x + i * (w + 60), y - bh, w, bh, 8); shape(cols[i]); text(labels[i], x + i * (w + 60) + w / 2, y + 48, 40, INK, 900, 'center', null); if (k > 0.95 && (!vlab || vlab[i] !== null)) text(vlab ? vlab[i] : String(Math.round(v)), x + i * (w + 60) + w / 2, y - bh - 40, 56, cols[i], 900, 'center', INK, 8); });
}
function quoteCard(q, who, x, y, tl, t0, o = {}) {
  const k = pop(tl, t0, 0.35); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.015); ctx.scale(k, k);
  ctx.font = FONT(900, o.size || 60); const lines = q.split('\n'); const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 140, h = lines.length * (o.size || 60) * 1.25 + 150;
  rrect(-w / 2 + 10, -h / 2 + 14, w, h, 26); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  rrect(-w / 2, -h / 2, w, h, 26); shape(o.bg || '#FFFDF6', INK, 7);
  text('“', -w / 2 + 50, -h / 2 + 48, 120, o.accent || BLUE, 900, 'center', null);
  lines.forEach((l, i) => text(l, 0, -h / 2 + 70 + i * (o.size || 60) * 1.25 + (o.size || 60) * 0.5, o.size || 60, INK, 900, 'center', null));
  rrect(-w / 2 + 40, h / 2 - 64, w - 80, 4, 2); ctx.fillStyle = '#ddd'; ctx.fill();
  text('— ' + who, 0, h / 2 - 32, 34, o.accent || BLUE, 800, 'center', null);
  ctx.restore();
}
function postCard(handle, body, x, y, tl, t0, o = {}) {   // generic social post (no platform branding)
  const k = pop(tl, t0, 0.35); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0.012); ctx.scale(k, k);
  const lines = body.split('\n'); ctx.font = FONT(800, 54); const w = Math.max(700, ...lines.map(l => ctx.measureText(l).width + 120)), h = 200 + lines.length * 70;
  rrect(-w / 2 + 10, -h / 2 + 14, w, h, 24); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  rrect(-w / 2, -h / 2, w, h, 24); shape('#ffffff', INK, 6);
  circle(-w / 2 + 75, -h / 2 + 75, 38); shape(o.avatar || '#9aa', INK, 4); text(handle, -w / 2 + 130, -h / 2 + 62, 40, INK, 900, 'left', null); text('posted', -w / 2 + 130, -h / 2 + 102, 28, '#888', 700, 'left', null);
  lines.forEach((l, i) => text(l, -w / 2 + 60, -h / 2 + 175 + i * 70, 54, INK, 800, 'left', null));
  ctx.restore();
}
function nameTag(txt, x, y, tl, t0, col = INK) { tag(txt, x, y, tl, t0, { size: 44, bg: '#fff', col }); }
function takeoutBag(x, y, s) { withT(x, y, 0, s, () => { poly([[-130, -160], [130, -160], [150, 160], [-150, 160]]); shape('#C8A27A'); ctx.beginPath(); ctx.arc(0, -160, 70, Math.PI, 0); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.stroke(); withT(0, 20, 0, 1, () => { poly([[-80, 50], [80, 50], [60, -60]]); shape('#FFF2C8', INK, 6); rrect(-80, 30, 160, 26, 6); shape('#D9A35E', INK, 5); ellipse(40, -40, 22, 14); shape('#C8312B', INK, 4); }); text('TAKEOUT', 0, 120, 40, '#5a3a1a', 900, 'center', null); }); }
function whiteHouse(x, y, s) { withT(x, y, 0, s, () => { rrect(-460, -230, 920, 230, 4); shape('#F7F5EF'); for (let i = 0; i < 9; i++) { rrect(-420 + i * 100, -190, 50, 70, 4); shape('#9CC3CF', INK, 4); } poly([[-160, -230], [160, -230], [0, -330]]); shape('#F7F5EF'); for (let i = -2; i <= 2; i++) { rrect(i * 60 - 10, -230, 20, 230, 3); shape('#ece8dc', INK, 3); } rrect(-30, -80, 60, 80, 6); shape('#7a5a3a'); line(0, -330, 0, -420, 6); poly([[0, -420], [80, -400], [0, -380]]); shape(RED, INK, 4); }); }
function gasPump(x, y, s, price) { withT(x, y, 0, s, () => { rrect(-110, -320, 220, 320, 16); shape(RED); rrect(-80, -290, 160, 110, 10); shape('#1d1a1a', INK, 5); text(price, 0, -235, 54, '#7CF29A', 900, 'center', null); rrect(-60, -150, 120, 90, 8); shape('#fff', INK, 5); text('GAS', 0, -105, 40, RED, 900, 'center', null); ctx.beginPath(); ctx.moveTo(110, -200); ctx.quadraticCurveTo(200, -150, 170, -40); ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.stroke(); rrect(150, -60, 44, 70, 8); shape('#333'); }); }
function crate(x, y, s, label) { withT(x, y, 0, s, () => { rrect(-150, -150, 300, 150, 6); shape('#B98A55'); line(-150, -150, 150, 0, 6, '#8a6238'); line(150, -150, -150, 0, 6, '#8a6238'); rrect(-120, -110, 240, 70, 8); shape('#fff', INK, 5); text(label, 0, -75, 44, RED, 900, 'center', null); }); }
function rocket(x, y, s, t) { withT(x, y, -0.5, s, () => { for (let k = 0; k < 4; k++) { const ph = (t * 3 + k / 4) % 1; circle(0, 200 + ph * 200, 40 + ph * 50); shape(`rgba(255,${160 + ph * 80 | 0},60,${0.8 * (1 - ph)})`, null); } ctx.beginPath(); ctx.moveTo(0, -260); ctx.quadraticCurveTo(110, -120, 80, 160); ctx.lineTo(-80, 160); ctx.quadraticCurveTo(-110, -120, 0, -260); shape('#EDEDED'); circle(0, -70, 40); shape('#5DA9E9', INK, 6); poly([[-80, 80], [-150, 190], [-80, 160]]); shape(RED); poly([[80, 80], [150, 190], [80, 160]]); shape(RED); }); }
function server(x, y, s) { withT(x, y, 0, s, () => { rrect(-90, -200, 180, 200, 10); shape('#3a4256'); for (let i = 0; i < 4; i++) { rrect(-70, -185 + i * 46, 140, 34, 6); shape('#2a3040', INK, 3); circle(50, -168 + i * 46, 6); shape(i % 2 ? '#7CF29A' : '#5DA9E9', null); } }); }
function podium(x, y, s, label) { withT(x, y, 0, s, () => { poly([[-150, -260], [150, -260], [120, 0], [-120, 0]]); shape('#2B3F66'); rrect(-170, -290, 340, 40, 8); shape('#24365a'); text(label, 0, -150, 44, '#fff', 900, 'center', null); line(40, -290, 70, -380, 6); circle(74, -392, 16); shape('#333'); }); }
function confetti(tl, n = 60, seed = 3) { const r = rnd(seed); for (let i = 0; i < n; i++) { const x = r() * W, sp = 200 + r() * 300, y = ((r() * H + tl * sp) % (H + 100)) - 50; withT(x + Math.sin(tl * 3 + i) * 30, y, tl * 4 + i, 1, () => { rrect(-9, -5, 18, 10, 2); ctx.fillStyle = [BLUE, GOLD, '#fff', '#7CF29A', RED][i % 5]; ctx.fill(); }); } }
function ballotBox(x, y, s) { withT(x, y, 0, s, () => { rrect(-160, -200, 320, 200, 10); shape('#F4EEDC'); rrect(-90, -210, 180, 16, 6); shape(INK, null); text('VOTE', 0, -100, 70, BLUE, 900, 'center', null); withT(0, -230, 0.1, 1, () => { rrect(-60, -70, 120, 90, 4); shape('#fff', INK, 5); line(-30, -30, -10, -5, 6, BLUE); line(-10, -5, 30, -50, 6, BLUE); }); }); }
function college(x, y, s, name, col) { withT(x, y, 0, s, () => { rrect(-200, -200, 400, 200, 4); shape(col || '#E9DCC0'); poly([[-230, -200], [230, -200], [0, -300]]); shape(col || '#E9DCC0'); for (let i = -3; i <= 3; i++) { rrect(i * 55 - 10, -190, 20, 180, 3); shape('#fff8', INK, 3); } }); tag(name, x, y + 60 * s + 10, 99, 0, { size: 40 }); }
function microscope(x, y, s) { withT(x, y, 0, s, () => { rrect(-100, -20, 200, 30, 8); shape('#555'); line(-40, -20, -40, -160, 18); line(-40, -160, 40, -240, 26); line(40, -240, 70, -280, 18); rrect(-20, -100, 90, 18, 6); shape('#888'); circle(10, -120, 10); shape('#aaa', INK, 3); }); }
function gavel(x, y, s, rot) { withT(x, y, rot, s, () => { line(0, 0, 0, 200, 22, INK); line(0, 0, 0, 200, 12, '#8a5a3a'); rrect(-80, -40, 160, 80, 14); shape('#8a5a3a'); }); }
function partyCrowd(x, y, col, flip, t, n = 4, face = 'angry') { const ids = col === 'B' ? ['voterB', 'voterG', 'voterB', 'reader2'] : ['voterR', 'd1', 'voterR', 'reader']; for (let i = 0; i < n; i++) person(ids[i % ids.length], { x: x + (flip ? -1 : 1) * i * 120, y: y + (i % 2) * 14, s: 0.75, face, t: t + i * 0.3, seed: i, flip, pose: POSES.point(t + i) }); }

// ---------------- Starship double-catch props (original drawings, no logos)
Object.assign(CAST, {
  you: { suit: '#E58A3A', tie: '#E58A3A', hat: 'cap', hatCol: '#2F6FD6', hairCol: '#333', skin: '#E7C2A0', body: 'thin' },
  eng1: { suit: '#4a5568', tie: '#4a5568', hat: null, hair: 'side', hairCol: '#3a2a1a', glasses: true, skin: '#F0CFB0', body: 'thin' },
  eng2: { dress: '#5B7DB1', hat: null, hair: 'bun', hairCol: '#2a1d15', skin: '#C88E68', body: 'dress', lips: true },
  eng3: { suit: '#2f4f4f', tie: '#2f4f4f', hat: 'cap', hatCol: '#222', hairCol: '#222', skin: '#8D5A3B', body: 'round' },
});
const STEEL = '#D9DEE4', STEEL2 = '#AEB6C0', SOOT = '#2a2a2e';
function steelGrad(w) { const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#9aa3ad'); g.addColorStop(0.35, '#F4F6F8'); g.addColorStop(0.7, '#C7CDD4'); g.addColorStop(1, '#8a929c'); return g; }
function flame(x, y, s, t, len = 1) { withT(x, y, 0, s, () => { const f = 1 + 0.12 * Math.sin(t * 40) + 0.08 * Math.sin(t * 23); ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-40, 120 * len * f, 0, 260 * len * f); ctx.quadraticCurveTo(40, 120 * len * f, 34, 0); ctx.closePath(); shape('#FF9A2E', INK, 5); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-20, 70 * len * f, 0, 150 * len * f); ctx.quadraticCurveTo(20, 70 * len * f, 18, 0); ctx.closePath(); shape('#FFE58A', null); }); }
// booster: origin bottom-centre, 72 wide x 560 tall at s=1
function booster(x, y, s, rot = 0, o = {}) { withT(x, y, rot, s, () => {
  if (o.fire) flame(0, 10, 1.25, o.t || 0, o.fire);
  rrect(-36, -560, 72, 560, 6); ctx.fillStyle = steelGrad(72); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  for (let i = 1; i < 7; i++) line(-36, -i * 80, 36, -i * 80, 2.5, 'rgba(0,0,0,0.25)');
  rrect(-36, -120, 72, 120, 6); ctx.fillStyle = 'rgba(40,40,46,0.35)'; ctx.fill();
  // grid fins
  [-1, 1].forEach(sd => { rrect(sd > 0 ? 36 : -66, -540, 30, 46, 3); shape('#6b727b', INK, 4); for (let k = 1; k < 3; k++) line(sd > 0 ? 36 + k * 10 : -66 + k * 10, -540, sd > 0 ? 36 + k * 10 : -66 + k * 10, -494, 2, INK); });
  rrect(-40, -575, 80, 16, 4); shape('#5a6068', INK, 4); // hot-stage ring
  for (let i = -2; i <= 2; i++) { rrect(i * 13 - 5, -2, 10, 12, 2); shape(SOOT, null); }
  if (o.label) text(o.label, 0, -300, 30, INK, 900, 'center', null);
}); }
// ship: origin bottom-centre, 72 wide x 420 tall at s=1
function ship(x, y, s, rot = 0, o = {}) { withT(x, y, rot, s, () => {
  if (o.fire) flame(0, 10, 1.0, o.t || 0, o.fire);
  ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(-36, -300); ctx.quadraticCurveTo(-36, -400, 0, -420); ctx.quadraticCurveTo(36, -400, 36, -300); ctx.lineTo(36, 0); ctx.closePath(); ctx.fillStyle = steelGrad(72); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  // heat shield (black tiles) on the windward side
  ctx.save(); ctx.clip(); ctx.fillStyle = SOOT; ctx.fillRect(-36, -430, 30, 440); for (let yy = -420; yy < 0; yy += 18) line(-36, yy, -6, yy, 1.5, '#444'); ctx.restore();
  // flaps
  poly([[-36, -330], [-62, -300], [-62, -270], [-36, -270]]); shape('#5a6068', INK, 4); poly([[36, -330], [62, -300], [62, -270], [36, -270]]); shape('#5a6068', INK, 4);
  poly([[-36, -70], [-70, -40], [-70, 0], [-36, 0]]); shape('#5a6068', INK, 4); poly([[36, -70], [70, -40], [70, 0], [36, 0]]); shape('#5a6068', INK, 4);
  if (o.glow) { ctx.save(); ctx.globalAlpha = o.glow; ctx.beginPath(); ctx.ellipse(-60, -210, 70, 250, 0, 0, Math.PI * 2); const g = ctx.createRadialGradient(-60, -210, 10, -60, -210, 250); g.addColorStop(0, '#FFE58A'); g.addColorStop(0.5, '#FF7A2E'); g.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); }
}); }
function stackRocket(x, y, s, o = {}) { booster(x, y, s, 0, o); ship(x, y - 575 * s, s, 0, {}); }
// launch & catch tower: origin ground-centre of tower; arms at height armY (from ground), open k (0 closed .. 1 open)
function tower(x, y, s, o = {}) { const armY = o.armY !== undefined ? o.armY : 520, open = o.open !== undefined ? o.open : 1, side = o.side || 1; withT(x, y, 0, s, () => {
  rrect(-55, -760, 110, 760, 2); shape('#4b5059', INK, 6);
  for (let yy = -760; yy < 0; yy += 60) { line(-55, yy, 55, yy + 60, 3, '#9aa0a8'); line(55, yy, -55, yy + 60, 3, '#9aa0a8'); }
  rrect(-70, -790, 140, 34, 4); shape('#3a3e45', INK, 5);
  // arms (chopsticks): pivot at tower right face
  ctx.save(); ctx.translate(55 * side, -armY); ctx.scale(side, 1);
  [-1, 1].forEach(k => { ctx.save(); ctx.rotate(k * (0.06 + 0.42 * open) * -1); rrect(0, -14 + k * 22, 330, 28, 6); shape('#E2C23A', INK, 5); for (let i = 40; i < 320; i += 50) line(i, -14 + k * 22, i + 25, 14 + k * 22, 2.5, '#9b7d12'); ctx.restore(); });
  ctx.restore();
  if (o.label) text(o.label, 0, -830, 34, '#fff', 900, 'center', INK, 8);
}); }
function bgSpace(t, o = {}) { sky(o.top || '#050a1c', o.bot || '#14204a'); const r = rnd(7); for (let i = 0; i < 110; i++) { const x = r() * W, y = r() * H, k = 0.5 + 0.5 * Math.sin(t * 2 + i); circle(x, y, 1 + r() * 2.2); shape(`rgba(255,255,255,${0.35 + 0.6 * k})`, null); } }
function earth(x, y, r, t) { circle(x, y, r); const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#5fb0ff'); g.addColorStop(1, '#1d4fa8'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); circle(x, y, r); ctx.clip(); const r2 = rnd(3); for (let i = 0; i < 7; i++) { const cx = x + ((r2() * 2 - 1) * r + t * 30) % r, cy = y + (r2() * 2 - 1) * r * 0.8; ellipse(cx, cy, r * (0.15 + r2() * 0.25), r * (0.1 + r2() * 0.15), r2()); shape('#5DAA5A', null); } ctx.restore(); circle(x, y, r); shape(null, INK, 7);
  ctx.save(); circle(x, y, r + 14); ctx.strokeStyle = 'rgba(150,210,255,0.45)'; ctx.lineWidth = 14; ctx.stroke(); ctx.restore(); }
function sat(x, y, s, rot = 0) { withT(x, y, rot, s, () => { rrect(-120, -16, 240, 32, 4); shape('#2c4a8a', INK, 4); for (let i = -100; i < 120; i += 40) line(i, -16, i, 16, 2, '#7fa3d9'); rrect(-26, -22, 52, 44, 6); shape('#d8dde3', INK, 4); }); }
function ground(y, col = '#D9C08F') { ctx.fillStyle = col; ctx.fillRect(-2000, y, W + 4000, 800); line(-2000, y, W + 2000, y, 6); }
function bgStarbase(t, o = {}) { sky(o.top || '#7FB8E6', o.bot || '#F6E2C0'); cloud(300, 200, 1.1); cloud(1550, 150, 0.9); ctx.fillStyle = '#4A8FB8'; ctx.fillRect(-2000, 880, W + 4000, 60); ground(920, '#E3C996'); line(-2000, 880, W + 2000, 880, 4); }
function phone(x, y, s, rot = 0) { withT(x, y, rot, s, () => { rrect(-50, -95, 100, 190, 16); shape('#222', INK, 5); rrect(-40, -80, 80, 150, 8); shape('#9CC3CF', null); }); }
function chopsticks(x, y, s, open = 0.3, rot = 0) { withT(x, y, rot, s, () => { [-1, 1].forEach(k => { ctx.save(); ctx.rotate(k * open * 0.5); line(0, 0, 360, 0, 16, INK); line(0, 0, 360, 0, 10, '#C99A5B'); ctx.restore(); }); }); }
function plane(x, y, s, rot = 0) { withT(x, y, rot, s, () => { rrect(-260, -40, 520, 80, 40); shape('#F4F6F8'); poly([[-40, -20], [60, -20], [-60, -210], [-120, -210]]); shape('#cfd6de'); poly([[-40, 20], [60, 20], [-60, 210], [-120, 210]]); shape('#cfd6de'); poly([[-260, -10], [-200, -10], [-250, -130], [-290, -130]]); shape('#2F6FD6'); for (let i = -150; i < 220; i += 50) { circle(i, -8, 10); shape('#9CC3CF', INK, 3); } }); }
function wave2(y, t, col = '#3F7FA6') { ctx.beginPath(); ctx.moveTo(-200, H + 200); for (let x = -200; x <= W + 200; x += 40) ctx.lineTo(x, y + Math.sin(x / 90 + t * 3) * 14); ctx.lineTo(W + 200, H + 200); ctx.closePath(); shape(col, INK, 6); }
function wrench(x, y, s, rot = 0) { withT(x, y, rot, s, () => { line(0, 0, 0, 200, 30, INK); line(0, 0, 0, 200, 20, '#9aa3ad'); circle(0, -10, 44); shape('#9aa3ad', INK, 6); rrect(-16, -60, 32, 50, 4); shape('#F3E2C0', null); }); }
function dollarDown(x, y, s, tl) { withT(x, y, 0, s, () => { text('$$$', 0, 0, 120, '#2f9e44', 900, 'center', INK, 12); const k = easeOut(tl / 0.8); withT(170, -40 + 80 * k, 0, 1, () => { line(0, -80, 0, 60, 22, RED); poly([[-44, 50], [44, 50], [0, 110]]); shape(RED, INK, 5); }); }); }
