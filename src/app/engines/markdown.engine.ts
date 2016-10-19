import * as fs from 'fs-extra';
import * as path from 'path';
import marked from 'marked';

export class MarkdownEngine {
    constructor() {

    }
    getReadmeFile() {
        return new Promise(function(resolve, reject) {
           fs.readFile(path.resolve(process.cwd() + '/README.md'), 'utf8', (err, data) => {
               if (err) {
                   reject('Error during README reading');
               } else {
                   resolve(marked(data));
               }
           });
        });
    }
};
