import { NgModule } from '@angular/core';

import { AboutComponent } from './about.component';

/**
 * The header module
 */
@NgModule({
    declarations: [
        AboutComponent
    ],
    exports: [AboutComponent]
})
export class AboutModule { }
