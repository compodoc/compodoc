'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var LiveServer = require('live-server');
var Handlebars = require('handlebars');
var ts = require('typescript');

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
    LEVEL[LEVEL["WARN"] = 3] = "WARN";
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
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.WARN].concat(args)));
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
            case LEVEL.WARN:
                msg = c.yellow(msg);
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
    DependenciesEngine.prototype.cleanModules = function (modules) {
        var _m = modules, i = 0, len = modules.length;
        for (i; i < len; i++) {
            var j = 0, leng = _m[i].declarations.length;
            for (j; j < leng; j++) {
                var k = 0, lengt = void 0;
                if (_m[i].declarations[j].jsdoctags) {
                    lengt = _m[i].declarations[j].jsdoctags.length;
                    for (k; k < lengt; k++) {
                        delete _m[i].declarations[j].jsdoctags[k].parent;
                    }
                }
                if (_m[i].declarations[j].constructorObj) {
                    if (_m[i].declarations[j].constructorObj.jsdoctags) {
                        lengt = _m[i].declarations[j].constructorObj.jsdoctags.length;
                        for (k; k < lengt; k++) {
                            delete _m[i].declarations[j].constructorObj.jsdoctags[k].parent;
                        }
                    }
                }
                if (_m[i].declarations[j].methodsClass && _m[i].declarations[j].methodsClass.length > 0) {
                    var l = 0, length = _m[i].declarations[j].methodsClass.length;
                    for (l; l < length; l++) {
                        delete _m[i].declarations[j].methodsClass[l].jsdoctags;
                    }
                }
                if (_m[i].declarations[j].propertiesClass && _m[i].declarations[j].propertiesClass.length > 0) {
                    var l = 0, length = _m[i].declarations[j].propertiesClass.length;
                    for (l; l < length; l++) {
                        delete _m[i].declarations[j].propertiesClass[l].jsdoctags;
                    }
                }
                delete _m[i].declarations[j].sourceCode;
            }
            delete _m[i].sourceCode;
        }
        return _m;
    };
    DependenciesEngine.prototype.init = function (data) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.rawModulesForOverview = _.sortBy(_.cloneDeep(this.cleanModules(data.modules)), ['name']);
        this.rawModules = _.sortBy(_.cloneDeep(this.cleanModules(data.modules)), ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.routes = this.rawData.routesTree;
        this.cleanRawModulesForOverview();
    };
    DependenciesEngine.prototype.find = function (type) {
        var finderInCompodocDependencies = function (data) {
            var _result = {
                source: 'internal',
                data: null
            }, i = 0, len = data.length;
            for (i; i < len; i++) {
                if (typeof type !== 'undefined') {
                    if (type.indexOf(data[i].name) !== -1) {
                        _result.data = data[i];
                    }
                }
            }
            return _result;
        }, resultInCompodocInjectables = finderInCompodocDependencies(this.injectables), resultInCompodocInterfaces = finderInCompodocDependencies(this.interfaces), resultInCompodocClasses = finderInCompodocDependencies(this.classes), resultInCompodocComponents = finderInCompodocDependencies(this.components), resultInAngularAPIs = finderInAngularAPIs(type);
        if (resultInCompodocInjectables.data !== null) {
            return resultInCompodocInjectables;
        }
        else if (resultInCompodocInterfaces.data !== null) {
            return resultInCompodocInterfaces;
        }
        else if (resultInCompodocClasses.data !== null) {
            return resultInCompodocClasses;
        }
        else if (resultInCompodocComponents.data !== null) {
            return resultInCompodocComponents;
        }
        else if (resultInAngularAPIs.data !== null) {
            return resultInAngularAPIs;
        }
    };
    DependenciesEngine.prototype.update = function (updatedData) {
        var _this = this;
        if (updatedData.modules.length > 0) {
            _.forEach(updatedData.modules, function (module) {
                var _index = _.findIndex(_this.modules, { 'name': module.name });
                _this.modules[_index] = module;
            });
        }
        if (updatedData.components.length > 0) {
            _.forEach(updatedData.components, function (component) {
                var _index = _.findIndex(_this.components, { 'name': component.name });
                _this.components[_index] = component;
            });
        }
        if (updatedData.directives.length > 0) {
            _.forEach(updatedData.directives, function (directive) {
                var _index = _.findIndex(_this.directives, { 'name': directive.name });
                _this.directives[_index] = directive;
            });
        }
        if (updatedData.injectables.length > 0) {
            _.forEach(updatedData.injectables, function (injectable) {
                var _index = _.findIndex(_this.injectables, { 'name': injectable.name });
                _this.injectables[_index] = injectable;
            });
        }
        if (updatedData.interfaces.length > 0) {
            _.forEach(updatedData.interfaces, function (int) {
                var _index = _.findIndex(_this.interfaces, { 'name': int.name });
                _this.interfaces[_index] = int;
            });
        }
        if (updatedData.pipes.length > 0) {
            _.forEach(updatedData.pipes, function (pipe) {
                var _index = _.findIndex(_this.pipes, { 'name': pipe.name });
                _this.pipes[_index] = pipe;
            });
        }
        if (updatedData.classes.length > 0) {
            _.forEach(updatedData.classes, function (classe) {
                var _index = _.findIndex(_this.classes, { 'name': classe.name });
                _this.classes[_index] = classe;
            });
        }
        /**
         * Miscellaneous update
         */
        if (updatedData.miscellaneous.variables.length > 0) {
            _.forEach(updatedData.miscellaneous.variables, function (variable) {
                var _index = _.findIndex(_this.miscellaneous.variables, {
                    'name': variable.name,
                    'file': variable.file
                });
                _this.miscellaneous.variables[_index] = variable;
            });
        }
        if (updatedData.miscellaneous.functions.length > 0) {
            _.forEach(updatedData.miscellaneous.functions, function (func) {
                var _index = _.findIndex(_this.miscellaneous.functions, {
                    'name': func.name,
                    'file': func.file
                });
                _this.miscellaneous.functions[_index] = func;
            });
        }
        if (updatedData.miscellaneous.typealiases.length > 0) {
            _.forEach(updatedData.miscellaneous.typealiases, function (typealias) {
                var _index = _.findIndex(_this.miscellaneous.typealiases, {
                    'name': typealias.name,
                    'file': typealias.file
                });
                _this.miscellaneous.typealiases[_index] = typealias;
            });
        }
        if (updatedData.miscellaneous.enumerations.length > 0) {
            _.forEach(updatedData.miscellaneous.enumerations, function (enumeration) {
                var _index = _.findIndex(_this.miscellaneous.enumerations, {
                    'name': enumeration.name,
                    'file': enumeration.file
                });
                _this.miscellaneous.enumerations[_index] = enumeration;
            });
        }
        if (updatedData.miscellaneous.types.length > 0) {
            _.forEach(updatedData.miscellaneous.types, function (typ) {
                var _index = _.findIndex(_this.miscellaneous.types, {
                    'name': typ.name,
                    'file': typ.file
                });
                _this.miscellaneous.types[_index] = typ;
            });
        }
        this.prepareMiscellaneous();
    };
    DependenciesEngine.prototype.findInCompodoc = function (name) {
        var mergedData = _.concat([], this.modules, this.components, this.directives, this.injectables, this.interfaces, this.pipes, this.classes), result = _.find(mergedData, { 'name': name });
        return result || false;
    };
    DependenciesEngine.prototype.cleanRawModulesForOverview = function () {
        _.forEach(this.rawModulesForOverview, function (module) {
            module.declarations = [];
            module.providers = [];
        });
    };
    DependenciesEngine.prototype.prepareMiscellaneous = function () {
        //group each subgoup by file
        this.miscellaneous.groupedVariables = _.groupBy(this.miscellaneous.variables, 'file');
        this.miscellaneous.groupedFunctions = _.groupBy(this.miscellaneous.functions, 'file');
        this.miscellaneous.groupedEnumerations = _.groupBy(this.miscellaneous.enumerations, 'file');
    };
    DependenciesEngine.prototype.getModule = function (name) {
        return _.find(this.modules, ['name', name]);
    };
    DependenciesEngine.prototype.getRawModule = function (name) {
        return _.find(this.rawModules, ['name', name]);
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
    DependenciesEngine.prototype.getMiscellaneous = function () {
        return this.miscellaneous;
    };
    DependenciesEngine._instance = new DependenciesEngine();
    return DependenciesEngine;
}());

var $dependenciesEngine = DependenciesEngine.getInstance();

function extractLeadingText(string, completeTag) {
    var tagIndex = string.indexOf(completeTag);
    var leadingText = null;
    var leadingTextRegExp = /\[(.+?)\]/g;
    var leadingTextInfo = leadingTextRegExp.exec(string);
    // did we find leading text, and if so, does it immediately precede the tag?
    while (leadingTextInfo && leadingTextInfo.length) {
        if (leadingTextInfo.index + leadingTextInfo[0].length === tagIndex) {
            string = string.replace(leadingTextInfo[0], '');
            leadingText = leadingTextInfo[1];
            break;
        }
        leadingTextInfo = leadingTextRegExp.exec(string);
    }
    return {
        leadingText: leadingText,
        string: string
    };
}
function splitLinkText(text) {
    var linkText;
    var target;
    var splitIndex;
    // if a pipe is not present, we split on the first space
    splitIndex = text.indexOf('|');
    if (splitIndex === -1) {
        splitIndex = text.search(/\s/);
    }
    if (splitIndex !== -1) {
        linkText = text.substr(splitIndex + 1);
        // Normalize subsequent newlines to a single space.
        linkText = linkText.replace(/\n+/, ' ');
        target = text.substr(0, splitIndex);
    }
    return {
        linkText: linkText,
        target: target || text
    };
}
var LinkParser = (function () {
    var processTheLink = function (string, tagInfo) {
        var leading = extractLeadingText(string, tagInfo.completeTag), linkText = leading.leadingText || '', split, target, stringtoReplace;
        split = splitLinkText(tagInfo.text);
        target = split.target;
        if (leading.leadingText !== null) {
            stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
        }
        else if (typeof split.linkText !== 'undefined') {
            stringtoReplace = tagInfo.completeTag;
            linkText = split.linkText;
        }
        return string.replace(stringtoReplace, '[' + linkText + '](' + target + ')');
    };
    /**
     * Convert
     * {@link http://www.google.com|Google} or {@link https://github.com GitHub} to [Github](https://github.com)
     */
    var replaceLinkTag = function (str) {
        var tagRegExp = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), matches, previousString, tagInfo = [];
        function replaceMatch(replacer, tag, match, text) {
            var matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);
            return replacer(str, matchedTag);
        }
        do {
            matches = tagRegExp.exec(str);
            if (matches) {
                previousString = str;
                str = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
            }
        } while (matches && previousString !== str);
        return {
            newString: str
        };
    };
    var _resolveLinks = function (str) {
        return replaceLinkTag(str).newString;
    };
    return {
        resolveLinks: _resolveLinks
    };
})();

var COMPODOC_DEFAULTS = {
    title: 'Application documentation',
    additionalEntryName: 'Additional documentation',
    additionalEntryPath: 'additional-documentation',
    folder: './documentation/',
    port: 8080,
    theme: 'gitbook',
    base: '/',
    defaultCoverageThreshold: 70,
    disableSourceCode: false,
    disableGraph: false,
    disableCoverage: false,
    disablePrivateOrInternalSupport: false,
    PAGE_TYPES: {
        ROOT: 'root',
        INTERNAL: 'internal'
    }
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
            additionalPages: [],
            pipes: [],
            classes: [],
            interfaces: [],
            components: [],
            directives: [],
            injectables: [],
            miscellaneous: [],
            routes: [],
            tsconfig: '',
            toggleMenuItems: [],
            includes: '',
            includesName: COMPODOC_DEFAULTS.additionalEntryName,
            includesFolder: COMPODOC_DEFAULTS.additionalEntryPath,
            disableSourceCode: COMPODOC_DEFAULTS.disableSourceCode,
            disableGraph: COMPODOC_DEFAULTS.disableGraph,
            disableCoverage: COMPODOC_DEFAULTS.disableCoverage,
            disablePrivateOrInternalSupport: COMPODOC_DEFAULTS.disablePrivateOrInternalSupport,
            watch: false,
            mainGraph: '',
            coverageTest: false,
            coverageTestThreshold: COMPODOC_DEFAULTS.defaultCoverageThreshold,
            routesLength: 0,
            angularVersion: ''
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
    Configuration.prototype.addAdditionalPage = function (page) {
        this._mainData.additionalPages.push(page);
    };
    Configuration.prototype.resetPages = function () {
        this._pages = [];
    };
    Configuration.prototype.resetAdditionalPages = function () {
        this._mainData.additionalPages = [];
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
    Configuration._instance = new Configuration();
    return Configuration;
}());

var semver = require('semver');
function cleanVersion(version) {
    return version.replace('~', '')
        .replace('^', '')
        .replace('=', '')
        .replace('<', '')
        .replace('>', '');
}
function getAngularVersionOfProject(packageData) {
    var _result = '';
    if (packageData['dependencies']) {
        var angularCore = packageData['dependencies']['@angular/core'];
        if (angularCore) {
            _result = cleanVersion(angularCore);
        }
    }
    return _result;
}
function isAngularVersionArchived(version) {
    var result;
    try {
        result = semver.compare(version, '2.4.10') <= 0;
    }
    catch (e) { }
    return result;
}
function prefixOfficialDoc(version) {
    return isAngularVersionArchived(version) ? 'v2.' : '';
}

var HtmlEngineHelpers = (function () {
    var init = function () {
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
        Handlebars.registerHelper("or", function () {
            var len = arguments.length - 1;
            var options = arguments[len];
            for (var i = 0; i < len; i++) {
                if (arguments[i]) {
                    return options.fn(this);
                }
            }
            return options.inverse(this);
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
        Handlebars.registerHelper('escapeSimpleQuote', function (text) {
            if (!text)
                return;
            var _text = text.replace(/'/g, "\\'");
            _text = _text.replace(/(\r\n|\n|\r)/gm, '');
            return _text;
        });
        Handlebars.registerHelper('breakComma', function (text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/,/g, ',<br>');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('modifKind', function (kind) {
            // https://github.com/Microsoft/TypeScript/blob/73ee2feb51c9b7e24a29eb4cee19d7c14b933065/lib/typescript.d.ts#L64
            var _kindText = '';
            switch (kind) {
                case 112:
                    _kindText = 'Private';
                    break;
                case 113:
                    _kindText = 'Protected';
                    break;
                case 114:
                    _kindText = 'Public';
                    break;
                case 115:
                    _kindText = 'Static';
                    break;
            }
            return new Handlebars.SafeString(_kindText);
        });
        Handlebars.registerHelper('modifIcon', function (kind) {
            // https://github.com/Microsoft/TypeScript/blob/73ee2feb51c9b7e24a29eb4cee19d7c14b933065/lib/typescript.d.ts#L64
            var _kindText = '';
            switch (kind) {
                case 112:
                    _kindText = 'lock';
                    break;
                case 113:
                    _kindText = 'circle';
                    break;
                case 115:
                    _kindText = 'square';
                case 83:
                    _kindText = 'export';
                    break;
            }
            return _kindText;
        });
        /**
         * Convert {@link MyClass} to [MyClass](http://localhost:8080/classes/MyClass.html)
         */
        Handlebars.registerHelper('parseDescription', function (description, depth) {
            var tagRegExp = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), matches, previousString, tagInfo = [];
            var processTheLink = function (string, tagInfo) {
                var leading = extractLeadingText(string, tagInfo.completeTag), split, result, newLink, rootPath, stringtoReplace;
                split = splitLinkText(tagInfo.text);
                if (typeof split.linkText !== 'undefined') {
                    result = $dependenciesEngine.findInCompodoc(split.target);
                }
                else {
                    result = $dependenciesEngine.findInCompodoc(tagInfo.text);
                }
                if (result) {
                    if (leading.leadingText !== null) {
                        stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
                    }
                    else if (typeof split.linkText !== 'undefined') {
                        stringtoReplace = tagInfo.completeTag;
                    }
                    else {
                        stringtoReplace = tagInfo.completeTag;
                    }
                    if (result.type === 'class')
                        result.type = 'classe';
                    rootPath = '';
                    switch (depth) {
                        case 0:
                            rootPath = './';
                            break;
                        case 1:
                            rootPath = '../';
                            break;
                        case 2:
                            rootPath = '../../';
                            break;
                    }
                    var label = result.name;
                    if (leading.leadingText !== null) {
                        label = leading.leadingText;
                    }
                    if (typeof split.linkText !== 'undefined') {
                        label = split.linkText;
                    }
                    newLink = "<a href=\"" + rootPath + result.type + "s/" + result.name + ".html\">" + label + "</a>";
                    return string.replace(stringtoReplace, newLink);
                }
                else {
                    return string;
                }
            };
            function replaceMatch(replacer, tag, match, text) {
                var matchedTag = {
                    completeTag: match,
                    tag: tag,
                    text: text
                };
                tagInfo.push(matchedTag);
                return replacer(description, matchedTag);
            }
            do {
                matches = tagRegExp.exec(description);
                if (matches) {
                    previousString = description;
                    description = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                }
            } while (matches && previousString !== description);
            return description;
        });
        Handlebars.registerHelper('relativeURL', function (currentDepth, context) {
            var result = '';
            switch (currentDepth) {
                case 0:
                    result = './';
                    break;
                case 1:
                    result = '../';
                    break;
                case 2:
                    result = '../../';
                    break;
            }
            return result;
        });
        Handlebars.registerHelper('functionSignature', function (method) {
            var args = [], configuration = Configuration.getInstance(), angularDocPrefix = prefixOfficialDoc(configuration.mainData.angularVersion);
            if (method.args) {
                args = method.args.map(function (arg) {
                    var _result = $dependenciesEngine.find(arg.type);
                    if (_result) {
                        if (_result.source === 'internal') {
                            var path$$1 = _result.data.type;
                            if (_result.data.type === 'class')
                                path$$1 = 'classe';
                            return arg.name + ": <a href=\"../" + path$$1 + "s/" + _result.data.name + ".html\">" + arg.type + "</a>";
                        }
                        else {
                            var path$$1 = "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + _result.data.path;
                            return arg.name + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + arg.type + "</a>";
                        }
                    }
                    else {
                        return arg.name + ": " + arg.type;
                    }
                }).join(', ');
            }
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
        Handlebars.registerHelper('jsdoc-component-example', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            var cleanTag = function (comment) {
                if (comment.charAt(0) === '*') {
                    comment = comment.substring(1, comment.length);
                }
                if (comment.charAt(0) === ' ') {
                    comment = comment.substring(1, comment.length);
                }
                return comment;
            };
            var type = 'html';
            if (options.hash.type) {
                type = options.hash.type;
            }
            function htmlEntities(str) {
                return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            }
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'example') {
                        var tag = {};
                        if (jsdocTags[i].comment) {
                            tag.comment = "<pre class=\"line-numbers\"><code class=\"language-" + type + "\">" + htmlEntities(cleanTag(jsdocTags[i].comment)) + "</code></pre>";
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length > 0) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-example', function (jsdocTags, options) {
            var i = 0, len = jsdocTags.length, tags = [];
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'example') {
                        var tag = {};
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment.replace(/<caption>/g, '<b><i>').replace(/\/caption>/g, '/b></i>');
                        }
                        tags.push(tag);
                    }
                }
            }
            if (tags.length > 0) {
                this.tags = tags;
                return options.fn(this);
            }
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
                        if (jsdocTags[i].name) {
                            tag.name = jsdocTags[i].name.text;
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
            var _result = $dependenciesEngine.find(name), configuration = Configuration.getInstance(), angularDocPrefix = prefixOfficialDoc(configuration.mainData.angularVersion);
            if (_result) {
                this.type = {
                    raw: name
                };
                if (_result.source === 'internal') {
                    if (_result.data.type === 'class')
                        _result.data.type = 'classe';
                    this.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                    this.type.target = '_self';
                }
                else {
                    this.type.href = "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + _result.data.path;
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
        Handlebars.registerHelper('isNotToggle', function (type, options) {
            var configuration = Configuration.getInstance(), result = configuration.mainData.toggleMenuItems.indexOf(type);
            if (configuration.mainData.toggleMenuItems.indexOf('all') !== -1) {
                return options.inverse(this);
            }
            else if (result === -1) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        });
    };
    return {
        init: init
    };
})();

//import * as helpers from 'handlebars-helpers';
var HtmlEngine = (function () {
    function HtmlEngine() {
        this.cache = {};
        HtmlEngineHelpers.init();
    }
    HtmlEngine.prototype.init = function () {
        var _this = this;
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
            'block-enum',
            'block-property',
            'block-index',
            'block-constructor',
            'coverage-report',
            'miscellaneous',
            'additional-page'
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
                fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', function (err, data) {
                    if (err) {
                        reject('Error during index generation');
                    }
                    else {
                        _this.cache['page'] = data;
                        resolve$$1();
                    }
                });
            }
        };
        return new Promise(function (resolve$$1, reject) {
            loop(resolve$$1, reject);
        });
    };
    HtmlEngine.prototype.render = function (mainData, page) {
        var o = mainData, that = this;
        Object.assign(o, page);
        var template = Handlebars.compile(that.cache['page']), result = template({
            data: o
        });
        return result;
    };
    HtmlEngine.prototype.generateCoverageBadge = function (outputFolder, coverageData) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/coverage-badge.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during coverage badge generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        data: coverageData
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + '/images/coverage-badge.svg'), result, function (err) {
                        if (err) {
                            logger.error('Error during coverage badge file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    };
    return HtmlEngine;
}());

var marked$1 = require('marked');
var MarkdownEngine = (function () {
    function MarkdownEngine() {
        var _this = this;
        var renderer = new marked$1.Renderer();
        renderer.code = function (code, language) {
            var highlighted = code;
            if (!language) {
                language = 'none';
            }
            highlighted = _this.escape(code);
            return "<pre class=\"line-numbers\"><code class=\"language-" + language + "\">" + highlighted + "</code></pre>";
        };
        renderer.table = function (header, body) {
            return '<table class="table table-bordered compodoc-table">\n'
                + '<thead>\n'
                + header
                + '</thead>\n'
                + '<tbody>\n'
                + body
                + '</tbody>\n'
                + '</table>\n';
        };
        renderer.image = function (href, title, text) {
            var out = '<img src="' + href + '" alt="' + text + '" class="img-responsive"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += this.options.xhtml ? '/>' : '>';
            return out;
        };
        marked$1.setOptions({
            renderer: renderer,
            breaks: false
        });
    }
    MarkdownEngine.prototype.get = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                }
                else {
                    resolve$$1(marked$1(data));
                }
            });
        });
    };
    MarkdownEngine.prototype.getReadmeFile = function () {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(process.cwd() + '/README.md'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during README.md file reading');
                }
                else {
                    resolve$$1(marked$1(data));
                }
            });
        });
    };
    MarkdownEngine.prototype.componentHasReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file), readmeFile = dirname$$1 + path.sep + 'README.md', readmeAlternativeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md';
        return fs.existsSync(readmeFile) || fs.existsSync(readmeAlternativeFile);
    };
    MarkdownEngine.prototype.componentReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file), readmeFile = dirname$$1 + path.sep + 'README.md', readmeAlternativeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md', finalPath = '';
        if (fs.existsSync(readmeFile)) {
            finalPath = readmeFile;
        }
        else {
            finalPath = readmeAlternativeFile;
        }
        return finalPath;
    };
    MarkdownEngine.prototype.escape = function (html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/@/g, '&#64;');
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

var ngdCr = require('@compodoc/ngd-core');
var ngdT = require('@compodoc/ngd-transformer');
var NgdEngine = (function () {
    function NgdEngine() {
    }
    NgdEngine.prototype.renderGraph = function (filepath, outputpath, type, name) {
        return new Promise(function (resolve$$1, reject) {
            ngdCr.logger.silent = false;
            var engine = new ngdT.DotEngine({
                output: outputpath,
                displayLegend: true,
                outputFormats: 'svg'
            });
            if (type === 'f') {
                engine
                    .generateGraph([$dependenciesEngine.getRawModule(name)])
                    .then(function (file) {
                    resolve$$1();
                }, function (error) {
                    reject(error);
                });
            }
            else {
                engine
                    .generateGraph($dependenciesEngine.rawModulesForOverview)
                    .then(function (file) {
                    resolve$$1();
                }, function (error) {
                    reject(error);
                });
            }
        });
    };
    NgdEngine.prototype.readGraph = function (filepath, name) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during graph read ' + name);
                }
                else {
                    resolve$$1(data);
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
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/search-index.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during search index generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        index: JSON.stringify(_this.getSearchIndex()),
                        store: JSON.stringify(_this.documentsStore)
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + '/js/search/search_index.js'), result, function (err) {
                        if (err) {
                            logger.error('Error during search index file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    };
    return SearchEngine;
}());

function cleanNameWithoutSpaceAndToLowerCase(name) {
    return name.toLowerCase().replace(/ /g, '-');
}
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
        if (n < 0) {
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
                if (fileName.substr(-5) === '.d.ts') {
                    return undefined;
                }
                if (path.isAbsolute(fileName) === false) {
                    fileName = path.join(transpileOptions.tsconfigDirectory, fileName);
                }
                if (!fs.existsSync(fileName)) {
                    return undefined;
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
function findMainSourceFolder(files) {
    var mainFolder = '', mainFolderCount = 0, rawFolders = files.map(function (filepath) {
        var shortPath = filepath.replace(process.cwd() + path.sep, '');
        return path.dirname(shortPath);
    }), folders = {}, i = 0;
    rawFolders = _.uniq(rawFolders);
    var len = rawFolders.length;
    for (i; i < len; i++) {
        var sep$$1 = rawFolders[i].split(path.sep);
        sep$$1.map(function (folder) {
            if (folders[folder]) {
                folders[folder] += 1;
            }
            else {
                folders[folder] = 1;
            }
        });
    }
    for (var f in folders) {
        if (folders[f] > mainFolderCount) {
            mainFolderCount = folders[f];
            mainFolder = f;
        }
    }
    return mainFolder;
}

var RouterParser = (function () {
    var routes = [], incompleteRoutes = [], modules = [], modulesTree, rootModule, cleanModulesTree, modulesWithRoutes = [], _addRoute = function (route) {
        routes.push(route);
        routes = _.sortBy(_.uniqWith(routes, _.isEqual), ['name']);
    }, _addIncompleteRoute = function (route) {
        incompleteRoutes.push(route);
        incompleteRoutes = _.sortBy(_.uniqWith(incompleteRoutes, _.isEqual), ['name']);
    }, _addModuleWithRoutes = function (moduleName, moduleImports) {
        modulesWithRoutes.push({
            name: moduleName,
            importsNode: moduleImports
        });
        modulesWithRoutes = _.sortBy(_.uniqWith(modulesWithRoutes, _.isEqual), ['name']);
    }, _addModule = function (moduleName, moduleImports) {
        modules.push({
            name: moduleName,
            importsNode: moduleImports
        });
        modules = _.sortBy(_.uniqWith(modules, _.isEqual), ['name']);
    }, _cleanRawRouteParsed = function (route) {
        var routesWithoutSpaces = route.replace(/ /gm, ''), testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma != -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return JSON.parse(routesWithoutSpaces);
    }, _cleanRawRoute = function (route) {
        var routesWithoutSpaces = route.replace(/ /gm, ''), testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma != -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return routesWithoutSpaces;
    }, _setRootModule = function (module) {
        rootModule = module;
    }, _hasRouterModuleInImports = function (imports) {
        var result = false, i = 0, len = imports.length;
        for (i; i < len; i++) {
            if (imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                result = true;
            }
        }
        return result;
    }, _fixIncompleteRoutes = function (miscellaneousVariables) {
        /*console.log('fixIncompleteRoutes');
        console.log('');
        console.log(routes);
        console.log('');*/
        //console.log(miscellaneousVariables);
        //console.log('');
        var i = 0, len = incompleteRoutes.length, matchingVariables = [];
        // For each incompleteRoute, scan if one misc variable is in code
        // if ok, try recreating complete route
        for (i; i < len; i++) {
            var j = 0, leng = miscellaneousVariables.length;
            for (j; j < leng; j++) {
                if (incompleteRoutes[i].data.indexOf(miscellaneousVariables[j].name) !== -1) {
                    console.log('found one misc var inside incompleteRoute');
                    console.log(miscellaneousVariables[j].name);
                    matchingVariables.push(miscellaneousVariables[j]);
                }
            }
            //Clean incompleteRoute
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace('[', '');
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace(']', '');
        }
        /*console.log(incompleteRoutes);
        console.log('');
        console.log(matchingVariables);
        console.log('');*/
    }, _linkModulesAndRoutes = function () {
        /*console.log('');
        console.log('linkModulesAndRoutes: ');
        //scan each module imports AST for each routes, and link routes with module
        console.log('linkModulesAndRoutes routes: ', routes);
        console.log('');*/
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
        /*console.log('');
        console.log('end linkModulesAndRoutes: ');
        console.log(util.inspect(routes, { depth: 10 }));
        console.log('');*/
    }, foundRouteWithModuleName = function (moduleName) {
        return _.find(routes, { 'module': moduleName });
    }, foundLazyModuleWithPath = function (path$$1) {
        //path is like app/customers/customers.module#CustomersModule
        var split = path$$1.split('#'), lazyModulePath = split[0], lazyModuleName = split[1];
        return lazyModuleName;
    }, _constructRoutesTree = function () {
        //console.log('');
        /*console.log('constructRoutesTree modules: ', modules);
        console.log('');
        console.log('constructRoutesTree modulesWithRoutes: ', modulesWithRoutes);
        console.log('');
        console.log('constructRoutesTree modulesTree: ', util.inspect(modulesTree, { depth: 10 }));
        console.log('');*/
        // routes[] contains routes with module link
        // modulesTree contains modules tree
        // make a final routes tree with that
        cleanModulesTree = _.cloneDeep(modulesTree);
        var modulesCleaner = function (arr) {
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
        //console.log('');
        //console.log('  cleanModulesTree light: ', util.inspect(cleanModulesTree, { depth: 10 }));
        //console.log('');
        //console.log(routes);
        //console.log('');
        var routesTree = {
            name: '<root>',
            kind: 'module',
            className: rootModule,
            children: []
        };
        var loopModulesParser = function (node) {
            if (node.children && node.children.length > 0) {
                //If module has child modules
                //console.log('   If module has child modules');
                for (var i in node.children) {
                    var route = foundRouteWithModuleName(node.children[i].name);
                    if (route && route.data) {
                        route.children = JSON.parse(route.data);
                        delete route.data;
                        route.kind = 'module';
                        routesTree.children.push(route);
                    }
                    if (node.children[i].children) {
                        loopModulesParser(node.children[i]);
                    }
                }
            }
            else {
                //else routes are directly inside the module
                //console.log('   else routes are directly inside the root module');
                var rawRoutes = foundRouteWithModuleName(node.name);
                if (rawRoutes) {
                    var routes_1 = JSON.parse(rawRoutes.data);
                    if (routes_1) {
                        var i_1 = 0, len = routes_1.length;
                        for (i_1; i_1 < len; i_1++) {
                            var route = routes_1[i_1];
                            if (routes_1[i_1].component) {
                                routesTree.children.push({
                                    kind: 'component',
                                    component: routes_1[i_1].component,
                                    path: routes_1[i_1].path
                                });
                            }
                        }
                    }
                }
            }
        };
        //console.log('');
        //console.log('  rootModule: ', rootModule);
        //console.log('');
        var startModule = _.find(cleanModulesTree, { 'name': rootModule });
        if (startModule) {
            loopModulesParser(startModule);
            //Loop twice for routes with lazy loading
            //loopModulesParser(routesTree);
        }
        /*console.log('');
        console.log('  routesTree: ', routesTree);
        console.log('');*/
        var cleanedRoutesTree = null;
        var cleanRoutesTree = function (route) {
            for (var i in route.children) {
                var routes = route.children[i].routes;
            }
            return route;
        };
        cleanedRoutesTree = cleanRoutesTree(routesTree);
        //Try updating routes with lazy loading
        //console.log('');
        //console.log('Try updating routes with lazy loading');
        var loopRoutesParser = function (route) {
            if (route.children) {
                var _loop_1 = function () {
                    if (route.children[i].loadChildren) {
                        var child = foundLazyModuleWithPath(route.children[i].loadChildren), module = _.find(cleanModulesTree, { 'name': child });
                        if (module) {
                            var _rawModule_1 = {};
                            _rawModule_1.kind = 'module';
                            _rawModule_1.children = [];
                            _rawModule_1.module = module.name;
                            var loopInside = function (mod) {
                                if (mod.children) {
                                    for (var i in mod.children) {
                                        var route_1 = foundRouteWithModuleName(mod.children[i].name);
                                        if (typeof route_1 !== 'undefined') {
                                            if (route_1.data) {
                                                route_1.children = JSON.parse(route_1.data);
                                                delete route_1.data;
                                                route_1.kind = 'module';
                                                _rawModule_1.children[i] = route_1;
                                            }
                                        }
                                    }
                                }
                            };
                            loopInside(module);
                            route.children[i].children = [];
                            route.children[i].children.push(_rawModule_1);
                        }
                    }
                    loopRoutesParser(route.children[i]);
                };
                for (var i in route.children) {
                    _loop_1();
                }
            }
        };
        loopRoutesParser(cleanedRoutesTree);
        //console.log('');
        //console.log('  cleanedRoutesTree: ', util.inspect(cleanedRoutesTree, { depth: 10 }));
        return cleanedRoutesTree;
    }, _constructModulesTree = function () {
        //console.log('');
        //console.log('constructModulesTree');
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
        /*console.log('');
        console.log('end constructModulesTree');
        console.log(modulesTree);*/
    }, _generateRoutesIndex = function (outputFolder, routes) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/routes-index.hbs'), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during routes index generation');
                }
                else {
                    var template = Handlebars.compile(data), result = template({
                        routes: JSON.stringify(routes)
                    });
                    outputFolder = outputFolder.replace(process.cwd(), '');
                    fs.outputFile(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + '/js/routes/routes_index.js'), result, function (err) {
                        if (err) {
                            logger.error('Error during routes index file generation ', err);
                            reject(err);
                        }
                        else {
                            resolve$$1();
                        }
                    });
                }
            });
        });
    }, _routesLength = function () {
        var _n = 0;
        var routesParser = function (route) {
            if (typeof route.path !== 'undefined') {
                _n += 1;
            }
            if (route.children) {
                for (var j in route.children) {
                    routesParser(route.children[j]);
                }
            }
        };
        for (var i in routes) {
            routesParser(routes[i]);
        }
        return _n;
    };
    return {
        incompleteRoutes: incompleteRoutes,
        addRoute: _addRoute,
        addIncompleteRoute: _addIncompleteRoute,
        addModuleWithRoutes: _addModuleWithRoutes,
        addModule: _addModule,
        cleanRawRouteParsed: _cleanRawRouteParsed,
        cleanRawRoute: _cleanRawRoute,
        setRootModule: _setRootModule,
        printRoutes: function () {
            console.log('');
            console.log('printRoutes: ');
            console.log(routes);
        },
        printModulesRoutes: function () {
            console.log('');
            console.log('printModulesRoutes: ');
            console.log(modulesWithRoutes);
        },
        routesLength: _routesLength,
        hasRouterModuleInImports: _hasRouterModuleInImports,
        fixIncompleteRoutes: _fixIncompleteRoutes,
        linkModulesAndRoutes: _linkModulesAndRoutes,
        constructRoutesTree: _constructRoutesTree,
        constructModulesTree: _constructModulesTree,
        generateRoutesIndex: _generateRoutesIndex
    };
})();

function isVariableLike(node) {
    if (node) {
        switch (node.kind) {
            case ts.SyntaxKind.BindingElement:
            case ts.SyntaxKind.EnumMember:
            case ts.SyntaxKind.Parameter:
            case ts.SyntaxKind.PropertyAssignment:
            case ts.SyntaxKind.PropertyDeclaration:
            case ts.SyntaxKind.PropertySignature:
            case ts.SyntaxKind.ShorthandPropertyAssignment:
            case ts.SyntaxKind.VariableDeclaration:
                return true;
        }
    }
    return false;
}
function some(array, predicate) {
    if (array) {
        if (predicate) {
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var v = array_1[_i];
                if (predicate(v)) {
                    return true;
                }
            }
        }
        else {
            return array.length > 0;
        }
    }
    return false;
}
function concatenate(array1, array2) {
    if (!some(array2))
        return array1;
    if (!some(array1))
        return array2;
    return array1.concat(array2);
}
function isParameter(node) {
    return node.kind === ts.SyntaxKind.Parameter;
}
function getJSDocParameterTags(param) {
    if (!isParameter(param)) {
        return undefined;
    }
    var func = param.parent;
    var tags = getJSDocTags(func, ts.SyntaxKind.JSDocParameterTag);
    if (!param.name) {
        // this is an anonymous jsdoc param from a `function(type1, type2): type3` specification
        var i = func.parameters.indexOf(param);
        var paramTags = filter(tags, function (tag) { return tag.kind === ts.SyntaxKind.JSDocParameterTag; });
        if (paramTags && 0 <= i && i < paramTags.length) {
            return [paramTags[i]];
        }
    }
    else if (param.name.kind === ts.SyntaxKind.Identifier) {
        var name_1 = param.name.text;
        return filter(tags, function (tag) { return tag.kind === ts.SyntaxKind.JSDocParameterTag && tag.parameterName.text === name_1; });
    }
    else {
        // TODO: it's a destructured parameter, so it should look up an "object type" series of multiple lines
        // But multi-line object types aren't supported yet either
        return undefined;
    }
}
var JSDocTagsParser = (function () {
    var _getJSDocs = function (node) {
        //console.log('getJSDocs: ', node);
        var cache = node.jsDocCache;
        if (!cache) {
            getJSDocsWorker(node);
            node.jsDocCache = cache;
        }
        return cache;
        function getJSDocsWorker(node) {
            var parent = node.parent;
            // Try to recognize this pattern when node is initializer of variable declaration and JSDoc comments are on containing variable statement.
            // /**
            //   * @param {number} name
            //   * @returns {number}
            //   */
            // var x = function(name) { return name.length; }
            var isInitializerOfVariableDeclarationInStatement = isVariableLike(parent) &&
                parent.initializer === node &&
                parent.parent.parent.kind === ts.SyntaxKind.VariableStatement;
            var isVariableOfVariableDeclarationStatement = isVariableLike(node) &&
                parent.parent.kind === ts.SyntaxKind.VariableStatement;
            var variableStatementNode = isInitializerOfVariableDeclarationInStatement ? parent.parent.parent :
                isVariableOfVariableDeclarationStatement ? parent.parent :
                    undefined;
            if (variableStatementNode) {
                getJSDocsWorker(variableStatementNode);
            }
            // Also recognize when the node is the RHS of an assignment expression
            var isSourceOfAssignmentExpressionStatement = parent && parent.parent &&
                parent.kind === ts.SyntaxKind.BinaryExpression &&
                parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
                parent.parent.kind === ts.SyntaxKind.ExpressionStatement;
            if (isSourceOfAssignmentExpressionStatement) {
                getJSDocsWorker(parent.parent);
            }
            var isModuleDeclaration = node.kind === ts.SyntaxKind.ModuleDeclaration &&
                parent && parent.kind === ts.SyntaxKind.ModuleDeclaration;
            var isPropertyAssignmentExpression = parent && parent.kind === ts.SyntaxKind.PropertyAssignment;
            if (isModuleDeclaration || isPropertyAssignmentExpression) {
                getJSDocsWorker(parent);
            }
            // Pull parameter comments from declaring function as well
            if (node.kind === ts.SyntaxKind.Parameter) {
                cache = concatenate(cache, getJSDocParameterTags(node));
            }
            if (isVariableLike(node) && node.initializer) {
                cache = concatenate(cache, node.initializer.jsDoc);
            }
            cache = concatenate(cache, node.jsDoc);
        }
    };
    return {
        getJSDocs: _getJSDocs
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

var AngularLifecycleHooks;
(function (AngularLifecycleHooks) {
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnChanges"] = 0] = "ngOnChanges";
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnInit"] = 1] = "ngOnInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngDoCheck"] = 2] = "ngDoCheck";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterContentInit"] = 3] = "ngAfterContentInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterContentChecked"] = 4] = "ngAfterContentChecked";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterViewInit"] = 5] = "ngAfterViewInit";
    AngularLifecycleHooks[AngularLifecycleHooks["ngAfterViewChecked"] = 6] = "ngAfterViewChecked";
    AngularLifecycleHooks[AngularLifecycleHooks["ngOnDestroy"] = 7] = "ngOnDestroy";
})(AngularLifecycleHooks || (AngularLifecycleHooks = {}));

var getCurrentDirectory = ts.sys.getCurrentDirectory;
var useCaseSensitiveFileNames = ts.sys.useCaseSensitiveFileNames;
var newLine = ts.sys.newLine;
function getNewLine() {
    return newLine;
}
function getCanonicalFileName(fileName) {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}
var formatDiagnosticsHost = {
    getCurrentDirectory: getCurrentDirectory,
    getCanonicalFileName: getCanonicalFileName,
    getNewLine: getNewLine
};
function readConfig(configFile) {
    var result = ts.readConfigFile(configFile, ts.sys.readFile);
    if (result.error) {
        var message = ts.formatDiagnostics([result.error], formatDiagnosticsHost);
        throw new Error(message);
    }
    return result.config;
}

function stripBom(source) {
    if (source.charCodeAt(0) === 0xFEFF) {
        return source.slice(1);
    }
    return source;
}
function hasBom(source) {
    return (source.charCodeAt(0) === 0xFEFF);
}
function handlePath(files, cwd) {
    var _files = files, i = 0, len = files.length;
    for (i; i < len; i++) {
        if (files[i].indexOf(cwd) === -1) {
            files[i] = path.resolve(cwd + path.sep + files[i]);
        }
    }
    return _files;
}
function cleanLifecycleHooksFromMethods(methods) {
    var result = [], i = 0, len = methods.length;
    for (i; i < len; i++) {
        if (!methods[i].name in AngularLifecycleHooks) {
            console.log('clean');
            result.push(methods[i]);
        }
    }
    return result;
}

var $ = require('cheerio');
var ComponentsTreeEngine = (function () {
    function ComponentsTreeEngine() {
        this.components = [];
        this.componentsForTree = [];
        if (ComponentsTreeEngine._instance) {
            throw new Error('Error: Instantiation failed: Use ComponentsTreeEngine.getInstance() instead of new.');
        }
        ComponentsTreeEngine._instance = this;
    }
    ComponentsTreeEngine.getInstance = function () {
        return ComponentsTreeEngine._instance;
    };
    ComponentsTreeEngine.prototype.addComponent = function (component) {
        this.components.push(component);
    };
    ComponentsTreeEngine.prototype.readTemplates = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.componentsForTree.length, $fileengine = new FileEngine(), loop = function () {
                if (i <= len - 1) {
                    if (_this.componentsForTree[i].templateUrl) {
                        $fileengine.get(path.dirname(_this.componentsForTree[i].file) + path.sep + _this.componentsForTree[i].templateUrl).then(function (templateData) {
                            _this.componentsForTree[i].templateData = templateData;
                            i++;
                            loop();
                        }, function (e) {
                            logger.error(e);
                            reject();
                        });
                    }
                    else {
                        _this.componentsForTree[i].templateData = _this.componentsForTree[i].template;
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
    ComponentsTreeEngine.prototype.findChildrenAndParents = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            _.forEach(_this.componentsForTree, function (component) {
                var $component = $(component.templateData);
                _.forEach(_this.componentsForTree, function (componentToFind) {
                    if ($component.find(componentToFind.selector).length > 0) {
                        console.log(componentToFind.name + ' found in ' + component.name);
                        component.children.push(componentToFind.name);
                    }
                });
            });
            resolve$$1();
        });
    };
    ComponentsTreeEngine.prototype.createTreesForComponents = function () {
        var _this = this;
        return new Promise(function (resolve$$1, reject) {
            _.forEach(_this.components, function (component) {
                var _component = {
                    name: component.name,
                    file: component.file,
                    selector: component.selector,
                    children: [],
                    template: '',
                    templateUrl: ''
                };
                if (typeof component.template !== 'undefined') {
                    _component.template = component.template;
                }
                if (component.templateUrl.length > 0) {
                    _component.templateUrl = component.templateUrl[0];
                }
                _this.componentsForTree.push(_component);
            });
            _this.readTemplates().then(function () {
                _this.findChildrenAndParents().then(function () {
                    console.log('this.componentsForTree: ', _this.componentsForTree);
                    resolve$$1();
                }, function (e) {
                    logger.error(e);
                    reject();
                });
            }, function (e) {
                logger.error(e);
            });
        });
    };
    ComponentsTreeEngine._instance = new ComponentsTreeEngine();
    return ComponentsTreeEngine;
}());

var $componentsTreeEngine = ComponentsTreeEngine.getInstance();

var marked$2 = require('marked');
var Dependencies = (function () {
    function Dependencies(files, options) {
        this.__cache = {};
        this.__nsModule = {};
        this.unknown = '???';
        this.configuration = Configuration.getInstance();
        this.files = files;
        var transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
        this.typeChecker = this.program.getTypeChecker();
    }
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
            'interfaces': [],
            'miscellaneous': {
                variables: [],
                functions: [],
                typealiases: [],
                enumerations: [],
                types: []
            }
        };
        var sourceFiles = this.program.getSourceFiles() || [];
        /**
         * Clean files with UTF-8 BOM
         */
        sourceFiles.forEach(function (file, index) {
            var filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    if (hasBom(file.text)) {
                        var text = stripBom(file.text), tt = file.update(text, {
                            newLength: text.length,
                            span: {
                                start: 0,
                                length: file.text.length
                            }
                        });
                        if (!tt.moduleAugmentations) {
                            tt.moduleAugmentations = [];
                        }
                        sourceFiles[index] = tt;
                    }
                }
            }
        });
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
        //RouterParser.printModulesRoutes();
        //RouterParser.printRoutes();
        /*if (RouterParser.incompleteRoutes.length > 0) {
            if (deps['miscellaneous']['variables'].length > 0) {
                RouterParser.fixIncompleteRoutes(deps['miscellaneous']['variables']);
            }
        }*/
        //$componentsTreeEngine.createTreesForComponents();
        RouterParser.linkModulesAndRoutes();
        RouterParser.constructModulesTree();
        deps.routesTree = RouterParser.constructRoutesTree();
        return deps;
    };
    Dependencies.prototype.getSourceFileDecorators = function (srcFile, outputSymbols) {
        var _this = this;
        var cleaner = (process.cwd() + path.sep).replace(/\\/g, '/'), file = srcFile.fileName.replace(cleaner, '');
        ts.forEachChild(srcFile, function (node) {
            var deps = {};
            if (node.decorators) {
                var visitNode = function (visitedNode, index) {
                    var metadata = node.decorators;
                    var name = _this.getSymboleName(node);
                    var props = _this.findProps(visitedNode);
                    var IO = _this.getComponentIO(file, srcFile, node);
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
                            description: IO.description,
                            sourceCode: srcFile.getText()
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
                            description: IO.description,
                            type: 'component',
                            sourceCode: srcFile.getText()
                        };
                        if (_this.configuration.mainData.disablePrivateOrInternalSupport) {
                            deps.methodsClass = cleanLifecycleHooksFromMethods(deps.methodsClass);
                        }
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        if (IO.extends) {
                            deps.extends = IO.extends;
                        }
                        if (IO.implements && IO.implements.length > 0) {
                            deps.implements = IO.implements;
                        }
                        $componentsTreeEngine.addComponent(deps);
                        outputSymbols['components'].push(deps);
                    }
                    else if (_this.isInjectable(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            type: 'injectable',
                            properties: IO.properties,
                            methods: IO.methods,
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
                        outputSymbols['injectables'].push(deps);
                    }
                    else if (_this.isPipe(metadata)) {
                        deps = {
                            name: name,
                            file: file,
                            type: 'pipe',
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (_this.isDirective(metadata)) {
                        if (props.length === 0)
                            return;
                        deps = {
                            name: name,
                            file: file,
                            type: 'directive',
                            description: IO.description,
                            sourceCode: srcFile.getText(),
                            selector: _this.getComponentSelector(props),
                            providers: _this.getComponentProviders(props),
                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,
                            propertiesClass: IO.properties,
                            methodsClass: IO.methods
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            deps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        if (IO.implements && IO.implements.length > 0) {
                            deps.implements = IO.implements;
                        }
                        if (IO.constructor) {
                            deps.constructorObj = IO.constructor;
                        }
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
                    var IO = _this.getClassIO(file, srcFile, node);
                    deps = {
                        name: name,
                        file: file,
                        type: 'class',
                        sourceCode: srcFile.getText()
                    };
                    if (IO.constructor) {
                        deps.constructorObj = IO.constructor;
                    }
                    if (IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if (IO.description) {
                        deps.description = IO.description;
                    }
                    if (IO.methods) {
                        deps.methods = IO.methods;
                    }
                    if (IO.extends) {
                        deps.extends = IO.extends;
                    }
                    if (IO.implements && IO.implements.length > 0) {
                        deps.implements = IO.implements;
                    }
                    _this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                else if (node.symbol.flags === ts.SymbolFlags.Interface) {
                    var name = _this.getSymboleName(node);
                    var IO = _this.getInterfaceIO(file, srcFile, node);
                    deps = {
                        name: name,
                        file: file,
                        type: 'interface',
                        sourceCode: srcFile.getText()
                    };
                    if (IO.properties) {
                        deps.properties = IO.properties;
                    }
                    if (IO.indexSignatures) {
                        deps.indexSignatures = IO.indexSignatures;
                    }
                    if (IO.kind) {
                        deps.kind = IO.kind;
                    }
                    if (IO.description) {
                        deps.description = IO.description;
                    }
                    if (IO.methods) {
                        deps.methods = IO.methods;
                    }
                    _this.debug(deps);
                    outputSymbols['interfaces'].push(deps);
                }
                else if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
                    var infos = _this.visitFunctionDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file
                    };
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    outputSymbols['miscellaneous'].functions.push(deps);
                }
                else if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                    var infos = _this.visitEnumDeclaration(node), name = node.name.text;
                    deps = {
                        name: name,
                        childs: infos,
                        file: file
                    };
                    outputSymbols['miscellaneous'].enumerations.push(deps);
                }
            }
            else {
                var IO = _this.getRouteIO(file, srcFile);
                if (IO.routes) {
                    var newRoutes = void 0;
                    try {
                        newRoutes = RouterParser.cleanRawRouteParsed(IO.routes);
                    }
                    catch (e) {
                        logger.error('Routes parsing error, maybe a trailing comma or an external variable, trying to fix that later after sources scanning.');
                        newRoutes = IO.routes.replace(/ /gm, '');
                        RouterParser.addIncompleteRoute({
                            data: newRoutes,
                            file: file
                        });
                        return true;
                    }
                    outputSymbols['routes'] = outputSymbols['routes'].concat(newRoutes);
                }
                if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                    var name = _this.getSymboleName(node);
                    var IO_1 = _this.getClassIO(file, srcFile, node);
                    deps = {
                        name: name,
                        file: file,
                        type: 'class',
                        sourceCode: srcFile.getText()
                    };
                    if (IO_1.constructor) {
                        deps.constructorObj = IO_1.constructor;
                    }
                    if (IO_1.properties) {
                        deps.properties = IO_1.properties;
                    }
                    if (IO_1.indexSignatures) {
                        deps.indexSignatures = IO_1.indexSignatures;
                    }
                    if (IO_1.description) {
                        deps.description = IO_1.description;
                    }
                    if (IO_1.methods) {
                        deps.methods = IO_1.methods;
                    }
                    if (IO_1.extends) {
                        deps.extends = IO_1.extends;
                    }
                    if (IO_1.implements && IO_1.implements.length > 0) {
                        deps.implements = IO_1.implements;
                    }
                    _this.debug(deps);
                    outputSymbols['classes'].push(deps);
                }
                if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                    var bootstrapModuleReference = 'bootstrapModule';
                    //Find the root module with bootstrapModule call
                    //1. find a simple call : platformBrowserDynamic().bootstrapModule(AppModule);
                    //2. or inside a call :
                    // () => {
                    //     platformBrowserDynamic().bootstrapModule(AppModule);
                    // });
                    //3. with a catch : platformBrowserDynamic().bootstrapModule(AppModule).catch(error => console.error(error));
                    //4. with parameters : platformBrowserDynamic().bootstrapModule(AppModule, {}).catch(error => console.error(error));
                    //Find recusively in expression nodes one with name 'bootstrapModule'
                    var rootModule_1, resultNode = void 0;
                    if (srcFile.text.indexOf(bootstrapModuleReference) !== -1) {
                        if (node.expression) {
                            resultNode = _this.findExpressionByNameInExpressions(node.expression, 'bootstrapModule');
                        }
                        if (!resultNode) {
                            if (node.expression && node.expression.arguments && node.expression.arguments.length > 0) {
                                resultNode = _this.findExpressionByNameInExpressionArguments(node.expression.arguments, 'bootstrapModule');
                            }
                        }
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
                if (node.kind === ts.SyntaxKind.VariableStatement && !_this.isVariableRoutes(node)) {
                    var infos = _this.visitVariableDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file
                    };
                    deps.type = (infos.type) ? infos.type : '';
                    if (infos.defaultValue) {
                        deps.defaultValue = infos.defaultValue;
                    }
                    if (node.jsDoc && node.jsDoc.length > 0 && node.jsDoc[0].comment) {
                        deps.description = marked$2(node.jsDoc[0].comment);
                    }
                    outputSymbols['miscellaneous'].variables.push(deps);
                }
                if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
                    var infos = _this.visitTypeDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file
                    };
                    outputSymbols['miscellaneous'].types.push(deps);
                }
                if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
                    var infos = _this.visitFunctionDeclaration(node), name = infos.name;
                    deps = {
                        name: name,
                        file: file
                    };
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    outputSymbols['miscellaneous'].functions.push(deps);
                }
                if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                    var infos = _this.visitEnumDeclaration(node), name = node.name.text;
                    deps = {
                        name: name,
                        childs: infos,
                        file: file
                    };
                    outputSymbols['miscellaneous'].enumerations.push(deps);
                }
            }
        });
    };
    Dependencies.prototype.debug = function (deps) {
        logger.debug('found', "" + deps.name);
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
    Dependencies.prototype.isVariableRoutes = function (node) {
        var result = false;
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        result = true;
                    }
                }
            }
        }
        return result;
    };
    Dependencies.prototype.findExpressionByNameInExpressions = function (entryNode, name) {
        var result, loop = function (node, name) {
            if (node.expression && !node.expression.name) {
                loop(node.expression, name);
            }
            if (node.expression && node.expression.name) {
                if (node.expression.name.text === name) {
                    result = node;
                }
                else {
                    loop(node.expression, name);
                }
            }
        };
        loop(entryNode, name);
        return result;
    };
    Dependencies.prototype.findExpressionByNameInExpressionArguments = function (arg, name) {
        var result, that = this, i = 0, len = arg.length, loop = function (node, name) {
            if (node.body) {
                if (node.body.statements && node.body.statements.length > 0) {
                    var j = 0, leng = node.body.statements.length;
                    for (j; j < leng; j++) {
                        result = that.findExpressionByNameInExpressions(node.body.statements[j], name);
                    }
                }
            }
        };
        for (i; i < len; i++) {
            loop(arg[i], name);
        }
        return result;
    };
    Dependencies.prototype.parseDecorators = function (decorators, type) {
        var result = false;
        if (decorators.length > 1) {
            _.forEach(decorators, function (decorator) {
                if (decorator.expression.expression) {
                    if (decorator.expression.expression.text === type) {
                        result = true;
                    }
                }
            });
        }
        else {
            if (decorators[0].expression.expression) {
                if (decorators[0].expression.expression.text === type) {
                    result = true;
                }
            }
        }
        return result;
    };
    Dependencies.prototype.isComponent = function (metadatas) {
        return this.parseDecorators(metadatas, 'Component');
    };
    Dependencies.prototype.isPipe = function (metadatas) {
        return this.parseDecorators(metadatas, 'Pipe');
    };
    Dependencies.prototype.isDirective = function (metadatas) {
        return this.parseDecorators(metadatas, 'Directive');
    };
    Dependencies.prototype.isInjectable = function (metadatas) {
        return this.parseDecorators(metadatas, 'Injectable');
    };
    Dependencies.prototype.isModule = function (metadatas) {
        return this.parseDecorators(metadatas, 'NgModule');
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
            if (decorators[i].expression.expression) {
                if (decorators[i].expression.expression.text === decoratorType) {
                    return decorators[i];
                }
            }
        }
        return null;
    };
    Dependencies.prototype.visitInput = function (property, inDecorator, sourceFile) {
        var inArgs = inDecorator.expression.arguments, _return = {
            name: inArgs.length ? inArgs[0].text : property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            description: marked$2(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment()))),
            line: this.getPosition(property, sourceFile).line + 1
        };
        if (property.type) {
            _return.type = this.visitType(property);
        }
        else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
    };
    Dependencies.prototype.visitType = function (node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var _return = 'void';
        if (node) {
            try {
                _return = this.typeChecker.typeToString(this.typeChecker.getTypeAtLocation(node));
            }
            catch (e) {
                _return = '';
            }
        }
        return _return;
    };
    Dependencies.prototype.visitOutput = function (property, outDecorator, sourceFile) {
        var outArgs = outDecorator.expression.arguments, _return = {
            name: outArgs.length ? outArgs[0].text : property.name.text,
            description: marked$2(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment()))),
            line: this.getPosition(property, sourceFile).line + 1
        };
        if (property.type) {
            _return.type = this.visitType(property);
        }
        else {
            // handle NewExpression
            if (property.initializer) {
                if (property.initializer.kind === ts.SyntaxKind.NewExpression) {
                    if (property.initializer.expression) {
                        _return.type = property.initializer.expression.text;
                    }
                }
            }
        }
        return _return;
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
        return this.isHiddenMember(member);
    };
    Dependencies.prototype.isPrivate = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        if (member.modifiers) {
            var isPrivate = member.modifiers.some(function (modifier) { return modifier.kind === ts.SyntaxKind.PrivateKeyword; });
            if (isPrivate) {
                return true;
            }
        }
        return this.isHiddenMember(member);
    };
    Dependencies.prototype.isInternal = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var internalTags = ['internal'];
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
    Dependencies.prototype.isHiddenMember = function (member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var internalTags = ['hidden'];
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
    Dependencies.prototype.visitConstructorDeclaration = function (method, sourceFile) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: 'constructor',
            description: '',
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            line: this.getPosition(method, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(method), markedtags = function (tags) {
            var mtags = tags;
            _.forEach(mtags, function (tag) {
                tag.comment = marked$2(LinkParser.resolveLinks(tag.comment));
            });
            return mtags;
        };
        if (method.symbol) {
            result.description = marked$2(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment())));
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitConstructorProperties = function (method) {
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
    Dependencies.prototype.visitCallDeclaration = function (method, sourceFile) {
        var _this = this;
        return {
            description: marked$2(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
    };
    Dependencies.prototype.visitIndexDeclaration = function (method, sourceFile) {
        var _this = this;
        return {
            description: marked$2(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment()))),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
    };
    Dependencies.prototype.getPosition = function (node, sourceFile) {
        var position;
        if (node['name'] && node['name'].end) {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node['name'].end);
        }
        else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    };
    Dependencies.prototype.visitMethodDeclaration = function (method, sourceFile) {
        var _this = this;
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        }, jsdoctags = JSDocTagsParser.getJSDocs(method), markedtags = function (tags) {
            var mtags = tags;
            _.forEach(mtags, function (tag) {
                tag.comment = marked$2(LinkParser.resolveLinks(tag.comment));
            });
            return mtags;
        };
        if (method.symbol) {
            result.description = marked$2(LinkParser.resolveLinks(ts.displayPartsToString(method.symbol.getDocumentationComment())));
        }
        if (method.decorators) {
            result.decorators = this.formatDecorators(method.decorators);
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
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
        var t = function (a, b) {
            if (a[name]) {
                return a[name].localeCompare(b[name]);
            }
            else {
                return 0;
            }
        };
        return t;
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
    Dependencies.prototype.formatDecorators = function (decorators) {
        var _decorators = [];
        _.forEach(decorators, function (decorator) {
            if (decorator.expression) {
                if (decorator.expression.text) {
                    _decorators.push({
                        name: decorator.expression.text
                    });
                }
                if (decorator.expression.expression) {
                    var info = {
                        name: decorator.expression.expression.text
                    };
                    if (decorator.expression.expression.arguments) {
                        if (decorator.expression.expression.arguments.length > 0) {
                            info.args = decorator.expression.expression.arguments;
                        }
                    }
                    _decorators.push(info);
                }
            }
        });
        return _decorators;
    };
    Dependencies.prototype.visitProperty = function (property, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            type: this.visitType(property),
            description: '',
            line: this.getPosition(property, sourceFile).line + 1
        };
        if (property.symbol) {
            result.description = marked$2(LinkParser.resolveLinks(ts.displayPartsToString(property.symbol.getDocumentationComment())));
        }
        if (property.decorators) {
            result.decorators = this.formatDecorators(property.decorators);
        }
        if (property.modifiers) {
            if (property.modifiers.length > 0) {
                result.modifierKind = property.modifiers[0].kind;
            }
        }
        return result;
    };
    Dependencies.prototype.visitMembers = function (members, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inputs = [], outputs = [], methods = [], properties = [], indexSignatures = [], kind, inputDecorator, constructor, outDecorator;
        for (var i = 0; i < members.length; i++) {
            inputDecorator = this.getDecoratorOfType(members[i], 'Input');
            outDecorator = this.getDecoratorOfType(members[i], 'Output');
            kind = members[i].kind;
            if (inputDecorator) {
                inputs.push(this.visitInput(members[i], inputDecorator, sourceFile));
            }
            else if (outDecorator) {
                outputs.push(this.visitOutput(members[i], outDecorator, sourceFile));
            }
            else if (!this.isHiddenMember(members[i])) {
                if ((this.isPrivate(members[i]) || this.isInternal(members[i])) && this.configuration.mainData.disablePrivateOrInternalSupport) { }
                else {
                    if ((members[i].kind === ts.SyntaxKind.MethodDeclaration ||
                        members[i].kind === ts.SyntaxKind.MethodSignature)) {
                        methods.push(this.visitMethodDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts.SyntaxKind.PropertyDeclaration ||
                        members[i].kind === ts.SyntaxKind.PropertySignature || members[i].kind === ts.SyntaxKind.GetAccessor) {
                        properties.push(this.visitProperty(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts.SyntaxKind.CallSignature) {
                        properties.push(this.visitCallDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts.SyntaxKind.IndexSignature) {
                        indexSignatures.push(this.visitIndexDeclaration(members[i], sourceFile));
                    }
                    else if (members[i].kind === ts.SyntaxKind.Constructor) {
                        var _constructorProperties = this.visitConstructorProperties(members[i]), j = 0, len = _constructorProperties.length;
                        for (j; j < len; j++) {
                            properties.push(_constructorProperties[j]);
                        }
                        constructor = this.visitConstructorDeclaration(members[i], sourceFile);
                    }
                }
            }
        }
        inputs.sort(this.getNamesCompareFn());
        outputs.sort(this.getNamesCompareFn());
        properties.sort(this.getNamesCompareFn());
        indexSignatures.sort(this.getNamesCompareFn());
        return {
            inputs: inputs,
            outputs: outputs,
            methods: methods,
            properties: properties,
            indexSignatures: indexSignatures,
            kind: kind,
            constructor: constructor
        };
    };
    Dependencies.prototype.visitDirectiveDecorator = function (decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var selector;
        var exportAs;
        var properties;
        if (decorator.expression.arguments.length > 0) {
            properties = decorator.expression.arguments[0].properties;
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
        }
        return {
            selector: selector,
            exportAs: exportAs
        };
    };
    Dependencies.prototype.isPipeDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Pipe' : false;
    };
    Dependencies.prototype.isModuleDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'NgModule' : false;
    };
    Dependencies.prototype.isDirectiveDecorator = function (decorator) {
        if (decorator.expression.expression) {
            var decoratorIdentifierText = decorator.expression.expression.text;
            return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
        }
        else {
            return false;
        }
    };
    Dependencies.prototype.isServiceDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Injectable' : false;
    };
    Dependencies.prototype.visitClassDeclaration = function (fileName, classDeclaration, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var symbol = this.typeChecker.getSymbolAtLocation(classDeclaration.name);
        var description = '';
        if (symbol) {
            description = marked$2(LinkParser.resolveLinks(ts.displayPartsToString(symbol.getDocumentationComment())));
        }
        var className = classDeclaration.name.text;
        var directiveInfo;
        var members;
        var implementsElements = [];
        var extendsElement;
        var jsdoctags = [];
        if (typeof ts.getClassImplementsHeritageClauseElements !== 'undefined') {
            var implementedTypes = ts.getClassImplementsHeritageClauseElements(classDeclaration);
            if (implementedTypes) {
                var i_1 = 0, len = implementedTypes.length;
                for (i_1; i_1 < len; i_1++) {
                    if (implementedTypes[i_1].expression) {
                        implementsElements.push(implementedTypes[i_1].expression.text);
                    }
                }
            }
        }
        if (typeof ts.getClassExtendsHeritageClauseElement !== 'undefined') {
            var extendsTypes = ts.getClassExtendsHeritageClauseElement(classDeclaration);
            if (extendsTypes) {
                if (extendsTypes.expression) {
                    extendsElement = extendsTypes.expression.text;
                }
            }
        }
        if (symbol) {
            if (symbol.valueDeclaration) {
                jsdoctags = JSDocTagsParser.getJSDocs(symbol.valueDeclaration);
            }
        }
        if (classDeclaration.decorators) {
            for (var i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    directiveInfo = this.visitDirectiveDecorator(classDeclaration.decorators[i]);
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return {
                        description: description,
                        inputs: members.inputs,
                        outputs: members.outputs,
                        properties: members.properties,
                        methods: members.methods,
                        indexSignatures: members.indexSignatures,
                        kind: members.kind,
                        constructor: members.constructor,
                        jsdoctags: jsdoctags,
                        extends: extendsElement,
                        implements: implementsElements
                    };
                }
                else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return [{
                            fileName: fileName,
                            className: className,
                            description: description,
                            methods: members.methods,
                            indexSignatures: members.indexSignatures,
                            properties: members.properties,
                            kind: members.kind,
                            constructor: members.constructor,
                            extends: extendsElement,
                            implements: implementsElements
                        }];
                }
                else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                    return [{
                            fileName: fileName,
                            className: className,
                            description: description,
                            jsdoctags: jsdoctags
                        }];
                }
                else {
                    //console.log('custom decorator');
                }
            }
        }
        else if (description) {
            members = this.visitMembers(classDeclaration.members, sourceFile);
            return [{
                    description: description,
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor,
                    extends: extendsElement,
                    implements: implementsElements
                }];
        }
        else {
            members = this.visitMembers(classDeclaration.members, sourceFile);
            return [{
                    methods: members.methods,
                    indexSignatures: members.indexSignatures,
                    properties: members.properties,
                    kind: members.kind,
                    constructor: members.constructor,
                    extends: extendsElement,
                    implements: implementsElements
                }];
        }
        return [];
    };
    Dependencies.prototype.visitTypeDeclaration = function (type) {
        var result = {
            name: type.name.text
        }, jsdoctags = JSDocTagsParser.getJSDocs(type);
        var markedtags = function (tags) {
            var mtags = tags;
            _.forEach(mtags, function (tag) {
                tag.comment = marked$2(LinkParser.resolveLinks(tag.comment));
            });
            return mtags;
        };
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitFunctionDeclaration = function (method) {
        var mapTypes = function (type) {
            switch (type) {
                case 94:
                    return 'Null';
                case 118:
                    return 'Any';
                case 121:
                    return 'Boolean';
                case 129:
                    return 'Never';
                case 132:
                    return 'Number';
                case 134:
                    return 'String';
                case 137:
                    return 'Undefined';
                case 157:
                    return 'TypeReference';
            }
        };
        var visitArgument = function (arg) {
            var result = {
                name: arg.name.text
            };
            if (arg.type) {
                result.type = mapTypes(arg.type.kind);
                if (arg.type.kind === 157) {
                    //try replace TypeReference with typeName
                    if (arg.type.typeName) {
                        result.type = arg.type.typeName.text;
                    }
                }
            }
            return result;
        };
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(function (prop) { return visitArgument(prop); }) : []
        }, jsdoctags = JSDocTagsParser.getJSDocs(method);
        var markedtags = function (tags) {
            var mtags = tags;
            _.forEach(mtags, function (tag) {
                tag.comment = marked$2(LinkParser.resolveLinks(tag.comment));
            });
            return mtags;
        };
        if (typeof method.type !== 'undefined') {
            result.returnType = this.visitType(method.type);
        }
        if (method.modifiers) {
            if (method.modifiers.length > 0) {
                result.modifierKind = method.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitVariableDeclaration = function (node) {
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                var result = {
                    name: node.declarationList.declarations[i].name.text,
                    defaultValue: node.declarationList.declarations[i].initializer ? this.stringifyDefaultValue(node.declarationList.declarations[i].initializer) : undefined
                };
                if (node.declarationList.declarations[i].type) {
                    result.type = this.visitType(node.declarationList.declarations[i].type);
                }
                return result;
            }
        }
    };
    Dependencies.prototype.visitEnumDeclaration = function (node) {
        var result = [];
        if (node.members) {
            var i = 0, len = node.members.length;
            for (i; i < len; i++) {
                var member = {
                    name: node.members[i].name.text
                };
                if (node.members[i].initializer) {
                    member.value = node.members[i].initializer.text;
                }
                result.push(member);
            }
        }
        return result;
    };
    Dependencies.prototype.visitEnumDeclarationForRoutes = function (fileName, node) {
        if (node.declarationList.declarations) {
            var i = 0, len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName && node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        var data = generate(node.declarationList.declarations[i].initializer);
                        RouterParser.addRoute({
                            name: node.declarationList.declarations[i].name.text,
                            data: RouterParser.cleanRawRoute(data),
                            file: fileName
                        });
                        return [{
                                routes: data
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
                return directive.concat(_this.visitEnumDeclarationForRoutes(filename, statement));
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getComponentIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    Dependencies.prototype.getClassIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
                }
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
                    return directive.concat(_this.visitClassDeclaration(filename, statement, sourceFile));
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
        return this.getSymbolDeps(props, 'templateUrl');
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
                if (node.kind === ts.SyntaxKind.SpreadElement) {
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

function promiseSequential(promises) {
    if (!Array.isArray(promises)) {
        throw new Error('First argument need to be an array of Promises');
    }
    return new Promise(function (resolve$$1, reject) {
        var count = 0;
        var results = [];
        var iterateeFunc = function (previousPromise, currentPromise) {
            return previousPromise
                .then(function (result) {
                if (count++ !== 0)
                    results = results.concat(result);
                return currentPromise(result, results, count);
            })
                .catch(function (err) {
                return reject(err);
            });
        };
        promises = promises.concat(function () { return Promise.resolve(); });
        promises
            .reduce(iterateeFunc, Promise.resolve(false))
            .then(function (res) {
            resolve$$1(results);
        });
    });
}

var glob = require('glob');
var marked = require('marked');
var chokidar = require('chokidar');
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
        /**
         * Boolean for watching status
         * @type {boolean}
         */
        this.isWatching = false;
        this.preparePipes = function (somePipes) {
            logger.info('Prepare pipes');
            _this.configuration.mainData.pipes = (somePipes) ? somePipes : $dependenciesEngine.getPipes();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.pipes.length;
                for (i; i < len; i++) {
                    _this.configuration.addPage({
                        path: 'pipes',
                        name: _this.configuration.mainData.pipes[i].name,
                        context: 'pipe',
                        pipe: _this.configuration.mainData.pipes[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                }
                resolve$$1();
            });
        };
        this.prepareClasses = function (someClasses) {
            logger.info('Prepare classes');
            _this.configuration.mainData.classes = (someClasses) ? someClasses : $dependenciesEngine.getClasses();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.classes.length;
                for (i; i < len; i++) {
                    _this.configuration.addPage({
                        path: 'classes',
                        name: _this.configuration.mainData.classes[i].name,
                        context: 'class',
                        class: _this.configuration.mainData.classes[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                }
                resolve$$1();
            });
        };
        this.prepareDirectives = function (someDirectives) {
            logger.info('Prepare directives');
            _this.configuration.mainData.directives = (someDirectives) ? someDirectives : $dependenciesEngine.getDirectives();
            return new Promise(function (resolve$$1, reject) {
                var i = 0, len = _this.configuration.mainData.directives.length;
                for (i; i < len; i++) {
                    _this.configuration.addPage({
                        path: 'directives',
                        name: _this.configuration.mainData.directives[i].name,
                        context: 'directive',
                        directive: _this.configuration.mainData.directives[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                }
                resolve$$1();
            });
        };
        this.configuration = Configuration.getInstance();
        for (var option in options) {
            if (typeof this.configuration.mainData[option] !== 'undefined') {
                this.configuration.mainData[option] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'name') {
                this.configuration.mainData['documentationMainName'] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'silent') {
                logger.silent = false;
            }
        }
    }
    /**
     * Start compodoc process
     */
    Application.prototype.generate = function () {
        var _this = this;
        $htmlengine.init().then(function () {
            _this.processPackageJson();
        });
    };
    /**
     * Start compodoc documentation coverage
     */
    Application.prototype.testCoverage = function () {
        this.getDependenciesData();
    };
    /**
     * Store files for initial processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    Application.prototype.setFiles = function (files) {
        this.files = files;
    };
    /**
     * Store files for watch processing
     * @param  {Array<string>} files Files found during source folder and tsconfig scan
     */
    Application.prototype.setUpdatedFiles = function (files) {
        this.updatedFiles = files;
    };
    /**
     * Return a boolean indicating presence of one TypeScript file in updatedFiles list
     * @return {boolean} Result of scan
     */
    Application.prototype.hasWatchedFilesTSFiles = function () {
        var result = false;
        _.forEach(this.updatedFiles, function (file) {
            if (path.extname(file) === '.ts') {
                result = true;
            }
        });
        return result;
    };
    /**
     * Clear files for watch processing
     */
    Application.prototype.clearUpdatedFiles = function () {
        this.updatedFiles = [];
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
            _this.configuration.mainData.angularVersion = getAngularVersionOfProject(parsedData);
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
                context: 'readme',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            _this.configuration.addPage({
                name: 'overview',
                context: 'overview',
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
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
    /**
     * Get dependency data for small group of updated files during watch process
     */
    Application.prototype.getMicroDependenciesData = function () {
        logger.info('Get diff dependencies data');
        var crawler = new Dependencies(this.updatedFiles, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
        });
        var dependenciesData = crawler.getDependencies();
        $dependenciesEngine.update(dependenciesData);
        this.prepareJustAFewThings(dependenciesData);
    };
    /**
     * Rebuild external documentation during watch process
     */
    Application.prototype.rebuildExternalDocumentation = function () {
        var _this = this;
        logger.info('Rebuild external documentation');
        var actions = [];
        this.configuration.resetAdditionalPages();
        if (this.configuration.mainData.includes !== '') {
            actions.push(function () { return _this.prepareExternalIncludes(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processPages();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.getDependenciesData = function () {
        logger.info('Get dependencies data');
        var crawler = new Dependencies(this.files, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
        });
        var dependenciesData = crawler.getDependencies();
        $dependenciesEngine.init(dependenciesData);
        this.configuration.mainData.routesLength = RouterParser.routesLength();
        this.prepareEverything();
    };
    Application.prototype.prepareJustAFewThings = function (diffCrawledData) {
        var _this = this;
        var actions = [];
        this.configuration.resetPages();
        actions.push(function () { return _this.prepareRoutes(); });
        if (diffCrawledData.modules.length > 0) {
            actions.push(function () { return _this.prepareModules(diffCrawledData.modules); });
        }
        if (diffCrawledData.components.length > 0) {
            actions.push(function () { return _this.prepareComponents(diffCrawledData.components); });
        }
        if (diffCrawledData.directives.length > 0) {
            actions.push(function () { return _this.prepareDirectives(diffCrawledData.directives); });
        }
        if (diffCrawledData.injectables.length > 0) {
            actions.push(function () { return _this.prepareInjectables(diffCrawledData.injectables); });
        }
        if (diffCrawledData.pipes.length > 0) {
            actions.push(function () { return _this.preparePipes(diffCrawledData.pipes); });
        }
        if (diffCrawledData.classes.length > 0) {
            actions.push(function () { return _this.prepareClasses(diffCrawledData.classes); });
        }
        if (diffCrawledData.interfaces.length > 0) {
            actions.push(function () { return _this.prepareInterfaces(diffCrawledData.interfaces); });
        }
        if (diffCrawledData.miscellaneous.variables.length > 0 ||
            diffCrawledData.miscellaneous.functions.length > 0 ||
            diffCrawledData.miscellaneous.typealiases.length > 0 ||
            diffCrawledData.miscellaneous.enumerations.length > 0 ||
            diffCrawledData.miscellaneous.types.length > 0) {
            actions.push(function () { return _this.prepareMiscellaneous(); });
        }
        if (!this.configuration.mainData.disableCoverage) {
            actions.push(function () { return _this.prepareCoverage(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processGraphs();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.prepareEverything = function () {
        var _this = this;
        var actions = [];
        actions.push(function () { return _this.prepareModules(); });
        actions.push(function () { return _this.prepareComponents(); });
        if ($dependenciesEngine.directives.length > 0) {
            actions.push(function () { return _this.prepareDirectives(); });
        }
        if ($dependenciesEngine.injectables.length > 0) {
            actions.push(function () { return _this.prepareInjectables(); });
        }
        if ($dependenciesEngine.routes && $dependenciesEngine.routes.children.length > 0) {
            actions.push(function () { return _this.prepareRoutes(); });
        }
        if ($dependenciesEngine.pipes.length > 0) {
            actions.push(function () { return _this.preparePipes(); });
        }
        if ($dependenciesEngine.classes.length > 0) {
            actions.push(function () { return _this.prepareClasses(); });
        }
        if ($dependenciesEngine.interfaces.length > 0) {
            actions.push(function () { return _this.prepareInterfaces(); });
        }
        if ($dependenciesEngine.miscellaneous.variables.length > 0 ||
            $dependenciesEngine.miscellaneous.functions.length > 0 ||
            $dependenciesEngine.miscellaneous.typealiases.length > 0 ||
            $dependenciesEngine.miscellaneous.enumerations.length > 0 ||
            $dependenciesEngine.miscellaneous.types.length > 0) {
            actions.push(function () { return _this.prepareMiscellaneous(); });
        }
        if (!this.configuration.mainData.disableCoverage) {
            actions.push(function () { return _this.prepareCoverage(); });
        }
        if (this.configuration.mainData.includes !== '') {
            actions.push(function () { return _this.prepareExternalIncludes(); });
        }
        promiseSequential(actions)
            .then(function (res) {
            _this.processGraphs();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    Application.prototype.prepareExternalIncludes = function () {
        var _this = this;
        logger.info('Adding external markdown files');
        //Scan include folder for files detailed in summary.json
        //For each file, add to this.configuration.mainData.additionalPages
        //Each file will be converted to html page, inside COMPODOC_DEFAULTS.additionalEntryPath
        return new Promise(function (resolve$$1, reject) {
            $fileengine.get(_this.configuration.mainData.includes + path.sep + 'summary.json').then(function (summaryData) {
                logger.info('Additional documentation: summary.json file found');
                var parsedSummaryData = JSON.parse(summaryData), i = 0, len = parsedSummaryData.length, loop = function () {
                    if (i <= len - 1) {
                        $markdownengine.get(_this.configuration.mainData.includes + path.sep + parsedSummaryData[i].file).then(function (markedData) {
                            _this.configuration.addAdditionalPage({
                                name: parsedSummaryData[i].title,
                                filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                context: 'additional-page',
                                path: _this.configuration.mainData.includesFolder,
                                additionalPage: markedData,
                                depth: 1,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                            });
                            if (parsedSummaryData[i].children && parsedSummaryData[i].children.length > 0) {
                                var j_1 = 0, leng_1 = parsedSummaryData[i].children.length, loopChild_1 = function () {
                                    if (j_1 <= leng_1 - 1) {
                                        $markdownengine.get(_this.configuration.mainData.includes + path.sep + parsedSummaryData[i].children[j_1].file).then(function (markedData) {
                                            _this.configuration.addAdditionalPage({
                                                name: parsedSummaryData[i].children[j_1].title,
                                                filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].children[j_1].title),
                                                context: 'additional-page',
                                                path: _this.configuration.mainData.includesFolder + '/' + cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                                additionalPage: markedData,
                                                depth: 2,
                                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                                            });
                                            j_1++;
                                            loopChild_1();
                                        }, function (e) {
                                            logger.error(e);
                                        });
                                    }
                                    else {
                                        i++;
                                        loop();
                                    }
                                };
                                loopChild_1();
                            }
                            else {
                                i++;
                                loop();
                            }
                        }, function (e) {
                            logger.error(e);
                        });
                    }
                    else {
                        resolve$$1();
                    }
                };
                loop();
            }, function (errorMessage) {
                logger.error(errorMessage);
                reject('Error during Additional documentation generation');
            });
        });
    };
    Application.prototype.prepareModules = function (someModules) {
        var _this = this;
        logger.info('Prepare modules');
        var i = 0, _modules = (someModules) ? someModules : $dependenciesEngine.getModules();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.mainData.modules = _modules.map(function (ngModule) {
                ['declarations', 'bootstrap', 'imports', 'exports'].forEach(function (metadataType) {
                    ngModule[metadataType] = ngModule[metadataType].filter(function (metaDataItem) {
                        switch (metaDataItem.type) {
                            case 'directive':
                                return $dependenciesEngine.getDirectives().some(function (directive) { return directive.name === metaDataItem.name; });
                            case 'component':
                                return $dependenciesEngine.getComponents().some(function (component) { return component.name === metaDataItem.name; });
                            case 'module':
                                return $dependenciesEngine.getModules().some(function (module) { return module.name === metaDataItem.name; });
                            case 'pipe':
                                return $dependenciesEngine.getPipes().some(function (pipe) { return pipe.name === metaDataItem.name; });
                            default:
                                return true;
                        }
                    });
                });
                ngModule.providers = ngModule.providers.filter(function (provider) {
                    return $dependenciesEngine.getInjectables().some(function (injectable) { return injectable.name === provider.name; });
                });
                return ngModule;
            });
            _this.configuration.addPage({
                name: 'modules',
                context: 'modules',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            var len = _this.configuration.mainData.modules.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'modules',
                    name: _this.configuration.mainData.modules[i].name,
                    context: 'module',
                    module: _this.configuration.mainData.modules[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve$$1();
        });
    };
    Application.prototype.prepareInterfaces = function (someInterfaces) {
        var _this = this;
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = (someInterfaces) ? someInterfaces : $dependenciesEngine.getInterfaces();
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.configuration.mainData.interfaces.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'interfaces',
                    name: _this.configuration.mainData.interfaces[i].name,
                    context: 'interface',
                    interface: _this.configuration.mainData.interfaces[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve$$1();
        });
    };
    Application.prototype.prepareMiscellaneous = function (someMisc) {
        var _this = this;
        logger.info('Prepare miscellaneous');
        this.configuration.mainData.miscellaneous = (someMisc) ? someMisc : $dependenciesEngine.getMiscellaneous();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.addPage({
                name: 'miscellaneous',
                context: 'miscellaneous',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            resolve$$1();
        });
    };
    Application.prototype.prepareComponents = function (someComponents) {
        var _this = this;
        logger.info('Prepare components');
        this.configuration.mainData.components = (someComponents) ? someComponents : $dependenciesEngine.getComponents();
        return new Promise(function (mainResolve, reject) {
            var i = 0, len = _this.configuration.mainData.components.length, loop = function () {
                if (i <= len - 1) {
                    var dirname_1 = path.dirname(_this.configuration.mainData.components[i].file), handleTemplateurl_1 = function () {
                        return new Promise(function (resolve$$1, reject) {
                            var templatePath = path.resolve(dirname_1 + path.sep + _this.configuration.mainData.components[i].templateUrl);
                            if (fs.existsSync(templatePath)) {
                                fs.readFile(templatePath, 'utf8', function (err, data) {
                                    if (err) {
                                        logger.error(err);
                                        reject();
                                    }
                                    else {
                                        _this.configuration.mainData.components[i].templateData = data;
                                        resolve$$1();
                                    }
                                });
                            }
                            else {
                                logger.error("Cannot read template for " + _this.configuration.mainData.components[i].name);
                            }
                        });
                    };
                    if ($markdownengine.componentHasReadmeFile(_this.configuration.mainData.components[i].file)) {
                        logger.info(_this.configuration.mainData.components[i].name + " has a README file, include it");
                        var readmeFile = $markdownengine.componentReadmeFile(_this.configuration.mainData.components[i].file);
                        fs.readFile(readmeFile, 'utf8', function (err, data) {
                            if (err)
                                throw err;
                            _this.configuration.mainData.components[i].readme = marked(data);
                            _this.configuration.addPage({
                                path: 'components',
                                name: _this.configuration.mainData.components[i].name,
                                context: 'component',
                                component: _this.configuration.mainData.components[i],
                                depth: 1,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                            });
                            if (_this.configuration.mainData.components[i].templateUrl.length > 0) {
                                logger.info(_this.configuration.mainData.components[i].name + " has a templateUrl, include it");
                                handleTemplateurl_1().then(function () {
                                    i++;
                                    loop();
                                }, function (e) {
                                    logger.error(e);
                                });
                            }
                            else {
                                i++;
                                loop();
                            }
                        });
                    }
                    else {
                        _this.configuration.addPage({
                            path: 'components',
                            name: _this.configuration.mainData.components[i].name,
                            context: 'component',
                            component: _this.configuration.mainData.components[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        if (_this.configuration.mainData.components[i].templateUrl.length > 0) {
                            logger.info(_this.configuration.mainData.components[i].name + " has a templateUrl, include it");
                            handleTemplateurl_1().then(function () {
                                i++;
                                loop();
                            }, function (e) {
                                logger.error(e);
                            });
                        }
                        else {
                            i++;
                            loop();
                        }
                    }
                }
                else {
                    mainResolve();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareInjectables = function (someInjectables) {
        var _this = this;
        logger.info('Prepare injectables');
        this.configuration.mainData.injectables = (someInjectables) ? someInjectables : $dependenciesEngine.getInjectables();
        return new Promise(function (resolve$$1, reject) {
            var i = 0, len = _this.configuration.mainData.injectables.length;
            for (i; i < len; i++) {
                _this.configuration.addPage({
                    path: 'injectables',
                    name: _this.configuration.mainData.injectables[i].name,
                    context: 'injectable',
                    injectable: _this.configuration.mainData.injectables[i],
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve$$1();
        });
    };
    Application.prototype.prepareRoutes = function () {
        var _this = this;
        logger.info('Process routes');
        this.configuration.mainData.routes = $dependenciesEngine.getRoutes();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.addPage({
                name: 'routes',
                context: 'routes',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            RouterParser.generateRoutesIndex(_this.configuration.mainData.output, _this.configuration.mainData.routes).then(function () {
                logger.info('Routes index generated');
                resolve$$1();
            }, function (e) {
                logger.error(e);
                reject();
            });
        });
    };
    Application.prototype.prepareCoverage = function () {
        var _this = this;
        logger.info('Process documentation coverage report');
        return new Promise(function (resolve$$1, reject) {
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
                    status = 'good';
                }
                return status;
            };
            _.forEach(_this.configuration.mainData.components, function (component) {
                if (!component.propertiesClass ||
                    !component.methodsClass ||
                    !component.inputsClass ||
                    !component.outputsClass) {
                    return;
                }
                var cl = {
                    filePath: component.file,
                    type: component.type,
                    linktype: component.type,
                    name: component.name
                }, totalStatementDocumented = 0, totalStatements = component.propertiesClass.length + component.methodsClass.length + component.inputsClass.length + component.outputsClass.length + 1; // +1 for component decorator comment
                if (component.constructorObj) {
                    totalStatements += 1;
                    if (component.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (component.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(component.propertiesClass, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.methodsClass, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description !== '' && method.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.inputsClass, function (input) {
                    if (input.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (input.description !== '' && input.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(component.outputsClass, function (output) {
                    if (output.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (output.description !== '' && output.modifierKind !== 111) {
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
            _.forEach(_this.configuration.mainData.classes, function (classe) {
                if (!classe.properties ||
                    !classe.methods) {
                    return;
                }
                var cl = {
                    filePath: classe.file,
                    type: 'class',
                    linktype: 'classe',
                    name: classe.name
                }, totalStatementDocumented = 0, totalStatements = classe.properties.length + classe.methods.length + 1; // +1 for class itself
                if (classe.constructorObj) {
                    totalStatements += 1;
                    if (classe.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (classe.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(classe.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(classe.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description !== '' && method.modifierKind !== 111) {
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
            _.forEach(_this.configuration.mainData.injectables, function (injectable) {
                if (!injectable.properties ||
                    !injectable.methods) {
                    return;
                }
                var cl = {
                    filePath: injectable.file,
                    type: injectable.type,
                    linktype: injectable.type,
                    name: injectable.name
                }, totalStatementDocumented = 0, totalStatements = injectable.properties.length + injectable.methods.length + 1; // +1 for injectable itself
                if (injectable.constructorObj) {
                    totalStatements += 1;
                    if (injectable.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (injectable.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(injectable.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(injectable.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description !== '' && method.modifierKind !== 111) {
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
            _.forEach(_this.configuration.mainData.interfaces, function (inter) {
                if (!inter.properties ||
                    !inter.methods) {
                    return;
                }
                var cl = {
                    filePath: inter.file,
                    type: inter.type,
                    linktype: inter.type,
                    name: inter.name
                }, totalStatementDocumented = 0, totalStatements = inter.properties.length + inter.methods.length + 1; // +1 for interface itself
                if (inter.constructorObj) {
                    totalStatements += 1;
                    if (inter.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (inter.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(inter.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(inter.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description !== '' && method.modifierKind !== 111) {
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
            _.forEach(_this.configuration.mainData.pipes, function (pipe) {
                var cl = {
                    filePath: pipe.file,
                    type: pipe.type,
                    linktype: pipe.type,
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
                count: (files.length > 0) ? Math.floor(totalProjectStatementDocumented / files.length) : 0,
                status: ''
            };
            coverageData.status = getStatus(coverageData.count);
            _this.configuration.addPage({
                name: 'coverage',
                context: 'coverage',
                files: files,
                data: coverageData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            $htmlengine.generateCoverageBadge(_this.configuration.mainData.output, coverageData);
            if (_this.configuration.mainData.coverageTest) {
                if (coverageData.count >= _this.configuration.mainData.coverageTestThreshold) {
                    logger.info('Documentation coverage is over threshold');
                    process.exit(0);
                }
                else {
                    logger.error('Documentation coverage is not over threshold');
                    process.exit(1);
                }
            }
            else {
                resolve$$1();
            }
        });
    };
    Application.prototype.processPages = function () {
        var _this = this;
        logger.info('Process pages');
        var pages = this.configuration.pages;
        Promise.all(pages.map(function (page, i) {
            return new Promise(function (resolve$$1, reject) {
                logger.info('Process page', page.name);
                var htmlData = $htmlengine.render(_this.configuration.mainData, page);
                var finalPath = _this.configuration.mainData.output;
                if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                    finalPath += '/';
                }
                if (page.path) {
                    finalPath += page.path + '/';
                }
                finalPath += page.name + '.html';
                $searchEngine.indexPage({
                    infos: page,
                    rawData: htmlData,
                    url: finalPath
                });
                fs.outputFile(path.resolve(finalPath), htmlData, function (err) {
                    if (err) {
                        logger.error('Error during ' + page.name + ' page generation');
                        reject();
                    }
                    else {
                        resolve$$1();
                    }
                });
            });
        })).then(function () {
            $searchEngine.generateSearchIndexJson(_this.configuration.mainData.output).then(function () {
                if (_this.configuration.mainData.additionalPages.length > 0) {
                    _this.processAdditionalPages();
                }
                else {
                    if (_this.configuration.mainData.assetsFolder !== '') {
                        _this.processAssetsFolder();
                    }
                    _this.processResources();
                }
            }, function (e) {
                logger.error(e);
            });
        })
            .catch(function (e) {
            logger.error(e);
        });
    };
    Application.prototype.processAdditionalPages = function () {
        var _this = this;
        logger.info('Process additional pages');
        var pages = this.configuration.mainData.additionalPages;
        Promise.all(pages.map(function (page, i) {
            return new Promise(function (resolve$$1, reject) {
                logger.info('Process page', pages[i].name);
                var htmlData = $htmlengine.render(_this.configuration.mainData, pages[i]);
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
                        reject();
                    }
                    else {
                        resolve$$1();
                    }
                });
            });
        })).then(function () {
            $searchEngine.generateSearchIndexJson(_this.configuration.mainData.output).then(function () {
                if (_this.configuration.mainData.assetsFolder !== '') {
                    _this.processAssetsFolder();
                }
                _this.processResources();
            }, function (e) {
                logger.error(e);
            });
        })
            .catch(function (e) {
            logger.error(e);
        });
    };
    Application.prototype.processAssetsFolder = function () {
        logger.info('Copy assets folder');
        if (!fs.existsSync(this.configuration.mainData.assetsFolder)) {
            logger.error("Provided assets folder " + this.configuration.mainData.assetsFolder + " did not exist");
        }
        else {
            fs.copy(path.resolve(this.configuration.mainData.assetsFolder), path.resolve(process.cwd() + path.sep + this.configuration.mainData.output + path.sep + this.configuration.mainData.assetsFolder), function (err) {
                if (err) {
                    logger.error('Error during resources copy ', err);
                }
            });
        }
    };
    Application.prototype.processResources = function () {
        var _this = this;
        logger.info('Copy main resources');
        var onComplete = function () {
            var finalTime = (new Date() - startTime) / 1000;
            logger.info('Documentation generated in ' + _this.configuration.mainData.output + ' in ' + finalTime + ' seconds using ' + _this.configuration.mainData.theme + ' theme');
            if (_this.configuration.mainData.serve) {
                logger.info("Serving documentation from " + _this.configuration.mainData.output + " at http://127.0.0.1:" + _this.configuration.mainData.port);
                _this.runWebServer(_this.configuration.mainData.output);
            }
        };
        var finalOutput = this.configuration.mainData.output.replace(process.cwd(), '');
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + finalOutput), function (err) {
            if (err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (_this.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + _this.configuration.mainData.extTheme), path.resolve(process.cwd() + path.sep + finalOutput + '/styles/'), function (err) {
                        if (err) {
                            logger.error('Error during external styling theme copy ', err);
                        }
                        else {
                            logger.info('External styling theme copy succeeded');
                            onComplete();
                        }
                    });
                }
                else {
                    onComplete();
                }
            }
        });
    };
    Application.prototype.processGraphs = function () {
        var _this = this;
        if (this.configuration.mainData.disableGraph) {
            logger.info('Graph generation disabled');
            this.processPages();
        }
        else {
            logger.info('Process main graph');
            var finalMainGraphPath_1 = this.configuration.mainData.output;
            if (finalMainGraphPath_1.lastIndexOf('/') === -1) {
                finalMainGraphPath_1 += '/';
            }
            finalMainGraphPath_1 += 'graph';
            $ngdengine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath_1), 'p').then(function () {
                $ngdengine.readGraph(path.resolve(finalMainGraphPath_1 + path.sep + 'dependencies.svg'), 'Main graph').then(function (data) {
                    _this.configuration.mainData.mainGraph = data;
                    generateModulesGraph_1();
                }, function (err) {
                    logger.error('Error during graph read: ', err);
                });
            }, function (err) {
                logger.error('Error during graph generation: ', err);
            });
            var modules_1 = this.configuration.mainData.modules, generateModulesGraph_1 = function () {
                Promise.all(modules_1.map(function (module, i) {
                    return new Promise(function (resolve$$1, reject) {
                        logger.info('Process module graph', modules_1[i].name);
                        var finalPath = _this.configuration.mainData.output;
                        if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                            finalPath += '/';
                        }
                        finalPath += 'modules/' + modules_1[i].name;
                        $ngdengine.renderGraph(modules_1[i].file, finalPath, 'f', modules_1[i].name).then(function () {
                            $ngdengine.readGraph(path.resolve(finalPath + path.sep + 'dependencies.svg'), modules_1[i].name).then(function (data) {
                                modules_1[i].graph = data;
                                resolve$$1();
                            }, function (err) {
                                logger.error('Error during graph read: ', err);
                            });
                        }, function (errorMessage) {
                            logger.error(errorMessage);
                            reject();
                        });
                    });
                })).then(function () {
                    _this.processPages();
                })
                    .catch(function (e) {
                    logger.error(e);
                });
            };
        }
    };
    Application.prototype.runWebServer = function (folder) {
        if (!this.isWatching) {
            LiveServer.start({
                root: folder,
                open: this.configuration.mainData.open,
                quiet: true,
                logLevel: 0,
                wait: 1000,
                port: this.configuration.mainData.port
            });
        }
        if (this.configuration.mainData.watch && !this.isWatching) {
            this.runWatch();
        }
        else if (this.configuration.mainData.watch && this.isWatching) {
            var srcFolder = findMainSourceFolder(this.files);
            logger.info("Already watching sources in " + srcFolder + " folder");
        }
    };
    Application.prototype.runWatch = function () {
        var _this = this;
        var srcFolder = findMainSourceFolder(this.files), watchChangedFiles = [];
        this.isWatching = true;
        logger.info("Watching sources in " + srcFolder + " folder");
        var watcher = chokidar.watch(srcFolder, {
            awaitWriteFinish: true,
            ignored: /(spec|\.d)\.ts/
        }), timerAddAndRemoveRef, timerChangeRef, waiterAddAndRemove = function () {
            clearTimeout(timerAddAndRemoveRef);
            timerAddAndRemoveRef = setTimeout(runnerAddAndRemove, 1000);
        }, runnerAddAndRemove = function () {
            _this.generate();
        }, waiterChange = function () {
            clearTimeout(timerChangeRef);
            timerChangeRef = setTimeout(runnerChange, 1000);
        }, runnerChange = function () {
            _this.setUpdatedFiles(watchChangedFiles);
            if (_this.hasWatchedFilesTSFiles()) {
                _this.getMicroDependenciesData();
            }
            else {
                _this.rebuildExternalDocumentation();
            }
        };
        if (this.configuration.mainData.includes !== '') {
            watcher.add(this.configuration.mainData.includes);
        }
        watcher
            .on('ready', function () {
            watcher
                .on('add', function (file) {
                logger.debug("File " + file + " has been added");
                // Test extension, if ts
                // rescan everything
                if (path.extname(file) === '.ts') {
                    waiterAddAndRemove();
                }
            })
                .on('change', function (file) {
                logger.debug("File " + file + " has been changed");
                // Test extension, if ts
                // rescan only file
                if (path.extname(file) === '.ts') {
                    watchChangedFiles.push(path.join(process.cwd() + path.sep + file));
                    waiterChange();
                }
                if (path.extname(file) === '.md' || path.extname(file) === '.json') {
                    watchChangedFiles.push(path.join(process.cwd() + path.sep + file));
                    waiterChange();
                }
            })
                .on('unlink', function (file) {
                logger.debug("File " + file + " has been removed");
                // Test extension, if ts
                // rescan everything
                if (path.extname(file) === '.ts') {
                    waiterAddAndRemove();
                }
            });
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
var glob$1 = require('glob');
var os = require('os');
var osName = require('os-name');
var files = [];
var cwd$1 = process.cwd();
process.setMaxListeners(0);
var CliApplication = (function (_super) {
    __extends(CliApplication, _super);
    function CliApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Run compodoc from the command line.
     */
    CliApplication.prototype.generate = function () {
        function list(val) {
            return val.split(',');
        }
        program
            .version(pkg$2.version)
            .usage('<src> [options]')
            .option('-p, --tsconfig [config]', 'A tsconfig.json file')
            .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', COMPODOC_DEFAULTS.folder)
            .option('-y, --extTheme [file]', 'External styling theme file')
            .option('-n, --name [name]', 'Title documentation', COMPODOC_DEFAULTS.title)
            .option('-a, --assetsFolder [folder]', 'External assets folder to copy in generated documentation folder')
            .option('-o, --open', 'Open the generated documentation', false)
            .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
            .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
            .option('-r, --port [port]', 'Change default serving port', COMPODOC_DEFAULTS.port)
            .option('-w, --watch', 'Watch source files after serve and force documentation rebuild', false)
            .option('--theme [theme]', 'Choose one of available themes, default is \'gitbook\' (laravel, original, postmark, readthedocs, stripe, vagrant)')
            .option('--hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
            .option('--toggleMenuItems <items>', 'Close by default items in the menu example: \'all\' or \'modules\',\'components\',\'directives\',\'classes\',\'injectables\',\'interfaces\',\'pipes\',\'additionalPages\'', list)
            .option('--includes [path]', 'Path of external markdown files to include')
            .option('--includesName [name]', 'Name of item menu of externals markdown files (default "Additional documentation")', COMPODOC_DEFAULTS.additionalEntryName)
            .option('--coverageTest [threshold]', 'Test command of documentation coverage with a threshold (default 70)')
            .option('--disableSourceCode', 'Do not add source code tab and links to source code', false)
            .option('--disableGraph', 'Do not add the dependency graph', false)
            .option('--disableCoverage', 'Do not add the documentation coverage report', false)
            .option('--disablePrivateOrInternalSupport', 'Do not show private, @internal or Angular lifecycle hooks in generated documentation', false)
            .parse(process.argv);
        var outputHelp = function () {
            program.outputHelp();
            process.exit(1);
        };
        if (program.output) {
            this.configuration.mainData.output = program.output;
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
        if (program.toggleMenuItems) {
            this.configuration.mainData.toggleMenuItems = program.toggleMenuItems;
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
        if (program.watch) {
            this.configuration.mainData.watch = program.watch;
        }
        if (program.hideGenerator) {
            this.configuration.mainData.hideGenerator = program.hideGenerator;
        }
        if (program.includes) {
            this.configuration.mainData.includes = program.includes;
        }
        if (program.includesName) {
            this.configuration.mainData.includesName = program.includesName;
        }
        if (program.coverageTest) {
            this.configuration.mainData.coverageTest = true;
            this.configuration.mainData.coverageTestThreshold = (typeof program.coverageTest === 'string') ? parseInt(program.coverageTest) : COMPODOC_DEFAULTS.defaultCoverageThreshold;
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
        if (program.disablePrivateOrInternalSupport) {
            this.configuration.mainData.disablePrivateOrInternalSupport = program.disablePrivateOrInternalSupport;
        }
        if (!this.isWatching) {
            console.log(fs.readFileSync(path.join(__dirname, '../src/resources/images/banner')).toString());
            console.log(pkg$2.version);
            console.log('');
            console.log("Node.js version : " + process.version);
            console.log('');
            console.log("Operating system : " + osName(os.platform(), os.release()));
            console.log('');
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
                    var excludeTest = _.find(exclude, function (o) {
                        var globFiles = glob$1.sync(o, {
                            cwd: cwd$1
                        });
                        if (globFiles.length > 0) {
                            var fileNameForGlobSearch_1 = path.join(dir, file).replace(cwd$1 + path.sep, ''), resultGlobSearch = globFiles.findIndex(function (element) {
                                return element === fileNameForGlobSearch_1;
                            }), test = resultGlobSearch !== -1;
                            if (test) {
                                logger.warn('Excluding', path.join(dir, file));
                            }
                            return test;
                        }
                        else {
                            var test = path.basename(o) === file;
                            if (test) {
                                logger.warn('Excluding', path.join(dir, file));
                            }
                            return test;
                        }
                    });
                    if (typeof excludeTest === 'undefined' && dir.indexOf('node_modules') < 0) {
                        file = path.join(dir, file);
                        var stat = fs.statSync(file);
                        if (stat && stat.isDirectory()) {
                            results = results.concat(walk_1(file, exclude));
                        }
                        else if (/(spec|\.d)\.ts/.test(file)) {
                            logger.warn('Ignoring', file);
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
                    logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    // use the current directory of tsconfig.json as a working directory
                    cwd$1 = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);
                    var tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd$1);
                    }
                    if (!files) {
                        var exclude = tsConfigFile.exclude || [];
                        files = walk_1(cwd$1 || '.', exclude);
                    }
                    _super.prototype.setFiles.call(this, files);
                    _super.prototype.generate.call(this);
                }
            }
            else if (program.tsconfig && program.args.length > 0 && program.coverageTest) {
                logger.info('Run documentation coverage test');
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!fs.existsSync(program.tsconfig)) {
                    logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    // use the current directory of tsconfig.json as a working directory
                    cwd$1 = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);
                    var tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd$1);
                    }
                    if (!files) {
                        var exclude = tsConfigFile.exclude || [];
                        files = walk_1(cwd$1 || '.', exclude);
                    }
                    _super.prototype.setFiles.call(this, files);
                    _super.prototype.testCoverage.call(this);
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
                    if (!fs.existsSync(program.tsconfig)) {
                        logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                        process.exit(1);
                    }
                    else {
                        var tsConfigFile = readConfig(program.tsconfig);
                        var exclude = tsConfigFile.exclude || [];
                        files = walk_1(path.resolve(sourceFolder), exclude);
                        _super.prototype.setFiles.call(this, files);
                        _super.prototype.generate.call(this);
                    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiLCIuLi9zcmMvdXRpbHMvYW5ndWxhci1hcGkudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZGVwZW5kZW5jaWVzLmVuZ2luZS50cyIsIi4uL3NyYy91dGlscy9saW5rLXBhcnNlci50cyIsIi4uL3NyYy91dGlscy9kZWZhdWx0cy50cyIsIi4uL3NyYy9hcHAvY29uZmlndXJhdGlvbi50cyIsIi4uL3NyYy91dGlscy9hbmd1bGFyLXZlcnNpb24udHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC5lbmdpbmUuaGVscGVycy50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9tYXJrZG93bi5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvZmlsZS5lbmdpbmUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvbmdkLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9zZWFyY2guZW5naW5lLnRzIiwiLi4vc3JjL3V0aWxpdGllcy50cyIsIi4uL3NyYy91dGlscy9yb3V0ZXIucGFyc2VyLnRzIiwiLi4vc3JjL3V0aWxzL2pzZG9jLnBhcnNlci50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvY29kZWdlbi50cyIsIi4uL3NyYy91dGlscy9hbmd1bGFyLWxpZmVjeWNsZXMtaG9va3MudHMiLCIuLi9zcmMvdXRpbHMvdXRpbHMudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvY29tcG9uZW50cy10cmVlLmVuZ2luZS50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvZGVwZW5kZW5jaWVzLnRzIiwiLi4vc3JjL3V0aWxzL3Byb21pc2Utc2VxdWVudGlhbC50cyIsIi4uL3NyYy9hcHAvYXBwbGljYXRpb24udHMiLCIuLi9zcmMvaW5kZXgtY2xpLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImxldCBndXRpbCA9IHJlcXVpcmUoJ2d1bHAtdXRpbCcpXG5sZXQgYyA9IGd1dGlsLmNvbG9ycztcbmxldCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKTtcblxuZW51bSBMRVZFTCB7XG5cdElORk8sXG5cdERFQlVHLFxuICAgIEVSUk9SLFxuICAgIFdBUk5cbn1cblxuY2xhc3MgTG9nZ2VyIHtcblxuXHRuYW1lO1xuXHRsb2dnZXI7XG5cdHZlcnNpb247XG5cdHNpbGVudDtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLm5hbWUgPSBwa2cubmFtZTtcblx0XHR0aGlzLnZlcnNpb24gPSBwa2cudmVyc2lvbjtcblx0XHR0aGlzLmxvZ2dlciA9IGd1dGlsLmxvZztcblx0XHR0aGlzLnNpbGVudCA9IHRydWU7XG5cdH1cblxuXHRpbmZvKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLklORk8sIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdGVycm9yKC4uLmFyZ3MpIHtcblx0XHRpZighdGhpcy5zaWxlbnQpIHJldHVybjtcblx0XHR0aGlzLmxvZ2dlcihcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkVSUk9SLCAuLi5hcmdzKVxuXHRcdCk7XG5cdH1cblxuICAgIHdhcm4oLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuV0FSTiwgLi4uYXJncylcblx0XHQpO1xuXHR9XG5cblx0ZGVidWcoLi4uYXJncykge1xuXHRcdGlmKCF0aGlzLnNpbGVudCkgcmV0dXJuO1xuXHRcdHRoaXMubG9nZ2VyKFxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuREVCVUcsIC4uLmFyZ3MpXG5cdFx0KTtcblx0fVxuXG5cdHByaXZhdGUgZm9ybWF0KGxldmVsLCAuLi5hcmdzKSB7XG5cblx0XHRsZXQgcGFkID0gKHMsIGwsIGM9JycpID0+IHtcblx0XHRcdHJldHVybiBzICsgQXJyYXkoIE1hdGgubWF4KDAsIGwgLSBzLmxlbmd0aCArIDEpKS5qb2luKCBjIClcblx0XHR9O1xuXG5cdFx0bGV0IG1zZyA9IGFyZ3Muam9pbignICcpO1xuXHRcdGlmKGFyZ3MubGVuZ3RoID4gMSkge1xuXHRcdFx0bXNnID0gYCR7IHBhZChhcmdzLnNoaWZ0KCksIDE1LCAnICcpIH06ICR7IGFyZ3Muam9pbignICcpIH1gO1xuXHRcdH1cblxuXG5cdFx0c3dpdGNoKGxldmVsKSB7XG5cdFx0XHRjYXNlIExFVkVMLklORk86XG5cdFx0XHRcdG1zZyA9IGMuZ3JlZW4obXNnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTEVWRUwuREVCVUc6XG5cdFx0XHRcdG1zZyA9IGMuY3lhbihtc2cpO1xuXHRcdFx0XHRicmVhaztcblxuICAgICAgICAgICAgY2FzZSBMRVZFTC5XQVJOOlxuXHRcdFx0XHRtc2cgPSBjLnllbGxvdyhtc2cpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBMRVZFTC5FUlJPUjpcblx0XHRcdFx0bXNnID0gYy5yZWQobXNnKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtcblx0XHRcdG1zZ1xuXHRcdF0uam9pbignJyk7XG5cdH1cbn1cblxuZXhwb3J0IGxldCBsb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG4iLCJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5cbmxldCBBbmd1bGFyQVBJcyA9IHJlcXVpcmUoJy4uL3NyYy9kYXRhL2FwaS1saXN0Lmpzb24nKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRlckluQW5ndWxhckFQSXModHlwZTogc3RyaW5nKSB7XG4gICAgbGV0IF9yZXN1bHQgPSB7XG4gICAgICAgIHNvdXJjZTogJ2V4dGVybmFsJyxcbiAgICAgICAgZGF0YTogbnVsbFxuICAgIH07XG5cbiAgICBfLmZvckVhY2goQW5ndWxhckFQSXMsIGZ1bmN0aW9uKGFuZ3VsYXJNb2R1bGVBUElzLCBhbmd1bGFyTW9kdWxlKSB7XG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IGFuZ3VsYXJNb2R1bGVBUElzLmxlbmd0aDtcbiAgICAgICAgZm9yIChpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYW5ndWxhck1vZHVsZUFQSXNbaV0udGl0bGUgPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICBfcmVzdWx0LmRhdGEgPSBhbmd1bGFyTW9kdWxlQVBJc1tpXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gX3Jlc3VsdDtcbn1cbiIsImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuaW1wb3J0IHsgZmluZGVySW5Bbmd1bGFyQVBJcyB9IGZyb20gJy4uLy4uL3V0aWxzL2FuZ3VsYXItYXBpJztcblxuaW1wb3J0IHsgUGFyc2VkRGF0YSB9IGZyb20gJy4uL2ludGVyZmFjZXMvcGFyc2VkLWRhdGEuaW50ZXJmYWNlJztcbmltcG9ydCB7IE1pc2NlbGxhbmVvdXNEYXRhIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9taXNjZWxsYW5lb3VzLWRhdGEuaW50ZXJmYWNlJztcblxuY2xhc3MgRGVwZW5kZW5jaWVzRW5naW5lIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6RGVwZW5kZW5jaWVzRW5naW5lID0gbmV3IERlcGVuZGVuY2llc0VuZ2luZSgpO1xuXG4gICAgcmF3RGF0YTogUGFyc2VkRGF0YTtcbiAgICBtb2R1bGVzOiBPYmplY3RbXTtcbiAgICByYXdNb2R1bGVzOiBPYmplY3RbXTtcbiAgICByYXdNb2R1bGVzRm9yT3ZlcnZpZXc6IE9iamVjdFtdO1xuICAgIGNvbXBvbmVudHM6IE9iamVjdFtdO1xuICAgIGRpcmVjdGl2ZXM6IE9iamVjdFtdO1xuICAgIGluamVjdGFibGVzOiBPYmplY3RbXTtcbiAgICBpbnRlcmZhY2VzOiBPYmplY3RbXTtcbiAgICByb3V0ZXM6IE9iamVjdFtdO1xuICAgIHBpcGVzOiBPYmplY3RbXTtcbiAgICBjbGFzc2VzOiBPYmplY3RbXTtcbiAgICBtaXNjZWxsYW5lb3VzOiBNaXNjZWxsYW5lb3VzRGF0YTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZihEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgRGVwZW5kZW5jaWVzRW5naW5lLmdldEluc3RhbmNlKCkgaW5zdGVhZCBvZiBuZXcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgRGVwZW5kZW5jaWVzRW5naW5lLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTpEZXBlbmRlbmNpZXNFbmdpbmVcbiAgICB7XG4gICAgICAgIHJldHVybiBEZXBlbmRlbmNpZXNFbmdpbmUuX2luc3RhbmNlO1xuICAgIH1cbiAgICBjbGVhbk1vZHVsZXMobW9kdWxlcykge1xuICAgICAgICBsZXQgX20gPSBtb2R1bGVzLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBsZW4gPSBtb2R1bGVzLmxlbmd0aDtcbiAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBqID0gMCxcbiAgICAgICAgICAgICAgICBsZW5nID0gX21baV0uZGVjbGFyYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihqOyBqPGxlbmc7IGorKykge1xuICAgICAgICAgICAgICAgIGxldCBrID0gMCxcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3Q7XG4gICAgICAgICAgICAgICAgaWYgKF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5qc2RvY3RhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3QgPSBfbVtpXS5kZWNsYXJhdGlvbnNbal0uanNkb2N0YWdzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGs7IGs8bGVuZ3Q7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5qc2RvY3RhZ3Nba10ucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfbVtpXS5kZWNsYXJhdGlvbnNbal0uY29uc3RydWN0b3JPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5jb25zdHJ1Y3Rvck9iai5qc2RvY3RhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0ID0gX21baV0uZGVjbGFyYXRpb25zW2pdLmNvbnN0cnVjdG9yT2JqLmpzZG9jdGFncy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IoazsgazxsZW5ndDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5jb25zdHJ1Y3Rvck9iai5qc2RvY3RhZ3Nba10ucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfbVtpXS5kZWNsYXJhdGlvbnNbal0ubWV0aG9kc0NsYXNzICYmIF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5tZXRob2RzQ2xhc3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbCA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGggPSBfbVtpXS5kZWNsYXJhdGlvbnNbal0ubWV0aG9kc0NsYXNzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGw7IGw8bGVuZ3RoOyBsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBfbVtpXS5kZWNsYXJhdGlvbnNbal0ubWV0aG9kc0NsYXNzW2xdLmpzZG9jdGFncztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX21baV0uZGVjbGFyYXRpb25zW2pdLnByb3BlcnRpZXNDbGFzcyAmJiBfbVtpXS5kZWNsYXJhdGlvbnNbal0ucHJvcGVydGllc0NsYXNzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGwgPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gX21baV0uZGVjbGFyYXRpb25zW2pdLnByb3BlcnRpZXNDbGFzcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsOyBsPGxlbmd0aDsgbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgX21baV0uZGVjbGFyYXRpb25zW2pdLnByb3BlcnRpZXNDbGFzc1tsXS5qc2RvY3RhZ3M7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVsZXRlIF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5zb3VyY2VDb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIF9tW2ldLnNvdXJjZUNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9tO1xuICAgIH1cbiAgICBpbml0KGRhdGE6IFBhcnNlZERhdGEpIHtcbiAgICAgICAgdGhpcy5yYXdEYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5tb2R1bGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLm1vZHVsZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5yYXdNb2R1bGVzRm9yT3ZlcnZpZXcgPSBfLnNvcnRCeShfLmNsb25lRGVlcCh0aGlzLmNsZWFuTW9kdWxlcyhkYXRhLm1vZHVsZXMpKSwgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLnJhd01vZHVsZXMgPSBfLnNvcnRCeShfLmNsb25lRGVlcCh0aGlzLmNsZWFuTW9kdWxlcyhkYXRhLm1vZHVsZXMpKSwgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuY29tcG9uZW50cywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuZGlyZWN0aXZlcywgWyduYW1lJ10pO1xuICAgICAgICB0aGlzLmluamVjdGFibGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmluamVjdGFibGVzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbnRlcmZhY2VzLCBbJ25hbWUnXSk7XG4gICAgICAgIHRoaXMucGlwZXMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEucGlwZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5jbGFzc2VzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLmNsYXNzZXMsIFsnbmFtZSddKTtcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzID0gdGhpcy5yYXdEYXRhLm1pc2NlbGxhbmVvdXM7XG4gICAgICAgIHRoaXMucHJlcGFyZU1pc2NlbGxhbmVvdXMoKTtcbiAgICAgICAgdGhpcy5yb3V0ZXMgPSB0aGlzLnJhd0RhdGEucm91dGVzVHJlZTtcbiAgICAgICAgdGhpcy5jbGVhblJhd01vZHVsZXNGb3JPdmVydmlldygpO1xuICAgIH1cbiAgICBmaW5kKHR5cGU6IHN0cmluZykge1xuICAgICAgICBsZXQgZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGxldCBfcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6ICdpbnRlcm5hbCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKGRhdGFbaV0ubmFtZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVzdWx0LmRhdGEgPSBkYXRhW2ldXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5pbmplY3RhYmxlcyksXG4gICAgICAgICAgICByZXN1bHRJbkNvbXBvZG9jSW50ZXJmYWNlcyA9IGZpbmRlckluQ29tcG9kb2NEZXBlbmRlbmNpZXModGhpcy5pbnRlcmZhY2VzKSxcbiAgICAgICAgICAgIHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzID0gZmluZGVySW5Db21wb2RvY0RlcGVuZGVuY2llcyh0aGlzLmNsYXNzZXMpLFxuICAgICAgICAgICAgcmVzdWx0SW5Db21wb2RvY0NvbXBvbmVudHMgPSBmaW5kZXJJbkNvbXBvZG9jRGVwZW5kZW5jaWVzKHRoaXMuY29tcG9uZW50cyksXG4gICAgICAgICAgICByZXN1bHRJbkFuZ3VsYXJBUElzID0gZmluZGVySW5Bbmd1bGFyQVBJcyh0eXBlKVxuXG4gICAgICAgIGlmIChyZXN1bHRJbkNvbXBvZG9jSW5qZWN0YWJsZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEluQ29tcG9kb2NJbmplY3RhYmxlcztcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkNvbXBvZG9jSW50ZXJmYWNlcy5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0SW5Db21wb2RvY0ludGVyZmFjZXM7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0SW5Db21wb2RvY0NsYXNzZXMuZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEluQ29tcG9kb2NDbGFzc2VzO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdEluQ29tcG9kb2NDb21wb25lbnRzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkNvbXBvZG9jQ29tcG9uZW50cztcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHRJbkFuZ3VsYXJBUElzLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRJbkFuZ3VsYXJBUElzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZSh1cGRhdGVkRGF0YSkge1xuICAgICAgICBpZiAodXBkYXRlZERhdGEubW9kdWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubW9kdWxlcywgKG1vZHVsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLm1vZHVsZXMsIHsnbmFtZSc6IG1vZHVsZS5uYW1lfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVzW19pbmRleF0gPSBtb2R1bGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEuY29tcG9uZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEuY29tcG9uZW50cywgKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLmNvbXBvbmVudHMsIHsnbmFtZSc6IGNvbXBvbmVudC5uYW1lfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzW19pbmRleF0gPSBjb21wb25lbnQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEuZGlyZWN0aXZlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEuZGlyZWN0aXZlcywgKGRpcmVjdGl2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLmRpcmVjdGl2ZXMsIHsnbmFtZSc6IGRpcmVjdGl2ZS5uYW1lfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzW19pbmRleF0gPSBkaXJlY3RpdmU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEuaW5qZWN0YWJsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLmluamVjdGFibGVzLCAoaW5qZWN0YWJsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLmluamVjdGFibGVzLCB7J25hbWUnOiBpbmplY3RhYmxlLm5hbWV9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmluamVjdGFibGVzW19pbmRleF0gPSBpbmplY3RhYmxlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLmludGVyZmFjZXMsIChpbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5pbnRlcmZhY2VzLCB7J25hbWUnOiBpbnQubmFtZX0pO1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlc1tfaW5kZXhdID0gaW50O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLnBpcGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5waXBlcywgKHBpcGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5waXBlcywgeyduYW1lJzogcGlwZS5uYW1lfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5waXBlc1tfaW5kZXhdID0gcGlwZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5jbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5jbGFzc2VzLCAoY2xhc3NlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMuY2xhc3NlcywgeyduYW1lJzogY2xhc3NlLm5hbWV9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzZXNbX2luZGV4XSA9IGNsYXNzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNaXNjZWxsYW5lb3VzIHVwZGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy52YXJpYWJsZXMsICh2YXJpYWJsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLCB7XG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogdmFyaWFibGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGUnOiB2YXJpYWJsZS5maWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLnZhcmlhYmxlc1tfaW5kZXhdID0gdmFyaWFibGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLmZ1bmN0aW9ucywgKGZ1bmMpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5taXNjZWxsYW5lb3VzLmZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IGZ1bmMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGUnOiBmdW5jLmZpbGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zW19pbmRleF0gPSBmdW5jO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMudHlwZWFsaWFzZXMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLCAodHlwZWFsaWFzKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcywge1xuICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IHR5cGVhbGlhcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAnZmlsZSc6IHR5cGVhbGlhcy5maWxlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzW19pbmRleF0gPSB0eXBlYWxpYXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9ucywgKGVudW1lcmF0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBlbnVtZXJhdGlvbi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAnZmlsZSc6IGVudW1lcmF0aW9uLmZpbGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zW19pbmRleF0gPSBlbnVtZXJhdGlvbjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLnR5cGVzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy50eXBlcywgKHR5cCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLm1pc2NlbGxhbmVvdXMudHlwZXMsIHtcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiB0eXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGUnOiB0eXAuZmlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy50eXBlc1tfaW5kZXhdID0gdHlwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVwYXJlTWlzY2VsbGFuZW91cygpO1xuICAgIH1cbiAgICBmaW5kSW5Db21wb2RvYyhuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IG1lcmdlZERhdGEgPSBfLmNvbmNhdChbXSwgdGhpcy5tb2R1bGVzLCB0aGlzLmNvbXBvbmVudHMsIHRoaXMuZGlyZWN0aXZlcywgdGhpcy5pbmplY3RhYmxlcywgdGhpcy5pbnRlcmZhY2VzLCB0aGlzLnBpcGVzLCB0aGlzLmNsYXNzZXMpLFxuICAgICAgICAgICAgcmVzdWx0ID0gXy5maW5kKG1lcmdlZERhdGEsIHsnbmFtZSc6IG5hbWV9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCB8fCBmYWxzZTtcbiAgICB9XG4gICAgY2xlYW5SYXdNb2R1bGVzRm9yT3ZlcnZpZXcoKSB7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLnJhd01vZHVsZXNGb3JPdmVydmlldywgKG1vZHVsZSkgPT4ge1xuICAgICAgICAgICAgbW9kdWxlLmRlY2xhcmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgbW9kdWxlLnByb3ZpZGVycyA9IFtdO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJlcGFyZU1pc2NlbGxhbmVvdXMoKSB7XG4gICAgICAgIC8vZ3JvdXAgZWFjaCBzdWJnb3VwIGJ5IGZpbGVcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmdyb3VwZWRWYXJpYWJsZXMgPSBfLmdyb3VwQnkodGhpcy5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcywgJ2ZpbGUnKTtcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmdyb3VwZWRGdW5jdGlvbnMgPSBfLmdyb3VwQnkodGhpcy5taXNjZWxsYW5lb3VzLmZ1bmN0aW9ucywgJ2ZpbGUnKTtcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmdyb3VwZWRFbnVtZXJhdGlvbnMgPSBfLmdyb3VwQnkodGhpcy5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9ucywgJ2ZpbGUnKTtcbiAgICB9XG4gICAgZ2V0TW9kdWxlKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gXy5maW5kKHRoaXMubW9kdWxlcywgWyduYW1lJywgbmFtZV0pO1xuICAgIH1cbiAgICBnZXRSYXdNb2R1bGUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBfLmZpbmQodGhpcy5yYXdNb2R1bGVzLCBbJ25hbWUnLCBuYW1lXSk7XG4gICAgfVxuICAgIGdldE1vZHVsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZHVsZXM7XG4gICAgfVxuICAgIGdldENvbXBvbmVudHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHM7XG4gICAgfVxuICAgIGdldERpcmVjdGl2ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXM7XG4gICAgfVxuICAgIGdldEluamVjdGFibGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbmplY3RhYmxlcztcbiAgICB9XG4gICAgZ2V0SW50ZXJmYWNlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlcztcbiAgICB9XG4gICAgZ2V0Um91dGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3V0ZXM7XG4gICAgfVxuICAgIGdldFBpcGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5waXBlcztcbiAgICB9XG4gICAgZ2V0Q2xhc3NlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3NlcztcbiAgICB9XG4gICAgZ2V0TWlzY2VsbGFuZW91cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlzY2VsbGFuZW91cztcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgJGRlcGVuZGVuY2llc0VuZ2luZSA9IERlcGVuZGVuY2llc0VuZ2luZS5nZXRJbnN0YW5jZSgpO1xuIiwiaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4uL2FwcC9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdExlYWRpbmdUZXh0KHN0cmluZywgY29tcGxldGVUYWcpIHtcbiAgICB2YXIgdGFnSW5kZXggPSBzdHJpbmcuaW5kZXhPZihjb21wbGV0ZVRhZyk7XG4gICAgdmFyIGxlYWRpbmdUZXh0ID0gbnVsbDtcbiAgICB2YXIgbGVhZGluZ1RleHRSZWdFeHAgPSAvXFxbKC4rPylcXF0vZztcbiAgICB2YXIgbGVhZGluZ1RleHRJbmZvID0gbGVhZGluZ1RleHRSZWdFeHAuZXhlYyhzdHJpbmcpO1xuXG4gICAgLy8gZGlkIHdlIGZpbmQgbGVhZGluZyB0ZXh0LCBhbmQgaWYgc28sIGRvZXMgaXQgaW1tZWRpYXRlbHkgcHJlY2VkZSB0aGUgdGFnP1xuICAgIHdoaWxlIChsZWFkaW5nVGV4dEluZm8gJiYgbGVhZGluZ1RleHRJbmZvLmxlbmd0aCkge1xuICAgICAgICBpZiAobGVhZGluZ1RleHRJbmZvLmluZGV4ICsgbGVhZGluZ1RleHRJbmZvWzBdLmxlbmd0aCA9PT0gdGFnSW5kZXgpIHtcbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKGxlYWRpbmdUZXh0SW5mb1swXSwgJycpO1xuICAgICAgICAgICAgbGVhZGluZ1RleHQgPSBsZWFkaW5nVGV4dEluZm9bMV07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGxlYWRpbmdUZXh0SW5mbyA9IGxlYWRpbmdUZXh0UmVnRXhwLmV4ZWMoc3RyaW5nKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsZWFkaW5nVGV4dDogbGVhZGluZ1RleHQsXG4gICAgICAgIHN0cmluZzogc3RyaW5nXG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0TGlua1RleHQodGV4dCkge1xuICAgIHZhciBsaW5rVGV4dDtcbiAgICB2YXIgdGFyZ2V0O1xuICAgIHZhciBzcGxpdEluZGV4O1xuXG4gICAgLy8gaWYgYSBwaXBlIGlzIG5vdCBwcmVzZW50LCB3ZSBzcGxpdCBvbiB0aGUgZmlyc3Qgc3BhY2VcbiAgICBzcGxpdEluZGV4ID0gdGV4dC5pbmRleE9mKCd8Jyk7XG4gICAgaWYgKHNwbGl0SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHNwbGl0SW5kZXggPSB0ZXh0LnNlYXJjaCgvXFxzLyk7XG4gICAgfVxuXG4gICAgaWYgKHNwbGl0SW5kZXggIT09IC0xKSB7XG4gICAgICAgIGxpbmtUZXh0ID0gdGV4dC5zdWJzdHIoc3BsaXRJbmRleCArIDEpO1xuICAgICAgICAvLyBOb3JtYWxpemUgc3Vic2VxdWVudCBuZXdsaW5lcyB0byBhIHNpbmdsZSBzcGFjZS5cbiAgICAgICAgbGlua1RleHQgPSBsaW5rVGV4dC5yZXBsYWNlKC9cXG4rLywgJyAnKTtcbiAgICAgICAgdGFyZ2V0ID0gdGV4dC5zdWJzdHIoMCwgc3BsaXRJbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGlua1RleHQ6IGxpbmtUZXh0LFxuICAgICAgICB0YXJnZXQ6IHRhcmdldCB8fCB0ZXh0XG4gICAgfTtcbn1cblxuZXhwb3J0IGxldCBMaW5rUGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHByb2Nlc3NUaGVMaW5rID0gZnVuY3Rpb24oc3RyaW5nLCB0YWdJbmZvKSB7XG4gICAgICAgIHZhciBsZWFkaW5nID0gZXh0cmFjdExlYWRpbmdUZXh0KHN0cmluZywgdGFnSW5mby5jb21wbGV0ZVRhZyksXG4gICAgICAgICAgICBsaW5rVGV4dCA9IGxlYWRpbmcubGVhZGluZ1RleHQgfHwgJycsXG4gICAgICAgICAgICBzcGxpdCxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZTtcblxuICAgICAgICBzcGxpdCA9IHNwbGl0TGlua1RleHQodGFnSW5mby50ZXh0KTtcbiAgICAgICAgdGFyZ2V0ID0gc3BsaXQudGFyZ2V0O1xuXG4gICAgICAgIGlmIChsZWFkaW5nLmxlYWRpbmdUZXh0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2UgPSAnWycgKyBsZWFkaW5nLmxlYWRpbmdUZXh0ICsgJ10nICsgdGFnSW5mby5jb21wbGV0ZVRhZztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BsaXQubGlua1RleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2UgPSB0YWdJbmZvLmNvbXBsZXRlVGFnO1xuICAgICAgICAgICAgbGlua1RleHQgPSBzcGxpdC5saW5rVGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShzdHJpbmd0b1JlcGxhY2UsICdbJyArIGxpbmtUZXh0ICsgJ10oJyArIHRhcmdldCArICcpJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydFxuICAgICAqIHtAbGluayBodHRwOi8vd3d3Lmdvb2dsZS5jb218R29vZ2xlfSBvciB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tIEdpdEh1Yn0gdG8gW0dpdGh1Yl0oaHR0cHM6Ly9naXRodWIuY29tKVxuICAgICAqL1xuXG4gICAgdmFyIHJlcGxhY2VMaW5rVGFnID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcblxuICAgICAgICB2YXIgdGFnUmVnRXhwID0gbmV3IFJlZ0V4cCgnXFxcXHtAbGlua1xcXFxzKygoPzoufFxcbikrPylcXFxcfScsICdpJyksXG4gICAgICAgICAgICBtYXRjaGVzLFxuICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcsXG4gICAgICAgICAgICB0YWdJbmZvID0gW107XG5cbiAgICAgICAgZnVuY3Rpb24gcmVwbGFjZU1hdGNoKHJlcGxhY2VyLCB0YWcsIG1hdGNoLCB0ZXh0KSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2hlZFRhZyA9IHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZVRhZzogbWF0Y2gsXG4gICAgICAgICAgICAgICAgdGFnOiB0YWcsXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRhZ0luZm8ucHVzaChtYXRjaGVkVGFnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VyKHN0ciwgbWF0Y2hlZFRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBtYXRjaGVzID0gdGFnUmVnRXhwLmV4ZWMoc3RyKTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcgPSBzdHI7XG4gICAgICAgICAgICAgICAgc3RyID0gcmVwbGFjZU1hdGNoKHByb2Nlc3NUaGVMaW5rLCAnbGluaycsIG1hdGNoZXNbMF0sIG1hdGNoZXNbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChtYXRjaGVzICYmIHByZXZpb3VzU3RyaW5nICE9PSBzdHIpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZXdTdHJpbmc6IHN0clxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBfcmVzb2x2ZUxpbmtzID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHJlcGxhY2VMaW5rVGFnKHN0cikubmV3U3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc29sdmVMaW5rczogX3Jlc29sdmVMaW5rc1xuICAgIH1cbn0pKCk7XG4iLCJleHBvcnQgY29uc3QgQ09NUE9ET0NfREVGQVVMVFMgPSB7XG4gICAgdGl0bGU6ICdBcHBsaWNhdGlvbiBkb2N1bWVudGF0aW9uJyxcbiAgICBhZGRpdGlvbmFsRW50cnlOYW1lOiAnQWRkaXRpb25hbCBkb2N1bWVudGF0aW9uJyxcbiAgICBhZGRpdGlvbmFsRW50cnlQYXRoOiAnYWRkaXRpb25hbC1kb2N1bWVudGF0aW9uJyxcbiAgICBmb2xkZXI6ICcuL2RvY3VtZW50YXRpb24vJyxcbiAgICBwb3J0OiA4MDgwLFxuICAgIHRoZW1lOiAnZ2l0Ym9vaycsXG4gICAgYmFzZTogJy8nLFxuICAgIGRlZmF1bHRDb3ZlcmFnZVRocmVzaG9sZDogNzAsXG4gICAgZGlzYWJsZVNvdXJjZUNvZGU6IGZhbHNlLFxuICAgIGRpc2FibGVHcmFwaDogZmFsc2UsXG4gICAgZGlzYWJsZUNvdmVyYWdlOiBmYWxzZSxcbiAgICBkaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0OiBmYWxzZSxcbiAgICBQQUdFX1RZUEVTOiB7XG4gICAgICAgIFJPT1Q6ICdyb290JyxcbiAgICAgICAgSU5URVJOQUw6ICdpbnRlcm5hbCdcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4uL3V0aWxzL2RlZmF1bHRzJztcblxuaW1wb3J0IHsgUGFnZUludGVyZmFjZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9wYWdlLmludGVyZmFjZSc7XG5cbmltcG9ydCB7IE1haW5EYXRhSW50ZXJmYWNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzL21haW4tZGF0YS5pbnRlcmZhY2UnO1xuXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzL2NvbmZpZ3VyYXRpb24uaW50ZXJmYWNlJztcblxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb24gaW1wbGVtZW50cyBDb25maWd1cmF0aW9uSW50ZXJmYWNlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6Q29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKCk7XG5cbiAgICBwcml2YXRlIF9wYWdlczpQYWdlSW50ZXJmYWNlW10gPSBbXTtcbiAgICBwcml2YXRlIF9tYWluRGF0YTogTWFpbkRhdGFJbnRlcmZhY2UgPSB7XG4gICAgICAgIG91dHB1dDogQ09NUE9ET0NfREVGQVVMVFMuZm9sZGVyLFxuICAgICAgICB0aGVtZTogQ09NUE9ET0NfREVGQVVMVFMudGhlbWUsXG4gICAgICAgIGV4dFRoZW1lOiAnJyxcbiAgICAgICAgc2VydmU6IGZhbHNlLFxuICAgICAgICBwb3J0OiBDT01QT0RPQ19ERUZBVUxUUy5wb3J0LFxuICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgYXNzZXRzRm9sZGVyOiAnJyxcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5OYW1lOiBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSxcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbjogJycsXG4gICAgICAgIGJhc2U6IENPTVBPRE9DX0RFRkFVTFRTLmJhc2UsXG4gICAgICAgIGhpZGVHZW5lcmF0b3I6IGZhbHNlLFxuICAgICAgICBtb2R1bGVzOiBbXSxcbiAgICAgICAgcmVhZG1lOiAnJyxcbiAgICAgICAgYWRkaXRpb25hbFBhZ2VzOiBbXSxcbiAgICAgICAgcGlwZXM6IFtdLFxuICAgICAgICBjbGFzc2VzOiBbXSxcbiAgICAgICAgaW50ZXJmYWNlczogW10sXG4gICAgICAgIGNvbXBvbmVudHM6IFtdLFxuICAgICAgICBkaXJlY3RpdmVzOiBbXSxcbiAgICAgICAgaW5qZWN0YWJsZXM6IFtdLFxuICAgICAgICBtaXNjZWxsYW5lb3VzOiBbXSxcbiAgICAgICAgcm91dGVzOiBbXSxcbiAgICAgICAgdHNjb25maWc6ICcnLFxuICAgICAgICB0b2dnbGVNZW51SXRlbXM6IFtdLFxuICAgICAgICBpbmNsdWRlczogJycsXG4gICAgICAgIGluY2x1ZGVzTmFtZTogQ09NUE9ET0NfREVGQVVMVFMuYWRkaXRpb25hbEVudHJ5TmFtZSxcbiAgICAgICAgaW5jbHVkZXNGb2xkZXI6IENPTVBPRE9DX0RFRkFVTFRTLmFkZGl0aW9uYWxFbnRyeVBhdGgsXG4gICAgICAgIGRpc2FibGVTb3VyY2VDb2RlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlU291cmNlQ29kZSxcbiAgICAgICAgZGlzYWJsZUdyYXBoOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlR3JhcGgsXG4gICAgICAgIGRpc2FibGVDb3ZlcmFnZTogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZUNvdmVyYWdlLFxuICAgICAgICBkaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0OiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0LFxuICAgICAgICB3YXRjaDogZmFsc2UsXG4gICAgICAgIG1haW5HcmFwaDogJycsXG4gICAgICAgIGNvdmVyYWdlVGVzdDogZmFsc2UsXG4gICAgICAgIGNvdmVyYWdlVGVzdFRocmVzaG9sZDogQ09NUE9ET0NfREVGQVVMVFMuZGVmYXVsdENvdmVyYWdlVGhyZXNob2xkLFxuICAgICAgICByb3V0ZXNMZW5ndGg6IDAsXG4gICAgICAgIGFuZ3VsYXJWZXJzaW9uOiAnJ1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYoQ29uZmlndXJhdGlvbi5faW5zdGFuY2Upe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvcjogSW5zdGFudGlhdGlvbiBmYWlsZWQ6IFVzZSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCkgaW5zdGVhZCBvZiBuZXcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgQ29uZmlndXJhdGlvbi5faW5zdGFuY2UgPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTpDb25maWd1cmF0aW9uXG4gICAge1xuICAgICAgICByZXR1cm4gQ29uZmlndXJhdGlvbi5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgYWRkUGFnZShwYWdlOiBQYWdlSW50ZXJmYWNlKSB7XG4gICAgICAgIHRoaXMuX3BhZ2VzLnB1c2gocGFnZSk7XG4gICAgfVxuXG4gICAgYWRkQWRkaXRpb25hbFBhZ2UocGFnZTogUGFnZUludGVyZmFjZSkge1xuICAgICAgICB0aGlzLl9tYWluRGF0YS5hZGRpdGlvbmFsUGFnZXMucHVzaChwYWdlKTtcbiAgICB9XG5cbiAgICByZXNldFBhZ2VzKCkge1xuICAgICAgICB0aGlzLl9wYWdlcyA9IFtdO1xuICAgIH1cblxuICAgIHJlc2V0QWRkaXRpb25hbFBhZ2VzKCkge1xuICAgICAgICB0aGlzLl9tYWluRGF0YS5hZGRpdGlvbmFsUGFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXQgcGFnZXMoKTpQYWdlSW50ZXJmYWNlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFnZXM7XG4gICAgfVxuICAgIHNldCBwYWdlcyhwYWdlczpQYWdlSW50ZXJmYWNlW10pIHtcbiAgICAgICAgdGhpcy5fcGFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXQgbWFpbkRhdGEoKTpNYWluRGF0YUludGVyZmFjZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYWluRGF0YTtcbiAgICB9XG4gICAgc2V0IG1haW5EYXRhKGRhdGE6TWFpbkRhdGFJbnRlcmZhY2UpIHtcbiAgICAgICAgKDxhbnk+T2JqZWN0KS5hc3NpZ24odGhpcy5fbWFpbkRhdGEsIGRhdGEpO1xuICAgIH1cbn07XG4iLCJsZXQgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhblZlcnNpb24odmVyc2lvbikge1xuICAgIHJldHVybiB2ZXJzaW9uLnJlcGxhY2UoJ34nLCAnJylcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCdeJywgJycpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgnPScsICcnKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJzwnLCAnJylcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCc+JywgJycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmd1bGFyVmVyc2lvbk9mUHJvamVjdChwYWNrYWdlRGF0YSkge1xuICAgIGxldCBfcmVzdWx0ID0gJyc7XG5cbiAgICBpZiAocGFja2FnZURhdGFbJ2RlcGVuZGVuY2llcyddKSB7XG4gICAgICAgIGxldCBhbmd1bGFyQ29yZSA9IHBhY2thZ2VEYXRhWydkZXBlbmRlbmNpZXMnXVsnQGFuZ3VsYXIvY29yZSddO1xuICAgICAgICBpZiAoYW5ndWxhckNvcmUpIHtcbiAgICAgICAgICAgIF9yZXN1bHQgPSBjbGVhblZlcnNpb24oYW5ndWxhckNvcmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9yZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzQW5ndWxhclZlcnNpb25BcmNoaXZlZCh2ZXJzaW9uKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IHNlbXZlci5jb21wYXJlKHZlcnNpb24sICcyLjQuMTAnKSA8PSAwO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlZml4T2ZmaWNpYWxEb2ModmVyc2lvbikge1xuICAgIHJldHVybiBpc0FuZ3VsYXJWZXJzaW9uQXJjaGl2ZWQodmVyc2lvbikgPyAndjIuJyA6ICcnO1xufVxuIiwiaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcbmltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vLi4vdXRpbHMvZGVmYXVsdHMnO1xuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5pbXBvcnQgeyBleHRyYWN0TGVhZGluZ1RleHQsIHNwbGl0TGlua1RleHQgfSBmcm9tICcuLi8uLi91dGlscy9saW5rLXBhcnNlcic7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyBwcmVmaXhPZmZpY2lhbERvYyB9IGZyb20gJy4uLy4uL3V0aWxzL2FuZ3VsYXItdmVyc2lvbic7XG5cbmltcG9ydCB7IGpzZG9jVGFnSW50ZXJmYWNlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9qc2RvYy10YWcuaW50ZXJmYWNlJztcblxuZXhwb3J0IGxldCBIdG1sRW5naW5lSGVscGVycyA9IChmdW5jdGlvbigpIHtcbiAgICBsZXQgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL1RPRE8gdXNlIHRoaXMgaW5zdGVhZCA6IGh0dHBzOi8vZ2l0aHViLmNvbS9hc3NlbWJsZS9oYW5kbGViYXJzLWhlbHBlcnNcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciggXCJjb21wYXJlXCIsIGZ1bmN0aW9uKGEsIG9wZXJhdG9yLCBiLCBvcHRpb25zKSB7XG4gICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hhbmRsZWJhcnMgSGVscGVyIHt7Y29tcGFyZX19IGV4cGVjdHMgNCBhcmd1bWVudHMnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luZGV4b2YnOlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IChiLmluZGV4T2YoYSkgIT09IC0xKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGEgPT09IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSAhPT0gYjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gYSA+IGI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hlbHBlciB7e2NvbXBhcmV9fTogaW52YWxpZCBvcGVyYXRvcjogYCcgKyBvcGVyYXRvciArICdgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcIm9yXCIsIGZ1bmN0aW9uKC8qIGFueSwgYW55LCAuLi4sIG9wdGlvbnMgKi8pIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMTtcbiAgICAgICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1tsZW5dO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSkge1xuICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImZpbHRlckFuZ3VsYXIyTW9kdWxlc1wiLCBmdW5jdGlvbih0ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBORzJfTU9EVUxFUzpzdHJpbmdbXSA9IFtcbiAgICAgICAgICAgICAgICAnQnJvd3Nlck1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ0Zvcm1zTW9kdWxlJyxcbiAgICAgICAgICAgICAgICAnSHR0cE1vZHVsZScsXG4gICAgICAgICAgICAgICAgJ1JvdXRlck1vZHVsZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbGVuID0gTkcyX01PRFVMRVMubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKE5HMl9NT0RVTEVTW2ldKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImRlYnVnXCIsIGZ1bmN0aW9uKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgQ29udGV4dFwiKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09XCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgICAgaWYgKG9wdGlvbmFsVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3B0aW9uYWxWYWx1ZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25hbFZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdicmVha2xpbmVzJywgZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgdGV4dCA9IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbih0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICc8YnI+Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2dtLCAnJm5ic3A7Jyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cdC9nbSwgJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOycpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlc2NhcGVTaW1wbGVRdW90ZScsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgIGlmKCF0ZXh0KSByZXR1cm47XG4gICAgICAgICAgICB2YXIgX3RleHQgPSB0ZXh0LnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKTtcbiAgICAgICAgICAgIF90ZXh0ID0gX3RleHQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJycpO1xuICAgICAgICAgICAgcmV0dXJuIF90ZXh0O1xuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYnJlYWtDb21tYScsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgIHRleHQgPSBIYW5kbGViYXJzLlV0aWxzLmVzY2FwZUV4cHJlc3Npb24odGV4dCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8sL2csICcsPGJyPicpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdtb2RpZktpbmQnLCBmdW5jdGlvbihraW5kKSB7XG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi83M2VlMmZlYjUxYzliN2UyNGEyOWViNGNlZTE5ZDdjMTRiOTMzMDY1L2xpYi90eXBlc2NyaXB0LmQudHMjTDY0XG4gICAgICAgICAgICBsZXQgX2tpbmRUZXh0ID0gJyc7XG4gICAgICAgICAgICBzd2l0Y2goa2luZCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTEyOlxuICAgICAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnUHJpdmF0ZSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTEzOlxuICAgICAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnUHJvdGVjdGVkJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTQ6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdQdWJsaWMnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDExNTpcbiAgICAgICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ1N0YXRpYyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcoX2tpbmRUZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ21vZGlmSWNvbicsIGZ1bmN0aW9uKGtpbmQpIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iLzczZWUyZmViNTFjOWI3ZTI0YTI5ZWI0Y2VlMTlkN2MxNGI5MzMwNjUvbGliL3R5cGVzY3JpcHQuZC50cyNMNjRcbiAgICAgICAgICAgIGxldCBfa2luZFRleHQgPSAnJztcbiAgICAgICAgICAgIHN3aXRjaChraW5kKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTI6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTM6XG4gICAgICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdjaXJjbGUnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDExNTpcbiAgICAgICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ3NxdWFyZSc7XG4gICAgICAgICAgICAgICAgY2FzZSA4MzpcbiAgICAgICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ2V4cG9ydCc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9raW5kVGV4dDtcbiAgICAgICAgfSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb252ZXJ0IHtAbGluayBNeUNsYXNzfSB0byBbTXlDbGFzc10oaHR0cDovL2xvY2FsaG9zdDo4MDgwL2NsYXNzZXMvTXlDbGFzcy5odG1sKVxuICAgICAgICAgKi9cbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigncGFyc2VEZXNjcmlwdGlvbicsIGZ1bmN0aW9uKGRlc2NyaXB0aW9uLCBkZXB0aCkge1xuICAgICAgICAgICAgbGV0IHRhZ1JlZ0V4cCA9IG5ldyBSZWdFeHAoJ1xcXFx7QGxpbmtcXFxccysoKD86LnxcXG4pKz8pXFxcXH0nLCAnaScpLFxuICAgICAgICAgICAgICAgIG1hdGNoZXMsXG4gICAgICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcsXG4gICAgICAgICAgICAgICAgdGFnSW5mbyA9IFtdXG5cbiAgICAgICAgICAgIHZhciBwcm9jZXNzVGhlTGluayA9IGZ1bmN0aW9uKHN0cmluZywgdGFnSW5mbykge1xuICAgICAgICAgICAgICAgIHZhciBsZWFkaW5nID0gZXh0cmFjdExlYWRpbmdUZXh0KHN0cmluZywgdGFnSW5mby5jb21wbGV0ZVRhZyksXG4gICAgICAgICAgICAgICAgICAgIHNwbGl0LFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIG5ld0xpbmssXG4gICAgICAgICAgICAgICAgICAgIHJvb3RQYXRoLFxuICAgICAgICAgICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2U7XG5cbiAgICAgICAgICAgICAgICBzcGxpdCA9IHNwbGl0TGlua1RleHQodGFnSW5mby50ZXh0KTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3BsaXQubGlua1RleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZEluQ29tcG9kb2Moc3BsaXQudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAkZGVwZW5kZW5jaWVzRW5naW5lLmZpbmRJbkNvbXBvZG9jKHRhZ0luZm8udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGVhZGluZy5sZWFkaW5nVGV4dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlID0gJ1snICsgbGVhZGluZy5sZWFkaW5nVGV4dCArICddJyArIHRhZ0luZm8uY29tcGxldGVUYWc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwbGl0LmxpbmtUZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlID0gdGFnSW5mby5jb21wbGV0ZVRhZztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZSA9IHRhZ0luZm8uY29tcGxldGVUYWc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnR5cGUgPT09ICdjbGFzcycpIHJlc3VsdC50eXBlID0gJ2NsYXNzZSc7XG5cbiAgICAgICAgICAgICAgICAgICAgcm9vdFBhdGggPSAnJztcblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGRlcHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFBhdGggPSAnLi8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RQYXRoID0gJy4uLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFBhdGggPSAnLi4vLi4vJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxldCBsYWJlbCA9IHJlc3VsdC5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGVhZGluZy5sZWFkaW5nVGV4dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBsZWFkaW5nLmxlYWRpbmdUZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3BsaXQubGlua1RleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHNwbGl0LmxpbmtUZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3TGluayA9IGA8YSBocmVmPVwiJHtyb290UGF0aH0ke3Jlc3VsdC50eXBlfXMvJHtyZXN1bHQubmFtZX0uaHRtbFwiPiR7bGFiZWx9PC9hPmA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShzdHJpbmd0b1JlcGxhY2UsIG5ld0xpbmspO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXBsYWNlTWF0Y2gocmVwbGFjZXIsIHRhZywgbWF0Y2gsIHRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlZFRhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGVUYWc6IG1hdGNoLFxuICAgICAgICAgICAgICAgICAgICB0YWc6IHRhZyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGFnSW5mby5wdXNoKG1hdGNoZWRUYWcpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VyKGRlc2NyaXB0aW9uLCBtYXRjaGVkVGFnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSB0YWdSZWdFeHAuZXhlYyhkZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcgPSBkZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSByZXBsYWNlTWF0Y2gocHJvY2Vzc1RoZUxpbmssICdsaW5rJywgbWF0Y2hlc1swXSwgbWF0Y2hlc1sxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAobWF0Y2hlcyAmJiBwcmV2aW91c1N0cmluZyAhPT0gZGVzY3JpcHRpb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb247XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3JlbGF0aXZlVVJMJywgZnVuY3Rpb24oY3VycmVudERlcHRoLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoY3VycmVudERlcHRoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAnLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICcuLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICcuLi8uLi8nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZnVuY3Rpb25TaWduYXR1cmUnLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIGxldCBhcmdzID0gW10sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb24uZ2V0SW5zdGFuY2UoKSxcbiAgICAgICAgICAgICAgICBhbmd1bGFyRG9jUHJlZml4ID0gcHJlZml4T2ZmaWNpYWxEb2MoY29uZmlndXJhdGlvbi5tYWluRGF0YS5hbmd1bGFyVmVyc2lvbik7XG4gICAgICAgICAgICBpZiAobWV0aG9kLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhcmdzID0gbWV0aG9kLmFyZ3MubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3Jlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZChhcmcudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5zb3VyY2UgPT09ICdpbnRlcm5hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IF9yZXN1bHQuZGF0YS50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgcGF0aCA9ICdjbGFzc2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIuLi8ke3BhdGh9cy8ke19yZXN1bHQuZGF0YS5uYW1lfS5odG1sXCI+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBgaHR0cHM6Ly8ke2FuZ3VsYXJEb2NQcmVmaXh9YW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJHtfcmVzdWx0LmRhdGEucGF0aH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06IDxhIGhyZWY9XCIke3BhdGh9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcmcudHlwZX08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX06ICR7YXJnLnR5cGV9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWV0aG9kLm5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9KCR7YXJnc30pYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAoJHthcmdzfSlgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignanNkb2MtcmV0dXJucy1jb21tZW50JywgZnVuY3Rpb24oanNkb2NUYWdzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3JldHVybnMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBqc2RvY1RhZ3NbaV0uY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLWNvbXBvbmVudC1leGFtcGxlJywgZnVuY3Rpb24oanNkb2NUYWdzOmpzZG9jVGFnSW50ZXJmYWNlW10sIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBqc2RvY1RhZ3MubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHRhZ3MgPSBbXTtcblxuICAgICAgICAgICAgbGV0IGNsZWFuVGFnID0gZnVuY3Rpb24oY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21tZW50LmNoYXJBdCgwKSA9PT0gJyonKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjb21tZW50LnN1YnN0cmluZygxLCBjb21tZW50Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21tZW50LmNoYXJBdCgwKSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjb21tZW50LnN1YnN0cmluZygxLCBjb21tZW50Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBjb21tZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdHlwZSA9ICdodG1sJztcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaGFzaC50eXBlKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IG9wdGlvbnMuaGFzaC50eXBlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBodG1sRW50aXRpZXMoc3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAnZXhhbXBsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7fSBhcyBqc2RvY1RhZ0ludGVyZmFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0gYDxwcmUgY2xhc3M9XCJsaW5lLW51bWJlcnNcIj48Y29kZSBjbGFzcz1cImxhbmd1YWdlLSR7dHlwZX1cIj5gICsgaHRtbEVudGl0aWVzKGNsZWFuVGFnKGpzZG9jVGFnc1tpXS5jb21tZW50KSkgKyBgPC9jb2RlPjwvcHJlPmA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignanNkb2MtZXhhbXBsZScsIGZ1bmN0aW9uKGpzZG9jVGFnczpqc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0YWdzID0gW107XG5cbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAnZXhhbXBsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSB7fSBhcyBqc2RvY1RhZ0ludGVyZmFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQucmVwbGFjZSgvPGNhcHRpb24+L2csICc8Yj48aT4nKS5yZXBsYWNlKC9cXC9jYXB0aW9uPi9nLCAnL2I+PC9pPicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFncy5wdXNoKHRhZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2pzZG9jLXBhcmFtcycsIGZ1bmN0aW9uKGpzZG9jVGFnczpqc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0ganNkb2NUYWdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0YWdzID0gW107XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3BhcmFtJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhZyA9IHt9IGFzIGpzZG9jVGFnSW50ZXJmYWNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbiAmJiBqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24udHlwZS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLnR5cGUgPSBqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24udHlwZS5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5uYW1lID0ganNkb2NUYWdzW2ldLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MucHVzaCh0YWcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbGlua1R5cGUnLCBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgX3Jlc3VsdCA9ICRkZXBlbmRlbmNpZXNFbmdpbmUuZmluZChuYW1lKSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpLFxuICAgICAgICAgICAgICAgIGFuZ3VsYXJEb2NQcmVmaXggPSBwcmVmaXhPZmZpY2lhbERvYyhjb25maWd1cmF0aW9uLm1haW5EYXRhLmFuZ3VsYXJWZXJzaW9uKTtcbiAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlID0ge1xuICAgICAgICAgICAgICAgICAgICByYXc6IG5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9yZXN1bHQuc291cmNlID09PSAnaW50ZXJuYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgX3Jlc3VsdC5kYXRhLnR5cGUgPSAnY2xhc3NlJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSAnLi4vJyArIF9yZXN1bHQuZGF0YS50eXBlICsgJ3MvJyArIF9yZXN1bHQuZGF0YS5uYW1lICsgJy5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLnRhcmdldCA9ICdfc2VsZic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLmhyZWYgPSBgaHR0cHM6Ly8ke2FuZ3VsYXJEb2NQcmVmaXh9YW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJHtfcmVzdWx0LmRhdGEucGF0aH1gO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUudGFyZ2V0ID0gJ19ibGFuayc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpbmRleGFibGVTaWduYXR1cmUnLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBtZXRob2QuYXJncy5tYXAoYXJnID0+IGAke2FyZy5uYW1lfTogJHthcmcudHlwZX1gKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke21ldGhvZC5uYW1lfVske2FyZ3N9XWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgWyR7YXJnc31dYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ29iamVjdCcsIGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgIHRleHQgPSBKU09OLnN0cmluZ2lmeSh0ZXh0KTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL3tcIi8sICd7PGJyPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1wiJyk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8sXCIvLCAnLDxicj4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIicpO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvfSQvLCAnPGJyPn0nKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBIYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpc05vdFRvZ2dsZScsIGZ1bmN0aW9uKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGxldCBjb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpLFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudG9nZ2xlTWVudUl0ZW1zLmluZGV4T2YodHlwZSk7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5tYWluRGF0YS50b2dnbGVNZW51SXRlbXMuaW5kZXhPZignYWxsJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdDogaW5pdFxuICAgIH1cbn0pKClcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJztcbi8vaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICdoYW5kbGViYXJzLWhlbHBlcnMnO1xuaW1wb3J0IHsgSHRtbEVuZ2luZUhlbHBlcnMgfSBmcm9tICcuL2h0bWwuZW5naW5lLmhlbHBlcnMnO1xuXG5leHBvcnQgY2xhc3MgSHRtbEVuZ2luZSB7XG4gICAgY2FjaGU6IE9iamVjdCA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBIdG1sRW5naW5lSGVscGVycy5pbml0KCk7XG4gICAgfVxuICAgIGluaXQoKSB7XG4gICAgICAgIGxldCBwYXJ0aWFscyA9IFtcbiAgICAgICAgICAgICdtZW51JyxcbiAgICAgICAgICAgICdvdmVydmlldycsXG4gICAgICAgICAgICAncmVhZG1lJyxcbiAgICAgICAgICAgICdtb2R1bGVzJyxcbiAgICAgICAgICAgICdtb2R1bGUnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnLFxuICAgICAgICAgICAgJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAnY29tcG9uZW50LWRldGFpbCcsXG4gICAgICAgICAgICAnZGlyZWN0aXZlcycsXG4gICAgICAgICAgICAnZGlyZWN0aXZlJyxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAncGlwZXMnLFxuICAgICAgICAgICAgJ3BpcGUnLFxuICAgICAgICAgICAgJ2NsYXNzZXMnLFxuICAgICAgICAgICAgJ2NsYXNzJyxcblx0ICAgICAgICAnaW50ZXJmYWNlJyxcbiAgICAgICAgICAgICdyb3V0ZXMnLFxuICAgICAgICAgICAgJ3NlYXJjaC1yZXN1bHRzJyxcbiAgICAgICAgICAgICdzZWFyY2gtaW5wdXQnLFxuICAgICAgICAgICAgJ2xpbmstdHlwZScsXG4gICAgICAgICAgICAnYmxvY2stbWV0aG9kJyxcbiAgICAgICAgICAgICdibG9jay1lbnVtJyxcbiAgICAgICAgICAgICdibG9jay1wcm9wZXJ0eScsXG4gICAgICAgICAgICAnYmxvY2staW5kZXgnLFxuICAgICAgICAgICAgJ2Jsb2NrLWNvbnN0cnVjdG9yJyxcbiAgICAgICAgICAgICdjb3ZlcmFnZS1yZXBvcnQnLFxuICAgICAgICAgICAgJ21pc2NlbGxhbmVvdXMnLFxuICAgICAgICAgICAgJ2FkZGl0aW9uYWwtcGFnZSdcbiAgICAgICAgXSxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgbGVuID0gcGFydGlhbHMubGVuZ3RoLFxuICAgICAgICAgICAgbG9vcCA9IChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhcnRpYWxzLycgKyBwYXJ0aWFsc1tpXSArICcuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgeyByZWplY3QoKTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwocGFydGlhbHNbaV0sIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhZ2UuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBpbmRleCBnZW5lcmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlWydwYWdlJ10gPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbG9vcChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVuZGVyKG1haW5EYXRhOmFueSwgcGFnZTphbnkpIHtcbiAgICAgICAgdmFyIG8gPSBtYWluRGF0YSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICAoPGFueT5PYmplY3QpLmFzc2lnbihvLCBwYWdlKTtcbiAgICAgICAgbGV0IHRlbXBsYXRlOmFueSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0aGF0LmNhY2hlWydwYWdlJ10pLFxuICAgICAgICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IG9cbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBnZW5lcmF0ZUNvdmVyYWdlQmFkZ2Uob3V0cHV0Rm9sZGVyLCBjb3ZlcmFnZURhdGEpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvY292ZXJhZ2UtYmFkZ2UuaGJzJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIGNvdmVyYWdlIGJhZGdlIGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlOmFueSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY292ZXJhZ2VEYXRhXG4gICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIG91dHB1dEZvbGRlciA9IG91dHB1dEZvbGRlci5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKTtcbiAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBvdXRwdXRGb2xkZXIgKyBwYXRoLnNlcCArICcvaW1hZ2VzL2NvdmVyYWdlLWJhZGdlLnN2ZycpLCByZXN1bHQsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgaWYoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBjb3ZlcmFnZSBiYWRnZSBmaWxlIGdlbmVyYXRpb24gJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSBuZXcgbWFya2VkLlJlbmRlcmVyKCk7XG4gICAgICAgIHJlbmRlcmVyLmNvZGUgPSAoY29kZSwgbGFuZ3VhZ2UpID0+IHtcbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRlZCA9IGNvZGU7XG4gICAgICAgICAgICBpZiAoIWxhbmd1YWdlKSB7XG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2UgPSAnbm9uZSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGhpZ2hsaWdodGVkID0gdGhpcy5lc2NhcGUoY29kZSk7XG4gICAgICAgICAgICByZXR1cm4gYDxwcmUgY2xhc3M9XCJsaW5lLW51bWJlcnNcIj48Y29kZSBjbGFzcz1cImxhbmd1YWdlLSR7bGFuZ3VhZ2V9XCI+JHtoaWdobGlnaHRlZH08L2NvZGU+PC9wcmU+YDtcbiAgICAgICAgfTtcblxuICAgICAgICByZW5kZXJlci50YWJsZSA9IChoZWFkZXIsIGJvZHkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAnPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgY29tcG9kb2MtdGFibGVcIj5cXG4nXG4gICAgICAgICAgICAgICAgKyAnPHRoZWFkPlxcbidcbiAgICAgICAgICAgICAgICArIGhlYWRlclxuICAgICAgICAgICAgICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICAgICAgICAgICAgICsgJzx0Ym9keT5cXG4nXG4gICAgICAgICAgICAgICAgKyBib2R5XG4gICAgICAgICAgICAgICAgKyAnPC90Ym9keT5cXG4nXG4gICAgICAgICAgICAgICAgKyAnPC90YWJsZT5cXG4nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVuZGVyZXIuaW1hZ2UgPSBmdW5jdGlvbiAoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICAgICAgICAgIHZhciBvdXQgPSAnPGltZyBzcmM9XCInICsgaHJlZiArICdcIiBhbHQ9XCInICsgdGV4dCArICdcIiBjbGFzcz1cImltZy1yZXNwb25zaXZlXCInO1xuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9O1xuXG4gICAgICAgIG1hcmtlZC5zZXRPcHRpb25zKHtcbiAgICAgICAgICAgIHJlbmRlcmVyOiByZW5kZXJlcixcbiAgICAgICAgICAgIGJyZWFrczogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldChmaWxlcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZXBhdGgpLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nICcgKyBmaWxlcGF0aCArICcgcmVhZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWFya2VkKGRhdGEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldFJlYWRtZUZpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArICcvUkVBRE1FLm1kJyksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgUkVBRE1FLm1kIGZpbGUgcmVhZGluZycpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWFya2VkKGRhdGEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNvbXBvbmVudEhhc1JlYWRtZUZpbGUoZmlsZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGUpLFxuICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArICdSRUFETUUubWQnLFxuICAgICAgICAgICAgcmVhZG1lQWx0ZXJuYXRpdmVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgcGF0aC5iYXNlbmFtZShmaWxlLCAnLnRzJykgKyAnLm1kJztcbiAgICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMocmVhZG1lRmlsZSkgfHwgZnMuZXhpc3RzU3luYyhyZWFkbWVBbHRlcm5hdGl2ZUZpbGUpO1xuICAgIH1cbiAgICBjb21wb25lbnRSZWFkbWVGaWxlKGZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGxldCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGUpLFxuICAgICAgICAgICAgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArICdSRUFETUUubWQnLFxuICAgICAgICAgICAgcmVhZG1lQWx0ZXJuYXRpdmVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgcGF0aC5iYXNlbmFtZShmaWxlLCAnLnRzJykgKyAnLm1kJyxcbiAgICAgICAgICAgIGZpbmFsUGF0aCA9ICcnO1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhyZWFkbWVGaWxlKSkge1xuICAgICAgICAgICAgZmluYWxQYXRoID0gcmVhZG1lRmlsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbmFsUGF0aCA9IHJlYWRtZUFsdGVybmF0aXZlRmlsZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmluYWxQYXRoO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXNjYXBlKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGh0bWxcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL0AvZywgJyYjNjQ7Jyk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xuXG5leHBvcnQgY2xhc3MgRmlsZUVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB9XG4gICAgZ2V0KGZpbGVwYXRoOnN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBmaWxlcGF0aCksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nICcgKyBmaWxlcGF0aCArICcgcmVhZCcpO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcblxuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZGVwZW5kZW5jaWVzLmVuZ2luZSc7XG5cbmltcG9ydCBpc0dsb2JhbCBmcm9tICcuLi8uLi91dGlscy9nbG9iYWwucGF0aCc7XG5cbmxldCBuZ2RDciA9IHJlcXVpcmUoJ0Bjb21wb2RvYy9uZ2QtY29yZScpO1xubGV0IG5nZFQgPSByZXF1aXJlKCdAY29tcG9kb2MvbmdkLXRyYW5zZm9ybWVyJyk7XG5cbmV4cG9ydCBjbGFzcyBOZ2RFbmdpbmUge1xuICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICByZW5kZXJHcmFwaChmaWxlcGF0aDogc3RyaW5nLCBvdXRwdXRwYXRoOiBzdHJpbmcsIHR5cGU6IHN0cmluZywgbmFtZT86IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBuZ2RDci5sb2dnZXIuc2lsZW50ID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgZW5naW5lID0gbmV3IG5nZFQuRG90RW5naW5lKHtcbiAgICAgICAgICAgICAgICBvdXRwdXQ6IG91dHB1dHBhdGgsXG4gICAgICAgICAgICAgICAgZGlzcGxheUxlZ2VuZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvdXRwdXRGb3JtYXRzOiAnc3ZnJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2YnKSB7XG4gICAgICAgICAgICAgICAgZW5naW5lXG4gICAgICAgICAgICAgICAgICAgIC5nZW5lcmF0ZUdyYXBoKFskZGVwZW5kZW5jaWVzRW5naW5lLmdldFJhd01vZHVsZShuYW1lKV0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZpbGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW5naW5lXG4gICAgICAgICAgICAgICAgICAgIC5nZW5lcmF0ZUdyYXBoKCRkZXBlbmRlbmNpZXNFbmdpbmUucmF3TW9kdWxlc0Zvck92ZXJ2aWV3KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmaWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZWFkR3JhcGgoZmlsZXBhdGg6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShmaWxlcGF0aCksICd1dGY4JywgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIGdyYXBoIHJlYWQgJyArIG5hbWUpO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9jb25maWd1cmF0aW9uJztcblxuY29uc3QgbHVucjogYW55ID0gcmVxdWlyZSgnbHVucicpLFxuICAgICAgY2hlZXJpbzogYW55ID0gcmVxdWlyZSgnY2hlZXJpbycpLFxuICAgICAgRW50aXRpZXM6YW55ID0gcmVxdWlyZSgnaHRtbC1lbnRpdGllcycpLkFsbEh0bWxFbnRpdGllcyxcbiAgICAgICRjb25maWd1cmF0aW9uID0gQ29uZmlndXJhdGlvbi5nZXRJbnN0YW5jZSgpLFxuICAgICAgSHRtbCA9IG5ldyBFbnRpdGllcygpO1xuXG5leHBvcnQgY2xhc3MgU2VhcmNoRW5naW5lIHtcbiAgICBzZWFyY2hJbmRleDogYW55O1xuICAgIGRvY3VtZW50c1N0b3JlOiBPYmplY3QgPSB7fTtcbiAgICBpbmRleFNpemU6IG51bWJlcjtcbiAgICBjb25zdHJ1Y3RvcigpIHt9XG4gICAgcHJpdmF0ZSBnZXRTZWFyY2hJbmRleCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNlYXJjaEluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaEluZGV4ID0gbHVucihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWYoJ3VybCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmllbGQoJ3RpdGxlJywgeyBib29zdDogMTAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZCgnYm9keScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoSW5kZXg7XG4gICAgfVxuICAgIGluZGV4UGFnZShwYWdlKSB7XG4gICAgICAgIHZhciB0ZXh0LFxuICAgICAgICAgICAgJCA9IGNoZWVyaW8ubG9hZChwYWdlLnJhd0RhdGEpO1xuXG4gICAgICAgIHRleHQgPSAkKCcuY29udGVudCcpLmh0bWwoKTtcbiAgICAgICAgdGV4dCA9IEh0bWwuZGVjb2RlKHRleHQpO1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oPChbXj5dKyk+KS9pZywgJycpO1xuXG4gICAgICAgIHBhZ2UudXJsID0gcGFnZS51cmwucmVwbGFjZSgkY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQsICcnKTtcblxuICAgICAgICB2YXIgZG9jID0ge1xuICAgICAgICAgICAgdXJsOiBwYWdlLnVybCxcbiAgICAgICAgICAgIHRpdGxlOiBwYWdlLmluZm9zLmNvbnRleHQgKyAnIC0gJyArIHBhZ2UuaW5mb3MubmFtZSxcbiAgICAgICAgICAgIGJvZHk6IHRleHRcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRvY3VtZW50c1N0b3JlW2RvYy51cmxdID0gZG9jO1xuXG4gICAgICAgIHRoaXMuZ2V0U2VhcmNoSW5kZXgoKS5hZGQoZG9jKTtcbiAgICB9XG4gICAgZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24ob3V0cHV0Rm9sZGVyKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhcnRpYWxzL3NlYXJjaC1pbmRleC5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgc2VhcmNoIGluZGV4IGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlOmFueSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0U2VhcmNoSW5kZXgoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZTogSlNPTi5zdHJpbmdpZnkodGhpcy5kb2N1bWVudHNTdG9yZSlcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgb3V0cHV0Rm9sZGVyID0gb3V0cHV0Rm9sZGVyLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpO1xuICAgICAgICAgICAgICAgICAgIGZzLm91dHB1dEZpbGUocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJy9qcy9zZWFyY2gvc2VhcmNoX2luZGV4LmpzJyksIHJlc3VsdCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIHNlYXJjaCBpbmRleCBmaWxlIGdlbmVyYXRpb24gJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xuICAgICAgIH0pO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xvZ2dlcic7XG5cbmNvbnN0IGNhcnJpYWdlUmV0dXJuTGluZUZlZWQgPSAnXFxyXFxuJztcbmNvbnN0IGxpbmVGZWVkID0gJ1xcbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbk5hbWVXaXRob3V0U3BhY2VBbmRUb0xvd2VyQ2FzZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvIC9nLCAnLScpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0SW5kZW50KHN0ciwgY291bnQsIGluZGVudD8pOiBzdHJpbmcge1xuICAgIGxldCBzdHJpcEluZGVudCA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKC9eWyBcXHRdKig/PVxcUykvZ20pO1xuXG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiB1c2Ugc3ByZWFkIG9wZXJhdG9yIHdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgNlxuICAgICAgICBjb25zdCBpbmRlbnQgPSBNYXRoLm1pbi5hcHBseShNYXRoLCBtYXRjaC5tYXAoeCA9PiB4Lmxlbmd0aCkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgXlsgXFxcXHRdeyR7aW5kZW50fX1gLCAnZ20nKTtcblxuICAgICAgICByZXR1cm4gaW5kZW50ID4gMCA/IHN0ci5yZXBsYWNlKHJlLCAnJykgOiBzdHI7XG4gICAgfSxcbiAgICAgICAgcmVwZWF0aW5nID0gZnVuY3Rpb24obiwgc3RyKSB7XG4gICAgICAgIHN0ciA9IHN0ciA9PT0gdW5kZWZpbmVkID8gJyAnIDogc3RyO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobiA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYGNvdW50XFxgIHRvIGJlIGEgcG9zaXRpdmUgZmluaXRlIG51bWJlciwgZ290IFxcYCR7bn1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZXQgPSAnJztcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBpZiAobiAmIDEpIHtcbiAgICAgICAgICAgICAgICByZXQgKz0gc3RyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdHIgKz0gc3RyO1xuICAgICAgICB9IHdoaWxlICgobiA+Pj0gMSkpO1xuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcbiAgICBpbmRlbnRTdHJpbmcgPSBmdW5jdGlvbihzdHIsIGNvdW50LCBpbmRlbnQpIHtcbiAgICAgICAgaW5kZW50ID0gaW5kZW50ID09PSB1bmRlZmluZWQgPyAnICcgOiBpbmRlbnQ7XG4gICAgICAgIGNvdW50ID0gY291bnQgPT09IHVuZGVmaW5lZCA/IDEgOiBjb3VudDtcblxuICAgICAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYGlucHV0XFxgIHRvIGJlIGEgXFxgc3RyaW5nXFxgLCBnb3QgXFxgJHt0eXBlb2Ygc3RyfVxcYGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjb3VudCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYGNvdW50XFxgIHRvIGJlIGEgXFxgbnVtYmVyXFxgLCBnb3QgXFxgJHt0eXBlb2YgY291bnR9XFxgYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGluZGVudCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYGluZGVudFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIGluZGVudH1cXGBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuXG4gICAgICAgIGluZGVudCA9IGNvdW50ID4gMSA/IHJlcGVhdGluZyhjb3VudCwgaW5kZW50KSA6IGluZGVudDtcblxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL14oPyFcXHMqJCkvbWcsIGluZGVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGluZGVudFN0cmluZyhzdHJpcEluZGVudChzdHIpLCBjb3VudCB8fCAwLCBpbmRlbnQpO1xufVxuXG4vLyBDcmVhdGUgYSBjb21waWxlckhvc3Qgb2JqZWN0IHRvIGFsbG93IHRoZSBjb21waWxlciB0byByZWFkIGFuZCB3cml0ZSBmaWxlc1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVySG9zdCh0cmFuc3BpbGVPcHRpb25zOiBhbnkpOiB0cy5Db21waWxlckhvc3Qge1xuXG4gICAgY29uc3QgaW5wdXRGaWxlTmFtZSA9IHRyYW5zcGlsZU9wdGlvbnMuZmlsZU5hbWUgfHwgKHRyYW5zcGlsZU9wdGlvbnMuanN4ID8gJ21vZHVsZS50c3gnIDogJ21vZHVsZS50cycpO1xuXG4gICAgY29uc3QgY29tcGlsZXJIb3N0OiB0cy5Db21waWxlckhvc3QgPSB7XG4gICAgICAgIGdldFNvdXJjZUZpbGU6IChmaWxlTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGZpbGVOYW1lLmxhc3RJbmRleE9mKCcudHMnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgPT09ICdsaWIuZC50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lLnN1YnN0cigtNSkgPT09ICcuZC50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocGF0aC5pc0Fic29sdXRlKGZpbGVOYW1lKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBwYXRoLmpvaW4odHJhbnNwaWxlT3B0aW9ucy50c2NvbmZpZ0RpcmVjdG9yeSwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGxpYlNvdXJjZSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbGliU291cmNlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVOYW1lKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhlLCBmaWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoZmlsZU5hbWUsIGxpYlNvdXJjZSwgdHJhbnNwaWxlT3B0aW9ucy50YXJnZXQsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRlRmlsZTogKG5hbWUsIHRleHQpID0+IHt9LFxuICAgICAgICBnZXREZWZhdWx0TGliRmlsZU5hbWU6ICgpID0+ICdsaWIuZC50cycsXG4gICAgICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXM6ICgpID0+IGZhbHNlLFxuICAgICAgICBnZXRDYW5vbmljYWxGaWxlTmFtZTogZmlsZU5hbWUgPT4gZmlsZU5hbWUsXG4gICAgICAgIGdldEN1cnJlbnREaXJlY3Rvcnk6ICgpID0+ICcnLFxuICAgICAgICBnZXROZXdMaW5lOiAoKSA9PiAnXFxuJyxcbiAgICAgICAgZmlsZUV4aXN0czogKGZpbGVOYW1lKTogYm9vbGVhbiA9PiBmaWxlTmFtZSA9PT0gaW5wdXRGaWxlTmFtZSxcbiAgICAgICAgcmVhZEZpbGU6ICgpID0+ICcnLFxuICAgICAgICBkaXJlY3RvcnlFeGlzdHM6ICgpID0+IHRydWUsXG4gICAgICAgIGdldERpcmVjdG9yaWVzOiAoKSA9PiBbXVxuICAgIH07XG4gICAgcmV0dXJuIGNvbXBpbGVySG9zdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRNYWluU291cmNlRm9sZGVyKGZpbGVzOiBzdHJpbmdbXSkge1xuICAgIGxldCBtYWluRm9sZGVyID0gJycsXG4gICAgICAgIG1haW5Gb2xkZXJDb3VudCA9IDAsXG4gICAgICAgIHJhd0ZvbGRlcnMgPSBmaWxlcy5tYXAoKGZpbGVwYXRoKSA9PiB7XG4gICAgICAgICAgICB2YXIgc2hvcnRQYXRoID0gZmlsZXBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAsICcnKTtcbiAgICAgICAgICAgIHJldHVybiBwYXRoLmRpcm5hbWUoc2hvcnRQYXRoKTtcbiAgICAgICAgfSksXG4gICAgICAgIGZvbGRlcnMgPSB7fSxcbiAgICAgICAgaSA9IDA7XG4gICAgcmF3Rm9sZGVycyA9IF8udW5pcShyYXdGb2xkZXJzKTtcbiAgICBsZXQgbGVuID0gcmF3Rm9sZGVycy5sZW5ndGg7XG4gICAgZm9yKGk7IGk8bGVuOyBpKyspe1xuICAgICAgICBsZXQgc2VwID0gcmF3Rm9sZGVyc1tpXS5zcGxpdChwYXRoLnNlcCk7XG4gICAgICAgIHNlcC5tYXAoKGZvbGRlcikgPT4ge1xuICAgICAgICAgICAgaWYgKGZvbGRlcnNbZm9sZGVyXSkge1xuICAgICAgICAgICAgICAgIGZvbGRlcnNbZm9sZGVyXSArPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb2xkZXJzW2ZvbGRlcl0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbiAgICBmb3IgKGxldCBmIGluIGZvbGRlcnMpIHtcbiAgICAgICAgaWYoZm9sZGVyc1tmXSA+IG1haW5Gb2xkZXJDb3VudCkge1xuICAgICAgICAgICAgbWFpbkZvbGRlckNvdW50ID0gZm9sZGVyc1tmXTtcbiAgICAgICAgICAgIG1haW5Gb2xkZXIgPSBmO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYWluRm9sZGVyO1xufVxuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyJztcblxuZXhwb3J0IGxldCBSb3V0ZXJQYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcm91dGVzOiBhbnlbXSA9IFtdLFxuICAgICAgICBpbmNvbXBsZXRlUm91dGVzID0gW10sXG4gICAgICAgIG1vZHVsZXMgPSBbXSxcbiAgICAgICAgbW9kdWxlc1RyZWUsXG4gICAgICAgIHJvb3RNb2R1bGUsXG4gICAgICAgIGNsZWFuTW9kdWxlc1RyZWUsXG4gICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gW10sXG5cbiAgICAgICAgX2FkZFJvdXRlID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgIHJvdXRlcy5wdXNoKHJvdXRlKTtcbiAgICAgICAgICAgIHJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgocm91dGVzLCBfLmlzRXF1YWwpLCBbJ25hbWUnXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FkZEluY29tcGxldGVSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICAgICAgICBpbmNvbXBsZXRlUm91dGVzLnB1c2gocm91dGUpO1xuICAgICAgICAgICAgaW5jb21wbGV0ZVJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgoaW5jb21wbGV0ZVJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRNb2R1bGVXaXRoUm91dGVzID0gZnVuY3Rpb24obW9kdWxlTmFtZSwgbW9kdWxlSW1wb3J0cykge1xuICAgICAgICAgICAgbW9kdWxlc1dpdGhSb3V0ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogbW9kdWxlTmFtZSxcbiAgICAgICAgICAgICAgICBpbXBvcnRzTm9kZTogbW9kdWxlSW1wb3J0c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgobW9kdWxlc1dpdGhSb3V0ZXMsIF8uaXNFcXVhbCksIFsnbmFtZSddKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfYWRkTW9kdWxlID0gZnVuY3Rpb24obW9kdWxlTmFtZTogc3RyaW5nLCBtb2R1bGVJbXBvcnRzKSB7XG4gICAgICAgICAgICBtb2R1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1vZHVsZU5hbWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgobW9kdWxlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9jbGVhblJhd1JvdXRlUGFyc2VkID0gZnVuY3Rpb24ocm91dGU6IHN0cmluZykge1xuICAgICAgICAgICAgbGV0IHJvdXRlc1dpdGhvdXRTcGFjZXMgPSByb3V0ZS5yZXBsYWNlKC8gL2dtLCAnJyksXG4gICAgICAgICAgICAgICAgdGVzdFRyYWlsaW5nQ29tbWEgPSByb3V0ZXNXaXRob3V0U3BhY2VzLmluZGV4T2YoJ30sXScpO1xuICAgICAgICAgICAgaWYgKHRlc3RUcmFpbGluZ0NvbW1hICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgcm91dGVzV2l0aG91dFNwYWNlcyA9IHJvdXRlc1dpdGhvdXRTcGFjZXMucmVwbGFjZSgnfSxdJywgJ31dJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShyb3V0ZXNXaXRob3V0U3BhY2VzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY2xlYW5SYXdSb3V0ZSA9IGZ1bmN0aW9uKHJvdXRlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCByb3V0ZXNXaXRob3V0U3BhY2VzID0gcm91dGUucmVwbGFjZSgvIC9nbSwgJycpLFxuICAgICAgICAgICAgICAgIHRlc3RUcmFpbGluZ0NvbW1hID0gcm91dGVzV2l0aG91dFNwYWNlcy5pbmRleE9mKCd9LF0nKTtcbiAgICAgICAgICAgIGlmICh0ZXN0VHJhaWxpbmdDb21tYSAhPSAtMSkge1xuICAgICAgICAgICAgICAgIHJvdXRlc1dpdGhvdXRTcGFjZXMgPSByb3V0ZXNXaXRob3V0U3BhY2VzLnJlcGxhY2UoJ30sXScsICd9XScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJvdXRlc1dpdGhvdXRTcGFjZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3NldFJvb3RNb2R1bGUgPSBmdW5jdGlvbihtb2R1bGU6IHN0cmluZykge1xuICAgICAgICAgICAgcm9vdE1vZHVsZSA9IG1vZHVsZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzID0gZnVuY3Rpb24oaW1wb3J0cykge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGltcG9ydHMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1wb3J0c1tpXS5uYW1lLmluZGV4T2YoJ1JvdXRlck1vZHVsZS5mb3JDaGlsZCcpICE9PSAtMSB8fFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRzW2ldLm5hbWUuaW5kZXhPZignUm91dGVyTW9kdWxlLmZvclJvb3QnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9maXhJbmNvbXBsZXRlUm91dGVzID0gZnVuY3Rpb24obWlzY2VsbGFuZW91c1ZhcmlhYmxlcykge1xuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnZml4SW5jb21wbGV0ZVJvdXRlcycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocm91dGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhtaXNjZWxsYW5lb3VzVmFyaWFibGVzKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IGluY29tcGxldGVSb3V0ZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIG1hdGNoaW5nVmFyaWFibGVzID0gW107XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBpbmNvbXBsZXRlUm91dGUsIHNjYW4gaWYgb25lIG1pc2MgdmFyaWFibGUgaXMgaW4gY29kZVxuICAgICAgICAgICAgLy8gaWYgb2ssIHRyeSByZWNyZWF0aW5nIGNvbXBsZXRlIHJvdXRlXG4gICAgICAgICAgICBmb3IgKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaiA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGxlbmcgPSBtaXNjZWxsYW5lb3VzVmFyaWFibGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGo7IGo8bGVuZzsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmNvbXBsZXRlUm91dGVzW2ldLmRhdGEuaW5kZXhPZihtaXNjZWxsYW5lb3VzVmFyaWFibGVzW2pdLm5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZvdW5kIG9uZSBtaXNjIHZhciBpbnNpZGUgaW5jb21wbGV0ZVJvdXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtaXNjZWxsYW5lb3VzVmFyaWFibGVzW2pdLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hpbmdWYXJpYWJsZXMucHVzaChtaXNjZWxsYW5lb3VzVmFyaWFibGVzW2pdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL0NsZWFuIGluY29tcGxldGVSb3V0ZVxuICAgICAgICAgICAgICAgIGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YSA9IGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YS5yZXBsYWNlKCdbJywgJycpO1xuICAgICAgICAgICAgICAgIGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YSA9IGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YS5yZXBsYWNlKCddJywgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLypjb25zb2xlLmxvZyhpbmNvbXBsZXRlUm91dGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1hdGNoaW5nVmFyaWFibGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2xpbmtNb2R1bGVzQW5kUm91dGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvKmNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsaW5rTW9kdWxlc0FuZFJvdXRlczogJyk7XG4gICAgICAgICAgICAvL3NjYW4gZWFjaCBtb2R1bGUgaW1wb3J0cyBBU1QgZm9yIGVhY2ggcm91dGVzLCBhbmQgbGluayByb3V0ZXMgd2l0aCBtb2R1bGVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdsaW5rTW9kdWxlc0FuZFJvdXRlcyByb3V0ZXM6ICcsIHJvdXRlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7Ki9cbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBtb2R1bGVzV2l0aFJvdXRlcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzV2l0aFJvdXRlc1tpXS5pbXBvcnRzTm9kZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gobm9kZS5pbml0aWFsaXplci5lbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbmQgZWxlbWVudCB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50LmFyZ3VtZW50cywgZnVuY3Rpb24oYXJndW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gocm91dGVzLCBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhcmd1bWVudC50ZXh0ICYmIHJvdXRlLm5hbWUgPT09IGFyZ3VtZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLm1vZHVsZSA9IG1vZHVsZXNXaXRoUm91dGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZW5kIGxpbmtNb2R1bGVzQW5kUm91dGVzOiAnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHV0aWwuaW5zcGVjdChyb3V0ZXMsIHsgZGVwdGg6IDEwIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZSA9IGZ1bmN0aW9uKG1vZHVsZU5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfLmZpbmQocm91dGVzLCB7J21vZHVsZSc6IG1vZHVsZU5hbWV9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBmb3VuZExhenlNb2R1bGVXaXRoUGF0aCA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgIC8vcGF0aCBpcyBsaWtlIGFwcC9jdXN0b21lcnMvY3VzdG9tZXJzLm1vZHVsZSNDdXN0b21lcnNNb2R1bGVcbiAgICAgICAgICAgIGxldCBzcGxpdCA9IHBhdGguc3BsaXQoJyMnKSxcbiAgICAgICAgICAgICAgICBsYXp5TW9kdWxlUGF0aCA9IHNwbGl0WzBdLFxuICAgICAgICAgICAgICAgIGxhenlNb2R1bGVOYW1lID0gc3BsaXRbMV07XG4gICAgICAgICAgICByZXR1cm4gbGF6eU1vZHVsZU5hbWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NvbnN0cnVjdFJvdXRlc1RyZWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnY29uc3RydWN0Um91dGVzVHJlZSBtb2R1bGVzOiAnLCBtb2R1bGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb25zdHJ1Y3RSb3V0ZXNUcmVlIG1vZHVsZXNXaXRoUm91dGVzOiAnLCBtb2R1bGVzV2l0aFJvdXRlcyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY29uc3RydWN0Um91dGVzVHJlZSBtb2R1bGVzVHJlZTogJywgdXRpbC5pbnNwZWN0KG1vZHVsZXNUcmVlLCB7IGRlcHRoOiAxMCB9KSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7Ki9cblxuICAgICAgICAgICAgLy8gcm91dGVzW10gY29udGFpbnMgcm91dGVzIHdpdGggbW9kdWxlIGxpbmtcbiAgICAgICAgICAgIC8vIG1vZHVsZXNUcmVlIGNvbnRhaW5zIG1vZHVsZXMgdHJlZVxuICAgICAgICAgICAgLy8gbWFrZSBhIGZpbmFsIHJvdXRlcyB0cmVlIHdpdGggdGhhdFxuICAgICAgICAgICAgY2xlYW5Nb2R1bGVzVHJlZSA9IF8uY2xvbmVEZWVwKG1vZHVsZXNUcmVlKTtcblxuICAgICAgICAgICAgbGV0IG1vZHVsZXNDbGVhbmVyID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJbaV0uaW1wb3J0c05vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXJyW2ldLmltcG9ydHNOb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFycltpXS5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXJyW2ldLnBhcmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFycltpXS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXNDbGVhbmVyKGFycltpXS5jaGlsZHJlbilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1vZHVsZXNDbGVhbmVyKGNsZWFuTW9kdWxlc1RyZWUpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgIGNsZWFuTW9kdWxlc1RyZWUgbGlnaHQ6ICcsIHV0aWwuaW5zcGVjdChjbGVhbk1vZHVsZXNUcmVlLCB7IGRlcHRoOiAxMCB9KSk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhyb3V0ZXMpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJyk7XG5cbiAgICAgICAgICAgIHZhciByb3V0ZXNUcmVlID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6ICc8cm9vdD4nLFxuICAgICAgICAgICAgICAgIGtpbmQ6ICdtb2R1bGUnLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogcm9vdE1vZHVsZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxldCBsb29wTW9kdWxlc1BhcnNlciA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbiAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy9JZiBtb2R1bGUgaGFzIGNoaWxkIG1vZHVsZXNcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnICAgSWYgbW9kdWxlIGhhcyBjaGlsZCBtb2R1bGVzJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobm9kZS5jaGlsZHJlbltpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZSAmJiByb3V0ZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUuY2hpbGRyZW4gPSBKU09OLnBhcnNlKHJvdXRlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByb3V0ZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmtpbmQgPSAnbW9kdWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXNUcmVlLmNoaWxkcmVuLnB1c2gocm91dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5baV0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wTW9kdWxlc1BhcnNlcihub2RlLmNoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZWxzZSByb3V0ZXMgYXJlIGRpcmVjdGx5IGluc2lkZSB0aGUgbW9kdWxlXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAgIGVsc2Ugcm91dGVzIGFyZSBkaXJlY3RseSBpbnNpZGUgdGhlIHJvb3QgbW9kdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYXdSb3V0ZXMgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobm9kZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhd1JvdXRlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdXRlcyA9IEpTT04ucGFyc2UocmF3Um91dGVzLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuID0gcm91dGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSByb3V0ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXNbaV0uY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXNUcmVlLmNoaWxkcmVuLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogcm91dGVzW2ldLmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiByb3V0ZXNbaV0ucGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAgcm9vdE1vZHVsZTogJywgcm9vdE1vZHVsZSk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcblxuICAgICAgICAgICAgbGV0IHN0YXJ0TW9kdWxlID0gXy5maW5kKGNsZWFuTW9kdWxlc1RyZWUsIHsnbmFtZSc6IHJvb3RNb2R1bGV9KTtcblxuICAgICAgICAgICAgaWYgKHN0YXJ0TW9kdWxlKSB7XG4gICAgICAgICAgICAgICAgbG9vcE1vZHVsZXNQYXJzZXIoc3RhcnRNb2R1bGUpO1xuICAgICAgICAgICAgICAgIC8vTG9vcCB0d2ljZSBmb3Igcm91dGVzIHdpdGggbGF6eSBsb2FkaW5nXG4gICAgICAgICAgICAgICAgLy9sb29wTW9kdWxlc1BhcnNlcihyb3V0ZXNUcmVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnICByb3V0ZXNUcmVlOiAnLCByb3V0ZXNUcmVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5lZFJvdXRlc1RyZWUgPSBudWxsO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5Sb3V0ZXNUcmVlID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHJvdXRlLmNoaWxkcmVuW2ldLnJvdXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhbmVkUm91dGVzVHJlZSA9IGNsZWFuUm91dGVzVHJlZShyb3V0ZXNUcmVlKTtcblxuICAgICAgICAgICAgLy9UcnkgdXBkYXRpbmcgcm91dGVzIHdpdGggbGF6eSBsb2FkaW5nXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ1RyeSB1cGRhdGluZyByb3V0ZXMgd2l0aCBsYXp5IGxvYWRpbmcnKTtcblxuICAgICAgICAgICAgbGV0IGxvb3BSb3V0ZXNQYXJzZXIgPSBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgIGlmKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByb3V0ZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlLmNoaWxkcmVuW2ldLmxvYWRDaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IGZvdW5kTGF6eU1vZHVsZVdpdGhQYXRoKHJvdXRlLmNoaWxkcmVuW2ldLmxvYWRDaGlsZHJlbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZSA9IF8uZmluZChjbGVhbk1vZHVsZXNUcmVlLCB7J25hbWUnOiBjaGlsZH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9yYXdNb2R1bGU6YW55ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUua2luZCA9ICdtb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmF3TW9kdWxlLmNoaWxkcmVuID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUubW9kdWxlID0gbW9kdWxlLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb29wSW5zaWRlID0gZnVuY3Rpb24obW9kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihtb2QuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gbW9kLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZSA9IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZShtb2QuY2hpbGRyZW5baV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygcm91dGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmNoaWxkcmVuID0gSlNPTi5wYXJzZShyb3V0ZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgcm91dGUuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5raW5kID0gJ21vZHVsZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Jhd01vZHVsZS5jaGlsZHJlbltpXSA9IHJvdXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BJbnNpZGUobW9kdWxlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5jaGlsZHJlbltpXS5jaGlsZHJlbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5jaGlsZHJlbltpXS5jaGlsZHJlbi5wdXNoKF9yYXdNb2R1bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BSb3V0ZXNQYXJzZXIocm91dGUuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9vcFJvdXRlc1BhcnNlcihjbGVhbmVkUm91dGVzVHJlZSk7XG5cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnICBjbGVhbmVkUm91dGVzVHJlZTogJywgdXRpbC5pbnNwZWN0KGNsZWFuZWRSb3V0ZXNUcmVlLCB7IGRlcHRoOiAxMCB9KSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjbGVhbmVkUm91dGVzVHJlZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfY29uc3RydWN0TW9kdWxlc1RyZWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnY29uc3RydWN0TW9kdWxlc1RyZWUnKTtcbiAgICAgICAgICAgIGxldCBnZXROZXN0ZWRDaGlsZHJlbiA9IGZ1bmN0aW9uKGFyciwgcGFyZW50Pykge1xuICAgICAgICAgICAgICAgIHZhciBvdXQgPSBbXVxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoYXJyW2ldLnBhcmVudCA9PT0gcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBnZXROZXN0ZWRDaGlsZHJlbihhcnIsIGFycltpXS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyW2ldLmNoaWxkcmVuID0gY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG91dC5wdXNoKGFycltpXSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9TY2FuIGVhY2ggbW9kdWxlIGFuZCBhZGQgcGFyZW50IHByb3BlcnR5XG4gICAgICAgICAgICBfLmZvckVhY2gobW9kdWxlcywgZnVuY3Rpb24oZmlyc3RMb29wTW9kdWxlKSB7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGZpcnN0TG9vcE1vZHVsZS5pbXBvcnRzTm9kZSwgZnVuY3Rpb24oaW1wb3J0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2gobW9kdWxlcywgZnVuY3Rpb24obW9kdWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggbW9kdWxlLm5hbWUgPT09IGltcG9ydE5vZGUubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZS5wYXJlbnQgPSBmaXJzdExvb3BNb2R1bGUubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbW9kdWxlc1RyZWUgPSBnZXROZXN0ZWRDaGlsZHJlbihtb2R1bGVzKTtcbiAgICAgICAgICAgIC8qY29uc29sZS5sb2coJycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2VuZCBjb25zdHJ1Y3RNb2R1bGVzVHJlZScpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobW9kdWxlc1RyZWUpOyovXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2dlbmVyYXRlUm91dGVzSW5kZXggPSBmdW5jdGlvbihvdXRwdXRGb2xkZXIsIHJvdXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhcnRpYWxzL3JvdXRlcy1pbmRleC5oYnMnKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyByb3V0ZXMgaW5kZXggZ2VuZXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTphbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUoZGF0YSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzOiBKU09OLnN0cmluZ2lmeShyb3V0ZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0Rm9sZGVyID0gb3V0cHV0Rm9sZGVyLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBvdXRwdXRGb2xkZXIgKyBwYXRoLnNlcCArICcvanMvcm91dGVzL3JvdXRlc19pbmRleC5qcycpLCByZXN1bHQsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIHJvdXRlcyBpbmRleCBmaWxlIGdlbmVyYXRpb24gJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgfSk7XG4gICAgICAgfSxcblxuICAgICAgIF9yb3V0ZXNMZW5ndGggPSBmdW5jdGlvbigpOiBudW1iZXIge1xuICAgICAgICAgICB2YXIgX24gPSAwO1xuXG4gICAgICAgICAgIGxldCByb3V0ZXNQYXJzZXIgPSBmdW5jdGlvbihyb3V0ZSkge1xuICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByb3V0ZS5wYXRoICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgIF9uICs9IDE7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICBmb3IodmFyIGogaW4gcm91dGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzUGFyc2VyKHJvdXRlLmNoaWxkcmVuW2pdKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgIH07XG5cbiAgICAgICAgICAgZm9yKHZhciBpIGluIHJvdXRlcykge1xuICAgICAgICAgICAgICAgcm91dGVzUGFyc2VyKHJvdXRlc1tpXSk7XG4gICAgICAgICAgIH1cblxuICAgICAgICAgICByZXR1cm4gX247XG4gICAgICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5jb21wbGV0ZVJvdXRlczogaW5jb21wbGV0ZVJvdXRlcyxcbiAgICAgICAgYWRkUm91dGU6IF9hZGRSb3V0ZSxcbiAgICAgICAgYWRkSW5jb21wbGV0ZVJvdXRlOiBfYWRkSW5jb21wbGV0ZVJvdXRlLFxuICAgICAgICBhZGRNb2R1bGVXaXRoUm91dGVzOiBfYWRkTW9kdWxlV2l0aFJvdXRlcyxcbiAgICAgICAgYWRkTW9kdWxlOiBfYWRkTW9kdWxlLFxuICAgICAgICBjbGVhblJhd1JvdXRlUGFyc2VkOiBfY2xlYW5SYXdSb3V0ZVBhcnNlZCxcbiAgICAgICAgY2xlYW5SYXdSb3V0ZTogX2NsZWFuUmF3Um91dGUsXG4gICAgICAgIHNldFJvb3RNb2R1bGU6IF9zZXRSb290TW9kdWxlLFxuICAgICAgICBwcmludFJvdXRlczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncHJpbnRSb3V0ZXM6ICcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocm91dGVzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJpbnRNb2R1bGVzUm91dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcmludE1vZHVsZXNSb3V0ZXM6ICcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobW9kdWxlc1dpdGhSb3V0ZXMpO1xuICAgICAgICB9LFxuICAgICAgICByb3V0ZXNMZW5ndGg6IF9yb3V0ZXNMZW5ndGgsXG4gICAgICAgIGhhc1JvdXRlck1vZHVsZUluSW1wb3J0czogX2hhc1JvdXRlck1vZHVsZUluSW1wb3J0cyxcbiAgICAgICAgZml4SW5jb21wbGV0ZVJvdXRlczogX2ZpeEluY29tcGxldGVSb3V0ZXMsXG4gICAgICAgIGxpbmtNb2R1bGVzQW5kUm91dGVzOiBfbGlua01vZHVsZXNBbmRSb3V0ZXMsXG4gICAgICAgIGNvbnN0cnVjdFJvdXRlc1RyZWU6IF9jb25zdHJ1Y3RSb3V0ZXNUcmVlLFxuICAgICAgICBjb25zdHJ1Y3RNb2R1bGVzVHJlZTogX2NvbnN0cnVjdE1vZHVsZXNUcmVlLFxuICAgICAgICBnZW5lcmF0ZVJvdXRlc0luZGV4OiBfZ2VuZXJhdGVSb3V0ZXNJbmRleFxuICAgIH1cbn0pKCk7XG4iLCJpbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFyaWFibGVMaWtlKG5vZGU6IE5vZGUpOiBub2RlIGlzIFZhcmlhYmxlTGlrZURlY2xhcmF0aW9uIHtcbiAgIGlmIChub2RlKSB7XG4gICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJpbmRpbmdFbGVtZW50OlxuICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRW51bU1lbWJlcjpcbiAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBhcmFtZXRlcjpcbiAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QXNzaWdubWVudDpcbiAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb246XG4gICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eVNpZ25hdHVyZTpcbiAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudDpcbiAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb246XG4gICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICB9XG4gICB9XG4gICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb21lPFQ+KGFycmF5OiBUW10sIHByZWRpY2F0ZT86ICh2YWx1ZTogVCkgPT4gYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmIChhcnJheSkge1xuICAgICAgICBpZiAocHJlZGljYXRlKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgYXJyYXkpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJlZGljYXRlKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdGVuYXRlPFQ+KGFycmF5MTogVFtdLCBhcnJheTI6IFRbXSk6IFRbXSB7XG4gICAgaWYgKCFzb21lKGFycmF5MikpIHJldHVybiBhcnJheTE7XG4gICAgaWYgKCFzb21lKGFycmF5MSkpIHJldHVybiBhcnJheTI7XG4gICAgcmV0dXJuIFsuLi5hcnJheTEsIC4uLmFycmF5Ml07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BhcmFtZXRlcihub2RlOiBOb2RlKTogbm9kZSBpcyBQYXJhbWV0ZXJEZWNsYXJhdGlvbiB7XG4gICAgcmV0dXJuIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5QYXJhbWV0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRKU0RvY1BhcmFtZXRlclRhZ3MocGFyYW06IE5vZGUpOiBKU0RvY1BhcmFtZXRlclRhZ1tdIHtcbiAgICBpZiAoIWlzUGFyYW1ldGVyKHBhcmFtKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBmdW5jID0gcGFyYW0ucGFyZW50IGFzIEZ1bmN0aW9uTGlrZURlY2xhcmF0aW9uO1xuICAgIGNvbnN0IHRhZ3MgPSBnZXRKU0RvY1RhZ3MoZnVuYywgdHMuU3ludGF4S2luZC5KU0RvY1BhcmFtZXRlclRhZykgYXMgSlNEb2NQYXJhbWV0ZXJUYWdbXTtcbiAgICBpZiAoIXBhcmFtLm5hbWUpIHtcbiAgICAgICAgLy8gdGhpcyBpcyBhbiBhbm9ueW1vdXMganNkb2MgcGFyYW0gZnJvbSBhIGBmdW5jdGlvbih0eXBlMSwgdHlwZTIpOiB0eXBlM2Agc3BlY2lmaWNhdGlvblxuICAgICAgICBjb25zdCBpID0gZnVuYy5wYXJhbWV0ZXJzLmluZGV4T2YocGFyYW0pO1xuICAgICAgICBjb25zdCBwYXJhbVRhZ3MgPSBmaWx0ZXIodGFncywgdGFnID0+IHRhZy5raW5kID09PSB0cy5TeW50YXhLaW5kLkpTRG9jUGFyYW1ldGVyVGFnKTtcbiAgICAgICAgaWYgKHBhcmFtVGFncyAmJiAwIDw9IGkgJiYgaSA8IHBhcmFtVGFncy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBbcGFyYW1UYWdzW2ldXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChwYXJhbS5uYW1lLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICBjb25zdCBuYW1lID0gKHBhcmFtLm5hbWUgYXMgSWRlbnRpZmllcikudGV4dDtcbiAgICAgICAgcmV0dXJuIGZpbHRlcih0YWdzLCB0YWcgPT4gdGFnLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSlNEb2NQYXJhbWV0ZXJUYWcgJiYgdGFnLnBhcmFtZXRlck5hbWUudGV4dCA9PT0gbmFtZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBUT0RPOiBpdCdzIGEgZGVzdHJ1Y3R1cmVkIHBhcmFtZXRlciwgc28gaXQgc2hvdWxkIGxvb2sgdXAgYW4gXCJvYmplY3QgdHlwZVwiIHNlcmllcyBvZiBtdWx0aXBsZSBsaW5lc1xuICAgICAgICAvLyBCdXQgbXVsdGktbGluZSBvYmplY3QgdHlwZXMgYXJlbid0IHN1cHBvcnRlZCB5ZXQgZWl0aGVyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG5leHBvcnQgbGV0IEpTRG9jVGFnc1BhcnNlciA9IChmdW5jdGlvbigpIHtcblxuICAgIGxldCBfZ2V0SlNEb2NzID0gKG5vZGU6IE5vZGUpOihKU0RvYyB8IEpTRG9jVGFnKVtdID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnZ2V0SlNEb2NzOiAnLCBub2RlKTtcbiAgICAgICAgbGV0IGNhY2hlOiAoSlNEb2MgfCBKU0RvY1RhZylbXSA9IG5vZGUuanNEb2NDYWNoZTtcbiAgICAgICAgaWYgKCFjYWNoZSkge1xuICAgICAgICAgICAgZ2V0SlNEb2NzV29ya2VyKG5vZGUpO1xuICAgICAgICAgICAgbm9kZS5qc0RvY0NhY2hlID0gY2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGdldEpTRG9jc1dvcmtlcihub2RlOiBOb2RlKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgICAgICAgICAgIC8vIFRyeSB0byByZWNvZ25pemUgdGhpcyBwYXR0ZXJuIHdoZW4gbm9kZSBpcyBpbml0aWFsaXplciBvZiB2YXJpYWJsZSBkZWNsYXJhdGlvbiBhbmQgSlNEb2MgY29tbWVudHMgYXJlIG9uIGNvbnRhaW5pbmcgdmFyaWFibGUgc3RhdGVtZW50LlxuICAgICAgICAgICAgLy8gLyoqXG4gICAgICAgICAgICAvLyAgICogQHBhcmFtIHtudW1iZXJ9IG5hbWVcbiAgICAgICAgICAgIC8vICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAgICAgICAgLy8gICAqL1xuICAgICAgICAgICAgLy8gdmFyIHggPSBmdW5jdGlvbihuYW1lKSB7IHJldHVybiBuYW1lLmxlbmd0aDsgfVxuICAgICAgICAgICAgY29uc3QgaXNJbml0aWFsaXplck9mVmFyaWFibGVEZWNsYXJhdGlvbkluU3RhdGVtZW50ID1cbiAgICAgICAgICAgICAgICBpc1ZhcmlhYmxlTGlrZShwYXJlbnQpICYmXG4gICAgICAgICAgICAgICAgcGFyZW50LmluaXRpYWxpemVyID09PSBub2RlICYmXG4gICAgICAgICAgICAgICAgcGFyZW50LnBhcmVudC5wYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudDtcbiAgICAgICAgICAgIGNvbnN0IGlzVmFyaWFibGVPZlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQgPSBpc1ZhcmlhYmxlTGlrZShub2RlKSAmJlxuICAgICAgICAgICAgICAgIHBhcmVudC5wYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudDtcbiAgICAgICAgICAgIGNvbnN0IHZhcmlhYmxlU3RhdGVtZW50Tm9kZSA9XG4gICAgICAgICAgICAgICAgaXNJbml0aWFsaXplck9mVmFyaWFibGVEZWNsYXJhdGlvbkluU3RhdGVtZW50ID8gcGFyZW50LnBhcmVudC5wYXJlbnQgOlxuICAgICAgICAgICAgICAgIGlzVmFyaWFibGVPZlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQgPyBwYXJlbnQucGFyZW50IDpcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodmFyaWFibGVTdGF0ZW1lbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgZ2V0SlNEb2NzV29ya2VyKHZhcmlhYmxlU3RhdGVtZW50Tm9kZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFsc28gcmVjb2duaXplIHdoZW4gdGhlIG5vZGUgaXMgdGhlIFJIUyBvZiBhbiBhc3NpZ25tZW50IGV4cHJlc3Npb25cbiAgICAgICAgICAgIGNvbnN0IGlzU291cmNlT2ZBc3NpZ25tZW50RXhwcmVzc2lvblN0YXRlbWVudCA9XG4gICAgICAgICAgICAgICAgcGFyZW50ICYmIHBhcmVudC5wYXJlbnQgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5CaW5hcnlFeHByZXNzaW9uICYmXG4gICAgICAgICAgICAgICAgKHBhcmVudCBhcyBCaW5hcnlFeHByZXNzaW9uKS5vcGVyYXRvclRva2VuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXF1YWxzVG9rZW4gJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQucGFyZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICAgICAgICAgIGlmIChpc1NvdXJjZU9mQXNzaWdubWVudEV4cHJlc3Npb25TdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBnZXRKU0RvY3NXb3JrZXIocGFyZW50LnBhcmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGlzTW9kdWxlRGVjbGFyYXRpb24gPSBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTW9kdWxlRGVjbGFyYXRpb24gJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQgJiYgcGFyZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTW9kdWxlRGVjbGFyYXRpb247XG4gICAgICAgICAgICBjb25zdCBpc1Byb3BlcnR5QXNzaWdubWVudEV4cHJlc3Npb24gPSBwYXJlbnQgJiYgcGFyZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50O1xuICAgICAgICAgICAgaWYgKGlzTW9kdWxlRGVjbGFyYXRpb24gfHwgaXNQcm9wZXJ0eUFzc2lnbm1lbnRFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgZ2V0SlNEb2NzV29ya2VyKHBhcmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFB1bGwgcGFyYW1ldGVyIGNvbW1lbnRzIGZyb20gZGVjbGFyaW5nIGZ1bmN0aW9uIGFzIHdlbGxcbiAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUGFyYW1ldGVyKSB7XG4gICAgICAgICAgICAgICAgY2FjaGUgPSBjb25jYXRlbmF0ZShjYWNoZSwgZ2V0SlNEb2NQYXJhbWV0ZXJUYWdzKG5vZGUpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzVmFyaWFibGVMaWtlKG5vZGUpICYmIG5vZGUuaW5pdGlhbGl6ZXIpIHtcbiAgICAgICAgICAgICAgICBjYWNoZSA9IGNvbmNhdGVuYXRlKGNhY2hlLCBub2RlLmluaXRpYWxpemVyLmpzRG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FjaGUgPSBjb25jYXRlbmF0ZShjYWNoZSwgbm9kZS5qc0RvYyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRKU0RvY3M6IF9nZXRKU0RvY3NcbiAgICB9XG59KSgpO1xuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmxldCBjb2RlOiBzdHJpbmdbXSA9IFtdO1xuXG5leHBvcnQgbGV0IGdlbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHRtcDogdHlwZW9mIGNvZGUgPSBbXTtcblxuICAgIHJldHVybiAodG9rZW4gPSBudWxsKSA9PiB7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyAhIHRva2VuJyk7XG4gICAgICAgICAgICByZXR1cm4gY29kZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0b2tlbiA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyBcXG4nKTtcbiAgICAgICAgICAgIGNvZGUucHVzaCh0bXAuam9pbignJykpO1xuICAgICAgICAgICAgdG1wID0gW107XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb2RlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cbn0gKCkpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGUobm9kZTogYW55KSB7XG4gICAgY29kZSA9IFtdO1xuICAgIHZpc2l0QW5kUmVjb2duaXplKG5vZGUpO1xuICAgIHJldHVybiBjb2RlLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiB2aXNpdEFuZFJlY29nbml6ZShub2RlOiBhbnksIGRlcHRoID0gMCkge1xuICAgIHJlY29nbml6ZShub2RlKTtcbiAgICBkZXB0aCsrO1xuICAgIG5vZGUuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKGMgPT4gdmlzaXRBbmRSZWNvZ25pemUoYywgZGVwdGgpKTtcbn1cblxuZnVuY3Rpb24gcmVjb2duaXplKG5vZGU6IGFueSkge1xuXG4gICAgLy9jb25zb2xlLmxvZygncmVjb2duaXppbmcuLi4nLCB0cy5TeW50YXhLaW5kW25vZGUua2luZCsnJ10pO1xuXG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZpcnN0TGl0ZXJhbFRva2VuOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgICAgIGdlbignXFxcIicpO1xuICAgICAgICAgICAgZ2VuKG5vZGUudGV4dCk7XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIGdlbignXFxcIicpO1xuICAgICAgICAgICAgZ2VuKG5vZGUudGV4dCk7XG4gICAgICAgICAgICBnZW4oJ1xcXCInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0S2V5d29yZDpcbiAgICAgICAgICAgIGdlbignaW1wb3J0Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnJvbUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2Zyb20nKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGdlbignZXhwb3J0Jyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ2NsYXNzJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3RoaXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3JLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdjb25zdHJ1Y3RvcicpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICAgICAgICAgIGdlbignZmFsc2UnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ3RydWUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQ6XG4gICAgICAgICAgICBnZW4oJ251bGwnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BdFRva2VuOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QbHVzVG9rZW46XG4gICAgICAgICAgICBnZW4oJysnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXF1YWxzR3JlYXRlclRoYW5Ub2tlbjpcbiAgICAgICAgICAgIGdlbignID0+ICcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9wZW5QYXJlblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcoJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0Q2xhdXNlOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgICAgICBnZW4oJ3snKTtcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CbG9jazpcbiAgICAgICAgICAgIGdlbigneycpO1xuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbG9zZUJyYWNlVG9rZW46XG4gICAgICAgICAgICBnZW4oJ30nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VQYXJlblRva2VuOlxuICAgICAgICAgICAgZ2VuKCcpJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk9wZW5CcmFja2V0VG9rZW46XG4gICAgICAgICAgICBnZW4oJ1snKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFja2V0VG9rZW46XG4gICAgICAgICAgICBnZW4oJ10nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TZW1pY29sb25Ub2tlbjpcbiAgICAgICAgICAgIGdlbignOycpO1xuICAgICAgICAgICAgZ2VuKCdcXG4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29tbWFUb2tlbjpcbiAgICAgICAgICAgIGdlbignLCcpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbG9uVG9rZW46XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGdlbignOicpO1xuICAgICAgICAgICAgZ2VuKCcgJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRvdFRva2VuOlxuICAgICAgICAgICAgZ2VuKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRvU3RhdGVtZW50OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5EZWNvcmF0b3I6XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmlyc3RBc3NpZ25tZW50OlxuICAgICAgICAgICAgZ2VuKCcgPSAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmlyc3RQdW5jdHVhdGlvbjpcbiAgICAgICAgICAgIGdlbignICcpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkOlxuICAgICAgICAgICAgZ2VuKCdwcml2YXRlJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDpcbiAgICAgICAgICAgIGdlbigncHVibGljJyk7XG4gICAgICAgICAgICBnZW4oJyAnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG4iLCJleHBvcnQgY29uc3QgZW51bSBBbmd1bGFyTGlmZWN5Y2xlSG9va3Mge1xuICAgIG5nT25DaGFuZ2VzLFxuICAgIG5nT25Jbml0LFxuICAgIG5nRG9DaGVjayxcbiAgICBuZ0FmdGVyQ29udGVudEluaXQsXG4gICAgbmdBZnRlckNvbnRlbnRDaGVja2VkLFxuICAgIG5nQWZ0ZXJWaWV3SW5pdCxcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQsXG4gICAgbmdPbkRlc3Ryb3lcbn1cbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkQ29uZmlnRmlsZSwgZm9ybWF0RGlhZ25vc3RpY3MsIEZvcm1hdERpYWdub3N0aWNzSG9zdCwgc3lzIH0gZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBBbmd1bGFyTGlmZWN5Y2xlSG9va3MgfSBmcm9tICcuL2FuZ3VsYXItbGlmZWN5Y2xlcy1ob29rcyc7XG5cbmNvbnN0IGdldEN1cnJlbnREaXJlY3RvcnkgPSBzeXMuZ2V0Q3VycmVudERpcmVjdG9yeTtcbmNvbnN0IHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXMgPSBzeXMudXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcztcbmNvbnN0IG5ld0xpbmUgPSBzeXMubmV3TGluZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5ld0xpbmUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmV3TGluZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENhbm9uaWNhbEZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzID8gZmlsZU5hbWUgOiBmaWxlTmFtZS50b0xvd2VyQ2FzZSgpO1xufVxuXG5leHBvcnQgY29uc3QgZm9ybWF0RGlhZ25vc3RpY3NIb3N0OiBGb3JtYXREaWFnbm9zdGljc0hvc3QgPSB7XG4gICAgZ2V0Q3VycmVudERpcmVjdG9yeSxcbiAgICBnZXRDYW5vbmljYWxGaWxlTmFtZSxcbiAgICBnZXROZXdMaW5lXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbmZpZyhjb25maWdGaWxlOiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCByZXN1bHQgPSByZWFkQ29uZmlnRmlsZShjb25maWdGaWxlLCBzeXMucmVhZEZpbGUpO1xuICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBmb3JtYXREaWFnbm9zdGljcyhbcmVzdWx0LmVycm9yXSwgZm9ybWF0RGlhZ25vc3RpY3NIb3N0KTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LmNvbmZpZztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEJvbShzb3VyY2U6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcblx0XHRyZXR1cm4gc291cmNlLnNsaWNlKDEpO1xuXHR9XG5cdHJldHVybiBzb3VyY2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNCb20oc291cmNlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHNvdXJjZS5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlUGF0aChmaWxlczogc3RyaW5nW10sIGN3ZDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGxldCBfZmlsZXMgPSBmaWxlcyxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGxlbiA9IGZpbGVzLmxlbmd0aDtcblxuICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChmaWxlc1tpXS5pbmRleE9mKGN3ZCkgPT09IC0xKSB7XG4gICAgICAgICAgICBmaWxlc1tpXSA9IHBhdGgucmVzb2x2ZShjd2QgKyBwYXRoLnNlcCArIGZpbGVzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmlsZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbkxpZmVjeWNsZUhvb2tzRnJvbU1ldGhvZHMobWV0aG9kcykge1xuICAgIHZhciByZXN1bHQgPSBbXSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGxlbiA9IG1ldGhvZHMubGVuZ3RoO1xuXG4gICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgaWYgKCFtZXRob2RzW2ldLm5hbWUgaW4gQW5ndWxhckxpZmVjeWNsZUhvb2tzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xlYW4nKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1ldGhvZHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9maWxlLmVuZ2luZSc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi8uLi9sb2dnZXInO1xuXG5jb25zdCAkOiBhbnkgPSByZXF1aXJlKCdjaGVlcmlvJyk7XG5cbmNsYXNzIENvbXBvbmVudHNUcmVlRW5naW5lIHtcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IENvbXBvbmVudHNUcmVlRW5naW5lID0gbmV3IENvbXBvbmVudHNUcmVlRW5naW5lKCk7XG4gICAgY29tcG9uZW50czogYW55W10gPSBbXTtcbiAgICBjb21wb25lbnRzRm9yVHJlZTogYW55W10gPSBbXTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYgKENvbXBvbmVudHNUcmVlRW5naW5lLl9pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvcjogSW5zdGFudGlhdGlvbiBmYWlsZWQ6IFVzZSBDb21wb25lbnRzVHJlZUVuZ2luZS5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xuICAgICAgICB9XG4gICAgICAgIENvbXBvbmVudHNUcmVlRW5naW5lLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogQ29tcG9uZW50c1RyZWVFbmdpbmUge1xuICAgICAgICByZXR1cm4gQ29tcG9uZW50c1RyZWVFbmdpbmUuX2luc3RhbmNlO1xuICAgIH1cbiAgICBhZGRDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgfVxuICAgIHJlYWRUZW1wbGF0ZXMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gdGhpcy5jb21wb25lbnRzRm9yVHJlZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgJGZpbGVlbmdpbmUgPSBuZXcgRmlsZUVuZ2luZSgpLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDw9IGxlbiAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLnRlbXBsYXRlVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGZpbGVlbmdpbmUuZ2V0KHBhdGguZGlybmFtZSh0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLmZpbGUpICsgcGF0aC5zZXAgKyB0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLnRlbXBsYXRlVXJsKS50aGVuKCh0ZW1wbGF0ZURhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzRm9yVHJlZVtpXS50ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzRm9yVHJlZVtpXS50ZW1wbGF0ZURhdGEgPSB0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLnRlbXBsYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZpbmRDaGlsZHJlbkFuZFBhcmVudHMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb21wb25lbnRzRm9yVHJlZSwgKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCAkY29tcG9uZW50ID0gJChjb21wb25lbnQudGVtcGxhdGVEYXRhKTtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb21wb25lbnRzRm9yVHJlZSwgKGNvbXBvbmVudFRvRmluZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoJGNvbXBvbmVudC5maW5kKGNvbXBvbmVudFRvRmluZC5zZWxlY3RvcikubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY29tcG9uZW50VG9GaW5kLm5hbWUgKyAnIGZvdW5kIGluICcgKyBjb21wb25lbnQubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuY2hpbGRyZW4ucHVzaChjb21wb25lbnRUb0ZpbmQubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY3JlYXRlVHJlZXNGb3JDb21wb25lbnRzKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29tcG9uZW50cywgKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBfY29tcG9uZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wb25lbnQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogY29tcG9uZW50LmZpbGUsXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBjb21wb25lbnQuc2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICcnLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21wb25lbnQudGVtcGxhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb21wb25lbnQudGVtcGxhdGUgPSBjb21wb25lbnQudGVtcGxhdGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZVVybC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb21wb25lbnQudGVtcGxhdGVVcmwgPSBjb21wb25lbnQudGVtcGxhdGVVcmxbMF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzRm9yVHJlZS5wdXNoKF9jb21wb25lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnJlYWRUZW1wbGF0ZXMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmRDaGlsZHJlbkFuZFBhcmVudHMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMuY29tcG9uZW50c0ZvclRyZWU6ICcsIHRoaXMuY29tcG9uZW50c0ZvclRyZWUpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCAkY29tcG9uZW50c1RyZWVFbmdpbmUgPSBDb21wb25lbnRzVHJlZUVuZ2luZS5nZXRJbnN0YW5jZSgpO1xuIiwiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcblxuaW1wb3J0IHsgY29tcGlsZXJIb3N0LCBkZXRlY3RJbmRlbnQgfSBmcm9tICcuLi8uLi91dGlsaXRpZXMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vLi4vbG9nZ2VyJztcbmltcG9ydCB7IFJvdXRlclBhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL3JvdXRlci5wYXJzZXInO1xuaW1wb3J0IHsgTGlua1BhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL2xpbmstcGFyc2VyJztcbmltcG9ydCB7IEpTRG9jVGFnc1BhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL2pzZG9jLnBhcnNlcic7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gJy4vY29kZWdlbic7XG5pbXBvcnQgeyBzdHJpcEJvbSwgaGFzQm9tLCBjbGVhbkxpZmVjeWNsZUhvb2tzRnJvbU1ldGhvZHMgfSBmcm9tICcuLi8uLi91dGlscy91dGlscyc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyAkY29tcG9uZW50c1RyZWVFbmdpbmUgfSBmcm9tICcuLi9lbmdpbmVzL2NvbXBvbmVudHMtdHJlZS5lbmdpbmUnO1xuXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcblxuaW50ZXJmYWNlIE5vZGVPYmplY3Qge1xuICAgIGtpbmQ6IE51bWJlcjtcbiAgICBwb3M6IE51bWJlcjtcbiAgICBlbmQ6IE51bWJlcjtcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgaW5pdGlhbGl6ZXI6IE5vZGVPYmplY3QsXG4gICAgbmFtZT86IHsgdGV4dDogc3RyaW5nIH07XG4gICAgZXhwcmVzc2lvbj86IE5vZGVPYmplY3Q7XG4gICAgZWxlbWVudHM/OiBOb2RlT2JqZWN0W107XG4gICAgYXJndW1lbnRzPzogTm9kZU9iamVjdFtdO1xuICAgIHByb3BlcnRpZXM/OiBhbnlbXTtcbiAgICBwYXJzZXJDb250ZXh0RmxhZ3M/OiBOdW1iZXI7XG4gICAgZXF1YWxzR3JlYXRlclRoYW5Ub2tlbj86IE5vZGVPYmplY3RbXTtcbiAgICBwYXJhbWV0ZXJzPzogTm9kZU9iamVjdFtdO1xuICAgIENvbXBvbmVudD86IHN0cmluZztcbiAgICBib2R5Pzoge1xuICAgICAgICBwb3M6IE51bWJlcjtcbiAgICAgICAgZW5kOiBOdW1iZXI7XG4gICAgICAgIHN0YXRlbWVudHM6IE5vZGVPYmplY3RbXTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBEZXBzIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdHlwZTogc3RyaW5nO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGZpbGU/OiBzdHJpbmc7XG4gICAgc291cmNlQ29kZT86IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcblxuICAgIC8vQ29tcG9uZW50XG5cbiAgICBhbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBzdHJpbmc7XG4gICAgZW5jYXBzdWxhdGlvbj86IHN0cmluZztcbiAgICBlbnRyeUNvbXBvbmVudHM/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBleHBvcnRBcz86IHN0cmluZztcbiAgICBob3N0Pzogc3RyaW5nO1xuICAgIGlucHV0cz86IHN0cmluZ1tdO1xuICAgIGludGVycG9sYXRpb24/OiBzdHJpbmc7IC8vIFRPRE9cbiAgICBtb2R1bGVJZD86IHN0cmluZztcbiAgICBvdXRwdXRzPzogc3RyaW5nW107XG4gICAgcXVlcmllcz86IERlcHNbXTsgLy8gVE9ET1xuICAgIHNlbGVjdG9yPzogc3RyaW5nO1xuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdO1xuICAgIHN0eWxlcz86IHN0cmluZ1tdO1xuICAgIHRlbXBsYXRlPzogc3RyaW5nO1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nW107XG4gICAgdmlld1Byb3ZpZGVycz86IHN0cmluZ1tdO1xuXG4gICAgaW1wbGVtZW50cz87XG4gICAgZXh0ZW5kcz87XG5cbiAgICBpbnB1dHNDbGFzcz86IE9iamVjdFtdO1xuICAgIG91dHB1dHNDbGFzcz86IE9iamVjdFtdO1xuICAgIHByb3BlcnRpZXNDbGFzcz86IE9iamVjdFtdO1xuICAgIG1ldGhvZHNDbGFzcz86IE9iamVjdFtdO1xuXG4gICAgLy9jb21tb25cbiAgICBwcm92aWRlcnM/OiBEZXBzW107XG5cbiAgICAvL21vZHVsZVxuICAgIGRlY2xhcmF0aW9ucz86IERlcHNbXTtcbiAgICBib290c3RyYXA/OiBEZXBzW107XG5cbiAgICBpbXBvcnRzPzogRGVwc1tdO1xuICAgIGV4cG9ydHM/OiBEZXBzW107XG5cbiAgICByb3V0ZXNUcmVlPztcbn1cblxuaW50ZXJmYWNlIFN5bWJvbERlcHMge1xuICAgIGZ1bGw6IHN0cmluZztcbiAgICBhbGlhczogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzIHtcblxuICAgIHByaXZhdGUgZmlsZXM6IHN0cmluZ1tdO1xuICAgIHByaXZhdGUgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgICBwcml2YXRlIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcjtcbiAgICBwcml2YXRlIGVuZ2luZTogYW55O1xuICAgIHByaXZhdGUgX19jYWNoZTogYW55ID0ge307XG4gICAgcHJpdmF0ZSBfX25zTW9kdWxlOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIHVua25vd24gPSAnPz8/JztcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCk7XG5cbiAgICBjb25zdHJ1Y3RvcihmaWxlczogc3RyaW5nW10sIG9wdGlvbnM6IGFueSkge1xuICAgICAgICB0aGlzLmZpbGVzID0gZmlsZXM7XG4gICAgICAgIGNvbnN0IHRyYW5zcGlsZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRzLlNjcmlwdFRhcmdldC5FUzUsXG4gICAgICAgICAgICBtb2R1bGU6IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMsXG4gICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogb3B0aW9ucy50c2NvbmZpZ0RpcmVjdG9yeVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHRoaXMuZmlsZXMsIHRyYW5zcGlsZU9wdGlvbnMsIGNvbXBpbGVySG9zdCh0cmFuc3BpbGVPcHRpb25zKSk7XG4gICAgICAgIHRoaXMudHlwZUNoZWNrZXIgPSB0aGlzLnByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKTtcbiAgICB9XG5cbiAgICBnZXREZXBlbmRlbmNpZXMoKSB7XG4gICAgICAgIGxldCBkZXBzOiBhbnkgPSB7XG4gICAgICAgICAgICAnbW9kdWxlcyc6IFtdLFxuICAgICAgICAgICAgJ2NvbXBvbmVudHMnOiBbXSxcbiAgICAgICAgICAgICdpbmplY3RhYmxlcyc6IFtdLFxuICAgICAgICAgICAgJ3BpcGVzJzogW10sXG4gICAgICAgICAgICAnZGlyZWN0aXZlcyc6IFtdLFxuICAgICAgICAgICAgJ3JvdXRlcyc6IFtdLFxuICAgICAgICAgICAgJ2NsYXNzZXMnOiBbXSxcbiAgICAgICAgICAgICdpbnRlcmZhY2VzJzogW10sXG4gICAgICAgICAgICAnbWlzY2VsbGFuZW91cyc6IHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IFtdLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uczogW10sXG4gICAgICAgICAgICAgICAgdHlwZWFsaWFzZXM6IFtdLFxuICAgICAgICAgICAgICAgIGVudW1lcmF0aW9uczogW10sXG4gICAgICAgICAgICAgICAgdHlwZXM6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHNvdXJjZUZpbGVzID0gdGhpcy5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkgfHwgW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFuIGZpbGVzIHdpdGggVVRGLTggQk9NXG4gICAgICAgICAqL1xuICAgICAgICBzb3VyY2VGaWxlcy5mb3JFYWNoKChmaWxlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbGVQYXRoID0gZmlsZS5maWxlTmFtZTtcblxuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlUGF0aCkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmxhc3RJbmRleE9mKCcuZC50cycpID09PSAtMSAmJiBmaWxlUGF0aC5sYXN0SW5kZXhPZignc3BlYy50cycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQm9tKGZpbGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gc3RyaXBCb20oZmlsZS50ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dCA9IGZpbGUudXBkYXRlKHRleHQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGVuZ3RoOiB0ZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bhbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IGZpbGUudGV4dC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0dC5tb2R1bGVBdWdtZW50YXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHQubW9kdWxlQXVnbWVudGF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZXNbaW5kZXhdID0gdHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvdXJjZUZpbGVzLm1hcCgoZmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgZmlsZVBhdGggPSBmaWxlLmZpbGVOYW1lO1xuXG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT0gJy50cycpIHtcblxuICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aC5sYXN0SW5kZXhPZignLmQudHMnKSA9PT0gLTEgJiYgZmlsZVBhdGgubGFzdEluZGV4T2YoJ3NwZWMudHMnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ3BhcnNpbmcnLCBmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U291cmNlRmlsZURlY29yYXRvcnMoZmlsZSwgZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlLCBmaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGVwcztcblxuICAgICAgICB9KTtcblxuICAgICAgICAvL1JvdXRlclBhcnNlci5wcmludE1vZHVsZXNSb3V0ZXMoKTtcbiAgICAgICAgLy9Sb3V0ZXJQYXJzZXIucHJpbnRSb3V0ZXMoKTtcblxuICAgICAgICAvKmlmIChSb3V0ZXJQYXJzZXIuaW5jb21wbGV0ZVJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoZGVwc1snbWlzY2VsbGFuZW91cyddWyd2YXJpYWJsZXMnXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmZpeEluY29tcGxldGVSb3V0ZXMoZGVwc1snbWlzY2VsbGFuZW91cyddWyd2YXJpYWJsZXMnXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0qL1xuXG4gICAgICAgIC8vJGNvbXBvbmVudHNUcmVlRW5naW5lLmNyZWF0ZVRyZWVzRm9yQ29tcG9uZW50cygpO1xuXG4gICAgICAgIFJvdXRlclBhcnNlci5saW5rTW9kdWxlc0FuZFJvdXRlcygpO1xuICAgICAgICBSb3V0ZXJQYXJzZXIuY29uc3RydWN0TW9kdWxlc1RyZWUoKTtcblxuICAgICAgICBkZXBzLnJvdXRlc1RyZWUgPSBSb3V0ZXJQYXJzZXIuY29uc3RydWN0Um91dGVzVHJlZSgpO1xuXG4gICAgICAgIHJldHVybiBkZXBzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U291cmNlRmlsZURlY29yYXRvcnMoc3JjRmlsZTogdHMuU291cmNlRmlsZSwgb3V0cHV0U3ltYm9sczogT2JqZWN0KTogdm9pZCB7XG5cbiAgICAgICAgbGV0IGNsZWFuZXIgPSAocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwKS5yZXBsYWNlKC9cXFxcL2csICcvJyksXG4gICAgICAgICAgICBmaWxlID0gc3JjRmlsZS5maWxlTmFtZS5yZXBsYWNlKGNsZWFuZXIsICcnKTtcblxuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQoc3JjRmlsZSwgKG5vZGU6IHRzLk5vZGUpID0+IHtcblxuICAgICAgICAgICAgbGV0IGRlcHM6IERlcHMgPSA8RGVwcz57fTtcbiAgICAgICAgICAgIGlmIChub2RlLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmlzaXROb2RlID0gKHZpc2l0ZWROb2RlLCBpbmRleCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXRhZGF0YSA9IG5vZGUuZGVjb3JhdG9ycztcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLmZpbmRQcm9wcyh2aXNpdGVkTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q29tcG9uZW50SU8oZmlsZSwgc3JjRmlsZSwgbm9kZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNNb2R1bGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0TW9kdWxlUHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbnM6IHRoaXMuZ2V0TW9kdWxlRGVjbGF0aW9ucyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0czogdGhpcy5nZXRNb2R1bGVJbXBvcnRzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRzOiB0aGlzLmdldE1vZHVsZUV4cG9ydHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvb3RzdHJhcDogdGhpcy5nZXRNb2R1bGVCb290c3RyYXAocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdtb2R1bGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChSb3V0ZXJQYXJzZXIuaGFzUm91dGVyTW9kdWxlSW5JbXBvcnRzKGRlcHMuaW1wb3J0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkTW9kdWxlV2l0aFJvdXRlcyhuYW1lLCB0aGlzLmdldE1vZHVsZUltcG9ydHNSYXcocHJvcHMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5hZGRNb2R1bGUobmFtZSwgZGVwcy5pbXBvcnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21vZHVsZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNDb21wb25lbnQobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwcm9wcy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2codXRpbC5pbnNwZWN0KHByb3BzLCB7IHNob3dIaWRkZW46IHRydWUsIGRlcHRoOiAxMCB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FuaW1hdGlvbnM/OiBzdHJpbmdbXTsgLy8gVE9ET1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZURldGVjdGlvbjogdGhpcy5nZXRDb21wb25lbnRDaGFuZ2VEZXRlY3Rpb24ocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY2Fwc3VsYXRpb246IHRoaXMuZ2V0Q29tcG9uZW50RW5jYXBzdWxhdGlvbihwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9lbnRyeUNvbXBvbmVudHM/OiBzdHJpbmc7IC8vIFRPRE8gd2FpdGluZyBkb2MgaW5mb3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRBczogdGhpcy5nZXRDb21wb25lbnRFeHBvcnRBcyhwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdDogdGhpcy5nZXRDb21wb25lbnRIb3N0KHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHRoaXMuZ2V0Q29tcG9uZW50SW5wdXRzTWV0YWRhdGEocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaW50ZXJwb2xhdGlvbj86IHN0cmluZzsgLy8gVE9ETyB3YWl0aW5nIGRvYyBpbmZvc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlkOiB0aGlzLmdldENvbXBvbmVudE1vZHVsZUlkKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiB0aGlzLmdldENvbXBvbmVudE91dHB1dHMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogdGhpcy5nZXRDb21wb25lbnRQcm92aWRlcnMocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcXVlcmllcz86IERlcHNbXTsgLy8gVE9ET1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiB0aGlzLmdldENvbXBvbmVudFNlbGVjdG9yKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZVVybHM6IHRoaXMuZ2V0Q29tcG9uZW50U3R5bGVVcmxzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IHRoaXMuZ2V0Q29tcG9uZW50U3R5bGVzKHByb3BzKSwgLy8gVE9ETyBmaXggYXJnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLmdldENvbXBvbmVudFRlbXBsYXRlKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogdGhpcy5nZXRDb21wb25lbnRUZW1wbGF0ZVVybChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld1Byb3ZpZGVyczogdGhpcy5nZXRDb21wb25lbnRWaWV3UHJvdmlkZXJzKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHNDbGFzczogSU8uaW5wdXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dHNDbGFzczogSU8ub3V0cHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzQ2xhc3M6IElPLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kc0NsYXNzOiBJTy5tZXRob2RzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kc0NsYXNzID0gY2xlYW5MaWZlY3ljbGVIb29rc0Zyb21NZXRob2RzKGRlcHMubWV0aG9kc0NsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmpzZG9jdGFncyA9IElPLmpzZG9jdGFnc1swXS50YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihJTy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuY29uc3RydWN0b3JPYmogPSBJTy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5leHRlbmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5leHRlbmRzID0gSU8uZXh0ZW5kcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5pbXBsZW1lbnRzICYmIElPLmltcGxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW1wbGVtZW50cyA9IElPLmltcGxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29tcG9uZW50c1RyZWVFbmdpbmUuYWRkQ29tcG9uZW50KGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snY29tcG9uZW50cyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0luamVjdGFibGUobWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogSU8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBJTy5tZXRob2RzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKElPLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5jb25zdHJ1Y3Rvck9iaiA9IElPLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snaW5qZWN0YWJsZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNQaXBlKG1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3BpcGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmpzZG9jdGFncyA9IElPLmpzZG9jdGFnc1swXS50YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydwaXBlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0RpcmVjdGl2ZShtZXRhZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHByb3BzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IElPLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiB0aGlzLmdldENvbXBvbmVudFNlbGVjdG9yKHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM6IHRoaXMuZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0NsYXNzOiBJTy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0c0NsYXNzOiBJTy5vdXRwdXRzLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc0NsYXNzOiBJTy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHNDbGFzczogSU8ubWV0aG9kc1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmpzZG9jdGFncyA9IElPLmpzZG9jdGFnc1swXS50YWdzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSU8uaW1wbGVtZW50cyAmJiBJTy5pbXBsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmltcGxlbWVudHMgPSBJTy5pbXBsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoSU8uY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmNvbnN0cnVjdG9yT2JqID0gSU8uY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydkaXJlY3RpdmVzJ10ucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fX2NhY2hlW25hbWVdID0gZGVwcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZmlsdGVyQnlEZWNvcmF0b3JzID0gKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC8oTmdNb2R1bGV8Q29tcG9uZW50fEluamVjdGFibGV8UGlwZXxEaXJlY3RpdmUpLy50ZXN0KG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBub2RlLmRlY29yYXRvcnNcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihmaWx0ZXJCeURlY29yYXRvcnMpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKHZpc2l0Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuc3ltYm9sLmZsYWdzID09PSB0cy5TeW1ib2xGbGFncy5DbGFzcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRoaXMuZ2V0U3ltYm9sZU5hbWUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0Q2xhc3NJTyhmaWxlLCBzcmNGaWxlLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmNvbnN0cnVjdG9yT2JqID0gSU8uY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5wcm9wZXJ0aWVzID0gSU8ucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IElPLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKElPLmV4dGVuZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZXh0ZW5kcyA9IElPLmV4dGVuZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKElPLmltcGxlbWVudHMgJiYgSU8uaW1wbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmltcGxlbWVudHMgPSBJTy5pbXBsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NsYXNzZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihub2RlLnN5bWJvbC5mbGFncyA9PT0gdHMuU3ltYm9sRmxhZ3MuSW50ZXJmYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5nZXRJbnRlcmZhY2VJTyhmaWxlLCBzcmNGaWxlLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ludGVyZmFjZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLmluZGV4U2lnbmF0dXJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5pbmRleFNpZ25hdHVyZXMgPSBJTy5pbmRleFNpZ25hdHVyZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8ua2luZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5raW5kID0gSU8ua2luZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IElPLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9sc1snaW50ZXJmYWNlcyddLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRnVuY3Rpb25EZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb3MgPSB0aGlzLnZpc2l0RnVuY3Rpb25EZWNsYXJhdGlvbihub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBpbmZvcy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mb3MuYXJncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5hcmdzID0gaW5mb3MuYXJncztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtaXNjZWxsYW5lb3VzJ10uZnVuY3Rpb25zLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRW51bURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvcyA9IHRoaXMudmlzaXRFbnVtRGVjbGFyYXRpb24obm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gbm9kZS5uYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzOiBpbmZvcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtaXNjZWxsYW5lb3VzJ10uZW51bWVyYXRpb25zLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldFJvdXRlSU8oZmlsZSwgc3JjRmlsZSk7XG4gICAgICAgICAgICAgICAgaWYoSU8ucm91dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdSb3V0ZXM7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3V0ZXMgPSBSb3V0ZXJQYXJzZXIuY2xlYW5SYXdSb3V0ZVBhcnNlZChJTy5yb3V0ZXMpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1JvdXRlcyBwYXJzaW5nIGVycm9yLCBtYXliZSBhIHRyYWlsaW5nIGNvbW1hIG9yIGFuIGV4dGVybmFsIHZhcmlhYmxlLCB0cnlpbmcgdG8gZml4IHRoYXQgbGF0ZXIgYWZ0ZXIgc291cmNlcyBzY2FubmluZy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1JvdXRlcyA9IElPLnJvdXRlcy5yZXBsYWNlKC8gL2dtLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5hZGRJbmNvbXBsZXRlUm91dGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG5ld1JvdXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ3JvdXRlcyddID0gWy4uLm91dHB1dFN5bWJvbHNbJ3JvdXRlcyddLCAuLi5uZXdSb3V0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENsYXNzSU8oZmlsZSwgc3JjRmlsZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZihJTy5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5jb25zdHJ1Y3Rvck9iaiA9IElPLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMucHJvcGVydGllcyA9IElPLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoSU8uaW5kZXhTaWduYXR1cmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmluZGV4U2lnbmF0dXJlcyA9IElPLmluZGV4U2lnbmF0dXJlcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihJTy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IElPLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKElPLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMubWV0aG9kcyA9IElPLm1ldGhvZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKElPLmV4dGVuZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZXh0ZW5kcyA9IElPLmV4dGVuZHM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKElPLmltcGxlbWVudHMgJiYgSU8uaW1wbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmltcGxlbWVudHMgPSBJTy5pbXBsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoZGVwcyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ2NsYXNzZXMnXS5wdXNoKGRlcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJvb3RzdHJhcE1vZHVsZVJlZmVyZW5jZSA9ICdib290c3RyYXBNb2R1bGUnO1xuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgdGhlIHJvb3QgbW9kdWxlIHdpdGggYm9vdHN0cmFwTW9kdWxlIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgLy8xLiBmaW5kIGEgc2ltcGxlIGNhbGwgOiBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vMi4gb3IgaW5zaWRlIGEgY2FsbCA6XG4gICAgICAgICAgICAgICAgICAgIC8vICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKS5ib290c3RyYXBNb2R1bGUoQXBwTW9kdWxlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vMy4gd2l0aCBhIGNhdGNoIDogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgLy80LiB3aXRoIHBhcmFtZXRlcnMgOiBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSwge30pLmNhdGNoKGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgLy9GaW5kIHJlY3VzaXZlbHkgaW4gZXhwcmVzc2lvbiBub2RlcyBvbmUgd2l0aCBuYW1lICdib290c3RyYXBNb2R1bGUnXG4gICAgICAgICAgICAgICAgICAgIGxldCByb290TW9kdWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNyY0ZpbGUudGV4dC5pbmRleE9mKGJvb3RzdHJhcE1vZHVsZVJlZmVyZW5jZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZSA9IHRoaXMuZmluZEV4cHJlc3Npb25CeU5hbWVJbkV4cHJlc3Npb25zKG5vZGUuZXhwcmVzc2lvbiwgJ2Jvb3RzdHJhcE1vZHVsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbiAmJiBub2RlLmV4cHJlc3Npb24uYXJndW1lbnRzICYmIG5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHROb2RlID0gdGhpcy5maW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbkFyZ3VtZW50cyhub2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLCAnYm9vdHN0cmFwTW9kdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzdWx0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlc3VsdE5vZGUuYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKHJlc3VsdE5vZGUuYXJndW1lbnRzLCBmdW5jdGlvbihhcmd1bWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJndW1lbnQudGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBhcmd1bWVudC50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLnNldFJvb3RNb2R1bGUocm9vdE1vZHVsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQgJiYgIXRoaXMuaXNWYXJpYWJsZVJvdXRlcyhub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb3MgPSB0aGlzLnZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbihub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBpbmZvcy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXBzLnR5cGUgPSAoaW5mb3MudHlwZSkgPyBpbmZvcy50eXBlIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvcy5kZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVmYXVsdFZhbHVlID0gaW5mb3MuZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmpzRG9jICYmIG5vZGUuanNEb2MubGVuZ3RoID4gMCAmJiBub2RlLmpzRG9jWzBdLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuZGVzY3JpcHRpb24gPSBtYXJrZWQobm9kZS5qc0RvY1swXS5jb21tZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtaXNjZWxsYW5lb3VzJ10udmFyaWFibGVzLnB1c2goZGVwcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVHlwZUFsaWFzRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zID0gdGhpcy52aXNpdFR5cGVEZWNsYXJhdGlvbihub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBpbmZvcy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICBkZXBzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzWydtaXNjZWxsYW5lb3VzJ10udHlwZXMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5GdW5jdGlvbkRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvcyA9IHRoaXMudmlzaXRGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGluZm9zLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGRlcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmZvcy5hcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmFyZ3MgPSBpbmZvcy5hcmdzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21pc2NlbGxhbmVvdXMnXS5mdW5jdGlvbnMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zID0gdGhpcy52aXNpdEVudW1EZWNsYXJhdGlvbihub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgZGVwcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHM6IGluZm9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHNbJ21pc2NlbGxhbmVvdXMnXS5lbnVtZXJhdGlvbnMucHVzaChkZXBzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICAgIHByaXZhdGUgZGVidWcoZGVwczogRGVwcykge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ2ZvdW5kJywgYCR7ZGVwcy5uYW1lfWApO1xuICAgICAgICBbXG4gICAgICAgICAgICAnaW1wb3J0cycsICdleHBvcnRzJywgJ2RlY2xhcmF0aW9ucycsICdwcm92aWRlcnMnLCAnYm9vdHN0cmFwJ1xuICAgICAgICBdLmZvckVhY2goc3ltYm9scyA9PiB7XG4gICAgICAgICAgICBpZiAoZGVwc1tzeW1ib2xzXSAmJiBkZXBzW3N5bWJvbHNdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJycsIGAtICR7c3ltYm9sc306YCk7XG4gICAgICAgICAgICAgICAgZGVwc1tzeW1ib2xzXS5tYXAoaSA9PiBpLm5hbWUpLmZvckVhY2goZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnJywgYFxcdC0gJHtkfWApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYXJpYWJsZVJvdXRlcyhub2RlKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgaWYoIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZSAmJiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZS50ZXh0ID09PSAnUm91dGVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZmluZEV4cHJlc3Npb25CeU5hbWVJbkV4cHJlc3Npb25zKGVudHJ5Tm9kZSwgbmFtZSkge1xuICAgICAgICBsZXQgcmVzdWx0LFxuICAgICAgICAgICAgbG9vcCA9IGZ1bmN0aW9uKG5vZGUsIG5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLmV4cHJlc3Npb24gJiYgIW5vZGUuZXhwcmVzc2lvbi5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvb3Aobm9kZS5leHByZXNzaW9uLCBuYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYobm9kZS5leHByZXNzaW9uICYmIG5vZGUuZXhwcmVzc2lvbi5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKG5vZGUuZXhwcmVzc2lvbi5uYW1lLnRleHQgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5vZGU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wKG5vZGUuZXhwcmVzc2lvbiwgbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGxvb3AoZW50cnlOb2RlLCBuYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRFeHByZXNzaW9uQnlOYW1lSW5FeHByZXNzaW9uQXJndW1lbnRzKGFyZywgbmFtZSkge1xuICAgICAgICBsZXQgcmVzdWx0LFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbiA9IGFyZy5sZW5ndGgsXG4gICAgICAgICAgICBsb29wID0gZnVuY3Rpb24obm9kZSwgbmFtZSkge1xuICAgICAgICAgICAgICAgIGlmKG5vZGUuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ib2R5LnN0YXRlbWVudHMgJiYgbm9kZS5ib2R5LnN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGogPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmcgPSBub2RlLmJvZHkuc3RhdGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGo7IGo8bGVuZzsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhhdC5maW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbnMobm9kZS5ib2R5LnN0YXRlbWVudHNbal0sIG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgbG9vcChhcmdbaV0sIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZURlY29yYXRvcnMoZGVjb3JhdG9ycywgdHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgaWYgKGRlY29yYXRvcnMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKGRlY29yYXRvcnMsIGZ1bmN0aW9uKGRlY29yYXRvcikge1xuICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkZWNvcmF0b3JzWzBdLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3JzWzBdLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0NvbXBvbmVudChtZXRhZGF0YXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWNvcmF0b3JzKG1ldGFkYXRhcywgJ0NvbXBvbmVudCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQaXBlKG1ldGFkYXRhcykge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlY29yYXRvcnMobWV0YWRhdGFzLCAnUGlwZScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNEaXJlY3RpdmUobWV0YWRhdGFzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVjb3JhdG9ycyhtZXRhZGF0YXMsICdEaXJlY3RpdmUnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSW5qZWN0YWJsZShtZXRhZGF0YXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWNvcmF0b3JzKG1ldGFkYXRhcywgJ0luamVjdGFibGUnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTW9kdWxlKG1ldGFkYXRhcykge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlY29yYXRvcnMobWV0YWRhdGFzLCAnTmdNb2R1bGUnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFR5cGUobmFtZSkge1xuICAgICAgICBsZXQgdHlwZTtcbiAgICAgICAgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjb21wb25lbnQnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ2NvbXBvbmVudCc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ3BpcGUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ3BpcGUnO1xuICAgICAgICB9IGVsc2UgaWYoIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdtb2R1bGUnKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICB0eXBlID0gJ21vZHVsZSc7XG4gICAgICAgIH0gZWxzZSBpZiggbmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2RpcmVjdGl2ZScpICE9PSAtMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSAnZGlyZWN0aXZlJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbGVOYW1lKG5vZGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3NlbGVjdG9yJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRFeHBvcnRBcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydEFzJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdwcm92aWRlcnMnKS5tYXAoKHByb3ZpZGVyTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIocHJvdmlkZXJOYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kUHJvcHModmlzaXRlZE5vZGUpIHtcbiAgICAgICAgaWYodmlzaXRlZE5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLnBvcCgpLnByb3BlcnRpZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZURlY2xhdGlvbnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdkZWNsYXJhdGlvbnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGxldCBjb21wb25lbnQgPSB0aGlzLmZpbmRDb21wb25lbnRTZWxlY3RvckJ5TmFtZShuYW1lKTtcblxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1vZHVsZUltcG9ydHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHNSYXcocHJvcHMsICdpbXBvcnRzJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVJbXBvcnRzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW1wb3J0cycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TW9kdWxlRXhwb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydHMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudEhvc3QocHJvcHM6IE5vZGVPYmplY3RbXSk6IE9iamVjdCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHNPYmplY3QocHJvcHMsICdob3N0Jyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRNb2R1bGVCb290c3RyYXAocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdib290c3RyYXAnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdpbnB1dHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERlY29yYXRvck9mVHlwZShub2RlLCBkZWNvcmF0b3JUeXBlKSB7XG4gICAgICB2YXIgZGVjb3JhdG9ycyA9IG5vZGUuZGVjb3JhdG9ycyB8fCBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWNvcmF0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGRlY29yYXRvcnNbaV0uZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgIGlmIChkZWNvcmF0b3JzW2ldLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSBkZWNvcmF0b3JUeXBlKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb3JhdG9yc1tpXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdElucHV0KHByb3BlcnR5LCBpbkRlY29yYXRvciwgc291cmNlRmlsZT8pIHtcbiAgICAgICAgdmFyIGluQXJncyA9IGluRGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzLFxuICAgICAgICBfcmV0dXJuID0ge1xuICAgICAgICAgICAgbmFtZTogaW5BcmdzLmxlbmd0aCA/IGluQXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSksXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKHByb3BlcnR5LCBzb3VyY2VGaWxlKS5saW5lICsgMVxuICAgICAgICB9O1xuICAgICAgICBpZiAocHJvcGVydHkudHlwZSkge1xuICAgICAgICAgICAgX3JldHVybi50eXBlID0gdGhpcy52aXNpdFR5cGUocHJvcGVydHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaGFuZGxlIE5ld0V4cHJlc3Npb25cbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLk5ld0V4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LmluaXRpYWxpemVyLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4udHlwZSA9IHByb3BlcnR5LmluaXRpYWxpemVyLmV4cHJlc3Npb24udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JldHVybjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0VHlwZShub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGxldCBfcmV0dXJuID0gJ3ZvaWQnO1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0gdGhpcy50eXBlQ2hlY2tlci50eXBlVG9TdHJpbmcodGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihub2RlKSlcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXR1cm47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdE91dHB1dChwcm9wZXJ0eSwgb3V0RGVjb3JhdG9yLCBzb3VyY2VGaWxlPykge1xuICAgICAgICB2YXIgb3V0QXJncyA9IG91dERlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50cyxcbiAgICAgICAgX3JldHVybiA9IHtcbiAgICAgICAgICAgIG5hbWU6IG91dEFyZ3MubGVuZ3RoID8gb3V0QXJnc1swXS50ZXh0IDogcHJvcGVydHkubmFtZS50ZXh0LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZChMaW5rUGFyc2VyLnJlc29sdmVMaW5rcyh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpKSxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMuZ2V0UG9zaXRpb24ocHJvcGVydHksIHNvdXJjZUZpbGUpLmxpbmUgKyAxXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwcm9wZXJ0eS50eXBlKSB7XG4gICAgICAgICAgICBfcmV0dXJuLnR5cGUgPSB0aGlzLnZpc2l0VHlwZShwcm9wZXJ0eSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBoYW5kbGUgTmV3RXhwcmVzc2lvblxuICAgICAgICAgICAgaWYgKHByb3BlcnR5LmluaXRpYWxpemVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LmluaXRpYWxpemVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTmV3RXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZXIuZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybi50eXBlID0gcHJvcGVydHkuaW5pdGlhbGl6ZXIuZXhwcmVzc2lvbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmV0dXJuO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNQdWJsaWMobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpc1B1YmxpYzogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpc1B1YmxpYykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlzSGlkZGVuTWVtYmVyKG1lbWJlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ByaXZhdGUobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpc1ByaXZhdGU6IGJvb2xlYW4gPSBtZW1iZXIubW9kaWZpZXJzLnNvbWUobW9kaWZpZXIgPT4gbW9kaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcml2YXRlS2V5d29yZCk7XG4gICAgICAgICAgICBpZiAoaXNQcml2YXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNIaWRkZW5NZW1iZXIobWVtYmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzSW50ZXJuYWwobWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGludGVybmFsVGFnczogc3RyaW5nW10gPSBbJ2ludGVybmFsJ107XG4gICAgICAgIGlmIChtZW1iZXIuanNEb2MpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZG9jIG9mIG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgICAgIGlmIChkb2MudGFncykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBkb2MudGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsVGFncy5pbmRleE9mKHRhZy50YWdOYW1lLnRleHQpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0hpZGRlbk1lbWJlcihtZW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaW50ZXJuYWxUYWdzOiBzdHJpbmdbXSA9IFsnaGlkZGVuJ107XG4gICAgICAgIGlmIChtZW1iZXIuanNEb2MpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZG9jIG9mIG1lbWJlci5qc0RvYykge1xuICAgICAgICAgICAgICAgIGlmIChkb2MudGFncykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBkb2MudGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsVGFncy5pbmRleE9mKHRhZy50YWdOYW1lLnRleHQpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0FuZ3VsYXJMaWZlY3ljbGVIb29rKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgQU5HVUxBUl9MSUZFQ1lDTEVfTUVUSE9EUyA9IFtcbiAgICAgICAgICAgICduZ09uSW5pdCcsICduZ09uQ2hhbmdlcycsICduZ0RvQ2hlY2snLCAnbmdPbkRlc3Ryb3knLCAnbmdBZnRlckNvbnRlbnRJbml0JywgJ25nQWZ0ZXJDb250ZW50Q2hlY2tlZCcsXG4gICAgICAgICAgICAnbmdBZnRlclZpZXdJbml0JywgJ25nQWZ0ZXJWaWV3Q2hlY2tlZCcsICd3cml0ZVZhbHVlJywgJ3JlZ2lzdGVyT25DaGFuZ2UnLCAncmVnaXN0ZXJPblRvdWNoZWQnLCAnc2V0RGlzYWJsZWRTdGF0ZSdcbiAgICAgICAgXTtcbiAgICAgICAgcmV0dXJuIEFOR1VMQVJfTElGRUNZQ0xFX01FVEhPRFMuaW5kZXhPZihtZXRob2ROYW1lKSA+PSAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDb25zdHJ1Y3RvckRlY2xhcmF0aW9uKG1ldGhvZCwgc291cmNlRmlsZT8pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIG5hbWU6ICdjb25zdHJ1Y3RvcicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxuICAgICAgICAgICAgbGluZTogdGhpcy5nZXRQb3NpdGlvbihtZXRob2QsIHNvdXJjZUZpbGUpLmxpbmUgKyAxXG4gICAgICAgIH0sXG4gICAgICAgICAgICBqc2RvY3RhZ3MgPSBKU0RvY1RhZ3NQYXJzZXIuZ2V0SlNEb2NzKG1ldGhvZCksXG5cbiAgICAgICAgICAgIG1hcmtlZHRhZ3MgPSBmdW5jdGlvbih0YWdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIG10YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICBfLmZvckVhY2gobXRhZ3MsICh0YWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGFnLmNvbW1lbnQgPSBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModGFnLmNvbW1lbnQpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbXRhZ3M7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChtZXRob2Quc3ltYm9sKSB7XG4gICAgICAgICAgICByZXN1bHQuZGVzY3JpcHRpb24gPSBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQubW9kaWZpZXJLaW5kID0gbWV0aG9kLm1vZGlmaWVyc1swXS5raW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWFya2VkdGFncyhqc2RvY3RhZ3NbMF0udGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0Q29uc3RydWN0b3JQcm9wZXJ0aWVzKG1ldGhvZCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlmIChtZXRob2QucGFyYW1ldGVycykge1xuICAgICAgICAgICAgdmFyIF9wYXJhbWV0ZXJzID0gW10sXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gbWV0aG9kLnBhcmFtZXRlcnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LmlzUHVibGljKG1ldGhvZC5wYXJhbWV0ZXJzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBfcGFyYW1ldGVycy5wdXNoKHRoYXQudmlzaXRBcmd1bWVudChtZXRob2QucGFyYW1ldGVyc1tpXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcGFyYW1ldGVycztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRDYWxsRGVjbGFyYXRpb24obWV0aG9kLCBzb3VyY2VGaWxlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWFya2VkKExpbmtQYXJzZXIucmVzb2x2ZUxpbmtzKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKG1ldGhvZC5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpKSxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSksXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRJbmRleERlY2xhcmF0aW9uKG1ldGhvZCwgc291cmNlRmlsZT8pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSkpLFxuICAgICAgICAgICAgYXJnczogbWV0aG9kLnBhcmFtZXRlcnMgPyBtZXRob2QucGFyYW1ldGVycy5tYXAoKHByb3ApID0+IHRoaXMudmlzaXRBcmd1bWVudChwcm9wKSkgOiBbXSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHRoaXMudmlzaXRUeXBlKG1ldGhvZC50eXBlKSxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMuZ2V0UG9zaXRpb24obWV0aG9kLCBzb3VyY2VGaWxlKS5saW5lICsgMVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRQb3NpdGlvbihub2RlLCBzb3VyY2VGaWxlKTogdHMuTGluZUFuZENoYXJhY3RlciB7XG4gICAgICAgIHZhciBwb3NpdGlvbjp0cy5MaW5lQW5kQ2hhcmFjdGVyO1xuICAgICAgICBpZiAobm9kZVsnbmFtZSddICYmIG5vZGVbJ25hbWUnXS5lbmQpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oc291cmNlRmlsZSwgbm9kZVsnbmFtZSddLmVuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKHNvdXJjZUZpbGUsIG5vZGUucG9zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdE1ldGhvZERlY2xhcmF0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgbmFtZTogbWV0aG9kLm5hbWUudGV4dCxcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSksXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGpzZG9jdGFncyA9IEpTRG9jVGFnc1BhcnNlci5nZXRKU0RvY3MobWV0aG9kKSxcblxuICAgICAgICAgICAgbWFya2VkdGFncyA9IGZ1bmN0aW9uKHRhZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgbXRhZ3MgPSB0YWdzO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChtdGFncywgKHRhZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0YWcuY29tbWVudCA9IG1hcmtlZChMaW5rUGFyc2VyLnJlc29sdmVMaW5rcyh0YWcuY29tbWVudCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBtdGFncztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKG1ldGhvZC5zeW1ib2wpIHtcbiAgICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IG1hcmtlZChMaW5rUGFyc2VyLnJlc29sdmVMaW5rcyh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgIHJlc3VsdC5kZWNvcmF0b3JzID0gdGhpcy5mb3JtYXREZWNvcmF0b3JzKG1ldGhvZC5kZWNvcmF0b3JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1vZGlmaWVyS2luZCA9IG1ldGhvZC5tb2RpZmllcnNbMF0ua2luZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1hcmtlZHRhZ3MoanNkb2N0YWdzWzBdLnRhZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdEFyZ3VtZW50KGFyZykge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogYXJnLm5hbWUudGV4dCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKGFyZylcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0TmFtZXNDb21wYXJlRm4obmFtZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBuYW1lID0gbmFtZSB8fCAnbmFtZSc7XG4gICAgICAgIHZhciB0ID0gKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmIChhW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFbbmFtZV0ubG9jYWxlQ29tcGFyZShiW25hbWVdKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdHJpbmdpZnlEZWZhdWx0VmFsdWUobm9kZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICBpZiAobm9kZS50ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS50ZXh0O1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5GYWxzZUtleXdvcmQpIHtcbiAgICAgICAgICAgIHJldHVybiAnZmFsc2UnO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZCkge1xuICAgICAgICAgICAgcmV0dXJuICd0cnVlJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZm9ybWF0RGVjb3JhdG9ycyhkZWNvcmF0b3JzKSB7XG4gICAgICAgIGxldCBfZGVjb3JhdG9ycyA9IFtdO1xuXG4gICAgICAgIF8uZm9yRWFjaChkZWNvcmF0b3JzLCAoZGVjb3JhdG9yKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBfZGVjb3JhdG9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGRlY29yYXRvci5leHByZXNzaW9uLnRleHRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmZvID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24uYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uYXJncyA9IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24uYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF9kZWNvcmF0b3JzLnB1c2goaW5mbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gX2RlY29yYXRvcnM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aXNpdFByb3BlcnR5KHByb3BlcnR5LCBzb3VyY2VGaWxlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgIG5hbWU6IHByb3BlcnR5Lm5hbWUudGV4dCxcbiAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgIHR5cGU6IHRoaXMudmlzaXRUeXBlKHByb3BlcnR5KSxcbiAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICAgICAgICAgbGluZTogdGhpcy5nZXRQb3NpdGlvbihwcm9wZXJ0eSwgc291cmNlRmlsZSkubGluZSArIDFcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKHByb3BlcnR5LnN5bWJvbCkge1xuICAgICAgICAgICAgIHJlc3VsdC5kZXNjcmlwdGlvbiA9IG1hcmtlZChMaW5rUGFyc2VyLnJlc29sdmVMaW5rcyh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKHByb3BlcnR5LmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICByZXN1bHQuZGVjb3JhdG9ycyA9IHRoaXMuZm9ybWF0RGVjb3JhdG9ycyhwcm9wZXJ0eS5kZWNvcmF0b3JzKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKHByb3BlcnR5Lm1vZGlmaWVycykge1xuICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICByZXN1bHQubW9kaWZpZXJLaW5kID0gcHJvcGVydHkubW9kaWZpZXJzWzBdLmtpbmQ7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0TWVtYmVycyhtZW1iZXJzLCBzb3VyY2VGaWxlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBpbnB1dHMgPSBbXSxcbiAgICAgICAgICAgIG91dHB1dHMgPSBbXSxcbiAgICAgICAgICAgIG1ldGhvZHMgPSBbXSxcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSBbXSxcbiAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlcyA9IFtdLFxuICAgICAgICAgICAga2luZCxcbiAgICAgICAgICAgIGlucHV0RGVjb3JhdG9yLFxuICAgICAgICAgICAgY29uc3RydWN0b3IsXG4gICAgICAgICAgICBvdXREZWNvcmF0b3I7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZW1iZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpbnB1dERlY29yYXRvciA9IHRoaXMuZ2V0RGVjb3JhdG9yT2ZUeXBlKG1lbWJlcnNbaV0sICdJbnB1dCcpO1xuICAgICAgICAgICAgb3V0RGVjb3JhdG9yID0gdGhpcy5nZXREZWNvcmF0b3JPZlR5cGUobWVtYmVyc1tpXSwgJ091dHB1dCcpO1xuXG4gICAgICAgICAgICBraW5kID0gbWVtYmVyc1tpXS5raW5kO1xuXG4gICAgICAgICAgICBpZiAoaW5wdXREZWNvcmF0b3IpIHtcbiAgICAgICAgICAgICAgICBpbnB1dHMucHVzaCh0aGlzLnZpc2l0SW5wdXQobWVtYmVyc1tpXSwgaW5wdXREZWNvcmF0b3IsIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3V0RGVjb3JhdG9yKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0cy5wdXNoKHRoaXMudmlzaXRPdXRwdXQobWVtYmVyc1tpXSwgb3V0RGVjb3JhdG9yLCBzb3VyY2VGaWxlKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzSGlkZGVuTWVtYmVyKG1lbWJlcnNbaV0pKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoICh0aGlzLmlzUHJpdmF0ZShtZW1iZXJzW2ldKSB8fCB0aGlzLmlzSW50ZXJuYWwobWVtYmVyc1tpXSkpICYmIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0KSB7fSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTWV0aG9kRGVjbGFyYXRpb24gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2RTaWduYXR1cmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzLnB1c2godGhpcy52aXNpdE1ldGhvZERlY2xhcmF0aW9uKG1lbWJlcnNbaV0sIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlTaWduYXR1cmUgfHwgbWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkdldEFjY2Vzc29yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdFByb3BlcnR5KG1lbWJlcnNbaV0sIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2FsbFNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKHRoaXMudmlzaXRDYWxsRGVjbGFyYXRpb24obWVtYmVyc1tpXSwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbmRleFNpZ25hdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzLnB1c2godGhpcy52aXNpdEluZGV4RGVjbGFyYXRpb24obWVtYmVyc1tpXSwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Db25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IF9jb25zdHJ1Y3RvclByb3BlcnRpZXMgPSB0aGlzLnZpc2l0Q29uc3RydWN0b3JQcm9wZXJ0aWVzKG1lbWJlcnNbaV0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGogPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbiA9IF9jb25zdHJ1Y3RvclByb3BlcnRpZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGo7IGo8bGVuOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2goX2NvbnN0cnVjdG9yUHJvcGVydGllc1tqXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvciA9IHRoaXMudmlzaXRDb25zdHJ1Y3RvckRlY2xhcmF0aW9uKG1lbWJlcnNbaV0sIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW5wdXRzLnNvcnQodGhpcy5nZXROYW1lc0NvbXBhcmVGbigpKTtcbiAgICAgICAgb3V0cHV0cy5zb3J0KHRoaXMuZ2V0TmFtZXNDb21wYXJlRm4oKSk7XG4gICAgICAgIHByb3BlcnRpZXMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuICAgICAgICBpbmRleFNpZ25hdHVyZXMuc29ydCh0aGlzLmdldE5hbWVzQ29tcGFyZUZuKCkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgbWV0aG9kcyxcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgICAgICBpbmRleFNpZ25hdHVyZXMsXG4gICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgY29uc3RydWN0b3JcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RGlyZWN0aXZlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc2VsZWN0b3I7XG4gICAgICAgIHZhciBleHBvcnRBcztcbiAgICAgICAgdmFyIHByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzWzBdLnByb3BlcnRpZXM7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzW2ldLm5hbWUudGV4dCA9PT0gJ3NlbGVjdG9yJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgb25seSB3b3JrIGlmIHNlbGVjdG9yIGlzIGluaXRpYWxpemVkIGFzIGEgc3RyaW5nIGxpdGVyYWxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBwcm9wZXJ0aWVzW2ldLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzW2ldLm5hbWUudGV4dCA9PT0gJ2V4cG9ydEFzJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgb25seSB3b3JrIGlmIHNlbGVjdG9yIGlzIGluaXRpYWxpemVkIGFzIGEgc3RyaW5nIGxpdGVyYWxcbiAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXMgPSBwcm9wZXJ0aWVzW2ldLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgICAgZXhwb3J0QXNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUGlwZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSA/IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ1BpcGUnIDogZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc01vZHVsZURlY29yYXRvcihkZWNvcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSA/IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ05nTW9kdWxlJyA6IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNEaXJlY3RpdmVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XG4gICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICB2YXIgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgICAgICByZXR1cm4gZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPT09ICdEaXJlY3RpdmUnIHx8IGRlY29yYXRvcklkZW50aWZpZXJUZXh0ID09PSAnQ29tcG9uZW50JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaXNTZXJ2aWNlRGVjb3JhdG9yKGRlY29yYXRvcikge1xuICAgICAgICByZXR1cm4gKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24pID8gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnSW5qZWN0YWJsZScgOiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0Q2xhc3NEZWNsYXJhdGlvbihmaWxlTmFtZSwgY2xhc3NEZWNsYXJhdGlvbiwgc291cmNlRmlsZT8pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHN5bWJvbCA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihjbGFzc0RlY2xhcmF0aW9uLm5hbWUpO1xuICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSAnJztcbiAgICAgICAgaWYgKHN5bWJvbCkge1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModHMuZGlzcGxheVBhcnRzVG9TdHJpbmcoc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzRGVjbGFyYXRpb24ubmFtZS50ZXh0O1xuICAgICAgICB2YXIgZGlyZWN0aXZlSW5mbztcbiAgICAgICAgdmFyIG1lbWJlcnM7XG4gICAgICAgIHZhciBpbXBsZW1lbnRzRWxlbWVudHMgPSBbXTtcbiAgICAgICAgdmFyIGV4dGVuZHNFbGVtZW50O1xuICAgICAgICB2YXIganNkb2N0YWdzID0gW107XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0cy5nZXRDbGFzc0ltcGxlbWVudHNIZXJpdGFnZUNsYXVzZUVsZW1lbnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdmFyIGltcGxlbWVudGVkVHlwZXMgPSB0cy5nZXRDbGFzc0ltcGxlbWVudHNIZXJpdGFnZUNsYXVzZUVsZW1lbnRzKGNsYXNzRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgaWYgKGltcGxlbWVudGVkVHlwZXMpIHtcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGxlbiA9IGltcGxlbWVudGVkVHlwZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbXBsZW1lbnRlZFR5cGVzW2ldLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcGxlbWVudHNFbGVtZW50cy5wdXNoKGltcGxlbWVudGVkVHlwZXNbaV0uZXhwcmVzc2lvbi50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgdHMuZ2V0Q2xhc3NFeHRlbmRzSGVyaXRhZ2VDbGF1c2VFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdmFyIGV4dGVuZHNUeXBlcyA9IHRzLmdldENsYXNzRXh0ZW5kc0hlcml0YWdlQ2xhdXNlRWxlbWVudChjbGFzc0RlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGlmIChleHRlbmRzVHlwZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5kc1R5cGVzLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kc0VsZW1lbnQgPSBleHRlbmRzVHlwZXMuZXhwcmVzc2lvbi50ZXh0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN5bWJvbCkge1xuICAgICAgICAgICAgaWYgKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAganNkb2N0YWdzID0gSlNEb2NUYWdzUGFyc2VyLmdldEpTRG9jcyhzeW1ib2wudmFsdWVEZWNsYXJhdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRGlyZWN0aXZlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5mbyA9IHRoaXMudmlzaXREaXJlY3RpdmVEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycywgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0czogbWVtYmVycy5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBtZW1iZXJzLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleFNpZ25hdHVyZXM6IG1lbWJlcnMuaW5kZXhTaWduYXR1cmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3I6IG1lbWJlcnMuY29uc3RydWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBqc2RvY3RhZ3M6IGpzZG9jdGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c0VsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzU2VydmljZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleFNpZ25hdHVyZXM6IG1lbWJlcnMuaW5kZXhTaWduYXR1cmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3I6IG1lbWJlcnMuY29uc3RydWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBleHRlbmRzRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNFbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNQaXBlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkgfHwgdGhpcy5pc01vZHVsZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzZG9jdGFnczoganNkb2N0YWdzXG4gICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2N1c3RvbSBkZWNvcmF0b3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXG4gICAgICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzOiBtZW1iZXJzLmluZGV4U2lnbmF0dXJlcyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kLFxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBtZW1iZXJzLmNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNFbGVtZW50LFxuICAgICAgICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNFbGVtZW50c1xuICAgICAgICAgICAgfV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzLCBzb3VyY2VGaWxlKTtcblxuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxuICAgICAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlczogbWVtYmVycy5pbmRleFNpZ25hdHVyZXMsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZCxcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcjogbWVtYmVycy5jb25zdHJ1Y3RvcixcbiAgICAgICAgICAgICAgICBleHRlbmRzOiBleHRlbmRzRWxlbWVudCxcbiAgICAgICAgICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzRWxlbWVudHNcbiAgICAgICAgICAgIH1dO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRUeXBlRGVjbGFyYXRpb24odHlwZSkge1xuICAgICAgICB2YXIgcmVzdWx0OmFueSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiB0eXBlLm5hbWUudGV4dFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGpzZG9jdGFncyA9IEpTRG9jVGFnc1BhcnNlci5nZXRKU0RvY3ModHlwZSk7XG5cbiAgICAgICAgdmFyIG1hcmtlZHRhZ3MgPSBmdW5jdGlvbih0YWdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIG10YWdzID0gdGFncztcbiAgICAgICAgICAgICAgICBfLmZvckVhY2gobXRhZ3MsICh0YWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGFnLmNvbW1lbnQgPSBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModGFnLmNvbW1lbnQpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbXRhZ3M7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWFya2VkdGFncyhqc2RvY3RhZ3NbMF0udGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RnVuY3Rpb25EZWNsYXJhdGlvbihtZXRob2QpIHtcbiAgICAgICAgbGV0IG1hcFR5cGVzID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSA5NDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdOdWxsJztcbiAgICAgICAgICAgICAgICBjYXNlIDExODpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdBbnknO1xuICAgICAgICAgICAgICAgIGNhc2UgMTIxOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0Jvb2xlYW4nO1xuICAgICAgICAgICAgICAgIGNhc2UgMTI5OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ05ldmVyJztcbiAgICAgICAgICAgICAgICBjYXNlIDEzMjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdOdW1iZXInO1xuICAgICAgICAgICAgICAgIGNhc2UgMTM0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1N0cmluZyc7XG4gICAgICAgICAgICAgICAgY2FzZSAxMzc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnVW5kZWZpbmVkJztcbiAgICAgICAgICAgICAgICBjYXNlIDE1NzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdUeXBlUmVmZXJlbmNlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlzaXRBcmd1bWVudCA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdDogYW55ID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGFyZy5uYW1lLnRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoYXJnLnR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudHlwZSA9IG1hcFR5cGVzKGFyZy50eXBlLmtpbmQpO1xuICAgICAgICAgICAgICAgIGlmIChhcmcudHlwZS5raW5kID09PSAxNTcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy90cnkgcmVwbGFjZSBUeXBlUmVmZXJlbmNlIHdpdGggdHlwZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZy50eXBlLnR5cGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQudHlwZSA9IGFyZy50eXBlLnR5cGVOYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdDphbnkgPSB7XG4gICAgICAgICAgICBuYW1lOiBtZXRob2QubmFtZS50ZXh0LFxuICAgICAgICAgICAgYXJnczogbWV0aG9kLnBhcmFtZXRlcnMgPyBtZXRob2QucGFyYW1ldGVycy5tYXAoKHByb3ApID0+IHZpc2l0QXJndW1lbnQocHJvcCkpIDogW11cbiAgICAgICAgfSxcbiAgICAgICAganNkb2N0YWdzID0gSlNEb2NUYWdzUGFyc2VyLmdldEpTRG9jcyhtZXRob2QpO1xuXG4gICAgICAgIHZhciBtYXJrZWR0YWdzID0gZnVuY3Rpb24odGFncykge1xuICAgICAgICAgICAgICAgIHZhciBtdGFncyA9IHRhZ3M7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKG10YWdzLCAodGFnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0gbWFya2VkKExpbmtQYXJzZXIucmVzb2x2ZUxpbmtzKHRhZy5jb21tZW50KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG10YWdzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZC50eXBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzdWx0LnJldHVyblR5cGUgPSB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVycykge1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5tb2RpZmllcktpbmQgPSBtZXRob2QubW9kaWZpZXJzWzBdLmtpbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcbiAgICAgICAgICAgIGlmIChqc2RvY3RhZ3NbMF0udGFncykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgaWYoIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0ubmFtZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5pbml0aWFsaXplcikgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSB0aGlzLnZpc2l0VHlwZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpc2l0RW51bURlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFtdLFxuICAgICAgICBpZiggbm9kZS5tZW1iZXJzICkge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IG5vZGUubWVtYmVycy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBtZW1iZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUubWVtYmVyc1tpXS5uYW1lLnRleHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubWVtYmVyc1tpXS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXIudmFsdWUgPSBub2RlLm1lbWJlcnNbaV0uaW5pdGlhbGl6ZXIudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobWVtYmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlzaXRFbnVtRGVjbGFyYXRpb25Gb3JSb3V0ZXMoZmlsZU5hbWUsIG5vZGUpIHtcbiAgICAgICAgaWYoIG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucyApIHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZihub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZSAmJiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZS50ZXh0ID09PSAnUm91dGVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBnZW5lcmF0ZShub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkUm91dGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5uYW1lLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogUm91dGVyUGFyc2VyLmNsZWFuUmF3Um91dGUoZGF0YSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVzOiBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSb3V0ZUlPKGZpbGVuYW1lLCBzb3VyY2VGaWxlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlLmNvbmNhdCh0aGlzLnZpc2l0RW51bURlY2xhcmF0aW9uRm9yUm91dGVzKGZpbGVuYW1lLCBzdGF0ZW1lbnQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudElPKGZpbGVuYW1lOiBzdHJpbmcsIHNvdXJjZUZpbGUsIG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5wb3MgPT09IG5vZGUucG9zICYmIHN0YXRlbWVudC5lbmQgPT09IG5vZGUuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQsIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDbGFzc0lPKGZpbGVuYW1lOiBzdHJpbmcsIHNvdXJjZUZpbGUsIG5vZGUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5wb3MgPT09IG5vZGUucG9zICYmIHN0YXRlbWVudC5lbmQgPT09IG5vZGUuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQsIHNvdXJjZUZpbGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIH0sIFtdKVxuXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbnRlcmZhY2VJTyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlLCBub2RlKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVtZW50LnBvcyA9PT0gbm9kZS5wb3MgJiYgc3RhdGVtZW50LmVuZCA9PT0gbm9kZS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCwgc291cmNlRmlsZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfSwgW10pXG5cbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudE91dHB1dHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ291dHB1dHMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFByb3ZpZGVycyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3Byb3ZpZGVycycpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50Vmlld1Byb3ZpZGVycyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3ZpZXdQcm92aWRlcnMnKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudERpcmVjdGl2ZXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdkaXJlY3RpdmVzJykubWFwKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHRoaXMucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSk7XG4gICAgICAgICAgICBpZGVudGlmaWVyLnNlbGVjdG9yID0gdGhpcy5maW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZSk7XG4gICAgICAgICAgICBpZGVudGlmaWVyLmxhYmVsID0gJyc7XG4gICAgICAgICAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZURlZXBJbmRlbnRpZmllcihuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBsZXQgbnNNb2R1bGUgPSBuYW1lLnNwbGl0KCcuJyksXG4gICAgICAgICAgICB0eXBlID0gdGhpcy5nZXRUeXBlKG5hbWUpO1xuICAgICAgICBpZiAobnNNb2R1bGUubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICAvLyBjYWNoZSBkZXBzIHdpdGggdGhlIHNhbWUgbmFtZXNwYWNlIChpLmUgU2hhcmVkLiopXG4gICAgICAgICAgICBpZiAodGhpcy5fX25zTW9kdWxlW25zTW9kdWxlWzBdXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19uc01vZHVsZVtuc01vZHVsZVswXV0ucHVzaChuYW1lKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX25zTW9kdWxlW25zTW9kdWxlWzBdXSA9IFtuYW1lXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuczogbnNNb2R1bGVbMF0sXG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB0eXBlOiB0eXBlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRUZW1wbGF0ZVVybChwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAndGVtcGxhdGVVcmwnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbXBvbmVudFRlbXBsYXRlKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICBsZXQgdCA9IHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3RlbXBsYXRlJywgdHJ1ZSkucG9wKClcbiAgICAgICAgaWYodCkge1xuICAgICAgICAgICAgdCA9IGRldGVjdEluZGVudCh0LCAwKTtcbiAgICAgICAgICAgIHQgPSB0LnJlcGxhY2UoL1xcbi8sICcnKTtcbiAgICAgICAgICAgIHQgPSB0LnJlcGxhY2UoLyArJC9nbSwgJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50U3R5bGVVcmxzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhbml0aXplVXJscyh0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdzdHlsZVVybHMnKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRTdHlsZXMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3N0eWxlcycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50TW9kdWxlSWQocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdtb2R1bGVJZCcpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q29tcG9uZW50Q2hhbmdlRGV0ZWN0aW9uKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTeW1ib2xEZXBzKHByb3BzLCAnY2hhbmdlRGV0ZWN0aW9uJykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRFbmNhcHN1bGF0aW9uKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN5bWJvbERlcHMocHJvcHMsICdlbmNhcHN1bGF0aW9uJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzYW5pdGl6ZVVybHModXJsczogc3RyaW5nW10pIHtcbiAgICAgICAgcmV0dXJuIHVybHMubWFwKHVybCA9PiB1cmwucmVwbGFjZSgnLi8nLCAnJykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3ltYm9sRGVwc09iamVjdChwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBPYmplY3Qge1xuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcGFyc2VQcm9wZXJ0aWVzID0gKG5vZGU6IE5vZGVPYmplY3QpOiBPYmplY3QgPT4ge1xuICAgICAgICAgICAgbGV0IG9iaiA9IHt9O1xuICAgICAgICAgICAgKG5vZGUuaW5pdGlhbGl6ZXIucHJvcGVydGllcyB8fCBbXSkuZm9yRWFjaCgocHJvcDogTm9kZU9iamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIG9ialtwcm9wLm5hbWUudGV4dF0gPSBwcm9wLmluaXRpYWxpemVyLnRleHQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGRlcHMubWFwKHBhcnNlUHJvcGVydGllcykucG9wKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW1ib2xEZXBzUmF3KHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IGFueSB7XG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVwcyB8fCBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFN5bWJvbERlcHMocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogc3RyaW5nW10ge1xuXG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBwYXJzZVN5bWJvbFRleHQgPSAodGV4dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgIF07XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGJ1aWxkSWRlbnRpZmllck5hbWUgPSAobm9kZTogTm9kZU9iamVjdCwgbmFtZSA9ICcnKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZSA/IGAuJHtuYW1lfWAgOiBuYW1lO1xuXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVOYW1lID0gdGhpcy51bmtub3duO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLmV4cHJlc3Npb24pIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5leHByZXNzaW9uLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihub2RlLmV4cHJlc3Npb24uZWxlbWVudHMpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbi5raW5kID09PSB0cy5TeW50YXhLaW5kLkFycmF5TGl0ZXJhbEV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi5lbGVtZW50cy5tYXAoIGVsID0+IGVsLnRleHQgKS5qb2luKCcsICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gYFske25vZGVOYW1lfV1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSAgdHMuU3ludGF4S2luZC5TcHJlYWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgLi4uJHtub2RlTmFtZX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7YnVpbGRJZGVudGlmaWVyTmFtZShub2RlLmV4cHJlc3Npb24sIG5vZGVOYW1lKX0ke25hbWV9YFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYCR7bm9kZS50ZXh0fS4ke25hbWV9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbiA9IChvOiBOb2RlT2JqZWN0KTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgIC8vIHBhcnNlIGV4cHJlc3Npb25zIHN1Y2ggYXM6XG4gICAgICAgICAgICAvLyB7IHByb3ZpZGU6IEFQUF9CQVNFX0hSRUYsIHVzZVZhbHVlOiAnLycgfSxcbiAgICAgICAgICAgIC8vIG9yXG4gICAgICAgICAgICAvLyB7IHByb3ZpZGU6ICdEYXRlJywgdXNlRmFjdG9yeTogKGQxLCBkMikgPT4gbmV3IERhdGUoKSwgZGVwczogWydkMScsICdkMiddIH1cblxuICAgICAgICAgICAgbGV0IF9nZW5Qcm92aWRlck5hbWU6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBsZXQgX3Byb3ZpZGVyUHJvcHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgICAgIChvLnByb3BlcnRpZXMgfHwgW10pLmZvckVhY2goKHByb3A6IE5vZGVPYmplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCBpZGVudGlmaWVyID0gcHJvcC5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgICAgIGlmIChwcm9wLmluaXRpYWxpemVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyID0gYCcke2lkZW50aWZpZXJ9J2A7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gbGFtYmRhIGZ1bmN0aW9uIChpLmUgdXNlRmFjdG9yeSlcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5ib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbXMgPSAocHJvcC5pbml0aWFsaXplci5wYXJhbWV0ZXJzIHx8IDxhbnk+W10pLm1hcCgocGFyYW1zOiBOb2RlT2JqZWN0KSA9PiBwYXJhbXMubmFtZS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAoJHtwYXJhbXMuam9pbignLCAnKX0pID0+IHt9YDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBmYWN0b3J5IGRlcHMgYXJyYXlcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbGVtZW50cyA9IChwcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzIHx8IFtdKS5tYXAoKG46IE5vZGVPYmplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAnJHtuLnRleHR9J2A7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyID0gYFske2VsZW1lbnRzLmpvaW4oJywgJyl9XWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgX3Byb3ZpZGVyUHJvcHMucHVzaChbXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lIHByb3ZpZGVcbiAgICAgICAgICAgICAgICAgICAgcHJvcC5uYW1lLnRleHQsXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lIE9wYXF1ZVRva2VuIG9yICdTdHJpbmdUb2tlbidcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllclxuXG4gICAgICAgICAgICAgICAgXS5qb2luKCc6ICcpKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBgeyAke19wcm92aWRlclByb3BzLmpvaW4oJywgJyl9IH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhcnNlU3ltYm9sRWxlbWVudHMgPSAobzogTm9kZU9iamVjdCB8IGFueSk6IHN0cmluZyA9PiB7XG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOiBBbmd1bGFyRmlyZU1vZHVsZS5pbml0aWFsaXplQXBwKGZpcmViYXNlQ29uZmlnKVxuICAgICAgICAgICAgaWYgKG8uYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGJ1aWxkSWRlbnRpZmllck5hbWUoby5leHByZXNzaW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIGZ1bmN0aW9uIGFyZ3VtZW50cyBjb3VsZCBiZSByZWFsbHkgY29tcGxleGUuIFRoZXJlIGFyZSBzb1xuICAgICAgICAgICAgICAgIC8vIG1hbnkgdXNlIGNhc2VzIHRoYXQgd2UgY2FuJ3QgaGFuZGxlLiBKdXN0IHByaW50IFwiYXJnc1wiIHRvIGluZGljYXRlXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB3ZSBoYXZlIGFyZ3VtZW50cy5cblxuICAgICAgICAgICAgICAgIGxldCBmdW5jdGlvbkFyZ3MgPSBvLmFyZ3VtZW50cy5sZW5ndGggPiAwID8gJ2FyZ3MnIDogJyc7XG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSBgJHtjbGFzc05hbWV9KCR7ZnVuY3Rpb25BcmdzfSlgO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwYXJzZSBleHByZXNzaW9ucyBzdWNoIGFzOiBTaGFyZWQuTW9kdWxlXG4gICAgICAgICAgICBlbHNlIGlmIChvLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IGJ1aWxkSWRlbnRpZmllck5hbWUobyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvLnRleHQgPyBvLnRleHQgOiBwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbihvKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xzID0gKG5vZGU6IE5vZGVPYmplY3QpOiBzdHJpbmdbXSA9PiB7XG5cbiAgICAgICAgICAgIGxldCB0ZXh0ID0gbm9kZS5pbml0aWFsaXplci50ZXh0O1xuICAgICAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VTeW1ib2xUZXh0KHRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLmluaXRpYWxpemVyLmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHBhcnNlU3ltYm9sRWxlbWVudHMobm9kZS5pbml0aWFsaXplcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllclxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5pbml0aWFsaXplci5lbGVtZW50cy5tYXAocGFyc2VTeW1ib2xFbGVtZW50cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGRlcHMubWFwKHBhcnNlU3ltYm9scykucG9wKCkgfHwgW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kQ29tcG9uZW50U2VsZWN0b3JCeU5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fY2FjaGVbbmFtZV07XG4gICAgfVxuXG59XG4iLCJleHBvcnQgZnVuY3Rpb24gcHJvbWlzZVNlcXVlbnRpYWwocHJvbWlzZXMpIHtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9taXNlcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkIHRvIGJlIGFuIGFycmF5IG9mIFByb21pc2VzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBsZXQgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgIGNvbnN0IGl0ZXJhdGVlRnVuYyA9IChwcmV2aW91c1Byb21pc2UsIGN1cnJlbnRQcm9taXNlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCsrICE9PSAwKSByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRQcm9taXNlKHJlc3VsdCwgcmVzdWx0cywgY291bnQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZXMgPSBwcm9taXNlcy5jb25jYXQoKCkgPT4gUHJvbWlzZS5yZXNvbHZlKCkpO1xuXG4gICAgICAgIHByb21pc2VzXG4gICAgICAgICAgICAucmVkdWNlKGl0ZXJhdGVlRnVuYywgUHJvbWlzZS5yZXNvbHZlKGZhbHNlKSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgICAgICB9KVxuXG4gICAgfSk7XG59O1xuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgTGl2ZVNlcnZlciBmcm9tICdsaXZlLXNlcnZlcic7XG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IHsgSHRtbEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9odG1sLmVuZ2luZSc7XG5pbXBvcnQgeyBNYXJrZG93bkVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9tYXJrZG93bi5lbmdpbmUnO1xuaW1wb3J0IHsgRmlsZUVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9maWxlLmVuZ2luZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25JbnRlcmZhY2UgfSBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgJGRlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9kZXBlbmRlbmNpZXMuZW5naW5lJztcbmltcG9ydCB7IE5nZEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9uZ2QuZW5naW5lJztcbmltcG9ydCB7IFNlYXJjaEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9zZWFyY2guZW5naW5lJztcbmltcG9ydCB7IERlcGVuZGVuY2llcyB9IGZyb20gJy4vY29tcGlsZXIvZGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IFJvdXRlclBhcnNlciB9IGZyb20gJy4uL3V0aWxzL3JvdXRlci5wYXJzZXInO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4uL3V0aWxzL2RlZmF1bHRzJztcblxuaW1wb3J0IHsgZ2V0QW5ndWxhclZlcnNpb25PZlByb2plY3QgfSBmcm9tICcuLi91dGlscy9hbmd1bGFyLXZlcnNpb24nO1xuXG5pbXBvcnQgeyBjbGVhbk5hbWVXaXRob3V0U3BhY2VBbmRUb0xvd2VyQ2FzZSwgZmluZE1haW5Tb3VyY2VGb2xkZXIgfSBmcm9tICcuLi91dGlsaXRpZXMnO1xuXG5pbXBvcnQgeyBwcm9taXNlU2VxdWVudGlhbCB9IGZyb20gJy4uL3V0aWxzL3Byb21pc2Utc2VxdWVudGlhbCc7XG5cbmNvbnN0IGdsb2I6IGFueSA9IHJlcXVpcmUoJ2dsb2InKSxcbiAgICAgIG1hcmtlZCA9IHJlcXVpcmUoJ21hcmtlZCcpLFxuICAgICAgY2hva2lkYXIgPSByZXF1aXJlKCdjaG9raWRhcicpO1xuXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyksXG4gICAgY3dkID0gcHJvY2Vzcy5jd2QoKSxcbiAgICAkaHRtbGVuZ2luZSA9IG5ldyBIdG1sRW5naW5lKCksXG4gICAgJGZpbGVlbmdpbmUgPSBuZXcgRmlsZUVuZ2luZSgpLFxuICAgICRtYXJrZG93bmVuZ2luZSA9IG5ldyBNYXJrZG93bkVuZ2luZSgpLFxuICAgICRuZ2RlbmdpbmUgPSBuZXcgTmdkRW5naW5lKCksXG4gICAgJHNlYXJjaEVuZ2luZSA9IG5ldyBTZWFyY2hFbmdpbmUoKSxcbiAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpXG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbiB7XG4gICAgLyoqXG4gICAgICogRmlsZXMgcHJvY2Vzc2VkIGR1cmluZyBpbml0aWFsIHNjYW5uaW5nXG4gICAgICovXG4gICAgZmlsZXM6IEFycmF5PHN0cmluZz47XG4gICAgLyoqXG4gICAgICogRmlsZXMgcHJvY2Vzc2VkIGR1cmluZyB3YXRjaCBzY2FubmluZ1xuICAgICAqL1xuICAgIHVwZGF0ZWRGaWxlczogQXJyYXk8c3RyaW5nPjtcbiAgICAvKipcbiAgICAgKiBDb21wb2RvYyBjb25maWd1cmF0aW9uIGxvY2FsIHJlZmVyZW5jZVxuICAgICAqL1xuICAgIGNvbmZpZ3VyYXRpb246Q29uZmlndXJhdGlvbkludGVyZmFjZTtcbiAgICAvKipcbiAgICAgKiBCb29sZWFuIGZvciB3YXRjaGluZyBzdGF0dXNcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1dhdGNoaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgY29tcG9kb2MgYXBwbGljYXRpb24gaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgb3B0aW9ucyB0aGF0IHNob3VsZCBiZSB1c2VkLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM/Ok9iamVjdCkge1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uLmdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIG9wdGlvbnMgKSB7XG4gICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhW29wdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhW29wdGlvbl0gPSBvcHRpb25zW29wdGlvbl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3IgZG9jdW1lbnRhdGlvbk1haW5OYW1lLCBwcm9jZXNzIGl0IG91dHNpZGUgdGhlIGxvb3AsIGZvciBoYW5kbGluZyBjb25mbGljdCB3aXRoIHBhZ2VzIG5hbWVcbiAgICAgICAgICAgIGlmKG9wdGlvbiA9PT0gJ25hbWUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhWydkb2N1bWVudGF0aW9uTWFpbk5hbWUnXSA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZvciBkb2N1bWVudGF0aW9uTWFpbk5hbWUsIHByb2Nlc3MgaXQgb3V0c2lkZSB0aGUgbG9vcCwgZm9yIGhhbmRsaW5nIGNvbmZsaWN0IHdpdGggcGFnZXMgbmFtZVxuICAgICAgICAgICAgaWYob3B0aW9uID09PSAnc2lsZW50Jykge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5zaWxlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNvbXBvZG9jIHByb2Nlc3NcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XG4gICAgICAgICRodG1sZW5naW5lLmluaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1BhY2thZ2VKc29uKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGNvbXBvZG9jIGRvY3VtZW50YXRpb24gY292ZXJhZ2VcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdGVzdENvdmVyYWdlKCkge1xuICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBmaWxlcyBmb3IgaW5pdGlhbCBwcm9jZXNzaW5nXG4gICAgICogQHBhcmFtICB7QXJyYXk8c3RyaW5nPn0gZmlsZXMgRmlsZXMgZm91bmQgZHVyaW5nIHNvdXJjZSBmb2xkZXIgYW5kIHRzY29uZmlnIHNjYW5cbiAgICAgKi9cbiAgICBzZXRGaWxlcyhmaWxlczpBcnJheTxzdHJpbmc+KSB7XG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBmaWxlcyBmb3Igd2F0Y2ggcHJvY2Vzc2luZ1xuICAgICAqIEBwYXJhbSAge0FycmF5PHN0cmluZz59IGZpbGVzIEZpbGVzIGZvdW5kIGR1cmluZyBzb3VyY2UgZm9sZGVyIGFuZCB0c2NvbmZpZyBzY2FuXG4gICAgICovXG4gICAgc2V0VXBkYXRlZEZpbGVzKGZpbGVzOkFycmF5PHN0cmluZz4pIHtcbiAgICAgICAgdGhpcy51cGRhdGVkRmlsZXMgPSBmaWxlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYSBib29sZWFuIGluZGljYXRpbmcgcHJlc2VuY2Ugb2Ygb25lIFR5cGVTY3JpcHQgZmlsZSBpbiB1cGRhdGVkRmlsZXMgbGlzdFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFJlc3VsdCBvZiBzY2FuXG4gICAgICovXG4gICAgaGFzV2F0Y2hlZEZpbGVzVFNGaWxlcygpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLnVwZGF0ZWRGaWxlcywgKGZpbGUpID0+IHtcbiAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhciBmaWxlcyBmb3Igd2F0Y2ggcHJvY2Vzc2luZ1xuICAgICAqL1xuICAgIGNsZWFyVXBkYXRlZEZpbGVzKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZWRGaWxlcyA9IFtdO1xuICAgIH1cblxuICAgIHByb2Nlc3NQYWNrYWdlSnNvbigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBwYWNrYWdlLmpzb24gZmlsZScpO1xuICAgICAgICAkZmlsZWVuZ2luZS5nZXQoJ3BhY2thZ2UuanNvbicpLnRoZW4oKHBhY2thZ2VEYXRhKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UocGFja2FnZURhdGEpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWREYXRhLm5hbWUgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPT09IENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9IHBhcnNlZERhdGEubmFtZSArICcgZG9jdW1lbnRhdGlvbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZERhdGEuZGVzY3JpcHRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluRGVzY3JpcHRpb24gPSBwYXJzZWREYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFuZ3VsYXJWZXJzaW9uID0gZ2V0QW5ndWxhclZlcnNpb25PZlByb2plY3QocGFyc2VkRGF0YSk7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygncGFja2FnZS5qc29uIGZpbGUgZm91bmQnKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc01hcmtkb3duKCk7XG4gICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdDb250aW51aW5nIHdpdGhvdXQgcGFja2FnZS5qc29uIGZpbGUnKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc01hcmtkb3duKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NNYXJrZG93bigpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBSRUFETUUubWQgZmlsZScpO1xuICAgICAgICAkbWFya2Rvd25lbmdpbmUuZ2V0UmVhZG1lRmlsZSgpLnRoZW4oKHJlYWRtZURhdGE6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpbmRleCcsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3JlYWRtZScsXG4gICAgICAgICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ292ZXJ2aWV3JyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnb3ZlcnZpZXcnLFxuICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJlYWRtZSA9IHJlYWRtZURhdGE7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnUkVBRE1FLm1kIGZpbGUgZm91bmQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29udGludWluZyB3aXRob3V0IFJFQURNRS5tZCBmaWxlJyk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnb3ZlcnZpZXcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGVwZW5kZW5jeSBkYXRhIGZvciBzbWFsbCBncm91cCBvZiB1cGRhdGVkIGZpbGVzIGR1cmluZyB3YXRjaCBwcm9jZXNzXG4gICAgICovXG4gICAgZ2V0TWljcm9EZXBlbmRlbmNpZXNEYXRhKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnR2V0IGRpZmYgZGVwZW5kZW5jaWVzIGRhdGEnKTtcbiAgICAgICAgbGV0IGNyYXdsZXIgPSBuZXcgRGVwZW5kZW5jaWVzKFxuICAgICAgICAgIHRoaXMudXBkYXRlZEZpbGVzLCB7XG4gICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogcGF0aC5kaXJuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZylcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGRlcGVuZGVuY2llc0RhdGEgPSBjcmF3bGVyLmdldERlcGVuZGVuY2llcygpO1xuXG4gICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUudXBkYXRlKGRlcGVuZGVuY2llc0RhdGEpO1xuXG4gICAgICAgIHRoaXMucHJlcGFyZUp1c3RBRmV3VGhpbmdzKGRlcGVuZGVuY2llc0RhdGEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYnVpbGQgZXh0ZXJuYWwgZG9jdW1lbnRhdGlvbiBkdXJpbmcgd2F0Y2ggcHJvY2Vzc1xuICAgICAqL1xuICAgIHJlYnVpbGRFeHRlcm5hbERvY3VtZW50YXRpb24oKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdSZWJ1aWxkIGV4dGVybmFsIGRvY3VtZW50YXRpb24nKTtcblxuICAgICAgICBsZXQgYWN0aW9ucyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5yZXNldEFkZGl0aW9uYWxQYWdlcygpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgIT09ICcnKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlRXh0ZXJuYWxJbmNsdWRlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2VTZXF1ZW50aWFsKGFjdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1BhZ2VzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclVwZGF0ZWRGaWxlcygpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvck1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RGVwZW5kZW5jaWVzRGF0YSgpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0dldCBkZXBlbmRlbmNpZXMgZGF0YScpO1xuXG4gICAgICAgIGxldCBjcmF3bGVyID0gbmV3IERlcGVuZGVuY2llcyhcbiAgICAgICAgICB0aGlzLmZpbGVzLCB7XG4gICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogcGF0aC5kaXJuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZylcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGRlcGVuZGVuY2llc0RhdGEgPSBjcmF3bGVyLmdldERlcGVuZGVuY2llcygpO1xuXG4gICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUuaW5pdChkZXBlbmRlbmNpZXNEYXRhKTtcblxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucm91dGVzTGVuZ3RoID0gUm91dGVyUGFyc2VyLnJvdXRlc0xlbmd0aCgpO1xuXG4gICAgICAgIHRoaXMucHJlcGFyZUV2ZXJ5dGhpbmcoKTtcbiAgICB9XG5cbiAgICBwcmVwYXJlSnVzdEFGZXdUaGluZ3MoZGlmZkNyYXdsZWREYXRhKSB7XG4gICAgICAgIGxldCBhY3Rpb25zID0gW107XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLnJlc2V0UGFnZXMoKTtcblxuICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlUm91dGVzKCk7IH0pO1xuXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEubW9kdWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlTW9kdWxlcyhkaWZmQ3Jhd2xlZERhdGEubW9kdWxlcyk7IH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEuY29tcG9uZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlQ29tcG9uZW50cyhkaWZmQ3Jhd2xlZERhdGEuY29tcG9uZW50cyk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVEaXJlY3RpdmVzKGRpZmZDcmF3bGVkRGF0YS5kaXJlY3RpdmVzKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLmluamVjdGFibGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVJbmplY3RhYmxlcyhkaWZmQ3Jhd2xlZERhdGEuaW5qZWN0YWJsZXMpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEucGlwZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZVBpcGVzKGRpZmZDcmF3bGVkRGF0YS5waXBlcyk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5jbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDbGFzc2VzKGRpZmZDcmF3bGVkRGF0YS5jbGFzc2VzKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUludGVyZmFjZXMoZGlmZkNyYXdsZWREYXRhLmludGVyZmFjZXMpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy52YXJpYWJsZXMubGVuZ3RoID4gMCB8fFxuICAgICAgICAgICAgZGlmZkNyYXdsZWREYXRhLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgIGRpZmZDcmF3bGVkRGF0YS5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgIGRpZmZDcmF3bGVkRGF0YS5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9ucy5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgICBkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy50eXBlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZU1pc2NlbGxhbmVvdXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlQ292ZXJhZ2UpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDb3ZlcmFnZSgpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2VTZXF1ZW50aWFsKGFjdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0dyYXBocygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJVcGRhdGVkRmlsZXMoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3JNZXNzYWdlID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVFdmVyeXRoaW5nKCkge1xuICAgICAgICBsZXQgYWN0aW9ucyA9IFtdO1xuXG4gICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVNb2R1bGVzKCk7IH0pO1xuICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlQ29tcG9uZW50cygpOyB9KTtcblxuICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVEaXJlY3RpdmVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuaW5qZWN0YWJsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUluamVjdGFibGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUucm91dGVzICYmICRkZXBlbmRlbmNpZXNFbmdpbmUucm91dGVzLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVSb3V0ZXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5waXBlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlUGlwZXMoKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGRlcGVuZGVuY2llc0VuZ2luZS5jbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDbGFzc2VzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRkZXBlbmRlbmNpZXNFbmdpbmUuaW50ZXJmYWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlSW50ZXJmYWNlcygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkZGVwZW5kZW5jaWVzRW5naW5lLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMubGVuZ3RoID4gMCB8fFxuICAgICAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgICAgICRkZXBlbmRlbmNpZXNFbmdpbmUubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMubGVuZ3RoID4gMCB8fFxuICAgICAgICAgICAgJGRlcGVuZGVuY2llc0VuZ2luZS5taXNjZWxsYW5lb3VzLnR5cGVzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlTWlzY2VsbGFuZW91cygpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVDb3ZlcmFnZSkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUNvdmVyYWdlKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyAhPT0gJycpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVFeHRlcm5hbEluY2x1ZGVzKCk7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZVNlcXVlbnRpYWwoYWN0aW9ucylcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzR3JhcGhzKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yTWVzc2FnZSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlRXh0ZXJuYWxJbmNsdWRlcygpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0FkZGluZyBleHRlcm5hbCBtYXJrZG93biBmaWxlcycpO1xuICAgICAgICAvL1NjYW4gaW5jbHVkZSBmb2xkZXIgZm9yIGZpbGVzIGRldGFpbGVkIGluIHN1bW1hcnkuanNvblxuICAgICAgICAvL0ZvciBlYWNoIGZpbGUsIGFkZCB0byB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYWRkaXRpb25hbFBhZ2VzXG4gICAgICAgIC8vRWFjaCBmaWxlIHdpbGwgYmUgY29udmVydGVkIHRvIGh0bWwgcGFnZSwgaW5zaWRlIENPTVBPRE9DX0RFRkFVTFRTLmFkZGl0aW9uYWxFbnRyeVBhdGhcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgJGZpbGVlbmdpbmUuZ2V0KHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyArIHBhdGguc2VwICsgJ3N1bW1hcnkuanNvbicpLnRoZW4oKHN1bW1hcnlEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnQWRkaXRpb25hbCBkb2N1bWVudGF0aW9uOiBzdW1tYXJ5Lmpzb24gZmlsZSBmb3VuZCcpO1xuXG4gICAgICAgICAgICAgICBsZXQgcGFyc2VkU3VtbWFyeURhdGEgPSBKU09OLnBhcnNlKHN1bW1hcnlEYXRhKSxcbiAgICAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICAgICBsZW4gPSBwYXJzZWRTdW1tYXJ5RGF0YS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgbG9vcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiggaSA8PSBsZW4tMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAkbWFya2Rvd25lbmdpbmUuZ2V0KHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyArIHBhdGguc2VwICsgcGFyc2VkU3VtbWFyeURhdGFbaV0uZmlsZSkudGhlbigobWFya2VkRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZEFkZGl0aW9uYWxQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwYXJzZWRTdW1tYXJ5RGF0YVtpXS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogY2xlYW5OYW1lV2l0aG91dFNwYWNlQW5kVG9Mb3dlckNhc2UocGFyc2VkU3VtbWFyeURhdGFbaV0udGl0bGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdhZGRpdGlvbmFsLXBhZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc0ZvbGRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUGFnZTogbWFya2VkRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbiAmJiBwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGogPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5nID0gcGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcENoaWxkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBqIDw9IGxlbmctMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbWFya2Rvd25lbmdpbmUuZ2V0KHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyArIHBhdGguc2VwICsgcGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW5bal0uZmlsZSkudGhlbigobWFya2VkRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZEFkZGl0aW9uYWxQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbltqXS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogY2xlYW5OYW1lV2l0aG91dFNwYWNlQW5kVG9Mb3dlckNhc2UocGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW5bal0udGl0bGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdhZGRpdGlvbmFsLXBhZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc0ZvbGRlciArICcvJyArIGNsZWFuTmFtZVdpdGhvdXRTcGFjZUFuZFRvTG93ZXJDYXNlKHBhcnNlZFN1bW1hcnlEYXRhW2ldLnRpdGxlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUGFnZTogbWFya2VkRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wQ2hpbGQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcENoaWxkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgQWRkaXRpb25hbCBkb2N1bWVudGF0aW9uIGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVNb2R1bGVzKHNvbWVNb2R1bGVzPykge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBtb2R1bGVzJyk7XG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIF9tb2R1bGVzID0gKHNvbWVNb2R1bGVzKSA/IHNvbWVNb2R1bGVzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMgPSBfbW9kdWxlcy5tYXAobmdNb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIFsnZGVjbGFyYXRpb25zJywgJ2Jvb3RzdHJhcCcsICdpbXBvcnRzJywgJ2V4cG9ydHMnXS5mb3JFYWNoKG1ldGFkYXRhVHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlW21ldGFkYXRhVHlwZV0gPSBuZ01vZHVsZVttZXRhZGF0YVR5cGVdLmZpbHRlcihtZXRhRGF0YUl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChtZXRhRGF0YUl0ZW0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGl2ZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldERpcmVjdGl2ZXMoKS5zb21lKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUubmFtZSA9PT0gbWV0YURhdGFJdGVtLm5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tcG9uZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0Q29tcG9uZW50cygpLnNvbWUoY29tcG9uZW50ID0+IGNvbXBvbmVudC5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb2R1bGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCkuc29tZShtb2R1bGUgPT4gbW9kdWxlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BpcGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRQaXBlcygpLnNvbWUocGlwZSA9PiBwaXBlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBuZ01vZHVsZS5wcm92aWRlcnMgPSBuZ01vZHVsZS5wcm92aWRlcnMuZmlsdGVyKHByb3ZpZGVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRkZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5qZWN0YWJsZXMoKS5zb21lKGluamVjdGFibGUgPT4gaW5qZWN0YWJsZS5uYW1lID09PSBwcm92aWRlci5uYW1lKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmdNb2R1bGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbW9kdWxlcycsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ21vZHVsZXMnLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAwLFxuICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJ21vZHVsZXMnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnbW9kdWxlJyxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZVBpcGVzID0gKHNvbWVQaXBlcz8pID0+IHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgcGlwZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzID0gKHNvbWVQaXBlcykgPyBzb21lUGlwZXMgOiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldFBpcGVzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJ3BpcGVzJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdwaXBlJyxcbiAgICAgICAgICAgICAgICAgICAgcGlwZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLFxuICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUNsYXNzZXMgPSAoc29tZUNsYXNzZXM/KSA9PiB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGNsYXNzZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXMgPSAoc29tZUNsYXNzZXMpID8gc29tZUNsYXNzZXMgOiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldENsYXNzZXMoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdjbGFzc2VzJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2NsYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzW2ldLFxuICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUludGVyZmFjZXMoc29tZUludGVyZmFjZXM/KSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGludGVyZmFjZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMgPSAoc29tZUludGVyZmFjZXMpID8gc29tZUludGVyZmFjZXMgOiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldEludGVyZmFjZXMoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBwYXRoOiAnaW50ZXJmYWNlcycsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdpbnRlcmZhY2UnLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcmZhY2U6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLFxuICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZU1pc2NlbGxhbmVvdXMoc29tZU1pc2M/KSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIG1pc2NlbGxhbmVvdXMnKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1pc2NlbGxhbmVvdXMgPSAoc29tZU1pc2MpID8gc29tZU1pc2MgOiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldE1pc2NlbGxhbmVvdXMoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdtaXNjZWxsYW5lb3VzJyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnbWlzY2VsbGFuZW91cycsXG4gICAgICAgICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVDb21wb25lbnRzKHNvbWVDb21wb25lbnRzPykge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBjb21wb25lbnRzJyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzID0gKHNvbWVDb21wb25lbnRzKSA/IHNvbWVDb21wb25lbnRzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRDb21wb25lbnRzKCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChtYWluUmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGxvb3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCBpIDw9IGxlbi0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlybmFtZSA9IHBhdGguZGlybmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5maWxlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVUZW1wbGF0ZXVybCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wbGF0ZVBhdGggPSBwYXRoLnJlc29sdmUoZGlybmFtZSArIHBhdGguc2VwICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0udGVtcGxhdGVVcmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmModGVtcGxhdGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlKHRlbXBsYXRlUGF0aCwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS50ZW1wbGF0ZURhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgQ2Fubm90IHJlYWQgdGVtcGxhdGUgZm9yICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkbWFya2Rvd25lbmdpbmUuY29tcG9uZW50SGFzUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5maWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWV9IGhhcyBhIFJFQURNRSBmaWxlLCBpbmNsdWRlIGl0YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZUZpbGUgPSAkbWFya2Rvd25lbmdpbmUuY29tcG9uZW50UmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZShyZWFkbWVGaWxlLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5yZWFkbWUgPSBtYXJrZWQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6ICdjb21wb25lbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0udGVtcGxhdGVVcmwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYCR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZX0gaGFzIGEgdGVtcGxhdGVVcmwsIGluY2x1ZGUgaXRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZVRlbXBsYXRldXJsKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6ICdjb21wb25lbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS50ZW1wbGF0ZVVybC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLm5hbWV9IGhhcyBhIHRlbXBsYXRlVXJsLCBpbmNsdWRlIGl0YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZVRlbXBsYXRldXJsKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpblJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsb29wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVEaXJlY3RpdmVzID0gKHNvbWVEaXJlY3RpdmVzPykgPT4ge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBkaXJlY3RpdmVzJyk7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXMgPSAoc29tZURpcmVjdGl2ZXMpID8gc29tZURpcmVjdGl2ZXMgOiAkZGVwZW5kZW5jaWVzRW5naW5lLmdldERpcmVjdGl2ZXMoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgICAgIGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdkaXJlY3RpdmVzJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2RpcmVjdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmVwYXJlSW5qZWN0YWJsZXMoc29tZUluamVjdGFibGVzPykge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBpbmplY3RhYmxlcycpO1xuXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcyA9IChzb21lSW5qZWN0YWJsZXMpID8gc29tZUluamVjdGFibGVzIDogJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRJbmplY3RhYmxlcygpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgaSA9IDAsXG4gICAgICAgICAgICAgICAgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdpbmplY3RhYmxlcycsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnaW5qZWN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgIGluamVjdGFibGU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXBhcmVSb3V0ZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHJvdXRlcycpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucm91dGVzID0gJGRlcGVuZGVuY2llc0VuZ2luZS5nZXRSb3V0ZXMoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3JvdXRlcycsXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3JvdXRlcycsXG4gICAgICAgICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIFJvdXRlclBhcnNlci5nZW5lcmF0ZVJvdXRlc0luZGV4KHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQsIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdSb3V0ZXMgaW5kZXggZ2VuZXJhdGVkJyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSwgKGUpID0+wqB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUNvdmVyYWdlKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHJlcG9ydCcpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogbG9vcCB3aXRoIGNvbXBvbmVudHMsIGNsYXNzZXMsIGluamVjdGFibGVzLCBpbnRlcmZhY2VzLCBwaXBlc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB2YXIgZmlsZXMgPSBbXSxcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICBnZXRTdGF0dXMgPSBmdW5jdGlvbihwZXJjZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJjZW50IDw9IDI1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAnbG93JztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJjZW50ID4gMjUgJiYgcGVyY2VudCA8PSA1MCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ21lZGl1bSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGVyY2VudCA+IDUwICYmIHBlcmNlbnQgPD0gNzUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdnb29kJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdnb29kJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cywgKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LnByb3BlcnRpZXNDbGFzcyB8fFxuICAgICAgICAgICAgICAgICAgICAhY29tcG9uZW50Lm1ldGhvZHNDbGFzcyB8fFxuICAgICAgICAgICAgICAgICAgICAhY29tcG9uZW50LmlucHV0c0NsYXNzIHx8XG4gICAgICAgICAgICAgICAgICAgICFjb21wb25lbnQub3V0cHV0c0NsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY2w6YW55ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGNvbXBvbmVudC5maWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY29tcG9uZW50LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rdHlwZTogY29tcG9uZW50LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wb25lbnQubmFtZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBjb21wb25lbnQucHJvcGVydGllc0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5tZXRob2RzQ2xhc3MubGVuZ3RoICsgY29tcG9uZW50LmlucHV0c0NsYXNzLmxlbmd0aCArIGNvbXBvbmVudC5vdXRwdXRzQ2xhc3MubGVuZ3RoICsgMTsgLy8gKzEgZm9yIGNvbXBvbmVudCBkZWNvcmF0b3IgY29tbWVudFxuXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb25zdHJ1Y3Rvck9iaikge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQucHJvcGVydGllc0NsYXNzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5Lm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycgJiYgcHJvcGVydHkubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5tZXRob2RzQ2xhc3MsIChtZXRob2QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGNvbXBvbmVudC5pbnB1dHNDbGFzcywgKGlucHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoaW5wdXQuZGVzY3JpcHRpb24gIT09ICcnICYmIGlucHV0Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjb21wb25lbnQub3V0cHV0c0NsYXNzLCAob3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXQubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKG91dHB1dC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgb3V0cHV0Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzLCAoY2xhc3NlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjbGFzc2UucHJvcGVydGllcyB8fFxuICAgICAgICAgICAgICAgICAgICAhY2xhc3NlLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjbDphbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogY2xhc3NlLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2xhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua3R5cGU6ICdjbGFzc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2xhc3NlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gY2xhc3NlLnByb3BlcnRpZXMubGVuZ3RoICsgY2xhc3NlLm1ldGhvZHMubGVuZ3RoICsgMTsgLy8gKzEgZm9yIGNsYXNzIGl0c2VsZlxuXG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzZS5jb25zdHJ1Y3Rvck9iaikge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzZS5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjbGFzc2UuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UucHJvcGVydGllcywgKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYocHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnICYmIHByb3BlcnR5Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UubWV0aG9kcywgKG1ldGhvZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihtZXRob2QuZGVzY3JpcHRpb24gIT09ICcnICYmIG1ldGhvZC5tb2RpZmllcktpbmQgIT09IDExMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xuICAgICAgICAgICAgICAgIGlmKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xuICAgICAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xuICAgICAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzLCAoaW5qZWN0YWJsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaW5qZWN0YWJsZS5wcm9wZXJ0aWVzIHx8XG4gICAgICAgICAgICAgICAgICAgICFpbmplY3RhYmxlLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjbDphbnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW5qZWN0YWJsZS5maWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogaW5qZWN0YWJsZS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua3R5cGU6IGluamVjdGFibGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGluamVjdGFibGUubmFtZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgPSBpbmplY3RhYmxlLnByb3BlcnRpZXMubGVuZ3RoICsgaW5qZWN0YWJsZS5tZXRob2RzLmxlbmd0aCArIDE7IC8vICsxIGZvciBpbmplY3RhYmxlIGl0c2VsZlxuXG4gICAgICAgICAgICAgICAgaWYgKGluamVjdGFibGUuY29uc3RydWN0b3JPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmplY3RhYmxlLmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluamVjdGFibGUuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChpbmplY3RhYmxlLnByb3BlcnRpZXMsIChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJyAmJiBwcm9wZXJ0eS5tb2RpZmllcktpbmQgIT09IDExMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5tZXRob2RzLCAobWV0aG9kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgbWV0aG9kLm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgaWYodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XG4gICAgICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XG4gICAgICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcywgKGludGVyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnRlci5wcm9wZXJ0aWVzIHx8XG4gICAgICAgICAgICAgICAgICAgICFpbnRlci5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY2w6YW55ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGludGVyLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBpbnRlci50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua3R5cGU6IGludGVyLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbnRlci5uYW1lXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDAsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyA9IGludGVyLnByb3BlcnRpZXMubGVuZ3RoICsgaW50ZXIubWV0aG9kcy5sZW5ndGggKyAxOyAvLyArMSBmb3IgaW50ZXJmYWNlIGl0c2VsZlxuXG4gICAgICAgICAgICAgICAgaWYgKGludGVyLmNvbnN0cnVjdG9yT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXIuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW50ZXIuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChpbnRlci5wcm9wZXJ0aWVzLCAocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5Lm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycgJiYgcHJvcGVydHkubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGludGVyLm1ldGhvZHMsIChtZXRob2QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYobWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcbiAgICAgICAgICAgICAgICBpZih0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcywgKHBpcGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2w6YW55ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IHBpcGUuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHBpcGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmt0eXBlOiBwaXBlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwaXBlLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzID0gMTtcbiAgICAgICAgICAgICAgICBpZiAocGlwZS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZmlsZXMgPSBfLnNvcnRCeShmaWxlcywgWydmaWxlUGF0aCddKTtcbiAgICAgICAgICAgIHZhciBjb3ZlcmFnZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgY291bnQ6IChmaWxlcy5sZW5ndGggPiAwKSA/IE1hdGguZmxvb3IodG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCAvIGZpbGVzLmxlbmd0aCkgOiAwLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJydcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb3ZlcmFnZURhdGEuc3RhdHVzID0gZ2V0U3RhdHVzKGNvdmVyYWdlRGF0YS5jb3VudCk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2NvdmVyYWdlJyxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnY292ZXJhZ2UnLFxuICAgICAgICAgICAgICAgIGZpbGVzOiBmaWxlcyxcbiAgICAgICAgICAgICAgICBkYXRhOiBjb3ZlcmFnZURhdGEsXG4gICAgICAgICAgICAgICAgZGVwdGg6IDAsXG4gICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkaHRtbGVuZ2luZS5nZW5lcmF0ZUNvdmVyYWdlQmFkZ2UodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCwgY292ZXJhZ2VEYXRhKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvdmVyYWdlRGF0YS5jb3VudCA+PSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0VGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdEb2N1bWVudGF0aW9uIGNvdmVyYWdlIGlzIG92ZXIgdGhyZXNob2xkJyk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0RvY3VtZW50YXRpb24gY292ZXJhZ2UgaXMgbm90IG92ZXIgdGhyZXNob2xkJyk7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1BhZ2VzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlcycpO1xuICAgICAgICBsZXQgcGFnZXMgPSB0aGlzLmNvbmZpZ3VyYXRpb24ucGFnZXM7XG4gICAgICAgIFByb21pc2UuYWxsKFxuICAgICAgICAgICAgcGFnZXMubWFwKChwYWdlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgcGFnZScsIHBhZ2UubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBodG1sRGF0YSA9ICRodG1sZW5naW5lLnJlbmRlcih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEsIHBhZ2UpXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaW5hbFBhdGggPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0Lmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWdlLnBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSBwYWdlLnBhdGggKyAnLyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2UubmFtZSArICcuaHRtbCc7XG4gICAgICAgICAgICAgICAgICAgICRzZWFyY2hFbmdpbmUuaW5kZXhQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm9zOiBwYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3RGF0YTogaHRtbERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGZpbmFsUGF0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZnMub3V0cHV0RmlsZShwYXRoLnJlc29sdmUoZmluYWxQYXRoKSwgaHRtbERhdGEsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyAnICsgcGFnZS5uYW1lICsgJyBwYWdlIGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAkc2VhcmNoRW5naW5lLmdlbmVyYXRlU2VhcmNoSW5kZXhKc29uKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYWRkaXRpb25hbFBhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzQWRkaXRpb25hbFBhZ2VzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBc3NldHNGb2xkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXNvdXJjZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAoZSkgPT4gwqB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzQWRkaXRpb25hbFBhZ2VzKCkge1xuICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBhZGRpdGlvbmFsIHBhZ2VzJyk7XG4gICAgICAgIGxldCBwYWdlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hZGRpdGlvbmFsUGFnZXNcbiAgICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBwYWdlcy5tYXAoKHBhZ2UsIGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUHJvY2VzcyBwYWdlJywgcGFnZXNbaV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBodG1sRGF0YSA9ICRodG1sZW5naW5lLnJlbmRlcih0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEsIHBhZ2VzW2ldKVxuICAgICAgICAgICAgICAgICAgICBsZXQgZmluYWxQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9ICcvJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocGFnZXNbaV0ucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2VzW2ldLnBhdGggKyAnLyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2VzW2ldLm5hbWUgKyAnLmh0bWwnO1xuICAgICAgICAgICAgICAgICAgICAkc2VhcmNoRW5naW5lLmluZGV4UGFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvczogcGFnZXNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZmluYWxQYXRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKHBhdGgucmVzb2x2ZShmaW5hbFBhdGgpLCBodG1sRGF0YSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nICcgKyBwYWdlc1tpXS5uYW1lICsgJyBwYWdlIGdlbmVyYXRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAkc2VhcmNoRW5naW5lLmdlbmVyYXRlU2VhcmNoSW5kZXhKc29uKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBc3NldHNGb2xkZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUmVzb3VyY2VzKCk7XG4gICAgICAgICAgICB9LCAoZSkgPT7CoHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb2Nlc3NBc3NldHNGb2xkZXIoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDb3B5IGFzc2V0cyBmb2xkZXInKTtcblxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlcikpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgUHJvdmlkZWQgYXNzZXRzIGZvbGRlciAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXJ9IGRpZCBub3QgZXhpc3RgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZzLmNvcHkocGF0aC5yZXNvbHZlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIpLCBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCArIHBhdGguc2VwICsgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciksIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgcmVzb3VyY2VzIGNvcHkgJywgZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb2Nlc3NSZXNvdXJjZXMoKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDb3B5IG1haW4gcmVzb3VyY2VzJyk7XG5cbiAgICAgICAgY29uc3Qgb25Db21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBmaW5hbFRpbWUgPSAobmV3IERhdGUoKSAtIHN0YXJ0VGltZSkgLyAxMDAwO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RvY3VtZW50YXRpb24gZ2VuZXJhdGVkIGluICcgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICsgJyBpbiAnICsgZmluYWxUaW1lICsgJyBzZWNvbmRzIHVzaW5nICcgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudGhlbWUgKyAnIHRoZW1lJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnNlcnZlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0fWApO1xuICAgICAgICAgICAgICAgIHRoaXMucnVuV2ViU2VydmVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBmaW5hbE91dHB1dCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJyk7XG5cbiAgICAgICAgZnMuY29weShwYXRoLnJlc29sdmUoX19kaXJuYW1lICsgJy8uLi9zcmMvcmVzb3VyY2VzLycpLCBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmluYWxPdXRwdXQpLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZihlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSkge1xuICAgICAgICAgICAgICAgICAgICBmcy5jb3B5KHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUpLCBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmluYWxPdXRwdXQgKyAnL3N0eWxlcy8nKSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGV4dGVybmFsIHN0eWxpbmcgdGhlbWUgY29weSAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBjb3B5IHN1Y2NlZWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzR3JhcGhzKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnR3JhcGggZ2VuZXJhdGlvbiBkaXNhYmxlZCcpO1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIG1haW4gZ3JhcGgnKTtcblxuICAgICAgICAgICAgbGV0IGZpbmFsTWFpbkdyYXBoUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICBpZihmaW5hbE1haW5HcmFwaFBhdGgubGFzdEluZGV4T2YoJy8nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBmaW5hbE1haW5HcmFwaFBhdGggKz0gJy8nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxNYWluR3JhcGhQYXRoICs9ICdncmFwaCc7XG4gICAgICAgICAgICAkbmdkZW5naW5lLnJlbmRlckdyYXBoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZywgcGF0aC5yZXNvbHZlKGZpbmFsTWFpbkdyYXBoUGF0aCksICdwJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgJG5nZGVuZ2luZS5yZWFkR3JhcGgocGF0aC5yZXNvbHZlKGZpbmFsTWFpbkdyYXBoUGF0aCArIHBhdGguc2VwICsgJ2RlcGVuZGVuY2llcy5zdmcnKSwgJ01haW4gZ3JhcGgnKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tYWluR3JhcGggPSA8c3RyaW5nPmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTW9kdWxlc0dyYXBoKCk7XG4gICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBncmFwaCByZWFkOiAnLCBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGdyYXBoIGdlbmVyYXRpb246ICcsIGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IG1vZHVsZXMgPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlcyxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZU1vZHVsZXNHcmFwaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzLm1hcCgobW9kdWxlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgbW9kdWxlIGdyYXBoJywgbW9kdWxlc1tpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubGFzdEluZGV4T2YoJy8nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxQYXRoICs9ICdtb2R1bGVzLycgKyBtb2R1bGVzW2ldLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRuZ2RlbmdpbmUucmVuZGVyR3JhcGgobW9kdWxlc1tpXS5maWxlLCBmaW5hbFBhdGgsICdmJywgbW9kdWxlc1tpXS5uYW1lKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRuZ2RlbmdpbmUucmVhZEdyYXBoKHBhdGgucmVzb2x2ZShmaW5hbFBhdGggKyBwYXRoLnNlcCArICdkZXBlbmRlbmNpZXMuc3ZnJyksIG1vZHVsZXNbaV0ubmFtZSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXNbaV0uZ3JhcGggPSA8c3RyaW5nPmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIGdyYXBoIHJlYWQ6ICcsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJ1bldlYlNlcnZlcihmb2xkZXIpIHtcbiAgICAgICAgaWYoIXRoaXMuaXNXYXRjaGluZykge1xuICAgICAgICAgICAgTGl2ZVNlcnZlci5zdGFydCh7XG4gICAgICAgICAgICAgICAgcm9vdDogZm9sZGVyLFxuICAgICAgICAgICAgICAgIG9wZW46IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vcGVuLFxuICAgICAgICAgICAgICAgIHF1aWV0OiB0cnVlLFxuICAgICAgICAgICAgICAgIGxvZ0xldmVsOiAwLFxuICAgICAgICAgICAgICAgIHdhaXQ6IDEwMDAsXG4gICAgICAgICAgICAgICAgcG9ydDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEud2F0Y2ggJiYgIXRoaXMuaXNXYXRjaGluZykge1xuICAgICAgICAgICAgdGhpcy5ydW5XYXRjaCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS53YXRjaCAmJiB0aGlzLmlzV2F0Y2hpbmcpIHtcbiAgICAgICAgICAgIGxldCBzcmNGb2xkZXIgPSBmaW5kTWFpblNvdXJjZUZvbGRlcih0aGlzLmZpbGVzKTtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBBbHJlYWR5IHdhdGNoaW5nIHNvdXJjZXMgaW4gJHtzcmNGb2xkZXJ9IGZvbGRlcmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcnVuV2F0Y2goKSB7XG4gICAgICAgIGxldCBzcmNGb2xkZXIgPSBmaW5kTWFpblNvdXJjZUZvbGRlcih0aGlzLmZpbGVzKSxcbiAgICAgICAgICAgIHdhdGNoQ2hhbmdlZEZpbGVzID0gW107XG5cbiAgICAgICAgdGhpcy5pc1dhdGNoaW5nID0gdHJ1ZTtcblxuICAgICAgICBsb2dnZXIuaW5mbyhgV2F0Y2hpbmcgc291cmNlcyBpbiAke3NyY0ZvbGRlcn0gZm9sZGVyYCk7XG5cbiAgICAgICAgbGV0IHdhdGNoZXIgPSBjaG9raWRhci53YXRjaChzcmNGb2xkZXIsIHtcbiAgICAgICAgICAgICAgICBhd2FpdFdyaXRlRmluaXNoOiB0cnVlLFxuICAgICAgICAgICAgICAgIGlnbm9yZWQ6IC8oc3BlY3xcXC5kKVxcLnRzL1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0aW1lckFkZEFuZFJlbW92ZVJlZixcbiAgICAgICAgICAgIHRpbWVyQ2hhbmdlUmVmLFxuICAgICAgICAgICAgd2FpdGVyQWRkQW5kUmVtb3ZlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lckFkZEFuZFJlbW92ZVJlZik7XG4gICAgICAgICAgICAgICAgdGltZXJBZGRBbmRSZW1vdmVSZWYgPSBzZXRUaW1lb3V0KHJ1bm5lckFkZEFuZFJlbW92ZSwgMTAwMCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmVyQWRkQW5kUmVtb3ZlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3YWl0ZXJDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2hhbmdlUmVmKTtcbiAgICAgICAgICAgICAgICB0aW1lckNoYW5nZVJlZiA9IHNldFRpbWVvdXQocnVubmVyQ2hhbmdlLCAxMDAwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5uZXJDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVkRmlsZXMod2F0Y2hDaGFuZ2VkRmlsZXMpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhhc1dhdGNoZWRGaWxlc1RTRmlsZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE1pY3JvRGVwZW5kZW5jaWVzRGF0YSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVidWlsZEV4dGVybmFsRG9jdW1lbnRhdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyAhPT0gJycpIHtcbiAgICAgICAgICAgIHdhdGNoZXIuYWRkKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICB3YXRjaGVyXG4gICAgICAgICAgICAub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdhdGNoZXJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdhZGQnLCAoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBGaWxlICR7ZmlsZX0gaGFzIGJlZW4gYWRkZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlc3QgZXh0ZW5zaW9uLCBpZiB0c1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzY2FuIGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdGVyQWRkQW5kUmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5vbignY2hhbmdlJywgKGZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgRmlsZSAke2ZpbGV9IGhhcyBiZWVuIGNoYW5nZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlc3QgZXh0ZW5zaW9uLCBpZiB0c1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzY2FuIG9ubHkgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaENoYW5nZWRGaWxlcy5wdXNoKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBmaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdGVyQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLm1kJyB8fCBwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcuanNvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaENoYW5nZWRGaWxlcy5wdXNoKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBmaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdGVyQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5vbigndW5saW5rJywgKGZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgRmlsZSAke2ZpbGV9IGhhcyBiZWVuIHJlbW92ZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlc3QgZXh0ZW5zaW9uLCBpZiB0c1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzY2FuIGV2ZXJ5dGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FpdGVyQWRkQW5kUmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBhcHBsaWNhdGlvbiAvIHJvb3QgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIGdldCBhcHBsaWNhdGlvbigpOkFwcGxpY2F0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICBnZXQgaXNDTEkoKTpib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSAnLi9hcHAvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgeyBDT01QT0RPQ19ERUZBVUxUUyB9IGZyb20gJy4vdXRpbHMvZGVmYXVsdHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgcmVhZENvbmZpZywgaGFuZGxlUGF0aCB9IGZyb20gJy4vdXRpbHMvdXRpbHMnO1xuXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyksXG4gICAgcHJvZ3JhbSA9IHJlcXVpcmUoJ2NvbW1hbmRlcicpLFxuICAgIGdsb2IgPSByZXF1aXJlKCdnbG9iJyksXG4gICAgb3MgPSByZXF1aXJlKCdvcycpLFxuICAgIG9zTmFtZSA9IHJlcXVpcmUoJ29zLW5hbWUnKSxcbiAgICBmaWxlcyA9IFtdLFxuICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG5cbnByb2Nlc3Muc2V0TWF4TGlzdGVuZXJzKDApO1xuXG5leHBvcnQgY2xhc3MgQ2xpQXBwbGljYXRpb24gZXh0ZW5kcyBBcHBsaWNhdGlvblxue1xuICAgIC8qKlxuICAgICAqIFJ1biBjb21wb2RvYyBmcm9tIHRoZSBjb21tYW5kIGxpbmUuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdlbmVyYXRlKCkge1xuXG4gICAgICAgIGZ1bmN0aW9uIGxpc3QodmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9ncmFtXG4gICAgICAgICAgICAudmVyc2lvbihwa2cudmVyc2lvbilcbiAgICAgICAgICAgIC51c2FnZSgnPHNyYz4gW29wdGlvbnNdJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1wLCAtLXRzY29uZmlnIFtjb25maWddJywgJ0EgdHNjb25maWcuanNvbiBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1kLCAtLW91dHB1dCBbZm9sZGVyXScsICdXaGVyZSB0byBzdG9yZSB0aGUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQ6IC4vZG9jdW1lbnRhdGlvbiknLCBDT01QT0RPQ19ERUZBVUxUUy5mb2xkZXIpXG4gICAgICAgICAgICAub3B0aW9uKCcteSwgLS1leHRUaGVtZSBbZmlsZV0nLCAnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBmaWxlJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1uLCAtLW5hbWUgW25hbWVdJywgJ1RpdGxlIGRvY3VtZW50YXRpb24nLCBDT01QT0RPQ19ERUZBVUxUUy50aXRsZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy1hLCAtLWFzc2V0c0ZvbGRlciBbZm9sZGVyXScsICdFeHRlcm5hbCBhc3NldHMgZm9sZGVyIHRvIGNvcHkgaW4gZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gZm9sZGVyJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1vLCAtLW9wZW4nLCAnT3BlbiB0aGUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24nLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy10LCAtLXNpbGVudCcsICdJbiBzaWxlbnQgbW9kZSwgbG9nIG1lc3NhZ2VzIGFyZW5cXCd0IGxvZ2dlZCBpbiB0aGUgY29uc29sZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLXMsIC0tc2VydmUnLCAnU2VydmUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24gKGRlZmF1bHQgaHR0cDovL2xvY2FsaG9zdDo4MDgwLyknLCBmYWxzZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy1yLCAtLXBvcnQgW3BvcnRdJywgJ0NoYW5nZSBkZWZhdWx0IHNlcnZpbmcgcG9ydCcsIENPTVBPRE9DX0RFRkFVTFRTLnBvcnQpXG4gICAgICAgICAgICAub3B0aW9uKCctdywgLS13YXRjaCcsICdXYXRjaCBzb3VyY2UgZmlsZXMgYWZ0ZXIgc2VydmUgYW5kIGZvcmNlIGRvY3VtZW50YXRpb24gcmVidWlsZCcsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS10aGVtZSBbdGhlbWVdJywgJ0Nob29zZSBvbmUgb2YgYXZhaWxhYmxlIHRoZW1lcywgZGVmYXVsdCBpcyBcXCdnaXRib29rXFwnIChsYXJhdmVsLCBvcmlnaW5hbCwgcG9zdG1hcmssIHJlYWR0aGVkb2NzLCBzdHJpcGUsIHZhZ3JhbnQpJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0taGlkZUdlbmVyYXRvcicsICdEbyBub3QgcHJpbnQgdGhlIENvbXBvZG9jIGxpbmsgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZScsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS10b2dnbGVNZW51SXRlbXMgPGl0ZW1zPicsICdDbG9zZSBieSBkZWZhdWx0IGl0ZW1zIGluIHRoZSBtZW51IGV4YW1wbGU6IFxcJ2FsbFxcJyBvciBcXCdtb2R1bGVzXFwnLFxcJ2NvbXBvbmVudHNcXCcsXFwnZGlyZWN0aXZlc1xcJyxcXCdjbGFzc2VzXFwnLFxcJ2luamVjdGFibGVzXFwnLFxcJ2ludGVyZmFjZXNcXCcsXFwncGlwZXNcXCcsXFwnYWRkaXRpb25hbFBhZ2VzXFwnJywgbGlzdClcbiAgICAgICAgICAgIC5vcHRpb24oJy0taW5jbHVkZXMgW3BhdGhdJywgJ1BhdGggb2YgZXh0ZXJuYWwgbWFya2Rvd24gZmlsZXMgdG8gaW5jbHVkZScpXG4gICAgICAgICAgICAub3B0aW9uKCctLWluY2x1ZGVzTmFtZSBbbmFtZV0nLCAnTmFtZSBvZiBpdGVtIG1lbnUgb2YgZXh0ZXJuYWxzIG1hcmtkb3duIGZpbGVzIChkZWZhdWx0IFwiQWRkaXRpb25hbCBkb2N1bWVudGF0aW9uXCIpJywgQ09NUE9ET0NfREVGQVVMVFMuYWRkaXRpb25hbEVudHJ5TmFtZSlcbiAgICAgICAgICAgIC5vcHRpb24oJy0tY292ZXJhZ2VUZXN0IFt0aHJlc2hvbGRdJywgJ1Rlc3QgY29tbWFuZCBvZiBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHdpdGggYSB0aHJlc2hvbGQgKGRlZmF1bHQgNzApJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGlzYWJsZVNvdXJjZUNvZGUnLCAnRG8gbm90IGFkZCBzb3VyY2UgY29kZSB0YWIgYW5kIGxpbmtzIHRvIHNvdXJjZSBjb2RlJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVHcmFwaCcsICdEbyBub3QgYWRkIHRoZSBkZXBlbmRlbmN5IGdyYXBoJywgZmFsc2UpXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVDb3ZlcmFnZScsICdEbyBub3QgYWRkIHRoZSBkb2N1bWVudGF0aW9uIGNvdmVyYWdlIHJlcG9ydCcsIGZhbHNlKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0JywgJ0RvIG5vdCBzaG93IHByaXZhdGUsIEBpbnRlcm5hbCBvciBBbmd1bGFyIGxpZmVjeWNsZSBob29rcyBpbiBnZW5lcmF0ZWQgZG9jdW1lbnRhdGlvbicsIGZhbHNlKVxuICAgICAgICAgICAgLnBhcnNlKHByb2Nlc3MuYXJndik7XG5cbiAgICAgICAgbGV0IG91dHB1dEhlbHAgPSAoKSA9PiB7XG4gICAgICAgICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKVxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ID0gcHJvZ3JhbS5vdXRwdXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5leHRUaGVtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmV4dFRoZW1lID0gcHJvZ3JhbS5leHRUaGVtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnRoZW1lKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudGhlbWUgPSBwcm9ncmFtLnRoZW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ubmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9IHByb2dyYW0ubmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmFzc2V0c0ZvbGRlcikge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFzc2V0c0ZvbGRlciA9IHByb2dyYW0uYXNzZXRzRm9sZGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ub3Blbikge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm9wZW4gPSBwcm9ncmFtLm9wZW47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS50b2dnbGVNZW51SXRlbXMpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50b2dnbGVNZW51SXRlbXMgPSBwcm9ncmFtLnRvZ2dsZU1lbnVJdGVtcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgID0gcHJvZ3JhbS5pbmNsdWRlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzTmFtZSAgPSBwcm9ncmFtLmluY2x1ZGVzTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLnNpbGVudCkge1xuICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5zZXJ2ZSAgPSBwcm9ncmFtLnNlcnZlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0ucG9ydCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnQgPSBwcm9ncmFtLnBvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS53YXRjaCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLndhdGNoID0gcHJvZ3JhbS53YXRjaDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmhpZGVHZW5lcmF0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5oaWRlR2VuZXJhdG9yID0gcHJvZ3JhbS5oaWRlR2VuZXJhdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uaW5jbHVkZXMpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyA9IHByb2dyYW0uaW5jbHVkZXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5pbmNsdWRlc05hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc05hbWUgPSBwcm9ncmFtLmluY2x1ZGVzTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmNvdmVyYWdlVGVzdCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0VGhyZXNob2xkID0gKHR5cGVvZiBwcm9ncmFtLmNvdmVyYWdlVGVzdCA9PT0gJ3N0cmluZycpID8gcGFyc2VJbnQocHJvZ3JhbS5jb3ZlcmFnZVRlc3QpIDogQ09NUE9ET0NfREVGQVVMVFMuZGVmYXVsdENvdmVyYWdlVGhyZXNob2xkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZVNvdXJjZUNvZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlU291cmNlQ29kZSA9IHByb2dyYW0uZGlzYWJsZVNvdXJjZUNvZGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlR3JhcGgpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlR3JhcGggPSBwcm9ncmFtLmRpc2FibGVHcmFwaDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZSkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVDb3ZlcmFnZSA9IHByb2dyYW0uZGlzYWJsZUNvdmVyYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVQcml2YXRlT3JJbnRlcm5hbFN1cHBvcnQgPSBwcm9ncmFtLmRpc2FibGVQcml2YXRlT3JJbnRlcm5hbFN1cHBvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNXYXRjaGluZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9zcmMvcmVzb3VyY2VzL2ltYWdlcy9iYW5uZXInKSkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwa2cudmVyc2lvbik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTm9kZS5qcyB2ZXJzaW9uIDogJHtwcm9jZXNzLnZlcnNpb259YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgT3BlcmF0aW5nIHN5c3RlbSA6ICR7b3NOYW1lKG9zLnBsYXRmb3JtKCksIG9zLnJlbGVhc2UoKSl9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvZ3JhbS5zZXJ2ZSAmJiAhcHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLm91dHB1dCkge1xuICAgICAgICAgICAgLy8gaWYgLXMgJiAtZCwgc2VydmUgaXRcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9ncmFtLm91dHB1dCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYCR7cHJvZ3JhbS5vdXRwdXR9IGZvbGRlciBkb2Vzbid0IGV4aXN0YCk7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgU2VydmluZyBkb2N1bWVudGF0aW9uIGZyb20gJHtwcm9ncmFtLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3Byb2dyYW0ucG9ydH1gKTtcbiAgICAgICAgICAgICAgICBzdXBlci5ydW5XZWJTZXJ2ZXIocHJvZ3JhbS5vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHByb2dyYW0uc2VydmUgJiYgIXByb2dyYW0udHNjb25maWcgJiYgIXByb2dyYW0ub3V0cHV0KSB7XG4gICAgICAgICAgICAvLyBpZiBvbmx5IC1zIGZpbmQgLi9kb2N1bWVudGF0aW9uLCBpZiBvayBzZXJ2ZSwgZWxzZSBlcnJvciBwcm92aWRlIC1kXG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHJvZ3JhbS5vdXRwdXQpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdQcm92aWRlIG91dHB1dCBnZW5lcmF0ZWQgZm9sZGVyIHdpdGggLWQgZmxhZycpO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7cHJvZ3JhbS5vdXRwdXR9IGF0IGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9ncmFtLnBvcnR9YCk7XG4gICAgICAgICAgICAgICAgc3VwZXIucnVuV2ViU2VydmVyKHByb2dyYW0ub3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwcm9ncmFtLmhpZGVHZW5lcmF0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaGlkZUdlbmVyYXRvciA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBkZWZhdWx0V2Fsa0ZPbGRlciA9IGN3ZCB8fCAnLicsXG4gICAgICAgICAgICAgICAgd2FsayA9IChkaXIsIGV4Y2x1ZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0LmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBleGNsdWRlVGVzdCA9IF8uZmluZChleGNsdWRlLCBmdW5jdGlvbihvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdsb2JGaWxlcyA9IGdsb2Iuc3luYyhvLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN3ZDogY3dkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdsb2JGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaWxlTmFtZUZvckdsb2JTZWFyY2ggPSBwYXRoLmpvaW4oZGlyLCBmaWxlKS5yZXBsYWNlKGN3ZCArIHBhdGguc2VwLCAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRHbG9iU2VhcmNoID0gZ2xvYkZpbGVzLmZpbmRJbmRleCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50ID09PSBmaWxlTmFtZUZvckdsb2JTZWFyY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3QgPSByZXN1bHRHbG9iU2VhcmNoICE9PSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKCdFeGNsdWRpbmcnLCBwYXRoLmpvaW4oZGlyLCBmaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlc3QgPSBwYXRoLmJhc2VuYW1lKG8pID09PSBmaWxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0V4Y2x1ZGluZycsIHBhdGguam9pbihkaXIsIGZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXhjbHVkZVRlc3QgPT09ICd1bmRlZmluZWQnICYmIGRpci5pbmRleE9mKCdub2RlX21vZHVsZXMnKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlID0gcGF0aC5qb2luKGRpciwgZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXQgPSBmcy5zdGF0U3luYyhmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHdhbGsoZmlsZSwgZXhjbHVkZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICgvKHNwZWN8XFwuZClcXC50cy8udGVzdChmaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybignSWdub3JpbmcnLCBmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLnRzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0luY2x1ZGluZycsIGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0udHNjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgXCIke3Byb2dyYW0udHNjb25maWd9XCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeWApO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9maWxlID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIHBhdGguZGlybmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguYmFzZW5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGN1cnJlbnQgZGlyZWN0b3J5IG9mIHRzY29uZmlnLmpzb24gYXMgYSB3b3JraW5nIGRpcmVjdG9yeVxuICAgICAgICAgICAgICAgICAgICBjd2QgPSBfZmlsZS5zcGxpdChwYXRoLnNlcCkuc2xpY2UoMCwgLTEpLmpvaW4ocGF0aC5zZXApO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgdHNjb25maWcnLCBfZmlsZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHRzQ29uZmlnRmlsZSA9IHJlYWRDb25maWcoX2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHRzQ29uZmlnRmlsZS5maWxlcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IGhhbmRsZVBhdGgoZmlsZXMsIGN3ZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhjbHVkZSA9IHRzQ29uZmlnRmlsZS5leGNsdWRlIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSB3YWxrKGN3ZCB8fCAnLicsIGV4Y2x1ZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuc2V0RmlsZXMoZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICBzdXBlci5nZW5lcmF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gIGVsc2UgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA+IDAgJiYgcHJvZ3JhbS5jb3ZlcmFnZVRlc3QpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnUnVuIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgdGVzdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZyA9IHByb2dyYW0udHNjb25maWc7XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0udHNjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgXCIke3Byb2dyYW0udHNjb25maWd9XCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeWApO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9maWxlID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKSksXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aC5iYXNlbmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb2YgdHNjb25maWcuanNvbiBhcyBhIHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgICAgICAgICAgICAgICAgIGN3ZCA9IF9maWxlLnNwbGl0KHBhdGguc2VwKS5zbGljZSgwLCAtMSkuam9pbihwYXRoLnNlcCk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyB0c2NvbmZpZycsIF9maWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgdHNDb25maWdGaWxlID0gcmVhZENvbmZpZyhfZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVzID0gdHNDb25maWdGaWxlLmZpbGVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gaGFuZGxlUGF0aChmaWxlcywgY3dkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGNsdWRlID0gdHNDb25maWdGaWxlLmV4Y2x1ZGUgfHwgW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzID0gd2Fsayhjd2QgfHwgJy4nLCBleGNsdWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIudGVzdENvdmVyYWdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9ncmFtLnRzY29uZmlnICYmIHByb2dyYW0uYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnID0gcHJvZ3JhbS50c2NvbmZpZztcbiAgICAgICAgICAgICAgICBsZXQgc291cmNlRm9sZGVyID0gcHJvZ3JhbS5hcmdzWzBdO1xuICAgICAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhzb3VyY2VGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgUHJvdmlkZWQgc291cmNlIGZvbGRlciAke3NvdXJjZUZvbGRlcn0gd2FzIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnlgKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyBwcm92aWRlZCBzb3VyY2UgZm9sZGVyJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHByb2dyYW0udHNjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFwiJHtwcm9ncmFtLnRzY29uZmlnfVwiIGZpbGUgd2FzIG5vdCBmb3VuZCBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnlgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0c0NvbmZpZ0ZpbGUgPSByZWFkQ29uZmlnKHByb2dyYW0udHNjb25maWcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGUgPSB0c0NvbmZpZ0ZpbGUuZXhjbHVkZSB8fCBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSB3YWxrKHBhdGgucmVzb2x2ZShzb3VyY2VGb2xkZXIpLCBleGNsdWRlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXIuc2V0RmlsZXMoZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCd0c2NvbmZpZy5qc29uIGZpbGUgd2FzIG5vdCBmb3VuZCwgcGxlYXNlIHVzZSAtcCBmbGFnJyk7XG4gICAgICAgICAgICAgICAgb3V0cHV0SGVscCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbInBrZyIsIl8uZm9yRWFjaCIsIl8uc29ydEJ5IiwiXy5jbG9uZURlZXAiLCJfLmZpbmRJbmRleCIsIl8uY29uY2F0IiwiXy5maW5kIiwiXy5ncm91cEJ5IiwiSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciIsIkhhbmRsZWJhcnMuVXRpbHMiLCJIYW5kbGViYXJzLlNhZmVTdHJpbmciLCJwYXRoIiwicmVzb2x2ZSIsImZzLnJlYWRGaWxlIiwicGF0aC5yZXNvbHZlIiwiSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwiLCJIYW5kbGViYXJzLmNvbXBpbGUiLCJmcy5vdXRwdXRGaWxlIiwicGF0aC5zZXAiLCJtYXJrZWQiLCJkaXJuYW1lIiwicGF0aC5kaXJuYW1lIiwicGF0aC5iYXNlbmFtZSIsImZzLmV4aXN0c1N5bmMiLCJwYXRoLmlzQWJzb2x1dGUiLCJwYXRoLmpvaW4iLCJmcy5yZWFkRmlsZVN5bmMiLCJ0cy5jcmVhdGVTb3VyY2VGaWxlIiwiXy51bmlxIiwic2VwIiwiXy51bmlxV2l0aCIsIl8uaXNFcXVhbCIsInRzLlN5bnRheEtpbmQiLCJzeXMiLCJyZWFkQ29uZmlnRmlsZSIsImZvcm1hdERpYWdub3N0aWNzIiwidHMuU2NyaXB0VGFyZ2V0IiwidHMuTW9kdWxlS2luZCIsInRzLmNyZWF0ZVByb2dyYW0iLCJwYXRoLmV4dG5hbWUiLCJ0cy5mb3JFYWNoQ2hpbGQiLCJ0cy5TeW1ib2xGbGFncyIsInRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nIiwidHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24iLCJ0cy5nZXRDbGFzc0ltcGxlbWVudHNIZXJpdGFnZUNsYXVzZUVsZW1lbnRzIiwidHMuZ2V0Q2xhc3NFeHRlbmRzSGVyaXRhZ2VDbGF1c2VFbGVtZW50IiwiZnMuY29weSIsIkxpdmVTZXJ2ZXIuc3RhcnQiLCJnbG9iIiwiY3dkIiwiZnMucmVhZGRpclN5bmMiLCJmcy5zdGF0U3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDaEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNyQixJQUFJQSxLQUFHLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFckMsSUFBSyxLQUtKO0FBTEQsV0FBSyxLQUFLO0lBQ1QsaUNBQUksQ0FBQTtJQUNKLG1DQUFLLENBQUE7SUFDRixtQ0FBSyxDQUFBO0lBQ0wsaUNBQUksQ0FBQTtDQUNQLEVBTEksS0FBSyxLQUFMLEtBQUssUUFLVDtBQUVEO0lBT0M7UUFDQyxJQUFJLENBQUMsSUFBSSxHQUFHQSxLQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUdBLEtBQUcsQ0FBQyxPQUFPLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ25CO0lBRUQscUJBQUksR0FBSjtRQUFLLGNBQU87YUFBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1lBQVAseUJBQU87O1FBQ1gsSUFBRyxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUN4QixJQUFJLENBQUMs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
