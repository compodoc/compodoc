import * as path from 'path';
import * as Handlebars from 'handlebars';
import { logger } from '../../logger';
import { ConfigurationInterface } from '../interfaces/configuration.interface';
import { FileEngine } from './file.engine';
import { MAX_SIZE_FILE_SEARCH_INDEX, MAX_SIZE_FILE_CHEERIO_PARSING } from '../../utils/constants';

const lunr: any = require('lunr');
const cheerio: any = require('cheerio');
const Entities: any = require('html-entities').AllHtmlEntities;
const Html = new Entities();

export class SearchEngine {
    public searchIndex: any;
    private searchDocuments = [];
    public documentsStore: Object = {};
    public indexSize: number;
    public amountOfMemory = 0;

    constructor(
        private configuration: ConfigurationInterface,
        private fileEngine: FileEngine = new FileEngine()
    ) {}

    public indexPage(page) {
        let text;
        this.amountOfMemory += page.rawData.length;
        if (this.amountOfMemory < MAX_SIZE_FILE_CHEERIO_PARSING) {
            let indexStartContent = page.rawData.indexOf('<!-- START CONTENT -->');
            let indexEndContent = page.rawData.indexOf('<!-- END CONTENT -->');

            let $ = cheerio.load(page.rawData.substring(indexStartContent + 1, indexEndContent));

            text = $('.content').html();
            text = Html.decode(text);
            text = text.replace(/(<([^>]+)>)/gi, '');

            page.url = page.url.replace(this.configuration.mainData.output, '');

            let doc = {
                url: page.url,
                title: page.infos.context + ' - ' + page.infos.name,
                body: text
            };

            if (
                !this.documentsStore.hasOwnProperty(doc.url) &&
                doc.body.length < MAX_SIZE_FILE_SEARCH_INDEX
            ) {
                this.documentsStore[doc.url] = doc;
                this.searchDocuments.push(doc);
            }
        }
    }

    public generateSearchIndexJson(outputFolder: string): Promise<void> {
        let that = this;
        let searchIndex = lunr(function() {
            /* tslint:disable:no-invalid-this */
            this.ref('url');
            this.field('title');
            this.field('body');

            let i = 0;
            let len = that.searchDocuments.length;
            for (i; i < len; i++) {
                this.add(that.searchDocuments[i]);
            }
        });
        return this.fileEngine.get(__dirname + '/../src/templates/partials/search-index.hbs').then(
            data => {
                let template: any = Handlebars.compile(data);
                let result = template({
                    index: JSON.stringify(searchIndex),
                    store: JSON.stringify(this.documentsStore)
                });
                let testOutputDir = outputFolder.match(process.cwd());
                if (testOutputDir && testOutputDir.length > 0) {
                    outputFolder = outputFolder.replace(process.cwd() + path.sep, '');
                }

                return this.fileEngine
                    .write(outputFolder + path.sep + '/js/search/search_index.js', result)
                    .catch(err => {
                        logger.error('Error during search index file generation ', err);
                        return Promise.reject(err);
                    });
            },
            err => Promise.reject('Error during search index generation')
        );
    }
}
