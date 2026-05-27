import { IHtmlEngineHelper } from './html-engine-helper.interface';
const Handlebars = require('handlebars');

import DependenciesEngine from '../dependencies.engine';
import AngularVersionUtil from '../../../utils/angular-version.util';
import BasicTypeUtil from '../../../utils/basic-type.util';
import Configuration from '../../configuration';

export class FunctionSignatureHelper implements IHtmlEngineHelper {
    constructor() {}

    private normalizeTypeName(name: any): any {
        if (typeof name === 'string') {
            return name.trim();
        }
        return name;
    }

    private getReferenceBadge(resultData: any, source?: string): { letter: string; kind: string } {
        if (source && source !== 'internal') {
            return { letter: 'A', kind: 'angular' };
        }

        const subtype = resultData?.subtype;
        if (subtype === 'enum') {
            return { letter: 'E', kind: 'enum' };
        }
        if (subtype === 'function') {
            return { letter: 'F', kind: 'function' };
        }
        if (subtype === 'typealias' || subtype === 'type-alias') {
            return { letter: 'T', kind: 'typealias' };
        }
        if (subtype === 'variable') {
            return { letter: 'V', kind: 'variable' };
        }

        const kind = resultData?.type;
        if (kind === 'interface') {
            return { letter: 'I', kind: 'interface' };
        }
        if (
            kind === 'class' ||
            kind === 'component' ||
            kind === 'directive' ||
            kind === 'injectable' ||
            kind === 'interceptor' ||
            kind === 'controller' ||
            kind === 'guard' ||
            kind === 'pipe' ||
            kind === 'entity'
        ) {
            return { letter: 'C', kind: 'class' };
        }
        if (kind === 'enum') {
            return { letter: 'E', kind: 'enum' };
        }
        if (kind === 'function') {
            return { letter: 'F', kind: 'function' };
        }
        if (kind === 'typealias' || kind === 'type-alias') {
            return { letter: 'T', kind: 'typealias' };
        }
        if (kind === 'variable') {
            return { letter: 'V', kind: 'variable' };
        }

        return { letter: '', kind: '' };
    }

    private getBadgeMarkup(badge: { letter: string; kind: string }): string {
        const letter = badge.letter;
        if (!letter) {
            return '';
        }
        const kindClass = badge.kind ? ` reference-badge--${badge.kind}` : '';
        return `<span class="reference-badge${kindClass}" aria-hidden="true">${letter}</span>`;
    }

    /**
     * Generates the correct href for internal type links
     * Handles both regular types and miscellaneous types (typealias, enum, function, variable)
     */
    private buildHrefForInternalType(resultData: any): string {
        if (
            resultData.type === 'miscellaneous' ||
            (resultData.ctype && resultData.ctype === 'miscellaneous')
        ) {
            let mainpage = '';
            switch (resultData.subtype) {
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
                    break;
            }
            return `../miscellaneous/${mainpage}.html#${resultData.name}`;
        } else {
            let path = resultData.type;
            if (resultData.type === 'class') {
                path = 'classe';
            }
            return `../${path}s/${resultData.name}.html`;
        }
    }

    private handleFunction(arg): string {
        if (arg.function.length === 0) {
            return `${arg.name}${this.getOptionalString(arg)}: () => void`;
        }

        const argums = arg.function.map(argu => {
            const normalizedArgType = this.normalizeTypeName(argu.type);
            const _result = DependenciesEngine.find(normalizedArgType);
            if (_result) {
                if (_result.source === 'internal') {
                    const href = this.buildHrefForInternalType(_result.data);
                    const badge = this.getBadgeMarkup(
                        this.getReferenceBadge(_result.data, _result.source)
                    );
                    return `${argu.name}${this.getOptionalString(arg)}: <a href="${href}">${badge}${normalizedArgType}</a>`;
                } else {
                    const path = AngularVersionUtil.getApiLink(
                        _result.data,
                        Configuration.mainData.angularVersion
                    );
                    const badge = this.getBadgeMarkup(
                        this.getReferenceBadge(_result.data, _result.source)
                    );
                    return `${argu.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${badge}${normalizedArgType}</a>`;
                }
            } else if (BasicTypeUtil.isKnownType(normalizedArgType)) {
                const path = BasicTypeUtil.getTypeUrl(normalizedArgType);
                return `${argu.name}${this.getOptionalString(
                    arg
                )}: <a href="${path}" target="_blank">${normalizedArgType}</a>`;
            } else {
                if (argu.name && argu.type) {
                    return `${argu.name}${this.getOptionalString(arg)}: ${normalizedArgType}`;
                } else {
                    if (argu.name) {
                        return `${argu.name.text}`;
                    } else {
                        return '';
                    }
                }
            }
        });
        return `${arg.name}${this.getOptionalString(arg)}: (${argums.join(', ')}) => void`;
    }

    private getOptionalString(arg): string {
        return arg.optional ? '?' : '';
    }

    private getTypeParametersString(method): string {
        if (!method || !method.typeParameters || method.typeParameters.length === 0) {
            return '';
        }

        return `&lt;${method.typeParameters.join(', ')}&gt;`;
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
                const normalizedArgType = this.normalizeTypeName(arg.type);
                const _result = DependenciesEngine.find(normalizedArgType);
                if (arg.destructuredParameter) {
                    if (argDestructuredCounterReal === 0) {
                        args += '__namedParameters: {';
                    }
                    argDestructuredCounterReal += 1;
                }
                if (_result) {
                    if (_result.source === 'internal') {
                        const href = this.buildHrefForInternalType(_result.data);
                        const badge = this.getBadgeMarkup(
                            this.getReferenceBadge(_result.data, _result.source)
                        );
                        args += `${arg.name}${this.getOptionalString(arg)}: <a href="${href}" target="_self">${badge}${Handlebars.escapeExpression(normalizedArgType)}</a>`;
                    } else {
                        let path = AngularVersionUtil.getApiLink(
                            _result.data,
                            Configuration.mainData.angularVersion
                        );
                        const badge = this.getBadgeMarkup(
                            this.getReferenceBadge(_result.data, _result.source)
                        );
                        args += `${arg.name}${this.getOptionalString(
                            arg
                        )}: <a href="${path}" target="_blank">${badge}${Handlebars.escapeExpression(
                            normalizedArgType
                        )}</a>`;
                    }
                } else if (arg.dotDotDotToken) {
                    args += `...${arg.name}: ${arg.type}`;
                } else if (arg.function) {
                    args += this.handleFunction(arg);
                } else if (BasicTypeUtil.isKnownType(normalizedArgType)) {
                    const path = BasicTypeUtil.getTypeUrl(normalizedArgType);
                    args += `${arg.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${Handlebars.escapeExpression(
                        normalizedArgType
                    )}</a>`;
                } else {
                    if (arg.type) {
                        args += `${arg.name}${this.getOptionalString(arg)}: ${normalizedArgType}`;
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

        const typeParameters = this.getTypeParametersString(method);
        if (method.name) {
            return `${method.name}${typeParameters}(${args})`;
        } else {
            return `${typeParameters}(${args})`;
        }
    }
}
