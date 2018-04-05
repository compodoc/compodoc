import { OrLengthHelper } from './or-length.helper';
import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import { DependenciesEngine } from '../dependencies.engine';

export class ElementAloneHelper implements IHtmlEngineHelper {
    constructor(private dependenciesEngine: DependenciesEngine) {}

    public helperFunc(context: any, elements: any[], elementType: string, options: IHandlebarsOptions) {
        let result = false;
        let alones = [];
        let modules = this.dependenciesEngine.modules;

        for(let el=0; el < elements.length; el++) {
          const element = elements[el];
          let foundInOneModule = false;

          // modules
          for (let mod=0; mod < modules.length; mod++) {
            const declarations = module.declarations as any[] || [];
            for(let dec=0; dec < declarations.length; dec++) {
              const declaration = declarations[dec];
              if (declaration.id === element.id) {
                foundInOneModule = true;
              }
            }
            const providers = module.providers as any[] || [];
            for(let dec=0; dec < declarations.length; dec++) {
              const provider = providers[dec];
              if (provider.id === element.id) {
                foundInOneModule = true;
              }
            }
          }
          if (!foundInOneModule) {
            alones.push(element);
          }
        }

        // elements.forEach(element => {
        //     let foundInOneModule = false;
        //     modules.forEach(module => {
        //         module.declarations.forEach(declaration => {
        //             if (declaration.id === element.id) {
        //                 foundInOneModule = true;
        //             }
        //         });
        //         module.providers.forEach(provider => {
        //             if (provider.id === element.id) {
        //                 foundInOneModule = true;
        //             }
        //         });
        //     });
        //     if (!foundInOneModule) {
        //         alones.push(element);
        //     }

        // });

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
