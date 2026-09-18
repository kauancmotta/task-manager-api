import { ApiProperty } from '@nestjs/swagger';

class AccessTokenPresenter {
  @ApiProperty({ example: 'eyJhbGci...' })
  token!: string;

  @ApiProperty({ example: '2026-09-10T19:42:04.968Z' })
  expiresAt!: Date;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;
}

export class RefreshTokenPresenter {
  @ApiProperty({ example: '9ff9a757...' })
  token!: string;

  @ApiProperty({ example: '2026-09-17T19:12:04.969Z' })
  expiresAt!: Date;
}

export class AuthPresenter {
  @ApiProperty({ type: AccessTokenPresenter })
  accessToken!: AccessTokenPresenter;

  @ApiProperty({ type: RefreshTokenPresenter })
  refreshToken!: RefreshTokenPresenter;
}
