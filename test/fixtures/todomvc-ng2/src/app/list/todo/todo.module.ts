import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FirstUpperPipe } from '../../shared/pipes/first-upper.pipe';

const PIPES_AND_DIRECTIVES = [FirstUpperPipe];

/**
 * The todo module
 */
@NgModule({
    imports: [BrowserModule],
    declarations: [PIPES_AND_DIRECTIVES]
})
export class TodoModule {}
