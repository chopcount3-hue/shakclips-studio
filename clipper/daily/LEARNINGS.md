# Shak Replay – editing playbook that improves every day

Read this whole file BEFORE picking clips or writing plans. Every daily run ends by updating it (see RUNBOOK_GTA.md step 9).
Keep "Current rules" short (at most 15 bullets). A rule gets here only after 3+ videos back it up; delete rules the data stops
supporting. Everything not proven yet is an experiment.

## Current rules (apply every day)
1. English streamers first (US audience pays the highest RPM). Non-English only if the moment needs no words.
2. Payoff first: open every Short with a 2-2.5 s teaser of the best moment (crash, scare, glitch, reaction), then rewind.
3. Cut dead driving or walking: keep ranges where something is said or happens; a Short lands at 15-24 s (24 Nov: Speed 18 s 3,044,
   Jshrobz 24 s 1,072, DarkViper 20 s 972 vs Dunc 33 s 634, ohnePixel 31 s 9).
4. Something new on screen at least every 3 s (note, sticker, punch, shake, cut): the originality check allows 4 s max.
5. Split layout (webcam top, game bottom) whenever the streamer has a cam; blur layout only for no-cam clips.
6. Title = streamer name FIRST + curiosity + "GTA 6" + 1 emoji, under 60 characters, then #gta6 #shorts. Never put the punchline
   in the title. (Name test closed 23 Nov: named Speed 1506 vs unnamed pixel 9 at ~39 h; named jshrobz 1029 and dunc 416 also got feed pushes.)
7. Popular creators only (owner, 22 Nov); skip a moment that 3+ channels (or one 100k+ copy) already posted and take another moment from a popular streamer.
8. Ad-safe only: no blood, gore, sexual content or slurs; bleep strong swears (lib.bleeps does it from the transcript).

## Experiments (one new variable per day; record the result here)
| started | variable | variants | how judged | result |
|---|---|---|---|---|
| 2026-11-21 | baseline | squeex_trick: crash teaser + 5 ranges, 26 s, funny music | views and avg % viewed at 48 h | 1073 views / 16 likes @40 h (avg % not available) |
| 2026-11-21 (run 2) | streamer name in Short title | A: name first ("Speed...", "CaseOh...") vs B: no name ("This streamer...") | views at 24/48 h, A vs B average | CLOSED 23 Nov (~39 h): A speed_save 1506 vs B pixel_crash 9 (squeex, no name, 1073). A wins -> rule 6 |
| 2026-11-22 | Short length | A: 18-25 s (jshrobz_crash 23 s) vs B: 32-40 s (dunc_bike 32 s); both name-first titles, both framed | views + avg % viewed at 24/48 h | CLOSED 24 Nov: A jshrobz 1072 @39 h vs B dunc 634 @32 h. A (18-25 s) wins |
| 2026-11-23 | Short title form | A: question ("Why Did DarkViperAU Say 'It's My Bad'...?" 20 s) vs B: statement ("MoistCr1TiKaL Found the PERFECT Hiding Spot..." 27 s); both name-first, framed | views at 24/48 h | early (24 Nov 06:42): A 972 @15 h (flat after 7 h) vs B 545 @8 h (78 vph). Read again 25 Nov |
| 2026-11-24 | music bed | A: funny/trap music at 0.07 vs B: no music (game audio + owner SFX); both 15-24 s, name-first, framed, shorts_creators | views + avg % at 24/48 h | pending |

Ideas queue (pick the top one when no experiment is running):
- long-video thumbnail words: emotion ("NOT READY") vs dare ("TRUST ME BRO") vs question ("WHY?!"); circle vs no circle
- hook_size 80 vs 104 (on 21 Nov the hook label looked small on the cam half of the split layout)
- upload spacing: 3+ h between Shorts vs 1 h (pixel_crash went out 1 h after speed_save and got 9 views)

