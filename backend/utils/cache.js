import NodeCache from "node-cache";

// Standard cache: 5 minutes TTL, checks every 1 minute
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const getCache = (key) => {
  return cache.get(key);
};

export const setCache = (key, value, ttl) => {
  return cache.set(key, value, ttl);
};

export const clearCache = (key) => {
  if (key) return cache.del(key);
  return cache.flushAll();
};

export default cache;
