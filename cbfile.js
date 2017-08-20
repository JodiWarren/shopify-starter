const fs = require('fs');
const path = require('path');
const bs = require('browser-sync').create();
const vfs = require('vinyl-fs');
var flatten = require('gulp-flatten');
const sass = require('crossbow-sass');
const cb = require('crossbow');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
// const webpackHotMiddleware = require('webpack-hot-middleware');

const options = {
    roots: {
        src: './src/',
        dist: './dist/'
    },
    styles: {
        input: 'scss/theme.scss',
        output: 'assets'
    },
    js: {
        input: 'ts/main.ts',
        output: 'assets/bundle.js'
    }
};

function copyImages(options, context) {
    const srcPath = context.watchEvent.path;
    const destPath = srcPath.replace('src/', 'dist/');
    fs.createReadStream(srcPath)
        .pipe(fs.createWriteStream(destPath));
};

cb.task('build-css', {
    description: 'Build dev + production CSS',
    tasks: [
        function () {
            console.log('Start CSS')
        },
        'crossbow-sass',
        'crossbow-sass --production',
        function () {
            console.log('Finish CSS')
        }
    ]
});

cb.task('webpack', '@npm webpack');

cb.task('build', [
    'css',
    'webpack'
]);

cb.task('bs', [
    '@bg browser-sync start --server '
]);

cb.task('copyAllImages', function(){
    return vfs.src(options.roots.src + 'images/**/*.{jpeg,jpg,svg,png,gif}')
        .pipe(vfs.dest(function(file) {
            file.path = path.join(file.base, path.basename(file.path));
            return options.roots.dist + 'assets';
        }))
});

cb.task('dev', function () {

    var webpackConfig = require('./webpack.config');
    var bundler = webpack(webpackConfig);

    bs.init({
        server: './dist',
        middleware: [
            webpackDevMiddleware(bundler, {
                noInfo: true,
                publicPath: options.js.output,
                stats: {colors: true}
            })
            // webpackHotMiddleware(bundler)
        ]
    });

    // Watch HTML
    cb.watch([options.roots.src + '**/*.html'], [
        function(options, context) {
            const srcPath = context.watchEvent.path;
            const destPath = srcPath.replace('src/', 'dist/');
            fs.createReadStream(srcPath)
                .pipe(fs.createWriteStream(destPath));
        },
        function () {
            bs.reload();
        }
    ]);

    // Watch Images
    cb.watch([options.roots.src + 'images/**/*.*'], [
        copyImages,
        function () {
            bs.reload();
        }
    ]);

    // Watch SCSS
    cb.watch([options.roots.src + 'scss/**/*.scss'], [
        'build-css',
        function () {
            bs.reload('theme.css');
        }
    ]);

    // Watch TypeScript
    cb.watch([
        options.roots.src + 'ts/**/*.ts',
        options.roots.src + 'ts/**/*.js'
    ], [
        'webpack',
        function () {
            bs.reload();
        }
    ]);
});

cb.options({
    "crossbow-sass": {
        input: options.roots.src + options.styles.input,
        output: options.roots.dist + options.styles.output
    }
});