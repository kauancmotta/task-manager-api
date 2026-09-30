import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';

import { createMockLogger } from '@common/testing/mock-logger';
import { AuthController } from '@modules/auth/controllers/auth.controller';
import { AuthService } from '@modules/auth/services/auth.service';
import {
  createMockJwtPayload,
  createMockAuthRefreshToken,
  createMockTokens,
  createMockUser,
} from '@common/testing/mock-entities';
import {
  createMockAuthService,
  createMockConfigService,
  createMockRefreshTokensService,
  createMockUsersService,
} from '@common/testing/mock-services';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import {
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  ResendEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '@modules/auth/dto';
import { UsersService } from '@modules/users/services/users.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let refreshTokenService: RefreshTokensService;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMockAuthService(),
        },
        {
          provide: RefreshTokensService,
          useValue: createMockRefreshTokensService(),
        },
        {
          provide: UsersService,
          useValue: createMockUsersService(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
    authService = moduleRef.get(AuthService);
    refreshTokenService = moduleRef.get(RefreshTokensService);
    usersService = moduleRef.get(UsersService);
  });

  describe('register', () => {
    it('should call authService.register with dto and return tokens', async () => {
      const dto = new RegisterDto();
      dto.name = 'Mock Name';
      dto.email = 'mock@email.com';
      dto.password = 'passwordStrong@123';
      dto.confirmPassword = 'passwordStrong@123';

      const mockTokens = createMockTokens();

      vi.mocked(authService.register).mockResolvedValue(mockTokens);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(authService.register).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockTokens);
    });
  });

  describe('login', () => {
    it('should call authService.login with dto and return tokens', async () => {
      const dto = new LoginDto();
      dto.email = 'mock@email.com';
      dto.password = 'passwordStrong@123';

      const mockTokens = createMockTokens();

      vi.mocked(authService.login).mockResolvedValue(mockTokens);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(authService.login).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockTokens);
    });
  });

  describe('refresh', () => {
    it('should call refreshTokenService.rotate with dto and return tokens', async () => {
      const dto = new RefreshDto();
      dto.refreshToken = 'mock-refresh-token';

      const mockRefresh = createMockAuthRefreshToken();

      vi.mocked(refreshTokenService.rotate).mockResolvedValue(mockRefresh);

      const result = await controller.refresh(dto);

      expect(refreshTokenService.rotate).toHaveBeenCalledWith(dto.refreshToken);
      expect(refreshTokenService.rotate).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockRefresh);
    });
  });

  describe('logout', () => {
    it('should call refreshTokenService.revoke with dto', async () => {
      const dto = new LogoutDto();
      dto.refreshToken = 'mock-refresh-token';

      vi.mocked(refreshTokenService.revoke).mockResolvedValue(undefined);

      await controller.logout(dto);

      expect(refreshTokenService.revoke).toHaveBeenCalledWith(dto.refreshToken);
      expect(refreshTokenService.revoke).toHaveBeenCalledTimes(1);
    });
  });

  describe('logoutAll', () => {
    it('should call refreshTokenService.revokeAll with dto', async () => {
      vi.mocked(refreshTokenService.revokeAll).mockResolvedValue(undefined);

      const mockJwtPayload = createMockJwtPayload();

      await controller.logoutAll(mockJwtPayload);

      expect(refreshTokenService.revokeAll).toHaveBeenCalledWith(
        mockJwtPayload.sub,
      );
      expect(refreshTokenService.revokeAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should call authService.resendVerificationEmail with dto', async () => {
      const dto = new ResendEmailDto();
      dto.email = 'mock@email.com';

      vi.mocked(authService.resendVerificationEmail).mockResolvedValue(
        undefined,
      );

      await controller.resendVerificationEmail(dto);

      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(dto);
      expect(authService.resendVerificationEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail with dto', async () => {
      const dto = new VerifyEmailDto();
      dto.token = 'mock-token';

      vi.mocked(authService.verifyEmail).mockResolvedValue(undefined);

      await controller.verifyEmail(dto);

      expect(authService.verifyEmail).toHaveBeenCalledWith(dto.token);
      expect(authService.verifyEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with dto', async () => {
      const dto = new ForgotPasswordDto();
      dto.email = 'mock@email.com';

      vi.mocked(authService.forgotPassword).mockResolvedValue(undefined);

      await controller.forgotPassword(dto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
      expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with dto', async () => {
      const dto = new ResetPasswordDto();
      dto.otp = '238428';
      dto.newPassword = 'passwordStrong@123';
      dto.confirmPassword = 'passwordStrong@123';

      vi.mocked(authService.resetPassword).mockResolvedValue(undefined);

      await controller.resetPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
      expect(authService.resetPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMe', () => {
    it('should call usersService.findOne with dto', async () => {
      const mockJwtPayload = createMockJwtPayload();

      const mockUser = createMockUser();

      vi.mocked(usersService.findOne).mockResolvedValue(mockUser);

      const result = await controller.getMe(mockJwtPayload);

      expect(usersService.findOne).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(usersService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockUser);
    });
  });
});
