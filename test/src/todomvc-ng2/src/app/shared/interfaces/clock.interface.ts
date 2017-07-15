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
