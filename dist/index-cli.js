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
var pkg$2 = require('../package.json');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["DEBUG"] = 1] = "DEBUG";
    LEVEL[LEVEL["ERROR"] = 2] = "ERROR";
})(LEVEL || (LEVEL = {}));

var Logger = function () {
    function Logger() {
        classCallCheck(this, Logger);

        this.name = pkg$2.name;
        this.version = pkg$2.version;
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
var pkg$1 = require('../package.json');
var cwd$1 = process.cwd();
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
                tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
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

var pkg = require('../package.json');
var program = require('commander');
var files = [];
var cwd = process.cwd();

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

            program.version(pkg.version).usage('<src> [options]').option('-p, --tsconfig [config]', 'A tsconfig.json file').option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder).option('-b, --base [base]', 'Base reference of html tag <base>', COMPODOC_DEFAULTS.base).option('-y, --extTheme [file]', 'External styling theme file').option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title).option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder').option('-o, --open', 'Open the generated documentation', false).option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false).option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false).option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port).option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)').option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false).option('--disableSourceCode', 'Do not add source code tab', false).option('--disableGraph', 'Do not add the dependency graph', false).option('--disableCoverage', 'Do not add the documentation coverage report', false).parse(process.argv);
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
                    var defaultWalkFOlder = cwd || '.',
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
                            cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                            if (!files) {
                                var exclude = require(_file).exclude || [];
                                files = walk(cwd || '.', exclude);
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

exports.CliApplication = CliApplication;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtY2xpLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbG9nZ2VyLnRzIiwiLi4vc3JjL3V0aWxzL2FuZ3VsYXItYXBpLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbWFya2Rvd24uZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2ZpbGUuZW5naW5lLnRzIiwiLi4vc3JjL3V0aWxzL2RlZmF1bHRzLnRzIiwiLi4vc3JjL2FwcC9jb25maWd1cmF0aW9uLnRzIiwiLi4vc3JjL3V0aWxzL2dsb2JhbC5wYXRoLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL25nZC5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvc2VhcmNoLmVuZ2luZS50cyIsIi4uL3NyYy91dGlscy90cy1pbnRlcm5hbC50cyIsIi4uL3NyYy91dGlsaXRpZXMudHMiLCIuLi9zcmMvdXRpbHMvcm91dGVyLnBhcnNlci50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvY29kZWdlbi50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvZGVwZW5kZW5jaWVzLnRzIiwiLi4vc3JjL2FwcC9hcHBsaWNhdGlvbi50cyIsIi4uL3NyYy9pbmRleC1jbGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsibGV0IGd1dGlsID0gcmVxdWlyZSgnZ3VscC11dGlsJylcbmxldCBjID0gZ3V0aWwuY29sb3JzO1xubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuXG5lbnVtIExFVkVMIHtcblx0SU5GTyxcblx0REVCVUcsXG4gICAgRVJST1Jcbn1cblxuY2xhc3MgTG9nZ2VyIHtcblxuXHRuYW1lO1xuXHRsb2dnZXI7XG5cdHZlcnNpb247XG5cdHNpbGVudDtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm5hbWUgPSBwa2cubmFtZTtcblx0XHR0aGlzLnZlcnNpb24gPSBwa2cudmVyc2lvbjtcblx0XHR0aGlzLmxvZ2dlciA9IGd1dGlsLmxvZztcblx0XHR0aGlzLnNpbGVudCA9IHRydWU7XG5cdH1cblxuXHRpbmZvKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLklORk8sIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdGVycm9yKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkVSUk9SLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRkZWJ1ZyguLi5hcmdzKSB7XG5cdFx0aWYoIXRoaXMuc2lsZW50KSByZXR1cm47XG5cdFx0dGhpcy5sb2dnZXIoXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5ERUJVRywgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0cHJpdmF0ZSBmb3JtYXQobGV2ZWwsIC4uLmFyZ3MpIHtcblxuXHRcdGxldCBwYWQgPSAocywgbCwgYz0nJykgPT4ge1xuXHRcdFx0cmV0dXJuIHMgKyBBcnJheSggTWF0aC5tYXgoMCwgbCAtIHMubGVuZ3RoICsgMSkpLmpvaW4oIGMgKVxuXHRcdH07XG5cblx0XHRsZXQgbXNnID0gYXJncy5qb2luKCcgJyk7XG5cdFx0aWYoYXJncy5sZW5ndGggPiAxKSB7XG5cdFx0XHRtc2cgPSBgJHsgcGFkKGFyZ3Muc2hpZnQoKSwgMTUsICcgJykgfTogJHsgYXJncy5qb2luKCcgJykgfWA7XG5cdFx0fVxuXG5cblx0XHRzd2l0Y2gobGV2ZWwpIHtcblx0XHRcdGNhc2UgTEVWRUwuSU5GTzpcblx0XHRcdFx0bXNnID0gYy5ncmVlbihtc2cpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBMRVZFTC5ERUJVRzpcblx0XHRcdFx0bXNnID0gYy5jeWFuKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExFVkVMLkVSUk9SOlxuXHRcdFx0XHRtc2cgPSBjLnJlZChtc2cpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gW1xuXHRcdFx0bXNnXG5cdFx0XS5qb2luKCcnKTtcblx0fVxufVxuXG5leHBvcnQgbGV0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbiIsImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxubGV0IEFuZ3VsYXJBUElzID0gcmVxdWlyZSgnLi4vc3JjL2RhdGEvYXBpLWxpc3QuanNvbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZGVySW5Bbmd1bGFyQVBJcyh0eXBlOiBzdHJpbmcpIHtcbiAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgc291cmNlOiAnZXh0ZXJuYWwnLFxuICAgICAgICBkYXRhOiBudWxsXG4gICAgfTtcblxuICAgIF8uZm9yRWFjaChBbmd1bGFyQVBJcywgZnVuY3Rpb24oYW5ndWxhck1vZHVsZUFQSXMsIGFuZ3VsYXJNb2R1bGUpIHtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gYW5ndWxhck1vZHVsZUFQSXMubGVuZ3RoO1xuICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyTW9kdWxlQVBJc1tpXS50aXRsZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIF9yZXN1bHQuZGF0YSA9IGFuZ3VsYXJNb2R1bGVBUElzW2ldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBfcmVzdWx0O1xufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgeyBmaW5kZXJJbkFuZ3VsYXJBUElzIH0gZnJvbSAnLi4vLi4vdXRpbHMvYW5ndWxhci1hcGknO1xuXG5jbGFzcyBEZXBlbmRlbmNpZXNFbmdpbmUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTpEZXBlbmRlbmNpZXNFbmdpbmUgPSBuZXcgRGVwZW5kZW5jaWVzRW5naW5lKCk7XG4gICAgcmF3RGF0YTogT2JqZWN0O1xuICAgIG1vZHVsZXM6IE9iamVjdFtdO1xuICAgIGNvbXBvbmVudHM6IE9iamVjdFtdO1xuICAgIGRpcmVjdGl2ZXM6IE9iamVjdFtdO1xuICAgIGluamVjdGFibGVzOiBPYmplY3RbXTtcbiAgICBpbnRlcmZhY2VzOiBPYmplY3RbXTtcbiAgICByb3V0ZXM6IE9iamVjdFtdO1xuICAgIHBpcGVzOiBPYmplY3RbXTtcbiAgICBjbGFzc2VzOiBPYmplY3RbXTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYoRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIERlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIERlcGVuZGVuY2llc0VuZ2luZS5faW5zdGFuY2UgPSB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6RGVwZW5kZW5jaWVzRW5naW5lXG4gICAge1xuICAgICAgICByZXR1cm4gRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZTtcbiAgICB9XG4gICAgaW5pdChkYXRhOiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy5yYXdEYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5tb2R1bGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLm1vZHVsZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNvbXBvbmVudHMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmRpcmVjdGl2ZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5pbmplY3RhYmxlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbmplY3RhYmxlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmludGVyZmFjZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuaW50ZXJmYWNlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgodGhpcy5yYXdEYXRhLnJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnBpcGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLnBpcGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuY2xhc3NlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5jbGFzc2VzLCBbJ25hbWUnXSk7XG4gICAgfVxuICAgIGZpbmQodHlwZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgbGV0IF9yZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2ludGVybmFsJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKGRhdGFbaV0ubmFtZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIF9yZXN1bHQuZGF0YSA9IGRhdGFbaV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5pbmplY3RhYmxlcyksXG4gICAgICAgICAgICByZXN1bHRJbkNvbXBvZG9jQ2xhc3NlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5jbGFzc2VzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQW5ndWxhckFQSXMgPSBmaW5kZXJJbkFuZ3VsYXJBUElzKHR5cGUpXG5cbiAgICAgICAgaWYgKHJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Db21wb2RvY0NsYXNzZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Bbmd1bGFyQVBJcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Bbmd1bGFyQVBJc1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldE1vZHVsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZHVsZXM7XG4gICAgfVxuICAgIGdldENvbXBvbmVudHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHM7XG4gICAgfVxuICAgIGdldERpcmVjdGl2ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXM7XG4gICAgfVxuICAgIGdldEluamVjdGFibGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbmplY3RhYmxlcztcbiAgICB9XG4gICAgZ2V0SW50ZXJmYWNlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlcztcbiAgICB9XG4gICAgZ2V0Um91dGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3V0ZXM7XG4gICAgfVxuICAgIGdldFBpcGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5waXBlcztcbiAgICB9XG4gICAgZ2V0Q2xhc3NlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3NlcztcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgJGRlcGVuZGVuY2llc0VuZ2luZSA9IERlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnN0YW5jZSgpO1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG4vL2ltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnaGFuZGxlYmFycy1oZWxwZXJzJztcbmltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuXG5leHBvcnQgY2xhc3MgSHRtbEVuZ2luZSB7XG4gICAgY2FjaGU6IE9iamVjdCA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvL1RPRE8gdXNlIHRoaXMgaW5zdGVhZCA6IGh0dHBzOi8vZ2l0aHViLmNvbS9hc3NlbWJsZS9oYW5kbGViYXJzLWhlbHBlcnNcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciggXCJjb21wYXJlXCIsIGZ1bmN0aW9uKGEsIG9wZXJhdG9yLCBiLCBvcHRpb25zKSB7XG4gICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hhbmRsZWJhcnMgSGVscGVyIHt7Y29tcGFyZX19IGV4cGVjdHMgNCBhcmd1bWVudHMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luZGV4b2YnOlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IChiLmluZGV4T2YoYSkgIT09IC0xKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGEgPT09IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSAhPT0gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSA+IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hlbHBlciB7e2NvbXBhcmV9fTogaW52YWxpZCBvcGVyYXRvcjogYCcgKyBvcGVyYXRvciArICdgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImZpbHRlckFuZ3VsYXIyTW9kdWxlc1wiLCBmdW5jdGlvbih0ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBORzJfTU9EVUxFUzpzdHJpbmdbXSA9IFtcbiAgICAgICAgICAgICAgICAnQnJvd3Nlck1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ0Zvcm1zTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnSHR0cE1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ1JvdXRlck1vZHVsZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbGVuID0gTkcyX01PRFVMRVMubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKE5HMl9NT0RVTEVTW2ldKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImRlYnVnXCIsIGZ1bmN0aW9uKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgQ29udGV4dFwiKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgICAgaWYgKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3B0aW9uYWxWYWx1ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25hbFZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdicmVha2xpbmVzJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbih0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICc8YnI+Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2dtLCAnJm5ic3A7Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cdC9nbSwgJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOycpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdicmVha0NvbW1hJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbih0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLywvZywgJyw8YnI+Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Z1bmN0aW9uU2lnbmF0dXJlJywgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgICAgIHZhciBfcmVzdWx0ID0gJGRlcGVuZGVuY2llc0VuZ2luZS5maW5kKGFyZy50eXBlKTtcbiAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5zb3VyY2UgPT09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gX3Jlc3VsdC5kYXRhLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdjbGFzcycpIHBhdGggPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIuLyR7cGF0aH1zLyR7X3Jlc3VsdC5kYXRhLm5hbWV9Lmh0bWxcIiA+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gJ2h0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJyArIF9yZXN1bHQuZGF0YS5wYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogPGEgaHJlZj1cIiR7cGF0aH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiA+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5qb2luKCcsICcpO1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZC5uYW1lfSgke2FyZ3N9KWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgKCR7YXJnc30pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXJldHVybnMtY29tbWVudCcsIGZ1bmN0aW9uKGpzZG9jVGFncywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdyZXR1cm5zJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdqc2RvYy1wYXJhbXMnLCBmdW5jdGlvbihqc2RvY1RhZ3MsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBqc2RvY1RhZ3MubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHRhZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAncGFyYW0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFnID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uICYmIGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcudHlwZSA9IGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmNvbW1lbnQgPSBqc2RvY1RhZ3NbaV0uY29tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5wYXJhbWV0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLm5hbWUgPSBqc2RvY1RhZ3NbaV0ucGFyYW1ldGVyTmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xpbmtUeXBlJywgZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIF9yZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmQobmFtZSk7XG4gICAgICAgICAgICBpZiAoX3Jlc3VsdCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmF3OiBuYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdjbGFzcycpIF9yZXN1bHQuZGF0YS50eXBlID0gJ2NsYXNzZSc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS5ocmVmID0gJy4vJyArIF9yZXN1bHQuZGF0YS50eXBlICsgJ3MvJyArIF9yZXN1bHQuZGF0YS5uYW1lICsgJy5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfc2VsZic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSAnaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS8nICsgX3Jlc3VsdC5kYXRhLnBhdGg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS50YXJnZXQgPSAnX2JsYW5rJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2luZGV4YWJsZVNpZ25hdHVyZScsIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IG1ldGhvZC5hcmdzLm1hcChhcmcgPT4gYCR7YXJnLm5hbWV9OiAke2FyZy50eXBlfWApLmpvaW4oJywgJyk7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9WyR7YXJnc31dYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBbJHthcmdzfV1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignb2JqZWN0JywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgve1wiLywgJ3s8YnI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCInKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyxcIi8sICcsPGJyPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiJyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC99JC8sICc8YnI+fScpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbml0KCkge1xuICAgICAgICBsZXQgcGFydGlhbHMgPSBbXG4gICAgICAgICAgICAnbWVudScsXG4gICAgICAgICAgICAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgJ3JlYWRtZScsXG4gICAgICAgICAgICAnbW9kdWxlcycsXG4gICAgICAgICAgICAnbW9kdWxlJyxcbiAgICAgICAgICAgICdjb21wb25lbnRzJyxcbiAgICAgICAgICAgICdjb21wb25lbnQnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudC1kZXRhaWwnLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAnaW5qZWN0YWJsZXMnLFxuICAgICAgICAgICAgJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgJ3BpcGVzJyxcbiAgICAgICAgICAgICdwaXBlJyxcbiAgICAgICAgICAgICdjbGFzc2VzJyxcbiAgICAgICAgICAgICdjbGFzcycsXG5cdCAgICAgICAgJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAncm91dGVzJyxcbiAgICAgICAgICAgICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAnc2VhcmNoLWlucHV0JyxcbiAgICAgICAgICAgICdsaW5rLXR5cGUnLFxuICAgICAgICAgICAgJ2Jsb2NrLW1ldGhvZCcsXG4gICAgICAgICAgICAnYmxvY2stcHJvcGVydHknLFxuICAgICAgICAgICAgJ2NvdmVyYWdlLXJlcG9ydCdcbiAgICAgICAgXSxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gcGFydGlhbHMubGVuZ3RoLFxuICAgICAgICAgICAgbG9vcCA9IChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhcnRpYWxzLycgKyBwYXJ0aWFsc1tpXSArICcuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgeyByZWplY3QoKTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwocGFydGlhbHNbaV0sIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbG9vcChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVuZGVyKG1haW5EYXRhOmFueSwgcGFnZTphbnkpIHtcbiAgICAgICAgdmFyIG8gPSBtYWluRGF0YSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICBPYmplY3QuYXNzaWduKG8sIHBhZ2UpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZih0aGF0LmNhY2hlWydwYWdlJ10pIHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGU6YW55ID0gSGFuZGxlYmFycy5jb21waWxlKHRoYXQuY2FjaGVbJ3BhZ2UnXSksXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhZ2UuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgaW5kZXggJyArIHBhZ2UubmFtZSArICcgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVbJ3BhZ2UnXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUoZGF0YSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBtYXJrZWQsIHsgUmVuZGVyZXIgfSBmcm9tICdtYXJrZWQnO1xuaW1wb3J0IGhpZ2hsaWdodGpzIGZyb20gJ2hpZ2hsaWdodC5qcyc7XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93bkVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG4gICAgICAgIHJlbmRlcmVyLmNvZGUgPSAoY29kZSwgbGFuZ3VhZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkTGFuZyA9ICEhKGxhbmd1YWdlICYmIGhpZ2hsaWdodGpzLmdldExhbmd1YWdlKGxhbmd1YWdlKSk7XG4gICAgICAgICAgICBsZXQgaGlnaGxpZ2h0ZWQgPSB2YWxpZExhbmcgPyBoaWdobGlnaHRqcy5oaWdobGlnaHQobGFuZ3VhZ2UsIGNvZGUpLnZhbHVlIDogY29kZTtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID0gaGlnaGxpZ2h0ZWQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIHJldHVybiBgPHByZT48Y29kZSBjbGFzcz1cImhsanMgJHtsYW5ndWFnZX1cIj4ke2hpZ2hsaWdodGVkfTwvY29kZT48L3ByZT5gO1xuICAgICAgICB9O1xuXG4gICAgICAgIG1hcmtlZC5zZXRPcHRpb25zKHsgcmVuZGVyZXIgfSk7XG4gICAgfVxuICAgIGdldFJlYWRtZUZpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgJy9SRUFETUUubWQnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBSRUFETUUubWQgZmlsZSByZWFkaW5nJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXJrZWQoZGF0YSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5cbmV4cG9ydCBjbGFzcyBGaWxlRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIH1cbiAgICBnZXQoZmlsZXBhdGg6U3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGZpbGVwYXRoKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgJyArIGZpbGVwYXRoICsgJyByZWFkJyk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiZXhwb3J0IGNvbnN0IENPTVBPRE9DX0RFRkFVTFRTID0ge1xuICAgIHRpdGxlOiAnQXBwbGljYXRpb24gZG9jdW1lbnRhdGlvbicsXG4gICAgYWRkaXRpb25hbEVudHJ5TmFtZTogJ0FkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbicsXG4gICAgYWRkaXRpb25hbEVudHJ5UGF0aDogJ2FkZGl0aW9uYWwtZG9jdW1lbnRhdGlvbicsXG4gICAgZm9sZGVyOiAnLi9kb2N1bWVudGF0aW9uLycsXG4gICAgcG9ydDogODA4MCxcbiAgICB0aGVtZTogJ2dpdGJvb2snLFxuICAgIGJhc2U6ICcvJyxcbiAgICBkaXNhYmxlU291cmNlQ29kZTogZmFsc2UsXG4gICAgZGlzYWJsZUdyYXBoOiBmYWxzZSxcbiAgICBkaXNhYmxlQ292ZXJhZ2U6IGZhbHNlXG59XG4iLCJpbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4uL3V0aWxzL2RlZmF1bHRzJztcblxuaW50ZXJmYWNlIFBhZ2Uge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBjb250ZXh0OiBzdHJpbmc7XG4gICAgcGF0aD86IHN0cmluZztcbiAgICBtb2R1bGU/OiBhbnk7XG4gICAgcGlwZT86IGFueTtcbiAgICBjbGFzcz86IGFueTtcbiAgICBpbnRlcmZhY2U/OiBhbnk7XG4gICAgZGlyZWN0aXZlPzogYW55O1xuICAgIGluamVjdGFibGU/OiBhbnk7XG4gICAgZmlsZXM/OiBhbnk7XG4gICAgZGF0YT86IGFueTtcbn1cblxuaW50ZXJmYWNlIElNYWluRGF0YSB7XG4gICAgb3V0cHV0OiBzdHJpbmc7XG4gICAgdGhlbWU6IHN0cmluZztcbiAgICBleHRUaGVtZTogc3RyaW5nO1xuICAgIHNlcnZlOiBib29sZWFuO1xuICAgIHBvcnQ6IG51bWJlcjtcbiAgICBvcGVuOiBib29sZWFuO1xuICAgIGFzc2V0c0ZvbGRlcjogc3RyaW5nO1xuICAgIGRvY3VtZW50YXRpb25NYWluTmFtZTogc3RyaW5nO1xuICAgIGRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb246IHN0cmluZztcbiAgICBiYXNlOiBzdHJpbmc7XG4gICAgaGlkZUdlbmVyYXRvcjogYm9vbGVhbjtcbiAgICBtb2R1bGVzOiBhbnk7XG4gICAgcmVhZG1lOiBzdHJpbmc7XG4gICAgYWRkaXRpb25hbHBhZ2VzOiBPYmplY3Q7XG4gICAgcGlwZXM6IGFueTtcbiAgICBjbGFzc2VzOiBhbnk7XG4gICAgaW50ZXJmYWNlczogYW55O1xuICAgIGNvbXBvbmVudHM6IGFueTtcbiAgICBkaXJlY3RpdmVzOiBhbnk7XG4gICAgaW5qZWN0YWJsZXM6IGFueTtcbiAgICByb3V0ZXM6IGFueTtcbiAgICB0c2NvbmZpZzogc3RyaW5nO1xuICAgIGluY2x1ZGVzOiBib29sZWFuO1xuICAgIGluY2x1ZGVzTmFtZTogc3RyaW5nO1xuICAgIGRpc2FibGVTb3VyY2VDb2RlOiBib29sZWFuO1xuICAgIGRpc2FibGVHcmFwaDogYm9vbGVhbjtcbiAgICBkaXNhYmxlQ292ZXJhZ2U6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbmZpZ3VyYXRpb24ge1xuICAgIG1haW5EYXRhOiBJTWFpbkRhdGE7XG4gICAgcGFnZXM6QXJyYXk8UGFnZT47XG4gICAgYWRkUGFnZShwYWdlOiBQYWdlKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb24gaW1wbGVtZW50cyBJQ29uZmlndXJhdGlvbiB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOkNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbigpO1xuXG4gICAgcHJpdmF0ZSBfcGFnZXM6QXJyYXk8UGFnZT4gPSBbXTtcbiAgICBwcml2YXRlIF9tYWluRGF0YTogSU1haW5EYXRhID0ge1xuICAgICAgICBvdXRwdXQ6IENPTVBPRE9DX0RFRkFVTFRTLmZvbGRlcixcbiAgICAgICAgdGhlbWU6IENPTVBPRE9DX0RFRkFVTFRTLnRoZW1lLFxuICAgICAgICBleHRUaGVtZTogJycsXG4gICAgICAgIHNlcnZlOiBmYWxzZSxcbiAgICAgICAgcG9ydDogQ09NUE9ET0NfREVGQVVMVFMucG9ydCxcbiAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIGFzc2V0c0ZvbGRlcjogJycsXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluTmFtZTogQ09NUE9ET0NfREVGQVVMVFMudGl0bGUsXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb246ICcnLFxuICAgICAgICBiYXNlOiBDT01QT0RPQ19ERUZBVUxUUy5iYXNlLFxuICAgICAgICBoaWRlR2VuZXJhdG9yOiBmYWxzZSxcbiAgICAgICAgbW9kdWxlczogW10sXG4gICAgICAgIHJlYWRtZTogJycsXG4gICAgICAgIGFkZGl0aW9uYWxwYWdlczoge30sXG4gICAgICAgIHBpcGVzOiBbXSxcbiAgICAgICAgY2xhc3NlczogW10sXG4gICAgICAgIGludGVyZmFjZXM6IFtdLFxuICAgICAgICBjb21wb25lbnRzOiBbXSxcbiAgICAgICAgZGlyZWN0aXZlczogW10sXG4gICAgICAgIGluamVjdGFibGVzOiBbXSxcbiAgICAgICAgcm91dGVzOiBbXSxcbiAgICAgICAgdHNjb25maWc6ICcnLFxuICAgICAgICBpbmNsdWRlczogZmFsc2UsXG4gICAgICAgIGRpc2FibGVTb3VyY2VDb2RlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlU291cmNlQ29kZSxcbiAgICAgICAgZGlzYWJsZUdyYXBoOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlR3JhcGgsXG4gICAgICAgIGRpc2FibGVDb3ZlcmFnZTogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZUNvdmVyYWdlXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZihDb25maWd1cmF0aW9uLl9pbnN0YW5jZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSBpbnN0ZWFkIG9mIG5ldy4nKTtcbiAgICAgICAgfVxuICAgICAgICBDb25maWd1cmF0aW9uLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOkNvbmZpZ3VyYXRpb25cbiAgICB7XG4gICAgICAgIHJldHVybiBDb25maWd1cmF0aW9uLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBhZGRQYWdlKHBhZ2U6IFBhZ2UpIHtcbiAgICAgICAgdGhpcy5fcGFnZXMucHVzaChwYWdlKTtcbiAgICB9XG5cbiAgICBnZXQgcGFnZXMoKTpBcnJheTxQYWdlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWdlcztcbiAgICB9XG4gICAgc2V0IHBhZ2VzKHBhZ2VzOkFycmF5PFBhZ2U+KSB7XG4gICAgICAgIHRoaXMuX3BhZ2VzID0gW107XG4gICAgfVxuXG4gICAgZ2V0IG1haW5EYXRhKCk6SU1haW5EYXRhIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21haW5EYXRhO1xuICAgIH1cbiAgICBzZXQgbWFpbkRhdGEoZGF0YTpJTWFpbkRhdGEpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLl9tYWluRGF0YSwgZGF0YSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc0dsb2JhbCgpIHtcbiAgICB2YXIgYmluUGF0aCxcbiAgICAgICAgZ2xvYmFsQmluUGF0aCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGJpblBhdGgpIHJldHVybiBiaW5QYXRoXG5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGhuYW1lcyA9IHByb2Nlc3MuZW52LlBBVEguc3BsaXQocGF0aC5kZWxpbWl0ZXIpXG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IHBhdGhuYW1lcy5sZW5ndGhcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGguYmFzZW5hbWUocGF0aG5hbWVzW2ldKSA9PT0gJ25wbScgfHwgcGF0aC5iYXNlbmFtZShwYXRobmFtZXNbaV0pID09PSAnbm9kZWpzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmluUGF0aCA9IHBhdGhuYW1lc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmluUGF0aCA9IHBhdGguZGlybmFtZShwcm9jZXNzLmV4ZWNQYXRoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYmluUGF0aFxuICAgICAgICB9LFxuICAgICAgICBzdHJpcFRyYWlsaW5nU2VwID0gZnVuY3Rpb24odGhlUGF0aCkge1xuICAgICAgICAgICAgaWYgKHRoZVBhdGhbdGhlUGF0aC5sZW5ndGggLSAxXSA9PT0gcGF0aC5zZXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhlUGF0aC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhlUGF0aDtcbiAgICAgICAgfSxcbiAgICAgICAgcGF0aElzSW5zaWRlID0gZnVuY3Rpb24odGhlUGF0aCwgcG90ZW50aWFsUGFyZW50KSB7XG4gICAgICAgICAgICAvLyBGb3IgaW5zaWRlLWRpcmVjdG9yeSBjaGVja2luZywgd2Ugd2FudCB0byBhbGxvdyB0cmFpbGluZyBzbGFzaGVzLCBzbyBub3JtYWxpemUuXG4gICAgICAgICAgICB0aGVQYXRoID0gc3RyaXBUcmFpbGluZ1NlcCh0aGVQYXRoKTtcbiAgICAgICAgICAgIHBvdGVudGlhbFBhcmVudCA9IHN0cmlwVHJhaWxpbmdTZXAocG90ZW50aWFsUGFyZW50KTtcblxuICAgICAgICAgICAgLy8gTm9kZSB0cmVhdHMgb25seSBXaW5kb3dzIGFzIGNhc2UtaW5zZW5zaXRpdmUgaW4gaXRzIHBhdGggbW9kdWxlOyB3ZSBmb2xsb3cgdGhvc2UgY29udmVudGlvbnMuXG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgICAgICAgICAgdGhlUGF0aCA9IHRoZVBhdGgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBwb3RlbnRpYWxQYXJlbnQgPSBwb3RlbnRpYWxQYXJlbnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoZVBhdGgubGFzdEluZGV4T2YocG90ZW50aWFsUGFyZW50LCAwKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgdGhlUGF0aFtwb3RlbnRpYWxQYXJlbnQubGVuZ3RoXSA9PT0gcGF0aC5zZXAgfHxcbiAgICAgICAgICAgICAgICAgICAgdGhlUGF0aFtwb3RlbnRpYWxQYXJlbnQubGVuZ3RoXSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgaXNQYXRoSW5zaWRlID0gZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgYSA9IHBhdGgucmVzb2x2ZShhKTtcbiAgICAgICAgICAgIGIgPSBwYXRoLnJlc29sdmUoYik7XG5cbiAgICAgICAgICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGF0aElzSW5zaWRlKGEsIGIpO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGlzUGF0aEluc2lkZShwcm9jZXNzLmFyZ3ZbMV0gfHwgJycsIGdsb2JhbEJpblBhdGgoKSB8fCAnJylcbn07XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgU2hlbGxqcyBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IGlzR2xvYmFsIGZyb20gJy4uLy4uL3V0aWxzL2dsb2JhbC5wYXRoJztcblxuZXhwb3J0IGNsYXNzIE5nZEVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG4gICAgcmVuZGVyR3JhcGgoZmlsZXBhdGg6U3RyaW5nLCBvdXRwdXRwYXRoOiBTdHJpbmcsIHR5cGU6IFN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgIGxldCBuZ2RQYXRoID0gKGlzR2xvYmFsKCkpID8gX19kaXJuYW1lICsgJy8uLi9ub2RlX21vZHVsZXMvLmJpbi9uZ2QnIDogX19kaXJuYW1lICsgJy8uLi8uLi8uYmluL25nZCc7XG4gICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5NT0RFICYmIHByb2Nlc3MuZW52Lk1PREUgPT09ICdURVNUSU5HJykge1xuICAgICAgICAgICAgICAgbmdkUGF0aCA9IF9fZGlybmFtZSArICcvLi4vbm9kZV9tb2R1bGVzLy5iaW4vbmdkJztcbiAgICAgICAgICAgfVxuICAgICAgICAgICBpZiAoLyAvZy50ZXN0KG5nZFBhdGgpKSB7XG4gICAgICAgICAgICAgICBuZ2RQYXRoID0gbmdkUGF0aC5yZXBsYWNlKC8gL2csICdeICcpO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIGxldCBmaW5hbFBhdGggPSBwYXRoLnJlc29sdmUobmdkUGF0aCkgKyAnIC0nICsgdHlwZSArICcgJyArIGZpbGVwYXRoICsgJyAtZCAnICsgb3V0cHV0cGF0aCArICcgLXMgLXQgc3ZnJ1xuICAgICAgICAgICBTaGVsbGpzLmV4ZWMoZmluYWxQYXRoLCB7XG4gICAgICAgICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgICAgICAgfSwgZnVuY3Rpb24oY29kZSwgc3Rkb3V0LCBzdGRlcnIpIHtcbiAgICAgICAgICAgICAgIGlmKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHJlamVjdChzdGRlcnIpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbmZpZ3VyYXRpb24nO1xuXG5jb25zdCBsdW5yOiBhbnkgPSByZXF1aXJlKCdsdW5yJyksXG4gICAgICBjaGVlcmlvOiBhbnkgPSByZXF1aXJlKCdjaGVlcmlvJyksXG4gICAgICBFbnRpdGllczphbnkgPSByZXF1aXJlKCdodG1sLWVudGl0aWVzJykuQWxsSHRtbEVudGl0aWVzLFxuICAgICAgJGNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCksXG4gICAgICBIdG1sID0gbmV3IEVudGl0aWVzKCk7XG5cbmV4cG9ydCBjbGFzcyBTZWFyY2hFbmdpbmUge1xuICAgIHNlYXJjaEluZGV4OiBhbnk7XG4gICAgZG9jdW1lbnRzU3RvcmU6IE9iamVjdCA9IHt9O1xuICAgIGluZGV4U2l6ZTogbnVtYmVyO1xuICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICBwcml2YXRlIGdldFNlYXJjaEluZGV4KCkge1xuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoSW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5kZXggPSBsdW5yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZigndXJsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZCgndGl0bGUnLCB7IGJvb3N0OiAxMCB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCdib2R5Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hJbmRleDtcbiAgICB9XG4gICAgaW5kZXhQYWdlKHBhZ2UpIHtcbiAgICAgICAgdmFyIHRleHQsXG4gICAgICAgICAgICAkID0gY2hlZXJpby5sb2FkKHBhZ2UucmF3RGF0YSk7XG5cbiAgICAgICAgdGV4dCA9ICQoJy5jb250ZW50JykuaHRtbCgpO1xuICAgICAgICB0ZXh0ID0gSHRtbC5kZWNvZGUodGV4dCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg8KFtePl0rKT4pL2lnLCAnJyk7XG5cbiAgICAgICAgcGFnZS51cmwgPSBwYWdlLnVybC5yZXBsYWNlKCRjb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCwgJycpO1xuXG4gICAgICAgIHZhciBkb2MgPSB7XG4gICAgICAgICAgICB1cmw6IHBhZ2UudXJsLFxuICAgICAgICAgICAgdGl0bGU6IHBhZ2UuaW5mb3MuY29udGV4dCArICcgLSAnICsgcGFnZS5pbmZvcy5uYW1lLFxuICAgICAgICAgICAgYm9keTogdGV4dFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZG9jdW1lbnRzU3RvcmVbZG9jLnVybF0gPSBkb2M7XG5cbiAgICAgICAgdGhpcy5nZXRTZWFyY2hJbmRleCgpLmFkZChkb2MpO1xuICAgIH1cbiAgICBnZW5lcmF0ZVNlYXJjaEluZGV4SnNvbihvdXRwdXRGb2xkZXIpIHtcbiAgICAgICAgZnMud3JpdGVKc29uKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBvdXRwdXRGb2xkZXIgKyBwYXRoLnNlcCArICdzZWFyY2hfaW5kZXguanNvbicpLCB7XG4gICAgICAgICAgICBpbmRleDogdGhpcy5nZXRTZWFyY2hJbmRleCgpLFxuICAgICAgICAgICAgc3RvcmU6IHRoaXMuZG9jdW1lbnRzU3RvcmVcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgc2VhcmNoIGluZGV4IGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSBcInR5cGVzY3JpcHRcIjtcbmNvbnN0IHRzYW55ID0gdHMgYXMgYW55O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi8yLjEvc3JjL2NvbXBpbGVyL3V0aWxpdGllcy50cyNMMTUwN1xuZXhwb3J0IGZ1bmN0aW9uIGdldEpTRG9jcyhub2RlOiB0cy5Ob2RlKSB7XG4gIHJldHVybiB0c2FueS5nZXRKU0RvY3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcblxuY29uc3QgY2FycmlhZ2VSZXR1cm5MaW5lRmVlZCA9ICdcXHJcXG4nO1xuY29uc3QgbGluZUZlZWQgPSAnXFxuJztcblxuLy8gZ2V0IGRlZmF1bHQgbmV3IGxpbmUgYnJlYWtcbmV4cG9ydCBmdW5jdGlvbiBnZXROZXdMaW5lQ2hhcmFjdGVyKG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyk6IHN0cmluZyB7XG4gICAgaWYgKG9wdGlvbnMubmV3TGluZSA9PT0gdHMuTmV3TGluZUtpbmQuQ2FycmlhZ2VSZXR1cm5MaW5lRmVlZCkge1xuICAgICAgICByZXR1cm4gY2FycmlhZ2VSZXR1cm5MaW5lRmVlZDtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucy5uZXdMaW5lID09PSB0cy5OZXdMaW5lS2luZC5MaW5lRmVlZCkge1xuICAgICAgICByZXR1cm4gbGluZUZlZWQ7XG4gICAgfVxuICAgIHJldHVybiBjYXJyaWFnZVJldHVybkxpbmVGZWVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0SW5kZW50KHN0ciwgY291bnQsIGluZGVudD8pOiBzdHJpbmcge1xuICAgIGxldCBzdHJpcEluZGVudCA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKC9eWyBcXHRdKig/PVxcUykvZ20pO1xuXG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiB1c2Ugc3ByZWFkIG9wZXJhdG9yIHdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgNlxuICAgICAgICBjb25zdCBpbmRlbnQgPSBNYXRoLm1pbi5hcHBseShNYXRoLCBtYXRjaC5tYXAoeCA9PiB4Lmxlbmd0aCkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgXlsgXFxcXHRdeyR7aW5kZW50fX1gLCAnZ20nKTtcblxuICAgICAgICByZXR1cm4gaW5kZW50ID4gMCA/IHN0ci5yZXBsYWNlKHJlLCAnJykgOiBzdHI7XG4gICAgfSxcbiAgICAgICAgcmVwZWF0aW5nID0gZnVuY3Rpb24obiwgc3RyKSB7XG4gICAgICAgIHN0ciA9IHN0ciA9PT0gdW5kZWZpbmVkID8gJyAnIDogc3RyO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobiA8IDAgfHwgIU51bWJlci5pc0Zpbml0ZShuKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBwb3NpdGl2ZSBmaW5pdGUgbnVtYmVyLCBnb3QgXFxgJHtufVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJldCA9ICcnO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xuICAgICAgICAgICAgICAgIHJldCArPSBzdHI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0ciArPSBzdHI7XG4gICAgICAgIH0gd2hpbGUgKChuID4+PSAxKSk7XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIGluZGVudFN0cmluZyA9IGZ1bmN0aW9uKHN0ciwgY291bnQsIGluZGVudCkge1xuICAgICAgICBpbmRlbnQgPSBpbmRlbnQgPT09IHVuZGVmaW5lZCA/ICcgJyA6IGluZGVudDtcbiAgICAgICAgY291bnQgPSBjb3VudCA9PT0gdW5kZWZpbmVkID8gMSA6IGNvdW50O1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGNvdW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBcXGBudW1iZXJcXGAsIGdvdCBcXGAke3R5cGVvZiBjb3VudH1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5kZW50XFxgIHRvIGJlIGEgXFxgc3RyaW5nXFxgLCBnb3QgXFxgJHt0eXBlb2YgaW5kZW50fVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZW50ID0gY291bnQgPiAxID8gcmVwZWF0aW5nKGNvdW50LCBpbmRlbnQpIDogaW5kZW50O1xuXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXig/IVxccyokKS9tZywgaW5kZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5kZW50U3RyaW5nKHN0cmlwSW5kZW50KHN0ciksIGNvdW50IHx8IDAsIGluZGVudCk7XG59XG5cbi8vIENyZWF0ZSBhIGNvbXBpbGVySG9zdCBvYmplY3QgdG8gYWxsb3cgdGhlIGNvbXBpbGVyIHRvIHJlYWQgYW5kIHdyaXRlIGZpbGVzXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnM6IGFueSk6IHRzLkNvbXBpbGVySG9zdCB7XG5cbiAgICBjb25zdCBpbnB1dEZpbGVOYW1lID0gdHJhbnNwaWxlT3B0aW9ucy5maWxlTmFtZSB8fCAodHJhbnNwaWxlT3B0aW9ucy5qc3ggPyAnbW9kdWxlLnRzeCcgOiAnbW9kdWxlLnRzJyk7XG5cbiAgICBjb25zdCBjb21waWxlckhvc3Q6IHRzLkNvbXBpbGVySG9zdCA9IHtcbiAgICAgICAgZ2V0U291cmNlRmlsZTogKGZpbGVOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlsZU5hbWUubGFzdEluZGV4T2YoJy50cycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ2xpYi5kLnRzJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwYXRoLmlzQWJzb2x1dGUoZmlsZU5hbWUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IHBhdGguam9pbih0cmFuc3BpbGVPcHRpb25zLnRzY29uZmlnRGlyZWN0b3J5LCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGxpYlNvdXJjZSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbGliU291cmNlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVOYW1lKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhlLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoZmlsZU5hbWUsIGxpYlNvdXJjZSwgdHJhbnNwaWxlT3B0aW9ucy50YXJnZXQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRlRmlsZTogKG5hbWUsIHRleHQpID0+IHt9LFxuICAgICAgICBnZXREZWZhdWx0TGliRmlsZU5hbWU6ICgpID0+ICdsaWIuZC50cycsXG4gICAgICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXM6ICgpID0+IGZhbHNlLFxuICAgICAgICBnZXRDYW5vbmljYWxGaWxlTmFtZTogZmlsZU5hbWUgPT4gZmlsZU5hbWUsXG4gICAgICAgIGdldEN1cnJlbnREaXJlY3Rvcnk6ICgpID0+ICcnLFxuICAgICAgICBnZXROZXdMaW5lOiAoKSA9PiAnXFxuJyxcbiAgICAgICAgZmlsZUV4aXN0czogKGZpbGVOYW1lKTogYm9vbGVhbiA9PiBmaWxlTmFtZSA9PT0gaW5wdXRGaWxlTmFtZSxcbiAgICAgICAgcmVhZEZpbGU6ICgpID0+ICcnLFxuICAgICAgICBkaXJlY3RvcnlFeGlzdHM6ICgpID0+IHRydWUsXG4gICAgICAgIGdldERpcmVjdG9yaWVzOiAoKSA9PiBbXVxuICAgIH07XG4gICAgcmV0dXJuIGNvbXBpbGVySG9zdDtcbn1cbiIsImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5cbmV4cG9ydCBsZXQgUm91dGVyUGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJvdXRlcyA9IFtdLFxuICAgICAgICBtb2R1bGVzID0gW10sXG4gICAgICAgIG1vZHVsZXNUcmVlLFxuICAgICAgICByb290TW9kdWxlLFxuICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcyA9IFtdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWRkUm91dGU6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICByb3V0ZXMucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICByb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKHJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBhZGRNb2R1bGVXaXRoUm91dGVzOiBmdW5jdGlvbihtb2R1bGVOYW1lLCBtb2R1bGVJbXBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtb2R1bGVOYW1lLFxuICAgICAgICAgICAgICAgIGltcG9ydHNOb2RlOiBtb2R1bGVJbXBvcnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aChtb2R1bGVzV2l0aFJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBhZGRNb2R1bGU6IGZ1bmN0aW9uKG1vZHVsZU5hbWU6IHN0cmluZywgbW9kdWxlSW1wb3J0cykge1xuICAgICAgICAgICAgbW9kdWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtb2R1bGVOYW1lLFxuICAgICAgICAgICAgICAgIGltcG9ydHNOb2RlOiBtb2R1bGVJbXBvcnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKG1vZHVsZXMsIF8uaXNFcXVhbCksIFsnbmFtZSddKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0Um9vdE1vZHVsZTogZnVuY3Rpb24obW9kdWxlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBtb2R1bGU7XG4gICAgICAgIH0sXG4gICAgICAgIHByaW50Um91dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICB9LFxuICAgICAgICBoYXNSb3V0ZXJNb2R1bGVJbkltcG9ydHM6IGZ1bmN0aW9uKGltcG9ydHMpIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBpbXBvcnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcG9ydHNbaV0ubmFtZS5pbmRleE9mKCdSb3V0ZXJNb2R1bGUuZm9yQ2hpbGQnKSAhPT0gLTEgfHxcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JSb290JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgbGlua01vZHVsZXNBbmRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9zY2FuIGVhY2ggbW9kdWxlIGltcG9ydHMgQVNUIGZvciBlYWNoIHJvdXRlcywgYW5kIGxpbmsgcm91dGVzIHdpdGggbW9kdWxlXG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbW9kdWxlc1dpdGhSb3V0ZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2gobW9kdWxlc1dpdGhSb3V0ZXNbaV0uaW1wb3J0c05vZGUsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9maW5kIGVsZW1lbnQgd2l0aCBhcmd1bWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZWxlbWVudC5hcmd1bWVudHMsIGZ1bmN0aW9uKGFyZ3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJvdXRlcywgZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJndW1lbnQudGV4dCAmJiByb3V0ZS5uYW1lID09PSBhcmd1bWVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5tb2R1bGUgPSBtb2R1bGVzV2l0aFJvdXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnN0cnVjdFJvdXRlc1RyZWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnY29uc3RydWN0Um91dGVzVHJlZScpO1xuICAgICAgICAgICAgLy8gcm91dGVzW10gY29udGFpbnMgcm91dGVzIHdpdGggbW9kdWxlIGxpbmtcbiAgICAgICAgICAgIC8vIG1vZHVsZXNUcmVlIGNvbnRhaW5zIG1vZHVsZXMgdHJlZVxuICAgICAgICAgICAgLy8gbWFrZSBhIGZpbmFsIHJvdXRlcyB0cmVlIHdpdGggdGhhdFxuICAgICAgICAgICAgbGV0IGNsZWFuTW9kdWxlc1RyZWUgPSBfLmNsb25lRGVlcChtb2R1bGVzVHJlZSksXG4gICAgICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFycltpXS5pbXBvcnRzTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhcnJbaV0uaW1wb3J0c05vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhcnJbaV0ucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJyW2ldLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIoYXJyW2ldLmNoaWxkcmVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIoY2xlYW5Nb2R1bGVzVHJlZSk7XG4gICAgICAgICAgICAvL2ZzLm91dHB1dEpzb24oJy4vbW9kdWxlcy5qc29uJywgY2xlYW5Nb2R1bGVzVHJlZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW5Nb2R1bGVzVHJlZSBsaWdodDogJywgdXRpbC5pbnNwZWN0KGNsZWFuTW9kdWxlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIHZhciByb3V0ZXNUcmVlID0ge1xuICAgICAgICAgICAgICAgIHRhZzogJzxyb290PicsXG4gICAgICAgICAgICAgICAga2luZDogJ25nTW9kdWxlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZSA9IGZ1bmN0aW9uKG1vZHVsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5maW5kKHJvdXRlcywgeydtb2R1bGUnOiBtb2R1bGVOYW1lfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBsb29wTW9kdWxlc1BhcnNlciA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobm9kZS5jaGlsZHJlbltpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5yb3V0ZXMgPSBKU09OLnBhcnNlKHJvdXRlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJvdXRlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5raW5kID0gJ25nTW9kdWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlc1RyZWUuY2hpbGRyZW4ucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5baV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BNb2R1bGVzUGFyc2VyKG5vZGUuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9vcE1vZHVsZXNQYXJzZXIoXy5maW5kKGNsZWFuTW9kdWxlc1RyZWUsIHsnbmFtZSc6IHJvb3RNb2R1bGV9KSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyb3V0ZXNUcmVlOiAnLCByb3V0ZXNUcmVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcblxuICAgICAgICAgICAgLy9mcy5vdXRwdXRKc29uKCcuL3JvdXRlcy10cmVlLmpzb24nLCByb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgdmFyIGNsZWFuZWRSb3V0ZXNUcmVlO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5Sb3V0ZXNUcmVlID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHJvdXRlLmNoaWxkcmVuW2ldLnJvdXRlcztcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocm91dGVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhbmVkUm91dGVzVHJlZSA9IGNsZWFuUm91dGVzVHJlZShyb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsZWFuZWRSb3V0ZXNUcmVlOiAnLCB1dGlsLmluc3BlY3QoY2xlYW5lZFJvdXRlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29uc3RydWN0TW9kdWxlc1RyZWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IGdldE5lc3RlZENoaWxkcmVuID0gZnVuY3Rpb24oYXJyLCBwYXJlbnQ/KSB7XG4gICAgICAgICAgICAgICAgdmFyIG91dCA9IFtdXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0ucGFyZW50ID09PSBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGdldE5lc3RlZENoaWxkcmVuKGFyciwgYXJyW2ldLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJbaV0uY2hpbGRyZW4gPSBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2goYXJyW2ldKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1NjYW4gZWFjaCBtb2R1bGUgYW5kIGFkZCBwYXJlbnQgcHJvcGVydHlcbiAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihmaXJzdExvb3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goZmlyc3RMb29wTW9kdWxlLmltcG9ydHNOb2RlLCBmdW5jdGlvbihpbXBvcnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihtb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBtb2R1bGUubmFtZSA9PT0gaW1wb3J0Tm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlLnBhcmVudCA9IGZpcnN0TG9vcE1vZHVsZS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2R1bGVzVHJlZSA9IGdldE5lc3RlZENoaWxkcmVuKG1vZHVsZXMpO1xuICAgICAgICB9XG4gICAgfVxufSkoKTtcbiIsImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5sZXQgY29kZTogc3RyaW5nW10gPSBbXTtcblxuZXhwb3J0IGxldCBnZW4gPSAoZnVuY3Rpb24gKCkge1xuICAgIGxldCB0bXA6IHR5cGVvZiBjb2RlID0gW107XG5cbiAgICByZXR1cm4gKHRva2VuID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgISB0b2tlbicpO1xuICAgICAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG9rZW4gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgXFxuJyk7XG4gICAgICAgICAgICBjb2RlLnB1c2godG1wLmpvaW4oJycpKTtcbiAgICAgICAgICAgIHRtcCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29kZS5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29kZTtcbiAgICB9XG59ICgpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlKG5vZGU6IGFueSkge1xuICAgIGNvZGUgPSBbXTtcbiAgICB2aXNpdEFuZFJlY29nbml6ZShub2RlKTtcbiAgICByZXR1cm4gY29kZS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gdmlzaXRBbmRSZWNvZ25pemUobm9kZTogYW55LCBkZXB0aCA9IDApIHtcbiAgICByZWNvZ25pemUobm9kZSk7XG4gICAgZGVwdGgrKztcbiAgICBub2RlLmdldENoaWxkcmVuKCkuZm9yRWFjaChjID0+IHZpc2l0QW5kUmVjb2duaXplKGMsIGRlcHRoKSk7XG59XG5cbmZ1bmN0aW9uIHJlY29nbml6ZShub2RlOiBhbnkpIHtcblxuICAgIC8vY29uc29sZS5sb2coJ3JlY29nbml6aW5nLi4uJywgdHMuU3ludGF4S2luZFtub2RlLmtpbmQrJyddKTtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GaXJzdExpdGVyYWxUb2tlbjpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ltcG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZyb21LZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdmcm9tJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBnZW4oJ2V4cG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjbGFzcycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRoaXNLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0aGlzJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignY29uc3RydWN0b3InKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GYWxzZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ZhbHNlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0cnVlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdudWxsJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXRUb2tlbjpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgZ2VuKCcrJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW46XG4gICAgICAgICAgICBnZW4oJyA9PiAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKCcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydENsYXVzZTpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZ2VuKCd7Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmxvY2s6XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFjZVRva2VuOlxuICAgICAgICAgICAgZ2VuKCd9Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCdbJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCddJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2VtaWNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJzsnKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbW1hVG9rZW46XG4gICAgICAgICAgICBnZW4oJywnKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db2xvblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBnZW4oJzonKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb3RUb2tlbjpcbiAgICAgICAgICAgIGdlbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb1N0YXRlbWVudDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRGVjb3JhdG9yOlxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudDpcbiAgICAgICAgICAgIGdlbignID0gJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0UHVuY3R1YXRpb246XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHJpdmF0ZScpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3B1YmxpYycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIF90cyBmcm9tICcuLi8uLi91dGlscy90cy1pbnRlcm5hbCc7XG5pbXBvcnQgbWFya2VkIGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgeyBnZXROZXdMaW5lQ2hhcmFjdGVyLCBjb21waWxlckhvc3QsIGQsIGRldGVjdEluZGVudCB9IGZyb20gJy4uLy4uL3V0aWxpdGllcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgUm91dGVyUGFyc2VyIH0gZnJvbSAnLi4vLi4vdXRpbHMvcm91dGVyLnBhcnNlcic7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gJy4vY29kZWdlbic7XG5cbmludGVyZmFjZSBOb2RlT2JqZWN0IHtcbiAgICBraW5kOiBOdW1iZXI7XG4gICAgcG9zOiBOdW1iZXI7XG4gICAgZW5kOiBOdW1iZXI7XG4gICAgdGV4dDogc3RyaW5nO1xuICAgIGluaXRpYWxpemVyOiBOb2RlT2JqZWN0LFxuICAgIG5hbWU/OiB7IHRleHQ6IHN0cmluZyB9O1xuICAgIGV4cHJlc3Npb24/OiBOb2RlT2JqZWN0O1xuICAgIGVsZW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIGFyZ3VtZW50cz86IE5vZGVPYmplY3RbXTtcbiAgICBwcm9wZXJ0aWVzPzogYW55W107XG4gICAgcGFyc2VyQ29udGV4dEZsYWdzPzogTnVtYmVyO1xuICAgIGVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4/OiBOb2RlT2JqZWN0W107XG4gICAgcGFyYW1ldGVycz86IE5vZGVPYmplY3RbXTtcbiAgICBDb21wb25lbnQ/OiBTdHJpbmc7XG4gICAgYm9keT86IHtcbiAgICAgICAgcG9zOiBOdW1iZXI7XG4gICAgICAgIGVuZDogTnVtYmVyO1xuICAgICAgICBzdGF0ZW1lbnRzOiBOb2RlT2JqZWN0W107XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgRGVwcyB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBsYWJlbD86IHN0cmluZztcbiAgICBmaWxlPzogc3RyaW5nO1xuICAgIHNvdXJjZUNvZGU/OiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cbiAgICAvL0NvbXBvbmVudFxuXG4gICAgYW5pbWF0aW9ucz86IHN0cmluZ1tdOyAvLyBUT0RPXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogc3RyaW5nO1xuICAgIGVuY2Fwc3VsYXRpb24/OiBzdHJpbmc7XG4gICAgZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPXG4gICAgZXhwb3J0QXM/OiBzdHJpbmc7XG4gICAgaG9zdD86IHN0cmluZztcbiAgICBpbnB1dHM/OiBzdHJpbmdbXTtcbiAgICBpbnRlcnBvbGF0aW9uPzogc3RyaW5nOyAvLyBUT0RPXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmc7XG4gICAgb3V0cHV0cz86IHN0cmluZ1tdO1xuICAgIHF1ZXJpZXM/OiBEZXBzW107IC8vIFRPRE9cbiAgICBzZWxlY3Rvcj86IHN0cmluZztcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXTtcbiAgICBzdHlsZXM/OiBzdHJpbmdbXTtcbiAgICB0ZW1wbGF0ZT86IHN0cmluZztcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZ1tdO1xuICAgIHZpZXdQcm92aWRlcnM/OiBzdHJpbmdbXTtcblxuICAgIGlucHV0c0NsYXNzPzogT2JqZWN0W107XG5cbiAgICAvL2NvbW1vblxuICAgIHByb3ZpZGVycz86IERlcHNbXTtcblxuICAgIC8vbW9kdWxlXG4gICAgZGVjbGFyYXRpb25zPzogRGVwc1tdO1xuICAgIGJvb3RzdHJhcD86IERlcHNbXTtcblxuICAgIGltcG9ydHM/OiBEZXBzW107XG4gICAgZXhwb3J0cz86IERlcHNbXTtcbn1cblxuaW50ZXJmYWNlIFN5bWJvbERlcHMge1xuICAgIGZ1bGw6IHN0cmluZztcbiAgICBhbGlhczogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzIHtcblxuICAgIHByaXZhdGUgZmlsZXM6IHN0cmluZ1tdO1xuICAgIHByaXZhdGUgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgICBwcml2YXRlIHByb2dyYW1Db21wb25lbnQ6IHRzLlByb2dyYW07XG4gICAgcHJpdmF0ZSB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXI7XG4gICAgcHJpdmF0ZSB0eXBlQ2hlY2tlckNvbXBvbmVudDogdHMuVHlwZUNoZWNrZXI7XG4gICAgcHJpdmF0ZSBlbmdpbmU6IGFueTtcbiAgICBwcml2YXRlIF9fY2FjaGU6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgX19uc01vZHVsZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSB1bmtub3duID0gJz8/Pyc7XG5cbiAgICBjb25zdHJ1Y3RvcihmaWxlczogc3RyaW5nW10sIG9wdGlvbnM6IGFueSkge1xuICAgICAgICB0aGlzLmZpbGVzID0gZmlsZXM7XG4gICAgICAgIGNvbnN0IHRyYW5zcGlsZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRzLlNjcmlwdFRhcmdldC5FUzUsXG4gICAgICAgICAgICBtb2R1bGU6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXG4gICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogb3B0aW9ucy50c2NvbmZpZ0RpcmVjdG9yeVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHRoaXMuZmlsZXMsIHRyYW5zcGlsZU9wdGlvbnMsIGNvbXBpbGVySG9zdCh0cmFuc3BpbGVPcHRpb25zKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBicmVha0xpbmVzKHRleHQpIHtcbiAgICAgICAgdmFyIF90ID0gdGV4dDtcbiAgICAgICAgaWYgKHR5cGVvZiBfdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIF90ID0gX3QucmVwbGFjZSgvKFxcbikvZ20sICc8YnI+Jyk7XG4gICAgICAgICAgICBfdCA9IF90LnJlcGxhY2UoLyg8YnI+KSQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Q7XG4gICAgfVxuXG4gICAgZ2V0RGVwZW5kZW5jaWVzKCkge1xuICAgICAgICBsZXQgZGVwczogT2JqZWN0ID0ge1xuICAgICAgICAgICAgJ21vZHVsZXMnOiBbXSxcbiAgICAgICAgICAgICdjb21wb25lbnRzJzogW10sXG4gICAgICAgICAgICAnaW5qZWN0YWJsZXMnOiBbXSxcbiAgICAgICAgICAgICdwaXBlcyc6IFtdLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnOiBbXSxcbiAgICAgICAgICAgICdyb3V0ZXMnOiBbXSxcbiAgICAgICAgICAgICdjbGFzc2VzJzogW10sXG4gICAgICAgICAgICAnaW50ZXJmYWNlcyc6IFtdXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzb3VyY2VGaWxlcyA9IHRoaXMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpIHx8IFtdO1xuXG4gICAgICAgIHNvdXJjZUZpbGVzLm1hcCgoZmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgZmlsZVBhdGggPSBmaWxlLmZpbGVOYW1lO1xuXG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT0gJy50cycpIHtcblxuICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aC5sYXN0SW5kZXhPZignLmQudHMnKSA9PT0gLTEgJiYgZmlsZVBhdGgubGFzdEluZGV4T2YoJ3NwZWMudHMnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhcnNpbmcnLCBmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U291cmNlRmlsZURlY29yYXRvcnMoZmlsZSwgZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlLCBmaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGVwcztcblxuICAgICAgICB9KTtcblxuICAgICAgICAvL1JvdXRlclBhcnNlci5saW5rTW9kdWxlc0FuZFJvdXRlcygpO1xuICAgICAgICAvL1JvdXRlclBhcnNlci5jb25zdHJ1Y3RNb2R1bGVzVHJlZSgpO1xuICAgICAgICAvL1JvdXRlclBhcnNlci5jb25zdHJ1Y3RSb3V0ZXNUcmVlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRlcHM7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGdldFNvdXJjZUZpbGVEZWNvcmF0b3JzKHNyY0ZpbGU6IHRzLlNvdXJjZUZpbGUsIG91dHB1dFN5bWJvbHM6IE9iamVjdCk6IHZvaWQge1xuXG4gICAgICAgIGxldCBjbGVhbmVyID0gKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICBsZXQgZmlsZSA9IHNyY0ZpbGUuZmlsZU5hbWUucmVwbGFjZShjbGVhbmVyLCAnJyk7XG5cbiAgICAgICAgdGhpcy5wcm9ncmFtQ29tcG9uZW50ID0gdHMuY3JlYXRlUHJvZ3JhbShbZmlsZV0sIHt9KTtcbiAgICAgICAgbGV0IHNvdXJjZUZpbGUgPSB0aGlzLnByb2dyYW1Db21wb25lbnQuZ2V0U291cmNlRmlsZShmaWxlKTtcbiAgICAgICAgdGhpcy50eXBlQ2hlY2tlckNvbXBvbmVudCA9IHRoaXMucHJvZ3JhbUNvbXBvbmVudC5nZXRUeXBlQ2hlY2tlcih0cnVlKTtcblxuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQoc3JjRmlsZSwgKG5vZGU6IHRzLk5vZGUpID0+IHtcblxuICAgICAgICAgICAgbGV0IGRlcHM6IERlcHMgPSA8RGVwcz57fTtcbiAgICAgICAgICAgIGlmIChub2RlLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmlzaXROb2RlID0gKHZpc2l0ZWROb2RlLCBpbmRleCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXRhZGF0YSA9IG5vZGUuZGVjb3JhdG9ycy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLmZpbmRQcm9wcyh2aXNpdGVkTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q29tcG9uZW50SU8oZmlsZSwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNNb2R1bGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IHRoaXMuZ2V0TW9kdWxlRGVjbGF0aW9ucyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0czogdGhpcy5nZXRNb2R1bGVJbXBvcnRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRzOiB0aGlzLmdldE1vZHVsZUV4cG9ydHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvb3RzdHJhcDogdGhpcy5nZXRNb2R1bGVCb290c3RyYXAocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdtb2R1bGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJvdXRlclBhcnNlci5oYXNSb3V0ZXJNb2R1bGVJbkltcG9ydHMoZGVwcy5pbXBvcnRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5hZGRNb2R1bGVXaXRoUm91dGVzKG5hbWUsIHRoaXMuZ2V0TW9kdWxlSW1wb3J0c1Jhdyhwcm9wcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZE1vZHVsZShuYW1lLCBkZXBzLmltcG9ydHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snbW9kdWxlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0NvbXBvbmVudChtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHByb3BzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh1dGlsLmluc3BlY3QocHJvcHMsIHsgc2hvd0hpZGRlbjogdHJ1ZSwgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYW5pbWF0aW9ucz86IHN0cmluZ1tdOyAvLyBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiB0aGlzLmdldENvbXBvbmVudENoYW5nZURldGVjdGlvbihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jYXBzdWxhdGlvbjogdGhpcy5nZXRDb21wb25lbnRFbmNhcHN1bGF0aW9uKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2VudHJ5Q29tcG9uZW50cz86IHN0cmluZzsgLy8gVE9ETyB3YWl0aW5nIGRvYyBpbmZvc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzOiB0aGlzLmdldENvbXBvbmVudEV4cG9ydEFzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0OiB0aGlzLmdldENvbXBvbmVudEhvc3QocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogdGhpcy5nZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YShwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pbnRlcnBvbGF0aW9uPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSWQ6IHRoaXMuZ2V0Q29tcG9uZW50TW9kdWxlSWQocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IHRoaXMuZ2V0Q29tcG9uZW50T3V0cHV0cyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiB0aGlzLmdldENvbXBvbmVudFByb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9xdWVyaWVzPzogRGVwc1tdOyAvLyBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHRoaXMuZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlVXJsczogdGhpcy5nZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlczogdGhpcy5nZXRDb21wb25lbnRTdHlsZXMocHJvcHMpLCAvLyBUT0RPIGZpeCBhcmdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZ2V0Q29tcG9uZW50VGVtcGxhdGUocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiB0aGlzLmdldENvbXBvbmVudFRlbXBsYXRlVXJsKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzOiB0aGlzLmdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0NsYXNzOiBJTy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0c0NsYXNzOiBJTy5vdXRwdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNDbGFzczogSU8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzQ2xhc3M6IElPLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjb21wb25lbnRzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzSW5qZWN0YWJsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbmplY3RhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IElPLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydpbmplY3RhYmxlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc1BpcGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGlwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydwaXBlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0RpcmVjdGl2ZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snZGlyZWN0aXZlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19jYWNoZVtuYW1lXSA9IGRlcHM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGZpbHRlckJ5RGVjb3JhdG9ycyA9IChub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24gJiYgbm9kZS5leHByZXNzaW9uLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAvKE5nTW9kdWxlfENvbXBvbmVudHxJbmplY3RhYmxlfFBpcGV8RGlyZWN0aXZlKS8udGVzdChub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgbm9kZS5kZWNvcmF0b3JzXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZmlsdGVyQnlEZWNvcmF0b3JzKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCh2aXNpdE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLnN5bWJvbC5mbGFncyA9PT0gdHMuU3ltYm9sRmxhZ3MuQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENvbXBvbmVudElPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjbGFzc2VzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYobm9kZS5zeW1ib2wuZmxhZ3MgPT09IHRzLlN5bWJvbEZsYWdzLkludGVyZmFjZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0SW50ZXJmYWNlSU8oZmlsZSwgc291cmNlRmlsZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnRlcmZhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5raW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmtpbmQgPSBJTy5raW5kO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2ludGVyZmFjZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRSb3V0ZUlPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgIGlmKElPLnJvdXRlcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Um91dGVzO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Um91dGVzID0gSlNPTi5wYXJzZShJTy5yb3V0ZXMucmVwbGFjZSgvIC9nbSwgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdSb3V0ZXMgcGFyc2luZyBlcnJvciwgbWF5YmUgYSB0cmFpbGluZyBjb21tYSBvciBhbiBleHRlcm5hbCB2YXJpYWJsZSA/Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydyb3V0ZXMnXSA9IFsuLi5vdXRwdXRTeW1ib2xzWydyb3V0ZXMnXSwgLi4ubmV3Um91dGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDb21wb25lbnRJTyhmaWxlLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMucHJvcGVydGllcyA9IElPLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snY2xhc3NlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgdGhlIHJvb3QgbW9kdWxlIHdpdGggYm9vdHN0cmFwTW9kdWxlIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgLy9GaW5kIHJlY3VzaXZlbHkgaW4gZXhwcmVzc2lvbiBub2RlcyBvbmUgd2l0aCBuYW1lICdib290c3RyYXBNb2R1bGUnXG4gICAgICAgICAgICAgICAgICAgIGxldCByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZSA9IHRoaXMuZmluZEV4cHJlc3Npb25CeU5hbWUobm9kZSwgJ2Jvb3RzdHJhcE1vZHVsZScpO1xuICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHROb2RlLmFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJlc3VsdE5vZGUuYXJndW1lbnRzLCBmdW5jdGlvbihhcmd1bWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290TW9kdWxlID0gYXJndW1lbnQudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuc2V0Um9vdE1vZHVsZShyb290TW9kdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG4gICAgcHJpdmF0ZSBkZWJ1ZyhkZXBzOiBEZXBzKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnZGVidWcnLCBgJHtkZXBzLm5hbWV9OmApO1xuICAgICAgICBbXG4gICAgICAgICAgICAnaW1wb3J0cycsICdleHBvcnRzJywgJ2RlY2xhcmF0aW9ucycsICdwcm92aWRlcnMnLCAnYm9vdHN0cmFwJ1xuICAgICAgICBdLmZvckVhY2goc3ltYm9scyA9PiB7XG4gICAgICAgICAgICBpZiAoZGVwc1tzeW1ib2xzXSAmJiBkZXBzW3N5bWJvbHNdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJycsIGAtICR7c3ltYm9sc306YCk7XG4gICAgICAgICAgICAgICAgZGVwc1tzeW1ib2xzXS5tYXAoaSA9PiBpLm5hbWUpLmZvckVhY2goZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnJywgYFxcdC0gJHtkfWApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZEV4cHJlc3Npb25CeU5hbWUoZW50cnlOb2RlLCBuYW1lKSB7XG4gICAgICAgIGxldCByZXN1bHQsXG4gICAgICAgICAgICBsb29wID0gZnVuY3Rpb24obm9kZSwgbmFtZSkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbiAmJiAhbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcChub2RlLmV4cHJlc3Npb24sIG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24gJiYgbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uLm5hbWUudGV4dCA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgbG9vcChlbnRyeU5vZGUsIG5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNDb21wb25lbnQobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnQ29tcG9uZW50JztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUGlwZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdQaXBlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGlyZWN0aXZlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ0RpcmVjdGl2ZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0luamVjdGFibGUobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnSW5qZWN0YWJsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc01vZHVsZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdOZ01vZHVsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUeXBlKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGU7XG4gICAgICAgIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY29tcG9uZW50JykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdjb21wb25lbnQnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdwaXBlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdwaXBlJztcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignbW9kdWxlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdtb2R1bGUnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdkaXJlY3RpdmUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ2RpcmVjdGl2ZSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xlTmFtZShub2RlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzZWxlY3RvcicpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RXhwb3J0QXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRBcycpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAncHJvdmlkZXJzJykubWFwKChwcm92aWRlck5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKHByb3ZpZGVyTmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZFByb3BzKHZpc2l0ZWROb2RlKSB7XG4gICAgICAgIGlmKHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2aXNpdGVkTm9kZS5leHByZXNzaW9uLmFyZ3VtZW50cy5wb3AoKS5wcm9wZXJ0aWVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVEZWNsYXRpb25zKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZGVjbGFyYXRpb25zJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5maW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzUmF3KHByb3BzLCAnaW1wb3J0cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlSW1wb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2ltcG9ydHMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUV4cG9ydHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRIb3N0KHByb3BzOiBOb2RlT2JqZWN0W10pOiBPYmplY3Qge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzLCAnaG9zdCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlQm9vdHN0cmFwKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnYm9vdHN0cmFwJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YShwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW5wdXRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXREZWNvcmF0b3JPZlR5cGUobm9kZSwgZGVjb3JhdG9yVHlwZSkge1xuICAgICAgdmFyIGRlY29yYXRvcnMgPSBub2RlLmRlY29yYXRvcnMgfHwgW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZGVjb3JhdG9yc1tpXS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gZGVjb3JhdG9yVHlwZSkge1xuICAgICAgICAgIHJldHVybiBkZWNvcmF0b3JzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRJbnB1dChwcm9wZXJ0eSwgaW5EZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGluQXJncyA9IGluRGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogaW5BcmdzLmxlbmd0aCA/IGluQXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5KSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRUeXBlKG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIG5vZGUgPyB0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50LnR5cGVUb1N0cmluZyh0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50LmdldFR5cGVBdExvY2F0aW9uKG5vZGUpKSA6ICd2b2lkJztcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0T3V0cHV0KHByb3BlcnR5LCBvdXREZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG91dEFyZ3MgPSBvdXREZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBvdXRBcmdzLmxlbmd0aCA/IG91dEFyZ3NbMF0udGV4dCA6IHByb3BlcnR5Lm5hbWUudGV4dCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQdWJsaWMobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpc1B1YmxpYzogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpc1B1YmxpYykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW50ZXJuYWxNZW1iZXIobWVtYmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUHJpdmF0ZU9ySW50ZXJuYWwobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpc1ByaXZhdGU6IGJvb2xlYW4gPSBtZW1iZXIubW9kaWZpZXJzLnNvbWUobW9kaWZpZXIgPT4gbW9kaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZCk7XG4gICAgICAgICAgICBpZiAoaXNQcml2YXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNJbnRlcm5hbE1lbWJlcihtZW1iZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJbnRlcm5hbE1lbWJlcihtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaW50ZXJuYWxUYWdzOiBzdHJpbmdbXSA9IFsnaW50ZXJuYWwnLCAncHJpdmF0ZScsICdoaWRkZW4nXTtcbiAgICAgICAgaWYgKG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgbWVtYmVyLmpzRG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRvYy50YWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxUYWdzLmluZGV4T2YodGFnLnRhZ05hbWUudGV4dCkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzQW5ndWxhckxpZmVjeWNsZUhvb2sobWV0aG9kTmFtZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTID0gW1xuICAgICAgICAgICAgJ25nT25Jbml0JywgJ25nT25DaGFuZ2VzJywgJ25nRG9DaGVjaycsICduZ09uRGVzdHJveScsICduZ0FmdGVyQ29udGVudEluaXQnLCAnbmdBZnRlckNvbnRlbnRDaGVja2VkJyxcbiAgICAgICAgICAgICduZ0FmdGVyVmlld0luaXQnLCAnbmdBZnRlclZpZXdDaGVja2VkJywgJ3dyaXRlVmFsdWUnLCAncmVnaXN0ZXJPbkNoYW5nZScsICdyZWdpc3Rlck9uVG91Y2hlZCcsICdzZXREaXNhYmxlZFN0YXRlJ1xuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUy5pbmRleE9mKG1ldGhvZE5hbWUpID49IDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKG1ldGhvZC5wYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICB2YXIgX3BhcmFtZXRlcnMgPSBbXSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtZXRob2QucGFyYW1ldGVycy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuaXNQdWJsaWMobWV0aG9kLnBhcmFtZXRlcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIF9wYXJhbWV0ZXJzLnB1c2godGhhdC52aXNpdEFyZ3VtZW50KG1ldGhvZC5wYXJhbWV0ZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9wYXJhbWV0ZXJzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdENhbGxEZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSksXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0SW5kZXhEZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSksXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0TWV0aG9kRGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICBuYW1lOiBtZXRob2QubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSlcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGpzZG9jdGFncyA9IF90cy5nZXRKU0RvY3MobWV0aG9kKTtcbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIGlmIChqc2RvY3RhZ3NbMF0udGFncykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBqc2RvY3RhZ3NbMF0udGFncztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRBcmd1bWVudChhcmcpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IGFyZy5uYW1lLnRleHQsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShhcmcpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE5hbWVzQ29tcGFyZUZuKG5hbWUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJ25hbWUnO1xuICAgICAgICByZXR1cm4gKGEsIGIpID0+IGFbbmFtZV0ubG9jYWxlQ29tcGFyZShiW25hbWVdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0cmluZ2lmeURlZmF1bHRWYWx1ZShub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGlmIChub2RlLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLnRleHQ7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZCkge1xuICAgICAgICAgICAgcmV0dXJuICdmYWxzZSc7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RydWUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBwcm9wZXJ0eS5uYW1lLnRleHQsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcy52aXNpdFR5cGUocHJvcGVydHkpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdE1lbWJlcnMobWVtYmVycykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaW5wdXRzID0gW107XG4gICAgICAgIHZhciBvdXRwdXRzID0gW107XG4gICAgICAgIHZhciBtZXRob2RzID0gW107XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gW107XG4gICAgICAgIHZhciBraW5kO1xuICAgICAgICB2YXIgaW5wdXREZWNvcmF0b3IsIG91dERlY29yYXRvcjtcblxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVtYmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaW5wdXREZWNvcmF0b3IgPSB0aGlzLmdldERlY29yYXRvck9mVHlwZShtZW1iZXJzW2ldLCAnSW5wdXQnKTtcbiAgICAgICAgICAgIG91dERlY29yYXRvciA9IHRoaXMuZ2V0RGVjb3JhdG9yT2ZUeXBlKG1lbWJlcnNbaV0sICdPdXRwdXQnKTtcblxuICAgICAgICAgICAga2luZCA9IG1lbWJlcnNbaV0ua2luZDtcblxuICAgICAgICAgICAgaWYgKGlucHV0RGVjb3JhdG9yKSB7XG4gICAgICAgICAgICAgICAgaW5wdXRzLnB1c2godGhpcy52aXNpdElucHV0KG1lbWJlcnNbaV0sIGlucHV0RGVjb3JhdG9yKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91dERlY29yYXRvcikge1xuICAgICAgICAgICAgICAgIG91dHB1dHMucHVzaCh0aGlzLnZpc2l0T3V0cHV0KG1lbWJlcnNbaV0sIG91dERlY29yYXRvcikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1ByaXZhdGVPckludGVybmFsKG1lbWJlcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTWV0aG9kRGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLk1ldGhvZFNpZ25hdHVyZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuaXNBbmd1bGFyTGlmZWN5Y2xlSG9vayhtZW1iZXJzW2ldLm5hbWUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kcy5wdXNoKHRoaXMudmlzaXRNZXRob2REZWNsYXJhdGlvbihtZW1iZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5U2lnbmF0dXJlIHx8IG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5HZXRBY2Nlc3Nvcikge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdFByb3BlcnR5KG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5DYWxsU2lnbmF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh0aGlzLnZpc2l0Q2FsbERlY2xhcmF0aW9uKG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbmRleFNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdEluZGV4RGVjbGFyYXRpb24obWVtYmVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfY29uc3RydWN0b3JQcm9wZXJ0aWVzID0gdGhpcy52aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWVtYmVyc1tpXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBqID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiA9IF9jb25zdHJ1Y3RvclByb3BlcnRpZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBmb3IoajsgajxsZW47IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKF9jb25zdHJ1Y3RvclByb3BlcnRpZXNbal0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW5wdXRzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcbiAgICAgICAgb3V0cHV0cy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG4gICAgICAgIHByb3BlcnRpZXMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgbWV0aG9kcyxcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgICAgICBraW5kXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdERpcmVjdGl2ZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICB2YXIgZXhwb3J0QXM7XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzWzBdLnByb3BlcnRpZXM7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocHJvcGVydGllc1tpXS5uYW1lLnRleHQgPT09ICdzZWxlY3RvcicpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgb25seSB3b3JrIGlmIHNlbGVjdG9yIGlzIGluaXRpYWxpemVkIGFzIGEgc3RyaW5nIGxpdGVyYWxcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHByb3BlcnRpZXNbaV0uaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzW2ldLm5hbWUudGV4dCA9PT0gJ2V4cG9ydEFzJykge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBvbmx5IHdvcmsgaWYgc2VsZWN0b3IgaXMgaW5pdGlhbGl6ZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbFxuICAgICAgICAgICAgICAgIGV4cG9ydEFzID0gcHJvcGVydGllc1tpXS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgICAgZXhwb3J0QXNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUGlwZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgIHJldHVybiBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdQaXBlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTW9kdWxlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgcmV0dXJuIGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ05nTW9kdWxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGlyZWN0aXZlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgIHJldHVybiBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9PT0gJ0RpcmVjdGl2ZScgfHwgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPT09ICdDb21wb25lbnQnO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNTZXJ2aWNlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICAgcmV0dXJuIGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ0luamVjdGFibGUnO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVOYW1lLCBjbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBzeW1ib2wgPSB0aGlzLnByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKS5nZXRTeW1ib2xBdExvY2F0aW9uKGNsYXNzRGVjbGFyYXRpb24ubmFtZSk7XG4gICAgICAgIHZhciBkZXNjcmlwdGlvbiA9IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhzeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpO1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5uYW1lLnRleHQ7XG4gICAgICAgIHZhciBkaXJlY3RpdmVJbmZvO1xuICAgICAgICB2YXIgbWVtYmVycztcblxuICAgICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRGlyZWN0aXZlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5mbyA9IHRoaXMudmlzaXREaXJlY3RpdmVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogbWVtYmVycy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBtZW1iZXJzLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNTZXJ2aWNlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzUGlwZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pIHx8IHRoaXMuaXNNb2R1bGVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZFxuICAgICAgICAgICAgfV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzKTtcblxuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRFbnVtRGVjbGFyYXRpb24oZmlsZU5hbWUsIG5vZGUpIHtcbiAgICAgICAgaWYoIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZSAmJiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZS50ZXh0ID09PSAnUm91dGVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZFJvdXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0ubmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGdlbmVyYXRlKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcilcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzOiBnZW5lcmF0ZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSb3V0ZUlPKGZpbGVuYW1lLCBzb3VyY2VGaWxlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0RW51bURlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudElPKGZpbGVuYW1lOiBzdHJpbmcsIHNvdXJjZUZpbGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SW50ZXJmYWNlSU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZSwgbm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5wb3MgPT09IG5vZGUucG9zICYmIHN0YXRlbWVudC5lbmQgPT09IG5vZGUuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRPdXRwdXRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdvdXRwdXRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdwcm92aWRlcnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd2aWV3UHJvdmlkZXJzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnREaXJlY3RpdmVzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZGlyZWN0aXZlcycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICAgICAgaWRlbnRpZmllci5zZWxlY3RvciA9IHRoaXMuZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWUpO1xuICAgICAgICAgICAgaWRlbnRpZmllci5sYWJlbCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgbGV0IG5zTW9kdWxlID0gbmFtZS5zcGxpdCgnLicpLFxuICAgICAgICAgICAgdHlwZSA9IHRoaXMuZ2V0VHlwZShuYW1lKTtcbiAgICAgICAgaWYgKG5zTW9kdWxlLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgLy8gY2FjaGUgZGVwcyB3aXRoIHRoZSBzYW1lIG5hbWVzcGFjZSAoaS5lIFNoYXJlZC4qKVxuICAgICAgICAgICAgaWYgKHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fbnNNb2R1bGVbbnNNb2R1bGVbMF1dLnB1c2gobmFtZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0gPSBbbmFtZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbnM6IG5zTW9kdWxlWzBdLFxuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdHlwZTogdHlwZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVVcmxzKHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3RlbXBsYXRlVXJsJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50VGVtcGxhdGUocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIGxldCB0ID0gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndGVtcGxhdGUnLCB0cnVlKS5wb3AoKVxuICAgICAgICBpZih0KSB7XG4gICAgICAgICAgICB0ID0gZGV0ZWN0SW5kZW50KHQsIDApO1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvXFxuLywgJycpO1xuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvICskL2dtLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVVcmxzKHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3N0eWxlVXJscycpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFN0eWxlcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnc3R5bGVzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRNb2R1bGVJZChwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ21vZHVsZUlkJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRDaGFuZ2VEZXRlY3Rpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdjaGFuZ2VEZXRlY3Rpb24nKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2VuY2Fwc3VsYXRpb24nKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNhbml0aXplVXJscyh1cmxzOiBzdHJpbmdbXSkge1xuICAgICAgICByZXR1cm4gdXJscy5tYXAodXJsID0+IHVybC5yZXBsYWNlKCcuLycsICcnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IE9iamVjdCB7XG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBwYXJzZVByb3BlcnRpZXMgPSAobm9kZTogTm9kZU9iamVjdCk6IE9iamVjdCA9PiB7XG4gICAgICAgICAgICBsZXQgb2JqID0ge307XG4gICAgICAgICAgICAobm9kZS5pbml0aWFsaXplci5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgb2JqW3Byb3AubmFtZS50ZXh0XSA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZGVwcy5tYXAocGFyc2VQcm9wZXJ0aWVzKS5wb3AoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogYW55IHtcbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZXBzIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwcyhwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG5cbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9sVGV4dCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoJy8nKSAhPT0gLTEgJiYgIW11bHRpTGluZSkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnNwbGl0KCcvJykucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgIF07XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGJ1aWxkSWRlbnRpZmllck5hbWUgPSAobm9kZTogTm9kZU9iamVjdCwgbmFtZSA9ICcnKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZSA/IGAuJHtuYW1lfWAgOiBuYW1lO1xuXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVOYW1lID0gdGhpcy51bmtub3duO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLmV4cHJlc3Npb24pIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihub2RlLmV4cHJlc3Npb24uZWxlbWVudHMpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbi5raW5kID09PSB0cy5TeW50YXhLaW5kLkFycmF5TGl0ZXJhbEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi5lbGVtZW50cy5tYXAoIGVsID0+IGVsLnRleHQgKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gYFske25vZGVOYW1lfV1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSAgdHMuU3ludGF4S2luZC5TcHJlYWRFbGVtZW50RXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYC4uLiR7bm9kZU5hbWV9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2J1aWxkSWRlbnRpZmllck5hbWUobm9kZS5leHByZXNzaW9uLCBub2RlTmFtZSl9JHtuYW1lfWBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGAke25vZGUudGV4dH0uJHtuYW1lfWA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24gPSAobzogTm9kZU9iamVjdCk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOlxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiBBUFBfQkFTRV9IUkVGLCB1c2VWYWx1ZTogJy8nIH0sXG4gICAgICAgICAgICAvLyBvclxuICAgICAgICAgICAgLy8geyBwcm92aWRlOiAnRGF0ZScsIHVzZUZhY3Rvcnk6IChkMSwgZDIpID0+IG5ldyBEYXRlKCksIGRlcHM6IFsnZDEnLCAnZDInXSB9XG5cbiAgICAgICAgICAgIGxldCBfZ2VuUHJvdmlkZXJOYW1lOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IF9wcm92aWRlclByb3BzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgICAgICAoby5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAnJHtpZGVudGlmaWVyfSdgO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGxhbWJkYSBmdW5jdGlvbiAoaS5lIHVzZUZhY3RvcnkpXG4gICAgICAgICAgICAgICAgaWYgKHByb3AuaW5pdGlhbGl6ZXIuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0gKHByb3AuaW5pdGlhbGl6ZXIucGFyYW1ldGVycyB8fCA8YW55PltdKS5tYXAoKHBhcmFtczogTm9kZU9iamVjdCkgPT4gcGFyYW1zLm5hbWUudGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXIgPSBgKCR7cGFyYW1zLmpvaW4oJywgJyl9KSA9PiB7fWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gZmFjdG9yeSBkZXBzIGFycmF5XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZWxlbWVudHMgPSAocHJvcC5pbml0aWFsaXplci5lbGVtZW50cyB8fCBbXSkubWFwKChuOiBOb2RlT2JqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJyR7bi50ZXh0fSdgO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGBbJHtlbGVtZW50cy5qb2luKCcsICcpfV1gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF9wcm92aWRlclByb3BzLnB1c2goW1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBwcm92aWRlXG4gICAgICAgICAgICAgICAgICAgIHByb3AubmFtZS50ZXh0LFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGkuZSBPcGFxdWVUb2tlbiBvciAnU3RyaW5nVG9rZW4nXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcblxuICAgICAgICAgICAgICAgIF0uam9pbignOiAnKSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYHsgJHtfcHJvdmlkZXJQcm9wcy5qb2luKCcsICcpfSB9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZVN5bWJvbEVsZW1lbnRzID0gKG86IE5vZGVPYmplY3QgfCBhbnkpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogQW5ndWxhckZpcmVNb2R1bGUuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZylcbiAgICAgICAgICAgIGlmIChvLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSBidWlsZElkZW50aWZpZXJOYW1lKG8uZXhwcmVzc2lvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbiBhcmd1bWVudHMgY291bGQgYmUgcmVhbGx5IGNvbXBsZXhlLiBUaGVyZSBhcmUgc29cbiAgICAgICAgICAgICAgICAvLyBtYW55IHVzZSBjYXNlcyB0aGF0IHdlIGNhbid0IGhhbmRsZS4gSnVzdCBwcmludCBcImFyZ3NcIiB0byBpbmRpY2F0ZVxuICAgICAgICAgICAgICAgIC8vIHRoYXQgd2UgaGF2ZSBhcmd1bWVudHMuXG5cbiAgICAgICAgICAgICAgICBsZXQgZnVuY3Rpb25BcmdzID0gby5hcmd1bWVudHMubGVuZ3RoID4gMCA/ICdhcmdzJyA6ICcnO1xuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gYCR7Y2xhc3NOYW1lfSgke2Z1bmN0aW9uQXJnc30pYDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogU2hhcmVkLk1vZHVsZVxuICAgICAgICAgICAgZWxzZSBpZiAoby5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBidWlsZElkZW50aWZpZXJOYW1lKG8pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gby50ZXh0ID8gby50ZXh0IDogcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24obyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9scyA9IChub2RlOiBOb2RlT2JqZWN0KTogc3RyaW5nW10gPT4ge1xuXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5vZGUuaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlU3ltYm9sVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBwYXJzZVN5bWJvbEVsZW1lbnRzKG5vZGUuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMubWFwKHBhcnNlU3ltYm9sRWxlbWVudHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVN5bWJvbHMpLnBvcCgpIHx8IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2NhY2hlW25hbWVdO1xuICAgIH1cblxufVxuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgTGl2ZVNlcnZlciBmcm9tICdsaXZlLXNlcnZlcic7XG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IG1hcmtlZCBmcm9tICdtYXJrZWQnO1xuXG5jb25zdCBnbG9iOiBhbnkgPSByZXF1aXJlKCdnbG9iJyk7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBIdG1sRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2h0bWwuZW5naW5lJztcbmltcG9ydCB7IE1hcmtkb3duRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL21hcmtkb3duLmVuZ2luZSc7XG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2ZpbGUuZW5naW5lJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24sIElDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5pbXBvcnQgeyBOZ2RFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvbmdkLmVuZ2luZSc7XG5pbXBvcnQgeyBTZWFyY2hFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvc2VhcmNoLmVuZ2luZSc7XG5pbXBvcnQgeyBEZXBlbmRlbmNpZXMgfSBmcm9tICcuL2NvbXBpbGVyL2RlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBSb3V0ZXJQYXJzZXIgfSBmcm9tICcuLi91dGlscy9yb3V0ZXIucGFyc2VyJztcblxuaW1wb3J0IHsgQ09NUE9ET0NfREVGQVVMVFMgfSBmcm9tICcuLi91dGlscy9kZWZhdWx0cyc7XG5cbmxldCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKSxcbiAgICBjd2QgPSBwcm9jZXNzLmN3ZCgpLFxuICAgICRodG1sZW5naW5lID0gbmV3IEh0bWxFbmdpbmUoKSxcbiAgICAkZmlsZWVuZ2luZSA9IG5ldyBGaWxlRW5naW5lKCksXG4gICAgJG1hcmtkb3duZW5naW5lID0gbmV3IE1hcmtkb3duRW5naW5lKCksXG4gICAgJG5nZGVuZ2luZSA9IG5ldyBOZ2RFbmdpbmUoKSxcbiAgICAkc2VhcmNoRW5naW5lID0gbmV3IFNlYXJjaEVuZ2luZSgpLFxuICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbiB7XG4gICAgb3B0aW9uczpPYmplY3Q7XG4gICAgZmlsZXM6IEFycmF5PHN0cmluZz47XG5cbiAgICBjb25maWd1cmF0aW9uOklDb25maWd1cmF0aW9uO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGNvbXBvZG9jIGFwcGxpY2F0aW9uIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG9wdGlvbnMgdGhhdCBzaG91bGQgYmUgdXNlZC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zPzpPYmplY3QpIHtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiBvcHRpb25zICkge1xuICAgICAgICAgICAgaWYodHlwZW9mIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YVtvcHRpb25dICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YVtvcHRpb25dID0gb3B0aW9uc1tvcHRpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgY29tcG9kb2NcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XG4gICAgICAgICRodG1sZW5naW5lLmluaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1BhY2thZ2VKc29uKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEZpbGVzKGZpbGVzOkFycmF5PHN0cmluZz4pIHtcbiAgICAgICAgdGhpcy5maWxlcyA9IGZpbGVzO1xuICAgIH1cblxuICAgIHByb2Nlc3NQYWNrYWdlSnNvbigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBwYWNrYWdlLmpzb24gZmlsZScpO1xuICAgICAgICAkZmlsZWVuZ2luZS5nZXQoJ3BhY2thZ2UuanNvbicpLnRoZW4oKHBhY2thZ2VEYXRhKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UocGFja2FnZURhdGEpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWREYXRhLm5hbWUgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPT09IENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9IHBhcnNlZERhdGEubmFtZSArICcgZG9jdW1lbnRhdGlvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZERhdGEuZGVzY3JpcHRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb24gPSBwYXJzZWREYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhY2thZ2UuanNvbiBmaWxlIGZvdW5kJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bigpO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IHBhY2thZ2UuanNvbiBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bigpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzTWFya2Rvd24oKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdTZWFyY2hpbmcgUkVBRE1FLm1kIGZpbGUnKTtcbiAgICAgICAgJG1hcmtkb3duZW5naW5lLmdldFJlYWRtZUZpbGUoKS50aGVuKChyZWFkbWVEYXRhOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdyZWFkbWUnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJlYWRtZSA9IHJlYWRtZURhdGE7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnUkVBRE1FLm1kIGZpbGUgZm91bmQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IFJFQURNRS5tZCBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnb3ZlcnZpZXcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXNEYXRhKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnR2V0IGRlcGVuZGVuY2llcyBkYXRhJyk7XG5cbiAgICAgICAgbGV0IGNyYXdsZXIgPSBuZXcgRGVwZW5kZW5jaWVzKFxuICAgICAgICAgIHRoaXMuZmlsZXMsIHtcbiAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS5pbml0KGRlcGVuZGVuY2llc0RhdGEpO1xuXG4gICAgICAgIC8vUm91dGVyUGFyc2VyLnByaW50Um91dGVzKCk7XG5cbiAgICAgICAgdGhpcy5wcmVwYXJlTW9kdWxlcygpO1xuXG4gICAgICAgIHRoaXMucHJlcGFyZUNvbXBvbmVudHMoKS50aGVuKChyZWFkbWVEYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVEaXJlY3RpdmVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5pbmplY3RhYmxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlSW5qZWN0YWJsZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlUm91dGVzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLnBpcGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVQaXBlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5jbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVDbGFzc2VzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZUludGVyZmFjZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlQ292ZXJhZ2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVNb2R1bGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBtb2R1bGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgIG5hbWU6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdtb2R1bGVzJ1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ21vZHVsZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgbW9kdWxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlUGlwZXMgPSAoKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIHBpcGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UGlwZXMoKTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdwaXBlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3BpcGUnLFxuICAgICAgICAgICAgICAgIHBpcGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlQ2xhc3NlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY2xhc3NlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q2xhc3NlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnY2xhc3NlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgIGNsYXNzOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlSW50ZXJmYWNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgaW50ZXJmYWNlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW50ZXJmYWNlcygpO1xuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcy5sZW5ndGg7XG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2ludGVyZmFjZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAgICAgaW50ZXJmYWNlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlQ29tcG9uZW50cygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgY29tcG9uZW50cycpO1xuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDb21wb25lbnRzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArICdSRUFETUUubWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUkVBRE1FLm1kIGV4aXN0IGZvciB0aGlzIGNvbXBvbmVudCwgaW5jbHVkZSBpdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHJlYWRtZUZpbGUsICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLnJlYWRtZSA9IG1hcmtlZChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRGlyZWN0aXZlcyA9ICgpID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgZGlyZWN0aXZlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0RGlyZWN0aXZlcygpO1xuXG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdkaXJlY3RpdmVzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZUluamVjdGFibGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBpbmplY3RhYmxlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEluamVjdGFibGVzKCk7XG5cbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgICAgIGluamVjdGFibGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcmVwYXJlUm91dGVzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyByb3V0ZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJvdXRlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Um91dGVzKCk7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ3JvdXRlcycsXG4gICAgICAgICAgICBjb250ZXh0OiAncm91dGVzJ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlQ292ZXJhZ2UoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgcmVwb3J0Jyk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogbG9vcCB3aXRoIGNvbXBvbmVudHMsIGNsYXNzZXMsIGluamVjdGFibGVzLCBpbnRlcmZhY2VzLCBwaXBlc1xuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGZpbGVzID0gW10sXG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgIGdldFN0YXR1cyA9IGZ1bmN0aW9uKHBlcmNlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzO1xuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50IDw9IDI1KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdsb3cnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGVyY2VudCA+IDI1ICYmIHBlcmNlbnQgPD0gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ21lZGl1bSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJjZW50ID4gNTAgJiYgcGVyY2VudCA8PSA3NSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnZ29vZCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ3ZlcnktZ29vZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cywgKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY29tcG9uZW50LmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wb25lbnQubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjb21wb25lbnQucHJvcGVydGllc0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5tZXRob2RzQ2xhc3MubGVuZ3RoICsgY29tcG9uZW50LmlucHV0c0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5vdXRwdXRzQ2xhc3MubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5wcm9wZXJ0aWVzQ2xhc3MsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQubWV0aG9kc0NsYXNzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQuaW5wdXRzQ2xhc3MsIChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKGlucHV0LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQub3V0cHV0c0NsYXNzLCAob3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYob3V0cHV0LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcywgKGNsYXNzZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY2xhc3NlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzc2UnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjbGFzc2UubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjbGFzc2UucHJvcGVydGllcy5sZW5ndGggKyBjbGFzc2UubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goY2xhc3NlLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGlmKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICB9KTtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcywgKGluamVjdGFibGUpID0+IHtcbiAgICAgICAgICAgIGxldCBjbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGluamVjdGFibGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW5qZWN0YWJsZS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmplY3RhYmxlLm5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLmxlbmd0aCArIGluamVjdGFibGUubWV0aG9kcy5sZW5ndGg7XG4gICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMsIChpbnRlcikgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW50ZXIuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaW50ZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaW50ZXIubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBpbnRlci5wcm9wZXJ0aWVzLmxlbmd0aCArIGludGVyLm1ldGhvZHMubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGludGVyLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbnRlci5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzLCAocGlwZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNsID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogcGlwZS5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBwaXBlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBpcGUubmFtZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSAxO1xuICAgICAgICAgICAgaWYgKHBpcGUuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWxlcyA9IF8uc29ydEJ5KGZpbGVzLCBbJ2ZpbGVQYXRoJ10pO1xuICAgICAgICB2YXIgY292ZXJhZ2VEYXRhID0ge1xuICAgICAgICAgICAgY291bnQ6IE1hdGguZmxvb3IodG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCAvIGZpbGVzLmxlbmd0aCksXG4gICAgICAgICAgICBzdGF0dXM6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGNvdmVyYWdlRGF0YS5zdGF0dXMgPSBnZXRTdGF0dXMoY292ZXJhZ2VEYXRhLmNvdW50KTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgbmFtZTogJ2NvdmVyYWdlJyxcbiAgICAgICAgICAgIGNvbnRleHQ6ICdjb3ZlcmFnZScsXG4gICAgICAgICAgICBmaWxlczogZmlsZXMsXG4gICAgICAgICAgICBkYXRhOiBjb3ZlcmFnZURhdGFcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1BhZ2VzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlcycpO1xuICAgICAgICBsZXQgcGFnZXMgPSB0aGlzLmNvbmZpZ3VyYXRpb24ucGFnZXMsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHBhZ2VzLmxlbmd0aCxcbiAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgcGFnZScsIHBhZ2VzW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAkaHRtbGVuZ2luZS5yZW5kZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLCBwYWdlc1tpXSkudGhlbigoaHRtbERhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZXNbaV0ucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSBwYWdlc1tpXS5wYXRoICsgJy8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2VzW2ldLm5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5pbmRleFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9zOiBwYWdlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGZpbmFsUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShmaW5hbFBhdGgpLCBodG1sRGF0YSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgJyArIHBhZ2VzW2ldLm5hbWUgKyAnIHBhZ2UgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNlYXJjaEVuZ2luZS5nZW5lcmF0ZVNlYXJjaEluZGV4SnNvbih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBc3NldHNGb2xkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXNvdXJjZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICBsb29wKCk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0Fzc2V0c0ZvbGRlcigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgYXNzZXRzIGZvbGRlcicpO1xuXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBQcm92aWRlZCBhc3NldHMgZm9sZGVyICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlcn0gZGlkIG5vdCBleGlzdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1Jlc291cmNlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgbWFpbiByZXNvdXJjZXMnKTtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy9yZXNvdXJjZXMvJyksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0KSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcmVzb3VyY2VzIGNvcHkgJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmV4dFRoZW1lKSwgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnL3N0eWxlcy8nKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGV4dGVybmFsIHN0eWxpbmcgdGhlbWUgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBjb3B5IHN1Y2NlZWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0dyYXBocygpIHtcblxuICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbmFsVGltZSA9IChuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnRG9jdW1lbnRhdGlvbiBnZW5lcmF0ZWQgaW4gJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyAnIGluICcgKyBmaW5hbFRpbWUgKyAnIHNlY29uZHMgdXNpbmcgJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSArICcgdGhlbWUnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuc2VydmUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XZWJTZXJ2ZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlR3JhcGgpIHtcblxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0dyYXBoIGdlbmVyYXRpb24gZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBtYWluIGdyYXBoJyk7XG4gICAgICAgICAgICBsZXQgbW9kdWxlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzLFxuICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgbGVuID0gbW9kdWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIG1vZHVsZSBncmFwaCcsIG1vZHVsZXNbaV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJ21vZHVsZXMvJyArIG1vZHVsZXNbaV0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAkbmdkZW5naW5lLnJlbmRlckdyYXBoKG1vZHVsZXNbaV0uZmlsZSwgZmluYWxQYXRoLCAnZicpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZmluYWxNYWluR3JhcGhQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgIGlmKGZpbmFsTWFpbkdyYXBoUGF0aC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGZpbmFsTWFpbkdyYXBoUGF0aCArPSAnLyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbE1haW5HcmFwaFBhdGggKz0gJ2dyYXBoJztcbiAgICAgICAgICAgICRuZ2RlbmdpbmUucmVuZGVyR3JhcGgodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnLCBwYXRoLnJlc29sdmUoZmluYWxNYWluR3JhcGhQYXRoKSwgJ3AnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZ3JhcGggZ2VuZXJhdGlvbjogJywgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBydW5XZWJTZXJ2ZXIoZm9sZGVyKSB7XG4gICAgICAgIExpdmVTZXJ2ZXIuc3RhcnQoe1xuICAgICAgICAgICAgcm9vdDogZm9sZGVyLFxuICAgICAgICAgICAgb3BlbjogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm9wZW4sXG4gICAgICAgICAgICBxdWlldDogdHJ1ZSxcbiAgICAgICAgICAgIGxvZ0xldmVsOiAwLFxuICAgICAgICAgICAgcG9ydDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBhcHBsaWNhdGlvbiAvIHJvb3QgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIGdldCBhcHBsaWNhdGlvbigpOkFwcGxpY2F0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBnZXQgaXNDTEkoKTpib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSAnLi9hcHAvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4vdXRpbHMvZGVmYXVsdHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyksXG4gICAgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpLFxuICAgIGZpbGVzID0gW10sXG4gICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxuZXhwb3J0IGNsYXNzIENsaUFwcGxpY2F0aW9uIGV4dGVuZHMgQXBwbGljYXRpb25cbntcbiAgICAvKipcbiAgICAgKiBSdW4gY29tcG9kb2MgZnJvbSB0aGUgY29tbWFuZCBsaW5lLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZW5lcmF0ZSgpIHtcblxuICAgICAgICBwcm9ncmFtXG4gICAgICAgICAgICAudmVyc2lvbihwa2cudmVyc2lvbilcbiAgICAgICAgICAgIC51c2FnZSgnPHNyYz4gW29wdGlvbnNdJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1wLCAtLXRzY29uZmlnIFtjb25maWddJywgJ0EgdHNjb25maWcuanNvbiBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1kLCAtLW91dHB1dCBbZm9sZGVyXScsICdXaGVyZSB0byBzdG9yZSB0aGUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQ6IC4vZG9jdW1lbnRhdGlvbiknLCBDT01QT0RPQ19ERUZBVUxUUy5mb2xkZXIpXG4gICAgICAgICAgICAub3B0aW9uKCctYiwgLS1iYXNlIFtiYXNlXScsICdCYXNlIHJlZmVyZW5jZSBvZiBodG1sIHRhZyA8YmFzZT4nLCBDT01QT0RPQ19ERUZBVUxUUy5iYXNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXksIC0tZXh0VGhlbWUgW2ZpbGVdJywgJ0V4dGVybmFsIHN0eWxpbmcgdGhlbWUgZmlsZScpXG4gICAgICAgICAgICAub3B0aW9uKCctbiwgLS1uYW1lIFtuYW1lXScsICdUaXRsZSBkb2N1bWVudGF0aW9uJywgQ09NUE9ET0NfREVGQVVMVFMudGl0bGUpXG4gICAgICAgICAgICAub3B0aW9uKCctYSwgLS1hc3NldHNGb2xkZXIgW2ZvbGRlcl0nLCAnRXh0ZXJuYWwgYXNzZXRzIGZvbGRlciB0byBjb3B5IGluIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIGZvbGRlcicpXG4gICAgICAgICAgICAub3B0aW9uKCctbywgLS1vcGVuJywgJ09wZW4gdGhlIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uJywgZmFsc2UpXG4gICAgICAgICAgICAvLy5vcHRpb24oJy1pLCAtLWluY2x1ZGVzIFtwYXRoXScsICdQYXRoIG9mIGV4dGVybmFsIG1hcmtkb3duIGZpbGVzIHRvIGluY2x1ZGUnKVxuICAgICAgICAgICAgLy8ub3B0aW9uKCctaiwgLS1pbmNsdWRlc05hbWUgW25hbWVdJywgJ05hbWUgb2YgaXRlbSBtZW51IG9mIGV4dGVybmFscyBtYXJrZG93biBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy10LCAtLXNpbGVudCcsICdJbiBzaWxlbnQgbW9kZSwgbG9nIG1lc3NhZ2VzIGFyZW5cXCd0IGxvZ2dlZCBpbiB0aGUgY29uc29sZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXMsIC0tc2VydmUnLCAnU2VydmUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQgaHR0cDovL2xvY2FsaG9zdDo4MDgwLyknLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy1yLCAtLXBvcnQgW3BvcnRdJywgJ0NoYW5nZSBkZWZhdWx0IHNlcnZpbmcgcG9ydCcsIENPTVBPRE9DX0RFRkFVTFRTLnBvcnQpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRoZW1lIFt0aGVtZV0nLCAnQ2hvb3NlIG9uZSBvZiBhdmFpbGFibGUgdGhlbWVzLCBkZWZhdWx0IGlzIFxcJ2dpdGJvb2tcXCcgKGxhcmF2ZWwsIG9yaWdpbmFsLCBwb3N0bWFyaywgcmVhZHRoZWRvY3MsIHN0cmlwZSwgdmFncmFudCknKVxuICAgICAgICAgICAgLm9wdGlvbignLS1oaWRlR2VuZXJhdG9yJywgJ0RvIG5vdCBwcmludCB0aGUgQ29tcG9kb2MgbGluayBhdCB0aGUgYm90dG9tIG9mIHRoZSBwYWdlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVTb3VyY2VDb2RlJywgJ0RvIG5vdCBhZGQgc291cmNlIGNvZGUgdGFiJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVHcmFwaCcsICdEbyBub3QgYWRkIHRoZSBkZXBlbmRlbmN5IGdyYXBoJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVDb3ZlcmFnZScsICdEbyBub3QgYWRkIHRoZSBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHJlcG9ydCcsIGZhbHNlKVxuICAgICAgICAgICAgLnBhcnNlKHByb2Nlc3MuYXJndik7XG5cbiAgICAgICAgbGV0IG91dHB1dEhlbHAgPSAoKSA9PiB7XG4gICAgICAgICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKVxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ID0gcHJvZ3JhbS5vdXRwdXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5iYXNlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYmFzZSA9IHByb2dyYW0uYmFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmV4dFRoZW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUgPSBwcm9ncmFtLmV4dFRoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0udGhlbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSA9IHByb2dyYW0udGhlbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5uYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID0gcHJvZ3JhbS5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uYXNzZXRzRm9sZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyID0gcHJvZ3JhbS5hc3NldHNGb2xkZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3BlbiA9IHByb2dyYW0ub3BlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgID0gcHJvZ3JhbS5pbmNsdWRlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzTmFtZSAgPSBwcm9ncmFtLmluY2x1ZGVzTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNpbGVudCkge1xuICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5zZXJ2ZSAgPSBwcm9ncmFtLnNlcnZlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ucG9ydCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnQgPSBwcm9ncmFtLnBvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5oaWRlR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaGlkZUdlbmVyYXRvciA9IHByb2dyYW0uaGlkZUdlbmVyYXRvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVNvdXJjZUNvZGUgPSBwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZUdyYXBoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoID0gcHJvZ3JhbS5kaXNhYmxlR3JhcGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UgPSBwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNlcnZlICYmICFwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICAvLyBpZiAtcyAmIC1kLCBzZXJ2ZSBpdFxuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0ub3V0cHV0KSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgJHtwcm9ncmFtLm91dHB1dH0gZm9sZGVyIGRvZXNuJ3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3Byb2dyYW0ub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7cHJvZ3JhbS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHN1cGVyLnJ1bldlYlNlcnZlcihwcm9ncmFtLm91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3JhbS5zZXJ2ZSAmJiAhcHJvZ3JhbS50c2NvbmZpZyAmJiAhcHJvZ3JhbS5vdXRwdXQpIHtcbiAgICAgICAgICAgIC8vIGlmIG9ubHkgLXMgZmluZCAuL2RvY3VtZW50YXRpb24sIGlmIG9rIHNlcnZlLCBlbHNlIGVycm9yIHByb3ZpZGUgLWRcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLm91dHB1dCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1Byb3ZpZGUgb3V0cHV0IGdlbmVyYXRlZCBmb2xkZXIgd2l0aCAtZCBmbGFnJyk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHtwcm9ncmFtLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3Byb2dyYW0ucG9ydH1gKTtcbiAgICAgICAgICAgICAgICBzdXBlci5ydW5XZWJTZXJ2ZXIocHJvZ3JhbS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHByb2dyYW0uaGlkZUdlbmVyYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5oaWRlR2VuZXJhdG9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRlZmF1bHRXYWxrRk9sZGVyID0gY3dkIHx8ICcuJyxcbiAgICAgICAgICAgICAgICB3YWxrID0gKGRpciwgZXhjbHVkZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4Y2x1ZGUuaW5kZXhPZihmaWxlKSA8IDAgJiYgZGlyLmluZGV4T2YoJ25vZGVfbW9kdWxlcycpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUgPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQod2FsayhmaWxlLCBleGNsdWRlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKC8oc3BlY3xcXC5kKVxcLnRzLy50ZXN0KGZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSWdub3JpbmcnLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLnRzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0luY2x1ZGluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0udHNjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignXCJ0c2NvbmZpZy5qc29uXCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeScpO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9maWxlID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKSksXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aC5iYXNlbmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyB0c2NvbmZpZycsIF9maWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHJlcXVpcmUoX2ZpbGUpLmZpbGVzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb2YgdHNjb25maWcuanNvbiBhcyBhIHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICAgIGN3ZCA9IF9maWxlLnNwbGl0KHBhdGguc2VwKS5zbGljZSgwLCAtMSkuam9pbihwYXRoLnNlcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGUgPSByZXF1aXJlKF9maWxlKS5leGNsdWRlIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHdhbGsoY3dkIHx8ICcuJywgZXhjbHVkZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLmdlbmVyYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAgZWxzZSBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZUZvbGRlciA9IHByb2dyYW0uYXJnc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFByb3ZpZGVkIHNvdXJjZSBmb2xkZXIgJHtzb3VyY2VGb2xkZXJ9IHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgcHJvdmlkZWQgc291cmNlIGZvbGRlcicpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzID0gd2FsayhwYXRoLnJlc29sdmUoc291cmNlRm9sZGVyKSwgW10pO1xuXG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcigndHNjb25maWcuanNvbiBmaWxlIHdhcyBub3QgZm91bmQsIHBsZWFzZSB1c2UgLXAgZmxhZycpO1xuICAgICAgICAgICAgICAgIG91dHB1dEhlbHAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJndXRpbCIsInJlcXVpcmUiLCJjIiwiY29sb3JzIiwicGtnIiwiTEVWRUwiLCJuYW1lIiwidmVyc2lvbiIsImxvZ2dlciIsImxvZyIsInNpbGVudCIsImFyZ3MiLCJmb3JtYXQiLCJJTkZPIiwiRVJST1IiLCJERUJVRyIsImxldmVsIiwicGFkIiwicyIsImwiLCJBcnJheSIsIk1hdGgiLCJtYXgiLCJsZW5ndGgiLCJqb2luIiwibXNnIiwic2hpZnQiLCJncmVlbiIsImN5YW4iLCJyZWQiLCJMb2dnZXIiLCJBbmd1bGFyQVBJcyIsInR5cGUiLCJfcmVzdWx0IiwiYW5ndWxhck1vZHVsZUFQSXMiLCJhbmd1bGFyTW9kdWxlIiwiaSIsImxlbiIsInRpdGxlIiwiZGF0YSIsIkRlcGVuZGVuY2llc0VuZ2luZSIsIl9pbnN0YW5jZSIsIkVycm9yIiwicmF3RGF0YSIsIm1vZHVsZXMiLCJfIiwiY29tcG9uZW50cyIsImRpcmVjdGl2ZXMiLCJpbmplY3RhYmxlcyIsImludGVyZmFjZXMiLCJyb3V0ZXMiLCJwaXBlcyIsImNsYXNzZXMiLCJmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzIiwiaW5kZXhPZiIsInJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcyIsInJlc3VsdEluQ29tcG9kb2NDbGFzc2VzIiwicmVzdWx0SW5Bbmd1bGFyQVBJcyIsImZpbmRlckluQW5ndWxhckFQSXMiLCIkZGVwZW5kZW5jaWVzRW5naW5lIiwiZ2V0SW5zdGFuY2UiLCJhIiwib3BlcmF0b3IiLCJiIiwib3B0aW9ucyIsImFyZ3VtZW50cyIsInJlc3VsdCIsImludmVyc2UiLCJmbiIsInRleHQiLCJORzJfTU9EVUxFUyIsIm9wdGlvbmFsVmFsdWUiLCJIYW5kbGViYXJzIiwiZXNjYXBlRXhwcmVzc2lvbiIsInJlcGxhY2UiLCJtZXRob2QiLCJtYXAiLCJhcmciLCJmaW5kIiwic291cmNlIiwicGF0aCIsImpzZG9jVGFncyIsInRhZ05hbWUiLCJjb21tZW50IiwidGFncyIsInRhZyIsInR5cGVFeHByZXNzaW9uIiwicGFyYW1ldGVyTmFtZSIsInB1c2giLCJocmVmIiwidGFyZ2V0IiwiSlNPTiIsInN0cmluZ2lmeSIsInBhcnRpYWxzIiwibG9vcCIsInJlc29sdmUiLCJyZWplY3QiLCJfX2Rpcm5hbWUiLCJlcnIiLCJQcm9taXNlIiwibWFpbkRhdGEiLCJwYWdlIiwibyIsInRoYXQiLCJhc3NpZ24iLCJjYWNoZSIsInRlbXBsYXRlIiwicmVuZGVyZXIiLCJSZW5kZXJlciIsImNvZGUiLCJsYW5ndWFnZSIsInZhbGlkTGFuZyIsImhpZ2hsaWdodGpzIiwiZ2V0TGFuZ3VhZ2UiLCJoaWdobGlnaHRlZCIsImhpZ2hsaWdodCIsInZhbHVlIiwic2V0T3B0aW9ucyIsInByb2Nlc3MiLCJjd2QiLCJtYXJrZWQiLCJmaWxlcGF0aCIsIkNPTVBPRE9DX0RFRkFVTFRTIiwiZm9sZGVyIiwidGhlbWUiLCJwb3J0IiwiYmFzZSIsImRpc2FibGVTb3VyY2VDb2RlIiwiZGlzYWJsZUdyYXBoIiwiZGlzYWJsZUNvdmVyYWdlIiwiQ29uZmlndXJhdGlvbiIsIl9wYWdlcyIsInBhZ2VzIiwiX21haW5EYXRhIiwiYmluUGF0aCIsImdsb2JhbEJpblBhdGgiLCJwbGF0Zm9ybSIsInBhdGhuYW1lcyIsImVudiIsIlBBVEgiLCJzcGxpdCIsImV4ZWNQYXRoIiwic3RyaXBUcmFpbGluZ1NlcCIsInRoZVBhdGgiLCJzbGljZSIsInBhdGhJc0luc2lkZSIsInBvdGVudGlhbFBhcmVudCIsInRvTG93ZXJDYXNlIiwibGFzdEluZGV4T2YiLCJ1bmRlZmluZWQiLCJpc1BhdGhJbnNpZGUiLCJhcmd2Iiwib3V0cHV0cGF0aCIsIm5nZFBhdGgiLCJpc0dsb2JhbCIsIk1PREUiLCJ0ZXN0IiwiZmluYWxQYXRoIiwic3Rkb3V0Iiwic3RkZXJyIiwibHVuciIsImNoZWVyaW8iLCJFbnRpdGllcyIsIkFsbEh0bWxFbnRpdGllcyIsIiRjb25maWd1cmF0aW9uIiwiSHRtbCIsInNlYXJjaEluZGV4IiwicmVmIiwiZmllbGQiLCJib29zdCIsIiQiLCJsb2FkIiwiaHRtbCIsImRlY29kZSIsInVybCIsIm91dHB1dCIsImRvYyIsImluZm9zIiwiY29udGV4dCIsImRvY3VtZW50c1N0b3JlIiwiZ2V0U2VhcmNoSW5kZXgiLCJhZGQiLCJvdXRwdXRGb2xkZXIiLCJlcnJvciIsInRzYW55IiwidHMiLCJub2RlIiwiZ2V0SlNEb2NzIiwiYXBwbHkiLCJzdHIiLCJjb3VudCIsImluZGVudCIsInN0cmlwSW5kZW50IiwibWF0Y2giLCJtaW4iLCJ4IiwicmUiLCJSZWdFeHAiLCJyZXBlYXRpbmciLCJuIiwiVHlwZUVycm9yIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJyZXQiLCJpbmRlbnRTdHJpbmciLCJ0cmFuc3BpbGVPcHRpb25zIiwiaW5wdXRGaWxlTmFtZSIsImZpbGVOYW1lIiwianN4IiwiY29tcGlsZXJIb3N0IiwidHNjb25maWdEaXJlY3RvcnkiLCJsaWJTb3VyY2UiLCJmcyIsInRvU3RyaW5nIiwiZSIsImRlYnVnIiwiUm91dGVyUGFyc2VyIiwibW9kdWxlc1RyZWUiLCJyb290TW9kdWxlIiwibW9kdWxlc1dpdGhSb3V0ZXMiLCJyb3V0ZSIsIm1vZHVsZU5hbWUiLCJtb2R1bGVJbXBvcnRzIiwibW9kdWxlIiwiaW1wb3J0cyIsImltcG9ydHNOb2RlIiwiaW5pdGlhbGl6ZXIiLCJlbGVtZW50cyIsImVsZW1lbnQiLCJhcmd1bWVudCIsImNsZWFuTW9kdWxlc1RyZWUiLCJtb2R1bGVzQ2xlYW5lciIsImFyciIsInBhcmVudCIsImNoaWxkcmVuIiwidXRpbCIsImRlcHRoIiwicm91dGVzVHJlZSIsImZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZSIsImxvb3BNb2R1bGVzUGFyc2VyIiwicGFyc2UiLCJraW5kIiwiY2xlYW5lZFJvdXRlc1RyZWUiLCJjbGVhblJvdXRlc1RyZWUiLCJnZXROZXN0ZWRDaGlsZHJlbiIsIm91dCIsImZpcnN0TG9vcE1vZHVsZSIsImltcG9ydE5vZGUiLCJnZW4iLCJ0bXAiLCJ0b2tlbiIsImdldENoaWxkcmVuIiwiZm9yRWFjaCIsInZpc2l0QW5kUmVjb2duaXplIiwiRmlyc3RMaXRlcmFsVG9rZW4iLCJJZGVudGlmaWVyIiwiU3RyaW5nTGl0ZXJhbCIsIkFycmF5TGl0ZXJhbEV4cHJlc3Npb24iLCJJbXBvcnRLZXl3b3JkIiwiRnJvbUtleXdvcmQiLCJFeHBvcnRLZXl3b3JkIiwiQ2xhc3NLZXl3b3JkIiwiVGhpc0tleXdvcmQiLCJDb25zdHJ1Y3RvcktleXdvcmQiLCJGYWxzZUtleXdvcmQiLCJUcnVlS2V5d29yZCIsIk51bGxLZXl3b3JkIiwiQXRUb2tlbiIsIlBsdXNUb2tlbiIsIkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4iLCJPcGVuUGFyZW5Ub2tlbiIsIkltcG9ydENsYXVzZSIsIk9iamVjdExpdGVyYWxFeHByZXNzaW9uIiwiQmxvY2siLCJDbG9zZUJyYWNlVG9rZW4iLCJDbG9zZVBhcmVuVG9rZW4iLCJPcGVuQnJhY2tldFRva2VuIiwiQ2xvc2VCcmFja2V0VG9rZW4iLCJTZW1pY29sb25Ub2tlbiIsIkNvbW1hVG9rZW4iLCJDb2xvblRva2VuIiwiRG90VG9rZW4iLCJEb1N0YXRlbWVudCIsIkRlY29yYXRvciIsIkZpcnN0QXNzaWdubWVudCIsIkZpcnN0UHVuY3R1YXRpb24iLCJQcml2YXRlS2V5d29yZCIsIlB1YmxpY0tleXdvcmQiLCJmaWxlcyIsIkVTNSIsIkNvbW1vbkpTIiwicHJvZ3JhbSIsIl90IiwiZGVwcyIsInNvdXJjZUZpbGVzIiwiZ2V0U291cmNlRmlsZXMiLCJmaWxlIiwiZmlsZVBhdGgiLCJpbmZvIiwiZ2V0U291cmNlRmlsZURlY29yYXRvcnMiLCJzcmNGaWxlIiwib3V0cHV0U3ltYm9scyIsImNsZWFuZXIiLCJwcm9ncmFtQ29tcG9uZW50Iiwic291cmNlRmlsZSIsImdldFNvdXJjZUZpbGUiLCJ0eXBlQ2hlY2tlckNvbXBvbmVudCIsImdldFR5cGVDaGVja2VyIiwiZGVjb3JhdG9ycyIsInZpc2l0Tm9kZSIsInZpc2l0ZWROb2RlIiwiaW5kZXgiLCJtZXRhZGF0YSIsInBvcCIsImdldFN5bWJvbGVOYW1lIiwicHJvcHMiLCJmaW5kUHJvcHMiLCJJTyIsImdldENvbXBvbmVudElPIiwiaXNNb2R1bGUiLCJnZXRNb2R1bGVQcm92aWRlcnMiLCJnZXRNb2R1bGVEZWNsYXRpb25zIiwiZ2V0TW9kdWxlSW1wb3J0cyIsImdldE1vZHVsZUV4cG9ydHMiLCJnZXRNb2R1bGVCb290c3RyYXAiLCJicmVha0xpbmVzIiwiZGVzY3JpcHRpb24iLCJnZXRUZXh0IiwiaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzIiwiYWRkTW9kdWxlV2l0aFJvdXRlcyIsImdldE1vZHVsZUltcG9ydHNSYXciLCJhZGRNb2R1bGUiLCJpc0NvbXBvbmVudCIsImdldENvbXBvbmVudENoYW5nZURldGVjdGlvbiIsImdldENvbXBvbmVudEVuY2Fwc3VsYXRpb24iLCJnZXRDb21wb25lbnRFeHBvcnRBcyIsImdldENvbXBvbmVudEhvc3QiLCJnZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YSIsImdldENvbXBvbmVudE1vZHVsZUlkIiwiZ2V0Q29tcG9uZW50T3V0cHV0cyIsImdldENvbXBvbmVudFByb3ZpZGVycyIsImdldENvbXBvbmVudFNlbGVjdG9yIiwiZ2V0Q29tcG9uZW50U3R5bGVVcmxzIiwiZ2V0Q29tcG9uZW50U3R5bGVzIiwiZ2V0Q29tcG9uZW50VGVtcGxhdGUiLCJnZXRDb21wb25lbnRUZW1wbGF0ZVVybCIsImdldENvbXBvbmVudFZpZXdQcm92aWRlcnMiLCJpbnB1dHMiLCJvdXRwdXRzIiwicHJvcGVydGllcyIsIm1ldGhvZHMiLCJpc0luamVjdGFibGUiLCJpc1BpcGUiLCJpc0RpcmVjdGl2ZSIsIl9fY2FjaGUiLCJmaWx0ZXJCeURlY29yYXRvcnMiLCJleHByZXNzaW9uIiwiZmlsdGVyIiwic3ltYm9sIiwiZmxhZ3MiLCJDbGFzcyIsIkludGVyZmFjZSIsImdldEludGVyZmFjZUlPIiwiZ2V0Um91dGVJTyIsIm5ld1JvdXRlcyIsIkNsYXNzRGVjbGFyYXRpb24iLCJFeHByZXNzaW9uU3RhdGVtZW50IiwicmVzdWx0Tm9kZSIsImZpbmRFeHByZXNzaW9uQnlOYW1lIiwic2V0Um9vdE1vZHVsZSIsInN5bWJvbHMiLCJkIiwiZW50cnlOb2RlIiwiZ2V0U3ltYm9sRGVwcyIsInByb3ZpZGVyTmFtZSIsInBhcnNlRGVlcEluZGVudGlmaWVyIiwiY29tcG9uZW50IiwiZmluZENvbXBvbmVudFNlbGVjdG9yQnlOYW1lIiwiZ2V0U3ltYm9sRGVwc1JhdyIsImdldFN5bWJvbERlcHNPYmplY3QiLCJkZWNvcmF0b3JUeXBlIiwicHJvcGVydHkiLCJpbkRlY29yYXRvciIsImluQXJncyIsInN0cmluZ2lmeURlZmF1bHRWYWx1ZSIsInZpc2l0VHlwZSIsImdldERvY3VtZW50YXRpb25Db21tZW50IiwidHlwZVRvU3RyaW5nIiwiZ2V0VHlwZUF0TG9jYXRpb24iLCJvdXREZWNvcmF0b3IiLCJvdXRBcmdzIiwibWVtYmVyIiwibW9kaWZpZXJzIiwiaXNQdWJsaWMiLCJzb21lIiwibW9kaWZpZXIiLCJpc0ludGVybmFsTWVtYmVyIiwiaXNQcml2YXRlIiwiaW50ZXJuYWxUYWdzIiwianNEb2MiLCJtZXRob2ROYW1lIiwiQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUyIsInBhcmFtZXRlcnMiLCJfcGFyYW1ldGVycyIsInZpc2l0QXJndW1lbnQiLCJwcm9wIiwianNkb2N0YWdzIiwiX3RzIiwibG9jYWxlQ29tcGFyZSIsIm1lbWJlcnMiLCJpbnB1dERlY29yYXRvciIsImdldERlY29yYXRvck9mVHlwZSIsInZpc2l0SW5wdXQiLCJ2aXNpdE91dHB1dCIsImlzUHJpdmF0ZU9ySW50ZXJuYWwiLCJNZXRob2REZWNsYXJhdGlvbiIsIk1ldGhvZFNpZ25hdHVyZSIsImlzQW5ndWxhckxpZmVjeWNsZUhvb2siLCJ2aXNpdE1ldGhvZERlY2xhcmF0aW9uIiwiUHJvcGVydHlEZWNsYXJhdGlvbiIsIlByb3BlcnR5U2lnbmF0dXJlIiwiR2V0QWNjZXNzb3IiLCJ2aXNpdFByb3BlcnR5IiwiQ2FsbFNpZ25hdHVyZSIsInZpc2l0Q2FsbERlY2xhcmF0aW9uIiwiSW5kZXhTaWduYXR1cmUiLCJ2aXNpdEluZGV4RGVjbGFyYXRpb24iLCJDb25zdHJ1Y3RvciIsIl9jb25zdHJ1Y3RvclByb3BlcnRpZXMiLCJ2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24iLCJqIiwic29ydCIsImdldE5hbWVzQ29tcGFyZUZuIiwiZGVjb3JhdG9yIiwic2VsZWN0b3IiLCJleHBvcnRBcyIsImRlY29yYXRvcklkZW50aWZpZXJUZXh0IiwiY2xhc3NEZWNsYXJhdGlvbiIsImdldFN5bWJvbEF0TG9jYXRpb24iLCJjbGFzc05hbWUiLCJkaXJlY3RpdmVJbmZvIiwiaXNEaXJlY3RpdmVEZWNvcmF0b3IiLCJ2aXNpdERpcmVjdGl2ZURlY29yYXRvciIsInZpc2l0TWVtYmVycyIsImlzU2VydmljZURlY29yYXRvciIsImlzUGlwZURlY29yYXRvciIsImlzTW9kdWxlRGVjb3JhdG9yIiwiZGVjbGFyYXRpb25MaXN0IiwiZGVjbGFyYXRpb25zIiwidHlwZU5hbWUiLCJhZGRSb3V0ZSIsImdlbmVyYXRlIiwiZmlsZW5hbWUiLCJyZXMiLCJzdGF0ZW1lbnRzIiwicmVkdWNlIiwiZGlyZWN0aXZlIiwic3RhdGVtZW50IiwiVmFyaWFibGVTdGF0ZW1lbnQiLCJjb25jYXQiLCJ2aXNpdEVudW1EZWNsYXJhdGlvbiIsInZpc2l0Q2xhc3NEZWNsYXJhdGlvbiIsIkludGVyZmFjZURlY2xhcmF0aW9uIiwicG9zIiwiZW5kIiwiaWRlbnRpZmllciIsImxhYmVsIiwibnNNb2R1bGUiLCJnZXRUeXBlIiwiX19uc01vZHVsZSIsInNhbml0aXplVXJscyIsInQiLCJkZXRlY3RJbmRlbnQiLCJ1cmxzIiwibXVsdGlMaW5lIiwicGFyc2VQcm9wZXJ0aWVzIiwib2JqIiwicGFyc2VTeW1ib2xUZXh0IiwiYnVpbGRJZGVudGlmaWVyTmFtZSIsIm5vZGVOYW1lIiwidW5rbm93biIsImVsIiwiU3ByZWFkRWxlbWVudEV4cHJlc3Npb24iLCJwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbiIsIl9nZW5Qcm92aWRlck5hbWUiLCJfcHJvdmlkZXJQcm9wcyIsImJvZHkiLCJwYXJhbXMiLCJwYXJzZVN5bWJvbEVsZW1lbnRzIiwiZnVuY3Rpb25BcmdzIiwicGFyc2VTeW1ib2xzIiwiZ2xvYiIsIiRodG1sZW5naW5lIiwiSHRtbEVuZ2luZSIsIiRmaWxlZW5naW5lIiwiRmlsZUVuZ2luZSIsIiRtYXJrZG93bmVuZ2luZSIsIk1hcmtkb3duRW5naW5lIiwiJG5nZGVuZ2luZSIsIk5nZEVuZ2luZSIsIiRzZWFyY2hFbmdpbmUiLCJTZWFyY2hFbmdpbmUiLCJzdGFydFRpbWUiLCJEYXRlIiwiY29uZmlndXJhdGlvbiIsImdldFBpcGVzIiwiYWRkUGFnZSIsImdldENsYXNzZXMiLCJnZXREaXJlY3RpdmVzIiwib3B0aW9uIiwiaW5pdCIsInRoZW4iLCJwcm9jZXNzUGFja2FnZUpzb24iLCJnZXQiLCJwYWNrYWdlRGF0YSIsInBhcnNlZERhdGEiLCJkb2N1bWVudGF0aW9uTWFpbk5hbWUiLCJkb2N1bWVudGF0aW9uTWFpbkRlc2NyaXB0aW9uIiwicHJvY2Vzc01hcmtkb3duIiwiZXJyb3JNZXNzYWdlIiwiZ2V0UmVhZG1lRmlsZSIsInJlYWRtZURhdGEiLCJyZWFkbWUiLCJnZXREZXBlbmRlbmNpZXNEYXRhIiwiY3Jhd2xlciIsIkRlcGVuZGVuY2llcyIsInRzY29uZmlnIiwiZGVwZW5kZW5jaWVzRGF0YSIsImdldERlcGVuZGVuY2llcyIsInByZXBhcmVNb2R1bGVzIiwicHJlcGFyZUNvbXBvbmVudHMiLCJwcmVwYXJlRGlyZWN0aXZlcyIsInByZXBhcmVJbmplY3RhYmxlcyIsInByZXBhcmVSb3V0ZXMiLCJwcmVwYXJlUGlwZXMiLCJwcmVwYXJlQ2xhc3NlcyIsInByZXBhcmVJbnRlcmZhY2VzIiwicHJlcGFyZUNvdmVyYWdlIiwicHJvY2Vzc1BhZ2VzIiwiZ2V0TW9kdWxlcyIsImdldEludGVyZmFjZXMiLCJnZXRDb21wb25lbnRzIiwiZGlybmFtZSIsInJlYWRtZUZpbGUiLCJnZXRJbmplY3RhYmxlcyIsImdldFJvdXRlcyIsInRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQiLCJnZXRTdGF0dXMiLCJwZXJjZW50Iiwic3RhdHVzIiwiY2wiLCJ0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQiLCJ0b3RhbFN0YXRlbWVudHMiLCJwcm9wZXJ0aWVzQ2xhc3MiLCJtZXRob2RzQ2xhc3MiLCJpbnB1dHNDbGFzcyIsIm91dHB1dHNDbGFzcyIsImlucHV0IiwiY292ZXJhZ2VQZXJjZW50IiwiZmxvb3IiLCJjb3ZlcmFnZUNvdW50IiwiY2xhc3NlIiwiaW5qZWN0YWJsZSIsImludGVyIiwicGlwZSIsImNvdmVyYWdlRGF0YSIsInJlbmRlciIsImh0bWxEYXRhIiwiaW5kZXhQYWdlIiwiZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24iLCJhc3NldHNGb2xkZXIiLCJwcm9jZXNzQXNzZXRzRm9sZGVyIiwicHJvY2Vzc1Jlc291cmNlcyIsImV4dFRoZW1lIiwicHJvY2Vzc0dyYXBocyIsIm9uQ29tcGxldGUiLCJmaW5hbFRpbWUiLCJzZXJ2ZSIsInJ1bldlYlNlcnZlciIsInJlbmRlckdyYXBoIiwiZmluYWxNYWluR3JhcGhQYXRoIiwib3BlbiIsInVzYWdlIiwib3V0cHV0SGVscCIsImV4aXQiLCJpbmNsdWRlcyIsImluY2x1ZGVzTmFtZSIsImhpZGVHZW5lcmF0b3IiLCJkZWZhdWx0V2Fsa0ZPbGRlciIsIndhbGsiLCJkaXIiLCJleGNsdWRlIiwicmVzdWx0cyIsImxpc3QiLCJzdGF0IiwiaXNEaXJlY3RvcnkiLCJfZmlsZSIsInNvdXJjZUZvbGRlciIsIkFwcGxpY2F0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsUUFBUUMsUUFBUSxXQUFSLENBQVo7QUFDQSxJQUFJQyxJQUFJRixNQUFNRyxNQUFkO0FBQ0EsSUFBSUMsUUFBTUgsUUFBUSxpQkFBUixDQUFWO0FBRUEsSUFBS0ksS0FBTDtBQUFBLFdBQUtBOzJCQUNKLFVBQUE7NEJBQ0EsV0FBQTs0QkFDRyxXQUFBO0NBSEosRUFBS0EsVUFBQUEsVUFBQSxDQUFMOzs7Ozs7YUFjT0MsSUFBTCxHQUFZRixNQUFJRSxJQUFoQjthQUNLQyxPQUFMLEdBQWVILE1BQUlHLE9BQW5CO2FBQ0tDLE1BQUwsR0FBY1IsTUFBTVMsR0FBcEI7YUFDS0MsTUFBTCxHQUFjLElBQWQ7Ozs7OztnQkFJRyxDQUFDLEtBQUtBLE1BQVQsRUFBaUI7OzhDQURWQzs7OztpQkFFRkgsTUFBTCxDQUNDLEtBQUtJLE1BQUwsY0FBWVAsTUFBTVEsSUFBbEIsU0FBMkJGLElBQTNCLEVBREQ7Ozs7O2dCQU1HLENBQUMsS0FBS0QsTUFBVCxFQUFpQjs7K0NBRFRDOzs7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
