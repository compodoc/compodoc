const https = require('https');
const http = require('http');
const fs = require('fs');

const API_LIST_URL =
    process.env.ANGULAR_API_LIST_URL || 'https://angular.dev/api';
const OUTPUT_PATH = 'src/data/api-list.json';
const DOC_TYPE_MAP = {
    constant: 'const',
    initializer_api_function: 'function',
    ng_module: 'ngmodule',
    type_alias: 'type-alias',
    undecorated_class: 'class'
};

function download(url) {
    const client = url.startsWith('http:') ? http : https;

    client
        .get(url, res => {
            // Follow redirects if endpoint changes.
            if (
                res.statusCode &&
                res.statusCode >= 300 &&
                res.statusCode < 400 &&
                res.headers.location
            ) {
                return download(new URL(res.headers.location, url).toString());
            }

            if (res.statusCode !== 200) {
                console.error(`Download failed with status ${res.statusCode} for ${url}`);
                res.resume();
                process.exitCode = 1;
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                try {
                    const body = Buffer.concat(chunks).toString('utf8');
                    const apiList = parseApiList(body);

                    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(apiList, null, 2) + '\n', 'utf8');
                    console.log(`Download ok (${OUTPUT_PATH})`);
                } catch (error) {
                    console.error(`Invalid API list received from ${url}`);
                    console.error(error);
                    process.exitCode = 1;
                }
            });
        })
        .on('error', error => {
            console.error(error);
            process.exitCode = 1;
        });
}

function parseApiList(body) {
    try {
        return JSON.parse(body);
    } catch (error) {
        return parseAngularDevApiList(body);
    }
}

function parseAngularDevApiList(html) {
    const sections = [];
    const sectionRegex = /<adev-api-items-section\b[\s\S]*?<\/adev-api-items-section>/g;
    let sectionMatch;

    while ((sectionMatch = sectionRegex.exec(html))) {
        const sectionHtml = sectionMatch[0];
        const items = parseAngularDevApiItems(sectionHtml);

        if (items.length === 0) {
            continue;
        }

        const barrel = getBarrelFromItems(items);
        const title = getSectionTitle(sectionHtml) || barrel;

        sections.push({
            name: barrel,
            title,
            path: `api/${barrel}`,
            items
        });
    }

    if (sections.length === 0) {
        throw new Error('No Angular API sections found in HTML response');
    }

    return sections;
}

function parseAngularDevApiItems(sectionHtml) {
    const items = [];
    const itemRegex =
        /<li\b[\s\S]*?<a\b[^>]*class="[^"]*\badev-api-items-section-item\b[^"]*"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<docs-api-item-label\b[^>]*class="[^"]*\btype-([^"\s]+)[^"]*"[^>]*>[\s\S]*?<\/docs-api-item-label>[\s\S]*?<span\b[^>]*class="[^"]*\badev-item-title\b[^"]*"[^>]*title="([^"]*)"[^>]*>[\s\S]*?<\/span>[\s\S]*?<\/li>/g;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(sectionHtml))) {
        const [, rawPath, rawDocType, rawTitle] = itemMatch;
        const itemHtml = itemMatch[0];
        const title = decodeHtml(rawTitle);

        items.push({
            name: title.toLowerCase(),
            title,
            path: rawPath.replace(/^\//, ''),
            docType: DOC_TYPE_MAP[rawDocType] || rawDocType,
            stability: getStability(itemHtml),
            securityRisk: false,
            developerPreview: itemHtml.includes('adev-dev-preview')
        });
    }

    return items;
}

function getBarrelFromItems(items) {
    const firstPath = items[0].path;
    const parts = firstPath.split('/');

    return parts.slice(1, -1).join('/');
}

function getSectionTitle(sectionHtml) {
    const titleMatch = sectionHtml.match(/class="[^"]*\badev-api-anchor\b[^"]*"[^>]*>([\s\S]*?)<\/a>/);

    return titleMatch ? decodeHtml(stripHtml(titleMatch[1])).trim() : '';
}

function getStability(itemHtml) {
    if (itemHtml.includes('adev-deprecated')) {
        return 'deprecated';
    }

    if (itemHtml.includes('adev-experimental')) {
        return 'experimental';
    }

    return 'stable';
}

function stripHtml(value) {
    return value.replace(/<[^>]+>/g, '');
}

function decodeHtml(value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

download(API_LIST_URL);
