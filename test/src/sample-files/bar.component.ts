import { Component } from '@angular/core';
import { BarService } from './bar.service';

@Component({
	selector: 'app-bar',
	templateUrl: `bar.template.html`,
	providers: [BarService]

})
export class BarComponent {

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

}