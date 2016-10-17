import * as fs from 'fs-extra';
import * as path from 'path';
import * as Q from 'q';
import * as marked from 'marked';

export class MarkdownEngine {
    constructor() {

    }
    render(name:String) {
        let p = Q.defer();

        console.log(marked('I am using __markdown__.'));

        return p.promise;
    }
};