## Craft notes (defects found in review and how they were fixed)
- 2026-11-24 (owner feedback, 2nd): split panel also "not catchy": two small busy panels, no GTA 6 cue, no clear photo. New default thumb_hero.py: one sharp bright frame full-bleed + GTA 6 badge + ring + 2 huge words (long_v4).
- 2026-11-24 (owner feedback): "thumbnails are not catchy". The single dark night frame (Kai skunk ape, KAI FOUND BIGFOOT?!) read
  as a brown blob at small size. New default: thumb_split.py, two bright moments side by side (biggest name + most-viewed clip),
  huge 2-word hook at the bottom. Always compare 4 nearby frames and take the sharpest, brightest one.
- 2026-11-24: boxes were written from the frame.py grid's DISPLAY pixels (1440 wide) instead of its 1920 labels, so CaseOh's cam
  window showed only beanie + beard. Fix: always read the yellow/cyan label numbers, never the image pixel position.
- 2026-11-24: cut-out (no-border) webcams like Jynxzi's sit right under the notes: notes at y=0.175 covered his eyes. With a
  1-line context title use y=0.135, and give the top box ~60 px headroom above the headphones.
- 2026-11-24: Whisper heard the game's NPC line + Jynxzi's yell as "Keep the A6!" -> dropped those words with rep={...: ''}.
- 2026-11-24 thumbnail: Kai's cam sits left of the subject; crop must start right of the cam (x>=340) or a pink cam edge shows.
- 2026-11-23: context `*this exit*...` rendered "EXIT*..." (frame_style only saw a star at the very end of a word). Fixed: star
  spans can cover several words and may be followed by punctuation. frame_style caches PNGs in $WORK/frames_style: delete it after a change.
- 2026-11-23: thumb.py read crop/circle as source px, so a 720p clip (ishowspeed_01) gave a broken thumbnail. Fixed: grab()
  scales every frame to 1920x1080 first. Always check the clip's resolution when a thumbnail looks off.
- 2026-11-23: moist cam box ran 40 px below the webcam and showed pool water in the cam window. Read the cam's bottom edge, not the overlay.
- 2026-11-23: thumbnail ring r=250 cut the words ("THEY HID" touched the ring); r~175 on the subject keeps words and ring apart.
- 2026-11-21 (owner feedback): "you are not using the sfx i gave you, you are using bot type sfx" -> the owner's pack
  (sfx/user, 148 safe sounds) is now first in every edit; the synthetic sfx/made sounds are only a fallback.
- 2026-11-21 (owner request): every webcam Short uses the branded frame (frame_style.py) with a context title bar that
  says what the video is about. Punch-ins and shakes happen inside the windows so the frame never moves.
- 2026-11-21: sparse speech clip (squeex) -> captions only on 4 words; carried it with 7 notes + 6 stickers. Choose clips
  with more talking when possible: captions are what keeps people watching with sound off.

- 2026-11-21b: burned-in Twitch captions / NPC subtitles show swears and crude lines even when the audio is bleeped
  (zoreee_10 "asshole", zoreee_07 crude NPC line). Fix: cut those ranges instead of bleeping, and check the sheet text, not just the transcript.
- 2026-11-21b: a 1.5 s note just before a cut ran on top of the next note. Fix: dur=0.7 for notes placed < 1.5 s before a range end.
- 2026-11-22: the frame's context title wraps to 2 lines and the notes at y=0.12 covered line 2. Fix: notes at y=0.175 in
  framed Shorts (make_day.py wraps note() with that default). Check the first review frame for this every day.
- 2026-11-22: longform.py masks swear captions but does NOT bleep the audio of moments. Fix: run bleep_clips.py on the day's
  long-video clips and point plan['clips'] at the *_bl.mp4 copies.
- 2026-11-21b: longform.py needs soundfile + pyloudnorm in the cbx venv (missing on a fresh workspace); setup_gta.sh now installs them with uv.
  The long render takes ~8 min and fit100 ~10 min, so run both with nohup and poll.

