---
name: clip-daily-ops
description: Run the GTA 6 clip channel day - which streamers to pull from, the 10 Shorts + 2 long-forms quota, time budget on 2 cores, upload schedule for YouTube and Facebook, logging and the quality gate.
---

# Clip channel daily operations

## Quota
- **10 Shorts** (45–58 s) and **2 long-forms** (about 5 min) per day, from GTA 6 streams of the last 24–48 h.
- Start date: GTA 6 launch, **19 Nov 2026**. Nothing GTA 6 before that date (pre-release footage gets taken down).

## Creators (the owner confirmed each allows clipping; credit every time)
| Creator | Where they stream | How we get it |
|---|---|---|
| Kai Cenat | Twitch `kaicenat` | `fetch.py` VOD + chat (works) |
| Fanum | Twitch | `fetch.py` VOD + chat |
| Ray | check: Twitch or YouTube | Twitch → `fetch.py`; YouTube → owner uploads |
| IShowSpeed | YouTube | **owner uploads the file** (YouTube blocks this server), or a Twitch/Kick simulcast if there is one |
| others the owner adds | | same rule: only with permission |

Keep the creator list and each one's clipping-program terms in `creators.md`, and follow each program's rules (credit format,
max length, no-monetize clauses).

## Time budget (measured, 2 cores, 7 GB RAM)
- Download: about 1 min per 35 min of stream. Analysis: about 3 min per hour of stream.
- Picking moments: 1–2 min per clip. Editing: 1–2 min per Short.
- Long-form: about 15 min each (with narration).
- A full day's quota takes about 2.5–3 hours of compute. Run heavy jobs **one at a time**: the Chatterbox voice or Whisper small.en
  running beside an edit gets killed for memory.

## Order of the day
1. List each creator's newest VODs (`yt-dlp --flat-playlist twitch.tv/<name>/videos?filter=archives`). Skip what `log.md` already used.
2. Fetch the chat for whole VODs first (cheap), find the hottest 20–40 min windows, and fetch only those parts of the video.
3. `analyze.py` → `clip-moment-selection` → 14–16 candidates → the best 10 → `edit.py` (`clip-editing-style`).
4. Long-forms: the best 6 segments not used as today's Shorts, or the Shorts' extended versions (`clip-longform-compilation`).
5. QA every file (`clip-editing-style` §4). A file that fails is fixed or dropped, never uploaded.
6. Upload (once the channels exist and are connected):
   - YouTube: vidIQ `vidiq_video_upload` → `vidiq_social_post_draft_create` → `vidiq_social_post_publish`.
   - Facebook: through the vidIQ social account if it supports Facebook Pages, otherwise a Meta connector.
   - Spread Shorts across the day (every 1.5–2 h from 9 AM US Eastern). Long-forms at 3 PM and 8 PM ET.
7. Log every upload in `log.md`: source VOD and time, creator, title, post ids, views after 24 h. Feed winners back into the picking.

## Never
- Upload anything twice, or anything another channel already posted that day with big views.
- Use a creator who hasn't allowed clipping, or break a clipping program's terms.
- Buy views or subs, or use sub-for-sub.
- Promise the owner earnings. Report the real numbers from Studio and the Facebook dashboards.
