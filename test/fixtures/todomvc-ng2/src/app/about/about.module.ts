import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AboutComponent } from './about.component';

import { AboutRoutingModule } from './about-routing.module';

import { TodoStore } from '../shared/services/todo.store';

const declarations = [
    AboutComponent
];
const imports = [
    AboutRoutingModule
];
const entryComponents = [AboutComponent];
const bootstrap = [
    AboutComponent
];
const id = 'toto';

const providers = [
    TodoStore
];
const schemas = [NO_ERRORS_SCHEMA];

/**
 * The about module
 *
 * Just embedding <about> component and it's routing definition in {@link AboutRoutingModule}
 */
@NgModule({
    declarations,
    imports,
    entryComponents,
    bootstrap,
    providers,
    id,
    schemas
})
export class AboutModule { }
