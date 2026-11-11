---
name: explainer-art-direction
description: Visual style guide for Shak Clips stick-figure explainers. Per-act palettes, line-weight hierarchy, deterministic paper grain, flat and rim lighting, 3-plane backgrounds, props, type, look sets.
---
# Explainer art direction

Use when deciding how a Shak Clips video should *look*, before writing scene code, or when a render comes back flat, muddy or
generic. Acts and the one-accent rule are in `explainer-video-direction`; this is the pixel craft underneath, all drawable with
`engine/core.js`.

## 1. Palette system, per act

One palette object per video: a field and band colour per act, one accent for the whole video.

```js
const LOOK = { ink: '#1d1a1a', accent: '#E8343A',    // ink = core.js INK; ONE accent per video
  acts: [ { field: '#F3E2C0', band: '#D9C49A' },     // setup light / turn mid / fallout dark
          { field: '#E6D2E8', band: '#C4A8C8' }, { field: '#1b2a3f', band: '#2c3e64' } ] };
```

| Rule | Why |
|---|---|
| Neighbouring acts differ in **lightness**, not just hue | equal-lightness cuts flicker, and ffmpeg's scene detector misses them **[V]** |
| 1 field + 1 band + ink + 1 accent + 2 neutrals per act **[H]** | six colours is already a lot at 1080p |
| Accent only on what the narration names **now** **[H]** | an accent used everywhere stops meaning anything |
| Skin tones come from `CAST`, outside the palette **[V]** | they must stay constant across every act |
| Derive shades with `shade(hex, k)`, never by hand **[V]** | one ramp; it parses hex only, `rgb()` gives `NaN` |
| 15–25% opacity for atmosphere, full saturation on the focus **[H]** | below ~10% a tint vanishes in H.264 |

## 2. Line weight hierarchy

core.js's defaults are already a working hierarchy **[V]**; keep the ratios and scale them together.

| Role | Weight | Role | Weight |
|---|---|---|---|
| Figure outline (`LW`) | 7 | Mid-ground structures | 4–5 |
| Limbs, ink | 18 arms / 19 legs | Far background | 2–3 |
| Hero props, foreground | 6–9 | Hairlines, internal detail | 2 |

**Weight is depth.** A background at figure weight flattens the frame — the fastest fix for "it looks like clip art" **[H]**.
`lineJoin`/`lineCap` are `'round'` throughout; mitred corners read as a different show, and scaling a scene with `ctx.scale` scales
its weights with it, so draw at final size **[V]**.

## 3. Texture: paper grain, deterministically

A faint grain is the cheapest step away from flat vector, but it must be seeded or it crawls and wrecks the H.264 bitrate **[V]**.

```js
function grain(seed = 7, n = 900, a = 0.045) {   // once per frame, last; rnd() is core.js's seeded PRNG
  const r = rnd(seed); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#000';
  for (let i = 0; i < n; i++) ctx.fillRect(r() * W, r() * H, 2, 2);
  ctx.restore(); }
```

Alpha 0.03–0.06 and 600–1200 dots at 1080p **[H]**; above that it survives compression as visible dirt. A second pass of large, very
faint ellipses gives a paper mottle — `bgMap` already does this **[V]**. One exception **[H]**: outline "boil" re-seeded on
`Math.floor(t * 12)` reads as hand-drawn 12 fps at 30 fps.

## 4. Lighting: flat shading and rim

No gradients on objects. Light with **two tones plus a rim [H]**: base fill; a shadow side of `shade(base, -0.25)` as one hard-edged
clipped shape, always from the same direction; a 4–6 px rim stroke in a light warm tone on the lit edge.

```js
ctx.save(); circle(x, y, r); ctx.clip();                                 // shadow side, one hard shape
  circle(x + r * 0.45, y + r * 0.2, r); ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fill(); ctx.restore();
ctx.beginPath(); ctx.arc(x, y, r - 3, Math.PI * 1.15, Math.PI * 1.75);   // rim on the lit edge
shape(null, 'rgba(255,245,220,0.55)', 5);
```

**One light direction per video [H]** — upper-left is the house default, never flipped. A dark act takes its light from a *local*
source (window, lamp, screen glow), not a global tint, and its rim light is what separates a dark figure from a dark ground.

## 5. Backgrounds in 3 planes

| Plane | Content | Weight | Parallax |
|---|---|---|---|
| Far | sky or field, sun, clouds, skyline silhouettes | 2–3, desaturated 30–40% | ×0.25 |
| Mid | the place: buildings, furniture, map, machine | 4–5 | ×0.6 |
| Ground | the strip figures stand on, plus one ink line | 6 | ×1.0 |

