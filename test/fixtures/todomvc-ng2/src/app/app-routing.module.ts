import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { APP_ENUMS } from './app-routes.enum';

enum APP_ENUM {
    home = 'homeenuminfile'
}

const DEFAULT: Routes = [
    { path: '', redirectTo: APP_ENUMS.home, pathMatch: 'full' },
    { path: '**', redirectTo: APP_ENUM.home, pathMatch: 'full' }
];

export const APP_ROUTES: Routes = [
    { path: 'about', loadChildren: './about/about.module#AboutModule' },
    ...DEFAULT
];

/**
 * Main module routing
 *
 * Link to about module with lazy-loading, and instead to home component
 */
@NgModule({
    imports: [RouterModule.forRoot(APP_ROUTES)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
