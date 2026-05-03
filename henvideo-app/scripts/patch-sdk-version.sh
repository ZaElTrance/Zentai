#!/bin/bash
TOML_FILE="node_modules/react-native/gradle/libs.versions.toml"
if [ -f "$TOML_FILE" ]; then
  sed -i 's/compileSdk = "36"/compileSdk = "35"/g' "$TOML_FILE"
  sed -i 's/targetSdk = "36"/targetSdk = "35"/g' "$TOML_FILE"
  sed -i 's/buildTools = "36.0.0"/buildTools = "35.0.0"/g' "$TOML_FILE"
  echo "✅ Patched version catalog to SDK 35"
else
  echo "⚠️  Version catalog not found"
fi
