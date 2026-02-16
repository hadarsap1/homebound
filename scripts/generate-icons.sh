#!/bin/bash
# Generate placeholder app icons using a simple SVG
# Requires: npx or any SVG-to-PNG converter
# For now, creates placeholder SVGs that can be converted manually

ICONS_DIR="public/icons"
mkdir -p "$ICONS_DIR"

# Create a simple SVG icon
cat > "$ICONS_DIR/icon.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#0F172A"/>
  <path d="M256 120L120 220V380C120 391 129 400 140 400H220V300H292V400H372C383 400 392 391 392 380V220L256 120Z" fill="#F59E0B"/>
  <circle cx="256" cy="250" r="30" fill="#0F172A"/>
</svg>
EOF

echo "SVG icon created at $ICONS_DIR/icon.svg"
echo "Convert to PNG using an online tool or:"
echo "  npx sharp-cli -i $ICONS_DIR/icon.svg -o $ICONS_DIR/icon-192x192.png resize 192 192"
echo "  npx sharp-cli -i $ICONS_DIR/icon.svg -o $ICONS_DIR/icon-512x512.png resize 512 512"
