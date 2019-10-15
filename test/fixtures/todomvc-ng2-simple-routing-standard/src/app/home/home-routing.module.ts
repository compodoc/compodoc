import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';

const HOME_ROUTES: Routes = [{ path: 'home', component: HomeComponent }];

@NgModule({
    imports: [RouterModule.forChild(HOME_ROUTES)],
    exports: [RouterModule]
})
export class HomeRoutingModule {}
