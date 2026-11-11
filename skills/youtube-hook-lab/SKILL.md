---
name: youtube-hook-lab
description: Build and test the first 30 seconds of Shak Clips long videos and the first 2 seconds of Shorts, with cold-open types, three intro beats, cut rules, retention targets and a rewrite checklist.
---

# YouTube Hook Lab (Shak Clips)

Use after the title and thumbnail exist and before the full script is drafted, or whenever Intro retention or a Short's stayed-to-watch rate is low.
Legend: **[V]** = checked on an official page (see Sources). **[H]** = heuristic, unverified; our own Studio numbers override it.

Scope split: `youtube-retention-scriptwriting` owns the whole script (acts, loops, payoffs, the Short's tail). **This skill owns only 0:00–0:30 of the long video and 0:00–0:02 of the Short**, plus the testing loop between them. If the two disagree about the opening, this skill wins; for anything after 0:30, that one wins.

**Voice constraint (owner re-confirmed 2026-11-11):** narration is Kokoro TTS **am_michael at speed 1.0**, measured at about **141 wpm**. So:
- 30 seconds ≈ **70 words**. 5 seconds ≈ **12 words**. 2 seconds ≈ **5 words**.
- am_michael has no sudden volume or pitch swings, so the hook cannot lean on vocal drama. **Energy has to come from word order, short clauses and the picture on screen.**
- Put the striking noun or number **early in the sentence**; a TTS voice does not land a punchline at the end of a long clause.
- No interjections ("Wow.", "Look at that!"), no trailing-off dashes, no ALL-CAPS for emphasis: they read flat or wrong. Use a full stop and a new short sentence instead.
- Keep the first sentence to **8–14 words, one clause**. Anything longer and the first visual beat has to wait.

## 1. Why the first 30 seconds, specifically
- Studio reports **Intro** = "what percentage of your audience still watched your video after the first 30 seconds" **[V]**. That is the one official number for a hook, so it is the metric we optimise.
- Studio compares the video against **your 10 latest videos of similar length** (typical retention) **[V]**, so the hook competes with our own recent hooks, not with the platform.
- On Home, a video can autoplay muted behind the thumbnail, so the first frames are an extension of the packaging **[H]**. Frame 1 must look like the thumbnail's promise starting to happen.
- Official opening advice, old but still on YouTube's own blog: "Start off with something that will immediately grab attention, whether it's what you say or a stunning visual"; "Make it clear what your video is about early on"; "Tease the rest of the video" — and keep branding out of the way, because "A flashy intro may look cool, but it's not the star of the video" **[V, posted 2011]**. A later YouTube post adds that within the first five seconds viewers should know what the video covers, and lists "Hit them with a cold opening" as a tactic **[V, posted 2014]**.

## 2. The three beats (0:00–0:30, about 70 words)
| Beat | Time | Words | Job | Fails when |
|---|---|---|---|---|
| **Strike** | 0:00–0:05 | 12–16 | One concrete image, claim or number that only this video can offer. Already in motion on screen. | It is a question the viewer has not been made to care about yet |
| **Frame** | 0:05–0:15 | 20–25 | What this is and why it is strange: the situation in one sentence, then the thing that does not fit. | It becomes background history; the viewer still does not know what they are watching |
| **Promise** | 0:15–0:30 | 25–30 | The specific thing they will know by the end, plus the core question, said once. | It is vague ("we'll explore the story") or it is three promises |
Hard rules: the Promise beat must be **checkable** (a named answer, not "the truth"), and the first **payoff** of the title's promise must land by **0:60** (`youtube-seo-metadata` honesty gate). One rhetorical question in the whole 30 s, maximum.

## 3. Cold-open types (rotate; never two days running)
| Type | Shape | Best slot | Risk |
|---|---|---|---|
| **Mid-action** | Drop into the moment of maximum motion, no setup. "The wall gives way at 4 a.m." | history, trending | Viewer has no anchor if the scene is too abstract to draw |
| **Number first** | Lead with the one number the video is built on, then say what it measures | top-5, trending, science | Dead unless the number is verified and surprising |
| **Contradiction** | State the version everyone believes, then the one fact that breaks it | history, what-if | Sounds like a lecture if the common belief is not stated plainly |
| **The "you" moment** | Put the viewer in the situation for one sentence, then step out | what-if, science | Patronising if the scenario is not actually theirs |
| **Object open** | Start on one physical object and widen out to the story | history, top-5 | Slow if the object needs explaining |
| **Countdown tease** | Name the ranking criterion, show #1 as a silhouette, do not name it | top-5 only | Becomes a cheat if #1 is weaker than #3 |
| **Timeline jump** | "Nine minutes later, [consequence]." Then go back and earn it | trending, what-if | Confusing if the two times are not labelled on screen |
| **Quote card** | One real, sourced quote on screen, read flat, then the reaction | trending | Only with a real quote and the speaker named (runbook hard rule) |
Each type needs a different **first visual**, so the director (`explainer-video-direction`) gets the open-type tag in the script: `[OPEN:mid-action]`, `[OPEN:number]`, and so on.

## 4. What to cut from the opening, always
- Greetings, channel name, "welcome back", "in today's video", "before we start", "quick disclaimer".
- Logo stings, fade-ins from black, a title card before the first spoken line. Branding comes after the first payoff **[V]**.
- Background setup that is true but not yet needed. If a sentence answers a question the viewer has not asked, it belongs in the Context act at 0:55+.
- The subscribe ask. One soft CTA goes after the first real payoff, never in the first 30 s.
- Any date, number or name that is not load-bearing. Each extra proper noun in the first 15 s costs about a second of attention **[H]**.
- Two promises. Pick the one the thumbnail already implies.
- Hedges: "some say", "it is believed", "arguably". Allegations still get their label, but put the labelled claim in the Frame beat, not the Strike.

## 5. Targets
| Metric | Where | Target | Status |
|---|---|---|---|
| **Intro (past 30 s)** | Studio → video → Analytics → Engagement / retention report | **≥50%**, fix below 35% | **[H]** |
| Intro vs typical retention | same report, typical-retention band | at or above the band for our 10 latest similar-length videos | **[V]** that the comparison exists; the target is **[H]** |
| Avg % viewed, 8–10 min | Engagement tab | ≥25% | **[H]** |
| Short **stayed to watch** | Studio → Shorts → Analytics | **≥70%**, fix below 60% | **[V]** metric definition; target **[H]** |
| First visual change | the file itself | within 2.0 s | **[H]** |
No official page publishes a "good" Intro percentage, so treat every number above as a channel-internal threshold. Also: retention needs **60 s of length and 100 views** before Studio highlights key moments, and data lags **1–2 days** **[V]** — do not judge a hook at 2 hours.

## 6. The first 2 seconds of the Short
- The Shorts feed rewards the share of viewers who **chose to view** rather than swipe, whether they watched or marked "not interested", likes, and post-watch survey answers **[V]**. All of that is decided before the second sentence.
- Frame 1 is already moving, and is the single most striking image in the story. No title card, no logo, no fade.
- First spoken clause: **5 words or fewer**, a claim or a named thing. With am_michael at 1.0, "In nineteen eighty-six, a Soviet engineer…" has barely started by 2 s — so lead with the thing: "A Soviet engineer faked an entire city."
- Burn in on-screen text of **≤6 words** that restates the hook, so it works muted.
- Something changes visually within 2 s: a cut, a push, or a character move.
- Do not end on a pure tease; the Short needs its own small payoff (`youtube-shorts-growth`).

## 7. Testing hook lines on Shorts before the long video
The cheapest experiment this channel has: a Short reaches a feed audience that does not need subscribers, and returns a readable number in 48 h, while a long video's Intro needs a week.
1. Write **2 hook lines** for tomorrow's topic, differing in **one** thing (open type, or the first noun).
2. Publish line A as today's Short (the Short is cut from the hook anyway, runbook step 8).
3. Read **stayed to watch** and **avg % viewed** at 48 h **[V]** as metrics; label with section 5's targets.
4. If A clears 70%, use it as the long video's Strike beat almost verbatim, adjusting only the length to 12–16 words.
5. If A is under 60%, publish line B as the next Short in the same format slot, then use the winner.
6. Log it as a `short_first` experiment in `experiments.csv` (`youtube-experiment-lab`). One line variable at a time, or the result means nothing.
Caveat: a Shorts-feed audience is not the Browse audience, so a winning Short line is a **strong prior, not proof** **[H]**. Confirm on the long video's Intro at 7 d.

## 8. Hook rewrite checklist (run before the script goes to tts-script-writing)
- [ ] First sentence is 8–14 words, one clause, and names the concrete thing.
- [ ] The first 12 words contain the title's key noun, so the packaging promise visibly starts.
- [ ] Open type is tagged and differs from yesterday's (`log.md`).
- [ ] Three beats present, in order, inside about 70 words total.
- [ ] Promise is checkable, stated once, and paid off by 0:60.
- [ ] Nothing from section 4's cut list survives.
- [ ] Every claim in the hook has 2+ independent sources; allegations labelled "alleged" or "reportedly" (runbook hard rule).
- [ ] No banned openers from `youtube-retention-scriptwriting` ("Have you ever wondered", "Let's dive in").
- [ ] Reads cleanly as am_michael at 1.0: no interjections, no em-dash trail-offs, numbers written as words, one idea per sentence.
- [ ] A new visual lands within 2.0 s and a second one by 5 s; the first frame is not a title card.
- [ ] The Short's first clause is ≤5 words and stands alone with zero context.
- [ ] The 30 s read aloud, timed: 27–33 s at 1.0 speed. If it runs long, cut the Frame beat, never the Strike.

## 9. Ten example hooks for our formats
Shapes to fill with the day's **verified** facts; bracketed slots must be replaced with sourced specifics, never invented. Each is written for am_michael at 1.0.
**Trending explained (Mon/Wed/Fri/Sun)**
1. *Number first:* "[Company] lost [amount] in one afternoon. The reason was a single sentence in a filing nobody read. Here is what that sentence said, and why it mattered more than the headline."
2. *Timeline jump:* "Forty minutes after the announcement, [thing] had already [consequence]. To see why that was predictable, you have to go back to [date]."
3. *Contradiction:* "Everyone is calling this a [common framing]. The documents say something narrower, and the narrower version is stranger. Reportedly, [labelled claim]."
**True history (Tue)**
4. *Mid-action:* "The water is already inside the hull when [person] makes the choice that saves [number] people. Nobody asked him to."
5. *Object open:* "This is a [object]. It is the only reason we know [event] happened at all. For [number] years, it sat in a drawer."
6. *Contradiction:* "The story you were taught about [event] has a date in it. The date is wrong, and the real one changes who the hero was."
**What-if / science (Thu)**
7. *The "you" moment:* "You step outside tomorrow and [premise]. In the first second, almost nothing happens. In the first hour, everything does."
8. *Number first:* "[Quantity] is all it would take. That is the entire margin between [normal state] and [consequence], and we are going to walk down it, one step at a time."
**Top 5 (Sat)**
9. *Countdown tease:* "We ranked these by how close each one came to working. Number one almost did, and the person behind it was never charged."
10. *Object open:* "Five objects, one rule: each had to fool someone who should have known better. We start with the cheapest, and end with the one still on display."
Rotation rule: no open type and no first-sentence pattern twice in a row, and never the same shape twice in one week.

## Sources
- Audience retention report: Intro = % still watching after the first 30 seconds; typical retention compares your 10 latest videos of similar length; flat line, spikes and dips; needs 60 s length and 100 views; 1–2 day processing: https://support.google.com/youtube/answer/9314415
- Shorts and content metrics: stayed to watch, engaged views, avg % viewed: https://support.google.com/youtube/answer/12220281
- Shorts feed signals (chose to view vs swiped away, not interested, likes, post-watch surveys) and avg view duration / avg % viewed as ranking signals: https://support.google.com/youtube/answer/11914225
- YouTube blog, "YouTube Creator Playbook tips: the first 15 seconds" (27 Aug 2011): grab attention immediately, make the subject clear early, tease the rest, branding is not the star: https://blog.youtube/creator-and-artist-stories/youtube-creator-playbook-tips-first-15
- YouTube blog, "Four tips to hook your viewers" (24 Jun 2014): start with a question, brand with a bang, tell them what they're going to see, hit them with a cold opening; viewers should know the subject within five seconds: https://blog.youtube/creator-and-artist-stories/four-tips-to-hook-your-viewers-on/
- Thumbnail & title tips (accuracy; packaging as one promise): https://support.google.com/youtube/answer/12340300
- Spam policy, malicious clickbait (promises the video does not deliver): https://support.google.com/youtube/answer/2801973
- Hook-variant mechanism list adapted and rewritten from AgriciDaniel/claude-youtube `sub-skills/hook.md` and `references/retention-scripting-guide.md` (MIT, Copyright (c) 2025 Daniel Agrici): /home/claude/untrusted/skills-research/agricidaniel_claude-youtube/repo. Its retention and drop-off percentages are third-party and unsourced, so they are not reproduced; the targets here are labelled [H].
- Hook framing also compared against kenneth-liao/ai-launchpad-marketplace `creator-stack/skills/hook` (no licence file found in the clone, so nothing was copied from it): /home/claude/untrusted/skills-research/kenneth-liao_ai-launchpad-marketplace/repo
- Voice measurements (am_michael at 1.0 ≈ 141 wpm) and pipeline facts: /home/claude/shakclips-studio/RUNBOOK.md, skills/youtube-retention-scriptwriting/SKILL.md (read only)
