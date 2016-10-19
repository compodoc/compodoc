import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export class HtmlEngine {
    constructor() {
        fs.readFile(path.resolve(__dirname + '/../src/templates/menu.hbs'), 'utf8', (err, data) => {
            if (err) throw err;
            Handlebars.registerPartial('menu', data);
        });
    }
    render(options:any) {
        return new Promise(function(resolve, reject) {
           fs.readFile(path.resolve(__dirname + '/../src/templates/index.hbs'), 'utf8', (err, data) => {
               if (err) {
                   reject('Error during index page generation');
               } else {
                   let template:any = Handlebars.compile(data),
                       result = template(options);
                   resolve(result);
               }
           });
        });
    }
};
