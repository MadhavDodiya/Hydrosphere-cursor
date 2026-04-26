import test from "node:test";
import assert from "node:assert";
import {
  applyTextSearchFilter,
  applyLocationFilter,
  applyHydrogenTypeFilter,
  applyPriceFilter,
  applyDeliveryFilter,
  applyFeaturedFilter,
  buildFilter
} from "./listingFilters.js";

test("listingFilters", async (t) => {
  await t.test("applyTextSearchFilter should apply text search when q is present", () => {
    const filter = {};
    applyTextSearchFilter(filter, { q: "  hydrogen  " });
    assert.deepStrictEqual(filter, { $text: { $search: "hydrogen" } });
  });

  await t.test("applyTextSearchFilter should ignore when q is not present", () => {
    const filter = {};
    applyTextSearchFilter(filter, {});
    assert.deepStrictEqual(filter, {});
  });

  await t.test("applyLocationFilter should set location condition", () => {
    const filter = {};
    applyLocationFilter(filter, { location: "New York" });
    assert.deepStrictEqual(filter, { location: { $regex: "New York", $options: "i" } });
  });

  await t.test("applyLocationFilter should handle existing $or condition", () => {
    const filter = { $or: [{ status: "active" }] };
    applyLocationFilter(filter, { location: "Paris" });
    assert.deepStrictEqual(filter, {
      $and: [
        { $or: [{ status: "active" }] },
        { location: { $regex: "Paris", $options: "i" } }
      ]
    });
    assert.strictEqual(filter.$or, undefined);
  });

  await t.test("applyLocationFilter should escape regex correctly", () => {
    const filter = {};
    applyLocationFilter(filter, { location: "C++" });
    assert.deepStrictEqual(filter, { location: { $regex: "C\\+\\+", $options: "i" } });
  });

  await t.test("applyHydrogenTypeFilter should filter valid hydrogen types", () => {
    const filter = {};
    applyHydrogenTypeFilter(filter, { hydrogenType: "Green Hydrogen, Blue Hydrogen, InvalidType" });
    assert.deepStrictEqual(filter, { hydrogenType: { $in: ["Green Hydrogen", "Blue Hydrogen"] } });
  });

  await t.test("applyPriceFilter should apply minPrice and maxPrice", () => {
    const filter = {};
    applyPriceFilter(filter, { minPrice: 10, maxPrice: 100 });
    assert.deepStrictEqual(filter, { price: { $gte: 10, $lte: 100 } });
  });

  await t.test("applyPriceFilter should handle only minPrice", () => {
    const filter = {};
    applyPriceFilter(filter, { minPrice: 50 });
    assert.deepStrictEqual(filter, { price: { $gte: 50 } });
  });

  await t.test("applyPriceFilter should handle only maxPrice", () => {
    const filter = {};
    applyPriceFilter(filter, { maxPrice: 200 });
    assert.deepStrictEqual(filter, { price: { $lte: 200 } });
  });

  await t.test("applyDeliveryFilter should apply deliveryAvailability", () => {
    const filter = {};
    applyDeliveryFilter(filter, { deliveryAvailability: "Pickup" });
    assert.deepStrictEqual(filter, { deliveryAvailability: { $regex: "Pickup", $options: "i" } });
  });

  await t.test("applyFeaturedFilter should set isFeatured to true", () => {
    const filter = {};
    applyFeaturedFilter(filter, { isFeatured: "true" });
    assert.deepStrictEqual(filter, { isFeatured: true });
  });

  await t.test("buildFilter should combine all filters", () => {
    const query = {
      q: "fuel",
      location: "London",
      hydrogenType: "Green Hydrogen",
      minPrice: 5,
      deliveryAvailability: "Delivery",
      isFeatured: "true"
    };

    const filter = buildFilter(query);

    assert.deepStrictEqual(filter, {
      $text: { $search: "fuel" },
      location: { $regex: "London", $options: "i" },
      hydrogenType: { $in: ["Green Hydrogen"] },
      price: { $gte: 5 },
      deliveryAvailability: { $regex: "Delivery", $options: "i" },
      isFeatured: true
    });
  });
});
