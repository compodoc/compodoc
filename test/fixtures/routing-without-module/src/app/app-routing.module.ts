import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'example',
        loadChildren: 'app/example/example.module#ExampleModule'
    },
    { path: '', redirectTo: 'example', pathMatch: 'full' },
    { path: '**', redirectTo: 'example', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule {}
