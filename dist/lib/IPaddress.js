"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalIPs = getLocalIPs;
exports.getPublicIP = getPublicIP;
const os = __importStar(require("os"));
const https = __importStar(require("https"));
/**
 * Devuelve las direcciones IPv4 locales (no loopback).
 */
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        const list = interfaces[name];
        if (!list)
            continue;
        for (const iface of list) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses;
}
/**
 * Obtiene la IP pública consultando un servicio externo (ipify).
 * Devuelve una promesa que resuelve la IP como string.
 */
function getPublicIP(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const req = https.get('https://api.ipify.org?format=json', (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json && typeof json.ip === 'string')
                        resolve(json.ip);
                    else
                        reject(new Error('Respuesta inválida del servicio de IP'));
                }
                catch (err) {
                    reject(err);
                }
            });
        });
        req.on('error', (err) => reject(err));
        req.setTimeout(timeout, () => {
            req.destroy(new Error('Request timed out'));
        });
    });
}
exports.default = { getLocalIPs, getPublicIP };
//# sourceMappingURL=IPaddress.js.map