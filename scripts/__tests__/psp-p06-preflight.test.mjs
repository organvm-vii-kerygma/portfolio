import assert from "node:assert/strict";
import test from "node:test";

import { loadContract, validateContract } from "../validate-psp-p06-preflight.mjs";

function copy(value) {
	return JSON.parse(JSON.stringify(value));
}

test("tracked PSP-P06 contract passes", async () => {
	assert.deepEqual(validateContract(await loadContract()), []);
});

test("private routes fail closed", async () => {
	const contract = copy(await loadContract());
	contract.canonical_routes.push({ route: "/private/", level: "PRIVATE_WITHHELD", artifact_ids: ["private"] });
	assert.ok(validateContract(contract).includes("private disclosure cannot have a canonical route"));
});

test("early visual selection and partnership promotion fail closed", async () => {
	const contract = copy(await loadContract());
	contract.visual_ideation_gate.selected_direction = "direction_a";
	contract.audience_flows.find((flow) => flow.audience_id === "product_operating_partner").L1.required.push("CTA");
	const errors = validateContract(contract);
	assert.ok(errors.includes("preflight cannot select a visual direction"));
	assert.ok(errors.includes("operating partner must remain absent from L1 and L2"));
});
