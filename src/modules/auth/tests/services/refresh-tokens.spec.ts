import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';

import * as tokenUtil from '@common/utils/token.util';
import { createMockLogger } from '@common/testing/mock-logger';
import { createMockRepository } from '@common/testing/mock-repository';
import { createMockConfigService } from '@common/testing/mock-services';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';
import {
  createMockRefreshToken,
  createMockUser,
} from '@common/testing/mock-entities';
import { createMockEntityManager } from '@common/testing/mock-typeorm';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { HttpStatus } from '@nestjs/common';

describe('RefreshTokensService', () => {
  let service: RefreshTokensService;
  let refreshTokenRepository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RefreshTokensService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: createMockRepository(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = moduleRef.get(RefreshTokensService);
    refreshTokenRepository = moduleRef.get(getRepositoryToken(RefreshToken));
  });

  describe('create', () => {
    it('should return token when created successfully', async () => {
      const mockDateExpires = new Date('2026-09-23T16:00:00.000Z');
      vi.spyOn(tokenUtil, 'generateToken').mockReturnValue('mock-token');
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockUser = createMockUser();
      const mockRefreshToken = createMockRefreshToken({
        refreshToken: 'mock-token-hash',
        expiresAt: mockDateExpires,
        user: mockUser,
        userId: mockUser.id,
      });

      vi.mocked(refreshTokenRepository.create!).mockReturnValue(
        mockRefreshToken,
      );

      const result = await service.create(mockUser.id);

      expect(result).toEqual({
        token: 'mock-token',
        expiresAt: mockDateExpires,
      });
      expect(refreshTokenRepository.create).toHaveBeenCalledTimes(1);
      expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should use manager repository when manager is provided', async () => {
      const mockDateExpires = new Date('2026-09-23T16:00:00.000Z');
      vi.spyOn(tokenUtil, 'generateToken').mockReturnValue('mock-token');
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockUser = createMockUser();
      const mockRefreshToken = createMockRefreshToken({
        refreshToken: 'mock-token-hash',
        expiresAt: mockDateExpires,
        userId: mockUser.id,
      });

      const mockManagerRepository = createMockRepository();
      vi.mocked(mockManagerRepository.create!).mockReturnValue(
        mockRefreshToken,
      );

      const mockManager = createMockEntityManager(mockManagerRepository);

      const result = await service.create(mockUser.id, mockManager);

      expect(mockManager.getRepository).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        token: 'mock-token',
        expiresAt: mockDateExpires,
      });
    });
  });

  describe('validate', () => {
    it('should throw UnauthorizedException when invalid refresh token', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      vi.mocked(refreshTokenRepository.findOne!).mockResolvedValue(null);

      await expect(
        service.validate('notfound-or-expires-token'),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_INVALID_REFRESH_TOKEN,
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should return token when successfully', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockUser = createMockUser();
      const mockRefreshToken = createMockRefreshToken({
        refreshToken: 'mock-token-hash',
        user: mockUser,
        userId: mockUser.id,
      });

      vi.mocked(refreshTokenRepository.findOne!).mockResolvedValue(
        mockRefreshToken,
      );

      const result = await service.validate('mock-token');

      expect(result).toBe(mockRefreshToken);
    });
  });

  describe('rotate', () => {
    it('should throw UnauthorizedException when invalid refresh token or expires', async () => {
      vi.mocked(refreshTokenRepository.findOne!).mockResolvedValue(null);

      await expect(service.rotate('notfound-or-expires-token')).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_INVALID_REFRESH_TOKEN,
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should rotate refresh token successfully', async () => {
      vi.spyOn(tokenUtil, 'generateToken').mockReturnValue('mock-token');
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      const mockRefreshToken = createMockRefreshToken({
        refreshToken: 'mock-token-hash',
      });

      vi.mocked(refreshTokenRepository.findOne!).mockResolvedValue(
        mockRefreshToken,
      );

      vi.mocked(refreshTokenRepository.create!).mockReturnValue(
        mockRefreshToken,
      );

      const result = await service.rotate(mockRefreshToken.refreshToken);

      expect(result).toEqual({
        token: 'mock-token',
        expiresAt: mockRefreshToken.expiresAt,
      });
      expect(refreshTokenRepository.delete!).toHaveBeenCalledTimes(1);
      expect(refreshTokenRepository.save!).toHaveBeenCalledTimes(1);
    });
  });

  describe('revoke', () => {
    it('should throw UnauthorizedException when invalid refresh token or expires', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      vi.mocked(refreshTokenRepository.delete!).mockResolvedValue({
        affected: 0,
      });

      await expect(service.revoke('mock-token')).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_INVALID_REFRESH_TOKEN,
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
        ),
      );
      expect(refreshTokenRepository.delete!).toHaveBeenCalledTimes(1);
    });

    it('should revoke refresh token successfully', async () => {
      vi.spyOn(tokenUtil, 'hashToken').mockReturnValue('mock-token-hash');

      vi.mocked(refreshTokenRepository.delete!).mockResolvedValue({
        affected: 1,
      });

      const result = await service.revoke('mock-token');

      expect(result).toBeUndefined();
      expect(refreshTokenRepository.delete!).toHaveBeenCalledTimes(1);
    });
  });

  describe('revokeAll', () => {
    it('should revoke all refresh token successfully ', async () => {
      await service.revokeAll('mock-user-id');

      expect(refreshTokenRepository.delete!).toHaveBeenCalledTimes(1);
      expect(refreshTokenRepository.delete!).toHaveBeenCalledWith({
        userId: 'mock-user-id',
      });
    });
  });

  describe('cleanExpired', () => {
    it('should delete expired refresh tokens', async () => {
      vi.mocked(refreshTokenRepository.delete!).mockResolvedValue({
        affected: 3,
      });

      await service.cleanExpired();

      expect(refreshTokenRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should not throw when no expired refresh token found', async () => {
      vi.mocked(refreshTokenRepository.delete!).mockResolvedValue({
        affected: 0,
      });

      const result = await service.cleanExpired();

      expect(result).toBeUndefined();
      expect(refreshTokenRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
