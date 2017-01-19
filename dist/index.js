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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var gutil = require('gulp-util');
var c = gutil.colors;
var pkg$1 = require('../package.json');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["DEBUG"] = 1] = "DEBUG";
    LEVEL[LEVEL["ERROR"] = 2] = "ERROR";
})(LEVEL || (LEVEL = {}));

var Logger = function () {
    function Logger() {
        classCallCheck(this, Logger);

        this.name = pkg$1.name;
        this.version = pkg$1.version;
        this.logger = gutil.log;
        this.silent = true;
    }

    createClass(Logger, [{
        key: 'info',
        value: function info() {
            if (!this.silent) return;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            this.logger(this.format.apply(this, [LEVEL.INFO].concat(args)));
        }
    }, {
        key: 'error',
        value: function error() {
            if (!this.silent) return;

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            this.logger(this.format.apply(this, [LEVEL.ERROR].concat(args)));
        }
    }, {
        key: 'debug',
        value: function debug() {
            if (!this.silent) return;

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            this.logger(this.format.apply(this, [LEVEL.DEBUG].concat(args)));
        }
    }, {
        key: 'format',
        value: function format(level) {
            var pad = function pad(s, l) {
                var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

                return s + Array(Math.max(0, l - s.length + 1)).join(c);
            };

            for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                args[_key4 - 1] = arguments[_key4];
            }

            var msg = args.join(' ');
            if (args.length > 1) {
                msg = pad(args.shift(), 15, ' ') + ': ' + args.join(' ');
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
            return [msg].join('');
        }
    }]);
    return Logger;
}();

var logger = new Logger();

var AngularAPIs = require('../src/data/api-list.json');
function finderInAngularAPIs(type) {
    var _result = {
        source: 'external',
        data: null
    };
    _.forEach(AngularAPIs, function (angularModuleAPIs, angularModule) {
        var i = 0,
            len = angularModuleAPIs.length;
        for (i; i < len; i++) {
            if (angularModuleAPIs[i].title === type) {
                _result.data = angularModuleAPIs[i];
            }
        }
    });
    return _result;
}

var DependenciesEngine = function () {
    function DependenciesEngine() {
        classCallCheck(this, DependenciesEngine);

        if (DependenciesEngine._instance) {
            throw new Error('Error: Instantiation failed: Use DependenciesEngine.getInstance() instead of new.');
        }
        DependenciesEngine._instance = this;
    }

    createClass(DependenciesEngine, [{
        key: 'init',
        value: function init(data) {
            this.rawData = data;
            this.modules = _.sortBy(this.rawData.modules, ['name']);
            this.components = _.sortBy(this.rawData.components, ['name']);
            this.directives = _.sortBy(this.rawData.directives, ['name']);
            this.injectables = _.sortBy(this.rawData.injectables, ['name']);
            this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
            this.routes = _.sortBy(_.uniqWith(this.rawData.routes, _.isEqual), ['name']);
            this.pipes = _.sortBy(this.rawData.pipes, ['name']);
            this.classes = _.sortBy(this.rawData.classes, ['name']);
        }
    }, {
        key: 'find',
        value: function find$$1(type) {
            var finderInCompodocDependencies = function finderInCompodocDependencies(data) {
                var _result = {
                    source: 'internal',
                    data: null
                },
                    i = 0,
                    len = data.length;
                for (i; i < len; i++) {
                    if (type.indexOf(data[i].name) !== -1) {
                        _result.data = data[i];
                    }
                }
                return _result;
            },
                resultInCompodocInjectables = finderInCompodocDependencies(this.injectables),
                resultInCompodocClasses = finderInCompodocDependencies(this.classes),
                resultInAngularAPIs = finderInAngularAPIs(type);
            if (resultInCompodocInjectables.data !== null) {
                return resultInCompodocInjectables;
            } else if (resultInCompodocClasses.data !== null) {
                return resultInCompodocClasses;
            } else if (resultInAngularAPIs.data !== null) {
                return resultInAngularAPIs;
            }
        }
    }, {
        key: 'getModules',
        value: function getModules() {
            return this.modules;
        }
    }, {
        key: 'getComponents',
        value: function getComponents() {
            return this.components;
        }
    }, {
        key: 'getDirectives',
        value: function getDirectives() {
            return this.directives;
        }
    }, {
        key: 'getInjectables',
        value: function getInjectables() {
            return this.injectables;
        }
    }, {
        key: 'getInterfaces',
        value: function getInterfaces() {
            return this.interfaces;
        }
    }, {
        key: 'getRoutes',
        value: function getRoutes() {
            return this.routes;
        }
    }, {
        key: 'getPipes',
        value: function getPipes() {
            return this.pipes;
        }
    }, {
        key: 'getClasses',
        value: function getClasses() {
            return this.classes;
        }
    }], [{
        key: 'getInstance',
        value: function getInstance() {
            return DependenciesEngine._instance;
        }
    }]);
    return DependenciesEngine;
}();

DependenciesEngine._instance = new DependenciesEngine();

var $dependenciesEngine = DependenciesEngine.getInstance();

//import * as helpers from 'handlebars-helpers';
var HtmlEngine = function () {
    function HtmlEngine() {
        classCallCheck(this, HtmlEngine);

        this.cache = {};
        //TODO use this instead : https://github.com/assemble/handlebars-helpers
        Handlebars.registerHelper("compare", function (a, operator, b, options) {
            if (arguments.length < 4) {
                throw new Error('handlebars Helper {{compare}} expects 4 arguments');
            }
            var result;
            switch (operator) {
                case 'indexof':
                    result = b.indexOf(a) !== -1;
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
                default:
                    {
                        throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
                    }
            }
            if (result === false) {
                return options.inverse(this);
            }
            return options.fn(this);
        });
        Handlebars.registerHelper("filterAngular2Modules", function (text, options) {
            var NG2_MODULES = ['BrowserModule', 'FormsModule', 'HttpModule', 'RouterModule'],
                len = NG2_MODULES.length;
            var i = 0,
                result = false;
            for (i; i < len; i++) {
                if (text.indexOf(NG2_MODULES[i]) > -1) {
                    result = true;
                }
            }
            if (result) {
                return options.fn(this);
            } else {
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
                        var _path = _result.data.type;
                        if (_result.data.type === 'class') _path = 'classe';
                        return arg.name + ': <a href="./' + _path + 's/' + _result.data.name + '.html" >' + arg.type + '</a>';
                    } else {
                        var _path2 = 'https://angular.io/docs/ts/latest/api/' + _result.data.path;
                        return arg.name + ': <a href="' + _path2 + '" target="_blank" >' + arg.type + '</a>';
                    }
                } else {
                    return arg.name + ': ' + arg.type;
                }
            }).join(', ');
            if (method.name) {
                return method.name + '(' + args + ')';
            } else {
                return '(' + args + ')';
            }
        });
        Handlebars.registerHelper('jsdoc-returns-comment', function (jsdocTags, options) {
            var i = 0,
                len = jsdocTags.length,
                result;
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
            var i = 0,
                len = jsdocTags.length,
                tags = [];
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
                    if (_result.data.type === 'class') _result.data.type = 'classe';
                    this.type.href = './' + _result.data.type + 's/' + _result.data.name + '.html';
                    this.type.target = '_self';
                } else {
                    this.type.href = 'https://angular.io/docs/ts/latest/api/' + _result.data.path;
                    this.type.target = '_blank';
                }
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper('indexableSignature', function (method) {
            var args = method.args.map(function (arg) {
                return arg.name + ': ' + arg.type;
            }).join(', ');
            if (method.name) {
                return method.name + '[' + args + ']';
            } else {
                return '[' + args + ']';
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

    createClass(HtmlEngine, [{
        key: 'init',
        value: function init() {
            var partials = ['menu', 'overview', 'readme', 'modules', 'module', 'components', 'component', 'component-detail', 'directives', 'directive', 'injectables', 'injectable', 'pipes', 'pipe', 'classes', 'class', 'interface', 'routes', 'search-results', 'search-input', 'link-type', 'block-method', 'block-property', 'coverage-report'],
                i = 0,
                len = partials.length,
                loop = function loop(resolve$$1, reject) {
                if (i <= len - 1) {
                    fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', function (err, data) {
                        if (err) {
                            reject();
                        }
                        Handlebars.registerPartial(partials[i], data);
                        i++;
                        loop(resolve$$1, reject);
                    });
                } else {
                    resolve$$1();
                }
            };
            return new Promise(function (resolve$$1, reject) {
                loop(resolve$$1, reject);
            });
        }
    }, {
        key: 'render',
        value: function render(mainData, page) {
            var o = mainData,
                that = this;
            Object.assign(o, page);
            return new Promise(function (resolve$$1, reject) {
                if (that.cache['page']) {
                    var template = Handlebars.compile(that.cache['page']),
                        result = template({
                        data: o
                    });
                    resolve$$1(result);
                } else {
                    fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', function (err, data) {
                        if (err) {
                            reject('Error during index ' + page.name + ' generation');
                        } else {
                            that.cache['page'] = data;
                            var _template = Handlebars.compile(data),
                                _result2 = _template({
                                data: o
                            });
                            resolve$$1(_result2);
                        }
                    });
                }
            });
        }
    }]);
    return HtmlEngine;
}();

var MarkdownEngine = function () {
    function MarkdownEngine() {
        classCallCheck(this, MarkdownEngine);

        var renderer = new marked.Renderer();
        renderer.code = function (code, language) {
            var validLang = !!(language && highlightjs.getLanguage(language));
            var highlighted = validLang ? highlightjs.highlight(language, code).value : code;
            highlighted = highlighted.replace(/(\r\n|\n|\r)/gm, '<br>');
            return '<pre><code class="hljs ' + language + '">' + highlighted + '</code></pre>';
        };
        marked__default.setOptions({ renderer: renderer });
    }

    createClass(MarkdownEngine, [{
        key: 'getReadmeFile',
        value: function getReadmeFile() {
            return new Promise(function (resolve$$1, reject) {
                fs.readFile(path.resolve(process.cwd() + '/README.md'), 'utf8', function (err, data) {
                    if (err) {
                        reject('Error during README.md file reading');
                    } else {
                        resolve$$1(marked__default(data));
                    }
                });
            });
        }
    }]);
    return MarkdownEngine;
}();

var FileEngine = function () {
    function FileEngine() {
        classCallCheck(this, FileEngine);
    }

    createClass(FileEngine, [{
        key: 'get',
        value: function get$$1(filepath) {
            return new Promise(function (resolve$$1, reject) {
                fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                    if (err) {
                        reject('Error during ' + filepath + ' read');
                    } else {
                        resolve$$1(data);
                    }
                });
            });
        }
    }]);
    return FileEngine;
}();

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

var Configuration = function () {
    function Configuration() {
        classCallCheck(this, Configuration);

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

    createClass(Configuration, [{
        key: 'addPage',
        value: function addPage(page) {
            this._pages.push(page);
        }
    }, {
        key: 'pages',
        get: function get$$1() {
            return this._pages;
        },
        set: function set$$1(pages) {
            this._pages = [];
        }
    }, {
        key: 'mainData',
        get: function get$$1() {
            return this._mainData;
        },
        set: function set$$1(data) {
            Object.assign(this._mainData, data);
        }
    }], [{
        key: 'getInstance',
        value: function getInstance() {
            return Configuration._instance;
        }
    }]);
    return Configuration;
}();

Configuration._instance = new Configuration();

function isGlobal() {
    var binPath,
        globalBinPath = function globalBinPath() {
        if (binPath) return binPath;
        if (process.platform === 'win32') {
            var pathnames = process.env.PATH.split(path.delimiter);
            var len = pathnames.length;
            for (var i = 0; i < len; i++) {
                if (path.basename(pathnames[i]) === 'npm' || path.basename(pathnames[i]) === 'nodejs') {
                    binPath = pathnames[i];
                }
            }
        } else {
            binPath = path.dirname(process.execPath);
        }
        return binPath;
    },
        stripTrailingSep = function stripTrailingSep(thePath) {
        if (thePath[thePath.length - 1] === path.sep) {
            return thePath.slice(0, -1);
        }
        return thePath;
    },
        pathIsInside = function pathIsInside(thePath, potentialParent) {
        // For inside-directory checking, we want to allow trailing slashes, so normalize.
        thePath = stripTrailingSep(thePath);
        potentialParent = stripTrailingSep(potentialParent);
        // Node treats only Windows as case-insensitive in its path module; we follow those conventions.
        if (process.platform === "win32") {
            thePath = thePath.toLowerCase();
            potentialParent = potentialParent.toLowerCase();
        }
        return thePath.lastIndexOf(potentialParent, 0) === 0 && (thePath[potentialParent.length] === path.sep || thePath[potentialParent.length] === undefined);
    },
        isPathInside = function isPathInside(a, b) {
        a = path.resolve(a);
        b = path.resolve(b);
        if (a === b) {
            return false;
        }
        return pathIsInside(a, b);
    };
    return isPathInside(process.argv[1] || '', globalBinPath() || '');
}

var NgdEngine = function () {
    function NgdEngine() {
        classCallCheck(this, NgdEngine);
    }

    createClass(NgdEngine, [{
        key: 'renderGraph',
        value: function renderGraph(filepath, outputpath, type) {
            return new Promise(function (resolve$$1, reject) {
                var ngdPath = isGlobal() ? __dirname + '/../node_modules/.bin/ngd' : __dirname + '/../../.bin/ngd';
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
                    } else {
                        reject(stderr);
                    }
                });
            });
        }
    }]);
    return NgdEngine;
}();

var lunr = require('lunr');
var cheerio = require('cheerio');
var Entities = require('html-entities').AllHtmlEntities;
var $configuration = Configuration.getInstance();
var Html = new Entities();

var SearchEngine = function () {
    function SearchEngine() {
        classCallCheck(this, SearchEngine);

        this.documentsStore = {};
    }

    createClass(SearchEngine, [{
        key: 'getSearchIndex',
        value: function getSearchIndex() {
            if (!this.searchIndex) {
                this.searchIndex = lunr(function () {
                    this.ref('url');
                    this.field('title', { boost: 10 });
                    this.field('body');
                });
            }
            return this.searchIndex;
        }
    }, {
        key: 'indexPage',
        value: function indexPage(page) {
            var text,
                $ = cheerio.load(page.rawData);
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
        }
    }, {
        key: 'generateSearchIndexJson',
        value: function generateSearchIndexJson(outputFolder) {
            fs.writeJson(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + 'search_index.json'), {
                index: this.getSearchIndex(),
                store: this.documentsStore
            }, function (err) {
                if (err) {
                    logger.error('Error during search index file generation ', err);
                }
            });
        }
    }]);
    return SearchEngine;
}();

var tsany = ts;
// https://github.com/Microsoft/TypeScript/blob/2.1/src/compiler/utilities.ts#L1507
function getJSDocs(node) {
    return tsany.getJSDocs.apply(this, arguments);
}

// get default new line break

function detectIndent(str, count, indent) {
    var stripIndent = function stripIndent(str) {
        var match = str.match(/^[ \t]*(?=\S)/gm);
        if (!match) {
            return str;
        }
        // TODO: use spread operator when targeting Node.js 6
        var indent = Math.min.apply(Math, match.map(function (x) {
            return x.length;
        })); // eslint-disable-line
        var re = new RegExp('^[ \\t]{' + indent + '}', 'gm');
        return indent > 0 ? str.replace(re, '') : str;
    },
        repeating = function repeating(n, str) {
        str = str === undefined ? ' ' : str;
        if (typeof str !== 'string') {
            throw new TypeError('Expected `input` to be a `string`, got `' + (typeof str === 'undefined' ? 'undefined' : _typeof(str)) + '`');
        }
        if (n < 0 || !Number.isFinite(n)) {
            throw new TypeError('Expected `count` to be a positive finite number, got `' + n + '`');
        }
        var ret = '';
        do {
            if (n & 1) {
                ret += str;
            }
            str += str;
        } while (n >>= 1);
        return ret;
    },
        indentString = function indentString(str, count, indent) {
        indent = indent === undefined ? ' ' : indent;
        count = count === undefined ? 1 : count;
        if (typeof str !== 'string') {
            throw new TypeError('Expected `input` to be a `string`, got `' + (typeof str === 'undefined' ? 'undefined' : _typeof(str)) + '`');
        }
        if (typeof count !== 'number') {
            throw new TypeError('Expected `count` to be a `number`, got `' + (typeof count === 'undefined' ? 'undefined' : _typeof(count)) + '`');
        }
        if (typeof indent !== 'string') {
            throw new TypeError('Expected `indent` to be a `string`, got `' + (typeof indent === 'undefined' ? 'undefined' : _typeof(indent)) + '`');
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
        getSourceFile: function getSourceFile(fileName) {
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
                } catch (e) {
                    logger.debug(e, fileName);
                }
                return ts.createSourceFile(fileName, libSource, transpileOptions.target, false);
            }
            return undefined;
        },
        writeFile: function writeFile(name, text) {},
        getDefaultLibFileName: function getDefaultLibFileName() {
            return 'lib.d.ts';
        },
        useCaseSensitiveFileNames: function useCaseSensitiveFileNames() {
            return false;
        },
        getCanonicalFileName: function getCanonicalFileName(fileName) {
            return fileName;
        },
        getCurrentDirectory: function getCurrentDirectory() {
            return '';
        },
        getNewLine: function getNewLine() {
            return '\n';
        },
        fileExists: function fileExists(fileName) {
            return fileName === inputFileName;
        },
        readFile: function readFile$$1() {
            return '';
        },
        directoryExists: function directoryExists() {
            return true;
        },
        getDirectories: function getDirectories() {
            return [];
        }
    };
    return compilerHost;
}

