import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { logger } from '../../logger';
//import * as helpers from 'handlebars-helpers';
import { HtmlEngineHelpers } from './html.engine.helpers';

export class HtmlEngine {
    cache: Object = {};
    constructor() {
        HtmlEngineHelpers.init();
    }
    init() {
        let partials = [
            'menu',
            'overview',
            'markdown',
            'modules',
            'module',
            'components',
            'component',
            'component-detail',
            'directives',
            'directive',
            'injectables',
            'injectable',
            'pipes',
            'pipe',
            'classes',
            'class',
	        'interface',
            'routes',
            'search-results',
            'search-input',
            'link-type',
            'block-method',
            'block-enum',
            'block-property',
            'block-index',
            'block-constructor',
            'coverage-report',
            'miscellaneous',
            'additional-page'
        ],
            i = 0,
            len = partials.length,
            loop = (resolve, reject) => {
                if( i <= len-1) {
                    fs.readFile(path.resolve(__dirname + '/../src/templates/partials/' + partials[i] + '.hbs'), 'utf8', (err, data) => {
                        if (err) { reject(); }
                        Handlebars.registerPartial(partials[i], data);
                        i++;
                        loop(resolve, reject);
                    });
                } else {
                    fs.readFile(path.resolve(__dirname + '/../src/templates/page.hbs'), 'utf8', (err, data) => {
                       if (err) {
                           reject('Error during index generation');
                       } else {
                           this.cache['page'] = data;
                           resolve();
                       }
                   });
                }
            }


        return new Promise(function(resolve, reject) {
            loop(resolve, reject);
        });
    }
    render(mainData:any, page:any) {
        var o = mainData,
            that = this;
        (<any>Object).assign(o, page);
        let template:any = Handlebars.compile(that.cache['page']),
            result = template({
                data: o
            });
        return result;
    }
    generateCoverageBadge(outputFolder, coverageData) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname + '/../src/templates/partials/coverage-badge.hbs'), 'utf8', (err, data) => {
               if (err) {
                   reject('Error during coverage badge generation');
               } else {
                   let template:any = Handlebars.compile(data),
                       result = template({
                           data: coverageData
                       });
                   outputFolder = outputFolder.replace(process.cwd(), '');
                   fs.outputFile(path.resolve(process.cwd() + path.sep + outputFolder + path.sep + '/images/coverage-badge.svg'), result, function (err) {
                       if(err) {
                           logger.error('Error during coverage badge file generation ', err);
                           reject(err);
                       } else {
                           resolve();
                       }
                   });
               }
           });
       });
    }
};
