"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptString = decryptString;
exports.decryptFile = decryptFile;
const crypto_1 = require("crypto");
const zlib_1 = require("zlib");
const promises_1 = require("stream/promises");
const fs_1 = require("fs");
const types_1 = require("./types");
const stream_1 = require("stream");
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
function brotliDecompressPromise(input) {
    return new Promise((resolve, reject) => {
        (0, zlib_1.brotliDecompress)(input, (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        });
    });
}
function parseHeaderFromString(payload) {
    const idx = payload.indexOf('\n\n');
    if (idx === -1)
        throw new Error('corrupted data: header separator not found');
    const headerBlock = payload.slice(0, idx);
    const dataEncoded = payload.slice(idx + 2);
    // Current compact format only: PREFIX_LINE (single line) or PREFIX_LINE\nJSON_REMAINING
    const nl = headerBlock.indexOf('\n');
    const prefix = nl === -1 ? headerBlock.trim() : headerBlock.slice(0, nl).trim();
    const remainingLine = nl === -1 ? '' : headerBlock.slice(nl + 1).trim();
    const parts = prefix.split('.');
    if (parts.length < 3)
        throw new Error('corrupted header prefix');
    const [format, verStr, algorithm, ...extras] = parts;
    const version = Number(verStr);
    // If remainingLine is JSON, that's the file case: parse it (current format)
    if (remainingLine && remainingLine.startsWith('{')) {
        let rem = {};
        try {
            rem = JSON.parse(remainingLine);
        }
        catch (e) {
            throw new Error('corrupted header remaining json');
        }
        const header = {
            version,
            format: format,
            algorithm: algorithm,
            compression: rem.compression ?? 'brotli',
            iv: rem.iv,
            authTag: rem.authTag,
            encoding: rem.encoding,
        };
        return { header, dataEncoded };
    }
    // Compact single-line extras only: [ivHex, authTagHex?, encoding?]
    const iv = extras[0];
    if (!iv)
        throw new Error('missing iv in header');
    const authTag = extras[1];
    const encoding = extras[2];
    const header = {
        version,
        format: format,
        algorithm: algorithm,
        compression: 'brotli',
        iv,
        ...(authTag ? { authTag } : {}),
        ...(encoding ? { encoding } : {}),
    };
    return { header, dataEncoded };
}
async function decryptString(encrypted, secret) {
    const { header, dataEncoded } = parseHeaderFromString(encrypted);
    if (header.version !== 1)
        throw new Error('Unsupported format version');
    const algorithm = header.algorithm;
    const alg = types_1.ALGORITHMS[algorithm];
    if (!alg)
        throw new Error('unsupported algorithm');
    const enc = header.encoding ?? 'base64';
    const encryptedBuf = enc === 'hex' ? Buffer.from(dataEncoded, 'hex') : Buffer.from(dataEncoded, 'base64');
    const key = await scryptPromise(secret, alg.keyLength);
    const iv = Buffer.from(header.iv, 'hex');
    const decipher = (0, crypto_1.createDecipheriv)(algorithm, key, iv);
    if (alg.authTagRequired) {
        if (!header.authTag)
            throw new Error('missing auth tag');
        decipher.setAuthTag(Buffer.from(header.authTag, 'hex'));
    }
    let decrypted;
    try {
        decrypted = Buffer.concat([decipher.update(encryptedBuf), decipher.final()]);
    }
    catch (err) {
        throw new Error('wrong secret or corrupted data');
    }
    const decompressed = await brotliDecompressPromise(decrypted);
    return decompressed.toString('utf8');
}
async function extractHeaderFromStream(readStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let accumulated = Buffer.alloc(0);
        function onData(chunk) {
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
                // legacy JSON header
                if (headerText.trim().startsWith('{')) {
                    try {
                        const header = JSON.parse(headerText);
                        return resolve({ header, remainder });
                    }
                    catch (err) {
                        return reject(new Error('corrupted header'));
                    }
                }
                // compact header: prefix\nmaybe-json
                const firstNewline = headerText.indexOf('\n');
                const prefix = firstNewline === -1 ? headerText.trim() : headerText.slice(0, firstNewline).trim();
                const remainingJson = firstNewline === -1 ? '' : headerText.slice(firstNewline + 1).trim();
                const parts = prefix.split('.');
                if (parts.length < 3)
                    return reject(new Error('corrupted header prefix'));
                const [format, verStr, algorithm, ...extras] = parts;
                const version = Number(verStr);
                if (remainingJson && remainingJson.startsWith('{')) {
                    let rem = {};
                    try {
                        rem = JSON.parse(remainingJson);
                    }
                    catch (e) {
                        return reject(new Error('corrupted header remaining json'));
                    }
                    const header = {
                        version,
                        format: format,
                        algorithm: algorithm,
                        compression: rem.compression ?? 'brotli',
                        iv: rem.iv,
                        authTag: rem.authTag,
                    };
                    return resolve({ header, remainder });
                }
                const iv = extras[0];
                if (!iv)
                    return reject(new Error('missing iv in header'));
                const authTag = extras[1];
                const header = {
                    version,
                    format: format,
                    algorithm: algorithm,
                    compression: 'brotli',
                    iv,
                    ...(authTag ? { authTag } : {}),
                };
                return resolve({ header, remainder });
            }
        }
        function onError(err) {
            readStream.removeListener('data', onData);
            reject(err);
        }
        readStream.on('data', onData);
        readStream.on('error', onError);
    });
}
async function decryptFile(inputPath, outputPath, secret) {
    const readStream = (0, fs_1.createReadStream)(inputPath);
    let header;
    let remainder;
    try {
        const extracted = await extractHeaderFromStream(readStream);
        header = extracted.header;
        remainder = extracted.remainder;
    }
    catch (err) {
        readStream.destroy();
        throw err;
    }
    if (header.version !== 1)
        throw new Error('Unsupported format version');
    const algorithm = header.algorithm;
    const alg = types_1.ALGORITHMS[algorithm];
    if (!alg)
        throw new Error('unsupported algorithm');
    const key = await scryptPromise(secret, alg.keyLength);
    const iv = Buffer.from(header.iv, 'hex');
    const decipher = (0, crypto_1.createDecipheriv)(algorithm, key, iv);
    if (alg.authTagRequired) {
        if (!header.authTag)
            throw new Error('missing auth tag');
        decipher.setAuthTag(Buffer.from(header.authTag, 'hex'));
    }
    // Put remainder back into stream and continue piping: remainder + rest of file -> decipher -> brotli -> out
    const pass = new stream_1.PassThrough();
    if (remainder && remainder.length)
        pass.push(remainder);
    readStream.on('data', (c) => pass.push(c));
    readStream.on('end', () => pass.push(null));
    readStream.on('error', (err) => pass.destroy(err));
    try {
        readStream.resume();
    }
    catch (e) { }
    const brotli = (0, zlib_1.createBrotliDecompress)();
    const writeStream = (0, fs_1.createWriteStream)(outputPath, { flags: 'w' });
    try {
        await (0, promises_1.pipeline)(pass, decipher, brotli, writeStream);
    }
    catch (err) {
        writeStream.destroy();
        throw new Error('pipeline error or corrupted data');
    }
}
//# sourceMappingURL=decrypt.js.map