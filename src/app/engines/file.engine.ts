import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as Q from 'q';

export class FileEngine {
    constructor() {

    }
    get(filepath:String) {
        let p = Q.defer();

        fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', (err, data) => {
            if (err) {
                p.reject('Error during ' + filepath + ' read');
            } else {
                p.resolve(data);
            }
        });

        return p.promise;
    }
};
