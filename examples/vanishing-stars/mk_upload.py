import json
T = json.load(open('voice/timing.json'))
S = lambda i: T['times'][i - 1][0]
def mmss(s): s = int(max(0, s - 0.06)); return f"{s // 60}:{s % 60:02d}"
DATE = "2026-11-18"
chap = [(0, "A star that didn't explode"), (S(13), "How big stars die"), (S(29), "The star that vanished in Andromeda"),
        (S(51), "Listening to black holes"), (S(64), "The peak and the gap"), (S(85), "Inside a failed supernova"),
        (S(106), "What we don't know yet")]
chapters = '\n'.join(f"{'0:00' if i == 0 else mmss(t)} {n}" for i, (t, n) in enumerate(chap))
D = f"""A giant star runs out of fuel. It should explode as a supernova, brighter than its whole galaxy. Instead, it just goes dark. In the Andromeda Galaxy, astronomers watched a star do almost exactly this: it faded to about one ten-thousandth of its brightness and left only a faint infrared glow.

Now a new study of about 250 black hole collisions picked up by gravitational-wave detectors finds that most merging black holes weigh about 10 times the Sun, and almost none weigh 12 to 16. The team's idea: some stars of around 12 to 14 Suns fail to explode and collapse straight into black holes. We go inside that collapse, and look at what is still unproven.

💬 Do you think most big stars explode, or do more of them just disappear? Tell me in the comments.

⏱️ CHAPTERS
{chapters}

Note: failed supernovas have not been confirmed directly. The authors say their data are consistent with a mass gap but do not yet require one. The census chart and the spin curves on screen show the shape of the result in simplified form, not the paper's exact data. N6946-BH1 may instead have been a stellar merger.

📚 RESEARCH & SOURCES
• Legred, Golomb & Chatziioannou, "Low-mass failed supernovae and the 10 M☉ peak in the merging black hole mass distribution", Physical Review D 114, 103023 (10 Nov 2026): https://journals.aps.org/prd/abstract/10.1103/mnzq-w1b5 (preprint: https://arxiv.org/abs/2604.01420)
• APS Physics synopsis: https://physics.aps.org/articles/v19/s149
• Caltech news release: https://www.caltech.edu/about/news/astronomers-find-hints-of-star-population-that-failed-to-explode (also https://www.eurekalert.org/news-releases/1151330)
• Space.com: https://www.space.com/astronomy/black-holes/astronomers-discover-rare-black-holes-that-formed-when-stars-failed-to-go-supernova
• De et al., "Disappearance of a massive star in the Andromeda Galaxy due to formation of a black hole", Science (Feb 2026): https://arxiv.org/abs/2410.14778
• Simons Foundation: https://www.simonsfoundation.org/2026/02/12/caught-in-the-act-astronomers-watch-a-vanishing-star-turn-into-a-black-hole/
• ScienceDaily: https://sciencedaily.com/releases/2026/02/260213223855.htm
• NASA Hubble, N6946-BH1: https://science.nasa.gov/missions/hubble/collapsing-star-gives-birth-to-a-black-hole/
• Beasor et al., JWST observations of N6946-BH1: https://arxiv.org/abs/2309.16121
• LIGO, GW150914: https://www.ligo.caltech.edu/page/press-release-gw150914
• MIT News, first detection: https://news.mit.edu/2016/ligo-first-detection-gravitational-waves-0211
• Space.com, what is a supernova: https://www.space.com/6638-supernova.html

🎨 Original animation by Shak Clips. No third-party footage or photos. Narration: Chatterbox Turbo (Resemble AI, MIT licence).

#space #astronomy #blackhole #supernova #gravitationalwaves #ligo #andromeda #science #universe #spacediscovery #astrophysics #stars
"""
tags = ["failed supernova", "star vanished without exploding", "black hole mass gap", "10 solar mass black holes", "how black holes form",
        "gravitational waves", "LIGO Virgo KAGRA", "M31-2014-DS1", "Andromeda vanishing star", "N6946-BH1", "black hole merger",
        "supernova explained", "space discovery 2026", "astronomy", "space documentary"]
title = "The Stars That Vanish Without Exploding"
alts = ["Why Most Black Holes Weigh About 10 Suns", "This Star Disappeared Without a Supernova"]
SD = """A giant star ran out of fuel and should have exploded. Instead, it just went dark. A new study hints this may happen far more often than we thought.
Full story: on the Shak Clips channel
#space #blackhole #supernova #astronomy #shorts"""
stitle = "This Star Didn't Explode. It Just Vanished. #Shorts"
up = [{"file": "daily/ShakClips_Vanishing_Stars.mp4", "title": title, "description": D, "tags": tags, "categoryId": 27,
       "publishAt": DATE + "T22:00:00Z", "thumbnail": "daily/ShakClips_Vanishing_Stars_thumb.jpg"},
      {"file": "daily/ShakClips_Vanishing_Stars_SHORT.mp4", "title": stitle, "description": SD, "tags": tags[:8], "categoryId": 27,
       "publishAt": DATE + "T22:00:00Z"}]
json.dump(up, open('upload.json', 'w'), indent=1, ensure_ascii=False)
open('description.txt', 'w').write(D)
json.dump({"alts": alts}, open('title_alts.json', 'w'))
print(len(title), len(stitle), len(tags), len(D)); print(chapters)
