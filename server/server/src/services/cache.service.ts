import { lruCache } from '../utils/lru-cache.util';
import { responseTimeTracker } from '../utils/response-time.util';
import { CacheStatistics } from '../types/cache.types';

class CacheService {
  clearCache(): void {
    lruCache.clear();
  }

  getCacheStatistics(): CacheStatistics & { averageResponseTime: number } {
    const stats = lruCache.getStatistics();
    const averageResponseTime = responseTimeTracker.getAverage();

    return {
      ...stats,
      averageResponseTime,
    };
  }
}

export const cacheService = new CacheService();

