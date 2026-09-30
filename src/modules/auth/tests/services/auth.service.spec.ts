import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as hashUtil from '@common/utils/hash.util';
import * as dateUtil from '@common/utils/date.util';
import { AuthService } from '@modules/auth/services/auth.service';
import { User } from '@modules/users/entities/user.entity';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { EmailVerificationsService } from '@modules/auth/services/email-verifications.service';
import { MailService } from '@common/mail/services/mail.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '@modules/auth/dto';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { AppException } from '@common/exceptions/app.exception';
import { createMockLogger } from '@common/testing/mock-logger';
import { createMockRepository } from '@common/testing/mock-repository';
import {
  createMockConfigService,
  createMockRefreshTokensService,
  createMockEmailVerificationsService,
  createMockMailService,
  createMockJwtService,
} from '@common/testing/mock-services';
import {
  createMockEmailVerification,
  createMockTokens,
  createMockUser,
} from '@common/testing/mock-entities';
import { HttpStatus } from '@nestjs/common';
import {
  createMockDataSource,
  createMockQueryBuilder,
} from '@common/testing/mock-typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: ReturnType<typeof createMockRepository>;
  let mailService: ReturnType<typeof createMockMailService>;
  let mockDataSource: ReturnType<typeof createMockDataSource>;
  let refreshTokenService: ReturnType<typeof createMockRefreshTokensService>;
  let emailVerificationService: ReturnType<
    typeof createMockEmailVerificationsService
  >;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: DataSource,
          useValue: createMockDataSource(),
        },
        {
          provide: JwtService,
          useValue: createMockJwtService(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
        {
          provide: RefreshTokensService,
          useValue: createMockRefreshTokensService(),
        },
        {
          provide: EmailVerificationsService,
          useValue: createMockEmailVerificationsService(),
        },
        {
          provide: MailService,
          useValue: createMockMailService(),
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    mockDataSource = moduleRef.get(DataSource);
    userRepository = moduleRef.get(getRepositoryToken(User));
    mailService = moduleRef.get(MailService);
    refreshTokenService = moduleRef.get(RefreshTokensService);
    emailVerificationService = moduleRef.get(EmailVerificationsService);
  });

  describe('register', () => {
    it('should throw ConflictException when email already exists', async () => {
      const dto = new RegisterDto();
      dto.email = 'mock@email.com';
      dto.name = 'Mock Name';
      dto.password = 'passwordStrong@123';
      dto.confirmPassword = 'passwordStrong@123';

      vi.mocked(userRepository.exists!).mockResolvedValue(true);

      await expect(service.register(dto)).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_EMAIL_ALREADY_EXISTS,
          'Email already exists',
          HttpStatus.CONFLICT,
        ),
      );
    });

    it('should register user and return tokens', async () => {
      const dto = new RegisterDto();
      dto.email = 'mock@email.com';
      dto.name = 'Mock Name';
      dto.password = 'passwordStrong@123';
      dto.confirmPassword = 'passwordStrong@123';

      const mockTokens = createMockTokens();

      vi.mocked(userRepository.exists!).mockResolvedValue(false);
      mockDataSource.transaction.mockResolvedValue([
        mockTokens,
        'mock-email-token',
      ]);

      const result = await service.register(dto);

      expect(result).toEqual(mockTokens);
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      const dto = new LoginDto();
      dto.email = 'invalid@email.com';
      dto.password = 'invalidPassword';

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_INVALID_CREDENTIALS,
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const dto = new LoginDto();
      dto.email = 'mock@email.com';
      dto.password = 'invalidPassword';

      const mockUser = createMockUser();

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(mockUser);

      vi.spyOn(hashUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_INVALID_CREDENTIALS,
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should throw ForbiddenException when email not verified', async () => {
      const dto = new LoginDto();
      dto.email = 'mock@email.com';
      dto.password = 'passwordStrong@123';

      const mockUser = createMockUser({ isEmailVerified: false });

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(mockUser);

      vi.spyOn(hashUtil, 'comparePassword').mockResolvedValue(true);

      await expect(service.login(dto)).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_EMAIL_NOT_VERIFIED,
          'Email not verified',
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('should return tokens when credentials are valid', async () => {
      const dto = new LoginDto();
      dto.email = 'mock@email.com';
      dto.password = 'passwordStrong@123';

      const mockDate = new Date('2026-09-22T16:00:00.000Z');
      vi.spyOn(dateUtil, 'calculateExpiresAt').mockReturnValue(mockDate);

      const mockUser = createMockUser();
      const mockTokens = createMockTokens({
        accessToken: {
          token: 'mock-token',
          expiresAt: mockDate,
          tokenType: 'Bearer',
        },
        refreshToken: {
          token: 'mock-refresh-token',
          expiresAt: mockDate,
        },
      });

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(mockUser);
      vi.spyOn(hashUtil, 'comparePassword').mockResolvedValue(true);
      vi.mocked(refreshTokenService.create!).mockResolvedValue(
        mockTokens.refreshToken,
      );

      const result = await service.login(dto);

      expect(result).toEqual(mockTokens);
    });
  });

  describe('loginWithGoogle', () => {
    it('should create new user when not found', async () => {
      const googleProfile = {
        googleId: 'mock-google-id',
        name: 'Mock Name',
        email: 'mock@email.com',
        avatarUrl: 'https://mock-avatar.com',
      };

      const mockTokens = createMockTokens();
      const mockDate = new Date('2026-09-22T16:00:00.000Z');
      vi.spyOn(dateUtil, 'calculateExpiresAt').mockReturnValue(mockDate);

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(null);

      mockDataSource.transaction.mockResolvedValue(mockTokens);

      const result = await service.loginWithGoogle(googleProfile);

      expect(result).toEqual(mockTokens);
    });

    it('should link googleId when user exists without googleId', async () => {
      const googleProfile = {
        googleId: 'mock-google-id',
        name: 'Mock Name',
        email: 'mock@email.com',
        avatarUrl: 'https://mock-avatar.com',
      };

      const mockUser = createMockUser({ googleId: undefined });
      const mockDate = new Date('2026-09-22T16:00:00.000Z');
      vi.spyOn(dateUtil, 'calculateExpiresAt').mockReturnValue(mockDate);
      const mockTokens = createMockTokens({
        accessToken: {
          token: 'mock-token',
          expiresAt: mockDate,
          tokenType: 'Bearer',
        },
        refreshToken: { token: 'mock-refresh-token', expiresAt: mockDate },
      });

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(mockUser);
      vi.mocked(userRepository.update!).mockResolvedValue({
        affected: 1,
      });
      vi.mocked(refreshTokenService.create!).mockResolvedValue(
        mockTokens.refreshToken,
      );

      const result = await service.loginWithGoogle(googleProfile);

      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        googleId: googleProfile.googleId,
        avatarUrl: googleProfile.avatarUrl,
        isEmailVerified: true,
      });
      expect(result).toEqual(mockTokens);
    });

    it('should return tokens when user exists with googleId', async () => {
      const googleProfile = {
        googleId: 'mock-google-id',
        name: 'Mock Name',
        email: 'mock@email.com',
        avatarUrl: 'https://mock-avatar.com',
      };

      const mockUser = createMockUser({ googleId: 'mock-google-id' });
      const mockDate = new Date('2026-09-22T16:00:00.000Z');

      vi.spyOn(dateUtil, 'calculateExpiresAt').mockReturnValue(mockDate);

      const mockTokens = createMockTokens({
        accessToken: {
          token: 'mock-token',
          expiresAt: mockDate,
          tokenType: 'Bearer',
        },
        refreshToken: { token: 'mock-refresh-token', expiresAt: mockDate },
      });

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(mockUser);
      vi.mocked(refreshTokenService.create!).mockResolvedValue(
        mockTokens.refreshToken,
      );

      const result = await service.loginWithGoogle(googleProfile);

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(mockTokens);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should return undefined silently when user not found', async () => {
      const dto = new ResendEmailDto();
      dto.email = 'notfound@email.com';

      vi.mocked(userRepository.findOne!).mockResolvedValue(null);

      const result = await service.resendVerificationEmail(dto);

      expect(result).toBeUndefined();
      expect(emailVerificationService.create).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already verified', async () => {
      const dto = new ResendEmailDto();
      dto.email = 'mock@email.com';

      const mockUser = createMockUser({ isEmailVerified: true });

      vi.mocked(userRepository.findOne!).mockResolvedValue(mockUser);

      await expect(service.resendVerificationEmail(dto)).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_EMAIL_ALREADY_VERIFIED,
          'Email already verified',
          HttpStatus.CONFLICT,
        ),
      );
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should resend verification email successfully', async () => {
      const dto = new ResendEmailDto();
      dto.email = 'mock@email.com';

      const mockUser = createMockUser({ isEmailVerified: false });

      vi.mocked(userRepository.findOne!).mockResolvedValue(mockUser);

      vi.mocked(emailVerificationService.revokeAll!).mockResolvedValue(
        undefined,
      );
      vi.mocked(emailVerificationService.create!).mockResolvedValue(
        'mock-email-token',
      );

      const result = await service.resendVerificationEmail(dto);

      expect(result).toBeUndefined();
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyEmail', () => {
    it('should throw NotFoundException when email verification expired or not found', async () => {
      const dto = new VerifyEmailDto();
      dto.token = 'mock-email-invalid-token';

      vi.mocked(emailVerificationService.validate!).mockRejectedValue(
        new AppException(
          ErrorCodes.EMAIL_VERIFICATION_INVALID,
          'Email verification expired or not found',
          HttpStatus.NOT_FOUND,
        ),
      );

      await expect(service.verifyEmail(dto.token)).rejects.toThrow(
        new AppException(
          ErrorCodes.EMAIL_VERIFICATION_INVALID,
          'Email verification expired or not found',
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(emailVerificationService.revoke).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should verify email successfully', async () => {
      const mockUser = createMockUser({ isEmailVerified: false });
      const mockEmailVerification = createMockEmailVerification({
        userId: mockUser.id,
        user: mockUser,
      });

      vi.mocked(emailVerificationService.validate!).mockResolvedValue(
        mockEmailVerification,
      );
      mockDataSource.transaction.mockImplementation(
        (cb: (manager: unknown) => unknown) =>
          cb({ update: vi.fn().mockResolvedValue({ affected: 1 }) }),
      );

      await service.verifyEmail('mock-token');

      expect(emailVerificationService.revoke).toHaveBeenCalledTimes(1);
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('forgotPassword', () => {
    it('should return undefined silently when user not found', async () => {
      const dto = new ForgotPasswordDto();
      dto.email = 'notfound@email.com';

      vi.mocked(userRepository.findOne!).mockResolvedValue(null);

      const result = await service.forgotPassword(dto);

      expect(result).toBeUndefined();
      expect(mailService.sendMail!).not.toHaveBeenCalledTimes(1);
    });

    it('should send password reset email successfully', async () => {
      const dto = new ForgotPasswordDto();
      dto.email = 'mock@email.com';

      const mockUser = createMockUser();
      vi.mocked(userRepository.findOne!).mockResolvedValue(mockUser);

      vi.mocked(emailVerificationService.revokeAll!).mockResolvedValue(
        undefined,
      );
      vi.mocked(emailVerificationService.create!).mockResolvedValue(
        'mock-email-token',
      );

      const result = await service.forgotPassword(dto);

      expect(result).toBeUndefined();
      expect(mailService.sendMail!).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetPassword', () => {
    it('should throw NotFoundException when email verification expired or not found', async () => {
      const dto = new ResetPasswordDto();
      dto.otp = 'invalid-otp';
      dto.newPassword = 'mockPasswordStrong@123';
      dto.confirmPassword = 'mockPasswordStrong@123';

      vi.mocked(emailVerificationService.validate!).mockRejectedValue(
        new AppException(
          ErrorCodes.EMAIL_VERIFICATION_INVALID,
          'Email verification expired or not found',
          HttpStatus.NOT_FOUND,
        ),
      );

      await expect(service.resetPassword(dto)).rejects.toThrow(
        new AppException(
          ErrorCodes.EMAIL_VERIFICATION_INVALID,
          'Email verification expired or not found',
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      const dto = new ResetPasswordDto();
      dto.otp = '123456';
      dto.newPassword = 'newPasswordStrong@123';
      dto.confirmPassword = 'newPasswordStrong@123';

      const mockUser = createMockUser();
      const mockEmailVerification = createMockEmailVerification({
        userId: mockUser.id,
        user: mockUser,
      });

      vi.mocked(emailVerificationService.validate!).mockResolvedValue(
        mockEmailVerification,
      );

      vi.spyOn(hashUtil, 'hashPassword').mockResolvedValue('hashed-password');

      mockDataSource.transaction.mockImplementation(
        (cb: (manager: unknown) => unknown) =>
          cb({ update: vi.fn().mockResolvedValue({ affected: 0 }) }),
      );

      await expect(service.resetPassword(dto)).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should reset password successfully', async () => {
      const dto = new ResetPasswordDto();
      dto.otp = '123456';
      dto.newPassword = 'newPasswordStrong@123';
      dto.confirmPassword = 'newPasswordStrong@123';

      const mockUser = createMockUser();
      const mockEmailVerification = createMockEmailVerification({
        userId: mockUser.id,
        user: mockUser,
      });

      vi.mocked(emailVerificationService.validate!).mockResolvedValue(
        mockEmailVerification,
      );

      vi.spyOn(hashUtil, 'hashPassword').mockResolvedValue('hashed-password');

      mockDataSource.transaction.mockImplementation(
        (cb: (manager: unknown) => unknown) =>
          cb({ update: vi.fn().mockResolvedValue({ affected: 1 }) }),
      );

      await service.resetPassword(dto);

      expect(emailVerificationService.revoke).toHaveBeenCalledTimes(1);
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    });
  });
});
