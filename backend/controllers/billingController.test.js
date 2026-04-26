import test from "node:test";
import assert from "node:assert";
import { calculatePrice, getPlans } from "./billingController.js";
import { PLANS } from "../utils/plans.js";

test("calculatePrice should correctly calculate gst and total for positive prices", () => {
  const result = calculatePrice(100);
  assert.deepStrictEqual(result, {
    basePrice: 100,
    gst: 18,
    total: 118,
  });
});

test("calculatePrice should correctly calculate gst and total for zero price", () => {
  const result = calculatePrice(0);
  assert.deepStrictEqual(result, {
    basePrice: 0,
    gst: 0,
    total: 0,
  });
});

test("calculatePrice should correctly calculate gst and total for decimal prices", () => {
  const result = calculatePrice(99.99);
  assert.strictEqual(result.basePrice, 99.99);
  assert.strictEqual(result.gst, 99.99 * 0.18);
  assert.strictEqual(result.total, 99.99 + 99.99 * 0.18);
});

test("getPlans should successfully return a list of plans with calculated pricing", async () => {
  // Mock res object
  const res = {
    jsonOutput: null,
    statusOutput: null,
    json(data) {
      this.jsonOutput = data;
      return this;
    },
    status(code) {
      this.statusOutput = code;
      return this;
    }
  };

  // Mock req object
  const req = {};

  await getPlans(req, res);

  assert.strictEqual(res.jsonOutput.success, true);
  assert.strictEqual(res.jsonOutput.message, "Plans fetched successfully");

  // Validate data shape
  const plans = res.jsonOutput.data.plans;
  assert.ok(Array.isArray(plans));
  assert.strictEqual(plans.length, Object.values(PLANS).length);

  // Validate that pricing is correctly attached to plans
  for (const plan of plans) {
    assert.ok("basePrice" in plan);
    assert.ok("gst" in plan);
    assert.ok("total" in plan);
    assert.strictEqual(plan.gst, plan.basePrice * 0.18);
    assert.strictEqual(plan.total, plan.basePrice + plan.gst);
  }
});
