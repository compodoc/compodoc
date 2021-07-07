const process = require('process'),
    helpers = require('../test/dist/helpers.js'),
    rimraf = require('rimraf'),
    exec = helpers.exec,
    fs = helpers.fs,
    tmp = helpers.temporaryDir();

const TEST_FOLDER = 'angularexpo-tests',
    GIT_REPOSITORIES = [
        {
            name: 'parrot',
            maintainer: 'anthonynsimon',
            tsconfig_path: './web-app/src/',
        },
        {
            name: 'batcave',
            maintainer: 'hsbalar',
            tsconfig_path: './',
            failedAccepted: true,
        },
        {
            name: 'angular2-image-gallery',
            maintainer: 'BenjaminBrandmeier',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'pinterest',
            maintainer: 'aviabird',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'Movies-Finder',
            maintainer: 'Lazhari',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'memory',
            maintainer: 'MurhafSousli',
            tsconfig_path: './src/',
        },
        {
            name: '8puzzle',
            maintainer: 'MurhafSousli',
            tsconfig_path: './src/',
        },
        {
            name: 'angular2-quiz-app',
            maintainer: 'fabiandev',
            tsconfig_path: './',
        },
        {
            name: 'soundcloud-ngrx',
            maintainer: 'r-park',
            tsconfig_path: './',
        },
        {
            name: 'angular2-university-domains-list',
            maintainer: 'tahaipek',
            tsconfig_path: './src/',
        },
        {
            name: 'zombie-finder',
            maintainer: 'hsbalar',
            tsconfig_path: './',
        },
        {
            name: 'angular-calendar',
            maintainer: 'mattlewis92',
            tsconfig_path: './',
            tsconfig_file: 'tsconfig-compodoc.json',
        },
        {
            name: 'angular2-hn',
            maintainer: 'housseindjirdeh',
            tsconfig_path: './',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'coreui-free-angular-admin-template',
            maintainer: 'coreui',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'ng2-arithmetis',
            maintainer: 'feloy',
            tsconfig_path: './src/',
        },
        {
            name: 'angular2-youtube',
            maintainer: 'dlizarra',
            tsconfig_path: './src/',
        },
        {
            name: 'Preserver',
            maintainer: 'hsbalar',
            tsconfig_path: './',
        },
        {
            name: 'ng-logo',
            maintainer: 'dweitz43',
            tsconfig_path: './src/',
        },
        {
            name: 'ngx-admin',
            maintainer: 'akveo',
            tsconfig_path: './',
        },
        {
            name: 'ng2-chess',
            maintainer: 'shlomiassaf',
            tsconfig_path: './',
        },
        {
            name: 'primeng',
            maintainer: 'primefaces',
            tsconfig_path: './',
            failedAccepted: true,
        },
        {
            name: 'sequence-alignment',
            maintainer: 'radotzki',
            tsconfig_path: './',
        },
        {
            name: 'ngx-uploader',
            maintainer: 'jkuri',
            tsconfig_path: './',
        },
        {
            name: 'codejamscoreboard',
            maintainer: 'defacto133',
            tsconfig_path: './',
        },
        {
            name: 'programmersguidetothegalaxy-site-angular2',
            maintainer: 'stuartaroth',
            tsconfig_path: './',
        },
        {
            name: 'a2gtm',
            maintainer: 'mrf28',
            tsconfig_path: './src/',
        },
        {
            name: 'realtime-twitter-search-angular2',
            maintainer: 'pusher-community',
            tsconfig_path: './',
        },
        {
            name: 'futureApp',
            maintainer: 'webmaxru',
            tsconfig_path: './',
        },
        {
            name: 'ng2-clock',
            maintainer: 'zackhall',
            tsconfig_path: './',
        },
        {
            name: 'ngconf2015demo',
            maintainer: 'Microsoft',
            tsconfig_path: './',
        },
        {
            name: 'angular2-rxjs-chat',
            maintainer: 'ng-book',
            tsconfig_path: './',
        },
        {
            name: 'angular2-grid',
            maintainer: 'BTMorton',
            tsconfig_path: './projects/angular2-grid/',
            tsconfig_file: 'tsconfig.lib.json',
        },
        {
            name: 'ng2-file-upload',
            maintainer: 'valor-software',
            tsconfig_path: './src/',
        },
        {
            name: 'todo-angular2-firebase',
            maintainer: 'r-park',
            tsconfig_path: './',
        },
        {
            name: 'ng2-image-lazy-load',
            maintainer: 'NathanWalker',
            tsconfig_path: './',
        },
        {
            name: 'ng2-dragula',
            maintainer: 'valor-software',
            tsconfig_path: './',
        },
        {
            name: 'angular2-tv-tracker',
            maintainer: 'mattlewis92',
            tsconfig_path: './',
        },
        {
            name: 'youtube-trends',
            maintainer: 'jasodeep',
            tsconfig_path: './src/',
        },
        {
            name: 'PianoPlay',
            maintainer: 'deanmalone',
            tsconfig_path: './',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'ng-snotify',
            maintainer: 'artemsky',
            tsconfig_path: './',
        },
        {
            name: 'ng-gallery',
            maintainer: 'MurhafSousli',
            tsconfig_path: './',
        },
        {
            name: 'ngx-youtube-player',
            maintainer: 'SamirHodzic',
            tsconfig_path: './src/',
        },
        {
            name: 'angular2-instagram',
            maintainer: 'JayKan',
            tsconfig_path: './',
        },
        {
            name: 'runman',
            maintainer: 'MurhafSousli',
            tsconfig_path: './src/',
        },
        {
            name: 'ng-math',
            maintainer: 'coryrylan',
            tsconfig_path: './',
        },
        {
            name: 'ng2-minesweeper',
            maintainer: 'DanielYKPan',
            tsconfig_path: './',
        },
        {
            name: 'ngx-snake',
            maintainer: 'SamirHodzic',
            tsconfig_path: './src/',
        },
        {
            name: 'ng-pokedex',
            maintainer: 'coryrylan',
            tsconfig_path: './',
        },
        {
            name: 'codegreen',
            maintainer: 'artusvranken',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'ng2-finance',
            maintainer: 'mpetkov',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'echoes-player',
            maintainer: 'orizens',
            tsconfig_path: './',
            tsconfig_file: 'tsconfig.json',
        },
        {
            name: 'todo-angular-firebase',
            maintainer: 'r-park',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'angularspree',
            maintainer: 'aviabird',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'Angular-JumpStart',
            maintainer: 'DanWahlin',
            tsconfig_path: './',
            tsconfig_file: 'tsconfig.json',
        },
        {
            name: 'cloudstack-ui',
            maintainer: 'bwsw',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
            failedAccepted: true,
        },
        {
            name: 'nebular',
            maintainer: 'akveo',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'covalent',
            maintainer: 'Teradata',
            tsconfig_path: './src/',
            tsconfig_file: 'tsconfig.app.json',
        },
        {
            name: 'clarity',
            maintainer: 'vmware',
            tsconfig_path: './packages/angular/projects/clr-angular/',
            tsconfig_file: 'tsconfig.lib.json',
        },
        {
            name: 'simple-todos',
            maintainer: 'chanlito',
            tsconfig_path: './server/',
            tsconfig_file: 'tsconfig.json',
        },
        {
            name: 'nestjs-realworld-example-app',
            maintainer: 'lujakob',
            tsconfig_path: './',
        },
    ],
    len = GIT_REPOSITORIES.length;

