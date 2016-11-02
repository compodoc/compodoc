import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
//import * as helpers from 'handlebars-helpers';

export class HtmlEngine {
    constructor() {
        //TODO use this instead : https://github.com/assemble/handlebars-helpers
        Handlebars.registerHelper( "compare", function(a, operator, b, options) {
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
            'injectable'
        ],
            i = 0,
            len = partials.length,
            loop = () => {
                if( i <= len-1) {

                    fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', (err, data) => {
                        if (err) throw err;
                        Handlebars.registerPartial(partials[i], data);
                        i++;
                        loop();
                    });
                }
            }
        loop();
    }
    render(mainData:any, page:any) {
        var o = mainData;
        Object.assign(o, page);
        return new Promise(function(resolve, reject) {
           fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', (err, data) => {
               if (err) {
                   reject('Error during index ' + page.name + ' generation');
               } else {
                   let template:any = Handlebars.compile(data),
                       result = template({
                           data: o
                       });
                   resolve(result);
               }
           });
        });
    }
};
