import { User } from '../types/user.types';

export const mockUsers: Record<number, User> = {
  1: { id: 1, name: 'John Doe', email: 'john@example.com' },
  2: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  3: { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
};

let nextUserId = 4;

export const getNextUserId = (): number => {
  return nextUserId++;
};

export const addMockUser = (user: User): void => {
  mockUsers[user.id] = user;
};

