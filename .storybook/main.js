const path = require('path');
const postcssOptions = require('../postcss.config')

module.exports = {
  addons: ['@storybook/addon-postcss'],
  stories: [
    '../src/.stories/*.story.js'
  ],
  core: {
    builder: "webpack5"
  },
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need
    config.module.rules.push(
      {
        test: /\.(scss|sass|css)$/,
        use: [
          'style-loader',
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: {
                localIdentName: "[name]__[local]"
              }
            },
          },
          // {
          //   loader: 'postcss-loader',
          //   options: {
          //     postcssOptions
          //   },
          // },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
        include: path.resolve(__dirname, '../'),
      }
    );

    // Return the altered config
    return config;
  },
}