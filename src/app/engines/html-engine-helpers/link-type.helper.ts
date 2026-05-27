import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';

import DependenciesEngine from '../dependencies.engine';

import AngularVersionUtil from '../../../utils/angular-version.util';
import ExtendsMerger from '../../../utils/extends-merger.util';
import BasicTypeUtil from '../../../utils/basic-type.util';

import Configuration from '../../configuration';

export class LinkTypeHelper implements IHtmlEngineHelper {
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

    public helperFunc(context: any, name: string, options: IHandlebarsOptions) {
        const normalizedName = this.normalizeTypeName(name);
        let _result = DependenciesEngine.find(normalizedName);
        // Find in aliases ?
        if (!_result) {
            const potentialAlias = ExtendsMerger.findInAliases(normalizedName);
            if (potentialAlias) {
                _result = DependenciesEngine.find(potentialAlias);
            }
        }

        if (_result) {
            const refBadge = this.getReferenceBadge(_result.data, _result.source);
            context.type = {
                raw: normalizedName,
                indexKey: '',
                refBadge: refBadge.letter,
                refBadgeKind: refBadge.kind
            };
            if (_result.source === 'internal') {
                if (_result.data.type === 'class') {
                    _result.data.type = 'classe';
                }
                context.type.href = '../' + _result.data.type + 's/' + _result.data.name + '.html';
                if (context.indexKey !== '' && context.indexKey !== undefined) {
                    context.type.href += '#' + context.indexKey;
                    context.type.indexKey = context.indexKey;
                }
                if (
                    _result.data.type === 'miscellaneous' ||
                    (_result.data.ctype && _result.data.ctype === 'miscellaneous')
                ) {
                    let mainpage = '';
                    switch (_result.data.subtype) {
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
                    }
                    context.type.href = '../' + _result.data.ctype + '/' + mainpage + '.html';
                    if (_result.data && _result.data.name) {
                        context.type.href += '#' + _result.data.name;
                    }
                }
                if (!context.type.indexKey) {
                    context.type.indexKey = '';
                }
                context.type.target = '_self';
            } else {
                context.type.href = AngularVersionUtil.getApiLink(
                    _result.data,
                    Configuration.mainData.angularVersion
                );
                context.type.target = '_blank';
            }

            return options.fn(context);
        } else if (BasicTypeUtil.isKnownType(normalizedName)) {
            context.type = {
                raw: normalizedName,
                indexKey: ''
            };
            context.type.target = '_blank';
            context.type.href = BasicTypeUtil.getTypeUrl(normalizedName);
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    }
}
