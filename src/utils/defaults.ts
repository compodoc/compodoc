export const COMPODOC_DEFAULTS = {
    title: 'Application documentation',
    additionalEntryName: 'Additional documentation',
    additionalEntryPath: 'additional-documentation',
    folder: './documentation/',
    port: 8080,
    theme: 'gitbook',
    exportFormat: 'html',
    exportFormatsSupported: ['html', 'json'],
    base: '/',
    defaultCoverageThreshold: 70,
    defaultCoverageMinimumPerFile: 0,
    coverageTestThresholdFail: true,
    toggleMenuItems: ['all'],
    disableSourceCode: false,
    disableGraph: false,
    disableMainGraph: false,
    disableCoverage: false,
    disablePrivate: false,
    disableProtected: false,
    disableInternal: false,
    disableLifeCycleHooks: false,
    PAGE_TYPES: {
        ROOT: 'root',
        INTERNAL: 'internal'
    },
    gaSite: 'auto'
};


/**
 * Max length for the string of a file during Lunr search engine indexing.
 * Prevent stack size exceeded
 */
export const MAX_SIZE_FILE_SEARCH_INDEX = 15000;