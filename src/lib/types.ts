import { BrotliOptions } from 'zlib';

export interface EncryptOptions {
  format?: 'yec' | 'myec';
  algorithm?: 'aes-256-gcm' | 'aes-192-cbc';
  encoding?: 'base64' | 'hex'; // only for string flows
  brotliOptions?: Partial<BrotliOptions>;
}

export interface AlgorithmConfig {
  keyLength: number; // bytes
  ivLength: number; // bytes
  authTagRequired: boolean;
}

export interface HeaderMetadata {
  // `magic` removed from header output; keep optional for legacy compatibility
  magic?: 'FULNODE';
  version: number;
  format: 'yec' | 'myec';
  algorithm: 'aes-256-gcm' | 'aes-192-cbc';
  compression: 'brotli';
  iv: string; // hex
  authTag?: string; // hex, when applicable
  // optional helper field for string encoding
  encoding?: 'base64' | 'hex';
}

export const ALGORITHMS: Record<string, AlgorithmConfig> = {
  'aes-256-gcm': {
    keyLength: 32,
    ivLength: 12,
    authTagRequired: true,
  },
  'aes-192-cbc': {
    keyLength: 24,
    ivLength: 16,
    authTagRequired: false,
  },
};

export const BROTLI_PARAM_QUALITY = 11;
