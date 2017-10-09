import * as path from 'path';
import * as fs from 'fs-extra';
import * as Handlebars from 'handlebars';
import { logger } from '../../logger';
import { Configuration } from '../configuration';
import { ConfigurationInterface } from '../interfaces/configuration.interface';

const lunr: any = require('lunr');
const cheerio: any = require('cheerio');
const Entities: any = require('html-entities').AllHtmlEntities;
const Html = new Entities();

export class SearchEngine {
    public searchIndex: any;
    public documentsStore: Object = {};
    public indexSize: number;
    constructor(private configuration: ConfigurationInterface) {}

    private getSearchIndex() {
        if (!this.searchIndex) {
            this.searchIndex = lunr(function () {
                this.ref('url');
                this.field('title', { boost: 10 });
                this.field('body');
            });
        }
        return this.searchIndex;
    }

    public indexPage(page) {
        let text;
        let $ = cheerio.load(page.rawData);

        text = $('.content').html();
        text = Html.decode(text);
        text = text.replace(/(<([^>]+)>)/ig, '');

        page.url = page.url.replace(this.configuration.mainData.output, '');

        let doc = {
            url: page.url,
            title: page.infos.context + ' - ' + page.infos.name,
            body: text
        };

        if (!this.documentsStore.hasOwnProperty(doc.url)) {
            this.documentsStore[doc.url] = doc;
            this.getSearchIndex().add(doc);
        }
    }
    public generateSearchIndexJson(outputFolder) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/search-index.hbs'), 'utf8', (err, data) => {
               if (err) {
                   reject('Error during search index generation');
               } else {
                   let template: any = Handlebars.compile(data);
                   let result = template({
                           index: JSON.stringify(this.getSearchIndex()),
                           store: JSON.stringify(this.documentsStore)
                       });
                   let testOutputDir = outputFolder.match(process.cwd());
                   if (!testOutputDir) {
                       outputFolder = outputFolder.replace(process.cwd(), '');
                   }
                   fs.outputFile(path.resolve(outputFolder + path.sep + '/js/search/search_index.js'), result, function (err1) {
                       if(err1) {
                           logger.error('Error during search index file generation ', err1);
                           reject(err1);
                       } else {
                           resolve();
                       }
                   });
               }
           });
       });
    }
}
