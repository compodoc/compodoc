import { IHtmlEngineHelper } from './html-engine-helper.interface';
const Handlebars = require('handlebars');

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

        const argums = arg.function.map(argu => {
            const _result = DependenciesEngine.find(argu.type);
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
                    const path = AngularVersionUtil.getApiLink(
                        _result.data,
                        Configuration.mainData.angularVersion
                    );
                    return `${argu.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${argu.type}</a>`;
                }
            } else if (BasicTypeUtil.isKnownType(argu.type)) {
                const path = BasicTypeUtil.getTypeUrl(argu.type);
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
        let args = '';

        let argDestructuredCounterInitial = 0;
        let argDestructuredCounterReal = 0;

        if (method.args) {
            method.args.forEach(arg => {
                if (arg.destructuredParameter) {
                    argDestructuredCounterInitial += 1;
                }
            });

            method.args.forEach((arg, index) => {
                const _result = DependenciesEngine.find(arg.type);
                if (arg.destructuredParameter) {
                    if (argDestructuredCounterReal === 0) {
                        args += '__namedParameters: {';
                    }
                    argDestructuredCounterReal += 1;
                }
                if (_result) {
                    if (_result.source === 'internal') {
                        let path = _result.data.type;
                        if (_result.data.type === 'class') {
                            path = 'classe';
                        }
                        args += `${arg.name}${this.getOptionalString(arg)}: <a href="../${path}s/${
                            _result.data.name
                        }.html" target="_self">${Handlebars.escapeExpression(arg.type)}</a>`;
                    } else {
                        let path = AngularVersionUtil.getApiLink(
                            _result.data,
                            Configuration.mainData.angularVersion
                        );
                        args += `${arg.name}${this.getOptionalString(
                            arg
                        )}: <a href="${path}" target="_blank">${Handlebars.escapeExpression(
                            arg.type
                        )}</a>`;
                    }
                } else if (arg.dotDotDotToken) {
                    args += `...${arg.name}: ${arg.type}`;
                } else if (arg.function) {
                    args += this.handleFunction(arg);
                } else if (BasicTypeUtil.isKnownType(arg.type)) {
                    const path = BasicTypeUtil.getTypeUrl(arg.type);
                    args += `${arg.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${Handlebars.escapeExpression(
                        arg.type
                    )}</a>`;
                } else {
                    if (arg.type) {
                        args += `${arg.name}${this.getOptionalString(arg)}: ${arg.type}`;
                    } else {
                        args += `${arg.name}${this.getOptionalString(arg)}`;
                    }
                }
                if (arg.destructuredParameter) {
                    if (argDestructuredCounterReal === argDestructuredCounterInitial) {
                        args += '}';
                    }
                }
                if (index < method.args.length - 1) {
                    args += ', ';
                }
            });
        }

        if (method.name) {
            return `${method.name}(${args})`;
        } else {
            return `(${args})`;
        }
    }
}
