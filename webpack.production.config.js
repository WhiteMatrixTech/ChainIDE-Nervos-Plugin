const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: ['./src/extension.ts'],
  stats: { children: true },

  output: {
    path: path.resolve(__dirname, 'out'),
    libraryTarget: 'system',
    publicPath: '',
    clean: true
  },

  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      assert: 'assert/',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      process: 'process/browser',
      fs: 'fs'
    })
  ],

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        include: [path.resolve(__dirname, 'src')],
        exclude: [/node_modules/]
      },
      {
        test: /.(less|css)$/,

        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true
            }
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  node: {
    global: true
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    fallback: {
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      fs: false,
      os: require.resolve('os-browserify/browser'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify')
    }
  },

  optimization: {
    minimizer: [new TerserPlugin()],

    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      },

      chunks: 'async',
      minChunks: 1,
      minSize: 30000,
      name: false
    }
  },

  externalsType: 'window',
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'office-ui-fabric-react': 'Fabric'
  }
};
