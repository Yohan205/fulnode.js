"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v1 = v1;
exports.v2 = v2;
exports.v4 = v4;
/**
 * @param {number} length specifies the length of the string to return (if not specified, defaults to 18)
 */
function v1(length = 18) {
    if (typeof length !== "number" || !Number.isInteger(length))
        throw new TypeError('the "length" parameter must be an integer');
    if (length <= 0)
        throw new RangeError('the "length" parameter must be greater than 0');
    const base = "0123456789";
    let id = "";
    for (let i = 0; i < length; i++) {
        id += base[Math.floor(Math.random() * base.length)];
    }
    return id;
}
function v2(length = 18) {
    if (typeof length !== "number" || !Number.isInteger(length))
        throw new TypeError('the "length" parameter must be an integer');
    if (length <= 0)
        throw new RangeError('the "length" parameter must be greater than 0');
    const base = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let id = "";
    for (let i = 0; i < length; i++) {
        id += base[Math.floor(Math.random() * base.length)];
    }
    return id;
}
function v4() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    // Fallback: RFC4122 version 4 compliant generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
//# sourceMappingURL=uuid.js.map