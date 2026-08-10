import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const output = execFileSync('node', ['scripts/validate-psp-p07-preflight.mjs'], {
	encoding: 'utf8',
});

assert.match(output, /PSP-C06 public-surfaces preflight: PASS/);
