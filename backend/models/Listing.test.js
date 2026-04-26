import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import Listing from './Listing.js';

describe('Listing Model - displayName virtual', () => {
  it('should return title when title is present', () => {
    const listing = new Listing({
      title: 'Premium Green Hydrogen',
      companyName: 'HydroCorp'
    });
    assert.strictEqual(listing.displayName, 'Premium Green Hydrogen');
  });

  it('should return companyName when title is empty', () => {
    const listing = new Listing({
      title: '',
      companyName: 'HydroCorp'
    });
    assert.strictEqual(listing.displayName, 'HydroCorp');
  });

  it('should return companyName when title is missing', () => {
    const listing = new Listing({
      companyName: 'HydroCorp'
    });
    assert.strictEqual(listing.displayName, 'HydroCorp');
  });

  it('should include displayName in JSON serialization', () => {
    const listing = new Listing({
      title: 'Premium Green Hydrogen',
      companyName: 'HydroCorp'
    });

    const json = listing.toJSON();
    assert.strictEqual(json.displayName, 'Premium Green Hydrogen');
  });
});
