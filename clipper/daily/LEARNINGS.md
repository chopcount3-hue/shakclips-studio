# Shak Replay – editing playbook that improves every day

Read this whole file BEFORE picking clips or writing plans. Every daily run ends by updating it (see RUNBOOK_GTA.md step 9).
Keep "Current rules" short (at most 15 bullets). A rule gets here only after 3+ videos back it up; delete rules the data stops
supporting. Everything not proven yet is an experiment.

## Current rules (apply every day)
1. English streamers first (US audience pays the highest RPM). Non-English only if the moment needs no words.
2. Payoff first: open every Short with a 2.5-3 s teaser of the best moment (the rage line, the fail, the reaction), then rewind.
3. Cut to the dialogue: keep the lines that tell the story; land at 15-20 s (length test closed 27 Nov: 17 s 978 vs 22 s 229) (24 Nov: Speed 18 s 3,044 views and 88.8% viewed;
   Jshrobz 24 s 1,072, DarkViper 20 s 972 vs Dunc 33 s 634, ohnePixel 31 s 9). Longer only when the back-and-forth needs it.
4. Something new on screen at least every 3 s (note, emoji, face zoom, punch, shake, cut): the originality check allows 4 s max.
5. 'Fit' style since 25 Nov (owner): whole stream picture on its blurred copy, fixed white title box, captions below,
   fast face zooms (zoomto) on reactions. No branded frame.
6. Title = streamer NAMES first + what happened + 1 emoji, under 60 characters, then #<streamer> hashtags + #shorts. Never put
   the punchline in the title, never make a game the topic. (Name test 23 Nov: named Shorts got feed pushes, the unnamed one 9 views.)
7. Kai Cenat / IShowSpeed / AMP stream moments (owner, 25 Nov), found from chat laugh/hype spikes + community clips
   (streams.py). Skip a moment that 3+ channels (or one 100k+ copy) already posted.
8. Ad-safe only: no sexual content or nudity, real violence or slurs; bleep strong swears (lib.bleeps does it from the transcript).
9. Long videos (owner, 26 Nov): NO voiceover. Silent title card before every moment + captions, labels, slow-mo replays,
   flash/shake, owner SFX, music bed (RUNBOOK step 6). Thumbnails: 'scene' style in 4K (thumb_scene.py --4k, step 6b).

