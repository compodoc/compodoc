import * as path from 'node:path';

import type { CosmiconfigResult } from 'cosmiconfig';
import { cosmiconfigSync } from 'cosmiconfig';

import type { ConfigurationFileInterface } from '../interfaces/configuration-file.interface';
import type { MainDataInterface } from '../interfaces/main-data.interface';
import { COMPODOC_DEFAULTS } from '../../utils/defaults';
import { logger } from '../../utils/logger';

const cosmiconfigModuleName = 'compodoc';

export type CliConfigurationFile = Partial<ConfigurationFileInterface> & Record<string, any>;

export type ProgramOptions = Record<string, any>;

export interface LoadedCliConfiguration {
    configFile: CliConfigurationFile;
    configExplorerResult: CosmiconfigResult | null;
}

export interface CliFilePatterns {
    scannedFiles: any[];
    excludeFiles: any[];
    includeFiles: any[];
}

export function loadCliConfiguration(
    configPath: string | undefined,
    workingDirectory: string
): LoadedCliConfiguration {
    const configExplorer = cosmiconfigSync(cosmiconfigModuleName);
    let configExplorerResult: CosmiconfigResult | null;

    if (configPath) {
        let normalizedConfigPath = configPath;
        const matchesWorkingDirectory = normalizedConfigPath.match(workingDirectory);

        if (matchesWorkingDirectory && matchesWorkingDirectory.length > 0) {
            normalizedConfigPath = normalizedConfigPath.replace(workingDirectory + path.sep, '');
        }

        configExplorerResult = configExplorer.load(path.resolve(normalizedConfigPath));
    } else {
        configExplorerResult = configExplorer.search();
    }

    return {
        configFile: configExplorerResult?.config ?? {},
        configExplorerResult
    };
}

export function normalizePatternList(patterns: unknown): string[] {
    if (!patterns) {
        return [];
    }

    const values = Array.isArray(patterns) ? patterns : String(patterns).split(',');

    return values.map(pattern => String(pattern).trim()).filter(pattern => pattern.length > 0);
}

