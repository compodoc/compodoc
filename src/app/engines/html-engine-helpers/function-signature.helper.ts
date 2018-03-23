import { IHtmlEngineHelper } from './html-engine-helper.interface';

import { DependenciesEngine } from '../dependencies.engine';
import { AngularVersionUtil, BasicTypeUtil } from '../../../utils';
import { ConfigurationInterface } from '../../interfaces/configuration.interface';

import { ts } from 'ts-simple-ast';

export class FunctionSignatureHelper implements IHtmlEngineHelper {
    private angularVersionUtil = new AngularVersionUtil();
    private basicTypeUtil = new BasicTypeUtil();

    constructor(
        private configuration: ConfigurationInterface,
        private dependenciesEngine: DependenciesEngine
    ) {}

    private handleFunction(arg): string {
        if (arg.function.length === 0) {
            return `${arg.name}${this.getOptionalString(arg)}: () => void`;
        }

        let argums = arg.function.map(argu => {
            let _result = this.dependenciesEngine.find(argu.type);
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
                    let path = this.angularVersionUtil.getApiLink(
                        _result.data,
                        this.configuration.mainData.angularVersion
                    );
                    return `${argu.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${argu.type}</a>`;
                }
            } else if (this.basicTypeUtil.isKnownType(argu.type)) {
                let path = this.basicTypeUtil.getTypeUrl(argu.type);
                return `${argu.name}${this.getOptionalString(
                    arg
                )}: <a href="${path}" target="_blank">${argu.type}</a>`;
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

        if (method.args) {
            args = method.args
                .map(arg => {
                    let _result = this.dependenciesEngine.find(arg.type);
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
                            let path = this.angularVersionUtil.getApiLink(
                                _result.data,
                                this.configuration.mainData.angularVersion
                            );
                            return `${arg.name}${this.getOptionalString(
                                arg
                            )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                        }
                    } else if (arg.dotDotDotToken) {
                        return `...${arg.name}: ${arg.type}`;
                    } else if (arg.function) {
                        return this.handleFunction(arg);
                    } else if (this.basicTypeUtil.isKnownType(arg.type)) {
                        let path = this.basicTypeUtil.getTypeUrl(arg.type);
                        return `${arg.name}${this.getOptionalString(
                            arg
                        )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                    } else {
                        return `${arg.name}${this.getOptionalString(arg)}: ${arg.type}`;
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
