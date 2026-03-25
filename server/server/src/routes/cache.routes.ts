import { Router, Request, Response, NextFunction } from 'express';
import { CacheController } from '../controllers/cache.controller';
import { asyncHandler } from '../utils/async-handler.util';

const router = Router();
const cacheController = new CacheController();

router.delete(
  '/',
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    cacheController.clearCache(req, res, next)
  )
);
router.get(
  '/status',
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    cacheController.getCacheStatus(req, res, next)
  )
);

export default router;

