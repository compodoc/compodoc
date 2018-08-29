import { ts } from 'ts-simple-ast';

export class JsDocHelper {
    public hasJSDocInternalTag(
        filename: string,
        sourceFile: ts.SourceFile,
        node: ts.Node
    ): boolean {
        if (typeof sourceFile.statements !== 'undefined') {
            return this.checkStatements(sourceFile.statements, node);
        }

        return false;
    }

    private checkStatements(statements: ReadonlyArray<ts.Statement>, node: ts.Node): boolean {
        return statements.some(x => this.checkStatement(x, node));
    }

    private checkStatement(statement: ts.Statement, node: ts.Node): boolean {
        if (statement.pos === node.pos && statement.end === node.end) {
            if (node.jsDoc && node.jsDoc.length > 0) {
                return this.checkJsDocs(node.jsDoc);
            }
        }

        return false;
    }

    private checkJsDocs(jsDocs: ReadonlyArray<ts.JSDoc>): boolean {
        return jsDocs
            .filter(x => x.tags && x.tags.length > 0)
            .some(x => this.checkJsDocTags(x.tags));
    }

    private checkJsDocTags(tags: ReadonlyArray<ts.JSDocTag>): boolean {
        return tags.some(x => x.tagName && x.tagName.text === 'internal');
    }
}
