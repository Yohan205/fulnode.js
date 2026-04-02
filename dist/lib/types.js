"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BROTLI_PARAM_QUALITY = exports.ALGORITHMS = void 0;
exports.ALGORITHMS = {
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
exports.BROTLI_PARAM_QUALITY = 11;
//# sourceMappingURL=types.js.map