import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../types/api.types';
import { User, CreateUserRequest } from '../types/user.types';

export class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
        message: `Found ${users.length} user(s)`,
      } as ApiResponse<User[]>);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
      } as ApiResponse<User>);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email } = req.body as CreateUserRequest;
      const newUser = await userService.createUser({ name, email });

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully',
      } as ApiResponse<User>);
    } catch (error) {
      next(error);
    }
  }
}

