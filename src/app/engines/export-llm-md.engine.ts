import * as path from "path";

import { renderLlmMd } from "../../llm-md";
import { logger } from "../../utils/logger";
import Configuration from "../configuration";

import ExportJsonEngine from "./export-json.engine";
import FileEngine from "./file.engine";

const traverse = require("neotraverse/legacy");

export class ExportLlmMdEngine {
    private static instance: ExportLlmMdEngine;
    private constructor() {}
    public static getInstance() {
        if (!ExportLlmMdEngine.instance) {
            ExportLlmMdEngine.instance = new ExportLlmMdEngine();
        }
        return ExportLlmMdEngine.instance;
    }

    public async export(outputFolder: string, data: any): Promise<void> {
        traverse(data).forEach(function (node) {
            if (node) {
                if (node.parent) {
                    delete node.parent;
                }
                if (node.initializer) {
                    delete node.initializer;
                }
            }
        });

        const exportData: any = {
            pipes: data.pipes,
            interfaces: data.interfaces,
            injectables: data.injectables,
            guards: data.guards,
            interceptors: data.interceptors,
            classes: data.classes,
            directives: data.directives,
            components: data.components,
            modules: ExportJsonEngine.processModules(),
            miscellaneous: data.miscellaneous,
        };

        if (!Configuration.mainData.disableRoutesGraph) {
            exportData.routes = data.routes;
        }

        const pkg = require("../../../package.json");

        const markdown = renderLlmMd(
            exportData,
            {
                projectName:
                    Configuration.mainData.documentationMainName ||
                    "Application documentation",
                projectDescription:
                    Configuration.mainData.documentationMainDescription,
            },
            pkg.version,
        );

        if (Configuration.mainData.outputProvided) {
            const filePath = path.join(outputFolder, "llm-context.md");
            return FileEngine.write(filePath, markdown)
                .then(() => {
                    logger.info(`llm-md export written to ${filePath}`);
                })
                .catch((err) => {
                    logger.error(
                        "Error during llm-md export file generation ",
                        err,
                    );
                    return Promise.reject(err);
                });
        }

        process.stdout.write(markdown);
    }
}

export default ExportLlmMdEngine.getInstance();