var RouterParser = function () {
    var routes = [],
        modules = [],
        modulesTree,
        rootModule,
        modulesWithRoutes = [];
    return {
        addRoute: function addRoute(route) {
            routes.push(route);
            routes = _.sortBy(_.uniqWith(routes, _.isEqual), ['name']);
        },
        addModuleWithRoutes: function addModuleWithRoutes(moduleName, moduleImports) {
            modulesWithRoutes.push({
                name: moduleName,
                importsNode: moduleImports
            });
            modulesWithRoutes = _.sortBy(_.uniqWith(modulesWithRoutes, _.isEqual), ['name']);
        },
        addModule: function addModule(moduleName, moduleImports) {
            modules.push({
                name: moduleName,
                importsNode: moduleImports
            });
            modules = _.sortBy(_.uniqWith(modules, _.isEqual), ['name']);
        },
        setRootModule: function setRootModule(module) {
            rootModule = module;
        },
        printRoutes: function printRoutes() {
            //console.log('');
            //console.log(routes);
        },
        hasRouterModuleInImports: function hasRouterModuleInImports(imports) {
            var result = false,
                i = 0,
                len = imports.length;
            for (i; i < len; i++) {
                if (imports[i].name.indexOf('RouterModule.forChild') !== -1 || imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                    result = true;
                }
            }
            return result;
        },
        linkModulesAndRoutes: function linkModulesAndRoutes() {
            //scan each module imports AST for each routes, and link routes with module
            var i = 0,
                len = modulesWithRoutes.length;
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
        constructRoutesTree: function constructRoutesTree() {
            //console.log('constructRoutesTree');
            // routes[] contains routes with module link
            // modulesTree contains modules tree
            // make a final routes tree with that
            var cleanModulesTree = _.cloneDeep(modulesTree),
                modulesCleaner = function modulesCleaner(arr) {
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
            var foundRouteWithModuleName = function foundRouteWithModuleName(moduleName) {
                return _.find(routes, { 'module': moduleName });
            };
            var loopModulesParser = function loopModulesParser(node) {
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
            var cleanRoutesTree = function cleanRoutesTree(route) {
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
        constructModulesTree: function constructModulesTree() {
            var getNestedChildren = function getNestedChildren(arr, parent) {
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
}();

var code = [];
var gen = function () {
    var tmp = [];
    return function () {
        var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (!token) {
            //console.log(' ! token');
            return code;
        } else if (token === '\n') {
            //console.log(' \n');
            code.push(tmp.join(''));
            tmp = [];
        } else {
            code.push(token);
        }
        return code;
    };
}();
function generate(node) {
    code = [];
    visitAndRecognize(node);
    return code.join('');
}
function visitAndRecognize(node) {
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    recognize(node);
    depth++;
    node.getChildren().forEach(function (c) {
        return visitAndRecognize(c, depth);
    });
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

var Dependencies = function () {
    function Dependencies(files, options) {
        classCallCheck(this, Dependencies);

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

    createClass(Dependencies, [{
        key: 'breakLines',
        value: function breakLines(text) {
            var _t = text;
            if (typeof _t !== 'undefined') {
                _t = _t.replace(/(\n)/gm, '<br>');
                _t = _t.replace(/(<br>)$/gm, '');
            }
            return _t;
        }
    }, {
        key: 'getDependencies',
        value: function getDependencies() {
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
                        } catch (e) {
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
        }
    }, {
        key: 'getSourceFileDecorators',
        value: function getSourceFileDecorators(srcFile, outputSymbols) {
            var _this2 = this;

            var cleaner = (process.cwd() + path.sep).replace(/\\/g, '/');
            var file = srcFile.fileName.replace(cleaner, '');
            this.programComponent = ts.createProgram([file], {});
            var sourceFile = this.programComponent.getSourceFile(file);
            this.typeCheckerComponent = this.programComponent.getTypeChecker(true);
            ts.forEachChild(srcFile, function (node) {
                var deps = {};
                if (node.decorators) {
                    var visitNode = function visitNode(visitedNode, index) {
                        var metadata = node.decorators.pop();
                        var name = _this2.getSymboleName(node);
                        var props = _this2.findProps(visitedNode);
                        var IO = _this2.getComponentIO(file, sourceFile);
                        if (_this2.isModule(metadata)) {
                            deps = {
                                name: name,
                                file: file,
                                providers: _this2.getModuleProviders(props),
                                declarations: _this2.getModuleDeclations(props),
                                imports: _this2.getModuleImports(props),
                                exports: _this2.getModuleExports(props),
                                bootstrap: _this2.getModuleBootstrap(props),
                                type: 'module',
                                description: _this2.breakLines(IO.description),
                                sourceCode: sourceFile.getText()
                            };
                            if (RouterParser.hasRouterModuleInImports(deps.imports)) {
                                RouterParser.addModuleWithRoutes(name, _this2.getModuleImportsRaw(props));
                            }
                            RouterParser.addModule(name, deps.imports);
                            outputSymbols['modules'].push(deps);
                        } else if (_this2.isComponent(metadata)) {
                            if (props.length === 0) return;
                            //console.log(util.inspect(props, { showHidden: true, depth: 10 }));
                            deps = {
                                name: name,
                                file: file,
                                //animations?: string[]; // TODO
                                changeDetection: _this2.getComponentChangeDetection(props),
                                encapsulation: _this2.getComponentEncapsulation(props),
                                //entryComponents?: string; // TODO waiting doc infos
                                exportAs: _this2.getComponentExportAs(props),
                                host: _this2.getComponentHost(props),
                                inputs: _this2.getComponentInputsMetadata(props),
                                //interpolation?: string; // TODO waiting doc infos
                                moduleId: _this2.getComponentModuleId(props),
                                outputs: _this2.getComponentOutputs(props),
                                providers: _this2.getComponentProviders(props),
                                //queries?: Deps[]; // TODO
                                selector: _this2.getComponentSelector(props),
                                styleUrls: _this2.getComponentStyleUrls(props),
                                styles: _this2.getComponentStyles(props),
                                template: _this2.getComponentTemplate(props),
                                templateUrl: _this2.getComponentTemplateUrl(props),
                                viewProviders: _this2.getComponentViewProviders(props),
                                inputsClass: IO.inputs,
                                outputsClass: IO.outputs,
                                propertiesClass: IO.properties,
                                methodsClass: IO.methods,
                                description: _this2.breakLines(IO.description),
                                type: 'component',
                                sourceCode: sourceFile.getText()
                            };
                            outputSymbols['components'].push(deps);
                        } else if (_this2.isInjectable(metadata)) {
                            deps = {
                                name: name,
                                file: file,
                                type: 'injectable',
                                properties: IO.properties,
                                methods: IO.methods,
                                description: _this2.breakLines(IO.description),
                                sourceCode: sourceFile.getText()
                            };
                            outputSymbols['injectables'].push(deps);
                        } else if (_this2.isPipe(metadata)) {
                            deps = {
                                name: name,
                                file: file,
                                type: 'pipe',
                                description: _this2.breakLines(IO.description),
                                sourceCode: sourceFile.getText()
                            };
                            outputSymbols['pipes'].push(deps);
                        } else if (_this2.isDirective(metadata)) {
                            deps = {
                                name: name,
                                file: file,
                                type: 'directive',
                                description: _this2.breakLines(IO.description),
                                sourceCode: sourceFile.getText()
                            };
                            outputSymbols['directives'].push(deps);
                        }
                        _this2.debug(deps);
                        _this2.__cache[name] = deps;
                    };
                    var filterByDecorators = function filterByDecorators(node) {
                        if (node.expression && node.expression.expression) {
                            return (/(NgModule|Component|Injectable|Pipe|Directive)/.test(node.expression.expression.text)
                            );
                        }
                        return false;
                    };
                    node.decorators.filter(filterByDecorators).forEach(visitNode);
                } else if (node.symbol) {
                    if (node.symbol.flags === ts.SymbolFlags.Class) {
                        var name = _this2.getSymboleName(node);
                        var IO = _this2.getComponentIO(file, sourceFile);
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
                            deps.description = _this2.breakLines(IO.description);
                        }
                        if (IO.methods) {
                            deps.methods = IO.methods;
                        }
                        _this2.debug(deps);
                        outputSymbols['classes'].push(deps);
                    } else if (node.symbol.flags === ts.SymbolFlags.Interface) {
                        var _name = _this2.getSymboleName(node);
                        var _IO = _this2.getInterfaceIO(file, sourceFile, node);
                        deps = {
                            name: _name,
                            file: file,
                            type: 'interface',
                            sourceCode: sourceFile.getText()
                        };
                        if (_IO.properties) {
                            deps.properties = _IO.properties;
                        }
                        if (_IO.kind) {
                            deps.kind = _IO.kind;
                        }
                        if (_IO.description) {
                            deps.description = _this2.breakLines(_IO.description);
                        }
                        if (_IO.methods) {
                            deps.methods = _IO.methods;
                        }
                        _this2.debug(deps);
                        outputSymbols['interfaces'].push(deps);
                    }
                } else {
                    var _IO2 = _this2.getRouteIO(file, sourceFile);
                    if (_IO2.routes) {
                        var newRoutes = void 0;
                        try {
                            newRoutes = JSON.parse(_IO2.routes.replace(/ /gm, ''));
                        } catch (e) {
                            logger.error('Routes parsing error, maybe a trailing comma or an external variable ?');
                            return true;
                        }
                        outputSymbols['routes'] = [].concat(toConsumableArray(outputSymbols['routes']), toConsumableArray(newRoutes));
                    }
                    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                        var _name2 = _this2.getSymboleName(node);
                        var _IO3 = _this2.getComponentIO(file, sourceFile);
                        deps = {
                            name: _name2,
                            file: file,
                            type: 'class',
                            sourceCode: sourceFile.getText()
                        };
                        if (_IO3.properties) {
                            deps.properties = _IO3.properties;
                        }
                        if (_IO3.description) {
                            deps.description = _this2.breakLines(_IO3.description);
                        }
                        if (_IO3.methods) {
                            deps.methods = _IO3.methods;
                        }
                        _this2.debug(deps);
                        outputSymbols['classes'].push(deps);
                    }
                    if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                        //Find the root module with bootstrapModule call
                        //Find recusively in expression nodes one with name 'bootstrapModule'
                        var rootModule = void 0,
                            resultNode = _this2.findExpressionByName(node, 'bootstrapModule');
                        if (resultNode) {
                            if (resultNode.arguments.length > 0) {
                                _.forEach(resultNode.arguments, function (argument) {
                                    if (argument.text) {
                                        rootModule = argument.text;
                                    }
                                });
                            }
                            if (rootModule) {
                                RouterParser.setRootModule(rootModule);
                            }
                        }
                    }
                }
            });
        }
    }, {
        key: 'debug',
        value: function debug(deps) {
            logger.debug('debug', deps.name + ':');
            ['imports', 'exports', 'declarations', 'providers', 'bootstrap'].forEach(function (symbols) {
                if (deps[symbols] && deps[symbols].length > 0) {
                    logger.debug('', '- ' + symbols + ':');
                    deps[symbols].map(function (i) {
                        return i.name;
                    }).forEach(function (d) {
                        logger.debug('', '\t- ' + d);
                    });
                }
            });
        }
    }, {
        key: 'findExpressionByName',
        value: function findExpressionByName(entryNode, name) {
            var result = void 0,
                loop = function loop(node, name) {
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
        }
    }, {
        key: 'isComponent',
        value: function isComponent(metadata) {
            return metadata.expression.expression.text === 'Component';
        }
    }, {
        key: 'isPipe',
        value: function isPipe(metadata) {
            return metadata.expression.expression.text === 'Pipe';
        }
    }, {
        key: 'isDirective',
        value: function isDirective(metadata) {
            return metadata.expression.expression.text === 'Directive';
        }
    }, {
        key: 'isInjectable',
        value: function isInjectable(metadata) {
            return metadata.expression.expression.text === 'Injectable';
        }
    }, {
        key: 'isModule',
        value: function isModule(metadata) {
            return metadata.expression.expression.text === 'NgModule';
        }
    }, {
        key: 'getType',
        value: function getType(name) {
            var type = void 0;
            if (name.toLowerCase().indexOf('component') !== -1) {
                type = 'component';
            } else if (name.toLowerCase().indexOf('pipe') !== -1) {
                type = 'pipe';
            } else if (name.toLowerCase().indexOf('module') !== -1) {
                type = 'module';
            } else if (name.toLowerCase().indexOf('directive') !== -1) {
                type = 'directive';
            }
            return type;
        }
    }, {
        key: 'getSymboleName',
        value: function getSymboleName(node) {
            return node.name.text;
        }
    }, {
        key: 'getComponentSelector',
        value: function getComponentSelector(props) {
            return this.getSymbolDeps(props, 'selector').pop();
        }
    }, {
        key: 'getComponentExportAs',
        value: function getComponentExportAs(props) {
            return this.getSymbolDeps(props, 'exportAs').pop();
        }
    }, {
        key: 'getModuleProviders',
        value: function getModuleProviders(props) {
            var _this3 = this;

            return this.getSymbolDeps(props, 'providers').map(function (providerName) {
                return _this3.parseDeepIndentifier(providerName);
            });
        }
    }, {
        key: 'findProps',
        value: function findProps(visitedNode) {
            if (visitedNode.expression.arguments.length > 0) {
                return visitedNode.expression.arguments.pop().properties;
            } else {
                return '';
            }
        }
    }, {
        key: 'getModuleDeclations',
        value: function getModuleDeclations(props) {
            var _this4 = this;

            return this.getSymbolDeps(props, 'declarations').map(function (name) {
                var component = _this4.findComponentSelectorByName(name);
                if (component) {
                    return component;
                }
                return _this4.parseDeepIndentifier(name);
            });
        }
    }, {
        key: 'getModuleImportsRaw',
        value: function getModuleImportsRaw(props) {
            return this.getSymbolDepsRaw(props, 'imports');
        }
    }, {
        key: 'getModuleImports',
        value: function getModuleImports(props) {
            var _this5 = this;

            return this.getSymbolDeps(props, 'imports').map(function (name) {
                return _this5.parseDeepIndentifier(name);
            });
        }
    }, {
        key: 'getModuleExports',
        value: function getModuleExports(props) {
            var _this6 = this;

            return this.getSymbolDeps(props, 'exports').map(function (name) {
                return _this6.parseDeepIndentifier(name);
            });
        }
    }, {
        key: 'getComponentHost',
        value: function getComponentHost(props) {
            return this.getSymbolDepsObject(props, 'host');
        }
    }, {
        key: 'getModuleBootstrap',
        value: function getModuleBootstrap(props) {
            var _this7 = this;

            return this.getSymbolDeps(props, 'bootstrap').map(function (name) {
                return _this7.parseDeepIndentifier(name);
            });
        }
    }, {
        key: 'getComponentInputsMetadata',
        value: function getComponentInputsMetadata(props) {
            return this.getSymbolDeps(props, 'inputs');
        }
    }, {
        key: 'getDecoratorOfType',
        value: function getDecoratorOfType(node, decoratorType) {
            var decorators = node.decorators || [];
            for (var i = 0; i < decorators.length; i++) {
                if (decorators[i].expression.expression.text === decoratorType) {
                    return decorators[i];
                }
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
                description: marked__default(ts.displayPartsToString(property.symbol.getDocumentationComment()))
            };
        }
    }, {
        key: 'isPublic',
        value: function isPublic(member) {
            if (member.modifiers) {
                var isPublic = member.modifiers.some(function (modifier) {
                    return modifier.kind === ts.SyntaxKind.PublicKeyword;
                });
                if (isPublic) {
                    return true;
                }
            }
            return this.isInternalMember(member);
        }
    }, {
        key: 'isPrivateOrInternal',
        value: function isPrivateOrInternal(member) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            if (member.modifiers) {
                var isPrivate = member.modifiers.some(function (modifier) {
                    return modifier.kind === ts.SyntaxKind.PrivateKeyword;
                });
                if (isPrivate) {
                    return true;
                }
            }
            return this.isInternalMember(member);
        }
    }, {
        key: 'isInternalMember',
        value: function isInternalMember(member) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var internalTags = ['internal', 'private', 'hidden'];
            if (member.jsDoc) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = member.jsDoc[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var doc = _step.value;

                        if (doc.tags) {
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = doc.tags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var tag = _step2.value;

                                    if (internalTags.indexOf(tag.tagName.text) > -1) {
                                        return true;
                                    }
                                }
                            } catch (err) {
                                _didIteratorError2 = true;
                                _iteratorError2 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                        _iterator2.return();
                                    }
                                } finally {
                                    if (_didIteratorError2) {
                                        throw _iteratorError2;
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            return false;
        }
    }, {
        key: 'isAngularLifecycleHook',
        value: function isAngularLifecycleHook(methodName) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var ANGULAR_LIFECYCLE_METHODS = ['ngOnInit', 'ngOnChanges', 'ngDoCheck', 'ngOnDestroy', 'ngAfterContentInit', 'ngAfterContentChecked', 'ngAfterViewInit', 'ngAfterViewChecked', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'];
            return ANGULAR_LIFECYCLE_METHODS.indexOf(methodName) >= 0;
        }
    }, {
        key: 'visitConstructorDeclaration',
        value: function visitConstructorDeclaration(method) {
            var that = this;
            if (method.parameters) {
                var _parameters = [],
                    i = 0,
                    len = method.parameters.length;
                for (i; i < len; i++) {
                    if (that.isPublic(method.parameters[i])) {
                        _parameters.push(that.visitArgument(method.parameters[i]));
                    }
                }
                return _parameters;
            } else {
                return [];
            }
        }
    }, {
        key: 'visitCallDeclaration',
        value: function visitCallDeclaration(method) {
            var _this8 = this;

            return {
                description: marked__default(ts.displayPartsToString(method.symbol.getDocumentationComment())),
                args: method.parameters ? method.parameters.map(function (prop) {
                    return _this8.visitArgument(prop);
                }) : [],
                returnType: this.visitType(method.type)
            };
        }
    }, {
        key: 'visitIndexDeclaration',
        value: function visitIndexDeclaration(method) {
            var _this9 = this;

            return {
                description: marked__default(ts.displayPartsToString(method.symbol.getDocumentationComment())),
                args: method.parameters ? method.parameters.map(function (prop) {
                    return _this9.visitArgument(prop);
                }) : [],
                returnType: this.visitType(method.type)
            };
        }
    }, {
        key: 'visitMethodDeclaration',
        value: function visitMethodDeclaration(method) {
            var _this10 = this;

            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var result = {
                name: method.name.text,
                description: marked__default(ts.displayPartsToString(method.symbol.getDocumentationComment())),
                args: method.parameters ? method.parameters.map(function (prop) {
                    return _this10.visitArgument(prop);
                }) : [],
                returnType: this.visitType(method.type)
            },
                jsdoctags = getJSDocs(method);
            if (jsdoctags && jsdoctags.length >= 1) {
                if (jsdoctags[0].tags) {
                    result.jsdoctags = jsdoctags[0].tags;
                }
            }
            return result;
        }
    }, {
        key: 'visitArgument',
        value: function visitArgument(arg) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            return {
                name: arg.name.text,
                type: this.visitType(arg)
            };
        }
    }, {
        key: 'getNamesCompareFn',
        value: function getNamesCompareFn(name) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            name = name || 'name';
            return function (a, b) {
                return a[name].localeCompare(b[name]);
            };
        }
    }, {
        key: 'stringifyDefaultValue',
        value: function stringifyDefaultValue(node) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            if (node.text) {
                return node.text;
            } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
                return 'false';
            } else if (node.kind === ts.SyntaxKind.TrueKeyword) {
                return 'true';
            }
        }
    }, {
        key: 'visitProperty',
        value: function visitProperty(property) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            return {
                name: property.name.text,
                defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
                type: this.visitType(property),
                description: marked__default(ts.displayPartsToString(property.symbol.getDocumentationComment()))
            };
        }
    }, {
        key: 'visitMembers',
        value: function visitMembers(members) {
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
                } else if (outDecorator) {
                    outputs.push(this.visitOutput(members[i], outDecorator));
                } else if (!this.isPrivateOrInternal(members[i])) {
                    if ((members[i].kind === ts.SyntaxKind.MethodDeclaration || members[i].kind === ts.SyntaxKind.MethodSignature) && !this.isAngularLifecycleHook(members[i].name.text)) {
                        methods.push(this.visitMethodDeclaration(members[i]));
                    } else if (members[i].kind === ts.SyntaxKind.PropertyDeclaration || members[i].kind === ts.SyntaxKind.PropertySignature || members[i].kind === ts.SyntaxKind.GetAccessor) {
                        properties.push(this.visitProperty(members[i]));
                    } else if (members[i].kind === ts.SyntaxKind.CallSignature) {
                        properties.push(this.visitCallDeclaration(members[i]));
                    } else if (members[i].kind === ts.SyntaxKind.IndexSignature) {
                        properties.push(this.visitIndexDeclaration(members[i]));
                    } else if (members[i].kind === ts.SyntaxKind.Constructor) {
                        var _constructorProperties = this.visitConstructorDeclaration(members[i]),
                            j = 0,
                            len = _constructorProperties.length;
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
        }
    }, {
        key: 'visitDirectiveDecorator',
        value: function visitDirectiveDecorator(decorator) {
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
        }
    }, {
        key: 'isPipeDecorator',
        value: function isPipeDecorator(decorator) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            return decorator.expression.expression.text === 'Pipe';
        }
    }, {
        key: 'isModuleDecorator',
        value: function isModuleDecorator(decorator) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            return decorator.expression.expression.text === 'NgModule';
        }
    }, {
        key: 'isDirectiveDecorator',
        value: function isDirectiveDecorator(decorator) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var decoratorIdentifierText = decorator.expression.expression.text;
            return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
        }
    }, {
        key: 'isServiceDecorator',
        value: function isServiceDecorator(decorator) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            return decorator.expression.expression.text === 'Injectable';
        }
    }, {
        key: 'visitClassDeclaration',
        value: function visitClassDeclaration(fileName, classDeclaration) {
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
                    } else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                        members = this.visitMembers(classDeclaration.members);
                        return [{
                            fileName: fileName,
                            className: className,
                            description: description,
                            methods: members.methods,
                            properties: members.properties,
                            kind: members.kind
                        }];
                    } else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                        return [{
                            fileName: fileName,
                            className: className,
                            description: description
                        }];
                    }
                }
            } else if (description) {
                members = this.visitMembers(classDeclaration.members);
                return [{
                    description: description,
                    methods: members.methods,
                    properties: members.properties,
                    kind: members.kind
                }];
            } else {
                members = this.visitMembers(classDeclaration.members);
                return [{
                    methods: members.methods,
                    properties: members.properties,
                    kind: members.kind
                }];
            }
            return [];
        }
    }, {
        key: 'visitEnumDeclaration',
        value: function visitEnumDeclaration(fileName, node) {
            if (node.declarationList.declarations) {
                var i = 0,
                    len = node.declarationList.declarations.length;
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
        }
    }, {
        key: 'getRouteIO',
        value: function getRouteIO(filename, sourceFile) {
            var _this11 = this;

            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var res = sourceFile.statements.reduce(function (directive, statement) {
                if (statement.kind === ts.SyntaxKind.VariableStatement) {
                    return directive.concat(_this11.visitEnumDeclaration(filename, statement));
                }
                return directive;
            }, []);
            return res[0] || {};
        }
    }, {
        key: 'getComponentIO',
        value: function getComponentIO(filename, sourceFile) {
            var _this12 = this;

            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var res = sourceFile.statements.reduce(function (directive, statement) {
                if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                    return directive.concat(_this12.visitClassDeclaration(filename, statement));
                }
                return directive;
            }, []);
            return res[0] || {};
        }
    }, {
        key: 'getInterfaceIO',
        value: function getInterfaceIO(filename, sourceFile, node) {
            var _this13 = this;

            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var res = sourceFile.statements.reduce(function (directive, statement) {
                if (statement.kind === ts.SyntaxKind.InterfaceDeclaration) {
                    if (statement.pos === node.pos && statement.end === node.end) {
                        return directive.concat(_this13.visitClassDeclaration(filename, statement));
                    }
                }
                return directive;
            }, []);
            return res[0] || {};
        }
    }, {
        key: 'getComponentOutputs',
        value: function getComponentOutputs(props) {
            return this.getSymbolDeps(props, 'outputs');
        }
    }, {
        key: 'getComponentProviders',
        value: function getComponentProviders(props) {
            var _this14 = this;

            return this.getSymbolDeps(props, 'providers').map(function (name) {
                return _this14.parseDeepIndentifier(name);
            });
        }
    }, {
        key: 'getComponentViewProviders',
        value: function getComponentViewProviders(props) {
            var _this15 = this;

            return this.getSymbolDeps(props, 'viewProviders').map(function (name) {
                return _this15.parseDeepIndentifier(name);
            });
        }
    }, {
        key: 'getComponentDirectives',
        value: function getComponentDirectives(props) {
            var _this16 = this;

            return this.getSymbolDeps(props, 'directives').map(function (name) {
                var identifier = _this16.parseDeepIndentifier(name);
                identifier.selector = _this16.findComponentSelectorByName(name);
                identifier.label = '';
                return identifier;
            });
        }
    }, {
        key: 'parseDeepIndentifier',
        value: function parseDeepIndentifier(name) {
            var nsModule = name.split('.'),
                type = this.getType(name);
            if (nsModule.length > 1) {
                // cache deps with the same namespace (i.e Shared.*)
                if (this.__nsModule[nsModule[0]]) {
                    this.__nsModule[nsModule[0]].push(name);
                } else {
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
        }
    }, {
        key: 'getComponentTemplateUrl',
        value: function getComponentTemplateUrl(props) {
            return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
        }
    }, {
        key: 'getComponentTemplate',
        value: function getComponentTemplate(props) {
            var t = this.getSymbolDeps(props, 'template', true).pop();
            if (t) {
                t = detectIndent(t, 0);
                t = t.replace(/\n/, '');
                t = t.replace(/ +$/gm, '');
            }
            return t;
        }
    }, {
        key: 'getComponentStyleUrls',
        value: function getComponentStyleUrls(props) {
            return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
        }
    }, {
        key: 'getComponentStyles',
        value: function getComponentStyles(props) {
            return this.getSymbolDeps(props, 'styles');
        }
    }, {
        key: 'getComponentModuleId',
        value: function getComponentModuleId(props) {
            return this.getSymbolDeps(props, 'moduleId').pop();
        }
    }, {
        key: 'getComponentChangeDetection',
        value: function getComponentChangeDetection(props) {
            return this.getSymbolDeps(props, 'changeDetection').pop();
        }
    }, {
        key: 'getComponentEncapsulation',
        value: function getComponentEncapsulation(props) {
            return this.getSymbolDeps(props, 'encapsulation');
        }
    }, {
        key: 'sanitizeUrls',
        value: function sanitizeUrls(urls) {
            return urls.map(function (url) {
                return url.replace('./', '');
            });
        }
    }, {
        key: 'getSymbolDepsObject',
        value: function getSymbolDepsObject(props, type, multiLine) {
            var deps = props.filter(function (node) {
                return node.name.text === type;
            });
            var parseProperties = function parseProperties(node) {
                var obj = {};
                (node.initializer.properties || []).forEach(function (prop) {
                    obj[prop.name.text] = prop.initializer.text;
                });
                return obj;
            };
            return deps.map(parseProperties).pop();
        }
    }, {
        key: 'getSymbolDepsRaw',
        value: function getSymbolDepsRaw(props, type, multiLine) {
            var deps = props.filter(function (node) {
                return node.name.text === type;
            });
            return deps || [];
        }
    }, {
        key: 'getSymbolDeps',
        value: function getSymbolDeps(props, type, multiLine) {
            var _this17 = this;

            var deps = props.filter(function (node) {
                return node.name.text === type;
            });
            var parseSymbolText = function parseSymbolText(text) {
                if (text.indexOf('/') !== -1 && !multiLine) {
                    text = text.split('/').pop();
                }
                return [text];
            };
            var buildIdentifierName = function buildIdentifierName(node) {
                var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

                if (node.expression) {
                    name = name ? '.' + name : name;
                    var nodeName = _this17.unknown;
                    if (node.name) {
                        nodeName = node.name.text;
                    } else if (node.text) {
                        nodeName = node.text;
                    } else if (node.expression) {
                        if (node.expression.text) {
                            nodeName = node.expression.text;
                        } else if (node.expression.elements) {
                            if (node.expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                                nodeName = node.expression.elements.map(function (el) {
                                    return el.text;
                                }).join(', ');
                                nodeName = '[' + nodeName + ']';
                            }
                        }
                    }
                    if (node.kind === ts.SyntaxKind.SpreadElementExpression) {
                        return '...' + nodeName;
                    }
                    return '' + buildIdentifierName(node.expression, nodeName) + name;
                }
                return node.text + '.' + name;
            };
            var parseProviderConfiguration = function parseProviderConfiguration(o) {
                // parse expressions such as:
                // { provide: APP_BASE_HREF, useValue: '/' },
                // or
                // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }
                var _genProviderName = [];
                var _providerProps = [];
                (o.properties || []).forEach(function (prop) {
                    var identifier = prop.initializer.text;
                    if (prop.initializer.kind === ts.SyntaxKind.StringLiteral) {
                        identifier = '\'' + identifier + '\'';
                    }
                    // lambda function (i.e useFactory)
                    if (prop.initializer.body) {
                        var params = (prop.initializer.parameters || []).map(function (params) {
                            return params.name.text;
                        });
                        identifier = '(' + params.join(', ') + ') => {}';
                    } else if (prop.initializer.elements) {
                        var elements = (prop.initializer.elements || []).map(function (n) {
                            if (n.kind === ts.SyntaxKind.StringLiteral) {
                                return '\'' + n.text + '\'';
                            }
                            return n.text;
                        });
                        identifier = '[' + elements.join(', ') + ']';
                    }
                    _providerProps.push([
                    // i.e provide
                    prop.name.text,
                    // i.e OpaqueToken or 'StringToken'
                    identifier].join(': '));
                });
                return '{ ' + _providerProps.join(', ') + ' }';
            };
            var parseSymbolElements = function parseSymbolElements(o) {
                // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
                if (o.arguments) {
                    var className = buildIdentifierName(o.expression);
                    // function arguments could be really complexe. There are so
                    // many use cases that we can't handle. Just print "args" to indicate
                    // that we have arguments.
                    var functionArgs = o.arguments.length > 0 ? 'args' : '';
                    var text = className + '(' + functionArgs + ')';
                    return text;
                } else if (o.expression) {
                    var identifier = buildIdentifierName(o);
                    return identifier;
                }
                return o.text ? o.text : parseProviderConfiguration(o);
            };
            var parseSymbols = function parseSymbols(node) {
                var text = node.initializer.text;
                if (text) {
                    return parseSymbolText(text);
                } else if (node.initializer.expression) {
                    var identifier = parseSymbolElements(node.initializer);
                    return [identifier];
                } else if (node.initializer.elements) {
                    return node.initializer.elements.map(parseSymbolElements);
                }
            };
            return deps.map(parseSymbols).pop() || [];
        }
    }, {
        key: 'findComponentSelectorByName',
        value: function findComponentSelectorByName(name) {
            return this.__cache[name];
        }
    }]);
    return Dependencies;
}();

var glob = require('glob');
var pkg = require('../package.json');
var cwd = process.cwd();
var $htmlengine = new HtmlEngine();
var $fileengine = new FileEngine();
var $markdownengine = new MarkdownEngine();
var $ngdengine = new NgdEngine();
var $searchEngine = new SearchEngine();
var startTime = new Date();

