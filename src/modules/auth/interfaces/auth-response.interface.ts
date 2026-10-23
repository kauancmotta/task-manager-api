export interface AuthResponse {
  accessToken: {
    token: string;
    expiresAt: Date;
    tokenType: 'Bearer';
  };
  refreshToken: AuthResponseRefreshToken;
}

export interface AuthResponseRefreshToken {
  token: string;
  expiresAt: Date;
}