## Daily log (newest first; 3-6 lines per day: what was posted, top/bottom performer and why, what changes tomorrow)
### 2026-11-24 (08:15 UTC daily run)
- Stats: reused the 06:42 UTC read (stats.csv); vidIQ credits are 0 until 18 Dec, so no stats/search/keyword calls today (uploads + publish are free).
  Best: speed_save 3,044 @62 h (18 s, 88.8% viewed, 2nd wave). Worst Short: dunc_bike 634 @32 h (33 s). Longs 2 and 1 views.
  Main lesson: short (15-24 s) Speed-tier Shorts are the only ones that break the ~1k feed test.
- Owner's standing order is still 2 Shorts + 1 long (the review's "3rd Short instead of the long" needs the owner's OK), so a long goes out today.
- Competition check done with yt-dlp flat YouTube search (free; titles only, no view counts). Keyword volume: reused 23 Nov data.
- Experiment: music bed (A) vs no music, game audio + SFX only (B), both 15-24 s, name-first statement titles.
- Posted (all published via vidIQ, scheduled): caseoh_plane TUuMsKNKtp8 (A music, 23 s, 11:00 ET), long IycsEF38kwI "GTA 6 Funny Moments Today
  (Kai Cenat, CaseOh, Jynxzi, Speed)" (8 moments, 5:35, 31% narration, thumb "KAI FOUND BIGFOOT?!", 15:00 ET), jynxzi_logo 4McG7ZPu0hI (B no music, 17 s, 18:00 ET).
