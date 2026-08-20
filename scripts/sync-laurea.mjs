import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalizeLaureaSnapshot, unavailableLaureaSnapshot } from './lib/laurea-snapshot.mjs';

const SOURCE_URL = 'https://raw.githubusercontent.com/organvm/laurea/main/assets/metrics.json';
const outputPath = resolve('src/data/laurea-snapshot.json');
const inputArg = process.argv.find((arg) => arg.startsWith('--input='));

async function loadSource() {
	if (inputArg) {
		return JSON.parse(await readFile(resolve(inputArg.slice('--input='.length)), 'utf8'));
	}
	const response = await fetch(SOURCE_URL, { headers: { accept: 'application/json' } });
	if (!response.ok) throw new Error(`LAVREA fetch returned ${response.status}`);
	return response.json();
}

let normalized;
try {
	normalized = normalizeLaureaSnapshot(await loadSource());
} catch (error) {
	console.warn(`LAVREA unavailable: ${error instanceof Error ? error.message : String(error)}`);
	normalized = unavailableLaureaSnapshot();
}

await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`LAVREA snapshot: ${normalized.state} -> ${outputPath}`);
