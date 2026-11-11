/* ============================================================================
 * scale.js — scale-comparison spectacle for the Shak Clips 2D engine
 * ----------------------------------------------------------------------------
 * Load AFTER engine/core.js and engine/acting.js. One global, `SCALE`. No
 * imports, no module system: it reads core.js's globals (ctx, W, H, INK, lerp,
 * clamp, ss, circle, ellipse, poly, rrect, line, text, withT, shade, rnd,
 * eiffel, FONT) and acting.js's `ACT` (ease, spring, stagger). It writes
 * nothing back into either.
 *
 * EVERY FRAME IS A PURE FUNCTION OF TIME. No Date.now(), no rAF, no unseeded
 * randomness, no state carried between frames. Frame N renders identically
 * whether it is reached in order or alone — engine/render.js and sheet.js
 * depend on that.
 *
 * ============================================================================
 * 1. THE WORLD IS IN METRES
 * ============================================================================
 * Objects are defined by a real size in metres. One camera number decides what
 * you see: `mpp`, metres per pixel. Nothing else. Screen size is always
 *     px = metres / mpp
 * A zoom from 1 m to 1e21 m is 21 decades, so the camera is interpolated
 * GEOMETRICALLY (linearly in log mpp). That keeps the perceived zoom rate
 * constant and keeps every intermediate value inside float range: mpp runs
 * 2.6e-3 .. 6.2e17 and pixel sizes that go below 0.05 px are simply not drawn.
 * Never lerp mpp linearly — the first 1% of the move would eat 99% of the zoom.
 *
 *   SCALE.fit(metres, frac, axis)   mpp that makes `metres` span `frac` of the
 *                                   frame on 'h' (default) or 'w'
 *   SCALE.cam(t, plan)              mpp at time t, geometric. plan is
 *                                   {t0, dur, m0, m1, frac, axis, ease} where
 *                                   m0/m1 are METRES ACROSS THE FRAME, or
 *                                   {t0, each, stops:[metres,…], hold, ease}
 *                                   for a multi-stop zoom (the ladder camera)
 *   SCALE.px(metres, mpp)           metres -> pixels
 *   SCALE.metres(px, mpp)           pixels -> metres
 *   SCALE.decade(mpp)               log10 of the metres across the frame
 *
 * The screen anchor is fixed and separate from the camera: world (0, 0) is the
 * BASE-LEFT of every object and lands at screen (SCALE.ORIGIN.x, groundY).
 * Objects grow right and up from there, so a zoom-out pins the previous rung in
 * the bottom-left corner instead of flinging it off frame.
 *
 * ============================================================================
 * 2. OBJECT LIBRARY  —  SCALE.OBJ
 * ============================================================================
 *   SCALE.OBJ[key] = { name, m, dim, box, src, art }
 *     name  display name
 *     short optional compact name, used by the side-by-side row
 *     m     the real size in metres of the dimension named by `dim`
 *     dim   'h' height | 'w' width | 'd' diameter (drawn as 'w' and 'h')
 *     box   [w, h] of the art in LOCAL units, where the principal dimension is
 *           exactly 1000 and the anchor (0,0) is base-left
 *     src   the figure and the source it was verified against
 *     art   draw into x:[0,box[0]], y:[-box[1],0]; strokes via sh() so they
 *           thin out and vanish as the object shrinks
 *   SCALE.keys()                  every key, ascending by size
 *   SCALE.get(key)                the record (throws on a bad key)
 *   SCALE.draw(key, mpp, o)       draw one object. o = {x, y, alpha, tint,
 *                                 t, seed, max}. Returns the screen box
 *                                 {x, y, w, h, px, cx, topY} for labelling,
 *                                 or null if it was too small to draw.
 *   SCALE.ratio(a, b)             how many times bigger b is than a
 *
 * ============================================================================
 * 3. THE LADDER SHOT  —  the format
 * ============================================================================
 *   SCALE.ladder(tl, rungs, o)
 *     rungs  ['human', 'bus', 'everest', 'moon', …] ascending
 *     o      { t0:0, each:1.1, hold:0.34, frac:0.62, groundY:960,
 *              beats:null, bg:true, gauge:true, bar:true, streaks:true,
 *              title:null, t:tl }
 *   `beats` is a per-rung length in seconds (same length as `rungs`) and
 *   overrides `each`. Use it to hold longer on the rung whose jump is biggest.
 *   Each rung is framed at t0 + i*each. Inside a rung: HOLD for `hold` of the
 *   beat, then zoom (ease.inOutCubic) to the next rung's framing. The previous
 *   object stays drawn and shrinks into the corner; the arriving object fades
 *   up across the middle of the zoom so it never slabs over the frame. Painted
 *   largest-first, so every earlier rung reads in front of the new one. Labels
 *   carry the current rung's real size and a "× N BIGGER" badge.
 *   Returns { i, u, g, mpp, cur, prev, boxes }.
 *
 * ============================================================================
 * 4. SIDE BY SIDE
 * ============================================================================
 *   SCALE.sideBySide(tl, keys, o)
 *     One shared mpp for the whole row, so the relative heights are true. A
 *     baseline, a staggered spring grow-in, a name and the real size under each.
 *     o = { t0:0, each:0.1, frac:0.74, baseY:900, gap:0.07, spring:'premium',
 *           title:null, scaleBar:true, ratio:['keyA','keyB'], ratioAt:1.8 }
 *     Objects are laid out in EQUAL COLUMNS, not packed by width, so a wide
 *     object can never push its neighbour's caption into it. `ratio` draws a
 *     dashed line at keyA's height across to keyB plus a "keyA x N = keyB"
 *     badge, so a five-second hold is not five seconds of the same frame.
 *
 * ============================================================================
 * 5. NUMBERS
 * ============================================================================
 *   SCALE.count(tl, o)            the eased value. o = {to, from:0, t0, dur:1.2,
 *                                 ease:'outQuint'}
 *   SCALE.fmtNum(v, dec)          '1,391,400'
 *   SCALE.fmtSize(metres)         picks m / km / AU / light-years
 *   SCALE.counter(tl, o)          big number card that lands on `to` at
 *                                 t0+dur. o adds {x, y, size, unit, label,
 *                                 col, dec}
 *   SCALE.bars(tl, rows, o)       rows = [{label, value, col, note}]. Bars grow
 *                                 with a stagger. o = {x, y, w, h, gap, t0,
 *                                 each:0.08, dur:0.9, max, log:false, unit,
 *                                 title, titleX, fmt, dec}. Use log:true for
 *                                 any set spanning more than two decades.
 *
 * ============================================================================
 * 6. LABELS THAT STAY LEGIBLE
 * ============================================================================
 * Labels are drawn in SCREEN space, never inside the scaled transform, so the
 * type size is the same whether the object is 1200 px or 2 px.
 *   var L = SCALE.labels({ minGap:92, size:38, top:74, bottom:1002, rightPad:24 });
 *   L.add({ x, y, ly, text, sub, side:'right', size, col, bg, big, alpha });
 * `top` / `bottom` / `rightPad` are the guards that keep a chip off the shot
 * title, off the badge and off the gauge.
 *   L.flush();                    resolves vertical overlap, then draws the
 *                                 leader line + dot + chip for each label
 * One pass, sorted by y, pushing collisions apart — deterministic, so the same
 * t always produces the same layout.
 *
 * ============================================================================
 * 7. FURNITURE
 * ============================================================================
 *   SCALE.backdrop(mpp, t)        ground+sky -> space, crossfaded in log(mpp)
 *   SCALE.ground(mpp, y)          the ground line, fading out past ~1 km/px
 *   SCALE.gauge(mpp, o)           vertical log ruler, 1 m to 1e21 m, with a
 *                                 marker where the camera is
 *   SCALE.scaleBar(mpp, o)        '1 km' bar, sized to a round world length
 *   SCALE.streaks(cx, cy, k, t)   radial speed lines; k is how fast the camera
 *                                 is moving (the ladder drives this itself)
 *   SCALE.badge(txt, x, y, a, s)  the red escalation chip
 *   SCALE.sh(fill, stroke, k)     fill + a stroke that thins with the zoom
 *
 * Minimal use:
 *   SCALE.ladder(tl, ['human','bus','everest','earth','sun'], { each: 2.0 });
 * ========================================================================== */
