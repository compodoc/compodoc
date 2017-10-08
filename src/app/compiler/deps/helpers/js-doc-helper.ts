export class JsDocHelper {

    public hasJSDocInternalTag(filename: string, sourceFile, node): boolean {
        let result = false;

        if (typeof sourceFile.statements !== 'undefined') {
            let i = 0;
            let len = sourceFile.statements.length;
            for (i; i < len; i++) {
                let statement = sourceFile.statements[i];
                if (statement.pos === node.pos && statement.end === node.end) {
                    if (node.jsDoc && node.jsDoc.length > 0) {
                        let j = 0;
                        let leng = node.jsDoc.length;
                        for (j; j < leng; j++) {
                            if (node.jsDoc[j].tags && node.jsDoc[j].tags.length > 0) {
                                let k = 0;
                                let lengt = node.jsDoc[j].tags.length;
                                for (k; k < lengt; k++) {
                                    if (node.jsDoc[j].tags[k].tagName && node.jsDoc[j].tags[k].tagName.text === 'internal') {
                                        result = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return result;
    }
}