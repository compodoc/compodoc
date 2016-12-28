import * as path from 'path';
import * as fs from 'fs-extra';
import { logger } from '../../logger';
import { Configuration } from '../configuration';

const lunr: any = require('lunr'),
      cheerio: any = require('cheerio'),
      Entities:any = require('html-entities').AllHtmlEntities,
      $configuration = Configuration.getInstance(),
      Html = new Entities();

export class SearchEngine {
    searchIndex: any;
    documentsStore: Object = {};
    indexSize: number;
    constructor() {}
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
    indexPage(page) {
        var text,
            $ = cheerio.load(page.rawData);

        text = $('.content').html();
        text = Html.decode(text);
        text = text.replace(/(<([^>]+)>)/ig, '');

        page.url = page.url.replace($configuration.mainData.output, '');

        var doc = {
            url: page.url,
            title: page.infos.context + ' - ' + page.infos.name,
            body: text
        };

        this.documentsStore[doc.url] = doc;

        this.getSearchIndex().add(doc);
    }
    generateSearchIndexJson(outputFolder) {
        fs.writeJson(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + 'search_index.json'), {
            index: this.getSearchIndex(),
            store: this.documentsStore
        }, function (err) {
            if(err) {
                logger.error('Error during search index file generation ', err);
            }
        });
    }
};
