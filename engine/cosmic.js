/* ============================================================================
 * cosmic.js — COS.*  cosmic & planetary art pack for the Shak Clips engine
 * ----------------------------------------------------------------------------
 * Load AFTER engine/core.js (and after acting.js if figures are in the shot).
 * Reads core.js's `ctx` and nothing else; writes nothing back into core. Every
 * other helper it needs (prng, easing, colour maths) is local, so an engine
 * edit cannot change how a cosmic frame renders.
 *
 * EVERY FUNCTION IS A PURE FUNCTION OF ITS ARGUMENTS. No Date.now(), no rAF,
 * no Math.random, no accumulated state. All randomness comes from a seeded
 * integer prng and is CACHED AT FIRST USE per (seed, count) pair, so frame
 * 900 renders identically whether it is reached in order or alone — which is
 * what engine/render.js and engine/sheet.js rely on.
 *
 * No per-pixel work. The heaviest primitive is a starfield (fillRect for the
 * sub-2px stars, arc only for the ~12% that are big enough to need one).
 * A full 6-element cosmic frame measures 4-9 ms in headless Chromium.
 *
 * Complementary to spectacle-scale's scale.js: this file draws BODIES and
 * PHENOMENA at whatever radius you hand it. It owns no size table and no zoom
 * ladder. Give it `r` in pixels; let scale.js decide what `r` should be.
 *
 * ------------------------------------------------------------------- LIGHTING
 * One light source per frame — see the direction skill. A light is a unit
 * vector pointing FROM the surface TOWARD the light:
 *     {x, y, z}   x right, y DOWN (canvas), z toward the viewer
 * `COS.light(azDeg, elDeg)` builds one: az 0 = light from screen-right,
 * az -90 = from the top, el = how far it leans toward the camera (el 90 =
 * straight down the lens, full phase; el -90 = behind the body, a rim-lit
 * crescent). `COS.LIGHT` is the house default: high left, slightly frontal.
 * Everything that shades a sphere takes `{light}` and defaults to COS.LIGHT.
 *
 * ----------------------------------------------------------------------- API
 * §1 SKY
 *   COS.starfield(seed, o)      o: {density=1, twinkleT, parallax=0, drift=0,
 *                                   box:[x,y,w,h], alpha=1, warm=0.25, maxR}
 *   COS.nebula(seed, o)         o: {t, hues:[...], alpha=1, n=5, box}
 *   COS.milkyWay(o)             o: {y, rot=-0.22, thick=260, alpha=1, seed}
 *   COS.starTrails(seed, o)     o: {px, py, arc=1.1, n=160, rMax, alpha}
 *   COS.skyCycle(u, o)          u 0..1 of a day; paints the sky, returns a
 *                               palette {top,bot,sun,ground,ink,night}
 *   COS.vignette(k=0.5, col)    corner falloff; call last in the shot
 *   COS.glow(x, y, r, col, a)   bloom-safe soft disc (never blows to pure white)
 *
 * §2 BODIES
 *   COS.planet(x, y, r, preset, o)
 *       preset: 'earth'|'moon'|'mars'|'jupiter'|'rocky'|'gas'   (COS.PRESETS)
 *       o: {light, spin=0, tilt, clouds, rings, atmo, ink, night, terminator,
 *           shadowBy:{x,y,r}, label, alpha, glow}
 *       `spin` is in degrees of central longitude — pass `t * 6` for a slow
 *       turn. Pure in t: nothing is integrated.
 *   COS.earth(x, y, r, o)       planet('earth') + lights + clouds, and
 *       o.moon = {dist, ang, r?}  draws the Moon at a TRUE relative distance:
 *       dist is in Earth radii (60.3 = the real mean distance, see Sources),
 *       the Moon's radius defaults to 0.2727 r, and it is lit by the same light.
 *   COS.moonPhaseLight(ang)     light vector for a Moon at orbit angle `ang`
 *   COS.star(x, y, r, o)        sun/star: core, chromosphere, corona, rays
 *   COS.blackHole(x, y, r, o)   shadow + lensed photon ring (+ disc, see below)
 *   COS.accretionDisc(x, y, r, o)  half = 'back'|'front'|'both'
 *   COS.comet(x, y, o)          nucleus, coma, curved dust tail, ion tail
 *
 * §3 ORBITS & MOTION
 *   COS.orbitPath(cx, cy, a, b, rot, o)   ellipse, back half dimmed
 *   COS.orbitPos(cx, cy, a, b, rot, u)    -> {x, y, z, front}  u 0..1
 *   COS.tidalBulge(x, y, r, o)            two-bulge diagram (see Sources)
 *       o: {ang, exaggerate, lead, moonDist, moonR, arrows, arrowOffset, marks}
 *   COS.eclipse(o)                        solar or lunar geometry, or sky view
 *       o: {mode:'solar'|'lunar'|'sky', u, cover, sunX/R, earthX/R, moonX/R,
 *           beam, beamEnd}  beamEnd fades the sunlight wedge before a clip edge
 *   COS.trajectory(fn, u, o)              arc + fading trail + body at head
 *   COS.arrow(ctx, x0, y0, x1, y1, o)     one labelled force/direction arrow
 *
 * §4 PHENOMENA
 *   COS.impactFlash(x, y, u, o)   u 0..1 of the flash
 *   COS.shockwave(x, y, u, o)     expanding ring, u 0..1
 *       o: {r0, r1, thick, flat, clip:{x,y,r}}  clip it to the body it crosses,
 *       or the wave reads as a hoop floating in front of that body
 *   COS.aurora(o)                 curtains over a horizon
 *
 * All drawing restores ctx state. Nothing reads or writes globals except ctx.
 * ========================================================================= */