export function applyCliConfiguration(
    mainData: MainDataInterface,
    configFile: CliConfigurationFile,
    programOptions: ProgramOptions,
    filePatterns: CliFilePatterns
): CliFilePatterns {
    const nextFilePatterns = { ...filePatterns };

    if (configFile.output) {
        mainData.output = configFile.output;
        mainData.outputProvided = true;
    }
    if (programOptions.output && programOptions.output !== COMPODOC_DEFAULTS.folder) {
        mainData.output = programOptions.output;
        mainData.outputProvided = true;
    }

    if (configFile.extTheme) {
        mainData.extTheme = configFile.extTheme;
    }
    if (programOptions.extTheme) {
        mainData.extTheme = programOptions.extTheme;
    }

    if (configFile.language) {
        mainData.language = configFile.language;
    }
    if (programOptions.language) {
        mainData.language = programOptions.language;
    }

    if (configFile.theme) {
        mainData.theme = configFile.theme;
    }
    if (programOptions.theme) {
        mainData.theme = programOptions.theme;
    }

    if (configFile.name) {
        mainData.documentationMainName = configFile.name;
    }
    if (programOptions.name && programOptions.name !== COMPODOC_DEFAULTS.title) {
        mainData.documentationMainName = programOptions.name;
    }

    if (configFile.assetsFolder) {
        mainData.assetsFolder = configFile.assetsFolder;
    }
    if (programOptions.assetsFolder) {
        mainData.assetsFolder = programOptions.assetsFolder;
    }

    if (configFile.open) {
        mainData.open = configFile.open;
    }
    if (programOptions.open) {
        mainData.open = programOptions.open;
    }

    if (configFile.toggleMenuItems) {
        mainData.toggleMenuItems = configFile.toggleMenuItems;
    }
    if (
        programOptions.toggleMenuItems &&
        programOptions.toggleMenuItems !== COMPODOC_DEFAULTS.toggleMenuItems
    ) {
        mainData.toggleMenuItems = programOptions.toggleMenuItems;
    }

    if (configFile.templates) {
        mainData.templates = configFile.templates;
    }
    if (programOptions.templates) {
        mainData.templates = programOptions.templates;
    }

    if (configFile.navTabConfig) {
        mainData.navTabConfig = configFile.navTabConfig;
    }
    if (
        programOptions.navTabConfig &&
        JSON.parse(programOptions.navTabConfig).length !== COMPODOC_DEFAULTS.navTabConfig.length
    ) {
        mainData.navTabConfig = JSON.parse(programOptions.navTabConfig);
    }

    if (configFile.includes) {
        mainData.includes = configFile.includes;
    }
    if (programOptions.includes) {
        mainData.includes = programOptions.includes;
    }

    if (configFile.includesName) {
        mainData.includesName = configFile.includesName;
    }
    if (
        programOptions.includesName &&
        programOptions.includesName !== COMPODOC_DEFAULTS.additionalEntryName
    ) {
        mainData.includesName = programOptions.includesName;
    }

    if (configFile.silent) {
        logger.silent = false;
    }
    if (programOptions.silent) {
        logger.silent = false;
    }

    if (configFile.serve) {
        mainData.serve = configFile.serve;
    }
    if (programOptions.serve) {
        mainData.serve = programOptions.serve;
    }

    if (configFile.templatePlayground) {
        mainData.templatePlayground = configFile.templatePlayground;
    }
    if (programOptions.templatePlayground) {
        mainData.templatePlayground = programOptions.templatePlayground;
    }

    if (configFile.host) {
        mainData.host = configFile.host;
        mainData.hostname = configFile.host;
    }
    if (programOptions.host) {
        mainData.host = programOptions.host;
        mainData.hostname = programOptions.host;
    }

    if (configFile.port) {
        mainData.port = configFile.port;
    }
    if (programOptions.port && programOptions.port !== COMPODOC_DEFAULTS.port) {
        mainData.port = programOptions.port;
    }

    if (configFile.watch) {
        mainData.watch = configFile.watch;
    }
    if (programOptions.watch) {
        mainData.watch = programOptions.watch;
    }

    if (configFile.exportFormat) {
        mainData.exportFormat = configFile.exportFormat;
    }
    if (
        programOptions.exportFormat &&
        programOptions.exportFormat !== COMPODOC_DEFAULTS.exportFormat
    ) {
        mainData.exportFormat = programOptions.exportFormat;
    }

    if (configFile.hideGenerator) {
        mainData.hideGenerator = configFile.hideGenerator;
    }
    if (programOptions.hideGenerator) {
        mainData.hideGenerator = programOptions.hideGenerator;
    }

    if (configFile.hideDarkModeToggle) {
        mainData.hideDarkModeToggle = configFile.hideDarkModeToggle;
    }
    if (programOptions.hideDarkModeToggle) {
        mainData.hideDarkModeToggle = programOptions.hideDarkModeToggle;
    }

    if (configFile.coverageTest) {
        mainData.coverageTest = true;
        mainData.coverageTestThreshold =
            typeof configFile.coverageTest === 'string'
                ? parseInt(configFile.coverageTest, 10)
                : COMPODOC_DEFAULTS.defaultCoverageThreshold;
    }
    if (programOptions.coverageTest) {
        mainData.coverageTest = true;
        mainData.coverageTestThreshold =
            typeof programOptions.coverageTest === 'string'
                ? parseInt(programOptions.coverageTest, 10)
                : COMPODOC_DEFAULTS.defaultCoverageThreshold;
    }

    if (configFile.coverageMinimumPerFile) {
        mainData.coverageTestPerFile = true;
        mainData.coverageMinimumPerFile =
            typeof configFile.coverageMinimumPerFile === 'string'
                ? parseInt(configFile.coverageMinimumPerFile, 10)
                : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
    }
    if (programOptions.coverageMinimumPerFile) {
        mainData.coverageTestPerFile = true;
        mainData.coverageMinimumPerFile =
            typeof programOptions.coverageMinimumPerFile === 'string'
                ? parseInt(programOptions.coverageMinimumPerFile, 10)
                : COMPODOC_DEFAULTS.defaultCoverageMinimumPerFile;
    }

    if (configFile.coverageExclude) {
        mainData.coverageExclude = normalizePatternList(configFile.coverageExclude);
    }
    if (programOptions.coverageExclude) {
        mainData.coverageExclude = normalizePatternList(programOptions.coverageExclude);
    }

    if (configFile.coverageTestThresholdFail) {
        mainData.coverageTestThresholdFail = configFile.coverageTestThresholdFail !== 'false';
    }
    if (programOptions.coverageTestThresholdFail) {
        mainData.coverageTestThresholdFail = programOptions.coverageTestThresholdFail !== 'false';
    }

    if (configFile.coverageTestShowOnlyFailed) {
        mainData.coverageTestShowOnlyFailed = configFile.coverageTestShowOnlyFailed;
    }
    if (programOptions.coverageTestShowOnlyFailed) {
        mainData.coverageTestShowOnlyFailed = programOptions.coverageTestShowOnlyFailed;
    }

    if (configFile.unitTestCoverage) {
        mainData.unitTestCoverage = configFile.unitTestCoverage;
    }
    if (programOptions.unitTestCoverage) {
        mainData.unitTestCoverage = programOptions.unitTestCoverage;
    }

    if (configFile.disableSourceCode) {
        mainData.disableSourceCode = configFile.disableSourceCode;
    }
    if (programOptions.disableSourceCode) {
        mainData.disableSourceCode = programOptions.disableSourceCode;
    }

    if (configFile.disableDomTree) {
        mainData.disableDomTree = configFile.disableDomTree;
    }
    if (programOptions.disableDomTree) {
        mainData.disableDomTree = programOptions.disableDomTree;
    }

    if (configFile.disableTemplateTab) {
        mainData.disableTemplateTab = configFile.disableTemplateTab;
    }
    if (programOptions.disableTemplateTab) {
        mainData.disableTemplateTab = programOptions.disableTemplateTab;
    }

    if (configFile.disableStyleTab) {
        mainData.disableStyleTab = configFile.disableStyleTab;
    }
    if (programOptions.disableStyleTab) {
        mainData.disableStyleTab = programOptions.disableStyleTab;
    }

    if (configFile.disableGraph) {
        mainData.disableGraph = configFile.disableGraph;
    }
    if (programOptions.disableGraph) {
        mainData.disableGraph = programOptions.disableGraph;
    }

    if (configFile.disableCoverage) {
        mainData.disableCoverage = configFile.disableCoverage;
    }
    if (programOptions.disableCoverage) {
        mainData.disableCoverage = programOptions.disableCoverage;
    }

    if (configFile.disablePrivate) {
        mainData.disablePrivate = configFile.disablePrivate;
    }
    if (programOptions.disablePrivate) {
        mainData.disablePrivate = programOptions.disablePrivate;
    }

    if (configFile.disableProtected) {
        mainData.disableProtected = configFile.disableProtected;
    }
    if (programOptions.disableProtected) {
        mainData.disableProtected = programOptions.disableProtected;
    }

    if (configFile.disableInternal) {
        mainData.disableInternal = configFile.disableInternal;
    }
    if (programOptions.disableInternal) {
        mainData.disableInternal = programOptions.disableInternal;
    }

    if (configFile.disableLifeCycleHooks) {
        mainData.disableLifeCycleHooks = configFile.disableLifeCycleHooks;
    }
    if (programOptions.disableLifeCycleHooks) {
        mainData.disableLifeCycleHooks = programOptions.disableLifeCycleHooks;
    }

    if (configFile.disableConstructors) {
        mainData.disableConstructors = configFile.disableConstructors;
    }
    if (programOptions.disableConstructors) {
        mainData.disableConstructors = programOptions.disableConstructors;
    }

    if (configFile.disableRoutesGraph) {
        mainData.disableRoutesGraph = configFile.disableRoutesGraph;
    }
    if (programOptions.disableRoutesGraph) {
        mainData.disableRoutesGraph = programOptions.disableRoutesGraph;
    }

    if (configFile.disableSearch) {
        mainData.disableSearch = configFile.disableSearch;
    }
    if (programOptions.disableSearch) {
        mainData.disableSearch = programOptions.disableSearch;
    }

    if (configFile.disableDependencies) {
        mainData.disableDependencies = configFile.disableDependencies;
    }
    if (programOptions.disableDependencies) {
        mainData.disableDependencies = programOptions.disableDependencies;
    }

    if (configFile.disableProperties) {
        mainData.disableProperties = configFile.disableProperties;
    }
    if (programOptions.disableProperties) {
        mainData.disableProperties = programOptions.disableProperties;
    }

    if (configFile.disableFilePath) {
        mainData.disableFilePath = configFile.disableFilePath;
    }
    if (programOptions.disableFilePath) {
        mainData.disableFilePath = programOptions.disableFilePath;
    }

    if (configFile.disableOverview) {
        mainData.disableOverview = configFile.disableOverview;
    }
    if (programOptions.disableOverview) {
        mainData.disableOverview = programOptions.disableOverview;
    }

    if (configFile.minimal) {
        mainData.disableSearch = true;
        mainData.disableRoutesGraph = true;
        mainData.disableGraph = true;
        mainData.disableCoverage = true;
    }
    if (programOptions.minimal) {
        mainData.disableSearch = true;
        mainData.disableRoutesGraph = true;
        mainData.disableGraph = true;
        mainData.disableCoverage = true;
    }

    if (mainData.coverageTest || mainData.coverageTestPerFile) {
        mainData.disableCoverage = false;
    }

    if (configFile.customFavicon) {
        mainData.customFavicon = configFile.customFavicon;
    }
    if (programOptions.customFavicon) {
        mainData.customFavicon = programOptions.customFavicon;
    }

    if (configFile.customLogo) {
        mainData.customLogo = configFile.customLogo;
    }
    if (programOptions.customLogo) {
        mainData.customLogo = programOptions.customLogo;
    }

    if (configFile.gaID) {
        mainData.gaID = configFile.gaID;
    }
    if (programOptions.gaID) {
        mainData.gaID = programOptions.gaID;
    }

    if (configFile.gaSite) {
        mainData.gaSite = configFile.gaSite;
    }
    if (programOptions.gaSite && programOptions.gaSite !== COMPODOC_DEFAULTS.gaSite) {
        mainData.gaSite = programOptions.gaSite;
    }

    if (configFile.publicApiOnly) {
        mainData.publicApiOnly = configFile.publicApiOnly;
    }
    if (programOptions.publicApiOnly) {
        mainData.publicApiOnly = programOptions.publicApiOnly;
    }

    if (configFile.tsconfig) {
        mainData.tsconfig = configFile.tsconfig;
    }
    if (programOptions.tsconfig) {
        mainData.tsconfig = programOptions.tsconfig;
    }

    if (programOptions.maxSearchResults) {
        mainData.maxSearchResults = programOptions.maxSearchResults;
    }

    if (configFile.files) {
        nextFilePatterns.scannedFiles = configFile.files;
    }
    if (configFile.exclude) {
        nextFilePatterns.excludeFiles = configFile.exclude;
    }
    if (configFile.include) {
        nextFilePatterns.includeFiles = configFile.include;
    }

    return nextFilePatterns;
}
