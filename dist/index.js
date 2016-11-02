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
    }
    title(...args) {
        this.logger(c.cyan(...args));
    }
    info(...args) {
        this.logger(this.format(LEVEL.INFO, ...args));
    }
    warn(...args) {
        this.logger(this.format(LEVEL.WARN, ...args));
    }
    error(...args) {
        this.logger(this.format(LEVEL.FATAL, ...args));
    }
    fatal(...args) {
        this.error(...args);
    }
    debug(...args) {
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
            'routes'
        ], i = 0, len = partials.length, loop = () => {
            if (i <= len - 1) {
                fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', (err, data) => {
                    if (err)
                        throw err;
                    Handlebars.registerPartial(partials[i], data);
                    i++;
                    loop();
                });
            }
        };
        loop();
    }
    render(mainData, page) {
        var o = mainData;
        Object.assign(o, page);
        return new Promise(function (resolve$$1, reject) {
            fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during index ' + page.name + ' generation');
                }
                else {
                    let template = Handlebars.compile(data), result = template({
                        data: o
                    });
                    resolve$$1(result);
                }
            });
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
}

class NgdEngine {
    constructor() {
    }
    renderGraph(filepath, outputpath, type) {
        return new Promise(function (resolve$$1, reject) {
            Shelljs.exec(path.resolve(__dirname + '/../node_modules/.bin/ngd') + ' -' + type + ' ' + filepath + ' -d ' + outputpath + ' -s -t svg', {
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
                    logger.trace(e, fileName);
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
    getDependencies() {
        let deps = {
            'modules': [],
            'components': [],
            'injectables': [],
            'pipes': [],
            'directives': [],
            'routes': []
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
                        logger.trace(e, file.fileName);
                    }
                }
            }
            return deps;
        });
        return deps;
    }
    getSourceFileDecorators(srcFile, outputSymbols) {
        ts.forEachChild(srcFile, (node) => {
            if (node.decorators) {
                let visitNode = (visitedNode, index) => {
                    let name = this.getSymboleName(node);
                    let deps = {};
                    let metadata = node.decorators.pop();
                    let props = this.findProps(visitedNode);
                    if (this.isModule(metadata)) {
                        deps = {
                            name,
                            file: srcFile.fileName.split('/').splice(-3).join('/'),
                            providers: this.getModuleProviders(props),
                            declarations: this.getModuleDeclations(props),
                            imports: this.getModuleImports(props),
                            exports: this.getModuleExports(props),
                            bootstrap: this.getModuleBootstrap(props),
                            type: 'module'
                        };
                        outputSymbols['modules'].push(deps);
                        outputSymbols['routes'] = [...outputSymbols['routes'], ...this.findRoutes(deps.imports)];
                    }
                    else if (this.isComponent(metadata)) {
                        deps = {
                            name,
                            file: srcFile.fileName.split('/').splice(-3).join('/'),
                            selector: this.getComponentSelector(props),
                            providers: this.getComponentProviders(props),
                            templateUrl: this.getComponentTemplateUrl(props),
                            styleUrls: this.getComponentStyleUrls(props),
                            type: 'component'
                        };
                        outputSymbols['components'].push(deps);
                    }
                    else if (this.isInjectable(metadata)) {
                        deps = {
                            name,
                            file: srcFile.fileName.split('/').splice(-3).join('/'),
                            type: 'injectable'
                        };
                        outputSymbols['injectables'].push(deps);
                    }
                    else if (this.isPipe(metadata)) {
                        deps = {
                            name,
                            file: srcFile.fileName.split('/').splice(-3).join('/'),
                            type: 'pipe'
                        };
                        outputSymbols['pipes'].push(deps);
                    }
                    else if (this.isDirective(metadata)) {
                        deps = {
                            name,
                            file: srcFile.fileName.split('/').splice(-3).join('/'),
                            type: 'directive'
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
    getModuleBootstrap(props) {
        return this.getSymbolDeps(props, 'bootstrap').map((name) => {
            return this.parseDeepIndentifier(name);
        });
    }
    getComponentProviders(props) {
        return this.getSymbolDeps(props, 'providers').map((name) => {
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
    getComponentStyleUrls(props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
    }
    sanitizeUrls(urls) {
        return urls.map(url => url.replace('./', ''));
    }
    getSymbolDeps(props, type) {
        let deps = props.filter((node) => {
            return node.name.text === type;
        });
        let parseSymbolText = (text) => {
            if (text.indexOf('/') !== -1) {
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
var Application;
(function (Application) {
    program
        .version(pkg.version)
        .option('-f, --file [file]', 'A tsconfig.json file')
        .option('-o, --open', 'Open the generated documentation', false)
        .option('-n, --name [name]', 'Title documentation', `Application documentation`)
        .option('-s, --serve', 'Serve generated documentation', false)
        .option('-g, --hideGenerator', 'Do not print the Compodoc link at the bottom of the page.', false)
        .option('-d, --output [folder]', 'Where to store the generated documentation (default: ./documentation)', `./documentation/`)
        .parse(process.argv);
    let outputHelp = () => {
        program.outputHelp();
        process.exit(1);
    };
    $htmlengine.init();
    $configuration.mainData.documentationMainName = program.name; //default commander value
    let processPackageJson = () => {
        logger.info('Searching package.json file');
        $fileengine.get('package.json').then((packageData) => {
            let parsedData = JSON.parse(packageData);
            if (typeof parsedData.name !== 'undefined') {
                $configuration.mainData.documentationMainName = parsedData.name;
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
        prepareDirectives();
        prepareInjectables();
        prepareRoutes();
        processPages();
    };
    let prepareModules = () => {
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
    let prepareComponents = () => {
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
        $configuration.mainData.routes = $dependenciesEngine.getRoutes();
        $configuration.addPage({
            name: 'routes',
            context: 'routes'
        });
        /*
        let i = 0,
            len = $configuration.mainData.injectables.length;

        for(i; i<len; i++) {
            $configuration.addPage({
                path: 'injectables',
                name: $configuration.mainData.injectables[i].name,
                context: 'injectable',
                injectable: $configuration.mainData.injectables[i]
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
                logger.info('Documentation generated in ' + program.output);
            }
        };
        $ngdengine.renderGraph(program.file, 'documentation/graph', 'p').then(() => {
            loop();
        }, () => {
            logger.error('Error during graph generation');
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
                processPackageJson();
            }
        }
        else {
            logger.fatal('Entry file was not found');
            outputHelp();
        }
    };
})(Application || (Application = {}));

Application.run();
