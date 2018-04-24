import { IHtmlEngineHelper, IHandlebarsOptions } from './html-engine-helper.interface';
import { JsdocTagInterface } from '../../interfaces/jsdoc-tag.interface';
import { kindToType } from '../../../utils/kind-to-type';

export class JsdocParamsHelper implements IHtmlEngineHelper {
    public helperFunc(
        context: any,
        jsdocTags: Array<JsdocTagInterface | any>,
        options: IHandlebarsOptions
    ) {
        let i = 0;
        let len = jsdocTags.length;
        let tags = [];

        for (i; i < len; i++) {
            if (jsdocTags[i].tagName) {
                if (jsdocTags[i].tagName.text === 'param') {
                    let tag = {} as JsdocTagInterface;
                    if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.kind) {
                        tag.type = kindToType(jsdocTags[i].typeExpression.type.kind);
                    }
                    if (jsdocTags[i].typeExpression && jsdocTags[i].typeExpression.type.name) {
                        tag.type = jsdocTags[i].typeExpression.type.name.text;
                    } else {
                        tag.type = jsdocTags[i].type;
                    }
                    if (jsdocTags[i].comment) {
                        tag.comment = jsdocTags[i].comment;
                    }
                    if (jsdocTags[i].defaultValue) {
                        tag.defaultValue = jsdocTags[i].defaultValue;
                    }
                    if (jsdocTags[i].name) {
                        if (jsdocTags[i].name.text) {
                            tag.name = jsdocTags[i].name.text;
                        } else {
                            tag.name = jsdocTags[i].name;
                        }
                    }
                    if (jsdocTags[i].optional) {
                        (tag as any).optional = true;
                    }
                    tags.push(tag);
                }
            }
        }
        if (tags.length >= 1) {
            context.tags = tags;
            return options.fn(context);
        }
    }
}
