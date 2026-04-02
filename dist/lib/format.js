"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = format;
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
//# sourceMappingURL=format.js.map