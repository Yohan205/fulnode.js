/**
 * Devuelve las direcciones IPv4 locales (no loopback).
 */
export declare function getLocalIPs(): string[];
/**
 * Obtiene la IP pública consultando un servicio externo (ipify).
 * Devuelve una promesa que resuelve la IP como string.
 */
export declare function getPublicIP(timeout?: number): Promise<string>;
declare const _default: {
    getLocalIPs: typeof getLocalIPs;
    getPublicIP: typeof getPublicIP;
};
export default _default;
//# sourceMappingURL=IPaddress.d.ts.map