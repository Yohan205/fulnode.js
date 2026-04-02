"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptString = encryptString;
exports.encryptFile = encryptFile;
const crypto_1 = require("crypto");
const zlib_1 = require("zlib");
const promises_1 = require("stream/promises");
const fs_1 = require("fs");
const types_1 = require("./types");
const SALT = 'fulnode-salt';
function scryptPromise(password, keyLen) {
    return new Promise((resolve, reject) => {
        (0, crypto_1.scrypt)(password, SALT, keyLen, (err, derivedKey) => {
            if (err)
                return reject(err);
            resolve(derivedKey);
        });
    });
}
function brotliCompressPromise(input, opts) {
    const options = { params: { [zlib_1.constants.BROTLI_PARAM_QUALITY]: types_1.BROTLI_PARAM_QUALITY }, ...(opts || {}) };
    return new Promise((resolve, reject) => {
        (0, zlib_1.brotliCompress)(input, options, (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        });
    });
}
async function encryptString(text, secret, options = {}) {
    const format = options.format ?? 'yec';
    if (format !== 'yec')
        throw new Error('encryptString only supports format "yec"');
    const algorithm = options.algorithm ?? 'aes-256-gcm';
    const alg = types_1.ALGORITHMS[algorithm];
    if (!alg)
        throw new Error('unsupported algorithm');
    const encoding = options.encoding ?? 'base64';
    const inputBuffer = Buffer.from(text, 'utf8');
    const compressed = await brotliCompressPromise(inputBuffer, options.brotliOptions);
    const key = await scryptPromise(secret, alg.keyLength);
    const iv = (0, crypto_1.randomBytes)(alg.ivLength);
    const cipher = (0, crypto_1.createCipheriv)(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
    const headerPrefix = `FULNODE.1.yec.${algorithm}`;
    const remaining = {
        compression: 'brotli',
        iv: iv.toString('hex'),
        encoding,
    };
    if (alg.authTagRequired) {
        const tag = cipher.getAuthTag();
        if (!tag)
            throw new Error('missing auth tag after encryption');
        remaining.authTag = tag.toString('hex');
    }
    const headerBlock = `${headerPrefix}\n${JSON.stringify(remaining)}`;
    const dataEncoded = encoding === 'hex' ? encrypted.toString('hex') : encrypted.toString('base64');
    return `${headerBlock}\n\n${dataEncoded}`;
}
async function encryptFile(inputPath, outputPath, secret, options = {}) {
    const format = options.format ?? 'myec';
    if (format !== 'myec')
        throw new Error('encryptFile only supports format "myec"');
    const algorithm = options.algorithm ?? 'aes-192-cbc';
    const alg = types_1.ALGORITHMS[algorithm];
    if (!alg)
        throw new Error('unsupported algorithm');
    // file size check
    const stat = await fs_1.promises.stat(inputPath).catch(() => { throw new Error('invalid input file'); });
    const MAX_BYTES = 500 * 1024 * 1024;
    if (stat.size > MAX_BYTES)
        throw new Error('input file exceeds 500MB limit');
    const key = await scryptPromise(secret, alg.keyLength);
    const iv = (0, crypto_1.randomBytes)(alg.ivLength);
    // We'll compress -> encrypt stream, but we need to produce final file that begins with header.
    // For algorithms that produce authTag (GCM), capture tag after pipeline and then prepend final header.
    const tempPath = `${outputPath}.tmp-${Date.now()}`;
    try {
        const readStream = (0, fs_1.createReadStream)(inputPath);
        const brotli = (0, zlib_1.createBrotliCompress)({ params: { [zlib_1.constants.BROTLI_PARAM_QUALITY]: types_1.BROTLI_PARAM_QUALITY } });
        const cipher = (0, crypto_1.createCipheriv)(algorithm, key, iv);
        // write encrypted body to temp file
        const tempWrite = (0, fs_1.createWriteStream)(tempPath, { flags: 'w' });
        await (0, promises_1.pipeline)(readStream, brotli, cipher, tempWrite).catch((err) => { throw err; });
        // get authTag if necessary
        let authTagHex;
        if (alg.authTagRequired) {
            const tag = cipher.getAuthTag();
            if (!tag)
                throw new Error('missing auth tag after encryption');
            authTagHex = tag.toString('hex');
        }
        const headerPrefix = `FULNODE.1.myec.${algorithm}`;
        const remaining = {
            compression: 'brotli',
            iv: iv.toString('hex'),
        };
        if (authTagHex)
            remaining.authTag = authTagHex;
        // create final output: headerPrefix + json + \n\n + body(from temp)
        const outStream = (0, fs_1.createWriteStream)(outputPath, { flags: 'w' });
        outStream.write(headerPrefix + '\n' + JSON.stringify(remaining) + '\n\n');
        await (0, promises_1.pipeline)((0, fs_1.createReadStream)(tempPath), outStream).catch((err) => { throw err; });
    }
    catch (err) {
        // cleanup temp
        await fs_1.promises.unlink(tempPath).catch(() => { });
        throw err;
    }
    // cleanup temp
    await fs_1.promises.unlink(tempPath).catch(() => { });
}
//# sourceMappingURL=encrypt.js.map