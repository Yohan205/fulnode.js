/**
 * | percent |
 * Calcula el porcentaje que representa `portion` respecto a `total` y lo devuelve con
 * el número de decimales especificado.
 * @param {number} portion - Parte o porción del total.
 * @param {number} total - Total respecto al que se calcula el porcentaje.
 * @param {number} [fixed=2] - Número de decimales en el resultado.
 * @return {number} - Porcentaje calculado (ej. 12.34).
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
