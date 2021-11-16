const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InjectBodyPlugin = require('inject-body-webpack-plugin').default;

const libraryName = 'NervosWallet';

const PORT = 8081;

module.exports = {
  mode: 'development',
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client',
    './src/extension.ts'
  ],
  stats: { children: true },

  output: {
    path: path.resolve(__dirname, 'out'),
    libraryTarget: 'system',
    publicPath: '',
    clean: true
  },

  devServer: {
    contentBase: path.join(__dirname, 'template/'),
    hot: true,
    historyApiFallback: true,
    inline: true,
    open: true,
    injectClient: false,
    port: PORT,
    clientLogLevel: 'silent',
    headers: { 'Access-Control-Allow-Origin': '*' }
  },

  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin(),
    new InjectBodyPlugin({
      content: `<script>
      localStorage.setItem('devPluginInfo', JSON.stringify({
        library: '${libraryName}',
        url: 'http://localhost:${PORT}/main.js'
      }));
      </script>`
    }),
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
