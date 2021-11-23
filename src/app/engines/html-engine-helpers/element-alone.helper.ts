import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import DependenciesEngine from '../dependencies.engine';

export class ElementAloneHelper implements IHtmlEngineHelper {
    constructor() {}

    public helperFunc(context: any, elements, elementType: string, options: IHandlebarsOptions) {
        let alones = [];
        let modules = DependenciesEngine.modules;

        elements.forEach(element => {
            let foundInOneModule = false;
            modules.forEach(module => {
                module.declarations.forEach(declaration => {
                    if (declaration.id === element.id) {
                        foundInOneModule = true;
                    }
                    if (declaration.file === element.file) {
                        foundInOneModule = true;
                    }
                });
                module.bootstrap.forEach(boostrapedElement => {
                    if (boostrapedElement.id === element.id) {
                        foundInOneModule = true;
                    }
                    if (boostrapedElement.file === element.file) {
                        foundInOneModule = true;
                    }
                });
                module.controllers.forEach(controller => {
                    if (controller.id === element.id) {
                        foundInOneModule = true;
                    }
                    if (controller.file === element.file) {
                        foundInOneModule = true;
                    }
                });
                module.providers.forEach(provider => {
                    if (provider.id === element.id) {
                        foundInOneModule = true;
                    }
                    if (provider.file === element.file) {
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
                case 'controller':
                    context.controllers = alones;
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
