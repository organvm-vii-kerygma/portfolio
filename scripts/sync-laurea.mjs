import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
	isLastKnownGoodLaureaSnapshot,
	normalizeLaureaSnapshot,
	unavailableLaureaSnapshot,
} from './lib/laurea-snapshot.mjs';

const SOURCE_URL = 'https://raw.githubusercontent.com/organvm/laurea/main/assets/metrics.json';
const outputPath = resolve('src/data/laurea-snapshot.json');
const inputArg = process.argv.find((arg) => arg.startsWith('--input='));

async function loadSource() {
	if (inputArg) {
		return JSON.parse(await readFile(resolve(inputArg.slice('--input='.length)), 'utf8'));
	}
	const response = await fetch(SOURCE_URL, {
		headers: { accept: 'application/json' },
		signal: AbortSignal.timeout(15_000),
	});
	if (!response.ok) throw new Error(`LAVREA fetch returned ${response.status}`);
	return response.json();
}

let normalized;
let writeSnapshot = true;
try {
	normalized = normalizeLaureaSnapshot(await loadSource());
} catch (error) {
	console.warn(`LAVREA unavailable: ${error instanceof Error ? error.message : String(error)}`);
	try {
		const existing = JSON.parse(await readFile(outputPath, 'utf8'));
		if (isLastKnownGoodLaureaSnapshot(existing)) {
			normalized = existing;
			writeSnapshot = false;
			console.warn('LAVREA snapshot: preserving last-known-good evidence');
		} else {
			normalized = unavailableLaureaSnapshot();
		}
	} catch {
		normalized = unavailableLaureaSnapshot();
	}
}

if (writeSnapshot) await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`LAVREA snapshot: ${writeSnapshot ? normalized.state : 'preserved'} -> ${outputPath}`);
