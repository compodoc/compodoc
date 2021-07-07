import { HostBinding, HostListener, Input, Output } from '@angular/core';

import { ClockInterface } from './clock.interface';

/**
 * An interface just for documentation purpose
 * @deprecated This interface is deprecated
 */
interface LabelledTodo {
    title: string;
    completed: Boolean;
    editing?: Boolean;
    readonly x: number;
}

export interface ValueInRes {
    ['__allAnd']: boolean;
    ['__allOr']: boolean;
    [property: string]: any;
}

/**
 * A function type interface just for documentation purpose
 * ```typescript
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
    /**
     * A function
     * @param {string} source A string
     * @param {string} subString A substring
     */
    (source: string, subString: string): boolean;
}

/**
 * A indexable interface just for documentation purpose
 * ```typescript
 * let myArray: StringArray;
 * myArray = ["Bob", "Fred"];
 * ```
 */
interface StringArray {
    [index: number]: string;
}

class Clock implements ClockInterface {
    /**
     * @example
     * class property
     */
    currentTime: Date;

    /**
     * @example
     * class accessor
     */
    get emptyAccessor() {
        return this._emptyAccessor;
    }
    set emptyAccessor(val) {
        this._emptyAccessor = val;
    }
    private _emptyAccessor = '';
    constructor(h: number, m: number) {}

    /**
     * @example
     * class hostBinding
     */
    @HostBinding('')
    emptyHostBinding: string;

    /**
     * @example
     * class hostListener
     */
    @HostListener('')
    emptyHostListener() {}

    /**
     * @example
     * class input
     */
    @Input() public emptyInput: string;

    /**
     * @example
     * class output
     */
    @Output() public emptyOutput: string;

    /**
     * @param emptyParam class method param
     * @returns class method return
     */
    emptyMethod(emptyParam: string) {
        return emptyParam;
    }
}

interface IDATA {
    value: [number, string, number[]];
    value2: [string, string, ...boolean[]];
}
