
import * as os from "os";
import { size } from "./size";

/**
 * Devuelve el uso de memoria del sistema y del proceso en formato legible.
 * @returns Objeto con `max`, `free`, `used` y `usedByProcess` en strings legibles.
 */
export function memoryUsedRAM() {
	const maxMemory = os.totalmem();
	const freeMemory = os.freemem();
	const usedMemory = maxMemory - freeMemory;
	const processMemory = process.memoryUsage().rss;

	const chooseFixed = (bytes: number) => {
		const gigaBytes = bytes / 1024 ** 3;
		if (gigaBytes > 1) return { fixed: 1 };
		const megaBytes = bytes / 1024 ** 2;
		if (megaBytes < 10) return { fixed: 2 };
		if (megaBytes < 100) return { fixed: 1 };
		return { fixed: 0 };
	};

	return {
		max: size(maxMemory, chooseFixed(maxMemory)),
		free: size(freeMemory, chooseFixed(freeMemory)),
		used: size(usedMemory, chooseFixed(usedMemory)),
		usedByProcess: size(processMemory, chooseFixed(processMemory)),
	};
}

export default memoryUsedRAM;
