import { Component, Input } from '@angular/core';

import { Todo } from '../../shared/models/todo.model';

import { TodoStore } from '../../shared/services/todo.store';

/**
 * An interface just for documentation purpose
 */
interface LabelledTodo {
    title: string;
    completed: Boolean;
    editing?: Boolean;
    readonly x: number;
}

/**
 * A function type interface just for documentation purpose
 * ```
 * let mySearch: SearchFunc;
 * mySearch = function(source: string, subString: string) {
 *     let result = source.search(subString);
 *     if (result == -1) {
 *         return false;
 *     }
 *     else {
 *         return true;
 *     }
 * }
 * ```
 */
interface SearchFunc {
    (source: string, subString: string): boolean;
}

/**
 * A indexable interface just for documentation purpose
 * ```
 * let myArray: StringArray;
 * myArray = ["Bob", "Fred"];
 * ```
 */
interface StringArray {
    [index: number]: string;
}

/**
 * A class interface just for documentation purpose
 * ```
 * class Clock implements ClockInterface {
 *     currentTime: Date;
 *     constructor(h: number, m: number) { }
 * }
 * ```
 */
interface ClockInterface {
    currentTime: Date;
    reset(): void;
}

/**
 * The todo component
 */
@Component({
    selector: 'todo',
    templateUrl: './todo.component.html'
})
export class TodoComponent {
    /**
     * The entry todo from the parent list
     */
    @Input() todo: Todo;

    /**
     * Local reference of TodoStore
     */
    todoStore: TodoStore;

    constructor(todoStore: TodoStore) {
		this.todoStore = todoStore;
	}

    remove(todo: Todo){
		this.todoStore.remove(todo);
	}

    toggleCompletion(todo: Todo) {
		this.todoStore.toggleCompletion(todo);
	}

    editTodo(todo: Todo) {
		todo.editing = true;
	}

    stopEditing(todo: Todo, editedTitle: string) {
		todo.title = editedTitle;
		todo.editing = false;
	}

	cancelEditingTodo(todo: Todo) {
		todo.editing = false;
	}

	updateEditingTodo(todo: Todo, editedTitle: string) {
		editedTitle = editedTitle.trim();
		todo.editing = false;

		if (editedTitle.length === 0) {
			return this.todoStore.remove(todo);
		}

		todo.title = editedTitle;

        this.todoStore.update();
	}
}
