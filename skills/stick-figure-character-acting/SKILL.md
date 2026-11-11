---
name: stick-figure-character-acting
description: Act the Shak Clips person() rig. The 12 principles on a stick figure, pose-to-pose breakdowns, a poses library, walk run point shrug shock cycles in frames, eye and brow acting, lip flap, weight.
---
# Stick-figure character acting

Use when a figure in a Shak Clips explainer has to *perform* — react, point, walk, think, collapse — rather than stand in a pose
while the narration talks.

Shot structure and continuity live in `explainer-video-direction`, the ffmpeg side in `video-editing-polish`; this skill is only
what happens inside one figure. The code is `out/acting.js`, which layers on `engine/core.js` without editing it.

## 1. The rig, in numbers

core.js pose object: `{aL:[shoulder, elbow], aR, lL:[hip, knee], lR, lean?, headTilt?, bob?}` **[V]**
| Fact | Value |
|---|---|
| Angle 0 | segment points straight **down**; positive turns toward local +x (screen-right when `flip` is false) |
| First number | the joint's **absolute** angle; second is the child segment **relative** to it (`a1 + a2`) |
| Shoulders / arm | (±40, −284); upper arm 70, forearm 68, hand r 12 |
| Hips / leg | (±14, −150); thigh 78, shin 76 |
| Head | centre (0, −366), r 68; eyes at (±24, −6), brows at eye −24, mouth at +30 |
| Stroke | body ink `LW` 7; arms 18, legs 19, with the cloth colour drawn at `lw − 9` |
| Origin | `person()` draws from the **feet**, so a transform about (x, y) squashes against the ground |

**The stance sign trap [V].** The left leg is drawn from hip x = −14 and the right from +14. core.js's idle uses `lL:[+0.06]` /
`lR:[−0.06]`, which *converges* the feet. Copy that sign pattern at a larger angle and the legs **cross over each other**. A wide
braced stance needs `lL` negative and `lR` positive.

## 2. The 12 principles on this rig
| Principle | On a stick figure | Number |
|---|---|---|
| Anticipation | the opposite of the action first; the body counter-leans | 3–5 f, 20–40% of the move **[H]** |
| Squash / stretch | whole-figure scale about the feet, head scaled separately | peak ±0.10–0.15 **[H]** |
| Follow-through | forearm and shin keep going after the upper limb stops | lag 2–3 f, whip 0.08–0.16 rad·s **[H]** |
| Overlapping action | head leads, torso follows, hands last | 1–3 f apart **[H]** |
| Arcs | the elbow folds back as the arm drives out, so the hand sweeps a curve | from the whip term, not a pose **[V]** |
| Slow in / slow out | spring settle, never a linear joint ramp | §5 of `canvas-motion-graphics` |
| Secondary action | a blink, a prop swing, the hat, the coat line | one only, off the main beat **[H]** |
| Staging | one readable silhouette; arms clear of the torso | see §8 **[H]** |
| Pose-to-pose | key, breakdown, settle — never a straight lerp | §3 |
| Timing | §5 table | |
| Exaggeration | the rig has no face muscles, so push the **body** | 1.3–1.6× a real pose **[H]** |
| Appeal / solid drawing | consistent head size and line weight across the video | fixed per video **[H]** |

The list itself is Thomas & Johnston's, from *Disney Animation: The Illusion of Life* (1981) **[V]**.

## 3. Pose-to-pose, with breakdowns

One scalar drives a whole move, because `poseLerp` **extrapolates** outside 0..1: negative u *is* the anticipation, u > 1 *is* the
overshoot **[V]**.
```js
const MV = { t0: 0.8, antic: 4/30, anticAmt: 0.38, dur: 5/30, spring: ACT.SPRING.playful };
const poseFn = (tt) => ACT.point(tt, { t0: 0.8, left: true, move: MV });
const u = ACT.moveU(tl, MV);                       // -0.38 -> 1.16 -> 1
let p = ACT.follow(poseFn, tl, { lag: 2/30, whip: 0.12, drag: 0.5 });
p.lean = (p.lean || 0) + 0.05 * Math.min(0, u);    // body counters the gesture
ACT.actor('lustig', { x: 700, y: 980, s: 1.35, t: tl, seed: 3, pose: p, face: 'sly' });
```
- A **breakdown pose** is the in-between that carries the arc. `ACT.move(..., {breakdown, breakdownAmt})` blends it in on a there-
  and-back weight, peaking mid-action.
