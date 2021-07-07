import { Component, Input, Output, HostBinding, HostListener } from '@angular/core';
import { Todo } from '../models/todo.model';

import { DumbParentComponent } from './dumb-parent-component';

/**
 * @example
 * empty component
 *
 * @deprecated This component is deprecated
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
     * @deprecated This input is deprecated
     */
    @Input() public emptyInput: string;

    /**
     * @example
     * component output
     * @deprecated This output is deprecated
     */
    @Output() public emptyOutput: string;

    /**
     * @example
     * component accessor
     * @deprecated This getter is deprecated
     */
    get emptyAccessor() {
        return this._emptyAccessor;
    }
    /**
     * @deprecated This setter is deprecated
     */
    set emptyAccessor(val) {
        this._emptyAccessor = val;
    }
    private _emptyAccessor = '';

    /**
     * @example
     * component hostBinding
     *
     * @deprecated This hostbinding is deprecated
     */
    @HostBinding('emptyHostBinding')
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
