import { logger } from '../logger';
import { HtmlEngine } from './engines/html.engine';
import { DependenciesEngine } from './engines/dependencies.engine';
import { FileEngine } from './engines/file.engine';
import { SearchEngine } from './engines/search.engine';

export default function({ chunck, configuration, fileEngine, searchEngine, htmlEngine }, callback) {
    // tslint:disable-next-line:no-null-keyword
    // callback(inp + ' BAR (' + process.pid + ')');

    logger.info(`PID#${process.pid} processing ${chunck.length} pages...`);
    for (let i = 0; i < chunck.length; i++) {
        callback(
            handle({
                page: chunck[i],
                configuration
            })
        );
    }
}

function handle({ page, configuration }) {
    const dependenciesEngine = new DependenciesEngine();
    const fileEngine = new FileEngine();
    const searchEngine = new SearchEngine(configuration, fileEngine);
    const htmlEngine = new HtmlEngine(configuration, dependenciesEngine, fileEngine);

    try {
        return htmlEngine
            .init()
            .catch(e => logger.error(e))
            .then(_ => {
                logger.info('Process page', page.name);

                let htmlData = htmlEngine.render(configuration.mainData, page);
                let finalPath = configuration.mainData.output;

                if (configuration.mainData.output.lastIndexOf('/') === -1) {
                    finalPath += '/';
                }
                if (page.path) {
                    finalPath += page.path + '/';
                }

                if (page.filename) {
                    finalPath += page.filename + '.html';
                } else {
                    finalPath += page.name + '.html';
                }

                searchEngine.indexPage({
                    infos: page,
                    rawData: htmlData,
                    url: finalPath
                });
                return fileEngine.write(finalPath, htmlData).catch(err => {
                    logger.error('Error during ' + page.name + ' page generation');
                    return Promise.reject('');
                });
            });
    } catch (e) {
        logger.error('skipping...', page.name);
        logger.error(e);
        return Promise.resolve(0);
    }
}
