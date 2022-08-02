import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * FlowchartDiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/flowchart}
 *
 * ```mermaid
 * flowchart TD
 *     A[Start] --> B{Is it?}
 *     B -->|Yes| C[OK]
 *     C --> D[Rethink]
 *     D --> B
 *     B ---->|No| E[End]
 * ```
 *
 */
@Component({
    selector: 'app-flowchart-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class FlowchartDiagramComponent {
	/**
	*
	 * ```mermaid
	 * flowchart TB
	 *     c1-->a2
	 *     subgraph one
	 *     a1-->a2
	 *     end
	 *     subgraph two
	 *     b1-->b2
	 *     end
	 *     subgraph three
	 *     c1-->c2
	 *     end
	 *     one --> two
	 *     three --> two
	 *     two --> c2
	 * ```
	*/
	diagram() {
		
	}
}