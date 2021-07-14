import { IHtmlEngineHelper } from './html-engine-helper.interface';
import * as Handlebars from 'handlebars';

import { ts, SyntaxKind } from 'ts-morph';

export class ModifKindHelper implements IHtmlEngineHelper {
    /**
     * Transform SyntaxKind into string
     * @param  {any}           context Handlebars context
     * @param  {SyntaxKind[]} kind  SyntaxKind concatenated
     * @return {string}                Parsed string
     */
    public helperFunc(context: any, kind: SyntaxKind[]) {
        let _kindText = '';
        switch (kind) {
            case SyntaxKind.PrivateKeyword:
                _kindText = 'Private';
                break;
            case SyntaxKind.ReadonlyKeyword:
                _kindText = 'Readonly';
                break;
            case SyntaxKind.ProtectedKeyword:
                _kindText = 'Protected';
                break;
            case SyntaxKind.PublicKeyword:
                _kindText = 'Public';
                break;
            case SyntaxKind.StaticKeyword:
                _kindText = 'Static';
                break;
            case SyntaxKind.AsyncKeyword:
                _kindText = 'Async';
                break;
            case SyntaxKind.AbstractKeyword:
                _kindText = 'Abstract';
                break;
        }
        return new Handlebars.SafeString(_kindText);
    }
}
