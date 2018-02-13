import { IHtmlEngineHelper } from './html-engine-helper.interface';
import { extractLeadingText, splitLinkText } from '../../../utils/link-parser';
import { DependenciesEngine } from '../dependencies.engine';

export class ParseDescriptionHelper implements IHtmlEngineHelper {
    constructor(private dependenciesEngine: DependenciesEngine) {

    }

    public helperFunc(context: any, description: string, depth: number) {
        let tagRegExpLight = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i');
        let tagRegExpFull = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i');
        let tagRegExp;
        let matches;
        let previousString;
        let tagInfo = [];

        tagRegExp = (description.indexOf(']{') !== -1) ? tagRegExpFull : tagRegExpLight;

        const processTheLink = (string, tagInfo, leadingText) => {
            let leading = extractLeadingText(string, tagInfo.completeTag);
            let split;
            let result;
            let newLink;
            let rootPath;
            let stringtoReplace;
            let anchor = '';
            let label;
            let pageName;

            split = splitLinkText(tagInfo.text);

            if (typeof split.linkText !== 'undefined') {
                result = this.dependenciesEngine.findInCompodoc(split.target);
            } else {
                let info = tagInfo.text;
                if (tagInfo.text.indexOf('#') !== -1) {
                    anchor = tagInfo.text.substr(tagInfo.text.indexOf('#'), tagInfo.text.length);
                    info = tagInfo.text.substr(0, tagInfo.text.indexOf('#'));
                }
                result = this.dependenciesEngine.findInCompodoc(info);
            }

            if (result) {

                label = result.name;
                pageName = result.name;

                if (leadingText) {
                    stringtoReplace = '[' + leadingText + ']' + tagInfo.completeTag;
                } else if (leading.leadingText !== undefined) {
                    stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
                } else if (typeof split.linkText !== 'undefined') {
                    stringtoReplace = tagInfo.completeTag;
                } else {
                    stringtoReplace = tagInfo.completeTag;
                }

                if (result.type === 'class') {
                    result.type = 'classe';
                } else if (result.type === 'miscellaneous' || (result.ctype && result.ctype === 'miscellaneous')) {
                    result.type = 'miscellaneou';
                    label = result.name;
                    anchor = '#' + result.name;
                    if (result.subtype === 'enum') {
                        pageName = 'enumerations';
                    } else if (result.subtype === 'function') {
                        pageName = 'functions';
                    } else if (result.subtype === 'typealias') {
                        pageName = 'typealiases';
                    } else if (result.subtype === 'variable') {
                        pageName = 'variables';
                    }
                }

                rootPath = '';

                switch (depth) {
                    case 0:
                        rootPath = './';
                        break;
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        rootPath = '../'.repeat(depth);
                        break;
                }

                if (leading.leadingText !== undefined) {
                    label = leading.leadingText;
                }
                if (typeof split.linkText !== 'undefined') {
                    label = split.linkText;
                }

                newLink = `<a href="${rootPath}${result.type}s/${pageName}.html${anchor}">${label}</a>`;
                
                return string.replace(stringtoReplace, newLink);
            } else {
                return string;
            }
        };

        function replaceMatch(replacer, tag, match, text, linkText?) {
            let matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);

            if (linkText) {
                return replacer(description, matchedTag, linkText);
            } else {
                return replacer(description, matchedTag);
            }
        }

        do {
            matches = tagRegExp.exec(description);
            if (matches) {
                previousString = description;
                if (matches.length === 2) {
                    description = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                }
                if (matches.length === 3) {
                    description = replaceMatch(processTheLink, 'link', matches[0], matches[2], matches[1]);
                }
            }
        } while (matches && previousString !== description);

        return description;
    }
}
