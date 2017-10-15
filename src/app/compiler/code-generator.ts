import * as ts from 'typescript';

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
    constructor(
        public output: (node: ts.Node) => Array<string>,
        public kinds: Array<ts.SyntaxKind>) { }
}

const TsKindConversion: Array<TsKindsToText> = [
    new TsKindsToText(
        node => ['\"', node.text, '\"'],
        [ts.SyntaxKind.FirstLiteralToken, ts.SyntaxKind.Identifier]),
    new TsKindsToText(
        node => ['\"', node.text, '\"'],
        [ts.SyntaxKind.StringLiteral]),
    new TsKindsToText(
        node => [],
        [ts.SyntaxKind.ArrayLiteralExpression]),
    new TsKindsToText(
        node => ['import', ' '],
        [ts.SyntaxKind.ImportKeyword]),
    new TsKindsToText(
        node => ['from', ' '],
        [ts.SyntaxKind.FromKeyword]),
    new TsKindsToText(
        node => ['\n', 'export', ' '],
        [ts.SyntaxKind.ExportKeyword]),
    new TsKindsToText(
        node => ['class', ' '],
        [ts.SyntaxKind.ClassKeyword]),
    new TsKindsToText(
        node => ['this'],
        [ts.SyntaxKind.ThisKeyword]),
    new TsKindsToText(
        node => ['constructor'],
        [ts.SyntaxKind.ConstructorKeyword]),
    new TsKindsToText(
        node => ['false'],
        [ts.SyntaxKind.FalseKeyword]),
    new TsKindsToText(
        node => ['true'],
        [ts.SyntaxKind.TrueKeyword]),
    new TsKindsToText(
        node => ['null'],
        [ts.SyntaxKind.NullKeyword]),
    new TsKindsToText(
        node => [],
        [ts.SyntaxKind.AtToken]),
    new TsKindsToText(
        node => ['+'],
        [ts.SyntaxKind.PlusToken]),
    new TsKindsToText(
        node => [' => '],
        [ts.SyntaxKind.EqualsGreaterThanToken]),
    new TsKindsToText(
        node => ['('],
        [ts.SyntaxKind.OpenParenToken]),
    new TsKindsToText(
        node => ['{', ' '],
        [ts.SyntaxKind.ImportClause, ts.SyntaxKind.ObjectLiteralExpression]),
    new TsKindsToText(
        node => ['{', '\n'],
        [ts.SyntaxKind.Block]),
    new TsKindsToText(
        node => ['}'],
        [ts.SyntaxKind.CloseBraceToken]),
    new TsKindsToText(
        node => [')'],
        [ts.SyntaxKind.CloseParenToken]),
    new TsKindsToText(
        node => ['['],
        [ts.SyntaxKind.OpenBracketToken]),
    new TsKindsToText(
        node => [']'],
        [ts.SyntaxKind.CloseBracketToken]),
    new TsKindsToText(
        node => [';', '\n'],
        [ts.SyntaxKind.SemicolonToken]),
    new TsKindsToText(
        node => [',', ' '],
        [ts.SyntaxKind.CommaToken]),
    new TsKindsToText(
        node => [' ', ':', ' '],
        [ts.SyntaxKind.ColonToken]),
    new TsKindsToText(
        node => ['.'],
        [ts.SyntaxKind.DotToken]),
    new TsKindsToText(
        node => [],
        [ts.SyntaxKind.DoStatement]),
    new TsKindsToText(
        node => [],
        [ts.SyntaxKind.Decorator]),
    new TsKindsToText(
        node => [' = '],
        [ts.SyntaxKind.FirstAssignment]),
    new TsKindsToText(
        node => [' '],
        [ts.SyntaxKind.FirstPunctuation]),
    new TsKindsToText(
        node => ['private', ' '],
        [ts.SyntaxKind.PrivateKeyword]),
    new TsKindsToText(
        node => ['public', ' '],
        [ts.SyntaxKind.PublicKeyword])

];
