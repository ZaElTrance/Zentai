#!/bin/bash
# Patch SDK version from 36 to 35 for compatibility with installed Android SDK.
# This is called from both postinstall and the CI/CD workflow.

set -e
cd "$(dirname "$0")/.."

echo "🔧 Patching SDK version (36 → 35)..."

TOML_FILE="node_modules/react-native/gradle/libs.versions.toml"
if [ -f "$TOML_FILE" ]; then
  sed -i 's/compileSdk = "36"/compileSdk = "35"/g' "$TOML_FILE"
  sed -i 's/targetSdk = "36"/targetSdk = "35"/g' "$TOML_FILE"
  sed -i 's/buildTools = "36.0.0"/buildTools = "35.0.0"/g' "$TOML_FILE"
  echo "✅ Patched version catalog to SDK 35"
else
  echo "⚠️  Version catalog not found at $TOML_FILE"
fi