(function (root) {
  'use strict';

  /* ===================================================== §0 local toolbox */
  var TAU = Math.PI * 2, D2R = Math.PI / 180;
  function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
  function cl01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lp(a, b, t) { return a + (b - a) * t; }
  function sstep(a, b, x) { var t = cl01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function eOut(t) { t = cl01(t); return 1 - Math.pow(1 - t, 3); }
  function hyp(x, y) { return Math.sqrt(x * x + y * y); }
  // same shape as core's rnd(), kept local so cosmic frames never shift
  function prng(seed) {
    var a = (seed | 0) || 0x9E3779B1;
    return function () {
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // deterministic memo: build-once tables keyed by a string. Filled on the
  // first frame that needs them and identical for every frame after.
  var CACHE = {};
  function memo(key, build) { var v = CACHE[key]; if (v === undefined) { v = CACHE[key] = build(); } return v; }

  function rgb(c) {
    if (c == null) return [255, 255, 255];
    if (typeof c !== 'string') return c;
    if (c.charAt(0) === '#') {
      var h = c.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    var m = c.match(/[\d.]+/g) || [0, 0, 0];
    return [+m[0] | 0, +m[1] | 0, +m[2] | 0];
  }
  function rgba(c, a) { var p = rgb(c); return 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + (Math.round(cl01(a) * 1000) / 1000) + ')'; }
  function sh(c, k) {
    var p = rgb(c), f = function (v) { return cl(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255); };
    return 'rgb(' + f(p[0]) + ',' + f(p[1]) + ',' + f(p[2]) + ')';
  }
  function mix(c1, c2, t) {
    var a = rgb(c1), b = rgb(c2);
    return 'rgb(' + Math.round(lp(a[0], b[0], t)) + ',' + Math.round(lp(a[1], b[1], t)) + ',' + Math.round(lp(a[2], b[2], t)) + ')';
  }
  function C() {
    if (typeof ctx === 'undefined') throw new Error('cosmic.js: load engine/core.js first');
    return ctx;
  }
  function CW() { return typeof W !== 'undefined' ? W : 1920; }
  function CH() { return typeof H !== 'undefined' ? H : 1080; }

  function arcPath(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }
  function radial(g, x0, y0, r0, x1, y1, r1, stops) {
    var gr = g.createRadialGradient(x0, y0, r0, x1, y1, r1);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(cl01(stops[i][0]), stops[i][1]);
    return gr;
  }
  function linear(g, x0, y0, x1, y1, stops) {
    var gr = g.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(cl01(stops[i][0]), stops[i][1]);
    return gr;
  }

  /* ----------------------------------------------------------- light vectors */
  function light(azDeg, elDeg) {
    var az = (azDeg || 0) * D2R, el = (elDeg || 0) * D2R, ce = Math.cos(el);
    return { x: Math.cos(az) * ce, y: Math.sin(az) * ce, z: Math.sin(el) };
  }
  var LIGHT = light(-155, 18);            // house default: high screen-left, barely frontal
  function normLight(L) {
    if (L == null) return LIGHT;
    if (typeof L === 'number') return light(L / D2R, 0);
    var m = Math.sqrt(L.x * L.x + L.y * L.y + (L.z || 0) * (L.z || 0)) || 1;
    return { x: L.x / m, y: L.y / m, z: (L.z || 0) / m };
  }

  /* =========================================================== §1 SKY ===== */

  // ---- starfield -----------------------------------------------------------
  // Stars live in a unit box and are scaled to `box` so parallax and drift are
  // a transform, not a rebuild. Built once per (seed, n).
  function starTable(seed, n) {
    return memo('stars:' + seed + ':' + n, function () {
      var r = prng(seed), out = new Array(n);
      for (var i = 0; i < n; i++) {
        // r^1.7 biases toward small stars; a few big ones carry the frame
        var m = Math.pow(r(), 1.7);
        out[i] = {
          x: r(), y: r(),
          s: m,                               // 0..1 magnitude
          w: r(),                             // warm/cool mix
          ph: r() * TAU,                      // twinkle phase
          tw: 0.5 + r() * 1.6,                // twinkle rate
          d: 0.25 + r() * 1.0                 // parallax depth
        };
      }
      // bright stars last so they paint over the dust
      out.sort(function (a, b) { return a.s - b.s; });
      return out;
    });
  }
  function starfield(seed, o) {
    o = o || {}; var g = C();
    var box = o.box || [0, 0, CW(), CH()];
    var n = Math.round((o.density === undefined ? 1 : o.density) * 760);
    if (n < 1) return;
    var tab = starTable(seed === undefined ? 7 : seed, n);
    var tw = o.twinkleT, px = o.parallax || 0, py = o.parallaxY || 0, dr = o.drift || 0;
    var A = o.alpha === undefined ? 1 : o.alpha, warm = o.warm === undefined ? 0.25 : o.warm;
    var maxR = o.maxR === undefined ? 2.9 : o.maxR;
    var bx = box[0], by = box[1], bw = box[2], bh = box[3];
    g.save();
    for (var i = 0; i < n; i++) {
      var st = tab[i];
      var sx = bx + ((st.x + dr * st.d * 0.03 + px * st.d / bw) % 1 + 1) % 1 * bw;
      var sy = by + ((st.y + py * st.d / bh) % 1 + 1) % 1 * bh;
      var tk = tw === undefined ? 1 : 0.62 + 0.38 * Math.sin(tw * st.tw + st.ph);
      var a = A * (0.16 + 0.84 * st.s) * tk;
      if (a < 0.02) continue;
      var rr = 0.55 + st.s * st.s * maxR;
      // colour: most stars neutral, a slice warm, a slice blue-white
      var col = st.w < warm ? '#ffd9a8' : st.w > 1 - warm * 0.7 ? '#bcd6ff' : '#ffffff';
      if (rr < 1.6) {
        g.fillStyle = rgba(col, a * 0.9);
        g.fillRect(sx - rr * 0.5, sy - rr * 0.5, rr * 1.35, rr * 1.35);
      } else {
        // big stars get a halo + a 4-point flare so they read as stars, not dots
        g.fillStyle = radial(g, sx, sy, 0, sx, sy, rr * 4.2, [[0, rgba(col, a * 0.5)], [0.32, rgba(col, a * 0.12)], [1, rgba(col, 0)]]);
        g.fillRect(sx - rr * 4.2, sy - rr * 4.2, rr * 8.4, rr * 8.4);
        arcPath(g, sx, sy, rr * 0.85); g.fillStyle = rgba(col, Math.min(0.95, a)); g.fill();
        if (st.s > 0.82) {
          g.strokeStyle = rgba(col, a * 0.30); g.lineWidth = 1.2; g.lineCap = 'round';
          var fl = rr * 5.0 * tk;
          g.beginPath(); g.moveTo(sx - fl, sy); g.lineTo(sx + fl, sy);
          g.moveTo(sx, sy - fl * 0.72); g.lineTo(sx, sy + fl * 0.72); g.stroke();
        }
      }
    }
    g.restore();
  }

  // ---- nebula / galaxy wash ------------------------------------------------
  var NEB_HUES = ['#2b3f8f', '#6c2f8a', '#1f6f86', '#8a3a52'];
  function nebula(seed, o) {
    o = o || {}; var g = C();
    var box = o.box || [0, 0, CW(), CH()];
    var hues = o.hues || NEB_HUES, n = o.n || 5, A = o.alpha === undefined ? 1 : o.alpha;
    var t = o.t || 0;
    var tab = memo('neb:' + seed + ':' + n, function () {
      var r = prng(seed), out = [];
      for (var i = 0; i < n; i++) out.push({ x: r(), y: r(), r: 0.22 + r() * 0.45, h: Math.floor(r() * 999), e: 0.45 + r() * 0.7, rot: r() * Math.PI, ph: r() * TAU });
      return out;
    });
    g.save();
    g.beginPath(); g.rect(box[0], box[1], box[2], box[3]); g.clip();
    for (var i = 0; i < tab.length; i++) {
      var b = tab[i];
      var cx = box[0] + b.x * box[2], cy = box[1] + b.y * box[3];
      var rr = b.r * Math.max(box[2], box[3]) * 0.62;
      var col = hues[b.h % hues.length];
      var br = 0.85 + 0.15 * Math.sin(t * 0.21 + b.ph);     // very slow, not a pulse
      g.save(); g.translate(cx, cy); g.rotate(b.rot); g.scale(1, b.e);
      g.fillStyle = radial(g, 0, 0, 0, 0, 0, rr, [
        [0, rgba(col, 0.26 * A * br)], [0.32, rgba(col, 0.15 * A * br)],
        [0.66, rgba(col, 0.055 * A * br)], [1, rgba(col, 0)]]);
      g.fillRect(-rr, -rr, rr * 2, rr * 2);
      g.restore();
    }
    g.restore();
  }

  // ---- Milky Way band ------------------------------------------------------
  function milkyWay(o) {
    o = o || {}; var g = C();
    var y = o.y === undefined ? CH() * 0.42 : o.y, rot = o.rot === undefined ? -0.22 : o.rot;
    var th = o.thick || 260, A = o.alpha === undefined ? 1 : o.alpha, seed = o.seed === undefined ? 31 : o.seed;
    var L = CW() * 1.6;
    g.save(); g.translate(CW() * 0.5, y); g.rotate(rot);
    // Core glow: three stacked bands, narrowing and warming inward. Keep the
    // edges cool blue and the core warm — a band of flat grey is the single
    // thing that makes a night sky look cheap.
    g.fillStyle = linear(g, 0, -th, 0, th, [
      [0, rgba('#132051', 0)], [0.22, rgba('#28408f', 0.3 * A)],
      [0.5, rgba('#8fa8e8', 0.26 * A)], [0.78, rgba('#28408f', 0.3 * A)], [1, rgba('#132051', 0)]]);
    g.fillRect(-L / 2, -th, L, th * 2);
    g.fillStyle = linear(g, 0, -th * 0.5, 0, th * 0.5, [
      [0, rgba('#cdd9ff', 0)], [0.5, rgba('#dfe6ff', 0.2 * A)], [1, rgba('#cdd9ff', 0)]]);
    g.fillRect(-L / 2, -th * 0.5, L, th);
    g.fillStyle = linear(g, 0, -th * 0.24, 0, th * 0.24, [
      [0, rgba('#f0dcb4', 0)], [0.5, rgba('#f8ead0', 0.22 * A)], [1, rgba('#f0dcb4', 0)]]);
    g.fillRect(-L / 2, -th * 0.24, L, th * 0.48);
    // the bulge, off to one side, warm and distinctly brighter
    g.save(); g.translate(-L * 0.14, 0); g.scale(th * 2.1, th * 1.3);
    g.fillStyle = radial(g, 0, 0, 0, 0, 0, 1, [
      [0, rgba('#ffeccd', 0.26 * A)], [0.3, rgba('#f2d8a8', 0.14 * A)], [0.7, rgba('#d8c49c', 0.04 * A)], [1, rgba('#d8c49c', 0)]]);
    g.fillRect(-1, -1, 2, 2);
    g.restore();
    // dust lanes: dark ellipses strung along the band. Deep darks, not grey.
    var lanes = memo('mw:' + seed, function () {
      var r = prng(seed), out = [];
      // Lanes run ALONG the band and are far wider than they are tall. Round
      // dark blobs read as smudges on the lens, not as dust in the galaxy.
      for (var i = 0; i < 20; i++) out.push({ u: r(), v: (r() - 0.5) * 0.6, w: 0.12 + r() * 0.3, h: 0.07 + r() * 0.2, a: 0.35 + r() * 0.65, rot: (r() - 0.5) * 0.16 });
      return out;
    });
    for (var i = 0; i < lanes.length; i++) {
      var d = lanes[i], lx = (d.u - 0.5) * L * 0.92, ly = d.v * th;
      var rw = d.w * L * 0.5, rh = d.h * th * 0.75;
      // gradients are created in the CURRENT transform, so the scale goes on
      // before createRadialGradient, not after
      g.save(); g.translate(lx, ly); g.rotate(d.rot); g.scale(rw, rh);
      g.fillStyle = radial(g, 0, 0, 0, 0, 0, 1, [
        [0, rgba('#02030a', 0.72 * d.a * A)], [0.5, rgba('#02030a', 0.4 * d.a * A)], [1, rgba('#02030a', 0)]]);
      g.fillRect(-1, -1, 2, 2);
      g.restore();
    }
    g.restore();
    // a denser star dusting inside the band
    g.save(); g.translate(CW() * 0.5, y); g.rotate(rot);
    var dust = memo('mwd:' + seed, function () {
      var r = prng(seed + 11), out = [];
      for (var i = 0; i < 780; i++) {
        var v = (r() + r() + r() - 1.5) / 1.5;    // centre-weighted
        out.push({ u: r(), v: v, s: Math.pow(r(), 2.2), w: r() });
      }
      return out;
    });
    for (var j = 0; j < dust.length; j++) {
      var s2 = dust[j];
      var sx = (s2.u - 0.5) * L * 0.95, sy = s2.v * th * 0.72;
      var a = A * (0.1 + 0.6 * s2.s);
      g.fillStyle = rgba(s2.w < 0.22 ? '#ffe2b8' : '#ffffff', a);
      var rr = 0.7 + s2.s * 1.5;
      g.fillRect(sx, sy, rr, rr);
    }
    g.restore();
  }

  // ---- long-exposure star trails ------------------------------------------
  function starTrails(seed, o) {
    o = o || {}; var g = C();
    var px = o.px === undefined ? CW() * 0.72 : o.px, py = o.py === undefined ? CH() * 0.2 : o.py;
    var arc = o.arc === undefined ? 1.1 : o.arc, n = o.n || 170;
    var rMax = o.rMax || Math.max(CW(), CH()) * 1.05, A = o.alpha === undefined ? 1 : o.alpha;
    var tab = memo('trail:' + seed + ':' + n, function () {
      var r = prng(seed), out = [];
      for (var i = 0; i < n; i++) out.push({ r: Math.pow(r(), 0.55), a: r() * TAU, m: Math.pow(r(), 1.8), w: r() });
      return out;
    });
    g.save(); g.lineCap = 'round';
    for (var i = 0; i < tab.length; i++) {
      var s = tab[i], rr = 0.05 * rMax + s.r * rMax * 0.95;
      var col = s.w < 0.2 ? '#ffd3a0' : s.w > 0.88 ? '#bdd6ff' : '#ffffff';
      var a0 = s.a, a1 = s.a + arc;
      // the trail dims toward its tail: three sub-arcs, bright end last
      for (var k = 0; k < 3; k++) {
        var u0 = k / 3, u1 = (k + 1) / 3;
        g.beginPath(); g.arc(px, py, rr, lp(a0, a1, u0), lp(a0, a1, u1));
        g.strokeStyle = rgba(col, A * (0.07 + 0.5 * s.m) * (0.35 + 0.65 * u1));
        g.lineWidth = 1.1 + s.m * 2.4; g.stroke();
      }
      // the head is a point, so the eye knows which way time ran
      if (s.m > 0.55) {
        var hx = px + Math.cos(a1) * rr, hy = py + Math.sin(a1) * rr;
        arcPath(g, hx, hy, 1.1 + s.m * 1.9); g.fillStyle = rgba(col, A * 0.9); g.fill();
      }
    }
    g.restore();
  }

  // ---- a sky that cycles ---------------------------------------------------
  // u 0..1 = fraction of a day, 0 = midnight, 0.25 = dawn, 0.5 = noon, 0.75 = dusk.
  var SKY_KEYS = [
    { u: 0.00, top: '#05070f', bot: '#0d1430', sun: '#1a2347', ground: '#0b1020', night: 1 },
    { u: 0.19, top: '#101a3c', bot: '#3d2b4e', sun: '#6b3f5a', ground: '#1a1626', night: 0.8 },
    { u: 0.27, top: '#2f4a84', bot: '#e8976a', sun: '#ffd79a', ground: '#3b2f33', night: 0.28 },
    { u: 0.34, top: '#5b8fd0', bot: '#f6d9a8', sun: '#fff0c8', ground: '#7a6a52', night: 0.05 },
    { u: 0.50, top: '#3f86d6', bot: '#bfe0f2', sun: '#ffffff', ground: '#9c9074', night: 0 },
    { u: 0.66, top: '#5b8fd0', bot: '#f6d9a8', sun: '#fff0c8', ground: '#7a6a52', night: 0.05 },
    { u: 0.73, top: '#2f4a84', bot: '#e8833f', sun: '#ffc278', ground: '#3b2f33', night: 0.28 },
    { u: 0.81, top: '#101a3c', bot: '#47283f', sun: '#5e3350', ground: '#1a1626', night: 0.8 },
    { u: 1.00, top: '#05070f', bot: '#0d1430', sun: '#1a2347', ground: '#0b1020', night: 1 }
  ];
  function skyPalette(u) {
    u = ((u % 1) + 1) % 1;
    var i = 0; while (i < SKY_KEYS.length - 2 && SKY_KEYS[i + 1].u <= u) i++;
    var a = SKY_KEYS[i], b = SKY_KEYS[i + 1], k = sstep(a.u, b.u, u);
    return {
      top: mix(a.top, b.top, k), bot: mix(a.bot, b.bot, k), sun: mix(a.sun, b.sun, k),
      ground: mix(a.ground, b.ground, k), night: lp(a.night, b.night, k), u: u
    };
  }
  function skyCycle(u, o) {
    o = o || {}; var g = C(); var P = skyPalette(u);
    var h = o.h === undefined ? CH() : o.h;
    g.save();
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, P.top], [0.62, mix(P.top, P.bot, 0.72)], [1, P.bot]]);
    g.fillRect(-200, -200, CW() + 400, h + 400);
    if (o.stars !== false && P.night > 0.06) {
      starfield(o.starSeed === undefined ? 19 : o.starSeed, { density: 0.8, twinkleT: o.t, alpha: P.night, box: [0, 0, CW(), h * 0.92], maxR: 2.4 });
    }
    if (o.sun !== false) {
      // the light source itself rides an arc, so the frame says which way time ran
      var ang = (P.u - 0.25) * TAU, hx = CW() * 0.5 - Math.cos(ang) * CW() * 0.44, hy = h * 0.82 + Math.sin(ang) * h * 0.74;
      glow(hx, hy, o.sunR || 190, P.sun, 0.55 * (1 - P.night * 0.7) + 0.12);
      arcPath(g, hx, hy, (o.sunR || 190) * 0.26); g.fillStyle = rgba(P.sun, 0.92); g.fill();
      P.sunX = hx; P.sunY = hy;
    }
    g.restore();
    return P;
  }

  // ---- utility overlays ----------------------------------------------------
  function vignette(k, col) {
    var g = C(), K = k === undefined ? 0.5 : k, w = CW(), h = CH();
    g.save();
    g.fillStyle = radial(g, w / 2, h / 2, Math.min(w, h) * 0.34, w / 2, h / 2, Math.max(w, h) * 0.82,
      [[0, rgba(col || '#000308', 0)], [0.62, rgba(col || '#000308', 0.2 * K)], [1, rgba(col || '#000308', 0.86 * K)]]);
    g.fillRect(0, 0, w, h);
    g.restore();
  }
  // Bloom-safe: the brightest stop is the colour at alpha, never white at 1,
  // so a stack of glows cannot clip to a flat white blob in the h264 encode.
  function glow(x, y, r, col, a) {
    var g = C(), A = a === undefined ? 0.5 : a, cc = col || '#ffd9a0';
    g.save();
    g.fillStyle = radial(g, x, y, 0, x, y, r, [
      [0, rgba(cc, Math.min(0.88, A))], [0.18, rgba(cc, A * 0.52)],
      [0.44, rgba(cc, A * 0.2)], [0.72, rgba(cc, A * 0.06)], [1, rgba(cc, 0)]]);
    g.fillRect(x - r, y - r, r * 2, r * 2);
    g.restore();
  }

  /* ======================================================== §2 BODIES ===== */

  // orthographic projection of (lat, lon) in degrees onto a disc of radius r.
  // lon0 = central longitude (the spin), tilt = central latitude in radians.
  // returns [x, y, z]; z > 0 is the near hemisphere.
  function ortho(r, lat, lon, lon0, tilt) {
    var la = lat * D2R, lo = (lon - lon0) * D2R, ct = Math.cos(tilt || 0), st = Math.sin(tilt || 0);
    var cla = Math.cos(la), sla = Math.sin(la), clo = Math.cos(lo), slo = Math.sin(lo);
    return [r * cla * slo, -r * (sla * ct - cla * st * clo), sla * st + cla * ct * clo];
  }
  // Project a lat/lon polygon. Points on the far side are pushed out to the
  // limb (cheap, and invisible once the path is clipped to the disc).
  function projPoly(r, pts, lon0, tilt) {
    var any = false, res = new Array(pts.length);
    for (var i = 0; i < pts.length; i++) {
      var p = ortho(r, pts[i][1], pts[i][0], lon0, tilt);
      if (p[2] > 0) any = true;
      else { var m = hyp(p[0], p[1]) || 1; p[0] = p[0] / m * r; p[1] = p[1] / m * r; }
      res[i] = p;
    }
    return any ? res : null;
  }
  function polyPath(g, pts) {
    g.beginPath();
    for (var i = 0; i < pts.length; i++) { if (i) g.lineTo(pts[i][0], pts[i][1]); else g.moveTo(pts[i][0], pts[i][1]); }
    g.closePath();
  }

  /* ---- the terminator ------------------------------------------------------
   * The day/night boundary on a sphere is the great circle of surface normals
   * perpendicular to the light. Orthographically it projects to an ellipse
   * whose minor axis is r*|L.z| along the light's in-plane direction. This
   * builds the NIGHT region: the visible half of that terminator, then the
   * limb back round the dark side. Exact for every light direction, including
   * a light straight down the lens (full phase) or dead behind (thin crescent).
   */
  function nightPath(g, cx, cy, r, L, grow) {
    var s = hyp(L.x, L.y);
    if (s < 1e-5) { L = { x: 1e-5, y: 0, z: L.z >= 0 ? 1 : -1 }; s = 1e-5; }
    var R = r * (1 + (grow || 0));
    var e1x = L.y / s, e1y = -L.x / s;              // on the limb, z = 0
    var e2x = -L.z * L.x / s, e2y = -L.z * L.y / s; // the visible half of the terminator
    var N = 44, i, w;
    g.beginPath();
    for (i = 0; i <= N; i++) {
      w = Math.PI * i / N;
      var c = Math.cos(w), sn = Math.sin(w);
      var px = cx + R * (e1x * c + e2x * sn), py = cy + R * (e1y * c + e2y * sn);
      if (i) g.lineTo(px, py); else g.moveTo(px, py);
    }
    var a0 = Math.atan2(-e1y, -e1x);                 // limb point at w = PI
    for (i = 1; i <= N; i++) { var a = a0 + Math.PI * i / N; g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); }
    g.closePath();
  }

  // Shade a disc as a sphere: subsolar rolloff, limb darkening, soft terminator.
  // Call AFTER the surface is painted and still clipped to the disc.
  function sphereShade(cx, cy, r, L, o) {
    var g = C(); o = o || {};
    var soft = o.soft === undefined ? 0.18 : o.soft;
    var nightCol = o.nightCol || '#060a14';
    var nightA = o.nightA === undefined ? 0.94 : o.nightA;
    var s = hyp(L.x, L.y) || 1e-5;
    var dx = L.x / s, dy = L.y / s;
    // 1. the lit side falls off from the subsolar point
    g.save();
    g.fillStyle = radial(g, cx + dx * r * 0.62, cy + dy * r * 0.62, 0, cx + dx * r * 0.2, cy + dy * r * 0.2, r * 1.5,
      [[0, rgba('#ffffff', 0.2 * (o.spec === undefined ? 1 : o.spec))], [0.3, rgba('#ffffff', 0.07)], [0.62, rgba('#ffffff', 0)], [1, rgba('#000000', 0)]]);
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
    // 2. limb darkening — the single thing that stops a planet reading as a sticker
    g.fillStyle = radial(g, cx, cy, r * 0.55, cx, cy, r,
      [[0, rgba(nightCol, 0)], [0.55, rgba(nightCol, 0.1)], [0.85, rgba(nightCol, 0.3)], [1, rgba(nightCol, 0.62)]]);
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
    // 3. night side, fading in from the terminator over `soft` of the radius
    nightPath(g, cx, cy, r, L, 0.004);
    g.save(); g.clip();
    var g0x = cx - dx * r * soft * 0.9, g0y = cy - dy * r * soft * 0.9;
    g.fillStyle = linear(g, g0x, g0y, cx - dx * r * 1.18, cy - dy * r * 1.18, [
      [0, rgba(nightCol, 0)], [cl01(soft * 0.9), rgba(nightCol, nightA * 0.72)],
      [cl01(soft * 2.1 + 0.08), rgba(nightCol, nightA * 0.95)], [1, rgba(nightCol, nightA)]]);
    g.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);
    g.restore();
    g.restore();
  }

  // Atmosphere: an outer halo plus a bright crescent on the lit limb, drawn as
  // 56 short arcs weighted by cos(angle to the light).
  function atmoRim(cx, cy, r, L, o) {
    var g = C(); o = o || {};
    var col = o.col || '#7fb6ff', A = o.alpha === undefined ? 1 : o.alpha;
    var thick = o.thick === undefined ? 0.1 : o.thick;
    var halo = o.halo === undefined ? 0.5 : o.halo;
    g.save();
    // outer halo — visible all round, so the body never has a cut-out edge
    g.fillStyle = radial(g, cx, cy, r * 0.96, cx, cy, r * (1 + thick * 2.6),
      [[0, rgba(col, 0.30 * A * halo)], [0.3, rgba(col, 0.14 * A * halo)], [1, rgba(col, 0)]]);
    g.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4);
    // lit crescent
    var phi = Math.atan2(L.y, L.x), N = 56, lw = r * thick;
    g.lineCap = 'butt';
    for (var i = 0; i < N; i++) {
      var a0 = i / N * TAU, a1 = (i + 1.25) / N * TAU;
      var d = Math.cos((a0 + a1) / 2 - phi);
      if (d <= 0.02) continue;
      var k = Math.pow(d, 1.35);
      g.beginPath(); g.arc(cx, cy, r - lw * 0.26, a0, a1);
      g.lineWidth = lw; g.strokeStyle = rgba(col, cl01(0.78 * k * A)); g.stroke();
      g.beginPath(); g.arc(cx, cy, r - lw * 0.05, a0, a1);
      g.lineWidth = lw * 0.4; g.strokeStyle = rgba(o.hot || '#dff0ff', cl01(0.55 * k * A)); g.stroke();
    }
    g.restore();
  }

  /* ------------------------------------------------- surface: latitude bands */
  function latBandPath(g, r, lat1, lat2, lon0, tilt) {
    var N = 26, i, pts = [];
    for (i = 0; i <= N; i++) pts.push(ortho(r, lat1, lon0 - 90 + 180 * i / N, lon0, tilt));
    for (i = N; i >= 0; i--) pts.push(ortho(r, lat2, lon0 - 90 + 180 * i / N, lon0, tilt));
    polyPath(g, pts);
  }
  function gasBands(cx, cy, r, pal, spin, tilt, seed, warp) {
    var g = C();
    var tab = memo('gas:' + seed, function () {
      var rr = prng(seed), out = [], lat = -88;
      while (lat < 88) {
        var h = 5 + rr() * 13;
        out.push({ a: lat, b: Math.min(88, lat + h), c: Math.floor(rr() * 997), v: rr(), j: rr() * TAU });
        lat += h;
      }
      return out;
    });
    g.save(); g.translate(cx, cy);
    for (var i = 0; i < tab.length; i++) {
      var b = tab[i];
      var col = pal[b.c % pal.length];
      // bands wobble a little in latitude: the edges are turbulent, not ruled
      var wob = (warp || 0) * Math.sin(b.j + (warp || 0) * 0.0);
      latBandPath(g, r, b.a + wob, b.b + wob, spin, tilt);
      g.fillStyle = col; g.fill();
      // a shading lip along the band's equator-facing edge gives it relief
      latBandPath(g, r, b.a + wob, lp(b.a, b.b, 0.28) + wob, spin, tilt);
      g.fillStyle = rgba('#000000', 0.07 + b.v * 0.07); g.fill();
      latBandPath(g, r, lp(b.a, b.b, 0.74) + wob, b.b + wob, spin, tilt);
      g.fillStyle = rgba('#ffffff', 0.04 + b.v * 0.05); g.fill();
    }
    g.restore();
  }
  // oval storms riding a band (the Great Red Spot and its small cousins)
  function storm(cx, cy, r, lat, lon, w, h, col, spin, tilt) {
    var g = C(), p = ortho(r, lat, lon, spin, tilt);
    if (p[2] <= 0.04) return;
    var fore = Math.max(0.1, p[2]);                 // squash toward the limb
    var rot = Math.atan2(p[1], p[0]) * 0.0;
    g.save(); g.translate(cx + p[0], cy + p[1]); g.rotate(rot);
    g.scale(fore, 1);
    g.beginPath(); g.ellipse(0, 0, r * w, r * h, 0, 0, TAU);
    g.fillStyle = col; g.fill();
    g.beginPath(); g.ellipse(0, 0, r * w * 0.62, r * h * 0.6, 0, 0, TAU);
    g.fillStyle = rgba('#ffffff', 0.13); g.fill();
    g.beginPath(); g.ellipse(0, 0, r * w, r * h, 0, 0, TAU);
    g.strokeStyle = rgba('#000000', 0.14); g.lineWidth = Math.max(1, r * 0.012); g.stroke();
    g.restore();
  }

  /* ----------------------------------------------------- surface: cratering */
  function craterTable(seed, n) {
    return memo('crat:' + seed + ':' + n, function () {
      var r = prng(seed), out = [];
      for (var i = 0; i < n; i++) {
        var lat = Math.asin(r() * 2 - 1) / D2R;
        out.push({ lat: lat, lon: r() * 360 - 180, s: Math.pow(r(), 2.4), v: r(), ring: r() });
      }
      out.sort(function (a, b) { return a.s - b.s; });
      return out;
    });
  }
  function craters(cx, cy, r, L, seed, n, o) {
    var g = C(); o = o || {};
    var tab = craterTable(seed, n), spin = o.spin || 0, tilt = o.tilt || 0;
    var dark = o.dark || '#4a4238', litc = o.lit || '#cfc6b4', big = o.big === undefined ? 0.1 : o.big;
    var s = hyp(L.x, L.y) || 1e-5, dx = L.x / s, dy = L.y / s;
    g.save(); g.translate(cx, cy);
    for (var i = 0; i < tab.length; i++) {
      var c = tab[i], p = ortho(r, c.lat, c.lon, spin, tilt);
      if (p[2] <= 0.06) continue;
      var rr = r * (0.008 + c.s * big) * (0.35 + 0.65 * p[2]);
      if (rr < 1.2) continue;
      var fore = Math.max(0.12, p[2]);
      g.save(); g.translate(p[0], p[1]);
      // floor
      g.beginPath(); g.ellipse(0, 0, rr * fore, rr, Math.atan2(p[1], p[0]), 0, TAU);
      g.fillStyle = rgba(dark, 0.3 + c.v * 0.3); g.fill();
      // the rim catches the light on the sunward side and shadows opposite:
      // this is what makes a grey disc read as rock instead of felt
      g.save();
      g.beginPath(); g.ellipse(0, 0, rr * fore * 1.1, rr * 1.1, Math.atan2(p[1], p[0]), 0, TAU); g.clip();
      g.fillStyle = rgba(litc, 0.42 + c.v * 0.3);
      g.beginPath(); g.ellipse(dx * rr * 0.26, dy * rr * 0.26, rr * fore, rr, Math.atan2(p[1], p[0]), 0, TAU); g.fill();
      g.fillStyle = rgba(dark, 0.5);
      g.beginPath(); g.ellipse(dx * rr * 0.42, dy * rr * 0.42, rr * fore * 0.8, rr * 0.8, Math.atan2(p[1], p[0]), 0, TAU); g.fill();
      g.restore();
      // ejecta ray for the few biggest
      if (c.s > 0.86 && c.ring > 0.45) {
        g.beginPath(); g.ellipse(0, 0, rr * fore * 2.5, rr * 2.5, Math.atan2(p[1], p[0]), 0, TAU);
        g.fillStyle = rgba(litc, 0.07); g.fill();
      }
      g.restore();
    }
    g.restore();
  }
  // broad albedo blotches: maria, dust seas, terrain change
  function blotches(cx, cy, r, seed, n, col, alpha, o) {
    var g = C(); o = o || {};
    var spin = o.spin || 0, tilt = o.tilt || 0;
    var tab = memo('blot:' + seed + ':' + n, function () {
      var rr = prng(seed), out = [];
      for (var i = 0; i < n; i++) out.push({ lat: (rr() * 2 - 1) * 70, lon: rr() * 360 - 180, w: 0.08 + rr() * 0.26, h: 0.06 + rr() * 0.2, a: 0.4 + rr() * 0.6, rot: rr() * Math.PI });
      return out;
    });
    g.save(); g.translate(cx, cy);
    for (var i = 0; i < tab.length; i++) {
      var b = tab[i], p = ortho(r, b.lat, b.lon, spin, tilt);
      if (p[2] <= 0.02) continue;
      var fore = Math.max(0.1, p[2]);
      g.save(); g.translate(p[0], p[1]); g.rotate(Math.atan2(p[1], p[0]) + b.rot * 0.2); g.scale(fore, 1);
      g.fillStyle = radial(g, 0, 0, 0, 0, 0, 1, [[0, rgba(col, alpha * b.a)], [0.6, rgba(col, alpha * b.a * 0.7)], [1, rgba(col, 0)]]);
      g.save(); g.scale(r * b.w, r * b.h); g.fillRect(-1, -1, 2, 2); g.restore();
      g.restore();
    }
    g.restore();
  }

  /* --------------------------------------------------- surface: Earth itself */
  // Coarse continent outlines in [lon, lat]. Deliberately low-poly: at 300-500
  // px across this reads as Earth, and it costs ~200 lineTo per frame.
  var LAND = {
    africa: [[-17, 14], [-6, 5], [9, 4], [9, -1], [13, -5], [12, -17], [15, -28], [20, -35], [27, -34], [32, -26], [36, -21], [40, -16], [40, -10], [43, -2], [51, 12], [43, 12], [37, 15], [34, 28], [32, 31], [25, 32], [10, 37], [-6, 36], [-10, 28], [-17, 21]],
    eurasia: [[-9, 43], [-2, 51], [2, 51], [8, 54], [12, 56], [8, 58], [10, 63], [20, 70], [30, 70], [33, 67], [40, 67], [50, 68], [60, 70], [70, 72], [80, 73], [100, 76], [120, 74], [140, 73], [160, 70], [180, 72], [180, 66], [170, 66], [160, 61], [150, 59], [140, 53], [135, 45], [130, 43], [128, 35], [122, 37], [122, 31], [117, 23], [108, 21], [109, 11], [104, 10], [100, 13], [98, 16], [92, 22], [88, 21], [80, 13], [77, 8], [72, 20], [68, 25], [62, 38], [55, 42], [48, 45], [45, 42], [37, 45], [30, 45], [28, 41], [24, 41], [19, 40], [14, 45], [8, 44], [3, 43], [0, 43]],
    namerica: [[-168, 65], [-160, 70], [-150, 70], [-130, 69], [-120, 70], [-100, 69], [-85, 70], [-80, 74], [-65, 66], [-60, 56], [-55, 52], [-66, 45], [-70, 42], [-74, 39], [-76, 35], [-81, 31], [-80, 25], [-84, 30], [-90, 29], [-95, 29], [-97, 26], [-95, 18], [-90, 20], [-87, 21], [-92, 16], [-105, 20], [-110, 24], [-114, 28], [-117, 33], [-122, 37], [-124, 43], [-125, 49], [-133, 55], [-145, 60], [-152, 59], [-158, 56], [-165, 60]],
    samerica: [[-78, 2], [-75, 10], [-66, 11], [-60, 8], [-52, 5], [-50, 0], [-44, -2], [-38, -6], [-35, -9], [-38, -13], [-39, -18], [-44, -23], [-48, -26], [-53, -34], [-57, -38], [-62, -39], [-65, -45], [-68, -50], [-70, -54], [-74, -50], [-73, -44], [-73, -37], [-71, -30], [-70, -20], [-75, -15], [-79, -7], [-81, -4], [-80, 0]],
    australia: [[114, -22], [113, -26], [115, -34], [122, -34], [130, -32], [137, -35], [141, -38], [147, -38], [150, -35], [153, -28], [153, -25], [146, -19], [142, -11], [136, -12], [130, -11], [125, -14], [118, -20]],
    greenland: [[-45, 60], [-50, 65], [-55, 70], [-50, 78], [-35, 83], [-25, 80], [-20, 72], [-30, 65], [-40, 61]],
    madagascar: [[44, -12], [50, -15], [50, -24], [45, -25], [43, -20], [43, -15]],
    britain: [[-6, 50], [1, 51], [0, 54], [-2, 58], [-5, 57], [-5, 53]],
    japan: [[130, 32], [135, 34], [140, 36], [142, 41], [145, 44], [141, 45], [138, 37], [134, 34]],
    nz: [[172, -34], [178, -38], [177, -41], [171, -44], [167, -46], [166, -45], [170, -41]],
    antarctica: null   // drawn as a polar cap
  };
  var CITY_CLUSTERS = [
    [10, 50, 1.0], [25, 52, 0.7], [78, 22, 1.0], [88, 24, 0.7], [115, 32, 1.0], [120, 24, 0.8],
    [138, 36, 0.8], [105, 12, 0.6], [-78, 40, 1.0], [-87, 41, 0.6], [-120, 36, 0.8], [-99, 19, 0.7],
    [-46, -23, 0.8], [-58, -34, 0.5], [3, 7, 0.6], [31, 30, 0.6], [51, 25, 0.5], [28, -26, 0.5],
    [150, -33, 0.5], [-4, 40, 0.5], [37, 56, 0.6], [69, 30, 0.6]
  ];
  function earthSurface(cx, cy, r, spin, tilt, o) {
    var g = C(); o = o || {};
    var sea = o.sea || '#13457f', seaDeep = o.seaDeep || '#0a2a56';
    var landc = o.land || '#3f7a46', landDry = o.landDry || '#8a7a46', ice = o.ice || '#e8f1f8';
    g.save(); g.translate(cx, cy);
    // ocean, deeper away from the sub-viewer point
    g.fillStyle = radial(g, -r * 0.18, -r * 0.2, 0, 0, 0, r, [[0, sea], [0.6, mix(sea, seaDeep, 0.5)], [1, seaDeep]]);
    g.fillRect(-r, -r, r * 2, r * 2);
    // continents
    for (var k in LAND) {
      if (!LAND[k]) continue;
      var pts = projPoly(r, LAND[k], spin, tilt);
      if (!pts) continue;
      polyPath(g, pts);
      g.fillStyle = landc; g.fill();
      // arid interiors: a lighter wash offset inward sells relief cheaply
      g.save(); polyPath(g, pts); g.clip();
      g.fillStyle = radial(g, 0, 0, r * 0.1, 0, 0, r * 1.1, [[0, rgba(landDry, 0.5)], [0.65, rgba(landDry, 0.22)], [1, rgba(landDry, 0.05)]]);
      g.fillRect(-r, -r, r * 2, r * 2);
      g.restore();
      // coast line, thin and darker than the land, never ink-black
      polyPath(g, pts);
      g.strokeStyle = rgba('#0c2a4a', 0.5); g.lineWidth = Math.max(1, r * 0.006); g.stroke();
    }
    // polar caps
    polarCap(g, r, -90, -66, spin, tilt, ice, 0.9);
    polarCap(g, r, 90, 70, spin, tilt, ice, 0.72);
    // the Sahara / Arabian / Australian deserts, as warm blotches over the land
    blotches(0, 0, r, 404, 7, '#c8a46a', 0.3, { spin: spin, tilt: tilt });
    g.restore();
  }
  // The cap is the band of sphere between latEdge and the pole. Filled as a
  // coarse quad mesh: no half-plane trickery, correct at every tilt and spin,
  // and the quads are small enough that a vertex pushed to the limb doesn't show.
  // Caller is already translated to the disc centre and clipped to it.
  function polarCap(g, r, latPole, latEdge, spin, tilt, col, alpha) {
    var NL = 4, NO = 40, i, j;
    g.save(); g.fillStyle = rgba(col, alpha);
    var P = function (la, lo) {
      var p = ortho(r, la, lo, spin, tilt);
      if (p[2] <= 0) { var m = hyp(p[0], p[1]) || 1; p[0] = p[0] / m * r; p[1] = p[1] / m * r; }
      return p;
    };
    for (i = 0; i < NL; i++) {
      var la0 = lp(latEdge, latPole, i / NL), la1 = lp(latEdge, latPole, (i + 1) / NL);
      for (j = 0; j < NO; j++) {
        var lo0 = -180 + 360 * j / NO, lo1 = -180 + 360 * (j + 1) / NO;
        var z0 = ortho(r, la0, lo0, spin, tilt)[2], z1 = ortho(r, la1, lo1, spin, tilt)[2];
        if (z0 <= 0 && z1 <= 0) continue;
        var a = P(la0, lo0), b = P(la0, lo1), c = P(la1, lo1), d = P(la1, lo0);
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]);
        g.closePath(); g.fill();
      }
    }
    g.restore();
  }
  function cityLights(cx, cy, r, L, spin, tilt, t, o) {
    var g = C(); o = o || {};
    var tab = memo('city:' + (o.seed || 77), function () {
      var rr = prng(o.seed || 77), out = [];
      for (var c = 0; c < CITY_CLUSTERS.length; c++) {
        var cc = CITY_CLUSTERS[c], n = Math.round(9 + cc[2] * 13);
        for (var i = 0; i < n; i++) {
          var sp = 5 + rr() * 11;
          out.push({
            lon: cc[0] + (rr() + rr() - 1) * sp * 1.5, lat: cc[1] + (rr() + rr() - 1) * sp,
            m: 0.25 + cc[2] * Math.pow(rr(), 1.4), ph: rr() * TAU
          });
        }
      }
      return out;
    });
    g.save(); g.translate(cx, cy);
    g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip();
    nightPath(g, 0, 0, r, L, -0.01); g.clip();
    var col = o.col || '#ffd291';
    for (var i = 0; i < tab.length; i++) {
      var c2 = tab[i], p = ortho(r, c2.lat, c2.lon, spin, tilt);
      if (p[2] <= 0.1) continue;
      var tw = 0.75 + 0.25 * Math.sin((t || 0) * 2.2 + c2.ph);
      var a = c2.m * p[2] * tw * (o.alpha === undefined ? 1 : o.alpha);
      if (a < 0.04) continue;
      var rr2 = Math.max(0.8, r * 0.0075 * (0.5 + c2.m));
      g.fillStyle = radial(g, p[0], p[1], 0, p[0], p[1], rr2 * 5, [[0, rgba(col, a * 0.75)], [0.3, rgba(col, a * 0.22)], [1, rgba(col, 0)]]);
      g.fillRect(p[0] - rr2 * 5, p[1] - rr2 * 5, rr2 * 10, rr2 * 10);
      g.fillStyle = rgba('#fff0d0', Math.min(0.95, a));
      g.fillRect(p[0] - rr2 * 0.5, p[1] - rr2 * 0.5, rr2 * 1.2, rr2 * 1.2);
    }
    g.restore();
  }
  function cloudLayer(cx, cy, r, seed, drift, tilt, o) {
    var g = C(); o = o || {};
    var n = o.n || 46, A = o.alpha === undefined ? 0.72 : o.alpha, col = o.col || '#ffffff';
    var tab = memo('cloud:' + seed + ':' + n, function () {
      var rr = prng(seed), out = [];
      for (var i = 0; i < n; i++) {
        // weight toward the tropics and the mid-latitude storm belts
        var band = rr(), lat = band < 0.34 ? (rr() * 2 - 1) * 14 : (rr() < 0.5 ? -1 : 1) * (38 + rr() * 24);
        out.push({ lat: lat, lon: rr() * 360 - 180, w: 0.06 + rr() * 0.17, h: 0.028 + rr() * 0.07, a: 0.45 + rr() * 0.55, rot: (rr() - 0.5) * 0.7, sp: 0.6 + rr() * 0.8 });
      }
      return out;
    });
    g.save(); g.translate(cx, cy);
    for (var i = 0; i < tab.length; i++) {
      var b = tab[i], lon0 = -(drift || 0) * b.sp;
      var p = ortho(r, b.lat, b.lon, lon0, tilt);
      if (p[2] <= 0.03) continue;
      var fore = Math.max(0.08, p[2]);
      g.save(); g.translate(p[0], p[1]); g.rotate(Math.atan2(p[1], p[0]) + b.rot);
      g.scale(r * b.w * fore, r * b.h);
      g.fillStyle = radial(g, 0, 0, 0, 0, 0, 1, [[0, rgba(col, A * b.a * 0.95)], [0.42, rgba(col, A * b.a * 0.6)], [0.78, rgba(col, A * b.a * 0.18)], [1, rgba(col, 0)]]);
      g.fillRect(-1, -1, 2, 2);
      g.restore();
    }
    g.restore();
  }

  /* ----------------------------------------------------------------- rings */
  function ringSystem(cx, cy, r, L, o, half) {
    var g = C(); o = o || {};
    var tiltA = o.tilt === undefined ? 0.26 : o.tilt;         // radians; 0 = edge-on
    var rot = o.rot || 0;
    var inner = o.inner === undefined ? 1.26 : o.inner, outer = o.outer === undefined ? 2.3 : o.outer;
    var pal = o.pal || ['#cdbb96', '#e6d9b8', '#a8977a', '#f0e6cd', '#b7a687'];
    var gaps = o.gaps || [[0.42, 0.055], [0.74, 0.03]];
    var A = o.alpha === undefined ? 1 : o.alpha;
    var seed = o.seed === undefined ? 55 : o.seed;
    var tab = memo('ring:' + seed, function () {
      var rr = prng(seed), out = [];
      for (var i = 0; i < 26; i++) out.push({ u: i / 26 + rr() * 0.022, w: 0.5 + rr() * 1.3, a: 0.3 + rr() * 0.7, c: Math.floor(rr() * 997) });
      return out;
    });
    var sq = Math.sin(tiltA);
    g.save(); g.translate(cx, cy); g.rotate(rot);
    g.lineCap = 'butt';
    for (var i = 0; i < tab.length; i++) {
      var b = tab[i], u = cl01(b.u);
      var gap = false;
      for (var k = 0; k < gaps.length; k++) if (Math.abs(u - gaps[k][0]) < gaps[k][1]) gap = true;
      if (gap) continue;
      var rad = r * lp(inner, outer, u);
      var lw = r * (outer - inner) / 26 * b.w;
      var a0 = half === 'front' ? 0 : Math.PI, a1 = half === 'front' ? Math.PI : TAU;
      // thinner and dimmer as the rings close toward edge-on
      var open = cl01(Math.abs(sq) / 0.4);
      g.beginPath(); g.ellipse(0, 0, rad, rad * Math.abs(sq), 0, a0, a1);
      g.lineWidth = Math.max(0.8, lw); g.strokeStyle = rgba(pal[b.c % pal.length], cl01(b.a * A * (0.3 + 0.7 * open)));
      g.stroke();
      // the far half is seen through less material, so it is slightly brighter
      if (half !== 'front') {
        g.beginPath(); g.ellipse(0, 0, rad, rad * Math.abs(sq), 0, a0, a1);
        g.lineWidth = Math.max(0.6, lw * 0.5); g.strokeStyle = rgba('#fff6e2', 0.1 * A * b.a); g.stroke();
      }
    }
    // The planet casts a shadow across the rings, opposite the light. Drawn as
    // a dark arc band over the ringlets just painted — the single cue that says
    // the rings are a flat sheet lit from one side and not a decal.
    if (o.shadow !== false) {
      var phi = Math.atan2(-L.y, -L.x) - rot;
      var span = 0.22 + 0.2 * (1 - cl01(Math.abs(L.z)));
      var mid = r * (inner + outer) / 2;
      var inHalf = function (a) {
        var m = ((a % TAU) + TAU) % TAU;
        return half === 'front' ? (m > 0 && m < Math.PI) : !(m > 0 && m < Math.PI);
      };
      var N2 = 18;
      for (var s2 = 0; s2 < N2; s2++) {
        var aa = phi - span + 2 * span * (s2 + 0.5) / N2;
        if (!inHalf(aa)) continue;
        var fall = 1 - Math.abs((s2 + 0.5) / N2 - 0.5) * 1.5;
        g.beginPath(); g.ellipse(0, 0, mid, mid * Math.abs(sq), 0, aa - span / N2 * 1.2, aa + span / N2 * 1.2);
        g.lineWidth = r * (outer - inner) * 1.08;
        g.strokeStyle = rgba('#04060d', cl01(0.72 * A * fall));
        g.stroke();
      }
    }
    g.restore();
  }

  /* --------------------------------------------------------------- presets */
  var PRESETS = {
    earth: {
      kind: 'earth', base: '#13457f', atmo: '#7fb6ff', atmoThick: 0.055, halo: 0.9,
      soft: 0.26, spec: 1.0, clouds: true, lights: true, tilt: 0.14, glow: '#5aa0ff'
    },
    // Craters stay small and the maria stay faint on purpose: oversized
    // features break the silhouette and the Moon starts reading as an asteroid.
    moon: {
      kind: 'rock', base: '#a39d92', atmo: null, soft: 0.05, spec: 0.4, tilt: 0.06,
      craters: { seed: 909, n: 170, big: 0.048, dark: '#554f45', lit: '#ddd6c7' },
      maria: { seed: 912, n: 8, col: '#6b655c', a: 0.3 }, glow: null
    },
    mars: {
      kind: 'rock', base: '#b0552f', atmo: '#e8a579', atmoThick: 0.03, halo: 0.45,
      soft: 0.13, spec: 0.5, tilt: 0.18, dust: 0.22,
      craters: { seed: 303, n: 90, big: 0.055, dark: '#6d3620', lit: '#d78a56' },
      maria: { seed: 311, n: 10, col: '#6b3a24', a: 0.42 }, caps: '#f2ece2', glow: '#d97a45'
    },
    jupiter: {
      kind: 'gas', base: '#caa578', atmo: '#f0cfa0', atmoThick: 0.045, halo: 0.5,
      soft: 0.4, spec: 0.55, tilt: 0.12,
      pal: ['#d8bb92', '#b4885c', '#eedcc0', '#9d6f4c', '#e4cba6', '#c29468', '#f3e6d0'],
      bandSeed: 141, spots: [[-18, 60, 0.13, 0.055, '#c05a3c'], [22, -40, 0.055, 0.028, '#e6d3b4'], [-34, 140, 0.05, 0.022, '#f0e2c8']],
      glow: '#e8c08a'
    },
    rocky: {
      kind: 'rock', base: '#8a7a68', atmo: null, soft: 0.07, spec: 0.45, tilt: 0.1,
      craters: { seed: 616, n: 150, big: 0.055, dark: '#3d3229', lit: '#d2c4ac' },
      maria: { seed: 620, n: 8, col: '#4e4238', a: 0.5 }, glow: null
    },
    gas: {
      kind: 'gas', base: '#5f86b8', atmo: '#a9cdf0', atmoThick: 0.05, halo: 0.6,
      soft: 0.38, spec: 0.5, tilt: 0.1,
      pal: ['#6f98c8', '#4e6f9e', '#8fb4d8', '#3f5c86', '#a6c6e4', '#5b7fae'],
      bandSeed: 171, spots: [[-24, -50, 0.1, 0.045, '#2d4a74']], glow: '#78a6d8'
    }
  };
  // (preset table ends here)

  /* ----------------------------------------------------------- planet() --- */
  function planet(x, y, r, presetName, o) {
    var g = C(); o = o || {};
    var P = typeof presetName === 'object' ? presetName : (PRESETS[presetName] || PRESETS.rocky);
    var L = normLight(o.light);
    var spin = o.spin || 0, tilt = o.tilt === undefined ? (P.tilt || 0) : o.tilt;
    var A = o.alpha === undefined ? 1 : o.alpha;
    g.save();
    if (A < 1) g.globalAlpha = A;

    // rings behind the planet
    if (o.rings) ringSystem(x, y, r, L, o.rings === true ? {} : o.rings, 'back');

    // a faint outer glow sets the body off the starfield without an outline
    var gl = o.glow === undefined ? P.glow : o.glow;
    if (gl) glow(x, y, r * 1.5, gl, 0.16);

    // ---- surface, clipped to the disc
    g.save();
    arcPath(g, x, y, r); g.clip();
    g.fillStyle = P.base; g.fillRect(x - r, y - r, r * 2, r * 2);
    if (P.kind === 'earth') {
      earthSurface(x, y, r, spin, tilt, o.surface);
    } else if (P.kind === 'gas') {
      gasBands(x, y, r, (o.pal || P.pal), spin, tilt, P.bandSeed, 0);
      var sp = o.spots || P.spots || [];
      for (var i = 0; i < sp.length; i++) storm(x, y, r, sp[i][0], sp[i][1], sp[i][2], sp[i][3], sp[i][4], spin, tilt);
    } else {
      if (P.maria) blotches(x, y, r, P.maria.seed, P.maria.n, P.maria.col, P.maria.a, { spin: spin, tilt: tilt });
      if (P.craters) craters(x, y, r, L, P.craters.seed, P.craters.n, { spin: spin, tilt: tilt, big: P.craters.big, dark: P.craters.dark, lit: P.craters.lit });
      if (P.caps) { g.save(); g.translate(x, y); polarCap(g, r, 90, 74, spin, tilt, P.caps, 0.85); polarCap(g, r, -90, -78, spin, tilt, P.caps, 0.7); g.restore(); }
      if (P.dust) {
        g.fillStyle = radial(g, x, y, 0, x, y, r, [[0, rgba('#e0a070', 0)], [0.7, rgba('#e0a070', P.dust * 0.4)], [1, rgba('#f0c090', P.dust)]]);
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    // clouds ride above the surface but below the shading
    var cls = o.clouds === undefined ? P.clouds : o.clouds;
    if (cls) cloudLayer(x, y, r, (cls.seed || 808), (cls.drift === undefined ? (o.cloudDrift || 0) : cls.drift), tilt, cls === true ? {} : cls);

    // shading
    sphereShade(x, y, r, L, { soft: o.soft === undefined ? P.soft : o.soft, spec: o.spec === undefined ? P.spec : o.spec, nightCol: o.nightCol, nightA: o.nightA });
    // city lights sit ON the night side, so they go after the shading
    if ((o.lights === undefined ? P.lights : o.lights) && o.lights !== false) {
      cityLights(x, y, r, L, spin, tilt, o.t || 0, o.lightsOpt);
    }
    // an eclipse shadow cast by another body
    if (o.shadowBy) {
      var sB = o.shadowBy;
      g.fillStyle = radial(g, sB.x, sB.y, sB.r * 0.55, sB.x, sB.y, sB.r * 1.25,
        [[0, rgba('#04060c', 0.9)], [0.55, rgba('#04060c', 0.82)], [1, rgba('#04060c', 0)]]);
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.restore();

    // atmosphere rim, outside the clip so the halo can spill
    var at = o.atmo === undefined ? P.atmo : o.atmo;
    if (at) atmoRim(x, y, r, L, { col: at, thick: o.atmoThick === undefined ? (P.atmoThick || 0.05) : o.atmoThick, halo: o.halo === undefined ? (P.halo || 0.5) : o.halo, alpha: o.atmoAlpha });
    // optional contact line: keeps a dark body off a dark sky. Never INK black.
    if (o.ink) { arcPath(g, x, y, r); g.strokeStyle = typeof o.ink === 'string' ? o.ink : 'rgba(6,10,22,0.55)'; g.lineWidth = Math.max(2, r * 0.012); g.stroke(); }

    if (o.rings) ringSystem(x, y, r, L, o.rings === true ? {} : o.rings, 'front');
    g.restore();
    return { x: x, y: y, r: r, light: L };
  }

  /* ------------------------------------------------------------- earth() --- */
  // The Moon's mean distance is 60.3 Earth radii and its radius is 0.2727 of
  // Earth's (see Sources in the skill). `dist` is in EARTH RADII, so passing
  // 60.3 puts the Moon where it really is; pass less and say on screen that
  // the distance is compressed.
  var MOON_R_RATIO = 0.2727, MOON_DIST_RE = 60.3;
  function earth(x, y, r, o) {
    o = o || {};
    var L = normLight(o.light);
    var out = { earth: planet(x, y, r, 'earth', o) };
    if (o.moon) {
      var m = o.moon === true ? {} : o.moon;
      var d = (m.dist === undefined ? MOON_DIST_RE : m.dist) * r;
      var ang = m.ang === undefined ? -0.5 : m.ang;
      var mr = m.r === undefined ? r * MOON_R_RATIO : m.r;
      var mx = x + Math.cos(ang) * d, my = y + Math.sin(ang) * d * (m.flat === undefined ? 1 : m.flat);
      planet(mx, my, mr, 'moon', { light: L, spin: m.spin || 0, t: o.t, soft: 0.05 });
      out.moon = { x: mx, y: my, r: mr, dist: d };
      if (m.link) {
        var g = C();
        g.save(); g.setLineDash([14, 14]); g.strokeStyle = rgba('#9ec4ff', 0.3); g.lineWidth = 3;
        g.beginPath(); g.moveTo(x + Math.cos(ang) * r * 1.1, y + Math.sin(ang) * r * 1.1);
        g.lineTo(mx - Math.cos(ang) * mr * 1.6, my - Math.sin(ang) * mr * 1.6); g.stroke(); g.restore();
      }
    }
    return out;
  }
  // Light vector for a Moon sitting at orbit angle `ang` around an Earth lit
  // from screen direction `sunAng`: the phase follows from the geometry, so a
  // waxing crescent cannot end up lit from the wrong side.
  function moonPhaseLight(sunAng) { return light(sunAng / D2R, 0); }

  /* ---------------------------------------------------------------- star --- */
  function star(x, y, r, o) {
    o = o || {}; var g = C();
    var core = o.core || '#fff6d8', mid = o.mid || '#ffd477', out = o.out || '#ff9a3c';
    var t = o.t || 0, A = o.alpha === undefined ? 1 : o.alpha;
    var breathe = 1 + 0.018 * Math.sin(t * 0.8) + 0.01 * Math.sin(t * 1.9 + 1.2);
    g.save();
    // corona: three soft shells, widest first. Bloom-safe alphas.
    glow(x, y, r * 9.5 * breathe, out, 0.1 * A);
    glow(x, y, r * 4.6 * breathe, mid, 0.22 * A);
    glow(x, y, r * 2.1 * breathe, core, 0.4 * A);
    // rays: seeded lengths, breathing slowly. Not a sparkle.
    if (o.rays !== false) {
      var n = o.rayN || 26;
      var tab = memo('ray:' + (o.seed || 5) + ':' + n, function () {
        var rr = prng(o.seed || 5), a = [];
        for (var i = 0; i < n; i++) a.push({ a: i / n * TAU + rr() * 0.1, l: 0.5 + rr() * 1.7, w: 0.4 + rr() * 1.1, ph: rr() * TAU, sp: 0.5 + rr() * 0.9 });
        return a;
      });
      g.lineCap = 'round';
      for (var i = 0; i < tab.length; i++) {
        var s = tab[i], k = 0.72 + 0.28 * Math.sin(t * s.sp + s.ph);
        var l0 = r * 1.02, l1 = r * (1.3 + s.l * 1.9 * k);
        g.beginPath();
        g.moveTo(x + Math.cos(s.a) * l0, y + Math.sin(s.a) * l0);
        g.lineTo(x + Math.cos(s.a) * l1, y + Math.sin(s.a) * l1);
        g.strokeStyle = rgba(mid, 0.1 * A * k); g.lineWidth = r * 0.09 * s.w; g.stroke();
      }
    }
    // chromosphere + photosphere. The core is not pure white: it is a warm
    // white that still has headroom, which is what keeps the encode clean.
    arcPath(g, x, y, r * 1.1);
    g.fillStyle = radial(g, x, y, r * 0.86, x, y, r * 1.14, [[0, rgba(out, 0.75 * A)], [0.5, rgba(mid, 0.5 * A)], [1, rgba(mid, 0)]]);
    g.fill();
    arcPath(g, x, y, r);
    g.fillStyle = radial(g, x - r * 0.12, y - r * 0.14, 0, x, y, r, [
      [0, rgba('#fffdf2', 0.98 * A)], [0.45, rgba(core, 0.97 * A)], [0.82, rgba(mid, 0.96 * A)], [1, rgba(out, 0.94 * A)]]);
    g.fill();
    // granulation: faint seeded mottle so the disc is not a flat gradient
    g.save(); arcPath(g, x, y, r); g.clip();
    var mot = memo('gran:' + (o.seed || 5), function () {
      var rr = prng((o.seed || 5) + 3), a = [];
      for (var i = 0; i < 70; i++) { var aa = rr() * TAU, rd = Math.sqrt(rr()); a.push({ x: Math.cos(aa) * rd, y: Math.sin(aa) * rd, s: 0.05 + rr() * 0.12, d: rr() < 0.5 ? 1 : -1, v: rr() }); }
      return a;
    });
    for (var j = 0; j < mot.length; j++) {
      var m = mot[j];
      g.fillStyle = radial(g, x + m.x * r, y + m.y * r, 0, x + m.x * r, y + m.y * r, r * m.s,
        [[0, rgba(m.d > 0 ? '#fff8e0' : '#f08a2c', 0.14 * m.v * A)], [1, rgba(m.d > 0 ? '#fff8e0' : '#f08a2c', 0)]]);
      g.fillRect(x + m.x * r - r * m.s, y + m.y * r - r * m.s, r * m.s * 2, r * m.s * 2);
    }
    g.restore();
    g.restore();
    return { x: x, y: y, r: r };
  }

  /* ---------------------------------------------------------- black hole --- */
  // `r` is the SHADOW radius. For a non-rotating hole the shadow radius is
  // sqrt(27)/2 = 2.598 Schwarzschild radii and the photon sphere sits at
  // 1.5 Rs, so r / 2.598 is the horizon and the ring hugs the shadow edge.
  function blackHole(x, y, r, o) {
    o = o || {}; var g = C();
    var t = o.t || 0, disc = o.disc === undefined ? true : o.disc;
    var tiltA = o.tilt === undefined ? 0.17 : o.tilt;
    var hot = o.hot || '#ffd79a', cool = o.cool || '#ff7a3c';
    var dop = o.doppler === undefined ? 1 : o.doppler;    // which side is boosted: +1 right
    g.save();
    if (disc) accretionDisc(x, y, r, { t: t, tilt: tiltA, hot: hot, cool: cool, doppler: dop, half: 'back', inner: o.inner, outer: o.outer, seed: o.seed });
    // The far side of the disc, lensed up and over the top of the shadow. This
    // arc is the whole silhouette: without it a black hole is just a black
    // circle in a hoop. Built as a band, brightest where it meets the limb.
    if (disc) {
      var AA = o.alpha === undefined ? 1 : o.alpha;
      g.save();
      for (var k = 5; k >= 0; k--) {
        var rr = r * (1.03 + k * 0.05), fl = 0.17 + k * 0.075;
        var beamK = 0.16 + 0.84 * Math.pow(1 - k / 5, 1.4);
        for (var sg = 0; sg < 16; sg++) {
          var sa = Math.PI + Math.PI * sg / 16, sb = Math.PI + Math.PI * (sg + 1.15) / 16;
          var bm = 0.25 + 0.75 * Math.pow(cl01(0.5 + 0.5 * Math.cos((sa + sb) / 2 - (dop > 0 ? 0 : Math.PI))), 1.8);
          g.beginPath(); g.ellipse(x, y, rr, rr * fl, 0, sa, sb);
          g.lineWidth = r * 0.075;
          g.strokeStyle = rgba(mix(hot, cool, k / 5), cl01(0.42 * beamK * bm * AA));
          g.stroke();
        }
      }
      g.restore();
    }
    // the shadow: the deepest black in the frame, and nothing else gets it
    arcPath(g, x, y, r); g.fillStyle = '#000000'; g.fill();
    // photon ring: a thin hot line right at the shadow edge, plus its bloom
    glow(x, y, r * 2.2, hot, 0.14);
    for (var i = 0; i < 48; i++) {
      var a0 = i / 48 * TAU, a1 = (i + 1.3) / 48 * TAU, am = (a0 + a1) / 2;
      // relativistic beaming: the approaching side is brighter
      var b = 0.42 + 0.58 * Math.pow(cl01(0.5 + 0.5 * Math.cos(am - (dop > 0 ? 0 : Math.PI))), 1.6);
      g.beginPath(); g.arc(x, y, r * 1.012, a0, a1);
      g.lineWidth = r * 0.026; g.strokeStyle = rgba(hot, 0.9 * b); g.stroke();
      g.beginPath(); g.arc(x, y, r * 1.028, a0, a1);
      g.lineWidth = r * 0.05; g.strokeStyle = rgba(cool, 0.3 * b); g.stroke();
    }
    if (disc) accretionDisc(x, y, r, { t: t, tilt: tiltA, hot: hot, cool: cool, doppler: dop, half: 'front', inner: o.inner, outer: o.outer, seed: o.seed });
    g.restore();
    return { x: x, y: y, r: r, horizon: r / 2.598 };
  }
  function accretionDisc(x, y, r, o) {
    o = o || {}; var g = C();
    var tiltA = o.tilt === undefined ? 0.17 : o.tilt;
    var inner = o.inner === undefined ? 1.15 : o.inner, outer = o.outer === undefined ? 4.2 : o.outer;
    var hot = o.hot || '#ffd79a', cool = o.cool || '#ff7a3c', t = o.t || 0;
    var dop = o.doppler === undefined ? 1 : o.doppler, half = o.half || 'both';
    var A = o.alpha === undefined ? 1 : o.alpha;
    var sq = Math.max(0.04, Math.sin(tiltA));
    var NR = 42;
    var tab = memo('disc:' + (o.seed === undefined ? 67 : o.seed), function () {
      var rr = prng(o.seed === undefined ? 67 : o.seed), a = [];
      for (var i = 0; i < NR; i++) a.push({ j: (rr() - 0.5) * 0.9 / NR, w: 0.7 + rr() * 1.1, a: 0.55 + rr() * 0.45, ph: rr() * TAU, sp: 0.6 + rr() * 1.5 });
      return a;
    });
    g.save(); g.translate(x, y);
    var halves = half === 'both' ? ['back', 'front'] : [half];
    for (var h = 0; h < halves.length; h++) {
      var front = halves[h] === 'front';
      // the halves overlap by a hair, or the antialiased seam shows as a line
      // straight across the disc
      var a0 = front ? -0.02 : Math.PI - 0.02, a1 = front ? Math.PI + 0.02 : TAU + 0.02;
      // 1. a continuous wash so the disc is plasma, not a stack of hoops
      g.save();
      g.beginPath(); g.ellipse(0, 0, r * outer, r * outer * sq, 0, a0, a1);
      g.ellipse(0, 0, r * inner, r * inner * sq, 0, a1, a0, true);
      g.closePath(); g.clip();
      g.save(); g.scale(1, sq);
      g.fillStyle = radial(g, 0, 0, r * inner * 0.92, 0, 0, r * outer,
        [[0, rgba(hot, 0.85 * A)], [0.18, rgba(hot, 0.6 * A)], [0.5, rgba(cool, 0.34 * A)], [1, rgba(cool, 0)]]);
      g.fillRect(-r * outer, -r * outer, r * outer * 2, r * outer * 2);
      g.restore();
      // 2. Doppler beaming across that wash: the limb coming toward us is
      // boosted, the receding one dimmed. It is the asymmetry, not the ring,
      // that tells a viewer the thing is spinning at a fraction of c.
      var bx = (dop > 0 ? 1 : -1) * r * outer;
      g.fillStyle = linear(g, -bx, 0, bx, 0, [[0, rgba('#000308', 0.55 * A)], [0.42, rgba('#000308', 0.12 * A)], [0.72, rgba('#ffffff', 0.0)], [1, rgba('#fff0d0', 0.3 * A)]]);
      g.fillRect(-r * outer, -r * outer * sq - 2, r * outer * 2, r * outer * sq * 2 + 4);
      g.restore();
      // 3. ringlets on top, low contrast: texture, not structure
      for (var i = 0; i < NR; i++) {
        var b = tab[i], u = cl01(i / NR + b.j);
        var rad = r * lp(inner, outer, Math.pow(u, 1.35));
        var lw = r * (outer - inner) / NR * b.w * (0.5 + u * 1.3);
        var col = mix(hot, cool, Math.pow(u, 0.6));
        var flick = 0.8 + 0.2 * Math.sin(t * b.sp + b.ph);
        var segs = 16;
        for (var s = 0; s < segs; s++) {
          var sa = lp(a0, a1, s / segs), sb = lp(a0, a1, (s + 1.1) / segs), sm = (sa + sb) / 2;
          var beam = 0.18 + 0.82 * Math.pow(cl01(0.5 + 0.5 * Math.cos(sm - (dop > 0 ? 0 : Math.PI))), 2.0);
          g.beginPath(); g.ellipse(0, 0, rad, rad * sq, 0, sa, sb);
          g.lineWidth = Math.max(0.9, lw);
          g.strokeStyle = rgba(col, cl01(b.a * A * flick * beam * Math.pow(1 - u, 1.3) * 0.45));
          g.stroke();
        }
      }
    }
    g.restore();
  }

  /* --------------------------------------------------------------- comet --- */
  function comet(x, y, o) {
    o = o || {}; var g = C();
    var ang = o.ang === undefined ? 2.5 : o.ang;      // anti-sunward direction
    var len = o.len || 620, r = o.r || 13, t = o.t || 0;
    var dustCol = o.dust || '#ffd9a0', ionCol = o.ion || '#8fd0ff';
    var A = o.alpha === undefined ? 1 : o.alpha;
    g.save(); g.translate(x, y); g.rotate(ang);
    // ion tail: straight, narrow, blue, exactly anti-sunward
    var ionW = r * 1.1;
    g.beginPath();
    g.moveTo(0, -ionW); g.quadraticCurveTo(len * 0.5, -ionW * 0.75, len * 1.15, -ionW * 0.3);
    g.lineTo(len * 1.15, ionW * 0.3); g.quadraticCurveTo(len * 0.5, ionW * 0.75, 0, ionW);
    g.closePath();
    g.fillStyle = linear(g, 0, 0, len * 1.15, 0, [[0, rgba(ionCol, 0.6 * A)], [0.35, rgba(ionCol, 0.26 * A)], [1, rgba(ionCol, 0)]]);
    g.fill();
    // filaments in the ion tail, so it is not a flat wedge
    for (var i = 0; i < 7; i++) {
      var off = (i - 3) * ionW * 0.42, wob = Math.sin(t * 0.5 + i) * ionW * 0.3;
      g.beginPath(); g.moveTo(r, off * 0.4);
      g.quadraticCurveTo(len * 0.5, off + wob, len * (0.85 + i % 3 * 0.11), off * 1.5 + wob);
      g.strokeStyle = rgba('#cfe9ff', 0.1 * A); g.lineWidth = 2.4; g.stroke();
    }
    // dust tail: wider, curved, warm, lagging behind the orbit
    var curve = o.curve === undefined ? 0.42 : o.curve;
    g.save(); g.rotate(curve * 0.4);
    var dw = r * 2.6;
    g.beginPath();
    g.moveTo(0, -dw * 0.5);
    g.quadraticCurveTo(len * 0.45, -dw * 0.5 - len * curve * 0.22, len * 0.92, -dw * 0.1 - len * curve * 0.5);
    g.quadraticCurveTo(len * 0.5, dw * 1.5 - len * curve * 0.3, 0, dw * 0.6);
    g.closePath();
    g.fillStyle = linear(g, 0, 0, len * 0.92, -len * curve * 0.4, [[0, rgba(dustCol, 0.5 * A)], [0.3, rgba(dustCol, 0.2 * A)], [1, rgba(dustCol, 0)]]);
    g.fill();
    g.restore();
    g.restore();
    // coma + nucleus
    glow(x, y, r * 9, '#cfe8ff', 0.3 * A);
    glow(x, y, r * 3.4, '#ffffff', 0.5 * A);
    arcPath(g, x, y, r * 0.78); g.save();
    g.fillStyle = radial(g, x - r * 0.2, y - r * 0.2, 0, x, y, r * 0.78, [[0, '#ffffff'], [0.6, '#dfe9f6'], [1, '#9fb0c4']]);
    g.fill(); g.restore();
    return { x: x, y: y, ang: ang };
  }

  /* ================================================= §3 ORBITS & MOTION === */
  function orbitPos(cx, cy, a, b, rot, u) {
    var th = u * TAU, c = Math.cos(rot), s = Math.sin(rot);
    var ex = Math.cos(th) * a, ey = Math.sin(th) * b;
    return { x: cx + ex * c - ey * s, y: cy + ex * s + ey * c, z: Math.sin(th), front: Math.sin(th) > 0 };
  }
  function orbitPath(cx, cy, a, b, rot, o) {
    o = o || {}; var g = C();
    var col = o.col || '#8fb6ff', A = o.alpha === undefined ? 0.55 : o.alpha;
    var lw = o.lw || 3, dash = o.dash;
    g.save(); g.translate(cx, cy); g.rotate(rot || 0);
    if (dash) g.setLineDash(dash === true ? [16, 16] : dash);
    g.lineCap = 'round';
    // back half dimmer: the ring reads as a ring in 3D, not a flat hoop
    g.beginPath(); g.ellipse(0, 0, a, b, 0, Math.PI, TAU);
    g.strokeStyle = rgba(col, A * 0.32); g.lineWidth = lw; g.stroke();
    g.beginPath(); g.ellipse(0, 0, a, b, 0, 0, Math.PI);
    g.strokeStyle = rgba(col, A); g.lineWidth = lw; g.stroke();
    g.restore();
  }

  /* ------------------------------------------------------- tidal bulge ---- */
  /* Two bulges, not one: the Moon's pull is strongest on the near side and
   * weakest on the far side, so the water is drawn toward BOTH points, which
   * is why most coasts get two high tides a day. Earth's spin also carries the
   * bulges slightly AHEAD of the Moon. (NASA, see Sources.) `lead` is that
   * offset in radians and defaults to a visible 0.12.
   */
  function tidalBulge(x, y, r, o) {
    o = o || {}; var g = C();
    var ang = o.ang === undefined ? 0 : o.ang;            // direction of the Moon
    var ex = o.exaggerate === undefined ? 0.17 : o.exaggerate;
    var lead = o.lead === undefined ? 0.12 : o.lead;
    var L = normLight(o.light);
    var A = o.alpha === undefined ? 1 : o.alpha;
    var ba = ang + lead;
    g.save(); g.globalAlpha = A;
    // the water shell, exaggerated into a prolate ellipse along the Moon line
    g.save(); g.translate(x, y); g.rotate(ba);
    g.beginPath(); g.ellipse(0, 0, r * (1 + ex), r * (1 - ex * 0.42), 0, 0, TAU);
    g.fillStyle = rgba(o.water || '#2f78c8', 0.5); g.fill();
    g.strokeStyle = rgba(o.waterEdge || '#9ed0ff', 0.75); g.lineWidth = Math.max(2, r * 0.02); g.stroke();
    g.restore();
    // the solid body, drawn over the water so the bulge shows as a rim
    planet(x, y, r, 'earth', { light: L, spin: o.spin || 0, t: o.t, clouds: false, lights: false, glow: null, atmoAlpha: 0.5 });
    // bulge callouts
    if (o.marks !== false) {
      for (var k = 0; k < 2; k++) {
        var a = ba + k * Math.PI, px = x + Math.cos(a) * r * (1 + ex) * 1.02, py = y + Math.sin(a) * r * (1 + ex) * 1.02;
        glow(px, py, r * 0.46, '#9ed0ff', 0.4);
        g.beginPath(); g.arc(px, py, Math.max(4, r * 0.05), 0, TAU);
        g.fillStyle = '#eaf4ff'; g.fill();
      }
    }
    // the Moon, and the pull arrows that differ end to end
    if (o.moon !== false) {
      var md = (o.moonDist === undefined ? 4.2 : o.moonDist) * r;
      var mx = x + Math.cos(ang) * md, my = y + Math.sin(ang) * md;
      var mr = (o.moonR === undefined ? MOON_R_RATIO : o.moonR) * r;
      planet(mx, my, mr, 'moon', { light: L, spin: 20 });
      // The pull arrows sit on a comb ABOVE the body, not across it: on the
      // globe they fight the continents and the eye can't compare lengths.
      if (o.arrows !== false) {
        var n = 5, off = (o.arrowOffset === undefined ? -1.38 : o.arrowOffset) * r;
        var px0 = -Math.sin(ang) * off, py0 = Math.cos(ang) * off;   // perpendicular
        g.save();
        g.setLineDash([6, 10]);
        g.strokeStyle = rgba('#ffd089', 0.22); g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x + px0 - Math.cos(ang) * r, y + py0 - Math.sin(ang) * r);
        g.lineTo(x + px0 + Math.cos(ang) * r, y + py0 + Math.sin(ang) * r); g.stroke();
        g.restore();
        for (var i = 0; i < n; i++) {
          var u = (i / (n - 1)) * 2 - 1;                 // -1 far side .. +1 near side
          var sx = x + px0 + Math.cos(ang) * r * u, sy = y + py0 + Math.sin(ang) * r * u;
          // Length goes as 1/d^2 to the Moon. The DIFFERENCE between these
          // arrows is the tide; the common part just orbits the pair.
          var dd = Math.max(0.2, md - r * u) / md;
          var ln = r * 0.3 / (dd * dd);
          arrow(g, sx, sy, sx + Math.cos(ang) * ln, sy + Math.sin(ang) * ln,
            { col: '#ffd089', lw: Math.max(2.5, r * 0.02), head: Math.max(7, r * 0.05), alpha: 0.9 });
        }
      }
    }
    g.restore();
    return { bulgeAng: ba };
  }
  function arrow(g, x0, y0, x1, y1, o) {
    o = o || {};
    var col = o.col || '#ffffff', lw = o.lw || 4, hd = o.head || 14, A = o.alpha === undefined ? 1 : o.alpha;
    var a = Math.atan2(y1 - y0, x1 - x0);
    g.save();
    g.strokeStyle = rgba(col, A); g.lineWidth = lw; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(a) * hd * 0.8, y1 - Math.sin(a) * hd * 0.8); g.stroke();
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x1 - Math.cos(a - 0.45) * hd * 1.7, y1 - Math.sin(a - 0.45) * hd * 1.7);
    g.lineTo(x1 - Math.cos(a + 0.45) * hd * 1.7, y1 - Math.sin(a + 0.45) * hd * 1.7);
    g.closePath(); g.fillStyle = rgba(col, A); g.fill();
    g.restore();
  }

  /* ----------------------------------------------------------- eclipse ---- */
  /* Geometry: the Sun is ~400x the Moon's diameter and ~400x farther away, so
   * both are about half a degree across and the Moon can just cover the Sun.
   * `mode`:
   *   'solar'  side-on diagram: Sun, Moon, umbra cone landing on Earth
   *   'lunar'  side-on diagram: Earth's shadow cone, Moon inside it
   *   'sky'    what the viewer under the umbra sees: the corona ring
   */
  function eclipse(o) {
    o = o || {}; var g = C();
    var mode = o.mode || 'solar', u = o.u === undefined ? 0.5 : o.u;
    var A = o.alpha === undefined ? 1 : o.alpha;
    g.save(); g.globalAlpha = A;
    if (mode === 'sky') {
      var cx = o.x === undefined ? CW() * 0.5 : o.x, cy = o.y === undefined ? CH() * 0.44 : o.y;
      var r = o.r || 170, cov = cl01(o.cover === undefined ? 1 : o.cover);
      // The corona is only visible once the photosphere is covered: at 90%
      // the sky is still daylight-bright and you see nothing. It arrives in
      // the last few percent, which is the whole drama of totality.
      var cor = Math.pow(cl01((cov - 0.9) / 0.1), 1.2);
      glow(cx, cy, r * 7.5 * cor, '#dfe9ff', 0.2 * cor);
      glow(cx, cy, r * 4.0 * cor, '#ffeec6', 0.3 * cor);
      glow(cx, cy, r * 2.0 * cor, '#fff6e0', 0.42 * cor);
      // Corona streamers. Many, thin, and clustered: the real corona is a soft
      // halo with a few long equatorial plumes, not a ring of even spikes. Even
      // spacing is the thing that makes this read as a cartoon sparkle.
      var tab = memo('cor:' + (o.seed || 23), function () {
        var rr = prng(o.seed || 23), a = [];
        for (var i = 0; i < 90; i++) {
          var base = rr() < 0.62 ? (rr() < 0.5 ? 0 : Math.PI) : TAU * rr();   // equatorial bias
          a.push({ a: base + (rr() + rr() - 1) * 1.15, l: 0.18 + Math.pow(rr(), 2.0) * 2.6, w: 0.12 + rr() * 0.5, ph: rr() * TAU });
        }
        return a;
      });
      g.lineCap = 'round';
      for (var i = 0; i < tab.length; i++) {
        var s = tab[i], k = (0.75 + 0.25 * Math.sin((o.t || 0) * 0.6 + s.ph)) * cor;
        var l1 = r * (1.04 + s.l * k);
        g.beginPath();
        g.moveTo(cx + Math.cos(s.a) * r * 1.0, cy + Math.sin(s.a) * r * 1.0);
        g.lineTo(cx + Math.cos(s.a) * l1, cy + Math.sin(s.a) * l1);
        g.strokeStyle = linear(g, cx + Math.cos(s.a) * r, cy + Math.sin(s.a) * r, cx + Math.cos(s.a) * l1, cy + Math.sin(s.a) * l1,
          [[0, rgba('#fff4da', 0.16 * k)], [0.35, rgba('#f0ecdf', 0.07 * k)], [1, rgba('#cfd9f5', 0)]]);
        g.lineWidth = r * 0.055 * s.w; g.stroke();
      }
      // solar disc
      arcPath(g, cx, cy, r);
      g.fillStyle = radial(g, cx, cy, r * 0.2, cx, cy, r, [[0, '#fffaf0'], [0.7, '#ffe8ac'], [1, '#ffc96a']]);
      g.fill();
      // the Moon slides across; at cover = 1 only the ring of light is left
      var off = (1 - cov) * r * 2.3;
      var mx = cx + off * Math.cos(o.dir === undefined ? -0.35 : o.dir), my = cy + off * Math.sin(o.dir === undefined ? -0.35 : o.dir);
      arcPath(g, mx, my, r * (o.ratio === undefined ? 1.005 : o.ratio));
      g.fillStyle = '#05070d'; g.fill();
      // The chromosphere: the thin pink rim that appears for the few seconds
      // either side of second contact, with one Baily's bead on the leading limb.
      if (cov > 0.96) {
        var bk = cl01((cov - 0.96) / 0.04);
        arcPath(g, cx, cy, r * 1.012);
        g.strokeStyle = rgba('#ff9aa8', 0.75 * bk); g.lineWidth = r * 0.022; g.stroke();
        arcPath(g, cx, cy, r * 1.004);
        g.strokeStyle = rgba('#fff2dc', 0.5 * bk); g.lineWidth = r * 0.012; g.stroke();
        if (cov < 0.995) {
          var bd = (o.dir === undefined ? -0.35 : o.dir) + Math.PI;
          glow(cx + Math.cos(bd) * r, cy + Math.sin(bd) * r, r * 0.42, '#fff6e2', 0.7 * (1 - bk));
        }
      }
      g.restore();
      return { x: cx, y: cy, r: r };
    }
    // Side-on diagrams. Sun on the left, bodies to the right, light runs L->R.
    // A shadow on a black sky is invisible, so the SUNLIGHT is painted first as
    // a faint warm beam; the umbra then reads as the hole punched through it.
    var sunX = o.sunX === undefined ? 180 : o.sunX, midY = o.y === undefined ? CH() * 0.5 : o.y;
    var sunR = o.sunR || 120;
    var L = light(0, 0);                                  // light runs screen-right
    var beamH = o.beam === undefined ? sunR * 2.6 : o.beam;
    var beamEnd = o.beamEnd === undefined ? CW() + 300 : o.beamEnd;   // fade before any clip edge
    g.save();
    g.beginPath();
    g.moveTo(sunX, midY - sunR); g.lineTo(beamEnd, midY - beamH);
    g.lineTo(beamEnd, midY + beamH); g.lineTo(sunX, midY + sunR);
    g.closePath();
    g.fillStyle = linear(g, sunX, midY, beamEnd, midY,
      [[0, rgba('#ffd89a', 0.14)], [0.45, rgba('#ffc98a', 0.07)], [0.86, rgba('#ffc98a', 0.025)], [1, rgba('#ffc98a', 0)]]);
    g.fill();
    g.restore();
    star(sunX, midY, sunR, { t: o.t, rays: false, seed: 9 });
    if (mode === 'solar') {
      var ex = o.earthX === undefined ? CW() * 0.82 : o.earthX, er = o.earthR || 180;
      var mxx = o.moonX === undefined ? lp(sunX, ex, 0.72) : o.moonX;
      var mr = o.moonR || er * MOON_R_RATIO * 1.9;        // the Moon is drawn big enough to see
      var slide = (u - 0.5) * er * 2.4;
      var my2 = midY + slide;
      // Umbra cone from the Moon to Earth. It converges: the Moon's umbra only
      // just reaches us, which is why totality is a narrow track and not a
      // hemisphere. The edge gets a thin warm line so the cone reads on black.
      var dx = ex - mxx;
      g.save();
      // penumbra first, widening
      g.beginPath();
      g.moveTo(mxx, my2 - mr); g.lineTo(mxx + dx * 1.3, my2 - mr * 3.4);
      g.lineTo(mxx + dx * 1.3, my2 + mr * 3.4); g.lineTo(mxx, my2 + mr);
      g.closePath(); g.fillStyle = rgba('#070b16', 0.5); g.fill();
      // umbra, converging to a point just past Earth
      g.beginPath();
      g.moveTo(mxx, my2 - mr); g.lineTo(mxx + dx * 1.18, my2);
      g.lineTo(mxx, my2 + mr);
      g.closePath();
      g.fillStyle = rgba('#02030a', 0.94); g.fill();
      g.strokeStyle = rgba('#ffd89a', 0.3); g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(mxx, my2 - mr); g.lineTo(mxx + dx * 1.18, my2);
      g.moveTo(mxx, my2 + mr); g.lineTo(mxx + dx * 1.18, my2); g.stroke();
      g.restore();
      planet(ex, midY, er, 'earth', { light: L, spin: o.spin || 0, t: o.t, clouds: true, lights: true, shadowBy: { x: ex - er * 0.95, y: my2, r: mr * 1.9 } });
      planet(mxx, my2, mr, 'moon', { light: L, spin: 30 });
      g.restore();
      return { earth: { x: ex, y: midY, r: er }, moon: { x: mxx, y: my2, r: mr } };
    }
    // lunar: Earth's shadow cone, the Moon drifting into it
    var ex2 = o.earthX === undefined ? CW() * 0.42 : o.earthX, er2 = o.earthR || 150;
    var mr3 = o.moonR || er2 * MOON_R_RATIO * 1.8;
    var mdx = o.moonX === undefined ? CW() * 0.86 : o.moonX;
    var mslide = (0.5 - u) * er2 * 2.2;
    g.save();
    g.beginPath();
    g.moveTo(ex2, midY - er2 * 1.6); g.lineTo(CW() + 200, midY - er2 * 0.9);
    g.lineTo(CW() + 200, midY + er2 * 0.9); g.lineTo(ex2, midY + er2 * 1.6);
    g.closePath(); g.fillStyle = rgba('#070b16', 0.5); g.fill();
    g.beginPath();
    g.moveTo(ex2, midY - er2); g.lineTo(CW() + 200, midY - er2 * 0.2);
    g.lineTo(CW() + 200, midY + er2 * 0.2); g.lineTo(ex2, midY + er2);
    g.closePath();
    g.fillStyle = linear(g, ex2, midY, CW(), midY, [[0, rgba('#02030a', 0.95)], [1, rgba('#1a0b10', 0.8)]]);
    g.fill();
    g.strokeStyle = rgba('#ffb08a', 0.26); g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(ex2, midY - er2); g.lineTo(CW() + 200, midY - er2 * 0.2);
    g.moveTo(ex2, midY + er2); g.lineTo(CW() + 200, midY + er2 * 0.2); g.stroke();
    g.restore();
    planet(ex2, midY, er2, 'earth', { light: L, spin: o.spin || 0, t: o.t, lights: true });
    // inside the umbra the Moon is not black: it is lit by sunlight refracted
    // through Earth's atmosphere, which is why a total lunar eclipse is red.
    var inUmbra = cl01(1 - Math.abs(mslide) / (er2 * 0.6));
    planet(mdx, midY + mslide, mr3, 'moon', {
      light: light(180, 0), spin: 30,
      nightCol: inUmbra > 0.4 ? '#6a1c14' : '#060a14', nightA: lp(0.95, 0.62, inUmbra)
    });
    if (inUmbra > 0.4) glow(mdx, midY + mslide, mr3 * 2.6, '#b8402c', 0.22 * inUmbra);
    g.restore();
    return { earth: { x: ex2, y: midY, r: er2 }, moon: { x: mdx, y: midY + mslide, r: mr3 } };
  }

  /* -------------------------------------------------------- trajectory ---- */
  // fn(u) -> [x, y] for u in 0..1. Draws the path up to `u`, a fading trail
  // behind the head, and whatever `body` draws at the head.
  function trajectory(fn, u, o) {
    o = o || {}; var g = C();
    var col = o.col || '#ffd089', A = o.alpha === undefined ? 1 : o.alpha;
    var N = o.n || 90, trail = o.trail === undefined ? 0.3 : o.trail;
    var uu = cl01(u);
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    if (o.ghost !== false) {
      // the whole route, faint: the viewer sees where it is going
      g.beginPath();
      for (var i = 0; i <= N; i++) { var p = fn(i / N); if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }
      g.setLineDash(o.dash || [12, 18]); g.strokeStyle = rgba(col, 0.16 * A); g.lineWidth = (o.lw || 5) * 0.6; g.stroke();
      g.setLineDash([]);
    }
    // the travelled part, brightening toward the head
    var steps = Math.max(2, Math.round(N * uu));
    for (var k = 0; k < steps; k++) {
      var u0 = uu * k / steps, u1 = uu * (k + 1) / steps;
      var p0 = fn(u0), p1 = fn(u1);
      var age = 1 - (uu - u1) / Math.max(1e-4, trail);     // 1 at the head
      var a = cl01(0.1 + 0.9 * age) * A;
      g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]);
      g.strokeStyle = rgba(col, a * 0.85); g.lineWidth = (o.lw || 5) * (0.45 + 0.55 * cl01(age)); g.stroke();
    }
    var h = fn(uu);
    if (o.glow !== false) glow(h[0], h[1], (o.r || 10) * 7, o.glowCol || col, 0.34 * A);
    if (o.body) o.body(h[0], h[1], uu);
    else { arcPath(g, h[0], h[1], o.r || 10); g.fillStyle = o.bodyCol || '#fff6e2'; g.fill(); }
    g.restore();
    return { x: h[0], y: h[1] };
  }

  /* ===================================================== §4 PHENOMENA ===== */
  function impactFlash(x, y, u, o) {
    o = o || {}; var g = C();
    var uu = cl01(u); if (uu <= 0 || uu >= 1) return;
    var r = o.r || 240, col = o.col || '#fff3cf', hot = o.hot || '#ffffff';
    // 3 frames up, the rest down: an impact has no ease-in
    var k = uu < 0.1 ? uu / 0.1 : Math.pow(1 - (uu - 0.1) / 0.9, 2.2);
    var A = (o.alpha === undefined ? 1 : o.alpha) * k;
    g.save();
    glow(x, y, r * 4.2 * (0.5 + uu * 1.4), col, 0.3 * A);
    glow(x, y, r * 1.7 * (0.4 + uu * 1.1), hot, 0.55 * A);
    arcPath(g, x, y, r * 0.42 * (0.3 + uu * 0.8) * k);
    g.fillStyle = rgba(hot, Math.min(0.92, A)); g.fill();
    // spikes: deterministic, seeded, and they shorten as the flash dies
    var tab = memo('imp:' + (o.seed || 13), function () {
      var rr = prng(o.seed || 13), a = [];
      for (var i = 0; i < 16; i++) a.push({ a: i / 16 * TAU + rr() * 0.3, l: 0.7 + rr() * 2.4, w: 0.3 + rr() * 0.8 });
      return a;
    });
    g.lineCap = 'round';
    for (var i = 0; i < tab.length; i++) {
      var s = tab[i], l1 = r * (0.5 + s.l * (0.4 + uu * 1.5));
      g.beginPath();
      g.moveTo(x + Math.cos(s.a) * r * 0.2, y + Math.sin(s.a) * r * 0.2);
      g.lineTo(x + Math.cos(s.a) * l1, y + Math.sin(s.a) * l1);
      g.strokeStyle = rgba(col, 0.3 * A); g.lineWidth = r * 0.07 * s.w; g.stroke();
    }
    g.restore();
  }
  function shockwave(x, y, u, o) {
    o = o || {}; var g = C();
    var uu = cl01(u); if (uu <= 0 || uu >= 1) return;
    var r0 = o.r0 || 40, r1 = o.r1 || 760, col = o.col || '#ffd9a0';
    var flat = o.flat === undefined ? 1 : o.flat;      // < 1 for a ground-plane ring
    var A = (o.alpha === undefined ? 1 : o.alpha) * Math.pow(1 - uu, 1.5);
    var rr = lp(r0, r1, eOut(uu));
    var th = Math.max(2, (o.thick || 26) * (1 - uu * 0.7));
    g.save();
    // a wave travelling over a body is clipped to that body, or it reads as a
    // hoop floating in front of it
    if (o.clip) { arcPath(g, o.clip.x, o.clip.y, o.clip.r); g.clip(); }
    g.translate(x, y); g.scale(1, flat);
    // leading edge bright, trailing wash soft: a wave front, not a hoop
    g.beginPath(); g.ellipse(0, 0, rr, rr, 0, 0, TAU);
    g.lineWidth = th; g.strokeStyle = rgba(col, 0.55 * A); g.stroke();
    g.beginPath(); g.ellipse(0, 0, rr * 0.985, rr * 0.985, 0, 0, TAU);
    g.lineWidth = th * 2.6; g.strokeStyle = rgba(col, 0.14 * A); g.stroke();
    g.beginPath(); g.ellipse(0, 0, rr * 1.01, rr * 1.01, 0, 0, TAU);
    g.lineWidth = th * 0.35; g.strokeStyle = rgba('#ffffff', 0.4 * A); g.stroke();
    if (o.fill) {
      g.beginPath(); g.ellipse(0, 0, rr, rr, 0, 0, TAU);
      g.fillStyle = radial(g, 0, 0, rr * 0.3, 0, 0, rr, [[0, rgba(col, 0)], [0.8, rgba(col, 0.03 * A)], [1, rgba(col, 0.12 * A)]]);
      g.fill();
    }
    g.restore();
  }
  function aurora(o) {
    o = o || {}; var g = C();
    var y = o.y === undefined ? CH() * 0.62 : o.y, t = o.t || 0;
    var n = o.n || 6, h = o.h || 520, A = o.alpha === undefined ? 1 : o.alpha;
    var seed = o.seed === undefined ? 41 : o.seed;
    var c1 = o.col1 || '#4cf0a8', c2 = o.col2 || '#2a6fd0', c3 = o.col3 || '#e05fa8';
    var tab = memo('aur:' + seed + ':' + n, function () {
      var rr = prng(seed), a = [];
      for (var i = 0; i < n; i++) a.push({ x: rr(), w: 0.1 + rr() * 0.24, h: 0.5 + rr() * 0.6, sp: 0.1 + rr() * 0.3, ph: rr() * TAU, k: 0.5 + rr() * 1.2, a: 0.4 + rr() * 0.6 });
      return a;
    });
    g.save();
    for (var i = 0; i < tab.length; i++) {
      var b = tab[i];
      var bx = b.x * CW(), bw = b.w * CW(), bh = b.h * h;
      g.save();
      // the curtain: a ribbon whose top and bottom edges wobble out of phase
      g.beginPath();
      var N = 24, j, px;
      for (j = 0; j <= N; j++) {
        px = bx - bw / 2 + bw * j / N;
        var sway = Math.sin(t * b.sp + b.ph + j * 0.45 * b.k) * bw * 0.1;
        g.lineTo(px + sway, y - bh + Math.sin(t * b.sp * 1.4 + b.ph + j * 0.3) * bh * 0.09);
      }
      for (j = N; j >= 0; j--) {
        px = bx - bw / 2 + bw * j / N;
        var sway2 = Math.sin(t * b.sp + b.ph + j * 0.45 * b.k) * bw * 0.1;
        g.lineTo(px + sway2 * 0.4, y + Math.sin(t * b.sp * 0.9 + b.ph + j * 0.25) * 16);
      }
      g.closePath();
      g.fillStyle = linear(g, 0, y - bh, 0, y, [
        [0, rgba(c3, 0.0)], [0.14, rgba(c3, 0.1 * b.a * A)], [0.42, rgba(c2, 0.14 * b.a * A)],
        [0.78, rgba(c1, 0.3 * b.a * A)], [1, rgba(c1, 0.04 * b.a * A)]]);
      g.fill();
      // folds: bright vertical striations inside the curtain
      g.save(); g.clip();
      for (j = 0; j < 9; j++) {
        var fx = bx - bw / 2 + bw * (j + 0.5) / 9 + Math.sin(t * b.sp * 1.1 + j * 1.7 + b.ph) * bw * 0.08;
        g.beginPath(); g.moveTo(fx, y - bh); g.lineTo(fx, y);
        g.strokeStyle = linear(g, 0, y - bh, 0, y, [[0, rgba(c1, 0)], [0.6, rgba(c1, 0.16 * A)], [1, rgba('#d8fff0', 0.3 * A)]]);
        g.lineWidth = bw * 0.035; g.stroke();
      }
      g.restore();
      g.restore();
      // the glow the curtain throws on the air below it
      glow(bx, y, bw * 0.75, c1, 0.1 * b.a * A);
    }
    g.restore();
  }

  /* ====================================================== §5 exports ===== */
  var COS = {
    // sky
    starfield: starfield, nebula: nebula, milkyWay: milkyWay, starTrails: starTrails,
    skyCycle: skyCycle, skyPalette: skyPalette, vignette: vignette, glow: glow,
    // bodies
    planet: planet, earth: earth, star: star, blackHole: blackHole,
    accretionDisc: accretionDisc, comet: comet, PRESETS: PRESETS,
    // orbits & motion
    orbitPath: orbitPath, orbitPos: orbitPos, tidalBulge: tidalBulge,
    eclipse: eclipse, trajectory: trajectory, arrow: arrow,
    // phenomena
    impactFlash: impactFlash, shockwave: shockwave, aurora: aurora,
    // lighting + constants
    light: light, LIGHT: LIGHT, normLight: normLight, moonPhaseLight: moonPhaseLight,
    MOON_R_RATIO: MOON_R_RATIO, MOON_DIST_RE: MOON_DIST_RE,
    BH_SHADOW_PER_RS: 2.598,            // sqrt(27)/2, Schwarzschild
    // escape hatches, documented so scenes never reach into the closure
    util: { mix: mix, shade: sh, rgba: rgba, prng: prng, ortho: ortho, nightPath: nightPath, sphereShade: sphereShade, atmoRim: atmoRim, ringSystem: ringSystem, glow: glow, memoClear: function () { CACHE = {}; } }
  };
  root.COS = COS;
})(typeof window !== 'undefined' ? window : this);
