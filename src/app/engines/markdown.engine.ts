import * as fs from 'fs-extra';
import * as path from 'path';
import * as Q from 'q';
import marked from 'marked';

export class MarkdownEngine {
    constructor() {

    }
    getReadmeFile() {
        let p = Q.defer();

        fs.readFile(path.resolve(process.cwd() + '/README.md'), 'utf8', (err, data) => {
            if (err) {
                p.reject('Error during README reading');
            } else {
                p.resolve(marked(data));
            }
        });

        return p.promise;
    }
};
