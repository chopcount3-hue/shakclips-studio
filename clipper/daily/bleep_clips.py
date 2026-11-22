# bleeped copies of the long video's clips: strong swears/slurs (lib.SWEAR) -> muted + 1 kHz beep
import sys, os, subprocess; sys.path.insert(0, '/home/claude/studio/clipper/daily')
from lib import bleeps, WORK
FF = os.environ.get('FFMPEG', 'ffmpeg')
for n in sys.argv[1:]:
    src = f'{WORK}/clips/{n}.mp4'; dst = f'{WORK}/clips/{n}_bl.mp4'; b = bleeps(n, [[0, 9999]])
    if not b: subprocess.run(['cp', src, dst]); print(n, 'no swears'); continue
    en = '+'.join(f'between(t,{x},{y})' for x, y in b)
    af = f"[0:a]volume=0:enable='{en}'[m];sine=f=1000:sample_rate=48000,volume=0.18,volume=0:enable='not({en})'[s];[m][s]amix=inputs=2:duration=first:normalize=0[a]"
    subprocess.run([FF, '-v', 'error', '-y', '-i', src, '-filter_complex', af, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', dst], check=True)
    print(n, len(b), 'bleeps', b)
