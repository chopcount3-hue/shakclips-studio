---
name: scale-comparison-format
description: Direct Shak Clips scale-comparison spectacle with scale.js: picking an escalating ladder, seconds per rung, the beat-the-last rule, narration word budgets, the thumbnail, and what makes these boring.
---

# Scale-comparison format (smallest to largest)

Use when the video is a size ladder, a what-if or an extremes list, and the visuals have to carry it with neutral narration.

Legend: **[V]** = the size is checked against an authoritative source named in `out/scale.js` and in Sources.
**[H]** = a pacing or packaging heuristic, unverified; our own Studio retention data overrides it.

Pipeline: topic -> **this skill (ladder + beats)** -> `out/scale.js` shot code -> tts-script-writing ->
shak-voiceover -> video-editing-polish. Write the ladder first; the script is written to the rungs.

## 1. Pick a ladder that keeps escalating
- 9–13 rungs for an 8–10 minute video, 5–7 for a Short. Fewer than 5 and there is no ladder; more than 13 and
  the back half repeats itself. **[H]**
- Every rung is **2.5x to 30x** the last. **[H]** Under 2.5x the eye cannot see the jump and the rung is wasted.
  Over ~40x the previous object is a sub-pixel speck before the new one has resolved, and the frame goes empty
  mid-zoom. `SCALE.ladder` fades the arriving object in by its own pixel size, so a 400x rung only shows the
  new object for the last fifth of its zoom — budget for that.
- Plant **one jump over 100x**, and only one, at roughly 60–70% through. In the shipped demo it is Everest
  (8,849 m) to the Moon (3,475 km), a 393x step. That is the moment the video is about.
- Never two rungs with the same multiplier. The demo ladder runs 6.7, 2.9, 2.8, 3.5, 2.5, 10.7, 393, 3.7,
  11.2, 9.7 — irregular on purpose.
- Mix the familiar with the unfamiliar: start with three things the viewer has stood next to (a person, a bus,
  a whale), and only then move to things they have only seen in pictures.
- Keep one drawing convention per ladder. `SCALE.OBJ.city` is a plan view and every other object is a side
  elevation, so `city` in a ladder of elevations reads as a bug, not a scale change.

## 2. The "each step must beat the last" rule
- A rung earns its place only if the new object makes the previous one **visibly smaller than it was a second ago
  and still visible**. If the previous object is already a dot, the rung before it was wrong, not this one.
- State the multiplier on screen every time: `SCALE.ladder` prints `x N BIGGER` at the bottom. A rung with no
  number on it is a rung the viewer cannot grade.
- Escalate the *kind* of thing too: built -> natural -> planetary -> stellar -> galactic, four categories
  minimum. **[H]** And never go back down — one descending step breaks the format for the rest of the video.

## 3. Pacing: seconds per rung
| Rung type | Seconds | Why |
|---|---|---|
| Opening rung (the human) | 1.2–1.6 | the viewer has to accept the scale before it moves |
| Ordinary rung, 2.5–10x | 0.85–1.1 | hold, then zoom; any longer and it is a still |
| Rung of 10–40x | 1.2–1.5 | the arriving object needs the extra zoom time |
| The one jump over 100x | **1.8–2.2** | the surprise; under 1.5 s it reads as a glitch |
| Final rung | 1.2–1.5 + a slow drift | land it, then keep pulling out 15–20% so it is not frozen |
- Pass these as `beats:` to `SCALE.ladder`, not a single `each`. Even beats are the format's commonest failure.
- `hold: 0.30` keeps the first 30% of each beat still, then the camera zooms on `ease.inOutCubic` for the rest.
  Hold below 0.22 and nothing ever settles; above 0.45 and the video stutters.
- Total ladder: 11–14 s for a cold open, 35–60 s for the full mid-video ladder. Slow down **before** the
  payoff, not on it: add 0.3 s to the rung *before* the 100x jump so the surprise lands into a settled frame.

