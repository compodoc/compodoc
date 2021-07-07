import { Input, Output, PipeTransform, Pipe } from '@angular/core';

const name = 'firstUpper';
const pure = true;

/**
 * Uppercase the first letter of the string
 *
 * __Usage :__
 *   value | firstUpper
 *
 * @example
 *   {{ car |  firstUpper}}
 *   formats to: Car
 * @deprecated This pipe is deprecated
 */
@Pipe({
    name,
    pure
})
export class FirstUpperPipe implements PipeTransform {
    /**
     * Example property
     */
    private cachedUrl: string = '';

    /**
     * @example
     * pipe property
     */
    emptyProperty = '';

    /**
     * @example
     * pipe input
     */
    @Input() public emptyInput: string;

    /**
     * @example
     * pipe output
     */
    @Output() public emptyOutput: string;

    /**
     * @example
     * pipe accessor
     */
    get emptyAccessor() {
        return this._emptyAccessor;
    }
    set emptyAccessor(val) {
        this._emptyAccessor = val;
    }
    private _emptyAccessor = '';

    /**
     * @param emptyParam pipe method param
     * @returns pipe method return
     */
    emptyMethod(emptyParam: string) {
        return emptyParam;
    }

    /**
     * the transform function
     * @deprecated the transform function is deprecated
     * @param  {string} value the value of the pipe
     */
    transform(value: string): string {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}
