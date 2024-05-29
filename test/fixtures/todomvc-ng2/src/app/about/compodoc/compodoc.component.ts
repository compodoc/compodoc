import { Component, model, input, Input, output } from '@angular/core';

/**
 * The compodoc component
 */
@Component({
    selector: 'compodoc',
    templateUrl: './compodoc.component.html',
    styleUrl: './compodoc.component.css'
})
export class CompodocComponent {
    // model input.
    checked = model(false);

    // model input.
    checkedInf = model<string>();

    // model input.
    checkedRequired = model.required<boolean>();

    // standard input.
    disabled = input(false);

    // optional input
    firstName = input<string>();

    // required inputs
    lastName = input.required<string>();

    buttonClick = output<MouseEvent>();

    buttonClickSimple = output();
}
