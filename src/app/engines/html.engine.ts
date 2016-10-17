import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as Q from 'q';

export class HtmlEngine {
    constructor() {
        fs.readFile(path.resolve(__dirname + '/../src/templates/menu.hbs'), 'utf8', (err, data) => {
            if (err) throw err;
            Handlebars.registerPartial('menu', data);
        });
    }
    render(name:String) {
        let p = Q.defer();

        fs.readFile(path.resolve(__dirname + '/../src/templates/index.hbs'), 'utf8', (err, data) => {
            if (err) throw err;

            let template:any = Handlebars.compile(data);
            console.log(name);
            let result = template({
                documentationMainName: name,
                parsingData: {
                    components: 5
                }
            });

            p.resolve(result);
        });

        return p.promise;
    }
};
