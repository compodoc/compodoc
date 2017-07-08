import * as path from 'path';
import { FileEngine } from './file.engine';
import { logger } from '../../logger';

const $: any = require('cheerio'),
      _ = require('lodash');

class ComponentsTreeEngine {
    private static _instance: ComponentsTreeEngine = new ComponentsTreeEngine();
    components: any[] = [];
    componentsForTree: any[] = [];
    constructor() {
        if (ComponentsTreeEngine._instance) {
            throw new Error('Error: Instantiation failed: Use ComponentsTreeEngine.getInstance() instead of new.');
        }
        ComponentsTreeEngine._instance = this;
    }
    public static getInstance(): ComponentsTreeEngine {
        return ComponentsTreeEngine._instance;
    }
    addComponent(component) {
        this.components.push(component);
    }
    readTemplates() {
        return new Promise((resolve, reject) => {
            let i = 0,
                len = this.componentsForTree.length,
                $fileengine = new FileEngine(),
                loop = () => {
                    if (i <= len - 1) {
                        if (this.componentsForTree[i].templateUrl) {
                            $fileengine.get(path.dirname(this.componentsForTree[i].file) + path.sep + this.componentsForTree[i].templateUrl).then((templateData) => {
                                this.componentsForTree[i].templateData = templateData;
                                i++
                                loop();
                            }, (e) => {
                                logger.error(e);
                                reject();
                            });
                        } else {
                            this.componentsForTree[i].templateData = this.componentsForTree[i].template;
                            i++
                            loop();
                        }
                    } else {
                        resolve();
                    }
                }
            loop();
        });
    }
    findChildrenAndParents() {
        return new Promise((resolve, reject) => {
            _.forEach(this.componentsForTree, (component) => {
                let $component = $(component.templateData);
                _.forEach(this.componentsForTree, (componentToFind) => {
                    if ($component.find(componentToFind.selector).length > 0) {
                        console.log(componentToFind.name + ' found in ' + component.name);
                        component.children.push(componentToFind.name);
                    }
                });
            });
            resolve();
        });
    }
    createTreesForComponents() {
        return new Promise((resolve, reject) => {
            _.forEach(this.components, (component) => {
                let _component = {
                    name: component.name,
                    file: component.file,
                    selector: component.selector,
                    children: [],
                    template: '',
                    templateUrl: ''
                }
                if (typeof component.template !== 'undefined') {
                    _component.template = component.template
                }
                if (component.templateUrl.length > 0) {
                    _component.templateUrl = component.templateUrl[0]
                }
                this.componentsForTree.push(_component);
            });
            this.readTemplates().then(() => {
                this.findChildrenAndParents().then(() => {
                    console.log('this.componentsForTree: ', this.componentsForTree);
                    resolve();
                }, (e) => {
                    logger.error(e);
                    reject();
                });
            }, (e) => {
                logger.error(e);
            });
        });
    }
};

export const $componentsTreeEngine = ComponentsTreeEngine.getInstance();
