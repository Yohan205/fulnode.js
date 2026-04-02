# Ejemplos de uso — fulnode.js

## Encriptar y desencriptar un string (formato `.yec`)

El flujo para strings utiliza `aes-256-gcm` por defecto y devuelve un bloque con header compacto:

- Línea 1: `FULNODE.1.yec.aes-256-gcm`
- Línea 2: JSON con campos restantes: `{"compression":"brotli","iv":"...","encoding":"base64","authTag":"..."}`
- Línea 3: (vacía)
- Luego: datos codificados (base64 o hex según `encoding`).

```javascript
const { encryptString, decryptString } = require('./dist');

(async () => {
  const secret = 'mi-secreto';
  const texto = 'Mensaje secreto de ejemplo';

  const cifrado = await encryptString(texto, secret);
  const claro = await decryptString(cifrado, secret);
  console.log('String OK:', claro === texto);
})();
```

## Encriptar y desencriptar un archivo (streams, formato `.myec`)

El flujo para archivos usa `aes-192-cbc` por defecto y produce un archivo binario con header compacto:

- Línea 1: `FULNODE.1.myec.aes-192-cbc`
- Línea 2: JSON con `compression`, `iv` y `authTag` (si aplica)
- Línea 3: (vacía)
- Luego: datos binarios cifrados

```javascript
const { encryptFile, decryptFile } = require('./dist');

(async () => {
  const secret = 'mi-secreto';
  await encryptFile('ruta/entrada.bin', 'ruta/salida.myec', secret);
  await decryptFile('ruta/salida.myec', 'ruta/salida-descrypted.bin', secret);
})();
```

## Opciones disponibles

```text
{ format: 'yec'|'myec', algorithm: 'aes-256-gcm'|'aes-192-cbc', encoding: 'base64'|'hex' }
```

---

El header compacto facilita el reconocimiento rápido del formato y mantiene metadatos críticos (iv, authTag) en JSON separado para evitar ambigüedades con datos binarios.
