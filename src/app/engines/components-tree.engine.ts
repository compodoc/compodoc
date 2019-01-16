import * as _ from 'lodash';
import * as path from 'path';

import { logger } from '../../utils/logger';
import FileEngine from './file.engine';

const $: any = require('cheerio');

class ComponentsTreeEngine {
    private components: any[] = [];
    private componentsForTree: any[] = [];

    private static instance: ComponentsTreeEngine;
    private constructor() {}
    public static getInstance() {
        if (!ComponentsTreeEngine.instance) {
            ComponentsTreeEngine.instance = new ComponentsTreeEngine();
        }
        return ComponentsTreeEngine.instance;
    }

    public addComponent(component) {
        this.components.push(component);
    }

    private readTemplates() {
        return new Promise((resolve, reject) => {
            let i = 0;
            let len = this.componentsForTree.length;
            let loop = () => {
                if (i <= len - 1) {
                    if (this.componentsForTree[i].templateUrl) {
                        let filePath =
                            process.cwd() +
                            path.sep +
                            path.dirname(this.componentsForTree[i].file) +
                            path.sep +
                            this.componentsForTree[i].templateUrl;
                        FileEngine.get(filePath).then(
                            templateData => {
                                this.componentsForTree[i].templateData = templateData;
                                i++;
                                loop();
                            },
                            e => {
                                logger.error(e);
                                reject();
                            }
                        );
                    } else {
                        this.componentsForTree[i].templateData = this.componentsForTree[i].template;
                        i++;
                        loop();
                    }
                } else {
                    resolve();
                }
            };
            loop();
        });
    }

    private findChildrenAndParents() {
        return new Promise((resolve, reject) => {
            _.forEach(this.componentsForTree, component => {
                let $component = $(component.templateData);
                _.forEach(this.componentsForTree, componentToFind => {
                    if ($component.find(componentToFind.selector).length > 0) {
                        console.log(componentToFind.name + ' found in ' + component.name);
                        component.children.push(componentToFind.name);
                    }
                });
            });
            resolve();
        });
    }

    private createTreesForComponents() {
        return new Promise((resolve, reject) => {
            _.forEach(this.components, component => {
                let _component = {
                    name: component.name,
                    file: component.file,
                    selector: component.selector,
                    children: [],
                    template: '',
                    templateUrl: ''
                };
                if (typeof component.template !== 'undefined') {
                    _component.template = component.template;
                }
                if (component.templateUrl.length > 0) {
                    _component.templateUrl = component.templateUrl[0];
                }
                this.componentsForTree.push(_component);
            });
            this.readTemplates().then(
                () => {
                    this.findChildrenAndParents().then(
                        () => {
                            console.log('this.componentsForTree: ', this.componentsForTree);
                            resolve();
                        },
                        e => {
                            logger.error(e);
                            reject();
                        }
                    );
                },
                e => {
                    logger.error(e);
                }
            );
        });
    }
}

export default ComponentsTreeEngine.getInstance();
