import { useState, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types/user';
import type { CreateUserDto, UpdateUserDto } from '../services/userService';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<User>;
  updateUser: (userId: string, data: UpdateUserDto) => Promise<User>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error loading users');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserDto): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await userService.createUser(data);
      setUsers(prev => [...prev, user]);
      return user;
    } catch (err: any) {
      setError(err.message || 'Error creating user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, data: UpdateUserDto): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await userService.updateUser(userId, data);
      setUsers(prev => prev.map(u => u.id === userId ? user : u));
      return user;
    } catch (err: any) {
      setError(err.message || 'Error updating user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
  };
};
