export const COMPODOC_CONSTANTS = {
    navTabDefinitions: [
        {
            id: 'info',
            href: '#info',
            'data-link': 'info',
            label: 'Info',
            depTypes: ['all']
        },
        {
            id: 'readme',
            href: '#readme',
            'data-link': 'readme',
            label: 'README',
            depTypes: ['all']
        },
        {
            id: 'source',
            href: '#source',
            'data-link': 'source',
            label: 'Source',
            depTypes: ['all']
        },
        {
            id: 'templateData',
            href: '#templateData',
            'data-link': 'template',
            label: 'Template',
            depTypes: ['component']
        },
        {
            id: 'styleData',
            href: '#styleData',
            'data-link': 'style',
            label: 'Styles',
            depTypes: ['component']
        },
        {
            id: 'tree',
            href: '#tree',
            'data-link': 'dom-tree',
            label: 'DOM Tree',
            depTypes: ['component']
        },
        {
            id: 'example',
            href: '#example',
            'data-link': 'example',
            label: 'Examples',
            depTypes: ['component', 'directive', 'injectable', 'pipe']
        }
    ]
};

/**
 * Max length for the string of a file during Lunr search engine indexing.
 * Prevent stack size exceeded
 */
export const MAX_SIZE_FILE_SEARCH_INDEX = 50000;

/**
 * Max length for the string of a file during cheerio parsing.
 * Prevent stack size exceeded
 */
export const MAX_SIZE_FILE_CHEERIO_PARSING = 400000000;
