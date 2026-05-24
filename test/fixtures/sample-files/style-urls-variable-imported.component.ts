import { Component } from "@angular/core";
import { COMPONENT_STYLE_URLS_IMPORTED } from "./style-urls-constants";

/**
 * Component using styleUrls as an imported const variable reference
 */
@Component({
    selector: "app-style-urls-variable-imported",
    template: `<p>style-urls-variable-imported works</p>`,
    styleUrls: COMPONENT_STYLE_URLS_IMPORTED,
})
export class StyleUrlsVariableImportedComponent {}
