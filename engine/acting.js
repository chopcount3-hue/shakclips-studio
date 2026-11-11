/* ============================================================================
 * acting.js — character-acting helpers for the Shak Clips stick-figure rig
 * ----------------------------------------------------------------------------
 * Load AFTER engine/core.js. Reads core.js's globals (ctx, lerp, clamp, person,
 * POSES, walkPose, runPose, rnd); writes nothing into them except one optional,
 * additive wrapper around the global `head` function (see §9). core.js itself is
 * never edited.
 *
 * EVERYTHING IS A PURE FUNCTION OF TIME. No Date.now(), no accumulated state, no
 * unseeded randomness. Frame N renders identically whether it is reached in order
 * or alone, which is what engine/render.js and sheet.js rely on.
 *
 * ---------------------------------------------------------------- rig contract
 * core.js pose object:  { aL:[shoulder, elbow], aR:[...], lL:[hip, knee], lR:[...],
 *                         lean?, headTilt?, bob? }
 * Angles are RADIANS. 0 = segment points straight DOWN (+y). Positive = toward
 * local +x (screen-right while `flip` is false). The first number is the joint's
 * ABSOLUTE angle; the second is the child segment's angle RELATIVE to it
 * (core.js draws the second segment at a1 + a2).
 * Geometry, in core.js units at s = 1: shoulders (-40, -284) and (40, -284),
 * upper arm 70, forearm 68; hips (-14, -150) and (14, -150), thigh 78, shin 76;
 * head centre (0, -366), r = 68. The person() origin sits at the feet, so a
 * transform about (x, y) squashes a figure against the ground.
 *
 * `bob` is a vertical offset in rig units. IMPORTANT: core.js only applies its
 * own idle breath when `pose.bob === undefined`. Every pose this module returns
 * carries an explicit numeric `bob` (its own breath included), which frees
 * `o.seed` to be used purely as a blink channel — see §7.
 *
 * ------------------------------------------------------------------------ API
 * §1 EASING     ACT.ease.<name>(t)            t and result clamped to 0..1
 *               ACT.bez(x1,y1,x2,y2) -> fn    cubic-bezier, Newton + bisect
 *               ACT.BEZ.<name>                the four numbers for each ease
 * §2 SPRINGS    ACT.spring(t, opts) -> 0..~1  closed-form damped oscillator
 *               ACT.springTo(t, a, b, opts)   same, mapped a -> b
 *               ACT.SPRING.<name>             {stiffness, damping, mass} presets
 * §3 STAGGER    ACT.stagger(i, n, opts)       per-index delay in seconds
 *               ACT.seq(tl, steps)            named step -> local progress 0..1
 * §4 POSES      ACT.POSE.<name>(t)            poses library (adds to core's)
 *               ACT.poseLerp(a, b, u)         joint-wise; EXTRAPOLATES past 0..1
 *               ACT.poseAdd(a, b, k)          a + k*b, for layering
 * §5 MOVES      ACT.move(tl, a, b, opts)      anticipation -> action -> overshoot
 *               ACT.act(tl, keys)             keyed pose timeline
 * §6 OVERLAP    ACT.follow(poseFn, tl, opts)  follow-through / drag on limbs
 * §7 EYES       ACT.eyes(tl, opts)            {closed, look, lookDur} seeded
 *               ACT.blinkSeed(faceT, closed)  -> the o.seed that forces a blink
 *               ACT.mouthT(open)              -> the o.t that forces a mouth
 * §8 MOUTH      ACT.lipFlap(tl, env, opts)    narration energy -> mouth opening
 * §9 SQUASH     ACT.squash(x, y, k, fn)       volume-preserving, anchored
 *               ACT.actor(id, o)              person() + squash + eye/mouth control
 * §A CYCLES     ACT.walk/run/point/shrug/shock/think/celebrate/slump(tl, opts)
 *               ACT.CYCLE                     frame counts at 30 fps
 *
 * Minimal use:
 *   ACT.actor('lustig', { x: 760, y: 1010, s: 1.3, t: tl, seed: 3,
 *     pose: ACT.point(tl, { t0: 0.4 }), face: 'smile', talk: energyAt(t) });
 * ========================================================================== */
