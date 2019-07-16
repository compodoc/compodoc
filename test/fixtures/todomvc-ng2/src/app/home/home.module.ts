import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';

import { HeaderModule } from '../header/';
import { ListModule } from '../list/';
import { FooterModule } from '../footer/';

const INTERNAL_MODULES = [
    HeaderModule,
    ListModule,
    FooterModule,
    HomeRoutingModule
]

/**
 * The header module
 *
 * Just embedding <home> component and it's routing definition in {@link HomeRoutingModule}
 */
@NgModule({
    declarations: [
        HomeComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,

        ...INTERNAL_MODULES
    ],
    exports: [HomeComponent]
})
export class HomeModule { }
