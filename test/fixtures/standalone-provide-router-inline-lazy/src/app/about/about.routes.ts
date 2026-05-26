import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./about.component'),
  },
] as Routes;
