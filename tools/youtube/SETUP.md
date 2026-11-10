# YouTube automation through GitHub Actions (YouTube Data API)

Two workflows:
- **YouTube update**: free thumbnail, title and description changes for videos already on the channel. It works right after setup, with no audit needed.
- **YouTube upload (backup)**: uploads new videos. YouTube keeps API uploads private until Google audits the project, so vidIQ stays the main uploader.

vidIQ is the main uploader. This is a backup that needs no vidIQ. It's free (10,000 API units a day; one upload uses about 1,600).

**Important:** YouTube makes every video uploaded through a new Google Cloud project **private** until the project passes YouTube's API audit. After setup, apply for the audit (form: https://support.google.com/youtube/contact/yt_api_form). Until then, uploads made this way have to be set to public by hand in YouTube Studio.

## One-time setup (a computer is easiest, about 20 min)
1. Go to https://console.cloud.google.com, create a project called "shakclips-uploader", and enable **YouTube Data API v3**.
2. Set up the OAuth consent screen: choose External, add yourself as a test user, then publish the app.
3. Go to Credentials → Create credentials → OAuth client ID → **Web application**. Add the redirect URI `https://developers.google.com/oauthplayground`. Copy the Client ID and Client secret.
4. Open https://developers.google.com/oauthplayground:
   - Click ⚙️ → "Use your own OAuth credentials" and paste the ID and secret.
   - In Step 1, enter the scopes `https://www.googleapis.com/auth/youtube`, then click Authorize and sign in with the channel's Google account.
   - Click "Exchange authorization code for tokens" and copy the **refresh token**.
5. In GitHub, open the shakclips-studio repo → Settings → Secrets and variables → Actions:
   - Add the secrets `YT_CLIENT_ID`, `YT_CLIENT_SECRET` and `YT_REFRESH_TOKEN`.
   - Under Variables, add `UPLOAD_VIA_ACTIONS` = `true` **only if you want this instead of vidIQ**. With both on, every video would upload twice.

The daily run writes `daily/upload.json` on the `media` branch, and the workflow uploads whatever is listed there.
