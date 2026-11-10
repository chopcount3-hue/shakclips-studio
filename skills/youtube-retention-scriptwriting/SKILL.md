---
name: youtube-retention-scriptwriting
description: Structure and draft Shak Clips scripts for retention, covering the packaging promise, the hook, open loops, re-hooks, payoffs, an original take and the Short cut from the hook. Use when outlining or writing any long-form (8-10 min) Shak Clips video or its vertical Short, for news explainers, true history, what-ifs and top-5 lists. Run it before tts-script-writing, which formats the result for Kokoro.
---

# Retention scriptwriting for Shak Clips

Pipeline position: youtube-free-research (idea) -> **this skill (structure + draft)** ->
tts-script-writing (spoken formatting, script.json) -> shak-voiceover -> explainer-video-direction.

Distilled from: agricidaniel/claude-youtube (MIT: script, hook, shorts, metadata sub-skills and
the retention-scripting guide), wondelai/skills `made-to-stick` (MIT: the SUCCESs checklist) and
coreyhaines31/marketingskills `copywriting/references/ai-tells.md` (MIT). Benchmarks quoted in
those repos are unverified third-party figures. Treat them as starting heuristics. Our own YouTube Studio
retention graphs override them.

## 0. Package first (before any script line)
- Write the title and thumbnail concept first. They are the promise the script must keep.
- Title: 40-55 characters, with the curiosity or keyword in the first 40 (mobile truncation). Write 3
  variants with different mechanisms (curiosity gap, contradiction, number/time compression).
- Thumbnail: one focal stick figure or object with a clear emotion, plus 0-4 words that do **not**
  repeat the title. It should pose a visual question that the first 5 seconds answer.
- The first 5 seconds must visibly start paying the promise, because home-page autoplay makes the opening
  an extension of the thumbnail. If the script can't deliver the title's claim, change the title.

## 1. Length budget (~145 wpm: the house voice bm_george:0.7+bm_fable:0.3 at speed 0.94)
| Target | Words | Sections |
|---|---|---|
| 8:00 | ~1,150 | hook + context + 4 sections + payoff |
| 9:00 | ~1,300 | hook + context + 5 sections + payoff |
| 10:00 | ~1,450 | hook + context + 5-6 sections + payoff |
Videos of 8:00 or longer can carry mid-rolls. Never pad to reach 8:00: if the story is 7 minutes, find
another real section (a consequence, a counter-argument, a modern echo) or ship it at 7.

## 2. Skeleton (timestamps are targets, not laws)
| Part | Time | Job |
|---|---|---|
| Grab | 0:00-0:05 | Bold concrete line or mid-action moment. No greeting, no channel name. |
| Promise | by 0:15 | What the viewer will know by the end, specific and checkable. |
| Stakes + core question | 0:15-0:55 | Use the saved hook order: "you" moment, paradox, official story, the evidence that flipped it, the core question. |
| Context | 0:55-1:45 | The minimum background needed. One sentence of "our take" (see section 6). |
| Sections x4-6 | ~80-100 s each | Title-card line, then one concrete example, a visualisable fact, a mini-payoff and a forward hook. |
| Re-hook | ~55-60% | A second hook: "But the strangest part hasn't happened yet." Name what's coming. |
| Climax | last 20% | The biggest reveal or answer to the core question. Strongest material goes here and in the hook. |
| Recap + callback | final 30-45 s | One recap paragraph, then a callback to the opening image. End-screen line in the last 20 s. |
Order the sections by strength: strongest first and last, weaker ones in the middle with extra turns.

## 3. Turns, loops and payoffs
- **A turn every 45-75 s**: new information, a reveal, a doubt line ("You're probably thinking..."),
  a guess beat ("Take a guess."), a striking number, a jump in scale or time. Tag each turn for the director:
  `[TURN:reveal]`, `[TURN:number]`, `[TURN:guess]`, `[TURN:doubt]`, `[TURN:scale]`, `[TURN:time]`.
- **Open-loop ledger**: list every loop as you open it, with the line where it closes. Keep 1-2 open at a time
  and never more than 3. The hook's core question closes in the climax. Every loop must close, and an
  unpaid loop counts as a broken promise.
- **Section exits**: each section ends with a micro-summary (one line) and a forward hook into the next.
- **Payoff before tease**: give a real answer within 90 s of a tease. Teasing again and again without paying off
  trains viewers to leave.
