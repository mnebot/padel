export const UserType = {
  MEMBER: 'MEMBER',
  NON_MEMBER: 'NON_MEMBER'
} as const;

export type UserType = typeof UserType[keyof typeof UserType];

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
