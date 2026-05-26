import { Routes } from '@angular/router';

import { authGuard, nonAuthGuard } from '../shared/data-access/auth.guard';

export default [
  {
    path: '',
    loadComponent: () => import('../home/home.component'),
  },
  {
    path: 'login',
    canMatch: [nonAuthGuard()],
    loadComponent: () => import('../login/login.component'),
  },
  {
    path: 'profile/:username',
    canMatch: [authGuard()],
    loadChildren: () => import('../profile/profile.routes'),
  },
] as Routes;
