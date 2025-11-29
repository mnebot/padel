// User types for the User App

export type UserType = 'MEMBER' | 'NON_MEMBER';

export const UserType = {
  MEMBER: 'MEMBER' as const,
  NON_MEMBER: 'NON_MEMBER' as const,
};

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
