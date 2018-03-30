import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import { extractLeadingText, splitLinkText } from '../../../utils/link-parser';
import { DependenciesEngine } from '../dependencies.engine';

export class ElementAloneHelper implements IHtmlEngineHelper {
    constructor(private dependenciesEngine: DependenciesEngine) {}

    public helperFunc(context: any, elements, elementType: string, options: IHandlebarsOptions) {
        let result = false;
        let alones = [];
        let modules = this.dependenciesEngine.modules;

        elements.forEach(element => {
            let foundInOneModule = false;
            modules.forEach(module => {
                module.declarations.forEach(declaration => {
                    if (declaration.id === element.id) {
                        foundInOneModule = true;
                    }
                });
                module.providers.forEach(provider => {
                    if (provider.id === element.id) {
                        foundInOneModule = true;
                    }
                });
            });
            if (!foundInOneModule) {
                alones.push(element);
            }
        });

        if (alones.length > 0) {
            switch (elementType) {
                case 'component':
                    context.components = alones;
                    break;
                case 'directive':
                    context.directives = alones;
                    break;
                case 'injectable':
                    context.injectables = alones;
                    break;
                case 'pipe':
                    context.pipes = alones;
                    break;
            }
            return options.fn(context);
        }
    }
}
