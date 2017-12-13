import { NgModule } from '@angular/core';

import { AboutComponent } from './about.component';

import { AboutRoutingModule }    from './about-routing.module';

const declarations = [
    AboutComponent
];

/**
 * The about module
 *
 * Just embedding <about> component and it's routing definition in {@link AboutRoutingModule}
 */
@NgModule({
    declarations,
    entryComponents: [AboutComponent],
    imports: [AboutRoutingModule]
})
export class AboutModule { }
