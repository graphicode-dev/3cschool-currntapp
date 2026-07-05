const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withDisableStrictConcurrency = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf-8');

      if (!contents.includes("SWIFT_STRICT_CONCURRENCY")) {
        const replacement = `post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
    end
  end`;
        contents = contents.replace("post_install do |installer|", replacement);
        fs.writeFileSync(podfilePath, contents);
      }
      return config;
    },
  ]);
};

module.exports = withDisableStrictConcurrency;
