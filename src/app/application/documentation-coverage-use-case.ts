import * as _ from 'lodash';

import { SyntaxKind } from 'ts-morph';

import { logger } from '../../utils/logger';
import Configuration from '../configuration';
import HtmlEngine from '../engines/html.engine';
import { COMPODOC_DEFAULTS } from '../../utils/defaults';

type GenerationPromiseResolve = (value: boolean | PromiseLike<boolean>) => void;
type GenerationPromiseReject = (reason?: any) => void;

export class DocumentationCoverageUseCase {
    constructor(
        private readonly generationPromiseResolve: GenerationPromiseResolve,
        private readonly generationPromiseReject: GenerationPromiseReject
    ) {}

    public execute(): Promise<boolean> {
        logger.info('Process documentation coverage report');

        return new Promise((resolve, reject) => {
            /*
             * loop with components, directives, controllers, entities, classes, injectables, interfaces, pipes, guards, misc functions variables
             */
            let files: any[] = [];
            let totalProjectStatementDocumented = 0;
            const coverageExcludePatterns = Configuration.mainData.coverageExclude || [];

            const toUnixPath = (filePath: string): string => (filePath || '').replace(/\\/g, '/');

            const escapeRegex = (value: string): string =>
                value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');

            const globToRegExp = (globPattern: string): RegExp => {
                const normalized = toUnixPath(globPattern);
                const escaped = escapeRegex(normalized)
                    .replace(/\*\*/g, '::DOUBLE_STAR::')
                    .replace(/\*/g, '[^/]*')
                    .replace(/::DOUBLE_STAR::/g, '.*');
                return new RegExp(`^${escaped}$`);
            };

            const coverageExcludeRegexes = coverageExcludePatterns
                .map((pattern: any) => String(pattern || '').trim())
                .filter((pattern: string) => pattern.length > 0)
                .map((pattern: string) => globToRegExp(pattern));

            const hasCoverageIgnoredTag = (tags: any): boolean => {
                if (!tags || !Array.isArray(tags)) {
                    return false;
                }

                return tags.some((tag: any) => {
                    if (!tag) {
                        return false;
                    }

                    const explicitTagName =
                        tag.tagName?.text ||
                        tag.tagName?.escapedText ||
                        tag.tagName ||
                        tag.name?.text ||
                        tag.name ||
                        '';

                    if (explicitTagName) {
                        return String(explicitTagName).toLowerCase() === 'coverageignore';
                    }

                    if (typeof tag === 'string') {
                        return tag.toLowerCase().indexOf('coverageignore') > -1;
                    }

                    if (typeof tag.label === 'string') {
                        return tag.label.toLowerCase().indexOf('coverageignore') > -1;
                    }

                    return false;
                });
            };

            const isCoverageIgnoredElement = (element: any): boolean => {
                if (!element) {
                    return false;
                }

                if (element.coverageIgnore === true) {
                    return true;
                }

                if (hasCoverageIgnoredTag(element.jsdoctags)) {
                    return true;
                }

                return false;
            };

            const isCoverageIgnoredByFile = (filePath: string): boolean => {
                if (!coverageExcludeRegexes.length || !filePath) {
                    return false;
                }

                const normalizedPath = toUnixPath(filePath);
                return coverageExcludeRegexes.some((regex: RegExp) => regex.test(normalizedPath));
            };

            const shouldSkipCoverage = (element: any): boolean => {
                if (!element) {
                    return true;
                }

                return (
                    isCoverageIgnoredByFile(element.file || element.filePath) ||
                    isCoverageIgnoredElement(element)
                );
            };
            const getStatus = function (percent: number) {
                let status;
                if (percent <= 25) {
                    status = 'low';
                } else if (percent > 25 && percent <= 50) {
                    status = 'medium';
                } else if (percent > 50 && percent <= 75) {
                    status = 'good';
                } else {
                    status = 'very-good';
                }
                return status;
            };
            const processComponentsAndDirectivesAndControllersAndEntities = (list: any) => {
                _.forEach(list, (el: any) => {
                    const element = (Object as any).assign({}, el);
                    if (shouldSkipCoverage(element)) {
                        return;
                    }
                    if (!element.propertiesClass) {
                        element.propertiesClass = [];
                    }
                    if (!element.methodsClass) {
                        element.methodsClass = [];
                    }
                    if (!element.hostBindings) {
                        element.hostBindings = [];
                    }
                    if (!element.hostListeners) {
                        element.hostListeners = [];
                    }
                    if (!element.inputsClass) {
                        element.inputsClass = [];
                    }
                    if (!element.outputsClass) {
                        element.outputsClass = [];
                    }
                    const cl: any = {
                        filePath: element.file,
                        type: element.type,
                        linktype: element.type,
                        name: element.name
                    };
                    let totalStatementDocumented = 0;
                    let totalStatements =
                        element.propertiesClass.length +
                        element.methodsClass.length +
                        element.inputsClass.length +
                        element.hostBindings.length +
                        element.hostListeners.length +
                        element.outputsClass.length +
                        1; // +1 for element decorator comment

                    if (element.constructorObj) {
                        totalStatements += 1;
                        if (
                            element.constructorObj &&
                            element.constructorObj.description &&
                            element.constructorObj.description !== ''
                        ) {
                            totalStatementDocumented += 1;
                        }
                    }
                    if (element.description && element.description !== '') {
                        totalStatementDocumented += 1;
                    }

                    _.forEach(element.propertiesClass, (property: any) => {
                        if (isCoverageIgnoredElement(property)) {
                            totalStatements -= 1;
                            return;
                        }
                        if (property.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            property.description &&
                            property.description !== '' &&
                            property.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.methodsClass, (method: any) => {
                        if (isCoverageIgnoredElement(method)) {
                            totalStatements -= 1;
                            return;
                        }
                        if (method.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            method.description &&
                            method.description !== '' &&
                            method.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.hostBindings, (property: any) => {
                        if (isCoverageIgnoredElement(property)) {
                            totalStatements -= 1;
                            return;
                        }
                        if (property.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            property.description &&
                            property.description !== '' &&
                            property.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.hostListeners, (method: any) => {
                        if (isCoverageIgnoredElement(method)) {
                            totalStatements -= 1;
                            return;
                        }
                        if (method.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            method.description &&
                            method.description !== '' &&
                            method.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.inputsClass, (input: any) => {
                        if (isCoverageIgnoredElement(input)) {
                            totalStatements -= 1;
                            return;
                        }
                        if (input.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            input.description &&
                            input.description !== '' &&
                            input.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.outputsClass, (output: any) => {
                        if (isCoverageIgnoredElement(output)) {
                            totalStatements -= 1;
                            return;
                        }
                        if (output.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            output.description &&
                            output.description !== '' &&
                            output.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });

                    cl.coveragePercent = Math.floor(
                        (totalStatementDocumented / totalStatements) * 100
                    );
                    if (totalStatements === 0) {
                        cl.coveragePercent = 0;
                    }
                    cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                    cl.status = getStatus(cl.coveragePercent);
                    totalProjectStatementDocumented += cl.coveragePercent;
                    files.push(cl);
                });
            };
            let processCoveragePerFile = () => {
                logger.info('Process documentation coverage per file');
                logger.info('-------------------');

                let overFiles = files.filter((f: any) => {
                    let overTest =
                        f.coveragePercent >= Configuration.mainData.coverageMinimumPerFile;
                    if (overTest && !Configuration.mainData.coverageTestShowOnlyFailed) {
                        logger.info(
                            `${f.coveragePercent} % for file ${f.filePath} - ${f.name} - over minimum per file`
                        );
                    }
                    return overTest;
                });
                let underFiles = files.filter((f: any) => {
                    let underTest =
                        f.coveragePercent < Configuration.mainData.coverageMinimumPerFile;
                    if (underTest) {
                        logger.error(
                            `${f.coveragePercent} % for file ${f.filePath} - ${f.name} - under minimum per file`
                        );
                    }
                    return underTest;
                });

                logger.info('-------------------');
                return {
                    overFiles: overFiles,
                    underFiles: underFiles
                };
            };
            let processFunctionsAndVariables = (id: any, type: any) => {
                _.forEach(id, (el: any) => {
                    if (shouldSkipCoverage(el)) {
                        return;
                    }
                    let cl: any = {
                        filePath: el.file,
                        type: type,
                        linktype: el.type,
                        linksubtype: el.subtype,
                        name: el.name
                    };
                    if (type === 'variable' || type === 'function' || type === 'type alias') {
                        cl.linktype = 'miscellaneous';
                    }
                    let totalStatementDocumented = 0;
                    let totalStatements = 1;

                    if (el.modifierKind === SyntaxKind.PrivateKeyword) {
                        // Doesn't handle private for coverage
                        totalStatements -= 1;
                    }
                    if (
                        el.description &&
                        el.description !== '' &&
                        el.modifierKind !== SyntaxKind.PrivateKeyword
                    ) {
                        totalStatementDocumented += 1;
                    }

                    cl.coveragePercent = Math.floor(
                        (totalStatementDocumented / totalStatements) * 100
                    );
                    cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                    cl.status = getStatus(cl.coveragePercent);
                    totalProjectStatementDocumented += cl.coveragePercent;
                    files.push(cl);
                });
            };

            let processClasses = (list: any, type: any, linktype: any) => {
                _.forEach(list, (cl: any) => {
                    let element = (Object as any).assign({}, cl);
                    if (shouldSkipCoverage(element)) {
                        return;
                    }
                    if (!element.properties) {
                        element.properties = [];
                    }
                    if (!element.methods) {
                        element.methods = [];
                    }
                    let cla: any = {
                        filePath: element.file,
                        type: type,
                        linktype: linktype,
                        name: element.name
                    };
                    let totalStatementDocumented = 0;
                    let totalStatements = element.properties.length + element.methods.length + 1; // +1 for element itself

                    if (element.constructorObj) {
                        totalStatements += 1;
                        if (
                            element.constructorObj &&
                            element.constructorObj.description &&
                            element.constructorObj.description !== ''
                        ) {
                            totalStatementDocumented += 1;
                        }
                    }
                    if (element.description && element.description !== '') {
                        totalStatementDocumented += 1;
                    }

                    _.forEach(element.properties, (property: any) => {
                        if (isCoverageIgnoredElement(property)) {
                            totalStatements -= 1;
                            return;
                        }
                        if (property.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            property.description &&
                            property.description !== '' &&
                            property.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });
                    _.forEach(element.methods, (method: any) => {
                        if (isCoverageIgnoredElement(method)) {
                            totalStatements -= 1;
                            return;
                        }
                        if (method.modifierKind === SyntaxKind.PrivateKeyword) {
                            // Doesn't handle private for coverage
                            totalStatements -= 1;
                        }
                        if (
                            method.description &&
                            method.description !== '' &&
                            method.modifierKind !== SyntaxKind.PrivateKeyword
                        ) {
                            totalStatementDocumented += 1;
                        }
                    });

                    cla.coveragePercent = Math.floor(
                        (totalStatementDocumented / totalStatements) * 100
                    );
                    if (totalStatements === 0) {
                        cla.coveragePercent = 0;
                    }
                    cla.coverageCount = totalStatementDocumented + '/' + totalStatements;
                    cla.status = getStatus(cla.coveragePercent);
                    totalProjectStatementDocumented += cla.coveragePercent;
                    files.push(cla);
                });
            };

            processComponentsAndDirectivesAndControllersAndEntities(
                Configuration.mainData.components
            );
            processComponentsAndDirectivesAndControllersAndEntities(
                Configuration.mainData.directives
            );
            processComponentsAndDirectivesAndControllersAndEntities(
                Configuration.mainData.controllers
            );
            processComponentsAndDirectivesAndControllersAndEntities(
                Configuration.mainData.entities
            );

            processClasses(Configuration.mainData.classes, 'class', 'classe');
            processClasses(Configuration.mainData.injectables, 'injectable', 'injectable');
            processClasses(Configuration.mainData.interfaces, 'interface', 'interface');
            processClasses(Configuration.mainData.guards, 'guard', 'guard');
            processClasses(Configuration.mainData.interceptors, 'interceptor', 'interceptor');

            _.forEach(Configuration.mainData.pipes, (pipe: any) => {
                if (shouldSkipCoverage(pipe)) {
                    return;
                }
                let cl: any = {
                    filePath: pipe.file,
                    type: pipe.type,
                    linktype: pipe.type,
                    name: pipe.name
                };
                let totalStatementDocumented = 0;
                let totalStatements = 1;
                if (pipe.description && pipe.description !== '') {
                    totalStatementDocumented += 1;
                }

                cl.coveragePercent = Math.floor((totalStatementDocumented / totalStatements) * 100);
                cl.coverageCount = totalStatementDocumented + '/' + totalStatements;
                cl.status = getStatus(cl.coveragePercent);
                totalProjectStatementDocumented += cl.coveragePercent;
                files.push(cl);
            });

            processFunctionsAndVariables(
                Configuration.mainData.miscellaneous.functions,
                'function'
            );
            processFunctionsAndVariables(
                Configuration.mainData.miscellaneous.variables,
                'variable'
            );
            processFunctionsAndVariables(
                Configuration.mainData.miscellaneous.typealiases,
                'type alias'
            );

            files = _.sortBy(files, ['filePath']);

            let coverageData = {
                count:
                    files.length > 0
                        ? Math.floor(totalProjectStatementDocumented / files.length)
                        : 0,
                status: '',
                files
            };
            coverageData.status = getStatus(coverageData.count);
            Configuration.addPage({
                name: 'coverage',
                id: 'coverage',
                context: 'coverage',
                files: files,
                data: coverageData,
                depth: 0,
                pageType: COMPODOC_DEFAULTS.PAGE_TYPES.ROOT
            });
            coverageData.files = files;
            Configuration.mainData.coverageData = coverageData;
            if (Configuration.mainData.exportFormat === COMPODOC_DEFAULTS.exportFormat) {
                HtmlEngine.generateCoverageBadge(
                    Configuration.mainData.output,
                    'documentation',
                    coverageData
                );
            }
            files = _.sortBy(files, ['coveragePercent']);

            let coverageTestPerFileResults;
            if (
                Configuration.mainData.coverageTest &&
                !Configuration.mainData.coverageTestPerFile
            ) {
                // Global coverage test and not per file
                if (coverageData.count >= Configuration.mainData.coverageTestThreshold) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${Configuration.mainData.coverageTestThreshold}%)`
                    );
                    this.generationPromiseResolve(true);
                    process.exit(0);
                } else {
                    let message = `Documentation coverage (${coverageData.count}%) is not over threshold (${Configuration.mainData.coverageTestThreshold}%)`;
                    this.generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                }
            } else if (
                !Configuration.mainData.coverageTest &&
                Configuration.mainData.coverageTestPerFile
            ) {
                coverageTestPerFileResults = processCoveragePerFile();
                // Per file coverage test and not global
                if (coverageTestPerFileResults.underFiles.length > 0) {
                    let message = `Documentation coverage per file is not over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`;
                    this.generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                } else {
                    logger.info(
                        `Documentation coverage per file is over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`
                    );
                    this.generationPromiseResolve(true);
                    process.exit(0);
                }
            } else if (
                Configuration.mainData.coverageTest &&
                Configuration.mainData.coverageTestPerFile
            ) {
                // Per file coverage test and global
                coverageTestPerFileResults = processCoveragePerFile();
                if (
                    coverageData.count >= Configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length === 0
                ) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${Configuration.mainData.coverageTestThreshold}%)`
                    );
                    logger.info(
                        `Documentation coverage per file is over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`
                    );
                    this.generationPromiseResolve(true);
                    process.exit(0);
                } else if (
                    coverageData.count >= Configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0
                ) {
                    logger.info(
                        `Documentation coverage (${coverageData.count}%) is over threshold (${Configuration.mainData.coverageTestThreshold}%)`
                    );
                    let message = `Documentation coverage per file is not over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`;
                    this.generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        process.exit(0);
                    }
                } else if (
                    coverageData.count < Configuration.mainData.coverageTestThreshold &&
                    coverageTestPerFileResults.underFiles.length > 0
                ) {
                    let messageGlobal = `Documentation coverage (${coverageData.count}%) is not over threshold (${Configuration.mainData.coverageTestThreshold}%)`,
                        messagePerFile = `Documentation coverage per file is not over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`;
                    this.generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(messageGlobal);
                        logger.error(messagePerFile);
                        process.exit(1);
                    } else {
                        logger.warn(messageGlobal);
                        logger.warn(messagePerFile);
                        process.exit(0);
                    }
                } else {
                    let message = `Documentation coverage (${coverageData.count}%) is not over threshold (${Configuration.mainData.coverageTestThreshold}%)`,
                        messagePerFile = `Documentation coverage per file is over threshold (${Configuration.mainData.coverageMinimumPerFile}%)`;
                    this.generationPromiseReject();
                    if (Configuration.mainData.coverageTestThresholdFail) {
                        logger.error(message);
                        logger.info(messagePerFile);
                        process.exit(1);
                    } else {
                        logger.warn(message);
                        logger.info(messagePerFile);
                        process.exit(0);
                    }
                }
            } else {
                resolve(true);
            }
        });
    }
}
