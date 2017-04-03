import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TodoComponent } from './todo.component';

import { FirstUpperPipe } from '../../shared/pipes/first-upper.pipe';

import { DoNothingDirective } from '../../shared/directives/do-nothing.directive';

/**
 * The todo module
 *
 * Contains the {@link TodoComponent}
 */
@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        TodoComponent,
        FirstUpperPipe,
        DoNothingDirective
    ],
    exports: [TodoComponent]
})
export class TodoModule { }
