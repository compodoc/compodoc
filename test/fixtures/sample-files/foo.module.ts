import { NgModule, BrowserModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FomsModule } from '@angular/forms';

@NgModule({
    imports: [BrowserModule, FomsModule],
    exports: [RouterModule, HttpModule]
})
export class FooModule {}
