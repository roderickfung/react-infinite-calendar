const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]',
          'sass-loader?sourceMap',
        ],
        include: path.resolve(__dirname, '../'),
      },
    ],
  },
};
