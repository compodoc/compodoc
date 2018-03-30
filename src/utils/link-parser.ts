export function extractLeadingText(string, completeTag) {
    let tagIndex = string.indexOf(completeTag);
    let leadingText = undefined;
    let leadingTextRegExp = /\[(.+?)\]/g;
    let leadingTextInfo = leadingTextRegExp.exec(string);

    // did we find leading text, and if so, does it immediately precede the tag?
    while (leadingTextInfo && leadingTextInfo.length) {
        if (leadingTextInfo.index + leadingTextInfo[0].length === tagIndex) {
            string = string.replace(leadingTextInfo[0], '');
            leadingText = leadingTextInfo[1];
            break;
        }

        leadingTextInfo = leadingTextRegExp.exec(string);
    }

    return {
        leadingText: leadingText,
        string: string
    };
}

export function splitLinkText(text) {
    let linkText;
    let target;
    let splitIndex;

    // if a pipe is not present, we split on the first space
    splitIndex = text.indexOf('|');
    if (splitIndex === -1) {
        splitIndex = text.search(/\s/);
    }

    if (splitIndex !== -1) {
        linkText = text.substr(splitIndex + 1);
        // Normalize subsequent newlines to a single space.
        linkText = linkText.replace(/\n+/, ' ');
        target = text.substr(0, splitIndex);
    }

    return {
        linkText: linkText,
        target: target || text
    };
}

export let LinkParser = (function() {
    let processTheLink = function(string, tagInfo, leadingText) {
        let leading = extractLeadingText(string, tagInfo.completeTag),
            linkText,
            split,
            target,
            stringtoReplace;

        linkText = leadingText ? leadingText : leading.leadingText || '';

        split = splitLinkText(tagInfo.text);
        target = split.target;

        if (leading.leadingText !== undefined) {
            stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
        } else if (typeof split.linkText !== 'undefined') {
            stringtoReplace = tagInfo.completeTag;
            linkText = split.linkText;
        }

        return string.replace(stringtoReplace, '[' + linkText + '](' + target + ')');
    };

    /**
     * Convert
     * {@link http://www.google.com|Google} or {@link https://github.com GitHub} or [Github]{@link https://github.com} to [Github](https://github.com)
     */

    let replaceLinkTag = function(str: string) {
        if (typeof str === 'undefined') {
            return {
                newString: ''
            };
        }

        // new RegExp('\\[((?:.|\n)+?)]\\{@link\\s+((?:.|\n)+?)\\}', 'i').exec('ee [TO DO]{@link Todo} fo') -> "[TO DO]{@link Todo}", "TO DO", "Todo"
        // new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i').exec('ee [TODO]{@link Todo} fo') -> "{@link Todo}", "Todo"

        let tagRegExpLight = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'),
            tagRegExpFull = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'),
            tagRegExp,
            matches,
            previousString,
            tagInfo = [];

        tagRegExp = str.indexOf(']{') !== -1 ? tagRegExpFull : tagRegExpLight;

        function replaceMatch(replacer, tag, match, text, linkText?) {
            let matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);
            if (linkText) {
                return replacer(str, matchedTag, linkText);
            } else {
                return replacer(str, matchedTag);
            }
        }

        do {
            matches = tagRegExp.exec(str);
            if (matches) {
                previousString = str;
                if (matches.length === 2) {
                    str = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
                }
                if (matches.length === 3) {
                    str = replaceMatch(processTheLink, 'link', matches[0], matches[2], matches[1]);
                }
            }
        } while (matches && previousString !== str);

        return {
            newString: str
        };
    };

    let _resolveLinks = function(str: string) {
        return replaceLinkTag(str).newString;
    };

    return {
        resolveLinks: _resolveLinks
    };
})();
