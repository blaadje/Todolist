const path = require('path')

const Dotenv = require('dotenv-webpack')

const { dependencies } = require('../../package.json')
const config = require('../webpack.base')

const rendererConfig = {
  ...config,
  mode: 'production',
  plugins: [
    ...config.plugins,
    new Dotenv({
      systemvars: true,
    }),
  ],
  entry: {
    renderer: path.join(__dirname, '../../src/index.js'),
  },
  devtool: 'hidden-source-map',
  externals: [...Object.keys(dependencies || {})],
  node: {
    __dirname: false,
    __filename: false,
  },
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../../dist/electron'),
  },
  target: 'electron-renderer',
}

module.exports = rendererConfig
