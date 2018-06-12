import { ClockInterface } from './clock.interface';

/**
 * An interface just for documentation purpose
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
     currentTime: Date;
     constructor(h: number, m: number) { }
}
