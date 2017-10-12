'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs-extra');
var path = require('path');
var LiveServer = require('live-server');
var _ = require('lodash');
var Handlebars = require('handlebars');
var semver = require('semver');
var ts = require('typescript');

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
    LEVEL[LEVEL["WARN"] = 3] = "WARN";
})(LEVEL || (LEVEL = {}));
var Logger = /** @class */ (function () {
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
        if (!this.silent) {
            return;
        }
        this.logger(this.format.apply(this, [LEVEL.INFO].concat(args)));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent) {
            return;
        }
        this.logger(this.format.apply(this, [LEVEL.ERROR].concat(args)));
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent) {
            return;
        }
        this.logger(this.format.apply(this, [LEVEL.WARN].concat(args)));
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.silent) {
            return;
        }
        this.logger(this.format.apply(this, [LEVEL.DEBUG].concat(args)));
    };
    Logger.prototype.format = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var pad = function (s, l, z) {
            if (z === void 0) { z = ''; }
            return s + Array(Math.max(0, l - s.length + 1)).join(z);
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

var CompareHelper = /** @class */ (function () {
    function CompareHelper() {
    }
    CompareHelper.prototype.helperFunc = function (context, a, operator, b, options) {
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
            return options.inverse(context);
        }
        return options.fn(context);
    };
    return CompareHelper;
}());

var OrHelper = /** @class */ (function () {
    function OrHelper() {
    }
    OrHelper.prototype.helperFunc = function (context) {
        var len = arguments.length - 1;
        var options = arguments[len];
        // We start at 1 because of options
        for (var i = 1; i < len; i++) {
            if (arguments[i]) {
                return options.fn(context);
            }
        }
        return options.inverse(context);
    };
    return OrHelper;
}());

var AngularAPIs = require('../src/data/api-list.json');
var AngularApiUtil = /** @class */ (function () {
    function AngularApiUtil() {
    }
    AngularApiUtil.prototype.findApi = function (type) {
        return {
            source: 'external',
            data: _.find(AngularAPIs, function (x) { return x.title === type; })
        };
    };
    return AngularApiUtil;
}());

var AngularVersionUtil = /** @class */ (function () {
    function AngularVersionUtil() {
    }
    AngularVersionUtil.prototype.cleanVersion = function (version) {
        return version.replace('~', '')
            .replace('^', '')
            .replace('=', '')
            .replace('<', '')
            .replace('>', '');
    };
    AngularVersionUtil.prototype.getAngularVersionOfProject = function (packageData) {
        var _result = '';
        if (packageData.dependencies) {
            var angularCore = packageData.dependencies[AngularVersionUtil.CorePackage];
            if (angularCore) {
                _result = this.cleanVersion(angularCore);
            }
        }
        return _result;
    };
    AngularVersionUtil.prototype.isAngularVersionArchived = function (version) {
        var result;
        try {
            result = semver.compare(version, '2.4.10') <= 0;
        }
        catch (e) { }
        return result;
    };
    AngularVersionUtil.prototype.prefixOfficialDoc = function (version) {
        return this.isAngularVersionArchived(version) ? 'v2.' : '';
    };
    AngularVersionUtil.prototype.getApiLink = function (api, angularVersion) {
        var angularDocPrefix = this.prefixOfficialDoc(angularVersion);
        return "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + api.path;
    };
    AngularVersionUtil.CorePackage = '@angular/core';
    return AngularVersionUtil;
}());

var BasicTypeUtil = /** @class */ (function () {
    function BasicTypeUtil() {
    }
    /**
     * Checks if a given types is a basic javascript type
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
     * @param type The type to check
     */
    BasicTypeUtil.prototype.isJavascriptType = function (type) {
        if (typeof type !== 'undefined') {
            return (type.toLowerCase() in BasicTypes);
        }
        else {
            return false;
        }
    };
    /**
     * Checks if a given type is a typescript type (That is not a javascript type)
     * https://www.typescriptlang.org/docs/handbook/basic-types.html
     * @param type The type to check
     */
    BasicTypeUtil.prototype.isTypeScriptType = function (type) {
        if (typeof type !== 'undefined') {
            return (type.toLowerCase() in BasicTypeScriptTypes);
        }
        else {
            return false;
        }
    };
    /**
     * Check if the type is a typescript or javascript type
     * @param type The type to check
     */
    BasicTypeUtil.prototype.isKnownType = function (type) {
        return this.isJavascriptType(type) || this.isTypeScriptType(type);
    };
    /**
     * Returns a official documentation link to either the javascript or typescript type
     * @param type The type to check
     * @returns The documentation link or undefined if type not found
     */
    BasicTypeUtil.prototype.getTypeUrl = function (type) {
        if (this.isJavascriptType(type)) {
            return "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/" + type;
        }
        if (this.isTypeScriptType(type)) {
            return "https://www.typescriptlang.org/docs/handbook/basic-types.html";
        }
        return undefined;
    };
    return BasicTypeUtil;
}());
var BasicTypes;
(function (BasicTypes) {
    BasicTypes[BasicTypes["number"] = 0] = "number";
    BasicTypes[BasicTypes["boolean"] = 1] = "boolean";
    BasicTypes[BasicTypes["string"] = 2] = "string";
    BasicTypes[BasicTypes["object"] = 3] = "object";
    BasicTypes[BasicTypes["date"] = 4] = "date";
    BasicTypes[BasicTypes["function"] = 5] = "function";
})(BasicTypes || (BasicTypes = {}));
var BasicTypeScriptTypes;
(function (BasicTypeScriptTypes) {
    BasicTypeScriptTypes[BasicTypeScriptTypes["any"] = 0] = "any";
    BasicTypeScriptTypes[BasicTypeScriptTypes["void"] = 1] = "void";
})(BasicTypeScriptTypes || (BasicTypeScriptTypes = {}));

var JsdocParserUtil = /** @class */ (function () {
    function JsdocParserUtil() {
    }
    JsdocParserUtil.prototype.isVariableLike = function (node) {
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
    };
    JsdocParserUtil.prototype.getJSDocTags = function (node, kind) {
        var docs = this.getJSDocs(node);
        if (docs) {
            var result = [];
            for (var _i = 0, docs_1 = docs; _i < docs_1.length; _i++) {
                var doc = docs_1[_i];
                if (ts.isJSDocParameterTag(doc)) {
                    if (doc.kind === kind) {
                        result.push(doc);
                    }
                }
                else if (ts.isJSDoc(doc)) {
                    result.push.apply(result, _.filter(doc.tags, function (tag) { return tag.kind === kind; }));
                }
                else {
                    throw new Error('Unexpected type');
                }
            }
            return result;
        }
    };
    JsdocParserUtil.prototype.getJSDocs = function (node) {
        // TODO: jsDocCache is internal, see if there's a way around it
        var cache = node.jsDocCache;
        if (!cache) {
            cache = this.getJSDocsWorker(node, []).filter(function (x) { return x; });
            node.jsDocCache = cache;
        }
        return cache;
    };
    // Try to recognize this pattern when node is initializer
    // of variable declaration and JSDoc comments are on containing variable statement.
    // /**
    //   * @param {number} name
    //   * @returns {number}
    //   */
    // var x = function(name) { return name.length; }
    JsdocParserUtil.prototype.getJSDocsWorker = function (node, cache) {
        var parent = node.parent;
        var isInitializerOfVariableDeclarationInStatement = this.isVariableLike(parent) &&
            parent.initializer === node &&
            ts.isVariableStatement(parent.parent.parent);
        var isVariableOfVariableDeclarationStatement = this.isVariableLike(node) &&
            ts.isVariableStatement(parent.parent);
        var variableStatementNode = isInitializerOfVariableDeclarationInStatement ? parent.parent.parent :
            isVariableOfVariableDeclarationStatement ? parent.parent :
                undefined;
        if (variableStatementNode) {
            cache = this.getJSDocsWorker(variableStatementNode, cache);
        }
        // Also recognize when the node is the RHS of an assignment expression
        var isSourceOfAssignmentExpressionStatement = parent && parent.parent &&
            parent.kind === ts.SyntaxKind.BinaryExpression &&
            parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            parent.parent.kind === ts.SyntaxKind.ExpressionStatement;
        if (isSourceOfAssignmentExpressionStatement) {
            cache = this.getJSDocsWorker(parent.parent, cache);
        }
        var isModuleDeclaration = node.kind === ts.SyntaxKind.ModuleDeclaration &&
            parent && parent.kind === ts.SyntaxKind.ModuleDeclaration;
        var isPropertyAssignmentExpression = parent && parent.kind === ts.SyntaxKind.PropertyAssignment;
        if (isModuleDeclaration || isPropertyAssignmentExpression) {
            cache = this.getJSDocsWorker(parent, cache);
        }
        // Pull parameter comments from declaring function as well
        if (ts.isParameter(node)) {
            cache = _.concat(cache, this.getJSDocParameterTags(node));
        }
        if (this.isVariableLike(node) && node.initializer) {
            cache = _.concat(cache, node.initializer.jsDoc);
        }
        cache = _.concat(cache, node.jsDoc);
        return cache;
    };
    JsdocParserUtil.prototype.getJSDocParameterTags = function (param) {
        var func = param.parent;
        var tags = this.getJSDocTags(func, ts.SyntaxKind.JSDocParameterTag);
        if (!param.name) {
            // this is an anonymous jsdoc param from a `function(type1, type2): type3` specification
            var i = func.parameters.indexOf(param);
            var paramTags = _.filter(tags, function (tag) { return ts.isJSDocParameterTag(tag); });
            if (paramTags && 0 <= i && i < paramTags.length) {
                return [paramTags[i]];
            }
        }
        else if (ts.isIdentifier(param.name)) {
            var name_1 = param.name.text;
            return _.filter(tags, function (tag) { return ts && ts.isJSDocParameterTag(tag) && tag.parameterName.text === name_1; });
        }
        else {
            // TODO: it's a destructured parameter, so it should look up an "object type" series of multiple lines
            // But multi-line object types aren't supported yet either
            return undefined;
        }
    };
    return JsdocParserUtil;
}());

var FunctionSignatureHelper = /** @class */ (function () {
    function FunctionSignatureHelper(configuration, dependenciesEngine) {
        this.configuration = configuration;
        this.dependenciesEngine = dependenciesEngine;
        this.angularVersionUtil = new AngularVersionUtil();
        this.basicTypeUtil = new BasicTypeUtil();
    }
    FunctionSignatureHelper.prototype.handleFunction = function (arg) {
        var _this = this;
        if (arg.function.length === 0) {
            return "" + arg.name + this.getOptionalString(arg) + ": () => void";
        }
        var argums = arg.function.map(function (argu) {
            var _result = _this.dependenciesEngine.find(argu.type);
            if (_result) {
                if (_result.source === 'internal') {
                    var path$$1 = _result.data.type;
                    if (_result.data.type === 'class') {
                        path$$1 = 'classe';
                    }
                    return "" + argu.name + _this.getOptionalString(arg) + ": <a href=\"../" + path$$1 + "s/" + _result.data.name + ".html\">" + argu.type + "</a>";
                }
                else {
                    var path$$1 = _this.angularVersionUtil.getApiLink(_result.data, _this.configuration.mainData.angularVersion);
                    return "" + argu.name + _this.getOptionalString(arg) + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + argu.type + "</a>";
                }
            }
            else if (_this.basicTypeUtil.isKnownType(argu.type)) {
                var path$$1 = _this.basicTypeUtil.getTypeUrl(argu.type);
                return "" + argu.name + _this.getOptionalString(arg) + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + argu.type + "</a>";
            }
            else {
                if (argu.name && argu.type) {
                    return "" + argu.name + _this.getOptionalString(arg) + ": " + argu.type;
                }
                else {
                    return "" + argu.name.text;
                }
            }
        });
        return "" + arg.name + this.getOptionalString(arg) + ": (" + argums + ") => void";
    };
    FunctionSignatureHelper.prototype.getOptionalString = function (arg) {
        return arg.optional ? '?' : '';
    };
    FunctionSignatureHelper.prototype.helperFunc = function (context, method) {
        var _this = this;
        var args = [];
        if (method.args) {
            args = method.args.map(function (arg) {
                var _result = _this.dependenciesEngine.find(arg.type);
                if (_result) {
                    if (_result.source === 'internal') {
                        var path$$1 = _result.data.type;
                        if (_result.data.type === 'class') {
                            path$$1 = 'classe';
                        }
                        return "" + arg.name + _this.getOptionalString(arg) + ": <a href=\"../" + path$$1 + "s/" + _result.data.name + ".html\">" + arg.type + "</a>";
                    }
                    else {
                        var path$$1 = _this.angularVersionUtil.getApiLink(_result.data, _this.configuration.mainData.angularVersion);
                        return "" + arg.name + _this.getOptionalString(arg) + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + arg.type + "</a>";
                    }
                }
                else if (arg.dotDotDotToken) {
                    return "..." + arg.name + ": " + arg.type;
                }
                else if (arg.function) {
                    return _this.handleFunction(arg);
                }
                else if (_this.basicTypeUtil.isKnownType(arg.type)) {
                    var path$$1 = _this.basicTypeUtil.getTypeUrl(arg.type);
                    return "" + arg.name + _this.getOptionalString(arg) + ": <a href=\"" + path$$1 + "\" target=\"_blank\">" + arg.type + "</a>";
                }
                else {
                    return "" + arg.name + _this.getOptionalString(arg) + ": " + arg.type;
                }
            }).join(', ');
        }
        if (method.name) {
            return method.name + "(" + args + ")";
        }
        else {
            return "(" + args + ")";
        }
    };
    return FunctionSignatureHelper;
}());

var IsNotToggleHelper = /** @class */ (function () {
    function IsNotToggleHelper(configuration) {
        this.configuration = configuration;
    }
    IsNotToggleHelper.prototype.helperFunc = function (context, type, options) {
        var result = this.configuration.mainData.toggleMenuItems.indexOf(type);
        if (this.configuration.mainData.toggleMenuItems.indexOf('all') !== -1) {
            return options.inverse(context);
        }
        else if (result === -1) {
            return options.fn(context);
        }
        else {
            return options.inverse(context);
        }
    };
    return IsNotToggleHelper;
}());

var IfStringHelper = /** @class */ (function () {
    function IfStringHelper() {
    }
    IfStringHelper.prototype.helperFunc = function (context, a, options) {
        if (typeof a === 'string') {
            return options.fn(context);
        }
        return options.inverse(context);
    };
    return IfStringHelper;
}());

var OrLengthHelper = /** @class */ (function () {
    function OrLengthHelper() {
    }
    OrLengthHelper.prototype.helperFunc = function (context) {
        var len = arguments.length - 1;
        var options = arguments[len];
        // We start at 1 because of options
        for (var i = 1; i < len; i++) {
            if (typeof arguments[i] !== 'undefined') {
                if (arguments[i].length > 0) {
                    return options.fn(context);
                }
            }
        }
        return options.inverse(context);
    };
    return OrLengthHelper;
}());

var FilterAngular2ModulesHelper = /** @class */ (function () {
    function FilterAngular2ModulesHelper() {
    }
    FilterAngular2ModulesHelper.prototype.helperFunc = function (context, text, options) {
        var NG2_MODULES = [
            'BrowserModule',
            'FormsModule',
            'HttpModule',
            'RouterModule'
        ];
        var len = NG2_MODULES.length;
        var i = 0;
        var result = false;
        for (i; i < len; i++) {
            if (text.indexOf(NG2_MODULES[i]) > -1) {
                result = true;
            }
        }
        if (result) {
            return options.fn(context);
        }
        else {
            return options.inverse(context);
        }
    };
    return FilterAngular2ModulesHelper;
}());

var DebugHelper = /** @class */ (function () {
    function DebugHelper() {
    }
    DebugHelper.prototype.helperFunc = function (context, optionalValue) {
        console.log('Current Context');
        console.log('====================');
        console.log(context);
        if (optionalValue) {
            console.log('OptionalValue');
            console.log('====================');
            console.log(optionalValue);
        }
    };
    return DebugHelper;
}());

var BreakLinesHelper = /** @class */ (function () {
    function BreakLinesHelper(bars) {
        this.bars = bars;
    }
    BreakLinesHelper.prototype.helperFunc = function (context, text) {
        text = this.bars.Utils.escapeExpression(text);
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        text = text.replace(/ /gm, '&nbsp;');
        text = text.replace(/	/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');
        return new Handlebars.SafeString(text);
    };
    return BreakLinesHelper;
}());

var CleanParagraphHelper = /** @class */ (function () {
    function CleanParagraphHelper() {
    }
    CleanParagraphHelper.prototype.helperFunc = function (context, text) {
        text = text.replace(/<p>/gm, '');
        text = text.replace(/<\/p>/gm, '');
        return new Handlebars.SafeString(text);
    };
    return CleanParagraphHelper;
}());

var EscapeSimpleQuoteHelper = /** @class */ (function () {
    function EscapeSimpleQuoteHelper() {
    }
    EscapeSimpleQuoteHelper.prototype.helperFunc = function (context, text) {
        if (!text) {
            return;
        }
        text = text.replace(/'/g, "\\'");
        text = text.replace(/(\r\n|\n|\r)/gm, '');
        return text;
    };
    return EscapeSimpleQuoteHelper;
}());

var BreakCommaHelper = /** @class */ (function () {
    function BreakCommaHelper(bars) {
        this.bars = bars;
    }
    BreakCommaHelper.prototype.helperFunc = function (context, text) {
        text = this.bars.Utils.escapeExpression(text);
        text = text.replace(/,/g, ',<br>');
        return new Handlebars.SafeString(text);
    };
    return BreakCommaHelper;
}());

var ModifKindHelper = /** @class */ (function () {
    function ModifKindHelper() {
    }
    ModifKindHelper.prototype.helperFunc = function (context, kind) {
        var _kindText = '';
        switch (kind) {
            case ts.SyntaxKind.PrivateKeyword:
                _kindText = 'Private';
                break;
            case ts.SyntaxKind.ProtectedKeyword:
                _kindText = 'Protected';
                break;
            case ts.SyntaxKind.PublicKeyword:
                _kindText = 'Public';
                break;
            case ts.SyntaxKind.StaticKeyword:
                _kindText = 'Static';
                break;
        }
        return new Handlebars.SafeString(_kindText);
    };
    return ModifKindHelper;
}());

var ModifIconHelper = /** @class */ (function () {
    function ModifIconHelper() {
    }
    ModifIconHelper.prototype.helperFunc = function (context, kind) {
        var _kindText = '';
        switch (kind) {
            case ts.SyntaxKind.PrivateKeyword:
                _kindText = 'lock'; // private
                break;
            case ts.SyntaxKind.ProtectedKeyword:
                _kindText = 'lock'; // protected
                break;
            case ts.SyntaxKind.StaticKeyword:
                _kindText = 'reset'; // static
                break;
            case ts.SyntaxKind.ExportKeyword:
                _kindText = 'export'; // export
                break;
            default:
                _kindText = 'reset';
                break;
        }
        return _kindText;
    };
    return ModifIconHelper;
}());

var RelativeURLHelper = /** @class */ (function () {
    function RelativeURLHelper() {
    }
    RelativeURLHelper.prototype.helperFunc = function (context, currentDepth, options) {
        switch (currentDepth) {
            case 0:
                return './';
            case 1:
                return '../';
            case 2:
                return '../../';
        }
        return '';
    };
    return RelativeURLHelper;
}());

var JsdocReturnsCommentHelper = /** @class */ (function () {
    function JsdocReturnsCommentHelper() {
    }
    JsdocReturnsCommentHelper.prototype.helperFunc = function (context, jsdocTags, options) {
        var i = 0;
        var len = jsdocTags.length;
        var result;
        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (jsdocTags[i].tagName.text === 'returns') {
                    result = jsdocTags[i].comment;
                    break;
                }
            }
        }
        return result;
    };
    return JsdocReturnsCommentHelper;
}());

var JsdocCodeExampleHelper = /** @class */ (function () {
    function JsdocCodeExampleHelper() {
    }
    JsdocCodeExampleHelper.prototype.cleanTag = function (comment) {
        if (comment.charAt(0) === '*') {
            comment = comment.substring(1, comment.length);
        }
        if (comment.charAt(0) === ' ') {
            comment = comment.substring(1, comment.length);
        }
        if (comment.indexOf('<p>') === 0) {
            comment = comment.substring(3, comment.length);
        }
        if (comment.substr(-1) === '\n') {
            comment = comment.substring(0, comment.length - 1);
        }
        if (comment.substr(-4) === '</p>') {
            comment = comment.substring(0, comment.length - 4);
        }
        return comment;
    };
    JsdocCodeExampleHelper.prototype.getHtmlEntities = function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    JsdocCodeExampleHelper.prototype.helperFunc = function (context, jsdocTags, options) {
        var i = 0;
        var len = jsdocTags.length;
        var tags = [];
        var type = 'html';
        if (options.hash.type) {
            type = options.hash.type;
        }
        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (jsdocTags[i].tagName.text === 'example') {
                    var tag = {};
                    if (jsdocTags[i].comment) {
                        if (jsdocTags[i].comment.indexOf('<caption>') !== -1) {
                            tag.comment = jsdocTags[i].comment.replace(/<caption>/g, '<b><i>').replace(/\/caption>/g, '/b></i>');
                        }
                        else {
                            tag.comment = "<pre class=\"line-numbers\"><code class=\"language-" + type + "\">" +
                                this.getHtmlEntities(this.cleanTag(jsdocTags[i].comment)) + "</code></pre>";
                        }
                    }
                    tags.push(tag);
                }
            }
        }
        if (tags.length > 0) {
            context.tags = tags;
            return options.fn(context);
        }
    };
    return JsdocCodeExampleHelper;
}());

var JsdocExampleHelper = /** @class */ (function () {
    function JsdocExampleHelper() {
    }
    JsdocExampleHelper.prototype.helperFunc = function (context, jsdocTags, options) {
        var i = 0;
        var len = jsdocTags.length;
        var tags = [];
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
            context.tags = tags;
            return options.fn(context);
        }
    };
    return JsdocExampleHelper;
}());

var ts$2 = require('typescript');
function kindToType(kind) {
    var _type = '';
    switch (kind) {
        case ts$2.SyntaxKind.StringKeyword:
            _type = 'string';
            break;
        case ts$2.SyntaxKind.NumberKeyword:
            _type = 'number';
            break;
        case ts$2.SyntaxKind.ArrayType:
        case ts$2.SyntaxKind.ArrayLiteralExpression:
            _type = '[]';
            break;
        case ts$2.SyntaxKind.VoidKeyword:
            _type = 'void';
            break;
        case ts$2.SyntaxKind.FunctionType:
            _type = 'function';
            break;
        case ts$2.SyntaxKind.TypeLiteral:
            _type = 'literal type';
            break;
        case ts$2.SyntaxKind.BooleanKeyword:
            _type = 'boolean';
            break;
        case ts$2.SyntaxKind.AnyKeyword:
            _type = 'any';
            break;
        case ts$2.SyntaxKind.NullKeyword:
            _type = 'null';
            break;
        case ts$2.SyntaxKind.NeverKeyword:
            _type = 'never';
            break;
        case ts$2.SyntaxKind.ObjectKeyword:
        case ts$2.SyntaxKind.ObjectLiteralExpression:
            _type = 'object';
            break;
    }
    return _type;
}

var JsdocParamsHelper = /** @class */ (function () {
    function JsdocParamsHelper() {
    }
    JsdocParamsHelper.prototype.helperFunc = function (context, jsdocTags, options) {
        var i = 0;
        var len = jsdocTags.length;
        var tags = [];
        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (jsdocTags[i].tagName.text === 'param') {
                    var tag = {};
                    if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.kind) {
                        tag.type = kindToType(jsdocTags[i].typeExpression.type.kind);
                    }
                    if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                        tag.type = jsdocTags[i].typeExpression.type.name.text;
                    }
                    else {
                        tag.type = jsdocTags[i].type;
                    }
                    if (jsdocTags[i].comment) {
                        tag.comment = jsdocTags[i].comment;
                    }
                    if (jsdocTags[i].name) {
                        if (jsdocTags[i].name.text) {
                            tag.name = jsdocTags[i].name.text;
                        }
                        else {
                            tag.name = jsdocTags[i].name;
                        }
                    }
                    if (jsdocTags[i].optional) {
                        tag.optional = true;
                    }
                    tags.push(tag);
                }
            }
        }
        if (tags.length >= 1) {
            context.tags = tags;
            return options.fn(context);
        }
    };
    return JsdocParamsHelper;
}());

var JsdocParamsValidHelper = /** @class */ (function () {
    function JsdocParamsValidHelper() {
    }
    JsdocParamsValidHelper.prototype.helperFunc = function (context, jsdocTags, options) {
        var i = 0;
        var len = jsdocTags.length;
        var valid = false;
        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (jsdocTags[i].tagName.text === 'param') {
                    valid = true;
                }
            }
        }
        if (valid) {
            return options.fn(context);
        }
        else {
            return options.inverse(context);
        }
    };
    return JsdocParamsValidHelper;
}());

var JsdocDefaultHelper = /** @class */ (function () {
    function JsdocDefaultHelper() {
    }
    JsdocDefaultHelper.prototype.helperFunc = function (context, jsdocTags, options) {
        if (jsdocTags) {
            var i = 0;
            var len = jsdocTags.length;
            var tag = {};
            var defaultValue = false;
            for (i; i < len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'default') {
                        defaultValue = true;
                        if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                            tag.type = jsdocTags[i].typeExpression.type.name.text;
                        }
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment;
                        }
                        if (jsdocTags[i].name) {
                            tag.name = jsdocTags[i].name.text;
                        }
                    }
                }
            }
            if (defaultValue) {
                context.tag = tag;
                return options.fn(context);
            }
        }
    };
    return JsdocDefaultHelper;
}());

var LinkTypeHelper = /** @class */ (function () {
    function LinkTypeHelper(configuration, dependenciesEngine) {
        this.configuration = configuration;
        this.dependenciesEngine = dependenciesEngine;
        this.angularVersionUtil = new AngularVersionUtil();
        this.basicTypeUtil = new BasicTypeUtil();
    }
    LinkTypeHelper.prototype.helperFunc = function (context, name, options) {
        var _result = this.dependenciesEngine.find(name);
        var angularDocPrefix = this.angularVersionUtil.prefixOfficialDoc(this.configuration.mainData.angularVersion);
        if (_result) {
            context.type = {
                raw: name
            };
            if (_result.source === 'internal') {
                if (_result.data.type === 'class') {
                    _result.data.type = 'classe';
                }
                context.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                if (_result.data.type === 'miscellaneous') {
                    var mainpage = '';
                    switch (_result.data.subtype) {
                        case 'enum':
                            mainpage = 'enumerations';
                            break;
                        case 'function':
                            mainpage = 'functions';
                            break;
                        case 'typealias':
                            mainpage = 'typealiases';
                            break;
                        case 'variable':
                            mainpage = 'variables';
                    }
                    context.type.href = '../' + _result.data.type + '/' + mainpage + '.html#' + _result.data.name;
                }
                context.type.target = '_self';
            }
            else {
                context.type.href = "https://" + angularDocPrefix + "angular.io/docs/ts/latest/api/" + _result.data.path;
                context.type.target = '_blank';
            }
            return options.fn(context);
        }
        else if (this.basicTypeUtil.isKnownType(name)) {
            context.type = {
                raw: name
            };
            context.type.target = '_blank';
            context.type.href = this.basicTypeUtil.getTypeUrl(name);
            return options.fn(context);
        }
        else {
            return options.inverse(context);
        }
    };
    return LinkTypeHelper;
}());

var IndexableSignatureHelper = /** @class */ (function () {
    function IndexableSignatureHelper() {
    }
    IndexableSignatureHelper.prototype.helperFunc = function (context, method) {
        var args = method.args.map(function (arg) { return arg.name + ": " + arg.type; }).join(', ');
        if (method.name) {
            return method.name + "[" + args + "]";
        }
        else {
            return "[" + args + "]";
        }
    };
    return IndexableSignatureHelper;
}());

var ObjectHelper = /** @class */ (function () {
    function ObjectHelper() {
    }
    ObjectHelper.prototype.helperFunc = function (context, text) {
        text = JSON.stringify(text);
        text = text.replace(/{"/, '{<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
        text = text.replace(/,"/, ',<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
        text = text.replace(/}$/, '<br>}');
        return new Handlebars.SafeString(text);
    };
    return ObjectHelper;
}());

function extractLeadingText(string, completeTag) {
    var tagIndex = string.indexOf(completeTag);
    var leadingText = undefined;
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
    var processTheLink = function (string, tagInfo, leadingText) {
        var leading = extractLeadingText(string, tagInfo.completeTag), linkText, split, target, stringtoReplace;
        linkText = (leadingText) ? leadingText : (leading.leadingText || '');
        split = splitLinkText(tagInfo.text);
        target = split.target;
        if (leading.leadingText !== undefined) {
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
     * {@link http://www.google.com|Google} or {@link https://github.com GitHub} or [Github]{@link https://github.com} to [Github](https://github.com)
     */
    var replaceLinkTag = function (str) {
        // new RegExp('\\[((?:.|\n)+?)]\\{@link\\s+((?:.|\n)+?)\\}', 'i').exec('ee [TO DO]{@link Todo} fo') -> "[TO DO]{@link Todo}", "TO DO", "Todo"
        // new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i').exec('ee [TODO]{@link Todo} fo') -> "{@link Todo}", "Todo"
        var tagRegExpLight = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), tagRegExpFull = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'), tagRegExp, matches, previousString, tagInfo = [];
        tagRegExp = (str.indexOf(']{') !== -1) ? tagRegExpFull : tagRegExpLight;
        function replaceMatch(replacer, tag, match, text, linkText) {
            var matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);
            if (linkText) {
                return replacer(str, matchedTag, linkText);
            }
            else {
                return replacer(str, matchedTag);
            }
        }
        do {
            matches = tagRegExp.exec(str);
            if (matches) {
                previousString = str;
                if (matches.length === 2) {
                    str = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                }
                if (matches.length === 3) {
                    str = replaceMatch(processTheLink, 'link', matches[0], matches[2], matches[1]);
                }
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

var ParseDescriptionHelper = /** @class */ (function () {
    function ParseDescriptionHelper(dependenciesEngine) {
        this.dependenciesEngine = dependenciesEngine;
    }
    ParseDescriptionHelper.prototype.helperFunc = function (context, description, depth) {
        var _this = this;
        var tagRegExpLight = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i');
        var tagRegExpFull = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i');
        var tagRegExp;
        var matches;
        var previousString;
        var tagInfo = [];
        tagRegExp = (description.indexOf(']{') !== -1) ? tagRegExpFull : tagRegExpLight;
        var processTheLink = function (string, tagInfo, leadingText) {
            var leading = extractLeadingText(string, tagInfo.completeTag);
            var split;
            var result;
            var newLink;
            var rootPath;
            var stringtoReplace;
            var anchor = '';
            split = splitLinkText(tagInfo.text);
            if (typeof split.linkText !== 'undefined') {
                result = _this.dependenciesEngine.findInCompodoc(split.target);
            }
            else {
                var info = tagInfo.text;
                if (tagInfo.text.indexOf('#') !== -1) {
                    anchor = tagInfo.text.substr(tagInfo.text.indexOf('#'), tagInfo.text.length);
                    info = tagInfo.text.substr(0, tagInfo.text.indexOf('#'));
                }
                result = _this.dependenciesEngine.findInCompodoc(info);
            }
            if (result) {
                if (leadingText) {
                    stringtoReplace = '[' + leadingText + ']' + tagInfo.completeTag;
                }
                else if (leading.leadingText !== undefined) {
                    stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
                }
                else if (typeof split.linkText !== 'undefined') {
                    stringtoReplace = tagInfo.completeTag;
                }
                else {
                    stringtoReplace = tagInfo.completeTag;
                }
                if (result.type === 'class') {
                    result.type = 'classe';
                }
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
                if (leading.leadingText !== undefined) {
                    label = leading.leadingText;
                }
                if (typeof split.linkText !== 'undefined') {
                    label = split.linkText;
                }
                newLink = "<a href=\"" + rootPath + result.type + "s/" + result.name + ".html" + anchor + "\">" + label + "</a>";
                return string.replace(stringtoReplace, newLink);
            }
            else {
                return string;
            }
        };
        function replaceMatch(replacer, tag, match, text, linkText) {
            var matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);
            if (linkText) {
                return replacer(description, matchedTag, linkText);
            }
            else {
                return replacer(description, matchedTag);
            }
        }
        do {
            matches = tagRegExp.exec(description);
            if (matches) {
                previousString = description;
                if (matches.length === 2) {
                    description = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                }
                if (matches.length === 3) {
                    description = replaceMatch(processTheLink, 'link', matches[0], matches[2], matches[1]);
                }
            }
        } while (matches && previousString !== description);
        return description;
    };
    return ParseDescriptionHelper;
}());

var HtmlEngineHelpers = /** @class */ (function () {
    function HtmlEngineHelpers() {
    }
    HtmlEngineHelpers.prototype.registerHelpers = function (bars, configuration, dependenciesEngine) {
        this.registerHelper(bars, 'compare', new CompareHelper());
        this.registerHelper(bars, 'or', new OrHelper());
        this.registerHelper(bars, 'functionSignature', new FunctionSignatureHelper(configuration, dependenciesEngine));
        this.registerHelper(bars, 'isNotToggle', new IsNotToggleHelper(configuration));
        this.registerHelper(bars, 'ifString', new IfStringHelper());
        this.registerHelper(bars, 'orLength', new OrLengthHelper());
        this.registerHelper(bars, 'filterAngular2Modules', new FilterAngular2ModulesHelper());
        this.registerHelper(bars, 'debug', new DebugHelper());
        this.registerHelper(bars, 'breaklines', new BreakLinesHelper(bars));
        this.registerHelper(bars, 'clean-paragraph', new CleanParagraphHelper());
        this.registerHelper(bars, 'escapeSimpleQuote', new EscapeSimpleQuoteHelper());
        this.registerHelper(bars, 'breakComma', new BreakCommaHelper(bars));
        this.registerHelper(bars, 'modifKind', new ModifKindHelper());
        this.registerHelper(bars, 'modifIcon', new ModifIconHelper());
        this.registerHelper(bars, 'relativeURL', new RelativeURLHelper());
        this.registerHelper(bars, 'jsdoc-returns-comment', new JsdocReturnsCommentHelper());
        this.registerHelper(bars, 'jsdoc-code-example', new JsdocCodeExampleHelper());
        this.registerHelper(bars, 'jsdoc-example', new JsdocExampleHelper());
        this.registerHelper(bars, 'jsdoc-params', new JsdocParamsHelper());
        this.registerHelper(bars, 'jsdoc-params-valid', new JsdocParamsValidHelper());
        this.registerHelper(bars, 'jsdoc-default', new JsdocDefaultHelper());
        this.registerHelper(bars, 'linkType', new LinkTypeHelper(configuration, dependenciesEngine));
        this.registerHelper(bars, 'indexableSignature', new IndexableSignatureHelper());
        this.registerHelper(bars, 'object', new ObjectHelper());
        this.registerHelper(bars, 'parseDescription', new ParseDescriptionHelper(dependenciesEngine));
    };
    HtmlEngineHelpers.prototype.registerHelper = function (bars, key, helper) {
        Handlebars.registerHelper(key, function () {
            // tslint:disable-next-line:no-invalid-this
            return helper.helperFunc.apply(helper, [this].concat(_.slice(arguments)));
        });
    };
    return HtmlEngineHelpers;
}());

var FileEngine = /** @class */ (function () {
    function FileEngine() {
    }
    FileEngine.prototype.get = function (filepath) {
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(filepath), 'utf8', function (err, data) {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                }
                else {
                    resolve$$1(data);
                }
            });
        });
    };
    FileEngine.prototype.write = function (filepath, contents) {
        return new Promise(function (resolve$$1, reject) {
            fs.outputFile(path.resolve(filepath), contents, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve$$1();
                }
            });
        });
    };
    /**
     * @param file The file to check
     */
    FileEngine.prototype.existsSync = function (file) {
        return fs.existsSync(file);
    };
    return FileEngine;
}());

var HtmlEngine = /** @class */ (function () {
    function HtmlEngine(configuration, dependenciesEngine, fileEngine) {
        if (fileEngine === void 0) { fileEngine = new FileEngine(); }
        this.fileEngine = fileEngine;
        this.cache = {};
        var helper = new HtmlEngineHelpers();
        helper.registerHelpers(Handlebars, configuration, dependenciesEngine);
    }
    HtmlEngine.prototype.init = function () {
        var _this = this;
        var partials = [
            'menu',
            'overview',
            'markdown',
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
            'index',
            'index-directive',
            'index-misc',
            'search-results',
            'search-input',
            'link-type',
            'block-method',
            'block-enum',
            'block-property',
            'block-index',
            'block-constructor',
            'block-typealias',
            'coverage-report',
            'miscellaneous-functions',
            'miscellaneous-variables',
            'miscellaneous-typealiases',
            'miscellaneous-enumerations',
            'additional-page'
        ];
        return Promise
            .all(partials.map(function (partial) {
            return _this.fileEngine
                .get(path.resolve(__dirname + '/../src/templates/partials/' + partial + '.hbs'))
                .then(function (data) { return Handlebars.registerPartial(partial, data); });
        })).then(function () {
            return _this.fileEngine
                .get(path.resolve(__dirname + '/../src/templates/page.hbs'))
                .then(function (data) { return _this.cache.page = data; });
        }).then(function () { });
    };
    HtmlEngine.prototype.render = function (mainData, page) {
        var o = mainData;
        Object.assign(o, page);
        var template = Handlebars.compile(this.cache.page);
        return template({
            data: o
        });
    };
    HtmlEngine.prototype.generateCoverageBadge = function (outputFolder, coverageData) {
        var _this = this;
        return this.fileEngine.get(path.resolve(__dirname + '/../src/templates/partials/coverage-badge.hbs'))
            .then(function (data) {
            var template = Handlebars.compile(data);
            var result = template({
                data: coverageData
            });
            var testOutputDir = outputFolder.match(process.cwd());
            if (!testOutputDir) {
                outputFolder = outputFolder.replace(process.cwd(), '');
            }
            return _this.fileEngine
                .write(outputFolder + path.sep + '/images/coverage-badge.svg', result)
                .catch(function (err) {
                logger.error('Error during coverage badge file generation ', err);
                return Promise.reject(err);
            });
        }, function (err) { return Promise.reject('Error during coverage badge generation'); });
    };
    return HtmlEngine;
}());

var marked$1 = require('marked');
var MarkdownEngine = /** @class */ (function () {
    function MarkdownEngine(fileEngine) {
        if (fileEngine === void 0) { fileEngine = new FileEngine(); }
        var _this = this;
        this.fileEngine = fileEngine;
        /**
         * List of markdown files without .md extension
         */
        this.markdownFiles = [
            'README',
            'CHANGELOG',
            'LICENSE',
            'CONTRIBUTING',
            'TODO'
        ];
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
        var self = this;
        renderer.image = function () {
            // tslint:disable-next-line:no-invalid-this
            self.renderImage.apply(self, [this].concat(_.slice(arguments)));
        };
        marked$1.setOptions({
            renderer: renderer,
            breaks: false
        });
    }
    MarkdownEngine.prototype.renderImage = function (context, href, title, text) {
        var out = '<img src="' + href + '" alt="' + text + '" class="img-responsive"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += context.options.xhtml ? '/>' : '>';
        return out;
    };
    MarkdownEngine.prototype.getTraditionalMarkdown = function (filepath) {
        var _this = this;
        return this.fileEngine.get(process.cwd() + path.sep + filepath + '.md')
            .catch(function (err) { return _this.fileEngine.get(process.cwd() + path.sep + filepath).then(); })
            .then(function (data) { return marked$1(data); });
    };
    MarkdownEngine.prototype.getReadmeFile = function () {
        return this.fileEngine.get(process.cwd() + path.sep + 'README.md').then(function (data) { return marked$1(data); });
    };
    MarkdownEngine.prototype.readNeighbourReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file);
        var readmeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md';
        return fs.readFileSync(readmeFile, 'utf8');
    };
    MarkdownEngine.prototype.hasNeighbourReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file);
        var readmeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md';
        return this.fileEngine.existsSync(readmeFile);
    };
    MarkdownEngine.prototype.componentReadmeFile = function (file) {
        var dirname$$1 = path.dirname(file);
        var readmeFile = dirname$$1 + path.sep + 'README.md';
        var readmeAlternativeFile = dirname$$1 + path.sep + path.basename(file, '.ts') + '.md';
        var finalPath = '';
        if (this.fileEngine.existsSync(readmeFile)) {
            finalPath = readmeFile;
        }
        else {
            finalPath = readmeAlternativeFile;
        }
        return finalPath;
    };
    /**
     * Checks if any of the markdown files is exists with or without endings
     */
    MarkdownEngine.prototype.hasRootMarkdowns = function () {
        var _this = this;
        return this.addEndings(this.markdownFiles)
            .some(function (x) { return _this.fileEngine.existsSync(process.cwd() + path.sep + x); });
    };
    MarkdownEngine.prototype.listRootMarkdowns = function () {
        var _this = this;
        var foundFiles = this.markdownFiles
            .filter(function (x) {
            return _this.fileEngine.existsSync(process.cwd() + path.sep + x + '.md') ||
                _this.fileEngine.existsSync(process.cwd() + path.sep + x);
        });
        return this.addEndings(foundFiles);
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
    /**
     * ['README'] => ['README', 'README.md']
     */
    MarkdownEngine.prototype.addEndings = function (files) {
        return _.flatMap(files, function (x) { return [x, x + '.md']; });
    };
    return MarkdownEngine;
}());

var COMPODOC_DEFAULTS = {
    title: 'Application documentation',
    additionalEntryName: 'Additional documentation',
    additionalEntryPath: 'additional-documentation',
    folder: './documentation/',
    port: 8080,
    theme: 'gitbook',
    base: '/',
    defaultCoverageThreshold: 70,
    defaultCoverageMinimumPerFile: 0,
    toggleMenuItems: ['all'],
    disableSourceCode: false,
    disableGraph: false,
    disableMainGraph: false,
    disableCoverage: false,
    disablePrivateOrInternalSupport: false,
    PAGE_TYPES: {
        ROOT: 'root',
        INTERNAL: 'internal'
    }
};

var Configuration = /** @class */ (function () {
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
            readme: false,
            changelog: '',
            contributing: '',
            license: '',
            todo: '',
            markdowns: [],
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
            disableMainGraph: COMPODOC_DEFAULTS.disableMainGraph,
            disableCoverage: COMPODOC_DEFAULTS.disableCoverage,
            disablePrivateOrInternalSupport: COMPODOC_DEFAULTS.disablePrivateOrInternalSupport,
            watch: false,
            mainGraph: '',
            coverageTest: false,
            coverageTestThreshold: COMPODOC_DEFAULTS.defaultCoverageThreshold,
            coverageTestPerFile: false,
            coverageMinimumPerFile: COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile,
            routesLength: 0,
            angularVersion: ''
        };
    }
    Configuration.prototype.addPage = function (page) {
        var indexPage = _.findIndex(this._pages, { 'name': page.name });
        if (indexPage === -1) {
            this._pages.push(page);
        }
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
    Configuration.prototype.resetRootMarkdownPages = function () {
        var indexPage = _.findIndex(this._pages, { 'name': 'index' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { 'name': 'changelog' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { 'name': 'contributing' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { 'name': 'license' });
        this._pages.splice(indexPage, 1);
        indexPage = _.findIndex(this._pages, { 'name': 'todo' });
        this._pages.splice(indexPage, 1);
        this._mainData.markdowns = [];
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

var ngdT = require('@compodoc/ngd-transformer');
var NgdEngine = /** @class */ (function () {
    function NgdEngine(dependenciesEngine, fileEngine) {
        if (fileEngine === void 0) { fileEngine = new FileEngine(); }
        this.dependenciesEngine = dependenciesEngine;
        this.fileEngine = fileEngine;
    }
    NgdEngine.prototype.init = function (outputpath) {
        this.engine = new ngdT.DotEngine({
            output: outputpath,
            displayLegend: true,
            outputFormats: 'svg',
            silent: false
        });
    };
    NgdEngine.prototype.renderGraph = function (filepath, outputpath, type, name) {
        this.engine.updateOutput(outputpath);
        if (type === 'f') {
            return this.engine.generateGraph([this.dependenciesEngine.getRawModule(name)]);
        }
        else {
            return this.engine.generateGraph(this.dependenciesEngine.rawModulesForOverview);
        }
    };
    NgdEngine.prototype.readGraph = function (filepath, name) {
        return this.fileEngine
            .get(filepath)
            .catch(function (err) { return Promise.reject('Error during graph read ' + name); });
    };
    return NgdEngine;
}());

var lunr = require('lunr');
var cheerio = require('cheerio');
var Entities = require('html-entities').AllHtmlEntities;
var Html = new Entities();
var SearchEngine = /** @class */ (function () {
    function SearchEngine(configuration, fileEngine) {
        if (fileEngine === void 0) { fileEngine = new FileEngine(); }
        this.configuration = configuration;
        this.fileEngine = fileEngine;
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
        var text;
        var $ = cheerio.load(page.rawData);
        text = $('.content').html();
        text = Html.decode(text);
        text = text.replace(/(<([^>]+)>)/ig, '');
        page.url = page.url.replace(this.configuration.mainData.output, '');
        var doc = {
            url: page.url,
            title: page.infos.context + ' - ' + page.infos.name,
            body: text
        };
        if (!this.documentsStore.hasOwnProperty(doc.url)) {
            this.documentsStore[doc.url] = doc;
            this.getSearchIndex().add(doc);
        }
    };
    SearchEngine.prototype.generateSearchIndexJson = function (outputFolder) {
        var _this = this;
        return this.fileEngine.get(__dirname + '/../src/templates/partials/search-index.hbs').then(function (data) {
            var template = Handlebars.compile(data);
            var result = template({
                index: JSON.stringify(_this.getSearchIndex()),
                store: JSON.stringify(_this.documentsStore)
            });
            var testOutputDir = outputFolder.match(process.cwd());
            if (!testOutputDir) {
                outputFolder = outputFolder.replace(process.cwd(), '');
            }
            return _this.fileEngine.write(outputFolder + path.sep + '/js/search/search_index.js', result)
                .catch(function (err) {
                logger.error('Error during search index file generation ', err);
                return Promise.reject(err);
            });
        }, function (err) { return Promise.reject('Error during search index generation'); });
    };
    return SearchEngine;
}());

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

var ts$4 = require('typescript');
var getCurrentDirectory = ts$4.sys.getCurrentDirectory;
var useCaseSensitiveFileNames = ts$4.sys.useCaseSensitiveFileNames;
var newLine = ts$4.sys.newLine;
var marked$3 = require('marked');
var _$2 = require('lodash');
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
function markedtags(tags) {
    var mtags = tags;
    _$2.forEach(mtags, function (tag) {
        tag.comment = marked$3(LinkParser.resolveLinks(tag.comment));
    });
    return mtags;
}

function mergeTagsAndArgs(args, jsdoctags) {
    var margs = _$2.cloneDeep(args);
    _$2.forEach(margs, function (arg) {
        arg.tagName = {
            text: 'param'
        };
        if (jsdoctags) {
            _$2.forEach(jsdoctags, function (jsdoctag) {
                if (jsdoctag.name && jsdoctag.name.text === arg.name) {
                    arg.tagName = jsdoctag.tagName;
                    arg.name = jsdoctag.name;
                    arg.comment = jsdoctag.comment;
                    arg.typeExpression = jsdoctag.typeExpression;
                }
            });
        }
    });
    // Add example & returns
    if (jsdoctags) {
        _$2.forEach(jsdoctags, function (jsdoctag) {
            if (jsdoctag.tagName && jsdoctag.tagName.text === 'example') {
                margs.push({
                    tagName: jsdoctag.tagName,
                    comment: jsdoctag.comment
                });
            }
            if (jsdoctag.tagName && jsdoctag.tagName.text === 'returns') {
                margs.push({
                    tagName: jsdoctag.tagName,
                    comment: jsdoctag.comment
                });
            }
        });
    }
    return margs;
}
function readConfig(configFile) {
    var result = ts$4.readConfigFile(configFile, ts$4.sys.readFile);
    if (result.error) {
        var message = ts$4.formatDiagnostics([result.error], formatDiagnosticsHost);
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
        if (!(methods[i].name in AngularLifecycleHooks)) {
            result.push(methods[i]);
        }
    }
    return result;
}
function cleanSourcesForWatch(list) {
    return list.filter(function (element) {
        if (fs.existsSync(process.cwd() + path.sep + element)) {
            return element;
        }
    });
}
function getNamesCompareFn(name) {
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
}

var ts$3 = require('typescript');
var _$1 = require('lodash');
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
                    if (hasBom(libSource)) {
                        libSource = stripBom(libSource);
                    }
                }
                catch (e) {
                    logger.debug(e, fileName);
                }
                return ts$3.createSourceFile(fileName, libSource, transpileOptions.target, false);
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
    rawFolders = _$1.uniq(rawFolders);
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

var JSON5 = require('json5');
var RouterParser = (function () {
    var routes = [];
    var incompleteRoutes = [];
    var modules = [];
    var modulesTree;
    var rootModule;
    var cleanModulesTree;
    var modulesWithRoutes = [];
    var fileEngine = new FileEngine();
    var _addRoute = function (route) {
        routes.push(route);
        routes = _.sortBy(_.uniqWith(routes, _.isEqual), ['name']);
    };
    var _addIncompleteRoute = function (route) {
        incompleteRoutes.push(route);
        incompleteRoutes = _.sortBy(_.uniqWith(incompleteRoutes, _.isEqual), ['name']);
    };
    var _addModuleWithRoutes = function (moduleName, moduleImports, filename) {
        modulesWithRoutes.push({
            name: moduleName,
            importsNode: moduleImports,
            filename: filename
        });
        modulesWithRoutes = _.sortBy(_.uniqWith(modulesWithRoutes, _.isEqual), ['name']);
    };
    var _addModule = function (moduleName, moduleImports) {
        modules.push({
            name: moduleName,
            importsNode: moduleImports
        });
        modules = _.sortBy(_.uniqWith(modules, _.isEqual), ['name']);
    };
    var _cleanRawRouteParsed = function (route) {
        var routesWithoutSpaces = route.replace(/ /gm, '');
        var testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma !== -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return JSON5.parse(routesWithoutSpaces);
    };
    var _cleanRawRoute = function (route) {
        var routesWithoutSpaces = route.replace(/ /gm, '');
        var testTrailingComma = routesWithoutSpaces.indexOf('},]');
        if (testTrailingComma !== -1) {
            routesWithoutSpaces = routesWithoutSpaces.replace('},]', '}]');
        }
        return routesWithoutSpaces;
    };
    var _setRootModule = function (module) {
        rootModule = module;
    };
    var _hasRouterModuleInImports = function (imports) {
        var result = false;
        var len = imports.length;
        for (var i = 0; i < len; i++) {
            if (imports[i].name.indexOf('RouterModule.forChild') !== -1 ||
                imports[i].name.indexOf('RouterModule.forRoot') !== -1) {
                result = true;
            }
        }
        return result;
    };
    var _fixIncompleteRoutes = function (miscellaneousVariables) {
        /*console.log('fixIncompleteRoutes');
        console.log('');
        console.log(routes);
        console.log('');*/
        // console.log(miscellaneousVariables);
        // console.log('');
        var i = 0;
        var len = incompleteRoutes.length;
        var matchingVariables = [];
        // For each incompleteRoute, scan if one misc variable is in code
        // if ok, try recreating complete route
        for (i; i < len; i++) {
            var j = 0;
            var leng = miscellaneousVariables.length;
            for (j; j < leng; j++) {
                if (incompleteRoutes[i].data.indexOf(miscellaneousVariables[j].name) !== -1) {
                    console.log('found one misc var inside incompleteRoute');
                    console.log(miscellaneousVariables[j].name);
                    matchingVariables.push(miscellaneousVariables[j]);
                }
            }
            // Clean incompleteRoute
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace('[', '');
            incompleteRoutes[i].data = incompleteRoutes[i].data.replace(']', '');
        }
        /*console.log(incompleteRoutes);
        console.log('');
        console.log(matchingVariables);
        console.log('');*/
    };
    var _linkModulesAndRoutes = function () {
        /*console.log('');
        console.log('linkModulesAndRoutes: ');
        //scan each module imports AST for each routes, and link routes with module
        console.log('linkModulesAndRoutes routes: ', routes);
        console.log('');*/
        var i = 0;
        var len = modulesWithRoutes.length;
        for (i; i < len; i++) {
            _.forEach(modulesWithRoutes[i].importsNode, function (node) {
                if (node.initializer) {
                    if (node.initializer.elements) {
                        _.forEach(node.initializer.elements, function (element) {
                            // find element with arguments
                            if (element.arguments) {
                                _.forEach(element.arguments, function (argument) {
                                    _.forEach(routes, function (route) {
                                        if (argument.text && route.name === argument.text && route.filename === modulesWithRoutes[i].filename) {
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
    };
    var foundRouteWithModuleName = function (moduleName) {
        return _.find(routes, { 'module': moduleName });
    };
    var foundLazyModuleWithPath = function (path$$1) {
        // path is like app/customers/customers.module#CustomersModule
        var split = path$$1.split('#');
        var lazyModuleName = split[1];
        return lazyModuleName;
    };
    var _constructRoutesTree = function () {
        // console.log('');
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
        // console.log('');
        // console.log('  cleanModulesTree light: ', util.inspect(cleanModulesTree, { depth: 10 }));
        // console.log('');
        // console.log(routes);
        // console.log('');
        var routesTree = {
            name: '<root>',
            kind: 'module',
            className: rootModule,
            children: []
        };
        var loopModulesParser = function (node) {
            if (node.children && node.children.length > 0) {
                // If module has child modules
                // console.log('   If module has child modules');
                for (var i in node.children) {
                    var route = foundRouteWithModuleName(node.children[i].name);
                    if (route && route.data) {
                        route.children = JSON5.parse(route.data);
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
                // else routes are directly inside the module
                // console.log('   else routes are directly inside the root module');
                var rawRoutes = foundRouteWithModuleName(node.name);
                if (rawRoutes) {
                    var routes_1 = JSON5.parse(rawRoutes.data);
                    if (routes_1) {
                        var i = 0, len = routes_1.length;
                        for (i; i < len; i++) {
                            var route = routes_1[i];
                            if (routes_1[i].component) {
                                routesTree.children.push({
                                    kind: 'component',
                                    component: routes_1[i].component,
                                    path: routes_1[i].path
                                });
                            }
                        }
                    }
                }
            }
        };
        // console.log('');
        // console.log('  rootModule: ', rootModule);
        // console.log('');
        var startModule = _.find(cleanModulesTree, { 'name': rootModule });
        if (startModule) {
            loopModulesParser(startModule);
            // Loop twice for routes with lazy loading
            // loopModulesParser(routesTree);
        }
        /*console.log('');
        console.log('  routesTree: ', routesTree);
        console.log('');*/
        var cleanedRoutesTree = undefined;
        var cleanRoutesTree = function (route) {
            return route;
        };
        cleanedRoutesTree = cleanRoutesTree(routesTree);
        // Try updating routes with lazy loading
        // console.log('');
        // console.log('Try updating routes with lazy loading');
        var loopRoutesParser = function (route) {
            if (route.children) {
                var _loop_1 = function (i) {
                    if (route.children[i].loadChildren) {
                        var child = foundLazyModuleWithPath(route.children[i].loadChildren), module = _.find(cleanModulesTree, { 'name': child });
                        if (module) {
                            var _rawModule_1 = {};
                            _rawModule_1.kind = 'module';
                            _rawModule_1.children = [];
                            _rawModule_1.module = module.name;
                            var loopInside = function (mod) {
                                if (mod.children) {
                                    for (var i_1 in mod.children) {
                                        var route_1 = foundRouteWithModuleName(mod.children[i_1].name);
                                        if (typeof route_1 !== 'undefined') {
                                            if (route_1.data) {
                                                route_1.children = JSON5.parse(route_1.data);
                                                delete route_1.data;
                                                route_1.kind = 'module';
                                                _rawModule_1.children.push(route_1);
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
                    _loop_1(i);
                }
            }
        };
        loopRoutesParser(cleanedRoutesTree);
        // console.log('');
        // console.log('  cleanedRoutesTree: ', util.inspect(cleanedRoutesTree, { depth: 10 }));
        return cleanedRoutesTree;
    };
    var _constructModulesTree = function () {
        // console.log('');
        // console.log('constructModulesTree');
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
        // Scan each module and add parent property
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
    };
    var _generateRoutesIndex = function (outputFolder, routes) {
        return fileEngine.get(__dirname + '/../src/templates/partials/routes-index.hbs').then(function (data) {
            var template = Handlebars.compile(data);
            var result = template({
                routes: JSON.stringify(routes)
            });
            var testOutputDir = outputFolder.match(process.cwd());
            if (!testOutputDir) {
                outputFolder = outputFolder.replace(process.cwd(), '');
            }
            return fileEngine.write(outputFolder + path.sep + '/js/routes/routes_index.js', result);
        }, function (err) { return Promise.reject('Error during routes index generation'); });
    };
    var _routesLength = function () {
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

var CodeGenerator = /** @class */ (function () {
    function CodeGenerator() {
    }
    CodeGenerator.prototype.generate = function (node) {
        return this.visitAndRecognize(node, []).join('');
    };
    CodeGenerator.prototype.visitAndRecognize = function (node, code, depth) {
        var _this = this;
        if (depth === void 0) { depth = 0; }
        this.recognize(node, code);
        node.getChildren().forEach(function (c) { return _this.visitAndRecognize(c, code, depth + 1); });
        return code;
    };
    CodeGenerator.prototype.recognize = function (node, code) {
        var _this = this;
        var conversion = TsKindConversion.find(function (x) { return x.kinds.some(function (z) { return z === node.kind; }); });
        if (conversion) {
            var result = conversion.output(node);
            result.forEach(function (text) { return _this.gen(text, code); });
        }
    };
    CodeGenerator.prototype.gen = function (token, code) {
        if (!token) {
            return;
        }
        if (token === '\n') {
            code.push('');
        }
        else {
            code.push(token);
        }
    };
    return CodeGenerator;
}());
var TsKindsToText = /** @class */ (function () {
    function TsKindsToText(output, kinds) {
        this.output = output;
        this.kinds = kinds;
    }
    return TsKindsToText;
}());
var TsKindConversion = [
    new TsKindsToText(function (node) { return ['\"', node.text, '\"']; }, [ts.SyntaxKind.FirstLiteralToken, ts.SyntaxKind.Identifier]),
    new TsKindsToText(function (node) { return ['\"', node.text, '\"']; }, [ts.SyntaxKind.StringLiteral]),
    new TsKindsToText(function (node) { return []; }, [ts.SyntaxKind.ArrayLiteralExpression]),
    new TsKindsToText(function (node) { return ['import', ' ']; }, [ts.SyntaxKind.ImportKeyword]),
    new TsKindsToText(function (node) { return ['from', ' ']; }, [ts.SyntaxKind.FromKeyword]),
    new TsKindsToText(function (node) { return ['\n', 'export', ' ']; }, [ts.SyntaxKind.ExportKeyword]),
    new TsKindsToText(function (node) { return ['class', ' ']; }, [ts.SyntaxKind.ClassKeyword]),
    new TsKindsToText(function (node) { return ['this']; }, [ts.SyntaxKind.ThisKeyword]),
    new TsKindsToText(function (node) { return ['constructor']; }, [ts.SyntaxKind.ConstructorKeyword]),
    new TsKindsToText(function (node) { return ['false']; }, [ts.SyntaxKind.FalseKeyword]),
    new TsKindsToText(function (node) { return ['true']; }, [ts.SyntaxKind.TrueKeyword]),
    new TsKindsToText(function (node) { return ['null']; }, [ts.SyntaxKind.NullKeyword]),
    new TsKindsToText(function (node) { return []; }, [ts.SyntaxKind.AtToken]),
    new TsKindsToText(function (node) { return ['+']; }, [ts.SyntaxKind.PlusToken]),
    new TsKindsToText(function (node) { return [' => ']; }, [ts.SyntaxKind.EqualsGreaterThanToken]),
    new TsKindsToText(function (node) { return ['(']; }, [ts.SyntaxKind.OpenParenToken]),
    new TsKindsToText(function (node) { return ['{', ' ']; }, [ts.SyntaxKind.ImportClause, ts.SyntaxKind.ObjectLiteralExpression]),
    new TsKindsToText(function (node) { return ['{', '\n']; }, [ts.SyntaxKind.Block]),
    new TsKindsToText(function (node) { return ['}']; }, [ts.SyntaxKind.CloseBraceToken]),
    new TsKindsToText(function (node) { return [')']; }, [ts.SyntaxKind.CloseParenToken]),
    new TsKindsToText(function (node) { return ['[']; }, [ts.SyntaxKind.OpenBracketToken]),
    new TsKindsToText(function (node) { return [']']; }, [ts.SyntaxKind.CloseBracketToken]),
    new TsKindsToText(function (node) { return [';', '\n']; }, [ts.SyntaxKind.SemicolonToken]),
    new TsKindsToText(function (node) { return [',', ' ']; }, [ts.SyntaxKind.CommaToken]),
    new TsKindsToText(function (node) { return [' ', ':', ' ']; }, [ts.SyntaxKind.ColonToken]),
    new TsKindsToText(function (node) { return ['.']; }, [ts.SyntaxKind.DotToken]),
    new TsKindsToText(function (node) { return []; }, [ts.SyntaxKind.DoStatement]),
    new TsKindsToText(function (node) { return []; }, [ts.SyntaxKind.Decorator]),
    new TsKindsToText(function (node) { return [' = ']; }, [ts.SyntaxKind.FirstAssignment]),
    new TsKindsToText(function (node) { return [' ']; }, [ts.SyntaxKind.FirstPunctuation]),
    new TsKindsToText(function (node) { return ['private', ' ']; }, [ts.SyntaxKind.PrivateKeyword]),
    new TsKindsToText(function (node) { return ['public', ' ']; }, [ts.SyntaxKind.PublicKeyword])
];

var $ = require('cheerio');
var ComponentsTreeEngine = /** @class */ (function () {
    function ComponentsTreeEngine(fileEngine) {
        if (fileEngine === void 0) { fileEngine = new FileEngine(); }
        this.fileEngine = fileEngine;
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
            var i = 0;
            var len = _this.componentsForTree.length;
            var loop = function () {
                if (i <= len - 1) {
                    if (_this.componentsForTree[i].templateUrl) {
                        var filePath = process.cwd() + path.sep + path.dirname(_this.componentsForTree[i].file) + path.sep + _this.componentsForTree[i].templateUrl;
                        _this.fileEngine.get(filePath)
                            .then(function (templateData) {
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
            _this.readTemplates()
                .then(function () {
                _this.findChildrenAndParents()
                    .then(function () {
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

var DirectiveDepFactory = /** @class */ (function () {
    function DirectiveDepFactory(helper) {
        this.helper = helper;
    }
    DirectiveDepFactory.prototype.create = function (file, srcFile, name, props, IO) {
        var directiveDeps = {
            name: name,
            id: 'directive-' + name + '-' + Date.now(),
            file: file,
            type: 'directive',
            description: IO.description,
            sourceCode: srcFile.getText(),
            selector: this.helper.getComponentSelector(props),
            providers: this.helper.getComponentProviders(props),
            inputsClass: IO.inputs,
            outputsClass: IO.outputs,
            hostBindings: IO.hostBindings,
            hostListeners: IO.hostListeners,
            propertiesClass: IO.properties,
            methodsClass: IO.methods,
            exampleUrls: this.helper.getComponentExampleUrls(srcFile.getText())
        };
        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
            directiveDeps.jsdoctags = IO.jsdoctags[0].tags;
        }
        if (IO.implements && IO.implements.length > 0) {
            directiveDeps.implements = IO.implements;
        }
        if (IO.constructor) {
            directiveDeps.constructorObj = IO.constructor;
        }
        return directiveDeps;
    };
    return DirectiveDepFactory;
}());

var ts$5 = require('typescript');
var NsModuleCache = /** @class */ (function () {
    function NsModuleCache() {
        this.cache = new Map();
    }
    NsModuleCache.prototype.setOrAdd = function (key, toSetOrAdd) {
        var result = this.cache.get(key);
        if (result) {
            result.push(toSetOrAdd);
        }
        else {
            this.cache.set(key, [toSetOrAdd]);
        }
    };
    return NsModuleCache;
}());
var SymbolHelper = /** @class */ (function () {
    function SymbolHelper() {
        this.unknown = '???';
    }
    SymbolHelper.prototype.parseDeepIndentifier = function (name, cache) {
        var nsModule = name.split('.');
        var type = this.getType(name);
        if (nsModule.length > 1) {
            // cache deps with the same namespace (i.e Shared.*)
            cache.setOrAdd(nsModule[0], name);
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
    SymbolHelper.prototype.getType = function (name) {
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
    SymbolHelper.prototype.getSymbolDeps = function (props, type, multiLine) {
        var _this = this;
        if (props.length === 0) {
            return [];
        }
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
                        if (node.expression.kind === ts$5.SyntaxKind.ArrayLiteralExpression) {
                            nodeName = node.expression.elements.map(function (el) { return el.text; }).join(', ');
                            nodeName = "[" + nodeName + "]";
                        }
                    }
                }
                if (node.kind === ts$5.SyntaxKind.SpreadElement) {
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
            var _providerProps = [];
            (o.properties || []).forEach(function (prop) {
                var identifier = '';
                if (prop.initializer) {
                    identifier = prop.initializer.text;
                    if (prop.initializer.kind === ts$5.SyntaxKind.StringLiteral) {
                        identifier = "'" + identifier + "'";
                    }
                    // lambda function (i.e useFactory)
                    if (prop.initializer.body) {
                        var params = (prop.initializer.parameters || [])
                            .map(function (params1) { return params1.name.text; });
                        identifier = "(" + params.join(', ') + ") => {}";
                    }
                    else if (prop.initializer.elements) {
                        var elements = (prop.initializer.elements || []).map(function (n) {
                            if (n.kind === ts$5.SyntaxKind.StringLiteral) {
                                return "'" + n.text + "'";
                            }
                            return n.text;
                        });
                        identifier = "[" + elements.join(', ') + "]";
                    }
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
    SymbolHelper.prototype.getSymbolDepsRaw = function (props, type, multiLine) {
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        return deps || [];
    };
    return SymbolHelper;
}());

var ComponentHelper = /** @class */ (function () {
    function ComponentHelper(moduleCache, classHelper, symbolHelper) {
        if (symbolHelper === void 0) { symbolHelper = new SymbolHelper(); }
        this.moduleCache = moduleCache;
        this.classHelper = classHelper;
        this.symbolHelper = symbolHelper;
    }
    ComponentHelper.prototype.getComponentChangeDetection = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'changeDetection').pop();
    };
    ComponentHelper.prototype.getComponentEncapsulation = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'encapsulation');
    };
    ComponentHelper.prototype.getComponentExportAs = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'exportAs').pop();
    };
    ComponentHelper.prototype.getComponentHost = function (props) {
        return this.getSymbolDepsObject(props, 'host');
    };
    ComponentHelper.prototype.getComponentInputsMetadata = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'inputs');
    };
    ComponentHelper.prototype.getComponentTemplate = function (props) {
        var t = this.symbolHelper.getSymbolDeps(props, 'template', true).pop();
        if (t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    };
    ComponentHelper.prototype.getComponentStyleUrls = function (props) {
        return this.sanitizeUrls(this.symbolHelper.getSymbolDeps(props, 'styleUrls'));
    };
    ComponentHelper.prototype.getComponentStyles = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'styles');
    };
    ComponentHelper.prototype.getComponentModuleId = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'moduleId').pop();
    };
    ComponentHelper.prototype.getComponentOutputs = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'outputs');
    };
    ComponentHelper.prototype.getComponentProviders = function (props) {
        var _this = this;
        return this.symbolHelper
            .getSymbolDeps(props, 'providers')
            .map(function (name) { return _this.symbolHelper.parseDeepIndentifier(name, _this.moduleCache); });
    };
    ComponentHelper.prototype.getComponentViewProviders = function (props) {
        var _this = this;
        return this.symbolHelper
            .getSymbolDeps(props, 'viewProviders')
            .map(function (name) { return _this.symbolHelper.parseDeepIndentifier(name, _this.moduleCache); });
    };
    ComponentHelper.prototype.getComponentTemplateUrl = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'templateUrl');
    };
    ComponentHelper.prototype.getComponentExampleUrls = function (text) {
        var exampleUrlsMatches = text.match(/<example-url>(.*?)<\/example-url>/g);
        var exampleUrls = undefined;
        if (exampleUrlsMatches && exampleUrlsMatches.length) {
            exampleUrls = exampleUrlsMatches.map(function (val) {
                return val.replace(/<\/?example-url>/g, '');
            });
        }
        return exampleUrls;
    };
    ComponentHelper.prototype.getComponentSelector = function (props) {
        return this.symbolHelper.getSymbolDeps(props, 'selector').pop();
    };
    ComponentHelper.prototype.getSymbolDepsObject = function (props, type, multiLine) {
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
    ComponentHelper.prototype.getComponentIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (ts.isClassDeclaration(statement)) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.classHelper.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
    };
    ComponentHelper.prototype.sanitizeUrls = function (urls) {
        return urls.map(function (url) { return url.replace('./', ''); });
    };
    return ComponentHelper;
}());
var ComponentCache = /** @class */ (function () {
    function ComponentCache() {
        this.cache = new Map();
    }
    ComponentCache.prototype.get = function (key) {
        return this.cache.get(key);
    };
    ComponentCache.prototype.set = function (key, value) {
        this.cache.set(key, value);
    };
    return ComponentCache;
}());

var ts$6 = require('typescript');
var ModuleDepFactory = /** @class */ (function () {
    function ModuleDepFactory(moduleHelper) {
        this.moduleHelper = moduleHelper;
    }
    ModuleDepFactory.prototype.create = function (file, srcFile, name, props, IO) {
        return {
            name: name,
            id: 'module-' + name + '-' + Date.now(),
            file: file,
            providers: this.moduleHelper.getModuleProviders(props),
            declarations: this.moduleHelper.getModuleDeclations(props),
            imports: this.moduleHelper.getModuleImports(props),
            exports: this.moduleHelper.getModuleExports(props),
            bootstrap: this.moduleHelper.getModuleBootstrap(props),
            type: 'module',
            description: IO.description,
            sourceCode: srcFile.getText()
        };
    };
    return ModuleDepFactory;
}());

var ComponentDepFactory = /** @class */ (function () {
    function ComponentDepFactory(helper, configuration) {
        this.helper = helper;
        this.configuration = configuration;
    }
    ComponentDepFactory.prototype.create = function (file, srcFile, name, props, IO) {
        // console.log(util.inspect(props, { showHidden: true, depth: 10 }));
        var componentDep = {
            name: name,
            id: 'component-' + name + '-' + Date.now(),
            file: file,
            // animations?: string[]; // TODO
            changeDetection: this.helper.getComponentChangeDetection(props),
            encapsulation: this.helper.getComponentEncapsulation(props),
            // entryComponents?: string; // TODO waiting doc infos
            exportAs: this.helper.getComponentExportAs(props),
            host: this.helper.getComponentHost(props),
            inputs: this.helper.getComponentInputsMetadata(props),
            // interpolation?: string; // TODO waiting doc infos
            moduleId: this.helper.getComponentModuleId(props),
            outputs: this.helper.getComponentOutputs(props),
            providers: this.helper.getComponentProviders(props),
            // queries?: Deps[]; // TODO
            selector: this.helper.getComponentSelector(props),
            styleUrls: this.helper.getComponentStyleUrls(props),
            styles: this.helper.getComponentStyles(props),
            template: this.helper.getComponentTemplate(props),
            templateUrl: this.helper.getComponentTemplateUrl(props),
            viewProviders: this.helper.getComponentViewProviders(props),
            inputsClass: IO.inputs,
            outputsClass: IO.outputs,
            propertiesClass: IO.properties,
            methodsClass: IO.methods,
            hostBindings: IO.hostBindings,
            hostListeners: IO.hostListeners,
            description: IO.description,
            type: 'component',
            sourceCode: srcFile.getText(),
            exampleUrls: this.helper.getComponentExampleUrls(srcFile.getText())
        };
        if (this.configuration.mainData.disablePrivateOrInternalSupport) {
            componentDep.methodsClass = cleanLifecycleHooksFromMethods(componentDep.methodsClass);
        }
        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
            componentDep.jsdoctags = IO.jsdoctags[0].tags;
        }
        if (IO.constructor) {
            componentDep.constructorObj = IO.constructor;
        }
        if (IO.extends) {
            componentDep.extends = IO.extends;
        }
        if (IO.implements && IO.implements.length > 0) {
            componentDep.implements = IO.implements;
        }
        return componentDep;
    };
    return ComponentDepFactory;
}());

var ModuleHelper = /** @class */ (function () {
    function ModuleHelper(moduleCache, cache, symbolHelper) {
        if (symbolHelper === void 0) { symbolHelper = new SymbolHelper(); }
        this.moduleCache = moduleCache;
        this.cache = cache;
        this.symbolHelper = symbolHelper;
    }
    ModuleHelper.prototype.getModuleProviders = function (props) {
        var _this = this;
        return this.symbolHelper
            .getSymbolDeps(props, 'providers')
            .map(function (providerName) { return _this.symbolHelper.parseDeepIndentifier(providerName, _this.moduleCache); });
    };
    ModuleHelper.prototype.getModuleDeclations = function (props) {
        var _this = this;
        return this.symbolHelper.getSymbolDeps(props, 'declarations').map(function (name) {
            var component = _this.cache.get(name);
            if (component) {
                return component;
            }
            return _this.symbolHelper.parseDeepIndentifier(name, _this.moduleCache);
        });
    };
    ModuleHelper.prototype.getModuleImports = function (props) {
        var _this = this;
        return this.symbolHelper
            .getSymbolDeps(props, 'imports')
            .map(function (name) { return _this.symbolHelper.parseDeepIndentifier(name, _this.moduleCache); });
    };
    ModuleHelper.prototype.getModuleExports = function (props) {
        var _this = this;
        return this.symbolHelper
            .getSymbolDeps(props, 'exports')
            .map(function (name) { return _this.symbolHelper.parseDeepIndentifier(name, _this.moduleCache); });
    };
    ModuleHelper.prototype.getModuleImportsRaw = function (props) {
        return this.symbolHelper.getSymbolDepsRaw(props, 'imports');
    };
    ModuleHelper.prototype.getModuleBootstrap = function (props) {
        var _this = this;
        return this.symbolHelper
            .getSymbolDeps(props, 'bootstrap')
            .map(function (name) { return _this.symbolHelper.parseDeepIndentifier(name, _this.moduleCache); });
    };
    return ModuleHelper;
}());

var JsDocHelper = /** @class */ (function () {
    function JsDocHelper() {
    }
    JsDocHelper.prototype.hasJSDocInternalTag = function (filename, sourceFile, node) {
        var result = false;
        if (typeof sourceFile.statements !== 'undefined') {
            var i = 0;
            var len = sourceFile.statements.length;
            for (i; i < len; i++) {
                var statement = sourceFile.statements[i];
                if (statement.pos === node.pos && statement.end === node.end) {
                    if (node.jsDoc && node.jsDoc.length > 0) {
                        var j = 0;
                        var leng = node.jsDoc.length;
                        for (j; j < leng; j++) {
                            if (node.jsDoc[j].tags && node.jsDoc[j].tags.length > 0) {
                                var k = 0;
                                var lengt = node.jsDoc[j].tags.length;
                                for (k; k < lengt; k++) {
                                    if (node.jsDoc[j].tags[k].tagName && node.jsDoc[j].tags[k].tagName.text === 'internal') {
                                        result = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    };
    return JsDocHelper;
}());

var marked$4 = require('marked');
var ClassHelper = /** @class */ (function () {
    function ClassHelper(typeChecker, configuration) {
        this.typeChecker = typeChecker;
        this.configuration = configuration;
        this.jsdocParserUtil = new JsdocParserUtil();
    }
    ClassHelper.prototype.stringifyDefaultValue = function (node) {
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
    ClassHelper.prototype.visitType = function (node) {
        var _return = 'void';
        if (node) {
            if (node.typeName) {
                _return = node.typeName.text;
            }
            else if (node.type) {
                if (node.type.kind) {
                    _return = kindToType(node.type.kind);
                }
                if (node.type.typeName) {
                    _return = node.type.typeName.text;
                }
                if (node.type.typeArguments) {
                    _return += '<';
                    for (var _i = 0, _a = node.type.typeArguments; _i < _a.length; _i++) {
                        var argument = _a[_i];
                        if (argument.kind) {
                            _return += kindToType(argument.kind);
                        }
                        if (argument.typeName) {
                            _return += argument.typeName.text;
                        }
                    }
                    _return += '>';
                }
                if (node.type.elementType) {
                    var _firstPart = kindToType(node.type.elementType.kind);
                    if (typeof node.type.elementType.typeName !== 'undefined') {
                        if (typeof node.type.elementType.typeName.escapedText !== 'undefined') {
                            _firstPart = node.type.elementType.typeName.escapedText;
                        }
                    }
                    _return = _firstPart + kindToType(node.type.kind);
                }
                if (node.type.types && node.type.kind === ts.SyntaxKind.UnionType) {
                    _return = '';
                    var i = 0;
                    var len = node.type.types.length;
                    for (i; i < len; i++) {
                        _return += kindToType(node.type.types[i].kind);
                        if (node.type.types[i].kind === ts.SyntaxKind.LiteralType && node.type.types[i].literal) {
                            _return += '"' + node.type.types[i].literal.text + '"';
                        }
                        if (typeof node.type.types[i].typeName !== 'undefined') {
                            if (typeof node.type.types[i].typeName.escapedText !== 'undefined') {
                                _return += node.type.types[i].typeName.escapedText;
                            }
                        }
                        if (i < len - 1) {
                            _return += ' | ';
                        }
                    }
                }
            }
            else if (node.elementType) {
                _return = kindToType(node.elementType.kind) + kindToType(node.kind);
            }
            else if (node.types && node.kind === ts.SyntaxKind.UnionType) {
                _return = '';
                var i = 0;
                var len = node.types.length;
                for (i; i < len; i++) {
                    _return += kindToType(node.types[i].kind);
                    if (node.types[i].kind === ts.SyntaxKind.LiteralType && node.types[i].literal) {
                        _return += '"' + node.types[i].literal.text + '"';
                    }
                    if (i < len - 1) {
                        _return += ' | ';
                    }
                }
            }
            else if (node.dotDotDotToken) {
                _return = 'any[]';
            }
            else {
                _return = kindToType(node.kind);
            }
            if (node.typeArguments && node.typeArguments.length > 0) {
                _return += '<';
                for (var _b = 0, _c = node.typeArguments; _b < _c.length; _b++) {
                    var argument = _c[_b];
                    _return += kindToType(argument.kind);
                }
                _return += '>';
            }
        }
        return _return;
    };
    ClassHelper.prototype.visitClassDeclaration = function (fileName, classDeclaration, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var symbol = this.typeChecker.getSymbolAtLocation(classDeclaration.name);
        var description = '';
        if (symbol) {
            description = marked$4(ts.displayPartsToString(symbol.getDocumentationComment()));
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
                var i = 0;
                var len = implementedTypes.length;
                for (i; i < len; i++) {
                    if (implementedTypes[i].expression) {
                        implementsElements.push(implementedTypes[i].expression.text);
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
                jsdoctags = this.jsdocParserUtil.getJSDocs(symbol.valueDeclaration);
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
                        hostBindings: members.hostBindings,
                        hostListeners: members.hostListeners,
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
                            jsdoctags: jsdoctags,
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
                    members = this.visitMembers(classDeclaration.members, sourceFile);
                    return [{
                            description: description,
                            methods: members.methods,
                            indexSignatures: members.indexSignatures,
                            properties: members.properties,
                            kind: members.kind,
                            constructor: members.constructor,
                            jsdoctags: jsdoctags,
                            extends: extendsElement,
                            implements: implementsElements
                        }];
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
                    jsdoctags: jsdoctags,
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
                    jsdoctags: jsdoctags,
                    extends: extendsElement,
                    implements: implementsElements
                }];
        }
        return [];
    };
    ClassHelper.prototype.visitDirectiveDecorator = function (decorator) {
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
    ClassHelper.prototype.isDirectiveDecorator = function (decorator) {
        if (decorator.expression.expression) {
            var decoratorIdentifierText = decorator.expression.expression.text;
            return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
        }
        else {
            return false;
        }
    };
    ClassHelper.prototype.isServiceDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Injectable' : false;
    };
    ClassHelper.prototype.visitMembers = function (members, sourceFile) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inputs = [];
        var outputs = [];
        var hostBindings = [];
        var hostListeners = [];
        var methods = [];
        var properties = [];
        var indexSignatures = [];
        var kind;
        var inputDecorator;
        var hostBinding;
        var hostListener;
        var constructor;
        var outDecorator;
        for (var i = 0; i < members.length; i++) {
            inputDecorator = this.getDecoratorOfType(members[i], 'Input');
            outDecorator = this.getDecoratorOfType(members[i], 'Output');
            hostBinding = this.getDecoratorOfType(members[i], 'HostBinding');
            hostListener = this.getDecoratorOfType(members[i], 'HostListener');
            kind = members[i].kind;
            if (inputDecorator) {
                inputs.push(this.visitInputAndHostBinding(members[i], inputDecorator, sourceFile));
            }
            else if (outDecorator) {
                outputs.push(this.visitOutput(members[i], outDecorator, sourceFile));
            }
            else if (hostBinding) {
                hostBindings.push(this.visitInputAndHostBinding(members[i], hostBinding, sourceFile));
            }
            else if (hostListener) {
                hostListeners.push(this.visitHostListener(members[i], hostListener, sourceFile));
            }
            else if (!this.isHiddenMember(members[i])) {
                if (!((this.isPrivate(members[i]) || this.isInternal(members[i])) &&
                    this.configuration.mainData.disablePrivateOrInternalSupport)) {
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
                        var _constructorProperties = this.visitConstructorProperties(members[i], sourceFile);
                        var j = 0;
                        var len = _constructorProperties.length;
                        for (j; j < len; j++) {
                            properties.push(_constructorProperties[j]);
                        }
                        constructor = this.visitConstructorDeclaration(members[i], sourceFile);
                    }
                }
            }
        }
        inputs.sort(getNamesCompareFn());
        outputs.sort(getNamesCompareFn());
        hostBindings.sort(getNamesCompareFn());
        hostListeners.sort(getNamesCompareFn());
        properties.sort(getNamesCompareFn());
        methods.sort(getNamesCompareFn());
        indexSignatures.sort(getNamesCompareFn());
        return {
            inputs: inputs,
            outputs: outputs,
            hostBindings: hostBindings,
            hostListeners: hostListeners,
            methods: methods,
            properties: properties,
            indexSignatures: indexSignatures,
            kind: kind,
            constructor: constructor
        };
    };
    ClassHelper.prototype.visitCallDeclaration = function (method, sourceFile) {
        var _this = this;
        var result = {
            id: 'call-declaration-' + Date.now(),
            description: marked$4(ts.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
        var jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    ClassHelper.prototype.visitIndexDeclaration = function (method, sourceFile) {
        var _this = this;
        return {
            id: 'index-declaration-' + Date.now(),
            description: marked$4(ts.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
    };
    ClassHelper.prototype.isPrivate = function (member) {
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
    ClassHelper.prototype.isInternal = function (member) {
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
    ClassHelper.prototype.visitConstructorDeclaration = function (method, sourceFile) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var result = {
            name: 'constructor',
            description: '',
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            line: this.getPosition(method, sourceFile).line + 1
        };
        var jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        if (method.symbol) {
            result.description = marked$4(ts.displayPartsToString(method.symbol.getDocumentationComment()));
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
        if (result.jsdoctags && result.jsdoctags.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args, result.jsdoctags);
        }
        else if (result.args.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args);
        }
        return result;
    };
    ClassHelper.prototype.getDecoratorOfType = function (node, decoratorType) {
        var decorators = node.decorators || [];
        for (var i = 0; i < decorators.length; i++) {
            if (decorators[i].expression.expression) {
                if (decorators[i].expression.expression.text === decoratorType) {
                    return decorators[i];
                }
            }
        }
        return undefined;
    };
    ClassHelper.prototype.visitProperty = function (property, sourceFile) {
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
        var jsdoctags;
        if (property.jsDoc) {
            jsdoctags = this.jsdocParserUtil.getJSDocs(property);
        }
        if (property.symbol) {
            result.description = marked$4(ts.displayPartsToString(property.symbol.getDocumentationComment()));
        }
        if (property.decorators) {
            result.decorators = this.formatDecorators(property.decorators);
        }
        if (property.modifiers) {
            if (property.modifiers.length > 0) {
                result.modifierKind = property.modifiers[0].kind;
            }
        }
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    ClassHelper.prototype.visitConstructorProperties = function (constr, sourceFile) {
        if (constr.parameters) {
            var _parameters = [];
            var i = 0;
            var len = constr.parameters.length;
            for (i; i < len; i++) {
                if (this.isPublic(constr.parameters[i])) {
                    _parameters.push(this.visitProperty(constr.parameters[i], sourceFile));
                }
            }
            return _parameters;
        }
        else {
            return [];
        }
    };
    ClassHelper.prototype.isPublic = function (member) {
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
    ClassHelper.prototype.isHiddenMember = function (member) {
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
    ClassHelper.prototype.visitInputAndHostBinding = function (property, inDecorator, sourceFile) {
        var inArgs = inDecorator.expression.arguments;
        var _return = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.defaultValue = property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined;
        if (property.symbol) {
            _return.description = marked$4(ts.displayPartsToString(property.symbol.getDocumentationComment()));
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked$4(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
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
    ClassHelper.prototype.formatDecorators = function (decorators) {
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
    ClassHelper.prototype.visitMethodDeclaration = function (method, sourceFile) {
        var _this = this;
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [],
            returnType: this.visitType(method.type),
            line: this.getPosition(method, sourceFile).line + 1
        };
        var jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        if (typeof method.type === 'undefined') {
            // Try to get inferred type
            if (method.symbol) {
                var symbol = method.symbol;
                if (symbol.valueDeclaration) {
                    var symbolType = this.typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
                    if (symbolType) {
                        try {
                            var signature = this.typeChecker.getSignatureFromDeclaration(method);
                            var returnType = signature.getReturnType();
                            result.returnType = this.typeChecker.typeToString(returnType);
                            // tslint:disable-next-line:no-empty
                        }
                        catch (error) { }
                    }
                }
            }
        }
        if (method.symbol) {
            result.description = marked$4(ts.displayPartsToString(method.symbol.getDocumentationComment()));
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
        if (result.jsdoctags && result.jsdoctags.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args, result.jsdoctags);
        }
        else if (result.args.length > 0) {
            result.jsdoctags = mergeTagsAndArgs(result.args);
        }
        return result;
    };
    ClassHelper.prototype.isPipeDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'Pipe' : false;
    };
    ClassHelper.prototype.isModuleDecorator = function (decorator) {
        return (decorator.expression.expression) ? decorator.expression.expression.text === 'NgModule' : false;
    };
    ClassHelper.prototype.visitOutput = function (property, outDecorator, sourceFile) {
        var inArgs = outDecorator.expression.arguments;
        var _return = {
            name: (inArgs.length > 0) ? inArgs[0].text : property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined
        };
        if (property.symbol) {
            _return.description = marked$4(ts.displayPartsToString(property.symbol.getDocumentationComment()));
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked$4(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
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
    ClassHelper.prototype.visitArgument = function (arg) {
        var _this = this;
        var _result = {
            name: arg.name.text,
            type: this.visitType(arg)
        };
        if (arg.dotDotDotToken) {
            _result.dotDotDotToken = true;
        }
        if (arg.questionToken) {
            _result.optional = true;
        }
        if (arg.type) {
            if (arg.type.kind) {
                if (arg.type.kind === ts.SyntaxKind.FunctionType) {
                    _result.function = arg.type.parameters ? arg.type.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [];
                }
            }
        }
        return _result;
    };
    ClassHelper.prototype.getPosition = function (node, sourceFile) {
        var position;
        if (node.name && node.name.end) {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.name.end);
        }
        else {
            position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
        }
        return position;
    };
    ClassHelper.prototype.visitHostListener = function (property, hostListenerDecorator, sourceFile) {
        var _this = this;
        var inArgs = hostListenerDecorator.expression.arguments;
        var _return = {};
        _return.name = (inArgs.length > 0) ? inArgs[0].text : property.name.text;
        _return.args = property.parameters ? property.parameters.map(function (prop) { return _this.visitArgument(prop); }) : [];
        _return.argsDecorator = (inArgs.length > 1) ? inArgs[1].elements.map(function (prop) {
            return prop.text;
        }) : [];
        if (property.symbol) {
            _return.description = marked$4(ts.displayPartsToString(property.symbol.getDocumentationComment()));
        }
        if (!_return.description) {
            if (property.jsDoc) {
                if (property.jsDoc.length > 0) {
                    if (typeof property.jsDoc[0].comment !== 'undefined') {
                        _return.description = marked$4(property.jsDoc[0].comment);
                    }
                }
            }
        }
        _return.line = this.getPosition(property, sourceFile).line + 1;
        return _return;
    };
    return ClassHelper;
}());

var marked$2 = require('marked');
// TypeScript reference : https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts
var Dependencies = /** @class */ (function () {
    function Dependencies(files, options, configuration) {
        this.configuration = configuration;
        this.__nsModule = new NsModuleCache();
        this.cache = new ComponentCache();
        this.moduleHelper = new ModuleHelper(this.__nsModule, this.cache);
        this.jsDocHelper = new JsDocHelper();
        this.symbolHelper = new SymbolHelper();
        this.jsdocParserUtil = new JsdocParserUtil();
        this.files = files;
        var transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
        this.typeChecker = this.program.getTypeChecker();
        this.classHelper = new ClassHelper(this.typeChecker, this.configuration);
        this.componentHelper = new ComponentHelper(this.__nsModule, this.classHelper);
    }
    Dependencies.prototype.getDependencies = function () {
        var _this = this;
        var deps = {
            modules: [],
            modulesForGraph: [],
            components: [],
            injectables: [],
            pipes: [],
            directives: [],
            routes: [],
            classes: [],
            interfaces: [],
            miscellaneous: {
                variables: [],
                functions: [],
                typealiases: [],
                enumerations: []
            },
            routesTree: undefined
        };
        var sourceFiles = this.program.getSourceFiles() || [];
        sourceFiles.map(function (file) {
            var filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    logger.info('parsing', filePath);
                    _this.getSourceFileDecorators(file, deps);
                }
            }
            return deps;
        });
        // End of file scanning
        // Try merging inside the same file declarated variables & modules with imports | exports | declarations | providers
        if (deps.miscellaneous.variables.length > 0) {
            deps.miscellaneous.variables.forEach(function (_variable) {
                var newVar = [];
                (function (_var, _newVar) {
                    // getType pr reconstruire....
                    if (_var.initializer) {
                        if (_var.initializer.elements) {
                            if (_var.initializer.elements.length > 0) {
                                _var.initializer.elements.forEach(function (element) {
                                    if (element.text) {
                                        newVar.push({
                                            name: element.text,
                                            type: _this.symbolHelper.getType(element.text)
                                        });
                                    }
                                });
                            }
                        }
                    }
                })(_variable, newVar);
                var onLink = function (mod) {
                    if (mod.file === _variable.file) {
                        var process = function (initialArray, _var) {
                            var indexToClean = 0;
                            var found = false;
                            var findVariableInArray = function (el, index, theArray) {
                                if (el.name === _var.name) {
                                    indexToClean = index;
                                    found = true;
                                }
                            };
                            initialArray.forEach(findVariableInArray);
                            // Clean indexes to replace
                            if (found) {
                                initialArray.splice(indexToClean, 1);
                                // Add variable
                                newVar.forEach(function (newEle) {
                                    if (typeof _.find(initialArray, { 'name': newEle.name }) === 'undefined') {
                                        initialArray.push(newEle);
                                    }
                                });
                            }
                        };
                        process(mod.imports, _variable);
                        process(mod.exports, _variable);
                        process(mod.declarations, _variable);
                        process(mod.providers, _variable);
                    }
                };
                deps.modules.forEach(onLink);
                deps.modulesForGraph.forEach(onLink);
            });
        }
        // RouterParser.printModulesRoutes();
        // RouterParser.printRoutes();
        /*if (RouterParser.incompleteRoutes.length > 0) {
            if (deps['miscellaneous']['variables'].length > 0) {
                RouterParser.fixIncompleteRoutes(deps['miscellaneous']['variables']);
            }
        }*/
        // $componentsTreeEngine.createTreesForComponents();
        RouterParser.linkModulesAndRoutes();
        RouterParser.constructModulesTree();
        deps.routesTree = RouterParser.constructRoutesTree();
        return deps;
    };
    Dependencies.prototype.processClass = function (node, file, srcFile, outputSymbols) {
        var name = this.getSymboleName(node);
        var IO = this.getClassIO(file, srcFile, node);
        var deps = {
            name: name,
            id: 'class-' + name + '-' + Date.now(),
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
        if (IO.indexSignatures) {
            deps.indexSignatures = IO.indexSignatures;
        }
        if (IO.extends) {
            deps.extends = IO.extends;
        }
        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
            deps.jsdoctags = IO.jsdoctags[0].tags;
        }
        if (IO.implements && IO.implements.length > 0) {
            deps.implements = IO.implements;
        }
        this.debug(deps);
        outputSymbols.classes.push(deps);
    };
    Dependencies.prototype.getSourceFileDecorators = function (srcFile, outputSymbols) {
        var _this = this;
        var cleaner = (process.cwd() + path.sep).replace(/\\/g, '/');
        var file = srcFile.fileName.replace(cleaner, '');
        ts.forEachChild(srcFile, function (node) {
            if (_this.jsDocHelper.hasJSDocInternalTag(file, srcFile, node) && _this.configuration.mainData.disablePrivateOrInternalSupport) {
                return;
            }
            if (node.decorators) {
                var classWithCustomDecorator_1 = false;
                var visitNode = function (visitedNode, index) {
                    var deps;
                    var metadata = node.decorators;
                    var name = _this.getSymboleName(node);
                    var props = _this.findProps(visitedNode);
                    var IO = _this.componentHelper.getComponentIO(file, srcFile, node);
                    if (_this.isModule(metadata)) {
                        var moduleDep = new ModuleDepFactory(_this.moduleHelper)
                            .create(file, srcFile, name, props, IO);
                        if (RouterParser.hasRouterModuleInImports(moduleDep.imports)) {
                            RouterParser.addModuleWithRoutes(name, _this.moduleHelper.getModuleImportsRaw(props), file);
                        }
                        RouterParser.addModule(name, moduleDep.imports);
                        outputSymbols.modules.push(moduleDep);
                        outputSymbols.modulesForGraph.push(moduleDep);
                        deps = moduleDep;
                    }
                    else if (_this.isComponent(metadata)) {
                        if (props.length === 0) {
                            return;
                        }
                        var componentDep = new ComponentDepFactory(_this.componentHelper, _this.configuration)
                            .create(file, srcFile, name, props, IO);
                        $componentsTreeEngine.addComponent(componentDep);
                        outputSymbols.components.push(componentDep);
                        deps = componentDep;
                    }
                    else if (_this.isInjectable(metadata)) {
                        var injectableDeps = {
                            name: name,
                            id: 'injectable-' + name + '-' + Date.now(),
                            file: file,
                            type: 'injectable',
                            properties: IO.properties,
                            methods: IO.methods,
                            description: IO.description,
                            sourceCode: srcFile.getText()
                        };
                        if (IO.constructor) {
                            injectableDeps.constructorObj = IO.constructor;
                        }
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            injectableDeps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        outputSymbols.injectables.push(injectableDeps);
                        deps = injectableDeps;
                    }
                    else if (_this.isPipe(metadata)) {
                        var pipeDeps = {
                            name: name,
                            id: 'pipe-' + name + '-' + Date.now(),
                            file: file,
                            type: 'pipe',
                            description: IO.description,
                            sourceCode: srcFile.getText(),
                            exampleUrls: _this.componentHelper.getComponentExampleUrls(srcFile.getText())
                        };
                        if (IO.jsdoctags && IO.jsdoctags.length > 0) {
                            pipeDeps.jsdoctags = IO.jsdoctags[0].tags;
                        }
                        outputSymbols.pipes.push(pipeDeps);
                        deps = pipeDeps;
                    }
                    else if (_this.isDirective(metadata)) {
                        if (props.length === 0) {
                            return;
                        }
                        var directiveDeps = new DirectiveDepFactory(_this.componentHelper)
                            .create(file, srcFile, name, props, IO);
                        outputSymbols.directives.push(directiveDeps);
                        deps = directiveDeps;
                    }
                    else {
                        // Just a class
                        if (!classWithCustomDecorator_1) {
                            classWithCustomDecorator_1 = true;
                            _this.processClass(node, file, srcFile, outputSymbols);
                        }
                    }
                    _this.cache.set(name, deps);
                    _this.debug(deps);
                };
                var filterByDecorators = function (filteredNode) {
                    if (filteredNode.expression && filteredNode.expression.expression) {
                        var _test = /(NgModule|Component|Injectable|Pipe|Directive)/.test(filteredNode.expression.expression.text);
                        if (!_test && node.kind === ts.SyntaxKind.ClassDeclaration) {
                            _test = true;
                        }
                        return _test;
                    }
                    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                        return true;
                    }
                    return false;
                };
                node.decorators
                    .filter(filterByDecorators)
                    .forEach(visitNode);
            }
            else if (node.symbol) {
                if (node.symbol.flags === ts.SymbolFlags.Class) {
                    _this.processClass(node, file, srcFile, outputSymbols);
                }
                else if (node.symbol.flags === ts.SymbolFlags.Interface) {
                    var name = _this.getSymboleName(node);
                    var IO = _this.getInterfaceIO(file, srcFile, node);
                    var interfaceDeps = {
                        name: name,
                        id: 'interface-' + name + '-' + Date.now(),
                        file: file,
                        type: 'interface',
                        sourceCode: srcFile.getText()
                    };
                    if (IO.properties) {
                        interfaceDeps.properties = IO.properties;
                    }
                    if (IO.indexSignatures) {
                        interfaceDeps.indexSignatures = IO.indexSignatures;
                    }
                    if (IO.kind) {
                        interfaceDeps.kind = IO.kind;
                    }
                    if (IO.description) {
                        interfaceDeps.description = IO.description;
                    }
                    if (IO.methods) {
                        interfaceDeps.methods = IO.methods;
                    }
                    if (IO.extends) {
                        interfaceDeps.extends = IO.extends;
                    }
                    _this.debug(interfaceDeps);
                    outputSymbols.interfaces.push(interfaceDeps);
                }
                else if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
                    var infos = _this.visitFunctionDeclaration(node);
                    var tags = _this.visitFunctionDeclarationJSDocTags(node);
                    var name = infos.name;
                    var functionDep = {
                        name: name,
                        file: file,
                        type: 'miscellaneous',
                        subtype: 'function',
                        description: _this.visitEnumTypeAliasFunctionDeclarationDescription(node)
                    };
                    if (infos.args) {
                        functionDep.args = infos.args;
                    }
                    if (tags && tags.length > 0) {
                        functionDep.jsdoctags = tags;
                    }
                    outputSymbols.miscellaneous.functions.push(functionDep);
                }
                else if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                    var infos = _this.visitEnumDeclaration(node);
                    var name = node.name.text;
                    var enumDeps = {
                        name: name,
                        childs: infos,
                        type: 'miscellaneous',
                        subtype: 'enum',
                        description: _this.visitEnumTypeAliasFunctionDeclarationDescription(node),
                        file: file
                    };
                    outputSymbols.miscellaneous.enumerations.push(enumDeps);
                }
                else if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
                    var infos = _this.visitTypeDeclaration(node);
                    var name = infos.name;
                    var typeAliasDeps = {
                        name: name,
                        type: 'miscellaneous',
                        subtype: 'typealias',
                        rawtype: _this.classHelper.visitType(node),
                        file: file,
                        description: _this.visitEnumTypeAliasFunctionDeclarationDescription(node)
                    };
                    if (node.type) {
                        typeAliasDeps.kind = node.type.kind;
                        if (typeAliasDeps.rawtype === '') {
                            typeAliasDeps.rawtype = kindToType(node.type.kind);
                        }
                    }
                    outputSymbols.miscellaneous.typealiases.push(typeAliasDeps);
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
                        // tslint:disable-next-line:max-line-length
                        logger.error('Routes parsing error, maybe a trailing comma or an external variable, trying to fix that later after sources scanning.');
                        newRoutes = IO.routes.replace(/ /gm, '');
                        RouterParser.addIncompleteRoute({
                            data: newRoutes,
                            file: file
                        });
                        return true;
                    }
                    outputSymbols.routes = outputSymbols.routes.concat(newRoutes);
                }
                if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                    _this.processClass(node, file, srcFile, outputSymbols);
                }
                if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                    var bootstrapModuleReference = 'bootstrapModule';
                    // Find the root module with bootstrapModule call
                    // 1. find a simple call : platformBrowserDynamic().bootstrapModule(AppModule);
                    // 2. or inside a call :
                    // () => {
                    //     platformBrowserDynamic().bootstrapModule(AppModule);
                    // });
                    // 3. with a catch : platformBrowserDynamic().bootstrapModule(AppModule).catch(error => console.error(error));
                    // 4. with parameters : platformBrowserDynamic().bootstrapModule(AppModule, {}).catch(error => console.error(error));
                    // Find recusively in expression nodes one with name 'bootstrapModule'
                    var rootModule_1;
                    var resultNode = void 0;
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
                    var infos = _this.visitVariableDeclaration(node);
                    var name = infos.name;
                    var deps = {
                        name: name,
                        type: 'miscellaneous',
                        subtype: 'variable',
                        file: file
                    };
                    deps.type = (infos.type) ? infos.type : '';
                    if (infos.defaultValue) {
                        deps.defaultValue = infos.defaultValue;
                    }
                    if (infos.initializer) {
                        deps.initializer = infos.initializer;
                    }
                    if (node.jsDoc && node.jsDoc.length > 0 && node.jsDoc[0].comment) {
                        deps.description = marked$2(node.jsDoc[0].comment);
                    }
                    outputSymbols.miscellaneous.variables.push(deps);
                }
                if (node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
                    var infos = _this.visitTypeDeclaration(node);
                    var name = infos.name;
                    var deps = {
                        name: name,
                        type: 'miscellaneous',
                        subtype: 'typealias',
                        rawtype: _this.classHelper.visitType(node),
                        file: file,
                        description: _this.visitEnumTypeAliasFunctionDeclarationDescription(node)
                    };
                    if (node.type) {
                        deps.kind = node.type.kind;
                    }
                    outputSymbols.miscellaneous.typealiases.push(deps);
                }
                if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
                    var infos = _this.visitFunctionDeclaration(node);
                    var name = infos.name;
                    var deps = {
                        name: name,
                        type: 'miscellaneous',
                        subtype: 'function',
                        file: file,
                        description: _this.visitEnumTypeAliasFunctionDeclarationDescription(node)
                    };
                    if (infos.args) {
                        deps.args = infos.args;
                    }
                    outputSymbols.miscellaneous.functions.push(deps);
                }
                if (node.kind === ts.SyntaxKind.EnumDeclaration) {
                    var infos = _this.visitEnumDeclaration(node);
                    var name = node.name.text;
                    var deps = {
                        name: name,
                        childs: infos,
                        type: 'miscellaneous',
                        subtype: 'enum',
                        description: _this.visitEnumTypeAliasFunctionDeclarationDescription(node),
                        file: file
                    };
                    outputSymbols.miscellaneous.enumerations.push(deps);
                }
            }
        });
    };
    Dependencies.prototype.debug = function (deps) {
        if (deps) {
            logger.debug('found', "" + deps.name);
        }
        else {
            return;
        }
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
            var i = 0;
            var len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName &&
                        node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        result = true;
                    }
                }
            }
        }
        return result;
    };
    Dependencies.prototype.findExpressionByNameInExpressions = function (entryNode, name) {
        var result;
        var loop = function (node, z) {
            if (node.expression && !node.expression.name) {
                loop(node.expression, z);
            }
            if (node.expression && node.expression.name) {
                if (node.expression.name.text === z) {
                    result = node;
                }
                else {
                    loop(node.expression, z);
                }
            }
        };
        loop(entryNode, name);
        return result;
    };
    Dependencies.prototype.findExpressionByNameInExpressionArguments = function (arg, name) {
        var result;
        var that = this;
        var i = 0;
        var len = arg.length;
        var loop = function (node, z) {
            if (node.body) {
                if (node.body.statements && node.body.statements.length > 0) {
                    var j = 0;
                    var leng = node.body.statements.length;
                    for (j; j < leng; j++) {
                        result = that.findExpressionByNameInExpressions(node.body.statements[j], z);
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
    Dependencies.prototype.getSymboleName = function (node) {
        return node.name.text;
    };
    Dependencies.prototype.findProps = function (visitedNode) {
        if (visitedNode.expression.arguments && visitedNode.expression.arguments.length > 0) {
            var pop = visitedNode.expression.arguments.pop();
            if (typeof pop.properties !== 'undefined') {
                return pop.properties;
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
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
    Dependencies.prototype.visitTypeDeclaration = function (node) {
        var result = {
            name: node.name.text,
            kind: node.kind
        };
        var jsdoctags = this.jsdocParserUtil.getJSDocs(node);
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result.jsdoctags = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitArgument = function (arg) {
        var result = {
            name: arg.name.text
        };
        if (arg.type) {
            result.type = this.mapType(arg.type.kind);
            if (arg.type.kind === 157) {
                // try replace TypeReference with typeName
                if (arg.type.typeName) {
                    result.type = arg.type.typeName.text;
                }
            }
        }
        return result;
    };
    Dependencies.prototype.mapType = function (type) {
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
    Dependencies.prototype.visitFunctionDeclaration = function (method) {
        var _this = this;
        var result = {
            name: method.name.text,
            args: method.parameters ? method.parameters.map(function (prop) { return _this.visitArgument(prop); }) : []
        };
        var jsdoctags = this.jsdocParserUtil.getJSDocs(method);
        if (typeof method.type !== 'undefined') {
            result.returnType = this.classHelper.visitType(method.type);
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
            var i = 0;
            var len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                var result = {
                    name: node.declarationList.declarations[i].name.text,
                    defaultValue: node.declarationList.declarations[i].initializer ?
                        this.classHelper.stringifyDefaultValue(node.declarationList.declarations[i].initializer) : undefined
                };
                if (node.declarationList.declarations[i].initializer) {
                    result.initializer = node.declarationList.declarations[i].initializer;
                }
                if (node.declarationList.declarations[i].type) {
                    result.type = this.classHelper.visitType(node.declarationList.declarations[i].type);
                }
                if (typeof result.type === 'undefined' && result.initializer) {
                    result.type = kindToType(result.initializer.kind);
                }
                return result;
            }
        }
    };
    Dependencies.prototype.visitFunctionDeclarationJSDocTags = function (node) {
        var jsdoctags = this.jsdocParserUtil.getJSDocs(node);
        var result;
        if (jsdoctags && jsdoctags.length >= 1) {
            if (jsdoctags[0].tags) {
                result = markedtags(jsdoctags[0].tags);
            }
        }
        return result;
    };
    Dependencies.prototype.visitEnumTypeAliasFunctionDeclarationDescription = function (node) {
        var description = '';
        if (node.jsDoc) {
            if (node.jsDoc.length > 0) {
                if (typeof node.jsDoc[0].comment !== 'undefined') {
                    description = marked$2(node.jsDoc[0].comment);
                }
            }
        }
        return description;
    };
    Dependencies.prototype.visitEnumDeclaration = function (node) {
        var result = [];
        if (node.members) {
            var i = 0;
            var len = node.members.length;
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
            var i = 0;
            var len = node.declarationList.declarations.length;
            for (i; i < len; i++) {
                if (node.declarationList.declarations[i].type) {
                    if (node.declarationList.declarations[i].type.typeName &&
                        node.declarationList.declarations[i].type.typeName.text === 'Routes') {
                        var data = new CodeGenerator().generate(node.declarationList.declarations[i].initializer);
                        RouterParser.addRoute({
                            name: node.declarationList.declarations[i].name.text,
                            data: RouterParser.cleanRawRoute(data),
                            filename: fileName
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
    Dependencies.prototype.getClassIO = function (filename, sourceFile, node) {
        var _this = this;
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var res = sourceFile.statements.reduce(function (directive, statement) {
            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                if (statement.pos === node.pos && statement.end === node.end) {
                    return directive.concat(_this.classHelper.visitClassDeclaration(filename, statement, sourceFile));
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
                    return directive.concat(_this.classHelper.visitClassDeclaration(filename, statement, sourceFile));
                }
            }
            return directive;
        }, []);
        return res[0] || {};
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

var DependenciesEngine = /** @class */ (function () {
    function DependenciesEngine() {
        this.angularApiUtil = new AngularApiUtil();
    }
    DependenciesEngine.prototype.cleanModules = function (modules) {
        var _m = modules;
        var i = 0;
        var len = modules.length;
        for (i; i < len; i++) {
            var j = 0;
            var leng = _m[i].declarations.length;
            for (j; j < leng; j++) {
                var k = 0;
                var lengt = void 0;
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
            }
        }
        return _m;
    };
    DependenciesEngine.prototype.init = function (data) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.rawModulesForOverview = _.sortBy(data.modulesForGraph, ['name']);
        this.rawModules = _.sortBy(data.modulesForGraph, ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.interfaces = _.sortBy(this.rawData.interfaces, ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
        this.miscellaneous = this.rawData.miscellaneous;
        this.prepareMiscellaneous();
        this.routes = this.rawData.routesTree;
    };
    DependenciesEngine.prototype.findInCompodocDependencies = function (type, data) {
        var _result = {
            source: 'internal',
            data: undefined
        };
        for (var i = 0; i < data.length; i++) {
            if (typeof type !== 'undefined') {
                if (type.indexOf(data[i].name) !== -1) {
                    _result.data = data[i];
                }
            }
        }
        return _result;
    };
    DependenciesEngine.prototype.find = function (type) {
        var _this = this;
        var searchFunctions = [
            function () { return _this.findInCompodocDependencies(type, _this.injectables); },
            function () { return _this.findInCompodocDependencies(type, _this.interfaces); },
            function () { return _this.findInCompodocDependencies(type, _this.classes); },
            function () { return _this.findInCompodocDependencies(type, _this.components); },
            function () { return _this.findInCompodocDependencies(type, _this.miscellaneous.variables); },
            function () { return _this.findInCompodocDependencies(type, _this.miscellaneous.functions); },
            function () { return _this.findInCompodocDependencies(type, _this.miscellaneous.typealiases); },
            function () { return _this.findInCompodocDependencies(type, _this.miscellaneous.enumerations); },
            function () { return _this.angularApiUtil.findApi(type); }
        ];
        for (var _i = 0, searchFunctions_1 = searchFunctions; _i < searchFunctions_1.length; _i++) {
            var searchFunction = searchFunctions_1[_i];
            var result = searchFunction();
            if (result.data) {
                return result;
            }
        }
        return undefined;
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
        this.prepareMiscellaneous();
    };
    DependenciesEngine.prototype.findInCompodoc = function (name) {
        var mergedData = _.concat([], this.modules, this.components, this.directives, this.injectables, this.interfaces, this.pipes, this.classes);
        var result = _.find(mergedData, { 'name': name });
        return result || false;
    };
    DependenciesEngine.prototype.prepareMiscellaneous = function () {
        this.miscellaneous.variables.sort(getNamesCompareFn());
        this.miscellaneous.functions.sort(getNamesCompareFn());
        this.miscellaneous.enumerations.sort(getNamesCompareFn());
        this.miscellaneous.typealiases.sort(getNamesCompareFn());
        // group each subgoup by file
        this.miscellaneous.groupedVariables = _.groupBy(this.miscellaneous.variables, 'file');
        this.miscellaneous.groupedFunctions = _.groupBy(this.miscellaneous.functions, 'file');
        this.miscellaneous.groupedEnumerations = _.groupBy(this.miscellaneous.enumerations, 'file');
        this.miscellaneous.groupedTypeAliases = _.groupBy(this.miscellaneous.typealiases, 'file');
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
    return DependenciesEngine;
}());

var ts$1 = require('typescript');
var chokidar = require('chokidar');
var marked = require('marked');
var pkg$1 = require('../package.json');
var cwd$1 = process.cwd();
var $markdownengine = new MarkdownEngine();
var startTime = new Date();
var Application = /** @class */ (function () {
    /**
     * Create a new compodoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    function Application(options) {
        var _this = this;
        /**
         * Files changed during watch scanning
         */
        this.watchChangedFiles = [];
        /**
         * Boolean for watching status
         * @type {boolean}
         */
        this.isWatching = false;
        this.angularVersionUtil = new AngularVersionUtil();
        this.fileEngine = new FileEngine();
        this.preparePipes = function (somePipes) {
            logger.info('Prepare pipes');
            _this.configuration.mainData.pipes = (somePipes) ? somePipes : _this.dependenciesEngine.getPipes();
            return new Promise(function (resolve$$1, reject) {
                var i = 0;
                var len = _this.configuration.mainData.pipes.length;
                var loop = function () {
                    if (i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.pipes[i].file)) {
                            logger.info(" " + _this.configuration.mainData.pipes[i].name + " has a README file, include it");
                            var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.pipes[i].file);
                            _this.configuration.mainData.pipes[i].readme = marked(readme);
                        }
                        _this.configuration.addPage({
                            path: 'pipes',
                            name: _this.configuration.mainData.pipes[i].name,
                            id: _this.configuration.mainData.pipes[i].id,
                            context: 'pipe',
                            pipe: _this.configuration.mainData.pipes[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    }
                    else {
                        resolve$$1();
                    }
                };
                loop();
            });
        };
        this.prepareClasses = function (someClasses) {
            logger.info('Prepare classes');
            _this.configuration.mainData.classes = (someClasses) ? someClasses : _this.dependenciesEngine.getClasses();
            return new Promise(function (resolve$$1, reject) {
                var i = 0;
                var len = _this.configuration.mainData.classes.length;
                var loop = function () {
                    if (i < len) {
                        if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.classes[i].file)) {
                            logger.info(" " + _this.configuration.mainData.classes[i].name + " has a README file, include it");
                            var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.classes[i].file);
                            _this.configuration.mainData.classes[i].readme = marked(readme);
                        }
                        _this.configuration.addPage({
                            path: 'classes',
                            name: _this.configuration.mainData.classes[i].name,
                            id: _this.configuration.mainData.classes[i].id,
                            context: 'class',
                            class: _this.configuration.mainData.classes[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        i++;
                        loop();
                    }
                    else {
                        resolve$$1();
                    }
                };
                loop();
            });
        };
        this.configuration = new Configuration();
        this.dependenciesEngine = new DependenciesEngine();
        this.ngdEngine = new NgdEngine(this.dependenciesEngine);
        this.htmlEngine = new HtmlEngine(this.configuration, this.dependenciesEngine, this.fileEngine);
        this.searchEngine = new SearchEngine(this.configuration, this.fileEngine);
        for (var option in options) {
            if (typeof this.configuration.mainData[option] !== 'undefined') {
                this.configuration.mainData[option] = options[option];
            }
            // For documentationMainName, process it outside the loop, for handling conflict with pages name
            if (option === 'name') {
                this.configuration.mainData.documentationMainName = options[option];
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
        if (this.configuration.mainData.output.charAt(this.configuration.mainData.output.length - 1) !== '/') {
            this.configuration.mainData.output += '/';
        }
        this.htmlEngine.init()
            .then(function () { return _this.processPackageJson(); });
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
     * Return a boolean indicating presence of one root markdown files in updatedFiles list
     * @return {boolean} Result of scan
     */
    Application.prototype.hasWatchedFilesRootMarkdownFiles = function () {
        var result = false;
        _.forEach(this.updatedFiles, function (file) {
            if (path.extname(file) === '.md' && path.dirname(file) === process.cwd()) {
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
        this.watchChangedFiles = [];
    };
    Application.prototype.processPackageJson = function () {
        var _this = this;
        logger.info('Searching package.json file');
        this.fileEngine.get(process.cwd() + path.sep + 'package.json').then(function (packageData) {
            var parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined' && _this.configuration.mainData.documentationMainName === COMPODOC_DEFAULTS.title) {
                _this.configuration.mainData.documentationMainName = parsedData.name + ' documentation';
            }
            if (typeof parsedData.description !== 'undefined') {
                _this.configuration.mainData.documentationMainDescription = parsedData.description;
            }
            _this.configuration.mainData.angularVersion = _this.angularVersionUtil.getAngularVersionOfProject(parsedData);
            logger.info('package.json file found');
            _this.processMarkdowns().then(function () {
                _this.getDependenciesData();
            }, function (errorMessage) {
                logger.error(errorMessage);
            });
        }, function (errorMessage) {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            _this.processMarkdowns().then(function () {
                _this.getDependenciesData();
            }, function (errorMessage1) {
                logger.error(errorMessage1);
            });
        });
    };
    Application.prototype.processMarkdowns = function () {
        var _this = this;
        logger.info('Searching README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md files');
        return new Promise(function (resolve$$1, reject) {
            var i = 0;
            var markdowns = ['readme', 'changelog', 'contributing', 'license', 'todo'];
            var numberOfMarkdowns = 5;
            var loop = function () {
                if (i < numberOfMarkdowns) {
                    $markdownengine.getTraditionalMarkdown(markdowns[i].toUpperCase()).then(function (readmeData) {
                        _this.configuration.addPage({
                            name: (markdowns[i] === 'readme') ? 'index' : markdowns[i],
                            context: 'getting-started',
                            id: 'getting-started',
                            markdown: readmeData,
                            depth: 0,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                        });
                        if (markdowns[i] === 'readme') {
                            _this.configuration.mainData.readme = true;
                            _this.configuration.addPage({
                                name: 'overview',
                                id: 'overview',
                                context: 'overview',
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                        }
                        else {
                            _this.configuration.mainData.markdowns.push({
                                name: markdowns[i],
                                uppername: markdowns[i].toUpperCase(),
                                depth: 0,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
                            });
                        }
                        logger.info(markdowns[i].toUpperCase() + ".md file found");
                        i++;
                        loop();
                    }, function (errorMessage) {
                        logger.warn(errorMessage);
                        logger.warn("Continuing without " + markdowns[i].toUpperCase() + ".md file");
                        if (markdowns[i] === 'readme') {
                            _this.configuration.addPage({
                                name: 'index',
                                id: 'index',
                                context: 'overview'
                            });
                        }
                        i++;
                        loop();
                    });
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.rebuildRootMarkdowns = function () {
        var _this = this;
        logger.info('Regenerating README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, TODO.md pages');
        var actions = [];
        this.configuration.resetRootMarkdownPages();
        actions.push(function () { return _this.processMarkdowns(); });
        promiseSequential(actions)
            .then(function (res) {
            _this.processPages();
            _this.clearUpdatedFiles();
        })
            .catch(function (errorMessage) {
            logger.error(errorMessage);
        });
    };
    /**
     * Get dependency data for small group of updated files during watch process
     */
    Application.prototype.getMicroDependenciesData = function () {
        logger.info('Get diff dependencies data');
        var crawler = new Dependencies(this.updatedFiles, {
            tsconfigDirectory: path.dirname(this.configuration.mainData.tsconfig)
        }, this.configuration);
        var dependenciesData = crawler.getDependencies();
        this.dependenciesEngine.update(dependenciesData);
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
        }, this.configuration);
        var dependenciesData = crawler.getDependencies();
        this.dependenciesEngine.init(dependenciesData);
        this.configuration.mainData.routesLength = RouterParser.routesLength();
        this.printStatistics();
        this.prepareEverything();
    };
    Application.prototype.prepareJustAFewThings = function (diffCrawledData) {
        var _this = this;
        var actions = [];
        this.configuration.resetPages();
        actions.push(function () { return _this.prepareRoutes(); });
        if (diffCrawledData.modules.length > 0) {
            actions.push(function () { return _this.prepareModules(); });
        }
        if (diffCrawledData.components.length > 0) {
            actions.push(function () { return _this.prepareComponents(); });
        }
        if (diffCrawledData.directives.length > 0) {
            actions.push(function () { return _this.prepareDirectives(); });
        }
        if (diffCrawledData.injectables.length > 0) {
            actions.push(function () { return _this.prepareInjectables(); });
        }
        if (diffCrawledData.pipes.length > 0) {
            actions.push(function () { return _this.preparePipes(); });
        }
        if (diffCrawledData.classes.length > 0) {
            actions.push(function () { return _this.prepareClasses(); });
        }
        if (diffCrawledData.interfaces.length > 0) {
            actions.push(function () { return _this.prepareInterfaces(); });
        }
        if (diffCrawledData.miscellaneous.variables.length > 0 ||
            diffCrawledData.miscellaneous.functions.length > 0 ||
            diffCrawledData.miscellaneous.typealiases.length > 0 ||
            diffCrawledData.miscellaneous.enumerations.length > 0) {
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
    Application.prototype.printStatistics = function () {
        logger.info('-------------------');
        logger.info('Project statistics ');
        if (this.dependenciesEngine.modules.length > 0) {
            logger.info("- module     : " + this.dependenciesEngine.modules.length);
        }
        if (this.dependenciesEngine.components.length > 0) {
            logger.info("- component  : " + this.dependenciesEngine.components.length);
        }
        if (this.dependenciesEngine.directives.length > 0) {
            logger.info("- directive  : " + this.dependenciesEngine.directives.length);
        }
        if (this.dependenciesEngine.injectables.length > 0) {
            logger.info("- injectable : " + this.dependenciesEngine.injectables.length);
        }
        if (this.dependenciesEngine.pipes.length > 0) {
            logger.info("- pipe       : " + this.dependenciesEngine.pipes.length);
        }
        if (this.dependenciesEngine.classes.length > 0) {
            logger.info("- class      : " + this.dependenciesEngine.classes.length);
        }
        if (this.dependenciesEngine.interfaces.length > 0) {
            logger.info("- interface  : " + this.dependenciesEngine.interfaces.length);
        }
        if (this.configuration.mainData.routesLength > 0) {
            logger.info("- route      : " + this.configuration.mainData.routesLength);
        }
        logger.info('-------------------');
    };
    Application.prototype.prepareEverything = function () {
        var _this = this;
        var actions = [];
        actions.push(function () { return _this.prepareModules(); });
        actions.push(function () { return _this.prepareComponents(); });
        if (this.dependenciesEngine.directives.length > 0) {
            actions.push(function () { return _this.prepareDirectives(); });
        }
        if (this.dependenciesEngine.injectables.length > 0) {
            actions.push(function () { return _this.prepareInjectables(); });
        }
        if (this.dependenciesEngine.routes && this.dependenciesEngine.routes.children.length > 0) {
            actions.push(function () { return _this.prepareRoutes(); });
        }
        if (this.dependenciesEngine.pipes.length > 0) {
            actions.push(function () { return _this.preparePipes(); });
        }
        if (this.dependenciesEngine.classes.length > 0) {
            actions.push(function () { return _this.prepareClasses(); });
        }
        if (this.dependenciesEngine.interfaces.length > 0) {
            actions.push(function () { return _this.prepareInterfaces(); });
        }
        if (this.dependenciesEngine.miscellaneous.variables.length > 0 ||
            this.dependenciesEngine.miscellaneous.functions.length > 0 ||
            this.dependenciesEngine.miscellaneous.typealiases.length > 0 ||
            this.dependenciesEngine.miscellaneous.enumerations.length > 0) {
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
        // Scan include folder for files detailed in summary.json
        // For each file, add to this.configuration.mainData.additionalPages
        // Each file will be converted to html page, inside COMPODOC_DEFAULTS.additionalEntryPath
        return new Promise(function (resolve$$1, reject) {
            _this.fileEngine.get(process.cwd() + path.sep + _this.configuration.mainData.includes + path.sep + 'summary.json')
                .then(function (summaryData) {
                logger.info('Additional documentation: summary.json file found');
                var parsedSummaryData = JSON.parse(summaryData);
                var i = 0;
                var len = parsedSummaryData.length;
                var loop = function () {
                    if (i <= len - 1) {
                        $markdownengine.getTraditionalMarkdown(_this.configuration.mainData.includes + path.sep + parsedSummaryData[i].file)
                            .then(function (markedData) {
                            _this.configuration.addAdditionalPage({
                                name: parsedSummaryData[i].title,
                                id: parsedSummaryData[i].title,
                                filename: cleanNameWithoutSpaceAndToLowerCase(parsedSummaryData[i].title),
                                context: 'additional-page',
                                path: _this.configuration.mainData.includesFolder,
                                additionalPage: markedData,
                                depth: 1,
                                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                            });
                            if (parsedSummaryData[i].children && parsedSummaryData[i].children.length > 0) {
                                var j_1 = 0;
                                var leng_1 = parsedSummaryData[i].children.length;
                                var loopChild_1 = function () {
                                    if (j_1 <= leng_1 - 1) {
                                        $markdownengine
                                            .getTraditionalMarkdown(_this.configuration.mainData.includes + path.sep + parsedSummaryData[i].children[j_1].file)
                                            .then(function (markedData) {
                                            _this.configuration.addAdditionalPage({
                                                name: parsedSummaryData[i].children[j_1].title,
                                                id: parsedSummaryData[i].children[j_1].title,
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
        var i = 0;
        var _modules = (someModules) ? someModules : this.dependenciesEngine.getModules();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.mainData.modules = _modules.map(function (ngModule) {
                ['declarations', 'bootstrap', 'imports', 'exports'].forEach(function (metadataType) {
                    ngModule[metadataType] = ngModule[metadataType].filter(function (metaDataItem) {
                        switch (metaDataItem.type) {
                            case 'directive':
                                return _this.dependenciesEngine.getDirectives().some(function (directive) { return directive.name === metaDataItem.name; });
                            case 'component':
                                return _this.dependenciesEngine.getComponents().some(function (component) { return component.name === metaDataItem.name; });
                            case 'module':
                                return _this.dependenciesEngine.getModules().some(function (module) { return module.name === metaDataItem.name; });
                            case 'pipe':
                                return _this.dependenciesEngine.getPipes().some(function (pipe) { return pipe.name === metaDataItem.name; });
                            default:
                                return true;
                        }
                    });
                });
                ngModule.providers = ngModule.providers.filter(function (provider) {
                    return _this.dependenciesEngine.getInjectables().some(function (injectable) { return injectable.name === provider.name; });
                });
                return ngModule;
            });
            _this.configuration.addPage({
                name: 'modules',
                id: 'modules',
                context: 'modules',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            var len = _this.configuration.mainData.modules.length;
            var loop = function () {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.modules[i].file)) {
                        logger.info(" " + _this.configuration.mainData.modules[i].name + " has a README file, include it");
                        var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.modules[i].file);
                        _this.configuration.mainData.modules[i].readme = marked(readme);
                    }
                    _this.configuration.addPage({
                        path: 'modules',
                        name: _this.configuration.mainData.modules[i].name,
                        id: _this.configuration.mainData.modules[i].id,
                        context: 'module',
                        module: _this.configuration.mainData.modules[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                    i++;
                    loop();
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareInterfaces = function (someInterfaces) {
        var _this = this;
        logger.info('Prepare interfaces');
        this.configuration.mainData.interfaces = (someInterfaces) ? someInterfaces : this.dependenciesEngine.getInterfaces();
        return new Promise(function (resolve$$1, reject) {
            var i = 0;
            var len = _this.configuration.mainData.interfaces.length;
            var loop = function () {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.interfaces[i].file)) {
                        logger.info(" " + _this.configuration.mainData.interfaces[i].name + " has a README file, include it");
                        var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.interfaces[i].file);
                        _this.configuration.mainData.interfaces[i].readme = marked(readme);
                    }
                    _this.configuration.addPage({
                        path: 'interfaces',
                        name: _this.configuration.mainData.interfaces[i].name,
                        id: _this.configuration.mainData.interfaces[i].id,
                        context: 'interface',
                        interface: _this.configuration.mainData.interfaces[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                    i++;
                    loop();
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareMiscellaneous = function (someMisc) {
        var _this = this;
        logger.info('Prepare miscellaneous');
        this.configuration.mainData.miscellaneous = (someMisc) ? someMisc : this.dependenciesEngine.getMiscellaneous();
        return new Promise(function (resolve$$1, reject) {
            if (_this.configuration.mainData.miscellaneous.functions.length > 0) {
                _this.configuration.addPage({
                    path: 'miscellaneous',
                    name: 'functions',
                    id: 'miscellaneous-functions',
                    context: 'miscellaneous-functions',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (_this.configuration.mainData.miscellaneous.variables.length > 0) {
                _this.configuration.addPage({
                    path: 'miscellaneous',
                    name: 'variables',
                    id: 'miscellaneous-variables',
                    context: 'miscellaneous-variables',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (_this.configuration.mainData.miscellaneous.typealiases.length > 0) {
                _this.configuration.addPage({
                    path: 'miscellaneous',
                    name: 'typealiases',
                    id: 'miscellaneous-typealiases',
                    context: 'miscellaneous-typealiases',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            if (_this.configuration.mainData.miscellaneous.enumerations.length > 0) {
                _this.configuration.addPage({
                    path: 'miscellaneous',
                    name: 'enumerations',
                    id: 'miscellaneous-enumerations',
                    context: 'miscellaneous-enumerations',
                    depth: 1,
                    pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                });
            }
            resolve$$1();
        });
    };
    Application.prototype.handleTemplateurl = function (component) {
        var dirname$$1 = path.dirname(component.file);
        var templatePath = path.resolve(dirname$$1 + path.sep + component.templateUrl);
        if (!this.fileEngine.existsSync(templatePath)) {
            var err = "Cannot read template for " + component.name;
            logger.error(err);
            return new Promise(function (resolve$$1, reject) { });
        }
        return this.fileEngine.get(templatePath)
            .then(function (data) { return component.templateData = data; }, function (err) {
            logger.error(err);
            return Promise.reject('');
        });
    };
    Application.prototype.prepareComponents = function (someComponents) {
        var _this = this;
        logger.info('Prepare components');
        this.configuration.mainData.components = (someComponents) ? someComponents : this.dependenciesEngine.getComponents();
        return new Promise(function (mainResolve, reject) {
            var i = 0;
            var len = _this.configuration.mainData.components.length;
            var loop = function () {
                if (i <= len - 1) {
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.components[i].file)) {
                        logger.info(" " + _this.configuration.mainData.components[i].name + " has a README file, include it");
                        var readmeFile = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.components[i].file);
                        _this.configuration.mainData.components[i].readme = marked(readmeFile);
                        _this.configuration.addPage({
                            path: 'components',
                            name: _this.configuration.mainData.components[i].name,
                            id: _this.configuration.mainData.components[i].id,
                            context: 'component',
                            component: _this.configuration.mainData.components[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        if (_this.configuration.mainData.components[i].templateUrl.length > 0) {
                            logger.info(" " + _this.configuration.mainData.components[i].name + " has a templateUrl, include it");
                            _this.handleTemplateurl(_this.configuration.mainData.components[i]).then(function () {
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
                    else {
                        _this.configuration.addPage({
                            path: 'components',
                            name: _this.configuration.mainData.components[i].name,
                            id: _this.configuration.mainData.components[i].id,
                            context: 'component',
                            component: _this.configuration.mainData.components[i],
                            depth: 1,
                            pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                        });
                        if (_this.configuration.mainData.components[i].templateUrl.length > 0) {
                            logger.info(" " + _this.configuration.mainData.components[i].name + " has a templateUrl, include it");
                            _this.handleTemplateurl(_this.configuration.mainData.components[i]).then(function () {
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
    Application.prototype.prepareDirectives = function (someDirectives) {
        var _this = this;
        logger.info('Prepare directives');
        this.configuration.mainData.directives = (someDirectives) ? someDirectives : this.dependenciesEngine.getDirectives();
        return new Promise(function (resolve$$1, reject) {
            var i = 0;
            var len = _this.configuration.mainData.directives.length;
            var loop = function () {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.directives[i].file)) {
                        logger.info(" " + _this.configuration.mainData.directives[i].name + " has a README file, include it");
                        var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.directives[i].file);
                        _this.configuration.mainData.directives[i].readme = marked(readme);
                    }
                    _this.configuration.addPage({
                        path: 'directives',
                        name: _this.configuration.mainData.directives[i].name,
                        id: _this.configuration.mainData.directives[i].id,
                        context: 'directive',
                        directive: _this.configuration.mainData.directives[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                    i++;
                    loop();
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareInjectables = function (someInjectables) {
        var _this = this;
        logger.info('Prepare injectables');
        this.configuration.mainData.injectables = (someInjectables) ? someInjectables : this.dependenciesEngine.getInjectables();
        return new Promise(function (resolve$$1, reject) {
            var i = 0;
            var len = _this.configuration.mainData.injectables.length;
            var loop = function () {
                if (i < len) {
                    if ($markdownengine.hasNeighbourReadmeFile(_this.configuration.mainData.injectables[i].file)) {
                        logger.info(" " + _this.configuration.mainData.injectables[i].name + " has a README file, include it");
                        var readme = $markdownengine.readNeighbourReadmeFile(_this.configuration.mainData.injectables[i].file);
                        _this.configuration.mainData.injectables[i].readme = marked(readme);
                    }
                    _this.configuration.addPage({
                        path: 'injectables',
                        name: _this.configuration.mainData.injectables[i].name,
                        id: _this.configuration.mainData.injectables[i].id,
                        context: 'injectable',
                        injectable: _this.configuration.mainData.injectables[i],
                        depth: 1,
                        pageType: COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL
                    });
                    i++;
                    loop();
                }
                else {
                    resolve$$1();
                }
            };
            loop();
        });
    };
    Application.prototype.prepareRoutes = function () {
        var _this = this;
        logger.info('Process routes');
        this.configuration.mainData.routes = this.dependenciesEngine.getRoutes();
        return new Promise(function (resolve$$1, reject) {
            _this.configuration.addPage({
                name: 'routes',
                id: 'routes',
                context: 'routes',
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            RouterParser.generateRoutesIndex(_this.configuration.mainData.output, _this.configuration.mainData.routes).then(function () {
                logger.info(' Routes index generated');
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
             * loop with components, directives, classes, injectables, interfaces, pipes
             */
            var files = [];
            var totalProjectStatementDocumented = 0;
            var getStatus = function (percent) {
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
            var processComponentsAndDirectives = function (list) {
                _.forEach(list, function (element) {
                    if (!element.propertiesClass ||
                        !element.methodsClass ||
                        !element.hostBindings ||
                        !element.hostListeners ||
                        !element.inputsClass ||
                        !element.outputsClass) {
                        return;
                    }
                    var cl = {
                        filePath: element.file,
                        type: element.type,
                        linktype: element.type,
                        name: element.name
                    };
                    var totalStatementDocumented = 0;
                    var totalStatements = element.propertiesClass.length +
                        element.methodsClass.length +
                        element.inputsClass.length +
                        element.hostBindings.length +
                        element.hostListeners.length +
                        element.outputsClass.length + 1; // +1 for element decorator comment
                    if (element.constructorObj) {
                        totalStatements += 1;
                        if (element.constructorObj && element.constructorObj.description && element.constructorObj.description !== '') {
                            totalStatementDocumented += 1;
                        }
                    }
                    if (element.description && element.description !== '') {
                        totalStatementDocumented += 1;
                    }
                    _.forEach(element.propertiesClass, function (property) {
                        if (property.modifierKind === 111) {
                            totalStatements -= 1;
                        }
                        if (property.description && property.description !== '' && property.modifierKind !== 111) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.methodsClass, function (method) {
                        if (method.modifierKind === 111) {
                            totalStatements -= 1;
                        }
                        if (method.description && method.description !== '' && method.modifierKind !== 111) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.hostBindings, function (property) {
                        if (property.modifierKind === 111) {
                            totalStatements -= 1;
                        }
                        if (property.description && property.description !== '' && property.modifierKind !== 111) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.hostListeners, function (method) {
                        if (method.modifierKind === 111) {
                            totalStatements -= 1;
                        }
                        if (method.description && method.description !== '' && method.modifierKind !== 111) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.inputsClass, function (input) {
                        if (input.modifierKind === 111) {
                            totalStatements -= 1;
                        }
                        if (input.description && input.description !== '' && input.modifierKind !== 111) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.outputsClass, function (output) {
                        if (output.modifierKind === 111) {
                            totalStatements -= 1;
                        }
                        if (output.description && output.description !== '' && output.modifierKind !== 111) {
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
            };
            var processCoveragePerFile = function () {
                logger.info('Process documentation coverage per file');
                logger.info('-------------------');
                var overFiles = files.filter(function (f) {
                    var overTest = f.coveragePercent >= _this.configuration.mainData.coverageMinimumPerFile;
                    if (overTest) {
                        logger.info(f.coveragePercent + " % for file " + f.filePath + " - over minimum per file");
                    }
                    return overTest;
                });
                var underFiles = files.filter(function (f) {
                    var underTest = f.coveragePercent < _this.configuration.mainData.coverageMinimumPerFile;
                    if (underTest) {
                        logger.error(f.coveragePercent + " % for file " + f.filePath + " - under minimum per file");
                    }
                    return underTest;
                });
                logger.info('-------------------');
                return {
                    overFiles: overFiles,
                    underFiles: underFiles
                };
            };
            processComponentsAndDirectives(_this.configuration.mainData.components);
            processComponentsAndDirectives(_this.configuration.mainData.directives);
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
                };
                var totalStatementDocumented = 0;
                var totalStatements = classe.properties.length + classe.methods.length + 1; // +1 for class itself
                if (classe.constructorObj) {
                    totalStatements += 1;
                    if (classe.constructorObj && classe.constructorObj.description && classe.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (classe.description && classe.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(classe.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(classe.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
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
                };
                var totalStatementDocumented = 0;
                var totalStatements = injectable.properties.length + injectable.methods.length + 1; // +1 for injectable itself
                if (injectable.constructorObj) {
                    totalStatements += 1;
                    if (injectable.constructorObj &&
                        injectable.constructorObj.description &&
                        injectable.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (injectable.description && injectable.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(injectable.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(injectable.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
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
                };
                var totalStatementDocumented = 0;
                var totalStatements = inter.properties.length + inter.methods.length + 1; // +1 for interface itself
                if (inter.constructorObj) {
                    totalStatements += 1;
                    if (inter.constructorObj && inter.constructorObj.description && inter.constructorObj.description !== '') {
                        totalStatementDocumented += 1;
                    }
                }
                if (inter.description && inter.description !== '') {
                    totalStatementDocumented += 1;
                }
                _.forEach(inter.properties, function (property) {
                    if (property.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (property.description && property.description !== '' && property.modifierKind !== 111) {
                        totalStatementDocumented += 1;
                    }
                });
                _.forEach(inter.methods, function (method) {
                    if (method.modifierKind === 111) {
                        totalStatements -= 1;
                    }
                    if (method.description && method.description !== '' && method.modifierKind !== 111) {
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
                };
                var totalStatementDocumented = 0;
                var totalStatements = 1;
                if (pipe.description && pipe.description !== '') {
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
                id: 'coverage',
                context: 'coverage',
                files: files,
                data: coverageData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            _this.htmlEngine.generateCoverageBadge(_this.configuration.mainData.output, coverageData);
            files = _.sortBy(files, ['coveragePercent']);
            var coverageTestPerFileResults;
            if (_this.configuration.mainData.coverageTest && !_this.configuration.mainData.coverageTestPerFile) {
                // Global coverage test and not per file
                if (coverageData.count >= _this.configuration.mainData.coverageTestThreshold) {
                    logger.info("Documentation coverage (" + coverageData.count + "%) is over threshold");
                    process.exit(0);
                }
                else {
                    logger.error("Documentation coverage (" + coverageData.count + "%) is not over threshold");
                    process.exit(1);
                }
            }
            else if (!_this.configuration.mainData.coverageTest && _this.configuration.mainData.coverageTestPerFile) {
                coverageTestPerFileResults = processCoveragePerFile();
                // Per file coverage test and not global
                if (coverageTestPerFileResults.underFiles.length > 0) {
                    logger.error('Documentation coverage per file is not achieved');
                    process.exit(1);
                }
                else {
                    logger.info('Documentation coverage per file is achieved');
                    process.exit(0);
                }
            }
            else if (_this.configuration.mainData.coverageTest && _this.configuration.mainData.coverageTestPerFile) {
                // Per file coverage test and global
                coverageTestPerFileResults = processCoveragePerFile();
                if (coverageData.count >= _this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length === 0) {
                    logger.info("Documentation coverage (" + coverageData.count + "%) is over threshold");
                    logger.info('Documentation coverage per file is achieved');
                    process.exit(0);
                }
                else if (coverageData.count >= _this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0) {
                    logger.info("Documentation coverage (" + coverageData.count + "%) is over threshold");
                    logger.error('Documentation coverage per file is not achieved');
                    process.exit(1);
                }
                else if (coverageData.count < _this.configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0) {
                    logger.error("Documentation coverage (" + coverageData.count + "%) is not over threshold");
                    logger.error('Documentation coverage per file is not achieved');
                    process.exit(1);
                }
                else {
                    logger.error("Documentation coverage (" + coverageData.count + "%) is not over threshold");
                    logger.info('Documentation coverage per file is achieved');
                    process.exit(1);
                }
            }
            else {
                resolve$$1();
            }
        });
    };
    Application.prototype.processPage = function (page) {
        logger.info('Process page', page.name);
        var htmlData = this.htmlEngine.render(this.configuration.mainData, page);
        var finalPath = this.configuration.mainData.output;
        if (this.configuration.mainData.output.lastIndexOf('/') === -1) {
            finalPath += '/';
        }
        if (page.path) {
            finalPath += page.path + '/';
        }
        if (page.filename) {
            finalPath += page.filename + '.html';
        }
        else {
            finalPath += page.name + '.html';
        }
        this.searchEngine.indexPage({
            infos: page,
            rawData: htmlData,
            url: finalPath
        });
        return this.fileEngine.write(finalPath, htmlData).catch(function (err) {
            logger.error('Error during ' + page.name + ' page generation');
            return Promise.reject('');
        });
    };
    Application.prototype.processPages = function () {
        var _this = this;
        logger.info('Process pages');
        var pages = this.configuration.pages;
        Promise.all(pages.map(function (page) { return _this.processPage(page); }))
            .then(function () {
            _this.searchEngine.generateSearchIndexJson(_this.configuration.mainData.output).then(function () {
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
        Promise.all(pages.map(function (page, i) { return _this.processPage(page); }))
            .then(function () {
            _this.searchEngine.generateSearchIndexJson(_this.configuration.mainData.output).then(function () {
                if (_this.configuration.mainData.assetsFolder !== '') {
                    _this.processAssetsFolder();
                }
                _this.processResources();
            });
        })
            .catch(function (e) {
            logger.error(e);
            return Promise.reject(e);
        });
    };
    Application.prototype.processAssetsFolder = function () {
        logger.info('Copy assets folder');
        if (!this.fileEngine.existsSync(this.configuration.mainData.assetsFolder)) {
            logger.error("Provided assets folder " + this.configuration.mainData.assetsFolder + " did not exist");
        }
        else {
            fs.copy(path.resolve(this.configuration.mainData.assetsFolder), path.resolve(this.configuration.mainData.output + path.sep + this.configuration.mainData.assetsFolder), function (err) {
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
            logger.info('Documentation generated in ' + _this.configuration.mainData.output +
                ' in ' + finalTime +
                ' seconds using ' + _this.configuration.mainData.theme + ' theme');
            if (_this.configuration.mainData.serve) {
                logger.info("Serving documentation from " + _this.configuration.mainData.output + " at http://127.0.0.1:" + _this.configuration.mainData.port);
                _this.runWebServer(_this.configuration.mainData.output);
            }
        };
        var finalOutput = this.configuration.mainData.output;
        var testOutputDir = this.configuration.mainData.output.match(process.cwd());
        if (!testOutputDir) {
            finalOutput = this.configuration.mainData.output.replace(process.cwd(), '');
        }
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(finalOutput), function (err) {
            if (err) {
                logger.error('Error during resources copy ', err);
            }
            else {
                if (_this.configuration.mainData.extTheme) {
                    fs.copy(path.resolve(process.cwd() + path.sep + _this.configuration.mainData.extTheme), path.resolve(finalOutput + '/styles/'), function (err1) {
                        if (err1) {
                            logger.error('Error during external styling theme copy ', err1);
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
            var modules_1 = this.configuration.mainData.modules;
            var i_1 = 0;
            var len_1 = modules_1.length;
            var loop_1 = function () {
                if (i_1 <= len_1 - 1) {
                    logger.info('Process module graph', modules_1[i_1].name);
                    var finalPath_1 = _this.configuration.mainData.output;
                    if (_this.configuration.mainData.output.lastIndexOf('/') === -1) {
                        finalPath_1 += '/';
                    }
                    finalPath_1 += 'modules/' + modules_1[i_1].name;
                    var _rawModule = _this.dependenciesEngine.getRawModule(modules_1[i_1].name);
                    if (_rawModule.declarations.length > 0 ||
                        _rawModule.bootstrap.length > 0 ||
                        _rawModule.imports.length > 0 ||
                        _rawModule.exports.length > 0 ||
                        _rawModule.providers.length > 0) {
                        _this.ngdEngine.renderGraph(modules_1[i_1].file, finalPath_1, 'f', modules_1[i_1].name).then(function () {
                            _this.ngdEngine.readGraph(path.resolve(finalPath_1 + path.sep + 'dependencies.svg'), modules_1[i_1].name)
                                .then(function (data) {
                                modules_1[i_1].graph = data;
                                i_1++;
                                loop_1();
                            }, function (err) {
                                logger.error('Error during graph read: ', err);
                            });
                        }, function (errorMessage) {
                            logger.error(errorMessage);
                        });
                    }
                    else {
                        i_1++;
                        loop_1();
                    }
                }
                else {
                    _this.processPages();
                }
            };
            var finalMainGraphPath_1 = this.configuration.mainData.output;
            if (finalMainGraphPath_1.lastIndexOf('/') === -1) {
                finalMainGraphPath_1 += '/';
            }
            finalMainGraphPath_1 += 'graph';
            this.ngdEngine.init(path.resolve(finalMainGraphPath_1));
            this.ngdEngine.renderGraph(this.configuration.mainData.tsconfig, path.resolve(finalMainGraphPath_1), 'p').then(function () {
                _this.ngdEngine.readGraph(path.resolve(finalMainGraphPath_1 + path.sep + 'dependencies.svg'), 'Main graph').then(function (data) {
                    _this.configuration.mainData.mainGraph = data;
                    loop_1();
                }, function (err) {
                    logger.error('Error during main graph reading : ', err);
                    _this.configuration.mainData.disableMainGraph = true;
                    loop_1();
                });
            }, function (err) {
                logger.error('Ooops error during main graph generation, moving on next part with main graph disabled : ', err);
                _this.configuration.mainData.disableMainGraph = true;
                loop_1();
            });
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
            if (typeof this.files === 'undefined') {
                logger.error('No sources files available, please use -p flag');
                process.exit(1);
            }
            else {
                this.runWatch();
            }
        }
        else if (this.configuration.mainData.watch && this.isWatching) {
            var srcFolder = findMainSourceFolder(this.files);
            logger.info("Already watching sources in " + srcFolder + " folder");
        }
    };
    Application.prototype.runWatch = function () {
        var _this = this;
        var sources = [findMainSourceFolder(this.files)];
        var watcherReady = false;
        this.isWatching = true;
        logger.info("Watching sources in " + findMainSourceFolder(this.files) + " folder");
        if ($markdownengine.hasRootMarkdowns()) {
            sources = sources.concat($markdownengine.listRootMarkdowns());
        }
        if (this.configuration.mainData.includes !== '') {
            sources = sources.concat(this.configuration.mainData.includes);
        }
        // Check all elements of sources list exist
        sources = cleanSourcesForWatch(sources);
        var watcher = chokidar.watch(sources, {
            awaitWriteFinish: true,
            ignoreInitial: true,
            ignored: /(spec|\.d)\.ts/
        });
        var timerAddAndRemoveRef;
        var timerChangeRef;
        var waiterAddAndRemove = function () {
            clearTimeout(timerAddAndRemoveRef);
            timerAddAndRemoveRef = setTimeout(runnerAddAndRemove, 1000);
        };
        var runnerAddAndRemove = function () {
            startTime = new Date();
            _this.generate();
        };
        var waiterChange = function () {
            clearTimeout(timerChangeRef);
            timerChangeRef = setTimeout(runnerChange, 1000);
        };
        var runnerChange = function () {
            startTime = new Date();
            _this.setUpdatedFiles(_this.watchChangedFiles);
            if (_this.hasWatchedFilesTSFiles()) {
                _this.getMicroDependenciesData();
            }
            else if (_this.hasWatchedFilesRootMarkdownFiles()) {
                _this.rebuildRootMarkdowns();
            }
            else {
                _this.rebuildExternalDocumentation();
            }
        };
        watcher
            .on('ready', function () {
            if (!watcherReady) {
                watcherReady = true;
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
                    if (path.extname(file) === '.ts' || path.extname(file) === '.md' || path.extname(file) === '.json') {
                        _this.watchChangedFiles.push(path.join(process.cwd() + path.sep + file));
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
            }
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

var glob = require('glob');
var ExcludeParser = (function () {
    var _exclude, _cwd, _globFiles = [];
    var _init = function (exclude, cwd) {
        _exclude = exclude;
        _cwd = cwd;
        var i = 0, len = exclude.length;
        for (i; i < len; i++) {
            _globFiles = _globFiles.concat(glob.sync(exclude[i], { cwd: _cwd }));
        }
    }, _testFile = function (file) {
        var i = 0, len = _exclude.length, fileBasename = path.basename(file), result = false;
        for (i; i < len; i++) {
            if (glob.hasMagic(_exclude[i]) && _globFiles.length > 0) {
                var resultGlobSearch = _globFiles.findIndex(function (element) {
                    return path.basename(element) === fileBasename;
                });
                result = resultGlobSearch !== -1;
            }
            else {
                result = fileBasename === path.basename(_exclude[i]);
            }
            if (result) {
                break;
            }
        }
        return result;
    };
    return {
        init: _init,
        testFile: _testFile
    };
})();

var pkg = require('../package.json');
var program = require('commander');
var os = require('os');
var osName = require('os-name');
var files = [];
var cwd = process.cwd();
process.setMaxListeners(0);
process.on('unhandledRejection', function (err, p) {
    console.log('Unhandled Rejection at:', p, 'reason:', err);
    logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');
    process.exit(1);
});
process.on('uncaughtException', function (err) {
    logger.error(err);
    logger.error('Sorry, but there was a problem during parsing or generation of the documentation. Please fill an issue on github. (https://github.com/compodoc/compodoc/issues/new)');
    process.exit(1);
});
var CliApplication = /** @class */ (function (_super) {
    __extends(CliApplication, _super);
    function CliApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Run compodoc from the command line.
     */
    CliApplication.prototype.generate = function () {
        var _this = this;
        function list(val) {
            return val.split(',');
        }
        program
            .version(pkg.version)
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
            .option('--toggleMenuItems <items>', 'Close by default items in the menu (default [\'all\']) values : [\'all\'] or one of these [\'modules\',\'components\',\'directives\',\'classes\',\'injectables\',\'interfaces\',\'pipes\',\'additionalPages\']', list, COMPODOC_DEFAULTS.toggleMenuItems)
            .option('--includes [path]', 'Path of external markdown files to include')
            .option('--includesName [name]', 'Name of item menu of externals markdown files (default "Additional documentation")', COMPODOC_DEFAULTS.additionalEntryName)
            .option('--coverageTest [threshold]', 'Test command of documentation coverage with a threshold (default 70)')
            .option('--coverageMinimumPerFile [minimum]', 'Test command of documentation coverage per file with a minimum (default 0)')
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
        if (program.coverageMinimumPerFile) {
            this.configuration.mainData.coverageTestPerFile = true;
            this.configuration.mainData.coverageMinimumPerFile = (typeof program.coverageMinimumPerFile === 'string') ? parseInt(program.coverageMinimumPerFile) : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
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
            console.log(fs.readFileSync(path.join(__dirname, '../src/banner')).toString());
            console.log(pkg.version);
            console.log('');
            console.log("Node.js version : " + process.version);
            console.log('');
            console.log("Operating system : " + osName(os.platform(), os.release()));
            console.log('');
        }
        if (program.serve && !program.tsconfig && program.output) {
            // if -s & -d, serve it
            if (!this.fileEngine.existsSync(program.output)) {
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
            if (!this.fileEngine.existsSync(program.output)) {
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
            if (program.tsconfig && program.args.length === 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!this.fileEngine.existsSync(program.tsconfig)) {
                    logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);
                    var tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd);
                    }
                    if (!files) {
                        var exclude = tsConfigFile.exclude || [], files_1 = [];
                        ExcludeParser.init(exclude, cwd);
                        var finder = require('findit')(cwd || '.');
                        finder.on('directory', function (dir, stat, stop) {
                            var base = path.basename(dir);
                            if (base === '.git' || base === 'node_modules')
                                stop();
                        });
                        finder.on('file', function (file, stat) {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            }
                            else if (ExcludeParser.testFile(file)) {
                                logger.warn('Excluding', file);
                            }
                            else if (path.extname(file) === '.ts') {
                                logger.debug('Including', file);
                                files_1.push(file);
                            }
                        });
                        finder.on('end', function () {
                            _super.prototype.setFiles.call(_this, files_1);
                            _super.prototype.generate.call(_this);
                        });
                    }
                    else {
                        _super.prototype.setFiles.call(this, files);
                        _super.prototype.generate.call(this);
                    }
                }
            }
            else if (program.tsconfig && program.args.length > 0 && program.coverageTest) {
                logger.info('Run documentation coverage test');
                this.configuration.mainData.tsconfig = program.tsconfig;
                if (!this.fileEngine.existsSync(program.tsconfig)) {
                    logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                    process.exit(1);
                }
                else {
                    var _file = path.join(path.join(process.cwd(), path.dirname(this.configuration.mainData.tsconfig)), path.basename(this.configuration.mainData.tsconfig));
                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info('Using tsconfig', _file);
                    var tsConfigFile = readConfig(_file);
                    files = tsConfigFile.files;
                    if (files) {
                        files = handlePath(files, cwd);
                    }
                    if (!files) {
                        var exclude = tsConfigFile.exclude || [];
                        ExcludeParser.init(exclude, cwd);
                        var finder = require('findit')(cwd || '.');
                        finder.on('directory', function (dir, stat, stop) {
                            var base = path.basename(dir);
                            if (base === '.git' || base === 'node_modules')
                                stop();
                        });
                        finder.on('file', function (file, stat) {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            }
                            else if (ExcludeParser.testFile(file)) {
                                logger.warn('Excluding', file);
                            }
                            else if (path.extname(file) === '.ts') {
                                logger.debug('Including', file);
                                files.push(file);
                            }
                        });
                        finder.on('end', function () {
                            _super.prototype.setFiles.call(_this, files);
                            _super.prototype.testCoverage.call(_this);
                        });
                    }
                    _super.prototype.setFiles.call(this, files);
                    _super.prototype.testCoverage.call(this);
                }
            }
            else if (program.tsconfig && program.args.length > 0) {
                this.configuration.mainData.tsconfig = program.tsconfig;
                var sourceFolder = program.args[0];
                if (!this.fileEngine.existsSync(sourceFolder)) {
                    logger.error("Provided source folder " + sourceFolder + " was not found in the current directory");
                    process.exit(1);
                }
                else {
                    logger.info('Using provided source folder');
                    if (!this.fileEngine.existsSync(program.tsconfig)) {
                        logger.error("\"" + program.tsconfig + "\" file was not found in the current directory");
                        process.exit(1);
                    }
                    else {
                        var tsConfigFile = readConfig(program.tsconfig);
                        var exclude = tsConfigFile.exclude || [];
                        ExcludeParser.init(exclude, cwd);
                        var finder = require('findit')(path.resolve(sourceFolder));
                        finder.on('directory', function (dir, stat, stop) {
                            var base = path.basename(dir);
                            if (base === '.git' || base === 'node_modules')
                                stop();
                        });
                        finder.on('file', function (file, stat) {
                            if (/(spec|\.d)\.ts/.test(file)) {
                                logger.warn('Ignoring', file);
                            }
                            else if (ExcludeParser.testFile(file)) {
                                logger.warn('Excluding', file);
                            }
                            else if (path.extname(file) === '.ts') {
                                logger.debug('Including', file);
                                files.push(file);
                            }
                        });
                        finder.on('end', function () {
                            _super.prototype.setFiles.call(_this, files);
                            _super.prototype.generate.call(_this);
                        });
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

exports.CliApplication = CliApplication;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtY2xpLmpzIiwic291cmNlcyI6WyIuLi9zcmMvbG9nZ2VyLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwtZW5naW5lLWhlbHBlcnMvY29tcGFyZS5oZWxwZXIudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC1lbmdpbmUtaGVscGVycy9vci5oZWxwZXIudHMiLCIuLi9zcmMvdXRpbHMvYW5ndWxhci1hcGkudXRpbC50cyIsIi4uL3NyYy91dGlscy9hbmd1bGFyLXZlcnNpb24udXRpbC50cyIsIi4uL3NyYy91dGlscy9iYXNpYy10eXBlLnV0aWwudHMiLCIuLi9zcmMvdXRpbHMvanNkb2MtcGFyc2VyLnV0aWwudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC1lbmdpbmUtaGVscGVycy9mdW5jdGlvbi1zaWduYXR1cmUuaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwtZW5naW5lLWhlbHBlcnMvaXMtbm90LXRvZ2dsZS5oZWxwZXIudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC1lbmdpbmUtaGVscGVycy9pZi1zdHJpbmcuaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwtZW5naW5lLWhlbHBlcnMvb3ItbGVuZ3RoLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL2ZpbHRlci1hbmd1bGFyMi1tb2R1bGVzLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL2RlYnVnLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL2JyZWFrLWxpbmVzLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL2NsZWFuLXBhcmFncmFwaC5oZWxwZXIudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC1lbmdpbmUtaGVscGVycy9lc2NhcGUtc2ltcGxlLXF1b3RlLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL2JyZWFrLWNvbW1hLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL21vZGlmLWtpbmQtaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwtZW5naW5lLWhlbHBlcnMvbW9kaWYtaWNvbi5oZWxwZXIudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC1lbmdpbmUtaGVscGVycy9yZWxhdGl2ZS11cmwuaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwtZW5naW5lLWhlbHBlcnMvanNkb2MtcmV0dXJucy1jb21tZW50LmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL2pzZG9jLWNvZGUtZXhhbXBsZS5oZWxwZXIudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC1lbmdpbmUtaGVscGVycy9qc2RvYy1leGFtcGxlLmhlbHBlci50cyIsIi4uL3NyYy91dGlscy9raW5kLXRvLXR5cGUudHMiLCIuLi9zcmMvYXBwL2VuZ2luZXMvaHRtbC1lbmdpbmUtaGVscGVycy9qc2RvYy1wYXJhbXMuaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwtZW5naW5lLWhlbHBlcnMvanNkb2MtcGFyYW1zLXZhbGlkLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL2pzZG9jLWRlZmF1bHQuaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwtZW5naW5lLWhlbHBlcnMvbGluay10eXBlLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL2luZGV4YWJsZS1zaWduYXR1cmUuaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwtZW5naW5lLWhlbHBlcnMvb2JqZWN0LmhlbHBlci50cyIsIi4uL3NyYy91dGlscy9saW5rLXBhcnNlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLWVuZ2luZS1oZWxwZXJzL3BhcnNlLWRlc2NyaXB0aW9uLmhlbHBlci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9odG1sLmVuZ2luZS5oZWxwZXJzLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2ZpbGUuZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL2h0bWwuZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL21hcmtkb3duLmVuZ2luZS50cyIsIi4uL3NyYy91dGlscy9kZWZhdWx0cy50cyIsIi4uL3NyYy9hcHAvY29uZmlndXJhdGlvbi50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9uZ2QuZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9lbmdpbmVzL3NlYXJjaC5lbmdpbmUudHMiLCIuLi9zcmMvdXRpbHMvYW5ndWxhci1saWZlY3ljbGVzLWhvb2tzLnRzIiwiLi4vc3JjL3V0aWxzL3V0aWxzLnRzIiwiLi4vc3JjL3V0aWxpdGllcy50cyIsIi4uL3NyYy91dGlscy9yb3V0ZXIucGFyc2VyLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9jb2RlLWdlbmVyYXRvci50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9jb21wb25lbnRzLXRyZWUuZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9kZXBzL2RpcmVjdGl2ZS1kZXAuZmFjdG9yeS50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvZGVwcy9oZWxwZXJzL3N5bWJvbC1oZWxwZXIudHMiLCIuLi9zcmMvYXBwL2NvbXBpbGVyL2RlcHMvaGVscGVycy9jb21wb25lbnQtaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9kZXBzL21vZHVsZS1kZXAuZmFjdG9yeS50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvZGVwcy9jb21wb25lbnQtZGVwLmZhY3RvcnkudHMiLCIuLi9zcmMvYXBwL2NvbXBpbGVyL2RlcHMvaGVscGVycy9tb2R1bGUtaGVscGVyLnRzIiwiLi4vc3JjL2FwcC9jb21waWxlci9kZXBzL2hlbHBlcnMvanMtZG9jLWhlbHBlci50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvZGVwcy9oZWxwZXJzL2NsYXNzLWhlbHBlci50cyIsIi4uL3NyYy9hcHAvY29tcGlsZXIvZGVwZW5kZW5jaWVzLnRzIiwiLi4vc3JjL3V0aWxzL3Byb21pc2Utc2VxdWVudGlhbC50cyIsIi4uL3NyYy9hcHAvZW5naW5lcy9kZXBlbmRlbmNpZXMuZW5naW5lLnRzIiwiLi4vc3JjL2FwcC9hcHBsaWNhdGlvbi50cyIsIi4uL3NyYy91dGlscy9leGNsdWRlLnBhcnNlci50cyIsIi4uL3NyYy9pbmRleC1jbGkudHMiXSwic291cmNlc0NvbnRlbnQiOlsibGV0IGd1dGlsID0gcmVxdWlyZSgnZ3VscC11dGlsJyk7XHJcbmxldCBjID0gZ3V0aWwuY29sb3JzO1xyXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XHJcblxyXG5lbnVtIExFVkVMIHtcclxuXHRJTkZPLFxyXG5cdERFQlVHLFxyXG5cdEVSUk9SLFxyXG5cdFdBUk5cclxufVxyXG5cclxuY2xhc3MgTG9nZ2VyIHtcclxuXHJcblx0cHVibGljIG5hbWU7XHJcblx0cHVibGljIGxvZ2dlcjtcclxuXHRwdWJsaWMgdmVyc2lvbjtcclxuXHRwdWJsaWMgc2lsZW50O1xyXG5cclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMubmFtZSA9IHBrZy5uYW1lO1xyXG5cdFx0dGhpcy52ZXJzaW9uID0gcGtnLnZlcnNpb247XHJcblx0XHR0aGlzLmxvZ2dlciA9IGd1dGlsLmxvZztcclxuXHRcdHRoaXMuc2lsZW50ID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBpbmZvKC4uLmFyZ3MpIHtcclxuXHRcdGlmICghdGhpcy5zaWxlbnQpIHsgcmV0dXJuOyB9XHJcblx0XHR0aGlzLmxvZ2dlcihcclxuXHRcdFx0dGhpcy5mb3JtYXQoTEVWRUwuSU5GTywgLi4uYXJncylcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZXJyb3IoLi4uYXJncykge1xyXG5cdFx0aWYgKCF0aGlzLnNpbGVudCkgeyByZXR1cm47IH1cclxuXHRcdHRoaXMubG9nZ2VyKFxyXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5FUlJPUiwgLi4uYXJncylcclxuICAgICAgICApO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHdhcm4oLi4uYXJncykge1xyXG5cdFx0aWYgKCF0aGlzLnNpbGVudCkgeyByZXR1cm47IH1cclxuXHRcdHRoaXMubG9nZ2VyKFxyXG5cdFx0XHR0aGlzLmZvcm1hdChMRVZFTC5XQVJOLCAuLi5hcmdzKVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkZWJ1ZyguLi5hcmdzKSB7XHJcblx0XHRpZiAoIXRoaXMuc2lsZW50KSB7IHJldHVybjsgfVxyXG5cdFx0dGhpcy5sb2dnZXIoXHJcblx0XHRcdHRoaXMuZm9ybWF0KExFVkVMLkRFQlVHLCAuLi5hcmdzKVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgZm9ybWF0KGxldmVsLCAuLi5hcmdzKSB7XHJcblxyXG5cdFx0bGV0IHBhZCA9IChzLCBsLCB6ID0gJycpID0+IHtcclxuXHRcdFx0cmV0dXJuIHMgKyBBcnJheShNYXRoLm1heCgwLCBsIC0gcy5sZW5ndGggKyAxKSkuam9pbih6KTtcclxuXHRcdH07XHJcblxyXG5cdFx0bGV0IG1zZyA9IGFyZ3Muam9pbignICcpO1xyXG5cdFx0aWYgKGFyZ3MubGVuZ3RoID4gMSkge1xyXG5cdFx0XHRtc2cgPSBgJHtwYWQoYXJncy5zaGlmdCgpLCAxNSwgJyAnKX06ICR7YXJncy5qb2luKCcgJyl9YDtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0c3dpdGNoIChsZXZlbCkge1xyXG5cdFx0XHRjYXNlIExFVkVMLklORk86XHJcblx0XHRcdFx0bXNnID0gYy5ncmVlbihtc2cpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0Y2FzZSBMRVZFTC5ERUJVRzpcclxuXHRcdFx0XHRtc2cgPSBjLmN5YW4obXNnKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdGNhc2UgTEVWRUwuV0FSTjpcclxuXHRcdFx0XHRtc2cgPSBjLnllbGxvdyhtc2cpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0Y2FzZSBMRVZFTC5FUlJPUjpcclxuXHRcdFx0XHRtc2cgPSBjLnJlZChtc2cpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBbXHJcblx0XHRcdG1zZ1xyXG5cdFx0XS5qb2luKCcnKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBsZXQgbG9nZ2VyID0gbmV3IExvZ2dlcigpO1xyXG4iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciwgSUhhbmRsZWJhcnNPcHRpb25zIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXIuaW50ZXJmYWNlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDb21wYXJlSGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCBhOiBhbnksIG9wZXJhdG9yOiBzdHJpbmcsIGI6IGFueSwgb3B0aW9uczogSUhhbmRsZWJhcnNPcHRpb25zKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdoYW5kbGViYXJzIEhlbHBlciB7e2NvbXBhcmV9fSBleHBlY3RzIDQgYXJndW1lbnRzJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmVzdWx0O1xyXG4gICAgICAgIHN3aXRjaCAob3BlcmF0b3IpIHtcclxuICAgICAgICAgICAgY2FzZSAnaW5kZXhvZic6XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSAoYi5pbmRleE9mKGEpICE9PSAtMSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnPT09JzpcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGEgPT09IGI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnIT09JzpcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGEgIT09IGI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnPic6XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhID4gYjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hlbHBlciB7e2NvbXBhcmV9fTogaW52YWxpZCBvcGVyYXRvcjogYCcgKyBvcGVyYXRvciArICdgJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UoY29udGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgSUh0bWxFbmdpbmVIZWxwZXIsIElIYW5kbGViYXJzT3B0aW9ucyB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgT3JIZWxwZXIgaW1wbGVtZW50cyBJSHRtbEVuZ2luZUhlbHBlciB7XHJcbiAgICBwdWJsaWMgaGVscGVyRnVuYyhjb250ZXh0OiBhbnksIC8qIGFueSwgYW55LCAuLi4sIG9wdGlvbnMgKi8pIHtcclxuICAgICAgICBsZXQgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgbGV0IG9wdGlvbnM6IElIYW5kbGViYXJzT3B0aW9ucyA9IGFyZ3VtZW50c1tsZW5dO1xyXG5cclxuICAgICAgICAvLyBXZSBzdGFydCBhdCAxIGJlY2F1c2Ugb2Ygb3B0aW9uc1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UoY29udGV4dCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XHJcbmltcG9ydCB7IElBcGlTb3VyY2VSZXN1bHQgfSBmcm9tICcuL2FwaS1zb3VyY2UtcmVzdWx0LmludGVyZmFjZSc7XHJcblxyXG5jb25zdCBBbmd1bGFyQVBJczogQXJyYXk8SUFuZ3VsYXJBcGk+ID0gcmVxdWlyZSgnLi4vc3JjL2RhdGEvYXBpLWxpc3QuanNvbicpO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJBcGlVdGlsIHtcclxuICAgIHB1YmxpYyBmaW5kQXBpKHR5cGU6IHN0cmluZyk6IElBcGlTb3VyY2VSZXN1bHQ8SUFuZ3VsYXJBcGk+IHtcclxuICAgICAgICByZXR1cm4gIHtcclxuICAgICAgICAgICAgc291cmNlOiAnZXh0ZXJuYWwnLFxyXG4gICAgICAgICAgICBkYXRhOiBfLmZpbmQoQW5ndWxhckFQSXMsIHggPT4geC50aXRsZSA9PT0gdHlwZSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQW5ndWxhckFwaSB7XHJcbiAgICB0aXRsZTogc3RyaW5nO1xyXG4gICAgcGF0aDogc3RyaW5nO1xyXG4gICAgZG9jVHlwZTogc3RyaW5nO1xyXG4gICAgc3RhYmlsaXR5OiBzdHJpbmc7XHJcbiAgICBzZWN1cmU6IHN0cmluZztcclxuICAgIGJhcnJlbDogc3RyaW5nO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xyXG5pbXBvcnQgeyBJQW5ndWxhckFwaSB9IGZyb20gJy4vYW5ndWxhci1hcGkudXRpbCc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJWZXJzaW9uVXRpbCB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDb3JlUGFja2FnZSA9ICdAYW5ndWxhci9jb3JlJztcclxuXHJcbiAgICBwdWJsaWMgY2xlYW5WZXJzaW9uKHZlcnNpb246IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHZlcnNpb24ucmVwbGFjZSgnficsICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgnXicsICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgnPScsICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgnPCcsICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgnPicsICcnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QW5ndWxhclZlcnNpb25PZlByb2plY3QocGFja2FnZURhdGEpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBfcmVzdWx0ID0gJyc7XHJcblxyXG4gICAgICAgIGlmIChwYWNrYWdlRGF0YS5kZXBlbmRlbmNpZXMpIHtcclxuICAgICAgICAgICAgbGV0IGFuZ3VsYXJDb3JlID0gcGFja2FnZURhdGEuZGVwZW5kZW5jaWVzW0FuZ3VsYXJWZXJzaW9uVXRpbC5Db3JlUGFja2FnZV07XHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyQ29yZSkge1xyXG4gICAgICAgICAgICAgICAgX3Jlc3VsdCA9IHRoaXMuY2xlYW5WZXJzaW9uKGFuZ3VsYXJDb3JlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIF9yZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpc0FuZ3VsYXJWZXJzaW9uQXJjaGl2ZWQodmVyc2lvbjogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHJlc3VsdDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gc2VtdmVyLmNvbXBhcmUodmVyc2lvbiwgJzIuNC4xMCcpIDw9IDA7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByZWZpeE9mZmljaWFsRG9jKHZlcnNpb246IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNBbmd1bGFyVmVyc2lvbkFyY2hpdmVkKHZlcnNpb24pID8gJ3YyLicgOiAnJztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QXBpTGluayhhcGk6IElBbmd1bGFyQXBpLCBhbmd1bGFyVmVyc2lvbjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgYW5ndWxhckRvY1ByZWZpeCA9IHRoaXMucHJlZml4T2ZmaWNpYWxEb2MoYW5ndWxhclZlcnNpb24pO1xyXG4gICAgICAgIHJldHVybiBgaHR0cHM6Ly8ke2FuZ3VsYXJEb2NQcmVmaXh9YW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9hcGkvJHthcGkucGF0aH1gO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJleHBvcnQgY2xhc3MgQmFzaWNUeXBlVXRpbCB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgYSBnaXZlbiB0eXBlcyBpcyBhIGJhc2ljIGphdmFzY3JpcHQgdHlwZVxyXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHNcclxuICAgICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIHRvIGNoZWNrXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc0phdmFzY3JpcHRUeXBlKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0eXBlLnRvTG93ZXJDYXNlKCkgaW4gQmFzaWNUeXBlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiBhIGdpdmVuIHR5cGUgaXMgYSB0eXBlc2NyaXB0IHR5cGUgKFRoYXQgaXMgbm90IGEgamF2YXNjcmlwdCB0eXBlKVxyXG4gICAgICogaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svYmFzaWMtdHlwZXMuaHRtbFxyXG4gICAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgdG8gY2hlY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzVHlwZVNjcmlwdFR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICByZXR1cm4gKHR5cGUudG9Mb3dlckNhc2UoKSBpbiBCYXNpY1R5cGVTY3JpcHRUeXBlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHRoZSB0eXBlIGlzIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IHR5cGVcclxuICAgICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIHRvIGNoZWNrXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc0tub3duVHlwZSh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pc0phdmFzY3JpcHRUeXBlKHR5cGUpIHx8IHRoaXMuaXNUeXBlU2NyaXB0VHlwZSh0eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBvZmZpY2lhbCBkb2N1bWVudGF0aW9uIGxpbmsgdG8gZWl0aGVyIHRoZSBqYXZhc2NyaXB0IG9yIHR5cGVzY3JpcHQgdHlwZVxyXG4gICAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgdG8gY2hlY2tcclxuICAgICAqIEByZXR1cm5zIFRoZSBkb2N1bWVudGF0aW9uIGxpbmsgb3IgdW5kZWZpbmVkIGlmIHR5cGUgbm90IGZvdW5kXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRUeXBlVXJsKHR5cGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNKYXZhc2NyaXB0VHlwZSh0eXBlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzLyR7dHlwZX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNUeXBlU2NyaXB0VHlwZSh0eXBlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL2Jhc2ljLXR5cGVzLmh0bWxgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxufVxyXG5cclxuZW51bSBCYXNpY1R5cGVzIHtcclxuICAgIG51bWJlcixcclxuICAgIGJvb2xlYW4sXHJcbiAgICBzdHJpbmcsXHJcbiAgICBvYmplY3QsXHJcbiAgICBkYXRlLFxyXG4gICAgZnVuY3Rpb25cclxufVxyXG5cclxuZW51bSBCYXNpY1R5cGVTY3JpcHRUeXBlcyB7XHJcbiAgICBhbnksXHJcbiAgICB2b2lkXHJcbn1cclxuIiwiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7IEpTRG9jUGFyYW1ldGVyVGFnIH0gZnJvbSAndHlwZXNjcmlwdCc7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgSnNkb2NQYXJzZXJVdGlsIHtcclxuICAgIHB1YmxpYyBpc1ZhcmlhYmxlTGlrZShub2RlOiB0cy5Ob2RlKTogbm9kZSBpcyB0cy5WYXJpYWJsZUxpa2VEZWNsYXJhdGlvbiB7XHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CaW5kaW5nRWxlbWVudDpcclxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbnVtTWVtYmVyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBhcmFtZXRlcjpcclxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbjpcclxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eVNpZ25hdHVyZTpcclxuICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TaG9ydGhhbmRQcm9wZXJ0eUFzc2lnbm1lbnQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRKU0RvY1RhZ3Mobm9kZTogdHMuTm9kZSwga2luZDogdHMuU3ludGF4S2luZCk6IHRzLkpTRG9jVGFnW10ge1xyXG4gICAgICAgIGNvbnN0IGRvY3MgPSB0aGlzLmdldEpTRG9jcyhub2RlKTtcclxuICAgICAgICBpZiAoZG9jcykge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IHRzLkpTRG9jVGFnW10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRzLmlzSlNEb2NQYXJhbWV0ZXJUYWcoZG9jKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2Mua2luZCA9PT0ga2luZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChkb2MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHMuaXNKU0RvYyhkb2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goLi4uXy5maWx0ZXIoZG9jLnRhZ3MsIHRhZyA9PiB0YWcua2luZCA9PT0ga2luZCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgdHlwZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRKU0RvY3Mobm9kZTogdHMuTm9kZSk6IFJlYWRvbmx5QXJyYXk8dHMuSlNEb2MgfCB0cy5KU0RvY1RhZz4ge1xyXG4gICAgICAgIC8vIFRPRE86IGpzRG9jQ2FjaGUgaXMgaW50ZXJuYWwsIHNlZSBpZiB0aGVyZSdzIGEgd2F5IGFyb3VuZCBpdFxyXG4gICAgICAgIGxldCBjYWNoZTogUmVhZG9ubHlBcnJheTx0cy5KU0RvYyB8IHRzLkpTRG9jVGFnPiA9IChub2RlIGFzIGFueSkuanNEb2NDYWNoZTtcclxuICAgICAgICBpZiAoIWNhY2hlKSB7XHJcbiAgICAgICAgICAgIGNhY2hlID0gdGhpcy5nZXRKU0RvY3NXb3JrZXIobm9kZSwgW10pLmZpbHRlcih4ID0+IHgpO1xyXG4gICAgICAgICAgICAobm9kZSBhcyBhbnkpLmpzRG9jQ2FjaGUgPSBjYWNoZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNhY2hlO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBUcnkgdG8gcmVjb2duaXplIHRoaXMgcGF0dGVybiB3aGVuIG5vZGUgaXMgaW5pdGlhbGl6ZXJcclxuICAgIC8vIG9mIHZhcmlhYmxlIGRlY2xhcmF0aW9uIGFuZCBKU0RvYyBjb21tZW50cyBhcmUgb24gY29udGFpbmluZyB2YXJpYWJsZSBzdGF0ZW1lbnQuXHJcbiAgICAvLyAvKipcclxuICAgIC8vICAgKiBAcGFyYW0ge251bWJlcn0gbmFtZVxyXG4gICAgLy8gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAvLyAgICovXHJcbiAgICAvLyB2YXIgeCA9IGZ1bmN0aW9uKG5hbWUpIHsgcmV0dXJuIG5hbWUubGVuZ3RoOyB9XHJcbiAgICBwcml2YXRlIGdldEpTRG9jc1dvcmtlcihub2RlOiB0cy5Ob2RlLCBjYWNoZSk6IFJlYWRvbmx5QXJyYXk8YW55PiB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XHJcbiAgICAgICAgY29uc3QgaXNJbml0aWFsaXplck9mVmFyaWFibGVEZWNsYXJhdGlvbkluU3RhdGVtZW50ID1cclxuICAgICAgICAgICAgdGhpcy5pc1ZhcmlhYmxlTGlrZShwYXJlbnQpICYmXHJcbiAgICAgICAgICAgIHBhcmVudC5pbml0aWFsaXplciA9PT0gbm9kZSAmJlxyXG4gICAgICAgICAgICB0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KHBhcmVudC5wYXJlbnQucGFyZW50KTtcclxuICAgICAgICBjb25zdCBpc1ZhcmlhYmxlT2ZWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50ID0gdGhpcy5pc1ZhcmlhYmxlTGlrZShub2RlKSAmJlxyXG4gICAgICAgICAgICB0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KHBhcmVudC5wYXJlbnQpO1xyXG4gICAgICAgIGNvbnN0IHZhcmlhYmxlU3RhdGVtZW50Tm9kZSA9XHJcbiAgICAgICAgICAgIGlzSW5pdGlhbGl6ZXJPZlZhcmlhYmxlRGVjbGFyYXRpb25JblN0YXRlbWVudCA/IHBhcmVudC5wYXJlbnQucGFyZW50IDpcclxuICAgICAgICAgICAgICAgIGlzVmFyaWFibGVPZlZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQgPyBwYXJlbnQucGFyZW50IDpcclxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKHZhcmlhYmxlU3RhdGVtZW50Tm9kZSkge1xyXG4gICAgICAgICAgICBjYWNoZSA9IHRoaXMuZ2V0SlNEb2NzV29ya2VyKHZhcmlhYmxlU3RhdGVtZW50Tm9kZSwgY2FjaGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWxzbyByZWNvZ25pemUgd2hlbiB0aGUgbm9kZSBpcyB0aGUgUkhTIG9mIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvblxyXG4gICAgICAgIGNvbnN0IGlzU291cmNlT2ZBc3NpZ25tZW50RXhwcmVzc2lvblN0YXRlbWVudCA9XHJcbiAgICAgICAgICAgIHBhcmVudCAmJiBwYXJlbnQucGFyZW50ICYmXHJcbiAgICAgICAgICAgIHBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb24gJiZcclxuICAgICAgICAgICAgKHBhcmVudCBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5vcGVyYXRvclRva2VuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXF1YWxzVG9rZW4gJiZcclxuICAgICAgICAgICAgcGFyZW50LnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQ7XHJcbiAgICAgICAgaWYgKGlzU291cmNlT2ZBc3NpZ25tZW50RXhwcmVzc2lvblN0YXRlbWVudCkge1xyXG4gICAgICAgICAgICBjYWNoZSA9IHRoaXMuZ2V0SlNEb2NzV29ya2VyKHBhcmVudC5wYXJlbnQsIGNhY2hlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlzTW9kdWxlRGVjbGFyYXRpb24gPSBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTW9kdWxlRGVjbGFyYXRpb24gJiZcclxuICAgICAgICAgICAgcGFyZW50ICYmIHBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLk1vZHVsZURlY2xhcmF0aW9uO1xyXG4gICAgICAgIGNvbnN0IGlzUHJvcGVydHlBc3NpZ25tZW50RXhwcmVzc2lvbiA9IHBhcmVudCAmJiBwYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQ7XHJcbiAgICAgICAgaWYgKGlzTW9kdWxlRGVjbGFyYXRpb24gfHwgaXNQcm9wZXJ0eUFzc2lnbm1lbnRFeHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgIGNhY2hlID0gdGhpcy5nZXRKU0RvY3NXb3JrZXIocGFyZW50LCBjYWNoZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQdWxsIHBhcmFtZXRlciBjb21tZW50cyBmcm9tIGRlY2xhcmluZyBmdW5jdGlvbiBhcyB3ZWxsXHJcbiAgICAgICAgaWYgKHRzLmlzUGFyYW1ldGVyKG5vZGUpKSB7XHJcbiAgICAgICAgICAgIGNhY2hlID0gXy5jb25jYXQoY2FjaGUsIHRoaXMuZ2V0SlNEb2NQYXJhbWV0ZXJUYWdzKG5vZGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzVmFyaWFibGVMaWtlKG5vZGUpICYmIG5vZGUuaW5pdGlhbGl6ZXIpIHtcclxuICAgICAgICAgICAgY2FjaGUgPSBfLmNvbmNhdChjYWNoZSwgbm9kZS5pbml0aWFsaXplci5qc0RvYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYWNoZSA9IF8uY29uY2F0KGNhY2hlLCBub2RlLmpzRG9jKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhY2hlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0SlNEb2NQYXJhbWV0ZXJUYWdzKHBhcmFtOiB0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbik6IFJlYWRvbmx5QXJyYXk8dHMuSlNEb2NQYXJhbWV0ZXJUYWc+IHtcclxuICAgICAgICBjb25zdCBmdW5jID0gcGFyYW0ucGFyZW50IGFzIHRzLkZ1bmN0aW9uTGlrZURlY2xhcmF0aW9uO1xyXG4gICAgICAgIGNvbnN0IHRhZ3MgPSB0aGlzLmdldEpTRG9jVGFncyhmdW5jLCB0cy5TeW50YXhLaW5kLkpTRG9jUGFyYW1ldGVyVGFnKSBhcyB0cy5KU0RvY1BhcmFtZXRlclRhZ1tdO1xyXG5cclxuICAgICAgICBpZiAoIXBhcmFtLm5hbWUpIHtcclxuICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBhbm9ueW1vdXMganNkb2MgcGFyYW0gZnJvbSBhIGBmdW5jdGlvbih0eXBlMSwgdHlwZTIpOiB0eXBlM2Agc3BlY2lmaWNhdGlvblxyXG4gICAgICAgICAgICBjb25zdCBpID0gZnVuYy5wYXJhbWV0ZXJzLmluZGV4T2YocGFyYW0pO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJhbVRhZ3MgPSBfLmZpbHRlcih0YWdzLCB0YWcgPT4gdHMuaXNKU0RvY1BhcmFtZXRlclRhZyh0YWcpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJhbVRhZ3MgJiYgMCA8PSBpICYmIGkgPCBwYXJhbVRhZ3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3BhcmFtVGFnc1tpXV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRzLmlzSWRlbnRpZmllcihwYXJhbS5uYW1lKSkge1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcGFyYW0ubmFtZS50ZXh0O1xyXG4gICAgICAgICAgICByZXR1cm4gXy5maWx0ZXIodGFncywgdGFnID0+IHRzICYmIHRzLmlzSlNEb2NQYXJhbWV0ZXJUYWcodGFnKSAmJiB0YWcucGFyYW1ldGVyTmFtZS50ZXh0ID09PSBuYW1lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBpdCdzIGEgZGVzdHJ1Y3R1cmVkIHBhcmFtZXRlciwgc28gaXQgc2hvdWxkIGxvb2sgdXAgYW4gXCJvYmplY3QgdHlwZVwiIHNlcmllcyBvZiBtdWx0aXBsZSBsaW5lc1xyXG4gICAgICAgICAgICAvLyBCdXQgbXVsdGktbGluZSBvYmplY3QgdHlwZXMgYXJlbid0IHN1cHBvcnRlZCB5ZXQgZWl0aGVyXHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXIuaW50ZXJmYWNlJztcclxuXHJcbmltcG9ydCB7IERlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4uL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xyXG5pbXBvcnQgeyBBbmd1bGFyVmVyc2lvblV0aWwsIEJhc2ljVHlwZVV0aWwgfSBmcm9tICcuLi8uLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL2NvbmZpZ3VyYXRpb24uaW50ZXJmYWNlJztcclxuXHJcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uU2lnbmF0dXJlSGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgcHJpdmF0ZSBhbmd1bGFyVmVyc2lvblV0aWwgPSBuZXcgQW5ndWxhclZlcnNpb25VdGlsKCk7XHJcbiAgICBwcml2YXRlIGJhc2ljVHlwZVV0aWwgPSBuZXcgQmFzaWNUeXBlVXRpbCgpO1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb246IENvbmZpZ3VyYXRpb25JbnRlcmZhY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBkZXBlbmRlbmNpZXNFbmdpbmU6IERlcGVuZGVuY2llc0VuZ2luZSkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUZ1bmN0aW9uKGFyZyk6IHN0cmluZyB7XHJcblxyXG4gICAgICAgIGlmIChhcmcuZnVuY3Rpb24ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHthcmcubmFtZX0ke3RoaXMuZ2V0T3B0aW9uYWxTdHJpbmcoYXJnKX06ICgpID0+IHZvaWRgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGFyZ3VtcyA9IGFyZy5mdW5jdGlvbi5tYXAoKGFyZ3UpID0+IHtcclxuICAgICAgICAgICAgbGV0IF9yZXN1bHQgPSB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5maW5kKGFyZ3UudHlwZSk7XHJcbiAgICAgICAgICAgIGlmIChfcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5zb3VyY2UgPT09ICdpbnRlcm5hbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IF9yZXN1bHQuZGF0YS50eXBlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmVzdWx0LmRhdGEudHlwZSA9PT0gJ2NsYXNzJykgeyBwYXRoID0gJ2NsYXNzZSc7IH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJndS5uYW1lfSR7dGhpcy5nZXRPcHRpb25hbFN0cmluZyhhcmcpfTogPGEgaHJlZj1cIi4uLyR7cGF0aH1zLyR7X3Jlc3VsdC5kYXRhLm5hbWV9Lmh0bWxcIj4ke2FyZ3UudHlwZX08L2E+YDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSB0aGlzLmFuZ3VsYXJWZXJzaW9uVXRpbC5nZXRBcGlMaW5rKF9yZXN1bHQuZGF0YSwgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFuZ3VsYXJWZXJzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJndS5uYW1lfSR7dGhpcy5nZXRPcHRpb25hbFN0cmluZyhhcmcpfTogPGEgaHJlZj1cIiR7cGF0aH1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FyZ3UudHlwZX08L2E+YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJhc2ljVHlwZVV0aWwuaXNLbm93blR5cGUoYXJndS50eXBlKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGggPSB0aGlzLmJhc2ljVHlwZVV0aWwuZ2V0VHlwZVVybChhcmd1LnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZ3UubmFtZX0ke3RoaXMuZ2V0T3B0aW9uYWxTdHJpbmcoYXJnKX06IDxhIGhyZWY9XCIke3BhdGh9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHthcmd1LnR5cGV9PC9hPmA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXJndS5uYW1lICYmIGFyZ3UudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHthcmd1Lm5hbWV9JHt0aGlzLmdldE9wdGlvbmFsU3RyaW5nKGFyZyl9OiAke2FyZ3UudHlwZX1gO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJndS5uYW1lLnRleHR9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBgJHthcmcubmFtZX0ke3RoaXMuZ2V0T3B0aW9uYWxTdHJpbmcoYXJnKX06ICgke2FyZ3Vtc30pID0+IHZvaWRgO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0T3B0aW9uYWxTdHJpbmcoYXJnKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gYXJnLm9wdGlvbmFsID8gJz8nIDogJyc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCBtZXRob2QpIHtcclxuICAgICAgICBsZXQgYXJncyA9IFtdO1xyXG5cclxuICAgICAgICBpZiAobWV0aG9kLmFyZ3MpIHtcclxuICAgICAgICAgICAgYXJncyA9IG1ldGhvZC5hcmdzLm1hcCgoYXJnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgX3Jlc3VsdCA9IHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmZpbmQoYXJnLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKF9yZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5zb3VyY2UgPT09ICdpbnRlcm5hbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSBfcmVzdWx0LmRhdGEudHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9yZXN1bHQuZGF0YS50eXBlID09PSAnY2xhc3MnKSB7IHBhdGggPSAnY2xhc3NlJzsgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJnLm5hbWV9JHt0aGlzLmdldE9wdGlvbmFsU3RyaW5nKGFyZyl9OiA8YSBocmVmPVwiLi4vJHtwYXRofXMvJHtfcmVzdWx0LmRhdGEubmFtZX0uaHRtbFwiPiR7YXJnLnR5cGV9PC9hPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSB0aGlzLmFuZ3VsYXJWZXJzaW9uVXRpbC5nZXRBcGlMaW5rKF9yZXN1bHQuZGF0YSwgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFuZ3VsYXJWZXJzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfSR7dGhpcy5nZXRPcHRpb25hbFN0cmluZyhhcmcpfTogPGEgaHJlZj1cIiR7cGF0aH1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FyZy50eXBlfTwvYT5gO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJnLmRvdERvdERvdFRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAuLi4ke2FyZy5uYW1lfTogJHthcmcudHlwZX1gO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhcmcuZnVuY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVGdW5jdGlvbihhcmcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJhc2ljVHlwZVV0aWwuaXNLbm93blR5cGUoYXJnLnR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGggPSB0aGlzLmJhc2ljVHlwZVV0aWwuZ2V0VHlwZVVybChhcmcudHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2FyZy5uYW1lfSR7dGhpcy5nZXRPcHRpb25hbFN0cmluZyhhcmcpfTogPGEgaHJlZj1cIiR7cGF0aH1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2FyZy50eXBlfTwvYT5gO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7YXJnLm5hbWV9JHt0aGlzLmdldE9wdGlvbmFsU3RyaW5nKGFyZyl9OiAke2FyZy50eXBlfWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLmpvaW4oJywgJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtZXRob2QubmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kLm5hbWV9KCR7YXJnc30pYDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYCgke2FyZ3N9KWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXIuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIElzTm90VG9nZ2xlSGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjb25maWd1cmF0aW9uOiBDb25maWd1cmF0aW9uSW50ZXJmYWNlKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwgdHlwZSwgb3B0aW9ucykge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudG9nZ2xlTWVudUl0ZW1zLmluZGV4T2YodHlwZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudG9nZ2xlTWVudUl0ZW1zLmluZGV4T2YoJ2FsbCcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKGNvbnRleHQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ID09PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKGNvbnRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyLCBJSGFuZGxlYmFyc09wdGlvbnMgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIElmU3RyaW5nSGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCBhOiBhbnksIG9wdGlvbnM6IElIYW5kbGViYXJzT3B0aW9ucyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZShjb250ZXh0KTtcclxuICAgIH1cclxufSIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyLCBJSGFuZGxlYmFyc09wdGlvbnMgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE9yTGVuZ3RoSGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCAvKiBhbnksIGFueSwgLi4uLCBvcHRpb25zICovKSB7XHJcbiAgICAgICAgbGV0IGxlbiA9IGFyZ3VtZW50cy5sZW5ndGggLSAxO1xyXG4gICAgICAgIGxldCBvcHRpb25zOiBJSGFuZGxlYmFyc09wdGlvbnMgPSBhcmd1bWVudHNbbGVuXTtcclxuXHJcbiAgICAgICAgLy8gV2Ugc3RhcnQgYXQgMSBiZWNhdXNlIG9mIG9wdGlvbnNcclxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzW2ldICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UoY29udGV4dCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciwgSUhhbmRsZWJhcnNPcHRpb25zIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXIuaW50ZXJmYWNlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGaWx0ZXJBbmd1bGFyMk1vZHVsZXNIZWxwZXIgaW1wbGVtZW50cyBJSHRtbEVuZ2luZUhlbHBlciB7XHJcbiAgICBwdWJsaWMgaGVscGVyRnVuYyhjb250ZXh0OiBhbnksIHRleHQ6IHN0cmluZywgb3B0aW9uczogSUhhbmRsZWJhcnNPcHRpb25zKSB7XHJcbiAgICAgICAgY29uc3QgTkcyX01PRFVMRVM6IHN0cmluZ1tdID0gW1xyXG4gICAgICAgICAgICAnQnJvd3Nlck1vZHVsZScsXHJcbiAgICAgICAgICAgICdGb3Jtc01vZHVsZScsXHJcbiAgICAgICAgICAgICdIdHRwTW9kdWxlJyxcclxuICAgICAgICAgICAgJ1JvdXRlck1vZHVsZSdcclxuICAgICAgICBdO1xyXG4gICAgICAgIGxldCBsZW4gPSBORzJfTU9EVUxFUy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKE5HMl9NT0RVTEVTW2ldKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZShjb250ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgRGVidWdIZWxwZXIgaW1wbGVtZW50cyBJSHRtbEVuZ2luZUhlbHBlciB7XHJcbiAgICBwdWJsaWMgaGVscGVyRnVuYyhjb250ZXh0OiBhbnksIG9wdGlvbmFsVmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdDdXJyZW50IENvbnRleHQnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnPT09PT09PT09PT09PT09PT09PT0nKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjb250ZXh0KTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbmFsVmFsdWUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ09wdGlvbmFsVmFsdWUnKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJz09PT09PT09PT09PT09PT09PT09Jyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG9wdGlvbmFsVmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXIuaW50ZXJmYWNlJztcclxuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCcmVha0xpbmVzSGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBiYXJzKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwgdGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGV4dCA9IHRoaXMuYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sICc8YnI+Jyk7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvIC9nbSwgJyZuYnNwOycpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1x0L2dtLCAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jyk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2xlYW5QYXJhZ3JhcGhIZWxwZXIgaW1wbGVtZW50cyBJSHRtbEVuZ2luZUhlbHBlciB7XHJcbiAgICBwdWJsaWMgaGVscGVyRnVuYyhjb250ZXh0OiBhbnksIHRleHQ6IHN0cmluZykge1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxwPi9nbSwgJycpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxcXC9wPi9nbSwgJycpO1xyXG4gICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKHRleHQpO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgSUh0bWxFbmdpbmVIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVzY2FwZVNpbXBsZVF1b3RlSGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCB0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIXRleHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIik7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJycpO1xyXG4gICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgSUh0bWxFbmdpbmVIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgKiBhcyBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJyZWFrQ29tbWFIZWxwZXIgaW1wbGVtZW50cyBJSHRtbEVuZ2luZUhlbHBlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhcnMpIHsgfVxyXG5cclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwgdGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGV4dCA9IHRoaXMuYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uKHRleHQpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLywvZywgJyw8YnI+Jyk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XHJcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1vZGlmS2luZEhlbHBlciBpbXBsZW1lbnRzIElIdG1sRW5naW5lSGVscGVyIHtcclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwga2luZDogdHMuU3ludGF4S2luZCkge1xyXG4gICAgICAgIGxldCBfa2luZFRleHQgPSAnJztcclxuICAgICAgICBzd2l0Y2ggKGtpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkOlxyXG4gICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ1ByaXZhdGUnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm90ZWN0ZWRLZXl3b3JkOlxyXG4gICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ1Byb3RlY3RlZCc7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmQ6XHJcbiAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnUHVibGljJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZDpcclxuICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdTdGF0aWMnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgSGFuZGxlYmFycy5TYWZlU3RyaW5nKF9raW5kVGV4dCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1vZGlmSWNvbkhlbHBlciBpbXBsZW1lbnRzIElIdG1sRW5naW5lSGVscGVyIHtcclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwga2luZDogdHMuU3ludGF4S2luZCk6IHN0cmluZyB7XHJcblxyXG4gICAgICAgIGxldCBfa2luZFRleHQgPSAnJztcclxuICAgICAgICBzd2l0Y2ggKGtpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkOlxyXG4gICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ2xvY2snOyAvLyBwcml2YXRlXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3RlY3RlZEtleXdvcmQ6XHJcbiAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnbG9jayc7IC8vIHByb3RlY3RlZFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdGF0aWNLZXl3b3JkOlxyXG4gICAgICAgICAgICAgICAgX2tpbmRUZXh0ID0gJ3Jlc2V0JzsgLy8gc3RhdGljXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQ6XHJcbiAgICAgICAgICAgICAgICBfa2luZFRleHQgPSAnZXhwb3J0JzsgLy8gZXhwb3J0XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIF9raW5kVGV4dCA9ICdyZXNldCc7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF9raW5kVGV4dDtcclxuICAgIH1cclxufSIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXIuaW50ZXJmYWNlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBSZWxhdGl2ZVVSTEhlbHBlciBpbXBsZW1lbnRzIElIdG1sRW5naW5lSGVscGVyIHtcclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwgY3VycmVudERlcHRoOiBudW1iZXIsIG9wdGlvbnMpOiBzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaCAoY3VycmVudERlcHRoKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAnLi8nO1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJy4uLyc7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAnLi4vLi4vJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxufSIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyLCBJSGFuZGxlYmFyc09wdGlvbnMgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEpzZG9jUmV0dXJuc0NvbW1lbnRIZWxwZXIgaW1wbGVtZW50cyBJSHRtbEVuZ2luZUhlbHBlciB7XHJcbiAgICBwdWJsaWMgaGVscGVyRnVuYyhjb250ZXh0OiBhbnksIGpzZG9jVGFnczogQXJyYXk8YW55Piwgb3B0aW9uczogSUhhbmRsZWJhcnNPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIGxldCBsZW4gPSBqc2RvY1RhZ3MubGVuZ3RoO1xyXG4gICAgICAgIGxldCByZXN1bHQ7XHJcbiAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3JldHVybnMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufSIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyLCBJSGFuZGxlYmFyc09wdGlvbnMgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBKc2RvY1RhZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvanNkb2MtdGFnLmludGVyZmFjZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgSnNkb2NDb2RlRXhhbXBsZUhlbHBlciBpbXBsZW1lbnRzIElIdG1sRW5naW5lSGVscGVyIHtcclxuXHJcbiAgICBwcml2YXRlIGNsZWFuVGFnKGNvbW1lbnQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKGNvbW1lbnQuY2hhckF0KDApID09PSAnKicpIHtcclxuICAgICAgICAgICAgY29tbWVudCA9IGNvbW1lbnQuc3Vic3RyaW5nKDEsIGNvbW1lbnQubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbW1lbnQuY2hhckF0KDApID09PSAnICcpIHtcclxuICAgICAgICAgICAgY29tbWVudCA9IGNvbW1lbnQuc3Vic3RyaW5nKDEsIGNvbW1lbnQubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbW1lbnQuaW5kZXhPZignPHA+JykgPT09IDApIHtcclxuICAgICAgICAgICAgY29tbWVudCA9IGNvbW1lbnQuc3Vic3RyaW5nKDMsIGNvbW1lbnQubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbW1lbnQuc3Vic3RyKC0xKSA9PT0gJ1xcbicpIHtcclxuICAgICAgICAgICAgY29tbWVudCA9IGNvbW1lbnQuc3Vic3RyaW5nKDAsIGNvbW1lbnQubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb21tZW50LnN1YnN0cigtNCkgPT09ICc8L3A+Jykge1xyXG4gICAgICAgICAgICBjb21tZW50ID0gY29tbWVudC5zdWJzdHJpbmcoMCwgY29tbWVudC5sZW5ndGggLSA0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRIdG1sRW50aXRpZXMoc3RyKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGVscGVyRnVuYyhjb250ZXh0OiBhbnksIGpzZG9jVGFnczogSnNkb2NUYWdJbnRlcmZhY2VbXSwgb3B0aW9uczogSUhhbmRsZWJhcnNPcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIGxldCBsZW4gPSBqc2RvY1RhZ3MubGVuZ3RoO1xyXG4gICAgICAgIGxldCB0YWdzID0gW107XHJcbiAgICAgICAgbGV0IHR5cGUgPSAnaHRtbCc7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmhhc2gudHlwZSkge1xyXG4gICAgICAgICAgICB0eXBlID0gb3B0aW9ucy5oYXNoLnR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAnZXhhbXBsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFnID0ge30gYXMgSnNkb2NUYWdJbnRlcmZhY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5jb21tZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0uY29tbWVudC5pbmRleE9mKCc8Y2FwdGlvbj4nKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQucmVwbGFjZSgvPGNhcHRpb24+L2csICc8Yj48aT4nKS5yZXBsYWNlKC9cXC9jYXB0aW9uPi9nLCAnL2I+PC9pPicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmNvbW1lbnQgPSBgPHByZSBjbGFzcz1cImxpbmUtbnVtYmVyc1wiPjxjb2RlIGNsYXNzPVwibGFuZ3VhZ2UtJHt0eXBlfVwiPmAgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0SHRtbEVudGl0aWVzKHRoaXMuY2xlYW5UYWcoanNkb2NUYWdzW2ldLmNvbW1lbnQpKSArIGA8L2NvZGU+PC9wcmU+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQudGFncyA9IHRhZ3M7XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IEpzZG9jVGFnSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9qc2RvYy10YWcuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgSUh0bWxFbmdpbmVIZWxwZXIsIElIYW5kbGViYXJzT3B0aW9ucyB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgSnNkb2NFeGFtcGxlSGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCBqc2RvY1RhZ3M6IEpzZG9jVGFnSW50ZXJmYWNlW10sIG9wdGlvbnM6IElIYW5kbGViYXJzT3B0aW9ucykge1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICBsZXQgbGVuID0ganNkb2NUYWdzLmxlbmd0aDtcclxuICAgICAgICBsZXQgdGFncyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAnZXhhbXBsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFnID0ge30gYXMgSnNkb2NUYWdJbnRlcmZhY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5jb21tZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQucmVwbGFjZSgvPGNhcHRpb24+L2csICc8Yj48aT4nKS5yZXBsYWNlKC9cXC9jYXB0aW9uPi9nLCAnL2I+PC9pPicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0YWdzLnB1c2godGFnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQudGFncyA9IHRhZ3M7XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImNvbnN0IHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGtpbmRUb1R5cGUoa2luZDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIGxldCBfdHlwZSA9ICcnO1xyXG4gICAgc3dpdGNoKGtpbmQpIHtcclxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nS2V5d29yZDpcclxuICAgICAgICAgICAgX3R5cGUgPSAnc3RyaW5nJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWJlcktleXdvcmQ6XHJcbiAgICAgICAgICAgIF90eXBlID0gJ251bWJlcic7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheVR5cGU6XHJcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFycmF5TGl0ZXJhbEV4cHJlc3Npb246XHJcbiAgICAgICAgICAgIF90eXBlID0gJ1tdJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZvaWRLZXl3b3JkOlxyXG4gICAgICAgICAgICBfdHlwZSA9ICd2b2lkJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uVHlwZTpcclxuICAgICAgICAgICAgX3R5cGUgPSAnZnVuY3Rpb24nO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZUxpdGVyYWw6XHJcbiAgICAgICAgICAgIF90eXBlID0gJ2xpdGVyYWwgdHlwZSc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Cb29sZWFuS2V5d29yZDpcclxuICAgICAgICAgICAgX3R5cGUgPSAnYm9vbGVhbic7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BbnlLZXl3b3JkOlxyXG4gICAgICAgICAgICBfdHlwZSA9ICdhbnknO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQ6XHJcbiAgICAgICAgICAgIF90eXBlID0gJ251bGwnO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTmV2ZXJLZXl3b3JkOlxyXG4gICAgICAgICAgICBfdHlwZSA9ICduZXZlcic7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PYmplY3RLZXl3b3JkOlxyXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbjpcclxuICAgICAgICAgICAgX3R5cGUgPSAnb2JqZWN0JztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX3R5cGU7XHJcbn1cclxuIiwiaW1wb3J0IHsgSUh0bWxFbmdpbmVIZWxwZXIsIElIYW5kbGViYXJzT3B0aW9ucyB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcbmltcG9ydCB7IEpzZG9jVGFnSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9qc2RvYy10YWcuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsga2luZFRvVHlwZSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2tpbmQtdG8tdHlwZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgSnNkb2NQYXJhbXNIZWxwZXIgaW1wbGVtZW50cyBJSHRtbEVuZ2luZUhlbHBlciB7XHJcbiAgICBwdWJsaWMgaGVscGVyRnVuYyhjb250ZXh0OiBhbnksIGpzZG9jVGFnczogQXJyYXk8SnNkb2NUYWdJbnRlcmZhY2UgfCBhbnk+LCBvcHRpb25zOiBJSGFuZGxlYmFyc09wdGlvbnMpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgbGV0IGxlbiA9IGpzZG9jVGFncy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHRhZ3MgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3BhcmFtJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWcgPSB7fSBhcyBKc2RvY1RhZ0ludGVyZmFjZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uICYmIGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLmtpbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnLnR5cGUgPSBraW5kVG9UeXBlKGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLmtpbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnR5cGVFeHByZXNzaW9uICYmIGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnLnR5cGUgPSBqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24udHlwZS5uYW1lLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnLnR5cGUgPSBqc2RvY1RhZ3NbaV0udHlwZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5jb21tZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLm5hbWUudGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLm5hbWUgPSBqc2RvY1RhZ3NbaV0ubmFtZS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLm5hbWUgPSBqc2RvY1RhZ3NbaV0ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLm9wdGlvbmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh0YWcgYXMgYW55KS5vcHRpb25hbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ3MucHVzaCh0YWcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0YWdzLmxlbmd0aCA+PSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQudGFncyA9IHRhZ3M7XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyLCBJSGFuZGxlYmFyc09wdGlvbnMgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBKc2RvY1RhZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvanNkb2MtdGFnLmludGVyZmFjZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgSnNkb2NQYXJhbXNWYWxpZEhlbHBlciBpbXBsZW1lbnRzIElIdG1sRW5naW5lSGVscGVyIHtcclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwganNkb2NUYWdzOiBKc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zOiBJSGFuZGxlYmFyc09wdGlvbnMpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgbGV0IGxlbiA9IGpzZG9jVGFncy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHRhZ3MgPSBbXTtcclxuICAgICAgICBsZXQgdmFsaWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50YWdOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLnRhZ05hbWUudGV4dCA9PT0gJ3BhcmFtJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZShjb250ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciwgSUhhbmRsZWJhcnNPcHRpb25zIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXIuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgSnNkb2NUYWdJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL2pzZG9jLXRhZy5pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEpzZG9jRGVmYXVsdEhlbHBlciBpbXBsZW1lbnRzIElIdG1sRW5naW5lSGVscGVyIHtcclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwganNkb2NUYWdzOiBKc2RvY1RhZ0ludGVyZmFjZVtdLCBvcHRpb25zOiBJSGFuZGxlYmFyc09wdGlvbnMpIHtcclxuICAgICAgICBpZiAoanNkb2NUYWdzKSB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IGpzZG9jVGFncy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCB0YWcgPSB7fSBhcyBKc2RvY1RhZ0ludGVyZmFjZTtcclxuICAgICAgICAgICAgbGV0IGRlZmF1bHRWYWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc2RvY1RhZ3NbaV0udGFnTmFtZS50ZXh0ID09PSAnZGVmYXVsdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbiAmJiBqc2RvY1RhZ3NbaV0udHlwZUV4cHJlc3Npb24udHlwZS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcudHlwZSA9IGpzZG9jVGFnc1tpXS50eXBlRXhwcmVzc2lvbi50eXBlLm5hbWUudGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNkb2NUYWdzW2ldLmNvbW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5jb21tZW50ID0ganNkb2NUYWdzW2ldLmNvbW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzZG9jVGFnc1tpXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcubmFtZSA9IGpzZG9jVGFnc1tpXS5uYW1lLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC50YWcgPSB0YWc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IElIdG1sRW5naW5lSGVscGVyLCBJSGFuZGxlYmFyc09wdGlvbnMgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBEZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuLi9kZXBlbmRlbmNpZXMuZW5naW5lJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBBbmd1bGFyVmVyc2lvblV0aWwsIEJhc2ljVHlwZVV0aWwgfSBmcm9tICcuLi8uLi8uLi91dGlscyc7XHJcblxyXG5leHBvcnQgY2xhc3MgTGlua1R5cGVIZWxwZXIgaW1wbGVtZW50cyBJSHRtbEVuZ2luZUhlbHBlciB7XHJcbiAgICBwcml2YXRlIGFuZ3VsYXJWZXJzaW9uVXRpbCA9IG5ldyBBbmd1bGFyVmVyc2lvblV0aWwoKTtcclxuICAgIHByaXZhdGUgYmFzaWNUeXBlVXRpbCA9IG5ldyBCYXNpY1R5cGVVdGlsKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBDb25maWd1cmF0aW9uSW50ZXJmYWNlLFxyXG4gICAgICAgIHByaXZhdGUgZGVwZW5kZW5jaWVzRW5naW5lOiBEZXBlbmRlbmNpZXNFbmdpbmUpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCBuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IElIYW5kbGViYXJzT3B0aW9ucykge1xyXG4gICAgICAgIGxldCBfcmVzdWx0ID0gdGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuZmluZChuYW1lKTtcclxuICAgICAgICBsZXQgYW5ndWxhckRvY1ByZWZpeCA9IHRoaXMuYW5ndWxhclZlcnNpb25VdGlsLnByZWZpeE9mZmljaWFsRG9jKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hbmd1bGFyVmVyc2lvbik7XHJcbiAgICAgICAgaWYgKF9yZXN1bHQpIHtcclxuICAgICAgICAgICAgY29udGV4dC50eXBlID0ge1xyXG4gICAgICAgICAgICAgICAgcmF3OiBuYW1lXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChfcmVzdWx0LnNvdXJjZSA9PT0gJ2ludGVybmFsJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKF9yZXN1bHQuZGF0YS50eXBlID09PSAnY2xhc3MnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhLnR5cGUgPSAnY2xhc3NlJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRleHQudHlwZS5ocmVmID0gJy4uLycgKyBfcmVzdWx0LmRhdGEudHlwZSArICdzLycgKyBfcmVzdWx0LmRhdGEubmFtZSArICcuaHRtbCc7XHJcbiAgICAgICAgICAgICAgICBpZiAoX3Jlc3VsdC5kYXRhLnR5cGUgPT09ICdtaXNjZWxsYW5lb3VzJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYWlucGFnZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX3Jlc3VsdC5kYXRhLnN1YnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZW51bSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWlucGFnZSA9ICdlbnVtZXJhdGlvbnMnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1haW5wYWdlID0gJ2Z1bmN0aW9ucyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndHlwZWFsaWFzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1haW5wYWdlID0gJ3R5cGVhbGlhc2VzJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd2YXJpYWJsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWlucGFnZSA9ICd2YXJpYWJsZXMnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnR5cGUuaHJlZiA9ICcuLi8nICsgX3Jlc3VsdC5kYXRhLnR5cGUgKyAnLycgKyBtYWlucGFnZSArICcuaHRtbCMnICsgX3Jlc3VsdC5kYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnR5cGUudGFyZ2V0ID0gJ19zZWxmJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQudHlwZS5ocmVmID0gYGh0dHBzOi8vJHthbmd1bGFyRG9jUHJlZml4fWFuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpLyR7X3Jlc3VsdC5kYXRhLnBhdGh9YDtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQudHlwZS50YXJnZXQgPSAnX2JsYW5rJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJhc2ljVHlwZVV0aWwuaXNLbm93blR5cGUobmFtZSkpIHtcclxuICAgICAgICAgICAgY29udGV4dC50eXBlID0ge1xyXG4gICAgICAgICAgICAgICAgcmF3OiBuYW1lXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnRleHQudHlwZS50YXJnZXQgPSAnX2JsYW5rJztcclxuICAgICAgICAgICAgY29udGV4dC50eXBlLmhyZWYgPSB0aGlzLmJhc2ljVHlwZVV0aWwuZ2V0VHlwZVVybChuYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZShjb250ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgSUh0bWxFbmdpbmVIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlci5pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEluZGV4YWJsZVNpZ25hdHVyZUhlbHBlciBpbXBsZW1lbnRzIElIdG1sRW5naW5lSGVscGVyIHtcclxuICAgIHB1YmxpYyBoZWxwZXJGdW5jKGNvbnRleHQ6IGFueSwgbWV0aG9kKSB7XHJcbiAgICAgICAgY29uc3QgYXJncyA9IG1ldGhvZC5hcmdzLm1hcChhcmcgPT4gYCR7YXJnLm5hbWV9OiAke2FyZy50eXBlfWApLmpvaW4oJywgJyk7XHJcbiAgICAgICAgaWYgKG1ldGhvZC5uYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHttZXRob2QubmFtZX1bJHthcmdzfV1gO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgWyR7YXJnc31dYDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XHJcblxyXG5leHBvcnQgY2xhc3MgT2JqZWN0SGVscGVyIGltcGxlbWVudHMgSUh0bWxFbmdpbmVIZWxwZXIge1xyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCB0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkodGV4dCk7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgve1wiLywgJ3s8YnI+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XCInKTtcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8sXCIvLCAnLDxicj4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcIicpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL30kLywgJzxicj59Jyk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGViYXJzLlNhZmVTdHJpbmcodGV4dCk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgZnVuY3Rpb24gZXh0cmFjdExlYWRpbmdUZXh0KHN0cmluZywgY29tcGxldGVUYWcpIHtcclxuICAgIHZhciB0YWdJbmRleCA9IHN0cmluZy5pbmRleE9mKGNvbXBsZXRlVGFnKTtcclxuICAgIHZhciBsZWFkaW5nVGV4dCA9IHVuZGVmaW5lZDtcclxuICAgIHZhciBsZWFkaW5nVGV4dFJlZ0V4cCA9IC9cXFsoLis/KVxcXS9nO1xyXG4gICAgdmFyIGxlYWRpbmdUZXh0SW5mbyA9IGxlYWRpbmdUZXh0UmVnRXhwLmV4ZWMoc3RyaW5nKTtcclxuXHJcbiAgICAvLyBkaWQgd2UgZmluZCBsZWFkaW5nIHRleHQsIGFuZCBpZiBzbywgZG9lcyBpdCBpbW1lZGlhdGVseSBwcmVjZWRlIHRoZSB0YWc/XHJcbiAgICB3aGlsZSAobGVhZGluZ1RleHRJbmZvICYmIGxlYWRpbmdUZXh0SW5mby5sZW5ndGgpIHtcclxuICAgICAgICBpZiAobGVhZGluZ1RleHRJbmZvLmluZGV4ICsgbGVhZGluZ1RleHRJbmZvWzBdLmxlbmd0aCA9PT0gdGFnSW5kZXgpIHtcclxuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobGVhZGluZ1RleHRJbmZvWzBdLCAnJyk7XHJcbiAgICAgICAgICAgIGxlYWRpbmdUZXh0ID0gbGVhZGluZ1RleHRJbmZvWzFdO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxlYWRpbmdUZXh0SW5mbyA9IGxlYWRpbmdUZXh0UmVnRXhwLmV4ZWMoc3RyaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxlYWRpbmdUZXh0OiBsZWFkaW5nVGV4dCxcclxuICAgICAgICBzdHJpbmc6IHN0cmluZ1xyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0TGlua1RleHQodGV4dCkge1xyXG4gICAgdmFyIGxpbmtUZXh0O1xyXG4gICAgdmFyIHRhcmdldDtcclxuICAgIHZhciBzcGxpdEluZGV4O1xyXG5cclxuICAgIC8vIGlmIGEgcGlwZSBpcyBub3QgcHJlc2VudCwgd2Ugc3BsaXQgb24gdGhlIGZpcnN0IHNwYWNlXHJcbiAgICBzcGxpdEluZGV4ID0gdGV4dC5pbmRleE9mKCd8Jyk7XHJcbiAgICBpZiAoc3BsaXRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICBzcGxpdEluZGV4ID0gdGV4dC5zZWFyY2goL1xccy8pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzcGxpdEluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIGxpbmtUZXh0ID0gdGV4dC5zdWJzdHIoc3BsaXRJbmRleCArIDEpO1xyXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBzdWJzZXF1ZW50IG5ld2xpbmVzIHRvIGEgc2luZ2xlIHNwYWNlLlxyXG4gICAgICAgIGxpbmtUZXh0ID0gbGlua1RleHQucmVwbGFjZSgvXFxuKy8sICcgJyk7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGV4dC5zdWJzdHIoMCwgc3BsaXRJbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5rVGV4dDogbGlua1RleHQsXHJcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQgfHwgdGV4dFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGxldCBMaW5rUGFyc2VyID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBwcm9jZXNzVGhlTGluayA9IGZ1bmN0aW9uKHN0cmluZywgdGFnSW5mbywgbGVhZGluZ1RleHQpIHtcclxuICAgICAgICB2YXIgbGVhZGluZyA9IGV4dHJhY3RMZWFkaW5nVGV4dChzdHJpbmcsIHRhZ0luZm8uY29tcGxldGVUYWcpLFxyXG4gICAgICAgICAgICBsaW5rVGV4dCxcclxuICAgICAgICAgICAgc3BsaXQsXHJcbiAgICAgICAgICAgIHRhcmdldCxcclxuICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlO1xyXG5cclxuICAgICAgICBsaW5rVGV4dCA9IChsZWFkaW5nVGV4dCkgPyBsZWFkaW5nVGV4dCA6IChsZWFkaW5nLmxlYWRpbmdUZXh0IHx8ICcnKTtcclxuXHJcbiAgICAgICAgc3BsaXQgPSBzcGxpdExpbmtUZXh0KHRhZ0luZm8udGV4dCk7XHJcbiAgICAgICAgdGFyZ2V0ID0gc3BsaXQudGFyZ2V0O1xyXG5cclxuICAgICAgICBpZiAobGVhZGluZy5sZWFkaW5nVGV4dCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZSA9ICdbJyArIGxlYWRpbmcubGVhZGluZ1RleHQgKyAnXScgKyB0YWdJbmZvLmNvbXBsZXRlVGFnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwbGl0LmxpbmtUZXh0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2UgPSB0YWdJbmZvLmNvbXBsZXRlVGFnO1xyXG4gICAgICAgICAgICBsaW5rVGV4dCA9IHNwbGl0LmxpbmtUZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHN0cmluZ3RvUmVwbGFjZSwgJ1snICsgbGlua1RleHQgKyAnXSgnICsgdGFyZ2V0ICsgJyknKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRcclxuICAgICAqIHtAbGluayBodHRwOi8vd3d3Lmdvb2dsZS5jb218R29vZ2xlfSBvciB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tIEdpdEh1Yn0gb3IgW0dpdGh1Yl17QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tfSB0byBbR2l0aHViXShodHRwczovL2dpdGh1Yi5jb20pXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgcmVwbGFjZUxpbmtUYWcgPSBmdW5jdGlvbihzdHI6IHN0cmluZykge1xyXG5cclxuICAgICAgICAvLyBuZXcgUmVnRXhwKCdcXFxcWygoPzoufFxcbikrPyldXFxcXHtAbGlua1xcXFxzKygoPzoufFxcbikrPylcXFxcfScsICdpJykuZXhlYygnZWUgW1RPIERPXXtAbGluayBUb2RvfSBmbycpIC0+IFwiW1RPIERPXXtAbGluayBUb2RvfVwiLCBcIlRPIERPXCIsIFwiVG9kb1wiXHJcbiAgICAgICAgLy8gbmV3IFJlZ0V4cCgnXFxcXHtAbGlua1xcXFxzKygoPzoufFxcbikrPylcXFxcfScsICdpJykuZXhlYygnZWUgW1RPRE9de0BsaW5rIFRvZG99IGZvJykgLT4gXCJ7QGxpbmsgVG9kb31cIiwgXCJUb2RvXCJcclxuXHJcbiAgICAgICAgdmFyIHRhZ1JlZ0V4cExpZ2h0ID0gbmV3IFJlZ0V4cCgnXFxcXHtAbGlua1xcXFxzKygoPzoufFxcbikrPylcXFxcfScsICdpJyksXHJcbiAgICAgICAgICAgIHRhZ1JlZ0V4cEZ1bGwgPSBuZXcgUmVnRXhwKCdcXFxce0BsaW5rXFxcXHMrKCg/Oi58XFxuKSs/KVxcXFx9JywgJ2knKSxcclxuICAgICAgICAgICAgdGFnUmVnRXhwLFxyXG4gICAgICAgICAgICBtYXRjaGVzLFxyXG4gICAgICAgICAgICBwcmV2aW91c1N0cmluZyxcclxuICAgICAgICAgICAgdGFnSW5mbyA9IFtdO1xyXG5cclxuICAgICAgICB0YWdSZWdFeHAgPSAoc3RyLmluZGV4T2YoJ117JykgIT09IC0xKSA/IHRhZ1JlZ0V4cEZ1bGwgOiB0YWdSZWdFeHBMaWdodDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVwbGFjZU1hdGNoKHJlcGxhY2VyLCB0YWcsIG1hdGNoLCB0ZXh0LCBsaW5rVGV4dD8pIHtcclxuICAgICAgICAgICAgdmFyIG1hdGNoZWRUYWcgPSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZVRhZzogbWF0Y2gsXHJcbiAgICAgICAgICAgICAgICB0YWc6IHRhZyxcclxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGFnSW5mby5wdXNoKG1hdGNoZWRUYWcpO1xyXG4gICAgICAgICAgICBpZiAobGlua1RleHQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXBsYWNlcihzdHIsIG1hdGNoZWRUYWcsIGxpbmtUZXh0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXBsYWNlcihzdHIsIG1hdGNoZWRUYWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIG1hdGNoZXMgPSB0YWdSZWdFeHAuZXhlYyhzdHIpO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgcHJldmlvdXNTdHJpbmcgPSBzdHI7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSByZXBsYWNlTWF0Y2gocHJvY2Vzc1RoZUxpbmssICdsaW5rJywgbWF0Y2hlc1swXSwgbWF0Y2hlc1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSByZXBsYWNlTWF0Y2gocHJvY2Vzc1RoZUxpbmssICdsaW5rJywgbWF0Y2hlc1swXSwgbWF0Y2hlc1syXSwgbWF0Y2hlc1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IHdoaWxlIChtYXRjaGVzICYmIHByZXZpb3VzU3RyaW5nICE9PSBzdHIpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuZXdTdHJpbmc6IHN0clxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIF9yZXNvbHZlTGlua3MgPSBmdW5jdGlvbihzdHI6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiByZXBsYWNlTGlua1RhZyhzdHIpLm5ld1N0cmluZztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc29sdmVMaW5rczogX3Jlc29sdmVMaW5rc1xyXG4gICAgfVxyXG59KSgpO1xyXG4iLCJpbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVyLmludGVyZmFjZSc7XHJcbmltcG9ydCB7IGV4dHJhY3RMZWFkaW5nVGV4dCwgc3BsaXRMaW5rVGV4dCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2xpbmstcGFyc2VyJztcclxuaW1wb3J0IHsgRGVwZW5kZW5jaWVzRW5naW5lIH0gZnJvbSAnLi4vZGVwZW5kZW5jaWVzLmVuZ2luZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUGFyc2VEZXNjcmlwdGlvbkhlbHBlciBpbXBsZW1lbnRzIElIdG1sRW5naW5lSGVscGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVwZW5kZW5jaWVzRW5naW5lOiBEZXBlbmRlbmNpZXNFbmdpbmUpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhlbHBlckZ1bmMoY29udGV4dDogYW55LCBkZXNjcmlwdGlvbjogc3RyaW5nLCBkZXB0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHRhZ1JlZ0V4cExpZ2h0ID0gbmV3IFJlZ0V4cCgnXFxcXHtAbGlua1xcXFxzKygoPzoufFxcbikrPylcXFxcfScsICdpJyk7XHJcbiAgICAgICAgbGV0IHRhZ1JlZ0V4cEZ1bGwgPSBuZXcgUmVnRXhwKCdcXFxce0BsaW5rXFxcXHMrKCg/Oi58XFxuKSs/KVxcXFx9JywgJ2knKTtcclxuICAgICAgICBsZXQgdGFnUmVnRXhwO1xyXG4gICAgICAgIGxldCBtYXRjaGVzO1xyXG4gICAgICAgIGxldCBwcmV2aW91c1N0cmluZztcclxuICAgICAgICBsZXQgdGFnSW5mbyA9IFtdO1xyXG5cclxuICAgICAgICB0YWdSZWdFeHAgPSAoZGVzY3JpcHRpb24uaW5kZXhPZignXXsnKSAhPT0gLTEpID8gdGFnUmVnRXhwRnVsbCA6IHRhZ1JlZ0V4cExpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdCBwcm9jZXNzVGhlTGluayA9IChzdHJpbmcsIHRhZ0luZm8sIGxlYWRpbmdUZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBsZWFkaW5nID0gZXh0cmFjdExlYWRpbmdUZXh0KHN0cmluZywgdGFnSW5mby5jb21wbGV0ZVRhZyk7XHJcbiAgICAgICAgICAgIGxldCBzcGxpdDtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDtcclxuICAgICAgICAgICAgbGV0IG5ld0xpbms7XHJcbiAgICAgICAgICAgIGxldCByb290UGF0aDtcclxuICAgICAgICAgICAgbGV0IHN0cmluZ3RvUmVwbGFjZTtcclxuICAgICAgICAgICAgbGV0IGFuY2hvciA9ICcnO1xyXG5cclxuICAgICAgICAgICAgc3BsaXQgPSBzcGxpdExpbmtUZXh0KHRhZ0luZm8udGV4dCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNwbGl0LmxpbmtUZXh0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuZmluZEluQ29tcG9kb2Moc3BsaXQudGFyZ2V0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbmZvID0gdGFnSW5mby50ZXh0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhZ0luZm8udGV4dC5pbmRleE9mKCcjJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yID0gdGFnSW5mby50ZXh0LnN1YnN0cih0YWdJbmZvLnRleHQuaW5kZXhPZignIycpLCB0YWdJbmZvLnRleHQubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICBpbmZvID0gdGFnSW5mby50ZXh0LnN1YnN0cigwLCB0YWdJbmZvLnRleHQuaW5kZXhPZignIycpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmZpbmRJbkNvbXBvZG9jKGluZm8pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxlYWRpbmdUZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5ndG9SZXBsYWNlID0gJ1snICsgbGVhZGluZ1RleHQgKyAnXScgKyB0YWdJbmZvLmNvbXBsZXRlVGFnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsZWFkaW5nLmxlYWRpbmdUZXh0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHJpbmd0b1JlcGxhY2UgPSAnWycgKyBsZWFkaW5nLmxlYWRpbmdUZXh0ICsgJ10nICsgdGFnSW5mby5jb21wbGV0ZVRhZztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwbGl0LmxpbmtUZXh0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZSA9IHRhZ0luZm8uY29tcGxldGVUYWc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZ3RvUmVwbGFjZSA9IHRhZ0luZm8uY29tcGxldGVUYWc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC50eXBlID09PSAnY2xhc3MnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSAnY2xhc3NlJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByb290UGF0aCA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZGVwdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RQYXRoID0gJy4vJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByb290UGF0aCA9ICcuLi8nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RQYXRoID0gJy4uLy4uLyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsYWJlbCA9IHJlc3VsdC5uYW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxlYWRpbmcubGVhZGluZ1RleHQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gbGVhZGluZy5sZWFkaW5nVGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3BsaXQubGlua1RleHQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBzcGxpdC5saW5rVGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBuZXdMaW5rID0gYDxhIGhyZWY9XCIke3Jvb3RQYXRofSR7cmVzdWx0LnR5cGV9cy8ke3Jlc3VsdC5uYW1lfS5odG1sJHthbmNob3J9XCI+JHtsYWJlbH08L2E+YDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShzdHJpbmd0b1JlcGxhY2UsIG5ld0xpbmspO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcGxhY2VNYXRjaChyZXBsYWNlciwgdGFnLCBtYXRjaCwgdGV4dCwgbGlua1RleHQ/KSB7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaGVkVGFnID0ge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGVUYWc6IG1hdGNoLFxyXG4gICAgICAgICAgICAgICAgdGFnOiB0YWcsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRhZ0luZm8ucHVzaChtYXRjaGVkVGFnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsaW5rVGV4dCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VyKGRlc2NyaXB0aW9uLCBtYXRjaGVkVGFnLCBsaW5rVGV4dCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbGFjZXIoZGVzY3JpcHRpb24sIG1hdGNoZWRUYWcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIG1hdGNoZXMgPSB0YWdSZWdFeHAuZXhlYyhkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XHJcbiAgICAgICAgICAgICAgICBwcmV2aW91c1N0cmluZyA9IGRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSByZXBsYWNlTWF0Y2gocHJvY2Vzc1RoZUxpbmssICdsaW5rJywgbWF0Y2hlc1swXSwgbWF0Y2hlc1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IHJlcGxhY2VNYXRjaChwcm9jZXNzVGhlTGluaywgJ2xpbmsnLCBtYXRjaGVzWzBdLCBtYXRjaGVzWzJdLCBtYXRjaGVzWzFdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gd2hpbGUgKG1hdGNoZXMgJiYgcHJldmlvdXNTdHJpbmcgIT09IGRlc2NyaXB0aW9uKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuXHJcbmltcG9ydCB7IGtpbmRUb1R5cGUgfSBmcm9tICcuLi8uLi91dGlscy9raW5kLXRvLXR5cGUnO1xyXG5pbXBvcnQgeyBEZXBlbmRlbmNpZXNFbmdpbmUgfSBmcm9tICcuL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xyXG5pbXBvcnQgeyBJSHRtbEVuZ2luZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9odG1sLWVuZ2luZS1oZWxwZXIuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQ29tcGFyZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9jb21wYXJlLmhlbHBlcic7XHJcbmltcG9ydCB7IE9ySGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXJzL29yLmhlbHBlcic7XHJcbmltcG9ydCB7IEZ1bmN0aW9uU2lnbmF0dXJlSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXJzL2Z1bmN0aW9uLXNpZ25hdHVyZS5oZWxwZXInO1xyXG5pbXBvcnQgeyBJc05vdFRvZ2dsZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9pcy1ub3QtdG9nZ2xlLmhlbHBlcic7XHJcbmltcG9ydCB7IElmU3RyaW5nSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXJzL2lmLXN0cmluZy5oZWxwZXInO1xyXG5pbXBvcnQgeyBPckxlbmd0aEhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9vci1sZW5ndGguaGVscGVyJztcclxuaW1wb3J0IHsgRmlsdGVyQW5ndWxhcjJNb2R1bGVzSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXJzL2ZpbHRlci1hbmd1bGFyMi1tb2R1bGVzLmhlbHBlcic7XHJcbmltcG9ydCB7IERlYnVnSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXJzL2RlYnVnLmhlbHBlcic7XHJcbmltcG9ydCB7IEJyZWFrTGluZXNIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvYnJlYWstbGluZXMuaGVscGVyJztcclxuaW1wb3J0IHsgQ2xlYW5QYXJhZ3JhcGhIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvY2xlYW4tcGFyYWdyYXBoLmhlbHBlcic7XHJcbmltcG9ydCB7IEVzY2FwZVNpbXBsZVF1b3RlSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXJzL2VzY2FwZS1zaW1wbGUtcXVvdGUuaGVscGVyJztcclxuaW1wb3J0IHsgQnJlYWtDb21tYUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9icmVhay1jb21tYS5oZWxwZXInO1xyXG5pbXBvcnQgeyBNb2RpZktpbmRIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvbW9kaWYta2luZC1oZWxwZXInO1xyXG5pbXBvcnQgeyBNb2RpZkljb25IZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvbW9kaWYtaWNvbi5oZWxwZXInO1xyXG5pbXBvcnQgeyBSZWxhdGl2ZVVSTEhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9yZWxhdGl2ZS11cmwuaGVscGVyJztcclxuaW1wb3J0IHsgSnNkb2NSZXR1cm5zQ29tbWVudEhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9qc2RvYy1yZXR1cm5zLWNvbW1lbnQuaGVscGVyJztcclxuaW1wb3J0IHsgSnNkb2NDb2RlRXhhbXBsZUhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9qc2RvYy1jb2RlLWV4YW1wbGUuaGVscGVyJztcclxuaW1wb3J0IHsgSnNkb2NFeGFtcGxlSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXJzL2pzZG9jLWV4YW1wbGUuaGVscGVyJztcclxuaW1wb3J0IHsgSnNkb2NQYXJhbXNIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvanNkb2MtcGFyYW1zLmhlbHBlcic7XHJcbmltcG9ydCB7IEpzZG9jUGFyYW1zVmFsaWRIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvanNkb2MtcGFyYW1zLXZhbGlkLmhlbHBlcic7XHJcbmltcG9ydCB7IEpzZG9jRGVmYXVsdEhlbHBlciB9IGZyb20gJy4vaHRtbC1lbmdpbmUtaGVscGVycy9qc2RvYy1kZWZhdWx0LmhlbHBlcic7XHJcbmltcG9ydCB7IExpbmtUeXBlSGVscGVyIH0gZnJvbSAnLi9odG1sLWVuZ2luZS1oZWxwZXJzL2xpbmstdHlwZS5oZWxwZXInO1xyXG5pbXBvcnQgeyBJbmRleGFibGVTaWduYXR1cmVIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvaW5kZXhhYmxlLXNpZ25hdHVyZS5oZWxwZXInO1xyXG5pbXBvcnQgeyBPYmplY3RIZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvb2JqZWN0LmhlbHBlcic7XHJcbmltcG9ydCB7IFBhcnNlRGVzY3JpcHRpb25IZWxwZXIgfSBmcm9tICcuL2h0bWwtZW5naW5lLWhlbHBlcnMvcGFyc2UtZGVzY3JpcHRpb24uaGVscGVyJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBIdG1sRW5naW5lSGVscGVycyB7XHJcbiAgICBwdWJsaWMgcmVnaXN0ZXJIZWxwZXJzKFxyXG4gICAgICAgIGJhcnMsXHJcbiAgICAgICAgY29uZmlndXJhdGlvbjogQ29uZmlndXJhdGlvbkludGVyZmFjZSxcclxuICAgICAgICBkZXBlbmRlbmNpZXNFbmdpbmU6IERlcGVuZGVuY2llc0VuZ2luZSk6IHZvaWQge1xyXG5cclxuICAgICAgICB0aGlzLnJlZ2lzdGVySGVscGVyKGJhcnMsICdjb21wYXJlJywgbmV3IENvbXBhcmVIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnb3InLCBuZXcgT3JIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnZnVuY3Rpb25TaWduYXR1cmUnLCBuZXcgRnVuY3Rpb25TaWduYXR1cmVIZWxwZXIoY29uZmlndXJhdGlvbiwgZGVwZW5kZW5jaWVzRW5naW5lKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnaXNOb3RUb2dnbGUnLCBuZXcgSXNOb3RUb2dnbGVIZWxwZXIoY29uZmlndXJhdGlvbikpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJIZWxwZXIoYmFycywgJ2lmU3RyaW5nJywgbmV3IElmU3RyaW5nSGVscGVyKCkpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJIZWxwZXIoYmFycywgJ29yTGVuZ3RoJywgbmV3IE9yTGVuZ3RoSGVscGVyKCkpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJIZWxwZXIoYmFycywgJ2ZpbHRlckFuZ3VsYXIyTW9kdWxlcycsIG5ldyBGaWx0ZXJBbmd1bGFyMk1vZHVsZXNIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnZGVidWcnLCBuZXcgRGVidWdIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnYnJlYWtsaW5lcycsIG5ldyBCcmVha0xpbmVzSGVscGVyKGJhcnMpKTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVySGVscGVyKGJhcnMsICdjbGVhbi1wYXJhZ3JhcGgnLCBuZXcgQ2xlYW5QYXJhZ3JhcGhIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnZXNjYXBlU2ltcGxlUXVvdGUnLCBuZXcgRXNjYXBlU2ltcGxlUXVvdGVIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnYnJlYWtDb21tYScsIG5ldyBCcmVha0NvbW1hSGVscGVyKGJhcnMpKTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVySGVscGVyKGJhcnMsICdtb2RpZktpbmQnLCBuZXcgTW9kaWZLaW5kSGVscGVyKCkpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJIZWxwZXIoYmFycywgJ21vZGlmSWNvbicsIG5ldyBNb2RpZkljb25IZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAncmVsYXRpdmVVUkwnLCBuZXcgUmVsYXRpdmVVUkxIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnanNkb2MtcmV0dXJucy1jb21tZW50JywgbmV3IEpzZG9jUmV0dXJuc0NvbW1lbnRIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnanNkb2MtY29kZS1leGFtcGxlJywgbmV3IEpzZG9jQ29kZUV4YW1wbGVIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnanNkb2MtZXhhbXBsZScsIG5ldyBKc2RvY0V4YW1wbGVIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnanNkb2MtcGFyYW1zJywgbmV3IEpzZG9jUGFyYW1zSGVscGVyKCkpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJIZWxwZXIoYmFycywgJ2pzZG9jLXBhcmFtcy12YWxpZCcsIG5ldyBKc2RvY1BhcmFtc1ZhbGlkSGVscGVyKCkpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJIZWxwZXIoYmFycywgJ2pzZG9jLWRlZmF1bHQnLCBuZXcgSnNkb2NEZWZhdWx0SGVscGVyKCkpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJIZWxwZXIoYmFycywgJ2xpbmtUeXBlJywgbmV3IExpbmtUeXBlSGVscGVyKGNvbmZpZ3VyYXRpb24sIGRlcGVuZGVuY2llc0VuZ2luZSkpO1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJIZWxwZXIoYmFycywgJ2luZGV4YWJsZVNpZ25hdHVyZScsIG5ldyBJbmRleGFibGVTaWduYXR1cmVIZWxwZXIoKSk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckhlbHBlcihiYXJzLCAnb2JqZWN0JywgbmV3IE9iamVjdEhlbHBlcigpKTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVySGVscGVyKGJhcnMsICdwYXJzZURlc2NyaXB0aW9uJywgbmV3IFBhcnNlRGVzY3JpcHRpb25IZWxwZXIoZGVwZW5kZW5jaWVzRW5naW5lKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWdpc3RlckhlbHBlcihiYXJzLCBrZXk6IHN0cmluZywgaGVscGVyOiBJSHRtbEVuZ2luZUhlbHBlcikge1xyXG4gICAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoa2V5LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWludmFsaWQtdGhpc1xyXG4gICAgICAgICAgICByZXR1cm4gaGVscGVyLmhlbHBlckZ1bmMuYXBwbHkoaGVscGVyLCBbdGhpcywgLi4uXy5zbGljZShhcmd1bWVudHMgYXMgYW55KV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlRW5naW5lIHtcclxuICAgIHB1YmxpYyBnZXQoZmlsZXBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZnMucmVhZEZpbGUocGF0aC5yZXNvbHZlKGZpbGVwYXRoKSwgJ3V0ZjgnLCAoZXJyLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgJyArIGZpbGVwYXRoICsgJyByZWFkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB3cml0ZShmaWxlcGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZnMub3V0cHV0RmlsZShwYXRoLnJlc29sdmUoZmlsZXBhdGgpLCBjb250ZW50cywgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIGZpbGUgVGhlIGZpbGUgdG8gY2hlY2tcclxuICAgICAqL1xyXG4gICAgcHVibGljIGV4aXN0c1N5bmMoZmlsZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoZmlsZSk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgSGFuZGxlYmFycyBmcm9tICdoYW5kbGViYXJzJztcclxuXHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XHJcbmltcG9ydCB7IEh0bWxFbmdpbmVIZWxwZXJzIH0gZnJvbSAnLi9odG1sLmVuZ2luZS5oZWxwZXJzJztcclxuaW1wb3J0IHsgRGVwZW5kZW5jaWVzRW5naW5lIH0gZnJvbSAnLi9kZXBlbmRlbmNpZXMuZW5naW5lJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9maWxlLmVuZ2luZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgSHRtbEVuZ2luZSB7XHJcbiAgICBwcml2YXRlIGNhY2hlOiB7IHBhZ2U6IHN0cmluZyB9ID0ge30gYXMgYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IENvbmZpZ3VyYXRpb25JbnRlcmZhY2UsXHJcbiAgICAgICAgZGVwZW5kZW5jaWVzRW5naW5lOiBEZXBlbmRlbmNpZXNFbmdpbmUsXHJcbiAgICAgICAgcHJpdmF0ZSBmaWxlRW5naW5lOiBGaWxlRW5naW5lID0gbmV3IEZpbGVFbmdpbmUoKSkge1xyXG5cclxuICAgICAgICBjb25zdCBoZWxwZXIgPSBuZXcgSHRtbEVuZ2luZUhlbHBlcnMoKTtcclxuICAgICAgICBoZWxwZXIucmVnaXN0ZXJIZWxwZXJzKEhhbmRsZWJhcnMsIGNvbmZpZ3VyYXRpb24sIGRlcGVuZGVuY2llc0VuZ2luZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgbGV0IHBhcnRpYWxzID0gW1xyXG4gICAgICAgICAgICAnbWVudScsXHJcbiAgICAgICAgICAgICdvdmVydmlldycsXHJcbiAgICAgICAgICAgICdtYXJrZG93bicsXHJcbiAgICAgICAgICAgICdtb2R1bGVzJyxcclxuICAgICAgICAgICAgJ21vZHVsZScsXHJcbiAgICAgICAgICAgICdjb21wb25lbnRzJyxcclxuICAgICAgICAgICAgJ2NvbXBvbmVudCcsXHJcbiAgICAgICAgICAgICdjb21wb25lbnQtZGV0YWlsJyxcclxuICAgICAgICAgICAgJ2RpcmVjdGl2ZXMnLFxyXG4gICAgICAgICAgICAnZGlyZWN0aXZlJyxcclxuICAgICAgICAgICAgJ2luamVjdGFibGVzJyxcclxuICAgICAgICAgICAgJ2luamVjdGFibGUnLFxyXG4gICAgICAgICAgICAncGlwZXMnLFxyXG4gICAgICAgICAgICAncGlwZScsXHJcbiAgICAgICAgICAgICdjbGFzc2VzJyxcclxuICAgICAgICAgICAgJ2NsYXNzJyxcclxuICAgICAgICAgICAgJ2ludGVyZmFjZScsXHJcbiAgICAgICAgICAgICdyb3V0ZXMnLFxyXG4gICAgICAgICAgICAnaW5kZXgnLFxyXG4gICAgICAgICAgICAnaW5kZXgtZGlyZWN0aXZlJyxcclxuICAgICAgICAgICAgJ2luZGV4LW1pc2MnLFxyXG4gICAgICAgICAgICAnc2VhcmNoLXJlc3VsdHMnLFxyXG4gICAgICAgICAgICAnc2VhcmNoLWlucHV0JyxcclxuICAgICAgICAgICAgJ2xpbmstdHlwZScsXHJcbiAgICAgICAgICAgICdibG9jay1tZXRob2QnLFxyXG4gICAgICAgICAgICAnYmxvY2stZW51bScsXHJcbiAgICAgICAgICAgICdibG9jay1wcm9wZXJ0eScsXHJcbiAgICAgICAgICAgICdibG9jay1pbmRleCcsXHJcbiAgICAgICAgICAgICdibG9jay1jb25zdHJ1Y3RvcicsXHJcbiAgICAgICAgICAgICdibG9jay10eXBlYWxpYXMnLFxyXG4gICAgICAgICAgICAnY292ZXJhZ2UtcmVwb3J0JyxcclxuICAgICAgICAgICAgJ21pc2NlbGxhbmVvdXMtZnVuY3Rpb25zJyxcclxuICAgICAgICAgICAgJ21pc2NlbGxhbmVvdXMtdmFyaWFibGVzJyxcclxuICAgICAgICAgICAgJ21pc2NlbGxhbmVvdXMtdHlwZWFsaWFzZXMnLFxyXG4gICAgICAgICAgICAnbWlzY2VsbGFuZW91cy1lbnVtZXJhdGlvbnMnLFxyXG4gICAgICAgICAgICAnYWRkaXRpb25hbC1wYWdlJ1xyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiBQcm9taXNlXHJcbiAgICAgICAgICAgIC5hbGwocGFydGlhbHMubWFwKHBhcnRpYWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZUVuZ2luZVxyXG4gICAgICAgICAgICAgICAgICAgIC5nZXQocGF0aC5yZXNvbHZlKF9fZGlybmFtZSArICcvLi4vc3JjL3RlbXBsYXRlcy9wYXJ0aWFscy8nICsgcGFydGlhbCArICcuaGJzJykpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbChwYXJ0aWFsLCBkYXRhKSk7XHJcbiAgICAgICAgICAgIH0pKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVFbmdpbmVcclxuICAgICAgICAgICAgICAgICAgICAuZ2V0KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFnZS5oYnMnKSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihkYXRhID0+IHRoaXMuY2FjaGUucGFnZSA9IGRhdGEpO1xyXG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlcihtYWluRGF0YTogYW55LCBwYWdlOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBvID0gbWFpbkRhdGE7XHJcbiAgICAgICAgKE9iamVjdCBhcyBhbnkpLmFzc2lnbihvLCBwYWdlKTtcclxuXHJcbiAgICAgICAgbGV0IHRlbXBsYXRlOiBhbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUodGhpcy5jYWNoZS5wYWdlKTtcclxuICAgICAgICByZXR1cm4gdGVtcGxhdGUoe1xyXG4gICAgICAgICAgICBkYXRhOiBvXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdlbmVyYXRlQ292ZXJhZ2VCYWRnZShvdXRwdXRGb2xkZXIsIGNvdmVyYWdlRGF0YSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVFbmdpbmUuZ2V0KHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvY292ZXJhZ2UtYmFkZ2UuaGJzJykpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRlbXBsYXRlOiBhbnkgPSBIYW5kbGViYXJzLmNvbXBpbGUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGVtcGxhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGNvdmVyYWdlRGF0YVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVzdE91dHB1dERpciA9IG91dHB1dEZvbGRlci5tYXRjaChwcm9jZXNzLmN3ZCgpKTtcclxuICAgICAgICAgICAgICAgIGlmICghdGVzdE91dHB1dERpcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dEZvbGRlciA9IG91dHB1dEZvbGRlci5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlRW5naW5lXHJcbiAgICAgICAgICAgICAgICAgICAgLndyaXRlKG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJy9pbWFnZXMvY292ZXJhZ2UtYmFkZ2Uuc3ZnJywgcmVzdWx0KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBjb3ZlcmFnZSBiYWRnZSBmaWxlIGdlbmVyYXRpb24gJywgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sIGVyciA9PiBQcm9taXNlLnJlamVjdCgnRXJyb3IgZHVyaW5nIGNvdmVyYWdlIGJhZGdlIGdlbmVyYXRpb24nKSk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XHJcbmltcG9ydCB7IEZpbGVFbmdpbmUgfSBmcm9tICcuL2ZpbGUuZW5naW5lJztcclxuXHJcbmNvbnN0IG1hcmtlZCA9IHJlcXVpcmUoJ21hcmtlZCcpO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1hcmtkb3duRW5naW5lIHtcclxuXHQvKipcclxuXHQgKiBMaXN0IG9mIG1hcmtkb3duIGZpbGVzIHdpdGhvdXQgLm1kIGV4dGVuc2lvblxyXG5cdCAqL1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgbWFya2Rvd25GaWxlcyA9IFtcclxuXHRcdCdSRUFETUUnLFxyXG5cdFx0J0NIQU5HRUxPRycsXHJcblx0XHQnTElDRU5TRScsXHJcblx0XHQnQ09OVFJJQlVUSU5HJyxcclxuXHRcdCdUT0RPJ1xyXG5cdF07XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgZmlsZUVuZ2luZSA9IG5ldyBGaWxlRW5naW5lKCkpIHtcclxuXHRcdGNvbnN0IHJlbmRlcmVyID0gbmV3IG1hcmtlZC5SZW5kZXJlcigpO1xyXG5cdFx0cmVuZGVyZXIuY29kZSA9IChjb2RlLCBsYW5ndWFnZSkgPT4ge1xyXG5cdFx0XHRsZXQgaGlnaGxpZ2h0ZWQgPSBjb2RlO1xyXG5cdFx0XHRpZiAoIWxhbmd1YWdlKSB7XHJcblx0XHRcdFx0bGFuZ3VhZ2UgPSAnbm9uZSc7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGhpZ2hsaWdodGVkID0gdGhpcy5lc2NhcGUoY29kZSk7XHJcblx0XHRcdHJldHVybiBgPHByZSBjbGFzcz1cImxpbmUtbnVtYmVyc1wiPjxjb2RlIGNsYXNzPVwibGFuZ3VhZ2UtJHtsYW5ndWFnZX1cIj4ke2hpZ2hsaWdodGVkfTwvY29kZT48L3ByZT5gO1xyXG5cdFx0fTtcclxuXHJcblx0XHRyZW5kZXJlci50YWJsZSA9IChoZWFkZXIsIGJvZHkpID0+IHtcclxuXHRcdFx0cmV0dXJuICc8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCBjb21wb2RvYy10YWJsZVwiPlxcbidcclxuXHRcdFx0XHQrICc8dGhlYWQ+XFxuJ1xyXG5cdFx0XHRcdCsgaGVhZGVyXHJcblx0XHRcdFx0KyAnPC90aGVhZD5cXG4nXHJcblx0XHRcdFx0KyAnPHRib2R5PlxcbidcclxuXHRcdFx0XHQrIGJvZHlcclxuXHRcdFx0XHQrICc8L3Rib2R5PlxcbidcclxuXHRcdFx0XHQrICc8L3RhYmxlPlxcbic7XHJcblx0XHR9O1xyXG5cclxuXHRcdGxldCBzZWxmID0gdGhpcztcclxuXHRcdHJlbmRlcmVyLmltYWdlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taW52YWxpZC10aGlzXHJcblx0XHRcdHNlbGYucmVuZGVySW1hZ2UuYXBwbHkoc2VsZiwgW3RoaXMsIC4uLl8uc2xpY2UoYXJndW1lbnRzIGFzIGFueSldKTtcclxuXHRcdH07XHJcblxyXG5cdFx0bWFya2VkLnNldE9wdGlvbnMoe1xyXG5cdFx0XHRyZW5kZXJlcjogcmVuZGVyZXIsXHJcblx0XHRcdGJyZWFrczogZmFsc2VcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJJbWFnZShjb250ZXh0LCBocmVmOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsIHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRsZXQgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCIgY2xhc3M9XCJpbWctcmVzcG9uc2l2ZVwiJztcclxuXHRcdGlmICh0aXRsZSkge1xyXG5cdFx0XHRvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XHJcblx0XHR9XHJcblx0XHRvdXQgKz0gY29udGV4dC5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcclxuXHRcdHJldHVybiBvdXQ7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZ2V0VHJhZGl0aW9uYWxNYXJrZG93bihmaWxlcGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdHJldHVybiB0aGlzLmZpbGVFbmdpbmUuZ2V0KHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGZpbGVwYXRoICsgJy5tZCcpXHJcblx0XHRcdC5jYXRjaChlcnIgPT4gdGhpcy5maWxlRW5naW5lLmdldChwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyBmaWxlcGF0aCkudGhlbigpKVxyXG5cdFx0XHQudGhlbihkYXRhID0+IG1hcmtlZChkYXRhKSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGdldFJlYWRtZUZpbGUoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdHJldHVybiB0aGlzLmZpbGVFbmdpbmUuZ2V0KHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArICdSRUFETUUubWQnKS50aGVuKGRhdGEgPT4gbWFya2VkKGRhdGEpKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZWFkTmVpZ2hib3VyUmVhZG1lRmlsZShmaWxlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0bGV0IGRpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZSk7XHJcblx0XHRsZXQgcmVhZG1lRmlsZSA9IGRpcm5hbWUgKyBwYXRoLnNlcCArIHBhdGguYmFzZW5hbWUoZmlsZSwgJy50cycpICsgJy5tZCc7XHJcblx0XHRyZXR1cm4gZnMucmVhZEZpbGVTeW5jKHJlYWRtZUZpbGUsICd1dGY4Jyk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgaGFzTmVpZ2hib3VyUmVhZG1lRmlsZShmaWxlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGxldCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGUpO1xyXG5cdFx0bGV0IHJlYWRtZUZpbGUgPSBkaXJuYW1lICsgcGF0aC5zZXAgKyBwYXRoLmJhc2VuYW1lKGZpbGUsICcudHMnKSArICcubWQnO1xyXG5cdFx0cmV0dXJuIHRoaXMuZmlsZUVuZ2luZS5leGlzdHNTeW5jKHJlYWRtZUZpbGUpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBjb21wb25lbnRSZWFkbWVGaWxlKGZpbGU6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRsZXQgZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlKTtcclxuXHRcdGxldCByZWFkbWVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgJ1JFQURNRS5tZCc7XHJcblx0XHRsZXQgcmVhZG1lQWx0ZXJuYXRpdmVGaWxlID0gZGlybmFtZSArIHBhdGguc2VwICsgcGF0aC5iYXNlbmFtZShmaWxlLCAnLnRzJykgKyAnLm1kJztcclxuXHRcdGxldCBmaW5hbFBhdGggPSAnJztcclxuXHRcdGlmICh0aGlzLmZpbGVFbmdpbmUuZXhpc3RzU3luYyhyZWFkbWVGaWxlKSkge1xyXG5cdFx0XHRmaW5hbFBhdGggPSByZWFkbWVGaWxlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZmluYWxQYXRoID0gcmVhZG1lQWx0ZXJuYXRpdmVGaWxlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZpbmFsUGF0aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyBpZiBhbnkgb2YgdGhlIG1hcmtkb3duIGZpbGVzIGlzIGV4aXN0cyB3aXRoIG9yIHdpdGhvdXQgZW5kaW5nc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBoYXNSb290TWFya2Rvd25zKCk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuYWRkRW5kaW5ncyh0aGlzLm1hcmtkb3duRmlsZXMpXHJcblx0XHRcdC5zb21lKHggPT4gdGhpcy5maWxlRW5naW5lLmV4aXN0c1N5bmMocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgeCkpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGxpc3RSb290TWFya2Rvd25zKCk6IHN0cmluZ1tdIHtcclxuXHRcdGxldCBmb3VuZEZpbGVzID0gdGhpcy5tYXJrZG93bkZpbGVzXHJcblx0XHRcdC5maWx0ZXIoeCA9PlxyXG5cdFx0XHRcdHRoaXMuZmlsZUVuZ2luZS5leGlzdHNTeW5jKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHggKyAnLm1kJykgfHxcclxuXHRcdFx0XHR0aGlzLmZpbGVFbmdpbmUuZXhpc3RzU3luYyhwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB4KSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuYWRkRW5kaW5ncyhmb3VuZEZpbGVzKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgZXNjYXBlKGh0bWw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gaHRtbFxyXG5cdFx0XHQucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG5cdFx0XHQucmVwbGFjZSgvPC9nLCAnJmx0OycpXHJcblx0XHRcdC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcclxuXHRcdFx0LnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxyXG5cdFx0XHQucmVwbGFjZSgvJy9nLCAnJiMzOTsnKVxyXG5cdFx0XHQucmVwbGFjZSgvQC9nLCAnJiM2NDsnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFsnUkVBRE1FJ10gPT4gWydSRUFETUUnLCAnUkVBRE1FLm1kJ11cclxuXHQgKi9cclxuXHRwcml2YXRlIGFkZEVuZGluZ3MoZmlsZXM6IEFycmF5PHN0cmluZz4pOiBBcnJheTxzdHJpbmc+IHtcclxuXHRcdHJldHVybiBfLmZsYXRNYXAoZmlsZXMsIHggPT4gW3gsIHggKyAnLm1kJ10pO1xyXG5cdH1cclxufVxyXG4iLCJleHBvcnQgY29uc3QgQ09NUE9ET0NfREVGQVVMVFMgPSB7XHJcbiAgICB0aXRsZTogJ0FwcGxpY2F0aW9uIGRvY3VtZW50YXRpb24nLFxyXG4gICAgYWRkaXRpb25hbEVudHJ5TmFtZTogJ0FkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbicsXHJcbiAgICBhZGRpdGlvbmFsRW50cnlQYXRoOiAnYWRkaXRpb25hbC1kb2N1bWVudGF0aW9uJyxcclxuICAgIGZvbGRlcjogJy4vZG9jdW1lbnRhdGlvbi8nLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIHRoZW1lOiAnZ2l0Ym9vaycsXHJcbiAgICBiYXNlOiAnLycsXHJcbiAgICBkZWZhdWx0Q292ZXJhZ2VUaHJlc2hvbGQ6IDcwLFxyXG4gICAgZGVmYXVsdENvdmVyYWdlTWluaW11bVBlckZpbGU6IDAsXHJcbiAgICB0b2dnbGVNZW51SXRlbXM6IFsnYWxsJ10sXHJcbiAgICBkaXNhYmxlU291cmNlQ29kZTogZmFsc2UsXHJcbiAgICBkaXNhYmxlR3JhcGg6IGZhbHNlLFxyXG4gICAgZGlzYWJsZU1haW5HcmFwaDogZmFsc2UsXHJcbiAgICBkaXNhYmxlQ292ZXJhZ2U6IGZhbHNlLFxyXG4gICAgZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydDogZmFsc2UsXHJcbiAgICBQQUdFX1RZUEVTOiB7XHJcbiAgICAgICAgUk9PVDogJ3Jvb3QnLFxyXG4gICAgICAgIElOVEVSTkFMOiAnaW50ZXJuYWwnXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgQ09NUE9ET0NfREVGQVVMVFMgfSBmcm9tICcuLi91dGlscy9kZWZhdWx0cyc7XHJcbmltcG9ydCB7IFBhZ2VJbnRlcmZhY2UgfSBmcm9tICcuL2ludGVyZmFjZXMvcGFnZS5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBNYWluRGF0YUludGVyZmFjZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9tYWluLWRhdGEuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWd1cmF0aW9uLmludGVyZmFjZSc7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uIGltcGxlbWVudHMgQ29uZmlndXJhdGlvbkludGVyZmFjZSB7XHJcbiAgICBwcml2YXRlIF9wYWdlczogUGFnZUludGVyZmFjZVtdID0gW107XHJcbiAgICBwcml2YXRlIF9tYWluRGF0YTogTWFpbkRhdGFJbnRlcmZhY2UgPSB7XHJcbiAgICAgICAgb3V0cHV0OiBDT01QT0RPQ19ERUZBVUxUUy5mb2xkZXIsXHJcbiAgICAgICAgdGhlbWU6IENPTVBPRE9DX0RFRkFVTFRTLnRoZW1lLFxyXG4gICAgICAgIGV4dFRoZW1lOiAnJyxcclxuICAgICAgICBzZXJ2ZTogZmFsc2UsXHJcbiAgICAgICAgcG9ydDogQ09NUE9ET0NfREVGQVVMVFMucG9ydCxcclxuICAgICAgICBvcGVuOiBmYWxzZSxcclxuICAgICAgICBhc3NldHNGb2xkZXI6ICcnLFxyXG4gICAgICAgIGRvY3VtZW50YXRpb25NYWluTmFtZTogQ09NUE9ET0NfREVGQVVMVFMudGl0bGUsXHJcbiAgICAgICAgZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbjogJycsXHJcbiAgICAgICAgYmFzZTogQ09NUE9ET0NfREVGQVVMVFMuYmFzZSxcclxuICAgICAgICBoaWRlR2VuZXJhdG9yOiBmYWxzZSxcclxuICAgICAgICBtb2R1bGVzOiBbXSxcclxuICAgICAgICByZWFkbWU6IGZhbHNlLFxyXG4gICAgICAgIGNoYW5nZWxvZzogJycsXHJcbiAgICAgICAgY29udHJpYnV0aW5nOiAnJyxcclxuICAgICAgICBsaWNlbnNlOiAnJyxcclxuICAgICAgICB0b2RvOiAnJyxcclxuICAgICAgICBtYXJrZG93bnM6IFtdLFxyXG4gICAgICAgIGFkZGl0aW9uYWxQYWdlczogW10sXHJcbiAgICAgICAgcGlwZXM6IFtdLFxyXG4gICAgICAgIGNsYXNzZXM6IFtdLFxyXG4gICAgICAgIGludGVyZmFjZXM6IFtdLFxyXG4gICAgICAgIGNvbXBvbmVudHM6IFtdLFxyXG4gICAgICAgIGRpcmVjdGl2ZXM6IFtdLFxyXG4gICAgICAgIGluamVjdGFibGVzOiBbXSxcclxuICAgICAgICBtaXNjZWxsYW5lb3VzOiBbXSxcclxuICAgICAgICByb3V0ZXM6IFtdLFxyXG4gICAgICAgIHRzY29uZmlnOiAnJyxcclxuICAgICAgICB0b2dnbGVNZW51SXRlbXM6IFtdLFxyXG4gICAgICAgIGluY2x1ZGVzOiAnJyxcclxuICAgICAgICBpbmNsdWRlc05hbWU6IENPTVBPRE9DX0RFRkFVTFRTLmFkZGl0aW9uYWxFbnRyeU5hbWUsXHJcbiAgICAgICAgaW5jbHVkZXNGb2xkZXI6IENPTVBPRE9DX0RFRkFVTFRTLmFkZGl0aW9uYWxFbnRyeVBhdGgsXHJcbiAgICAgICAgZGlzYWJsZVNvdXJjZUNvZGU6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVTb3VyY2VDb2RlLFxyXG4gICAgICAgIGRpc2FibGVHcmFwaDogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZUdyYXBoLFxyXG4gICAgICAgIGRpc2FibGVNYWluR3JhcGg6IENPTVBPRE9DX0RFRkFVTFRTLmRpc2FibGVNYWluR3JhcGgsXHJcbiAgICAgICAgZGlzYWJsZUNvdmVyYWdlOiBDT01QT0RPQ19ERUZBVUxUUy5kaXNhYmxlQ292ZXJhZ2UsXHJcbiAgICAgICAgZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydDogQ09NUE9ET0NfREVGQVVMVFMuZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCxcclxuICAgICAgICB3YXRjaDogZmFsc2UsXHJcbiAgICAgICAgbWFpbkdyYXBoOiAnJyxcclxuICAgICAgICBjb3ZlcmFnZVRlc3Q6IGZhbHNlLFxyXG4gICAgICAgIGNvdmVyYWdlVGVzdFRocmVzaG9sZDogQ09NUE9ET0NfREVGQVVMVFMuZGVmYXVsdENvdmVyYWdlVGhyZXNob2xkLFxyXG4gICAgICAgIGNvdmVyYWdlVGVzdFBlckZpbGU6IGZhbHNlLFxyXG4gICAgICAgIGNvdmVyYWdlTWluaW11bVBlckZpbGU6IENPTVBPRE9DX0RFRkFVTFRTLmRlZmF1bHRDb3ZlcmFnZU1pbmltdW1QZXJGaWxlLFxyXG4gICAgICAgIHJvdXRlc0xlbmd0aDogMCxcclxuICAgICAgICBhbmd1bGFyVmVyc2lvbjogJydcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGFkZFBhZ2UocGFnZTogUGFnZUludGVyZmFjZSkge1xyXG4gICAgICAgIGxldCBpbmRleFBhZ2UgPSBfLmZpbmRJbmRleCh0aGlzLl9wYWdlcywgeyAnbmFtZSc6IHBhZ2UubmFtZSB9KTtcclxuICAgICAgICBpZiAoaW5kZXhQYWdlID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkQWRkaXRpb25hbFBhZ2UocGFnZTogUGFnZUludGVyZmFjZSkge1xyXG4gICAgICAgIHRoaXMuX21haW5EYXRhLmFkZGl0aW9uYWxQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZXNldFBhZ2VzKCkge1xyXG4gICAgICAgIHRoaXMuX3BhZ2VzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0QWRkaXRpb25hbFBhZ2VzKCkge1xyXG4gICAgICAgIHRoaXMuX21haW5EYXRhLmFkZGl0aW9uYWxQYWdlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZXNldFJvb3RNYXJrZG93blBhZ2VzKCkge1xyXG4gICAgICAgIGxldCBpbmRleFBhZ2UgPSBfLmZpbmRJbmRleCh0aGlzLl9wYWdlcywgeyAnbmFtZSc6ICdpbmRleCcgfSk7XHJcbiAgICAgICAgdGhpcy5fcGFnZXMuc3BsaWNlKGluZGV4UGFnZSwgMSk7XHJcbiAgICAgICAgaW5kZXhQYWdlID0gXy5maW5kSW5kZXgodGhpcy5fcGFnZXMsIHsgJ25hbWUnOiAnY2hhbmdlbG9nJyB9KTtcclxuICAgICAgICB0aGlzLl9wYWdlcy5zcGxpY2UoaW5kZXhQYWdlLCAxKTtcclxuICAgICAgICBpbmRleFBhZ2UgPSBfLmZpbmRJbmRleCh0aGlzLl9wYWdlcywgeyAnbmFtZSc6ICdjb250cmlidXRpbmcnIH0pO1xyXG4gICAgICAgIHRoaXMuX3BhZ2VzLnNwbGljZShpbmRleFBhZ2UsIDEpO1xyXG4gICAgICAgIGluZGV4UGFnZSA9IF8uZmluZEluZGV4KHRoaXMuX3BhZ2VzLCB7ICduYW1lJzogJ2xpY2Vuc2UnIH0pO1xyXG4gICAgICAgIHRoaXMuX3BhZ2VzLnNwbGljZShpbmRleFBhZ2UsIDEpO1xyXG4gICAgICAgIGluZGV4UGFnZSA9IF8uZmluZEluZGV4KHRoaXMuX3BhZ2VzLCB7ICduYW1lJzogJ3RvZG8nIH0pO1xyXG4gICAgICAgIHRoaXMuX3BhZ2VzLnNwbGljZShpbmRleFBhZ2UsIDEpO1xyXG4gICAgICAgIHRoaXMuX21haW5EYXRhLm1hcmtkb3ducyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBwYWdlcygpOiBQYWdlSW50ZXJmYWNlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYWdlcztcclxuICAgIH1cclxuICAgIHNldCBwYWdlcyhwYWdlczogUGFnZUludGVyZmFjZVtdKSB7XHJcbiAgICAgICAgdGhpcy5fcGFnZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWFpbkRhdGEoKTogTWFpbkRhdGFJbnRlcmZhY2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYWluRGF0YTtcclxuICAgIH1cclxuICAgIHNldCBtYWluRGF0YShkYXRhOiBNYWluRGF0YUludGVyZmFjZSkge1xyXG4gICAgICAgIChPYmplY3QgYXMgYW55KS5hc3NpZ24odGhpcy5fbWFpbkRhdGEsIGRhdGEpO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIFNoZWxsanMgZnJvbSAnc2hlbGxqcyc7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuXHJcbmltcG9ydCBpc0dsb2JhbCBmcm9tICcuLi8uLi91dGlscy9nbG9iYWwucGF0aCc7XHJcbmltcG9ydCB7IERlcGVuZGVuY2llc0VuZ2luZSB9IGZyb20gJy4vZGVwZW5kZW5jaWVzLmVuZ2luZSc7XHJcbmltcG9ydCB7IEZpbGVFbmdpbmUgfSBmcm9tICcuL2ZpbGUuZW5naW5lJztcclxuXHJcbmNvbnN0IG5nZFQgPSByZXF1aXJlKCdAY29tcG9kb2MvbmdkLXRyYW5zZm9ybWVyJyk7XHJcblxyXG5leHBvcnQgY2xhc3MgTmdkRW5naW5lIHtcclxuICAgIHB1YmxpYyBlbmdpbmU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBkZXBlbmRlbmNpZXNFbmdpbmU6IERlcGVuZGVuY2llc0VuZ2luZSxcclxuICAgICAgICBwcml2YXRlIGZpbGVFbmdpbmU6IEZpbGVFbmdpbmUgPSBuZXcgRmlsZUVuZ2luZSgpKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KG91dHB1dHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IG5nZFQuRG90RW5naW5lKHtcclxuICAgICAgICAgICAgb3V0cHV0OiBvdXRwdXRwYXRoLFxyXG4gICAgICAgICAgICBkaXNwbGF5TGVnZW5kOiB0cnVlLFxyXG4gICAgICAgICAgICBvdXRwdXRGb3JtYXRzOiAnc3ZnJyxcclxuICAgICAgICAgICAgc2lsZW50OiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXJHcmFwaChmaWxlcGF0aDogc3RyaW5nLCBvdXRwdXRwYXRoOiBzdHJpbmcsIHR5cGU6IHN0cmluZywgbmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZW5naW5lLnVwZGF0ZU91dHB1dChvdXRwdXRwYXRoKTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGUgPT09ICdmJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbmdpbmUuZ2VuZXJhdGVHcmFwaChbdGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UmF3TW9kdWxlKG5hbWUpXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5naW5lLmdlbmVyYXRlR3JhcGgodGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUucmF3TW9kdWxlc0Zvck92ZXJ2aWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlYWRHcmFwaChmaWxlcGF0aDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVFbmdpbmVcclxuICAgICAgICAgICAgLmdldChmaWxlcGF0aClcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdCgnRXJyb3IgZHVyaW5nIGdyYXBoIHJlYWQgJyArIG5hbWUpKTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9jb25maWd1cmF0aW9uJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4uL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9maWxlLmVuZ2luZSc7XHJcblxyXG5jb25zdCBsdW5yOiBhbnkgPSByZXF1aXJlKCdsdW5yJyk7XHJcbmNvbnN0IGNoZWVyaW86IGFueSA9IHJlcXVpcmUoJ2NoZWVyaW8nKTtcclxuY29uc3QgRW50aXRpZXM6IGFueSA9IHJlcXVpcmUoJ2h0bWwtZW50aXRpZXMnKS5BbGxIdG1sRW50aXRpZXM7XHJcbmNvbnN0IEh0bWwgPSBuZXcgRW50aXRpZXMoKTtcclxuXHJcbmV4cG9ydCBjbGFzcyBTZWFyY2hFbmdpbmUge1xyXG4gICAgcHVibGljIHNlYXJjaEluZGV4OiBhbnk7XHJcbiAgICBwdWJsaWMgZG9jdW1lbnRzU3RvcmU6IE9iamVjdCA9IHt9O1xyXG4gICAgcHVibGljIGluZGV4U2l6ZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQ29uZmlndXJhdGlvbkludGVyZmFjZSxcclxuICAgICAgICBwcml2YXRlIGZpbGVFbmdpbmU6IEZpbGVFbmdpbmUgPSBuZXcgRmlsZUVuZ2luZSgpKSB7IH1cclxuXHJcbiAgICBwcml2YXRlIGdldFNlYXJjaEluZGV4KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5zZWFyY2hJbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaEluZGV4ID0gbHVucihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZigndXJsJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkKCd0aXRsZScsIHsgYm9vc3Q6IDEwIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZCgnYm9keScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoSW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluZGV4UGFnZShwYWdlKSB7XHJcbiAgICAgICAgbGV0IHRleHQ7XHJcbiAgICAgICAgbGV0ICQgPSBjaGVlcmlvLmxvYWQocGFnZS5yYXdEYXRhKTtcclxuXHJcbiAgICAgICAgdGV4dCA9ICQoJy5jb250ZW50JykuaHRtbCgpO1xyXG4gICAgICAgIHRleHQgPSBIdG1sLmRlY29kZSh0ZXh0KTtcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oPChbXj5dKyk+KS9pZywgJycpO1xyXG5cclxuICAgICAgICBwYWdlLnVybCA9IHBhZ2UudXJsLnJlcGxhY2UodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCwgJycpO1xyXG5cclxuICAgICAgICBsZXQgZG9jID0ge1xyXG4gICAgICAgICAgICB1cmw6IHBhZ2UudXJsLFxyXG4gICAgICAgICAgICB0aXRsZTogcGFnZS5pbmZvcy5jb250ZXh0ICsgJyAtICcgKyBwYWdlLmluZm9zLm5hbWUsXHJcbiAgICAgICAgICAgIGJvZHk6IHRleHRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnRzU3RvcmUuaGFzT3duUHJvcGVydHkoZG9jLnVybCkpIHtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudHNTdG9yZVtkb2MudXJsXSA9IGRvYztcclxuICAgICAgICAgICAgdGhpcy5nZXRTZWFyY2hJbmRleCgpLmFkZChkb2MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24ob3V0cHV0Rm9sZGVyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxlRW5naW5lLmdldChfX2Rpcm5hbWUgKyAnLy4uL3NyYy90ZW1wbGF0ZXMvcGFydGlhbHMvc2VhcmNoLWluZGV4LmhicycpLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZTogYW55ID0gSGFuZGxlYmFycy5jb21waWxlKGRhdGEpO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGVtcGxhdGUoe1xyXG4gICAgICAgICAgICAgICAgaW5kZXg6IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0U2VhcmNoSW5kZXgoKSksXHJcbiAgICAgICAgICAgICAgICBzdG9yZTogSlNPTi5zdHJpbmdpZnkodGhpcy5kb2N1bWVudHNTdG9yZSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGxldCB0ZXN0T3V0cHV0RGlyID0gb3V0cHV0Rm9sZGVyLm1hdGNoKHByb2Nlc3MuY3dkKCkpO1xyXG4gICAgICAgICAgICBpZiAoIXRlc3RPdXRwdXREaXIpIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dEZvbGRlciA9IG91dHB1dEZvbGRlci5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlRW5naW5lLndyaXRlKG91dHB1dEZvbGRlciArIHBhdGguc2VwICsgJy9qcy9zZWFyY2gvc2VhcmNoX2luZGV4LmpzJywgcmVzdWx0KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgc2VhcmNoIGluZGV4IGZpbGUgZ2VuZXJhdGlvbiAnLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgZXJyID0+IFByb21pc2UucmVqZWN0KCdFcnJvciBkdXJpbmcgc2VhcmNoIGluZGV4IGdlbmVyYXRpb24nKSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IGVudW0gQW5ndWxhckxpZmVjeWNsZUhvb2tzIHtcclxuICAgIG5nT25DaGFuZ2VzLFxyXG4gICAgbmdPbkluaXQsXHJcbiAgICBuZ0RvQ2hlY2ssXHJcbiAgICBuZ0FmdGVyQ29udGVudEluaXQsXHJcbiAgICBuZ0FmdGVyQ29udGVudENoZWNrZWQsXHJcbiAgICBuZ0FmdGVyVmlld0luaXQsXHJcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQsXHJcbiAgICBuZ09uRGVzdHJveVxyXG59XHJcbiIsImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuXHJcbmltcG9ydCB7IExpbmtQYXJzZXIgfSBmcm9tICcuL2xpbmstcGFyc2VyJztcclxuXHJcbmltcG9ydCB7IEFuZ3VsYXJMaWZlY3ljbGVIb29rcyB9IGZyb20gJy4vYW5ndWxhci1saWZlY3ljbGVzLWhvb2tzJztcclxuXHJcbmNvbnN0IHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpLFxyXG4gICAgICBnZXRDdXJyZW50RGlyZWN0b3J5ID0gdHMuc3lzLmdldEN1cnJlbnREaXJlY3RvcnksXHJcbiAgICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXMgPSB0cy5zeXMudXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcyxcclxuICAgICAgbmV3TGluZSA9IHRzLnN5cy5uZXdMaW5lLFxyXG4gICAgICBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKSxcclxuICAgICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE5ld0xpbmUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBuZXdMaW5lO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2Fub25pY2FsRmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcyA/IGZpbGVOYW1lIDogZmlsZU5hbWUudG9Mb3dlckNhc2UoKTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGZvcm1hdERpYWdub3N0aWNzSG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0ge1xyXG4gICAgZ2V0Q3VycmVudERpcmVjdG9yeSxcclxuICAgIGdldENhbm9uaWNhbEZpbGVOYW1lLFxyXG4gICAgZ2V0TmV3TGluZVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFya2VkdGFncyh0YWdzKSB7XHJcbiAgICB2YXIgbXRhZ3MgPSB0YWdzO1xyXG4gICAgXy5mb3JFYWNoKG10YWdzLCAodGFnKSA9PiB7XHJcbiAgICAgICAgdGFnLmNvbW1lbnQgPSBtYXJrZWQoTGlua1BhcnNlci5yZXNvbHZlTGlua3ModGFnLmNvbW1lbnQpKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG10YWdzO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVGFnc0FuZEFyZ3MoYXJncywganNkb2N0YWdzPykge1xyXG4gICAgdmFyIG1hcmdzID0gXy5jbG9uZURlZXAoYXJncyk7XHJcbiAgICBfLmZvckVhY2gobWFyZ3MsIChhcmcpID0+IHtcclxuICAgICAgICBhcmcudGFnTmFtZSA9IHtcclxuICAgICAgICAgICAgdGV4dDogJ3BhcmFtJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKGpzZG9jdGFncykge1xyXG4gICAgICAgICAgICBfLmZvckVhY2goanNkb2N0YWdzLCAoanNkb2N0YWcpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChqc2RvY3RhZy5uYW1lICYmIGpzZG9jdGFnLm5hbWUudGV4dCA9PT0gYXJnLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcmcudGFnTmFtZSA9IGpzZG9jdGFnLnRhZ05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnLm5hbWUgPSBqc2RvY3RhZy5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZy5jb21tZW50ID0ganNkb2N0YWcuY29tbWVudDtcclxuICAgICAgICAgICAgICAgICAgICBhcmcudHlwZUV4cHJlc3Npb24gPSBqc2RvY3RhZy50eXBlRXhwcmVzc2lvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvLyBBZGQgZXhhbXBsZSAmIHJldHVybnNcclxuICAgIGlmIChqc2RvY3RhZ3MpIHtcclxuICAgICAgICBfLmZvckVhY2goanNkb2N0YWdzLCAoanNkb2N0YWcpID0+IHtcclxuICAgICAgICAgICAgaWYgKGpzZG9jdGFnLnRhZ05hbWUgJiYganNkb2N0YWcudGFnTmFtZS50ZXh0ID09PSAnZXhhbXBsZScpIHtcclxuICAgICAgICAgICAgICAgIG1hcmdzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6IGpzZG9jdGFnLnRhZ05hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDoganNkb2N0YWcuY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGpzZG9jdGFnLnRhZ05hbWUgJiYganNkb2N0YWcudGFnTmFtZS50ZXh0ID09PSAncmV0dXJucycpIHtcclxuICAgICAgICAgICAgICAgIG1hcmdzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6IGpzZG9jdGFnLnRhZ05hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDoganNkb2N0YWcuY29tbWVudFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBtYXJncztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb25maWcoY29uZmlnRmlsZTogc3RyaW5nKTogYW55IHtcclxuICAgIGxldCByZXN1bHQgPSB0cy5yZWFkQ29uZmlnRmlsZShjb25maWdGaWxlLCB0cy5zeXMucmVhZEZpbGUpO1xyXG4gICAgaWYgKHJlc3VsdC5lcnJvcikge1xyXG4gICAgICAgIGxldCBtZXNzYWdlID0gdHMuZm9ybWF0RGlhZ25vc3RpY3MoW3Jlc3VsdC5lcnJvcl0sIGZvcm1hdERpYWdub3N0aWNzSG9zdCk7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdC5jb25maWc7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBCb20oc291cmNlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcclxuXHRcdHJldHVybiBzb3VyY2Uuc2xpY2UoMSk7XHJcblx0fVxyXG5cdCAgIHJldHVybiBzb3VyY2U7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNCb20oc291cmNlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoc291cmNlLmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVQYXRoKGZpbGVzOiBzdHJpbmdbXSwgY3dkOiBzdHJpbmcpOiBzdHJpbmdbXSB7XHJcbiAgICBsZXQgX2ZpbGVzID0gZmlsZXMsXHJcbiAgICAgICAgaSA9IDAsXHJcbiAgICAgICAgbGVuID0gZmlsZXMubGVuZ3RoO1xyXG5cclxuICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGZpbGVzW2ldLmluZGV4T2YoY3dkKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgZmlsZXNbaV0gPSBwYXRoLnJlc29sdmUoY3dkICsgcGF0aC5zZXAgKyBmaWxlc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBfZmlsZXM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGVhbkxpZmVjeWNsZUhvb2tzRnJvbU1ldGhvZHMobWV0aG9kcykge1xyXG4gICAgbGV0IHJlc3VsdCA9IFtdLFxyXG4gICAgICAgIGkgPSAwLFxyXG4gICAgICAgIGxlbiA9IG1ldGhvZHMubGVuZ3RoO1xyXG5cclxuICAgIGZvcihpOyBpPGxlbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCEobWV0aG9kc1tpXS5uYW1lIGluIEFuZ3VsYXJMaWZlY3ljbGVIb29rcykpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobWV0aG9kc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGVhblNvdXJjZXNGb3JXYXRjaChsaXN0KSB7XHJcbiAgICByZXR1cm4gbGlzdC5maWx0ZXIoKGVsZW1lbnQpID0+IHtcclxuICAgICAgICBpZihmcy5leGlzdHNTeW5jKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmFtZXNDb21wYXJlRm4obmFtZT8pIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXHJcbiAgICAgKi9cclxuICAgIG5hbWUgPSBuYW1lIHx8ICduYW1lJztcclxuICAgIGNvbnN0IHQgPSAoYSwgYikgPT4ge1xyXG4gICAgICAgIGlmIChhW25hbWVdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhW25hbWVdLmxvY2FsZUNvbXBhcmUoYltuYW1lXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiB0O1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcclxuXHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcclxuXHJcbmltcG9ydCB7IHN0cmlwQm9tLCBoYXNCb20gfSBmcm9tICcuL3V0aWxzL3V0aWxzJztcclxuXHJcbmNvbnN0IGNhcnJpYWdlUmV0dXJuTGluZUZlZWQgPSAnXFxyXFxuJyxcclxuICAgICAgbGluZUZlZWQgPSAnXFxuJyxcclxuICAgICAgdHMgPSByZXF1aXJlKCd0eXBlc2NyaXB0JyksXHJcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGVhbk5hbWVXaXRob3V0U3BhY2VBbmRUb0xvd2VyQ2FzZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8gL2csICctJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RJbmRlbnQoc3RyLCBjb3VudCwgaW5kZW50Pyk6IHN0cmluZyB7XHJcbiAgICBsZXQgc3RyaXBJbmRlbnQgPSBmdW5jdGlvbihzdHI6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKC9eWyBcXHRdKig/PVxcUykvZ20pO1xyXG5cclxuICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiB1c2Ugc3ByZWFkIG9wZXJhdG9yIHdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgNlxyXG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgubWluLmFwcGx5KE1hdGgsIG1hdGNoLm1hcCh4ID0+IHgubGVuZ3RoKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoYF5bIFxcXFx0XXske2luZGVudH19YCwgJ2dtJyk7XHJcblxyXG4gICAgICAgIHJldHVybiBpbmRlbnQgPiAwID8gc3RyLnJlcGxhY2UocmUsICcnKSA6IHN0cjtcclxuICAgIH0sXHJcbiAgICAgICAgcmVwZWF0aW5nID0gZnVuY3Rpb24obiwgc3RyKSB7XHJcbiAgICAgICAgc3RyID0gc3RyID09PSB1bmRlZmluZWQgPyAnICcgOiBzdHI7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIHN0cn1cXGBgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuIDwgMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIHBvc2l0aXZlIGZpbml0ZSBudW1iZXIsIGdvdCBcXGAke259XFxgYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmV0ID0gJyc7XHJcblxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXQgKz0gc3RyO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdHIgKz0gc3RyO1xyXG4gICAgICAgIH0gd2hpbGUgKChuID4+PSAxKSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9LFxyXG4gICAgaW5kZW50U3RyaW5nID0gZnVuY3Rpb24oc3RyLCBjb3VudCwgaW5kZW50KSB7XHJcbiAgICAgICAgaW5kZW50ID0gaW5kZW50ID09PSB1bmRlZmluZWQgPyAnICcgOiBpbmRlbnQ7XHJcbiAgICAgICAgY291bnQgPSBjb3VudCA9PT0gdW5kZWZpbmVkID8gMSA6IGNvdW50O1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJ9XFxgYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGNvdW50ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBjb3VudFxcYCB0byBiZSBhIFxcYG51bWJlclxcYCwgZ290IFxcYCR7dHlwZW9mIGNvdW50fVxcYGApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbmRlbnQgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYGluZGVudFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIGluZGVudH1cXGBgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5kZW50ID0gY291bnQgPiAxID8gcmVwZWF0aW5nKGNvdW50LCBpbmRlbnQpIDogaW5kZW50O1xyXG5cclxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL14oPyFcXHMqJCkvbWcsIGluZGVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGluZGVudFN0cmluZyhzdHJpcEluZGVudChzdHIpLCBjb3VudCB8fCAwLCBpbmRlbnQpO1xyXG59XHJcblxyXG4vLyBDcmVhdGUgYSBjb21waWxlckhvc3Qgb2JqZWN0IHRvIGFsbG93IHRoZSBjb21waWxlciB0byByZWFkIGFuZCB3cml0ZSBmaWxlc1xyXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnM6IGFueSk6IHRzLkNvbXBpbGVySG9zdCB7XHJcblxyXG4gICAgY29uc3QgaW5wdXRGaWxlTmFtZSA9IHRyYW5zcGlsZU9wdGlvbnMuZmlsZU5hbWUgfHwgKHRyYW5zcGlsZU9wdGlvbnMuanN4ID8gJ21vZHVsZS50c3gnIDogJ21vZHVsZS50cycpO1xyXG5cclxuICAgIGNvbnN0IGNvbXBpbGVySG9zdDogdHMuQ29tcGlsZXJIb3N0ID0ge1xyXG4gICAgICAgIGdldFNvdXJjZUZpbGU6IChmaWxlTmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZmlsZU5hbWUubGFzdEluZGV4T2YoJy50cycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnbGliLmQudHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZS5zdWJzdHIoLTUpID09PSAnLmQudHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5pc0Fic29sdXRlKGZpbGVOYW1lKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IHBhdGguam9pbih0cmFuc3BpbGVPcHRpb25zLnRzY29uZmlnRGlyZWN0b3J5LCBmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbGliU291cmNlID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBsaWJTb3VyY2UgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZU5hbWUpLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNCb20obGliU291cmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaWJTb3VyY2UgPSBzdHJpcEJvbShsaWJTb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoZSwgZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCBsaWJTb3VyY2UsIHRyYW5zcGlsZU9wdGlvbnMudGFyZ2V0LCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdyaXRlRmlsZTogKG5hbWUsIHRleHQpID0+IHt9LFxyXG4gICAgICAgIGdldERlZmF1bHRMaWJGaWxlTmFtZTogKCkgPT4gJ2xpYi5kLnRzJyxcclxuICAgICAgICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzOiAoKSA9PiBmYWxzZSxcclxuICAgICAgICBnZXRDYW5vbmljYWxGaWxlTmFtZTogZmlsZU5hbWUgPT4gZmlsZU5hbWUsXHJcbiAgICAgICAgZ2V0Q3VycmVudERpcmVjdG9yeTogKCkgPT4gJycsXHJcbiAgICAgICAgZ2V0TmV3TGluZTogKCkgPT4gJ1xcbicsXHJcbiAgICAgICAgZmlsZUV4aXN0czogKGZpbGVOYW1lKTogYm9vbGVhbiA9PiBmaWxlTmFtZSA9PT0gaW5wdXRGaWxlTmFtZSxcclxuICAgICAgICByZWFkRmlsZTogKCkgPT4gJycsXHJcbiAgICAgICAgZGlyZWN0b3J5RXhpc3RzOiAoKSA9PiB0cnVlLFxyXG4gICAgICAgIGdldERpcmVjdG9yaWVzOiAoKSA9PiBbXVxyXG4gICAgfTtcclxuICAgIHJldHVybiBjb21waWxlckhvc3Q7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kTWFpblNvdXJjZUZvbGRlcihmaWxlczogc3RyaW5nW10pIHtcclxuICAgIGxldCBtYWluRm9sZGVyID0gJycsXHJcbiAgICAgICAgbWFpbkZvbGRlckNvdW50ID0gMCxcclxuICAgICAgICByYXdGb2xkZXJzID0gZmlsZXMubWFwKChmaWxlcGF0aCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgc2hvcnRQYXRoID0gZmlsZXBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAsICcnKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhdGguZGlybmFtZShzaG9ydFBhdGgpO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIGZvbGRlcnMgPSB7fSxcclxuICAgICAgICBpID0gMDtcclxuICAgIHJhd0ZvbGRlcnMgPSBfLnVuaXEocmF3Rm9sZGVycyk7XHJcbiAgICBsZXQgbGVuID0gcmF3Rm9sZGVycy5sZW5ndGg7XHJcbiAgICBmb3IoaTsgaTxsZW47IGkrKyl7XHJcbiAgICAgICAgbGV0IHNlcCA9IHJhd0ZvbGRlcnNbaV0uc3BsaXQocGF0aC5zZXApO1xyXG4gICAgICAgIHNlcC5tYXAoKGZvbGRlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZm9sZGVyc1tmb2xkZXJdKSB7XHJcbiAgICAgICAgICAgICAgICBmb2xkZXJzW2ZvbGRlcl0gKz0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvbGRlcnNbZm9sZGVyXSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgZiBpbiBmb2xkZXJzKSB7XHJcbiAgICAgICAgaWYoZm9sZGVyc1tmXSA+IG1haW5Gb2xkZXJDb3VudCkge1xyXG4gICAgICAgICAgICBtYWluRm9sZGVyQ291bnQgPSBmb2xkZXJzW2ZdO1xyXG4gICAgICAgICAgICBtYWluRm9sZGVyID0gZjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFpbkZvbGRlcjtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIEhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyJztcclxuaW1wb3J0IHsgRmlsZUVuZ2luZSB9IGZyb20gJy4uL2FwcC9lbmdpbmVzL2ZpbGUuZW5naW5lJztcclxuXHJcbmNvbnN0IEpTT041ID0gcmVxdWlyZSgnanNvbjUnKTtcclxuXHJcbmV4cG9ydCBsZXQgUm91dGVyUGFyc2VyID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBsZXQgcm91dGVzOiBhbnlbXSA9IFtdO1xyXG4gICAgbGV0IGluY29tcGxldGVSb3V0ZXMgPSBbXTtcclxuICAgIGxldCBtb2R1bGVzID0gW107XHJcbiAgICBsZXQgbW9kdWxlc1RyZWU7XHJcbiAgICBsZXQgcm9vdE1vZHVsZTtcclxuICAgIGxldCBjbGVhbk1vZHVsZXNUcmVlO1xyXG4gICAgbGV0IG1vZHVsZXNXaXRoUm91dGVzID0gW107XHJcblxyXG4gICAgY29uc3QgZmlsZUVuZ2luZSA9IG5ldyBGaWxlRW5naW5lKCk7XHJcblxyXG4gICAgbGV0IF9hZGRSb3V0ZSA9IGZ1bmN0aW9uIChyb3V0ZSkge1xyXG4gICAgICAgIHJvdXRlcy5wdXNoKHJvdXRlKTtcclxuICAgICAgICByb3V0ZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKHJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgX2FkZEluY29tcGxldGVSb3V0ZSA9IGZ1bmN0aW9uIChyb3V0ZSkge1xyXG4gICAgICAgIGluY29tcGxldGVSb3V0ZXMucHVzaChyb3V0ZSk7XHJcbiAgICAgICAgaW5jb21wbGV0ZVJvdXRlcyA9IF8uc29ydEJ5KF8udW5pcVdpdGgoaW5jb21wbGV0ZVJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgX2FkZE1vZHVsZVdpdGhSb3V0ZXMgPSBmdW5jdGlvbiAobW9kdWxlTmFtZSwgbW9kdWxlSW1wb3J0cywgZmlsZW5hbWUpIHtcclxuICAgICAgICBtb2R1bGVzV2l0aFJvdXRlcy5wdXNoKHtcclxuICAgICAgICAgICAgbmFtZTogbW9kdWxlTmFtZSxcclxuICAgICAgICAgICAgaW1wb3J0c05vZGU6IG1vZHVsZUltcG9ydHMsXHJcbiAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1vZHVsZXNXaXRoUm91dGVzID0gXy5zb3J0QnkoXy51bmlxV2l0aChtb2R1bGVzV2l0aFJvdXRlcywgXy5pc0VxdWFsKSwgWyduYW1lJ10pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgX2FkZE1vZHVsZSA9IGZ1bmN0aW9uIChtb2R1bGVOYW1lOiBzdHJpbmcsIG1vZHVsZUltcG9ydHMpIHtcclxuICAgICAgICBtb2R1bGVzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiBtb2R1bGVOYW1lLFxyXG4gICAgICAgICAgICBpbXBvcnRzTm9kZTogbW9kdWxlSW1wb3J0c1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1vZHVsZXMgPSBfLnNvcnRCeShfLnVuaXFXaXRoKG1vZHVsZXMsIF8uaXNFcXVhbCksIFsnbmFtZSddKTtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IF9jbGVhblJhd1JvdXRlUGFyc2VkID0gZnVuY3Rpb24gKHJvdXRlOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgcm91dGVzV2l0aG91dFNwYWNlcyA9IHJvdXRlLnJlcGxhY2UoLyAvZ20sICcnKTtcclxuICAgICAgICBsZXQgdGVzdFRyYWlsaW5nQ29tbWEgPSByb3V0ZXNXaXRob3V0U3BhY2VzLmluZGV4T2YoJ30sXScpO1xyXG4gICAgICAgIGlmICh0ZXN0VHJhaWxpbmdDb21tYSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcm91dGVzV2l0aG91dFNwYWNlcyA9IHJvdXRlc1dpdGhvdXRTcGFjZXMucmVwbGFjZSgnfSxdJywgJ31dJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBKU09ONS5wYXJzZShyb3V0ZXNXaXRob3V0U3BhY2VzKTtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IF9jbGVhblJhd1JvdXRlID0gZnVuY3Rpb24gKHJvdXRlOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgcm91dGVzV2l0aG91dFNwYWNlcyA9IHJvdXRlLnJlcGxhY2UoLyAvZ20sICcnKTtcclxuICAgICAgICBsZXQgdGVzdFRyYWlsaW5nQ29tbWEgPSByb3V0ZXNXaXRob3V0U3BhY2VzLmluZGV4T2YoJ30sXScpO1xyXG4gICAgICAgIGlmICh0ZXN0VHJhaWxpbmdDb21tYSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcm91dGVzV2l0aG91dFNwYWNlcyA9IHJvdXRlc1dpdGhvdXRTcGFjZXMucmVwbGFjZSgnfSxdJywgJ31dJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByb3V0ZXNXaXRob3V0U3BhY2VzO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgX3NldFJvb3RNb2R1bGUgPSBmdW5jdGlvbiAobW9kdWxlOiBzdHJpbmcpIHtcclxuICAgICAgICByb290TW9kdWxlID0gbW9kdWxlO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgX2hhc1JvdXRlck1vZHVsZUluSW1wb3J0cyA9IGZ1bmN0aW9uIChpbXBvcnRzKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBsZW4gPSBpbXBvcnRzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChpbXBvcnRzW2ldLm5hbWUuaW5kZXhPZignUm91dGVyTW9kdWxlLmZvckNoaWxkJykgIT09IC0xIHx8XHJcbiAgICAgICAgICAgICAgICBpbXBvcnRzW2ldLm5hbWUuaW5kZXhPZignUm91dGVyTW9kdWxlLmZvclJvb3QnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IF9maXhJbmNvbXBsZXRlUm91dGVzID0gZnVuY3Rpb24gKG1pc2NlbGxhbmVvdXNWYXJpYWJsZXMpIHtcclxuICAgICAgICAvKmNvbnNvbGUubG9nKCdmaXhJbmNvbXBsZXRlUm91dGVzJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJvdXRlcyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJycpOyovXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cobWlzY2VsbGFuZW91c1ZhcmlhYmxlcyk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJycpO1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICBsZXQgbGVuID0gaW5jb21wbGV0ZVJvdXRlcy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IG1hdGNoaW5nVmFyaWFibGVzID0gW107XHJcbiAgICAgICAgLy8gRm9yIGVhY2ggaW5jb21wbGV0ZVJvdXRlLCBzY2FuIGlmIG9uZSBtaXNjIHZhcmlhYmxlIGlzIGluIGNvZGVcclxuICAgICAgICAvLyBpZiBvaywgdHJ5IHJlY3JlYXRpbmcgY29tcGxldGUgcm91dGVcclxuICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgaiA9IDA7XHJcbiAgICAgICAgICAgIGxldCBsZW5nID0gbWlzY2VsbGFuZW91c1ZhcmlhYmxlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAoajsgaiA8IGxlbmc7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluY29tcGxldGVSb3V0ZXNbaV0uZGF0YS5pbmRleE9mKG1pc2NlbGxhbmVvdXNWYXJpYWJsZXNbal0ubmFtZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZvdW5kIG9uZSBtaXNjIHZhciBpbnNpZGUgaW5jb21wbGV0ZVJvdXRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWlzY2VsbGFuZW91c1ZhcmlhYmxlc1tqXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaGluZ1ZhcmlhYmxlcy5wdXNoKG1pc2NlbGxhbmVvdXNWYXJpYWJsZXNbal0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENsZWFuIGluY29tcGxldGVSb3V0ZVxyXG4gICAgICAgICAgICBpbmNvbXBsZXRlUm91dGVzW2ldLmRhdGEgPSBpbmNvbXBsZXRlUm91dGVzW2ldLmRhdGEucmVwbGFjZSgnWycsICcnKTtcclxuICAgICAgICAgICAgaW5jb21wbGV0ZVJvdXRlc1tpXS5kYXRhID0gaW5jb21wbGV0ZVJvdXRlc1tpXS5kYXRhLnJlcGxhY2UoJ10nLCAnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qY29uc29sZS5sb2coaW5jb21wbGV0ZVJvdXRlcyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKG1hdGNoaW5nVmFyaWFibGVzKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnJyk7Ki9cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBfbGlua01vZHVsZXNBbmRSb3V0ZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2xpbmtNb2R1bGVzQW5kUm91dGVzOiAnKTtcclxuICAgICAgICAvL3NjYW4gZWFjaCBtb2R1bGUgaW1wb3J0cyBBU1QgZm9yIGVhY2ggcm91dGVzLCBhbmQgbGluayByb3V0ZXMgd2l0aCBtb2R1bGVcclxuICAgICAgICBjb25zb2xlLmxvZygnbGlua01vZHVsZXNBbmRSb3V0ZXMgcm91dGVzOiAnLCByb3V0ZXMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCcnKTsqL1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICBsZXQgbGVuID0gbW9kdWxlc1dpdGhSb3V0ZXMubGVuZ3RoO1xyXG4gICAgICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIF8uZm9yRWFjaChtb2R1bGVzV2l0aFJvdXRlc1tpXS5pbXBvcnRzTm9kZSwgZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmluaXRpYWxpemVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIGVsZW1lbnQgd2l0aCBhcmd1bWVudHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmFyZ3VtZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50LmFyZ3VtZW50cywgZnVuY3Rpb24gKGFyZ3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChyb3V0ZXMsIGZ1bmN0aW9uIChyb3V0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50LnRleHQgJiYgcm91dGUubmFtZSA9PT0gYXJndW1lbnQudGV4dCAmJiByb3V0ZS5maWxlbmFtZSA9PT0gbW9kdWxlc1dpdGhSb3V0ZXNbaV0uZmlsZW5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5tb2R1bGUgPSBtb2R1bGVzV2l0aFJvdXRlc1tpXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUgPSBmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xyXG4gICAgICAgIHJldHVybiBfLmZpbmQocm91dGVzLCB7ICdtb2R1bGUnOiBtb2R1bGVOYW1lIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgZm91bmRMYXp5TW9kdWxlV2l0aFBhdGggPSBmdW5jdGlvbiAocGF0aCkge1xyXG4gICAgICAgIC8vIHBhdGggaXMgbGlrZSBhcHAvY3VzdG9tZXJzL2N1c3RvbWVycy5tb2R1bGUjQ3VzdG9tZXJzTW9kdWxlXHJcbiAgICAgICAgbGV0IHNwbGl0ID0gcGF0aC5zcGxpdCgnIycpO1xyXG4gICAgICAgIGxldCBsYXp5TW9kdWxlUGF0aCA9IHNwbGl0WzBdO1xyXG4gICAgICAgIGxldCBsYXp5TW9kdWxlTmFtZSA9IHNwbGl0WzFdO1xyXG4gICAgICAgIHJldHVybiBsYXp5TW9kdWxlTmFtZTtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IF9jb25zdHJ1Y3RSb3V0ZXNUcmVlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCcnKTtcclxuICAgICAgICAvKmNvbnNvbGUubG9nKCdjb25zdHJ1Y3RSb3V0ZXNUcmVlIG1vZHVsZXM6ICcsIG1vZHVsZXMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCcnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnY29uc3RydWN0Um91dGVzVHJlZSBtb2R1bGVzV2l0aFJvdXRlczogJywgbW9kdWxlc1dpdGhSb3V0ZXMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCcnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnY29uc3RydWN0Um91dGVzVHJlZSBtb2R1bGVzVHJlZTogJywgdXRpbC5pbnNwZWN0KG1vZHVsZXNUcmVlLCB7IGRlcHRoOiAxMCB9KSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJycpOyovXHJcblxyXG4gICAgICAgIC8vIHJvdXRlc1tdIGNvbnRhaW5zIHJvdXRlcyB3aXRoIG1vZHVsZSBsaW5rXHJcbiAgICAgICAgLy8gbW9kdWxlc1RyZWUgY29udGFpbnMgbW9kdWxlcyB0cmVlXHJcbiAgICAgICAgLy8gbWFrZSBhIGZpbmFsIHJvdXRlcyB0cmVlIHdpdGggdGhhdFxyXG4gICAgICAgIGNsZWFuTW9kdWxlc1RyZWUgPSBfLmNsb25lRGVlcChtb2R1bGVzVHJlZSk7XHJcblxyXG4gICAgICAgIGxldCBtb2R1bGVzQ2xlYW5lciA9IGZ1bmN0aW9uIChhcnIpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSBpbiBhcnIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcnJbaV0uaW1wb3J0c05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXJyW2ldLmltcG9ydHNOb2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGFycltpXS5wYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXJyW2ldLnBhcmVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChhcnJbaV0uY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVzQ2xlYW5lcihhcnJbaV0uY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBtb2R1bGVzQ2xlYW5lcihjbGVhbk1vZHVsZXNUcmVlKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnJyk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJyAgY2xlYW5Nb2R1bGVzVHJlZSBsaWdodDogJywgdXRpbC5pbnNwZWN0KGNsZWFuTW9kdWxlc1RyZWUsIHsgZGVwdGg6IDEwIH0pKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnJyk7XHJcblxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJvdXRlcyk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJycpO1xyXG5cclxuICAgICAgICBsZXQgcm91dGVzVHJlZSA9IHtcclxuICAgICAgICAgICAgbmFtZTogJzxyb290PicsXHJcbiAgICAgICAgICAgIGtpbmQ6ICdtb2R1bGUnLFxyXG4gICAgICAgICAgICBjbGFzc05hbWU6IHJvb3RNb2R1bGUsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBsb29wTW9kdWxlc1BhcnNlciA9IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgbW9kdWxlIGhhcyBjaGlsZCBtb2R1bGVzXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnICAgSWYgbW9kdWxlIGhhcyBjaGlsZCBtb2R1bGVzJyk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpIGluIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobm9kZS5jaGlsZHJlbltpXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUgJiYgcm91dGUuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5jaGlsZHJlbiA9IEpTT041LnBhcnNlKHJvdXRlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgcm91dGUuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUua2luZCA9ICdtb2R1bGUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXNUcmVlLmNoaWxkcmVuLnB1c2gocm91dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbltpXS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb29wTW9kdWxlc1BhcnNlcihub2RlLmNoaWxkcmVuW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBlbHNlIHJvdXRlcyBhcmUgZGlyZWN0bHkgaW5zaWRlIHRoZSBtb2R1bGVcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCcgICBlbHNlIHJvdXRlcyBhcmUgZGlyZWN0bHkgaW5zaWRlIHRoZSByb290IG1vZHVsZScpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJhd1JvdXRlcyA9IGZvdW5kUm91dGVXaXRoTW9kdWxlTmFtZShub2RlLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJhd1JvdXRlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZXMgPSBKU09ONS5wYXJzZShyYXdSb3V0ZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW4gPSByb3V0ZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdXRlID0gcm91dGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlc1tpXS5jb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXNUcmVlLmNoaWxkcmVuLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAnY29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiByb3V0ZXNbaV0uY29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiByb3V0ZXNbaV0ucGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCcnKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnICByb290TW9kdWxlOiAnLCByb290TW9kdWxlKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnJyk7XHJcblxyXG4gICAgICAgIGxldCBzdGFydE1vZHVsZSA9IF8uZmluZChjbGVhbk1vZHVsZXNUcmVlLCB7ICduYW1lJzogcm9vdE1vZHVsZSB9KTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXJ0TW9kdWxlKSB7XHJcbiAgICAgICAgICAgIGxvb3BNb2R1bGVzUGFyc2VyKHN0YXJ0TW9kdWxlKTtcclxuICAgICAgICAgICAgLy8gTG9vcCB0d2ljZSBmb3Igcm91dGVzIHdpdGggbGF6eSBsb2FkaW5nXHJcbiAgICAgICAgICAgIC8vIGxvb3BNb2R1bGVzUGFyc2VyKHJvdXRlc1RyZWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJyAgcm91dGVzVHJlZTogJywgcm91dGVzVHJlZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJycpOyovXHJcblxyXG4gICAgICAgIGxldCBjbGVhbmVkUm91dGVzVHJlZSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgbGV0IGNsZWFuUm91dGVzVHJlZSA9IGZ1bmN0aW9uIChyb3V0ZSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpIGluIHJvdXRlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcm91dGVzID0gcm91dGUuY2hpbGRyZW5baV0ucm91dGVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByb3V0ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjbGVhbmVkUm91dGVzVHJlZSA9IGNsZWFuUm91dGVzVHJlZShyb3V0ZXNUcmVlKTtcclxuXHJcbiAgICAgICAgLy8gVHJ5IHVwZGF0aW5nIHJvdXRlcyB3aXRoIGxhenkgbG9hZGluZ1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCcnKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnVHJ5IHVwZGF0aW5nIHJvdXRlcyB3aXRoIGxhenkgbG9hZGluZycpO1xyXG5cclxuICAgICAgICBsZXQgbG9vcFJvdXRlc1BhcnNlciA9IGZ1bmN0aW9uIChyb3V0ZSkge1xyXG4gICAgICAgICAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgaW4gcm91dGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUuY2hpbGRyZW5baV0ubG9hZENoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IGZvdW5kTGF6eU1vZHVsZVdpdGhQYXRoKHJvdXRlLmNoaWxkcmVuW2ldLmxvYWRDaGlsZHJlbiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGUgPSBfLmZpbmQoY2xlYW5Nb2R1bGVzVHJlZSwgeyAnbmFtZSc6IGNoaWxkIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX3Jhd01vZHVsZTogYW55ID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmF3TW9kdWxlLmtpbmQgPSAnbW9kdWxlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUuY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUubW9kdWxlID0gbW9kdWxlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9vcEluc2lkZSA9IGZ1bmN0aW9uIChtb2QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgaW4gbW9kLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGUgPSBmb3VuZFJvdXRlV2l0aE1vZHVsZU5hbWUobW9kLmNoaWxkcmVuW2ldLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByb3V0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUuZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZS5jaGlsZHJlbiA9IEpTT041LnBhcnNlKHJvdXRlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgcm91dGUuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUua2luZCA9ICdtb2R1bGUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmF3TW9kdWxlLmNoaWxkcmVuLnB1c2gocm91dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wSW5zaWRlKG1vZHVsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGUuY2hpbGRyZW5baV0uY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlLmNoaWxkcmVuW2ldLmNoaWxkcmVuLnB1c2goX3Jhd01vZHVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbG9vcFJvdXRlc1BhcnNlcihyb3V0ZS5jaGlsZHJlbltpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGxvb3BSb3V0ZXNQYXJzZXIoY2xlYW5lZFJvdXRlc1RyZWUpO1xyXG5cclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnJyk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJyAgY2xlYW5lZFJvdXRlc1RyZWU6ICcsIHV0aWwuaW5zcGVjdChjbGVhbmVkUm91dGVzVHJlZSwgeyBkZXB0aDogMTAgfSkpO1xyXG5cclxuICAgICAgICByZXR1cm4gY2xlYW5lZFJvdXRlc1RyZWU7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBfY29uc3RydWN0TW9kdWxlc1RyZWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJycpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdjb25zdHJ1Y3RNb2R1bGVzVHJlZScpO1xyXG4gICAgICAgIGxldCBnZXROZXN0ZWRDaGlsZHJlbiA9IGZ1bmN0aW9uIChhcnIsIHBhcmVudD8pIHtcclxuICAgICAgICAgICAgbGV0IG91dCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpIGluIGFycikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFycltpXS5wYXJlbnQgPT09IHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IGdldE5lc3RlZENoaWxkcmVuKGFyciwgYXJyW2ldLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyW2ldLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG91dC5wdXNoKGFycltpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG91dDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIFNjYW4gZWFjaCBtb2R1bGUgYW5kIGFkZCBwYXJlbnQgcHJvcGVydHlcclxuICAgICAgICBfLmZvckVhY2gobW9kdWxlcywgZnVuY3Rpb24gKGZpcnN0TG9vcE1vZHVsZSkge1xyXG4gICAgICAgICAgICBfLmZvckVhY2goZmlyc3RMb29wTW9kdWxlLmltcG9ydHNOb2RlLCBmdW5jdGlvbiAoaW1wb3J0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKG1vZHVsZXMsIGZ1bmN0aW9uIChtb2R1bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlLm5hbWUgPT09IGltcG9ydE5vZGUubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGUucGFyZW50ID0gZmlyc3RMb29wTW9kdWxlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1vZHVsZXNUcmVlID0gZ2V0TmVzdGVkQ2hpbGRyZW4obW9kdWxlcyk7XHJcbiAgICAgICAgLypjb25zb2xlLmxvZygnJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2VuZCBjb25zdHJ1Y3RNb2R1bGVzVHJlZScpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKG1vZHVsZXNUcmVlKTsqL1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgX2dlbmVyYXRlUm91dGVzSW5kZXggPSAob3V0cHV0Rm9sZGVyLCByb3V0ZXMpID0+IHtcclxuICAgICAgICByZXR1cm4gZmlsZUVuZ2luZS5nZXQoX19kaXJuYW1lICsgJy8uLi9zcmMvdGVtcGxhdGVzL3BhcnRpYWxzL3JvdXRlcy1pbmRleC5oYnMnKS50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdGVtcGxhdGU6IGFueSA9IEhhbmRsZWJhcnMuY29tcGlsZShkYXRhKTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRlbXBsYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICByb3V0ZXM6IEpTT04uc3RyaW5naWZ5KHJvdXRlcylcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBsZXQgdGVzdE91dHB1dERpciA9IG91dHB1dEZvbGRlci5tYXRjaChwcm9jZXNzLmN3ZCgpKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGVzdE91dHB1dERpcikge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0Rm9sZGVyID0gb3V0cHV0Rm9sZGVyLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmlsZUVuZ2luZS53cml0ZShvdXRwdXRGb2xkZXIgKyBwYXRoLnNlcCArICcvanMvcm91dGVzL3JvdXRlc19pbmRleC5qcycsIHJlc3VsdCk7XHJcbiAgICAgICAgfSwgZXJyID0+IFByb21pc2UucmVqZWN0KCdFcnJvciBkdXJpbmcgcm91dGVzIGluZGV4IGdlbmVyYXRpb24nKSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBfcm91dGVzTGVuZ3RoID0gZnVuY3Rpb24gKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IF9uID0gMDtcclxuXHJcbiAgICAgICAgbGV0IHJvdXRlc1BhcnNlciA9IGZ1bmN0aW9uIChyb3V0ZSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJvdXRlLnBhdGggIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBfbiArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyb3V0ZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiBpbiByb3V0ZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdXRlc1BhcnNlcihyb3V0ZS5jaGlsZHJlbltqXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpIGluIHJvdXRlcykge1xyXG4gICAgICAgICAgICByb3V0ZXNQYXJzZXIocm91dGVzW2ldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBfbjtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbmNvbXBsZXRlUm91dGVzOiBpbmNvbXBsZXRlUm91dGVzLFxyXG4gICAgICAgIGFkZFJvdXRlOiBfYWRkUm91dGUsXHJcbiAgICAgICAgYWRkSW5jb21wbGV0ZVJvdXRlOiBfYWRkSW5jb21wbGV0ZVJvdXRlLFxyXG4gICAgICAgIGFkZE1vZHVsZVdpdGhSb3V0ZXM6IF9hZGRNb2R1bGVXaXRoUm91dGVzLFxyXG4gICAgICAgIGFkZE1vZHVsZTogX2FkZE1vZHVsZSxcclxuICAgICAgICBjbGVhblJhd1JvdXRlUGFyc2VkOiBfY2xlYW5SYXdSb3V0ZVBhcnNlZCxcclxuICAgICAgICBjbGVhblJhd1JvdXRlOiBfY2xlYW5SYXdSb3V0ZSxcclxuICAgICAgICBzZXRSb290TW9kdWxlOiBfc2V0Um9vdE1vZHVsZSxcclxuICAgICAgICBwcmludFJvdXRlczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcmludFJvdXRlczogJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJvdXRlcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmludE1vZHVsZXNSb3V0ZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncHJpbnRNb2R1bGVzUm91dGVzOiAnKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobW9kdWxlc1dpdGhSb3V0ZXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm91dGVzTGVuZ3RoOiBfcm91dGVzTGVuZ3RoLFxyXG4gICAgICAgIGhhc1JvdXRlck1vZHVsZUluSW1wb3J0czogX2hhc1JvdXRlck1vZHVsZUluSW1wb3J0cyxcclxuICAgICAgICBmaXhJbmNvbXBsZXRlUm91dGVzOiBfZml4SW5jb21wbGV0ZVJvdXRlcyxcclxuICAgICAgICBsaW5rTW9kdWxlc0FuZFJvdXRlczogX2xpbmtNb2R1bGVzQW5kUm91dGVzLFxyXG4gICAgICAgIGNvbnN0cnVjdFJvdXRlc1RyZWU6IF9jb25zdHJ1Y3RSb3V0ZXNUcmVlLFxyXG4gICAgICAgIGNvbnN0cnVjdE1vZHVsZXNUcmVlOiBfY29uc3RydWN0TW9kdWxlc1RyZWUsXHJcbiAgICAgICAgZ2VuZXJhdGVSb3V0ZXNJbmRleDogX2dlbmVyYXRlUm91dGVzSW5kZXhcclxuICAgIH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvZGVHZW5lcmF0b3Ige1xyXG4gICAgcHVibGljIGdlbmVyYXRlKG5vZGU6IHRzLk5vZGUpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0QW5kUmVjb2duaXplKG5vZGUsIFtdKS5qb2luKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZpc2l0QW5kUmVjb2duaXplKG5vZGU6IHRzLk5vZGUsIGNvZGU6IEFycmF5PHN0cmluZz4sIGRlcHRoID0gMCk6IEFycmF5PHN0cmluZz4ge1xyXG4gICAgICAgIHRoaXMucmVjb2duaXplKG5vZGUsIGNvZGUpO1xyXG4gICAgICAgIG5vZGUuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKGMgPT4gdGhpcy52aXNpdEFuZFJlY29nbml6ZShjLCBjb2RlLCBkZXB0aCArIDEpKTtcclxuICAgICAgICByZXR1cm4gY29kZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlY29nbml6ZShub2RlOiB0cy5Ob2RlLCBjb2RlOiBBcnJheTxzdHJpbmc+KSB7XHJcbiAgICAgICAgY29uc3QgY29udmVyc2lvbiA9IFRzS2luZENvbnZlcnNpb24uZmluZCh4ID0+IHgua2luZHMuc29tZSh6ID0+IHogPT09IG5vZGUua2luZCkpO1xyXG5cclxuICAgICAgICBpZiAoY29udmVyc2lvbikge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjb252ZXJzaW9uLm91dHB1dChub2RlKTtcclxuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2godGV4dCA9PiB0aGlzLmdlbih0ZXh0LCBjb2RlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2VuKHRva2VuOiBzdHJpbmcgfCB1bmRlZmluZWQsIGNvZGU6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRva2VuKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0b2tlbiA9PT0gJ1xcbicpIHtcclxuICAgICAgICAgICAgY29kZS5wdXNoKCcnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2RlLnB1c2godG9rZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVHNLaW5kc1RvVGV4dCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgb3V0cHV0OiAobm9kZTogdHMuTm9kZSkgPT4gQXJyYXk8c3RyaW5nPixcclxuICAgICAgICBwdWJsaWMga2luZHM6IEFycmF5PGFueT4pIHsgfVxyXG59XHJcblxyXG5jb25zdCBUc0tpbmRDb252ZXJzaW9uOiBBcnJheTxUc0tpbmRzVG9UZXh0PiA9IFtcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWydcXFwiJywgbm9kZS50ZXh0LCAnXFxcIiddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkZpcnN0TGl0ZXJhbFRva2VuLCB0cy5TeW50YXhLaW5kLklkZW50aWZpZXJdKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWydcXFwiJywgbm9kZS50ZXh0LCAnXFxcIiddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWxdKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gW10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbl0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJ2ltcG9ydCcsICcgJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuSW1wb3J0S2V5d29yZF0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJ2Zyb20nLCAnICddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkZyb21LZXl3b3JkXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFsnXFxuJywgJ2V4cG9ydCcsICcgJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZF0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJ2NsYXNzJywgJyAnXSxcclxuICAgICAgICBbdHMuU3ludGF4S2luZC5DbGFzc0tleXdvcmRdKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWyd0aGlzJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuVGhpc0tleXdvcmRdKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWydjb25zdHJ1Y3RvciddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yS2V5d29yZF0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJ2ZhbHNlJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFsndHJ1ZSddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFsnbnVsbCddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFtdLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkF0VG9rZW5dKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWycrJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuUGx1c1Rva2VuXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFsnID0+ICddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW5dKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWycoJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuT3BlblBhcmVuVG9rZW5dKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWyd7JywgJyAnXSxcclxuICAgICAgICBbdHMuU3ludGF4S2luZC5JbXBvcnRDbGF1c2UsIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb25dKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWyd7JywgJ1xcbiddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkJsb2NrXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFsnfSddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkNsb3NlQnJhY2VUb2tlbl0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJyknXSxcclxuICAgICAgICBbdHMuU3ludGF4S2luZC5DbG9zZVBhcmVuVG9rZW5dKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWydbJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuT3BlbkJyYWNrZXRUb2tlbl0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJ10nXSxcclxuICAgICAgICBbdHMuU3ludGF4S2luZC5DbG9zZUJyYWNrZXRUb2tlbl0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJzsnLCAnXFxuJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuU2VtaWNvbG9uVG9rZW5dKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWycsJywgJyAnXSxcclxuICAgICAgICBbdHMuU3ludGF4S2luZC5Db21tYVRva2VuXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFsnICcsICc6JywgJyAnXSxcclxuICAgICAgICBbdHMuU3ludGF4S2luZC5Db2xvblRva2VuXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFsnLiddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkRvdFRva2VuXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFtdLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkRvU3RhdGVtZW50XSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFtdLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkRlY29yYXRvcl0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJyA9ICddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudF0pLFxyXG4gICAgbmV3IFRzS2luZHNUb1RleHQoXHJcbiAgICAgICAgbm9kZSA9PiBbJyAnXSxcclxuICAgICAgICBbdHMuU3ludGF4S2luZC5GaXJzdFB1bmN0dWF0aW9uXSksXHJcbiAgICBuZXcgVHNLaW5kc1RvVGV4dChcclxuICAgICAgICBub2RlID0+IFsncHJpdmF0ZScsICcgJ10sXHJcbiAgICAgICAgW3RzLlN5bnRheEtpbmQuUHJpdmF0ZUtleXdvcmRdKSxcclxuICAgIG5ldyBUc0tpbmRzVG9UZXh0KFxyXG4gICAgICAgIG5vZGUgPT4gWydwdWJsaWMnLCAnICddLFxyXG4gICAgICAgIFt0cy5TeW50YXhLaW5kLlB1YmxpY0tleXdvcmRdKVxyXG5cclxuXTtcclxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9maWxlLmVuZ2luZSc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XHJcblxyXG5jb25zdCAkOiBhbnkgPSByZXF1aXJlKCdjaGVlcmlvJyk7XHJcblxyXG5jbGFzcyBDb21wb25lbnRzVHJlZUVuZ2luZSB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IENvbXBvbmVudHNUcmVlRW5naW5lID0gbmV3IENvbXBvbmVudHNUcmVlRW5naW5lKCk7XHJcbiAgICBwcml2YXRlIGNvbXBvbmVudHM6IGFueVtdID0gW107XHJcbiAgICBwcml2YXRlIGNvbXBvbmVudHNGb3JUcmVlOiBhbnlbXSA9IFtdO1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBmaWxlRW5naW5lOiBGaWxlRW5naW5lID0gbmV3IEZpbGVFbmdpbmUoKSkge1xyXG4gICAgICAgIGlmIChDb21wb25lbnRzVHJlZUVuZ2luZS5faW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvcjogSW5zdGFudGlhdGlvbiBmYWlsZWQ6IFVzZSBDb21wb25lbnRzVHJlZUVuZ2luZS5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBDb21wb25lbnRzVHJlZUVuZ2luZS5faW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogQ29tcG9uZW50c1RyZWVFbmdpbmUge1xyXG4gICAgICAgIHJldHVybiBDb21wb25lbnRzVHJlZUVuZ2luZS5faW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZENvbXBvbmVudChjb21wb25lbnQpIHtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVhZFRlbXBsYXRlcygpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSB0aGlzLmNvbXBvbmVudHNGb3JUcmVlLmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IGxvb3AgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA8PSBsZW4gLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0udGVtcGxhdGVVcmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVQYXRoID0gcHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgcGF0aC5kaXJuYW1lKHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0uZmlsZSkgKyBwYXRoLnNlcCArIHRoaXMuY29tcG9uZW50c0ZvclRyZWVbaV0udGVtcGxhdGVVcmw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZUVuZ2luZS5nZXQoZmlsZVBhdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigodGVtcGxhdGVEYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzRm9yVHJlZVtpXS50ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzRm9yVHJlZVtpXS50ZW1wbGF0ZURhdGEgPSB0aGlzLmNvbXBvbmVudHNGb3JUcmVlW2ldLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmluZENoaWxkcmVuQW5kUGFyZW50cygpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb21wb25lbnRzRm9yVHJlZSwgKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0ICRjb21wb25lbnQgPSAkKGNvbXBvbmVudC50ZW1wbGF0ZURhdGEpO1xyXG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29tcG9uZW50c0ZvclRyZWUsIChjb21wb25lbnRUb0ZpbmQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJGNvbXBvbmVudC5maW5kKGNvbXBvbmVudFRvRmluZC5zZWxlY3RvcikubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb21wb25lbnRUb0ZpbmQubmFtZSArICcgZm91bmQgaW4gJyArIGNvbXBvbmVudC5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LmNoaWxkcmVuLnB1c2goY29tcG9uZW50VG9GaW5kLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlVHJlZXNGb3JDb21wb25lbnRzKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbXBvbmVudHMsIChjb21wb25lbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBfY29tcG9uZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGU6IGNvbXBvbmVudC5maWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBjb21wb25lbnQuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJydcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBvbmVudC50ZW1wbGF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBfY29tcG9uZW50LnRlbXBsYXRlID0gY29tcG9uZW50LnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZVVybC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX2NvbXBvbmVudC50ZW1wbGF0ZVVybCA9IGNvbXBvbmVudC50ZW1wbGF0ZVVybFswXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50c0ZvclRyZWUucHVzaChfY29tcG9uZW50KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZFRlbXBsYXRlcygpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5kQ2hpbGRyZW5BbmRQYXJlbnRzKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMuY29tcG9uZW50c0ZvclRyZWU6ICcsIHRoaXMuY29tcG9uZW50c0ZvclRyZWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0ICRjb21wb25lbnRzVHJlZUVuZ2luZSA9IENvbXBvbmVudHNUcmVlRW5naW5lLmdldEluc3RhbmNlKCk7XHJcbiIsImltcG9ydCB7IElEZXAgfSBmcm9tICcuLi9kZXBlbmRlbmNpZXMuaW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IENvbXBvbmVudEhlbHBlciB9IGZyb20gJy4vaGVscGVycy9jb21wb25lbnQtaGVscGVyJztcclxuaW1wb3J0IHsgTnNNb2R1bGVDYWNoZSB9IGZyb20gJy4vaGVscGVycy9zeW1ib2wtaGVscGVyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVEZXBGYWN0b3J5IHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaGVscGVyOiBDb21wb25lbnRIZWxwZXIpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZShmaWxlOiBhbnksIHNyY0ZpbGU6IGFueSwgbmFtZTogYW55LCBwcm9wczogYW55LCBJTzogYW55KTogSURpcmVjdGl2ZURlcCB7XHJcbiAgICAgICAgbGV0IGRpcmVjdGl2ZURlcHM6IElEaXJlY3RpdmVEZXAgPSB7XHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIGlkOiAnZGlyZWN0aXZlLScgKyBuYW1lICsgJy0nICsgRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgZmlsZTogZmlsZSxcclxuICAgICAgICAgICAgdHlwZTogJ2RpcmVjdGl2ZScsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgc291cmNlQ29kZTogc3JjRmlsZS5nZXRUZXh0KCksXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wcyksXHJcbiAgICAgICAgICAgIHByb3ZpZGVyczogdGhpcy5oZWxwZXIuZ2V0Q29tcG9uZW50UHJvdmlkZXJzKHByb3BzKSxcclxuXHJcbiAgICAgICAgICAgIGlucHV0c0NsYXNzOiBJTy5pbnB1dHMsXHJcbiAgICAgICAgICAgIG91dHB1dHNDbGFzczogSU8ub3V0cHV0cyxcclxuXHJcbiAgICAgICAgICAgIGhvc3RCaW5kaW5nczogSU8uaG9zdEJpbmRpbmdzLFxyXG4gICAgICAgICAgICBob3N0TGlzdGVuZXJzOiBJTy5ob3N0TGlzdGVuZXJzLFxyXG5cclxuICAgICAgICAgICAgcHJvcGVydGllc0NsYXNzOiBJTy5wcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICBtZXRob2RzQ2xhc3M6IElPLm1ldGhvZHMsXHJcbiAgICAgICAgICAgIGV4YW1wbGVVcmxzOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRFeGFtcGxlVXJscyhzcmNGaWxlLmdldFRleHQoKSlcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZGlyZWN0aXZlRGVwcy5qc2RvY3RhZ3MgPSBJTy5qc2RvY3RhZ3NbMF0udGFncztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKElPLmltcGxlbWVudHMgJiYgSU8uaW1wbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGRpcmVjdGl2ZURlcHMuaW1wbGVtZW50cyA9IElPLmltcGxlbWVudHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChJTy5jb25zdHJ1Y3Rvcikge1xyXG4gICAgICAgICAgICBkaXJlY3RpdmVEZXBzLmNvbnN0cnVjdG9yT2JqID0gSU8uY29uc3RydWN0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmVEZXBzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEaXJlY3RpdmVEZXAgZXh0ZW5kcyBJRGVwIHtcclxuICAgIGZpbGU6IGFueTtcclxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XHJcbiAgICBzb3VyY2VDb2RlOiBzdHJpbmc7XHJcblxyXG4gICAgc2VsZWN0b3I6IHN0cmluZztcclxuICAgIHByb3ZpZGVyczogQXJyYXk8YW55PjtcclxuXHJcbiAgICBpbnB1dHNDbGFzczogYW55O1xyXG4gICAgb3V0cHV0c0NsYXNzOiBhbnk7XHJcblxyXG4gICAgaG9zdEJpbmRpbmdzOiBhbnk7XHJcbiAgICBob3N0TGlzdGVuZXJzOiBhbnk7XHJcblxyXG4gICAgcHJvcGVydGllc0NsYXNzOiBhbnk7XHJcbiAgICBtZXRob2RzQ2xhc3M6IGFueTtcclxuICAgIGV4YW1wbGVVcmxzOiBBcnJheTxzdHJpbmc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yT2JqPzogT2JqZWN0O1xyXG4gICAganNkb2N0YWdzPzogQXJyYXk8c3RyaW5nPjtcclxuICAgIGltcGxlbWVudHM/OiBhbnk7XHJcbn0iLCJpbXBvcnQgeyBOb2RlT2JqZWN0IH0gZnJvbSAnLi4vLi4vbm9kZS1vYmplY3QuaW50ZXJmYWNlJztcclxuY29uc3QgdHMgPSByZXF1aXJlKCd0eXBlc2NyaXB0Jyk7XHJcblxyXG5leHBvcnQgY2xhc3MgTnNNb2R1bGVDYWNoZSB7XHJcbiAgICBwcml2YXRlIGNhY2hlOiBNYXA8c3RyaW5nLCBBcnJheTxzdHJpbmc+PiA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICBwdWJsaWMgc2V0T3JBZGQoa2V5OiBzdHJpbmcsIHRvU2V0T3JBZGQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY2FjaGUuZ2V0KGtleSk7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2godG9TZXRPckFkZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jYWNoZS5zZXQoa2V5LCBbdG9TZXRPckFkZF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN5bWJvbEhlbHBlciB7XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHVua25vd24gPSAnPz8/JztcclxuXHJcblxyXG4gICAgcHVibGljIHBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWU6IHN0cmluZywgY2FjaGU6IE5zTW9kdWxlQ2FjaGUpOiBhbnkge1xyXG4gICAgICAgIGxldCBuc01vZHVsZSA9IG5hbWUuc3BsaXQoJy4nKTtcclxuICAgICAgICBsZXQgdHlwZSA9IHRoaXMuZ2V0VHlwZShuYW1lKTtcclxuICAgICAgICBpZiAobnNNb2R1bGUubGVuZ3RoID4gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8gY2FjaGUgZGVwcyB3aXRoIHRoZSBzYW1lIG5hbWVzcGFjZSAoaS5lIFNoYXJlZC4qKVxyXG4gICAgICAgICAgICBjYWNoZS5zZXRPckFkZChuc01vZHVsZVswXSwgbmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBuczogbnNNb2R1bGVbMF0sXHJcbiAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0VHlwZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCB0eXBlO1xyXG4gICAgICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY29tcG9uZW50JykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHR5cGUgPSAnY29tcG9uZW50JztcclxuICAgICAgICB9IGVsc2UgaWYgKG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdwaXBlJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHR5cGUgPSAncGlwZSc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignbW9kdWxlJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHR5cGUgPSAnbW9kdWxlJztcclxuICAgICAgICB9IGVsc2UgaWYgKG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdkaXJlY3RpdmUnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdHlwZSA9ICdkaXJlY3RpdmUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0U3ltYm9sRGVwcyhwcm9wczogTm9kZU9iamVjdFtdLCB0eXBlOiBzdHJpbmcsIG11bHRpTGluZT86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XHJcblxyXG4gICAgICAgIGlmIChwcm9wcy5sZW5ndGggPT09IDApIHsgcmV0dXJuIFtdOyB9XHJcblxyXG4gICAgICAgIGxldCBkZXBzID0gcHJvcHMuZmlsdGVyKChub2RlOiBOb2RlT2JqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dCA9PT0gdHlwZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IHBhcnNlU3ltYm9sVGV4dCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHRleHRcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYnVpbGRJZGVudGlmaWVyTmFtZSA9IChub2RlOiBOb2RlT2JqZWN0LCBuYW1lID0gJycpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24pIHtcclxuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lID8gYC4ke25hbWV9YCA6IG5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVOYW1lID0gdGhpcy51bmtub3duO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5uYW1lLnRleHQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUudGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmV4cHJlc3Npb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbi50ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gbm9kZS5leHByZXNzaW9uLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmV4cHJlc3Npb24uZWxlbWVudHMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24ua2luZCA9PT0gdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZSA9IG5vZGUuZXhwcmVzc2lvbi5lbGVtZW50cy5tYXAoZWwgPT4gZWwudGV4dCkuam9pbignLCAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lID0gYFske25vZGVOYW1lfV1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlNwcmVhZEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYC4uLiR7bm9kZU5hbWV9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtidWlsZElkZW50aWZpZXJOYW1lKG5vZGUuZXhwcmVzc2lvbiwgbm9kZU5hbWUpfSR7bmFtZX1gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYCR7bm9kZS50ZXh0fS4ke25hbWV9YDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgcGFyc2VQcm92aWRlckNvbmZpZ3VyYXRpb24gPSAobzogTm9kZU9iamVjdCk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIC8vIHBhcnNlIGV4cHJlc3Npb25zIHN1Y2ggYXM6XHJcbiAgICAgICAgICAgIC8vIHsgcHJvdmlkZTogQVBQX0JBU0VfSFJFRiwgdXNlVmFsdWU6ICcvJyB9LFxyXG4gICAgICAgICAgICAvLyBvclxyXG4gICAgICAgICAgICAvLyB7IHByb3ZpZGU6ICdEYXRlJywgdXNlRmFjdG9yeTogKGQxLCBkMikgPT4gbmV3IERhdGUoKSwgZGVwczogWydkMScsICdkMiddIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBfZ2VuUHJvdmlkZXJOYW1lOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgX3Byb3ZpZGVyUHJvcHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgICAgICAgICAoby5wcm9wZXJ0aWVzIHx8IFtdKS5mb3JFYWNoKChwcm9wOiBOb2RlT2JqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSAnJztcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wLmluaXRpYWxpemVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IHByb3AuaW5pdGlhbGl6ZXIudGV4dDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAnJHtpZGVudGlmaWVyfSdgO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGFtYmRhIGZ1bmN0aW9uIChpLmUgdXNlRmFjdG9yeSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC5pbml0aWFsaXplci5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbXMgPSAocHJvcC5pbml0aWFsaXplci5wYXJhbWV0ZXJzIHx8IFtdIGFzIGFueSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKHBhcmFtczE6IE5vZGVPYmplY3QpID0+IHBhcmFtczEubmFtZS50ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGAoJHtwYXJhbXMuam9pbignLCAnKX0pID0+IHt9YDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3AuaW5pdGlhbGl6ZXIuZWxlbWVudHMpIHsgLy8gZmFjdG9yeSBkZXBzIGFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbGVtZW50cyA9IChwcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzIHx8IFtdKS5tYXAoKG46IE5vZGVPYmplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobi5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCcke24udGV4dH0nYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbi50ZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllciA9IGBbJHtlbGVtZW50cy5qb2luKCcsICcpfV1gO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBfcHJvdmlkZXJQcm9wcy5wdXNoKFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lIHByb3ZpZGVcclxuICAgICAgICAgICAgICAgICAgICBwcm9wLm5hbWUudGV4dCxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaS5lIE9wYXF1ZVRva2VuIG9yICdTdHJpbmdUb2tlbidcclxuICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVyXHJcblxyXG4gICAgICAgICAgICAgICAgXS5qb2luKCc6ICcpKTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGB7ICR7X3Byb3ZpZGVyUHJvcHMuam9pbignLCAnKX0gfWA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHBhcnNlU3ltYm9sRWxlbWVudHMgPSAobzogTm9kZU9iamVjdCB8IGFueSk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIC8vIHBhcnNlIGV4cHJlc3Npb25zIHN1Y2ggYXM6IEFuZ3VsYXJGaXJlTW9kdWxlLmluaXRpYWxpemVBcHAoZmlyZWJhc2VDb25maWcpXHJcbiAgICAgICAgICAgIGlmIChvLmFyZ3VtZW50cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGJ1aWxkSWRlbnRpZmllck5hbWUoby5leHByZXNzaW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbiBhcmd1bWVudHMgY291bGQgYmUgcmVhbGx5IGNvbXBsZXhlLiBUaGVyZSBhcmUgc29cclxuICAgICAgICAgICAgICAgIC8vIG1hbnkgdXNlIGNhc2VzIHRoYXQgd2UgY2FuJ3QgaGFuZGxlLiBKdXN0IHByaW50IFwiYXJnc1wiIHRvIGluZGljYXRlXHJcbiAgICAgICAgICAgICAgICAvLyB0aGF0IHdlIGhhdmUgYXJndW1lbnRzLlxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBmdW5jdGlvbkFyZ3MgPSBvLmFyZ3VtZW50cy5sZW5ndGggPiAwID8gJ2FyZ3MnIDogJyc7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9IGAke2NsYXNzTmFtZX0oJHtmdW5jdGlvbkFyZ3N9KWA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvLmV4cHJlc3Npb24pIHsgLy8gcGFyc2UgZXhwcmVzc2lvbnMgc3VjaCBhczogU2hhcmVkLk1vZHVsZVxyXG4gICAgICAgICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSBidWlsZElkZW50aWZpZXJOYW1lKG8pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkZW50aWZpZXI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvLnRleHQgPyBvLnRleHQgOiBwYXJzZVByb3ZpZGVyQ29uZmlndXJhdGlvbihvKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgcGFyc2VTeW1ib2xzID0gKG5vZGU6IE5vZGVPYmplY3QpOiBzdHJpbmdbXSA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IG5vZGUuaW5pdGlhbGl6ZXIudGV4dDtcclxuICAgICAgICAgICAgaWYgKHRleHQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVN5bWJvbFRleHQodGV4dCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWRlbnRpZmllciA9IHBhcnNlU3ltYm9sRWxlbWVudHMobm9kZS5pbml0aWFsaXplcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXJcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5pbml0aWFsaXplci5lbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuaW5pdGlhbGl6ZXIuZWxlbWVudHMubWFwKHBhcnNlU3ltYm9sRWxlbWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGRlcHMubWFwKHBhcnNlU3ltYm9scykucG9wKCkgfHwgW107XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFN5bWJvbERlcHNSYXcocHJvcHM6IE5vZGVPYmplY3RbXSwgdHlwZTogc3RyaW5nLCBtdWx0aUxpbmU/OiBib29sZWFuKTogYW55IHtcclxuICAgICAgICBsZXQgZGVwcyA9IHByb3BzLmZpbHRlcigobm9kZTogTm9kZU9iamVjdCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQgPT09IHR5cGU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRlcHMgfHwgW107XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcclxuaW1wb3J0IHsgU3ltYm9sSGVscGVyLCBOc01vZHVsZUNhY2hlIH0gZnJvbSAnLi9zeW1ib2wtaGVscGVyJztcclxuaW1wb3J0IHsgTm9kZU9iamVjdCB9IGZyb20gJy4uLy4uL25vZGUtb2JqZWN0LmludGVyZmFjZSc7XHJcbmltcG9ydCB7IGRldGVjdEluZGVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxpdGllcyc7XHJcbmltcG9ydCB7IElEZXAsIERlcHMgfSBmcm9tICcuLi8uLi9kZXBlbmRlbmNpZXMuaW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7IENsYXNzSGVscGVyIH0gZnJvbSAnLi9jbGFzcy1oZWxwZXInO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRIZWxwZXIge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBtb2R1bGVDYWNoZTogTnNNb2R1bGVDYWNoZSxcclxuICAgICAgICBwcml2YXRlIGNsYXNzSGVscGVyOiBDbGFzc0hlbHBlcixcclxuICAgICAgICBwcml2YXRlIHN5bWJvbEhlbHBlcjogU3ltYm9sSGVscGVyID0gbmV3IFN5bWJvbEhlbHBlcigpKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRDaGFuZ2VEZXRlY3Rpb24ocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sSGVscGVyLmdldFN5bWJvbERlcHMocHJvcHMsICdjaGFuZ2VEZXRlY3Rpb24nKS5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50RW5jYXBzdWxhdGlvbihwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbEhlbHBlci5nZXRTeW1ib2xEZXBzKHByb3BzLCAnZW5jYXBzdWxhdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRFeHBvcnRBcyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2xIZWxwZXIuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2V4cG9ydEFzJykucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvbXBvbmVudEhvc3QocHJvcHM6IE5vZGVPYmplY3RbXSk6IE9iamVjdCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3ltYm9sRGVwc09iamVjdChwcm9wcywgJ2hvc3QnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50SW5wdXRzTWV0YWRhdGEocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2xIZWxwZXIuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2lucHV0cycpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgdCA9IHRoaXMuc3ltYm9sSGVscGVyLmdldFN5bWJvbERlcHMocHJvcHMsICd0ZW1wbGF0ZScsIHRydWUpLnBvcCgpO1xyXG4gICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgIHQgPSBkZXRlY3RJbmRlbnQodCwgMCk7XHJcbiAgICAgICAgICAgIHQgPSB0LnJlcGxhY2UoL1xcbi8sICcnKTtcclxuICAgICAgICAgICAgdCA9IHQucmVwbGFjZSgvICskL2dtLCAnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRTdHlsZVVybHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZVVybHModGhpcy5zeW1ib2xIZWxwZXIuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3N0eWxlVXJscycpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50U3R5bGVzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sSGVscGVyLmdldFN5bWJvbERlcHMocHJvcHMsICdzdHlsZXMnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50TW9kdWxlSWQocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sSGVscGVyLmdldFN5bWJvbERlcHMocHJvcHMsICdtb2R1bGVJZCcpLnBvcCgpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50T3V0cHV0cyhwcm9wczogTm9kZU9iamVjdFtdKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbEhlbHBlci5nZXRTeW1ib2xEZXBzKHByb3BzLCAnb3V0cHV0cycpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sSGVscGVyXHJcbiAgICAgICAgICAgIC5nZXRTeW1ib2xEZXBzKHByb3BzLCAncHJvdmlkZXJzJylcclxuICAgICAgICAgICAgLm1hcCgobmFtZSkgPT4gdGhpcy5zeW1ib2xIZWxwZXIucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSwgdGhpcy5tb2R1bGVDYWNoZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRWaWV3UHJvdmlkZXJzKHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbEhlbHBlclxyXG4gICAgICAgICAgICAuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ3ZpZXdQcm92aWRlcnMnKVxyXG4gICAgICAgICAgICAubWFwKChuYW1lKSA9PiB0aGlzLnN5bWJvbEhlbHBlci5wYXJzZURlZXBJbmRlbnRpZmllcihuYW1lLCB0aGlzLm1vZHVsZUNhY2hlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvbXBvbmVudFRlbXBsYXRlVXJsKHByb3BzOiBBcnJheTxOb2RlT2JqZWN0Pik6IEFycmF5PHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbEhlbHBlci5nZXRTeW1ib2xEZXBzKHByb3BzLCAndGVtcGxhdGVVcmwnKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRFeGFtcGxlVXJscyh0ZXh0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+IHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBsZXQgZXhhbXBsZVVybHNNYXRjaGVzID0gdGV4dC5tYXRjaCgvPGV4YW1wbGUtdXJsPiguKj8pPFxcL2V4YW1wbGUtdXJsPi9nKTtcclxuICAgICAgICBsZXQgZXhhbXBsZVVybHMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKGV4YW1wbGVVcmxzTWF0Y2hlcyAmJiBleGFtcGxlVXJsc01hdGNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGV4YW1wbGVVcmxzID0gZXhhbXBsZVVybHNNYXRjaGVzLm1hcChmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsLnJlcGxhY2UoLzxcXC8/ZXhhbXBsZS11cmw+L2csICcnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBleGFtcGxlVXJscztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50U2VsZWN0b3IocHJvcHM6IE5vZGVPYmplY3RbXSk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sSGVscGVyLmdldFN5bWJvbERlcHMocHJvcHMsICdzZWxlY3RvcicpLnBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRTeW1ib2xEZXBzT2JqZWN0KHByb3BzOiBOb2RlT2JqZWN0W10sIHR5cGU6IHN0cmluZywgbXVsdGlMaW5lPzogYm9vbGVhbik6IE9iamVjdCB7XHJcbiAgICAgICAgbGV0IGRlcHMgPSBwcm9wcy5maWx0ZXIoKG5vZGU6IE5vZGVPYmplY3QpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmFtZS50ZXh0ID09PSB0eXBlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgcGFyc2VQcm9wZXJ0aWVzID0gKG5vZGU6IE5vZGVPYmplY3QpOiBPYmplY3QgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb2JqID0ge307XHJcbiAgICAgICAgICAgIChub2RlLmluaXRpYWxpemVyLnByb3BlcnRpZXMgfHwgW10pLmZvckVhY2goKHByb3A6IE5vZGVPYmplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIG9ialtwcm9wLm5hbWUudGV4dF0gPSBwcm9wLmluaXRpYWxpemVyLnRleHQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBkZXBzLm1hcChwYXJzZVByb3BlcnRpZXMpLnBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRJTyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBub2RlOiB0cy5Ob2RlKTogYW55IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0cy5pc0NsYXNzRGVjbGFyYXRpb24oc3RhdGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5wb3MgPT09IG5vZGUucG9zICYmIHN0YXRlbWVudC5lbmQgPT09IG5vZGUuZW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy5jbGFzc0hlbHBlci52aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZW5hbWUsIHN0YXRlbWVudCwgc291cmNlRmlsZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xyXG4gICAgICAgIH0sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc1swXSB8fCB7fTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNhbml0aXplVXJscyh1cmxzOiBBcnJheTxzdHJpbmc+KTogQXJyYXk8c3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIHVybHMubWFwKHVybCA9PiB1cmwucmVwbGFjZSgnLi8nLCAnJykpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50Q2FjaGUge1xyXG4gICAgcHJpdmF0ZSBjYWNoZTogTWFwPHN0cmluZywgYW55PiA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogYW55IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQoa2V5KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jYWNoZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBJRGVwIH0gZnJvbSAnLi4vZGVwZW5kZW5jaWVzLmludGVyZmFjZXMnO1xyXG5pbXBvcnQgeyBOb2RlT2JqZWN0IH0gZnJvbSAnLi4vbm9kZS1vYmplY3QuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgTW9kdWxlSGVscGVyIH0gZnJvbSAnLi9oZWxwZXJzL21vZHVsZS1oZWxwZXInO1xyXG5pbXBvcnQgeyBOc01vZHVsZUNhY2hlIH0gZnJvbSAnLi9oZWxwZXJzL3N5bWJvbC1oZWxwZXInO1xyXG5pbXBvcnQgeyBDb21wb25lbnRDYWNoZSB9IGZyb20gJy4vaGVscGVycy9jb21wb25lbnQtaGVscGVyJztcclxuY29uc3QgdHMgPSByZXF1aXJlKCd0eXBlc2NyaXB0Jyk7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBNb2R1bGVEZXBGYWN0b3J5IHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbW9kdWxlSGVscGVyOiBNb2R1bGVIZWxwZXIpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZShmaWxlOiBhbnksIHNyY0ZpbGU6IHRzLlNvdXJjZUZpbGUsIG5hbWU6IGFueSwgcHJvcHM6IGFueSwgSU86IGFueSk6IElNb2R1bGVEZXAge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIGlkOiAnbW9kdWxlLScgKyBuYW1lICsgJy0nICsgRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgZmlsZTogZmlsZSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiB0aGlzLm1vZHVsZUhlbHBlci5nZXRNb2R1bGVQcm92aWRlcnMocHJvcHMpLFxyXG4gICAgICAgICAgICBkZWNsYXJhdGlvbnM6IHRoaXMubW9kdWxlSGVscGVyLmdldE1vZHVsZURlY2xhdGlvbnMocHJvcHMpLFxyXG4gICAgICAgICAgICBpbXBvcnRzOiB0aGlzLm1vZHVsZUhlbHBlci5nZXRNb2R1bGVJbXBvcnRzKHByb3BzKSxcclxuICAgICAgICAgICAgZXhwb3J0czogdGhpcy5tb2R1bGVIZWxwZXIuZ2V0TW9kdWxlRXhwb3J0cyhwcm9wcyksXHJcbiAgICAgICAgICAgIGJvb3RzdHJhcDogdGhpcy5tb2R1bGVIZWxwZXIuZ2V0TW9kdWxlQm9vdHN0cmFwKHByb3BzKSxcclxuICAgICAgICAgICAgdHlwZTogJ21vZHVsZScsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBJTy5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgc291cmNlQ29kZTogc3JjRmlsZS5nZXRUZXh0KClcclxuICAgICAgICB9IGFzIElNb2R1bGVEZXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSU1vZHVsZURlcCBleHRlbmRzIElEZXAge1xyXG4gICAgZmlsZTogYW55O1xyXG4gICAgcHJvdmlkZXJzOiBBcnJheTxhbnk+O1xyXG4gICAgZGVjbGFyYXRpb25zOiBBcnJheTxhbnk+O1xyXG4gICAgaW1wb3J0czogQXJyYXk8YW55PjtcclxuICAgIGV4cG9ydHM6IEFycmF5PGFueT47XHJcbiAgICBib290c3RyYXA6IGFueTtcclxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XHJcbiAgICBzb3VyY2VDb2RlOiBzdHJpbmc7XHJcbn1cclxuIiwiaW1wb3J0IHsgSURlcCB9IGZyb20gJy4uL2RlcGVuZGVuY2llcy5pbnRlcmZhY2VzJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uL2NvbmZpZ3VyYXRpb24nO1xyXG5pbXBvcnQgeyBDb21wb25lbnRIZWxwZXIgfSBmcm9tICcuL2hlbHBlcnMvY29tcG9uZW50LWhlbHBlcic7XHJcbmltcG9ydCB7IGNsZWFuTGlmZWN5Y2xlSG9va3NGcm9tTWV0aG9kcyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3V0aWxzJztcclxuaW1wb3J0IHsgTnNNb2R1bGVDYWNoZSB9IGZyb20gJy4vaGVscGVycy9zeW1ib2wtaGVscGVyJztcclxuaW1wb3J0IHsgQ2xhc3NIZWxwZXIgfSBmcm9tICcuL2hlbHBlcnMvY2xhc3MtaGVscGVyJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkludGVyZmFjZSB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudERlcEZhY3Rvcnkge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBoZWxwZXI6IENvbXBvbmVudEhlbHBlcixcclxuICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb246IENvbmZpZ3VyYXRpb25JbnRlcmZhY2UpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZShmaWxlOiBhbnksIHNyY0ZpbGU6IGFueSwgbmFtZTogYW55LCBwcm9wczogYW55LCBJTzogYW55KTogSUNvbXBvbmVudERlcCB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2codXRpbC5pbnNwZWN0KHByb3BzLCB7IHNob3dIaWRkZW46IHRydWUsIGRlcHRoOiAxMCB9KSk7XHJcbiAgICAgICAgbGV0IGNvbXBvbmVudERlcDogSUNvbXBvbmVudERlcCA9IHtcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgaWQ6ICdjb21wb25lbnQtJyArIG5hbWUgKyAnLScgKyBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICBmaWxlOiBmaWxlLFxyXG4gICAgICAgICAgICAvLyBhbmltYXRpb25zPzogc3RyaW5nW107IC8vIFRPRE9cclxuICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRDaGFuZ2VEZXRlY3Rpb24ocHJvcHMpLFxyXG4gICAgICAgICAgICBlbmNhcHN1bGF0aW9uOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRFbmNhcHN1bGF0aW9uKHByb3BzKSxcclxuICAgICAgICAgICAgLy8gZW50cnlDb21wb25lbnRzPzogc3RyaW5nOyAvLyBUT0RPIHdhaXRpbmcgZG9jIGluZm9zXHJcbiAgICAgICAgICAgIGV4cG9ydEFzOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRFeHBvcnRBcyhwcm9wcyksXHJcbiAgICAgICAgICAgIGhvc3Q6IHRoaXMuaGVscGVyLmdldENvbXBvbmVudEhvc3QocHJvcHMpLFxyXG4gICAgICAgICAgICBpbnB1dHM6IHRoaXMuaGVscGVyLmdldENvbXBvbmVudElucHV0c01ldGFkYXRhKHByb3BzKSxcclxuICAgICAgICAgICAgLy8gaW50ZXJwb2xhdGlvbj86IHN0cmluZzsgLy8gVE9ETyB3YWl0aW5nIGRvYyBpbmZvc1xyXG4gICAgICAgICAgICBtb2R1bGVJZDogdGhpcy5oZWxwZXIuZ2V0Q29tcG9uZW50TW9kdWxlSWQocHJvcHMpLFxyXG4gICAgICAgICAgICBvdXRwdXRzOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRPdXRwdXRzKHByb3BzKSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRQcm92aWRlcnMocHJvcHMpLFxyXG4gICAgICAgICAgICAvLyBxdWVyaWVzPzogRGVwc1tdOyAvLyBUT0RPXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRTZWxlY3Rvcihwcm9wcyksXHJcbiAgICAgICAgICAgIHN0eWxlVXJsczogdGhpcy5oZWxwZXIuZ2V0Q29tcG9uZW50U3R5bGVVcmxzKHByb3BzKSxcclxuICAgICAgICAgICAgc3R5bGVzOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRTdHlsZXMocHJvcHMpLCAvLyBUT0RPIGZpeCBhcmdzXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRUZW1wbGF0ZShwcm9wcyksXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiB0aGlzLmhlbHBlci5nZXRDb21wb25lbnRUZW1wbGF0ZVVybChwcm9wcyksXHJcbiAgICAgICAgICAgIHZpZXdQcm92aWRlcnM6IHRoaXMuaGVscGVyLmdldENvbXBvbmVudFZpZXdQcm92aWRlcnMocHJvcHMpLFxyXG4gICAgICAgICAgICBpbnB1dHNDbGFzczogSU8uaW5wdXRzLFxyXG4gICAgICAgICAgICBvdXRwdXRzQ2xhc3M6IElPLm91dHB1dHMsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNDbGFzczogSU8ucHJvcGVydGllcyxcclxuICAgICAgICAgICAgbWV0aG9kc0NsYXNzOiBJTy5tZXRob2RzLFxyXG5cclxuICAgICAgICAgICAgaG9zdEJpbmRpbmdzOiBJTy5ob3N0QmluZGluZ3MsXHJcbiAgICAgICAgICAgIGhvc3RMaXN0ZW5lcnM6IElPLmhvc3RMaXN0ZW5lcnMsXHJcblxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogSU8uZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIHR5cGU6ICdjb21wb25lbnQnLFxyXG4gICAgICAgICAgICBzb3VyY2VDb2RlOiBzcmNGaWxlLmdldFRleHQoKSxcclxuICAgICAgICAgICAgZXhhbXBsZVVybHM6IHRoaXMuaGVscGVyLmdldENvbXBvbmVudEV4YW1wbGVVcmxzKHNyY0ZpbGUuZ2V0VGV4dCgpKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0KSB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudERlcC5tZXRob2RzQ2xhc3MgPSBjbGVhbkxpZmVjeWNsZUhvb2tzRnJvbU1ldGhvZHMoY29tcG9uZW50RGVwLm1ldGhvZHNDbGFzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29tcG9uZW50RGVwLmpzZG9jdGFncyA9IElPLmpzZG9jdGFnc1swXS50YWdzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoSU8uY29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgY29tcG9uZW50RGVwLmNvbnN0cnVjdG9yT2JqID0gSU8uY29uc3RydWN0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChJTy5leHRlbmRzKSB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudERlcC5leHRlbmRzID0gSU8uZXh0ZW5kcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKElPLmltcGxlbWVudHMgJiYgSU8uaW1wbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudERlcC5pbXBsZW1lbnRzID0gSU8uaW1wbGVtZW50cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb21wb25lbnREZXA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUNvbXBvbmVudERlcCBleHRlbmRzIElEZXAge1xyXG4gICAgZmlsZTogYW55O1xyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBhbnk7XHJcbiAgICBlbmNhcHN1bGF0aW9uOiBhbnk7XHJcbiAgICBleHBvcnRBczogYW55O1xyXG4gICAgaG9zdDogYW55O1xyXG4gICAgaW5wdXRzOiBBcnJheTxhbnk+O1xyXG4gICAgb3V0cHV0czogQXJyYXk8YW55PjtcclxuICAgIHByb3ZpZGVyczogQXJyYXk8YW55PjtcclxuICAgIG1vZHVsZUlkOiBzdHJpbmc7XHJcbiAgICBzZWxlY3Rvcjogc3RyaW5nO1xyXG4gICAgc3R5bGVVcmxzOiBBcnJheTxzdHJpbmc+O1xyXG4gICAgc3R5bGVzOiBBcnJheTxzdHJpbmc+O1xyXG4gICAgdGVtcGxhdGU6IHN0cmluZztcclxuICAgIHRlbXBsYXRlVXJsOiBBcnJheTxzdHJpbmc+O1xyXG4gICAgdmlld1Byb3ZpZGVyczogQXJyYXk8YW55PjtcclxuICAgIGlucHV0c0NsYXNzOiBBcnJheTxhbnk+O1xyXG4gICAgb3V0cHV0c0NsYXNzOiBBcnJheTxhbnk+O1xyXG4gICAgcHJvcGVydGllc0NsYXNzOiBBcnJheTxhbnk+O1xyXG4gICAgbWV0aG9kc0NsYXNzOiBBcnJheTxhbnk+O1xyXG5cclxuICAgIGhvc3RCaW5kaW5nczogQXJyYXk8YW55PjtcclxuICAgIGhvc3RMaXN0ZW5lcnM6IEFycmF5PGFueT47XHJcblxyXG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcclxuICAgIHNvdXJjZUNvZGU6IHN0cmluZztcclxuICAgIGV4YW1wbGVVcmxzOiBBcnJheTxzdHJpbmc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yT2JqPzogT2JqZWN0O1xyXG4gICAganNkb2N0YWdzPzogQXJyYXk8c3RyaW5nPjtcclxuICAgIGV4dGVuZHM/OiBhbnk7XHJcbiAgICBpbXBsZW1lbnRzPzogYW55O1xyXG59IiwiaW1wb3J0IHsgTm9kZU9iamVjdCB9IGZyb20gJy4uLy4uL25vZGUtb2JqZWN0LmludGVyZmFjZSc7XHJcbmltcG9ydCB7IFN5bWJvbEhlbHBlciwgTnNNb2R1bGVDYWNoZSB9IGZyb20gJy4vc3ltYm9sLWhlbHBlcic7XHJcbmltcG9ydCB7IENvbXBvbmVudENhY2hlIH0gZnJvbSAnLi9jb21wb25lbnQtaGVscGVyJztcclxuaW1wb3J0IHsgRGVwcyB9IGZyb20gJy4uLy4uL2RlcGVuZGVuY2llcy5pbnRlcmZhY2VzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBNb2R1bGVIZWxwZXIge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBtb2R1bGVDYWNoZTogTnNNb2R1bGVDYWNoZSxcclxuICAgICAgICBwcml2YXRlIGNhY2hlOiBDb21wb25lbnRDYWNoZSxcclxuICAgICAgICBwcml2YXRlIHN5bWJvbEhlbHBlcjogU3ltYm9sSGVscGVyID0gbmV3IFN5bWJvbEhlbHBlcigpKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNb2R1bGVQcm92aWRlcnMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sSGVscGVyXHJcbiAgICAgICAgICAgIC5nZXRTeW1ib2xEZXBzKHByb3BzLCAncHJvdmlkZXJzJylcclxuICAgICAgICAgICAgLm1hcCgocHJvdmlkZXJOYW1lKSA9PiB0aGlzLnN5bWJvbEhlbHBlci5wYXJzZURlZXBJbmRlbnRpZmllcihwcm92aWRlck5hbWUsIHRoaXMubW9kdWxlQ2FjaGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TW9kdWxlRGVjbGF0aW9ucyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2xIZWxwZXIuZ2V0U3ltYm9sRGVwcyhwcm9wcywgJ2RlY2xhcmF0aW9ucycpLm1hcCgobmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5jYWNoZS5nZXQobmFtZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2xIZWxwZXIucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSwgdGhpcy5tb2R1bGVDYWNoZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1vZHVsZUltcG9ydHMocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sSGVscGVyXHJcbiAgICAgICAgICAgIC5nZXRTeW1ib2xEZXBzKHByb3BzLCAnaW1wb3J0cycpXHJcbiAgICAgICAgICAgIC5tYXAoKG5hbWUpID0+IHRoaXMuc3ltYm9sSGVscGVyLnBhcnNlRGVlcEluZGVudGlmaWVyKG5hbWUsIHRoaXMubW9kdWxlQ2FjaGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TW9kdWxlRXhwb3J0cyhwcm9wczogTm9kZU9iamVjdFtdKTogRGVwc1tdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2xIZWxwZXJcclxuICAgICAgICAgICAgLmdldFN5bWJvbERlcHMocHJvcHMsICdleHBvcnRzJylcclxuICAgICAgICAgICAgLm1hcCgobmFtZSkgPT4gdGhpcy5zeW1ib2xIZWxwZXIucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSwgdGhpcy5tb2R1bGVDYWNoZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzOiBOb2RlT2JqZWN0W10pOiBEZXBzW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbEhlbHBlci5nZXRTeW1ib2xEZXBzUmF3KHByb3BzLCAnaW1wb3J0cycpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNb2R1bGVCb290c3RyYXAocHJvcHM6IE5vZGVPYmplY3RbXSk6IERlcHNbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sSGVscGVyXHJcbiAgICAgICAgICAgIC5nZXRTeW1ib2xEZXBzKHByb3BzLCAnYm9vdHN0cmFwJylcclxuICAgICAgICAgICAgLm1hcCgobmFtZSkgPT4gdGhpcy5zeW1ib2xIZWxwZXIucGFyc2VEZWVwSW5kZW50aWZpZXIobmFtZSwgdGhpcy5tb2R1bGVDYWNoZSkpO1xyXG4gICAgfVxyXG59IiwiZXhwb3J0IGNsYXNzIEpzRG9jSGVscGVyIHtcclxuXHJcbiAgICBwdWJsaWMgaGFzSlNEb2NJbnRlcm5hbFRhZyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlLCBub2RlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHNvdXJjZUZpbGUuc3RhdGVtZW50cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdGF0ZW1lbnQgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVtZW50LnBvcyA9PT0gbm9kZS5wb3MgJiYgc3RhdGVtZW50LmVuZCA9PT0gbm9kZS5lbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5qc0RvYyAmJiBub2RlLmpzRG9jLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGogPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGVuZyA9IG5vZGUuanNEb2MubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGo7IGogPCBsZW5nOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmpzRG9jW2pdLnRhZ3MgJiYgbm9kZS5qc0RvY1tqXS50YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgayA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxlbmd0ID0gbm9kZS5qc0RvY1tqXS50YWdzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGs7IGsgPCBsZW5ndDsgaysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmpzRG9jW2pdLnRhZ3Nba10udGFnTmFtZSAmJiBub2RlLmpzRG9jW2pdLnRhZ3Nba10udGFnTmFtZS50ZXh0ID09PSAnaW50ZXJuYWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgZ2V0TmFtZXNDb21wYXJlRm4sIG1lcmdlVGFnc0FuZEFyZ3MsIG1hcmtlZHRhZ3MgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy91dGlscyc7XHJcbmltcG9ydCB7IGtpbmRUb1R5cGUgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9raW5kLXRvLXR5cGUnO1xyXG5cclxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcclxuaW1wb3J0IHsgSnNkb2NQYXJzZXJVdGlsIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vaW50ZXJmYWNlcy9jb25maWd1cmF0aW9uLmludGVyZmFjZSc7XHJcblxyXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcclxuXHJcbmV4cG9ydCBjbGFzcyBDbGFzc0hlbHBlciB7XHJcbiAgICBwcml2YXRlIGpzZG9jUGFyc2VyVXRpbCA9IG5ldyBKc2RvY1BhcnNlclV0aWwoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHR5cGVDaGVja2VyLFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQ29uZmlndXJhdGlvbkludGVyZmFjZSkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RyaW5naWZ5RGVmYXVsdFZhbHVlKG5vZGUpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAobm9kZS50ZXh0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlLnRleHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnZmFsc2UnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndHJ1ZSc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2aXNpdFR5cGUobm9kZSk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IF9yZXR1cm4gPSAndm9pZCc7XHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKG5vZGUudHlwZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIF9yZXR1cm4gPSBub2RlLnR5cGVOYW1lLnRleHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlLmtpbmQpIHtcclxuICAgICAgICAgICAgICAgICAgICBfcmV0dXJuID0ga2luZFRvVHlwZShub2RlLnR5cGUua2luZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlLnR5cGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3JldHVybiA9IG5vZGUudHlwZS50eXBlTmFtZS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZS50eXBlQXJndW1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSAnPCc7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBhcmd1bWVudCBvZiBub2RlLnR5cGUudHlwZUFyZ3VtZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnQua2luZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSBraW5kVG9UeXBlKGFyZ3VtZW50LmtpbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudC50eXBlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSBhcmd1bWVudC50eXBlTmFtZS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0gJz4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZS5lbGVtZW50VHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBfZmlyc3RQYXJ0ID0ga2luZFRvVHlwZShub2RlLnR5cGUuZWxlbWVudFR5cGUua2luZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBub2RlLnR5cGUuZWxlbWVudFR5cGUudHlwZU5hbWUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZS50eXBlLmVsZW1lbnRUeXBlLnR5cGVOYW1lLmVzY2FwZWRUZXh0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ZpcnN0UGFydCA9IG5vZGUudHlwZS5lbGVtZW50VHlwZS50eXBlTmFtZS5lc2NhcGVkVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBfcmV0dXJuID0gX2ZpcnN0UGFydCArIGtpbmRUb1R5cGUobm9kZS50eXBlLmtpbmQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZS50eXBlcyAmJiBub2RlLnR5cGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5VbmlvblR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBfcmV0dXJuID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZW4gPSBub2RlLnR5cGUudHlwZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0ga2luZFRvVHlwZShub2RlLnR5cGUudHlwZXNbaV0ua2luZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUudHlwZXNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5MaXRlcmFsVHlwZSAmJiBub2RlLnR5cGUudHlwZXNbaV0ubGl0ZXJhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSAnXCInICsgbm9kZS50eXBlLnR5cGVzW2ldLmxpdGVyYWwudGV4dCArICdcIic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZS50eXBlLnR5cGVzW2ldLnR5cGVOYW1lICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBub2RlLnR5cGUudHlwZXNbaV0udHlwZU5hbWUuZXNjYXBlZFRleHQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSBub2RlLnR5cGUudHlwZXNbaV0udHlwZU5hbWUuZXNjYXBlZFRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpIDwgbGVuIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybiArPSAnIHwgJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmVsZW1lbnRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0ga2luZFRvVHlwZShub2RlLmVsZW1lbnRUeXBlLmtpbmQpICsga2luZFRvVHlwZShub2RlLmtpbmQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUudHlwZXMgJiYgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlVuaW9uVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgX3JldHVybiA9ICcnO1xyXG4gICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxlbiA9IG5vZGUudHlwZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9IGtpbmRUb1R5cGUobm9kZS50eXBlc1tpXS5raW5kKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkxpdGVyYWxUeXBlICYmIG5vZGUudHlwZXNbaV0ubGl0ZXJhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9ICdcIicgKyBub2RlLnR5cGVzW2ldLmxpdGVyYWwudGV4dCArICdcIic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgbGVuIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuICs9ICcgfCAnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmRvdERvdERvdFRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICBfcmV0dXJuID0gJ2FueVtdJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF9yZXR1cm4gPSBraW5kVG9UeXBlKG5vZGUua2luZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5vZGUudHlwZUFyZ3VtZW50cyAmJiBub2RlLnR5cGVBcmd1bWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgX3JldHVybiArPSAnPCc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFyZ3VtZW50IG9mIG5vZGUudHlwZUFyZ3VtZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0ga2luZFRvVHlwZShhcmd1bWVudC5raW5kKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF9yZXR1cm4gKz0gJz4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB2aXNpdENsYXNzRGVjbGFyYXRpb24oZmlsZU5hbWU6IHN0cmluZywgY2xhc3NEZWNsYXJhdGlvbjogdHMuQ2xhc3NEZWNsYXJhdGlvbiwgc291cmNlRmlsZT86IHRzLlNvdXJjZUZpbGUpOiBhbnkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCBzeW1ib2wgPSB0aGlzLnR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oY2xhc3NEZWNsYXJhdGlvbi5uYW1lKTtcclxuICAgICAgICBsZXQgZGVzY3JpcHRpb24gPSAnJztcclxuICAgICAgICBpZiAoc3ltYm9sKSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBjbGFzc0RlY2xhcmF0aW9uLm5hbWUudGV4dDtcclxuICAgICAgICBsZXQgZGlyZWN0aXZlSW5mbztcclxuICAgICAgICBsZXQgbWVtYmVycztcclxuICAgICAgICBsZXQgaW1wbGVtZW50c0VsZW1lbnRzID0gW107XHJcbiAgICAgICAgbGV0IGV4dGVuZHNFbGVtZW50O1xyXG4gICAgICAgIGxldCBqc2RvY3RhZ3MgPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0cy5nZXRDbGFzc0ltcGxlbWVudHNIZXJpdGFnZUNsYXVzZUVsZW1lbnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBsZXQgaW1wbGVtZW50ZWRUeXBlcyA9IHRzLmdldENsYXNzSW1wbGVtZW50c0hlcml0YWdlQ2xhdXNlRWxlbWVudHMoY2xhc3NEZWNsYXJhdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChpbXBsZW1lbnRlZFR5cGVzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuID0gaW1wbGVtZW50ZWRUeXBlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbXBsZW1lbnRlZFR5cGVzW2ldLmV4cHJlc3Npb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wbGVtZW50c0VsZW1lbnRzLnB1c2goaW1wbGVtZW50ZWRUeXBlc1tpXS5leHByZXNzaW9uLnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0cy5nZXRDbGFzc0V4dGVuZHNIZXJpdGFnZUNsYXVzZUVsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGxldCBleHRlbmRzVHlwZXMgPSB0cy5nZXRDbGFzc0V4dGVuZHNIZXJpdGFnZUNsYXVzZUVsZW1lbnQoY2xhc3NEZWNsYXJhdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChleHRlbmRzVHlwZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChleHRlbmRzVHlwZXMuZXhwcmVzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZHNFbGVtZW50ID0gZXh0ZW5kc1R5cGVzLmV4cHJlc3Npb24udGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN5bWJvbCkge1xyXG4gICAgICAgICAgICBpZiAoc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGpzZG9jdGFncyA9IHRoaXMuanNkb2NQYXJzZXJVdGlsLmdldEpTRG9jcyhzeW1ib2wudmFsdWVEZWNsYXJhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRGlyZWN0aXZlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVJbmZvID0gdGhpcy52aXNpdERpcmVjdGl2ZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMsIHNvdXJjZUZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IG1lbWJlcnMuaW5wdXRzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRzOiBtZW1iZXJzLm91dHB1dHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RCaW5kaW5nczogbWVtYmVycy5ob3N0QmluZGluZ3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RMaXN0ZW5lcnM6IG1lbWJlcnMuaG9zdExpc3RlbmVycyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogbWVtYmVycy5wcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlczogbWVtYmVycy5pbmRleFNpZ25hdHVyZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3I6IG1lbWJlcnMuY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzZG9jdGFnczoganNkb2N0YWdzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBleHRlbmRzRWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c0VsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1NlcnZpY2VEZWNvcmF0b3IoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcnMgPSB0aGlzLnZpc2l0TWVtYmVycyhjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMsIHNvdXJjZUZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleFNpZ25hdHVyZXM6IG1lbWJlcnMuaW5kZXhTaWduYXR1cmVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBtZW1iZXJzLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3I6IG1lbWJlcnMuY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzZG9jdGFnczoganNkb2N0YWdzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBleHRlbmRzRWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c0VsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgfV07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNQaXBlRGVjb3JhdG9yKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9yc1tpXSkgfHwgdGhpcy5pc01vZHVsZURlY29yYXRvcihjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnNbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBqc2RvY3RhZ3M6IGpzZG9jdGFnc1xyXG4gICAgICAgICAgICAgICAgICAgIH1dO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzLCBzb3VyY2VGaWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBtZW1iZXJzLm1ldGhvZHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlczogbWVtYmVycy5pbmRleFNpZ25hdHVyZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogbWVtYmVycy5raW5kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcjogbWVtYmVycy5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAganNkb2N0YWdzOiBqc2RvY3RhZ3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzRWxlbWVudHNcclxuICAgICAgICAgICAgICAgICAgICB9XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgbWVtYmVycyA9IHRoaXMudmlzaXRNZW1iZXJzKGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycywgc291cmNlRmlsZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW3tcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxyXG4gICAgICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzOiBtZW1iZXJzLmluZGV4U2lnbmF0dXJlcyxcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZCxcclxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBtZW1iZXJzLmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICAgICAganNkb2N0YWdzOiBqc2RvY3RhZ3MsXHJcbiAgICAgICAgICAgICAgICBleHRlbmRzOiBleHRlbmRzRWxlbWVudCxcclxuICAgICAgICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNFbGVtZW50c1xyXG4gICAgICAgICAgICB9XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtZW1iZXJzID0gdGhpcy52aXNpdE1lbWJlcnMoY2xhc3NEZWNsYXJhdGlvbi5tZW1iZXJzLCBzb3VyY2VGaWxlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kczogbWVtYmVycy5tZXRob2RzLFxyXG4gICAgICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzOiBtZW1iZXJzLmluZGV4U2lnbmF0dXJlcyxcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG1lbWJlcnMucHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgIGtpbmQ6IG1lbWJlcnMua2luZCxcclxuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yOiBtZW1iZXJzLmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICAgICAganNkb2N0YWdzOiBqc2RvY3RhZ3MsXHJcbiAgICAgICAgICAgICAgICBleHRlbmRzOiBleHRlbmRzRWxlbWVudCxcclxuICAgICAgICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNFbGVtZW50c1xyXG4gICAgICAgICAgICB9XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZpc2l0RGlyZWN0aXZlRGVjb3JhdG9yKGRlY29yYXRvcikge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCBzZWxlY3RvcjtcclxuICAgICAgICBsZXQgZXhwb3J0QXM7XHJcbiAgICAgICAgbGV0IHByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0gZGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzWzBdLnByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzW2ldLm5hbWUudGV4dCA9PT0gJ3NlbGVjdG9yJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBvbmx5IHdvcmsgaWYgc2VsZWN0b3IgaXMgaW5pdGlhbGl6ZWQgYXMgYSBzdHJpbmcgbGl0ZXJhbFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gcHJvcGVydGllc1tpXS5pbml0aWFsaXplci50ZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXNbaV0ubmFtZS50ZXh0ID09PSAnZXhwb3J0QXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIG9ubHkgd29yayBpZiBzZWxlY3RvciBpcyBpbml0aWFsaXplZCBhcyBhIHN0cmluZyBsaXRlcmFsXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXMgPSBwcm9wZXJ0aWVzW2ldLmluaXRpYWxpemVyLnRleHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNlbGVjdG9yLFxyXG4gICAgICAgICAgICBleHBvcnRBc1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpc0RpcmVjdGl2ZURlY29yYXRvcihkZWNvcmF0b3IpIHtcclxuICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xyXG4gICAgICAgICAgICBsZXQgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQ7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWNvcmF0b3JJZGVudGlmaWVyVGV4dCA9PT0gJ0RpcmVjdGl2ZScgfHwgZGVjb3JhdG9ySWRlbnRpZmllclRleHQgPT09ICdDb21wb25lbnQnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpc1NlcnZpY2VEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSA/IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ0luamVjdGFibGUnIDogZmFsc2U7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRNZW1iZXJzKG1lbWJlcnMsIHNvdXJjZUZpbGUpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgaW5wdXRzID0gW107XHJcbiAgICAgICAgbGV0IG91dHB1dHMgPSBbXTtcclxuICAgICAgICBsZXQgaG9zdEJpbmRpbmdzID0gW107XHJcbiAgICAgICAgbGV0IGhvc3RMaXN0ZW5lcnMgPSBbXTtcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IFtdO1xyXG4gICAgICAgIGxldCBwcm9wZXJ0aWVzID0gW107XHJcbiAgICAgICAgbGV0IGluZGV4U2lnbmF0dXJlcyA9IFtdO1xyXG4gICAgICAgIGxldCBraW5kO1xyXG4gICAgICAgIGxldCBpbnB1dERlY29yYXRvcjtcclxuICAgICAgICBsZXQgaG9zdEJpbmRpbmc7XHJcbiAgICAgICAgbGV0IGhvc3RMaXN0ZW5lcjtcclxuICAgICAgICBsZXQgY29uc3RydWN0b3I7XHJcbiAgICAgICAgbGV0IG91dERlY29yYXRvcjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZW1iZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlucHV0RGVjb3JhdG9yID0gdGhpcy5nZXREZWNvcmF0b3JPZlR5cGUobWVtYmVyc1tpXSwgJ0lucHV0Jyk7XHJcbiAgICAgICAgICAgIG91dERlY29yYXRvciA9IHRoaXMuZ2V0RGVjb3JhdG9yT2ZUeXBlKG1lbWJlcnNbaV0sICdPdXRwdXQnKTtcclxuICAgICAgICAgICAgaG9zdEJpbmRpbmcgPSB0aGlzLmdldERlY29yYXRvck9mVHlwZShtZW1iZXJzW2ldLCAnSG9zdEJpbmRpbmcnKTtcclxuICAgICAgICAgICAgaG9zdExpc3RlbmVyID0gdGhpcy5nZXREZWNvcmF0b3JPZlR5cGUobWVtYmVyc1tpXSwgJ0hvc3RMaXN0ZW5lcicpO1xyXG5cclxuICAgICAgICAgICAga2luZCA9IG1lbWJlcnNbaV0ua2luZDtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dERlY29yYXRvcikge1xyXG4gICAgICAgICAgICAgICAgaW5wdXRzLnB1c2godGhpcy52aXNpdElucHV0QW5kSG9zdEJpbmRpbmcobWVtYmVyc1tpXSwgaW5wdXREZWNvcmF0b3IsIHNvdXJjZUZpbGUpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvdXREZWNvcmF0b3IpIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dHMucHVzaCh0aGlzLnZpc2l0T3V0cHV0KG1lbWJlcnNbaV0sIG91dERlY29yYXRvciwgc291cmNlRmlsZSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhvc3RCaW5kaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBob3N0QmluZGluZ3MucHVzaCh0aGlzLnZpc2l0SW5wdXRBbmRIb3N0QmluZGluZyhtZW1iZXJzW2ldLCBob3N0QmluZGluZywgc291cmNlRmlsZSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhvc3RMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAgICAgaG9zdExpc3RlbmVycy5wdXNoKHRoaXMudmlzaXRIb3N0TGlzdGVuZXIobWVtYmVyc1tpXSwgaG9zdExpc3RlbmVyLCBzb3VyY2VGaWxlKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNIaWRkZW5NZW1iZXIobWVtYmVyc1tpXSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoISgodGhpcy5pc1ByaXZhdGUobWVtYmVyc1tpXSkgfHwgdGhpcy5pc0ludGVybmFsKG1lbWJlcnNbaV0pKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2RTaWduYXR1cmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHMucHVzaCh0aGlzLnZpc2l0TWV0aG9kRGVjbGFyYXRpb24obWVtYmVyc1tpXSwgc291cmNlRmlsZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNbaV0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eVNpZ25hdHVyZSB8fCBtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuR2V0QWNjZXNzb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKHRoaXMudmlzaXRQcm9wZXJ0eShtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2FsbFNpZ25hdHVyZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godGhpcy52aXNpdENhbGxEZWNsYXJhdGlvbihtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzW2ldLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW5kZXhTaWduYXR1cmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhTaWduYXR1cmVzLnB1c2godGhpcy52aXNpdEluZGV4RGVjbGFyYXRpb24obWVtYmVyc1tpXSwgc291cmNlRmlsZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyc1tpXS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBfY29uc3RydWN0b3JQcm9wZXJ0aWVzID0gdGhpcy52aXNpdENvbnN0cnVjdG9yUHJvcGVydGllcyhtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGogPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGVuID0gX2NvbnN0cnVjdG9yUHJvcGVydGllcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoajsgaiA8IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2goX2NvbnN0cnVjdG9yUHJvcGVydGllc1tqXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RydWN0b3IgPSB0aGlzLnZpc2l0Q29uc3RydWN0b3JEZWNsYXJhdGlvbihtZW1iZXJzW2ldLCBzb3VyY2VGaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlucHV0cy5zb3J0KGdldE5hbWVzQ29tcGFyZUZuKCkpO1xyXG4gICAgICAgIG91dHB1dHMuc29ydChnZXROYW1lc0NvbXBhcmVGbigpKTtcclxuICAgICAgICBob3N0QmluZGluZ3Muc29ydChnZXROYW1lc0NvbXBhcmVGbigpKTtcclxuICAgICAgICBob3N0TGlzdGVuZXJzLnNvcnQoZ2V0TmFtZXNDb21wYXJlRm4oKSk7XHJcbiAgICAgICAgcHJvcGVydGllcy5zb3J0KGdldE5hbWVzQ29tcGFyZUZuKCkpO1xyXG4gICAgICAgIG1ldGhvZHMuc29ydChnZXROYW1lc0NvbXBhcmVGbigpKTtcclxuICAgICAgICBpbmRleFNpZ25hdHVyZXMuc29ydChnZXROYW1lc0NvbXBhcmVGbigpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5wdXRzLFxyXG4gICAgICAgICAgICBvdXRwdXRzLFxyXG4gICAgICAgICAgICBob3N0QmluZGluZ3MsXHJcbiAgICAgICAgICAgIGhvc3RMaXN0ZW5lcnMsXHJcbiAgICAgICAgICAgIG1ldGhvZHMsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgIGluZGV4U2lnbmF0dXJlcyxcclxuICAgICAgICAgICAga2luZCxcclxuICAgICAgICAgICAgY29uc3RydWN0b3JcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRDYWxsRGVjbGFyYXRpb24obWV0aG9kLCBzb3VyY2VGaWxlKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogYW55ID0ge1xyXG4gICAgICAgICAgICBpZDogJ2NhbGwtZGVjbGFyYXRpb24tJyArIERhdGUubm93KCksXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSksXHJcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW10sXHJcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHRoaXMudmlzaXRUeXBlKG1ldGhvZC50eXBlKSxcclxuICAgICAgICAgICAgbGluZTogdGhpcy5nZXRQb3NpdGlvbihtZXRob2QsIHNvdXJjZUZpbGUpLmxpbmUgKyAxXHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQganNkb2N0YWdzID0gdGhpcy5qc2RvY1BhcnNlclV0aWwuZ2V0SlNEb2NzKG1ldGhvZCk7XHJcbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcclxuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWFya2VkdGFncyhqc2RvY3RhZ3NbMF0udGFncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZpc2l0SW5kZXhEZWNsYXJhdGlvbihtZXRob2QsIHNvdXJjZUZpbGU/KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWQ6ICdpbmRleC1kZWNsYXJhdGlvbi0nICsgRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhtZXRob2Quc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKSxcclxuICAgICAgICAgICAgYXJnczogbWV0aG9kLnBhcmFtZXRlcnMgPyBtZXRob2QucGFyYW1ldGVycy5tYXAoKHByb3ApID0+IHRoaXMudmlzaXRBcmd1bWVudChwcm9wKSkgOiBbXSxcclxuICAgICAgICAgICAgcmV0dXJuVHlwZTogdGhpcy52aXNpdFR5cGUobWV0aG9kLnR5cGUpLFxyXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaXNQcml2YXRlKG1lbWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzUHJpdmF0ZTogYm9vbGVhbiA9IG1lbWJlci5tb2RpZmllcnMuc29tZShtb2RpZmllciA9PiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlByaXZhdGVLZXl3b3JkKTtcclxuICAgICAgICAgICAgaWYgKGlzUHJpdmF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNIaWRkZW5NZW1iZXIobWVtYmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzSW50ZXJuYWwobWVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3QgaW50ZXJuYWxUYWdzOiBzdHJpbmdbXSA9IFsnaW50ZXJuYWwnXTtcclxuICAgICAgICBpZiAobWVtYmVyLmpzRG9jKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZG9jIG9mIG1lbWJlci5qc0RvYykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvYy50YWdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgZG9jLnRhZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsVGFncy5pbmRleE9mKHRhZy50YWdOYW1lLnRleHQpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSB2aXNpdENvbnN0cnVjdG9yRGVjbGFyYXRpb24obWV0aG9kLCBzb3VyY2VGaWxlPykge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCByZXN1bHQ6IGFueSA9IHtcclxuICAgICAgICAgICAgbmFtZTogJ2NvbnN0cnVjdG9yJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxyXG4gICAgICAgICAgICBsaW5lOiB0aGlzLmdldFBvc2l0aW9uKG1ldGhvZCwgc291cmNlRmlsZSkubGluZSArIDFcclxuICAgICAgICB9O1xyXG4gICAgICAgIGxldCBqc2RvY3RhZ3MgPSB0aGlzLmpzZG9jUGFyc2VyVXRpbC5nZXRKU0RvY3MobWV0aG9kKTtcclxuXHJcbiAgICAgICAgaWYgKG1ldGhvZC5zeW1ib2wpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmRlc2NyaXB0aW9uID0gbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKG1ldGhvZC5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMpIHtcclxuICAgICAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1vZGlmaWVyS2luZCA9IG1ldGhvZC5tb2RpZmllcnNbMF0ua2luZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVzdWx0LmpzZG9jdGFncyAmJiByZXN1bHQuanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1lcmdlVGFnc0FuZEFyZ3MocmVzdWx0LmFyZ3MsIHJlc3VsdC5qc2RvY3RhZ3MpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0LmFyZ3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWVyZ2VUYWdzQW5kQXJncyhyZXN1bHQuYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXREZWNvcmF0b3JPZlR5cGUobm9kZSwgZGVjb3JhdG9yVHlwZSkge1xyXG4gICAgICAgIGxldCBkZWNvcmF0b3JzID0gbm9kZS5kZWNvcmF0b3JzIHx8IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlY29yYXRvcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGRlY29yYXRvcnNbaV0uZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yc1tpXS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gZGVjb3JhdG9yVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWNvcmF0b3JzW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRQcm9wZXJ0eShwcm9wZXJ0eSwgc291cmNlRmlsZSkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCByZXN1bHQ6IGFueSA9IHtcclxuICAgICAgICAgICAgbmFtZTogcHJvcGVydHkubmFtZS50ZXh0LFxyXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShwcm9wZXJ0eSksXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcclxuICAgICAgICAgICAgbGluZTogdGhpcy5nZXRQb3NpdGlvbihwcm9wZXJ0eSwgc291cmNlRmlsZSkubGluZSArIDFcclxuICAgICAgICB9O1xyXG4gICAgICAgIGxldCBqc2RvY3RhZ3M7XHJcblxyXG4gICAgICAgIGlmIChwcm9wZXJ0eS5qc0RvYykge1xyXG4gICAgICAgICAgICBqc2RvY3RhZ3MgPSB0aGlzLmpzZG9jUGFyc2VyVXRpbC5nZXRKU0RvY3MocHJvcGVydHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb3BlcnR5LnN5bWJvbCkge1xyXG4gICAgICAgICAgICByZXN1bHQuZGVzY3JpcHRpb24gPSBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcocHJvcGVydHkuc3ltYm9sLmdldERvY3VtZW50YXRpb25Db21tZW50KCkpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9wZXJ0eS5kZWNvcmF0b3JzKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5kZWNvcmF0b3JzID0gdGhpcy5mb3JtYXREZWNvcmF0b3JzKHByb3BlcnR5LmRlY29yYXRvcnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb3BlcnR5Lm1vZGlmaWVycykge1xyXG4gICAgICAgICAgICBpZiAocHJvcGVydHkubW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5tb2RpZmllcktpbmQgPSBwcm9wZXJ0eS5tb2RpZmllcnNbMF0ua2luZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRDb25zdHJ1Y3RvclByb3BlcnRpZXMoY29uc3RyLCBzb3VyY2VGaWxlKSB7XHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIGlmIChjb25zdHIucGFyYW1ldGVycykge1xyXG4gICAgICAgICAgICBsZXQgX3BhcmFtZXRlcnMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gY29uc3RyLnBhcmFtZXRlcnMubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNQdWJsaWMoY29uc3RyLnBhcmFtZXRlcnNbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3BhcmFtZXRlcnMucHVzaCh0aGlzLnZpc2l0UHJvcGVydHkoY29uc3RyLnBhcmFtZXRlcnNbaV0sIHNvdXJjZUZpbGUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gX3BhcmFtZXRlcnM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzUHVibGljKG1lbWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChtZW1iZXIubW9kaWZpZXJzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzUHVibGljOiBib29sZWFuID0gbWVtYmVyLm1vZGlmaWVycy5zb21lKGZ1bmN0aW9uIChtb2RpZmllcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHVibGljS2V5d29yZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChpc1B1YmxpYykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNIaWRkZW5NZW1iZXIobWVtYmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzSGlkZGVuTWVtYmVyKG1lbWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGludGVybmFsVGFnczogc3RyaW5nW10gPSBbJ2hpZGRlbiddO1xyXG4gICAgICAgIGlmIChtZW1iZXIuanNEb2MpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgbWVtYmVyLmpzRG9jKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9jLnRhZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBkb2MudGFncykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxUYWdzLmluZGV4T2YodGFnLnRhZ05hbWUudGV4dCkgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRJbnB1dEFuZEhvc3RCaW5kaW5nKHByb3BlcnR5LCBpbkRlY29yYXRvciwgc291cmNlRmlsZT8pIHtcclxuICAgICAgICBsZXQgaW5BcmdzID0gaW5EZWNvcmF0b3IuZXhwcmVzc2lvbi5hcmd1bWVudHM7XHJcbiAgICAgICAgbGV0IF9yZXR1cm46IGFueSA9IHt9O1xyXG4gICAgICAgIF9yZXR1cm4ubmFtZSA9IChpbkFyZ3MubGVuZ3RoID4gMCkgPyBpbkFyZ3NbMF0udGV4dCA6IHByb3BlcnR5Lm5hbWUudGV4dDtcclxuICAgICAgICBfcmV0dXJuLmRlZmF1bHRWYWx1ZSA9IHByb3BlcnR5LmluaXRpYWxpemVyID8gdGhpcy5zdHJpbmdpZnlEZWZhdWx0VmFsdWUocHJvcGVydHkuaW5pdGlhbGl6ZXIpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmIChwcm9wZXJ0eS5zeW1ib2wpIHtcclxuICAgICAgICAgICAgX3JldHVybi5kZXNjcmlwdGlvbiA9IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIV9yZXR1cm4uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnR5LmpzRG9jKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuanNEb2MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkuanNEb2NbMF0uY29tbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybi5kZXNjcmlwdGlvbiA9IG1hcmtlZChwcm9wZXJ0eS5qc0RvY1swXS5jb21tZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgX3JldHVybi5saW5lID0gdGhpcy5nZXRQb3NpdGlvbihwcm9wZXJ0eSwgc291cmNlRmlsZSkubGluZSArIDE7XHJcbiAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUpIHtcclxuICAgICAgICAgICAgX3JldHVybi50eXBlID0gdGhpcy52aXNpdFR5cGUocHJvcGVydHkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGhhbmRsZSBOZXdFeHByZXNzaW9uXHJcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LmluaXRpYWxpemVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTmV3RXhwcmVzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4udHlwZSA9IHByb3BlcnR5LmluaXRpYWxpemVyLmV4cHJlc3Npb24udGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF9yZXR1cm47XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgZm9ybWF0RGVjb3JhdG9ycyhkZWNvcmF0b3JzKSB7XHJcbiAgICAgICAgbGV0IF9kZWNvcmF0b3JzID0gW107XHJcblxyXG4gICAgICAgIF8uZm9yRWFjaChkZWNvcmF0b3JzLCAoZGVjb3JhdG9yOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIF9kZWNvcmF0b3JzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBkZWNvcmF0b3IuZXhwcmVzc2lvbi50ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvOiBhbnkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24uYXJndW1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLmFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmFyZ3MgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uLmFyZ3VtZW50cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBfZGVjb3JhdG9ycy5wdXNoKGluZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBfZGVjb3JhdG9ycztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZpc2l0TWV0aG9kRGVjbGFyYXRpb24obWV0aG9kLCBzb3VyY2VGaWxlKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogYW55ID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBtZXRob2QubmFtZS50ZXh0LFxyXG4gICAgICAgICAgICBhcmdzOiBtZXRob2QucGFyYW1ldGVycyA/IG1ldGhvZC5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdLFxyXG4gICAgICAgICAgICByZXR1cm5UeXBlOiB0aGlzLnZpc2l0VHlwZShtZXRob2QudHlwZSksXHJcbiAgICAgICAgICAgIGxpbmU6IHRoaXMuZ2V0UG9zaXRpb24obWV0aG9kLCBzb3VyY2VGaWxlKS5saW5lICsgMVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IGpzZG9jdGFncyA9IHRoaXMuanNkb2NQYXJzZXJVdGlsLmdldEpTRG9jcyhtZXRob2QpO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZC50eXBlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAvLyBUcnkgdG8gZ2V0IGluZmVycmVkIHR5cGVcclxuICAgICAgICAgICAgaWYgKG1ldGhvZC5zeW1ib2wpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzeW1ib2w6IHRzLlN5bWJvbCA9IG1ldGhvZC5zeW1ib2w7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ltYm9sVHlwZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0VHlwZU9mU3ltYm9sQXRMb2NhdGlvbihzeW1ib2wsIHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ltYm9sVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2lnbmF0dXJlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRTaWduYXR1cmVGcm9tRGVjbGFyYXRpb24obWV0aG9kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJldHVyblR5cGUgPSBzaWduYXR1cmUuZ2V0UmV0dXJuVHlwZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnJldHVyblR5cGUgPSB0aGlzLnR5cGVDaGVja2VyLnR5cGVUb1N0cmluZyhyZXR1cm5UeXBlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1lbXB0eVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikgeyB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWV0aG9kLnN5bWJvbCkge1xyXG4gICAgICAgICAgICByZXN1bHQuZGVzY3JpcHRpb24gPSBtYXJrZWQodHMuZGlzcGxheVBhcnRzVG9TdHJpbmcobWV0aG9kLnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWV0aG9kLmRlY29yYXRvcnMpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmRlY29yYXRvcnMgPSB0aGlzLmZvcm1hdERlY29yYXRvcnMobWV0aG9kLmRlY29yYXRvcnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMpIHtcclxuICAgICAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1vZGlmaWVyS2luZCA9IG1ldGhvZC5tb2RpZmllcnNbMF0ua2luZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5qc2RvY3RhZ3MgPSBtYXJrZWR0YWdzKGpzZG9jdGFnc1swXS50YWdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVzdWx0LmpzZG9jdGFncyAmJiByZXN1bHQuanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1lcmdlVGFnc0FuZEFyZ3MocmVzdWx0LmFyZ3MsIHJlc3VsdC5qc2RvY3RhZ3MpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0LmFyZ3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWVyZ2VUYWdzQW5kQXJncyhyZXN1bHQuYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpc1BpcGVEZWNvcmF0b3IoZGVjb3JhdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSA/IGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gJ1BpcGUnIDogZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpc01vZHVsZURlY29yYXRvcihkZWNvcmF0b3IpIHtcclxuICAgICAgICByZXR1cm4gKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24pID8gZGVjb3JhdG9yLmV4cHJlc3Npb24uZXhwcmVzc2lvbi50ZXh0ID09PSAnTmdNb2R1bGUnIDogZmFsc2U7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRPdXRwdXQocHJvcGVydHksIG91dERlY29yYXRvciwgc291cmNlRmlsZT8pIHtcclxuICAgICAgICBsZXQgaW5BcmdzID0gb3V0RGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzO1xyXG4gICAgICAgIGxldCBfcmV0dXJuOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IChpbkFyZ3MubGVuZ3RoID4gMCkgPyBpbkFyZ3NbMF0udGV4dCA6IHByb3BlcnR5Lm5hbWUudGV4dCxcclxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBwcm9wZXJ0eS5pbml0aWFsaXplciA/IHRoaXMuc3RyaW5naWZ5RGVmYXVsdFZhbHVlKHByb3BlcnR5LmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHByb3BlcnR5LnN5bWJvbCkge1xyXG4gICAgICAgICAgICBfcmV0dXJuLmRlc2NyaXB0aW9uID0gbWFya2VkKHRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nKHByb3BlcnR5LnN5bWJvbC5nZXREb2N1bWVudGF0aW9uQ29tbWVudCgpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghX3JldHVybi5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICBpZiAocHJvcGVydHkuanNEb2MpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5qc0RvYy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0eS5qc0RvY1swXS5jb21tZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmV0dXJuLmRlc2NyaXB0aW9uID0gbWFya2VkKHByb3BlcnR5LmpzRG9jWzBdLmNvbW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBfcmV0dXJuLmxpbmUgPSB0aGlzLmdldFBvc2l0aW9uKHByb3BlcnR5LCBzb3VyY2VGaWxlKS5saW5lICsgMTtcclxuXHJcbiAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUpIHtcclxuICAgICAgICAgICAgX3JldHVybi50eXBlID0gdGhpcy52aXNpdFR5cGUocHJvcGVydHkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGhhbmRsZSBOZXdFeHByZXNzaW9uXHJcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LmluaXRpYWxpemVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTmV3RXhwcmVzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplci5leHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXR1cm4udHlwZSA9IHByb3BlcnR5LmluaXRpYWxpemVyLmV4cHJlc3Npb24udGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF9yZXR1cm47XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRBcmd1bWVudChhcmcpIHtcclxuICAgICAgICBsZXQgX3Jlc3VsdDogYW55ID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBhcmcubmFtZS50ZXh0LFxyXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnZpc2l0VHlwZShhcmcpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoYXJnLmRvdERvdERvdFRva2VuKSB7XHJcbiAgICAgICAgICAgIF9yZXN1bHQuZG90RG90RG90VG9rZW4gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXJnLnF1ZXN0aW9uVG9rZW4pIHtcclxuICAgICAgICAgICAgX3Jlc3VsdC5vcHRpb25hbCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhcmcudHlwZSkge1xyXG4gICAgICAgICAgICBpZiAoYXJnLnR5cGUua2luZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFyZy50eXBlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRnVuY3Rpb25UeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5mdW5jdGlvbiA9IGFyZy50eXBlLnBhcmFtZXRlcnMgPyBhcmcudHlwZS5wYXJhbWV0ZXJzLm1hcCgocHJvcCkgPT4gdGhpcy52aXNpdEFyZ3VtZW50KHByb3ApKSA6IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UG9zaXRpb24obm9kZSwgc291cmNlRmlsZSk6IHRzLkxpbmVBbmRDaGFyYWN0ZXIge1xyXG4gICAgICAgIGxldCBwb3NpdGlvbjogdHMuTGluZUFuZENoYXJhY3RlcjtcclxuICAgICAgICBpZiAobm9kZS5uYW1lICYmIG5vZGUubmFtZS5lbmQpIHtcclxuICAgICAgICAgICAgcG9zaXRpb24gPSB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzb3VyY2VGaWxlLCBub2RlLm5hbWUuZW5kKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKHNvdXJjZUZpbGUsIG5vZGUucG9zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRIb3N0TGlzdGVuZXIocHJvcGVydHksIGhvc3RMaXN0ZW5lckRlY29yYXRvciwgc291cmNlRmlsZT8pIHtcclxuICAgICAgICBsZXQgaW5BcmdzID0gaG9zdExpc3RlbmVyRGVjb3JhdG9yLmV4cHJlc3Npb24uYXJndW1lbnRzO1xyXG4gICAgICAgIGxldCBfcmV0dXJuOiBhbnkgPSB7fTtcclxuICAgICAgICBfcmV0dXJuLm5hbWUgPSAoaW5BcmdzLmxlbmd0aCA+IDApID8gaW5BcmdzWzBdLnRleHQgOiBwcm9wZXJ0eS5uYW1lLnRleHQ7XHJcbiAgICAgICAgX3JldHVybi5hcmdzID0gcHJvcGVydHkucGFyYW1ldGVycyA/IHByb3BlcnR5LnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW107XHJcbiAgICAgICAgX3JldHVybi5hcmdzRGVjb3JhdG9yID0gKGluQXJncy5sZW5ndGggPiAxKSA/IGluQXJnc1sxXS5lbGVtZW50cy5tYXAoKHByb3ApID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHByb3AudGV4dDtcclxuICAgICAgICB9KSA6IFtdO1xyXG4gICAgICAgIGlmIChwcm9wZXJ0eS5zeW1ib2wpIHtcclxuICAgICAgICAgICAgX3JldHVybi5kZXNjcmlwdGlvbiA9IG1hcmtlZCh0cy5kaXNwbGF5UGFydHNUb1N0cmluZyhwcm9wZXJ0eS5zeW1ib2wuZ2V0RG9jdW1lbnRhdGlvbkNvbW1lbnQoKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIV9yZXR1cm4uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnR5LmpzRG9jKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuanNEb2MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkuanNEb2NbMF0uY29tbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3JldHVybi5kZXNjcmlwdGlvbiA9IG1hcmtlZChwcm9wZXJ0eS5qc0RvY1swXS5jb21tZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgX3JldHVybi5saW5lID0gdGhpcy5nZXRQb3NpdGlvbihwcm9wZXJ0eSwgc291cmNlRmlsZSkubGluZSArIDE7XHJcbiAgICAgICAgcmV0dXJuIF9yZXR1cm47XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tICd1dGlsJztcclxuXHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcblxyXG5pbXBvcnQgeyBjb21waWxlckhvc3QsIGRldGVjdEluZGVudCB9IGZyb20gJy4uLy4uL3V0aWxpdGllcyc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uLy4uL2xvZ2dlcic7XHJcbmltcG9ydCB7IFJvdXRlclBhcnNlciB9IGZyb20gJy4uLy4uL3V0aWxzL3JvdXRlci5wYXJzZXInO1xyXG5pbXBvcnQgeyBtYXJrZWR0YWdzLCBtZXJnZVRhZ3NBbmRBcmdzIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXRpbHMnO1xyXG5pbXBvcnQgeyBraW5kVG9UeXBlIH0gZnJvbSAnLi4vLi4vdXRpbHMva2luZC10by10eXBlJztcclxuaW1wb3J0IHsgQ29kZUdlbmVyYXRvciB9IGZyb20gJy4vY29kZS1nZW5lcmF0b3InO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29uZmlndXJhdGlvbic7XHJcbmltcG9ydCB7ICRjb21wb25lbnRzVHJlZUVuZ2luZSB9IGZyb20gJy4uL2VuZ2luZXMvY29tcG9uZW50cy10cmVlLmVuZ2luZSc7XHJcbmltcG9ydCB7IE5vZGVPYmplY3QgfSBmcm9tICcuL25vZGUtb2JqZWN0LmludGVyZmFjZSc7XHJcbmltcG9ydCB7IERpcmVjdGl2ZURlcEZhY3RvcnkgfSBmcm9tICcuL2RlcHMvZGlyZWN0aXZlLWRlcC5mYWN0b3J5JztcclxuaW1wb3J0IHsgQ29tcG9uZW50SGVscGVyLCBDb21wb25lbnRDYWNoZSB9IGZyb20gJy4vZGVwcy9oZWxwZXJzL2NvbXBvbmVudC1oZWxwZXInO1xyXG5pbXBvcnQgeyBNb2R1bGVEZXBGYWN0b3J5IH0gZnJvbSAnLi9kZXBzL21vZHVsZS1kZXAuZmFjdG9yeSc7XHJcbmltcG9ydCB7IENvbXBvbmVudERlcEZhY3RvcnkgfSBmcm9tICcuL2RlcHMvY29tcG9uZW50LWRlcC5mYWN0b3J5JztcclxuaW1wb3J0IHsgTW9kdWxlSGVscGVyIH0gZnJvbSAnLi9kZXBzL2hlbHBlcnMvbW9kdWxlLWhlbHBlcic7XHJcbmltcG9ydCB7IEpzRG9jSGVscGVyIH0gZnJvbSAnLi9kZXBzL2hlbHBlcnMvanMtZG9jLWhlbHBlcic7XHJcbmltcG9ydCB7IFN5bWJvbEhlbHBlciwgTnNNb2R1bGVDYWNoZSB9IGZyb20gJy4vZGVwcy9oZWxwZXJzL3N5bWJvbC1oZWxwZXInO1xyXG5pbXBvcnQgeyBDbGFzc0hlbHBlciB9IGZyb20gJy4vZGVwcy9oZWxwZXJzL2NsYXNzLWhlbHBlcic7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25JbnRlcmZhY2UgfSBmcm9tICcuLi9pbnRlcmZhY2VzL2NvbmZpZ3VyYXRpb24uaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgSnNkb2NQYXJzZXJVdGlsIH0gZnJvbSAnLi4vLi4vdXRpbHMvanNkb2MtcGFyc2VyLnV0aWwnO1xyXG5pbXBvcnQge1xyXG4gICAgSUluamVjdGFibGVEZXAsXHJcbiAgICBJUGlwZURlcCxcclxuICAgIElEZXAsXHJcbiAgICBJSW50ZXJmYWNlRGVwLFxyXG4gICAgSUZ1bmN0aW9uRGVjRGVwLFxyXG4gICAgSUVudW1EZWNEZXAsXHJcbiAgICBJVHlwZUFsaWFzRGVjRGVwXHJcbn0gZnJvbSAnLi9kZXBlbmRlbmNpZXMuaW50ZXJmYWNlcyc7XHJcblxyXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcclxuXHJcbi8vIFR5cGVTY3JpcHQgcmVmZXJlbmNlIDogaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2Jsb2IvbWFzdGVyL2xpYi90eXBlc2NyaXB0LmQudHNcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzIHtcclxuXHJcbiAgICBwcml2YXRlIGZpbGVzOiBzdHJpbmdbXTtcclxuICAgIHByaXZhdGUgcHJvZ3JhbTogdHMuUHJvZ3JhbTtcclxuICAgIHByaXZhdGUgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyO1xyXG4gICAgcHJpdmF0ZSBlbmdpbmU6IGFueTtcclxuICAgIHByaXZhdGUgX19uc01vZHVsZTogTnNNb2R1bGVDYWNoZSA9IG5ldyBOc01vZHVsZUNhY2hlKCk7XHJcbiAgICBwcml2YXRlIGNhY2hlOiBDb21wb25lbnRDYWNoZSA9IG5ldyBDb21wb25lbnRDYWNoZSgpO1xyXG4gICAgcHJpdmF0ZSBjb21wb25lbnRIZWxwZXI6IENvbXBvbmVudEhlbHBlcjtcclxuICAgIHByaXZhdGUgbW9kdWxlSGVscGVyID0gbmV3IE1vZHVsZUhlbHBlcih0aGlzLl9fbnNNb2R1bGUsIHRoaXMuY2FjaGUpO1xyXG4gICAgcHJpdmF0ZSBqc0RvY0hlbHBlciA9IG5ldyBKc0RvY0hlbHBlcigpO1xyXG4gICAgcHJpdmF0ZSBzeW1ib2xIZWxwZXIgPSBuZXcgU3ltYm9sSGVscGVyKCk7XHJcbiAgICBwcml2YXRlIGNsYXNzSGVscGVyOiBDbGFzc0hlbHBlcjtcclxuXHJcbiAgICBwcml2YXRlIGpzZG9jUGFyc2VyVXRpbCA9IG5ldyBKc2RvY1BhcnNlclV0aWwoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBmaWxlczogc3RyaW5nW10sXHJcbiAgICAgICAgb3B0aW9uczogYW55LFxyXG4gICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogQ29uZmlndXJhdGlvbkludGVyZmFjZSkge1xyXG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlcztcclxuICAgICAgICBjb25zdCB0cmFuc3BpbGVPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHRzLlNjcmlwdFRhcmdldC5FUzUsXHJcbiAgICAgICAgICAgIG1vZHVsZTogdHMuTW9kdWxlS2luZC5Db21tb25KUyxcclxuICAgICAgICAgICAgdHNjb25maWdEaXJlY3Rvcnk6IG9wdGlvbnMudHNjb25maWdEaXJlY3RvcnlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0odGhpcy5maWxlcywgdHJhbnNwaWxlT3B0aW9ucywgY29tcGlsZXJIb3N0KHRyYW5zcGlsZU9wdGlvbnMpKTtcclxuICAgICAgICB0aGlzLnR5cGVDaGVja2VyID0gdGhpcy5wcm9ncmFtLmdldFR5cGVDaGVja2VyKCk7XHJcbiAgICAgICAgdGhpcy5jbGFzc0hlbHBlciA9IG5ldyBDbGFzc0hlbHBlcih0aGlzLnR5cGVDaGVja2VyLCB0aGlzLmNvbmZpZ3VyYXRpb24pO1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50SGVscGVyID0gbmV3IENvbXBvbmVudEhlbHBlcih0aGlzLl9fbnNNb2R1bGUsIHRoaXMuY2xhc3NIZWxwZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREZXBlbmRlbmNpZXMoKSB7XHJcbiAgICAgICAgbGV0IGRlcHMgPSB7XHJcbiAgICAgICAgICAgIG1vZHVsZXM6IFtdLFxyXG4gICAgICAgICAgICBtb2R1bGVzRm9yR3JhcGg6IFtdLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbXSxcclxuICAgICAgICAgICAgaW5qZWN0YWJsZXM6IFtdLFxyXG4gICAgICAgICAgICBwaXBlczogW10sXHJcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IFtdLFxyXG4gICAgICAgICAgICByb3V0ZXM6IFtdLFxyXG4gICAgICAgICAgICBjbGFzc2VzOiBbXSxcclxuICAgICAgICAgICAgaW50ZXJmYWNlczogW10sXHJcbiAgICAgICAgICAgIG1pc2NlbGxhbmVvdXM6IHtcclxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczogW10sXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbnM6IFtdLFxyXG4gICAgICAgICAgICAgICAgdHlwZWFsaWFzZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgZW51bWVyYXRpb25zOiBbXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByb3V0ZXNUcmVlOiB1bmRlZmluZWRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgc291cmNlRmlsZXMgPSB0aGlzLnByb2dyYW0uZ2V0U291cmNlRmlsZXMoKSB8fCBbXTtcclxuXHJcbiAgICAgICAgc291cmNlRmlsZXMubWFwKChmaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmlsZVBhdGggPSBmaWxlLmZpbGVOYW1lO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlUGF0aCkgPT09ICcudHMnKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmxhc3RJbmRleE9mKCcuZC50cycpID09PSAtMSAmJiBmaWxlUGF0aC5sYXN0SW5kZXhPZignc3BlYy50cycpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdwYXJzaW5nJywgZmlsZVBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0U291cmNlRmlsZURlY29yYXRvcnMoZmlsZSwgZGVwcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVwcztcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEVuZCBvZiBmaWxlIHNjYW5uaW5nXHJcbiAgICAgICAgLy8gVHJ5IG1lcmdpbmcgaW5zaWRlIHRoZSBzYW1lIGZpbGUgZGVjbGFyYXRlZCB2YXJpYWJsZXMgJiBtb2R1bGVzIHdpdGggaW1wb3J0cyB8IGV4cG9ydHMgfCBkZWNsYXJhdGlvbnMgfCBwcm92aWRlcnNcclxuXHJcbiAgICAgICAgaWYgKGRlcHMubWlzY2VsbGFuZW91cy52YXJpYWJsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBkZXBzLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLmZvckVhY2goX3ZhcmlhYmxlID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdWYXIgPSBbXTtcclxuICAgICAgICAgICAgICAgICgoX3ZhciwgX25ld1ZhcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldFR5cGUgcHIgcmVjb25zdHJ1aXJlLi4uLlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChfdmFyLmluaXRpYWxpemVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdmFyLmluaXRpYWxpemVyLmVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3Zhci5pbml0aWFsaXplci5lbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Zhci5pbml0aWFsaXplci5lbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Zhci5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBlbGVtZW50LnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdGhpcy5zeW1ib2xIZWxwZXIuZ2V0VHlwZShlbGVtZW50LnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkoX3ZhcmlhYmxlLCBuZXdWYXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBvbkxpbmsgPSAobW9kKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZC5maWxlID09PSBfdmFyaWFibGUuZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJvY2VzcyA9IChpbml0aWFsQXJyYXksIF92YXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmRleFRvQ2xlYW4gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmluZFZhcmlhYmxlSW5BcnJheSA9IChlbCwgaW5kZXgsIHRoZUFycmF5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsLm5hbWUgPT09IF92YXIubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleFRvQ2xlYW4gPSBpbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQXJyYXkuZm9yRWFjaChmaW5kVmFyaWFibGVJbkFycmF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsZWFuIGluZGV4ZXMgdG8gcmVwbGFjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEFycmF5LnNwbGljZShpbmRleFRvQ2xlYW4sIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCB2YXJpYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Zhci5mb3JFYWNoKChuZXdFbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBfLmZpbmQoaW5pdGlhbEFycmF5LCB7ICduYW1lJzogbmV3RWxlLm5hbWUgfSkgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQXJyYXkucHVzaChuZXdFbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MobW9kLmltcG9ydHMsIF92YXJpYWJsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MobW9kLmV4cG9ydHMsIF92YXJpYWJsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MobW9kLmRlY2xhcmF0aW9ucywgX3ZhcmlhYmxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcyhtb2QucHJvdmlkZXJzLCBfdmFyaWFibGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZGVwcy5tb2R1bGVzLmZvckVhY2gob25MaW5rKTtcclxuICAgICAgICAgICAgICAgIGRlcHMubW9kdWxlc0ZvckdyYXBoLmZvckVhY2gob25MaW5rKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSb3V0ZXJQYXJzZXIucHJpbnRNb2R1bGVzUm91dGVzKCk7XHJcbiAgICAgICAgLy8gUm91dGVyUGFyc2VyLnByaW50Um91dGVzKCk7XHJcblxyXG4gICAgICAgIC8qaWYgKFJvdXRlclBhcnNlci5pbmNvbXBsZXRlUm91dGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgaWYgKGRlcHNbJ21pc2NlbGxhbmVvdXMnXVsndmFyaWFibGVzJ10ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmZpeEluY29tcGxldGVSb3V0ZXMoZGVwc1snbWlzY2VsbGFuZW91cyddWyd2YXJpYWJsZXMnXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgLy8gJGNvbXBvbmVudHNUcmVlRW5naW5lLmNyZWF0ZVRyZWVzRm9yQ29tcG9uZW50cygpO1xyXG5cclxuICAgICAgICBSb3V0ZXJQYXJzZXIubGlua01vZHVsZXNBbmRSb3V0ZXMoKTtcclxuICAgICAgICBSb3V0ZXJQYXJzZXIuY29uc3RydWN0TW9kdWxlc1RyZWUoKTtcclxuXHJcbiAgICAgICAgZGVwcy5yb3V0ZXNUcmVlID0gUm91dGVyUGFyc2VyLmNvbnN0cnVjdFJvdXRlc1RyZWUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlcHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwcm9jZXNzQ2xhc3Mobm9kZSwgZmlsZSwgc3JjRmlsZSwgb3V0cHV0U3ltYm9scykge1xyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcclxuICAgICAgICBsZXQgSU8gPSB0aGlzLmdldENsYXNzSU8oZmlsZSwgc3JjRmlsZSwgbm9kZSk7XHJcbiAgICAgICAgbGV0IGRlcHM6IGFueSA9IHtcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgaWQ6ICdjbGFzcy0nICsgbmFtZSArICctJyArIERhdGUubm93KCksXHJcbiAgICAgICAgICAgIGZpbGU6IGZpbGUsXHJcbiAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXHJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoSU8uY29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgZGVwcy5jb25zdHJ1Y3Rvck9iaiA9IElPLmNvbnN0cnVjdG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoSU8ucHJvcGVydGllcykge1xyXG4gICAgICAgICAgICBkZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoSU8uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgZGVwcy5kZXNjcmlwdGlvbiA9IElPLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoSU8ubWV0aG9kcykge1xyXG4gICAgICAgICAgICBkZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoSU8uaW5kZXhTaWduYXR1cmVzKSB7XHJcbiAgICAgICAgICAgIGRlcHMuaW5kZXhTaWduYXR1cmVzID0gSU8uaW5kZXhTaWduYXR1cmVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoSU8uZXh0ZW5kcykge1xyXG4gICAgICAgICAgICBkZXBzLmV4dGVuZHMgPSBJTy5leHRlbmRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoSU8uanNkb2N0YWdzICYmIElPLmpzZG9jdGFncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGRlcHMuanNkb2N0YWdzID0gSU8uanNkb2N0YWdzWzBdLnRhZ3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChJTy5pbXBsZW1lbnRzICYmIElPLmltcGxlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBkZXBzLmltcGxlbWVudHMgPSBJTy5pbXBsZW1lbnRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRlYnVnKGRlcHMpO1xyXG4gICAgICAgIG91dHB1dFN5bWJvbHMuY2xhc3Nlcy5wdXNoKGRlcHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U291cmNlRmlsZURlY29yYXRvcnMoc3JjRmlsZTogdHMuU291cmNlRmlsZSwgb3V0cHV0U3ltYm9sczogYW55KTogdm9pZCB7XHJcblxyXG4gICAgICAgIGxldCBjbGVhbmVyID0gKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG4gICAgICAgIGxldCBmaWxlID0gc3JjRmlsZS5maWxlTmFtZS5yZXBsYWNlKGNsZWFuZXIsICcnKTtcclxuXHJcbiAgICAgICAgdHMuZm9yRWFjaENoaWxkKHNyY0ZpbGUsIChub2RlOiB0cy5Ob2RlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmpzRG9jSGVscGVyLmhhc0pTRG9jSW50ZXJuYWxUYWcoZmlsZSwgc3JjRmlsZSwgbm9kZSkgJiYgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVQcml2YXRlT3JJbnRlcm5hbFN1cHBvcnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5vZGUuZGVjb3JhdG9ycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNsYXNzV2l0aEN1c3RvbURlY29yYXRvciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZpc2l0Tm9kZSA9ICh2aXNpdGVkTm9kZSwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVwczogSURlcDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1ldGFkYXRhID0gbm9kZS5kZWNvcmF0b3JzO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy5nZXRTeW1ib2xlTmFtZShub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLmZpbmRQcm9wcyh2aXNpdGVkTm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IElPID0gdGhpcy5jb21wb25lbnRIZWxwZXIuZ2V0Q29tcG9uZW50SU8oZmlsZSwgc3JjRmlsZSwgbm9kZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTW9kdWxlKG1ldGFkYXRhKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVEZXAgPSBuZXcgTW9kdWxlRGVwRmFjdG9yeSh0aGlzLm1vZHVsZUhlbHBlcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jcmVhdGUoZmlsZSwgc3JjRmlsZSwgbmFtZSwgcHJvcHMsIElPKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJvdXRlclBhcnNlci5oYXNSb3V0ZXJNb2R1bGVJbkltcG9ydHMobW9kdWxlRGVwLmltcG9ydHMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb3V0ZXJQYXJzZXIuYWRkTW9kdWxlV2l0aFJvdXRlcyhuYW1lLCB0aGlzLm1vZHVsZUhlbHBlci5nZXRNb2R1bGVJbXBvcnRzUmF3KHByb3BzKSwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZE1vZHVsZShuYW1lLCBtb2R1bGVEZXAuaW1wb3J0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMubW9kdWxlcy5wdXNoKG1vZHVsZURlcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMubW9kdWxlc0ZvckdyYXBoLnB1c2gobW9kdWxlRGVwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IG1vZHVsZURlcDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNDb21wb25lbnQobWV0YWRhdGEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnREZXAgPSBuZXcgQ29tcG9uZW50RGVwRmFjdG9yeSh0aGlzLmNvbXBvbmVudEhlbHBlciwgdGhpcy5jb25maWd1cmF0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNyZWF0ZShmaWxlLCBzcmNGaWxlLCBuYW1lLCBwcm9wcywgSU8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY29tcG9uZW50c1RyZWVFbmdpbmUuYWRkQ29tcG9uZW50KGNvbXBvbmVudERlcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudERlcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSBjb21wb25lbnREZXA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzSW5qZWN0YWJsZShtZXRhZGF0YSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluamVjdGFibGVEZXBzOiBJSW5qZWN0YWJsZURlcCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2luamVjdGFibGUtJyArIG5hbWUgKyAnLScgKyBEYXRlLm5vdygpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbmplY3RhYmxlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IElPLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiBJTy5tZXRob2RzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IElPLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc3JjRmlsZS5nZXRUZXh0KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKElPLmNvbnN0cnVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RhYmxlRGVwcy5jb25zdHJ1Y3Rvck9iaiA9IElPLmNvbnN0cnVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGFibGVEZXBzLmpzZG9jdGFncyA9IElPLmpzZG9jdGFnc1swXS50YWdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMuaW5qZWN0YWJsZXMucHVzaChpbmplY3RhYmxlRGVwcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSBpbmplY3RhYmxlRGVwcztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNQaXBlKG1ldGFkYXRhKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGlwZURlcHM6IElQaXBlRGVwID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAncGlwZS0nICsgbmFtZSArICctJyArIERhdGUubm93KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3BpcGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IElPLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlQ29kZTogc3JjRmlsZS5nZXRUZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFtcGxlVXJsczogdGhpcy5jb21wb25lbnRIZWxwZXIuZ2V0Q29tcG9uZW50RXhhbXBsZVVybHMoc3JjRmlsZS5nZXRUZXh0KCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJTy5qc2RvY3RhZ3MgJiYgSU8uanNkb2N0YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGVEZXBzLmpzZG9jdGFncyA9IElPLmpzZG9jdGFnc1swXS50YWdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMucGlwZXMucHVzaChwaXBlRGVwcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMgPSBwaXBlRGVwcztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNEaXJlY3RpdmUobWV0YWRhdGEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlyZWN0aXZlRGVwcyA9IG5ldyBEaXJlY3RpdmVEZXBGYWN0b3J5KHRoaXMuY29tcG9uZW50SGVscGVyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNyZWF0ZShmaWxlLCBzcmNGaWxlLCBuYW1lLCBwcm9wcywgSU8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzLmRpcmVjdGl2ZXMucHVzaChkaXJlY3RpdmVEZXBzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcyA9IGRpcmVjdGl2ZURlcHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCBhIGNsYXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2xhc3NXaXRoQ3VzdG9tRGVjb3JhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc1dpdGhDdXN0b21EZWNvcmF0b3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzQ2xhc3Mobm9kZSwgZmlsZSwgc3JjRmlsZSwgb3V0cHV0U3ltYm9scyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS5zZXQobmFtZSwgZGVwcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhkZXBzKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGZpbHRlckJ5RGVjb3JhdG9ycyA9IChmaWx0ZXJlZE5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyZWROb2RlLmV4cHJlc3Npb24gJiYgZmlsdGVyZWROb2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgX3Rlc3QgPSAvKE5nTW9kdWxlfENvbXBvbmVudHxJbmplY3RhYmxlfFBpcGV8RGlyZWN0aXZlKS8udGVzdChmaWx0ZXJlZE5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIV90ZXN0ICYmIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGVzdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90ZXN0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbm9kZS5kZWNvcmF0b3JzXHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihmaWx0ZXJCeURlY29yYXRvcnMpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2godmlzaXROb2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnN5bWJvbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuc3ltYm9sLmZsYWdzID09PSB0cy5TeW1ib2xGbGFncy5DbGFzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0NsYXNzKG5vZGUsIGZpbGUsIHNyY0ZpbGUsIG91dHB1dFN5bWJvbHMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnN5bWJvbC5mbGFncyA9PT0gdHMuU3ltYm9sRmxhZ3MuSW50ZXJmYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0aGlzLmdldFN5bWJvbGVOYW1lKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBJTyA9IHRoaXMuZ2V0SW50ZXJmYWNlSU8oZmlsZSwgc3JjRmlsZSwgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGludGVyZmFjZURlcHM6IElJbnRlcmZhY2VEZXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnaW50ZXJmYWNlLScgKyBuYW1lICsgJy0nICsgRGF0ZS5ub3coKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ludGVyZmFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUNvZGU6IHNyY0ZpbGUuZ2V0VGV4dCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8ucHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcmZhY2VEZXBzLnByb3BlcnRpZXMgPSBJTy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8uaW5kZXhTaWduYXR1cmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVyZmFjZURlcHMuaW5kZXhTaWduYXR1cmVzID0gSU8uaW5kZXhTaWduYXR1cmVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8ua2luZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcmZhY2VEZXBzLmtpbmQgPSBJTy5raW5kO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJmYWNlRGVwcy5kZXNjcmlwdGlvbiA9IElPLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8ubWV0aG9kcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcmZhY2VEZXBzLm1ldGhvZHMgPSBJTy5tZXRob2RzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoSU8uZXh0ZW5kcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcmZhY2VEZXBzLmV4dGVuZHMgPSBJTy5leHRlbmRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGludGVyZmFjZURlcHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMuaW50ZXJmYWNlcy5wdXNoKGludGVyZmFjZURlcHMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRnVuY3Rpb25EZWNsYXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvcyA9IHRoaXMudmlzaXRGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWdzID0gdGhpcy52aXNpdEZ1bmN0aW9uRGVjbGFyYXRpb25KU0RvY1RhZ3Mobm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBpbmZvcy5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmdW5jdGlvbkRlcDogSUZ1bmN0aW9uRGVjRGVwID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbWlzY2VsbGFuZW91cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnR5cGU6ICdmdW5jdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnZpc2l0RW51bVR5cGVBbGlhc0Z1bmN0aW9uRGVjbGFyYXRpb25EZXNjcmlwdGlvbihub2RlKVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zLmFyZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb25EZXAuYXJncyA9IGluZm9zLmFyZ3M7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YWdzICYmIHRhZ3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbkRlcC5qc2RvY3RhZ3MgPSB0YWdzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLnB1c2goZnVuY3Rpb25EZXApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRW51bURlY2xhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zID0gdGhpcy52aXNpdEVudW1EZWNsYXJhdGlvbihub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IG5vZGUubmFtZS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnVtRGVwczogSUVudW1EZWNEZXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkczogaW5mb3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdtaXNjZWxsYW5lb3VzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VidHlwZTogJ2VudW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy52aXNpdEVudW1UeXBlQWxpYXNGdW5jdGlvbkRlY2xhcmF0aW9uRGVzY3JpcHRpb24obm9kZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMucHVzaChlbnVtRGVwcyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5UeXBlQWxpYXNEZWNsYXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvcyA9IHRoaXMudmlzaXRUeXBlRGVjbGFyYXRpb24obm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBpbmZvcy5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0eXBlQWxpYXNEZXBzOiBJVHlwZUFsaWFzRGVjRGVwID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbWlzY2VsbGFuZW91cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnR5cGU6ICd0eXBlYWxpYXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYXd0eXBlOiB0aGlzLmNsYXNzSGVscGVyLnZpc2l0VHlwZShub2RlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudmlzaXRFbnVtVHlwZUFsaWFzRnVuY3Rpb25EZWNsYXJhdGlvbkRlc2NyaXB0aW9uKG5vZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVBbGlhc0RlcHMua2luZCA9IG5vZGUudHlwZS5raW5kO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZUFsaWFzRGVwcy5yYXd0eXBlID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZUFsaWFzRGVwcy5yYXd0eXBlID0ga2luZFRvVHlwZShub2RlLnR5cGUua2luZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9scy5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLnB1c2godHlwZUFsaWFzRGVwcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgSU8gPSB0aGlzLmdldFJvdXRlSU8oZmlsZSwgc3JjRmlsZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoSU8ucm91dGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1JvdXRlcztcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSb3V0ZXMgPSBSb3V0ZXJQYXJzZXIuY2xlYW5SYXdSb3V0ZVBhcnNlZChJTy5yb3V0ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1JvdXRlcyBwYXJzaW5nIGVycm9yLCBtYXliZSBhIHRyYWlsaW5nIGNvbW1hIG9yIGFuIGV4dGVybmFsIHZhcmlhYmxlLCB0cnlpbmcgdG8gZml4IHRoYXQgbGF0ZXIgYWZ0ZXIgc291cmNlcyBzY2FubmluZy4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Um91dGVzID0gSU8ucm91dGVzLnJlcGxhY2UoLyAvZ20sICcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZEluY29tcGxldGVSb3V0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBuZXdSb3V0ZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9scy5yb3V0ZXMgPSBbLi4ub3V0cHV0U3ltYm9scy5yb3V0ZXMsIC4uLm5ld1JvdXRlc107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NDbGFzcyhub2RlLCBmaWxlLCBzcmNGaWxlLCBvdXRwdXRTeW1ib2xzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBib290c3RyYXBNb2R1bGVSZWZlcmVuY2UgPSAnYm9vdHN0cmFwTW9kdWxlJztcclxuICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSByb290IG1vZHVsZSB3aXRoIGJvb3RzdHJhcE1vZHVsZSBjYWxsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gMS4gZmluZCBhIHNpbXBsZSBjYWxsIDogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIDIuIG9yIGluc2lkZSBhIGNhbGwgOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIDMuIHdpdGggYSBjYXRjaCA6IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKS5ib290c3RyYXBNb2R1bGUoQXBwTW9kdWxlKS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gNC4gd2l0aCBwYXJhbWV0ZXJzIDogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUsIHt9KS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRmluZCByZWN1c2l2ZWx5IGluIGV4cHJlc3Npb24gbm9kZXMgb25lIHdpdGggbmFtZSAnYm9vdHN0cmFwTW9kdWxlJ1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByb290TW9kdWxlO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzcmNGaWxlLnRleHQuaW5kZXhPZihib290c3RyYXBNb2R1bGVSZWZlcmVuY2UpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHROb2RlID0gdGhpcy5maW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbnMobm9kZS5leHByZXNzaW9uLCAnYm9vdHN0cmFwTW9kdWxlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uICYmIG5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHMgJiYgbm9kZS5leHByZXNzaW9uLmFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Tm9kZSA9IHRoaXMuZmluZEV4cHJlc3Npb25CeU5hbWVJbkV4cHJlc3Npb25Bcmd1bWVudHMobm9kZS5leHByZXNzaW9uLmFyZ3VtZW50cywgJ2Jvb3RzdHJhcE1vZHVsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Tm9kZS5hcmd1bWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChyZXN1bHROb2RlLmFyZ3VtZW50cywgKGFyZ3VtZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50LnRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RNb2R1bGUgPSBhcmd1bWVudC50ZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vdE1vZHVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvdXRlclBhcnNlci5zZXRSb290TW9kdWxlKHJvb3RNb2R1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCAmJiAhdGhpcy5pc1ZhcmlhYmxlUm91dGVzKG5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9zOiBhbnkgPSB0aGlzLnZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbihub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGluZm9zLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlcHM6IGFueSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ21pc2NlbGxhbmVvdXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlOiAndmFyaWFibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBkZXBzLnR5cGUgPSAoaW5mb3MudHlwZSkgPyBpbmZvcy50eXBlIDogJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zLmRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlZmF1bHRWYWx1ZSA9IGluZm9zLmRlZmF1bHRWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zLmluaXRpYWxpemVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMuaW5pdGlhbGl6ZXIgPSBpbmZvcy5pbml0aWFsaXplcjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuanNEb2MgJiYgbm9kZS5qc0RvYy5sZW5ndGggPiAwICYmIG5vZGUuanNEb2NbMF0uY29tbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBzLmRlc2NyaXB0aW9uID0gbWFya2VkKG5vZGUuanNEb2NbMF0uY29tbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMubWlzY2VsbGFuZW91cy52YXJpYWJsZXMucHVzaChkZXBzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVHlwZUFsaWFzRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb3MgPSB0aGlzLnZpc2l0VHlwZURlY2xhcmF0aW9uKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gaW5mb3MubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVwczogYW55ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbWlzY2VsbGFuZW91cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnR5cGU6ICd0eXBlYWxpYXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYXd0eXBlOiB0aGlzLmNsYXNzSGVscGVyLnZpc2l0VHlwZShub2RlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMudmlzaXRFbnVtVHlwZUFsaWFzRnVuY3Rpb25EZWNsYXJhdGlvbkRlc2NyaXB0aW9uKG5vZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHMua2luZCA9IG5vZGUudHlwZS5raW5kO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRTeW1ib2xzLm1pc2NlbGxhbmVvdXMudHlwZWFsaWFzZXMucHVzaChkZXBzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRnVuY3Rpb25EZWNsYXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvcyA9IHRoaXMudmlzaXRGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gaW5mb3MubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVwczogYW55ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbWlzY2VsbGFuZW91cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnR5cGU6ICdmdW5jdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnZpc2l0RW51bVR5cGVBbGlhc0Z1bmN0aW9uRGVjbGFyYXRpb25EZXNjcmlwdGlvbihub2RlKVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZm9zLmFyZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwcy5hcmdzID0gaW5mb3MuYXJncztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0U3ltYm9scy5taXNjZWxsYW5lb3VzLmZ1bmN0aW9ucy5wdXNoKGRlcHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb3MgPSB0aGlzLnZpc2l0RW51bURlY2xhcmF0aW9uKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gbm9kZS5uYW1lLnRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlcHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkczogaW5mb3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdtaXNjZWxsYW5lb3VzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VidHlwZTogJ2VudW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy52aXNpdEVudW1UeXBlQWxpYXNGdW5jdGlvbkRlY2xhcmF0aW9uRGVzY3JpcHRpb24obm9kZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFN5bWJvbHMubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMucHVzaChkZXBzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRlYnVnKGRlcHM6IElEZXApIHtcclxuICAgICAgICBpZiAoZGVwcykge1xyXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ2ZvdW5kJywgYCR7ZGVwcy5uYW1lfWApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICAnaW1wb3J0cycsICdleHBvcnRzJywgJ2RlY2xhcmF0aW9ucycsICdwcm92aWRlcnMnLCAnYm9vdHN0cmFwJ1xyXG4gICAgICAgIF0uZm9yRWFjaChzeW1ib2xzID0+IHtcclxuICAgICAgICAgICAgaWYgKGRlcHNbc3ltYm9sc10gJiYgZGVwc1tzeW1ib2xzXS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJycsIGAtICR7c3ltYm9sc306YCk7XHJcbiAgICAgICAgICAgICAgICBkZXBzW3N5bWJvbHNdLm1hcChpID0+IGkubmFtZSkuZm9yRWFjaChkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJycsIGBcXHQtICR7ZH1gKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGlzVmFyaWFibGVSb3V0ZXMobm9kZSkge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUudHlwZU5hbWUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUudHlwZU5hbWUudGV4dCA9PT0gJ1JvdXRlcycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpbmRFeHByZXNzaW9uQnlOYW1lSW5FeHByZXNzaW9ucyhlbnRyeU5vZGUsIG5hbWUpIHtcclxuICAgICAgICBsZXQgcmVzdWx0O1xyXG4gICAgICAgIGxldCBsb29wID0gZnVuY3Rpb24gKG5vZGUsIHopIHtcclxuICAgICAgICAgICAgaWYgKG5vZGUuZXhwcmVzc2lvbiAmJiAhbm9kZS5leHByZXNzaW9uLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGxvb3Aobm9kZS5leHByZXNzaW9uLCB6KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uICYmIG5vZGUuZXhwcmVzc2lvbi5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5leHByZXNzaW9uLm5hbWUudGV4dCA9PT0geikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvb3Aobm9kZS5leHByZXNzaW9uLCB6KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbG9vcChlbnRyeU5vZGUsIG5hbWUpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbkFyZ3VtZW50cyhhcmcsIG5hbWUpIHtcclxuICAgICAgICBsZXQgcmVzdWx0O1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgbGV0IGxlbiA9IGFyZy5sZW5ndGg7XHJcbiAgICAgICAgbGV0IGxvb3AgPSBmdW5jdGlvbiAobm9kZSwgeikge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ib2R5LnN0YXRlbWVudHMgJiYgbm9kZS5ib2R5LnN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBqID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGVuZyA9IG5vZGUuYm9keS5zdGF0ZW1lbnRzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGo7IGogPCBsZW5nOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhhdC5maW5kRXhwcmVzc2lvbkJ5TmFtZUluRXhwcmVzc2lvbnMobm9kZS5ib2R5LnN0YXRlbWVudHNbal0sIHopO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbG9vcChhcmdbaV0sIG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VEZWNvcmF0b3JzKGRlY29yYXRvcnMsIHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICBpZiAoZGVjb3JhdG9ycy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIF8uZm9yRWFjaChkZWNvcmF0b3JzLCBmdW5jdGlvbiAoZGVjb3JhdG9yOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3IuZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlY29yYXRvci5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGRlY29yYXRvcnNbMF0uZXhwcmVzc2lvbi5leHByZXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9yc1swXS5leHByZXNzaW9uLmV4cHJlc3Npb24udGV4dCA9PT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzQ29tcG9uZW50KG1ldGFkYXRhcykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVjb3JhdG9ycyhtZXRhZGF0YXMsICdDb21wb25lbnQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzUGlwZShtZXRhZGF0YXMpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlY29yYXRvcnMobWV0YWRhdGFzLCAnUGlwZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaXNEaXJlY3RpdmUobWV0YWRhdGFzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VEZWNvcmF0b3JzKG1ldGFkYXRhcywgJ0RpcmVjdGl2ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaXNJbmplY3RhYmxlKG1ldGFkYXRhcykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRGVjb3JhdG9ycyhtZXRhZGF0YXMsICdJbmplY3RhYmxlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpc01vZHVsZShtZXRhZGF0YXMpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZURlY29yYXRvcnMobWV0YWRhdGFzLCAnTmdNb2R1bGUnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFN5bWJvbGVOYW1lKG5vZGUpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBub2RlLm5hbWUudGV4dDtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIHByaXZhdGUgZmluZFByb3BzKHZpc2l0ZWROb2RlKSB7XHJcbiAgICAgICAgaWYgKHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzICYmIHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IHBvcCA9IHZpc2l0ZWROb2RlLmV4cHJlc3Npb24uYXJndW1lbnRzLnBvcCgpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHBvcC5wcm9wZXJ0aWVzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvcC5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzQW5ndWxhckxpZmVjeWNsZUhvb2sobWV0aG9kTmFtZSkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IEFOR1VMQVJfTElGRUNZQ0xFX01FVEhPRFMgPSBbXHJcbiAgICAgICAgICAgICduZ09uSW5pdCcsICduZ09uQ2hhbmdlcycsICduZ0RvQ2hlY2snLCAnbmdPbkRlc3Ryb3knLCAnbmdBZnRlckNvbnRlbnRJbml0JywgJ25nQWZ0ZXJDb250ZW50Q2hlY2tlZCcsXHJcbiAgICAgICAgICAgICduZ0FmdGVyVmlld0luaXQnLCAnbmdBZnRlclZpZXdDaGVja2VkJywgJ3dyaXRlVmFsdWUnLCAncmVnaXN0ZXJPbkNoYW5nZScsICdyZWdpc3Rlck9uVG91Y2hlZCcsICdzZXREaXNhYmxlZFN0YXRlJ1xyXG4gICAgICAgIF07XHJcbiAgICAgICAgcmV0dXJuIEFOR1VMQVJfTElGRUNZQ0xFX01FVEhPRFMuaW5kZXhPZihtZXRob2ROYW1lKSA+PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRUeXBlRGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICAgIGxldCByZXN1bHQ6IGFueSA9IHtcclxuICAgICAgICAgICAgbmFtZTogbm9kZS5uYW1lLnRleHQsXHJcbiAgICAgICAgICAgIGtpbmQ6IG5vZGUua2luZFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IGpzZG9jdGFncyA9IHRoaXMuanNkb2NQYXJzZXJVdGlsLmdldEpTRG9jcyhub2RlKTtcclxuXHJcbiAgICAgICAgaWYgKGpzZG9jdGFncyAmJiBqc2RvY3RhZ3MubGVuZ3RoID49IDEpIHtcclxuICAgICAgICAgICAgaWYgKGpzZG9jdGFnc1swXS50YWdzKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuanNkb2N0YWdzID0gbWFya2VkdGFncyhqc2RvY3RhZ3NbMF0udGFncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZpc2l0QXJndW1lbnQoYXJnKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogYW55ID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBhcmcubmFtZS50ZXh0XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoYXJnLnR5cGUpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSB0aGlzLm1hcFR5cGUoYXJnLnR5cGUua2luZCk7XHJcbiAgICAgICAgICAgIGlmIChhcmcudHlwZS5raW5kID09PSAxNTcpIHtcclxuICAgICAgICAgICAgICAgIC8vIHRyeSByZXBsYWNlIFR5cGVSZWZlcmVuY2Ugd2l0aCB0eXBlTmFtZVxyXG4gICAgICAgICAgICAgICAgaWYgKGFyZy50eXBlLnR5cGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSBhcmcudHlwZS50eXBlTmFtZS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBtYXBUeXBlKHR5cGUpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIDk0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdOdWxsJztcclxuICAgICAgICAgICAgY2FzZSAxMTg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0FueSc7XHJcbiAgICAgICAgICAgIGNhc2UgMTIxOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdCb29sZWFuJztcclxuICAgICAgICAgICAgY2FzZSAxMjk6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ05ldmVyJztcclxuICAgICAgICAgICAgY2FzZSAxMzI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ051bWJlcic7XHJcbiAgICAgICAgICAgIGNhc2UgMTM0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdTdHJpbmcnO1xyXG4gICAgICAgICAgICBjYXNlIDEzNzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAnVW5kZWZpbmVkJztcclxuICAgICAgICAgICAgY2FzZSAxNTc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1R5cGVSZWZlcmVuY2UnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZpc2l0RnVuY3Rpb25EZWNsYXJhdGlvbihtZXRob2QpIHtcclxuICAgICAgICBsZXQgcmVzdWx0OiBhbnkgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IG1ldGhvZC5uYW1lLnRleHQsXHJcbiAgICAgICAgICAgIGFyZ3M6IG1ldGhvZC5wYXJhbWV0ZXJzID8gbWV0aG9kLnBhcmFtZXRlcnMubWFwKChwcm9wKSA9PiB0aGlzLnZpc2l0QXJndW1lbnQocHJvcCkpIDogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIGxldCBqc2RvY3RhZ3MgPSB0aGlzLmpzZG9jUGFyc2VyVXRpbC5nZXRKU0RvY3MobWV0aG9kKTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QudHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnJldHVyblR5cGUgPSB0aGlzLmNsYXNzSGVscGVyLnZpc2l0VHlwZShtZXRob2QudHlwZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVycykge1xyXG4gICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQubW9kaWZpZXJLaW5kID0gbWV0aG9kLm1vZGlmaWVyc1swXS5raW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChqc2RvY3RhZ3MgJiYganNkb2N0YWdzLmxlbmd0aCA+PSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChqc2RvY3RhZ3NbMF0udGFncykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmpzZG9jdGFncyA9IG1hcmtlZHRhZ3MoanNkb2N0YWdzWzBdLnRhZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2aXNpdFZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ6IGFueSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0ubmFtZS50ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLmluaXRpYWxpemVyID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFzc0hlbHBlci5zdHJpbmdpZnlEZWZhdWx0VmFsdWUobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLmluaXRpYWxpemVyKSA6IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuaW5pdGlhbGl6ZXIgPSBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0uaW5pdGlhbGl6ZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQudHlwZSA9IHRoaXMuY2xhc3NIZWxwZXIudmlzaXRUeXBlKG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS50eXBlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LnR5cGUgPT09ICd1bmRlZmluZWQnICYmIHJlc3VsdC5pbml0aWFsaXplcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC50eXBlID0ga2luZFRvVHlwZShyZXN1bHQuaW5pdGlhbGl6ZXIua2luZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdmlzaXRGdW5jdGlvbkRlY2xhcmF0aW9uSlNEb2NUYWdzKG5vZGUpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBqc2RvY3RhZ3MgPSB0aGlzLmpzZG9jUGFyc2VyVXRpbC5nZXRKU0RvY3Mobm9kZSk7XHJcbiAgICAgICAgbGV0IHJlc3VsdDtcclxuICAgICAgICBpZiAoanNkb2N0YWdzICYmIGpzZG9jdGFncy5sZW5ndGggPj0gMSkge1xyXG4gICAgICAgICAgICBpZiAoanNkb2N0YWdzWzBdLnRhZ3MpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG1hcmtlZHRhZ3MoanNkb2N0YWdzWzBdLnRhZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2aXNpdEVudW1UeXBlQWxpYXNGdW5jdGlvbkRlY2xhcmF0aW9uRGVzY3JpcHRpb24obm9kZSk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uOiBzdHJpbmcgPSAnJztcclxuICAgICAgICBpZiAobm9kZS5qc0RvYykge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5qc0RvYy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG5vZGUuanNEb2NbMF0uY29tbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IG1hcmtlZChub2RlLmpzRG9jWzBdLmNvbW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHZpc2l0RW51bURlY2xhcmF0aW9uKG5vZGUpIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gW107XHJcbiAgICAgICAgaWYgKG5vZGUubWVtYmVycykge1xyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBub2RlLm1lbWJlcnMubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1lbWJlcjogYW55ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUubWVtYmVyc1tpXS5uYW1lLnRleHRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5tZW1iZXJzW2ldLmluaXRpYWxpemVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVtYmVyLnZhbHVlID0gbm9kZS5tZW1iZXJzW2ldLmluaXRpYWxpemVyLnRleHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtZW1iZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB2aXNpdEVudW1EZWNsYXJhdGlvbkZvclJvdXRlcyhmaWxlTmFtZSwgbm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gbm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbaV0udHlwZS50eXBlTmFtZS50ZXh0ID09PSAnUm91dGVzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IG5ldyBDb2RlR2VuZXJhdG9yKCkuZ2VuZXJhdGUobm9kZS5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zW2ldLmluaXRpYWxpemVyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgUm91dGVyUGFyc2VyLmFkZFJvdXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1tpXS5uYW1lLnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBSb3V0ZXJQYXJzZXIuY2xlYW5SYXdSb3V0ZShkYXRhKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlTmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZXM6IGRhdGFcclxuICAgICAgICAgICAgICAgICAgICAgICAgfV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJvdXRlSU8oZmlsZW5hbWUsIHNvdXJjZUZpbGUpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgcmVzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzLnJlZHVjZSgoZGlyZWN0aXZlLCBzdGF0ZW1lbnQpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZS5jb25jYXQodGhpcy52aXNpdEVudW1EZWNsYXJhdGlvbkZvclJvdXRlcyhmaWxlbmFtZSwgc3RhdGVtZW50KSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmU7XHJcbiAgICAgICAgfSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW10pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzWzBdIHx8IHt9O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGdldENsYXNzSU8oZmlsZW5hbWU6IHN0cmluZywgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZSkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvcHlyaWdodCBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCByZXMgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMucmVkdWNlKChkaXJlY3RpdmUsIHN0YXRlbWVudCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQucG9zID09PSBub2RlLnBvcyAmJiBzdGF0ZW1lbnQuZW5kID09PSBub2RlLmVuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMuY2xhc3NIZWxwZXIudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQsIHNvdXJjZUZpbGUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRJbnRlcmZhY2VJTyhmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2VGaWxlLCBub2RlKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29weXJpZ2h0IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgbGV0IHJlcyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKGRpcmVjdGl2ZSwgc3RhdGVtZW50KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZW1lbnQucG9zID09PSBub2RlLnBvcyAmJiBzdGF0ZW1lbnQuZW5kID09PSBub2RlLmVuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3RpdmUuY29uY2F0KHRoaXMuY2xhc3NIZWxwZXIudmlzaXRDbGFzc0RlY2xhcmF0aW9uKGZpbGVuYW1lLCBzdGF0ZW1lbnQsIHNvdXJjZUZpbGUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcclxuICAgICAgICB9LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXNbMF0gfHwge307XHJcbiAgICB9XHJcblxyXG59XHJcbiIsImV4cG9ydCBmdW5jdGlvbiBwcm9taXNlU2VxdWVudGlhbChwcm9taXNlcykge1xyXG5cclxuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9taXNlcykpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWQgdG8gYmUgYW4gYXJyYXkgb2YgUHJvbWlzZXMnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgIGxldCByZXN1bHRzID0gW107XHJcblxyXG4gICAgICAgIGNvbnN0IGl0ZXJhdGVlRnVuYyA9IChwcmV2aW91c1Byb21pc2UsIGN1cnJlbnRQcm9taXNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2VcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCsrICE9PSAwKSByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFByb21pc2UocmVzdWx0LCByZXN1bHRzLCBjb3VudCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb21pc2VzID0gcHJvbWlzZXMuY29uY2F0KCgpID0+IFByb21pc2UucmVzb2x2ZSgpKTtcclxuXHJcbiAgICAgICAgcHJvbWlzZXNcclxuICAgICAgICAgICAgLnJlZHVjZShpdGVyYXRlZUZ1bmMsIFByb21pc2UucmVzb2x2ZShmYWxzZSkpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICB9KTtcclxufTtcclxuIiwiaW1wb3J0IHsgUGFyc2VkRGF0YSB9IGZyb20gJy4uL2ludGVyZmFjZXMvcGFyc2VkLWRhdGEuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgTWlzY2VsbGFuZW91c0RhdGEgfSBmcm9tICcuLi9pbnRlcmZhY2VzL21pc2NlbGxhbmVvdXMtZGF0YS5pbnRlcmZhY2UnO1xyXG5cclxuaW1wb3J0IHsgZ2V0TmFtZXNDb21wYXJlRm4gfSBmcm9tICcuLi8uLi91dGlscy91dGlscyc7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IHsgSU1vZHVsZURlcCB9IGZyb20gJy4uL2NvbXBpbGVyL2RlcHMvbW9kdWxlLWRlcC5mYWN0b3J5JztcclxuaW1wb3J0IHsgSUNvbXBvbmVudERlcCB9IGZyb20gJy4uL2NvbXBpbGVyL2RlcHMvY29tcG9uZW50LWRlcC5mYWN0b3J5JztcclxuaW1wb3J0IHsgSURpcmVjdGl2ZURlcCB9IGZyb20gJy4uL2NvbXBpbGVyL2RlcHMvZGlyZWN0aXZlLWRlcC5mYWN0b3J5JztcclxuaW1wb3J0IHsgSUFwaVNvdXJjZVJlc3VsdCB9IGZyb20gJy4uLy4uL3V0aWxzL2FwaS1zb3VyY2UtcmVzdWx0LmludGVyZmFjZSc7XHJcbmltcG9ydCB7IEFuZ3VsYXJBcGlVdGlsIH0gZnJvbSAnLi4vLi4vdXRpbHMvYW5ndWxhci1hcGkudXRpbCc7XHJcbmltcG9ydCB7XHJcbiAgICBJSW5qZWN0YWJsZURlcCxcclxuICAgIElJbnRlcmZhY2VEZXAsXHJcbiAgICBJUGlwZURlcCxcclxuICAgIElUeXBlQWxpYXNEZWNEZXAsXHJcbiAgICBJRnVuY3Rpb25EZWNEZXAsXHJcbiAgICBJRW51bURlY0RlcFxyXG59IGZyb20gJy4uL2NvbXBpbGVyL2RlcGVuZGVuY2llcy5pbnRlcmZhY2VzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBEZXBlbmRlbmNpZXNFbmdpbmUge1xyXG4gICAgcHVibGljIHJhd0RhdGE6IFBhcnNlZERhdGE7XHJcbiAgICBwdWJsaWMgbW9kdWxlczogT2JqZWN0W107XHJcbiAgICBwdWJsaWMgcmF3TW9kdWxlczogT2JqZWN0W107XHJcbiAgICBwdWJsaWMgcmF3TW9kdWxlc0Zvck92ZXJ2aWV3OiBPYmplY3RbXTtcclxuICAgIHB1YmxpYyBjb21wb25lbnRzOiBPYmplY3RbXTtcclxuICAgIHB1YmxpYyBkaXJlY3RpdmVzOiBPYmplY3RbXTtcclxuICAgIHB1YmxpYyBpbmplY3RhYmxlczogT2JqZWN0W107XHJcbiAgICBwdWJsaWMgaW50ZXJmYWNlczogT2JqZWN0W107XHJcbiAgICBwdWJsaWMgcm91dGVzOiBPYmplY3RbXTtcclxuICAgIHB1YmxpYyBwaXBlczogT2JqZWN0W107XHJcbiAgICBwdWJsaWMgY2xhc3NlczogT2JqZWN0W107XHJcbiAgICBwdWJsaWMgbWlzY2VsbGFuZW91czogTWlzY2VsbGFuZW91c0RhdGE7XHJcblxyXG4gICAgcHJpdmF0ZSBhbmd1bGFyQXBpVXRpbDogQW5ndWxhckFwaVV0aWwgPSBuZXcgQW5ndWxhckFwaVV0aWwoKTtcclxuXHJcbiAgICBwcml2YXRlIGNsZWFuTW9kdWxlcyhtb2R1bGVzKSB7XHJcbiAgICAgICAgbGV0IF9tID0gbW9kdWxlcztcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgbGV0IGxlbiA9IG1vZHVsZXMubGVuZ3RoO1xyXG5cclxuICAgICAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgaiA9IDA7XHJcbiAgICAgICAgICAgIGxldCBsZW5nID0gX21baV0uZGVjbGFyYXRpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yIChqOyBqIDwgbGVuZzsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgayA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuZ3Q7XHJcbiAgICAgICAgICAgICAgICBpZiAoX21baV0uZGVjbGFyYXRpb25zW2pdLmpzZG9jdGFncykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0ID0gX21baV0uZGVjbGFyYXRpb25zW2pdLmpzZG9jdGFncy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrOyBrIDwgbGVuZ3Q7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgX21baV0uZGVjbGFyYXRpb25zW2pdLmpzZG9jdGFnc1trXS5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKF9tW2ldLmRlY2xhcmF0aW9uc1tqXS5jb25zdHJ1Y3Rvck9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChfbVtpXS5kZWNsYXJhdGlvbnNbal0uY29uc3RydWN0b3JPYmouanNkb2N0YWdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0ID0gX21baV0uZGVjbGFyYXRpb25zW2pdLmNvbnN0cnVjdG9yT2JqLmpzZG9jdGFncy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoazsgayA8IGxlbmd0OyBrKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBfbVtpXS5kZWNsYXJhdGlvbnNbal0uY29uc3RydWN0b3JPYmouanNkb2N0YWdzW2tdLnBhcmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX207XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoZGF0YTogUGFyc2VkRGF0YSkge1xyXG4gICAgICAgIHRoaXMucmF3RGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5tb2R1bGVzID0gXy5zb3J0QnkodGhpcy5yYXdEYXRhLm1vZHVsZXMsIFsnbmFtZSddKTtcclxuICAgICAgICB0aGlzLnJhd01vZHVsZXNGb3JPdmVydmlldyA9IF8uc29ydEJ5KGRhdGEubW9kdWxlc0ZvckdyYXBoLCBbJ25hbWUnXSk7XHJcbiAgICAgICAgdGhpcy5yYXdNb2R1bGVzID0gXy5zb3J0QnkoZGF0YS5tb2R1bGVzRm9yR3JhcGgsIFsnbmFtZSddKTtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSBfLnNvcnRCeSh0aGlzLnJhd0RhdGEuY29tcG9uZW50cywgWyduYW1lJ10pO1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5kaXJlY3RpdmVzLCBbJ25hbWUnXSk7XHJcbiAgICAgICAgdGhpcy5pbmplY3RhYmxlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbmplY3RhYmxlcywgWyduYW1lJ10pO1xyXG4gICAgICAgIHRoaXMuaW50ZXJmYWNlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5pbnRlcmZhY2VzLCBbJ25hbWUnXSk7XHJcbiAgICAgICAgdGhpcy5waXBlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5waXBlcywgWyduYW1lJ10pO1xyXG4gICAgICAgIHRoaXMuY2xhc3NlcyA9IF8uc29ydEJ5KHRoaXMucmF3RGF0YS5jbGFzc2VzLCBbJ25hbWUnXSk7XHJcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzID0gdGhpcy5yYXdEYXRhLm1pc2NlbGxhbmVvdXM7XHJcbiAgICAgICAgdGhpcy5wcmVwYXJlTWlzY2VsbGFuZW91cygpO1xyXG4gICAgICAgIHRoaXMucm91dGVzID0gdGhpcy5yYXdEYXRhLnJvdXRlc1RyZWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaW5kSW5Db21wb2RvY0RlcGVuZGVuY2llcyh0eXBlLCBkYXRhKTogSUFwaVNvdXJjZVJlc3VsdDxhbnk+IHtcclxuICAgICAgICBsZXQgX3Jlc3VsdCA9IHtcclxuICAgICAgICAgICAgc291cmNlOiAnaW50ZXJuYWwnLFxyXG4gICAgICAgICAgICBkYXRhOiB1bmRlZmluZWRcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKGRhdGFbaV0ubmFtZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdC5kYXRhID0gZGF0YVtpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3Jlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZmluZCh0eXBlOiBzdHJpbmcpOiBJQXBpU291cmNlUmVzdWx0PGFueT4gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCBzZWFyY2hGdW5jdGlvbnM6IEFycmF5PCgpID0+IElBcGlTb3VyY2VSZXN1bHQ8YW55Pj4gPSBbXHJcbiAgICAgICAgICAgICgpID0+IHRoaXMuZmluZEluQ29tcG9kb2NEZXBlbmRlbmNpZXModHlwZSwgdGhpcy5pbmplY3RhYmxlcyksXHJcbiAgICAgICAgICAgICgpID0+IHRoaXMuZmluZEluQ29tcG9kb2NEZXBlbmRlbmNpZXModHlwZSwgdGhpcy5pbnRlcmZhY2VzKSxcclxuICAgICAgICAgICAgKCkgPT4gdGhpcy5maW5kSW5Db21wb2RvY0RlcGVuZGVuY2llcyh0eXBlLCB0aGlzLmNsYXNzZXMpLFxyXG4gICAgICAgICAgICAoKSA9PiB0aGlzLmZpbmRJbkNvbXBvZG9jRGVwZW5kZW5jaWVzKHR5cGUsIHRoaXMuY29tcG9uZW50cyksXHJcbiAgICAgICAgICAgICgpID0+IHRoaXMuZmluZEluQ29tcG9kb2NEZXBlbmRlbmNpZXModHlwZSwgdGhpcy5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcyksXHJcbiAgICAgICAgICAgICgpID0+IHRoaXMuZmluZEluQ29tcG9kb2NEZXBlbmRlbmNpZXModHlwZSwgdGhpcy5taXNjZWxsYW5lb3VzLmZ1bmN0aW9ucyksXHJcbiAgICAgICAgICAgICgpID0+IHRoaXMuZmluZEluQ29tcG9kb2NEZXBlbmRlbmNpZXModHlwZSwgdGhpcy5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzKSxcclxuICAgICAgICAgICAgKCkgPT4gdGhpcy5maW5kSW5Db21wb2RvY0RlcGVuZGVuY2llcyh0eXBlLCB0aGlzLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zKSxcclxuICAgICAgICAgICAgKCkgPT4gdGhpcy5hbmd1bGFyQXBpVXRpbC5maW5kQXBpKHR5cGUpXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgc2VhcmNoRnVuY3Rpb24gb2Ygc2VhcmNoRnVuY3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBzZWFyY2hGdW5jdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGUodXBkYXRlZERhdGEpOiB2b2lkIHtcclxuICAgICAgICBpZiAodXBkYXRlZERhdGEubW9kdWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5tb2R1bGVzLCAobW9kdWxlOiBJTW9kdWxlRGVwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5tb2R1bGVzLCB7ICduYW1lJzogbW9kdWxlLm5hbWUgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZXNbX2luZGV4XSA9IG1vZHVsZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh1cGRhdGVkRGF0YS5jb21wb25lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLmNvbXBvbmVudHMsIChjb21wb25lbnQ6IElDb21wb25lbnREZXApID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBfaW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLmNvbXBvbmVudHMsIHsgJ25hbWUnOiBjb21wb25lbnQubmFtZSB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50c1tfaW5kZXhdID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmRpcmVjdGl2ZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEuZGlyZWN0aXZlcywgKGRpcmVjdGl2ZTogSURpcmVjdGl2ZURlcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMuZGlyZWN0aXZlcywgeyAnbmFtZSc6IGRpcmVjdGl2ZS5uYW1lIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzW19pbmRleF0gPSBkaXJlY3RpdmU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXBkYXRlZERhdGEuaW5qZWN0YWJsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEuaW5qZWN0YWJsZXMsIChpbmplY3RhYmxlOiBJSW5qZWN0YWJsZURlcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMuaW5qZWN0YWJsZXMsIHsgJ25hbWUnOiBpbmplY3RhYmxlLm5hbWUgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluamVjdGFibGVzW19pbmRleF0gPSBpbmplY3RhYmxlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEuaW50ZXJmYWNlcywgKGludDogSUludGVyZmFjZURlcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMuaW50ZXJmYWNlcywgeyAnbmFtZSc6IGludC5uYW1lIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2VzW19pbmRleF0gPSBpbnQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXBkYXRlZERhdGEucGlwZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEucGlwZXMsIChwaXBlOiBJUGlwZURlcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMucGlwZXMsIHsgJ25hbWUnOiBwaXBlLm5hbWUgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcGVzW19pbmRleF0gPSBwaXBlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLmNsYXNzZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBfLmZvckVhY2godXBkYXRlZERhdGEuY2xhc3NlcywgKGNsYXNzZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5jbGFzc2VzLCB7ICduYW1lJzogY2xhc3NlLm5hbWUgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzZXNbX2luZGV4XSA9IGNsYXNzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE1pc2NlbGxhbmVvdXMgdXBkYXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLCAodmFyaWFibGU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IF9pbmRleCA9IF8uZmluZEluZGV4KHRoaXMubWlzY2VsbGFuZW91cy52YXJpYWJsZXMsIHtcclxuICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IHZhcmlhYmxlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGUnOiB2YXJpYWJsZS5maWxlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy52YXJpYWJsZXNbX2luZGV4XSA9IHZhcmlhYmxlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLCAoZnVuYzogSUZ1bmN0aW9uRGVjRGVwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5taXNjZWxsYW5lb3VzLmZ1bmN0aW9ucywge1xyXG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogZnVuYy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICdmaWxlJzogZnVuYy5maWxlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5mdW5jdGlvbnNbX2luZGV4XSA9IGZ1bmM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXBkYXRlZERhdGEubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIF8uZm9yRWFjaCh1cGRhdGVkRGF0YS5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLCAodHlwZWFsaWFzOiBJVHlwZUFsaWFzRGVjRGVwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiB0eXBlYWxpYXMubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAnZmlsZSc6IHR5cGVhbGlhcy5maWxlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlc1tfaW5kZXhdID0gdHlwZWFsaWFzO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgXy5mb3JFYWNoKHVwZGF0ZWREYXRhLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLCAoZW51bWVyYXRpb246IElFbnVtRGVjRGVwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgX2luZGV4ID0gXy5maW5kSW5kZXgodGhpcy5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9ucywge1xyXG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogZW51bWVyYXRpb24ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAnZmlsZSc6IGVudW1lcmF0aW9uLmZpbGVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9uc1tfaW5kZXhdID0gZW51bWVyYXRpb247XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXBhcmVNaXNjZWxsYW5lb3VzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGZpbmRJbkNvbXBvZG9jKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBtZXJnZWREYXRhID0gXy5jb25jYXQoW10sIHRoaXMubW9kdWxlcywgdGhpcy5jb21wb25lbnRzLCB0aGlzLmRpcmVjdGl2ZXMsXHJcbiAgICAgICAgICAgIHRoaXMuaW5qZWN0YWJsZXMsIHRoaXMuaW50ZXJmYWNlcywgdGhpcy5waXBlcywgdGhpcy5jbGFzc2VzKTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gXy5maW5kKG1lcmdlZERhdGEsIHsgJ25hbWUnOiBuYW1lIH0gYXMgYW55KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0IHx8IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcHJlcGFyZU1pc2NlbGxhbmVvdXMoKSB7XHJcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcy5zb3J0KGdldE5hbWVzQ29tcGFyZUZuKCkpO1xyXG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMuc29ydChnZXROYW1lc0NvbXBhcmVGbigpKTtcclxuICAgICAgICB0aGlzLm1pc2NlbGxhbmVvdXMuZW51bWVyYXRpb25zLnNvcnQoZ2V0TmFtZXNDb21wYXJlRm4oKSk7XHJcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLnR5cGVhbGlhc2VzLnNvcnQoZ2V0TmFtZXNDb21wYXJlRm4oKSk7XHJcbiAgICAgICAgLy8gZ3JvdXAgZWFjaCBzdWJnb3VwIGJ5IGZpbGVcclxuICAgICAgICB0aGlzLm1pc2NlbGxhbmVvdXMuZ3JvdXBlZFZhcmlhYmxlcyA9IF8uZ3JvdXBCeSh0aGlzLm1pc2NlbGxhbmVvdXMudmFyaWFibGVzLCAnZmlsZScpO1xyXG4gICAgICAgIHRoaXMubWlzY2VsbGFuZW91cy5ncm91cGVkRnVuY3Rpb25zID0gXy5ncm91cEJ5KHRoaXMubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMsICdmaWxlJyk7XHJcbiAgICAgICAgdGhpcy5taXNjZWxsYW5lb3VzLmdyb3VwZWRFbnVtZXJhdGlvbnMgPSBfLmdyb3VwQnkodGhpcy5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9ucywgJ2ZpbGUnKTtcclxuICAgICAgICB0aGlzLm1pc2NlbGxhbmVvdXMuZ3JvdXBlZFR5cGVBbGlhc2VzID0gXy5ncm91cEJ5KHRoaXMubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcywgJ2ZpbGUnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TW9kdWxlKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBfLmZpbmQodGhpcy5tb2R1bGVzLCBbJ25hbWUnLCBuYW1lXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFJhd01vZHVsZShuYW1lOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiBfLmZpbmQodGhpcy5yYXdNb2R1bGVzLCBbJ25hbWUnLCBuYW1lXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1vZHVsZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kdWxlcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXREaXJlY3RpdmVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEluamVjdGFibGVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluamVjdGFibGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRJbnRlcmZhY2VzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFJvdXRlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yb3V0ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBpcGVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBpcGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDbGFzc2VzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNsYXNzZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1pc2NlbGxhbmVvdXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlzY2VsbGFuZW91cztcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCAqIGFzIExpdmVTZXJ2ZXIgZnJvbSAnbGl2ZS1zZXJ2ZXInO1xyXG5pbXBvcnQgKiBhcyBTaGVsbGpzIGZyb20gJ3NoZWxsanMnO1xyXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XHJcbmNvbnN0IHRzID0gcmVxdWlyZSgndHlwZXNjcmlwdCcpO1xyXG5pbXBvcnQgKiBhcyBnbG9iIGZyb20gJ2dsb2InO1xyXG5cclxuY29uc3QgY2hva2lkYXIgPSByZXF1aXJlKCdjaG9raWRhcicpO1xyXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcclxuXHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlcic7XHJcbmltcG9ydCB7IEh0bWxFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvaHRtbC5lbmdpbmUnO1xyXG5pbXBvcnQgeyBNYXJrZG93bkVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9tYXJrZG93bi5lbmdpbmUnO1xyXG5pbXBvcnQgeyBGaWxlRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2ZpbGUuZW5naW5lJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vY29uZmlndXJhdGlvbic7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25JbnRlcmZhY2UgfSBmcm9tICcuL2ludGVyZmFjZXMvY29uZmlndXJhdGlvbi5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBOZ2RFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvbmdkLmVuZ2luZSc7XHJcbmltcG9ydCB7IFNlYXJjaEVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9zZWFyY2guZW5naW5lJztcclxuaW1wb3J0IHsgRGVwZW5kZW5jaWVzIH0gZnJvbSAnLi9jb21waWxlci9kZXBlbmRlbmNpZXMnO1xyXG5pbXBvcnQgeyBSb3V0ZXJQYXJzZXIgfSBmcm9tICcuLi91dGlscy9yb3V0ZXIucGFyc2VyJztcclxuXHJcbmltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi4vdXRpbHMvZGVmYXVsdHMnO1xyXG5cclxuXHJcbmltcG9ydCB7IGNsZWFuU291cmNlc0ZvcldhdGNoIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xyXG5cclxuaW1wb3J0IHsgY2xlYW5OYW1lV2l0aG91dFNwYWNlQW5kVG9Mb3dlckNhc2UsIGZpbmRNYWluU291cmNlRm9sZGVyIH0gZnJvbSAnLi4vdXRpbGl0aWVzJztcclxuXHJcbmltcG9ydCB7IHByb21pc2VTZXF1ZW50aWFsIH0gZnJvbSAnLi4vdXRpbHMvcHJvbWlzZS1zZXF1ZW50aWFsJztcclxuaW1wb3J0IHsgRGVwZW5kZW5jaWVzRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2RlcGVuZGVuY2llcy5lbmdpbmUnO1xyXG5pbXBvcnQgeyBBbmd1bGFyVmVyc2lvblV0aWwgfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5sZXQgcGtnID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJyk7XHJcbmxldCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xyXG5sZXQgJG1hcmtkb3duZW5naW5lID0gbmV3IE1hcmtkb3duRW5naW5lKCk7XHJcbmxldCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uIHtcclxuICAgIC8qKlxyXG4gICAgICogRmlsZXMgcHJvY2Vzc2VkIGR1cmluZyBpbml0aWFsIHNjYW5uaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBmaWxlczogQXJyYXk8c3RyaW5nPjtcclxuICAgIC8qKlxyXG4gICAgICogRmlsZXMgcHJvY2Vzc2VkIGR1cmluZyB3YXRjaCBzY2FubmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdXBkYXRlZEZpbGVzOiBBcnJheTxzdHJpbmc+O1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaWxlcyBjaGFuZ2VkIGR1cmluZyB3YXRjaCBzY2FubmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgd2F0Y2hDaGFuZ2VkRmlsZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgIC8qKlxyXG4gICAgICogQ29tcG9kb2MgY29uZmlndXJhdGlvbiBsb2NhbCByZWZlcmVuY2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNvbmZpZ3VyYXRpb246IENvbmZpZ3VyYXRpb25JbnRlcmZhY2U7XHJcbiAgICAvKipcclxuICAgICAqIEJvb2xlYW4gZm9yIHdhdGNoaW5nIHN0YXR1c1xyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc1dhdGNoaW5nOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBhbmd1bGFyVmVyc2lvblV0aWwgPSBuZXcgQW5ndWxhclZlcnNpb25VdGlsKCk7XHJcbiAgICBwcml2YXRlIGRlcGVuZGVuY2llc0VuZ2luZTogRGVwZW5kZW5jaWVzRW5naW5lO1xyXG4gICAgcHJpdmF0ZSBuZ2RFbmdpbmU6IE5nZEVuZ2luZTtcclxuICAgIHByaXZhdGUgaHRtbEVuZ2luZTogSHRtbEVuZ2luZTtcclxuICAgIHByaXZhdGUgc2VhcmNoRW5naW5lOiBTZWFyY2hFbmdpbmU7XHJcbiAgICBwcm90ZWN0ZWQgZmlsZUVuZ2luZTogRmlsZUVuZ2luZSA9IG5ldyBGaWxlRW5naW5lKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgY29tcG9kb2MgYXBwbGljYXRpb24gaW5zdGFuY2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG9wdGlvbnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG9wdGlvbnMgdGhhdCBzaG91bGQgYmUgdXNlZC5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86IE9iamVjdCkge1xyXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUgPSBuZXcgRGVwZW5kZW5jaWVzRW5naW5lKCk7XHJcbiAgICAgICAgdGhpcy5uZ2RFbmdpbmUgPSBuZXcgTmdkRW5naW5lKHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lKTtcclxuICAgICAgICB0aGlzLmh0bWxFbmdpbmUgPSBuZXcgSHRtbEVuZ2luZSh0aGlzLmNvbmZpZ3VyYXRpb24sIHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLCB0aGlzLmZpbGVFbmdpbmUpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoRW5naW5lID0gbmV3IFNlYXJjaEVuZ2luZSh0aGlzLmNvbmZpZ3VyYXRpb24sIHRoaXMuZmlsZUVuZ2luZSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhW29wdGlvbl0gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGFbb3B0aW9uXSA9IG9wdGlvbnNbb3B0aW9uXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBGb3IgZG9jdW1lbnRhdGlvbk1haW5OYW1lLCBwcm9jZXNzIGl0IG91dHNpZGUgdGhlIGxvb3AsIGZvciBoYW5kbGluZyBjb25mbGljdCB3aXRoIHBhZ2VzIG5hbWVcclxuICAgICAgICAgICAgaWYgKG9wdGlvbiA9PT0gJ25hbWUnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID0gb3B0aW9uc1tvcHRpb25dO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEZvciBkb2N1bWVudGF0aW9uTWFpbk5hbWUsIHByb2Nlc3MgaXQgb3V0c2lkZSB0aGUgbG9vcCwgZm9yIGhhbmRsaW5nIGNvbmZsaWN0IHdpdGggcGFnZXMgbmFtZVxyXG4gICAgICAgICAgICBpZiAob3B0aW9uID09PSAnc2lsZW50Jykge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgY29tcG9kb2MgcHJvY2Vzc1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQuY2hhckF0KHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubGVuZ3RoIC0gMSkgIT09ICcvJykge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICs9ICcvJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5odG1sRW5naW5lLmluaXQoKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLnByb2Nlc3NQYWNrYWdlSnNvbigpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IGNvbXBvZG9jIGRvY3VtZW50YXRpb24gY292ZXJhZ2VcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHRlc3RDb3ZlcmFnZSgpIHtcclxuICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0b3JlIGZpbGVzIGZvciBpbml0aWFsIHByb2Nlc3NpbmdcclxuICAgICAqIEBwYXJhbSAge0FycmF5PHN0cmluZz59IGZpbGVzIEZpbGVzIGZvdW5kIGR1cmluZyBzb3VyY2UgZm9sZGVyIGFuZCB0c2NvbmZpZyBzY2FuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRGaWxlcyhmaWxlczogQXJyYXk8c3RyaW5nPikge1xyXG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0b3JlIGZpbGVzIGZvciB3YXRjaCBwcm9jZXNzaW5nXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheTxzdHJpbmc+fSBmaWxlcyBGaWxlcyBmb3VuZCBkdXJpbmcgc291cmNlIGZvbGRlciBhbmQgdHNjb25maWcgc2NhblxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0VXBkYXRlZEZpbGVzKGZpbGVzOiBBcnJheTxzdHJpbmc+KSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVkRmlsZXMgPSBmaWxlcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIGJvb2xlYW4gaW5kaWNhdGluZyBwcmVzZW5jZSBvZiBvbmUgVHlwZVNjcmlwdCBmaWxlIGluIHVwZGF0ZWRGaWxlcyBsaXN0XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBSZXN1bHQgb2Ygc2NhblxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaGFzV2F0Y2hlZEZpbGVzVFNGaWxlcygpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLnVwZGF0ZWRGaWxlcywgKGZpbGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIGJvb2xlYW4gaW5kaWNhdGluZyBwcmVzZW5jZSBvZiBvbmUgcm9vdCBtYXJrZG93biBmaWxlcyBpbiB1cGRhdGVkRmlsZXMgbGlzdFxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gUmVzdWx0IG9mIHNjYW5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGhhc1dhdGNoZWRGaWxlc1Jvb3RNYXJrZG93bkZpbGVzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMudXBkYXRlZEZpbGVzLCAoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLm1kJyAmJiBwYXRoLmRpcm5hbWUoZmlsZSkgPT09IHByb2Nlc3MuY3dkKCkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFyIGZpbGVzIGZvciB3YXRjaCBwcm9jZXNzaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjbGVhclVwZGF0ZWRGaWxlcygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZWRGaWxlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2F0Y2hDaGFuZ2VkRmlsZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHByb2Nlc3NQYWNrYWdlSnNvbigpOiB2b2lkIHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnU2VhcmNoaW5nIHBhY2thZ2UuanNvbiBmaWxlJyk7XHJcbiAgICAgICAgdGhpcy5maWxlRW5naW5lLmdldChwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyAncGFja2FnZS5qc29uJykudGhlbigocGFja2FnZURhdGEpID0+IHtcclxuICAgICAgICAgICAgbGV0IHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHBhY2thZ2VEYXRhKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJzZWREYXRhLm5hbWUgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kb2N1bWVudGF0aW9uTWFpbk5hbWUgPT09IENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5OYW1lID0gcGFyc2VkRGF0YS5uYW1lICsgJyBkb2N1bWVudGF0aW9uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlZERhdGEuZGVzY3JpcHRpb24gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZG9jdW1lbnRhdGlvbk1haW5EZXNjcmlwdGlvbiA9IHBhcnNlZERhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFuZ3VsYXJWZXJzaW9uID0gdGhpcy5hbmd1bGFyVmVyc2lvblV0aWwuZ2V0QW5ndWxhclZlcnNpb25PZlByb2plY3QocGFyc2VkRGF0YSk7XHJcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdwYWNrYWdlLmpzb24gZmlsZSBmb3VuZCcpO1xyXG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNYXJrZG93bnMoKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzRGF0YSgpO1xyXG4gICAgICAgICAgICB9LCAoZXJyb3JNZXNzYWdlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xyXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdDb250aW51aW5nIHdpdGhvdXQgcGFja2FnZS5qc29uIGZpbGUnKTtcclxuICAgICAgICAgICAgdGhpcy5wcm9jZXNzTWFya2Rvd25zKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldERlcGVuZGVuY2llc0RhdGEoKTtcclxuICAgICAgICAgICAgfSwgKGVycm9yTWVzc2FnZTEpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UxKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwcm9jZXNzTWFya2Rvd25zKCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBSRUFETUUubWQsIENIQU5HRUxPRy5tZCwgQ09OVFJJQlVUSU5HLm1kLCBMSUNFTlNFLm1kLCBUT0RPLm1kIGZpbGVzJyk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgbGV0IG1hcmtkb3ducyA9IFsncmVhZG1lJywgJ2NoYW5nZWxvZycsICdjb250cmlidXRpbmcnLCAnbGljZW5zZScsICd0b2RvJ107XHJcbiAgICAgICAgICAgIGxldCBudW1iZXJPZk1hcmtkb3ducyA9IDU7XHJcbiAgICAgICAgICAgIGxldCBsb29wID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgPCBudW1iZXJPZk1hcmtkb3ducykge1xyXG4gICAgICAgICAgICAgICAgICAgICRtYXJrZG93bmVuZ2luZS5nZXRUcmFkaXRpb25hbE1hcmtkb3duKG1hcmtkb3duc1tpXS50b1VwcGVyQ2FzZSgpKS50aGVuKChyZWFkbWVEYXRhOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogKG1hcmtkb3duc1tpXSA9PT0gJ3JlYWRtZScpID8gJ2luZGV4JyA6IG1hcmtkb3duc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdnZXR0aW5nLXN0YXJ0ZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdnZXR0aW5nLXN0YXJ0ZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2Rvd246IHJlYWRtZURhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXJrZG93bnNbaV0gPT09ICdyZWFkbWUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucmVhZG1lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnb3ZlcnZpZXcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3ZlcnZpZXcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdvdmVydmlldycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubWFya2Rvd25zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG1hcmtkb3duc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cHBlcm5hbWU6IG1hcmtkb3duc1tpXS50b1VwcGVyQ2FzZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAke21hcmtkb3duc1tpXS50b1VwcGVyQ2FzZSgpfS5tZCBmaWxlIGZvdW5kYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYENvbnRpbnVpbmcgd2l0aG91dCAke21hcmtkb3duc1tpXS50b1VwcGVyQ2FzZSgpfS5tZCBmaWxlYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXJrZG93bnNbaV0gPT09ICdyZWFkbWUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2luZGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2luZGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnb3ZlcnZpZXcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWJ1aWxkUm9vdE1hcmtkb3ducygpOiB2b2lkIHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnUmVnZW5lcmF0aW5nIFJFQURNRS5tZCwgQ0hBTkdFTE9HLm1kLCBDT05UUklCVVRJTkcubWQsIExJQ0VOU0UubWQsIFRPRE8ubWQgcGFnZXMnKTtcclxuXHJcbiAgICAgICAgbGV0IGFjdGlvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLnJlc2V0Um9vdE1hcmtkb3duUGFnZXMoKTtcclxuXHJcbiAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJvY2Vzc01hcmtkb3ducygpOyB9KTtcclxuXHJcbiAgICAgICAgcHJvbWlzZVNlcXVlbnRpYWwoYWN0aW9ucylcclxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1BhZ2VzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVXBkYXRlZEZpbGVzKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnJvck1lc3NhZ2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGRlcGVuZGVuY3kgZGF0YSBmb3Igc21hbGwgZ3JvdXAgb2YgdXBkYXRlZCBmaWxlcyBkdXJpbmcgd2F0Y2ggcHJvY2Vzc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldE1pY3JvRGVwZW5kZW5jaWVzRGF0YSgpOiB2b2lkIHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnR2V0IGRpZmYgZGVwZW5kZW5jaWVzIGRhdGEnKTtcclxuICAgICAgICBsZXQgY3Jhd2xlciA9IG5ldyBEZXBlbmRlbmNpZXMoXHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlZEZpbGVzLCB7XHJcbiAgICAgICAgICAgICAgICB0c2NvbmZpZ0RpcmVjdG9yeTogcGF0aC5kaXJuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGV0IGRlcGVuZGVuY2llc0RhdGEgPSBjcmF3bGVyLmdldERlcGVuZGVuY2llcygpO1xyXG5cclxuICAgICAgICB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS51cGRhdGUoZGVwZW5kZW5jaWVzRGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMucHJlcGFyZUp1c3RBRmV3VGhpbmdzKGRlcGVuZGVuY2llc0RhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVidWlsZCBleHRlcm5hbCBkb2N1bWVudGF0aW9uIGR1cmluZyB3YXRjaCBwcm9jZXNzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVidWlsZEV4dGVybmFsRG9jdW1lbnRhdGlvbigpOiB2b2lkIHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnUmVidWlsZCBleHRlcm5hbCBkb2N1bWVudGF0aW9uJyk7XHJcblxyXG4gICAgICAgIGxldCBhY3Rpb25zID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5yZXNldEFkZGl0aW9uYWxQYWdlcygpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzICE9PSAnJykge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlRXh0ZXJuYWxJbmNsdWRlcygpOyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb21pc2VTZXF1ZW50aWFsKGFjdGlvbnMpXHJcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NQYWdlcygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclVwZGF0ZWRGaWxlcygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3JNZXNzYWdlID0+IHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldERlcGVuZGVuY2llc0RhdGEoKTogdm9pZCB7XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0dldCBkZXBlbmRlbmNpZXMgZGF0YScpO1xyXG5cclxuICAgICAgICBsZXQgY3Jhd2xlciA9IG5ldyBEZXBlbmRlbmNpZXMoXHJcbiAgICAgICAgICAgIHRoaXMuZmlsZXMsIHtcclxuICAgICAgICAgICAgICAgIHRzY29uZmlnRGlyZWN0b3J5OiBwYXRoLmRpcm5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsZXQgZGVwZW5kZW5jaWVzRGF0YSA9IGNyYXdsZXIuZ2V0RGVwZW5kZW5jaWVzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmluaXQoZGVwZW5kZW5jaWVzRGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXNMZW5ndGggPSBSb3V0ZXJQYXJzZXIucm91dGVzTGVuZ3RoKCk7XHJcblxyXG4gICAgICAgIHRoaXMucHJpbnRTdGF0aXN0aWNzKCk7XHJcblxyXG4gICAgICAgIHRoaXMucHJlcGFyZUV2ZXJ5dGhpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHByZXBhcmVKdXN0QUZld1RoaW5ncyhkaWZmQ3Jhd2xlZERhdGEpOiB2b2lkIHtcclxuICAgICAgICBsZXQgYWN0aW9ucyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ucmVzZXRQYWdlcygpO1xyXG5cclxuICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4gdGhpcy5wcmVwYXJlUm91dGVzKCkpO1xyXG5cclxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLm1vZHVsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4gdGhpcy5wcmVwYXJlTW9kdWxlcygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5jb21wb25lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHRoaXMucHJlcGFyZUNvbXBvbmVudHMoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLmRpcmVjdGl2ZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4gdGhpcy5wcmVwYXJlRGlyZWN0aXZlcygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEuaW5qZWN0YWJsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4gdGhpcy5wcmVwYXJlSW5qZWN0YWJsZXMoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLnBpcGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHRoaXMucHJlcGFyZVBpcGVzKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRpZmZDcmF3bGVkRGF0YS5jbGFzc2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHRoaXMucHJlcGFyZUNsYXNzZXMoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZGlmZkNyYXdsZWREYXRhLmludGVyZmFjZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4gdGhpcy5wcmVwYXJlSW50ZXJmYWNlcygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy52YXJpYWJsZXMubGVuZ3RoID4gMCB8fFxyXG4gICAgICAgICAgICBkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy5mdW5jdGlvbnMubGVuZ3RoID4gMCB8fFxyXG4gICAgICAgICAgICBkaWZmQ3Jhd2xlZERhdGEubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcy5sZW5ndGggPiAwIHx8XHJcbiAgICAgICAgICAgIGRpZmZDcmF3bGVkRGF0YS5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB0aGlzLnByZXBhcmVNaXNjZWxsYW5lb3VzKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlKSB7XHJcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB0aGlzLnByZXBhcmVDb3ZlcmFnZSgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb21pc2VTZXF1ZW50aWFsKGFjdGlvbnMpXHJcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NHcmFwaHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJVcGRhdGVkRmlsZXMoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVycm9yTWVzc2FnZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwcmludFN0YXRpc3RpY3MoKSB7XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oJy0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcclxuICAgICAgICBsb2dnZXIuaW5mbygnUHJvamVjdCBzdGF0aXN0aWNzICcpO1xyXG4gICAgICAgIGlmICh0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5tb2R1bGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gbW9kdWxlICAgICA6ICR7dGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUubW9kdWxlcy5sZW5ndGh9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5jb21wb25lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gY29tcG9uZW50ICA6ICR7dGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuY29tcG9uZW50cy5sZW5ndGh9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gZGlyZWN0aXZlICA6ICR7dGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuZGlyZWN0aXZlcy5sZW5ndGh9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5pbmplY3RhYmxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAtIGluamVjdGFibGUgOiAke3RoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmluamVjdGFibGVzLmxlbmd0aH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLnBpcGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gcGlwZSAgICAgICA6ICR7dGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUucGlwZXMubGVuZ3RofWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAtIGNsYXNzICAgICAgOiAke3RoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmNsYXNzZXMubGVuZ3RofWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuaW50ZXJmYWNlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAtIGludGVyZmFjZSAgOiAke3RoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmludGVyZmFjZXMubGVuZ3RofWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJvdXRlc0xlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYC0gcm91dGUgICAgICA6ICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnJvdXRlc0xlbmd0aH1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oJy0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHByZXBhcmVFdmVyeXRoaW5nKCkge1xyXG4gICAgICAgIGxldCBhY3Rpb25zID0gW107XHJcblxyXG4gICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVNb2R1bGVzKCk7IH0pO1xyXG4gICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDb21wb25lbnRzKCk7IH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuZGlyZWN0aXZlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVEaXJlY3RpdmVzKCk7IH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmluamVjdGFibGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUluamVjdGFibGVzKCk7IH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLnJvdXRlcyAmJiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5yb3V0ZXMuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlUm91dGVzKCk7IH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLnBpcGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZVBpcGVzKCk7IH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmNsYXNzZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goKCkgPT4geyByZXR1cm4gdGhpcy5wcmVwYXJlQ2xhc3NlcygpOyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5pbnRlcmZhY2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHsgcmV0dXJuIHRoaXMucHJlcGFyZUludGVyZmFjZXMoKTsgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUubWlzY2VsbGFuZW91cy52YXJpYWJsZXMubGVuZ3RoID4gMCB8fFxyXG4gICAgICAgICAgICB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5taXNjZWxsYW5lb3VzLmZ1bmN0aW9ucy5sZW5ndGggPiAwIHx8XHJcbiAgICAgICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLm1pc2NlbGxhbmVvdXMudHlwZWFsaWFzZXMubGVuZ3RoID4gMCB8fFxyXG4gICAgICAgICAgICB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5taXNjZWxsYW5lb3VzLmVudW1lcmF0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVNaXNjZWxsYW5lb3VzKCk7IH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlKSB7XHJcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVDb3ZlcmFnZSgpOyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7IHJldHVybiB0aGlzLnByZXBhcmVFeHRlcm5hbEluY2x1ZGVzKCk7IH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvbWlzZVNlcXVlbnRpYWwoYWN0aW9ucylcclxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0dyYXBocygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3JNZXNzYWdlID0+IHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHByZXBhcmVFeHRlcm5hbEluY2x1ZGVzKCkge1xyXG4gICAgICAgIGxvZ2dlci5pbmZvKCdBZGRpbmcgZXh0ZXJuYWwgbWFya2Rvd24gZmlsZXMnKTtcclxuICAgICAgICAvLyBTY2FuIGluY2x1ZGUgZm9sZGVyIGZvciBmaWxlcyBkZXRhaWxlZCBpbiBzdW1tYXJ5Lmpzb25cclxuICAgICAgICAvLyBGb3IgZWFjaCBmaWxlLCBhZGQgdG8gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmFkZGl0aW9uYWxQYWdlc1xyXG4gICAgICAgIC8vIEVhY2ggZmlsZSB3aWxsIGJlIGNvbnZlcnRlZCB0byBodG1sIHBhZ2UsIGluc2lkZSBDT01QT0RPQ19ERUZBVUxUUy5hZGRpdGlvbmFsRW50cnlQYXRoXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5maWxlRW5naW5lLmdldChwcm9jZXNzLmN3ZCgpICsgcGF0aC5zZXAgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgKyBwYXRoLnNlcCArICdzdW1tYXJ5Lmpzb24nKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHN1bW1hcnlEYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0FkZGl0aW9uYWwgZG9jdW1lbnRhdGlvbjogc3VtbWFyeS5qc29uIGZpbGUgZm91bmQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnNlZFN1bW1hcnlEYXRhID0gSlNPTi5wYXJzZShzdW1tYXJ5RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZW4gPSBwYXJzZWRTdW1tYXJ5RGF0YS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvb3AgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpIDw9IGxlbiAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRtYXJrZG93bmVuZ2luZS5nZXRUcmFkaXRpb25hbE1hcmtkb3duKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyArIHBhdGguc2VwICsgcGFyc2VkU3VtbWFyeURhdGFbaV0uZmlsZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigobWFya2VkRGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkQWRkaXRpb25hbFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFyc2VkU3VtbWFyeURhdGFbaV0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcGFyc2VkU3VtbWFyeURhdGFbaV0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogY2xlYW5OYW1lV2l0aG91dFNwYWNlQW5kVG9Mb3dlckNhc2UocGFyc2VkU3VtbWFyeURhdGFbaV0udGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2FkZGl0aW9uYWwtcGFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXNGb2xkZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUGFnZTogbWFya2VkRGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW4gJiYgcGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGogPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxlbmcgPSBwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9vcENoaWxkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqIDw9IGxlbmcgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRtYXJrZG93bmVuZ2luZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmdldFRyYWRpdGlvbmFsTWFya2Rvd24odGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzICsgcGF0aC5zZXAgKyBwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbltqXS5maWxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKG1hcmtlZERhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkQWRkaXRpb25hbFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwYXJzZWRTdW1tYXJ5RGF0YVtpXS5jaGlsZHJlbltqXS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHBhcnNlZFN1bW1hcnlEYXRhW2ldLmNoaWxkcmVuW2pdLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogY2xlYW5OYW1lV2l0aG91dFNwYWNlQW5kVG9Mb3dlckNhc2UocGFyc2VkU3VtbWFyeURhdGFbaV0uY2hpbGRyZW5bal0udGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnYWRkaXRpb25hbC1wYWdlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzRm9sZGVyICsgJy8nICsgY2xlYW5OYW1lV2l0aG91dFNwYWNlQW5kVG9Mb3dlckNhc2UocGFyc2VkU3VtbWFyeURhdGFbaV0udGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUGFnZTogbWFya2VkRGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaisrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3BDaGlsZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcENoaWxkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgICAgIH0sIChlcnJvck1lc3NhZ2UpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBBZGRpdGlvbmFsIGRvY3VtZW50YXRpb24gZ2VuZXJhdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByZXBhcmVNb2R1bGVzKHNvbWVNb2R1bGVzPyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgbW9kdWxlcycpO1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICBsZXQgX21vZHVsZXMgPSAoc29tZU1vZHVsZXMpID8gc29tZU1vZHVsZXMgOiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlcyA9IF9tb2R1bGVzLm1hcChuZ01vZHVsZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBbJ2RlY2xhcmF0aW9ucycsICdib290c3RyYXAnLCAnaW1wb3J0cycsICdleHBvcnRzJ10uZm9yRWFjaChtZXRhZGF0YVR5cGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlW21ldGFkYXRhVHlwZV0gPSBuZ01vZHVsZVttZXRhZGF0YVR5cGVdLmZpbHRlcihtZXRhRGF0YUl0ZW0gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKG1ldGFEYXRhSXRlbS50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdkaXJlY3RpdmUnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXREaXJlY3RpdmVzKCkuc29tZShkaXJlY3RpdmUgPT4gZGlyZWN0aXZlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21wb25lbnQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXRDb21wb25lbnRzKCkuc29tZShjb21wb25lbnQgPT4gY29tcG9uZW50Lm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb2R1bGUnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXRNb2R1bGVzKCkuc29tZShtb2R1bGUgPT4gbW9kdWxlLm5hbWUgPT09IG1ldGFEYXRhSXRlbS5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwaXBlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuZ2V0UGlwZXMoKS5zb21lKHBpcGUgPT4gcGlwZS5uYW1lID09PSBtZXRhRGF0YUl0ZW0ubmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBuZ01vZHVsZS5wcm92aWRlcnMgPSBuZ01vZHVsZS5wcm92aWRlcnMuZmlsdGVyKHByb3ZpZGVyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXNFbmdpbmUuZ2V0SW5qZWN0YWJsZXMoKS5zb21lKGluamVjdGFibGUgPT4gaW5qZWN0YWJsZS5uYW1lID09PSBwcm92aWRlci5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5nTW9kdWxlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ21vZHVsZXMnLFxyXG4gICAgICAgICAgICAgICAgaWQ6ICdtb2R1bGVzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdtb2R1bGVzJyxcclxuICAgICAgICAgICAgICAgIGRlcHRoOiAwLFxyXG4gICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuUk9PVFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCBsb29wID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcmtkb3duZW5naW5lLmhhc05laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV0uZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYCAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLm5hbWV9IGhhcyBhIFJFQURNRSBmaWxlLCBpbmNsdWRlIGl0YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWFkbWUgPSAkbWFya2Rvd25lbmdpbmUucmVhZE5laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV0uZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLnJlYWRtZSA9IG1hcmtlZChyZWFkbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6ICdtb2R1bGVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1vZHVsZXNbaV0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzW2ldLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnbW9kdWxlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubW9kdWxlc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByZXBhcmVQaXBlcyA9IChzb21lUGlwZXM/KSA9PiB7XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1ByZXBhcmUgcGlwZXMnKTtcclxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXMgPSAoc29tZVBpcGVzKSA/IHNvbWVQaXBlcyA6IHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmdldFBpcGVzKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCBsb29wID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcmtkb3duZW5naW5lLmhhc05laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBpcGVzW2ldLmZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXNbaV0ubmFtZX0gaGFzIGEgUkVBRE1FIGZpbGUsIGluY2x1ZGUgaXRgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXNbaV0uZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXS5yZWFkbWUgPSBtYXJrZWQocmVhZG1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAncGlwZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXNbaV0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5waXBlc1tpXS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ3BpcGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwaXBlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXNbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwcmVwYXJlQ2xhc3NlcyA9IChzb21lQ2xhc3Nlcz8pID0+IHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBjbGFzc2VzJyk7XHJcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXMgPSAoc29tZUNsYXNzZXMpID8gc29tZUNsYXNzZXMgOiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXRDbGFzc2VzKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jbGFzc2VzLmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IGxvb3AgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA8IGxlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkbWFya2Rvd25lbmdpbmUuaGFzTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXS5maWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0ubmFtZX0gaGFzIGEgUkVBRE1FIGZpbGUsIGluY2x1ZGUgaXRgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXS5maWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0ucmVhZG1lID0gbWFya2VkKHJlYWRtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NsYXNzZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNsYXNzZXNbaV0uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjbGFzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3Nlc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByZXBhcmVJbnRlcmZhY2VzKHNvbWVJbnRlcmZhY2VzPykge1xyXG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGludGVyZmFjZXMnKTtcclxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlcyA9IChzb21lSW50ZXJmYWNlcykgPyBzb21lSW50ZXJmYWNlcyA6IHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmdldEludGVyZmFjZXMoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICBsZXQgbG9vcCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChpIDwgbGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRtYXJrZG93bmVuZ2luZS5oYXNOZWlnaGJvdXJSZWFkbWVGaWxlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLmZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXS5uYW1lfSBoYXMgYSBSRUFETUUgZmlsZSwgaW5jbHVkZSBpdGApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVhZG1lID0gJG1hcmtkb3duZW5naW5lLnJlYWROZWlnaGJvdXJSZWFkbWVGaWxlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLmZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXS5yZWFkbWUgPSBtYXJrZWQocmVhZG1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnaW50ZXJmYWNlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzW2ldLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW50ZXJmYWNlc1tpXS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2ludGVyZmFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVyZmFjZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmludGVyZmFjZXNbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwcmVwYXJlTWlzY2VsbGFuZW91cyhzb21lTWlzYz8pIHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBtaXNjZWxsYW5lb3VzJyk7XHJcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1pc2NlbGxhbmVvdXMgPSAoc29tZU1pc2MpID8gc29tZU1pc2MgOiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXRNaXNjZWxsYW5lb3VzKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm1pc2NlbGxhbmVvdXMuZnVuY3Rpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiAnbWlzY2VsbGFuZW91cycsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2Z1bmN0aW9ucycsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdtaXNjZWxsYW5lb3VzLWZ1bmN0aW9ucycsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ21pc2NlbGxhbmVvdXMtZnVuY3Rpb25zJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcclxuICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5taXNjZWxsYW5lb3VzLnZhcmlhYmxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJ21pc2NlbGxhbmVvdXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICd2YXJpYWJsZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiAnbWlzY2VsbGFuZW91cy12YXJpYWJsZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdtaXNjZWxsYW5lb3VzLXZhcmlhYmxlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubWlzY2VsbGFuZW91cy50eXBlYWxpYXNlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJ21pc2NlbGxhbmVvdXMnLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICd0eXBlYWxpYXNlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdtaXNjZWxsYW5lb3VzLXR5cGVhbGlhc2VzJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnbWlzY2VsbGFuZW91cy10eXBlYWxpYXNlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubWlzY2VsbGFuZW91cy5lbnVtZXJhdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdtaXNjZWxsYW5lb3VzJyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZW51bWVyYXRpb25zJyxcclxuICAgICAgICAgICAgICAgICAgICBpZDogJ21pc2NlbGxhbmVvdXMtZW51bWVyYXRpb25zJyxcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiAnbWlzY2VsbGFuZW91cy1lbnVtZXJhdGlvbnMnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLklOVEVSTkFMXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFuZGxlVGVtcGxhdGV1cmwoY29tcG9uZW50KTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBsZXQgZGlybmFtZSA9IHBhdGguZGlybmFtZShjb21wb25lbnQuZmlsZSk7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlUGF0aCA9IHBhdGgucmVzb2x2ZShkaXJuYW1lICsgcGF0aC5zZXAgKyBjb21wb25lbnQudGVtcGxhdGVVcmwpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZmlsZUVuZ2luZS5leGlzdHNTeW5jKHRlbXBsYXRlUGF0aCkpIHtcclxuICAgICAgICAgICAgbGV0IGVyciA9IGBDYW5ub3QgcmVhZCB0ZW1wbGF0ZSBmb3IgJHtjb21wb25lbnQubmFtZX1gO1xyXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5maWxlRW5naW5lLmdldCh0ZW1wbGF0ZVBhdGgpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gY29tcG9uZW50LnRlbXBsYXRlRGF0YSA9IGRhdGEsXHJcbiAgICAgICAgICAgIGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwcmVwYXJlQ29tcG9uZW50cyhzb21lQ29tcG9uZW50cz8pIHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBjb21wb25lbnRzJyk7XHJcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHMgPSAoc29tZUNvbXBvbmVudHMpID8gc29tZUNvbXBvbmVudHMgOiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXRDb21wb25lbnRzKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgobWFpblJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50cy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCBsb29wID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgPD0gbGVuIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkbWFya2Rvd25lbmdpbmUuaGFzTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5maWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZX0gaGFzIGEgUkVBRE1FIGZpbGUsIGluY2x1ZGUgaXRgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZUZpbGUgPSAkbWFya2Rvd25lbmdpbmUucmVhZE5laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0uZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzW2ldLnJlYWRtZSA9IG1hcmtlZChyZWFkbWVGaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb21wb25lbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS50ZW1wbGF0ZVVybC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZX0gaGFzIGEgdGVtcGxhdGVVcmwsIGluY2x1ZGUgaXRgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVGVtcGxhdGV1cmwodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2NvbXBvbmVudHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdjb21wb25lbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY29tcG9uZW50c1tpXS50ZW1wbGF0ZVVybC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0ubmFtZX0gaGFzIGEgdGVtcGxhdGVVcmwsIGluY2x1ZGUgaXRgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVGVtcGxhdGV1cmwodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvbXBvbmVudHNbaV0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtYWluUmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByZXBhcmVEaXJlY3RpdmVzKHNvbWVEaXJlY3RpdmVzPykge1xyXG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcmVwYXJlIGRpcmVjdGl2ZXMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXMgPSAoc29tZURpcmVjdGl2ZXMpID8gc29tZURpcmVjdGl2ZXMgOiB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXREaXJlY3RpdmVzKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzLmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IGxvb3AgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA8IGxlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkbWFya2Rvd25lbmdpbmUuaGFzTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5maWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhgICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV0ubmFtZX0gaGFzIGEgUkVBRE1FIGZpbGUsIGluY2x1ZGUgaXRgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5maWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV0ucmVhZG1lID0gbWFya2VkKHJlYWRtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ2RpcmVjdGl2ZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlyZWN0aXZlc1tpXS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpcmVjdGl2ZXNbaV0uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdkaXJlY3RpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmU6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVR5cGU6IENPTVBPRE9DX0RFRkFVTFRTLlBBR0VfVFlQRVMuSU5URVJOQUxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJlcGFyZUluamVjdGFibGVzKHNvbWVJbmplY3RhYmxlcz8pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnUHJlcGFyZSBpbmplY3RhYmxlcycpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXMgPSAoc29tZUluamVjdGFibGVzKSA/IHNvbWVJbmplY3RhYmxlcyA6IHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmdldEluamVjdGFibGVzKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCBsb29wID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgPCBsZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJG1hcmtkb3duZW5naW5lLmhhc05laWdoYm91clJlYWRtZUZpbGUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzW2ldLmZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAgJHt0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0ubmFtZX0gaGFzIGEgUkVBRE1FIGZpbGUsIGluY2x1ZGUgaXRgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlYWRtZSA9ICRtYXJrZG93bmVuZ2luZS5yZWFkTmVpZ2hib3VyUmVhZG1lRmlsZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0uZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXS5yZWFkbWUgPSBtYXJrZWQocmVhZG1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLmFkZFBhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiAnaW5qZWN0YWJsZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0ubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmplY3RhYmxlc1tpXS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogJ2luamVjdGFibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RhYmxlOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5qZWN0YWJsZXNbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5JTlRFUk5BTFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICBsb29wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwcmVwYXJlUm91dGVzKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHJvdXRlcycpO1xyXG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5yb3V0ZXMgPSB0aGlzLmRlcGVuZGVuY2llc0VuZ2luZS5nZXRSb3V0ZXMoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5hZGRQYWdlKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdyb3V0ZXMnLFxyXG4gICAgICAgICAgICAgICAgaWQ6ICdyb3V0ZXMnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dDogJ3JvdXRlcycsXHJcbiAgICAgICAgICAgICAgICBkZXB0aDogMCxcclxuICAgICAgICAgICAgICAgIHBhZ2VUeXBlOiBDT01QT0RPQ19ERUZBVUxUUy5QQUdFX1RZUEVTLlJPT1RcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBSb3V0ZXJQYXJzZXIuZ2VuZXJhdGVSb3V0ZXNJbmRleCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0LCB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucm91dGVzKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCcgUm91dGVzIGluZGV4IGdlbmVyYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJlcGFyZUNvdmVyYWdlKCkge1xyXG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgcmVwb3J0Jyk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIGxvb3Agd2l0aCBjb21wb25lbnRzLCBkaXJlY3RpdmVzLCBjbGFzc2VzLCBpbmplY3RhYmxlcywgaW50ZXJmYWNlcywgcGlwZXNcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGxldCBmaWxlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBnZXRTdGF0dXMgPSBmdW5jdGlvbiAocGVyY2VudCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN0YXR1cztcclxuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50IDw9IDI1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ2xvdyc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBlcmNlbnQgPiAyNSAmJiBwZXJjZW50IDw9IDUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ21lZGl1bSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBlcmNlbnQgPiA1MCAmJiBwZXJjZW50IDw9IDc1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzID0gJ2dvb2QnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSAndmVyeS1nb29kJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXM7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGxldCBwcm9jZXNzQ29tcG9uZW50c0FuZERpcmVjdGl2ZXMgPSAobGlzdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGxpc3QsIChlbGVtZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQucHJvcGVydGllc0NsYXNzIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICFlbGVtZW50Lm1ldGhvZHNDbGFzcyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAhZWxlbWVudC5ob3N0QmluZGluZ3MgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgIWVsZW1lbnQuaG9zdExpc3RlbmVycyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAhZWxlbWVudC5pbnB1dHNDbGFzcyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAhZWxlbWVudC5vdXRwdXRzQ2xhc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2w6IGFueSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGVsZW1lbnQuZmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogZWxlbWVudC50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rdHlwZTogZWxlbWVudC50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBlbGVtZW50Lm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b3RhbFN0YXRlbWVudHMgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnByb3BlcnRpZXNDbGFzcy5sZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm1ldGhvZHNDbGFzcy5sZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlucHV0c0NsYXNzLmxlbmd0aCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaG9zdEJpbmRpbmdzLmxlbmd0aCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaG9zdExpc3RlbmVycy5sZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm91dHB1dHNDbGFzcy5sZW5ndGggKyAxOyAvLyArMSBmb3IgZWxlbWVudCBkZWNvcmF0b3IgY29tbWVudFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5jb25zdHJ1Y3Rvck9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuY29uc3RydWN0b3JPYmogJiYgZWxlbWVudC5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAmJiBlbGVtZW50LmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuZGVzY3JpcHRpb24gJiYgZWxlbWVudC5kZXNjcmlwdGlvbiAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZWxlbWVudC5wcm9wZXJ0aWVzQ2xhc3MsIChwcm9wZXJ0eTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LmRlc2NyaXB0aW9uICYmIHByb3BlcnR5LmRlc2NyaXB0aW9uICE9PSAnJyAmJiBwcm9wZXJ0eS5tb2RpZmllcktpbmQgIT09IDExMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goZWxlbWVudC5tZXRob2RzQ2xhc3MsIChtZXRob2Q6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLmRlc2NyaXB0aW9uICYmIG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgbWV0aG9kLm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50Lmhvc3RCaW5kaW5ncywgKHByb3BlcnR5OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5Lm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuZGVzY3JpcHRpb24gJiYgcHJvcGVydHkuZGVzY3JpcHRpb24gIT09ICcnICYmIHByb3BlcnR5Lm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50Lmhvc3RMaXN0ZW5lcnMsIChtZXRob2Q6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLmRlc2NyaXB0aW9uICYmIG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgbWV0aG9kLm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChlbGVtZW50LmlucHV0c0NsYXNzLCAoaW5wdXQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kZXNjcmlwdGlvbiAmJiBpbnB1dC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgaW5wdXQubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKGVsZW1lbnQub3V0cHV0c0NsYXNzLCAob3V0cHV0OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dC5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dC5kZXNjcmlwdGlvbiAmJiBvdXRwdXQuZGVzY3JpcHRpb24gIT09ICcnICYmIG91dHB1dC5tb2RpZmllcktpbmQgIT09IDExMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGxldCBwcm9jZXNzQ292ZXJhZ2VQZXJGaWxlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSBwZXIgZmlsZScpO1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJy0tLS0tLS0tLS0tLS0tLS0tLS0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgb3ZlckZpbGVzID0gZmlsZXMuZmlsdGVyKChmKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG92ZXJUZXN0ID0gZi5jb3ZlcmFnZVBlcmNlbnQgPj0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlTWluaW11bVBlckZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG92ZXJUZXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGAke2YuY292ZXJhZ2VQZXJjZW50fSAlIGZvciBmaWxlICR7Zi5maWxlUGF0aH0gLSBvdmVyIG1pbmltdW0gcGVyIGZpbGVgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG92ZXJUZXN0O1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdW5kZXJGaWxlcyA9IGZpbGVzLmZpbHRlcigoZikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1bmRlclRlc3QgPSBmLmNvdmVyYWdlUGVyY2VudCA8IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb3ZlcmFnZU1pbmltdW1QZXJGaWxlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1bmRlclRlc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGAke2YuY292ZXJhZ2VQZXJjZW50fSAlIGZvciBmaWxlICR7Zi5maWxlUGF0aH0gLSB1bmRlciBtaW5pbXVtIHBlciBmaWxlYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlclRlc3Q7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnLS0tLS0tLS0tLS0tLS0tLS0tLScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBvdmVyRmlsZXM6IG92ZXJGaWxlcyxcclxuICAgICAgICAgICAgICAgICAgICB1bmRlckZpbGVzOiB1bmRlckZpbGVzXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc0NvbXBvbmVudHNBbmREaXJlY3RpdmVzKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5jb21wb25lbnRzKTtcclxuICAgICAgICAgICAgcHJvY2Vzc0NvbXBvbmVudHNBbmREaXJlY3RpdmVzKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXJlY3RpdmVzKTtcclxuXHJcbiAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY2xhc3NlcywgKGNsYXNzZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWNsYXNzZS5wcm9wZXJ0aWVzIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgIWNsYXNzZS5tZXRob2RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IGNsOiBhbnkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGNsYXNzZS5maWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjbGFzcycsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlua3R5cGU6ICdjbGFzc2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGNsYXNzZS5uYW1lXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgbGV0IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG90YWxTdGF0ZW1lbnRzID0gY2xhc3NlLnByb3BlcnRpZXMubGVuZ3RoICsgY2xhc3NlLm1ldGhvZHMubGVuZ3RoICsgMTsgLy8gKzEgZm9yIGNsYXNzIGl0c2VsZlxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjbGFzc2UuY29uc3RydWN0b3JPYmopIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2xhc3NlLmNvbnN0cnVjdG9yT2JqICYmIGNsYXNzZS5jb25zdHJ1Y3Rvck9iai5kZXNjcmlwdGlvbiAmJiBjbGFzc2UuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjbGFzc2UuZGVzY3JpcHRpb24gJiYgY2xhc3NlLmRlc2NyaXB0aW9uICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChjbGFzc2UucHJvcGVydGllcywgKHByb3BlcnR5OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5kZXNjcmlwdGlvbiAmJiBwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycgJiYgcHJvcGVydHkubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goY2xhc3NlLm1ldGhvZHMsIChtZXRob2Q6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXRob2QubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXRob2QuZGVzY3JpcHRpb24gJiYgbWV0aG9kLmRlc2NyaXB0aW9uICE9PSAnJyAmJiBtZXRob2QubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodG90YWxTdGF0ZW1lbnRzID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlQ291bnQgPSB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKyAnLycgKyB0b3RhbFN0YXRlbWVudHM7XHJcbiAgICAgICAgICAgICAgICBjbC5zdGF0dXMgPSBnZXRTdGF0dXMoY2wuY292ZXJhZ2VQZXJjZW50KTtcclxuICAgICAgICAgICAgICAgIHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgKz0gY2wuY292ZXJhZ2VQZXJjZW50O1xyXG4gICAgICAgICAgICAgICAgZmlsZXMucHVzaChjbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluamVjdGFibGVzLCAoaW5qZWN0YWJsZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWluamVjdGFibGUucHJvcGVydGllcyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICFpbmplY3RhYmxlLm1ldGhvZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgY2w6IGFueSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW5qZWN0YWJsZS5maWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGluamVjdGFibGUudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBsaW5rdHlwZTogaW5qZWN0YWJsZS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGluamVjdGFibGUubmFtZVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGxldCB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRvdGFsU3RhdGVtZW50cyA9IGluamVjdGFibGUucHJvcGVydGllcy5sZW5ndGggKyBpbmplY3RhYmxlLm1ldGhvZHMubGVuZ3RoICsgMTsgLy8gKzEgZm9yIGluamVjdGFibGUgaXRzZWxmXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGluamVjdGFibGUuY29uc3RydWN0b3JPYmopIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0YWJsZS5jb25zdHJ1Y3Rvck9iaiAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RhYmxlLmNvbnN0cnVjdG9yT2JqLmRlc2NyaXB0aW9uICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGFibGUuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpbmplY3RhYmxlLmRlc2NyaXB0aW9uICYmIGluamVjdGFibGUuZGVzY3JpcHRpb24gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKGluamVjdGFibGUucHJvcGVydGllcywgKHByb3BlcnR5OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5kZXNjcmlwdGlvbiAmJiBwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycgJiYgcHJvcGVydHkubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW5qZWN0YWJsZS5tZXRob2RzLCAobWV0aG9kOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLm1vZGlmaWVyS2luZCA9PT0gMTExKSB7IC8vIERvZXNuJ3QgaGFuZGxlIHByaXZhdGUgZm9yIGNvdmVyYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50cyAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobWV0aG9kLmRlc2NyaXB0aW9uICYmIG1ldGhvZC5kZXNjcmlwdGlvbiAhPT0gJycgJiYgbWV0aG9kLm1vZGlmaWVyS2luZCAhPT0gMTExKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IE1hdGguZmxvb3IoKHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCAvIHRvdGFsU3RhdGVtZW50cykgKiAxMDApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRvdGFsU3RhdGVtZW50cyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsLmNvdmVyYWdlUGVyY2VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xyXG4gICAgICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcclxuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbnRlcmZhY2VzLCAoaW50ZXI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpbnRlci5wcm9wZXJ0aWVzIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgIWludGVyLm1ldGhvZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgY2w6IGFueSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogaW50ZXIuZmlsZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpbnRlci50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmt0eXBlOiBpbnRlci50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGludGVyLm5hbWVcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBsZXQgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkID0gMDtcclxuICAgICAgICAgICAgICAgIGxldCB0b3RhbFN0YXRlbWVudHMgPSBpbnRlci5wcm9wZXJ0aWVzLmxlbmd0aCArIGludGVyLm1ldGhvZHMubGVuZ3RoICsgMTsgLy8gKzEgZm9yIGludGVyZmFjZSBpdHNlbGZcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXIuY29uc3RydWN0b3JPYmopIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXIuY29uc3RydWN0b3JPYmogJiYgaW50ZXIuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gJiYgaW50ZXIuY29uc3RydWN0b3JPYmouZGVzY3JpcHRpb24gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpbnRlci5kZXNjcmlwdGlvbiAmJiBpbnRlci5kZXNjcmlwdGlvbiAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW50ZXIucHJvcGVydGllcywgKHByb3BlcnR5OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkubW9kaWZpZXJLaW5kID09PSAxMTEpIHsgLy8gRG9lc24ndCBoYW5kbGUgcHJpdmF0ZSBmb3IgY292ZXJhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5kZXNjcmlwdGlvbiAmJiBwcm9wZXJ0eS5kZXNjcmlwdGlvbiAhPT0gJycgJiYgcHJvcGVydHkubW9kaWZpZXJLaW5kICE9PSAxMTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfLmZvckVhY2goaW50ZXIubWV0aG9kcywgKG1ldGhvZDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldGhvZC5tb2RpZmllcktpbmQgPT09IDExMSkgeyAvLyBEb2Vzbid0IGhhbmRsZSBwcml2YXRlIGZvciBjb3ZlcmFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudHMgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldGhvZC5kZXNjcmlwdGlvbiAmJiBtZXRob2QuZGVzY3JpcHRpb24gIT09ICcnICYmIG1ldGhvZC5tb2RpZmllcktpbmQgIT09IDExMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSBNYXRoLmZsb29yKCh0b3RhbFN0YXRlbWVudERvY3VtZW50ZWQgLyB0b3RhbFN0YXRlbWVudHMpICogMTAwKTtcclxuICAgICAgICAgICAgICAgIGlmICh0b3RhbFN0YXRlbWVudHMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZVBlcmNlbnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VDb3VudCA9IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCArICcvJyArIHRvdGFsU3RhdGVtZW50cztcclxuICAgICAgICAgICAgICAgIGNsLnN0YXR1cyA9IGdldFN0YXR1cyhjbC5jb3ZlcmFnZVBlcmNlbnQpO1xyXG4gICAgICAgICAgICAgICAgdG90YWxQcm9qZWN0U3RhdGVtZW50RG9jdW1lbnRlZCArPSBjbC5jb3ZlcmFnZVBlcmNlbnQ7XHJcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGNsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEucGlwZXMsIChwaXBlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjbDogYW55ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiBwaXBlLmZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogcGlwZS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmt0eXBlOiBwaXBlLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcGlwZS5uYW1lXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgbGV0IHRvdGFsU3RhdGVtZW50RG9jdW1lbnRlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG90YWxTdGF0ZW1lbnRzID0gMTtcclxuICAgICAgICAgICAgICAgIGlmIChwaXBlLmRlc2NyaXB0aW9uICYmIHBpcGUuZGVzY3JpcHRpb24gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICs9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY2wuY292ZXJhZ2VQZXJjZW50ID0gTWF0aC5mbG9vcigodG90YWxTdGF0ZW1lbnREb2N1bWVudGVkIC8gdG90YWxTdGF0ZW1lbnRzKSAqIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBjbC5jb3ZlcmFnZUNvdW50ID0gdG90YWxTdGF0ZW1lbnREb2N1bWVudGVkICsgJy8nICsgdG90YWxTdGF0ZW1lbnRzO1xyXG4gICAgICAgICAgICAgICAgY2wuc3RhdHVzID0gZ2V0U3RhdHVzKGNsLmNvdmVyYWdlUGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICB0b3RhbFByb2plY3RTdGF0ZW1lbnREb2N1bWVudGVkICs9IGNsLmNvdmVyYWdlUGVyY2VudDtcclxuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goY2wpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZmlsZXMgPSBfLnNvcnRCeShmaWxlcywgWydmaWxlUGF0aCddKTtcclxuICAgICAgICAgICAgbGV0IGNvdmVyYWdlRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGNvdW50OiAoZmlsZXMubGVuZ3RoID4gMCkgPyBNYXRoLmZsb29yKHRvdGFsUHJvamVjdFN0YXRlbWVudERvY3VtZW50ZWQgLyBmaWxlcy5sZW5ndGgpIDogMCxcclxuICAgICAgICAgICAgICAgIHN0YXR1czogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY292ZXJhZ2VEYXRhLnN0YXR1cyA9IGdldFN0YXR1cyhjb3ZlcmFnZURhdGEuY291bnQpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uYWRkUGFnZSh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnY292ZXJhZ2UnLFxyXG4gICAgICAgICAgICAgICAgaWQ6ICdjb3ZlcmFnZScsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnY292ZXJhZ2UnLFxyXG4gICAgICAgICAgICAgICAgZmlsZXM6IGZpbGVzLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogY292ZXJhZ2VEYXRhLFxyXG4gICAgICAgICAgICAgICAgZGVwdGg6IDAsXHJcbiAgICAgICAgICAgICAgICBwYWdlVHlwZTogQ09NUE9ET0NfREVGQVVMVFMuUEFHRV9UWVBFUy5ST09UXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxFbmdpbmUuZ2VuZXJhdGVDb3ZlcmFnZUJhZGdlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQsIGNvdmVyYWdlRGF0YSk7XHJcbiAgICAgICAgICAgIGZpbGVzID0gXy5zb3J0QnkoZmlsZXMsIFsnY292ZXJhZ2VQZXJjZW50J10pO1xyXG4gICAgICAgICAgICBsZXQgY292ZXJhZ2VUZXN0UGVyRmlsZVJlc3VsdHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0ICYmICF0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0UGVyRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gR2xvYmFsIGNvdmVyYWdlIHRlc3QgYW5kIG5vdCBwZXIgZmlsZVxyXG4gICAgICAgICAgICAgICAgaWYgKGNvdmVyYWdlRGF0YS5jb3VudCA+PSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0VGhyZXNob2xkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYERvY3VtZW50YXRpb24gY292ZXJhZ2UgKCR7Y292ZXJhZ2VEYXRhLmNvdW50fSUpIGlzIG92ZXIgdGhyZXNob2xkYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYERvY3VtZW50YXRpb24gY292ZXJhZ2UgKCR7Y292ZXJhZ2VEYXRhLmNvdW50fSUpIGlzIG5vdCBvdmVyIHRocmVzaG9sZGApO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdCAmJiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0UGVyRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgY292ZXJhZ2VUZXN0UGVyRmlsZVJlc3VsdHMgPSBwcm9jZXNzQ292ZXJhZ2VQZXJGaWxlKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBQZXIgZmlsZSBjb3ZlcmFnZSB0ZXN0IGFuZCBub3QgZ2xvYmFsXHJcbiAgICAgICAgICAgICAgICBpZiAoY292ZXJhZ2VUZXN0UGVyRmlsZVJlc3VsdHMudW5kZXJGaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdEb2N1bWVudGF0aW9uIGNvdmVyYWdlIHBlciBmaWxlIGlzIG5vdCBhY2hpZXZlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RvY3VtZW50YXRpb24gY292ZXJhZ2UgcGVyIGZpbGUgaXMgYWNoaWV2ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdCAmJiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0UGVyRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gUGVyIGZpbGUgY292ZXJhZ2UgdGVzdCBhbmQgZ2xvYmFsXHJcbiAgICAgICAgICAgICAgICBjb3ZlcmFnZVRlc3RQZXJGaWxlUmVzdWx0cyA9IHByb2Nlc3NDb3ZlcmFnZVBlckZpbGUoKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb3ZlcmFnZURhdGEuY291bnQgPj0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdFRocmVzaG9sZCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGNvdmVyYWdlVGVzdFBlckZpbGVSZXN1bHRzLnVuZGVyRmlsZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYERvY3VtZW50YXRpb24gY292ZXJhZ2UgKCR7Y292ZXJhZ2VEYXRhLmNvdW50fSUpIGlzIG92ZXIgdGhyZXNob2xkYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RvY3VtZW50YXRpb24gY292ZXJhZ2UgcGVyIGZpbGUgaXMgYWNoaWV2ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvdmVyYWdlRGF0YS5jb3VudCA+PSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0VGhyZXNob2xkICYmXHJcbiAgICAgICAgICAgICAgICAgICAgY292ZXJhZ2VUZXN0UGVyRmlsZVJlc3VsdHMudW5kZXJGaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYERvY3VtZW50YXRpb24gY292ZXJhZ2UgKCR7Y292ZXJhZ2VEYXRhLmNvdW50fSUpIGlzIG92ZXIgdGhyZXNob2xkYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdEb2N1bWVudGF0aW9uIGNvdmVyYWdlIHBlciBmaWxlIGlzIG5vdCBhY2hpZXZlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY292ZXJhZ2VEYXRhLmNvdW50IDwgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdFRocmVzaG9sZCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGNvdmVyYWdlVGVzdFBlckZpbGVSZXN1bHRzLnVuZGVyRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgRG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSAoJHtjb3ZlcmFnZURhdGEuY291bnR9JSkgaXMgbm90IG92ZXIgdGhyZXNob2xkYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdEb2N1bWVudGF0aW9uIGNvdmVyYWdlIHBlciBmaWxlIGlzIG5vdCBhY2hpZXZlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBEb2N1bWVudGF0aW9uIGNvdmVyYWdlICgke2NvdmVyYWdlRGF0YS5jb3VudH0lKSBpcyBub3Qgb3ZlciB0aHJlc2hvbGRgKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnRG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSBwZXIgZmlsZSBpcyBhY2hpZXZlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcHJvY2Vzc1BhZ2UocGFnZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHBhZ2UnLCBwYWdlLm5hbWUpO1xyXG5cclxuICAgICAgICBsZXQgaHRtbERhdGEgPSB0aGlzLmh0bWxFbmdpbmUucmVuZGVyKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YSwgcGFnZSk7XHJcbiAgICAgICAgbGV0IGZpbmFsUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0Lmxhc3RJbmRleE9mKCcvJykgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIGZpbmFsUGF0aCArPSAnLyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwYWdlLnBhdGgpIHtcclxuICAgICAgICAgICAgZmluYWxQYXRoICs9IHBhZ2UucGF0aCArICcvJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwYWdlLmZpbGVuYW1lKSB7XHJcbiAgICAgICAgICAgIGZpbmFsUGF0aCArPSBwYWdlLmZpbGVuYW1lICsgJy5odG1sJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaW5hbFBhdGggKz0gcGFnZS5uYW1lICsgJy5odG1sJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2VhcmNoRW5naW5lLmluZGV4UGFnZSh7XHJcbiAgICAgICAgICAgIGluZm9zOiBwYWdlLFxyXG4gICAgICAgICAgICByYXdEYXRhOiBodG1sRGF0YSxcclxuICAgICAgICAgICAgdXJsOiBmaW5hbFBhdGhcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZUVuZ2luZS53cml0ZShmaW5hbFBhdGgsIGh0bWxEYXRhKS5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyAnICsgcGFnZS5uYW1lICsgJyBwYWdlIGdlbmVyYXRpb24nKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCcnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJvY2Vzc1BhZ2VzKCkge1xyXG4gICAgICAgIGxvZ2dlci5pbmZvKCdQcm9jZXNzIHBhZ2VzJyk7XHJcbiAgICAgICAgbGV0IHBhZ2VzID0gdGhpcy5jb25maWd1cmF0aW9uLnBhZ2VzO1xyXG4gICAgICAgIFByb21pc2UuYWxsKHBhZ2VzLm1hcCgocGFnZSkgPT4gdGhpcy5wcm9jZXNzUGFnZShwYWdlKSkpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoRW5naW5lLmdlbmVyYXRlU2VhcmNoSW5kZXhKc29uKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYWRkaXRpb25hbFBhZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzQWRkaXRpb25hbFBhZ2VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NBc3NldHNGb2xkZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXNvdXJjZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByb2Nlc3NBZGRpdGlvbmFsUGFnZXMoKSB7XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgYWRkaXRpb25hbCBwYWdlcycpO1xyXG4gICAgICAgIGxldCBwYWdlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hZGRpdGlvbmFsUGFnZXM7XHJcbiAgICAgICAgUHJvbWlzZS5hbGwocGFnZXMubWFwKChwYWdlLCBpKSA9PiB0aGlzLnByb2Nlc3NQYWdlKHBhZ2UpKSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hFbmdpbmUuZ2VuZXJhdGVTZWFyY2hJbmRleEpzb24odGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0Fzc2V0c0ZvbGRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXNvdXJjZXMoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByb2Nlc3NBc3NldHNGb2xkZXIoKTogdm9pZCB7XHJcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0NvcHkgYXNzZXRzIGZvbGRlcicpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZmlsZUVuZ2luZS5leGlzdHNTeW5jKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIpKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgUHJvdmlkZWQgYXNzZXRzIGZvbGRlciAke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXJ9IGRpZCBub3QgZXhpc3RgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmcy5jb3B5KFxyXG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIpLFxyXG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQgKyBwYXRoLnNlcCArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5hc3NldHNGb2xkZXIpLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJvY2Vzc1Jlc291cmNlcygpIHtcclxuICAgICAgICBsb2dnZXIuaW5mbygnQ29weSBtYWluIHJlc291cmNlcycpO1xyXG5cclxuICAgICAgICBjb25zdCBvbkNvbXBsZXRlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZmluYWxUaW1lID0gKG5ldyBEYXRlKCkgLSBzdGFydFRpbWUpIC8gMTAwMDtcclxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0RvY3VtZW50YXRpb24gZ2VuZXJhdGVkIGluICcgKyB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ICtcclxuICAgICAgICAgICAgICAgICcgaW4gJyArIGZpbmFsVGltZSArXHJcbiAgICAgICAgICAgICAgICAnIHNlY29uZHMgdXNpbmcgJyArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50aGVtZSArICcgdGhlbWUnKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5zZXJ2ZSkge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7dGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dH0gYXQgaHR0cDovLzEyNy4wLjAuMToke3RoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0fWApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XZWJTZXJ2ZXIodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgZmluYWxPdXRwdXQgPSB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0O1xyXG5cclxuICAgICAgICBsZXQgdGVzdE91dHB1dERpciA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQubWF0Y2gocHJvY2Vzcy5jd2QoKSk7XHJcbiAgICAgICAgaWYgKCF0ZXN0T3V0cHV0RGlyKSB7XHJcbiAgICAgICAgICAgIGZpbmFsT3V0cHV0ID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZzLmNvcHkocGF0aC5yZXNvbHZlKF9fZGlybmFtZSArICcvLi4vc3JjL3Jlc291cmNlcy8nKSwgcGF0aC5yZXNvbHZlKGZpbmFsT3V0cHV0KSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyByZXNvdXJjZXMgY29weSAnLCBlcnIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZzLmNvcHkocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCkgKyBwYXRoLnNlcCArIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5leHRUaGVtZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShmaW5hbE91dHB1dCArICcvc3R5bGVzLycpLCBmdW5jdGlvbiAoZXJyMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycjEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIGR1cmluZyBleHRlcm5hbCBzdHlsaW5nIHRoZW1lIGNvcHkgJywgZXJyMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdFeHRlcm5hbCBzdHlsaW5nIHRoZW1lIGNvcHkgc3VjY2VlZGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByb2Nlc3NHcmFwaHMoKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUdyYXBoKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdHcmFwaCBnZW5lcmF0aW9uIGRpc2FibGVkJyk7XHJcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1BhZ2VzKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgbWFpbiBncmFwaCcpO1xyXG4gICAgICAgICAgICBsZXQgbW9kdWxlcyA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5tb2R1bGVzO1xyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBtb2R1bGVzLmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IGxvb3AgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA8PSBsZW4gLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3MgbW9kdWxlIGdyYXBoJywgbW9kdWxlc1tpXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZmluYWxQYXRoID0gdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLm91dHB1dC5sYXN0SW5kZXhPZignLycpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJy8nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmaW5hbFBhdGggKz0gJ21vZHVsZXMvJyArIG1vZHVsZXNbaV0ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgX3Jhd01vZHVsZSA9IHRoaXMuZGVwZW5kZW5jaWVzRW5naW5lLmdldFJhd01vZHVsZShtb2R1bGVzW2ldLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmF3TW9kdWxlLmRlY2xhcmF0aW9ucy5sZW5ndGggPiAwIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yYXdNb2R1bGUuYm9vdHN0cmFwLmxlbmd0aCA+IDAgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3Jhd01vZHVsZS5pbXBvcnRzLmxlbmd0aCA+IDAgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3Jhd01vZHVsZS5leHBvcnRzLmxlbmd0aCA+IDAgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3Jhd01vZHVsZS5wcm92aWRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5nZEVuZ2luZS5yZW5kZXJHcmFwaChtb2R1bGVzW2ldLmZpbGUsIGZpbmFsUGF0aCwgJ2YnLCBtb2R1bGVzW2ldLm5hbWUpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ2RFbmdpbmUucmVhZEdyYXBoKHBhdGgucmVzb2x2ZShmaW5hbFBhdGggKyBwYXRoLnNlcCArICdkZXBlbmRlbmNpZXMuc3ZnJyksIG1vZHVsZXNbaV0ubmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzW2ldLmdyYXBoID0gZGF0YSBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBkdXJpbmcgZ3JhcGggcmVhZDogJywgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycm9yTWVzc2FnZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFnZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbGV0IGZpbmFsTWFpbkdyYXBoUGF0aCA9IHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vdXRwdXQ7XHJcbiAgICAgICAgICAgIGlmIChmaW5hbE1haW5HcmFwaFBhdGgubGFzdEluZGV4T2YoJy8nKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGZpbmFsTWFpbkdyYXBoUGF0aCArPSAnLyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmluYWxNYWluR3JhcGhQYXRoICs9ICdncmFwaCc7XHJcbiAgICAgICAgICAgIHRoaXMubmdkRW5naW5lLmluaXQocGF0aC5yZXNvbHZlKGZpbmFsTWFpbkdyYXBoUGF0aCkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uZ2RFbmdpbmUucmVuZGVyR3JhcGgodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnLCBwYXRoLnJlc29sdmUoZmluYWxNYWluR3JhcGhQYXRoKSwgJ3AnKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmdkRW5naW5lLnJlYWRHcmFwaChwYXRoLnJlc29sdmUoZmluYWxNYWluR3JhcGhQYXRoICsgcGF0aC5zZXAgKyAnZGVwZW5kZW5jaWVzLnN2ZycpLCAnTWFpbiBncmFwaCcpLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEubWFpbkdyYXBoID0gZGF0YSBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9vcCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZHVyaW5nIG1haW4gZ3JhcGggcmVhZGluZyA6ICcsIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRpc2FibGVNYWluR3JhcGggPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ09vb3BzIGVycm9yIGR1cmluZyBtYWluIGdyYXBoIGdlbmVyYXRpb24sIG1vdmluZyBvbiBuZXh0IHBhcnQgd2l0aCBtYWluIGdyYXBoIGRpc2FibGVkIDogJywgZXJyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlTWFpbkdyYXBoID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGxvb3AoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBydW5XZWJTZXJ2ZXIoZm9sZGVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzV2F0Y2hpbmcpIHtcclxuICAgICAgICAgICAgTGl2ZVNlcnZlci5zdGFydCh7XHJcbiAgICAgICAgICAgICAgICByb290OiBmb2xkZXIsXHJcbiAgICAgICAgICAgICAgICBvcGVuOiB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3BlbixcclxuICAgICAgICAgICAgICAgIHF1aWV0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbG9nTGV2ZWw6IDAsXHJcbiAgICAgICAgICAgICAgICB3YWl0OiAxMDAwLFxyXG4gICAgICAgICAgICAgICAgcG9ydDogdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnBvcnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEud2F0Y2ggJiYgIXRoaXMuaXNXYXRjaGluZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuZmlsZXMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ05vIHNvdXJjZXMgZmlsZXMgYXZhaWxhYmxlLCBwbGVhc2UgdXNlIC1wIGZsYWcnKTtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuV2F0Y2goKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLndhdGNoICYmIHRoaXMuaXNXYXRjaGluZykge1xyXG4gICAgICAgICAgICBsZXQgc3JjRm9sZGVyID0gZmluZE1haW5Tb3VyY2VGb2xkZXIodGhpcy5maWxlcyk7XHJcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBBbHJlYWR5IHdhdGNoaW5nIHNvdXJjZXMgaW4gJHtzcmNGb2xkZXJ9IGZvbGRlcmApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcnVuV2F0Y2goKSB7XHJcbiAgICAgICAgbGV0IHNvdXJjZXMgPSBbZmluZE1haW5Tb3VyY2VGb2xkZXIodGhpcy5maWxlcyldO1xyXG4gICAgICAgIGxldCB3YXRjaGVyUmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1dhdGNoaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgbG9nZ2VyLmluZm8oYFdhdGNoaW5nIHNvdXJjZXMgaW4gJHtmaW5kTWFpblNvdXJjZUZvbGRlcih0aGlzLmZpbGVzKX0gZm9sZGVyYCk7XHJcblxyXG4gICAgICAgIGlmICgkbWFya2Rvd25lbmdpbmUuaGFzUm9vdE1hcmtkb3ducygpKSB7XHJcbiAgICAgICAgICAgIHNvdXJjZXMgPSBzb3VyY2VzLmNvbmNhdCgkbWFya2Rvd25lbmdpbmUubGlzdFJvb3RNYXJrZG93bnMoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzICE9PSAnJykge1xyXG4gICAgICAgICAgICBzb3VyY2VzID0gc291cmNlcy5jb25jYXQodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmluY2x1ZGVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGFsbCBlbGVtZW50cyBvZiBzb3VyY2VzIGxpc3QgZXhpc3RcclxuICAgICAgICBzb3VyY2VzID0gY2xlYW5Tb3VyY2VzRm9yV2F0Y2goc291cmNlcyk7XHJcblxyXG4gICAgICAgIGxldCB3YXRjaGVyID0gY2hva2lkYXIud2F0Y2goc291cmNlcywge1xyXG4gICAgICAgICAgICBhd2FpdFdyaXRlRmluaXNoOiB0cnVlLFxyXG4gICAgICAgICAgICBpZ25vcmVJbml0aWFsOiB0cnVlLFxyXG4gICAgICAgICAgICBpZ25vcmVkOiAvKHNwZWN8XFwuZClcXC50cy9cclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgdGltZXJBZGRBbmRSZW1vdmVSZWY7XHJcbiAgICAgICAgbGV0IHRpbWVyQ2hhbmdlUmVmO1xyXG4gICAgICAgIGxldCB3YWl0ZXJBZGRBbmRSZW1vdmUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lckFkZEFuZFJlbW92ZVJlZik7XHJcbiAgICAgICAgICAgIHRpbWVyQWRkQW5kUmVtb3ZlUmVmID0gc2V0VGltZW91dChydW5uZXJBZGRBbmRSZW1vdmUsIDEwMDApO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IHJ1bm5lckFkZEFuZFJlbW92ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZSgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IHdhaXRlckNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyQ2hhbmdlUmVmKTtcclxuICAgICAgICAgICAgdGltZXJDaGFuZ2VSZWYgPSBzZXRUaW1lb3V0KHJ1bm5lckNoYW5nZSwgMTAwMCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgcnVubmVyQ2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFVwZGF0ZWRGaWxlcyh0aGlzLndhdGNoQ2hhbmdlZEZpbGVzKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaGFzV2F0Y2hlZEZpbGVzVFNGaWxlcygpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldE1pY3JvRGVwZW5kZW5jaWVzRGF0YSgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzV2F0Y2hlZEZpbGVzUm9vdE1hcmtkb3duRmlsZXMoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWJ1aWxkUm9vdE1hcmtkb3ducygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWJ1aWxkRXh0ZXJuYWxEb2N1bWVudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3YXRjaGVyXHJcbiAgICAgICAgICAgIC5vbigncmVhZHknLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXdhdGNoZXJSZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhdGNoZXJSZWFkeSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgd2F0Y2hlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ2FkZCcsIChmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYEZpbGUgJHtmaWxlfSBoYXMgYmVlbiBhZGRlZGApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVzdCBleHRlbnNpb24sIGlmIHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNjYW4gZXZlcnl0aGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0ZXJBZGRBbmRSZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCAoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBGaWxlICR7ZmlsZX0gaGFzIGJlZW4gY2hhbmdlZGApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVzdCBleHRlbnNpb24sIGlmIHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNjYW4gb25seSBmaWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLnRzJyB8fCBwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcubWQnIHx8IHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy5qc29uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2F0Y2hDaGFuZ2VkRmlsZXMucHVzaChwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSArIHBhdGguc2VwICsgZmlsZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRlckNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oJ3VubGluaycsIChmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYEZpbGUgJHtmaWxlfSBoYXMgYmVlbiByZW1vdmVkYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXN0IGV4dGVuc2lvbiwgaWYgdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2NhbiBldmVyeXRoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLnRzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRlckFkZEFuZFJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGFwcGxpY2F0aW9uIC8gcm9vdCBjb21wb25lbnQgaW5zdGFuY2UuXHJcbiAgICAgKi9cclxuICAgIGdldCBhcHBsaWNhdGlvbigpOiBBcHBsaWNhdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGdldCBpc0NMSSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmNvbnN0IGdsb2IgPSByZXF1aXJlKCdnbG9iJyk7XHJcblxyXG5leHBvcnQgbGV0IEV4Y2x1ZGVQYXJzZXIgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgbGV0IF9leGNsdWRlLFxyXG4gICAgICAgIF9jd2QsXHJcbiAgICAgICAgX2dsb2JGaWxlcyA9IFtdO1xyXG5cclxuICAgIGxldCBfaW5pdCA9IGZ1bmN0aW9uKGV4Y2x1ZGU6IHN0cmluZ1tdLCBjd2Q6IHN0cmluZykge1xyXG4gICAgICAgICAgICBfZXhjbHVkZSA9IGV4Y2x1ZGU7XHJcbiAgICAgICAgICAgIF9jd2QgPSBjd2Q7XHJcbiAgICAgICAgICAgIGxldCBpID0gMCxcclxuICAgICAgICAgICAgICAgIGxlbiA9IGV4Y2x1ZGUubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IoaTsgaTxsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgX2dsb2JGaWxlcyA9IFsuLi5fZ2xvYkZpbGVzLCAuLi5nbG9iLnN5bmMoZXhjbHVkZVtpXSwgeyBjd2Q6IF9jd2QgfSldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgX3Rlc3RGaWxlID0gKGZpbGU6IHN0cmluZyk6Ym9vbGVhbiA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gMCxcclxuICAgICAgICAgICAgICAgIGxlbiA9IF9leGNsdWRlLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIGZpbGVCYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSksXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZm9yKGk7IGk8bGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChnbG9iLmhhc01hZ2ljKF9leGNsdWRlW2ldKSAmJiBfZ2xvYkZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0R2xvYlNlYXJjaCA9IF9nbG9iRmlsZXMuZmluZEluZGV4KChlbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aC5iYXNlbmFtZShlbGVtZW50KSA9PT0gZmlsZUJhc2VuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHRHbG9iU2VhcmNoICE9PSAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmlsZUJhc2VuYW1lID09PSBwYXRoLmJhc2VuYW1lKF9leGNsdWRlW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdCkge2JyZWFrO31cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGluaXQ6IF9pbml0LFxyXG4gICAgICAgIHRlc3RGaWxlOiBfdGVzdEZpbGVcclxuICAgIH1cclxufSkoKTtcclxuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XHJcblxyXG5pbXBvcnQgeyBBcHBsaWNhdGlvbiB9IGZyb20gJy4vYXBwL2FwcGxpY2F0aW9uJztcclxuXHJcbmltcG9ydCB7IENPTVBPRE9DX0RFRkFVTFRTIH0gZnJvbSAnLi91dGlscy9kZWZhdWx0cyc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcclxuaW1wb3J0IHsgcmVhZENvbmZpZywgaGFuZGxlUGF0aCB9IGZyb20gJy4vdXRpbHMvdXRpbHMnO1xyXG5pbXBvcnQgeyBFeGNsdWRlUGFyc2VyIH0gZnJvbSAnLi91dGlscy9leGNsdWRlLnBhcnNlcic7XHJcbmltcG9ydCB7IEZpbGVFbmdpbmUgfSBmcm9tICcuL2FwcC9lbmdpbmVzL2ZpbGUuZW5naW5lJztcclxuXHJcbmNvbnN0IHBrZyA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xyXG5jb25zdCBwcm9ncmFtID0gcmVxdWlyZSgnY29tbWFuZGVyJyk7XHJcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcclxuY29uc3Qgb3NOYW1lID0gcmVxdWlyZSgnb3MtbmFtZScpO1xyXG5jb25zdCBmaWxlcyA9IFtdO1xyXG5jb25zdCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xyXG5cclxucHJvY2Vzcy5zZXRNYXhMaXN0ZW5lcnMoMCk7XHJcblxyXG5wcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCAoZXJyLCBwKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnVW5oYW5kbGVkIFJlamVjdGlvbiBhdDonLCBwLCAncmVhc29uOicsIGVycik7XHJcbiAgICBsb2dnZXIuZXJyb3IoJ1NvcnJ5LCBidXQgdGhlcmUgd2FzIGEgcHJvYmxlbSBkdXJpbmcgcGFyc2luZyBvciBnZW5lcmF0aW9uIG9mIHRoZSBkb2N1bWVudGF0aW9uLiBQbGVhc2UgZmlsbCBhbiBpc3N1ZSBvbiBnaXRodWIuIChodHRwczovL2dpdGh1Yi5jb20vY29tcG9kb2MvY29tcG9kb2MvaXNzdWVzL25ldyknKTtcclxuICAgIHByb2Nlc3MuZXhpdCgxKTtcclxufSk7XHJcblxyXG5wcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIChlcnIpID0+IHtcclxuICAgIGxvZ2dlci5lcnJvcihlcnIpO1xyXG4gICAgbG9nZ2VyLmVycm9yKCdTb3JyeSwgYnV0IHRoZXJlIHdhcyBhIHByb2JsZW0gZHVyaW5nIHBhcnNpbmcgb3IgZ2VuZXJhdGlvbiBvZiB0aGUgZG9jdW1lbnRhdGlvbi4gUGxlYXNlIGZpbGwgYW4gaXNzdWUgb24gZ2l0aHViLiAoaHR0cHM6Ly9naXRodWIuY29tL2NvbXBvZG9jL2NvbXBvZG9jL2lzc3Vlcy9uZXcpJyk7XHJcbiAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGNsYXNzIENsaUFwcGxpY2F0aW9uIGV4dGVuZHMgQXBwbGljYXRpb24ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSdW4gY29tcG9kb2MgZnJvbSB0aGUgY29tbWFuZCBsaW5lLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGUoKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3QodmFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWwuc3BsaXQoJywnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb2dyYW1cclxuICAgICAgICAgICAgLnZlcnNpb24ocGtnLnZlcnNpb24pXHJcbiAgICAgICAgICAgIC51c2FnZSgnPHNyYz4gW29wdGlvbnNdJylcclxuICAgICAgICAgICAgLm9wdGlvbignLXAsIC0tdHNjb25maWcgW2NvbmZpZ10nLCAnQSB0c2NvbmZpZy5qc29uIGZpbGUnKVxyXG4gICAgICAgICAgICAub3B0aW9uKCctZCwgLS1vdXRwdXQgW2ZvbGRlcl0nLCAnV2hlcmUgdG8gc3RvcmUgdGhlIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIChkZWZhdWx0OiAuL2RvY3VtZW50YXRpb24pJywgQ09NUE9ET0NfREVGQVVMVFMuZm9sZGVyKVxyXG4gICAgICAgICAgICAub3B0aW9uKCcteSwgLS1leHRUaGVtZSBbZmlsZV0nLCAnRXh0ZXJuYWwgc3R5bGluZyB0aGVtZSBmaWxlJylcclxuICAgICAgICAgICAgLm9wdGlvbignLW4sIC0tbmFtZSBbbmFtZV0nLCAnVGl0bGUgZG9jdW1lbnRhdGlvbicsIENPTVBPRE9DX0RFRkFVTFRTLnRpdGxlKVxyXG4gICAgICAgICAgICAub3B0aW9uKCctYSwgLS1hc3NldHNGb2xkZXIgW2ZvbGRlcl0nLCAnRXh0ZXJuYWwgYXNzZXRzIGZvbGRlciB0byBjb3B5IGluIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIGZvbGRlcicpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy1vLCAtLW9wZW4nLCAnT3BlbiB0aGUgZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24nLCBmYWxzZSlcclxuICAgICAgICAgICAgLm9wdGlvbignLXQsIC0tc2lsZW50JywgJ0luIHNpbGVudCBtb2RlLCBsb2cgbWVzc2FnZXMgYXJlblxcJ3QgbG9nZ2VkIGluIHRoZSBjb25zb2xlJywgZmFsc2UpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy1zLCAtLXNlcnZlJywgJ1NlcnZlIGdlbmVyYXRlZCBkb2N1bWVudGF0aW9uIChkZWZhdWx0IGh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC8pJywgZmFsc2UpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy1yLCAtLXBvcnQgW3BvcnRdJywgJ0NoYW5nZSBkZWZhdWx0IHNlcnZpbmcgcG9ydCcsIENPTVBPRE9DX0RFRkFVTFRTLnBvcnQpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy13LCAtLXdhdGNoJywgJ1dhdGNoIHNvdXJjZSBmaWxlcyBhZnRlciBzZXJ2ZSBhbmQgZm9yY2UgZG9jdW1lbnRhdGlvbiByZWJ1aWxkJywgZmFsc2UpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy0tdGhlbWUgW3RoZW1lXScsICdDaG9vc2Ugb25lIG9mIGF2YWlsYWJsZSB0aGVtZXMsIGRlZmF1bHQgaXMgXFwnZ2l0Ym9va1xcJyAobGFyYXZlbCwgb3JpZ2luYWwsIHBvc3RtYXJrLCByZWFkdGhlZG9jcywgc3RyaXBlLCB2YWdyYW50KScpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy0taGlkZUdlbmVyYXRvcicsICdEbyBub3QgcHJpbnQgdGhlIENvbXBvZG9jIGxpbmsgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZScsIGZhbHNlKVxyXG4gICAgICAgICAgICAub3B0aW9uKCctLXRvZ2dsZU1lbnVJdGVtcyA8aXRlbXM+JywgJ0Nsb3NlIGJ5IGRlZmF1bHQgaXRlbXMgaW4gdGhlIG1lbnUgKGRlZmF1bHQgW1xcJ2FsbFxcJ10pIHZhbHVlcyA6IFtcXCdhbGxcXCddIG9yIG9uZSBvZiB0aGVzZSBbXFwnbW9kdWxlc1xcJyxcXCdjb21wb25lbnRzXFwnLFxcJ2RpcmVjdGl2ZXNcXCcsXFwnY2xhc3Nlc1xcJyxcXCdpbmplY3RhYmxlc1xcJyxcXCdpbnRlcmZhY2VzXFwnLFxcJ3BpcGVzXFwnLFxcJ2FkZGl0aW9uYWxQYWdlc1xcJ10nLCBsaXN0LCBDT01QT0RPQ19ERUZBVUxUUy50b2dnbGVNZW51SXRlbXMpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy0taW5jbHVkZXMgW3BhdGhdJywgJ1BhdGggb2YgZXh0ZXJuYWwgbWFya2Rvd24gZmlsZXMgdG8gaW5jbHVkZScpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy0taW5jbHVkZXNOYW1lIFtuYW1lXScsICdOYW1lIG9mIGl0ZW0gbWVudSBvZiBleHRlcm5hbHMgbWFya2Rvd24gZmlsZXMgKGRlZmF1bHQgXCJBZGRpdGlvbmFsIGRvY3VtZW50YXRpb25cIiknLCBDT01QT0RPQ19ERUZBVUxUUy5hZGRpdGlvbmFsRW50cnlOYW1lKVxyXG4gICAgICAgICAgICAub3B0aW9uKCctLWNvdmVyYWdlVGVzdCBbdGhyZXNob2xkXScsICdUZXN0IGNvbW1hbmQgb2YgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSB3aXRoIGEgdGhyZXNob2xkIChkZWZhdWx0IDcwKScpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy0tY292ZXJhZ2VNaW5pbXVtUGVyRmlsZSBbbWluaW11bV0nLCAnVGVzdCBjb21tYW5kIG9mIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgcGVyIGZpbGUgd2l0aCBhIG1pbmltdW0gKGRlZmF1bHQgMCknKVxyXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVTb3VyY2VDb2RlJywgJ0RvIG5vdCBhZGQgc291cmNlIGNvZGUgdGFiIGFuZCBsaW5rcyB0byBzb3VyY2UgY29kZScsIGZhbHNlKVxyXG4gICAgICAgICAgICAub3B0aW9uKCctLWRpc2FibGVHcmFwaCcsICdEbyBub3QgYWRkIHRoZSBkZXBlbmRlbmN5IGdyYXBoJywgZmFsc2UpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGlzYWJsZUNvdmVyYWdlJywgJ0RvIG5vdCBhZGQgdGhlIGRvY3VtZW50YXRpb24gY292ZXJhZ2UgcmVwb3J0JywgZmFsc2UpXHJcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGlzYWJsZVByaXZhdGVPckludGVybmFsU3VwcG9ydCcsICdEbyBub3Qgc2hvdyBwcml2YXRlLCBAaW50ZXJuYWwgb3IgQW5ndWxhciBsaWZlY3ljbGUgaG9va3MgaW4gZ2VuZXJhdGVkIGRvY3VtZW50YXRpb24nLCBmYWxzZSlcclxuICAgICAgICAgICAgLnBhcnNlKHByb2Nlc3MuYXJndik7XHJcblxyXG4gICAgICAgIGxldCBvdXRwdXRIZWxwID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBwcm9ncmFtLm91dHB1dEhlbHAoKTtcclxuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLm91dHB1dCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEub3V0cHV0ID0gcHJvZ3JhbS5vdXRwdXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvZ3JhbS5leHRUaGVtZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZXh0VGhlbWUgPSBwcm9ncmFtLmV4dFRoZW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2dyYW0udGhlbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRoZW1lID0gcHJvZ3JhbS50aGVtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLm5hbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmRvY3VtZW50YXRpb25NYWluTmFtZSA9IHByb2dyYW0ubmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLmFzc2V0c0ZvbGRlcikge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuYXNzZXRzRm9sZGVyID0gcHJvZ3JhbS5hc3NldHNGb2xkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvZ3JhbS5vcGVuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5vcGVuID0gcHJvZ3JhbS5vcGVuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2dyYW0udG9nZ2xlTWVudUl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50b2dnbGVNZW51SXRlbXMgPSBwcm9ncmFtLnRvZ2dsZU1lbnVJdGVtcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLmluY2x1ZGVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlcyAgPSBwcm9ncmFtLmluY2x1ZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2dyYW0uaW5jbHVkZXNOYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc05hbWUgID0gcHJvZ3JhbS5pbmNsdWRlc05hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvZ3JhbS5zaWxlbnQpIHtcclxuICAgICAgICAgICAgbG9nZ2VyLnNpbGVudCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnNlcnZlICA9IHByb2dyYW0uc2VydmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvZ3JhbS5wb3J0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5wb3J0ID0gcHJvZ3JhbS5wb3J0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2dyYW0ud2F0Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLndhdGNoID0gcHJvZ3JhbS53YXRjaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLmhpZGVHZW5lcmF0b3IpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmhpZGVHZW5lcmF0b3IgPSBwcm9ncmFtLmhpZGVHZW5lcmF0b3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvZ3JhbS5pbmNsdWRlcykge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuaW5jbHVkZXMgPSBwcm9ncmFtLmluY2x1ZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2dyYW0uaW5jbHVkZXNOYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5pbmNsdWRlc05hbWUgPSBwcm9ncmFtLmluY2x1ZGVzTmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLmNvdmVyYWdlVGVzdCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VUZXN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdFRocmVzaG9sZCA9ICh0eXBlb2YgcHJvZ3JhbS5jb3ZlcmFnZVRlc3QgPT09ICdzdHJpbmcnKSA/IHBhcnNlSW50KHByb2dyYW0uY292ZXJhZ2VUZXN0KSA6IENPTVBPRE9DX0RFRkFVTFRTLmRlZmF1bHRDb3ZlcmFnZVRocmVzaG9sZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLmNvdmVyYWdlTWluaW11bVBlckZpbGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmNvdmVyYWdlVGVzdFBlckZpbGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuY292ZXJhZ2VNaW5pbXVtUGVyRmlsZSA9ICh0eXBlb2YgcHJvZ3JhbS5jb3ZlcmFnZU1pbmltdW1QZXJGaWxlID09PSAnc3RyaW5nJykgPyBwYXJzZUludChwcm9ncmFtLmNvdmVyYWdlTWluaW11bVBlckZpbGUpIDogQ09NUE9ET0NfREVGQVVMVFMuZGVmYXVsdENvdmVyYWdlTWluaW11bVBlckZpbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlU291cmNlQ29kZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZVNvdXJjZUNvZGUgPSBwcm9ncmFtLmRpc2FibGVTb3VyY2VDb2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2dyYW0uZGlzYWJsZUdyYXBoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlR3JhcGggPSBwcm9ncmFtLmRpc2FibGVHcmFwaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLmRpc2FibGVDb3ZlcmFnZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEuZGlzYWJsZUNvdmVyYWdlID0gcHJvZ3JhbS5kaXNhYmxlQ292ZXJhZ2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvZ3JhbS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0ID0gcHJvZ3JhbS5kaXNhYmxlUHJpdmF0ZU9ySW50ZXJuYWxTdXBwb3J0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmlzV2F0Y2hpbmcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9zcmMvYmFubmVyJykpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwa2cudmVyc2lvbik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcnKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYE5vZGUuanMgdmVyc2lvbiA6ICR7cHJvY2Vzcy52ZXJzaW9ufWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBPcGVyYXRpbmcgc3lzdGVtIDogJHtvc05hbWUob3MucGxhdGZvcm0oKSwgb3MucmVsZWFzZSgpKX1gKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb2dyYW0uc2VydmUgJiYgIXByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5vdXRwdXQpIHtcclxuICAgICAgICAgICAgLy8gaWYgLXMgJiAtZCwgc2VydmUgaXRcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmZpbGVFbmdpbmUuZXhpc3RzU3luYyhwcm9ncmFtLm91dHB1dCkpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgJHtwcm9ncmFtLm91dHB1dH0gZm9sZGVyIGRvZXNuJ3QgZXhpc3RgKTtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBTZXJ2aW5nIGRvY3VtZW50YXRpb24gZnJvbSAke3Byb2dyYW0ub3V0cHV0fSBhdCBodHRwOi8vMTI3LjAuMC4xOiR7cHJvZ3JhbS5wb3J0fWApO1xyXG4gICAgICAgICAgICAgICAgc3VwZXIucnVuV2ViU2VydmVyKHByb2dyYW0ub3V0cHV0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3JhbS5zZXJ2ZSAmJiAhcHJvZ3JhbS50c2NvbmZpZyAmJiAhcHJvZ3JhbS5vdXRwdXQpIHtcclxuICAgICAgICAgICAgLy8gaWYgb25seSAtcyBmaW5kIC4vZG9jdW1lbnRhdGlvbiwgaWYgb2sgc2VydmUsIGVsc2UgZXJyb3IgcHJvdmlkZSAtZFxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZmlsZUVuZ2luZS5leGlzdHNTeW5jKHByb2dyYW0ub3V0cHV0KSkge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdQcm92aWRlIG91dHB1dCBnZW5lcmF0ZWQgZm9sZGVyIHdpdGggLWQgZmxhZycpO1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFNlcnZpbmcgZG9jdW1lbnRhdGlvbiBmcm9tICR7cHJvZ3JhbS5vdXRwdXR9IGF0IGh0dHA6Ly8xMjcuMC4wLjE6JHtwcm9ncmFtLnBvcnR9YCk7XHJcbiAgICAgICAgICAgICAgICBzdXBlci5ydW5XZWJTZXJ2ZXIocHJvZ3JhbS5vdXRwdXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHByb2dyYW0uaGlkZUdlbmVyYXRvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLmhpZGVHZW5lcmF0b3IgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcgPSBwcm9ncmFtLnRzY29uZmlnO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZpbGVFbmdpbmUuZXhpc3RzU3luYyhwcm9ncmFtLnRzY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgXCIke3Byb2dyYW0udHNjb25maWd9XCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9maWxlID0gcGF0aC5qb2luKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgcGF0aC5kaXJuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZykpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmJhc2VuYW1lKHRoaXMuY29uZmlndXJhdGlvbi5tYWluRGF0YS50c2NvbmZpZylcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgY3VycmVudCBkaXJlY3Rvcnkgb2YgdHNjb25maWcuanNvbiBhcyBhIHdvcmtpbmcgZGlyZWN0b3J5XHJcbiAgICAgICAgICAgICAgICAgICAgY3dkID0gX2ZpbGUuc3BsaXQocGF0aC5zZXApLnNsaWNlKDAsIC0xKS5qb2luKHBhdGguc2VwKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgdHNjb25maWcnLCBfZmlsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0c0NvbmZpZ0ZpbGUgPSByZWFkQ29uZmlnKF9maWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IHRzQ29uZmlnRmlsZS5maWxlcztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSBoYW5kbGVQYXRoKGZpbGVzLCBjd2QpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXhjbHVkZSA9IHRzQ29uZmlnRmlsZS5leGNsdWRlIHx8IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4Y2x1ZGVQYXJzZXIuaW5pdChleGNsdWRlLCBjd2QpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmRlciA9IHJlcXVpcmUoJ2ZpbmRpdCcpKGN3ZCB8fCAnLicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdkaXJlY3RvcnknLCBmdW5jdGlvbiAoZGlyLCBzdGF0LCBzdG9wKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYmFzZSA9IHBhdGguYmFzZW5hbWUoZGlyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiYXNlID09PSAnLmdpdCcgfHwgYmFzZSA9PT0gJ25vZGVfbW9kdWxlcycpIHN0b3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kZXIub24oJ2ZpbGUnLCAoZmlsZSwgc3RhdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC8oc3BlY3xcXC5kKVxcLnRzLy50ZXN0KGZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nJywgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChFeGNsdWRlUGFyc2VyLnRlc3RGaWxlKGZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0V4Y2x1ZGluZycsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGF0aC5leHRuYW1lKGZpbGUpID09PSAnLnRzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnSW5jbHVkaW5nJywgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaChmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kZXIub24oJ2VuZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLmdlbmVyYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cGVyLnNldEZpbGVzKGZpbGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gIGVsc2UgaWYgKHByb2dyYW0udHNjb25maWcgJiYgcHJvZ3JhbS5hcmdzLmxlbmd0aCA+IDAgJiYgcHJvZ3JhbS5jb3ZlcmFnZVRlc3QpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdSdW4gZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSB0ZXN0Jyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcgPSBwcm9ncmFtLnRzY29uZmlnO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZpbGVFbmdpbmUuZXhpc3RzU3luYyhwcm9ncmFtLnRzY29uZmlnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgXCIke3Byb2dyYW0udHNjb25maWd9XCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9maWxlID0gcGF0aC5qb2luKFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIHBhdGguZGlybmFtZSh0aGlzLmNvbmZpZ3VyYXRpb24ubWFpbkRhdGEudHNjb25maWcpKSxcclxuICAgICAgICAgICAgICAgICAgICAgIHBhdGguYmFzZW5hbWUodGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBvZiB0c2NvbmZpZy5qc29uIGFzIGEgd29ya2luZyBkaXJlY3RvcnlcclxuICAgICAgICAgICAgICAgICAgICBjd2QgPSBfZmlsZS5zcGxpdChwYXRoLnNlcCkuc2xpY2UoMCwgLTEpLmpvaW4ocGF0aC5zZXApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdVc2luZyB0c2NvbmZpZycsIF9maWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRzQ29uZmlnRmlsZSA9IHJlYWRDb25maWcoX2ZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzID0gdHNDb25maWdGaWxlLmZpbGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IGhhbmRsZVBhdGgoZmlsZXMsIGN3ZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGNsdWRlID0gdHNDb25maWdGaWxlLmV4Y2x1ZGUgfHwgW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBFeGNsdWRlUGFyc2VyLmluaXQoZXhjbHVkZSwgY3dkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5kZXIgPSByZXF1aXJlKCdmaW5kaXQnKShjd2QgfHwgJy4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRlci5vbignZGlyZWN0b3J5JywgZnVuY3Rpb24gKGRpciwgc3RhdCwgc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJhc2UgPSBwYXRoLmJhc2VuYW1lKGRpcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZSA9PT0gJy5naXQnIHx8IGJhc2UgPT09ICdub2RlX21vZHVsZXMnKSBzdG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdmaWxlJywgKGZpbGUsIHN0YXQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgvKHNwZWN8XFwuZClcXC50cy8udGVzdChmaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKCdJZ25vcmluZycsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoRXhjbHVkZVBhcnNlci50ZXN0RmlsZShmaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKCdFeGNsdWRpbmcnLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhdGguZXh0bmFtZShmaWxlKSA9PT0gJy50cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0luY2x1ZGluZycsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGVyLm9uKCdlbmQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBlci50ZXN0Q292ZXJhZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBzdXBlci5zZXRGaWxlcyhmaWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIudGVzdENvdmVyYWdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvZ3JhbS50c2NvbmZpZyAmJiBwcm9ncmFtLmFyZ3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1haW5EYXRhLnRzY29uZmlnID0gcHJvZ3JhbS50c2NvbmZpZztcclxuICAgICAgICAgICAgICAgIGxldCBzb3VyY2VGb2xkZXIgPSBwcm9ncmFtLmFyZ3NbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZmlsZUVuZ2luZS5leGlzdHNTeW5jKHNvdXJjZUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFByb3ZpZGVkIHNvdXJjZSBmb2xkZXIgJHtzb3VyY2VGb2xkZXJ9IHdhcyBub3QgZm91bmQgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnVXNpbmcgcHJvdmlkZWQgc291cmNlIGZvbGRlcicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZmlsZUVuZ2luZS5leGlzdHNTeW5jKHByb2dyYW0udHNjb25maWcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgXCIke3Byb2dyYW0udHNjb25maWd9XCIgZmlsZSB3YXMgbm90IGZvdW5kIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRzQ29uZmlnRmlsZSA9IHJlYWRDb25maWcocHJvZ3JhbS50c2NvbmZpZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGNsdWRlID0gdHNDb25maWdGaWxlLmV4Y2x1ZGUgfHwgW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBFeGNsdWRlUGFyc2VyLmluaXQoZXhjbHVkZSwgY3dkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaW5kZXIgPSByZXF1aXJlKCdmaW5kaXQnKShwYXRoLnJlc29sdmUoc291cmNlRm9sZGVyKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kZXIub24oJ2RpcmVjdG9yeScsIGZ1bmN0aW9uIChkaXIsIHN0YXQsIHN0b3ApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiYXNlID0gcGF0aC5iYXNlbmFtZShkaXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2UgPT09ICcuZ2l0JyB8fCBiYXNlID09PSAnbm9kZV9tb2R1bGVzJykgc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRlci5vbignZmlsZScsIChmaWxlLCBzdGF0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoLyhzcGVjfFxcLmQpXFwudHMvLnRlc3QoZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybignSWdub3JpbmcnLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKEV4Y2x1ZGVQYXJzZXIudGVzdEZpbGUoZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybignRXhjbHVkaW5nJywgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYXRoLmV4dG5hbWUoZmlsZSkgPT09ICcudHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdJbmNsdWRpbmcnLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRlci5vbignZW5kJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXIuc2V0RmlsZXMoZmlsZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VwZXIuZ2VuZXJhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCd0c2NvbmZpZy5qc29uIGZpbGUgd2FzIG5vdCBmb3VuZCwgcGxlYXNlIHVzZSAtcCBmbGFnJyk7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRIZWxwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbInBrZyIsIl8uZmluZCIsInNlbXZlci5jb21wYXJlIiwidHMuU3ludGF4S2luZCIsInRzLmlzSlNEb2NQYXJhbWV0ZXJUYWciLCJ0cy5pc0pTRG9jIiwiXy5maWx0ZXIiLCJ0cy5pc1ZhcmlhYmxlU3RhdGVtZW50IiwidHMuaXNQYXJhbWV0ZXIiLCJfLmNvbmNhdCIsInRzLmlzSWRlbnRpZmllciIsInBhdGgiLCJIYW5kbGViYXJzLlNhZmVTdHJpbmciLCJ0cyIsIkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIiLCJfLnNsaWNlIiwicmVzb2x2ZSIsImZzLnJlYWRGaWxlIiwicGF0aC5yZXNvbHZlIiwiZnMub3V0cHV0RmlsZSIsImZzLmV4aXN0c1N5bmMiLCJIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCIsIkhhbmRsZWJhcnMuY29tcGlsZSIsInBhdGguc2VwIiwibWFya2VkIiwiZGlybmFtZSIsInBhdGguZGlybmFtZSIsInBhdGguYmFzZW5hbWUiLCJmcy5yZWFkRmlsZVN5bmMiLCJfLmZsYXRNYXAiLCJfLmZpbmRJbmRleCIsIl8iLCJwYXRoLmlzQWJzb2x1dGUiLCJwYXRoLmpvaW4iLCJzZXAiLCJfLnNvcnRCeSIsIl8udW5pcVdpdGgiLCJfLmlzRXF1YWwiLCJfLmZvckVhY2giLCJfLmNsb25lRGVlcCIsInRzLmlzQ2xhc3NEZWNsYXJhdGlvbiIsInRzLmRpc3BsYXlQYXJ0c1RvU3RyaW5nIiwidHMuZ2V0Q2xhc3NJbXBsZW1lbnRzSGVyaXRhZ2VDbGF1c2VFbGVtZW50cyIsInRzLmdldENsYXNzRXh0ZW5kc0hlcml0YWdlQ2xhdXNlRWxlbWVudCIsInRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uIiwidHMuU2NyaXB0VGFyZ2V0IiwidHMuTW9kdWxlS2luZCIsInRzLmNyZWF0ZVByb2dyYW0iLCJwYXRoLmV4dG5hbWUiLCJ0cy5mb3JFYWNoQ2hpbGQiLCJ0cy5TeW1ib2xGbGFncyIsIl8uZ3JvdXBCeSIsImN3ZCIsImZzLmNvcHkiLCJMaXZlU2VydmVyLnN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNyQixJQUFJQSxLQUFHLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFckMsSUFBSyxLQUtKO0FBTEQsV0FBSyxLQUFLO0lBQ1QsaUNBQUksQ0FBQTtJQUNKLG1DQUFLLENBQUE7SUFDTCxtQ0FBSyxDQUFBO0lBQ0wsaUNBQUksQ0FBQTtDQUNKLEVBTEksS0FBSyxLQUFMLEtBQUssUUFLVDtBQUVEO0lBT0M7UUFDQyxJQUFJLENBQUMsSUFBSSxHQUFHQSxLQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUdBLEtBQUcsQ0FBQyxPQUFPLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ25CO0lBRU0scUJBQUksR0FBWDtRQUFZLGNBQU87YUFBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1lBQVAseUJBQU87O1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTztTQUFFO1FBQzdCLElBQUksQ0FBQyxNQUFNLENBQ1YsSUFBSSxDQUFDLE1BQU0sT0FBWCxJQUFJLEdBQVEsS0FBSyxDQUFDLElBQUksU0FBSyxJQUFJLEdBQy9CLENBQUM7S0FDRjtJQUVNLHNCQUFLLEdBQVo7UUFBYSxjQUFPO2FBQVAsVUFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTztZQUFQLHlCQUFP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