(function (root) {
  'use strict';
  var FPS = 30;
  // core.js declares ctx/lerp/POSES/person with top-level const and function
  // declarations, so they live in the global lexical scope and are visible here.
  function need() {
    if (typeof person !== 'function' || typeof POSES !== 'object') {
      throw new Error('acting.js: load engine/core.js before acting.js');
    }
  }
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var _lerp = function (a, b, t) { return a + (b - a) * t; };
  var TAU = Math.PI * 2;

  // =========================================================== §1 easing
  // Cubic-bezier approximations fitted numerically (max error noted in the skill).
  var BEZ = {
    outQuad: [0.30, 0.60, 0.64, 1.00], outCubic: [0.33, 1.00, 0.67, 1.00],
    outQuart: [0.26, 1.00, 0.49, 1.00], outQuint: [0.21, 1.00, 0.36, 1.00],
    outExpo: [0.15, 0.99, 0.31, 1.00], outCirc: [0.00, 0.55, 0.45, 1.00],
    inQuad: [0.11, 0.00, 0.51, 0.00], inCubic: [0.33, 0.00, 0.67, 0.00],
    inQuart: [0.51, 0.00, 0.74, 0.00], inExpo: [0.67, 0.00, 0.85, 0.00],
    inOutSine: [0.36, 0.00, 0.64, 1.00], inOutQuad: [0.45, 0.00, 0.55, 1.00],
    inOutCubic: [0.66, 0.00, 0.34, 1.00], inOutQuart: [0.77, 0.00, 0.23, 1.00],
    cssEase: [0.25, 0.10, 0.25, 1.00], cssEaseInOut: [0.42, 0.00, 0.58, 1.00],
    outBack: [0.34, 1.56, 0.64, 1.00], inOutBack: [0.68, -0.60, 0.32, 1.60]
  };
  function bez(x1, y1, x2, y2) {
    var A = function (a1, a2, t) { return (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t; };
    var D = function (a1, a2, t) { return 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1; };
    return function (t) {
      t = clamp01(t); if (t === 0 || t === 1) return t;
      var s = t, i, d, e;                               // Newton first, then bisect to finish
      for (i = 0; i < 8; i++) { d = D(x1, x2, s); if (Math.abs(d) < 1e-6) break; e = A(x1, x2, s) - t; if (Math.abs(e) < 1e-7) break; s -= e / d; }
      // Newton stalls on the flat parts of a steep curve; bisect whenever it has
      // not converged, not just when it leaves [0,1], or the ease is visibly off.
      if (!(s >= 0 && s <= 1) || Math.abs(A(x1, x2, s) - t) > 1e-7) {
        var a = 0, b = 1; for (i = 0; i < 50; i++) { s = (a + b) / 2; if (A(x1, x2, s) - t > 0) b = s; else a = s; }
      }
      return A(y1, y2, s);
    };
  }
  var ease = {
    linear: clamp01,
    inQuad: function (t) { t = clamp01(t); return t * t; },
    outQuad: function (t) { t = clamp01(t); return 1 - (1 - t) * (1 - t); },
    inOutQuad: function (t) { t = clamp01(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    inCubic: function (t) { t = clamp01(t); return t * t * t; },
    outCubic: function (t) { t = clamp01(t); return 1 - Math.pow(1 - t, 3); },
    inOutCubic: function (t) { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    outQuart: function (t) { t = clamp01(t); return 1 - Math.pow(1 - t, 4); },
    outQuint: function (t) { t = clamp01(t); return 1 - Math.pow(1 - t, 5); },
    inExpo: function (t) { t = clamp01(t); return t <= 0 ? 0 : Math.pow(2, 10 * t - 10); },
    outExpo: function (t) { t = clamp01(t); return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    outCirc: function (t) { t = clamp01(t); return Math.sqrt(1 - Math.pow(t - 1, 2)); },
    inOutSine: function (t) { t = clamp01(t); return -(Math.cos(Math.PI * t) - 1) / 2; },
    smoothstep: function (t) { t = clamp01(t); return t * t * (3 - 2 * t); },
    smootherstep: function (t) { t = clamp01(t); return t * t * t * (t * (6 * t - 15) + 10); },
    // overshoot family: s is the overshoot strength, 1.70158 ~= 10% past the target
    outBack: function (t, s) { t = clamp01(t); s = s === undefined ? 1.70158 : s; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
    inBack: function (t, s) { t = clamp01(t); s = s === undefined ? 1.70158 : s; return (s + 1) * t * t * t - s * t * t; },
    outElastic: function (t, p) { t = clamp01(t); if (t === 0 || t === 1) return t; p = p || 0.3; return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * TAU / p) + 1; },
    // anticipation built into one curve: dips below 0, then drives past the target
    anticipate: function (t, pull) { t = clamp01(t); pull = pull === undefined ? -0.5 : pull; var m = 1 - t; return 15 * t * t * Math.pow(m, 4) * pull + 20 * Math.pow(t, 3) * Math.pow(m, 3) * pull + 15 * Math.pow(t, 4) * m * m + 6 * Math.pow(t, 5) * m + Math.pow(t, 6); },
    thereAndBack: function (t) { t = clamp01(t); return Math.sin(Math.PI * t); }
  };
  Object.keys(BEZ).forEach(function (k) { if (!ease[k]) ease[k] = bez.apply(null, BEZ[k]); });

  // ========================================================== §2 springs
  // Closed-form step response of m x'' + c x' + k x = k, x(0)=0, x'(0)=v0.
  // Analytic, so a frame never depends on the frames before it.
  var SPRING = {
    snap: { stiffness: 220, damping: 29.7, mass: 1 },     // zeta 1.00, no overshoot
    premium: { stiffness: 180, damping: 20.9, mass: 1 },     // zeta 0.78, ~2% overshoot
    playful: { stiffness: 160, damping: 12.6, mass: 1 },     // zeta 0.50, ~16% overshoot
    cartoon: { stiffness: 140, damping: 6.6, mass: 1 },     // zeta 0.28, ~40% overshoot
    heavy: { stiffness: 60, damping: 13.9, mass: 1 }      // zeta 0.90, slow, ~0.6 s
  };
  function spring(t, o) {
    o = o || SPRING.premium;
    if (t <= 0) return 0;
    var m = o.mass || 1, k = o.stiffness, c = o.damping, v0 = o.velocity || 0;
    var w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    if (z < 1 - 1e-6) {
      var wd = w0 * Math.sqrt(1 - z * z);
      return 1 + Math.exp(-z * w0 * t) * (-Math.cos(wd * t) + ((v0 - z * w0) / wd) * Math.sin(wd * t));
    }
    if (z <= 1 + 1e-6) return 1 + (-1 + (v0 - w0) * t) * Math.exp(-w0 * t);
    var rt = w0 * Math.sqrt(z * z - 1), r1 = -z * w0 + rt, r2 = -z * w0 - rt;
    var C1 = (v0 + r2) / (r1 - r2);
    return 1 + C1 * Math.exp(r1 * t) + (-1 - C1) * Math.exp(r2 * t);
  }
  function springTo(t, a, b, o) { return a + (b - a) * spring(t, o); }
  // settle time (s) to within tol of the target, for planning shot lengths
  function springSettle(o, tol) {
    o = o || SPRING.premium; tol = tol || 0.01;
    var m = o.mass || 1, w0 = Math.sqrt(o.stiffness / m), z = o.damping / (2 * Math.sqrt(o.stiffness * m));
    return -Math.log(tol) / (Math.min(z, 1) * w0);
  }

  // ========================================================= §3 stagger
  // Returns the delay in SECONDS for item i of n. `from`: 'first'|'last'|'center'|index.
  function stagger(i, n, o) {
    o = o || {}; var each = o.each === undefined ? 2 / FPS : o.each;
    var from = o.from === undefined ? 'first' : o.from;
    var anchor = from === 'last' ? n - 1 : from === 'center' ? (n - 1) / 2 : typeof from === 'number' ? from : 0;
    var d = Math.abs(i - anchor);
    if (o.total !== undefined) { var maxD = Math.max(anchor, n - 1 - anchor) || 1; return (o.start || 0) + o.total * (d / maxD); }
    var u = o.ease ? o.ease(d / Math.max(1, n - 1)) * Math.max(1, n - 1) : d;
    return (o.start || 0) + each * u;
  }
  // steps: [[name, duration], ...]. Returns {name, u, done} for the local time tl.
  function seq(tl, steps) {
    var acc = 0, i;
    for (i = 0; i < steps.length; i++) {
      var d = steps[i][1];
      if (tl < acc + d || i === steps.length - 1) return { name: steps[i][0], u: clamp01((tl - acc) / d), i: i, done: tl >= acc + d };
      acc += d;
    }
    return { name: null, u: 1, i: -1, done: true };
  }

  // =========================================================== §4 poses
  var J = ['aL', 'aR', 'lL', 'lR'];
  function resolve(p, t) { return typeof p === 'function' ? p(t || 0) : p; }
  // Joint-wise linear blend. u < 0 and u > 1 EXTRAPOLATE, which is how §5 gets
  // anticipation and overshoot out of one scalar. Angles are plain-lerped: every
  // core.js pose stays inside (-pi, pi) per joint, so no wrap handling is needed.
  function poseLerp(a, b, u, t) {
    a = resolve(a, t); b = resolve(b, t); var out = {}, i, k;
    for (i = 0; i < J.length; i++) {
      k = J[i]; var pa = a[k] || [0, 0], pb = b[k] || [0, 0];
      out[k] = [_lerp(pa[0], pb[0], u), _lerp(pa[1], pb[1], u)];
    }
    out.lean = _lerp(a.lean || 0, b.lean || 0, u);
    out.headTilt = _lerp(a.headTilt || 0, b.headTilt || 0, u);
    out.bob = _lerp(a.bob || 0, b.bob || 0, u);
    return out;
  }
  function poseAdd(a, b, k) {
    a = resolve(a); b = resolve(b); k = k === undefined ? 1 : k; var out = {}, i, j;
    for (i = 0; i < J.length; i++) { j = J[i]; var pa = a[j] || [0, 0], pb = b[j] || [0, 0]; out[j] = [pa[0] + pb[0] * k, pa[1] + pb[1] * k]; }
    out.lean = (a.lean || 0) + (b.lean || 0) * k;
    out.headTilt = (a.headTilt || 0) + (b.headTilt || 0) * k;
    out.bob = (a.bob || 0) + (b.bob || 0) * k;
    return out;
  }
  function breath(t, seed, amt) { return (amt === undefined ? 2.5 : amt) * Math.sin((t || 0) * 2.6 + (seed || 0)); }

  // Poses this module adds. core.js's POSES stay available and interchangeable.
  var POSE = {
    // Breakdown poses: the in-between that gives a move its arc, not a mid-lerp.
    // These are right-arm (aR) shapes; mirror them by hand for the left arm,
    // because poseLerp blends every joint and would move the idle arm too.
    pointBreak: function () { return { aL: [0.18, 0.20], aR: [-0.85, -0.95], lL: [0.08, 0], lR: [-0.08, 0] } },
    pointBreakL: function () { return { aL: [0.85, 0.95], aR: [-0.18, -0.20], lL: [0.08, 0], lR: [-0.08, 0] } },
    shockBreak: function () { return { aL: [0.55, 0.9], aR: [-0.55, -0.9], lL: [0.10, -0.08], lR: [-0.10, -0.08], lean: -0.05 } },
    // held poses.
    // Stance note: the left leg is drawn from hip x = -14 and the right from +14,
    // so a WIDE stance needs lL negative and lR positive. core.js's own idle
    // (lL +0.06 / lR -0.06) converges the feet; copying that sign pattern at a
    // larger angle crosses the legs over each other.
    brace: function () { return { aL: [0.62, -0.5], aR: [-0.62, 0.5], lL: [-0.20, -0.14], lR: [0.20, -0.14], lean: -0.04 } },
    // hands thrown out and up, feet braced apart, weight back off the threat
    recoil: function () { return { aL: [1.55, 1.05], aR: [-1.55, -1.05], lL: [-0.26, -0.10], lR: [0.34, -0.05], lean: -0.13, headTilt: -0.06 } },
    slumped: function () { return { aL: [0.30, 0.55], aR: [-0.30, -0.55], lL: [0.10, -0.1], lR: [-0.10, -0.1], lean: 0, headTilt: 0.14, bob: -14 } },
    thinkTap: function (t) { return { aL: [0.12, 0.18], aR: [-0.5, 2.5 + 0.09 * Math.sin((t || 0) * 7)], lL: [0.07, 0], lR: [-0.07, 0], headTilt: 0.07 } },
    cheer: function (t) { return { aL: [2.6 + 0.14 * Math.sin((t || 0) * 9), 0.22], aR: [-2.6 - 0.14 * Math.sin((t || 0) * 9 + 1), -0.22], lL: [0.16, 0], lR: [-0.16, 0] } },
    reachOut: function () { return { aL: [0.14, 0.16], aR: [-1.15, -0.55], lL: [0.09, 0], lR: [-0.09, 0], lean: 0.05 } },
    lean_in: function () { return { aL: [0.35, 0.2], aR: [-0.35, -0.2], lL: [0.14, 0], lR: [-0.22, -0.05], lean: 0.09 } }
  };

  // =========================================================== §5 moves
  // One scalar u(tl) drives the whole move, including anticipation (u < 0) and
  // overshoot (u > 1), because poseLerp extrapolates.
  //   t0     start of the anticipation, in shot-local seconds
  //   antic  anticipation duration (s); amt how far back it pulls, in units of (b - a)
  //   dur    the action itself; after it, the spring settles
  //   ease   'spring' (default) | 'back' | any ACT.ease name
  function moveU(tl, o) {
    o = o || {};
    var t0 = o.t0 || 0, ta = o.antic === undefined ? 5 / FPS : o.antic;
    var amt = o.anticAmt === undefined ? 0.22 : o.anticAmt;
    var dur = o.dur === undefined ? 8 / FPS : o.dur;
    var x = tl - t0;
    if (x <= 0) return 0;
    if (x < ta) return -amt * ease.inOutSine(x / ta);          // settle into the counter-pose
    var y = x - ta;
    if (o.ease === 'back') {
      var k = ease.outBack(y / dur, o.over === undefined ? 1.70158 : o.over);
      return -amt + (1 + amt) * k;
    }
    if (typeof o.ease === 'string' && ease[o.ease]) return -amt + (1 + amt) * ease[o.ease](y / dur);
    if (typeof o.ease === 'function') return -amt + (1 + amt) * o.ease(clamp01(y / dur));
    // spring: overshoot and settle come free. The presets are tuned for a ~0.26 s
    // action, so `dur` scales the spring's clock rather than cutting it off.
    var sp = o.spring || SPRING.playful;
    return -amt + (1 + amt) * spring(y * (0.26 / dur), sp);
  }
  function move(tl, a, b, o) {
    o = o || {}; var u = moveU(tl, o);
    var p = poseLerp(a, b, u, tl);
    if (o.breakdown) {                                          // pull the arc through a breakdown pose
      var w = ease.thereAndBack(clamp01(u)) * (o.breakdownAmt === undefined ? 0.5 : o.breakdownAmt);
      p = poseLerp(p, resolve(o.breakdown, tl), w, tl);
    }
    return p;
  }
  // keys: [[t, pose, opts?], ...] in increasing t. Holds the last pose after it.
  function act(tl, keys) {
    var i = keys.length - 1;
    while (i > 0 && keys[i][0] > tl) i--;
    if (i === 0) return resolve(keys[0][1], tl);
    var prev = keys[i - 1], cur = keys[i], o = Object.assign({}, cur[2] || {});
    o.t0 = cur[0];
    if (o.dur === undefined) o.dur = Math.max(4 / FPS, Math.min(12 / FPS, (cur[0] - prev[0]) * 0.45));
    return move(tl, prev[1], cur[1], o);
  }

  // ========================================================= §6 overlap
  // Follow-through: the forearm and shin lag the limb that drives them. Measured
  // from the pose function by finite difference, so it stays frame-pure.
  //   lag    seconds the child joint trails (0.05-0.10 reads as weight)
  //   whip   how strongly angular velocity bends the child joint back
  function follow(poseFn, tl, o) {
    o = o || {};
    var lag = o.lag === undefined ? 2 / FPS : o.lag;
    var whip = o.whip === undefined ? 0.10 : o.whip;
    var dt = o.dt || 1 / FPS;
    var joints = o.joints || J;
    var now = resolve(poseFn, tl), back = resolve(poseFn, tl - lag), prev = resolve(poseFn, tl - dt);
    var out = Object.assign({}, now), i;
    for (i = 0; i < joints.length; i++) {
      var k = joints[i];
      if (!now[k]) continue;
      var omega = ((now[k][0] - prev[k][0]) / dt);
      var drag = o.drag === undefined ? 0.45 : o.drag;
      var child = _lerp(now[k][1], (back[k] || now[k])[1], drag) - whip * omega;
      out[k] = [now[k][0], child];
    }
    if (o.head !== false) {                                     // the head trails the lean a little
      var dlean = ((now.lean || 0) - (prev.lean || 0)) / dt;
      out.headTilt = (now.headTilt || 0) - (o.headWhip === undefined ? 0.035 : o.headWhip) * dlean;
    }
    return out;
  }

  // ============================================================ §7 eyes
  // Deterministic, seeded blink + eye-dart schedule. Built forward from t = 0 and
  // cached per seed; the cache only ever grows, so out-of-order frames agree.
  function lcg(seed) { var a = (seed | 0) || 1; return function () { a = (a * 1664525 + 1013904223) | 0; return ((a >>> 8) & 0xffffff) / 0x1000000; }; }
  var _sched = {};
  function schedule(seed, until) {
    var S = _sched[seed];
    if (!S) S = _sched[seed] = { t: 0, dt: 0, blinks: [], darts: [], rb: lcg(seed * 2 + 11), rd: lcg(seed * 2 + 77), look: 0 };
    while (S.t < until) {                                        // blink every 2.0-5.5 s, 3-4 frames closed
      var gap = 2.0 + S.rb() * 3.5, dur = (3 + Math.round(S.rb())) / FPS;
      S.t += gap; S.blinks.push([S.t, dur]);
      if (S.rb() < 0.18) { S.t += 0.14 + S.rb() * 0.1; S.blinks.push([S.t, dur]); }   // occasional double blink
    }
    while (S.dt < until) {                                       // dart every 0.8-2.6 s to a new target
      S.dt += 0.8 + S.rd() * 1.8;
      var opts = [-1, -0.6, -0.3, 0, 0.3, 0.6, 1], nx = opts[Math.floor(S.rd() * opts.length)];
      if (nx === S.look) nx = -nx;
      S.look = nx; S.darts.push([S.dt, nx]);
    }
    return S;
  }
  // Returns {closed: bool, look: -1..1}. opts: {seed, rate, noDart, hold}
  function eyes(tl, o) {
    o = o || {}; var seed = o.seed === undefined ? 1 : o.seed;
    var S = schedule(seed, Math.max(0, tl) + 8), i, closed = false;
    if (!o.noBlink) for (i = 0; i < S.blinks.length; i++) { var b = S.blinks[i]; if (tl >= b[0] && tl < b[0] + b[1]) { closed = true; break; } }
    if (o.blinkAt) for (i = 0; i < o.blinkAt.length; i++) { if (tl >= o.blinkAt[i] && tl < o.blinkAt[i] + 4 / FPS) closed = true; }
    var look = 0, prev = 0;
    if (!o.noDart) {
      for (i = 0; i < S.darts.length; i++) {
        if (S.darts[i][0] > tl) break;
        prev = look; look = S.darts[i][1];
        var since = tl - S.darts[i][0];
        if (since < 0.08) look = _lerp(prev, look, ease.outQuad(since / 0.08));   // darts are fast, 2-3 frames
      }
    }
    if (o.look !== undefined) look = o.look;
    return { closed: closed, look: look };
  }
  // core.js computes blink itself as ((t*0.8 + seed) % 3.3) < 0.12 and gives no
  // override. These two helpers choose the (t, seed) pair handed to person() so
  // that core's own formulas land on the mouth and blink state we want. Safe only
  // because every pose here carries an explicit `bob`, which stops core.js from
  // using `seed` for its idle breath as well.
  function mouthT(open) { return open ? Math.PI / 44 : 3 * Math.PI / 44; }   // sin(t*22) > 0 <=> open
  function blinkSeed(faceT, closed) {
    var target = closed ? 0.05 : 1.65, s = target - (faceT || 0) * 0.8;
    return s - 3.3 * Math.floor(s / 3.3);
  }

  // =========================================================== §8 mouth
  // env: 0..1 narration energy for this frame (RMS of the voice, or a word-density
  // proxy from timing.json). Returns {open, face} — `face` is a core.js face name
  // whose eyes and brows match `shut`, so only the mouth changes between frames.
  function lipFlap(tl, env, o) {
    o = o || {};
    var rate = o.rate === undefined ? 7.5 : o.rate;             // syllables/s at full energy
    var e = clamp01(env === undefined ? 0 : env);
    var gate = o.gate === undefined ? 0.08 : o.gate;
    if (e < gate) return { open: false, face: o.shut || 'smile', env: e };
    var ph = tl * rate * (0.55 + 0.45 * e);
    var open = (ph - Math.floor(ph)) < (0.35 + 0.3 * e);        // louder = mouth open for longer
    return { open: open, face: open ? (o.openFace || 'talk') : (o.shut || 'smile'), env: e };
  }
  // Word-density energy from a timing.json-style sentence span, when there is no
  // audio envelope: 1 near the middle of a word, lower in the gaps.
  function envFromSentence(t, span, text) {
    if (!span || t < span[0] || t > span[1]) return 0;
    var u = (t - span[0]) / (span[1] - span[0]), n = (text || '').length || 1;
    var k = u * n, words = (text || '').split(/\s+/), acc = 0, i;
    for (i = 0; i < words.length; i++) {
      var a = acc, b = acc + words[i].length; acc = b + 1;
      if (k >= a && k <= b) return 0.45 + 0.55 * ease.thereAndBack((k - a) / Math.max(1, b - a));
    }
    return 0.12;
  }

  // ================================================= §9 squash / actor
  // Volume-preserving squash about (x, y). k > 0 stretches tall, k < 0 squashes
  // wide. person()'s origin is at the feet, so pass the figure's ground point.
  function squash(x, y, k, fn) {
    var g = ctxOf(), sy = 1 + k, sx = 1 / sy;
    g.save(); g.translate(x, y); g.scale(sx, sy); fn(); g.restore();
  }
  // core.js's `ctx` is a global lexical binding, so it is in scope here.
  function ctxOf() { return ctx; }

  // Additive wrapper on the global `head` so the head can squash independently of
  // the body without editing core.js. core.js declares `head` with a function
  // declaration, so it is a property of the global object and person() resolves it
  // at call time; the wrapper is identity unless _headSq is set for this draw.
  var _headSq = null, _hooked = false;
  function installHeadHook() {
    if (_hooked || typeof root.head !== 'function') return;
    var orig = root.head;
    root.head = function (c, R, o) {
      if (!_headSq) return orig(c, R, o);
      var k = _headSq, g = ctxOf();
      g.save(); g.scale(1 / (1 + k), 1 + k); orig(c, R, o); g.restore();
    };
    _hooked = true;
  }

  // Drop-in replacement for person(). Extra options on top of core.js's:
  //   squash      number, body squash/stretch (volume preserving, about the feet)
  //   headSquash  number, head only (installs the §9 hook on first use)
  //   eyes        {seed, look, noBlink, noDart, blinkAt:[t,..]} | false
  //   talk        0..1 narration energy, or true for a plain flap, or false
  //   shut/openFace  face names for the closed and open mouth (default smile/talk)
  // Everything else (x, y, s, face, flip, lean, prop, propL, tilt, crown, ...) is
  // passed through untouched.
  function actor(id, o) {
    need();
    var p = resolve(o.pose, o.t) || POSES.idle(o.t || 0);
    p = Object.assign({}, p);
    if (p.bob === undefined) p.bob = breath(o.t, o.seed, o.breath);   // frees `seed` for blink control
    var E = o.eyes === false ? { closed: false, look: o.look || 0 }
      : eyes(o.t || 0, Object.assign({ seed: o.seed === undefined ? 1 : o.seed }, o.eyes || {}));
    var face = o.face || 'neutral', ft = mouthT(false);
    if (o.talk === true || typeof o.talk === 'number') {
      // The mouth comes from the flap, swapping between two faces. Pick a `shut`
      // face whose eyes and brows match `openFace` or the eyes will flicker;
      // the default pair (smile / talk) is identical apart from the mouth.
      var L = lipFlap(o.t || 0, o.talk === true ? 0.7 : o.talk,
        { shut: o.shut || (o.face === undefined ? 'smile' : o.face), openFace: o.openFace || 'talk' });
      face = L.face; ft = mouthT(L.open);
    }
    var opts = Object.assign({}, o, {
      pose: p, face: face, t: ft, seed: blinkSeed(ft, E.closed),
      look: E.look, talk: false
    });
    delete opts.squash; delete opts.headSquash; delete opts.eyes; delete opts.shut; delete opts.openFace; delete opts.breath;
    if (o.headSquash) { installHeadHook(); _headSq = o.headSquash; }
    try {
      if (o.squash) {
        var sy = 1 + o.squash, sx = 1 / sy, g = ctxOf();
        g.save(); g.translate(o.x, o.y); g.scale(sx, sy);
        person(id, Object.assign({}, opts, { x: 0, y: 0 }));
        g.restore();
      } else {
        person(id, opts);
      }
    } finally { _headSq = null; }
  }

  // ========================================================== §A cycles
  // Frame counts at 30 fps. These are the shapes; tune per shot, not per frame.
  var CYCLE = {
    walk: { cycle: 24, contact: [0, 12], note: '2 steps per cycle, 0.80 s' },
    run: { cycle: 16, contact: [0, 8], note: '2 steps per cycle, 0.53 s' },
    point: { antic: 4, action: 5, settle: 7, hold: 12 },
    shrug: { antic: 3, up: 5, hold: 6, down: 7 },
    shock: { antic: 2, action: 3, over: 4, settle: 8, hold: 10 },
    think: { in: 8, loop: 60, out: 8 },
    celebrate: { antic: 4, up: 5, cycle: 18 },
    slump: { antic: 6, fall: 14, settle: 20 }
  };
  function fr(n) { return n / FPS; }

  function walk(tl, o) {
    o = o || {}; var cyc = fr(o.frames || CYCLE.walk.cycle), amp = o.amp === undefined ? 1 : o.amp;
    var ph = TAU * (tl / cyc) + (o.phase || 0);
    var p = Object.assign({}, walkPose(ph, amp));
    p.lean = (o.lean === undefined ? 0.03 : o.lean) * amp;
    p.headTilt = -0.02 * amp * Math.sin(ph);
    // weight: the body drops on each contact, where |cos| is 0
    p.bob = Math.abs(Math.cos(ph)) * 6 * amp - 2 * amp;
    return p;
  }
  function run(tl, o) {
    o = o || {}; var cyc = fr(o.frames || CYCLE.run.cycle);
    var ph = TAU * (tl / cyc) + (o.phase || 0);
    var p = Object.assign({}, runPose(ph));
    p.headTilt = -0.05;
    return p;
  }
  function point(tl, o) {
    o = o || {}; var C = CYCLE.point;
    var to = o.to || (o.left ? POSES.pointL(tl) : POSES.point(tl));
    // No breakdown pose here: POSE.pointBreak is built for the right arm, and a
    // symmetric blend would drag the other arm down mid-action. The arc comes
    // from follow(), whose elbow whip folds the forearm back as the arm drives out.
    return move(tl, o.from || POSES.idle(tl), to, Object.assign({
      t0: o.t0 || 0, antic: fr(C.antic), anticAmt: 0.26, dur: fr(C.action),
      spring: SPRING.playful
    }, o.move || {}));
  }
  function shrug(tl, o) {
    o = o || {}; var C = CYCLE.shrug, t0 = o.t0 || 0;
    var up = fr(C.antic) + fr(C.up), hold = up + fr(C.hold);
    if (tl < t0 + hold) return move(tl, POSES.idle(tl), POSES.shrug(), { t0: t0, antic: fr(C.antic), anticAmt: 0.18, dur: fr(C.up), spring: SPRING.snap });
    return move(tl, POSES.shrug(), POSES.idle(tl), { t0: t0 + hold, antic: 0, dur: fr(C.down), ease: 'outQuad' });
  }
  function shock(tl, o) {
    o = o || {}; var C = CYCLE.shock, t0 = o.t0 || 0;
    // anticipation is a small compression IN, then the whole body throws back
    return move(tl, o.from || POSES.idle(tl), POSE.recoil(), {
      t0: t0, antic: fr(C.antic), anticAmt: 0.30, dur: fr(C.action + C.over),
      spring: SPRING.cartoon, breakdown: POSE.shockBreak(), breakdownAmt: 0.55
    });
  }
  // The matching squash/stretch for a shock take: compress on the anticipation,
  // snap past the rest height, then ring down. Feed it to actor({squash|headSquash}).
  function shockSquash(tl, o) {
    o = o || {}; var t0 = o.t0 || 0, C = CYCLE.shock, x = tl - t0, ta = fr(C.antic);
    var amp = o.amp === undefined ? 0.12 : o.amp;
    if (x < 0) return 0;
    if (x < ta) return -amp * ease.inOutSine(x / ta);
    // the cartoon preset overshoots ~40%, so this stretches to about +0.4*amp
    return -amp + amp * spring(x - ta, SPRING.cartoon);
  }
  function think(tl, o) {
    o = o || {}; var C = CYCLE.think, t0 = o.t0 || 0;
    return move(tl, POSES.idle(tl), POSE.thinkTap(tl), { t0: t0, antic: fr(3), anticAmt: 0.12, dur: fr(C.in), ease: 'outCubic' });
  }
  function celebrate(tl, o) {
    o = o || {}; var C = CYCLE.celebrate, t0 = o.t0 || 0;
    return move(tl, POSES.idle(tl), POSE.cheer(tl), { t0: t0, antic: fr(C.antic), anticAmt: 0.35, dur: fr(C.up), spring: SPRING.cartoon });
  }
  function slump(tl, o) {
    o = o || {}; var C = CYCLE.slump, t0 = o.t0 || 0;
    return move(tl, POSES.idle(tl), POSE.slumped(), { t0: t0, antic: fr(C.antic), anticAmt: -0.14, dur: fr(C.fall), spring: SPRING.heavy });
  }

  root.ACT = {
    FPS: FPS, fr: fr, ease: ease, bez: bez, BEZ: BEZ,
    spring: spring, springTo: springTo, springSettle: springSettle, SPRING: SPRING,
    stagger: stagger, seq: seq,
    POSE: POSE, poseLerp: poseLerp, poseAdd: poseAdd, breath: breath,
    move: move, moveU: moveU, act: act, follow: follow,
    eyes: eyes, blinkSeed: blinkSeed, mouthT: mouthT,
    lipFlap: lipFlap, envFromSentence: envFromSentence,
    squash: squash, actor: actor, installHeadHook: installHeadHook,
    CYCLE: CYCLE, walk: walk, run: run, point: point, shrug: shrug,
    shock: shock, shockSquash: shockSquash, think: think, celebrate: celebrate, slump: slump
  };
})(typeof window !== 'undefined' ? window : globalThis);
