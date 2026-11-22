# Shak Replay – editing playbook that improves every day

Read this whole file BEFORE picking clips or writing plans. Every daily run ends by updating it (see RUNBOOK_GTA.md step 9).
Keep "Current rules" short (at most 15 bullets). A rule gets here only after 3+ videos back it up; delete rules the data stops
supporting. Everything not proven yet is an experiment.

## Current rules (apply every day)
1. English streamers first (US audience pays the highest RPM). Non-English only if the moment needs no words.
2. Payoff first: open every Short with a 2-2.5 s teaser of the best moment (crash, scare, glitch, reaction), then rewind.
3. Cut dead driving or walking: keep ranges where something is said or happens; a Short should land at 18-40 s.
4. Something new on screen at least every 3 s (note, sticker, punch, shake, cut): the originality check allows 4 s max.
5. Split layout (webcam top, game bottom) whenever the streamer has a cam; blur layout only for no-cam clips.
6. Title = curiosity + "GTA 6" + 1 emoji, under 60 characters, then #gta6 #shorts. Never put the punchline in the title.
7. Low competition: mid-size streamers first; skip any moment that 3+ channels (or one 100k+ copy) already posted (RUNBOOK step 3).
8. Ad-safe only: no blood, gore, sexual content or slurs; bleep strong swears (lib.bleeps does it from the transcript).

## Experiments (one new variable per day; record the result here)
| started | variable | variants | how judged | result |
|---|---|---|---|---|
| 2026-11-21 | baseline | squeex_trick: crash teaser + 5 ranges, 26 s, funny music | views and avg % viewed at 48 h | pending |
| 2026-11-21 (run 2) | streamer name in Short title | A: name first ("Speed...", "CaseOh...") vs B: no name ("This streamer...") | views at 24/48 h, A vs B average | early read 22 Nov (~15 h): A speed_save 1081 vs B pixel_crash 9; squeex (no name, baseline) 1045. Leaning A, final at 48 h (23 Nov) |
| 2026-11-22 | Short length | A: 18-25 s (jshrobz_crash 23 s) vs B: 32-40 s (dunc_bike 32 s); both name-first titles, both framed | views + avg % viewed at 24/48 h | pending |

Ideas queue (pick the top one when no experiment is running):
- hook_size 80 vs 104 (on 21 Nov the hook label looked small on the cam half of the split layout)
- upload spacing: 3+ h between Shorts vs 1 h (pixel_crash went out 1 h after speed_save and got 9 views)
- funny music bed vs no music (original game audio only)
- question title ("Why did...?") vs statement title

## Craft notes (defects found in review and how they were fixed)
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
