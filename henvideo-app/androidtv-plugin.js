const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidTV(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;

    // Add leanback feature
    manifest.manifest['uses-feature'] = manifest.manifest['uses-feature'] || [];
    manifest.manifest['uses-feature'].push({
      $: {
        'android:name': 'android.hardware.type.tv',
        'android:required': 'false'
      }
    });

    // Add touch screen not required
    manifest.manifest['uses-feature'].push({
      $: {
        'android:name': 'android.hardware.touchscreen',
        'android:required': 'false'
      }
    });

    // Add leanback to application
    const application = manifest.manifest.application[0];
    application.$['android:banner'] = '@mipmap/ic_launcher';

    // Modify main activity intent filters
    const activity = application.activity[0];
    
    // Add leanback launcher intent filter
    activity['intent-filter'] = activity['intent-filter'] || [];
    activity['intent-filter'].push({
      action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
      category: [
        { $: { 'android:name': 'android.intent.category.LAUNCHER' } },
        { $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } }
      ]
    });

    return config;
  });
};
