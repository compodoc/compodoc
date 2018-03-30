import { Component, Input, OnInit } from '@angular/core';

import { EmptyParentComponent } from './empty-parent.component';

/**
 * Dumb component for inheritance demo
 */
@Component({
    selector: 'cp-dumb',
    template: 'dumb component'
})
export class DumbComponent extends DumbParentComponent {
    @Input() public emptyInput: string;
}
