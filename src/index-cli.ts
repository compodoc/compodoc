import * as fs from "fs-extra";
import * as path from "node:path";

import { Application } from "./app/application";
import { printStartupBanner } from "./app/cli/banner";
import {
    applyCliConfiguration,
    loadCliConfiguration,
} from "./app/cli/config-loader";
import { defineCliFlags } from "./app/cli/flags";
import Configuration from "./app/configuration";
import FileEngine from "./app/engines/file.engine";
import I18nEngine from "./app/engines/i18n.engine";

import { logger } from "./utils/logger";

import { readConfig, EXCLUDE_PATTERNS, INCLUDE_PATTERNS } from "./utils/utils";
import { parsePublicApi } from "./utils/public-api-parser.util";
import { parseApiMarkdownExports } from "./utils/api-markdown-parser.util";
import { createSourcePathMapper } from "./utils/source-path-mapper.util";

const fg = require("fast-glob");
const { program } = require("commander");

let scannedFiles: string[] = [];
let excludeFiles = EXCLUDE_PATTERNS;
let includeFiles: string[] = [];
let cwd = process.cwd();

process.setMaxListeners(0);

export class CliApplication extends Application {
    /**
     * Run compodoc from the command line.
     */
    protected async start(): Promise<any> {
        defineCliFlags(program).parse(process.argv);

        const outputHelp = () => {
            program.outputHelp();
            process.exit(1);
        };

        const programOptions = program.opts();
        const { configFile, configExplorerResult } = loadCliConfiguration(
            programOptions.config,
            process.cwd(),
        );
        const configuredFilePatterns = applyCliConfiguration(
            Configuration.mainData,
            configFile,
            programOptions,
            { scannedFiles, excludeFiles, includeFiles },
        );

        scannedFiles = configuredFilePatterns.scannedFiles;
        excludeFiles = configuredFilePatterns.excludeFiles;
        includeFiles = configuredFilePatterns.includeFiles;

        printStartupBanner({
            isWatching: this.isWatching,
            isLlmMdStdoutMode:
                Configuration.mainData.exportFormat === "llm-md" &&
                !Configuration.mainData.outputProvided,
            loggerSilent: logger.silent,
            workingDirectory: cwd,
        });

        if (configExplorerResult) {
            if (typeof configExplorerResult.config !== "undefined") {
                logger.info(
                    `Using configuration file : ${configExplorerResult.filepath}`,
                );
            }
        }

        if (!configExplorerResult) {
            logger.warn(`No configuration file found, switching to CLI flags.`);
        }

        if (
            programOptions.language &&
            !I18nEngine.supportLanguage(programOptions.language)
        ) {
            logger.warn(
                `The language ${programOptions.language} is not available, falling back to ${I18nEngine.fallbackLanguage}`,
            );
        }

        if (
            programOptions.tsconfig &&
            typeof programOptions.tsconfig === "boolean"
        ) {
            logger.error(`Please provide a tsconfig file.`);
            process.exit(1);
        }

        /**
         * Check --files argument call
         */
        const argv = require("minimist")(process.argv.slice(2));
        if (argv?.files) {
            Configuration.mainData.hasFilesToCoverage = true;
            if (typeof argv.files === "string") {
                super.setFiles([argv.files]);
            } else {
                super.setFiles(argv.files);
            }
        }

        if (
            programOptions.serve &&
            !Configuration.mainData.tsconfig &&
            programOptions.output
        ) {
            // if -s & -d, serve it
            if (!FileEngine.existsSync(Configuration.mainData.output)) {
                logger.error(
                    `${Configuration.mainData.output} folder doesn't exist`,
                );
                process.exit(1);
            } else {
                logger.info(
                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${programOptions.port}`,
                );
                super.runWebServer(Configuration.mainData.output);
            }
        } else if (
            programOptions.serve &&
            !Configuration.mainData.tsconfig &&
            !programOptions.output
        ) {
            // if only -s find ./documentation, if ok serve, else error provide -d
            if (!FileEngine.existsSync(Configuration.mainData.output)) {
                logger.error("Provide output generated folder with -d flag");
                process.exit(1);
            } else {
                logger.info(
                    `Serving documentation from ${Configuration.mainData.output} at http://${Configuration.mainData.hostname}:${programOptions.port}`,
                );
                super.runWebServer(Configuration.mainData.output);
            }
        } else if (Configuration.mainData.hasFilesToCoverage) {
            if (programOptions.coverageMinimumPerFile) {
                logger.info("Run documentation coverage test for files");
                super.testCoverage();
            } else {
                logger.error("Missing coverage configuration");
            }
        } else {
            if (programOptions.hideGenerator) {
                Configuration.mainData.hideGenerator = true;
            }

            if (Configuration.mainData.tsconfig) {
                /**
                 * tsconfig file provided only
                 */
                const testTsConfigPath =
                    Configuration.mainData.tsconfig.indexOf(process.cwd());
                if (testTsConfigPath !== -1) {
                    Configuration.mainData.tsconfig =
                        Configuration.mainData.tsconfig.replace(
                            process.cwd() + path.sep,
                            "",
                        );
                }

                let sourceFolder;
                let sourceFileInput: string | undefined;
                if (program.args.length > 0) {
                    /**
                     * tsconfig file provided with source folder in arg
                     */
                    const testTsConfigPath =
                        Configuration.mainData.tsconfig.indexOf(process.cwd());
                    if (testTsConfigPath !== -1) {
                        Configuration.mainData.tsconfig =
                            Configuration.mainData.tsconfig.replace(
                                process.cwd() + path.sep,
                                "",
                            );
                    }

                    const providedSourcePath = program.args[0];
                    if (!FileEngine.existsSync(providedSourcePath)) {
                        logger.error(
                            `Provided source ${providedSourcePath} was not found in the current directory`,
                        );
                        process.exit(1);
                    } else {
                        const sourceStats = fs.statSync(providedSourcePath);
                        if (sourceStats.isFile()) {
                            sourceFolder = path.dirname(providedSourcePath);
                            sourceFileInput = providedSourcePath;
                            logger.info("Using provided source file");
                        } else {
                            sourceFolder = providedSourcePath;
                            logger.info("Using provided source folder");
                        }
                    }
                }

                if (!FileEngine.existsSync(Configuration.mainData.tsconfig)) {
                    logger.error(
                        `"${Configuration.mainData.tsconfig}" file was not found in the current directory`,
                    );
                    process.exit(1);
                } else {
                    const _file = path.join(
                        path.join(
                            process.cwd(),
                            path.dirname(Configuration.mainData.tsconfig),
                        ),
                        path.basename(Configuration.mainData.tsconfig),
                    );
                    // use the current directory of tsconfig.json as a working directory
                    cwd = _file.split(path.sep).slice(0, -1).join(path.sep);
                    logger.info("Using tsconfig file ", _file);

                    const tsConfigFile = readConfig(_file);
                    if (tsConfigFile.files) {
                        scannedFiles = tsConfigFile.files;
                        // Normalize path of these files
                        scannedFiles = scannedFiles.map((scannedFile) => {
                            return cwd + path.sep + scannedFile;
                        });
                    }

                    // even if files are supplied with "files" attributes, enhance the array with includes
                    excludeFiles = [
                        ...excludeFiles,
                        ...(tsConfigFile.exclude || []),
                    ];
                    includeFiles = [
                        ...includeFiles,
                        ...(tsConfigFile.include || []),
                    ];

                    if (scannedFiles.length > 0) {
                        includeFiles = [...includeFiles, ...scannedFiles];
                    }

                    if (sourceFileInput) {
                        // Restrict scanning to the provided single file to avoid treating it as a directory.
                        includeFiles = [path.basename(sourceFileInput)];
                        scannedFiles = [];
                    }

                    if (!includeFiles.length) {
                        includeFiles = INCLUDE_PATTERNS;
                    }

                    // If publicApiOnly is set, parse the public API exports first
                    if (Configuration.mainData.publicApiOnly) {
                        await this.processPublicApi(
                            Configuration.mainData.publicApiOnly,
                            cwd,
                        );
                    }

                    const stream = fg.stream(includeFiles, {
                        cwd: sourceFolder || cwd,
                        ignore: excludeFiles,
                        absolute: true,
                    });

                    stream.on("data", (file: string) => {
                        if (
                            path.extname(file) === ".ts" ||
                            path.extname(file) === ".tsx"
                        ) {
                            logger.debug("Including", file);
                            scannedFiles.push(file);
                        } else {
                            logger.warn("Excluding", file);
                        }
                    });

                    stream.on("end", () => {
                        super.setFiles(scannedFiles);
                        if (
                            programOptions.coverageTest ||
                            programOptions.coverageTestPerFile
                        ) {
                            logger.info("Run documentation coverage test");
                            super.testCoverage();
                        } else {
                            super.generate();
                        }
                    });
                }
            } else {
                logger.error(
                    "tsconfig.json file was not found, please use -p flag",
                );
                outputHelp();
            }
        }
    }

