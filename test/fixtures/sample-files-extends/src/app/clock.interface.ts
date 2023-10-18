import { BooInterface } from './boo.interface';
import { TimeInterface } from './time.interface';

/**
 * A class interface just for documentation purpose
 *
 * ```typescript
 * class Clock implements ClockInterface {
 *     currentTime: Date;
 *     constructor(h: number, m: number) { }
 * }
 * ```
 */
interface ClockInterface extends TimeInterface, BooInterface {
    /**
     * The current time
     * @type {Date}
     * @deprecated The current time property is deprecated
     */
    currentTime: Date;
    /**
     * A simple reset method
     */
    reset(): void;
}
