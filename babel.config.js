module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // Custom inline plugin to strip 'import.meta' which causes SyntaxErrors in some browser environments
      // especially with cutting-edge/experimental versions of Expo/React.
      {
        visitor: {
          MetaProperty(path) {
            if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
              path.replaceWith({ type: 'ObjectExpression', properties: [] });
            }
          },
        },
      },
    ],
  };
};
