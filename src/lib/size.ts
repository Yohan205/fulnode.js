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
export function size(bytes: number, options?: SizeOptions) {
  if (bytes == null || isNaN(bytes))
    throw new TypeError('the "bytes" parameter is required and must be a number');
  if (bytes === 0) return "0 Bytes";

  if (!options) options = {};
  const fixed = options.fixed === undefined || !Number.isFinite(options.fixed) ? 2 : Math.max(0, Math.floor(options.fixed));
  const gib = options.gib === undefined ? true : Boolean(options.gib);

  const k = gib ? 1024 : 1000;
  const sizes = gib
    ? ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
    : ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const negative = bytes < 0;
  let value = Math.abs(bytes);

  const i = Math.min(Math.floor(Math.log(value) / Math.log(k)), sizes.length - 1);
  value = value / Math.pow(k, i);

  return (negative ? "-" : "") + Number(value.toFixed(fixed)) + " " + sizes[i];
}
