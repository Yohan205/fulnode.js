export interface SizeOptions {
    fixed?: number;
    gib?: boolean;
}
/**
 * @param bytes - The bytes to abbreviate
 * @param [options] - Optional options
 * @param [options.fixed=2] - The number of digits to appear after the decimal point (default 2, to remove set to 0)
 * @param [options.gib=true] - Use the binary conversion.
 * @returns A human-readable representation of the abbreviated bytes.
 */
export declare function size(bytes: number, options?: SizeOptions): string;
//# sourceMappingURL=size.d.ts.map