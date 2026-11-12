# writes out/metadata.md (title, description with chapters and sources, tags) from the build report
import json
S = json.load(open('/home/claude/ronaldo/script.json'))
rep = json.load(open('/home/claude/ronaldo/out/ronaldo.json'))
files = [t for t, d, w in rep['timeline'] if w == 'file']           # hook card, then the 10 section cards
starts = files[1:]
def ts(t): return f"{int(t // 60)}:{int(t % 60):02d}"
ch = ['0:00 Every time he snapped']
for t, sec in zip(starts, S['sections'][1:]):
    rank, title, sub = sec['card']; ch.append(f"{ts(t)} {rank} {title.title()} ({sub.title()})")
desc = f"""Fourteen red cards, a phone knocked out of a fan's hand, a microphone in a lake, an armband on the grass. Every time Cristiano Ronaldo snapped, why it happened, and what it cost him after.

Which one was the worst? Comment a number from 1 to 10.

Chapters
""" + '\n'.join(ch) + """

Commentary, analysis and editing are original. Clips are used for commentary, criticism and news reporting. All footage belongs to its rights holders.

Sources
""" + '\n'.join('- ' + s for s in S['sources'] + ['Malaga red card (Mtiliga broken nose): FourFourTwo, Jan 2010',
                                                  'Valencia: first Champions League red in 154 appearances, AP / KSL, Sept 2018']) + """

#Ronaldo #CristianoRonaldo #Football"""
md = f"""# Upload pack: Ronaldo rage long-form

**Title (pick one)**
1. Every Time Cristiano Ronaldo Snapped (And What Happened Next)
2. Ronaldo's 10 Angriest Moments, And What They Cost Him
3. Why Ronaldo Keeps Losing It: Every Red Card, Ban and Meltdown

**Thumbnail:** thumbnail.jpg (text: 14 RED CARDS)

**Description**
```
{desc}
```

**Tags:** Cristiano Ronaldo, Ronaldo angry, Ronaldo red card, Ronaldo rage, Ronaldo meltdown, Ronaldo phone Everton, Ronaldo mic lake, Ronaldo Valencia red card, Ronaldo armband Serbia, Ronaldo Ireland red card, Ronaldo walks off, Ronaldo Al Nassr, football rage moments

**Build report:** {rep['duration'] / 60:.1f} min, commentary {rep['commentary_share'] * 100:.0f}% of the runtime, longest stretch of untouched clip {rep['longest_untouched_moment']} s,
{rep['pieces']} shots, {rep['sfx']} sound effects, {rep['stamps']} fact stamps.

**Before upload**
- Content ID: match broadcast clips (BT Sport, Sky, LaLiga, SSC) can be claimed. If a claim blocks the video, trim that moment;
  for a fair-use dispute use templates/contentid-dispute.md with the commentary share above.
- Not "made for kids". Altered/synthetic content: the narration is an AI voice, so tick the disclosure if asked.
"""
open('/home/claude/ronaldo/out/metadata.md', 'w').write(md)
print('\n'.join(ch))
