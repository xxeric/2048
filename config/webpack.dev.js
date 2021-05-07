module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
  target: 'web',
  devServer: {
    contentBase: './dist',
    compress: true,
    inline: true,
    hot: true,
    quiet: true,
    clientLogLevel: 'none',
  },
  devtool: 'eval-source-map',
}
