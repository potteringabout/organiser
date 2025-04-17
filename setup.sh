#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$SCRIPT_DIR/web"

echo "📁 Navigating to: $WEB_DIR"
cd "$WEB_DIR" || { echo "❌ web directory not found"; exit 1; }

npm install --legacy-peer-deps

echo "✅ Setup complete. You can now run:"
echo "   cd $WEB_DIR && npm run dev"