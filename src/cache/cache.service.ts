import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

/**
 * Thin Redis cache. Fails open: if Redis is down every call degrades to a
 * cache miss / no-op, so the API keeps working straight from the database.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    this.enabled = config.get('REDIS_ENABLED', 'true') !== 'false';
    const url = config.get<string>('REDIS_URL'); // e.g. rediss://default:pass@host:6379
    const options = {
      lazyConnect: !this.enabled,
      enableOfflineQueue: false, // fail fast while disconnected
      maxRetriesPerRequest: 1,
      retryStrategy: (times: number) => Math.min(times * 500, 5000),
    };
    this.redis = url
      ? new Redis(url, options)
      : new Redis({
          ...options,
          host: config.get('REDIS_HOST', 'localhost'),
          port: Number(config.get('REDIS_PORT', 6379)),
          password: config.get('REDIS_PASSWORD') || undefined,
          // Upstash and most hosted Redis require TLS.
          tls: config.get('REDIS_TLS') === 'true' ? {} : undefined,
        });
    this.redis.on('error', (err) => this.logger.warn(`Redis: ${err.message}`));
    if (!this.enabled) this.redis.disconnect();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;
    try {
      const raw = await this.redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number) {
    if (!this.enabled) return;
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      /* cache is best-effort */
    }
  }

  async del(...keys: string[]) {
    if (!this.enabled || keys.length === 0) return;
    try {
      await this.redis.del(...keys);
    } catch {
      /* cache is best-effort */
    }
  }

  /** Returns the cached value, or runs `load`, caches and returns its result. */
  async wrap<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null) {
      console.log('Cache hit', key);
      return hit;
    }
    console.log('Cache miss', key);
    const value = await load();
    await this.set(key, value, ttlSeconds);
    console.log('Cache set', key);
    return value;
  }

  async onModuleDestroy() {
    this.redis.disconnect();
  }
}
