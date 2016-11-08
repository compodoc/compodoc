'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs-extra');
var path = require('path');
var LiveServer = require('live-server');
var Handlebars = require('handlebars');
var marked = _interopDefault(require('marked'));
var _ = require('lodash');
var Shelljs = require('shelljs');
var ts = require('typescript');
var fs$1 = require('fs');
var util = require('util');

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
        this.silent = true;
    }
    title(...args) {
        if (!this.silent)
            return;
        this.logger(c.cyan(...args));
    }
    info(...args) {
        if (!this.silent)
            return;
        this.logger(this.format(LEVEL.INFO, ...args));
    }
    warn(...args) {
        if (!this.silent)
            return;
        this.logger(this.format(LEVEL.WARN, ...args));
    }
    error(...args) {
        if (!this.silent)
            return;
        this.logger(this.format(LEVEL.FATAL, ...args));
    }
    fatal(...args) {
        if (!this.silent)
            return;
        this.error(...args);
    }
    debug(...args) {
        if (!this.silent)
            return;
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
        this.cache = {};
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
        Handlebars.registerHelper("filterAngular2Modules", function (text, options) {
            const NG2_MODULES = [
                'BrowserModule',
                'FormsModule',
                'HttpModule',
                'RouterModule'
            ];
            if (NG2_MODULES.indexOf(text) > -1) {
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
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('breakComma', function (text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/,/g, ',<br>');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('fxsignature', function (method) {
            const args = method.args.map(arg => `${arg.name}: ${arg.type}`).join(', ');
            return `${method.name}(${args})`;
        });
        Handlebars.registerHelper('object', function (text) {
            text = JSON.stringify(text);
            text = text.replace(/{"/, '{<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/,"/, ',<br>&nbsp;&nbsp;&nbsp;&nbsp;"');
            text = text.replace(/}$/, '<br>}');
            return new Handlebars.SafeString(text);
        });
    }
    init() {
        let partials = [
            'menu',
            'overview',
            'readme',
            'modules',
            'module',
            'components',
            'component',
            'directives',
            'directive',
            'injectables',
            'injectable',
            'pipes',
            'pipe',
            'classes',
            'class',
            'routes'
        ], i = 0, len = partials.length, loop = (resolve$$1, reject) => {
            if (i <= len - 1) {
                fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', (err, data) => {
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
    }
    render(mainData, page) {
        var o = mainData, that = this;
        Object.assign(o, page);
        return new Promise(function (resolve$$1, reject) {
            if (that.cache['page']) {
                let template = Handlebars.compile(that.cache['page']), result = template({
                    data: o
                });
                resolve$$1(result);
            }
            else {
                fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', (err, data) => {
                    if (err) {
                        reject('Error during index ' + page.name + ' generation');
                    }
                    else {
                        that.cache['page'] = data;
                        let template = Handlebars.compile(data), result = template({
                            data: o
                        });
                        resolve$$1(result);
                    }
                });
            }
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

class DependenciesEngine {
    constructor(data) {
        this.rawData = data;
        this.modules = _.sortBy(this.rawData.modules, ['name']);
        this.components = _.sortBy(this.rawData.components, ['name']);
        this.directives = _.sortBy(this.rawData.directives, ['name']);
        this.injectables = _.sortBy(this.rawData.injectables, ['name']);
        this.routes = _.sortBy(this.rawData.routes, ['name']);
        this.pipes = _.sortBy(this.rawData.pipes, ['name']);
        this.classes = _.sortBy(this.rawData.classes, ['name']);
    }
    getModules() {
        return this.modules;
    }
    getComponents() {
        return this.components;
    }
    getDirectives() {
        return this.directives;
    }
    getInjectables() {
        return this.injectables;
    }
    getRoutes() {
        return this.routes;
    }
    getPipes() {
        return this.pipes;
    }
    getClasses() {
        return this.classes;
    }
}

class NgdEngine {
    constructor() {
    }
    renderGraph(filepath, outputpath, type) {
        return new Promise(function (resolve$$1, reject) {
            Shelljs.exec(path.resolve(process.cwd() + '/node_modules/.bin/ngd') + ' -' + type + ' ' + filepath + ' -d ' + outputpath + ' -s -t svg', {
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
    }
}

// get default new line break

function detectIndent(str, count, indent) {
    let stripIndent = function (str) {
        const match = str.match(/^[ \t]*(?=\S)/gm);
        if (!match) {
            return str;
        }
        // TODO: use spread operator when targeting Node.js 6
        const indent = Math.min.apply(Math, match.map(x => x.length)); // eslint-disable-line
        const re = new RegExp(`^[ \\t]{${indent}}`, 'gm');
        return indent > 0 ? str.replace(re, '') : str;
    }, repeating = function (n, str) {
        str = str === undefined ? ' ' : str;
        if (typeof str !== 'string') {
            throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof str}\``);
        }
        if (n < 0 || !Number.isFinite(n)) {
            throw new TypeError(`Expected \`count\` to be a positive finite number, got \`${n}\``);
        }
        let ret = '';
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
            throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof str}\``);
        }
        if (typeof count !== 'number') {
            throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof count}\``);
        }
        if (typeof indent !== 'string') {
            throw new TypeError(`Expected \`indent\` to be a \`string\`, got \`${typeof indent}\``);
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
    const inputFileName = transpileOptions.fileName || (transpileOptions.jsx ? 'module.tsx' : 'module.ts');
    const compilerHost = {
        getSourceFile: (fileName) => {
            if (fileName.lastIndexOf('.ts') !== -1) {
                if (fileName === 'lib.d.ts') {
                    return undefined;
                }
                if (path.isAbsolute(fileName) === false) {
                    fileName = path.join(transpileOptions.tsconfigDirectory, fileName);
                }
                let libSource = '';
                try {
                    libSource = fs$1.readFileSync(fileName).toString();
                }
                catch (e) {
                    logger.debug(e, fileName);
                }
                return ts.createSourceFile(fileName, libSource, transpileOptions.target, false);
            }
            return undefined;
        },
        writeFile: (name, text) => { },
        getDefaultLibFileName: () => 'lib.d.ts',
        useCaseSensitiveFileNames: () => false,
        getCanonicalFileName: fileName => fileName,
        getCurrentDirectory: () => '',
        getNewLine: () => '\n',
        fileExists: (fileName) => fileName === inputFileName,
        readFile: () => '',
        directoryExists: () => true,
        getDirectories: () => []
    };
    return compilerHost;
}

let q = require('q');
class Dependencies {
    constructor(files, options) {
        this.__cache = {};
        this.__nsModule = {};
        this.unknown = '???';
        this.files = files;
        const transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts.createProgram(this.files, transpileOptions, compilerHost(transpileOptions));
    }
    breakLines(text) {
        text = text.replace(/(\n)/gm, '<br>');
        text = text.replace(/(<br>)$/gm, '');
        return text;
    }
    getDependencies() {
        let deps = {
            'modules': [],
            'components': [],
            'injectables': [],
            'pipes': [],
            'directives': [],
            'routes': [],
            'classes': []
        };
        let sourceFiles = this.program.getSourceFiles() || [];
        sourceFiles.map((file) => {
            let filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    logger.info('parsing', filePath);
                    try {
                        this.getSourceFileDecorators(file, deps);
                    }
                    catch (e) {
                        logger.error(e, file.fileName);
                    }
                }
            }
            return deps;
        });
        return deps;
    }
    getSourceFileDecorators(srcFile, outputSymbols) {
        ts.forEachChild(srcFile, (node) => {
            let deps = {};
            let file = srcFile.fileName.replace(process.cwd() + path.sep, '');
            if (node.decorators) {
                let visitNode = (visitedNode, index) => {
                    let metadata = node.decorators.pop();
                    let name = this.getSymboleName(node);
                    let props = this.findProps(visitedNode);
                    let IO = this.getComponentIO(file);
                    if (this.isModule(metadata)) {
                        deps = {
                            name,
                            file: file,
                            providers: this.getModuleProviders(props),
                            declarations: this.getModuleDeclations(props),
                            imports: this.getModuleImports(props),
                            exports: this.getModuleExports(props),
                            bootstrap: this.getModuleBootstrap(props),
                            type: 'module',
                            description: this.breakLines(IO.description)
                        };
                        outputSymbols['modules'].push(deps);
                        outputSymbols['routes'] = [...outputSymbols['routes'], ...this.findRoutes(deps.imports)];
                    }
                    else if (this.isComponent(metadata)) {
                        //console.log(util.inspect(props, { showHidden: true, depth: 10 }));
                        deps = {
                            name,
                            file: file,
                            //animations?: string[]; // TODO
                            changeDetection: this.getComponentChangeDetection(props),
                            encapsulation: this.getComponentEncapsulation(props),
                            //entryComponents?: string; // TODO waiting doc infos
                            exportAs: this.getComponentExportAs(props),
                            host: this.getComponentHost(props),
                            inputs: this.getComponentInputsMetadata(props),
                            //interpolation?: string; // TODO waiting doc infos
                            moduleId: this.getComponentModuleId(props),
                            outputs: this.getComponentOutputs(props),
                            providers: this.getComponentProviders(props),
                            //queries?: Deps[]; // TODO
                            selector: this.getComponentSelector(props),
                            styleUrls: this.getComponentStyleUrls(props),
                            styles: this.getComponentStyles(props),
                            template: this.getComponentTemplate(props),
                            templateUrl: this.getComponentTemplateUrl(props),
                            viewProviders: this.getComponentViewProviders(props),
                            inputsClass: IO.inputs,
                            outputsClass: IO.outputs,
                            propertiesClass: IO.properties,
                            methodsClass: IO.methods,
                            description: this.breakLines(IO.description),
                            type: 'component'
                        };
                        outputSymbols['components'].push(deps);
                    }
                    else if (this.isInjectable(metadata)) {
                        deps = {
                            name,
                            file: file,
                            type: 'injectable',
                            properties: IO.properties,
                            methods: IO.methods,
                            description: this.breakLines(IO.description)
                        };
                        outputSymbols['injectables'].push(deps);
                    }
                    else if (this.isPipe(metadata)) {
                        deps = {
                            name,
                            file: file,
                            type: 'pipe',
                            description: this.breakLines(IO.description)
                        };
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (this.isDirective(metadata)) {
                        deps = {
                            name,
                            file: file,
                            type: 'directive',
                            description: this.breakLines(IO.description)
                        };
                        outputSymbols['directives'].push(deps);
                    }
                    this.debug(deps);
                    this.__cache[name] = deps;
                };
                let filterByDecorators = (node) => {
                    if (node.expression && node.expression.expression) {
                        return /(NgModule|Component|Injectable|Pipe|Directive)/.test(node.expression.expression.text);
                    }
                    return false;
                };
                node.decorators
                    .filter(filterByDecorators)
                    .forEach(visitNode);
            }
            else {
                if (node.symbol) {
                    if (node.symbol.flags === ts.SymbolFlags.Class) {
                        let name = this.getSymboleName(node);
                        let IO = this.getComponentIO(file);
                        deps = {
                            name,
                            file: file,
                            type: 'class',
                            description: this.breakLines(IO.description),
                            properties: IO.properties,
                            methods: IO.methods
                        };
                        outputSymbols['classes'].push(deps);
                    }
                }
            }
        });
    }
    debug(deps) {
        logger.debug('debug', `${deps.name}:`);
        [
            'imports', 'exports', 'declarations', 'providers', 'bootstrap'
        ].forEach(symbols => {
            if (deps[symbols] && deps[symbols].length > 0) {
                logger.debug('', `- ${symbols}:`);
                deps[symbols].map(i => i.name).forEach(d$$1 => {
                    logger.debug('', `\t- ${d$$1}`);
                });
            }
        });
    }
    isComponent(metadata) {
        return metadata.expression.expression.text === 'Component';
    }
    isPipe(metadata) {
        return metadata.expression.expression.text === 'Pipe';
    }
    isDirective(metadata) {
        return metadata.expression.expression.text === 'Directive';
    }
    isInjectable(metadata) {
        return metadata.expression.expression.text === 'Injectable';
    }
    isModule(metadata) {
        return metadata.expression.expression.text === 'NgModule';
    }
    getType(name) {
        let type;
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
    }
    findRoutes(props) {
        let i = 0, len = props.length, result = [];
        for (i; i < len; i++) {
            if (props[i].ns && props[i].ns === 'RouterModule') {
                result.push(props[i].name);
            }
        }
        return result;
    }
    getSymboleName(node) {
        return node.name.text;
    }
    getComponentSelector(props) {
        return this.getSymbolDeps(props, 'selector').pop();
    }
    getComponentExportAs(props) {
        return this.getSymbolDeps(props, 'exportAs').pop();
    }
    getModuleProviders(props) {
        return this.getSymbolDeps(props, 'providers').map((providerName) => {
            return this.parseDeepIndentifier(providerName);
        });
    }
    findProps(visitedNode) {
        if (visitedNode.expression.arguments.length > 0) {
            return visitedNode.expression.arguments.pop().properties;
        }
        else {
            return '';
        }
    }
    getModuleDeclations(props) {
        return this.getSymbolDeps(props, 'declarations').map((name) => {
            let component = this.findComponentSelectorByName(name);
            if (component) {
                return component;
            }
            return this.parseDeepIndentifier(name);
        });
    }
    getModuleImports(props) {
        return this.getSymbolDeps(props, 'imports').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }
    getModuleExports(props) {
        return this.getSymbolDeps(props, 'exports').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }
    getComponentHost(props) {
        return this.getSymbolDepsObject(props, 'host');
    }
    getModuleBootstrap(props) {
        return this.getSymbolDeps(props, 'bootstrap').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }
    getComponentInputsMetadata(props) {
        return this.getSymbolDeps(props, 'inputs');
    }
    getDecoratorOfType(node, decoratorType) {
        var decorators = node.decorators || [];
        for (var i = 0; i < decorators.length; i++) {
            if (decorators[i].expression.expression.text === decoratorType) {
                return decorators[i];
            }
        }
        return null;
    }
    visitInput(property, inDecorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inArgs = inDecorator.expression.arguments;
        return {
            name: inArgs.length ? inArgs[0].text : property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            type: this.visitType(property),
            description: marked(ts.displayPartsToString(property.symbol.getDocumentationComment()))
        };
    }
    visitType(node) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return node ? this.typeCheckerComponent.typeToString(this.typeCheckerComponent.getTypeAtLocation(node)) : 'void';
    }
    visitOutput(property, outDecorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var outArgs = outDecorator.expression.arguments;
        return {
            name: outArgs.length ? outArgs[0].text : property.name.text,
            description: marked(ts.displayPartsToString(property.symbol.getDocumentationComment()))
        };
    }
    isPrivateOrInternal(member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return ((member.flags & ts.NodeFlags.Private) !== 0) || this.isInternalMember(member);
    }
    isInternalMember(member) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const jsDoc = ts.displayPartsToString(member.symbol.getDocumentationComment());
        return jsDoc.trim().length === 0 || jsDoc.indexOf('@internal') > -1;
    }
    isAngularLifecycleHook(methodName) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        const ANGULAR_LIFECYCLE_METHODS = [
            'ngOnInit', 'ngOnChanges', 'ngDoCheck', 'ngOnDestroy', 'ngAfterContentInit', 'ngAfterContentChecked',
            'ngAfterViewInit', 'ngAfterViewChecked', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'
        ];
        return ANGULAR_LIFECYCLE_METHODS.indexOf(methodName) >= 0;
    }
    visitMethodDeclaration(method) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return {
            name: method.name.text,
            description: marked(ts.displayPartsToString(method.symbol.getDocumentationComment())),
            args: method.parameters ? method.parameters.map((prop) => this.visitArgument(prop)) : [],
            returnType: this.visitType(method.type)
        };
    }
    visitArgument(arg) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return {
            name: arg.name.text,
            type: this.visitType(arg)
        };
    }
    getNamesCompareFn(name) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        name = name || 'name';
        return (a, b) => a[name].localeCompare(b[name]);
    }
    stringifyDefaultValue(node) {
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
    }
    visitProperty(property) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return {
            name: property.name.text,
            defaultValue: property.initializer ? this.stringifyDefaultValue(property.initializer) : undefined,
            type: this.visitType(property),
            description: marked(ts.displayPartsToString(property.symbol.getDocumentationComment()))
        };
    }
    visitMembers(members) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var inputs = [];
        var outputs = [];
        var methods = [];
        var properties = [];
        var inputDecorator, outDecorator;
        for (var i = 0; i < members.length; i++) {
            inputDecorator = this.getDecoratorOfType(members[i], 'Input');
            outDecorator = this.getDecoratorOfType(members[i], 'Output');
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
            }
        }
        inputs.sort(this.getNamesCompareFn());
        outputs.sort(this.getNamesCompareFn());
        properties.sort(this.getNamesCompareFn());
        return {
            inputs,
            outputs,
            methods,
            properties
        };
    }
    visitDirectiveDecorator(decorator) {
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
            selector,
            exportAs
        };
    }
    isPipeDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return decorator.expression.expression.text === 'Pipe';
    }
    isModuleDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return decorator.expression.expression.text === 'NgModule';
    }
    isDirectiveDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var decoratorIdentifierText = decorator.expression.expression.text;
        return decoratorIdentifierText === 'Directive' || decoratorIdentifierText === 'Component';
    }
    isServiceDecorator(decorator) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        return decorator.expression.expression.text === 'Injectable';
    }
    visitClassDeclaration(fileName, classDeclaration) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        var symbol = this.program.getTypeChecker().getSymbolAtLocation(classDeclaration.name);
        var description = marked(ts.displayPartsToString(symbol.getDocumentationComment()));
        var className = classDeclaration.name.text;
        var directiveInfo;
        var members;
        if (classDeclaration.decorators) {
            for (var i = 0; i < classDeclaration.decorators.length; i++) {
                if (this.isDirectiveDecorator(classDeclaration.decorators[i])) {
                    directiveInfo = this.visitDirectiveDecorator(classDeclaration.decorators[i]);
                    members = this.visitMembers(classDeclaration.members);
                    return {
                        description,
                        inputs: members.inputs,
                        outputs: members.outputs,
                        properties: members.properties,
                        methods: members.methods
                    };
                }
                else if (this.isServiceDecorator(classDeclaration.decorators[i])) {
                    members = this.visitMembers(classDeclaration.members);
                    return [{
                            fileName,
                            className,
                            description,
                            methods: members.methods,
                            properties: members.properties
                        }];
                }
                else if (this.isPipeDecorator(classDeclaration.decorators[i]) || this.isModuleDecorator(classDeclaration.decorators[i])) {
                    return [{
                            fileName,
                            className,
                            description
                        }];
                }
            }
        }
        else if (description) {
            members = this.visitMembers(classDeclaration.members);
            return [{
                    description,
                    methods: members.methods,
                    properties: members.properties
                }];
        }
        return [];
    }
    getComponentIO(filename) {
        /**
         * Copyright https://github.com/ng-bootstrap/ng-bootstrap
         */
        this.programComponent = ts.createProgram([filename], {});
        let sourceFile = this.programComponent.getSourceFile(filename);
        this.typeCheckerComponent = this.programComponent.getTypeChecker(true);
        var res = sourceFile.statements.reduce((directive, statement) => {
            if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                return directive.concat(this.visitClassDeclaration(filename, statement));
            }
            return directive;
        }, []);
        return res[0] || {};
    }
    getComponentOutputs(props) {
        return this.getSymbolDeps(props, 'outputs');
    }
    getComponentProviders(props) {
        return this.getSymbolDeps(props, 'providers').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }
    getComponentViewProviders(props) {
        return this.getSymbolDeps(props, 'viewProviders').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }
    getComponentDirectives(props) {
        return this.getSymbolDeps(props, 'directives').map((name) => {
            let identifier = this.parseDeepIndentifier(name);
            identifier.selector = this.findComponentSelectorByName(name);
            identifier.label = '';
            return identifier;
        });
    }
    parseDeepIndentifier(name) {
        let nsModule = name.split('.'), type = this.getType(name);
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
                name,
                type: type
            };
        }
        return {
            name,
            type: type
        };
    }
    getComponentTemplateUrl(props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
    }
    getComponentTemplate(props) {
        let t = this.getSymbolDeps(props, 'template', true).pop();
        if (t) {
            t = detectIndent(t, 0);
            t = t.replace(/\n/, '');
            t = t.replace(/ +$/gm, '');
        }
        return t;
    }
    getComponentStyleUrls(props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
    }
    getComponentStyles(props) {
        return this.getSymbolDeps(props, 'styles');
    }
    getComponentModuleId(props) {
        return this.getSymbolDeps(props, 'moduleId').pop();
    }
    getComponentChangeDetection(props) {
        return this.getSymbolDeps(props, 'changeDetection').pop();
    }
    getComponentEncapsulation(props) {
        return this.getSymbolDeps(props, 'encapsulation');
    }
    sanitizeUrls(urls) {
        return urls.map(url => url.replace('./', ''));
    }
    getSymbolDepsObject(props, type, multiLine) {
        let deps = props.filter((node) => {
            return node.name.text === type;
        });
        let parseProperties = (node) => {
            let obj = {};
            (node.initializer.properties || []).forEach((prop) => {
                obj[prop.name.text] = prop.initializer.text;
            });
            return obj;
        };
        return deps.map(parseProperties).pop();
    }
    getSymbolDeps(props, type, multiLine) {
        let deps = props.filter((node) => {
            return node.name.text === type;
        });
        let parseSymbolText = (text) => {
            if (text.indexOf('/') !== -1 && !multiLine) {
                text = text.split('/').pop();
            }
            return [
                text
            ];
        };
        let buildIdentifierName = (node, name = '') => {
            if (node.expression) {
                name = name ? `.${name}` : name;
                let nodeName = this.unknown;
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
                            nodeName = node.expression.elements.map(el => el.text).join(', ');
                            nodeName = `[${nodeName}]`;
                        }
                    }
                }
                if (node.kind === ts.SyntaxKind.SpreadElementExpression) {
                    return `...${nodeName}`;
                }
                return `${buildIdentifierName(node.expression, nodeName)}${name}`;
            }
            return `${node.text}.${name}`;
        };
        let parseProviderConfiguration = (o) => {
            // parse expressions such as:
            // { provide: APP_BASE_HREF, useValue: '/' },
            // or
            // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }
            let _genProviderName = [];
            let _providerProps = [];
            (o.properties || []).forEach((prop) => {
                let identifier = prop.initializer.text;
                if (prop.initializer.kind === ts.SyntaxKind.StringLiteral) {
                    identifier = `'${identifier}'`;
                }
                // lambda function (i.e useFactory)
                if (prop.initializer.body) {
                    let params = (prop.initializer.parameters || []).map((params) => params.name.text);
                    identifier = `(${params.join(', ')}) => {}`;
                }
                else if (prop.initializer.elements) {
                    let elements = (prop.initializer.elements || []).map((n) => {
                        if (n.kind === ts.SyntaxKind.StringLiteral) {
                            return `'${n.text}'`;
                        }
                        return n.text;
                    });
                    identifier = `[${elements.join(', ')}]`;
                }
                _providerProps.push([
                    // i.e provide
                    prop.name.text,
                    // i.e OpaqueToken or 'StringToken'
                    identifier
                ].join(': '));
            });
            return `{ ${_providerProps.join(', ')} }`;
        };
        let parseSymbolElements = (o) => {
            // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
            if (o.arguments) {
                let className = buildIdentifierName(o.expression);
                // function arguments could be really complexe. There are so
                // many use cases that we can't handle. Just print "args" to indicate
                // that we have arguments.
                let functionArgs = o.arguments.length > 0 ? 'args' : '';
                let text = `${className}(${functionArgs})`;
                return text;
            }
            else if (o.expression) {
                let identifier = buildIdentifierName(o);
                return identifier;
            }
            return o.text ? o.text : parseProviderConfiguration(o);
        };
        let parseSymbols = (node) => {
            let text = node.initializer.text;
            if (text) {
                return parseSymbolText(text);
            }
            else if (node.initializer.expression) {
                let identifier = parseSymbolElements(node.initializer);
                return [
                    identifier
                ];
            }
            else if (node.initializer.elements) {
                return node.initializer.elements.map(parseSymbolElements);
            }
        };
        return deps.map(parseSymbols).pop() || [];
    }
    findComponentSelectorByName(name) {
        return this.__cache[name];
    }
}

