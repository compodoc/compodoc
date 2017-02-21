import { Component, Input } from '@angular/core';

import { TodoStore } from '../shared/services/todo.store';

/**
 * The header component
 */
@Component({
    selector: 'header',
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    /**
     * Application main title
     */
    title: string = 'todos';

    /**
     * Local reference of TodoStore
     */
    todoStore: TodoStore;

    /**
     * The data-binding value of the input tag, added on enter to the todo store
     */
    @Input() newTodoText: string = '';

    constructor(todoStore: TodoStore) {
		this.todoStore = todoStore;
	}

    /**
     * Ad a todo to the list
     */
    addTodo() {
		if (this.newTodoText.trim().length) {
            this.todoStore.add(this.newTodoText);
			this.newTodoText = '';
		}
	}
}
