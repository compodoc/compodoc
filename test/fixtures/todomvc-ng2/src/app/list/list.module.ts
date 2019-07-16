import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ListComponent } from './list.component';

import { TodoModule } from './todo/';

const MODULES = [TodoModule, BrowserModule];

/**
 * The list of todos module
 *
 * Contains list component which can filter types of todos :
 *
 * | Type | API |
 * | --- | --- |
 * | completed | displayCompleted |
 * | all | displayAll |
 * | remaining | displayRemaining |
 */
@NgModule({
    imports: [MODULES],
    declarations: [ListComponent],
    exports: [ListComponent]
})
export class ListModule {}
