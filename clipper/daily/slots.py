#!/usr/bin/env python3
"""Today's US posting slots (America/New_York) as UTC ISO times for vidIQ publishAt. Slots already in the past (or less
than 40 min away) roll to tomorrow, so a late run still schedules everything in the future.
usage: python3 slots.py [YYYY-MM-DD]     -> prints JSON {"shorts": [...2], "long": "..."}"""
import datetime as dt, json, sys
from zoneinfo import ZoneInfo
ET, UTC = ZoneInfo('America/New_York'), dt.timezone.utc
SHORTS = ['11:00', '18:00']   # ET; US late morning and evening peaks (vidIQ free plan: 3 uploads/day = 2 Shorts + 1 long)
LONG = '15:00'                                           # ET; indexed and pushed before the US evening
day = dt.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else dt.datetime.now(ET).date()
now = dt.datetime.now(UTC) + dt.timedelta(minutes=40)
def at(hm):
    h, m = map(int, hm.split(':')); t = dt.datetime(day.year, day.month, day.day, h, m, tzinfo=ET).astimezone(UTC)
    while t < now: t += dt.timedelta(days=1)
    return t.strftime('%Y-%m-%dT%H:%M:%SZ')
print(json.dumps({'shorts': [at(s) for s in SHORTS], 'long': at(LONG), 'et_labels': SHORTS + [LONG]}, indent=1))
