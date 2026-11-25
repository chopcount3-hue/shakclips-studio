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

## 6. Long video (6-9 min, "<Names>' Funniest Moments from <stream>" style)
First `python3 $D/bleep_clips.py <the long video's clips>` (longform.py does not bleep moment audio) and use the *_bl.mp4 copies.
Follow `$D/long_example.py`: Kokoro narration (am_michael, speed 1.08) for a cold-open hook, a 1-sentence setup before each
moment (who, what's at stake – never the punchline), short reactions between, and an outro (subscribe + next stream tease).
Commentary share ≥ 25 % (longform prints it). Best moment last, teased in the cold open. Then
`bash $D/fit100.sh $WORK/long/long.mp4 $WORK/long/long_fit.mp4 94` (must be < 100 MB). Spot-check 6 frames. US English.

## 6b. Thumbnails (owner, 22 Nov: "make also thumbnails professional level and interesting")
**DEFAULT STYLE since 24 Nov, v2 (owner: "not catchy... no GTA 6 logo, no clear photo"):** `$D/thumb_hero.py spec.json out.jpg`
(example `days/2026-11-24/thumbs/long_v4.json`), following the skill anthropic-skills:youtube-thumbnail-design.
ONE big, bright, SHARP gameplay frame of the most visual moment (prefer the biggest name's moment if it is bright; else
the most-viewed clip): grab 6-8 timestamps around the peak, score edge variance + brightness, Read a contact sheet, take
the clearest. Then a red ring on the action, a big pink->orange "GTA 6" badge (our own typography: never paste Rockstar's
logo artwork), the streamer pill under it, and 1-2 HUGE words at the bottom ("NO *WAY?!*", "HOW?!", "IT'S *REAL?!*").
Max 3 elements, glance test at 160 px (Read out_qa). Streamer faces (owner wants Speed / Kai etc. on thumbnails): use a reaction photo the OWNER supplied in the repo's photos/
folder, named after the Twitch login (photos/ishowspeed-*.jpg, photos/kaicenat-*.jpg...). If one exists for a streamer in
the video, set "face": "photos/<file>" in the spec: thumb_hero.py cuts it out unedited and puts it on the right. Never grab
a face from the clips or the web; if no photo is there, build without a face and say so in the report.

- **Frame:** the funniest or most visual instant (the crash, the glitch, the moment just before it). Gameplay only: never a
  streamer's face or a photo of a real person. Get the source-pixel `crop` (leave out webcam, chat, minimap) and the
  `circle` [cx, cy, r] around the key detail from a `frame.py <name> <t>` grid frame.
- **Clickbait is allowed** (owner, 22 Nov: "you are allowed to make clickbait so that people must watch our video"). Go
  hard: shock, mystery, a dare or a question. Pick the single most unbelievable instant in the video, ring it, magnify it
  with `zoom` if it's small, and ask about it ("WHY IS IT *FLYING?!*", "THE GAME *BROKE*", "DON'T *LOOK*", "HE LOST
  *90 HOURS?!*"). The one hard line: what the thumbnail shows or claims must really happen in the video. YouTube removes
  misleading thumbnails and holds back their reach, and a viewer who feels tricked leaves in seconds and kills
  retention. So exaggerate the reaction, never invent the event.
- **Lead with the biggest name** (owner, 23 Nov: "add i showspeed in the thumbnail so that it gets more views"). If
  IShowSpeed (or another top name: Kai Cenat, xQc, Jynxzi, CaseOh) is in the video, build the thumbnail on HIS moment, put
  his name in the words (`"*SPEED* FOUND", "AN *ALIEN?!*"`), and make his badge the first one. Names only, never his
  face or photo.
- **Words:** 1-2 lines, 1-3 words each, curiosity and emotion. Never repeat the title's words, and never answer the
  question the thumbnail asks. `*word*` = accent colour (red for danger or shock, yellow for hype).
- **Examples:** 23 Nov long AfYP7wzr1S8 (`days/2026-11-23/thumbs/AfYP7wzr1S8_speed.json`): the alien on the table
  with a ring on its eye, "*SPEED* FOUND / AN *ALIEN?!*", badges ISHOWSPEED / XQC / JERMA. 22 Nov long q7Wck99d2gc, `days/2026-11-22/thumbs/q7Wck99d2gc.json`: a binocular
  frame of a person floating in the sky, ring + zoom bubble (spec coordinates are always 1920x1080: thumb.py scales 720p clips up), "WHY IS IT *FLYING?!*", badges JERMA / LIRIK / LACY.
- **Badges:** up to 3 of the biggest streamer names in the video (popular names are what people click).
- Read `out.jpg` AND `out_qa.jpg` (small sizes on white and dark backgrounds, greyscale). Fix it if the words are hard
  to read at the smallest size, the circle covers the words, or the subject is cut off. Then add any lesson to LEARNINGS.md.
- Host the thumbnail in the SAME host.sh call as the videos.

## 7. Post (vidIQ) – US peak times
```bash
python3 $D/slots.py        # 2 Short slots (11:00, 18:00 ET) + 1 long slot (15:00 ET) -> UTC; past slots roll to tomorrow
cp today's new Shorts, long_fit.mp4 and the long video's thumbnail (sr_<date>_long_thumb.jpg) to $WORK/up/ with simple names (sr_<date>_s1.mp4 ... sr_<date>_long.mp4)
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
