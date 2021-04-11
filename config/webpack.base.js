const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  resolve: {
    symlinks: false,
    cacheWithContext: false,
    extensions: ['.vue', '.js'],
    alias: {
      '@assets': path.resolve(__dirname, '../src/assets/'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@core': path.resolve(__dirname, '../src/core'),
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'initial',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        include: path.resolve(__dirname, '../src/renderer/images'),
        use: {
          loader: 'svgo-loader',
          options: {
            externalConfig: 'svgo-config.yml',
          },
        },
      },
      {
        test: /\.svg$/,
        issuer: /\.(vue|js|ts|svg)$/,
        use: [
          // This loader compiles .svg file to .vue file
          // So we use `vue-loader` after it
          'vue-loader',
          'vue-svg-loader',
        ],
      },
      {
        test: /\.(js)$/,
        include: path.resolve(__dirname, '../src'),
        use: {
          loader: 'babel-loader',
          query: {
            compact: true,
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]_[hash:base64:5]',
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
        },
      },
    ],
  },
}
