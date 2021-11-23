import { Injectable } from '@angular/core';

import { Todo } from '../models/todo.model';

/**
 * This service is a todo store
 * See {@link Todo} for details about the main data of this store
 * @deprecated This service is deprecated
 */
@Injectable()
export class TodoStore {
    /**
     *  Local array of Todos
     *  See {@link Todo}
     *  See also [Todo's completed property]{@link Todo#completed}
     */
    todos: Array<Todo>;

    constructor() {
        let persistedTodos = JSON.parse(localStorage.getItem('angular2-todos') || '[]');
        // Normalize back into classes
        this.todos = persistedTodos.map((todo: { _title: string; completed: Boolean }) => {
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
     * @returns {boolean} All completed ?
     */
    allCompleted(): boolean {
        return this.todos.length === this.getCompleted().length;
    }

    /**
     * Set all todos status (completed or not)
     *
     * @example
     * // set all at completed
     * TodoStore.setAllTo(true);
     *
     * @example
     * // set all at not completed
     * TodoStore.setAllTo(false);
     *
     * @param {boolean} completed Status of all todos -> see {@link FooterComponent}
     */
    setAllTo(completed: boolean) {
        this.todos.forEach((t: Todo) => (t.completed = completed));
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
     * @returns {Array} All remaining todos
     */
    getRemaining() {
        return this.getWithCompleted(false);
    }

    /**
     *  Get all todos
     * @returns {Array} All todos
     */
    getAll() {
        return this.todos;
    }

    /**
     *  Get completed todos
     * @returns {Array} All completed todos
     */
    getCompleted() {
        return this.getWithCompleted(true);
    }

    /**
     *  Toggle completed todo status
     * @param {Todo} todo Todo which change status
     */
    toggleCompletion(todo: Todo) {
        todo.completed = !todo.completed;
        this.updateStore();
    }

    /**
     * Remove todo
     *
     * @see {@link Todo} for details
     *
     * @param {Todo} todo Todo to remove
     * @param {any[]} theArgs the rest of arguments
     */
    remove(todo: Todo, ...theArgs) {
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
     * @param {string} title Title of todo
     */
    add(title: string) {
        this.todos.push(new Todo(title));
        this.updateStore();
    }

    firstFx(): string {
        return '5';
    }

    firstFx2(): number[] {
        return [5];
    }

    getSmallPet(): string | number {
        return 'E';
    }

    firstFx3(): LabelledTodo {
        return '5';
    }

    /**
     * @example
     */
    emptyExample() {}

    /**
     * Stop monitoring the todo
     *
     * @param {LabelledTodo} theTodo A todo
     * @returns {Promise<void>} promise resolved once we stop monitoring the todo or it is rejected
     */
    stopMonitoring(theTodo?: LabelledTodo): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            //TODO
        });
    }

    private _fullName: string;

    /**
     * Getter of _fullName or link to {@link Todo}
     * @deprecated This getter is deprecated
     * @return {string} _fullName value
     */
    get fullName(): string {
        return this._fullName;
    }

    /**
     * Setter of _fullName ore link to {@link Todo}
     * @deprecated This setter is deprecated
     * @param  {string} newName The new name
     */
    set fullName(newName: string) {
        this._fullName = newName;
    }

    /**
     * Gets some data
     * @returns Map<string, number>
     */
    get someData(): Map<string, number> {
        // do something here
        return '';
    }
}
