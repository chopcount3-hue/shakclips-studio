# out/metadata.md for the GTA 6 reveal reactions video (titles, description with chapters and credits, tags)
import json
rep = json.load(open('/home/claude/gta6vid/out/gta6.json'))
files = [t for t, d, w in rep['timeline'] if w == 'file']          # hook card, then the 5 act cards
acts = ['The crash', 'First look', 'The funniest moments', 'Hot takes', 'The pre-order']
def ts(t): return f"{int(t // 60)}:{int(t % 60):02d}"
ch = ['0:00 The internet broke'] + [f"{ts(t)} {a}" for t, a in zip(files[1:], acts)]
credits = ['Kai Cenat - twitch.tv/kaicenat', 'IShowSpeed - youtube.com/@IShowSpeed', 'Lirik - twitch.tv/lirik', 'MoistCr1TiKaL - twitch.tv/moistcr1tikal',
           'xQc - twitch.tv/xqc', 'Jynxzi - twitch.tv/jynxzi', 'Fanum - twitch.tv/fanum', 'Asmongold - twitch.tv/zackrawrr', 'DDG - twitch.tv/ddg',
           'ohnePixel - twitch.tv/ohnepixel']
desc = """August 27th: Rockstar showed 26 minutes of GTA 6 live on Netflix, Twitch went down, and the biggest streamers completely lost it. Kai Cenat, IShowSpeed, Jynxzi, xQc, Asmongold, Fanum and more react to GTA 6, plus the worst pre-order advice of 2026.

GTA 6 launches November 19. Subscribe, we're clipping every launch reaction 🔔

Chapters
""" + '\n'.join(ch) + """

Streamers (go support them, all clips credited)
""" + '\n'.join('- ' + c for c in credits) + """

Commentary, editing and narration by Shak Replay. Clips are used for commentary and entertainment. GTA 6 footage belongs to Rockstar Games.

#GTA6 #KaiCenat #IShowSpeed #GTAVI #ShakReplay"""
md = f"""# Upload pack: GTA 6 reveal reactions

**Title (pick one)**
1. Streamers React to GTA 6's Live Reveal (It Broke Twitch)
2. GTA 6 Broke Twitch: Kai Cenat, Speed & More React
3. 10 Streamers Lost It Watching GTA 6 Live 😭

**Thumbnail text idea:** IT BROKE TWITCH (Speed + Kai shocked faces over the Netflix "Something went wrong" screen)

**Description**
```
{desc}
```

**Tags:** GTA 6, GTA VI, GTA 6 reaction, streamers react GTA 6, Kai Cenat GTA 6, IShowSpeed GTA 6, Jynxzi GTA 6, xQc GTA 6, Asmongold GTA 6, GTA 6 Netflix, GTA 6 extended look, Twitch crashed, GTA 6 pre order, GTA 6 price

**Upload:** schedule for 1:00 AM IST (2:30 PM New York). Video language English. Not made for kids.
**Build report:** {rep['duration'] / 60:.1f} min, commentary {rep['commentary_share'] * 100:.0f}% of the runtime, {rep['sfx']} sound effects.
**Risk:** Rockstar/Take-Two or Netflix may claim the gameplay seen in the small game window. If a claim blocks the video, tell me the timestamp and I'll cut it.
"""
open('/home/claude/gta6vid/out/metadata.md', 'w').write(md)
print('\n'.join(ch))