var Application = function () {
    /**
     * Create a new compodoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    function Application(options) {
        var _this = this;

        classCallCheck(this, Application);

        this.preparePipes = function () {
            logger.info('Prepare pipes');
            _this.configuration.mainData.pipes = $dependenciesEngine.getPipes();
            var i = 0,
                len = _this.configuration.mainData.pipes.length;
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
            var i = 0,
                len = _this.configuration.mainData.classes.length;
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
            var i = 0,
                len = _this.configuration.mainData.directives.length;
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


    createClass(Application, [{
        key: 'generate',
        value: function generate() {
            var _this2 = this;

            $htmlengine.init().then(function () {
                _this2.processPackageJson();
            });
        }
    }, {
        key: 'setFiles',
        value: function setFiles(files) {
            this.files = files;
        }
    }, {
        key: 'processPackageJson',
        value: function processPackageJson() {
            var _this3 = this;

            logger.info('Searching package.json file');
            $fileengine.get('package.json').then(function (packageData) {
                var parsedData = JSON.parse(packageData);
                if (typeof parsedData.name !== 'undefined' && _this3.configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title) {
                    _this3.configuration.mainData.documentationMainName = parsedData.name + ' documentation';
                }
                if (typeof parsedData.description !== 'undefined') {
                    _this3.configuration.mainData.documentationMainDescription = parsedData.description;
                }
                logger.info('package.json file found');
                _this3.processMarkdown();
            }, function (errorMessage) {
                logger.error(errorMessage);
                logger.error('Continuing without package.json file');
                _this3.processMarkdown();
            });
        }
    }, {
        key: 'processMarkdown',
        value: function processMarkdown() {
            var _this4 = this;

            logger.info('Searching README.md file');
            $markdownengine.getReadmeFile().then(function (readmeData) {
                _this4.configuration.addPage({
                    name: 'index',
                    context: 'readme'
                });
                _this4.configuration.addPage({
                    name: 'overview',
                    context: 'overview'
                });
                _this4.configuration.mainData.readme = readmeData;
                logger.info('README.md file found');
                _this4.getDependenciesData();
            }, function (errorMessage) {
                logger.error(errorMessage);
                logger.error('Continuing without README.md file');
                _this4.configuration.addPage({
                    name: 'index',
                    context: 'overview'
                });
                _this4.getDependenciesData();
            });
        }
    }, {
        key: 'getDependenciesData',
        value: function getDependenciesData() {
            var _this5 = this;

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
                    _this5.prepareDirectives();
                }
                if ($dependenciesEngine.injectables.length > 0) {
                    _this5.prepareInjectables();
                }
                if ($dependenciesEngine.routes.length > 0) {
                    _this5.prepareRoutes();
                }
                if ($dependenciesEngine.pipes.length > 0) {
                    _this5.preparePipes();
                }
                if ($dependenciesEngine.classes.length > 0) {
                    _this5.prepareClasses();
                }
                if ($dependenciesEngine.interfaces.length > 0) {
                    _this5.prepareInterfaces();
                }
                if (!_this5.configuration.mainData.disableCoverage) {
                    _this5.prepareCoverage();
                }
                _this5.processPages();
            }, function (errorMessage) {
                logger.error(errorMessage);
            });
        }
    }, {
        key: 'prepareModules',
        value: function prepareModules() {
            logger.info('Prepare modules');
            this.configuration.mainData.modules = $dependenciesEngine.getModules();
            this.configuration.addPage({
                name: 'modules',
                context: 'modules'
            });
            var i = 0,
                len = this.configuration.mainData.modules.length;
            for (i; i < len; i++) {
                this.configuration.addPage({
                    path: 'modules',
                    name: this.configuration.mainData.modules[i].name,
                    context: 'module',
                    module: this.configuration.mainData.modules[i]
                });
            }
        }
    }, {
        key: 'prepareInterfaces',
        value: function prepareInterfaces() {
            logger.info('Prepare interfaces');
            this.configuration.mainData.interfaces = $dependenciesEngine.getInterfaces();
            var i = 0,
                len = this.configuration.mainData.interfaces.length;
            for (i; i < len; i++) {
                this.configuration.addPage({
                    path: 'interfaces',
                    name: this.configuration.mainData.interfaces[i].name,
                    context: 'interface',
                    interface: this.configuration.mainData.interfaces[i]
                });
            }
        }
    }, {
        key: 'prepareComponents',
        value: function prepareComponents() {
            logger.info('Prepare components');
            var that = this;
            that.configuration.mainData.components = $dependenciesEngine.getComponents();
            return new Promise(function (resolve$$1, reject) {
                var i = 0,
                    len = that.configuration.mainData.components.length,
                    loop = function loop() {
                    if (i <= len - 1) {
                        var dirname$$1 = path.dirname(that.configuration.mainData.components[i].file),
                            readmeFile = dirname$$1 + path.sep + 'README.md';
                        if (fs.existsSync(readmeFile)) {
                            logger.info('README.md exist for this component, include it');
                            fs.readFile(readmeFile, 'utf8', function (err, data) {
                                if (err) throw err;
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
                        } else {
                            that.configuration.addPage({
                                path: 'components',
                                name: that.configuration.mainData.components[i].name,
                                context: 'component',
                                component: that.configuration.mainData.components[i]
                            });
                            i++;
                            loop();
                        }
                    } else {
                        resolve$$1();
                    }
                };
                loop();
            });
        }
    }, {
        key: 'prepareInjectables',
        value: function prepareInjectables() {
            logger.info('Prepare injectables');
            this.configuration.mainData.injectables = $dependenciesEngine.getInjectables();
            var i = 0,
                len = this.configuration.mainData.injectables.length;
            for (i; i < len; i++) {
                this.configuration.addPage({
                    path: 'injectables',
                    name: this.configuration.mainData.injectables[i].name,
                    context: 'injectable',
                    injectable: this.configuration.mainData.injectables[i]
                });
            }
        }
    }, {
        key: 'prepareRoutes',
        value: function prepareRoutes() {
            logger.info('Process routes');
            this.configuration.mainData.routes = $dependenciesEngine.getRoutes();
            this.configuration.addPage({
                name: 'routes',
                context: 'routes'
            });
        }
    }, {
        key: 'prepareCoverage',
        value: function prepareCoverage() {
            logger.info('Process documentation coverage report');
            /*
             * loop with components, classes, injectables, interfaces, pipes
             */
            var files = [],
                totalProjectStatementDocumented = 0,
                getStatus = function getStatus(percent) {
                var status;
                if (percent <= 25) {
                    status = 'low';
                } else if (percent > 25 && percent <= 50) {
                    status = 'medium';
                } else if (percent > 50 && percent <= 75) {
                    status = 'good';
                } else {
                    status = 'very-good';
                }
                return status;
            };
            _.forEach(this.configuration.mainData.components, function (component) {
                var cl = {
                    filePath: component.file,
                    type: component.type,
                    name: component.name
                },
                    totalStatementDocumented = 0,
                    totalStatements = component.propertiesClass.length + component.methodsClass.length + component.inputsClass.length + component.outputsClass.length;
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
                cl.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
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
                },
                    totalStatementDocumented = 0,
                    totalStatements = classe.properties.length + classe.methods.length;
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
                cl.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
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
                },
                    totalStatementDocumented = 0,
                    totalStatements = injectable.properties.length + injectable.methods.length;
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
                cl.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
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
                },
                    totalStatementDocumented = 0,
                    totalStatements = inter.properties.length + inter.methods.length;
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
                cl.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
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
                },
                    totalStatementDocumented = 0,
                    totalStatements = 1;
                if (pipe.description !== '') {
                    totalStatementDocumented += 1;
                }
                cl.coveragePercent = Math.floor(totalStatementDocumented / totalStatements * 100);
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
        }
    }, {
        key: 'processPages',
        value: function processPages() {
            var _this6 = this;

            logger.info('Process pages');
            var pages = this.configuration.pages,
                i = 0,
                len = pages.length,
                loop = function loop() {
                if (i <= len - 1) {
                    logger.info('Process page', pages[i].name);
                    $htmlengine.render(_this6.configuration.mainData, pages[i]).then(function (htmlData) {
                        var finalPath = _this6.configuration.mainData.output;
                        if (_this6.configuration.mainData.output.lastIndexOf('/') === -1) {
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
                            } else {
                                i++;
                                loop();
                            }
                        });
                    }, function (errorMessage) {
                        logger.error(errorMessage);
                    });
                } else {
                    $searchEngine.generateSearchIndexJson(_this6.configuration.mainData.output);
                    if (_this6.configuration.mainData.assetsFolder !== '') {
                        _this6.processAssetsFolder();
                    }
                    _this6.processResources();
                }
            };
            loop();
        }
    }, {
        key: 'processAssetsFolder',
        value: function processAssetsFolder() {
            logger.info('Copy assets folder');
            if (!fs.existsSync(this.configuration.mainData.assetsFolder)) {
                logger.error('Provided assets folder ' + this.configuration.mainData.assetsFolder + ' did not exist');
            } else {
                var that = this;
                fs.copy(path.resolve(this.configuration.mainData.assetsFolder), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output + path.sep + this.configuration.mainData.assetsFolder), function (err) {
                    if (err) {
                        logger.error('Error during resources copy ', err);
                    }
                });
            }
        }
    }, {
        key: 'processResources',
        value: function processResources() {
            logger.info('Copy main resources');
            var that = this;
            fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output), function (err) {
                if (err) {
                    logger.error('Error during resources copy ', err);
                } else {
                    if (that.configuration.mainData.extTheme) {
                        fs.copy(path.resolve(process.cwd() + path.sep + that.configuration.mainData.extTheme), path.resolve(process.cwd() + path.sep + that.configuration.mainData.output + '/styles/'), function (err) {
                            if (err) {
                                logger.error('Error during external styling theme copy ', err);
                            } else {
                                logger.info('External styling theme copy succeeded');
                                that.processGraphs();
                            }
                        });
                    } else {
                        that.processGraphs();
                    }
                }
            });
        }
    }, {
        key: 'processGraphs',
        value: function processGraphs() {
            var _this7 = this;

            var onComplete = function onComplete() {
                var finalTime = (new Date() - startTime) / 1000;
                logger.info('Documentation generated in ' + _this7.configuration.mainData.output + ' in ' + finalTime + ' seconds using ' + _this7.configuration.mainData.theme + ' theme');
                if (_this7.configuration.mainData.serve) {
                    logger.info('Serving documentation from ' + _this7.configuration.mainData.output + ' at http://127.0.0.1:' + _this7.configuration.mainData.port);
                    _this7.runWebServer(_this7.configuration.mainData.output);
                }
            };
            if (this.configuration.mainData.disableGraph) {
                logger.info('Graph generation disabled');
                onComplete();
            } else {
                (function () {
                    logger.info('Process main graph');
                    var modules = _this7.configuration.mainData.modules,
                        i = 0,
                        len = modules.length,
                        loop = function loop() {
                        if (i <= len - 1) {
                            logger.info('Process module graph', modules[i].name);
                            var finalPath = _this7.configuration.mainData.output;
                            if (_this7.configuration.mainData.output.lastIndexOf('/') === -1) {
                                finalPath += '/';
                            }
                            finalPath += 'modules/' + modules[i].name;
                            $ngdengine.renderGraph(modules[i].file, finalPath, 'f').then(function () {
                                i++;
                                loop();
                            }, function (errorMessage) {
                                logger.error(errorMessage);
                            });
                        } else {
                            onComplete();
                        }
                    };
                    var finalMainGraphPath = _this7.configuration.mainData.output;
                    if (finalMainGraphPath.lastIndexOf('/') === -1) {
                        finalMainGraphPath += '/';
                    }
                    finalMainGraphPath += 'graph';
                    $ngdengine.renderGraph(_this7.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath), 'p').then(function () {
                        loop();
                    }, function (err) {
                        logger.error('Error during graph generation: ', err);
                    });
                })();
            }
        }
    }, {
        key: 'runWebServer',
        value: function runWebServer(folder) {
            LiveServer.start({
                root: folder,
                open: this.configuration.mainData.open,
                quiet: true,
                logLevel: 0,
                port: this.configuration.mainData.port
            });
        }
        /**
         * Return the application / root component instance.
         */

    }, {
        key: 'application',
        get: function get$$1() {
            return this;
        }
    }, {
        key: 'isCLI',
        get: function get$$1() {
            return false;
        }
    }]);
    return Application;
}();

var pkg$2 = require('../package.json');
var program = require('commander');
var files = [];
var cwd$1 = process.cwd();

var CliApplication = function (_Application) {
    inherits(CliApplication, _Application);

    function CliApplication() {
        classCallCheck(this, CliApplication);
        return possibleConstructorReturn(this, (CliApplication.__proto__ || Object.getPrototypeOf(CliApplication)).apply(this, arguments));
    }

    createClass(CliApplication, [{
        key: 'generate',

        /**
         * Run compodoc from the command line.
         */
        value: function generate() {
            var _this2 = this;

            program.version(pkg$2.version).usage('<src> [options]').option('-p, --tsconfig [config]', 'A tsconfig.json file').option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder).option('-b, --base [base]', 'Base reference of html tag <base>', COMPODOC_DEFAULTS.base).option('-y, --extTheme [file]', 'External styling theme file').option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title).option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder').option('-o, --open', 'Open the generated documentation', false).option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false).option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false).option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port).option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)').option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false).option('--disableSourceCode', 'Do not add source code tab', false).option('--disableGraph', 'Do not add the dependency graph', false).option('--disableCoverage', 'Do not add the documentation coverage report', false).parse(process.argv);
            var outputHelp = function outputHelp() {
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
                    logger.error(program.output + ' folder doesn\'t exist');
                    process.exit(1);
                } else {
                    logger.info('Serving documentation from ' + program.output + ' at http://127.0.0.1:' + program.port);
                    get(CliApplication.prototype.__proto__ || Object.getPrototypeOf(CliApplication.prototype), 'runWebServer', this).call(this, program.output);
                }
            } else if (program.serve && !program.tsconfig && !program.output) {
                // if only -s find ./documentation, if ok serve, else error provide -d
                if (!fs.existsSync(program.output)) {
                    logger.error('Provide output generated folder with -d flag');
                    process.exit(1);
                } else {
                    logger.info('Serving documentation from ' + program.output + ' at http://127.0.0.1:' + program.port);
                    get(CliApplication.prototype.__proto__ || Object.getPrototypeOf(CliApplication.prototype), 'runWebServer', this).call(this, program.output);
                }
            } else {
                (function () {
                    if (program.hideGenerator) {
                        _this2.configuration.mainData.hideGenerator = true;
                    }
                    var defaultWalkFOlder = cwd$1 || '.',
                        walk = function walk(dir, exclude) {
                        var results = [];
                        var list = fs.readdirSync(dir);
                        list.forEach(function (file) {
                            if (exclude.indexOf(file) < 0 && dir.indexOf('node_modules') < 0) {
                                file = path.join(dir, file);
                                var stat = fs.statSync(file);
                                if (stat && stat.isDirectory()) {
                                    results = results.concat(walk(file, exclude));
                                } else if (/(spec|\.d)\.ts/.test(file)) {
                                    logger.debug('Ignoring', file);
                                } else if (path.extname(file) === '.ts') {
                                    logger.debug('Including', file);
                                    results.push(file);
                                }
                            }
                        });
                        return results;
                    };
                    if (program.tsconfig && program.args.length === 0) {
                        _this2.configuration.mainData.tsconfig = program.tsconfig;
                        if (!fs.existsSync(program.tsconfig)) {
                            logger.error('"tsconfig.json" file was not found in the current directory');
                            process.exit(1);
                        } else {
                            var _file = path.join(path.join(process.cwd(), path.dirname(_this2.configuration.mainData.tsconfig)), path.basename(_this2.configuration.mainData.tsconfig));
                            logger.info('Using tsconfig', _file);
                            files = require(_file).files;
                            // use the current directory of tsconfig.json as a working directory
                            cwd$1 = _file.split(path.sep).slice(0, -1).join(path.sep);
                            if (!files) {
                                var exclude = require(_file).exclude || [];
                                files = walk(cwd$1 || '.', exclude);
                            }
                            get(CliApplication.prototype.__proto__ || Object.getPrototypeOf(CliApplication.prototype), 'setFiles', _this2).call(_this2, files);
                            get(CliApplication.prototype.__proto__ || Object.getPrototypeOf(CliApplication.prototype), 'generate', _this2).call(_this2);
                        }
                    } else if (program.tsconfig && program.args.length > 0) {
                        _this2.configuration.mainData.tsconfig = program.tsconfig;
                        var sourceFolder = program.args[0];
                        if (!fs.existsSync(sourceFolder)) {
                            logger.error('Provided source folder ' + sourceFolder + ' was not found in the current directory');
                            process.exit(1);
                        } else {
                            logger.info('Using provided source folder');
                            files = walk(path.resolve(sourceFolder), []);
                            get(CliApplication.prototype.__proto__ || Object.getPrototypeOf(CliApplication.prototype), 'setFiles', _this2).call(_this2, files);
                            get(CliApplication.prototype.__proto__ || Object.getPrototypeOf(CliApplication.prototype), 'generate', _this2).call(_this2);
                        }
                    } else {
                        logger.error('tsconfig.json file was not found, please use -p flag');
                        outputHelp();
                    }
                })();
            }
        }
    }]);
    return CliApplication;
}(Application);

