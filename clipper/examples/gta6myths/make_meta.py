# out/metadata.md for "13 GTA 6 Gameplay Myths, Busted Before Launch"
import json
M = '/home/claude/gta6myths/'
rep = json.load(open(M + 'out/gta6_myths.json')); NW = {str(x['i']): x for x in json.load(open(M + 'narr38/lines.json'))}
CL = ['The map is just Vice City', "You can't switch between Jason and Lucia", 'Stealing a car is smash and grab', 'NPCs only react when you shoot',
      'You can rob any store', 'Every building is enterable (700+)', 'Cops drive unmarked cars', 'The 6-star wanted level is back', 'Your character can get fat',
      'There are alligators', 'The phone is just a menu', 'It runs at 60 fps on PS5', 'GTA Online on day one']
def ts(t): return f"{int(t // 60)}:{int(t % 60):02d}"
ch, k, tl = ['0:00 Intro'], 0, rep['timeline']
for n in range(1, 14):        # each myth card is the single info shot under line m{n}a
    want = NW[f'm{n}a']['dur'] + 0.22
    while k < len(tl) and not (tl[k][2] == 'info' and abs(tl[k][1] - want) < 0.08): k += 1
    if k < len(tl): ch.append(f"{ts(tl[k][0])} Myth #{n}: {CL[n - 1]}"); k += 1
sources = ['SVG: Everything Rockstar Just Confirmed About GTA 6 Gameplay In The Extended Look (Aug 2026)', 'GTA Intel: GTA 6 Extended Look gameplay details recap (Aug 2026)',
           'Dataconomy: GTA 6 Extended Look Reveals Gameplay And Six-star Wanted System (Aug 2026)', 'Push Square: GTA 6 Targeting 30fps on PS5, Undecided on Performance Mode (Aug 2026)',
           'All Things How: GTA 6 launches as a single-player experience, no GTA Online at release (Nov 2026)', 'GamingBible: GTA 6 rumours doing the rounds right now (Feb 2026)']
desc = """GTA 6 is one week away and the internet is full of gameplay "facts" that aren't true. We went through the 26-minute gameplay reveal, Rockstar's own words and every recap we could find: 13 GTA 6 gameplay myths, busted before launch. Number 13 hurts. 😭

Which one fooled you? Comment the number 👇

Chapters
""" + '\n'.join(ch) + """

Sources
""" + '\n'.join('- ' + s for s in sources) + """

Gameplay clips from the GTA 6 Extended Look live reveal, as streamed by Kai Cenat, xQc, Asmongold (zackrawrr), Moist, AngryGinge, JasonTheWeen, Joe Bartolozzi, TimTheTatman, DarkViperAU, HasanAbi and typicalgamer. GTA 6 footage belongs to Rockstar Games. Commentary, editing and narration by Shak Replay.

#GTA6 #GTAVI #GTA6Gameplay #ShakReplay"""
md = f"""# Upload pack: GTA 6 gameplay myths

**Title (pick one)**
1. 13 GTA 6 Gameplay Myths You Probably Believe 😳
2. GTA 6 Myths BUSTED Before Launch (#13 Hurts)
3. Everything You Believe About GTA 6 Gameplay Is Wrong

**Thumbnail text ideas:** "YOU'VE BEEN LIED TO" · "13 MYTHS" · "#13 HURTS 😭"

**Description**
```
{desc}
```

**Tags:** GTA 6, GTA VI, GTA 6 myths, GTA 6 gameplay, GTA 6 rumors, GTA 6 facts, GTA 6 60 fps, GTA 6 30 fps, GTA 6 online, GTA 6 map, Leonida, GTA 6 wanted level, GTA 6 six star, GTA 6 alligators, GTA 6 extended look, GTA 6 release November 19, Shak Replay

**Schedule:** Sunday 15 November, 8:30 PM IST (10:00 AM New York). Language English, category Gaming, not made for kids.
**Build report:** {rep['duration'] / 60:.1f} min, narration {rep['commentary_share'] * 100:.0f}% of the runtime, {rep['sfx']} sound effects, {rep['stamps']} stamps.
**Risk:** Rockstar/Take-Two may claim the gameplay. If a claim blocks the video, tell me the timestamp and I'll cut or replace it.
"""
open(M + 'out/metadata.md', 'w').write(md)
print('\n'.join(ch))
