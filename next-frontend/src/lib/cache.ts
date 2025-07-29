// lib/cache.ts
import NodeCache from 'node-cache'

export const cache = new NodeCache({
  stdTTL: 86400, // cache expires in 24 hours
})
