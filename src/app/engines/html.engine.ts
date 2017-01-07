import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
//import * as helpers from 'handlebars-helpers';

export class HtmlEngine {
    cache: object = {};
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
        Handlebars.registerHelper('functionSignature', function(method) {
            const args = method.args.map(arg => `${arg.name}: ${arg.type}`).join(', ');
            if (method.name) {
                return `${method.name}(${args})`;
            } else {
                return `(${args})`;
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
            'search-input'
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