- **CTA**: one soft line after the first real payoff (~1:30-3:00, tied to the content). Never open with one.
  Don't wind down with "thanks for watching". Keep energy to the last line.

## 4. Format templates
- **Trending news explainer**: what happened (1 sentence) -> why it's strange -> the background you need ->
  2-4 players and their motives -> the turn nobody expected -> 2-3 scenarios for what's next, clearly
  labelled as possibilities -> what it means for the viewer. Date-stamp claims ("as of 10 November").
- **True history story**: start in the middle of the action -> who this person is and what they risk -> escalating
  complications -> the turning point -> the aftermath -> what it changed, with a modern echo. Mark the
  uncertain parts ("historians still argue about...").
- **What-if**: state the rules of the premise in one line -> escalate on a timeline (first second, day, year,
  century) -> one wildcard -> the realistic answer, with the science or history it rests on.
- **Top 5**: say the ranking criterion in the hook and tease #1 without naming it. Each entry gets a
  mini-hook, the fact, why it ranks there and a bridge to a bigger next entry. Count down 5 -> 1, and make #1 the climax.

## 5. Stickiness check (SUCCESs, after made-to-stick)
Score each 1-10 and fix the lowest two before formatting:
Simple (one core idea you can say in a sentence), Unexpected (does it break a guess?), Concrete (can it be drawn
as stick figures, with real numbers and objects instead of abstractions?), Credible (are sources named and
numbers checkable?), Emotional (is there a person with something to lose?), Story (is there a protagonist, an obstacle
and a change?). Watch for the curse of knowledge: define every term the first time it appears.

## 6. Original perspective (monetisation safety)
YouTube's Partner Program excludes "inauthentic" (mass-produced or repetitive) content, a policy renamed and clarified
in July 2025. Every script must show human editorial value:
- A one-sentence **thesis** ("Our take: ...") stated in the context and paid off in the climax.
- At least 3 **synthesis moments** that no single source contains: a comparison, our own analogy, our own
  back-of-envelope calculation, or two sources that disagree.
- At least 3 independent sources in `facts`. Never paraphrase one article or one competitor's video
  beat for beat. Borrowing a structure grammar is fine, but copying a script's selection and order is not.
- **Rotate hook mechanisms** across consecutive uploads (shock/contradiction, story-open, curiosity gap,
  problem, a "you" scenario), and don't reuse a template sentence verbatim from video to video.
- Keep it advertiser-friendly: no graphic descriptions of violence or injury, no profanity, no shock framing
  of tragedies. For news involving deaths, use a neutral tone and give context instead of spectacle.

## 7. Spoken style without AI tells (after ai-tells.md, adapted for narration)
- Banned openers: "In today's video", "Let's dive in", "Buckle up", "Have you ever wondered".
- Banned words: delve, tapestry, testament, game-changer, unleash, realm, "in a world where".
- Capped at once per video: "Not X. It's Y." contrasts, colon reveals ("The result: ..."), and lists of three adjectives.
- A rhetorical question is fine when it is the viewer's real question. Cap it at one per section.
- Prefer concrete nouns and verbs a stick figure can act out. Vary sentence length (tts-script-writing has the limits).

## 8. The Short (cut from the hook)
- 30-55 s (about 80-140 words): hook paragraphs + a **short_tail** of 1-2 sentences that gives a real
  answer or a punchline, then a loop line that flows back into the first line.
- The first line must make sense with zero context and land in 1-2 s.
- Don't end on an unanswered question. A Short that only teases gets swiped. Link the long video through
  YouTube's related-video field, not by saying "watch the full video" three times.

## 9. Deliverable
1. Packaging block: 3 titles, thumbnail concept, 2-line description opener, chapters (start at 0:00, at least 3
   chapters of 10 s or more, named after the section title cards).
2. Outline table: part | time | words | turn tags | loop opened/closed.
3. Full script in paragraphs, plus `short_tail`, a thesis line and a facts list. Hand it to tts-script-writing.
4. Retention risk map: at least 3 places viewers may leave, each with the fix (shorten, add a turn, move a payoff earlier).

## Final check
- [ ] Title promise paid within 5 s, and fully paid by the climax
- [ ] Word count within ±5% of target, with a turn at least every 75 s
- [ ] Loop ledger: every loop closed, never more than 3 open
- [ ] Thesis, 3 synthesis moments, 3+ sources, and a hook mechanism different from the last upload
- [ ] No banned phrases, and capped devices within their caps
- [ ] The Short stands alone and has a payoff
