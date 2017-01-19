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
            return null;
        }
    }, {
        key: 'visitInput',
        value: function visitInput(property, inDecorator) {
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
        }
    }, {
        key: 'visitType',
        value: function visitType(node) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            return node ? this.typeCheckerComponent.typeToString(this.typeCheckerComponent.getTypeAtLocation(node)) : 'void';
        }
    }, {
        key: 'visitOutput',
        value: function visitOutput(property, outDecorator) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var outArgs = outDecorator.expression.arguments;
            return {
                name: outArgs.length ? outArgs[0].text : property.name.text,
                description: marked__default(ts.displayPartsToString(property.symbol.getDocumentationComment())),
                type: this.visitType(property.type.typeArguments[0])
            };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiLCIuLi9zcmMvdXRpbHMvYW5ndWxhci1hcGkudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZGVwZW5kZW5jaWVzLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9tYXJrZG93bi5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZmlsZS5lbmdpbmUudHMiLCIuLi9zcmMvdXRpbHMvZGVmYXVsdHMudHMiLCIuLi9zcmMvYXBwL2NvbmZpZ3VyYXRpb24udHMiLCIuLi9zcmMvdXRpbHMvZ2xvYmFsLnBhdGgudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbmdkLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9zZWFyY2guZW5naW5lLnRzIiwiLi4vc3JjL3V0aWxzL3RzLWludGVybmFsLnRzIiwiLi4vc3JjL3V0aWxpdGllcy50cyIsIi4uL3NyYy91dGlscy9yb3V0ZXIucGFyc2VyLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9jb2RlZ2VuLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9kZXBlbmRlbmNpZXMudHMiLCIuLi9zcmMvYXBwL2FwcGxpY2F0aW9uLnRzIiwiLi4vc3JjL2luZGV4LWNsaS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgZ3V0aWwgPSByZXF1aXJlKCdndWxwLXV0aWwnKVxubGV0IGMgPSBndXRpbC5jb2xvcnM7XG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG5cbmVudW0gTEVWRUwge1xuXHRJTkZPLFxuXHRERUJVRyxcbiAgICBFUlJPUlxufVxuXG5jbGFzcyBMb2dnZXIge1xuXG5cdG5hbWU7XG5cdGxvZ2dlcjtcblx0dmVyc2lvbjtcblx0c2lsZW50O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubmFtZSA9IHBrZy5uYW1lO1xuXHRcdHRoaXMudmVyc2lvbiA9IHBrZy52ZXJzaW9uO1xuXHRcdHRoaXMubG9nZ2VyID0gZ3V0aWwubG9nO1xuXHRcdHRoaXMuc2lsZW50ID0gdHJ1ZTtcblx0fVxuXG5cdGluZm8oLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuSU5GTywgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0ZXJyb3IoLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuRVJST1IsIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdGRlYnVnKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkRFQlVHLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIGZvcm1hdChsZXZlbCwgLi4uYXJncykge1xuXG5cdFx0bGV0IHBhZCA9IChzLCBsLCBjPScnKSA9PiB7XG5cdFx0XHRyZXR1cm4gcyArIEFycmF5KCBNYXRoLm1heCgwLCBsIC0gcy5sZW5ndGggKyAxKSkuam9pbiggYyApXG5cdFx0fTtcblxuXHRcdGxldCBtc2cgPSBhcmdzLmpvaW4oJyAnKTtcblx0XHRpZihhcmdzLmxlbmd0aCA+IDEpIHtcblx0XHRcdG1zZyA9IGAkeyBwYWQoYXJncy5zaGlmdCgpLCAxNSwgJyAnKSB9OiAkeyBhcmdzLmpvaW4oJyAnKSB9YDtcblx0XHR9XG5cblxuXHRcdHN3aXRjaChsZXZlbCkge1xuXHRcdFx0Y2FzZSBMRVZFTC5JTkZPOlxuXHRcdFx0XHRtc2cgPSBjLmdyZWVuKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExFVkVMLkRFQlVHOlxuXHRcdFx0XHRtc2cgPSBjLmN5YW4obXNnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTEVWRUwuRVJST1I6XG5cdFx0XHRcdG1zZyA9IGMucmVkKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBbXG5cdFx0XHRtc2dcblx0XHRdLmpvaW4oJycpO1xuXHR9XG59XG5cbmV4cG9ydCBsZXQgbG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5sZXQgQW5ndWxhckFQSXMgPSByZXF1aXJlKCcuLi9zcmMvZGF0YS9hcGktbGlzdC5qc29uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kZXJJbkFuZ3VsYXJBUElzKHR5cGU6IHN0cmluZykge1xuICAgIGxldCBfcmVzdWx0ID0ge1xuICAgICAgICBzb3VyY2U6ICdleHRlcm5hbCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICB9O1xuXG4gICAgXy5mb3JFYWNoKEFuZ3VsYXJBUElzLCBmdW5jdGlvbihhbmd1bGFyTW9kdWxlQVBJcywgYW5ndWxhck1vZHVsZSkge1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBhbmd1bGFyTW9kdWxlQVBJcy5sZW5ndGg7XG4gICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXJNb2R1bGVBUElzW2ldLnRpdGxlID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gYW5ndWxhck1vZHVsZUFQSXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIF9yZXN1bHQ7XG59XG4iLCJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7IGZpbmRlckluQW5ndWxhckFQSXMgfSBmcm9tICcuLi8uLi91dGlscy9hbmd1bGFyLWFwaSc7XG5cbmNsYXNzIERlcGVuZGVuY2llc0VuZ2luZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOkRlcGVuZGVuY2llc0VuZ2luZSA9IG5ldyBEZXBlbmRlbmNpZXNFbmdpbmUoKTtcbiAgICByYXdEYXRhOiBPYmplY3Q7XG4gICAgbW9kdWxlczogT2JqZWN0W107XG4gICAgY29tcG9uZW50czogT2JqZWN0W107XG4gICAgZGlyZWN0aXZlczogT2JqZWN0W107XG4gICAgaW5qZWN0YWJsZXM6IE9iamVjdFtdO1xuICAgIGludGVyZmFjZXM6IE9iamVjdFtdO1xuICAgIHJvdXRlczogT2JqZWN0W107XG4gICAgcGlwZXM6IE9iamVjdFtdO1xuICAgIGNsYXNzZXM6IE9iamVjdFtdO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZihEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgRGVwZW5kZW5jaWVzRW5naW5lLmdldEluc3RhbmNlKCkgaW5zdGVhZCBvZiBuZXcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTpEZXBlbmRlbmNpZXNFbmdpbmVcbiAgICB7XG4gICAgICAgIHJldHVybiBEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlO1xuICAgIH1cbiAgICBpbml0KGRhdGE6IE9iamVjdCkge1xuICAgICAgICB0aGlzLnJhd0RhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLm1vZHVsZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEubW9kdWxlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuY29tcG9uZW50cywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuZGlyZWN0aXZlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmluamVjdGFibGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmluamVjdGFibGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbnRlcmZhY2VzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucm91dGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aCh0aGlzLnJhd0RhdGEucm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucGlwZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEucGlwZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jbGFzc2VzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNsYXNzZXMsIFsnbmFtZSddKTtcbiAgICB9XG4gICAgZmluZCh0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnaW50ZXJuYWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlLmluZGV4T2YoZGF0YVtpXS5uYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gZGF0YVtpXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmluamVjdGFibGVzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmNsYXNzZXMpLFxuICAgICAgICAgICAgcmVzdWx0SW5Bbmd1bGFyQVBJcyA9IGZpbmRlckluQW5ndWxhckFQSXModHlwZSlcblxuICAgICAgICBpZiAocmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXNcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkNvbXBvZG9jQ2xhc3Nlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0NsYXNzZXNcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkFuZ3VsYXJBUElzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkFuZ3VsYXJBUElzXG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0TW9kdWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlcztcbiAgICB9XG4gICAgZ2V0Q29tcG9uZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cztcbiAgICB9XG4gICAgZ2V0RGlyZWN0aXZlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aXZlcztcbiAgICB9XG4gICAgZ2V0SW5qZWN0YWJsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluamVjdGFibGVzO1xuICAgIH1cbiAgICBnZXRJbnRlcmZhY2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2VzO1xuICAgIH1cbiAgICBnZXRSb3V0ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvdXRlcztcbiAgICB9XG4gICAgZ2V0UGlwZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpcGVzO1xuICAgIH1cbiAgICBnZXRDbGFzc2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jbGFzc2VzO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCAkZGVwZW5kZW5jaWVzRW5naW5lID0gRGVwZW5kZW5jaWVzRW5naW5lLmdldEluc3RhbmNlKCk7XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcbi8vaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICdoYW5kbGViYXJzLWhlbHBlcnMnO1xuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5cbmV4cG9ydCBjbGFzcyBIdG1sRW5naW5lIHtcbiAgICBjYWNoZTogT2JqZWN0ID0ge307XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vVE9ETyB1c2UgdGhpcyBpbnN0ZWFkIDogaHR0cHM6Ly9naXRodWIuY29tL2Fzc2VtYmxlL2hhbmRsZWJhcnMtaGVscGVyc1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCBcImNvbXBhcmVcIiwgZnVuY3Rpb24oYSwgb3BlcmF0b3IsIGIsIG9wdGlvbnMpIHtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaGFuZGxlYmFycyBIZWxwZXIge3tjb21wYXJlfX0gZXhwZWN0cyA0IGFyZ3VtZW50cycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgICAgICAgY2FzZSAnaW5kZXhvZic6XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gKGIuaW5kZXhPZihhKSAhPT0gLTEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSA9PT0gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgICByZXN1bHQgPSBhICE9PSBiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICByZXN1bHQgPSBhID4gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaGVscGVyIHt7Y29tcGFyZX19OiBpbnZhbGlkIG9wZXJhdG9yOiBgJyArIG9wZXJhdG9yICsgJ2AnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKFwiZmlsdGVyQW5ndWxhcjJNb2R1bGVzXCIsIGZ1bmN0aW9uKHRleHQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IE5HMl9NT0RVTEVTOnN0cmluZ1tdID0gW1xuICAgICAgICAgICAgICAgICdCcm93c2VyTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnRm9ybXNNb2R1bGUnLFxuICAgICAgICAgICAgICAgICdIdHRwTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnUm91dGVyTW9kdWxlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBsZW4gPSBORzJfTU9EVUxFUy5sZW5ndGg7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoTkcyX01PRFVMRVNbaV0pID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKFwiZGVidWdcIiwgZnVuY3Rpb24ob3B0aW9uYWxWYWx1ZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ3VycmVudCBDb250ZXh0XCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG5cbiAgICAgICAgICBpZiAob3B0aW9uYWxWYWx1ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPcHRpb25hbFZhbHVlXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCI9PT09PT09PT09PT09PT09PT09PVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9wdGlvbmFsVmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2JyZWFrbGluZXMnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAvZ20sICcmbmJzcDsnKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1x0L2dtLCAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2JyZWFrQ29tbWEnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvLC9nLCAnLDxicj4nKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZnVuY3Rpb25TaWduYXR1cmUnLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBtZXRob2QuYXJncy5tYXAoZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9yZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmQoYXJnLnR5cGUpO1xuICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBfcmVzdWx0LmRhdGEudHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgcGF0aCA9ICdjbGFzc2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogPGEgaHJlZj1cIi4vJHtwYXRofXMvJHtfcmVzdWx0LmRhdGEubmFtZX0uaHRtbFwiID4ke2FyZy50eXBlfTwvYT5gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSAnaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS8nICsgX3Jlc3VsdC5kYXRhLnBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJnLm5hbWV9OiA8YSBocmVmPVwiJHtwYXRofVwiIHRhcmdldD1cIl9ibGFua1wiID4ke2FyZy50eXBlfTwvYT5gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogJHthcmcudHlwZX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmpvaW4oJywgJyk7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9KCR7YXJnc30pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoJHthcmdzfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignanNkb2MtcmV0dXJucy1jb21tZW50JywgZnVuY3Rpb24oanNkb2NUYWdzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3JldHVybnMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBqc2RvY1RhZ3NbaV0uY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXBhcmFtcycsIGZ1bmN0aW9uKGpzZG9jVGFncywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgdGFncyA9IFtdO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdwYXJhbScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24gJiYganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy50eXBlID0ganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuY29tbWVudCA9IGpzZG9jVGFnc1tpXS5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnBhcmFtZXRlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcubmFtZSA9IGpzZG9jVGFnc1tpXS5wYXJhbWV0ZXJOYW1lLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MucHVzaCh0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbGlua1R5cGUnLCBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgX3Jlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZChuYW1lKTtcbiAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlID0ge1xuICAgICAgICAgICAgICAgICAgICByYXc6IG5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9yZXN1bHQuc291cmNlID09PSAnaW50ZXJuYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgX3Jlc3VsdC5kYXRhLnR5cGUgPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSAnLi8nICsgX3Jlc3VsdC5kYXRhLnR5cGUgKyAncy8nICsgX3Jlc3VsdC5kYXRhLm5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUudGFyZ2V0ID0gJ19zZWxmJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUuaHJlZiA9ICdodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpLycgKyBfcmVzdWx0LmRhdGEucGF0aDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfYmxhbmsnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaW5kZXhhYmxlU2lnbmF0dXJlJywgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGFyZyA9PiBgJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YCkuam9pbignLCAnKTtcbiAgICAgICAgICAgIGlmIChtZXRob2QubmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHttZXRob2QubmFtZX1bJHthcmdzfV1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYFske2FyZ3N9XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdvYmplY3QnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkodGV4dCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC97XCIvLCAnezxicj4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIicpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvLFwiLywgJyw8YnI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCInKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL30kLywgJzxicj59Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluaXQoKSB7XG4gICAgICAgIGxldCBwYXJ0aWFscyA9IFtcbiAgICAgICAgICAgICdtZW51JyxcbiAgICAgICAgICAgICdvdmVydmlldycsXG4gICAgICAgICAgICAncmVhZG1lJyxcbiAgICAgICAgICAgICdtb2R1bGVzJyxcbiAgICAgICAgICAgICdtb2R1bGUnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAnY29tcG9uZW50LWRldGFpbCcsXG4gICAgICAgICAgICAnZGlyZWN0aXZlcycsXG4gICAgICAgICAgICAnZGlyZWN0aXZlJyxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAncGlwZXMnLFxuICAgICAgICAgICAgJ3BpcGUnLFxuICAgICAgICAgICAgJ2NsYXNzZXMnLFxuICAgICAgICAgICAgJ2NsYXNzJyxcblx0ICAgICAgICAnaW50ZXJmYWNlJyxcbiAgICAgICAgICAgICdyb3V0ZXMnLFxuICAgICAgICAgICAgJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICdzZWFyY2gtaW5wdXQnLFxuICAgICAgICAgICAgJ2xpbmstdHlwZScsXG4gICAgICAgICAgICAnYmxvY2stbWV0aG9kJyxcbiAgICAgICAgICAgICdibG9jay1wcm9wZXJ0eScsXG4gICAgICAgICAgICAnY292ZXJhZ2UtcmVwb3J0J1xuICAgICAgICBdLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBwYXJ0aWFscy5sZW5ndGgsXG4gICAgICAgICAgICBsb29wID0gKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvJyArIHBhcnRpYWxzW2ldICsgJy5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7IHJlamVjdCgpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbChwYXJ0aWFsc1tpXSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBsb29wKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXIobWFpbkRhdGE6YW55LCBwYWdlOmFueSkge1xuICAgICAgICB2YXIgbyA9IG1haW5EYXRhLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obywgcGFnZSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmKHRoYXQuY2FjaGVbJ3BhZ2UnXSkge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUodGhhdC5jYWNoZVsncGFnZSddKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFnZS5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBpbmRleCAnICsgcGFnZS5uYW1lICsgJyBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jYWNoZVsncGFnZSddID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlOmFueSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1hcmtlZCwgeyBSZW5kZXJlciB9IGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgaGlnaGxpZ2h0anMgZnJvbSAnaGlnaGxpZ2h0LmpzJztcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIoKTtcbiAgICAgICAgcmVuZGVyZXIuY29kZSA9IChjb2RlLCBsYW5ndWFnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsaWRMYW5nID0gISEobGFuZ3VhZ2UgJiYgaGlnaGxpZ2h0anMuZ2V0TGFuZ3VhZ2UobGFuZ3VhZ2UpKTtcbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRlZCA9IHZhbGlkTGFuZyA/IGhpZ2hsaWdodGpzLmhpZ2hsaWdodChsYW5ndWFnZSwgY29kZSkudmFsdWUgOiBjb2RlO1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRlZC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpL2dtLCAnPGJyPicpO1xuICAgICAgICAgICAgcmV0dXJuIGA8cHJlPjxjb2RlIGNsYXNzPVwiaGxqcyAke2xhbmd1YWdlfVwiPiR7aGlnaGxpZ2h0ZWR9PC9jb2RlPjwvcHJlPmA7XG4gICAgICAgIH07XG5cbiAgICAgICAgbWFya2VkLnNldE9wdGlvbnMoeyByZW5kZXJlciB9KTtcbiAgICB9XG4gICAgZ2V0UmVhZG1lRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyAnL1JFQURNRS5tZCcpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIFJFQURNRS5tZCBmaWxlIHJlYWRpbmcnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hcmtlZChkYXRhKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcblxuZXhwb3J0IGNsYXNzIEZpbGVFbmdpbmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuICAgIGdldChmaWxlcGF0aDpTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZXBhdGgpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyAnICsgZmlsZXBhdGggKyAnIHJlYWQnKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJleHBvcnQgY29uc3QgQ09NUE9ET0NfREVGQVVMVFMgPSB7XG4gICAgdGl0bGU6ICdBcHBsaWNhdGlvbiBkb2N1bWVudGF0aW9uJyxcbiAgICBhZGRpdGlvbmFsRW50cnlOYW1lOiAnQWRkaXRpb25hbCBkb2N1bWVudGF0aW9uJyxcbiAgICBhZGRpdGlvbmFsRW50cnlQYXRoOiAnYWRkaXRpb25hbC1kb2N1bWVudGF0aW9uJyxcbiAgICBmb2xkZXI6ICcuL2RvY3VtZW50YXRpb24vJyxcbiAgICBwb3J0OiA4MDgwLFxuICAgIHRoZW1lOiAnZ2l0Ym9vaycsXG4gICAgYmFzZTogJy8nLFxuICAgIGRpc2FibGVTb3VyY2VDb2RlOiBmYWxzZSxcbiAgICBkaXNhYmxlR3JhcGg6IGZhbHNlLFxuICAgIGRpc2FibGVDb3ZlcmFnZTogZmFsc2Vcbn1cbiIsImltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vdXRpbHMvZGVmYXVsdHMnO1xuXG5pbnRlcmZhY2UgUGFnZSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGNvbnRleHQ6IHN0cmluZztcbiAgICBwYXRoPzogc3RyaW5nO1xuICAgIG1vZHVsZT86IGFueTtcbiAgICBwaXBlPzogYW55O1xuICAgIGNsYXNzPzogYW55O1xuICAgIGludGVyZmFjZT86IGFueTtcbiAgICBkaXJlY3RpdmU/OiBhbnk7XG4gICAgaW5qZWN0YWJsZT86IGFueTtcbiAgICBmaWxlcz86IGFueTtcbiAgICBkYXRhPzogYW55O1xufVxuXG5pbnRlcmZhY2UgSU1haW5EYXRhIHtcbiAgICBvdXRwdXQ6IHN0cmluZztcbiAgICB0aGVtZTogc3RyaW5nO1xuICAgIGV4dFRoZW1lOiBzdHJpbmc7XG4gICAgc2VydmU6IGJvb2xlYW47XG4gICAgcG9ydDogbnVtYmVyO1xuICAgIG9wZW46IGJvb2xlYW47XG4gICAgYXNzZXRzRm9sZGVyOiBzdHJpbmc7XG4gICAgZG9jdW1lbnRhdGlvbk1haW5OYW1lOiBzdHJpbmc7XG4gICAgZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGJhc2U6IHN0cmluZztcbiAgICBoaWRlR2VuZXJhdG9yOiBib29sZWFuO1xuICAgIG1vZHVsZXM6IGFueTtcbiAgICByZWFkbWU6IHN0cmluZztcbiAgICBhZGRpdGlvbmFscGFnZXM6IE9iamVjdDtcbiAgICBwaXBlczogYW55O1xuICAgIGNsYXNzZXM6IGFueTtcbiAgICBpbnRlcmZhY2VzOiBhbnk7XG4gICAgY29tcG9uZW50czogYW55O1xuICAgIGRpcmVjdGl2ZXM6IGFueTtcbiAgICBpbmplY3RhYmxlczogYW55O1xuICAgIHJvdXRlczogYW55O1xuICAgIHRzY29uZmlnOiBzdHJpbmc7XG4gICAgaW5jbHVkZXM6IGJvb2xlYW47XG4gICAgaW5jbHVkZXNOYW1lOiBzdHJpbmc7XG4gICAgZGlzYWJsZVNvdXJjZUNvZGU6IGJvb2xlYW47XG4gICAgZGlzYWJsZUdyYXBoOiBib29sZWFuO1xuICAgIGRpc2FibGVDb3ZlcmFnZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29uZmlndXJhdGlvbiB7XG4gICAgbWFpbkRhdGE6IElNYWluRGF0YTtcbiAgICBwYWdlczpBcnJheTxQYWdlPjtcbiAgICBhZGRQYWdlKHBhZ2U6IFBhZ2UpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ29uZmlndXJhdGlvbiBpbXBsZW1lbnRzIElDb25maWd1cmF0aW9uIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6Q29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKCk7XG5cbiAgICBwcml2YXRlIF9wYWdlczpBcnJheTxQYWdlPiA9IFtdO1xuICAgIHByaXZhdGUgX21haW5EYXRhOiBJTWFpbkRhdGEgPSB7XG4gICAgICAgIG91dHB1dDogQ09NUE9ET0NfREVGQVVMVFMuZm9sZGVyLFxuICAgICAgICB0aGVtZTogQ09NUE9ET0NfREVGQVVMVFMudGhlbWUsXG4gICAgICAgIGV4dFRoZW1lOiAnJyxcbiAgICAgICAgc2VydmU6IGZhbHNlLFxuICAgICAgICBwb3J0OiBDT01QT0RPQ19ERUZBVUxUUy5wb3J0LFxuICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgYXNzZXRzRm9sZGVyOiAnJyxcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5OYW1lOiBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbjogJycsXG4gICAgICAgIGJhc2U6IENPTVBPRE9DX0RFRkFVTFRTLmJhc2UsXG4gICAgICAgIGhpZGVHZW5lcmF0b3I6IGZhbHNlLFxuICAgICAgICBtb2R1bGVzOiBbXSxcbiAgICAgICAgcmVhZG1lOiAnJyxcbiAgICAgICAgYWRkaXRpb25hbHBhZ2VzOiB7fSxcbiAgICAgICAgcGlwZXM6IFtdLFxuICAgICAgICBjbGFzc2VzOiBbXSxcbiAgICAgICAgaW50ZXJmYWNlczogW10sXG4gICAgICAgIGNvbXBvbmVudHM6IFtdLFxuICAgICAgICBkaXJlY3RpdmVzOiBbXSxcbiAgICAgICAgaW5qZWN0YWJsZXM6IFtdLFxuICAgICAgICByb3V0ZXM6IFtdLFxuICAgICAgICB0c2NvbmZpZzogJycsXG4gICAgICAgIGluY2x1ZGVzOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZVNvdXJjZUNvZGU6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVTb3VyY2VDb2RlLFxuICAgICAgICBkaXNhYmxlR3JhcGg6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVHcmFwaCxcbiAgICAgICAgZGlzYWJsZUNvdmVyYWdlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlQ292ZXJhZ2VcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmKENvbmZpZ3VyYXRpb24uX2luc3RhbmNlKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIENvbmZpZ3VyYXRpb24uX2luc3RhbmNlID0gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6Q29uZmlndXJhdGlvblxuICAgIHtcbiAgICAgICAgcmV0dXJuIENvbmZpZ3VyYXRpb24uX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGFkZFBhZ2UocGFnZTogUGFnZSkge1xuICAgICAgICB0aGlzLl9wYWdlcy5wdXNoKHBhZ2UpO1xuICAgIH1cblxuICAgIGdldCBwYWdlcygpOkFycmF5PFBhZ2U+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZ2VzO1xuICAgIH1cbiAgICBzZXQgcGFnZXMocGFnZXM6QXJyYXk8UGFnZT4pIHtcbiAgICAgICAgdGhpcy5fcGFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXQgbWFpbkRhdGEoKTpJTWFpbkRhdGEge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFpbkRhdGE7XG4gICAgfVxuICAgIHNldCBtYWluRGF0YShkYXRhOklNYWluRGF0YSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuX21haW5EYXRhLCBkYXRhKTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzR2xvYmFsKCkge1xuICAgIHZhciBiaW5QYXRoLFxuICAgICAgICBnbG9iYWxCaW5QYXRoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoYmluUGF0aCkgcmV0dXJuIGJpblBhdGhcblxuICAgICAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGF0aG5hbWVzID0gcHJvY2Vzcy5lbnYuUEFUSC5zcGxpdChwYXRoLmRlbGltaXRlcilcbiAgICAgICAgICAgICAgICB2YXIgbGVuID0gcGF0aG5hbWVzLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aC5iYXNlbmFtZShwYXRobmFtZXNbaV0pID09PSAnbnBtJyB8fCBwYXRoLmJhc2VuYW1lKHBhdGhuYW1lc1tpXSkgPT09ICdub2RlanMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5QYXRoID0gcGF0aG5hbWVzW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiaW5QYXRoID0gcGF0aC5kaXJuYW1lKHByb2Nlc3MuZXhlY1BhdGgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBiaW5QYXRoXG4gICAgICAgIH0sXG4gICAgICAgIHN0cmlwVHJhaWxpbmdTZXAgPSBmdW5jdGlvbih0aGVQYXRoKSB7XG4gICAgICAgICAgICBpZiAodGhlUGF0aFt0aGVQYXRoLmxlbmd0aCAtIDFdID09PSBwYXRoLnNlcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGVQYXRoLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGVQYXRoO1xuICAgICAgICB9LFxuICAgICAgICBwYXRoSXNJbnNpZGUgPSBmdW5jdGlvbih0aGVQYXRoLCBwb3RlbnRpYWxQYXJlbnQpIHtcbiAgICAgICAgICAgIC8vIEZvciBpbnNpZGUtZGlyZWN0b3J5IGNoZWNraW5nLCB3ZSB3YW50IHRvIGFsbG93IHRyYWlsaW5nIHNsYXNoZXMsIHNvIG5vcm1hbGl6ZS5cbiAgICAgICAgICAgIHRoZVBhdGggPSBzdHJpcFRyYWlsaW5nU2VwKHRoZVBhdGgpO1xuICAgICAgICAgICAgcG90ZW50aWFsUGFyZW50ID0gc3RyaXBUcmFpbGluZ1NlcChwb3RlbnRpYWxQYXJlbnQpO1xuXG4gICAgICAgICAgICAvLyBOb2RlIHRyZWF0cyBvbmx5IFdpbmRvd3MgYXMgY2FzZS1pbnNlbnNpdGl2ZSBpbiBpdHMgcGF0aCBtb2R1bGU7IHdlIGZvbGxvdyB0aG9zZSBjb252ZW50aW9ucy5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcbiAgICAgICAgICAgICAgICB0aGVQYXRoID0gdGhlUGF0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHBvdGVudGlhbFBhcmVudCA9IHBvdGVudGlhbFBhcmVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhlUGF0aC5sYXN0SW5kZXhPZihwb3RlbnRpYWxQYXJlbnQsIDApID09PSAwICYmXG4gICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICB0aGVQYXRoW3BvdGVudGlhbFBhcmVudC5sZW5ndGhdID09PSBwYXRoLnNlcCB8fFxuICAgICAgICAgICAgICAgICAgICB0aGVQYXRoW3BvdGVudGlhbFBhcmVudC5sZW5ndGhdID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICBpc1BhdGhJbnNpZGUgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICBhID0gcGF0aC5yZXNvbHZlKGEpO1xuICAgICAgICAgICAgYiA9IHBhdGgucmVzb2x2ZShiKTtcblxuICAgICAgICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXRoSXNJbnNpZGUoYSwgYik7XG4gICAgICAgIH1cbiAgICByZXR1cm4gaXNQYXRoSW5zaWRlKHByb2Nlc3MuYXJndlsxXSB8fCAnJywgZ2xvYmFsQmluUGF0aCgpIHx8ICcnKVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQgaXNHbG9iYWwgZnJvbSAnLi4vLi4vdXRpbHMvZ2xvYmFsLnBhdGgnO1xuXG5leHBvcnQgY2xhc3MgTmdkRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIH1cbiAgICByZW5kZXJHcmFwaChmaWxlcGF0aDpTdHJpbmcsIG91dHB1dHBhdGg6IFN0cmluZywgdHlwZTogU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgbGV0IG5nZFBhdGggPSAoaXNHbG9iYWwoKSkgPyBfX2Rpcm5hbWUgKyAnLy4uL25vZGVfbW9kdWxlcy8uYmluL25nZCcgOiBfX2Rpcm5hbWUgKyAnLy4uLy4uLy5iaW4vbmdkJztcbiAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk1PREUgJiYgcHJvY2Vzcy5lbnYuTU9ERSA9PT0gJ1RFU1RJTkcnKSB7XG4gICAgICAgICAgICAgICBuZ2RQYXRoID0gX19kaXJuYW1lICsgJy8uLi9ub2RlX21vZHVsZXMvLmJpbi9uZ2QnO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIGlmICgvIC9nLnRlc3QobmdkUGF0aCkpIHtcbiAgICAgICAgICAgICAgIG5nZFBhdGggPSBuZ2RQYXRoLnJlcGxhY2UoLyAvZywgJ14gJyk7XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHBhdGgucmVzb2x2ZShuZ2RQYXRoKSArICcgLScgKyB0eXBlICsgJyAnICsgZmlsZXBhdGggKyAnIC1kICcgKyBvdXRwdXRwYXRoICsgJyAtcyAtdCBzdmcnXG4gICAgICAgICAgIFNoZWxsanMuZXhlYyhmaW5hbFBhdGgsIHtcbiAgICAgICAgICAgICAgIHNpbGVudDogdHJ1ZVxuICAgICAgICAgICB9LCBmdW5jdGlvbihjb2RlLCBzdGRvdXQsIHN0ZGVycikge1xuICAgICAgICAgICAgICAgaWYoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KHN0ZGVycik7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XG5cbmNvbnN0IGx1bnI6IGFueSA9IHJlcXVpcmUoJ2x1bnInKSxcbiAgICAgIGNoZWVyaW86IGFueSA9IHJlcXVpcmUoJ2NoZWVyaW8nKSxcbiAgICAgIEVudGl0aWVzOmFueSA9IHJlcXVpcmUoJ2h0bWwtZW50aXRpZXMnKS5BbGxIdG1sRW50aXRpZXMsXG4gICAgICAkY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSxcbiAgICAgIEh0bWwgPSBuZXcgRW50aXRpZXMoKTtcblxuZXhwb3J0IGNsYXNzIFNlYXJjaEVuZ2luZSB7XG4gICAgc2VhcmNoSW5kZXg6IGFueTtcbiAgICBkb2N1bWVudHNTdG9yZTogT2JqZWN0ID0ge307XG4gICAgaW5kZXhTaXplOiBudW1iZXI7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuICAgIHByaXZhdGUgZ2V0U2VhcmNoSW5kZXgoKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWFyY2hJbmRleCkge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hJbmRleCA9IGx1bnIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmKCd1cmwnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCd0aXRsZScsIHsgYm9vc3Q6IDEwIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZmllbGQoJ2JvZHknKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlYXJjaEluZGV4O1xuICAgIH1cbiAgICBpbmRleFBhZ2UocGFnZSkge1xuICAgICAgICB2YXIgdGV4dCxcbiAgICAgICAgICAgICQgPSBjaGVlcmlvLmxvYWQocGFnZS5yYXdEYXRhKTtcblxuICAgICAgICB0ZXh0ID0gJCgnLmNvbnRlbnQnKS5odG1sKCk7XG4gICAgICAgIHRleHQgPSBIdG1sLmRlY29kZSh0ZXh0KTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKDwoW14+XSspPikvaWcsICcnKTtcblxuICAgICAgICBwYWdlLnVybCA9IHBhZ2UudXJsLnJlcGxhY2UoJGNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0LCAnJyk7XG5cbiAgICAgICAgdmFyIGRvYyA9IHtcbiAgICAgICAgICAgIHVybDogcGFnZS51cmwsXG4gICAgICAgICAgICB0aXRsZTogcGFnZS5pbmZvcy5jb250ZXh0ICsgJyAtICcgKyBwYWdlLmluZm9zLm5hbWUsXG4gICAgICAgICAgICBib2R5OiB0ZXh0XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kb2N1bWVudHNTdG9yZVtkb2MudXJsXSA9IGRvYztcblxuICAgICAgICB0aGlzLmdldFNlYXJjaEluZGV4KCkuYWRkKGRvYyk7XG4gICAgfVxuICAgIGdlbmVyYXRlU2VhcmNoSW5kZXhKc29uKG91dHB1dEZvbGRlcikge1xuICAgICAgICBmcy53cml0ZUpzb24ocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJ3NlYXJjaF9pbmRleC5qc29uJyksIHtcbiAgICAgICAgICAgIGluZGV4OiB0aGlzLmdldFNlYXJjaEluZGV4KCksXG4gICAgICAgICAgICBzdG9yZTogdGhpcy5kb2N1bWVudHNTdG9yZVxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBzZWFyY2ggaW5kZXggZmlsZSBnZW5lcmF0aW9uICcsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyB0cyBmcm9tIFwidHlwZXNjcmlwdFwiO1xuY29uc3QgdHNhbnkgPSB0cyBhcyBhbnk7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iLzIuMS9zcmMvY29tcGlsZXIvdXRpbGl0aWVzLnRzI0wxNTA3XG5leHBvcnQgZnVuY3Rpb24gZ2V0SlNEb2NzKG5vZGU6IHRzLk5vZGUpIHtcbiAgcmV0dXJuIHRzYW55LmdldEpTRG9jcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5jb25zdCBjYXJyaWFnZVJldHVybkxpbmVGZWVkID0gJ1xcclxcbic7XG5jb25zdCBsaW5lRmVlZCA9ICdcXG4nO1xuXG4vLyBnZXQgZGVmYXVsdCBuZXcgbGluZSBicmVha1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5ld0xpbmVDaGFyYWN0ZXIob3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zKTogc3RyaW5nIHtcbiAgICBpZiAob3B0aW9ucy5uZXdMaW5lID09PSB0cy5OZXdMaW5lS2luZC5DYXJyaWFnZVJldHVybkxpbmVGZWVkKSB7XG4gICAgICAgIHJldHVybiBjYXJyaWFnZVJldHVybkxpbmVGZWVkO1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zLm5ld0xpbmUgPT09IHRzLk5ld0xpbmVLaW5kLkxpbmVGZWVkKSB7XG4gICAgICAgIHJldHVybiBsaW5lRmVlZDtcbiAgICB9XG4gICAgcmV0dXJuIGNhcnJpYWdlUmV0dXJuTGluZUZlZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RJbmRlbnQoc3RyLCBjb3VudCwgaW5kZW50Pyk6IHN0cmluZyB7XG4gICAgbGV0IHN0cmlwSW5kZW50ID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzdHIubWF0Y2goL15bIFxcdF0qKD89XFxTKS9nbSk7XG5cbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IHVzZSBzcHJlYWQgb3BlcmF0b3Igd2hlbiB0YXJnZXRpbmcgTm9kZS5qcyA2XG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIG1hdGNoLm1hcCh4ID0+IHgubGVuZ3RoKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGBeWyBcXFxcdF17JHtpbmRlbnR9fWAsICdnbScpO1xuXG4gICAgICAgIHJldHVybiBpbmRlbnQgPiAwID8gc3RyLnJlcGxhY2UocmUsICcnKSA6IHN0cjtcbiAgICB9LFxuICAgICAgICByZXBlYXRpbmcgPSBmdW5jdGlvbihuLCBzdHIpIHtcbiAgICAgICAgc3RyID0gc3RyID09PSB1bmRlZmluZWQgPyAnICcgOiBzdHI7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuIDwgMCB8fCAhTnVtYmVyLmlzRmluaXRlKG4pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIHBvc2l0aXZlIGZpbml0ZSBudW1iZXIsIGdvdCBcXGAke259XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmV0ID0gJyc7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XG4gICAgICAgICAgICAgICAgcmV0ICs9IHN0cjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RyICs9IHN0cjtcbiAgICAgICAgfSB3aGlsZSAoKG4gPj49IDEpKTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgaW5kZW50U3RyaW5nID0gZnVuY3Rpb24oc3RyLCBjb3VudCwgaW5kZW50KSB7XG4gICAgICAgIGluZGVudCA9IGluZGVudCA9PT0gdW5kZWZpbmVkID8gJyAnIDogaW5kZW50O1xuICAgICAgICBjb3VudCA9IGNvdW50ID09PSB1bmRlZmluZWQgPyAxIDogY291bnQ7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgY291bnQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIFxcYG51bWJlclxcYCwgZ290IFxcYCR7dHlwZW9mIGNvdW50fVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBpbmRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbmRlbnRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBpbmRlbnR9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICBpbmRlbnQgPSBjb3VudCA+IDEgPyByZXBlYXRpbmcoY291bnQsIGluZGVudCkgOiBpbmRlbnQ7XG5cbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eKD8hXFxzKiQpL21nLCBpbmRlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBpbmRlbnRTdHJpbmcoc3RyaXBJbmRlbnQoc3RyKSwgY291bnQgfHwgMCwgaW5kZW50KTtcbn1cblxuLy8gQ3JlYXRlIGEgY29tcGlsZXJIb3N0IG9iamVjdCB0byBhbGxvdyB0aGUgY29tcGlsZXIgdG8gcmVhZCBhbmQgd3JpdGUgZmlsZXNcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlckhvc3QodHJhbnNwaWxlT3B0aW9uczogYW55KTogdHMuQ29tcGlsZXJIb3N0IHtcblxuICAgIGNvbnN0IGlucHV0RmlsZU5hbWUgPSB0cmFuc3BpbGVPcHRpb25zLmZpbGVOYW1lIHx8ICh0cmFuc3BpbGVPcHRpb25zLmpzeCA/ICdtb2R1bGUudHN4JyA6ICdtb2R1bGUudHMnKTtcblxuICAgIGNvbnN0IGNvbXBpbGVySG9zdDogdHMuQ29tcGlsZXJIb3N0ID0ge1xuICAgICAgICBnZXRTb3VyY2VGaWxlOiAoZmlsZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChmaWxlTmFtZS5sYXN0SW5kZXhPZignLnRzJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnbGliLmQudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBhdGguaXNBYnNvbHV0ZShmaWxlTmFtZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gcGF0aC5qb2luKHRyYW5zcGlsZU9wdGlvbnMudHNjb25maWdEaXJlY3RvcnksIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbGliU291cmNlID0gJyc7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBsaWJTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZU5hbWUpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGUsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShmaWxlTmFtZSwgbGliU291cmNlLCB0cmFuc3BpbGVPcHRpb25zLnRhcmdldCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGVGaWxlOiAobmFtZSwgdGV4dCkgPT4ge30sXG4gICAgICAgIGdldERlZmF1bHRMaWJGaWxlTmFtZTogKCkgPT4gJ2xpYi5kLnRzJyxcbiAgICAgICAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lczogKCkgPT4gZmFsc2UsXG4gICAgICAgIGdldENhbm9uaWNhbEZpbGVOYW1lOiBmaWxlTmFtZSA9PiBmaWxlTmFtZSxcbiAgICAgICAgZ2V0Q3VycmVudERpcmVjdG9yeTogKCkgPT4gJycsXG4gICAgICAgIGdldE5ld0xpbmU6ICgpID0+ICdcXG4nLFxuICAgICAgICBmaWxlRXhpc3RzOiAoZmlsZU5hbWUpOiBib29sZWFuID0+IGZpbGVOYW1lID09PSBpbnB1dEZpbGVOYW1lLFxuICAgICAgICByZWFkRmlsZTogKCkgPT4gJycsXG4gICAgICAgIGRpcmVjdG9yeUV4aXN0czogKCkgPT4gdHJ1ZSxcbiAgICAgICAgZ2V0RGlyZWN0b3JpZXM6ICgpID0+IFtdXG4gICAgfTtcbiAgICByZXR1cm4gY29tcGlsZXJIb3N0O1xufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcblxuZXhwb3J0IGxldCBSb3V0ZXJQYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcm91dGVzID0gW10sXG4gICAgICAgIG1vZHVsZXMgPSBbXSxcbiAgICAgICAgbW9kdWxlc1RyZWUsXG4gICAgICAgIHJvb3RNb2R1bGUsXG4gICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gW107XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhZGRSb3V0ZTogZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgIHJvdXRlcy5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgIHJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgocm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZE1vZHVsZVdpdGhSb3V0ZXM6IGZ1bmN0aW9uKG1vZHVsZU5hbWUsIG1vZHVsZUltcG9ydHMpIHtcbiAgICAgICAgICAgIG1vZHVsZXNXaXRoUm91dGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlc1dpdGhSb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKG1vZHVsZXNXaXRoUm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZE1vZHVsZTogZnVuY3Rpb24obW9kdWxlTmFtZTogc3RyaW5nLCBtb2R1bGVJbXBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgobW9kdWxlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBzZXRSb290TW9kdWxlOiBmdW5jdGlvbihtb2R1bGU6IHN0cmluZykge1xuICAgICAgICAgICAgcm9vdE1vZHVsZSA9IG1vZHVsZTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJpbnRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHJvdXRlcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhc1JvdXRlck1vZHVsZUluSW1wb3J0czogZnVuY3Rpb24oaW1wb3J0cykge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGltcG9ydHMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JDaGlsZCcpICE9PSAtMSB8fFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRzW2ldLm5hbWUuaW5kZXhPZignUm91dGVyTW9kdWxlLmZvclJvb3QnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBsaW5rTW9kdWxlc0FuZFJvdXRlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL3NjYW4gZWFjaCBtb2R1bGUgaW1wb3J0cyBBU1QgZm9yIGVhY2ggcm91dGVzLCBhbmQgbGluayByb3V0ZXMgd2l0aCBtb2R1bGVcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtb2R1bGVzV2l0aFJvdXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzV2l0aFJvdXRlc1tpXS5pbXBvcnRzTm9kZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gobm9kZS5pbml0aWFsaXplci5lbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbmQgZWxlbWVudCB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50LmFyZ3VtZW50cywgZnVuY3Rpb24oYXJndW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocm91dGVzLCBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0ICYmIHJvdXRlLm5hbWUgPT09IGFyZ3VtZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLm1vZHVsZSA9IG1vZHVsZXNXaXRoUm91dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uc3RydWN0Um91dGVzVHJlZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjb25zdHJ1Y3RSb3V0ZXNUcmVlJyk7XG4gICAgICAgICAgICAvLyByb3V0ZXNbXSBjb250YWlucyByb3V0ZXMgd2l0aCBtb2R1bGUgbGlua1xuICAgICAgICAgICAgLy8gbW9kdWxlc1RyZWUgY29udGFpbnMgbW9kdWxlcyB0cmVlXG4gICAgICAgICAgICAvLyBtYWtlIGEgZmluYWwgcm91dGVzIHRyZWUgd2l0aCB0aGF0XG4gICAgICAgICAgICBsZXQgY2xlYW5Nb2R1bGVzVHJlZSA9IF8uY2xvbmVEZWVwKG1vZHVsZXNUcmVlKSxcbiAgICAgICAgICAgICAgICBtb2R1bGVzQ2xlYW5lciA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldLmltcG9ydHNOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFycltpXS5pbXBvcnRzTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJbaV0ucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFycltpXS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihhcnJbaV0uY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihjbGVhbk1vZHVsZXNUcmVlKTtcbiAgICAgICAgICAgIC8vZnMub3V0cHV0SnNvbignLi9tb2R1bGVzLmpzb24nLCBjbGVhbk1vZHVsZXNUcmVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbGVhbk1vZHVsZXNUcmVlIGxpZ2h0OiAnLCB1dGlsLmluc3BlY3QoY2xlYW5Nb2R1bGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgdmFyIHJvdXRlc1RyZWUgPSB7XG4gICAgICAgICAgICAgICAgdGFnOiAnPHJvb3Q+JyxcbiAgICAgICAgICAgICAgICBraW5kOiAnbmdNb2R1bGUnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHJvb3RNb2R1bGUsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsZXQgZm91bmRSb3V0ZVdpdGhNb2R1bGVOYW1lID0gZnVuY3Rpb24obW9kdWxlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmZpbmQocm91dGVzLCB7J21vZHVsZSc6IG1vZHVsZU5hbWV9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGxvb3BNb2R1bGVzUGFyc2VyID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZSA9IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZShub2RlLmNoaWxkcmVuW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLnJvdXRlcyA9IEpTT04ucGFyc2Uocm91dGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgcm91dGUuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmtpbmQgPSAnbmdNb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzVHJlZS5jaGlsZHJlbi5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbltpXS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcE1vZHVsZXNQYXJzZXIobm9kZS5jaGlsZHJlbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb29wTW9kdWxlc1BhcnNlcihfLmZpbmQoY2xlYW5Nb2R1bGVzVHJlZSwgeyduYW1lJzogcm9vdE1vZHVsZX0pKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3JvdXRlc1RyZWU6ICcsIHJvdXRlc1RyZWUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuXG4gICAgICAgICAgICAvL2ZzLm91dHB1dEpzb24oJy4vcm91dGVzLXRyZWUuanNvbicsIHJvdXRlc1RyZWUpO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5lZFJvdXRlc1RyZWU7XG5cbiAgICAgICAgICAgIHZhciBjbGVhblJvdXRlc1RyZWUgPSBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm91dGVzID0gcm91dGUuY2hpbGRyZW5baV0ucm91dGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcm91dGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFuZWRSb3V0ZXNUcmVlID0gY2xlYW5Sb3V0ZXNUcmVlKHJvdXRlc1RyZWUpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW5lZFJvdXRlc1RyZWU6ICcsIHV0aWwuaW5zcGVjdChjbGVhbmVkUm91dGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICB9LFxuICAgICAgICBjb25zdHJ1Y3RNb2R1bGVzVHJlZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgZ2V0TmVzdGVkQ2hpbGRyZW4gPSBmdW5jdGlvbihhcnIsIHBhcmVudD8pIHtcbiAgICAgICAgICAgICAgICB2YXIgb3V0ID0gW11cbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGFycltpXS5wYXJlbnQgPT09IHBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gZ2V0TmVzdGVkQ2hpbGRyZW4oYXJyLCBhcnJbaV0ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycltpXS5jaGlsZHJlbiA9IGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChhcnJbaV0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vU2NhbiBlYWNoIG1vZHVsZSBhbmQgYWRkIHBhcmVudCBwcm9wZXJ0eVxuICAgICAgICAgICAgXy5mb3JFYWNoKG1vZHVsZXMsIGZ1bmN0aW9uKGZpcnN0TG9vcE1vZHVsZSkge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChmaXJzdExvb3BNb2R1bGUuaW1wb3J0c05vZGUsIGZ1bmN0aW9uKGltcG9ydE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG1vZHVsZXMsIGZ1bmN0aW9uKG1vZHVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIG1vZHVsZS5uYW1lID09PSBpbXBvcnROb2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGUucGFyZW50ID0gZmlyc3RMb29wTW9kdWxlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXNUcmVlID0gZ2V0TmVzdGVkQ2hpbGRyZW4obW9kdWxlcyk7XG4gICAgICAgIH1cbiAgICB9XG59KSgpO1xuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmxldCBjb2RlOiBzdHJpbmdbXSA9IFtdO1xuXG5leHBvcnQgbGV0IGdlbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHRtcDogdHlwZW9mIGNvZGUgPSBbXTtcblxuICAgIHJldHVybiAodG9rZW4gPSBudWxsKSA9PiB7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAhIHRva2VuJyk7XG4gICAgICAgICAgICByZXR1cm4gY29kZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0b2tlbiA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyBcXG4nKTtcbiAgICAgICAgICAgIGNvZGUucHVzaCh0bXAuam9pbignJykpO1xuICAgICAgICAgICAgdG1wID0gW107XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb2RlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cbn0gKCkpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGUobm9kZTogYW55KSB7XG4gICAgY29kZSA9IFtdO1xuICAgIHZpc2l0QW5kUmVjb2duaXplKG5vZGUpO1xuICAgIHJldHVybiBjb2RlLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiB2aXNpdEFuZFJlY29nbml6ZShub2RlOiBhbnksIGRlcHRoID0gMCkge1xuICAgIHJlY29nbml6ZShub2RlKTtcbiAgICBkZXB0aCsrO1xuICAgIG5vZGUuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKGMgPT4gdmlzaXRBbmRSZWNvZ25pemUoYywgZGVwdGgpKTtcbn1cblxuZnVuY3Rpb24gcmVjb2duaXplKG5vZGU6IGFueSkge1xuXG4gICAgLy9jb25zb2xlLmxvZygncmVjb2duaXppbmcuLi4nLCB0cy5TeW50YXhLaW5kW25vZGUua2luZCsnJ10pO1xuXG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0TGl0ZXJhbFRva2VuOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGdlbignXFxcIicpO1xuICAgICAgICAgICAgZ2VuKG5vZGUudGV4dCk7XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGdlbignXFxcIicpO1xuICAgICAgICAgICAgZ2VuKG5vZGUudGV4dCk7XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignaW1wb3J0Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnJvbUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2Zyb20nKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGdlbignZXhwb3J0Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2NsYXNzJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3RoaXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3JLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjb25zdHJ1Y3RvcicpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignZmFsc2UnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3RydWUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ251bGwnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BdFRva2VuOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QbHVzVG9rZW46XG4gICAgICAgICAgICBnZW4oJysnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXF1YWxzR3JlYXRlclRoYW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignID0+ICcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9wZW5QYXJlblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcoJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0Q2xhdXNlOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CbG9jazpcbiAgICAgICAgICAgIGdlbigneycpO1xuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbG9zZUJyYWNlVG9rZW46XG4gICAgICAgICAgICBnZW4oJ30nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VQYXJlblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcpJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9wZW5CcmFja2V0VG9rZW46XG4gICAgICAgICAgICBnZW4oJ1snKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFja2V0VG9rZW46XG4gICAgICAgICAgICBnZW4oJ10nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TZW1pY29sb25Ub2tlbjpcbiAgICAgICAgICAgIGdlbignOycpO1xuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29tbWFUb2tlbjpcbiAgICAgICAgICAgIGdlbignLCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGdlbignOicpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRvdFRva2VuOlxuICAgICAgICAgICAgZ2VuKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRvU3RhdGVtZW50OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5EZWNvcmF0b3I6XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmlyc3RBc3NpZ25tZW50OlxuICAgICAgICAgICAgZ2VuKCcgPSAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmlyc3RQdW5jdHVhdGlvbjpcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdwcml2YXRlJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHVibGljJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgX3RzIGZyb20gJy4uLy4uL3V0aWxzL3RzLWludGVybmFsJztcbmltcG9ydCBtYXJrZWQgZnJvbSAnbWFya2VkJztcbmltcG9ydCB7IGdldE5ld0xpbmVDaGFyYWN0ZXIsIGNvbXBpbGVySG9zdCwgZCwgZGV0ZWN0SW5kZW50IH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBSb3V0ZXJQYXJzZXIgfSBmcm9tICcuLi8uLi91dGlscy9yb3V0ZXIucGFyc2VyJztcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSAnLi9jb2RlZ2VuJztcblxuaW50ZXJmYWNlIE5vZGVPYmplY3Qge1xuICAgIGtpbmQ6IE51bWJlcjtcbiAgICBwb3M6IE51bWJlcjtcbiAgICBlbmQ6IE51bWJlcjtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgaW5pdGlhbGl6ZXI6IE5vZGVPYmplY3QsXG4gICAgbmFtZT86IHsgdGV4dDogc3RyaW5nIH07XG4gICAgZXhwcmVzc2lvbj86IE5vZGVPYmplY3Q7XG4gICAgZWxlbWVudHM/OiBOb2RlT2JqZWN0W107XG4gICAgYXJndW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIHByb3BlcnRpZXM/OiBhbnlbXTtcbiAgICBwYXJzZXJDb250ZXh0RmxhZ3M/OiBOdW1iZXI7XG4gICAgZXF1YWxzR3JlYXRlclRoYW5Ub2tlbj86IE5vZGVPYmplY3RbXTtcbiAgICBwYXJhbWV0ZXJzPzogTm9kZU9iamVjdFtdO1xuICAgIENvbXBvbmVudD86IFN0cmluZztcbiAgICBib2R5Pzoge1xuICAgICAgICBwb3M6IE51bWJlcjtcbiAgICAgICAgZW5kOiBOdW1iZXI7XG4gICAgICAgIHN0YXRlbWVudHM6IE5vZGVPYmplY3RbXTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBEZXBzIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGZpbGU/OiBzdHJpbmc7XG4gICAgc291cmNlQ29kZT86IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcblxuICAgIC8vQ29tcG9uZW50XG5cbiAgICBhbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBzdHJpbmc7XG4gICAgZW5jYXBzdWxhdGlvbj86IHN0cmluZztcbiAgICBlbnRyeUNvbXBvbmVudHM/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBleHBvcnRBcz86IHN0cmluZztcbiAgICBob3N0Pzogc3RyaW5nO1xuICAgIGlucHV0cz86IHN0cmluZ1tdO1xuICAgIGludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBtb2R1bGVJZD86IHN0cmluZztcbiAgICBvdXRwdXRzPzogc3RyaW5nW107XG4gICAgcXVlcmllcz86IERlcHNbXTsgLy8gVE9ET1xuICAgIHNlbGVjdG9yPzogc3RyaW5nO1xuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdO1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIHRlbXBsYXRlPzogc3RyaW5nO1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nW107XG4gICAgdmlld1Byb3ZpZGVycz86IHN0cmluZ1tdO1xuXG4gICAgaW5wdXRzQ2xhc3M/OiBPYmplY3RbXTtcblxuICAgIC8vY29tbW9uXG4gICAgcHJvdmlkZXJzPzogRGVwc1tdO1xuXG4gICAgLy9tb2R1bGVcbiAgICBkZWNsYXJhdGlvbnM/OiBEZXBzW107XG4gICAgYm9vdHN0cmFwPzogRGVwc1tdO1xuXG4gICAgaW1wb3J0cz86IERlcHNbXTtcbiAgICBleHBvcnRzPzogRGVwc1tdO1xufVxuXG5pbnRlcmZhY2UgU3ltYm9sRGVwcyB7XG4gICAgZnVsbDogc3RyaW5nO1xuICAgIGFsaWFzOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBEZXBlbmRlbmNpZXMge1xuXG4gICAgcHJpdmF0ZSBmaWxlczogc3RyaW5nW107XG4gICAgcHJpdmF0ZSBwcm9ncmFtOiB0cy5Qcm9ncmFtO1xuICAgIHByaXZhdGUgcHJvZ3JhbUNvbXBvbmVudDogdHMuUHJvZ3JhbTtcbiAgICBwcml2YXRlIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcjtcbiAgICBwcml2YXRlIHR5cGVDaGVja2VyQ29tcG9uZW50OiB0cy5UeXBlQ2hlY2tlcjtcbiAgICBwcml2YXRlIGVuZ2luZTogYW55O1xuICAgIHByaXZhdGUgX19jYWNoZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSBfX25zTW9kdWxlOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIHVua25vd24gPSAnPz8/JztcblxuICAgIGNvbnN0cnVjdG9yKGZpbGVzOiBzdHJpbmdbXSwgb3B0aW9uczogYW55KSB7XG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlcztcbiAgICAgICAgY29uc3QgdHJhbnNwaWxlT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHRhcmdldDogdHMuU2NyaXB0VGFyZ2V0LkVTNSxcbiAgICAgICAgICAgIG1vZHVsZTogdHMuTW9kdWxlS2luZC5Db21tb25KUyxcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBvcHRpb25zLnRzY29uZmlnRGlyZWN0b3J5XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0odGhpcy5maWxlcywgdHJhbnNwaWxlT3B0aW9ucywgY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJyZWFrTGluZXModGV4dCkge1xuICAgICAgICB2YXIgX3QgPSB0ZXh0O1xuICAgICAgICBpZiAodHlwZW9mIF90ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgX3QgPSBfdC5yZXBsYWNlKC8oXFxuKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIF90ID0gX3QucmVwbGFjZSgvKDxicj4pJC9nbSwgJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdDtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXMoKSB7XG4gICAgICAgIGxldCBkZXBzOiBPYmplY3QgPSB7XG4gICAgICAgICAgICAnbW9kdWxlcyc6IFtdLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnOiBbXSxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcyc6IFtdLFxuICAgICAgICAgICAgJ3BpcGVzJzogW10sXG4gICAgICAgICAgICAnZGlyZWN0aXZlcyc6IFtdLFxuICAgICAgICAgICAgJ3JvdXRlcyc6IFtdLFxuICAgICAgICAgICAgJ2NsYXNzZXMnOiBbXSxcbiAgICAgICAgICAgICdpbnRlcmZhY2VzJzogW11cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNvdXJjZUZpbGVzID0gdGhpcy5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkgfHwgW107XG5cbiAgICAgICAgc291cmNlRmlsZXMubWFwKChmaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCBmaWxlUGF0aCA9IGZpbGUuZmlsZU5hbWU7XG5cbiAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSAnLnRzJykge1xuXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmxhc3RJbmRleE9mKCcuZC50cycpID09PSAtMSAmJiBmaWxlUGF0aC5sYXN0SW5kZXhPZignc3BlYy50cycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygncGFyc2luZycsIGZpbGVQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTb3VyY2VGaWxlRGVjb3JhdG9ycyhmaWxlLCBkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUsIGZpbGUuZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkZXBzO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmxpbmtNb2R1bGVzQW5kUm91dGVzKCk7XG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmNvbnN0cnVjdE1vZHVsZXNUcmVlKCk7XG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmNvbnN0cnVjdFJvdXRlc1RyZWUoKTtcblxuICAgICAgICByZXR1cm4gZGVwcztcbiAgICB9XG5cblxuICAgIHByaXZhdGUgZ2V0U291cmNlRmlsZURlY29yYXRvcnMoc3JjRmlsZTogdHMuU291cmNlRmlsZSwgb3V0cHV0U3ltYm9sczogT2JqZWN0KTogdm9pZCB7XG5cbiAgICAgICAgbGV0IGNsZWFuZXIgPSAocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgICAgIGxldCBmaWxlID0gc3JjRmlsZS5maWxlTmFtZS5yZXBsYWNlKGNsZWFuZXIsICcnKTtcblxuICAgICAgICB0aGlzLnByb2dyYW1Db21wb25lbnQgPSB0cy5jcmVhdGVQcm9ncmFtKFtmaWxlXSwge30pO1xuICAgICAgICBsZXQgc291cmNlRmlsZSA9IHRoaXMucHJvZ3JhbUNvbXBvbmVudC5nZXRTb3VyY2VGaWxlKGZpbGUpO1xuICAgICAgICB0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50ID0gdGhpcy5wcm9ncmFtQ29tcG9uZW50LmdldFR5cGVDaGVja2VyKHRydWUpO1xuXG4gICAgICAgIHRzLmZvckVhY2hDaGlsZChzcmNGaWxlLCAobm9kZTogdHMuTm9kZSkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgZGVwczogRGVwcyA9IDxEZXBzPnt9O1xuICAgICAgICAgICAgaWYgKG5vZGUuZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICAgIGxldCB2aXNpdE5vZGUgPSAodmlzaXRlZE5vZGUsIGluZGV4KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1ldGFkYXRhID0gbm9kZS5kZWNvcmF0b3JzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wcyA9IHRoaXMuZmluZFByb3BzKHZpc2l0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDb21wb25lbnRJTyhmaWxlLCBzb3VyY2VGaWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc01vZHVsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogdGhpcy5nZXRNb2R1bGVQcm92aWRlcnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogdGhpcy5nZXRNb2R1bGVEZWNsYXRpb25zKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRzOiB0aGlzLmdldE1vZHVsZUltcG9ydHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydHM6IHRoaXMuZ2V0TW9kdWxlRXhwb3J0cyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9vdHN0cmFwOiB0aGlzLmdldE1vZHVsZUJvb3RzdHJhcChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUm91dGVyUGFyc2VyLmhhc1JvdXRlck1vZHVsZUluSW1wb3J0cyhkZXBzLmltcG9ydHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZE1vZHVsZVdpdGhSb3V0ZXMobmFtZSwgdGhpcy5nZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkTW9kdWxlKG5hbWUsIGRlcHMuaW1wb3J0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtb2R1bGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzQ29tcG9uZW50KG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocHJvcHMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHV0aWwuaW5zcGVjdChwcm9wcywgeyBzaG93SGlkZGVuOiB0cnVlLCBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IHRoaXMuZ2V0Q29tcG9uZW50Q2hhbmdlRGV0ZWN0aW9uKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNhcHN1bGF0aW9uOiB0aGlzLmdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24ocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXM6IHRoaXMuZ2V0Q29tcG9uZW50RXhwb3J0QXMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHRoaXMuZ2V0Q29tcG9uZW50SG9zdChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB0aGlzLmdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE8gd2FpdGluZyBkb2MgaW5mb3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJZDogdGhpcy5nZXRDb21wb25lbnRNb2R1bGVJZChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogdGhpcy5nZXRDb21wb25lbnRPdXRwdXRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3F1ZXJpZXM/OiBEZXBzW107IC8vIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogdGhpcy5nZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVVcmxzOiB0aGlzLmdldENvbXBvbmVudFN0eWxlVXJscyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiB0aGlzLmdldENvbXBvbmVudFN0eWxlcyhwcm9wcyksIC8vIFRPRE8gZml4IGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHRoaXMuZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdQcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50Vmlld1Byb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzQ2xhc3M6IElPLmlucHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzQ2xhc3M6IElPLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc0NsYXNzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHNDbGFzczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NvbXBvbmVudHMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNJbmplY3RhYmxlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IElPLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2luamVjdGFibGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzUGlwZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwaXBlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ3BpcGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzRGlyZWN0aXZlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydkaXJlY3RpdmVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2NhY2hlW25hbWVdID0gZGVwcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZmlsdGVyQnlEZWNvcmF0b3JzID0gKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC8oTmdNb2R1bGV8Q29tcG9uZW50fEluamVjdGFibGV8UGlwZXxEaXJlY3RpdmUpLy50ZXN0KG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBub2RlLmRlY29yYXRvcnNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihmaWx0ZXJCeURlY29yYXRvcnMpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHZpc2l0Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuc3ltYm9sLmZsYWdzID09PSB0cy5TeW1ib2xGbGFncy5DbGFzcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q29tcG9uZW50SU8oZmlsZSwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NsYXNzZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihub2RlLnN5bWJvbC5mbGFncyA9PT0gdHMuU3ltYm9sRmxhZ3MuSW50ZXJmYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRJbnRlcmZhY2VJTyhmaWxlLCBzb3VyY2VGaWxlLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMua2luZCA9IElPLmtpbmQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snaW50ZXJmYWNlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldFJvdXRlSU8oZmlsZSwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgaWYoSU8ucm91dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdSb3V0ZXM7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3V0ZXMgPSBKU09OLnBhcnNlKElPLnJvdXRlcy5yZXBsYWNlKC8gL2dtLCAnJykpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1JvdXRlcyBwYXJzaW5nIGVycm9yLCBtYXliZSBhIHRyYWlsaW5nIGNvbW1hIG9yIGFuIGV4dGVybmFsIHZhcmlhYmxlID8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ3JvdXRlcyddID0gWy4uLm91dHB1dFN5bWJvbHNbJ3JvdXRlcyddLCAuLi5uZXdSb3V0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENvbXBvbmVudElPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjbGFzc2VzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vRmluZCB0aGUgcm9vdCBtb2R1bGUgd2l0aCBib290c3RyYXBNb2R1bGUgY2FsbFxuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgcmVjdXNpdmVseSBpbiBleHByZXNzaW9uIG5vZGVzIG9uZSB3aXRoIG5hbWUgJ2Jvb3RzdHJhcE1vZHVsZSdcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvb3RNb2R1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHROb2RlID0gdGhpcy5maW5kRXhwcmVzc2lvbkJ5TmFtZShub2RlLCAnYm9vdHN0cmFwTW9kdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdE5vZGUuYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocmVzdWx0Tm9kZS5hcmd1bWVudHMsIGZ1bmN0aW9uKGFyZ3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFyZ3VtZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBhcmd1bWVudC50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vdE1vZHVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5zZXRSb290TW9kdWxlKHJvb3RNb2R1bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cbiAgICBwcml2YXRlIGRlYnVnKGRlcHM6IERlcHMpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdkZWJ1ZycsIGAke2RlcHMubmFtZX06YCk7XG4gICAgICAgIFtcbiAgICAgICAgICAgICdpbXBvcnRzJywgJ2V4cG9ydHMnLCAnZGVjbGFyYXRpb25zJywgJ3Byb3ZpZGVycycsICdib290c3RyYXAnXG4gICAgICAgIF0uZm9yRWFjaChzeW1ib2xzID0+IHtcbiAgICAgICAgICAgIGlmIChkZXBzW3N5bWJvbHNdICYmIGRlcHNbc3ltYm9sc10ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnJywgYC0gJHtzeW1ib2xzfTpgKTtcbiAgICAgICAgICAgICAgICBkZXBzW3N5bWJvbHNdLm1hcChpID0+IGkubmFtZSkuZm9yRWFjaChkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCcnLCBgXFx0LSAke2R9YCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kRXhwcmVzc2lvbkJ5TmFtZShlbnRyeU5vZGUsIG5hbWUpIHtcbiAgICAgICAgbGV0IHJlc3VsdCxcbiAgICAgICAgICAgIGxvb3AgPSBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uICYmICFub2RlLmV4cHJlc3Npb24ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBsb29wKG5vZGUuZXhwcmVzc2lvbiwgbmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24ubmFtZS50ZXh0ID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBsb29wKGVudHJ5Tm9kZSwgbmFtZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0NvbXBvbmVudChtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdDb21wb25lbnQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQaXBlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ1BpcGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNEaXJlY3RpdmUobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnRGlyZWN0aXZlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSW5qZWN0YWJsZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdJbmplY3RhYmxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTW9kdWxlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ05nTW9kdWxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFR5cGUobmFtZSkge1xuICAgICAgICBsZXQgdHlwZTtcbiAgICAgICAgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjb21wb25lbnQnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ2NvbXBvbmVudCc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ3BpcGUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ3BpcGUnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdtb2R1bGUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ21vZHVsZSc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2RpcmVjdGl2ZScpICE9PSAtMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSAnZGlyZWN0aXZlJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbGVOYW1lKG5vZGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3NlbGVjdG9yJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRFeHBvcnRBcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydEFzJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdwcm92aWRlcnMnKS5tYXAoKHByb3ZpZGVyTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIocHJvdmlkZXJOYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kUHJvcHModmlzaXRlZE5vZGUpIHtcbiAgICAgICAgaWYodmlzaXRlZE5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLnBvcCgpLnByb3BlcnRpZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZURlY2xhdGlvbnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdkZWNsYXJhdGlvbnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBjb21wb25lbnQgPSB0aGlzLmZpbmRDb21wb25lbnRTZWxlY3RvckJ5TmFtZShuYW1lKTtcblxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUltcG9ydHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHNSYXcocHJvcHMsICdpbXBvcnRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVJbXBvcnRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW1wb3J0cycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlRXhwb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydHMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEhvc3QocHJvcHM6IE5vZGVPYmplY3RbXSk6IE9iamVjdCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHNPYmplY3QocHJvcHMsICdob3N0Jyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVCb290c3RyYXAocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdib290c3RyYXAnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdpbnB1dHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERlY29yYXRvck9mVHlwZShub2RlLCBkZWNvcmF0b3JUeXBlKSB7XG4gICAgICB2YXIgZGVjb3JhdG9ycyA9IG5vZGUuZGVjb3JhdG9ycyB8fCBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWNvcmF0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChkZWNvcmF0b3JzW2ldLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSBkZWNvcmF0b3JUeXBlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlY29yYXRvcnNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdElucHV0KHByb3BlcnR5LCBpbkRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaW5BcmdzID0gaW5EZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBpbkFyZ3MubGVuZ3RoID8gaW5BcmdzWzBdLnRleHQgOiBwcm9wZXJ0eS5uYW1lLnRleHQsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcy52aXNpdFR5cGUocHJvcGVydHkpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFR5cGUobm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gbm9kZSA/IHRoaXMudHlwZUNoZWNrZXJDb21wb25lbnQudHlwZVRvU3RyaW5nKHRoaXMudHlwZUNoZWNrZXJDb21wb25lbnQuZ2V0VHlwZUF0TG9jYXRpb24obm9kZSkpIDogJ3ZvaWQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRPdXRwdXQocHJvcGVydHksIG91dERlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgb3V0QXJncyA9IG91dERlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IG91dEFyZ3MubGVuZ3RoID8gb3V0QXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpLFxuICAgICAgICAgICAgdHlwZTogdGhpcy52aXNpdFR5cGUocHJvcGVydHkudHlwZS50eXBlQXJndW1lbnRzWzBdKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQdWJsaWMobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpc1B1YmxpYzogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpc1B1YmxpYykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW50ZXJuYWxNZW1iZXIobWVtYmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUHJpdmF0ZU9ySW50ZXJuYWwobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpc1ByaXZhdGU6IGJvb2xlYW4gPSBtZW1iZXIubW9kaWZpZXJzLnNvbWUobW9kaWZpZXIgPT4gbW9kaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZCk7XG4gICAgICAgICAgICBpZiAoaXNQcml2YXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbnRlcm5hbE1lbWJlcihtZW1iZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJbnRlcm5hbE1lbWJlcihtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaW50ZXJuYWxUYWdzOiBzdHJpbmdbXSA9IFsnaW50ZXJuYWwnLCAncHJpdmF0ZScsICdoaWRkZW4nXTtcbiAgICAgICAgaWYgKG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgbWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxUYWdzLmluZGV4T2YodGFnLnRhZ05hbWUudGV4dCkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzQW5ndWxhckxpZmVjeWNsZUhvb2sobWV0aG9kTmFtZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTID0gW1xuICAgICAgICAgICAgJ25nT25Jbml0JywgJ25nT25DaGFuZ2VzJywgJ25nRG9DaGVjaycsICduZ09uRGVzdHJveScsICduZ0FmdGVyQ29udGVudEluaXQnLCAnbmdBZnRlckNvbnRlbnRDaGVja2VkJyxcbiAgICAgICAgICAgICduZ0FmdGVyVmlld0luaXQnLCAnbmdBZnRlclZpZXdDaGVja2VkJywgJ3dyaXRlVmFsdWUnLCAncmVnaXN0ZXJPbkNoYW5nZScsICdyZWdpc3Rlck9uVG91Y2hlZCcsICdzZXREaXNhYmxlZFN0YXRlJ1xuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUy5pbmRleE9mKG1ldGhvZE5hbWUpID49IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKG1ldGhvZC5wYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICB2YXIgX3BhcmFtZXRlcnMgPSBbXSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtZXRob2QucGFyYW1ldGVycy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuaXNQdWJsaWMobWV0aG9kLnBhcmFtZXRlcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIF9wYXJhbWV0ZXJzLnB1c2godGhhdC52aXNpdEFyZ3VtZW50KG1ldGhvZC5wYXJhbWV0ZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9wYXJhbWV0ZXJzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENhbGxEZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSksXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0SW5kZXhEZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSksXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0TWV0aG9kRGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICBuYW1lOiBtZXRob2QubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSlcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGpzZG9jdGFncyA9IF90cy5nZXRKU0RvY3MobWV0aG9kKTtcbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIGlmIChqc2RvY3RhZ3NbMF0udGFncykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBqc2RvY3RhZ3NbMF0udGFncztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRBcmd1bWVudChhcmcpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IGFyZy5uYW1lLnRleHQsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShhcmcpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE5hbWVzQ29tcGFyZUZuKG5hbWUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJ25hbWUnO1xuICAgICAgICByZXR1cm4gKGEsIGIpID0+IGFbbmFtZV0ubG9jYWxlQ29tcGFyZShiW25hbWVdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0cmluZ2lmeURlZmF1bHRWYWx1ZShub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGlmIChub2RlLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLnRleHQ7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZCkge1xuICAgICAgICAgICAgcmV0dXJuICdmYWxzZSc7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RydWUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBwcm9wZXJ0eS5uYW1lLnRleHQsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcy52aXNpdFR5cGUocHJvcGVydHkpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdE1lbWJlcnMobWVtYmVycykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaW5wdXRzID0gW107XG4gICAgICAgIHZhciBvdXRwdXRzID0gW107XG4gICAgICAgIHZhciBtZXRob2RzID0gW107XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gW107XG4gICAgICAgIHZhciBraW5kO1xuICAgICAgICB2YXIgaW5wdXREZWNvcmF0b3IsIG91dERlY29yYXRvcjtcblxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVtYmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaW5wdXREZWNvcmF0b3IgPSB0aGlzLmdldERlY29yYXRvck9mVHlwZShtZW1iZXJzW2ldLCAnSW5wdXQnKTtcbiAgICAgICAgICAgIG91dERlY29yYXRvciA9IHRoaXMuZ2V0RGVjb3JhdG9yT2ZUeXBlKG1lbWJlcnNbaV0sICdPdXRwdXQnKTtcblxuICAgICAgICAgICAga2luZCA9IG1lbWJlcnNbaV0ua2luZDtcblxuICAgICAgICAgICAgaWYgKGlucHV0RGVjb3JhdG9yKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRzLnB1c2godGhpcy52aXNpdElucHV0KG1lbWJlcnNbaV0sIGlucHV0RGVjb3JhdG9yKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91dERlY29yYXRvcikge1xuICAgICAgICAgICAgICAgIG91dHB1dHMucHVzaCh0aGlzLnZpc2l0T3V0cHV0KG1lbWJlcnNbaV0sIG91dERlY29yYXRvcikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1ByaXZhdGVPckludGVybmFsKG1lbWJlcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTWV0aG9kRGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLk1ldGhvZFNpZ25hdHVyZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuaXNBbmd1bGFyTGlmZWN5Y2xlSG9vayhtZW1iZXJzW2ldLm5hbWUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wdXNoKHRoaXMudmlzaXRNZXRob2REZWNsYXJhdGlvbihtZW1iZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5U2lnbmF0dXJlIHx8IG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5HZXRBY2Nlc3Nvcikge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdFByb3BlcnR5KG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5DYWxsU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0Q2FsbERlY2xhcmF0aW9uKG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbmRleFNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdEluZGV4RGVjbGFyYXRpb24obWVtYmVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfY29uc3RydWN0b3JQcm9wZXJ0aWVzID0gdGhpcy52aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWVtYmVyc1tpXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBqID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiA9IF9jb25zdHJ1Y3RvclByb3BlcnRpZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBmb3IoajsgajxsZW47IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKF9jb25zdHJ1Y3RvclByb3BlcnRpZXNbal0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW5wdXRzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcbiAgICAgICAgb3V0cHV0cy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG4gICAgICAgIHByb3BlcnRpZXMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgbWV0aG9kcyxcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgICAgICBraW5kXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdERpcmVjdGl2ZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICB2YXIgZXhwb3J0QXM7XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzWzBdLnByb3BlcnRpZXM7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocHJvcGVydGllc1tpXS5uYW1lLnRleHQgPT09ICdzZWxlY3RvcicpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgb25seSB3b3JrIGlmIHNlbGVjdG9yIGlzIGluaXRpYWxpemVkIGFzIGEgc3RyaW5nIGxpdGVyYWxcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHByb3BlcnRpZXNbaV0uaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzW2ldLm5hbWUudGV4dCA9PT0gJ2V4cG9ydEFzJykge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBvbmx5IHdvcmsgaWYgc2VsZWN0b3IgaXMgaW5pdGlhbGl6ZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbFxuICAgICAgICAgICAgICAgIGV4cG9ydEFzID0gcHJvcGVydGllc1tpXS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgICAgZXhwb3J0QXNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUGlwZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgIHJldHVybiBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdQaXBlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTW9kdWxlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgcmV0dXJuIGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ05nTW9kdWxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGlyZWN0aXZlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgIHJldHVybiBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9PT0gJ0RpcmVjdGl2ZScgfHwgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPT09ICdDb21wb25lbnQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNTZXJ2aWNlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgcmV0dXJuIGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ0luamVjdGFibGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVOYW1lLCBjbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBzeW1ib2wgPSB0aGlzLnByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKS5nZXRTeW1ib2xBdExvY2F0aW9uKGNsYXNzRGVjbGFyYXRpb24ubmFtZSk7XG4gICAgICAgIHZhciBkZXNjcmlwdGlvbiA9IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhzeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpO1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5uYW1lLnRleHQ7XG4gICAgICAgIHZhciBkaXJlY3RpdmVJbmZvO1xuICAgICAgICB2YXIgbWVtYmVycztcblxuICAgICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRGlyZWN0aXZlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5mbyA9IHRoaXMudmlzaXREaXJlY3RpdmVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogbWVtYmVycy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBtZW1iZXJzLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNTZXJ2aWNlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzUGlwZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pIHx8IHRoaXMuaXNNb2R1bGVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZFxuICAgICAgICAgICAgfV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzKTtcblxuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRFbnVtRGVjbGFyYXRpb24oZmlsZU5hbWUsIG5vZGUpIHtcbiAgICAgICAgaWYoIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZSAmJiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZS50ZXh0ID09PSAnUm91dGVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZFJvdXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0ubmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGdlbmVyYXRlKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcilcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzOiBnZW5lcmF0ZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSb3V0ZUlPKGZpbGVuYW1lLCBzb3VyY2VGaWxlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0RW51bURlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudElPKGZpbGVuYW1lOiBzdHJpbmcsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SW50ZXJmYWNlSU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZSwgbm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5wb3MgPT09IG5vZGUucG9zICYmIHN0YXRlbWVudC5lbmQgPT09IG5vZGUuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRPdXRwdXRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdvdXRwdXRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdwcm92aWRlcnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd2aWV3UHJvdmlkZXJzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnREaXJlY3RpdmVzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZGlyZWN0aXZlcycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICAgICAgaWRlbnRpZmllci5zZWxlY3RvciA9IHRoaXMuZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWUpO1xuICAgICAgICAgICAgaWRlbnRpZmllci5sYWJlbCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgbGV0IG5zTW9kdWxlID0gbmFtZS5zcGxpdCgnLicpLFxuICAgICAgICAgICAgdHlwZSA9IHRoaXMuZ2V0VHlwZShuYW1lKTtcbiAgICAgICAgaWYgKG5zTW9kdWxlLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgLy8gY2FjaGUgZGVwcyB3aXRoIHRoZSBzYW1lIG5hbWVzcGFjZSAoaS5lIFNoYXJlZC4qKVxuICAgICAgICAgICAgaWYgKHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fbnNNb2R1bGVbbnNNb2R1bGVbMF1dLnB1c2gobmFtZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0gPSBbbmFtZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbnM6IG5zTW9kdWxlWzBdLFxuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVVcmxzKHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3RlbXBsYXRlVXJsJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50VGVtcGxhdGUocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIGxldCB0ID0gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndGVtcGxhdGUnLCB0cnVlKS5wb3AoKVxuICAgICAgICBpZih0KSB7XG4gICAgICAgICAgICB0ID0gZGV0ZWN0SW5kZW50KHQsIDApO1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvXFxuLywgJycpO1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvICskL2dtLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVVcmxzKHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3N0eWxlVXJscycpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFN0eWxlcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnc3R5bGVzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRNb2R1bGVJZChwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ21vZHVsZUlkJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRDaGFuZ2VEZXRlY3Rpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdjaGFuZ2VEZXRlY3Rpb24nKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2VuY2Fwc3VsYXRpb24nKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNhbml0aXplVXJscyh1cmxzOiBzdHJpbmdbXSkge1xuICAgICAgICByZXR1cm4gdXJscy5tYXAodXJsID0+IHVybC5yZXBsYWNlKCcuLycsICcnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IE9iamVjdCB7XG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBwYXJzZVByb3BlcnRpZXMgPSAobm9kZTogTm9kZU9iamVjdCk6IE9iamVjdCA9PiB7XG4gICAgICAgICAgICBsZXQgb2JqID0ge307XG4gICAgICAgICAgICAobm9kZS5pbml0aWFsaXplci5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgb2JqW3Byb3AubmFtZS50ZXh0XSA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZGVwcy5tYXAocGFyc2VQcm9wZXJ0aWVzKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogYW55IHtcbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZXBzIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwcyhwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9sVGV4dCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoJy8nKSAhPT0gLTEgJiYgIW11bHRpTGluZSkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnNwbGl0KCcvJykucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgIF07XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGJ1aWxkSWRlbnRpZmllck5hbWUgPSAobm9kZTogTm9kZU9iamVjdCwgbmFtZSA9ICcnKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZSA/IGAuJHtuYW1lfWAgOiBuYW1lO1xuXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVOYW1lID0gdGhpcy51bmtub3duO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLmV4cHJlc3Npb24pIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihub2RlLmV4cHJlc3Npb24uZWxlbWVudHMpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbi5raW5kID09PSB0cy5TeW50YXhLaW5kLkFycmF5TGl0ZXJhbEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi5lbGVtZW50cy5tYXAoIGVsID0+IGVsLnRleHQgKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gYFske25vZGVOYW1lfV1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSAgdHMuU3ludGF4S2luZC5TcHJlYWRFbGVtZW50RXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYC4uLiR7bm9kZU5hbWV9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2J1aWxkSWRlbnRpZmllck5hbWUobm9kZS5leHByZXNzaW9uLCBub2RlTmFtZSl9JHtuYW1lfWBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGAke25vZGUudGV4dH0uJHtuYW1lfWA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24gPSAobzogTm9kZU9iamVjdCk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOlxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiBBUFBfQkFTRV9IUkVGLCB1c2VWYWx1ZTogJy8nIH0sXG4gICAgICAgICAgICAvLyBvclxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiAnRGF0ZScsIHVzZUZhY3Rvcnk6IChkMSwgZDIpID0+IG5ldyBEYXRlKCksIGRlcHM6IFsnZDEnLCAnZDInXSB9XG5cbiAgICAgICAgICAgIGxldCBfZ2VuUHJvdmlkZXJOYW1lOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IF9wcm92aWRlclByb3BzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICAoby5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAnJHtpZGVudGlmaWVyfSdgO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGxhbWJkYSBmdW5jdGlvbiAoaS5lIHVzZUZhY3RvcnkpXG4gICAgICAgICAgICAgICAgaWYgKHByb3AuaW5pdGlhbGl6ZXIuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0gKHByb3AuaW5pdGlhbGl6ZXIucGFyYW1ldGVycyB8fCA8YW55PltdKS5tYXAoKHBhcmFtczogTm9kZU9iamVjdCkgPT4gcGFyYW1zLm5hbWUudGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXIgPSBgKCR7cGFyYW1zLmpvaW4oJywgJyl9KSA9PiB7fWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gZmFjdG9yeSBkZXBzIGFycmF5XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudHMgPSAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cyB8fCBbXSkubWFwKChuOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJyR7bi50ZXh0fSdgO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGBbJHtlbGVtZW50cy5qb2luKCcsICcpfV1gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF9wcm92aWRlclByb3BzLnB1c2goW1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBwcm92aWRlXG4gICAgICAgICAgICAgICAgICAgIHByb3AubmFtZS50ZXh0LFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBPcGFxdWVUb2tlbiBvciAnU3RyaW5nVG9rZW4nXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcblxuICAgICAgICAgICAgICAgIF0uam9pbignOiAnKSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYHsgJHtfcHJvdmlkZXJQcm9wcy5qb2luKCcsICcpfSB9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZVN5bWJvbEVsZW1lbnRzID0gKG86IE5vZGVPYmplY3QgfCBhbnkpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogQW5ndWxhckZpcmVNb2R1bGUuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZylcbiAgICAgICAgICAgIGlmIChvLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSBidWlsZElkZW50aWZpZXJOYW1lKG8uZXhwcmVzc2lvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbiBhcmd1bWVudHMgY291bGQgYmUgcmVhbGx5IGNvbXBsZXhlLiBUaGVyZSBhcmUgc29cbiAgICAgICAgICAgICAgICAvLyBtYW55IHVzZSBjYXNlcyB0aGF0IHdlIGNhbid0IGhhbmRsZS4gSnVzdCBwcmludCBcImFyZ3NcIiB0byBpbmRpY2F0ZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2UgaGF2ZSBhcmd1bWVudHMuXG5cbiAgICAgICAgICAgICAgICBsZXQgZnVuY3Rpb25BcmdzID0gby5hcmd1bWVudHMubGVuZ3RoID4gMCA/ICdhcmdzJyA6ICcnO1xuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gYCR7Y2xhc3NOYW1lfSgke2Z1bmN0aW9uQXJnc30pYDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogU2hhcmVkLk1vZHVsZVxuICAgICAgICAgICAgZWxzZSBpZiAoby5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBidWlsZElkZW50aWZpZXJOYW1lKG8pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gby50ZXh0ID8gby50ZXh0IDogcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24obyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9scyA9IChub2RlOiBOb2RlT2JqZWN0KTogc3RyaW5nW10gPT4ge1xuXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5vZGUuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlU3ltYm9sVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBwYXJzZVN5bWJvbEVsZW1lbnRzKG5vZGUuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMubWFwKHBhcnNlU3ltYm9sRWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVN5bWJvbHMpLnBvcCgpIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlW25hbWVdO1xuICAgIH1cblxufVxuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgTGl2ZVNlcnZlciBmcm9tICdsaXZlLXNlcnZlcic7XG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xuXG5jb25zdCBnbG9iOiBhbnkgPSByZXF1aXJlKCdnbG9iJyk7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBIdG1sRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2h0bWwuZW5naW5lJztcbmltcG9ydCB7IE1hcmtkb3duRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL21hcmtkb3duLmVuZ2luZSc7XG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2ZpbGUuZW5naW5lJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24sIElDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5pbXBvcnQgeyBOZ2RFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvbmdkLmVuZ2luZSc7XG5pbXBvcnQgeyBTZWFyY2hFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvc2VhcmNoLmVuZ2luZSc7XG5pbXBvcnQgeyBEZXBlbmRlbmNpZXMgfSBmcm9tICcuL2NvbXBpbGVyL2RlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBSb3V0ZXJQYXJzZXIgfSBmcm9tICcuLi91dGlscy9yb3V0ZXIucGFyc2VyJztcblxuaW1wb3J0IHsgQ09NUE9ET0NfREVGQVVMVFMgfSBmcm9tICcuLi91dGlscy9kZWZhdWx0cyc7XG5cbmxldCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKSxcbiAgICBjd2QgPSBwcm9jZXNzLmN3ZCgpLFxuICAgICRodG1sZW5naW5lID0gbmV3IEh0bWxFbmdpbmUoKSxcbiAgICAkZmlsZWVuZ2luZSA9IG5ldyBGaWxlRW5naW5lKCksXG4gICAgJG1hcmtkb3duZW5naW5lID0gbmV3IE1hcmtkb3duRW5naW5lKCksXG4gICAgJG5nZGVuZ2luZSA9IG5ldyBOZ2RFbmdpbmUoKSxcbiAgICAkc2VhcmNoRW5naW5lID0gbmV3IFNlYXJjaEVuZ2luZSgpLFxuICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbiB7XG4gICAgb3B0aW9uczpPYmplY3Q7XG4gICAgZmlsZXM6IEFycmF5PHN0cmluZz47XG5cbiAgICBjb25maWd1cmF0aW9uOklDb25maWd1cmF0aW9uO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGNvbXBvZG9jIGFwcGxpY2F0aW9uIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG9wdGlvbnMgdGhhdCBzaG91bGQgYmUgdXNlZC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zPzpPYmplY3QpIHtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiBvcHRpb25zICkge1xuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YVtvcHRpb25dICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YVtvcHRpb25dID0gb3B0aW9uc1tvcHRpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY29tcG9kb2NcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XG4gICAgICAgICRodG1sZW5naW5lLmluaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1BhY2thZ2VKc29uKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEZpbGVzKGZpbGVzOkFycmF5PHN0cmluZz4pIHtcbiAgICAgICAgdGhpcy5maWxlcyA9IGZpbGVzO1xuICAgIH1cblxuICAgIHByb2Nlc3NQYWNrYWdlSnNvbigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBwYWNrYWdlLmpzb24gZmlsZScpO1xuICAgICAgICAkZmlsZWVuZ2luZS5nZXQoJ3BhY2thZ2UuanNvbicpLnRoZW4oKHBhY2thZ2VEYXRhKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UocGFja2FnZURhdGEpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWREYXRhLm5hbWUgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPT09IENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9IHBhcnNlZERhdGEubmFtZSArICcgZG9jdW1lbnRhdGlvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZERhdGEuZGVzY3JpcHRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb24gPSBwYXJzZWREYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhY2thZ2UuanNvbiBmaWxlIGZvdW5kJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bigpO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IHBhY2thZ2UuanNvbiBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bigpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzTWFya2Rvd24oKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdTZWFyY2hpbmcgUkVBRE1FLm1kIGZpbGUnKTtcbiAgICAgICAgJG1hcmtkb3duZW5naW5lLmdldFJlYWRtZUZpbGUoKS50aGVuKChyZWFkbWVEYXRhOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdyZWFkbWUnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJlYWRtZSA9IHJlYWRtZURhdGE7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnUkVBRE1FLm1kIGZpbGUgZm91bmQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IFJFQURNRS5tZCBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnb3ZlcnZpZXcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXNEYXRhKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnR2V0IGRlcGVuZGVuY2llcyBkYXRhJyk7XG5cbiAgICAgICAgbGV0IGNyYXdsZXIgPSBuZXcgRGVwZW5kZW5jaWVzKFxuICAgICAgICAgIHRoaXMuZmlsZXMsIHtcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS5pbml0KGRlcGVuZGVuY2llc0RhdGEpO1xuXG4gICAgICAgIC8vUm91dGVyUGFyc2VyLnByaW50Um91dGVzKCk7XG5cbiAgICAgICAgdGhpcy5wcmVwYXJlTW9kdWxlcygpO1xuXG4gICAgICAgIHRoaXMucHJlcGFyZUNvbXBvbmVudHMoKS50aGVuKChyZWFkbWVEYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVEaXJlY3RpdmVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5pbmplY3RhYmxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlSW5qZWN0YWJsZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlUm91dGVzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnBpcGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVQaXBlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5jbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVDbGFzc2VzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZUludGVyZmFjZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlQ292ZXJhZ2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVNb2R1bGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBtb2R1bGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgIG5hbWU6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdtb2R1bGVzJ1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ21vZHVsZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgbW9kdWxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlUGlwZXMgPSAoKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIHBpcGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UGlwZXMoKTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdwaXBlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3BpcGUnLFxuICAgICAgICAgICAgICAgIHBpcGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlQ2xhc3NlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY2xhc3NlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q2xhc3NlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnY2xhc3NlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgIGNsYXNzOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlSW50ZXJmYWNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgaW50ZXJmYWNlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW50ZXJmYWNlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcy5sZW5ndGg7XG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2ludGVyZmFjZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAgICAgaW50ZXJmYWNlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlQ29tcG9uZW50cygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY29tcG9uZW50cycpO1xuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDb21wb25lbnRzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArICdSRUFETUUubWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUkVBRE1FLm1kIGV4aXN0IGZvciB0aGlzIGNvbXBvbmVudCwgaW5jbHVkZSBpdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHJlYWRtZUZpbGUsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLnJlYWRtZSA9IG1hcmtlZChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRGlyZWN0aXZlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgZGlyZWN0aXZlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0RGlyZWN0aXZlcygpO1xuXG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdkaXJlY3RpdmVzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZUluamVjdGFibGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBpbmplY3RhYmxlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEluamVjdGFibGVzKCk7XG5cbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgICAgIGluamVjdGFibGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlUm91dGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyByb3V0ZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJvdXRlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Um91dGVzKCk7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ3JvdXRlcycsXG4gICAgICAgICAgICBjb250ZXh0OiAncm91dGVzJ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlQ292ZXJhZ2UoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgcmVwb3J0Jyk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogbG9vcCB3aXRoIGNvbXBvbmVudHMsIGNsYXNzZXMsIGluamVjdGFibGVzLCBpbnRlcmZhY2VzLCBwaXBlc1xuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGZpbGVzID0gW10sXG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgIGdldFN0YXR1cyA9IGZ1bmN0aW9uKHBlcmNlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzO1xuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50IDw9IDI1KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdsb3cnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGVyY2VudCA+IDI1ICYmIHBlcmNlbnQgPD0gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ21lZGl1bSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJjZW50ID4gNTAgJiYgcGVyY2VudCA8PSA3NSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnZ29vZCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ3ZlcnktZ29vZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cywgKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY29tcG9uZW50LmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wb25lbnQubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjb21wb25lbnQucHJvcGVydGllc0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5tZXRob2RzQ2xhc3MubGVuZ3RoICsgY29tcG9uZW50LmlucHV0c0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5vdXRwdXRzQ2xhc3MubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5wcm9wZXJ0aWVzQ2xhc3MsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQubWV0aG9kc0NsYXNzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQuaW5wdXRzQ2xhc3MsIChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKGlucHV0LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQub3V0cHV0c0NsYXNzLCAob3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYob3V0cHV0LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcywgKGNsYXNzZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY2xhc3NlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzc2UnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjbGFzc2UubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjbGFzc2UucHJvcGVydGllcy5sZW5ndGggKyBjbGFzc2UubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goY2xhc3NlLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGlmKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICB9KTtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcywgKGluamVjdGFibGUpID0+IHtcbiAgICAgICAgICAgIGxldCBjbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGluamVjdGFibGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW5qZWN0YWJsZS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmplY3RhYmxlLm5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLmxlbmd0aCArIGluamVjdGFibGUubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMsIChpbnRlcikgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW50ZXIuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW50ZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaW50ZXIubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBpbnRlci5wcm9wZXJ0aWVzLmxlbmd0aCArIGludGVyLm1ldGhvZHMubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGludGVyLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbnRlci5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLCAocGlwZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogcGlwZS5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBwaXBlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBpcGUubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSAxO1xuICAgICAgICAgICAgaWYgKHBpcGUuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWxlcyA9IF8uc29ydEJ5KGZpbGVzLCBbJ2ZpbGVQYXRoJ10pO1xuICAgICAgICB2YXIgY292ZXJhZ2VEYXRhID0ge1xuICAgICAgICAgICAgY291bnQ6IE1hdGguZmxvb3IodG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCAvIGZpbGVzLmxlbmd0aCksXG4gICAgICAgICAgICBzdGF0dXM6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGNvdmVyYWdlRGF0YS5zdGF0dXMgPSBnZXRTdGF0dXMoY292ZXJhZ2VEYXRhLmNvdW50KTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ2NvdmVyYWdlJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdjb3ZlcmFnZScsXG4gICAgICAgICAgICBmaWxlczogZmlsZXMsXG4gICAgICAgICAgICBkYXRhOiBjb3ZlcmFnZURhdGFcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1BhZ2VzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlcycpO1xuICAgICAgICBsZXQgcGFnZXMgPSB0aGlzLmNvbmZpZ3VyYXRpb24ucGFnZXMsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHBhZ2VzLmxlbmd0aCxcbiAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgcGFnZScsIHBhZ2VzW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAkaHRtbGVuZ2luZS5yZW5kZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLCBwYWdlc1tpXSkudGhlbigoaHRtbERhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZXNbaV0ucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSBwYWdlc1tpXS5wYXRoICsgJy8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2VzW2ldLm5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5pbmRleFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9zOiBwYWdlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGZpbmFsUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShmaW5hbFBhdGgpLCBodG1sRGF0YSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgJyArIHBhZ2VzW2ldLm5hbWUgKyAnIHBhZ2UgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5nZW5lcmF0ZVNlYXJjaEluZGV4SnNvbih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBc3NldHNGb2xkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXNvdXJjZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICBsb29wKCk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0Fzc2V0c0ZvbGRlcigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgYXNzZXRzIGZvbGRlcicpO1xuXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBQcm92aWRlZCBhc3NldHMgZm9sZGVyICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlcn0gZGlkIG5vdCBleGlzdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1Jlc291cmNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgbWFpbiByZXNvdXJjZXMnKTtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy9yZXNvdXJjZXMvJyksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcmVzb3VyY2VzIGNvcHkgJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmV4dFRoZW1lKSwgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnL3N0eWxlcy8nKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGV4dGVybmFsIHN0eWxpbmcgdGhlbWUgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBjb3B5IHN1Y2NlZWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0dyYXBocygpIHtcblxuICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbmFsVGltZSA9IChuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnRG9jdW1lbnRhdGlvbiBnZW5lcmF0ZWQgaW4gJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnIGluICcgKyBmaW5hbFRpbWUgKyAnIHNlY29uZHMgdXNpbmcgJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSArICcgdGhlbWUnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuc2VydmUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XZWJTZXJ2ZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlR3JhcGgpIHtcblxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0dyYXBoIGdlbmVyYXRpb24gZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBtYWluIGdyYXBoJyk7XG4gICAgICAgICAgICBsZXQgbW9kdWxlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzLFxuICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgbGVuID0gbW9kdWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIG1vZHVsZSBncmFwaCcsIG1vZHVsZXNbaV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJ21vZHVsZXMvJyArIG1vZHVsZXNbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAkbmdkZW5naW5lLnJlbmRlckdyYXBoKG1vZHVsZXNbaV0uZmlsZSwgZmluYWxQYXRoLCAnZicpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZmluYWxNYWluR3JhcGhQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgIGlmKGZpbmFsTWFpbkdyYXBoUGF0aC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGZpbmFsTWFpbkdyYXBoUGF0aCArPSAnLyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbE1haW5HcmFwaFBhdGggKz0gJ2dyYXBoJztcbiAgICAgICAgICAgICRuZ2RlbmdpbmUucmVuZGVyR3JhcGgodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnLCBwYXRoLnJlc29sdmUoZmluYWxNYWluR3JhcGhQYXRoKSwgJ3AnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZ3JhcGggZ2VuZXJhdGlvbjogJywgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW5XZWJTZXJ2ZXIoZm9sZGVyKSB7XG4gICAgICAgIExpdmVTZXJ2ZXIuc3RhcnQoe1xuICAgICAgICAgICAgcm9vdDogZm9sZGVyLFxuICAgICAgICAgICAgb3BlbjogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm9wZW4sXG4gICAgICAgICAgICBxdWlldDogdHJ1ZSxcbiAgICAgICAgICAgIGxvZ0xldmVsOiAwLFxuICAgICAgICAgICAgcG9ydDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBhcHBsaWNhdGlvbiAvIHJvb3QgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIGdldCBhcHBsaWNhdGlvbigpOkFwcGxpY2F0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBnZXQgaXNDTEkoKTpib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSAnLi9hcHAvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4vdXRpbHMvZGVmYXVsdHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyksXG4gICAgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpLFxuICAgIGZpbGVzID0gW10sXG4gICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxuZXhwb3J0IGNsYXNzIENsaUFwcGxpY2F0aW9uIGV4dGVuZHMgQXBwbGljYXRpb25cbntcbiAgICAvKipcbiAgICAgKiBSdW4gY29tcG9kb2MgZnJvbSB0aGUgY29tbWFuZCBsaW5lLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZW5lcmF0ZSgpIHtcblxuICAgICAgICBwcm9ncmFtXG4gICAgICAgICAgICAudmVyc2lvbihwa2cudmVyc2lvbilcbiAgICAgICAgICAgIC51c2FnZSgnPHNyYz4gW29wdGlvbnNdJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1wLCAtLXRzY29uZmlnIFtjb25maWddJywgJ0EgdHNjb25maWcuanNvbiBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1kLCAtLW91dHB1dCBbZm9sZGVyXScsICdXaGVyZSB0byBzdG9yZSB0aGUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQ6IC4vZG9jdW1lbnRhdGlvbiknLCBDT01QT0RPQ19ERUZBVUxUUy5mb2xkZXIpXG4gICAgICAgICAgICAub3B0aW9uKCctYiwgLS1iYXNlIFtiYXNlXScsICdCYXNlIHJlZmVyZW5jZSBvZiBodG1sIHRhZyA8YmFzZT4nLCBDT01QT0RPQ19ERUZBVUxUUy5iYXNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXksIC0tZXh0VGhlbWUgW2ZpbGVdJywgJ0V4dGVybmFsIHN0eWxpbmcgdGhlbWUgZmlsZScpXG4gICAgICAgICAgICAub3B0aW9uKCctbiwgLS1uYW1lIFtuYW1lXScsICdUaXRsZSBkb2N1bWVudGF0aW9uJywgQ09NUE9ET0NfREVGQVVMVFMudGl0bGUpXG4gICAgICAgICAgICAub3B0aW9uKCctYSwgLS1hc3NldHNGb2xkZXIgW2ZvbGRlcl0nLCAnRXh0ZXJuYWwgYXNzZXRzIGZvbGRlciB0byBjb3B5IGluIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIGZvbGRlcicpXG4gICAgICAgICAgICAub3B0aW9uKCctbywgLS1vcGVuJywgJ09wZW4gdGhlIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uJywgZmFsc2UpXG4gICAgICAgICAgICAvLy5vcHRpb24oJy1pLCAtLWluY2x1ZGVzIFtwYXRoXScsICdQYXRoIG9mIGV4dGVybmFsIG1hcmtkb3duIGZpbGVzIHRvIGluY2x1ZGUnKVxuICAgICAgICAgICAgLy8ub3B0aW9uKCctaiwgLS1pbmNsdWRlc05hbWUgW25hbWVdJywgJ05hbWUgb2YgaXRlbSBtZW51IG9mIGV4dGVybmFscyBtYXJrZG93biBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy10LCAtLXNpbGVudCcsICdJbiBzaWxlbnQgbW9kZSwgbG9nIG1lc3NhZ2VzIGFyZW5cXCd0IGxvZ2dlZCBpbiB0aGUgY29uc29sZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXMsIC0tc2VydmUnLCAnU2VydmUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQgaHR0cDovL2xvY2FsaG9zdDo4MDgwLyknLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy1yLCAtLXBvcnQgW3BvcnRdJywgJ0NoYW5nZSBkZWZhdWx0IHNlcnZpbmcgcG9ydCcsIENPTVBPRE9DX0RFRkFVTFRTLnBvcnQpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRoZW1lIFt0aGVtZV0nLCAnQ2hvb3NlIG9uZSBvZiBhdmFpbGFibGUgdGhlbWVzLCBkZWZhdWx0IGlzIFxcJ2dpdGJvb2tcXCcgKGxhcmF2ZWwsIG9yaWdpbmFsLCBwb3N0bWFyaywgcmVhZHRoZWRvY3MsIHN0cmlwZSwgdmFncmFudCknKVxuICAgICAgICAgICAgLm9wdGlvbignLS1oaWRlR2VuZXJhdG9yJywgJ0RvIG5vdCBwcmludCB0aGUgQ29tcG9kb2MgbGluayBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVTb3VyY2VDb2RlJywgJ0RvIG5vdCBhZGQgc291cmNlIGNvZGUgdGFiJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVHcmFwaCcsICdEbyBub3QgYWRkIHRoZSBkZXBlbmRlbmN5IGdyYXBoJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVDb3ZlcmFnZScsICdEbyBub3QgYWRkIHRoZSBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHJlcG9ydCcsIGZhbHNlKVxuICAgICAgICAgICAgLnBhcnNlKHByb2Nlc3MuYXJndik7XG5cbiAgICAgICAgbGV0IG91dHB1dEhlbHAgPSAoKSA9PiB7XG4gICAgICAgICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKVxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ID0gcHJvZ3JhbS5vdXRwdXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5iYXNlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYmFzZSA9IHByb2dyYW0uYmFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmV4dFRoZW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUgPSBwcm9ncmFtLmV4dFRoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0udGhlbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSA9IHByb2dyYW0udGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5uYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID0gcHJvZ3JhbS5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uYXNzZXRzRm9sZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyID0gcHJvZ3JhbS5hc3NldHNGb2xkZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3BlbiA9IHByb2dyYW0ub3BlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgID0gcHJvZ3JhbS5pbmNsdWRlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzTmFtZSAgPSBwcm9ncmFtLmluY2x1ZGVzTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNpbGVudCkge1xuICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5zZXJ2ZSAgPSBwcm9ncmFtLnNlcnZlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ucG9ydCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnQgPSBwcm9ncmFtLnBvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaGlkZUdlbmVyYXRvciA9IHByb2dyYW0uaGlkZUdlbmVyYXRvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVNvdXJjZUNvZGUgPSBwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZUdyYXBoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoID0gcHJvZ3JhbS5kaXNhYmxlR3JhcGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UgPSBwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNlcnZlICYmICFwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICAvLyBpZiAtcyAmIC1kLCBzZXJ2ZSBpdFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0ub3V0cHV0KSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgJHtwcm9ncmFtLm91dHB1dH0gZm9sZGVyIGRvZXNuJ3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3Byb2dyYW0ub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7cHJvZ3JhbS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHN1cGVyLnJ1bldlYlNlcnZlcihwcm9ncmFtLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3JhbS5zZXJ2ZSAmJiAhcHJvZ3JhbS50c2NvbmZpZyAmJiAhcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgICAgIC8vIGlmIG9ubHkgLXMgZmluZCAuL2RvY3VtZW50YXRpb24sIGlmIG9rIHNlcnZlLCBlbHNlIGVycm9yIHByb3ZpZGUgLWRcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLm91dHB1dCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1Byb3ZpZGUgb3V0cHV0IGdlbmVyYXRlZCBmb2xkZXIgd2l0aCAtZCBmbGFnJyk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHtwcm9ncmFtLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3Byb2dyYW0ucG9ydH1gKTtcbiAgICAgICAgICAgICAgICBzdXBlci5ydW5XZWJTZXJ2ZXIocHJvZ3JhbS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHByb2dyYW0uaGlkZUdlbmVyYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5oaWRlR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRlZmF1bHRXYWxrRk9sZGVyID0gY3dkIHx8ICcuJyxcbiAgICAgICAgICAgICAgICB3YWxrID0gKGRpciwgZXhjbHVkZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4Y2x1ZGUuaW5kZXhPZihmaWxlKSA8IDAgJiYgZGlyLmluZGV4T2YoJ25vZGVfbW9kdWxlcycpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUgPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQod2FsayhmaWxlLCBleGNsdWRlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKC8oc3BlY3xcXC5kKVxcLnRzLy50ZXN0KGZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSWdub3JpbmcnLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLnRzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0luY2x1ZGluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0udHNjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignXCJ0c2NvbmZpZy5qc29uXCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeScpO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9maWxlID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKSksXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aC5iYXNlbmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyB0c2NvbmZpZycsIF9maWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHJlcXVpcmUoX2ZpbGUpLmZpbGVzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb2YgdHNjb25maWcuanNvbiBhcyBhIHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICAgIGN3ZCA9IF9maWxlLnNwbGl0KHBhdGguc2VwKS5zbGljZSgwLCAtMSkuam9pbihwYXRoLnNlcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGUgPSByZXF1aXJlKF9maWxlKS5leGNsdWRlIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHdhbGsoY3dkIHx8ICcuJywgZXhjbHVkZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLmdlbmVyYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgZWxzZSBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZUZvbGRlciA9IHByb2dyYW0uYXJnc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFByb3ZpZGVkIHNvdXJjZSBmb2xkZXIgJHtzb3VyY2VGb2xkZXJ9IHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgcHJvdmlkZWQgc291cmNlIGZvbGRlcicpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzID0gd2FsayhwYXRoLnJlc29sdmUoc291cmNlRm9sZGVyKSwgW10pO1xuXG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcigndHNjb25maWcuanNvbiBmaWxlIHdhcyBub3QgZm91bmQsIHBsZWFzZSB1c2UgLXAgZmxhZycpO1xuICAgICAgICAgICAgICAgIG91dHB1dEhlbHAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJndXRpbCIsInJlcXVpcmUiLCJjIiwiY29sb3JzIiwicGtnIiwiTEVWRUwiLCJuYW1lIiwidmVyc2lvbiIsImxvZ2dlciIsImxvZyIsInNpbGVudCIsImFyZ3MiLCJmb3JtYXQiLCJJTkZPIiwiRVJST1IiLCJERUJVRyIsImxldmVsIiwicGFkIiwicyIsImwiLCJBcnJheSIsIk1hdGgiLCJtYXgiLCJsZW5ndGgiLCJqb2luIiwibXNnIiwic2hpZnQiLCJncmVlbiIsImN5YW4iLCJyZWQiLCJMb2dnZXIiLCJBbmd1bGFyQVBJcyIsInR5cGUiLCJfcmVzdWx0IiwiYW5ndWxhck1vZHVsZUFQSXMiLCJhbmd1bGFyTW9kdWxlIiwiaSIsImxlbiIsInRpdGxlIiwiZGF0YSIsIkRlcGVuZGVuY2llc0VuZ2luZSIsIl9pbnN0YW5jZSIsIkVycm9yIiwicmF3RGF0YSIsIm1vZHVsZXMiLCJfIiwiY29tcG9uZW50cyIsImRpcmVjdGl2ZXMiLCJpbmplY3RhYmxlcyIsImludGVyZmFjZXMiLCJyb3V0ZXMiLCJwaXBlcyIsImNsYXNzZXMiLCJmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzIiwiaW5kZXhPZiIsInJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcyIsInJlc3VsdEluQ29tcG9kb2NDbGFzc2VzIiwicmVzdWx0SW5Bbmd1bGFyQVBJcyIsImZpbmRlckluQW5ndWxhckFQSXMiLCIkZGVwZW5kZW5jaWVzRW5naW5lIiwiZ2V0SW5zdGFuY2UiLCJhIiwib3BlcmF0b3IiLCJiIiwib3B0aW9ucyIsImFyZ3VtZW50cyIsInJlc3VsdCIsImludmVyc2UiLCJmbiIsInRleHQiLCJORzJfTU9EVUxFUyIsIm9wdGlvbmFsVmFsdWUiLCJIYW5kbGViYXJzIiwiZXNjYXBlRXhwcmVzc2lvbiIsInJlcGxhY2UiLCJtZXRob2QiLCJtYXAiLCJhcmciLCJmaW5kIiwic291cmNlIiwicGF0aCIsImpzZG9jVGFncyIsInRhZ05hbWUiLCJjb21tZW50IiwidGFncyIsInRhZyIsInR5cGVFeHByZXNzaW9uIiwicGFyYW1ldGVyTmFtZSIsInB1c2giLCJocmVmIiwidGFyZ2V0IiwiSlNPTiIsInN0cmluZ2lmeSIsInBhcnRpYWxzIiwibG9vcCIsInJlc29sdmUiLCJyZWplY3QiLCJfX2Rpcm5hbWUiLCJlcnIiLCJQcm9taXNlIiwibWFpbkRhdGEiLCJwYWdlIiwibyIsInRoYXQiLCJhc3NpZ24iLCJjYWNoZSIsInRlbXBsYXRlIiwicmVuZGVyZXIiLCJSZW5kZXJlciIsImNvZGUiLCJsYW5ndWFnZSIsInZhbGlkTGFuZyIsImhpZ2hsaWdodGpzIiwiZ2V0TGFuZ3VhZ2UiLCJoaWdobGlnaHRlZCIsImhpZ2hsaWdodCIsInZhbHVlIiwic2V0T3B0aW9ucyIsInByb2Nlc3MiLCJjd2QiLCJtYXJrZWQiLCJmaWxlcGF0aCIsIkNPTVBPRE9DX0RFRkFVTFRTIiwiZm9sZGVyIiwidGhlbWUiLCJwb3J0IiwiYmFzZSIsImRpc2FibGVTb3VyY2VDb2RlIiwiZGlzYWJsZUdyYXBoIiwiZGlzYWJsZUNvdmVyYWdlIiwiQ29uZmlndXJhdGlvbiIsIl9wYWdlcyIsInBhZ2VzIiwiX21haW5EYXRhIiwiYmluUGF0aCIsImdsb2JhbEJpblBhdGgiLCJwbGF0Zm9ybSIsInBhdGhuYW1lcyIsImVudiIsIlBBVEgiLCJzcGxpdCIsImV4ZWNQYXRoIiwic3RyaXBUcmFpbGluZ1NlcCIsInRoZVBhdGgiLCJzbGljZSIsInBhdGhJc0luc2lkZSIsInBvdGVudGlhbFBhcmVudCIsInRvTG93ZXJDYXNlIiwibGFzdEluZGV4T2YiLCJ1bmRlZmluZWQiLCJpc1BhdGhJbnNpZGUiLCJhcmd2Iiwib3V0cHV0cGF0aCIsIm5nZFBhdGgiLCJpc0dsb2JhbCIsIk1PREUiLCJ0ZXN0IiwiZmluYWxQYXRoIiwic3Rkb3V0Iiwic3RkZXJyIiwibHVuciIsImNoZWVyaW8iLCJFbnRpdGllcyIsIkFsbEh0bWxFbnRpdGllcyIsIiRjb25maWd1cmF0aW9uIiwiSHRtbCIsInNlYXJjaEluZGV4IiwicmVmIiwiZmllbGQiLCJib29zdCIsIiQiLCJsb2FkIiwiaHRtbCIsImRlY29kZSIsInVybCIsIm91dHB1dCIsImRvYyIsImluZm9zIiwiY29udGV4dCIsImRvY3VtZW50c1N0b3JlIiwiZ2V0U2VhcmNoSW5kZXgiLCJhZGQiLCJvdXRwdXRGb2xkZXIiLCJlcnJvciIsInRzYW55IiwidHMiLCJub2RlIiwiZ2V0SlNEb2NzIiwiYXBwbHkiLCJzdHIiLCJjb3VudCIsImluZGVudCIsInN0cmlwSW5kZW50IiwibWF0Y2giLCJtaW4iLCJ4IiwicmUiLCJSZWdFeHAiLCJyZXBlYXRpbmciLCJuIiwiVHlwZUVycm9yIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJyZXQiLCJpbmRlbnRTdHJpbmciLCJ0cmFuc3BpbGVPcHRpb25zIiwiaW5wdXRGaWxlTmFtZSIsImZpbGVOYW1lIiwianN4IiwiY29tcGlsZXJIb3N0IiwidHNjb25maWdEaXJlY3RvcnkiLCJsaWJTb3VyY2UiLCJmcyIsInRvU3RyaW5nIiwiZSIsImRlYnVnIiwiUm91dGVyUGFyc2VyIiwibW9kdWxlc1RyZWUiLCJyb290TW9kdWxlIiwibW9kdWxlc1dpdGhSb3V0ZXMiLCJyb3V0ZSIsIm1vZHVsZU5hbWUiLCJtb2R1bGVJbXBvcnRzIiwibW9kdWxlIiwiaW1wb3J0cyIsImltcG9ydHNOb2RlIiwiaW5pdGlhbGl6ZXIiLCJlbGVtZW50cyIsImVsZW1lbnQiLCJhcmd1bWVudCIsImNsZWFuTW9kdWxlc1RyZWUiLCJtb2R1bGVzQ2xlYW5lciIsImFyciIsInBhcmVudCIsImNoaWxkcmVuIiwidXRpbCIsImRlcHRoIiwicm91dGVzVHJlZSIsImZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZSIsImxvb3BNb2R1bGVzUGFyc2VyIiwicGFyc2UiLCJraW5kIiwiY2xlYW5lZFJvdXRlc1RyZWUiLCJjbGVhblJvdXRlc1RyZWUiLCJnZXROZXN0ZWRDaGlsZHJlbiIsIm91dCIsImZpcnN0TG9vcE1vZHVsZSIsImltcG9ydE5vZGUiLCJnZW4iLCJ0bXAiLCJ0b2tlbiIsImdldENoaWxkcmVuIiwiZm9yRWFjaCIsInZpc2l0QW5kUmVjb2duaXplIiwiRmlyc3RMaXRlcmFsVG9rZW4iLCJJZGVudGlmaWVyIiwiU3RyaW5nTGl0ZXJhbCIsIkFycmF5TGl0ZXJhbEV4cHJlc3Npb24iLCJJbXBvcnRLZXl3b3JkIiwiRnJvbUtleXdvcmQiLCJFeHBvcnRLZXl3b3JkIiwiQ2xhc3NLZXl3b3JkIiwiVGhpc0tleXdvcmQiLCJDb25zdHJ1Y3RvcktleXdvcmQiLCJGYWxzZUtleXdvcmQiLCJUcnVlS2V5d29yZCIsIk51bGxLZXl3b3JkIiwiQXRUb2tlbiIsIlBsdXNUb2tlbiIsIkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4iLCJPcGVuUGFyZW5Ub2tlbiIsIkltcG9ydENsYXVzZSIsIk9iamVjdExpdGVyYWxFeHByZXNzaW9uIiwiQmxvY2siLCJDbG9zZUJyYWNlVG9rZW4iLCJDbG9zZVBhcmVuVG9rZW4iLCJPcGVuQnJhY2tldFRva2VuIiwiQ2xvc2VCcmFja2V0VG9rZW4iLCJTZW1pY29sb25Ub2tlbiIsIkNvbW1hVG9rZW4iLCJDb2xvblRva2VuIiwiRG90VG9rZW4iLCJEb1N0YXRlbWVudCIsIkRlY29yYXRvciIsIkZpcnN0QXNzaWdubWVudCIsIkZpcnN0UHVuY3R1YXRpb24iLCJQcml2YXRlS2V5d29yZCIsIlB1YmxpY0tleXdvcmQiLCJmaWxlcyIsIkVTNSIsIkNvbW1vbkpTIiwicHJvZ3JhbSIsIl90IiwiZGVwcyIsInNvdXJjZUZpbGVzIiwiZ2V0U291cmNlRmlsZXMiLCJmaWxlIiwiZmlsZVBhdGgiLCJpbmZvIiwiZ2V0U291cmNlRmlsZURlY29yYXRvcnMiLCJzcmNGaWxlIiwib3V0cHV0U3ltYm9scyIsImNsZWFuZXIiLCJwcm9ncmFtQ29tcG9uZW50Iiwic291cmNlRmlsZSIsImdldFNvdXJjZUZpbGUiLCJ0eXBlQ2hlY2tlckNvbXBvbmVudCIsImdldFR5cGVDaGVja2VyIiwiZGVjb3JhdG9ycyIsInZpc2l0Tm9kZSIsInZpc2l0ZWROb2RlIiwiaW5kZXgiLCJtZXRhZGF0YSIsInBvcCIsImdldFN5bWJvbGVOYW1lIiwicHJvcHMiLCJmaW5kUHJvcHMiLCJJTyIsImdldENvbXBvbmVudElPIiwiaXNNb2R1bGUiLCJnZXRNb2R1bGVQcm92aWRlcnMiLCJnZXRNb2R1bGVEZWNsYXRpb25zIiwiZ2V0TW9kdWxlSW1wb3J0cyIsImdldE1vZHVsZUV4cG9ydHMiLCJnZXRNb2R1bGVCb290c3RyYXAiLCJicmVha0xpbmVzIiwiZGVzY3JpcHRpb24iLCJnZXRUZXh0IiwiaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzIiwiYWRkTW9kdWxlV2l0aFJvdXRlcyIsImdldE1vZHVsZUltcG9ydHNSYXciLCJhZGRNb2R1bGUiLCJpc0NvbXBvbmVudCIsImdldENvbXBvbmVudENoYW5nZURldGVjdGlvbiIsImdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24iLCJnZXRDb21wb25lbnRFeHBvcnRBcyIsImdldENvbXBvbmVudEhvc3QiLCJnZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YSIsImdldENvbXBvbmVudE1vZHVsZUlkIiwiZ2V0Q29tcG9uZW50T3V0cHV0cyIsImdldENvbXBvbmVudFByb3ZpZGVycyIsImdldENvbXBvbmVudFNlbGVjdG9yIiwiZ2V0Q29tcG9uZW50U3R5bGVVcmxzIiwiZ2V0Q29tcG9uZW50U3R5bGVzIiwiZ2V0Q29tcG9uZW50VGVtcGxhdGUiLCJnZXRDb21wb25lbnRUZW1wbGF0ZVVybCIsImdldENvbXBvbmVudFZpZXdQcm92aWRlcnMiLCJpbnB1dHMiLCJvdXRwdXRzIiwicHJvcGVydGllcyIsIm1ldGhvZHMiLCJpc0luamVjdGFibGUiLCJpc1BpcGUiLCJpc0RpcmVjdGl2ZSIsIl9fY2FjaGUiLCJmaWx0ZXJCeURlY29yYXRvcnMiLCJleHByZXNzaW9uIiwiZmlsdGVyIiwic3ltYm9sIiwiZmxhZ3MiLCJDbGFzcyIsIkludGVyZmFjZSIsImdldEludGVyZmFjZUlPIiwiZ2V0Um91dGVJTyIsIm5ld1JvdXRlcyIsIkNsYXNzRGVjbGFyYXRpb24iLCJFeHByZXNzaW9uU3RhdGVtZW50IiwicmVzdWx0Tm9kZSIsImZpbmRFeHByZXNzaW9uQnlOYW1lIiwic2V0Um9vdE1vZHVsZSIsInN5bWJvbHMiLCJkIiwiZW50cnlOb2RlIiwiZ2V0U3ltYm9sRGVwcyIsInByb3ZpZGVyTmFtZSIsInBhcnNlRGVlcEluZGVudGlmaWVyIiwiY29tcG9uZW50IiwiZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lIiwiZ2V0U3ltYm9sRGVwc1JhdyIsImdldFN5bWJvbERlcHNPYmplY3QiLCJkZWNvcmF0b3JUeXBlIiwicHJvcGVydHkiLCJpbkRlY29yYXRvciIsImluQXJncyIsInN0cmluZ2lmeURlZmF1bHRWYWx1ZSIsInZpc2l0VHlwZSIsImdldERvY3VtZW50YXRpb25Db21tZW50IiwidHlwZVRvU3RyaW5nIiwiZ2V0VHlwZUF0TG9jYXRpb24iLCJvdXREZWNvcmF0b3IiLCJvdXRBcmdzIiwidHlwZUFyZ3VtZW50cyIsIm1lbWJlciIsIm1vZGlmaWVycyIsImlzUHVibGljIiwic29tZSIsIm1vZGlmaWVyIiwiaXNJbnRlcm5hbE1lbWJlciIsImlzUHJpdmF0ZSIsImludGVybmFsVGFncyIsImpzRG9jIiwibWV0aG9kTmFtZSIsIkFOR1VMQVJfTElGRUNZQ0xFX01FVEhPRFMiLCJwYXJhbWV0ZXJzIiwiX3BhcmFtZXRlcnMiLCJ2aXNpdEFyZ3VtZW50IiwicHJvcCIsImpzZG9jdGFncyIsIl90cyIsImxvY2FsZUNvbXBhcmUiLCJtZW1iZXJzIiwiaW5wdXREZWNvcmF0b3IiLCJnZXREZWNvcmF0b3JPZlR5cGUiLCJ2aXNpdElucHV0IiwidmlzaXRPdXRwdXQiLCJpc1ByaXZhdGVPckludGVybmFsIiwiTWV0aG9kRGVjbGFyYXRpb24iLCJNZXRob2RTaWduYXR1cmUiLCJpc0FuZ3VsYXJMaWZlY3ljbGVIb29rIiwidmlzaXRNZXRob2REZWNsYXJhdGlvbiIsIlByb3BlcnR5RGVjbGFyYXRpb24iLCJQcm9wZXJ0eVNpZ25hdHVyZSIsIkdldEFjY2Vzc29yIiwidmlzaXRQcm9wZXJ0eSIsIkNhbGxTaWduYXR1cmUiLCJ2aXNpdENhbGxEZWNsYXJhdGlvbiIsIkluZGV4U2lnbmF0dXJlIiwidmlzaXRJbmRleERlY2xhcmF0aW9uIiwiQ29uc3RydWN0b3IiLCJfY29uc3RydWN0b3JQcm9wZXJ0aWVzIiwidmlzaXRDb25zdHJ1Y3RvckRlY2xhcmF0aW9uIiwiaiIsInNvcnQiLCJnZXROYW1lc0NvbXBhcmVGbiIsImRlY29yYXRvciIsInNlbGVjdG9yIiwiZXhwb3J0QXMiLCJkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCIsImNsYXNzRGVjbGFyYXRpb24iLCJnZXRTeW1ib2xBdExvY2F0aW9uIiwiY2xhc3NOYW1lIiwiZGlyZWN0aXZlSW5mbyIsImlzRGlyZWN0aXZlRGVjb3JhdG9yIiwidmlzaXREaXJlY3RpdmVEZWNvcmF0b3IiLCJ2aXNpdE1lbWJlcnMiLCJpc1NlcnZpY2VEZWNvcmF0b3IiLCJpc1BpcGVEZWNvcmF0b3IiLCJpc01vZHVsZURlY29yYXRvciIsImRlY2xhcmF0aW9uTGlzdCIsImRlY2xhcmF0aW9ucyIsInR5cGVOYW1lIiwiYWRkUm91dGUiLCJnZW5lcmF0ZSIsImZpbGVuYW1lIiwicmVzIiwic3RhdGVtZW50cyIsInJlZHVjZSIsImRpcmVjdGl2ZSIsInN0YXRlbWVudCIsIlZhcmlhYmxlU3RhdGVtZW50IiwiY29uY2F0IiwidmlzaXRFbnVtRGVjbGFyYXRpb24iLCJ2aXNpdENsYXNzRGVjbGFyYXRpb24iLCJJbnRlcmZhY2VEZWNsYXJhdGlvbiIsInBvcyIsImVuZCIsImlkZW50aWZpZXIiLCJsYWJlbCIsIm5zTW9kdWxlIiwiZ2V0VHlwZSIsIl9fbnNNb2R1bGUiLCJzYW5pdGl6ZVVybHMiLCJ0IiwiZGV0ZWN0SW5kZW50IiwidXJscyIsIm11bHRpTGluZSIsInBhcnNlUHJvcGVydGllcyIsIm9iaiIsInBhcnNlU3ltYm9sVGV4dCIsImJ1aWxkSWRlbnRpZmllck5hbWUiLCJub2RlTmFtZSIsInVua25vd24iLCJlbCIsIlNwcmVhZEVsZW1lbnRFeHByZXNzaW9uIiwicGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24iLCJfZ2VuUHJvdmlkZXJOYW1lIiwiX3Byb3ZpZGVyUHJvcHMiLCJib2R5IiwicGFyYW1zIiwicGFyc2VTeW1ib2xFbGVtZW50cyIsImZ1bmN0aW9uQXJncyIsInBhcnNlU3ltYm9scyIsImdsb2IiLCIkaHRtbGVuZ2luZSIsIkh0bWxFbmdpbmUiLCIkZmlsZWVuZ2luZSIsIkZpbGVFbmdpbmUiLCIkbWFya2Rvd25lbmdpbmUiLCJNYXJrZG93bkVuZ2luZSIsIiRuZ2RlbmdpbmUiLCJOZ2RFbmdpbmUiLCIkc2VhcmNoRW5naW5lIiwiU2VhcmNoRW5naW5lIiwic3RhcnRUaW1lIiwiRGF0ZSIsImNvbmZpZ3VyYXRpb24iLCJnZXRQaXBlcyIsImFkZFBhZ2UiLCJnZXRDbGFzc2VzIiwiZ2V0RGlyZWN0aXZlcyIsIm9wdGlvbiIsImluaXQiLCJ0aGVuIiwicHJvY2Vzc1BhY2thZ2VKc29uIiwiZ2V0IiwicGFja2FnZURhdGEiLCJwYXJzZWREYXRhIiwiZG9jdW1lbnRhdGlvbk1haW5OYW1lIiwiZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbiIsInByb2Nlc3NNYXJrZG93biIsImVycm9yTWVzc2FnZSIsImdldFJlYWRtZUZpbGUiLCJyZWFkbWVEYXRhIiwicmVhZG1lIiwiZ2V0RGVwZW5kZW5jaWVzRGF0YSIsImNyYXdsZXIiLCJEZXBlbmRlbmNpZXMiLCJ0c2NvbmZpZyIsImRlcGVuZGVuY2llc0RhdGEiLCJnZXREZXBlbmRlbmNpZXMiLCJwcmVwYXJlTW9kdWxlcyIsInByZXBhcmVDb21wb25lbnRzIiwicHJlcGFyZURpcmVjdGl2ZXMiLCJwcmVwYXJlSW5qZWN0YWJsZXMiLCJwcmVwYXJlUm91dGVzIiwicHJlcGFyZVBpcGVzIiwicHJlcGFyZUNsYXNzZXMiLCJwcmVwYXJlSW50ZXJmYWNlcyIsInByZXBhcmVDb3ZlcmFnZSIsInByb2Nlc3NQYWdlcyIsImdldE1vZHVsZXMiLCJnZXRJbnRlcmZhY2VzIiwiZ2V0Q29tcG9uZW50cyIsImRpcm5hbWUiLCJyZWFkbWVGaWxlIiwiZ2V0SW5qZWN0YWJsZXMiLCJnZXRSb3V0ZXMiLCJ0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkIiwiZ2V0U3RhdHVzIiwicGVyY2VudCIsInN0YXR1cyIsImNsIiwidG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIiwidG90YWxTdGF0ZW1lbnRzIiwicHJvcGVydGllc0NsYXNzIiwibWV0aG9kc0NsYXNzIiwiaW5wdXRzQ2xhc3MiLCJvdXRwdXRzQ2xhc3MiLCJpbnB1dCIsImNvdmVyYWdlUGVyY2VudCIsImZsb29yIiwiY292ZXJhZ2VDb3VudCIsImNsYXNzZSIsImluamVjdGFibGUiLCJpbnRlciIsInBpcGUiLCJjb3ZlcmFnZURhdGEiLCJyZW5kZXIiLCJodG1sRGF0YSIsImluZGV4UGFnZSIsImdlbmVyYXRlU2VhcmNoSW5kZXhKc29uIiwiYXNzZXRzRm9sZGVyIiwicHJvY2Vzc0Fzc2V0c0ZvbGRlciIsInByb2Nlc3NSZXNvdXJjZXMiLCJleHRUaGVtZSIsInByb2Nlc3NHcmFwaHMiLCJvbkNvbXBsZXRlIiwiZmluYWxUaW1lIiwic2VydmUiLCJydW5XZWJTZXJ2ZXIiLCJyZW5kZXJHcmFwaCIsImZpbmFsTWFpbkdyYXBoUGF0aCIsIm9wZW4iLCJ1c2FnZSIsIm91dHB1dEhlbHAiLCJleGl0IiwiaW5jbHVkZXMiLCJpbmNsdWRlc05hbWUiLCJoaWRlR2VuZXJhdG9yIiwiZGVmYXVsdFdhbGtGT2xkZXIiLCJ3YWxrIiwiZGlyIiwiZXhjbHVkZSIsInJlc3VsdHMiLCJsaXN0Iiwic3RhdCIsImlzRGlyZWN0b3J5IiwiX2ZpbGUiLCJzb3VyY2VGb2xkZXIiLCJBcHBsaWNhdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLFFBQVFDLFFBQVEsV0FBUixDQUFaO0FBQ0EsSUFBSUMsSUFBSUYsTUFBTUcsTUFBZDtBQUNBLElBQUlDLFFBQU1ILFFBQVEsaUJBQVIsQ0FBVjtBQUVBLElBQUtJLEtBQUw7QUFBQSxXQUFLQTsyQkFDSixVQUFBOzRCQUNBLFdBQUE7NEJBQ0csV0FBQTtDQUhKLEVBQUtBLFVBQUFBLFVBQUEsQ0FBTDs7Ozs7O2FBY09DLElBQUwsR0FBWUYsTUFBSUUsSUFBaEI7YUFDS0MsT0FBTCxHQUFlSCxNQUFJRyxPQUFuQjthQUNLQyxNQUFMLEdBQWNSLE1BQU1TLEdBQXBCO2FBQ0tDLE1BQUwsR0FBYyxJQUFkOzs7Ozs7Z0JBSUcsQ0FBQyxLQUFLQSxNQUFULEVBQWlCOzs4Q0FEVkM7Ozs7aUJBRUZILE1BQUwsQ0FDQyxLQUFLSSxNQUFMLGNBQVlQLE1BQU1RLElBQWxCLFNBQTJCRixJQUEzQixFQUREOzs7OztnQkFNRyxDQUFDLEtBQUtELE1BQVQsRUFBaUI7OytDQURUQzs7OztpQkFFSEgsTUFBTCxDQUNDLEtBQUtJLE1BQUwsY0FBWVAsTUFBTVMsS0FBbEIsU0FBNEJILElBQTVCLEVBREQ7Ozs7O2dCQU1HLENBQUMsS0FBS0QsTUFBVCxFQUFpQjs7K0NBRFRDOzs7O2lCQUVISCxNQUFMLENBQ0MsS0FBS0ksTUFBTCxjQUFZUCxNQUFNVSxLQUFsQixTQUE0QkosSUFBNUIsRUFERDs7OzsrQkFLY0s7Z0JBRVZDLE1BQU0sU0FBTkEsR0FBTSxDQUFDQyxDQUFELEVBQUlDLENBQUo7b0JBQU9qQix3RUFBRTs7dUJBQ1hnQixJQUFJRSxNQUFPQyxLQUFLQyxHQUFMLENBQVMsQ0FBVCxFQUFZSCxJQUFJRCxFQUFFSyxNQUFOLEdBQWUsQ0FBM0IsQ0FBUCxFQUFzQ0MsSUFBdEMsQ0FBNEN0QixDQUE1QyxDQUFYO2FBREQ7OytDQUZ3QlM7Ozs7Z0JBTXBCYyxNQUFNZCxLQUFLYSxJQUFMLENBQVUsR0FBVixDQUFWO2dCQUNHYixLQUFLWSxNQUFMLEdBQWMsQ0FBakIsRUFBb0I7c0JBQ1ROLElBQUlOLEtBQUtlLEtBQUwsRUFBSixFQUFrQixFQUFsQixFQUFzQixHQUF0QixDQUFWLFVBQTJDZixLQUFLYSxJQUFMLENBQVUsR0FBVixDQUEzQzs7b0JBSU1SLEtBQVA7cUJBQ01YLE1BQU1RLElBQVg7MEJBQ09YLEVBQUV5QixLQUFGLENBQVFGLEdBQVIsQ0FBTjs7cUJBR0lwQixNQUFNVSxLQUFYOzBCQUNPYixFQUFFMEIsSUFBRixDQUFPSCxHQUFQLENBQU47O3FCQUdJcEIsTUFBTVMsS0FBWDswQkFDT1osRUFBRTJCLEdBQUYsQ0FBTUosR0FBTixDQUFOOzs7bUJBSUssQ0FDTkEsR0FETSxFQUVMRCxJQUZLLENBRUEsRUFGQSxDQUFQOzs7Ozs7QUFNRixBQUFPLElBQUloQixTQUFTLElBQUlzQixNQUFKLEVBQWI7O0FDM0VQLElBQUlDLGNBQWM5QixRQUFRLDJCQUFSLENBQWxCO0FBRUEsNkJBQW9DK0I7UUFDNUJDLFVBQVU7Z0JBQ0YsVUFERTtjQUVKO0tBRlY7YUFLQSxDQUFVRixXQUFWLEVBQXVCLFVBQVNHLGlCQUFULEVBQTRCQyxhQUE1QjtZQUNmQyxJQUFJLENBQVI7WUFDSUMsTUFBTUgsa0JBQWtCWCxNQUQ1QjthQUVLYSxDQUFMLEVBQVFBLElBQUVDLEdBQVYsRUFBZUQsR0FBZixFQUFvQjtnQkFDWkYsa0JBQWtCRSxDQUFsQixFQUFxQkUsS0FBckIsS0FBK0JOLElBQW5DLEVBQXlDO3dCQUM3Qk8sSUFBUixHQUFlTCxrQkFBa0JFLENBQWxCLENBQWY7OztLQUxaO1dBVU9ILE9BQVA7Ozs7Ozs7WUNKT08sbUJBQW1CQyxTQUF0QixFQUFnQztrQkFDdEIsSUFBSUMsS0FBSixDQUFVLG1GQUFWLENBQU47OzJCQUVlRCxTQUFuQixHQUErQixJQUEvQjs7Ozs7NkJBTUNGO2lCQUNJSSxPQUFMLEdBQWVKLElBQWY7aUJBQ0tLLE9BQUwsR0FBZUMsUUFBQSxDQUFTLEtBQUtGLE9BQUwsQ0FBYUMsT0FBdEIsRUFBK0IsQ0FBQyxNQUFELENBQS9CLENBQWY7aUJBQ0tFLFVBQUwsR0FBa0JELFFBQUEsQ0FBUyxLQUFLRixPQUFMLENBQWFHLFVBQXRCLEVBQWtDLENBQUMsTUFBRCxDQUFsQyxDQUFsQjtpQkFDS0MsVUFBTCxHQUFrQkYsUUFBQSxDQUFTLEtBQUtGLE9BQUwsQ0FBYUksVUFBdEIsRUFBa0MsQ0FBQyxNQUFELENBQWxDLENBQWxCO2lCQUNLQyxXQUFMLEdBQW1CSCxRQUFBLENBQVMsS0FBS0YsT0FBTCxDQUFhSyxXQUF0QixFQUFtQyxDQUFDLE1BQUQsQ0FBbkMsQ0FBbkI7aUJBQ0tDLFVBQUwsR0FBa0JKLFFBQUEsQ0FBUyxLQUFLRixPQUFMLENBQWFNLFVBQXRCLEVBQWtDLENBQUMsTUFBRCxDQUFsQyxDQUFsQjtpQkFDS0MsTUFBTCxHQUFjTCxRQUFBLENBQVNBLFVBQUEsQ0FBVyxLQUFLRixPQUFMLENBQWFPLE1BQXhCLEVBQWdDTCxTQUFoQyxDQUFULEVBQXFELENBQUMsTUFBRCxDQUFyRCxDQUFkO2lCQUNLTSxLQUFMLEdBQWFOLFFBQUEsQ0FBUyxLQUFLRixPQUFMLENBQWFRLEtBQXRCLEVBQTZCLENBQUMsTUFBRCxDQUE3QixDQUFiO2lCQUNLQyxPQUFMLEdBQWVQLFFBQUEsQ0FBUyxLQUFLRixPQUFMLENBQWFTLE9BQXRCLEVBQStCLENBQUMsTUFBRCxDQUEvQixDQUFmOzs7O2dDQUVDcEI7Z0JBQ0dxQiwrQkFBK0IsU0FBL0JBLDRCQUErQixDQUFTZCxJQUFUO29CQUMzQk4sVUFBVTs0QkFDRSxVQURGOzBCQUVBO2lCQUZkO29CQUlJRyxJQUFJLENBSlI7b0JBS0lDLE1BQU1FLEtBQUtoQixNQUxmO3FCQU1LYSxDQUFMLEVBQVFBLElBQUVDLEdBQVYsRUFBZUQsR0FBZixFQUFvQjt3QkFDWkosS0FBS3NCLE9BQUwsQ0FBYWYsS0FBS0gsQ0FBTCxFQUFROUIsSUFBckIsTUFBK0IsQ0FBQyxDQUFwQyxFQUF1QztnQ0FDM0JpQyxJQUFSLEdBQWVBLEtBQUtILENBQUwsQ0FBZjs7O3VCQUdESCxPQUFQO2FBWko7Z0JBY0lzQiw4QkFBOEJGLDZCQUE2QixLQUFLTCxXQUFsQyxDQWRsQztnQkFlSVEsMEJBQTBCSCw2QkFBNkIsS0FBS0QsT0FBbEMsQ0FmOUI7Z0JBZ0JJSyxzQkFBc0JDLG9CQUFvQjFCLElBQXBCLENBaEIxQjtnQkFrQkl1Qiw0QkFBNEJoQixJQUE1QixLQUFxQyxJQUF6QyxFQUErQzt1QkFDcENnQiwyQkFBUDthQURKLE1BRU8sSUFBSUMsd0JBQXdCakIsSUFBeEIsS0FBaUMsSUFBckMsRUFBMkM7dUJBQ3ZDaUIsdUJBQVA7YUFERyxNQUVBLElBQUlDLG9CQUFvQmxCLElBQXBCLEtBQTZCLElBQWpDLEVBQXVDO3VCQUNuQ2tCLG1CQUFQOzs7Ozs7bUJBSUcsS0FBS2IsT0FBWjs7Ozs7bUJBR08sS0FBS0UsVUFBWjs7Ozs7bUJBR08sS0FBS0MsVUFBWjs7Ozs7bUJBR08sS0FBS0MsV0FBWjs7Ozs7bUJBR08sS0FBS0MsVUFBWjs7Ozs7bUJBR08sS0FBS0MsTUFBWjs7Ozs7bUJBR08sS0FBS0MsS0FBWjs7Ozs7bUJBR08sS0FBS0MsT0FBWjs7Ozs7bUJBOURPWixtQkFBbUJDLFNBQTFCOzs7Ozs7QUFsQldELDRCQUFBLEdBQStCLElBQUlBLGtCQUFKLEVBQS9CO0FBa0ZsQjtBQUVELEFBQU8sSUFBTW1CLHNCQUFzQm5CLG1CQUFtQm9CLFdBQW5CLEVBQTVCOztBQ3RGUDtBQUNBOzs7O2tCQUdJLEdBQWdCLEVBQWhCOztpQ0FHSSxDQUEyQixTQUEzQixFQUFzQyxVQUFTQyxDQUFULEVBQVlDLFFBQVosRUFBc0JDLENBQXRCLEVBQXlCQyxPQUF6QjtnQkFDaENDLFVBQVUxQyxNQUFWLEdBQW1CLENBQXZCLEVBQTBCO3NCQUNsQixJQUFJbUIsS0FBSixDQUFVLG1EQUFWLENBQU47O2dCQUdFd0IsTUFBSjtvQkFDUUosUUFBUjtxQkFDTyxTQUFMOzZCQUNjQyxFQUFFVCxPQUFGLENBQVVPLENBQVYsTUFBaUIsQ0FBQyxDQUE1Qjs7cUJBRUMsS0FBTDs2QkFDV0EsTUFBTUUsQ0FBZjs7cUJBRUcsS0FBTDs2QkFDV0YsTUFBTUUsQ0FBZjs7cUJBRUcsR0FBTDs2QkFDV0YsSUFBSUUsQ0FBYjs7Ozs4QkFHTSxJQUFJckIsS0FBSixDQUFVLDRDQUE0Q29CLFFBQTVDLEdBQXVELEdBQWpFLENBQU47OztnQkFJQUksV0FBVyxLQUFmLEVBQXNCO3VCQUNiRixRQUFRRyxPQUFSLENBQWdCLElBQWhCLENBQVA7O21CQUVLSCxRQUFRSSxFQUFSLENBQVcsSUFBWCxDQUFQO1NBM0JGO2lDQTZCQSxDQUEwQix1QkFBMUIsRUFBbUQsVUFBU0MsSUFBVCxFQUFlTCxPQUFmO2dCQUN6Q00sY0FBdUIsQ0FDekIsZUFEeUIsRUFFekIsYUFGeUIsRUFHekIsWUFIeUIsRUFJekIsY0FKeUIsQ0FBN0I7Z0JBTUlqQyxNQUFNaUMsWUFBWS9DLE1BTnRCO2dCQU9JYSxJQUFJLENBQVI7Z0JBQ0k4QixTQUFTLEtBRGI7aUJBRUs5QixDQUFMLEVBQVFBLElBQUlDLEdBQVosRUFBaUJELEdBQWpCLEVBQXNCO29CQUNkaUMsS0FBS2YsT0FBTCxDQUFhZ0IsWUFBWWxDLENBQVosQ0FBYixJQUErQixDQUFDLENBQXBDLEVBQXVDOzZCQUMxQixJQUFUOzs7Z0JBR0o4QixNQUFKLEVBQVk7dUJBQ0RGLFFBQVFJLEVBQVIsQ0FBVyxJQUFYLENBQVA7YUFESixNQUVPO3VCQUNJSixRQUFRRyxPQUFSLENBQWdCLElBQWhCLENBQVA7O1NBbEJSO2lDQXFCQSxDQUEwQixPQUExQixFQUFtQyxVQUFTSSxhQUFUO29CQUN6QjlELEdBQVIsQ0FBWSxpQkFBWjtvQkFDUUEsR0FBUixDQUFZLHNCQUFaO29CQUNRQSxHQUFSLENBQVksSUFBWjtnQkFFSThELGFBQUosRUFBbUI7d0JBQ1Q5RCxHQUFSLENBQVksZUFBWjt3QkFDUUEsR0FBUixDQUFZLHNCQUFaO3dCQUNRQSxHQUFSLENBQVk4RCxhQUFaOztTQVJKO2lDQVdBLENBQTBCLFlBQTFCLEVBQXdDLFVBQVNGLElBQVQ7bUJBQzdCRyxnQkFBQSxDQUFpQkMsZ0JBQWpCLENBQWtDSixJQUFsQyxDQUFQO21CQUNPQSxLQUFLSyxPQUFMLENBQWEsZ0JBQWIsRUFBK0IsTUFBL0IsQ0FBUDttQkFDT0wsS0FBS0ssT0FBTCxDQUFhLEtBQWIsRUFBb0IsUUFBcEIsQ0FBUDttQkFDT0wsS0FBS0ssT0FBTCxDQUFhLEtBQWIsRUFBb0IsMEJBQXBCLENBQVA7bUJBQ08sSUFBSUYscUJBQUosQ0FBMEJILElBQTFCLENBQVA7U0FMSjtpQ0FPQSxDQUEwQixZQUExQixFQUF3QyxVQUFTQSxJQUFUO21CQUM3QkcsZ0JBQUEsQ0FBaUJDLGdCQUFqQixDQUFrQ0osSUFBbEMsQ0FBUDttQkFDT0EsS0FBS0ssT0FBTCxDQUFhLElBQWIsRUFBbUIsT0FBbkIsQ0FBUDttQkFDTyxJQUFJRixxQkFBSixDQUEwQkgsSUFBMUIsQ0FBUDtTQUhKO2lDQUtBLENBQTBCLG1CQUExQixFQUErQyxVQUFTTSxNQUFUO2dCQUNyQ2hFLE9BQU9nRSxPQUFPaEUsSUFBUCxDQUFZaUUsR0FBWixDQUFnQixVQUFTQyxHQUFUO29CQUNyQjVDLFVBQVUwQixvQkFBb0JtQixJQUFwQixDQUF5QkQsSUFBSTdDLElBQTdCLENBQWQ7b0JBQ0lDLE9BQUosRUFBYTt3QkFDTEEsUUFBUThDLE1BQVIsS0FBbUIsVUFBdkIsRUFBbUM7NEJBQzNCQyxRQUFPL0MsUUFBUU0sSUFBUixDQUFhUCxJQUF4Qjs0QkFDSUMsUUFBUU0sSUFBUixDQUFhUCxJQUFiLEtBQXNCLE9BQTFCLEVBQW1DZ0QsUUFBTyxRQUFQOytCQUN6QkgsSUFBSXZFLElBQWQscUJBQWtDMEUsS0FBbEMsVUFBMkMvQyxRQUFRTSxJQUFSLENBQWFqQyxJQUF4RCxnQkFBdUV1RSxJQUFJN0MsSUFBM0U7cUJBSEosTUFJTzs0QkFDQ2dELFNBQU8sMkNBQTJDL0MsUUFBUU0sSUFBUixDQUFheUMsSUFBbkU7K0JBQ1VILElBQUl2RSxJQUFkLG1CQUFnQzBFLE1BQWhDLDJCQUEwREgsSUFBSTdDLElBQTlEOztpQkFQUixNQVNPOzJCQUNPNkMsSUFBSXZFLElBQWQsVUFBdUJ1RSxJQUFJN0MsSUFBM0I7O2FBWkssRUFjVlIsSUFkVSxDQWNMLElBZEssQ0FBYjtnQkFlSW1ELE9BQU9yRSxJQUFYLEVBQWlCO3VCQUNIcUUsT0FBT3JFLElBQWpCLFNBQXlCSyxJQUF6QjthQURKLE1BRU87NkJBQ1FBLElBQVg7O1NBbkJSO2lDQXNCQSxDQUEwQix1QkFBMUIsRUFBbUQsVUFBU3NFLFNBQVQsRUFBb0JqQixPQUFwQjtnQkFDM0M1QixJQUFJLENBQVI7Z0JBQ0lDLE1BQU00QyxVQUFVMUQsTUFEcEI7Z0JBRUkyQyxNQUZKO2lCQUdJOUIsQ0FBSixFQUFPQSxJQUFFQyxHQUFULEVBQWNELEdBQWQsRUFBbUI7b0JBQ1g2QyxVQUFVN0MsQ0FBVixFQUFhOEMsT0FBakIsRUFBMEI7d0JBQ2xCRCxVQUFVN0MsQ0FBVixFQUFhOEMsT0FBYixDQUFxQmIsSUFBckIsS0FBOEIsU0FBbEMsRUFBNkM7aUNBQ2hDWSxVQUFVN0MsQ0FBVixFQUFhK0MsT0FBdEI7Ozs7O21CQUtMakIsTUFBUDtTQVpKO2lDQWNBLENBQTBCLGNBQTFCLEVBQTBDLFVBQVNlLFNBQVQsRUFBb0JqQixPQUFwQjtnQkFDbEM1QixJQUFJLENBQVI7Z0JBQ0lDLE1BQU00QyxVQUFVMUQsTUFEcEI7Z0JBRUk2RCxPQUFPLEVBRlg7aUJBR0loRCxDQUFKLEVBQU9BLElBQUVDLEdBQVQsRUFBY0QsR0FBZCxFQUFtQjtvQkFDWDZDLFVBQVU3QyxDQUFWLEVBQWE4QyxPQUFqQixFQUEwQjt3QkFDbEJELFVBQVU3QyxDQUFWLEVBQWE4QyxPQUFiLENBQXFCYixJQUFyQixLQUE4QixPQUFsQyxFQUEyQzs0QkFDbkNnQixNQUFNLEVBQVY7NEJBQ0lKLFVBQVU3QyxDQUFWLEVBQWFrRCxjQUFiLElBQStCTCxVQUFVN0MsQ0FBVixFQUFha0QsY0FBYixDQUE0QnRELElBQTVCLENBQWlDMUIsSUFBcEUsRUFBMEU7Z0NBQ2xFMEIsSUFBSixHQUFXaUQsVUFBVTdDLENBQVYsRUFBYWtELGNBQWIsQ0FBNEJ0RCxJQUE1QixDQUFpQzFCLElBQWpDLENBQXNDK0QsSUFBakQ7OzRCQUVBWSxVQUFVN0MsQ0FBVixFQUFhK0MsT0FBakIsRUFBMEI7Z0NBQ2xCQSxPQUFKLEdBQWNGLFVBQVU3QyxDQUFWLEVBQWErQyxPQUEzQjs7NEJBRUFGLFVBQVU3QyxDQUFWLEVBQWFtRCxhQUFqQixFQUFnQztnQ0FDeEJqRixJQUFKLEdBQVcyRSxVQUFVN0MsQ0FBVixFQUFhbUQsYUFBYixDQUEyQmxCLElBQXRDOzs2QkFFQ21CLElBQUwsQ0FBVUgsR0FBVjs7OztnQkFJUkQsS0FBSzdELE1BQUwsSUFBZSxDQUFuQixFQUFzQjtxQkFDYjZELElBQUwsR0FBWUEsSUFBWjt1QkFDT3BCLFFBQVFJLEVBQVIsQ0FBVyxJQUFYLENBQVA7O1NBdkJSO2lDQTBCQSxDQUEwQixVQUExQixFQUFzQyxVQUFTOUQsSUFBVCxFQUFlMEQsT0FBZjtnQkFDOUIvQixVQUFVMEIsb0JBQW9CbUIsSUFBcEIsQ0FBeUJ4RSxJQUF6QixDQUFkO2dCQUNJMkIsT0FBSixFQUFhO3FCQUNKRCxJQUFMLEdBQVk7eUJBQ0gxQjtpQkFEVDtvQkFHSTJCLFFBQVE4QyxNQUFSLEtBQW1CLFVBQXZCLEVBQW1DO3dCQUMzQjlDLFFBQVFNLElBQVIsQ0FBYVAsSUFBYixLQUFzQixPQUExQixFQUFtQ0MsUUFBUU0sSUFBUixDQUFhUCxJQUFiLEdBQW9CLFFBQXBCO3lCQUM5QkEsSUFBTCxDQUFVeUQsSUFBVixHQUFpQixPQUFPeEQsUUFBUU0sSUFBUixDQUFhUCxJQUFwQixHQUEyQixJQUEzQixHQUFrQ0MsUUFBUU0sSUFBUixDQUFhakMsSUFBL0MsR0FBc0QsT0FBdkU7eUJBQ0swQixJQUFMLENBQVUwRCxNQUFWLEdBQW1CLE9BQW5CO2lCQUhKLE1BSU87eUJBQ0UxRCxJQUFMLENBQVV5RCxJQUFWLEdBQWlCLDJDQUEyQ3hELFFBQVFNLElBQVIsQ0FBYXlDLElBQXpFO3lCQUNLaEQsSUFBTCxDQUFVMEQsTUFBVixHQUFtQixRQUFuQjs7dUJBR0cxQixRQUFRSSxFQUFSLENBQVcsSUFBWCxDQUFQO2FBYkosTUFjTzt1QkFDSUosUUFBUUcsT0FBUixDQUFnQixJQUFoQixDQUFQOztTQWpCUjtpQ0FvQkEsQ0FBMEIsb0JBQTFCLEVBQWdELFVBQVNRLE1BQVQ7Z0JBQ3RDaEUsT0FBT2dFLE9BQU9oRSxJQUFQLENBQVlpRSxHQUFaLENBQWdCO3VCQUFVQyxJQUFJdkUsSUFBZCxVQUF1QnVFLElBQUk3QyxJQUEzQjthQUFoQixFQUFtRFIsSUFBbkQsQ0FBd0QsSUFBeEQsQ0FBYjtnQkFDSW1ELE9BQU9yRSxJQUFYLEVBQWlCO3VCQUNIcUUsT0FBT3JFLElBQWpCLFNBQXlCSyxJQUF6QjthQURKLE1BRU87NkJBQ1FBLElBQVg7O1NBTFI7aUNBUUEsQ0FBMEIsUUFBMUIsRUFBb0MsVUFBUzBELElBQVQ7bUJBQ3pCc0IsS0FBS0MsU0FBTCxDQUFldkIsSUFBZixDQUFQO21CQUNPQSxLQUFLSyxPQUFMLENBQWEsSUFBYixFQUFtQixnQ0FBbkIsQ0FBUDttQkFDT0wsS0FBS0ssT0FBTCxDQUFhLElBQWIsRUFBbUIsZ0NBQW5CLENBQVA7bUJBQ09MLEtBQUtLLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CLENBQVA7bUJBQ08sSUFBSUYscUJBQUosQ0FBMEJILElBQTFCLENBQVA7U0FMSjs7Ozs7O2dCQVNJd0IsV0FBVyxDQUNYLE1BRFcsRUFFWCxVQUZXLEVBR1gsUUFIVyxFQUlYLFNBSlcsRUFLWCxRQUxXLEVBTVgsWUFOVyxFQU9YLFdBUFcsRUFRWCxrQkFSVyxFQVNYLFlBVFcsRUFVWCxXQVZXLEVBV1gsYUFYVyxFQVlYLFlBWlcsRUFhWCxPQWJXLEVBY1gsTUFkVyxFQWVYLFNBZlcsRUFnQlgsT0FoQlcsRUFpQmQsV0FqQmMsRUFrQlgsUUFsQlcsRUFtQlgsZ0JBbkJXLEVBb0JYLGNBcEJXLEVBcUJYLFdBckJXLEVBc0JYLGNBdEJXLEVBdUJYLGdCQXZCVyxFQXdCWCxpQkF4QlcsQ0FBZjtnQkEwQkl6RCxJQUFJLENBMUJSO2dCQTJCSUMsTUFBTXdELFNBQVN0RSxNQTNCbkI7Z0JBNEJJdUUsT0FBTyxTQUFQQSxJQUFPLENBQUNDLFVBQUQsRUFBVUMsTUFBVjtvQkFDQzVELEtBQUtDLE1BQUksQ0FBYixFQUFnQjsrQkFDWixDQUFZMkMsWUFBQSxDQUFhaUIsWUFBWSw2QkFBWixHQUE0Q0osU0FBU3pELENBQVQsQ0FBNUMsR0FBMEQsTUFBdkUsQ0FBWixFQUE0RixNQUE1RixFQUFvRyxVQUFDOEQsR0FBRCxFQUFNM0QsSUFBTjs0QkFDNUYyRCxHQUFKLEVBQVM7OztrREFDVCxDQUEyQkwsU0FBU3pELENBQVQsQ0FBM0IsRUFBd0NHLElBQXhDOzs2QkFFS3dELFVBQUwsRUFBY0MsTUFBZDtxQkFKSjtpQkFESixNQU9POzs7YUFwQ2Y7bUJBMENPLElBQUlHLE9BQUosQ0FBWSxVQUFTSixVQUFULEVBQWtCQyxNQUFsQjtxQkFDVkQsVUFBTCxFQUFjQyxNQUFkO2FBREcsQ0FBUDs7OzsrQkFJR0ksVUFBY0M7Z0JBQ2JDLElBQUlGLFFBQVI7Z0JBQ0lHLE9BQU8sSUFEWDttQkFFT0MsTUFBUCxDQUFjRixDQUFkLEVBQWlCRCxJQUFqQjttQkFDTyxJQUFJRixPQUFKLENBQVksVUFBU0osVUFBVCxFQUFrQkMsTUFBbEI7b0JBQ1pPLEtBQUtFLEtBQUwsQ0FBVyxNQUFYLENBQUgsRUFBdUI7d0JBQ2ZDLFdBQWVsQyxrQkFBQSxDQUFtQitCLEtBQUtFLEtBQUwsQ0FBVyxNQUFYLENBQW5CLENBQW5CO3dCQUNJdkMsU0FBU3dDLFNBQVM7OEJBQ1JKO3FCQURELENBRGI7K0JBSVFwQyxNQUFSO2lCQUxKLE1BTU87K0JBQ0gsQ0FBWWMsWUFBQSxDQUFhaUIsWUFBWSw0QkFBekIsQ0FBWixFQUFvRSxNQUFwRSxFQUE0RSxVQUFDQyxHQUFELEVBQU0zRCxJQUFOOzRCQUNyRTJELEdBQUosRUFBUzttQ0FDRSx3QkFBd0JHLEtBQUsvRixJQUE3QixHQUFvQyxhQUEzQzt5QkFESixNQUVPO2lDQUNFbUcsS0FBTCxDQUFXLE1BQVgsSUFBcUJsRSxJQUFyQjtnQ0FDSW1FLFlBQWVsQyxrQkFBQSxDQUFtQmpDLElBQW5CLENBQW5CO2dDQUNJMkIsV0FBU3dDLFVBQVM7c0NBQ1JKOzZCQURELENBRGI7dUNBSVFwQyxRQUFSOztxQkFUUDs7YUFSRCxDQUFQOzs7O0lBd0JQLEFBRUQ7Ozs7OztZQzNQY3lDLFdBQVcsSUFBSUMsZUFBSixFQUFqQjtpQkFDU0MsSUFBVCxHQUFnQixVQUFDQSxJQUFELEVBQU9DLFFBQVA7Z0JBQ05DLFlBQVksQ0FBQyxFQUFFRCxZQUFZRSxZQUFZQyxXQUFaLENBQXdCSCxRQUF4QixDQUFkLENBQW5CO2dCQUNJSSxjQUFjSCxZQUFZQyxZQUFZRyxTQUFaLENBQXNCTCxRQUF0QixFQUFnQ0QsSUFBaEMsRUFBc0NPLEtBQWxELEdBQTBEUCxJQUE1RTswQkFDY0ssWUFBWXhDLE9BQVosQ0FBb0IsZ0JBQXBCLEVBQXNDLE1BQXRDLENBQWQ7K0NBQ2lDb0MsUUFBakMsVUFBOENJLFdBQTlDO1NBSko7d0JBT09HLFVBQVAsQ0FBa0IsRUFBRVYsa0JBQUYsRUFBbEI7Ozs7OzttQkFHTyxJQUFJUixPQUFKLENBQVksVUFBU0osVUFBVCxFQUFrQkMsTUFBbEI7MkJBQ2YsQ0FBWWhCLFlBQUEsQ0FBYXNDLFFBQVFDLEdBQVIsS0FBZ0IsWUFBN0IsQ0FBWixFQUF3RCxNQUF4RCxFQUFnRSxVQUFDckIsR0FBRCxFQUFNM0QsSUFBTjt3QkFDeEQyRCxHQUFKLEVBQVM7K0JBQ0UscUNBQVA7cUJBREosTUFFTzttQ0FDS3NCLGdCQUFPakYsSUFBUCxDQUFSOztpQkFKUjthQURHLENBQVA7Ozs7SUFVUCxBQUVEOzs7Ozs7Ozs7K0JDdEJRa0Y7bUJBQ08sSUFBSXRCLE9BQUosQ0FBWSxVQUFTSixVQUFULEVBQWtCQyxNQUFsQjsyQkFDaEIsQ0FBWWhCLFlBQUEsQ0FBYXNDLFFBQVFDLEdBQVIsS0FBZ0J2QyxRQUFoQixHQUEyQnlDLFFBQXhDLENBQVosRUFBK0QsTUFBL0QsRUFBdUUsVUFBQ3ZCLEdBQUQsRUFBTTNELElBQU47d0JBQy9EMkQsR0FBSixFQUFTOytCQUNFLGtCQUFrQnVCLFFBQWxCLEdBQTZCLE9BQXBDO3FCQURKLE1BRU87bUNBQ0tsRixJQUFSOztpQkFKUjthQURJLENBQVA7Ozs7SUFVUCxBQUVEOztBQ3JCTyxJQUFNbUYsb0JBQW9CO1dBQ3RCLDJCQURzQjt5QkFFUiwwQkFGUTt5QkFHUiwwQkFIUTtZQUlyQixrQkFKcUI7VUFLdkIsSUFMdUI7V0FNdEIsU0FOc0I7VUFPdkIsR0FQdUI7dUJBUVYsS0FSVTtrQkFTZixLQVRlO3FCQVVaO0NBVmQ7Ozs7OzttQkN1REssR0FBcUIsRUFBckI7c0JBQ0EsR0FBdUI7b0JBQ25CQSxrQkFBa0JDLE1BREM7bUJBRXBCRCxrQkFBa0JFLEtBRkU7c0JBR2pCLEVBSGlCO21CQUlwQixLQUpvQjtrQkFLckJGLGtCQUFrQkcsSUFMRztrQkFNckIsS0FOcUI7MEJBT2IsRUFQYTttQ0FRSkgsa0JBQWtCcEYsS0FSZDswQ0FTRyxFQVRIO2tCQVVyQm9GLGtCQUFrQkksSUFWRzsyQkFXWixLQVhZO3FCQVlsQixFQVprQjtvQkFhbkIsRUFibUI7NkJBY1YsRUFkVTttQkFlcEIsRUFmb0I7cUJBZ0JsQixFQWhCa0I7d0JBaUJmLEVBakJlO3dCQWtCZixFQWxCZTt3QkFtQmYsRUFuQmU7eUJBb0JkLEVBcEJjO29CQXFCbkIsRUFyQm1CO3NCQXNCakIsRUF0QmlCO3NCQXVCakIsS0F2QmlCOytCQXdCUkosa0JBQWtCSyxpQkF4QlY7MEJBeUJiTCxrQkFBa0JNLFlBekJMOzZCQTBCVk4sa0JBQWtCTztTQTFCL0I7WUE4QkRDLGNBQWN6RixTQUFqQixFQUEyQjtrQkFDakIsSUFBSUMsS0FBSixDQUFVLDhFQUFWLENBQU47O3NCQUVVRCxTQUFkLEdBQTBCLElBQTFCOzs7OztnQ0FRSTREO2lCQUNDOEIsTUFBTCxDQUFZM0MsSUFBWixDQUFpQmEsSUFBakI7Ozs7O21CQUlPLEtBQUs4QixNQUFaOzs2QkFFTUM7aUJBQ0RELE1BQUwsR0FBYyxFQUFkOzs7OzttQkFJTyxLQUFLRSxTQUFaOzs2QkFFUzlGO21CQUNGaUUsTUFBUCxDQUFjLEtBQUs2QixTQUFuQixFQUE4QjlGLElBQTlCOzs7OzttQkFsQk8yRixjQUFjekYsU0FBckI7Ozs7OztBQXpDV3lGLHVCQUFBLEdBQTBCLElBQUlBLGFBQUosRUFBMUIsQ0E2RGxCLEFBRUQ7OztRQ2xIUUksT0FBSjtRQUNJQyxnQkFBZ0IsU0FBaEJBLGFBQWdCO1lBQ1JELE9BQUosRUFBYSxPQUFPQSxPQUFQO1lBRVRoQixRQUFRa0IsUUFBUixLQUFxQixPQUF6QixFQUFrQztnQkFDMUJDLFlBQVluQixRQUFRb0IsR0FBUixDQUFZQyxJQUFaLENBQWlCQyxLQUFqQixDQUF1QjVELGNBQXZCLENBQWhCO2dCQUNJM0MsTUFBTW9HLFVBQVVsSCxNQUFwQjtpQkFFSyxJQUFJYSxJQUFJLENBQWIsRUFBZ0JBLElBQUlDLEdBQXBCLEVBQXlCRCxHQUF6QixFQUE4QjtvQkFDdEI0QyxhQUFBLENBQWN5RCxVQUFVckcsQ0FBVixDQUFkLE1BQWdDLEtBQWhDLElBQXlDNEMsYUFBQSxDQUFjeUQsVUFBVXJHLENBQVYsQ0FBZCxNQUFnQyxRQUE3RSxFQUF1Rjs4QkFDekVxRyxVQUFVckcsQ0FBVixDQUFWOzs7U0FOWixNQVNPO3NCQUNPNEMsWUFBQSxDQUFhc0MsUUFBUXVCLFFBQXJCLENBQVY7O2VBR0dQLE9BQVA7S0FqQlI7UUFtQklRLG1CQUFtQixTQUFuQkEsZ0JBQW1CLENBQVNDLE9BQVQ7WUFDWEEsUUFBUUEsUUFBUXhILE1BQVIsR0FBaUIsQ0FBekIsTUFBZ0N5RCxRQUFwQyxFQUE4QzttQkFDbkMrRCxRQUFRQyxLQUFSLENBQWMsQ0FBZCxFQUFpQixDQUFDLENBQWxCLENBQVA7O2VBRUdELE9BQVA7S0F2QlI7UUF5QklFLGVBQWUsU0FBZkEsWUFBZSxDQUFTRixPQUFULEVBQWtCRyxlQUFsQjs7a0JBRURKLGlCQUFpQkMsT0FBakIsQ0FBVjswQkFDa0JELGlCQUFpQkksZUFBakIsQ0FBbEI7O1lBR0k1QixRQUFRa0IsUUFBUixLQUFxQixPQUF6QixFQUFrQztzQkFDcEJPLFFBQVFJLFdBQVIsRUFBVjs4QkFDa0JELGdCQUFnQkMsV0FBaEIsRUFBbEI7O2VBR0dKLFFBQVFLLFdBQVIsQ0FBb0JGLGVBQXBCLEVBQXFDLENBQXJDLE1BQTRDLENBQTVDLEtBRUNILFFBQVFHLGdCQUFnQjNILE1BQXhCLE1BQW9DeUQsUUFBcEMsSUFDQStELFFBQVFHLGdCQUFnQjNILE1BQXhCLE1BQW9DOEgsU0FIckMsQ0FBUDtLQXBDUjtRQTBDSUMsZUFBZSxTQUFmQSxZQUFlLENBQVN6RixDQUFULEVBQVlFLENBQVo7WUFDUGlCLFlBQUEsQ0FBYW5CLENBQWIsQ0FBSjtZQUNJbUIsWUFBQSxDQUFhakIsQ0FBYixDQUFKO1lBRUlGLE1BQU1FLENBQVYsRUFBYTttQkFDRixLQUFQOztlQUdHa0YsYUFBYXBGLENBQWIsRUFBZ0JFLENBQWhCLENBQVA7S0FsRFI7V0FvRE91RixhQUFhaEMsUUFBUWlDLElBQVIsQ0FBYSxDQUFiLEtBQW1CLEVBQWhDLEVBQW9DaEIsbUJBQW1CLEVBQXZELENBQVA7Q0FDSDs7Ozs7Ozs7O29DQzlDZWQsVUFBaUIrQixZQUFvQnhIO21CQUN0QyxJQUFJbUUsT0FBSixDQUFZLFVBQVNKLFVBQVQsRUFBa0JDLE1BQWxCO29CQUNaeUQsVUFBV0MsVUFBRCxHQUFlekQsWUFBWSwyQkFBM0IsR0FBeURBLFlBQVksaUJBQW5GO29CQUNJcUIsUUFBUW9CLEdBQVIsQ0FBWWlCLElBQVosSUFBb0JyQyxRQUFRb0IsR0FBUixDQUFZaUIsSUFBWixLQUFxQixTQUE3QyxFQUF3RDs4QkFDMUMxRCxZQUFZLDJCQUF0Qjs7b0JBRUEsS0FBSzJELElBQUwsQ0FBVUgsT0FBVixDQUFKLEVBQXdCOzhCQUNWQSxRQUFRL0UsT0FBUixDQUFnQixJQUFoQixFQUFzQixJQUF0QixDQUFWOztvQkFFQW1GLFlBQVk3RSxZQUFBLENBQWF5RSxPQUFiLElBQXdCLElBQXhCLEdBQStCekgsSUFBL0IsR0FBc0MsR0FBdEMsR0FBNEN5RixRQUE1QyxHQUF1RCxNQUF2RCxHQUFnRStCLFVBQWhFLEdBQTZFLFlBQTdGOzRCQUNBLENBQWFLLFNBQWIsRUFBd0I7NEJBQ1o7aUJBRFosRUFFRyxVQUFTaEQsSUFBVCxFQUFlaUQsTUFBZixFQUF1QkMsTUFBdkI7d0JBQ0lsRCxTQUFTLENBQVosRUFBZTs7cUJBQWYsTUFFTzsrQkFDSWtELE1BQVA7O2lCQU5SO2FBVEksQ0FBUDs7OztJQW9CUCxBQUVEOztBQzNCQSxJQUFNQyxPQUFZL0osUUFBUSxNQUFSLENBQWxCO0lBQ01nSyxVQUFlaEssUUFBUSxTQUFSLENBRHJCO0lBRU1pSyxXQUFlakssUUFBUSxlQUFSLEVBQXlCa0ssZUFGOUM7SUFHTUMsaUJBQWlCbEMsY0FBY3RFLFdBQWQsRUFIdkI7SUFJTXlHLE9BQU8sSUFBSUgsUUFBSixFQUpiOzs7Ozs7MkJBUUksR0FBeUIsRUFBekI7Ozs7OztnQkFJUSxDQUFDLEtBQUtJLFdBQVYsRUFBdUI7cUJBQ2RBLFdBQUwsR0FBbUJOLEtBQUs7eUJBQ2ZPLEdBQUwsQ0FBUyxLQUFUO3lCQUNLQyxLQUFMLENBQVcsT0FBWCxFQUFvQixFQUFFQyxPQUFPLEVBQVQsRUFBcEI7eUJBQ0tELEtBQUwsQ0FBVyxNQUFYO2lCQUhlLENBQW5COzttQkFNRyxLQUFLRixXQUFaOzs7O2tDQUVNakU7Z0JBQ0ZoQyxJQUFKO2dCQUNJcUcsSUFBSVQsUUFBUVUsSUFBUixDQUFhdEUsS0FBSzFELE9BQWxCLENBRFI7bUJBR08rSCxFQUFFLFVBQUYsRUFBY0UsSUFBZCxFQUFQO21CQUNPUCxLQUFLUSxNQUFMLENBQVl4RyxJQUFaLENBQVA7bUJBQ09BLEtBQUtLLE9BQUwsQ0FBYSxlQUFiLEVBQThCLEVBQTlCLENBQVA7aUJBRUtvRyxHQUFMLEdBQVd6RSxLQUFLeUUsR0FBTCxDQUFTcEcsT0FBVCxDQUFpQjBGLGVBQWVoRSxRQUFmLENBQXdCMkUsTUFBekMsRUFBaUQsRUFBakQsQ0FBWDtnQkFFSUMsTUFBTTtxQkFDRDNFLEtBQUt5RSxHQURKO3VCQUVDekUsS0FBSzRFLEtBQUwsQ0FBV0MsT0FBWCxHQUFxQixLQUFyQixHQUE2QjdFLEtBQUs0RSxLQUFMLENBQVczSyxJQUZ6QztzQkFHQStEO2FBSFY7aUJBTUs4RyxjQUFMLENBQW9CSCxJQUFJRixHQUF4QixJQUErQkUsR0FBL0I7aUJBRUtJLGNBQUwsR0FBc0JDLEdBQXRCLENBQTBCTCxHQUExQjs7OztnREFFb0JNO3dCQUNwQixDQUFhdEcsWUFBQSxDQUFhc0MsUUFBUUMsR0FBUixLQUFnQnZDLFFBQWhCLEdBQTJCc0csWUFBM0IsR0FBMEN0RyxRQUExQyxHQUFxRCxtQkFBbEUsQ0FBYixFQUFxRzt1QkFDMUYsS0FBS29HLGNBQUwsRUFEMEY7dUJBRTFGLEtBQUtEO2FBRmhCLEVBR0csVUFBVWpGLEdBQVY7b0JBQ0lBLEdBQUgsRUFBUTsyQkFDR3FGLEtBQVAsQ0FBYSw0Q0FBYixFQUEyRHJGLEdBQTNEOzthQUxSOzs7O0lBU1AsQUFFRDs7QUN6REEsSUFBTXNGLFFBQVFDLEVBQWQ7O0FBR0EsbUJBQTBCQztXQUNqQkYsTUFBTUcsU0FBTixDQUFnQkMsS0FBaEIsQ0FBc0IsSUFBdEIsRUFBNEIzSCxTQUE1QixDQUFQOzs7QUNLRjtBQUNBO0FBVUEsc0JBQTZCNEgsS0FBS0MsT0FBT0M7UUFDakNDLGNBQWMsU0FBZEEsV0FBYyxDQUFTSCxHQUFUO1lBQ1JJLFFBQVFKLElBQUlJLEtBQUosQ0FBVSxpQkFBVixDQUFkO1lBRUksQ0FBQ0EsS0FBTCxFQUFZO21CQUNESixHQUFQOzs7WUFJRUUsU0FBUzFLLEtBQUs2SyxHQUFMLENBQVNOLEtBQVQsQ0FBZXZLLElBQWYsRUFBcUI0SyxNQUFNckgsR0FBTixDQUFVO21CQUFLdUgsRUFBRTVLLE1BQVA7U0FBVixDQUFyQixDQUFmO1lBQ002SyxLQUFLLElBQUlDLE1BQUosY0FBc0JOLE1BQXRCLFFBQWlDLElBQWpDLENBQVg7ZUFFT0EsU0FBUyxDQUFULEdBQWFGLElBQUluSCxPQUFKLENBQVkwSCxFQUFaLEVBQWdCLEVBQWhCLENBQWIsR0FBbUNQLEdBQTFDO0tBWEo7UUFhSVMsWUFBWSxTQUFaQSxTQUFZLENBQVNDLENBQVQsRUFBWVYsR0FBWjtjQUNOQSxRQUFReEMsU0FBUixHQUFvQixHQUFwQixHQUEwQndDLEdBQWhDO1lBRUksT0FBT0EsR0FBUCxLQUFlLFFBQW5CLEVBQTZCO2tCQUNuQixJQUFJVyxTQUFKLHNEQUFxRVgsR0FBckUseUNBQXFFQSxHQUFyRSxTQUFOOztZQUdBVSxJQUFJLENBQUosSUFBUyxDQUFDRSxPQUFPQyxRQUFQLENBQWdCSCxDQUFoQixDQUFkLEVBQWtDO2tCQUN4QixJQUFJQyxTQUFKLDREQUEwRUQsQ0FBMUUsT0FBTjs7WUFHQUksTUFBTSxFQUFWO1dBRUc7Z0JBQ0tKLElBQUksQ0FBUixFQUFXO3VCQUNBVixHQUFQOzttQkFHR0EsR0FBUDtTQUxKLFFBTVVVLE1BQU0sQ0FOaEI7ZUFRT0ksR0FBUDtLQWxDSjtRQW9DQUMsZUFBZSxTQUFmQSxZQUFlLENBQVNmLEdBQVQsRUFBY0MsS0FBZCxFQUFxQkMsTUFBckI7aUJBQ0ZBLFdBQVcxQyxTQUFYLEdBQXVCLEdBQXZCLEdBQTZCMEMsTUFBdEM7Z0JBQ1FELFVBQVV6QyxTQUFWLEdBQXNCLENBQXRCLEdBQTBCeUMsS0FBbEM7WUFFSSxPQUFPRCxHQUFQLEtBQWUsUUFBbkIsRUFBNkI7a0JBQ25CLElBQUlXLFNBQUosc0RBQXFFWCxHQUFyRSx5Q0FBcUVBLEdBQXJFLFNBQU47O1lBR0EsT0FBT0MsS0FBUCxLQUFpQixRQUFyQixFQUErQjtrQkFDckIsSUFBSVUsU0FBSixzREFBcUVWLEtBQXJFLHlDQUFxRUEsS0FBckUsU0FBTjs7WUFHQSxPQUFPQyxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDO2tCQUN0QixJQUFJUyxTQUFKLHVEQUFzRVQsTUFBdEUseUNBQXNFQSxNQUF0RSxTQUFOOztZQUdBRCxVQUFVLENBQWQsRUFBaUI7bUJBQ05ELEdBQVA7O2lCQUdLQyxRQUFRLENBQVIsR0FBWVEsVUFBVVIsS0FBVixFQUFpQkMsTUFBakIsQ0FBWixHQUF1Q0EsTUFBaEQ7ZUFFT0YsSUFBSW5ILE9BQUosQ0FBWSxhQUFaLEVBQTJCcUgsTUFBM0IsQ0FBUDtLQTFESjtXQTZET2EsYUFBYVosWUFBWUgsR0FBWixDQUFiLEVBQStCQyxTQUFTLENBQXhDLEVBQTJDQyxNQUEzQyxDQUFQOzs7QUFJSixzQkFBNkJjO1FBRW5CQyxnQkFBZ0JELGlCQUFpQkUsUUFBakIsS0FBOEJGLGlCQUFpQkcsR0FBakIsR0FBdUIsWUFBdkIsR0FBc0MsV0FBcEUsQ0FBdEI7UUFFTUMsZUFBZ0M7dUJBQ25CLHVCQUFDRixRQUFEO2dCQUNQQSxTQUFTM0QsV0FBVCxDQUFxQixLQUFyQixNQUFnQyxDQUFDLENBQXJDLEVBQXdDO29CQUNoQzJELGFBQWEsVUFBakIsRUFBNkI7MkJBQ2xCMUQsU0FBUDs7b0JBR0FyRSxlQUFBLENBQWdCK0gsUUFBaEIsTUFBOEIsS0FBbEMsRUFBeUM7K0JBQzFCL0gsU0FBQSxDQUFVNkgsaUJBQWlCSyxpQkFBM0IsRUFBOENILFFBQTlDLENBQVg7O29CQUdBSSxZQUFZLEVBQWhCO29CQUVJO2dDQUNZQyxlQUFBLENBQWdCTCxRQUFoQixFQUEwQk0sUUFBMUIsRUFBWjtpQkFESixDQUdBLE9BQU1DLENBQU4sRUFBUzsyQkFDRUMsS0FBUCxDQUFhRCxDQUFiLEVBQWdCUCxRQUFoQjs7dUJBR0d0QixtQkFBQSxDQUFvQnNCLFFBQXBCLEVBQThCSSxTQUE5QixFQUF5Q04saUJBQWlCbkgsTUFBMUQsRUFBa0UsS0FBbEUsQ0FBUDs7bUJBRUcyRCxTQUFQO1NBdEI4QjttQkF3QnZCLG1CQUFDL0ksSUFBRCxFQUFPK0QsSUFBUCxJQXhCdUI7K0JBeUJYO21CQUFNLFVBQU47U0F6Qlc7bUNBMEJQO21CQUFNLEtBQU47U0ExQk87OEJBMkJaO21CQUFZMEksUUFBWjtTQTNCWTs2QkE0QmI7bUJBQU0sRUFBTjtTQTVCYTtvQkE2QnRCO21CQUFNLElBQU47U0E3QnNCO29CQThCdEIsb0JBQUNBLFFBQUQ7bUJBQXVCQSxhQUFhRCxhQUFwQztTQTlCc0I7a0JBK0J4QjttQkFBTSxFQUFOO1NBL0J3Qjt5QkFnQ2pCO21CQUFNLElBQU47U0FoQ2lCO3dCQWlDbEI7bUJBQU0sRUFBTjs7S0FqQ3BCO1dBbUNPRyxZQUFQOzs7QUMxSEcsSUFBSU8sZUFBZ0I7UUFFbkJ0SyxTQUFTLEVBQWI7UUFDSU4sVUFBVSxFQURkO1FBRUk2SyxXQUZKO1FBR0lDLFVBSEo7UUFJSUMsb0JBQW9CLEVBSnhCO1dBTU87a0JBQ08sa0JBQVNDLEtBQVQ7bUJBQ0NwSSxJQUFQLENBQVlvSSxLQUFaO3FCQUNTL0ssUUFBQSxDQUFTQSxVQUFBLENBQVdLLE1BQVgsRUFBbUJMLFNBQW5CLENBQVQsRUFBd0MsQ0FBQyxNQUFELENBQXhDLENBQVQ7U0FIRDs2QkFLa0IsNkJBQVNnTCxVQUFULEVBQXFCQyxhQUFyQjs4QkFDQ3RJLElBQWxCLENBQXVCO3NCQUNicUksVUFEYTs2QkFFTkM7YUFGakI7Z0NBSW9CakwsUUFBQSxDQUFTQSxVQUFBLENBQVc4SyxpQkFBWCxFQUE4QjlLLFNBQTlCLENBQVQsRUFBbUQsQ0FBQyxNQUFELENBQW5ELENBQXBCO1NBVkQ7bUJBWVEsbUJBQVNnTCxVQUFULEVBQTZCQyxhQUE3QjtvQkFDQ3RJLElBQVIsQ0FBYTtzQkFDSHFJLFVBREc7NkJBRUlDO2FBRmpCO3NCQUlVakwsUUFBQSxDQUFTQSxVQUFBLENBQVdELE9BQVgsRUFBb0JDLFNBQXBCLENBQVQsRUFBeUMsQ0FBQyxNQUFELENBQXpDLENBQVY7U0FqQkQ7dUJBbUJZLHVCQUFTa0wsTUFBVDt5QkFDRUEsTUFBYjtTQXBCRDtxQkFzQlU7OztTQXRCVjtrQ0EwQnVCLGtDQUFTQyxPQUFUO2dCQUNsQjlKLFNBQVMsS0FBYjtnQkFDSTlCLElBQUksQ0FEUjtnQkFFSUMsTUFBTTJMLFFBQVF6TSxNQUZsQjtpQkFHSWEsQ0FBSixFQUFPQSxJQUFFQyxHQUFULEVBQWNELEdBQWQsRUFBbUI7b0JBQ1g0TCxRQUFRNUwsQ0FBUixFQUFXOUIsSUFBWCxDQUFnQmdELE9BQWhCLENBQXdCLHVCQUF4QixNQUFxRCxDQUFDLENBQXRELElBQ0EwSyxRQUFRNUwsQ0FBUixFQUFXOUIsSUFBWCxDQUFnQmdELE9BQWhCLENBQXdCLHNCQUF4QixNQUFvRCxDQUFDLENBRHpELEVBQzREOzZCQUMvQyxJQUFUOzs7bUJBR0RZLE1BQVA7U0FwQ0Q7OEJBc0NtQjs7Z0JBRWQ5QixJQUFJLENBQVI7Z0JBQ0lDLE1BQU1zTCxrQkFBa0JwTSxNQUQ1QjtpQkFFSWEsQ0FBSixFQUFPQSxJQUFFQyxHQUFULEVBQWNELEdBQWQsRUFBbUI7eUJBQ2YsQ0FBVXVMLGtCQUFrQnZMLENBQWxCLEVBQXFCNkwsV0FBL0IsRUFBNEMsVUFBU3ZDLElBQVQ7d0JBQ3BDQSxLQUFLd0MsV0FBVCxFQUFzQjs0QkFDZHhDLEtBQUt3QyxXQUFMLENBQWlCQyxRQUFyQixFQUErQjtxQ0FDM0IsQ0FBVXpDLEtBQUt3QyxXQUFMLENBQWlCQyxRQUEzQixFQUFxQyxVQUFTQyxPQUFUOztvQ0FFN0JBLFFBQVFuSyxTQUFaLEVBQXVCOzZDQUNuQixDQUFVbUssUUFBUW5LLFNBQWxCLEVBQTZCLFVBQVNvSyxRQUFUO2lEQUN6QixDQUFVbkwsTUFBVixFQUFrQixVQUFTMEssS0FBVDtnREFDWFMsU0FBU2hLLElBQVQsSUFBaUJ1SixNQUFNdE4sSUFBTixLQUFlK04sU0FBU2hLLElBQTVDLEVBQWtEO3NEQUN4QzBKLE1BQU4sR0FBZUosa0JBQWtCdkwsQ0FBbEIsRUFBcUI5QixJQUFwQzs7eUNBRlI7cUNBREo7OzZCQUhSOzs7aUJBSFo7O1NBM0NMOzZCQStEa0I7Ozs7O2dCQUtiZ08sbUJBQW1CekwsV0FBQSxDQUFZNEssV0FBWixDQUF2QjtnQkFDSWMsaUJBQWlCLFNBQWpCQSxjQUFpQixDQUFTQyxHQUFUO3FCQUNULElBQUlwTSxDQUFSLElBQWFvTSxHQUFiLEVBQWtCO3dCQUNWQSxJQUFJcE0sQ0FBSixFQUFPNkwsV0FBWCxFQUF3QjsrQkFDYk8sSUFBSXBNLENBQUosRUFBTzZMLFdBQWQ7O3dCQUVBTyxJQUFJcE0sQ0FBSixFQUFPcU0sTUFBWCxFQUFtQjsrQkFDUkQsSUFBSXBNLENBQUosRUFBT3FNLE1BQWQ7O3dCQUVERCxJQUFJcE0sQ0FBSixFQUFPc00sUUFBVixFQUFvQjt1Q0FDREYsSUFBSXBNLENBQUosRUFBT3NNLFFBQXRCOzs7YUFWaEI7MkJBZWVKLGdCQUFmOztvQkFFUTdOLEdBQVIsQ0FBWSxFQUFaO29CQUNRQSxHQUFSLENBQVksMEJBQVosRUFBd0NrTyxZQUFBLENBQWFMLGdCQUFiLEVBQStCLEVBQUVNLE9BQU8sRUFBVCxFQUEvQixDQUF4QztvQkFDUW5PLEdBQVIsQ0FBWSxFQUFaO2dCQUNJb08sYUFBYTtxQkFDUixRQURRO3NCQUVQLFVBRk87c0JBR1BuQixVQUhPOzBCQUlIO2FBSmQ7Z0JBT0lvQiwyQkFBMkIsU0FBM0JBLHdCQUEyQixDQUFTakIsVUFBVDt1QkFDcEJoTCxNQUFBLENBQU9LLE1BQVAsRUFBZSxFQUFDLFVBQVUySyxVQUFYLEVBQWYsQ0FBUDthQURKO2dCQUlJa0Isb0JBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBU3JELElBQVQ7cUJBQ2hCLElBQUl0SixDQUFSLElBQWFzSixLQUFLZ0QsUUFBbEIsRUFBNEI7d0JBQ3BCZCxRQUFRa0IseUJBQXlCcEQsS0FBS2dELFFBQUwsQ0FBY3RNLENBQWQsRUFBaUI5QixJQUExQyxDQUFaO3dCQUNJc04sS0FBSixFQUFXOzhCQUNEMUssTUFBTixHQUFleUMsS0FBS3FKLEtBQUwsQ0FBV3BCLE1BQU1yTCxJQUFqQixDQUFmOytCQUNPcUwsTUFBTXJMLElBQWI7OEJBQ00wTSxJQUFOLEdBQWEsVUFBYjttQ0FDV1AsUUFBWCxDQUFvQmxKLElBQXBCLENBQXlCb0ksS0FBekI7O3dCQUVBbEMsS0FBS2dELFFBQUwsQ0FBY3RNLENBQWQsRUFBaUJzTSxRQUFyQixFQUErQjswQ0FDVGhELEtBQUtnRCxRQUFMLENBQWN0TSxDQUFkLENBQWxCOzs7YUFWWjs4QkFja0JTLE1BQUEsQ0FBT3lMLGdCQUFQLEVBQXlCLEVBQUMsUUFBUVosVUFBVCxFQUF6QixDQUFsQjtvQkFFUWpOLEdBQVIsQ0FBWSxFQUFaO29CQUNRQSxHQUFSLENBQVksY0FBWixFQUE0Qm9PLFVBQTVCO29CQUNRcE8sR0FBUixDQUFZLEVBQVo7O2dCQUlJeU8saUJBQUo7Z0JBRUlDLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBU3ZCLEtBQVQ7cUJBQ2QsSUFBSXhMLENBQVIsSUFBYXdMLE1BQU1jLFFBQW5CLEVBQTZCO3dCQUNyQnhMLFNBQVMwSyxNQUFNYyxRQUFOLENBQWV0TSxDQUFmLEVBQWtCYyxNQUEvQjs0QkFDUXpDLEdBQVIsQ0FBWXlDLE1BQVo7O3VCQUVHMEssS0FBUDthQUxKO2dDQVFvQnVCLGdCQUFnQk4sVUFBaEIsQ0FBcEI7b0JBRVFwTyxHQUFSLENBQVksRUFBWjtvQkFDUUEsR0FBUixDQUFZLHFCQUFaLEVBQW1Da08sWUFBQSxDQUFhTyxpQkFBYixFQUFnQyxFQUFFTixPQUFPLEVBQVQsRUFBaEMsQ0FBbkM7U0F0SUQ7OEJBd0ltQjtnQkFDZFEsb0JBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBU1osR0FBVCxFQUFjQyxNQUFkO29CQUNoQlksTUFBTSxFQUFWO3FCQUNJLElBQUlqTixDQUFSLElBQWFvTSxHQUFiLEVBQWtCO3dCQUNYQSxJQUFJcE0sQ0FBSixFQUFPcU0sTUFBUCxLQUFrQkEsTUFBckIsRUFBNkI7NEJBQ3JCQyxXQUFXVSxrQkFBa0JaLEdBQWxCLEVBQXVCQSxJQUFJcE0sQ0FBSixFQUFPOUIsSUFBOUIsQ0FBZjs0QkFDR29PLFNBQVNuTixNQUFaLEVBQW9CO2dDQUNaYSxDQUFKLEVBQU9zTSxRQUFQLEdBQWtCQSxRQUFsQjs7NEJBRUFsSixJQUFKLENBQVNnSixJQUFJcE0sQ0FBSixDQUFUOzs7dUJBR0RpTixHQUFQO2FBWEo7O3FCQWNBLENBQVV6TSxPQUFWLEVBQW1CLFVBQVMwTSxlQUFUO3lCQUNmLENBQVVBLGdCQUFnQnJCLFdBQTFCLEVBQXVDLFVBQVNzQixVQUFUOzZCQUNuQyxDQUFVM00sT0FBVixFQUFtQixVQUFTbUwsTUFBVDs0QkFDWEEsT0FBT3pOLElBQVAsS0FBZ0JpUCxXQUFXalAsSUFBL0IsRUFBcUM7bUNBQzFCbU8sTUFBUCxHQUFnQmEsZ0JBQWdCaFAsSUFBaEM7O3FCQUZSO2lCQURKO2FBREo7MEJBU2M4TyxrQkFBa0J4TSxPQUFsQixDQUFkOztLQWhLUjtDQVJzQixFQUFuQjs7QUNGUCxJQUFJaUUsT0FBaUIsRUFBckI7QUFFQSxBQUFPLElBQUkySSxNQUFPO1FBQ1ZDLE1BQW1CLEVBQXZCO1dBRU87WUFBQ0MsNEVBQVE7O1lBQ1IsQ0FBQ0EsS0FBTCxFQUFZOzttQkFFRDdJLElBQVA7U0FGSixNQUlLLElBQUk2SSxVQUFVLElBQWQsRUFBb0I7O2lCQUVoQmxLLElBQUwsQ0FBVWlLLElBQUlqTyxJQUFKLENBQVMsRUFBVCxDQUFWO2tCQUNNLEVBQU47U0FIQyxNQUtBO2lCQUNJZ0UsSUFBTCxDQUFVa0ssS0FBVjs7ZUFFRzdJLElBQVA7S0FiSjtDQUhjLEVBQVg7QUFvQlAsa0JBQXlCNkU7V0FDZCxFQUFQO3NCQUNrQkEsSUFBbEI7V0FDTzdFLEtBQUtyRixJQUFMLENBQVUsRUFBVixDQUFQOztBQUdKLDBCQUFBLENBQTJCa0ssSUFBM0I7UUFBc0NrRCw0RUFBUTs7Y0FDaENsRCxJQUFWOztTQUVLaUUsV0FBTCxHQUFtQkMsT0FBbkIsQ0FBMkI7ZUFBS0Msa0JBQWtCM1AsQ0FBbEIsRUFBcUIwTyxLQUFyQixDQUFMO0tBQTNCOztBQUdKLGtCQUFBLENBQW1CbEQsSUFBbkI7O1lBSVlBLEtBQUt1RCxJQUFiO2FBQ1N4RCxhQUFBLENBQWNxRSxpQkFBbkI7YUFDS3JFLGFBQUEsQ0FBY3NFLFVBQW5CO2dCQUNRLElBQUo7Z0JBQ0lyRSxLQUFLckgsSUFBVDtnQkFDSSxJQUFKOzthQUVDb0gsYUFBQSxDQUFjdUUsYUFBbkI7Z0JBQ1EsSUFBSjtnQkFDSXRFLEtBQUtySCxJQUFUO2dCQUNJLElBQUo7O2FBR0NvSCxhQUFBLENBQWN3RSxzQkFBbkI7O2FBSUt4RSxhQUFBLENBQWN5RSxhQUFuQjtnQkFDUSxRQUFKO2dCQUNJLEdBQUo7O2FBRUN6RSxhQUFBLENBQWMwRSxXQUFuQjtnQkFDUSxNQUFKO2dCQUNJLEdBQUo7O2FBRUMxRSxhQUFBLENBQWMyRSxhQUFuQjtnQkFDUSxJQUFKO2dCQUNJLFFBQUo7Z0JBQ0ksR0FBSjs7YUFHQzNFLGFBQUEsQ0FBYzRFLFlBQW5CO2dCQUNRLE9BQUo7Z0JBQ0ksR0FBSjs7YUFFQzVFLGFBQUEsQ0FBYzZFLFdBQW5CO2dCQUNRLE1BQUo7O2FBRUM3RSxhQUFBLENBQWM4RSxrQkFBbkI7Z0JBQ1EsYUFBSjs7YUFHQzlFLGFBQUEsQ0FBYytFLFlBQW5CO2dCQUNRLE9BQUo7O2FBRUMvRSxhQUFBLENBQWNnRixXQUFuQjtnQkFDUSxNQUFKOzthQUVDaEYsYUFBQSxDQUFjaUYsV0FBbkI7Z0JBQ1EsTUFBSjs7YUFHQ2pGLGFBQUEsQ0FBY2tGLE9BQW5COzthQUVLbEYsYUFBQSxDQUFjbUYsU0FBbkI7Z0JBQ1EsR0FBSjs7YUFFQ25GLGFBQUEsQ0FBY29GLHNCQUFuQjtnQkFDUSxNQUFKOzthQUdDcEYsYUFBQSxDQUFjcUYsY0FBbkI7Z0JBQ1EsR0FBSjs7YUFHQ3JGLGFBQUEsQ0FBY3NGLFlBQW5CO2FBQ0t0RixhQUFBLENBQWN1Rix1QkFBbkI7Z0JBQ1EsR0FBSjtnQkFDSSxHQUFKOzthQUVDdkYsYUFBQSxDQUFjd0YsS0FBbkI7Z0JBQ1EsR0FBSjtnQkFDSSxJQUFKOzthQUdDeEYsYUFBQSxDQUFjeUYsZUFBbkI7Z0JBQ1EsR0FBSjs7YUFFQ3pGLGFBQUEsQ0FBYzBGLGVBQW5CO2dCQUNRLEdBQUo7O2FBRUMxRixhQUFBLENBQWMyRixnQkFBbkI7Z0JBQ1EsR0FBSjs7YUFFQzNGLGFBQUEsQ0FBYzRGLGlCQUFuQjtnQkFDUSxHQUFKOzthQUdDNUYsYUFBQSxDQUFjNkYsY0FBbkI7Z0JBQ1EsR0FBSjtnQkFDSSxJQUFKOzthQUVDN0YsYUFBQSxDQUFjOEYsVUFBbkI7Z0JBQ1EsR0FBSjtnQkFDSSxHQUFKOzthQUVDOUYsYUFBQSxDQUFjK0YsVUFBbkI7Z0JBQ1EsR0FBSjtnQkFDSSxHQUFKO2dCQUNJLEdBQUo7O2FBRUMvRixhQUFBLENBQWNnRyxRQUFuQjtnQkFDUSxHQUFKOzthQUVDaEcsYUFBQSxDQUFjaUcsV0FBbkI7O2FBRUtqRyxhQUFBLENBQWNrRyxTQUFuQjs7YUFHS2xHLGFBQUEsQ0FBY21HLGVBQW5CO2dCQUNRLEtBQUo7O2FBRUNuRyxhQUFBLENBQWNvRyxnQkFBbkI7Z0JBQ1EsR0FBSjs7YUFHQ3BHLGFBQUEsQ0FBY3FHLGNBQW5CO2dCQUNRLFNBQUo7Z0JBQ0ksR0FBSjs7YUFFQ3JHLGFBQUEsQ0FBY3NHLGFBQW5CO2dCQUNRLFFBQUo7Z0JBQ0ksR0FBSjs7Ozs7Ozs7MEJDdkVJQyxLQUFaLEVBQTZCaE8sT0FBN0I7OztvQkFKUSxHQUFlLEVBQWY7dUJBQ0EsR0FBa0IsRUFBbEI7b0JBQ0EsR0FBVSxLQUFWO2FBR0NnTyxLQUFMLEdBQWFBLEtBQWI7WUFDTW5GLG1CQUFtQjtvQkFDYnBCLGVBQUEsQ0FBZ0J3RyxHQURIO29CQUVieEcsYUFBQSxDQUFjeUcsUUFGRDsrQkFHRmxPLFFBQVFrSjtTQUgvQjthQUtLaUYsT0FBTCxHQUFlMUcsZ0JBQUEsQ0FBaUIsS0FBS3VHLEtBQXRCLEVBQTZCbkYsZ0JBQTdCLEVBQStDSSxhQUFhSixnQkFBYixDQUEvQyxDQUFmOzs7OzttQ0FHZXhJO2dCQUNYK04sS0FBSy9OLElBQVQ7Z0JBQ0ksT0FBTytOLEVBQVAsS0FBYyxXQUFsQixFQUErQjtxQkFDdEJBLEdBQUcxTixPQUFILENBQVcsUUFBWCxFQUFxQixNQUFyQixDQUFMO3FCQUNLME4sR0FBRzFOLE9BQUgsQ0FBVyxXQUFYLEVBQXdCLEVBQXhCLENBQUw7O21CQUVHME4sRUFBUDs7Ozs7OztnQkFJSUMsT0FBZTsyQkFDSixFQURJOzhCQUVELEVBRkM7K0JBR0EsRUFIQTt5QkFJTixFQUpNOzhCQUtELEVBTEM7MEJBTUwsRUFOSzsyQkFPSixFQVBJOzhCQVFEO2FBUmxCO2dCQVVJQyxjQUFjLEtBQUtILE9BQUwsQ0FBYUksY0FBYixNQUFpQyxFQUFuRDt3QkFFWTNOLEdBQVosQ0FBZ0IsVUFBQzROLElBQUQ7b0JBRVJDLFdBQVdELEtBQUt6RixRQUFwQjtvQkFFSS9ILFlBQUEsQ0FBYXlOLFFBQWIsTUFBMkIsS0FBL0IsRUFBc0M7d0JBRTlCQSxTQUFTckosV0FBVCxDQUFxQixPQUFyQixNQUFrQyxDQUFDLENBQW5DLElBQXdDcUosU0FBU3JKLFdBQVQsQ0FBcUIsU0FBckIsTUFBb0MsQ0FBQyxDQUFqRixFQUFvRjsrQkFDekVzSixJQUFQLENBQVksU0FBWixFQUF1QkQsUUFBdkI7NEJBRUk7a0NBQ0tFLHVCQUFMLENBQTZCSCxJQUE3QixFQUFtQ0gsSUFBbkM7eUJBREosQ0FHQSxPQUFPL0UsQ0FBUCxFQUFVO21DQUNDL0IsS0FBUCxDQUFhK0IsQ0FBYixFQUFnQmtGLEtBQUt6RixRQUFyQjs7Ozt1QkFNTHNGLElBQVA7YUFuQko7Ozs7bUJBMkJPQSxJQUFQOzs7O2dEQUk0Qk8sU0FBd0JDOzs7Z0JBRWhEQyxVQUFVLENBQUN4TCxRQUFRQyxHQUFSLEtBQWdCdkMsUUFBakIsRUFBMkJOLE9BQTNCLENBQW1DLEtBQW5DLEVBQTBDLEdBQTFDLENBQWQ7Z0JBQ0k4TixPQUFPSSxRQUFRN0YsUUFBUixDQUFpQnJJLE9BQWpCLENBQXlCb08sT0FBekIsRUFBa0MsRUFBbEMsQ0FBWDtpQkFFS0MsZ0JBQUwsR0FBd0J0SCxnQkFBQSxDQUFpQixDQUFDK0csSUFBRCxDQUFqQixFQUF5QixFQUF6QixDQUF4QjtnQkFDSVEsYUFBYSxLQUFLRCxnQkFBTCxDQUFzQkUsYUFBdEIsQ0FBb0NULElBQXBDLENBQWpCO2lCQUNLVSxvQkFBTCxHQUE0QixLQUFLSCxnQkFBTCxDQUFzQkksY0FBdEIsQ0FBcUMsSUFBckMsQ0FBNUI7MkJBRUEsQ0FBZ0JQLE9BQWhCLEVBQXlCLFVBQUNsSCxJQUFEO29CQUVqQjJHLE9BQW1CLEVBQXZCO29CQUNJM0csS0FBSzBILFVBQVQsRUFBcUI7d0JBQ2JDLFlBQVksU0FBWkEsU0FBWSxDQUFDQyxXQUFELEVBQWNDLEtBQWQ7NEJBRVJDLFdBQVc5SCxLQUFLMEgsVUFBTCxDQUFnQkssR0FBaEIsRUFBZjs0QkFDSW5ULE9BQU8sT0FBS29ULGNBQUwsQ0FBb0JoSSxJQUFwQixDQUFYOzRCQUNJaUksUUFBUSxPQUFLQyxTQUFMLENBQWVOLFdBQWYsQ0FBWjs0QkFDSU8sS0FBSyxPQUFLQyxjQUFMLENBQW9CdEIsSUFBcEIsRUFBMEJRLFVBQTFCLENBQVQ7NEJBRUksT0FBS2UsUUFBTCxDQUFjUCxRQUFkLENBQUosRUFBNkI7bUNBQ2xCOzBDQUFBO3NDQUVHaEIsSUFGSDsyQ0FHUSxPQUFLd0Isa0JBQUwsQ0FBd0JMLEtBQXhCLENBSFI7OENBSVcsT0FBS00sbUJBQUwsQ0FBeUJOLEtBQXpCLENBSlg7eUNBS00sT0FBS08sZ0JBQUwsQ0FBc0JQLEtBQXRCLENBTE47eUNBTU0sT0FBS1EsZ0JBQUwsQ0FBc0JSLEtBQXRCLENBTk47MkNBT1EsT0FBS1Msa0JBQUwsQ0FBd0JULEtBQXhCLENBUFI7c0NBUUcsUUFSSDs2Q0FTVSxPQUFLVSxVQUFMLENBQWdCUixHQUFHUyxXQUFuQixDQVRWOzRDQVVTdEIsV0FBV3VCLE9BQVg7NkJBVmhCO2dDQVlJL0csYUFBYWdILHdCQUFiLENBQXNDbkMsS0FBS3JFLE9BQTNDLENBQUosRUFBeUQ7NkNBQ3hDeUcsbUJBQWIsQ0FBaUNuVSxJQUFqQyxFQUF1QyxPQUFLb1UsbUJBQUwsQ0FBeUJmLEtBQXpCLENBQXZDOzt5Q0FFU2dCLFNBQWIsQ0FBdUJyVSxJQUF2QixFQUE2QitSLEtBQUtyRSxPQUFsQzswQ0FDYyxTQUFkLEVBQXlCeEksSUFBekIsQ0FBOEI2TSxJQUE5Qjt5QkFqQkosTUFtQkssSUFBSSxPQUFLdUMsV0FBTCxDQUFpQnBCLFFBQWpCLENBQUosRUFBZ0M7Z0NBQzlCRyxNQUFNcFMsTUFBTixLQUFpQixDQUFwQixFQUF1Qjs7bUNBRWhCOzBDQUFBO3NDQUVHaVIsSUFGSDs7aURBSWMsT0FBS3FDLDJCQUFMLENBQWlDbEIsS0FBakMsQ0FKZDsrQ0FLWSxPQUFLbUIseUJBQUwsQ0FBK0JuQixLQUEvQixDQUxaOzswQ0FPTyxPQUFLb0Isb0JBQUwsQ0FBMEJwQixLQUExQixDQVBQO3NDQVFHLE9BQUtxQixnQkFBTCxDQUFzQnJCLEtBQXRCLENBUkg7d0NBU0ssT0FBS3NCLDBCQUFMLENBQWdDdEIsS0FBaEMsQ0FUTDs7MENBV08sT0FBS3VCLG9CQUFMLENBQTBCdkIsS0FBMUIsQ0FYUDt5Q0FZTSxPQUFLd0IsbUJBQUwsQ0FBeUJ4QixLQUF6QixDQVpOOzJDQWFRLE9BQUt5QixxQkFBTCxDQUEyQnpCLEtBQTNCLENBYlI7OzBDQWVPLE9BQUswQixvQkFBTCxDQUEwQjFCLEtBQTFCLENBZlA7MkNBZ0JRLE9BQUsyQixxQkFBTCxDQUEyQjNCLEtBQTNCLENBaEJSO3dDQWlCSyxPQUFLNEIsa0JBQUwsQ0FBd0I1QixLQUF4QixDQWpCTDswQ0FrQk8sT0FBSzZCLG9CQUFMLENBQTBCN0IsS0FBMUIsQ0FsQlA7NkNBbUJVLE9BQUs4Qix1QkFBTCxDQUE2QjlCLEtBQTdCLENBbkJWOytDQW9CWSxPQUFLK0IseUJBQUwsQ0FBK0IvQixLQUEvQixDQXBCWjs2Q0FxQlVFLEdBQUc4QixNQXJCYjs4Q0FzQlc5QixHQUFHK0IsT0F0QmQ7aURBdUJjL0IsR0FBR2dDLFVBdkJqQjs4Q0F3QldoQyxHQUFHaUMsT0F4QmQ7NkNBeUJVLE9BQUt6QixVQUFMLENBQWdCUixHQUFHUyxXQUFuQixDQXpCVjtzQ0EwQkcsV0ExQkg7NENBMkJTdEIsV0FBV3VCLE9BQVg7NkJBM0JoQjswQ0E2QmMsWUFBZCxFQUE0Qi9PLElBQTVCLENBQWlDNk0sSUFBakM7eUJBaENDLE1Ba0NBLElBQUksT0FBSzBELFlBQUwsQ0FBa0J2QyxRQUFsQixDQUFKLEVBQWlDO21DQUMzQjswQ0FBQTtzQ0FFR2hCLElBRkg7c0NBR0csWUFISDs0Q0FJU3FCLEdBQUdnQyxVQUpaO3lDQUtNaEMsR0FBR2lDLE9BTFQ7NkNBTVUsT0FBS3pCLFVBQUwsQ0FBZ0JSLEdBQUdTLFdBQW5CLENBTlY7NENBT1N0QixXQUFXdUIsT0FBWDs2QkFQaEI7MENBU2MsYUFBZCxFQUE2Qi9PLElBQTdCLENBQWtDNk0sSUFBbEM7eUJBVkMsTUFZQSxJQUFJLE9BQUsyRCxNQUFMLENBQVl4QyxRQUFaLENBQUosRUFBMkI7bUNBQ3JCOzBDQUFBO3NDQUVHaEIsSUFGSDtzQ0FHRyxNQUhIOzZDQUlVLE9BQUs2QixVQUFMLENBQWdCUixHQUFHUyxXQUFuQixDQUpWOzRDQUtTdEIsV0FBV3VCLE9BQVg7NkJBTGhCOzBDQU9jLE9BQWQsRUFBdUIvTyxJQUF2QixDQUE0QjZNLElBQTVCO3lCQVJDLE1BVUEsSUFBSSxPQUFLNEQsV0FBTCxDQUFpQnpDLFFBQWpCLENBQUosRUFBZ0M7bUNBQzFCOzBDQUFBO3NDQUVHaEIsSUFGSDtzQ0FHRyxXQUhIOzZDQUlVLE9BQUs2QixVQUFMLENBQWdCUixHQUFHUyxXQUFuQixDQUpWOzRDQUtTdEIsV0FBV3VCLE9BQVg7NkJBTGhCOzBDQU9jLFlBQWQsRUFBNEIvTyxJQUE1QixDQUFpQzZNLElBQWpDOzsrQkFHQzlFLEtBQUwsQ0FBVzhFLElBQVg7K0JBRUs2RCxPQUFMLENBQWE1VixJQUFiLElBQXFCK1IsSUFBckI7cUJBL0ZKO3dCQWtHSThELHFCQUFxQixTQUFyQkEsa0JBQXFCLENBQUN6SyxJQUFEOzRCQUNqQkEsS0FBSzBLLFVBQUwsSUFBbUIxSyxLQUFLMEssVUFBTCxDQUFnQkEsVUFBdkMsRUFBbUQ7cUZBQ1N4TSxJQUFqRCxDQUFzRDhCLEtBQUswSyxVQUFMLENBQWdCQSxVQUFoQixDQUEyQi9SLElBQWpGOzs7K0JBRUosS0FBUDtxQkFKSjt5QkFPSytPLFVBQUwsQ0FDS2lELE1BREwsQ0FDWUYsa0JBRFosRUFFS3ZHLE9BRkwsQ0FFYXlELFNBRmI7aUJBMUdKLE1BOEdLLElBQUkzSCxLQUFLNEssTUFBVCxFQUFpQjt3QkFDZjVLLEtBQUs0SyxNQUFMLENBQVlDLEtBQVosS0FBc0I5SyxjQUFBLENBQWUrSyxLQUF4QyxFQUErQzs0QkFDdkNsVyxPQUFPLE9BQUtvVCxjQUFMLENBQW9CaEksSUFBcEIsQ0FBWDs0QkFDSW1JLEtBQUssT0FBS0MsY0FBTCxDQUFvQnRCLElBQXBCLEVBQTBCUSxVQUExQixDQUFUOytCQUNPO3NDQUFBO2tDQUVHUixJQUZIO2tDQUdHLE9BSEg7d0NBSVNRLFdBQVd1QixPQUFYO3lCQUpoQjs0QkFNR1YsR0FBR2dDLFVBQU4sRUFBa0I7aUNBQ1RBLFVBQUwsR0FBa0JoQyxHQUFHZ0MsVUFBckI7OzRCQUVEaEMsR0FBR1MsV0FBTixFQUFtQjtpQ0FDVkEsV0FBTCxHQUFtQixPQUFLRCxVQUFMLENBQWdCUixHQUFHUyxXQUFuQixDQUFuQjs7NEJBRURULEdBQUdpQyxPQUFOLEVBQWU7aUNBQ05BLE9BQUwsR0FBZWpDLEdBQUdpQyxPQUFsQjs7K0JBRUN2SSxLQUFMLENBQVc4RSxJQUFYO3NDQUNjLFNBQWQsRUFBeUI3TSxJQUF6QixDQUE4QjZNLElBQTlCO3FCQW5CSixNQW9CTyxJQUFHM0csS0FBSzRLLE1BQUwsQ0FBWUMsS0FBWixLQUFzQjlLLGNBQUEsQ0FBZWdMLFNBQXhDLEVBQW1EOzRCQUNsRG5XLFFBQU8sT0FBS29ULGNBQUwsQ0FBb0JoSSxJQUFwQixDQUFYOzRCQUNJbUksTUFBSyxPQUFLNkMsY0FBTCxDQUFvQmxFLElBQXBCLEVBQTBCUSxVQUExQixFQUFzQ3RILElBQXRDLENBQVQ7K0JBQ087dUNBQUE7a0NBRUc4RyxJQUZIO2tDQUdHLFdBSEg7d0NBSVNRLFdBQVd1QixPQUFYO3lCQUpoQjs0QkFNR1YsSUFBR2dDLFVBQU4sRUFBa0I7aUNBQ1RBLFVBQUwsR0FBa0JoQyxJQUFHZ0MsVUFBckI7OzRCQUVEaEMsSUFBRzVFLElBQU4sRUFBWTtpQ0FDSEEsSUFBTCxHQUFZNEUsSUFBRzVFLElBQWY7OzRCQUVENEUsSUFBR1MsV0FBTixFQUFtQjtpQ0FDVkEsV0FBTCxHQUFtQixPQUFLRCxVQUFMLENBQWdCUixJQUFHUyxXQUFuQixDQUFuQjs7NEJBRURULElBQUdpQyxPQUFOLEVBQWU7aUNBQ05BLE9BQUwsR0FBZWpDLElBQUdpQyxPQUFsQjs7K0JBRUN2SSxLQUFMLENBQVc4RSxJQUFYO3NDQUNjLFlBQWQsRUFBNEI3TSxJQUE1QixDQUFpQzZNLElBQWpDOztpQkEzQ0gsTUE2Q0U7d0JBQ0N3QixPQUFLLE9BQUs4QyxVQUFMLENBQWdCbkUsSUFBaEIsRUFBc0JRLFVBQXRCLENBQVQ7d0JBQ0dhLEtBQUczUSxNQUFOLEVBQWM7NEJBQ04wVCxrQkFBSjs0QkFDSTt3Q0FDWWpSLEtBQUtxSixLQUFMLENBQVc2RSxLQUFHM1EsTUFBSCxDQUFVd0IsT0FBVixDQUFrQixLQUFsQixFQUF5QixFQUF6QixDQUFYLENBQVo7eUJBREosQ0FFRSxPQUFPNEksQ0FBUCxFQUFVO21DQUNEL0IsS0FBUCxDQUFhLHdFQUFiO21DQUNPLElBQVA7O3NDQUVVLFFBQWQsZ0NBQThCc0gsY0FBYyxRQUFkLENBQTlCLHFCQUEwRCtELFNBQTFEOzt3QkFFQWxMLEtBQUt1RCxJQUFMLEtBQWN4RCxhQUFBLENBQWNvTCxnQkFBaEMsRUFBa0Q7NEJBQzFDdlcsU0FBTyxPQUFLb1QsY0FBTCxDQUFvQmhJLElBQXBCLENBQVg7NEJBQ0ltSSxPQUFLLE9BQUtDLGNBQUwsQ0FBb0J0QixJQUFwQixFQUEwQlEsVUFBMUIsQ0FBVDsrQkFDTzt3Q0FBQTtrQ0FFR1IsSUFGSDtrQ0FHRyxPQUhIO3dDQUlTUSxXQUFXdUIsT0FBWDt5QkFKaEI7NEJBTUdWLEtBQUdnQyxVQUFOLEVBQWtCO2lDQUNUQSxVQUFMLEdBQWtCaEMsS0FBR2dDLFVBQXJCOzs0QkFFRGhDLEtBQUdTLFdBQU4sRUFBbUI7aUNBQ1ZBLFdBQUwsR0FBbUIsT0FBS0QsVUFBTCxDQUFnQlIsS0FBR1MsV0FBbkIsQ0FBbkI7OzRCQUVEVCxLQUFHaUMsT0FBTixFQUFlO2lDQUNOQSxPQUFMLEdBQWVqQyxLQUFHaUMsT0FBbEI7OytCQUVDdkksS0FBTCxDQUFXOEUsSUFBWDtzQ0FDYyxTQUFkLEVBQXlCN00sSUFBekIsQ0FBOEI2TSxJQUE5Qjs7d0JBRUEzRyxLQUFLdUQsSUFBTCxLQUFjeEQsYUFBQSxDQUFjcUwsbUJBQWhDLEVBQXFEOzs7NEJBRzdDcEosbUJBQUo7NEJBQ0lxSixhQUFhLE9BQUtDLG9CQUFMLENBQTBCdEwsSUFBMUIsRUFBZ0MsaUJBQWhDLENBRGpCOzRCQUVHcUwsVUFBSCxFQUFlO2dDQUNSQSxXQUFXOVMsU0FBWCxDQUFxQjFDLE1BQXJCLEdBQThCLENBQWpDLEVBQW9DO3lDQUNoQyxDQUFVd1YsV0FBVzlTLFNBQXJCLEVBQWdDLFVBQVNvSyxRQUFUO3dDQUN6QkEsU0FBU2hLLElBQVosRUFBa0I7cURBQ0RnSyxTQUFTaEssSUFBdEI7O2lDQUZSOztnQ0FNQXFKLFVBQUosRUFBZ0I7NkNBQ0N1SixhQUFiLENBQTJCdkosVUFBM0I7Ozs7O2FBN01wQjs7Ozs4QkFxTlUyRTttQkFDSDlFLEtBQVAsQ0FBYSxPQUFiLEVBQXlCOEUsS0FBSy9SLElBQTlCO2FBRUksU0FESixFQUNlLFNBRGYsRUFDMEIsY0FEMUIsRUFDMEMsV0FEMUMsRUFDdUQsV0FEdkQsRUFFRXNQLE9BRkYsQ0FFVTtvQkFDRnlDLEtBQUs2RSxPQUFMLEtBQWlCN0UsS0FBSzZFLE9BQUwsRUFBYzNWLE1BQWQsR0FBdUIsQ0FBNUMsRUFBK0M7MkJBQ3BDZ00sS0FBUCxDQUFhLEVBQWIsU0FBc0IySixPQUF0Qjt5QkFDS0EsT0FBTCxFQUFjdFMsR0FBZCxDQUFrQjsrQkFBS3hDLEVBQUU5QixJQUFQO3FCQUFsQixFQUErQnNQLE9BQS9CLENBQXVDOytCQUM1QnJDLEtBQVAsQ0FBYSxFQUFiLFdBQXdCNEosQ0FBeEI7cUJBREo7O2FBTFI7Ozs7NkNBYXlCQyxXQUFXOVc7Z0JBQ2hDNEQsZUFBSjtnQkFDSTRCLE9BQU8sU0FBUEEsSUFBTyxDQUFTNEYsSUFBVCxFQUFlcEwsSUFBZjtvQkFDQW9MLEtBQUswSyxVQUFMLElBQW1CLENBQUMxSyxLQUFLMEssVUFBTCxDQUFnQjlWLElBQXZDLEVBQTZDO3lCQUNwQ29MLEtBQUswSyxVQUFWLEVBQXNCOVYsSUFBdEI7O29CQUVEb0wsS0FBSzBLLFVBQUwsSUFBbUIxSyxLQUFLMEssVUFBTCxDQUFnQjlWLElBQXRDLEVBQTRDO3dCQUNyQ29MLEtBQUswSyxVQUFMLENBQWdCOVYsSUFBaEIsQ0FBcUIrRCxJQUFyQixLQUE4Qi9ELElBQWpDLEVBQXVDO2lDQUMxQm9MLElBQVQ7OzthQVBoQjtpQkFXSzBMLFNBQUwsRUFBZ0I5VyxJQUFoQjttQkFDTzRELE1BQVA7Ozs7b0NBR2dCc1A7bUJBQ1RBLFNBQVM0QyxVQUFULENBQW9CQSxVQUFwQixDQUErQi9SLElBQS9CLEtBQXdDLFdBQS9DOzs7OytCQUdXbVA7bUJBQ0pBLFNBQVM0QyxVQUFULENBQW9CQSxVQUFwQixDQUErQi9SLElBQS9CLEtBQXdDLE1BQS9DOzs7O29DQUdnQm1QO21CQUNUQSxTQUFTNEMsVUFBVCxDQUFvQkEsVUFBcEIsQ0FBK0IvUixJQUEvQixLQUF3QyxXQUEvQzs7OztxQ0FHaUJtUDttQkFDVkEsU0FBUzRDLFVBQVQsQ0FBb0JBLFVBQXBCLENBQStCL1IsSUFBL0IsS0FBd0MsWUFBL0M7Ozs7aUNBR2FtUDttQkFDTkEsU0FBUzRDLFVBQVQsQ0FBb0JBLFVBQXBCLENBQStCL1IsSUFBL0IsS0FBd0MsVUFBL0M7Ozs7Z0NBR1kvRDtnQkFDUjBCLGFBQUo7Z0JBQ0kxQixLQUFLNkksV0FBTCxHQUFtQjdGLE9BQW5CLENBQTJCLFdBQTNCLE1BQTRDLENBQUMsQ0FBakQsRUFBcUQ7dUJBQzFDLFdBQVA7YUFESixNQUVPLElBQUloRCxLQUFLNkksV0FBTCxHQUFtQjdGLE9BQW5CLENBQTJCLE1BQTNCLE1BQXVDLENBQUMsQ0FBNUMsRUFBZ0Q7dUJBQzVDLE1BQVA7YUFERyxNQUVBLElBQUloRCxLQUFLNkksV0FBTCxHQUFtQjdGLE9BQW5CLENBQTJCLFFBQTNCLE1BQXlDLENBQUMsQ0FBOUMsRUFBa0Q7dUJBQzlDLFFBQVA7YUFERyxNQUVBLElBQUloRCxLQUFLNkksV0FBTCxHQUFtQjdGLE9BQW5CLENBQTJCLFdBQTNCLE1BQTRDLENBQUMsQ0FBakQsRUFBcUQ7dUJBQ2pELFdBQVA7O21CQUVHdEIsSUFBUDs7Ozt1Q0FHbUIwSjttQkFDWkEsS0FBS3BMLElBQUwsQ0FBVStELElBQWpCOzs7OzZDQUd5QnNQO21CQUNsQixLQUFLMEQsYUFBTCxDQUFtQjFELEtBQW5CLEVBQTBCLFVBQTFCLEVBQXNDRixHQUF0QyxFQUFQOzs7OzZDQUd5QkU7bUJBQ2xCLEtBQUswRCxhQUFMLENBQW1CMUQsS0FBbkIsRUFBMEIsVUFBMUIsRUFBc0NGLEdBQXRDLEVBQVA7Ozs7MkNBR3VCRTs7O21CQUNoQixLQUFLMEQsYUFBTCxDQUFtQjFELEtBQW5CLEVBQTBCLFdBQTFCLEVBQXVDL08sR0FBdkMsQ0FBMkMsVUFBQzBTLFlBQUQ7dUJBQ3ZDLE9BQUtDLG9CQUFMLENBQTBCRCxZQUExQixDQUFQO2FBREcsQ0FBUDs7OztrQ0FLY2hFO2dCQUNYQSxZQUFZOEMsVUFBWixDQUF1Qm5TLFNBQXZCLENBQWlDMUMsTUFBakMsR0FBMEMsQ0FBN0MsRUFBZ0Q7dUJBQ3JDK1IsWUFBWThDLFVBQVosQ0FBdUJuUyxTQUF2QixDQUFpQ3dQLEdBQWpDLEdBQXVDb0MsVUFBOUM7YUFESixNQUVPO3VCQUNJLEVBQVA7Ozs7OzRDQUlvQmxDOzs7bUJBQ2pCLEtBQUswRCxhQUFMLENBQW1CMUQsS0FBbkIsRUFBMEIsY0FBMUIsRUFBMEMvTyxHQUExQyxDQUE4QyxVQUFDdEUsSUFBRDtvQkFDN0NrWCxZQUFZLE9BQUtDLDJCQUFMLENBQWlDblgsSUFBakMsQ0FBaEI7b0JBRUlrWCxTQUFKLEVBQWU7MkJBQ0pBLFNBQVA7O3VCQUdHLE9BQUtELG9CQUFMLENBQTBCalgsSUFBMUIsQ0FBUDthQVBHLENBQVA7Ozs7NENBV3dCcVQ7bUJBQ2pCLEtBQUsrRCxnQkFBTCxDQUFzQi9ELEtBQXRCLEVBQTZCLFNBQTdCLENBQVA7Ozs7eUNBR3FCQTs7O21CQUNkLEtBQUswRCxhQUFMLENBQW1CMUQsS0FBbkIsRUFBMEIsU0FBMUIsRUFBcUMvTyxHQUFyQyxDQUF5QyxVQUFDdEUsSUFBRDt1QkFDckMsT0FBS2lYLG9CQUFMLENBQTBCalgsSUFBMUIsQ0FBUDthQURHLENBQVA7Ozs7eUNBS3FCcVQ7OzttQkFDZCxLQUFLMEQsYUFBTCxDQUFtQjFELEtBQW5CLEVBQTBCLFNBQTFCLEVBQXFDL08sR0FBckMsQ0FBeUMsVUFBQ3RFLElBQUQ7dUJBQ3JDLE9BQUtpWCxvQkFBTCxDQUEwQmpYLElBQTFCLENBQVA7YUFERyxDQUFQOzs7O3lDQUtxQnFUO21CQUNkLEtBQUtnRSxtQkFBTCxDQUF5QmhFLEtBQXpCLEVBQWdDLE1BQWhDLENBQVA7Ozs7MkNBR3VCQTs7O21CQUNoQixLQUFLMEQsYUFBTCxDQUFtQjFELEtBQW5CLEVBQTBCLFdBQTFCLEVBQXVDL08sR0FBdkMsQ0FBMkMsVUFBQ3RFLElBQUQ7dUJBQ3ZDLE9BQUtpWCxvQkFBTCxDQUEwQmpYLElBQTFCLENBQVA7YUFERyxDQUFQOzs7O21EQUsrQnFUO21CQUN4QixLQUFLMEQsYUFBTCxDQUFtQjFELEtBQW5CLEVBQTBCLFFBQTFCLENBQVA7Ozs7MkNBR3VCakksTUFBTWtNO2dCQUMzQnhFLGFBQWExSCxLQUFLMEgsVUFBTCxJQUFtQixFQUFwQztpQkFFSyxJQUFJaFIsSUFBSSxDQUFiLEVBQWdCQSxJQUFJZ1IsV0FBVzdSLE1BQS9CLEVBQXVDYSxHQUF2QyxFQUE0QztvQkFDdENnUixXQUFXaFIsQ0FBWCxFQUFjZ1UsVUFBZCxDQUF5QkEsVUFBekIsQ0FBb0MvUixJQUFwQyxLQUE2Q3VULGFBQWpELEVBQWdFOzJCQUN2RHhFLFdBQVdoUixDQUFYLENBQVA7OzttQkFJRyxJQUFQOzs7O21DQUdpQnlWLFVBQVVDOzs7O2dCQUlyQkMsU0FBU0QsWUFBWTFCLFVBQVosQ0FBdUJuUyxTQUFwQzttQkFDTztzQkFDRzhULE9BQU94VyxNQUFQLEdBQWdCd1csT0FBTyxDQUFQLEVBQVUxVCxJQUExQixHQUFpQ3dULFNBQVN2WCxJQUFULENBQWMrRCxJQURsRDs4QkFFV3dULFNBQVMzSixXQUFULEdBQXVCLEtBQUs4SixxQkFBTCxDQUEyQkgsU0FBUzNKLFdBQXBDLENBQXZCLEdBQTBFN0UsU0FGckY7c0JBR0csS0FBSzRPLFNBQUwsQ0FBZUosUUFBZixDQUhIOzZCQUlVclEsZ0JBQU9pRSx1QkFBQSxDQUF3Qm9NLFNBQVN2QixNQUFULENBQWdCNEIsdUJBQWhCLEVBQXhCLENBQVA7YUFKakI7Ozs7a0NBUWN4TTs7OzttQkFJUEEsT0FBTyxLQUFLd0gsb0JBQUwsQ0FBMEJpRixZQUExQixDQUF1QyxLQUFLakYsb0JBQUwsQ0FBMEJrRixpQkFBMUIsQ0FBNEMxTSxJQUE1QyxDQUF2QyxDQUFQLEdBQW1HLE1BQTFHOzs7O29DQUdnQm1NLFVBQVVROzs7O2dCQUl0QkMsVUFBVUQsYUFBYWpDLFVBQWIsQ0FBd0JuUyxTQUF0QzttQkFDTztzQkFDR3FVLFFBQVEvVyxNQUFSLEdBQWlCK1csUUFBUSxDQUFSLEVBQVdqVSxJQUE1QixHQUFtQ3dULFNBQVN2WCxJQUFULENBQWMrRCxJQURwRDs2QkFFVW1ELGdCQUFPaUUsdUJBQUEsQ0FBd0JvTSxTQUFTdkIsTUFBVCxDQUFnQjRCLHVCQUFoQixFQUF4QixDQUFQLENBRlY7c0JBR0csS0FBS0QsU0FBTCxDQUFlSixTQUFTN1YsSUFBVCxDQUFjdVcsYUFBZCxDQUE0QixDQUE1QixDQUFmO2FBSFY7Ozs7aUNBT2FDO2dCQUNUQSxPQUFPQyxTQUFYLEVBQXNCO29CQUNaQyxXQUFvQkYsT0FBT0MsU0FBUCxDQUFpQkUsSUFBakIsQ0FBc0IsVUFBU0MsUUFBVDsyQkFDckNBLFNBQVMzSixJQUFULEtBQWtCeEQsYUFBQSxDQUFjc0csYUFBdkM7aUJBRHNCLENBQTFCO29CQUdJMkcsUUFBSixFQUFjOzJCQUNILElBQVA7OzttQkFHRCxLQUFLRyxnQkFBTCxDQUFzQkwsTUFBdEIsQ0FBUDs7Ozs0Q0FHd0JBOzs7O2dCQUlwQkEsT0FBT0MsU0FBWCxFQUFzQjtvQkFDWkssWUFBcUJOLE9BQU9DLFNBQVAsQ0FBaUJFLElBQWpCLENBQXNCOzJCQUFZQyxTQUFTM0osSUFBVCxLQUFrQnhELGFBQUEsQ0FBY3FHLGNBQTVDO2lCQUF0QixDQUEzQjtvQkFDSWdILFNBQUosRUFBZTsyQkFDSixJQUFQOzs7bUJBR0QsS0FBS0QsZ0JBQUwsQ0FBc0JMLE1BQXRCLENBQVA7Ozs7eUNBR3FCQTs7OztnQkFJZk8sZUFBeUIsQ0FBQyxVQUFELEVBQWEsU0FBYixFQUF3QixRQUF4QixDQUEvQjtnQkFDSVAsT0FBT1EsS0FBWCxFQUFrQjs7Ozs7O3lDQUNJUixPQUFPUSxLQUF6Qiw4SEFBZ0M7NEJBQXJCaE8sR0FBcUI7OzRCQUN4QkEsSUFBSTVGLElBQVIsRUFBYzs7Ozs7O3NEQUNRNEYsSUFBSTVGLElBQXRCLG1JQUE0Qjt3Q0FBakJDLEdBQWlCOzt3Q0FDcEIwVCxhQUFhelYsT0FBYixDQUFxQitCLElBQUlILE9BQUosQ0FBWWIsSUFBakMsSUFBeUMsQ0FBQyxDQUE5QyxFQUFpRDsrQ0FDdEMsSUFBUDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFNYixLQUFQOzs7OytDQUcyQjRVOzs7O2dCQUlyQkMsNEJBQTRCLENBQzlCLFVBRDhCLEVBQ2xCLGFBRGtCLEVBQ0gsV0FERyxFQUNVLGFBRFYsRUFDeUIsb0JBRHpCLEVBQytDLHVCQUQvQyxFQUU5QixpQkFGOEIsRUFFWCxvQkFGVyxFQUVXLFlBRlgsRUFFeUIsa0JBRnpCLEVBRTZDLG1CQUY3QyxFQUVrRSxrQkFGbEUsQ0FBbEM7bUJBSU9BLDBCQUEwQjVWLE9BQTFCLENBQWtDMlYsVUFBbEMsS0FBaUQsQ0FBeEQ7Ozs7b0RBR2dDdFU7Z0JBQzVCNEIsT0FBTyxJQUFYO2dCQUNJNUIsT0FBT3dVLFVBQVgsRUFBdUI7b0JBQ2ZDLGNBQWMsRUFBbEI7b0JBQ0loWCxJQUFJLENBRFI7b0JBRUlDLE1BQU1zQyxPQUFPd1UsVUFBUCxDQUFrQjVYLE1BRjVCO3FCQUdJYSxDQUFKLEVBQU9BLElBQUlDLEdBQVgsRUFBZ0JELEdBQWhCLEVBQXFCO3dCQUNibUUsS0FBS21TLFFBQUwsQ0FBYy9ULE9BQU93VSxVQUFQLENBQWtCL1csQ0FBbEIsQ0FBZCxDQUFKLEVBQXlDO29DQUN6Qm9ELElBQVosQ0FBaUJlLEtBQUs4UyxhQUFMLENBQW1CMVUsT0FBT3dVLFVBQVAsQ0FBa0IvVyxDQUFsQixDQUFuQixDQUFqQjs7O3VCQUdEZ1gsV0FBUDthQVRKLE1BVU87dUJBQ0ksRUFBUDs7Ozs7NkNBSXFCelU7OzttQkFDbEI7NkJBQ1U2QyxnQkFBT2lFLHVCQUFBLENBQXdCOUcsT0FBTzJSLE1BQVAsQ0FBYzRCLHVCQUFkLEVBQXhCLENBQVAsQ0FEVjtzQkFFR3ZULE9BQU93VSxVQUFQLEdBQW9CeFUsT0FBT3dVLFVBQVAsQ0FBa0J2VSxHQUFsQixDQUFzQixVQUFDMFUsSUFBRDsyQkFBVSxPQUFLRCxhQUFMLENBQW1CQyxJQUFuQixDQUFWO2lCQUF0QixDQUFwQixHQUFnRixFQUZuRjs0QkFHUyxLQUFLckIsU0FBTCxDQUFldFQsT0FBTzNDLElBQXRCO2FBSGhCOzs7OzhDQU8wQjJDOzs7bUJBQ25COzZCQUNVNkMsZ0JBQU9pRSx1QkFBQSxDQUF3QjlHLE9BQU8yUixNQUFQLENBQWM0Qix1QkFBZCxFQUF4QixDQUFQLENBRFY7c0JBRUd2VCxPQUFPd1UsVUFBUCxHQUFvQnhVLE9BQU93VSxVQUFQLENBQWtCdlUsR0FBbEIsQ0FBc0IsVUFBQzBVLElBQUQ7MkJBQVUsT0FBS0QsYUFBTCxDQUFtQkMsSUFBbkIsQ0FBVjtpQkFBdEIsQ0FBcEIsR0FBZ0YsRUFGbkY7NEJBR1MsS0FBS3JCLFNBQUwsQ0FBZXRULE9BQU8zQyxJQUF0QjthQUhoQjs7OzsrQ0FPMkIyQzs7Ozs7O2dCQUl2QlQsU0FBUztzQkFDSFMsT0FBT3JFLElBQVAsQ0FBWStELElBRFQ7NkJBRUltRCxnQkFBT2lFLHVCQUFBLENBQXdCOUcsT0FBTzJSLE1BQVAsQ0FBYzRCLHVCQUFkLEVBQXhCLENBQVAsQ0FGSjtzQkFHSHZULE9BQU93VSxVQUFQLEdBQW9CeFUsT0FBT3dVLFVBQVAsQ0FBa0J2VSxHQUFsQixDQUFzQixVQUFDMFUsSUFBRDsyQkFBVSxRQUFLRCxhQUFMLENBQW1CQyxJQUFuQixDQUFWO2lCQUF0QixDQUFwQixHQUFnRixFQUg3RTs0QkFJRyxLQUFLckIsU0FBTCxDQUFldFQsT0FBTzNDLElBQXRCO2FBSmhCO2dCQU1JdVgsWUFBWUMsU0FBQSxDQUFjN1UsTUFBZCxDQU5oQjtnQkFPSTRVLGFBQWFBLFVBQVVoWSxNQUFWLElBQW9CLENBQXJDLEVBQXdDO29CQUNoQ2dZLFVBQVUsQ0FBVixFQUFhblUsSUFBakIsRUFBdUI7MkJBQ1ptVSxTQUFQLEdBQW1CQSxVQUFVLENBQVYsRUFBYW5VLElBQWhDOzs7bUJBR0RsQixNQUFQOzs7O3NDQUdrQlc7Ozs7bUJBSVg7c0JBQ0dBLElBQUl2RSxJQUFKLENBQVMrRCxJQURaO3NCQUVHLEtBQUs0VCxTQUFMLENBQWVwVCxHQUFmO2FBRlY7Ozs7MENBTXNCdkU7Ozs7bUJBSWZBLFFBQVEsTUFBZjttQkFDTyxVQUFDdUQsQ0FBRCxFQUFJRSxDQUFKO3VCQUFVRixFQUFFdkQsSUFBRixFQUFRbVosYUFBUixDQUFzQjFWLEVBQUV6RCxJQUFGLENBQXRCLENBQVY7YUFBUDs7Ozs4Q0FHMEJvTDs7OztnQkFJdEJBLEtBQUtySCxJQUFULEVBQWU7dUJBQ0pxSCxLQUFLckgsSUFBWjthQURKLE1BRU8sSUFBSXFILEtBQUt1RCxJQUFMLEtBQWN4RCxhQUFBLENBQWMrRSxZQUFoQyxFQUE4Qzt1QkFDMUMsT0FBUDthQURHLE1BRUEsSUFBSTlFLEtBQUt1RCxJQUFMLEtBQWN4RCxhQUFBLENBQWNnRixXQUFoQyxFQUE2Qzt1QkFDekMsTUFBUDs7Ozs7c0NBSWNvSDs7OzttQkFJWDtzQkFDR0EsU0FBU3ZYLElBQVQsQ0FBYytELElBRGpCOzhCQUVXd1QsU0FBUzNKLFdBQVQsR0FBdUIsS0FBSzhKLHFCQUFMLENBQTJCSCxTQUFTM0osV0FBcEMsQ0FBdkIsR0FBMEU3RSxTQUZyRjtzQkFHRyxLQUFLNE8sU0FBTCxDQUFlSixRQUFmLENBSEg7NkJBSVVyUSxnQkFBT2lFLHVCQUFBLENBQXdCb00sU0FBU3ZCLE1BQVQsQ0FBZ0I0Qix1QkFBaEIsRUFBeEIsQ0FBUDthQUpqQjs7OztxQ0FRaUJ3Qjs7OztnQkFJYi9ELFNBQVMsRUFBYjtnQkFDSUMsVUFBVSxFQUFkO2dCQUNJRSxVQUFVLEVBQWQ7Z0JBQ0lELGFBQWEsRUFBakI7Z0JBQ0k1RyxJQUFKO2dCQUNJMEssY0FBSixFQUFvQnRCLFlBQXBCO2lCQUdLLElBQUlqVyxJQUFJLENBQWIsRUFBZ0JBLElBQUlzWCxRQUFRblksTUFBNUIsRUFBb0NhLEdBQXBDLEVBQXlDO2lDQUNwQixLQUFLd1gsa0JBQUwsQ0FBd0JGLFFBQVF0WCxDQUFSLENBQXhCLEVBQW9DLE9BQXBDLENBQWpCOytCQUNlLEtBQUt3WCxrQkFBTCxDQUF3QkYsUUFBUXRYLENBQVIsQ0FBeEIsRUFBb0MsUUFBcEMsQ0FBZjt1QkFFT3NYLFFBQVF0WCxDQUFSLEVBQVc2TSxJQUFsQjtvQkFFSTBLLGNBQUosRUFBb0I7MkJBQ1RuVSxJQUFQLENBQVksS0FBS3FVLFVBQUwsQ0FBZ0JILFFBQVF0WCxDQUFSLENBQWhCLEVBQTRCdVgsY0FBNUIsQ0FBWjtpQkFESixNQUVPLElBQUl0QixZQUFKLEVBQWtCOzRCQUNiN1MsSUFBUixDQUFhLEtBQUtzVSxXQUFMLENBQWlCSixRQUFRdFgsQ0FBUixDQUFqQixFQUE2QmlXLFlBQTdCLENBQWI7aUJBREcsTUFFQSxJQUFJLENBQUMsS0FBSzBCLG1CQUFMLENBQXlCTCxRQUFRdFgsQ0FBUixDQUF6QixDQUFMLEVBQTJDO3dCQUMxQyxDQUFDc1gsUUFBUXRYLENBQVIsRUFBVzZNLElBQVgsS0FBb0J4RCxhQUFBLENBQWN1TyxpQkFBbEMsSUFDRE4sUUFBUXRYLENBQVIsRUFBVzZNLElBQVgsS0FBb0J4RCxhQUFBLENBQWN3TyxlQURsQyxLQUVBLENBQUMsS0FBS0Msc0JBQUwsQ0FBNEJSLFFBQVF0WCxDQUFSLEVBQVc5QixJQUFYLENBQWdCK0QsSUFBNUMsQ0FGTCxFQUV3RDtnQ0FDNUNtQixJQUFSLENBQWEsS0FBSzJVLHNCQUFMLENBQTRCVCxRQUFRdFgsQ0FBUixDQUE1QixDQUFiO3FCQUhKLE1BSU8sSUFDSHNYLFFBQVF0WCxDQUFSLEVBQVc2TSxJQUFYLEtBQW9CeEQsYUFBQSxDQUFjMk8sbUJBQWxDLElBQ0FWLFFBQVF0WCxDQUFSLEVBQVc2TSxJQUFYLEtBQW9CeEQsYUFBQSxDQUFjNE8saUJBRGxDLElBQ3VEWCxRQUFRdFgsQ0FBUixFQUFXNk0sSUFBWCxLQUFvQnhELGFBQUEsQ0FBYzZPLFdBRnRGLEVBRW1HO21DQUMzRjlVLElBQVgsQ0FBZ0IsS0FBSytVLGFBQUwsQ0FBbUJiLFFBQVF0WCxDQUFSLENBQW5CLENBQWhCO3FCQUhHLE1BSUEsSUFBSXNYLFFBQVF0WCxDQUFSLEVBQVc2TSxJQUFYLEtBQW9CeEQsYUFBQSxDQUFjK08sYUFBdEMsRUFBcUQ7bUNBQzdDaFYsSUFBWCxDQUFnQixLQUFLaVYsb0JBQUwsQ0FBMEJmLFFBQVF0WCxDQUFSLENBQTFCLENBQWhCO3FCQURHLE1BRUEsSUFBSXNYLFFBQVF0WCxDQUFSLEVBQVc2TSxJQUFYLEtBQW9CeEQsYUFBQSxDQUFjaVAsY0FBdEMsRUFBc0Q7bUNBQzlDbFYsSUFBWCxDQUFnQixLQUFLbVYscUJBQUwsQ0FBMkJqQixRQUFRdFgsQ0FBUixDQUEzQixDQUFoQjtxQkFERyxNQUVBLElBQUlzWCxRQUFRdFgsQ0FBUixFQUFXNk0sSUFBWCxLQUFvQnhELGFBQUEsQ0FBY21QLFdBQXRDLEVBQW1EOzRCQUNsREMseUJBQXlCLEtBQUtDLDJCQUFMLENBQWlDcEIsUUFBUXRYLENBQVIsQ0FBakMsQ0FBN0I7NEJBQ0kyWSxJQUFJLENBRFI7NEJBRUkxWSxNQUFNd1ksdUJBQXVCdFosTUFGakM7NkJBR0l3WixDQUFKLEVBQU9BLElBQUUxWSxHQUFULEVBQWMwWSxHQUFkLEVBQW1CO3VDQUNKdlYsSUFBWCxDQUFnQnFWLHVCQUF1QkUsQ0FBdkIsQ0FBaEI7Ozs7O21CQU1UQyxJQUFQLENBQVksS0FBS0MsaUJBQUwsRUFBWjtvQkFDUUQsSUFBUixDQUFhLEtBQUtDLGlCQUFMLEVBQWI7dUJBQ1dELElBQVgsQ0FBZ0IsS0FBS0MsaUJBQUwsRUFBaEI7bUJBRU87OEJBQUE7Z0NBQUE7Z0NBQUE7c0NBQUE7O2FBQVA7Ozs7Z0RBUzRCQzs7OztnQkFJeEJDLFFBQUo7Z0JBQ0lDLFFBQUo7Z0JBQ0l2RixhQUFhcUYsVUFBVTlFLFVBQVYsQ0FBcUJuUyxTQUFyQixDQUErQixDQUEvQixFQUFrQzRSLFVBQW5EO2lCQUVLLElBQUl6VCxJQUFJLENBQWIsRUFBZ0JBLElBQUl5VCxXQUFXdFUsTUFBL0IsRUFBdUNhLEdBQXZDLEVBQTRDO29CQUNwQ3lULFdBQVd6VCxDQUFYLEVBQWM5QixJQUFkLENBQW1CK0QsSUFBbkIsS0FBNEIsVUFBaEMsRUFBNEM7OytCQUU3QndSLFdBQVd6VCxDQUFYLEVBQWM4TCxXQUFkLENBQTBCN0osSUFBckM7O29CQUVBd1IsV0FBV3pULENBQVgsRUFBYzlCLElBQWQsQ0FBbUIrRCxJQUFuQixLQUE0QixVQUFoQyxFQUE0Qzs7K0JBRTdCd1IsV0FBV3pULENBQVgsRUFBYzhMLFdBQWQsQ0FBMEI3SixJQUFyQzs7O21CQUlEO2tDQUFBOzthQUFQOzs7O3dDQU1vQjZXOzs7O21CQUlaQSxVQUFVOUUsVUFBVixDQUFxQkEsVUFBckIsQ0FBZ0MvUixJQUFoQyxLQUF5QyxNQUFoRDs7OzswQ0FHcUI2Vzs7OzttQkFJZEEsVUFBVTlFLFVBQVYsQ0FBcUJBLFVBQXJCLENBQWdDL1IsSUFBaEMsS0FBeUMsVUFBaEQ7Ozs7NkNBR3dCNlc7Ozs7Z0JBSXJCRywwQkFBMEJILFVBQVU5RSxVQUFWLENBQXFCQSxVQUFyQixDQUFnQy9SLElBQTlEO21CQUNPZ1gsNEJBQTRCLFdBQTVCLElBQTJDQSw0QkFBNEIsV0FBOUU7Ozs7MkNBR3VCSDs7OzttQkFJZkEsVUFBVTlFLFVBQVYsQ0FBcUJBLFVBQXJCLENBQWdDL1IsSUFBaEMsS0FBeUMsWUFBaEQ7Ozs7OENBR3lCMEksVUFBVXVPOzs7O2dCQUloQ2hGLFNBQVMsS0FBS25FLE9BQUwsQ0FBYWdCLGNBQWIsR0FBOEJvSSxtQkFBOUIsQ0FBa0RELGlCQUFpQmhiLElBQW5FLENBQWI7Z0JBQ0lnVSxjQUFjOU0sZ0JBQU9pRSx1QkFBQSxDQUF3QjZLLE9BQU80Qix1QkFBUCxFQUF4QixDQUFQLENBQWxCO2dCQUNJc0QsWUFBWUYsaUJBQWlCaGIsSUFBakIsQ0FBc0IrRCxJQUF0QztnQkFDSW9YLGFBQUo7Z0JBQ0kvQixPQUFKO2dCQUVJNEIsaUJBQWlCbEksVUFBckIsRUFBaUM7cUJBQ3hCLElBQUloUixJQUFJLENBQWIsRUFBZ0JBLElBQUlrWixpQkFBaUJsSSxVQUFqQixDQUE0QjdSLE1BQWhELEVBQXdEYSxHQUF4RCxFQUE2RDt3QkFDckQsS0FBS3NaLG9CQUFMLENBQTBCSixpQkFBaUJsSSxVQUFqQixDQUE0QmhSLENBQTVCLENBQTFCLENBQUosRUFBK0Q7d0NBQzNDLEtBQUt1Wix1QkFBTCxDQUE2QkwsaUJBQWlCbEksVUFBakIsQ0FBNEJoUixDQUE1QixDQUE3QixDQUFoQjtrQ0FDVSxLQUFLd1osWUFBTCxDQUFrQk4saUJBQWlCNUIsT0FBbkMsQ0FBVjsrQkFDTztvREFBQTtvQ0FFS0EsUUFBUS9ELE1BRmI7cUNBR00rRCxRQUFROUQsT0FIZDt3Q0FJUzhELFFBQVE3RCxVQUpqQjtxQ0FLTTZELFFBQVE1RCxPQUxkO2tDQU1HNEQsUUFBUXpLO3lCQU5sQjtxQkFISixNQVdPLElBQUksS0FBSzRNLGtCQUFMLENBQXdCUCxpQkFBaUJsSSxVQUFqQixDQUE0QmhSLENBQTVCLENBQXhCLENBQUosRUFBNkQ7a0NBQ3hELEtBQUt3WixZQUFMLENBQWtCTixpQkFBaUI1QixPQUFuQyxDQUFWOytCQUNPLENBQUM7OENBQUE7Z0RBQUE7b0RBQUE7cUNBSUdBLFFBQVE1RCxPQUpYO3dDQUtNNEQsUUFBUTdELFVBTGQ7a0NBTUE2RCxRQUFReks7eUJBTlQsQ0FBUDtxQkFGSyxNQVVGLElBQUksS0FBSzZNLGVBQUwsQ0FBcUJSLGlCQUFpQmxJLFVBQWpCLENBQTRCaFIsQ0FBNUIsQ0FBckIsS0FBd0QsS0FBSzJaLGlCQUFMLENBQXVCVCxpQkFBaUJsSSxVQUFqQixDQUE0QmhSLENBQTVCLENBQXZCLENBQTVELEVBQW9IOytCQUNoSCxDQUFDOzhDQUFBO2dEQUFBOzt5QkFBRCxDQUFQOzs7YUF4QlYsTUErQk8sSUFBSWtTLFdBQUosRUFBaUI7MEJBQ1YsS0FBS3NILFlBQUwsQ0FBa0JOLGlCQUFpQjVCLE9BQW5DLENBQVY7dUJBRU8sQ0FBQzs0Q0FBQTs2QkFFS0EsUUFBUTVELE9BRmI7Z0NBR1E0RCxRQUFRN0QsVUFIaEI7MEJBSUU2RCxRQUFReks7aUJBSlgsQ0FBUDthQUhHLE1BU0E7MEJBQ08sS0FBSzJNLFlBQUwsQ0FBa0JOLGlCQUFpQjVCLE9BQW5DLENBQVY7dUJBRU8sQ0FBQzs2QkFDS0EsUUFBUTVELE9BRGI7Z0NBRVE0RCxRQUFRN0QsVUFGaEI7MEJBR0U2RCxRQUFReks7aUJBSFgsQ0FBUDs7bUJBT0csRUFBUDs7Ozs2Q0FHeUJsQyxVQUFVckI7Z0JBQy9CQSxLQUFLc1EsZUFBTCxDQUFxQkMsWUFBekIsRUFBd0M7b0JBQ2hDN1osSUFBSSxDQUFSO29CQUNJQyxNQUFNcUosS0FBS3NRLGVBQUwsQ0FBcUJDLFlBQXJCLENBQWtDMWEsTUFENUM7cUJBRUlhLENBQUosRUFBT0EsSUFBRUMsR0FBVCxFQUFjRCxHQUFkLEVBQW1CO3dCQUNac0osS0FBS3NRLGVBQUwsQ0FBcUJDLFlBQXJCLENBQWtDN1osQ0FBbEMsRUFBcUNKLElBQXhDLEVBQThDOzRCQUN2QzBKLEtBQUtzUSxlQUFMLENBQXFCQyxZQUFyQixDQUFrQzdaLENBQWxDLEVBQXFDSixJQUFyQyxDQUEwQ2thLFFBQTFDLElBQXNEeFEsS0FBS3NRLGVBQUwsQ0FBcUJDLFlBQXJCLENBQWtDN1osQ0FBbEMsRUFBcUNKLElBQXJDLENBQTBDa2EsUUFBMUMsQ0FBbUQ3WCxJQUFuRCxLQUE0RCxRQUFySCxFQUErSDt5Q0FDOUc4WCxRQUFiLENBQXNCO3NDQUNaelEsS0FBS3NRLGVBQUwsQ0FBcUJDLFlBQXJCLENBQWtDN1osQ0FBbEMsRUFBcUM5QixJQUFyQyxDQUEwQytELElBRDlCO3NDQUVaK1gsU0FBUzFRLEtBQUtzUSxlQUFMLENBQXFCQyxZQUFyQixDQUFrQzdaLENBQWxDLEVBQXFDOEwsV0FBOUM7NkJBRlY7bUNBSU8sQ0FBQzt3Q0FDSWtPLFNBQVMxUSxLQUFLc1EsZUFBTCxDQUFxQkMsWUFBckIsQ0FBa0M3WixDQUFsQyxFQUFxQzhMLFdBQTlDOzZCQURMLENBQVA7Ozs7O21CQU9ULEVBQVA7Ozs7bUNBR2VtTyxVQUFVcko7Ozs7OztnQkFJckJzSixNQUFNdEosV0FBV3VKLFVBQVgsQ0FBc0JDLE1BQXRCLENBQTZCLFVBQUNDLFNBQUQsRUFBWUMsU0FBWjtvQkFFL0JBLFVBQVV6TixJQUFWLEtBQW1CeEQsYUFBQSxDQUFja1IsaUJBQXJDLEVBQXdEOzJCQUM3Q0YsVUFBVUcsTUFBVixDQUFpQixRQUFLQyxvQkFBTCxDQUEwQlIsUUFBMUIsRUFBb0NLLFNBQXBDLENBQWpCLENBQVA7O3VCQUdHRCxTQUFQO2FBTk0sRUFPUCxFQVBPLENBQVY7bUJBU09ILElBQUksQ0FBSixLQUFVLEVBQWpCOzs7O3VDQUdtQkQsVUFBa0JySjs7Ozs7O2dCQUlqQ3NKLE1BQU10SixXQUFXdUosVUFBWCxDQUFzQkMsTUFBdEIsQ0FBNkIsVUFBQ0MsU0FBRCxFQUFZQyxTQUFaO29CQUUvQkEsVUFBVXpOLElBQVYsS0FBbUJ4RCxhQUFBLENBQWNvTCxnQkFBckMsRUFBdUQ7MkJBQzVDNEYsVUFBVUcsTUFBVixDQUFpQixRQUFLRSxxQkFBTCxDQUEyQlQsUUFBM0IsRUFBcUNLLFNBQXJDLENBQWpCLENBQVA7O3VCQUdHRCxTQUFQO2FBTk0sRUFPUCxFQVBPLENBQVY7bUJBU09ILElBQUksQ0FBSixLQUFVLEVBQWpCOzs7O3VDQUdtQkQsVUFBa0JySixZQUFZdEg7Ozs7OztnQkFJN0M0USxNQUFNdEosV0FBV3VKLFVBQVgsQ0FBc0JDLE1BQXRCLENBQTZCLFVBQUNDLFNBQUQsRUFBWUMsU0FBWjtvQkFFL0JBLFVBQVV6TixJQUFWLEtBQW1CeEQsYUFBQSxDQUFjc1Isb0JBQXJDLEVBQTJEO3dCQUNuREwsVUFBVU0sR0FBVixLQUFrQnRSLEtBQUtzUixHQUF2QixJQUE4Qk4sVUFBVU8sR0FBVixLQUFrQnZSLEtBQUt1UixHQUF6RCxFQUE4RDsrQkFDbkRSLFVBQVVHLE1BQVYsQ0FBaUIsUUFBS0UscUJBQUwsQ0FBMkJULFFBQTNCLEVBQXFDSyxTQUFyQyxDQUFqQixDQUFQOzs7dUJBSURELFNBQVA7YUFSTSxFQVNQLEVBVE8sQ0FBVjttQkFXT0gsSUFBSSxDQUFKLEtBQVUsRUFBakI7Ozs7NENBR3dCM0k7bUJBQ2pCLEtBQUswRCxhQUFMLENBQW1CMUQsS0FBbkIsRUFBMEIsU0FBMUIsQ0FBUDs7Ozs4Q0FHMEJBOzs7bUJBQ25CLEtBQUswRCxhQUFMLENBQW1CMUQsS0FBbkIsRUFBMEIsV0FBMUIsRUFBdUMvTyxHQUF2QyxDQUEyQyxVQUFDdEUsSUFBRDt1QkFDdkMsUUFBS2lYLG9CQUFMLENBQTBCalgsSUFBMUIsQ0FBUDthQURHLENBQVA7Ozs7a0RBSzhCcVQ7OzttQkFDdkIsS0FBSzBELGFBQUwsQ0FBbUIxRCxLQUFuQixFQUEwQixlQUExQixFQUEyQy9PLEdBQTNDLENBQStDLFVBQUN0RSxJQUFEO3VCQUMzQyxRQUFLaVgsb0JBQUwsQ0FBMEJqWCxJQUExQixDQUFQO2FBREcsQ0FBUDs7OzsrQ0FLMkJxVDs7O21CQUNwQixLQUFLMEQsYUFBTCxDQUFtQjFELEtBQW5CLEVBQTBCLFlBQTFCLEVBQXdDL08sR0FBeEMsQ0FBNEMsVUFBQ3RFLElBQUQ7b0JBQzNDNGMsYUFBYSxRQUFLM0Ysb0JBQUwsQ0FBMEJqWCxJQUExQixDQUFqQjsyQkFDVzZhLFFBQVgsR0FBc0IsUUFBSzFELDJCQUFMLENBQWlDblgsSUFBakMsQ0FBdEI7MkJBQ1c2YyxLQUFYLEdBQW1CLEVBQW5CO3VCQUNPRCxVQUFQO2FBSkcsQ0FBUDs7Ozs2Q0FReUI1YztnQkFDckI4YyxXQUFXOWMsS0FBS3NJLEtBQUwsQ0FBVyxHQUFYLENBQWY7Z0JBQ0k1RyxPQUFPLEtBQUtxYixPQUFMLENBQWEvYyxJQUFiLENBRFg7Z0JBRUk4YyxTQUFTN2IsTUFBVCxHQUFrQixDQUF0QixFQUF5Qjs7b0JBR2pCLEtBQUsrYixVQUFMLENBQWdCRixTQUFTLENBQVQsQ0FBaEIsQ0FBSixFQUFrQzt5QkFDekJFLFVBQUwsQ0FBZ0JGLFNBQVMsQ0FBVCxDQUFoQixFQUE2QjVYLElBQTdCLENBQWtDbEYsSUFBbEM7aUJBREosTUFHSzt5QkFDSWdkLFVBQUwsQ0FBZ0JGLFNBQVMsQ0FBVCxDQUFoQixJQUErQixDQUFDOWMsSUFBRCxDQUEvQjs7dUJBR0c7d0JBQ0M4YyxTQUFTLENBQVQsQ0FERDs4QkFBQTswQkFHR3BiO2lCQUhWOzttQkFNRzswQkFBQTtzQkFFR0E7YUFGVjs7OztnREFNNEIyUjttQkFDckIsS0FBSzRKLFlBQUwsQ0FBa0IsS0FBS2xHLGFBQUwsQ0FBbUIxRCxLQUFuQixFQUEwQixhQUExQixDQUFsQixDQUFQOzs7OzZDQUd5QkE7Z0JBQ3JCNkosSUFBSSxLQUFLbkcsYUFBTCxDQUFtQjFELEtBQW5CLEVBQTBCLFVBQTFCLEVBQXNDLElBQXRDLEVBQTRDRixHQUE1QyxFQUFSO2dCQUNHK0osQ0FBSCxFQUFNO29CQUNFQyxhQUFhRCxDQUFiLEVBQWdCLENBQWhCLENBQUo7b0JBQ0lBLEVBQUU5WSxPQUFGLENBQVUsSUFBVixFQUFnQixFQUFoQixDQUFKO29CQUNJOFksRUFBRTlZLE9BQUYsQ0FBVSxPQUFWLEVBQW1CLEVBQW5CLENBQUo7O21CQUVHOFksQ0FBUDs7Ozs4Q0FHMEI3SjttQkFDbkIsS0FBSzRKLFlBQUwsQ0FBa0IsS0FBS2xHLGFBQUwsQ0FBbUIxRCxLQUFuQixFQUEwQixXQUExQixDQUFsQixDQUFQOzs7OzJDQUd1QkE7bUJBQ2hCLEtBQUswRCxhQUFMLENBQW1CMUQsS0FBbkIsRUFBMEIsUUFBMUIsQ0FBUDs7Ozs2Q0FHeUJBO21CQUNsQixLQUFLMEQsYUFBTCxDQUFtQjFELEtBQW5CLEVBQTBCLFVBQTFCLEVBQXNDRixHQUF0QyxFQUFQOzs7O29EQUdnQ0U7bUJBQ3pCLEtBQUswRCxhQUFMLENBQW1CMUQsS0FBbkIsRUFBMEIsaUJBQTFCLEVBQTZDRixHQUE3QyxFQUFQOzs7O2tEQUc4QkU7bUJBQ3ZCLEtBQUswRCxhQUFMLENBQW1CMUQsS0FBbkIsRUFBMEIsZUFBMUIsQ0FBUDs7OztxQ0FHaUIrSjttQkFDVkEsS0FBSzlZLEdBQUwsQ0FBUzt1QkFBT2tHLElBQUlwRyxPQUFKLENBQVksSUFBWixFQUFrQixFQUFsQixDQUFQO2FBQVQsQ0FBUDs7Ozs0Q0FHd0JpUCxPQUFxQjNSLE1BQWMyYjtnQkFDdkR0TCxPQUFPc0IsTUFBTTBDLE1BQU4sQ0FBYSxVQUFDM0ssSUFBRDt1QkFDYkEsS0FBS3BMLElBQUwsQ0FBVStELElBQVYsS0FBbUJyQyxJQUExQjthQURPLENBQVg7Z0JBSUk0YixrQkFBa0IsU0FBbEJBLGVBQWtCLENBQUNsUyxJQUFEO29CQUNkbVMsTUFBTSxFQUFWO2lCQUNDblMsS0FBS3dDLFdBQUwsQ0FBaUIySCxVQUFqQixJQUErQixFQUFoQyxFQUFvQ2pHLE9BQXBDLENBQTRDLFVBQUMwSixJQUFEO3dCQUNwQ0EsS0FBS2haLElBQUwsQ0FBVStELElBQWQsSUFBc0JpVixLQUFLcEwsV0FBTCxDQUFpQjdKLElBQXZDO2lCQURKO3VCQUdPd1osR0FBUDthQUxKO21CQVFPeEwsS0FBS3pOLEdBQUwsQ0FBU2daLGVBQVQsRUFBMEJuSyxHQUExQixFQUFQOzs7O3lDQUdxQkUsT0FBcUIzUixNQUFjMmI7Z0JBQ3BEdEwsT0FBT3NCLE1BQU0wQyxNQUFOLENBQWEsVUFBQzNLLElBQUQ7dUJBQ2JBLEtBQUtwTCxJQUFMLENBQVUrRCxJQUFWLEtBQW1CckMsSUFBMUI7YUFETyxDQUFYO21CQUdPcVEsUUFBUSxFQUFmOzs7O3NDQUdrQnNCLE9BQXFCM1IsTUFBYzJiOzs7Z0JBRWpEdEwsT0FBT3NCLE1BQU0wQyxNQUFOLENBQWEsVUFBQzNLLElBQUQ7dUJBQ2JBLEtBQUtwTCxJQUFMLENBQVUrRCxJQUFWLEtBQW1CckMsSUFBMUI7YUFETyxDQUFYO2dCQUlJOGIsa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFDelosSUFBRDtvQkFDZEEsS0FBS2YsT0FBTCxDQUFhLEdBQWIsTUFBc0IsQ0FBQyxDQUF2QixJQUE0QixDQUFDcWEsU0FBakMsRUFBNEM7MkJBQ2pDdFosS0FBS3VFLEtBQUwsQ0FBVyxHQUFYLEVBQWdCNkssR0FBaEIsRUFBUDs7dUJBRUcsQ0FDSHBQLElBREcsQ0FBUDthQUpKO2dCQVNJMFosc0JBQXNCLFNBQXRCQSxtQkFBc0IsQ0FBQ3JTLElBQUQ7b0JBQW1CcEwsMkVBQU87O29CQUU1Q29MLEtBQUswSyxVQUFULEVBQXFCOzJCQUNWOVYsYUFBV0EsSUFBWCxHQUFvQkEsSUFBM0I7d0JBRUkwZCxXQUFXLFFBQUtDLE9BQXBCO3dCQUNJdlMsS0FBS3BMLElBQVQsRUFBZTttQ0FDQW9MLEtBQUtwTCxJQUFMLENBQVUrRCxJQUFyQjtxQkFESixNQUdLLElBQUlxSCxLQUFLckgsSUFBVCxFQUFlO21DQUNMcUgsS0FBS3JILElBQWhCO3FCQURDLE1BR0EsSUFBSXFILEtBQUswSyxVQUFULEVBQXFCOzRCQUVsQjFLLEtBQUswSyxVQUFMLENBQWdCL1IsSUFBcEIsRUFBMEI7dUNBQ1hxSCxLQUFLMEssVUFBTCxDQUFnQi9SLElBQTNCO3lCQURKLE1BR0ssSUFBR3FILEtBQUswSyxVQUFMLENBQWdCakksUUFBbkIsRUFBNkI7Z0NBRTFCekMsS0FBSzBLLFVBQUwsQ0FBZ0JuSCxJQUFoQixLQUF5QnhELGFBQUEsQ0FBY3dFLHNCQUEzQyxFQUFtRTsyQ0FDcER2RSxLQUFLMEssVUFBTCxDQUFnQmpJLFFBQWhCLENBQXlCdkosR0FBekIsQ0FBOEI7MkNBQU1zWixHQUFHN1osSUFBVDtpQ0FBOUIsRUFBOEM3QyxJQUE5QyxDQUFtRCxJQUFuRCxDQUFYO2lEQUNld2MsUUFBZjs7Ozt3QkFNUnRTLEtBQUt1RCxJQUFMLEtBQWV4RCxhQUFBLENBQWMwUyx1QkFBakMsRUFBMEQ7dUNBQ3pDSCxRQUFiOztnQ0FFTUQsb0JBQW9CclMsS0FBSzBLLFVBQXpCLEVBQXFDNEgsUUFBckMsQ0FBVixHQUEyRDFkLElBQTNEOzt1QkFHTW9MLEtBQUtySCxJQUFmLFNBQXVCL0QsSUFBdkI7YUFqQ0o7Z0JBb0NJOGQsNkJBQTZCLFNBQTdCQSwwQkFBNkIsQ0FBQzlYLENBQUQ7Ozs7O29CQU16QitYLG1CQUE2QixFQUFqQztvQkFDSUMsaUJBQTJCLEVBQS9CO2lCQUVDaFksRUFBRXVQLFVBQUYsSUFBZ0IsRUFBakIsRUFBcUJqRyxPQUFyQixDQUE2QixVQUFDMEosSUFBRDt3QkFFckI0RCxhQUFhNUQsS0FBS3BMLFdBQUwsQ0FBaUI3SixJQUFsQzt3QkFDSWlWLEtBQUtwTCxXQUFMLENBQWlCZSxJQUFqQixLQUEwQnhELGFBQUEsQ0FBY3VFLGFBQTVDLEVBQTJEOzRDQUN0Q2tOLFVBQWpCOzs7d0JBSUE1RCxLQUFLcEwsV0FBTCxDQUFpQnFRLElBQXJCLEVBQTJCOzRCQUNuQkMsU0FBUyxDQUFDbEYsS0FBS3BMLFdBQUwsQ0FBaUJpTCxVQUFqQixJQUFvQyxFQUFyQyxFQUF5Q3ZVLEdBQXpDLENBQTZDLFVBQUM0WixNQUFEO21DQUF3QkEsT0FBT2xlLElBQVAsQ0FBWStELElBQXBDO3lCQUE3QyxDQUFiOzJDQUNpQm1hLE9BQU9oZCxJQUFQLENBQVksSUFBWixDQUFqQjtxQkFGSixNQU1LLElBQUk4WCxLQUFLcEwsV0FBTCxDQUFpQkMsUUFBckIsRUFBK0I7NEJBQzVCQSxXQUFXLENBQUNtTCxLQUFLcEwsV0FBTCxDQUFpQkMsUUFBakIsSUFBNkIsRUFBOUIsRUFBa0N2SixHQUFsQyxDQUFzQyxVQUFDMkgsQ0FBRDtnQ0FFN0NBLEVBQUUwQyxJQUFGLEtBQVd4RCxhQUFBLENBQWN1RSxhQUE3QixFQUE0Qzs4Q0FDN0J6RCxFQUFFbEksSUFBYjs7bUNBR0drSSxFQUFFbEksSUFBVDt5QkFOVyxDQUFmOzJDQVFpQjhKLFNBQVMzTSxJQUFULENBQWMsSUFBZCxDQUFqQjs7bUNBR1dnRSxJQUFmLENBQW9COzt5QkFHWGxGLElBQUwsQ0FBVStELElBSE07OzhCQUFBLEVBUWxCN0MsSUFSa0IsQ0FRYixJQVJhLENBQXBCO2lCQTFCSjs4QkFzQ1k4YyxlQUFlOWMsSUFBZixDQUFvQixJQUFwQixDQUFaO2FBL0NKO2dCQWtESWlkLHNCQUFzQixTQUF0QkEsbUJBQXNCLENBQUNuWSxDQUFEOztvQkFFbEJBLEVBQUVyQyxTQUFOLEVBQWlCO3dCQUNUdVgsWUFBWXVDLG9CQUFvQnpYLEVBQUU4UCxVQUF0QixDQUFoQjs7Ozt3QkFNSXNJLGVBQWVwWSxFQUFFckMsU0FBRixDQUFZMUMsTUFBWixHQUFxQixDQUFyQixHQUF5QixNQUF6QixHQUFrQyxFQUFyRDt3QkFDSThDLE9BQVVtWCxTQUFWLFNBQXVCa0QsWUFBdkIsTUFBSjsyQkFDT3JhLElBQVA7aUJBVEosTUFhSyxJQUFJaUMsRUFBRThQLFVBQU4sRUFBa0I7d0JBQ2Y4RyxhQUFhYSxvQkFBb0J6WCxDQUFwQixDQUFqQjsyQkFDTzRXLFVBQVA7O3VCQUdHNVcsRUFBRWpDLElBQUYsR0FBU2lDLEVBQUVqQyxJQUFYLEdBQWtCK1osMkJBQTJCOVgsQ0FBM0IsQ0FBekI7YUFwQko7Z0JBdUJJcVksZUFBZSxTQUFmQSxZQUFlLENBQUNqVCxJQUFEO29CQUVYckgsT0FBT3FILEtBQUt3QyxXQUFMLENBQWlCN0osSUFBNUI7b0JBQ0lBLElBQUosRUFBVTsyQkFDQ3laLGdCQUFnQnpaLElBQWhCLENBQVA7aUJBREosTUFJSyxJQUFJcUgsS0FBS3dDLFdBQUwsQ0FBaUJrSSxVQUFyQixFQUFpQzt3QkFDOUI4RyxhQUFhdUIsb0JBQW9CL1MsS0FBS3dDLFdBQXpCLENBQWpCOzJCQUNPLENBQ0hnUCxVQURHLENBQVA7aUJBRkMsTUFPQSxJQUFJeFIsS0FBS3dDLFdBQUwsQ0FBaUJDLFFBQXJCLEVBQStCOzJCQUN6QnpDLEtBQUt3QyxXQUFMLENBQWlCQyxRQUFqQixDQUEwQnZKLEdBQTFCLENBQThCNlosbUJBQTlCLENBQVA7O2FBZlI7bUJBbUJPcE0sS0FBS3pOLEdBQUwsQ0FBUytaLFlBQVQsRUFBdUJsTCxHQUF2QixNQUFnQyxFQUF2Qzs7OztvREFHZ0NuVDttQkFDekIsS0FBSzRWLE9BQUwsQ0FBYTVWLElBQWIsQ0FBUDs7OztJQUtSOztBQ3JyQ0EsSUFBTXNlLE9BQVkzZSxRQUFRLE1BQVIsQ0FBbEI7QUFFQSxBQUNBLEFBQ0EsQUFDQSxBQUNBLEFBQ0EsQUFDQSxBQUNBLEFBQ0EsQUFHQSxBQUVBLElBQUlHLE1BQU1ILFFBQVEsaUJBQVIsQ0FBVjtJQUNJc0gsTUFBTUQsUUFBUUMsR0FBUixFQURWO0lBRUlzWCxjQUFjLElBQUlDLFVBQUosRUFGbEI7SUFHSUMsY0FBYyxJQUFJQyxVQUFKLEVBSGxCO0lBSUlDLGtCQUFrQixJQUFJQyxjQUFKLEVBSnRCO0lBS0lDLGFBQWEsSUFBSUMsU0FBSixFQUxqQjtJQU1JQyxnQkFBZ0IsSUFBSUMsWUFBSixFQU5wQjtJQU9JQyxZQUFZLElBQUlDLElBQUosRUFQaEI7Ozs7Ozs7O3lCQW9CZ0J4YixPQUFaOzs7Ozt5QkF5SUEsR0FBZTttQkFDSjBPLElBQVAsQ0FBWSxlQUFaO2tCQUNLK00sYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCakQsS0FBNUIsR0FBb0NRLG9CQUFvQitiLFFBQXBCLEVBQXBDO2dCQUNJdGQsSUFBSSxDQUFSO2dCQUNJQyxNQUFNLE1BQUtvZCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJqRCxLQUE1QixDQUFrQzVCLE1BRDVDO2lCQUdJYSxDQUFKLEVBQU9BLElBQUVDLEdBQVQsRUFBY0QsR0FBZCxFQUFtQjtzQkFDVnFkLGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCOzBCQUNqQixPQURpQjswQkFFakIsTUFBS0YsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCakQsS0FBNUIsQ0FBa0NmLENBQWxDLEVBQXFDOUIsSUFGcEI7NkJBR2QsTUFIYzswQkFJakIsTUFBS21mLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QmpELEtBQTVCLENBQWtDZixDQUFsQztpQkFKVjs7U0FQUjsyQkFnQkEsR0FBaUI7bUJBQ05zUSxJQUFQLENBQVksaUJBQVo7a0JBQ0srTSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJoRCxPQUE1QixHQUFzQ08sb0JBQW9CaWMsVUFBcEIsRUFBdEM7Z0JBQ0l4ZCxJQUFJLENBQVI7Z0JBQ0lDLE1BQU0sTUFBS29kLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QmhELE9BQTVCLENBQW9DN0IsTUFEOUM7aUJBR0lhLENBQUosRUFBT0EsSUFBRUMsR0FBVCxFQUFjRCxHQUFkLEVBQW1CO3NCQUNWcWQsYUFBTCxDQUFtQkUsT0FBbkIsQ0FBMkI7MEJBQ2pCLFNBRGlCOzBCQUVqQixNQUFLRixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJoRCxPQUE1QixDQUFvQ2hCLENBQXBDLEVBQXVDOUIsSUFGdEI7NkJBR2QsT0FIYzsyQkFJaEIsTUFBS21mLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QmhELE9BQTVCLENBQW9DaEIsQ0FBcEM7aUJBSlg7O1NBUFI7OEJBMkVBLEdBQW9CO21CQUNUc1EsSUFBUCxDQUFZLG9CQUFaO2tCQUNLK00sYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCckQsVUFBNUIsR0FBeUNZLG9CQUFvQmtjLGFBQXBCLEVBQXpDO2dCQUVJemQsSUFBSSxDQUFSO2dCQUNJQyxNQUFNLE1BQUtvZCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJyRCxVQUE1QixDQUF1Q3hCLE1BRGpEO2lCQUdJYSxDQUFKLEVBQU9BLElBQUVDLEdBQVQsRUFBY0QsR0FBZCxFQUFtQjtzQkFDVnFkLGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCOzBCQUNqQixZQURpQjswQkFFakIsTUFBS0YsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCckQsVUFBNUIsQ0FBdUNYLENBQXZDLEVBQTBDOUIsSUFGekI7NkJBR2QsV0FIYzsrQkFJWixNQUFLbWYsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCckQsVUFBNUIsQ0FBdUNYLENBQXZDO2lCQUpmOztTQVJSO2FBbk9TcWQsYUFBTCxHQUFxQnZYLGNBQWN0RSxXQUFkLEVBQXJCO2FBRUssSUFBSWtjLE1BQVQsSUFBbUI5YixPQUFuQixFQUE2QjtnQkFDdEIsT0FBTyxLQUFLeWIsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMFosTUFBNUIsQ0FBUCxLQUErQyxXQUFsRCxFQUErRDtxQkFDdERMLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QjBaLE1BQTVCLElBQXNDOWIsUUFBUThiLE1BQVIsQ0FBdEM7Ozs7Ozs7Ozs7Ozs7O3dCQVNJQyxJQUFaLEdBQW1CQyxJQUFuQixDQUF3Qjt1QkFDZkMsa0JBQUw7YUFESjs7OztpQ0FLS2pPO2lCQUNBQSxLQUFMLEdBQWFBLEtBQWI7Ozs7Ozs7bUJBSU9VLElBQVAsQ0FBWSw2QkFBWjt3QkFDWXdOLEdBQVosQ0FBZ0IsY0FBaEIsRUFBZ0NGLElBQWhDLENBQXFDLFVBQUNHLFdBQUQ7b0JBQzdCQyxhQUFhemEsS0FBS3FKLEtBQUwsQ0FBV21SLFdBQVgsQ0FBakI7b0JBQ0ksT0FBT0MsV0FBVzlmLElBQWxCLEtBQTJCLFdBQTNCLElBQTBDLE9BQUttZixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJpYSxxQkFBNUIsS0FBc0QzWSxrQkFBa0JwRixLQUF0SCxFQUE2SDsyQkFDcEhtZCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJpYSxxQkFBNUIsR0FBb0RELFdBQVc5ZixJQUFYLEdBQWtCLGdCQUF0RTs7b0JBRUEsT0FBTzhmLFdBQVc5TCxXQUFsQixLQUFrQyxXQUF0QyxFQUFtRDsyQkFDMUNtTCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJrYSw0QkFBNUIsR0FBMkRGLFdBQVc5TCxXQUF0RTs7dUJBRUc1QixJQUFQLENBQVkseUJBQVo7dUJBQ0s2TixlQUFMO2FBVEosRUFVRyxVQUFDQyxZQUFEO3VCQUNRalYsS0FBUCxDQUFhaVYsWUFBYjt1QkFDT2pWLEtBQVAsQ0FBYSxzQ0FBYjt1QkFDS2dWLGVBQUw7YUFiSjs7Ozs7OzttQkFrQk83TixJQUFQLENBQVksMEJBQVo7NEJBQ2dCK04sYUFBaEIsR0FBZ0NULElBQWhDLENBQXFDLFVBQUNVLFVBQUQ7dUJBQzVCakIsYUFBTCxDQUFtQkUsT0FBbkIsQ0FBMkI7MEJBQ2pCLE9BRGlCOzZCQUVkO2lCQUZiO3VCQUlLRixhQUFMLENBQW1CRSxPQUFuQixDQUEyQjswQkFDakIsVUFEaUI7NkJBRWQ7aUJBRmI7dUJBSUtGLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnVhLE1BQTVCLEdBQXFDRCxVQUFyQzt1QkFDT2hPLElBQVAsQ0FBWSxzQkFBWjt1QkFDS2tPLG1CQUFMO2FBWEosRUFZRyxVQUFDSixZQUFEO3VCQUNRalYsS0FBUCxDQUFhaVYsWUFBYjt1QkFDT2pWLEtBQVAsQ0FBYSxtQ0FBYjt1QkFDS2tVLGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCOzBCQUNqQixPQURpQjs2QkFFZDtpQkFGYjt1QkFJS2lCLG1CQUFMO2FBbkJKOzs7Ozs7O21CQXdCT2xPLElBQVAsQ0FBWSx1QkFBWjtnQkFFSW1PLFVBQVUsSUFBSUMsWUFBSixDQUNaLEtBQUs5TyxLQURPLEVBQ0E7bUNBQ1NoTixZQUFBLENBQWEsS0FBS3lhLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QjJhLFFBQXpDO2FBRlQsQ0FBZDtnQkFNSUMsbUJBQW1CSCxRQUFRSSxlQUFSLEVBQXZCO2dDQUVvQmxCLElBQXBCLENBQXlCaUIsZ0JBQXpCOztpQkFJS0UsY0FBTDtpQkFFS0MsaUJBQUwsR0FBeUJuQixJQUF6QixDQUE4QixVQUFDVSxVQUFEO29CQUN0Qi9jLG9CQUFvQlosVUFBcEIsQ0FBK0J4QixNQUEvQixHQUF3QyxDQUE1QyxFQUErQzsyQkFDdEM2ZixpQkFBTDs7b0JBRUF6ZCxvQkFBb0JYLFdBQXBCLENBQWdDekIsTUFBaEMsR0FBeUMsQ0FBN0MsRUFBZ0Q7MkJBQ3ZDOGYsa0JBQUw7O29CQUVBMWQsb0JBQW9CVCxNQUFwQixDQUEyQjNCLE1BQTNCLEdBQW9DLENBQXhDLEVBQTJDOzJCQUNsQytmLGFBQUw7O29CQUdBM2Qsb0JBQW9CUixLQUFwQixDQUEwQjVCLE1BQTFCLEdBQW1DLENBQXZDLEVBQTBDOzJCQUNqQ2dnQixZQUFMOztvQkFHQTVkLG9CQUFvQlAsT0FBcEIsQ0FBNEI3QixNQUE1QixHQUFxQyxDQUF6QyxFQUE0QzsyQkFDbkNpZ0IsY0FBTDs7b0JBR0E3ZCxvQkFBb0JWLFVBQXBCLENBQStCMUIsTUFBL0IsR0FBd0MsQ0FBNUMsRUFBK0M7MkJBQ3RDa2dCLGlCQUFMOztvQkFHQSxDQUFDLE9BQUtoQyxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEI2QixlQUFqQyxFQUFrRDsyQkFDekN5WixlQUFMOzt1QkFHQ0MsWUFBTDthQTNCSixFQTRCRyxVQUFDbkIsWUFBRDt1QkFDUWpWLEtBQVAsQ0FBYWlWLFlBQWI7YUE3Qko7Ozs7O21CQWtDTzlOLElBQVAsQ0FBWSxpQkFBWjtpQkFDSytNLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnhELE9BQTVCLEdBQXNDZSxvQkFBb0JpZSxVQUFwQixFQUF0QztpQkFDS25DLGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCO3NCQUNqQixTQURpQjt5QkFFZDthQUZiO2dCQUlJdmQsSUFBSSxDQUFSO2dCQUNJQyxNQUFNLEtBQUtvZCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ4RCxPQUE1QixDQUFvQ3JCLE1BRDlDO2lCQUdJYSxDQUFKLEVBQU9BLElBQUVDLEdBQVQsRUFBY0QsR0FBZCxFQUFtQjtxQkFDVnFkLGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCOzBCQUNqQixTQURpQjswQkFFakIsS0FBS0YsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCeEQsT0FBNUIsQ0FBb0NSLENBQXBDLEVBQXVDOUIsSUFGdEI7NkJBR2QsUUFIYzs0QkFJZixLQUFLbWYsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCeEQsT0FBNUIsQ0FBb0NSLENBQXBDO2lCQUpaOzs7Ozs7bUJBMENHc1EsSUFBUCxDQUFZLG9CQUFaO2lCQUNLK00sYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCbkQsVUFBNUIsR0FBeUNVLG9CQUFvQmtlLGFBQXBCLEVBQXpDO2dCQUNJemYsSUFBSSxDQUFSO2dCQUNJQyxNQUFNLEtBQUtvZCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJuRCxVQUE1QixDQUF1QzFCLE1BRGpEO2lCQUVJYSxDQUFKLEVBQU9BLElBQUVDLEdBQVQsRUFBY0QsR0FBZCxFQUFtQjtxQkFDVnFkLGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCOzBCQUNqQixZQURpQjswQkFFakIsS0FBS0YsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCbkQsVUFBNUIsQ0FBdUNiLENBQXZDLEVBQTBDOUIsSUFGekI7NkJBR2QsV0FIYzsrQkFJWixLQUFLbWYsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCbkQsVUFBNUIsQ0FBdUNiLENBQXZDO2lCQUpmOzs7Ozs7bUJBVUdzUSxJQUFQLENBQVksb0JBQVo7Z0JBQ0luTSxPQUFPLElBQVg7aUJBQ0trWixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ0RCxVQUE1QixHQUF5Q2Esb0JBQW9CbWUsYUFBcEIsRUFBekM7bUJBRU8sSUFBSTNiLE9BQUosQ0FBWSxVQUFTSixVQUFULEVBQWtCQyxNQUFsQjtvQkFDWDVELElBQUksQ0FBUjtvQkFDSUMsTUFBTWtFLEtBQUtrWixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ0RCxVQUE1QixDQUF1Q3ZCLE1BRGpEO29CQUVJdUUsT0FBTyxTQUFQQSxJQUFPO3dCQUNDMUQsS0FBS0MsTUFBSSxDQUFiLEVBQWdCOzRCQUNSMGYsYUFBVS9jLFlBQUEsQ0FBYXVCLEtBQUtrWixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ0RCxVQUE1QixDQUF1Q1YsQ0FBdkMsRUFBMENvUSxJQUF2RCxDQUFkOzRCQUNJd1AsYUFBYUQsYUFBVS9jLFFBQVYsR0FBcUIsV0FEdEM7NEJBRUlvSSxhQUFBLENBQWM0VSxVQUFkLENBQUosRUFBK0I7bUNBQ3BCdFAsSUFBUCxDQUFZLGdEQUFaO3VDQUNBLENBQVlzUCxVQUFaLEVBQXdCLE1BQXhCLEVBQWdDLFVBQUM5YixHQUFELEVBQU0zRCxJQUFOO29DQUN4QjJELEdBQUosRUFBUyxNQUFNQSxHQUFOO3FDQUNKdVosYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCdEQsVUFBNUIsQ0FBdUNWLENBQXZDLEVBQTBDdWUsTUFBMUMsR0FBbURuWixnQkFBT2pGLElBQVAsQ0FBbkQ7cUNBQ0trZCxhQUFMLENBQW1CRSxPQUFuQixDQUEyQjswQ0FDakIsWUFEaUI7MENBRWpCcFosS0FBS2taLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnRELFVBQTVCLENBQXVDVixDQUF2QyxFQUEwQzlCLElBRnpCOzZDQUdkLFdBSGM7K0NBSVppRyxLQUFLa1osYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCdEQsVUFBNUIsQ0FBdUNWLENBQXZDO2lDQUpmOzs7NkJBSEo7eUJBRkosTUFjTztpQ0FDRXFkLGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCO3NDQUNqQixZQURpQjtzQ0FFakJwWixLQUFLa1osYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCdEQsVUFBNUIsQ0FBdUNWLENBQXZDLEVBQTBDOUIsSUFGekI7eUNBR2QsV0FIYzsyQ0FJWmlHLEtBQUtrWixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ0RCxVQUE1QixDQUF1Q1YsQ0FBdkM7NkJBSmY7Ozs7cUJBbEJSLE1BMkJPOzs7aUJBOUJmOzthQURHLENBQVA7Ozs7O21CQXlET3NRLElBQVAsQ0FBWSxxQkFBWjtpQkFDSytNLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnBELFdBQTVCLEdBQTBDVyxvQkFBb0JzZSxjQUFwQixFQUExQztnQkFFSTdmLElBQUksQ0FBUjtnQkFDSUMsTUFBTSxLQUFLb2QsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCcEQsV0FBNUIsQ0FBd0N6QixNQURsRDtpQkFHSWEsQ0FBSixFQUFPQSxJQUFFQyxHQUFULEVBQWNELEdBQWQsRUFBbUI7cUJBQ1ZxZCxhQUFMLENBQW1CRSxPQUFuQixDQUEyQjswQkFDakIsYUFEaUI7MEJBRWpCLEtBQUtGLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnBELFdBQTVCLENBQXdDWixDQUF4QyxFQUEyQzlCLElBRjFCOzZCQUdkLFlBSGM7Z0NBSVgsS0FBS21mLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnBELFdBQTVCLENBQXdDWixDQUF4QztpQkFKaEI7Ozs7OzttQkFVR3NRLElBQVAsQ0FBWSxnQkFBWjtpQkFDSytNLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QmxELE1BQTVCLEdBQXFDUyxvQkFBb0J1ZSxTQUFwQixFQUFyQztpQkFFS3pDLGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCO3NCQUNqQixRQURpQjt5QkFFZDthQUZiOzs7OzttQkFPT2pOLElBQVAsQ0FBWSx1Q0FBWjs7OztnQkFLSVYsUUFBUSxFQUFaO2dCQUNJbVEsa0NBQWtDLENBRHRDO2dCQUVJQyxZQUFZLFNBQVpBLFNBQVksQ0FBU0MsT0FBVDtvQkFDSkMsTUFBSjtvQkFDSUQsV0FBVyxFQUFmLEVBQW1COzZCQUNOLEtBQVQ7aUJBREosTUFFTyxJQUFJQSxVQUFVLEVBQVYsSUFBZ0JBLFdBQVcsRUFBL0IsRUFBbUM7NkJBQzdCLFFBQVQ7aUJBREcsTUFFQSxJQUFJQSxVQUFVLEVBQVYsSUFBZ0JBLFdBQVcsRUFBL0IsRUFBbUM7NkJBQzdCLE1BQVQ7aUJBREcsTUFFQTs2QkFDTSxXQUFUOzt1QkFFR0MsTUFBUDthQWJSO3FCQWdCQSxDQUFVLEtBQUs3QyxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ0RCxVQUF0QyxFQUFrRCxVQUFDMFUsU0FBRDtvQkFDMUMrSyxLQUFLOzhCQUNTL0ssVUFBVWhGLElBRG5COzBCQUVLZ0YsVUFBVXhWLElBRmY7MEJBR0t3VixVQUFVbFg7aUJBSHhCO29CQUtJa2lCLDJCQUEyQixDQUwvQjtvQkFNSUMsa0JBQWtCakwsVUFBVWtMLGVBQVYsQ0FBMEJuaEIsTUFBMUIsR0FBbUNpVyxVQUFVbUwsWUFBVixDQUF1QnBoQixNQUExRCxHQUFtRWlXLFVBQVVvTCxXQUFWLENBQXNCcmhCLE1BQXpGLEdBQWtHaVcsVUFBVXFMLFlBQVYsQ0FBdUJ0aEIsTUFOL0k7eUJBT0EsQ0FBVWlXLFVBQVVrTCxlQUFwQixFQUFxQyxVQUFDN0ssUUFBRDt3QkFDOUJBLFNBQVN2RCxXQUFULEtBQXlCLEVBQTVCLEVBQWdDO29EQUNBLENBQTVCOztpQkFGUjt5QkFLQSxDQUFVa0QsVUFBVW1MLFlBQXBCLEVBQWtDLFVBQUNoZSxNQUFEO3dCQUMzQkEsT0FBTzJQLFdBQVAsS0FBdUIsRUFBMUIsRUFBOEI7b0RBQ0UsQ0FBNUI7O2lCQUZSO3lCQUtBLENBQVVrRCxVQUFVb0wsV0FBcEIsRUFBaUMsVUFBQ0UsS0FBRDt3QkFDMUJBLE1BQU14TyxXQUFOLEtBQXNCLEVBQXpCLEVBQTZCO29EQUNHLENBQTVCOztpQkFGUjt5QkFLQSxDQUFVa0QsVUFBVXFMLFlBQXBCLEVBQWtDLFVBQUM5WCxNQUFEO3dCQUMzQkEsT0FBT3VKLFdBQVAsS0FBdUIsRUFBMUIsRUFBOEI7b0RBQ0UsQ0FBNUI7O2lCQUZSO21CQUtHeU8sZUFBSCxHQUFxQjFoQixLQUFLMmhCLEtBQUwsQ0FBWVIsMkJBQTJCQyxlQUE1QixHQUErQyxHQUExRCxDQUFyQjtvQkFDR0Esb0JBQW9CLENBQXZCLEVBQTBCO3VCQUNuQk0sZUFBSCxHQUFxQixDQUFyQjs7bUJBRURFLGFBQUgsR0FBbUJULDJCQUEyQixHQUEzQixHQUFpQ0MsZUFBcEQ7bUJBQ0dILE1BQUgsR0FBWUYsVUFBVUcsR0FBR1EsZUFBYixDQUFaO21EQUNtQ1IsR0FBR1EsZUFBdEM7c0JBQ012ZCxJQUFOLENBQVcrYyxFQUFYO2FBbkNKO3FCQXFDQSxDQUFVLEtBQUs5QyxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJoRCxPQUF0QyxFQUErQyxVQUFDOGYsTUFBRDtvQkFDdkNYLEtBQUs7OEJBQ1NXLE9BQU8xUSxJQURoQjswQkFFSyxRQUZMOzBCQUdLMFEsT0FBTzVpQjtpQkFIckI7b0JBS0lraUIsMkJBQTJCLENBTC9CO29CQU1JQyxrQkFBa0JTLE9BQU9yTixVQUFQLENBQWtCdFUsTUFBbEIsR0FBMkIyaEIsT0FBT3BOLE9BQVAsQ0FBZXZVLE1BTmhFO3lCQU9BLENBQVUyaEIsT0FBT3JOLFVBQWpCLEVBQTZCLFVBQUNnQyxRQUFEO3dCQUN0QkEsU0FBU3ZELFdBQVQsS0FBeUIsRUFBNUIsRUFBZ0M7b0RBQ0EsQ0FBNUI7O2lCQUZSO3lCQUtBLENBQVU0TyxPQUFPcE4sT0FBakIsRUFBMEIsVUFBQ25SLE1BQUQ7d0JBQ25CQSxPQUFPMlAsV0FBUCxLQUF1QixFQUExQixFQUE4QjtvREFDRSxDQUE1Qjs7aUJBRlI7bUJBS0d5TyxlQUFILEdBQXFCMWhCLEtBQUsyaEIsS0FBTCxDQUFZUiwyQkFBMkJDLGVBQTVCLEdBQStDLEdBQTFELENBQXJCO29CQUNHQSxvQkFBb0IsQ0FBdkIsRUFBMEI7dUJBQ25CTSxlQUFILEdBQXFCLENBQXJCOzttQkFFREUsYUFBSCxHQUFtQlQsMkJBQTJCLEdBQTNCLEdBQWlDQyxlQUFwRDttQkFDR0gsTUFBSCxHQUFZRixVQUFVRyxHQUFHUSxlQUFiLENBQVo7bURBQ21DUixHQUFHUSxlQUF0QztzQkFDTXZkLElBQU4sQ0FBVytjLEVBQVg7YUF6Qko7cUJBMkJBLENBQVUsS0FBSzlDLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnBELFdBQXRDLEVBQW1ELFVBQUNtZ0IsVUFBRDtvQkFDM0NaLEtBQUs7OEJBQ1NZLFdBQVczUSxJQURwQjswQkFFSzJRLFdBQVduaEIsSUFGaEI7MEJBR0ttaEIsV0FBVzdpQjtpQkFIekI7b0JBS0lraUIsMkJBQTJCLENBTC9CO29CQU1JQyxrQkFBa0JVLFdBQVd0TixVQUFYLENBQXNCdFUsTUFBdEIsR0FBK0I0aEIsV0FBV3JOLE9BQVgsQ0FBbUJ2VSxNQU54RTt5QkFPQSxDQUFVNGhCLFdBQVd0TixVQUFyQixFQUFpQyxVQUFDZ0MsUUFBRDt3QkFDMUJBLFNBQVN2RCxXQUFULEtBQXlCLEVBQTVCLEVBQWdDO29EQUNBLENBQTVCOztpQkFGUjt5QkFLQSxDQUFVNk8sV0FBV3JOLE9BQXJCLEVBQThCLFVBQUNuUixNQUFEO3dCQUN2QkEsT0FBTzJQLFdBQVAsS0FBdUIsRUFBMUIsRUFBOEI7b0RBQ0UsQ0FBNUI7O2lCQUZSO21CQUtHeU8sZUFBSCxHQUFxQjFoQixLQUFLMmhCLEtBQUwsQ0FBWVIsMkJBQTJCQyxlQUE1QixHQUErQyxHQUExRCxDQUFyQjtvQkFDR0Esb0JBQW9CLENBQXZCLEVBQTBCO3VCQUNuQk0sZUFBSCxHQUFxQixDQUFyQjs7bUJBRURFLGFBQUgsR0FBbUJULDJCQUEyQixHQUEzQixHQUFpQ0MsZUFBcEQ7bUJBQ0dILE1BQUgsR0FBWUYsVUFBVUcsR0FBR1EsZUFBYixDQUFaO21EQUNtQ1IsR0FBR1EsZUFBdEM7c0JBQ012ZCxJQUFOLENBQVcrYyxFQUFYO2FBekJKO3FCQTJCQSxDQUFVLEtBQUs5QyxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJuRCxVQUF0QyxFQUFrRCxVQUFDbWdCLEtBQUQ7b0JBQzFDYixLQUFLOzhCQUNTYSxNQUFNNVEsSUFEZjswQkFFSzRRLE1BQU1waEIsSUFGWDswQkFHS29oQixNQUFNOWlCO2lCQUhwQjtvQkFLSWtpQiwyQkFBMkIsQ0FML0I7b0JBTUlDLGtCQUFrQlcsTUFBTXZOLFVBQU4sQ0FBaUJ0VSxNQUFqQixHQUEwQjZoQixNQUFNdE4sT0FBTixDQUFjdlUsTUFOOUQ7eUJBT0EsQ0FBVTZoQixNQUFNdk4sVUFBaEIsRUFBNEIsVUFBQ2dDLFFBQUQ7d0JBQ3JCQSxTQUFTdkQsV0FBVCxLQUF5QixFQUE1QixFQUFnQztvREFDQSxDQUE1Qjs7aUJBRlI7eUJBS0EsQ0FBVThPLE1BQU10TixPQUFoQixFQUF5QixVQUFDblIsTUFBRDt3QkFDbEJBLE9BQU8yUCxXQUFQLEtBQXVCLEVBQTFCLEVBQThCO29EQUNFLENBQTVCOztpQkFGUjttQkFLR3lPLGVBQUgsR0FBcUIxaEIsS0FBSzJoQixLQUFMLENBQVlSLDJCQUEyQkMsZUFBNUIsR0FBK0MsR0FBMUQsQ0FBckI7b0JBQ0dBLG9CQUFvQixDQUF2QixFQUEwQjt1QkFDbkJNLGVBQUgsR0FBcUIsQ0FBckI7O21CQUVERSxhQUFILEdBQW1CVCwyQkFBMkIsR0FBM0IsR0FBaUNDLGVBQXBEO21CQUNHSCxNQUFILEdBQVlGLFVBQVVHLEdBQUdRLGVBQWIsQ0FBWjttREFDbUNSLEdBQUdRLGVBQXRDO3NCQUNNdmQsSUFBTixDQUFXK2MsRUFBWDthQXpCSjtxQkEyQkEsQ0FBVSxLQUFLOUMsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCakQsS0FBdEMsRUFBNkMsVUFBQ2tnQixJQUFEO29CQUNyQ2QsS0FBSzs4QkFDU2MsS0FBSzdRLElBRGQ7MEJBRUs2USxLQUFLcmhCLElBRlY7MEJBR0txaEIsS0FBSy9pQjtpQkFIbkI7b0JBS0lraUIsMkJBQTJCLENBTC9CO29CQU1JQyxrQkFBa0IsQ0FOdEI7b0JBT0lZLEtBQUsvTyxXQUFMLEtBQXFCLEVBQXpCLEVBQTZCO2dEQUNHLENBQTVCOzttQkFFRHlPLGVBQUgsR0FBcUIxaEIsS0FBSzJoQixLQUFMLENBQVlSLDJCQUEyQkMsZUFBNUIsR0FBK0MsR0FBMUQsQ0FBckI7bUJBQ0dRLGFBQUgsR0FBbUJULDJCQUEyQixHQUEzQixHQUFpQ0MsZUFBcEQ7bUJBQ0dILE1BQUgsR0FBWUYsVUFBVUcsR0FBR1EsZUFBYixDQUFaO21EQUNtQ1IsR0FBR1EsZUFBdEM7c0JBQ012ZCxJQUFOLENBQVcrYyxFQUFYO2FBZko7b0JBaUJRMWYsUUFBQSxDQUFTbVAsS0FBVCxFQUFnQixDQUFDLFVBQUQsQ0FBaEIsQ0FBUjtnQkFDSXNSLGVBQWU7dUJBQ1JqaUIsS0FBSzJoQixLQUFMLENBQVdiLGtDQUFrQ25RLE1BQU16USxNQUFuRCxDQURRO3dCQUVQO2FBRlo7eUJBSWErZ0IsTUFBYixHQUFzQkYsVUFBVWtCLGFBQWF4WCxLQUF2QixDQUF0QjtpQkFDSzJULGFBQUwsQ0FBbUJFLE9BQW5CLENBQTJCO3NCQUNqQixVQURpQjt5QkFFZCxVQUZjO3VCQUdoQjNOLEtBSGdCO3NCQUlqQnNSO2FBSlY7Ozs7Ozs7bUJBU081USxJQUFQLENBQVksZUFBWjtnQkFDSXRLLFFBQVEsS0FBS3FYLGFBQUwsQ0FBbUJyWCxLQUEvQjtnQkFDSWhHLElBQUksQ0FEUjtnQkFFSUMsTUFBTStGLE1BQU03RyxNQUZoQjtnQkFHSXVFLE9BQU8sU0FBUEEsSUFBTztvQkFDQzFELEtBQUtDLE1BQUksQ0FBYixFQUFnQjsyQkFDTHFRLElBQVAsQ0FBWSxjQUFaLEVBQTRCdEssTUFBTWhHLENBQU4sRUFBUzlCLElBQXJDO2dDQUNZaWpCLE1BQVosQ0FBbUIsT0FBSzlELGFBQUwsQ0FBbUJyWixRQUF0QyxFQUFnRGdDLE1BQU1oRyxDQUFOLENBQWhELEVBQTBENGQsSUFBMUQsQ0FBK0QsVUFBQ3dELFFBQUQ7NEJBQ3ZEM1osWUFBWSxPQUFLNFYsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMkUsTUFBNUM7NEJBQ0csT0FBSzBVLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QjJFLE1BQTVCLENBQW1DM0IsV0FBbkMsQ0FBK0MsR0FBL0MsTUFBd0QsQ0FBQyxDQUE1RCxFQUErRDt5Q0FDOUMsR0FBYjs7NEJBRUFoQixNQUFNaEcsQ0FBTixFQUFTNEMsSUFBYixFQUFtQjt5Q0FDRm9ELE1BQU1oRyxDQUFOLEVBQVM0QyxJQUFULEdBQWdCLEdBQTdCOztxQ0FFU29ELE1BQU1oRyxDQUFOLEVBQVM5QixJQUFULEdBQWdCLE9BQTdCO3NDQUNjbWpCLFNBQWQsQ0FBd0I7bUNBQ2JyYixNQUFNaEcsQ0FBTixDQURhO3FDQUVYb2hCLFFBRlc7aUNBR2YzWjt5QkFIVDtxQ0FLQSxDQUFjN0UsWUFBQSxDQUFhNkUsU0FBYixDQUFkLEVBQXVDMlosUUFBdkMsRUFBaUQsVUFBVXRkLEdBQVY7Z0NBQ3pDQSxHQUFKLEVBQVM7dUNBQ0VxRixLQUFQLENBQWEsa0JBQWtCbkQsTUFBTWhHLENBQU4sRUFBUzlCLElBQTNCLEdBQWtDLGtCQUEvQzs2QkFESixNQUVPOzs7O3lCQUhYO3FCQWRKLEVBc0JHLFVBQUNrZ0IsWUFBRDsrQkFDUWpWLEtBQVAsQ0FBYWlWLFlBQWI7cUJBdkJKO2lCQUZKLE1BMkJPO2tDQUNXa0QsdUJBQWQsQ0FBc0MsT0FBS2pFLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QjJFLE1BQWxFO3dCQUNJLE9BQUswVSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ1ZCxZQUE1QixLQUE2QyxFQUFqRCxFQUFxRDsrQkFDNUNDLG1CQUFMOzsyQkFFQ0MsZ0JBQUw7O2FBcENaOzs7Ozs7bUJBMkNPblIsSUFBUCxDQUFZLG9CQUFaO2dCQUVJLENBQUN0RixhQUFBLENBQWMsS0FBS3FTLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnVkLFlBQTFDLENBQUwsRUFBOEQ7dUJBQ25EcFksS0FBUCw2QkFBdUMsS0FBS2tVLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnVkLFlBQW5FO2FBREosTUFFTztvQkFDQ3BkLE9BQU8sSUFBWDt1QkFDQSxDQUFRdkIsWUFBQSxDQUFhLEtBQUt5YSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ1ZCxZQUF6QyxDQUFSLEVBQWdFM2UsWUFBQSxDQUFhc0MsUUFBUUMsR0FBUixLQUFnQnZDLFFBQWhCLEdBQTJCLEtBQUt5YSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIyRSxNQUF2RCxHQUFnRS9GLFFBQWhFLEdBQTJFLEtBQUt5YSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ1ZCxZQUFwSCxDQUFoRSxFQUFtTSxVQUFVemQsR0FBVjt3QkFDNUxBLEdBQUgsRUFBUTsrQkFDR3FGLEtBQVAsQ0FBYSw4QkFBYixFQUE2Q3JGLEdBQTdDOztpQkFGUjs7Ozs7O21CQVNHd00sSUFBUCxDQUFZLHFCQUFaO2dCQUNJbk0sT0FBTyxJQUFYO21CQUNBLENBQVF2QixZQUFBLENBQWFpQixZQUFZLG9CQUF6QixDQUFSLEVBQXdEakIsWUFBQSxDQUFhc0MsUUFBUUMsR0FBUixLQUFnQnZDLFFBQWhCLEdBQTJCLEtBQUt5YSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIyRSxNQUFwRSxDQUF4RCxFQUFxSSxVQUFVN0UsR0FBVjtvQkFDOUhBLEdBQUgsRUFBUTsyQkFDR3FGLEtBQVAsQ0FBYSw4QkFBYixFQUE2Q3JGLEdBQTdDO2lCQURKLE1BR0s7d0JBQ0dLLEtBQUtrWixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIwZCxRQUFoQyxFQUEwQzsrQkFDdEMsQ0FBUTllLFlBQUEsQ0FBYXNDLFFBQVFDLEdBQVIsS0FBZ0J2QyxRQUFoQixHQUEyQnVCLEtBQUtrWixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIwZCxRQUFwRSxDQUFSLEVBQXVGOWUsWUFBQSxDQUFhc0MsUUFBUUMsR0FBUixLQUFnQnZDLFFBQWhCLEdBQTJCdUIsS0FBS2taLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QjJFLE1BQXZELEdBQWdFLFVBQTdFLENBQXZGLEVBQWlMLFVBQVU3RSxHQUFWO2dDQUN6S0EsR0FBSixFQUFTO3VDQUNFcUYsS0FBUCxDQUFhLDJDQUFiLEVBQTBEckYsR0FBMUQ7NkJBREosTUFFTzt1Q0FDSXdNLElBQVAsQ0FBWSx1Q0FBWjtxQ0FDS3FSLGFBQUw7O3lCQUxSO3FCQURKLE1BVUs7NkJBQ0lBLGFBQUw7OzthQWhCWjs7Ozs7OztnQkF3Qk1DLGFBQWEsU0FBYkEsVUFBYTtvQkFDWEMsWUFBWSxDQUFDLElBQUl6RSxJQUFKLEtBQWFELFNBQWQsSUFBMkIsSUFBM0M7dUJBQ083TSxJQUFQLENBQVksZ0NBQWdDLE9BQUsrTSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIyRSxNQUE1RCxHQUFxRSxNQUFyRSxHQUE4RWtaLFNBQTlFLEdBQTBGLGlCQUExRixHQUE4RyxPQUFLeEUsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCd0IsS0FBMUksR0FBa0osUUFBOUo7b0JBQ0ksT0FBSzZYLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QjhkLEtBQWhDLEVBQXVDOzJCQUM1QnhSLElBQVAsaUNBQTBDLE9BQUsrTSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIyRSxNQUF0RSw2QkFBb0csT0FBSzBVLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnlCLElBQWhJOzJCQUNLc2MsWUFBTCxDQUFrQixPQUFLMUUsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMkUsTUFBOUM7O2FBTFI7Z0JBU0ksS0FBSzBVLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QjRCLFlBQWhDLEVBQThDO3VCQUVuQzBLLElBQVAsQ0FBWSwyQkFBWjs7YUFGSixNQUtPOzsyQkFFSUEsSUFBUCxDQUFZLG9CQUFaO3dCQUNJOVAsVUFBVSxPQUFLNmMsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCeEQsT0FBMUM7d0JBQ0VSLElBQUksQ0FETjt3QkFFRUMsTUFBTU8sUUFBUXJCLE1BRmhCO3dCQUdFdUUsT0FBTyxTQUFQQSxJQUFPOzRCQUNDMUQsS0FBS0MsTUFBSSxDQUFiLEVBQWdCO21DQUNMcVEsSUFBUCxDQUFZLHNCQUFaLEVBQW9DOVAsUUFBUVIsQ0FBUixFQUFXOUIsSUFBL0M7Z0NBQ0l1SixZQUFZLE9BQUs0VixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIyRSxNQUE1QztnQ0FDRyxPQUFLMFUsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMkUsTUFBNUIsQ0FBbUMzQixXQUFuQyxDQUErQyxHQUEvQyxNQUF3RCxDQUFDLENBQTVELEVBQStEOzZDQUM5QyxHQUFiOzt5Q0FFUyxhQUFheEcsUUFBUVIsQ0FBUixFQUFXOUIsSUFBckM7dUNBQ1c4akIsV0FBWCxDQUF1QnhoQixRQUFRUixDQUFSLEVBQVdvUSxJQUFsQyxFQUF3QzNJLFNBQXhDLEVBQW1ELEdBQW5ELEVBQXdEbVcsSUFBeEQsQ0FBNkQ7Ozs2QkFBN0QsRUFHRyxVQUFDUSxZQUFEO3VDQUNRalYsS0FBUCxDQUFhaVYsWUFBYjs2QkFKSjt5QkFQSixNQWFPOzs7cUJBakJiO3dCQXFCSTZELHFCQUFxQixPQUFLNUUsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMkUsTUFBckQ7d0JBQ0dzWixtQkFBbUJqYixXQUFuQixDQUErQixHQUEvQixNQUF3QyxDQUFDLENBQTVDLEVBQStDOzhDQUNyQixHQUF0Qjs7MENBRWtCLE9BQXRCOytCQUNXZ2IsV0FBWCxDQUF1QixPQUFLM0UsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMmEsUUFBbkQsRUFBNkQvYixZQUFBLENBQWFxZixrQkFBYixDQUE3RCxFQUErRixHQUEvRixFQUFvR3JFLElBQXBHLENBQXlHOztxQkFBekcsRUFFRyxVQUFDOVosR0FBRDsrQkFDUXFGLEtBQVAsQ0FBYSxpQ0FBYixFQUFnRHJGLEdBQWhEO3FCQUhKOzs7Ozs7cUNBU0t5Qjs0QkFDVCxDQUFpQjtzQkFDUEEsTUFETztzQkFFUCxLQUFLOFgsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCa2UsSUFGckI7dUJBR04sSUFITTswQkFJSCxDQUpHO3NCQUtQLEtBQUs3RSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ5QjthQUx0Qzs7Ozs7Ozs7O21CQWFPLElBQVA7Ozs7O21CQUtPLEtBQVA7Ozs7SUFJUjs7QUMvbkJBLElBQUl6SCxRQUFNSCxRQUFRLGlCQUFSLENBQVY7SUFDSWtTLFVBQVVsUyxRQUFRLFdBQVIsQ0FEZDtJQUVJK1IsUUFBUSxFQUZaO0lBR0l6SyxRQUFNRCxRQUFRQyxHQUFSLEVBSFY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBYWFoSCxPQURMLENBQ2FILE1BQUlHLE9BRGpCLEVBRUtna0IsS0FGTCxDQUVXLGlCQUZYLEVBR0t6RSxNQUhMLENBR1kseUJBSFosRUFHdUMsc0JBSHZDLEVBSUtBLE1BSkwsQ0FJWSx1QkFKWixFQUlxQyx1RUFKckMsRUFJOEdwWSxrQkFBa0JDLE1BSmhJLEVBS0ttWSxNQUxMLENBS1ksbUJBTFosRUFLaUMsbUNBTGpDLEVBS3NFcFksa0JBQWtCSSxJQUx4RixFQU1LZ1ksTUFOTCxDQU1ZLHVCQU5aLEVBTXFDLDZCQU5yQyxFQU9LQSxNQVBMLENBT1ksbUJBUFosRUFPaUMscUJBUGpDLEVBT3dEcFksa0JBQWtCcEYsS0FQMUUsRUFRS3dkLE1BUkwsQ0FRWSw2QkFSWixFQVEyQyxrRUFSM0MsRUFTS0EsTUFUTCxDQVNZLFlBVFosRUFTMEIsa0NBVDFCLEVBUzhELEtBVDlELEVBWUtBLE1BWkwsQ0FZWSxjQVpaLEVBWTRCLDREQVo1QixFQVkwRixLQVoxRixFQWFLQSxNQWJMLENBYVksYUFiWixFQWEyQixnRUFiM0IsRUFhNkYsS0FiN0YsRUFjS0EsTUFkTCxDQWNZLG1CQWRaLEVBY2lDLDZCQWRqQyxFQWNnRXBZLGtCQUFrQkcsSUFkbEYsRUFlS2lZLE1BZkwsQ0FlWSxpQkFmWixFQWUrQixvSEFmL0IsRUFnQktBLE1BaEJMLENBZ0JZLGlCQWhCWixFQWdCK0IsMERBaEIvQixFQWdCMkYsS0FoQjNGLEVBaUJLQSxNQWpCTCxDQWlCWSxxQkFqQlosRUFpQm1DLDRCQWpCbkMsRUFpQmlFLEtBakJqRSxFQWtCS0EsTUFsQkwsQ0FrQlksZ0JBbEJaLEVBa0I4QixpQ0FsQjlCLEVBa0JpRSxLQWxCakUsRUFtQktBLE1BbkJMLENBbUJZLG1CQW5CWixFQW1CaUMsOENBbkJqQyxFQW1CaUYsS0FuQmpGLEVBb0JLOVEsS0FwQkwsQ0FvQlcxSCxRQUFRaUMsSUFwQm5CO2dCQXNCSWliLGFBQWEsU0FBYkEsVUFBYTt3QkFDTEEsVUFBUjt3QkFDUUMsSUFBUixDQUFhLENBQWI7YUFGSjtnQkFLSXRTLFFBQVFwSCxNQUFaLEVBQW9CO3FCQUNYMFUsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMkUsTUFBNUIsR0FBcUNvSCxRQUFRcEgsTUFBN0M7O2dCQUdBb0gsUUFBUXJLLElBQVosRUFBa0I7cUJBQ1QyWCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIwQixJQUE1QixHQUFtQ3FLLFFBQVFySyxJQUEzQzs7Z0JBR0FxSyxRQUFRMlIsUUFBWixFQUFzQjtxQkFDYnJFLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QjBkLFFBQTVCLEdBQXVDM1IsUUFBUTJSLFFBQS9DOztnQkFHQTNSLFFBQVF2SyxLQUFaLEVBQW1CO3FCQUNWNlgsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCd0IsS0FBNUIsR0FBb0N1SyxRQUFRdkssS0FBNUM7O2dCQUdBdUssUUFBUTdSLElBQVosRUFBa0I7cUJBQ1RtZixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJpYSxxQkFBNUIsR0FBb0RsTyxRQUFRN1IsSUFBNUQ7O2dCQUdBNlIsUUFBUXdSLFlBQVosRUFBMEI7cUJBQ2pCbEUsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCdWQsWUFBNUIsR0FBMkN4UixRQUFRd1IsWUFBbkQ7O2dCQUdBeFIsUUFBUW1TLElBQVosRUFBa0I7cUJBQ1Q3RSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJrZSxJQUE1QixHQUFtQ25TLFFBQVFtUyxJQUEzQzs7Z0JBR0FuUyxRQUFRdVMsUUFBWixFQUFzQjtxQkFDYmpGLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnNlLFFBQTVCLEdBQXdDdlMsUUFBUXVTLFFBQWhEOztnQkFHQXZTLFFBQVF3UyxZQUFaLEVBQTBCO3FCQUNqQmxGLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QnVlLFlBQTVCLEdBQTRDeFMsUUFBUXdTLFlBQXBEOztnQkFHQXhTLFFBQVF6UixNQUFaLEVBQW9CO3VCQUNUQSxNQUFQLEdBQWdCLEtBQWhCOztnQkFHQXlSLFFBQVErUixLQUFaLEVBQW1CO3FCQUNWekUsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCOGQsS0FBNUIsR0FBcUMvUixRQUFRK1IsS0FBN0M7O2dCQUdBL1IsUUFBUXRLLElBQVosRUFBa0I7cUJBQ1Q0WCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ5QixJQUE1QixHQUFtQ3NLLFFBQVF0SyxJQUEzQzs7Z0JBR0FzSyxRQUFReVMsYUFBWixFQUEyQjtxQkFDbEJuRixhQUFMLENBQW1CclosUUFBbkIsQ0FBNEJ3ZSxhQUE1QixHQUE0Q3pTLFFBQVF5UyxhQUFwRDs7Z0JBR0F6UyxRQUFRcEssaUJBQVosRUFBK0I7cUJBQ3RCMFgsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMkIsaUJBQTVCLEdBQWdEb0ssUUFBUXBLLGlCQUF4RDs7Z0JBR0FvSyxRQUFRbkssWUFBWixFQUEwQjtxQkFDakJ5WCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEI0QixZQUE1QixHQUEyQ21LLFFBQVFuSyxZQUFuRDs7Z0JBR0FtSyxRQUFRbEssZUFBWixFQUE2QjtxQkFDcEJ3WCxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEI2QixlQUE1QixHQUE4Q2tLLFFBQVFsSyxlQUF0RDs7Z0JBR0FrSyxRQUFRK1IsS0FBUixJQUFpQixDQUFDL1IsUUFBUTRPLFFBQTFCLElBQXNDNU8sUUFBUXBILE1BQWxELEVBQTBEOztvQkFFbEQsQ0FBQ3FDLGFBQUEsQ0FBYytFLFFBQVFwSCxNQUF0QixDQUFMLEVBQW9DOzJCQUN6QlEsS0FBUCxDQUFnQjRHLFFBQVFwSCxNQUF4Qjs0QkFDUTBaLElBQVIsQ0FBYSxDQUFiO2lCQUZKLE1BR087MkJBQ0kvUixJQUFQLGlDQUEwQ1AsUUFBUXBILE1BQWxELDZCQUFnRm9ILFFBQVF0SyxJQUF4RjtnSkFDbUJzSyxRQUFRcEgsTUFBM0I7O2FBUFIsTUFTTyxJQUFJb0gsUUFBUStSLEtBQVIsSUFBaUIsQ0FBQy9SLFFBQVE0TyxRQUExQixJQUFzQyxDQUFDNU8sUUFBUXBILE1BQW5ELEVBQTJEOztvQkFFMUQsQ0FBQ3FDLGFBQUEsQ0FBYytFLFFBQVFwSCxNQUF0QixDQUFMLEVBQW9DOzJCQUN6QlEsS0FBUCxDQUFhLDhDQUFiOzRCQUNRa1osSUFBUixDQUFhLENBQWI7aUJBRkosTUFHTzsyQkFDSS9SLElBQVAsaUNBQTBDUCxRQUFRcEgsTUFBbEQsNkJBQWdGb0gsUUFBUXRLLElBQXhGO2dKQUNtQnNLLFFBQVFwSCxNQUEzQjs7YUFQRCxNQVNBOzt3QkFDQ29ILFFBQVF5UyxhQUFaLEVBQTJCOytCQUNsQm5GLGFBQUwsQ0FBbUJyWixRQUFuQixDQUE0QndlLGFBQTVCLEdBQTRDLElBQTVDOzt3QkFHQUMsb0JBQW9CdGQsU0FBTyxHQUEvQjt3QkFDSXVkLE9BQU8sU0FBUEEsSUFBTyxDQUFDQyxHQUFELEVBQU1DLE9BQU47NEJBQ0NDLFVBQVUsRUFBZDs0QkFDSUMsT0FBTzlYLGNBQUEsQ0FBZTJYLEdBQWYsQ0FBWDs2QkFDS25WLE9BQUwsQ0FBYSxVQUFDNEMsSUFBRDtnQ0FDTHdTLFFBQVExaEIsT0FBUixDQUFnQmtQLElBQWhCLElBQXdCLENBQXhCLElBQTZCdVMsSUFBSXpoQixPQUFKLENBQVksY0FBWixJQUE4QixDQUEvRCxFQUFrRTt1Q0FDdkQwQixTQUFBLENBQVUrZixHQUFWLEVBQWV2UyxJQUFmLENBQVA7b0NBQ0kyUyxPQUFPL1gsV0FBQSxDQUFZb0YsSUFBWixDQUFYO29DQUNJMlMsUUFBUUEsS0FBS0MsV0FBTCxFQUFaLEVBQWdDOzhDQUNsQkgsUUFBUXJJLE1BQVIsQ0FBZWtJLEtBQUt0UyxJQUFMLEVBQVd3UyxPQUFYLENBQWYsQ0FBVjtpQ0FESixNQUdLLElBQUksaUJBQWlCcGIsSUFBakIsQ0FBc0I0SSxJQUF0QixDQUFKLEVBQWlDOzJDQUMzQmpGLEtBQVAsQ0FBYSxVQUFiLEVBQXlCaUYsSUFBekI7aUNBREMsTUFHQSxJQUFJeE4sWUFBQSxDQUFhd04sSUFBYixNQUF1QixLQUEzQixFQUFrQzsyQ0FDNUJqRixLQUFQLENBQWEsV0FBYixFQUEwQmlGLElBQTFCOzRDQUNRaE4sSUFBUixDQUFhZ04sSUFBYjs7O3lCQVpaOytCQWdCT3lTLE9BQVA7cUJBcEJSO3dCQXVCSTlTLFFBQVE0TyxRQUFSLElBQW9CNU8sUUFBUXhSLElBQVIsQ0FBYVksTUFBYixLQUF3QixDQUFoRCxFQUFtRDsrQkFDMUNrZSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIyYSxRQUE1QixHQUF1QzVPLFFBQVE0TyxRQUEvQzs0QkFDSSxDQUFDM1QsYUFBQSxDQUFjK0UsUUFBUTRPLFFBQXRCLENBQUwsRUFBc0M7bUNBQzNCeFYsS0FBUCxDQUFhLDZEQUFiO29DQUNRa1osSUFBUixDQUFhLENBQWI7eUJBRkosTUFHTztnQ0FDQ1ksUUFBUXJnQixTQUFBLENBQ1ZBLFNBQUEsQ0FBVXNDLFFBQVFDLEdBQVIsRUFBVixFQUF5QnZDLFlBQUEsQ0FBYSxPQUFLeWEsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMmEsUUFBekMsQ0FBekIsQ0FEVSxFQUVWL2IsYUFBQSxDQUFjLE9BQUt5YSxhQUFMLENBQW1CclosUUFBbkIsQ0FBNEIyYSxRQUExQyxDQUZVLENBQVo7bUNBSU9yTyxJQUFQLENBQVksZ0JBQVosRUFBOEIyUyxLQUE5QjtvQ0FFUXBsQixRQUFRb2xCLEtBQVIsRUFBZXJULEtBQXZCOztvQ0FHTXFULE1BQU16YyxLQUFOLENBQVk1RCxRQUFaLEVBQXNCZ0UsS0FBdEIsQ0FBNEIsQ0FBNUIsRUFBK0IsQ0FBQyxDQUFoQyxFQUFtQ3hILElBQW5DLENBQXdDd0QsUUFBeEMsQ0FBTjtnQ0FFSSxDQUFDZ04sS0FBTCxFQUFZO29DQUNKZ1QsVUFBVS9rQixRQUFRb2xCLEtBQVIsRUFBZUwsT0FBZixJQUEwQixFQUF4Qzt3Q0FFUUYsS0FBS3ZkLFNBQU8sR0FBWixFQUFpQnlkLE9BQWpCLENBQVI7O3dKQUdXaFQsS0FBZjs7O3FCQXZCUixNQTBCUSxJQUFJRyxRQUFRNE8sUUFBUixJQUFvQjVPLFFBQVF4UixJQUFSLENBQWFZLE1BQWIsR0FBc0IsQ0FBOUMsRUFBaUQ7K0JBQ2hEa2UsYUFBTCxDQUFtQnJaLFFBQW5CLENBQTRCMmEsUUFBNUIsR0FBdUM1TyxRQUFRNE8sUUFBL0M7NEJBQ0l1RSxlQUFlblQsUUFBUXhSLElBQVIsQ0FBYSxDQUFiLENBQW5COzRCQUNJLENBQUN5TSxhQUFBLENBQWNrWSxZQUFkLENBQUwsRUFBa0M7bUNBQ3ZCL1osS0FBUCw2QkFBdUMrWixZQUF2QztvQ0FDUWIsSUFBUixDQUFhLENBQWI7eUJBRkosTUFHTzttQ0FDSS9SLElBQVAsQ0FBWSw4QkFBWjtvQ0FFUW9TLEtBQUs5ZixZQUFBLENBQWFzZ0IsWUFBYixDQUFMLEVBQWlDLEVBQWpDLENBQVI7d0pBRWV0VCxLQUFmOzs7cUJBWEEsTUFjRDsrQkFDSXpHLEtBQVAsQ0FBYSxzREFBYjs7Ozs7Ozs7RUF6TG9CZ2EsYUFnTXBDOzs7In0=