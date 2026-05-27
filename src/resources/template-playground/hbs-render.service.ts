import { Injectable } from '@angular/core';

declare const Handlebars: any;

@Injectable({
  providedIn: 'root'
})
export class HbsRenderService {
  private handlebarsInstance: any;

  constructor() {
    this.initializeHandlebars();
  }

  private initializeHandlebars() {
    // Create a new Handlebars instance for the playground
    this.handlebarsInstance = Handlebars.create();

    // Register common helpers used in Compodoc templates
    this.registerHelpers();
  }

  private registerHelpers() {
    // Register the 'compare' helper
    this.handlebarsInstance.registerHelper('compare', (left: any, operator: string, right: any, options: any) => {
      let result;
      switch (operator) {
        case '===':
          result = left === right;
          break;
        case '!==':
          result = left !== right;
          break;
        case '<':
          result = left < right;
          break;
        case '>':
          result = left > right;
          break;
        case '<=':
          result = left <= right;
          break;
        case '>=':
          result = left >= right;
          break;
        default:
          result = false;
      }
      return result ? options.fn(this) : options.inverse(this);
    });

    // Register the 'unless' helper
    this.handlebarsInstance.registerHelper('unless', (conditional: any, options: any) => {
      return !conditional ? options.fn(this) : options.inverse(this);
    });

    // Register the 'each' helper with index
    this.handlebarsInstance.registerHelper('each', (context: any, options: any) => {
      let ret = '';
      for (let i = 0; i < context.length; i++) {
        ret += options.fn(context[i], { data: { index: i } });
      }
      return ret;
    });

    // Register the 'if' helper
    this.handlebarsInstance.registerHelper('if', (conditional: any, options: any) => {
      return conditional ? options.fn(this) : options.inverse(this);
    });

    // Register the 'relativeURL' helper
    this.handlebarsInstance.registerHelper('relativeURL', (depth: number, page?: string) => {
      let url = '';
      for (let i = 0; i < depth; i++) {
        url += '../';
      }
      return url + (page || '');
    });

    // Register the 't' helper for translations
    this.handlebarsInstance.registerHelper('t', (key: string) => {
      // Simple translation mapping for preview
      const translations: { [key: string]: string } = {
        'info': 'Information',
        'api': 'API',
        'source': 'Source',
        'example': 'Example',
        'template': 'Template',
        'styles': 'Styles',
        'component': 'Component',
        'module': 'Module',
        'overview': 'Overview',
        'components': 'Components',
        'modules': 'Modules',
        'file': 'File',
        'description': 'Description',
        'selector': 'Selector',
        'properties': 'Properties',
        'methods': 'Methods',
        'inputs': 'Inputs',
        'outputs': 'Outputs',
        'relationships': 'Relationships',
        'relationships-used-by': 'Used by',
        'relationships-depends-on': 'Depends on'
      };
      return translations[key] || key;
    });

    // Register the 'orLength' helper
    this.handlebarsInstance.registerHelper('orLength', (...args: any[]) => {
      const options = args[args.length - 1];
      const values = args.slice(0, -1);

      for (const value of values) {
        if (value && value.length && value.length > 0) {
          return options.fn(this);
        }
      }
      return options.inverse(this);
    });

    // Register the 'isTabEnabled' helper
    this.handlebarsInstance.registerHelper('isTabEnabled', (navTabs: any[], tabId: string, options: any) => {
      const tab = navTabs && navTabs.find((t: any) => t.id === tabId);
      return tab ? options.fn(this) : options.inverse(this);
    });

    // Register the 'isInitialTab' helper
    this.handlebarsInstance.registerHelper('isInitialTab', (navTabs: any[], tabId: string, options: any) => {
      const isInitial = navTabs && navTabs.length > 0 && navTabs[0].id === tabId;
      return isInitial ? options.fn(this) : options.inverse(this);
    });
  }

  renderTemplate(templateContent: string, data: any): string {
    try {
      // Create a complete HTML document for preview
      const template = this.handlebarsInstance.compile(templateContent);
      const rendered = template({ data });

      // Wrap in a basic HTML structure for preview
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Template Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .preview-wrapper { border: 1px solid #ddd; padding: 20px; }
            .preview-notice { background: #f0f8ff; padding: 10px; margin-bottom: 20px; border-left: 4px solid #007bff; }
          </style>
        </head>
        <body>
          <div class="preview-notice">
            <strong>Template Preview:</strong> This is a live preview of your template with mock data.
          </div>
          <div class="preview-wrapper">
            ${rendered}
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Template Preview - Error</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .error { color: red; background: #fff5f5; padding: 20px; border: 1px solid #red; }
          </style>
        </head>
        <body>
          <div class="error">
            <h3>Template Error</h3>
            <p><strong>Error:</strong> ${error.message}</p>
            <p>Please check your template syntax and try again.</p>
          </div>
        </body>
        </html>
      `;
    }
  }

  getMockData(): any {
    return {
      documentationMainName: 'Sample Documentation',
      depth: 0,
      context: 'component',
      components: [
        {
          name: 'SampleComponent',
          selector: 'app-sample',
          file: 'src/app/sample/sample.component.ts',
          description: 'A sample component for demonstration',
          properties: [
            { name: 'title', type: 'string', description: 'The component title' },
            { name: 'isVisible', type: 'boolean', description: 'Whether the component is visible' }
          ],
          methods: [
            { name: 'ngOnInit', description: 'Lifecycle hook', signature: 'ngOnInit(): void' },
            { name: 'onClick', description: 'Handle click events', signature: 'onClick(event: MouseEvent): void' }
          ]
        }
      ],
      navTabs: [
        { id: 'info', label: 'Info', href: '#info' },
        { id: 'api', label: 'API', href: '#api' },
        { id: 'source', label: 'Source', href: '#source' },
        { id: 'example', label: 'Example', href: '#example' }
      ]
    };
  }
}
