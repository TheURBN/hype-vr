import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';


const imageminOptions = {
  progressive: true,
  pngquant: {},
  mozjpeg: {},
};


export default {
  entry: ['babel-polyfill', './app'],

  devtool: '#inline-source-map',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  module: {
    loaders: [
      {
        test: /\.worker\.js$/,
        loaders: [
          'worker-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
          'eslint-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader!csso-loader!postcss-loader!sass-loader',
        }),
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loaders: [
          'file-loader?hash=sha256&digest=hex&name=[hash].[ext]',
          `image-webpack-loader?${JSON.stringify(imageminOptions)}`,
        ],
      },
      {
        test: /\.ya?ml$/,
        loader: [
          'json-loader',
          'yaml-loader',
        ],
      },
      {
        test: /\.glsl$/,
        loader: 'shader-loader',
        options: {
          glsl: {
            chunkPath: path.resolve('shaders/chunks'),
          },
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: '!!html-loader!pug-html-loader?pretty&exports=false!./index.pug',
      inject: 'head',
    }),
    new ExtractTextPlugin({
      filename: '[hash].css',
      allChunks: true,
    }),
  ],

  resolve: {
    alias: {
      styles: path.resolve(__dirname, 'styles'),
      img: path.resolve(__dirname, 'img'),
    },
  },

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: process.env.PORT || 8081,
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: {
      index: '/',
    },
  },
};
