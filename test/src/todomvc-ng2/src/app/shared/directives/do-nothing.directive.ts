import { Directive } from '@angular/core';

/**
 * This directive does nothing !
 */
@Directive({
    selector: '[donothing]'
})
export class DoNothingDirective {
    protected popover: string;

    constructor() {
        console.log('Do nothing directive');
    }

    ngOnDestroy() {

    }

    public submitTriggered() {

    }
}
