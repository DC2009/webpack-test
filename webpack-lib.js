const webpack = require('webpack');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
//const stylus = require('stylus');
const poststylus = require('poststylus');
//const autoprefixer = require('autoprefixer');

exports.setFreeVariable = function(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  };
}

exports.devServer = function(options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn't set
      // HotModuleReplacementPlugin!
      hot: true,
      inline: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // If you use Vagrant or Cloud9, set
      // host: options.host || '0.0.0.0';
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: options.host, // Defaults to `localhost`
      port: options.port // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        multiStep: true
      })
    ]
  };
}

exports.extractBundle = function(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    // Define an entry point needed for splitting.
    entry: entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest']
      })
    ]
  };
}

exports.favicons = function(options) {
  return {
    plugins: [
      new FaviconsWebpackPlugin({
        // Your source logo 
        logo: options.logo,
        // The prefix for all image files (might be a folder or a name) 
        prefix: 'icons-[hash]/',
        // Emit all stats of the generated icons 
        emitStats: false,
        // The name of the json containing all favicon information 
        statsFilename: 'iconstats-[hash].json',
        // Generate a cache file with control hashes and 
        // don't rebuild the favicons until those hashes change 
        persistentCache: true,
        // Inject the html into the html-webpack-plugin 
        inject: true,
        // favicon background color (see https://github.com/haydenbleasel/favicons#usage) 
        background: '#fff',
        // favicon app title (see https://github.com/haydenbleasel/favicons#usage) 
        title: options.title,
        // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage) 
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          opengraph: false,
          twitter: false,
          yandex: false,
          windows: false
        }  
      })
    ]
  };
}

exports.minify = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin()
    ]
  };
}

exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        // Without `root` CleanWebpackPlugin won't point to our
        // project and will fail to work.
        root: process.cwd()
      })
    ]
  };
}

exports.setupCSS = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: paths
        }
      ]
    }
  };
}

exports.setupStylus = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.styl$/,
          loaders: ['style', 'css', 'stylus'],
          include: paths
        }
      ]
    }//,
    //plugins: [
    //  new poststylus([ 'autoprefixer', 'rucksack-css'])
    //]
  };
}

exports.extractCSS = function(paths) {
  return {
    module: {
      loaders: [
        // Extract CSS during build
        {
          test: /\.css$/,
          // If you want to pass more loaders to the ExtractTextPlugin, 
          // you should use ! syntax. 
          // Example: ExtractTextPlugin.extract('style', 'css!postcss').
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: paths
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  };
}

exports.extractStylus = function(paths) {
  return {
    module: {
      loaders: [
        // Extract Stylus during build
        {
          test: /\.styl$/,
          // If you want to pass more loaders to the ExtractTextPlugin, 
          // you should use ! syntax. 
          // Example: ExtractTextPlugin.extract('style', 'css!postcss').
          loader: ExtractTextPlugin.extract('style', 'css!stylus'),
          include: paths
        }
      ]
    },
    plugins: [
      new poststylus([ 'autoprefixer', 'rucksack-css']),
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  };
}

exports.purifyCSS = function(paths) {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        // `paths` is used to point PurifyCSS to files not
        // visible to Webpack. You can pass glob patterns
        // to it.
        paths: paths
      }),
    ]
  }
}

exports.images = function(path) {
  console.log('file-loader:', path );
  return {
    module: {
      loaders: [
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          loaders: [
            'file?name=assets/images/[name].[hash].[ext]',
            'image-webpack?{optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}, mozjpeg: {quality: 65}}'
          ],
          include: path
        }
      ]
    }
  };
}

exports.fonts = function(path) {
  return {
    module: {
      loaders: [
        {
          test: /\.woff$/,
          // Inline small woff files and output them below font/.
          // Set mimetype just in case.
          loader: 'url',
          query: {
            name: 'assets/fonts/[hash].[ext]',
            limit: 5000,
            mimetype: 'application/font-woff'
          },
          include: path
        },
        {
          test: /\.ttf$|\.eot$/,
          loader: 'file',
          query: {
            name: 'assets/fonts/[hash].[ext]'
          },
          include: path
        }
      ]
    }
  };
}

