import { Component, Input, OnInit } from '@angular/core';

import { FirstClass } from './first-class';

/**
 * Empty component for inheritance demo
 */
@Component({
    selector: 'cp-multi',
    template: 'empty component'
})
export class MultiComponent extends FirstClass {
    @Input() public emptyInput: string;
}
