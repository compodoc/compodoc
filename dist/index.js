'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var LiveServer = require('live-server');
var marked = require('marked');
var marked__default = _interopDefault(marked);
var Handlebars = require('handlebars');
var highlightjs = _interopDefault(require('highlight.js'));
var Shelljs = require('shelljs');
var ts = require('typescript');
var util = require('util');

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var gutil = require('gulp-util');
var c = gutil.colors;
var pkg$1 = require('../package.json');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["DEBUG"] = 1] = "DEBUG";
    LEVEL[LEVEL["ERROR"] = 2] = "ERROR";
})(LEVEL || (LEVEL = {}));
var Logger = (function () {
    function Logger() {
        this.name = pkg$1.name;
        this.version = pkg$1.version;
        this.logger = gutil.log;
        this.silent = true;
    }
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.INFO].concat(args)));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.ERROR].concat(args)));
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.DEBUG].concat(args)));
    };
    Logger.prototype.format = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var pad = function (s, l, c) {
            if (c === void 0) { c = ''; }
            return s + Array(Math.max(0, l - s.length + 1)).join(c);
        };
        var msg = args.join(' ');
        if (args.length > 1) {
            msg = pad(args.shift(), 15, ' ') + ": " + args.join(' ');
        }
        switch (level) {
            case LEVEL.INFO:
                msg = c.green(msg);
                break;
            case LEVEL.DEBUG:
                msg = c.cyan(msg);
                break;
            case LEVEL.ERROR:
                msg = c.red(msg);
                break;
        }
        return [
            msg
        ].join('');
    };
    return Logger;
}());
var logger = new Logger();

var AngularAPIs = require('../src/data/api-list.json');
function finderInAngularAPIs(type) {
    var _result = {
        source: 'external',
        data: null
    };
    _.forEach(AngularAPIs, function (angularModuleAPIs, angularModule) {
        var i = 0, len = angularModuleAPIs.length;
        for (i; i < len; i++) {
            if (angularModuleAPIs[i].title === type) {
                _result.data = angularModuleAPIs[i];
            }
        }
    });
    return _result;
}

var DependenciesEngine = (function () {
    function DependenciesEngine() {
        if (DependenciesEngine._instance) {
            throw new Error('Error: Instantiation failed: Use DependenciesEngine.getInstance() instead of new.');
        }
        DependenciesEngine._instance = this;
    }
    DependenciesEngine.getInstance = function () {
        return DependenciesEngine._instance;
    };
    DependenciesEngine.prototype.init = function (data) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        this.routes = _.sortBy(_.uniqWith(this.rawData.routes, _.isEqual), ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
    };
    DependenciesEngine.prototype.find = function (type) {
        var finderInCompodocDependencies = function (data) {
            var _result = {
                source: 'internal',
                data: null
            }, i = 0, len = data.length;
            for (i; i < len; i++) {
                if (type.indexOf(data[i].name) !== -1) {
                    _result.data = data[i];
                }
            }
            return _result;
        }, resultInCompodocInjectables = finderInCompodocDependencies(this.injectables), resultInCompodocClasses = finderInCompodocDependencies(this.classes), resultInAngularAPIs = finderInAngularAPIs(type);
        if (resultInCompodocInjectables.data !== null) {
            return resultInCompodocInjectables;
        }
        else if (resultInCompodocClasses.data !== null) {
            return resultInCompodocClasses;
        }
        else if (resultInAngularAPIs.data !== null) {
            return resultInAngularAPIs;
        }
    };
    DependenciesEngine.prototype.getModules = function () {
        return this.modules;
    };
    DependenciesEngine.prototype.getComponents = function () {
        return this.components;
    };
    DependenciesEngine.prototype.getDirectives = function () {
        return this.directives;
    };
    DependenciesEngine.prototype.getInjectables = function () {
        return this.injectables;
    };
    DependenciesEngine.prototype.getInterfaces = function () {
        return this.interfaces;
    };
    DependenciesEngine.prototype.getRoutes = function () {
        return this.routes;
    };
    DependenciesEngine.prototype.getPipes = function () {
        return this.pipes;
    };
    DependenciesEngine.prototype.getClasses = function () {
        return this.classes;
    };
    return DependenciesEngine;
}());
DependenciesEngine._instance = new DependenciesEngine();

var $dependenciesEngine = DependenciesEngine.getInstance();

//import * as helpers from 'handlebars-helpers';
var HtmlEngine = (function () {
    function HtmlEngine() {
        this.cache = {};
        //TODO use this instead : https://github.com/assemble/handlebars-helpers
        Handlebars.registerHelper("compare", function (a, operator, b, options) {
            if (arguments.length < 4) {
                throw new Error('handlebars Helper {{compare}} expects 4 arguments');
            }
            var result;
            switch (operator) {
                case 'indexof':
                    result = (b.indexOf(a) !== -1);
                    break;
                case '===':
                    result = a === b;
                    break;
                case '!==':
                    result = a !== b;
                    break;
                case '>':
                    result = a > b;
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
        Handlebars.registerHelper("filterAngular2Modules", function (text, options) {
            var NG2_MODULES = [
                'BrowserModule',
                'FormsModule',
                'HttpModule',
                'RouterModule'
            ], len = NG2_MODULES.length;
            var i = 0, result = false;
            for (i; i < len; i++) {
                if (text.indexOf(NG2_MODULES[i]) > -1) {
                    result = true;
                }
            }
            if (result) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
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
        Handlebars.registerHelper('breaklines', function (text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            text = text.replace(/ /gm, '&nbsp;');
            text = text.replace(/	/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('breakComma', function (text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/,/g, ',<br>');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('functionSignature', function (method) {
            var args = method.args.map(function (arg) {
                var _result = $dependenciesEngine.find(arg.type);
                if (_result) {
                    if (_result.source === 'internal') {
                        var path_1 = _result.data.type;
                        if (_result.data.type === 'class')
                            path_1 = 'classe';
                        return arg.name + ": <a href=\"./" + path_1 + "s/" + _result.data.name + ".html\" >" + arg.type + "</a>";
                    }
                    else {
                        var path_2 = 'https://angular.io/docs/ts/latest/api/' + _result.data.path;
                        return arg.name + ": <a href=\"" + path_2 + "\" target=\"_blank\" >" + arg.type + "</a>";
                    }
                }
                else {
                    return arg.name + ": " + arg.type;
                }
            }).join(', ');
            if (method.name) {
                return method.name + "(" + args + ")";
            }
            else {
                return "(" + args + ")";
            }
        });
        Handlebars.registerHelper('jsdoc-returns-comment', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, result;
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'returns') {
                        result = jsdocTags[i].comment;
                        break;
                    }
                }
            }
            return result;
        });
        Handlebars.registerHelper('jsdoc-params', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'param') {
                        var tag = {};
                        if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                            tag.type = jsdocTags[i].typeExpression.type.name.text;
                        }
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment;
                        }
                        if (jsdocTags[i].parameterName) {
                            tag.name = jsdocTags[i].parameterName.text;
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length >= 1) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('linkType', function (name, options) {
            var _result = $dependenciesEngine.find(name);
            if (_result) {
                this.type = {
                    raw: name
                };
                if (_result.source === 'internal') {
                    if (_result.data.type === 'class')
                        _result.data.type = 'classe';
                    this.type.href = './' + _result.data.type + 's/' + _result.data.name + '.html';
                    this.type.target = '_self';
                }
                else {
                    this.type.href = 'https://angular.io/docs/ts/latest/api/' + _result.data.path;
                    this.type.target = '_blank';
                }
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper('indexableSignature', function (method) {
            var args = method.args.map(function (arg) { return arg.name + ": " + arg.type; }).join(', ');
            if (method.name) {
                return method.name + "[" + args + "]";
            }
            else {
                return "[" + args + "]";
            }
        });
        Handlebars.registerHelper('object', function (text) {
            text = JSON.stringify(text);
            text = text.replace(/{"/, '{<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/,"/, ',<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/}$/, '<br>}');
            return new Handlebars.SafeString(text);
        });
    }
    HtmlEngine.prototype.init = function () {
        var partials = [
            'menu',
            'overview',
            'readme',
            'modules',
            'module',
            'components',
            'component',
            'component-detail',
            'directives',
            'directive',
            'injectables',
            'injectable',
            'pipes',
            'pipe',
            'classes',
            'class',
            'interface',
            'routes',
            'search-results',
            'search-input',
            'link-type',
            'block-method',
            'block-property',
            'coverage-report'
        ], i = 0, len = partials.length, loop = function (resolve$$1, reject) {
            if (i <= len - 1) {
                fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', function (err, data) {
                    if (err) {
                        reject();
                    }
                    Handlebars.registerPartial(partials[i], data);
                    i++;
                    loop(resolve$$1, reject);
                });
            }
            else {
                resolve$$1();
            }
        };
        return new Promise(function (resolve$$1, reject) {
            loop(resolve$$1, reject);
        });
    };
    HtmlEngine.prototype.render = function (mainData, page) {
        var o = mainData, that = this;
        Object.assign(o, page);
        return new Promise(function (resolve$$1, reject) {
            if (that.cache['page']) {
                var template = Handlebars.compile(that.cache['page']), result = template({
                    data: o
                });
                resolve$$1(result);
            }
            else {
                fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', function (err, data) {
                    if (err) {
                        reject('Error during index ' + page.name + ' generation');
                    }
                    else {
                        that.cache['page'] = data;
                        var template = Handlebars.compile(data), result = template({
                            data: o
                        });
                        resolve$$1(result);
                    }
                });
            }
        });
    };
    return HtmlEngine;
}());

var MarkdownEngine = (function () {
    function MarkdownEngine() {
        var renderer = new marked.Renderer();
        renderer.code = function (code, language) {
            var validLang = !!(language && highlightjs.getLanguage(language));
            var highlighted = validLang ? highlightjs.highlight(language, code).value : code;
            highlighted = highlighted.replace(/(\r\n|\n|\r)/gm, '<br>');
            return "<pre><code class=\"hljs " + language + "\">" + highlighted + "</code></pre>";
        };
        marked__default.setOptions({ renderer: renderer });
    }
    MarkdownEngine.prototype.getReadmeFile = function () {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + '/README.md'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during README.md file reading');
                }
                else {
                    resolve$$1(marked__default(data));
                }
            });
        });
    };
    return MarkdownEngine;
}());

var FileEngine = (function () {
    function FileEngine() {
    }
    FileEngine.prototype.get = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                }
                else {
                    resolve$$1(data);
                }
            });
        });
    };
    return FileEngine;
}());

var COMPODOC_DEFAULTS = {
    title: 'Application documentation',
    additionalEntryName: 'Additional documentation',
    additionalEntryPath: 'additional-documentation',
    folder: './documentation/',
    port: 8080,
    theme: 'gitbook',
    base: '/',
    disableSourceCode: false,
    disableGraph: false,
    disableCoverage: false
};

