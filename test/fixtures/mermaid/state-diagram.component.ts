import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * StateDiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/stateDiagram}
 *
 * ```mermaid
 * stateDiagram-v2
 *     [*] --> Still
 *     Still --> [*]
 * 
 *     Still --> Moving
 *     Moving --> Still
 *     Moving --> Crash
 *     Crash --> [*]
 * ```
 *
 */
@Component({
    selector: 'app-state-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class StateDiagramComponent {
	/**
	*
	 * ```mermaid
	 *    stateDiagram-v2
	 *     state fork_state <<fork>>
	 *       [*] --> fork_state
	 *       fork_state --> State2
	 *       fork_state --> State3
	 * 
	 *       state join_state <<join>>
	 *       State2 --> join_state
	 *       State3 --> join_state
	 *       join_state --> State4
	 *       State4 --> [*]
	 * ```
	*/
	diagram() {
		
	}
}