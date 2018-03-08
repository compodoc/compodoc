import { Component, Input, Output } from '@angular/core';

import { TodoStore } from '../shared/services/todo.store';

import { EmitterService } from '../shared/services/emitter.service';

import {
    LogMethod,
    LogProperty,
    LogPropertyWithArgs,
    LogClass,
    LogClassWithArgs
} from '../shared/decorators/log.decorator';

import { FooterComponentSchema } from './footer-component.metadata';

/**
 * The footer component
 */
@LogClassWithArgs('toto')
@Component(FooterComponentSchema)
export class FooterComponent {
    /**
     * Local reference of TodoStore
     */
    todoStore: TodoStore;
    /**
     * Local id for EmitterService
     */
    @LogProperty id: string = 'FooterComponent';

    /**
     * Starting filter param
     */
    @LogPropertyWithArgs('theCurrentFilter') currentFilter: string = 'all';

    /**
     * The "constructor"
     *
     * @param {TodoStore} todoStore A TodoStore
     */
    constructor(todoStore: TodoStore) {
        this.todoStore = todoStore;
    }

    /**
     * Removes all the completed todos
     */
    @LogMethod
    removeCompleted() {
        this.todoStore.removeCompleted();
    }

    /**
     * Display only completed todos
     */
    displayCompleted() {
        this.currentFilter = 'completed';
        EmitterService.get(this.id).emit('displayCompleted');
    }

    /**
     * Display only remaining todos
     */
    displayRemaining() {
        this.currentFilter = 'remaining';
        EmitterService.get(this.id).emit('displayRemaining');
    }

    /**
     * Display all todos
     */
    displayAll() {
        this.currentFilter = 'all';
        EmitterService.get(this.id).emit('displayAll');
    }

    /**
     * @ignore
     */
    ignoredProperty: string;

    /**
     * @ignore
     */
    @Input() ignoredInput: string;

    /**
     * @ignore
     */
    @Output() ignoredOutput;

    /**
     * @ignore
     */
    ignoredFunction() {}

    /**
     * @ignore
     */
    @HostBinding('style.color') color: string;

    /**
     * @ignore
     */
    @HostListener('mouseup', ['$event.clientX', '$event.clientY'])
    onMouseup(mouseX: number, mouseY: number): void {}

    /**
     * @ignore
     */
    get title() {
        return this._title;
    }
    /**
     * @ignore
     */
    set title(value: string) {
        this._title = value.trim();
    }
}
