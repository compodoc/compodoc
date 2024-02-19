import { Component, Input, OnInit } from '@angular/core';

import { InputBase } from './input-base';

import { AnotherComponent } from './another-component.component';

/**
 * The main component
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent extends AnotherComponent {
    constructor() {
        super();
    }

    @Input() public internalLabel: string;
}
