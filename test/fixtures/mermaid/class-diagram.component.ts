import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * ClassDiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/classDiagram}
 *
 * ```mermaid
 * classDiagram
 *     class BankAccount
 *     BankAccount : +String owner
 *     BankAccount : +Bigdecimal balance
 *     BankAccount : +deposit(amount)
 *     BankAccount : +withdrawal(amount)
 * ```
 *
 */
@Component({
    selector: 'app-class-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class ClassDiagramComponent {
	/**
	*
	 * ```mermaid
	 * classDiagram
	 *   direction RL
	 *   class Student {
	 *     -idCard : IdCard
	 *   }
	 *   class IdCard{
	 *     -id : int
	 *     -name : string
	 *   }
	 *   class Bike{
	 *     -id : int
	 *     -name : string
	 *   }
	 *   Student "1" --o "1" IdCard : carries
	 *   Student "1" --o "1" Bike : rides
	 * ```
	*/
	diagram() {
		
	}
}