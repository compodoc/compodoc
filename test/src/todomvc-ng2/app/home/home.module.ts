import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HomeComponent } from './home.component';

import { HeaderModule } from '../header/';
import { ListModule } from '../list/';
import { FooterModule } from '../footer/';

/**
 * The header module
 */
@NgModule({
    declarations: [
        HomeComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,

        HeaderModule,
        ListModule,
        FooterModule
    ],
    exports: [HomeComponent]
})
export class HomeModule { }
