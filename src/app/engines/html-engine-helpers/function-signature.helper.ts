import { IHtmlEngineHelper } from './html-engine-helper.interface';

import DependenciesEngine from '../dependencies.engine';
import AngularVersionUtil from '../../../utils/angular-version.util';
import BasicTypeUtil from '../../../utils/basic-type.util';
import Configuration from '../../configuration';

export class FunctionSignatureHelper implements IHtmlEngineHelper {
    constructor() {}

    private handleFunction(arg): string {
        if (arg.function.length === 0) {
            return `${arg.name}${this.getOptionalString(arg)}: () => void`;
        }

        let argums = arg.function.map(argu => {
            let _result = DependenciesEngine.find(argu.type);
            if (_result) {
                if (_result.source === 'internal') {
                    let path = _result.data.type;
                    if (_result.data.type === 'class') {
                        path = 'classe';
                    }
                    return `${argu.name}${this.getOptionalString(arg)}: <a href="../${path}s/${
                        _result.data.name
                    }.html">${argu.type}</a>`;
                } else {
                    let path = AngularVersionUtil.getApiLink(
                        _result.data,
                        Configuration.mainData.angularVersion
                    );
                    return `${argu.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${argu.type}</a>`;
                }
            } else if (BasicTypeUtil.isKnownType(argu.type)) {
                let path = BasicTypeUtil.getTypeUrl(argu.type);
                return `${argu.name}${this.getOptionalString(
                    arg
                )}: <a href="${path}" target="_blank">${argu.type}</a>`;
            } else {
                if (argu.name && argu.type) {
                    return `${argu.name}${this.getOptionalString(arg)}: ${argu.type}`;
                } else {
                    if (argu.name) {
                        return `${argu.name.text}`;
                    } else {
                        return '';
                    }
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

        if (method.args) {
            args = method.args
                .map(arg => {
                    let _result = DependenciesEngine.find(arg.type);
                    if (_result) {
                        if (_result.source === 'internal') {
                            let path = _result.data.type;
                            if (_result.data.type === 'class') {
                                path = 'classe';
                            }
                            return `${arg.name}${this.getOptionalString(
                                arg
                            )}: <a href="../${path}s/${_result.data.name}.html">${arg.type}</a>`;
                        } else {
                            let path = AngularVersionUtil.getApiLink(
                                _result.data,
                                Configuration.mainData.angularVersion
                            );
                            return `${arg.name}${this.getOptionalString(
                                arg
                            )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                        }
                    } else if (arg.dotDotDotToken) {
                        return `...${arg.name}: ${arg.type}`;
                    } else if (arg.function) {
                        return this.handleFunction(arg);
                    } else if (BasicTypeUtil.isKnownType(arg.type)) {
                        let path = BasicTypeUtil.getTypeUrl(arg.type);
                        return `${arg.name}${this.getOptionalString(
                            arg
                        )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                    } else {
                        if (arg.type) {
                            return `${arg.name}${this.getOptionalString(arg)}: ${arg.type}`;
                        } else {
                            return `${arg.name}${this.getOptionalString(arg)}`;
                        }
                    }
                })
                .join(', ');
        }
        if (method.name) {
            return `${method.name}(${args})`;
        } else {
            return `(${args})`;
        }
    }
}
