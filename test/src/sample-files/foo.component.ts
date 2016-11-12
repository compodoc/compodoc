import { Component } from '@angular/core';

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
			<div></div>
		</div>
	`
})
export class FooComponent { }