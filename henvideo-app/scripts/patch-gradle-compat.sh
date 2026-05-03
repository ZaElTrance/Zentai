#!/bin/bash
# Patch Gradle compatibility issues in node_modules for Gradle 8.14 + AGP 8.11
# Fixes "Cannot query the value of this provider" caused by lazy Provider resolution.

set -e
cd "$(dirname "$0")/.."

echo "🔧 Patching Gradle compatibility..."

python3 << 'PYEOF'
import re, os

def patch_webview():
    wv = "node_modules/react-native-webview/android/build.gradle"
    if not os.path.exists(wv):
        print("  ⚠️  react-native-webview not found")
        return
    with open(wv, 'r') as f:
        content = f.read()
    # Remove old getExtOrIntegerDefault (any version) and replace with clean one
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

def patch_core_plugin():
    core = "node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle"
    if not os.path.exists(core):
        print("  ⚠️  ExpoModulesCorePlugin not found")
        return
    with open(core, 'r') as f:
        content = f.read()
    orig = 'project.rootProject.ext.has(prop) ? project.rootProject.ext.get(prop) : fallback'
    if orig in content:
        print("  ⚠️  ExpoModulesCorePlugin needs patching (unpatched original found)")
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

def patch_expo():
    expo = "node_modules/expo/android/build.gradle"
    if not os.path.exists(expo):
        print("  ⚠️  expo/android not found")
        return
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

patch_webview()
patch_core_plugin()
patch_expo()
print("✅ Gradle compatibility patching complete")
PYEOF
