import * as fs from 'fs-extra';
import * as path from 'path';

export class FileEngine {
    public get(filepath:  string): Promise<string> {
        return new Promise((resolve, reject) => {
           fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', (err, data) => {
               if (err) {
                   reject('Error during ' + filepath + ' read');
               } else {
                   resolve(data);
               }
           });
        });
    }
}
