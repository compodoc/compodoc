import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * UserJourneyDiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/user-journey}
 *
 */
@Component({
    selector: 'app-user-journey-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class UserJourneyDiagramComponent {
	/**
	*
	 * ```mermaid
	 * journey
	 *     title My working day
	 *     section Go to work
	 *       Make tea: 5: Me
	 *       Go upstairs: 3: Me
	 *       Do work: 1: Me, Cat
	 *     section Go home
	 *       Go downstairs: 5: Me
	 *       Sit down: 5: Me
	 * ```
	*/
	diagram() {
		
	}
}