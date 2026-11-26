import base64, glob, os, sys, time, json
sys.path.insert(0, '/home/claude/flagwars'); from shoot import CSS
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-gpu', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 540, 'height': 1060}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS)); pg.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    pg.goto('file:///home/claude/flagwars/index.html'); pg.wait_for_timeout(1500)
    pg.click('#vo'); pg.wait_for_timeout(4000)
    print('button:', pg.inner_text('#vo'), '| clips decoded:', pg.evaluate('Object.keys(FW.VO.buf).length'), '| ctx:', pg.evaluate('FW.VO.ctx && FW.VO.ctx.state'))
    pg.evaluate('window.SAYLOG = []; FW.S.speed = 4')
    seen = {'shield': 0, 'revive': 0}
    for i in range(24):
        pg.wait_for_timeout(1000)
        st = pg.evaluate('({sh: Object.keys(FW.S.shielded).length, rv: Object.keys(FW.S.revived).length, r: FW.S.round, cap: FW.VO.cap})')
        seen['shield'] = max(seen['shield'], st['sh']); seen['revive'] = max(seen['revive'], st['rv'])
        if st['sh'] and not os.path.exists('/home/claude/flagwars/shots/shield.png'): pg.locator('#cv').screenshot(path='/home/claude/flagwars/shots/shield.png')
    print('rounds', st['r'], '| max shields in a round', seen['shield'], '| revives', seen['revive'])
    log = pg.evaluate('SAYLOG'); print(len(log), 'lines spoken, e.g.:'); [print('  ', ' + '.join(x['keys'])) for x in log[:8]]
    print('errors:', errs[:4]); b.close()