- Breakdown poses are **not mirror-safe [V]**: `poseLerp` blends every joint, so a right-arm breakdown dragged the idle left arm
  down mid-point in testing. Use `POSE.pointBreak` / `POSE.pointBreakL`, or drop the breakdown and let `follow()`'s elbow whip make
  the arc — usually the better read.
- `ACT.act(tl, [[t, pose, opts], ...])` chains keys, each segment getting its own anticipation.

## 4. Poses library spec

A pose entry is a **pure function of local time** returning the core.js pose object. Rules: 1. Return all four joints, even
unchanged ones, so `poseLerp` never reads a missing key. 2. Put the idle wobble *inside* the pose (`0.05 * Math.sin(t * 6)`), never
in the shot code. 3. Set `bob` explicitly. core.js only applies its own breath when `pose.bob === undefined` **[V]**, and an
explicit `bob` is what frees `o.seed` for eye control (§6). 4. Name by *intent* (`recoil`, `brace`, `reachOut`), not by limb
position. 5. Keep every joint inside (−π, π), so plain-lerp blending needs no angle wrapping **[V]**.

Shipped in `acting.js`: `pointBreak`, `pointBreakL`, `shockBreak`, `brace`, `recoil`, `slumped`, `thinkTap`, `cheer`, `reachOut`,
`lean_in`. core.js's own `POSES` stay usable and interchangeable.

## 5. Cycles and frame counts (30 fps)

All **[H]** except the two marked — tune per shot, not per frame.
| Cycle | Frames | Shape |
|---|---|---|
| walk | 24 / cycle (2 steps, 0.80 s) | bob dips at each contact; lean +0.03; head counter-tilts |
| run | 16 / cycle (0.53 s) | lean 0.18, bob 12; arms oppose legs |
| point | 4 antic · 5 action · 7 settle · hold ≥12 | elbow leads, hand arrives last |
| shrug | 3 antic · 5 up · 6 hold · 7 down | down is slower than up |
| shock take | 2 antic · 3 action · 4 over · 8 settle · hold ≥10 | compress in, throw back, stretch, ring down |
| think | 8 in · 60 loop · 8 out | finger taps at ~7 rad/s |
| celebrate | 4 antic · 5 up · 18 cycle | arms never both at the same height |
| slump | 6 antic (small lift) · 14 fall · 20 settle | heavy spring, ζ 0.9 |

The **exit is 40–50% shorter than the entrance [H]**. `walkPose`/`runPose` set `bob` themselves, silently turning core.js's idle
breath off **[V]** — right for travel, wrong if you copy that pose for a stand.

## 6. Eye and brow acting

core.js computes blink itself as `((t*0.8 + seed) % 3.3) < 0.12` — every 4.13 s, closed for 4.5 frames — and the documented
`o.blink` option **is never read** **[V]**. `acting.js` steers it without editing core: every pose carries an explicit `bob`, which
frees `o.seed`, and `ACT.blinkSeed(faceT, closed)` returns the seed value that forces core's own formula to the state you want
**[V]**.
```js
ACT.actor('poisson', { x: 820, y: 980, s: 1.35, t: tl, seed: 11, pose: p, face: 'shock',
  eyes: { seed: 11, noDart: true, blinkAt: [0.78] } });     // forced blink on the anticipation
```
- **Blink on the turn**, not at random: one on the anticipation of a big move, one at a cut, one before a reveal. `ACT.eyes`
  otherwise schedules them deterministically every 2.0–5.5 s, with an 18% chance of a double **[H]**.