let pkg = require('../package.json');
let program = require('commander');
let files = [];
let cwd = process.cwd();
let $htmlengine = new HtmlEngine();
let $fileengine = new FileEngine();
let $configuration = new Configuration();
let $markdownengine = new MarkdownEngine();
let $ngdengine = new NgdEngine();
let $dependenciesEngine;
let startTime = new Date();
var Application;
(function (Application) {
    let defaultTitle = `Application documentation`;
    program
        .version(pkg.version)
        .option('-f, --file [file]', 'A tsconfig.json file')
        .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', `./documentation/`)
        .option('-b, --base [base]', 'Base reference of html tag', '/')
        .option('-n, --name [name]', 'Title documentation', defaultTitle)
        .option('-o, --open', 'Open the generated documentation', false)
        .option('-t, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
        .option('-s, --serve', 'Serve generated documentation (default http://localhost:8080/)', false)
        .option('-g, --hideGenerator', 'Do not print the Compodoc link at the bottom of the page', false)
        .parse(process.argv);
    let outputHelp = () => {
        program.outputHelp();
        process.exit(1);
    };
    if (program.silent) {
        logger.silent = false;
    }
    $configuration.mainData.documentationMainName = program.name; //default commander value
    $configuration.mainData.base = program.base;
    let processPackageJson = () => {
        logger.info('Searching package.json file');
        $fileengine.get('package.json').then((packageData) => {
            let parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined' && program.name === defaultTitle) {
                $configuration.mainData.documentationMainName = parsedData.name + ' documentation';
            }
            if (typeof parsedData.description !== 'undefined') {
                $configuration.mainData.documentationMainDescription = parsedData.description;
            }
            logger.info('package.json file found');
            processMarkdown();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without package.json file');
            processMarkdown();
        });
    };
    let processMarkdown = () => {
        logger.info('Searching README.md file');
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
            logger.info('README.md file found');
            getDependenciesData();
        }, (errorMessage) => {
            logger.error(errorMessage);
            logger.error('Continuing without README.md file');
            $configuration.addPage({
                name: 'index',
                context: 'overview'
            });
            getDependenciesData();
        });
    };
    let getDependenciesData = () => {
        logger.info('Get dependencies data');
        let crawler = new Dependencies(files, {
            tsconfigDirectory: cwd
        });
        let dependenciesData = crawler.getDependencies();
        $dependenciesEngine = new DependenciesEngine(dependenciesData);
        prepareModules();
        prepareComponents();
        if ($dependenciesEngine.directives.length > 0) {
            prepareDirectives();
        }
        if ($dependenciesEngine.injectables.length > 0) {
            prepareInjectables();
        }
        if ($dependenciesEngine.routes.length > 0) {
            prepareRoutes();
        }
        if ($dependenciesEngine.pipes.length > 0) {
            preparePipes();
        }
        if ($dependenciesEngine.classes.length > 0) {
            prepareClasses();
        }
        processPages();
    };
    let prepareModules = () => {
        logger.info('Prepare modules');
        $configuration.mainData.modules = $dependenciesEngine.getModules();
        $configuration.addPage({
            name: 'modules',
            context: 'modules'
        });
        let i = 0, len = $configuration.mainData.modules.length;
        for (i; i < len; i++) {
            $configuration.addPage({
                path: 'modules',
                name: $configuration.mainData.modules[i].name,
                context: 'module',
                module: $configuration.mainData.modules[i]
            });
        }
    };
    let preparePipes = () => {
        logger.info('Prepare pipes');
        $configuration.mainData.pipes = $dependenciesEngine.getPipes();
        $configuration.addPage({
            name: 'pipes',
            context: 'pipes'
        });
        let i = 0, len = $configuration.mainData.pipes.length;
        for (i; i < len; i++) {
            $configuration.addPage({
                path: 'pipes',
                name: $configuration.mainData.pipes[i].name,
                context: 'pipe',
                pipe: $configuration.mainData.pipes[i]
            });
        }
    };
    let prepareClasses = () => {
        logger.info('Prepare classes');
        $configuration.mainData.classes = $dependenciesEngine.getClasses();
        $configuration.addPage({
            name: 'classes',
            context: 'classes'
        });
        let i = 0, len = $configuration.mainData.classes.length;
        for (i; i < len; i++) {
            $configuration.addPage({
                path: 'classes',
                name: $configuration.mainData.classes[i].name,
                context: 'class',
                class: $configuration.mainData.classes[i]
            });
        }
    };
    let prepareComponents = () => {
        logger.info('Prepare components');
        $configuration.mainData.components = $dependenciesEngine.getComponents();
        $configuration.addPage({
            name: 'components',
            context: 'components'
        });
        let i = 0, len = $configuration.mainData.components.length;
        for (i; i < len; i++) {
            $configuration.addPage({
                path: 'components',
                name: $configuration.mainData.components[i].name,
                context: 'component',
                component: $configuration.mainData.components[i]
            });
        }
    };
    let prepareDirectives = () => {
        logger.info('Prepare directives');
        $configuration.mainData.directives = $dependenciesEngine.getDirectives();
        $configuration.addPage({
            name: 'directives',
            context: 'directives'
        });
        let i = 0, len = $configuration.mainData.directives.length;
        for (i; i < len; i++) {
            $configuration.addPage({
                path: 'directives',
                name: $configuration.mainData.directives[i].name,
                context: 'directive',
                directive: $configuration.mainData.directives[i]
            });
        }
    };
    let prepareInjectables = () => {
        logger.info('Prepare injectables');
        $configuration.mainData.injectables = $dependenciesEngine.getInjectables();
        $configuration.addPage({
            name: 'injectables',
            context: 'injectables'
        });
        let i = 0, len = $configuration.mainData.injectables.length;
        for (i; i < len; i++) {
            $configuration.addPage({
                path: 'injectables',
                name: $configuration.mainData.injectables[i].name,
                context: 'injectable',
                injectable: $configuration.mainData.injectables[i]
            });
        }
    };
    let prepareRoutes = () => {
        logger.info('Process routes');
        $configuration.mainData.routes = $dependenciesEngine.getRoutes();
        $configuration.addPage({
            name: 'routes',
            context: 'routes'
        });
        /*
        let i = 0,
            len = $configuration.mainData.routes.length;

        for(i; i<len; i++) {
            $configuration.addPage({
                path: 'routes',
                name: $configuration.mainData.routes[i].name,
                context: 'route',
                route: $configuration.mainData.routes[i]
            });
        }*/
    };
    let processPages = () => {
        logger.info('Process pages');
        let pages = $configuration.pages, i = 0, len = pages.length, loop = () => {
            if (i <= len - 1) {
                logger.info('Process page', pages[i].name);
                $htmlengine.render($configuration.mainData, pages[i]).then((htmlData) => {
                    let path$$1 = program.output;
                    if (pages[i].path) {
                        path$$1 += '/' + pages[i].path + '/';
                    }
                    path$$1 += pages[i].name + '.html';
                    fs.outputFile(path$$1, htmlData, function (err) {
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
        logger.info('Copy main resources');
        fs.copy(path.resolve(__dirname + '/../src/resources/'), path.resolve(process.cwd() + path.sep + program.output), function (err) {
            if (err) {
                logger.error('Error during resources copy');
            }
            else {
                processGraphs();
            }
        });
    };
    let processGraphs = () => {
        logger.info('Process main graph');
        let modules = $configuration.mainData.modules, i = 0, len = modules.length, loop = () => {
            if (i <= len - 1) {
                logger.info('Process module graph', modules[i].name);
                $ngdengine.renderGraph(modules[i].file, 'documentation/modules/' + modules[i].name, 'f').then(() => {
                    i++;
                    loop();
                }, (errorMessage) => {
                    logger.error(errorMessage);
                });
            }
            else {
                let finalTime = (new Date() - startTime) / 1000;
                logger.info('Documentation generated in ' + program.output + 'in ' + finalTime + ' seconds');
            }
        };
        $ngdengine.renderGraph(program.file, 'documentation/graph', 'p').then(() => {
            loop();
        }, (err) => {
            logger.error('Error during graph generation: ', err);
        });
    };
    Application.run = () => {
        let _file;
        if (program.serve) {
            logger.info('Serving documentation at http://127.0.0.1:8080');
            LiveServer.start({
                root: program.output,
                open: false,
                quiet: true,
                logLevel: 0
            });
        }
        if (program.hideGenerator) {
            $configuration.mainData.hideGenerator = true;
        }
        if (program.file) {
            if (!fs.existsSync(program.file)) {
                logger.fatal('"tsconfig.json" file was not found in the current directory');
                process.exit(1);
            }
            else {
                _file = path.join(path.join(process.cwd(), path.dirname(program.file)), path.basename(program.file));
                logger.info('Using tsconfig', _file);
                files = require(_file).files;
                // use the current directory of tsconfig.json as a working directory
                cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                if (!files) {
                    let exclude = require(_file).exclude || [];
                    var walk = (dir) => {
                        let results = [];
                        let list = fs.readdirSync(dir);
                        list.forEach((file) => {
                            if (exclude.indexOf(file) < 0) {
                                file = path.join(dir, file);
                                let stat = fs.statSync(file);
                                if (stat && stat.isDirectory()) {
                                    results = results.concat(walk(file));
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
                    files = walk(cwd || '.');
                }
                $htmlengine.init().then(() => {
                    processPackageJson();
                });
            }
        }
        else {
            logger.fatal('Entry file was not found');
            outputHelp();
        }
    };
})(Application || (Application = {}));

Application.run();
