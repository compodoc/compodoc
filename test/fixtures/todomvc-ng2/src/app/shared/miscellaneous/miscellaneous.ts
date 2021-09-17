/**
 * PI constant
 * See {@link Todo} for service using it
 */
export const PI: number = 3.14;

export let PIT = 4;

/**
 * A foo bar function. Test link for other class {@link ListComponent}
 *
 * @param {string} status A status
 */
export function foo(status: string = 'toto'): string {
    console.log('bar');
    return 'yo';
}

export class StringIndexedItems<T> {
    [index: string]: T;
}

export interface TOTsdosds<T> {
    [yala: string]: T;
}

/**
 * Directions of the app
 */
export enum Direction {
    Up,
    Down,
    Left,
    Right
}

/*
export type Something = number | string;

export type Flags = {
    option1: boolean;
    option2: boolean;
}

export let yo:{ [index:string] : {message: string} } = {};
*/

export type ChartChange = 'creating' | 'created' | 'updating' | 'updated';

export type TableColumnTarget = number | string | (number | string)[];

export type TableSyncRenderer = Type<TableCellRendererBase> | TemplateRef<any>;

import { Todo } from '../models/todo.model';

export type LinearDomain = [number, number];

export type LinearTodo = [Todo, Todo];

export type TypeOrTypeArray = string | symbol | Array<string | symbol>;

export type RouterAdapterOptions = Pick<NavigationExtras, 'replaceUrl'>;

type Foo = '320' | '360' | '1440';

type Bar = `(min-width: ${Foo}px)`;

function sumFunction0({ a = 0, b = 1, c = 2 }: { a: number; b: number; c: number }) {
    return a + b + c;
}

function sumFunction(trackId, { a, b, c }: { a: number; b: number; c: number }, test: string) {
    return a + b + c;
}

var [first, second, third] = ['Laide', 'Gabriel', 'Jets'];
