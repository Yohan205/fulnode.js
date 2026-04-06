import { randomBytes, createCipheriv, scrypt as scryptCb } from 'crypto';
import { brotliCompress, BrotliOptions, createBrotliCompress, constants as zlibConstants } from 'zlib';
import { pipeline as pipelineAsync } from 'stream/promises';
import { createReadStream, createWriteStream, promises as fsPromises } from 'fs';
import { ALGORITHMS, BROTLI_PARAM_QUALITY, EncryptOptions, HeaderMetadata } from './types';

const SALT = 'fulnode-salt';

function scryptPromise(password: string, keyLen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, SALT, keyLen, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey as Buffer);
    });
  });
}

function brotliCompressPromise(input: Buffer, opts?: Partial<BrotliOptions>): Promise<Buffer> {
  const options = { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: BROTLI_PARAM_QUALITY }, ...(opts || {}) } as BrotliOptions;
  return new Promise((resolve, reject) => {
    brotliCompress(input, options, (err, result) => {
      if (err) return reject(err);
      resolve(result as Buffer);
    });
  });
}

/**
 * | encryptString |
 * Encripta una cadena de texto usando el algoritmo y opciones especificadas.
 * Devuelve una cadena con cabecera compacta y el cuerpo codificado.
 * @param {string} text - Texto plano a encriptar.
 * @param {string} secret - Clave secreta usada para derivar la llave.
 * @param {EncryptOptions} [options] - Opciones de compresión/algoritmo.
 * @return {Promise<string>} - Texto cifrado en formato `.yec` compacto.
 */
export async function encryptString(
  text: string,
  secret: string,
  options: EncryptOptions = {}
): Promise<string> {
  const format = options.format ?? 'yec';
  if (format !== 'yec') throw new Error('encryptString only supports format "yec"');

  const algorithm = options.algorithm ?? 'aes-256-gcm';
  const alg = ALGORITHMS[algorithm];
  if (!alg) throw new Error('unsupported algorithm');

  const encoding = options.encoding ?? 'base64';

  const inputBuffer = Buffer.from(text, 'utf8');
  const compressed = await brotliCompressPromise(inputBuffer, options.brotliOptions);

  const key = await scryptPromise(secret, alg.keyLength);
  const iv = randomBytes(alg.ivLength);

  const cipher = createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);

  // For string format (.yec) we produce a compact header without JSON.
  // New Format: yec.1.<algorithm>.<ivHex>[.<authTagHex>][.<encoding>]\n\n<data>
  const ivHex = iv.toString('hex');
  const fmt = 'yec';
  const parts = [fmt, '1', algorithm, ivHex];
  if (alg.authTagRequired) {
    const tag = (cipher as any).getAuthTag();
    if (!tag) throw new Error('missing auth tag after encryption');
    parts.push((tag as Buffer).toString('hex'));
  }
  if (encoding) parts.push(encoding);

  const headerLine = parts.join('.');
  const dataEncoded = encoding === 'hex' ? encrypted.toString('hex') : encrypted.toString('base64');
  return `${headerLine}\n\n${dataEncoded}`;
}

/**
 * | encryptFile |
 * Encripta un archivo en `inputPath` y escribe el resultado en `outputPath`.
 * Incluye cabecera JSON y cuerpo comprimido+encriptado.
 * @param {string} inputPath - Ruta del archivo de entrada.
 * @param {string} outputPath - Ruta del archivo de salida.
 * @param {string} secret - Clave secreta para la derivación de la llave.
 * @param {EncryptOptions} [options] - Opciones de cifrado y compresión.
 * @return {Promise<void>} - Promesa que resuelve al completar la operación.
 */
export async function encryptFile(
  inputPath: string,
  outputPath: string,
  secret: string,
  options: EncryptOptions = {}
): Promise<void> {
  const format = options.format ?? 'myec';
  if (format !== 'myec') throw new Error('encryptFile only supports format "myec"');

  const algorithm = options.algorithm ?? 'aes-192-cbc';
  const alg = ALGORITHMS[algorithm];
  if (!alg) throw new Error('unsupported algorithm');

  // file size check
  const stat = await fsPromises.stat(inputPath).catch(() => { throw new Error('invalid input file'); });
  const MAX_BYTES = 500 * 1024 * 1024;
  if (stat.size > MAX_BYTES) throw new Error('input file exceeds 500MB limit');

  const key = await scryptPromise(secret, alg.keyLength);
  const iv = randomBytes(alg.ivLength);

  // We'll compress -> encrypt stream, but we need to produce final file that begins with header.
  // For algorithms that produce authTag (GCM), capture tag after pipeline and then prepend final header.

  const tempPath = `${outputPath}.tmp-${Date.now()}`;

  try {
    const readStream = createReadStream(inputPath);
    const brotli = createBrotliCompress({ params: { [zlibConstants.BROTLI_PARAM_QUALITY]: BROTLI_PARAM_QUALITY } });
    const cipher = createCipheriv(algorithm, key, iv);

    // write encrypted body to temp file
    const tempWrite = createWriteStream(tempPath, { flags: 'w' });
    await pipelineAsync(readStream, brotli, cipher, tempWrite).catch((err) => { throw err; });

    // get authTag if necessary
    let authTagHex: string | undefined;
    if (alg.authTagRequired) {
      const tag = (cipher as any).getAuthTag();
      if (!tag) throw new Error('missing auth tag after encryption');
      authTagHex = (tag as Buffer).toString('hex');
    }

    const headerPrefix = `myec.1.${algorithm}`;
    const remaining: Partial<HeaderMetadata> = {
      compression: 'brotli',
      iv: iv.toString('hex'),
    };
    if (authTagHex) remaining.authTag = authTagHex;

    // create final output: headerPrefix + json + \n\n + body(from temp)
    const outStream = createWriteStream(outputPath, { flags: 'w' });
    outStream.write(headerPrefix + '\n' + JSON.stringify(remaining) + '\n\n');
    await pipelineAsync(createReadStream(tempPath), outStream).catch((err) => { throw err; });

  } catch (err) {
    // cleanup temp
    await fsPromises.unlink(tempPath).catch(() => {});
    throw err;
  }

  // cleanup temp
  await fsPromises.unlink(tempPath).catch(() => {});
}
