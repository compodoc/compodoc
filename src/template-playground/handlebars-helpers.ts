export function registerTemplatePlaygroundHandlebarsHelpers(Handlebars: any, context: any): void {
    // Register translation helper (matches Compodoc's i18n helper pattern)
    Handlebars.registerHelper('t', function (this: any) {
        console.log('T HELPER CALLED');
        const context = this;
        const key = arguments[0];
        const translations: { [key: string]: string } = {
            components: 'Components',
            modules: 'Modules',
            interfaces: 'Interfaces',
            classes: 'Classes',
            injectables: 'Injectables',
            pipes: 'Pipes',
            directives: 'Directives',
            guards: 'Guards',
            interceptors: 'Interceptors',
            entities: 'Entities',
            controllers: 'Controllers',
            info: 'Info',
            readme: 'Readme',
            source: 'Source',
            template: 'Template',
            styles: 'Styles',
            'dom-tree': 'DOM Tree',
            file: 'File',
            description: 'Description',
            implements: 'Implements',
            metadata: 'Metadata',
            index: 'Index',
            methods: 'Methods',
            properties: 'Properties'
        };
        return translations[key] || key;
    });

    // Register relative URL helper
    Handlebars.registerHelper('relativeURL', (depth: any, ...args: any[]) => {
        const depthValue = typeof depth === 'number' ? depth : context.depth || 0;
        const baseUrl = '../'.repeat(depthValue);
        const pathArgs = args.slice(0, -1); // Remove Handlebars options object
        return baseUrl + pathArgs.join('/');
    });

    // Register comparison helper (matches Compodoc's CompareHelper implementation)
    Handlebars.registerHelper('compare', function (this: any) {
        const context = this;
        const a = arguments[0];
        const operator = arguments[1];
        const b = arguments[2];
        const options = arguments[3];

        if (arguments.length < 4) {
            throw new Error('handlebars Helper {{compare}} expects 4 arguments');
        }

        let result = false;
        switch (operator) {
            case 'indexof':
                result = b.indexOf(a) !== -1;
                break;
            case '===':
                result = a === b;
                break;
            case '!==':
                result = a !== b;
                break;
            case '>':
                result = a > b;
                break;
            case '<':
                result = a < b;
                break;
            case '>=':
                result = a >= b;
                break;
            case '<=':
                result = a <= b;
                break;
            case '==':
                result = a == b;
                break;
            case '!=':
                result = a != b;
                break;
            default:
                throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
        }

        if (result === false) {
            return options.inverse(context);
        }
        return options.fn(context);
    });

    // Register tab helpers (matches Compodoc's IsTabEnabledHelper and IsInitialTabHelper)
    Handlebars.registerHelper('isTabEnabled', function (this: any) {
        const context = this;
        const navTabs = arguments[0];
        const tabId = arguments[1];
        const options = arguments[2];

        const isEnabled = navTabs && navTabs.some((tab: any) => tab.id === tabId);
        if (isEnabled) {
            return options.fn(context);
        } else {
            return options.inverse(context);
        }
    });

    Handlebars.registerHelper('isInitialTab', function (this: any) {
        const context = this;
        const navTabs = arguments[0];
        const tabId = arguments[1];

        const isInitial = navTabs && navTabs.length > 0 && navTabs[0].id === tabId;
        if (isInitial) {
            return 'active in';
        }
        return '';
    });

    // Register utility helpers
    Handlebars.registerHelper('orLength', function (this: any, ...args: any[]) {
        const options = args.pop();
        const hasLength = args.some(arg => arg && (Array.isArray(arg) ? arg.length > 0 : arg));
        if (hasLength) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('breakComma', function (array: any[]) {
        if (Array.isArray(array)) {
            return array.join(', ');
        }
        return array;
    });

    Handlebars.registerHelper(
        'parseDescription',
        function (description: string, depth: number) {
            // Simple markdown parsing - just return as HTML for now
            return new Handlebars.SafeString(description || '');
        }
    );

    Handlebars.registerHelper('escapeSimpleQuote', function (text: string) {
        if (typeof text === 'string') {
            return text.replace(/'/g, "\\'");
        }
        return text;
    });

    // Register JSDoc helper
    Handlebars.registerHelper('jsdoc-code-example', function (jsdoctags: any[], options: any) {
        return options.fn({ tags: jsdoctags || [] });
    });

    // Register link-type helper as a simple partial
    Handlebars.registerHelper('link-type', function (type: any, options: any) {
        if (type && type.href) {
            return new Handlebars.SafeString(
                `<a href="${type.href}" target="${type.target || '_self'}">${type.raw || type}</a>`
            );
        }
        return type;
    });

    // Register built-in block helpers
    Handlebars.registerHelper('each', Handlebars.helpers.each);
    Handlebars.registerHelper('if', Handlebars.helpers.if);
    Handlebars.registerHelper('unless', Handlebars.helpers.unless);
    Handlebars.registerHelper('with', Handlebars.helpers.with);

    // Register common partials used in templates
    Handlebars.registerPartial(
        'component-detail',
        `
        {{#if component.description}}
            <p class="comment">
                <h3>{{t "description"}}</h3>
            </p>
            <p class="comment">
                {{{parseDescription component.description depth}}}
            </p>
        {{/if}}

        {{#if component.implements}}
            <p class="comment">
                <h3>{{t "implements"}}</h3>
            </p>
            <p class="comment">
                {{#each component.implements}}
                    <code>{{this}}</code>{{#unless @last}}, {{/unless}}
                {{/each}}
            </p>
        {{/if}}

        <section data-compodoc="block-metadata">
            <h3>{{t "metadata"}}</h3>
            <table class="table table-sm table-hover metadata">
                <tbody>
                    {{#if component.selector}}
                    <tr>
                        <td class="col-md-3">selector</td>
                        <td class="col-md-9"><code>{{component.selector}}</code></td>
                    </tr>
                    {{/if}}
                    {{#if component.templateUrl}}
                    <tr>
                        <td class="col-md-3">templateUrl</td>
                        <td class="col-md-9"><code>{{component.templateUrl}}</code></td>
                    </tr>
                    {{/if}}
                    {{#if component.styleUrls}}
                    <tr>
                        <td class="col-md-3">styleUrls</td>
                        <td class="col-md-9"><code>{{breakComma component.styleUrls}}</code></td>
                    </tr>
                    {{/if}}
                </tbody>
            </table>
        </section>

        {{#orLength component.properties component.methods component.inputs component.outputs}}
            <section data-compodoc="block-index">
                <h3 id="index">{{t "index"}}</h3>
                <table class="table table-sm table-bordered index-table">
                    <tbody>
                        {{#if component.methods}}
                        <tr>
                            <td class="col-md-4">
                                <h6><b>{{t "methods"}}</b></h6>
                            </td>
                        </tr>
                        <tr>
                            <td class="col-md-4">
                                <ul class="index-list">
                                    {{#each component.methods}}
                                    <li><a href="#{{name}}">{{name}}</a></li>
                                    {{/each}}
                                </ul>
                            </td>
                        </tr>
                        {{/if}}
                        {{#if component.properties}}
                        <tr>
                            <td class="col-md-4">
                                <h6><b>{{t "properties"}}</b></h6>
                            </td>
                        </tr>
                        <tr>
                            <td class="col-md-4">
                                <ul class="index-list">
                                    {{#each component.properties}}
                                    <li><a href="#{{name}}">{{name}}</a></li>
                                    {{/each}}
                                </ul>
                            </td>
                        </tr>
                        {{/if}}
                    </tbody>
                </table>
            </section>
        {{/orLength}}

        {{#if component.methods}}
            <section data-compodoc="block-methods">
                <h3 id="methods">{{t "methods"}}</h3>
                {{#each component.methods}}
                <table class="table table-sm table-bordered">
                    <tbody>
                        <tr>
                            <td class="col-md-4">
                                <a name="{{name}}"></a>
                                <span class="name">
                                    <span><b>{{name}}</b></span>
                                    <a href="#{{name}}"><span class="icon ion-ios-link"></span></a>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td class="col-md-4">
                                <code>{{name}}({{#each args}}{{name}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}})</code>
                            </td>
                        </tr>
                        {{#if description}}
                        <tr>
                            <td class="col-md-4">
                                <div class="io-description">{{description}}</div>
                                <div class="io-description">
                                    <b>Returns : </b><code>{{type}}</code>
                                </div>
                            </td>
                        </tr>
                        {{/if}}
                    </tbody>
                </table>
                {{/each}}
            </section>
        {{/if}}
    `
    );

    Handlebars.registerPartial('index', '<!-- Index partial placeholder -->');
    Handlebars.registerPartial('component-api', '<!-- Component API partial placeholder -->');
    Handlebars.registerPartial('interface-api', '<!-- Interface API partial placeholder -->');
    Handlebars.registerPartial(
        'block-relationships',
        '<!-- Relationships block partial placeholder -->'
    );
    Handlebars.registerPartial('link-type', '<code>{{type}}</code>');
    Handlebars.registerPartial(
        'reference-badge',
        '<span class="reference-badge" aria-hidden="true">{{letter}}</span>'
    );
    Handlebars.registerPartial(
        'file-path',
        `
        {{#unless disableFilePath}}
        {{#if filePath}}
        <div class="io-file io-file-path">
            <span class="icon ion-ios-document" aria-hidden="true"></span>
            <code>{{filePath}}</code>
        </div>
        {{/if}}
        {{/unless}}
    `
    );
}
