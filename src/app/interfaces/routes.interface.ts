export interface RouteInterface {
    name: string;
    kind?: string;
    filename?: string;
    className: string;
    module?: string;
    path?: string;
    loadChildren?: string;
    pathMatch?: string;
    redirectTo?: string;
    children?: RouteInterface[];
}
