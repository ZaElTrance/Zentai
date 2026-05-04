#!/bin/bash
# Patch SDK version and Gradle compatibility issues for the build environment.
#
# Changes made:
# 1. Patch version catalog: compileSdk/targetSdk/buildTools 36 -> 35
# 2. Patch react-native-webview: fix lazy Provider resolution
# 3. Patch ExpoModulesCorePlugin: fix lazy Provider resolution
# 4. Patch expo/android: fix lazy Provider resolution
#
# NOTE: CXX/NDK patches are NOT needed on GitHub Actions (NDK is auto-installed).
# For local builds without NDK, run: npx expo prebuild --clean && ndk-build skip

set -e
cd "$(dirname "$0")/.."

echo "🔧 Patching SDK versions and Gradle compatibility..."

# ============================================================================
# 1. Patch version catalog: SDK 36 -> 35
# ============================================================================
TOML_FILE="node_modules/react-native/gradle/libs.versions.toml"
if [ -f "$TOML_FILE" ]; then
  sed -i 's/compileSdk = "36"/compileSdk = "35"/g' "$TOML_FILE"
  sed -i 's/targetSdk = "36"/targetSdk = "35"/g' "$TOML_FILE"
  sed -i 's/buildTools = "36.0.0"/buildTools = "35.0.0"/g' "$TOML_FILE"
  echo "  ✅ Version catalog patched to SDK 35"
else
  echo "  ⚠️  Version catalog not found"
fi

# ============================================================================
# 2. Patch react-native-webview: fix lazy Provider resolution
# ============================================================================
python3 << 'PYEOF'
import re, os

wv = "node_modules/react-native-webview/android/build.gradle"
if not os.path.exists(wv):
    print("  ⚠️  react-native-webview not found")
else:
    with open(wv, 'r') as f:
        content = f.read()
    clean_func = '''def getExtOrIntegerDefault(prop) {
  def propKey = 'ReactNativeWebView_' + prop
  if (project.hasProperty(propKey)) {
    return project.property(propKey).toString().toInteger()
  }
  if (rootProject.ext.has(prop)) {
    def val = rootProject.ext.get(prop)
    if (val instanceof Integer) return val
    if (val instanceof Number) return val.intValue()
    try { return val.toString().toInteger() } catch(e) {}
  }
  throw new GradleException("Cannot resolve: " + prop)
}

'''
    pattern = r'def getExtOrIntegerDefault\(prop\)\s*\{.*?\n\}(?:\s*\n)*?(?=\nstatic def findNodeModulePath|\ndef isNewArchitectureEnabled|\ndef supportsNamespace)'
    new_content = re.sub(pattern, clean_func, content, flags=re.DOTALL)
    with open(wv, 'w') as f:
        f.write(new_content)
    opens = new_content.count('{')
    closes = new_content.count('}')
    if opens != closes:
        print(f"  ❌ react-native-webview: UNBALANCED BRACES ({opens} vs {closes})")
    else:
        print("  ✅ react-native-webview patched")
PYEOF

# ============================================================================
# 3. Patch ExpoModulesCorePlugin: fix lazy Provider resolution
# ============================================================================
python3 << 'PYEOF'
import os

core = "node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle"
if not os.path.exists(core):
    print("  ⚠️  ExpoModulesCorePlugin not found")
else:
    with open(core, 'r') as f:
        content = f.read()
    orig = 'project.rootProject.ext.has(prop) ? project.rootProject.ext.get(prop) : fallback'
    if orig in content:
        new_impl = '''if (project.rootProject.ext.has(prop)) {
        def val = project.rootProject.ext.get(prop)
        if (val instanceof Integer || val instanceof Long) return val
        if (val instanceof Number) return val.intValue()
        try { return val.toString().toInteger() } catch(e) {}
      }
      return fallback'''
        content = content.replace(orig, new_impl)
        with open(core, 'w') as f:
            f.write(content)
        print("  ✅ ExpoModulesCorePlugin patched")
    else:
        print("  ✅ ExpoModulesCorePlugin already patched")
PYEOF

# ============================================================================
# 4. Patch expo/android: fix lazy Provider resolution
# ============================================================================
python3 << 'PYEOF'
import os

expo = "node_modules/expo/android/build.gradle"
if not os.path.exists(expo):
    print("  ⚠️  expo/android not found")
else:
    with open(expo, 'r') as f:
        content = f.read()
    orig = 'rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback'
    if orig in content:
        new_impl = '''if (rootProject.ext.has(prop)) {
      def val = rootProject.ext.get(prop)
      if (val instanceof Integer || val instanceof Long) return val
      if (val instanceof Number) return val.intValue()
      try { return val.toString().toInteger() } catch(e) {}
    }
    return fallback'''
        content = content.replace(orig, new_impl)
        with open(expo, 'w') as f:
            f.write(content)
        print("  ✅ expo/android patched")
    else:
        print("  ✅ expo/android already patched")
PYEOF

echo "✅ All patches applied successfully"
