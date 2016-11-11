import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes }   from '@angular/router';

import { HeaderModule } from './header/';

import { AboutModule, AboutComponent } from './about/';

import { HomeModule, HomeComponent } from './home/';

import { ListModule } from './list/';

import { FooterModule } from './footer/';

import { AppComponent } from './app.component';

import { TodoStore } from './shared/services/todo.store';

const APP_ROUTES: Routes = [
    { path: 'about', component: AboutComponent },
    { path: '', component: HomeComponent}
];

/**
 * The bootstrapper module
 */
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        AboutModule,
        HomeModule,

        RouterModule.forRoot(APP_ROUTES)
    ],
    providers: [
        TodoStore
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
