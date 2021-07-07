import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive()
export abstract class BaseDirective {
    @Input() testPropertyInBase = false;
    @Output() testEventInBase = new EventEmitter<void>();
}
