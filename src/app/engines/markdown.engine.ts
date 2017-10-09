import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';

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
        };

        let self = this;
        renderer.image = function() {
            // tslint:disable-next-line:no-invalid-this
            self.rendereImage.apply(self, [this, ..._.slice(arguments as any)]);
        };

        marked.setOptions({
            renderer: renderer,
            breaks: false
        });
    }

    private rendereImage(context, href: string, title: string, text: string): string {
        let out = '<img src="' + href + '" alt="' + text + '" class="img-responsive"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += context.options.xhtml ? '/>' : '>';
        return out;
    }

    public get(filepath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during ' + filepath + ' read');
                } else {
                    resolve(marked(data));
                }
            });
        });
    }

    public getTraditionalMarkdown(filepath: string): Promise<any> {
        return new Promise(function (resolve, reject) {
            fs.readFile(path.resolve(process.cwd() + path.sep + filepath + '.md'), 'utf8', (err, data) => {
                if (err) {
                    fs.readFile(path.resolve(process.cwd() + path.sep + filepath), 'utf8', (err1, data1) => {
                        if (err1) {
                            reject('Error during ' + filepath + ' read');
                        } else {
                            resolve(marked(data1));
                        }
                    });
                } else {
                    resolve(marked(data));
                }
            });
        });
    }

    private getReadmeFile(): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(process.cwd() + path.sep + 'README.md'), 'utf8', (err, data) => {
                if (err) {
                    reject('Error during README.md file reading');
                } else {
                    resolve(marked(data));
                }
            });
        });
    }

    private readNeighbourReadmeFile(file: string) {
        let dirname = path.dirname(file);
        let readmeFile = dirname + path.sep + path.basename(file, '.ts') + '.md';
        return fs.readFileSync(readmeFile, 'utf8');
    }

    private hasNeighbourReadmeFile(file: string): boolean {
        let dirname = path.dirname(file);
        let readmeFile = dirname + path.sep + path.basename(file, '.ts') + '.md';
        return fs.existsSync(readmeFile);
    }

    private componentReadmeFile(file: string): string {
        let dirname = path.dirname(file);
        let readmeFile = dirname + path.sep + 'README.md';
        let readmeAlternativeFile = dirname + path.sep + path.basename(file, '.ts') + '.md';
        let finalPath = '';
        if (fs.existsSync(readmeFile)) {
            finalPath = readmeFile;
        } else {
            finalPath = readmeAlternativeFile;
        }
        return finalPath;
    }

    public hasRootMarkdowns(): boolean {
        let readmeFile = process.cwd() + path.sep + 'README.md';
        let readmeFileWithoutExtension = process.cwd() + path.sep + 'README';
        let changelogFile = process.cwd() + path.sep + 'CHANGELOG.md';
        let changelogFileWithoutExtension = process.cwd() + path.sep + 'CHANGELOG';
        let licenseFile = process.cwd() + path.sep + 'LICENSE.md';
        let licenseFileWithoutExtension = process.cwd() + path.sep + 'LICENSE';
        let contributingFile = process.cwd() + path.sep + 'CONTRIBUTING.md';
        let contributingFileWithoutExtension = process.cwd() + path.sep + 'CONTRIBUTING';
        let todoFile = process.cwd() + path.sep + 'TODO.md';
        let todoFileWithoutExtension = process.cwd() + path.sep + 'TODO';

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

    public listRootMarkdowns(): string[] {
        let list = [];
        let readme = 'README';
        let changelog = 'CHANGELOG';
        let contributing = 'CONTRIBUTING';
        let license = 'LICENSE';
        let todo = 'TODO';

        if (fs.existsSync(process.cwd() + path.sep + readme + '.md') || fs.existsSync(process.cwd() + path.sep + readme)) {
            list.push(readme);
            list.push(readme + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + changelog + '.md') || fs.existsSync(process.cwd() + path.sep + changelog)) {
            list.push(changelog);
            list.push(changelog + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + contributing + '.md') || fs.existsSync(process.cwd() + path.sep + contributing)) {
            list.push(contributing);
            list.push(contributing + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + license + '.md') || fs.existsSync(process.cwd() + path.sep + license)) {
            list.push(license);
            list.push(license + '.md');
        }
        if (fs.existsSync(process.cwd() + path.sep + todo + '.md') || fs.existsSync(process.cwd() + path.sep + todo)) {
            list.push(todo);
            list.push(todo + '.md');
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
}
