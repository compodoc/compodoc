import * as _ from '../../../../../utils/collection.util';

import { ts } from 'ts-morph';

import { getNodeDecorators } from '../../../../../utils/node.util';

export class DecoratorResolver {
    constructor(private readonly stringifyArguments: (args: any) => string) {}

    public getDecoratorOfType(node: any, decoratorType: any): ts.Decorator[] | undefined {
        const decorators = getNodeDecorators(node) || [];
        const result: ts.Decorator[] = [];
        const len = decorators.length;

        if (len > 1) {
            for (let i = 0; i < decorators.length; i++) {
                const expr = decorators[i].expression as any;
                if (expr.expression && expr.expression.text === decoratorType) {
                    result.push(decorators[i]);
                }
            }
            if (result.length > 0) {
                return result;
            }
        } else if (len === 1) {
            const expr = decorators[0].expression as any;
            if (expr && expr.expression && expr.expression.text === decoratorType) {
                result.push(decorators[0]);
                return result;
            }
        }

        return undefined;
    }

    public formatDecorators(decorators: any): any[] {
        const formattedDecorators: any[] = [];

        _.forEach(decorators, (decorator: any) => {
            if (!decorator.expression) {
                return;
            }

            if (decorator.expression.text) {
                formattedDecorators.push({ name: decorator.expression.text });
            }

            if (decorator.expression.expression) {
                const info: any = {
                    name: decorator.expression.expression.text
                };
                if (decorator.expression.arguments) {
                    info.stringifiedArguments = this.stringifyArguments(
                        decorator.expression.arguments
                    );
                }
                formattedDecorators.push(info);
            }
        });

        return formattedDecorators;
    }

    public isDirectiveDecorator(decorator: ts.Decorator): boolean {
        return this.hasDecoratorType(decorator, 'Directive', 'Component');
    }

    public isServiceDecorator(decorator: ts.Decorator): boolean {
        return this.hasDecoratorType(decorator, 'Injectable', 'Service');
    }

    public isPipeDecorator(decorator: ts.Decorator): boolean {
        return this.hasDecoratorType(decorator, 'Pipe');
    }

    public isControllerDecorator(decorator: ts.Decorator): boolean {
        return this.hasDecoratorType(decorator, 'Controller');
    }

    public isModuleDecorator(decorator: ts.Decorator): boolean {
        return this.hasDecoratorType(decorator, 'NgModule', 'Module');
    }

    private hasDecoratorType(decorator: ts.Decorator, ...types: string[]): boolean {
        if ((decorator.expression as any).expression) {
            const decoratorText = (decorator.expression as any).expression.text;
            return types.includes(decoratorText);
        }
        return false;
    }
}
