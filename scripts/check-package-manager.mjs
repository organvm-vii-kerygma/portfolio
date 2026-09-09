import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const actual = `npm@${execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim()}`;
if (manifest.packageManager !== 'npm@11.9.0' || actual !== manifest.packageManager) {
	throw new Error(`Use the authoritative ${manifest.packageManager}; found ${actual}`);
}
const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n');
const competing = files.filter((file) =>
	/(^|\/)(yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|npm-shrinkwrap\.json)$/.test(file),
);
if (competing.length)
	throw new Error(`Competing package-manager lockfiles: ${competing.join(', ')}`);
console.log(`Package-manager contract passed: ${actual}, package-lock.json`);
