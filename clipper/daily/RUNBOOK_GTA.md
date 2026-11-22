# Shak Replay daily run – GTA 6 streamer clips (2 Shorts + 1 long video, US audience)

**Upload limit:** vidIQ's FREE plan allows **3 YouTube uploads per day**, and the count resets at 08:00 UTC. So every day
is **2 Shorts + 1 long video** (owner's choice, 21 Nov). **Backlog first:** any row in posts.csv whose url starts
"NOT UPLOADED" is a finished vidIQ draft (postId in the row). Publish those first: at most 2 Shorts + 1 long per day
in total, oldest first. Make new videos only for the slots the backlog leaves empty (for example, a backlog of 2 Shorts
means make only the long video today). If a publish still fails with the daily-limit error, leave the row as NOT UPLOADED
for tomorrow and say so in the report.
**Standing approval:** the owner approved fully automatic publishing. A video that passes the checks is published right
away. Never leave a passing video as a draft waiting for approval.

Channel: **SHAK REPLAY** (@shakreplay), vidIQ/YouTube platformAccountId **UCgOUG3BF0gV_RBMX8pb3ceQ**.
NEVER post anywhere else (never to "Shak clips 3d" / chopcount3). Repo: chopcount3-hue/shakclips-studio, branch **gta-clipper**.
The run is unattended: never stop to ask; take the sensible choice, note it in the log, and keep going.

## 0. Setup (fresh workspace, ~10 min)
```bash
cd /home/claude && [ -d studio ] || git clone -q -b gta-clipper https://github.com/chopcount3-hue/shakclips-studio.git studio
cd studio && git pull -q --rebase origin gta-clipper && bash clipper/daily/setup_gta.sh && source /home/claude/gtaday/env.sh
D=clipper/daily      # all commands below run from /home/claude/studio
```
Load the vidIQ tools once with ToolSearch: vidiq_social_account_list, vidiq_video_upload, vidiq_social_post_draft_create,
vidiq_social_post_draft_get, vidiq_social_post_draft_update, vidiq_social_post_publish, vidiq_social_post_status,
vidiq_video_stats, vidiq_get_videos_by_ids, vidiq_channel_analytics, vidiq_channel_analytics_extended, vidiq_trending_videos,
vidiq_outliers, vidiq_youtube_search. Check vidiq_social_account_list shows UCgOUG3BF0gV_RBMX8pb3ceQ with canPublish true.
If it is missing, still make the videos, skip posting, and report it (step 10).

## 1. Learn from yesterday (do this BEFORE editing – the channel must get better every day)
1. Read `$D/LEARNINGS.md` fully. Today's edits follow its Current rules and today's experiment.
2. For every video in `$D/posts.csv` that has been live 20 h to 7 days: get views, likes, comments and (if any tool returns
   it) average view % / duration and subscribers gained. Try vidiq_video_stats or vidiq_get_videos_by_ids, then
   vidiq_channel_analytics(_extended) for retention. Append one row per video to `$D/stats.csv` (blank = not available).
3. Compare like with like (Shorts vs Shorts at a similar age). Find the best and worst video and the likely reason
   (streamer, first 2 seconds, hook words, length, layout, music, title, slot). Check today's top GTA 6 Shorts on YouTube
   with vidiq_trending_videos / vidiq_outliers / vidiq_youtube_search ("gta 6", "gta 6 funny", "gta 6 streamer"):
   note 1-2 title or hook patterns that are working right now.
4. Write today's entry at the top of the Daily log in LEARNINGS.md (3-6 lines). Close a finished experiment (result row).
   Promote a pattern to Current rules only after 3+ videos support it; delete rules the numbers contradict.
   Pick ONE experiment for today (from the ideas queue or from what you just learned) and log it in the table.

## 2. Find and pull today's clips
```bash
python3 $D/find.py --hours 30 --top 40          # -> $WORK/cands.json, English first, NSFW titles filtered, used.json excluded
$PY $D/pull.py $(python3 -c "import json;print(' '.join(c['name'] for c in json.load(open('$WORK/cands.json'))[:18]))")
```
If fewer than 8 clips survive, re-run find.py with `--hours 48`.

## 3. Choose (look at every sheet – Read `$WORK/sheets/<name>.jpg` – and read `$WORK/tx/<name>.txt`)
Pick as many new Shorts as today's empty Short slots (2 minus the backlog) plus 1-2 spares, and 6-9 moments for the long video (if the long slot is empty).
- Reject: blood/gore, shooting civilians up close, sexual content, slurs, long silence, menus/loading, chat spam with slurs on screen,
  Cristiano Ronaldo content (the streamer StableRonaldo is fine). Prefer: a clear payoff (crash, glitch, scare, fail, big reaction),
  English talking, webcam visible. Different streamers across the day's Shorts.
- The long video may reuse today's Short clips (longer cuts) plus other good ones. Never use a slug already in used.json.
- **Low competition only (owner, 21 Nov: "try not to make content which has high competition").** find.py already ranks
  mid-size streamers above the mega streamers in `mega.txt`. Before locking a Short, run vidiq_youtube_search for
  "<streamer> gta 6" plus 2-3 key words of the moment, and look at uploads from the last 3 days. If 3 or more channels
  already posted this same moment, or one copy already has 100k+ views, drop it and take the next candidate. Log the check
  (query, how many copies found) in `days/<date>/competition.md`. Add a streamer to mega.txt when their clips keep
  failing this check, and remove one that keeps passing.
- Angle beats source: when the same streamer is crowded, prefer a specific angle that few channels cover (a glitch, an NPC
  or police-AI reaction, a hidden detail, a physics fail) over "streamer reacts" moments everyone clips.
- Long video title: run vidiq_keyword_research on 3-5 candidate phrases ("gta 6 funny moments", "gta 6 streamer
  fails", "gta 6 glitches today", ...) and build the title around a phrase with real volume and LOW competition.

## 4. Webcam boxes
`$PY $D/frame.py <name> <t>` saves `$WORK/frames/<name>_<t>.jpg` with a 100 px grid (1920x1080 coords). Read it and write
`$WORK/boxes.json`: `{"<key>": {"top": [x,y,w,h] webcam, "bottom": [x,y,w,h] game}}`. Shorts use the branded Shak Replay
frame (`frame_style.py`; owner's design request 21 Nov): the webcam window is 1020x680, so aim the top box at aspect ≈ 1.5
(face centred, head not cut). The gameplay window is 1020x796, so aim the bottom box at ≈ 1.28. Other aspects get centre-cropped.
Keep the top box inside the cam (no chat/game) and the bottom box above y=1000 (Twitch caption pill) and off chat overlays,
centred on the action. No cam -> leave the key out (blur layout).

## 5. Plan and render the Shorts
Write `$WORK/make_day.py` like `$D/days/2026-11-21/make_framed.py` (see lib.py for note/gif/emo/fx/short). Per Short:
- `context="..."`: the frame's title bar, on screen for the whole video (owner: "a text context that gives idea [what]
  each video is about"). 4-9 words, says what's going on WITHOUT giving away the punchline, and puts the streamer's name
  first when it helps. `*stars*` turn a word yellow, e.g. `"Squeex said watch this *cool trick* at full speed..."`.
- **SFX = the owner's own pack** (owner, 21 Nov: "you are not using the sfx i gave you"). lib.py puts its 148 safe sounds
  first (`$WORK/sfx_user_safe`) and maps old synthetic names to his (`own()`). Pick by job: impact `punch`, `bamboo_hit`,
  `bone_crack`; fail `bruh`, `wah_wah_wah`, `fail_titanic`, `wrong`, `dissapointed`; shock `what`, `nani`, `wow_1`, `scream`;
  suspense `dun_dun_dunnn`, `drum_roll`, `ticking_clock`, `heartbeat`, `mystery`; win `tadaa`, `correct`, `cash_register`,
  `celebration`; funny `audience_laughing`, `ba_dum_tss`, `bike_horn`, `quack`, `cartoon_bounce`, `slide_whistle`;
  moves `whoosh_transition`, `fast_swish_transition`, `goofy_cartoon_dash_1`, `cartoon_flying_in`; notes `poink`, `bloop`,
  `ting`, `lphone_ding`; rewind `tape_rewind`, `dj_scratch`. Never use a sound marked "avoid" in sfx/user/index.md.
teaser of the payoff first (2-2.5 s), ranges that cut dead time (18-40 s total), a note/sticker/fx at least every 3 s,
music from `clipper/bgm/<mood>/` (`funny`, `action_epic`, `vice_city_80s`, `trap_hiphop`, `mystery`, `chill`) at gain 0.06-0.10.
Stickers: `clipper/stickers/*.gif` (index.md). SFX names: `ls clipper/sfx/made clipper/sfx/drive clipper/sfx/cc0`.
```bash
python3 $WORK/make_day.py && bash $D/render_shorts.sh k1 k2      # every line must end "-> PASS"
for k in k1 k2; do f=$(ls $WORK/shorts/$k/*.mp4 | head -1); ffmpeg -v error -y -i "$f" -vf "fps=8/$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"),scale=270:-1,tile=8x1" -frames:v 1 $WORK/review_$k.jpg; done
```
Read every review sheet. Check: the frame's context title reads well (2 lines max, no punchline), cam framed (face not
cut by the window), action visible in the gameplay window, captions readable in the lane between the windows and not
covering faces, no chat/slur text, the teaser makes sense, nothing gory. Fix and re-render anything wrong, and write each
defect + fix into LEARNINGS.md "Craft notes".

## 6. Long video (5-7 min, "GTA 6 Streamer Moments of the Day" style)
First `python3 $D/bleep_clips.py <the long video's clips>` (longform.py does not bleep moment audio) and use the *_bl.mp4 copies.
Follow `$D/long_example.py` (its sfx_dirs put the owner's pack first): Kokoro narration (am_michael, speed 1.08) for a cold-open hook, a 1-sentence setup before
each moment (who, what to watch for – never describe the punchline), short reactions between, and an outro (subscribe +
tomorrow tease). Commentary share must be ≥ 25 % (longform prints it). Order moments so the best one is last and tease it
in the cold open. Then `bash $D/fit100.sh $WORK/long/long.mp4 $WORK/long/long_fit.mp4 94` (must be < 100 MB).
Spot-check 6 frames of long_fit.mp4 the same way as step 5. Write the scripts in English for a US viewer.

## 7. Post (vidIQ) – US peak times
```bash
python3 $D/slots.py        # 2 Short slots (11:00, 18:00 ET) + 1 long slot (15:00 ET) -> UTC; past slots roll to tomorrow
cp today's new Shorts and long_fit.mp4 to $WORK/up/ with simple names (sr_<date>_s1.mp4 ... sr_<date>_long.mp4)
bash $D/host.sh $WORK/up/*.mp4      # ONE call with ALL files (each call force-replaces the branch) -> public URLs
```
For each file, in slot order: vidiq_video_upload(url) and wait until it's ready -> vidiq_social_post_draft_create with one
YOUTUBE destination (platformAccountId UCgOUG3BF0gV_RBMX8pb3ceQ): title, description, tags, categoryId 20, madeForKids false,
scheduled for its slot (publishAt + the privacyStatus the schema requires; YouTube keeps it private until then) ->
vidiq_social_post_publish -> poll vidiq_social_post_status until it has a postUrl.
- Short title: < 60 chars, curiosity + "GTA 6" + 1 emoji + `#gta6 #shorts`. Long title: < 70 chars, US-search friendly
  ("GTA 6 Streamers' Funniest Moments Today (Squeex, CaseOh...)" style).
- Description (always): 1 hook line; "🎮 Streamer: <Name> – https://twitch.tv/<login>" for EVERY streamer shown; "✂️ Edited by
  Shak Replay – new GTA 6 streamer moments every day"; "GTA VI © Rockstar Games. Clips used with credit for commentary and
  entertainment."; the music credit from clipper/bgm/CREDITS.md: `🎵 Music: "<Track>" by Kevin MacLeod (incompetech.com),
  licensed under CC BY 4.0 – https://creativecommons.org/licenses/by/4.0/`; 4-6 hashtags. Long video: add chapters
  (00:00 + each moment's start from long.json timeline) after the hook line.
- Tags: gta 6, gta vi, gta 6 gameplay, gta 6 funny moments, <streamer>, gta 6 clips, grand theft auto 6, twitch clips (+ shorts).
- Standing approval (owner, 21 Nov): every draft that passes the checks is published right away with vidiq_social_post_publish,
  including on unattended runs. Never leave a passing video as a draft waiting for approval.
- If publish returns `youtube_mfa` / verification required: copy the verification link, send it with PushNotification
  ("Tap to verify SHAK REPLAY, pick shakreplay account, tick every box"), wait up to 20 min re-trying publish every 2 min,
  then leave the rest as drafts and list them in the report.

## 8. Record
- Append each post to `$D/posts.csv` (columns in the header; experiment = which variant this video is).
- Add every used clip slug to `$D/used.json`.
- Save the day's plan scripts and plan JSONs to `$D/days/<YYYY-MM-DD>/` (small text files only, no video).

## 9. Self-review and commit
Re-read LEARNINGS.md: today's log entry says what was posted, the experiment, and 1-2 things to try tomorrow.
```bash
git add clipper/daily && git commit -qm "Shak Replay <date>: 2 Shorts + long, learnings" && git pull -q --rebase && git push -q origin gta-clipper
```
Commit messages end with the attribution lines your session's system reminder gives (if any).

## 10. Report
Finish with a short summary: what was posted (titles, slots in ET and IST, URLs), the experiment, the top lesson from
yesterday's numbers, and anything that failed. Use PushNotification for one short message if a tool for it exists.
