const path = require('path')
const webpackMerge = require('webpack-merge')
const prodConfig = require('./webpack.prod')
const devConfig = require('./webpack.dev')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin')

const commonConfig = {
  entry: ['./src/index.js', './index.html'],
  output: {
    filename: 'js/main.[contenthash:10].js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.html$/,
            loader: 'html-withimg-loader',
          },
          {
            test: /\.(eot|woff2?|ttf|svg)$/,
            type: 'asset',
            generator: {
              publicPath: '../',
              filename: 'assets/fonts/[hash:8][ext][query]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      favicon: 'favicon.ico',
    }),
    new FriendlyErrorsPlugin({
      clearConsole: false,
    }),
  ],
  stats: 'errors-only',
}

module.exports = function (env) {
  const isProduction = env.production

  process.env.NODE_ENV = isProduction ? 'production' : 'development'

  const config = isProduction ? prodConfig : devConfig

  return webpackMerge.merge(commonConfig, config)
}
