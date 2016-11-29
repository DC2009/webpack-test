const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const merge = require('webpack-merge');
const validate = require('webpack-validator');

const lib = require('./webpack-lib');

const pkg = require('./package.json');

const PATHS = {
  app: path.join(__dirname, 'app'),
  css: path.join(__dirname, 'app', 'assets', 'css', 'main.css'),
  stylus: path.join(__dirname, 'app', 'assets', 'stylus', 'main.styl'),
  favicon: path.join(__dirname, 'app', 'assets', 'favicon'),
  images: path.join(__dirname, 'app', 'assets', 'images'),
  fonts: path.join(__dirname, 'app', 'assets', 'fonts'),
  build: path.join(__dirname, 'build')
};

const appTitle = 'test';

const common = {  
  // Object of entries for more complex configurations.
  entry: {
    app: PATHS.app,
    style: PATHS.style
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: appTitle
    })
  ]
};

var config;

// Detect how npm runs and branch accordingly
switch (process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for require.ensure. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
      },
      lib.clean(PATHS.build),
      // React relies on process.env.NODE_ENV based optimizations.
      // Setting it to 'production' optimizes React building. 
      lib.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      lib.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg.dependencies)
      }),
      /*lib.favicons({
        title: appTitle, 
        logo: path.join(PATHS.favicon, 'logo.png')
      }),*/
      lib.minify(),
      //lib.extractCSS(PATHS.css),
      lib.extractStylus(PATHS.stylus),
      lib.purifyCSS([PATHS.app]),
      lib.images(PATHS.images),
      lib.fonts(PATHS.fonts) 
    );
    break;
  default:
    config = merge(
      common, 
      {
        devtool: 'eval-source-map'
      },
      //lib.setupCSS(PATHS.css),
      lib.setupStylus(PATHS.stylus),
      lib.images(PATHS.images),
      lib.devServer({
        host: process.env.HOST,
        port: process.env.PORT
      })
    );  
}

// Run validator in quiet mode to avoid output in stats
module.exports = validate(config, {quiet: true});
