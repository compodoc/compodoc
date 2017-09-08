import * as Handlebars from 'handlebars';
import { COMPODOC_DEFAULTS } from '../../utils/defaults';
import { $dependenciesEngine } from './dependencies.engine';
import { extractLeadingText, splitLinkText } from '../../utils/link-parser';
import { Configuration } from '../configuration';
import { prefixOfficialDoc } from '../../utils/angular-version';

import { jsdocTagInterface } from '../interfaces/jsdoc-tag.interface';

import { finderInBasicTypes, finderInTypeScriptBasicTypes } from '../../utils/basic-types';
import { kindToType } from '../../utils/kind-to-type';

export let HtmlEngineHelpers = (function() {
    let init = function() {
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
        Handlebars.registerHelper("ifString", function(a, options) {
            if (typeof a === 'string') {
              return options.fn(this);
            }
            return options.inverse(this);
        });
        Handlebars.registerHelper("orLength", function(/* any, any, ..., options */) {
            var len = arguments.length - 1;
          var options = arguments[len];
          for (var i = 0; i < len; i++) {
            if (typeof arguments[i] !== 'undefined') {
                if(arguments[i].length > 0) {
                  return options.fn(this);
                }
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
        Handlebars.registerHelper('clean-paragraph', function(text) {
            text = text.replace(/<p>/gm, '');
            text = text.replace(/<\/p>/gm, '');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('escapeSimpleQuote', function(text) {
            if(!text) return;
            var _text = text.replace(/'/g, "\\'");
            _text = _text.replace(/(\r\n|\n|\r)/gm, '');
            return _text;
        });
        Handlebars.registerHelper('breakComma', function(text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/,/g, ',<br>');
            return new Handlebars.SafeString(text);
        });
        Handlebars.registerHelper('modifKind', function(kind) {
            // https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts#L62
            let _kindText = '';
            switch(kind) {
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
        Handlebars.registerHelper('modifIcon', function(kind) {
            // https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts#L62
            let _kindText = '';
            switch(kind) {
                case 112:
                    _kindText = 'lock'; //private
                    break;
                case 113:
                    _kindText = 'lock'; //protected
                    break;
                case 115:
                    _kindText = 'reset'; //static
                    break;
                case 84:
                    _kindText = 'export'; //export
                    break;
                default:
                    _kindText = 'reset';
                    break;
            }
            return _kindText;
        });
        /**
         * Convert {@link MyClass} to [MyClass](http://localhost:8080/classes/MyClass.html)
         */
         Handlebars.registerHelper('parseDescription', function(description, depth) {
             let tagRegExpLight = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'),
                 tagRegExpFull = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'),
                 tagRegExp,
                 matches,
                 previousString,
                 tagInfo = [];

             tagRegExp = (description.indexOf(']{') !== -1) ? tagRegExpFull : tagRegExpLight;

             var processTheLink = function(string, tagInfo, leadingText) {
                 var leading = extractLeadingText(string, tagInfo.completeTag),
                     split,
                     result,
                     newLink,
                     rootPath,
                     stringtoReplace,
                     anchor = '';

                 split = splitLinkText(tagInfo.text);

                 if (typeof split.linkText !== 'undefined') {
                     result = $dependenciesEngine.findInCompodoc(split.target);
                 } else {
                     let info = tagInfo.text;
                     if (tagInfo.text.indexOf('#') !== -1) {
                         anchor = tagInfo.text.substr(tagInfo.text.indexOf('#'), tagInfo.text.length);
                         info = tagInfo.text.substr(0, tagInfo.text.indexOf('#'));
                     }
                     result = $dependenciesEngine.findInCompodoc(info);
                 }

                 if (result) {

                     if (leadingText) {
                         stringtoReplace = '[' + leadingText + ']' + tagInfo.completeTag;
                     }
                     else if (leading.leadingText !== null) {
                         stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
                     } else if (typeof split.linkText !== 'undefined') {
                         stringtoReplace = tagInfo.completeTag;
                     } else {
                         stringtoReplace = tagInfo.completeTag;
                     }

                     if (result.type === 'class') result.type = 'classe';

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

                     let label = result.name;
                     if (leading.leadingText !== null) {
                         label = leading.leadingText;
                     }
                     if (typeof split.linkText !== 'undefined') {
                         label = split.linkText;
                     }

                     newLink = `<a href="${rootPath}${result.type}s/${result.name}.html${anchor}">${label}</a>`;
                     return string.replace(stringtoReplace, newLink);
                 } else {
                     return string;
                 }
             }

             function replaceMatch(replacer, tag, match, text, linkText?) {
                 var matchedTag = {
                     completeTag: match,
                     tag: tag,
                     text: text
                 };
                 tagInfo.push(matchedTag);

                 if (linkText) {
                     return replacer(description, matchedTag, linkText);
                 } else {
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
         });

        Handlebars.registerHelper('relativeURL', function(currentDepth, context) {
            let result = '';

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

        Handlebars.registerHelper('functionSignature', function(method) {
            let args = [],
                configuration = Configuration.getInstance(),
                angularDocPrefix = prefixOfficialDoc(configuration.mainData.angularVersion);
            if (method.args) {
                args = method.args.map(function(arg) {
                    var _result = $dependenciesEngine.find(arg.type),
                        _optional = '';
                    if (arg.optional) {
                        _optional = '?';
                    }
                    if (_result) {
                        if (_result.source === 'internal') {
                            let path = _result.data.type;
                            if (_result.data.type === 'class') path = 'classe';
                            return `${arg.name}${_optional}: <a href="../${path}s/${_result.data.name}.html">${arg.type}</a>`;
                        } else {
                            let path = `https://${angularDocPrefix}angular.io/docs/ts/latest/api/${_result.data.path}`;
                            return `${arg.name}${_optional}: <a href="${path}" target="_blank">${arg.type}</a>`;
                        }
                    } else if (arg.dotDotDotToken) {
                        return `...${arg.name}: ${arg.type}`;
                    } else if (arg.function) {
                        if (arg.function.length > 0) {
                            let argums = arg.function.map(function(argu) {
                                    var _result = $dependenciesEngine.find(argu.type),
                                        _optional = '';
                                    if (arg.optional) {
                                        _optional = '?';
                                    }
                                    if (_result) {
                                        if (_result.source === 'internal') {
                                            let path = _result.data.type;
                                            if (_result.data.type === 'class') path = 'classe';
                                            return `${argu.name}${_optional}: <a href="../${path}s/${_result.data.name}.html">${argu.type}</a>`;
                                        } else {
                                            let path = `https://${angularDocPrefix}angular.io/docs/ts/latest/api/${_result.data.path}`;
                                            return `${argu.name}${_optional}: <a href="${path}" target="_blank">${argu.type}</a>`;
                                        }
                                    } else if (finderInBasicTypes(argu.type)) {
                                        let path = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${argu.type}`;
                                        return `${argu.name}${_optional}: <a href="${path}" target="_blank">${argu.type}</a>`;
                                    } else if (finderInTypeScriptBasicTypes(argu.type)) {
                                        let path = `https://www.typescriptlang.org/docs/handbook/basic-types.html`;
                                        return `${argu.name}${_optional}: <a href="${path}" target="_blank">${argu.type}</a>`;
                                    } else {
                                        if (argu.name && argu.type) {
                                            return `${argu.name}${_optional}: ${argu.type}`;
                                        } else {
                                            return `${argu.name.text}`;
                                        }
                                    }
                                });
                            return `${arg.name}${_optional}: (${argums}) => void`;
                        } else {
                            return `${arg.name}${_optional}: () => void`;
                        }
                    } else if (finderInBasicTypes(arg.type)) {
                        let path = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${arg.type}`;
                        return `${arg.name}${_optional}: <a href="${path}" target="_blank">${arg.type}</a>`;
                    } else if (finderInTypeScriptBasicTypes(arg.type)) {
                        let path = `https://www.typescriptlang.org/docs/handbook/basic-types.html`;
                        return `${arg.name}${_optional}: <a href="${path}" target="_blank">${arg.type}</a>`;
                    } else {
                        return `${arg.name}${_optional}: ${arg.type}`;
                    }
                }).join(', ');
            }
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
        Handlebars.registerHelper('jsdoc-code-example', function(jsdocTags:jsdocTagInterface[], options) {
            let i = 0,
                len = jsdocTags.length,
                tags = [];

            let cleanTag = function(comment) {
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
            }

            let type = 'html';

            if (options.hash.type) {
                type = options.hash.type;
            }

            function htmlEntities(str) {
                return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            }

            for(i; i<len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'example') {
                        var tag = {} as jsdocTagInterface;
                        if (jsdocTags[i].comment) {
                            if (jsdocTags[i].comment.indexOf('<caption>') !== -1) {
                                tag.comment = jsdocTags[i].comment.replace(/<caption>/g, '<b><i>').replace(/\/caption>/g, '/b></i>');
                            } else {
                                tag.comment = `<pre class="line-numbers"><code class="language-${type}">` + htmlEntities(cleanTag(jsdocTags[i].comment)) + `</code></pre>`;
                            }
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
        Handlebars.registerHelper('jsdoc-example', function(jsdocTags:jsdocTagInterface[], options) {
            let i = 0,
                len = jsdocTags.length,
                tags = [];

            for(i; i<len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'example') {
                        var tag = {} as jsdocTagInterface;
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
        Handlebars.registerHelper('jsdoc-params', function(jsdocTags:jsdocTagInterface[], options) {
            var i = 0,
                len = jsdocTags.length,
                tags = [];
            for(i; i<len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'param') {
                        var tag = {} as jsdocTagInterface;
                        if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.kind) {
                            tag.type = kindToType(jsdocTags[i].typeExpression.type.kind);
                        }
                        if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                            tag.type = jsdocTags[i].typeExpression.type.name.text
                        } else {
                            tag.type = jsdocTags[i].type;
                        }
                        if (jsdocTags[i].comment) {
                            tag.comment = jsdocTags[i].comment;
                        }
                        if (jsdocTags[i].name) {
                            if (jsdocTags[i].name.text) {
                                tag.name = jsdocTags[i].name.text;
                            } else {
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
                this.tags = tags;
                return options.fn(this);
            }
        });
        Handlebars.registerHelper('jsdoc-params-valid', function(jsdocTags:jsdocTagInterface[], options) {
            var i = 0,
                len = jsdocTags.length,
                tags = [],
                valid = false;
            for(i; i<len; i++) {
                if (jsdocTags[i].tagName) {
                    if (jsdocTags[i].tagName.text === 'param') {
                        valid = true;
                    }
                }
            }
            if (valid) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
        Handlebars.registerHelper('jsdoc-default', function(jsdocTags:jsdocTagInterface[], options) {
            if (jsdocTags) {
                var i = 0,
                    len = jsdocTags.length,
                    tag = {} as jsdocTagInterface,
                    defaultValue = false;
                for(i; i<len; i++) {
                    if (jsdocTags[i].tagName) {
                        if (jsdocTags[i].tagName.text === 'default') {
                            defaultValue = true;
                            if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                                tag.type = jsdocTags[i].typeExpression.type.name.text
                            }
                            if (jsdocTags[i].comment) {
                                tag.comment = jsdocTags[i].comment
                            }
                            if (jsdocTags[i].name) {
                                tag.name = jsdocTags[i].name.text;
                            }
                        }
                    }
                }
                if (defaultValue) {
                    this.tag = tag;
                    return options.fn(this);
                }
            }
        });
        Handlebars.registerHelper('linkType', function(name, options) {
            var _result = $dependenciesEngine.find(name),
                configuration = Configuration.getInstance(),
                angularDocPrefix = prefixOfficialDoc(configuration.mainData.angularVersion);
            if (_result) {
                this.type = {
                    raw: name
                }
                if (_result.source === 'internal') {
                    if (_result.data.type === 'class') _result.data.type = 'classe';
                    this.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                    if (_result.data.type === 'miscellaneous') {
                        let mainpage = '';
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
                        this.type.href = '../' + _result.data.type + '/' + mainpage + '.html#' + _result.data.name;
                    }
                    this.type.target = '_self';
                } else {
                    this.type.href = `https://${angularDocPrefix}angular.io/docs/ts/latest/api/${_result.data.path}`;
                    this.type.target = '_blank';
                }

                return options.fn(this);
            } else if (finderInBasicTypes(name)) {
                this.type = {
                    raw: name
                };
                this.type.target = '_blank';
                this.type.href = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${name}`;
                return options.fn(this);
            } else if (finderInTypeScriptBasicTypes(name)) {
                this.type = {
                    raw: name
                };
                this.type.target = '_blank';
                this.type.href = 'https://www.typescriptlang.org/docs/handbook/basic-types.html';
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

        Handlebars.registerHelper('isNotToggle', function(type, options) {
            let configuration = Configuration.getInstance(),
                result = configuration.mainData.toggleMenuItems.indexOf(type);
            if (configuration.mainData.toggleMenuItems.indexOf('all') !== -1) {
                return options.inverse(this);
            } else if (result === -1) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
    }
    return {
        init: init
    }
})()
