export interface IAuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'USER' | 'ADMIN';
}

export interface IAuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface ISignupInput {
  name: string;
  email: string;
  password: string;
}
