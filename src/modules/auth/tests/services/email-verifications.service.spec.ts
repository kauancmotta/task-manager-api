import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';

import * as tokenUtil from '@common/utils/token.util';
import { EmailVerificationsService } from '@modules/auth/services/email-verifications.service';
import { createMockLogger } from '@common/testing/mock-logger';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockRepository } from '@common/testing/mock-repository';
import { createMockConfigService } from '@common/testing/mock-services';
import { EmailVerification } from '@modules/auth/entities/email-verification.entity';
import { ConfigService } from '@nestjs/config';
import {
  createMockEmailVerification,
  createMockUser,
} from '@common/testing/mock-entities';
import { EmailVerificationTypes } from '@modules/auth/enums';
import {
  createMockEntityManager,
  createMockQueryBuilder,
} from '@common/testing/mock-typeorm';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { HttpStatus } from '@nestjs/common';

describe('EmailVerificationsService', () => {
  let service: EmailVerificationsService;
  let emailVerificationRepository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailVerificationsService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: getRepositoryToken(EmailVerification),
          useValue: createMockRepository(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = moduleRef.get(EmailVerificationsService);
    emailVerificationRepository = moduleRef.get(
      getRepositoryToken(EmailVerification),
    );
  });

  describe('create', () => {
    it('should return token when created successfully', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockUser = createMockUser();

      const result = await service.create({
        userId: mockUser.id,
        token: 'mock-token',
        type: EmailVerificationTypes.EMAIL_CONFIRMATION,
      });

      expect(emailVerificationRepository.create).toHaveBeenCalledTimes(1);
      expect(emailVerificationRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toBe('mock-token');
    });

    it('should use manager repository when manager is provided', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockManager = createMockEntityManager();
      const mockUser = createMockUser();

      const result = await service.create({
        userId: mockUser.id,
        token: 'mock-token',
        type: EmailVerificationTypes.EMAIL_CONFIRMATION,
        manager: mockManager,
      });

      expect(mockManager.getRepository).toHaveBeenCalledTimes(1);
      expect(result).toBe('mock-token');
    });
  });

  describe('validate', () => {
    it('should throw NotFoundException when email verification expired or not found', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(
        emailVerificationRepository.createQueryBuilder!,
      ).mockReturnValue(mockQueryBuilder);
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(null);

      await expect(
        service.validate({
          token: 'notfound-or-expires-token',
          type: EmailVerificationTypes.EMAIL_CONFIRMATION,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.EMAIL_VERIFICATION_INVALID,
          'Email verification expired or not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should return token when successfully', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockUser = createMockUser();
      const mockEmailVerification = createMockEmailVerification({
        user: mockUser,
        userId: mockUser.id,
      });

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(
        emailVerificationRepository.createQueryBuilder!,
      ).mockReturnValue(mockQueryBuilder);
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(
        mockEmailVerification,
      );

      const result = await service.validate({
        token: 'mock-token',
        type: EmailVerificationTypes.EMAIL_CONFIRMATION,
      });

      expect(result).toBe(mockEmailVerification);
    });
  });

  describe('revoke', () => {
    it('should throw NotFoundException when email verification expired or not found', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockUser = createMockUser();

      vi.mocked(emailVerificationRepository.delete!).mockResolvedValue({
        affected: 0,
      });

      await expect(
        service.revoke({
          userId: mockUser.id,
          token: 'mock-token',
          type: EmailVerificationTypes.EMAIL_CONFIRMATION,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.EMAIL_VERIFICATION_INVALID,
          'Email verification expired or not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(emailVerificationRepository.delete!).toHaveBeenCalledTimes(1);
    });

    it('should use manager repository and throw NotFoundException when email verification expired or not found', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockRepository = createMockRepository();
      const mockManager = createMockEntityManager(mockRepository, {
        deleteAffected: 0,
      });
      const mockUser = createMockUser();

      await expect(
        service.revoke({
          userId: mockUser.id,
          token: 'mock-token',
          type: EmailVerificationTypes.EMAIL_CONFIRMATION,
          manager: mockManager,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.EMAIL_VERIFICATION_INVALID,
          'Email verification expired or not found',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(mockManager.getRepository).toHaveBeenCalledTimes(1);
    });

    it('should revoke email verification successfully', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockUser = createMockUser();

      vi.mocked(emailVerificationRepository.delete!).mockResolvedValue({
        affected: 1,
      });

      const result = await service.revoke({
        userId: mockUser.id,
        token: 'mock-token',
        type: EmailVerificationTypes.EMAIL_CONFIRMATION,
      });

      expect(emailVerificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should use manager repository when manager is provided', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockManager = createMockEntityManager();
      const mockUser = createMockUser();

      const result = await service.revoke({
        userId: mockUser.id,
        token: 'mock-token',
        type: EmailVerificationTypes.EMAIL_CONFIRMATION,
        manager: mockManager,
      });

      expect(mockManager.getRepository).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('revokeAll', () => {
    it('should revoke all email verifications successfully', async () => {
      const mockUser = createMockUser();

      vi.mocked(emailVerificationRepository.delete!).mockResolvedValue({
        affected: 1,
      });

      const result = await service.revokeAll({
        userId: mockUser.id,
        type: EmailVerificationTypes.EMAIL_CONFIRMATION,
      });

      expect(emailVerificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should use manager repository when manager is provided', async () => {
      const mockManager = createMockEntityManager();
      const mockUser = createMockUser();

      const result = await service.revokeAll({
        userId: mockUser.id,
        type: EmailVerificationTypes.EMAIL_CONFIRMATION,
        manager: mockManager,
      });

      expect(mockManager.getRepository).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('cleanExpired', () => {
    it('should delete expired email verifications', async () => {
      vi.mocked(emailVerificationRepository.delete!).mockResolvedValue({
        affected: 3,
      });

      await service.cleanExpired();

      expect(emailVerificationRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should not throw when no expired verifications found', async () => {
      vi.mocked(emailVerificationRepository.delete!).mockResolvedValue({
        affected: 0,
      });

      const result = await service.cleanExpired();

      expect(result).toBeUndefined();
      expect(emailVerificationRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
