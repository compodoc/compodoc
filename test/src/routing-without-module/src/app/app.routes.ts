import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'example',
    loadChildren: 'app/example/example.module#ExampleModule'
  },
  { path: '',   redirectTo: 'example', pathMatch: 'full' },
  { path: '**', redirectTo: 'example', pathMatch: 'full' }
];