- Clip pool: most of the 7-day shorts_creators clips are sexual cutscenes (Speed 4 of 5, Kai 4 of 5, Jynxzi 3 of 5): only ~1 in 3 is usable.
- Tomorrow: 48 h read of the title-form test (DarkViper vs Moist); first read of music vs no music; ask owner about long -> 3rd Short.
### 2026-11-24 (06:42 UTC, 2-day trial review -> review_2day.md)
- Verdict MIXED. Every named Short gets a ~1k feed test in 16 h (Squeex 1,089, Jshrobz 1,072, DarkViper 972); only Speed (18 s, 88.8% viewed) broke out: 3,044, with a 2nd wave on day 3.
- Long videos dead: q7Wck99d2gc 2 views @35 h, AfYP7wzr1S8 (custom thumb) 1 view @11 h. CTR unknown (extension not connected). Subs 13 -> 14 (+1). ~5.9k channel views in 48 h.
- Frame vs plain: same ~1k at 16 h, no lift yet. Popular vs mid-size: popular slightly faster early, too young to call. Length: 24 s Jshrobz 1,072 vs 33 s Dunc 634 -> shorter wins (close the length experiment: A).
- Change: replace the daily long with a 3rd Short; keep 15-24 s, name-first, popular creators; connect the vidIQ extension. vidIQ credits ran out mid-run (video_stats failed): limit daily credit-using calls.
### 2026-11-23 (08:13 UTC run)
- Stats (~39 h): speed_save 1506 / 12 likes (best), squeex_trick 1073 / 16, pixel_crash 9. Early: jshrobz_crash 1029 @16 h (best vph 64),
  dunc_bike 416 @9 h, long q7Wck99d2gc only 2 views @12 h (new channel's long-form gets no browse push yet: it needs search terms + time).
  Analytics API still returns no rows (retention unknown). Main lesson: name-first titles get the Shorts-feed test; the unnamed one died.
- Trend check: winners are 12-25 s, "<Streamer> Finds/Caused X in GTA 6" (Lacy hidden feature 37k, Kai Cenat kid 8k, "50 hours to beat GTA 6" 37k).
- Competition: popular clips (Speed alien, Jerma dog, xQc crash, Cohh quad) got 8-10 copies in ~12 h. Took big names' LOW-view clips instead.
- Posted (all published via vidIQ, scheduled): darkviper_exit lF0D7XGFWIA (A question title, 20 s, 11:00 ET), long "GTA 6 Moments That Broke Streamers Today" (8 moments, kw "gta 6 moments" vol 83 / comp 45,
  15:00 ET, AfYP7wzr1S8, thumbnail "THEY HID THIS?!" on the Speed alien), moist_pool 7ztXHQU5P_8 (B statement title, 27 s, 18:00 ET).
- Experiment: question vs statement Short title. Tomorrow: final length read (jshrobz vs dunc) and first read of the long video at ~36 h.
### 2026-11-22 (08:15 UTC run)
- Early numbers (~15 h live, not yet the 20 h minimum): squeex_trick 1045 views / 16 likes, speed_save 1081 / 11, pixel_crash 9 / 0.
  pixel_crash barely got a Shorts-feed test. Likely causes: posted 1 h after speed_save (3 Shorts in 2 h), the only no-name
  vague title ("He Promised..."), slowest open (31 s). Lesson: space Shorts 3+ h apart (slots now 11:00 / 18:00 ET) and name the streamer.
- Trend check: winners right now are "<Streamer> did X in GTA 6" story titles, ranking compilations, and 16-30 s cuts;
  NickEh30 and N3on are rising, Speed/Kai are saturated.
- Competition check skipped Joe Bartolozzi pigeon (13 copies), LIRIK CJ reflection (5), Fuslie twig arm (9), WoolieVersus cage bug (4).
  Passed: jshrobz swamp crash (0 copies) and Dunc bicycle (1 copy, 0 views). Mid-size streamers' viral clips get copied within hours too:
  the check matters for everyone, not just mega.txt.
- Posted (scheduled, all published via vidIQ): jshrobz_crash ENfy0l9ex7Y (A, 23 s, 11:00 ET), long q7Wck99d2gc "GTA 6 Funniest Moments" (8 moments, 5:34, 33% narration, 15:00 ET), dunc_bike IC9wWhPVwqk (B, 32 s, 18:00 ET).
- Experiment: Short length A (18-25 s) vs B (32-40 s). Tomorrow: final 48 h read of name-in-title test; try a NickEh30 / N3on angle if a clip passes the check.
### 2026-11-21 (evening, owner chat)
- vidIQ FREE plan = 3 YouTube uploads/day (resets 08:00 UTC). Owner chose 2 Shorts + 1 long per day.
- Posted today: squeex_trick (F8slF5RBDgQ), speed_save (SliXXblB6N4, 12 PM ET), pixel_crash (N3u2G_4TOIU, 1 PM ET).
  The other 4 drafts were dropped (old style). Tomorrow = first day in the new frame with the owner's SFX.
### 2026-11-21 (run 2, 10:50 UTC)
- No stats yet: squeex_trick is scheduled 16:00 UTC today, so nothing has been live 20 h. stats.csv stays empty; first real read tomorrow.
- Trend check (vidIQ trending Shorts, "gta 6 streamer", last 3 days): winners name a big streamer + a "FIRST streamer to..." claim
  (Speed backflip 82k in 20 h, N3on 23k in 7 h, Speed beat story 44k-122k). Winners are short: 8-29 s. Ranking compilations also work.
- Experiment today: streamer name in the Short title (A) vs no name (B).
- Setup note: clipper/setup.sh failed because TwitchDownloaderCLI 1.56.5 `--version` exits 1; fixed (checks the binary instead).
- Made: speed_save (A), pixel_crash (B), lacy_furry (A), zoreee_glitch (B), zoreee_bike (B) + long (4:47, 7 moments, 40 % narration).
  NOT PUBLISHED: vidiq_social_post_publish requires the owner to approve each finished draft, and an unattended run can't give that.
  All 6 are left as vidIQ drafts (postIds in posts.csv). The owner was notified; posting needs their reply in the session.
- Clip pool was thin on ad-safe moments (CaseOh bridge/body clips, Speed gore cutscene, CaseOh nude cutscene, bilzo slur all rejected),
  so ZoReee got 2 Shorts (rule "different streamers" broken once on purpose; spaced 2.5 h apart).
- Tomorrow: if the drafts went out, read squeex_trick (first real numbers) plus A vs B. Try to find 5 different streamers.
### 2026-11-21
- First upload: squeex_trick (F8slF5RBDgQ), scheduled 11:00 ET. No data yet.
