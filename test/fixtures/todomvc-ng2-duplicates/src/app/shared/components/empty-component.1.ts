import { Component, Input, OnInit } from '@angular/core';

import { EmptyParentComponent } from './empty-parent.component';

/**
 * Empty component for inheritance demo
 */
@Component({
    selector: 'cp-empty',
    template: 'empty component'
})
export class EmptyComponent extends EmptyParentComponent {
    @Input() public emptyInput: string;
}
