#!/bin/bash
# usage: ./new_project.sh <slug>   -> /home/claude/work/<slug> with the engine copied in (write script.json, shots.js there)
set -e; STUDIO=$(cd "$(dirname "$0")" && pwd); P=/home/claude/work/${1:?slug}
mkdir -p "$P" && cp "$STUDIO"/engine/* "$P"/ && mkdir -p "$P"/voice "$P"/thumb && cp -r "$STUDIO"/thumb/* "$P"/thumb/
echo "$P"
