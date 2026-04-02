import { BrotliOptions } from 'zlib';
export interface EncryptOptions {
    format?: 'yec' | 'myec';
    algorithm?: 'aes-256-gcm' | 'aes-192-cbc';
    encoding?: 'base64' | 'hex';
    brotliOptions?: Partial<BrotliOptions>;
}
export interface AlgorithmConfig {
    keyLength: number;
    ivLength: number;
    authTagRequired: boolean;
}
export interface HeaderMetadata {
    magic: 'FULNODE';
    version: number;
    format: 'yec' | 'myec';
    algorithm: 'aes-256-gcm' | 'aes-192-cbc';
    compression: 'brotli';
    iv: string;
    authTag?: string;
    encoding?: 'base64' | 'hex';
}
export declare const ALGORITHMS: Record<string, AlgorithmConfig>;
export declare const BROTLI_PARAM_QUALITY = 11;
//# sourceMappingURL=types.d.ts.map