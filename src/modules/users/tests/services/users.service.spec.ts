import { Logger } from 'nestjs-pino';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';

import { createMockLogger } from '@common/testing/mock-logger';
import {
  createMockRepository,
  MockRepository,
} from '@common/testing/mock-repository';
import { UsersController } from '@modules/users/controllers/users.controller';
import { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/services/users.service';
import { createMockUser } from '@common/testing/mock-entities';
import { CreateUserDto, UpdateUserDto } from '@modules/users/dto';
import {
  createMockDeleteResult,
  createMockUpdateResult,
} from '@common/testing/mock-typeorm';
import { createMockStorageService } from '@common/testing/mock-services';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;

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
          provide: 'STORAGE_SERVICE',
          useValue: createMockStorageService(),
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
    userRepository = moduleRef.get(getRepositoryToken(User));
  });

  describe('FindAll', () => {
    it('should call repository.find and return user', async () => {
      const mockUsers = [createMockUser()];

      userRepository.find!.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUsers);
    });
  });

  describe('FindOne', () => {
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
        new NotFoundException(`User ${id} not found`),
      );
    });
  });

  describe('Create', () => {
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
        new ConflictException(`Email "${dto.email}" already exists`),
      );
      expect(userRepository.exists).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });
  });

  describe('Update', () => {
    it('should call repository.update and return user', async () => {
      const id = uuidv7();

      const dto = new UpdateUserDto();
      dto.name = 'Mock Name';

      const mockUser = createMockUser({ id, name: dto.name });
      const mockUpdateResult = createMockUpdateResult(1);

      userRepository.update!.mockResolvedValue(mockUpdateResult);
      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await service.update(id, dto);

      expect(userRepository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundException when user not exists', async () => {
      const id = uuidv7();

      const dto = new CreateUserDto();
      dto.name = 'Mock Name';

      const mockUpdateResult = createMockUpdateResult(0);

      userRepository.update!.mockResolvedValue(mockUpdateResult);

      await expect(service.update(id, dto)).rejects.toThrow(
        new NotFoundException(`User ${id} not found`),
      );
    });
  });

  describe('Remove', () => {
    it('should call repository.remove and remove user', async () => {
      const id = uuidv7();

      const mockDeleteResult = createMockDeleteResult(1);

      userRepository.softDelete!.mockResolvedValue(mockDeleteResult);

      await service.remove(id);

      expect(userRepository.softDelete).toHaveBeenCalledWith({ id });
    });

    it('should throw NotFoundException when user not found', async () => {
      const id = uuidv7();

      const mockDeleteResult = createMockDeleteResult(0);

      userRepository.softDelete?.mockResolvedValue(mockDeleteResult);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`User ${id} not found`),
      );
    });
  });
});
