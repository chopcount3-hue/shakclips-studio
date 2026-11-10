---
name: youtube-thumbnail-design
description: Design, build and QA Shak Clips YouTube thumbnails in HTML Canvas, rendered with Playwright at 1920x1080 and shipped as a 1280x720 JPEG under 2 MB. Covers the title-thumbnail information split, 8 codeable layout templates, face/figure size and emotion, 0-3 words, contrast and colour, mobile legibility, GrabCut cutout quality for owner-supplied photos (real faces are never edited), A/B variants and a pre-publish checklist. Use whenever a video needs a thumbnail or a thumbnail test, or when CTR is low.
---

# YouTube thumbnail design (Canvas pipeline)

Distilled from: charlie947/social-media-skills `youtube-thumbnail` (MIT), agricidaniel/claude-youtube
`sub-skills/thumbnail.md` + `references/thumbnail-ctr-guide.md` (MIT), inferen-sh/skills
`guides/design/youtube-thumbnail-design` (MIT), aabrole/claude-video-thumbnail-skill (MIT). All of these generate
images with AI models. Here everything is rebuilt for Canvas, and the CTR figures quoted in them are unverified
heuristics. Our own Test & Compare results override them.

## 1. Package first: the title and thumbnail split
- The viewer goes thumbnail -> title -> thumbnail. The image stops the scroll, the title explains, and the image confirms it.
- The title carries the WHAT (topic and keyword). The thumbnail carries the FEELING or the visual question. Thumbnail
  text never repeats title words. Write the pair together: "Title says X, thumbnail adds Y."
- The promise must be paid in the video, ideally in the first 30 s. Every object, number and claim shown must appear in the
  video. YouTube acts against misleading and "egregious clickbait" packaging, especially for news.

## 2. Core rules
- **The glance test**: understood in under 1 s at 160 px wide. 1-2 focal points. At most 3 elements in total
  (for example face + object + word). Keep 30-40% negative space.
- **Words**: 0-3 (4 only if text is the hero). Never a sentence. Use the bold condensed house font. Make each word distinct
  from the title.
- **Text size at 1920x1080**: primary word 200-320 px font size (cap height of at least 12% of the frame), secondary 110-150 px.
  Outline = stroke of 2x the desired visible width (about 14-20 px) in near-black, or a solid colour box behind the text.
- **Contrast**: text against its outline or box at 4.5:1 or more (aim for 7:1). The focal subject must separate from the background
  in **lightness**, not just hue (check in greyscale). Use 2 dominant colours + 1 accent and saturate beyond realism.
- **Face or figure**: 30-50% of frame height for a photo face. Stick-figure heads are scaled up to 25-35% of the frame
  with 10-18 px lines so they survive at 1/12 scale. The emotion is strong and specific (shock, dread, disbelief,
  smug, curious). A neutral face is worse than no face. Point the gaze or the body at the object or the word.
- **Safe zones (1920x1080)**: no face, text or key object at x >= 1580 and y >= 900 (the duration badge). Shoulders
  or background may pass under it, so keep faces above y 800. Nothing important in the bottom 4%
  (progress bar), and nothing critical in the top-right 300x160 (hover icons). Keep text at least 110 px from every edge.
