import { EncryptOptions } from './types';
export declare function encryptString(text: string, secret: string, options?: EncryptOptions): Promise<string>;
export declare function encryptFile(inputPath: string, outputPath: string, secret: string, options?: EncryptOptions): Promise<void>;
//# sourceMappingURL=encrypt.d.ts.map