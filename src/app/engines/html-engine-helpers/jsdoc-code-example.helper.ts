import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import { JsdocTagInterface } from '../../interfaces/jsdoc-tag.interface';

interface CodeBlock {
    language: string;
    code: string;
}

export class JsdocCodeExampleHelper implements IHtmlEngineHelper {
    private cleanTag(comment: string): string {
        if (comment.charAt(0) === '*') {
            comment = comment.substring(1, comment.length);
        }
        if (comment.charAt(0) === ' ') {
            comment = comment.substring(1, comment.length);
        }
        if (comment.indexOf('<p>') === 0) {
            comment = comment.substring(3, comment.length);
        }
        if (comment.substr(-1) === '\n') {
            comment = comment.substring(0, comment.length - 1);
        }
        if (comment.substr(-4) === '</p>') {
            comment = comment.substring(0, comment.length - 4);
        }
        return comment;
    }

    private getHtmlEntities(str): string {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    private parseCodeFences(comment: string): CodeBlock[] {
        const codeFenceRegex = /(?:^|\n)\s*```([^\s`]+)?\s*\n([\s\S]*?)\n\s*```/g;
        const blocks: CodeBlock[] = [];
        let match;
        let hasCodeFences = false;

        // Find all code fences
        while ((match = codeFenceRegex.exec(comment)) !== null) {
            hasCodeFences = true;
            let language = (match[1] || 'html').toLowerCase();
            if (language === 'js') language = 'javascript';
            if (language === 'ts') language = 'typescript';
            let code = match[2];
            // Convert placeholder back to empty lines first
            code = code.replace(/___COMPODOC_EMPTY_LINE___/g, '\n');
            // Trim leading and trailing whitespace, but preserve internal empty lines
            code = code.trim();
            code = code.replace(/```[\s\S]*?```/g, '');
            if (code.length === 0) {
                continue;
            }
            blocks.push({
                language: language,
                code: code
            });
        }

        if (!hasCodeFences) {
            const trimmedComment = comment.trim();
            if (trimmedComment.length > 0) {
                blocks.push({
                    language: 'html',
                    code: trimmedComment
                });
            }
        }

        return blocks;
    }

    public helperFunc(context: any, jsdocTags: JsdocTagInterface[], options: IHandlebarsOptions) {
        let i = 0;
        const len = jsdocTags.length;
        const tags = [];

        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (jsdocTags[i].tagName.text === 'example') {
                    if (jsdocTags[i].comment) {
                        // DEBUG: Log the comment for each @example tag
                        // eslint-disable-next-line no-console
                        // console.log('helperFunc @example comment:', JSON.stringify(jsdocTags[i].comment));
                        let comment = jsdocTags[i].comment;
                        let caption = '';
                        // Extract and render caption if present
                        const captionMatch = comment.match(/<caption>([\s\S]*?)<\/caption>/);
                        if (captionMatch) {
                            caption = captionMatch[1];
                            // Remove caption from comment
                            comment = comment.replace(/<caption>[\s\S]*?<\/caption>/, '').trim();
                            // Render caption as a separate tag
                            const captionTag = {} as JsdocTagInterface;
                            captionTag.comment = `<b><i>${caption}</i></b>`;
                            tags.push(captionTag);
                        }
                        // Parse code fences for the rest of the comment
                        const codeBlocks = this.parseCodeFences(comment);
                        for (const block of codeBlocks) {
                            const tag = {} as JsdocTagInterface;
                            tag.comment =
                                `<pre class="line-numbers"><code class="language-${block.language}">` +
                                this.getHtmlEntities(block.code) +
                                `</code></pre>`;
                            tags.push(tag);
                        }
                    }
                }
            }
        }

        if (tags.length > 0) {
            context.tags = tags;
            return options.fn(context);
        }
    }
}
