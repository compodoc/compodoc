import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LOGIN } from './login.routes';

export const APP_ROUTES: Routes = [
    ...LOGIN,
    { path: 'about', loadChildren: './about/about.module#AboutModule' },
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
