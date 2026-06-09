import { SyntaxKind } from 'ts-morph';

import AngularVersionUtil from '../../../../..//utils/angular-version.util';
import BasicTypeUtil from '../../../../../utils/basic-type.util';
import { StringifyArrowFunction } from '../../../../../utils/arrow-function.util';
import { StringifyObjectLiteralExpression } from '../../../../../utils/object-literal-expression.util';
import Configuration from '../../../../configuration';
import DependenciesEngine from '../../../../engines/dependencies.engine';

export class ArgumentStringifier {
    constructor(private readonly visitType: (node: any) => string) {}

    public stringify(args: any): string {
        return args
            .map((arg: any) => {
                const result = DependenciesEngine.find(arg.type);
                if (result) {
                    return this.stringifyDependencyArgument(arg, result);
                }
                if (arg.dotDotDotToken) {
                    return `...${arg.name}: ${arg.type}`;
                }
                if (arg.function) {
                    return this.stringifyFunctionArgument(arg);
                }
                if (arg.expression && arg.name) {
                    return arg.expression.text + '.' + arg.name.text;
                }
                if (arg.expression && arg.kind === SyntaxKind.NewExpression) {
                    return 'new ' + arg.expression.text + '()';
                }
                if (arg.kind && arg.kind === SyntaxKind.StringLiteral) {
                    return `'` + arg.text + `'`;
                }
                if (
                    arg.kind &&
                    arg.kind === SyntaxKind.ArrayLiteralExpression &&
                    arg.elements &&
                    arg.elements.length > 0
                ) {
                    return this.stringifyArrayLiteral(arg);
                }
                if (
                    arg.kind &&
                    arg.kind === SyntaxKind.ArrowFunction &&
                    arg.parameters &&
                    arg.parameters.length > 0
                ) {
                    return StringifyArrowFunction(arg);
                }
                if (arg.kind && arg.kind === SyntaxKind.ObjectLiteralExpression) {
                    return StringifyObjectLiteralExpression(arg);
                }
                if (BasicTypeUtil.isKnownType(arg.type)) {
                    const path = BasicTypeUtil.getTypeUrl(arg.type);
                    return `${arg.name}${this.getOptionalString(
                        arg
                    )}: <a href="${path}" target="_blank">${arg.type}</a>`;
                }
                return this.stringifyFallbackArgument(arg);
            })
            .join(', ');
    }

    private stringifyFunctionArgument(arg: any): string {
        if (arg.function.length === 0) {
            return `${arg.name}${this.getOptionalString(arg)}: () => void`;
        }

        const argums = arg.function.map((argu: any) => {
            const result = DependenciesEngine.find(argu.type);
            if (result) {
                return this.stringifyDependencyArgument(argu, result, arg);
            }
            if (BasicTypeUtil.isKnownType(argu.type)) {
                const path = BasicTypeUtil.getTypeUrl(argu.type);
                return `${argu.name}${this.getOptionalString(
                    arg
                )}: <a href="${path}" target="_blank">${argu.type}</a>`;
            }
            if (argu.name && argu.type) {
                return `${argu.name}${this.getOptionalString(arg)}: ${argu.type}`;
            }
            if (argu.name) {
                return `${argu.name.text}`;
            }
            return '';
        });

        return `${arg.name}${this.getOptionalString(arg)}: (${argums}) => void`;
    }

    private stringifyDependencyArgument(arg: any, result: any, optionalSource: any = arg): string {
        if (result.source === 'internal') {
            let path = result.data.type;
            if (result.data.type === 'class') {
                path = 'classe';
            }
            return `${arg.name}${this.getOptionalString(optionalSource)}: <a href="../${path}s/${
                result.data.name
            }.html">${arg.type}</a>`;
        }

        const path = AngularVersionUtil.getApiLink(
            result.data,
            Configuration.mainData.angularVersion
        );
        return `${arg.name}${this.getOptionalString(
            optionalSource
        )}: <a href="${path}" target="_blank">${arg.type}</a>`;
    }

    private stringifyArrayLiteral(arg: any): string {
        let result = '[';
        for (let i = 0; i < arg.elements.length; i++) {
            result += `'` + arg.elements[i].text + `'`;
            if (i < arg.elements.length - 1) {
                result += ', ';
            }
        }
        result += ']';
        return result;
    }

    private stringifyFallbackArgument(arg: any): string {
        if (arg.type) {
            let finalStringifiedArgument = '';
            let separator = ':';
            if (arg.name) {
                finalStringifiedArgument += arg.name;
            }
            if (arg.kind === SyntaxKind.AsExpression && arg.expression && arg.expression.text) {
                finalStringifiedArgument += arg.expression.text;
                separator = ' as';
            }
            if (arg.optional) {
                finalStringifiedArgument += this.getOptionalString(arg);
            }
            if (arg.type) {
                finalStringifiedArgument += separator + ' ' + this.visitType(arg.type);
            }
            return finalStringifiedArgument;
        }
        if (arg.text) {
            return `${arg.text}`;
        }
        return `${arg.name}${this.getOptionalString(arg)}`;
    }

    private getOptionalString(arg: any): string {
        return arg.optional ? '?' : '';
    }
}
