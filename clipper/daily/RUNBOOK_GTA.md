# Shak Replay daily run – STREAM MOMENTS of Kai Cenat, IShowSpeed & AMP (2 Shorts + 1 long video, US audience)

**25 Nov change (owner: "don't only post GTA6 videos ... clip the videos from Kai Cenat and IShowSpeed marathon type,
mafia[thon] type, AMP type streams. See the chat hypes and best moments ... make long form and short form videos", "fuck
gta 6", "don't edit videos in that frame ... fit it ... keep the background as motion blur type").** The channel is now
about the STREAMERS, not a game. Sources = the recent marathon / Mafiathon / collab / AMP streams of `stream_creators.txt`
(Twitch VODs), moments found from the chat replay + community clips (`streams.py`). Shorts use the 'fit' style: the whole
stream picture fit to the width on a blurred copy of itself, a fixed white title box above it, captions below, and fast
pushes into the streamers' faces on reactions (no branded frame). Never make "GTA 6" the topic of a title or thumbnail;
the game is just what they happened to be playing.

**Upload limit:** vidIQ's FREE plan allows **3 YouTube uploads per day**, and the count resets at 08:00 UTC. So every day
is **2 Shorts + 1 long video** (owner's choice, 21 Nov). **Backlog first:** any row in posts.csv whose url starts
"NOT UPLOADED" is a finished vidIQ draft (postId in the row); a row whose url starts "READY " is a finished file at the URL
after it (upload it with its row's title; description per step 7). Publish those first: at most 2 Shorts + 1 long per day
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

## 2. Pick today's stream and find its best moments
```bash
python3 $D/streams.py pick --days 4            # ranked recent VODs (marathons/collabs/AMP first, Kai & Speed bonus, non-GTA bonus)
python3 $D/streams.py moments <vod_id> --top 16   # full chat replay (~3 min for 5 h) + community clips -> $WORK/streams/<vod>/moments.md
```
Take the top-ranked VOD that still has unused moments (`streams_done.json` lists used ones; a stream can feed several days).
If two strong streams exist (e.g. a Kai vs Speed collab + a Fanum marathon), run `moments` on both. Read moments.md: each
window (90 s) shows its chat laugh/hype scores, chat samples and the community clip titles there (= what happened).
```bash
$PY $D/pull.py <the 8-10 best window names>     # downloads ONLY those 90 s windows from the VOD at 1080p60 + sheets + transcripts
```
Speed streams mostly on YouTube (can't be downloaded here); use his Twitch VODs when they exist, and the many streams where
he's on call with Kai. Rakai and Duke Dennis aren't on Twitch. Fallback if no VOD in 4 days has moments: `find.py` clips of
`shorts_creators.txt` (7-day lookback), any game or IRL.

## 3. Choose (Read every `$WORK/sheets/<name>.jpg` AND `$WORK/tx/<name>.txt`)
Pick the 2 Short moments + 6-9 long-video moments.
- Best moments are funny or dramatic for PEOPLE: rage, roasts, arguments, a streamer losing it, fails, wins, pranks, a
  guest saying something wild, chat going crazy. Prefer back-and-forth between two creators (Kai vs Speed) and clear
  payoffs. The transcript must make sense without seeing the whole stream.
- Reject: sexual content/nudity (in-game or IRL), slurs on screen or unbleepable, real violence, someone's private info,
  minors in a compromising spot, Cristiano Ronaldo content, long silence, menus/loading.
- **vidIQ credits are 0 until 18 Dec** (uploads/publish are free). Free fallbacks the 24-25 Nov runs proved: view counts from
  the yt-dlp FLAT channel listing (`yt-dlp --flat-playlist -J https://www.youtube.com/channel/UCgOUG3BF0gV_RBMX8pb3ceQ/shorts`
  and `/videos`); copy checks from `yt-dlp --flat-playlist -J "ytsearch20:<query>"` (titles, no counts).
- **Copy check:** vidiq_youtube_search (or the yt-dlp search above) "<streamer> <2-3 key words>" (last 3 days). If 3+ channels or one 100k+ copy already
  posted this moment, take another. (If vidIQ has no credits, note "copy check skipped" and favour less-clipped moments:
  windows with high chat scores but few community clips.)
- Long video title: vidiq_keyword_research on 3-5 phrases ("kai cenat funniest moments", "kai cenat and speed", "kai cenat
  mafiathon highlights", "speed rage", ...) when credits allow; build the title around real search phrases + names.

## 4. Face positions (for the face zooms)
`$PY $D/frame.py <name> <t>` saves a frame with a 100 px grid (1920x1080). Note each streamer's webcam FACE centre as
fractions (x/1920, y/1080), e.g. Kai's stream 24 Nov: KAI = (0.060, 0.398) top-left cam, SPEED = (0.921, 0.319) right cam.
Layouts change between streams and segments: check a frame from EACH window you use.

## 5. Plan and render the Shorts ('fit' style; no frame)
Write `$WORK/make_day.py` like `$D/days/2026-11-25/make_m02.py` (lib.short defaults to the fit style now). Per Short:
- `context="..."` = the fixed white title box above the video for the whole Short: what's going on in 5-10 words, names
  first, no punchline, `*word*` = red (e.g. `"Speed *LOST IT* on Kai in their race to $1,000,000"`).
- `zoomto(t, *FACE, z=2.2-3.0, dur=2-3)` on the reaction lines: push into whoever is talking/reacting. The core move of
  this style; 3-6 per Short. Use `zoom=1.0` (whole picture, both cams visible) unless the cams are inside the middle.
- Teaser of the payoff first (2.5-3 s), then the story in ranges cut tight to the dialogue (lines from the transcript), 20-35 s
  total. Notes (they sit over the video), emojis, punch/shake on the loudest moments: something new at least every 3 s.
- **SFX = the owner's own pack** (lib.py puts its 148 safe sounds first and maps old names via `own()`). By job: impact
  `punch`, `bamboo_hit`; fail `bruh`, `wah_wah_wah`, `fail_titanic`, `wrong`; shock `what`, `nani`, `oh_no`; laugh
  `audience_laughing`, `funny_laugh_2`, `ba_dum_tss`; suspense `dun_dun_dunnn`, `drum_roll`; win `tadaa`, `cash_register`;
  moves `whoosh_transition`, `fast_swish_transition`; notes `poink`, `bloop`. Never a sound marked "avoid" in sfx/user/index.md.
- Music bed from `clipper/bgm/<mood>/` at gain 0.05-0.08 (dialogue must stay clear). Strong swears are bleeped automatically
  from the transcript (lib.bleeps); check the transcript for any slur and add it to `extra_bleep`.
```bash
python3 $WORK/make_day.py && bash $D/render_shorts.sh k1 k2      # every line must end "-> PASS"
for k in k1 k2; do f=$(ls $WORK/shorts/$k/*.mp4 | head -1); ffmpeg -v error -y -i "$f" -vf "fps=8/$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"),scale=270:-1,tile=8x1" -frames:v 1 $WORK/review_$k.jpg; done
```
Read every review sheet: the title box reads well, the zooms land on the right face (not chat or a corner), captions
readable, no slur text on screen, nothing sexual. Fix and re-render; write each defect + fix into LEARNINGS.md "Craft notes".

## 6. Long video (6-9 min, "Top 10" countdown, NO voiceover)
**Owner, 26 Nov: "skip the voice over to make the videos feel good and real, but make it so we don't get copyright or
reused content".** No Kokoro narration. The video stays transformative through editing: a title card before every moment,
captions, streamer labels, slow-mo replays of each punchline, flash/shake hits, the owner's SFX and a music bed.
First `python3 $D/bleep_clips.py <the long video's clips>` (longform.py does not bleep moment audio) and use the *_bl.mp4 copies.
1. Pick 8-12 moments (8-40 s each) from the day's stream(s); order them weakest -> best, best LAST. Skip any moment with
   copyrighted music audible (stream music, in-game radio "now playing" widgets, a song on Discord).
2. Write `$WORK/long/cards.json`: a cold-open card `h0` (2.4 s, over 3 s of the best moment as a tease: "KAI vs SPEED:
   RACE TO $1,000,000"), one card per moment `a1..aN` (1.6-2.0 s: "#7 · KAI IS ALREADY BROKE" = rank + who + the setup,
   never the punchline) and an outro card `z0` (2.0 s: "SUBSCRIBE FOR PART 2" / tomorrow's stream tease).
   `python3 $D/silent_lines.py $WORK/long/cards.json $WORK/long/narr` (silent lines: music stays full, no duck).
3. Copy `$D/long_example.py` to `$WORK/long/make_long.py` and fill it in. Per moment: a `line` item (its card id, 1-2 s
   `shots` previewing the moment, `stamp` with the card text, color yellow/red, sfx `ting` or a whoosh from the owner's
   pack) then a `moment` item with `tx` captions, `label` (streamer name), `audio` 1.25, the crop that hides chat and
   Twitch pills, `fx` [["flash", t], ["shake", t]] on the hit, and `replay` [a, b] of the punchline (slow-mo, 2-4 s).
4. `$PY clipper/longform.py $WORK/long/plan.json $WORK/long/long.mp4` (FFMPEG=master build). "commentary 0 %" is
   expected now; check instead: every moment has a card before it, ≥ 1 replay per moment, mix about -14 LUFS, no NaN.
5. `bash $D/fit100.sh $WORK/long/long.mp4 $WORK/long/long_fit.mp4 94` (must be < 100 MB). Spot-check 6 frames. US English.

## 6b. Thumbnails (long videos only)
**DEFAULT STYLE since 26 Nov, "scene" (owner sent the viral "Top 10 FUNNIEST IShowSpeed Moments" thumbnails: "make
thumbnails like this"):** one huge cinematic action frame + a big red arrow on the action + the streamer's real shocked
face cut out on the side, no text. 4K (YouTube recommends 3840x2160):
```bash
mkdir -p $WORK/thumb && $PY $D/thumb_scene.py $WORK/thumb/thumb.json $WORK/thumb/sr_<date>_long_thumb.jpg --4k   # writes ..._thumb.jpg (4K), ..._thumb_phone.jpg (< 2 MB), ..._qa.jpg
```
Example spec: `days/2026-11-26/thumbs/SptxAKRE5Pk.json` (live video SptxAKRE5Pk). Spec coordinates are 1920x1080.
- **Frame:** the most visual instant of the video's best moment (crash, explosion, police standoff, the stunt): grab 6-8
  timestamps around the peak, Read a contact sheet, take the sharpest and brightest. `crop` = 16:9 box with NO webcam,
  chat, HUD or Twitch overlay. `arrow.to` = the action, `arrow.from` = up-right of it, never over the face.
- **4K:** `--4k` AI-upscales the GAME frame with `$D/upscale.py` (Real-ESRGAN general-x4v3, free, weights auto-download
  from GitHub, ~20 s on CPU). Never run upscale.py on a person's photo.
- **Face:** ONLY an owner-supplied photo from the repo's photos/ folder, and ONLY of a streamer who is really in the
  video (Speed's face on a Speed video). `"face": "photos/ishowspeed-rage.jpg", "face_side": "left", "face_h": 0.92`
  uses its ready cutout `photos/ishowspeed-rage_cut.png`. A new owner photo needs a cutout once (thumb/cutout.py GrabCut,
  then check it on magenta: no background islands, no overlays such as timers; crop flat at the bottom). The face is never
  edited, AI-upscaled or generated (cutout + uniform scale only). Never take a face from the clips or the web. No owner
  photo for the video's streamers -> no face: set `"name": "KAI CENAT"` (small chip) instead and say so in the report.
- **GTA VI title** (owner, 26 Nov: "add gta 6 logo"): when the stream really is GTA 6 (its title says so), add
  `"logo": {"at": [1085, 215], "h": 340}` (output px): our own white GTA over a sunset-gradient VI, top-centre between
  the face and the arrow, over a dark or busy area. Never paste Rockstar's logo artwork. Not on non-GTA streams.
- **Clickbait is allowed** (owner, 22 Nov), with one hard line: what the thumbnail shows must really happen in the video.
- **AI scenes (later):** when the owner enables Gemini billing (gem_image.py; today every image model returns 429) or
  Higgsfield credits exist, an AI-made scene of a REAL moment can replace the frame (`"image": path`); never a real
  person's face in a generated image.
- Read the 4K `out.jpg` AND `out_qa.jpg` (160-360 px on white/dark + greyscale). Fallback style: `$D/thumb_hero.py`.
- Host `..._thumb_phone.jpg` (< 2 MB, safe for the API) in the SAME host.sh call as the videos.

## 7. Post (vidIQ) – US peak times
```bash
python3 $D/slots.py        # 2 Short slots (11:00, 18:00 ET) + 1 long slot (15:00 ET) -> UTC; past slots roll to tomorrow
cp today's new Shorts, long_fit.mp4 and the long video's thumbnail (sr_<date>_long_thumb_phone.jpg) to $WORK/up/ with simple names (sr_<date>_s1.mp4 ... sr_<date>_long.mp4)
bash $D/host.sh $WORK/up/*      # ONE call with ALL files (videos + long thumbnail) (each call force-replaces the branch) -> public URLs
```
For each file, in slot order: vidiq_video_upload(url) and wait until it's ready -> vidiq_social_post_draft_create with one
YOUTUBE destination (platformAccountId UCgOUG3BF0gV_RBMX8pb3ceQ): title, description, tags, categoryId 20, madeForKids false,
scheduled for its slot (publishAt + the privacyStatus the schema requires; YouTube keeps it private until then) ->
vidiq_social_post_publish -> poll vidiq_social_post_status until it has a postUrl.
- Long video thumbnail (Shorts: none): before drafting, call vidiq_upload_image(image=<the thumbnail's raw URL>) and put the returned imageId in
  the YouTube destination's `thumbnailImageId`. YouTube accepts custom thumbnails only from phone-verified channels. A
  refused thumbnail does not fail the upload: note it in the report ("verify the channel at youtube.com/verify").
- Short title: < 60 chars, NAMES first + curiosity + 1 emoji, then hashtags of the streamers + `#shorts`
  ("Speed Lost It on Kai During Their $1M Race 😭 #kaicenat #ishowspeed #shorts"). Never "GTA 6" as the topic.
  Long title: < 70 chars, names + what happened ("Kai Cenat & Speed's Race to $1M Got OUT OF HAND" style).
- Description (always): 1 hook line; "🎮 Streamer: <Name> – https://twitch.tv/<login>" for EVERY streamer shown (a guest on
  call too); "📺 From: <stream title> (<date>)"; "✂️ Edited by Shak Replay – the best Kai Cenat, IShowSpeed & AMP moments
  every day"; "Clips used with credit for commentary and entertainment." (+ "<Game> © <publisher>" if a game is on screen);
  the music credit from clipper/bgm/CREDITS.md: `🎵 Music: "<Track>" by Kevin MacLeod (incompetech.com),
  licensed under CC BY 4.0 – https://creativecommons.org/licenses/by/4.0/`; 4-6 hashtags. Long video: add chapters
  (00:00 + each moment's start from long.json timeline) after the hook line.
- Tags: <each streamer>, <streamer> funny moments, <streamer> highlights, kai cenat, ishowspeed, amp, twitch clips, stream highlights, funny moments (+ shorts).
- Standing approval (owner, 21 Nov): every draft that passes the checks is published right away with vidiq_social_post_publish,
  including on unattended runs. Never leave a passing video as a draft waiting for approval.
- If publish returns `youtube_mfa` / verification required: copy the verification link, send it with PushNotification
  ("Tap to verify SHAK REPLAY, pick shakreplay account, tick every box"), wait up to 20 min re-trying publish every 2 min,
  then leave the rest as drafts and list them in the report.

## 8. Record
- Append each post to `$D/posts.csv` (columns in the header; experiment = which variant this video is).
- Add every used clip slug to `$D/used.json`, and every used stream window to `$D/streams_done.json` (`{vod_id: [window start seconds]}`, the `a` of each window;
  streams.py pick skips fully used VODs, and moments are never posted twice).
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
