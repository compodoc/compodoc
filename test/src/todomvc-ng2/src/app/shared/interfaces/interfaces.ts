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

/**
 * A class interface just for documentation purpose
 * ```typescript
 * class Clock implements ClockInterface {
 *     currentTime: Date;
 *     constructor(h: number, m: number) { }
 * }
 * ```
 */
interface ClockInterface {
    /**
     * The current time
     * @type {Date}
     */
    currentTime: Date;
    /**
     * A simple reset method
     */
    reset(): void;
}

class Clock implements ClockInterface {
     currentTime: Date;
     constructor(h: number, m: number) { }
}
