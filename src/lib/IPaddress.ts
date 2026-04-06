import * as os from 'os';
import * as https from 'https';
import type { IncomingMessage } from 'http';

/**
 * | getLocalIPs |
 * Devuelve las direcciones IPv4 locales (no loopback).
 * @return {string[]} - Lista de direcciones IPv4 locales.
 */
export function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const list = interfaces[name];
    if (!list) continue;
    for (const iface of list) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  return addresses;
}

/**
 * | getPublicIP |
 * Obtiene la IP pública consultando un servicio externo (ipify).
 * @param {number} [timeout=5000] - Tiempo máximo en ms para la petición.
 * @return {Promise<string>} - Promesa que resuelve con la IP pública.
 */
export function getPublicIP(timeout = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get('https://api.ipify.org?format=json', (res: IncomingMessage) => {
      let data = '';
      res.on('data', (chunk: Buffer | string) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && typeof json.ip === 'string') resolve(json.ip);
          else reject(new Error('Respuesta inválida del servicio de IP'));
        } catch (err: any) {
          reject(err);
        }
      });
    });

    req.on('error', (err: Error) => reject(err));
    req.setTimeout(timeout, () => {
      req.destroy(new Error('Request timed out'));
    });
  });
}

export default { getLocalIPs, getPublicIP };