- **Eye darts first, head second [H]**: pupils reach the subject 2–3 frames before the head turns; `look` runs −1..1 over 0.08 s.
- Faces: neutral, smile, grin, sly, shock, worried, angry, sad, sus, bored, embarrassed, dollar, wink, proud, talk, scared **[V]**.
  Brow angle and dy come with the face; `sly` raises only one brow. Never give two figures in a frame the same `seed` — they then
  blink in lockstep **[V]**, which reads as a glitch.

## 7. Lip flap on narration energy

core.js's `o.talk` is a fixed square wave, `sin(t*22) > 0` — 3.5 Hz, no energy input, and it alternates against the current face's
own mouth, so a `shock` face flickers between O and talk **[V]**.

`ACT.lipFlap(tl, env)` replaces it. Pass 0..1 energy — voice RMS, or `ACT.envFromSentence(t, span, text)` as a word-density proxy
from timing.json. It gates below 0.08 and runs at 7.5 syllables/s scaled by energy, holding the mouth open longer on a loud line
**[H]**. `ACT.actor({talk: env, shut, openFace})` then swaps between two faces: **pick a `shut` face whose eyes and brows match
`openFace`** or the eyes flicker — the default pair (`smile` / `talk`) is identical apart from the mouth **[V]**. Two mouth states
are enough at this scale; visemes are wasted on a 68 px head **[H]**.

## 8. Weight and contact

- **Feet own the ground.** A figure that slides is the loudest tell. Travel comes from `x`, and the walk phase must advance at a
  rate that matches it: at `s = 1.3` and a 24-frame cycle, about 150 px/s **[H]**.
- **Weight lives in the bob**, not the limbs: the body drops on each contact and the drop is larger for a heavier figure. `ACT.walk`
  subtracts a constant so the contact sits below the rest height **[V]**.
- **Contact sells it [H]**: a held prop stays locked to the hand (`prop` draws in hand space), eyes point at the thing, and the
  braced foot does not move during a reaction.
- **Settle, don't stop.** A hard stop reads as a missing frame: spring it, ζ 0.5 for gesture, ζ 0.9 heavy, ζ 1.0 for no wobble.
- **Silhouette test**: fill the figure black at 1/3 size; if the pose is unreadable the arms are inside the torso. Move the elbows
  out, not the hands **[H]**.

## 9. Check before moving on

1. Does one still frame mid-action read as the action? 2. Is there an anticipation frame at all? 3. Do the forearms lag? 4. Does the
hand sweep an arc, not a straight line? 5. Are the legs uncrossed? 6. Do both figures blink on different seeds? 7. Does the mouth
stop when the voice stops? 8. Feet planted, or sliding? Render ~12 frames straddling each move and judge from the sheet, not the
code.

## Sources

- Thomas & Johnston, *Disney Animation: The Illusion of Life* (1981) — the 12 principles. Summaries consulted:
  [bloopanimation](https://www.bloopanimation.com/the-12-principles-of-animation/),
  [Adobe](https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html).
- `/home/claude/shakclips-studio/engine/core.js` — all rig geometry, pose format, face/eye/mouth tables and the blink and talk
  formulas, read directly. Rendered and reviewed against `out/demo.html` / `out/demo_sheet.jpg` on 2026-11-11.
- `heygen-com/hyperframes`, Apache-2.0 — `references/types/character.md` (a mood change goes through a take; offset the parts;
  contact sells it) and `references/motion.md` (exits shorter than entrances, springs named by damping ratio).
- `godot-docs`, CC-BY-3.0 — `tutorials/animation/cutout_animation.rst`: rest poses, keying rotation only on a cutout rig, ordering
  parts for depth. `juliangarnier/anime`, MIT — `src/easings/` for the overshoot forms behind `ACT.ease`. `3b1b/manim`, MIT —
  `utils/rate_functions.py`, whose `running_start` is the basis of `ACT.ease.anticipate`.
