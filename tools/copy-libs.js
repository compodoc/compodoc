const fs = require('node:fs');
const path = require('node:path');

const NODE_MODULES = './node_modules';

console.log('COPYING LIBS FOR STATIC PAGES');

function copyModuleFile(source, destinationDir, destinationName = path.basename(source)) {
    fs.mkdirSync(destinationDir, { recursive: true });
    fs.copyFileSync(source, path.join(destinationDir, destinationName));
}

function copyFirstExistingModuleFile(sources, destinationDir, destinationName) {
    const source = sources.find(fs.existsSync);
    if (!source) {
        throw new Error(`None of these source files exist: ${sources.join(', ')}`);
    }
    copyModuleFile(source, destinationDir, destinationName);
}

copyModuleFile(path.join(NODE_MODULES, 'lunr/lunr.min.js'), './src/resources/js/search/');
copyModuleFile(path.join(NODE_MODULES, 'tablesort/dist/tablesort.min.js'), './src/resources/js/libs/');
copyModuleFile(
    path.join(NODE_MODULES, 'tablesort/dist/sorts/tablesort.number.min.js'),
    './src/resources/js/libs/'
);

copyModuleFile(path.join(NODE_MODULES, 'vis-network/dist/vis-network.min.js'), './src/resources/js/libs/');

copyModuleFile(path.join(NODE_MODULES, 'svg-pan-zoom/dist/svg-pan-zoom.min.js'), './src/resources/js/libs/');
copyModuleFile(path.join(NODE_MODULES, 'es6-shim/es6-shim.min.js'), './src/resources/js/libs/');
copyFirstExistingModuleFile(
    [
        path.join(NODE_MODULES, 'bootstrap.native/dist/bootstrap-native.js'),
        path.join(NODE_MODULES, 'bootstrap.native/dist/bootstrap-native.min.js')
    ],
    './src/resources/js/libs/',
    'bootstrap-native.js'
);
