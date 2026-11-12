import json
T = json.load(open('voice/timing.json'))
S = lambda i: T['times'][i - 1][0]
def mmss(s): s = int(max(0, s - 0.06)); return f"{s // 60}:{s % 60:02d}"
chap = [(0, "A flash older than the Sun"), (S(13), "The flash"), (S(29), "The suspect: a magnetar"), (S(43), "A 10-billion-year journey"),
        (S(67), "The catch"), (S(81), "The home galaxy"), (S(94), "Why it matters")]
chapters = '\n'.join(f"{'0:00' if i == 0 else mmss(t)} {n}" for i, (t, n) in enumerate(chap))
D = f"""On 4 March 2024, the MeerKAT radio telescope in South Africa caught a flash of radio waves that lasted only milliseconds. It had been travelling for more than 10 billion years. It left its home galaxy when the universe was about 3 billion years old, before the Sun and the Earth existed.

FRB 20240304B is the most distant fast radio burst ever traced back to its home galaxy, more than doubling the previous record. The galaxy was too faint for the biggest telescopes on the ground, so the James Webb Space Telescope found it. We follow the flash from its birth to the dish that caught it.

💬 What do you think made it: a magnetar, or something nobody has thought of yet? Tell me in the comments.

⏱️ CHAPTERS
{chapters}

Note: the magnetar origin is the team's favoured explanation, not a proven one. The energy (~10^41 erg) is the team's estimate; "many months of sunlight" compares it with the Sun's output (about 3.8 × 10^33 erg per second). Galaxy sizes on screen are illustrative.

📚 RESEARCH & SOURCES
• Caleb, Nanayakkara et al., "A fast radio burst from the first 3 billion years of the Universe" (preprint of the Science paper): https://arxiv.org/abs/2508.01648
• University of Sydney news release (13 Oct 2026): https://www.sydney.edu.au/news-opinion/news/2026/10/13/sydney-astronomers-pinpoint-the-most-distant-fast-radio-burst-ev.html
• Space.com: https://www.space.com/astronomy/galaxies/james-webb-space-telescope-helps-detect-the-most-distant-fast-radio-burst-ever-seen-and-scientists-are-surprised-by-its-source
• ScienceAlert: https://www.sciencealert.com/a-mysterious-signal-reached-us-from-when-the-universe-was-just-3-billion-years-old-its-home-galaxy-surprised-astronomers
• Sci.News (Science paper, published online 8 Oct 2026, doi:10.1126/science.adz2675): https://www.sci.news/astronomy/most-distant-fast-radio-burst-15124.html
• Lorimer et al. 2007, "A Bright Millisecond Radio Burst of Extragalactic Origin", Science 318, 777 (first FRB)
• SARAO, MeerKAT: https://www.sarao.ac.za/science/meerkat/
• SKA Observatory: https://www.skao.int/en

🎨 Original animation by Shak Clips. No third-party footage or photos. Narration: Chatterbox Turbo (Resemble AI, MIT licence).

#space #astronomy #fastradioburst #jameswebb #jwst #magnetar #meerkat #science #universe #spacediscovery #frb #cosmology
"""
tags = ["fast radio burst", "most distant fast radio burst", "FRB 20240304B", "James Webb Space Telescope", "JWST discovery 2026", "magnetar",
        "MeerKAT", "radio signal from space", "10 billion year old signal", "early universe", "missing matter universe", "astronomy",
        "space discovery 2026", "space documentary", "Square Kilometre Array"]
title = "This Flash Travelled 10 Billion Years to Reach Earth"
SD = """A radio flash a few milliseconds long reached Earth in 2024. It had been travelling for more than 10 billion years, longer than the Sun has existed.
Full story: on the Shak Clips channel
#space #astronomy #jwst #fastradioburst #shorts"""
stitle = "This Signal Is Older Than the Sun #Shorts"
up = [{"file": "daily/ShakClips_Flash_10B_Years.mp4", "title": title, "description": D, "tags": tags, "categoryId": 27,
       "publishAt": "2026-11-12T22:00:00Z", "thumbnail": "daily/ShakClips_Flash_10B_thumb.jpg"},
      {"file": "daily/ShakClips_Flash_10B_Years_SHORT.mp4", "title": stitle, "description": SD, "tags": tags[:8], "categoryId": 27,
       "publishAt": "2026-11-12T22:00:00Z"}]
json.dump(up, open('upload.json', 'w'), indent=1, ensure_ascii=False)
open('description.txt', 'w').write(D)
print(len(title), len(stitle), len(tags)); print(chapters)
