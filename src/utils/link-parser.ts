import { $dependenciesEngine } from '../app/engines/dependencies.engine';

export function extractLeadingText(string, completeTag) {
    var tagIndex = string.indexOf(completeTag);
    var leadingText = null;
    var leadingTextRegExp = /\[(.+?)\]/g;
    var leadingTextInfo = leadingTextRegExp.exec(string);

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
    var linkText;
    var target;
    var splitIndex;

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

    var processTheLink = function(string, tagInfo) {
        var leading = extractLeadingText(string, tagInfo.completeTag),
            linkText = leading.leadingText || '',
            split,
            target,
            stringtoReplace;

        split = splitLinkText(tagInfo.text);
        target = split.target;

        if (leading.leadingText !== null) {
            stringtoReplace = '[' + leading.leadingText + ']' + tagInfo.completeTag;
        } else if (typeof split.linkText !== 'undefined') {
            stringtoReplace = tagInfo.completeTag;
            linkText = split.linkText;
        }

        return string.replace(stringtoReplace, '[' + linkText + '](' + target + ')');
    }

    /**
     * Convert
     * {@link http://www.google.com|Google} or {@link https://github.com GitHub} to [Github](https://github.com)
     */

    var replaceLinkTag = function(str: string) {

        var tagRegExp = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i'),
            matches,
            previousString,
            tagInfo = [];

        function replaceMatch(replacer, tag, match, text) {
            var matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);

            return replacer(str, matchedTag);
        }

        do {
            matches = tagRegExp.exec(str);
            if (matches) {
                previousString = str;
                str = replaceMatch(processTheLink, 'link', matches[0], matches[1]);
            }
        } while (matches && previousString !== str);

        return {
            newString: str
        };
    }

    var _resolveLinks = function(str: string) {
        return replaceLinkTag(str).newString;
    }

    return {
        resolveLinks: _resolveLinks
    }
})();
