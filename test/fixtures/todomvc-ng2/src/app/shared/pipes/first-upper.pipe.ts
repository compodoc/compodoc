import { PipeTransform, Pipe } from '@angular/core';

const name = 'firstUpper';
const pure = true;

/**
 * Uppercase the first letter of the string
 *
 * __Usage :__
 *   value | firstUpper
 *
 * __Example :__
 *   {{ car |  firstUpper}}
 *   formats to: Car
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
     * the transform function
     * @param  {string} value the value of the pipe
     */
    transform(value: string): string {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}
