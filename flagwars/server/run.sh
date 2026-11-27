#!/usr/bin/env bash
# Draws the game in Chrome on a virtual 1080x1920 screen and streams picture + voice to YouTube.
# If Chrome or ffmpeg stops, this exits and systemd restarts everything.
set -u
cd /opt/flagwars
export DISPLAY=:99 XDG_RUNTIME_DIR=/tmp/flag-rt
mkdir -p "$XDG_RUNTIME_DIR" && chmod 700 "$XDG_RUNTIME_DIR"
FPS=${FPS:-30}; BITRATE=${BITRATE:-4500k}; PRESET=${PRESET:-veryfast}; OUT=${OUT:-rtmp://a.rtmp.youtube.com/live2/$STREAM_KEY}
trap 'kill $(jobs -p) 2>/dev/null; pulseaudio --kill 2>/dev/null' EXIT
rm -f /tmp/.X99-lock
Xvfb :99 -screen 0 1080x1920x24 -nolisten tcp >/dev/null 2>&1 &
pulseaudio --kill 2>/dev/null; sleep 1
pulseaudio --start --exit-idle-time=-1 --disallow-exit >/dev/null 2>&1
sleep 2
pactl load-module module-null-sink sink_name=game sink_properties=device.description=game >/dev/null
pactl set-default-sink game
python3 -m http.server 8080 --bind 127.0.0.1 >/dev/null 2>&1 &
sleep 1
google-chrome --no-first-run --no-default-browser-check --disable-infobars --noerrdialogs --disable-session-crashed-bubble \
  --disable-features=Translate,MediaRouter --autoplay-policy=no-user-gesture-required --kiosk --window-position=0,0 \
  --window-size=1080,1920 --force-device-scale-factor=1 --user-data-dir=/tmp/flag-chrome --disable-gpu \
  --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows \
  ${CHROME_EXTRA:-} "http://127.0.0.1:8080/index.html#stream" >/dev/null 2>&1 &
CHROME=$!
sleep 10
ffmpeg -hide_banner -loglevel warning \
  -thread_queue_size 1024 -f x11grab -video_size 1080x1920 -framerate "$FPS" -draw_mouse 0 -i :99 \
  -thread_queue_size 1024 -f pulse -i game.monitor \
  -c:v libx264 -preset "$PRESET" -b:v "$BITRATE" -maxrate "$BITRATE" -bufsize 9000k -g $((FPS * 2)) -keyint_min $((FPS * 2)) \
  -sc_threshold 0 -pix_fmt yuv420p -c:a aac -b:a 128k -ar 44100 ${DURATION:+-t $DURATION} \
  -f "${FORMAT:-flv}" "$OUT" &
FF=$!
wait -n "$CHROME" "$FF"
exit 1
