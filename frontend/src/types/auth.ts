export type UserRole = 'admin' | 'user';

export interface JwtPayload {
  sub: string;         // id de usuario
  email: string;
  roles?: UserRole[];  // o "role": "admin" según tu backend
  exp: number;         // epoch seconds
  iat?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: UserRole[];
}
