import { createCache, memoryStore } from 'cache-manager';

export default createCache(memoryStore({
    max: 100,
    ttl: 60 * 100 * 100
  }));