var Configuration = (function () {
    function Configuration() {
        this._pages = [];
        this._mainData = {
            output: COMPODOC_DEFAULTS.folder,
            theme: COMPODOC_DEFAULTS.theme,
            extTheme: '',
            serve: false,
            port: COMPODOC_DEFAULTS.port,
            open: false,
            assetsFolder: '',
            documentationMainName: COMPODOC_DEFAULTS.title,
            documentationMainDescription: '',
            base: COMPODOC_DEFAULTS.base,
            hideGenerator: false,
            modules: [],
            readme: '',
            additionalpages: {},
            pipes: [],
            classes: [],
            interfaces: [],
            components: [],
            directives: [],
            injectables: [],
            routes: [],
            tsconfig: '',
            includes: false,
            disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode,
            disableGraph: COMPODOC_DEFAULTS.disableGraph,
            disableCoverage: COMPODOC_DEFAULTS.disableCoverage
        };
        if (Configuration._instance) {
            throw new Error('Error: Instantiation failed: Use Configuration.getInstance() instead of new.');
        }
        Configuration._instance = this;
    }
    Configuration.getInstance = function () {
        return Configuration._instance;
    };
    Configuration.prototype.addPage = function (page) {
        this._pages.push(page);
    };
    Object.defineProperty(Configuration.prototype, "pages", {
        get: function () {
            return this._pages;
        },
        set: function (pages) {
            this._pages = [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "mainData", {
        get: function () {
            return this._mainData;
        },
        set: function (data) {
            Object.assign(this._mainData, data);
        },
        enumerable: true,
        configurable: true
    });
    return Configuration;
}());
Configuration._instance = new Configuration();

function isGlobal() {
    var binPath, globalBinPath = function () {
        if (binPath)
            return binPath;
        if (process.platform === 'win32') {
            var pathnames = process.env.PATH.split(path.delimiter);
            var len = pathnames.length;
            for (var i = 0; i < len; i++) {
                if (path.basename(pathnames[i]) === 'npm' || path.basename(pathnames[i]) === 'nodejs') {
                    binPath = pathnames[i];
                }
            }
        }
        else {
            binPath = path.dirname(process.execPath);
        }
        return binPath;
    }, stripTrailingSep = function (thePath) {
        if (thePath[thePath.length - 1] === path.sep) {
            return thePath.slice(0, -1);
        }
        return thePath;
    }, pathIsInside = function (thePath, potentialParent) {
        // For inside-directory checking, we want to allow trailing slashes, so normalize.
        thePath = stripTrailingSep(thePath);
        potentialParent = stripTrailingSep(potentialParent);
        // Node treats only Windows as case-insensitive in its path module; we follow those conventions.
        if (process.platform === "win32") {
            thePath = thePath.toLowerCase();
            potentialParent = potentialParent.toLowerCase();
        }
        return thePath.lastIndexOf(potentialParent, 0) === 0 &&
            (thePath[potentialParent.length] === path.sep ||
                thePath[potentialParent.length] === undefined);
    }, isPathInside = function (a, b) {
        a = path.resolve(a);
        b = path.resolve(b);
        if (a === b) {
            return false;
        }
        return pathIsInside(a, b);
    };
    return isPathInside(process.argv[1] || '', globalBinPath() || '');
}

var NgdEngine = (function () {
    function NgdEngine() {
    }
    NgdEngine.prototype.renderGraph = function (filepath, outputpath, type) {
        return new Promise(function (resolve$$1, reject) {
            var ngdPath = (isGlobal()) ? __dirname + '/../node_modules/.bin/ngd' : __dirname + '/../../.bin/ngd';
            if (process.env.MODE && process.env.MODE === 'TESTING') {
                ngdPath = __dirname + '/../node_modules/.bin/ngd';
            }
            if (/ /g.test(ngdPath)) {
                ngdPath = ngdPath.replace(/ /g, '^ ');
            }
            var finalPath = path.resolve(ngdPath) + ' -' + type + ' ' + filepath + ' -d ' + outputpath + ' -s -t svg';
            Shelljs.exec(finalPath, {
                silent: true
            }, function (code, stdout, stderr) {
                if (code === 0) {
                    resolve$$1();
                }
                else {
                    reject(stderr);
                }
            });
        });
    };
    return NgdEngine;
}());

var lunr = require('lunr');
var cheerio = require('cheerio');
var Entities = require('html-entities').AllHtmlEntities;
var $configuration = Configuration.getInstance();
var Html = new Entities();
var SearchEngine = (function () {
    function SearchEngine() {
        this.documentsStore = {};
    }
    SearchEngine.prototype.getSearchIndex = function () {
        if (!this.searchIndex) {
            this.searchIndex = lunr(function () {
                this.ref('url');
                this.field('title', { boost: 10 });
                this.field('body');
            });
        }
        return this.searchIndex;
    };
    SearchEngine.prototype.indexPage = function (page) {
        var text, $ = cheerio.load(page.rawData);
        text = $('.content').html();
        text = Html.decode(text);
        text = text.replace(/(<([^>]+)>)/ig, '');
        page.url = page.url.replace($configuration.mainData.output, '');
        var doc = {
            url: page.url,
            title: page.infos.context + ' - ' + page.infos.name,
            body: text
        };
        this.documentsStore[doc.url] = doc;
        this.getSearchIndex().add(doc);
    };
    SearchEngine.prototype.generateSearchIndexJson = function (outputFolder) {
        fs.writeJson(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + 'search_index.json'), {
            index: this.getSearchIndex(),
            store: this.documentsStore
        }, function (err) {
            if (err) {
                logger.error('Error during search index file generation ', err);
            }
        });
    };
    return SearchEngine;
}());

var tsany = ts;
// https://github.com/Microsoft/TypeScript/blob/2.1/src/compiler/utilities.ts#L1507
function getJSDocs(node) {
    return tsany.getJSDocs.apply(this, arguments);
}

// get default new line break

function detectIndent(str, count, indent) {
    var stripIndent = function (str) {
        var match = str.match(/^[ \t]*(?=\S)/gm);
        if (!match) {
            return str;
        }
        // TODO: use spread operator when targeting Node.js 6
        var indent = Math.min.apply(Math, match.map(function (x) { return x.length; })); // eslint-disable-line
        var re = new RegExp("^[ \\t]{" + indent + "}", 'gm');
        return indent > 0 ? str.replace(re, '') : str;
    }, repeating = function (n, str) {
        str = str === undefined ? ' ' : str;
        if (typeof str !== 'string') {
            throw new TypeError("Expected `input` to be a `string`, got `" + typeof str + "`");
        }
        if (n < 0 || !Number.isFinite(n)) {
            throw new TypeError("Expected `count` to be a positive finite number, got `" + n + "`");
        }
        var ret = '';
        do {
            if (n & 1) {
                ret += str;
            }
            str += str;
        } while ((n >>= 1));
        return ret;
    }, indentString = function (str, count, indent) {
        indent = indent === undefined ? ' ' : indent;
        count = count === undefined ? 1 : count;
        if (typeof str !== 'string') {
            throw new TypeError("Expected `input` to be a `string`, got `" + typeof str + "`");
        }
        if (typeof count !== 'number') {
            throw new TypeError("Expected `count` to be a `number`, got `" + typeof count + "`");
        }
        if (typeof indent !== 'string') {
            throw new TypeError("Expected `indent` to be a `string`, got `" + typeof indent + "`");
        }
        if (count === 0) {
            return str;
        }
        indent = count > 1 ? repeating(count, indent) : indent;
        return str.replace(/^(?!\s*$)/mg, indent);
    };
    return indentString(stripIndent(str), count || 0, indent);
}
// Create a compilerHost object to allow the compiler to read and write files
function compilerHost(transpileOptions) {
    var inputFileName = transpileOptions.fileName || (transpileOptions.jsx ? 'module.tsx' : 'module.ts');
    var compilerHost = {
        getSourceFile: function (fileName) {
            if (fileName.lastIndexOf('.ts') !== -1) {
                if (fileName === 'lib.d.ts') {
                    return undefined;
                }
                if (path.isAbsolute(fileName) === false) {
                    fileName = path.join(transpileOptions.tsconfigDirectory, fileName);
                }
                var libSource = '';
                try {
                    libSource = fs.readFileSync(fileName).toString();
                }
                catch (e) {
                    logger.debug(e, fileName);
                }
                return ts.createSourceFile(fileName, libSource, transpileOptions.target, false);
            }
            return undefined;
        },
        writeFile: function (name, text) { },
        getDefaultLibFileName: function () { return 'lib.d.ts'; },
        useCaseSensitiveFileNames: function () { return false; },
        getCanonicalFileName: function (fileName) { return fileName; },
        getCurrentDirectory: function () { return ''; },
        getNewLine: function () { return '\n'; },
        fileExists: function (fileName) { return fileName === inputFileName; },
        readFile: function () { return ''; },
        directoryExists: function () { return true; },
        getDirectories: function () { return []; }
    };
    return compilerHost;
}

var RouterParser = (function () {
    var routes = [], modules = [], modulesTree, rootModule, modulesWithRoutes = [];
    return {
        addRoute: function (route) {
            routes.push(route);
            routes = _.sortBy(_.uniqWith(routes, _.isEqual), ['name']);
        },
        addModuleWithRoutes: function (moduleName, moduleImports) {
            modulesWithRoutes.push({
                name: moduleName,
                importsNode: moduleImports
            });
            modulesWithRoutes = _.sortBy(_.uniqWith(modulesWithRoutes, _.isEqual), ['name']);
        },
        addModule: function (moduleName, moduleImports) {
            modules.push({
                name: moduleName,
                importsNode: moduleImports
            });
            modules = _.sortBy(_.uniqWith(modules, _.isEqual), ['name']);
        },
        setRootModule: function (module) {
            rootModule = module;
        },
        printRoutes: function () {
            //console.log('');
            //console.log(routes);
        },
        hasRouterModuleInImports: function (imports) {
            var result = false, i = 0, len = imports.length;
            for (i; i < len; i++) {
                if (imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                    imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                    result = true;
                }
            }
            return result;
        },
        linkModulesAndRoutes: function () {
            //scan each module imports AST for each routes, and link routes with module
            var i = 0, len = modulesWithRoutes.length;
            for (i; i < len; i++) {
                _.forEach(modulesWithRoutes[i].importsNode, function (node) {
                    if (node.initializer) {
                        if (node.initializer.elements) {
                            _.forEach(node.initializer.elements, function (element) {
                                //find element with arguments
                                if (element.arguments) {
                                    _.forEach(element.arguments, function (argument) {
                                        _.forEach(routes, function (route) {
                                            if (argument.text && route.name === argument.text) {
                                                route.module = modulesWithRoutes[i].name;
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            }
        },
        constructRoutesTree: function () {
            //console.log('constructRoutesTree');
            // routes[] contains routes with module link
            // modulesTree contains modules tree
            // make a final routes tree with that
            var cleanModulesTree = _.cloneDeep(modulesTree), modulesCleaner = function (arr) {
                for (var i in arr) {
                    if (arr[i].importsNode) {
                        delete arr[i].importsNode;
                    }
                    if (arr[i].parent) {
                        delete arr[i].parent;
                    }
                    if (arr[i].children) {
                        modulesCleaner(arr[i].children);
                    }
                }
            };
            modulesCleaner(cleanModulesTree);
            //fs.outputJson('./modules.json', cleanModulesTree);
            console.log('');
            console.log('cleanModulesTree light: ', util.inspect(cleanModulesTree, { depth: 10 }));
            console.log('');
            var routesTree = {
                tag: '<root>',
                kind: 'ngModule',
                name: rootModule,
                children: []
            };
            var foundRouteWithModuleName = function (moduleName) {
                return _.find(routes, { 'module': moduleName });
            };
            var loopModulesParser = function (node) {
                for (var i in node.children) {
                    var route = foundRouteWithModuleName(node.children[i].name);
                    if (route) {
                        route.routes = JSON.parse(route.data);
                        delete route.data;
                        route.kind = 'ngModule';
                        routesTree.children.push(route);
                    }
                    if (node.children[i].children) {
                        loopModulesParser(node.children[i]);
                    }
                }
            };
            loopModulesParser(_.find(cleanModulesTree, { 'name': rootModule }));
            console.log('');
            console.log('routesTree: ', routesTree);
            console.log('');
            //fs.outputJson('./routes-tree.json', routesTree);
            var cleanedRoutesTree;
            var cleanRoutesTree = function (route) {
                for (var i in route.children) {
                    var routes = route.children[i].routes;
                    console.log(routes);
                }
                return route;
            };
            cleanedRoutesTree = cleanRoutesTree(routesTree);
            console.log('');
            console.log('cleanedRoutesTree: ', util.inspect(cleanedRoutesTree, { depth: 10 }));
        },
        constructModulesTree: function () {
            var getNestedChildren = function (arr, parent) {
                var out = [];
                for (var i in arr) {
                    if (arr[i].parent === parent) {
                        var children = getNestedChildren(arr, arr[i].name);
                        if (children.length) {
                            arr[i].children = children;
                        }
                        out.push(arr[i]);
                    }
                }
                return out;
            };
            //Scan each module and add parent property
            _.forEach(modules, function (firstLoopModule) {
                _.forEach(firstLoopModule.importsNode, function (importNode) {
                    _.forEach(modules, function (module) {
                        if (module.name === importNode.name) {
                            module.parent = firstLoopModule.name;
                        }
                    });
                });
            });
            modulesTree = getNestedChildren(modules);
        }
    };
})();

var code = [];
var gen = (function () {
    var tmp = [];
    return function (token) {
        if (token === void 0) { token = null; }
        if (!token) {
            //console.log(' ! token');
            return code;
        }
        else if (token === '\n') {
            //console.log(' \n');
            code.push(tmp.join(''));
            tmp = [];
        }
        else {
            code.push(token);
        }
        return code;
    };
}());
function generate(node) {
    code = [];
    visitAndRecognize(node);
    return code.join('');
}
function visitAndRecognize(node, depth) {
    if (depth === void 0) { depth = 0; }
    recognize(node);
    depth++;
    node.getChildren().forEach(function (c) { return visitAndRecognize(c, depth); });
}
function recognize(node) {
    //console.log('recognizing...', ts.SyntaxKind[node.kind+'']);
    switch (node.kind) {
        case ts.SyntaxKind.FirstLiteralToken:
        case ts.SyntaxKind.Identifier:
            gen('\"');
            gen(node.text);
            gen('\"');
            break;
        case ts.SyntaxKind.StringLiteral:
            gen('\"');
            gen(node.text);
            gen('\"');
            break;
        case ts.SyntaxKind.ArrayLiteralExpression:
            break;
        case ts.SyntaxKind.ImportKeyword:
            gen('import');
            gen(' ');
            break;
        case ts.SyntaxKind.FromKeyword:
            gen('from');
            gen(' ');
            break;
        case ts.SyntaxKind.ExportKeyword:
            gen('\n');
            gen('export');
            gen(' ');
            break;
        case ts.SyntaxKind.ClassKeyword:
            gen('class');
            gen(' ');
            break;
        case ts.SyntaxKind.ThisKeyword:
            gen('this');
            break;
        case ts.SyntaxKind.ConstructorKeyword:
            gen('constructor');
            break;
        case ts.SyntaxKind.FalseKeyword:
            gen('false');
            break;
        case ts.SyntaxKind.TrueKeyword:
            gen('true');
            break;
        case ts.SyntaxKind.NullKeyword:
            gen('null');
            break;
        case ts.SyntaxKind.AtToken:
            break;
        case ts.SyntaxKind.PlusToken:
            gen('+');
            break;
        case ts.SyntaxKind.EqualsGreaterThanToken:
            gen(' => ');
            break;
        case ts.SyntaxKind.OpenParenToken:
            gen('(');
            break;
        case ts.SyntaxKind.ImportClause:
        case ts.SyntaxKind.ObjectLiteralExpression:
            gen('{');
            gen(' ');
            break;
        case ts.SyntaxKind.Block:
            gen('{');
            gen('\n');
            break;
        case ts.SyntaxKind.CloseBraceToken:
            gen('}');
            break;
        case ts.SyntaxKind.CloseParenToken:
            gen(')');
            break;
        case ts.SyntaxKind.OpenBracketToken:
            gen('[');
            break;
        case ts.SyntaxKind.CloseBracketToken:
            gen(']');
            break;
        case ts.SyntaxKind.SemicolonToken:
            gen(';');
            gen('\n');
            break;
        case ts.SyntaxKind.CommaToken:
            gen(',');
            gen(' ');
            break;
        case ts.SyntaxKind.ColonToken:
            gen(' ');
            gen(':');
            gen(' ');
            break;
        case ts.SyntaxKind.DotToken:
            gen('.');
            break;
        case ts.SyntaxKind.DoStatement:
            break;
        case ts.SyntaxKind.Decorator:
            break;
        case ts.SyntaxKind.FirstAssignment:
            gen(' = ');
            break;
        case ts.SyntaxKind.FirstPunctuation:
            gen(' ');
            break;
        case ts.SyntaxKind.PrivateKeyword:
            gen('private');
            gen(' ');
            break;
        case ts.SyntaxKind.PublicKeyword:
            gen('public');
            gen(' ');
            break;
        default:
            break;
    }
}

var Dependencies = (function () {
    function Dependencies(files, options) {
        this.__cache = {};
        this.__nsModule = {};
        this.unknown = '???';
        this.files = files;
        var transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
    }
    Dependencies.prototype.breakLines = function (text) {
        var _t = text;
        if (typeof _t !== 'undefined') {
            _t = _t.replace(/(\n)/gm, '<br>');
            _t = _t.replace(/(<br>)$/gm, '');
        }
        return _t;
    };
    Dependencies.prototype.getDependencies = function () {
        var _this = this;
        var deps = {
            'modules': [],
            'components': [],
            'injectables': [],
            'pipes': [],
            'directives': [],
            'routes': [],
            'classes': [],
            'interfaces': []
        };
        var sourceFiles = this.program.getSourceFiles() || [];
        sourceFiles.map(function (file) {
            var filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    logger.info('parsing', filePath);
                    try {
                        _this.getSourceFileDecorators(file, deps);
                    }
                    catch (e) {
                        logger.error(e, file.fileName);
                    }
                }
            }
            return deps;
        });
        //RouterParser.linkModulesAndRoutes();
        //RouterParser.constructModulesTree();
        //RouterParser.constructRoutesTree();
        return deps;
    };
    Dependencies.prototype.getSourceFileDecorators = function (srcFile, outputSymbols) {
        var _this = this;
        var cleaner = (process.cwd() + path.sep).replace(/\\/g, '/');
        var file = srcFile.fileName.replace(cleaner, '');
        this.programComponent = ts.createProgram([file], {});
        var sourceFile = this.programComponent.getSourceFile(file);
        this.typeCheckerComponent = this.programComponent.getTypeChecker(true);
        ts.forEachChild(srcFile, function (node) {
            var deps = {};
            if (node.decorators) {
                var visitNode = function (visitedNode, index) {
                    var metadata = node.decorators.pop();
                    var name = _this.getSymboleName(node);
                    var props = _this.findProps(visitedNode);
                    var IO = _this.getComponentIO(file, sourceFile);
                    if (_this.isModule(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            providers: _this.getModuleProviders(props),
                            declarations: _this.getModuleDeclations(props),
                            imports: _this.getModuleImports(props),
                            exports: _this.getModuleExports(props),
                            bootstrap: _this.getModuleBootstrap(props),
                            type: 'module',
                            description: _this.breakLines(IO.description),
                            sourceCode: sourceFile.getText()
                        };
                        if (RouterParser.hasRouterModuleInImports(deps.imports)) {
                            RouterParser.addModuleWithRoutes(name, _this.getModuleImportsRaw(props));
                        }
                        RouterParser.addModule(name, deps.imports);
                        outputSymbols['modules'].push(deps);
                    }
                    else if (_this.isComponent(metadata)) {
                        if (props.length === 0)
                            return;
                        //console.log(util.inspect(props, { showHidden: true, depth: 10 }));
                        deps = {
                            name: name,
                            file: file,
                            //animations?: string[]; // TODO
                            changeDetection: _this.getComponentChangeDetection(props),
                            encapsulation: _this.getComponentEncapsulation(props),
                            //entryComponents?: string; // TODO waiting doc infos
                            exportAs: _this.getComponentExportAs(props),
                            host: _this.getComponentHost(props),
                            inputs: _this.getComponentInputsMetadata(props),
                            //interpolation?: string; // TODO waiting doc infos
                            moduleId: _this.getComponentModuleId(props),
                            outputs: _this.getComponentOutputs(props),
                            providers: _this.getComponentProviders(props),
                            //queries?: Deps[]; // TODO
                            selector: _this.getComponentSelector(props),
                            styleUrls: _this.getComponentStyleUrls(props),
                            styles: _this.getComponentStyles(props),
                            template: _this.getComponentTemplate(props),
                            templateUrl: _this.getComponentTemplateUrl(props),
                            viewProviders: _this.getComponentViewProviders(props),
                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,
                            propertiesClass: IO.properties,
                            methodsClass: IO.methods,
                            description: _this.breakLines(IO.description),
                            type: 'component',
                            sourceCode: sourceFile.getText()
                        };
                        outputSymbols['components'].push(deps);
                    }
                    else if (_this.isInjectable(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            type: 'injectable',
                            properties: IO.properties,
                            methods: IO.methods,
                            description: _this.breakLines(IO.description),
                            sourceCode: sourceFile.getText()
                        };
                        outputSymbols['injectables'].push(deps);
                    }
                    else if (_this.isPipe(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            type: 'pipe',
                            description: _this.breakLines(IO.description),
                            sourceCode: sourceFile.getText()
                        };
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (_this.isDirective(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            type: 'directive',
                            description: _this.breakLines(IO.description),
                            sourceCode: sourceFile.getText()
                        };
                        outputSymbols['directives'].push(deps);
                    }
                    _this.debug(deps);
                    _this.__cache[name] = deps;
                };
                var filterByDecorators = function (node) {
                    if (node.expression && node.expression.expression) {
                        return /(NgModule|Component|Injectable|Pipe|Directive)/.test(node.expression.expression.text);
                    }
                    return false;
                };
                node.decorators
                    .filter(filterByDecorators)
                    .forEach(visitNode);
            }
            else if (node.symbol) {
                if (node.symbol.flags === ts.SymbolFlags.Class) {
                    var name = _this.getSymboleName(node);
                    var IO = _this.getComponentIO(file, sourceFile);
                    deps = {
                        name: name,
                        file: file,
                        type: 'class',
                        sourceCode: sourceFile.getText()
                    };
                    if (IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if (IO.description) {
                        deps.description = _this.breakLines(IO.description);
                    }
                    if (IO.methods) {
                        deps.methods = IO.methods;
                    }
                    _this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                else if (node.symbol.flags === ts.SymbolFlags.Interface) {
                    var name = _this.getSymboleName(node);
                    var IO = _this.getInterfaceIO(file, sourceFile, node);
                    deps = {
                        name: name,
                        file: file,
                        type: 'interface',
                        sourceCode: sourceFile.getText()
                    };
                    if (IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if (IO.kind) {
                        deps.kind = IO.kind;
                    }
                    if (IO.description) {
                        deps.description = _this.breakLines(IO.description);
                    }
                    if (IO.methods) {
                        deps.methods = IO.methods;
                    }
                    _this.debug(deps);
                    outputSymbols['interfaces'].push(deps);
                }
            }
            else {
                var IO = _this.getRouteIO(file, sourceFile);
                if (IO.routes) {
                    var newRoutes = void 0;
                    try {
                        newRoutes = JSON.parse(IO.routes.replace(/ /gm, ''));
                    }
                    catch (e) {
                        logger.error('Routes parsing error, maybe a trailing comma or an external variable ?');
                        return true;
                    }
                    outputSymbols['routes'] = outputSymbols['routes'].concat(newRoutes);
                }
                if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                    var name = _this.getSymboleName(node);
                    var IO_1 = _this.getComponentIO(file, sourceFile);
                    deps = {
                        name: name,
                        file: file,
                        type: 'class',
                        sourceCode: sourceFile.getText()
                    };
                    if (IO_1.properties) {
                        deps.properties = IO_1.properties;
                    }
                    if (IO_1.description) {
                        deps.description = _this.breakLines(IO_1.description);
                    }
                    if (IO_1.methods) {
                        deps.methods = IO_1.methods;
                    }
                    _this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                    //Find the root module with bootstrapModule call
                    //Find recusively in expression nodes one with name 'bootstrapModule'
                    var rootModule_1, resultNode = _this.findExpressionByName(node, 'bootstrapModule');
                    if (resultNode) {
                        if (resultNode.arguments.length > 0) {
                            _.forEach(resultNode.arguments, function (argument) {
                                if (argument.text) {
                                    rootModule_1 = argument.text;
                                }
                            });
                        }
                        if (rootModule_1) {
                            RouterParser.setRootModule(rootModule_1);
                        }
                    }
                }
            }
        });
    };
    Dependencies.prototype.debug = function (deps) {
        logger.debug('debug', deps.name + ":");
        [
            'imports', 'exports', 'declarations', 'providers', 'bootstrap'
        ].forEach(function (symbols) {
            if (deps[symbols] && deps[symbols].length > 0) {
                logger.debug('', "- " + symbols + ":");
                deps[symbols].map(function (i) { return i.name; }).forEach(function (d) {
                    logger.debug('', "\t- " + d);
                });
            }
        });
    };
    Dependencies.prototype.findExpressionByName = function (entryNode, name) {
        var result, loop = function (node, name) {
            if (node.expression && !node.expression.name) {
                loop(node.expression, name);
            }
            if (node.expression && node.expression.name) {
                if (node.expression.name.text === name) {
                    result = node;
                }
            }
        };
        loop(entryNode, name);
        return result;
    };
    Dependencies.prototype.isComponent = function (metadata) {
        return metadata.expression.expression.text === 'Component';
    };
    Dependencies.prototype.isPipe = function (metadata) {
        return metadata.expression.expression.text === 'Pipe';
    };
    Dependencies.prototype.isDirective = function (metadata) {
        return metadata.expression.expression.text === 'Directive';
    };
    Dependencies.prototype.isInjectable = function (metadata) {
        return metadata.expression.expression.text === 'Injectable';
    };
    Dependencies.prototype.isModule = function (metadata) {
        return metadata.expression.expression.text === 'NgModule';
    };
    Dependencies.prototype.getType = function (name) {
        var type;
        if (name.toLowerCase().indexOf('component') !== -1) {
            type = 'component';
        }
        else if (name.toLowerCase().indexOf('pipe') !== -1) {
            type = 'pipe';
        }
        else if (name.toLowerCase().indexOf('module') !== -1) {
            type = 'module';
        }
        else if (name.toLowerCase().indexOf('directive') !== -1) {
            type = 'directive';
        }
        return type;
    };
    Dependencies.prototype.getSymboleName = function (node) {
        return node.name.text;
    };
    Dependencies.prototype.getComponentSelector = function (props) {
        return this.getSymbolDeps(props, 'selector').pop();
    };
    Dependencies.prototype.getComponentExportAs = function (props) {
        return this.getSymbolDeps(props, 'exportAs').pop();
    };
    Dependencies.prototype.getModuleProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'providers').map(function (providerName) {
            return _this.parseDeepIndentifier(providerName);
        });
    };
    Dependencies.prototype.findProps = function (visitedNode) {
        if (visitedNode.expression.arguments.length > 0) {
            return visitedNode.expression.arguments.pop().properties;
        }
        else {
            return '';
        }
    };
    Dependencies.prototype.getModuleDeclations = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'declarations').map(function (name) {
            var component = _this.findComponentSelectorByName(name);
            if (component) {
                return component;
            }
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getModuleImportsRaw = function (props) {
        return this.getSymbolDepsRaw(props, 'imports');
    };
    Dependencies.prototype.getModuleImports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'imports').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getModuleExports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'exports').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentHost = function (props) {
        return this.getSymbolDepsObject(props, 'host');
    };
    Dependencies.prototype.getModuleBootstrap = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'bootstrap').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentInputsMetadata = function (props) {
        return this.getSymbolDeps(props, 'inputs');
    };
    Dependencies.prototype.getDecoratorOfType = function (node, decoratorType) {
        var decorators = node.decorators || [];
        for (var i = 0; i < decorators.length; i++) {
            if (decorators[i].expression.expression.text === decoratorType) {
                return decorators[i];
            }
        }
        return null;
    };
    Dependencies.prototype.visitInput = function (property, inDecorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inArgs = inDecorator.expression.arguments;
        return {
            name: inArgs.length ? inArgs[0].text : property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            type: this.visitType(property),
            description: marked__default(ts.displayPartsToString(property.symbol.getDocumentationComment()))
        };
    };
    Dependencies.prototype.visitType = function (node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return node ? this.typeCheckerComponent.typeToString(this.typeCheckerComponent.getTypeAtLocation(node)) : 'void';
    };
    Dependencies.prototype.visitOutput = function (property, outDecorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var outArgs = outDecorator.expression.arguments;
        return {
            name: outArgs.length ? outArgs[0].text : property.name.text,
            description: marked__default(ts.displayPartsToString(property.symbol.getDocumentationComment()))
        };
    };
    Dependencies.prototype.isPublic = function (member) {
        if (member.modifiers) {
            var isPublic = member.modifiers.some(function (modifier) {
                return modifier.kind === ts.SyntaxKind.PublicKeyword;
            });
            if (isPublic) {
                return true;
            }
        }
        return this.isInternalMember(member);
    };
    Dependencies.prototype.isPrivateOrInternal = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (member.modifiers) {
            var isPrivate = member.modifiers.some(function (modifier) { return modifier.kind === ts.SyntaxKind.PrivateKeyword; });
            if (isPrivate) {
                return true;
            }
        }
        return this.isInternalMember(member);
    };
    Dependencies.prototype.isInternalMember = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var internalTags = ['internal', 'private', 'hidden'];
        if (member.jsDoc) {
            for (var _i = 0, _a = member.jsDoc; _i < _a.length; _i++) {
                var doc = _a[_i];
                if (doc.tags) {
                    for (var _b = 0, _c = doc.tags; _b < _c.length; _b++) {
                        var tag = _c[_b];
                        if (internalTags.indexOf(tag.tagName.text) > -1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    Dependencies.prototype.isAngularLifecycleHook = function (methodName) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var ANGULAR_LIFECYCLE_METHODS = [
            'ngOnInit', 'ngOnChanges', 'ngDoCheck', 'ngOnDestroy', 'ngAfterContentInit', 'ngAfterContentChecked',
            'ngAfterViewInit', 'ngAfterViewChecked', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'
        ];
        return ANGULAR_LIFECYCLE_METHODS.indexOf(methodName) >= 0;
    };
    Dependencies.prototype.visitConstructorDeclaration = function (method) {
        var that = this;
        if (method.parameters) {
            var _parameters = [], i = 0, len = method.parameters.length;
            for (i; i < len; i++) {
                if (that.isPublic(method.parameters[i])) {
                    _parameters.push(that.visitArgument(method.parameters[i]));
                }
            }
            return _parameters;
        }
        else {
            return [];
        }
    };
    Dependencies.prototype.visitCallDeclaration = function (method) {
        var _this = this;
        return {
            description: marked__default(ts.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type)
        };
    };
    Dependencies.prototype.visitIndexDeclaration = function (method) {
        var _this = this;
        return {
            description: marked__default(ts.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type)
        };
    };
    Dependencies.prototype.visitMethodDeclaration = function (method) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: method.name.text,
            description: marked__default(ts.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type)
        }, jsdoctags = getJSDocs(method);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = jsdoctags[0].tags;
            }
        }
        return result;
    };
    Dependencies.prototype.visitArgument = function (arg) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return {
            name: arg.name.text,
            type: this.visitType(arg)
        };
    };
    Dependencies.prototype.getNamesCompareFn = function (name) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        name = name || 'name';
        return function (a, b) { return a[name].localeCompare(b[name]); };
    };
    Dependencies.prototype.stringifyDefaultValue = function (node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (node.text) {
            return node.text;
        }
        else if (node.kind === ts.SyntaxKind.FalseKeyword) {
            return 'false';
        }
        else if (node.kind === ts.SyntaxKind.TrueKeyword) {
            return 'true';
        }
    };
    Dependencies.prototype.visitProperty = function (property) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return {
            name: property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            type: this.visitType(property),
            description: marked__default(ts.displayPartsToString(property.symbol.getDocumentationComment()))
        };
    };
    Dependencies.prototype.visitMembers = function (members) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inputs = [];
        var outputs = [];
        var methods = [];
        var properties = [];
        var kind;
        var inputDecorator, outDecorator;
        for (var i = 0; i < members.length; i++) {
            inputDecorator = this.getDecoratorOfType(members[i], 'Input');
            outDecorator = this.getDecoratorOfType(members[i], 'Output');
            kind = members[i].kind;
            if (inputDecorator) {
                inputs.push(this.visitInput(members[i], inputDecorator));
            }
            else if (outDecorator) {
                outputs.push(this.visitOutput(members[i], outDecorator));
            }
            else if (!this.isPrivateOrInternal(members[i])) {
                if ((members[i].kind === ts.SyntaxKind.MethodDeclaration ||
                    members[i].kind === ts.SyntaxKind.MethodSignature) &&
                    !this.isAngularLifecycleHook(members[i].name.text)) {
                    methods.push(this.visitMethodDeclaration(members[i]));
                }
                else if (members[i].kind === ts.SyntaxKind.PropertyDeclaration ||
                    members[i].kind === ts.SyntaxKind.PropertySignature || members[i].kind === ts.SyntaxKind.GetAccessor) {
                    properties.push(this.visitProperty(members[i]));
                }
                else if (members[i].kind === ts.SyntaxKind.CallSignature) {
                    properties.push(this.visitCallDeclaration(members[i]));
                }
                else if (members[i].kind === ts.SyntaxKind.IndexSignature) {
                    properties.push(this.visitIndexDeclaration(members[i]));
                }
                else if (members[i].kind === ts.SyntaxKind.Constructor) {
                    var _constructorProperties = this.visitConstructorDeclaration(members[i]), j = 0, len = _constructorProperties.length;
                    for (j; j < len; j++) {
                        properties.push(_constructorProperties[j]);
                    }
                }
            }
        }
        inputs.sort(this.getNamesCompareFn());
        outputs.sort(this.getNamesCompareFn());
        properties.sort(this.getNamesCompareFn());
        return {
            inputs: inputs,
            outputs: outputs,
            methods: methods,
            properties: properties,
            kind: kind
        };
    };
    Dependencies.prototype.visitDirectiveDecorator = function (decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var selector;
        var exportAs;
        var properties = decorator.expression.arguments[0].properties;
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].name.text === 'selector') {
                // TODO: this will only work if selector is initialized as a string literal
                selector = properties[i].initializer.text;
            }
            if (properties[i].name.text === 'exportAs') {
                // TODO: this will only work if selector is initialized as a string literal
                exportAs = properties[i].initializer.text;
            }
        }
        return {
            selector: selector,
            exportAs: exportAs
        };
    };
    Dependencies.prototype.isPipeDecorator = function (decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return decorator.expression.expression.text === 'Pipe';
    };
    Dependencies.prototype.isModuleDecorator = function (decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return decorator.expression.expression.text === 'NgModule';
    };
    Dependencies.prototype.isDirectiveDecorator = function (decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var decoratorIdentifierText = decorator.expression.expression.text;
        return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
    };
    Dependencies.prototype.isServiceDecorator = function (decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return decorator.expression.expression.text === 'Injectable';
    };
    Dependencies.prototype.visitClassDeclaration = function (fileName, classDeclaration) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var symbol = this.program.getTypeChecker().getSymbolAtLocation(classDeclaration.name);
        var description = marked__default(ts.displayPartsToString(symbol.getDocumentationComment()));
        var className = classDeclaration.name.text;
        var directiveInfo;
        var members;
        if (classDeclaration.decorators) {
            for (var i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    directiveInfo = this.visitDirectiveDecorator(classDeclaration.decorators[i]);
                    members = this.visitMembers(classDeclaration.members);
                    return {
                        description: description,
                        inputs: members.inputs,
                        outputs: members.outputs,
                        properties: members.properties,
                        methods: members.methods,
                        kind: members.kind
                    };
                }
                else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                    members = this.visitMembers(classDeclaration.members);
                    return [{
                            fileName: fileName,
                            className: className,
                            description: description,
                            methods: members.methods,
                            properties: members.properties,
                            kind: members.kind
                        }];
                }
                else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                    return [{
                            fileName: fileName,
                            className: className,
                            description: description
                        }];
                }
            }
        }
        else if (description) {
            members = this.visitMembers(classDeclaration.members);
            return [{
                    description: description,
                    methods: members.methods,
                    properties: members.properties,
                    kind: members.kind
                }];
        }
        else {
            members = this.visitMembers(classDeclaration.members);
            return [{
                    methods: members.methods,
                    properties: members.properties,
                    kind: members.kind
                }];
        }
        return [];
    };
    Dependencies.prototype.visitEnumDeclaration = function (fileName, node) {
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        RouterParser.addRoute({
                            name: node.declarationList.declarations[i].name.text,
                            data: generate(node.declarationList.declarations[i].initializer)
                        });
                        return [{
                                routes: generate(node.declarationList.declarations[i].initializer)
                            }];
                    }
                }
            }
        }
        return [];
    };
    Dependencies.prototype.getRouteIO = function (filename, sourceFile) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts.SyntaxKind.VariableStatement) {
                return directive.concat(_this.visitEnumDeclaration(filename, statement));
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getComponentIO = function (filename, sourceFile) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                return directive.concat(_this.visitClassDeclaration(filename, statement));
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getInterfaceIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts.SyntaxKind.InterfaceDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getComponentOutputs = function (props) {
        return this.getSymbolDeps(props, 'outputs');
    };
    Dependencies.prototype.getComponentProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'providers').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentViewProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'viewProviders').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Dependencies.prototype.getComponentDirectives = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'directives').map(function (name) {
            var identifier = _this.parseDeepIndentifier(name);
            identifier.selector = _this.findComponentSelectorByName(name);
            identifier.label = '';
            return identifier;
        });
    };
    Dependencies.prototype.parseDeepIndentifier = function (name) {
        var nsModule = name.split('.'), type = this.getType(name);
        if (nsModule.length > 1) {
            // cache deps with the same namespace (i.e Shared.*)
            if (this.__nsModule[nsModule[0]]) {
                this.__nsModule[nsModule[0]].push(name);
            }
            else {
                this.__nsModule[nsModule[0]] = [name];
            }
            return {
                ns: nsModule[0],
                name: name,
                type: type
            };
        }
        return {
            name: name,
            type: type
        };
    };
    Dependencies.prototype.getComponentTemplateUrl = function (props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
    };
    Dependencies.prototype.getComponentTemplate = function (props) {
        var t = this.getSymbolDeps(props, 'template', true).pop();
        if (t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    };
    Dependencies.prototype.getComponentStyleUrls = function (props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
    };
    Dependencies.prototype.getComponentStyles = function (props) {
        return this.getSymbolDeps(props, 'styles');
    };
    Dependencies.prototype.getComponentModuleId = function (props) {
        return this.getSymbolDeps(props, 'moduleId').pop();
    };
    Dependencies.prototype.getComponentChangeDetection = function (props) {
        return this.getSymbolDeps(props, 'changeDetection').pop();
    };
    Dependencies.prototype.getComponentEncapsulation = function (props) {
        return this.getSymbolDeps(props, 'encapsulation');
    };
    Dependencies.prototype.sanitizeUrls = function (urls) {
        return urls.map(function (url) { return url.replace('./', ''); });
    };
    Dependencies.prototype.getSymbolDepsObject = function (props, type, multiLine) {
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        var parseProperties = function (node) {
            var obj = {};
            (node.initializer.properties || []).forEach(function (prop) {
                obj[prop.name.text] = prop.initializer.text;
            });
            return obj;
        };
        return deps.map(parseProperties).pop();
    };
    Dependencies.prototype.getSymbolDepsRaw = function (props, type, multiLine) {
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        return deps || [];
    };
    Dependencies.prototype.getSymbolDeps = function (props, type, multiLine) {
        var _this = this;
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        var parseSymbolText = function (text) {
            if (text.indexOf('/') !== -1 && !multiLine) {
                text = text.split('/').pop();
            }
            return [
                text
            ];
        };
        var buildIdentifierName = function (node, name) {
            if (name === void 0) { name = ''; }
            if (node.expression) {
                name = name ? "." + name : name;
                var nodeName = _this.unknown;
                if (node.name) {
                    nodeName = node.name.text;
                }
                else if (node.text) {
                    nodeName = node.text;
                }
                else if (node.expression) {
                    if (node.expression.text) {
                        nodeName = node.expression.text;
                    }
                    else if (node.expression.elements) {
                        if (node.expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                            nodeName = node.expression.elements.map(function (el) { return el.text; }).join(', ');
                            nodeName = "[" + nodeName + "]";
                        }
                    }
                }
                if (node.kind === ts.SyntaxKind.SpreadElementExpression) {
                    return "..." + nodeName;
                }
                return "" + buildIdentifierName(node.expression, nodeName) + name;
            }
            return node.text + "." + name;
        };
        var parseProviderConfiguration = function (o) {
            // parse expressions such as:
            // { provide: APP_BASE_HREF, useValue: '/' },
            // or
            // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }
            var _genProviderName = [];
            var _providerProps = [];
            (o.properties || []).forEach(function (prop) {
                var identifier = prop.initializer.text;
                if (prop.initializer.kind === ts.SyntaxKind.StringLiteral) {
                    identifier = "'" + identifier + "'";
                }
                // lambda function (i.e useFactory)
                if (prop.initializer.body) {
                    var params = (prop.initializer.parameters || []).map(function (params) { return params.name.text; });
                    identifier = "(" + params.join(', ') + ") => {}";
                }
                else if (prop.initializer.elements) {
                    var elements = (prop.initializer.elements || []).map(function (n) {
                        if (n.kind === ts.SyntaxKind.StringLiteral) {
                            return "'" + n.text + "'";
                        }
                        return n.text;
                    });
                    identifier = "[" + elements.join(', ') + "]";
                }
                _providerProps.push([
                    // i.e provide
                    prop.name.text,
                    // i.e OpaqueToken or 'StringToken'
                    identifier
                ].join(': '));
            });
            return "{ " + _providerProps.join(', ') + " }";
        };
        var parseSymbolElements = function (o) {
            // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
            if (o.arguments) {
                var className = buildIdentifierName(o.expression);
                // function arguments could be really complexe. There are so
                // many use cases that we can't handle. Just print "args" to indicate
                // that we have arguments.
                var functionArgs = o.arguments.length > 0 ? 'args' : '';
                var text = className + "(" + functionArgs + ")";
                return text;
            }
            else if (o.expression) {
                var identifier = buildIdentifierName(o);
                return identifier;
            }
            return o.text ? o.text : parseProviderConfiguration(o);
        };
        var parseSymbols = function (node) {
            var text = node.initializer.text;
            if (text) {
                return parseSymbolText(text);
            }
            else if (node.initializer.expression) {
                var identifier = parseSymbolElements(node.initializer);
                return [
                    identifier
                ];
            }
            else if (node.initializer.elements) {
                return node.initializer.elements.map(parseSymbolElements);
            }
        };
        return deps.map(parseSymbols).pop() || [];
    };
    Dependencies.prototype.findComponentSelectorByName = function (name) {
        return this.__cache[name];
    };
    return Dependencies;
}());

