import { Injectable } from '@angular/core';
import { PipeTransform, Pipe } from '@angular/core';
import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';

import { Todo } from './app/shared/models/todo.model';

import { LabelledTodo } from './app/shared/interfaces/interfaces';

namespace BSBO {

	export namespace Events {
        /**
         * A time interface just for documentation purpose
         */
		export interface TimeInterface2 {
            /**
             * The zone
             */
            zone: string;
        }

        /**
         * The todo class
         *
         * See {@link TodoStore} for service using it
         */
        export class Todo2 {
            /**
             * Completed status
             */
             completed: boolean;
             /**
              * Editing status
              */
             editing: boolean;

            /**
             * Title
             */
            private _title: string;
            get title() {
                return this._title;
            }
            set title(value: string) {
                this._title = value.trim();
            }

            static classMethod() {
                return 'hello';
            }

            constructor(title: string) {
                this.completed = false;
                this.editing = false;
                this.title = title.trim();
            }

            /**
             *  fakeMethod !!
             *
             *  @example <caption>Usage of fakeMethod</caption>
             *
             *  returns true;
             *
             *  fakeMethod()
             */
            fakeMethod(): boolean {
                return true;
            }
        }

        /**
         * Uppercase the first letter of the string
         *
         * __Usage :__
         *   value | firstUpper:exponent
         *
         * __Example :__
         *   {{ car |  firstUpper}}
         *   formats to: Car
         */
        @Pipe({
            name: 'firstUpper'
        })
        export class FirstUpperPipe2 implements PipeTransform {
            transform(value, args) {
                return value.charAt(0).toUpperCase() + value.slice(1);
            }
        }

        /**
         * This service is a todo store
         *
         * See {@link Todo} for details about the main data of this store
         */
        @Injectable()
        export class TodoStore2 {
            /**
             *  Local array of Todos
             *
             *  See {@link Todo}
             */
            todos: Array<Todo>;

            constructor() {
                let persistedTodos = JSON.parse(localStorage.getItem('angular2-todos') || '[]');
                // Normalize back into classes
                this.todos = persistedTodos.map((todo: { _title: string, completed: boolean }) => {
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
             * All the todos are they __completed__ ?
             *
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
             * @param {boolean} completed Status of all todos
             */
            setAllTo(completed: boolean) {
                this.todos.forEach((t: Todo) => t.completed = completed);
                this.updateStore();
            }

            /**
             * Remove completed todos
             */
            removeCompleted() {
                this.todos = this.getWithCompleted(false);
                this.updateStore();
            }

            /**
             * Get remaining todos
             *
             * @returns {Array} All remaining todos
             */
            getRemaining() {
                return this.getWithCompleted(false);
            }

            /**
             * Get all todos
             *
             * @returns {Array} All todos
             */
            getAll() {
                return this.todos;
            }

            /**
             * Get completed todos
             *
             * @returns {Array} All completed todos
             */
            getCompleted() {
                return this.getWithCompleted(true);
            }

            /**
             * Toggle completed todo status
             *
             * @param {Todo} todo Todo which change status
             */
            toggleCompletion(todo: Todo) {
                todo.completed = !todo.completed;
                this.updateStore();
            }

            /**
             * Remove todo
             *
             * See {@link Todo}
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
             * Add todo
             *
             * @param {string} title Title of todo
             */
            add(title: string) {
                this.todos.push(new Todo(title));
                this.updateStore();
            }

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
        }

        /**
         * This directive does nothing !
         */
        @Directive({
            selector: '[donothing]'
        })
        export class DoNothingDirective2 {
            protected popover: string;

            /**
             * constructor description
             */
            constructor() {
                console.log('Do nothing directive');
            }

            /**
             * HostBinding description
             */
            @HostBinding('style.color') color: string;

            /**
             * HostListener description 1
             */
            @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
            onMouseup(mouseX: number, mouseY: number): void {

            }
            /**
             * HostListener description 2
             */
            @HostListener('mousedown', ['$event.clientX', '$event.clientY'])
            onMousedown(mouseX: number, mouseY: number): void {

            }
            /**
             * HostListener description 3
             */
            @HostListener('click')
            onClick(): void {

            }
        }

        /**
         * The about component
         *
         * Display some text with links for details about TodoMVC & Compodoc.
         */
        @Component({
            selector: 'about',
            template: 'about.component'
        })
        export class AboutComponent2 implements OnInit {
            ngOnInit() {

            }

            /**
             * HostListener mouseup description
             */
            @HostListener('mouseup')
            onMouseup(): void {

            }
        }

        /**
         * The about module
         *
         * Just embedding <about> component and it's routing definition in {@link AboutRoutingModule}
         */
        @NgModule({
            declarations: [

            ],
            imports: []
        })
        export class AboutModule2 { }

        /**
         * PI constant
         * See {@link Todo} for service using it
         */
        export const PI2:number = 3.14;

        /**
         * A foo bar function
         *
         * @param {string} status A status
         */
        export function foo2(status: string) {
            console.log('bar');
        }

        export type Name2 = string;

        export enum PopupEffect2 {
            fadeIn, fadeOut, bubbleIn, bubbleOut
        }
	}

}
