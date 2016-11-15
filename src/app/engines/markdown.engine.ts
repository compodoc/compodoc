import * as fs from 'fs-extra';
import * as path from 'path';
import marked, { Renderer } from 'marked';
import highlightjs from 'highlight.js';

export class MarkdownEngine {
    constructor() {
        const renderer = new Renderer();
        renderer.code = (code, language) => {
            const validLang = !!(language && highlightjs.getLanguage(language));
            let highlighted = validLang ? highlightjs.highlight(language, code).value : code;
            highlighted = highlighted.replace(/(\r\n|\n|\r)/gm, '<br>');
            return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
        };

        marked.setOptions({ renderer });
    }
    getReadmeFile() {
        return new Promise(function(resolve, reject) {
            fs.readFile(path.resolve(process.cwd() + '/README.md'), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during README.md file reading');
                } else {
                    resolve(marked(data));
                }
            });
        });
    }
};
