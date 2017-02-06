import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
//import * as helpers from 'handlebars-helpers';
import { $dependenciesEngine } from './dependencies.engine';
import { extractLeadingText, splitLinkText } from '../../utils/link-parser';
import { COMPODOC_DEFAULTS } from '../../utils/defaults';

export class HtmlEngine {
    cache: Object = {};
    constructor() {
        //TODO use this instead : https://github.com/assemble/handlebars-helpers
        Handlebars.registerHelper( "compare", function(a, operator, b, options) {
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
        Handlebars.registerHelper("or", function(/* any, any, ..., options */) {
            var len = arguments.length - 1;
          var options = arguments[len];

          for (var i = 0; i < len; i++) {
            if (arguments[i]) {
              return options.fn(this);
            }
          }

          return options.inverse(this);
        });
        Handlebars.registerHelper("filterAngular2Modules", function(text, options) {
            const NG2_MODULES:string[] = [
                'BrowserModule',
                'FormsModule',
                'HttpModule',
                'RouterModule'
            ],
                len = NG2_MODULES.length;
            let i = 0,
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
        Handlebars.registerHelper("debug", function(optionalValue) {
          console.log("Current Context");
          console.log("====================");
          console.log(this);

          if (optionalValue) {
            console.log("OptionalValue");
            console.log("====================");
            console.log(optionalValue);
          }
        });
        Handlebars.registerHelper('breaklines', function(text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            text = text.replace(/ /gm, '&nbsp;');
            text = text.replace(/	/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('breakComma', function(text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/,/g, ',<br>');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('modifKind', function(kind) {
            let _kindText = '';
            switch(kind) {
                case 111:
                    _kindText = 'Private';
                    break;
                case 112:
                    _kindText = 'Protected';
                    break;
                case 113:
                    _kindText = 'Public';
                    break;
                case 114:
                    _kindText = 'Static';
                    break;
            }
            return new Handlebars.SafeString(_kindText);
        });
        Handlebars.registerHelper('modifIcon', function(kind) {
            let _kindText = '';
            switch(kind) {
                case 111:
                    _kindText = 'lock';
                    break;
                case 112:
                    _kindText = 'lock';
                    break;
                case 113:
                    _kindText = 'circle';
                    break;
                case 114:
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
        Handlebars.registerHelper('parseDescription', function(description, depth) {
            let tagRegExp = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'),
                matches,
                previousString,
                tagInfo = []

            var processTheLink = function(string, tagInfo) {
                var leading = extractLeadingText(string, tagInfo.completeTag),
                    split,
                    result,
                    newLink,
                    rootPath,
                    stringtoReplace;

                split = splitLinkText(tagInfo.text);

                if (typeof split.linkText !== 'undefined') {
                    result = $dependenciesEngine.findInCompodoc(split.target);
                } else {
                    result = $dependenciesEngine.findInCompodoc(tagInfo.text);
                }

                if (result) {
                    if (leading.leadingText !== null) {
                        stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
                    } else if (typeof split.linkText !== 'undefined') {
                        stringtoReplace = tagInfo.completeTag;
                    } else {
                        stringtoReplace = tagInfo.completeTag;
                    }

                    if (result.type === 'class') result.type = 'classe';

                    rootPath = '../';
                    if (depth && depth === 1) rootPath = './';

                    newLink = `<a href="${rootPath}${result.type}s/${result.name}.html" >${result.name}</a>`;
                    return string.replace(stringtoReplace, newLink);
                } else {
                    return string;
                }
            }

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

        Handlebars.registerHelper('relativeURL', function(depth, currentPageType, targetPageType) {
            //console.log('relativeURL: ', depth, currentPageType, targetPageType);
            // if depth 2 & type == internal, set on same level, otherwise go up
            let result = '';
            if (currentPageType === COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL && targetPageType === COMPODOC_DEFAULTS.PAGE_TYPES.ROOT) {
                result = '../';
            } else if (currentPageType === COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL && targetPageType === COMPODOC_DEFAULTS.PAGE_TYPES.INTERNAL) {
                result = '../';
            } else if (currentPageType === COMPODOC_DEFAULTS.PAGE_TYPES.ROOT && targetPageType === COMPODOC_DEFAULTS.PAGE_TYPES.ROOT) {
                result = './';
            }
            return result;
        });

        Handlebars.registerHelper('functionSignature', function(method) {
            const args = method.args.map(function(arg) {
                var _result = $dependenciesEngine.find(arg.type);
                if (_result) {
                    if (_result.source === 'internal') {
                        let path = _result.data.type;
                        if (_result.data.type === 'class') path = 'classe';
                        return `${arg.name}: <a href="../${path}s/${_result.data.name}.html" >${arg.type}</a>`;
                    } else {
                        let path = 'https://angular.io/docs/ts/latest/api/' + _result.data.path;
                        return `${arg.name}: <a href="${path}" target="_blank" >${arg.type}</a>`;
                    }
                } else {
                    return `${arg.name}: ${arg.type}`;
                }
            }).join(', ');
            if (method.name) {
                return `${method.name}(${args})`;
            } else {
                return `(${args})`;
            }
        });
        Handlebars.registerHelper('jsdoc-returns-comment', function(jsdocTags, options) {
            var i = 0,
                len = jsdocTags.length,
                result;
            for(i; i<len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'returns') {
                        result = jsdocTags[i].comment;
                        break;
                    }
                }
            }
            return result;
        });
        Handlebars.registerHelper('jsdoc-example', function(jsdocTags, options) {
            var i = 0,
                len = jsdocTags.length,
                tags = [];
            for(i; i<len; i++) {
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
            if (tags.length >= 1) {
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-params', function(jsdocTags, options) {
            var i = 0,
                len = jsdocTags.length,
                tags = [];
            for(i; i<len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'param') {
                        var tag = {};
                        if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                            tag.type = jsdocTags[i].typeExpression.type.name.text
                        }
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment
                        }
                        if (jsdocTags[i].parameterName) {
                            tag.name = jsdocTags[i].parameterName.text
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
        Handlebars.registerHelper('linkType', function(name, options) {
            var _result = $dependenciesEngine.find(name);
            if (_result) {
                this.type = {
                    raw: name
                }
                if (_result.source === 'internal') {
                    if (_result.data.type === 'class') _result.data.type = 'classe';
                    this.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
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
        Handlebars.registerHelper('indexableSignature', function(method) {
            const args = method.args.map(arg => `${arg.name}: ${arg.type}`).join(', ');
            if (method.name) {
                return `${method.name}[${args}]`;
            } else {
                return `[${args}]`;
            }
        });
        Handlebars.registerHelper('object', function(text) {
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
            'block-index',
            'block-constructor',
            'coverage-report',
            'miscellaneous'
        ],
            i = 0,
            len = partials.length,
            loop = (resolve, reject) => {
                if( i <= len-1) {
                    fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', (err, data) => {
                        if (err) { reject(); }
                        Handlebars.registerPartial(partials[i], data);
                        i++;
                        loop(resolve, reject);
                    });
                } else {
                    resolve();
                }
            }


        return new Promise(function(resolve, reject) {
            loop(resolve, reject);
        });
    }
    render(mainData:any, page:any) {
        var o = mainData,
            that = this;
        Object.assign(o, page);
        return new Promise(function(resolve, reject) {
            if(that.cache['page']) {
                let template:any = Handlebars.compile(that.cache['page']),
                    result = template({
                        data: o
                    });
                resolve(result);
            } else {
                fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', (err, data) => {
                   if (err) {
                       reject('Error during index ' + page.name + ' generation');
                   } else {
                       that.cache['page'] = data;
                       let template:any = Handlebars.compile(data),
                           result = template({
                               data: o
                           });
                       resolve(result);
                   }
               });
            }

        });
    }
};
