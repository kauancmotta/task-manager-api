import { Test } from '@nestjs/testing';
import { uuidv7 } from 'uuidv7';
import { Logger } from 'nestjs-pino';

import { UsersController } from '@modules/users/controllers/users.controller';
import { UsersService } from '@modules/users/services/users.service';
import { CreateUserDto, UpdateUserDto } from '@modules/users/dto';

import { createMockUser } from '@common/testing/mock-entities';
import { createMockUsersService } from '@common/testing/mock-services';
import { createMockLogger } from '@common/testing/mock-logger';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: createMockUsersService(),
        },
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
      ],
    }).compile();

    controller = moduleRef.get(UsersController);
    service = moduleRef.get(UsersService);
  });

  describe('FindAll', () => {
    it('should call service.findAll and return correct', async () => {
      const mockUsers = [createMockUser()];

      vi.mocked(service.findAll).mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('FindOne', () => {
    it('should call service.findOne with id and return user', async () => {
      const id = uuidv7();
      const mockUser = createMockUser({ id });

      vi.mocked(service.findOne).mockResolvedValue(mockUser);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('Create', () => {
    it('should call service.create with dto and return created user', async () => {
      const id = uuidv7();
      const dto = new CreateUserDto();
      dto.name = 'Mock Name';
      dto.email = 'mock@email.com';

      const mockUser = createMockUser({
        id,
        name: 'Mock Name',
        email: 'mock@email.com',
      });

      vi.mocked(service.create).mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('Update', () => {
    it('should call service.update with dto and return updated user', async () => {
      const id = uuidv7();
      const dto = new UpdateUserDto();
      dto.name = 'Mock Name Updated';

      const mockUser = createMockUser({
        id,
        name: 'Mock Name Updated',
      });

      vi.mocked(service.update).mockResolvedValue(mockUser);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(id, dto);

      expect(result).toEqual(mockUser);
    });
  });

  describe('Remove', () => {
    it('should call service.remove with id return void', async () => {
      const id = uuidv7();

      vi.mocked(service.remove).mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
