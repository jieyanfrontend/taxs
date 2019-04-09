const webpack = require("webpack");
const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const isDEV = process.env.NODE_ENV === 'development';
const config = {
  // mode: "development",
  mode: "production",
  entry: {
    app: [path.join(__dirname, "src/index.js")]
  },
  output: {
    path: path.join(__dirname, "taxs"),
    filename: '[name].[hash]js',
    chunkFilename: '[name].[hash].js',
    publicPath: "/taxs/"
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: ['url-loader']
      },
      {
        test: /\.css$/,
        exclude: path.join(__dirname, 'node_modules'),
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            }
          }]
      },
      {
        test: /\.css$/,
        include: path.join(__dirname, 'node_modules'),
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: false
            },
          },
        ]
      },
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.join(__dirname, "src/template.html")
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  optimization: {
    splitChunks: {
      chunks:'all'
    },
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
        ecma: 6,
        cache: true,
        parallel: true
      }}),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
};

if (isDEV) {
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, 'src/index.js')
    ]
  },
    config.devServer = {
      hot: true,
      port: 8000,
      contentBase: path.join(__dirname, "/"),
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://jmswj.e-irobot.com:1035',
          changeOrigin: true
        }
      }
    }
}

module.exports = config;