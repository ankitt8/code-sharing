const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.jsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
    publicPath: '/',
    clean: true
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'template.html'),
      filename: 'index.html'
    })
  ],
  devServer: {
    port: 8081,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'dist')
    },
    proxy: {
      '/submit': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/users/': 'http://localhost:3000',
      '/api': 'http://localhost:3000'
    }
  },
  devtool: isProduction ? false : 'source-map',
  stats: 'minimal',
  mode: isProduction ? 'production' : 'development'
};

