import { Directive, HostBinding, HostListener, Input } from '@angular/core';

/**
 * The a directive
 */
@Directive({
    selector: '[a]',
})
export class ADirective {
    title: string;

    /**
     * constructor description
     */
    constructor() {}
}
