export interface TokenInfo {
  token: string;
  expiresAt: string;
  tokenType?: string;
}

export interface AuthTokensResponse {
  accessToken: TokenInfo;
  refreshToken: TokenInfo;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
}
