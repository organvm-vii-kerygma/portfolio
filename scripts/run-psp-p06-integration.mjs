import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
	evaluateQuality,
	formalizationReadiness,
	projectContent,
	syntheticContentFixture,
} from './lib/psp-p06-integration.mjs';
import { loadContract, validateContract } from './validate-psp-p06-preflight.mjs';

const index = process.argv.indexOf('--fixture');
const fixturePath = index < 0 ? null : process.argv[index + 1];
const contract = await loadContract();
const fixture = fixturePath ? JSON.parse(await readFile(fixturePath, 'utf8')) : {};
const validation = validateContract(contract);
const content = projectContent(contract, syntheticContentFixture(contract));
const quality = evaluateQuality(contract, fixture);
const result = {
	status:
		validation.length || content.status === 'fail' || quality.status === 'fail' ? 'fail' : 'pass',
	validation,
	content,
	quality,
	formalization: formalizationReadiness(contract),
};
console.log(JSON.stringify(result, null, 2));
if (result.status === 'fail') process.exitCode = 1;
if (process.argv[1] !== fileURLToPath(import.meta.url))
	throw new Error('integration runner must execute directly');
