import { CACHE_CONFIG } from '../config/cache.config';
import { CacheEntry, CacheStatistics } from '../types/cache.types';

/**
 * LRU (Least Recently Used) Cache implementation with TTL support.
 * Provides O(1) average case performance for get/set operations.
 * Automatically evicts least recently used entries when cache is full.
 * Supports time-based expiration with automatic background cleanup.
 */
class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number;
  private statistics: {
    hits: number;
    misses: number;
  };
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(maxSize: number = CACHE_CONFIG.MAX_SIZE, ttl: number = CACHE_CONFIG.TTL) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.statistics = {
      hits: 0,
      misses: 0,
    };
    this.startCleanupTask();
  }

  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleEntries();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  private cleanupStaleEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  private evictLRU(): void {
    if (this.cache.size < this.maxSize) {
      return;
    }

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessTime < oldestTime) {
        oldestTime = entry.accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.statistics.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.statistics.misses++;
      return null;
    }

    entry.accessTime = now;
    this.statistics.hits++;
    return entry.value;
  }

  set(key: string, value: T): void {
    const now = Date.now();

    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      accessTime: now,
    });
  }

  clear(): void {
    this.cache.clear();
    this.statistics.hits = 0;
    this.statistics.misses = 0;
  }

  getStatistics(): CacheStatistics {
    return {
      hits: this.statistics.hits,
      misses: this.statistics.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

export const lruCache = new LRUCache<unknown>();

