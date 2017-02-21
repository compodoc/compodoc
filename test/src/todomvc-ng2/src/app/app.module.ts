import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HomeModule } from './home/';

import { AppComponent } from './app.component';

import { TodoStore } from './shared/services/todo.store';

/* Routing Module */
import { AppRoutingModule }   from './app-routing.module';

/**
 * The bootstrapper module
 */
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        HomeModule,
        AppRoutingModule
    ],
    providers: [
        TodoStore
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
