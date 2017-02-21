import { Component } from '@angular/core';

import { TodoStore } from '../shared/services/todo.store';

/**
 * The footer component
 */
@Component({
    selector: 'footer',
    providers: [],
    templateUrl: './footer.component.html'
})
export class FooterComponent {
    /**
     * Local reference of TodoStore
     */
    todoStore: TodoStore;

    constructor(todoStore: TodoStore) {
		this.todoStore = todoStore;
	}

    removeCompleted() {
		this.todoStore.removeCompleted();
	}
}
