import { Injectable } from '@angular/core';

@Injectable()
export class FooService {

    /**
     * @param {string} val The entry value
     * @returns {string} The string
     * @example
     * FooService.open('yala');
     */
    open(val: string): string {
        return 'test';
    }
}