## 4. Narration supports, it never leads
- The voice is neutral and the visuals carry the beat. Word budget per rung: **5–9 words for an ordinary rung,
  12–18 for the big jump, 0 for at least two rungs in every ladder.** **[H]** At 150 wpm, 9 words is 3.6 s, so
  narration spans 3–4 rungs, not one.
- Say the thing and the number, in that order, and stop: "A blue whale. Thirty-three metres." No adjectives.
- The number on screen is exact; the voice rounds. Screen "8,849 m", voice "nearly nine thousand metres".
- Give the 100x jump 1.5 s of nothing but the zoom and the badge, then speak. And never let the voice name the
  next rung before it appears — the reveal belongs to the picture.

## 5. What is on screen at each rung
Every ladder frame carries exactly these, and nothing else:
1. **The current object**, framed to `frac: 0.62` of the frame (its height, or its width for long objects).
2. **Its label**: name in caps plus the real size, at a fixed 46 px — `SCALE.labels()` draws chips in screen
   space, so type never scales with the camera. Keep every label at 28 px or more.
3. **The previous object**, still drawn, with a 30 px chip on a leader line. Two labels maximum per frame.
4. **The `x N BIGGER` badge**, bottom centre, 52 px.
5. **The log gauge** (right edge, 1 m to 10^21 m) with the live `ACROSS THE FRAME` readout. This is what makes
   21 decades legible at a glance, and it gives the eye something moving during a long zoom.
6. **The scale bar**, bottom left, auto-picked to land between 110 and 440 px.
Nothing else. No figure, no logo, no lower third, no particles.

Side-by-side (`SCALE.sideBySide`) is the proof shot after a ladder, not a replacement for it. Keep the tallest
no more than **4x** the shortest or the small ones stop reading; 4 or 5 objects, one shared `mpp`, a baseline,
a dashed top line each, and a ratio callout 2 s in so a 5 s hold is not 5 s of the same frame.

Numbers (`SCALE.counter`, `SCALE.bars`): land the counter on the word, with `dur` 1.4–1.8 s and `outQuint`.
Use `log: true` on any bar set spanning more than two decades, and label it "log scale" — on a linear axis the
small bars vanish and the chart lies by omission.

## 6. The thumbnail falls out of the ladder
- Take the **frame one third into the 100x jump**, where both objects are on screen and the old one is still
  readable. That is the only frame in the video that shows the whole idea at once.
- Two objects, never three. Biggest on the right, the dwarfed one on the left at the baseline.
- Three to four words maximum, 150 px or more: "EVEREST vs THE MOON". Put the multiplier in the title, not the
  thumbnail.
- Render it at 1280x720 and check it at 20% size — if the small object disappears, pick an earlier frame.

## 7. The mistakes that make these videos boring
- **Even steps.** Ten rungs each 3x the last is a progress bar, not a reveal. Vary the multiplier and the beat.
- **No surprise.** Every ladder needs one object the viewer did not know was that big. If all 11 rungs are
  predictable, the video is a list.
- **Labels you cannot read.** Type that scales with the camera, 24 px labels, chips stacked on each other, or a
  label over the gauge. Use `SCALE.labels()` and its `top` / `bottom` / `rightPad` guards.
- **A talking figure on screen.** The rig belongs in explainers, not here. A stick figure standing beside the
  Sun is a cartoon; the 1.71 m silhouette on the baseline is a measurement.
- **Jumping too far.** A 1,000x rung leaves a blank frame for a second. Add an intermediate object.
- **Freezing on the last rung.** Keep the camera drifting out 15–20% and put the payoff line there.
- **A number nobody checked.** Every size in `SCALE.OBJ` carries its figure and source in a comment, and
  anything derived says so. Mark the contested ones out loud: UY Scuti's 1708 R_sun is the published
  measurement, but Gaia-era distances cut it to roughly 755 R_sun, so never call it "the largest star" flat.
- **Decorative motion.** Speed lines only while the camera is moving; `SCALE.ladder` scales them by the zoom
  rate. No idle float, no glow pulse, no particles standing in for a beat.

