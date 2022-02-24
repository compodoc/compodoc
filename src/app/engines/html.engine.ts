import * as Handlebars from 'handlebars';
import * as path from 'path';

import { logger } from '../../utils/logger';
import FileEngine from './file.engine';
import { HtmlEngineHelpers } from './html.engine.helpers';

export class HtmlEngine {
    private cache: { page: string } = {} as any;
    private compiledPage;

    private precompiledMenu;

    private static instance: HtmlEngine;
    private constructor() {
        const helper = new HtmlEngineHelpers();
        helper.registerHelpers(Handlebars);
    }
    public static getInstance() {
        if (!HtmlEngine.instance) {
            HtmlEngine.instance = new HtmlEngine();
        }
        return HtmlEngine.instance;
    }

    public init(templatePath: string): Promise<void> {
        const partials = [
            'overview',
            'markdown',
            'modules',
            'module',
            'component',
            'controller',
            'entity',
            'component-detail',
            'directive',
            'injectable',
            'interceptor',
            'guard',
            'pipe',
            'class',
            'interface',
            'routes',
            'index',
            'index-misc',
            'search-results',
            'search-input',
            'link-type',
            'block-method',
            'block-host-listener',
            'block-enum',
            'block-property',
            'block-index',
            'block-constructor',
            'block-typealias',
            'block-accessors',
            'block-input',
            'block-output',
            'coverage-report',
            'unit-test-report',
            'miscellaneous-functions',
            'miscellaneous-variables',
            'miscellaneous-typealiases',
            'miscellaneous-enumerations',
            'additional-page',
            'package-dependencies',
            'package-properties'
        ];
        if (templatePath) {
            if (
                FileEngine.existsSync(path.resolve(process.cwd() + path.sep + templatePath)) ===
                false
            ) {
                logger.warn(
                    'Template path specificed but does not exist...using default templates'
                );
            }
        }

        return Promise.all(
            partials.map(partial => {
                let partialPath = this.determineTemplatePath(
                    templatePath,
                    'partials/' + partial + '.hbs'
                );
                return FileEngine.get(partialPath).then(data =>
                    Handlebars.registerPartial(partial, data)
                );
            })
        )
            .then(() => {
                let pagePath = this.determineTemplatePath(templatePath, 'page.hbs');
                return FileEngine.get(pagePath).then(data => {
                    this.cache.page = data;
                    this.compiledPage = Handlebars.compile(this.cache.page, {
                        preventIndent: true,
                        strict: true
                    });
                });
            })
            .then(() => {
                let menuPath = this.determineTemplatePath(templatePath, 'partials/menu.hbs');
                return FileEngine.get(menuPath).then(menuTemplate => {
                    this.precompiledMenu = Handlebars.compile(menuTemplate, {
                        preventIndent: true,
                        strict: true
                    });
                });
            });
    }

    public renderMenu(templatePath, data) {
        let menuPath = this.determineTemplatePath(templatePath, 'partials/menu.hbs');
        return FileEngine.get(menuPath).then(menuTemplate => {
            data.menu = 'normal';
            return Handlebars.compile(menuTemplate, {
                preventIndent: true,
                strict: true
            })({ ...data });
        });
    }

    public render(mainData: any, page: any): string {
        let o = mainData;
        (Object as any).assign(o, page);

        // let mem = process.memoryUsage();
        // console.log(`heapTotal: ${mem.heapTotal} | heapUsed: ${mem.heapUsed}`);

        return this.compiledPage({
            data: o
        });
    }
    private determineTemplatePath(templatePath: string, filePath: string): string {
        let outPath = path.resolve(__dirname + '/../src/templates/' + filePath);
        if (templatePath) {
            let testPath = path.resolve(
                process.cwd() + path.sep + templatePath + path.sep + filePath
            );
            outPath = FileEngine.existsSync(testPath) ? testPath : outPath;
        }
        return outPath;
    }

    public generateCoverageBadge(outputFolder, label, coverageData) {
        return FileEngine.get(
            path.resolve(__dirname + '/../src/templates/partials/coverage-badge.hbs')
        ).then(
            data => {
                let template: any = Handlebars.compile(data);
                coverageData.label = label;
                let result = template({
                    data: coverageData
                });
                let testOutputDir = outputFolder.match(process.cwd());
                if (testOutputDir && testOutputDir.length > 0) {
                    outputFolder = outputFolder.replace(process.cwd() + path.sep, '');
                }

                return FileEngine.write(
                    outputFolder + path.sep + '/images/coverage-badge-' + label + '.svg',
                    result
                ).catch(err => {
                    logger.error('Error during coverage badge ' + label + ' file generation ', err);
                    return Promise.reject(err);
                });
            },
            err => Promise.reject('Error during coverage badge generation')
        );
    }
}

export default HtmlEngine.getInstance();
