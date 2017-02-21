import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export class FileEngine {
    constructor() {

    }
    get(filepath:string) {
        return new Promise(function(resolve, reject) {
           fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', (err, data) => {
               if (err) {
                   reject('Error during ' + filepath + ' read');
               } else {
                   resolve(data);
               }
           });
        });
    }
};
