import { Component } from '@angular/core';

/**
 * Component using the singular styleUrl property (Angular 17+ default)
 */
@Component({
    selector: 'app-style-url-singular',
    template: `<p>style-url-singular works</p>`,
    styleUrl: 'bar.style.scss'
})
export class StyleUrlSingularComponent {}
