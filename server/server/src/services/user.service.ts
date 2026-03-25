import { User, CreateUserRequest } from '../types/user.types';
import { mockUsers, getNextUserId, addMockUser } from '../config/mock-data.config';
import { lruCache } from '../utils/lru-cache.util';
import { requestQueue } from '../utils/request-queue.util';
import { NotFoundError } from '../types/error.types';

/**
 * User Service - Handles all user-related business logic.
 * Implements caching, request deduplication, and database simulation.
 */
class UserService {
  private simulateDatabaseDelay(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  }

  private async fetchUserFromDatabase(id: number): Promise<User | null> {
    await this.simulateDatabaseDelay();

    const user = mockUsers[id];
    return user || null;
  }

  async getUserById(id: number): Promise<User> {
    const cacheKey = `user:${id}`;

    const cachedUser = lruCache.get(cacheKey) as User | null;
    if (cachedUser) {
      return cachedUser;
    }

    const user = await requestQueue.queue<User>(cacheKey, async () => {
      const fetchedUser = await this.fetchUserFromDatabase(id);

      if (!fetchedUser) {
        throw new NotFoundError(`User with ID ${id} does not exist`);
      }

      lruCache.set(cacheKey, fetchedUser);
      return fetchedUser;
    });

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    await this.simulateDatabaseDelay();

    const cacheKey = 'users:all';
    const cachedUsers = lruCache.get(cacheKey) as User[] | null;

    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await requestQueue.queue<User[]>(cacheKey, async () => {
      const allUsers = Object.values(mockUsers);
      lruCache.set(cacheKey, allUsers);
      return allUsers;
    });

    return users;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const newUser: User = {
      id: getNextUserId(),
      name: userData.name,
      email: userData.email,
    };

    addMockUser(newUser);

    const cacheKey = `user:${newUser.id}`;
    lruCache.set(cacheKey, newUser);

    const allUsersCacheKey = 'users:all';
    if (lruCache.get(allUsersCacheKey)) {
      lruCache.set(allUsersCacheKey, Object.values(mockUsers));
    }

    return newUser;
  }
}

export const userService = new UserService();

