---
name: clip-editing-style
description: The house edit grammar for 45-60 s GTA streamer Shorts with edit.py - cold open, jump cuts, punch-ins, VFX impacts, slow-mo replay, captions, and which sound effect from the owner's pack goes on which beat.
---

# Clip editing style (edit.py)

Every Short follows this grammar. YouTube now cuts reach for plain reposts (1 Oct 2026), so this edit is also what makes the
clip **ours**: never upload a raw cut.

## 1. Structure (target 45–58 s, never 60+)
| Time | Beat | edit.py |
|---|---|---|
| 0–2.5 s | **Cold open:** the payoff (WASTED, crash or scream), punched in, with the hook banner | `teaser`, `hook` |
| 2.5 s | **White flash** transition into the story | automatic |
| 3–45 s | **Story:** setup, escalation, payoff, reaction; dead air removed | `start`, `end`, jump cuts on by default |
| last 4–8 s | **Slow-mo REPLAY** of the action before the payoff | `replay` |
| end | Ends on a laugh or a line, never on silence, so the loop feels natural | |

## 2. Rules of the cut
- Jump cuts remove gaps over 0.35 s that have no speech and no loud reaction. Every second cut punches in 8% so the jumps look
  intentional. Don't cut inside a word.
- One visual event every 2–3 s: a cut, a punch, a flash, a caption pop or an SFX.
- **Impacts** (crash, punch, death, explosion): `shake` + `flash` + an impact SFX on the same frame.
- **Reveals and "no way" moments:** `punch` (a zoom-in that settles in 0.5 s).
- Hook banner: 2–6 words, all caps, a curiosity gap, not a spoiler and not clickbait. Examples:
  - "THE MOUNTAIN WON"
  - "HE WAS NOT READY"
  - "CHAT CALLED IT"
  - "KAI'S NEXT STOP: GTA 6"
- Layout:
  - `facecam` when there's a webcam over gameplay. Cam on top; gameplay below at `game_zoom` 0.8 on a blurred fill, so centred
    game text like WASTED or MISSION FAILED isn't cut off.
  - `blur` with `zoom` 1.2–1.3 for full-screen cam or IRL.
- Captions: Luckiest Guy, 2–3 words per chunk, the spoken word in gold. They are re-transcribed per clip with Whisper small.en,
  words under 0.45 confidence are hidden, and swears are masked (F***).

## 3. SFX vocabulary (the owner's pack, `sfx/user`, plus ours, `sfx/made`)
Use 3–6 per Short. Keep the sounds under the streamer's voice: gain 0.3–0.6 for beds, 0.8–1.0 for one-shot hits.
| Beat | First choice | Alternatives |
|---|---|---|
| Crash, fall, hit | `bone_crack`, `punch` | `slap_2`, `bamboo_hit`, ours: `bonk`, `boom` |
| Fail, death, mission failed | `bruh` (after the game's own sting) | `wah_wah_wah`, `dissapointed`, `cartoon_deflate`, ours: `sad_trombone` |
| Disbelief, reveal | `nani`, `what`, `oh_no` | `wow_1`, `wow_2`, ours: `record_scratch` |
| Hype, win | `air_r_horn`, `celebration` | `cheering_kids`, `clapping`, `tadaa`, `amazing` |
| Funny beat after a line | `ba_dum_tss`, `crickets` | `audience_laughing` (gain 0.3), `baby_laughing` |
| Running away, chase | `goofy_cartoon_running_dash` | `zip_away` (ours), `slide_whistle` |
| Tension before the payoff | `suspense_5` (0.3) | `ticking_clock`, `heartbeat`, `rising` |
| Transitions | `whoosh_transition` (automatic) | `fast_swish_transition`, `swipe_swoosh_transition` |
| Replay | `tape_rewind` (automatic) | `flashback` |
| Money | `cash_register` | ours: `cha_ching` |

**Never on monetized uploads** (Content ID risk, see `sfx/user/index.md`): the Mario sounds, `among_us`, `the_x_files`,
`troll_song`, `morty_evil_i`, `russell_westbrook_what`, the Windows sounds, `double_kill` and `tripe_kill`, `enemy_spotted`, `subscribe`, and the
music beds (`angels_singing`, `sas_piano`, `sad_violin`, `fighting`, `ayogima`, `dreaming`, `investigating`, `shocked_2`, `creepy_wind`).

## 4. QA before upload (every Short)
- `ffprobe`: 1080×1920, 30 fps, 45–59 s, **exactly two streams (video + audio), no data or chapter track**. A chapter track makes
  players show a long blank tail; `fetch.py` and every encode strip it.
- Loudness −14 ± 1.5 LUFS.
- A 1 fps contact sheet: no black stretches over 1 s (except a game's own death fade), no cut-off game text,
  captions readable and inside the safe zone (not in the top 14% or bottom 20%).
- Watch the first 3 s at phone size: is it obvious why to keep watching?

## 5. Narration: required on every upload (the owner's tutorial, 12 Nov 2026)
Clips with only edits and music get rejected as **reused content**. What keeps clip channels monetized is **commentary**:
a short script read over the clip, with the stream audio ducked underneath.
- `narration` in `plan.json`: 3–5 lines in the house voice (Chatterbox Turbo, Michael reference), storytelling, present tense, punchy:
  1. a hook over the cold open ("Kai Cenat really thought this mountain was a shortcut.")
  2. a set-up line
  3. a "watch this" line just before the payoff
  4. a punchline after the reaction (one Turbo cue at most, e.g. `[chuckle]`)
  Never describe what viewers can plainly see word for word. Add context, stakes or a joke.
- `marks`: a red **arrow** on what to watch just before the payoff, and a red **circle** on the result or the reaction (`x`, `y` as
  fractions of the 1080×1920 frame; check a frame first).
- **The originality gate** (printed by `edit.py`, written to `metadata.md`): our voice covers **≥25%** of the Short, and no stretch
  over **8 s** passes without a cut, narration line, mark or effect. A FAIL is fixed (add a line, a mark or a cut), never uploaded.
- Long-forms: voice **≥30%**, the same 8 s rule. Keep the gate numbers for the Content ID dispute (`templates/contentid-dispute.md`).
