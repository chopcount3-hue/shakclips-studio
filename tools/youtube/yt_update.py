#!/usr/bin/env python3
"""Change thumbnails / titles / descriptions / tags of EXISTING videos on the channel (free, YouTube Data API v3).
usage: python yt_update.py daily/updates.json
updates.json: [{"videoId": "CLs6YAeN_Rw", "thumbnail": "daily/thumb.jpg", "title": "...", "description": "...", "tags": [...]}]
Every field except videoId is optional. Needs env YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.
"""
import json, os, sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

creds = Credentials(None, refresh_token=os.environ['YT_REFRESH_TOKEN'], token_uri='https://oauth2.googleapis.com/token',
                    client_id=os.environ['YT_CLIENT_ID'], client_secret=os.environ['YT_CLIENT_SECRET'])
yt = build('youtube', 'v3', credentials=creds, cache_discovery=False)
for u in json.load(open(sys.argv[1])):
    vid = u['videoId']
    if u.get('thumbnail'):
        yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(u['thumbnail'])).execute(); print(vid, 'thumbnail set')
    if any(k in u for k in ('title', 'description', 'tags')):
        cur = yt.videos().list(part='snippet', id=vid).execute()['items'][0]['snippet']
        sn = {'title': u.get('title', cur['title']), 'description': u.get('description', cur.get('description', '')),
              'tags': u.get('tags', cur.get('tags', [])), 'categoryId': cur['categoryId']}
        yt.videos().update(part='snippet', body={'id': vid, 'snippet': sn}).execute(); print(vid, 'metadata updated')
