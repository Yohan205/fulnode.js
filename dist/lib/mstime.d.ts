/**
 * @param ms - The time in milliseconds
 */
export declare function mstime(ms: number): {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};
/**
 * Convert a timestamp (seconds or milliseconds) or Date to the same
 * duration breakdown as `mstime`, computed as the absolute difference
 * between now and the provided timestamp.
 *
 * @param timestamp - Number (seconds or milliseconds), string, or Date
 */
export declare function timestampToDate(timestamp: number | string | Date): {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};
//# sourceMappingURL=mstime.d.ts.map