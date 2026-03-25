export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessTime: number;
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  size: number;
  maxSize?: number;
}

