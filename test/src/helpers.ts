const PDFJS = require('pdfjs-dist');

export const shell = require('child_process').spawnSync;
export const spawn = require('child_process').spawn;
export const exec = require('child_process').exec;
export const shellAsync = require('child_process').spawn;
export const fs = require('fs-extra');
export const path = require('path');
export const pkg = require('../../package.json');

export function read(file: string): string {
    return fs.readFileSync(file).toString();
}

export function exists(file: string): boolean {
    return fs.existsSync(file);
}

export function stats(file: string): object {
    return fs.statSync(file);
}

export function remove(file: string): boolean {
    return fs.removeSync(file);
}

export function copy(source: string, dest: string): boolean {
    return fs.copySync(source, dest);
}

export function temporaryDir() {
    let name = '.tmp-compodoc-test';
    let cleanUp = cleanUpName => {
        if (fs.existsSync(cleanUpName)) {
            fs.readdirSync(cleanUpName).forEach(file => {
                const curdir = path.join(cleanUpName, file);
                if (fs.statSync(curdir).isDirectory()) {
                    cleanUp(curdir);
                } else {
                    fs.unlinkSync(curdir);
                }
            });
            fs.rmdirSync(cleanUpName);
        }
    };

    return {
        name,
        remove: remove,
        copy(source, destination) {
            fs.copySync(source, destination);
        },
        create(param?) {
            if (param) name = param;
            if (!fs.existsSync(name)) {
                fs.mkdirSync(name);
            }
        },
        clean(param?) {
            if (param) name = param;
            try {
                cleanUp(name);
            } catch (e) {}
        }
    };
}

interface PdfResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: any;
}

/**
 * Copyright https://gitlab.com/autokent/pdf-parse , converted to ES6 promise for Node.js 6 support
 */
export function readPDF(dataBuffer, options?): Promise<PdfResult> {
    let isDebugMode = false;

    let ret = {
        numpages: 0,
        numrender: 0,
        info: null,
        metadata: null,
        text: '',
        version: null
    };

    function render_page(pageData) {
        let render_options = {
            //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
            normalizeWhitespace: false,
            //do not attempt to combine same line TextItem's. The default value is `false`.
            disableCombineTextItems: false
        };

        return pageData.getTextContent(render_options).then(function(textContent) {
            let lastY,
                text = '';
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY) {
                    text += item.str;
                } else {
                    text += '\n' + item.str;
                }
                lastY = item.transform[5];
            }
            return text;
        });
    }

    const DEFAULT_OPTIONS = {
        pagerender: render_page,
        max: 0,
        version: 'v2.1.266'
    };

    if (typeof options === 'undefined') {
        options = DEFAULT_OPTIONS;
    }
    if (typeof options.pagerender !== 'function') {
        options.pagerender = DEFAULT_OPTIONS.pagerender;
    }
    if (typeof options.max !== 'number') {
        options.max = DEFAULT_OPTIONS.max;
    }
    if (typeof options.version !== 'string') {
        options.version = DEFAULT_OPTIONS.version;
    }
    if (options.version === 'default') {
        options.version = DEFAULT_OPTIONS.version;
    }

    ret.version = PDFJS.version;

    // Disable workers to avoid yet another cross-origin issue (workers need
    // the URL of the script to be loaded, and dynamically loading a cross-origin
    // script does not work).
    PDFJS.disableWorker = true;
    let doc;

    return new Promise((resolve, reject) => {
        PDFJS.getDocument(dataBuffer)
            .promise.then(document => {
                doc = document;
                ret.numpages = doc.numPages;

                let metaData;

                doc.getMetadata()
                    .then(metadata => {
                        metaData = metadata;
                        ret.info = metaData ? metaData.info : undefined;
                        ret.metadata = metaData ? metaData.metadata : undefined;

                        let counter = options.max <= 0 ? doc.numPages : options.max;
                        counter = counter > doc.numPages ? doc.numPages : counter;

                        ret.text = '';

                        let i = 1;

                        let loop = () => {
                            return new Promise((resolveRead, rejectRead) => {
                                if (i <= counter) {
                                    doc.getPage(i)
                                        .then(pageData => options.pagerender(pageData))
                                        .then(pageText => {
                                            i++;
                                            ret.text = `${ret.text}\n\n${pageText}`;
                                            resolveRead(loop());
                                        })
                                        .catch(err => {
                                            rejectRead(err);
                                        });
                                } else {
                                    resolveRead();
                                }
                            });
                        };
                        loop()
                            .then(() => {
                                ret.numrender = counter;
                                doc.destroy();
                                resolve(ret);
                            })
                            .catch(function(err) {
                                reject(err);
                            });
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
}
