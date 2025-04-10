// src/app/models/user.interface.ts
export interface User {
  readonly id?: number;
  readonly name: string;
  readonly surname: string;
  readonly email: string;
  readonly phone?: string;
  readonly selected?: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

// Type utilities for better TypeScript support
export type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserRequest = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
export type UserResponse = { users: User[] };

// Validation interface
export interface UserValidation {
  isValid: boolean;
  errors: string[];
}

// Filter interface
export interface UserFilter {
  search?: string;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
