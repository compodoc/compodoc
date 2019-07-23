import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about.component';

const ABOUT_ROUTES: Routes = [{ path: '', component: AboutComponent }];

@NgModule({
    imports: [RouterModule.forChild(ABOUT_ROUTES)],
    exports: [RouterModule]
})
export class AboutRoutingModule {}
