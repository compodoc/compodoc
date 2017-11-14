import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';
import * as ts from 'typescript';

export class ModifKindHelper implements IHtmlEngineHelper {
    /**
     * Transform ts.SyntaxKind into string
     * @param  {any}           context Handlebars context
     * @param  {ts.SyntaxKind[]} kind  ts.SyntaxKind concatenated
     * @return {string}                Parsed string
     */
    public helperFunc(context: any, kind: ts.SyntaxKind[]) {
        let _kindText = '';
        switch (kind) {
            case ts.SyntaxKind.PrivateKeyword:
                _kindText = 'Private';
                break;
            case ts.SyntaxKind.ReadonlyKeyword:
                _kindText = 'Readonly';
                break;
            case ts.SyntaxKind.ProtectedKeyword:
                _kindText = 'Protected';
                break;
            case ts.SyntaxKind.PublicKeyword:
                _kindText = 'Public';
                break;
            case ts.SyntaxKind.StaticKeyword:
                _kindText = 'Static';
                break;
        }
        return new Handlebars.SafeString(_kindText);
    }
}
