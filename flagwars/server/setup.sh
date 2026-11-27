#!/usr/bin/env bash
# Flag Wars live: one-paste setup for a fresh Ubuntu 24.04 server (run as root). Paste in Termius:
#   bash <(curl -fsSL https://raw.githubusercontent.com/chopcount3-hue/shakclips-studio/flag-wars/flagwars/server/setup.sh)
# Running it again updates the game and keeps the saved stream key.
set -euo pipefail
REPO=https://raw.githubusercontent.com/chopcount3-hue/shakclips-studio/flag-wars/flagwars
echo "== Flag Wars setup: installing, this takes 3-6 minutes =="
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq xvfb pulseaudio pulseaudio-utils ffmpeg python3-venv curl ca-certificates fonts-noto-color-emoji >/dev/null
if ! command -v google-chrome >/dev/null; then
  curl -fsSL -o /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  apt-get install -y -qq /tmp/chrome.deb >/dev/null
fi
id flag >/dev/null 2>&1 || useradd -m -s /bin/bash flag
mkdir -p /opt/flagwars
for f in dist/index.html server/run.sh; do curl -fsSL -o "/opt/flagwars/$(basename $f)" "$REPO/$f"; done
chmod +x /opt/flagwars/run.sh
[ -f /opt/flagwars/chat.json ] || echo '{"msgs": []}' > /opt/flagwars/chat.json
chown -R flag:flag /opt/flagwars
if [ ! -s /etc/flagwars.env ]; then
  echo
  echo "Paste your YouTube STREAM KEY, then press Enter."
  echo "(YouTube Studio > Create > Go live > Stream > Stream key. Nothing shows while you paste: that is normal.)"
  read -rs KEY < /dev/tty; echo
  [ -n "$KEY" ] || { echo "No key entered. Paste the setup command again."; exit 1; }
  umask 077
  printf 'STREAM_KEY=%s\nCHANNEL_ID=UCgOUG3BF0gV_RBMX8pb3ceQ\nFPS=30\nBITRATE=4500k\nPRESET=veryfast\n' "$KEY" > /etc/flagwars.env
fi
cat > /etc/systemd/system/flagwars.service <<'EOT'
[Unit]
Description=Flag Wars live stream
After=network-online.target
Wants=network-online.target
[Service]
User=flag
EnvironmentFile=/etc/flagwars.env
ExecStart=/opt/flagwars/run.sh
Restart=always
RestartSec=10
[Install]
WantedBy=multi-user.target
EOT
systemctl daemon-reload
systemctl enable -q flagwars
systemctl restart flagwars
sleep 25
if systemctl is-active -q flagwars; then
  echo "== DONE: Flag Wars is streaming. In 1-2 minutes it shows in YouTube Studio > Go live (press GO LIVE there if asked). =="
else
  echo "== Something failed. Copy the lines below and send them to Claude: =="; journalctl -u flagwars -n 30 --no-pager | sed 's/live2\/[^ ]*/live2\/KEY-HIDDEN/'
fi
echo "Stop: systemctl stop flagwars | Start: systemctl start flagwars | New stream key: rm /etc/flagwars.env, then paste the setup command again"
