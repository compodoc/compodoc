var exec = require('child_process').exec,
    fs = require('fs-extra'),
    read = function(file) {
        return fs.readFileSync(file).toString();
    },
    copy = function(source, dest) {
        return fs.copySync(source, dest);
    },
    spawn = require('child_process').spawn,
    tmp = (function() {
        var name = '.tmp-compodoc-test';
        var cleanUp = (name) => {
            if( fs.existsSync(name) ) {
                fs.readdirSync(name).forEach((file) => {
                    var curdir = path.join(name, file);
                    if(fs.statSync(curdir).isDirectory()) {
                        cleanUp(curdir);
                    } else {
                        fs.unlinkSync(curdir);
                    }
                });
                fs.rmdirSync(name);
            }
        };

        return {
            name,
            copy(source, destination) {
                fs.copySync(source, destination);
            },
            create(param) {
                if (param) name = param;
                if (!fs.existsSync(name)){
                    fs.mkdirSync(name);
                }
            },
            clean(param) {
                if (param) name = param;
                try {
                    cleanUp(name);
                } catch (e) {}
            }
        }
    })();

var testWatch = false,
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
    console.log('stdout: ' + data);
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
