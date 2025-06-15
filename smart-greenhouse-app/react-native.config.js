const path = require('path');

module.exports = {
  dependencies: {
    '@react-native-async-storage/async-storage': {
      root: path.join(__dirname, 'node_modules', '@react-native-async-storage', 'async-storage'),
    },
  },
};