    /**
     * Process public API exports from dist folder or API markdown files
     */
    private async processPublicApi(
        distPath: string,
        sourceRoot: string,
    ): Promise<void> {
        logger.info("Processing public API exports");

        try {
            // First, try to parse API markdown files from the source root
            logger.info("Checking for *.api.md files in source root");
            const apiMarkdownExports =
                await parseApiMarkdownExports(sourceRoot);

            if (
                apiMarkdownExports.apiMdFiles.size > 0 &&
                apiMarkdownExports.symbolToFiles.size > 0
            ) {
                logger.info(
                    `Found ${apiMarkdownExports.apiMdFiles.size} relevant *.api.md file(s) with ${apiMarkdownExports.symbolToFiles.size} symbol(s)`,
                );

                // Map symbols from API markdown files directly to source files
                const symbolToSourceFiles = new Map<string, Set<string>>();

                for (const [symbolName] of apiMarkdownExports.symbolToFiles) {
                    const sourceFiles = new Set<string>();

                    // Find the corresponding source file for this symbol
                    const sourceFile = this.findSourceFileForSymbol(
                        symbolName,
                        sourceRoot,
                    );
                    if (sourceFile) {
                        sourceFiles.add(sourceFile);
                    }

                    if (sourceFiles.size > 0) {
                        symbolToSourceFiles.set(symbolName, sourceFiles);
                        logger.debug(
                            `Public API symbol: ${symbolName} -> ${Array.from(sourceFiles).join(", ")}`,
                        );
                    }
                }

                // Store in configuration
                Configuration.mainData.publicApiExports = symbolToSourceFiles;

                logger.info(
                    `Loaded ${symbolToSourceFiles.size} public API symbol(s) from ${apiMarkdownExports.apiMdFiles.size} *.api.md file(s) (using API Markdown parser)`,
                );
            } else {
                // Fall back to index.d.ts parsing
                logger.info(
                    "No relevant *.api.md files found, falling back to index.d.ts parsing",
                );

                const publicApiExports = await parsePublicApi(distPath);

                if (publicApiExports.symbolToFiles.size === 0) {
                    logger.warn(
                        "No public API exports found in dist folder. Documentation will be empty.",
                    );
                    return;
                }

                // Create source path mapper
                const mapper = createSourcePathMapper(distPath, sourceRoot);

                // Map symbols to source files and build the allowed exports map
                const symbolToSourceFiles = new Map<string, Set<string>>();

                for (const [
                    symbolName,
                    declFiles,
                ] of publicApiExports.symbolToFiles) {
                    const sourceFiles = new Set<string>();

                    for (const declFile of declFiles) {
                        const sourceFile = mapper.mapDistToSource(declFile);
                        if (sourceFile) {
                            sourceFiles.add(sourceFile);
                        }
                    }

                    if (sourceFiles.size > 0) {
                        symbolToSourceFiles.set(symbolName, sourceFiles);
                        logger.debug(
                            `Public API symbol: ${symbolName} -> ${Array.from(sourceFiles).join(", ")}`,
                        );
                    }
                }

                // Store in configuration
                Configuration.mainData.publicApiExports = symbolToSourceFiles;

                logger.info(
                    `Loaded ${symbolToSourceFiles.size} public API symbol(s) from ${publicApiExports.indexFiles.size} index.d.ts file(s) (using index.d.ts parser)`,
                );
            }
        } catch (error) {
            logger.error("Error processing public API:", error);
            throw error;
        }
    }

    /**
     * Find the source file for a given symbol by searching through the source files
     */
    private findSourceFileForSymbol(
        symbolName: string,
        sourceRoot: string,
    ): string | null {
        // Try to find the symbol in source files
        // This is a simplified approach - look for files that contain the symbol export
        const sourceFolder = sourceRoot;

        try {
            const files = fg.sync(path.join(sourceFolder, "**/*.ts"), {
                ignore: ["**/node_modules/**", "**/*.spec.ts", "**/*.d.ts"],
            });

            for (const file of files) {
                const content = fs.readFileSync(file, "utf-8");
                // Look for export patterns that match the symbol name
                const patterns = [
                    `export class ${symbolName}`,
                    `export interface ${symbolName}`,
                    `export const ${symbolName}`,
                    `export function ${symbolName}`,
                    `export type ${symbolName}`,
                    `export enum ${symbolName}`,
                    `export { ${symbolName}`,
                    `export default ${symbolName}`,
                ];

                for (const pattern of patterns) {
                    if (content.includes(pattern)) {
                        return file;
                    }
                }
            }
        } catch (error) {
            logger.debug(`Error searching for symbol ${symbolName}: ${error}`);
        }

        return null;
    }
}
