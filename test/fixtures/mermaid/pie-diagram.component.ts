import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * PieDiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/pie}
 *
 * ```mermaid
 * pie showData
 *     title Key elements in Product X
 *     "Calcium" : 42.96
 *     "Potassium" : 50.05
 *     "Magnesium" : 10.01
 *     "Iron" :  5
 * ```
 *
 */
@Component({
    selector: 'app-pie-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class PieDiagramComponent {
	/**
	*
	 * ```mermaid
	 * pie title Pets adopted by volunteers
	 *     "Dogs" : 386
	 *     "Cats" : 85
	 *     "Rats" : 15
	 * ```
	*/
	diagram() {
		
	}
}