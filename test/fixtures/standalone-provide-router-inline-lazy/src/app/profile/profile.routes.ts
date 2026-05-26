import { Routes } from '@angular/router';

import { provideProfileArticlesType } from './articles/articles.di';

export default [
  {
    path: '',
    loadComponent: () => import('./profile.component'),
    children: [
      {
        path: '',
        providers: [provideProfileArticlesType('my')],
        loadComponent: () => import('./articles/articles.component'),
      },
      {
        path: 'favorites',
        providers: [provideProfileArticlesType('favorites')],
        loadComponent: () => import('./articles/articles.component'),
      },
    ],
  },
] as Routes;
