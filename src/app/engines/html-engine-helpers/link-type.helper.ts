import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import { DependenciesEngine } from '../dependencies.engine';
import { ConfigurationInterface } from '../../interfaces/configuration.interface';
import { AngularVersionUtil, BasicTypeUtil } from '../../../utils';

export class LinkTypeHelper implements IHtmlEngineHelper {
    private angularVersionUtil = new AngularVersionUtil();
    private basicTypeUtil = new BasicTypeUtil();

    constructor(
        private configuration: ConfigurationInterface,
        private dependenciesEngine: DependenciesEngine) {

    }

    public helperFunc(context: any, name: string, options: IHandlebarsOptions) {
        let _result = this.dependenciesEngine.find(name);
        let angularDocPrefix = this.angularVersionUtil.prefixOfficialDoc(this.configuration.mainData.angularVersion);
        if (_result) {
            context.type = {
                raw: name
            };
            if (_result.source === 'internal') {
                if (_result.data.type === 'class') {
                    _result.data.type = 'classe';
                }
                context.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                if (_result.data.type === 'miscellaneous' || (_result.data.ctype && _result.data.ctype === 'miscellaneous')) {
                    let mainpage = '';
                    switch (_result.data.subtype) {
                        case 'enum':
                            mainpage = 'enumerations';
                            break;
                        case 'function':
                            mainpage = 'functions';
                            break;
                        case 'typealias':
                            mainpage = 'typealiases';
                            break;
                        case 'variable':
                            mainpage = 'variables';
                    }
                    context.type.href = '../' + _result.data.ctype + '/' + mainpage + '.html#' + _result.data.name;
                }
                context.type.target = '_self';
            } else {
                context.type.href = `https://${angularDocPrefix}angular.io/${_result.data.path}`;
                context.type.target = '_blank';
            }

            return options.fn(context);
        } else if (this.basicTypeUtil.isKnownType(name)) {
            context.type = {
                raw: name
            };
            context.type.target = '_blank';
            context.type.href = this.basicTypeUtil.getTypeUrl(name);
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}
