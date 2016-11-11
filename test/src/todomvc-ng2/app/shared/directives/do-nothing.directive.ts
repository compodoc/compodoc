import { Directive } from '@angular/core';

/**
 * This directive does nothing !
 */
@Directive({
    selector: '[donothing]'
})
export class DoNothingDirective {
    constructor() {
        console.log('Do nothing directive');
    }
}
