import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * SequenceDiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/sequenceDiagram}
 *
 * ```mermaid
 * sequenceDiagram
 *     participant Alice
 *     participant Bob
 *     Alice->>Bob: Hi Bob
 *     Bob->>Alice: Hi Alice
 * ```
 *
 */
@Component({
    selector: 'app-sequence-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class SequenceDiagramComponent {
	/**
	*
	 * ```mermaid
	 * sequenceDiagram
	 *     actor Alice
	 *     actor Bob
	 *     Alice->>Bob: Hi Bob
	 *     Bob->>Alice: Hi Alice
	 * ```
	*/
	diagram() {
		
	}
}