exports.Application = Application;
exports.CliApplication = CliApplication;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiLCIuLi9zcmMvdXRpbHMvYW5ndWxhci1hcGkudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZGVwZW5kZW5jaWVzLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9tYXJrZG93bi5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZmlsZS5lbmdpbmUudHMiLCIuLi9zcmMvdXRpbHMvZGVmYXVsdHMudHMiLCIuLi9zcmMvYXBwL2NvbmZpZ3VyYXRpb24udHMiLCIuLi9zcmMvdXRpbHMvZ2xvYmFsLnBhdGgudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbmdkLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9zZWFyY2guZW5naW5lLnRzIiwiLi4vc3JjL3V0aWxzL3RzLWludGVybmFsLnRzIiwiLi4vc3JjL3V0aWxpdGllcy50cyIsIi4uL3NyYy91dGlscy9yb3V0ZXIucGFyc2VyLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9jb2RlZ2VuLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9kZXBlbmRlbmNpZXMudHMiLCIuLi9zcmMvYXBwL2FwcGxpY2F0aW9uLnRzIiwiLi4vc3JjL2luZGV4LWNsaS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgZ3V0aWwgPSByZXF1aXJlKCdndWxwLXV0aWwnKVxubGV0IGMgPSBndXRpbC5jb2xvcnM7XG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XG5cbmVudW0gTEVWRUwge1xuXHRJTkZPLFxuXHRERUJVRyxcbiAgICBFUlJPUlxufVxuXG5jbGFzcyBMb2dnZXIge1xuXG5cdG5hbWU7XG5cdGxvZ2dlcjtcblx0dmVyc2lvbjtcblx0c2lsZW50O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMubmFtZSA9IHBrZy5uYW1lO1xuXHRcdHRoaXMudmVyc2lvbiA9IHBrZy52ZXJzaW9uO1xuXHRcdHRoaXMubG9nZ2VyID0gZ3V0aWwubG9nO1xuXHRcdHRoaXMuc2lsZW50ID0gdHJ1ZTtcblx0fVxuXG5cdGluZm8oLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuSU5GTywgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0ZXJyb3IoLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuRVJST1IsIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdGRlYnVnKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkRFQlVHLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIGZvcm1hdChsZXZlbCwgLi4uYXJncykge1xuXG5cdFx0bGV0IHBhZCA9IChzLCBsLCBjPScnKSA9PiB7XG5cdFx0XHRyZXR1cm4gcyArIEFycmF5KCBNYXRoLm1heCgwLCBsIC0gcy5sZW5ndGggKyAxKSkuam9pbiggYyApXG5cdFx0fTtcblxuXHRcdGxldCBtc2cgPSBhcmdzLmpvaW4oJyAnKTtcblx0XHRpZihhcmdzLmxlbmd0aCA+IDEpIHtcblx0XHRcdG1zZyA9IGAkeyBwYWQoYXJncy5zaGlmdCgpLCAxNSwgJyAnKSB9OiAkeyBhcmdzLmpvaW4oJyAnKSB9YDtcblx0XHR9XG5cblxuXHRcdHN3aXRjaChsZXZlbCkge1xuXHRcdFx0Y2FzZSBMRVZFTC5JTkZPOlxuXHRcdFx0XHRtc2cgPSBjLmdyZWVuKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExFVkVMLkRFQlVHOlxuXHRcdFx0XHRtc2cgPSBjLmN5YW4obXNnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTEVWRUwuRVJST1I6XG5cdFx0XHRcdG1zZyA9IGMucmVkKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBbXG5cdFx0XHRtc2dcblx0XHRdLmpvaW4oJycpO1xuXHR9XG59XG5cbmV4cG9ydCBsZXQgbG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5sZXQgQW5ndWxhckFQSXMgPSByZXF1aXJlKCcuLi9zcmMvZGF0YS9hcGktbGlzdC5qc29uJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kZXJJbkFuZ3VsYXJBUElzKHR5cGU6IHN0cmluZykge1xuICAgIGxldCBfcmVzdWx0ID0ge1xuICAgICAgICBzb3VyY2U6ICdleHRlcm5hbCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICB9O1xuXG4gICAgXy5mb3JFYWNoKEFuZ3VsYXJBUElzLCBmdW5jdGlvbihhbmd1bGFyTW9kdWxlQVBJcywgYW5ndWxhck1vZHVsZSkge1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBhbmd1bGFyTW9kdWxlQVBJcy5sZW5ndGg7XG4gICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXJNb2R1bGVBUElzW2ldLnRpdGxlID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gYW5ndWxhck1vZHVsZUFQSXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIF9yZXN1bHQ7XG59XG4iLCJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7IGZpbmRlckluQW5ndWxhckFQSXMgfSBmcm9tICcuLi8uLi91dGlscy9hbmd1bGFyLWFwaSc7XG5cbmNsYXNzIERlcGVuZGVuY2llc0VuZ2luZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOkRlcGVuZGVuY2llc0VuZ2luZSA9IG5ldyBEZXBlbmRlbmNpZXNFbmdpbmUoKTtcbiAgICByYXdEYXRhOiBPYmplY3Q7XG4gICAgbW9kdWxlczogT2JqZWN0W107XG4gICAgY29tcG9uZW50czogT2JqZWN0W107XG4gICAgZGlyZWN0aXZlczogT2JqZWN0W107XG4gICAgaW5qZWN0YWJsZXM6IE9iamVjdFtdO1xuICAgIGludGVyZmFjZXM6IE9iamVjdFtdO1xuICAgIHJvdXRlczogT2JqZWN0W107XG4gICAgcGlwZXM6IE9iamVjdFtdO1xuICAgIGNsYXNzZXM6IE9iamVjdFtdO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZihEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgRGVwZW5kZW5jaWVzRW5naW5lLmdldEluc3RhbmNlKCkgaW5zdGVhZCBvZiBuZXcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTpEZXBlbmRlbmNpZXNFbmdpbmVcbiAgICB7XG4gICAgICAgIHJldHVybiBEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlO1xuICAgIH1cbiAgICBpbml0KGRhdGE6IE9iamVjdCkge1xuICAgICAgICB0aGlzLnJhd0RhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLm1vZHVsZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEubW9kdWxlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuY29tcG9uZW50cywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuZGlyZWN0aXZlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmluamVjdGFibGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmluamVjdGFibGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbnRlcmZhY2VzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucm91dGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aCh0aGlzLnJhd0RhdGEucm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucGlwZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEucGlwZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jbGFzc2VzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNsYXNzZXMsIFsnbmFtZSddKTtcbiAgICB9XG4gICAgZmluZCh0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnaW50ZXJuYWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlLmluZGV4T2YoZGF0YVtpXS5uYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gZGF0YVtpXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmluamVjdGFibGVzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmNsYXNzZXMpLFxuICAgICAgICAgICAgcmVzdWx0SW5Bbmd1bGFyQVBJcyA9IGZpbmRlckluQW5ndWxhckFQSXModHlwZSlcblxuICAgICAgICBpZiAocmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXNcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkNvbXBvZG9jQ2xhc3Nlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0NsYXNzZXNcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkFuZ3VsYXJBUElzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkFuZ3VsYXJBUElzXG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0TW9kdWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlcztcbiAgICB9XG4gICAgZ2V0Q29tcG9uZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cztcbiAgICB9XG4gICAgZ2V0RGlyZWN0aXZlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aXZlcztcbiAgICB9XG4gICAgZ2V0SW5qZWN0YWJsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluamVjdGFibGVzO1xuICAgIH1cbiAgICBnZXRJbnRlcmZhY2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2VzO1xuICAgIH1cbiAgICBnZXRSb3V0ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvdXRlcztcbiAgICB9XG4gICAgZ2V0UGlwZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpcGVzO1xuICAgIH1cbiAgICBnZXRDbGFzc2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jbGFzc2VzO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCAkZGVwZW5kZW5jaWVzRW5naW5lID0gRGVwZW5kZW5jaWVzRW5naW5lLmdldEluc3RhbmNlKCk7XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcbi8vaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICdoYW5kbGViYXJzLWhlbHBlcnMnO1xuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5cbmV4cG9ydCBjbGFzcyBIdG1sRW5naW5lIHtcbiAgICBjYWNoZTogT2JqZWN0ID0ge307XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vVE9ETyB1c2UgdGhpcyBpbnN0ZWFkIDogaHR0cHM6Ly9naXRodWIuY29tL2Fzc2VtYmxlL2hhbmRsZWJhcnMtaGVscGVyc1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCBcImNvbXBhcmVcIiwgZnVuY3Rpb24oYSwgb3BlcmF0b3IsIGIsIG9wdGlvbnMpIHtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaGFuZGxlYmFycyBIZWxwZXIge3tjb21wYXJlfX0gZXhwZWN0cyA0IGFyZ3VtZW50cycpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgICAgICAgY2FzZSAnaW5kZXhvZic6XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gKGIuaW5kZXhPZihhKSAhPT0gLTEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSA9PT0gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgICByZXN1bHQgPSBhICE9PSBiO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICByZXN1bHQgPSBhID4gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaGVscGVyIHt7Y29tcGFyZX19OiBpbnZhbGlkIG9wZXJhdG9yOiBgJyArIG9wZXJhdG9yICsgJ2AnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKFwiZmlsdGVyQW5ndWxhcjJNb2R1bGVzXCIsIGZ1bmN0aW9uKHRleHQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IE5HMl9NT0RVTEVTOnN0cmluZ1tdID0gW1xuICAgICAgICAgICAgICAgICdCcm93c2VyTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnRm9ybXNNb2R1bGUnLFxuICAgICAgICAgICAgICAgICdIdHRwTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnUm91dGVyTW9kdWxlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBsZW4gPSBORzJfTU9EVUxFUy5sZW5ndGg7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoTkcyX01PRFVMRVNbaV0pID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKFwiZGVidWdcIiwgZnVuY3Rpb24ob3B0aW9uYWxWYWx1ZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ3VycmVudCBDb250ZXh0XCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG5cbiAgICAgICAgICBpZiAob3B0aW9uYWxWYWx1ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPcHRpb25hbFZhbHVlXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCI9PT09PT09PT09PT09PT09PT09PVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9wdGlvbmFsVmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2JyZWFrbGluZXMnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAvZ20sICcmbmJzcDsnKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1x0L2dtLCAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2JyZWFrQ29tbWEnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvLC9nLCAnLDxicj4nKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZnVuY3Rpb25TaWduYXR1cmUnLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBtZXRob2QuYXJncy5tYXAoZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9yZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmQoYXJnLnR5cGUpO1xuICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBfcmVzdWx0LmRhdGEudHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgcGF0aCA9ICdjbGFzc2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogPGEgaHJlZj1cIi4vJHtwYXRofXMvJHtfcmVzdWx0LmRhdGEubmFtZX0uaHRtbFwiID4ke2FyZy50eXBlfTwvYT5gO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSAnaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS8nICsgX3Jlc3VsdC5kYXRhLnBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJnLm5hbWV9OiA8YSBocmVmPVwiJHtwYXRofVwiIHRhcmdldD1cIl9ibGFua1wiID4ke2FyZy50eXBlfTwvYT5gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogJHthcmcudHlwZX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmpvaW4oJywgJyk7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9KCR7YXJnc30pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoJHthcmdzfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignanNkb2MtcmV0dXJucy1jb21tZW50JywgZnVuY3Rpb24oanNkb2NUYWdzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3JldHVybnMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBqc2RvY1RhZ3NbaV0uY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXBhcmFtcycsIGZ1bmN0aW9uKGpzZG9jVGFncywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgdGFncyA9IFtdO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdwYXJhbScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24gJiYganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy50eXBlID0ganNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uLnR5cGUubmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcuY29tbWVudCA9IGpzZG9jVGFnc1tpXS5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnBhcmFtZXRlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcubmFtZSA9IGpzZG9jVGFnc1tpXS5wYXJhbWV0ZXJOYW1lLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MucHVzaCh0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbGlua1R5cGUnLCBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgX3Jlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZChuYW1lKTtcbiAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlID0ge1xuICAgICAgICAgICAgICAgICAgICByYXc6IG5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9yZXN1bHQuc291cmNlID09PSAnaW50ZXJuYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgX3Jlc3VsdC5kYXRhLnR5cGUgPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSAnLi8nICsgX3Jlc3VsdC5kYXRhLnR5cGUgKyAncy8nICsgX3Jlc3VsdC5kYXRhLm5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUudGFyZ2V0ID0gJ19zZWxmJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUuaHJlZiA9ICdodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpLycgKyBfcmVzdWx0LmRhdGEucGF0aDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfYmxhbmsnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaW5kZXhhYmxlU2lnbmF0dXJlJywgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGFyZyA9PiBgJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YCkuam9pbignLCAnKTtcbiAgICAgICAgICAgIGlmIChtZXRob2QubmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHttZXRob2QubmFtZX1bJHthcmdzfV1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYFske2FyZ3N9XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdvYmplY3QnLCBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkodGV4dCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC97XCIvLCAnezxicj4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIicpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvLFwiLywgJyw8YnI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCInKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL30kLywgJzxicj59Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluaXQoKSB7XG4gICAgICAgIGxldCBwYXJ0aWFscyA9IFtcbiAgICAgICAgICAgICdtZW51JyxcbiAgICAgICAgICAgICdvdmVydmlldycsXG4gICAgICAgICAgICAncmVhZG1lJyxcbiAgICAgICAgICAgICdtb2R1bGVzJyxcbiAgICAgICAgICAgICdtb2R1bGUnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAnY29tcG9uZW50LWRldGFpbCcsXG4gICAgICAgICAgICAnZGlyZWN0aXZlcycsXG4gICAgICAgICAgICAnZGlyZWN0aXZlJyxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAncGlwZXMnLFxuICAgICAgICAgICAgJ3BpcGUnLFxuICAgICAgICAgICAgJ2NsYXNzZXMnLFxuICAgICAgICAgICAgJ2NsYXNzJyxcblx0ICAgICAgICAnaW50ZXJmYWNlJyxcbiAgICAgICAgICAgICdyb3V0ZXMnLFxuICAgICAgICAgICAgJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICdzZWFyY2gtaW5wdXQnLFxuICAgICAgICAgICAgJ2xpbmstdHlwZScsXG4gICAgICAgICAgICAnYmxvY2stbWV0aG9kJyxcbiAgICAgICAgICAgICdibG9jay1wcm9wZXJ0eScsXG4gICAgICAgICAgICAnY292ZXJhZ2UtcmVwb3J0J1xuICAgICAgICBdLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBwYXJ0aWFscy5sZW5ndGgsXG4gICAgICAgICAgICBsb29wID0gKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvJyArIHBhcnRpYWxzW2ldICsgJy5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7IHJlamVjdCgpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbChwYXJ0aWFsc1tpXSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBsb29wKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXIobWFpbkRhdGE6YW55LCBwYWdlOmFueSkge1xuICAgICAgICB2YXIgbyA9IG1haW5EYXRhLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obywgcGFnZSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGlmKHRoYXQuY2FjaGVbJ3BhZ2UnXSkge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUodGhhdC5jYWNoZVsncGFnZSddKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFnZS5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBpbmRleCAnICsgcGFnZS5uYW1lICsgJyBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jYWNoZVsncGFnZSddID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlOmFueSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1hcmtlZCwgeyBSZW5kZXJlciB9IGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgaGlnaGxpZ2h0anMgZnJvbSAnaGlnaGxpZ2h0LmpzJztcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIoKTtcbiAgICAgICAgcmVuZGVyZXIuY29kZSA9IChjb2RlLCBsYW5ndWFnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsaWRMYW5nID0gISEobGFuZ3VhZ2UgJiYgaGlnaGxpZ2h0anMuZ2V0TGFuZ3VhZ2UobGFuZ3VhZ2UpKTtcbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRlZCA9IHZhbGlkTGFuZyA/IGhpZ2hsaWdodGpzLmhpZ2hsaWdodChsYW5ndWFnZSwgY29kZSkudmFsdWUgOiBjb2RlO1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRlZC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpL2dtLCAnPGJyPicpO1xuICAgICAgICAgICAgcmV0dXJuIGA8cHJlPjxjb2RlIGNsYXNzPVwiaGxqcyAke2xhbmd1YWdlfVwiPiR7aGlnaGxpZ2h0ZWR9PC9jb2RlPjwvcHJlPmA7XG4gICAgICAgIH07XG5cbiAgICAgICAgbWFya2VkLnNldE9wdGlvbnMoeyByZW5kZXJlciB9KTtcbiAgICB9XG4gICAgZ2V0UmVhZG1lRmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyAnL1JFQURNRS5tZCcpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIFJFQURNRS5tZCBmaWxlIHJlYWRpbmcnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hcmtlZChkYXRhKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcblxuZXhwb3J0IGNsYXNzIEZpbGVFbmdpbmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgfVxuICAgIGdldChmaWxlcGF0aDpTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZXBhdGgpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyAnICsgZmlsZXBhdGggKyAnIHJlYWQnKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJleHBvcnQgY29uc3QgQ09NUE9ET0NfREVGQVVMVFMgPSB7XG4gICAgdGl0bGU6ICdBcHBsaWNhdGlvbiBkb2N1bWVudGF0aW9uJyxcbiAgICBhZGRpdGlvbmFsRW50cnlOYW1lOiAnQWRkaXRpb25hbCBkb2N1bWVudGF0aW9uJyxcbiAgICBhZGRpdGlvbmFsRW50cnlQYXRoOiAnYWRkaXRpb25hbC1kb2N1bWVudGF0aW9uJyxcbiAgICBmb2xkZXI6ICcuL2RvY3VtZW50YXRpb24vJyxcbiAgICBwb3J0OiA4MDgwLFxuICAgIHRoZW1lOiAnZ2l0Ym9vaycsXG4gICAgYmFzZTogJy8nLFxuICAgIGRpc2FibGVTb3VyY2VDb2RlOiBmYWxzZSxcbiAgICBkaXNhYmxlR3JhcGg6IGZhbHNlLFxuICAgIGRpc2FibGVDb3ZlcmFnZTogZmFsc2Vcbn1cbiIsImltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vdXRpbHMvZGVmYXVsdHMnO1xuXG5pbnRlcmZhY2UgUGFnZSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGNvbnRleHQ6IHN0cmluZztcbiAgICBwYXRoPzogc3RyaW5nO1xuICAgIG1vZHVsZT86IGFueTtcbiAgICBwaXBlPzogYW55O1xuICAgIGNsYXNzPzogYW55O1xuICAgIGludGVyZmFjZT86IGFueTtcbiAgICBkaXJlY3RpdmU/OiBhbnk7XG4gICAgaW5qZWN0YWJsZT86IGFueTtcbiAgICBmaWxlcz86IGFueTtcbiAgICBkYXRhPzogYW55O1xufVxuXG5pbnRlcmZhY2UgSU1haW5EYXRhIHtcbiAgICBvdXRwdXQ6IHN0cmluZztcbiAgICB0aGVtZTogc3RyaW5nO1xuICAgIGV4dFRoZW1lOiBzdHJpbmc7XG4gICAgc2VydmU6IGJvb2xlYW47XG4gICAgcG9ydDogbnVtYmVyO1xuICAgIG9wZW46IGJvb2xlYW47XG4gICAgYXNzZXRzRm9sZGVyOiBzdHJpbmc7XG4gICAgZG9jdW1lbnRhdGlvbk1haW5OYW1lOiBzdHJpbmc7XG4gICAgZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGJhc2U6IHN0cmluZztcbiAgICBoaWRlR2VuZXJhdG9yOiBib29sZWFuO1xuICAgIG1vZHVsZXM6IGFueTtcbiAgICByZWFkbWU6IHN0cmluZztcbiAgICBhZGRpdGlvbmFscGFnZXM6IE9iamVjdDtcbiAgICBwaXBlczogYW55O1xuICAgIGNsYXNzZXM6IGFueTtcbiAgICBpbnRlcmZhY2VzOiBhbnk7XG4gICAgY29tcG9uZW50czogYW55O1xuICAgIGRpcmVjdGl2ZXM6IGFueTtcbiAgICBpbmplY3RhYmxlczogYW55O1xuICAgIHJvdXRlczogYW55O1xuICAgIHRzY29uZmlnOiBzdHJpbmc7XG4gICAgaW5jbHVkZXM6IGJvb2xlYW47XG4gICAgaW5jbHVkZXNOYW1lOiBzdHJpbmc7XG4gICAgZGlzYWJsZVNvdXJjZUNvZGU6IGJvb2xlYW47XG4gICAgZGlzYWJsZUdyYXBoOiBib29sZWFuO1xuICAgIGRpc2FibGVDb3ZlcmFnZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29uZmlndXJhdGlvbiB7XG4gICAgbWFpbkRhdGE6IElNYWluRGF0YTtcbiAgICBwYWdlczpBcnJheTxQYWdlPjtcbiAgICBhZGRQYWdlKHBhZ2U6IFBhZ2UpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQ29uZmlndXJhdGlvbiBpbXBsZW1lbnRzIElDb25maWd1cmF0aW9uIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6Q29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKCk7XG5cbiAgICBwcml2YXRlIF9wYWdlczpBcnJheTxQYWdlPiA9IFtdO1xuICAgIHByaXZhdGUgX21haW5EYXRhOiBJTWFpbkRhdGEgPSB7XG4gICAgICAgIG91dHB1dDogQ09NUE9ET0NfREVGQVVMVFMuZm9sZGVyLFxuICAgICAgICB0aGVtZTogQ09NUE9ET0NfREVGQVVMVFMudGhlbWUsXG4gICAgICAgIGV4dFRoZW1lOiAnJyxcbiAgICAgICAgc2VydmU6IGZhbHNlLFxuICAgICAgICBwb3J0OiBDT01QT0RPQ19ERUZBVUxUUy5wb3J0LFxuICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgYXNzZXRzRm9sZGVyOiAnJyxcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5OYW1lOiBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbjogJycsXG4gICAgICAgIGJhc2U6IENPTVBPRE9DX0RFRkFVTFRTLmJhc2UsXG4gICAgICAgIGhpZGVHZW5lcmF0b3I6IGZhbHNlLFxuICAgICAgICBtb2R1bGVzOiBbXSxcbiAgICAgICAgcmVhZG1lOiAnJyxcbiAgICAgICAgYWRkaXRpb25hbHBhZ2VzOiB7fSxcbiAgICAgICAgcGlwZXM6IFtdLFxuICAgICAgICBjbGFzc2VzOiBbXSxcbiAgICAgICAgaW50ZXJmYWNlczogW10sXG4gICAgICAgIGNvbXBvbmVudHM6IFtdLFxuICAgICAgICBkaXJlY3RpdmVzOiBbXSxcbiAgICAgICAgaW5qZWN0YWJsZXM6IFtdLFxuICAgICAgICByb3V0ZXM6IFtdLFxuICAgICAgICB0c2NvbmZpZzogJycsXG4gICAgICAgIGluY2x1ZGVzOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZVNvdXJjZUNvZGU6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVTb3VyY2VDb2RlLFxuICAgICAgICBkaXNhYmxlR3JhcGg6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVHcmFwaCxcbiAgICAgICAgZGlzYWJsZUNvdmVyYWdlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlQ292ZXJhZ2VcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmKENvbmZpZ3VyYXRpb24uX2luc3RhbmNlKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIENvbmZpZ3VyYXRpb24uX2luc3RhbmNlID0gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6Q29uZmlndXJhdGlvblxuICAgIHtcbiAgICAgICAgcmV0dXJuIENvbmZpZ3VyYXRpb24uX2luc3RhbmNlO1xuICAgIH1cblxuICAgIGFkZFBhZ2UocGFnZTogUGFnZSkge1xuICAgICAgICB0aGlzLl9wYWdlcy5wdXNoKHBhZ2UpO1xuICAgIH1cblxuICAgIGdldCBwYWdlcygpOkFycmF5PFBhZ2U+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZ2VzO1xuICAgIH1cbiAgICBzZXQgcGFnZXMocGFnZXM6QXJyYXk8UGFnZT4pIHtcbiAgICAgICAgdGhpcy5fcGFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXQgbWFpbkRhdGEoKTpJTWFpbkRhdGEge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFpbkRhdGE7XG4gICAgfVxuICAgIHNldCBtYWluRGF0YShkYXRhOklNYWluRGF0YSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuX21haW5EYXRhLCBkYXRhKTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzR2xvYmFsKCkge1xuICAgIHZhciBiaW5QYXRoLFxuICAgICAgICBnbG9iYWxCaW5QYXRoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoYmluUGF0aCkgcmV0dXJuIGJpblBhdGhcblxuICAgICAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGF0aG5hbWVzID0gcHJvY2Vzcy5lbnYuUEFUSC5zcGxpdChwYXRoLmRlbGltaXRlcilcbiAgICAgICAgICAgICAgICB2YXIgbGVuID0gcGF0aG5hbWVzLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aC5iYXNlbmFtZShwYXRobmFtZXNbaV0pID09PSAnbnBtJyB8fCBwYXRoLmJhc2VuYW1lKHBhdGhuYW1lc1tpXSkgPT09ICdub2RlanMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5QYXRoID0gcGF0aG5hbWVzW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiaW5QYXRoID0gcGF0aC5kaXJuYW1lKHByb2Nlc3MuZXhlY1BhdGgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBiaW5QYXRoXG4gICAgICAgIH0sXG4gICAgICAgIHN0cmlwVHJhaWxpbmdTZXAgPSBmdW5jdGlvbih0aGVQYXRoKSB7XG4gICAgICAgICAgICBpZiAodGhlUGF0aFt0aGVQYXRoLmxlbmd0aCAtIDFdID09PSBwYXRoLnNlcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGVQYXRoLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGVQYXRoO1xuICAgICAgICB9LFxuICAgICAgICBwYXRoSXNJbnNpZGUgPSBmdW5jdGlvbih0aGVQYXRoLCBwb3RlbnRpYWxQYXJlbnQpIHtcbiAgICAgICAgICAgIC8vIEZvciBpbnNpZGUtZGlyZWN0b3J5IGNoZWNraW5nLCB3ZSB3YW50IHRvIGFsbG93IHRyYWlsaW5nIHNsYXNoZXMsIHNvIG5vcm1hbGl6ZS5cbiAgICAgICAgICAgIHRoZVBhdGggPSBzdHJpcFRyYWlsaW5nU2VwKHRoZVBhdGgpO1xuICAgICAgICAgICAgcG90ZW50aWFsUGFyZW50ID0gc3RyaXBUcmFpbGluZ1NlcChwb3RlbnRpYWxQYXJlbnQpO1xuXG4gICAgICAgICAgICAvLyBOb2RlIHRyZWF0cyBvbmx5IFdpbmRvd3MgYXMgY2FzZS1pbnNlbnNpdGl2ZSBpbiBpdHMgcGF0aCBtb2R1bGU7IHdlIGZvbGxvdyB0aG9zZSBjb252ZW50aW9ucy5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcbiAgICAgICAgICAgICAgICB0aGVQYXRoID0gdGhlUGF0aC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHBvdGVudGlhbFBhcmVudCA9IHBvdGVudGlhbFBhcmVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhlUGF0aC5sYXN0SW5kZXhPZihwb3RlbnRpYWxQYXJlbnQsIDApID09PSAwICYmXG4gICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICB0aGVQYXRoW3BvdGVudGlhbFBhcmVudC5sZW5ndGhdID09PSBwYXRoLnNlcCB8fFxuICAgICAgICAgICAgICAgICAgICB0aGVQYXRoW3BvdGVudGlhbFBhcmVudC5sZW5ndGhdID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICBpc1BhdGhJbnNpZGUgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICBhID0gcGF0aC5yZXNvbHZlKGEpO1xuICAgICAgICAgICAgYiA9IHBhdGgucmVzb2x2ZShiKTtcblxuICAgICAgICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXRoSXNJbnNpZGUoYSwgYik7XG4gICAgICAgIH1cbiAgICByZXR1cm4gaXNQYXRoSW5zaWRlKHByb2Nlc3MuYXJndlsxXSB8fCAnJywgZ2xvYmFsQmluUGF0aCgpIHx8ICcnKVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQgaXNHbG9iYWwgZnJvbSAnLi4vLi4vdXRpbHMvZ2xvYmFsLnBhdGgnO1xuXG5leHBvcnQgY2xhc3MgTmdkRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIH1cbiAgICByZW5kZXJHcmFwaChmaWxlcGF0aDpTdHJpbmcsIG91dHB1dHBhdGg6IFN0cmluZywgdHlwZTogU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgbGV0IG5nZFBhdGggPSAoaXNHbG9iYWwoKSkgPyBfX2Rpcm5hbWUgKyAnLy4uL25vZGVfbW9kdWxlcy8uYmluL25nZCcgOiBfX2Rpcm5hbWUgKyAnLy4uLy4uLy5iaW4vbmdkJztcbiAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk1PREUgJiYgcHJvY2Vzcy5lbnYuTU9ERSA9PT0gJ1RFU1RJTkcnKSB7XG4gICAgICAgICAgICAgICBuZ2RQYXRoID0gX19kaXJuYW1lICsgJy8uLi9ub2RlX21vZHVsZXMvLmJpbi9uZ2QnO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIGlmICgvIC9nLnRlc3QobmdkUGF0aCkpIHtcbiAgICAgICAgICAgICAgIG5nZFBhdGggPSBuZ2RQYXRoLnJlcGxhY2UoLyAvZywgJ14gJyk7XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHBhdGgucmVzb2x2ZShuZ2RQYXRoKSArICcgLScgKyB0eXBlICsgJyAnICsgZmlsZXBhdGggKyAnIC1kICcgKyBvdXRwdXRwYXRoICsgJyAtcyAtdCBzdmcnXG4gICAgICAgICAgIFNoZWxsanMuZXhlYyhmaW5hbFBhdGgsIHtcbiAgICAgICAgICAgICAgIHNpbGVudDogdHJ1ZVxuICAgICAgICAgICB9LCBmdW5jdGlvbihjb2RlLCBzdGRvdXQsIHN0ZGVycikge1xuICAgICAgICAgICAgICAgaWYoY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KHN0ZGVycik7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XG5cbmNvbnN0IGx1bnI6IGFueSA9IHJlcXVpcmUoJ2x1bnInKSxcbiAgICAgIGNoZWVyaW86IGFueSA9IHJlcXVpcmUoJ2NoZWVyaW8nKSxcbiAgICAgIEVudGl0aWVzOmFueSA9IHJlcXVpcmUoJ2h0bWwtZW50aXRpZXMnKS5BbGxIdG1sRW50aXRpZXMsXG4gICAgICAkY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSxcbiAgICAgIEh0bWwgPSBuZXcgRW50aXRpZXMoKTtcblxuZXhwb3J0IGNsYXNzIFNlYXJjaEVuZ2luZSB7XG4gICAgc2VhcmNoSW5kZXg6IGFueTtcbiAgICBkb2N1bWVudHNTdG9yZTogT2JqZWN0ID0ge307XG4gICAgaW5kZXhTaXplOiBudW1iZXI7XG4gICAgY29uc3RydWN0b3IoKSB7fVxuICAgIHByaXZhdGUgZ2V0U2VhcmNoSW5kZXgoKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWFyY2hJbmRleCkge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hJbmRleCA9IGx1bnIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmKCd1cmwnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCd0aXRsZScsIHsgYm9vc3Q6IDEwIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZmllbGQoJ2JvZHknKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlYXJjaEluZGV4O1xuICAgIH1cbiAgICBpbmRleFBhZ2UocGFnZSkge1xuICAgICAgICB2YXIgdGV4dCxcbiAgICAgICAgICAgICQgPSBjaGVlcmlvLmxvYWQocGFnZS5yYXdEYXRhKTtcblxuICAgICAgICB0ZXh0ID0gJCgnLmNvbnRlbnQnKS5odG1sKCk7XG4gICAgICAgIHRleHQgPSBIdG1sLmRlY29kZSh0ZXh0KTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKDwoW14+XSspPikvaWcsICcnKTtcblxuICAgICAgICBwYWdlLnVybCA9IHBhZ2UudXJsLnJlcGxhY2UoJGNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0LCAnJyk7XG5cbiAgICAgICAgdmFyIGRvYyA9IHtcbiAgICAgICAgICAgIHVybDogcGFnZS51cmwsXG4gICAgICAgICAgICB0aXRsZTogcGFnZS5pbmZvcy5jb250ZXh0ICsgJyAtICcgKyBwYWdlLmluZm9zLm5hbWUsXG4gICAgICAgICAgICBib2R5OiB0ZXh0XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kb2N1bWVudHNTdG9yZVtkb2MudXJsXSA9IGRvYztcblxuICAgICAgICB0aGlzLmdldFNlYXJjaEluZGV4KCkuYWRkKGRvYyk7XG4gICAgfVxuICAgIGdlbmVyYXRlU2VhcmNoSW5kZXhKc29uKG91dHB1dEZvbGRlcikge1xuICAgICAgICBmcy53cml0ZUpzb24ocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJ3NlYXJjaF9pbmRleC5qc29uJyksIHtcbiAgICAgICAgICAgIGluZGV4OiB0aGlzLmdldFNlYXJjaEluZGV4KCksXG4gICAgICAgICAgICBzdG9yZTogdGhpcy5kb2N1bWVudHNTdG9yZVxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBzZWFyY2ggaW5kZXggZmlsZSBnZW5lcmF0aW9uICcsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyB0cyBmcm9tIFwidHlwZXNjcmlwdFwiO1xuY29uc3QgdHNhbnkgPSB0cyBhcyBhbnk7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iLzIuMS9zcmMvY29tcGlsZXIvdXRpbGl0aWVzLnRzI0wxNTA3XG5leHBvcnQgZnVuY3Rpb24gZ2V0SlNEb2NzKG5vZGU6IHRzLk5vZGUpIHtcbiAgcmV0dXJuIHRzYW55LmdldEpTRG9jcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5jb25zdCBjYXJyaWFnZVJldHVybkxpbmVGZWVkID0gJ1xcclxcbic7XG5jb25zdCBsaW5lRmVlZCA9ICdcXG4nO1xuXG4vLyBnZXQgZGVmYXVsdCBuZXcgbGluZSBicmVha1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5ld0xpbmVDaGFyYWN0ZXIob3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zKTogc3RyaW5nIHtcbiAgICBpZiAob3B0aW9ucy5uZXdMaW5lID09PSB0cy5OZXdMaW5lS2luZC5DYXJyaWFnZVJldHVybkxpbmVGZWVkKSB7XG4gICAgICAgIHJldHVybiBjYXJyaWFnZVJldHVybkxpbmVGZWVkO1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zLm5ld0xpbmUgPT09IHRzLk5ld0xpbmVLaW5kLkxpbmVGZWVkKSB7XG4gICAgICAgIHJldHVybiBsaW5lRmVlZDtcbiAgICB9XG4gICAgcmV0dXJuIGNhcnJpYWdlUmV0dXJuTGluZUZlZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RJbmRlbnQoc3RyLCBjb3VudCwgaW5kZW50Pyk6IHN0cmluZyB7XG4gICAgbGV0IHN0cmlwSW5kZW50ID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzdHIubWF0Y2goL15bIFxcdF0qKD89XFxTKS9nbSk7XG5cbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IHVzZSBzcHJlYWQgb3BlcmF0b3Igd2hlbiB0YXJnZXRpbmcgTm9kZS5qcyA2XG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIG1hdGNoLm1hcCh4ID0+IHgubGVuZ3RoKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGBeWyBcXFxcdF17JHtpbmRlbnR9fWAsICdnbScpO1xuXG4gICAgICAgIHJldHVybiBpbmRlbnQgPiAwID8gc3RyLnJlcGxhY2UocmUsICcnKSA6IHN0cjtcbiAgICB9LFxuICAgICAgICByZXBlYXRpbmcgPSBmdW5jdGlvbihuLCBzdHIpIHtcbiAgICAgICAgc3RyID0gc3RyID09PSB1bmRlZmluZWQgPyAnICcgOiBzdHI7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuIDwgMCB8fCAhTnVtYmVyLmlzRmluaXRlKG4pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIHBvc2l0aXZlIGZpbml0ZSBudW1iZXIsIGdvdCBcXGAke259XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmV0ID0gJyc7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XG4gICAgICAgICAgICAgICAgcmV0ICs9IHN0cjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RyICs9IHN0cjtcbiAgICAgICAgfSB3aGlsZSAoKG4gPj49IDEpKTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgaW5kZW50U3RyaW5nID0gZnVuY3Rpb24oc3RyLCBjb3VudCwgaW5kZW50KSB7XG4gICAgICAgIGluZGVudCA9IGluZGVudCA9PT0gdW5kZWZpbmVkID8gJyAnIDogaW5kZW50O1xuICAgICAgICBjb3VudCA9IGNvdW50ID09PSB1bmRlZmluZWQgPyAxIDogY291bnQ7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgY291bnQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIFxcYG51bWJlclxcYCwgZ290IFxcYCR7dHlwZW9mIGNvdW50fVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBpbmRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbmRlbnRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBpbmRlbnR9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICBpbmRlbnQgPSBjb3VudCA+IDEgPyByZXBlYXRpbmcoY291bnQsIGluZGVudCkgOiBpbmRlbnQ7XG5cbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eKD8hXFxzKiQpL21nLCBpbmRlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBpbmRlbnRTdHJpbmcoc3RyaXBJbmRlbnQoc3RyKSwgY291bnQgfHwgMCwgaW5kZW50KTtcbn1cblxuLy8gQ3JlYXRlIGEgY29tcGlsZXJIb3N0IG9iamVjdCB0byBhbGxvdyB0aGUgY29tcGlsZXIgdG8gcmVhZCBhbmQgd3JpdGUgZmlsZXNcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlckhvc3QodHJhbnNwaWxlT3B0aW9uczogYW55KTogdHMuQ29tcGlsZXJIb3N0IHtcblxuICAgIGNvbnN0IGlucHV0RmlsZU5hbWUgPSB0cmFuc3BpbGVPcHRpb25zLmZpbGVOYW1lIHx8ICh0cmFuc3BpbGVPcHRpb25zLmpzeCA/ICdtb2R1bGUudHN4JyA6ICdtb2R1bGUudHMnKTtcblxuICAgIGNvbnN0IGNvbXBpbGVySG9zdDogdHMuQ29tcGlsZXJIb3N0ID0ge1xuICAgICAgICBnZXRTb3VyY2VGaWxlOiAoZmlsZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChmaWxlTmFtZS5sYXN0SW5kZXhPZignLnRzJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnbGliLmQudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBhdGguaXNBYnNvbHV0ZShmaWxlTmFtZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gcGF0aC5qb2luKHRyYW5zcGlsZU9wdGlvbnMudHNjb25maWdEaXJlY3RvcnksIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgbGliU291cmNlID0gJyc7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBsaWJTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZU5hbWUpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGUsIGZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShmaWxlTmFtZSwgbGliU291cmNlLCB0cmFuc3BpbGVPcHRpb25zLnRhcmdldCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGVGaWxlOiAobmFtZSwgdGV4dCkgPT4ge30sXG4gICAgICAgIGdldERlZmF1bHRMaWJGaWxlTmFtZTogKCkgPT4gJ2xpYi5kLnRzJyxcbiAgICAgICAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lczogKCkgPT4gZmFsc2UsXG4gICAgICAgIGdldENhbm9uaWNhbEZpbGVOYW1lOiBmaWxlTmFtZSA9PiBmaWxlTmFtZSxcbiAgICAgICAgZ2V0Q3VycmVudERpcmVjdG9yeTogKCkgPT4gJycsXG4gICAgICAgIGdldE5ld0xpbmU6ICgpID0+ICdcXG4nLFxuICAgICAgICBmaWxlRXhpc3RzOiAoZmlsZU5hbWUpOiBib29sZWFuID0+IGZpbGVOYW1lID09PSBpbnB1dEZpbGVOYW1lLFxuICAgICAgICByZWFkRmlsZTogKCkgPT4gJycsXG4gICAgICAgIGRpcmVjdG9yeUV4aXN0czogKCkgPT4gdHJ1ZSxcbiAgICAgICAgZ2V0RGlyZWN0b3JpZXM6ICgpID0+IFtdXG4gICAgfTtcbiAgICByZXR1cm4gY29tcGlsZXJIb3N0O1xufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcblxuZXhwb3J0IGxldCBSb3V0ZXJQYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcm91dGVzID0gW10sXG4gICAgICAgIG1vZHVsZXMgPSBbXSxcbiAgICAgICAgbW9kdWxlc1RyZWUsXG4gICAgICAgIHJvb3RNb2R1bGUsXG4gICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gW107XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhZGRSb3V0ZTogZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgIHJvdXRlcy5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgIHJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgocm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZE1vZHVsZVdpdGhSb3V0ZXM6IGZ1bmN0aW9uKG1vZHVsZU5hbWUsIG1vZHVsZUltcG9ydHMpIHtcbiAgICAgICAgICAgIG1vZHVsZXNXaXRoUm91dGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlc1dpdGhSb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKG1vZHVsZXNXaXRoUm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZE1vZHVsZTogZnVuY3Rpb24obW9kdWxlTmFtZTogc3RyaW5nLCBtb2R1bGVJbXBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgobW9kdWxlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBzZXRSb290TW9kdWxlOiBmdW5jdGlvbihtb2R1bGU6IHN0cmluZykge1xuICAgICAgICAgICAgcm9vdE1vZHVsZSA9IG1vZHVsZTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJpbnRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHJvdXRlcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhc1JvdXRlck1vZHVsZUluSW1wb3J0czogZnVuY3Rpb24oaW1wb3J0cykge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGltcG9ydHMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JDaGlsZCcpICE9PSAtMSB8fFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRzW2ldLm5hbWUuaW5kZXhPZignUm91dGVyTW9kdWxlLmZvclJvb3QnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBsaW5rTW9kdWxlc0FuZFJvdXRlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL3NjYW4gZWFjaCBtb2R1bGUgaW1wb3J0cyBBU1QgZm9yIGVhY2ggcm91dGVzLCBhbmQgbGluayByb3V0ZXMgd2l0aCBtb2R1bGVcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtb2R1bGVzV2l0aFJvdXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzV2l0aFJvdXRlc1tpXS5pbXBvcnRzTm9kZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gobm9kZS5pbml0aWFsaXplci5lbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbmQgZWxlbWVudCB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50LmFyZ3VtZW50cywgZnVuY3Rpb24oYXJndW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocm91dGVzLCBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0ICYmIHJvdXRlLm5hbWUgPT09IGFyZ3VtZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLm1vZHVsZSA9IG1vZHVsZXNXaXRoUm91dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29uc3RydWN0Um91dGVzVHJlZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjb25zdHJ1Y3RSb3V0ZXNUcmVlJyk7XG4gICAgICAgICAgICAvLyByb3V0ZXNbXSBjb250YWlucyByb3V0ZXMgd2l0aCBtb2R1bGUgbGlua1xuICAgICAgICAgICAgLy8gbW9kdWxlc1RyZWUgY29udGFpbnMgbW9kdWxlcyB0cmVlXG4gICAgICAgICAgICAvLyBtYWtlIGEgZmluYWwgcm91dGVzIHRyZWUgd2l0aCB0aGF0XG4gICAgICAgICAgICBsZXQgY2xlYW5Nb2R1bGVzVHJlZSA9IF8uY2xvbmVEZWVwKG1vZHVsZXNUcmVlKSxcbiAgICAgICAgICAgICAgICBtb2R1bGVzQ2xlYW5lciA9IGZ1bmN0aW9uKGFycikge1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldLmltcG9ydHNOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFycltpXS5pbXBvcnRzTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJbaV0ucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFycltpXS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihhcnJbaV0uY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihjbGVhbk1vZHVsZXNUcmVlKTtcbiAgICAgICAgICAgIC8vZnMub3V0cHV0SnNvbignLi9tb2R1bGVzLmpzb24nLCBjbGVhbk1vZHVsZXNUcmVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbGVhbk1vZHVsZXNUcmVlIGxpZ2h0OiAnLCB1dGlsLmluc3BlY3QoY2xlYW5Nb2R1bGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgdmFyIHJvdXRlc1RyZWUgPSB7XG4gICAgICAgICAgICAgICAgdGFnOiAnPHJvb3Q+JyxcbiAgICAgICAgICAgICAgICBraW5kOiAnbmdNb2R1bGUnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHJvb3RNb2R1bGUsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsZXQgZm91bmRSb3V0ZVdpdGhNb2R1bGVOYW1lID0gZnVuY3Rpb24obW9kdWxlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmZpbmQocm91dGVzLCB7J21vZHVsZSc6IG1vZHVsZU5hbWV9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGxvb3BNb2R1bGVzUGFyc2VyID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZSA9IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZShub2RlLmNoaWxkcmVuW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLnJvdXRlcyA9IEpTT04ucGFyc2Uocm91dGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgcm91dGUuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmtpbmQgPSAnbmdNb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzVHJlZS5jaGlsZHJlbi5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbltpXS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcE1vZHVsZXNQYXJzZXIobm9kZS5jaGlsZHJlbltpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb29wTW9kdWxlc1BhcnNlcihfLmZpbmQoY2xlYW5Nb2R1bGVzVHJlZSwgeyduYW1lJzogcm9vdE1vZHVsZX0pKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3JvdXRlc1RyZWU6ICcsIHJvdXRlc1RyZWUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuXG4gICAgICAgICAgICAvL2ZzLm91dHB1dEpzb24oJy4vcm91dGVzLXRyZWUuanNvbicsIHJvdXRlc1RyZWUpO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5lZFJvdXRlc1RyZWU7XG5cbiAgICAgICAgICAgIHZhciBjbGVhblJvdXRlc1RyZWUgPSBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm91dGVzID0gcm91dGUuY2hpbGRyZW5baV0ucm91dGVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcm91dGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFuZWRSb3V0ZXNUcmVlID0gY2xlYW5Sb3V0ZXNUcmVlKHJvdXRlc1RyZWUpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW5lZFJvdXRlc1RyZWU6ICcsIHV0aWwuaW5zcGVjdChjbGVhbmVkUm91dGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xuICAgICAgICB9LFxuICAgICAgICBjb25zdHJ1Y3RNb2R1bGVzVHJlZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgZ2V0TmVzdGVkQ2hpbGRyZW4gPSBmdW5jdGlvbihhcnIsIHBhcmVudD8pIHtcbiAgICAgICAgICAgICAgICB2YXIgb3V0ID0gW11cbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGFycltpXS5wYXJlbnQgPT09IHBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gZ2V0TmVzdGVkQ2hpbGRyZW4oYXJyLCBhcnJbaV0ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycltpXS5jaGlsZHJlbiA9IGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChhcnJbaV0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vU2NhbiBlYWNoIG1vZHVsZSBhbmQgYWRkIHBhcmVudCBwcm9wZXJ0eVxuICAgICAgICAgICAgXy5mb3JFYWNoKG1vZHVsZXMsIGZ1bmN0aW9uKGZpcnN0TG9vcE1vZHVsZSkge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChmaXJzdExvb3BNb2R1bGUuaW1wb3J0c05vZGUsIGZ1bmN0aW9uKGltcG9ydE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG1vZHVsZXMsIGZ1bmN0aW9uKG1vZHVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIG1vZHVsZS5uYW1lID09PSBpbXBvcnROb2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGUucGFyZW50ID0gZmlyc3RMb29wTW9kdWxlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXNUcmVlID0gZ2V0TmVzdGVkQ2hpbGRyZW4obW9kdWxlcyk7XG4gICAgICAgIH1cbiAgICB9XG59KSgpO1xuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmxldCBjb2RlOiBzdHJpbmdbXSA9IFtdO1xuXG5leHBvcnQgbGV0IGdlbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHRtcDogdHlwZW9mIGNvZGUgPSBbXTtcblxuICAgIHJldHVybiAodG9rZW4gPSBudWxsKSA9PiB7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAhIHRva2VuJyk7XG4gICAgICAgICAgICByZXR1cm4gY29kZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0b2tlbiA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyBcXG4nKTtcbiAgICAgICAgICAgIGNvZGUucHVzaCh0bXAuam9pbignJykpO1xuICAgICAgICAgICAgdG1wID0gW107XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb2RlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cbn0gKCkpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGUobm9kZTogYW55KSB7XG4gICAgY29kZSA9IFtdO1xuICAgIHZpc2l0QW5kUmVjb2duaXplKG5vZGUpO1xuICAgIHJldHVybiBjb2RlLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiB2aXNpdEFuZFJlY29nbml6ZShub2RlOiBhbnksIGRlcHRoID0gMCkge1xuICAgIHJlY29nbml6ZShub2RlKTtcbiAgICBkZXB0aCsrO1xuICAgIG5vZGUuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKGMgPT4gdmlzaXRBbmRSZWNvZ25pemUoYywgZGVwdGgpKTtcbn1cblxuZnVuY3Rpb24gcmVjb2duaXplKG5vZGU6IGFueSkge1xuXG4gICAgLy9jb25zb2xlLmxvZygncmVjb2duaXppbmcuLi4nLCB0cy5TeW50YXhLaW5kW25vZGUua2luZCsnJ10pO1xuXG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0TGl0ZXJhbFRva2VuOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGdlbignXFxcIicpO1xuICAgICAgICAgICAgZ2VuKG5vZGUudGV4dCk7XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGdlbignXFxcIicpO1xuICAgICAgICAgICAgZ2VuKG5vZGUudGV4dCk7XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignaW1wb3J0Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnJvbUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2Zyb20nKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGdlbignZXhwb3J0Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2NsYXNzJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3RoaXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3JLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjb25zdHJ1Y3RvcicpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignZmFsc2UnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3RydWUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ251bGwnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BdFRva2VuOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QbHVzVG9rZW46XG4gICAgICAgICAgICBnZW4oJysnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXF1YWxzR3JlYXRlclRoYW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignID0+ICcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9wZW5QYXJlblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcoJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0Q2xhdXNlOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CbG9jazpcbiAgICAgICAgICAgIGdlbigneycpO1xuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbG9zZUJyYWNlVG9rZW46XG4gICAgICAgICAgICBnZW4oJ30nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VQYXJlblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcpJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9wZW5CcmFja2V0VG9rZW46XG4gICAgICAgICAgICBnZW4oJ1snKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFja2V0VG9rZW46XG4gICAgICAgICAgICBnZW4oJ10nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TZW1pY29sb25Ub2tlbjpcbiAgICAgICAgICAgIGdlbignOycpO1xuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29tbWFUb2tlbjpcbiAgICAgICAgICAgIGdlbignLCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGdlbignOicpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRvdFRva2VuOlxuICAgICAgICAgICAgZ2VuKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRvU3RhdGVtZW50OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5EZWNvcmF0b3I6XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmlyc3RBc3NpZ25tZW50OlxuICAgICAgICAgICAgZ2VuKCcgPSAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmlyc3RQdW5jdHVhdGlvbjpcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdwcml2YXRlJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHVibGljJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgX3RzIGZyb20gJy4uLy4uL3V0aWxzL3RzLWludGVybmFsJztcbmltcG9ydCBtYXJrZWQgZnJvbSAnbWFya2VkJztcbmltcG9ydCB7IGdldE5ld0xpbmVDaGFyYWN0ZXIsIGNvbXBpbGVySG9zdCwgZCwgZGV0ZWN0SW5kZW50IH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBSb3V0ZXJQYXJzZXIgfSBmcm9tICcuLi8uLi91dGlscy9yb3V0ZXIucGFyc2VyJztcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSAnLi9jb2RlZ2VuJztcblxuaW50ZXJmYWNlIE5vZGVPYmplY3Qge1xuICAgIGtpbmQ6IE51bWJlcjtcbiAgICBwb3M6IE51bWJlcjtcbiAgICBlbmQ6IE51bWJlcjtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgaW5pdGlhbGl6ZXI6IE5vZGVPYmplY3QsXG4gICAgbmFtZT86IHsgdGV4dDogc3RyaW5nIH07XG4gICAgZXhwcmVzc2lvbj86IE5vZGVPYmplY3Q7XG4gICAgZWxlbWVudHM/OiBOb2RlT2JqZWN0W107XG4gICAgYXJndW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIHByb3BlcnRpZXM/OiBhbnlbXTtcbiAgICBwYXJzZXJDb250ZXh0RmxhZ3M/OiBOdW1iZXI7XG4gICAgZXF1YWxzR3JlYXRlclRoYW5Ub2tlbj86IE5vZGVPYmplY3RbXTtcbiAgICBwYXJhbWV0ZXJzPzogTm9kZU9iamVjdFtdO1xuICAgIENvbXBvbmVudD86IFN0cmluZztcbiAgICBib2R5Pzoge1xuICAgICAgICBwb3M6IE51bWJlcjtcbiAgICAgICAgZW5kOiBOdW1iZXI7XG4gICAgICAgIHN0YXRlbWVudHM6IE5vZGVPYmplY3RbXTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBEZXBzIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGZpbGU/OiBzdHJpbmc7XG4gICAgc291cmNlQ29kZT86IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcblxuICAgIC8vQ29tcG9uZW50XG5cbiAgICBhbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBzdHJpbmc7XG4gICAgZW5jYXBzdWxhdGlvbj86IHN0cmluZztcbiAgICBlbnRyeUNvbXBvbmVudHM/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBleHBvcnRBcz86IHN0cmluZztcbiAgICBob3N0Pzogc3RyaW5nO1xuICAgIGlucHV0cz86IHN0cmluZ1tdO1xuICAgIGludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBtb2R1bGVJZD86IHN0cmluZztcbiAgICBvdXRwdXRzPzogc3RyaW5nW107XG4gICAgcXVlcmllcz86IERlcHNbXTsgLy8gVE9ET1xuICAgIHNlbGVjdG9yPzogc3RyaW5nO1xuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdO1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIHRlbXBsYXRlPzogc3RyaW5nO1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nW107XG4gICAgdmlld1Byb3ZpZGVycz86IHN0cmluZ1tdO1xuXG4gICAgaW5wdXRzQ2xhc3M/OiBPYmplY3RbXTtcblxuICAgIC8vY29tbW9uXG4gICAgcHJvdmlkZXJzPzogRGVwc1tdO1xuXG4gICAgLy9tb2R1bGVcbiAgICBkZWNsYXJhdGlvbnM/OiBEZXBzW107XG4gICAgYm9vdHN0cmFwPzogRGVwc1tdO1xuXG4gICAgaW1wb3J0cz86IERlcHNbXTtcbiAgICBleHBvcnRzPzogRGVwc1tdO1xufVxuXG5pbnRlcmZhY2UgU3ltYm9sRGVwcyB7XG4gICAgZnVsbDogc3RyaW5nO1xuICAgIGFsaWFzOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBEZXBlbmRlbmNpZXMge1xuXG4gICAgcHJpdmF0ZSBmaWxlczogc3RyaW5nW107XG4gICAgcHJpdmF0ZSBwcm9ncmFtOiB0cy5Qcm9ncmFtO1xuICAgIHByaXZhdGUgcHJvZ3JhbUNvbXBvbmVudDogdHMuUHJvZ3JhbTtcbiAgICBwcml2YXRlIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcjtcbiAgICBwcml2YXRlIHR5cGVDaGVja2VyQ29tcG9uZW50OiB0cy5UeXBlQ2hlY2tlcjtcbiAgICBwcml2YXRlIGVuZ2luZTogYW55O1xuICAgIHByaXZhdGUgX19jYWNoZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSBfX25zTW9kdWxlOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIHVua25vd24gPSAnPz8/JztcblxuICAgIGNvbnN0cnVjdG9yKGZpbGVzOiBzdHJpbmdbXSwgb3B0aW9uczogYW55KSB7XG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlcztcbiAgICAgICAgY29uc3QgdHJhbnNwaWxlT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHRhcmdldDogdHMuU2NyaXB0VGFyZ2V0LkVTNSxcbiAgICAgICAgICAgIG1vZHVsZTogdHMuTW9kdWxlS2luZC5Db21tb25KUyxcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBvcHRpb25zLnRzY29uZmlnRGlyZWN0b3J5XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0odGhpcy5maWxlcywgdHJhbnNwaWxlT3B0aW9ucywgY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJyZWFrTGluZXModGV4dCkge1xuICAgICAgICB2YXIgX3QgPSB0ZXh0O1xuICAgICAgICBpZiAodHlwZW9mIF90ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgX3QgPSBfdC5yZXBsYWNlKC8oXFxuKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIF90ID0gX3QucmVwbGFjZSgvKDxicj4pJC9nbSwgJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdDtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXMoKSB7XG4gICAgICAgIGxldCBkZXBzOiBPYmplY3QgPSB7XG4gICAgICAgICAgICAnbW9kdWxlcyc6IFtdLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnOiBbXSxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcyc6IFtdLFxuICAgICAgICAgICAgJ3BpcGVzJzogW10sXG4gICAgICAgICAgICAnZGlyZWN0aXZlcyc6IFtdLFxuICAgICAgICAgICAgJ3JvdXRlcyc6IFtdLFxuICAgICAgICAgICAgJ2NsYXNzZXMnOiBbXSxcbiAgICAgICAgICAgICdpbnRlcmZhY2VzJzogW11cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHNvdXJjZUZpbGVzID0gdGhpcy5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkgfHwgW107XG5cbiAgICAgICAgc291cmNlRmlsZXMubWFwKChmaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCBmaWxlUGF0aCA9IGZpbGUuZmlsZU5hbWU7XG5cbiAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSAnLnRzJykge1xuXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmxhc3RJbmRleE9mKCcuZC50cycpID09PSAtMSAmJiBmaWxlUGF0aC5sYXN0SW5kZXhPZignc3BlYy50cycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygncGFyc2luZycsIGZpbGVQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRTb3VyY2VGaWxlRGVjb3JhdG9ycyhmaWxlLCBkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUsIGZpbGUuZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkZXBzO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmxpbmtNb2R1bGVzQW5kUm91dGVzKCk7XG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmNvbnN0cnVjdE1vZHVsZXNUcmVlKCk7XG4gICAgICAgIC8vUm91dGVyUGFyc2VyLmNvbnN0cnVjdFJvdXRlc1RyZWUoKTtcblxuICAgICAgICByZXR1cm4gZGVwcztcbiAgICB9XG5cblxuICAgIHByaXZhdGUgZ2V0U291cmNlRmlsZURlY29yYXRvcnMoc3JjRmlsZTogdHMuU291cmNlRmlsZSwgb3V0cHV0U3ltYm9sczogT2JqZWN0KTogdm9pZCB7XG5cbiAgICAgICAgbGV0IGNsZWFuZXIgPSAocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgICAgIGxldCBmaWxlID0gc3JjRmlsZS5maWxlTmFtZS5yZXBsYWNlKGNsZWFuZXIsICcnKTtcblxuICAgICAgICB0aGlzLnByb2dyYW1Db21wb25lbnQgPSB0cy5jcmVhdGVQcm9ncmFtKFtmaWxlXSwge30pO1xuICAgICAgICBsZXQgc291cmNlRmlsZSA9IHRoaXMucHJvZ3JhbUNvbXBvbmVudC5nZXRTb3VyY2VGaWxlKGZpbGUpO1xuICAgICAgICB0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50ID0gdGhpcy5wcm9ncmFtQ29tcG9uZW50LmdldFR5cGVDaGVja2VyKHRydWUpO1xuXG4gICAgICAgIHRzLmZvckVhY2hDaGlsZChzcmNGaWxlLCAobm9kZTogdHMuTm9kZSkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgZGVwczogRGVwcyA9IDxEZXBzPnt9O1xuICAgICAgICAgICAgaWYgKG5vZGUuZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICAgIGxldCB2aXNpdE5vZGUgPSAodmlzaXRlZE5vZGUsIGluZGV4KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1ldGFkYXRhID0gbm9kZS5kZWNvcmF0b3JzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wcyA9IHRoaXMuZmluZFByb3BzKHZpc2l0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDb21wb25lbnRJTyhmaWxlLCBzb3VyY2VGaWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc01vZHVsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogdGhpcy5nZXRNb2R1bGVQcm92aWRlcnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogdGhpcy5nZXRNb2R1bGVEZWNsYXRpb25zKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRzOiB0aGlzLmdldE1vZHVsZUltcG9ydHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydHM6IHRoaXMuZ2V0TW9kdWxlRXhwb3J0cyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9vdHN0cmFwOiB0aGlzLmdldE1vZHVsZUJvb3RzdHJhcChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUm91dGVyUGFyc2VyLmhhc1JvdXRlck1vZHVsZUluSW1wb3J0cyhkZXBzLmltcG9ydHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZE1vZHVsZVdpdGhSb3V0ZXMobmFtZSwgdGhpcy5nZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkTW9kdWxlKG5hbWUsIGRlcHMuaW1wb3J0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtb2R1bGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzQ29tcG9uZW50KG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocHJvcHMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHV0aWwuaW5zcGVjdChwcm9wcywgeyBzaG93SGlkZGVuOiB0cnVlLCBkZXB0aDogMTAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IHRoaXMuZ2V0Q29tcG9uZW50Q2hhbmdlRGV0ZWN0aW9uKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNhcHN1bGF0aW9uOiB0aGlzLmdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24ocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXM6IHRoaXMuZ2V0Q29tcG9uZW50RXhwb3J0QXMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHRoaXMuZ2V0Q29tcG9uZW50SG9zdChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB0aGlzLmdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE8gd2FpdGluZyBkb2MgaW5mb3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJZDogdGhpcy5nZXRDb21wb25lbnRNb2R1bGVJZChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogdGhpcy5nZXRDb21wb25lbnRPdXRwdXRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3F1ZXJpZXM/OiBEZXBzW107IC8vIFRPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogdGhpcy5nZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVVcmxzOiB0aGlzLmdldENvbXBvbmVudFN0eWxlVXJscyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiB0aGlzLmdldENvbXBvbmVudFN0eWxlcyhwcm9wcyksIC8vIFRPRE8gZml4IGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5nZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IHRoaXMuZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdQcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50Vmlld1Byb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzQ2xhc3M6IElPLmlucHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzQ2xhc3M6IElPLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc0NsYXNzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHNDbGFzczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NvbXBvbmVudHMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNJbmplY3RhYmxlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IElPLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczogSU8ubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2luamVjdGFibGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzUGlwZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwaXBlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ3BpcGVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzRGlyZWN0aXZlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydkaXJlY3RpdmVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2NhY2hlW25hbWVdID0gZGVwcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZmlsdGVyQnlEZWNvcmF0b3JzID0gKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC8oTmdNb2R1bGV8Q29tcG9uZW50fEluamVjdGFibGV8UGlwZXxEaXJlY3RpdmUpLy50ZXN0KG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBub2RlLmRlY29yYXRvcnNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihmaWx0ZXJCeURlY29yYXRvcnMpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHZpc2l0Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuc3ltYm9sLmZsYWdzID09PSB0cy5TeW1ib2xGbGFncy5DbGFzcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q29tcG9uZW50SU8oZmlsZSwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NsYXNzZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihub2RlLnN5bWJvbC5mbGFncyA9PT0gdHMuU3ltYm9sRmxhZ3MuSW50ZXJmYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRJbnRlcmZhY2VJTyhmaWxlLCBzb3VyY2VGaWxlLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMua2luZCA9IElPLmtpbmQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snaW50ZXJmYWNlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldFJvdXRlSU8oZmlsZSwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgaWYoSU8ucm91dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdSb3V0ZXM7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3V0ZXMgPSBKU09OLnBhcnNlKElPLnJvdXRlcy5yZXBsYWNlKC8gL2dtLCAnJykpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1JvdXRlcyBwYXJzaW5nIGVycm9yLCBtYXliZSBhIHRyYWlsaW5nIGNvbW1hIG9yIGFuIGV4dGVybmFsIHZhcmlhYmxlID8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ3JvdXRlcyddID0gWy4uLm91dHB1dFN5bWJvbHNbJ3JvdXRlcyddLCAuLi5uZXdSb3V0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENvbXBvbmVudElPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjbGFzc2VzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vRmluZCB0aGUgcm9vdCBtb2R1bGUgd2l0aCBib290c3RyYXBNb2R1bGUgY2FsbFxuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgcmVjdXNpdmVseSBpbiBleHByZXNzaW9uIG5vZGVzIG9uZSB3aXRoIG5hbWUgJ2Jvb3RzdHJhcE1vZHVsZSdcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvb3RNb2R1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHROb2RlID0gdGhpcy5maW5kRXhwcmVzc2lvbkJ5TmFtZShub2RlLCAnYm9vdHN0cmFwTW9kdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdE5vZGUuYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocmVzdWx0Tm9kZS5hcmd1bWVudHMsIGZ1bmN0aW9uKGFyZ3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFyZ3VtZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBhcmd1bWVudC50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vdE1vZHVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5zZXRSb290TW9kdWxlKHJvb3RNb2R1bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cbiAgICBwcml2YXRlIGRlYnVnKGRlcHM6IERlcHMpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdkZWJ1ZycsIGAke2RlcHMubmFtZX06YCk7XG4gICAgICAgIFtcbiAgICAgICAgICAgICdpbXBvcnRzJywgJ2V4cG9ydHMnLCAnZGVjbGFyYXRpb25zJywgJ3Byb3ZpZGVycycsICdib290c3RyYXAnXG4gICAgICAgIF0uZm9yRWFjaChzeW1ib2xzID0+IHtcbiAgICAgICAgICAgIGlmIChkZXBzW3N5bWJvbHNdICYmIGRlcHNbc3ltYm9sc10ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnJywgYC0gJHtzeW1ib2xzfTpgKTtcbiAgICAgICAgICAgICAgICBkZXBzW3N5bWJvbHNdLm1hcChpID0+IGkubmFtZSkuZm9yRWFjaChkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCcnLCBgXFx0LSAke2R9YCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kRXhwcmVzc2lvbkJ5TmFtZShlbnRyeU5vZGUsIG5hbWUpIHtcbiAgICAgICAgbGV0IHJlc3VsdCxcbiAgICAgICAgICAgIGxvb3AgPSBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uICYmICFub2RlLmV4cHJlc3Npb24ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBsb29wKG5vZGUuZXhwcmVzc2lvbiwgbmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24ubmFtZS50ZXh0ID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBsb29wKGVudHJ5Tm9kZSwgbmFtZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0NvbXBvbmVudChtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdDb21wb25lbnQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQaXBlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ1BpcGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNEaXJlY3RpdmUobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnRGlyZWN0aXZlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSW5qZWN0YWJsZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdJbmplY3RhYmxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTW9kdWxlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ05nTW9kdWxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFR5cGUobmFtZSkge1xuICAgICAgICBsZXQgdHlwZTtcbiAgICAgICAgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjb21wb25lbnQnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ2NvbXBvbmVudCc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ3BpcGUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ3BpcGUnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdtb2R1bGUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ21vZHVsZSc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2RpcmVjdGl2ZScpICE9PSAtMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSAnZGlyZWN0aXZlJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbGVOYW1lKG5vZGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3NlbGVjdG9yJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRFeHBvcnRBcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydEFzJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdwcm92aWRlcnMnKS5tYXAoKHByb3ZpZGVyTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIocHJvdmlkZXJOYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kUHJvcHModmlzaXRlZE5vZGUpIHtcbiAgICAgICAgaWYodmlzaXRlZE5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLnBvcCgpLnByb3BlcnRpZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZURlY2xhdGlvbnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdkZWNsYXJhdGlvbnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBjb21wb25lbnQgPSB0aGlzLmZpbmRDb21wb25lbnRTZWxlY3RvckJ5TmFtZShuYW1lKTtcblxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUltcG9ydHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHNSYXcocHJvcHMsICdpbXBvcnRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVJbXBvcnRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW1wb3J0cycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlRXhwb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydHMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEhvc3QocHJvcHM6IE5vZGVPYmplY3RbXSk6IE9iamVjdCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHNPYmplY3QocHJvcHMsICdob3N0Jyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVCb290c3RyYXAocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdib290c3RyYXAnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdpbnB1dHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERlY29yYXRvck9mVHlwZShub2RlLCBkZWNvcmF0b3JUeXBlKSB7XG4gICAgICB2YXIgZGVjb3JhdG9ycyA9IG5vZGUuZGVjb3JhdG9ycyB8fCBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWNvcmF0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChkZWNvcmF0b3JzW2ldLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSBkZWNvcmF0b3JUeXBlKSB7XG4gICAgICAgICAgcmV0dXJuIGRlY29yYXRvcnNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdElucHV0KHByb3BlcnR5LCBpbkRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaW5BcmdzID0gaW5EZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBpbkFyZ3MubGVuZ3RoID8gaW5BcmdzWzBdLnRleHQgOiBwcm9wZXJ0eS5uYW1lLnRleHQsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcy52aXNpdFR5cGUocHJvcGVydHkpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFR5cGUobm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gbm9kZSA/IHRoaXMudHlwZUNoZWNrZXJDb21wb25lbnQudHlwZVRvU3RyaW5nKHRoaXMudHlwZUNoZWNrZXJDb21wb25lbnQuZ2V0VHlwZUF0TG9jYXRpb24obm9kZSkpIDogJ3ZvaWQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRPdXRwdXQocHJvcGVydHksIG91dERlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgb3V0QXJncyA9IG91dERlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IG91dEFyZ3MubGVuZ3RoID8gb3V0QXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1B1YmxpYyhtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKG1lbWJlci5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzUHVibGljOiBib29sZWFuID0gbWVtYmVyLm1vZGlmaWVycy5zb21lKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGlzUHVibGljKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbnRlcm5hbE1lbWJlcihtZW1iZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQcml2YXRlT3JJbnRlcm5hbChtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG1lbWJlci5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzUHJpdmF0ZTogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShtb2RpZmllciA9PiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkKTtcbiAgICAgICAgICAgIGlmIChpc1ByaXZhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pc0ludGVybmFsTWVtYmVyKG1lbWJlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0ludGVybmFsTWVtYmVyKG1lbWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpbnRlcm5hbFRhZ3M6IHN0cmluZ1tdID0gWydpbnRlcm5hbCcsICdwcml2YXRlJywgJ2hpZGRlbiddO1xuICAgICAgICBpZiAobWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBtZW1iZXIuanNEb2MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9jLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgZG9jLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbFRhZ3MuaW5kZXhPZih0YWcudGFnTmFtZS50ZXh0KSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNBbmd1bGFyTGlmZWN5Y2xlSG9vayhtZXRob2ROYW1lKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IEFOR1VMQVJfTElGRUNZQ0xFX01FVEhPRFMgPSBbXG4gICAgICAgICAgICAnbmdPbkluaXQnLCAnbmdPbkNoYW5nZXMnLCAnbmdEb0NoZWNrJywgJ25nT25EZXN0cm95JywgJ25nQWZ0ZXJDb250ZW50SW5pdCcsICduZ0FmdGVyQ29udGVudENoZWNrZWQnLFxuICAgICAgICAgICAgJ25nQWZ0ZXJWaWV3SW5pdCcsICduZ0FmdGVyVmlld0NoZWNrZWQnLCAnd3JpdGVWYWx1ZScsICdyZWdpc3Rlck9uQ2hhbmdlJywgJ3JlZ2lzdGVyT25Ub3VjaGVkJywgJ3NldERpc2FibGVkU3RhdGUnXG4gICAgICAgIF07XG4gICAgICAgIHJldHVybiBBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTLmluZGV4T2YobWV0aG9kTmFtZSkgPj0gMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0Q29uc3RydWN0b3JEZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAobWV0aG9kLnBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgIHZhciBfcGFyYW1ldGVycyA9IFtdLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IG1ldGhvZC5wYXJhbWV0ZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5pc1B1YmxpYyhtZXRob2QucGFyYW1ldGVyc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgX3BhcmFtZXRlcnMucHVzaCh0aGF0LnZpc2l0QXJndW1lbnQobWV0aG9kLnBhcmFtZXRlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3BhcmFtZXRlcnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0Q2FsbERlY2xhcmF0aW9uKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRJbmRleERlY2xhcmF0aW9uKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRNZXRob2REZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIG5hbWU6IG1ldGhvZC5uYW1lLnRleHQsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKG1ldGhvZC5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpLFxuICAgICAgICAgICAgYXJnczogbWV0aG9kLnBhcmFtZXRlcnMgPyBtZXRob2QucGFyYW1ldGVycy5tYXAoKHByb3ApID0+IHRoaXMudmlzaXRBcmd1bWVudChwcm9wKSkgOiBbXSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHRoaXMudmlzaXRUeXBlKG1ldGhvZC50eXBlKVxuICAgICAgICB9LFxuICAgICAgICAgICAganNkb2N0YWdzID0gX3RzLmdldEpTRG9jcyhtZXRob2QpO1xuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IGpzZG9jdGFnc1swXS50YWdzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEFyZ3VtZW50KGFyZykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogYXJnLm5hbWUudGV4dCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKGFyZylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TmFtZXNDb21wYXJlRm4obmFtZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBuYW1lID0gbmFtZSB8fCAnbmFtZSc7XG4gICAgICAgIHJldHVybiAoYSwgYikgPT4gYVtuYW1lXS5sb2NhbGVDb21wYXJlKGJbbmFtZV0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RyaW5naWZ5RGVmYXVsdFZhbHVlKG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG5vZGUudGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUudGV4dDtcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZhbHNlJztcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQpIHtcbiAgICAgICAgICAgIHJldHVybiAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0UHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHByb3BlcnR5Lm5hbWUudGV4dCxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogcHJvcGVydHkuaW5pdGlhbGl6ZXIgPyB0aGlzLnN0cmluZ2lmeURlZmF1bHRWYWx1ZShwcm9wZXJ0eS5pbml0aWFsaXplcikgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShwcm9wZXJ0eSksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHByb3BlcnR5LnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0TWVtYmVycyhtZW1iZXJzKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBpbnB1dHMgPSBbXTtcbiAgICAgICAgdmFyIG91dHB1dHMgPSBbXTtcbiAgICAgICAgdmFyIG1ldGhvZHMgPSBbXTtcbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBbXTtcbiAgICAgICAgdmFyIGtpbmQ7XG4gICAgICAgIHZhciBpbnB1dERlY29yYXRvciwgb3V0RGVjb3JhdG9yO1xuXG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZW1iZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpbnB1dERlY29yYXRvciA9IHRoaXMuZ2V0RGVjb3JhdG9yT2ZUeXBlKG1lbWJlcnNbaV0sICdJbnB1dCcpO1xuICAgICAgICAgICAgb3V0RGVjb3JhdG9yID0gdGhpcy5nZXREZWNvcmF0b3JPZlR5cGUobWVtYmVyc1tpXSwgJ091dHB1dCcpO1xuXG4gICAgICAgICAgICBraW5kID0gbWVtYmVyc1tpXS5raW5kO1xuXG4gICAgICAgICAgICBpZiAoaW5wdXREZWNvcmF0b3IpIHtcbiAgICAgICAgICAgICAgICBpbnB1dHMucHVzaCh0aGlzLnZpc2l0SW5wdXQobWVtYmVyc1tpXSwgaW5wdXREZWNvcmF0b3IpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3V0RGVjb3JhdG9yKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0cy5wdXNoKHRoaXMudmlzaXRPdXRwdXQobWVtYmVyc1tpXSwgb3V0RGVjb3JhdG9yKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzUHJpdmF0ZU9ySW50ZXJuYWwobWVtYmVyc1tpXSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2REZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTWV0aG9kU2lnbmF0dXJlKSAmJlxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5pc0FuZ3VsYXJMaWZlY3ljbGVIb29rKG1lbWJlcnNbaV0ubmFtZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnB1c2godGhpcy52aXNpdE1ldGhvZERlY2xhcmF0aW9uKG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlTaWduYXR1cmUgfHwgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkdldEFjY2Vzc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0UHJvcGVydHkobWVtYmVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNhbGxTaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKHRoaXMudmlzaXRDYWxsRGVjbGFyYXRpb24obWVtYmVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkluZGV4U2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0SW5kZXhEZWNsYXJhdGlvbihtZW1iZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9jb25zdHJ1Y3RvclByb3BlcnRpZXMgPSB0aGlzLnZpc2l0Q29uc3RydWN0b3JEZWNsYXJhdGlvbihtZW1iZXJzW2ldKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGogPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuID0gX2NvbnN0cnVjdG9yUHJvcGVydGllcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGZvcihqOyBqPGxlbjsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2goX2NvbnN0cnVjdG9yUHJvcGVydGllc1tqXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpbnB1dHMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuICAgICAgICBvdXRwdXRzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcbiAgICAgICAgcHJvcGVydGllcy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlucHV0cyxcbiAgICAgICAgICAgIG91dHB1dHMsXG4gICAgICAgICAgICBtZXRob2RzLFxuICAgICAgICAgICAgcHJvcGVydGllcyxcbiAgICAgICAgICAgIGtpbmRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RGlyZWN0aXZlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc2VsZWN0b3I7XG4gICAgICAgIHZhciBleHBvcnRBcztcbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHNbMF0ucHJvcGVydGllcztcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzW2ldLm5hbWUudGV4dCA9PT0gJ3NlbGVjdG9yJykge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBvbmx5IHdvcmsgaWYgc2VsZWN0b3IgaXMgaW5pdGlhbGl6ZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gcHJvcGVydGllc1tpXS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb3BlcnRpZXNbaV0ubmFtZS50ZXh0ID09PSAnZXhwb3J0QXMnKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIG9ubHkgd29yayBpZiBzZWxlY3RvciBpcyBpbml0aWFsaXplZCBhcyBhIHN0cmluZyBsaXRlcmFsXG4gICAgICAgICAgICAgICAgZXhwb3J0QXMgPSBwcm9wZXJ0aWVzW2ldLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgICBleHBvcnRBc1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQaXBlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgcmV0dXJuIGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ1BpcGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNNb2R1bGVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgICByZXR1cm4gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnTmdNb2R1bGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNEaXJlY3RpdmVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dDtcbiAgICAgICAgcmV0dXJuIGRlY29yYXRvcklkZW50aWZpZXJUZXh0ID09PSAnRGlyZWN0aXZlJyB8fCBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9PT0gJ0NvbXBvbmVudCc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1NlcnZpY2VEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgICByZXR1cm4gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnSW5qZWN0YWJsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZU5hbWUsIGNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHN5bWJvbCA9IHRoaXMucHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpLmdldFN5bWJvbEF0TG9jYXRpb24oY2xhc3NEZWNsYXJhdGlvbi5uYW1lKTtcbiAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSk7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBjbGFzc0RlY2xhcmF0aW9uLm5hbWUudGV4dDtcbiAgICAgICAgdmFyIGRpcmVjdGl2ZUluZm87XG4gICAgICAgIHZhciBtZW1iZXJzO1xuXG4gICAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNEaXJlY3RpdmVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVJbmZvID0gdGhpcy52aXNpdERpcmVjdGl2ZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiBtZW1iZXJzLmlucHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IG1lbWJlcnMub3V0cHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1NlcnZpY2VEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycyk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNQaXBlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkgfHwgdGhpcy5pc01vZHVsZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycyk7XG5cbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZFxuICAgICAgICAgICAgfV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEVudW1EZWNsYXJhdGlvbihmaWxlTmFtZSwgbm9kZSkge1xuICAgICAgICBpZiggbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zICkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlLnR5cGVOYW1lICYmIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlLnR5cGVOYW1lLnRleHQgPT09ICdSb3V0ZXMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkUm91dGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5uYW1lLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZ2VuZXJhdGUobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLmluaXRpYWxpemVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXM6IGdlbmVyYXRlKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJvdXRlSU8oZmlsZW5hbWUsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRFbnVtRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50SU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0Q2xhc3NEZWNsYXJhdGlvbihmaWxlbmFtZSwgc3RhdGVtZW50KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbnRlcmZhY2VJTyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlLCBub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVtZW50LnBvcyA9PT0gbm9kZS5wb3MgJiYgc3RhdGVtZW50LmVuZCA9PT0gbm9kZS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudE91dHB1dHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ291dHB1dHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFByb3ZpZGVycyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3Byb3ZpZGVycycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50Vmlld1Byb3ZpZGVycyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3ZpZXdQcm92aWRlcnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudERpcmVjdGl2ZXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdkaXJlY3RpdmVzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgICAgICBpZGVudGlmaWVyLnNlbGVjdG9yID0gdGhpcy5maW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZSk7XG4gICAgICAgICAgICBpZGVudGlmaWVyLmxhYmVsID0gJyc7XG4gICAgICAgICAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZURlZXBJbmRlbnRpZmllcihuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBsZXQgbnNNb2R1bGUgPSBuYW1lLnNwbGl0KCcuJyksXG4gICAgICAgICAgICB0eXBlID0gdGhpcy5nZXRUeXBlKG5hbWUpO1xuICAgICAgICBpZiAobnNNb2R1bGUubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICAvLyBjYWNoZSBkZXBzIHdpdGggdGhlIHNhbWUgbmFtZXNwYWNlIChpLmUgU2hhcmVkLiopXG4gICAgICAgICAgICBpZiAodGhpcy5fX25zTW9kdWxlW25zTW9kdWxlWzBdXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0ucHVzaChuYW1lKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX25zTW9kdWxlW25zTW9kdWxlWzBdXSA9IFtuYW1lXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuczogbnNNb2R1bGVbMF0sXG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRUZW1wbGF0ZVVybChwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZVVybHModGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndGVtcGxhdGVVcmwnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd0ZW1wbGF0ZScsIHRydWUpLnBvcCgpXG4gICAgICAgIGlmKHQpIHtcbiAgICAgICAgICAgIHQgPSBkZXRlY3RJbmRlbnQodCwgMCk7XG4gICAgICAgICAgICB0ID0gdC5yZXBsYWNlKC9cXG4vLCAnJyk7XG4gICAgICAgICAgICB0ID0gdC5yZXBsYWNlKC8gKyQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFN0eWxlVXJscyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZVVybHModGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnc3R5bGVVcmxzJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U3R5bGVzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzdHlsZXMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudE1vZHVsZUlkKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnbW9kdWxlSWQnKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudENoYW5nZURldGVjdGlvbihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2NoYW5nZURldGVjdGlvbicpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RW5jYXBzdWxhdGlvbihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZW5jYXBzdWxhdGlvbicpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2FuaXRpemVVcmxzKHVybHM6IHN0cmluZ1tdKSB7XG4gICAgICAgIHJldHVybiB1cmxzLm1hcCh1cmwgPT4gdXJsLnJlcGxhY2UoJy4vJywgJycpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHNPYmplY3QocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogT2JqZWN0IHtcbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHBhcnNlUHJvcGVydGllcyA9IChub2RlOiBOb2RlT2JqZWN0KTogT2JqZWN0ID0+IHtcbiAgICAgICAgICAgIGxldCBvYmogPSB7fTtcbiAgICAgICAgICAgIChub2RlLmluaXRpYWxpemVyLnByb3BlcnRpZXMgfHwgW10pLmZvckVhY2goKHByb3A6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBvYmpbcHJvcC5uYW1lLnRleHRdID0gcHJvcC5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVByb3BlcnRpZXMpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwc1Jhdyhwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBhbnkge1xuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlcHMgfHwgW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzKHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IHN0cmluZ1tdIHtcblxuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xUZXh0ID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKHRleHQuaW5kZXhPZignLycpICE9PSAtMSAmJiAhbXVsdGlMaW5lKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQuc3BsaXQoJy8nKS5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgYnVpbGRJZGVudGlmaWVyTmFtZSA9IChub2RlOiBOb2RlT2JqZWN0LCBuYW1lID0gJycpID0+IHtcblxuICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lID8gYC4ke25hbWV9YCA6IG5hbWU7XG5cbiAgICAgICAgICAgICAgICBsZXQgbm9kZU5hbWUgPSB0aGlzLnVua25vd247XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUubmFtZS50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLmV4cHJlc3Npb24udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmKG5vZGUuZXhwcmVzc2lvbi5lbGVtZW50cykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5leHByZXNzaW9uLmVsZW1lbnRzLm1hcCggZWwgPT4gZWwudGV4dCApLmpvaW4oJywgJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBgWyR7bm9kZU5hbWV9XWA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09ICB0cy5TeW50YXhLaW5kLlNwcmVhZEVsZW1lbnRFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgLi4uJHtub2RlTmFtZX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YnVpbGRJZGVudGlmaWVyTmFtZShub2RlLmV4cHJlc3Npb24sIG5vZGVOYW1lKX0ke25hbWV9YFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYCR7bm9kZS50ZXh0fS4ke25hbWV9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbiA9IChvOiBOb2RlT2JqZWN0KTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIC8vIHBhcnNlIGV4cHJlc3Npb25zIHN1Y2ggYXM6XG4gICAgICAgICAgICAvLyB7IHByb3ZpZGU6IEFQUF9CQVNFX0hSRUYsIHVzZVZhbHVlOiAnLycgfSxcbiAgICAgICAgICAgIC8vIG9yXG4gICAgICAgICAgICAvLyB7IHByb3ZpZGU6ICdEYXRlJywgdXNlRmFjdG9yeTogKGQxLCBkMikgPT4gbmV3IERhdGUoKSwgZGVwczogWydkMScsICdkMiddIH1cblxuICAgICAgICAgICAgbGV0IF9nZW5Qcm92aWRlck5hbWU6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBsZXQgX3Byb3ZpZGVyUHJvcHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICAgIChvLnByb3BlcnRpZXMgfHwgW10pLmZvckVhY2goKHByb3A6IE5vZGVPYmplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCBpZGVudGlmaWVyID0gcHJvcC5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgICAgIGlmIChwcm9wLmluaXRpYWxpemVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyID0gYCcke2lkZW50aWZpZXJ9J2A7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gbGFtYmRhIGZ1bmN0aW9uIChpLmUgdXNlRmFjdG9yeSlcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5ib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbXMgPSAocHJvcC5pbml0aWFsaXplci5wYXJhbWV0ZXJzIHx8IDxhbnk+W10pLm1hcCgocGFyYW1zOiBOb2RlT2JqZWN0KSA9PiBwYXJhbXMubmFtZS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAoJHtwYXJhbXMuam9pbignLCAnKX0pID0+IHt9YDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBmYWN0b3J5IGRlcHMgYXJyYXlcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbGVtZW50cyA9IChwcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzIHx8IFtdKS5tYXAoKG46IE5vZGVPYmplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAnJHtuLnRleHR9J2A7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyID0gYFske2VsZW1lbnRzLmpvaW4oJywgJyl9XWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgX3Byb3ZpZGVyUHJvcHMucHVzaChbXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lIHByb3ZpZGVcbiAgICAgICAgICAgICAgICAgICAgcHJvcC5uYW1lLnRleHQsXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lIE9wYXF1ZVRva2VuIG9yICdTdHJpbmdUb2tlbidcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllclxuXG4gICAgICAgICAgICAgICAgXS5qb2luKCc6ICcpKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBgeyAke19wcm92aWRlclByb3BzLmpvaW4oJywgJyl9IH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9sRWxlbWVudHMgPSAobzogTm9kZU9iamVjdCB8IGFueSk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOiBBbmd1bGFyRmlyZU1vZHVsZS5pbml0aWFsaXplQXBwKGZpcmViYXNlQ29uZmlnKVxuICAgICAgICAgICAgaWYgKG8uYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGJ1aWxkSWRlbnRpZmllck5hbWUoby5leHByZXNzaW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIGZ1bmN0aW9uIGFyZ3VtZW50cyBjb3VsZCBiZSByZWFsbHkgY29tcGxleGUuIFRoZXJlIGFyZSBzb1xuICAgICAgICAgICAgICAgIC8vIG1hbnkgdXNlIGNhc2VzIHRoYXQgd2UgY2FuJ3QgaGFuZGxlLiBKdXN0IHByaW50IFwiYXJnc1wiIHRvIGluZGljYXRlXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB3ZSBoYXZlIGFyZ3VtZW50cy5cblxuICAgICAgICAgICAgICAgIGxldCBmdW5jdGlvbkFyZ3MgPSBvLmFyZ3VtZW50cy5sZW5ndGggPiAwID8gJ2FyZ3MnIDogJyc7XG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSBgJHtjbGFzc05hbWV9KCR7ZnVuY3Rpb25BcmdzfSlgO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOiBTaGFyZWQuTW9kdWxlXG4gICAgICAgICAgICBlbHNlIGlmIChvLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IGJ1aWxkSWRlbnRpZmllck5hbWUobyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvLnRleHQgPyBvLnRleHQgOiBwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbihvKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xzID0gKG5vZGU6IE5vZGVPYmplY3QpOiBzdHJpbmdbXSA9PiB7XG5cbiAgICAgICAgICAgIGxldCB0ZXh0ID0gbm9kZS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VTeW1ib2xUZXh0KHRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLmluaXRpYWxpemVyLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHBhcnNlU3ltYm9sRWxlbWVudHMobm9kZS5pbml0aWFsaXplcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllclxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5pbml0aWFsaXplci5lbGVtZW50cy5tYXAocGFyc2VTeW1ib2xFbGVtZW50cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGRlcHMubWFwKHBhcnNlU3ltYm9scykucG9wKCkgfHwgW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fY2FjaGVbbmFtZV07XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBMaXZlU2VydmVyIGZyb20gJ2xpdmUtc2VydmVyJztcbmltcG9ydCAqIGFzIFNoZWxsanMgZnJvbSAnc2hlbGxqcyc7XG5pbXBvcnQgbWFya2VkIGZyb20gJ21hcmtlZCc7XG5cbmNvbnN0IGdsb2I6IGFueSA9IHJlcXVpcmUoJ2dsb2InKTtcblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IEh0bWxFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvaHRtbC5lbmdpbmUnO1xuaW1wb3J0IHsgTWFya2Rvd25FbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvbWFya2Rvd24uZW5naW5lJztcbmltcG9ydCB7IEZpbGVFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvZmlsZS5lbmdpbmUnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiwgSUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9kZXBlbmRlbmNpZXMuZW5naW5lJztcbmltcG9ydCB7IE5nZEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9uZ2QuZW5naW5lJztcbmltcG9ydCB7IFNlYXJjaEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9zZWFyY2guZW5naW5lJztcbmltcG9ydCB7IERlcGVuZGVuY2llcyB9IGZyb20gJy4vY29tcGlsZXIvZGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IFJvdXRlclBhcnNlciB9IGZyb20gJy4uL3V0aWxzL3JvdXRlci5wYXJzZXInO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4uL3V0aWxzL2RlZmF1bHRzJztcblxubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLFxuICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCksXG4gICAgJGh0bWxlbmdpbmUgPSBuZXcgSHRtbEVuZ2luZSgpLFxuICAgICRmaWxlZW5naW5lID0gbmV3IEZpbGVFbmdpbmUoKSxcbiAgICAkbWFya2Rvd25lbmdpbmUgPSBuZXcgTWFya2Rvd25FbmdpbmUoKSxcbiAgICAkbmdkZW5naW5lID0gbmV3IE5nZEVuZ2luZSgpLFxuICAgICRzZWFyY2hFbmdpbmUgPSBuZXcgU2VhcmNoRW5naW5lKCksXG4gICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uIHtcbiAgICBvcHRpb25zOk9iamVjdDtcbiAgICBmaWxlczogQXJyYXk8c3RyaW5nPjtcblxuICAgIGNvbmZpZ3VyYXRpb246SUNvbmZpZ3VyYXRpb247XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgY29tcG9kb2MgYXBwbGljYXRpb24gaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgb3B0aW9ucyB0aGF0IHNob3VsZCBiZSB1c2VkLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/Ok9iamVjdCkge1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIG9wdGlvbnMgKSB7XG4gICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhW29wdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhW29wdGlvbl0gPSBvcHRpb25zW29wdGlvbl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBjb21wb2RvY1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZW5lcmF0ZSgpIHtcbiAgICAgICAgJGh0bWxlbmdpbmUuaW5pdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFja2FnZUpzb24oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0RmlsZXMoZmlsZXM6QXJyYXk8c3RyaW5nPikge1xuICAgICAgICB0aGlzLmZpbGVzID0gZmlsZXM7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1BhY2thZ2VKc29uKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnU2VhcmNoaW5nIHBhY2thZ2UuanNvbiBmaWxlJyk7XG4gICAgICAgICRmaWxlZW5naW5lLmdldCgncGFja2FnZS5qc29uJykudGhlbigocGFja2FnZURhdGEpID0+IHtcbiAgICAgICAgICAgIGxldCBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShwYWNrYWdlRGF0YSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZERhdGEubmFtZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9PT0gQ09NUE9ET0NfREVGQVVMVFMudGl0bGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID0gcGFyc2VkRGF0YS5uYW1lICsgJyBkb2N1bWVudGF0aW9uJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyc2VkRGF0YS5kZXNjcmlwdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbiA9IHBhcnNlZERhdGEuZGVzY3JpcHRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygncGFja2FnZS5qc29uIGZpbGUgZm91bmQnKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc01hcmtkb3duKCk7XG4gICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdDb250aW51aW5nIHdpdGhvdXQgcGFja2FnZS5qc29uIGZpbGUnKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc01hcmtkb3duKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NNYXJrZG93bigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBSRUFETUUubWQgZmlsZScpO1xuICAgICAgICAkbWFya2Rvd25lbmdpbmUuZ2V0UmVhZG1lRmlsZSgpLnRoZW4oKHJlYWRtZURhdGE6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3JlYWRtZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdvdmVydmlldycsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ292ZXJ2aWV3J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucmVhZG1lID0gcmVhZG1lRGF0YTtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdSRUFETUUubWQgZmlsZSBmb3VuZCcpO1xuICAgICAgICAgICAgdGhpcy5nZXREZXBlbmRlbmNpZXNEYXRhKCk7XG4gICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdDb250aW51aW5nIHdpdGhvdXQgUkVBRE1FLm1kIGZpbGUnKTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5nZXREZXBlbmRlbmNpZXNEYXRhKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldERlcGVuZGVuY2llc0RhdGEoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdHZXQgZGVwZW5kZW5jaWVzIGRhdGEnKTtcblxuICAgICAgICBsZXQgY3Jhd2xlciA9IG5ldyBEZXBlbmRlbmNpZXMoXG4gICAgICAgICAgdGhpcy5maWxlcywge1xuICAgICAgICAgICAgdHNjb25maWdEaXJlY3Rvcnk6IGN3ZFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS5pbml0KGRlcGVuZGVuY2llc0RhdGEpO1xuXG4gICAgICAgIC8vUm91dGVyUGFyc2VyLnByaW50Um91dGVzKCk7XG5cbiAgICAgICAgdGhpcy5wcmVwYXJlTW9kdWxlcygpO1xuXG4gICAgICAgIHRoaXMucHJlcGFyZUNvbXBvbmVudHMoKS50aGVuKChyZWFkbWVEYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVEaXJlY3RpdmVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5pbmplY3RhYmxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlSW5qZWN0YWJsZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlUm91dGVzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnBpcGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVQaXBlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5jbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVDbGFzc2VzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZUludGVyZmFjZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlQ292ZXJhZ2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVNb2R1bGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBtb2R1bGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgIG5hbWU6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdtb2R1bGVzJ1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ21vZHVsZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgbW9kdWxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlUGlwZXMgPSAoKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIHBpcGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UGlwZXMoKTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdwaXBlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3BpcGUnLFxuICAgICAgICAgICAgICAgIHBpcGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlQ2xhc3NlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY2xhc3NlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q2xhc3NlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnY2xhc3NlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgIGNsYXNzOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlSW50ZXJmYWNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgaW50ZXJmYWNlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW50ZXJmYWNlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcy5sZW5ndGg7XG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2ludGVyZmFjZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAgICAgaW50ZXJmYWNlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlQ29tcG9uZW50cygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY29tcG9uZW50cycpO1xuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDb21wb25lbnRzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArICdSRUFETUUubWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUkVBRE1FLm1kIGV4aXN0IGZvciB0aGlzIGNvbXBvbmVudCwgaW5jbHVkZSBpdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHJlYWRtZUZpbGUsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLnJlYWRtZSA9IG1hcmtlZChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRGlyZWN0aXZlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgZGlyZWN0aXZlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0RGlyZWN0aXZlcygpO1xuXG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdkaXJlY3RpdmVzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZUluamVjdGFibGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBpbmplY3RhYmxlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEluamVjdGFibGVzKCk7XG5cbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgICAgIGluamVjdGFibGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlUm91dGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyByb3V0ZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJvdXRlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Um91dGVzKCk7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ3JvdXRlcycsXG4gICAgICAgICAgICBjb250ZXh0OiAncm91dGVzJ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlQ292ZXJhZ2UoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgcmVwb3J0Jyk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogbG9vcCB3aXRoIGNvbXBvbmVudHMsIGNsYXNzZXMsIGluamVjdGFibGVzLCBpbnRlcmZhY2VzLCBwaXBlc1xuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGZpbGVzID0gW10sXG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgIGdldFN0YXR1cyA9IGZ1bmN0aW9uKHBlcmNlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzO1xuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50IDw9IDI1KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdsb3cnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGVyY2VudCA+IDI1ICYmIHBlcmNlbnQgPD0gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ21lZGl1bSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJjZW50ID4gNTAgJiYgcGVyY2VudCA8PSA3NSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnZ29vZCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ3ZlcnktZ29vZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cywgKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY29tcG9uZW50LmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wb25lbnQubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjb21wb25lbnQucHJvcGVydGllc0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5tZXRob2RzQ2xhc3MubGVuZ3RoICsgY29tcG9uZW50LmlucHV0c0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5vdXRwdXRzQ2xhc3MubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5wcm9wZXJ0aWVzQ2xhc3MsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQubWV0aG9kc0NsYXNzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQuaW5wdXRzQ2xhc3MsIChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKGlucHV0LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQub3V0cHV0c0NsYXNzLCAob3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYob3V0cHV0LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcywgKGNsYXNzZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY2xhc3NlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzc2UnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjbGFzc2UubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjbGFzc2UucHJvcGVydGllcy5sZW5ndGggKyBjbGFzc2UubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goY2xhc3NlLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGlmKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICB9KTtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcywgKGluamVjdGFibGUpID0+IHtcbiAgICAgICAgICAgIGxldCBjbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGluamVjdGFibGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW5qZWN0YWJsZS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmplY3RhYmxlLm5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLmxlbmd0aCArIGluamVjdGFibGUubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMsIChpbnRlcikgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW50ZXIuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW50ZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaW50ZXIubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBpbnRlci5wcm9wZXJ0aWVzLmxlbmd0aCArIGludGVyLm1ldGhvZHMubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGludGVyLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbnRlci5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLCAocGlwZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogcGlwZS5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBwaXBlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBpcGUubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSAxO1xuICAgICAgICAgICAgaWYgKHBpcGUuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWxlcyA9IF8uc29ydEJ5KGZpbGVzLCBbJ2ZpbGVQYXRoJ10pO1xuICAgICAgICB2YXIgY292ZXJhZ2VEYXRhID0ge1xuICAgICAgICAgICAgY291bnQ6IE1hdGguZmxvb3IodG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCAvIGZpbGVzLmxlbmd0aCksXG4gICAgICAgICAgICBzdGF0dXM6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGNvdmVyYWdlRGF0YS5zdGF0dXMgPSBnZXRTdGF0dXMoY292ZXJhZ2VEYXRhLmNvdW50KTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ2NvdmVyYWdlJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdjb3ZlcmFnZScsXG4gICAgICAgICAgICBmaWxlczogZmlsZXMsXG4gICAgICAgICAgICBkYXRhOiBjb3ZlcmFnZURhdGFcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1BhZ2VzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlcycpO1xuICAgICAgICBsZXQgcGFnZXMgPSB0aGlzLmNvbmZpZ3VyYXRpb24ucGFnZXMsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHBhZ2VzLmxlbmd0aCxcbiAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgcGFnZScsIHBhZ2VzW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAkaHRtbGVuZ2luZS5yZW5kZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLCBwYWdlc1tpXSkudGhlbigoaHRtbERhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZXNbaV0ucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSBwYWdlc1tpXS5wYXRoICsgJy8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2VzW2ldLm5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5pbmRleFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9zOiBwYWdlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGZpbmFsUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShmaW5hbFBhdGgpLCBodG1sRGF0YSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgJyArIHBhZ2VzW2ldLm5hbWUgKyAnIHBhZ2UgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5nZW5lcmF0ZVNlYXJjaEluZGV4SnNvbih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBc3NldHNGb2xkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXNvdXJjZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICBsb29wKCk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0Fzc2V0c0ZvbGRlcigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgYXNzZXRzIGZvbGRlcicpO1xuXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBQcm92aWRlZCBhc3NldHMgZm9sZGVyICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlcn0gZGlkIG5vdCBleGlzdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1Jlc291cmNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgbWFpbiByZXNvdXJjZXMnKTtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy9yZXNvdXJjZXMvJyksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcmVzb3VyY2VzIGNvcHkgJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmV4dFRoZW1lKSwgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnL3N0eWxlcy8nKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGV4dGVybmFsIHN0eWxpbmcgdGhlbWUgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBjb3B5IHN1Y2NlZWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0dyYXBocygpIHtcblxuICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbmFsVGltZSA9IChuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnRG9jdW1lbnRhdGlvbiBnZW5lcmF0ZWQgaW4gJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnIGluICcgKyBmaW5hbFRpbWUgKyAnIHNlY29uZHMgdXNpbmcgJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSArICcgdGhlbWUnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuc2VydmUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XZWJTZXJ2ZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlR3JhcGgpIHtcblxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0dyYXBoIGdlbmVyYXRpb24gZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBtYWluIGdyYXBoJyk7XG4gICAgICAgICAgICBsZXQgbW9kdWxlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzLFxuICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgbGVuID0gbW9kdWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIG1vZHVsZSBncmFwaCcsIG1vZHVsZXNbaV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJ21vZHVsZXMvJyArIG1vZHVsZXNbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAkbmdkZW5naW5lLnJlbmRlckdyYXBoKG1vZHVsZXNbaV0uZmlsZSwgZmluYWxQYXRoLCAnZicpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZmluYWxNYWluR3JhcGhQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgIGlmKGZpbmFsTWFpbkdyYXBoUGF0aC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGZpbmFsTWFpbkdyYXBoUGF0aCArPSAnLyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbE1haW5HcmFwaFBhdGggKz0gJ2dyYXBoJztcbiAgICAgICAgICAgICRuZ2RlbmdpbmUucmVuZGVyR3JhcGgodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnLCBwYXRoLnJlc29sdmUoZmluYWxNYWluR3JhcGhQYXRoKSwgJ3AnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZ3JhcGggZ2VuZXJhdGlvbjogJywgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW5XZWJTZXJ2ZXIoZm9sZGVyKSB7XG4gICAgICAgIExpdmVTZXJ2ZXIuc3RhcnQoe1xuICAgICAgICAgICAgcm9vdDogZm9sZGVyLFxuICAgICAgICAgICAgb3BlbjogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm9wZW4sXG4gICAgICAgICAgICBxdWlldDogdHJ1ZSxcbiAgICAgICAgICAgIGxvZ0xldmVsOiAwLFxuICAgICAgICAgICAgcG9ydDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBhcHBsaWNhdGlvbiAvIHJvb3QgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIGdldCBhcHBsaWNhdGlvbigpOkFwcGxpY2F0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBnZXQgaXNDTEkoKTpib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSAnLi9hcHAvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4vdXRpbHMvZGVmYXVsdHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyksXG4gICAgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpLFxuICAgIGZpbGVzID0gW10sXG4gICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxuZXhwb3J0IGNsYXNzIENsaUFwcGxpY2F0aW9uIGV4dGVuZHMgQXBwbGljYXRpb25cbntcbiAgICAvKipcbiAgICAgKiBSdW4gY29tcG9kb2MgZnJvbSB0aGUgY29tbWFuZCBsaW5lLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZW5lcmF0ZSgpIHtcblxuICAgICAgICBwcm9ncmFtXG4gICAgICAgICAgICAudmVyc2lvbihwa2cudmVyc2lvbilcbiAgICAgICAgICAgIC51c2FnZSgnPHNyYz4gW29wdGlvbnNdJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1wLCAtLXRzY29uZmlnIFtjb25maWddJywgJ0EgdHNjb25maWcuanNvbiBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1kLCAtLW91dHB1dCBbZm9sZGVyXScsICdXaGVyZSB0byBzdG9yZSB0aGUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQ6IC4vZG9jdW1lbnRhdGlvbiknLCBDT01QT0RPQ19ERUZBVUxUUy5mb2xkZXIpXG4gICAgICAgICAgICAub3B0aW9uKCctYiwgLS1iYXNlIFtiYXNlXScsICdCYXNlIHJlZmVyZW5jZSBvZiBodG1sIHRhZyA8YmFzZT4nLCBDT01QT0RPQ19ERUZBVUxUUy5iYXNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXksIC0tZXh0VGhlbWUgW2ZpbGVdJywgJ0V4dGVybmFsIHN0eWxpbmcgdGhlbWUgZmlsZScpXG4gICAgICAgICAgICAub3B0aW9uKCctbiwgLS1uYW1lIFtuYW1lXScsICdUaXRsZSBkb2N1bWVudGF0aW9uJywgQ09NUE9ET0NfREVGQVVMVFMudGl0bGUpXG4gICAgICAgICAgICAub3B0aW9uKCctYSwgLS1hc3NldHNGb2xkZXIgW2ZvbGRlcl0nLCAnRXh0ZXJuYWwgYXNzZXRzIGZvbGRlciB0byBjb3B5IGluIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIGZvbGRlcicpXG4gICAgICAgICAgICAub3B0aW9uKCctbywgLS1vcGVuJywgJ09wZW4gdGhlIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uJywgZmFsc2UpXG4gICAgICAgICAgICAvLy5vcHRpb24oJy1pLCAtLWluY2x1ZGVzIFtwYXRoXScsICdQYXRoIG9mIGV4dGVybmFsIG1hcmtkb3duIGZpbGVzIHRvIGluY2x1ZGUnKVxuICAgICAgICAgICAgLy8ub3B0aW9uKCctaiwgLS1pbmNsdWRlc05hbWUgW25hbWVdJywgJ05hbWUgb2YgaXRlbSBtZW51IG9mIGV4dGVybmFscyBtYXJrZG93biBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy10LCAtLXNpbGVudCcsICdJbiBzaWxlbnQgbW9kZSwgbG9nIG1lc3NhZ2VzIGFyZW5cXCd0IGxvZ2dlZCBpbiB0aGUgY29uc29sZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXMsIC0tc2VydmUnLCAnU2VydmUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQgaHR0cDovL2xvY2FsaG9zdDo4MDgwLyknLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy1yLCAtLXBvcnQgW3BvcnRdJywgJ0NoYW5nZSBkZWZhdWx0IHNlcnZpbmcgcG9ydCcsIENPTVBPRE9DX0RFRkFVTFRTLnBvcnQpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRoZW1lIFt0aGVtZV0nLCAnQ2hvb3NlIG9uZSBvZiBhdmFpbGFibGUgdGhlbWVzLCBkZWZhdWx0IGlzIFxcJ2dpdGJvb2tcXCcgKGxhcmF2ZWwsIG9yaWdpbmFsLCBwb3N0bWFyaywgcmVhZHRoZWRvY3MsIHN0cmlwZSwgdmFncmFudCknKVxuICAgICAgICAgICAgLm9wdGlvbignLS1oaWRlR2VuZXJhdG9yJywgJ0RvIG5vdCBwcmludCB0aGUgQ29tcG9kb2MgbGluayBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVTb3VyY2VDb2RlJywgJ0RvIG5vdCBhZGQgc291cmNlIGNvZGUgdGFiJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVHcmFwaCcsICdEbyBub3QgYWRkIHRoZSBkZXBlbmRlbmN5IGdyYXBoJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVDb3ZlcmFnZScsICdEbyBub3QgYWRkIHRoZSBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHJlcG9ydCcsIGZhbHNlKVxuICAgICAgICAgICAgLnBhcnNlKHByb2Nlc3MuYXJndik7XG5cbiAgICAgICAgbGV0IG91dHB1dEhlbHAgPSAoKSA9PiB7XG4gICAgICAgICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKVxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ID0gcHJvZ3JhbS5vdXRwdXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5iYXNlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYmFzZSA9IHByb2dyYW0uYmFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmV4dFRoZW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUgPSBwcm9ncmFtLmV4dFRoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0udGhlbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSA9IHByb2dyYW0udGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5uYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID0gcHJvZ3JhbS5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uYXNzZXRzRm9sZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyID0gcHJvZ3JhbS5hc3NldHNGb2xkZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3BlbiA9IHByb2dyYW0ub3BlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgID0gcHJvZ3JhbS5pbmNsdWRlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzTmFtZSAgPSBwcm9ncmFtLmluY2x1ZGVzTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNpbGVudCkge1xuICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5zZXJ2ZSAgPSBwcm9ncmFtLnNlcnZlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ucG9ydCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnQgPSBwcm9ncmFtLnBvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaGlkZUdlbmVyYXRvciA9IHByb2dyYW0uaGlkZUdlbmVyYXRvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVNvdXJjZUNvZGUgPSBwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZUdyYXBoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoID0gcHJvZ3JhbS5kaXNhYmxlR3JhcGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UgPSBwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNlcnZlICYmICFwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICAvLyBpZiAtcyAmIC1kLCBzZXJ2ZSBpdFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0ub3V0cHV0KSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgJHtwcm9ncmFtLm91dHB1dH0gZm9sZGVyIGRvZXNuJ3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3Byb2dyYW0ub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7cHJvZ3JhbS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHN1cGVyLnJ1bldlYlNlcnZlcihwcm9ncmFtLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3JhbS5zZXJ2ZSAmJiAhcHJvZ3JhbS50c2NvbmZpZyAmJiAhcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgICAgIC8vIGlmIG9ubHkgLXMgZmluZCAuL2RvY3VtZW50YXRpb24sIGlmIG9rIHNlcnZlLCBlbHNlIGVycm9yIHByb3ZpZGUgLWRcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLm91dHB1dCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1Byb3ZpZGUgb3V0cHV0IGdlbmVyYXRlZCBmb2xkZXIgd2l0aCAtZCBmbGFnJyk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHtwcm9ncmFtLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3Byb2dyYW0ucG9ydH1gKTtcbiAgICAgICAgICAgICAgICBzdXBlci5ydW5XZWJTZXJ2ZXIocHJvZ3JhbS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHByb2dyYW0uaGlkZUdlbmVyYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5oaWRlR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRlZmF1bHRXYWxrRk9sZGVyID0gY3dkIHx8ICcuJyxcbiAgICAgICAgICAgICAgICB3YWxrID0gKGRpciwgZXhjbHVkZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4Y2x1ZGUuaW5kZXhPZihmaWxlKSA8IDAgJiYgZGlyLmluZGV4T2YoJ25vZGVfbW9kdWxlcycpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUgPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQod2FsayhmaWxlLCBleGNsdWRlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKC8oc3BlY3xcXC5kKVxcLnRzLy50ZXN0KGZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSWdub3JpbmcnLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLnRzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0luY2x1ZGluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0udHNjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignXCJ0c2NvbmZpZy5qc29uXCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeScpO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9maWxlID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKSksXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aC5iYXNlbmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyB0c2NvbmZpZycsIF9maWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHJlcXVpcmUoX2ZpbGUpLmZpbGVzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb2YgdHNjb25maWcuanNvbiBhcyBhIHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICAgIGN3ZCA9IF9maWxlLnNwbGl0KHBhdGguc2VwKS5zbGljZSgwLCAtMSkuam9pbihwYXRoLnNlcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGUgPSByZXF1aXJlKF9maWxlKS5leGNsdWRlIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHdhbGsoY3dkIHx8ICcuJywgZXhjbHVkZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLmdlbmVyYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgZWxzZSBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZUZvbGRlciA9IHByb2dyYW0uYXJnc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFByb3ZpZGVkIHNvdXJjZSBmb2xkZXIgJHtzb3VyY2VGb2xkZXJ9IHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgcHJvdmlkZWQgc291cmNlIGZvbGRlcicpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzID0gd2FsayhwYXRoLnJlc29sdmUoc291cmNlRm9sZGVyKSwgW10pO1xuXG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcigndHNjb25maWcuanNvbiBmaWxlIHdhcyBub3QgZm91bmQsIHBsZWFzZSB1c2UgLXAgZmxhZycpO1xuICAgICAgICAgICAgICAgIG91dHB1dEhlbHAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJndXRpbCIsInJlcXVpcmUiLCJjIiwiY29sb3JzIiwicGtnIiwiTEVWRUwiLCJuYW1lIiwidmVyc2lvbiIsImxvZ2dlciIsImxvZyIsInNpbGVudCIsImFyZ3MiLCJmb3JtYXQiLCJJTkZPIiwiRVJST1IiLCJERUJVRyIsImxldmVsIiwicGFkIiwicyIsImwiLCJBcnJheSIsIk1hdGgiLCJtYXgiLCJsZW5ndGgiLCJqb2luIiwibXNnIiwic2hpZnQiLCJncmVlbiIsImN5YW4iLCJyZWQiLCJMb2dnZXIiLCJBbmd1bGFyQVBJcyIsInR5cGUiLCJfcmVzdWx0IiwiYW5ndWxhck1vZHVsZUFQSXMiLCJhbmd1bGFyTW9kdWxlIiwiaSIsImxlbiIsInRpdGxlIiwiZGF0YSIsIkRlcGVuZGVuY2llc0VuZ2luZSIsIl9pbnN0YW5jZSIsIkVycm9yIiwicmF3RGF0YSIsIm1vZHVsZXMiLCJfIiwiY29tcG9uZW50cyIsImRpcmVjdGl2ZXMiLCJpbmplY3RhYmxlcyIsImludGVyZmFjZXMiLCJyb3V0ZXMiLCJwaXBlcyIsImNsYXNzZXMiLCJmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzIiwiaW5kZXhPZiIsInJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcyIsInJlc3VsdEluQ29tcG9kb2NDbGFzc2VzIiwicmVzdWx0SW5Bbmd1bGFyQVBJcyIsImZpbmRlckluQW5ndWxhckFQSXMiLCIkZGVwZW5kZW5jaWVzRW5naW5lIiwiZ2V0SW5zdGFuY2UiLCJhIiwib3BlcmF0b3IiLCJiIiwib3B0aW9ucyIsImFyZ3VtZW50cyIsInJlc3VsdCIsImludmVyc2UiLCJmbiIsInRleHQiLCJORzJfTU9EVUxFUyIsIm9wdGlvbmFsVmFsdWUiLCJIYW5kbGViYXJzIiwiZXNjYXBlRXhwcmVzc2lvbiIsInJlcGxhY2UiLCJtZXRob2QiLCJtYXAiLCJhcmciLCJmaW5kIiwic291cmNlIiwicGF0aCIsImpzZG9jVGFncyIsInRhZ05hbWUiLCJjb21tZW50IiwidGFncyIsInRhZyIsInR5cGVFeHByZXNzaW9uIiwicGFyYW1ldGVyTmFtZSIsInB1c2giLCJocmVmIiwidGFyZ2V0IiwiSlNPTiIsInN0cmluZ2lmeSIsInBhcnRpYWxzIiwibG9vcCIsInJlc29sdmUiLCJyZWplY3QiLCJfX2Rpcm5hbWUiLCJlcnIiLCJQcm9taXNlIiwibWFpbkRhdGEiLCJwYWdlIiwibyIsInRoYXQiLCJhc3NpZ24iLCJjYWNoZSIsInRlbXBsYXRlIiwicmVuZGVyZXIiLCJSZW5kZXJlciIsImNvZGUiLCJsYW5ndWFnZSIsInZhbGlkTGFuZyIsImhpZ2hsaWdodGpzIiwiZ2V0TGFuZ3VhZ2UiLCJoaWdobGlnaHRlZCIsImhpZ2hsaWdodCIsInZhbHVlIiwic2V0T3B0aW9ucyIsInByb2Nlc3MiLCJjd2QiLCJtYXJrZWQiLCJmaWxlcGF0aCIsIkNPTVBPRE9DX0RFRkFVTFRTIiwiZm9sZGVyIiwidGhlbWUiLCJwb3J0IiwiYmFzZSIsImRpc2FibGVTb3VyY2VDb2RlIiwiZGlzYWJsZUdyYXBoIiwiZGlzYWJsZUNvdmVyYWdlIiwiQ29uZmlndXJhdGlvbiIsIl9wYWdlcyIsInBhZ2VzIiwiX21haW5EYXRhIiwiYmluUGF0aCIsImdsb2JhbEJpblBhdGgiLCJwbGF0Zm9ybSIsInBhdGhuYW1lcyIsImVudiIsIlBBVEgiLCJzcGxpdCIsImV4ZWNQYXRoIiwic3RyaXBUcmFpbGluZ1NlcCIsInRoZVBhdGgiLCJzbGljZSIsInBhdGhJc0luc2lkZSIsInBvdGVudGlhbFBhcmVudCIsInRvTG93ZXJDYXNlIiwibGFzdEluZGV4T2YiLCJ1bmRlZmluZWQiLCJpc1BhdGhJbnNpZGUiLCJhcmd2Iiwib3V0cHV0cGF0aCIsIm5nZFBhdGgiLCJpc0dsb2JhbCIsIk1PREUiLCJ0ZXN0IiwiZmluYWxQYXRoIiwic3Rkb3V0Iiwic3RkZXJyIiwibHVuciIsImNoZWVyaW8iLCJFbnRpdGllcyIsIkFsbEh0bWxFbnRpdGllcyIsIiRjb25maWd1cmF0aW9uIiwiSHRtbCIsInNlYXJjaEluZGV4IiwicmVmIiwiZmllbGQiLCJib29zdCIsIiQiLCJsb2FkIiwiaHRtbCIsImRlY29kZSIsInVybCIsIm91dHB1dCIsImRvYyIsImluZm9zIiwiY29udGV4dCIsImRvY3VtZW50c1N0b3JlIiwiZ2V0U2VhcmNoSW5kZXgiLCJhZGQiLCJvdXRwdXRGb2xkZXIiLCJlcnJvciIsInRzYW55IiwidHMiLCJub2RlIiwiZ2V0SlNEb2NzIiwiYXBwbHkiLCJzdHIiLCJjb3VudCIsImluZGVudCIsInN0cmlwSW5kZW50IiwibWF0Y2giLCJtaW4iLCJ4IiwicmUiLCJSZWdFeHAiLCJyZXBlYXRpbmciLCJuIiwiVHlwZUVycm9yIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJyZXQiLCJpbmRlbnRTdHJpbmciLCJ0cmFuc3BpbGVPcHRpb25zIiwiaW5wdXRGaWxlTmFtZSIsImZpbGVOYW1lIiwianN4IiwiY29tcGlsZXJIb3N0IiwidHNjb25maWdEaXJlY3RvcnkiLCJsaWJTb3VyY2UiLCJmcyIsInRvU3RyaW5nIiwiZSIsImRlYnVnIiwiUm91dGVyUGFyc2VyIiwibW9kdWxlc1RyZWUiLCJyb290TW9kdWxlIiwibW9kdWxlc1dpdGhSb3V0ZXMiLCJyb3V0ZSIsIm1vZHVsZU5hbWUiLCJtb2R1bGVJbXBvcnRzIiwibW9kdWxlIiwiaW1wb3J0cyIsImltcG9ydHNOb2RlIiwiaW5pdGlhbGl6ZXIiLCJlbGVtZW50cyIsImVsZW1lbnQiLCJhcmd1bWVudCIsImNsZWFuTW9kdWxlc1RyZWUiLCJtb2R1bGVzQ2xlYW5lciIsImFyciIsInBhcmVudCIsImNoaWxkcmVuIiwidXRpbCIsImRlcHRoIiwicm91dGVzVHJlZSIsImZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZSIsImxvb3BNb2R1bGVzUGFyc2VyIiwicGFyc2UiLCJraW5kIiwiY2xlYW5lZFJvdXRlc1RyZWUiLCJjbGVhblJvdXRlc1RyZWUiLCJnZXROZXN0ZWRDaGlsZHJlbiIsIm91dCIsImZpcnN0TG9vcE1vZHVsZSIsImltcG9ydE5vZGUiLCJnZW4iLCJ0bXAiLCJ0b2tlbiIsImdldENoaWxkcmVuIiwiZm9yRWFjaCIsInZpc2l0QW5kUmVjb2duaXplIiwiRmlyc3RMaXRlcmFsVG9rZW4iLCJJZGVudGlmaWVyIiwiU3RyaW5nTGl0ZXJhbCIsIkFycmF5TGl0ZXJhbEV4cHJlc3Npb24iLCJJbXBvcnRLZXl3b3JkIiwiRnJvbUtleXdvcmQiLCJFeHBvcnRLZXl3b3JkIiwiQ2xhc3NLZXl3b3JkIiwiVGhpc0tleXdvcmQiLCJDb25zdHJ1Y3RvcktleXdvcmQiLCJGYWxzZUtleXdvcmQiLCJUcnVlS2V5d29yZCIsIk51bGxLZXl3b3JkIiwiQXRUb2tlbiIsIlBsdXNUb2tlbiIsIkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4iLCJPcGVuUGFyZW5Ub2tlbiIsIkltcG9ydENsYXVzZSIsIk9iamVjdExpdGVyYWxFeHByZXNzaW9uIiwiQmxvY2siLCJDbG9zZUJyYWNlVG9rZW4iLCJDbG9zZVBhcmVuVG9rZW4iLCJPcGVuQnJhY2tldFRva2VuIiwiQ2xvc2VCcmFja2V0VG9rZW4iLCJTZW1pY29sb25Ub2tlbiIsIkNvbW1hVG9rZW4iLCJDb2xvblRva2VuIiwiRG90VG9rZW4iLCJEb1N0YXRlbWVudCIsIkRlY29yYXRvciIsIkZpcnN0QXNzaWdubWVudCIsIkZpcnN0UHVuY3R1YXRpb24iLCJQcml2YXRlS2V5d29yZCIsIlB1YmxpY0tleXdvcmQiLCJmaWxlcyIsIkVTNSIsIkNvbW1vbkpTIiwicHJvZ3JhbSIsIl90IiwiZGVwcyIsInNvdXJjZUZpbGVzIiwiZ2V0U291cmNlRmlsZXMiLCJmaWxlIiwiZmlsZVBhdGgiLCJpbmZvIiwiZ2V0U291cmNlRmlsZURlY29yYXRvcnMiLCJzcmNGaWxlIiwib3V0cHV0U3ltYm9scyIsImNsZWFuZXIiLCJwcm9ncmFtQ29tcG9uZW50Iiwic291cmNlRmlsZSIsImdldFNvdXJjZUZpbGUiLCJ0eXBlQ2hlY2tlckNvbXBvbmVudCIsImdldFR5cGVDaGVja2VyIiwiZGVjb3JhdG9ycyIsInZpc2l0Tm9kZSIsInZpc2l0ZWROb2RlIiwiaW5kZXgiLCJtZXRhZGF0YSIsInBvcCIsImdldFN5bWJvbGVOYW1lIiwicHJvcHMiLCJmaW5kUHJvcHMiLCJJTyIsImdldENvbXBvbmVudElPIiwiaXNNb2R1bGUiLCJnZXRNb2R1bGVQcm92aWRlcnMiLCJnZXRNb2R1bGVEZWNsYXRpb25zIiwiZ2V0TW9kdWxlSW1wb3J0cyIsImdldE1vZHVsZUV4cG9ydHMiLCJnZXRNb2R1bGVCb290c3RyYXAiLCJicmVha0xpbmVzIiwiZGVzY3JpcHRpb24iLCJnZXRUZXh0IiwiaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzIiwiYWRkTW9kdWxlV2l0aFJvdXRlcyIsImdldE1vZHVsZUltcG9ydHNSYXciLCJhZGRNb2R1bGUiLCJpc0NvbXBvbmVudCIsImdldENvbXBvbmVudENoYW5nZURldGVjdGlvbiIsImdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24iLCJnZXRDb21wb25lbnRFeHBvcnRBcyIsImdldENvbXBvbmVudEhvc3QiLCJnZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YSIsImdldENvbXBvbmVudE1vZHVsZUlkIiwiZ2V0Q29tcG9uZW50T3V0cHV0cyIsImdldENvbXBvbmVudFByb3ZpZGVycyIsImdldENvbXBvbmVudFNlbGVjdG9yIiwiZ2V0Q29tcG9uZW50U3R5bGVVcmxzIiwiZ2V0Q29tcG9uZW50U3R5bGVzIiwiZ2V0Q29tcG9uZW50VGVtcGxhdGUiLCJnZXRDb21wb25lbnRUZW1wbGF0ZVVybCIsImdldENvbXBvbmVudFZpZXdQcm92aWRlcnMiLCJpbnB1dHMiLCJvdXRwdXRzIiwicHJvcGVydGllcyIsIm1ldGhvZHMiLCJpc0luamVjdGFibGUiLCJpc1BpcGUiLCJpc0RpcmVjdGl2ZSIsIl9fY2FjaGUiLCJmaWx0ZXJCeURlY29yYXRvcnMiLCJleHByZXNzaW9uIiwiZmlsdGVyIiwic3ltYm9sIiwiZmxhZ3MiLCJDbGFzcyIsIkludGVyZmFjZSIsImdldEludGVyZmFjZUlPIiwiZ2V0Um91dGVJTyIsIm5ld1JvdXRlcyIsIkNsYXNzRGVjbGFyYXRpb24iLCJFeHByZXNzaW9uU3RhdGVtZW50IiwicmVzdWx0Tm9kZSIsImZpbmRFeHByZXNzaW9uQnlOYW1lIiwic2V0Um9vdE1vZHVsZSIsInN5bWJvbHMiLCJkIiwiZW50cnlOb2RlIiwiZ2V0U3ltYm9sRGVwcyIsInByb3ZpZGVyTmFtZSIsInBhcnNlRGVlcEluZGVudGlmaWVyIiwiY29tcG9uZW50IiwiZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lIiwiZ2V0U3ltYm9sRGVwc1JhdyIsImdldFN5bWJvbERlcHNPYmplY3QiLCJkZWNvcmF0b3JUeXBlIiwicHJvcGVydHkiLCJpbkRlY29yYXRvciIsImluQXJncyIsInN0cmluZ2lmeURlZmF1bHRWYWx1ZSIsInZpc2l0VHlwZSIsImdldERvY3VtZW50YXRpb25Db21tZW50IiwidHlwZVRvU3RyaW5nIiwiZ2V0VHlwZUF0TG9jYXRpb24iLCJvdXREZWNvcmF0b3IiLCJvdXRBcmdzIiwibWVtYmVyIiwibW9kaWZpZXJzIiwiaXNQdWJsaWMiLCJzb21lIiwibW9kaWZpZXIiLCJpc0ludGVybmFsTWVtYmVyIiwiaXNQcml2YXRlIiwiaW50ZXJuYWxUYWdzIiwianNEb2MiLCJtZXRob2ROYW1lIiwiQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUyIsInBhcmFtZXRlcnMiLCJfcGFyYW1ldGVycyIsInZpc2l0QXJndW1lbnQiLCJwcm9wIiwianNkb2N0YWdzIiwiX3RzIiwibG9jYWxlQ29tcGFyZSIsIm1lbWJlcnMiLCJpbnB1dERlY29yYXRvciIsImdldERlY29yYXRvck9mVHlwZSIsInZpc2l0SW5wdXQiLCJ2aXNpdE91dHB1dCIsImlzUHJpdmF0ZU9ySW50ZXJuYWwiLCJNZXRob2REZWNsYXJhdGlvbiIsIk1ldGhvZFNpZ25hdHVyZSIsImlzQW5ndWxhckxpZmVjeWNsZUhvb2siLCJ2aXNpdE1ldGhvZERlY2xhcmF0aW9uIiwiUHJvcGVydHlEZWNsYXJhdGlvbiIsIlByb3BlcnR5U2lnbmF0dXJlIiwiR2V0QWNjZXNzb3IiLCJ2aXNpdFByb3BlcnR5IiwiQ2FsbFNpZ25hdHVyZSIsInZpc2l0Q2FsbERlY2xhcmF0aW9uIiwiSW5kZXhTaWduYXR1cmUiLCJ2aXNpdEluZGV4RGVjbGFyYXRpb24iLCJDb25zdHJ1Y3RvciIsIl9jb25zdHJ1Y3RvclByb3BlcnRpZXMiLCJ2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24iLCJqIiwic29ydCIsImdldE5hbWVzQ29tcGFyZUZuIiwiZGVjb3JhdG9yIiwic2VsZWN0b3IiLCJleHBvcnRBcyIsImRlY29yYXRvcklkZW50aWZpZXJUZXh0IiwiY2xhc3NEZWNsYXJhdGlvbiIsImdldFN5bWJvbEF0TG9jYXRpb24iLCJjbGFzc05hbWUiLCJkaXJlY3RpdmVJbmZvIiwiaXNEaXJlY3RpdmVEZWNvcmF0b3IiLCJ2aXNpdERpcmVjdGl2ZURlY29yYXRvciIsInZpc2l0TWVtYmVycyIsImlzU2VydmljZURlY29yYXRvciIsImlzUGlwZURlY29yYXRvciIsImlzTW9kdWxlRGVjb3JhdG9yIiwiZGVjbGFyYXRpb25MaXN0IiwiZGVjbGFyYXRpb25zIiwidHlwZU5hbWUiLCJhZGRSb3V0ZSIsImdlbmVyYXRlIiwiZmlsZW5hbWUiLCJyZXMiLCJzdGF0ZW1lbnRzIiwicmVkdWNlIiwiZGlyZWN0aXZlIiwic3RhdGVtZW50IiwiVmFyaWFibGVTdGF0ZW1lbnQiLCJjb25jYXQiLCJ2aXNpdEVudW1EZWNsYXJhdGlvbiIsInZpc2l0Q2xhc3NEZWNsYXJhdGlvbiIsIkludGVyZmFjZURlY2xhcmF0aW9uIiwicG9zIiwiZW5kIiwiaWRlbnRpZmllciIsImxhYmVsIiwibnNNb2R1bGUiLCJnZXRUeXBlIiwiX19uc01vZHVsZSIsInNhbml0aXplVXJscyIsInQiLCJkZXRlY3RJbmRlbnQiLCJ1cmxzIiwibXVsdGlMaW5lIiwicGFyc2VQcm9wZXJ0aWVzIiwib2JqIiwicGFyc2VTeW1ib2xUZXh0IiwiYnVpbGRJZGVudGlmaWVyTmFtZSIsIm5vZGVOYW1lIiwidW5rbm93biIsImVsIiwiU3ByZWFkRWxlbWVudEV4cHJlc3Npb24iLCJwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbiIsIl9nZW5Qcm92aWRlck5hbWUiLCJfcHJvdmlkZXJQcm9wcyIsImJvZHkiLCJwYXJhbXMiLCJwYXJzZVN5bWJvbEVsZW1lbnRzIiwiZnVuY3Rpb25BcmdzIiwicGFyc2VTeW1ib2xzIiwiZ2xvYiIsIiRodG1sZW5naW5lIiwiSHRtbEVuZ2luZSIsIiRmaWxlZW5naW5lIiwiRmlsZUVuZ2luZSIsIiRtYXJrZG93bmVuZ2luZSIsIk1hcmtkb3duRW5naW5lIiwiJG5nZGVuZ2luZSIsIk5nZEVuZ2luZSIsIiRzZWFyY2hFbmdpbmUiLCJTZWFyY2hFbmdpbmUiLCJzdGFydFRpbWUiLCJEYXRlIiwiY29uZmlndXJhdGlvbiIsImdldFBpcGVzIiwiYWRkUGFnZSIsImdldENsYXNzZXMiLCJnZXREaXJlY3RpdmVzIiwib3B0aW9uIiwiaW5pdCIsInRoZW4iLCJwcm9jZXNzUGFja2FnZUpzb24iLCJnZXQiLCJwYWNrYWdlRGF0YSIsInBhcnNlZERhdGEiLCJkb2N1bWVudGF0aW9uTWFpbk5hbWUiLCJkb2N1bWVudGF0aW9uTWFpbkRlc2NyaXB0aW9uIiwicHJvY2Vzc01hcmtkb3duIiwiZXJyb3JNZXNzYWdlIiwiZ2V0UmVhZG1lRmlsZSIsInJlYWRtZURhdGEiLCJyZWFkbWUiLCJnZXREZXBlbmRlbmNpZXNEYXRhIiwiY3Jhd2xlciIsIkRlcGVuZGVuY2llcyIsImRlcGVuZGVuY2llc0RhdGEiLCJnZXREZXBlbmRlbmNpZXMiLCJwcmVwYXJlTW9kdWxlcyIsInByZXBhcmVDb21wb25lbnRzIiwicHJlcGFyZURpcmVjdGl2ZXMiLCJwcmVwYXJlSW5qZWN0YWJsZXMiLCJwcmVwYXJlUm91dGVzIiwicHJlcGFyZVBpcGVzIiwicHJlcGFyZUNsYXNzZXMiLCJwcmVwYXJlSW50ZXJmYWNlcyIsInByZXBhcmVDb3ZlcmFnZSIsInByb2Nlc3NQYWdlcyIsImdldE1vZHVsZXMiLCJnZXRJbnRlcmZhY2VzIiwiZ2V0Q29tcG9uZW50cyIsImRpcm5hbWUiLCJyZWFkbWVGaWxlIiwiZ2V0SW5qZWN0YWJsZXMiLCJnZXRSb3V0ZXMiLCJ0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkIiwiZ2V0U3RhdHVzIiwicGVyY2VudCIsInN0YXR1cyIsImNsIiwidG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIiwidG90YWxTdGF0ZW1lbnRzIiwicHJvcGVydGllc0NsYXNzIiwibWV0aG9kc0NsYXNzIiwiaW5wdXRzQ2xhc3MiLCJvdXRwdXRzQ2xhc3MiLCJpbnB1dCIsImNvdmVyYWdlUGVyY2VudCIsImZsb29yIiwiY292ZXJhZ2VDb3VudCIsImNsYXNzZSIsImluamVjdGFibGUiLCJpbnRlciIsInBpcGUiLCJjb3ZlcmFnZURhdGEiLCJyZW5kZXIiLCJodG1sRGF0YSIsImluZGV4UGFnZSIsImdlbmVyYXRlU2VhcmNoSW5kZXhKc29uIiwiYXNzZXRzRm9sZGVyIiwicHJvY2Vzc0Fzc2V0c0ZvbGRlciIsInByb2Nlc3NSZXNvdXJjZXMiLCJleHRUaGVtZSIsInByb2Nlc3NHcmFwaHMiLCJvbkNvbXBsZXRlIiwiZmluYWxUaW1lIiwic2VydmUiLCJydW5XZWJTZXJ2ZXIiLCJyZW5kZXJHcmFwaCIsImZpbmFsTWFpbkdyYXBoUGF0aCIsInRzY29uZmlnIiwib3BlbiIsInVzYWdlIiwib3V0cHV0SGVscCIsImV4aXQiLCJpbmNsdWRlcyIsImluY2x1ZGVzTmFtZSIsImhpZGVHZW5lcmF0b3IiLCJkZWZhdWx0V2Fsa0ZPbGRlciIsIndhbGsiLCJkaXIiLCJleGNsdWRlIiwicmVzdWx0cyIsImxpc3QiLCJzdGF0IiwiaXNEaXJlY3RvcnkiLCJfZmlsZSIsInNvdXJjZUZvbGRlciIsIkFwcGxpY2F0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsUUFBUUMsUUFBUSxXQUFSLENBQVo7QUFDQSxJQUFJQyxJQUFJRixNQUFNRyxNQUFkO0FBQ0EsSUFBSUMsUUFBTUgsUUFBUSxpQkFBUixDQUFWO0FBRUEsSUFBS0ksS0FBTDtBQUFBLFdBQUtBOzJCQUNKLFVBQUE7NEJBQ0EsV0FBQTs0QkFDRyxXQUFBO0NBSEosRUFBS0EsVUFBQUEsVUFBQSxDQUFMOzs7Ozs7YUFjT0MsSUFBTCxHQUFZRixNQUFJRSxJQUFoQjthQUNLQyxPQUFMLEdBQWVILE1BQUlHLE9BQW5CO2FBQ0tDLE1BQUwsR0FBY1IsTUFBTVMsR0FBcEI7YUFDS0MsTUFBTCxHQUFjLElBQWQ7Ozs7OztnQkFJRyxDQUFDLEtBQUtBLE1BQVQsRUFBaUI7OzhDQURWQzs7OztpQkFFRkgsTUFBTCxDQUNDLEtBQUtJLE1BQUwsY0FBWVAsTUFBTVEsSUFBbEIsU0FBMkJGLElBQTNCLEVBREQ7Ozs7O2dCQU1HLENBQUMsS0FBS0QsTUFBVCxFQUFpQjs7K0NBRFRDOzs7O2lCQUVISCxNQUFMLENBQ0MsS0FBS0ksTUFBTCxjQUFZUCxNQUFNUyxLQUFsQixTQUE0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
