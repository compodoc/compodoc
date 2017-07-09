const process = require('process'),
    path = require('path'),
    helpers = require('../test/dist/helpers.js'),
    rimraf = require('rimraf'),
    exec = helpers.exec,
    fs = helpers.fs,
    tmp = helpers.temporaryDir();

const TEST_FOLDER = 'test-simple-generation',
    compodoc = () => {
        return new Promise(function(resolve, reject) {
            exec('npm run doc', {
                maxBuffer: 1000 * 1024
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`compodoc error: ${error}`);
                    reject(stdout, stderr);
                } else {
                    if (stdout.indexOf('Documentation generated') !== -1) {
                        resolve(stdout, stderr);
                    } else {
                        reject(stdout, stderr);
                    }
                }
            });
        });
    };

fs.copySync(path.resolve(__dirname + '/../test/src/todomvc-ng2/'), TEST_FOLDER);

try {
    process.chdir(TEST_FOLDER);
    console.log(`New directory: ${process.cwd()}`);
    //tmp.clean(TEST_FOLDER);
    compodoc().then(function() {
        console.log('ok');
        process.exit(0);
    }, function() {
        console.log('error');
        process.exit(1);
    });
} catch (err) {
    console.error(`chdir: ${err}`);
}
