import { Component, Input } from '@angular/core';

import { TodoStore } from '../shared/services/todo.store';

import { HeaderComponentSchema as MyAlias } from './header-component.metadata';

/**
 * The header component
 */
@Component(MyAlias)
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
    newTodoText: string = '';

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

    private _fullName: string;

    /**
     * Getter of _fullName
     * @return {string} _fullName value
     */
    get fullName(): string {
        return this._fullName;
    }

    /**
     * Setter of _fullName
     * @param  {string} newName The new name
     */
    @Input()
    set fullName(newName: string) {
        this._fullName = newName;
    }
}
