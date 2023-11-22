const cpx = require('cpx');

const NODE_MODULES = './node_modules';

console.log('COPYING LIBS FOR STATIC PAGES');

cpx.copySync(NODE_MODULES + '/lunr/lunr.min.js', './src/resources/js/search/');
cpx.copySync(NODE_MODULES + '/zepto/dist/zepto.min.js', './src/resources/js/libs/');
cpx.copySync(NODE_MODULES + '/tablesort/dist/tablesort.min.js', './src/resources/js/libs/');
cpx.copySync(
    NODE_MODULES + '/tablesort/dist/sorts/tablesort.number.min.js',
    './src/resources/js/libs/'
);
cpx.copySync(NODE_MODULES + '/vis/dist/vis.min.js', './src/resources/js/libs/');
cpx.copySync(NODE_MODULES + '/svg-pan-zoom/dist/svg-pan-zoom.min.js', './src/resources/js/libs/');
cpx.copySync(NODE_MODULES + '/es6-shim/es6-shim.min.js', './src/resources/js/libs/');
cpx.copySync(
    NODE_MODULES + '/bootstrap.native/dist/bootstrap-native.js',
    './src/resources/js/libs/'
);