## Experiments (one new variable per day; record the result here)
| started | variable | variants | how judged | result |
|---|---|---|---|---|
| 2026-11-21 | baseline | squeex_trick: crash teaser + 5 ranges, 26 s, funny music | views and avg % viewed at 48 h | 1073 views / 16 likes @40 h (avg % not available) |
| 2026-11-21 (run 2) | streamer name in Short title | A: name first ("Speed...", "CaseOh...") vs B: no name ("This streamer...") | views at 24/48 h, A vs B average | CLOSED 23 Nov (~39 h): A speed_save 1506 vs B pixel_crash 9 (squeex, no name, 1073). A wins -> rule 6 |
| 2026-11-22 | Short length | A: 18-25 s (jshrobz_crash 23 s) vs B: 32-40 s (dunc_bike 32 s); both name-first titles, both framed | views + avg % viewed at 24/48 h | CLOSED 24 Nov: A jshrobz 1072 @39 h vs B dunc 634 @32 h. A (18-25 s) wins |
| 2026-11-23 | Short title form | A: question ("Why Did DarkViperAU Say 'It's My Bad'...?" 20 s) vs B: statement ("MoistCr1TiKaL Found the PERFECT Hiding Spot..." 27 s); both name-first, framed | views at 24/48 h | CLOSED 25 Nov: A ~1,000 @40 h (flat) vs B 924 @33 h. Tie: title form doesn't move the ~1k feed test; keep either |
| 2026-11-24 | music bed | A: funny/trap music at 0.07 vs B: no music (game audio + owner SFX); both 15-24 s, name-first, framed, shorts_creators | views + avg % at 24/48 h | CLOSED 26 Nov: A caseoh_plane ~1,000 @40 h vs B jynxzi_logo 43 @33 h (never got the feed test). A wins: keep the music bed at 0.05-0.08 |
| 2026-11-25 | Short length inside 15-24 s | A: 14-17 s (jynxzi_brake 17 s) vs B: 20-24 s (agent00_sf90 22 s); both music bed 0.07, name-first statement titles, framed | views at 24/48 h | CLOSED 27 Nov: A jynxzi_brake 978 @40 h vs B agent00_sf90 229 @33 h. A (14-17 s) wins; kai_wasted (16 s) 920 @9 h agrees |
| 2026-11-26 | 'fit' style (stream moments, blurred bg + title box + face zooms) vs the old framed GTA Shorts | kai_speed_rage (29 s, Kai+Speed $1M race) + 2nd fit Short; baseline = framed Shorts' ~1k @24 h | views at 24/48 h vs ~1k baseline | early 27 Nov: kai_speed_rage 1,100 @16 h, kai_wasted 920 @9 h (fastest 9 h read yet; framed B-side agent00 was 190 @9 h). Fit ≥ framed so far; CLOSED 28 Nov: kai_speed_rage 1,200 @40 h, kai_wasted ~1,000 @33 h, speed_crash 4,100 @16 h, kai_bag 1,200 @9 h. Fit ≥ framed (4 of 4 got the feed test, one 4x breakout): keep fit (rule 5) |
| 2026-11-27 | new stream / creator in the fit style | A: Kai+Speed interaction, both cams (speed_crash, 20.6 s) vs B: Kai solo win (kai_bag, 20.4 s); both fit, same stream | views at 24/48 h | early 28 Nov: A speed_crash 4,100 @16 h (channel's best 16 h read ever) vs B kai_bag 1,200 @9 h. A leads; final read 29 Nov |
| 2026-11-28 | Short title wording (viral swipe structure) | A: two big names + one ALL-CAPS verb + 😭 ("Kai Cenat & Speed ...") vs B: one name + plain statement; both Kai+Speed both-cam interaction moments, fit, 15-20 s | views at 24/48 h | pending |

Ideas queue (pick the top one when no experiment is running):
- long-video thumbnail words: emotion ("NOT READY") vs dare ("TRUST ME BRO") vs question ("WHY?!"); circle vs no circle
- hook_size 80 vs 104 (on 21 Nov the hook label looked small on the cam half of the split layout)
- upload spacing: 3+ h between Shorts vs 1 h (pixel_crash went out 1 h after speed_save and got 9 views)

## Craft notes (defects found in review and how they were fixed)
- 2026-11-28: Kai's VOD 2939504732 opens (0:18 h) on Kai watching the Avengers: Doomsday trailer (YouTube player, film audio) until ~7 s into window m03, and m02 is him watching Marvel content: copyrighted film on screen. Dropped m02 from the long and started m03 at 8.4 s. Check the first seconds of every just-chatting window for a video player.
- 2026-11-28: a bleeped swear still showed as a CAPTION word ("FUCKIN'") in the fit Short: lib.bleeps mutes audio only. Fix: rep={round(start,1): ''} for every bleeped word; check the review sheet's caption words.
- 2026-11-28: thumb_scene crop must start below the race HUD (y ≥ 330 on Kai's stream; the timer + $1M bar sit at y≈190-310, x<400).
- 2026-11-27: longform 'fx' times are MOMENT-RELATIVE (seconds after the moment's start), not source times: make_long.py's M() now takes source times and subtracts a.
- 2026-11-27: scene thumb crop at x=260 left the race HUD (timer + $1M bar) beside the face; Kai's stream HUD ends at x≈300, start the crop at x≥310.
- 2026-11-27: running two streams.py moments in parallel is fine (cands.json merges), but a 3rd run on an older VOD RENUMBERS its windows: add hand-picked windows as unique names (kaiw_<a>) in cands.json.
- 2026-11-27: YouTube search (yt-dlp ytsearch + /results page) returned 403 all run, so /yt-viral and copy checks were skipped. Channel /shorts listings still work.
- 2026-11-26: owner photo cutout (ishowspeed-rage): the stream's timer box sat on his shoulder; removing it left a step that
  showed as a white box in the thumbnail corner. Crop the cutout flat at the bottom instead of notching it. A silent line in
  longform made the whole mix NaN (loudness of silence = -inf): fixed, silent cards now skip the voice stem and the music duck.
- 2026-11-26: Kai's stream goes BLACK/WHITE for ~10 s after "wasted" (respawn): in the fit style that is a black screen with tiny cams. Keep those ranges
  <= 2 s each and push zoomto z=3.0 into the reacting face. Re-running streams.py moments renumbers windows (m04 moved to 1:27): always take `a` from cands.json.
- 2026-11-26: speaker attribution: Whisper mixes Kai + Speed (call audio). Read the race-tracker HUD (top-left: SPEED $xK / KAI $yK) to know who is ahead before writing who-said-what narration.
- 2026-11-26: thumbnail on a red 'wasted' frame: red accent words vanished; yellow accent reads at 160 px. host.sh needs ABSOLUTE paths.
- 2026-11-25: note/sticker/fx times are SOURCE times (like ranges), not output times: 4 notes placed in cut gaps silently vanished. Place every note inside a range.
- 2026-11-25: lib.fixed rep keys are round(start, 1): {7.86: ...} did nothing, {7.9: ...} works.
- 2026-11-25: cut-out cams (Jynxzi, Agent00) need ~120 px headroom in the top box or the notes sit on the eyes; Jynxzi [1150,470,770,513], Agent00 [1110,640,540,360].
- 2026-11-25 thumbnail: a night explosion frame (jynxzi_17 heli) read as a brown blur even at full size; a daytime near-miss crop (2.7x zoom, ring on the biker) read clearly at 160 px. Prefer daylight frames.
- 2026-11-25: caseoh__11 dropped: chat + the clip show his chase ends by killing the woman in the other car (pole through the windshield). Read chat text on the grid frame before locking a clip.
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
### 2026-11-28 (08:13 UTC daily run)
- Stats (yt-dlp flat list): speed_crash FZMYAyY0RU4 4,100 @16 h = best 16 h read the channel has had (Speed's PlayStation dies mid-race, both cams, 20.6 s); kai_bag 1,200 @9 h;
  kai_speed_rage 1,200 @40 h, kai_wasted ~1,000 @33 h. Longs still 1-3 views (YsXTldZpwyw 2 @12 h): no-voiceover changed nothing yet. Fit experiment closed (keep fit).
- Main lesson: a Speed-centred FAIL with both cams reacting (Speed's misfortune + Kai laughing) beats a Kai-only win ~3x at the same age. Pick Speed-misfortune moments first.
- /yt-viral worked again (viral_collect via channel listings): top outliers Zylok "Kai Cenat & IShowSpeed Got The Same GTA 6 Ending! 💔" 109x (13M), AMPYRG "Kai Cenat gave Davis $50,000+ 🎁😱" 17x,
  "Duke Dennis is TOO CLEAN 😭" 13.6x, Zylok "Cameraman Forgot Duke Dennis From The Trench! 😭" 10x, Kai Live "Kai Cenat & Tyla Win..." 9x. Shared structure: big name(s) + one concrete event + 😭/💔.
- No new Kai/Speed VOD in 4 days (pick: Fanum/Agent00 only; Kai's last VOD is the $1M race). Re-ran moments on 2939504732 with --top 30: 30 windows, none overlapping the 19 used. Today = Part 3 of the race.
- Experiment: Short title wording, two names + ALL-CAPS verb + 😭 (A) vs one name + plain statement (B).
- Posted (all published via vidIQ, scheduled): speed_early -LvSDgcI890 (A, 17.1 s, Kai full-cam pre-race, 11:00 ET), long hsqrftBQubs "Kai Cenat & IShowSpeed $1M Race Funny Moments Part 3"
  (6:05, 8 ranked moments, no voiceover, -14.2 LUFS, 95 MB; 4K scene thumb = Kai's cop car flipping into a wall + Speed rage photo + GTA VI, 15:00 ET), kai_chase 532Es0v2MeU (B, 18.7 s, 18:00 ET).
- Copy check (yt-dlp ytsearch works again): 0 copies of the "Speed started early" moment; 1 tiny copy (3 views) of the cop-car chase. The race now has 26 used windows: tomorrow needs a NEW stream.
- Tomorrow: final read of speed_crash vs kai_bag + first read of A vs B; streams.py pick --days 4 for any new Kai/Speed VOD; else try Fanum/AMP with a strict slur check.
### 2026-11-27 (08:13 UTC daily run)
- Stats (yt-dlp flat list): kai_speed_rage 1,100 @16 h, kai_wasted 920 @9 h (best 9 h read the channel has had), long SptxAKRE5Pk 2 views @12 h (5 longs, all ≤ 3 views).
  jynxzi_brake 978 @40 h vs agent00_sf90 229 @33 h -> length test closed, 14-17 s wins. Main lesson: Kai+Speed names in the fit style get the feed test fastest; long-form still gets no reach.
- /yt-viral skipped: YouTube search returned HTTP 403 (yt-dlp ytsearch + results page) this run, so no outlier list today; reused the 26 Nov structure (famous name + all-caps verb + 😭).
- Streams: Agent00 "BACK AT THE AMP HOUSE" (2940606444) pulled + read, then REJECTED: slurs in most windows, a music track (m01), reacts to other people's videos (reused-content risk), running over pedestrians (m13).
  Fanum Thanksgiving (2941603560) = W-spam, transcripts swear-heavy: skipped. So everything came from Kai vs Speed $1M race (2939504732) unused windows (now 19 used).
- Posted (all published via vidIQ, scheduled): speed_crash FZMYAyY0RU4 (A, 20.6 s, 11:00 ET), long YsXTldZpwyw "Kai Cenat vs IShowSpeed $1M Race: Top 8 Moments Part 2"
  (7:05, first NO-voiceover long: silent cards + replays, -14.1 LUFS, 95 MB; 4K scene thumb with Speed rage photo + GTA VI title, 15:00 ET), kai_bag zhN7gcUtSOY (B, 20.4 s, 18:00 ET).
- Experiment: Kai+Speed both-cam interaction (A) vs Kai solo win (B). Hookscore rated every title box WEAK (≤ 40) even after a rewrite: the heuristic dislikes name-first boxes; kept names first.
- Tomorrow: 48 h read of the fit Shorts; is the no-voiceover long any different from the 1-3-view narrated longs? Find a NEW Kai/Speed stream (the $1M race is nearly used up; streams.py pick --days 4).
### 2026-11-26 (08:13 UTC daily run)
- Stats (yt-dlp flat list): jynxzi_brake 968 @16 h (got the feed test), agent00_sf90 190 @9 h, jynxzi_logo 43 @33 h (dead, no music), caseoh_plane ~1k @40 h.
  Longs still 1-3 views (all 4 dead). Speed-named Shorts remain the only breakouts (speed_save 3k; the owner's older Speed uploads 25k-30k).
- Closed music test: music bed wins (caseoh ~1k vs no-music 43). Length test 14-17 s vs 20-24 s: early lead for 17 s; final read 27 Nov.
- Trend check (yt-dlp search): Kai+Speed winners are "Everytime Speed and Kai Arguing" (1.3M), "Kai Cenat BEATS iShowSpeed ... (Minecraft Marathon)" (62k):
  both names + a conflict verb + the stream in brackets. Kai's own "I Raced IShowSpeed To $1,000,000" has 1.8M: that stream is well known.
- Posted (all published via vidIQ, scheduled): kai_speed_rage 6OemWYp-1lM (backlog, 29 s, 11:00 ET), long SptxAKRE5Pk "Kai Cenat & IShowSpeed's $1M Race
  Got OUT OF HAND (Best Moments)" (7 ranked moments from ONE stream, 6:37, 27% narration, thumb KAI LOST $524K?!, 15:00 ET), kai_wasted r2kBvPc57h4 (16 s, 18:00 ET).
- Experiment: fit style vs the framed ~1k baseline. First single-stream long video (story arc: broke -> $186K -> abducted -> $524K -> wasted -> dies again).
- Tomorrow: 24 h read of both fit Shorts vs ~1k; 2939504732 still has m00/m03/m08/m09/m10/m11/m15 unused, but try a fresh stream (Fanum/Agent00 AMP) first.
### 2026-11-25 (owner chat, 23:40 IST)
- Owner: stop GTA-only; clip Kai Cenat / Speed marathon, Mafiathon and AMP streams by chat hype; no frame, 'fit' + blurred
  background. Built streams.py (chat replay + community clips -> 90 s windows), VOD-window pull, titlebox.py, zoomto.
- First stream: Kai vs Speed "first to make a million" (VOD 2939504732): 16 moments. Made kai_speed_rage (Speed raging
  "shut up bro", Kai "you don't have any money bro"), 29 s, PASS, staged as READY in posts.csv for 26 Nov.
- 2-day review (24 Nov): MIXED. Shorts ~1k feed test, Speed 3k breakout; long videos 1-2 views; +1 sub.
### 2026-11-25 (08:12 UTC daily run)
- Stats: vidIQ credits 0 (until 18 Dec) and yt-dlp video pages hit the bot wall, but the yt-dlp FLAT channel listing (/channel/<id>/shorts, /videos) still gives view counts (rounded to ~1k above 999). Logged in stats.csv.
  Best: speed_save ~3,000 @87 h. Moist 924 @33 h, DarkViper ~1,000 @40 h, caseoh_plane 997 @16 h, jynxzi_logo 37 @9 h. Longs: 2, 1, 1 views (all dead).
  Main lesson: every named Short gets the same ~1k feed test regardless of title form; only Speed-tier names + a clear payoff break past it. Long-form gets no reach at all yet.
- Clip pool: 7-day shorts_creators clips are again mostly sexual/nudity cutscenes (Speed 00/02/03/04/05, Kai 01/07/08/10/12, Nickmercs, Ironmouse rejected), Fanum = podcast only, Agent00 25 = gore finale.
- Posted (all published via vidIQ, scheduled): jynxzi_brake Sl-2pJZ5fmo (A 17 s, 11:00 ET), long WacC1Iy7l-I "GTA 6 Funny Moments Today (Jynxzi, Agent00, Hasan, NickEh30)" (7 moments, 5:01, 34% narration, thumb JYNXZI ALMOST HIT HIM?!, 15:00 ET), agent00_sf90 stwyw0lMdk8 (B 22 s, 18:00 ET).
- Competition check: yt-dlp YouTube search page (sorted by date) still works for titles; 0 Short copies for all three picks (days/2026-11-25/competition.md).
- Experiment: Short length 14-17 s vs 20-24 s (both with the music bed). Tomorrow: final music read (caseoh vs jynxzi_logo) + first length read.
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
