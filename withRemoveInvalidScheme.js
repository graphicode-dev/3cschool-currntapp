const { withInfoPlist } = require('@expo/config-plugins');

module.exports = function withRemoveInvalidScheme(config) {
  return withInfoPlist(config, (config) => {
    if (config.modResults.CFBundleURLTypes) {
      config.modResults.CFBundleURLTypes = config.modResults.CFBundleURLTypes.map(urlType => {
        if (urlType.CFBundleURLSchemes) {
          // Remove the invalid scheme '3cschool'
          urlType.CFBundleURLSchemes = urlType.CFBundleURLSchemes.filter(
            scheme => scheme !== '3cschool'
          );
        }
        return urlType;
      });
    }
    return config;
  });
};
