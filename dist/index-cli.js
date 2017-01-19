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
var pkg$2 = require('../package.json');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["DEBUG"] = 1] = "DEBUG";
    LEVEL[LEVEL["ERROR"] = 2] = "ERROR";
})(LEVEL || (LEVEL = {}));
var Logger = (function () {
    function Logger() {
        this.name = pkg$2.name;
        this.version = pkg$2.version;
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
var pkg$1 = require('../package.json');
var cwd$1 = process.cwd();
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
            _this.configuration.mainData.readme = readmeData;
            logger.info('README.md file found');
            _this.getDependenciesData();
        }, function (errorMessage) {
            logger.error(errorMessage);
            logger.error('Continuing without README.md file');
            _this.configuration.addPage({
                name: 'index',
                context: 'overview'
            });
            _this.getDependenciesData();
        });
    };
    Application.prototype.getDependenciesData = function () {
        var _this = this;
        logger.info('Get dependencies data');
        var crawler = new Dependencies(this.files, {
            tsconfigDirectory: cwd$1
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
        this.configuration.mainData.modules = $dependenciesEngine.getModules().map(ngModule => {
            ['declarations', 'bootstrap', 'imports', 'exports'].forEach(metadataType => {
                ngModule[metadataType] = ngModule[metadataType].filter(metaDataItem => {
                    switch (metaDataItem.type) {
                        case 'directive':
                            return $dependenciesEngine.getDirectives().some(directive => directive.name === metaDataItem.name);

                        case 'component':
                            return $dependenciesEngine.getComponents().some(component => component.name === metaDataItem.name);

                        case 'module':
                            return $dependenciesEngine.getModules().some(module => module.name === metaDataItem.name);

                        case 'pipe':
                            return $dependenciesEngine.getPipes().some(pipe => pipe.name === metaDataItem.name);

                        default:
                            return true;
                    }
                });
            });
            ngModule.providers = ngModule.providers.filter(provider => {
                return $dependenciesEngine.getInjectables().some(injectable => injectable.name === provider.name);
            });
            return ngModule;
        });
        this.configuration.addPage({
            name: 'modules',
            context: 'modules'
        });
        let i = 0,
            len = this.configuration.mainData.modules.length;

        for(i; i<len; i++) {
            this.configuration.addPage({
                path: 'modules',
                name: this.configuration.mainData.modules[i].name,
                context: 'module',
                module: this.configuration.mainData.modules[i]
            });
        }

    };
    Application.prototype.prepareInterfaces = function () {
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = $dependenciesEngine.getInterfaces();
        var i = 0, len = this.configuration.mainData.interfaces.length;
        for (i; i < len; i++) {

            this.configuration.addPage({
                path: 'interfaces',
                name: this.configuration.mainData.interfaces[i].name,
                context: 'interface',
                interface: this.configuration.mainData.interfaces[i]
            });
        }
    };
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

var pkg = require('../package.json');
var program = require('commander');
var files = [];
var cwd = process.cwd();
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
            .version(pkg.version)
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
            var defaultWalkFOlder = cwd || '.', walk_1 = function (dir, exclude) {
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
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                    if (!files) {
                        var exclude = require(_file).exclude || [];
                        files = walk_1(cwd || '.', exclude);
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

exports.CliApplication = CliApplication;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtY2xpLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbG9nZ2VyLnRzIiwiLi4vc3JjL3V0aWxzL2FuZ3VsYXItYXBpLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbWFya2Rvd24uZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2ZpbGUuZW5naW5lLnRzIiwiLi4vc3JjL3V0aWxzL2RlZmF1bHRzLnRzIiwiLi4vc3JjL2FwcC9jb25maWd1cmF0aW9uLnRzIiwiLi4vc3JjL3V0aWxzL2dsb2JhbC5wYXRoLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL25nZC5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvc2VhcmNoLmVuZ2luZS50cyIsIi4uL3NyYy91dGlscy90cy1pbnRlcm5hbC50cyIsIi4uL3NyYy91dGlsaXRpZXMudHMiLCIuLi9zcmMvdXRpbHMvcm91dGVyLnBhcnNlci50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvY29kZWdlbi50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvZGVwZW5kZW5jaWVzLnRzIiwiLi4vc3JjL2FwcC9hcHBsaWNhdGlvbi50cyIsIi4uL3NyYy9pbmRleC1jbGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsibGV0IGd1dGlsID0gcmVxdWlyZSgnZ3VscC11dGlsJylcbmxldCBjID0gZ3V0aWwuY29sb3JzO1xubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuXG5lbnVtIExFVkVMIHtcblx0SU5GTyxcblx0REVCVUcsXG4gICAgRVJST1Jcbn1cblxuY2xhc3MgTG9nZ2VyIHtcblxuXHRuYW1lO1xuXHRsb2dnZXI7XG5cdHZlcnNpb247XG5cdHNpbGVudDtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm5hbWUgPSBwa2cubmFtZTtcblx0XHR0aGlzLnZlcnNpb24gPSBwa2cudmVyc2lvbjtcblx0XHR0aGlzLmxvZ2dlciA9IGd1dGlsLmxvZztcblx0XHR0aGlzLnNpbGVudCA9IHRydWU7XG5cdH1cblxuXHRpbmZvKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLklORk8sIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdGVycm9yKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkVSUk9SLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRkZWJ1ZyguLi5hcmdzKSB7XG5cdFx0aWYoIXRoaXMuc2lsZW50KSByZXR1cm47XG5cdFx0dGhpcy5sb2dnZXIoXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5ERUJVRywgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0cHJpdmF0ZSBmb3JtYXQobGV2ZWwsIC4uLmFyZ3MpIHtcblxuXHRcdGxldCBwYWQgPSAocywgbCwgYz0nJykgPT4ge1xuXHRcdFx0cmV0dXJuIHMgKyBBcnJheSggTWF0aC5tYXgoMCwgbCAtIHMubGVuZ3RoICsgMSkpLmpvaW4oIGMgKVxuXHRcdH07XG5cblx0XHRsZXQgbXNnID0gYXJncy5qb2luKCcgJyk7XG5cdFx0aWYoYXJncy5sZW5ndGggPiAxKSB7XG5cdFx0XHRtc2cgPSBgJHsgcGFkKGFyZ3Muc2hpZnQoKSwgMTUsICcgJykgfTogJHsgYXJncy5qb2luKCcgJykgfWA7XG5cdFx0fVxuXG5cblx0XHRzd2l0Y2gobGV2ZWwpIHtcblx0XHRcdGNhc2UgTEVWRUwuSU5GTzpcblx0XHRcdFx0bXNnID0gYy5ncmVlbihtc2cpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBMRVZFTC5ERUJVRzpcblx0XHRcdFx0bXNnID0gYy5jeWFuKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExFVkVMLkVSUk9SOlxuXHRcdFx0XHRtc2cgPSBjLnJlZChtc2cpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gW1xuXHRcdFx0bXNnXG5cdFx0XS5qb2luKCcnKTtcblx0fVxufVxuXG5leHBvcnQgbGV0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbiIsImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxubGV0IEFuZ3VsYXJBUElzID0gcmVxdWlyZSgnLi4vc3JjL2RhdGEvYXBpLWxpc3QuanNvbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZGVySW5Bbmd1bGFyQVBJcyh0eXBlOiBzdHJpbmcpIHtcbiAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgc291cmNlOiAnZXh0ZXJuYWwnLFxuICAgICAgICBkYXRhOiBudWxsXG4gICAgfTtcblxuICAgIF8uZm9yRWFjaChBbmd1bGFyQVBJcywgZnVuY3Rpb24oYW5ndWxhck1vZHVsZUFQSXMsIGFuZ3VsYXJNb2R1bGUpIHtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gYW5ndWxhck1vZHVsZUFQSXMubGVuZ3RoO1xuICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyTW9kdWxlQVBJc1tpXS50aXRsZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIF9yZXN1bHQuZGF0YSA9IGFuZ3VsYXJNb2R1bGVBUElzW2ldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBfcmVzdWx0O1xufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgeyBmaW5kZXJJbkFuZ3VsYXJBUElzIH0gZnJvbSAnLi4vLi4vdXRpbHMvYW5ndWxhci1hcGknO1xuXG5jbGFzcyBEZXBlbmRlbmNpZXNFbmdpbmUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTpEZXBlbmRlbmNpZXNFbmdpbmUgPSBuZXcgRGVwZW5kZW5jaWVzRW5naW5lKCk7XG4gICAgcmF3RGF0YTogT2JqZWN0O1xuICAgIG1vZHVsZXM6IE9iamVjdFtdO1xuICAgIGNvbXBvbmVudHM6IE9iamVjdFtdO1xuICAgIGRpcmVjdGl2ZXM6IE9iamVjdFtdO1xuICAgIGluamVjdGFibGVzOiBPYmplY3RbXTtcbiAgICBpbnRlcmZhY2VzOiBPYmplY3RbXTtcbiAgICByb3V0ZXM6IE9iamVjdFtdO1xuICAgIHBpcGVzOiBPYmplY3RbXTtcbiAgICBjbGFzc2VzOiBPYmplY3RbXTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYoRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIERlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIERlcGVuZGVuY2llc0VuZ2luZS5faW5zdGFuY2UgPSB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6RGVwZW5kZW5jaWVzRW5naW5lXG4gICAge1xuICAgICAgICByZXR1cm4gRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZTtcbiAgICB9XG4gICAgaW5pdChkYXRhOiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy5yYXdEYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5tb2R1bGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLm1vZHVsZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNvbXBvbmVudHMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmRpcmVjdGl2ZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5pbmplY3RhYmxlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbmplY3RhYmxlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmludGVyZmFjZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuaW50ZXJmYWNlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgodGhpcy5yYXdEYXRhLnJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnBpcGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLnBpcGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuY2xhc3NlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5jbGFzc2VzLCBbJ25hbWUnXSk7XG4gICAgfVxuICAgIGZpbmQodHlwZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgbGV0IF9yZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2ludGVybmFsJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKGRhdGFbaV0ubmFtZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIF9yZXN1bHQuZGF0YSA9IGRhdGFbaV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5pbmplY3RhYmxlcyksXG4gICAgICAgICAgICByZXN1bHRJbkNvbXBvZG9jQ2xhc3NlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5jbGFzc2VzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQW5ndWxhckFQSXMgPSBmaW5kZXJJbkFuZ3VsYXJBUElzKHR5cGUpXG5cbiAgICAgICAgaWYgKHJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Db21wb2RvY0NsYXNzZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Bbmd1bGFyQVBJcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Bbmd1bGFyQVBJc1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldE1vZHVsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZHVsZXM7XG4gICAgfVxuICAgIGdldENvbXBvbmVudHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHM7XG4gICAgfVxuICAgIGdldERpcmVjdGl2ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXM7XG4gICAgfVxuICAgIGdldEluamVjdGFibGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbmplY3RhYmxlcztcbiAgICB9XG4gICAgZ2V0SW50ZXJmYWNlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlcztcbiAgICB9XG4gICAgZ2V0Um91dGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3V0ZXM7XG4gICAgfVxuICAgIGdldFBpcGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5waXBlcztcbiAgICB9XG4gICAgZ2V0Q2xhc3NlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3NlcztcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgJGRlcGVuZGVuY2llc0VuZ2luZSA9IERlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnN0YW5jZSgpO1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG4vL2ltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnaGFuZGxlYmFycy1oZWxwZXJzJztcbmltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuXG5leHBvcnQgY2xhc3MgSHRtbEVuZ2luZSB7XG4gICAgY2FjaGU6IE9iamVjdCA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvL1RPRE8gdXNlIHRoaXMgaW5zdGVhZCA6IGh0dHBzOi8vZ2l0aHViLmNvbS9hc3NlbWJsZS9oYW5kbGViYXJzLWhlbHBlcnNcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciggXCJjb21wYXJlXCIsIGZ1bmN0aW9uKGEsIG9wZXJhdG9yLCBiLCBvcHRpb25zKSB7XG4gICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hhbmRsZWJhcnMgSGVscGVyIHt7Y29tcGFyZX19IGV4cGVjdHMgNCBhcmd1bWVudHMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luZGV4b2YnOlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IChiLmluZGV4T2YoYSkgIT09IC0xKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGEgPT09IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSAhPT0gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSA+IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hlbHBlciB7e2NvbXBhcmV9fTogaW52YWxpZCBvcGVyYXRvcjogYCcgKyBvcGVyYXRvciArICdgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImZpbHRlckFuZ3VsYXIyTW9kdWxlc1wiLCBmdW5jdGlvbih0ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBORzJfTU9EVUxFUzpzdHJpbmdbXSA9IFtcbiAgICAgICAgICAgICAgICAnQnJvd3Nlck1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ0Zvcm1zTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnSHR0cE1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ1JvdXRlck1vZHVsZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbGVuID0gTkcyX01PRFVMRVMubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKE5HMl9NT0RVTEVTW2ldKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImRlYnVnXCIsIGZ1bmN0aW9uKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgQ29udGV4dFwiKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgICAgaWYgKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3B0aW9uYWxWYWx1ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25hbFZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdicmVha2xpbmVzJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbih0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICc8YnI+Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2dtLCAnJm5ic3A7Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cdC9nbSwgJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOycpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdicmVha0NvbW1hJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbih0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLywvZywgJyw8YnI+Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Z1bmN0aW9uU2lnbmF0dXJlJywgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgICAgIHZhciBfcmVzdWx0ID0gJGRlcGVuZGVuY2llc0VuZ2luZS5maW5kKGFyZy50eXBlKTtcbiAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5zb3VyY2UgPT09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gX3Jlc3VsdC5kYXRhLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdjbGFzcycpIHBhdGggPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIuLyR7cGF0aH1zLyR7X3Jlc3VsdC5kYXRhLm5hbWV9Lmh0bWxcIiA+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gJ2h0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJyArIF9yZXN1bHQuZGF0YS5wYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogPGEgaHJlZj1cIiR7cGF0aH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiA+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5qb2luKCcsICcpO1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZC5uYW1lfSgke2FyZ3N9KWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgKCR7YXJnc30pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXJldHVybnMtY29tbWVudCcsIGZ1bmN0aW9uKGpzZG9jVGFncywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdyZXR1cm5zJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdqc2RvYy1wYXJhbXMnLCBmdW5jdGlvbihqc2RvY1RhZ3MsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBqc2RvY1RhZ3MubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHRhZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAncGFyYW0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFnID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uICYmIGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcudHlwZSA9IGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmNvbW1lbnQgPSBqc2RvY1RhZ3NbaV0uY29tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5wYXJhbWV0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLm5hbWUgPSBqc2RvY1RhZ3NbaV0ucGFyYW1ldGVyTmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xpbmtUeXBlJywgZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIF9yZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmQobmFtZSk7XG4gICAgICAgICAgICBpZiAoX3Jlc3VsdCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmF3OiBuYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdjbGFzcycpIF9yZXN1bHQuZGF0YS50eXBlID0gJ2NsYXNzZSc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS5ocmVmID0gJy4vJyArIF9yZXN1bHQuZGF0YS50eXBlICsgJ3MvJyArIF9yZXN1bHQuZGF0YS5uYW1lICsgJy5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfc2VsZic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSAnaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS8nICsgX3Jlc3VsdC5kYXRhLnBhdGg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS50YXJnZXQgPSAnX2JsYW5rJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2luZGV4YWJsZVNpZ25hdHVyZScsIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IG1ldGhvZC5hcmdzLm1hcChhcmcgPT4gYCR7YXJnLm5hbWV9OiAke2FyZy50eXBlfWApLmpvaW4oJywgJyk7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9WyR7YXJnc31dYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBbJHthcmdzfV1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignb2JqZWN0JywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgve1wiLywgJ3s8YnI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCInKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyxcIi8sICcsPGJyPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiJyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC99JC8sICc8YnI+fScpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbml0KCkge1xuICAgICAgICBsZXQgcGFydGlhbHMgPSBbXG4gICAgICAgICAgICAnbWVudScsXG4gICAgICAgICAgICAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgJ3JlYWRtZScsXG4gICAgICAgICAgICAnbW9kdWxlcycsXG4gICAgICAgICAgICAnbW9kdWxlJyxcbiAgICAgICAgICAgICdjb21wb25lbnRzJyxcbiAgICAgICAgICAgICdjb21wb25lbnQnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudC1kZXRhaWwnLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAnaW5qZWN0YWJsZXMnLFxuICAgICAgICAgICAgJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgJ3BpcGVzJyxcbiAgICAgICAgICAgICdwaXBlJyxcbiAgICAgICAgICAgICdjbGFzc2VzJyxcbiAgICAgICAgICAgICdjbGFzcycsXG5cdCAgICAgICAgJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAncm91dGVzJyxcbiAgICAgICAgICAgICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAnc2VhcmNoLWlucHV0JyxcbiAgICAgICAgICAgICdsaW5rLXR5cGUnLFxuICAgICAgICAgICAgJ2Jsb2NrLW1ldGhvZCcsXG4gICAgICAgICAgICAnYmxvY2stcHJvcGVydHknLFxuICAgICAgICAgICAgJ2NvdmVyYWdlLXJlcG9ydCdcbiAgICAgICAgXSxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gcGFydGlhbHMubGVuZ3RoLFxuICAgICAgICAgICAgbG9vcCA9IChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhcnRpYWxzLycgKyBwYXJ0aWFsc1tpXSArICcuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgeyByZWplY3QoKTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwocGFydGlhbHNbaV0sIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbG9vcChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVuZGVyKG1haW5EYXRhOmFueSwgcGFnZTphbnkpIHtcbiAgICAgICAgdmFyIG8gPSBtYWluRGF0YSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICBPYmplY3QuYXNzaWduKG8sIHBhZ2UpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZih0aGF0LmNhY2hlWydwYWdlJ10pIHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGU6YW55ID0gSGFuZGxlYmFycy5jb21waWxlKHRoYXQuY2FjaGVbJ3BhZ2UnXSksXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhZ2UuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgaW5kZXggJyArIHBhZ2UubmFtZSArICcgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVbJ3BhZ2UnXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUoZGF0YSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBtYXJrZWQsIHsgUmVuZGVyZXIgfSBmcm9tICdtYXJrZWQnO1xuaW1wb3J0IGhpZ2hsaWdodGpzIGZyb20gJ2hpZ2hsaWdodC5qcyc7XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93bkVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG4gICAgICAgIHJlbmRlcmVyLmNvZGUgPSAoY29kZSwgbGFuZ3VhZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkTGFuZyA9ICEhKGxhbmd1YWdlICYmIGhpZ2hsaWdodGpzLmdldExhbmd1YWdlKGxhbmd1YWdlKSk7XG4gICAgICAgICAgICBsZXQgaGlnaGxpZ2h0ZWQgPSB2YWxpZExhbmcgPyBoaWdobGlnaHRqcy5oaWdobGlnaHQobGFuZ3VhZ2UsIGNvZGUpLnZhbHVlIDogY29kZTtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID0gaGlnaGxpZ2h0ZWQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIHJldHVybiBgPHByZT48Y29kZSBjbGFzcz1cImhsanMgJHtsYW5ndWFnZX1cIj4ke2hpZ2hsaWdodGVkfTwvY29kZT48L3ByZT5gO1xuICAgICAgICB9O1xuXG4gICAgICAgIG1hcmtlZC5zZXRPcHRpb25zKHsgcmVuZGVyZXIgfSk7XG4gICAgfVxuICAgIGdldFJlYWRtZUZpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgJy9SRUFETUUubWQnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBSRUFETUUubWQgZmlsZSByZWFkaW5nJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXJrZWQoZGF0YSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5cbmV4cG9ydCBjbGFzcyBGaWxlRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIH1cbiAgICBnZXQoZmlsZXBhdGg6U3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGZpbGVwYXRoKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgJyArIGZpbGVwYXRoICsgJyByZWFkJyk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiZXhwb3J0IGNvbnN0IENPTVBPRE9DX0RFRkFVTFRTID0ge1xuICAgIHRpdGxlOiAnQXBwbGljYXRpb24gZG9jdW1lbnRhdGlvbicsXG4gICAgYWRkaXRpb25hbEVudHJ5TmFtZTogJ0FkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbicsXG4gICAgYWRkaXRpb25hbEVudHJ5UGF0aDogJ2FkZGl0aW9uYWwtZG9jdW1lbnRhdGlvbicsXG4gICAgZm9sZGVyOiAnLi9kb2N1bWVudGF0aW9uLycsXG4gICAgcG9ydDogODA4MCxcbiAgICB0aGVtZTogJ2dpdGJvb2snLFxuICAgIGJhc2U6ICcvJyxcbiAgICBkaXNhYmxlU291cmNlQ29kZTogZmFsc2UsXG4gICAgZGlzYWJsZUdyYXBoOiBmYWxzZSxcbiAgICBkaXNhYmxlQ292ZXJhZ2U6IGZhbHNlXG59XG4iLCJpbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4uL3V0aWxzL2RlZmF1bHRzJztcblxuaW50ZXJmYWNlIFBhZ2Uge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBjb250ZXh0OiBzdHJpbmc7XG4gICAgcGF0aD86IHN0cmluZztcbiAgICBtb2R1bGU/OiBhbnk7XG4gICAgcGlwZT86IGFueTtcbiAgICBjbGFzcz86IGFueTtcbiAgICBpbnRlcmZhY2U/OiBhbnk7XG4gICAgZGlyZWN0aXZlPzogYW55O1xuICAgIGluamVjdGFibGU/OiBhbnk7XG4gICAgZmlsZXM/OiBhbnk7XG4gICAgZGF0YT86IGFueTtcbn1cblxuaW50ZXJmYWNlIElNYWluRGF0YSB7XG4gICAgb3V0cHV0OiBzdHJpbmc7XG4gICAgdGhlbWU6IHN0cmluZztcbiAgICBleHRUaGVtZTogc3RyaW5nO1xuICAgIHNlcnZlOiBib29sZWFuO1xuICAgIHBvcnQ6IG51bWJlcjtcbiAgICBvcGVuOiBib29sZWFuO1xuICAgIGFzc2V0c0ZvbGRlcjogc3RyaW5nO1xuICAgIGRvY3VtZW50YXRpb25NYWluTmFtZTogc3RyaW5nO1xuICAgIGRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb246IHN0cmluZztcbiAgICBiYXNlOiBzdHJpbmc7XG4gICAgaGlkZUdlbmVyYXRvcjogYm9vbGVhbjtcbiAgICBtb2R1bGVzOiBhbnk7XG4gICAgcmVhZG1lOiBzdHJpbmc7XG4gICAgYWRkaXRpb25hbHBhZ2VzOiBPYmplY3Q7XG4gICAgcGlwZXM6IGFueTtcbiAgICBjbGFzc2VzOiBhbnk7XG4gICAgaW50ZXJmYWNlczogYW55O1xuICAgIGNvbXBvbmVudHM6IGFueTtcbiAgICBkaXJlY3RpdmVzOiBhbnk7XG4gICAgaW5qZWN0YWJsZXM6IGFueTtcbiAgICByb3V0ZXM6IGFueTtcbiAgICB0c2NvbmZpZzogc3RyaW5nO1xuICAgIGluY2x1ZGVzOiBib29sZWFuO1xuICAgIGluY2x1ZGVzTmFtZTogc3RyaW5nO1xuICAgIGRpc2FibGVTb3VyY2VDb2RlOiBib29sZWFuO1xuICAgIGRpc2FibGVHcmFwaDogYm9vbGVhbjtcbiAgICBkaXNhYmxlQ292ZXJhZ2U6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbmZpZ3VyYXRpb24ge1xuICAgIG1haW5EYXRhOiBJTWFpbkRhdGE7XG4gICAgcGFnZXM6QXJyYXk8UGFnZT47XG4gICAgYWRkUGFnZShwYWdlOiBQYWdlKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb24gaW1wbGVtZW50cyBJQ29uZmlndXJhdGlvbiB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOkNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbigpO1xuXG4gICAgcHJpdmF0ZSBfcGFnZXM6QXJyYXk8UGFnZT4gPSBbXTtcbiAgICBwcml2YXRlIF9tYWluRGF0YTogSU1haW5EYXRhID0ge1xuICAgICAgICBvdXRwdXQ6IENPTVBPRE9DX0RFRkFVTFRTLmZvbGRlcixcbiAgICAgICAgdGhlbWU6IENPTVBPRE9DX0RFRkFVTFRTLnRoZW1lLFxuICAgICAgICBleHRUaGVtZTogJycsXG4gICAgICAgIHNlcnZlOiBmYWxzZSxcbiAgICAgICAgcG9ydDogQ09NUE9ET0NfREVGQVVMVFMucG9ydCxcbiAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIGFzc2V0c0ZvbGRlcjogJycsXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluTmFtZTogQ09NUE9ET0NfREVGQVVMVFMudGl0bGUsXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb246ICcnLFxuICAgICAgICBiYXNlOiBDT01QT0RPQ19ERUZBVUxUUy5iYXNlLFxuICAgICAgICBoaWRlR2VuZXJhdG9yOiBmYWxzZSxcbiAgICAgICAgbW9kdWxlczogW10sXG4gICAgICAgIHJlYWRtZTogJycsXG4gICAgICAgIGFkZGl0aW9uYWxwYWdlczoge30sXG4gICAgICAgIHBpcGVzOiBbXSxcbiAgICAgICAgY2xhc3NlczogW10sXG4gICAgICAgIGludGVyZmFjZXM6IFtdLFxuICAgICAgICBjb21wb25lbnRzOiBbXSxcbiAgICAgICAgZGlyZWN0aXZlczogW10sXG4gICAgICAgIGluamVjdGFibGVzOiBbXSxcbiAgICAgICAgcm91dGVzOiBbXSxcbiAgICAgICAgdHNjb25maWc6ICcnLFxuICAgICAgICBpbmNsdWRlczogZmFsc2UsXG4gICAgICAgIGRpc2FibGVTb3VyY2VDb2RlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlU291cmNlQ29kZSxcbiAgICAgICAgZGlzYWJsZUdyYXBoOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlR3JhcGgsXG4gICAgICAgIGRpc2FibGVDb3ZlcmFnZTogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZUNvdmVyYWdlXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZihDb25maWd1cmF0aW9uLl9pbnN0YW5jZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSBpbnN0ZWFkIG9mIG5ldy4nKTtcbiAgICAgICAgfVxuICAgICAgICBDb25maWd1cmF0aW9uLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOkNvbmZpZ3VyYXRpb25cbiAgICB7XG4gICAgICAgIHJldHVybiBDb25maWd1cmF0aW9uLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBhZGRQYWdlKHBhZ2U6IFBhZ2UpIHtcbiAgICAgICAgdGhpcy5fcGFnZXMucHVzaChwYWdlKTtcbiAgICB9XG5cbiAgICBnZXQgcGFnZXMoKTpBcnJheTxQYWdlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWdlcztcbiAgICB9XG4gICAgc2V0IHBhZ2VzKHBhZ2VzOkFycmF5PFBhZ2U+KSB7XG4gICAgICAgIHRoaXMuX3BhZ2VzID0gW107XG4gICAgfVxuXG4gICAgZ2V0IG1haW5EYXRhKCk6SU1haW5EYXRhIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21haW5EYXRhO1xuICAgIH1cbiAgICBzZXQgbWFpbkRhdGEoZGF0YTpJTWFpbkRhdGEpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLl9tYWluRGF0YSwgZGF0YSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc0dsb2JhbCgpIHtcbiAgICB2YXIgYmluUGF0aCxcbiAgICAgICAgZ2xvYmFsQmluUGF0aCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGJpblBhdGgpIHJldHVybiBiaW5QYXRoXG5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGhuYW1lcyA9IHByb2Nlc3MuZW52LlBBVEguc3BsaXQocGF0aC5kZWxpbWl0ZXIpXG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IHBhdGhuYW1lcy5sZW5ndGhcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGguYmFzZW5hbWUocGF0aG5hbWVzW2ldKSA9PT0gJ25wbScgfHwgcGF0aC5iYXNlbmFtZShwYXRobmFtZXNbaV0pID09PSAnbm9kZWpzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmluUGF0aCA9IHBhdGhuYW1lc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmluUGF0aCA9IHBhdGguZGlybmFtZShwcm9jZXNzLmV4ZWNQYXRoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYmluUGF0aFxuICAgICAgICB9LFxuICAgICAgICBzdHJpcFRyYWlsaW5nU2VwID0gZnVuY3Rpb24odGhlUGF0aCkge1xuICAgICAgICAgICAgaWYgKHRoZVBhdGhbdGhlUGF0aC5sZW5ndGggLSAxXSA9PT0gcGF0aC5zZXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhlUGF0aC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhlUGF0aDtcbiAgICAgICAgfSxcbiAgICAgICAgcGF0aElzSW5zaWRlID0gZnVuY3Rpb24odGhlUGF0aCwgcG90ZW50aWFsUGFyZW50KSB7XG4gICAgICAgICAgICAvLyBGb3IgaW5zaWRlLWRpcmVjdG9yeSBjaGVja2luZywgd2Ugd2FudCB0byBhbGxvdyB0cmFpbGluZyBzbGFzaGVzLCBzbyBub3JtYWxpemUuXG4gICAgICAgICAgICB0aGVQYXRoID0gc3RyaXBUcmFpbGluZ1NlcCh0aGVQYXRoKTtcbiAgICAgICAgICAgIHBvdGVudGlhbFBhcmVudCA9IHN0cmlwVHJhaWxpbmdTZXAocG90ZW50aWFsUGFyZW50KTtcblxuICAgICAgICAgICAgLy8gTm9kZSB0cmVhdHMgb25seSBXaW5kb3dzIGFzIGNhc2UtaW5zZW5zaXRpdmUgaW4gaXRzIHBhdGggbW9kdWxlOyB3ZSBmb2xsb3cgdGhvc2UgY29udmVudGlvbnMuXG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgICAgICAgICAgdGhlUGF0aCA9IHRoZVBhdGgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBwb3RlbnRpYWxQYXJlbnQgPSBwb3RlbnRpYWxQYXJlbnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoZVBhdGgubGFzdEluZGV4T2YocG90ZW50aWFsUGFyZW50LCAwKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgdGhlUGF0aFtwb3RlbnRpYWxQYXJlbnQubGVuZ3RoXSA9PT0gcGF0aC5zZXAgfHxcbiAgICAgICAgICAgICAgICAgICAgdGhlUGF0aFtwb3RlbnRpYWxQYXJlbnQubGVuZ3RoXSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgaXNQYXRoSW5zaWRlID0gZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgYSA9IHBhdGgucmVzb2x2ZShhKTtcbiAgICAgICAgICAgIGIgPSBwYXRoLnJlc29sdmUoYik7XG5cbiAgICAgICAgICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGF0aElzSW5zaWRlKGEsIGIpO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGlzUGF0aEluc2lkZShwcm9jZXNzLmFyZ3ZbMV0gfHwgJycsIGdsb2JhbEJpblBhdGgoKSB8fCAnJylcbn07XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgU2hlbGxqcyBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IGlzR2xvYmFsIGZyb20gJy4uLy4uL3V0aWxzL2dsb2JhbC5wYXRoJztcblxuZXhwb3J0IGNsYXNzIE5nZEVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG4gICAgcmVuZGVyR3JhcGgoZmlsZXBhdGg6U3RyaW5nLCBvdXRwdXRwYXRoOiBTdHJpbmcsIHR5cGU6IFN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgIGxldCBuZ2RQYXRoID0gKGlzR2xvYmFsKCkpID8gX19kaXJuYW1lICsgJy8uLi9ub2RlX21vZHVsZXMvLmJpbi9uZ2QnIDogX19kaXJuYW1lICsgJy8uLi8uLi8uYmluL25nZCc7XG4gICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5NT0RFICYmIHByb2Nlc3MuZW52Lk1PREUgPT09ICdURVNUSU5HJykge1xuICAgICAgICAgICAgICAgbmdkUGF0aCA9IF9fZGlybmFtZSArICcvLi4vbm9kZV9tb2R1bGVzLy5iaW4vbmdkJztcbiAgICAgICAgICAgfVxuICAgICAgICAgICBpZiAoLyAvZy50ZXN0KG5nZFBhdGgpKSB7XG4gICAgICAgICAgICAgICBuZ2RQYXRoID0gbmdkUGF0aC5yZXBsYWNlKC8gL2csICdeICcpO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIGxldCBmaW5hbFBhdGggPSBwYXRoLnJlc29sdmUobmdkUGF0aCkgKyAnIC0nICsgdHlwZSArICcgJyArIGZpbGVwYXRoICsgJyAtZCAnICsgb3V0cHV0cGF0aCArICcgLXMgLXQgc3ZnJ1xuICAgICAgICAgICBTaGVsbGpzLmV4ZWMoZmluYWxQYXRoLCB7XG4gICAgICAgICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgICAgICAgfSwgZnVuY3Rpb24oY29kZSwgc3Rkb3V0LCBzdGRlcnIpIHtcbiAgICAgICAgICAgICAgIGlmKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHJlamVjdChzdGRlcnIpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbmZpZ3VyYXRpb24nO1xuXG5jb25zdCBsdW5yOiBhbnkgPSByZXF1aXJlKCdsdW5yJyksXG4gICAgICBjaGVlcmlvOiBhbnkgPSByZXF1aXJlKCdjaGVlcmlvJyksXG4gICAgICBFbnRpdGllczphbnkgPSByZXF1aXJlKCdodG1sLWVudGl0aWVzJykuQWxsSHRtbEVudGl0aWVzLFxuICAgICAgJGNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCksXG4gICAgICBIdG1sID0gbmV3IEVudGl0aWVzKCk7XG5cbmV4cG9ydCBjbGFzcyBTZWFyY2hFbmdpbmUge1xuICAgIHNlYXJjaEluZGV4OiBhbnk7XG4gICAgZG9jdW1lbnRzU3RvcmU6IE9iamVjdCA9IHt9O1xuICAgIGluZGV4U2l6ZTogbnVtYmVyO1xuICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICBwcml2YXRlIGdldFNlYXJjaEluZGV4KCkge1xuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoSW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5kZXggPSBsdW5yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZigndXJsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZCgndGl0bGUnLCB7IGJvb3N0OiAxMCB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCdib2R5Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hJbmRleDtcbiAgICB9XG4gICAgaW5kZXhQYWdlKHBhZ2UpIHtcbiAgICAgICAgdmFyIHRleHQsXG4gICAgICAgICAgICAkID0gY2hlZXJpby5sb2FkKHBhZ2UucmF3RGF0YSk7XG5cbiAgICAgICAgdGV4dCA9ICQoJy5jb250ZW50JykuaHRtbCgpO1xuICAgICAgICB0ZXh0ID0gSHRtbC5kZWNvZGUodGV4dCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg8KFtePl0rKT4pL2lnLCAnJyk7XG5cbiAgICAgICAgcGFnZS51cmwgPSBwYWdlLnVybC5yZXBsYWNlKCRjb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCwgJycpO1xuXG4gICAgICAgIHZhciBkb2MgPSB7XG4gICAgICAgICAgICB1cmw6IHBhZ2UudXJsLFxuICAgICAgICAgICAgdGl0bGU6IHBhZ2UuaW5mb3MuY29udGV4dCArICcgLSAnICsgcGFnZS5pbmZvcy5uYW1lLFxuICAgICAgICAgICAgYm9keTogdGV4dFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZG9jdW1lbnRzU3RvcmVbZG9jLnVybF0gPSBkb2M7XG5cbiAgICAgICAgdGhpcy5nZXRTZWFyY2hJbmRleCgpLmFkZChkb2MpO1xuICAgIH1cbiAgICBnZW5lcmF0ZVNlYXJjaEluZGV4SnNvbihvdXRwdXRGb2xkZXIpIHtcbiAgICAgICAgZnMud3JpdGVKc29uKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBvdXRwdXRGb2xkZXIgKyBwYXRoLnNlcCArICdzZWFyY2hfaW5kZXguanNvbicpLCB7XG4gICAgICAgICAgICBpbmRleDogdGhpcy5nZXRTZWFyY2hJbmRleCgpLFxuICAgICAgICAgICAgc3RvcmU6IHRoaXMuZG9jdW1lbnRzU3RvcmVcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgc2VhcmNoIGluZGV4IGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSBcInR5cGVzY3JpcHRcIjtcbmNvbnN0IHRzYW55ID0gdHMgYXMgYW55O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi8yLjEvc3JjL2NvbXBpbGVyL3V0aWxpdGllcy50cyNMMTUwN1xuZXhwb3J0IGZ1bmN0aW9uIGdldEpTRG9jcyhub2RlOiB0cy5Ob2RlKSB7XG4gIHJldHVybiB0c2FueS5nZXRKU0RvY3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcblxuY29uc3QgY2FycmlhZ2VSZXR1cm5MaW5lRmVlZCA9ICdcXHJcXG4nO1xuY29uc3QgbGluZUZlZWQgPSAnXFxuJztcblxuLy8gZ2V0IGRlZmF1bHQgbmV3IGxpbmUgYnJlYWtcbmV4cG9ydCBmdW5jdGlvbiBnZXROZXdMaW5lQ2hhcmFjdGVyKG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyk6IHN0cmluZyB7XG4gICAgaWYgKG9wdGlvbnMubmV3TGluZSA9PT0gdHMuTmV3TGluZUtpbmQuQ2FycmlhZ2VSZXR1cm5MaW5lRmVlZCkge1xuICAgICAgICByZXR1cm4gY2FycmlhZ2VSZXR1cm5MaW5lRmVlZDtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucy5uZXdMaW5lID09PSB0cy5OZXdMaW5lS2luZC5MaW5lRmVlZCkge1xuICAgICAgICByZXR1cm4gbGluZUZlZWQ7XG4gICAgfVxuICAgIHJldHVybiBjYXJyaWFnZVJldHVybkxpbmVGZWVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0SW5kZW50KHN0ciwgY291bnQsIGluZGVudD8pOiBzdHJpbmcge1xuICAgIGxldCBzdHJpcEluZGVudCA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKC9eWyBcXHRdKig/PVxcUykvZ20pO1xuXG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiB1c2Ugc3ByZWFkIG9wZXJhdG9yIHdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgNlxuICAgICAgICBjb25zdCBpbmRlbnQgPSBNYXRoLm1pbi5hcHBseShNYXRoLCBtYXRjaC5tYXAoeCA9PiB4Lmxlbmd0aCkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgXlsgXFxcXHRdeyR7aW5kZW50fX1gLCAnZ20nKTtcblxuICAgICAgICByZXR1cm4gaW5kZW50ID4gMCA/IHN0ci5yZXBsYWNlKHJlLCAnJykgOiBzdHI7XG4gICAgfSxcbiAgICAgICAgcmVwZWF0aW5nID0gZnVuY3Rpb24obiwgc3RyKSB7XG4gICAgICAgIHN0ciA9IHN0ciA9PT0gdW5kZWZpbmVkID8gJyAnIDogc3RyO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobiA8IDAgfHwgIU51bWJlci5pc0Zpbml0ZShuKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBwb3NpdGl2ZSBmaW5pdGUgbnVtYmVyLCBnb3QgXFxgJHtufVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJldCA9ICcnO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xuICAgICAgICAgICAgICAgIHJldCArPSBzdHI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0ciArPSBzdHI7XG4gICAgICAgIH0gd2hpbGUgKChuID4+PSAxKSk7XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIGluZGVudFN0cmluZyA9IGZ1bmN0aW9uKHN0ciwgY291bnQsIGluZGVudCkge1xuICAgICAgICBpbmRlbnQgPSBpbmRlbnQgPT09IHVuZGVmaW5lZCA/ICcgJyA6IGluZGVudDtcbiAgICAgICAgY291bnQgPSBjb3VudCA9PT0gdW5kZWZpbmVkID8gMSA6IGNvdW50O1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGNvdW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBcXGBudW1iZXJcXGAsIGdvdCBcXGAke3R5cGVvZiBjb3VudH1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5kZW50XFxgIHRvIGJlIGEgXFxgc3RyaW5nXFxgLCBnb3QgXFxgJHt0eXBlb2YgaW5kZW50fVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZW50ID0gY291bnQgPiAxID8gcmVwZWF0aW5nKGNvdW50LCBpbmRlbnQpIDogaW5kZW50O1xuXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXig/IVxccyokKS9tZywgaW5kZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5kZW50U3RyaW5nKHN0cmlwSW5kZW50KHN0ciksIGNvdW50IHx8IDAsIGluZGVudCk7XG59XG5cbi8vIENyZWF0ZSBhIGNvbXBpbGVySG9zdCBvYmplY3QgdG8gYWxsb3cgdGhlIGNvbXBpbGVyIHRvIHJlYWQgYW5kIHdyaXRlIGZpbGVzXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnM6IGFueSk6IHRzLkNvbXBpbGVySG9zdCB7XG5cbiAgICBjb25zdCBpbnB1dEZpbGVOYW1lID0gdHJhbnNwaWxlT3B0aW9ucy5maWxlTmFtZSB8fCAodHJhbnNwaWxlT3B0aW9ucy5qc3ggPyAnbW9kdWxlLnRzeCcgOiAnbW9kdWxlLnRzJyk7XG5cbiAgICBjb25zdCBjb21waWxlckhvc3Q6IHRzLkNvbXBpbGVySG9zdCA9IHtcbiAgICAgICAgZ2V0U291cmNlRmlsZTogKGZpbGVOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlsZU5hbWUubGFzdEluZGV4T2YoJy50cycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ2xpYi5kLnRzJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwYXRoLmlzQWJzb2x1dGUoZmlsZU5hbWUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IHBhdGguam9pbih0cmFuc3BpbGVPcHRpb25zLnRzY29uZmlnRGlyZWN0b3J5LCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGxpYlNvdXJjZSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbGliU291cmNlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVOYW1lKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhlLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoZmlsZU5hbWUsIGxpYlNvdXJjZSwgdHJhbnNwaWxlT3B0aW9ucy50YXJnZXQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRlRmlsZTogKG5hbWUsIHRleHQpID0+IHt9LFxuICAgICAgICBnZXREZWZhdWx0TGliRmlsZU5hbWU6ICgpID0+ICdsaWIuZC50cycsXG4gICAgICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXM6ICgpID0+IGZhbHNlLFxuICAgICAgICBnZXRDYW5vbmljYWxGaWxlTmFtZTogZmlsZU5hbWUgPT4gZmlsZU5hbWUsXG4gICAgICAgIGdldEN1cnJlbnREaXJlY3Rvcnk6ICgpID0+ICcnLFxuICAgICAgICBnZXROZXdMaW5lOiAoKSA9PiAnXFxuJyxcbiAgICAgICAgZmlsZUV4aXN0czogKGZpbGVOYW1lKTogYm9vbGVhbiA9PiBmaWxlTmFtZSA9PT0gaW5wdXRGaWxlTmFtZSxcbiAgICAgICAgcmVhZEZpbGU6ICgpID0+ICcnLFxuICAgICAgICBkaXJlY3RvcnlFeGlzdHM6ICgpID0+IHRydWUsXG4gICAgICAgIGdldERpcmVjdG9yaWVzOiAoKSA9PiBbXVxuICAgIH07XG4gICAgcmV0dXJuIGNvbXBpbGVySG9zdDtcbn1cbiIsImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5cbmV4cG9ydCBsZXQgUm91dGVyUGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJvdXRlcyA9IFtdLFxuICAgICAgICBtb2R1bGVzID0gW10sXG4gICAgICAgIG1vZHVsZXNUcmVlLFxuICAgICAgICByb290TW9kdWxlLFxuICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcyA9IFtdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWRkUm91dGU6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICByb3V0ZXMucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICByb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKHJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBhZGRNb2R1bGVXaXRoUm91dGVzOiBmdW5jdGlvbihtb2R1bGVOYW1lLCBtb2R1bGVJbXBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtb2R1bGVOYW1lLFxuICAgICAgICAgICAgICAgIGltcG9ydHNOb2RlOiBtb2R1bGVJbXBvcnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aChtb2R1bGVzV2l0aFJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBhZGRNb2R1bGU6IGZ1bmN0aW9uKG1vZHVsZU5hbWU6IHN0cmluZywgbW9kdWxlSW1wb3J0cykge1xuICAgICAgICAgICAgbW9kdWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtb2R1bGVOYW1lLFxuICAgICAgICAgICAgICAgIGltcG9ydHNOb2RlOiBtb2R1bGVJbXBvcnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKG1vZHVsZXMsIF8uaXNFcXVhbCksIFsnbmFtZSddKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0Um9vdE1vZHVsZTogZnVuY3Rpb24obW9kdWxlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBtb2R1bGU7XG4gICAgICAgIH0sXG4gICAgICAgIHByaW50Um91dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICB9LFxuICAgICAgICBoYXNSb3V0ZXJNb2R1bGVJbkltcG9ydHM6IGZ1bmN0aW9uKGltcG9ydHMpIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBpbXBvcnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcG9ydHNbaV0ubmFtZS5pbmRleE9mKCdSb3V0ZXJNb2R1bGUuZm9yQ2hpbGQnKSAhPT0gLTEgfHxcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JSb290JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgbGlua01vZHVsZXNBbmRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9zY2FuIGVhY2ggbW9kdWxlIGltcG9ydHMgQVNUIGZvciBlYWNoIHJvdXRlcywgYW5kIGxpbmsgcm91dGVzIHdpdGggbW9kdWxlXG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbW9kdWxlc1dpdGhSb3V0ZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2gobW9kdWxlc1dpdGhSb3V0ZXNbaV0uaW1wb3J0c05vZGUsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9maW5kIGVsZW1lbnQgd2l0aCBhcmd1bWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZWxlbWVudC5hcmd1bWVudHMsIGZ1bmN0aW9uKGFyZ3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJvdXRlcywgZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJndW1lbnQudGV4dCAmJiByb3V0ZS5uYW1lID09PSBhcmd1bWVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5tb2R1bGUgPSBtb2R1bGVzV2l0aFJvdXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnN0cnVjdFJvdXRlc1RyZWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnY29uc3RydWN0Um91dGVzVHJlZScpO1xuICAgICAgICAgICAgLy8gcm91dGVzW10gY29udGFpbnMgcm91dGVzIHdpdGggbW9kdWxlIGxpbmtcbiAgICAgICAgICAgIC8vIG1vZHVsZXNUcmVlIGNvbnRhaW5zIG1vZHVsZXMgdHJlZVxuICAgICAgICAgICAgLy8gbWFrZSBhIGZpbmFsIHJvdXRlcyB0cmVlIHdpdGggdGhhdFxuICAgICAgICAgICAgbGV0IGNsZWFuTW9kdWxlc1RyZWUgPSBfLmNsb25lRGVlcChtb2R1bGVzVHJlZSksXG4gICAgICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFycltpXS5pbXBvcnRzTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhcnJbaV0uaW1wb3J0c05vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhcnJbaV0ucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJyW2ldLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIoYXJyW2ldLmNoaWxkcmVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIoY2xlYW5Nb2R1bGVzVHJlZSk7XG4gICAgICAgICAgICAvL2ZzLm91dHB1dEpzb24oJy4vbW9kdWxlcy5qc29uJywgY2xlYW5Nb2R1bGVzVHJlZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW5Nb2R1bGVzVHJlZSBsaWdodDogJywgdXRpbC5pbnNwZWN0KGNsZWFuTW9kdWxlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIHZhciByb3V0ZXNUcmVlID0ge1xuICAgICAgICAgICAgICAgIHRhZzogJzxyb290PicsXG4gICAgICAgICAgICAgICAga2luZDogJ25nTW9kdWxlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZSA9IGZ1bmN0aW9uKG1vZHVsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5maW5kKHJvdXRlcywgeydtb2R1bGUnOiBtb2R1bGVOYW1lfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBsb29wTW9kdWxlc1BhcnNlciA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobm9kZS5jaGlsZHJlbltpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5yb3V0ZXMgPSBKU09OLnBhcnNlKHJvdXRlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJvdXRlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5raW5kID0gJ25nTW9kdWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlc1RyZWUuY2hpbGRyZW4ucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5baV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BNb2R1bGVzUGFyc2VyKG5vZGUuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9vcE1vZHVsZXNQYXJzZXIoXy5maW5kKGNsZWFuTW9kdWxlc1RyZWUsIHsnbmFtZSc6IHJvb3RNb2R1bGV9KSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyb3V0ZXNUcmVlOiAnLCByb3V0ZXNUcmVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcblxuICAgICAgICAgICAgLy9mcy5vdXRwdXRKc29uKCcuL3JvdXRlcy10cmVlLmpzb24nLCByb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgdmFyIGNsZWFuZWRSb3V0ZXNUcmVlO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5Sb3V0ZXNUcmVlID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHJvdXRlLmNoaWxkcmVuW2ldLnJvdXRlcztcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocm91dGVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhbmVkUm91dGVzVHJlZSA9IGNsZWFuUm91dGVzVHJlZShyb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsZWFuZWRSb3V0ZXNUcmVlOiAnLCB1dGlsLmluc3BlY3QoY2xlYW5lZFJvdXRlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29uc3RydWN0TW9kdWxlc1RyZWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IGdldE5lc3RlZENoaWxkcmVuID0gZnVuY3Rpb24oYXJyLCBwYXJlbnQ/KSB7XG4gICAgICAgICAgICAgICAgdmFyIG91dCA9IFtdXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0ucGFyZW50ID09PSBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGdldE5lc3RlZENoaWxkcmVuKGFyciwgYXJyW2ldLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJbaV0uY2hpbGRyZW4gPSBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2goYXJyW2ldKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1NjYW4gZWFjaCBtb2R1bGUgYW5kIGFkZCBwYXJlbnQgcHJvcGVydHlcbiAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihmaXJzdExvb3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goZmlyc3RMb29wTW9kdWxlLmltcG9ydHNOb2RlLCBmdW5jdGlvbihpbXBvcnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihtb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBtb2R1bGUubmFtZSA9PT0gaW1wb3J0Tm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlLnBhcmVudCA9IGZpcnN0TG9vcE1vZHVsZS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2R1bGVzVHJlZSA9IGdldE5lc3RlZENoaWxkcmVuKG1vZHVsZXMpO1xuICAgICAgICB9XG4gICAgfVxufSkoKTtcbiIsImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5sZXQgY29kZTogc3RyaW5nW10gPSBbXTtcblxuZXhwb3J0IGxldCBnZW4gPSAoZnVuY3Rpb24gKCkge1xuICAgIGxldCB0bXA6IHR5cGVvZiBjb2RlID0gW107XG5cbiAgICByZXR1cm4gKHRva2VuID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgISB0b2tlbicpO1xuICAgICAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG9rZW4gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgXFxuJyk7XG4gICAgICAgICAgICBjb2RlLnB1c2godG1wLmpvaW4oJycpKTtcbiAgICAgICAgICAgIHRtcCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29kZS5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29kZTtcbiAgICB9XG59ICgpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlKG5vZGU6IGFueSkge1xuICAgIGNvZGUgPSBbXTtcbiAgICB2aXNpdEFuZFJlY29nbml6ZShub2RlKTtcbiAgICByZXR1cm4gY29kZS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gdmlzaXRBbmRSZWNvZ25pemUobm9kZTogYW55LCBkZXB0aCA9IDApIHtcbiAgICByZWNvZ25pemUobm9kZSk7XG4gICAgZGVwdGgrKztcbiAgICBub2RlLmdldENoaWxkcmVuKCkuZm9yRWFjaChjID0+IHZpc2l0QW5kUmVjb2duaXplKGMsIGRlcHRoKSk7XG59XG5cbmZ1bmN0aW9uIHJlY29nbml6ZShub2RlOiBhbnkpIHtcblxuICAgIC8vY29uc29sZS5sb2coJ3JlY29nbml6aW5nLi4uJywgdHMuU3ludGF4S2luZFtub2RlLmtpbmQrJyddKTtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GaXJzdExpdGVyYWxUb2tlbjpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ltcG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZyb21LZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdmcm9tJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBnZW4oJ2V4cG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjbGFzcycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRoaXNLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0aGlzJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignY29uc3RydWN0b3InKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GYWxzZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ZhbHNlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0cnVlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdudWxsJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXRUb2tlbjpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgZ2VuKCcrJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW46XG4gICAgICAgICAgICBnZW4oJyA9PiAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKCcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydENsYXVzZTpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZ2VuKCd7Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmxvY2s6XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFjZVRva2VuOlxuICAgICAgICAgICAgZ2VuKCd9Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCdbJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCddJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2VtaWNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJzsnKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbW1hVG9rZW46XG4gICAgICAgICAgICBnZW4oJywnKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db2xvblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBnZW4oJzonKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb3RUb2tlbjpcbiAgICAgICAgICAgIGdlbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb1N0YXRlbWVudDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRGVjb3JhdG9yOlxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudDpcbiAgICAgICAgICAgIGdlbignID0gJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0UHVuY3R1YXRpb246XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHJpdmF0ZScpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3B1YmxpYycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIF90cyBmcm9tICcuLi8uLi91dGlscy90cy1pbnRlcm5hbCc7XG5pbXBvcnQgbWFya2VkIGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgeyBnZXROZXdMaW5lQ2hhcmFjdGVyLCBjb21waWxlckhvc3QsIGQsIGRldGVjdEluZGVudCB9IGZyb20gJy4uLy4uL3V0aWxpdGllcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgUm91dGVyUGFyc2VyIH0gZnJvbSAnLi4vLi4vdXRpbHMvcm91dGVyLnBhcnNlcic7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gJy4vY29kZWdlbic7XG5cbmludGVyZmFjZSBOb2RlT2JqZWN0IHtcbiAgICBraW5kOiBOdW1iZXI7XG4gICAgcG9zOiBOdW1iZXI7XG4gICAgZW5kOiBOdW1iZXI7XG4gICAgdGV4dDogc3RyaW5nO1xuICAgIGluaXRpYWxpemVyOiBOb2RlT2JqZWN0LFxuICAgIG5hbWU/OiB7IHRleHQ6IHN0cmluZyB9O1xuICAgIGV4cHJlc3Npb24/OiBOb2RlT2JqZWN0O1xuICAgIGVsZW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIGFyZ3VtZW50cz86IE5vZGVPYmplY3RbXTtcbiAgICBwcm9wZXJ0aWVzPzogYW55W107XG4gICAgcGFyc2VyQ29udGV4dEZsYWdzPzogTnVtYmVyO1xuICAgIGVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4/OiBOb2RlT2JqZWN0W107XG4gICAgcGFyYW1ldGVycz86IE5vZGVPYmplY3RbXTtcbiAgICBDb21wb25lbnQ/OiBTdHJpbmc7XG4gICAgYm9keT86IHtcbiAgICAgICAgcG9zOiBOdW1iZXI7XG4gICAgICAgIGVuZDogTnVtYmVyO1xuICAgICAgICBzdGF0ZW1lbnRzOiBOb2RlT2JqZWN0W107XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgRGVwcyB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBsYWJlbD86IHN0cmluZztcbiAgICBmaWxlPzogc3RyaW5nO1xuICAgIHNvdXJjZUNvZGU/OiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cbiAgICAvL0NvbXBvbmVudFxuXG4gICAgYW5pbWF0aW9ucz86IHN0cmluZ1tdOyAvLyBUT0RPXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogc3RyaW5nO1xuICAgIGVuY2Fwc3VsYXRpb24/OiBzdHJpbmc7XG4gICAgZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPXG4gICAgZXhwb3J0QXM/OiBzdHJpbmc7XG4gICAgaG9zdD86IHN0cmluZztcbiAgICBpbnB1dHM/OiBzdHJpbmdbXTtcbiAgICBpbnRlcnBvbGF0aW9uPzogc3RyaW5nOyAvLyBUT0RPXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmc7XG4gICAgb3V0cHV0cz86IHN0cmluZ1tdO1xuICAgIHF1ZXJpZXM/OiBEZXBzW107IC8vIFRPRE9cbiAgICBzZWxlY3Rvcj86IHN0cmluZztcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXTtcbiAgICBzdHlsZXM/OiBzdHJpbmdbXTtcbiAgICB0ZW1wbGF0ZT86IHN0cmluZztcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZ1tdO1xuICAgIHZpZXdQcm92aWRlcnM/OiBzdHJpbmdbXTtcblxuICAgIGlucHV0c0NsYXNzPzogT2JqZWN0W107XG5cbiAgICAvL2NvbW1vblxuICAgIHByb3ZpZGVycz86IERlcHNbXTtcblxuICAgIC8vbW9kdWxlXG4gICAgZGVjbGFyYXRpb25zPzogRGVwc1tdO1xuICAgIGJvb3RzdHJhcD86IERlcHNbXTtcblxuICAgIGltcG9ydHM/OiBEZXBzW107XG4gICAgZXhwb3J0cz86IERlcHNbXTtcbn1cblxuaW50ZXJmYWNlIFN5bWJvbERlcHMge1xuICAgIGZ1bGw6IHN0cmluZztcbiAgICBhbGlhczogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzIHtcblxuICAgIHByaXZhdGUgZmlsZXM6IHN0cmluZ1tdO1xuICAgIHByaXZhdGUgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgICBwcml2YXRlIHByb2dyYW1Db21wb25lbnQ6IHRzLlByb2dyYW07XG4gICAgcHJpdmF0ZSB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXI7XG4gICAgcHJpdmF0ZSB0eXBlQ2hlY2tlckNvbXBvbmVudDogdHMuVHlwZUNoZWNrZXI7XG4gICAgcHJpdmF0ZSBlbmdpbmU6IGFueTtcbiAgICBwcml2YXRlIF9fY2FjaGU6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgX19uc01vZHVsZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSB1bmtub3duID0gJz8/Pyc7XG5cbiAgICBjb25zdHJ1Y3RvcihmaWxlczogc3RyaW5nW10sIG9wdGlvbnM6IGFueSkge1xuICAgICAgICB0aGlzLmZpbGVzID0gZmlsZXM7XG4gICAgICAgIGNvbnN0IHRyYW5zcGlsZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRzLlNjcmlwdFRhcmdldC5FUzUsXG4gICAgICAgICAgICBtb2R1bGU6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXG4gICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogb3B0aW9ucy50c2NvbmZpZ0RpcmVjdG9yeVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHRoaXMuZmlsZXMsIHRyYW5zcGlsZU9wdGlvbnMsIGNvbXBpbGVySG9zdCh0cmFuc3BpbGVPcHRpb25zKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBicmVha0xpbmVzKHRleHQpIHtcbiAgICAgICAgdmFyIF90ID0gdGV4dDtcbiAgICAgICAgaWYgKHR5cGVvZiBfdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIF90ID0gX3QucmVwbGFjZSgvKFxcbikvZ20sICc8YnI+Jyk7XG4gICAgICAgICAgICBfdCA9IF90LnJlcGxhY2UoLyg8YnI+KSQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Q7XG4gICAgfVxuXG4gICAgZ2V0RGVwZW5kZW5jaWVzKCkge1xuICAgICAgICBsZXQgZGVwczogT2JqZWN0ID0ge1xuICAgICAgICAgICAgJ21vZHVsZXMnOiBbXSxcbiAgICAgICAgICAgICdjb21wb25lbnRzJzogW10sXG4gICAgICAgICAgICAnaW5qZWN0YWJsZXMnOiBbXSxcbiAgICAgICAgICAgICdwaXBlcyc6IFtdLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnOiBbXSxcbiAgICAgICAgICAgICdyb3V0ZXMnOiBbXSxcbiAgICAgICAgICAgICdjbGFzc2VzJzogW10sXG4gICAgICAgICAgICAnaW50ZXJmYWNlcyc6IFtdXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzb3VyY2VGaWxlcyA9IHRoaXMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpIHx8IFtdO1xuXG4gICAgICAgIHNvdXJjZUZpbGVzLm1hcCgoZmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgZmlsZVBhdGggPSBmaWxlLmZpbGVOYW1lO1xuXG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT0gJy50cycpIHtcblxuICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aC5sYXN0SW5kZXhPZignLmQudHMnKSA9PT0gLTEgJiYgZmlsZVBhdGgubGFzdEluZGV4T2YoJ3NwZWMudHMnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhcnNpbmcnLCBmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U291cmNlRmlsZURlY29yYXRvcnMoZmlsZSwgZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlLCBmaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGVwcztcblxuICAgICAgICB9KTtcblxuICAgICAgICAvL1JvdXRlclBhcnNlci5saW5rTW9kdWxlc0FuZFJvdXRlcygpO1xuICAgICAgICAvL1JvdXRlclBhcnNlci5jb25zdHJ1Y3RNb2R1bGVzVHJlZSgpO1xuICAgICAgICAvL1JvdXRlclBhcnNlci5jb25zdHJ1Y3RSb3V0ZXNUcmVlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRlcHM7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGdldFNvdXJjZUZpbGVEZWNvcmF0b3JzKHNyY0ZpbGU6IHRzLlNvdXJjZUZpbGUsIG91dHB1dFN5bWJvbHM6IE9iamVjdCk6IHZvaWQge1xuXG4gICAgICAgIGxldCBjbGVhbmVyID0gKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICBsZXQgZmlsZSA9IHNyY0ZpbGUuZmlsZU5hbWUucmVwbGFjZShjbGVhbmVyLCAnJyk7XG5cbiAgICAgICAgdGhpcy5wcm9ncmFtQ29tcG9uZW50ID0gdHMuY3JlYXRlUHJvZ3JhbShbZmlsZV0sIHt9KTtcbiAgICAgICAgbGV0IHNvdXJjZUZpbGUgPSB0aGlzLnByb2dyYW1Db21wb25lbnQuZ2V0U291cmNlRmlsZShmaWxlKTtcbiAgICAgICAgdGhpcy50eXBlQ2hlY2tlckNvbXBvbmVudCA9IHRoaXMucHJvZ3JhbUNvbXBvbmVudC5nZXRUeXBlQ2hlY2tlcih0cnVlKTtcblxuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQoc3JjRmlsZSwgKG5vZGU6IHRzLk5vZGUpID0+IHtcblxuICAgICAgICAgICAgbGV0IGRlcHM6IERlcHMgPSA8RGVwcz57fTtcbiAgICAgICAgICAgIGlmIChub2RlLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmlzaXROb2RlID0gKHZpc2l0ZWROb2RlLCBpbmRleCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXRhZGF0YSA9IG5vZGUuZGVjb3JhdG9ycy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLmZpbmRQcm9wcyh2aXNpdGVkTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q29tcG9uZW50SU8oZmlsZSwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNNb2R1bGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IHRoaXMuZ2V0TW9kdWxlRGVjbGF0aW9ucyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0czogdGhpcy5nZXRNb2R1bGVJbXBvcnRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRzOiB0aGlzLmdldE1vZHVsZUV4cG9ydHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvb3RzdHJhcDogdGhpcy5nZXRNb2R1bGVCb290c3RyYXAocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdtb2R1bGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJvdXRlclBhcnNlci5oYXNSb3V0ZXJNb2R1bGVJbkltcG9ydHMoZGVwcy5pbXBvcnRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5hZGRNb2R1bGVXaXRoUm91dGVzKG5hbWUsIHRoaXMuZ2V0TW9kdWxlSW1wb3J0c1Jhdyhwcm9wcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZE1vZHVsZShuYW1lLCBkZXBzLmltcG9ydHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snbW9kdWxlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0NvbXBvbmVudChtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHByb3BzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh1dGlsLmluc3BlY3QocHJvcHMsIHsgc2hvd0hpZGRlbjogdHJ1ZSwgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYW5pbWF0aW9ucz86IHN0cmluZ1tdOyAvLyBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiB0aGlzLmdldENvbXBvbmVudENoYW5nZURldGVjdGlvbihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jYXBzdWxhdGlvbjogdGhpcy5nZXRDb21wb25lbnRFbmNhcHN1bGF0aW9uKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2VudHJ5Q29tcG9uZW50cz86IHN0cmluZzsgLy8gVE9ETyB3YWl0aW5nIGRvYyBpbmZvc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzOiB0aGlzLmdldENvbXBvbmVudEV4cG9ydEFzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0OiB0aGlzLmdldENvbXBvbmVudEhvc3QocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogdGhpcy5nZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YShwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pbnRlcnBvbGF0aW9uPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSWQ6IHRoaXMuZ2V0Q29tcG9uZW50TW9kdWxlSWQocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IHRoaXMuZ2V0Q29tcG9uZW50T3V0cHV0cyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiB0aGlzLmdldENvbXBvbmVudFByb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9xdWVyaWVzPzogRGVwc1tdOyAvLyBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHRoaXMuZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlVXJsczogdGhpcy5nZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlczogdGhpcy5nZXRDb21wb25lbnRTdHlsZXMocHJvcHMpLCAvLyBUT0RPIGZpeCBhcmdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZ2V0Q29tcG9uZW50VGVtcGxhdGUocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiB0aGlzLmdldENvbXBvbmVudFRlbXBsYXRlVXJsKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzOiB0aGlzLmdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0NsYXNzOiBJTy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0c0NsYXNzOiBJTy5vdXRwdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNDbGFzczogSU8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzQ2xhc3M6IElPLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjb21wb25lbnRzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzSW5qZWN0YWJsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbmplY3RhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IElPLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydpbmplY3RhYmxlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc1BpcGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGlwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydwaXBlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0RpcmVjdGl2ZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snZGlyZWN0aXZlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19jYWNoZVtuYW1lXSA9IGRlcHM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGZpbHRlckJ5RGVjb3JhdG9ycyA9IChub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24gJiYgbm9kZS5leHByZXNzaW9uLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAvKE5nTW9kdWxlfENvbXBvbmVudHxJbmplY3RhYmxlfFBpcGV8RGlyZWN0aXZlKS8udGVzdChub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgbm9kZS5kZWNvcmF0b3JzXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZmlsdGVyQnlEZWNvcmF0b3JzKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCh2aXNpdE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLnN5bWJvbC5mbGFncyA9PT0gdHMuU3ltYm9sRmxhZ3MuQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENvbXBvbmVudElPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjbGFzc2VzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYobm9kZS5zeW1ib2wuZmxhZ3MgPT09IHRzLlN5bWJvbEZsYWdzLkludGVyZmFjZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0SW50ZXJmYWNlSU8oZmlsZSwgc291cmNlRmlsZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnRlcmZhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5raW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmtpbmQgPSBJTy5raW5kO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2ludGVyZmFjZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRSb3V0ZUlPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgIGlmKElPLnJvdXRlcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Um91dGVzO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Um91dGVzID0gSlNPTi5wYXJzZShJTy5yb3V0ZXMucmVwbGFjZSgvIC9nbSwgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdSb3V0ZXMgcGFyc2luZyBlcnJvciwgbWF5YmUgYSB0cmFpbGluZyBjb21tYSBvciBhbiBleHRlcm5hbCB2YXJpYWJsZSA/Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydyb3V0ZXMnXSA9IFsuLi5vdXRwdXRTeW1ib2xzWydyb3V0ZXMnXSwgLi4ubmV3Um91dGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDb21wb25lbnRJTyhmaWxlLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMucHJvcGVydGllcyA9IElPLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snY2xhc3NlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgdGhlIHJvb3QgbW9kdWxlIHdpdGggYm9vdHN0cmFwTW9kdWxlIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgLy9GaW5kIHJlY3VzaXZlbHkgaW4gZXhwcmVzc2lvbiBub2RlcyBvbmUgd2l0aCBuYW1lICdib290c3RyYXBNb2R1bGUnXG4gICAgICAgICAgICAgICAgICAgIGxldCByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZSA9IHRoaXMuZmluZEV4cHJlc3Npb25CeU5hbWUobm9kZSwgJ2Jvb3RzdHJhcE1vZHVsZScpO1xuICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHROb2RlLmFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJlc3VsdE5vZGUuYXJndW1lbnRzLCBmdW5jdGlvbihhcmd1bWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290TW9kdWxlID0gYXJndW1lbnQudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuc2V0Um9vdE1vZHVsZShyb290TW9kdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG4gICAgcHJpdmF0ZSBkZWJ1ZyhkZXBzOiBEZXBzKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnZGVidWcnLCBgJHtkZXBzLm5hbWV9OmApO1xuICAgICAgICBbXG4gICAgICAgICAgICAnaW1wb3J0cycsICdleHBvcnRzJywgJ2RlY2xhcmF0aW9ucycsICdwcm92aWRlcnMnLCAnYm9vdHN0cmFwJ1xuICAgICAgICBdLmZvckVhY2goc3ltYm9scyA9PiB7XG4gICAgICAgICAgICBpZiAoZGVwc1tzeW1ib2xzXSAmJiBkZXBzW3N5bWJvbHNdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJycsIGAtICR7c3ltYm9sc306YCk7XG4gICAgICAgICAgICAgICAgZGVwc1tzeW1ib2xzXS5tYXAoaSA9PiBpLm5hbWUpLmZvckVhY2goZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnJywgYFxcdC0gJHtkfWApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZEV4cHJlc3Npb25CeU5hbWUoZW50cnlOb2RlLCBuYW1lKSB7XG4gICAgICAgIGxldCByZXN1bHQsXG4gICAgICAgICAgICBsb29wID0gZnVuY3Rpb24obm9kZSwgbmFtZSkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbiAmJiAhbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcChub2RlLmV4cHJlc3Npb24sIG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24gJiYgbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uLm5hbWUudGV4dCA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgbG9vcChlbnRyeU5vZGUsIG5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNDb21wb25lbnQobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnQ29tcG9uZW50JztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUGlwZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdQaXBlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGlyZWN0aXZlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ0RpcmVjdGl2ZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0luamVjdGFibGUobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnSW5qZWN0YWJsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc01vZHVsZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdOZ01vZHVsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUeXBlKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGU7XG4gICAgICAgIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY29tcG9uZW50JykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdjb21wb25lbnQnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdwaXBlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdwaXBlJztcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignbW9kdWxlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdtb2R1bGUnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdkaXJlY3RpdmUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ2RpcmVjdGl2ZSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xlTmFtZShub2RlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzZWxlY3RvcicpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RXhwb3J0QXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRBcycpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAncHJvdmlkZXJzJykubWFwKChwcm92aWRlck5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKHByb3ZpZGVyTmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZFByb3BzKHZpc2l0ZWROb2RlKSB7XG4gICAgICAgIGlmKHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2aXNpdGVkTm9kZS5leHByZXNzaW9uLmFyZ3VtZW50cy5wb3AoKS5wcm9wZXJ0aWVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVEZWNsYXRpb25zKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZGVjbGFyYXRpb25zJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5maW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzUmF3KHByb3BzLCAnaW1wb3J0cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlSW1wb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2ltcG9ydHMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUV4cG9ydHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRIb3N0KHByb3BzOiBOb2RlT2JqZWN0W10pOiBPYmplY3Qge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzLCAnaG9zdCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlQm9vdHN0cmFwKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnYm9vdHN0cmFwJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YShwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW5wdXRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXREZWNvcmF0b3JPZlR5cGUobm9kZSwgZGVjb3JhdG9yVHlwZSkge1xuICAgICAgdmFyIGRlY29yYXRvcnMgPSBub2RlLmRlY29yYXRvcnMgfHwgW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZGVjb3JhdG9yc1tpXS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gZGVjb3JhdG9yVHlwZSkge1xuICAgICAgICAgIHJldHVybiBkZWNvcmF0b3JzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRJbnB1dChwcm9wZXJ0eSwgaW5EZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGluQXJncyA9IGluRGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogaW5BcmdzLmxlbmd0aCA/IGluQXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5KSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRUeXBlKG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIG5vZGUgPyB0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50LnR5cGVUb1N0cmluZyh0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50LmdldFR5cGVBdExvY2F0aW9uKG5vZGUpKSA6ICd2b2lkJztcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0T3V0cHV0KHByb3BlcnR5LCBvdXREZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG91dEFyZ3MgPSBvdXREZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBvdXRBcmdzLmxlbmd0aCA/IG91dEFyZ3NbMF0udGV4dCA6IHByb3BlcnR5Lm5hbWUudGV4dCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQdWJsaWMobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpc1B1YmxpYzogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpc1B1YmxpYykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW50ZXJuYWxNZW1iZXIobWVtYmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUHJpdmF0ZU9ySW50ZXJuYWwobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpc1ByaXZhdGU6IGJvb2xlYW4gPSBtZW1iZXIubW9kaWZpZXJzLnNvbWUobW9kaWZpZXIgPT4gbW9kaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZCk7XG4gICAgICAgICAgICBpZiAoaXNQcml2YXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbnRlcm5hbE1lbWJlcihtZW1iZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJbnRlcm5hbE1lbWJlcihtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaW50ZXJuYWxUYWdzOiBzdHJpbmdbXSA9IFsnaW50ZXJuYWwnLCAncHJpdmF0ZScsICdoaWRkZW4nXTtcbiAgICAgICAgaWYgKG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgbWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxUYWdzLmluZGV4T2YodGFnLnRhZ05hbWUudGV4dCkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzQW5ndWxhckxpZmVjeWNsZUhvb2sobWV0aG9kTmFtZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTID0gW1xuICAgICAgICAgICAgJ25nT25Jbml0JywgJ25nT25DaGFuZ2VzJywgJ25nRG9DaGVjaycsICduZ09uRGVzdHJveScsICduZ0FmdGVyQ29udGVudEluaXQnLCAnbmdBZnRlckNvbnRlbnRDaGVja2VkJyxcbiAgICAgICAgICAgICduZ0FmdGVyVmlld0luaXQnLCAnbmdBZnRlclZpZXdDaGVja2VkJywgJ3dyaXRlVmFsdWUnLCAncmVnaXN0ZXJPbkNoYW5nZScsICdyZWdpc3Rlck9uVG91Y2hlZCcsICdzZXREaXNhYmxlZFN0YXRlJ1xuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUy5pbmRleE9mKG1ldGhvZE5hbWUpID49IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKG1ldGhvZC5wYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICB2YXIgX3BhcmFtZXRlcnMgPSBbXSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtZXRob2QucGFyYW1ldGVycy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuaXNQdWJsaWMobWV0aG9kLnBhcmFtZXRlcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIF9wYXJhbWV0ZXJzLnB1c2godGhhdC52aXNpdEFyZ3VtZW50KG1ldGhvZC5wYXJhbWV0ZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9wYXJhbWV0ZXJzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENhbGxEZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSksXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0SW5kZXhEZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSksXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0TWV0aG9kRGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICBuYW1lOiBtZXRob2QubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSlcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGpzZG9jdGFncyA9IF90cy5nZXRKU0RvY3MobWV0aG9kKTtcbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIGlmIChqc2RvY3RhZ3NbMF0udGFncykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBqc2RvY3RhZ3NbMF0udGFncztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRBcmd1bWVudChhcmcpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IGFyZy5uYW1lLnRleHQsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShhcmcpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE5hbWVzQ29tcGFyZUZuKG5hbWUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJ25hbWUnO1xuICAgICAgICByZXR1cm4gKGEsIGIpID0+IGFbbmFtZV0ubG9jYWxlQ29tcGFyZShiW25hbWVdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0cmluZ2lmeURlZmF1bHRWYWx1ZShub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGlmIChub2RlLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLnRleHQ7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZCkge1xuICAgICAgICAgICAgcmV0dXJuICdmYWxzZSc7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RydWUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBwcm9wZXJ0eS5uYW1lLnRleHQsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcy52aXNpdFR5cGUocHJvcGVydHkpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdE1lbWJlcnMobWVtYmVycykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaW5wdXRzID0gW107XG4gICAgICAgIHZhciBvdXRwdXRzID0gW107XG4gICAgICAgIHZhciBtZXRob2RzID0gW107XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gW107XG4gICAgICAgIHZhciBraW5kO1xuICAgICAgICB2YXIgaW5wdXREZWNvcmF0b3IsIG91dERlY29yYXRvcjtcblxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVtYmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaW5wdXREZWNvcmF0b3IgPSB0aGlzLmdldERlY29yYXRvck9mVHlwZShtZW1iZXJzW2ldLCAnSW5wdXQnKTtcbiAgICAgICAgICAgIG91dERlY29yYXRvciA9IHRoaXMuZ2V0RGVjb3JhdG9yT2ZUeXBlKG1lbWJlcnNbaV0sICdPdXRwdXQnKTtcblxuICAgICAgICAgICAga2luZCA9IG1lbWJlcnNbaV0ua2luZDtcblxuICAgICAgICAgICAgaWYgKGlucHV0RGVjb3JhdG9yKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRzLnB1c2godGhpcy52aXNpdElucHV0KG1lbWJlcnNbaV0sIGlucHV0RGVjb3JhdG9yKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91dERlY29yYXRvcikge1xuICAgICAgICAgICAgICAgIG91dHB1dHMucHVzaCh0aGlzLnZpc2l0T3V0cHV0KG1lbWJlcnNbaV0sIG91dERlY29yYXRvcikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1ByaXZhdGVPckludGVybmFsKG1lbWJlcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTWV0aG9kRGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLk1ldGhvZFNpZ25hdHVyZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuaXNBbmd1bGFyTGlmZWN5Y2xlSG9vayhtZW1iZXJzW2ldLm5hbWUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wdXNoKHRoaXMudmlzaXRNZXRob2REZWNsYXJhdGlvbihtZW1iZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5U2lnbmF0dXJlIHx8IG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5HZXRBY2Nlc3Nvcikge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdFByb3BlcnR5KG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5DYWxsU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0Q2FsbERlY2xhcmF0aW9uKG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbmRleFNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdEluZGV4RGVjbGFyYXRpb24obWVtYmVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfY29uc3RydWN0b3JQcm9wZXJ0aWVzID0gdGhpcy52aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWVtYmVyc1tpXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBqID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiA9IF9jb25zdHJ1Y3RvclByb3BlcnRpZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBmb3IoajsgajxsZW47IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKF9jb25zdHJ1Y3RvclByb3BlcnRpZXNbal0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW5wdXRzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcbiAgICAgICAgb3V0cHV0cy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG4gICAgICAgIHByb3BlcnRpZXMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgbWV0aG9kcyxcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgICAgICBraW5kXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdERpcmVjdGl2ZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICB2YXIgZXhwb3J0QXM7XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzWzBdLnByb3BlcnRpZXM7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocHJvcGVydGllc1tpXS5uYW1lLnRleHQgPT09ICdzZWxlY3RvcicpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgb25seSB3b3JrIGlmIHNlbGVjdG9yIGlzIGluaXRpYWxpemVkIGFzIGEgc3RyaW5nIGxpdGVyYWxcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHByb3BlcnRpZXNbaV0uaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzW2ldLm5hbWUudGV4dCA9PT0gJ2V4cG9ydEFzJykge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBvbmx5IHdvcmsgaWYgc2VsZWN0b3IgaXMgaW5pdGlhbGl6ZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbFxuICAgICAgICAgICAgICAgIGV4cG9ydEFzID0gcHJvcGVydGllc1tpXS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgICAgZXhwb3J0QXNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUGlwZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgIHJldHVybiBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdQaXBlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTW9kdWxlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgcmV0dXJuIGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ05nTW9kdWxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGlyZWN0aXZlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgIHJldHVybiBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9PT0gJ0RpcmVjdGl2ZScgfHwgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPT09ICdDb21wb25lbnQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNTZXJ2aWNlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgcmV0dXJuIGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ0luamVjdGFibGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVOYW1lLCBjbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBzeW1ib2wgPSB0aGlzLnByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKS5nZXRTeW1ib2xBdExvY2F0aW9uKGNsYXNzRGVjbGFyYXRpb24ubmFtZSk7XG4gICAgICAgIHZhciBkZXNjcmlwdGlvbiA9IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhzeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpO1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5uYW1lLnRleHQ7XG4gICAgICAgIHZhciBkaXJlY3RpdmVJbmZvO1xuICAgICAgICB2YXIgbWVtYmVycztcblxuICAgICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRGlyZWN0aXZlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5mbyA9IHRoaXMudmlzaXREaXJlY3RpdmVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogbWVtYmVycy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBtZW1iZXJzLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNTZXJ2aWNlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzUGlwZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pIHx8IHRoaXMuaXNNb2R1bGVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZFxuICAgICAgICAgICAgfV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzKTtcblxuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRFbnVtRGVjbGFyYXRpb24oZmlsZU5hbWUsIG5vZGUpIHtcbiAgICAgICAgaWYoIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZSAmJiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZS50ZXh0ID09PSAnUm91dGVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZFJvdXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0ubmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGdlbmVyYXRlKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcilcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzOiBnZW5lcmF0ZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSb3V0ZUlPKGZpbGVuYW1lLCBzb3VyY2VGaWxlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0RW51bURlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudElPKGZpbGVuYW1lOiBzdHJpbmcsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SW50ZXJmYWNlSU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZSwgbm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5wb3MgPT09IG5vZGUucG9zICYmIHN0YXRlbWVudC5lbmQgPT09IG5vZGUuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRPdXRwdXRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdvdXRwdXRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdwcm92aWRlcnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd2aWV3UHJvdmlkZXJzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnREaXJlY3RpdmVzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZGlyZWN0aXZlcycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICAgICAgaWRlbnRpZmllci5zZWxlY3RvciA9IHRoaXMuZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWUpO1xuICAgICAgICAgICAgaWRlbnRpZmllci5sYWJlbCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgbGV0IG5zTW9kdWxlID0gbmFtZS5zcGxpdCgnLicpLFxuICAgICAgICAgICAgdHlwZSA9IHRoaXMuZ2V0VHlwZShuYW1lKTtcbiAgICAgICAgaWYgKG5zTW9kdWxlLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgLy8gY2FjaGUgZGVwcyB3aXRoIHRoZSBzYW1lIG5hbWVzcGFjZSAoaS5lIFNoYXJlZC4qKVxuICAgICAgICAgICAgaWYgKHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fbnNNb2R1bGVbbnNNb2R1bGVbMF1dLnB1c2gobmFtZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0gPSBbbmFtZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbnM6IG5zTW9kdWxlWzBdLFxuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVVcmxzKHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3RlbXBsYXRlVXJsJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50VGVtcGxhdGUocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIGxldCB0ID0gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndGVtcGxhdGUnLCB0cnVlKS5wb3AoKVxuICAgICAgICBpZih0KSB7XG4gICAgICAgICAgICB0ID0gZGV0ZWN0SW5kZW50KHQsIDApO1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvXFxuLywgJycpO1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvICskL2dtLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVVcmxzKHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3N0eWxlVXJscycpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFN0eWxlcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnc3R5bGVzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRNb2R1bGVJZChwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ21vZHVsZUlkJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRDaGFuZ2VEZXRlY3Rpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdjaGFuZ2VEZXRlY3Rpb24nKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2VuY2Fwc3VsYXRpb24nKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNhbml0aXplVXJscyh1cmxzOiBzdHJpbmdbXSkge1xuICAgICAgICByZXR1cm4gdXJscy5tYXAodXJsID0+IHVybC5yZXBsYWNlKCcuLycsICcnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IE9iamVjdCB7XG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBwYXJzZVByb3BlcnRpZXMgPSAobm9kZTogTm9kZU9iamVjdCk6IE9iamVjdCA9PiB7XG4gICAgICAgICAgICBsZXQgb2JqID0ge307XG4gICAgICAgICAgICAobm9kZS5pbml0aWFsaXplci5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgb2JqW3Byb3AubmFtZS50ZXh0XSA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZGVwcy5tYXAocGFyc2VQcm9wZXJ0aWVzKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogYW55IHtcbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZXBzIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwcyhwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9sVGV4dCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoJy8nKSAhPT0gLTEgJiYgIW11bHRpTGluZSkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnNwbGl0KCcvJykucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgIF07XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGJ1aWxkSWRlbnRpZmllck5hbWUgPSAobm9kZTogTm9kZU9iamVjdCwgbmFtZSA9ICcnKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZSA/IGAuJHtuYW1lfWAgOiBuYW1lO1xuXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVOYW1lID0gdGhpcy51bmtub3duO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLmV4cHJlc3Npb24pIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihub2RlLmV4cHJlc3Npb24uZWxlbWVudHMpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbi5raW5kID09PSB0cy5TeW50YXhLaW5kLkFycmF5TGl0ZXJhbEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi5lbGVtZW50cy5tYXAoIGVsID0+IGVsLnRleHQgKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gYFske25vZGVOYW1lfV1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSAgdHMuU3ludGF4S2luZC5TcHJlYWRFbGVtZW50RXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYC4uLiR7bm9kZU5hbWV9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2J1aWxkSWRlbnRpZmllck5hbWUobm9kZS5leHByZXNzaW9uLCBub2RlTmFtZSl9JHtuYW1lfWBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGAke25vZGUudGV4dH0uJHtuYW1lfWA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24gPSAobzogTm9kZU9iamVjdCk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOlxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiBBUFBfQkFTRV9IUkVGLCB1c2VWYWx1ZTogJy8nIH0sXG4gICAgICAgICAgICAvLyBvclxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiAnRGF0ZScsIHVzZUZhY3Rvcnk6IChkMSwgZDIpID0+IG5ldyBEYXRlKCksIGRlcHM6IFsnZDEnLCAnZDInXSB9XG5cbiAgICAgICAgICAgIGxldCBfZ2VuUHJvdmlkZXJOYW1lOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IF9wcm92aWRlclByb3BzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICAoby5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAnJHtpZGVudGlmaWVyfSdgO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGxhbWJkYSBmdW5jdGlvbiAoaS5lIHVzZUZhY3RvcnkpXG4gICAgICAgICAgICAgICAgaWYgKHByb3AuaW5pdGlhbGl6ZXIuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0gKHByb3AuaW5pdGlhbGl6ZXIucGFyYW1ldGVycyB8fCA8YW55PltdKS5tYXAoKHBhcmFtczogTm9kZU9iamVjdCkgPT4gcGFyYW1zLm5hbWUudGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXIgPSBgKCR7cGFyYW1zLmpvaW4oJywgJyl9KSA9PiB7fWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gZmFjdG9yeSBkZXBzIGFycmF5XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudHMgPSAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cyB8fCBbXSkubWFwKChuOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJyR7bi50ZXh0fSdgO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGBbJHtlbGVtZW50cy5qb2luKCcsICcpfV1gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF9wcm92aWRlclByb3BzLnB1c2goW1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBwcm92aWRlXG4gICAgICAgICAgICAgICAgICAgIHByb3AubmFtZS50ZXh0LFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBPcGFxdWVUb2tlbiBvciAnU3RyaW5nVG9rZW4nXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcblxuICAgICAgICAgICAgICAgIF0uam9pbignOiAnKSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYHsgJHtfcHJvdmlkZXJQcm9wcy5qb2luKCcsICcpfSB9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZVN5bWJvbEVsZW1lbnRzID0gKG86IE5vZGVPYmplY3QgfCBhbnkpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogQW5ndWxhckZpcmVNb2R1bGUuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZylcbiAgICAgICAgICAgIGlmIChvLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSBidWlsZElkZW50aWZpZXJOYW1lKG8uZXhwcmVzc2lvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbiBhcmd1bWVudHMgY291bGQgYmUgcmVhbGx5IGNvbXBsZXhlLiBUaGVyZSBhcmUgc29cbiAgICAgICAgICAgICAgICAvLyBtYW55IHVzZSBjYXNlcyB0aGF0IHdlIGNhbid0IGhhbmRsZS4gSnVzdCBwcmludCBcImFyZ3NcIiB0byBpbmRpY2F0ZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2UgaGF2ZSBhcmd1bWVudHMuXG5cbiAgICAgICAgICAgICAgICBsZXQgZnVuY3Rpb25BcmdzID0gby5hcmd1bWVudHMubGVuZ3RoID4gMCA/ICdhcmdzJyA6ICcnO1xuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gYCR7Y2xhc3NOYW1lfSgke2Z1bmN0aW9uQXJnc30pYDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogU2hhcmVkLk1vZHVsZVxuICAgICAgICAgICAgZWxzZSBpZiAoby5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBidWlsZElkZW50aWZpZXJOYW1lKG8pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gby50ZXh0ID8gby50ZXh0IDogcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24obyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9scyA9IChub2RlOiBOb2RlT2JqZWN0KTogc3RyaW5nW10gPT4ge1xuXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5vZGUuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlU3ltYm9sVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBwYXJzZVN5bWJvbEVsZW1lbnRzKG5vZGUuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMubWFwKHBhcnNlU3ltYm9sRWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVN5bWJvbHMpLnBvcCgpIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlW25hbWVdO1xuICAgIH1cblxufVxuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgTGl2ZVNlcnZlciBmcm9tICdsaXZlLXNlcnZlcic7XG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xuXG5jb25zdCBnbG9iOiBhbnkgPSByZXF1aXJlKCdnbG9iJyk7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBIdG1sRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2h0bWwuZW5naW5lJztcbmltcG9ydCB7IE1hcmtkb3duRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL21hcmtkb3duLmVuZ2luZSc7XG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2ZpbGUuZW5naW5lJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24sIElDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5pbXBvcnQgeyBOZ2RFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvbmdkLmVuZ2luZSc7XG5pbXBvcnQgeyBTZWFyY2hFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvc2VhcmNoLmVuZ2luZSc7XG5pbXBvcnQgeyBEZXBlbmRlbmNpZXMgfSBmcm9tICcuL2NvbXBpbGVyL2RlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBSb3V0ZXJQYXJzZXIgfSBmcm9tICcuLi91dGlscy9yb3V0ZXIucGFyc2VyJztcblxuaW1wb3J0IHsgQ09NUE9ET0NfREVGQVVMVFMgfSBmcm9tICcuLi91dGlscy9kZWZhdWx0cyc7XG5cbmxldCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKSxcbiAgICBjd2QgPSBwcm9jZXNzLmN3ZCgpLFxuICAgICRodG1sZW5naW5lID0gbmV3IEh0bWxFbmdpbmUoKSxcbiAgICAkZmlsZWVuZ2luZSA9IG5ldyBGaWxlRW5naW5lKCksXG4gICAgJG1hcmtkb3duZW5naW5lID0gbmV3IE1hcmtkb3duRW5naW5lKCksXG4gICAgJG5nZGVuZ2luZSA9IG5ldyBOZ2RFbmdpbmUoKSxcbiAgICAkc2VhcmNoRW5naW5lID0gbmV3IFNlYXJjaEVuZ2luZSgpLFxuICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbiB7XG4gICAgb3B0aW9uczpPYmplY3Q7XG4gICAgZmlsZXM6IEFycmF5PHN0cmluZz47XG5cbiAgICBjb25maWd1cmF0aW9uOklDb25maWd1cmF0aW9uO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGNvbXBvZG9jIGFwcGxpY2F0aW9uIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG9wdGlvbnMgdGhhdCBzaG91bGQgYmUgdXNlZC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zPzpPYmplY3QpIHtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiBvcHRpb25zICkge1xuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YVtvcHRpb25dICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YVtvcHRpb25dID0gb3B0aW9uc1tvcHRpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY29tcG9kb2NcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XG4gICAgICAgICRodG1sZW5naW5lLmluaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1BhY2thZ2VKc29uKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEZpbGVzKGZpbGVzOkFycmF5PHN0cmluZz4pIHtcbiAgICAgICAgdGhpcy5maWxlcyA9IGZpbGVzO1xuICAgIH1cblxuICAgIHByb2Nlc3NQYWNrYWdlSnNvbigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBwYWNrYWdlLmpzb24gZmlsZScpO1xuICAgICAgICAkZmlsZWVuZ2luZS5nZXQoJ3BhY2thZ2UuanNvbicpLnRoZW4oKHBhY2thZ2VEYXRhKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UocGFja2FnZURhdGEpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWREYXRhLm5hbWUgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPT09IENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9IHBhcnNlZERhdGEubmFtZSArICcgZG9jdW1lbnRhdGlvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZERhdGEuZGVzY3JpcHRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb24gPSBwYXJzZWREYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhY2thZ2UuanNvbiBmaWxlIGZvdW5kJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bigpO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IHBhY2thZ2UuanNvbiBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bigpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzTWFya2Rvd24oKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdTZWFyY2hpbmcgUkVBRE1FLm1kIGZpbGUnKTtcbiAgICAgICAgJG1hcmtkb3duZW5naW5lLmdldFJlYWRtZUZpbGUoKS50aGVuKChyZWFkbWVEYXRhOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdyZWFkbWUnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJlYWRtZSA9IHJlYWRtZURhdGE7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnUkVBRE1FLm1kIGZpbGUgZm91bmQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IFJFQURNRS5tZCBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnb3ZlcnZpZXcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXNEYXRhKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnR2V0IGRlcGVuZGVuY2llcyBkYXRhJyk7XG5cbiAgICAgICAgbGV0IGNyYXdsZXIgPSBuZXcgRGVwZW5kZW5jaWVzKFxuICAgICAgICAgIHRoaXMuZmlsZXMsIHtcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS5pbml0KGRlcGVuZGVuY2llc0RhdGEpO1xuXG4gICAgICAgIC8vUm91dGVyUGFyc2VyLnByaW50Um91dGVzKCk7XG5cbiAgICAgICAgdGhpcy5wcmVwYXJlTW9kdWxlcygpO1xuXG4gICAgICAgIHRoaXMucHJlcGFyZUNvbXBvbmVudHMoKS50aGVuKChyZWFkbWVEYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVEaXJlY3RpdmVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5pbmplY3RhYmxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlSW5qZWN0YWJsZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlUm91dGVzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnBpcGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVQaXBlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5jbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVDbGFzc2VzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZUludGVyZmFjZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlQ292ZXJhZ2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVNb2R1bGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBtb2R1bGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCkubWFwKG5nTW9kdWxlID0+IHtcbiAgICAgICAgICAgIFsnZGVjbGFyYXRpb25zJywgJ2Jvb3RzdHJhcCcsICdpbXBvcnRzJywgJ2V4cG9ydHMnXS5mb3JFYWNoKG1ldGFkYXRhVHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgbmdNb2R1bGVbbWV0YWRhdGFUeXBlXSA9IG5nTW9kdWxlW21ldGFkYXRhVHlwZV0uZmlsdGVyKG1ldGFEYXRhSXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAobWV0YURhdGFJdGVtLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGl2ZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0RGlyZWN0aXZlcygpLnNvbWUoZGlyZWN0aXZlID0+IGRpcmVjdGl2ZS5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbXBvbmVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q29tcG9uZW50cygpLnNvbWUoY29tcG9uZW50ID0+IGNvbXBvbmVudC5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ21vZHVsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0TW9kdWxlcygpLnNvbWUobW9kdWxlID0+IG1vZHVsZS5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BpcGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldFBpcGVzKCkuc29tZShwaXBlID0+IHBpcGUubmFtZSA9PT0gbWV0YURhdGFJdGVtLm5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG5nTW9kdWxlLnByb3ZpZGVycyA9IG5nTW9kdWxlLnByb3ZpZGVycy5maWx0ZXIocHJvdmlkZXIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEluamVjdGFibGVzKCkuc29tZShpbmplY3RhYmxlID0+IGluamVjdGFibGUubmFtZSA9PT0gcHJvdmlkZXIubmFtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBuZ01vZHVsZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgIG5hbWU6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdtb2R1bGVzJ1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ21vZHVsZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgbW9kdWxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlUGlwZXMgPSAoKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIHBpcGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UGlwZXMoKTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdwaXBlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3BpcGUnLFxuICAgICAgICAgICAgICAgIHBpcGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlQ2xhc3NlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY2xhc3NlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q2xhc3NlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnY2xhc3NlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgIGNsYXNzOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlSW50ZXJmYWNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgaW50ZXJmYWNlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW50ZXJmYWNlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcy5sZW5ndGg7XG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2ludGVyZmFjZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAgICAgaW50ZXJmYWNlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlQ29tcG9uZW50cygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY29tcG9uZW50cycpO1xuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDb21wb25lbnRzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArICdSRUFETUUubWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUkVBRE1FLm1kIGV4aXN0IGZvciB0aGlzIGNvbXBvbmVudCwgaW5jbHVkZSBpdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHJlYWRtZUZpbGUsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLnJlYWRtZSA9IG1hcmtlZChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRGlyZWN0aXZlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgZGlyZWN0aXZlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0RGlyZWN0aXZlcygpO1xuXG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdkaXJlY3RpdmVzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZUluamVjdGFibGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBpbmplY3RhYmxlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEluamVjdGFibGVzKCk7XG5cbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgICAgIGluamVjdGFibGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlUm91dGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyByb3V0ZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJvdXRlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Um91dGVzKCk7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ3JvdXRlcycsXG4gICAgICAgICAgICBjb250ZXh0OiAncm91dGVzJ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlQ292ZXJhZ2UoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgcmVwb3J0Jyk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogbG9vcCB3aXRoIGNvbXBvbmVudHMsIGNsYXNzZXMsIGluamVjdGFibGVzLCBpbnRlcmZhY2VzLCBwaXBlc1xuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGZpbGVzID0gW10sXG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgIGdldFN0YXR1cyA9IGZ1bmN0aW9uKHBlcmNlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzO1xuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50IDw9IDI1KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdsb3cnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGVyY2VudCA+IDI1ICYmIHBlcmNlbnQgPD0gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ21lZGl1bSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJjZW50ID4gNTAgJiYgcGVyY2VudCA8PSA3NSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnZ29vZCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ3ZlcnktZ29vZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cywgKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY29tcG9uZW50LmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wb25lbnQubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjb21wb25lbnQucHJvcGVydGllc0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5tZXRob2RzQ2xhc3MubGVuZ3RoICsgY29tcG9uZW50LmlucHV0c0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5vdXRwdXRzQ2xhc3MubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5wcm9wZXJ0aWVzQ2xhc3MsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQubWV0aG9kc0NsYXNzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQuaW5wdXRzQ2xhc3MsIChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKGlucHV0LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQub3V0cHV0c0NsYXNzLCAob3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYob3V0cHV0LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcywgKGNsYXNzZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY2xhc3NlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzc2UnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjbGFzc2UubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjbGFzc2UucHJvcGVydGllcy5sZW5ndGggKyBjbGFzc2UubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goY2xhc3NlLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGlmKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICB9KTtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcywgKGluamVjdGFibGUpID0+IHtcbiAgICAgICAgICAgIGxldCBjbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGluamVjdGFibGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW5qZWN0YWJsZS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmplY3RhYmxlLm5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLmxlbmd0aCArIGluamVjdGFibGUubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMsIChpbnRlcikgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW50ZXIuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW50ZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaW50ZXIubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBpbnRlci5wcm9wZXJ0aWVzLmxlbmd0aCArIGludGVyLm1ldGhvZHMubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGludGVyLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbnRlci5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLCAocGlwZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogcGlwZS5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBwaXBlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBpcGUubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSAxO1xuICAgICAgICAgICAgaWYgKHBpcGUuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWxlcyA9IF8uc29ydEJ5KGZpbGVzLCBbJ2ZpbGVQYXRoJ10pO1xuICAgICAgICB2YXIgY292ZXJhZ2VEYXRhID0ge1xuICAgICAgICAgICAgY291bnQ6IE1hdGguZmxvb3IodG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCAvIGZpbGVzLmxlbmd0aCksXG4gICAgICAgICAgICBzdGF0dXM6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGNvdmVyYWdlRGF0YS5zdGF0dXMgPSBnZXRTdGF0dXMoY292ZXJhZ2VEYXRhLmNvdW50KTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ2NvdmVyYWdlJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdjb3ZlcmFnZScsXG4gICAgICAgICAgICBmaWxlczogZmlsZXMsXG4gICAgICAgICAgICBkYXRhOiBjb3ZlcmFnZURhdGFcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1BhZ2VzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlcycpO1xuICAgICAgICBsZXQgcGFnZXMgPSB0aGlzLmNvbmZpZ3VyYXRpb24ucGFnZXMsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHBhZ2VzLmxlbmd0aCxcbiAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgcGFnZScsIHBhZ2VzW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAkaHRtbGVuZ2luZS5yZW5kZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLCBwYWdlc1tpXSkudGhlbigoaHRtbERhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZXNbaV0ucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSBwYWdlc1tpXS5wYXRoICsgJy8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2VzW2ldLm5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5pbmRleFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9zOiBwYWdlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGZpbmFsUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShmaW5hbFBhdGgpLCBodG1sRGF0YSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgJyArIHBhZ2VzW2ldLm5hbWUgKyAnIHBhZ2UgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5nZW5lcmF0ZVNlYXJjaEluZGV4SnNvbih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBc3NldHNGb2xkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXNvdXJjZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICBsb29wKCk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0Fzc2V0c0ZvbGRlcigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgYXNzZXRzIGZvbGRlcicpO1xuXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBQcm92aWRlZCBhc3NldHMgZm9sZGVyICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlcn0gZGlkIG5vdCBleGlzdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1Jlc291cmNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgbWFpbiByZXNvdXJjZXMnKTtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy9yZXNvdXJjZXMvJyksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcmVzb3VyY2VzIGNvcHkgJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmV4dFRoZW1lKSwgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnL3N0eWxlcy8nKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGV4dGVybmFsIHN0eWxpbmcgdGhlbWUgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBjb3B5IHN1Y2NlZWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0dyYXBocygpIHtcblxuICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbmFsVGltZSA9IChuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnRG9jdW1lbnRhdGlvbiBnZW5lcmF0ZWQgaW4gJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnIGluICcgKyBmaW5hbFRpbWUgKyAnIHNlY29uZHMgdXNpbmcgJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSArICcgdGhlbWUnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuc2VydmUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XZWJTZXJ2ZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlR3JhcGgpIHtcblxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0dyYXBoIGdlbmVyYXRpb24gZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBtYWluIGdyYXBoJyk7XG4gICAgICAgICAgICBsZXQgbW9kdWxlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzLFxuICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgbGVuID0gbW9kdWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIG1vZHVsZSBncmFwaCcsIG1vZHVsZXNbaV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJ21vZHVsZXMvJyArIG1vZHVsZXNbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAkbmdkZW5naW5lLnJlbmRlckdyYXBoKG1vZHVsZXNbaV0uZmlsZSwgZmluYWxQYXRoLCAnZicpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZmluYWxNYWluR3JhcGhQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgIGlmKGZpbmFsTWFpbkdyYXBoUGF0aC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGZpbmFsTWFpbkdyYXBoUGF0aCArPSAnLyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbE1haW5HcmFwaFBhdGggKz0gJ2dyYXBoJztcbiAgICAgICAgICAgICRuZ2RlbmdpbmUucmVuZGVyR3JhcGgodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnLCBwYXRoLnJlc29sdmUoZmluYWxNYWluR3JhcGhQYXRoKSwgJ3AnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZ3JhcGggZ2VuZXJhdGlvbjogJywgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW5XZWJTZXJ2ZXIoZm9sZGVyKSB7XG4gICAgICAgIExpdmVTZXJ2ZXIuc3RhcnQoe1xuICAgICAgICAgICAgcm9vdDogZm9sZGVyLFxuICAgICAgICAgICAgb3BlbjogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm9wZW4sXG4gICAgICAgICAgICBxdWlldDogdHJ1ZSxcbiAgICAgICAgICAgIGxvZ0xldmVsOiAwLFxuICAgICAgICAgICAgcG9ydDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBhcHBsaWNhdGlvbiAvIHJvb3QgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIGdldCBhcHBsaWNhdGlvbigpOkFwcGxpY2F0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBnZXQgaXNDTEkoKTpib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSAnLi9hcHAvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4vdXRpbHMvZGVmYXVsdHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyksXG4gICAgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpLFxuICAgIGZpbGVzID0gW10sXG4gICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxuZXhwb3J0IGNsYXNzIENsaUFwcGxpY2F0aW9uIGV4dGVuZHMgQXBwbGljYXRpb25cbntcbiAgICAvKipcbiAgICAgKiBSdW4gY29tcG9kb2MgZnJvbSB0aGUgY29tbWFuZCBsaW5lLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZW5lcmF0ZSgpIHtcblxuICAgICAgICBwcm9ncmFtXG4gICAgICAgICAgICAudmVyc2lvbihwa2cudmVyc2lvbilcbiAgICAgICAgICAgIC51c2FnZSgnPHNyYz4gW29wdGlvbnNdJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1wLCAtLXRzY29uZmlnIFtjb25maWddJywgJ0EgdHNjb25maWcuanNvbiBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1kLCAtLW91dHB1dCBbZm9sZGVyXScsICdXaGVyZSB0byBzdG9yZSB0aGUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQ6IC4vZG9jdW1lbnRhdGlvbiknLCBDT01QT0RPQ19ERUZBVUxUUy5mb2xkZXIpXG4gICAgICAgICAgICAub3B0aW9uKCctYiwgLS1iYXNlIFtiYXNlXScsICdCYXNlIHJlZmVyZW5jZSBvZiBodG1sIHRhZyA8YmFzZT4nLCBDT01QT0RPQ19ERUZBVUxUUy5iYXNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXksIC0tZXh0VGhlbWUgW2ZpbGVdJywgJ0V4dGVybmFsIHN0eWxpbmcgdGhlbWUgZmlsZScpXG4gICAgICAgICAgICAub3B0aW9uKCctbiwgLS1uYW1lIFtuYW1lXScsICdUaXRsZSBkb2N1bWVudGF0aW9uJywgQ09NUE9ET0NfREVGQVVMVFMudGl0bGUpXG4gICAgICAgICAgICAub3B0aW9uKCctYSwgLS1hc3NldHNGb2xkZXIgW2ZvbGRlcl0nLCAnRXh0ZXJuYWwgYXNzZXRzIGZvbGRlciB0byBjb3B5IGluIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIGZvbGRlcicpXG4gICAgICAgICAgICAub3B0aW9uKCctbywgLS1vcGVuJywgJ09wZW4gdGhlIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uJywgZmFsc2UpXG4gICAgICAgICAgICAvLy5vcHRpb24oJy1pLCAtLWluY2x1ZGVzIFtwYXRoXScsICdQYXRoIG9mIGV4dGVybmFsIG1hcmtkb3duIGZpbGVzIHRvIGluY2x1ZGUnKVxuICAgICAgICAgICAgLy8ub3B0aW9uKCctaiwgLS1pbmNsdWRlc05hbWUgW25hbWVdJywgJ05hbWUgb2YgaXRlbSBtZW51IG9mIGV4dGVybmFscyBtYXJrZG93biBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy10LCAtLXNpbGVudCcsICdJbiBzaWxlbnQgbW9kZSwgbG9nIG1lc3NhZ2VzIGFyZW5cXCd0IGxvZ2dlZCBpbiB0aGUgY29uc29sZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXMsIC0tc2VydmUnLCAnU2VydmUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQgaHR0cDovL2xvY2FsaG9zdDo4MDgwLyknLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy1yLCAtLXBvcnQgW3BvcnRdJywgJ0NoYW5nZSBkZWZhdWx0IHNlcnZpbmcgcG9ydCcsIENPTVBPRE9DX0RFRkFVTFRTLnBvcnQpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRoZW1lIFt0aGVtZV0nLCAnQ2hvb3NlIG9uZSBvZiBhdmFpbGFibGUgdGhlbWVzLCBkZWZhdWx0IGlzIFxcJ2dpdGJvb2tcXCcgKGxhcmF2ZWwsIG9yaWdpbmFsLCBwb3N0bWFyaywgcmVhZHRoZWRvY3MsIHN0cmlwZSwgdmFncmFudCknKVxuICAgICAgICAgICAgLm9wdGlvbignLS1oaWRlR2VuZXJhdG9yJywgJ0RvIG5vdCBwcmludCB0aGUgQ29tcG9kb2MgbGluayBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVTb3VyY2VDb2RlJywgJ0RvIG5vdCBhZGQgc291cmNlIGNvZGUgdGFiJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVHcmFwaCcsICdEbyBub3QgYWRkIHRoZSBkZXBlbmRlbmN5IGdyYXBoJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVDb3ZlcmFnZScsICdEbyBub3QgYWRkIHRoZSBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHJlcG9ydCcsIGZhbHNlKVxuICAgICAgICAgICAgLnBhcnNlKHByb2Nlc3MuYXJndik7XG5cbiAgICAgICAgbGV0IG91dHB1dEhlbHAgPSAoKSA9PiB7XG4gICAgICAgICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKVxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ID0gcHJvZ3JhbS5vdXRwdXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5iYXNlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYmFzZSA9IHByb2dyYW0uYmFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmV4dFRoZW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUgPSBwcm9ncmFtLmV4dFRoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0udGhlbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSA9IHByb2dyYW0udGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5uYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID0gcHJvZ3JhbS5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uYXNzZXRzRm9sZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyID0gcHJvZ3JhbS5hc3NldHNGb2xkZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3BlbiA9IHByb2dyYW0ub3BlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgID0gcHJvZ3JhbS5pbmNsdWRlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzTmFtZSAgPSBwcm9ncmFtLmluY2x1ZGVzTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNpbGVudCkge1xuICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5zZXJ2ZSAgPSBwcm9ncmFtLnNlcnZlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ucG9ydCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnQgPSBwcm9ncmFtLnBvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaGlkZUdlbmVyYXRvciA9IHByb2dyYW0uaGlkZUdlbmVyYXRvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVNvdXJjZUNvZGUgPSBwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZUdyYXBoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoID0gcHJvZ3JhbS5kaXNhYmxlR3JhcGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UgPSBwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNlcnZlICYmICFwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICAvLyBpZiAtcyAmIC1kLCBzZXJ2ZSBpdFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0ub3V0cHV0KSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgJHtwcm9ncmFtLm91dHB1dH0gZm9sZGVyIGRvZXNuJ3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3Byb2dyYW0ub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7cHJvZ3JhbS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHN1cGVyLnJ1bldlYlNlcnZlcihwcm9ncmFtLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3JhbS5zZXJ2ZSAmJiAhcHJvZ3JhbS50c2NvbmZpZyAmJiAhcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgICAgIC8vIGlmIG9ubHkgLXMgZmluZCAuL2RvY3VtZW50YXRpb24sIGlmIG9rIHNlcnZlLCBlbHNlIGVycm9yIHByb3ZpZGUgLWRcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLm91dHB1dCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1Byb3ZpZGUgb3V0cHV0IGdlbmVyYXRlZCBmb2xkZXIgd2l0aCAtZCBmbGFnJyk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHtwcm9ncmFtLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3Byb2dyYW0ucG9ydH1gKTtcbiAgICAgICAgICAgICAgICBzdXBlci5ydW5XZWJTZXJ2ZXIocHJvZ3JhbS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHByb2dyYW0uaGlkZUdlbmVyYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5oaWRlR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRlZmF1bHRXYWxrRk9sZGVyID0gY3dkIHx8ICcuJyxcbiAgICAgICAgICAgICAgICB3YWxrID0gKGRpciwgZXhjbHVkZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4Y2x1ZGUuaW5kZXhPZihmaWxlKSA8IDAgJiYgZGlyLmluZGV4T2YoJ25vZGVfbW9kdWxlcycpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUgPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQod2FsayhmaWxlLCBleGNsdWRlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKC8oc3BlY3xcXC5kKVxcLnRzLy50ZXN0KGZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSWdub3JpbmcnLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLnRzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0luY2x1ZGluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0udHNjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignXCJ0c2NvbmZpZy5qc29uXCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeScpO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9maWxlID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKSksXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aC5iYXNlbmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyB0c2NvbmZpZycsIF9maWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHJlcXVpcmUoX2ZpbGUpLmZpbGVzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb2YgdHNjb25maWcuanNvbiBhcyBhIHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICAgIGN3ZCA9IF9maWxlLnNwbGl0KHBhdGguc2VwKS5zbGljZSgwLCAtMSkuam9pbihwYXRoLnNlcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGUgPSByZXF1aXJlKF9maWxlKS5leGNsdWRlIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHdhbGsoY3dkIHx8ICcuJywgZXhjbHVkZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLmdlbmVyYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgZWxzZSBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZUZvbGRlciA9IHByb2dyYW0uYXJnc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFByb3ZpZGVkIHNvdXJjZSBmb2xkZXIgJHtzb3VyY2VGb2xkZXJ9IHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgcHJvdmlkZWQgc291cmNlIGZvbGRlcicpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzID0gd2FsayhwYXRoLnJlc29sdmUoc291cmNlRm9sZGVyKSwgW10pO1xuXG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcigndHNjb25maWcuanNvbiBmaWxlIHdhcyBub3QgZm91bmQsIHBsZWFzZSB1c2UgLXAgZmxhZycpO1xuICAgICAgICAgICAgICAgIG91dHB1dEhlbHAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJndXRpbCIsInJlcXVpcmUiLCJjIiwiY29sb3JzIiwicGtnIiwiTEVWRUwiLCJuYW1lIiwidmVyc2lvbiIsImxvZ2dlciIsImxvZyIsInNpbGVudCIsImFyZ3MiLCJmb3JtYXQiLCJJTkZPIiwiRVJST1IiLCJERUJVRyIsImxldmVsIiwicGFkIiwicyIsImwiLCJBcnJheSIsIk1hdGgiLCJtYXgiLCJsZW5ndGgiLCJqb2luIiwibXNnIiwic2hpZnQiLCJncmVlbiIsImN5YW4iLCJyZWQiLCJMb2dnZXIiLCJBbmd1bGFyQVBJcyIsInR5cGUiLCJfcmVzdWx0IiwiYW5ndWxhck1vZHVsZUFQSXMiLCJhbmd1bGFyTW9kdWxlIiwiaSIsImxlbiIsInRpdGxlIiwiZGF0YSIsIkRlcGVuZGVuY2llc0VuZ2luZSIsIl9pbnN0YW5jZSIsIkVycm9yIiwicmF3RGF0YSIsIm1vZHVsZXMiLCJfIiwiY29tcG9uZW50cyIsImRpcmVjdGl2ZXMiLCJpbmplY3RhYmxlcyIsImludGVyZmFjZXMiLCJyb3V0ZXMiLCJwaXBlcyIsImNsYXNzZXMiLCJmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzIiwiaW5kZXhPZiIsInJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcyIsInJlc3VsdEluQ29tcG9kb2NDbGFzc2VzIiwicmVzdWx0SW5Bbmd1bGFyQVBJcyIsImZpbmRlckluQW5ndWxhckFQSXMiLCIkZGVwZW5kZW5jaWVzRW5naW5lIiwiZ2V0SW5zdGFuY2UiLCJhIiwib3BlcmF0b3IiLCJiIiwib3B0aW9ucyIsImFyZ3VtZW50cyIsInJlc3VsdCIsImludmVyc2UiLCJmbiIsInRleHQiLCJORzJfTU9EVUxFUyIsIm9wdGlvbmFsVmFsdWUiLCJIYW5kbGViYXJzIiwiZXNjYXBlRXhwcmVzc2lvbiIsInJlcGxhY2UiLCJtZXRob2QiLCJtYXAiLCJhcmciLCJmaW5kIiwic291cmNlIiwicGF0aCIsImpzZG9jVGFncyIsInRhZ05hbWUiLCJjb21tZW50IiwidGFncyIsInRhZyIsInR5cGVFeHByZXNzaW9uIiwicGFyYW1ldGVyTmFtZSIsInB1c2giLCJocmVmIiwidGFyZ2V0IiwiSlNPTiIsInN0cmluZ2lmeSIsInBhcnRpYWxzIiwibG9vcCIsInJlc29sdmUiLCJyZWplY3QiLCJfX2Rpcm5hbWUiLCJlcnIiLCJQcm9taXNlIiwibWFpbkRhdGEiLCJwYWdlIiwibyIsInRoYXQiLCJhc3NpZ24iLCJjYWNoZSIsInRlbXBsYXRlIiwicmVuZGVyZXIiLCJSZW5kZXJlciIsImNvZGUiLCJsYW5ndWFnZSIsInZhbGlkTGFuZyIsImhpZ2hsaWdodGpzIiwiZ2V0TGFuZ3VhZ2UiLCJoaWdobGlnaHRlZCIsImhpZ2hsaWdodCIsInZhbHVlIiwic2V0T3B0aW9ucyIsInByb2Nlc3MiLCJjd2QiLCJtYXJrZWQiLCJmaWxlcGF0aCIsIkNPTVBPRE9DX0RFRkFVTFRTIiwiZm9sZGVyIiwidGhlbWUiLCJwb3J0IiwiYmFzZSIsImRpc2FibGVTb3VyY2VDb2RlIiwiZGlzYWJsZUdyYXBoIiwiZGlzYWJsZUNvdmVyYWdlIiwiQ29uZmlndXJhdGlvbiIsIl9wYWdlcyIsInBhZ2VzIiwiX21haW5EYXRhIiwiYmluUGF0aCIsImdsb2JhbEJpblBhdGgiLCJwbGF0Zm9ybSIsInBhdGhuYW1lcyIsImVudiIsIlBBVEgiLCJzcGxpdCIsImV4ZWNQYXRoIiwic3RyaXBUcmFpbGluZ1NlcCIsInRoZVBhdGgiLCJzbGljZSIsInBhdGhJc0luc2lkZSIsInBvdGVudGlhbFBhcmVudCIsInRvTG93ZXJDYXNlIiwibGFzdEluZGV4T2YiLCJ1bmRlZmluZWQiLCJpc1BhdGhJbnNpZGUiLCJhcmd2Iiwib3V0cHV0cGF0aCIsIm5nZFBhdGgiLCJpc0dsb2JhbCIsIk1PREUiLCJ0ZXN0IiwiZmluYWxQYXRoIiwic3Rkb3V0Iiwic3RkZXJyIiwibHVuciIsImNoZWVyaW8iLCJFbnRpdGllcyIsIkFsbEh0bWxFbnRpdGllcyIsIiRjb25maWd1cmF0aW9uIiwiSHRtbCIsInNlYXJjaEluZGV4IiwicmVmIiwiZmllbGQiLCJib29zdCIsIiQiLCJsb2FkIiwiaHRtbCIsImRlY29kZSIsInVybCIsIm91dHB1dCIsImRvYyIsImluZm9zIiwiY29udGV4dCIsImRvY3VtZW50c1N0b3JlIiwiZ2V0U2VhcmNoSW5kZXgiLCJhZGQiLCJvdXRwdXRGb2xkZXIiLCJlcnJvciIsInRzYW55IiwidHMiLCJub2RlIiwiZ2V0SlNEb2NzIiwiYXBwbHkiLCJzdHIiLCJjb3VudCIsImluZGVudCIsInN0cmlwSW5kZW50IiwibWF0Y2giLCJtaW4iLCJ4IiwicmUiLCJSZWdFeHAiLCJyZXBlYXRpbmciLCJuIiwiVHlwZUVycm9yIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJyZXQiLCJpbmRlbnRTdHJpbmciLCJ0cmFuc3BpbGVPcHRpb25zIiwiaW5wdXRGaWxlTmFtZSIsImZpbGVOYW1lIiwianN4IiwiY29tcGlsZXJIb3N0IiwidHNjb25maWdEaXJlY3RvcnkiLCJsaWJTb3VyY2UiLCJmcyIsInRvU3RyaW5nIiwiZSIsImRlYnVnIiwiUm91dGVyUGFyc2VyIiwibW9kdWxlc1RyZWUiLCJyb290TW9kdWxlIiwibW9kdWxlc1dpdGhSb3V0ZXMiLCJyb3V0ZSIsIm1vZHVsZU5hbWUiLCJtb2R1bGVJbXBvcnRzIiwibW9kdWxlIiwiaW1wb3J0cyIsImltcG9ydHNOb2RlIiwiaW5pdGlhbGl6ZXIiLCJlbGVtZW50cyIsImVsZW1lbnQiLCJhcmd1bWVudCIsImNsZWFuTW9kdWxlc1RyZWUiLCJtb2R1bGVzQ2xlYW5lciIsImFyciIsInBhcmVudCIsImNoaWxkcmVuIiwidXRpbCIsImRlcHRoIiwicm91dGVzVHJlZSIsImZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZSIsImxvb3BNb2R1bGVzUGFyc2VyIiwicGFyc2UiLCJraW5kIiwiY2xlYW5lZFJvdXRlc1RyZWUiLCJjbGVhblJvdXRlc1RyZWUiLCJnZXROZXN0ZWRDaGlsZHJlbiIsIm91dCIsImZpcnN0TG9vcE1vZHVsZSIsImltcG9ydE5vZGUiLCJnZW4iLCJ0bXAiLCJ0b2tlbiIsImdldENoaWxkcmVuIiwiZm9yRWFjaCIsInZpc2l0QW5kUmVjb2duaXplIiwiRmlyc3RMaXRlcmFsVG9rZW4iLCJJZGVudGlmaWVyIiwiU3RyaW5nTGl0ZXJhbCIsIkFycmF5TGl0ZXJhbEV4cHJlc3Npb24iLCJJbXBvcnRLZXl3b3JkIiwiRnJvbUtleXdvcmQiLCJFeHBvcnRLZXl3b3JkIiwiQ2xhc3NLZXl3b3JkIiwiVGhpc0tleXdvcmQiLCJDb25zdHJ1Y3RvcktleXdvcmQiLCJGYWxzZUtleXdvcmQiLCJUcnVlS2V5d29yZCIsIk51bGxLZXl3b3JkIiwiQXRUb2tlbiIsIlBsdXNUb2tlbiIsIkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4iLCJPcGVuUGFyZW5Ub2tlbiIsIkltcG9ydENsYXVzZSIsIk9iamVjdExpdGVyYWxFeHByZXNzaW9uIiwiQmxvY2siLCJDbG9zZUJyYWNlVG9rZW4iLCJDbG9zZVBhcmVuVG9rZW4iLCJPcGVuQnJhY2tldFRva2VuIiwiQ2xvc2VCcmFja2V0VG9rZW4iLCJTZW1pY29sb25Ub2tlbiIsIkNvbW1hVG9rZW4iLCJDb2xvblRva2VuIiwiRG90VG9rZW4iLCJEb1N0YXRlbWVudCIsIkRlY29yYXRvciIsIkZpcnN0QXNzaWdubWVudCIsIkZpcnN0UHVuY3R1YXRpb24iLCJQcml2YXRlS2V5d29yZCIsIlB1YmxpY0tleXdvcmQiLCJmaWxlcyIsIkVTNSIsIkNvbW1vbkpTIiwicHJvZ3JhbSIsIl90IiwiZGVwcyIsInNvdXJjZUZpbGVzIiwiZ2V0U291cmNlRmlsZXMiLCJmaWxlIiwiZmlsZVBhdGgiLCJpbmZvIiwiZ2V0U291cmNlRmlsZURlY29yYXRvcnMiLCJzcmNGaWxlIiwib3V0cHV0U3ltYm9scyIsImNsZWFuZXIiLCJwcm9ncmFtQ29tcG9uZW50Iiwic291cmNlRmlsZSIsImdldFNvdXJjZUZpbGUiLCJ0eXBlQ2hlY2tlckNvbXBvbmVudCIsImdldFR5cGVDaGVja2VyIiwiZGVjb3JhdG9ycyIsInZpc2l0Tm9kZSIsInZpc2l0ZWROb2RlIiwiaW5kZXgiLCJtZXRhZGF0YSIsInBvcCIsImdldFN5bWJvbGVOYW1lIiwicHJvcHMiLCJmaW5kUHJvcHMiLCJJTyIsImdldENvbXBvbmVudElPIiwiaXNNb2R1bGUiLCJnZXRNb2R1bGVQcm92aWRlcnMiLCJnZXRNb2R1bGVEZWNsYXRpb25zIiwiZ2V0TW9kdWxlSW1wb3J0cyIsImdldE1vZHVsZUV4cG9ydHMiLCJnZXRNb2R1bGVCb290c3RyYXAiLCJicmVha0xpbmVzIiwiZGVzY3JpcHRpb24iLCJnZXRUZXh0IiwiaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzIiwiYWRkTW9kdWxlV2l0aFJvdXRlcyIsImdldE1vZHVsZUltcG9ydHNSYXciLCJhZGRNb2R1bGUiLCJpc0NvbXBvbmVudCIsImdldENvbXBvbmVudENoYW5nZURldGVjdGlvbiIsImdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24iLCJnZXRDb21wb25lbnRFeHBvcnRBcyIsImdldENvbXBvbmVudEhvc3QiLCJnZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YSIsImdldENvbXBvbmVudE1vZHVsZUlkIiwiZ2V0Q29tcG9uZW50T3V0cHV0cyIsImdldENvbXBvbmVudFByb3ZpZGVycyIsImdldENvbXBvbmVudFNlbGVjdG9yIiwiZ2V0Q29tcG9uZW50U3R5bGVVcmxzIiwiZ2V0Q29tcG9uZW50U3R5bGVzIiwiZ2V0Q29tcG9uZW50VGVtcGxhdGUiLCJnZXRDb21wb25lbnRUZW1wbGF0ZVVybCIsImdldENvbXBvbmVudFZpZXdQcm92aWRlcnMiLCJpbnB1dHMiLCJvdXRwdXRzIiwicHJvcGVydGllcyIsIm1ldGhvZHMiLCJpc0luamVjdGFibGUiLCJpc1BpcGUiLCJpc0RpcmVjdGl2ZSIsIl9fY2FjaGUiLCJmaWx0ZXJCeURlY29yYXRvcnMiLCJleHByZXNzaW9uIiwiZmlsdGVyIiwic3ltYm9sIiwiZmxhZ3MiLCJDbGFzcyIsIkludGVyZmFjZSIsImdldEludGVyZmFjZUlPIiwiZ2V0Um91dGVJTyIsIm5ld1JvdXRlcyIsIkNsYXNzRGVjbGFyYXRpb24iLCJFeHByZXNzaW9uU3RhdGVtZW50IiwicmVzdWx0Tm9kZSIsImZpbmRFeHByZXNzaW9uQnlOYW1lIiwic2V0Um9vdE1vZHVsZSIsInN5bWJvbHMiLCJkIiwiZW50cnlOb2RlIiwiZ2V0U3ltYm9sRGVwcyIsInByb3ZpZGVyTmFtZSIsInBhcnNlRGVlcEluZGVudGlmaWVyIiwiY29tcG9uZW50IiwiZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lIiwiZ2V0U3ltYm9sRGVwc1JhdyIsImdldFN5bWJvbERlcHNPYmplY3QiLCJkZWNvcmF0b3JUeXBlIiwicHJvcGVydHkiLCJpbkRlY29yYXRvciIsImluQXJncyIsInN0cmluZ2lmeURlZmF1bHRWYWx1ZSIsInZpc2l0VHlwZSIsImdldERvY3VtZW50YXRpb25Db21tZW50IiwidHlwZVRvU3RyaW5nIiwiZ2V0VHlwZUF0TG9jYXRpb24iLCJvdXREZWNvcmF0b3IiLCJvdXRBcmdzIiwibWVtYmVyIiwibW9kaWZpZXJzIiwiaXNQdWJsaWMiLCJzb21lIiwibW9kaWZpZXIiLCJpc0ludGVybmFsTWVtYmVyIiwiaXNQcml2YXRlIiwiaW50ZXJuYWxUYWdzIiwianNEb2MiLCJtZXRob2ROYW1lIiwiQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUyIsInBhcmFtZXRlcnMiLCJfcGFyYW1ldGVycyIsInZpc2l0QXJndW1lbnQiLCJwcm9wIiwianNkb2N0YWdzIiwiX3RzIiwibG9jYWxlQ29tcGFyZSIsIm1lbWJlcnMiLCJpbnB1dERlY29yYXRvciIsImdldERlY29yYXRvck9mVHlwZSIsInZpc2l0SW5wdXQiLCJ2aXNpdE91dHB1dCIsImlzUHJpdmF0ZU9ySW50ZXJuYWwiLCJNZXRob2REZWNsYXJhdGlvbiIsIk1ldGhvZFNpZ25hdHVyZSIsImlzQW5ndWxhckxpZmVjeWNsZUhvb2siLCJ2aXNpdE1ldGhvZERlY2xhcmF0aW9uIiwiUHJvcGVydHlEZWNsYXJhdGlvbiIsIlByb3BlcnR5U2lnbmF0dXJlIiwiR2V0QWNjZXNzb3IiLCJ2aXNpdFByb3BlcnR5IiwiQ2FsbFNpZ25hdHVyZSIsInZpc2l0Q2FsbERlY2xhcmF0aW9uIiwiSW5kZXhTaWduYXR1cmUiLCJ2aXNpdEluZGV4RGVjbGFyYXRpb24iLCJDb25zdHJ1Y3RvciIsIl9jb25zdHJ1Y3RvclByb3BlcnRpZXMiLCJ2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24iLCJqIiwic29ydCIsImdldE5hbWVzQ29tcGFyZUZuIiwiZGVjb3JhdG9yIiwic2VsZWN0b3IiLCJleHBvcnRBcyIsImRlY29yYXRvcklkZW50aWZpZXJUZXh0IiwiY2xhc3NEZWNsYXJhdGlvbiIsImdldFN5bWJvbEF0TG9jYXRpb24iLCJjbGFzc05hbWUiLCJkaXJlY3RpdmVJbmZvIiwiaXNEaXJlY3RpdmVEZWNvcmF0b3IiLCJ2aXNpdERpcmVjdGl2ZURlY29yYXRvciIsInZpc2l0TWVtYmVycyIsImlzU2VydmljZURlY29yYXRvciIsImlzUGlwZURlY29yYXRvciIsImlzTW9kdWxlRGVjb3JhdG9yIiwiZGVjbGFyYXRpb25MaXN0IiwiZGVjbGFyYXRpb25zIiwidHlwZU5hbWUiLCJhZGRSb3V0ZSIsImdlbmVyYXRlIiwiZmlsZW5hbWUiLCJyZXMiLCJzdGF0ZW1lbnRzIiwicmVkdWNlIiwiZGlyZWN0aXZlIiwic3RhdGVtZW50IiwiVmFyaWFibGVTdGF0ZW1lbnQiLCJjb25jYXQiLCJ2aXNpdEVudW1EZWNsYXJhdGlvbiIsInZpc2l0Q2xhc3NEZWNsYXJhdGlvbiIsIkludGVyZmFjZURlY2xhcmF0aW9uIiwicG9zIiwiZW5kIiwiaWRlbnRpZmllciIsImxhYmVsIiwibnNNb2R1bGUiLCJnZXRUeXBlIiwiX19uc01vZHVsZSIsInNhbml0aXplVXJscyIsInQiLCJkZXRlY3RJbmRlbnQiLCJ1cmxzIiwibXVsdGlMaW5lIiwicGFyc2VQcm9wZXJ0aWVzIiwib2JqIiwicGFyc2VTeW1ib2xUZXh0IiwiYnVpbGRJZGVudGlmaWVyTmFtZSIsIm5vZGVOYW1lIiwidW5rbm93biIsImVsIiwiU3ByZWFkRWxlbWVudEV4cHJlc3Npb24iLCJwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbiIsIl9nZW5Qcm92aWRlck5hbWUiLCJfcHJvdmlkZXJQcm9wcyIsImJvZHkiLCJwYXJhbXMiLCJwYXJzZVN5bWJvbEVsZW1lbnRzIiwiZnVuY3Rpb25BcmdzIiwicGFyc2VTeW1ib2xzIiwiZ2xvYiIsIiRodG1sZW5naW5lIiwiSHRtbEVuZ2luZSIsIiRmaWxlZW5naW5lIiwiRmlsZUVuZ2luZSIsIiRtYXJrZG93bmVuZ2luZSIsIk1hcmtkb3duRW5naW5lIiwiJG5nZGVuZ2luZSIsIk5nZEVuZ2luZSIsIiRzZWFyY2hFbmdpbmUiLCJTZWFyY2hFbmdpbmUiLCJzdGFydFRpbWUiLCJEYXRlIiwiY29uZmlndXJhdGlvbiIsImdldFBpcGVzIiwiYWRkUGFnZSIsImdldENsYXNzZXMiLCJnZXREaXJlY3RpdmVzIiwib3B0aW9uIiwiaW5pdCIsInRoZW4iLCJwcm9jZXNzUGFja2FnZUpzb24iLCJnZXQiLCJwYWNrYWdlRGF0YSIsInBhcnNlZERhdGEiLCJkb2N1bWVudGF0aW9uTWFpbk5hbWUiLCJkb2N1bWVudGF0aW9uTWFpbkRlc2NyaXB0aW9uIiwicHJvY2Vzc01hcmtkb3duIiwiZXJyb3JNZXNzYWdlIiwiZ2V0UmVhZG1lRmlsZSIsInJlYWRtZURhdGEiLCJyZWFkbWUiLCJnZXREZXBlbmRlbmNpZXNEYXRhIiwiY3Jhd2xlciIsIkRlcGVuZGVuY2llcyIsInRzY29uZmlnIiwiZGVwZW5kZW5jaWVzRGF0YSIsImdldERlcGVuZGVuY2llcyIsInByZXBhcmVNb2R1bGVzIiwicHJlcGFyZUNvbXBvbmVudHMiLCJwcmVwYXJlRGlyZWN0aXZlcyIsInByZXBhcmVJbmplY3RhYmxlcyIsInByZXBhcmVSb3V0ZXMiLCJwcmVwYXJlUGlwZXMiLCJwcmVwYXJlQ2xhc3NlcyIsInByZXBhcmVJbnRlcmZhY2VzIiwicHJlcGFyZUNvdmVyYWdlIiwicHJvY2Vzc1BhZ2VzIiwiZ2V0TW9kdWxlcyIsIm1ldGFkYXRhVHlwZSIsIm5nTW9kdWxlIiwibWV0YURhdGFJdGVtIiwiZ2V0Q29tcG9uZW50cyIsInBpcGUiLCJwcm92aWRlcnMiLCJnZXRJbmplY3RhYmxlcyIsImluamVjdGFibGUiLCJwcm92aWRlciIsImdldEludGVyZmFjZXMiLCJkaXJuYW1lIiwicmVhZG1lRmlsZSIsImdldFJvdXRlcyIsInRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQiLCJnZXRTdGF0dXMiLCJwZXJjZW50Iiwic3RhdHVzIiwiY2wiLCJ0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQiLCJ0b3RhbFN0YXRlbWVudHMiLCJwcm9wZXJ0aWVzQ2xhc3MiLCJtZXRob2RzQ2xhc3MiLCJpbnB1dHNDbGFzcyIsIm91dHB1dHNDbGFzcyIsImlucHV0IiwiY292ZXJhZ2VQZXJjZW50IiwiZmxvb3IiLCJjb3ZlcmFnZUNvdW50IiwiY2xhc3NlIiwiaW50ZXIiLCJjb3ZlcmFnZURhdGEiLCJyZW5kZXIiLCJodG1sRGF0YSIsImluZGV4UGFnZSIsImdlbmVyYXRlU2VhcmNoSW5kZXhKc29uIiwiYXNzZXRzRm9sZGVyIiwicHJvY2Vzc0Fzc2V0c0ZvbGRlciIsInByb2Nlc3NSZXNvdXJjZXMiLCJleHRUaGVtZSIsInByb2Nlc3NHcmFwaHMiLCJvbkNvbXBsZXRlIiwiZmluYWxUaW1lIiwic2VydmUiLCJydW5XZWJTZXJ2ZXIiLCJyZW5kZXJHcmFwaCIsImZpbmFsTWFpbkdyYXBoUGF0aCIsIm9wZW4iLCJ1c2FnZSIsIm91dHB1dEhlbHAiLCJleGl0IiwiaW5jbHVkZXMiLCJpbmNsdWRlc05hbWUiLCJoaWRlR2VuZXJhdG9yIiwiZGVmYXVsdFdhbGtGT2xkZXIiLCJ3YWxrIiwiZGlyIiwiZXhjbHVkZSIsInJlc3VsdHMiLCJsaXN0Iiwic3RhdCIsImlzRGlyZWN0b3J5IiwiX2ZpbGUiLCJzb3VyY2VGb2xkZXIiLCJBcHBsaWNhdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
