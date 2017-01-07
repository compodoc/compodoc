'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs-extra');
var path = require('path');
var LiveServer = require('live-server');
var marked = require('marked');
var marked__default = _interopDefault(marked);
var Handlebars = require('handlebars');
var highlightjs = _interopDefault(require('highlight.js'));
var _ = require('lodash');
var Shelljs = require('shelljs');
var ts = require('typescript');

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
                return arg.name + ': ' + arg.type;
            }).join(', ');
            if (method.name) {
                return method.name + '(' + args + ')';
            } else {
                return '(' + args + ')';
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
            var partials = ['menu', 'overview', 'readme', 'modules', 'module', 'components', 'component', 'directives', 'directive', 'injectables', 'injectable', 'pipes', 'pipe', 'classes', 'class', 'interface', 'routes', 'search-results', 'search-input'],
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
                                _result = _template({
                                data: o
                            });
                            resolve$$1(_result);
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
    disableSourceCode: false
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
            disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode
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

var DependenciesEngine = function () {
    function DependenciesEngine(data) {
        classCallCheck(this, DependenciesEngine);

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

    createClass(DependenciesEngine, [{
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
    }]);
    return DependenciesEngine;
}();

var isGlobal = require('is-global-exec');

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
        key: 'isPrivateOrInternal',
        value: function isPrivateOrInternal(member) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            return (member.flags & ts.NodeFlags.Private) !== 0;
        }
    }, {
        key: 'isInternalMember',
        value: function isInternalMember(member) {
            /**
             * Copyright https://github.com/ng-bootstrap/ng-bootstrap
             */
            var comment = [];
            if (member.symbol) {
                comment = member.symbol.getDocumentationComment();
            }
            var jsDoc = ts.displayPartsToString(comment);
            return jsDoc.trim().length === 0 || jsDoc.indexOf('@internal') > -1;
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
            return {
                name: method.name.text,
                description: marked__default(ts.displayPartsToString(method.symbol.getDocumentationComment())),
                args: method.parameters ? method.parameters.map(function (prop) {
                    return _this10.visitArgument(prop);
                }) : [],
                returnType: this.visitType(method.type)
            };
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
                        kind = members[i].kind;
                    } else if (members[i].kind === ts.SyntaxKind.IndexSignature) {
                        properties.push(this.visitIndexDeclaration(members[i]));
                        kind = members[i].kind;
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
var $dependenciesEngine = void 0;
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
                tsconfigDirectory: cwd$1
            });
            var dependenciesData = crawler.getDependencies();
            $dependenciesEngine = new DependenciesEngine(dependenciesData);
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
                    _this6.processResources();
                }
            };
            loop();
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
                        fs.copy(path.resolve(process.cwd() + path.sep + that.configuration.mainData.extTheme), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output + '/styles/'), function (err) {
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

            logger.info('Process main graph');
            var modules = this.configuration.mainData.modules,
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
                    var finalTime = (new Date() - startTime) / 1000;
                    logger.info('Documentation generated in ' + _this7.configuration.mainData.output + ' in ' + finalTime + ' seconds using ' + _this7.configuration.mainData.theme + ' theme');
                    if (_this7.configuration.mainData.serve) {
                        logger.info('Serving documentation from ' + _this7.configuration.mainData.output + ' at http://127.0.0.1:' + _this7.configuration.mainData.port);
                        _this7.runWebServer(_this7.configuration.mainData.output);
                    }
                }
            };
            var finalMainGraphPath = this.configuration.mainData.output;
            if (finalMainGraphPath.lastIndexOf('/') === -1) {
                finalMainGraphPath += '/';
            }
            finalMainGraphPath += 'graph';
            $ngdengine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath), 'p').then(function () {
                loop();
            }, function (err) {
                logger.error('Error during graph generation: ', err);
            });
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

            program.version(pkg.version).usage('<src> [options]').option('-p, --tsconfig [config]', 'A tsconfig.json file').option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder).option('-b, --base [base]', 'Base reference of html tag <base>', COMPODOC_DEFAULTS.base).option('-y, --extTheme [file]', 'External styling theme file').option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title).option('-o, --open', 'Open the generated documentation', false).option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false).option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false).option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port).option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)').option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false).option('--disableSourceCode', 'Do not add source code tab', false).parse(process.argv);
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
                                files = walk(defaultWalkFOlder, exclude);
                            }
                            get(CliApplication.prototype.__proto__ || Object.getPrototypeOf(CliApplication.prototype), 'setFiles', _this2).call(_this2, files);
                            get(CliApplication.prototype.__proto__ || Object.getPrototypeOf(CliApplication.prototype), 'generate', _this2).call(_this2);
                        }
                    } else if (program.args.length > 0) {
                        var sourceFolder = program.args[0];
                        if (!fs.existsSync(sourceFolder)) {
                            logger.error('Provided source folder ' + sourceFolder + ' was not found in the current directory');
                            process.exit(1);
                        } else {
                            logger.info('Using provided source folder');
                            files = walk(sourceFolder, []);
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
