type Iteratee = string | ((item: any) => any);
type Predicate = Record<string, any> | [string, any] | ((item: any) => boolean);

function getByPath(source: any, path: keyof any | string): any {
    if (source == null) {
        return undefined;
    }
    return String(path)
        .split('.')
        .reduce((value, key) => (value == null ? undefined : value[key]), source);
}

function toIteratee(iteratee: Iteratee): (item: any) => any {
    if (typeof iteratee === 'function') {
        return iteratee;
    }
    return item => getByPath(item, iteratee as string);
}

function toPredicate(predicate: Predicate): (item: any) => boolean {
    if (typeof predicate === 'function') {
        return predicate as (item: any) => boolean;
    }

    if (Array.isArray(predicate)) {
        const [key, value] = predicate;
        return item => isEqual(getByPath(item, key as string), value);
    }

    return item => {
        for (const key of Object.keys(predicate as any)) {
            if (!isEqual((item as any)[key], (predicate as any)[key])) {
                return false;
            }
        }
        return true;
    };
}

function compareValues(a: any, b: any): number {
    if (a === b) {
        return 0;
    }
    if (a == null) {
        return 1;
    }
    if (b == null) {
        return -1;
    }
    return a > b ? 1 : -1;
}

function hasOwn(source: object, key: string): boolean {
    return Object.keys(source).indexOf(key) !== -1;
}

function isArrayLike(collection: any): collection is ArrayLike<any> {
    return collection && typeof collection !== 'function' && typeof collection.length === 'number';
}

function toArray(collection: any): any[] {
    if (!collection) {
        return [];
    }
    if (Array.isArray(collection)) {
        return collection;
    }
    if (isArrayLike(collection)) {
        return Array.prototype.slice.call(collection);
    }
    return Object.keys(collection).map(key => collection[key]);
}

export function forEach(
    collection: any,
    iteratee: (value: any, index: number | string, collection: any) => void
): void {
    if (!collection) {
        return;
    }
    if (isArrayLike(collection)) {
        for (let index = 0; index < collection.length; index++) {
            iteratee(collection[index], index, collection);
        }
        return;
    }
    for (const key of Object.keys(collection)) {
        iteratee(collection[key], key, collection);
    }
}

export function sortBy(collection: any[] | null | undefined, iteratees: Iteratee | Iteratee[]): any[] {
    const selectors = (Array.isArray(iteratees) ? iteratees : [iteratees]).map(toIteratee);
    return toArray(collection)
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
            for (const selector of selectors) {
                const comparison = compareValues(selector(a.item), selector(b.item));
                if (comparison !== 0) {
                    return comparison;
                }
            }
            return a.index - b.index;
        })
        .map(entry => entry.item);
}

export function find(collection: any[] | null | undefined, predicate: Predicate): any {
    return toArray(collection).find(toPredicate(predicate));
}

export function findIndex(collection: any[] | null | undefined, predicate: Predicate): number {
    return toArray(collection).findIndex(toPredicate(predicate));
}

export function filter(collection: any, predicate: Predicate): any[] {
    return toArray(collection).filter(toPredicate(predicate));
}

export function map(collection: any, iteratee: (item: any) => any): any[] {
    return toArray(collection).map(iteratee);
}

export function includes(collection: any[] | string | null | undefined, value: any): boolean {
    return collection == null ? false : (collection as any).includes(value);
}

export function indexOf(collection: any[] | null | undefined, value: any): number {
    return collection == null ? -1 : collection.indexOf(value);
}

export function concat(...arrays: any[]): any[] {
    return ([] as any[]).concat(...arrays.filter(array => array != null));
}

export function slice<T>(collection: ArrayLike<T>, start?: number, end?: number): T[] {
    return Array.prototype.slice.call(collection, start, end);
}

export function flatMap(collection: any[] | null | undefined, iteratee: (item: any) => any[]): any[] {
    return concat(...toArray(collection).map(iteratee));
}

export function clone<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.slice() as any;
    }
    if (value && typeof value === 'object') {
        return Object.assign(Object.create(Object.getPrototypeOf(value)), value);
    }
    return value;
}

export function cloneDeep<T>(value: T, seen = new WeakMap<object, any>()): T {
    if (value == null || typeof value !== 'object') {
        return value;
    }
    if (seen.has(value as any)) {
        return seen.get(value as any);
    }
    if (value instanceof Date) {
        return new Date(value.getTime()) as any;
    }
    if (value instanceof RegExp) {
        return new RegExp(value.source, value.flags) as any;
    }
    if (Array.isArray(value)) {
        const result: any[] = [];
        seen.set(value, result);
        value.forEach((item, index) => {
            result[index] = cloneDeep(item, seen);
        });
        return result as any;
    }

    const result = Object.create(Object.getPrototypeOf(value));
    seen.set(value as any, result);
    for (const key of Object.keys(value as any)) {
        result[key] = cloneDeep((value as any)[key], seen);
    }
    return result;
}

export function isEqual(a: any, b: any, seen = new WeakMap<object, WeakSet<object>>()): boolean {
    if (Object.is(a, b)) {
        return true;
    }
    if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    const knownMatches = seen.get(a);
    if (knownMatches?.has(b)) {
        return true;
    }
    if (knownMatches) {
        knownMatches.add(b);
    } else {
        seen.set(a, new WeakSet<object>([b]));
    }

    if (a instanceof Date || b instanceof Date) {
        return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
    }
    if (a instanceof RegExp || b instanceof RegExp) {
        return a instanceof RegExp && b instanceof RegExp && String(a) === String(b);
    }
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        return a.every((item, index) => isEqual(item, b[index], seen));
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }
    for (const key of keysA) {
        if (!hasOwn(b, key) || !isEqual(a[key], b[key], seen)) {
            return false;
        }
    }
    return true;
}

export function uniq<T>(collection: T[] | null | undefined): T[] {
    return Array.from(new Set(toArray(collection)));
}

export function uniqWith(
    collection: any[] | null | undefined,
    comparator: (a: any, b: any) => boolean
): any[] {
    const result: any[] = [];
    for (const item of toArray(collection)) {
        if (!result.some(existing => comparator(item, existing))) {
            result.push(item);
        }
    }
    return result;
}

export function groupBy(collection: any[] | null | undefined, iteratee: Iteratee): Record<string, any[]> {
    const selector = toIteratee(iteratee);
    return toArray(collection).reduce((groups, item) => {
        const key = String(selector(item));
        groups[key] = groups[key] || [];
        groups[key].push(item);
        return groups;
    }, {} as Record<string, any[]>);
}

class Chain {
    constructor(private collection: any) {}

    public filter(predicate: Predicate): this {
        this.collection = filter(this.collection, predicate);
        return this;
    }

    public groupBy(iteratee: Iteratee): this {
        this.collection = groupBy(this.collection, iteratee);
        return this;
    }

    public values(): this {
        const source = this.collection || {};
        this.collection = Object.keys(source).map(key => source[key]);
        return this;
    }

    public map(iteratee: (item: any) => any): Chain {
        this.collection = map(this.collection, iteratee);
        return this;
    }

    public value(): any {
        return this.collection;
    }
}

export function chain(collection: any[] | null | undefined): Chain {
    return new Chain(collection || []);
}
