import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as path from 'path';

import Configuration from '../../configuration';
import I18nEngine from '../i18n.engine';
import MarkdownToPdfEngine from './markdown-to-pdf.engine';

const PdfPrinter = require('pdfmake');

export class ExportPdfEngine {
    private static instance: ExportPdfEngine;
    private constructor() {}
    public static getInstance() {
        if (!ExportPdfEngine.instance) {
            ExportPdfEngine.instance = new ExportPdfEngine();
        }
        return ExportPdfEngine.instance;
    }

    public export(outputFolder) {
        let fonts = {
            Roboto: {
                normal: path.join(__dirname, '../src/resources/fonts/roboto-v15-latin-regular.ttf'),
                bold: path.join(__dirname, '../src/resources/fonts/roboto-v15-latin-700.ttf'),
                italics: path.join(__dirname, '../src/resources/fonts/roboto-v15-latin-italic.ttf')
            }
        };

        let printer = new PdfPrinter(fonts);

        let docDefinition = {
            info: {
                title: Configuration.mainData.documentationMainName
            },
            content: [],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    color: '#008cff',
                    margin: [0, 0, 0, 15]
                },
                subheader: {
                    fontSize: 15,
                    bold: true
                }
            }
        };

        docDefinition.content.push({
            text: Configuration.mainData.documentationMainName,
            alignment: 'center',
            bold: true,
            fontSize: 22,
            margin: [10, 350, 10, 270]
        });

        Configuration.mainData.hideDarkModeToggle = true;

        if (!Configuration.mainData.hideGenerator) {
            docDefinition.content.push({
                text: I18nEngine.translate('generated-using'),
                alignment: 'center'
            });
            docDefinition.content.push({
                image: `data:image/jpeg;base64,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`,
                width: 70,
                alignment: 'center',
                pageBreak: 'after'
            });
        }

        docDefinition.content.push({
            toc: {
                title: {
                    text: I18nEngine.translate('table-of-contents'),
                    bold: true,
                    alignment: 'center',
                    fontSize: 18,
                    margin: [10, 10, 10, 50]
                },
                numberStyle: {
                    bold: true
                }
            },
            pageBreak: 'after'
        });

        // Add README page if available

        docDefinition.content.push(this.generateMarkdownContent());

        // Add CHANGELOG page if available

        // Add CONTRIBUTING page if available

        // Add LICENSE page if available

        // Add TODO page if available

        // Add Dependencies page if available

        // Add Additional pages if available

        docDefinition.content.push(this.generateModulesContent());

        docDefinition.content.push(this.generateComponentsContent());

        // Classes

        // Injectables

        // Interceptors

        // Guards

        // Interfaces

        // Pipes

        // Miscellaneous

        // Routes

        // Coverage - docDefinition.content.push(...this.coverageEngine.calculateTable());

        let pdfDoc = printer.createPdfKitDocument(docDefinition);

        return new Promise((resolve, reject) => {
            fs.ensureFile(outputFolder + path.sep + 'documentation.pdf', err => {
                if (err) {
                    reject(`Error during pdf generation: ${err}`);
                } else {
                    pdfDoc.pipe(
                        fs.createWriteStream(outputFolder + path.sep + 'documentation.pdf')
                    );
                    pdfDoc.end();
                    resolve();
                }
            });
        });
    }

    private firstCharacterUpperCase(sentence: string): string {
        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }

    private generateMarkdownContent() {
        let pages = Configuration.markDownPages;

        let data = [];

        pages.forEach(page => {
            data.push({
                text: `${this.firstCharacterUpperCase(page.name)}`,
                tocItem: true,
                style: 'header'
            });

            let convertedMarkdownObject = MarkdownToPdfEngine.convert(page.data);
            convertedMarkdownObject.margin = [0, 10];

            data.push(convertedMarkdownObject);
        });

        this.insertPageReturn(data);

        return data;
    }

    private insertPageReturn(data) {
        data.push({
            text: ` `,
            margin: [0, 0, 0, 20],
            pageBreak: 'after'
        });
    }

    private generateModulesContent() {
        let data = [];

        data.push({
            text: 'Modules',
            tocItem: true,
            style: 'header'
        });

        _.forEach(Configuration.mainData.modules, module => {
            data.push({
                text: `${module.name}`,
                style: 'subheader',
                margin: [0, 15, 0, 15]
            });

            data.push({
                text: [
                    {
                        text: `Filename : `,
                        bold: true
                    },
                    {
                        text: module.file
                    }
                ],
                margin: [0, 10]
            });

            if (module.rawdescription != '') {
                data.push({
                    text: `Description :`,
                    bold: true,
                    margin: [0, 10]
                });

                data.push({
                    text: `${module.rawdescription}`,
                    margin: [0, 5]
                });
            }

            if (module.declarations.length > 0) {
                data.push({
                    text: `Declarations :`,
                    bold: true,
                    margin: [0, 10]
                });

                let list = { ul: [] };

                _.forEach(module.declarations, declaration => {
                    list.ul.push({
                        text: `${declaration.name}`
                    });
                });

                data.push(list);
            }

            if (module.providers.length > 0) {
                data.push({
                    text: `Providers :`,
                    bold: true,
                    margin: [0, 10]
                });

                let list = { ul: [] };

                _.forEach(module.providers, provider => {
                    list.ul.push({
                        text: `${provider.name}`
                    });
                });

                data.push(list);
            }

            if (module.imports.length > 0) {
                data.push({
                    text: `Imports :`,
                    bold: true,
                    margin: [0, 10]
                });

                let list = { ul: [] };

                _.forEach(module.imports, importRef => {
                    list.ul.push({
                        text: `${importRef.name}`
                    });
                });

                data.push(list);
            }

            if (module.exports.length > 0) {
                data.push({
                    text: `Exports :`,
                    bold: true,
                    margin: [0, 10]
                });

                let list = { ul: [] };

                _.forEach(module.exports, exportRef => {
                    list.ul.push({
                        text: `${exportRef.name}`
                    });
                });

                data.push(list);
            }

            data.push({
                text: ` `,
                margin: [0, 0, 0, 20]
            });
        });

        this.insertPageReturn(data);

        return data;
    }

    private generateComponentsContent() {
        let data = [];

        data.push({
            text: 'Components',
            tocItem: true,
            style: 'header'
        });

        _.forEach(Configuration.mainData.components, component => {
            data.push({
                text: `${component.name}`,
                style: 'subheader',
                margin: [0, 15, 0, 15]
            });

            data.push({
                text: [
                    {
                        text: `Filename : `,
                        bold: true
                    },
                    {
                        text: component.file
                    }
                ],
                margin: [0, 10]
            });

            if (component.rawdescription != '') {
                data.push({
                    text: `Description :`,
                    bold: true,
                    margin: [0, 10]
                });

                data.push({
                    text: `${component.rawdescription}`,
                    margin: [0, 5]
                });
            }

            data.push({
                text: ` `,
                margin: [0, 0, 0, 20]
            });
        });

        this.insertPageReturn(data);

        return data;
    }
}

export default ExportPdfEngine.getInstance();
