import { Input, Output } from '@angular/core';

export class InputBase {
    public id = 'yo';

    public thefx() {}

    @Input() public externalLabel: string;

    @Output() public theoutput;
}
