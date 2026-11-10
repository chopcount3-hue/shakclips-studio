---
name: youtube-content-calendar
description: "Plan Shak Clips' weekly and monthly uploads (format mix, series, tentpole dates, timing) and write them into topics.md in a format the daily run can read."
---

# YouTube Content Calendar (Shak Clips)

Use when planning the next 1–5 weeks, adding a holiday or anniversary video, moving the upload time, or filling `topics.md`.
Legend: **[V]** = checked on an official page (see Sources). **[H]** = heuristic (unverified): test it against the channel's own Studio data.

## Fixed inputs
- The daily run makes 1 long video (8–10 min) plus 1 Short cut from its hook. Both are scheduled with `publishAt <run date>T22:00:00Z`, which is 03:30 IST the next morning.
- 22:00 UTC is 5 PM New York while the US is on standard time, which lasts until **Sun 14 Mar 2027**. After that it is 6 PM EDT. To stay at 5 PM ET, switch the slot to 21:00 UTC on 14 Mar. Decide once and don't drift.
- The weekday of a video is the **UTC date of the run**.

## Weekly mix as named series (habit builders)
| UTC day | Format | Series tag (title, playlist, thumbnail badge) | Evergreen? |
|---|---|---|---|
| Mon / Wed / Fri / Sun | trending story explained | Shak Explains | partly |
| Tue | true story from history | True Story Tuesday | yes |
| Thu | what-if or science | What If Thursday | yes |
| Sat | top-5 countdown | Top 5 Saturday | yes |

- A series name promises a weekly slot, so say it in the outro, e.g. "Every Tuesday: one true story that sounds fake."
- Series are fine under the inauthentic-content policy only if each episode has **its own storyline, focus or concept**. Reusing the same intro and outro is allowed while most of the content differs **[V]**. Never repeat a "same situation, same outcome" pattern **[V]**.
- Recurring segments: "Shak's take" (the runbook requires 2+ per long video) and "The part nobody talks about".
- Viewer-voted slot: the Saturday #1 is picked by a Monday poll (see `youtube-community-engagement`).
- Rotate evergreen themes so two in a row never match. Themes: cons and heists / disasters survived / inventions / space / weird laws / food origins.

## Evergreen vs trending
- The mix is 4 trending to 3 evergreen. Watch hours come mostly from evergreen search traffic. Trending views decay within days **[H]**.
- On trending days, prefer a story with a lasting "why" question over a same-day update. The test: does the title still make sense in 6 months? **[H]**
- Decision rule after 4 full weeks of data (YouTube Studio, free): compare the median 14-day views of trending vs evergreen long videos. If evergreen is equal or higher, turn Sunday into "Shak Explains: the backstory", an evergreen explainer of something currently trending. Re-check monthly.

## Upload timing and consistency
- Publish at the same time every day. Change the slot at most once a month, and log the reason in `log.md`.
- **Notification cap [V]:** a viewer gets at most 3 new-video notifications from one channel in 24 h, and publishing more than 3 videos in a short time can pause notifications for 24 h.
  - The daily long video plus Short uses 2, leaving room for at most **1 extra hand-made video per rolling 24 h**. On 2026-11-10 the channel published 3, which is the limit.
  - If a 4th public upload would land inside 24 h, schedule it for the next day or put it in `## Calendar` for its own date.
- After about 4 weeks of data, open Studio → Analytics → Audience → "When your viewers are on YouTube" (covers the last 28 days) **[V]**. If the US evening peak is clearly later than the slot, move the slot so the video is live 1–2 h before the peak **[H]**.
- Publish the Short at the same 22:00 UTC as its long video. It links back through the related-video field (see `youtube-community-engagement`).

