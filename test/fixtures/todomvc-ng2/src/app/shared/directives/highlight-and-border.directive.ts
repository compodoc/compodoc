import { Directive } from '@angular/core';
import { BorderDirective } from './border.directive';
import { HighlightDirective } from './highlight.directive';

@Directive({
    selector: '[appHighlightAndBorder]',
    hostDirectives: [
        {
            directive: HighlightDirective,
            inputs: ['color'],
        },
        {
            directive: BorderDirective,
            inputs: ['color'],
            outputs: ['tat', 'tit'],
        },
    ],
    standalone: true,
})
export class HighlightAndBorderDirective {}
