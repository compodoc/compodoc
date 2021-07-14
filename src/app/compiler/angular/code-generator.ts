import { ts, SyntaxKind } from 'ts-morph';

export class CodeGenerator {
    public generate(node: ts.Node): string {
        return this.visitAndRecognize(node, []).join('');
    }

    private visitAndRecognize(node: ts.Node, code: Array<string>, depth = 0): Array<string> {
        this.recognize(node, code);
        node.getChildren().forEach(c => this.visitAndRecognize(c, code, depth + 1));
        return code;
    }

    private recognize(node: ts.Node, code: Array<string>) {
        const conversion = TsKindConversion.find(x => x.kinds.some(z => z === node.kind));

        if (conversion) {
            const result = conversion.output(node);
            result.forEach(text => this.gen(text, code));
        }
    }

    private gen(token: string | undefined, code: Array<string>): void {
        if (!token) {
            return;
        }

        if (token === '\n') {
            code.push('');
        } else {
            code.push(token);
        }
    }
}

class TsKindsToText {
    constructor(public output: (node: ts.Node) => Array<string>, public kinds: Array<SyntaxKind>) {}
}

const TsKindConversion: Array<TsKindsToText> = [
    new TsKindsToText(
        node => ['"', node.text, '"'],
        [SyntaxKind.FirstLiteralToken, SyntaxKind.Identifier]
    ),
    new TsKindsToText(node => ['"', node.text, '"'], [SyntaxKind.StringLiteral]),
    new TsKindsToText(node => [], [SyntaxKind.ArrayLiteralExpression]),
    new TsKindsToText(node => ['import', ' '], [SyntaxKind.ImportKeyword]),
    new TsKindsToText(node => ['from', ' '], [SyntaxKind.FromKeyword]),
    new TsKindsToText(node => ['\n', 'export', ' '], [SyntaxKind.ExportKeyword]),
    new TsKindsToText(node => ['class', ' '], [SyntaxKind.ClassKeyword]),
    new TsKindsToText(node => ['this'], [SyntaxKind.ThisKeyword]),
    new TsKindsToText(node => ['constructor'], [SyntaxKind.ConstructorKeyword]),
    new TsKindsToText(node => ['false'], [SyntaxKind.FalseKeyword]),
    new TsKindsToText(node => ['true'], [SyntaxKind.TrueKeyword]),
    new TsKindsToText(node => ['null'], [SyntaxKind.NullKeyword]),
    new TsKindsToText(node => [], [SyntaxKind.AtToken]),
    new TsKindsToText(node => ['+'], [SyntaxKind.PlusToken]),
    new TsKindsToText(node => [' => '], [SyntaxKind.EqualsGreaterThanToken]),
    new TsKindsToText(node => ['('], [SyntaxKind.OpenParenToken]),
    new TsKindsToText(
        node => ['{', ' '],
        [SyntaxKind.ImportClause, SyntaxKind.ObjectLiteralExpression]
    ),
    new TsKindsToText(node => ['{', '\n'], [SyntaxKind.Block]),
    new TsKindsToText(node => ['}'], [SyntaxKind.CloseBraceToken]),
    new TsKindsToText(node => [')'], [SyntaxKind.CloseParenToken]),
    new TsKindsToText(node => ['['], [SyntaxKind.OpenBracketToken]),
    new TsKindsToText(node => [']'], [SyntaxKind.CloseBracketToken]),
    new TsKindsToText(node => [';', '\n'], [SyntaxKind.SemicolonToken]),
    new TsKindsToText(node => [',', ' '], [SyntaxKind.CommaToken]),
    new TsKindsToText(node => [' ', ':', ' '], [SyntaxKind.ColonToken]),
    new TsKindsToText(node => ['.'], [SyntaxKind.DotToken]),
    new TsKindsToText(node => [], [SyntaxKind.DoStatement]),
    new TsKindsToText(node => [], [SyntaxKind.Decorator]),
    new TsKindsToText(node => [' = '], [SyntaxKind.FirstAssignment]),
    new TsKindsToText(node => [' '], [SyntaxKind.FirstPunctuation]),
    new TsKindsToText(node => ['private', ' '], [SyntaxKind.PrivateKeyword]),
    new TsKindsToText(node => ['public', ' '], [SyntaxKind.PublicKeyword])
];
