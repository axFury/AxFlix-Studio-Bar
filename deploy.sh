#!/bin/bash
# AxFlix Plugin - Build & Deploy Script
# Usage: ./deploy.sh

set -e

PLUGIN_DIR="/var/lib/jellyfin/plugins/AxFlix Studios_1.0.0.0"
BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/AxFlix.Plugin"

# Uncomment and adjust if 'dotnet' is not in your global PATH
# export PATH="$HOME/.dotnet:$PATH"

echo "🔨 Building AxFlix Plugin..."
cd "$BUILD_DIR"
dotnet build -c Release 2>&1 | tail -5

echo "📦 Deploying to Jellyfin..."
sudo mkdir -p "$PLUGIN_DIR"

sudo bash -c "cat > '$PLUGIN_DIR/meta.json' << 'XEOF'
{
  \"category\": \"General\",
  \"changelog\": \"Update with studio selector\",
  \"description\": \"Affiche une ligne de studios avec logos et vidéos d intro au survol\",
  \"guid\": \"a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d\",
  \"name\": \"AxFlix Studios\",
  \"overview\": \"Studio Showcase\",
  \"owner\": \"AxFlix\",
  \"targetAbi\": \"10.11.0.0\",
  \"timestamp\": \"2026-04-09T15:00:00.0000000Z\",
  \"version\": \"1.0.0.0\",
  \"status\": \"Active\",
  \"autoUpdate\": false,
  \"assemblies\": []
}
XEOF"

sudo cp "$BUILD_DIR/bin/Release/net9.0/AxFlix.Plugin.dll" "$PLUGIN_DIR/"
sudo chown -R jellyfin:jellyfin "$PLUGIN_DIR"

echo "🔄 Restarting Jellyfin..."
sudo systemctl restart jellyfin

echo "⏳ Waiting for Jellyfin to start..."
sleep 5
curl -s http://localhost:8096/System/Info/Public > /dev/null && echo "✅ Jellyfin is up!" || echo "⚠️ Jellyfin not ready yet, wait a moment"

echo ""
echo "🎬 AxFlix Plugin deployed! Open your Jellyfin in the browser."
echo "   Config page: http://localhost:8096/web/#/configurationpage?name=axflixstudios"
