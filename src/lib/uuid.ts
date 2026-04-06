/**
 * | v1 |
 * Genera un identificador numérico aleatorio de longitud fija.
 * @param {number} [length=18] - Longitud del identificador a generar.
 * @return {string} - Identificador generado compuesto solo por dígitos.
 */
export function v1(length: number = 18) {
  if (typeof length !== "number" || !Number.isInteger(length))
    throw new TypeError('the "length" parameter must be an integer');
  if (length <= 0) throw new RangeError('the "length" parameter must be greater than 0');

  const base = "0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += base[Math.floor(Math.random() * base.length)];
  }

  return id;
}

/**
 * | v2 |
 * Genera un identificador alfanumérico aleatorio de longitud fija.
 * @param {number} [length=18] - Longitud del identificador a generar.
 * @return {string} - Identificador generado con mayúsculas, minúsculas y dígitos.
 */
export function v2(length: number = 18) {
  if (typeof length !== "number" || !Number.isInteger(length))
    throw new TypeError('the "length" parameter must be an integer');
  if (length <= 0) throw new RangeError('the "length" parameter must be greater than 0');

  const base = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += base[Math.floor(Math.random() * base.length)];
  }

  return id;
}

/**
 * | v4 |
 * Genera un UUID v4, intentando usar `crypto.randomUUID` si está disponible,
 * si no, genera un fallback compatible con RFC4122 v4.
 * @return {string} - UUID versión 4.
 */
export function v4() {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID();
  }

  // Fallback: RFC4122 version 4 compliant generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}