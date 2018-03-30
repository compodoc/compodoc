import { ts } from 'ts-simple-ast';

export class TsPrinterUtil {
    private printer: ts.Printer;

    constructor() {
        this.printer = ts.createPrinter({
            newLine: ts.NewLineKind.LineFeed
        });
    }

    public print(node: ts.Node): string {
        return this.printer.printNode(
            ts.EmitHint.Unspecified,
            node,
            ts.createSourceFile('', '', ts.ScriptTarget.Latest)
        );
    }
}
