---
name: explainer-video-direction
description: Direct a Shak Clips 2D stick-figure explainer. Turns the voiced script and timing.json sentence spans into acts, a shot list with sentence-timed shots, visual-variety and continuity rules, colour/type/motion numbers, caption placement and a 9:16 Short storyboard, then critiques the render from a contact sheet. Use after shak-voiceover has produced timing.json and before writing Canvas scene code, or when a render looks samey, static or busy.
---

# Explainer video direction (2D stick figures)

Pipeline: tts-script-writing -> shak-voiceover (timing.json) -> **this skill (shotlist.json)** ->
Canvas scenes -> video-editing-polish.

Distilled from: digitalsamba/claude-code-video-toolkit `video-design` and `remotion/motion-craft.md`
(MIT; these adapt Leonxlnx/taste-skill, MIT, and HyperFrames' motion references, Apache-2.0);
heygen-com/hyperframes `motion-doctrine` and `captions-overlay` (Apache-2.0); browser-use/video-use
animation rules (MIT); inferen-sh/skills `storyboard-creation` for shot vocabulary (MIT). All rewritten
for Canvas and stick figures at 30 fps.

## 1. Acts first (decided in words)
- Split the script into 2-4 acts (e.g. setup / escalation / turn / aftermath). Give each act one background field
  colour. Change the field **only** when the story turns, never once per scene.
- Neighbouring fields must differ in lightness (light / mid / dark), not just hue. Fields of equal lightness
  flicker at the cut, and ffmpeg's scene detector can't see the change either.
- An act change is a hard cut or a wipe. Backgrounds never cross-fade.
- One accent colour per video. It goes only on the thing the narration names right now (the bar, the
  figure, the number). Everything else is ink plus one neutral. Never use a translucent tint of the ground.

## 2. Shot list from timing.json
- Default: **one shot per sentence**, with its start and end taken from the sentence span.
- Split any sentence longer than 6 s into 2 shots, placing the sub-beat by character position inside the span.
- Merge sentences shorter than 1.5 s into a neighbour when they share one idea.
- Target an average shot length of 3-5 s in long-form and 1.5-3 s in the Short. No shot over 8 s, and never more than ~3 s
  without something changing on screen, unless the hold is deliberate and marked `hold`.
- Every shot has an **action verb** (points, runs, stacks, zooms, cracks, counts). A stick figure standing
  there while the narration talks is a hole.

Shot vocabulary (stick-figure versions):
| Code | Shot | Use |
|---|---|---|
| WS | establishing: map, skyline, landscape, room | a new place or time; opens each act |
| MS | 2-3 figures interacting | conflict, dialogue, cause and effect |
| CU | one face (eyes, brows, mouth) | emotion, reaction, the "you" moment |
| INS | prop or detail: document, coin, phone, gauge | evidence, the number being said |
| MAP | map with route, zoom or spread | geography, scale, contagion |
| TL | timeline or calendar strip | dates, sequences, what-if escalation |
| DATA | chart or number card built on the word | statistics, comparisons |
| SPLIT | before/after or A vs B | contrast, "official story vs evidence" |
| CUT | cutaway or diagram (inside the thing) | how it works |
| CROWD | repeated figures to show quantity | "millions", scale jumps |
| POV | the viewer as the figure | hooks, "imagine you are..." |

## 3. Variety and rhythm rules
- No more than 3 consecutive shots of the same code. Use at least 6 codes in a long video.
- Every 45-75 s, place one "big" shot (MAP zoom, CROWD scale jump, DATA build, CUT reveal) on the script's `[TURN:*]` tags.
- Alternate dense shots (DATA, CUT, MAP) with breathing shots (CU, MS).
- If one layout appears 3 times in a row, vary the composition (position, scale, framing), not just the colour.
- One dominant thing per frame. A big number and a chart share a frame only when the number is the chart's total.

## 4. Continuity
- **Screen direction**: forward in time and progress runs left to right. Retreat, the past and failure run right to left.
  Never reverse direction without a cause on screen (an impact, a turn-around, an act change).
- **Two-figure scenes**: A stays screen-left and B screen-right for the whole exchange (180-degree rule).
- **Eyeline**: if a figure looks up-right, the next shot shows what it sees.
- **Character bible**: each recurring figure gets one fixed identifier (hat, colour scarf, glasses) and a
  name label the first time it appears. Keep line weight and head size consistent across the video.

## 5. Motion numbers (30 fps)
| Move | Value |
|---|---|
| fast move (punch-in, card, figure jump) | 9-18 frames |
| exit vs entrance | exit 40-50% shorter |
| next element starts | when the previous one is 30-50% done |
| stagger: words / list items | 2-4 / 1-2 frames apart |
| hold before a payoff | 9-22 frames (0.3-0.75 s) |
| on-screen text read time | 0.5 s + 0.3 s per word; last line of the video 2 s or more |
- Eases by role: arrivals ease out (cubic/quintic), camera moves ease in-out cubic, exits accelerate.
  Linear is only for progress bars and constant pans. Opacity never bounces.
- **Land the payoff on the word**: find the payoff word's time (by character position in its span) and start the reveal
  `reveal_duration` earlier, so the reveal finishes exactly as the word is spoken.
- A virtual camera push of 3-8% over a shot adds emphasis. Use one camera move per shot, at most.
- Once text has landed it stays still. No idle loops (breathing, floating, glow pulses) standing in for motion.
  If a shot finishes early, add a staged reveal or the next action.
- Figure acting: give each move a pose (anticipation, action, settle) and squash on impact. Big objects
  settle slowly and small ones snap.

## 6. Type and layout (1080p)
- 5 sizes, fixed for the video: display 200-260, figure 112-132, title 64-72, label 32-36, note 28.
  Nothing a viewer must read goes below 28 px. In the 1080x1920 Short, scale up so titles are 80 px or more.
- Titles are at most 2 lines, broken by hand at the phrase. Count ~32 characters per line at display size, and allow no orphan words.
- Every title starts from the same left edge. Counting numbers use tabular figures so they don't jitter.
- Labels show the exact figure from `labels` (the voice rounds and the screen stays precise).
- Off by default (they look generated): gradients, glows, drop shadows at rest, particles, rows of identical
  cards, everything centred, every element fading up the same way, a logo docked in a corner.

## 7. Transitions
- Within an act: hard cuts and camera pushes. Cut mid-motion, with the same axis and direction on both sides.
- Use 3-5 transition types per video, and give each one a cause: a match cut (a coin becomes a planet), an object that grows
  into the next world, a whip in the current direction, or a dip of the outgoing frame for 3 frames before a cut.
- Save match cuts for the 2-3 best moments. Never cross-fade two busy frames.

## 8. Captions
- Captions are an overlay on the bottom ~5-8% of the frame. Don't shift the composition up to make room. Just keep
  critical small text out of the bottom-centre strip.
- Long-form: natural chunks of 4-7 words. Short: 1-3 word chunks, bold, centred in the lower-middle safe zone.
- At most one "embed" (a giant word on screen) per section, saved for the peak.

## 9. The 9:16 Short storyboard
- Recompose every shot for 1080x1920. Don't crop the 16:9 render when that would cut text or figures.
- Keep titles and labels in the central area and away from the bottom ~20% and right ~12%, where the Shorts UI sits
  (check on a real phone).
- The first frame is already meaningful (no fade from black). Change the visual every 2-3 s. Make the last frame
  match the first so the loop is seamless.

## 10. Review from a contact sheet (max 3 rounds)
Render one settled frame per shot (at mid-shot), tile them, and judge only what's in the pictures:
1. One-second glance: what reads first? 2. Do the field changes match the acts? 3. Does the accent sit on one thing per frame?
4. Count distinct title edges and type sizes. 5. Sameness: write one word per layout and flag 3 repeats in a row.
6. Phone test: shrink the sheet to 1/3. 7. Mute test: do the key frames tell the story alone? 8. Does any frame
show an untrue or unsupported number?
Score design 40%, clarity 30%, idea 20%, content 10%. Cap the overall score at 6.5 for any 3-line title, gradient/glow or
row of identical tiles. Cap content at 4 for any unsupported number. Fix in this order: untrue, acts/colour, hierarchy,
type, detail. If a round finds nothing above detail level, stop.

## Output: shotlist.json
```json
{"acts":[{"name":"setup","field":"#F4EFE6","ink":"#1B1B1B","from_sentence":0}],
 "accent":"#E4572E",
 "shots":[{"id":"s012","sentence":12,"start":61.32,"end":65.10,"code":"MAP",
   "action":"route line draws west to east, city dots pop on each name",
   "camera":"push 5%","label":"Deepest hole: 12 km","payoff_word":"deepest",
   "sfx":["pop@63.40"],"transition_in":"cut","turn":"scale","hold":false}],
 "short":{"from_sentence":0,"to_sentence":7,"tail":["..."],"recompose":"9:16"}}
```