(function (root) {
  // one shared light direction for every body in a ladder, or the row reads as a collage
  function SCALE_LIGHT() { return (typeof COS !== 'undefined' && COS.light) ? COS.light(-32, 12) : null; }
  'use strict';

  // ------------------------------------------------------------------ guards
  function need() {
    if (typeof ctx === 'undefined' || typeof circle !== 'function') throw new Error('scale.js: load engine/core.js first');
    if (typeof ACT === 'undefined') throw new Error('scale.js: load engine/acting.js before scale.js');
  }
  var FW = typeof W === 'number' ? W : 1920, FH = typeof H === 'number' ? H : 1080;
  var ink = typeof INK === 'string' ? INK : '#1d1a1a';
  var cl = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var cl01 = function (v) { return cl(v, 0, 1); };
  var lrp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, x) { var t = cl01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  // IAU exact definitions, so AU/light-year conversions are not folklore.
  // astronomical unit = 149 597 870 700 m exactly (IAU 2012 Resolution B2);
  // light-year = 9 460 730 472 580 800 m exactly (IAU, Julian year x c).
  var AU = 149597870700, LY = 9460730472580800, RSUN = 695700000;   // solar radius, m (NASA Sun fact sheet, 695 700 km)

  // ============================================================== §1 camera
  var ORIGIN = { x: 168 };          // screen x of world x = 0 (the base-left anchor)
  var GY = 960;                     // default ground line, screen y of world y = 0

  function fit(metres, frac, axis) {
    frac = frac === undefined ? 0.62 : frac;
    var span = (axis === 'w' ? FW : FH) * frac;
    return metres / span;           // m/px
  }
  function px(metres, mpp) { return metres / mpp; }
  function metres(p, mpp) { return p * mpp; }
  function decade(mpp) { return Math.log(mpp * FH) / Math.LN10; }

  // Geometric (log-space) interpolation. This is the whole reason a 1 m -> 1e21 m
  // move does not blow up: equal time buys equal MULTIPLES, not equal metres.
  function geo(a, b, u) { return Math.exp(lrp(Math.log(a), Math.log(b), u)); }

  function easeOf(e) {
    if (typeof e === 'function') return e;
    return (ACT.ease[e || 'inOutCubic']) || ACT.ease.inOutCubic;
  }

  function cam(t, plan) {
    plan = plan || {};
    var ez = easeOf(plan.ease), frac = plan.frac === undefined ? 0.62 : plan.frac, ax = plan.axis;
    if (plan.stops && plan.stops.length) {
      var n = plan.stops.length, each = plan.each === undefined ? 1.1 : plan.each;
      var hold = plan.hold === undefined ? 0.34 : plan.hold;
      var u = (t - (plan.t0 || 0)) / each;
      var i = cl(Math.floor(u), 0, n - 1), f = u - Math.floor(u);
      if (i >= n - 1) return fit(plan.stops[n - 1], frac, ax);
      var g = ez(cl01((f - hold) / (1 - hold)));
      return geo(fit(plan.stops[i], frac, ax), fit(plan.stops[i + 1], frac, ax), g);
    }
    var k = ez(cl01((t - (plan.t0 || 0)) / (plan.dur || 1)));
    var m0 = plan.m0 === undefined ? 10 : plan.m0, m1 = plan.m1 === undefined ? 1e6 : plan.m1;
    return geo(fit(m0, frac, ax), fit(m1, frac, ax), k);
  }

  // ========================================================= §2 stroke policy
  // Art is drawn in a 1000-unit local box and scaled by s = px/1000, so a fixed
  // local line width would become a 300 px slab on a big object and invisible
  // hair on a small one. sh() instead asks for a width in SCREEN pixels and
  // divides by s, and drops the stroke entirely below 0.7 px — which is what
  // makes a rung that is 1/1000 of the frame still read as a clean silhouette.
  var _s = 1, _lw = 4;
  function sh(fill, stroke, k) {
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    var w = _lw * (k === undefined ? 1 : k);
    if (stroke !== null && w >= 0.7) {
      ctx.strokeStyle = stroke || ink; ctx.lineWidth = w / _s;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    }
  }
  function ln(x1, y1, x2, y2, wLocal, col) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = col || ink; ctx.lineWidth = wLocal; ctx.lineCap = 'round'; ctx.stroke();
  }
  function hair(x1, y1, x2, y2, px0, col) {   // a line whose width is in screen px
    if (_lw * px0 < 0.5) return;
    ln(x1, y1, x2, y2, (px0 || 1) / _s, col);
  }

  // =========================================================== §3 object art
  // Every `m` below is the figure the comment cites. Anything not verified
  // against a primary/authoritative source is marked UNVERIFIED.
  var OBJ = {

    human: {
      name: 'Human', m: 1.71, dim: 'h', box: [380, 1000],
      // 1.71 m = global mean height of adult men born in 1996 (NCD Risk Factor
      // Collaboration, via Our World in Data, "Human Height"). Women: 1.59 m.
      src: '1.71 m — Our World in Data / NCD-RisC global mean adult male height',
      art: function () {
        var cx = 190, col = '#2E3B55';
        ln(cx - 42, -500, cx - 58, -22, 58, col); ln(cx + 42, -500, cx + 58, -22, 58, col);     // legs
        ctx.beginPath(); ctx.moveTo(cx - 86, -16); ctx.lineTo(cx - 30, -16); ctx.lineTo(cx - 36, -2); ctx.lineTo(cx - 92, -2); ctx.closePath(); sh('#1d1a1a', null);
        ctx.beginPath(); ctx.moveTo(cx + 86, -16); ctx.lineTo(cx + 30, -16); ctx.lineTo(cx + 36, -2); ctx.lineTo(cx + 92, -2); ctx.closePath(); sh('#1d1a1a', null);
        poly([[cx - 92, -800], [cx + 92, -800], [cx + 74, -480], [cx - 74, -480]]); sh(col, ink, 0.8);  // torso
        ln(cx - 86, -790, cx - 112, -520, 46, col); ln(cx + 86, -790, cx + 112, -520, 46, col);  // arms
        circle(cx - 118, -506, 25); sh('#F2D5B8', null); circle(cx + 118, -506, 25); sh('#F2D5B8', null);
        circle(cx, -884, 82); sh('#F2D5B8', ink, 0.8);                                            // head
        ctx.beginPath(); ctx.arc(cx, -884, 82, Math.PI * 1.06, Math.PI * 1.94); ctx.lineTo(cx, -884); ctx.closePath(); sh('#2a201c', null);
      }
    },

    car: {
      name: 'Car', m: 4.63, dim: 'w', box: [1000, 320],
      // 4630 mm overall length, 1435 mm height — 2025 Toyota Corolla sedan
      // (CarsGuide dimensions table, all sedan variants).
      src: '4.63 m long, 1.435 m high — 2025 Toyota Corolla sedan (CarsGuide dimensions)',
      art: function () {
        var body = '#C8312B';
        rrect(18, -168, 964, 128, 34); sh(body, ink, 0.9);
        ctx.beginPath(); ctx.moveTo(268, -164); ctx.quadraticCurveTo(348, -300, 492, -304);
        ctx.lineTo(648, -300); ctx.quadraticCurveTo(742, -288, 782, -164); ctx.closePath(); sh(body, ink, 0.9);
        ctx.beginPath(); ctx.moveTo(300, -170); ctx.quadraticCurveTo(366, -276, 486, -280);
        ctx.lineTo(486, -170); ctx.closePath(); sh('#A9C6D6', null);
        ctx.beginPath(); ctx.moveTo(516, -280); ctx.lineTo(636, -278); ctx.quadraticCurveTo(712, -270, 748, -170);
        ctx.lineTo(516, -170); ctx.closePath(); sh('#A9C6D6', null);
        circle(272, -56, 64); sh('#23201f', null); circle(272, -56, 30); sh('#9aa3ad', null);
        circle(762, -56, 64); sh('#23201f', null); circle(762, -56, 30); sh('#9aa3ad', null);
        rrect(950, -130, 40, 26, 8); sh('#FFE27A', null);
      }
    },

    bus: {
      name: 'Double-decker bus', short: 'Bus', m: 11.5, dim: 'w', box: [1000, 380],
      // 11.5 m overall length, 4.3 m height — Alexander Dennis Enviro400
      // double-deck spec sheet (lengths 10.5/10.9/11.5 m, heights 4.2/4.3 m).
      src: '11.5 m long, 4.3 m high — Alexander Dennis Enviro400 spec sheet',
      art: function () {
        rrect(8, -372, 984, 320, 26); sh('#C8312B', ink, 0.9);
        for (var i = 0; i < 7; i++) { rrect(60 + i * 128, -344, 96, 96, 10); sh('#A9C6D6', ink, 0.6); }
        for (i = 0; i < 7; i++) { rrect(60 + i * 128, -208, 96, 86, 10); sh('#A9C6D6', ink, 0.6); }
        rrect(28, -108, 936, 18, 6); sh('#8E2B2B', null);
        circle(214, -44, 46); sh('#23201f', null); circle(214, -44, 20); sh('#9aa3ad', null);
        circle(806, -44, 46); sh('#23201f', null); circle(806, -44, 20); sh('#9aa3ad', null);
      }
    },

    blueWhale: {
      name: 'Blue whale', m: 33.5, dim: 'w', box: [1000, 250],
      // NOAA Fisheries blue whale species page: Antarctic blue whales reach
      // "up to about 110 feet" = 33.5 m (metric conversion mine). North
      // Atlantic / North Pacific animals reach about 90 ft (27.4 m).
      src: '33.5 m (110 ft) — NOAA Fisheries, blue whale species page',
      art: function () {
        var col = '#4E6E8E';
        ctx.beginPath(); ctx.moveTo(12, -132);
        ctx.bezierCurveTo(220, -238, 560, -242, 862, -156); ctx.lineTo(906, -132);
        ctx.bezierCurveTo(840, -56, 420, -14, 12, -132); ctx.closePath(); sh(col, ink, 0.8);
        poly([[900, -132], [1000, -230], [958, -130], [1000, -34]]); sh(col, ink, 0.8);          // fluke
        poly([[320, -94], [452, -12], [392, -88]]); sh(shade(col, -0.18), null);                 // pectoral
        poly([[702, -202], [748, -244], [764, -196]]); sh(shade(col, -0.18), null);              // dorsal
        ctx.beginPath(); ctx.moveTo(14, -128); ctx.bezierCurveTo(180, -92, 330, -70, 430, -66); sh(null, shade(col, -0.35), 0.8);
        circle(96, -152, 13); sh('#1d1a1a', null);
        for (var i = 0; i < 6; i++) hair(40 + i * 52, -116, 60 + i * 52, -52, 1.2, shade(col, 0.35)); // throat pleats
      }
    },

    liberty: {
      name: 'Statue of Liberty', short: 'Liberty', m: 92.99, dim: 'h', box: [440, 1000],
      // NPS "Statue Statistics": ground to tip of torch 92.99 m; top of base to
      // torch 46.05 m; heel to top of head 33.86 m. Pedestal + foundation is
      // therefore 46.94 m, which is where the art splits the two.
      src: '92.99 m ground to torch — US National Park Service, Statue Statistics',
      art: function () {
        var stone = '#B9AE9A', cu = '#7FB8A2', cx = 208;
        poly([[8, 0], [408, 0], [372, -176], [44, -176]]); sh(stone, ink, 0.8);                 // foundation
        poly([[56, -176], [360, -176], [330, -504], [86, -504]]); sh(shade(stone, 0.08), ink, 0.8); // pedestal
        for (var i = 0; i < 5; i++) hair(96 + i * 56, -200, 100 + i * 54, -488, 1.1, shade(stone, -0.22));
        poly([[128, -504], [288, -504], [250, -812], [166, -812]]); sh(cu, ink, 0.8);           // robe
        ctx.beginPath(); ctx.moveTo(166, -812); ctx.quadraticCurveTo(208, -792, 250, -812);
        ctx.lineTo(262, -740); ctx.lineTo(154, -740); ctx.closePath(); sh(shade(cu, -0.12), null);
        ln(166, -790, 118, -652, 30, cu);                                                       // left arm + tablet
        rrect(84, -706, 72, 96, 6); sh(shade(cu, 0.12), ink, 0.7);
        ln(248, -800, 300, -932, 30, cu);                                                       // raised right arm
        circle(208, -856, 38); sh(cu, ink, 0.8);                                                // head
        for (i = -3; i <= 3; i++) { var a = i * 0.34; poly([[208 + Math.sin(a) * 34, -856 - Math.cos(a) * 34], [208 + Math.sin(a) * 74, -856 - Math.cos(a) * 74], [208 + Math.sin(a + 0.1) * 34, -856 - Math.cos(a + 0.1) * 34]]); sh(cu, null); }
        rrect(286, -970, 34, 48, 8); sh('#F2C230', ink, 0.7);                                   // torch
        ctx.beginPath(); ctx.moveTo(290, -966); ctx.quadraticCurveTo(286, -1002, 303, -1000);
        ctx.quadraticCurveTo(320, -1002, 316, -966); ctx.closePath(); sh('#FFE27A', null);
      }
    },

    saturnV: {
      name: 'Saturn V', m: 110.6, dim: 'h', box: [250, 1000],
      // NASA history, "50 Years Ago: The First Flight of the Saturn V": 363 feet
      // tall. 363 ft = 110.64 m (metric conversion mine; NASA gives feet).
      src: '110.6 m (363 ft) — NASA history, first flight of the Saturn V',
      art: function () {
        var cx = 125, w = 94;
        rrect(cx - w, -368, w * 2, 368, 4); sh('#F2EFE8', ink, 0.8);                             // S-IC
        rrect(cx - w, -626, w * 2, 262, 4); sh('#F2EFE8', ink, 0.8);                             // S-II
        rrect(cx - 72, -772, 144, 150, 4); sh('#F2EFE8', ink, 0.8);                              // S-IVB
        poly([[cx - 72, -772], [cx + 72, -772], [cx + 42, -836], [cx - 42, -836]]);  sh('#D8D4CB', ink, 0.7);
        rrect(cx - 42, -906, 84, 74, 4); sh('#9aa3ad', ink, 0.7);                                // CSM
        poly([[cx - 42, -906], [cx + 42, -906], [cx, -952]]); sh('#C8312B', ink, 0.7);
        ln(cx, -950, cx, -1000, 14, '#C8312B');
        rrect(cx - w, -352, w * 2, 44, 2); sh('#23201f', null);                                  // roll bands
        rrect(cx - w, -236, w * 2, 40, 2); sh('#23201f', null);
        rrect(cx - w, -626, w * 2, 34, 2); sh('#23201f', null);
        rrect(cx - w, -412, w * 2, 26, 2); sh('#23201f', null);
        poly([[cx - w, -70], [cx - w - 36, 0], [cx - w, 0]]); sh('#23201f', null);               // fins
        poly([[cx + w, -70], [cx + w + 36, 0], [cx + w, 0]]); sh('#23201f', null);
        for (var i = 0; i < 5; i++) { circle(cx - 64 + i * 32, -8, 15); sh('#3a3a3a', null); }   // F-1 bells
      }
    },

    starship: {
      name: 'Starship + tower', short: 'Starship', m: 122, dim: 'h', box: [400, 1200],
      // FAA Final Programmatic Environmental Assessment for SpaceX
      // Starship/Super Heavy at Boca Chica (June 2022): the fully integrated
      // vehicle is "approximately 400 feet tall" = 122 m; each integration
      // tower is about 480 ft (146 m), ~490 ft (149 m) with its lightning rod.
      // `m` is the VEHICLE (122 m); the tower is drawn at its true 146 m.
      src: 'vehicle 122 m (400 ft), tower 146 m (480 ft) — FAA Starship/Super Heavy PEA, June 2022',
      art: function () {
        var vx = 150, vw = 74, tw = 92, tx = 250, th = 1197;                                    // 146/122*1000
        rrect(tx, -th, tw, th, 4); sh('#8E959E', ink, 0.9);                                      // tower
        for (var y = -40; y > -th; y -= 86) hair(tx, y, tx + tw, y - 86, 1.8, '#4e555d');
        for (y = -40; y > -th; y -= 86) hair(tx + tw, y, tx, y - 86, 1.8, '#4e555d');
        for (y = -40; y > -th; y -= 172) hair(tx, y, tx + tw, y, 1.4, '#4e555d');
        rrect(tx - 10, -40, tw + 20, 40, 5); sh('#6b727a', ink, 0.9);                            // tower base
        rrect(tx - 62, -790, 70, 26, 7); sh('#9aa1a9', ink, 0.9);                                // chopstick arms
        rrect(tx - 62, -746, 70, 26, 7); sh('#9aa1a9', ink, 0.9);
        ln(tx + tw / 2, -th, tx + tw / 2, -th - 24, 10, '#8E959E');
        rrect(vx - vw / 2, -582, vw, 582, 3); sh('#D5DBE1', ink, 1.0);                           // Super Heavy (71 m)
        rrect(vx - vw / 2, -960, vw, 380, 3); sh('#F2F6F9', ink, 1.0);                           // Ship (50 m)
        ctx.beginPath(); ctx.moveTo(vx - vw / 2, -960); ctx.quadraticCurveTo(vx, -1034, vx + vw / 2, -960); ctx.closePath(); sh('#F2F6F9', ink, 1.0);
        rrect(vx - vw / 2, -596, vw, 22, 2); sh('#23282d', null);                                // stage joint
        poly([[vx - vw / 2, -700], [vx - vw / 2 - 26, -754], [vx - vw / 2, -790]]); sh('#C7CDD4', null);
        poly([[vx + vw / 2, -700], [vx + vw / 2 + 26, -754], [vx + vw / 2, -790]]); sh('#C7CDD4', null);
        rrect(vx - vw / 2 - 4, -20, vw + 8, 20, 3); sh('#3a3a3a', null);
      }
    },

    eiffel: {
      name: 'Eiffel Tower', short: 'Eiffel', m: 330, dim: 'h', box: [600, 1010],
      // CTBUH / skyscrapercenter.com, Eiffel Tower: 300 m to architectural top
      // (including the spire), 330 m to tip (including antennae). `m` is the
      // 330 m tip figure, which is the one usually quoted.
      src: '330 m to tip, 300 m architectural — CTBUH / skyscrapercenter.com',
      art: function () {
        // core.js's own lattice tower: base-centre at (x, y), height h, and its
        // mast reaches 1.032x h, so h=969 puts the tip at exactly -1000.
        if (typeof eiffel === 'function') eiffel(300, 0, 969, { col: '#8A5A3B' });
        else { poly([[0, 0], [300, -1000], [600, 0]]); sh('#8A5A3B', ink, 0.8); }
      }
    },

    burj: {
      name: 'Burj Khalifa', short: 'Burj Khalifa', m: 828, dim: 'h', box: [420, 1000],
      // CTBUH / skyscrapercenter.com, Burj Khalifa: 828 m to architectural top
      // (spires included, antennae excluded); 829.8 m to tip.
      src: '828 m architectural top, 829.8 m to tip — CTBUH / skyscrapercenter.com',
      art: function () {
        var g = ctx.createLinearGradient(0, 0, 420, 0);
        g.addColorStop(0, '#A9B4C0'); g.addColorStop(0.45, '#E4EAF0'); g.addColorStop(1, '#8A939E');
        poly([[46, 0], [374, 0], [352, -300], [300, -300], [292, -520], [250, -520],
              [244, -700], [218, -700], [214, -830], [202, -830], [196, -700], [170, -700],
              [164, -520], [124, -520], [116, -300], [68, -300]]); sh(g, ink, 0.8);
        ln(208, -830, 208, -1000, 13, '#C7CFD8');
        for (var i = 1; i < 10; i++) { var yy = -i * 92; hair(70 + i * 7, yy, 350 - i * 7, yy, 1, 'rgba(40,50,60,0.35)'); }
        for (i = 0; i < 7; i++) hair(80 + i * 44, -16, 110 + i * 32, -820, 1, 'rgba(255,255,255,0.45)');
      }
    },

    everest: {
      name: 'Mount Everest', short: 'Everest', m: 8848.86, dim: 'h', box: [2600, 1000],
      // 8,848.86 m: the height jointly announced by China and Nepal in
      // December 2020 (China Daily / Government of China release). The art's
      // 23 km base width is a drawing choice, not a measurement.
      src: '8,848.86 m — China/Nepal joint announcement, December 2020',
      art: function () {
        var massif = [[0, 0], [430, -248], [880, -520], [1150, -782], [1288, -1000], [1452, -848],
                      [1770, -600], [2160, -300], [2600, 0]];
        poly(massif);
        var g = ctx.createLinearGradient(0, -1000, 0, 0);
        g.addColorStop(0, '#8B867C'); g.addColorStop(0.45, '#6E6A62'); g.addColorStop(1, '#4A473F');
        sh(g, ink, 0.8);
        // strata and gullies, so the flank is not a flat grey wedge when the
        // camera is still half a zoom away and the mountain overfills the frame
        ctx.save(); poly(massif); ctx.clip();
        var r = rnd(19), i;
        for (i = 0; i < 9; i++) { var yy = -60 - i * 104;
          ctx.beginPath(); ctx.moveTo(-50, yy);
          ctx.bezierCurveTo(700, yy - 26 - r() * 30, 1700, yy + 18 + r() * 30, 2650, yy - 14);
          sh(null, 'rgba(30,28,24,0.22)', 1.4); }
        for (i = 0; i < 16; i++) { var sx = 120 + r() * 2360, sy = -40 - r() * 740;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + 40 - r() * 80, sy + 120, sx + 70 - r() * 140, sy + 260);
          sh(null, r() < 0.5 ? 'rgba(244,247,250,0.4)' : 'rgba(20,18,16,0.3)', 1.6); }
        ctx.restore();
        poly([[1082, -706], [1288, -1000], [1452, -848], [1560, -742], [1392, -700], [1252, -742]]); sh('#F4F7FA', null);
        poly([[0, 0], [430, -248], [700, -150], [980, -268], [1180, -120], [1420, -230], [1700, -120], [2050, -230], [2600, 0]]); sh('#3F3D37', null);
        hair(1288, -1000, 980, -268, 1.6, 'rgba(255,255,255,0.45)');
        hair(1288, -1000, 1770, -600, 1.6, 'rgba(255,255,255,0.45)');
        hair(880, -520, 1150, -782, 1.4, 'rgba(0,0,0,0.3)');
      }
    },

    city: {
      name: 'Manhattan', m: 21000, dim: 'w', box: [1000, 190],
      // PLAN VIEW (top down), not an elevation like the rungs below it.
      // Verified: New York County land area 22.66 sq mi = 58.7 km^2 (US Census
      // QuickFacts, 2020). The 21 km long axis and 3.7 km width are APPROXIMATE
      // and DERIVED from the island's extent, not a census figure — UNVERIFIED.
      src: '58.7 km^2 land area verified (US Census QuickFacts, New York County 2020); 21 km long axis APPROXIMATE/UNVERIFIED',
      art: function () {
        ctx.beginPath(); ctx.moveTo(14, -96);
        ctx.bezierCurveTo(180, -168, 520, -176, 760, -140);
        ctx.bezierCurveTo(900, -120, 972, -92, 992, -62);
        ctx.bezierCurveTo(880, -24, 520, -10, 230, -34);
        ctx.bezierCurveTo(110, -46, 40, -70, 14, -96); ctx.closePath();
        sh('#C9BFA6', ink, 0.8);
        ctx.save(); ctx.clip();
        for (var i = 0; i < 44; i++) hair(20 + i * 23, -4, 34 + i * 23, -184, 0.9, 'rgba(60,55,45,0.4)');
        for (i = 0; i < 6; i++) hair(0, -22 - i * 28, 1000, -22 - i * 28, 0.9, 'rgba(60,55,45,0.28)');
        rrect(300, -132, 190, 62, 6); sh('#6E8E52', null);                                       // Central Park
        var r = rnd(21);
        for (i = 0; i < 70; i++) { var bx = r() * 980, by = -14 - r() * 150; rrect(bx, by, 7 + r() * 9, 7 + r() * 9, 1); sh('rgba(40,40,44,0.5)', null); }
        ctx.restore();
      }
    },

    moon: {
      name: 'The Moon', short: 'Moon', m: 3474800, dim: 'd', box: [1000, 1000],
      // NASA NSSDC Planetary Fact Sheet (metric): Moon diameter 3,475 km.
      src: '3,475 km diameter — NASA NSSDC Planetary Fact Sheet',
      art: function () {
        if (typeof COS !== 'undefined' && COS.planet) { COS.planet(500, -500, 500, 'moon', { light: SCALE_LIGHT() }); return; }   // cosmic.js owns the look
        var g = ctx.createRadialGradient(330, -660, 60, 500, -500, 520);
        g.addColorStop(0, '#DCD9D2'); g.addColorStop(0.72, '#B4B0A8'); g.addColorStop(1, '#7E7A73');
        circle(500, -500, 500); sh(g, null);
        var r = rnd(7);
        ctx.save(); circle(500, -500, 500); ctx.clip();
        for (var i = 0; i < 5; i++) { ellipse(260 + r() * 520, -260 - r() * 520, 90 + r() * 140, 70 + r() * 110, r() * 3); sh('rgba(100,98,94,0.45)', null); }
        for (i = 0; i < 46; i++) { var a = r() * 6.283, rad = Math.sqrt(r()) * 480, cr = 10 + r() * 46;
          circle(500 + Math.cos(a) * rad, -500 + Math.sin(a) * rad, cr); sh('rgba(126,122,115,0.6)', null);
          circle(500 + Math.cos(a) * rad - cr * 0.18, -500 + Math.sin(a) * rad - cr * 0.18, cr * 0.8); sh('rgba(222,219,212,0.5)', null); }
        ctx.restore();
        circle(500, -500, 500); sh(null, 'rgba(60,58,54,0.8)', 0.7);
      }
    },

    earth: {
      name: 'Earth', m: 12756000, dim: 'd', box: [1000, 1000],
      // NASA NSSDC Planetary Fact Sheet (metric): Earth diameter 12,756 km
      // (equatorial). Mean diameter is 12,742 km.
      src: '12,756 km equatorial diameter — NASA NSSDC Planetary Fact Sheet',
      art: function () {
        if (typeof COS !== 'undefined' && COS.planet) { COS.planet(500, -500, 500, 'earth', { light: SCALE_LIGHT(), spin: 160, lights: true, clouds: true }); return; }   // cosmic.js owns the look
        var g = ctx.createRadialGradient(320, -680, 60, 500, -500, 540);
        g.addColorStop(0, '#5FB0FF'); g.addColorStop(0.68, '#2A6BC8'); g.addColorStop(1, '#10306E');
        circle(500, -500, 500); sh(g, null);
        ctx.save(); circle(500, -500, 500); ctx.clip();
        var land = '#4C8C4A';
        ctx.beginPath(); ctx.moveTo(200, -760); ctx.bezierCurveTo(320, -820, 430, -740, 400, -640);
        ctx.bezierCurveTo(380, -560, 300, -540, 250, -600); ctx.bezierCurveTo(200, -660, 150, -700, 200, -760); ctx.closePath(); sh(land, null);
        ctx.beginPath(); ctx.moveTo(360, -520); ctx.bezierCurveTo(430, -520, 450, -420, 410, -300);
        ctx.bezierCurveTo(382, -210, 330, -180, 318, -250); ctx.bezierCurveTo(306, -340, 300, -470, 360, -520); ctx.closePath(); sh(land, null);
        ctx.beginPath(); ctx.moveTo(600, -720); ctx.bezierCurveTo(760, -790, 900, -700, 870, -600);
        ctx.bezierCurveTo(840, -510, 700, -500, 630, -580); ctx.closePath(); sh(land, null);
        ctx.beginPath(); ctx.moveTo(660, -470); ctx.bezierCurveTo(780, -510, 870, -430, 820, -340);
        ctx.bezierCurveTo(770, -260, 660, -300, 640, -390); ctx.closePath(); sh('#8C7A4A', null);
        ellipse(500, -968, 280, 56, 0); sh('rgba(255,255,255,0.88)', null);                      // polar caps
        ellipse(500, -34, 250, 50, 0); sh('rgba(255,255,255,0.92)', null);
        var r = rnd(11);
        for (var i = 0; i < 22; i++) { var a = r() * 6.283, rad = Math.sqrt(r()) * 470;
          ellipse(500 + Math.cos(a) * rad, -500 + Math.sin(a) * rad, 34 + r() * 62, 13 + r() * 22, r() * 3); sh('rgba(255,255,255,0.5)', null); }
        var tg = ctx.createLinearGradient(760, 0, 1000, 0);                                      // terminator
        tg.addColorStop(0, 'rgba(4,10,30,0)'); tg.addColorStop(1, 'rgba(4,10,30,0.55)');
        ctx.fillStyle = tg; ctx.fillRect(700, -1000, 300, 1000);
        ctx.restore();
        circle(500, -500, 500); sh(null, 'rgba(10,30,70,0.8)', 0.7);
      }
    },

    jupiter: {
      name: 'Jupiter', m: 142984000, dim: 'd', box: [1000, 1000],
      // NASA NSSDC Planetary Fact Sheet (metric): Jupiter diameter 142,984 km.
      src: '142,984 km diameter — NASA NSSDC Planetary Fact Sheet',
      art: function () {
        if (typeof COS !== 'undefined' && COS.planet) { COS.planet(500, -500, 500, 'jupiter', { light: SCALE_LIGHT() }); return; }   // cosmic.js owns the look
        var g = ctx.createRadialGradient(330, -680, 60, 500, -500, 540);
        g.addColorStop(0, '#F2DEC0'); g.addColorStop(0.7, '#D8B48A'); g.addColorStop(1, '#8A6A4A');
        circle(500, -500, 500); sh(g, null);
        ctx.save(); circle(500, -500, 500); ctx.clip();
        var bands = [[-910, 44, 'rgba(146,106,74,0.55)'], [-820, 58, 'rgba(236,222,196,0.6)'],
                     [-712, 70, 'rgba(154,112,78,0.5)'], [-600, 54, 'rgba(242,230,206,0.55)'],
                     [-486, 84, 'rgba(160,112,76,0.45)'], [-372, 62, 'rgba(240,226,200,0.5)'],
                     [-258, 56, 'rgba(142,100,70,0.5)'], [-150, 44, 'rgba(236,220,194,0.5)'], [-62, 36, 'rgba(136,96,66,0.5)']];
        for (var i = 0; i < bands.length; i++) { ctx.fillStyle = bands[i][2]; ctx.fillRect(0, bands[i][0], 1000, bands[i][1]); }
        ellipse(660, -366, 118, 66, 0); sh('#C8542E', null);                                     // Great Red Spot
        ellipse(660, -366, 72, 38, 0); sh('rgba(226,130,86,0.7)', null);
        ctx.restore();
        circle(500, -500, 500); sh(null, 'rgba(70,50,34,0.8)', 0.7);
      }
    },

    sun: {
      name: 'The Sun', short: 'Sun', m: 1391400000, dim: 'd', box: [1000, 1000],
      // NASA NSSDC Sun Fact Sheet gives a volumetric mean radius of 695,700 km.
      // Diameter 1,391,400 km = 1.3914e9 m is 2x that (my arithmetic; the sheet
      // lists only the radius and an apparent angular diameter).
      src: '1,391,400 km diameter = 2 x 695,700 km mean radius — NASA NSSDC Sun Fact Sheet',
      art: function () {
        if (typeof COS !== 'undefined' && COS.star) { COS.star(500, -500, 500, {}); return; }   // cosmic.js owns the look
        var cg = ctx.createRadialGradient(500, -500, 480, 500, -500, 760);
        cg.addColorStop(0, 'rgba(255,196,80,0.55)'); cg.addColorStop(1, 'rgba(255,150,40,0)');
        circle(500, -500, 760); sh(cg, null);
        var g = ctx.createRadialGradient(430, -600, 80, 500, -500, 520);
        g.addColorStop(0, '#FFF6CF'); g.addColorStop(0.55, '#FFD24A'); g.addColorStop(0.93, '#F59A1E'); g.addColorStop(1, '#D9650E');
        circle(500, -500, 500); sh(g, null);
        ctx.save(); circle(500, -500, 500); ctx.clip();
        var r = rnd(13);
        for (var i = 0; i < 70; i++) { var a = r() * 6.283, rad = Math.sqrt(r()) * 486;
          circle(500 + Math.cos(a) * rad, -500 + Math.sin(a) * rad, 12 + r() * 34); sh('rgba(255,245,200,0.18)', null); }
        for (i = 0; i < 6; i++) { a = r() * 6.283; rad = Math.sqrt(r()) * 420;
          ellipse(500 + Math.cos(a) * rad, -500 + Math.sin(a) * rad, 26 + r() * 40, 14 + r() * 22, r() * 3); sh('rgba(190,96,20,0.45)', null); }
        ctx.restore();
        for (i = 0; i < 9; i++) { var b = i / 9 * 6.283 + 0.3;                                   // prominences
          ctx.beginPath(); ctx.moveTo(500 + Math.cos(b) * 494, -500 + Math.sin(b) * 494);
          ctx.quadraticCurveTo(500 + Math.cos(b + 0.1) * 600, -500 + Math.sin(b + 0.1) * 600, 500 + Math.cos(b + 0.22) * 500, -500 + Math.sin(b + 0.22) * 500);
          sh(null, 'rgba(255,170,60,0.75)', 1.6); }
      }
    },

    uyScuti: {
      name: 'UY Scuti', m: 2376500000000, dim: 'd', box: [1000, 1000],
      // Arroyo-Torres et al. 2013 (A&A, arXiv:1305.6179), "The atmospheric
      // structure and fundamental parameters of the red supergiants AH Sco,
      // UY Sct and KW Sgr": R = 1708 +/- 192 solar radii for UY Sct, at an
      // adopted distance of 2900 +/- 317 pc. Diameter = 2 x 1708 x 695,700 km
      // = 2.3765e9 km (my arithmetic).
      // CONTESTED: later Gaia-based distances put UY Scuti far nearer and shrink
      // the radius to roughly 755 R_sun. The 1708 R_sun figure is the published
      // measurement verified here; treat the "largest star" claim as disputed.
      src: 'diameter 2.38e9 km from R = 1708 +/- 192 R_sun — Arroyo-Torres et al. 2013 (arXiv:1305.6179). CONTESTED: Gaia-era estimates give ~755 R_sun',
      art: function () {
        var cg = ctx.createRadialGradient(500, -500, 470, 500, -500, 700);
        cg.addColorStop(0, 'rgba(226,96,48,0.45)'); cg.addColorStop(1, 'rgba(200,60,30,0)');
        circle(500, -500, 700); sh(cg, null);
        var g = ctx.createRadialGradient(410, -610, 70, 500, -500, 530);
        g.addColorStop(0, '#FFC884'); g.addColorStop(0.5, '#F0773C'); g.addColorStop(1, '#A82E18');
        circle(500, -500, 500); sh(g, null);
        ctx.save(); circle(500, -500, 500); ctx.clip();
        var r = rnd(17);
        for (var i = 0; i < 40; i++) { var a = r() * 6.283, rad = Math.sqrt(r()) * 480;
          ellipse(500 + Math.cos(a) * rad, -500 + Math.sin(a) * rad, 46 + r() * 120, 36 + r() * 90, r() * 3);
          sh(r() < 0.5 ? 'rgba(255,208,140,0.28)' : 'rgba(150,40,18,0.3)', null); }
        ctx.restore();
      }
    },

    blackHole: {
      name: 'M87* black hole shadow', short: 'Black hole', m: 1.0e14, dim: 'd', box: [1000, 1000],
      // EHT Collaboration 2019, "First M87 Event Horizon Telescope Results. VI.
      // The Shadow and Mass of the Central Black Hole" (arXiv:1906.11243):
      // ring diameter 42 +/- 3 microarcsec, expected shadow diameter ~38 uas,
      // mass 6.5e9 solar masses at D = 16.8 Mpc, angular gravitational radius
      // GM/Dc^2 = 3.8 +/- 0.4 uas.
      // 38 uas x 16.8 Mpc = 9.6e13 m; and 2*sqrt(27)*GM/c^2 for 6.5e9 Msun is
      // 1.0e14 m. Both arithmetic steps are mine; the paper gives no metres.
      src: 'shadow ~1.0e14 m, derived from 38 microarcsec at 16.8 Mpc and M = 6.5e9 Msun — EHT Paper VI (arXiv:1906.11243). Metric conversion mine',
      art: function () {
        var ag = ctx.createRadialGradient(500, -500, 500, 500, -500, 860);
        ag.addColorStop(0, 'rgba(255,170,70,0.55)'); ag.addColorStop(0.45, 'rgba(226,110,40,0.22)'); ag.addColorStop(1, 'rgba(180,70,20,0)');
        circle(500, -500, 860); sh(ag, null);
        ctx.save(); ctx.translate(500, -500); ctx.rotate(-0.28);
        ellipse(0, 0, 820, 230, 0); sh('rgba(255,186,96,0.3)', null);                            // accretion disc
        ellipse(0, 0, 640, 170, 0); sh('rgba(255,214,140,0.34)', null);
        ctx.restore();
        circle(500, -500, 560); sh(null, 'rgba(255,230,160,0.9)', 3.4);                          // photon ring
        circle(500, -500, 530); sh(null, 'rgba(255,196,96,0.55)', 2.2);
        circle(500, -500, 500); sh('#07060a', null);                                             // the shadow
      }
    },

    solarSystem: {
      name: 'Solar System (heliosphere)', short: 'Solar System', m: 3.65e13, dim: 'd', box: [1000, 1000],
      // NASA Voyager interstellar mission page: Voyager 1 entered interstellar
      // space at about 122 AU from the Sun. Taking the heliopause as the edge,
      // the heliosphere is ~244 AU across = 3.65e13 m (my arithmetic).
      src: 'diameter ~244 AU = 3.65e13 m, from the heliopause at ~122 AU — NASA Voyager Interstellar Mission. Doubling is mine',
      art: function () {
        ctx.setLineDash([26, 20]);
        circle(500, -500, 500); sh('rgba(120,190,255,0.10)', 'rgba(150,210,255,0.8)', 2.2);
        ctx.setLineDash([]);
        var orb = [0.034, 0.063, 0.087, 0.133, 0.453, 0.831];                                    // Merc..Sat, radius/122 AU
        for (var i = 0; i < orb.length; i++) { circle(500, -500, 500 * orb[i] * 1.0); sh(null, 'rgba(190,215,250,0.5)', 1.3); }
        circle(500, -500, 500 * 0.157); sh(null, 'rgba(240,160,90,0.65)', 1.5);                  // Jupiter-ish
        circle(500, -500, 26); sh('#FFD24A', null);
        var cg = ctx.createRadialGradient(500, -500, 10, 500, -500, 120);
        cg.addColorStop(0, 'rgba(255,210,74,0.75)'); cg.addColorStop(1, 'rgba(255,170,40,0)');
        circle(500, -500, 120); sh(cg, null);
        var r = rnd(23);
        for (i = 0; i < 7; i++) { var a = r() * 6.283, rad = 70 + r() * 420;
          circle(500 + Math.cos(a) * rad, -500 + Math.sin(a) * rad, 7 + r() * 9); sh('#CFE0F0', null); }
      }
    },

    oortCloud: {
      name: 'Oort Cloud', m: 2.99e16, dim: 'd', box: [1000, 1000],
      // NASA science.nasa.gov Oort Cloud facts: outer edge "somewhere between
      // 10,000 and 100,000 AU from the Sun", inner edge 2,000-5,000 AU.
      // Taking 100,000 AU as the outer edge, the shell is 200,000 AU across
      // = 2.99e16 m (my arithmetic). NASA's own page is internally inconsistent
      // about the inner edge, so the shell thickness here is indicative.
      src: 'diameter ~200,000 AU = 2.99e16 m, from an outer edge at 100,000 AU — NASA Oort Cloud facts. Doubling is mine',
      art: function () {
        var g = ctx.createRadialGradient(500, -500, 200, 500, -500, 500);
        g.addColorStop(0, 'rgba(120,170,230,0)'); g.addColorStop(0.72, 'rgba(140,190,240,0.16)'); g.addColorStop(1, 'rgba(120,170,230,0.03)');
        circle(500, -500, 500); sh(g, null);
        var r = rnd(29);
        for (var i = 0; i < 520; i++) { var a = r() * 6.283, u = 0.42 + Math.pow(r(), 0.6) * 0.58, rad = 500 * u;
          circle(500 + Math.cos(a) * rad, -500 + Math.sin(a) * rad, 1.6 + r() * 3.4); sh('rgba(226,240,255,0.85)', null); }
        ctx.setLineDash([18, 16]); circle(500, -500, 500); sh(null, 'rgba(160,210,255,0.5)', 1.6); ctx.setLineDash([]);
        circle(500, -500, 500 * 0.0012 + 7); sh('#FFD24A', null);
        var cg = ctx.createRadialGradient(500, -500, 4, 500, -500, 70);
        cg.addColorStop(0, 'rgba(255,210,74,0.8)'); cg.addColorStop(1, 'rgba(255,170,40,0)');
        circle(500, -500, 70); sh(cg, null);
      }
    },

    milkyWay: {
      name: 'The Milky Way', short: 'Milky Way', m: 9.4607304725808e20, dim: 'd', box: [1000, 1000],
      // NASA Imagine the Universe, "The Milky Way Galaxy": "These stars form a
      // large disk whose diameter is about 100,000 light years."
      // 100,000 ly x 9 460 730 472 580 800 m/ly = 9.46073e20 m (my arithmetic).
      src: '100,000 light-years = 9.46073e20 m — NASA Imagine the Universe. Conversion mine',
      art: function () {
        var g = ctx.createRadialGradient(500, -500, 20, 500, -500, 500);
        g.addColorStop(0, 'rgba(255,246,220,0.95)'); g.addColorStop(0.1, 'rgba(255,226,150,0.6)');
        g.addColorStop(0.42, 'rgba(150,180,255,0.22)'); g.addColorStop(1, 'rgba(90,120,220,0.0)');
        circle(500, -500, 500); sh(g, null);
        var r = rnd(31), i, j;
        for (j = 0; j < 2; j++) {                                                                // two log-spiral arms
          for (i = 0; i < 620; i++) {
            var u = i / 620, th = j * Math.PI + u * 3.5 + 0.4, rad = 60 + Math.pow(u, 0.78) * 440;
            var jit = (r() - 0.5) * (26 + u * 90), jth = (r() - 0.5) * 0.18;
            var x = 500 + Math.cos(th + jth) * (rad + jit), y = -500 + Math.sin(th + jth) * (rad + jit) * 0.96;
            circle(x, y, 1.6 + r() * 4.2); sh(r() < 0.22 ? 'rgba(170,205,255,0.95)' : 'rgba(255,240,205,0.8)', null);
            if (r() < 0.06) { circle(x, y, 8 + r() * 16); sh('rgba(255,150,170,0.3)', null); }    // HII regions
          }
        }
        ellipse(500, -500, 190, 92, -0.35); sh('rgba(255,236,176,0.55)', null);                  // bar
        circle(500, -500, 46); sh('rgba(255,250,228,0.9)', null);
        for (i = 0; i < 160; i++) { var a = r() * 6.283, rr = Math.sqrt(r()) * 500;
          circle(500 + Math.cos(a) * rr, -500 + Math.sin(a) * rr * 0.96, 1.2 + r() * 2); sh('rgba(255,255,255,0.45)', null); }
      }
    }
  };

  // ------------------------------------------------------------- object access
  function get(key) { var o = OBJ[key]; if (!o) throw new Error('scale.js: no object "' + key + '"'); return o; }
  function keys() { return Object.keys(OBJ).sort(function (a, b) { return OBJ[a].m - OBJ[b].m; }); }
  function ratio(a, b) { return get(b).m / get(a).m; }

  // Draw one object at the given camera. The object's principal dimension
  // becomes `pxSize` pixels; the art box is scaled uniformly from base-left.
  function draw(key, mpp, o) {
    o = o || {};
    var ob = get(key), p = px(ob.m, mpp);
    if (!isFinite(p) || p < 0.06) return null;                   // too small to be a pixel: don't draw
    if (o.max && p > o.max) p = o.max;
    var s = p / 1000, x = o.x === undefined ? ORIGIN.x : o.x, y = o.y === undefined ? GY : o.y;
    var al = o.alpha === undefined ? 1 : o.alpha;
    if (al <= 0.004) return null;
    var prevS = _s, prevLW = _lw;
    _s = s; _lw = cl(p * 0.010, 0, 6.5);
    ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.scale(s, s);
    try { ob.art(o); } finally { ctx.restore(); _s = prevS; _lw = prevLW; }
    var bw = ob.box[0] * s, bh = ob.box[1] * s;
    return { key: key, x: x, y: y, w: bw, h: bh, px: p, cx: x + bw / 2, topY: y - bh, name: ob.name, m: ob.m };
  }

  // ========================================================= §4 number format
  function group(s) { return String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmtNum(v, dec) {
    dec = dec === undefined ? 0 : dec;
    var neg = v < 0; v = Math.abs(v);
    var f = v.toFixed(dec), parts = f.split('.');
    return (neg ? '-' : '') + group(parts[0]) + (parts[1] ? '.' + parts[1] : '');
  }
  function trim(s) { return s.indexOf('.') < 0 ? s : s.replace(/\.?0+$/, ''); }
  function sig(v) { return trim(fmtNum(v, v < 10 ? 2 : v < 1000 ? 1 : 0)); }
  // Picks the unit a viewer can actually hold in their head, and never prints
  // a 13-digit number of metres. Trailing zeros are stripped, so it reads
  // "122 m" and "93 m", not "122.0 m" and "93.0 m".
  function fmtSize(m) {
    if (m < 1e4) return sig(m) + ' m';
    if (m < 1e10) return sig(m / 1000) + ' km';
    if (m < 1e15) return sig(m / AU) + ' AU';
    return sig(m / LY) + ' light-years';
  }
  function fmtTimes(k) {
    if (k >= 1e6) return fmtNum(k / 1e6, k < 1e7 ? 1 : 0) + ' MILLION';
    if (k >= 1000) return fmtNum(k, 0);
    if (k >= 100) return fmtNum(k, 0);
    return fmtNum(k, k < 10 ? 1 : 0);
  }
  // The eased value of a counter at time tl. Lands exactly on `to` at t0+dur.
  function count(tl, o) {
    o = o || {};
    var ez = easeOf(o.ease || 'outQuint');
    var k = ez(cl01((tl - (o.t0 || 0)) / (o.dur || 1.2)));
    return lrp(o.from || 0, o.to || 0, k);
  }

  // ============================================================== §5 labels
  // Label chips live in SCREEN space: the type size never changes with the
  // camera, which is the whole point. flush() resolves vertical collisions in
  // one deterministic pass so two rungs never print on top of each other.
  function labels(o) {
    o = o || {};
    var items = [], minGap = o.minGap === undefined ? 92 : o.minGap, dsize = o.size || 38;
    var rightPad = o.rightPad === undefined ? 24 : o.rightPad;      // keep clear of the gauge
    var bot = o.bottom === undefined ? FH - 78 : o.bottom;          // keep clear of the badge
    var top = o.top === undefined ? 74 : o.top;                     // keep clear of the title
    return {
      add: function (L) { if (L.rightPad === undefined) L.rightPad = rightPad; items.push(L); return this; },
      flush: function () {
        if (!items.length) return;
        var i, L, list = items.slice().sort(function (a, b) { return (a.y || 0) - (b.y || 0); });
        // downward pass, then clamp into the safe area
        for (i = 0; i < list.length; i++) {
          L = list[i]; L._y = L.ly === undefined ? L.y : L.ly;
          var gap = (L.big ? minGap * 1.35 : minGap);
          if (i && L._y - list[i - 1]._y < gap) L._y = list[i - 1]._y + gap;
        }
        for (i = list.length - 1; i >= 0; i--) { if (list[i]._y > bot) list[i]._y = bot;
          if (i && list[i]._y - list[i - 1]._y < minGap) list[i - 1]._y = list[i]._y - minGap; }
        for (i = 0; i < list.length; i++) if (list[i]._y < top) list[i]._y = top;
        for (i = 0; i < list.length; i++) chip(list[i], dsize);
        items = [];
      }
    };
  }
  function chip(L, dsize) {
    var size = L.size || dsize, sub = L.sub, side = L.side || 'right';
    var al = L.alpha === undefined ? 1 : L.alpha;
    if (al <= 0.01) return;
    var lx = L.lx === undefined ? (side === 'right' ? Math.min(FW - 40, L.x + 118) : Math.max(40, L.x - 118)) : L.lx;
    ctx.save(); ctx.globalAlpha = al;
    ctx.font = FONT(900, size);
    var tw = ctx.measureText(L.text).width;
    if (sub) { ctx.font = FONT(800, size * 0.74); tw = Math.max(tw, ctx.measureText(sub).width); }
    var pad = size * 0.44, bw = tw + pad * 2, bh = sub ? size * 2.08 : size * 1.5;
    var rp = L.rightPad === undefined ? 24 : L.rightPad;
    var bx = side === 'right' ? lx : lx - bw, by = L._y - bh / 2;
    if (bx + bw > FW - rp) bx = FW - rp - bw;
    if (bx < 24) bx = 24;
    // leader: elbow from the chip edge to the object, with a dot on the object
    var ex = side === 'right' ? bx : bx + bw, mx = side === 'right' ? (bx + L.x) / 2 : (bx + bw + L.x) / 2;
    ctx.beginPath(); ctx.moveTo(ex, L._y); ctx.lineTo(mx, L._y); ctx.lineTo(L.x, L.y);
    ctx.strokeStyle = L.lead || 'rgba(255,255,255,0.72)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
    circle(L.x, L.y, 7); ctx.fillStyle = L.dot || '#FFD24A'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    rrect(bx + 5, by + 6, bw, bh, 14); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    rrect(bx, by, bw, bh, 14);
    ctx.fillStyle = L.bg || '#FFF4DC'; ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    var tx = bx + pad;
    text(L.text, tx, sub ? by + bh * 0.33 : by + bh / 2, size, L.col || ink, 900, 'left', null);
    if (sub) text(sub, tx, by + bh * 0.72, size * 0.74, L.subCol || '#6b5f4f', 800, 'left', null);
    ctx.restore();
  }

  // =========================================================== §6 furniture
  // Backdrop, crossfaded in log(mpp): a 100 m frame gets sky and ground, a
  // 100,000 km frame gets stars. Nothing pops at the boundary.
  function backdrop(mpp, t) {
    var d = decade(mpp);                      // log10 of metres across the frame
    var spaceK = smooth(4.4, 6.4, d);         // 25 km -> 2,500 km
    var g = ctx.createLinearGradient(0, 0, 0, FH);
    g.addColorStop(0, '#9FC6E0'); g.addColorStop(0.62, '#D9E9F2'); g.addColorStop(1, '#F2E7CE');
    ctx.fillStyle = g; ctx.fillRect(0, 0, FW, FH);
    if (spaceK > 0) {
      ctx.save(); ctx.globalAlpha = spaceK;
      var sg = ctx.createRadialGradient(FW * 0.5, FH * 0.42, 120, FW * 0.5, FH * 0.42, FW * 0.85);
      sg.addColorStop(0, '#111a35'); sg.addColorStop(1, '#05060f');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, FW, FH);
      var r = rnd(37);
      for (var i = 0; i < 220; i++) {
        var x = r() * FW, y = r() * FH, tw = 0.55 + 0.45 * Math.sin((t || 0) * 1.7 + i * 1.3);
        circle(x, y, 0.7 + r() * 2.1); ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.6 * tw).toFixed(3) + ')'; ctx.fill();
      }
      ctx.restore();
    }
    return spaceK;
  }
  function ground(mpp, y, spaceK) {
    var k = 1 - (spaceK === undefined ? smooth(4.4, 6.4, decade(mpp)) : spaceK);
    if (k <= 0.01) return;
    y = y === undefined ? GY : y;
    ctx.save(); ctx.globalAlpha = k;
    ctx.fillStyle = '#B9A07E'; ctx.fillRect(0, y, FW, FH - y);
    ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FW, y); ctx.stroke();
    ctx.restore();
  }

  // Radial speed lines out of the zoom centre. `k` is 0..1 "how fast is the
  // camera moving right now"; the pattern is seeded, so it is identical on a
  // re-render of the same frame.
  function streaks(cx, cy, k, t) {
    k = cl01(k); if (k <= 0.02) return;
    var r = rnd(41), n = 54;
    ctx.save(); ctx.globalAlpha = 0.5 * k; ctx.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var a = r() * 6.283, r0 = 180 + r() * 1500, len = (120 + r() * 420) * k;
      var ph = ((t || 0) * 0.6 + r()) % 1;
      var rr = r0 + ph * 240;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      ctx.lineTo(cx + Math.cos(a) * (rr + len), cy + Math.sin(a) * (rr + len));
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.18 + 0.5 * r()).toFixed(3) + ')';
      ctx.lineWidth = 1.5 + r() * 3.5; ctx.stroke();
    }
    ctx.restore();
  }

  // Vertical logarithmic ruler: 10^0 m to 10^21 m, with a marker at the camera.
  // This is the one element that makes a 21-decade zoom legible at a glance.
  var GAUGE_MARKS = [[0, '1 m'], [3, '1 km'], [6, '1,000 km'], [9, 'Sun'], [12, '10 AU'],
                     [15, '0.1 ly'], [18, '100 ly'], [21, '100,000 ly']];
  function gauge(mpp, o) {
    o = o || {};
    var x = o.x === undefined ? FW - 108 : o.x, y0 = o.y0 === undefined ? 196 : o.y0, y1 = o.y1 === undefined ? FH - 170 : o.y1;
    var lo = o.lo === undefined ? 0 : o.lo, hi = o.hi === undefined ? 21 : o.hi;
    var at = function (d) { return lrp(y1, y0, cl01((d - lo) / (hi - lo))); };
    ctx.save();
    rrect(x - 36, y0 - 34, 72, (y1 - y0) + 68, 24); ctx.fillStyle = 'rgba(12,14,24,0.55)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; ctx.stroke();
    for (var d = lo; d <= hi; d++) {
      var yy = at(d), maj = d % 3 === 0;
      ctx.beginPath(); ctx.moveTo(x - (maj ? 17 : 8), yy); ctx.lineTo(x + (maj ? 17 : 8), yy);
      ctx.strokeStyle = 'rgba(255,255,255,' + (maj ? 0.8 : 0.35) + ')'; ctx.lineWidth = maj ? 4 : 2.5; ctx.stroke();
    }
    for (var i = 0; i < GAUGE_MARKS.length; i++) {
      var mk = GAUGE_MARKS[i]; if (mk[0] < lo || mk[0] > hi) continue;
      // outside the ruler plate, so the type never sits on the ticks
      text(mk[1], x - 48, at(mk[0]), 27, 'rgba(255,255,255,0.92)', 800, 'right', 'rgba(0,0,0,0.85)', 7);
    }
    var cd = cl(decade(mpp), lo, hi), cy = at(cd);
    circle(x, cy, 11); ctx.fillStyle = '#FFD24A'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.restore();
    // Live readout, parked above the ruler so it never lands on a tick label:
    // how much real world the frame is holding right now.
    if (o.readout !== false) {
      var txt = fmtSize(mpp * FH);
      ctx.save(); ctx.font = FONT(900, 34);
      var tw = Math.max(ctx.measureText(txt).width + 36, 220), bx = x + 36 - tw;
      rrect(bx, y0 - 108, tw, 58, 16); ctx.fillStyle = '#0d1426'; ctx.fill();
      ctx.strokeStyle = '#FFD24A'; ctx.lineWidth = 4; ctx.stroke();
      text(txt, bx + tw / 2, y0 - 79, 34, '#FFD24A', 900, 'center', null);
      text('ACROSS THE FRAME', bx + tw / 2, y0 - 128, 22, 'rgba(255,255,255,0.75)', 800, 'center', 'rgba(0,0,0,0.85)', 6);
      ctx.restore();
    }
    return cy;
  }

  // '1 km' bar, auto-picked so it lands between 110 and 430 px.
  function scaleBar(mpp, o) {
    o = o || {};
    var x = o.x === undefined ? 56 : o.x, y = o.y === undefined ? FH - 54 : o.y;
    var want = 240 * mpp, e = Math.floor(Math.log(want) / Math.LN10);
    var cands = [1, 2, 5], best = Math.pow(10, e), bd = 1e99;
    for (var k = -1; k <= 1; k++) for (var i = 0; i < 3; i++) {
      var v = cands[i] * Math.pow(10, e + k), p = v / mpp;
      if (p < 100 || p > 440) continue;
      var dd = Math.abs(p - 240); if (dd < bd) { bd = dd; best = v; }
    }
    var w = best / mpp;
    if (!isFinite(w) || w < 20) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 5; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.moveTo(x, y - 13); ctx.lineTo(x, y + 13);
    ctx.moveTo(x + w, y - 13); ctx.lineTo(x + w, y + 13); ctx.stroke();
    text(fmtSize(best), x + w / 2, y - 32, 28, '#fff', 900, 'center', 'rgba(0,0,0,0.8)', 7);
    ctx.restore();
  }

  // =============================================================== §7 ladder
  // The format. rungs ascend; the camera holds, then zooms one decade-ish per
  // beat; every earlier rung stays on screen, shrinking into the corner.
  function ladder(tl, rungs, o) {
    o = o || {};
    need();
    var n = rungs.length, t0 = o.t0 || 0, each = o.each === undefined ? 1.1 : o.each;
    var hold = o.hold === undefined ? 0.34 : o.hold, frac = o.frac === undefined ? 0.62 : o.frac;
    var gy = o.groundY === undefined ? GY : o.groundY, ez = easeOf(o.ease || 'inOutCubic');
    var t = o.t === undefined ? tl : o.t;

    // `beats` gives a rung its own number of seconds: the rule is that a rung
    // whose jump is enormous (Everest -> the Moon is 393x) needs longer than a
    // rung that only triples, or the big one flashes past as a blur.
    var iR, f, j0;
    if (o.beats && o.beats.length === n) {
      var acc = t0; iR = 0; f = 0;
      for (j0 = 0; j0 < n; j0++) {
        if (tl < acc + o.beats[j0] || j0 === n - 1) { iR = j0; f = cl01((tl - acc) / o.beats[j0]); break; }
        acc += o.beats[j0];
      }
      if (tl < t0) { iR = 0; f = 0; }
    } else { var uu = (tl - t0) / each; iR = Math.floor(uu); f = uu - iR; }
    var u = iR + f, i = cl(iR, 0, n - 1);
    var g = i >= n - 1 ? 0 : ez(cl01((f - hold) / (1 - hold)));
    // spheres and towers are framed against the frame HEIGHT, long things
    // (a bus, a whale, an island) against its WIDTH
    var axisOf = function (key) { return get(key).dim === 'w' ? 'w' : 'h'; };
    var mppOf = function (key) { return fit(get(key).m, frac, axisOf(key)); };
    var mpp = i >= n - 1 ? mppOf(rungs[n - 1]) * (1 + 0.20 * ACT.ease.outCubic(f))
                         : geo(mppOf(rungs[i]), mppOf(rungs[i + 1]), g);

    var spaceK = o.bg === false ? 0 : backdrop(mpp, t);
    if (o.bg !== false) ground(mpp, gy, spaceK);
    // Speed lines out of the zoom centre while the camera is actually moving.
    // Without them a 400x rung change leaves a near-empty frame mid-move.
    if (o.streaks !== false && i < n - 1) streaks(ORIGIN.x, gy, Math.sin(Math.PI * cl01(g)) * (g > 0 && g < 1 ? 1 : 0), t);

    // paint largest first so every earlier rung reads in front of the new one
    var hi = i >= n - 1 ? n - 1 : i + 1, boxes = {}, j;
    for (j = hi; j >= 0; j--) {
      var al = 1;
      if (j === i + 1) {
        // The arriving rung starts many frame-widths across. Fade it up by its
        // OWN pixel size, so it resolves into the frame instead of slabbing
        // over it — and never draw it while it is an off-frame wall of colour.
        var pNew = px(get(rungs[j]).m, mpp);
        al = smooth(FW * 1.15, FW * 0.85, pNew);
      }
      var b = draw(rungs[j], mpp, { x: ORIGIN.x, y: gy, alpha: al, t: t });
      if (b) boxes[rungs[j]] = b;
    }

    // ---- labels. Current rung big; the one before it stays named so the
    // viewer can see what just got dwarfed.
    var L = labels({ minGap: 96, rightPad: o.gauge === false ? 24 : 470, bottom: FH - 215, top: o.title ? 172 : 74 });
    var curKey = g > 0.55 && i < n - 1 ? rungs[i + 1] : rungs[i];
    var prevKey = g > 0.55 && i < n - 1 ? rungs[i] : (i > 0 ? rungs[i - 1] : null);
    var cb = boxes[curKey], pb = prevKey ? boxes[prevKey] : null;
    if (cb) {
      var anchorY = get(curKey).dim === 'h' ? cb.y - cb.h * 0.92 : cb.y - cb.h * 0.6;
      L.add({ x: cl(cb.cx, 60, FW - 260), y: cl(anchorY, 70, FH - 120), ly: cl(anchorY - 60, 90, FH - 150),
              text: get(curKey).name.toUpperCase(), sub: fmtSize(get(curKey).m),
              size: 46, big: true, side: cb.cx > FW * 0.55 ? 'left' : 'right', bg: '#FFD24A', dot: '#fff' });
    }
    if (pb && prevKey !== curKey) {
      L.add({ x: cl(pb.x + Math.max(6, pb.w * 0.5), 40, FW - 60), y: cl(pb.y - Math.max(8, pb.h * 0.5), 70, FH - 90),
              text: get(prevKey).name, sub: fmtSize(get(prevKey).m), size: 30,
              side: 'right', bg: '#FFF4DC', alpha: 0.96 });
    }
    L.flush();

    // ---- "x N bigger" badge: the escalation, stated. Appears on the zoom.
    if (prevKey && curKey !== prevKey) {
      var k = get(curKey).m / get(prevKey).m;
      var kin = g > 0.55 ? smooth(0.55, 0.78, g) : smooth(0.0, 0.2, f);
      if (kin > 0.02) {
        var beat = o.beats ? o.beats[i] : each;
        var sp = ACT.spring(Math.max(0, (g > 0.55 ? g - 0.55 : f) * beat * 2.2), ACT.SPRING.playful);
        badge('x ' + fmtTimes(k) + ' BIGGER', FW * 0.5, FH - 96, kin, 0.86 + 0.14 * cl01(sp));
      }
    }
    if (o.title) text(o.title, 56, 76, 44, '#fff', 900, 'left', 'rgba(0,0,0,0.8)', 10);
    if (o.gauge !== false) gauge(mpp, {});
    if (o.bar !== false) scaleBar(mpp, {});
    return { i: i, u: u, f: f, g: g, mpp: mpp, cur: curKey, prev: prevKey, boxes: boxes };
  }

  function badge(txt, x, y, alpha, sc) {
    ctx.save(); ctx.globalAlpha = cl01(alpha); ctx.translate(x, y); ctx.scale(sc || 1, sc || 1);
    ctx.font = FONT(900, 52); var w = ctx.measureText(txt).width + 64;
    rrect(-w / 2 + 6, -34 + 7, w, 68, 20); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    rrect(-w / 2, -34, w, 68, 20); ctx.fillStyle = '#C8312B'; ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 6; ctx.stroke();
    text(txt, 0, 2, 52, '#FFF4DC', 900, 'center', null);
    ctx.restore();
  }

  // ========================================================= §8 side by side
  // One mpp for the whole row: that is what makes the comparison honest.
  function sideBySide(tl, ks, o) {
    o = o || {};
    need();
    var t0 = o.t0 || 0, each = o.each === undefined ? 0.1 : o.each, frac = o.frac === undefined ? 0.72 : o.frac;
    var baseY = o.baseY === undefined ? 900 : o.baseY, gapF = o.gap === undefined ? 0.07 : o.gap;
    var sp = ACT.SPRING[o.spring || 'premium'];
    var t = o.t === undefined ? tl : o.t;

    // Local units are uniform: 1000 local units = `m` metres along the principal
    // axis, so 1 local unit = m/1000 metres on BOTH axes. That turns each art
    // box straight into a real-world width and height.
    var i, hM = [], wM = [];
    for (i = 0; i < ks.length; i++) {
      var b = get(ks[i]), per = b.m / 1000;                      // metres per local unit
      hM.push(b.box[1] * per); wM.push(b.box[0] * per);
    }
    var tallest = Math.max.apply(null, hM);
    var mpp = tallest / (FH * frac);
    // Columns, not packed shapes. Every object gets at least an equal share of
    // the row, so a wide object cannot squeeze its neighbour's label into it —
    // the overlapping-caption failure these videos die of.
    var usable = FW - 120, colMin = usable / ks.length;
    var colW = [], totalW = 0;
    for (i = 0; i < ks.length; i++) { colW.push(Math.max(colMin, wM[i] / mpp + FW * gapF)); totalW += colW[i]; }
    if (totalW > usable) {                                   // shrink the art until the row fits
      var sq = usable / totalW; mpp /= sq; totalW = 0; colW = [];
      for (i = 0; i < ks.length; i++) { colW.push(Math.max(colMin, wM[i] / mpp + FW * gapF)); totalW += colW[i]; }
    }

    if (o.bg !== false) {
      var g2 = ctx.createLinearGradient(0, 0, 0, FH);
      g2.addColorStop(0, '#20314f'); g2.addColorStop(1, '#0d1426');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, FW, FH);
      for (i = 0; i < 9; i++) { var yy = baseY - (i + 1) * (FH * frac) / 9;      // measuring grid
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(40, yy); ctx.lineTo(FW - 40, yy); ctx.stroke(); }
    }
    ctx.strokeStyle = '#FFD24A'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(40, baseY); ctx.lineTo(FW - 40, baseY); ctx.stroke();

    var x = (FW - totalW) / 2, boxes = [], tops = [];
    for (i = 0; i < ks.length; i++) {
      var d = ACT.stagger(i, ks.length, { each: each, start: t0 });
      var k = ACT.spring(tl - d, sp);
      var w = wM[i] / mpp, ox = x + (colW[i] - w) / 2, cxx = x + colW[i] / 2;
      var topY = baseY - (hM[i] / mpp) * cl(k, 0, 1.08);
      tops.push({ x: ox, w: w, cx: cxx, top: baseY - hM[i] / mpp });
      if (k > 0.004) {
        // grow from the baseline: vertical scale only, so the baseline reads
        ctx.save(); ctx.translate(ox, baseY); ctx.scale(1, cl(k, 0.001, 1.08)); ctx.translate(-ox, -baseY);
        var bx = draw(ks[i], mpp, { x: ox, y: baseY, t: t });
        ctx.restore();
        if (bx) boxes.push(bx);
      }
      if (k > 0.5) {
        var nm = get(ks[i]).short || get(ks[i]).name;
        ctx.setLineDash([10, 9]); ctx.strokeStyle = 'rgba(255,255,255,0.42)'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(ox - 10, topY); ctx.lineTo(ox + w + 10, topY); ctx.stroke(); ctx.setLineDash([]);
        text(nm, cxx, baseY + 48, 33, '#fff', 900, 'center', 'rgba(0,0,0,0.9)', 9);
        text(fmtSize(get(ks[i]).m), cxx, baseY + 92, 40, '#FFD24A', 900, 'center', 'rgba(0,0,0,0.9)', 9);
      }
      x += colW[i];
    }
    // Second beat: the row lands, then one ratio is called out, so a five-second
    // hold is not five seconds of the same frame.
    if (o.ratio) {
      var ra = ks.indexOf(o.ratio[0]), rb = ks.indexOf(o.ratio[1]);
      var rk = cl01(((tl - (o.ratioAt === undefined ? 1.8 : o.ratioAt)) / 0.45));
      if (ra >= 0 && rb >= 0 && rk > 0.01) {
        var A = tops[ra], B = tops[rb], times = get(ks[rb]).m / get(ks[ra]).m;
        ctx.save(); ctx.globalAlpha = rk;
        ctx.setLineDash([14, 11]); ctx.strokeStyle = '#FF7A3D'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(A.x - 14, A.top); ctx.lineTo(B.x + B.w + 14, A.top); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
        badge((get(ks[ra]).short || get(ks[ra]).name) + ' x ' + fmtTimes(times) + ' = ' + (get(ks[rb]).short || get(ks[rb]).name),
          FW / 2, 182, rk, 0.86 + 0.14 * cl01(ACT.spring(tl - (o.ratioAt === undefined ? 1.8 : o.ratioAt), ACT.SPRING.playful)));
      }
    }
    if (o.title) text(o.title, FW / 2, 78, 54, '#fff', 900, 'center', 'rgba(0,0,0,0.85)', 11);
    if (o.scaleBar !== false) scaleBar(mpp, { y: FH - 34 });
    return { mpp: mpp, boxes: boxes, tops: tops };
  }

  // ============================================================ §9 counter
  function counter(tl, o) {
    o = o || {};
    var v = count(tl, o), x = o.x === undefined ? FW / 2 : o.x, y = o.y === undefined ? 300 : o.y;
    var size = o.size || 170, str = (o.prefix || '') + fmtNum(v, o.dec || 0) + (o.unit ? ' ' + o.unit : '');
    var pop = ACT.spring(tl - ((o.t0 || 0) + (o.dur || 1.2)), ACT.SPRING.playful);
    var sc = 1 + 0.07 * cl01(pop) * (1 - cl01((tl - ((o.t0 || 0) + (o.dur || 1.2))) / 0.6));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    if (o.label) text(o.label, 0, -size * 0.62, 40, '#FFD24A', 900, 'center', 'rgba(0,0,0,0.85)', 9);
    text(str, 0, 0, size, o.col || '#fff', 900, 'center', ink, Math.max(10, size * 0.13));
    if (o.note) text(o.note, 0, size * 0.56, 34, 'rgba(255,255,255,0.88)', 800, 'center', 'rgba(0,0,0,0.8)', 8);
    ctx.restore();
    return v;
  }

  // Bars that grow. `log: true` when the rows span more than ~2 decades,
  // otherwise the small ones are invisible and the chart lies by omission.
  function bars(tl, rows, o) {
    o = o || {};
    var x = o.x === undefined ? 300 : o.x, y = o.y === undefined ? 560 : o.y;
    var w = o.w === undefined ? 1180 : o.w, h = o.h === undefined ? 62 : o.h, gap = o.gap === undefined ? 30 : o.gap;
    var t0 = o.t0 || 0, each = o.each === undefined ? 0.08 : o.each, dur = o.dur === undefined ? 0.9 : o.dur;
    var ez = easeOf(o.ease || 'outQuint'), i, v, maxV = o.max;
    if (!maxV) { maxV = 0; for (i = 0; i < rows.length; i++) maxV = Math.max(maxV, rows[i].value); }
    var lg = !!o.log, lmin = 0;
    if (lg) { lmin = 1e99; for (i = 0; i < rows.length; i++) if (rows[i].value > 0) lmin = Math.min(lmin, rows[i].value); lmin = Math.max(lmin / 3, 1e-9); }
    var frac = function (v) {
      if (!lg) return cl01(v / maxV);
      return cl01(Math.log(v / lmin) / Math.log(maxV / lmin));
    };
    for (i = 0; i < rows.length; i++) {
      var yy = y + i * (h + gap), k = ez((tl - (t0 + i * each)) / dur);
      if (k <= 0) continue;
      rrect(x, yy, w, h, h / 2); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill();
      var bw = Math.max(h * 0.9, w * frac(rows[i].value) * k);
      rrect(x, yy, bw, h, h / 2); ctx.fillStyle = rows[i].col || '#FFD24A'; ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.stroke();
      text(rows[i].label, x - 26, yy + h / 2, 34, '#fff', 900, 'right', 'rgba(0,0,0,0.85)', 8);
      v = rows[i].value * k;
      var vs = rows[i].note || (o.fmt ? o.fmt(v) : fmtNum(v, o.dec || 0) + (o.unit ? ' ' + o.unit : ''));
      var inside = bw > 300;
      text(vs, inside ? x + bw - 22 : x + bw + 22, yy + h / 2, 32, inside ? ink : '#fff', 900,
        inside ? 'right' : 'left', inside ? null : 'rgba(0,0,0,0.85)', 8);
    }
    // the title sits over the label gutter, left-aligned, so a long one cannot
    // run off the left edge the way a right-aligned title does
    if (o.title) text(o.title, o.titleX === undefined ? Math.max(48, x - 340) : o.titleX, y - 66, 46, '#fff', 900, 'left', 'rgba(0,0,0,0.85)', 10);
    if (lg) text('log scale', x + w, y - 60, 26, 'rgba(255,255,255,0.7)', 800, 'right', 'rgba(0,0,0,0.8)', 6);
  }

  // =============================================================== exports
  root.SCALE = {
    // camera
    cam: cam, fit: fit, px: px, metres: metres, decade: decade, geo: geo,
    ORIGIN: ORIGIN, GROUND: GY, AU: AU, LY: LY, RSUN: RSUN,
    // objects
    OBJ: OBJ, get: get, keys: keys, draw: draw, ratio: ratio,
    // shots
    ladder: ladder, sideBySide: sideBySide, badge: badge,
    // numbers
    count: count, counter: counter, bars: bars,
    fmtNum: fmtNum, fmtSize: fmtSize, fmtTimes: fmtTimes,
    // labels + furniture
    labels: labels, backdrop: backdrop, ground: ground, gauge: gauge, scaleBar: scaleBar, streaks: streaks,
    sh: sh, _need: need
  };
})(typeof window !== 'undefined' ? window : this);
