---
name: canvas-motion-graphics
description: Motion-graphics craft in Canvas 2D for Shak Clips. Easing with cubic-bezier numbers, spring solvers, stagger, kinetic type, counters, charts and route draws, masks, camera moves, frame-blend blur.
---
# Canvas motion graphics

Use when building the non-character half of a shot: type, numbers, charts, maps, reveals, wipes and camera moves in
`engine/core.js`'s Canvas 2D at 1920×1080 / 30 fps. Shot order and pacing come from `explainer-video-direction`, figures from
`stick-figure-character-acting`. The helpers below (`ACT.*`) are in `out/acting.js`, loaded after core.js, used for its easing,
spring and stagger maths as much as its acting.

## 1. The determinism rule, first

Every frame is a function of `t` alone: no `Date.now()`, no `requestAnimationFrame`, no value carried from the last frame, no
unseeded `Math.random()` **[V]**. `engine/render.js` renders in segments and `sheet.js` samples out of order, so a stateful frame
renders differently each time.

- Randomness goes through core.js's seeded `rnd(seed)`, with the seed a **constant in the source** **[V]**.
- A physics settle must be **closed-form**, not an integrator. `ACT.spring` is the analytic step response, so frame 900 is correct
  without frames 0–899 **[V]**.
- `ctx.measureText` is fine, being deterministic for a loaded font — but await `document.fonts.load(...)` in `window.ready` before
  the first frame, or the opening seconds render in a fallback face **[V]**.

## 2. Easing library

`ACT.ease.<name>(t)` clamps t to 0..1. The four numbers are **[V]**: fitted numerically to each polynomial, then rounded to 2
decimals; `err` is the max error of the rounded values as printed, measured against `ACT.ease.<name>` over 1001 samples.
| Ease | cubic-bezier | err | Ease | cubic-bezier | err |
|---|---|---|---|---|---|
| `outQuad` | 0.30, 0.60, 0.64, 1.00 | 0.0020 | `inCubic` | 0.33, 0.00, 0.67, 0.00 | 0.0019 |
| `outCubic` | 0.33, 1.00, 0.67, 1.00 | 0.0019 | `inExpo` | 0.67, 0.00, 0.85, 0.00 | 0.0044 |
| `outQuint` | 0.21, 1.00, 0.36, 1.00 | 0.0108 | `inOutQuad` | 0.45, 0.00, 0.55, 1.00 | 0.0053 |
| `outExpo` | 0.15, 0.99, 0.31, 1.00 | 0.0041 | `inOutCubic` | 0.66, 0.00, 0.34, 1.00 | 0.0084 |
| `outBack` | 0.34, 1.56, 0.64, 1.00 | 0.0049 | `inOutSine` | 0.36, 0.00, 0.64, 1.00 | 0.0014 |

CSS's own keywords, from the Easing Functions spec **[V]**: `ease` = 0.25, 0.1, 0.25, 1; `ease-in-out` = 0.42, 0, 0.58, 1. **Ease by
role [H]:** arrivals ease out, camera and colour ease in-out, exits accelerate in; linear only for progress bars, constant pans and
rotation. **Opacity never bounces or overshoots.** One `outCubic` at one duration on everything is the clearest single tell of
generated motion.

## 3. Springs

`ACT.spring(t, {stiffness, damping, mass})` — closed-form step response, under/critically/overdamped. Name springs by **damping
ratio** ζ = c / (2√(km)); overshoot is exp(−πζ/√(1−ζ²)) **[V]**.
| Preset | k, c, m | ζ | Overshoot | Settles (1%) | Use |
|---|---|---|---|---|---|
| `snap` | 220, 29.7, 1 | 1.00 | 0% | 0.31 s / 9 f | anything that must not wobble |
| `premium` | 180, 20.9, 1 | 0.78 | ~2% | 0.43 s / 13 f | cards, tags, titles |
| `playful` | 160, 12.6, 1 | 0.50 | ~16% | 0.73 s / 22 f | gestures, pops |
| `cartoon` | 140, 6.6, 1 | 0.28 | ~40% | 1.4 s / 42 f | shock takes, impacts |
| `heavy` | 60, 13.9, 1 | 0.90 | ~1% | 0.66 s / 20 f | big objects, slumps |

Position and scale may bounce; **opacity, colour and blur never do [H]**. `ACT.springSettle(preset)` returns the settle time, so a
shot can be made long enough for its own motion to finish.

## 4. Stagger and overlap

```js
items.forEach((it, i) => {
  const k = ACT.ease.outCubic((tl - ACT.stagger(i, items.length, { each: 2/30 })) / 0.35);
  if (k > 0) withT(x(i), y, 0, k, () => card(it));     // withT is core.js: translate, rotate, uniform scale
});
```
Apart, at 30 fps **[H]**: letters 1 f (33 ms) · words 2–4 f (67–130 ms) · list rows and bars 5–8 f (170–270 ms) · map pins 3–5 f.
**Overlap**: the next element starts when the previous is **30–50% done** — fully sequential reads robotic, all at once reads cheap.
`ACT.stagger(i, n, {from: 'center'|'last'|index})` for grids and rows; `ACT.seq(tl, [['in',0.3],['hold',1.2]])` for staged builds.

## 5. Kinetic typography

- A landed title is **dead still [H]**. Motion moves to the next element or the camera — no idle float, pulse or creeping scale.
  core.js's `tag()` and `bigText()` already land and stop.
- Vary the entrance across a video: per-word opacity with no translate; per-word ink darkening; the whole line scaling from 0.92 on
  `outQuint`; one word arriving late in the accent colour. **Hold time** 0.5 s + 0.3 s per word, the video's last line 2 s+ **[H]**.
