'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs-extra');
var path = require('path');
var LiveServer = require('live-server');
var Shelljs = require('shelljs');
var _ = require('lodash');
var Handlebars = require('handlebars');
var marked = _interopDefault(require('marked'));

let gutil = require('gulp-util');
let c = gutil.colors;
let pkg$1 = require('../package.json');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["WARN"] = 1] = "WARN";
    LEVEL[LEVEL["DEBUG"] = 2] = "DEBUG";
    LEVEL[LEVEL["FATAL"] = 3] = "FATAL";
    LEVEL[LEVEL["ERROR"] = 4] = "ERROR";
})(LEVEL || (LEVEL = {}));
class Logger {
    constructor() {
        this.name = pkg$1.name;
        this.version = pkg$1.version;
        this.logger = gutil.log;
    }
    title(...args) {
        this.logger(c.cyan(...args));
    }
    info(...args) {
        this.logger(this.format(LEVEL.INFO, ...args));
    }
    warn(...args) {
        this.logger(this.format(LEVEL.WARN, ...args));
    }
    error(...args) {
        this.logger(this.format(LEVEL.FATAL, ...args));
    }
    fatal(...args) {
        this.error(...args);
    }
    debug(...args) {
        this.logger(this.format(LEVEL.DEBUG, ...args));
    }
    format(level, ...args) {
        let pad = (s, l, c = '') => {
            return s + Array(Math.max(0, l - s.length + 1)).join(c);
        };
        let msg = args.join(' ');
        if (args.length > 1) {
            msg = `${pad(args.shift(), 15, ' ')}: ${args.join(' ')}`;
        }
        switch (level) {
            case LEVEL.INFO:
                msg = c.green(msg);
                break;
            case LEVEL.WARN:
                msg = c.gray(msg);
                break;
            case LEVEL.DEBUG:
                msg = c.cyan(msg);
                break;
            case LEVEL.ERROR:
            case LEVEL.FATAL:
                msg = c.red(msg);
                break;
        }
        return [
            msg
        ].join('');
    }
}
let logger = new Logger();

//import * as helpers from 'handlebars-helpers';
class HtmlEngine {
    constructor() {
        //TODO use this instead : https://github.com/assemble/handlebars-helpers
        Handlebars.registerHelper("compare", function (a, operator, b, options) {
            if (arguments.length < 4) {
                throw new Error('handlebars Helper {{compare}} expects 4 arguments');
            }
            var result;
            switch (operator) {
                case '==':
                    result = a == b;
                    break;
                case '===':
                    result = a === b;
                    break;
                case '!=':
                    result = a != b;
                    break;
                case '!==':
                    result = a !== b;
                    break;
                case '<':
                    result = a < b;
                    break;
                case '>':
                    result = a > b;
                    break;
                case '<=':
                    result = a <= b;
                    break;
                case '>=':
                    result = a >= b;
                    break;
                case 'typeof':
                    result = typeof a === b;
                    break;
                default: {
                    throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
                }
            }
            if (result === false) {
                return options.inverse(this);
            }
            return options.fn(this);
        });
        Handlebars.registerHelper("debug", function (optionalValue) {
            console.log("Current Context");
            console.log("====================");
            console.log(this);
            if (optionalValue) {
                console.log("OptionalValue");
                console.log("====================");
                console.log(optionalValue);
            }
        });
    }
    init() {
        fs.readFile(path.resolve(__dirname + '/../src/templates/menu.hbs'), 'utf8', (err, data) => {
            if (err)
                throw err;
            Handlebars.registerPartial('menu', data);
        });
    }
    render(mainData, page) {
        var o = mainData;
        Object.assign(o, page);
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during index ' + page.name + ' generation');
                }
                else {
                    let template = Handlebars.compile(data), result = template({
                        data: o
                    });
                    resolve$$1(result);
                }
            });
        });
    }
}

class MarkdownEngine {
    constructor() {
    }
    getReadmeFile() {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + '/README.md'), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during README.md file reading');
                }
                else {
                    resolve$$1(marked(data));
                }
            });
        });
    }
}

class FileEngine {
    constructor() {
    }
    get(filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                }
                else {
                    resolve$$1(data);
                }
            });
        });
    }
}

