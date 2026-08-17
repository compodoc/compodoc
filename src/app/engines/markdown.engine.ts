import * as fs from 'fs-extra';
import * as _ from '../../utils/collection.util';
import * as path from 'path';

import FileEngine from './file.engine';
import I18nEngine from './i18n.engine';
import { markedAcl } from '../../utils/marked.acl';
import { clearModuleCache } from '../../utils/module-cache.util';

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

    /**
     * Tracks heading slugs seen in the markdown document currently being rendered,
     * so duplicate headings get distinct anchor ids (reset per renderMarkdown call).
     */
    private headingSlugs: Map<string, number> = new Map();

    private static instance: MarkdownEngine;
    private constructor() {
        clearModuleCache('marked');
        this.markedInstance = markedAcl;

        const self = this;
        this.markedInstance.use({
            gfm: true,
            breaks: false,
            renderer: {
                heading(token) {
                    const text = this.parser.parseInline(token.tokens);
                    const id = self.uniqueSlug(self.slugify(token.text));
                    return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
                },
                code(token) {
                    const language = token.lang || 'none';
                    const highlighted = self.escape(token.text);
                    return `<b>${I18nEngine.translate(
                        'example'
                    )} :</b><div><pre class="line-numbers"><code class="language-${language}">${highlighted}</code></pre></div>`;
                },
                table(token) {
                    let header = '';
                    for (const cell of token.header) {
                        const align = cell.align ? ` style="text-align: ${cell.align}"` : '';
                        header += `<th${align}>${this.parser.parseInline(cell.tokens)}</th>`;
                    }
                    header = `<tr>${header}</tr>\n`;

                    let body = '';
                    for (const row of token.rows) {
                        let cells = '';
                        for (const cell of row) {
                            const align = cell.align ? ` style="text-align: ${cell.align}"` : '';
                            cells += `<td${align}>${this.parser.parseInline(cell.tokens)}</td>`;
                        }
                        body += `<tr>${cells}</tr>\n`;
                    }

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
                },
                image(token) {
                    let out =
                        '<img src="' +
                        token.href +
                        '" alt="' +
                        token.text +
                        '" class="img-responsive"';
                    if (token.title) {
                        out += ' title="' + token.title + '"';
                    }
                    out += '>';
                    return out;
                }
            }
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
            .catch(err => FileEngine.get(process.cwd() + path.sep + filepath))
            .then(data => {
                const returnedData: markdownReadedDatas = {
                    markdown: this.renderMarkdown(data),
                    rawData: data
                };
                return returnedData;
            });
    }

    public getTraditionalMarkdownSync(filepath: string): string {
        return this.renderMarkdown(FileEngine.getSync(process.cwd() + path.sep + filepath));
    }

    private getReadmeFile(): Promise<string> {
        return FileEngine.get(process.cwd() + path.sep + 'README.md').then(data =>
            this.renderMarkdown(data)
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

    private renderMarkdown(markdown: string): string {
        this.headingSlugs = new Map();
        return this.markedInstance(this.normalizeBitbucketCommitLinks(markdown));
    }

    /**
     * Converts heading text into a URL-friendly anchor id (GitHub-style slug).
     */
    private slugify(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/<[^>]*>/g, '')
            .replace(/[`*_~[\]()]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }

    /**
     * Ensures heading ids are unique within a single rendered document by
     * suffixing repeats with -1, -2, etc, matching GitHub's anchor behavior.
     */
    private uniqueSlug(slug: string): string {
        if (!this.headingSlugs.has(slug)) {
            this.headingSlugs.set(slug, 0);
            return slug;
        }
        const count = this.headingSlugs.get(slug) + 1;
        this.headingSlugs.set(slug, count);
        return `${slug}-${count}`;
    }

    private normalizeBitbucketCommitLinks(markdown: string): string {
        return markdown.replace(
            /(https?:\/\/bitbucket\.org\/[^\s)\]>]+\/)commit\/([^\s)\]>]+)/g,
            '$1commits/$2'
        );
    }

    /**
     * ['README'] => ['README', 'README.md']
     */
    private addEndings(files: Array<string>): Array<string> {
        return _.flatMap(files, x => [x, x + '.md']);
    }
}

export default MarkdownEngine.getInstance();
