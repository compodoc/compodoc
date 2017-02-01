const webshot = require('webshot'),
    process = require('process'),
    liveServer = require('live-server'),
    helpers = require('../test/dist/helpers.js'),
    rimraf = require('rimraf'),
    exec = helpers.exec,
    fs = helpers.fs,
    tmp = helpers.temporaryDir(),

    THEMES = ['gitbook', 'laravel', 'original', 'postmark', 'readthedocs', 'stripe', 'vagrant'],

    len = THEMES.length,

    SHOT_OPTIONS = {
        windowSize: {
            width: 1024,
            height: 768
        },
        customCSS: '.menu{overflow-y:hidden!important;}'
    },

    shot = function(file) {
        return new Promise(function(resolve, reject) {
            webshot('http://localhost:8080', file, SHOT_OPTIONS, function(err) {
                console.log('todomvc-ng2 screenshot generated : ', file);
                resolve();
            });
        });
    },

    document = function(theme) {
        console.log('Document with ' + theme);
        var command = 'node ../bin/index.js -p ./src/tsconfig.json -n \'TodoMVC Angular 2 documentation\' ';
        if (theme !== 'gitbook') {
            command += ' -h ' + theme
        }
        return new Promise(function(resolve, reject) {
            exec(command, {
                env: {
                    MODE: 'TESTING'
                }
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject();
                } else {
                    shot('../screenshots/theme-' + theme + '.png').then(function() {
                        resolve();
                    })
                }
            });
        });
    };

var i = 0;

tmp.create();
exec('cd ' + tmp.name + ' && git clone https://github.com/compodoc/compodoc-demo-todomvc-angular.git .', {}, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
    } else {
        console.log('todomvc-ng2 git clone');
        process.chdir(tmp.name);

        liveServer.start({
            root: './documentation',
            open: false,
            quiet: true,
            logLevel: 0
        });

        let loop = function() {
            if (i < len) {
                document(THEMES[i]).then(function() {
                    i++
                    loop();
                })
                .catch((error) => {
                    console.log('document error: ', error);
                });
            } else {
                console.log('END');
                liveServer.shutdown();
                process.exit(0);
                rimraf(tmp.name);
            }
        };
        loop();
    }
});
