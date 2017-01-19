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
                description: marked__default(ts.displayPartsToString(property.symbol.getDocumentationComment())),
                type: this.visitType(property.type.typeArguments[0])
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtY2xpLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbG9nZ2VyLnRzIiwiLi4vc3JjL3V0aWxzL2FuZ3VsYXItYXBpLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbWFya2Rvd24uZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2ZpbGUuZW5naW5lLnRzIiwiLi4vc3JjL3V0aWxzL2RlZmF1bHRzLnRzIiwiLi4vc3JjL2FwcC9jb25maWd1cmF0aW9uLnRzIiwiLi4vc3JjL3V0aWxzL2dsb2JhbC5wYXRoLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL25nZC5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvc2VhcmNoLmVuZ2luZS50cyIsIi4uL3NyYy91dGlscy90cy1pbnRlcm5hbC50cyIsIi4uL3NyYy91dGlsaXRpZXMudHMiLCIuLi9zcmMvdXRpbHMvcm91dGVyLnBhcnNlci50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvY29kZWdlbi50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvZGVwZW5kZW5jaWVzLnRzIiwiLi4vc3JjL2FwcC9hcHBsaWNhdGlvbi50cyIsIi4uL3NyYy9pbmRleC1jbGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsibGV0IGd1dGlsID0gcmVxdWlyZSgnZ3VscC11dGlsJylcbmxldCBjID0gZ3V0aWwuY29sb3JzO1xubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuXG5lbnVtIExFVkVMIHtcblx0SU5GTyxcblx0REVCVUcsXG4gICAgRVJST1Jcbn1cblxuY2xhc3MgTG9nZ2VyIHtcblxuXHRuYW1lO1xuXHRsb2dnZXI7XG5cdHZlcnNpb247XG5cdHNpbGVudDtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm5hbWUgPSBwa2cubmFtZTtcblx0XHR0aGlzLnZlcnNpb24gPSBwa2cudmVyc2lvbjtcblx0XHR0aGlzLmxvZ2dlciA9IGd1dGlsLmxvZztcblx0XHR0aGlzLnNpbGVudCA9IHRydWU7XG5cdH1cblxuXHRpbmZvKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLklORk8sIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdGVycm9yKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkVSUk9SLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuXHRkZWJ1ZyguLi5hcmdzKSB7XG5cdFx0aWYoIXRoaXMuc2lsZW50KSByZXR1cm47XG5cdFx0dGhpcy5sb2dnZXIoXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5ERUJVRywgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0cHJpdmF0ZSBmb3JtYXQobGV2ZWwsIC4uLmFyZ3MpIHtcblxuXHRcdGxldCBwYWQgPSAocywgbCwgYz0nJykgPT4ge1xuXHRcdFx0cmV0dXJuIHMgKyBBcnJheSggTWF0aC5tYXgoMCwgbCAtIHMubGVuZ3RoICsgMSkpLmpvaW4oIGMgKVxuXHRcdH07XG5cblx0XHRsZXQgbXNnID0gYXJncy5qb2luKCcgJyk7XG5cdFx0aWYoYXJncy5sZW5ndGggPiAxKSB7XG5cdFx0XHRtc2cgPSBgJHsgcGFkKGFyZ3Muc2hpZnQoKSwgMTUsICcgJykgfTogJHsgYXJncy5qb2luKCcgJykgfWA7XG5cdFx0fVxuXG5cblx0XHRzd2l0Y2gobGV2ZWwpIHtcblx0XHRcdGNhc2UgTEVWRUwuSU5GTzpcblx0XHRcdFx0bXNnID0gYy5ncmVlbihtc2cpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBMRVZFTC5ERUJVRzpcblx0XHRcdFx0bXNnID0gYy5jeWFuKG1zZyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExFVkVMLkVSUk9SOlxuXHRcdFx0XHRtc2cgPSBjLnJlZChtc2cpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gW1xuXHRcdFx0bXNnXG5cdFx0XS5qb2luKCcnKTtcblx0fVxufVxuXG5leHBvcnQgbGV0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbiIsImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxubGV0IEFuZ3VsYXJBUElzID0gcmVxdWlyZSgnLi4vc3JjL2RhdGEvYXBpLWxpc3QuanNvbicpO1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZGVySW5Bbmd1bGFyQVBJcyh0eXBlOiBzdHJpbmcpIHtcbiAgICBsZXQgX3Jlc3VsdCA9IHtcbiAgICAgICAgc291cmNlOiAnZXh0ZXJuYWwnLFxuICAgICAgICBkYXRhOiBudWxsXG4gICAgfTtcblxuICAgIF8uZm9yRWFjaChBbmd1bGFyQVBJcywgZnVuY3Rpb24oYW5ndWxhck1vZHVsZUFQSXMsIGFuZ3VsYXJNb2R1bGUpIHtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gYW5ndWxhck1vZHVsZUFQSXMubGVuZ3RoO1xuICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyTW9kdWxlQVBJc1tpXS50aXRsZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIF9yZXN1bHQuZGF0YSA9IGFuZ3VsYXJNb2R1bGVBUElzW2ldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBfcmVzdWx0O1xufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgeyBmaW5kZXJJbkFuZ3VsYXJBUElzIH0gZnJvbSAnLi4vLi4vdXRpbHMvYW5ndWxhci1hcGknO1xuXG5jbGFzcyBEZXBlbmRlbmNpZXNFbmdpbmUge1xuICAgIHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTpEZXBlbmRlbmNpZXNFbmdpbmUgPSBuZXcgRGVwZW5kZW5jaWVzRW5naW5lKCk7XG4gICAgcmF3RGF0YTogT2JqZWN0O1xuICAgIG1vZHVsZXM6IE9iamVjdFtdO1xuICAgIGNvbXBvbmVudHM6IE9iamVjdFtdO1xuICAgIGRpcmVjdGl2ZXM6IE9iamVjdFtdO1xuICAgIGluamVjdGFibGVzOiBPYmplY3RbXTtcbiAgICBpbnRlcmZhY2VzOiBPYmplY3RbXTtcbiAgICByb3V0ZXM6IE9iamVjdFtdO1xuICAgIHBpcGVzOiBPYmplY3RbXTtcbiAgICBjbGFzc2VzOiBPYmplY3RbXTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYoRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIERlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIERlcGVuZGVuY2llc0VuZ2luZS5faW5zdGFuY2UgPSB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6RGVwZW5kZW5jaWVzRW5naW5lXG4gICAge1xuICAgICAgICByZXR1cm4gRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZTtcbiAgICB9XG4gICAgaW5pdChkYXRhOiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy5yYXdEYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5tb2R1bGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLm1vZHVsZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNvbXBvbmVudHMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmRpcmVjdGl2ZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5pbmplY3RhYmxlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbmplY3RhYmxlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmludGVyZmFjZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuaW50ZXJmYWNlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgodGhpcy5yYXdEYXRhLnJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnBpcGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLnBpcGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuY2xhc3NlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5jbGFzc2VzLCBbJ25hbWUnXSk7XG4gICAgfVxuICAgIGZpbmQodHlwZTogc3RyaW5nKSB7XG4gICAgICAgIGxldCBmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgbGV0IF9yZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ2ludGVybmFsJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKGRhdGFbaV0ubmFtZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIF9yZXN1bHQuZGF0YSA9IGRhdGFbaV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5pbmplY3RhYmxlcyksXG4gICAgICAgICAgICByZXN1bHRJbkNvbXBvZG9jQ2xhc3NlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5jbGFzc2VzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQW5ndWxhckFQSXMgPSBmaW5kZXJJbkFuZ3VsYXJBUElzKHR5cGUpXG5cbiAgICAgICAgaWYgKHJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0luamVjdGFibGVzXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Db21wb2RvY0NsYXNzZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Bbmd1bGFyQVBJcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Bbmd1bGFyQVBJc1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldE1vZHVsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZHVsZXM7XG4gICAgfVxuICAgIGdldENvbXBvbmVudHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHM7XG4gICAgfVxuICAgIGdldERpcmVjdGl2ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXM7XG4gICAgfVxuICAgIGdldEluamVjdGFibGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbmplY3RhYmxlcztcbiAgICB9XG4gICAgZ2V0SW50ZXJmYWNlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlcztcbiAgICB9XG4gICAgZ2V0Um91dGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3V0ZXM7XG4gICAgfVxuICAgIGdldFBpcGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5waXBlcztcbiAgICB9XG4gICAgZ2V0Q2xhc3NlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3NlcztcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgJGRlcGVuZGVuY2llc0VuZ2luZSA9IERlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnN0YW5jZSgpO1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG4vL2ltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnaGFuZGxlYmFycy1oZWxwZXJzJztcbmltcG9ydCB7ICRkZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuXG5leHBvcnQgY2xhc3MgSHRtbEVuZ2luZSB7XG4gICAgY2FjaGU6IE9iamVjdCA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvL1RPRE8gdXNlIHRoaXMgaW5zdGVhZCA6IGh0dHBzOi8vZ2l0aHViLmNvbS9hc3NlbWJsZS9oYW5kbGViYXJzLWhlbHBlcnNcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciggXCJjb21wYXJlXCIsIGZ1bmN0aW9uKGEsIG9wZXJhdG9yLCBiLCBvcHRpb25zKSB7XG4gICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hhbmRsZWJhcnMgSGVscGVyIHt7Y29tcGFyZX19IGV4cGVjdHMgNCBhcmd1bWVudHMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luZGV4b2YnOlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IChiLmluZGV4T2YoYSkgIT09IC0xKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGEgPT09IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSAhPT0gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSA+IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hlbHBlciB7e2NvbXBhcmV9fTogaW52YWxpZCBvcGVyYXRvcjogYCcgKyBvcGVyYXRvciArICdgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImZpbHRlckFuZ3VsYXIyTW9kdWxlc1wiLCBmdW5jdGlvbih0ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBORzJfTU9EVUxFUzpzdHJpbmdbXSA9IFtcbiAgICAgICAgICAgICAgICAnQnJvd3Nlck1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ0Zvcm1zTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnSHR0cE1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ1JvdXRlck1vZHVsZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbGVuID0gTkcyX01PRFVMRVMubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKE5HMl9NT0RVTEVTW2ldKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImRlYnVnXCIsIGZ1bmN0aW9uKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgQ29udGV4dFwiKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgICAgaWYgKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3B0aW9uYWxWYWx1ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25hbFZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdicmVha2xpbmVzJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbih0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICc8YnI+Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2dtLCAnJm5ic3A7Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cdC9nbSwgJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOycpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdicmVha0NvbW1hJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbih0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLywvZywgJyw8YnI+Jyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEhhbmRsZWJhcnMuU2FmZVN0cmluZyh0ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Z1bmN0aW9uU2lnbmF0dXJlJywgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgICAgIHZhciBfcmVzdWx0ID0gJGRlcGVuZGVuY2llc0VuZ2luZS5maW5kKGFyZy50eXBlKTtcbiAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5zb3VyY2UgPT09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gX3Jlc3VsdC5kYXRhLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdjbGFzcycpIHBhdGggPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIuLyR7cGF0aH1zLyR7X3Jlc3VsdC5kYXRhLm5hbWV9Lmh0bWxcIiA+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXRoID0gJ2h0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJyArIF9yZXN1bHQuZGF0YS5wYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfTogPGEgaHJlZj1cIiR7cGF0aH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiA+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5qb2luKCcsICcpO1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZC5uYW1lfSgke2FyZ3N9KWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgKCR7YXJnc30pYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXJldHVybnMtY29tbWVudCcsIGZ1bmN0aW9uKGpzZG9jVGFncywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGpzZG9jVGFncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgcmVzdWx0O1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lLnRleHQgPT09ICdyZXR1cm5zJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdqc2RvYy1wYXJhbXMnLCBmdW5jdGlvbihqc2RvY1RhZ3MsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBqc2RvY1RhZ3MubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHRhZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAncGFyYW0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFnID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uICYmIGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcudHlwZSA9IGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmNvbW1lbnQgPSBqc2RvY1RhZ3NbaV0uY29tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5wYXJhbWV0ZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLm5hbWUgPSBqc2RvY1RhZ3NbaV0ucGFyYW1ldGVyTmFtZS50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xpbmtUeXBlJywgZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIF9yZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmQobmFtZSk7XG4gICAgICAgICAgICBpZiAoX3Jlc3VsdCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmF3OiBuYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdjbGFzcycpIF9yZXN1bHQuZGF0YS50eXBlID0gJ2NsYXNzZSc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS5ocmVmID0gJy4vJyArIF9yZXN1bHQuZGF0YS50eXBlICsgJ3MvJyArIF9yZXN1bHQuZGF0YS5uYW1lICsgJy5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfc2VsZic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSAnaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS8nICsgX3Jlc3VsdC5kYXRhLnBhdGg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZS50YXJnZXQgPSAnX2JsYW5rJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2luZGV4YWJsZVNpZ25hdHVyZScsIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IG1ldGhvZC5hcmdzLm1hcChhcmcgPT4gYCR7YXJnLm5hbWV9OiAke2FyZy50eXBlfWApLmpvaW4oJywgJyk7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9WyR7YXJnc31dYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBbJHthcmdzfV1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignb2JqZWN0JywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHRleHQpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgve1wiLywgJ3s8YnI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCInKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyxcIi8sICcsPGJyPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiJyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC99JC8sICc8YnI+fScpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbml0KCkge1xuICAgICAgICBsZXQgcGFydGlhbHMgPSBbXG4gICAgICAgICAgICAnbWVudScsXG4gICAgICAgICAgICAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgJ3JlYWRtZScsXG4gICAgICAgICAgICAnbW9kdWxlcycsXG4gICAgICAgICAgICAnbW9kdWxlJyxcbiAgICAgICAgICAgICdjb21wb25lbnRzJyxcbiAgICAgICAgICAgICdjb21wb25lbnQnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudC1kZXRhaWwnLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAnaW5qZWN0YWJsZXMnLFxuICAgICAgICAgICAgJ2luamVjdGFibGUnLFxuICAgICAgICAgICAgJ3BpcGVzJyxcbiAgICAgICAgICAgICdwaXBlJyxcbiAgICAgICAgICAgICdjbGFzc2VzJyxcbiAgICAgICAgICAgICdjbGFzcycsXG5cdCAgICAgICAgJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAncm91dGVzJyxcbiAgICAgICAgICAgICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAnc2VhcmNoLWlucHV0JyxcbiAgICAgICAgICAgICdsaW5rLXR5cGUnLFxuICAgICAgICAgICAgJ2Jsb2NrLW1ldGhvZCcsXG4gICAgICAgICAgICAnYmxvY2stcHJvcGVydHknLFxuICAgICAgICAgICAgJ2NvdmVyYWdlLXJlcG9ydCdcbiAgICAgICAgXSxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gcGFydGlhbHMubGVuZ3RoLFxuICAgICAgICAgICAgbG9vcCA9IChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhcnRpYWxzLycgKyBwYXJ0aWFsc1tpXSArICcuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgeyByZWplY3QoKTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwocGFydGlhbHNbaV0sIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbG9vcChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVuZGVyKG1haW5EYXRhOmFueSwgcGFnZTphbnkpIHtcbiAgICAgICAgdmFyIG8gPSBtYWluRGF0YSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICBPYmplY3QuYXNzaWduKG8sIHBhZ2UpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBpZih0aGF0LmNhY2hlWydwYWdlJ10pIHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcGxhdGU6YW55ID0gSGFuZGxlYmFycy5jb21waWxlKHRoYXQuY2FjaGVbJ3BhZ2UnXSksXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG9cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhZ2UuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgaW5kZXggJyArIHBhZ2UubmFtZSArICcgZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVbJ3BhZ2UnXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUoZGF0YSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBtYXJrZWQsIHsgUmVuZGVyZXIgfSBmcm9tICdtYXJrZWQnO1xuaW1wb3J0IGhpZ2hsaWdodGpzIGZyb20gJ2hpZ2hsaWdodC5qcyc7XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93bkVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG4gICAgICAgIHJlbmRlcmVyLmNvZGUgPSAoY29kZSwgbGFuZ3VhZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkTGFuZyA9ICEhKGxhbmd1YWdlICYmIGhpZ2hsaWdodGpzLmdldExhbmd1YWdlKGxhbmd1YWdlKSk7XG4gICAgICAgICAgICBsZXQgaGlnaGxpZ2h0ZWQgPSB2YWxpZExhbmcgPyBoaWdobGlnaHRqcy5oaWdobGlnaHQobGFuZ3VhZ2UsIGNvZGUpLnZhbHVlIDogY29kZTtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID0gaGlnaGxpZ2h0ZWQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJzxicj4nKTtcbiAgICAgICAgICAgIHJldHVybiBgPHByZT48Y29kZSBjbGFzcz1cImhsanMgJHtsYW5ndWFnZX1cIj4ke2hpZ2hsaWdodGVkfTwvY29kZT48L3ByZT5gO1xuICAgICAgICB9O1xuXG4gICAgICAgIG1hcmtlZC5zZXRPcHRpb25zKHsgcmVuZGVyZXIgfSk7XG4gICAgfVxuICAgIGdldFJlYWRtZUZpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgJy9SRUFETUUubWQnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBSRUFETUUubWQgZmlsZSByZWFkaW5nJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXJrZWQoZGF0YSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5cbmV4cG9ydCBjbGFzcyBGaWxlRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgIH1cbiAgICBnZXQoZmlsZXBhdGg6U3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGZpbGVwYXRoKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgJyArIGZpbGVwYXRoICsgJyByZWFkJyk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiZXhwb3J0IGNvbnN0IENPTVBPRE9DX0RFRkFVTFRTID0ge1xuICAgIHRpdGxlOiAnQXBwbGljYXRpb24gZG9jdW1lbnRhdGlvbicsXG4gICAgYWRkaXRpb25hbEVudHJ5TmFtZTogJ0FkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbicsXG4gICAgYWRkaXRpb25hbEVudHJ5UGF0aDogJ2FkZGl0aW9uYWwtZG9jdW1lbnRhdGlvbicsXG4gICAgZm9sZGVyOiAnLi9kb2N1bWVudGF0aW9uLycsXG4gICAgcG9ydDogODA4MCxcbiAgICB0aGVtZTogJ2dpdGJvb2snLFxuICAgIGJhc2U6ICcvJyxcbiAgICBkaXNhYmxlU291cmNlQ29kZTogZmFsc2UsXG4gICAgZGlzYWJsZUdyYXBoOiBmYWxzZSxcbiAgICBkaXNhYmxlQ292ZXJhZ2U6IGZhbHNlXG59XG4iLCJpbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4uL3V0aWxzL2RlZmF1bHRzJztcblxuaW50ZXJmYWNlIFBhZ2Uge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBjb250ZXh0OiBzdHJpbmc7XG4gICAgcGF0aD86IHN0cmluZztcbiAgICBtb2R1bGU/OiBhbnk7XG4gICAgcGlwZT86IGFueTtcbiAgICBjbGFzcz86IGFueTtcbiAgICBpbnRlcmZhY2U/OiBhbnk7XG4gICAgZGlyZWN0aXZlPzogYW55O1xuICAgIGluamVjdGFibGU/OiBhbnk7XG4gICAgZmlsZXM/OiBhbnk7XG4gICAgZGF0YT86IGFueTtcbn1cblxuaW50ZXJmYWNlIElNYWluRGF0YSB7XG4gICAgb3V0cHV0OiBzdHJpbmc7XG4gICAgdGhlbWU6IHN0cmluZztcbiAgICBleHRUaGVtZTogc3RyaW5nO1xuICAgIHNlcnZlOiBib29sZWFuO1xuICAgIHBvcnQ6IG51bWJlcjtcbiAgICBvcGVuOiBib29sZWFuO1xuICAgIGFzc2V0c0ZvbGRlcjogc3RyaW5nO1xuICAgIGRvY3VtZW50YXRpb25NYWluTmFtZTogc3RyaW5nO1xuICAgIGRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb246IHN0cmluZztcbiAgICBiYXNlOiBzdHJpbmc7XG4gICAgaGlkZUdlbmVyYXRvcjogYm9vbGVhbjtcbiAgICBtb2R1bGVzOiBhbnk7XG4gICAgcmVhZG1lOiBzdHJpbmc7XG4gICAgYWRkaXRpb25hbHBhZ2VzOiBPYmplY3Q7XG4gICAgcGlwZXM6IGFueTtcbiAgICBjbGFzc2VzOiBhbnk7XG4gICAgaW50ZXJmYWNlczogYW55O1xuICAgIGNvbXBvbmVudHM6IGFueTtcbiAgICBkaXJlY3RpdmVzOiBhbnk7XG4gICAgaW5qZWN0YWJsZXM6IGFueTtcbiAgICByb3V0ZXM6IGFueTtcbiAgICB0c2NvbmZpZzogc3RyaW5nO1xuICAgIGluY2x1ZGVzOiBib29sZWFuO1xuICAgIGluY2x1ZGVzTmFtZTogc3RyaW5nO1xuICAgIGRpc2FibGVTb3VyY2VDb2RlOiBib29sZWFuO1xuICAgIGRpc2FibGVHcmFwaDogYm9vbGVhbjtcbiAgICBkaXNhYmxlQ292ZXJhZ2U6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbmZpZ3VyYXRpb24ge1xuICAgIG1haW5EYXRhOiBJTWFpbkRhdGE7XG4gICAgcGFnZXM6QXJyYXk8UGFnZT47XG4gICAgYWRkUGFnZShwYWdlOiBQYWdlKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb24gaW1wbGVtZW50cyBJQ29uZmlndXJhdGlvbiB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOkNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbigpO1xuXG4gICAgcHJpdmF0ZSBfcGFnZXM6QXJyYXk8UGFnZT4gPSBbXTtcbiAgICBwcml2YXRlIF9tYWluRGF0YTogSU1haW5EYXRhID0ge1xuICAgICAgICBvdXRwdXQ6IENPTVBPRE9DX0RFRkFVTFRTLmZvbGRlcixcbiAgICAgICAgdGhlbWU6IENPTVBPRE9DX0RFRkFVTFRTLnRoZW1lLFxuICAgICAgICBleHRUaGVtZTogJycsXG4gICAgICAgIHNlcnZlOiBmYWxzZSxcbiAgICAgICAgcG9ydDogQ09NUE9ET0NfREVGQVVMVFMucG9ydCxcbiAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgIGFzc2V0c0ZvbGRlcjogJycsXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluTmFtZTogQ09NUE9ET0NfREVGQVVMVFMudGl0bGUsXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb246ICcnLFxuICAgICAgICBiYXNlOiBDT01QT0RPQ19ERUZBVUxUUy5iYXNlLFxuICAgICAgICBoaWRlR2VuZXJhdG9yOiBmYWxzZSxcbiAgICAgICAgbW9kdWxlczogW10sXG4gICAgICAgIHJlYWRtZTogJycsXG4gICAgICAgIGFkZGl0aW9uYWxwYWdlczoge30sXG4gICAgICAgIHBpcGVzOiBbXSxcbiAgICAgICAgY2xhc3NlczogW10sXG4gICAgICAgIGludGVyZmFjZXM6IFtdLFxuICAgICAgICBjb21wb25lbnRzOiBbXSxcbiAgICAgICAgZGlyZWN0aXZlczogW10sXG4gICAgICAgIGluamVjdGFibGVzOiBbXSxcbiAgICAgICAgcm91dGVzOiBbXSxcbiAgICAgICAgdHNjb25maWc6ICcnLFxuICAgICAgICBpbmNsdWRlczogZmFsc2UsXG4gICAgICAgIGRpc2FibGVTb3VyY2VDb2RlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlU291cmNlQ29kZSxcbiAgICAgICAgZGlzYWJsZUdyYXBoOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlR3JhcGgsXG4gICAgICAgIGRpc2FibGVDb3ZlcmFnZTogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZUNvdmVyYWdlXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZihDb25maWd1cmF0aW9uLl9pbnN0YW5jZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBJbnN0YW50aWF0aW9uIGZhaWxlZDogVXNlIENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSBpbnN0ZWFkIG9mIG5ldy4nKTtcbiAgICAgICAgfVxuICAgICAgICBDb25maWd1cmF0aW9uLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOkNvbmZpZ3VyYXRpb25cbiAgICB7XG4gICAgICAgIHJldHVybiBDb25maWd1cmF0aW9uLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBhZGRQYWdlKHBhZ2U6IFBhZ2UpIHtcbiAgICAgICAgdGhpcy5fcGFnZXMucHVzaChwYWdlKTtcbiAgICB9XG5cbiAgICBnZXQgcGFnZXMoKTpBcnJheTxQYWdlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWdlcztcbiAgICB9XG4gICAgc2V0IHBhZ2VzKHBhZ2VzOkFycmF5PFBhZ2U+KSB7XG4gICAgICAgIHRoaXMuX3BhZ2VzID0gW107XG4gICAgfVxuXG4gICAgZ2V0IG1haW5EYXRhKCk6SU1haW5EYXRhIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21haW5EYXRhO1xuICAgIH1cbiAgICBzZXQgbWFpbkRhdGEoZGF0YTpJTWFpbkRhdGEpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLl9tYWluRGF0YSwgZGF0YSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc0dsb2JhbCgpIHtcbiAgICB2YXIgYmluUGF0aCxcbiAgICAgICAgZ2xvYmFsQmluUGF0aCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGJpblBhdGgpIHJldHVybiBiaW5QYXRoXG5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGhuYW1lcyA9IHByb2Nlc3MuZW52LlBBVEguc3BsaXQocGF0aC5kZWxpbWl0ZXIpXG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IHBhdGhuYW1lcy5sZW5ndGhcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGguYmFzZW5hbWUocGF0aG5hbWVzW2ldKSA9PT0gJ25wbScgfHwgcGF0aC5iYXNlbmFtZShwYXRobmFtZXNbaV0pID09PSAnbm9kZWpzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmluUGF0aCA9IHBhdGhuYW1lc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmluUGF0aCA9IHBhdGguZGlybmFtZShwcm9jZXNzLmV4ZWNQYXRoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYmluUGF0aFxuICAgICAgICB9LFxuICAgICAgICBzdHJpcFRyYWlsaW5nU2VwID0gZnVuY3Rpb24odGhlUGF0aCkge1xuICAgICAgICAgICAgaWYgKHRoZVBhdGhbdGhlUGF0aC5sZW5ndGggLSAxXSA9PT0gcGF0aC5zZXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhlUGF0aC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhlUGF0aDtcbiAgICAgICAgfSxcbiAgICAgICAgcGF0aElzSW5zaWRlID0gZnVuY3Rpb24odGhlUGF0aCwgcG90ZW50aWFsUGFyZW50KSB7XG4gICAgICAgICAgICAvLyBGb3IgaW5zaWRlLWRpcmVjdG9yeSBjaGVja2luZywgd2Ugd2FudCB0byBhbGxvdyB0cmFpbGluZyBzbGFzaGVzLCBzbyBub3JtYWxpemUuXG4gICAgICAgICAgICB0aGVQYXRoID0gc3RyaXBUcmFpbGluZ1NlcCh0aGVQYXRoKTtcbiAgICAgICAgICAgIHBvdGVudGlhbFBhcmVudCA9IHN0cmlwVHJhaWxpbmdTZXAocG90ZW50aWFsUGFyZW50KTtcblxuICAgICAgICAgICAgLy8gTm9kZSB0cmVhdHMgb25seSBXaW5kb3dzIGFzIGNhc2UtaW5zZW5zaXRpdmUgaW4gaXRzIHBhdGggbW9kdWxlOyB3ZSBmb2xsb3cgdGhvc2UgY29udmVudGlvbnMuXG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgICAgICAgICAgdGhlUGF0aCA9IHRoZVBhdGgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBwb3RlbnRpYWxQYXJlbnQgPSBwb3RlbnRpYWxQYXJlbnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoZVBhdGgubGFzdEluZGV4T2YocG90ZW50aWFsUGFyZW50LCAwKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgdGhlUGF0aFtwb3RlbnRpYWxQYXJlbnQubGVuZ3RoXSA9PT0gcGF0aC5zZXAgfHxcbiAgICAgICAgICAgICAgICAgICAgdGhlUGF0aFtwb3RlbnRpYWxQYXJlbnQubGVuZ3RoXSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgaXNQYXRoSW5zaWRlID0gZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgYSA9IHBhdGgucmVzb2x2ZShhKTtcbiAgICAgICAgICAgIGIgPSBwYXRoLnJlc29sdmUoYik7XG5cbiAgICAgICAgICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGF0aElzSW5zaWRlKGEsIGIpO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGlzUGF0aEluc2lkZShwcm9jZXNzLmFyZ3ZbMV0gfHwgJycsIGdsb2JhbEJpblBhdGgoKSB8fCAnJylcbn07XG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgU2hlbGxqcyBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IGlzR2xvYmFsIGZyb20gJy4uLy4uL3V0aWxzL2dsb2JhbC5wYXRoJztcblxuZXhwb3J0IGNsYXNzIE5nZEVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG4gICAgcmVuZGVyR3JhcGgoZmlsZXBhdGg6U3RyaW5nLCBvdXRwdXRwYXRoOiBTdHJpbmcsIHR5cGU6IFN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgIGxldCBuZ2RQYXRoID0gKGlzR2xvYmFsKCkpID8gX19kaXJuYW1lICsgJy8uLi9ub2RlX21vZHVsZXMvLmJpbi9uZ2QnIDogX19kaXJuYW1lICsgJy8uLi8uLi8uYmluL25nZCc7XG4gICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5NT0RFICYmIHByb2Nlc3MuZW52Lk1PREUgPT09ICdURVNUSU5HJykge1xuICAgICAgICAgICAgICAgbmdkUGF0aCA9IF9fZGlybmFtZSArICcvLi4vbm9kZV9tb2R1bGVzLy5iaW4vbmdkJztcbiAgICAgICAgICAgfVxuICAgICAgICAgICBpZiAoLyAvZy50ZXN0KG5nZFBhdGgpKSB7XG4gICAgICAgICAgICAgICBuZ2RQYXRoID0gbmdkUGF0aC5yZXBsYWNlKC8gL2csICdeICcpO1xuICAgICAgICAgICB9XG4gICAgICAgICAgIGxldCBmaW5hbFBhdGggPSBwYXRoLnJlc29sdmUobmdkUGF0aCkgKyAnIC0nICsgdHlwZSArICcgJyArIGZpbGVwYXRoICsgJyAtZCAnICsgb3V0cHV0cGF0aCArICcgLXMgLXQgc3ZnJ1xuICAgICAgICAgICBTaGVsbGpzLmV4ZWMoZmluYWxQYXRoLCB7XG4gICAgICAgICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgICAgICAgfSwgZnVuY3Rpb24oY29kZSwgc3Rkb3V0LCBzdGRlcnIpIHtcbiAgICAgICAgICAgICAgIGlmKGNvZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHJlamVjdChzdGRlcnIpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbmZpZ3VyYXRpb24nO1xuXG5jb25zdCBsdW5yOiBhbnkgPSByZXF1aXJlKCdsdW5yJyksXG4gICAgICBjaGVlcmlvOiBhbnkgPSByZXF1aXJlKCdjaGVlcmlvJyksXG4gICAgICBFbnRpdGllczphbnkgPSByZXF1aXJlKCdodG1sLWVudGl0aWVzJykuQWxsSHRtbEVudGl0aWVzLFxuICAgICAgJGNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCksXG4gICAgICBIdG1sID0gbmV3IEVudGl0aWVzKCk7XG5cbmV4cG9ydCBjbGFzcyBTZWFyY2hFbmdpbmUge1xuICAgIHNlYXJjaEluZGV4OiBhbnk7XG4gICAgZG9jdW1lbnRzU3RvcmU6IE9iamVjdCA9IHt9O1xuICAgIGluZGV4U2l6ZTogbnVtYmVyO1xuICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICBwcml2YXRlIGdldFNlYXJjaEluZGV4KCkge1xuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoSW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5kZXggPSBsdW5yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZigndXJsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZCgndGl0bGUnLCB7IGJvb3N0OiAxMCB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCdib2R5Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hJbmRleDtcbiAgICB9XG4gICAgaW5kZXhQYWdlKHBhZ2UpIHtcbiAgICAgICAgdmFyIHRleHQsXG4gICAgICAgICAgICAkID0gY2hlZXJpby5sb2FkKHBhZ2UucmF3RGF0YSk7XG5cbiAgICAgICAgdGV4dCA9ICQoJy5jb250ZW50JykuaHRtbCgpO1xuICAgICAgICB0ZXh0ID0gSHRtbC5kZWNvZGUodGV4dCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyg8KFtePl0rKT4pL2lnLCAnJyk7XG5cbiAgICAgICAgcGFnZS51cmwgPSBwYWdlLnVybC5yZXBsYWNlKCRjb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCwgJycpO1xuXG4gICAgICAgIHZhciBkb2MgPSB7XG4gICAgICAgICAgICB1cmw6IHBhZ2UudXJsLFxuICAgICAgICAgICAgdGl0bGU6IHBhZ2UuaW5mb3MuY29udGV4dCArICcgLSAnICsgcGFnZS5pbmZvcy5uYW1lLFxuICAgICAgICAgICAgYm9keTogdGV4dFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZG9jdW1lbnRzU3RvcmVbZG9jLnVybF0gPSBkb2M7XG5cbiAgICAgICAgdGhpcy5nZXRTZWFyY2hJbmRleCgpLmFkZChkb2MpO1xuICAgIH1cbiAgICBnZW5lcmF0ZVNlYXJjaEluZGV4SnNvbihvdXRwdXRGb2xkZXIpIHtcbiAgICAgICAgZnMud3JpdGVKc29uKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBvdXRwdXRGb2xkZXIgKyBwYXRoLnNlcCArICdzZWFyY2hfaW5kZXguanNvbicpLCB7XG4gICAgICAgICAgICBpbmRleDogdGhpcy5nZXRTZWFyY2hJbmRleCgpLFxuICAgICAgICAgICAgc3RvcmU6IHRoaXMuZG9jdW1lbnRzU3RvcmVcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgc2VhcmNoIGluZGV4IGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSBcInR5cGVzY3JpcHRcIjtcbmNvbnN0IHRzYW55ID0gdHMgYXMgYW55O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi8yLjEvc3JjL2NvbXBpbGVyL3V0aWxpdGllcy50cyNMMTUwN1xuZXhwb3J0IGZ1bmN0aW9uIGdldEpTRG9jcyhub2RlOiB0cy5Ob2RlKSB7XG4gIHJldHVybiB0c2FueS5nZXRKU0RvY3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbiIsImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcblxuY29uc3QgY2FycmlhZ2VSZXR1cm5MaW5lRmVlZCA9ICdcXHJcXG4nO1xuY29uc3QgbGluZUZlZWQgPSAnXFxuJztcblxuLy8gZ2V0IGRlZmF1bHQgbmV3IGxpbmUgYnJlYWtcbmV4cG9ydCBmdW5jdGlvbiBnZXROZXdMaW5lQ2hhcmFjdGVyKG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyk6IHN0cmluZyB7XG4gICAgaWYgKG9wdGlvbnMubmV3TGluZSA9PT0gdHMuTmV3TGluZUtpbmQuQ2FycmlhZ2VSZXR1cm5MaW5lRmVlZCkge1xuICAgICAgICByZXR1cm4gY2FycmlhZ2VSZXR1cm5MaW5lRmVlZDtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucy5uZXdMaW5lID09PSB0cy5OZXdMaW5lS2luZC5MaW5lRmVlZCkge1xuICAgICAgICByZXR1cm4gbGluZUZlZWQ7XG4gICAgfVxuICAgIHJldHVybiBjYXJyaWFnZVJldHVybkxpbmVGZWVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0SW5kZW50KHN0ciwgY291bnQsIGluZGVudD8pOiBzdHJpbmcge1xuICAgIGxldCBzdHJpcEluZGVudCA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKC9eWyBcXHRdKig/PVxcUykvZ20pO1xuXG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiB1c2Ugc3ByZWFkIG9wZXJhdG9yIHdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgNlxuICAgICAgICBjb25zdCBpbmRlbnQgPSBNYXRoLm1pbi5hcHBseShNYXRoLCBtYXRjaC5tYXAoeCA9PiB4Lmxlbmd0aCkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgXlsgXFxcXHRdeyR7aW5kZW50fX1gLCAnZ20nKTtcblxuICAgICAgICByZXR1cm4gaW5kZW50ID4gMCA/IHN0ci5yZXBsYWNlKHJlLCAnJykgOiBzdHI7XG4gICAgfSxcbiAgICAgICAgcmVwZWF0aW5nID0gZnVuY3Rpb24obiwgc3RyKSB7XG4gICAgICAgIHN0ciA9IHN0ciA9PT0gdW5kZWZpbmVkID8gJyAnIDogc3RyO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobiA8IDAgfHwgIU51bWJlci5pc0Zpbml0ZShuKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBwb3NpdGl2ZSBmaW5pdGUgbnVtYmVyLCBnb3QgXFxgJHtufVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJldCA9ICcnO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xuICAgICAgICAgICAgICAgIHJldCArPSBzdHI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0ciArPSBzdHI7XG4gICAgICAgIH0gd2hpbGUgKChuID4+PSAxKSk7XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIGluZGVudFN0cmluZyA9IGZ1bmN0aW9uKHN0ciwgY291bnQsIGluZGVudCkge1xuICAgICAgICBpbmRlbnQgPSBpbmRlbnQgPT09IHVuZGVmaW5lZCA/ICcgJyA6IGluZGVudDtcbiAgICAgICAgY291bnQgPSBjb3VudCA9PT0gdW5kZWZpbmVkID8gMSA6IGNvdW50O1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGNvdW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBcXGBudW1iZXJcXGAsIGdvdCBcXGAke3R5cGVvZiBjb3VudH1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5kZW50XFxgIHRvIGJlIGEgXFxgc3RyaW5nXFxgLCBnb3QgXFxgJHt0eXBlb2YgaW5kZW50fVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZW50ID0gY291bnQgPiAxID8gcmVwZWF0aW5nKGNvdW50LCBpbmRlbnQpIDogaW5kZW50O1xuXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXig/IVxccyokKS9tZywgaW5kZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5kZW50U3RyaW5nKHN0cmlwSW5kZW50KHN0ciksIGNvdW50IHx8IDAsIGluZGVudCk7XG59XG5cbi8vIENyZWF0ZSBhIGNvbXBpbGVySG9zdCBvYmplY3QgdG8gYWxsb3cgdGhlIGNvbXBpbGVyIHRvIHJlYWQgYW5kIHdyaXRlIGZpbGVzXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnM6IGFueSk6IHRzLkNvbXBpbGVySG9zdCB7XG5cbiAgICBjb25zdCBpbnB1dEZpbGVOYW1lID0gdHJhbnNwaWxlT3B0aW9ucy5maWxlTmFtZSB8fCAodHJhbnNwaWxlT3B0aW9ucy5qc3ggPyAnbW9kdWxlLnRzeCcgOiAnbW9kdWxlLnRzJyk7XG5cbiAgICBjb25zdCBjb21waWxlckhvc3Q6IHRzLkNvbXBpbGVySG9zdCA9IHtcbiAgICAgICAgZ2V0U291cmNlRmlsZTogKGZpbGVOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlsZU5hbWUubGFzdEluZGV4T2YoJy50cycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ2xpYi5kLnRzJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwYXRoLmlzQWJzb2x1dGUoZmlsZU5hbWUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IHBhdGguam9pbih0cmFuc3BpbGVPcHRpb25zLnRzY29uZmlnRGlyZWN0b3J5LCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGxpYlNvdXJjZSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbGliU291cmNlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVOYW1lKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhlLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoZmlsZU5hbWUsIGxpYlNvdXJjZSwgdHJhbnNwaWxlT3B0aW9ucy50YXJnZXQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRlRmlsZTogKG5hbWUsIHRleHQpID0+IHt9LFxuICAgICAgICBnZXREZWZhdWx0TGliRmlsZU5hbWU6ICgpID0+ICdsaWIuZC50cycsXG4gICAgICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXM6ICgpID0+IGZhbHNlLFxuICAgICAgICBnZXRDYW5vbmljYWxGaWxlTmFtZTogZmlsZU5hbWUgPT4gZmlsZU5hbWUsXG4gICAgICAgIGdldEN1cnJlbnREaXJlY3Rvcnk6ICgpID0+ICcnLFxuICAgICAgICBnZXROZXdMaW5lOiAoKSA9PiAnXFxuJyxcbiAgICAgICAgZmlsZUV4aXN0czogKGZpbGVOYW1lKTogYm9vbGVhbiA9PiBmaWxlTmFtZSA9PT0gaW5wdXRGaWxlTmFtZSxcbiAgICAgICAgcmVhZEZpbGU6ICgpID0+ICcnLFxuICAgICAgICBkaXJlY3RvcnlFeGlzdHM6ICgpID0+IHRydWUsXG4gICAgICAgIGdldERpcmVjdG9yaWVzOiAoKSA9PiBbXVxuICAgIH07XG4gICAgcmV0dXJuIGNvbXBpbGVySG9zdDtcbn1cbiIsImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5cbmV4cG9ydCBsZXQgUm91dGVyUGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJvdXRlcyA9IFtdLFxuICAgICAgICBtb2R1bGVzID0gW10sXG4gICAgICAgIG1vZHVsZXNUcmVlLFxuICAgICAgICByb290TW9kdWxlLFxuICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcyA9IFtdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWRkUm91dGU6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICByb3V0ZXMucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICByb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKHJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBhZGRNb2R1bGVXaXRoUm91dGVzOiBmdW5jdGlvbihtb2R1bGVOYW1lLCBtb2R1bGVJbXBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtb2R1bGVOYW1lLFxuICAgICAgICAgICAgICAgIGltcG9ydHNOb2RlOiBtb2R1bGVJbXBvcnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aChtb2R1bGVzV2l0aFJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuICAgICAgICBhZGRNb2R1bGU6IGZ1bmN0aW9uKG1vZHVsZU5hbWU6IHN0cmluZywgbW9kdWxlSW1wb3J0cykge1xuICAgICAgICAgICAgbW9kdWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtb2R1bGVOYW1lLFxuICAgICAgICAgICAgICAgIGltcG9ydHNOb2RlOiBtb2R1bGVJbXBvcnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1vZHVsZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKG1vZHVsZXMsIF8uaXNFcXVhbCksIFsnbmFtZSddKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0Um9vdE1vZHVsZTogZnVuY3Rpb24obW9kdWxlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBtb2R1bGU7XG4gICAgICAgIH0sXG4gICAgICAgIHByaW50Um91dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICB9LFxuICAgICAgICBoYXNSb3V0ZXJNb2R1bGVJbkltcG9ydHM6IGZ1bmN0aW9uKGltcG9ydHMpIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBpbXBvcnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGltcG9ydHNbaV0ubmFtZS5pbmRleE9mKCdSb3V0ZXJNb2R1bGUuZm9yQ2hpbGQnKSAhPT0gLTEgfHxcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JSb290JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgbGlua01vZHVsZXNBbmRSb3V0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9zY2FuIGVhY2ggbW9kdWxlIGltcG9ydHMgQVNUIGZvciBlYWNoIHJvdXRlcywgYW5kIGxpbmsgcm91dGVzIHdpdGggbW9kdWxlXG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbW9kdWxlc1dpdGhSb3V0ZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2gobW9kdWxlc1dpdGhSb3V0ZXNbaV0uaW1wb3J0c05vZGUsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9maW5kIGVsZW1lbnQgd2l0aCBhcmd1bWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZWxlbWVudC5hcmd1bWVudHMsIGZ1bmN0aW9uKGFyZ3VtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJvdXRlcywgZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJndW1lbnQudGV4dCAmJiByb3V0ZS5uYW1lID09PSBhcmd1bWVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5tb2R1bGUgPSBtb2R1bGVzV2l0aFJvdXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnN0cnVjdFJvdXRlc1RyZWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnY29uc3RydWN0Um91dGVzVHJlZScpO1xuICAgICAgICAgICAgLy8gcm91dGVzW10gY29udGFpbnMgcm91dGVzIHdpdGggbW9kdWxlIGxpbmtcbiAgICAgICAgICAgIC8vIG1vZHVsZXNUcmVlIGNvbnRhaW5zIG1vZHVsZXMgdHJlZVxuICAgICAgICAgICAgLy8gbWFrZSBhIGZpbmFsIHJvdXRlcyB0cmVlIHdpdGggdGhhdFxuICAgICAgICAgICAgbGV0IGNsZWFuTW9kdWxlc1RyZWUgPSBfLmNsb25lRGVlcChtb2R1bGVzVHJlZSksXG4gICAgICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIgPSBmdW5jdGlvbihhcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFycltpXS5pbXBvcnRzTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhcnJbaV0uaW1wb3J0c05vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyW2ldLnBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhcnJbaV0ucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJyW2ldLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIoYXJyW2ldLmNoaWxkcmVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kdWxlc0NsZWFuZXIoY2xlYW5Nb2R1bGVzVHJlZSk7XG4gICAgICAgICAgICAvL2ZzLm91dHB1dEpzb24oJy4vbW9kdWxlcy5qc29uJywgY2xlYW5Nb2R1bGVzVHJlZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW5Nb2R1bGVzVHJlZSBsaWdodDogJywgdXRpbC5pbnNwZWN0KGNsZWFuTW9kdWxlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIHZhciByb3V0ZXNUcmVlID0ge1xuICAgICAgICAgICAgICAgIHRhZzogJzxyb290PicsXG4gICAgICAgICAgICAgICAga2luZDogJ25nTW9kdWxlJyxcbiAgICAgICAgICAgICAgICBuYW1lOiByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbGV0IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZSA9IGZ1bmN0aW9uKG1vZHVsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5maW5kKHJvdXRlcywgeydtb2R1bGUnOiBtb2R1bGVOYW1lfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBsb29wTW9kdWxlc1BhcnNlciA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobm9kZS5jaGlsZHJlbltpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5yb3V0ZXMgPSBKU09OLnBhcnNlKHJvdXRlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJvdXRlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5raW5kID0gJ25nTW9kdWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlc1RyZWUuY2hpbGRyZW4ucHVzaChyb3V0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5baV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BNb2R1bGVzUGFyc2VyKG5vZGUuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9vcE1vZHVsZXNQYXJzZXIoXy5maW5kKGNsZWFuTW9kdWxlc1RyZWUsIHsnbmFtZSc6IHJvb3RNb2R1bGV9KSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyb3V0ZXNUcmVlOiAnLCByb3V0ZXNUcmVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcblxuICAgICAgICAgICAgLy9mcy5vdXRwdXRKc29uKCcuL3JvdXRlcy10cmVlLmpzb24nLCByb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgdmFyIGNsZWFuZWRSb3V0ZXNUcmVlO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5Sb3V0ZXNUcmVlID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHJvdXRlLmNoaWxkcmVuW2ldLnJvdXRlcztcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocm91dGVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhbmVkUm91dGVzVHJlZSA9IGNsZWFuUm91dGVzVHJlZShyb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsZWFuZWRSb3V0ZXNUcmVlOiAnLCB1dGlsLmluc3BlY3QoY2xlYW5lZFJvdXRlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29uc3RydWN0TW9kdWxlc1RyZWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IGdldE5lc3RlZENoaWxkcmVuID0gZnVuY3Rpb24oYXJyLCBwYXJlbnQ/KSB7XG4gICAgICAgICAgICAgICAgdmFyIG91dCA9IFtdXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIGFycikge1xuICAgICAgICAgICAgICAgICAgICBpZihhcnJbaV0ucGFyZW50ID09PSBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGdldE5lc3RlZENoaWxkcmVuKGFyciwgYXJyW2ldLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJbaV0uY2hpbGRyZW4gPSBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2goYXJyW2ldKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1NjYW4gZWFjaCBtb2R1bGUgYW5kIGFkZCBwYXJlbnQgcHJvcGVydHlcbiAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihmaXJzdExvb3BNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goZmlyc3RMb29wTW9kdWxlLmltcG9ydHNOb2RlLCBmdW5jdGlvbihpbXBvcnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzLCBmdW5jdGlvbihtb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBtb2R1bGUubmFtZSA9PT0gaW1wb3J0Tm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlLnBhcmVudCA9IGZpcnN0TG9vcE1vZHVsZS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2R1bGVzVHJlZSA9IGdldE5lc3RlZENoaWxkcmVuKG1vZHVsZXMpO1xuICAgICAgICB9XG4gICAgfVxufSkoKTtcbiIsImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5sZXQgY29kZTogc3RyaW5nW10gPSBbXTtcblxuZXhwb3J0IGxldCBnZW4gPSAoZnVuY3Rpb24gKCkge1xuICAgIGxldCB0bXA6IHR5cGVvZiBjb2RlID0gW107XG5cbiAgICByZXR1cm4gKHRva2VuID0gbnVsbCkgPT4ge1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgISB0b2tlbicpO1xuICAgICAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodG9rZW4gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgXFxuJyk7XG4gICAgICAgICAgICBjb2RlLnB1c2godG1wLmpvaW4oJycpKTtcbiAgICAgICAgICAgIHRtcCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29kZS5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29kZTtcbiAgICB9XG59ICgpKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlKG5vZGU6IGFueSkge1xuICAgIGNvZGUgPSBbXTtcbiAgICB2aXNpdEFuZFJlY29nbml6ZShub2RlKTtcbiAgICByZXR1cm4gY29kZS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gdmlzaXRBbmRSZWNvZ25pemUobm9kZTogYW55LCBkZXB0aCA9IDApIHtcbiAgICByZWNvZ25pemUobm9kZSk7XG4gICAgZGVwdGgrKztcbiAgICBub2RlLmdldENoaWxkcmVuKCkuZm9yRWFjaChjID0+IHZpc2l0QW5kUmVjb2duaXplKGMsIGRlcHRoKSk7XG59XG5cbmZ1bmN0aW9uIHJlY29nbml6ZShub2RlOiBhbnkpIHtcblxuICAgIC8vY29uc29sZS5sb2coJ3JlY29nbml6aW5nLi4uJywgdHMuU3ludGF4S2luZFtub2RlLmtpbmQrJyddKTtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GaXJzdExpdGVyYWxUb2tlbjpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGdlbihub2RlLnRleHQpO1xuICAgICAgICAgICAgZ2VuKCdcXFwiJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ltcG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZyb21LZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdmcm9tJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBnZW4oJ2V4cG9ydCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjbGFzcycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRoaXNLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0aGlzJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignY29uc3RydWN0b3InKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GYWxzZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2ZhbHNlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCd0cnVlJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdudWxsJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXRUb2tlbjpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgZ2VuKCcrJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW46XG4gICAgICAgICAgICBnZW4oJyA9PiAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKCcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydENsYXVzZTpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgZ2VuKCd7Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmxvY2s6XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFjZVRva2VuOlxuICAgICAgICAgICAgZ2VuKCd9Jyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlUGFyZW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignKScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PcGVuQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCdbJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsb3NlQnJhY2tldFRva2VuOlxuICAgICAgICAgICAgZ2VuKCddJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2VtaWNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJzsnKTtcbiAgICAgICAgICAgIGdlbignXFxuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbW1hVG9rZW46XG4gICAgICAgICAgICBnZW4oJywnKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db2xvblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBnZW4oJzonKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb3RUb2tlbjpcbiAgICAgICAgICAgIGdlbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Eb1N0YXRlbWVudDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRGVjb3JhdG9yOlxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudDpcbiAgICAgICAgICAgIGdlbignID0gJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0UHVuY3R1YXRpb246XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHJpdmF0ZScpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3B1YmxpYycpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIF90cyBmcm9tICcuLi8uLi91dGlscy90cy1pbnRlcm5hbCc7XG5pbXBvcnQgbWFya2VkIGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgeyBnZXROZXdMaW5lQ2hhcmFjdGVyLCBjb21waWxlckhvc3QsIGQsIGRldGVjdEluZGVudCB9IGZyb20gJy4uLy4uL3V0aWxpdGllcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuaW1wb3J0IHsgUm91dGVyUGFyc2VyIH0gZnJvbSAnLi4vLi4vdXRpbHMvcm91dGVyLnBhcnNlcic7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gJy4vY29kZWdlbic7XG5cbmludGVyZmFjZSBOb2RlT2JqZWN0IHtcbiAgICBraW5kOiBOdW1iZXI7XG4gICAgcG9zOiBOdW1iZXI7XG4gICAgZW5kOiBOdW1iZXI7XG4gICAgdGV4dDogc3RyaW5nO1xuICAgIGluaXRpYWxpemVyOiBOb2RlT2JqZWN0LFxuICAgIG5hbWU/OiB7IHRleHQ6IHN0cmluZyB9O1xuICAgIGV4cHJlc3Npb24/OiBOb2RlT2JqZWN0O1xuICAgIGVsZW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIGFyZ3VtZW50cz86IE5vZGVPYmplY3RbXTtcbiAgICBwcm9wZXJ0aWVzPzogYW55W107XG4gICAgcGFyc2VyQ29udGV4dEZsYWdzPzogTnVtYmVyO1xuICAgIGVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4/OiBOb2RlT2JqZWN0W107XG4gICAgcGFyYW1ldGVycz86IE5vZGVPYmplY3RbXTtcbiAgICBDb21wb25lbnQ/OiBTdHJpbmc7XG4gICAgYm9keT86IHtcbiAgICAgICAgcG9zOiBOdW1iZXI7XG4gICAgICAgIGVuZDogTnVtYmVyO1xuICAgICAgICBzdGF0ZW1lbnRzOiBOb2RlT2JqZWN0W107XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgRGVwcyB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBsYWJlbD86IHN0cmluZztcbiAgICBmaWxlPzogc3RyaW5nO1xuICAgIHNvdXJjZUNvZGU/OiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cbiAgICAvL0NvbXBvbmVudFxuXG4gICAgYW5pbWF0aW9ucz86IHN0cmluZ1tdOyAvLyBUT0RPXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogc3RyaW5nO1xuICAgIGVuY2Fwc3VsYXRpb24/OiBzdHJpbmc7XG4gICAgZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPXG4gICAgZXhwb3J0QXM/OiBzdHJpbmc7XG4gICAgaG9zdD86IHN0cmluZztcbiAgICBpbnB1dHM/OiBzdHJpbmdbXTtcbiAgICBpbnRlcnBvbGF0aW9uPzogc3RyaW5nOyAvLyBUT0RPXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmc7XG4gICAgb3V0cHV0cz86IHN0cmluZ1tdO1xuICAgIHF1ZXJpZXM/OiBEZXBzW107IC8vIFRPRE9cbiAgICBzZWxlY3Rvcj86IHN0cmluZztcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXTtcbiAgICBzdHlsZXM/OiBzdHJpbmdbXTtcbiAgICB0ZW1wbGF0ZT86IHN0cmluZztcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZ1tdO1xuICAgIHZpZXdQcm92aWRlcnM/OiBzdHJpbmdbXTtcblxuICAgIGlucHV0c0NsYXNzPzogT2JqZWN0W107XG5cbiAgICAvL2NvbW1vblxuICAgIHByb3ZpZGVycz86IERlcHNbXTtcblxuICAgIC8vbW9kdWxlXG4gICAgZGVjbGFyYXRpb25zPzogRGVwc1tdO1xuICAgIGJvb3RzdHJhcD86IERlcHNbXTtcblxuICAgIGltcG9ydHM/OiBEZXBzW107XG4gICAgZXhwb3J0cz86IERlcHNbXTtcbn1cblxuaW50ZXJmYWNlIFN5bWJvbERlcHMge1xuICAgIGZ1bGw6IHN0cmluZztcbiAgICBhbGlhczogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzIHtcblxuICAgIHByaXZhdGUgZmlsZXM6IHN0cmluZ1tdO1xuICAgIHByaXZhdGUgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgICBwcml2YXRlIHByb2dyYW1Db21wb25lbnQ6IHRzLlByb2dyYW07XG4gICAgcHJpdmF0ZSB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXI7XG4gICAgcHJpdmF0ZSB0eXBlQ2hlY2tlckNvbXBvbmVudDogdHMuVHlwZUNoZWNrZXI7XG4gICAgcHJpdmF0ZSBlbmdpbmU6IGFueTtcbiAgICBwcml2YXRlIF9fY2FjaGU6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgX19uc01vZHVsZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSB1bmtub3duID0gJz8/Pyc7XG5cbiAgICBjb25zdHJ1Y3RvcihmaWxlczogc3RyaW5nW10sIG9wdGlvbnM6IGFueSkge1xuICAgICAgICB0aGlzLmZpbGVzID0gZmlsZXM7XG4gICAgICAgIGNvbnN0IHRyYW5zcGlsZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRzLlNjcmlwdFRhcmdldC5FUzUsXG4gICAgICAgICAgICBtb2R1bGU6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXG4gICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogb3B0aW9ucy50c2NvbmZpZ0RpcmVjdG9yeVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHRoaXMuZmlsZXMsIHRyYW5zcGlsZU9wdGlvbnMsIGNvbXBpbGVySG9zdCh0cmFuc3BpbGVPcHRpb25zKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBicmVha0xpbmVzKHRleHQpIHtcbiAgICAgICAgdmFyIF90ID0gdGV4dDtcbiAgICAgICAgaWYgKHR5cGVvZiBfdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIF90ID0gX3QucmVwbGFjZSgvKFxcbikvZ20sICc8YnI+Jyk7XG4gICAgICAgICAgICBfdCA9IF90LnJlcGxhY2UoLyg8YnI+KSQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Q7XG4gICAgfVxuXG4gICAgZ2V0RGVwZW5kZW5jaWVzKCkge1xuICAgICAgICBsZXQgZGVwczogT2JqZWN0ID0ge1xuICAgICAgICAgICAgJ21vZHVsZXMnOiBbXSxcbiAgICAgICAgICAgICdjb21wb25lbnRzJzogW10sXG4gICAgICAgICAgICAnaW5qZWN0YWJsZXMnOiBbXSxcbiAgICAgICAgICAgICdwaXBlcyc6IFtdLFxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnOiBbXSxcbiAgICAgICAgICAgICdyb3V0ZXMnOiBbXSxcbiAgICAgICAgICAgICdjbGFzc2VzJzogW10sXG4gICAgICAgICAgICAnaW50ZXJmYWNlcyc6IFtdXG4gICAgICAgIH07XG4gICAgICAgIGxldCBzb3VyY2VGaWxlcyA9IHRoaXMucHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpIHx8IFtdO1xuXG4gICAgICAgIHNvdXJjZUZpbGVzLm1hcCgoZmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgZmlsZVBhdGggPSBmaWxlLmZpbGVOYW1lO1xuXG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT0gJy50cycpIHtcblxuICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aC5sYXN0SW5kZXhPZignLmQudHMnKSA9PT0gLTEgJiYgZmlsZVBhdGgubGFzdEluZGV4T2YoJ3NwZWMudHMnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhcnNpbmcnLCBmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U291cmNlRmlsZURlY29yYXRvcnMoZmlsZSwgZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlLCBmaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGVwcztcblxuICAgICAgICB9KTtcblxuICAgICAgICAvL1JvdXRlclBhcnNlci5saW5rTW9kdWxlc0FuZFJvdXRlcygpO1xuICAgICAgICAvL1JvdXRlclBhcnNlci5jb25zdHJ1Y3RNb2R1bGVzVHJlZSgpO1xuICAgICAgICAvL1JvdXRlclBhcnNlci5jb25zdHJ1Y3RSb3V0ZXNUcmVlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRlcHM7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGdldFNvdXJjZUZpbGVEZWNvcmF0b3JzKHNyY0ZpbGU6IHRzLlNvdXJjZUZpbGUsIG91dHB1dFN5bWJvbHM6IE9iamVjdCk6IHZvaWQge1xuXG4gICAgICAgIGxldCBjbGVhbmVyID0gKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICBsZXQgZmlsZSA9IHNyY0ZpbGUuZmlsZU5hbWUucmVwbGFjZShjbGVhbmVyLCAnJyk7XG5cbiAgICAgICAgdGhpcy5wcm9ncmFtQ29tcG9uZW50ID0gdHMuY3JlYXRlUHJvZ3JhbShbZmlsZV0sIHt9KTtcbiAgICAgICAgbGV0IHNvdXJjZUZpbGUgPSB0aGlzLnByb2dyYW1Db21wb25lbnQuZ2V0U291cmNlRmlsZShmaWxlKTtcbiAgICAgICAgdGhpcy50eXBlQ2hlY2tlckNvbXBvbmVudCA9IHRoaXMucHJvZ3JhbUNvbXBvbmVudC5nZXRUeXBlQ2hlY2tlcih0cnVlKTtcblxuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQoc3JjRmlsZSwgKG5vZGU6IHRzLk5vZGUpID0+IHtcblxuICAgICAgICAgICAgbGV0IGRlcHM6IERlcHMgPSA8RGVwcz57fTtcbiAgICAgICAgICAgIGlmIChub2RlLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmlzaXROb2RlID0gKHZpc2l0ZWROb2RlLCBpbmRleCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXRhZGF0YSA9IG5vZGUuZGVjb3JhdG9ycy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLmZpbmRQcm9wcyh2aXNpdGVkTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q29tcG9uZW50SU8oZmlsZSwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNNb2R1bGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IHRoaXMuZ2V0TW9kdWxlRGVjbGF0aW9ucyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0czogdGhpcy5nZXRNb2R1bGVJbXBvcnRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRzOiB0aGlzLmdldE1vZHVsZUV4cG9ydHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvb3RzdHJhcDogdGhpcy5nZXRNb2R1bGVCb290c3RyYXAocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdtb2R1bGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJvdXRlclBhcnNlci5oYXNSb3V0ZXJNb2R1bGVJbkltcG9ydHMoZGVwcy5pbXBvcnRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5hZGRNb2R1bGVXaXRoUm91dGVzKG5hbWUsIHRoaXMuZ2V0TW9kdWxlSW1wb3J0c1Jhdyhwcm9wcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZE1vZHVsZShuYW1lLCBkZXBzLmltcG9ydHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snbW9kdWxlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0NvbXBvbmVudChtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHByb3BzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh1dGlsLmluc3BlY3QocHJvcHMsIHsgc2hvd0hpZGRlbjogdHJ1ZSwgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYW5pbWF0aW9ucz86IHN0cmluZ1tdOyAvLyBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiB0aGlzLmdldENvbXBvbmVudENoYW5nZURldGVjdGlvbihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jYXBzdWxhdGlvbjogdGhpcy5nZXRDb21wb25lbnRFbmNhcHN1bGF0aW9uKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2VudHJ5Q29tcG9uZW50cz86IHN0cmluZzsgLy8gVE9ETyB3YWl0aW5nIGRvYyBpbmZvc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzOiB0aGlzLmdldENvbXBvbmVudEV4cG9ydEFzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0OiB0aGlzLmdldENvbXBvbmVudEhvc3QocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogdGhpcy5nZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YShwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pbnRlcnBvbGF0aW9uPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSWQ6IHRoaXMuZ2V0Q29tcG9uZW50TW9kdWxlSWQocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IHRoaXMuZ2V0Q29tcG9uZW50T3V0cHV0cyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiB0aGlzLmdldENvbXBvbmVudFByb3ZpZGVycyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9xdWVyaWVzPzogRGVwc1tdOyAvLyBUT0RPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHRoaXMuZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlVXJsczogdGhpcy5nZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlczogdGhpcy5nZXRDb21wb25lbnRTdHlsZXMocHJvcHMpLCAvLyBUT0RPIGZpeCBhcmdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZ2V0Q29tcG9uZW50VGVtcGxhdGUocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiB0aGlzLmdldENvbXBvbmVudFRlbXBsYXRlVXJsKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzOiB0aGlzLmdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0NsYXNzOiBJTy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0c0NsYXNzOiBJTy5vdXRwdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNDbGFzczogSU8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzQ2xhc3M6IElPLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjb21wb25lbnRzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzSW5qZWN0YWJsZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbmplY3RhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IElPLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydpbmplY3RhYmxlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc1BpcGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGlwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydwaXBlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0RpcmVjdGl2ZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkaXJlY3RpdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snZGlyZWN0aXZlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX19jYWNoZVtuYW1lXSA9IGRlcHM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGZpbHRlckJ5RGVjb3JhdG9ycyA9IChub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24gJiYgbm9kZS5leHByZXNzaW9uLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAvKE5nTW9kdWxlfENvbXBvbmVudHxJbmplY3RhYmxlfFBpcGV8RGlyZWN0aXZlKS8udGVzdChub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgbm9kZS5kZWNvcmF0b3JzXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZmlsdGVyQnlEZWNvcmF0b3JzKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCh2aXNpdE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLnN5bWJvbC5mbGFncyA9PT0gdHMuU3ltYm9sRmxhZ3MuQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENvbXBvbmVudElPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IHRoaXMuYnJlYWtMaW5lcyhJTy5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ubWV0aG9kcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5tZXRob2RzID0gSU8ubWV0aG9kcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydjbGFzc2VzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYobm9kZS5zeW1ib2wuZmxhZ3MgPT09IHRzLlN5bWJvbEZsYWdzLkludGVyZmFjZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0SW50ZXJmYWNlSU8oZmlsZSwgc291cmNlRmlsZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnRlcmZhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc291cmNlRmlsZS5nZXRUZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5raW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmtpbmQgPSBJTy5raW5kO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gdGhpcy5icmVha0xpbmVzKElPLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2ludGVyZmFjZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRSb3V0ZUlPKGZpbGUsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgIGlmKElPLnJvdXRlcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Um91dGVzO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Um91dGVzID0gSlNPTi5wYXJzZShJTy5yb3V0ZXMucmVwbGFjZSgvIC9nbSwgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdSb3V0ZXMgcGFyc2luZyBlcnJvciwgbWF5YmUgYSB0cmFpbGluZyBjb21tYSBvciBhbiBleHRlcm5hbCB2YXJpYWJsZSA/Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydyb3V0ZXMnXSA9IFsuLi5vdXRwdXRTeW1ib2xzWydyb3V0ZXMnXSwgLi4ubmV3Um91dGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRDb21wb25lbnRJTyhmaWxlLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNvdXJjZUZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMucHJvcGVydGllcyA9IElPLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSB0aGlzLmJyZWFrTGluZXMoSU8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snY2xhc3NlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgdGhlIHJvb3QgbW9kdWxlIHdpdGggYm9vdHN0cmFwTW9kdWxlIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgLy9GaW5kIHJlY3VzaXZlbHkgaW4gZXhwcmVzc2lvbiBub2RlcyBvbmUgd2l0aCBuYW1lICdib290c3RyYXBNb2R1bGUnXG4gICAgICAgICAgICAgICAgICAgIGxldCByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZSA9IHRoaXMuZmluZEV4cHJlc3Npb25CeU5hbWUobm9kZSwgJ2Jvb3RzdHJhcE1vZHVsZScpO1xuICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyZXN1bHROb2RlLmFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJlc3VsdE5vZGUuYXJndW1lbnRzLCBmdW5jdGlvbihhcmd1bWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290TW9kdWxlID0gYXJndW1lbnQudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuc2V0Um9vdE1vZHVsZShyb290TW9kdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG4gICAgcHJpdmF0ZSBkZWJ1ZyhkZXBzOiBEZXBzKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnZGVidWcnLCBgJHtkZXBzLm5hbWV9OmApO1xuICAgICAgICBbXG4gICAgICAgICAgICAnaW1wb3J0cycsICdleHBvcnRzJywgJ2RlY2xhcmF0aW9ucycsICdwcm92aWRlcnMnLCAnYm9vdHN0cmFwJ1xuICAgICAgICBdLmZvckVhY2goc3ltYm9scyA9PiB7XG4gICAgICAgICAgICBpZiAoZGVwc1tzeW1ib2xzXSAmJiBkZXBzW3N5bWJvbHNdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJycsIGAtICR7c3ltYm9sc306YCk7XG4gICAgICAgICAgICAgICAgZGVwc1tzeW1ib2xzXS5tYXAoaSA9PiBpLm5hbWUpLmZvckVhY2goZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnJywgYFxcdC0gJHtkfWApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZEV4cHJlc3Npb25CeU5hbWUoZW50cnlOb2RlLCBuYW1lKSB7XG4gICAgICAgIGxldCByZXN1bHQsXG4gICAgICAgICAgICBsb29wID0gZnVuY3Rpb24obm9kZSwgbmFtZSkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbiAmJiAhbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcChub2RlLmV4cHJlc3Npb24sIG5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24gJiYgbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uLm5hbWUudGV4dCA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgbG9vcChlbnRyeU5vZGUsIG5hbWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNDb21wb25lbnQobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnQ29tcG9uZW50JztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUGlwZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdQaXBlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzRGlyZWN0aXZlKG1ldGFkYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ0RpcmVjdGl2ZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0luamVjdGFibGUobWV0YWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnSW5qZWN0YWJsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc01vZHVsZShtZXRhZGF0YSkge1xuICAgICAgICByZXR1cm4gbWV0YWRhdGEuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdOZ01vZHVsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUeXBlKG5hbWUpIHtcbiAgICAgICAgbGV0IHR5cGU7XG4gICAgICAgIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY29tcG9uZW50JykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdjb21wb25lbnQnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdwaXBlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdwaXBlJztcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignbW9kdWxlJykgIT09IC0xICkge1xuICAgICAgICAgICAgdHlwZSA9ICdtb2R1bGUnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdkaXJlY3RpdmUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ2RpcmVjdGl2ZSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xlTmFtZShub2RlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzZWxlY3RvcicpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RXhwb3J0QXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRBcycpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAncHJvdmlkZXJzJykubWFwKChwcm92aWRlck5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKHByb3ZpZGVyTmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZFByb3BzKHZpc2l0ZWROb2RlKSB7XG4gICAgICAgIGlmKHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2aXNpdGVkTm9kZS5leHByZXNzaW9uLmFyZ3VtZW50cy5wb3AoKS5wcm9wZXJ0aWVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVEZWNsYXRpb25zKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZGVjbGFyYXRpb25zJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5maW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzUmF3KHByb3BzLCAnaW1wb3J0cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlSW1wb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2ltcG9ydHMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUV4cG9ydHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRIb3N0KHByb3BzOiBOb2RlT2JqZWN0W10pOiBPYmplY3Qge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzLCAnaG9zdCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlQm9vdHN0cmFwKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnYm9vdHN0cmFwJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRJbnB1dHNNZXRhZGF0YShwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW5wdXRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXREZWNvcmF0b3JPZlR5cGUobm9kZSwgZGVjb3JhdG9yVHlwZSkge1xuICAgICAgdmFyIGRlY29yYXRvcnMgPSBub2RlLmRlY29yYXRvcnMgfHwgW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZGVjb3JhdG9yc1tpXS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gZGVjb3JhdG9yVHlwZSkge1xuICAgICAgICAgIHJldHVybiBkZWNvcmF0b3JzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRJbnB1dChwcm9wZXJ0eSwgaW5EZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGluQXJncyA9IGluRGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogaW5BcmdzLmxlbmd0aCA/IGluQXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5KSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRUeXBlKG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIG5vZGUgPyB0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50LnR5cGVUb1N0cmluZyh0aGlzLnR5cGVDaGVja2VyQ29tcG9uZW50LmdldFR5cGVBdExvY2F0aW9uKG5vZGUpKSA6ICd2b2lkJztcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0T3V0cHV0KHByb3BlcnR5LCBvdXREZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG91dEFyZ3MgPSBvdXREZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBvdXRBcmdzLmxlbmd0aCA/IG91dEFyZ3NbMF0udGV4dCA6IHByb3BlcnR5Lm5hbWUudGV4dCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5LnR5cGUudHlwZUFyZ3VtZW50c1swXSlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUHVibGljKG1lbWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAobWVtYmVyLm1vZGlmaWVycykge1xuICAgICAgICAgICAgY29uc3QgaXNQdWJsaWM6IGJvb2xlYW4gPSBtZW1iZXIubW9kaWZpZXJzLnNvbWUoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5QdWJsaWNLZXl3b3JkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaXNQdWJsaWMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pc0ludGVybmFsTWVtYmVyKG1lbWJlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ByaXZhdGVPckludGVybmFsKG1lbWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBpZiAobWVtYmVyLm1vZGlmaWVycykge1xuICAgICAgICAgICAgY29uc3QgaXNQcml2YXRlOiBib29sZWFuID0gbWVtYmVyLm1vZGlmaWVycy5zb21lKG1vZGlmaWVyID0+IG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJpdmF0ZUtleXdvcmQpO1xuICAgICAgICAgICAgaWYgKGlzUHJpdmF0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW50ZXJuYWxNZW1iZXIobWVtYmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSW50ZXJuYWxNZW1iZXIobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGludGVybmFsVGFnczogc3RyaW5nW10gPSBbJ2ludGVybmFsJywgJ3ByaXZhdGUnLCAnaGlkZGVuJ107XG4gICAgICAgIGlmIChtZW1iZXIuanNEb2MpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZG9jIG9mIG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgICAgIGlmIChkb2MudGFncykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBkb2MudGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsVGFncy5pbmRleE9mKHRhZy50YWdOYW1lLnRleHQpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0FuZ3VsYXJMaWZlY3ljbGVIb29rKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUyA9IFtcbiAgICAgICAgICAgICduZ09uSW5pdCcsICduZ09uQ2hhbmdlcycsICduZ0RvQ2hlY2snLCAnbmdPbkRlc3Ryb3knLCAnbmdBZnRlckNvbnRlbnRJbml0JywgJ25nQWZ0ZXJDb250ZW50Q2hlY2tlZCcsXG4gICAgICAgICAgICAnbmdBZnRlclZpZXdJbml0JywgJ25nQWZ0ZXJWaWV3Q2hlY2tlZCcsICd3cml0ZVZhbHVlJywgJ3JlZ2lzdGVyT25DaGFuZ2UnLCAncmVnaXN0ZXJPblRvdWNoZWQnLCAnc2V0RGlzYWJsZWRTdGF0ZSdcbiAgICAgICAgXTtcbiAgICAgICAgcmV0dXJuIEFOR1VMQVJfTElGRUNZQ0xFX01FVEhPRFMuaW5kZXhPZihtZXRob2ROYW1lKSA+PSAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDb25zdHJ1Y3RvckRlY2xhcmF0aW9uKG1ldGhvZCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlmIChtZXRob2QucGFyYW1ldGVycykge1xuICAgICAgICAgICAgdmFyIF9wYXJhbWV0ZXJzID0gW10sXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbWV0aG9kLnBhcmFtZXRlcnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LmlzUHVibGljKG1ldGhvZC5wYXJhbWV0ZXJzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBfcGFyYW1ldGVycy5wdXNoKHRoYXQudmlzaXRBcmd1bWVudChtZXRob2QucGFyYW1ldGVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcGFyYW1ldGVycztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDYWxsRGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKG1ldGhvZC5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpLFxuICAgICAgICAgICAgYXJnczogbWV0aG9kLnBhcmFtZXRlcnMgPyBtZXRob2QucGFyYW1ldGVycy5tYXAoKHByb3ApID0+IHRoaXMudmlzaXRBcmd1bWVudChwcm9wKSkgOiBbXSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHRoaXMudmlzaXRUeXBlKG1ldGhvZC50eXBlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEluZGV4RGVjbGFyYXRpb24obWV0aG9kKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKG1ldGhvZC5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpLFxuICAgICAgICAgICAgYXJnczogbWV0aG9kLnBhcmFtZXRlcnMgPyBtZXRob2QucGFyYW1ldGVycy5tYXAoKHByb3ApID0+IHRoaXMudmlzaXRBcmd1bWVudChwcm9wKSkgOiBbXSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHRoaXMudmlzaXRUeXBlKG1ldGhvZC50eXBlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdE1ldGhvZERlY2xhcmF0aW9uKG1ldGhvZCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgbmFtZTogbWV0aG9kLm5hbWUudGV4dCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSksXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpXG4gICAgICAgIH0sXG4gICAgICAgICAgICBqc2RvY3RhZ3MgPSBfdHMuZ2V0SlNEb2NzKG1ldGhvZCk7XG4gICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0ganNkb2N0YWdzWzBdLnRhZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0QXJndW1lbnQoYXJnKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBhcmcubmFtZS50ZXh0LFxuICAgICAgICAgICAgdHlwZTogdGhpcy52aXNpdFR5cGUoYXJnKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXROYW1lc0NvbXBhcmVGbihuYW1lKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIG5hbWUgPSBuYW1lIHx8ICduYW1lJztcbiAgICAgICAgcmV0dXJuIChhLCBiKSA9PiBhW25hbWVdLmxvY2FsZUNvbXBhcmUoYltuYW1lXSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdHJpbmdpZnlEZWZhdWx0VmFsdWUobm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBpZiAobm9kZS50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS50ZXh0O1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5GYWxzZUtleXdvcmQpIHtcbiAgICAgICAgICAgIHJldHVybiAnZmFsc2UnO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZCkge1xuICAgICAgICAgICAgcmV0dXJuICd0cnVlJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5KSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRNZW1iZXJzKG1lbWJlcnMpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGlucHV0cyA9IFtdO1xuICAgICAgICB2YXIgb3V0cHV0cyA9IFtdO1xuICAgICAgICB2YXIgbWV0aG9kcyA9IFtdO1xuICAgICAgICB2YXIgcHJvcGVydGllcyA9IFtdO1xuICAgICAgICB2YXIga2luZDtcbiAgICAgICAgdmFyIGlucHV0RGVjb3JhdG9yLCBvdXREZWNvcmF0b3I7XG5cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lbWJlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlucHV0RGVjb3JhdG9yID0gdGhpcy5nZXREZWNvcmF0b3JPZlR5cGUobWVtYmVyc1tpXSwgJ0lucHV0Jyk7XG4gICAgICAgICAgICBvdXREZWNvcmF0b3IgPSB0aGlzLmdldERlY29yYXRvck9mVHlwZShtZW1iZXJzW2ldLCAnT3V0cHV0Jyk7XG5cbiAgICAgICAgICAgIGtpbmQgPSBtZW1iZXJzW2ldLmtpbmQ7XG5cbiAgICAgICAgICAgIGlmIChpbnB1dERlY29yYXRvcikge1xuICAgICAgICAgICAgICAgIGlucHV0cy5wdXNoKHRoaXMudmlzaXRJbnB1dChtZW1iZXJzW2ldLCBpbnB1dERlY29yYXRvcikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvdXREZWNvcmF0b3IpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRzLnB1c2godGhpcy52aXNpdE91dHB1dChtZW1iZXJzW2ldLCBvdXREZWNvcmF0b3IpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNQcml2YXRlT3JJbnRlcm5hbChtZW1iZXJzW2ldKSkge1xuICAgICAgICAgICAgICAgIGlmICgobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2RTaWduYXR1cmUpICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmlzQW5ndWxhckxpZmVjeWNsZUhvb2sobWVtYmVyc1tpXS5uYW1lLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucHVzaCh0aGlzLnZpc2l0TWV0aG9kRGVjbGFyYXRpb24obWVtYmVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eVNpZ25hdHVyZSB8fCBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuR2V0QWNjZXNzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKHRoaXMudmlzaXRQcm9wZXJ0eShtZW1iZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2FsbFNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdENhbGxEZWNsYXJhdGlvbihtZW1iZXJzW2ldKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW5kZXhTaWduYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKHRoaXMudmlzaXRJbmRleERlY2xhcmF0aW9uKG1lbWJlcnNbaV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Db25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgX2NvbnN0cnVjdG9yUHJvcGVydGllcyA9IHRoaXMudmlzaXRDb25zdHJ1Y3RvckRlY2xhcmF0aW9uKG1lbWJlcnNbaV0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgaiA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW4gPSBfY29uc3RydWN0b3JQcm9wZXJ0aWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGo7IGo8bGVuOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaChfY29uc3RydWN0b3JQcm9wZXJ0aWVzW2pdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlucHV0cy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG4gICAgICAgIG91dHB1dHMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuICAgICAgICBwcm9wZXJ0aWVzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5wdXRzLFxuICAgICAgICAgICAgb3V0cHV0cyxcbiAgICAgICAgICAgIG1ldGhvZHMsXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICAgICAga2luZFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXREaXJlY3RpdmVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgdmFyIGV4cG9ydEFzO1xuICAgICAgICB2YXIgcHJvcGVydGllcyA9IGRlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50c1swXS5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHByb3BlcnRpZXNbaV0ubmFtZS50ZXh0ID09PSAnc2VsZWN0b3InKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIG9ubHkgd29yayBpZiBzZWxlY3RvciBpcyBpbml0aWFsaXplZCBhcyBhIHN0cmluZyBsaXRlcmFsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBwcm9wZXJ0aWVzW2ldLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJvcGVydGllc1tpXS5uYW1lLnRleHQgPT09ICdleHBvcnRBcycpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgb25seSB3b3JrIGlmIHNlbGVjdG9yIGlzIGluaXRpYWxpemVkIGFzIGEgc3RyaW5nIGxpdGVyYWxcbiAgICAgICAgICAgICAgICBleHBvcnRBcyA9IHByb3BlcnRpZXNbaV0uaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICAgIGV4cG9ydEFzXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1BpcGVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgICByZXR1cm4gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnUGlwZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc01vZHVsZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgIHJldHVybiBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdOZ01vZHVsZSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0RpcmVjdGl2ZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGRlY29yYXRvcklkZW50aWZpZXJUZXh0ID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0O1xuICAgICAgICByZXR1cm4gZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPT09ICdEaXJlY3RpdmUnIHx8IGRlY29yYXRvcklkZW50aWZpZXJUZXh0ID09PSAnQ29tcG9uZW50JztcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzU2VydmljZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgIHJldHVybiBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdJbmplY3RhYmxlJztcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0Q2xhc3NEZWNsYXJhdGlvbihmaWxlTmFtZSwgY2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc3ltYm9sID0gdGhpcy5wcm9ncmFtLmdldFR5cGVDaGVja2VyKCkuZ2V0U3ltYm9sQXRMb2NhdGlvbihjbGFzc0RlY2xhcmF0aW9uLm5hbWUpO1xuICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcoc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKTtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzRGVjbGFyYXRpb24ubmFtZS50ZXh0O1xuICAgICAgICB2YXIgZGlyZWN0aXZlSW5mbztcbiAgICAgICAgdmFyIG1lbWJlcnM7XG5cbiAgICAgICAgaWYgKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9ycykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0RpcmVjdGl2ZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZUluZm8gPSB0aGlzLnZpc2l0RGlyZWN0aXZlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IG1lbWJlcnMuaW5wdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0czogbWVtYmVycy5vdXRwdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzU2VydmljZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZFxuICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1BpcGVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSB8fCB0aGlzLmlzTW9kdWxlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzKTtcblxuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICBraW5kOiBtZW1iZXJzLmtpbmRcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycyk7XG5cbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgIG1ldGhvZHM6IG1lbWJlcnMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RW51bURlY2xhcmF0aW9uKGZpbGVOYW1lLCBub2RlKSB7XG4gICAgICAgIGlmKCBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMgKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUudHlwZU5hbWUgJiYgbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUudHlwZU5hbWUudGV4dCA9PT0gJ1JvdXRlcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5hZGRSb3V0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLm5hbWUudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBnZW5lcmF0ZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlczogZ2VuZXJhdGUobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLmluaXRpYWxpemVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Um91dGVJTyhmaWxlbmFtZSwgc291cmNlRmlsZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdEVudW1EZWNsYXJhdGlvbihmaWxlbmFtZSwgc3RhdGVtZW50KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRJTyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEludGVyZmFjZUlPKGZpbGVuYW1lOiBzdHJpbmcsIHNvdXJjZUZpbGUsIG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbnRlcmZhY2VEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQucG9zID09PSBub2RlLnBvcyAmJiBzdGF0ZW1lbnQuZW5kID09PSBub2RlLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0Q2xhc3NEZWNsYXJhdGlvbihmaWxlbmFtZSwgc3RhdGVtZW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuICAgICAgICB9LCBbXSlcblxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50T3V0cHV0cyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnb3V0cHV0cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAncHJvdmlkZXJzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRWaWV3UHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndmlld1Byb3ZpZGVycycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50RGlyZWN0aXZlcyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2RpcmVjdGl2ZXMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBpZGVudGlmaWVyID0gdGhpcy5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lKTtcbiAgICAgICAgICAgIGlkZW50aWZpZXIuc2VsZWN0b3IgPSB0aGlzLmZpbmRDb21wb25lbnRTZWxlY3RvckJ5TmFtZShuYW1lKTtcbiAgICAgICAgICAgIGlkZW50aWZpZXIubGFiZWwgPSAnJztcbiAgICAgICAgICAgIHJldHVybiBpZGVudGlmaWVyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGxldCBuc01vZHVsZSA9IG5hbWUuc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIHR5cGUgPSB0aGlzLmdldFR5cGUobmFtZSk7XG4gICAgICAgIGlmIChuc01vZHVsZS5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICAgIC8vIGNhY2hlIGRlcHMgd2l0aCB0aGUgc2FtZSBuYW1lc3BhY2UgKGkuZSBTaGFyZWQuKilcbiAgICAgICAgICAgIGlmICh0aGlzLl9fbnNNb2R1bGVbbnNNb2R1bGVbMF1dKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX25zTW9kdWxlW25zTW9kdWxlWzBdXS5wdXNoKG5hbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9fbnNNb2R1bGVbbnNNb2R1bGVbMF1dID0gW25hbWVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5zOiBuc01vZHVsZVswXSxcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFRlbXBsYXRlVXJsKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhbml0aXplVXJscyh0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICd0ZW1wbGF0ZVVybCcpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFRlbXBsYXRlKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICBsZXQgdCA9IHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3RlbXBsYXRlJywgdHJ1ZSkucG9wKClcbiAgICAgICAgaWYodCkge1xuICAgICAgICAgICAgdCA9IGRldGVjdEluZGVudCh0LCAwKTtcbiAgICAgICAgICAgIHQgPSB0LnJlcGxhY2UoL1xcbi8sICcnKTtcbiAgICAgICAgICAgIHQgPSB0LnJlcGxhY2UoLyArJC9nbSwgJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U3R5bGVVcmxzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhbml0aXplVXJscyh0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzdHlsZVVybHMnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTdHlsZXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3N0eWxlcycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50TW9kdWxlSWQocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdtb2R1bGVJZCcpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50Q2hhbmdlRGV0ZWN0aW9uKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnY2hhbmdlRGV0ZWN0aW9uJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRFbmNhcHN1bGF0aW9uKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdlbmNhcHN1bGF0aW9uJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzYW5pdGl6ZVVybHModXJsczogc3RyaW5nW10pIHtcbiAgICAgICAgcmV0dXJuIHVybHMubWFwKHVybCA9PiB1cmwucmVwbGFjZSgnLi8nLCAnJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwc09iamVjdChwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBPYmplY3Qge1xuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcGFyc2VQcm9wZXJ0aWVzID0gKG5vZGU6IE5vZGVPYmplY3QpOiBPYmplY3QgPT4ge1xuICAgICAgICAgICAgbGV0IG9iaiA9IHt9O1xuICAgICAgICAgICAgKG5vZGUuaW5pdGlhbGl6ZXIucHJvcGVydGllcyB8fCBbXSkuZm9yRWFjaCgocHJvcDogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIG9ialtwcm9wLm5hbWUudGV4dF0gPSBwcm9wLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGRlcHMubWFwKHBhcnNlUHJvcGVydGllcykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzUmF3KHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IGFueSB7XG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVwcyB8fCBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHMocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogc3RyaW5nW10ge1xuXG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBwYXJzZVN5bWJvbFRleHQgPSAodGV4dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKCcvJykgIT09IC0xICYmICFtdWx0aUxpbmUpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zcGxpdCgnLycpLnBvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICBdO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBidWlsZElkZW50aWZpZXJOYW1lID0gKG5vZGU6IE5vZGVPYmplY3QsIG5hbWUgPSAnJykgPT4ge1xuXG4gICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUgPyBgLiR7bmFtZX1gIDogbmFtZTtcblxuICAgICAgICAgICAgICAgIGxldCBub2RlTmFtZSA9IHRoaXMudW5rbm93bjtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5uYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUudGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5leHByZXNzaW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbi50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYobm9kZS5leHByZXNzaW9uLmVsZW1lbnRzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24ua2luZCA9PT0gdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLmV4cHJlc3Npb24uZWxlbWVudHMubWFwKCBlbCA9PiBlbC50ZXh0ICkuam9pbignLCAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IGBbJHtub2RlTmFtZX1dYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gIHRzLlN5bnRheEtpbmQuU3ByZWFkRWxlbWVudEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAuLi4ke25vZGVOYW1lfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtidWlsZElkZW50aWZpZXJOYW1lKG5vZGUuZXhwcmVzc2lvbiwgbm9kZU5hbWUpfSR7bmFtZX1gXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBgJHtub2RlLnRleHR9LiR7bmFtZX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhcnNlUHJvdmlkZXJDb25maWd1cmF0aW9uID0gKG86IE5vZGVPYmplY3QpOiBzdHJpbmcgPT4ge1xuICAgICAgICAgICAgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczpcbiAgICAgICAgICAgIC8vIHsgcHJvdmlkZTogQVBQX0JBU0VfSFJFRiwgdXNlVmFsdWU6ICcvJyB9LFxuICAgICAgICAgICAgLy8gb3JcbiAgICAgICAgICAgIC8vIHsgcHJvdmlkZTogJ0RhdGUnLCB1c2VGYWN0b3J5OiAoZDEsIGQyKSA9PiBuZXcgRGF0ZSgpLCBkZXBzOiBbJ2QxJywgJ2QyJ10gfVxuXG4gICAgICAgICAgICBsZXQgX2dlblByb3ZpZGVyTmFtZTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBfcHJvdmlkZXJQcm9wczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgKG8ucHJvcGVydGllcyB8fCBbXSkuZm9yRWFjaCgocHJvcDogTm9kZU9iamVjdCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBwcm9wLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKHByb3AuaW5pdGlhbGl6ZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXIgPSBgJyR7aWRlbnRpZmllcn0nYDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBsYW1iZGEgZnVuY3Rpb24gKGkuZSB1c2VGYWN0b3J5KVxuICAgICAgICAgICAgICAgIGlmIChwcm9wLmluaXRpYWxpemVyLmJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmFtcyA9IChwcm9wLmluaXRpYWxpemVyLnBhcmFtZXRlcnMgfHwgPGFueT5bXSkubWFwKChwYXJhbXM6IE5vZGVPYmplY3QpID0+IHBhcmFtcy5uYW1lLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyID0gYCgke3BhcmFtcy5qb2luKCcsICcpfSkgPT4ge31gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGZhY3RvcnkgZGVwcyBhcnJheVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHByb3AuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVsZW1lbnRzID0gKHByb3AuaW5pdGlhbGl6ZXIuZWxlbWVudHMgfHwgW10pLm1hcCgobjogTm9kZU9iamVjdCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobi5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCcke24udGV4dH0nYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXIgPSBgWyR7ZWxlbWVudHMuam9pbignLCAnKX1dYDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfcHJvdmlkZXJQcm9wcy5wdXNoKFtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpLmUgcHJvdmlkZVxuICAgICAgICAgICAgICAgICAgICBwcm9wLm5hbWUudGV4dCxcblxuICAgICAgICAgICAgICAgICAgICAvLyBpLmUgT3BhcXVlVG9rZW4gb3IgJ1N0cmluZ1Rva2VuJ1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyXG5cbiAgICAgICAgICAgICAgICBdLmpvaW4oJzogJykpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGB7ICR7X3Byb3ZpZGVyUHJvcHMuam9pbignLCAnKX0gfWA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xFbGVtZW50cyA9IChvOiBOb2RlT2JqZWN0IHwgYW55KTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIC8vIHBhcnNlIGV4cHJlc3Npb25zIHN1Y2ggYXM6IEFuZ3VsYXJGaXJlTW9kdWxlLmluaXRpYWxpemVBcHAoZmlyZWJhc2VDb25maWcpXG4gICAgICAgICAgICBpZiAoby5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICBsZXQgY2xhc3NOYW1lID0gYnVpbGRJZGVudGlmaWVyTmFtZShvLmV4cHJlc3Npb24pO1xuXG4gICAgICAgICAgICAgICAgLy8gZnVuY3Rpb24gYXJndW1lbnRzIGNvdWxkIGJlIHJlYWxseSBjb21wbGV4ZS4gVGhlcmUgYXJlIHNvXG4gICAgICAgICAgICAgICAgLy8gbWFueSB1c2UgY2FzZXMgdGhhdCB3ZSBjYW4ndCBoYW5kbGUuIEp1c3QgcHJpbnQgXCJhcmdzXCIgdG8gaW5kaWNhdGVcbiAgICAgICAgICAgICAgICAvLyB0aGF0IHdlIGhhdmUgYXJndW1lbnRzLlxuXG4gICAgICAgICAgICAgICAgbGV0IGZ1bmN0aW9uQXJncyA9IG8uYXJndW1lbnRzLmxlbmd0aCA+IDAgPyAnYXJncycgOiAnJztcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9IGAke2NsYXNzTmFtZX0oJHtmdW5jdGlvbkFyZ3N9KWA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHBhcnNlIGV4cHJlc3Npb25zIHN1Y2ggYXM6IFNoYXJlZC5Nb2R1bGVcbiAgICAgICAgICAgIGVsc2UgaWYgKG8uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIGxldCBpZGVudGlmaWVyID0gYnVpbGRJZGVudGlmaWVyTmFtZShvKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG8udGV4dCA/IG8udGV4dCA6IHBhcnNlUHJvdmlkZXJDb25maWd1cmF0aW9uKG8pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBwYXJzZVN5bWJvbHMgPSAobm9kZTogTm9kZU9iamVjdCk6IHN0cmluZ1tdID0+IHtcblxuICAgICAgICAgICAgbGV0IHRleHQgPSBub2RlLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVN5bWJvbFRleHQodGV4dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIGxldCBpZGVudGlmaWVyID0gcGFyc2VTeW1ib2xFbGVtZW50cyhub2RlLmluaXRpYWxpemVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5pbml0aWFsaXplci5lbGVtZW50cykge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzLm1hcChwYXJzZVN5bWJvbEVsZW1lbnRzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZGVwcy5tYXAocGFyc2VTeW1ib2xzKS5wb3AoKSB8fCBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRDb21wb25lbnRTZWxlY3RvckJ5TmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19jYWNoZVtuYW1lXTtcbiAgICB9XG5cbn1cbiIsImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIExpdmVTZXJ2ZXIgZnJvbSAnbGl2ZS1zZXJ2ZXInO1xuaW1wb3J0ICogYXMgU2hlbGxqcyBmcm9tICdzaGVsbGpzJztcbmltcG9ydCBtYXJrZWQgZnJvbSAnbWFya2VkJztcblxuY29uc3QgZ2xvYjogYW55ID0gcmVxdWlyZSgnZ2xvYicpO1xuXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgSHRtbEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9odG1sLmVuZ2luZSc7XG5pbXBvcnQgeyBNYXJrZG93bkVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9tYXJrZG93bi5lbmdpbmUnO1xuaW1wb3J0IHsgRmlsZUVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9maWxlLmVuZ2luZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uLCBJQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyAkZGVwZW5kZW5jaWVzRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuaW1wb3J0IHsgTmdkRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL25nZC5lbmdpbmUnO1xuaW1wb3J0IHsgU2VhcmNoRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL3NlYXJjaC5lbmdpbmUnO1xuaW1wb3J0IHsgRGVwZW5kZW5jaWVzIH0gZnJvbSAnLi9jb21waWxlci9kZXBlbmRlbmNpZXMnO1xuaW1wb3J0IHsgUm91dGVyUGFyc2VyIH0gZnJvbSAnLi4vdXRpbHMvcm91dGVyLnBhcnNlcic7XG5cbmltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vdXRpbHMvZGVmYXVsdHMnO1xuXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyksXG4gICAgY3dkID0gcHJvY2Vzcy5jd2QoKSxcbiAgICAkaHRtbGVuZ2luZSA9IG5ldyBIdG1sRW5naW5lKCksXG4gICAgJGZpbGVlbmdpbmUgPSBuZXcgRmlsZUVuZ2luZSgpLFxuICAgICRtYXJrZG93bmVuZ2luZSA9IG5ldyBNYXJrZG93bkVuZ2luZSgpLFxuICAgICRuZ2RlbmdpbmUgPSBuZXcgTmdkRW5naW5lKCksXG4gICAgJHNlYXJjaEVuZ2luZSA9IG5ldyBTZWFyY2hFbmdpbmUoKSxcbiAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb24ge1xuICAgIG9wdGlvbnM6T2JqZWN0O1xuICAgIGZpbGVzOiBBcnJheTxzdHJpbmc+O1xuXG4gICAgY29uZmlndXJhdGlvbjpJQ29uZmlndXJhdGlvbjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBjb21wb2RvYyBhcHBsaWNhdGlvbiBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcHRpb25zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBvcHRpb25zIHRoYXQgc2hvdWxkIGJlIHVzZWQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86T2JqZWN0KSB7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gb3B0aW9ucyApIHtcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbb3B0aW9uXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbb3B0aW9uXSA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNvbXBvZG9jXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdlbmVyYXRlKCkge1xuICAgICAgICAkaHRtbGVuZ2luZS5pbml0KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NQYWNrYWdlSnNvbigpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRGaWxlcyhmaWxlczpBcnJheTxzdHJpbmc+KSB7XG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlcztcbiAgICB9XG5cbiAgICBwcm9jZXNzUGFja2FnZUpzb24oKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdTZWFyY2hpbmcgcGFja2FnZS5qc29uIGZpbGUnKTtcbiAgICAgICAgJGZpbGVlbmdpbmUuZ2V0KCdwYWNrYWdlLmpzb24nKS50aGVuKChwYWNrYWdlRGF0YSkgPT4ge1xuICAgICAgICAgICAgbGV0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHBhY2thZ2VEYXRhKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyc2VkRGF0YS5uYW1lICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID09PSBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPSBwYXJzZWREYXRhLm5hbWUgKyAnIGRvY3VtZW50YXRpb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWREYXRhLmRlc2NyaXB0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbkRlc2NyaXB0aW9uID0gcGFyc2VkRGF0YS5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdwYWNrYWdlLmpzb24gZmlsZSBmb3VuZCcpO1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzTWFya2Rvd24oKTtcbiAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0NvbnRpbnVpbmcgd2l0aG91dCBwYWNrYWdlLmpzb24gZmlsZScpO1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzTWFya2Rvd24oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc01hcmtkb3duKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnU2VhcmNoaW5nIFJFQURNRS5tZCBmaWxlJyk7XG4gICAgICAgICRtYXJrZG93bmVuZ2luZS5nZXRSZWFkbWVGaWxlKCkudGhlbigocmVhZG1lRGF0YTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAncmVhZG1lJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ292ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnb3ZlcnZpZXcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yZWFkbWUgPSByZWFkbWVEYXRhO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1JFQURNRS5tZCBmaWxlIGZvdW5kJyk7XG4gICAgICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcbiAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0NvbnRpbnVpbmcgd2l0aG91dCBSRUFETUUubWQgZmlsZScpO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ292ZXJ2aWV3J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RGVwZW5kZW5jaWVzRGF0YSgpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0dldCBkZXBlbmRlbmNpZXMgZGF0YScpO1xuXG4gICAgICAgIGxldCBjcmF3bGVyID0gbmV3IERlcGVuZGVuY2llcyhcbiAgICAgICAgICB0aGlzLmZpbGVzLCB7XG4gICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogcGF0aC5kaXJuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZylcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGRlcGVuZGVuY2llc0RhdGEgPSBjcmF3bGVyLmdldERlcGVuZGVuY2llcygpO1xuXG4gICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUuaW5pdChkZXBlbmRlbmNpZXNEYXRhKTtcblxuICAgICAgICAvL1JvdXRlclBhcnNlci5wcmludFJvdXRlcygpO1xuXG4gICAgICAgIHRoaXMucHJlcGFyZU1vZHVsZXMoKTtcblxuICAgICAgICB0aGlzLnByZXBhcmVDb21wb25lbnRzKCkudGhlbigocmVhZG1lRGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuZGlyZWN0aXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlRGlyZWN0aXZlcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuaW5qZWN0YWJsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZUluamVjdGFibGVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5yb3V0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZVJvdXRlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5waXBlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlUGlwZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlQ2xhc3NlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5pbnRlcmZhY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVJbnRlcmZhY2VzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVDb3ZlcmFnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZUNvdmVyYWdlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1BhZ2VzKCk7XG4gICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlTW9kdWxlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgbW9kdWxlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlcyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0TW9kdWxlcygpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICBuYW1lOiAnbW9kdWxlcycsXG4gICAgICAgICAgICBjb250ZXh0OiAnbW9kdWxlcydcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzLmxlbmd0aDtcblxuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdtb2R1bGVzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdtb2R1bGUnLFxuICAgICAgICAgICAgICAgIG1vZHVsZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZVBpcGVzID0gKCkgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBwaXBlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldFBpcGVzKCk7XG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAncGlwZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdwaXBlJyxcbiAgICAgICAgICAgICAgICBwaXBlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZUNsYXNzZXMgPSAoKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGNsYXNzZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldENsYXNzZXMoKTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2NsYXNzZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICBjbGFzczogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZUludGVyZmFjZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGludGVyZmFjZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEludGVyZmFjZXMoKTtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMubGVuZ3RoO1xuICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdpbnRlcmZhY2VzJyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdpbnRlcmZhY2UnLFxuICAgICAgICAgICAgICAgIGludGVyZmFjZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZUNvbXBvbmVudHMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGNvbXBvbmVudHMnKTtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cyA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q29tcG9uZW50cygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLmZpbGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRtZUZpbGUgPSBkaXJuYW1lICsgcGF0aC5zZXAgKyAnUkVBRE1FLm1kJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHJlYWRtZUZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1JFQURNRS5tZCBleGlzdCBmb3IgdGhpcyBjb21wb25lbnQsIGluY2x1ZGUgaXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShyZWFkbWVGaWxlLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5yZWFkbWUgPSBtYXJrZWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6ICdjb21wb25lbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6ICdjb21wb25lbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogdGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZURpcmVjdGl2ZXMgPSAoKSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGRpcmVjdGl2ZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldERpcmVjdGl2ZXMoKTtcblxuICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnZGlyZWN0aXZlcycsXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnZGlyZWN0aXZlJyxcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzW2ldXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByZXBhcmVJbmplY3RhYmxlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgaW5qZWN0YWJsZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRJbmplY3RhYmxlcygpO1xuXG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnaW5qZWN0YWJsZXMnLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdpbmplY3RhYmxlJyxcbiAgICAgICAgICAgICAgICBpbmplY3RhYmxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJlcGFyZVJvdXRlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3Mgcm91dGVzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXMgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmdldFJvdXRlcygpO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgIG5hbWU6ICdyb3V0ZXMnLFxuICAgICAgICAgICAgY29udGV4dDogJ3JvdXRlcydcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUNvdmVyYWdlKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHJlcG9ydCcpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIGxvb3Agd2l0aCBjb21wb25lbnRzLCBjbGFzc2VzLCBpbmplY3RhYmxlcywgaW50ZXJmYWNlcywgcGlwZXNcbiAgICAgICAgICovXG4gICAgICAgIHZhciBmaWxlcyA9IFtdLFxuICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICBnZXRTdGF0dXMgPSBmdW5jdGlvbihwZXJjZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXR1cztcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudCA8PSAyNSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnbG93JztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBlcmNlbnQgPiAyNSAmJiBwZXJjZW50IDw9IDUwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdtZWRpdW0nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGVyY2VudCA+IDUwICYmIHBlcmNlbnQgPD0gNzUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ2dvb2QnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICd2ZXJ5LWdvb2QnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHMsIChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBjbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGNvbXBvbmVudC5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBjb21wb25lbnQudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogY29tcG9uZW50Lm5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gY29tcG9uZW50LnByb3BlcnRpZXNDbGFzcy5sZW5ndGggKyBjb21wb25lbnQubWV0aG9kc0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5pbnB1dHNDbGFzcy5sZW5ndGggKyBjb21wb25lbnQub3V0cHV0c0NsYXNzLmxlbmd0aDtcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQucHJvcGVydGllc0NsYXNzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goY29tcG9uZW50Lm1ldGhvZHNDbGFzcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goY29tcG9uZW50LmlucHV0c0NsYXNzLCAoaW5wdXQpID0+IHtcbiAgICAgICAgICAgICAgICBpZihpbnB1dC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goY29tcG9uZW50Lm91dHB1dHNDbGFzcywgKG91dHB1dCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG91dHB1dC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGlmKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICB9KVxuICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXMsIChjbGFzc2UpID0+IHtcbiAgICAgICAgICAgIGxldCBjbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGNsYXNzZS5maWxlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3NlJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogY2xhc3NlLm5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gY2xhc3NlLnByb3BlcnRpZXMubGVuZ3RoICsgY2xhc3NlLm1ldGhvZHMubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNsYXNzZS5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goY2xhc3NlLm1ldGhvZHMsIChtZXRob2QpID0+IHtcbiAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xuICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMsIChpbmplY3RhYmxlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY2wgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBpbmplY3RhYmxlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGluamVjdGFibGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaW5qZWN0YWJsZS5uYW1lXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyA9IGluamVjdGFibGUucHJvcGVydGllcy5sZW5ndGggKyBpbmplY3RhYmxlLm1ldGhvZHMubGVuZ3RoO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGluamVjdGFibGUucHJvcGVydGllcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGluamVjdGFibGUubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGlmKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICB9KTtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzLCAoaW50ZXIpID0+IHtcbiAgICAgICAgICAgIGxldCBjbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGludGVyLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGludGVyLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGludGVyLm5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gaW50ZXIucHJvcGVydGllcy5sZW5ndGggKyBpbnRlci5tZXRob2RzLmxlbmd0aDtcbiAgICAgICAgICAgIF8uZm9yRWFjaChpbnRlci5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2goaW50ZXIubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgIGlmKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICB9KTtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcywgKHBpcGUpID0+IHtcbiAgICAgICAgICAgIGxldCBjbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IHBpcGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogcGlwZS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBwaXBlLm5hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gMTtcbiAgICAgICAgICAgIGlmIChwaXBlLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICB9KTtcbiAgICAgICAgZmlsZXMgPSBfLnNvcnRCeShmaWxlcywgWydmaWxlUGF0aCddKTtcbiAgICAgICAgdmFyIGNvdmVyYWdlRGF0YSA9IHtcbiAgICAgICAgICAgIGNvdW50OiBNYXRoLmZsb29yKHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgLyBmaWxlcy5sZW5ndGgpLFxuICAgICAgICAgICAgc3RhdHVzOiAnJ1xuICAgICAgICB9O1xuICAgICAgICBjb3ZlcmFnZURhdGEuc3RhdHVzID0gZ2V0U3RhdHVzKGNvdmVyYWdlRGF0YS5jb3VudCk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgIG5hbWU6ICdjb3ZlcmFnZScsXG4gICAgICAgICAgICBjb250ZXh0OiAnY292ZXJhZ2UnLFxuICAgICAgICAgICAgZmlsZXM6IGZpbGVzLFxuICAgICAgICAgICAgZGF0YTogY292ZXJhZ2VEYXRhXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NQYWdlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgcGFnZXMnKTtcbiAgICAgICAgbGV0IHBhZ2VzID0gdGhpcy5jb25maWd1cmF0aW9uLnBhZ2VzLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBwYWdlcy5sZW5ndGgsXG4gICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHBhZ2UnLCBwYWdlc1tpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgJGh0bWxlbmdpbmUucmVuZGVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YSwgcGFnZXNbaV0pLnRoZW4oKGh0bWxEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmluYWxQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubGFzdEluZGV4T2YoJy8nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2VzW2ldLnBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZXNbaV0ucGF0aCArICcvJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSBwYWdlc1tpXS5uYW1lICsgJy5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgICAgICRzZWFyY2hFbmdpbmUuaW5kZXhQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvczogcGFnZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3RGF0YTogaHRtbERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBmaW5hbFBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMub3V0cHV0RmlsZShwYXRoLnJlc29sdmUoZmluYWxQYXRoKSwgaHRtbERhdGEsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nICcgKyBwYWdlc1tpXS5uYW1lICsgJyBwYWdlIGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzZWFyY2hFbmdpbmUuZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24odGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzQXNzZXRzRm9sZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUmVzb3VyY2VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgbG9vcCgpO1xuICAgIH1cblxuICAgIHByb2Nlc3NBc3NldHNGb2xkZXIoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDb3B5IGFzc2V0cyBmb2xkZXInKTtcblxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlcikpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgUHJvdmlkZWQgYXNzZXRzIGZvbGRlciAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXJ9IGRpZCBub3QgZXhpc3RgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGZzLmNvcHkocGF0aC5yZXNvbHZlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIpLCBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCArIHBhdGguc2VwICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciksIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcmVzb3VyY2VzIGNvcHkgJywgZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb2Nlc3NSZXNvdXJjZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDb3B5IG1haW4gcmVzb3VyY2VzJyk7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvcmVzb3VyY2VzLycpLCBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCksIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIHJlc291cmNlcyBjb3B5ICcsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5jb25maWd1cmF0aW9uLm1haW5EYXRhLmV4dFRoZW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLmNvcHkocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoYXQuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSksIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGF0LmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgJy9zdHlsZXMvJyksIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBleHRlcm5hbCBzdHlsaW5nIHRoZW1lIGNvcHkgJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0V4dGVybmFsIHN0eWxpbmcgdGhlbWUgY29weSBzdWNjZWVkZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NHcmFwaHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NHcmFwaHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NHcmFwaHMoKSB7XG5cbiAgICAgICAgY29uc3Qgb25Db21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBmaW5hbFRpbWUgPSAobmV3IERhdGUoKSAtIHN0YXJ0VGltZSkgLyAxMDAwO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RvY3VtZW50YXRpb24gZ2VuZXJhdGVkIGluICcgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgJyBpbiAnICsgZmluYWxUaW1lICsgJyBzZWNvbmRzIHVzaW5nICcgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudGhlbWUgKyAnIHRoZW1lJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnNlcnZlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHRoaXMucnVuV2ViU2VydmVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoKSB7XG5cbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdHcmFwaCBnZW5lcmF0aW9uIGRpc2FibGVkJyk7XG4gICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgbWFpbiBncmFwaCcpO1xuICAgICAgICAgICAgbGV0IG1vZHVsZXMgPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlcyxcbiAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgIGxlbiA9IG1vZHVsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICBsb29wID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYoIGkgPD0gbGVuLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBtb2R1bGUgZ3JhcGgnLCBtb2R1bGVzW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubGFzdEluZGV4T2YoJy8nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9ICcvJztcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9ICdtb2R1bGVzLycgKyBtb2R1bGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgJG5nZGVuZ2luZS5yZW5kZXJHcmFwaChtb2R1bGVzW2ldLmZpbGUsIGZpbmFsUGF0aCwgJ2YnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IGZpbmFsTWFpbkdyYXBoUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICBpZihmaW5hbE1haW5HcmFwaFBhdGgubGFzdEluZGV4T2YoJy8nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBmaW5hbE1haW5HcmFwaFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxNYWluR3JhcGhQYXRoICs9ICdncmFwaCc7XG4gICAgICAgICAgICAkbmdkZW5naW5lLnJlbmRlckdyYXBoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZywgcGF0aC5yZXNvbHZlKGZpbmFsTWFpbkdyYXBoUGF0aCksICdwJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9vcCgpO1xuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGdyYXBoIGdlbmVyYXRpb246ICcsIGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcnVuV2ViU2VydmVyKGZvbGRlcikge1xuICAgICAgICBMaXZlU2VydmVyLnN0YXJ0KHtcbiAgICAgICAgICAgIHJvb3Q6IGZvbGRlcixcbiAgICAgICAgICAgIG9wZW46IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vcGVuLFxuICAgICAgICAgICAgcXVpZXQ6IHRydWUsXG4gICAgICAgICAgICBsb2dMZXZlbDogMCxcbiAgICAgICAgICAgIHBvcnQ6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgYXBwbGljYXRpb24gLyByb290IGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBnZXQgYXBwbGljYXRpb24oKTpBcHBsaWNhdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgZ2V0IGlzQ0xJKCk6Ym9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgeyBBcHBsaWNhdGlvbiB9IGZyb20gJy4vYXBwL2FwcGxpY2F0aW9uJztcblxuaW1wb3J0IHsgQ09NUE9ET0NfREVGQVVMVFMgfSBmcm9tICcuL3V0aWxzL2RlZmF1bHRzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcblxubGV0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLFxuICAgIHByb2dyYW0gPSByZXF1aXJlKCdjb21tYW5kZXInKSxcbiAgICBmaWxlcyA9IFtdLFxuICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG5cbmV4cG9ydCBjbGFzcyBDbGlBcHBsaWNhdGlvbiBleHRlbmRzIEFwcGxpY2F0aW9uXG57XG4gICAgLyoqXG4gICAgICogUnVuIGNvbXBvZG9jIGZyb20gdGhlIGNvbW1hbmQgbGluZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XG5cbiAgICAgICAgcHJvZ3JhbVxuICAgICAgICAgICAgLnZlcnNpb24ocGtnLnZlcnNpb24pXG4gICAgICAgICAgICAudXNhZ2UoJzxzcmM+IFtvcHRpb25zXScpXG4gICAgICAgICAgICAub3B0aW9uKCctcCwgLS10c2NvbmZpZyBbY29uZmlnXScsICdBIHRzY29uZmlnLmpzb24gZmlsZScpXG4gICAgICAgICAgICAub3B0aW9uKCctZCwgLS1vdXRwdXQgW2ZvbGRlcl0nLCAnV2hlcmUgdG8gc3RvcmUgdGhlIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIChkZWZhdWx0OiAuL2RvY3VtZW50YXRpb24pJywgQ09NUE9ET0NfREVGQVVMVFMuZm9sZGVyKVxuICAgICAgICAgICAgLm9wdGlvbignLWIsIC0tYmFzZSBbYmFzZV0nLCAnQmFzZSByZWZlcmVuY2Ugb2YgaHRtbCB0YWcgPGJhc2U+JywgQ09NUE9ET0NfREVGQVVMVFMuYmFzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy15LCAtLWV4dFRoZW1lIFtmaWxlXScsICdFeHRlcm5hbCBzdHlsaW5nIHRoZW1lIGZpbGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLW4sIC0tbmFtZSBbbmFtZV0nLCAnVGl0bGUgZG9jdW1lbnRhdGlvbicsIENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKVxuICAgICAgICAgICAgLm9wdGlvbignLWEsIC0tYXNzZXRzRm9sZGVyIFtmb2xkZXJdJywgJ0V4dGVybmFsIGFzc2V0cyBmb2xkZXIgdG8gY29weSBpbiBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbiBmb2xkZXInKVxuICAgICAgICAgICAgLm9wdGlvbignLW8sIC0tb3BlbicsICdPcGVuIHRoZSBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbicsIGZhbHNlKVxuICAgICAgICAgICAgLy8ub3B0aW9uKCctaSwgLS1pbmNsdWRlcyBbcGF0aF0nLCAnUGF0aCBvZiBleHRlcm5hbCBtYXJrZG93biBmaWxlcyB0byBpbmNsdWRlJylcbiAgICAgICAgICAgIC8vLm9wdGlvbignLWosIC0taW5jbHVkZXNOYW1lIFtuYW1lXScsICdOYW1lIG9mIGl0ZW0gbWVudSBvZiBleHRlcm5hbHMgbWFya2Rvd24gZmlsZScpXG4gICAgICAgICAgICAub3B0aW9uKCctdCwgLS1zaWxlbnQnLCAnSW4gc2lsZW50IG1vZGUsIGxvZyBtZXNzYWdlcyBhcmVuXFwndCBsb2dnZWQgaW4gdGhlIGNvbnNvbGUnLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy1zLCAtLXNlcnZlJywgJ1NlcnZlIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIChkZWZhdWx0IGh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC8pJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctciwgLS1wb3J0IFtwb3J0XScsICdDaGFuZ2UgZGVmYXVsdCBzZXJ2aW5nIHBvcnQnLCBDT01QT0RPQ19ERUZBVUxUUy5wb3J0KVxuICAgICAgICAgICAgLm9wdGlvbignLS10aGVtZSBbdGhlbWVdJywgJ0Nob29zZSBvbmUgb2YgYXZhaWxhYmxlIHRoZW1lcywgZGVmYXVsdCBpcyBcXCdnaXRib29rXFwnIChsYXJhdmVsLCBvcmlnaW5hbCwgcG9zdG1hcmssIHJlYWR0aGVkb2NzLCBzdHJpcGUsIHZhZ3JhbnQpJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0taGlkZUdlbmVyYXRvcicsICdEbyBub3QgcHJpbnQgdGhlIENvbXBvZG9jIGxpbmsgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlU291cmNlQ29kZScsICdEbyBub3QgYWRkIHNvdXJjZSBjb2RlIHRhYicsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlR3JhcGgnLCAnRG8gbm90IGFkZCB0aGUgZGVwZW5kZW5jeSBncmFwaCcsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlQ292ZXJhZ2UnLCAnRG8gbm90IGFkZCB0aGUgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSByZXBvcnQnLCBmYWxzZSlcbiAgICAgICAgICAgIC5wYXJzZShwcm9jZXNzLmFyZ3YpO1xuXG4gICAgICAgIGxldCBvdXRwdXRIZWxwID0gKCkgPT4ge1xuICAgICAgICAgICAgcHJvZ3JhbS5vdXRwdXRIZWxwKClcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLm91dHB1dCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCA9IHByb2dyYW0ub3V0cHV0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uYmFzZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmJhc2UgPSBwcm9ncmFtLmJhc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5leHRUaGVtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmV4dFRoZW1lID0gcHJvZ3JhbS5leHRUaGVtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnRoZW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudGhlbWUgPSBwcm9ncmFtLnRoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ubmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9IHByb2dyYW0ubmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmFzc2V0c0ZvbGRlcikge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciA9IHByb2dyYW0uYXNzZXRzRm9sZGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ub3Blbikge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm9wZW4gPSBwcm9ncmFtLm9wZW47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5pbmNsdWRlcykge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzICA9IHByb2dyYW0uaW5jbHVkZXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5pbmNsdWRlc05hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc05hbWUgID0gcHJvZ3JhbS5pbmNsdWRlc05hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5zaWxlbnQpIHtcbiAgICAgICAgICAgIGxvZ2dlci5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNlcnZlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuc2VydmUgID0gcHJvZ3JhbS5zZXJ2ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnBvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0ID0gcHJvZ3JhbS5wb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uaGlkZUdlbmVyYXRvcikge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmhpZGVHZW5lcmF0b3IgPSBwcm9ncmFtLmhpZGVHZW5lcmF0b3I7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlU291cmNlQ29kZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVTb3VyY2VDb2RlID0gcHJvZ3JhbS5kaXNhYmxlU291cmNlQ29kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVHcmFwaCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVHcmFwaCA9IHByb2dyYW0uZGlzYWJsZUdyYXBoO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZUNvdmVyYWdlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlID0gcHJvZ3JhbS5kaXNhYmxlQ292ZXJhZ2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5zZXJ2ZSAmJiAhcHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLm91dHB1dCkge1xuICAgICAgICAgICAgLy8gaWYgLXMgJiAtZCwgc2VydmUgaXRcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLm91dHB1dCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYCR7cHJvZ3JhbS5vdXRwdXR9IGZvbGRlciBkb2Vzbid0IGV4aXN0YCk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHtwcm9ncmFtLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3Byb2dyYW0ucG9ydH1gKTtcbiAgICAgICAgICAgICAgICBzdXBlci5ydW5XZWJTZXJ2ZXIocHJvZ3JhbS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHByb2dyYW0uc2VydmUgJiYgIXByb2dyYW0udHNjb25maWcgJiYgIXByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICAvLyBpZiBvbmx5IC1zIGZpbmQgLi9kb2N1bWVudGF0aW9uLCBpZiBvayBzZXJ2ZSwgZWxzZSBlcnJvciBwcm92aWRlIC1kXG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS5vdXRwdXQpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdQcm92aWRlIG91dHB1dCBnZW5lcmF0ZWQgZm9sZGVyIHdpdGggLWQgZmxhZycpO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7cHJvZ3JhbS5vdXRwdXR9IGF0IGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9ncmFtLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgc3VwZXIucnVuV2ViU2VydmVyKHByb2dyYW0ub3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwcm9ncmFtLmhpZGVHZW5lcmF0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaGlkZUdlbmVyYXRvciA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBkZWZhdWx0V2Fsa0ZPbGRlciA9IGN3ZCB8fCAnLicsXG4gICAgICAgICAgICAgICAgd2FsayA9IChkaXIsIGV4Y2x1ZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0LmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGNsdWRlLmluZGV4T2YoZmlsZSkgPCAwICYmIGRpci5pbmRleE9mKCdub2RlX21vZHVsZXMnKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlID0gcGF0aC5qb2luKGRpciwgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBmcy5zdGF0U3luYyhmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHdhbGsoZmlsZSwgZXhjbHVkZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICgvKHNwZWN8XFwuZClcXC50cy8udGVzdChmaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0lnbm9yaW5nJywgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdJbmNsdWRpbmcnLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0uYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcgPSBwcm9ncmFtLnRzY29uZmlnO1xuICAgICAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLnRzY29uZmlnKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1widHNjb25maWcuanNvblwiIGZpbGUgd2FzIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnknKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfZmlsZSA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgcGF0aC5kaXJuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZykpLFxuICAgICAgICAgICAgICAgICAgICAgIHBhdGguYmFzZW5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgdHNjb25maWcnLCBfZmlsZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSByZXF1aXJlKF9maWxlKS5maWxlcztcblxuICAgICAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGN1cnJlbnQgZGlyZWN0b3J5IG9mIHRzY29uZmlnLmpzb24gYXMgYSB3b3JraW5nIGRpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgICBjd2QgPSBfZmlsZS5zcGxpdChwYXRoLnNlcCkuc2xpY2UoMCwgLTEpLmpvaW4ocGF0aC5zZXApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGNsdWRlID0gcmVxdWlyZShfZmlsZSkuZXhjbHVkZSB8fCBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSB3YWxrKGN3ZCB8fCAnLicsIGV4Y2x1ZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuc2V0RmlsZXMoZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICBzdXBlci5nZW5lcmF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gIGVsc2UgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcgPSBwcm9ncmFtLnRzY29uZmlnO1xuICAgICAgICAgICAgICAgIGxldCBzb3VyY2VGb2xkZXIgPSBwcm9ncmFtLmFyZ3NbMF07XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHNvdXJjZUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBQcm92aWRlZCBzb3VyY2UgZm9sZGVyICR7c291cmNlRm9sZGVyfSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeWApO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1VzaW5nIHByb3ZpZGVkIHNvdXJjZSBmb2xkZXInKTtcblxuICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHdhbGsocGF0aC5yZXNvbHZlKHNvdXJjZUZvbGRlciksIFtdKTtcblxuICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLmdlbmVyYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ3RzY29uZmlnLmpzb24gZmlsZSB3YXMgbm90IGZvdW5kLCBwbGVhc2UgdXNlIC1wIGZsYWcnKTtcbiAgICAgICAgICAgICAgICBvdXRwdXRIZWxwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibmFtZXMiOlsiZ3V0aWwiLCJyZXF1aXJlIiwiYyIsImNvbG9ycyIsInBrZyIsIkxFVkVMIiwibmFtZSIsInZlcnNpb24iLCJsb2dnZXIiLCJsb2ciLCJzaWxlbnQiLCJhcmdzIiwiZm9ybWF0IiwiSU5GTyIsIkVSUk9SIiwiREVCVUciLCJsZXZlbCIsInBhZCIsInMiLCJsIiwiQXJyYXkiLCJNYXRoIiwibWF4IiwibGVuZ3RoIiwiam9pbiIsIm1zZyIsInNoaWZ0IiwiZ3JlZW4iLCJjeWFuIiwicmVkIiwiTG9nZ2VyIiwiQW5ndWxhckFQSXMiLCJ0eXBlIiwiX3Jlc3VsdCIsImFuZ3VsYXJNb2R1bGVBUElzIiwiYW5ndWxhck1vZHVsZSIsImkiLCJsZW4iLCJ0aXRsZSIsImRhdGEiLCJEZXBlbmRlbmNpZXNFbmdpbmUiLCJfaW5zdGFuY2UiLCJFcnJvciIsInJhd0RhdGEiLCJtb2R1bGVzIiwiXyIsImNvbXBvbmVudHMiLCJkaXJlY3RpdmVzIiwiaW5qZWN0YWJsZXMiLCJpbnRlcmZhY2VzIiwicm91dGVzIiwicGlwZXMiLCJjbGFzc2VzIiwiZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyIsImluZGV4T2YiLCJyZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXMiLCJyZXN1bHRJbkNvbXBvZG9jQ2xhc3NlcyIsInJlc3VsdEluQW5ndWxhckFQSXMiLCJmaW5kZXJJbkFuZ3VsYXJBUElzIiwiJGRlcGVuZGVuY2llc0VuZ2luZSIsImdldEluc3RhbmNlIiwiYSIsIm9wZXJhdG9yIiwiYiIsIm9wdGlvbnMiLCJhcmd1bWVudHMiLCJyZXN1bHQiLCJpbnZlcnNlIiwiZm4iLCJ0ZXh0IiwiTkcyX01PRFVMRVMiLCJvcHRpb25hbFZhbHVlIiwiSGFuZGxlYmFycyIsImVzY2FwZUV4cHJlc3Npb24iLCJyZXBsYWNlIiwibWV0aG9kIiwibWFwIiwiYXJnIiwiZmluZCIsInNvdXJjZSIsInBhdGgiLCJqc2RvY1RhZ3MiLCJ0YWdOYW1lIiwiY29tbWVudCIsInRhZ3MiLCJ0YWciLCJ0eXBlRXhwcmVzc2lvbiIsInBhcmFtZXRlck5hbWUiLCJwdXNoIiwiaHJlZiIsInRhcmdldCIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXJ0aWFscyIsImxvb3AiLCJyZXNvbHZlIiwicmVqZWN0IiwiX19kaXJuYW1lIiwiZXJyIiwiUHJvbWlzZSIsIm1haW5EYXRhIiwicGFnZSIsIm8iLCJ0aGF0IiwiYXNzaWduIiwiY2FjaGUiLCJ0ZW1wbGF0ZSIsInJlbmRlcmVyIiwiUmVuZGVyZXIiLCJjb2RlIiwibGFuZ3VhZ2UiLCJ2YWxpZExhbmciLCJoaWdobGlnaHRqcyIsImdldExhbmd1YWdlIiwiaGlnaGxpZ2h0ZWQiLCJoaWdobGlnaHQiLCJ2YWx1ZSIsInNldE9wdGlvbnMiLCJwcm9jZXNzIiwiY3dkIiwibWFya2VkIiwiZmlsZXBhdGgiLCJDT01QT0RPQ19ERUZBVUxUUyIsImZvbGRlciIsInRoZW1lIiwicG9ydCIsImJhc2UiLCJkaXNhYmxlU291cmNlQ29kZSIsImRpc2FibGVHcmFwaCIsImRpc2FibGVDb3ZlcmFnZSIsIkNvbmZpZ3VyYXRpb24iLCJfcGFnZXMiLCJwYWdlcyIsIl9tYWluRGF0YSIsImJpblBhdGgiLCJnbG9iYWxCaW5QYXRoIiwicGxhdGZvcm0iLCJwYXRobmFtZXMiLCJlbnYiLCJQQVRIIiwic3BsaXQiLCJleGVjUGF0aCIsInN0cmlwVHJhaWxpbmdTZXAiLCJ0aGVQYXRoIiwic2xpY2UiLCJwYXRoSXNJbnNpZGUiLCJwb3RlbnRpYWxQYXJlbnQiLCJ0b0xvd2VyQ2FzZSIsImxhc3RJbmRleE9mIiwidW5kZWZpbmVkIiwiaXNQYXRoSW5zaWRlIiwiYXJndiIsIm91dHB1dHBhdGgiLCJuZ2RQYXRoIiwiaXNHbG9iYWwiLCJNT0RFIiwidGVzdCIsImZpbmFsUGF0aCIsInN0ZG91dCIsInN0ZGVyciIsImx1bnIiLCJjaGVlcmlvIiwiRW50aXRpZXMiLCJBbGxIdG1sRW50aXRpZXMiLCIkY29uZmlndXJhdGlvbiIsIkh0bWwiLCJzZWFyY2hJbmRleCIsInJlZiIsImZpZWxkIiwiYm9vc3QiLCIkIiwibG9hZCIsImh0bWwiLCJkZWNvZGUiLCJ1cmwiLCJvdXRwdXQiLCJkb2MiLCJpbmZvcyIsImNvbnRleHQiLCJkb2N1bWVudHNTdG9yZSIsImdldFNlYXJjaEluZGV4IiwiYWRkIiwib3V0cHV0Rm9sZGVyIiwiZXJyb3IiLCJ0c2FueSIsInRzIiwibm9kZSIsImdldEpTRG9jcyIsImFwcGx5Iiwic3RyIiwiY291bnQiLCJpbmRlbnQiLCJzdHJpcEluZGVudCIsIm1hdGNoIiwibWluIiwieCIsInJlIiwiUmVnRXhwIiwicmVwZWF0aW5nIiwibiIsIlR5cGVFcnJvciIsIk51bWJlciIsImlzRmluaXRlIiwicmV0IiwiaW5kZW50U3RyaW5nIiwidHJhbnNwaWxlT3B0aW9ucyIsImlucHV0RmlsZU5hbWUiLCJmaWxlTmFtZSIsImpzeCIsImNvbXBpbGVySG9zdCIsInRzY29uZmlnRGlyZWN0b3J5IiwibGliU291cmNlIiwiZnMiLCJ0b1N0cmluZyIsImUiLCJkZWJ1ZyIsIlJvdXRlclBhcnNlciIsIm1vZHVsZXNUcmVlIiwicm9vdE1vZHVsZSIsIm1vZHVsZXNXaXRoUm91dGVzIiwicm91dGUiLCJtb2R1bGVOYW1lIiwibW9kdWxlSW1wb3J0cyIsIm1vZHVsZSIsImltcG9ydHMiLCJpbXBvcnRzTm9kZSIsImluaXRpYWxpemVyIiwiZWxlbWVudHMiLCJlbGVtZW50IiwiYXJndW1lbnQiLCJjbGVhbk1vZHVsZXNUcmVlIiwibW9kdWxlc0NsZWFuZXIiLCJhcnIiLCJwYXJlbnQiLCJjaGlsZHJlbiIsInV0aWwiLCJkZXB0aCIsInJvdXRlc1RyZWUiLCJmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUiLCJsb29wTW9kdWxlc1BhcnNlciIsInBhcnNlIiwia2luZCIsImNsZWFuZWRSb3V0ZXNUcmVlIiwiY2xlYW5Sb3V0ZXNUcmVlIiwiZ2V0TmVzdGVkQ2hpbGRyZW4iLCJvdXQiLCJmaXJzdExvb3BNb2R1bGUiLCJpbXBvcnROb2RlIiwiZ2VuIiwidG1wIiwidG9rZW4iLCJnZXRDaGlsZHJlbiIsImZvckVhY2giLCJ2aXNpdEFuZFJlY29nbml6ZSIsIkZpcnN0TGl0ZXJhbFRva2VuIiwiSWRlbnRpZmllciIsIlN0cmluZ0xpdGVyYWwiLCJBcnJheUxpdGVyYWxFeHByZXNzaW9uIiwiSW1wb3J0S2V5d29yZCIsIkZyb21LZXl3b3JkIiwiRXhwb3J0S2V5d29yZCIsIkNsYXNzS2V5d29yZCIsIlRoaXNLZXl3b3JkIiwiQ29uc3RydWN0b3JLZXl3b3JkIiwiRmFsc2VLZXl3b3JkIiwiVHJ1ZUtleXdvcmQiLCJOdWxsS2V5d29yZCIsIkF0VG9rZW4iLCJQbHVzVG9rZW4iLCJFcXVhbHNHcmVhdGVyVGhhblRva2VuIiwiT3BlblBhcmVuVG9rZW4iLCJJbXBvcnRDbGF1c2UiLCJPYmplY3RMaXRlcmFsRXhwcmVzc2lvbiIsIkJsb2NrIiwiQ2xvc2VCcmFjZVRva2VuIiwiQ2xvc2VQYXJlblRva2VuIiwiT3BlbkJyYWNrZXRUb2tlbiIsIkNsb3NlQnJhY2tldFRva2VuIiwiU2VtaWNvbG9uVG9rZW4iLCJDb21tYVRva2VuIiwiQ29sb25Ub2tlbiIsIkRvdFRva2VuIiwiRG9TdGF0ZW1lbnQiLCJEZWNvcmF0b3IiLCJGaXJzdEFzc2lnbm1lbnQiLCJGaXJzdFB1bmN0dWF0aW9uIiwiUHJpdmF0ZUtleXdvcmQiLCJQdWJsaWNLZXl3b3JkIiwiZmlsZXMiLCJFUzUiLCJDb21tb25KUyIsInByb2dyYW0iLCJfdCIsImRlcHMiLCJzb3VyY2VGaWxlcyIsImdldFNvdXJjZUZpbGVzIiwiZmlsZSIsImZpbGVQYXRoIiwiaW5mbyIsImdldFNvdXJjZUZpbGVEZWNvcmF0b3JzIiwic3JjRmlsZSIsIm91dHB1dFN5bWJvbHMiLCJjbGVhbmVyIiwicHJvZ3JhbUNvbXBvbmVudCIsInNvdXJjZUZpbGUiLCJnZXRTb3VyY2VGaWxlIiwidHlwZUNoZWNrZXJDb21wb25lbnQiLCJnZXRUeXBlQ2hlY2tlciIsImRlY29yYXRvcnMiLCJ2aXNpdE5vZGUiLCJ2aXNpdGVkTm9kZSIsImluZGV4IiwibWV0YWRhdGEiLCJwb3AiLCJnZXRTeW1ib2xlTmFtZSIsInByb3BzIiwiZmluZFByb3BzIiwiSU8iLCJnZXRDb21wb25lbnRJTyIsImlzTW9kdWxlIiwiZ2V0TW9kdWxlUHJvdmlkZXJzIiwiZ2V0TW9kdWxlRGVjbGF0aW9ucyIsImdldE1vZHVsZUltcG9ydHMiLCJnZXRNb2R1bGVFeHBvcnRzIiwiZ2V0TW9kdWxlQm9vdHN0cmFwIiwiYnJlYWtMaW5lcyIsImRlc2NyaXB0aW9uIiwiZ2V0VGV4dCIsImhhc1JvdXRlck1vZHVsZUluSW1wb3J0cyIsImFkZE1vZHVsZVdpdGhSb3V0ZXMiLCJnZXRNb2R1bGVJbXBvcnRzUmF3IiwiYWRkTW9kdWxlIiwiaXNDb21wb25lbnQiLCJnZXRDb21wb25lbnRDaGFuZ2VEZXRlY3Rpb24iLCJnZXRDb21wb25lbnRFbmNhcHN1bGF0aW9uIiwiZ2V0Q29tcG9uZW50RXhwb3J0QXMiLCJnZXRDb21wb25lbnRIb3N0IiwiZ2V0Q29tcG9uZW50SW5wdXRzTWV0YWRhdGEiLCJnZXRDb21wb25lbnRNb2R1bGVJZCIsImdldENvbXBvbmVudE91dHB1dHMiLCJnZXRDb21wb25lbnRQcm92aWRlcnMiLCJnZXRDb21wb25lbnRTZWxlY3RvciIsImdldENvbXBvbmVudFN0eWxlVXJscyIsImdldENvbXBvbmVudFN0eWxlcyIsImdldENvbXBvbmVudFRlbXBsYXRlIiwiZ2V0Q29tcG9uZW50VGVtcGxhdGVVcmwiLCJnZXRDb21wb25lbnRWaWV3UHJvdmlkZXJzIiwiaW5wdXRzIiwib3V0cHV0cyIsInByb3BlcnRpZXMiLCJtZXRob2RzIiwiaXNJbmplY3RhYmxlIiwiaXNQaXBlIiwiaXNEaXJlY3RpdmUiLCJfX2NhY2hlIiwiZmlsdGVyQnlEZWNvcmF0b3JzIiwiZXhwcmVzc2lvbiIsImZpbHRlciIsInN5bWJvbCIsImZsYWdzIiwiQ2xhc3MiLCJJbnRlcmZhY2UiLCJnZXRJbnRlcmZhY2VJTyIsImdldFJvdXRlSU8iLCJuZXdSb3V0ZXMiLCJDbGFzc0RlY2xhcmF0aW9uIiwiRXhwcmVzc2lvblN0YXRlbWVudCIsInJlc3VsdE5vZGUiLCJmaW5kRXhwcmVzc2lvbkJ5TmFtZSIsInNldFJvb3RNb2R1bGUiLCJzeW1ib2xzIiwiZCIsImVudHJ5Tm9kZSIsImdldFN5bWJvbERlcHMiLCJwcm92aWRlck5hbWUiLCJwYXJzZURlZXBJbmRlbnRpZmllciIsImNvbXBvbmVudCIsImZpbmRDb21wb25lbnRTZWxlY3RvckJ5TmFtZSIsImdldFN5bWJvbERlcHNSYXciLCJnZXRTeW1ib2xEZXBzT2JqZWN0IiwiZGVjb3JhdG9yVHlwZSIsInByb3BlcnR5IiwiaW5EZWNvcmF0b3IiLCJpbkFyZ3MiLCJzdHJpbmdpZnlEZWZhdWx0VmFsdWUiLCJ2aXNpdFR5cGUiLCJnZXREb2N1bWVudGF0aW9uQ29tbWVudCIsInR5cGVUb1N0cmluZyIsImdldFR5cGVBdExvY2F0aW9uIiwib3V0RGVjb3JhdG9yIiwib3V0QXJncyIsInR5cGVBcmd1bWVudHMiLCJtZW1iZXIiLCJtb2RpZmllcnMiLCJpc1B1YmxpYyIsInNvbWUiLCJtb2RpZmllciIsImlzSW50ZXJuYWxNZW1iZXIiLCJpc1ByaXZhdGUiLCJpbnRlcm5hbFRhZ3MiLCJqc0RvYyIsIm1ldGhvZE5hbWUiLCJBTkdVTEFSX0xJRkVDWUNMRV9NRVRIT0RTIiwicGFyYW1ldGVycyIsIl9wYXJhbWV0ZXJzIiwidmlzaXRBcmd1bWVudCIsInByb3AiLCJqc2RvY3RhZ3MiLCJfdHMiLCJsb2NhbGVDb21wYXJlIiwibWVtYmVycyIsImlucHV0RGVjb3JhdG9yIiwiZ2V0RGVjb3JhdG9yT2ZUeXBlIiwidmlzaXRJbnB1dCIsInZpc2l0T3V0cHV0IiwiaXNQcml2YXRlT3JJbnRlcm5hbCIsIk1ldGhvZERlY2xhcmF0aW9uIiwiTWV0aG9kU2lnbmF0dXJlIiwiaXNBbmd1bGFyTGlmZWN5Y2xlSG9vayIsInZpc2l0TWV0aG9kRGVjbGFyYXRpb24iLCJQcm9wZXJ0eURlY2xhcmF0aW9uIiwiUHJvcGVydHlTaWduYXR1cmUiLCJHZXRBY2Nlc3NvciIsInZpc2l0UHJvcGVydHkiLCJDYWxsU2lnbmF0dXJlIiwidmlzaXRDYWxsRGVjbGFyYXRpb24iLCJJbmRleFNpZ25hdHVyZSIsInZpc2l0SW5kZXhEZWNsYXJhdGlvbiIsIkNvbnN0cnVjdG9yIiwiX2NvbnN0cnVjdG9yUHJvcGVydGllcyIsInZpc2l0Q29uc3RydWN0b3JEZWNsYXJhdGlvbiIsImoiLCJzb3J0IiwiZ2V0TmFtZXNDb21wYXJlRm4iLCJkZWNvcmF0b3IiLCJzZWxlY3RvciIsImV4cG9ydEFzIiwiZGVjb3JhdG9ySWRlbnRpZmllclRleHQiLCJjbGFzc0RlY2xhcmF0aW9uIiwiZ2V0U3ltYm9sQXRMb2NhdGlvbiIsImNsYXNzTmFtZSIsImRpcmVjdGl2ZUluZm8iLCJpc0RpcmVjdGl2ZURlY29yYXRvciIsInZpc2l0RGlyZWN0aXZlRGVjb3JhdG9yIiwidmlzaXRNZW1iZXJzIiwiaXNTZXJ2aWNlRGVjb3JhdG9yIiwiaXNQaXBlRGVjb3JhdG9yIiwiaXNNb2R1bGVEZWNvcmF0b3IiLCJkZWNsYXJhdGlvbkxpc3QiLCJkZWNsYXJhdGlvbnMiLCJ0eXBlTmFtZSIsImFkZFJvdXRlIiwiZ2VuZXJhdGUiLCJmaWxlbmFtZSIsInJlcyIsInN0YXRlbWVudHMiLCJyZWR1Y2UiLCJkaXJlY3RpdmUiLCJzdGF0ZW1lbnQiLCJWYXJpYWJsZVN0YXRlbWVudCIsImNvbmNhdCIsInZpc2l0RW51bURlY2xhcmF0aW9uIiwidmlzaXRDbGFzc0RlY2xhcmF0aW9uIiwiSW50ZXJmYWNlRGVjbGFyYXRpb24iLCJwb3MiLCJlbmQiLCJpZGVudGlmaWVyIiwibGFiZWwiLCJuc01vZHVsZSIsImdldFR5cGUiLCJfX25zTW9kdWxlIiwic2FuaXRpemVVcmxzIiwidCIsImRldGVjdEluZGVudCIsInVybHMiLCJtdWx0aUxpbmUiLCJwYXJzZVByb3BlcnRpZXMiLCJvYmoiLCJwYXJzZVN5bWJvbFRleHQiLCJidWlsZElkZW50aWZpZXJOYW1lIiwibm9kZU5hbWUiLCJ1bmtub3duIiwiZWwiLCJTcHJlYWRFbGVtZW50RXhwcmVzc2lvbiIsInBhcnNlUHJvdmlkZXJDb25maWd1cmF0aW9uIiwiX2dlblByb3ZpZGVyTmFtZSIsIl9wcm92aWRlclByb3BzIiwiYm9keSIsInBhcmFtcyIsInBhcnNlU3ltYm9sRWxlbWVudHMiLCJmdW5jdGlvbkFyZ3MiLCJwYXJzZVN5bWJvbHMiLCJnbG9iIiwiJGh0bWxlbmdpbmUiLCJIdG1sRW5naW5lIiwiJGZpbGVlbmdpbmUiLCJGaWxlRW5naW5lIiwiJG1hcmtkb3duZW5naW5lIiwiTWFya2Rvd25FbmdpbmUiLCIkbmdkZW5naW5lIiwiTmdkRW5naW5lIiwiJHNlYXJjaEVuZ2luZSIsIlNlYXJjaEVuZ2luZSIsInN0YXJ0VGltZSIsIkRhdGUiLCJjb25maWd1cmF0aW9uIiwiZ2V0UGlwZXMiLCJhZGRQYWdlIiwiZ2V0Q2xhc3NlcyIsImdldERpcmVjdGl2ZXMiLCJvcHRpb24iLCJpbml0IiwidGhlbiIsInByb2Nlc3NQYWNrYWdlSnNvbiIsImdldCIsInBhY2thZ2VEYXRhIiwicGFyc2VkRGF0YSIsImRvY3VtZW50YXRpb25NYWluTmFtZSIsImRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb24iLCJwcm9jZXNzTWFya2Rvd24iLCJlcnJvck1lc3NhZ2UiLCJnZXRSZWFkbWVGaWxlIiwicmVhZG1lRGF0YSIsInJlYWRtZSIsImdldERlcGVuZGVuY2llc0RhdGEiLCJjcmF3bGVyIiwiRGVwZW5kZW5jaWVzIiwidHNjb25maWciLCJkZXBlbmRlbmNpZXNEYXRhIiwiZ2V0RGVwZW5kZW5jaWVzIiwicHJlcGFyZU1vZHVsZXMiLCJwcmVwYXJlQ29tcG9uZW50cyIsInByZXBhcmVEaXJlY3RpdmVzIiwicHJlcGFyZUluamVjdGFibGVzIiwicHJlcGFyZVJvdXRlcyIsInByZXBhcmVQaXBlcyIsInByZXBhcmVDbGFzc2VzIiwicHJlcGFyZUludGVyZmFjZXMiLCJwcmVwYXJlQ292ZXJhZ2UiLCJwcm9jZXNzUGFnZXMiLCJnZXRNb2R1bGVzIiwiZ2V0SW50ZXJmYWNlcyIsImdldENvbXBvbmVudHMiLCJkaXJuYW1lIiwicmVhZG1lRmlsZSIsImdldEluamVjdGFibGVzIiwiZ2V0Um91dGVzIiwidG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCIsImdldFN0YXR1cyIsInBlcmNlbnQiLCJzdGF0dXMiLCJjbCIsInRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCIsInRvdGFsU3RhdGVtZW50cyIsInByb3BlcnRpZXNDbGFzcyIsIm1ldGhvZHNDbGFzcyIsImlucHV0c0NsYXNzIiwib3V0cHV0c0NsYXNzIiwiaW5wdXQiLCJjb3ZlcmFnZVBlcmNlbnQiLCJmbG9vciIsImNvdmVyYWdlQ291bnQiLCJjbGFzc2UiLCJpbmplY3RhYmxlIiwiaW50ZXIiLCJwaXBlIiwiY292ZXJhZ2VEYXRhIiwicmVuZGVyIiwiaHRtbERhdGEiLCJpbmRleFBhZ2UiLCJnZW5lcmF0ZVNlYXJjaEluZGV4SnNvbiIsImFzc2V0c0ZvbGRlciIsInByb2Nlc3NBc3NldHNGb2xkZXIiLCJwcm9jZXNzUmVzb3VyY2VzIiwiZXh0VGhlbWUiLCJwcm9jZXNzR3JhcGhzIiwib25Db21wbGV0ZSIsImZpbmFsVGltZSIsInNlcnZlIiwicnVuV2ViU2VydmVyIiwicmVuZGVyR3JhcGgiLCJmaW5hbE1haW5HcmFwaFBhdGgiLCJvcGVuIiwidXNhZ2UiLCJvdXRwdXRIZWxwIiwiZXhpdCIsImluY2x1ZGVzIiwiaW5jbHVkZXNOYW1lIiwiaGlkZUdlbmVyYXRvciIsImRlZmF1bHRXYWxrRk9sZGVyIiwid2FsayIsImRpciIsImV4Y2x1ZGUiLCJyZXN1bHRzIiwibGlzdCIsInN0YXQiLCJpc0RpcmVjdG9yeSIsIl9maWxlIiwic291cmNlRm9sZGVyIiwiQXBwbGljYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxRQUFRQyxRQUFRLFdBQVIsQ0FBWjtBQUNBLElBQUlDLElBQUlGLE1BQU1HLE1BQWQ7QUFDQSxJQUFJQyxRQUFNSCxRQUFRLGlCQUFSLENBQVY7QUFFQSxJQUFLSSxLQUFMO0FBQUEsV0FBS0E7MkJBQ0osVUFBQTs0QkFDQSxXQUFBOzRCQUNHLFdBQUE7Q0FISixFQUFLQSxVQUFBQSxVQUFBLENBQUw7Ozs7OzthQWNPQyxJQUFMLEdBQVlGLE1BQUlFLElBQWhCO2FBQ0tDLE9BQUwsR0FBZUgsTUFBSUcsT0FBbkI7YUFDS0MsTUFBTCxHQUFjUixNQUFNUyxHQUFwQjthQUNLQyxNQUFMLEdBQWMsSUFBZDs7Ozs7O2dCQUlHLENBQUMsS0FBS0EsTUFBVCxFQUFpQjs7OENBRFZDOzs7O2lCQUVGSCxNQUFMLENBQ0MsS0FBS0ks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
