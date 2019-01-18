var Encore = require('@symfony/webpack-encore');

Encore
    // .configureBabel((config) => {
    //   config.presets.push('stage-2');
    // })
    // directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // public path used by the web server to access the output path
    .setPublicPath('/build')
    // only needed for CDN's or sub-directory deploy
    //.setManifestKeyPrefix('build/')

    /*
     * ENTRY CONFIG
     *
     * Add 1 entry for each "page" of your app
     * (including one that's included on every page - e.g. "app")
     *
     * Each entry will result in one JavaScript file (e.g. app.js)
     * and one CSS file (e.g. app.css) if you JavaScript imports CSS.
     */
    .addEntry('photobank-app', './assets/js/photobank-app.js')
    .addEntry('usermanager-app', './assets/js/usermanager-app.js')
    .addEntry('linkmanager-app', './assets/js/linkmanager-app.js')
    // .addEntry('crc32', './assets/js/vendor/crc32.js')
    // .addEntry('md5', './assets/js/vendor/md5.js')
    // .addEntry('resumable', './assets/js/vendor/resumable.js')
    //.addStyleEntry('main_style', './assets/scss/app.scss')
    //.addStyleEntry('color_theme_default', './assets/scss/photobank/themes/default.scss')


    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    // enables Sass/SCSS support
    .enableSassLoader()
    .enablePostCssLoader((options) => {
      options.config = {
          path: './postcss.config.js'
      };
    })
    // uncomment if you use TypeScript
    //.enableTypeScriptLoader()

    // uncomment if you're having problems with a jQuery plugin
    .autoProvidejQuery()
    .autoProvideVariables({
      // $: 'jquery',
      // jQuery: 'jquery',
      // 'window.jQuery': 'jquery',
      'Resumable': __dirname + '/assets/js/vendor/resumable.js',
      'window.Resumable': __dirname + '/assets/js/vendor/resumable.js',
      'CRC32': __dirname + '/assets/js/vendor/crc32.js'
    })
    .enableReactPreset()
;

module.exports = Encore.getWebpackConfig();
