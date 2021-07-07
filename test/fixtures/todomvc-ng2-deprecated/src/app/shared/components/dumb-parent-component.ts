import { Input, Output, HostBinding, HostListener } from '@angular/core';

/**
 * Empty parent component for inheritance demo
 */
export class DumbParentComponent {
    @Input() public parentInput: string;

    @Output() public parentoutput;

    public parentProperty;

    /**
     * HostBinding description
     */
    @HostBinding('style.color')
    color: string;

    /**
     * @deprecated This hostlistener is deprecated
     */
    @HostListener('mouseup')
    onMouseup(): void {}
}
