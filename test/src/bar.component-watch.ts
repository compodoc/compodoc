import { Component, OnInit } from '@angular/core';
import { BarService } from './bar.service';

/**
 * The bar Component
 */
@Component({
	selector: 'app-bar',
	templateUrl: `bar.template.html`,
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
