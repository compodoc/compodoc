import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TodoComponent } from './todo.component';

import { FirstUpperPipe } from '../../shared/pipes/first-upper.pipe';

import { DoNothingDirective } from '../../shared/directives/do-nothing.directive';

const PIPES_AND_DIRECTIVES = [FirstUpperPipe, DoNothingDirective];

/**
 * The todo module
 *
 * Contains the {@link TodoComponent}
 */
@NgModule({
    imports: [BrowserModule],
    declarations: [TodoComponent, PIPES_AND_DIRECTIVES],
    exports: [TodoComponent]
})
export class TodoModule {}
