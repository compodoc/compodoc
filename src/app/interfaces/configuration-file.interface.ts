export interface ConfigurationFileInterface {
    output: string;
    extTheme: string;
    language: string;
    theme: string;
    name: string;
    assetsFolder: string;
    open: boolean;
    toggleMenuItems;
    templates: string;
    navTabConfig;
    includes;
    includesName: string;
    silent: boolean;
    serve;
    host: string;
    port: number;
    watch: boolean;
    exportFormat: string;
    hideGenerator: boolean;
    coverageTest: number;
    coverageMinimumPerFile: number;
    coverageTestThresholdFail: string;
    coverageTestShowOnlyFailed: boolean;
    unitTestCoverage: string;
    disableSourceCode: boolean;
    disableDomTree: boolean;
    disableTemplateTab: boolean;
    disableStyleTab: boolean;
    disableGraph: boolean;
    disableCoverage: boolean;
    disablePrivate: boolean;
    disableProtected: boolean;
    disableInternal: boolean;
    disableLifeCycleHooks: boolean;
    disableRoutesGraph: boolean;
    disableSearch: boolean;
    disableDependencies: boolean;
    minimal: boolean;
    customFavicon: string;
    customLogo: string;
    gaID: string;
    gaSite: string;
    tsconfig: string;
    files;
    exclude;
    include;
    markdownsPath: string;
}
