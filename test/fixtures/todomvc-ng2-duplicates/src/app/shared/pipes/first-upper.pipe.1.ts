import { PipeTransform, Pipe } from '@angular/core';

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
export class FirstUpperPipe implements PipeTransform {
    transform(value, args) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}
