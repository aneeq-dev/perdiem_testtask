import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';
import {
  validate,
  validateUserId,
  validateCreateUser,
  sanitizeInput,
} from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler.util';

const router = Router();
const userController = new UserController();

router.get(
  '/',
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.getAllUsers(req, res, next)
  )
);

router.get(
  '/:id',
  validate(validateUserId),
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.getUserById(req, res, next)
  )
);

router.post(
  '/',
  sanitizeInput,
  validate(validateCreateUser),
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    userController.createUser(req, res, next)
  )
);

export default router;

