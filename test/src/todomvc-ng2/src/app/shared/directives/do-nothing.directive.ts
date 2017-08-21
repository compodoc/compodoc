import { Directive, HostBinding, HostListener } from '@angular/core';

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

    /**
     * HostBinding description
     */
    @HostBinding('style.color') color: string;

    /**
     * HostListener description 1
     */
    @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
    onMouseup(mouseX: number, mouseY: number): void {

    }
    /**
     * HostListener description 2
     */
    @HostListener('mousedown', ['$event.clientX', '$event.clientY'])
    onMousedown(mouseX: number, mouseY: number): void {

    }
    /**
     * HostListener description 3
     */
    @HostListener('click')
    onClick(): void {

    }
}
