// This is the main entry point for the config package
// It exports all the configurations

module.exports = {
  eslint: require('./eslint-preset'),
  typescript: {
    base: require('./typescript/base.json'),
    nextjs: require('./typescript/nextjs.json'),
    reactLibrary: require('./typescript/react-library.json'),
  },
};
