import { Component } from "@angular/core";

const COMPONENT_STYLE_URLS = ["bar.style.scss", "bar2.style.scss"];

/**
 * Component using styleUrls as a const variable reference
 */
@Component({
    selector: "app-style-urls-variable",
    template: `<p>style-urls-variable works</p>`,
    styleUrls: COMPONENT_STYLE_URLS,
})
export class StyleUrlsVariableComponent {}
