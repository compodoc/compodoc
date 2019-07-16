import { Directive, HostBinding, HostListener } from '@angular/core';

import { DoNothingDirectiveSchema } from './do-nothing-directive.metadata';

/**
 * This directive does nothing !
 */
@Directive(DoNothingDirectiveSchema)
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

    private _fullName: string;

    /**
     * Getter of _fullName
     * @return {string} _fullName value
     */
    get fullName(): string {
        return this._fullName;
    }

    /**
     * Setter of _fullName
     * @param  {string} newName The new name
     */
    set fullName(newName: string) {
        this._fullName = newName;
    }
}
