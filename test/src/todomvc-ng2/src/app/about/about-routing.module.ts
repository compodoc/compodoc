import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about.component';
import { TodoMVCComponent } from './todomvc/todomvc.component';
import { CompodocComponent } from './compodoc/compodoc.component';

import { ABOUT_ENUMS } from './about-routes.enum';

import { pathMatchStrategy } from './path-match';

const ABOUT_ROUTES: Routes = [
    {
        path: ABOUT_ENUMS.todomvc, component: AboutComponent,
        children: [
            { path: '', redirectTo: 'todomvc', pathMatch: pathMatchStrategy.full },
            { path: 'todomvc', component: TodoMVCComponent },
            { path: 'compodoc', component: CompodocComponent }
        ]
    }
];

/**
 * About Routing module
 *
 * Exposing just two routes, one for Compodoc, the other one for TodoMVC
 */

@NgModule({
    imports: [RouterModule.forChild(ABOUT_ROUTES)],
    exports: [RouterModule],
    declarations: [
        TodoMVCComponent,
        CompodocComponent
    ]
})
export class AboutRoutingModule { }
