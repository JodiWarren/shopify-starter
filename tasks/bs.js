const bs = require('browser-sync').create();
const vfs = require('vinyl-fs');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

var webpackConfig = require('../webpack.config');
var bundler = webpack(webpackConfig);

function initBs(proxyAddress) {
    bs.init({
        server: '../dist'
    })
}