const webshot = require('webshot'),
    liveServer = require('live-server'),
    helpers = require('../test/dist/helpers.js'),
    exec = helpers.exec,
    fs = helpers.fs,
    tmp = helpers.temporaryDir();

/*
tmp.create();
exec('node ./bin/index.js -p ./test/src/todomvc-ng2/tsconfig.json -n \'TodoMVC Angular 2 documentation\' -d ' + tmp.name, {
    env: {
        MODE: 'TESTING'
    }
}, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
    } else {
        console.log('todomvc-ng2 doc generated');

        /*
        liveServer.start({
            root: tmp.name,
            open: false,
            quiet: true,
            logLevel: 0
        });
        */
        /*
        fs.readFile(tmp.name + '/index.html', 'utf8', (err, data) => {
            if (err) throw err;
            webshot(data, 'compodoc.png', {
                siteType: 'html'
            }, function(err) {
                console.log('todomvc-ng2 screenshot generated');
            });
        });
        */
        /*
    }
});
*/
