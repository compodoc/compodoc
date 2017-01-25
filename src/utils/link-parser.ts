var util = require('util');

var hasOwnProp = Object.prototype.hasOwnProperty;

export let LinkParser = (function() {

    function regExpFactory(tagName, prefix, suffix) {
        console.log('regExpFactory: ', tagName, prefix, suffix);
        tagName = tagName || '\\S+';
        prefix = prefix || '';
        suffix = suffix || '';

        return new RegExp(prefix + '\\{@' + tagName + '\\s+((?:.|\n)+?)\\}' + suffix, 'i');
    }

    function replaceInlineTags(string, replacers) {
        var tagInfo = [];

        function replaceMatch(replacer, tag, match, text) {
            var matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);

            return replacer(string, matchedTag);
        }

        string = string || '';

        Object.keys(replacers).forEach(function(replacer) {
            var tagRegExp = regExpFactory(replacer);
            console.log('tagRegExp: ', tagRegExp);
            var matches;
            var previousString;

            console.log('replacer: ', replacer);

            // call the replacer once for each match
            do {
                matches = tagRegExp.exec(string);
                if (matches) {
                    previousString = string;
                    console.log(replacers[replacer], replacer, matches[0], matches[1]);
                    string = replaceMatch(replacers[replacer], replacer, matches[0], matches[1]);
                }
            } while (matches && previousString !== string);
        });

        return {
            tags: tagInfo,
            newString: string.trim()
        };
    }

    function extractLeadingText(string, completeTag) {
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

    function hasUrlPrefix(text) {
        return (/^(http|ftp)s?:\/\//).test(text);
    }

    function splitLinkText(text) {
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

    function fragmentHash(fragmentId) {
        if (!fragmentId) {
            return '';
        }

        return '#' + fragmentId;
    }

    function isComplexTypeExpression(expr) {
        // record types, type unions, and type applications all count as "complex"
        return /^{.+}$/.test(expr) || /^.+\|.+$/.test(expr) || /^.+<.+>$/.test(expr);
    }

    function parseType(longname) {
        var err;

        try {
            return catharsis.parse(longname, {jsdoc: true});
        }
        catch (e) {
            err = new Error('unable to parse ' + longname + ': ' + e.message);
            require('jsdoc/util/logger').error(err);
            return longname;
        }
    }

    function stringifyType(parsedType, cssClass, stringifyLinkMap) {
        return require('catharsis').stringify(parsedType, {
            cssClass: cssClass,
            htmlSafe: true,
            links: stringifyLinkMap
        });
    }

    function buildLink(longname, linkText, options) {
        console.log('buildLink: ', longname, linkText, options);
        var classString = options.cssClass ? util.format(' class="%s"', options.cssClass) : '';
        var fileUrl;
        var fragmentString = fragmentHash(options.fragmentId);
        var stripped;
        var text;

        var parsedType;

        console.log('debug buildLikn');

        // handle cases like:
        // @see <http://example.org>
        // @see http://example.org
        stripped = longname ? longname.replace(/^<|>$/g, '') : '';
        if ( hasUrlPrefix(stripped) ) {
            console.log('debug buildLikn if');
            fileUrl = stripped;
            text = linkText || stripped;
        }
        // handle complex type expressions that may require multiple links
        // (but skip anything that looks like an inline tag or HTML tag)
        else if (longname && isComplexTypeExpression(longname) && /\{\@.+\}/.test(longname) === false &&
            /^<[\s\S]+>/.test(longname) === false) {
                console.log('debug buildLikn else if');
            parsedType = parseType(longname);
            return stringifyType(parsedType, options.cssClass, options.linkMap);
        }
        else {
            console.log('debug buildLikn else');
            fileUrl = hasOwnProp.call(options.linkMap, longname) ? options.linkMap[longname] : '';
            text = linkText || longname;
        }

        console.log('debug buildLikn after if else');

        text = options.monospace ? '<code>' + text + '</code>' : text;

        if (!fileUrl) {
            return text;
        }
        else {
            return util.format('<a href="%s"%s>%s</a>', encodeURI(fileUrl + fragmentString),
                classString, text);
        }
    }

    function processLink(string, tagInfo) {
        console.log('processLink: ', string, tagInfo);
        var leading = extractLeadingText(string, tagInfo.completeTag);
        console.log('leading: ', leading);
        var linkText = leading.leadingText || '';
        var split;
        var target;
        string = leading.string;

        console.log('debug 1');

        split = splitLinkText(tagInfo.text);

        console.log('debug 2');

        console.log('split: ', split);

        target = split.target;
        linkText = linkText || split.linkText;

        console.log('debug 3: ', tagInfo.completeTag);
        console.log('target: ', target);
        console.log('linkText: ', linkText);
        console.log('longnameToUrl: ', 'longnameToUrl');

        return string.replace(tagInfo.completeTag, buildLink(target, linkText, {
            linkMap: '',
            monospace: false
        }));
    }

    var processTheLink = function(string, tagInfo) {
        console.log('processTheLink: ', string, tagInfo);
    }

    var replaceLinkTag = function(str: string) {

        console.log('replaceLinkTag: ', str);

        var tagRegExp = new RegExp('\\{@link\\s+((?:.|\n)+?)\\}', 'i');

        var matches;
        var previousString;

        var tagInfo = [];

        function replaceMatch(replacer, tag, match, text) {
            var matchedTag = {
                completeTag: match,
                tag: tag,
                text: text
            };
            tagInfo.push(matchedTag);

            return replacer(string, matchedTag);
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
        console.log('_resolveLinks: ', str);
        var replacers = {
           link: processLink
        };
        //return replaceInlineTags(str, replacers).newString;
        //console.log(replaceLinkTag(str).newString);
        return str;
    }

    return {
        resolveLinks: _resolveLinks
    }
})();
