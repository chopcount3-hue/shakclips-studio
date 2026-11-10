#!/usr/bin/env python3
"""Upload videos to YouTube with the official YouTube Data API v3 (backup to vidIQ).
usage: python yt_upload.py daily/upload.json
upload.json: [{"file": "daily/X.mp4", "title": "...", "description": "...", "tags": [...], "categoryId": "27",
               "privacyStatus": "public", "publishAt": "2026-11-11T22:00:00Z", "thumbnail": "daily/thumb.jpg"}]
Needs env YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN (OAuth client of the owner's own Google Cloud project).
Note: until that Google Cloud project passes YouTube's API audit, YouTube forces every API upload to PRIVATE.
"""
import json, os, sys, time
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

creds = Credentials(None, refresh_token=os.environ['YT_REFRESH_TOKEN'], token_uri='https://oauth2.googleapis.com/token',
                    client_id=os.environ['YT_CLIENT_ID'], client_secret=os.environ['YT_CLIENT_SECRET'],
                    scopes=['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'])
yt = build('youtube', 'v3', credentials=creds, cache_discovery=False)
items = json.load(open(sys.argv[1]))
done_file = os.path.join(os.path.dirname(sys.argv[1]), 'uploaded.json')
done = json.load(open(done_file)) if os.path.exists(done_file) else {}
for it in items:
    if it['file'] in done: print('already uploaded', it['file'], done[it['file']]); continue
    status = {'privacyStatus': it.get('privacyStatus', 'private'), 'selfDeclaredMadeForKids': False}
    if it.get('publishAt'): status.update(privacyStatus='private', publishAt=it['publishAt'])
    body = {'snippet': {'title': it['title'][:100], 'description': it.get('description', '')[:5000], 'tags': it.get('tags', []), 'categoryId': str(it.get('categoryId', '27'))}, 'status': status}
    req = yt.videos().insert(part='snippet,status', body=body, media_body=MediaFileUpload(it['file'], chunksize=8 * 1024 * 1024, resumable=True, mimetype='video/mp4'))
    resp = None
    while resp is None:
        try:
            st, resp = req.next_chunk()
            if st: print(f"{it['file']}: {int(st.progress() * 100)}%")
        except HttpError as e:
            if e.resp.status in (500, 502, 503, 504): time.sleep(5); continue
            raise
    vid = resp['id']; print('uploaded', it['file'], '->', f'https://youtu.be/{vid}', resp['status'])
    if it.get('thumbnail'):
        try: yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(it['thumbnail'])).execute(); print('thumbnail set')
        except HttpError as e: print('thumbnail refused (channel must be verified):', e)
    done[it['file']] = vid
json.dump(done, open(done_file, 'w'), indent=1)
