import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FooterComponent } from './footer.component';

/**
 * The footer module
 */
@NgModule({
    imports: [BrowserModule],
    declarations: [FooterComponent],
    exports: [FooterComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class FooterModule {}
