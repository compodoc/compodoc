import { Component, OnInit } from '@angular/core';
import { BarService } from './bar.service';

@Component({
    selector: 'app-bar',
    templateUrl: `bar.template.html`,
    styleUrl: ['bar.style.scss'],
    providers: [BarService]
})
export class BarComponent implements OnInit {
    /**
     * foo method
     */
    normalMethod() {}

    /**
     * bar method
     * @internal
     */
    internalMethod() {}

    /**
     * @hidden
     */
    hiddenMethod() {}

    /**
     * @private
     */
    privateCommentMethod() {}

    private privateMethod() {}

    ngOnInit() {}
}
