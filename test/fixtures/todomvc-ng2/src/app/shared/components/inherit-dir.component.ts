import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseDirective } from '../base.directive';

@Component({
    template: ''
})
export class InheritDirComponent extends BaseDirective {
    @Input() testPropertyInComponent = false;
    @Output() testEventInComponent = new EventEmitter<void>();
}
