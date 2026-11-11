---
name: visual-spectacle-direction
description: Direct Shak Clips visual-spectacle videos - scale, what-if, mechanism and extremes lanes, picture-first beats, neutral narration word budgets, escalation clocks, awe lighting and a frame-stop test.
---

# Visual spectacle direction (Shak Clips)

**Use when** the video sells a sight rather than a story: what-ifs, scale, extremes, "what happens if".

`explainer-video-direction` stays the general director (acts, continuity, type, motion, captions, the
contact-sheet review); this overrides it only where stricter. Art: `cosmic.js` (`COS.*`); sizes and the zoom
ladder: `scale.js`. Legend: **[V]** checked against a source under `## Sources`; **[H]** house rule or
arithmetic. Anything a narrator says that is not **[V]** gets cut or softened to "about".

## 1. The four lanes
Pick one lane per video and stay in it. Mixing two produced the old news-explainer feel.

| Lane | The engine | Opening picture | Closing picture |
|---|---|---|---|
| **Scale ladder** | one object, re-measured against a bigger thing each time | the object alone, full frame | the object as a dot against the last comparison |
| **What-if escalation** | one removal or change, followed on a clock | the world one second before | the world at the end of the clock |
| **Mechanism / inside** | one process, cut open and run slowly | the thing sealed, from outside | the same frame, transparent |
| **Extremes** | one quantity pushed to its record | the ordinary case, labelled | the record case, same framing |

- A lane is a promise about the next 8 minutes; say which one you are in within the first 6 seconds. First
  and last picture are the **same composition** at different values — same camera, light and subject size.

## 2. Every beat is a picture
- A beat is one picture that already says the thing; the narration **names** it, never explains it. Write
  that picture first as one noun phrase — "Earth, half dark, cities lit". No phrase, no beat.
- A number belongs on screen only when it is the subject (the record, the distance, the count), never as a
  caption. Nothing on screen carries what the picture should carry.
- No figure talks in a spectacle beat: `person()` appears only as **scale**, never as a presenter. Target
  70-110 beats in an 8-10 minute video **[H]** — 5-8 s a beat.

## 3. Word budget (Kokoro am_michael, speed 1.0)
About **141 wpm = 2.35 words/second** **[H]** off the shipped `voice.sh` chain. Write to the budget.

| Beat | Words | What fits |
|---|---|---|
| 3 s | 7 | one clause: "The tides drop to a quarter." |
| 4 s | 9 | a sentence |
| 5 s | 12 | a sentence and a number |
| 6 s | 14 | two short sentences |
| 8 s hold | 19, or 0 | one sentence, then silence under the picture |

- Tone is **strictly neutral**: no jokes, no opinion, no "insane" or "you won't believe", no rhetorical
  questions after the hook. Plain "you" only inside a what-if premise.
- State the thing; do not sell it. "The Moon is 384,400 kilometres away" **[V]**, not "unbelievably far".
  Never narrate the picture: if the frame shows a black disc, do not say "here is a black disc".
- Numbers are spoken once and rounded, shown exactly, then given 0.4-0.8 s of silence to land **[H]**.

## 4. Escalation on a clock
What-if and extremes lanes run on a clock. The viewer stays because the clock advances. Use these stops in
order, skipping any with nothing to show.

| Stop | Seconds on screen | What it must show |
|---|---|---|
| the first second | 8-14 | the change happening, no consequences yet |
| the first hour | 10-16 | the first thing a person would notice |
| the first day | 10-16 | one system visibly out of its normal state |
| the first year | 14-22 | a seasonal or cyclical effect |
| a century | 14-22 | a landscape or map that has changed shape |
| a million years | 10-18 | the end state, framed like the opening shot |

- One picture and at most two beats per stop; two reads as padding. Later stops cover more time and get more
  screen time, which is why the seconds climb. A clock element (date, counter, sun position) shows for
  0.5-1.0 s on the stop change only, never as a HUD.
- The stop where the consequence turns irreversible gets the video's biggest picture, after a 1.0-1.5 s
  silent hold.

## 5. Holding a shot
- Hold 2.0-3.5 s for a reveal (a body rotating into the light, a shadow crossing, a wave arriving), and
  1.0-1.5 s of **silence** before a payoff number plus 0.8-1.2 s after it.
- A hold only counts if something still moves: a terminator creeping, a cloud drifting, a star twinkling.
  Three static seconds is a dead frame and a slow push alone does not rescue it.
- One hold per 45 s. Everything else cuts at 4-6 s, never mid-reveal.

## 6. Colour and lighting for awe
- **One light source per frame.** Build it once as a vector and pass it to every body in the shot
  (`COS.light(az, el)`). Two bodies lit from different sides is the loudest "assembled" tell there is.
- Keep it off-axis: azimuth 140-175 degrees from the camera axis, elevation -20 to +20 **[H]**. A light down
  the lens flattens a sphere into a disc, the one failure this lane cannot survive.
- **Deep darks.** Background at or below #0A0F1E. Reserve true #000000 for one thing per video — normally a
  black-hole shadow or a silhouette — so when it appears it reads as absence.
