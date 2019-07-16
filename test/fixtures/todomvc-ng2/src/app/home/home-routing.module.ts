import { NgModule, ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';

import { PATHS } from './paths';

const HOME_ROUTES: Routes = [{ path: PATHS.home.url, component: HomeComponent }];

export const HomeRoutingModule: ModuleWithProviders = RouterModule.forChild(HOME_ROUTES);
