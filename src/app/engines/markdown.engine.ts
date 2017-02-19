import * as fs from 'fs-extra';
import * as path from 'path';
import marked, { Renderer } from 'marked';
import highlightjs from 'highlight.js';

export class MarkdownEngine {
    constructor() {
        const renderer = new Renderer();
        renderer.code = (code, language) => {
            let highlighted = code;
            if (!language) {
                language = 'none';
            }
            return `<pre class="line-numbers"><code class="language-${language}">${highlighted}</code></pre>`;
        };

        renderer.table = (header, body) => {
            return '<table class="table table-bordered compodoc-table">\n'
                + '<thead>\n'
                + header
                + '</thead>\n'
                + '<tbody>\n'
                + body
                + '</tbody>\n'
                + '</table>\n';
        }

        renderer.image = function(href, title, text) {
          var out = '<img src="' + href + '" alt="' + text + '" class="img-responsive"';
          if (title) {
            out += ' title="' + title + '"';
          }
          out += this.options.xhtml ? '/>' : '>';
          return out;
        };

        marked.setOptions({
            renderer: renderer,
            breaks: true
        });
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
