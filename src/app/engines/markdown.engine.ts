import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';
import { FileEngine } from './file.engine';

const marked = require('marked');

export class MarkdownEngine {
    /**
     * List of markdown files without .md extension
     */
    private readonly markdownFiles = [
        'README',
        'CHANGELOG',
        'LICENSE',
        'CONTRIBUTING',
        'TODO'
    ];

    constructor(private fileEngine = new FileEngine()) {
        const renderer = new marked.Renderer();
        renderer.code = (code, language) => {
            let highlighted = code;
            if (!language) {
                language = 'none';
            }

            highlighted = this.escape(code);
            return `<pre class="line-numbers"><code class="language-${
                language
            }">${highlighted}</code></pre>`;
        };

        renderer.table = (header, body) => {
            return (
                '<table class="table table-bordered compodoc-table">\n' +
                '<thead>\n' +
                header +
                '</thead>\n' +
                '<tbody>\n' +
                body +
                '</tbody>\n' +
                '</table>\n'
            );
        };

        let self = this;
        renderer.image = function(href: string, title: string, text: string) {
            let out =
                '<img src="' +
                href +
                '" alt="' +
                text +
                '" class="img-responsive"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += '>';
            return out;
        };

        marked.setOptions({
            renderer: renderer,
            breaks: false
        });
    }

    public getTraditionalMarkdown(filepath: string): Promise<string> {
        return this.fileEngine
            .get(process.cwd() + path.sep + filepath + '.md')
            .catch(err =>
                this.fileEngine.get(process.cwd() + path.sep + filepath).then()
            )
            .then(data => marked(data));
    }

    private getReadmeFile(): Promise<string> {
        return this.fileEngine
            .get(process.cwd() + path.sep + 'README.md')
            .then(data => marked(data));
    }

    public readNeighbourReadmeFile(file: string): string {
        let dirname = path.dirname(file);
        let readmeFile =
            dirname + path.sep + path.basename(file, '.ts') + '.md';
        return fs.readFileSync(readmeFile, 'utf8');
    }

    public hasNeighbourReadmeFile(file: string): boolean {
        let dirname = path.dirname(file);
        let readmeFile =
            dirname + path.sep + path.basename(file, '.ts') + '.md';
        return this.fileEngine.existsSync(readmeFile);
    }

    private componentReadmeFile(file: string): string {
        let dirname = path.dirname(file);
        let readmeFile = dirname + path.sep + 'README.md';
        let readmeAlternativeFile =
            dirname + path.sep + path.basename(file, '.ts') + '.md';
        let finalPath = '';
        if (this.fileEngine.existsSync(readmeFile)) {
            finalPath = readmeFile;
        } else {
            finalPath = readmeAlternativeFile;
        }
        return finalPath;
    }

    /**
     * Checks if any of the markdown files is exists with or without endings
     */
    public hasRootMarkdowns(): boolean {
        return this.addEndings(this.markdownFiles).some(x =>
            this.fileEngine.existsSync(process.cwd() + path.sep + x)
        );
    }

    public listRootMarkdowns(): string[] {
        let foundFiles = this.markdownFiles.filter(
            x =>
                this.fileEngine.existsSync(
                    process.cwd() + path.sep + x + '.md'
                ) || this.fileEngine.existsSync(process.cwd() + path.sep + x)
        );

        return this.addEndings(foundFiles);
    }

    private escape(html: string): string {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/@/g, '&#64;');
    }

    /**
     * ['README'] => ['README', 'README.md']
     */
    private addEndings(files: Array<string>): Array<string> {
        return _.flatMap(files, x => [x, x + '.md']);
    }
}
