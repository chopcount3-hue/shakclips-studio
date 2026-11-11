---
name: clip-moment-selection
description: Find the funniest and most loved moments in a long GTA 6 stream using chat spikes, reactions, game events and transcript cues, and turn them into a ranked list of 45-60 s Shorts and long-form segments.
---

# Clip moment selection (GTA 6 streamer clips)

Use after `analyze.py` and before writing any `plan.json`. Picking the moment matters more than any edit, and most "boring clip"
complaints come from picking a moment that is only loud, not funny.

## 1. Signals, strongest first
1. **Chat laugh burst** (`chat.json`, shifted 5–6 s earlier because chat lags). Count per 15 s: `KEKW LUL OMEGALUL LMAO LMFAO ICANT 💀 😭 😂 LOL`
   plus the streamer's own laugh emotes (Kai Cenat: `kaicCaught4K`, `buckyb4PEE`). This finds **funny**.
2. **Chat hype burst**: `W WW WWWW AURA EZ GOAT CINEMA 🔥 POG`. This finds **wins and clutch moments**.
3. **"I WAS HERE" spam** marks a historic moment (beating the game, a record, a farewell). That's long-form gold and a strong Short.
4. **The streamer's reaction**: a loudness spike over his own 60 s baseline, screaming, "oh my god" ×3, standing up, hands on head,
   leaving the chair. Check the webcam frames, not just the audio.
5. **Game events on screen**: `WASTED`, `BUSTED`, `MISSION FAILED`, wanted stars jumping, crashes, falls, explosions, ragdoll
   physics, NPC chaos, police chases, absurd glitches. Grab frames 1 s apart around the peak and look.
6. **Transcript cues**: "bro what", "no way", "chat did you see", "clip that", "I'm done", callouts and roasts of chat or friends.

A good Short has **at least two** of these in the same 15 s. A loud moment with no chat reaction is usually just loud.

## 2. Moment types that win (in order)
1. **Fail plus reaction**: a crash, a death or a mission failed, and the streamer's disbelief. The payoff is visual and instant.
2. **Chaos escalation**: one small action snowballs (5 stars, the whole city chasing).
3. **Roast or banter** with chat, friends or NPCs. It needs clear audio, and the captions carry it.
4. **Clutch win**: an impossible escape, a perfect shot, "W" spam.
5. **Wholesome or historic**: beating the game, a farewell, a milestone ("next time you see me, it's GTA 6").
6. **Game discovery**: a hidden detail or an easter egg the streamer reacts to. Only if it isn't a story spoiler.

## 3. Hard skips
- **Pre-release or leaked GTA 6 footage of any kind** (Rockstar takes it down). Nothing before 19 Nov 2026.
- **Story spoilers:** the ending, cutscene compilations, major reveals. Rockstar removes these. Gameplay plus reaction is fine.
- **Graphic violence in the first 7 s** (YouTube ads). Move the payoff after 7 s or open on the reaction cam instead.
- Real-life drama, slurs, harassment of a real person, anything sexual, minors on stream.
- Moments that need 2+ minutes of context to be funny. They belong in a long-form or nowhere.
- Duplicates: another clip channel already posted it with 1M+ views in the last 24 h (check YouTube search for the streamer + key line).

## 4. Window rules
- **Short:** a story of 45–58 s. Start 10–25 s before the payoff, at a sentence start, with the setup visible. End 2–5 s after the
  reaction peaks, on a laugh or a line. `edit.py` pulls in more lead-up automatically when the cut story lands under `min_len`.
- **Teaser:** the 1.5–3 s of the payoff itself (the WASTED or MISSION FAILED frame plus the scream).
- **Replay:** the 2–4 s action right before the payoff, slowed to half speed.
- **Long-form segment:** 40–90 s. Five to seven segments make a 5-minute video, linked by narrated bridges.

## 5. Output of this step
Write for each pick, ranked, into `picks.md`:
- the source times (start, end, teaser, replay)
- the moment type
- the signals and their counts
- the hook text
- 2–4 SFX beats with source times

Then copy them into `plan.json` for `edit.py` (see `clip-editing-style`).
