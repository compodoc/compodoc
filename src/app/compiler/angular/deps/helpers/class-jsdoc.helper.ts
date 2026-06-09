import type { ts } from 'ts-morph';

import type { JsdocParserUtil } from '../../../../../utils/jsdoc-parser.util';
import { markedAcl } from '../../../../../utils/marked.acl';
import { markedtags } from '../../../../../utils/utils';

export class ClassJsDocHelper {
    constructor(private readonly jsdocParserUtil: JsdocParserUtil) {}

    public checkForDeprecation(tags: any[], result: { [key in string | number]: any }): void {
        for (const tag of tags) {
            if (tag.tagName?.text?.indexOf('deprecated') > -1) {
                result.deprecated = true;
                result.deprecationMessage = this.jsdocParserUtil.parseJSDocNode(tag);
            }
        }
    }

    public processTags(jsdoctags: any, result: any, includeTagsArray = true): void {
        if (!jsdoctags || jsdoctags.length < 1) {
            return;
        }

        const jsdoc = jsdoctags[0];
        if (!jsdoc?.tags) {
            return;
        }

        const tags = jsdoc.tags as unknown as any[];
        this.checkForDeprecation(tags, result);

        if (includeTagsArray) {
            result.jsdoctags = markedtags(tags);
        }
    }

    public extractComment(node: any, sourceFile: ts.SourceFile, result: any): void {
        const comment = this.jsdocParserUtil.getMainCommentOfNode(node, sourceFile);

        if (typeof comment === 'string') {
            const cleanedDescription = this.jsdocParserUtil.parseComment(comment);
            result.rawdescription = cleanedDescription;
            result.description = markedAcl(cleanedDescription);
        }
    }

    public hasTag(member: ts.Node, tagName: string): boolean {
        const jsdocs = this.jsdocParserUtil.getJSDocs(member) as any[] | undefined;
        if (!jsdocs || jsdocs.length === 0) {
            return false;
        }

        for (const doc of jsdocs) {
            if (doc?.tagName?.text === tagName) {
                return true;
            }

            if (doc?.tags) {
                for (const tag of doc.tags) {
                    if (tag?.tagName?.text === tagName) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public createDocumentationFields(): {
        deprecated: boolean;
        deprecationMessage: string;
    } {
        return {
            deprecated: false,
            deprecationMessage: ''
        };
    }
}
