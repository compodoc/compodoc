const process = require('process'),
    helpers = require('../test/dist/helpers.js'),
    rimraf = require('rimraf'),
    exec = helpers.exec,
    fs = helpers.fs,
    tmp = helpers.temporaryDir();

const TEST_FOLDER = 'angularexpo-tests',
    GIT_REPOSITORIES = [{
        name: 'parrot', maintainer: 'anthonynsimon', tsconfig_path: './web-app/src/'
    }, {
        name: 'batcave', maintainer: 'hsbalar', tsconfig_path: './'
    }, {
        name: 'angular2-image-gallery', maintainer: 'BenjaminBrandmeier', tsconfig_path: './src/'
    }, {
        name: 'pinterest', maintainer: 'aviabird', tsconfig_path: './src/'
    }, {
        name: 'Movies-Finder', maintainer: 'Lazhari', tsconfig_path: './src/'
    }, {
        name: 'memory', maintainer: 'MurhafSousli', tsconfig_path: './src/'
    }, {
        name: '8puzzle', maintainer: 'MurhafSousli', tsconfig_path: './src/'
    }, {
        name: 'angular2-quiz-app', maintainer: 'fabiandev', tsconfig_path: './'
    }, {
        name: 'Angular-2-Github-Search-Profile', maintainer: 'tahaipek', tsconfig_path: './'
    }, {
        name: 'soundcloud-ngrx', maintainer: 'r-park', tsconfig_path: './'
    }, {
        name: 'angular2-university-domains-list', maintainer: 'tahaipek', tsconfig_path: './src/'
    }, {
        name: 'zombie-finder', maintainer: 'hsbalar', tsconfig_path: './'
    }, {
        name: 'angular-calendar', maintainer: 'mattlewis92', tsconfig_path: './'
    }, {
        name: 'angular2-hn', maintainer: 'housseindjirdeh', tsconfig_path: './src/'
    }, {
        name: 'CoreUI-Free-Bootstrap-Admin-Template', maintainer: 'mrholek', tsconfig_path: './Angular2_CLI_Full_Project/src/'
    }, {
        name: 'ng2-arithmetis', maintainer: 'feloy', tsconfig_path: './src/'
    }, {
        name: 'angular2-youtube', maintainer: 'dlizarra', tsconfig_path: './src/'
    }, {
        name: 'Preserver', maintainer: 'hsbalar', tsconfig_path: './'
    }, {
        name: 'ng2-tic-tac-toe', maintainer: 'rmdias', tsconfig_path: './'
    }, {
        name: 'ng2-2048', maintainer: 'Neil-Ni', tsconfig_path: './'
    }, {
        name: 'angular2-redux-contact-list', maintainer: 'housseindjirdeh', tsconfig_path: './'
    }, {
        name: 'Angular2PianoNoteTrainingGame', maintainer: 'JosephWoodward', tsconfig_path: './'
    }, {
        name: 'ng-logo', maintainer: 'dweitz43', tsconfig_path: './src/'
    }, {
        name: 'ng2-admin', maintainer: 'akveo', tsconfig_path: './'
    }, {
        name: 'ng2-chess', maintainer: 'shlomiassaf', tsconfig_path: './'
    }, {
        name: 'primeng', maintainer: 'primefaces', tsconfig_path: './'
    }, {
        name: 'sequence-alignment', maintainer: 'radotzki', tsconfig_path: './'
    }, {
        name: 'ng-go', maintainer: 'lys1030', tsconfig_path: './'
    }, {
        name: 'ngx-uploader', maintainer: 'jkuri', tsconfig_path: './'
    }, {
        name: 'codejamscoreboard', maintainer: 'defacto133', tsconfig_path: './'
    }, {
        name: 'programmersguidetothegalaxy-site-angular2', maintainer: 'stuartaroth', tsconfig_path: './'
    }, {
        name: 'a2gtm', maintainer: 'mrf28', tsconfig_path: './'
    }, {
        name: 'realtime-twitter-search-angular2', maintainer: 'pusher-community', tsconfig_path: './'
    }, {
        name: 'futureApp', maintainer: 'webmaxru', tsconfig_path: './'
    }, {
        name: 'ng2-clock', maintainer: 'zackhall', tsconfig_path: './'
    }, {
        name: 'todo-list', maintainer: 'maxcabrera', tsconfig_path: './'
    }, {
        name: 'rdash-angular2', maintainer: 'ziyasal', tsconfig_path: './'
    }, {
        name: 'ngconf2015demo', maintainer: 'Microsoft', tsconfig_path: './'
    }, {
        name: 'ng2-bootstrap', maintainer: 'valor-software', tsconfig_path: './src/'
    }, {
        name: 'angular2-rxjs-chat', maintainer: 'ng-book', tsconfig_path: './'
    }, {
        name: 'angular2-grid', maintainer: 'BTMorton', tsconfig_path: './'
    }, {
        name: 'ng2-file-upload', maintainer: 'valor-software', tsconfig_path: './src/'
    }, {
        name: 'todo-angular2-firebase', maintainer: 'r-park', tsconfig_path: './'
    }, {
        name: 'ng2-image-lazy-load', maintainer: 'NathanWalker', tsconfig_path: './'
    }, {
        name: 'ng2-dragula', maintainer: 'valor-software', tsconfig_path: './'
    }, {
        name: 'angular2-tv-tracker', maintainer: 'mattlewis92', tsconfig_path: './'
    }, {
        name: 'ng2-dribbble', maintainer: 'mohammedzamakhan', tsconfig_path: './'
    }],
    len = GIT_REPOSITORIES.length;

tmp.clean(TEST_FOLDER);
tmp.create(TEST_FOLDER);

var i = 0;

let clone = (repo) => {
        return new Promise(function(resolve, reject) {
            exec('git clone https://github.com/' + repo.maintainer + '/' + repo.name, {
                cwd: TEST_FOLDER
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject();
                } else {
                    resolve();
                }
            });
        });
    },
    compodoc = (repo) => {
        return new Promise(function(resolve, reject) {
            exec('compodoc -p ' + repo.tsconfig_path + 'tsconfig.json', {
                cwd: TEST_FOLDER + '/' + repo.name
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`compodoc error: ${error}`);
                    reject(stdout, stderr);
                } else {
                    if (stdout.indexOf('Documentation generated') !== -1) {
                        resolve();
                    } else {
                        reject(stdout, stderr);
                    }
                }
            });
        });
    }

let loop = () => {
    if (i < len) {
        clone(GIT_REPOSITORIES[i]).then(() => {
            console.log(`Repository ${GIT_REPOSITORIES[i].name} cloned`);
            compodoc(GIT_REPOSITORIES[i]).then(() => {
                console.log(` Compodoc ${GIT_REPOSITORIES[i].name} ok`);
                console.log('');
                i++;
                loop();
            }, (stdout, stderr) => {
                console.log('');
                console.error(`   Compodoc ${GIT_REPOSITORIES[i].name} KO`);
                console.log('');
                i++;
                loop();
            });
        });
    } else {
        console.log('END');
        process.exit(0);
        //rimraf(TEST_FOLDER);
    }
}

exec('cd ' + TEST_FOLDER, {}, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
    } else {
        loop();
    }
});
