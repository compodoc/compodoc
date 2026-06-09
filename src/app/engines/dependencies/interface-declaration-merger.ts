import * as _ from '../../../utils/collection.util';

import { IInterfaceDep } from '../../compiler/angular/dependencies.interfaces';

export class InterfaceDeclarationMerger {
    public merge(interfaces: IInterfaceDep[]): IInterfaceDep[] {
        if (!interfaces || interfaces.length === 0) {
            return [];
        }

        const mergedInterfaces = _.chain(interfaces)
            .filter((interf: IInterfaceDep) => !!interf.declarationMergeId)
            .groupBy((interf: IInterfaceDep) => interf.declarationMergeId)
            .values()
            .map((group: IInterfaceDep[]) => this.mergeGroup(group))
            .value();

        const regularInterfaces = interfaces.filter(
            (interf: IInterfaceDep) => !interf.declarationMergeId
        );

        return _.concat(regularInterfaces, mergedInterfaces);
    }

    private mergeGroup(group: IInterfaceDep[]): IInterfaceDep {
        const merged = { ...group[0] };

        const properties = this.mergeUniqueArrayValues(group.map(interf => interf.properties));
        if (properties) {
            merged.properties = properties;
        }

        const methods = this.mergeUniqueArrayValues(group.map(interf => interf.methods));
        if (methods) {
            merged.methods = methods;
        }

        const indexSignatures = this.mergeUniqueArrayValues(
            group.map(interf => interf.indexSignatures)
        );
        if (indexSignatures) {
            merged.indexSignatures = indexSignatures;
        }

        const extendsList = this.mergeUniqueArrayValues(group.map(interf => interf.extends));
        if (extendsList) {
            merged.extends = extendsList;
        }

        merged.deprecated = group.some(interf => !!interf.deprecated);
        merged.deprecationMessage = this.mergeDeprecationMessages(group);

        return merged;
    }

    private mergeDeprecationMessages(group: IInterfaceDep[]): string {
        const deprecationMessages = _.uniq(
            group.map(interf => interf.deprecationMessage).filter(Boolean)
        );
        return deprecationMessages.length > 0 ? deprecationMessages.join('\n\n') : '';
    }

    private mergeUniqueArrayValues<T>(arrays: Array<T[] | undefined>): T[] | undefined {
        const merged = [];
        const cache = new Set<string>();

        for (const arr of arrays) {
            if (!arr || arr.length === 0) {
                continue;
            }
            for (const item of arr) {
                const key =
                    typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item);
                if (cache.has(key)) {
                    continue;
                }
                cache.add(key);
                merged.push(item);
            }
        }

        return merged.length > 0 ? merged : undefined;
    }
}