- Canvas has no text blur, so substitute per-word opacity plus a 2–4 px y offset, or draw the word twice at low alpha with a small
  offset **[H]**. Use tabular figures for anything counting, or changing digit widths jitter the number.

## 6. Counters, charts and map routes

**Counters** run 1.2–1.6 s then hold **[H]**. Land the end of the count on the spoken word: start it `duration` before `wordT(i,
'word')`, which is exactly what core.js's `wordT` exists for **[V]**.

`text(fmt(Math.round(target * ACT.ease.outQuint((tl - t0) / 1.4))), x, y, 120, GOLD, 900)` — always round, or a frame shows
3.0000001.

**Charts build in reading order [H]**: frame and axis, reference line, data, then one annotation on the mark that matters.
`extra.js`'s `barChart` staggers bars 0.25 s apart and prints each value only once its bar is 95% grown **[V]** — keep that rule.

**Line draw / stroke-dash reveal.** Canvas has no `pathLength`, so drive the dash offset from a known length **[V]**:
```js
ctx.setLineDash([L, L]); ctx.lineDashOffset = L * (1 - ACT.ease.outCubic(k));
ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
ctx.setLineDash([]);                        // ALWAYS reset: the dash is global canvas state
```
**Map routes**: core.js's `bgMap` takes `route: [a, b, k, bend]`, walks a quadratic Bézier to fraction `k` and hands back the moving
point for a vehicle **[V]**. Draw 0 → 1 over 1.0–1.6 s and pop the destination pin on arrival, never before **[H]**.

## 7. Masks and wipes

Canvas clipping is the mask: save, build the path, `clip()`, draw, restore — core.js does exactly this for the window in `bgRoom`
and the stripes on `capone` **[V]**.

```js
ctx.save(); rrect(x, y, w * ACT.ease.inOutCubic(k), h, 12); ctx.clip(); drawContents(); ctx.restore();
```
- **Wipe** = animate the clip rect's width or height; **iris** = animate a `circle()` clip radius out from the point of interest;
  **card flip** = `ctx.scale(Math.cos(a), 1)`, swapping faces at a > π/2 **[H]**. A clip edge is not reliably anti-aliased, so put
  the wipe edge over a contrasting shape or run a 6–8 px ink line along with it.
- Every `save()` needs its `restore()`. An unbalanced pair corrupts every later frame in the segment **[V]** — the usual cause of
  "the render drifts after shot 12".

## 8. Camera: push, pan, parallax

core.js projects with `translate(W/2, H/2); scale(z); translate(-cx, -cy)` and lerps two keyframes on `easeIO` across the whole shot
**[V]** — one move per shot, which is the right limit.

- **Push 3–8% over a shot** for emphasis; past ~12% it reads as a zoom, not a push **[H]**.
- The `ui()` callback draws **outside** the camera transform, so tags and titles hold still while the world moves **[V]**.
- **Parallax in 3 planes [H]**: far ×0.25, mid ×0.6, near ×1.0 of the camera's x offset; past three nobody sees the difference and
  the cost rises. Cut **at the fastest frame** of a move, matching direction on both sides.

## 9. Motion blur by frame blending

Canvas has no shutter. Render K sub-frames inside one output frame and average them **[H]**:

```js
for (let i = 0; i < K; i++) { ctx.globalAlpha = 1 / K; drawWorld(t + (i / K) * (SH / FPS)); }
ctx.globalAlpha = 1;                         // K = 3, shutter SH = 0.5 is enough for fast pans
```
Cost is K× the frame, so blend **only** the shots that need it. Cheaper substitutes that usually read better at this scale: a
3-frame dip to 60% before a hard cut, or a few trailing ghosts of the moving object at 25% alpha.

## 10. Particles and performance

- **Cap particles at ~60 and seed them [V]** — `extra.js`'s `confetti` uses 60 with `rnd(seed)` and positions derived from `t`
  alone, so it is frame-pure. Copy that shape; never append to an array across frames.
- Particles are for **two or three moments per video** (a payoff, a celebration, a collapse) **[H]**; continuous drifting dust is a
  generated-video tell.
- Budget: a 1920×1080 frame screenshots in roughly 40–80 ms under Playwright **[H]**, so a shot drawing 2000 shapes dominates the
  render. Clip offscreen work away rather than drawing it, and build gradients per draw, not per particle.
- Full-screen **linear** gradients band under H.264 on dark grounds; prefer a radial or a flat fill plus a local glow **[H]** —
  which is why `bgPlain`'s radial is the house default **[V]**.

## Sources

- `/home/claude/shakclips-studio/engine/core.js` and `extra.js` — camera transform, `wordT`, `bgMap` routes, `barChart`, `confetti`,
  `rnd`, clipping patterns; read directly. Cubic-bezier numbers fitted with SciPy against the standard polynomial eases, 2026-11-11;
  CSS keyword values from CSS Easing Functions Level 1.
- `juliangarnier/anime`, MIT — `src/easings/cubic-bezier/index.js` (Newton-plus-bisection solver, mirrored in `ACT.bez`),
  `src/easings/spring/index.js`, `src/utils/stagger.js` (`from: first|last|center`, grid and range staggers).
- `motion-canvas/motion-canvas`, MIT — `packages/core/src/tweening/spring.ts`: mass/stiffness/damping parameterisation, presets.
- `3b1b/manim`, MIT — `animation/animation.py` `get_sub_alpha` and `animation/creation.py`: the lag-ratio model behind §4, and the
  stroke-then-fill order of `DrawBorderThenFill` behind §6.
- `heygen-com/hyperframes`, Apache-2.0 — `references/motion.md` (ease by role, exits 40–50% shorter, overlap at 30–50%, stagger
  numbers) and `references/types/data.md`; `digitalsamba/claude-code-video-toolkit`, MIT — render purity, sub-range renders.
