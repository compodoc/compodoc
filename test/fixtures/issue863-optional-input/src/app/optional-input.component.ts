import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-optional-input',
    template: ''
})
export class OptionalInputComponent {
    @Input() optionalInput?: string;

    @Input() mandatoryInput: string;

    @Input({ required: true }) explicitlyRequiredInput?: string;

    optionalProperty?: string;
}
