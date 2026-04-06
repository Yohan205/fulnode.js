/**
 * | format |
 * Devuelve una representación útil de la hora y la fecha para un objeto `Date`.
 * @param {Date} date - Objeto Date a formatear.
 * @return {{hour: string, date: string}} - Objeto con `hour` y `date`.
 */
export function format(date: Date) {
  if (!date) throw new Error('you have not defined the "date" parameter');
  const dateHours: number = date.getHours();
  const dateMin: number = date.getMinutes();

  const hh = dateHours > 12 ? dateHours - 12 : dateHours;
  const mm = dateMin < 10 ? `0${dateMin}` : dateMin;
  const tt = dateHours >= 12 ? "PM" : "AM";

  const hour = `${hh}:${mm} ${tt}`;
  const d = date.toLocaleDateString();

  return { hour, date: d };
}

/**
 * | mstime |
 * Convierte milisegundos en un desglose de años, meses, semanas, días, horas, minutos y segundos.
 * @param {number} ms - El tiempo en milisegundos.
 * @return {{years:number,months:number,weeks:number,days:number,hours:number,minutes:number,seconds:number}}
 */
export function mstime(ms: number) {
  if (ms == null || isNaN(ms))
    throw new TypeError('the "ms" parameter is required and must be a number');
  if (ms < 0) throw new RangeError('the "ms" parameter must be >= 0');

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
 * | timestampToDate |
 * Convierte un timestamp (segundos o milisegundos) o un `Date` al mismo desglose
 * retornado por `mstime`, calculando la diferencia absoluta entre ahora y el timestamp.
 * @param {number|string|Date} timestamp - Timestamp en segundos/milisegundos, string numérico o Date.
 * @return {{years:number,months:number,weeks:number,days:number,hours:number,minutes:number,seconds:number}}
 */
export function timestampToDate(timestamp: number | string | Date) {
  if (timestamp == null)
    throw new TypeError('the "timestamp" parameter is required');

  let ms: number;
  if (timestamp instanceof Date) ms = timestamp.getTime();
  else if (typeof timestamp === 'string') {
    ms = Number(timestamp);
    if (isNaN(ms))
      throw new TypeError('the "timestamp" parameter must be a number or Date');
  } else if (typeof timestamp === 'number') ms = timestamp;
  else
    throw new TypeError('the "timestamp" parameter must be a number or Date');

  // If number looks like seconds (smaller than 1e12) treat as seconds
  if (ms > 0 && ms < 1e12) ms = ms * 1000;

  const diff = Math.abs(Date.now() - ms);
  return mstime(diff);
}
