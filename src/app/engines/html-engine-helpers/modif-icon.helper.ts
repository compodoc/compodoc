import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as ts from 'typescript';

export class ModifIconHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, kind: ts.SyntaxKind): string {

        let _kindText = '';
        switch (kind) {
            case ts.SyntaxKind.PrivateKeyword:
                _kindText = 'lock'; // private
                break;
            case ts.SyntaxKind.ProtectedKeyword:
                _kindText = 'lock'; // protected
                break;
            case ts.SyntaxKind.StaticKeyword:
                _kindText = 'reset'; // static
                break;
            case ts.SyntaxKind.ExportKeyword:
                _kindText = 'export'; // export
                break;
            default:
                _kindText = 'reset';
                break;
        }
        return _kindText;
    }
}