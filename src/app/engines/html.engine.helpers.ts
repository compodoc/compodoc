const Handlebars = require('handlebars');

import * as _ from 'lodash';

import { BreakCommaHelper } from './html-engine-helpers/break-comma.helper';
import { BreakLinesHelper } from './html-engine-helpers/break-lines.helper';
import { CapitalizeHelper } from './html-engine-helpers/capitalize.helper';
import { CleanParagraphHelper } from './html-engine-helpers/clean-paragraph.helper';
import { CompareHelper } from './html-engine-helpers/compare.helper';
import { DebugHelper } from './html-engine-helpers/debug.helper';
import { ElementAloneHelper } from './html-engine-helpers/element-alone.helper';
import { EscapeSimpleQuoteHelper } from './html-engine-helpers/escape-simple-quote.helper';
import { FilterAngular2ModulesHelper } from './html-engine-helpers/filter-angular2-modules.helper';
import { FunctionSignatureHelper } from './html-engine-helpers/function-signature.helper';
import { HasOwnHelper } from './html-engine-helpers/has-own.helper';
import { IHtmlEngineHelper } from './html-engine-helpers/html-engine-helper.interface';
import { I18nHelper } from './html-engine-helpers/i18n.helper';
import { IfStringHelper } from './html-engine-helpers/if-string.helper';
import { IndexableSignatureHelper } from './html-engine-helpers/indexable-signature.helper';
import { IsInitialTabHelper } from './html-engine-helpers/is-initial-tab.helper';
import { IsNotToggleHelper } from './html-engine-helpers/is-not-toggle.helper';
import { IsTabEnabledHelper } from './html-engine-helpers/is-tab-enabled.helper';
import { JsdocCodeExampleHelper } from './html-engine-helpers/jsdoc-code-example.helper';
import { JsdocDefaultHelper } from './html-engine-helpers/jsdoc-default.helper';
import { JsdocExampleHelper } from './html-engine-helpers/jsdoc-example.helper';
import { JsdocParamsValidHelper } from './html-engine-helpers/jsdoc-params-valid.helper';
import { JsdocParamsHelper } from './html-engine-helpers/jsdoc-params.helper';
import { JsdocReturnsCommentHelper } from './html-engine-helpers/jsdoc-returns-comment.helper';
import { LinkTypeHelper } from './html-engine-helpers/link-type.helper';
import { ModifIconHelper } from './html-engine-helpers/modif-icon.helper';
import { ModifKindHelper } from './html-engine-helpers/modif-kind-helper';
import { ObjectLengthHelper } from './html-engine-helpers/object-length.helper';
import { ObjectHelper } from './html-engine-helpers/object.helper';
import { OneParameterHasHelper } from './html-engine-helpers/one-parameter-has.helper';
import { OrLengthHelper } from './html-engine-helpers/or-length.helper';
import { OrHelper } from './html-engine-helpers/or.helper';
import { ParseDescriptionHelper } from './html-engine-helpers/parse-description.helper';
import { ParsePropertyHelper } from './html-engine-helpers/parse-property.helper';
import { RelativeURLHelper } from './html-engine-helpers/relative-url.helper';
import { ShortURLHelper } from './html-engine-helpers/short-url.helper';
import { StripURLHelper } from './html-engine-helpers/strip-url.helper';

export class HtmlEngineHelpers {
    public registerHelpers(bars): void {
        this.registerHelper(bars, 'compare', new CompareHelper());
        this.registerHelper(bars, 'or', new OrHelper());
        this.registerHelper(bars, 'functionSignature', new FunctionSignatureHelper());
        this.registerHelper(bars, 'isNotToggle', new IsNotToggleHelper());
        this.registerHelper(bars, 'isInitialTab', new IsInitialTabHelper());
        this.registerHelper(bars, 'isTabEnabled', new IsTabEnabledHelper());
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
        this.registerHelper(bars, 'linkType', new LinkTypeHelper());
        this.registerHelper(bars, 'indexableSignature', new IndexableSignatureHelper());
        this.registerHelper(bars, 'object', new ObjectHelper());
        this.registerHelper(bars, 'objectLength', new ObjectLengthHelper());
        this.registerHelper(bars, 'parseDescription', new ParseDescriptionHelper());
        this.registerHelper(bars, 'one-parameter-has', new OneParameterHasHelper());
        this.registerHelper(bars, 'element-alone', new ElementAloneHelper());
        this.registerHelper(bars, 'hasOwn', new HasOwnHelper());
        this.registerHelper(bars, 'short-url', new ShortURLHelper());
        this.registerHelper(bars, 'strip-url', new StripURLHelper());
        this.registerHelper(bars, 't', new I18nHelper());
        this.registerHelper(bars, 'capitalize', new CapitalizeHelper());
        this.registerHelper(bars, 'parse-property', new ParsePropertyHelper());
    }

    private registerHelper(bars, key: string, helper: IHtmlEngineHelper) {
        Handlebars.registerHelper(key, function () {
            // tslint:disable-next-line:no-invalid-this
            return helper.helperFunc.apply(helper, [this, ..._.slice(arguments as any)]);
        });
    }
}