- **Distinctness**: a dominant colour different from today's top results for the topic. It must work on a white (#FFFFFF)
  and a dark (#0F0F0F) page.
- **Brand**: the same font (Inter Display 900), stroke style and palette family on every upload, plus the recurring Shak stick figure. Vary the layout, not the identity.
- **Owner feedback (2026-11-10)**: real photos beat cartoons for catchiness. Make it expressive: one huge emotion, an arrow or circle, glow or motion on the action, and a bold red claim or data badge. A lumpy cutout or a mismatched flat-cartoon background reads as "low quality". Refine the cutout (section 5) and softly blur background art behind a sharp photo subject. Reference builds: `examples/spacex/catch.html`, `examples/nvidia/spy.html` in the shakclips-studio repo.

## 3. Eight layout templates (coordinates for a 1920x1080 canvas)
1. **Face left + object right + arrow**: face cutout bbox x 0-860, head top y 110, chin y 700, gaze to the right.
   Object centred at (1360, 470), longest side 560 px, 10 px white sticker stroke. Curved arrow from (930, 300) to the
   object's edge, 30 px accent with a 6 px dark outline. 1-2 words top-right inside x 1060-1800, y 70-300.
2. **Before / after split**: divider from (1010, 0) to (910, 1080), 16 px white. Left half desaturated and cooler (before),
   right half saturated and warmer (after). The same subject at the same scale on both sides (a cartoon in 2 poses, or 2 real photos, never flipped).
   An optional 80 px circular "->" badge at (960, 540). At most 1 word per side, top band y 60-220.
3. **Number + reaction**: one giant number ("$4B", "1,000x", "-40%") at x 90-1050, font 440-560 px, accent fill,
   20 px dark stroke, rotated -4°, vertical centre y 480. Reaction face or figure on the right, x 1150-1920, filling 75-85% of
   frame height. No other text.
4. **Circled detail + zoom inset**: a full-bleed scene (cartoon art). One detail circled with a red ellipse (18 px, rx 200,
   ry 150). A zoom inset circle r 250 at (1520, 330) with a 14 px white ring shows that detail magnified 2-3x.
   An optional pointing figure bottom-left inside x 80-600. 0-2 words.
5. **Versus / face-off**: a diagonal split from (1150, 0) to (770, 1080) into 2 contrasting fields. Each subject takes ~40% of the width
   and faces inward (gaze at the other). A "VS" badge, 240 px circle, at (960, 500). No other text. For real people, use unedited photos only.
6. **Giant vs tiny (scale)**: one huge object filling 65-75% of the frame from the right, cropped by the edge for size.
   A tiny figure 9-12% of frame height at (380, 760) looks up at it, with a speech-free shock pose. 1 word top-left.
7. **Map pin reveal**: a two-tone simplified map filling the background (land 1 colour, sea 1 colour, no labels).
   One region filled with the accent plus a 140 px pin with a white stroke. A figure or face in the left foreground x 0-700. 1-2 words.
8. **Hidden #1 tease (top-5 videos)**: a "#1" badge, 300 px, top-left at (90, 70). A dark silhouette of the real #1 item
   (same outline, fill #111, with a 12 px accent rim light) centred at (1000, 560), and a reaction figure on the right. The silhouette must be
   the actual #1 shown in the video.
Fallback: **bold claim card**, with 2-3 words filling 60% of the width and a small reacting figure in the lower left.

## 4. Building it (Canvas -> Playwright -> JPEG)
- Spec first (thumb.json): `{template, palette:{bg, accent, ink}, words:[...], subject:{src, kind:"photo|cartoon"},
  object:{src}, arrow:true, variant:"A"}`. The renderer is a pure function of the spec, so variants re-render in seconds.
- Fonts: `await document.fonts.load('900 300px "Inter Display"')`, then assert `document.fonts.check(...)` before drawing.
  A missing font silently falls back.
- Text: `lineJoin='round'`, `miterLimit=2`, `strokeText` first and `fillText` second. Lay text out by measured width (`measureText`) and never let it wrap automatically.
- Playwright: viewport 1920x1080, `deviceScaleFactor: 1`, screenshot the canvas as PNG.
- Export: `ffmpeg -y -i thumb.png -vf scale=1280:720:flags=lanczos -q:v 2 thumb.jpg`. If the file is 2 MB or larger, step `-q:v` up
  (2 -> 3 -> 4). Use sRGB with no alpha. If saturated red or blue text smears at the edges, add `-pix_fmt yuvj444p`
  (no chroma subsampling) and recheck the size.

## 5. Owner photos: cutout quality (GrabCut + high-res refine)
**Real photos come only from the owner** (the chat or the repo's `photos/` folder). Never download photos of real people from the web. **Faces of real people are never edited.** No warping, liquify, eye or mouth changes, expression changes, face swaps,
AI regeneration or upscaling, beauty filters or mirroring. Allowed: cutout, crop, uniform scale, position, and one global
exposure match on the whole cutout. Pick a supplied photo whose real expression fits. Never imply a quote, an action
or an object the person didn't really say, do or hold.
1. Coarse pass: GrabCut on a copy at most 1200 px on the long side, initialised from a person box, 5 iterations. Add FG/BG hint
   strokes and rerun if limbs or hair are lost.
2. High-res refine: upscale the mask to full resolution. Build a trimap with sure-FG = mask eroded 15 px and sure-BG = mask dilated
   15 px. Rerun GrabCut with `GC_INIT_WITH_MASK` on a crop around the unknown band.
3. Clean: keep the largest connected component. Fill only enclosed holes under 0.5% of the area, and keep real gaps (arm to body).
4. Alpha and defringe: Gaussian-feather the edge 1.5-2.5 px. In a 3 px edge band, replace RGB with colour dilated from
   4+ px inside the mask to remove background halos.
5. Resolution: the cutout is drawn at 1.0x its native pixels or less (1.15x at most). If the face needs more, crop tighter or ask the owner for
   a larger photo.
6. QA: composite on magenta, black and white and inspect hair, ears, fingers and shoulders at 300%. No halo wider than 1 px,
   no missing parts, no background islands. Then add the sticker outline: alpha dilated 10-14 px, filled white or accent, drawn
   behind the cutout, plus an optional soft separation shadow (blur 24 px, 35% black, no offset).

## 6. Cartoon thumbnails (no photo)
- Draw at thumbnail scale: oversized head, thick lines, an exaggerated pose with no ambiguity, and 1-2 props drawn simply.
- The expression needs angled brows, a big mouth shape and a visible sweat drop or shock lines. Test it at 160 px.
- The background is a flat field or the subject's own shape (map, skyline, grid), never a busy scene.

## 7. Variants and A/B testing
- Make 3 variants that differ in **one** variable each (template, emotion, word/no word, or dominant colour).
- Use YouTube Studio Test & Compare (up to 3 thumbnails, judged on watch-time share). Let it run until it returns a
  result, and don't judge on the first 24 h of subscriber traffic.
- Log every test in `thumbnail-tests.csv`: date, video, variable, A/B/C, result. After 10 or more tests, turn the winners into house
  rules in this skill.
- If a live video's CTR sits in the bottom quarter of the channel after 2-3 days with real impressions, swap in the next variant.

## 8. Pre-publish checklist (all must pass)
- [ ] Title + thumbnail split written down. No word repeated from the title, and 0-3 words used.
- [ ] Everything shown is in the video, and the promise is paid early. Not misleading, no graphic or shock imagery of real victims.
- [ ] Glance test: readable and understood at 160, 240 and 360 px wide, on white and on #0F0F0F.
- [ ] Greyscale check: the focal subject and the words separate clearly. Text contrast is 4.5:1 or more.
- [ ] At most 3 elements, 1-2 focal points, 30-40% negative space, and the gaze or arrow leads to the focus.
- [ ] Safe zones respected: no face, text or key object under the bottom-right badge, the bottom strip or the top-right hover area.
- [ ] The house font actually rendered (asserted), with no clipped letters and nothing touching the edges.
- [ ] Photo: the real face is unedited, no halos at 300%, no upscaling past 1.15x, and the owner's permission and source are noted.
- [ ] Mock feed: our thumbnail among 6 current results for the topic at 360 px wide. It stands out by colour or shape.
- [ ] Brand: house font, stroke, palette family and recurring figure present.
- [ ] File: 1280x720 JPEG, sRGB, under 2 MB, named `<video-id>_thumb_<variant>.jpg`. Spec JSON saved next to it.
- [ ] 3 variants exported and the Test & Compare entry logged.
