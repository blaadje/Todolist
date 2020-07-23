const path = require('path')

const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const config = require('../webpack.base')

const port = process.env.PORT || 8080
const publicPath = `http://localhost:${port}/dist`

const smp = new SpeedMeasurePlugin()

module.exports = smp.wrap({
  ...config,
  output: {
    publicPath,
    filename: 'index.js',
    pathinfo: false,
  },
  plugins: [...config.plugins, new ProgressBarPlugin()],
  target: 'electron-renderer',
  devtool: 'eval-cheap-source-map',
  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: true,
    overlay: true,
    stats: 'minimal',
    http2: false,
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.join(__dirname, 'dist'),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
  },
})
