import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { ADirective } from './a.directive';

/**
 * This directive does nothing !
 */
@Directive({
    selector: '[donothing]',
})
export class DoNothingDirective extends ADirective {
    protected popover: string;

    /**
     * constructor description
     */
    constructor() {
        console.log('Do nothing directive');
    }

    /**
     * HostBinding description
     */
    @HostBinding('style.color') color: string;

    /**
     * HostListener description 1
     */
    @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
    onMouseup(mouseX: number, mouseY: number): void {}
    /**
     * HostListener description 2
     */
    @HostListener('mousedown', ['$event.clientX', '$event.clientY'])
    onMousedown(mouseX: number, mouseY: number): void {}
    /**
     * HostListener description 3
     */
    @HostListener('focus', ['$event'])
    @HostListener('click', ['$event'])
    onClick(e: Event): void {}
}
