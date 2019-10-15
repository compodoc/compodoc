import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as path from 'path';

import FileEngine from './file.engine';

const decache = require('decache');

export interface markdownReadedDatas {
    markdown: string;
    rawData: string;
}

export class MarkdownEngine {
    /**
     * List of markdown files without .md extension
     */
    private readonly markdownFiles = ['README', 'CHANGELOG', 'LICENSE', 'CONTRIBUTING', 'TODO'];

    private markedInstance;

    private static instance: MarkdownEngine;
    private constructor() {
        decache('marked');
        this.markedInstance = require('marked');

        const renderer = new this.markedInstance.Renderer();
        renderer.code = (code, language) => {
            let highlighted = code;
            if (!language) {
                language = 'none';
            }

            highlighted = this.escape(code);
            return `<div><pre class="line-numbers"><code class="language-${language}">${highlighted}</code></pre></div>`;
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

        renderer.image = function(href: string, title: string, text: string) {
            let out = '<img src="' + href + '" alt="' + text + '" class="img-responsive"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += '>';
            return out;
        };

        this.markedInstance.setOptions({
            renderer: renderer,
            gfm: true,
            breaks: false
        });
    }
    public static getInstance() {
        if (!MarkdownEngine.instance) {
            MarkdownEngine.instance = new MarkdownEngine();
        }
        return MarkdownEngine.instance;
    }

    public getTraditionalMarkdown(filepath: string): Promise<markdownReadedDatas> {
        return FileEngine.get(process.cwd() + path.sep + filepath + '.md')
            .catch(err => FileEngine.get(process.cwd() + path.sep + filepath).then())
            .then(data => {
                const returnedData: markdownReadedDatas = {
                    markdown: this.markedInstance(data),
                    rawData: data
                };
                return returnedData;
            });
    }

    public getTraditionalMarkdownSync(filepath: string): string {
        return this.markedInstance(FileEngine.getSync(process.cwd() + path.sep + filepath));
    }

    private getReadmeFile(): Promise<string> {
        return FileEngine.get(process.cwd() + path.sep + 'README.md').then(data =>
            this.markedInstance(data)
        );
    }

    public readNeighbourReadmeFile(file: string): string {
        let dirname = path.dirname(file);
        let readmeFile = dirname + path.sep + path.basename(file, '.ts') + '.md';
        return fs.readFileSync(readmeFile, 'utf8');
    }

    public hasNeighbourReadmeFile(file: string): boolean {
        let dirname = path.dirname(file);
        let readmeFile = dirname + path.sep + path.basename(file, '.ts') + '.md';
        return FileEngine.existsSync(readmeFile);
    }

    private componentReadmeFile(file: string): string {
        let dirname = path.dirname(file);
        let readmeFile = dirname + path.sep + 'README.md';
        let readmeAlternativeFile = dirname + path.sep + path.basename(file, '.ts') + '.md';
        let finalPath = '';
        if (FileEngine.existsSync(readmeFile)) {
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
            FileEngine.existsSync(process.cwd() + path.sep + x)
        );
    }

    public listRootMarkdowns(): string[] {
        let foundFiles = this.markdownFiles.filter(
            x =>
                FileEngine.existsSync(process.cwd() + path.sep + x + '.md') ||
                FileEngine.existsSync(process.cwd() + path.sep + x)
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

export default MarkdownEngine.getInstance();
