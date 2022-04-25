const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'jsx'],
  transform: {
    '\\.js$': 'babel-jest',
    '\\.tsx?$': 'babel-jest',
  },
};
