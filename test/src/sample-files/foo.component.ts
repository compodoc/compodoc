import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	selector: 'app-foo',
	styles: [`
		.host {
			width: 100%;
		  	height: 4px;
		  	top: 0;
		  	position: fixed;
		  	left: 0px;
		}
	`],
	template: `
		<div class="host">
			<div (click)="exampleOutput.emit({foo: 'bar'})"></div>
		</div>
	`
})
export class FooComponent {

	/**
	 * An example input
	 */
	@Input() exampleInput: string = 'foo';

	/**
	 * An example output
	 */
	@Output() exampleOutput: EventEmitter<{foo: string}> = new EventEmitter();

}