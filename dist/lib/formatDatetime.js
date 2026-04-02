"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = format;
exports.mstime = mstime;
exports.timestampToDate = timestampToDate;
/**
 * @param date - Data of type Date.
 */
function format(date) {
    if (!date)
        throw new Error('you have not defined the "date" parameter');
    const dateHours = date.getHours();
    const dateMin = date.getMinutes();
    const hh = dateHours > 12 ? dateHours - 12 : dateHours;
    const mm = dateMin < 10 ? `0${dateMin}` : dateMin;
    const tt = dateHours >= 12 ? "PM" : "AM";
    const hour = `${hh}:${mm} ${tt}`;
    const d = date.toLocaleDateString();
    return { hour, date: d };
}
/**
 * @param ms - The time in milliseconds
 */
function mstime(ms) {
    if (ms == null || isNaN(ms))
        throw new TypeError('the "ms" parameter is required and must be a number');
    if (ms < 0)
        throw new RangeError('the "ms" parameter must be >= 0');
    let ts = Math.floor(ms / 1000);
    const hs = 60 * 60;
    const years = ~~(ts / (hs * 24 * 30 * 12));
    ts %= hs * 24 * 30 * 12;
    const months = ~~(ts / (hs * 24 * 30));
    ts %= hs * 24 * 30;
    const weeks = ~~(ts / (hs * 24 * 7));
    ts %= hs * 24 * 7;
    const days = ~~(ts / (hs * 24));
    ts %= hs * 24;
    const hours = ~~(ts / hs);
    ts %= hs;
    const minutes = ~~(ts / 60);
    const seconds = ~~(ts % 60);
    return { years, months, weeks, days, hours, minutes, seconds };
}
/**
 * Convert a timestamp (seconds or milliseconds) or Date to the same
 * duration breakdown as `mstime`, computed as the absolute difference
 * between now and the provided timestamp.
 *
 * @param timestamp - Number (seconds or milliseconds), string, or Date
 */
function timestampToDate(timestamp) {
    if (timestamp == null)
        throw new TypeError('the "timestamp" parameter is required');
    let ms;
    if (timestamp instanceof Date)
        ms = timestamp.getTime();
    else if (typeof timestamp === 'string') {
        ms = Number(timestamp);
        if (isNaN(ms))
            throw new TypeError('the "timestamp" parameter must be a number or Date');
    }
    else if (typeof timestamp === 'number')
        ms = timestamp;
    else
        throw new TypeError('the "timestamp" parameter must be a number or Date');
    // If number looks like seconds (smaller than 1e12) treat as seconds
    if (ms > 0 && ms < 1e12)
        ms = ms * 1000;
    const diff = Math.abs(Date.now() - ms);
    return mstime(diff);
}
//# sourceMappingURL=formatDatetime.js.map