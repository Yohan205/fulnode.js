import { createDecipheriv, scrypt as scryptCb } from 'crypto';
import { brotliDecompress, createBrotliDecompress } from 'zlib';
import { pipeline as pipelineAsync } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { ALGORITHMS, HeaderMetadata } from './types';
import { PassThrough } from 'stream';

const SALT = 'fulnode-salt';

function scryptPromise(password: string, keyLen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, SALT, keyLen, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey as Buffer);
    });
  });
}

function brotliDecompressPromise(input: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    brotliDecompress(input, (err, result) => {
      if (err) return reject(err);
      resolve(result as Buffer);
    });
  });
}

function parseHeaderFromString(payload: string): { header: HeaderMetadata; dataEncoded: string } {
  const idx = payload.indexOf('\n\n');
  if (idx === -1) throw new Error('corrupted data: header separator not found');
  const headerBlock = payload.slice(0, idx);
  const dataEncoded = payload.slice(idx + 2);

  // support new compact header: PREFIX_LINE\nJSON_REMAINING
  // or legacy full-json header
  let header: HeaderMetadata;
  if (headerBlock.trim().startsWith('{')) {
    try {
      header = JSON.parse(headerBlock) as HeaderMetadata;
    } catch (err) {
      throw new Error('corrupted header');
    }
    return { header, dataEncoded };
  }

  const firstNewline = headerBlock.indexOf('\n');
  if (firstNewline === -1) throw new Error('corrupted header format');
  const prefix = headerBlock.slice(0, firstNewline);
  const remainingJson = headerBlock.slice(firstNewline + 1);

  const parts = prefix.split('.');
  if (parts.length < 4) throw new Error('corrupted header prefix');
  const [magic, verStr, format, algorithm] = parts;
  if (magic !== 'FULNODE') throw new Error('invalid input');
  const version = Number(verStr);
  let remaining: any = {};
  try { remaining = JSON.parse(remainingJson); } catch (e) { throw new Error('corrupted header remaining json'); }

  header = {
    magic: 'FULNODE',
    version,
    format: format as 'yec' | 'myec',
    algorithm: algorithm as 'aes-256-gcm' | 'aes-192-cbc',
    compression: remaining.compression ?? 'brotli',
    iv: remaining.iv,
    authTag: remaining.authTag,
    encoding: remaining.encoding,
  } as HeaderMetadata;

  return { header, dataEncoded };
}

export async function decryptString(encrypted: string, secret: string): Promise<string> {
  const { header, dataEncoded } = parseHeaderFromString(encrypted);

  if (header.magic !== 'FULNODE') throw new Error('invalid input');
  if (header.version !== 1) throw new Error('Unsupported format version');
  const algorithm = header.algorithm;
  const alg = ALGORITHMS[algorithm];
  if (!alg) throw new Error('unsupported algorithm');

  const enc = header.encoding ?? 'base64';
  const encryptedBuf = enc === 'hex' ? Buffer.from(dataEncoded, 'hex') : Buffer.from(dataEncoded, 'base64');

  const key = await scryptPromise(secret, alg.keyLength);
  const iv = Buffer.from(header.iv, 'hex');
  const decipher = createDecipheriv(algorithm, key, iv);
  if (alg.authTagRequired) {
    if (!header.authTag) throw new Error('missing auth tag');
    (decipher as any).setAuthTag(Buffer.from(header.authTag, 'hex'));
  }

  let decrypted: Buffer;
  try {
    decrypted = Buffer.concat([decipher.update(encryptedBuf), decipher.final()]);
  } catch (err) {
    throw new Error('wrong secret or corrupted data');
  }

  const decompressed = await brotliDecompressPromise(decrypted);
  return decompressed.toString('utf8');
}

async function extractHeaderFromStream(readStream: NodeJS.ReadableStream): Promise<{ header: HeaderMetadata; remainder: Buffer }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let accumulated = Buffer.alloc(0);
    function onData(chunk: Buffer) {
      chunks.push(chunk);
      accumulated = Buffer.concat([...chunks]);
      const sepIdx = accumulated.indexOf('\n\n');
      if (sepIdx !== -1) {
        readStream.pause();
        readStream.removeListener('data', onData);
        readStream.removeListener('error', onError);
        const headerBuf = accumulated.slice(0, sepIdx);
        const remainder = accumulated.slice(sepIdx + 2);
        const headerText = headerBuf.toString('utf8');
        // detect legacy full-json header or new compact header
        if (headerText.trim().startsWith('{')) {
          try {
            const header = JSON.parse(headerText) as HeaderMetadata;
            return resolve({ header, remainder });
          } catch (err) {
            return reject(new Error('corrupted header'));
          }
        }

        const firstNewline = headerText.indexOf('\n');
        if (firstNewline === -1) return reject(new Error('corrupted header format'));
        const prefix = headerText.slice(0, firstNewline);
        const remainingJson = headerText.slice(firstNewline + 1);
        const parts = prefix.split('.');
        if (parts.length < 4) return reject(new Error('corrupted header prefix'));
        const [, verStr, format, algorithm] = parts;
        let remainingObj: any = {};
        try { remainingObj = JSON.parse(remainingJson); } catch (e) { return reject(new Error('corrupted header remaining json')); }
        const header: HeaderMetadata = {
          magic: 'FULNODE',
          version: Number(verStr),
          format: format as any,
          algorithm: algorithm as any,
          compression: remainingObj.compression ?? 'brotli',
          iv: remainingObj.iv,
          authTag: remainingObj.authTag,
        };
        return resolve({ header, remainder });
      }
    }
    function onError(err: Error) {
      readStream.removeListener('data', onData);
      reject(err);
    }
    readStream.on('data', onData);
    readStream.on('error', onError);
  });
}

export async function decryptFile(inputPath: string, outputPath: string, secret: string): Promise<void> {
  const readStream = createReadStream(inputPath);
  let header: HeaderMetadata;
  let remainder: Buffer;
  try {
    const extracted = await extractHeaderFromStream(readStream);
    header = extracted.header;
    remainder = extracted.remainder;
  } catch (err) {
    readStream.destroy();
    throw err;
  }

  if (header.magic !== 'FULNODE') throw new Error('invalid input');
  if (header.version !== 1) throw new Error('Unsupported format version');
  const algorithm = header.algorithm;
  const alg = ALGORITHMS[algorithm];
  if (!alg) throw new Error('unsupported algorithm');

  const key = await scryptPromise(secret, alg.keyLength);
  const iv = Buffer.from(header.iv, 'hex');
  const decipher = createDecipheriv(algorithm, key, iv);
  if (alg.authTagRequired) {
    if (!header.authTag) throw new Error('missing auth tag');
    (decipher as any).setAuthTag(Buffer.from(header.authTag, 'hex'));
  }

  // Put remainder back into stream and continue piping: remainder + rest of file -> decipher -> brotli -> out
  const pass = new PassThrough();
  if (remainder && remainder.length) pass.push(remainder);
  // resume piping remaining data from original readStream into pass
  readStream.on('data', (c) => pass.push(c));
  readStream.on('end', () => pass.push(null));
  readStream.on('error', (err) => pass.destroy(err));
  // ensure the original stream continues in flowing mode
  try { readStream.resume(); } catch (e) { /* ignore if not applicable */ }

  const brotli = createBrotliDecompress();
  const writeStream = createWriteStream(outputPath, { flags: 'w' });

  try {
    await pipelineAsync(pass, decipher, brotli, writeStream);
  } catch (err) {
    writeStream.destroy();
    throw new Error('pipeline error or corrupted data');
  }
}
