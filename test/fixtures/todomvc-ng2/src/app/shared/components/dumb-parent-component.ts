import { Component, Input, Output, OnInit } from '@angular/core';

/**
 * Empty parent component for inheritance demo
 */
export class DumbParentComponent implements OnInit {
    @Input() public parentInput: string;

    @Output() public parentoutput;

    public parentProperty;

    ngOnInit() {}

    /**
     * HostBinding description
     */
    @HostBinding('style.color') color: string;

    @HostListener('mouseup')
    onMouseup(): void {}
}