- **One accent**: one warm hue for whatever the light is (sun gold, disc orange, city amber) plus one cool
  for atmospheres and ice. Nothing else is saturated. Never put a gradient behind a lit body.
- Limb darkening, a terminator and a rim are not optional. Keep the brightest pixel under pure white:
  glows that clip band and smear in the h264 encode, which is why `COS.glow` caps at 0.88 alpha.

## 7. The frame test
Pull one frame at 70% through a beat and ask, in order:
1. **Would this single frame stop a scroll?** If it needs the previous frame to make sense, it is not a beat.
2. With the sound off, can you say what the subject is in under a second?
3. Count the light sources in the picture. The answer must be one.
4. Does the dark go dark, or is the whole frame mid-grey?
5. Could this be the thumbnail? At least 6 frames per video must pass. Shrink to 1/5 and look again:
   detail that vanishes was decoration. Fail any of 1-4 and redraw the beat, never patch it with text.

## 8. The thumbnail and the Short, per lane
Both fall out of the lane. Never invent either separately; crop the thumbnail from a rendered frame.

| Lane | Thumbnail | Short (1080x1920, 20-35 s) |
|---|---|---|
| Scale ladder | the last two rungs side by side | rungs 1, mid, last — 3 cuts, title on the last |
| What-if escalation | the turn frame, clock element visible | the first second plus the turn, ending on the turn |
| Mechanism | the transparent frame, one part accented | the cut-open reveal, one loop, no payoff |
| Extremes | ordinary and record in one composition | the three largest values, ascending |

The Short's last frame matches its first, so it loops. Keep text out of the bottom 20% and right 12%.

## 9. Cheap-look red flags
Any of these caps the review at 6.0 and the beat is rebuilt, not patched:
- A flat-filled circle standing in for a planet, star or moon: no terminator, no rim, no limb darkening.
- A talking figure in a spectacle beat, or a figure with a pointer.
- On-screen text explaining what the picture should have shown ("this is the shockwave").
- Two light directions in one frame, or a body lit from the camera.
- Cosmic art outlined in the cartoon ink weight. Contact lines are dark navy at 2-4 px, or absent.
- Evenly spaced spikes, sparkles or star-bursts. Real coronae and flares cluster; even spacing is clip art.
- A ring, wave or orbit drawn as a bare hoop with nothing to cast on or cut through; a body dead centre in
  more than 3 beats running; idle loops (pulsing glows, floating, breathing) standing in for an action beat.
- An unverified number spoken as fact. Mark it **[H]** in the shot list, then soften or cut it.

## 10. Numbers this lane keeps reaching for
- Earth-Moon mean distance about 385,000 km: 60.3 Earth radii, roughly 30 Earth diameters; the Moon recedes
  about 3.8 cm a year **[V]**. Moon radius is 0.2727 of Earth's **[H]**, from 1737/6371 km.
- **Two** tidal bulges, near side and far side, because the pull is strongest nearest the Moon and weakest
  opposite; most coasts get two high tides a day and Earth's spin carries the bulges slightly ahead of the
  Moon **[V]**. Drawing one bulge is an error, not a simplification.
- The Sun raises a tide about a third as strong; without the Moon tides settle near a quarter of spring
  range, and Earth's tilt (23.4 degrees, varying 22.1-24.5) could at times pass 45 **[V]**.
- The Sun is about 400 times the Moon's diameter and 400 times farther, so both are near half a degree across
  — Sun 0.5332 degrees mean, Moon 0.5286 **[V]**. That is why totality is possible at all.
- A non-rotating black hole's shadow radius is sqrt(27)/2 = 2.598 Schwarzschild radii **[V]**, photon sphere
  at 1.5 **[H]**. Draw the lensed far edge over the top of the shadow or it is a black circle in a hoop.

## Sources
- NASA Science, *Tides*, science.nasa.gov/moon/tides — two bulges, two high tides a day, bulges led by spin.
- NASA GSFC, eclipse.gsfc.nasa.gov/help/ApolloLaser.html — 385,000 km mean, 3.8 cm/yr lunar laser ranging.
- D. Jeffery, UNLV, *Sun and Moon Angular Diameters*, physics.unlv.edu/~jeffery/astro/moon/sun_moon_angular.html — Sun 0.5332 deg, Moon 0.5286 deg, the 400x / 400x coincidence.
- D. Jeffery, UNLV, *Black Hole Shadow*, physics.unlv.edu/~jeffery/astro/black_hole/black_hole_shadow.html — shadow radius 3*sqrt(3)/2 = 2.598 Schwarzschild radii.
- Physics World, *What's in a moon?*, physicsworld.com/a/whats-in-a-moon — solar tide a third of the lunar
  tide, tides at a quarter of spring range without the Moon, obliquity 22.1-24.5 and possibly past 45.
- House: `skills/explainer-video-direction` (acts, continuity, type, motion); `shak-voiceover` (the chain the 141 wpm budget is measured from).
