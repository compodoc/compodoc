import { IHtmlEngineHelper } from './html-engine-helper.interface';
import { extractLeadingText, splitLinkText } from '../../../utils/link-parser';
import DependenciesEngine from '../dependencies.engine';

export class ParseDescriptionHelper implements IHtmlEngineHelper {
    constructor() {}

    public helperFunc(context: any, description: string, depth: number) {
        let tagRegExpLight = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i');
        let tagRegExpFull = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i');
        let tagRegExp;
        let matches;
        let previousString;
        let tagInfo = [];

        tagRegExp = description.indexOf(']{') !== -1 ? tagRegExpFull : tagRegExpLight;

        const processTheLink = (originalDescription, matchedTag, leadingText) => {
            let leading = extractLeadingText(originalDescription, matchedTag.completeTag);
            let split;
            let resultInCompodoc;
            let newLink;
            let rootPath;
            let stringtoReplace;
            let anchor = '';
            let label;
            let pageName;

            split = splitLinkText(matchedTag.text);

            if (typeof split.linkText !== 'undefined') {
                resultInCompodoc = DependenciesEngine.findInCompodoc(split.target);
            } else {
                let info = matchedTag.text;
                if (matchedTag.text.indexOf('#') !== -1) {
                    anchor = matchedTag.text.substr(
                        matchedTag.text.indexOf('#'),
                        matchedTag.text.length
                    );
                    info = matchedTag.text.substr(0, matchedTag.text.indexOf('#'));
                }
                resultInCompodoc = DependenciesEngine.findInCompodoc(info);
            }

            if (resultInCompodoc) {
                label = resultInCompodoc.name;
                pageName = resultInCompodoc.name;

                if (leadingText) {
                    stringtoReplace = '[' + leadingText + ']' + matchedTag.completeTag;
                } else if (leading.leadingText !== undefined) {
                    stringtoReplace = '[' + leading.leadingText + ']' + matchedTag.completeTag;
                } else if (typeof split.linkText !== 'undefined') {
                    stringtoReplace = matchedTag.completeTag;
                } else {
                    stringtoReplace = matchedTag.completeTag;
                }

                if (resultInCompodoc.type === 'class') {
                    resultInCompodoc.type = 'classes';
                } else if (
                    resultInCompodoc.type === 'miscellaneous' ||
                    (resultInCompodoc.ctype && resultInCompodoc.ctype === 'miscellaneous')
                ) {
                    resultInCompodoc.type = 'miscellaneous'; // Not a typo, it is for matching other single types : component, module etc
                    label = resultInCompodoc.name;
                    anchor = '#' + resultInCompodoc.name;
                    if (resultInCompodoc.subtype === 'enum') {
                        pageName = 'enumerations';
                    } else if (resultInCompodoc.subtype === 'function') {
                        pageName = 'functions';
                    } else if (resultInCompodoc.subtype === 'typealias') {
                        pageName = 'typealiases';
                    } else if (resultInCompodoc.subtype === 'variable') {
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

                if (
                    resultInCompodoc.type === 'miscellaneous' ||
                    resultInCompodoc.type === 'classes'
                ) {
                    newLink = `<a href="${rootPath}${resultInCompodoc.type}/${pageName}.html${anchor}">${label}</a>`;
                } else {
                    newLink = `<a href="${rootPath}${resultInCompodoc.type}s/${pageName}.html${anchor}">${label}</a>`;
                }

                return originalDescription.replace(stringtoReplace, newLink);
            } else if (!resultInCompodoc && typeof split.linkText !== 'undefined') {
                newLink = `<a href="${split.target}">${split.linkText}</a>`;
                if (leadingText) {
                    stringtoReplace = '[' + leadingText + ']' + matchedTag.completeTag;
                } else if (leading.leadingText !== undefined) {
                    stringtoReplace = '[' + leading.leadingText + ']' + matchedTag.completeTag;
                } else if (typeof split.linkText !== 'undefined') {
                    stringtoReplace = matchedTag.completeTag;
                } else {
                    stringtoReplace = matchedTag.completeTag;
                }
                return originalDescription.replace(stringtoReplace, newLink);
            } else if (!resultInCompodoc && leading && typeof leading.leadingText !== 'undefined') {
                newLink = `<a href="${split.target}">${leading.leadingText}</a>`;
                if (leadingText) {
                    stringtoReplace = '[' + leadingText + ']' + matchedTag.completeTag;
                } else if (leading.leadingText !== undefined) {
                    stringtoReplace = '[' + leading.leadingText + ']' + matchedTag.completeTag;
                } else if (typeof split.linkText !== 'undefined') {
                    stringtoReplace = matchedTag.completeTag;
                } else {
                    stringtoReplace = matchedTag.completeTag;
                }
                return originalDescription.replace(stringtoReplace, newLink);
            } else if (!resultInCompodoc && typeof split.linkText === 'undefined') {
                newLink = `<a href="${split.target}">${split.target}</a>`;
                if (leadingText) {
                    stringtoReplace = '[' + leadingText + ']' + matchedTag.completeTag;
                } else if (leading.leadingText !== undefined) {
                    stringtoReplace = '[' + leading.leadingText + ']' + matchedTag.completeTag;
                } else {
                    stringtoReplace = matchedTag.completeTag;
                }
                return originalDescription.replace(stringtoReplace, newLink);
            } else {
                return originalDescription;
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

        // Clean description for marked a tag parsed too early

        if (description.indexOf('href=') !== -1) {
            let insideMarkedATagResults = description.match(/<a [^>]+>([^<]+)<\/a>/g);

            if (insideMarkedATagResults && insideMarkedATagResults.length > 0) {
                for (let i = 0; i < insideMarkedATagResults.length; i++) {
                    let markedATagRegExp = new RegExp('<a [^>]+>([^<]+)</a>', 'gm');
                    let parsedATag = markedATagRegExp.exec(description);
                    if (parsedATag && parsedATag.length === 2) {
                        let insideMarkedATag = parsedATag[1];
                        description = description.replace(
                            `{@link <a href="${encodeURI(
                                insideMarkedATag
                            )}">${insideMarkedATag}</a>`,
                            `{@link ${insideMarkedATag}`
                        );
                    }
                }
            }
        }

        do {
            matches = tagRegExp.exec(description);

            // Did we have {@link ?
            if (matches) {
                previousString = description;
                if (matches.length === 2) {
                    description = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                }
                if (matches.length === 3) {
                    description = replaceMatch(
                        processTheLink,
                        'link',
                        matches[0],
                        matches[2],
                        matches[1]
                    );
                }
            }
        } while (matches && previousString !== description);

        return description;
    }
}
