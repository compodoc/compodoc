import { IHtmlEngineHelper } from './html-engine-helper.interface';

export class ModifIconHelper implements IHtmlEngineHelper {
    public helperFunc(context: any, kind) {
        // https://github.com/Microsoft/TypeScript/blob/master/lib/typescript.d.ts#L62
        let _kindText = '';
        switch (kind) {
            case 112:
                _kindText = 'lock'; // private
                break;
            case 113:
                _kindText = 'lock'; // protected
                break;
            case 115:
                _kindText = 'reset'; // static
                break;
            case 84:
                _kindText = 'export'; // export
                break;
            default:
                _kindText = 'reset';
                break;
        }
        return _kindText;
    }
}