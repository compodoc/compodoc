import { Component, OnInit } from '@angular/core';
import { BarService } from './bar.service';

@Component({
    selector: 'app-bar',
    templateUrl: `bar.template.html`,
    styleUrls: ['bar.style.scss', 'bar2.style.scss'],
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

    protected varprotected: string;

    ngOnInit() {}

    public showTab(index) {
        // TOTO
    }
}
