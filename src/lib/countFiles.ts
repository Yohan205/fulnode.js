
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * | countFiles |
 * Cuenta el número total de archivos con una extensión específica dentro de un directorio y sus subdirectorios inmediatos.
 * @param {String} ruta ./carpeta/  - ruta del directorio raíz a inspeccionar
 * @param {String} extension archivo.extension  - extensión con o sin punto (ej: '.txt' o 'txt')
 * @return Total de archivos
 */
export function countFiles(ruta: string, extension: string): number {
	if (!extension) return 0;
	// Normalizar extensión: asegurar que empiece con '.'
	const ext = extension.startsWith('.') ? extension : `.${extension}`;

	let total = 0;

	// Intentamos leer el directorio raíz
	const entries = readdirSync(ruta, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(ruta, entry.name);
		try {
			if (entry.isDirectory()) {
				// contar archivos en la carpeta (no recursivo profundo)
				const child = readdirSync(fullPath, { withFileTypes: true });
				for (const c of child) {
					if (c.isFile() && extname(c.name) === ext) total += 1;
				}
			} else if (entry.isFile()) {
				// si hay archivos en la raíz que coincidan también los contamos
				if (extname(entry.name) === ext) total += 1;
			} else {
				// por seguridad, comprobamos si es archivo mediante stat cuando no es Dirent esperado
				const s = statSync(fullPath);
				if (s.isFile() && extname(entry.name) === ext) total += 1;
			}
		} catch (err) {
			// ignorar errores por permisos o enlaces rotos y continuar
			continue;
		}
	}

	return total;
}

