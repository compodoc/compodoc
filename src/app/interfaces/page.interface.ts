export interface PageInterface {
    name: string;
    filename?: string;
    context: string;
    path?: string;
    module?: any;
    pipe?: any;
    class?: any;
    interface?: any;
    directive?: any;
    injectable?: any;
    additionalPage?: any;
    files?: any;
    data?: any;
    depth?: number;
    pageType?: string;
    component?: any;
    markdown?: string;
}