class Configuration {
    constructor() {
        this._pages = [];
        this._mainData = {};
    }
    addPage(page) {
        this._pages.push(page);
    }
    get pages() {
        return this._pages;
    }
    set pages(pages) {
        this._pages = [];
    }
    get mainData() {
        return this._mainData;
    }
    set mainData(data) {
        Object.assign(this._mainData, data);
    }
}

let pkg = require('../package.json');
let program = require('commander');
let $htmlengine = new HtmlEngine();
let $fileengine = new FileEngine();
let $configuration = new Configuration();
let $markdownengine = new MarkdownEngine();
var Application;
(function (Application) {
    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Entry *.ts file')
        .option('-o, --open', 'Open the generated documentation', false)
        .option('-n, --name [name]', 'Title documentation', `Application documentation`)
        .option('-s, --serve', 'Serve generated documentation', false)
        .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', `./documentation/`)
        .parse(process.argv);
    let outputHelp = () => {
        program.outputHelp();
        process.exit(1);
    };
    $htmlengine.init();
    $configuration.mainData.documentationMainName = program.name; //default commander value
    let processPackageJson = () => {
        $fileengine.get('package.json').then((packageData) => {
            let parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined') {
                $configuration.mainData.documentationMainName = parsedData.name;
            }
            if (typeof parsedData.description !== 'undefined') {
                $configuration.mainData.documentationMainDescription = parsedData.description;
            }
            processMarkdown();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            processMarkdown();
        });
    };
    let processMarkdown = () => {
        $markdownengine.getReadmeFile().then((readmeData) => {
            $configuration.addPage({
                name: 'index',
                context: 'readme'
            });
            $configuration.addPage({
                name: 'overview',
                context: 'overview'
            });
            $configuration.mainData.readme = readmeData;
            getModules();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without README.md file');
            $configuration.addPage({
                name: 'index',
                context: 'overview'
            });
            getModules();
        });
    };
    let getModules = () => {
        let ngd = require('angular2-dependencies-graph');
        let modules = ngd.Application.getDependencies({
            file: program.file
        });
        $configuration.mainData.modules = _.sortBy(modules, ['name']);
        processPages();
    };
    let processPages = () => {
        let pages = $configuration.pages, i = 0, len = pages.length, loop = () => {
            if (i <= len - 1) {
                $htmlengine.render($configuration.mainData, pages[i]).then((htmlData) => {
                    fs.outputFile(program.output + pages[i].name + '.html', htmlData, function (err) {
                        if (err) {
                            logger.error('Error during ' + pages[i].name + ' page generation');
                        }
                        else {
                            i++;
                            loop();
                        }
                    });
                }, (errorMessage) => {
                    logger.error(errorMessage);
                });
            }
            else {
                processResources();
            }
        };
        loop();
    };
    let processResources = () => {
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + program.output), function (err) {
            if (err) {
                logger.error('Error during resources copy');
            }
            else {
                processGraph();
            }
        });
    };
    let processGraph = () => {
        Shelljs.exec('ngd -f ' + program.file + ' -d documentation/graph', {
            silent: true
        }, function (code, stdout, stderr) {
            if (code === 0) {
                logger.info('Documentation generated in ' + program.output);
            }
            else {
                logger.error('Error during graph generation');
            }
        });
    };
    /*
     * 1. scan ts files for list of modules
     * 2. scan ts files for list of components
     * 3. export one page for each modules using module.hbs template
     * 4. export one page for each components using components.hbs template
     * 5. render README.md in index.html
     * 6. render menu with lists of components and modules
     */
    Application.run = () => {
        let files = [];
        if (program.serve) {
            logger.info('Serving documentation');
            LiveServer.start({
                root: program.output,
                open: false,
                quiet: true
            });
            return;
        }
        if (program.file) {
            logger.info('Using entry', program.file);
            if (!fs.existsSync(program.file) ||
                !fs.existsSync(path.join(process.cwd(), program.file))) {
                logger.fatal(`"${program.file}" file was not found`);
                process.exit(1);
            }
            else {
                files = [program.file];
                processPackageJson();
            }
        }
        else {
            logger.fatal('Entry file was not found');
            outputHelp();
        }
    };
})(Application || (Application = {}));

Application.run();
