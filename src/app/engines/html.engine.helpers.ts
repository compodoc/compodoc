import * as Handlebars from 'handlebars';
import * as _ from 'lodash';

import { kindToType } from '../../utils/kind-to-type';
import { DependenciesEngine } from './dependencies.engine';
import { IHtmlEngineHelper } from './html-engine-helpers/html-engine-helper.interface';
import { CompareHelper } from './html-engine-helpers/compare.helper';
import { OrHelper } from './html-engine-helpers/or.helper';
import { FunctionSignatureHelper } from './html-engine-helpers/function-signature.helper';
import { IsNotToggleHelper } from './html-engine-helpers/is-not-toggle.helper';
import { IfStringHelper } from './html-engine-helpers/if-string.helper';
import { OrLengthHelper } from './html-engine-helpers/or-length.helper';
import { FilterAngular2ModulesHelper } from './html-engine-helpers/filter-angular2-modules.helper';
import { DebugHelper } from './html-engine-helpers/debug.helper';
import { BreakLinesHelper } from './html-engine-helpers/break-lines.helper';
import { CleanParagraphHelper } from './html-engine-helpers/clean-paragraph.helper';
import { EscapeSimpleQuoteHelper } from './html-engine-helpers/escape-simple-quote.helper';
import { BreakCommaHelper } from './html-engine-helpers/break-comma.helper';
import { ModifKindHelper } from './html-engine-helpers/modif-kind-helper';
import { ModifIconHelper } from './html-engine-helpers/modif-icon.helper';
import { RelativeURLHelper } from './html-engine-helpers/relative-url.helper';
import { JsdocReturnsCommentHelper } from './html-engine-helpers/jsdoc-returns-comment.helper';
import { JsdocCodeExampleHelper } from './html-engine-helpers/jsdoc-code-example.helper';
import { JsdocExampleHelper } from './html-engine-helpers/jsdoc-example.helper';
import { JsdocParamsHelper } from './html-engine-helpers/jsdoc-params.helper';
import { JsdocParamsValidHelper } from './html-engine-helpers/jsdoc-params-valid.helper';
import { JsdocDefaultHelper } from './html-engine-helpers/jsdoc-default.helper';
import { LinkTypeHelper } from './html-engine-helpers/link-type.helper';
import { IndexableSignatureHelper } from './html-engine-helpers/indexable-signature.helper';
import { ObjectHelper } from './html-engine-helpers/object.helper';
import { ObjectLengthHelper } from './html-engine-helpers/object-length.helper';
import { ParseDescriptionHelper } from './html-engine-helpers/parse-description.helper';
import { OneParameterHasHelper } from './html-engine-helpers/one-parameter-has.helper';
import { ConfigurationInterface } from '../interfaces/configuration.interface';


export class HtmlEngineHelpers {
    public registerHelpers(
        bars,
        configuration: ConfigurationInterface,
        dependenciesEngine: DependenciesEngine): void {

        this.registerHelper(bars, 'compare', new CompareHelper());
        this.registerHelper(bars, 'or', new OrHelper());
        this.registerHelper(bars, 'functionSignature', new FunctionSignatureHelper(configuration, dependenciesEngine));
        this.registerHelper(bars, 'isNotToggle', new IsNotToggleHelper(configuration));
        this.registerHelper(bars, 'ifString', new IfStringHelper());
        this.registerHelper(bars, 'orLength', new OrLengthHelper());
        this.registerHelper(bars, 'filterAngular2Modules', new FilterAngular2ModulesHelper());
        this.registerHelper(bars, 'debug', new DebugHelper());
        this.registerHelper(bars, 'breaklines', new BreakLinesHelper(bars));
        this.registerHelper(bars, 'clean-paragraph', new CleanParagraphHelper());
        this.registerHelper(bars, 'escapeSimpleQuote', new EscapeSimpleQuoteHelper());
        this.registerHelper(bars, 'breakComma', new BreakCommaHelper(bars));
        this.registerHelper(bars, 'modifKind', new ModifKindHelper());
        this.registerHelper(bars, 'modifIcon', new ModifIconHelper());
        this.registerHelper(bars, 'relativeURL', new RelativeURLHelper());
        this.registerHelper(bars, 'jsdoc-returns-comment', new JsdocReturnsCommentHelper());
        this.registerHelper(bars, 'jsdoc-code-example', new JsdocCodeExampleHelper());
        this.registerHelper(bars, 'jsdoc-example', new JsdocExampleHelper());
        this.registerHelper(bars, 'jsdoc-params', new JsdocParamsHelper());
        this.registerHelper(bars, 'jsdoc-params-valid', new JsdocParamsValidHelper());
        this.registerHelper(bars, 'jsdoc-default', new JsdocDefaultHelper());
        this.registerHelper(bars, 'linkType', new LinkTypeHelper(configuration, dependenciesEngine));
        this.registerHelper(bars, 'indexableSignature', new IndexableSignatureHelper());
        this.registerHelper(bars, 'object', new ObjectHelper());
        this.registerHelper(bars, 'objectLength', new ObjectLengthHelper());
        this.registerHelper(bars, 'parseDescription', new ParseDescriptionHelper(dependenciesEngine));
        this.registerHelper(bars, 'one-parameter-has', new OneParameterHasHelper());
    }

    private registerHelper(bars, key: string, helper: IHtmlEngineHelper) {
        Handlebars.registerHelper(key, function() {
            // tslint:disable-next-line:no-invalid-this
            return helper.helperFunc.apply(helper, [this, ..._.slice(arguments as any)]);
        });
    }
}
