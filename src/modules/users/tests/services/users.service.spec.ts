import { Logger } from 'nestjs-pino';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpStatus } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';

import * as hashUtil from '@common/utils/hash.util';
import { createMockLogger } from '@common/testing/mock-logger';
import {
  createMockRepository,
  MockRepository,
} from '@common/testing/mock-repository';
import { UsersController } from '@modules/users/controllers/users.controller';
import { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/services/users.service';
import { createMockFile, createMockUser } from '@common/testing/mock-entities';
import {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserDto,
} from '@modules/users/dto';
import {
  createMockDeleteResult,
  createMockQueryBuilder,
  createMockUpdateResult,
} from '@common/testing/mock-typeorm';
import {
  createMockConfigService,
  createMockMailService,
  createMockStorageService,
} from '@common/testing/mock-services';
import { MailService } from '@common/mail/services/mail.service';
import { ConfigService } from '@nestjs/config';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { StorageService } from '@common/storage/storage.interface';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let storageService: StorageService;
  let mailService: ReturnType<typeof createMockMailService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
        {
          provide: MailService,
          useValue: createMockMailService(),
        },
        {
          provide: 'STORAGE_SERVICE',
          useValue: createMockStorageService(),
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
    userRepository = moduleRef.get(getRepositoryToken(User));
    storageService = moduleRef.get('STORAGE_SERVICE');
    mailService = moduleRef.get(MailService);
  });

  describe('findOne', () => {
    it('should call repository.findOne return user', async () => {
      const id = uuidv7();
      const mockUser = createMockUser({ id });

      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const id = uuidv7();

      userRepository.findOne!.mockResolvedValue(null);
      await expect(service.findOne(id)).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('create', () => {
    it('should call repository.create and return user', async () => {
      const id = uuidv7();

      const dto = new CreateUserDto();
      dto.name = 'Mock Name';
      dto.email = 'mock@email.com';

      const mockUser = createMockUser({ id, name: dto.name, email: dto.email });

      userRepository.exists!.mockResolvedValue(false);

      userRepository.create!.mockReturnValue(mockUser);
      userRepository.save!.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(userRepository.exists).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockUser);
    });

    it('should throw ConflictException when email is already exists', async () => {
      const dto = new CreateUserDto();
      dto.name = 'Mock Name';
      dto.email = 'mock@email.com';

      userRepository.exists!.mockResolvedValue(true);

      await expect(service.create(dto)).rejects.toThrow(
        new AppException(
          ErrorCodes.AUTH_EMAIL_ALREADY_EXISTS,
          'Email already exists',
          HttpStatus.CONFLICT,
        ),
      );
      expect(userRepository.exists).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });
  });

  describe('update', () => {
    it('should call repository.update and return user', async () => {
      const id = uuidv7();

      const dto = new UpdateUserDto();
      dto.name = 'Mock Name';

      const mockUser = createMockUser({ id, name: dto.name });
      const mockUpdateResult = createMockUpdateResult(1);

      userRepository.update!.mockResolvedValue(mockUpdateResult);
      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await service.update({
        userId: mockUser.id,
        updateUserDto: dto,
      });

      expect(userRepository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundException when user not exists', async () => {
      const id = uuidv7();

      const dto = new CreateUserDto();
      dto.name = 'Mock Name';

      const mockUser = createMockUser({ id, name: dto.name });
      const mockUpdateResult = createMockUpdateResult(0);

      userRepository.update!.mockResolvedValue(mockUpdateResult);

      await expect(
        service.update({ userId: mockUser.id, updateUserDto: dto }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('updateAvatar', () => {
    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(userRepository.findOne!).mockResolvedValue(null);

      const mockFile = createMockFile();

      await expect(
        service.updateAvatar({
          userId: 'notfound-user-id',
          avatarFile: mockFile,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should update avatar and delete old avatar when user already has avatar', async () => {
      const id = uuidv7();
      const mockUser = createMockUser({ id, avatarUrl: 'mock-old-path-file' });
      const mockFile = createMockFile();
      const mockUpdateUser = { ...mockUser, avatarUrl: 'mock-path-file' };

      vi.mocked(storageService.delete).mockResolvedValue(undefined);
      vi.mocked(storageService.upload).mockResolvedValue('mock-path-file');
      vi.mocked(userRepository.findOne!)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUpdateUser);

      const result = await service.updateAvatar({
        userId: mockUser.id,
        avatarFile: mockFile,
      });

      expect(result).toEqual(mockUpdateUser);
      expect(storageService.delete).toHaveBeenCalledTimes(1);
      expect(storageService.delete).toHaveBeenCalledWith('mock-old-path-file');
      expect(storageService.upload).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        avatarUrl: 'mock-path-file',
      });
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should update avatar without deleting when user has no avatar', async () => {
      const id = uuidv7();
      const mockUser = createMockUser({ id, avatarUrl: undefined });
      const mockFile = createMockFile();
      const mockUpdateUser = { ...mockUser, avatarUrl: 'mock-path-file' };

      vi.mocked(storageService.upload).mockResolvedValue('mock-path-file');
      vi.mocked(userRepository.findOne!)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUpdateUser);

      const result = await service.updateAvatar({
        userId: mockUser.id,
        avatarFile: mockFile,
      });

      expect(result).toEqual(mockUpdateUser);
      expect(storageService.delete).not.toHaveBeenCalled();
      expect(storageService.upload).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        avatarUrl: 'mock-path-file',
      });
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeAvatar', () => {
    it('should throw NotFoundException when user not found', async () => {
      const id = uuidv7();
      const mockUser = createMockUser({ id });

      vi.mocked(userRepository.findOne!).mockResolvedValue(null);

      await expect(service.removeAvatar(mockUser.id)).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw NotFoundException when user avatar not found', async () => {
      const id = uuidv7();
      const mockUser = createMockUser({ id });

      vi.mocked(userRepository.findOne!).mockResolvedValue(mockUser);

      await expect(service.removeAvatar(mockUser.id)).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_AVATAR_NOT_FOUND,
          'User avatar not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should remove avatar and update user avatarUrl to null', async () => {
      const id = uuidv7();
      const mockUser = createMockUser({ id, avatarUrl: 'mock-path-file' });

      vi.mocked(userRepository.findOne!).mockResolvedValue(mockUser);

      const result = await service.removeAvatar(mockUser.id);

      expect(result).toBeUndefined();
      expect(storageService.delete).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        avatarUrl: null,
      });
    });
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      const dto = new ChangePasswordDto();
      dto.password = 'currentPassword@123';
      dto.newPassword = 'newPassword@123';
      dto.confirmPassword = 'newPassword@123';

      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(null);

      await expect(
        service.changePassword({
          userId: 'mock-user-id',
          changePasswordDto: dto,
        }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_INVALID_PASSWORD,
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const dto = new ChangePasswordDto();
      dto.password = 'wrongPassword@123';
      dto.newPassword = 'newPassword@123';
      dto.confirmPassword = 'newPassword@123';

      const mockUser = createMockUser();
      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(mockUser);
      vi.spyOn(hashUtil, 'comparePassword').mockResolvedValue(false);

      await expect(
        service.changePassword({ userId: mockUser.id, changePasswordDto: dto }),
      ).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_INVALID_PASSWORD,
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should change password successfully', async () => {
      const dto = new ChangePasswordDto();
      dto.password = 'currentPassword@123';
      dto.newPassword = 'newPassword@123';
      dto.confirmPassword = 'newPassword@123';

      const mockUser = createMockUser();
      const mockQueryBuilder = createMockQueryBuilder();
      vi.mocked(userRepository.createQueryBuilder!).mockReturnValue(
        mockQueryBuilder,
      );
      vi.mocked(mockQueryBuilder.getOne).mockResolvedValue(mockUser);
      vi.spyOn(hashUtil, 'comparePassword').mockResolvedValue(true);
      vi.spyOn(hashUtil, 'hashPassword').mockResolvedValue(
        'mock-password-hash',
      );

      await service.changePassword({
        userId: mockUser.id,
        changePasswordDto: dto,
      });

      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: 'mock-password-hash',
      });
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should call repository.remove and remove user', async () => {
      const id = uuidv7();

      const mockUser = createMockUser({ id });
      const mockDeleteResult = createMockDeleteResult(1);

      userRepository.softDelete!.mockResolvedValue(mockDeleteResult);

      await service.remove(mockUser.id);

      expect(userRepository.softDelete).toHaveBeenCalledWith({
        id: mockUser.id,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const id = uuidv7();

      const mockUser = createMockUser({ id });
      const mockDeleteResult = createMockDeleteResult(0);

      userRepository.softDelete?.mockResolvedValue(mockDeleteResult);

      await expect(service.remove(mockUser.id)).rejects.toThrow(
        new AppException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
