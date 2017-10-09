import { IHtmlEngineHelper } from './html-engine-helper.interface';
import { prefixOfficialDoc } from '../../../utils/angular-version';
import { DependenciesEngine } from '../dependencies.engine';
import { finderInBasicTypes, finderInTypeScriptBasicTypes } from '../../../utils/basic-types';
import { ConfigurationInterface } from '../../interfaces/configuration.interface';

export class FunctionSignatureHelper implements IHtmlEngineHelper {
    constructor(
        private configuration: ConfigurationInterface,
        private dependenciesEngine: DependenciesEngine) {

    }

    private handleFunction(arg) {
        let angularDocPrefix = prefixOfficialDoc(this.configuration.mainData.angularVersion);

        if (arg.function.length === 0) {
            return `${arg.name}${this.getOptionalString(arg)}: () => void`;
        }

        let argums = arg.function.map((argu) => {
            let _result = this.dependenciesEngine.find(argu.type);
            if (_result) {
                if (_result.source === 'internal') {
                    let path = _result.data.type;
                    if (_result.data.type === 'class') { path = 'classe'; }
                    return `${argu.name}${this.getOptionalString(arg)}: <a href="../${path}s/${_result.data.name}.html">${argu.type}</a>`;
                } else {
                    let path = `https://${angularDocPrefix}angular.io/docs/ts/latest/api/${_result.data.path}`;
                    return `${argu.name}${this.getOptionalString(arg)}: <a href="${path}" target="_blank">${argu.type}</a>`;
                }
            } else if (finderInBasicTypes(argu.type)) {
                let path = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${argu.type}`;
                return `${argu.name}${this.getOptionalString(arg)}: <a href="${path}" target="_blank">${argu.type}</a>`;
            } else if (finderInTypeScriptBasicTypes(argu.type)) {
                let path = `https://www.typescriptlang.org/docs/handbook/basic-types.html`;
                return `${argu.name}${this.getOptionalString(arg)}: <a href="${path}" target="_blank">${argu.type}</a>`;
            } else {
                if (argu.name && argu.type) {
                    return `${argu.name}${this.getOptionalString(arg)}: ${argu.type}`;
                } else {
                    return `${argu.name.text}`;
                }
            }
        });
        return `${arg.name}${this.getOptionalString(arg)}: (${argums}) => void`;
    }

    private getOptionalString(arg): string {
        return arg.optional ? '?' : '';
    }

    public helperFunc(context: any, method) {
        let args = [];
        let angularDocPrefix = prefixOfficialDoc(this.configuration.mainData.angularVersion);

        if (method.args) {
            args = method.args.map((arg) => {
                let _result = this.dependenciesEngine.find(arg.type);
                if (_result) {
                    if (_result.source === 'internal') {
                        let path = _result.data.type;
                        if (_result.data.type === 'class') { path = 'classe'; }
                        return `${arg.name}${this.getOptionalString(arg)}: <a href="../${path}s/${_result.data.name}.html">${arg.type}</a>`;
                    } else {
                        let path = `https://${angularDocPrefix}angular.io/docs/ts/latest/api/${_result.data.path}`;
                        return `${arg.name}${this.getOptionalString(arg)}: <a href="${path}" target="_blank">${arg.type}</a>`;
                    }
                } else if (arg.dotDotDotToken) {
                    return `...${arg.name}: ${arg.type}`;
                } else if (arg.function) {
                    return this.handleFunction(arg);
                } else if (finderInBasicTypes(arg.type)) {
                    let path = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${arg.type}`;
                    return `${arg.name}${this.getOptionalString(arg)}: <a href="${path}" target="_blank">${arg.type}</a>`;
                } else if (finderInTypeScriptBasicTypes(arg.type)) {
                    let path = `https://www.typescriptlang.org/docs/handbook/basic-types.html`;
                    return `${arg.name}${this.getOptionalString(arg)}: <a href="${path}" target="_blank">${arg.type}</a>`;
                } else {
                    return `${arg.name}${this.getOptionalString(arg)}: ${arg.type}`;
                }
            }).join(', ');
        }
        if (method.name) {
            return `${method.name}(${args})`;
        } else {
            return `(${args})`;
        }
    }
}