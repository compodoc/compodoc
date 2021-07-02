import { Component, Input, Output, HostBinding, HostListener } from '@angular/core';
import { Todo } from '../models/todo.model';

import { DumbParentComponent } from './dumb-parent-component';

/**
 * @example
 * empty component
 */
@Component({
    selector: 'cp-dumb',
    template: 'dumb component'
})
export class DumbComponent extends DumbParentComponent {
    /**
     * @example
     * component property
     */
    emptyProperty = '';

    _todo;

    /**
     * @example
     * component input
     */
    @Input() public emptyInput: string;

    /**
     * @example
     * component output
     */
    @Output() public emptyOutput: string;

    /**
     * @example
     * component accessor
     */
    get emptyAccessor() {
        return this._emptyAccessor;
    }
    set emptyAccessor(val) {
        this._emptyAccessor = val;
    }
    private _emptyAccessor = '';

    /**
     * @example
     * component hostBinding
     */
    @HostBinding('')
    emptyHostBinding: string;

    /**
     * @example
     * component hostListener
     */
    @HostListener('')
    emptyHostListener() {}

    /**
     * @param emptyParam component method param
     * @returns component method return
     */
    emptyMethod(emptyParam: string) {
        return emptyParam;
    }

    /**
     * @param {VisibleLayer} value
     */
    set visibleTodos(value: Todo) {
        this._todo = value;
    }
}
