import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * GitDiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/gitgraph}
 *
 * ```mermaid
 * gitGraph
 *    commit
 *    commit
 *    branch develop
 *    commit
 *    commit
 *    commit
 *    checkout main
 *    commit
 *    commit
 *    merge develop
 *    commit
 *    commit
 * ```
 *
 */
@Component({
    selector: 'app-git-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class GitDiagramComponent {
	/**
	*
	 * ```mermaid
	 *     gitGraph
	 *        commit id: "ZERO"
	 *        branch develop
	 *        commit id:"A"
	 *        checkout main
	 *        commit id:"ONE"
	 *        checkout develop
	 *        commit id:"B"
	 *        checkout main
	 *        commit id:"TWO"
	 *        cherry-pick id:"A"
	 *        commit id:"THREE"
	 *        checkout develop
	 *        commit id:"C"
	 * ```
	*/
	diagram() {
		
	}
}