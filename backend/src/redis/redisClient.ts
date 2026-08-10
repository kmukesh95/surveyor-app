import Redis from 'ioredis';
import { ENV } from '../config/env';

let redisClient: Redis | null = null;
let isRedisConnected = false;
const inMemoryFallback = new Map<string, { value: string; expiresAt?: number }>();

try {
  redisClient = new Redis(ENV.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy() {
      return null;
    },
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Redis connected successfully.');
  });

  redisClient.on('error', () => {
    isRedisConnected = false;
  });
} catch {
  isRedisConnected = false;
}

export const CacheService = {
  async get(key: string): Promise<string | null> {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch {
        // Fallback
      }
    }
    const item = inMemoryFallback.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      inMemoryFallback.delete(key);
      return null;
    }
    return item.value;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        if (ttlSeconds) {
          await redisClient.set(key, value, 'EX', ttlSeconds);
        } else {
          await redisClient.set(key, value);
        }
        return;
      } catch {
        // Fallback
      }
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    inMemoryFallback.set(key, { value, expiresAt });
  },

  async del(key: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch {
        // Fallback
      }
    }
    inMemoryFallback.delete(key);
  },

  isRedisActive(): boolean {
    return isRedisConnected;
  },
};