`bgParis`, `bgNYC`, `bgCountry` and `bgRoom` all follow this **[V]**. The ground line is what makes figures stand rather than float
— keep every figure's `y` on it. The mid plane carries the act's `band` colour, which is how an act change reads even when the
fields are close. Leave the upper third and lower ~8% simple: titles land in the first, captions in the second **[H]**.

## 6. Prop and icon design language

**Silhouette first [H]**: a prop must read as a black shape at 1/4 size; test before detailing. **Three details maximum** —
core.js's `newspaper` is masthead, rule, headline and grey blocks, nothing else **[V]** — built from the same primitives (`rrect`
radius 4–16, `circle`, `poly`) so props look related. **Scale by meaning [H]**: the thing discussed is 1.3–1.8× its honest size.
Icons are a solid shape plus an ink outline at hero weight: no inner strokes under 3, no gradients, no circles around icons. Held
props draw in hand space via `prop` / `propL` and stay attached through a whole cycle **[V]** — never place one in world coordinates
beside a moving hand.

## 7. Typography

One display face does everything; core.js ships **Inter Display / Inter at 900** with an ink outline **[V]**. Pair by weight and
case, not by adding a second family.

| Role | Size (1080p) | Role | Size |
|---|---|---|---|
| Display / payoff | 200–260, ink stroke 14–16 | Title card | 64–72 caps |
| Figure / number | 112–132, tabular | Tag / label | 40–54 on a plate |
| Note, source | 28–34, no stroke, 70% ink | | |

A second face is allowed only as a **serif for quotes** — never for UI **[H]**; two display faces competing is a cheap-look flag.
Minimum 28 px for anything readable, 80 px+ for Short titles **[V]**; titles at most 2 lines, no orphans, all from one edge **[H]**.

## 8. Premium vs cheap

**Premium checklist [H]** — a frame passes all ten: one dominant element, the rest clearly subordinate; three depth planes differing
in weight and saturation; one accent on one thing; one light direction and one shadow tone; line weight varying with depth; at most
3 type sizes from the fixed scale; figures on the ground line, props attached to hands; faint grain and flat fills; nothing within
60 px of the frame edge bar a deliberate bleed; and it reads at 1/3 size, muted, in one second.

**Cheap-look red flags [H]** — any one caps the frame: a full-screen linear gradient, or a glow or shadow at rest; a row of
identical cards, or everything centred and fading up the same way; outline weight identical from foreground to horizon; two accents
fighting, or a ground tint used as a "colour"; icons in circles, or emoji instead of a drawn prop; a 3-line title, orphan words, or
text under 28 px; particle drift, idle floats or pulsing glows; a figure off the ground line or a prop off the hand; grain that
changes every frame.

## 9. Three looks to rotate by format

All **[H]**. Each is a complete set, not a tint; rotate so consecutive uploads do not look identical. Ink, skin tones, line-weight
ratios and the type scale stay constant across all three — that is what keeps the channel recognisable while the look rotates.

**A · Warm paper** — trending news, true history. Field `#F3E2C0`, band `#D9C49A`, ground `#B9A07E`, accent `#C8312B`. Grain 0.05,
mottle on. Props read as printed matter: rules, mastheads, stamps. Light upper-left, warm rim. core.js's native look, and the safest
default.

**B · Cold brief** — what-if, science, investigations. Field `#1b2a3f` → `#0c1420` radial, band `#2c3e64`, accent `#5DA9E9`, second
`#F2C230`; ink stays `#1d1a1a` on light plates. Grain 0.03. Light from a screen or window, strong rim. Diagrams replace printed
props. Highest contrast — use it on the turn.

**C · Bright board** — top-5, comparisons, data. Field `#E9F0F4`, band `#CFE0EA`, accent `#E8343A`, support `#2f9e44` / `#F2C230`.
Grain 0.02 or none. Flat, almost no shadow, heavier ink (outline 8). Plates and rules; numbers are the heroes. Best on a phone.

## Sources

- `/home/claude/shakclips-studio/engine/core.js`, `extra.js` — `INK`, `LW`, `shade()`, `FONT`, the
  `bgParis`/`bgNYC`/`bgRoom`/`bgMap` plane structure, `rnd()` seeding, prop construction and the hand-space `prop`/`propL`
  convention; read directly. Checked against `out/demo_sheet.jpg`, 2026-11-11.
- `heygen-com/hyperframes`, Apache-2.0 — `references/look.md` (a look is numbers not adjectives; linear gradients band under H.264;
  accent opacity floors) and `assets/frame-presets/*/FRAME.md` as models.
- `digitalsamba/claude-code-video-toolkit`, MIT — `skills/video-design` palette-role and type-scale practice; `Leonxlnx/taste-
  skill`, MIT — red-flag framing; `godot-docs`, CC-BY-3.0 — `tutorials/animation/cutout_animation.rst` on ordering cutout parts for
  depth.
