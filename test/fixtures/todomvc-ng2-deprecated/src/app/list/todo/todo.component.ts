import { Component, Input } from '@angular/core';

import { Todo } from '../../shared/models/todo.model';

import { TodoStore } from '../../shared/services/todo.store';

/**
 * The todo component
 * ```html
 * <todo>
 *    [todo]="todo"
 * </todo>
 * ```
 *
 * <example-url>/demo/mysample.component.html</example-url>
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

    unionVariable: string[] | Todo;

    public filter(term: string, fields?: (string | number)[]): void;

    /**
     * Local reference of TodoStore
     */
    todoStore: TodoStore;

    constructor(todoStore: TodoStore) {
        this.todoStore = todoStore;
    }

    remove(todo: Todo) {
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
