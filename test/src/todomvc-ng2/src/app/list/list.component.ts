import { Component } from '@angular/core';

import { TodoStore } from '../shared/services/todo.store';

/**
 * The list of todos component
 */
@Component({
    selector: 'list',
    providers: [],
    templateUrl: './list.component.html'
})
export class ListComponent {
    /**
     * Local reference of TodoStore
     */
    todoStore: TodoStore;

    constructor(todoStore: TodoStore) {
		this.todoStore = todoStore;
	}
}
