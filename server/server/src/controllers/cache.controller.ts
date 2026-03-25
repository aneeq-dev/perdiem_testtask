import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import { ApiResponse } from '../types/api.types';

export class CacheController {
  async clearCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      cacheService.clearCache();

      res.status(200).json({
        success: true,
        message: 'Cache cleared successfully',
      } as ApiResponse<null>);
    } catch (error) {
      next(error);
    }
  }

  async getCacheStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = cacheService.getCacheStatistics();

      res.status(200).json({
        success: true,
        data: statistics,
      } as ApiResponse<typeof statistics>);
    } catch (error) {
      next(error);
    }
  }
}