## Review from the contact sheet (max 3 rounds)
Render 12 frames across the ladder and judge only the pictures: (1) can you name the object in every frame in
one second? (2) is the previous object visible in every frame? (3) is any frame empty mid-zoom? (4) do two
chips touch? (5) are the multipliers irregular? (6) at 1/3 size, is any label unreadable? (7) do two sampled
frames look identical? If a round finds nothing above label-detail level, stop.

## Sources
Sizes in `out/scale.js`, each checked on 2026-11-11 and cited in a comment beside the object:
- Human 1.71 m — Our World in Data, "Human Height", global mean adult male, birth cohort 1996 (NCD-RisC). **[V]**
- Car 4.63 m / 1.435 m — CarsGuide 2025 Toyota Corolla sedan dimensions. **[V]**
- Double-deck bus 11.5 m / 4.3 m — Alexander Dennis Enviro400 specification sheet. **[V]**
- Blue whale 33.5 m — NOAA Fisheries blue whale species page, "up to about 110 feet"; metric conversion ours. **[V]**
- Statue of Liberty 92.99 m ground to torch — US National Park Service, "Statue Statistics". **[V]**
- Saturn V 110.6 m — NASA history, "50 Years Ago: The First Flight of the Saturn V" (363 ft); conversion ours. **[V]**
- Starship 122 m, tower 146 m — FAA Programmatic Environmental Assessment, Starship/Super Heavy, Boca Chica,
  June 2022 (400 ft, 480 ft). **[V]**
- Eiffel Tower 330 m to tip, 300 m architectural — CTBUH, skyscrapercenter.com. **[V]**
- Burj Khalifa 828 m architectural top, 829.8 m to tip — CTBUH, skyscrapercenter.com. **[V]**
- Mount Everest 8,848.86 m — China/Nepal joint announcement, December 2020 (Government of China release). **[V]**
- Manhattan 58.7 km^2 land area — US Census QuickFacts, New York County, 2020. Its 21 km long axis is
  derived and **not** verified. **[H]**
- Moon 3,475 km, Earth 12,756 km, Jupiter 142,984 km — NASA NSSDC Planetary Fact Sheet (metric). **[V]**
- Sun 1,391,400 km — twice the 695,700 km volumetric mean radius, NASA NSSDC Sun Fact Sheet; doubling ours. **[V]**
- UY Scuti 1708 +/- 192 R_sun — Arroyo-Torres et al. 2013, arXiv:1305.6179. **CONTESTED**: Gaia-era distances
  give roughly 755 R_sun. **[V]** for the paper, **[H]** for "largest star".
- M87* shadow ~1.0e14 m — derived from EHT Paper VI (arXiv:1906.11243): 38 microarcsec at 16.8 Mpc, mass
  6.5e9 solar masses. Both arithmetic steps are ours. **[V]** for the inputs.
- Solar System 244 AU across — twice the ~122 AU heliopause crossing, NASA Voyager Interstellar Mission. **[V]**
- Oort Cloud ~200,000 AU across — twice NASA's 100,000 AU outer edge. NASA's page is internally inconsistent
  about the inner edge, so the shell thickness is indicative. **[V]** for the outer edge.
- Milky Way 100,000 light-years — NASA Imagine the Universe, "The Milky Way Galaxy". **[V]**
- AU = 149,597,870,700 m and light-year = 9,460,730,472,580,800 m are the exact IAU definitions.

Engine and craft: `/home/claude/shakclips-studio/engine/core.js` (rig, `shade`, `FONT`, `rnd` seeding),
`engine/acting.js` (`ACT.ease`, `ACT.spring`, `ACT.stagger` — `scale.js` uses these and defines no easing of
its own), `skills/explainer-video-direction` (shot codes, motion numbers at 30 fps, contact-sheet review),
`skills/canvas-motion-graphics` (counters, bar builds), `skills/youtube-thumbnail-design` (the 20% size test).
Checked against `out/demo_sheet.jpg`, 2026-11-11.
