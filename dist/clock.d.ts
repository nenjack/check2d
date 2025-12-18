export type BaseFunction = () => void;
/**
 * Utility clock/loop class
 */
export declare class Clock {
    readonly delay: number;
    readonly events: BaseFunction[];
    /**
     * Fire each event then issue next tic
     */
    readonly toc: BaseFunction;
    /**
     * @param delay {number} how long between setTimeout tic-toc
     */
    constructor(delay?: number);
    /**
     * Issue next toc after delay with set timeout
     */
    tic(): void;
    /**
     * Add function to clock events
     * First add issues first tic
     * @param event {BaseFunction} function to add to events
     */
    add(event: BaseFunction): void;
    /**
     * Clear clock events
     */
    clear(): void;
}
export declare const clock: Clock;
