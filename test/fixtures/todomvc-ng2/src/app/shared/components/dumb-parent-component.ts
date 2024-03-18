import { Input, Output, output, input } from '@angular/core';

/**
 * Empty parent component for inheritance demo
 */
export class DumbParentComponent {
    @Input() public parentInput: string;

    label = input.required<string>();

    @Output() public parentoutput;

    currentChange = output<number>();

    public parentProperty;

    /**
     * HostBinding description
     */
    @HostBinding('style.color')
    color: string;

    @HostListener('mouseup')
    onMouseup(): void {}
}
