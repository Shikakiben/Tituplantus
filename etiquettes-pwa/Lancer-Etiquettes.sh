#!/usr/bin/env bash
# Ouvre directement l'app dans le navigateur — AUCUN serveur nécessaire.
cd "$(dirname "$0")"

URL="file://$(pwd)/index.html"

# Ouvre avec le navigateur par défaut (ou Chrome/Chromium en mode app si dispo)
if command -v google-chrome &>/dev/null; then
    google-chrome --app="$URL" >/dev/null 2>&1 &
elif command -v chromium &>/dev/null; then
    chromium --app="$URL" >/dev/null 2>&1 &
elif command -v chromium-browser &>/dev/null; then
    chromium-browser --app="$URL" >/dev/null 2>&1 &
else
    xdg-open "$URL" >/dev/null 2>&1
fi
