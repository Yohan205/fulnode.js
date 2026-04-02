"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mstime = mstime;
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
//# sourceMappingURL=mstime.js.map