import DependenciesEngine from './dependencies.engine';
import FileEngine from './file.engine';

const ngdT = require('@compodoc/ngd-transformer');

type GraphContext = 'module' | 'overview';

export class NgdEngine {
    public engine;

    private static instance: NgdEngine;
    private constructor() {}
    public static getInstance() {
        if (!NgdEngine.instance) {
            NgdEngine.instance = new NgdEngine();
        }
        return NgdEngine.instance;
    }

    public init(outputpath: string) {
        this.engine = new ngdT.DotEngine({
            output: outputpath,
            displayLegend: true,
            outputFormats: 'svg',
            silent: true
        });
    }

    public renderGraph(filepath: string, outputpath: string, type: string, name?: string) {
        this.engine.updateOutput(outputpath);

        if (type === 'f') {
            return this.engine.generateGraph([DependenciesEngine.getRawModule(name)]);
        } else {
            return this.engine.generateGraph(DependenciesEngine.rawModulesForOverview);
        }
    }

    public readGraph(filepath: string, name: string, context: GraphContext = 'overview'): Promise<string> {
        return FileEngine.get(filepath)
            .then(svg => this.addNavigationLinks(svg, context))
            .catch(_err => Promise.reject('Error during graph read ' + name));
    }

    private addNavigationLinks(svg: string, context: GraphContext): string {
        // Graphviz emits one <g class="node"> per logical node.
        // Wrapping each node body inside an <a> makes the whole shape clickable.
        return svg.replace(
            /<g id="node\d+" class="node">[\s\S]*?<\/g>/g,
            nodeBlock => {
                if (nodeBlock.indexOf('xlink:href=') !== -1 || nodeBlock.indexOf(' href=') !== -1) {
                    return nodeBlock;
                }

                const titleMatch = nodeBlock.match(/<title>([\s\S]*?)<\/title>/);
                if (!titleMatch) {
                    return nodeBlock;
                }

                const nodeName = titleMatch[1].trim();
                const href = this.resolveDocumentationHref(nodeName, context);
                if (!href) {
                    return nodeBlock;
                }

                const openTagMatch = nodeBlock.match(/^<g id="node\d+" class="node">/);
                if (!openTagMatch) {
                    return nodeBlock;
                }

                const openTag = openTagMatch[0];
                const inner = nodeBlock
                    .slice(openTag.length)
                    .replace(/<\/g>$/, '');
                const safeHref = this.escapeAttribute(href);

                return `${openTag}<a xlink:href="${safeHref}" href="${safeHref}" target="_top">${inner}</a></g>`;
            }
        );
    }

    private resolveDocumentationHref(nodeName: string, context: GraphContext): string | undefined {
        if (!nodeName) {
            return undefined;
        }

        const resolved = DependenciesEngine.find(nodeName);
        if (!resolved || resolved.source !== 'internal' || !resolved.data) {
            return undefined;
        }

        const dependencyType = String(resolved.data.type || '');
        const targetFolderByType: Record<string, string> = {
            class: 'classes',
            component: 'components',
            controller: 'controllers',
            directive: 'directives',
            entity: 'entities',
            guard: 'guards',
            injectable: 'injectables',
            interceptor: 'interceptors',
            interface: 'interfaces',
            module: 'modules',
            pipe: 'pipes'
        };

        const targetFolder = targetFolderByType[dependencyType];
        if (!targetFolder) {
            return undefined;
        }

        const pageName = resolved.data.isDuplicate ? resolved.data.duplicateName : resolved.data.name;
        if (!pageName) {
            return undefined;
        }

        const relativePrefix = context === 'module' ? '..' : '.';
        return `${relativePrefix}/${targetFolder}/${pageName}.html`;
    }

    private escapeAttribute(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

export default NgdEngine.getInstance();
