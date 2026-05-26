import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      [
        {
          path: 'home',
          loadComponent: () => import('./home/home.component'),
        },
        {
          path: 'about',
          loadChildren: () => import('./about/about.routes'),
        },
        {
          path: 'shell',
          loadComponent: () => import('./layout/layout.component'),
          loadChildren: () => import('./layout/layout.routes'),
        },
        { path: '', redirectTo: 'home', pathMatch: 'full' },
        { path: '**', redirectTo: 'home', pathMatch: 'full' },
      ],
      withHashLocation(),
    ),
  ],
};
