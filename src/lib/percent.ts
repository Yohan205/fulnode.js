/**
 * @param portion - Proportionality of the specified total.
 * @param total - Total of specified proportionality.
 * @param fixed - The number of digits to appear after the decimal point (default 2, to remove set to 0)
 */
export function percent(portion: number, total: number, fixed: number = 2) {
  if (portion == null || isNaN(portion))
    throw new TypeError('the "portion" parameter is required and must be a number');
  if (total == null || isNaN(total))
    throw new TypeError('the "total" parameter is required and must be a number');
  if (total === 0) throw new RangeError('the "total" parameter must not be zero');
  if (!Number.isInteger(fixed) || fixed < 0) fixed = 2;

  return Number(((portion / total) * 100).toFixed(fixed));
}
