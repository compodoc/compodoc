import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

export const APP_ROUTES: Routes = [
    { path: 'about', loadChildren: async () => (await import('./about/about.module')).AboutModule },
    { path: 'toto', loadChildren: async () => (await import(`./toto/toto.module`)).TotoModule },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
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