var glob = require('glob');
var pkg = require('../package.json');
var cwd = process.cwd();
var $htmlengine = new HtmlEngine();
var $fileengine = new FileEngine();
var $markdownengine = new MarkdownEngine();
var $ngdengine = new NgdEngine();
var $searchEngine = new SearchEngine();
var startTime = new Date();
var Application = (function () {
    /**
     * Create a new compodoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    function Application(options) {
        var _this = this;
        this.preparePipes = function () {
            logger.info('Prepare pipes');
            _this.configuration.mainData.pipes = $dependenciesEngine.getPipes();
            var i = 0, len = _this.configuration.mainData.pipes.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'pipes',
                    name: _this.configuration.mainData.pipes[i].name,
                    context: 'pipe',
                    pipe: _this.configuration.mainData.pipes[i]
                });
            }
        };
        this.prepareClasses = function () {
            logger.info('Prepare classes');
            _this.configuration.mainData.classes = $dependenciesEngine.getClasses();
            var i = 0, len = _this.configuration.mainData.classes.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'classes',
                    name: _this.configuration.mainData.classes[i].name,
                    context: 'class',
                    class: _this.configuration.mainData.classes[i]
                });
            }
        };
        this.prepareDirectives = function () {
            logger.info('Prepare directives');
            _this.configuration.mainData.directives = $dependenciesEngine.getDirectives();
            var i = 0, len = _this.configuration.mainData.directives.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'directives',
                    name: _this.configuration.mainData.directives[i].name,
                    context: 'directive',
                    directive: _this.configuration.mainData.directives[i]
                });
            }
        };
        this.configuration = Configuration.getInstance();
        for (var option in options) {
            if (typeof this.configuration.mainData[option] !== 'undefined') {
                this.configuration.mainData[option] = options[option];
            }
        }
    }
    /**
     * Start compodoc
     */
    Application.prototype.generate = function () {
        var _this = this;
        $htmlengine.init().then(function () {
            _this.processPackageJson();
        });
    };
    Application.prototype.setFiles = function (files) {
        this.files = files;
    };
    Application.prototype.processPackageJson = function () {
        var _this = this;
        logger.info('Searching package.json file');
        $fileengine.get('package.json').then(function (packageData) {
            var parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined' && _this.configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title) {
                _this.configuration.mainData.documentationMainName = parsedData.name + ' documentation';
            }
            if (typeof parsedData.description !== 'undefined') {
                _this.configuration.mainData.documentationMainDescription = parsedData.description;
            }
            logger.info('package.json file found');
            _this.processMarkdown();
        }, function (errorMessage) {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            _this.processMarkdown();
        });
    };
    Application.prototype.processMarkdown = function () {
        var _this = this;
        logger.info('Searching README.md file');
        $markdownengine.getReadmeFile().then(function (readmeData) {
            _this.configuration.addPage({
                name: 'index',
                context: 'readme'
            });
            _this.configuration.addPage({
                name: 'overview',
                context: 'overview'
            });
        }
    }, {
        key: 'getDependenciesData',
        value: function getDependenciesData() {
            var _this5 = this;

            logger.info('Get dependencies data');
            var crawler = new Dependencies(this.files, {
                tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)

            });
            _this.getDependenciesData();
        });
    };
    Application.prototype.getDependenciesData = function () {
        var _this = this;
        logger.info('Get dependencies data');
        var crawler = new Dependencies(this.files, {
            tsconfigDirectory: cwd
        });
        var dependenciesData = crawler.getDependencies();
        $dependenciesEngine.init(dependenciesData);
        //RouterParser.printRoutes();
        this.prepareModules();
        this.prepareComponents().then(function (readmeData) {
            if ($dependenciesEngine.directives.length > 0) {
                _this.prepareDirectives();
            }
            if ($dependenciesEngine.injectables.length > 0) {
                _this.prepareInjectables();
            }
            if ($dependenciesEngine.routes.length > 0) {
                _this.prepareRoutes();
            }
            if ($dependenciesEngine.pipes.length > 0) {
                _this.preparePipes();
            }
            if ($dependenciesEngine.classes.length > 0) {
                _this.prepareClasses();
            }
            if ($dependenciesEngine.interfaces.length > 0) {
                _this.prepareInterfaces();
            }
            if (!_this.configuration.mainData.disableCoverage) {
                _this.prepareCoverage();
            }
            _this.processPages();
        }, function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.prepareModules = function () {
        logger.info('Prepare modules');
        this.configuration.mainData.modules = $dependenciesEngine.getModules();
        this.configuration.addPage({
            name: 'modules',
            context: 'modules'
        });
        var i = 0, len = this.configuration.mainData.modules.length;
        for (i; i < len; i++) {
            this.configuration.addPage({
                path: 'modules',
                name: this.configuration.mainData.modules[i].name,
                context: 'module',
                module: this.configuration.mainData.modules[i]
            });
        }

    }, {
        key: 'prepareModules',
        value: function prepareModules() {
            logger.info('Prepare modules');
            this.configuration.mainData.modules = $dependenciesEngine.getModules().map(function (ngModule) {
                ['declarations', 'bootstrap', 'imports', 'exports'].forEach(function (metadataType) {
                    ngModule[metadataType] = ngModule[metadataType].filter(function (metaDataItem) {
                        switch (metaDataItem.type) {
                            case 'directive':
                                return $dependenciesEngine.getDirectives().some(function (directive) {
                                    return directive.name === metaDataItem.name;
                                });
                            case 'component':
                                return $dependenciesEngine.getComponents().some(function (component) {
                                    return component.name === metaDataItem.name;
                                });
                            case 'module':
                                return $dependenciesEngine.getModules().some(function (module) {
                                    return module.name === metaDataItem.name;
                                });
                            case 'pipe':
                                return $dependenciesEngine.getPipes().some(function (pipe) {
                                    return pipe.name === metaDataItem.name;
                                });
                            default:
                                return true;
                        }
                    });
                });
                ngModule.providers = ngModule.providers.filter(function (provider) {
                    return $dependenciesEngine.getInjectables().some(function (injectable) {
                        return injectable.name === provider.name;
                    });
                });
                return ngModule;
            });

    };
    Application.prototype.prepareInterfaces = function () {
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = $dependenciesEngine.getInterfaces();
        var i = 0, len = this.configuration.mainData.interfaces.length;
        for (i; i < len; i++) {
    });
    Application.prototype.prepareComponents = function () {
        logger.info('Prepare components');
        var that = this;
        that.configuration.mainData.components = $dependenciesEngine.getComponents();
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = that.configuration.mainData.components.length, loop = function () {
                if (i <= len - 1) {
                    var dirname$$1 = path.dirname(that.configuration.mainData.components[i].file), readmeFile = dirname$$1 + path.sep + 'README.md';
                    if (fs.existsSync(readmeFile)) {
                        logger.info('README.md exist for this component, include it');
                        fs.readFile(readmeFile, 'utf8', function (err, data) {
                            if (err)
                                throw err;
                            that.configuration.mainData.components[i].readme = marked__default(data);
                            that.configuration.addPage({
                                path: 'components',
                                name: that.configuration.mainData.components[i].name,
                                context: 'component',
                                component: that.configuration.mainData.components[i]
                            });
                            i++;
                            loop();
                        });
                    }
                    else {
                        that.configuration.addPage({
                            path: 'components',
                            name: that.configuration.mainData.components[i].name,
                            context: 'component',
                            component: that.configuration.mainData.components[i]
                        });
                        i++;
                        loop();
                    }
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareInjectables = function () {
        logger.info('Prepare injectables');
        this.configuration.mainData.injectables = $dependenciesEngine.getInjectables();
        var i = 0, len = this.configuration.mainData.injectables.length;
        for (i; i < len; i++) {
            this.configuration.addPage({
                path: 'injectables',
                name: this.configuration.mainData.injectables[i].name,
                context: 'injectable',
                injectable: this.configuration.mainData.injectables[i]
            });
        }
    };
    Application.prototype.prepareRoutes = function () {
        logger.info('Process routes');
        this.configuration.mainData.routes = $dependenciesEngine.getRoutes();
        this.configuration.addPage({
            name: 'routes',
            context: 'routes'
        });
    };
    Application.prototype.prepareCoverage = function () {
        logger.info('Process documentation coverage report');
        /*
         * loop with components, classes, injectables, interfaces, pipes
         */
        var files = [], totalProjectStatementDocumented = 0, getStatus = function (percent) {
            var status;
            if (percent <= 25) {
                status = 'low';
            }
            else if (percent > 25 && percent <= 50) {
                status = 'medium';
            }
            else if (percent > 50 && percent <= 75) {
                status = 'good';
            }
            else {
                status = 'very-good';
            }
            return status;
        };
        _.forEach(this.configuration.mainData.components, function (component) {
            var cl = {
                filePath: component.file,
                type: component.type,
                name: component.name
            }, totalStatementDocumented = 0, totalStatements = component.propertiesClass.length + component.methodsClass.length + component.inputsClass.length + component.outputsClass.length;
            _.forEach(component.propertiesClass, function (property) {
                if (property.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            _.forEach(component.methodsClass, function (method) {
                if (method.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            _.forEach(component.inputsClass, function (input) {
                if (input.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            _.forEach(component.outputsClass, function (output) {
                if (output.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
            if (totalStatements === 0) {
                cl.coveragePercent = 0;
            }
            cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
            cl.status = getStatus(cl.coveragePercent);
            totalProjectStatementDocumented += cl.coveragePercent;
            files.push(cl);
        });
        _.forEach(this.configuration.mainData.classes, function (classe) {
            var cl = {
                filePath: classe.file,
                type: 'classe',
                name: classe.name
            }, totalStatementDocumented = 0, totalStatements = classe.properties.length + classe.methods.length;
            _.forEach(classe.properties, function (property) {
                if (property.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            _.forEach(classe.methods, function (method) {
                if (method.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
            if (totalStatements === 0) {
                cl.coveragePercent = 0;
            }
            cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
            cl.status = getStatus(cl.coveragePercent);
            totalProjectStatementDocumented += cl.coveragePercent;
            files.push(cl);
        });
        _.forEach(this.configuration.mainData.injectables, function (injectable) {
            var cl = {
                filePath: injectable.file,
                type: injectable.type,
                name: injectable.name
            }, totalStatementDocumented = 0, totalStatements = injectable.properties.length + injectable.methods.length;
            _.forEach(injectable.properties, function (property) {
                if (property.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            _.forEach(injectable.methods, function (method) {
                if (method.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
            if (totalStatements === 0) {
                cl.coveragePercent = 0;
            }
            cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
            cl.status = getStatus(cl.coveragePercent);
            totalProjectStatementDocumented += cl.coveragePercent;
            files.push(cl);
        });
        _.forEach(this.configuration.mainData.interfaces, function (inter) {
            var cl = {
                filePath: inter.file,
                type: inter.type,
                name: inter.name
            }, totalStatementDocumented = 0, totalStatements = inter.properties.length + inter.methods.length;
            _.forEach(inter.properties, function (property) {
                if (property.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            _.forEach(inter.methods, function (method) {
                if (method.description !== '') {
                    totalStatementDocumented += 1;
                }
            });
            cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
            if (totalStatements === 0) {
                cl.coveragePercent = 0;
            }
            cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
            cl.status = getStatus(cl.coveragePercent);
            totalProjectStatementDocumented += cl.coveragePercent;
            files.push(cl);
        });
        _.forEach(this.configuration.mainData.pipes, function (pipe) {
            var cl = {
                filePath: pipe.file,
                type: pipe.type,
                name: pipe.name
            }, totalStatementDocumented = 0, totalStatements = 1;
            if (pipe.description !== '') {
                totalStatementDocumented += 1;
            }
            cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
            cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
            cl.status = getStatus(cl.coveragePercent);
            totalProjectStatementDocumented += cl.coveragePercent;
            files.push(cl);
        });
        files = _.sortBy(files, ['filePath']);
        var coverageData = {
            count: Math.floor(totalProjectStatementDocumented / files.length),
            status: ''
        };
        coverageData.status = getStatus(coverageData.count);
        this.configuration.addPage({
            name: 'coverage',
            context: 'coverage',
            files: files,
            data: coverageData
        });
    };
    Application.prototype.processPages = function () {
        var _this = this;
        logger.info('Process pages');
        var pages = this.configuration.pages, i = 0, len = pages.length, loop = function () {
            if (i <= len - 1) {
                logger.info('Process page', pages[i].name);
                $htmlengine.render(_this.configuration.mainData, pages[i]).then(function (htmlData) {
                    var finalPath = _this.configuration.mainData.output;
                    if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                        finalPath += '/';
                    }
                    if (pages[i].path) {
                        finalPath += pages[i].path + '/';
                    }
                    finalPath += pages[i].name + '.html';
                    $searchEngine.indexPage({
                        infos: pages[i],
                        rawData: htmlData,
                        url: finalPath
                    });
                    fs.outputFile(path.resolve(finalPath), htmlData, function (err) {
                        if (err) {
                            logger.error('Error during ' + pages[i].name + ' page generation');
                        }
                        else {
                            i++;
                            loop();
                        }
                    });
                }, function (errorMessage) {
                    logger.error(errorMessage);
                });
            }
            else {
                $searchEngine.generateSearchIndexJson(_this.configuration.mainData.output);
                if (_this.configuration.mainData.assetsFolder !== '') {
                    _this.processAssetsFolder();
                }
                _this.processResources();
            }
        };
        loop();
    };
    Application.prototype.processAssetsFolder = function () {
        logger.info('Copy assets folder');
        if (!fs.existsSync(this.configuration.mainData.assetsFolder)) {
            logger.error("Provided assets folder " + this.configuration.mainData.assetsFolder + " did not exist");
        }
        else {
            var that = this;
            fs.copy(path.resolve(this.configuration.mainData.assetsFolder), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output + path.sep + this.configuration.mainData.assetsFolder), function (err) {
                if (err) {
                    logger.error('Error during resources copy ', err);
                }
            });
        }
    };
    Application.prototype.processResources = function () {
        logger.info('Copy main resources');
        var that = this;
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output), function (err) {
            if (err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (that.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + that.configuration.mainData.extTheme), path.resolve(process.cwd() + path.sep + that.configuration.mainData.output + '/styles/'), function (err) {
                        if (err) {
                            logger.error('Error during external styling theme copy ', err);
                        }
                        else {
                            logger.info('External styling theme copy succeeded');
                            that.processGraphs();
                        }
                    });
                }
                else {
                    that.processGraphs();
                }
            }
        });
    };
    Application.prototype.processGraphs = function () {
        var _this = this;
        var onComplete = function () {
            var finalTime = (new Date() - startTime) / 1000;
            logger.info('Documentation generated in ' + _this.configuration.mainData.output + ' in ' + finalTime + ' seconds using ' + _this.configuration.mainData.theme + ' theme');
            if (_this.configuration.mainData.serve) {
                logger.info("Serving documentation from " + _this.configuration.mainData.output + " at http://127.0.0.1:" + _this.configuration.mainData.port);
                _this.runWebServer(_this.configuration.mainData.output);
            }
        };
        if (this.configuration.mainData.disableGraph) {
            logger.info('Graph generation disabled');
            onComplete();
        }
        else {
            logger.info('Process main graph');
            var modules_1 = this.configuration.mainData.modules, i_1 = 0, len_1 = modules_1.length, loop_1 = function () {
                if (i_1 <= len_1 - 1) {
                    logger.info('Process module graph', modules_1[i_1].name);
                    var finalPath = _this.configuration.mainData.output;
                    if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                        finalPath += '/';
                    }
                    finalPath += 'modules/' + modules_1[i_1].name;
                    $ngdengine.renderGraph(modules_1[i_1].file, finalPath, 'f').then(function () {
                        i_1++;
                        loop_1();
                    }, function (errorMessage) {
                        logger.error(errorMessage);
                    });
                }
                else {
                    onComplete();
                }
            };
            var finalMainGraphPath = this.configuration.mainData.output;
            if (finalMainGraphPath.lastIndexOf('/') === -1) {
                finalMainGraphPath += '/';
            }
            finalMainGraphPath += 'graph';
            $ngdengine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath), 'p').then(function () {
                loop_1();
            }, function (err) {
                logger.error('Error during graph generation: ', err);
            });
        }
    };
    Application.prototype.runWebServer = function (folder) {
        LiveServer.start({
            root: folder,
            open: this.configuration.mainData.open,
            quiet: true,
            logLevel: 0,
            port: this.configuration.mainData.port
        });
    };
    Object.defineProperty(Application.prototype, "application", {
        /**
         * Return the application / root component instance.
         */
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Application.prototype, "isCLI", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return Application;
}());

var pkg$2 = require('../package.json');
var program = require('commander');
var files = [];
var cwd$1 = process.cwd();
var CliApplication = (function (_super) {
    __extends(CliApplication, _super);
    function CliApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Run compodoc from the command line.
     */
    CliApplication.prototype.generate = function () {
        program
            .version(pkg$2.version)
            .usage('<src> [options]')
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder)
            .option('-b, --base [base]', 'Base reference of html tag <base>', COMPODOC_DEFAULTS.base)
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder')
            .option('-o, --open', 'Open the generated documentation', false)
            .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
            .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)')
            .option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
            .option('--disableSourceCode', 'Do not add source code tab', false)
            .option('--disableGraph', 'Do not add the dependency graph', false)
            .option('--disableCoverage', 'Do not add the documentation coverage report', false)
            .parse(process.argv);
        var outputHelp = function () {
            program.outputHelp();
            process.exit(1);
        };
        if (program.output) {
            this.configuration.mainData.output = program.output;
        }
        if (program.base) {
            this.configuration.mainData.base = program.base;
        }
        if (program.extTheme) {
            this.configuration.mainData.extTheme = program.extTheme;
        }
        if (program.theme) {
            this.configuration.mainData.theme = program.theme;
        }
        if (program.name) {
            this.configuration.mainData.documentationMainName = program.name;
        }
        if (program.assetsFolder) {
            this.configuration.mainData.assetsFolder = program.assetsFolder;
        }
        if (program.open) {
            this.configuration.mainData.open = program.open;
        }
        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }
        if (program.includesName) {
            this.configuration.mainData.includesName = program.includesName;
        }
        if (program.silent) {
            logger.silent = false;
        }
        if (program.serve) {
            this.configuration.mainData.serve = program.serve;
        }
        if (program.port) {
            this.configuration.mainData.port = program.port;
        }
        if (program.hideGenerator) {
            this.configuration.mainData.hideGenerator = program.hideGenerator;
        }
        if (program.disableSourceCode) {
            this.configuration.mainData.disableSourceCode = program.disableSourceCode;
        }
        if (program.disableGraph) {
            this.configuration.mainData.disableGraph = program.disableGraph;
        }
        if (program.disableCoverage) {
            this.configuration.mainData.disableCoverage = program.disableCoverage;
        }
        if (program.serve && !program.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!fs.existsSync(program.output)) {
                logger.error(program.output + " folder doesn't exist");
                process.exit(1);
            }
            else {
                logger.info("Serving documentation from " + program.output + " at http://127.0.0.1:" + program.port);
                _super.prototype.runWebServer.call(this, program.output);
            }
        }
        else if (program.serve && !program.tsconfig && !program.output) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!fs.existsSync(program.output)) {
                logger.error('Provide output generated folder with -d flag');
                process.exit(1);
            }
            else {
                logger.info("Serving documentation from " + program.output + " at http://127.0.0.1:" + program.port);
                _super.prototype.runWebServer.call(this, program.output);
            }
        }
        else {
            if (program.hideGenerator) {
                this.configuration.mainData.hideGenerator = true;
            }
            var defaultWalkFOlder = cwd$1 || '.', walk_1 = function (dir, exclude) {
                var results = [];
                var list = fs.readdirSync(dir);
                list.forEach(function (file) {
                    if (exclude.indexOf(file) < 0 && dir.indexOf('node_modules') < 0) {
                        file = path.join(dir, file);
                        var stat = fs.statSync(file);
                        if (stat && stat.isDirectory()) {
                            results = results.concat(walk_1(file, exclude));
                        }
                        else if (/(spec|\.d)\.ts/.test(file)) {
                            logger.debug('Ignoring', file);
                        }
                        else if (path.extname(file) === '.ts') {
                            logger.debug('Including', file);
                            results.push(file);
                        }
                    }
                });
                return results;
            };
            if (program.tsconfig && program.args.length === 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
                    logger.error('"tsconfig.json" file was not found in the current directory');
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    logger.info('Using tsconfig', _file);
                    files = require(_file).files;
                    // use the current directory of tsconfig.json as a working directory
                    cwd$1 = _file.split(path.sep).slice(0, -1).join(path.sep);
                    if (!files) {
                        var exclude = require(_file).exclude || [];
                        files = walk_1(cwd$1 || '.', exclude);
                    }
                    _super.prototype.setFiles.call(this, files);
                    _super.prototype.generate.call(this);
                }
            }
            else if (program.tsconfig && program.args.length > 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                var sourceFolder = program.args[0];
                if (!fs.existsSync(sourceFolder)) {
                    logger.error("Provided source folder " + sourceFolder + " was not found in the current directory");
                    process.exit(1);
                }
                else {
                    logger.info('Using provided source folder');
                    files = walk_1(path.resolve(sourceFolder), []);
                    _super.prototype.setFiles.call(this, files);
                    _super.prototype.generate.call(this);
                }
            }
            else {
                logger.error('tsconfig.json file was not found, please use -p flag');
                outputHelp();
            }
        }
    };
    return CliApplication;
}(Application));

exports.Application = Application;
exports.CliApplication = CliApplication;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiLCIuLi9zcmMvdXRpbHMvYW5ndWxhci1hcGkudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZGVwZW5kZW5jaWVzLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9tYXJrZG93bi5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZmlsZS5lbmdpbmUudHMiLCIuLi9zcmMvdXRpbHMvZGVmYXVsdHMudHMiLCIuLi9zcmMvYXBwL2NvbmZpZ3VyYXRpb24udHMiLCIuLi9zcmMvdXRpbHMvZ2xvYmFsLnBhdGgudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbmdkLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9zZWFyY2guZW5naW5lLnRzIiwiLi4vc3JjL3V0aWxzL3RzLWludGVybmFsLnRzIiwiLi4vc3JjL3V0aWxpdGllcy50cyIsIi4uL3NyYy91dGlscy9yb3V0ZXIucGFyc2VyLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9jb2RlZ2VuLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9kZXBlbmRlbmNpZXMudHMiLCIuLi9zcmMvYXBwL2FwcGxpY2F0aW9uLnRzIiwiLi4vc3JjL2luZGV4LWNsaS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgZ3V0aWwgPSByZXF1aXJlKCdndWxwLXV0aWwnKVxubGV0IGMgPSBndXRpbC5jb2xvcnM7XG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG5cbmVudW0gTEVWRUwge1xuXHRJTkZPLFxuXHRERUJVRyxcbiAgICBFUlJPUlxufVxuXG5jbGFzcyBMb2dnZXIge1xuXG5cdG5hbWU7XG5cdGxvZ2dlcjtcblx0dmVyc2lvbjtcblx0c2lsZW50O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubmFtZSA9IHBrZy5uYW1lO1xuXHRcdHRoaXMudmVyc2lvbiA9IHBrZy52ZXJzaW9uO1xuXHRcdHRoaXMubG9nZ2VyID0gZ3V0aWwubG9nO1xuXHRcdHRoaXMuc2lsZW50ID0gdHJ1ZTtcblx0fVxuXG5cdGluZm8oLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuSU5GTywgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0ZXJyb3IoLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuRVJST1IsIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdGRlYnVnKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkRFQlVHLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIGZvcm1hdChsZXZlbCwgLi4uYXJncykge1xuXG5cdFx0bGV0IHBhZCA9IChzLCBsLCBjPScnKSA9PiB7XG5cdFx0XHRyZXR1cm4gcyArIEFycmF5KCBNYXRoLm1heCgwLCBsIC0gcy5sZW5ndGggKyAxKSkuam9pbiggYyApXG5cdFx0fTtcblxuXHRcdGxldCBtc2cgPSBhcmdzLmpvaW4oJyAnKTtcblx0XHRpZihhcmdzLmxlbmd0aCA+IDEpIHtcblx0XHRcdG1zZyA9IGAkeyBwYWQoYXJncy5zaGlmdCgpLCAxNSwgJyAnKSB9OiAkeyBhcmdzLmpvaW4oJyAnKSB9YDtcblx0XHR9XG5cblxuXHRcdHN3aXRjaChsZXZlbCkge1xuXHRcdFx0Y2FzZSBMRVZFTC5JTkZPOlxuXHRcdFx0XHRtc2cgPSBjLmdyZWVuKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExFVkVMLkRFQlVHOlxuXHRcdFx0XHRtc2cgPSBjLmN5YW4obXNnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTEVWRUwuRVJST1I6XG5cdFx0XHRcdG1zZyA9IGMucmVkKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBbXG5cdFx0XHRtc2dcblx0XHRdLmpvaW4oJycpO1xuXHR9XG59XG5cbmV4cG9ydCBsZXQgbG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5sZXQgQW5ndWxhckFQSXMgPSByZXF1aXJlKCcuLi9zcmMvZGF0YS9hcGktbGlzdC5qc29uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kZXJJbkFuZ3VsYXJBUElzKHR5cGU6IHN0cmluZykge1xuICAgIGxldCBfcmVzdWx0ID0ge1xuICAgICAgICBzb3VyY2U6ICdleHRlcm5hbCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICB9O1xuXG4gICAgXy5mb3JFYWNoKEFuZ3VsYXJBUElzLCBmdW5jdGlvbihhbmd1bGFyTW9kdWxlQVBJcywgYW5ndWxhck1vZHVsZSkge1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBhbmd1bGFyTW9kdWxlQVBJcy5sZW5ndGg7XG4gICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXJNb2R1bGVBUElzW2ldLnRpdGxlID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gYW5ndWxhck1vZHVsZUFQSXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIF9yZXN1bHQ7XG59XG4iLCJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7IGZpbmRlckluQW5ndWxhckFQSXMgfSBmcm9tICcuLi8uLi91dGlscy9hbmd1bGFyLWFwaSc7XG5cbmNsYXNzIERlcGVuZGVuY2llc0VuZ2luZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOkRlcGVuZGVuY2llc0VuZ2luZSA9IG5ldyBEZXBlbmRlbmNpZXNFbmdpbmUoKTtcbiAgICByYXdEYXRhOiBPYmplY3Q7XG4gICAgbW9kdWxlczogT2JqZWN0W107XG4gICAgY29tcG9uZW50czogT2JqZWN0W107XG4gICAgZGlyZWN0aXZlczogT2JqZWN0W107XG4gICAgaW5qZWN0YWJsZXM6IE9iamVjdFtdO1xuICAgIGludGVyZmFjZXM6IE9iamVjdFtdO1xuICAgIHJvdXRlczogT2JqZWN0W107XG4gICAgcGlwZXM6IE9iamVjdFtdO1xuICAgIGNsYXNzZXM6IE9iamVjdFtdO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZihEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgRGVwZW5kZW5jaWVzRW5naW5lLmdldEluc3RhbmNlKCkgaW5zdGVhZCBvZiBuZXcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTpEZXBlbmRlbmNpZXNFbmdpbmVcbiAgICB7XG4gICAgICAgIHJldHVybiBEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlO1xuICAgIH1cbiAgICBpbml0KGRhdGE6IE9iamVjdCkge1xuICAgICAgICB0aGlzLnJhd0RhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLm1vZHVsZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEubW9kdWxlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuY29tcG9uZW50cywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuZGlyZWN0aXZlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmluamVjdGFibGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmluamVjdGFibGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbnRlcmZhY2VzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucm91dGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aCh0aGlzLnJhd0RhdGEucm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucGlwZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEucGlwZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jbGFzc2VzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNsYXNzZXMsIFsnbmFtZSddKTtcbiAgICB9XG4gICAgZmluZCh0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnaW50ZXJuYWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlLmluZGV4T2YoZGF0YVtpXS5uYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gZGF0YVtpXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmluamVjdGFibGVzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmNsYXNzZXMpLFxuICAgICAgICAgICAgcmVzdWx0SW5Bbmd1bGFyQVBJcyA9IGZpbmRlckluQW5ndWxhckFQSXModHlwZSlcblxuICAgICAgICBpZiAocmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXNcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkNvbXBvZG9jQ2xhc3Nlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0NsYXNzZXNcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkFuZ3VsYXJBUElzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkFuZ3VsYXJBUElzXG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0TW9kdWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlcztcbiAgICB9XG4gICAgZ2V0Q29tcG9uZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cztcbiAgICB9XG4gICAgZ2V0RGlyZWN0aXZlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aXZlcztcbiAgICB9XG4gICAgZ2V0SW5qZWN0YWJsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluamVjdGFibGVzO1xuICAgIH1cbiAgICBnZXRJbnRlcmZhY2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2VzO1xuICAgIH1cbiAgICBnZXRSb3V0ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvdXRlcztcbiAgICB9XG4gICAgZ2V0UGlwZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpcGVzO1xuICAgIH1cbiAgICBnZXRDbGFzc2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jbGFzc2VzO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCAkZGVwZW5kZW5jaWVzRW5naW5lID0gRGVwZW5kZW5jaWVzRW5naW5lLmdldEluc3RhbmNlKCk7XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcbi8vaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICdoYW5kbGViYXJzLWhlbHBlcnMnO1xuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5cbmV4cG9ydCBjbGFzcyBIdG1sRW5naW5lIHtcbiAgICBjYWNoZTogT2JqZWN0ID0ge307XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vVE9ETyB1c2UgdGhpcyBpbnN0ZWFkIDogaHR0cHM6Ly9naXRodWIuY29tL2Fzc2VtYmxlL2hhbmRsZWJhcnMtaGVscGVyc1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCBcImNvbXBhcmVcIiwgZnVuY3Rpb24oYSwgb3BlcmF0b3IsIGIsIG9wdGlvbnMpIHtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaGFuZGxlYmFycyBIZWxwZXIge3tjb21wYXJlfX0gZXhwZWN0cyA0IGFyZ3VtZW50cycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgICAgICAgY2FzZSAnaW5kZXhvZic6XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gKGIuaW5kZXhPZihhKSAhPT0gLTEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSA9PT0gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgICByZXN1bHQgPSBhICE9PSBiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICByZXN1bHQgPSBhID4gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaGVscGVyIHt7Y29tcGFyZX19OiBpbnZhbGlkIG9wZXJhdG9yOiBgJyArIG9wZXJhdG9yICsgJ2AnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKFwiZmlsdGVyQW5ndWxhcjJNb2R1bGVzXCIsIGZ1bmN0aW9uKHRleHQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IE5HMl9NT0RVTEVTOnN0cmluZ1tdID0gW1xuICAgICAgICAgICAgICAgICdCcm93c2VyTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnRm9ybXNNb2R1bGUnLFxuICAgICAgICAgICAgICAgICdIdHRwTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnUm91dGVyTW9kdWxlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBsZW4gPSBORzJfTU9EVUxFUy5sZW5ndGg7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoTkcyX01PRFVMRVNbaV0pID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKFwiZGVidWdcIiwgZnVuY3Rpb24ob3B0aW9uYWxWYWx1ZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ3VycmVudCBDb250ZXh0XCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG5cbiAgICAgICAgICBpZiAob3B0aW9uYWxWYWx1ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPcHRpb25hbFZhbHVlXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCI9PT09PT09PT09PT09PT09PT09PVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9wdGlvbmFsVmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2JyZWFrbGluZXMnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAvZ20sICcmbmJzcDsnKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1x0L2dtLCAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2JyZWFrQ29tbWEnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvLC9nLCAnLDxicj4nKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZnVuY3Rpb25TaWduYXR1cmUnLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBtZXRob2QuYXJncy5tYXAoZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9yZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmQoYXJnLnR5cGUpO1xuICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBfcmVzdWx0LmRhdGEudHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgcGF0aCA9ICdjbGFzc2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogPGEgaHJlZj1cIi4vJHtwYXRofXMvJHtfcmVzdWx0LmRhdGEubmFtZX0uaHRtbFwiID4ke2FyZy50eXBlfTwvYT5gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSAnaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS8nICsgX3Jlc3VsdC5kYXRhLnBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJnLm5hbWV9OiA8YSBocmVmPVwiJHtwYXRofVwiIHRhcmdldD1cIl9ibGFua1wiID4ke2FyZy50eXBlfTwvYT5gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogJHthcmcudHlwZX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmpvaW4oJywgJyk7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9KCR7YXJnc30pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoJHthcmdzfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignanNkb2MtcmV0dXJucy1jb21tZW50JywgZnVuY3Rpb24oanNkb2NUYWdzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3JldHVybnMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBqc2RvY1RhZ3NbaV0uY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXBhcmFtcycsIGZ1bmN0aW9uKGpzZG9jVGFncywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgdGFncyA9IFtdO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdwYXJhbScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24gJiYganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy50eXBlID0ganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuY29tbWVudCA9IGpzZG9jVGFnc1tpXS5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnBhcmFtZXRlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcubmFtZSA9IGpzZG9jVGFnc1tpXS5wYXJhbWV0ZXJOYW1lLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MucHVzaCh0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbGlua1R5cGUnLCBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgX3Jlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZChuYW1lKTtcbiAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlID0ge1xuICAgICAgICAgICAgICAgICAgICByYXc6IG5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9yZXN1bHQuc291cmNlID09PSAnaW50ZXJuYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgX3Jlc3VsdC5kYXRhLnR5cGUgPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSAnLi8nICsgX3Jlc3VsdC5kYXRhLnR5cGUgKyAncy8nICsgX3Jlc3VsdC5kYXRhLm5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUudGFyZ2V0ID0gJ19zZWxmJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUuaHJlZiA9ICdodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpLycgKyBfcmVzdWx0LmRhdGEucGF0aDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfYmxhbmsnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaW5kZXhhYmxlU2lnbmF0dXJlJywgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGFyZyA9PiBgJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YCkuam9pbignLCAnKTtcbiAgICAgICAgICAgIGlmIChtZXRob2QubmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHttZXRob2QubmFtZX1bJHthcmdzfV1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYFske2FyZ3N9XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdvYmplY3QnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkodGV4dCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC97XCIvLCAnezxicj4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIicpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvLFwiLywgJyw8YnI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCInKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL30kLywgJzxicj59Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluaXQoKSB7XG4gICAgICAgIGxldCBwYXJ0aWFscyA9IFtcbiAgICAgICAgICAgICdtZW51JyxcbiAgICAgICAgICAgICdvdmVydmlldycsXG4gICAgICAgICAgICAncmVhZG1lJyxcbiAgICAgICAgICAgICdtb2R1bGVzJyxcbiAgICAgICAgICAgICdtb2R1bGUnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAnY29tcG9uZW50LWRldGFpbCcsXG4gICAgICAgICAgICAnZGlyZWN0aXZlcycsXG4gICAgICAgICAgICAnZGlyZWN0aXZlJyxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAncGlwZXMnLFxuICAgICAgICAgICAgJ3BpcGUnLFxuICAgICAgICAgICAgJ2NsYXNzZXMnLFxuICAgICAgICAgICAgJ2NsYXNzJyxcblx0ICAgICAgICAnaW50ZXJmYWNlJyxcbiAgICAgICAgICAgICdyb3V0ZXMnLFxuICAgICAgICAgICAgJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICdzZWFyY2gtaW5wdXQnLFxuICAgICAgICAgICAgJ2xpbmstdHlwZScsXG4gICAgICAgICAgICAnYmxvY2stbWV0aG9kJyxcbiAgICAgICAgICAgICdibG9jay1wcm9wZXJ0eScsXG4gICAgICAgICAgICAnY292ZXJhZ2UtcmVwb3J0J1xuICAgICAgICBdLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBwYXJ0aWFscy5sZW5ndGgsXG4gICAgICAgICAgICBsb29wID0gKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvJyArIHBhcnRpYWxzW2ldICsgJy5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7IHJlamVjdCgpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbChwYXJ0aWFsc1tpXSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBsb29wKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXIobWFpbkRhdGE6YW55LCBwYWdlOmFueSkge1xuICAgICAgICB2YXIgbyA9IG1haW5EYXRhLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obywgcGFnZSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmKHRoYXQuY2FjaGVbJ3BhZ2UnXSkge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUodGhhdC5jYWNoZVsncGFnZSddKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFnZS5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBpbmRleCAnICsgcGFnZS5uYW1lICsgJyBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jYWNoZVsncGFnZSddID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlOmFueSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1hcmtlZCwgeyBSZW5kZXJlciB9IGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgaGlnaGxpZ2h0anMgZnJvbSAnaGlnaGxpZ2h0LmpzJztcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIoKTtcbiAgICAgICAgcmVuZGVyZXIuY29kZSA9IChjb2RlLCBsYW5ndWFnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsaWRMYW5nID0gISEobGFuZ3VhZ2UgJiYgaGlnaGxpZ2h0anMuZ2V0TGFuZ3VhZ2UobGFuZ3VhZ2UpKTtcbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRlZCA9IHZhbGlkTGFuZyA/IGhpZ2hsaWdodGpzLmhpZ2hsaWdodChsYW5ndWFnZSwgY29kZSkudmFsdWUgOiBjb2RlO1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRlZC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpL2dtLCAnPGJyPicpO1xuICAgICAgICAgICAgcmV0dXJuIGA8cHJlPjxjb2RlIGNsYXNzPVwiaGxqcyAke2xhbmd1YWdlfVwiPiR7aGlnaGxpZ2h0ZWR9PC9jb2RlPjwvcHJlPmA7XG4gICAgICAgIH07XG5cbiAgICAgICAgbWFya2VkLnNldE9wdGlvbnMoeyByZW5kZXJlciB9KTtcbiAgICB9XG4gICAgZ2V0UmVhZG1lRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyAnL1JFQURNRS5tZCcpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIFJFQURNRS5tZCBmaWxlIHJlYWRpbmcnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hcmtlZChkYXRhKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcblxuZXhwb3J0IGNsYXNzIEZpbGVFbmdpbmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuICAgIGdldChmaWxlcGF0aDpTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZXBhdGgpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyAnICsgZmlsZXBhdGggKyAnIHJlYWQnKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJleHBvcnQgY29uc3QgQ09NUE9ET0NfREVGQVVMVFMgPSB7XG4gICAgdGl0bGU6ICdBcHBsaWNhdGlvbiBkb2N1bWVudGF0aW9uJyxcbiAgICBhZGRpdGlvbmFsRW50cnlOYW1lOiAnQWRkaXRpb25hbCBkb2N1bWVudGF0aW9uJyxcbiAgICBhZGRpdGlvbmFsRW50cnlQYXRoOiAnYWRkaXRpb25hbC1kb2N1bWVudGF0aW9uJyxcbiAgICBmb2xkZXI6ICcuL2RvY3VtZW50YXRpb24vJyxcbiAgICBwb3J0OiA4MDgwLFxuICAgIHRoZW1lOiAnZ2l0Ym9vaycsXG4gICAgYmFzZTogJy8nLFxuICAgIGRpc2FibGVTb3VyY2VDb2RlOiBmYWxzZSxcbiAgICBkaXNhYmxlR3JhcGg6IGZhbHNlLFxuICAgIGRpc2FibGVDb3ZlcmFnZTogZmFsc2Vcbn1cbiIsImltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vdXRpbHMvZGVmYXVsdHMnO1xuXG5pbnRlcmZhY2UgUGFnZSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGNvbnRleHQ6IHN0cmluZztcbiAgICBwYXRoPzogc3RyaW5nO1xuICAgIG1vZHVsZT86IGFueTtcbiAgICBwaXBlPzogYW55O1xuICAgIGNsYXNzPzogYW55O1xuICAgIGludGVyZmFjZT86IGFueTtcbiAgICBkaXJlY3RpdmU/OiBhbnk7XG4gICAgaW5qZWN0YWJsZT86IGFueTtcbiAgICBmaWxlcz86IGFueTtcbiAgICBkYXRhPzogYW55O1xufVxuXG5pbnRlcmZhY2UgSU1haW5EYXRhIHtcbiAgICBvdXRwdXQ6IHN0cmluZztcbiAgICB0aGVtZTogc3RyaW5nO1xuICAgIGV4dFRoZW1lOiBzdHJpbmc7XG4gICAgc2VydmU6IGJvb2xlYW47XG4gICAgcG9ydDogbnVtYmVyO1xuICAgIG9wZW46IGJvb2xlYW47XG4gICAgYXNzZXRzRm9sZGVyOiBzdHJpbmc7XG4gICAgZG9jdW1lbnRhdGlvbk1haW5OYW1lOiBzdHJpbmc7XG4gICAgZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGJhc2U6IHN0cmluZztcbiAgICBoaWRlR2VuZXJhdG9yOiBib29sZWFuO1xuICAgIG1vZHVsZXM6IGFueTtcbiAgICByZWFkbWU6IHN0cmluZztcbiAgICBhZGRpdGlvbmFscGFnZXM6IE9iamVjdDtcbiAgICBwaXBlczogYW55O1xuICAgIGNsYXNzZXM6IGFueTtcbiAgICBpbnRlcmZhY2VzOiBhbnk7XG4gICAgY29tcG9uZW50czogYW55O1xuICAgIGRpcmVjdGl2ZXM6IGFueTtcbiAgICBpbmplY3RhYmxlczogYW55O1xuICAgIHJvdXRlczogYW55O1xuICAgIHRzY29uZmlnOiBzdHJpbmc7XG4gICAgaW5jbHVkZXM6IGJvb2xlYW47XG4gICAgaW5jbHVkZXNOYW1lOiBzdHJpbmc7XG4gICAgZGlzYWJsZVNvdXJjZUNvZGU6IGJvb2xlYW47XG4gICAgZGlzYWJsZUdyYXBoOiBib29sZWFuO1xuICAgIGRpc2FibGVDb3ZlcmFnZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29uZmlndXJhdGlvbiB7XG4gICAgbWFpbkRhdGE6IElNYWluRGF0YTtcbiAgICBwYWdlczpBcnJheTxQYWdlPjtcbiAgICBhZGRQYWdlKHBhZ2U6IFBhZ2UpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ29uZmlndXJhdGlvbiBpbXBsZW1lbnRzIElDb25maWd1cmF0aW9uIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6Q29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKCk7XG5cbiAgICBwcml2YXRlIF9wYWdlczpBcnJheTxQYWdlPiA9IFtdO1xuICAgIHByaXZhdGUgX21haW5EYXRhOiBJTWFpbkRhdGEgPSB7XG4gICAgICAgIG91dHB1dDogQ09NUE9ET0NfREVGQVVMVFMuZm9sZGVyLFxuICAgICAgICB0aGVtZTogQ09NUE9ET0NfREVGQVVMVFMudGhlbWUsXG4gICAgICAgIGV4dFRoZW1lOiAnJyxcbiAgICAgICAgc2VydmU6IGZhbHNlLFxuICAgICAgICBwb3J0OiBDT01QT0RPQ19ERUZBVUxUUy5wb3J0LFxuICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgYXNzZXRzRm9sZGVyOiAnJyxcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5OYW1lOiBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbjogJycsXG4gICAgICAgIGJhc2U6IENPTVBPRE9DX0RFRkFVTFRTLmJhc2UsXG4gICAgICAgIGhpZGVHZW5lcmF0b3I6IGZhbHNlLFxuICAgICAgICBtb2R1bGVzOiBbXSxcbiAgICAgICAgcmVhZG1lOiAnJyxcbiAgICAgICAgYWRkaXRpb25hbHBhZ2VzOiB7fSxcbiAgICAgICAgcGlwZXM6IFtdLFxuICAgICAgICBjbGFzc2VzOiBbXSxcbiAgICAgICAgaW50ZXJmYWNlczogW10sXG4gICAgICAgIGNvbXBvbmVudHM6IFtdLFxuICAgICAgICBkaXJlY3RpdmVzOiBbXSxcbiAgICAgICAgaW5qZWN0YWJsZXM6IFtdLFxuICAgICAgICByb3V0ZXM6IFtdLFxuICAgICAgICB0c2NvbmZpZzogJycsXG4gICAgICAgIGluY2x1ZGVzOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZVNvdXJjZUNvZGU6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVTb3VyY2VDb2RlLFxuICAgICAgICBkaXNhYmxlR3JhcGg6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVHcmFwaCxcbiAgICAgICAgZGlzYWJsZUNvdmVyYWdlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlQ292ZXJhZ2VcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmKENvbmZpZ3VyYXRpb24uX2luc3RhbmNlKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIENvbmZpZ3VyYXRpb24uX2luc3RhbmNlID0gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6Q29uZmlndXJhdGlvblxuICAgIHtcbiAgICAgICAgcmV0dXJuIENvbmZpZ3VyYXRpb24uX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGFkZFBhZ2UocGFnZTogUGFnZSkge1xuICAgICAgICB0aGlzLl9wYWdlcy5wdXNoKHBhZ2UpO1xuICAgIH1cblxuICAgIGdldCBwYWdlcygpOkFycmF5PFBhZ2U+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZ2VzO1xuICAgIH1cbiAgICBzZXQgcGFnZXMocGFnZXM6QXJyYXk8UGFnZT4pIHtcbiAgICAgICAgdGhpcy5fcGFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXQgbWFpbkRhdGEoKTpJTWFpbkRhdGEge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFpbkRhdGE7XG4gICAgfVxuICAgIHNldCBtYWluRGF0YShkYXRhOklNYWluRGF0YSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuX21haW5EYXRhLCBkYXRhKTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzR2xvYmFsKCkge1xuICAgIHZhciBiaW5QYXRoLFxuICAgICAgICBnbG9iYWxCaW5QYXRoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoYmluUGF0aCkgcmV0dXJuIGJpblBhdGhcblxuICAgICAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGF0aG5hbWVzID0gcHJvY2Vzcy5lbnYuUEFUSC5zcGxpdChwYXRoLmRlbGltaXRlcilcbiAgICAgICAgICAgICAgICB2YXIgbGVuID0gcGF0aG5hbWVzLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aC5iYXNlbmFtZShwYXRobmFtZXNbaV0pID09PSAnbnBtJyB8fCBwYXRoLmJhc2VuYW1lKHBhdGhuYW1lc1tpXSkgPT09ICdub2RlanMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5QYXRoID0gcGF0aG5hbWVzW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiaW5QYXRoID0gcGF0aC5kaXJuYW1lKHByb2Nlc3MuZXhlY1BhdGgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBiaW5QYXRoXG4gICAgICAgIH0sXG4gICAgICAgIHN0cmlwVHJhaWxpbmdTZXAgPSBmdW5jdGlvbih0aGVQYXRoKSB7XG4gICAgICAgICAgICBpZiAodGhlUGF0aFt0aGVQYXRoLmxlbmd0aCAtIDFdID09PSBwYXRoLnNlcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGVQYXRoLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGVQYXRoO1xuICAgICAgICB9LFxuICAgICAgICBwYXRoSXNJbnNpZGUgPSBmdW5jdGlvbih0aGVQYXRoLCBwb3RlbnRpYWxQYXJlbnQpIHtcbiAgICAgICAgICAgIC8vIEZvciBpbnNpZGUtZGlyZWN0b3J5IGNoZWNraW5nLCB3ZSB3YW50IHRvIGFsbG93IHRyYWlsaW5nIHNsYXNoZXMsIHNvIG5vcm1hbGl6ZS5cbiAgICAgICAgICAgIHRoZVBhdGggPSBzdHJpcFRyYWlsaW5nU2VwKHRoZVBhdGgpO1xuICAgICAgICAgICAgcG90ZW50aWFsUGFyZW50ID0gc3RyaXBUcmFpbGluZ1NlcChwb3RlbnRpYWxQYXJlbnQpO1xuXG4gICAgICAgICAgICAvLyBOb2RlIHRyZWF0cyBvbmx5IFdpbmRvd3MgYXMgY2FzZS1pbnNlbnNpdGl2ZSBpbiBpdHMgcGF0aCBtb2R1bGU7IHdlIGZvbGxvdyB0aG9zZSBjb252ZW50aW9ucy5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcbiAgICAgICAgICAgICAgICB0aGVQYXRoID0gdGhlUGF0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHBvdGVudGlhbFBhcmVudCA9IHBvdGVudGlhbFBhcmVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhlUGF0aC5sYXN0SW5kZXhPZihwb3RlbnRpYWxQYXJlbnQsIDApID09PSAwICYmXG4gICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICB0aGVQYXRoW3BvdGVudGlhbFBhcmVudC5sZW5ndGhdID09PSBwYXRoLnNlcCB8fFxuICAgICAgICAgICAgICAgICAgICB0aGVQYXRoW3BvdGVudGlhbFBhcmVudC5sZW5ndGhdID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICBpc1BhdGhJbnNpZGUgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICBhID0gcGF0aC5yZXNvbHZlKGEpO1xuICAgICAgICAgICAgYiA9IHBhdGgucmVzb2x2ZShiKTtcblxuICAgICAgICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXRoSXNJbnNpZGUoYSwgYik7XG4gICAgICAgIH1cbiAgICByZXR1cm4gaXNQYXRoSW5zaWRlKHByb2Nlc3MuYXJndlsxXSB8fCAnJywgZ2xvYmFsQmluUGF0aCgpIHx8ICcnKVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQgaXNHbG9iYWwgZnJvbSAnLi4vLi4vdXRpbHMvZ2xvYmFsLnBhdGgnO1xuXG5leHBvcnQgY2xhc3MgTmdkRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIH1cbiAgICByZW5kZXJHcmFwaChmaWxlcGF0aDpTdHJpbmcsIG91dHB1dHBhdGg6IFN0cmluZywgdHlwZTogU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgbGV0IG5nZFBhdGggPSAoaXNHbG9iYWwoKSkgPyBfX2Rpcm5hbWUgKyAnLy4uL25vZGVfbW9kdWxlcy8uYmluL25nZCcgOiBfX2Rpcm5hbWUgKyAnLy4uLy4uLy5iaW4vbmdkJztcbiAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk1PREUgJiYgcHJvY2Vzcy5lbnYuTU9ERSA9PT0gJ1RFU1RJTkcnKSB7XG4gICAgICAgICAgICAgICBuZ2RQYXRoID0gX19kaXJuYW1lICsgJy8uLi9ub2RlX21vZHVsZXMvLmJpbi9uZ2QnO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIGlmICgvIC9nLnRlc3QobmdkUGF0aCkpIHtcbiAgICAgICAgICAgICAgIG5nZFBhdGggPSBuZ2RQYXRoLnJlcGxhY2UoLyAvZywgJ14gJyk7XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHBhdGgucmVzb2x2ZShuZ2RQYXRoKSArICcgLScgKyB0eXBlICsgJyAnICsgZmlsZXBhdGggKyAnIC1kICcgKyBvdXRwdXRwYXRoICsgJyAtcyAtdCBzdmcnXG4gICAgICAgICAgIFNoZWxsanMuZXhlYyhmaW5hbFBhdGgsIHtcbiAgICAgICAgICAgICAgIHNpbGVudDogdHJ1ZVxuICAgICAgICAgICB9LCBmdW5jdGlvbihjb2RlLCBzdGRvdXQsIHN0ZGVycikge1xuICAgICAgICAgICAgICAgaWYoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KHN0ZGVycik7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XG5cbmNvbnN0IGx1bnI6IGFueSA9IHJlcXVpcmUoJ2x1bnInKSxcbiAgICAgIGNoZWVyaW86IGFueSA9IHJlcXVpcmUoJ2NoZWVyaW8nKSxcbiAgICAgIEVudGl0aWVzOmFueSA9IHJlcXVpcmUoJ2h0bWwtZW50aXRpZXMnKS5BbGxIdG1sRW50aXRpZXMsXG4gICAgICAkY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSxcbiAgICAgIEh0bWwgPSBuZXcgRW50aXRpZXMoKTtcblxuZXhwb3J0IGNsYXNzIFNlYXJjaEVuZ2luZSB7XG4gICAgc2VhcmNoSW5kZXg6IGFueTtcbiAgICBkb2N1bWVudHNTdG9yZTogT2JqZWN0ID0ge307XG4gICAgaW5kZXhTaXplOiBudW1iZXI7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuICAgIHByaXZhdGUgZ2V0U2VhcmNoSW5kZXgoKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWFyY2hJbmRleCkge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hJbmRleCA9IGx1bnIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmKCd1cmwnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCd0aXRsZScsIHsgYm9vc3Q6IDEwIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZmllbGQoJ2JvZHknKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlYXJjaEluZGV4O1xuICAgIH1cbiAgICBpbmRleFBhZ2UocGFnZSkge1xuICAgICAgICB2YXIgdGV4dCxcbiAgICAgICAgICAgICQgPSBjaGVlcmlvLmxvYWQocGFnZS5yYXdEYXRhKTtcblxuICAgICAgICB0ZXh0ID0gJCgnLmNvbnRlbnQnKS5odG1sKCk7XG4gICAgICAgIHRleHQgPSBIdG1sLmRlY29kZSh0ZXh0KTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKDwoW14+XSspPikvaWcsICcnKTtcblxuICAgICAgICBwYWdlLnVybCA9IHBhZ2UudXJsLnJlcGxhY2UoJGNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0LCAnJyk7XG5cbiAgICAgICAgdmFyIGRvYyA9IHtcbiAgICAgICAgICAgIHVybDogcGFnZS51cmwsXG4gICAgICAgICAgICB0aXRsZTogcGFnZS5pbmZvcy5jb250ZXh0ICsgJyAtICcgKyBwYWdlLmluZm9zLm5hbWUsXG4gICAgICAgICAgICBib2R5OiB0ZXh0XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kb2N1bWVudHNTdG9yZVtkb2MudXJsXSA9IGRvYztcblxuICAgICAgICB0aGlzLmdldFNlYXJjaEluZGV4KCkuYWRkKGRvYyk7XG4gICAgfVxuICAgIGdlbmVyYXRlU2VhcmNoSW5kZXhKc29uKG91dHB1dEZvbGRlcikge1xuICAgICAgICBmcy53cml0ZUpzb24ocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJ3NlYXJjaF9pbmRleC5qc29uJyksIHtcbiAgICAgICAgICAgIGluZGV4OiB0aGlzLmdldFNlYXJjaEluZGV4KCksXG4gICAgICAgICAgICBzdG9yZTogdGhpcy5kb2N1bWVudHNTdG9yZVxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBzZWFyY2ggaW5kZXggZmlsZSBnZW5lcmF0aW9uICcsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyB0cyBmcm9tIFwidHlwZXNjcmlwdFwiO1xuY29uc3QgdHNhbnkgPSB0cyBhcyBhbnk7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iLzIuMS9zcmMvY29tcGlsZXIvdXRpbGl0aWVzLnRzI0wxNTA3XG5leHBvcnQgZnVuY3Rpb24gZ2V0SlNEb2NzKG5vZGU6IHRzLk5vZGUpIHtcbiAgcmV0dXJuIHRzYW55LmdldEpTRG9jcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5jb25zdCBjYXJyaWFnZVJldHVybkxpbmVGZWVkID0gJ1xcclxcbic7XG5jb25zdCBsaW5lRmVlZCA9ICdcXG4nO1xuXG4vLyBnZXQgZGVmYXVsdCBuZXcgbGluZSBicmVha1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5ld0xpbmVDaGFyYWN0ZXIob3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zKTogc3RyaW5nIHtcbiAgICBpZiAob3B0aW9ucy5uZXdMaW5lID09PSB0cy5OZXdMaW5lS2luZC5DYXJyaWFnZVJldHVybkxpbmVGZWVkKSB7XG4gICAgICAgIHJldHVybiBjYXJyaWFnZVJldHVybkxpbmVGZWVkO1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zLm5ld0xpbmUgPT09IHRzLk5ld0xpbmVLaW5kLkxpbmVGZWVkKSB7XG4gICAgICAgIHJldHVybiBsaW5lRmVlZDtcbiAgICB9XG4gICAgcmV0dXJuIGNhcnJpYWdlUmV0dXJuTGluZUZlZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RJbmRlbnQoc3RyLCBjb3VudCwgaW5kZW50Pyk6IHN0cmluZyB7XG4gICAgbGV0IHN0cmlwSW5kZW50ID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzdHIubWF0Y2goL15bIFxcdF0qKD89XFxTKS9nbSk7XG5cbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IHVzZSBzcHJlYWQgb3BlcmF0b3Igd2hlbiB0YXJnZXRpbmcgTm9kZS5qcyA2XG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIG1hdGNoLm1hcCh4ID0+IHgubGVuZ3RoKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGBeWyBcXFxcdF17JHtpbmRlbnR9fWAsICdnbScpO1xuXG4gICAgICAgIHJldHVybiBpbmRlbnQgPiAwID8gc3RyLnJlcGxhY2UocmUsICcnKSA6IHN0cjtcbiAgICB9LFxuICAgICAgICByZXBlYXRpbmcgPSBmdW5jdGlvbihuLCBzdHIpIHtcbiAgICAgICAgc3RyID0gc3RyID09PSB1bmRlZmluZWQgPyAnICcgOiBzdHI7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuIDwgMCB8fCAhTnVtYmVyLmlzRmluaXRlKG4pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIHBvc2l0aXZlIGZpbml0ZSBudW1iZXIsIGdvdCBcXGAke259XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmV0ID0gJyc7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XG4gICAgICAgICAgICAgICAgcmV0ICs9IHN0cjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RyICs9IHN0cjtcbiAgICAgICAgfSB3aGlsZSAoKG4gPj49IDEpKTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgaW5kZW50U3RyaW5nID0gZnVuY3Rpb24oc3RyLCBjb3VudCwgaW5kZW50KSB7XG4gICAgICAgIGluZGVudCA9IGluZGVudCA9PT0gdW5kZWZpbmVkID8gJyAnIDogaW5kZW50O1xuICAgICAgICBjb3VudCA9IGNvdW50ID09PSB1bmRlZmluZWQgPyAxIDogY291bnQ7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgY291bnQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIFxcYG51bWJlclxcYCwgZ290IFxcYCR7dHlwZW9mIGNvdW50fVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBpbmRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbmRlbnRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBpbmRlbnR9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICBpbmRlbnQgPSBjb3VudCA+IDEgPyByZXBlYXRpbmcoY291bnQsIGluZGVudCkgOiBpbmRlbnQ7XG5cbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eKD8hXFxzKiQpL21nLCBpbmRlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBpbmRlbnRTdHJpbmcoc3RyaXBJbmRlbnQoc3RyKSwgY291bnQgfHwgMCwgaW5kZW50KTtcbn1cblxuLy8gQ3JlYXRlIGEgY29tcGlsZXJIb3N0IG9iamVjdCB0byBhbGxvdyB0aGUgY29tcGlsZXIgdG8gcmVhZCBhbmQgd3JpdGUgZmlsZXNcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlckhvc3QodHJhbnNwaWxlT3B0aW9uczogYW55KTogdHMuQ29tcGlsZXJIb3N0IHtcblxuICAgIGNvbnN0IGlucHV0RmlsZU5hbWUgPSB0cmFuc3BpbGVPcHRpb25zLmZpbGVOYW1lIHx8ICh0cmFuc3BpbGVPcHRpb25zLmpzeCA/ICdtb2R1bGUudHN4JyA6ICdtb2R1bGUudHMnKTtcblxuICAgIGNvbnN0IGNvbXBpbGVySG9zdDogdHMuQ29tcGlsZXJIb3N0ID0ge1xuICAgICAgICBnZXRTb3VyY2VGaWxlOiAoZmlsZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChmaWxlTmFtZS5sYXN0SW5kZXhPZignLnRzJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnbGliLmQudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBhdGguaXNBYnNvbHV0ZShmaWxlTmFtZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gcGF0aC5qb2luKHRyYW5zcGlsZU9wdGlvbnMudHNjb25maWdEaXJlY3RvcnksIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbGliU291cmNlID0gJyc7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBsaWJTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZU5hbWUpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGUsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShmaWxlTmFtZSwgbGliU291cmNlLCB0cmFuc3BpbGVPcHRpb25zLnRhcmdldCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGVGaWxlOiAobmFtZSwgdGV4dCkgPT4ge30sXG4gICAgICAgIGdldERlZmF1bHRMaWJGaWxlTmFtZTogKCkgPT4gJ2xpYi5kLnRzJyxcbiAgICAgICAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lczogKCkgPT4gZmFsc2UsXG4gICAgICAgIGdldENhbm9uaWNhbEZpbGVOYW1lOiBmaWxlTmFtZSA9PiBmaWxlTmFtZSxcbiAgICAgICAgZ2V0Q3VycmVudERpcmVjdG9yeTogKCkgPT4gJycsXG4gICAgICAgIGdldE5ld0xpbmU6ICgpID0+ICdcXG4nLFxuICAgICAgICBmaWxlRXhpc3RzOiAoZmlsZU5hbWUpOiBib29sZWFuID0+IGZpbGVOYW1lID09PSBpbnB1dEZpbGVOYW1lLFxuICAgICAgICByZWFkRmlsZTogKCkgPT4gJycsXG4gICAgICAgIGRpcmVjdG9yeUV4aXN0czogKCkgPT4gdHJ1ZSxcbiAgICAgICAgZ2V0RGlyZWN0b3JpZXM6ICgpID0+IFtdXG4gICAgfTtcbiAgICByZXR1cm4gY29tcGlsZXJIb3N0O1xufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcblxuZXhwb3J0IGxldCBSb3V0ZXJQYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcm91dGVzID0gW10sXG4gICAgICAgIG1vZHVsZXMgPSBbXSxcbiAgICAgICAgbW9kdWxlc1RyZWUsXG4gICAgICAgIHJvb3RNb2R1bGUsXG4gICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gW107XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhZGRSb3V0ZTogZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgIHJvdXRlcy5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgIHJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgocm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZE1vZHVsZVdpdGhSb3V0ZXM6IGZ1bmN0aW9uKG1vZHVsZU5hbWUsIG1vZHVsZUltcG9ydHMpIHtcbiAgICAgICAgICAgIG1vZHVsZXNXaXRoUm91dGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlc1dpdGhSb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKG1vZHVsZXNXaXRoUm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZE1vZHVsZTogZnVuY3Rpb24obW9kdWxlTmFtZTogc3RyaW5nLCBtb2R1bGVJbXBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgobW9kdWxlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBzZXRSb290TW9kdWxlOiBmdW5jdGlvbihtb2R1bGU6IHN0cmluZykge1xuICAgICAgICAgICAgcm9vdE1vZHVsZSA9IG1vZHVsZTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJpbnRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHJvdXRlcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhc1JvdXRlck1vZHVsZUluSW1wb3J0czogZnVuY3Rpb24oaW1wb3J0cykge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGltcG9ydHMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JDaGlsZCcpICE9PSAtMSB8fFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRzW2ldLm5hbWUuaW5kZXhPZignUm91dGVyTW9kdWxlLmZvclJvb3QnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBsaW5rTW9kdWxlc0FuZFJvdXRlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL3NjYW4gZWFjaCBtb2R1bGUgaW1wb3J0cyBBU1QgZm9yIGVhY2ggcm91dGVzLCBhbmQgbGluayByb3V0ZXMgd2l0aCBtb2R1bGVcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtb2R1bGVzV2l0aFJvdXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzV2l0aFJvdXRlc1tpXS5pbXBvcnRzTm9kZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gobm9kZS5pbml0aWFsaXplci5lbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbmQgZWxlbWVudCB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50LmFyZ3VtZW50cywgZnVuY3Rpb24oYXJndW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocm91dGVzLCBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0ICYmIHJvdXRlLm5hbWUgPT09IGFyZ3VtZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLm1vZHVsZSA9IG1vZHVsZXNXaXRoUm91dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uc3RydWN0Um91dGVzVHJlZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjb25zdHJ1Y3RSb3V0ZXNUcmVlJyk7XG4gICAgICAgICAgICAvLyByb3V0ZXNbXSBjb250YWlucyByb3V0ZXMgd2l0aCBtb2R1bGUgbGlua1xuICAgICAgICAgICAgLy8gbW9kdWxlc1RyZWUgY29udGFpbnMgbW9kdWxlcyB0cmVlXG4gICAgICAgICAgICAvLyBtYWtlIGEgZmluYWwgcm91dGVzIHRyZWUgd2l0aCB0aGF0XG4gICAgICAgICAgICBsZXQgY2xlYW5Nb2R1bGVzVHJlZSA9IF8uY2xvbmVEZWVwKG1vZHVsZXNUcmVlKSxcbiAgICAgICAgICAgICAgICBtb2R1bGVzQ2xlYW5lciA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldLmltcG9ydHNOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFycltpXS5pbXBvcnRzTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJbaV0ucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFycltpXS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihhcnJbaV0uY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihjbGVhbk1vZHVsZXNUcmVlKTtcbiAgICAgICAgICAgIC8vZnMub3V0cHV0SnNvbignLi9tb2R1bGVzLmpzb24nLCBjbGVhbk1vZHVsZXNUcmVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbGVhbk1vZHVsZXNUcmVlIGxpZ2h0OiAnLCB1dGlsLmluc3BlY3QoY2xlYW5Nb2R1bGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgdmFyIHJvdXRlc1RyZWUgPSB7XG4gICAgICAgICAgICAgICAgdGFnOiAnPHJvb3Q+JyxcbiAgICAgICAgICAgICAgICBraW5kOiAnbmdNb2R1bGUnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHJvb3RNb2R1bGUsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsZXQgZm91bmRSb3V0ZVdpdGhNb2R1bGVOYW1lID0gZnVuY3Rpb24obW9kdWxlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmZpbmQocm91dGVzLCB7J21vZHVsZSc6IG1vZHVsZU5hbWV9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGxvb3BNb2R1bGVzUGFyc2VyID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZSA9IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZShub2RlLmNoaWxkcmVuW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLnJvdXRlcyA9IEpTT04ucGFyc2Uocm91dGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgcm91dGUuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmtpbmQgPSAnbmdNb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzVHJlZS5jaGlsZHJlbi5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbltpXS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcE1vZHVsZXNQYXJzZXIobm9kZS5jaGlsZHJlbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb29wTW9kdWxlc1BhcnNlcihfLmZpbmQoY2xlYW5Nb2R1bGVzVHJlZSwgeyduYW1lJzogcm9vdE1vZHVsZX0pKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3JvdXRlc1RyZWU6ICcsIHJvdXRlc1RyZWUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuXG4gICAgICAgICAgICAvL2ZzLm91dHB1dEpzb24oJy4vcm91dGVzLXRyZWUuanNvbicsIHJvdXRlc1RyZWUpO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5lZFJvdXRlc1RyZWU7XG5cbiAgICAgICAgICAgIHZhciBjbGVhblJvdXRlc1RyZWUgPSBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm91dGVzID0gcm91dGUuY2hpbGRyZW5baV0ucm91dGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcm91dGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFuZWRSb3V0ZXNUcmVlID0gY2xlYW5Sb3V0ZXNUcmVlKHJvdXRlc1RyZWUpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW5lZFJvdXRlc1RyZWU6ICcsIHV0aWwuaW5zcGVjdChjbGVhbmVkUm91dGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICB9LFxuICAgICAgICBjb25zdHJ1Y3RNb2R1bGVzVHJlZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgZ2V0TmVzdGVkQ2hpbGRyZW4gPSBmdW5jdGlvbihhcnIsIHBhcmVudD8pIHtcbiAgICAgICAgICAgICAgICB2YXIgb3V0ID0gW11cbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGFycltpXS5wYXJlbnQgPT09IHBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gZ2V0TmVzdGVkQ2hpbGRyZW4oYXJyLCBhcnJbaV0ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycltpXS5jaGlsZHJlbiA9IGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChhcnJbaV0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vU2NhbiBlYWNoIG1vZHVsZSBhbmQgYWRkIHBhcmVudCBwcm9wZXJ0eVxuICAgICAgICAgICAgXy5mb3JFYWNoKG1vZHVsZXMsIGZ1bmN0aW9uKGZpcnN0TG9vcE1vZHVsZSkge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChmaXJzdExvb3BNb2R1bGUuaW1wb3J0c05vZGUsIGZ1bmN0aW9uKGltcG9ydE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG1vZHVsZXMsIGZ1bmN0aW9uKG1vZHVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIG1vZHVsZS5uYW1lID09PSBpbXBvcnROb2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGUucGFyZW50ID0gZmlyc3RMb29wTW9kdWxlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXNUcmVlID0gZ2V0TmVzdGVkQ2hpbGRyZW4obW9kdWxlcyk7XG4gICAgICAgIH1cbiAgICB9XG59KSgpO1xuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmxldCBjb2RlOiBzdHJpbmdbXSA9IFtdO1xuXG5leHBvcnQgbGV0IGdlbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHRtcDogdHlwZW9mIGNvZGUgPSBbXTtcblxuICAgIHJldHVybiAodG9rZW4gPSBudWxsKSA9PiB7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAhIHRva2VuJyk7XG4gICAgICAgICAgICByZXR1cm4gY29kZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0b2tlbiA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyBcXG4nKTtcbiAgICAgICAgICAgIGNvZGUucHVzaCh0bXAuam9pbignJykpO1xuICAgICAgICAgICAgdG1wID0gW107XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb2RlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cbn0gKCkpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGUobm9kZTogYW55KSB7XG4gICAgY29kZSA9IFtdO1xuICAgIHZpc2l0QW5kUmVjb2duaXplKG5vZGUpO1xuICAgIHJldHVybiBjb2RlLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiB2aXNpdEFuZFJlY29nbml6ZShub2RlOiBhbnksIGRlcHRoID0gMCkge1xuICAgIHJlY29nbml6ZShub2RlKTtcbiAgICBkZXB0aCsrO1xuICAgIG5vZGUuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKGMgPT4gdmlzaXRBbmRSZWNvZ25pemUoYywgZGVwdGgpKTtcbn1cblxuZnVuY3Rpb24gcmVjb2duaXplKG5vZGU6IGFueSkge1xuXG4gICAgLy9jb25zb2xlLmxvZygncmVjb2duaXppbmcuLi4nLCB0cy5TeW50YXhLaW5kW25vZGUua2luZCsnJ10pO1xuXG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0TGl0ZXJhbFRva2VuOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGdlbignXFxcIicpO1xuICAgICAgICAgICAgZ2VuKG5vZGUudGV4dCk7XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGdlbignXFxcIicpO1xuICAgICAgICAgICAgZ2VuKG5vZGUudGV4dCk7XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignaW1wb3J0Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnJvbUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2Zyb20nKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGdlbignZXhwb3J0Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2NsYXNzJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3RoaXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3JLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjb25zdHJ1Y3RvcicpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignZmFsc2UnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3RydWUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ251bGwnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BdFRva2VuOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QbHVzVG9rZW46XG4gICAgICAgICAgICBnZW4oJysnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXF1YWxzR3JlYXRlclRoYW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignID0+ICcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9wZW5QYXJlblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcoJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0Q2xhdXNlOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CbG9jazpcbiAgICAgICAgICAgIGdlbigneycpO1xuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbG9zZUJyYWNlVG9rZW46XG4gICAgICAgICAgICBnZW4oJ30nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VQYXJlblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcpJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9wZW5CcmFja2V0VG9rZW46XG4gICAgICAgICAgICBnZW4oJ1snKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFja2V0VG9rZW46XG4gICAgICAgICAgICBnZW4oJ10nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TZW1pY29sb25Ub2tlbjpcbiAgICAgICAgICAgIGdlbignOycpO1xuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29tbWFUb2tlbjpcbiAgICAgICAgICAgIGdlbignLCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGdlbignOicpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRvdFRva2VuOlxuICAgICAgICAgICAgZ2VuKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRvU3RhdGVtZW50OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5EZWNvcmF0b3I6XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmlyc3RBc3NpZ25tZW50OlxuICAgICAgICAgICAgZ2VuKCcgPSAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmlyc3RQdW5jdHVhdGlvbjpcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdwcml2YXRlJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHVibGljJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgX3RzIGZyb20gJy4uLy4uL3V0aWxzL3RzLWludGVybmFsJztcbmltcG9ydCBtYXJrZWQgZnJvbSAnbWFya2VkJztcbmltcG9ydCB7IGdldE5ld0xpbmVDaGFyYWN0ZXIsIGNvbXBpbGVySG9zdCwgZCwgZGV0ZWN0SW5kZW50IH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBSb3V0ZXJQYXJzZXIgfSBmcm9tICcuLi8uLi91dGlscy9yb3V0ZXIucGFyc2VyJztcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSAnLi9jb2RlZ2VuJztcblxuaW50ZXJmYWNlIE5vZGVPYmplY3Qge1xuICAgIGtpbmQ6IE51bWJlcjtcbiAgICBwb3M6IE51bWJlcjtcbiAgICBlbmQ6IE51bWJlcjtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgaW5pdGlhbGl6ZXI6IE5vZGVPYmplY3QsXG4gICAgbmFtZT86IHsgdGV4dDogc3RyaW5nIH07XG4gICAgZXhwcmVzc2lvbj86IE5vZGVPYmplY3Q7XG4gICAgZWxlbWVudHM/OiBOb2RlT2JqZWN0W107XG4gICAgYXJndW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIHByb3BlcnRpZXM/OiBhbnlbXTtcbiAgICBwYXJzZXJDb250ZXh0RmxhZ3M/OiBOdW1iZXI7XG4gICAgZXF1YWxzR3JlYXRlclRoYW5Ub2tlbj86IE5vZGVPYmplY3RbXTtcbiAgICBwYXJhbWV0ZXJzPzogTm9kZU9iamVjdFtdO1xuICAgIENvbXBvbmVudD86IFN0cmluZztcbiAgICBib2R5Pzoge1xuICAgICAgICBwb3M6IE51bWJlcjtcbiAgICAgICAgZW5kOiBOdW1iZXI7XG4gICAgICAgIHN0YXRlbWVudHM6IE5vZGVPYmplY3RbXTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBEZXBzIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGZpbGU/OiBzdHJpbmc7XG4gICAgc291cmNlQ29kZT86IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcblxuICAgIC8vQ29tcG9uZW50XG5cbiAgICBhbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBzdHJpbmc7XG4gICAgZW5jYXBzdWxhdGlvbj86IHN0cmluZztcbiAgICBlbnRyeUNvbXBvbmVudHM/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBleHBvcnRBcz86IHN0cmluZztcbiAgICBob3N0Pzogc3RyaW5nO1xuICAgIGlucHV0cz86IHN0cmluZ1tdO1xuICAgIGludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBtb2R1bGVJZD86IHN0cmluZztcbiAgICBvdXRwdXRzPzogc3RyaW5nW107XG4gICAgcXVlcmllcz86IERlcHNbXTsgLy8gVE9ET1xuICAgIHNlbGVjdG9yPzogc3RyaW5nO1xuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdO1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIHRlbXBsYXRlPzogc3RyaW5nO1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nW107XG4gICAgdmlld1Byb3ZpZGVycz86IHN0cmluZ1tdO1xuXG4gICAgaW5wdXRzQ2xhc3M/OiBPYmplY3RbXTtcblxuICAgIC8vY29tbW9uXG4gICAgcHJvdmlkZXJzPzogRGVwc1tdO1xuXG4gICAgLy9tb2R1bGVcbiAgICBkZWNsYXJhdGlvbnM/OiBEZXBzW107XG4gICAgYm9vdHN0cmFwPzogRGVwc1tdO1xuXG4gICAgaW1wb3J0cz86IERlcHNbXTtcbiAgICBleHBvcnRzPzogRGVwc1tdO1xufVxuXG5pbnRlcmZhY2UgU3ltYm9sRGVwcyB7XG4gICAgZnVsbDogc3RyaW5nO1xuICAgIGFsaWFzOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBEZXBlbmRlbmNpZXMge1xuXG4gICAgcHJpdmF0ZSBmaWxlczogc3RyaW5nW107XG4gICAgcHJpdmF0ZSBwcm9ncmFtOiB0cy5Qcm9ncmFtO1xuICAgIHByaXZhdGUgcHJvZ3JhbUNvbXBvbmVudDogdHMuUHJvZ3JhbTtcbiAgICBwcml2YXRlIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcjtcbiAgICBwcml2YXRlIHR5cGVDaGVja2VyQ29tcG9uZW50OiB0cy5UeXBlQ2hlY2tlcjtcbiAgICBwcml2YXRlIGVuZ2luZTogYW55O1xuICAgIHByaXZhdGUgX19jYWNoZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSBfX25zTW9kdWxlOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIHVua25vd24gPSAnPz8/JztcblxuICAgIGNvbnN0cnVjdG9yKGZpbGVzOiBzdHJpbmdbXSwgb3B0aW9uczogYW55KSB7XG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlcztcbiAgICAgICAgY29uc3QgdHJhbnNwaWxlT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHRhcmdldDogdHMuU2NyaXB0VGFyZ2V0LkVTNSxcbiAgICAgICAgICAgIG1vZHVsZTogdHMuTW9kdWxlS2luZC5Db21tb25KUyxcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBvcHRpb25zLnRzY29uZmlnRGlyZWN0b3J5XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0odGhpcy5maWxlcywgdHJhbnNwaWxlT3B0aW9ucywgY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJyZWFrTGluZXModGV4dCkge1xuICAgICAgICB2YXIgX3QgPSB0ZXh0O1xuICAgICAgICBpZiAodHlwZW9mIF90ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgX3QgPSBfdC5yZXBsYWNlKC8oXFxuKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIF90ID0gX3QucmVwbGFjZSgvKDxicj4pJC9nbSwgJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdDtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXMoKSB7XG4gICAgICAgIGxldCBkZXBzOiBPYmplY3QgPSB7XG4gICAgICAgICAgICAnbW9kdWxlcyc6IFtdLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnOiBbXSxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcyc6IFtdLFxuICAgICAgICAgICAgJ3BpcGVzJzogW10sXG4gICAgICAgICAgICAnZGlyZWN0aXZlcyc6IFtdLFxuICAgICAgICAgICAgJ3JvdXRlcyc6IFtdLFxuICAgICAgICAgICAgJ2NsYXNzZXMnOiBbXSxcbiAgICAgICAgICAgICdpbnRlcmZhY2VzJzogW11cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNvdXJjZUZpbGVzID0gdGhpcy5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkgfHwgW107XG5cbiAgICAgICAgc291cmNlRmlsZXMubWFwKChmaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCBmaWxlUGF0aCA9IGZpbGUuZmlsZU5hbWU7XG5cbiAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSAnLnRzJykge1xuXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmxhc3RJbmRleE9mKCcuZC50cycpID09PSAtMSAmJiBmaWxlUGF0aC5sYXN0SW5kZXhPZignc3BlYy50cycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygncGFyc2luZycsIGZpbGVQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTb3VyY2VGaWxlRGVjb3JhdG9ycyhmaWxlLCBkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUsIGZpbGUuZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkZXBzO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmxpbmtNb2R1bGVzQW5kUm91dGVzKCk7XG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmNvbnN0cnVjdE1vZHVsZXNUcmVlKCk7XG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmNvbnN0cnVjdFJvdXRlc1RyZWUoKTtcblxuICAgICAgICByZXR1cm4gZGVwcztcbiAgICB9XG5cblxuICAgIHByaXZhdGUgZ2V0U291cmNlRmlsZURlY29yYXRvcnMoc3JjRmlsZTogdHMuU291cmNlRmlsZSwgb3V0cHV0U3ltYm9sczogT2JqZWN0KTogdm9pZCB7XG5cbiAgICAgICAgbGV0IGNsZWFuZXIgPSAocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgICAgIGxldCBmaWxlID0gc3JjRmlsZS5maWxlTmFtZS5yZXBsYWNlKGNsZWFuZXIsICcnKTtcblxuICAgICAgICB0aGlzLnByb2dyYW1Db21wb25lbnQgPSB0cy5jcmVhdGVQcm9ncmFtKFtmaWxlXSwge30pO1xuICAgICAgICBsZXQgc291cmNlRmlsZSA9IHRoaXMucHJvZ3JhbUNvbXBvbmVudC5nZXRTb3VyY2VGaWxlKGZpbGUpO1xuICAgICAgICB0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50ID0gdGhpcy5wcm9ncmFtQ29tcG9uZW50LmdldFR5cGVDaGVja2VyKHRydWUpO1xuXG4gICAgICAgIHRzLmZvckVhY2hDaGlsZChzcmNGaWxlLCAobm9kZTogdHMuTm9kZSkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgZGVwczogRGVwcyA9IDxEZXBzPnt9O1xuICAgICAgICAgICAgaWYgKG5vZGUuZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICAgIGxldCB2aXNpdE5vZGUgPSAodmlzaXRlZE5vZGUsIGluZGV4KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1ldGFkYXRhID0gbm9kZS5kZWNvcmF0b3JzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wcyA9IHRoaXMuZmluZFByb3BzKHZpc2l0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDb21wb25lbnRJTyhmaWxlLCBzb3VyY2VGaWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc01vZHVsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogdGhpcy5nZXRNb2R1bGVQcm92aWRlcnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogdGhpcy5nZXRNb2R1bGVEZWNsYXRpb25zKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRzOiB0aGlzLmdldE1vZHVsZUltcG9ydHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydHM6IHRoaXMuZ2V0TW9kdWxlRXhwb3J0cyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9vdHN0cmFwOiB0aGlzLmdldE1vZHVsZUJvb3RzdHJhcChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUm91dGVyUGFyc2VyLmhhc1JvdXRlck1vZHVsZUluSW1wb3J0cyhkZXBzLmltcG9ydHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZE1vZHVsZVdpdGhSb3V0ZXMobmFtZSwgdGhpcy5nZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkTW9kdWxlKG5hbWUsIGRlcHMuaW1wb3J0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtb2R1bGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzQ29tcG9uZW50KG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocHJvcHMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHV0aWwuaW5zcGVjdChwcm9wcywgeyBzaG93SGlkZGVuOiB0cnVlLCBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IHRoaXMuZ2V0Q29tcG9uZW50Q2hhbmdlRGV0ZWN0aW9uKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNhcHN1bGF0aW9uOiB0aGlzLmdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24ocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXM6IHRoaXMuZ2V0Q29tcG9uZW50RXhwb3J0QXMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHRoaXMuZ2V0Q29tcG9uZW50SG9zdChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB0aGlzLmdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE8gd2FpdGluZyBkb2MgaW5mb3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJZDogdGhpcy5nZXRDb21wb25lbnRNb2R1bGVJZChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogdGhpcy5nZXRDb21wb25lbnRPdXRwdXRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3F1ZXJpZXM/OiBEZXBzW107IC8vIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogdGhpcy5nZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVVcmxzOiB0aGlzLmdldENvbXBvbmVudFN0eWxlVXJscyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiB0aGlzLmdldENvbXBvbmVudFN0eWxlcyhwcm9wcyksIC8vIFRPRE8gZml4IGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHRoaXMuZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdQcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50Vmlld1Byb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzQ2xhc3M6IElPLmlucHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzQ2xhc3M6IElPLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc0NsYXNzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHNDbGFzczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NvbXBvbmVudHMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNJbmplY3RhYmxlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IElPLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2luamVjdGFibGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzUGlwZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwaXBlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ3BpcGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzRGlyZWN0aXZlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydkaXJlY3RpdmVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2NhY2hlW25hbWVdID0gZGVwcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZmlsdGVyQnlEZWNvcmF0b3JzID0gKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC8oTmdNb2R1bGV8Q29tcG9uZW50fEluamVjdGFibGV8UGlwZXxEaXJlY3RpdmUpLy50ZXN0KG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBub2RlLmRlY29yYXRvcnNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihmaWx0ZXJCeURlY29yYXRvcnMpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHZpc2l0Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuc3ltYm9sLmZsYWdzID09PSB0cy5TeW1ib2xGbGFncy5DbGFzcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q29tcG9uZW50SU8oZmlsZSwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NsYXNzZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihub2RlLnN5bWJvbC5mbGFncyA9PT0gdHMuU3ltYm9sRmxhZ3MuSW50ZXJmYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRJbnRlcmZhY2VJTyhmaWxlLCBzb3VyY2VGaWxlLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMua2luZCA9IElPLmtpbmQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snaW50ZXJmYWNlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldFJvdXRlSU8oZmlsZSwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgaWYoSU8ucm91dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdSb3V0ZXM7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3V0ZXMgPSBKU09OLnBhcnNlKElPLnJvdXRlcy5yZXBsYWNlKC8gL2dtLCAnJykpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1JvdXRlcyBwYXJzaW5nIGVycm9yLCBtYXliZSBhIHRyYWlsaW5nIGNvbW1hIG9yIGFuIGV4dGVybmFsIHZhcmlhYmxlID8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ3JvdXRlcyddID0gWy4uLm91dHB1dFN5bWJvbHNbJ3JvdXRlcyddLCAuLi5uZXdSb3V0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENvbXBvbmVudElPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjbGFzc2VzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vRmluZCB0aGUgcm9vdCBtb2R1bGUgd2l0aCBib290c3RyYXBNb2R1bGUgY2FsbFxuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgcmVjdXNpdmVseSBpbiBleHByZXNzaW9uIG5vZGVzIG9uZSB3aXRoIG5hbWUgJ2Jvb3RzdHJhcE1vZHVsZSdcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvb3RNb2R1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHROb2RlID0gdGhpcy5maW5kRXhwcmVzc2lvbkJ5TmFtZShub2RlLCAnYm9vdHN0cmFwTW9kdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdE5vZGUuYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocmVzdWx0Tm9kZS5hcmd1bWVudHMsIGZ1bmN0aW9uKGFyZ3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFyZ3VtZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBhcmd1bWVudC50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vdE1vZHVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5zZXRSb290TW9kdWxlKHJvb3RNb2R1bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cbiAgICBwcml2YXRlIGRlYnVnKGRlcHM6IERlcHMpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdkZWJ1ZycsIGAke2RlcHMubmFtZX06YCk7XG4gICAgICAgIFtcbiAgICAgICAgICAgICdpbXBvcnRzJywgJ2V4cG9ydHMnLCAnZGVjbGFyYXRpb25zJywgJ3Byb3ZpZGVycycsICdib290c3RyYXAnXG4gICAgICAgIF0uZm9yRWFjaChzeW1ib2xzID0+IHtcbiAgICAgICAgICAgIGlmIChkZXBzW3N5bWJvbHNdICYmIGRlcHNbc3ltYm9sc10ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnJywgYC0gJHtzeW1ib2xzfTpgKTtcbiAgICAgICAgICAgICAgICBkZXBzW3N5bWJvbHNdLm1hcChpID0+IGkubmFtZSkuZm9yRWFjaChkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCcnLCBgXFx0LSAke2R9YCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kRXhwcmVzc2lvbkJ5TmFtZShlbnRyeU5vZGUsIG5hbWUpIHtcbiAgICAgICAgbGV0IHJlc3VsdCxcbiAgICAgICAgICAgIGxvb3AgPSBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uICYmICFub2RlLmV4cHJlc3Npb24ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBsb29wKG5vZGUuZXhwcmVzc2lvbiwgbmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24ubmFtZS50ZXh0ID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBsb29wKGVudHJ5Tm9kZSwgbmFtZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0NvbXBvbmVudChtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdDb21wb25lbnQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQaXBlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ1BpcGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNEaXJlY3RpdmUobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnRGlyZWN0aXZlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSW5qZWN0YWJsZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdJbmplY3RhYmxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTW9kdWxlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ05nTW9kdWxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFR5cGUobmFtZSkge1xuICAgICAgICBsZXQgdHlwZTtcbiAgICAgICAgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjb21wb25lbnQnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ2NvbXBvbmVudCc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ3BpcGUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ3BpcGUnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdtb2R1bGUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ21vZHVsZSc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2RpcmVjdGl2ZScpICE9PSAtMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSAnZGlyZWN0aXZlJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbGVOYW1lKG5vZGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3NlbGVjdG9yJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRFeHBvcnRBcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydEFzJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdwcm92aWRlcnMnKS5tYXAoKHByb3ZpZGVyTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIocHJvdmlkZXJOYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kUHJvcHModmlzaXRlZE5vZGUpIHtcbiAgICAgICAgaWYodmlzaXRlZE5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLnBvcCgpLnByb3BlcnRpZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZURlY2xhdGlvbnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdkZWNsYXJhdGlvbnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBjb21wb25lbnQgPSB0aGlzLmZpbmRDb21wb25lbnRTZWxlY3RvckJ5TmFtZShuYW1lKTtcblxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUltcG9ydHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHNSYXcocHJvcHMsICdpbXBvcnRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVJbXBvcnRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW1wb3J0cycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlRXhwb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydHMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEhvc3QocHJvcHM6IE5vZGVPYmplY3RbXSk6IE9iamVjdCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHNPYmplY3QocHJvcHMsICdob3N0Jyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVCb290c3RyYXAocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdib290c3RyYXAnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdpbnB1dHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERlY29yYXRvck9mVHlwZShub2RlLCBkZWNvcmF0b3JUeXBlKSB7XG4gICAgICB2YXIgZGVjb3JhdG9ycyA9IG5vZGUuZGVjb3JhdG9ycyB8fCBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWNvcmF0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChkZWNvcmF0b3JzW2ldLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSBkZWNvcmF0b3JUeXBlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlY29yYXRvcnNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdElucHV0KHByb3BlcnR5LCBpbkRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaW5BcmdzID0gaW5EZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBpbkFyZ3MubGVuZ3RoID8gaW5BcmdzWzBdLnRleHQgOiBwcm9wZXJ0eS5uYW1lLnRleHQsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcy52aXNpdFR5cGUocHJvcGVydHkpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFR5cGUobm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gbm9kZSA/IHRoaXMudHlwZUNoZWNrZXJDb21wb25lbnQudHlwZVRvU3RyaW5nKHRoaXMudHlwZUNoZWNrZXJDb21wb25lbnQuZ2V0VHlwZUF0TG9jYXRpb24obm9kZSkpIDogJ3ZvaWQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRPdXRwdXQocHJvcGVydHksIG91dERlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgb3V0QXJncyA9IG91dERlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IG91dEFyZ3MubGVuZ3RoID8gb3V0QXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1B1YmxpYyhtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKG1lbWJlci5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzUHVibGljOiBib29sZWFuID0gbWVtYmVyLm1vZGlmaWVycy5zb21lKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGlzUHVibGljKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbnRlcm5hbE1lbWJlcihtZW1iZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQcml2YXRlT3JJbnRlcm5hbChtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG1lbWJlci5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzUHJpdmF0ZTogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShtb2RpZmllciA9PiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkKTtcbiAgICAgICAgICAgIGlmIChpc1ByaXZhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pc0ludGVybmFsTWVtYmVyKG1lbWJlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0ludGVybmFsTWVtYmVyKG1lbWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpbnRlcm5hbFRhZ3M6IHN0cmluZ1tdID0gWydpbnRlcm5hbCcsICdwcml2YXRlJywgJ2hpZGRlbiddO1xuICAgICAgICBpZiAobWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBtZW1iZXIuanNEb2MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9jLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgZG9jLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbFRhZ3MuaW5kZXhPZih0YWcudGFnTmFtZS50ZXh0KSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNBbmd1bGFyTGlmZWN5Y2xlSG9vayhtZXRob2ROYW1lKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IEFOR1VMQVJfTElGRUNZQ0xFX01FVEhPRFMgPSBbXG4gICAgICAgICAgICAnbmdPbkluaXQnLCAnbmdPbkNoYW5nZXMnLCAnbmdEb0NoZWNrJywgJ25nT25EZXN0cm95JywgJ25nQWZ0ZXJDb250ZW50SW5pdCcsICduZ0FmdGVyQ29udGVudENoZWNrZWQnLFxuICAgICAgICAgICAgJ25nQWZ0ZXJWaWV3SW5pdCcsICduZ0FmdGVyVmlld0NoZWNrZWQnLCAnd3JpdGVWYWx1ZScsICdyZWdpc3Rlck9uQ2hhbmdlJywgJ3JlZ2lzdGVyT25Ub3VjaGVkJywgJ3NldERpc2FibGVkU3RhdGUnXG4gICAgICAgIF07XG4gICAgICAgIHJldHVybiBBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTLmluZGV4T2YobWV0aG9kTmFtZSkgPj0gMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0Q29uc3RydWN0b3JEZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAobWV0aG9kLnBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgIHZhciBfcGFyYW1ldGVycyA9IFtdLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IG1ldGhvZC5wYXJhbWV0ZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5pc1B1YmxpYyhtZXRob2QucGFyYW1ldGVyc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgX3BhcmFtZXRlcnMucHVzaCh0aGF0LnZpc2l0QXJndW1lbnQobWV0aG9kLnBhcmFtZXRlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3BhcmFtZXRlcnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0Q2FsbERlY2xhcmF0aW9uKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRJbmRleERlY2xhcmF0aW9uKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRNZXRob2REZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIG5hbWU6IG1ldGhvZC5uYW1lLnRleHQsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKG1ldGhvZC5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpLFxuICAgICAgICAgICAgYXJnczogbWV0aG9kLnBhcmFtZXRlcnMgPyBtZXRob2QucGFyYW1ldGVycy5tYXAoKHByb3ApID0+IHRoaXMudmlzaXRBcmd1bWVudChwcm9wKSkgOiBbXSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHRoaXMudmlzaXRUeXBlKG1ldGhvZC50eXBlKVxuICAgICAgICB9LFxuICAgICAgICAgICAganNkb2N0YWdzID0gX3RzLmdldEpTRG9jcyhtZXRob2QpO1xuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IGpzZG9jdGFnc1swXS50YWdzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEFyZ3VtZW50KGFyZykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogYXJnLm5hbWUudGV4dCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKGFyZylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TmFtZXNDb21wYXJlRm4obmFtZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBuYW1lID0gbmFtZSB8fCAnbmFtZSc7XG4gICAgICAgIHJldHVybiAoYSwgYikgPT4gYVtuYW1lXS5sb2NhbGVDb21wYXJlKGJbbmFtZV0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RyaW5naWZ5RGVmYXVsdFZhbHVlKG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG5vZGUudGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUudGV4dDtcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZhbHNlJztcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0UHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHByb3BlcnR5Lm5hbWUudGV4dCxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogcHJvcGVydHkuaW5pdGlhbGl6ZXIgPyB0aGlzLnN0cmluZ2lmeURlZmF1bHRWYWx1ZShwcm9wZXJ0eS5pbml0aWFsaXplcikgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShwcm9wZXJ0eSksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHByb3BlcnR5LnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0TWVtYmVycyhtZW1iZXJzKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBpbnB1dHMgPSBbXTtcbiAgICAgICAgdmFyIG91dHB1dHMgPSBbXTtcbiAgICAgICAgdmFyIG1ldGhvZHMgPSBbXTtcbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBbXTtcbiAgICAgICAgdmFyIGtpbmQ7XG4gICAgICAgIHZhciBpbnB1dERlY29yYXRvciwgb3V0RGVjb3JhdG9yO1xuXG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZW1iZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpbnB1dERlY29yYXRvciA9IHRoaXMuZ2V0RGVjb3JhdG9yT2ZUeXBlKG1lbWJlcnNbaV0sICdJbnB1dCcpO1xuICAgICAgICAgICAgb3V0RGVjb3JhdG9yID0gdGhpcy5nZXREZWNvcmF0b3JPZlR5cGUobWVtYmVyc1tpXSwgJ091dHB1dCcpO1xuXG4gICAgICAgICAgICBraW5kID0gbWVtYmVyc1tpXS5raW5kO1xuXG4gICAgICAgICAgICBpZiAoaW5wdXREZWNvcmF0b3IpIHtcbiAgICAgICAgICAgICAgICBpbnB1dHMucHVzaCh0aGlzLnZpc2l0SW5wdXQobWVtYmVyc1tpXSwgaW5wdXREZWNvcmF0b3IpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3V0RGVjb3JhdG9yKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0cy5wdXNoKHRoaXMudmlzaXRPdXRwdXQobWVtYmVyc1tpXSwgb3V0RGVjb3JhdG9yKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzUHJpdmF0ZU9ySW50ZXJuYWwobWVtYmVyc1tpXSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2REZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTWV0aG9kU2lnbmF0dXJlKSAmJlxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5pc0FuZ3VsYXJMaWZlY3ljbGVIb29rKG1lbWJlcnNbaV0ubmFtZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnB1c2godGhpcy52aXNpdE1ldGhvZERlY2xhcmF0aW9uKG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlTaWduYXR1cmUgfHwgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkdldEFjY2Vzc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0UHJvcGVydHkobWVtYmVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNhbGxTaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKHRoaXMudmlzaXRDYWxsRGVjbGFyYXRpb24obWVtYmVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkluZGV4U2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0SW5kZXhEZWNsYXJhdGlvbihtZW1iZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9jb25zdHJ1Y3RvclByb3BlcnRpZXMgPSB0aGlzLnZpc2l0Q29uc3RydWN0b3JEZWNsYXJhdGlvbihtZW1iZXJzW2ldKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGogPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuID0gX2NvbnN0cnVjdG9yUHJvcGVydGllcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGZvcihqOyBqPGxlbjsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2goX2NvbnN0cnVjdG9yUHJvcGVydGllc1tqXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpbnB1dHMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuICAgICAgICBvdXRwdXRzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcbiAgICAgICAgcHJvcGVydGllcy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlucHV0cyxcbiAgICAgICAgICAgIG91dHB1dHMsXG4gICAgICAgICAgICBtZXRob2RzLFxuICAgICAgICAgICAgcHJvcGVydGllcyxcbiAgICAgICAgICAgIGtpbmRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RGlyZWN0aXZlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc2VsZWN0b3I7XG4gICAgICAgIHZhciBleHBvcnRBcztcbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHNbMF0ucHJvcGVydGllcztcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzW2ldLm5hbWUudGV4dCA9PT0gJ3NlbGVjdG9yJykge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBvbmx5IHdvcmsgaWYgc2VsZWN0b3IgaXMgaW5pdGlhbGl6ZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gcHJvcGVydGllc1tpXS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb3BlcnRpZXNbaV0ubmFtZS50ZXh0ID09PSAnZXhwb3J0QXMnKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIG9ubHkgd29yayBpZiBzZWxlY3RvciBpcyBpbml0aWFsaXplZCBhcyBhIHN0cmluZyBsaXRlcmFsXG4gICAgICAgICAgICAgICAgZXhwb3J0QXMgPSBwcm9wZXJ0aWVzW2ldLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgICBleHBvcnRBc1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQaXBlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgcmV0dXJuIGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ1BpcGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNNb2R1bGVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgICByZXR1cm4gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnTmdNb2R1bGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNEaXJlY3RpdmVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dDtcbiAgICAgICAgcmV0dXJuIGRlY29yYXRvcklkZW50aWZpZXJUZXh0ID09PSAnRGlyZWN0aXZlJyB8fCBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9PT0gJ0NvbXBvbmVudCc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1NlcnZpY2VEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgICByZXR1cm4gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnSW5qZWN0YWJsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZU5hbWUsIGNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHN5bWJvbCA9IHRoaXMucHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpLmdldFN5bWJvbEF0TG9jYXRpb24oY2xhc3NEZWNsYXJhdGlvbi5uYW1lKTtcbiAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSk7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBjbGFzc0RlY2xhcmF0aW9uLm5hbWUudGV4dDtcbiAgICAgICAgdmFyIGRpcmVjdGl2ZUluZm87XG4gICAgICAgIHZhciBtZW1iZXJzO1xuXG4gICAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNEaXJlY3RpdmVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVJbmZvID0gdGhpcy52aXNpdERpcmVjdGl2ZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiBtZW1iZXJzLmlucHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IG1lbWJlcnMub3V0cHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1NlcnZpY2VEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycyk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNQaXBlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkgfHwgdGhpcy5pc01vZHVsZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycyk7XG5cbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZFxuICAgICAgICAgICAgfV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEVudW1EZWNsYXJhdGlvbihmaWxlTmFtZSwgbm9kZSkge1xuICAgICAgICBpZiggbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zICkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlLnR5cGVOYW1lICYmIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlLnR5cGVOYW1lLnRleHQgPT09ICdSb3V0ZXMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkUm91dGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5uYW1lLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZ2VuZXJhdGUobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLmluaXRpYWxpemVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXM6IGdlbmVyYXRlKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJvdXRlSU8oZmlsZW5hbWUsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRFbnVtRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50SU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0Q2xhc3NEZWNsYXJhdGlvbihmaWxlbmFtZSwgc3RhdGVtZW50KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbnRlcmZhY2VJTyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlLCBub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVtZW50LnBvcyA9PT0gbm9kZS5wb3MgJiYgc3RhdGVtZW50LmVuZCA9PT0gbm9kZS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudE91dHB1dHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ291dHB1dHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFByb3ZpZGVycyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3Byb3ZpZGVycycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50Vmlld1Byb3ZpZGVycyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3ZpZXdQcm92aWRlcnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudERpcmVjdGl2ZXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdkaXJlY3RpdmVzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgICAgICBpZGVudGlmaWVyLnNlbGVjdG9yID0gdGhpcy5maW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZSk7XG4gICAgICAgICAgICBpZGVudGlmaWVyLmxhYmVsID0gJyc7XG4gICAgICAgICAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZURlZXBJbmRlbnRpZmllcihuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBsZXQgbnNNb2R1bGUgPSBuYW1lLnNwbGl0KCcuJyksXG4gICAgICAgICAgICB0eXBlID0gdGhpcy5nZXRUeXBlKG5hbWUpO1xuICAgICAgICBpZiAobnNNb2R1bGUubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICAvLyBjYWNoZSBkZXBzIHdpdGggdGhlIHNhbWUgbmFtZXNwYWNlIChpLmUgU2hhcmVkLiopXG4gICAgICAgICAgICBpZiAodGhpcy5fX25zTW9kdWxlW25zTW9kdWxlWzBdXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0ucHVzaChuYW1lKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX25zTW9kdWxlW25zTW9kdWxlWzBdXSA9IFtuYW1lXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuczogbnNNb2R1bGVbMF0sXG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRUZW1wbGF0ZVVybChwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZVVybHModGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndGVtcGxhdGVVcmwnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd0ZW1wbGF0ZScsIHRydWUpLnBvcCgpXG4gICAgICAgIGlmKHQpIHtcbiAgICAgICAgICAgIHQgPSBkZXRlY3RJbmRlbnQodCwgMCk7XG4gICAgICAgICAgICB0ID0gdC5yZXBsYWNlKC9cXG4vLCAnJyk7XG4gICAgICAgICAgICB0ID0gdC5yZXBsYWNlKC8gKyQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFN0eWxlVXJscyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZVVybHModGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnc3R5bGVVcmxzJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U3R5bGVzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzdHlsZXMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudE1vZHVsZUlkKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnbW9kdWxlSWQnKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudENoYW5nZURldGVjdGlvbihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2NoYW5nZURldGVjdGlvbicpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RW5jYXBzdWxhdGlvbihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZW5jYXBzdWxhdGlvbicpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2FuaXRpemVVcmxzKHVybHM6IHN0cmluZ1tdKSB7XG4gICAgICAgIHJldHVybiB1cmxzLm1hcCh1cmwgPT4gdXJsLnJlcGxhY2UoJy4vJywgJycpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHNPYmplY3QocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogT2JqZWN0IHtcbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHBhcnNlUHJvcGVydGllcyA9IChub2RlOiBOb2RlT2JqZWN0KTogT2JqZWN0ID0+IHtcbiAgICAgICAgICAgIGxldCBvYmogPSB7fTtcbiAgICAgICAgICAgIChub2RlLmluaXRpYWxpemVyLnByb3BlcnRpZXMgfHwgW10pLmZvckVhY2goKHByb3A6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBvYmpbcHJvcC5uYW1lLnRleHRdID0gcHJvcC5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVByb3BlcnRpZXMpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwc1Jhdyhwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBhbnkge1xuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlcHMgfHwgW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzKHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IHN0cmluZ1tdIHtcblxuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xUZXh0ID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKHRleHQuaW5kZXhPZignLycpICE9PSAtMSAmJiAhbXVsdGlMaW5lKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQuc3BsaXQoJy8nKS5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgYnVpbGRJZGVudGlmaWVyTmFtZSA9IChub2RlOiBOb2RlT2JqZWN0LCBuYW1lID0gJycpID0+IHtcblxuICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lID8gYC4ke25hbWV9YCA6IG5hbWU7XG5cbiAgICAgICAgICAgICAgICBsZXQgbm9kZU5hbWUgPSB0aGlzLnVua25vd247XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUubmFtZS50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLmV4cHJlc3Npb24udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmKG5vZGUuZXhwcmVzc2lvbi5lbGVtZW50cykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5leHByZXNzaW9uLmVsZW1lbnRzLm1hcCggZWwgPT4gZWwudGV4dCApLmpvaW4oJywgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBgWyR7bm9kZU5hbWV9XWA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09ICB0cy5TeW50YXhLaW5kLlNwcmVhZEVsZW1lbnRFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgLi4uJHtub2RlTmFtZX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YnVpbGRJZGVudGlmaWVyTmFtZShub2RlLmV4cHJlc3Npb24sIG5vZGVOYW1lKX0ke25hbWV9YFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYCR7bm9kZS50ZXh0fS4ke25hbWV9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbiA9IChvOiBOb2RlT2JqZWN0KTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIC8vIHBhcnNlIGV4cHJlc3Npb25zIHN1Y2ggYXM6XG4gICAgICAgICAgICAvLyB7IHByb3ZpZGU6IEFQUF9CQVNFX0hSRUYsIHVzZVZhbHVlOiAnLycgfSxcbiAgICAgICAgICAgIC8vIG9yXG4gICAgICAgICAgICAvLyB7IHByb3ZpZGU6ICdEYXRlJywgdXNlRmFjdG9yeTogKGQxLCBkMikgPT4gbmV3IERhdGUoKSwgZGVwczogWydkMScsICdkMiddIH1cblxuICAgICAgICAgICAgbGV0IF9nZW5Qcm92aWRlck5hbWU6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBsZXQgX3Byb3ZpZGVyUHJvcHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICAgIChvLnByb3BlcnRpZXMgfHwgW10pLmZvckVhY2goKHByb3A6IE5vZGVPYmplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCBpZGVudGlmaWVyID0gcHJvcC5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgICAgIGlmIChwcm9wLmluaXRpYWxpemVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyID0gYCcke2lkZW50aWZpZXJ9J2A7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gbGFtYmRhIGZ1bmN0aW9uIChpLmUgdXNlRmFjdG9yeSlcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5ib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbXMgPSAocHJvcC5pbml0aWFsaXplci5wYXJhbWV0ZXJzIHx8IDxhbnk+W10pLm1hcCgocGFyYW1zOiBOb2RlT2JqZWN0KSA9PiBwYXJhbXMubmFtZS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAoJHtwYXJhbXMuam9pbignLCAnKX0pID0+IHt9YDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBmYWN0b3J5IGRlcHMgYXJyYXlcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbGVtZW50cyA9IChwcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzIHx8IFtdKS5tYXAoKG46IE5vZGVPYmplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAnJHtuLnRleHR9J2A7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyID0gYFske2VsZW1lbnRzLmpvaW4oJywgJyl9XWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgX3Byb3ZpZGVyUHJvcHMucHVzaChbXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lIHByb3ZpZGVcbiAgICAgICAgICAgICAgICAgICAgcHJvcC5uYW1lLnRleHQsXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lIE9wYXF1ZVRva2VuIG9yICdTdHJpbmdUb2tlbidcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllclxuXG4gICAgICAgICAgICAgICAgXS5qb2luKCc6ICcpKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBgeyAke19wcm92aWRlclByb3BzLmpvaW4oJywgJyl9IH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9sRWxlbWVudHMgPSAobzogTm9kZU9iamVjdCB8IGFueSk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOiBBbmd1bGFyRmlyZU1vZHVsZS5pbml0aWFsaXplQXBwKGZpcmViYXNlQ29uZmlnKVxuICAgICAgICAgICAgaWYgKG8uYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGJ1aWxkSWRlbnRpZmllck5hbWUoby5leHByZXNzaW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIGZ1bmN0aW9uIGFyZ3VtZW50cyBjb3VsZCBiZSByZWFsbHkgY29tcGxleGUuIFRoZXJlIGFyZSBzb1xuICAgICAgICAgICAgICAgIC8vIG1hbnkgdXNlIGNhc2VzIHRoYXQgd2UgY2FuJ3QgaGFuZGxlLiBKdXN0IHByaW50IFwiYXJnc1wiIHRvIGluZGljYXRlXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB3ZSBoYXZlIGFyZ3VtZW50cy5cblxuICAgICAgICAgICAgICAgIGxldCBmdW5jdGlvbkFyZ3MgPSBvLmFyZ3VtZW50cy5sZW5ndGggPiAwID8gJ2FyZ3MnIDogJyc7XG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSBgJHtjbGFzc05hbWV9KCR7ZnVuY3Rpb25BcmdzfSlgO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOiBTaGFyZWQuTW9kdWxlXG4gICAgICAgICAgICBlbHNlIGlmIChvLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IGJ1aWxkSWRlbnRpZmllck5hbWUobyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvLnRleHQgPyBvLnRleHQgOiBwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbihvKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xzID0gKG5vZGU6IE5vZGVPYmplY3QpOiBzdHJpbmdbXSA9PiB7XG5cbiAgICAgICAgICAgIGxldCB0ZXh0ID0gbm9kZS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VTeW1ib2xUZXh0KHRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLmluaXRpYWxpemVyLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHBhcnNlU3ltYm9sRWxlbWVudHMobm9kZS5pbml0aWFsaXplcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllclxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5pbml0aWFsaXplci5lbGVtZW50cy5tYXAocGFyc2VTeW1ib2xFbGVtZW50cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGRlcHMubWFwKHBhcnNlU3ltYm9scykucG9wKCkgfHwgW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fY2FjaGVbbmFtZV07XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBMaXZlU2VydmVyIGZyb20gJ2xpdmUtc2VydmVyJztcbmltcG9ydCAqIGFzIFNoZWxsanMgZnJvbSAnc2hlbGxqcyc7XG5pbXBvcnQgbWFya2VkIGZyb20gJ21hcmtlZCc7XG5cbmNvbnN0IGdsb2I6IGFueSA9IHJlcXVpcmUoJ2dsb2InKTtcblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IEh0bWxFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvaHRtbC5lbmdpbmUnO1xuaW1wb3J0IHsgTWFya2Rvd25FbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvbWFya2Rvd24uZW5naW5lJztcbmltcG9ydCB7IEZpbGVFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvZmlsZS5lbmdpbmUnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiwgSUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9kZXBlbmRlbmNpZXMuZW5naW5lJztcbmltcG9ydCB7IE5nZEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9uZ2QuZW5naW5lJztcbmltcG9ydCB7IFNlYXJjaEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9zZWFyY2guZW5naW5lJztcbmltcG9ydCB7IERlcGVuZGVuY2llcyB9IGZyb20gJy4vY29tcGlsZXIvZGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IFJvdXRlclBhcnNlciB9IGZyb20gJy4uL3V0aWxzL3JvdXRlci5wYXJzZXInO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4uL3V0aWxzL2RlZmF1bHRzJztcblxubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLFxuICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCksXG4gICAgJGh0bWxlbmdpbmUgPSBuZXcgSHRtbEVuZ2luZSgpLFxuICAgICRmaWxlZW5naW5lID0gbmV3IEZpbGVFbmdpbmUoKSxcbiAgICAkbWFya2Rvd25lbmdpbmUgPSBuZXcgTWFya2Rvd25FbmdpbmUoKSxcbiAgICAkbmdkZW5naW5lID0gbmV3IE5nZEVuZ2luZSgpLFxuICAgICRzZWFyY2hFbmdpbmUgPSBuZXcgU2VhcmNoRW5naW5lKCksXG4gICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uIHtcbiAgICBvcHRpb25zOk9iamVjdDtcbiAgICBmaWxlczogQXJyYXk8c3RyaW5nPjtcblxuICAgIGNvbmZpZ3VyYXRpb246SUNvbmZpZ3VyYXRpb247XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgY29tcG9kb2MgYXBwbGljYXRpb24gaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgb3B0aW9ucyB0aGF0IHNob3VsZCBiZSB1c2VkLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/Ok9iamVjdCkge1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIG9wdGlvbnMgKSB7XG4gICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhW29wdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhW29wdGlvbl0gPSBvcHRpb25zW29wdGlvbl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBjb21wb2RvY1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZW5lcmF0ZSgpIHtcbiAgICAgICAgJGh0bWxlbmdpbmUuaW5pdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFja2FnZUpzb24oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0RmlsZXMoZmlsZXM6QXJyYXk8c3RyaW5nPikge1xuICAgICAgICB0aGlzLmZpbGVzID0gZmlsZXM7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1BhY2thZ2VKc29uKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnU2VhcmNoaW5nIHBhY2thZ2UuanNvbiBmaWxlJyk7XG4gICAgICAgICRmaWxlZW5naW5lLmdldCgncGFja2FnZS5qc29uJykudGhlbigocGFja2FnZURhdGEpID0+IHtcbiAgICAgICAgICAgIGxldCBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShwYWNrYWdlRGF0YSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZERhdGEubmFtZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9PT0gQ09NUE9ET0NfREVGQVVMVFMudGl0bGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID0gcGFyc2VkRGF0YS5uYW1lICsgJyBkb2N1bWVudGF0aW9uJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyc2VkRGF0YS5kZXNjcmlwdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbiA9IHBhcnNlZERhdGEuZGVzY3JpcHRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygncGFja2FnZS5qc29uIGZpbGUgZm91bmQnKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc01hcmtkb3duKCk7XG4gICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdDb250aW51aW5nIHdpdGhvdXQgcGFja2FnZS5qc29uIGZpbGUnKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc01hcmtkb3duKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NNYXJrZG93bigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBSRUFETUUubWQgZmlsZScpO1xuICAgICAgICAkbWFya2Rvd25lbmdpbmUuZ2V0UmVhZG1lRmlsZSgpLnRoZW4oKHJlYWRtZURhdGE6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3JlYWRtZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdvdmVydmlldycsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ292ZXJ2aWV3J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucmVhZG1lID0gcmVhZG1lRGF0YTtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdSRUFETUUubWQgZmlsZSBmb3VuZCcpO1xuICAgICAgICAgICAgdGhpcy5nZXREZXBlbmRlbmNpZXNEYXRhKCk7XG4gICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdDb250aW51aW5nIHdpdGhvdXQgUkVBRE1FLm1kIGZpbGUnKTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5nZXREZXBlbmRlbmNpZXNEYXRhKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldERlcGVuZGVuY2llc0RhdGEoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdHZXQgZGVwZW5kZW5jaWVzIGRhdGEnKTtcblxuICAgICAgICBsZXQgY3Jhd2xlciA9IG5ldyBEZXBlbmRlbmNpZXMoXG4gICAgICAgICAgdGhpcy5maWxlcywge1xuICAgICAgICAgICAgdHNjb25maWdEaXJlY3Rvcnk6IHBhdGguZGlybmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpXG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBkZXBlbmRlbmNpZXNEYXRhID0gY3Jhd2xlci5nZXREZXBlbmRlbmNpZXMoKTtcblxuICAgICAgICAkZGVwZW5kZW5jaWVzRW5naW5lLmluaXQoZGVwZW5kZW5jaWVzRGF0YSk7XG5cbiAgICAgICAgLy9Sb3V0ZXJQYXJzZXIucHJpbnRSb3V0ZXMoKTtcblxuICAgICAgICB0aGlzLnByZXBhcmVNb2R1bGVzKCk7XG5cbiAgICAgICAgdGhpcy5wcmVwYXJlQ29tcG9uZW50cygpLnRoZW4oKHJlYWRtZURhdGEpID0+IHtcbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmRpcmVjdGl2ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZURpcmVjdGl2ZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmluamVjdGFibGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVJbmplY3RhYmxlcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUucm91dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVSb3V0ZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUucGlwZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZVBpcGVzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmNsYXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZUNsYXNzZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuaW50ZXJmYWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlSW50ZXJmYWNlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVDb3ZlcmFnZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NQYWdlcygpO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZU1vZHVsZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIG1vZHVsZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldE1vZHVsZXMoKS5tYXAobmdNb2R1bGUgPT4ge1xuICAgICAgICAgICAgWydkZWNsYXJhdGlvbnMnLCAnYm9vdHN0cmFwJywgJ2ltcG9ydHMnLCAnZXhwb3J0cyddLmZvckVhY2gobWV0YWRhdGFUeXBlID0+IHtcbiAgICAgICAgICAgICAgICBuZ01vZHVsZVttZXRhZGF0YVR5cGVdID0gbmdNb2R1bGVbbWV0YWRhdGFUeXBlXS5maWx0ZXIobWV0YURhdGFJdGVtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChtZXRhRGF0YUl0ZW0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXREaXJlY3RpdmVzKCkuc29tZShkaXJlY3RpdmUgPT4gZGlyZWN0aXZlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tcG9uZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDb21wb25lbnRzKCkuc29tZShjb21wb25lbnQgPT4gY29tcG9uZW50Lm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW9kdWxlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCkuc29tZShtb2R1bGUgPT4gbW9kdWxlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncGlwZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UGlwZXMoKS5zb21lKHBpcGUgPT4gcGlwZS5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbmdNb2R1bGUucHJvdmlkZXJzID0gbmdNb2R1bGUucHJvdmlkZXJzLmZpbHRlcihwcm92aWRlciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5qZWN0YWJsZXMoKS5zb21lKGluamVjdGFibGUgPT4gaW5qZWN0YWJsZS5uYW1lID09PSBwcm92aWRlci5uYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG5nTW9kdWxlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ21vZHVsZXMnLFxuICAgICAgICAgICAgY29udGV4dDogJ21vZHVsZXMnXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnbW9kdWxlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnbW9kdWxlJyxcbiAgICAgICAgICAgICAgICBtb2R1bGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByZXBhcmVQaXBlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgcGlwZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRQaXBlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ3BpcGVzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAncGlwZScsXG4gICAgICAgICAgICAgICAgcGlwZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByZXBhcmVDbGFzc2VzID0gKCkgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBjbGFzc2VzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDbGFzc2VzKCk7XG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdjbGFzc2VzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgY2xhc3M6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzW2ldXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByZXBhcmVJbnRlcmZhY2VzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBpbnRlcmZhY2VzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnRlcmZhY2VzKCk7XG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzLmxlbmd0aDtcbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnaW50ZXJmYWNlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnaW50ZXJmYWNlJyxcbiAgICAgICAgICAgICAgICBpbnRlcmZhY2U6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByZXBhcmVDb21wb25lbnRzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBjb21wb25lbnRzJyk7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldENvbXBvbmVudHMoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlybmFtZSA9IHBhdGguZGlybmFtZSh0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5maWxlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkbWVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgJ1JFQURNRS5tZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhyZWFkbWVGaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdSRUFETUUubWQgZXhpc3QgZm9yIHRoaXMgY29tcG9uZW50LCBpbmNsdWRlIGl0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGUocmVhZG1lRmlsZSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ucmVhZG1lID0gbWFya2VkKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnY29tcG9uZW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnY29tcG9uZW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsb29wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVEaXJlY3RpdmVzID0gKCkgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBkaXJlY3RpdmVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXREaXJlY3RpdmVzKCk7XG5cbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2RpcmVjdGl2ZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlSW5qZWN0YWJsZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGluamVjdGFibGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5qZWN0YWJsZXMoKTtcblxuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2luamVjdGFibGVzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAgICAgaW5qZWN0YWJsZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByZXBhcmVSb3V0ZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHJvdXRlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucm91dGVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRSb3V0ZXMoKTtcblxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICBuYW1lOiAncm91dGVzJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdyb3V0ZXMnXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVDb3ZlcmFnZSgpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSByZXBvcnQnKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBsb29wIHdpdGggY29tcG9uZW50cywgY2xhc3NlcywgaW5qZWN0YWJsZXMsIGludGVyZmFjZXMsIHBpcGVzXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZmlsZXMgPSBbXSxcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgPSAwLFxuICAgICAgICAgICAgZ2V0U3RhdHVzID0gZnVuY3Rpb24ocGVyY2VudCkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0dXM7XG4gICAgICAgICAgICAgICAgaWYgKHBlcmNlbnQgPD0gMjUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ2xvdyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJjZW50ID4gMjUgJiYgcGVyY2VudCA8PSA1MCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnbWVkaXVtJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBlcmNlbnQgPiA1MCAmJiBwZXJjZW50IDw9IDc1KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdnb29kJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAndmVyeS1nb29kJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1cztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzLCAoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgY2wgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBjb21wb25lbnQuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogY29tcG9uZW50LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyA9IGNvbXBvbmVudC5wcm9wZXJ0aWVzQ2xhc3MubGVuZ3RoICsgY29tcG9uZW50Lm1ldGhvZHNDbGFzcy5sZW5ndGggKyBjb21wb25lbnQuaW5wdXRzQ2xhc3MubGVuZ3RoICsgY29tcG9uZW50Lm91dHB1dHNDbGFzcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goY29tcG9uZW50LnByb3BlcnRpZXNDbGFzcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5tZXRob2RzQ2xhc3MsIChtZXRob2QpID0+IHtcbiAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5pbnB1dHNDbGFzcywgKGlucHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoaW5wdXQuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5vdXRwdXRzQ2xhc3MsIChvdXRwdXQpID0+IHtcbiAgICAgICAgICAgICAgICBpZihvdXRwdXQuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xuICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgfSlcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzLCAoY2xhc3NlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY2wgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBjbGFzc2UuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NsYXNzZScsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGNsYXNzZS5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyA9IGNsYXNzZS5wcm9wZXJ0aWVzLmxlbmd0aCArIGNsYXNzZS5tZXRob2RzLmxlbmd0aDtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UucHJvcGVydGllcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNsYXNzZS5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzLCAoaW5qZWN0YWJsZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW5qZWN0YWJsZS5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpbmplY3RhYmxlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGluamVjdGFibGUubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBpbmplY3RhYmxlLnByb3BlcnRpZXMubGVuZ3RoICsgaW5qZWN0YWJsZS5tZXRob2RzLmxlbmd0aDtcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbmplY3RhYmxlLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbmplY3RhYmxlLm1ldGhvZHMsIChtZXRob2QpID0+IHtcbiAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xuICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcywgKGludGVyKSA9PiB7XG4gICAgICAgICAgICBsZXQgY2wgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBpbnRlci5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpbnRlci50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbnRlci5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyA9IGludGVyLnByb3BlcnRpZXMubGVuZ3RoICsgaW50ZXIubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goaW50ZXIucHJvcGVydGllcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGludGVyLm1ldGhvZHMsIChtZXRob2QpID0+IHtcbiAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xuICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXMsIChwaXBlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY2wgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBwaXBlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHBpcGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcGlwZS5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyA9IDE7XG4gICAgICAgICAgICBpZiAocGlwZS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xuICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZpbGVzID0gXy5zb3J0QnkoZmlsZXMsIFsnZmlsZVBhdGgnXSk7XG4gICAgICAgIHZhciBjb3ZlcmFnZURhdGEgPSB7XG4gICAgICAgICAgICBjb3VudDogTWF0aC5mbG9vcih0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkIC8gZmlsZXMubGVuZ3RoKSxcbiAgICAgICAgICAgIHN0YXR1czogJydcbiAgICAgICAgfTtcbiAgICAgICAgY292ZXJhZ2VEYXRhLnN0YXR1cyA9IGdldFN0YXR1cyhjb3ZlcmFnZURhdGEuY291bnQpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICBuYW1lOiAnY292ZXJhZ2UnLFxuICAgICAgICAgICAgY29udGV4dDogJ2NvdmVyYWdlJyxcbiAgICAgICAgICAgIGZpbGVzOiBmaWxlcyxcbiAgICAgICAgICAgIGRhdGE6IGNvdmVyYWdlRGF0YVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzUGFnZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHBhZ2VzJyk7XG4gICAgICAgIGxldCBwYWdlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5wYWdlcyxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gcGFnZXMubGVuZ3RoLFxuICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlJywgcGFnZXNbaV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICRodG1sZW5naW5lLnJlbmRlcih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEsIHBhZ2VzW2ldKS50aGVuKChodG1sRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0Lmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9ICcvJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWdlc1tpXS5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2VzW2ldLnBhdGggKyAnLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZXNbaV0ubmFtZSArICcuaHRtbCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2VhcmNoRW5naW5lLmluZGV4UGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3M6IHBhZ2VzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhd0RhdGE6IGh0bWxEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZmluYWxQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLm91dHB1dEZpbGUocGF0aC5yZXNvbHZlKGZpbmFsUGF0aCksIGh0bWxEYXRhLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyAnICsgcGFnZXNbaV0ubmFtZSArICcgcGFnZSBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2VhcmNoRW5naW5lLmdlbmVyYXRlU2VhcmNoSW5kZXhKc29uKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0Fzc2V0c0ZvbGRlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1Jlc291cmNlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIGxvb3AoKTtcbiAgICB9XG5cbiAgICBwcm9jZXNzQXNzZXRzRm9sZGVyKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnQ29weSBhc3NldHMgZm9sZGVyJyk7XG5cbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIpKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFByb3ZpZGVkIGFzc2V0cyBmb2xkZXIgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyfSBkaWQgbm90IGV4aXN0YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSwgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyBwYXRoLnNlcCArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIpLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIHJlc291cmNlcyBjb3B5ICcsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzUmVzb3VyY2VzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnQ29weSBtYWluIHJlc291cmNlcycpO1xuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgIGZzLmNvcHkocGF0aC5yZXNvbHZlKF9fZGlybmFtZSArICcvLi4vc3JjL3Jlc291cmNlcy8nKSwgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSkge1xuICAgICAgICAgICAgICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUpLCBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCArICcvc3R5bGVzLycpLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBjb3B5ICcsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdFeHRlcm5hbCBzdHlsaW5nIHRoZW1lIGNvcHkgc3VjY2VlZGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzR3JhcGhzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzR3JhcGhzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzR3JhcGhzKCkge1xuXG4gICAgICAgIGNvbnN0IG9uQ29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZmluYWxUaW1lID0gKG5ldyBEYXRlKCkgLSBzdGFydFRpbWUpIC8gMTAwMDtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdEb2N1bWVudGF0aW9uIGdlbmVyYXRlZCBpbiAnICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCArICcgaW4gJyArIGZpbmFsVGltZSArICcgc2Vjb25kcyB1c2luZyAnICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRoZW1lICsgJyB0aGVtZScpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5zZXJ2ZSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXR9IGF0IGh0dHA6Ly8xMjcuMC4wLjE6JHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucG9ydH1gKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bldlYlNlcnZlcih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVHcmFwaCkge1xuXG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnR3JhcGggZ2VuZXJhdGlvbiBkaXNhYmxlZCcpO1xuICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIG1haW4gZ3JhcGgnKTtcbiAgICAgICAgICAgIGxldCBtb2R1bGVzID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMsXG4gICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICBsZW4gPSBtb2R1bGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgbW9kdWxlIGdyYXBoJywgbW9kdWxlc1tpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICBsZXQgZmluYWxQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0Lmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnbW9kdWxlcy8nICsgbW9kdWxlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICRuZ2RlbmdpbmUucmVuZGVyR3JhcGgobW9kdWxlc1tpXS5maWxlLCBmaW5hbFBhdGgsICdmJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBmaW5hbE1haW5HcmFwaFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgaWYoZmluYWxNYWluR3JhcGhQYXRoLmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZmluYWxNYWluR3JhcGhQYXRoICs9ICcvJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsTWFpbkdyYXBoUGF0aCArPSAnZ3JhcGgnO1xuICAgICAgICAgICAgJG5nZGVuZ2luZS5yZW5kZXJHcmFwaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcsIHBhdGgucmVzb2x2ZShmaW5hbE1haW5HcmFwaFBhdGgpLCAncCcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBncmFwaCBnZW5lcmF0aW9uOiAnLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJ1bldlYlNlcnZlcihmb2xkZXIpIHtcbiAgICAgICAgTGl2ZVNlcnZlci5zdGFydCh7XG4gICAgICAgICAgICByb290OiBmb2xkZXIsXG4gICAgICAgICAgICBvcGVuOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3BlbixcbiAgICAgICAgICAgIHF1aWV0OiB0cnVlLFxuICAgICAgICAgICAgbG9nTGV2ZWw6IDAsXG4gICAgICAgICAgICBwb3J0OiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucG9ydFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGFwcGxpY2F0aW9uIC8gcm9vdCBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAgICovXG4gICAgZ2V0IGFwcGxpY2F0aW9uKCk6QXBwbGljYXRpb24ge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIGdldCBpc0NMSSgpOmJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHsgQXBwbGljYXRpb24gfSBmcm9tICcuL2FwcC9hcHBsaWNhdGlvbic7XG5cbmltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi91dGlscy9kZWZhdWx0cyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xvZ2dlcic7XG5cbmxldCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKSxcbiAgICBwcm9ncmFtID0gcmVxdWlyZSgnY29tbWFuZGVyJyksXG4gICAgZmlsZXMgPSBbXSxcbiAgICBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuXG5leHBvcnQgY2xhc3MgQ2xpQXBwbGljYXRpb24gZXh0ZW5kcyBBcHBsaWNhdGlvblxue1xuICAgIC8qKlxuICAgICAqIFJ1biBjb21wb2RvYyBmcm9tIHRoZSBjb21tYW5kIGxpbmUuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdlbmVyYXRlKCkge1xuXG4gICAgICAgIHByb2dyYW1cbiAgICAgICAgICAgIC52ZXJzaW9uKHBrZy52ZXJzaW9uKVxuICAgICAgICAgICAgLnVzYWdlKCc8c3JjPiBbb3B0aW9uc10nKVxuICAgICAgICAgICAgLm9wdGlvbignLXAsIC0tdHNjb25maWcgW2NvbmZpZ10nLCAnQSB0c2NvbmZpZy5qc29uIGZpbGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLWQsIC0tb3V0cHV0IFtmb2xkZXJdJywgJ1doZXJlIHRvIHN0b3JlIHRoZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiAoZGVmYXVsdDogLi9kb2N1bWVudGF0aW9uKScsIENPTVBPRE9DX0RFRkFVTFRTLmZvbGRlcilcbiAgICAgICAgICAgIC5vcHRpb24oJy1iLCAtLWJhc2UgW2Jhc2VdJywgJ0Jhc2UgcmVmZXJlbmNlIG9mIGh0bWwgdGFnIDxiYXNlPicsIENPTVBPRE9DX0RFRkFVTFRTLmJhc2UpXG4gICAgICAgICAgICAub3B0aW9uKCcteSwgLS1leHRUaGVtZSBbZmlsZV0nLCAnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1uLCAtLW5hbWUgW25hbWVdJywgJ1RpdGxlIGRvY3VtZW50YXRpb24nLCBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy1hLCAtLWFzc2V0c0ZvbGRlciBbZm9sZGVyXScsICdFeHRlcm5hbCBhc3NldHMgZm9sZGVyIHRvIGNvcHkgaW4gZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gZm9sZGVyJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1vLCAtLW9wZW4nLCAnT3BlbiB0aGUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24nLCBmYWxzZSlcbiAgICAgICAgICAgIC8vLm9wdGlvbignLWksIC0taW5jbHVkZXMgW3BhdGhdJywgJ1BhdGggb2YgZXh0ZXJuYWwgbWFya2Rvd24gZmlsZXMgdG8gaW5jbHVkZScpXG4gICAgICAgICAgICAvLy5vcHRpb24oJy1qLCAtLWluY2x1ZGVzTmFtZSBbbmFtZV0nLCAnTmFtZSBvZiBpdGVtIG1lbnUgb2YgZXh0ZXJuYWxzIG1hcmtkb3duIGZpbGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLXQsIC0tc2lsZW50JywgJ0luIHNpbGVudCBtb2RlLCBsb2cgbWVzc2FnZXMgYXJlblxcJ3QgbG9nZ2VkIGluIHRoZSBjb25zb2xlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctcywgLS1zZXJ2ZScsICdTZXJ2ZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiAoZGVmYXVsdCBodHRwOi8vbG9jYWxob3N0OjgwODAvKScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXIsIC0tcG9ydCBbcG9ydF0nLCAnQ2hhbmdlIGRlZmF1bHQgc2VydmluZyBwb3J0JywgQ09NUE9ET0NfREVGQVVMVFMucG9ydClcbiAgICAgICAgICAgIC5vcHRpb24oJy0tdGhlbWUgW3RoZW1lXScsICdDaG9vc2Ugb25lIG9mIGF2YWlsYWJsZSB0aGVtZXMsIGRlZmF1bHQgaXMgXFwnZ2l0Ym9va1xcJyAobGFyYXZlbCwgb3JpZ2luYWwsIHBvc3RtYXJrLCByZWFkdGhlZG9jcywgc3RyaXBlLCB2YWdyYW50KScpXG4gICAgICAgICAgICAub3B0aW9uKCctLWhpZGVHZW5lcmF0b3InLCAnRG8gbm90IHByaW50IHRoZSBDb21wb2RvYyBsaW5rIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UnLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGlzYWJsZVNvdXJjZUNvZGUnLCAnRG8gbm90IGFkZCBzb3VyY2UgY29kZSB0YWInLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGlzYWJsZUdyYXBoJywgJ0RvIG5vdCBhZGQgdGhlIGRlcGVuZGVuY3kgZ3JhcGgnLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGlzYWJsZUNvdmVyYWdlJywgJ0RvIG5vdCBhZGQgdGhlIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgcmVwb3J0JywgZmFsc2UpXG4gICAgICAgICAgICAucGFyc2UocHJvY2Vzcy5hcmd2KTtcblxuICAgICAgICBsZXQgb3V0cHV0SGVscCA9ICgpID0+IHtcbiAgICAgICAgICAgIHByb2dyYW0ub3V0cHV0SGVscCgpXG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgPSBwcm9ncmFtLm91dHB1dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmJhc2UpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5iYXNlID0gcHJvZ3JhbS5iYXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZXh0VGhlbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSA9IHByb2dyYW0uZXh0VGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS50aGVtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRoZW1lID0gcHJvZ3JhbS50aGVtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPSBwcm9ncmFtLm5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5hc3NldHNGb2xkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgPSBwcm9ncmFtLmFzc2V0c0ZvbGRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vcGVuID0gcHJvZ3JhbS5vcGVuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uaW5jbHVkZXMpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyAgPSBwcm9ncmFtLmluY2x1ZGVzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uaW5jbHVkZXNOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXNOYW1lICA9IHByb2dyYW0uaW5jbHVkZXNOYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2lsZW50KSB7XG4gICAgICAgICAgICBsb2dnZXIuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5zZXJ2ZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnNlcnZlICA9IHByb2dyYW0uc2VydmU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5wb3J0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucG9ydCA9IHByb2dyYW0ucG9ydDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmhpZGVHZW5lcmF0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5oaWRlR2VuZXJhdG9yID0gcHJvZ3JhbS5oaWRlR2VuZXJhdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZVNvdXJjZUNvZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlU291cmNlQ29kZSA9IHByb2dyYW0uZGlzYWJsZVNvdXJjZUNvZGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlR3JhcGgpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlR3JhcGggPSBwcm9ncmFtLmRpc2FibGVHcmFwaDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVDb3ZlcmFnZSA9IHByb2dyYW0uZGlzYWJsZUNvdmVyYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUgJiYgIXByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgICAgIC8vIGlmIC1zICYgLWQsIHNlcnZlIGl0XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS5vdXRwdXQpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGAke3Byb2dyYW0ub3V0cHV0fSBmb2xkZXIgZG9lc24ndCBleGlzdGApO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7cHJvZ3JhbS5vdXRwdXR9IGF0IGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9ncmFtLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgc3VwZXIucnVuV2ViU2VydmVyKHByb2dyYW0ub3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwcm9ncmFtLnNlcnZlICYmICFwcm9ncmFtLnRzY29uZmlnICYmICFwcm9ncmFtLm91dHB1dCkge1xuICAgICAgICAgICAgLy8gaWYgb25seSAtcyBmaW5kIC4vZG9jdW1lbnRhdGlvbiwgaWYgb2sgc2VydmUsIGVsc2UgZXJyb3IgcHJvdmlkZSAtZFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0ub3V0cHV0KSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignUHJvdmlkZSBvdXRwdXQgZ2VuZXJhdGVkIGZvbGRlciB3aXRoIC1kIGZsYWcnKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3Byb2dyYW0ub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7cHJvZ3JhbS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHN1cGVyLnJ1bldlYlNlcnZlcihwcm9ncmFtLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmhpZGVHZW5lcmF0b3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZGVmYXVsdFdhbGtGT2xkZXIgPSBjd2QgfHwgJy4nLFxuICAgICAgICAgICAgICAgIHdhbGsgPSAoZGlyLCBleGNsdWRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gZnMucmVhZGRpclN5bmMoZGlyKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZS5pbmRleE9mKGZpbGUpIDwgMCAmJiBkaXIuaW5kZXhPZignbm9kZV9tb2R1bGVzJykgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSA9IHBhdGguam9pbihkaXIsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQgJiYgc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCh3YWxrKGZpbGUsIGV4Y2x1ZGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoLyhzcGVjfFxcLmQpXFwudHMvLnRlc3QoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdJZ25vcmluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSW5jbHVkaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnID0gcHJvZ3JhbS50c2NvbmZpZztcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS50c2NvbmZpZykpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdcInRzY29uZmlnLmpzb25cIiBmaWxlIHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5Jyk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgX2ZpbGUgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIHBhdGguZGlybmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpKSxcbiAgICAgICAgICAgICAgICAgICAgICBwYXRoLmJhc2VuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZylcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1VzaW5nIHRzY29uZmlnJywgX2ZpbGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzID0gcmVxdWlyZShfZmlsZSkuZmlsZXM7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBvZiB0c2NvbmZpZy5qc29uIGFzIGEgd29ya2luZyBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgICAgY3dkID0gX2ZpbGUuc3BsaXQocGF0aC5zZXApLnNsaWNlKDAsIC0xKS5qb2luKHBhdGguc2VwKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhjbHVkZSA9IHJlcXVpcmUoX2ZpbGUpLmV4Y2x1ZGUgfHwgW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gd2Fsayhjd2QgfHwgJy4nLCBleGNsdWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICBlbHNlIGlmIChwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0uYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnID0gcHJvZ3JhbS50c2NvbmZpZztcbiAgICAgICAgICAgICAgICBsZXQgc291cmNlRm9sZGVyID0gcHJvZ3JhbS5hcmdzWzBdO1xuICAgICAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhzb3VyY2VGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgUHJvdmlkZWQgc291cmNlIGZvbGRlciAke3NvdXJjZUZvbGRlcn0gd2FzIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnlgKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyBwcm92aWRlZCBzb3VyY2UgZm9sZGVyJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSB3YWxrKHBhdGgucmVzb2x2ZShzb3VyY2VGb2xkZXIpLCBbXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuc2V0RmlsZXMoZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICBzdXBlci5nZW5lcmF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCd0c2NvbmZpZy5qc29uIGZpbGUgd2FzIG5vdCBmb3VuZCwgcGxlYXNlIHVzZSAtcCBmbGFnJyk7XG4gICAgICAgICAgICAgICAgb3V0cHV0SGVscCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbImd1dGlsIiwicmVxdWlyZSIsImMiLCJjb2xvcnMiLCJwa2ciLCJMRVZFTCIsIm5hbWUiLCJ2ZXJzaW9uIiwibG9nZ2VyIiwibG9nIiwic2lsZW50IiwiYXJncyIsImZvcm1hdCIsIklORk8iLCJFUlJPUiIsIkRFQlVHIiwibGV2ZWwiLCJwYWQiLCJzIiwibCIsIkFycmF5IiwiTWF0aCIsIm1heCIsImxlbmd0aCIsImpvaW4iLCJtc2ciLCJzaGlmdCIsImdyZWVuIiwiY3lhbiIsInJlZCIsIkxvZ2dlciIsIkFuZ3VsYXJBUElzIiwidHlwZSIsIl9yZXN1bHQiLCJhbmd1bGFyTW9kdWxlQVBJcyIsImFuZ3VsYXJNb2R1bGUiLCJpIiwibGVuIiwidGl0bGUiLCJkYXRhIiwiRGVwZW5kZW5jaWVzRW5naW5lIiwiX2luc3RhbmNlIiwiRXJyb3IiLCJyYXdEYXRhIiwibW9kdWxlcyIsIl8iLCJjb21wb25lbnRzIiwiZGlyZWN0aXZlcyIsImluamVjdGFibGVzIiwiaW50ZXJmYWNlcyIsInJvdXRlcyIsInBpcGVzIiwiY2xhc3NlcyIsImZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXMiLCJpbmRleE9mIiwicmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzIiwicmVzdWx0SW5Db21wb2RvY0NsYXNzZXMiLCJyZXN1bHRJbkFuZ3VsYXJBUElzIiwiZmluZGVySW5Bbmd1bGFyQVBJcyIsIiRkZXBlbmRlbmNpZXNFbmdpbmUiLCJnZXRJbnN0YW5jZSIsImEiLCJvcGVyYXRvciIsImIiLCJvcHRpb25zIiwiYXJndW1lbnRzIiwicmVzdWx0IiwiaW52ZXJzZSIsImZuIiwidGV4dCIsIk5HMl9NT0RVTEVTIiwib3B0aW9uYWxWYWx1ZSIsIkhhbmRsZWJhcnMiLCJlc2NhcGVFeHByZXNzaW9uIiwicmVwbGFjZSIsIm1ldGhvZCIsIm1hcCIsImFyZyIsImZpbmQiLCJzb3VyY2UiLCJwYXRoIiwianNkb2NUYWdzIiwidGFnTmFtZSIsImNvbW1lbnQiLCJ0YWdzIiwidGFnIiwidHlwZUV4cHJlc3Npb24iLCJwYXJhbWV0ZXJOYW1lIiwicHVzaCIsImhyZWYiLCJ0YXJnZXQiLCJKU09OIiwic3RyaW5naWZ5IiwicGFydGlhbHMiLCJsb29wIiwicmVzb2x2ZSIsInJlamVjdCIsIl9fZGlybmFtZSIsImVyciIsIlByb21pc2UiLCJtYWluRGF0YSIsInBhZ2UiLCJvIiwidGhhdCIsImFzc2lnbiIsImNhY2hlIiwidGVtcGxhdGUiLCJyZW5kZXJlciIsIlJlbmRlcmVyIiwiY29kZSIsImxhbmd1YWdlIiwidmFsaWRMYW5nIiwiaGlnaGxpZ2h0anMiLCJnZXRMYW5ndWFnZSIsImhpZ2hsaWdodGVkIiwiaGlnaGxpZ2h0IiwidmFsdWUiLCJzZXRPcHRpb25zIiwicHJvY2VzcyIsImN3ZCIsIm1hcmtlZCIsImZpbGVwYXRoIiwiQ09NUE9ET0NfREVGQVVMVFMiLCJmb2xkZXIiLCJ0aGVtZSIsInBvcnQiLCJiYXNlIiwiZGlzYWJsZVNvdXJjZUNvZGUiLCJkaXNhYmxlR3JhcGgiLCJkaXNhYmxlQ292ZXJhZ2UiLCJDb25maWd1cmF0aW9uIiwiX3BhZ2VzIiwicGFnZXMiLCJfbWFpbkRhdGEiLCJiaW5QYXRoIiwiZ2xvYmFsQmluUGF0aCIsInBsYXRmb3JtIiwicGF0aG5hbWVzIiwiZW52IiwiUEFUSCIsInNwbGl0IiwiZXhlY1BhdGgiLCJzdHJpcFRyYWlsaW5nU2VwIiwidGhlUGF0aCIsInNsaWNlIiwicGF0aElzSW5zaWRlIiwicG90ZW50aWFsUGFyZW50IiwidG9Mb3dlckNhc2UiLCJsYXN0SW5kZXhPZiIsInVuZGVmaW5lZCIsImlzUGF0aEluc2lkZSIsImFyZ3YiLCJvdXRwdXRwYXRoIiwibmdkUGF0aCIsImlzR2xvYmFsIiwiTU9ERSIsInRlc3QiLCJmaW5hbFBhdGgiLCJzdGRvdXQiLCJzdGRlcnIiLCJsdW5yIiwiY2hlZXJpbyIsIkVudGl0aWVzIiwiQWxsSHRtbEVudGl0aWVzIiwiJGNvbmZpZ3VyYXRpb24iLCJIdG1sIiwic2VhcmNoSW5kZXgiLCJyZWYiLCJmaWVsZCIsImJvb3N0IiwiJCIsImxvYWQiLCJodG1sIiwiZGVjb2RlIiwidXJsIiwib3V0cHV0IiwiZG9jIiwiaW5mb3MiLCJjb250ZXh0IiwiZG9jdW1lbnRzU3RvcmUiLCJnZXRTZWFyY2hJbmRleCIsImFkZCIsIm91dHB1dEZvbGRlciIsImVycm9yIiwidHNhbnkiLCJ0cyIsIm5vZGUiLCJnZXRKU0RvY3MiLCJhcHBseSIsInN0ciIsImNvdW50IiwiaW5kZW50Iiwic3RyaXBJbmRlbnQiLCJtYXRjaCIsIm1pbiIsIngiLCJyZSIsIlJlZ0V4cCIsInJlcGVhdGluZyIsIm4iLCJUeXBlRXJyb3IiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsInJldCIsImluZGVudFN0cmluZyIsInRyYW5zcGlsZU9wdGlvbnMiLCJpbnB1dEZpbGVOYW1lIiwiZmlsZU5hbWUiLCJqc3giLCJjb21waWxlckhvc3QiLCJ0c2NvbmZpZ0RpcmVjdG9yeSIsImxpYlNvdXJjZSIsImZzIiwidG9TdHJpbmciLCJlIiwiZGVidWciLCJSb3V0ZXJQYXJzZXIiLCJtb2R1bGVzVHJlZSIsInJvb3RNb2R1bGUiLCJtb2R1bGVzV2l0aFJvdXRlcyIsInJvdXRlIiwibW9kdWxlTmFtZSIsIm1vZHVsZUltcG9ydHMiLCJtb2R1bGUiLCJpbXBvcnRzIiwiaW1wb3J0c05vZGUiLCJpbml0aWFsaXplciIsImVsZW1lbnRzIiwiZWxlbWVudCIsImFyZ3VtZW50IiwiY2xlYW5Nb2R1bGVzVHJlZSIsIm1vZHVsZXNDbGVhbmVyIiwiYXJyIiwicGFyZW50IiwiY2hpbGRyZW4iLCJ1dGlsIiwiZGVwdGgiLCJyb3V0ZXNUcmVlIiwiZm91bmRSb3V0ZVdpdGhNb2R1bGVOYW1lIiwibG9vcE1vZHVsZXNQYXJzZXIiLCJwYXJzZSIsImtpbmQiLCJjbGVhbmVkUm91dGVzVHJlZSIsImNsZWFuUm91dGVzVHJlZSIsImdldE5lc3RlZENoaWxkcmVuIiwib3V0IiwiZmlyc3RMb29wTW9kdWxlIiwiaW1wb3J0Tm9kZSIsImdlbiIsInRtcCIsInRva2VuIiwiZ2V0Q2hpbGRyZW4iLCJmb3JFYWNoIiwidmlzaXRBbmRSZWNvZ25pemUiLCJGaXJzdExpdGVyYWxUb2tlbiIsIklkZW50aWZpZXIiLCJTdHJpbmdMaXRlcmFsIiwiQXJyYXlMaXRlcmFsRXhwcmVzc2lvbiIsIkltcG9ydEtleXdvcmQiLCJGcm9tS2V5d29yZCIsIkV4cG9ydEtleXdvcmQiLCJDbGFzc0tleXdvcmQiLCJUaGlzS2V5d29yZCIsIkNvbnN0cnVjdG9yS2V5d29yZCIsIkZhbHNlS2V5d29yZCIsIlRydWVLZXl3b3JkIiwiTnVsbEtleXdvcmQiLCJBdFRva2VuIiwiUGx1c1Rva2VuIiwiRXF1YWxzR3JlYXRlclRoYW5Ub2tlbiIsIk9wZW5QYXJlblRva2VuIiwiSW1wb3J0Q2xhdXNlIiwiT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24iLCJCbG9jayIsIkNsb3NlQnJhY2VUb2tlbiIsIkNsb3NlUGFyZW5Ub2tlbiIsIk9wZW5CcmFja2V0VG9rZW4iLCJDbG9zZUJyYWNrZXRUb2tlbiIsIlNlbWljb2xvblRva2VuIiwiQ29tbWFUb2tlbiIsIkNvbG9uVG9rZW4iLCJEb3RUb2tlbiIsIkRvU3RhdGVtZW50IiwiRGVjb3JhdG9yIiwiRmlyc3RBc3NpZ25tZW50IiwiRmlyc3RQdW5jdHVhdGlvbiIsIlByaXZhdGVLZXl3b3JkIiwiUHVibGljS2V5d29yZCIsImZpbGVzIiwiRVM1IiwiQ29tbW9uSlMiLCJwcm9ncmFtIiwiX3QiLCJkZXBzIiwic291cmNlRmlsZXMiLCJnZXRTb3VyY2VGaWxlcyIsImZpbGUiLCJmaWxlUGF0aCIsImluZm8iLCJnZXRTb3VyY2VGaWxlRGVjb3JhdG9ycyIsInNyY0ZpbGUiLCJvdXRwdXRTeW1ib2xzIiwiY2xlYW5lciIsInByb2dyYW1Db21wb25lbnQiLCJzb3VyY2VGaWxlIiwiZ2V0U291cmNlRmlsZSIsInR5cGVDaGVja2VyQ29tcG9uZW50IiwiZ2V0VHlwZUNoZWNrZXIiLCJkZWNvcmF0b3JzIiwidmlzaXROb2RlIiwidmlzaXRlZE5vZGUiLCJpbmRleCIsIm1ldGFkYXRhIiwicG9wIiwiZ2V0U3ltYm9sZU5hbWUiLCJwcm9wcyIsImZpbmRQcm9wcyIsIklPIiwiZ2V0Q29tcG9uZW50SU8iLCJpc01vZHVsZSIsImdldE1vZHVsZVByb3ZpZGVycyIsImdldE1vZHVsZURlY2xhdGlvbnMiLCJnZXRNb2R1bGVJbXBvcnRzIiwiZ2V0TW9kdWxlRXhwb3J0cyIsImdldE1vZHVsZUJvb3RzdHJhcCIsImJyZWFrTGluZXMiLCJkZXNjcmlwdGlvbiIsImdldFRleHQiLCJoYXNSb3V0ZXJNb2R1bGVJbkltcG9ydHMiLCJhZGRNb2R1bGVXaXRoUm91dGVzIiwiZ2V0TW9kdWxlSW1wb3J0c1JhdyIsImFkZE1vZHVsZSIsImlzQ29tcG9uZW50IiwiZ2V0Q29tcG9uZW50Q2hhbmdlRGV0ZWN0aW9uIiwiZ2V0Q29tcG9uZW50RW5jYXBzdWxhdGlvbiIsImdldENvbXBvbmVudEV4cG9ydEFzIiwiZ2V0Q29tcG9uZW50SG9zdCIsImdldENvbXBvbmVudElucHV0c01ldGFkYXRhIiwiZ2V0Q29tcG9uZW50TW9kdWxlSWQiLCJnZXRDb21wb25lbnRPdXRwdXRzIiwiZ2V0Q29tcG9uZW50UHJvdmlkZXJzIiwiZ2V0Q29tcG9uZW50U2VsZWN0b3IiLCJnZXRDb21wb25lbnRTdHlsZVVybHMiLCJnZXRDb21wb25lbnRTdHlsZXMiLCJnZXRDb21wb25lbnRUZW1wbGF0ZSIsImdldENvbXBvbmVudFRlbXBsYXRlVXJsIiwiZ2V0Q29tcG9uZW50Vmlld1Byb3ZpZGVycyIsImlucHV0cyIsIm91dHB1dHMiLCJwcm9wZXJ0aWVzIiwibWV0aG9kcyIsImlzSW5qZWN0YWJsZSIsImlzUGlwZSIsImlzRGlyZWN0aXZlIiwiX19jYWNoZSIsImZpbHRlckJ5RGVjb3JhdG9ycyIsImV4cHJlc3Npb24iLCJmaWx0ZXIiLCJzeW1ib2wiLCJmbGFncyIsIkNsYXNzIiwiSW50ZXJmYWNlIiwiZ2V0SW50ZXJmYWNlSU8iLCJnZXRSb3V0ZUlPIiwibmV3Um91dGVzIiwiQ2xhc3NEZWNsYXJhdGlvbiIsIkV4cHJlc3Npb25TdGF0ZW1lbnQiLCJyZXN1bHROb2RlIiwiZmluZEV4cHJlc3Npb25CeU5hbWUiLCJzZXRSb290TW9kdWxlIiwic3ltYm9scyIsImQiLCJlbnRyeU5vZGUiLCJnZXRTeW1ib2xEZXBzIiwicHJvdmlkZXJOYW1lIiwicGFyc2VEZWVwSW5kZW50aWZpZXIiLCJjb21wb25lbnQiLCJmaW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUiLCJnZXRTeW1ib2xEZXBzUmF3IiwiZ2V0U3ltYm9sRGVwc09iamVjdCIsImRlY29yYXRvclR5cGUiLCJwcm9wZXJ0eSIsImluRGVjb3JhdG9yIiwiaW5BcmdzIiwic3RyaW5naWZ5RGVmYXVsdFZhbHVlIiwidmlzaXRUeXBlIiwiZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQiLCJ0eXBlVG9TdHJpbmciLCJnZXRUeXBlQXRMb2NhdGlvbiIsIm91dERlY29yYXRvciIsIm91dEFyZ3MiLCJtZW1iZXIiLCJtb2RpZmllcnMiLCJpc1B1YmxpYyIsInNvbWUiLCJtb2RpZmllciIsImlzSW50ZXJuYWxNZW1iZXIiLCJpc1ByaXZhdGUiLCJpbnRlcm5hbFRhZ3MiLCJqc0RvYyIsIm1ldGhvZE5hbWUiLCJBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTIiwicGFyYW1ldGVycyIsIl9wYXJhbWV0ZXJzIiwidmlzaXRBcmd1bWVudCIsInByb3AiLCJqc2RvY3RhZ3MiLCJfdHMiLCJsb2NhbGVDb21wYXJlIiwibWVtYmVycyIsImlucHV0RGVjb3JhdG9yIiwiZ2V0RGVjb3JhdG9yT2ZUeXBlIiwidmlzaXRJbnB1dCIsInZpc2l0T3V0cHV0IiwiaXNQcml2YXRlT3JJbnRlcm5hbCIsIk1ldGhvZERlY2xhcmF0aW9uIiwiTWV0aG9kU2lnbmF0dXJlIiwiaXNBbmd1bGFyTGlmZWN5Y2xlSG9vayIsInZpc2l0TWV0aG9kRGVjbGFyYXRpb24iLCJQcm9wZXJ0eURlY2xhcmF0aW9uIiwiUHJvcGVydHlTaWduYXR1cmUiLCJHZXRBY2Nlc3NvciIsInZpc2l0UHJvcGVydHkiLCJDYWxsU2lnbmF0dXJlIiwidmlzaXRDYWxsRGVjbGFyYXRpb24iLCJJbmRleFNpZ25hdHVyZSIsInZpc2l0SW5kZXhEZWNsYXJhdGlvbiIsIkNvbnN0cnVjdG9yIiwiX2NvbnN0cnVjdG9yUHJvcGVydGllcyIsInZpc2l0Q29uc3RydWN0b3JEZWNsYXJhdGlvbiIsImoiLCJzb3J0IiwiZ2V0TmFtZXNDb21wYXJlRm4iLCJkZWNvcmF0b3IiLCJzZWxlY3RvciIsImV4cG9ydEFzIiwiZGVjb3JhdG9ySWRlbnRpZmllclRleHQiLCJjbGFzc0RlY2xhcmF0aW9uIiwiZ2V0U3ltYm9sQXRMb2NhdGlvbiIsImNsYXNzTmFtZSIsImRpcmVjdGl2ZUluZm8iLCJpc0RpcmVjdGl2ZURlY29yYXRvciIsInZpc2l0RGlyZWN0aXZlRGVjb3JhdG9yIiwidmlzaXRNZW1iZXJzIiwiaXNTZXJ2aWNlRGVjb3JhdG9yIiwiaXNQaXBlRGVjb3JhdG9yIiwiaXNNb2R1bGVEZWNvcmF0b3IiLCJkZWNsYXJhdGlvbkxpc3QiLCJkZWNsYXJhdGlvbnMiLCJ0eXBlTmFtZSIsImFkZFJvdXRlIiwiZ2VuZXJhdGUiLCJmaWxlbmFtZSIsInJlcyIsInN0YXRlbWVudHMiLCJyZWR1Y2UiLCJkaXJlY3RpdmUiLCJzdGF0ZW1lbnQiLCJWYXJpYWJsZVN0YXRlbWVudCIsImNvbmNhdCIsInZpc2l0RW51bURlY2xhcmF0aW9uIiwidmlzaXRDbGFzc0RlY2xhcmF0aW9uIiwiSW50ZXJmYWNlRGVjbGFyYXRpb24iLCJwb3MiLCJlbmQiLCJpZGVudGlmaWVyIiwibGFiZWwiLCJuc01vZHVsZSIsImdldFR5cGUiLCJfX25zTW9kdWxlIiwic2FuaXRpemVVcmxzIiwidCIsImRldGVjdEluZGVudCIsInVybHMiLCJtdWx0aUxpbmUiLCJwYXJzZVByb3BlcnRpZXMiLCJvYmoiLCJwYXJzZVN5bWJvbFRleHQiLCJidWlsZElkZW50aWZpZXJOYW1lIiwibm9kZU5hbWUiLCJ1bmtub3duIiwiZWwiLCJTcHJlYWRFbGVtZW50RXhwcmVzc2lvbiIsInBhcnNlUHJvdmlkZXJDb25maWd1cmF0aW9uIiwiX2dlblByb3ZpZGVyTmFtZSIsIl9wcm92aWRlclByb3BzIiwiYm9keSIsInBhcmFtcyIsInBhcnNlU3ltYm9sRWxlbWVudHMiLCJmdW5jdGlvbkFyZ3MiLCJwYXJzZVN5bWJvbHMiLCJnbG9iIiwiJGh0bWxlbmdpbmUiLCJIdG1sRW5naW5lIiwiJGZpbGVlbmdpbmUiLCJGaWxlRW5naW5lIiwiJG1hcmtkb3duZW5naW5lIiwiTWFya2Rvd25FbmdpbmUiLCIkbmdkZW5naW5lIiwiTmdkRW5naW5lIiwiJHNlYXJjaEVuZ2luZSIsIlNlYXJjaEVuZ2luZSIsInN0YXJ0VGltZSIsIkRhdGUiLCJjb25maWd1cmF0aW9uIiwiZ2V0UGlwZXMiLCJhZGRQYWdlIiwiZ2V0Q2xhc3NlcyIsImdldERpcmVjdGl2ZXMiLCJvcHRpb24iLCJpbml0IiwidGhlbiIsInByb2Nlc3NQYWNrYWdlSnNvbiIsImdldCIsInBhY2thZ2VEYXRhIiwicGFyc2VkRGF0YSIsImRvY3VtZW50YXRpb25NYWluTmFtZSIsImRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb24iLCJwcm9jZXNzTWFya2Rvd24iLCJlcnJvck1lc3NhZ2UiLCJnZXRSZWFkbWVGaWxlIiwicmVhZG1lRGF0YSIsInJlYWRtZSIsImdldERlcGVuZGVuY2llc0RhdGEiLCJjcmF3bGVyIiwiRGVwZW5kZW5jaWVzIiwidHNjb25maWciLCJkZXBlbmRlbmNpZXNEYXRhIiwiZ2V0RGVwZW5kZW5jaWVzIiwicHJlcGFyZU1vZHVsZXMiLCJwcmVwYXJlQ29tcG9uZW50cyIsInByZXBhcmVEaXJlY3RpdmVzIiwicHJlcGFyZUluamVjdGFibGVzIiwicHJlcGFyZVJvdXRlcyIsInByZXBhcmVQaXBlcyIsInByZXBhcmVDbGFzc2VzIiwicHJlcGFyZUludGVyZmFjZXMiLCJwcmVwYXJlQ292ZXJhZ2UiLCJwcm9jZXNzUGFnZXMiLCJnZXRNb2R1bGVzIiwibWV0YWRhdGFUeXBlIiwibmdNb2R1bGUiLCJtZXRhRGF0YUl0ZW0iLCJnZXRDb21wb25lbnRzIiwicGlwZSIsInByb3ZpZGVycyIsImdldEluamVjdGFibGVzIiwiaW5qZWN0YWJsZSIsInByb3ZpZGVyIiwiZ2V0SW50ZXJmYWNlcyIsImRpcm5hbWUiLCJyZWFkbWVGaWxlIiwiZ2V0Um91dGVzIiwidG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCIsImdldFN0YXR1cyIsInBlcmNlbnQiLCJzdGF0dXMiLCJjbCIsInRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCIsInRvdGFsU3RhdGVtZW50cyIsInByb3BlcnRpZXNDbGFzcyIsIm1ldGhvZHNDbGFzcyIsImlucHV0c0NsYXNzIiwib3V0cHV0c0NsYXNzIiwiaW5wdXQiLCJjb3ZlcmFnZVBlcmNlbnQiLCJmbG9vciIsImNvdmVyYWdlQ291bnQiLCJjbGFzc2UiLCJpbnRlciIsImNvdmVyYWdlRGF0YSIsInJlbmRlciIsImh0bWxEYXRhIiwiaW5kZXhQYWdlIiwiZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24iLCJhc3NldHNGb2xkZXIiLCJwcm9jZXNzQXNzZXRzRm9sZGVyIiwicHJvY2Vzc1Jlc291cmNlcyIsImV4dFRoZW1lIiwicHJvY2Vzc0dyYXBocyIsIm9uQ29tcGxldGUiLCJmaW5hbFRpbWUiLCJzZXJ2ZSIsInJ1bldlYlNlcnZlciIsInJlbmRlckdyYXBoIiwiZmluYWxNYWluR3JhcGhQYXRoIiwib3BlbiIsInVzYWdlIiwib3V0cHV0SGVscCIsImV4aXQiLCJpbmNsdWRlcyIsImluY2x1ZGVzTmFtZSIsImhpZGVHZW5lcmF0b3IiLCJkZWZhdWx0V2Fsa0ZPbGRlciIsIndhbGsiLCJkaXIiLCJleGNsdWRlIiwicmVzdWx0cyIsImxpc3QiLCJzdGF0IiwiaXNEaXJlY3RvcnkiLCJfZmlsZSIsInNvdXJjZUZvbGRlciIsIkFwcGxpY2F0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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