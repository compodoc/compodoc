import * as fs from 'fs-extra';
import * as path from 'path';

const marked = require('marked');

export class MarkdownEngine {
    constructor() {
        const renderer = new marked.Renderer();
        renderer.code = (code, language) => {
            let highlighted = code;
            if (!language) {
                language = 'none';
            }

            highlighted = this.escape(code);
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

        renderer.image = function (href, title, text) {
            var out = '<img src="' + href + '" alt="' + text + '" class="img-responsive"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += this.options.xhtml ? '/>' : '>';
            return out;
        };

        marked.setOptions({
            renderer: renderer,
            breaks: false
        });
    }
    get(filepath: string) {
        return new Promise(function (resolve, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                } else {
                    resolve(marked(data));
                }
            });
        });
    }
    getTraditionalMarkdown(filepath: string) {
        return new Promise(function (resolve, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath + '.md'), 'utf8', (err, data) => {
                if (err) {
                    fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', (err, data) => {
                        if (err) {
                            reject('Error during ' + filepath + ' read');
                        } else {
                            resolve(marked(data));
                        }
                    });
                } else {
                    resolve(marked(data));
                }
            });
        });
    }
    getReadmeFile() {
        return new Promise(function (resolve, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + 'README.md'), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during README.md file reading');
                } else {
                    resolve(marked(data));
                }
            });
        });
    }
    readNeighbourReadmeFile(file: string) {
        let dirname = path.dirname(file),
            readmeFile = dirname + path.sep + path.basename(file, '.ts') + '.md';
        return fs.readFileSync(readmeFile, 'utf8');
    }
    hasNeighbourReadmeFile(file: string): boolean {
        let dirname = path.dirname(file),
            readmeFile = dirname + path.sep + path.basename(file, '.ts') + '.md';
        return fs.existsSync(readmeFile);
    }
    componentReadmeFile(file: string): string {
        let dirname = path.dirname(file),
            readmeFile = dirname + path.sep + 'README.md',
            readmeAlternativeFile = dirname + path.sep + path.basename(file, '.ts') + '.md',
            finalPath = '';
        if (fs.existsSync(readmeFile)) {
            finalPath = readmeFile;
        } else {
            finalPath = readmeAlternativeFile;
        }
        return finalPath;
    }
    hasRootMarkdowns(): boolean {
        let readmeFile = process.cwd() + path.sep + 'README.md',
            readmeFileWithoutExtension = process.cwd() + path.sep + 'README',
            changelogFile = process.cwd() + path.sep + 'CHANGELOG.md',
            changelogFileWithoutExtension = process.cwd() + path.sep + 'CHANGELOG',
            licenseFile = process.cwd() + path.sep + 'LICENSE.md',
            licenseFileWithoutExtension = process.cwd() + path.sep + 'LICENSE',
            contributingFile = process.cwd() + path.sep + 'CONTRIBUTING.md',
            contributingFileWithoutExtension = process.cwd() + path.sep + 'CONTRIBUTING',
            todoFile = process.cwd() + path.sep + 'TODO.md',
            todoFileWithoutExtension = process.cwd() + path.sep + 'TODO';
        return fs.existsSync(readmeFile) ||
               fs.existsSync(readmeFileWithoutExtension) ||
               fs.existsSync(changelogFile) ||
               fs.existsSync(changelogFileWithoutExtension) ||
               fs.existsSync(licenseFile) ||
               fs.existsSync(licenseFileWithoutExtension) ||
               fs.existsSync(contributingFile) ||
               fs.existsSync(contributingFileWithoutExtension) ||
               fs.existsSync(todoFile) ||
               fs.existsSync(todoFileWithoutExtension);
    }
    listRootMarkdowns(): string[] {
        let list = [],
            readme = 'README',
            changelog = 'CHANGELOG',
            contributing = 'CONTRIBUTING',
            license = 'LICENSE',
            todo = 'TODO';
            if (fs.existsSync(process.cwd() + path.sep + readme + '.md') || fs.existsSync(process.cwd() + path.sep + readme)) {
                list.push(readme);
                list.push(readme+ '.md');
            }
            if (fs.existsSync(process.cwd() + path.sep + changelog + '.md') || fs.existsSync(process.cwd() + path.sep + changelog)) {
                list.push(changelog);
                list.push(changelog+ '.md');
            }
            if (fs.existsSync(process.cwd() + path.sep + contributing + '.md') || fs.existsSync(process.cwd() + path.sep + contributing)) {
                list.push(contributing);
                list.push(contributing+ '.md');
            }
            if (fs.existsSync(process.cwd() + path.sep + license + '.md') || fs.existsSync(process.cwd() + path.sep + license)) {
                list.push(license);
                list.push(license+ '.md');
            }
            if (fs.existsSync(process.cwd() + path.sep + todo + '.md') || fs.existsSync(process.cwd() + path.sep + todo)) {
                list.push(todo);
                list.push(todo+ '.md');
            }
        return list;
    }

    private escape(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/@/g, '&#64;');
    }
};
