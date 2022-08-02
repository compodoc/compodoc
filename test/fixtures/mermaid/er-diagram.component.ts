import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * ERDiagramComponent description
 *
 * See {@link https://mermaid-js.github.io/mermaid/#/entityRelationshipDiagram}
 *
 * ```mermaid
 * erDiagram
 *     CAR ||--o{ NAMED-DRIVER : allows
 *     CAR {
 *         string registrationNumber
 *         string make
 *         string model
 *     }
 *     PERSON ||--o{ NAMED-DRIVER : is
 *     PERSON {
 *         string firstName
 *         string lastName
 *         int age
 *     }
 * ```
 *
 */
@Component({
    selector: 'app-er-diagram',
    styles: [],
    template: `
        <div class="host"></div>
    `
})
export class ERDiagramComponent {
	/**
	*
	 * ```mermaid
	 * erDiagram
	 *     CUSTOMER ||--o{ ORDER : places
	 *     CUSTOMER {
	 *         string name
	 *         string custNumber
	 *         string sector
	 *     }
	 *     ORDER ||--|{ LINE-ITEM : contains
	 *     ORDER {
	 *         int orderNumber
	 *         string deliveryAddress
	 *     }
	 *     LINE-ITEM {
	 *         string productCode
	 *         int quantity
	 *         float pricePerUnit
	 *     }
	 * ```
	*/
	diagram() {
		
	}
}