## Tentpoles, Nov 2026 – Mar 2027
Confirm every date with a quick search before scheduling. Publish evergreen tentpole videos 5–10 days early, because search demand builds before the day **[H]**. Trending tentpoles go out the same day or the day after.
| Publish (UTC) | Hook date | Planned slot |
|---|---|---|
| Tue 24 Nov | Thanksgiving, Thu 26 Nov | True Story Tuesday: the 1621 harvest, myth vs record |
| Fri 27 / Mon 30 Nov | Black Friday / Cyber Monday | trending, retail stories |
| Tue 1 Dec | Pearl Harbor 85th anniversary, Mon 7 Dec | True Story Tuesday |
| Thu 17 Dec | Wright brothers' first flight, 17 Dec 1903 | What If Thursday: "What if the Wrights had failed?" |
| Sat 19 Dec | Christmas, Fri 25 Dec | Top 5: strangest Christmas history |
| Sat 26 Dec | year end | Top 5: biggest stories of 2026 (checked facts only) |
| early Jan | CES 2027 (confirm dates) | trending tech |
| Sat 9 Jan | iPhone unveiled 9 Jan 2007 (20 years) | Top 5 Saturday |
| Tue 12 Jan | MLK Day, Mon 18 Jan | True Story Tuesday (keep it respectful and factual) |
| Tue 26 Jan | Apollo 1 fire 60th (27 Jan); Challenger (28 Jan) | True Story Tuesday |
| Tue 2 Feb | Groundhog Day | True Story Tuesday: the odd origin |
| Sun 14 Feb | Super Bowl LXI, SoFi Stadium (reported), plus Valentine's Day | trending |
| Thu 11 Mar | Pi Day and the clock change, Sun 14 Mar | What If Thursday: "What if we never changed clocks?" |
Skip any tentpole whose only angle is a tragedy with victims. The runbook bans ongoing tragedies.

## Monthly routine (about 15 min, last Sunday of the month)
1. List next month's tentpoles: search "<month> 2027 US events", then confirm each on a primary site.
2. Fill **every Tue/Thu/Sat** with an evergreen topic. Check demand with `youtube-free-research` (free). Plan 1 spare per week.
3. Leave trending days as `AUTO`. Add a `hint=` only when a scheduled event lands on that day.
4. Grep `log.md` and `## Done` so no topic repeats.
5. Every Sunday (5 min), swap any slot that the week's news has made stale.

## topics.md calendar template
The runbook reads `## Calendar` first: an unchecked line dated today's UTC run date wins; otherwise it falls back to `## Queue`, then a trending pick. Dated lines never go under Queue.
```markdown
## Calendar
<!-- One line per UTC run date. Fields are split by " | "; an optional angle follows " — ". -->
- [ ] 2026-11-24 | Tue | history | The real first Thanksgiving | series=True Story Tuesday — what the 1621 letters say vs the school version
- [ ] 2026-11-26 | Thu | whatif | What if the Mayflower had landed in Virginia? | series=What If Thursday
- [ ] 2026-11-27 | Fri | trending | AUTO | hint=Black Friday
- [ ] 2026-11-28 | Sat | top5 | 5 Thanksgiving traditions with weird origins | series=Top 5 Saturday; poll=yes
```
- Line grammar: `- [ ] DATE | DAY | trending|history|whatif|top5 | TOPIC or AUTO | key=value; key=value — angle`
- Parser regex: `^- \[( |x)\] (\d{4}-\d{2}-\d{2}) \| (Mon|Tue|Wed|Thu|Fri|Sat|Sun) \| (trending|history|whatif|top5) \| ([^|]+?)(?: \| ([^—]+?))?(?: — (.+))?$`
- Keys: `series=`, `hint=`, `poll=yes` (the #1 is set by the Monday poll), `tentpole=<event>`.
- When a video is done, tick the line and move it to `## Done` in the runbook's format: `- [x] topic — <date>, "<long title>" / "<Short title>"`.
- Checks before saving: the weekday matches the date, the format matches the weekday, there is one line per date, the topic is not already in `log.md`, and every history or what-if topic has 2+ independent sources.

## Sources
- Notification cap: https://support.google.com/youtube/answer/7389684
- Inauthentic content policy, renamed 15 Jul 2025: https://support.google.com/youtube/answer/1311392
- "When your viewers are on YouTube" report: https://support.google.com/youtube/answer/9314416
- Super Bowl LXI date (third-party, confirm nearer the time): https://www.giga.de/entertainment/schlechte-nachrichten-fuer-romantiker-der-super-bowl-2027-hat-einen-termin-der-vielen-nicht-gefallen-wird--01J5QJPN0PCB79FS0K48K5PC36
- Distilled and rewritten from the MIT-licensed repos:
  - agricidaniel/claude-youtube: `sub-skills/calendar.md`, `sub-skills/strategy.md`, `references/repurposing-guide.md`. Its 70–80% evergreen target and Q4/January CPM swings are heuristic (unverified).
  - coreyhaines31/marketingskills: `skills/community-marketing` (community rituals).
- Pipeline facts: `/home/claude/shakclips-studio/RUNBOOK.md` and `topics.md` (read only).
