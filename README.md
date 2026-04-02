# fulnode.js
Biblioteca de funciones y utilidades para Node.js
[![npm](https://img.shields.io/npm/v/@yohancolla/fulnode.js.svg)](https://www.npmjs.com/package/@yohancolla/fulnode.js)
[![npm](https://img.shields.io/npm/dt/@yohancolla/fulnode.js.svg?maxAge=3600)](https://www.npmjs.com/package/@yohancolla/fulnode.js)
[![install size](https://packagephobia.now.sh/badge?p=@yohancolla/fulnode.js)](https://packagephobia.now.sh/result?p=@yohancolla/fulnode.js)


[![NPM](https://nodei.co/npm/@yohancolla/fulnode.js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/@yohancolla/fulnode.js/)

Este repositorio contiene una colección de utilidades pequeñas y reutilizables (formatos de fecha, manejo de tamaños, porcentajes, identificación UUIDs, cifrado/descifrado y utilidades de red) pensadas para uso en proyectos Node.js.

**Tabla de contenido**

- [Instalación](#instalacion)
- [Uso rápido](#uso-rapido)
- [Uso detallado (funciones)](#uso)
	- [uuid.v1](#uuid-v1)
	- [uuid.v2](#uuid-v2)
	- [uuid.v4](#uuid-v4)
	- [format](#format)
	- [mstime](#mstime)
	- [timestampToDate](#timestamptodate)
	- [size](#size)
	- [percent](#percent)
	- [getLocalIPs](#getlocalips)
	- [getPublicIP](#getpublicip)
	- [encryptString](#encryptstring)
	- [encryptFile](#encryptfile)
	- [decryptString](#decryptstring)
	- [decryptFile](#decryptfile)
	- [ALGORITHMS (constantes)](#algorithms)
- [Notas sobre cifrado](#notas-sobre-cifrado)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Instalación

```bash
npm install fulnode.js
```

## Uso rápido

```js
const { size, percent, uuid, format } = require('fulnode.js');

console.log(size(153600));
// /**
//  * Return:
//  * ~$ 150.00 KiB
//  */

console.log(percent(25, 200));
// /**
//  * Return:
//  * ~$ 12.50
//  */

console.log(uuid.v4());
// /**
//  * Return:
//  * ~$ 550e8400-e29b-41d4-a716-446655440000
//  */
```

## Uso

En esta sección cada función incluye su descripción, una tabla con sus parámetros y un ejemplo.

<a id="uuid-v1"></a>
### uuid.v1(length?)

Genera un identificador numérico aleatorio de la longitud indicada.

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| `length` | `number` | Longitud del ID a generar. Debe ser entero positivo. | Sí | `18` |

Ejemplo:

```js
const { uuid } = require('fulnode.js');
console.log(uuid.v1(10));
// /**
//  * Return:
//  * ~$ 2052099580
//  */
```

<a id="uuid-v2"></a>
### uuid.v2(length?)

Genera un identificador alfanumérico (mayúsculas/minúsculas + números) de la longitud indicada.

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| `length` | `number` | Longitud del ID a generar. Debe ser entero positivo. | Sí | `18` |

Ejemplo:

```js
const { uuid } = require('fulnode.js');
console.log(uuid.v2(8));
// /**
//  * Return:
//  * ~$ aZ3k9B1q
//  */
```

<a id="uuid-v4"></a>
### uuid.v4()

Genera un UUID versión 4 conforme RFC4122. Usa `crypto.randomUUID()` cuando está disponible.

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| (ninguno) | - | - | Sí | - |

Ejemplo:

```js
const { uuid } = require('fulnode.js');
console.log(uuid.v4());
// /**
//  * Return:
//  * ~$ 3fa85f64-5717-4562-b3fc-2c963f66afa6
//  */
```

<a id="format"></a>
### format(date)

Formatea un `Date` en un objeto con `hour` (HH:MM AM/PM) y `date` (fecha local).

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| `date` | `Date` | Fecha a formatear. | No | - |

Ejemplo:

```js
const { format } = require('fulnode.js');
console.log(format(new Date('2026-04-02T15:30:00')));
// /**
//  * Return:
//  * ~$ { hour: '3:30 PM', date: '4/2/2026' }
//  */
```

<a id="mstime"></a>
### mstime(ms)

Descompone milisegundos en un objeto con `years`, `months`, `weeks`, `days`, `hours`, `minutes`, `seconds`.

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| `ms` | `number` | Tiempo en milisegundos, debe ser >= 0. | No | - |

Ejemplo:

```js
const { mstime } = require('fulnode.js');
console.log(mstime(3600000));
// /**
//  * Return:
//  * ~$ { years:0, months:0, weeks:0, days:0, hours:1, minutes:0, seconds:0 }
//  */
```

<a id="timestamptodate"></a>
### timestampToDate(timestamp)

Convierte un `timestamp` (segundos o milisegundos) o `Date` a la misma descomposición que `mstime`, calculando la diferencia absoluta con `Date.now()`.

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| `timestamp` | `number|string|Date` | Timestamp en segundos o ms, string numérica o `Date`. | No | - |

Ejemplo:

```js
const { timestampToDate } = require('fulnode.js');
console.log(timestampToDate(Date.now() - 5000));
// /**
//  * Return:
//  * ~$ { years:0, months:0, weeks:0, days:0, hours:0, minutes:0, seconds:5 }
//  */
```

<a id="size"></a>
### size(bytes, options?)

Convierte una cantidad de bytes a una representación legible (Bytes, KiB, MiB, ...).

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| `bytes` | `number` | Número de bytes. | No | - |
| `options.fixed` | `number` | Dígitos decimales mostrados. | Sí | `2` |
| `options.gib` | `boolean` | `true` para base 1024 (KiB), `false` para base 1000 (KB). | Sí | `true` |

Ejemplo:

```js
const { size } = require('fulnode.js');
console.log(size(153600));
// /**
//  * Return:
//  * ~$ 150.00 KiB
//  */
```

<a id="percent"></a>
### percent(portion, total, fixed?)

Calcula el porcentaje de `portion` sobre `total` multiplicado por 100 y redondeado a `fixed` decimales.

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| `portion` | `number` | Parte del total. | No | - |
| `total` | `number` | Total (no puede ser 0). | No | - |
| `fixed` | `number` | Decimales en el resultado. | Sí | `2` |

Ejemplo:

```js
const { percent } = require('fulnode.js');
console.log(percent(25, 200));
// /**
//  * Return:
//  * ~$ 12.50
//  */
```

<a id="getlocalips"></a>
### getLocalIPs()

Devuelve las direcciones IPv4 locales (no loopback) encontradas en las interfaces de red.

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| (ninguno) | - | - | Sí | - |

Ejemplo:

```js
const { getLocalIPs } = require('fulnode.js');
console.log(getLocalIPs());
// /**
//  * Return:
//  * ~$ [ '192.168.1.42' ]
//  */
```

<a id="getpublicip"></a>
### getPublicIP(timeout?)

Consulta `https://api.ipify.org?format=json` para obtener la IP pública y devuelve una `Promise<string>`.

| Parámetro | Tipo | Descripción | Opcional | Valor por defecto |
|---|---:|---|---:|---:|
| `timeout` | `number` | Tiempo máximo de espera en ms. | Sí | `5000` |

Ejemplo:

```js
const { getPublicIP } = require('fulnode.js');
getPublicIP(3000).then(ip => console.log(ip)).catch(console.error);
// /**
//  * Return:
//  * ~$ 93.184.216.34
//  */
```

<a id="encryptstring"></a>
### encryptString(text, secret, options?)

Cifra una cadena usando compresión Brotli + AES y devuelve un único string compacto con header y payload.

Detalles de implementación (coincide con `src/lib/encrypt.ts`):

- Soporta únicamente `format: 'yec'` (por ahora). Si `options.format` no es `'yec'` se lanza error.
- Algoritmo por defecto: `aes-256-gcm`. La configuración por algoritmo viene de `ALGORITHMS`.
- Codificación por defecto para el payload: `base64` (puede solicitarse `hex`).
- Usa `scrypt(password, 'fulnode-salt', keyLen)` para derivar la clave.
- Comprime con Brotli antes de cifrar (`BROTLI_PARAM_QUALITY` aplicado).

Formato retornado (compacto):

```
<format>.1.<algorithm>.<ivHex>[.<authTagHex>][.<encoding>]\n\n<payload>
```

Ejemplos concretos:

```js
const { encryptString } = require('fulnode.js');
(async () => {
  // Encriptar
  const encrypted = await encryptString('hola', 'mi-secreto');
  console.log(encrypted);
  /**
   * Return (ejemplo):
   * ~$ yec.1.aes-256-gcm.f1e2d3c4b5a6...deadbeefcafebabe...base64
   *
   * (esto representa: 'yec.1.<alg>.<ivHex>.<authTagHex>.<encoding>' + '\n\n' + '<base64-payload>')
   */
})();
```

Notas útiles:

- El `iv` y el `authTag` (si aplica) se representan en hex en el header.
- El payload después de la línea vacía es la concatenación de los bytes cifrados codificados en `base64` o `hex` según el header.
- Errores que puede lanzar: `unsupported algorithm`, `missing auth tag after encryption`.

<a id="encryptfile"></a>
### encryptFile(inputPath, outputPath, secret, options?)

Cifra un archivo usando streaming y escribe un fichero que comienza con un header compacto seguido de JSON de metadatos y el cuerpo cifrado.

Detalles (coincide con `src/lib/encrypt.ts`):

- `options.format` por defecto es `myec` (si se pasa otro formato se lanza error).
- Algoritmo por defecto: `aes-192-cbc`.
- Rechaza archivos mayores a 500 MB (se lanza `input file exceeds 500MB limit`).
- Proceso: comprime con Brotli -> cifra en stream -> escribe cuerpo cifrado en un archivo temporal -> construye header y JSON con `compression` y `iv` (y `authTag` si aplica) -> escribe header+JSON+body al `outputPath`.

Formato de salida (archivo):

```
myec.1.<algorithm>\n
<JSON metadata>\n\n
<binary encrypted body>
```

Ejemplo de uso:

```js
const { encryptFile } = require('fulnode.js');
encryptFile('in.bin', 'out.myec', 'mi-secreto').then(() => console.log('ok'));
// /**
//  * Result: fichero 'out.myec' creado. Primeras líneas:
//  * ~$ myec.1.aes-192-cbc
//  * ~$ {"compression":"brotli","iv":"a1b2c3d4...","authTag":"..."}
//  */
```

<a id="decryptstring"></a>
### decryptString(encrypted, secret)

Descifra una cadena producida por `encryptString` y devuelve el texto original.

Comportamiento (coincide con `src/lib/decrypt.ts`):

- El parser separa el bloque header del payload por la primera aparición de `\n\n`.
- Formatos aceptados actualmente:
  - Compacto (strings): `<format>.<version>.<algorithm>.<ivHex>[.<authTagHex>][.<encoding>]` (p. ej. `yec.1.aes-256-gcm.<iv>.<tag>.base64`).
  - Archivo (ficheros): primera línea con el prefijo compacto `myec.1.<algorithm>` seguida en la segunda línea por un pequeño JSON con `compression` e `iv` (y `authTag` si aplica).
- Valida `version === 1` y que `algorithm` exista en `ALGORITHMS`.
- Si el algoritmo requiere `authTag` y este no está presente lanza `missing auth tag`.
- Errores frecuentes: `corrupted data: header separator not found`, `unsupported algorithm`, `wrong secret or corrupted data`.

Ejemplo completo:

```js
const { encryptString, decryptString } = require('fulnode.js');
(async () => {
	const secret = 'mi-secreto';
	const encrypted = await encryptString('texto secreto', secret);
	console.log(encrypted);
	/**
	 * Return (ejemplo):
	 * ~$ yec.1.aes-256-gcm.f1e2d3c4b5a6...cafebabedeadbeef...base64
	 *
	 */

	const decrypted = await decryptString(encrypted, secret);
	console.log(decrypted);
	/**
	 * Return:
	 * ~$ texto secreto
	 */
})();
```

**Detalles adicionales sobre `encryptString` / `decryptString`**

- Formato del header (strings): `<format>.<version>.<algorithm>.<ivHex>[.<authTagHex>][.<encoding>]`.
- Formato del header (ficheros): primera línea `myec.1.<algorithm>` y segunda línea JSON con `compression` e `iv` (y `authTag` si aplica).
- `iv` y `authTag` se representan en hex. El payload se codifica según `encoding` y se coloca después de una línea en blanco.
- Errores comunes al descifrar: `wrong secret or corrupted data` (clave incorrecta o datos corrompidos), `missing auth tag` (si falta el authTag cuando el algoritmo lo requiere).


<a id="decryptfile"></a>
### decryptFile(inputPath, outputPath, secret)

Descifra un fichero generado por `encryptFile` y escribe los datos descomprimidos en `outputPath`.

Detalles (coincide con `src/lib/decrypt.ts`):

- Extrae el header y cualquier JSON de metadatos leyendo hasta la primera aparición de `\n\n` desde el inicio del fichero.
- Soporta header compactos y headers que incluyen JSON (como escribe `encryptFile`).
- Deriva la clave con `scrypt(secret, 'fulnode-salt', keyLen)`.
- Para algoritmos con `authTag` valida su presencia y lo aplica antes de `decipher.final()`.
- Usa streaming para descifrar: remainder + resto de fichero -> `decipher` -> `brotli` -> `outputPath`.
- Errores habituales: `corrupted header`, `unsupported algorithm`, `missing auth tag`, `pipeline error or corrupted data`.

Ejemplo de uso:

```js
const { decryptFile } = require('fulnode.js');
decryptFile('out.myec', 'out.bin', 'mi-secreto').then(() => console.log('ok'));
// /**
//  * Result: fichero 'out.bin' creado con los datos originales.
//  */
```

<a id="algorithms"></a>
### ALGORITHMS (constantes)

Constante que describe las configuraciones de algoritmo soportadas (`keyLength`, `ivLength`, `authTagRequired`). Valores incluidos: `aes-256-gcm`, `aes-192-cbc`.

| Parámetro | Tipo | Descripción |
|---|---:|---|
| `ALGORITHMS` | `Record<string, AlgorithmConfig>` | Map de configuración por algoritmo. |

## Notas sobre cifrado

- Existen dos formatos principales en la librería: `yec` (string) y `myec` (fichero). Ambos usan compresión Brotli antes del cifrado.
- La implementación usa `scrypt` con una sal fija (`fulnode-salt`) para derivar claves. Ajusta según tus requisitos de seguridad.

## Contribuir

- Fork y PR. Añadir tests para nuevas utilidades y mantener compatibilidad.
- Sigue el estilo del código en `src/` y agrega ejemplos en `examples/` si es pertinente.

## Licencia

MIT — ver `LICENSE`.

## Contacto

Abre un issue o PR en este repositorio para reportar bugs o proponer mejoras.

