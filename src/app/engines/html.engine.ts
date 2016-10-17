import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as Q from 'q';

export class HtmlEngine {
    constructor() {

    }
    render() {
        let p = Q.defer(),
            htmlPage;
        
        fs.readFile(path.resolve(__dirname + '/../src/templates/index.hbs'), 'utf8', (err, data) => {
            if (err) throw err;

            htmlPage = data;
            let template:any = Handlebars.compile(htmlPage);
            let result = template();

            p.resolve(result);
        });

        return p.promise;
    }
};
