import json
T = json.load(open('voice/timing.json'))
S = lambda i: T['times'][i - 1][0]
def mmss(s): s = int(max(0, s - 0.06)); return f"{s // 60}:{s % 60:02d}"
DATE = "2026-11-19"
chap = [(0, "A mountain that spins every 4 minutes"), (S(12), "The asteroid speed limit"), (S(30), "The camera that caught it"),
        (S(52), "How big is 2.5 km?"), (S(63), "What if you stood on it?"), (S(83), "What holds it together"),
        (S(96), "Who spun it up?"), (S(111), "What we don't know yet")]
chapters = '\n'.join(f"{'0:00' if i == 0 else mmss(t)} {n}" for i, (t, n) in enumerate(chap))
D = f"""Somewhere in the solar system there is a rock about 2.5 kilometres across that turns all the way around in just 4.18 minutes. Asteroid 491384, found in early data from the Vera C. Rubin Observatory, is the largest ultra-fast rotator known so far, spinning more than 30 times faster than the "speed limit" that almost every big asteroid obeys.

Most asteroids that size are rubble piles that would fly apart at that speed. So what is holding this one together, and what would happen to you if you tried to stand on it? We build it to scale, land on it, and look at the clues: the strength it needs, the sunlight that may have spun it up, and what is still unconfirmed.

💬 If you could land on it, would you go for the poles, or try to ride the equator? Tell me in the comments.

⏱️ CHAPTERS
{chapters}

Notes: the study is an arXiv preprint (October 2026) that has not finished peer review. The size (about 2.1 to 2.9 km, nominal 2.53 km) is estimated from brightness and an assumed surface darkness. The surface speed ("around 100 km/h") and "hundreds of times stronger than gravity" are my own rough calculations from the published size and spin period, assuming a typical asteroid density. The dots on the size-vs-spin chart and the light curve are illustrative, not the paper's data. The asteroid art is an original illustration; no image of 491384's real shape exists.

📚 RESEARCH & SOURCES
• Vavilov, Eggl & Greenstreet, "Discovery of 2 km ultra-fast rotating asteroid in Rubin DP2 catalog via varying Fourier order method" (arXiv preprint, Oct 2026): https://arxiv.org/abs/2610.07584
• Phys.org: https://phys.org/news/2026-10-vera-rubin-observatory-largest-ultra.html
• The Daily Galaxy: https://dailygalaxy.com/2026/10/record-breaking-asteroid-spinning/
• Starlust: https://starlust.org/astronomers-discover-fastest-spinning-asteroid-making-one-rotation-within-5-minutes-heres-why-its-unusual/
• Indian Defence Review: https://indiandefencereview.com/a-giant-asteroid-spinning-30-times-faster/
• Techno-Science: https://www.techno-science.net/en/news/asteroid-rotation-five-minutes-extreme-29593
• University of Washington, 2025 MN45: https://www.washington.edu/news/2026/01/22/fastest-spinning-asteroid-rubin-observatory-dirac-institute/
• Rubin Observatory, 2025 MN45: https://rubinobservatory.org/news/rubin-record-breaking-asteroid-pre-survey
• Rubin LSST Camera: https://rubinobservatory.org/explore/how-rubin-works/technology/camera and SLAC: https://www6.slac.stanford.edu/news/2024-04-03-slac-completes-construction-largest-digital-camera-ever-built-astronomy
• NASA, Bennu's surface like a ball pit: https://www.nasa.gov/missions/surprise-again-asteroid-bennu-reveals-its-surface-is-like-a-plastic-ball-pit
• University of Arizona, OSIRIS-REx sampling: https://news.arizona.edu/story/osiris-rex-scientists-taking-asteroid-sample-was-punching-ball-pit
• NASA, Didymos: https://science.nasa.gov/solar-system/asteroids/didymos/
• Space.com, how Dimorphos formed: https://space.com/nasa-dart-mission-asteroid-dimorphos-formation
• ESO, sunlight spins up asteroids (YORP): https://www.eso.org/public/news/eso0711/
• The Planetary Society, the YORP effect and Bennu: https://www.planetary.org/articles/20141211-the-yorp-effect-and-bennu
• CTBUH, Burj Khalifa height: https://www.skyscrapercenter.com/building/burj-khalifa/3

🎨 Original animation by Shak Clips. No third-party footage or photos. Narration: Chatterbox Turbo (Resemble AI, MIT licence).

#space #asteroid #astronomy #science #rubinobservatory #solarsystem #universe #spacediscovery #whatif #planetaryscience #physics #nasa
"""
tags = ["fastest spinning asteroid", "asteroid 491384", "ultra-fast rotating asteroid", "Rubin Observatory asteroid", "spin barrier",
        "rubble pile asteroid", "what if you stood on an asteroid", "2025 MN45", "YORP effect", "Bennu", "Didymos Dimorphos",
        "asteroid explained", "space discovery 2026", "astronomy", "space documentary"]
title = "This Asteroid Spins Every 4 Minutes. It Should Have Torn Apart."
alts = ["What If You Stood on an Asteroid That Spins Every 4 Minutes?", "The 2.5 km Asteroid That Breaks the Speed Limit"]
SD = """A rock 2.5 kilometres wide turns all the way around in about four minutes. Big asteroids aren't supposed to survive that.
Full story: on the Shak Clips channel
#space #asteroid #astronomy #shorts"""
stitle = "A Mountain-Sized Rock That Spins Every 4 Minutes #Shorts"
up = [{"file": "daily/ShakClips_Spinning_Mountain.mp4", "title": title, "description": D, "tags": tags, "categoryId": 27,
       "publishAt": DATE + "T22:00:00Z", "thumbnail": "daily/ShakClips_Spinning_Mountain_thumb.jpg"},
      {"file": "daily/ShakClips_Spinning_Mountain_SHORT.mp4", "title": stitle, "description": SD, "tags": tags[:8], "categoryId": 27,
       "publishAt": DATE + "T22:00:00Z"}]
json.dump(up, open('upload.json', 'w'), indent=1, ensure_ascii=False)
open('description.txt', 'w').write(D)
json.dump({"alts": alts}, open('title_alts.json', 'w'))
print(len(title), len(stitle), len(tags), len(D)); print(chapters)
