const helpers = require('../test/dist/helpers.js'),
    exec = helpers.exec,
    fs = helpers.fs,
    read = helpers.read,
    copy = helpers.copy,
    spawn = require('child_process').spawn,
    tmp = helpers.temporaryDir();

let testWatch = false,
    fooCoverageFile,

    reload = function() {
        setTimeout(() => {
            tmp.copy('./test/src/bar.component-watch.ts', './test/src/sample-files/bar.component.ts');
        }, 1000);
    },

    end = function() {
        tmp.copy('./test/src/bar.component.ts', './test/src/sample-files/bar.component.ts');
    },

    ls = spawn('node', [
        './bin/index-cli.js',
        '-p', './test/src/sample-files/tsconfig.simple.json',
        '-d', tmp.name + '/',
        '-s', '-w'
    ]);

tmp.clean();
tmp.create();

ls.stdout.on('data', function(data) {
    if (data.indexOf('Watching source') !== -1 && !testWatch) {
        fooCoverageFile = read(`${tmp.name}/coverage.html`);
        testWatch = true;
        if (fooCoverageFile.indexOf('2/6') !== -1) {
            reload();
        } else {
            process.exit(1);
        }
    } else if (data.indexOf('Already watching sources') != -1) {
        if (fooCoverageFile.indexOf('3/6') !== -1) {
            end();
            process.exit(0);
        } else {
            process.exit(1);
        }
    }
});

ls.stderr.on('data', function(data) {
    //console.log('stderr: ' + data);
});

ls.on('close', function(code) {
    //console.log('child process exited with code ' + code);
});
