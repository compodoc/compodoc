import { Injectable } from '@angular/core';

import { Todo } from '../models/todo.model';

/**
 * This service is a todo store
 */
@Injectable()
export class TodoStore {
    /**
     *  Local array of Todos
     */
    todos: Array<Todo>;

    constructor() {
        let persistedTodos = JSON.parse(localStorage.getItem('angular2-todos') || '[]');
        // Normalize back into classes
        this.todos = persistedTodos.map((todo: { _title: String, completed: Boolean }) => {
            let ret = new Todo(todo._title);
            ret.completed = todo.completed;
            return ret;
        });
    }

    private updateStore() {
        localStorage.setItem('angular2-todos', JSON.stringify(this.todos));
    }

    private getWithCompleted(completed: Boolean) {
        return this.todos.filter((todo: Todo) => todo.completed === completed);
    }

    /**
     *  All the todos are they __completed__ ?
     */
    allCompleted(): boolean {
        return this.todos.length === this.getCompleted().length;
    }

    /**
     *  Set all todos status (completed or not)
     */
    setAllTo(completed: Boolean) {
        this.todos.forEach((t: Todo) => t.completed = completed);
        this.updateStore();
    }

    /**
     *  Remove completed todos
     */
    removeCompleted() {
        this.todos = this.getWithCompleted(false);
        this.updateStore();
    }

    /**
     *  Get remaining todos
     */
    getRemaining() {
        return this.getWithCompleted(false);
    }

    /**
     *  Get completed todos
     */
    getCompleted() {
        return this.getWithCompleted(true);
    }

    /**
     *  Toggle completed todo status
     */
    toggleCompletion(todo: Todo) {
        todo.completed = !todo.completed;
        this.updateStore();
    }

    /**
     *  Remove todo
     */
    remove(todo: Todo) {
        this.todos.splice(this.todos.indexOf(todo), 1);
        this.updateStore();
    }

    /**
     *  Update store
     */
    update() {
        this.updateStore();
    }

    /**
     *  Add todo
     */
    add(title: String) {
        this.todos.push(new Todo(title));
        this.updateStore();
    }
}
