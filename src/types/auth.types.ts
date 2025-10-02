export enum UserRole {
  CREATOR = 'creator',
  SUBSCRIBER = 'subscriber',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  newsletterName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  newsletterName?: string;
}