tmp.clean(TEST_FOLDER);
tmp.create(TEST_FOLDER);

let i = 0,
    failedRepositories = [],
    clone = (repo) => {
        return new Promise(function (resolve, reject) {
            exec(
                'git clone https://github.com/' + repo.maintainer + '/' + repo.name,
                (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        reject();
                    } else {
                        resolve();
                    }
                }
            );
        });
    },
    compodoc = (repo) => {
        return new Promise(function (resolve, reject) {
            var tsconfig = 'tsconfig.json';
            if (repo.tsconfig_file) {
                tsconfig = repo.tsconfig_file;
            }

            process.chdir(repo.name);

            exec(
                'node ../../bin/index-cli.js -p ' + repo.tsconfig_path + tsconfig,
                {
                    maxBuffer: 1000 * 1024,
                },
                (error, stdout, stderr) => {
                    if (error) {
                        console.error(`compodoc error: ${error}`);
                        process.chdir('../');
                        if (repo.failedAccepted) {
                            resolve(stdout, stderr);
                        } else {
                            reject(stdout, stderr);
                        }
                    } else {
                        process.chdir('../');
                        if (stdout.indexOf('Documentation generated') !== -1) {
                            resolve(stdout, stderr);
                        } else {
                            if (repo.failedAccepted) {
                                resolve(stdout, stderr);
                            } else {
                                reject(stdout, stderr);
                            }
                        }
                    }
                }
            );
        });
    },
    printStat = function (stdout) {
        let statsRaw = stdout.match(regStat),
            stats,
            statModules,
            statComponents;

        if (statsRaw && statsRaw.length > 0) {
            stats = statsRaw[0];
            statModules = stats.match(regStatModules);
            statComponents = stats.match(regStatComponents);

            console.log(`   ${stdout.match(reg).length} files`);
            console.log('');
            if (statModules) {
                statModules = statModules[2];
                console.log(`   ${statModules} modules`);
            }
            if (statComponents) {
                statComponents = statComponents[2];
                console.log(`   ${statComponents} components`);
            }
        }
    };

let reg = /parsing/gm,
    regStat = /(statistics)[\s\S]*-----/gm,
    regStatModules = /(module     : )(\d+)/,
    regStatComponents = /(component  : )(\d+)/,
    loop = () => {
        if (i < len) {
            clone(GIT_REPOSITORIES[i]).then(() => {
                console.log(`Repository ${GIT_REPOSITORIES[i].name} cloned`);
                compodoc(GIT_REPOSITORIES[i]).then(
                    (stdout, stderr) => {
                        console.log('');
                        console.log(` Compodoc ${GIT_REPOSITORIES[i].name} OK`);
                        if (stdout && stdout.match(reg)) {
                            printStat(stdout);
                            GIT_REPOSITORIES[i].filesLength = stdout.match(reg).length;
                        }
                        console.log('');
                        i++;
                        loop();
                    },
                    (stdout, stderr) => {
                        console.log('');
                        console.error(`   Compodoc ${GIT_REPOSITORIES[i].name} KO`);
                        if (stdout && stdout.match(reg)) {
                            printStat(stdout);
                            GIT_REPOSITORIES[i].filesLength = stdout.match(reg).length;
                        }
                        console.log('');
                        failedRepositories.push(GIT_REPOSITORIES[i].name);
                        i++;
                        loop();
                    }
                );
            });
        } else {
            console.log('End processing projects');
            console.log('');

            if (failedRepositories.length > 0) {
                console.log('Failed repositories: ', failedRepositories);
                console.log('');
                process.exit(1);
            } else {
                process.exit(0);
            }
        }
    };

try {
    process.chdir(TEST_FOLDER);
    console.log('Start processing projects');
    console.log('');
    loop();
} catch (err) {
    console.error(`chdir: ${err}`);
}
