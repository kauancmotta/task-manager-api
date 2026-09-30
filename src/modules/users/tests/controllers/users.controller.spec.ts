import { Test } from '@nestjs/testing';
import { uuidv7 } from 'uuidv7';
import { Logger } from 'nestjs-pino';

import { UsersController } from '@modules/users/controllers/users.controller';
import { UsersService } from '@modules/users/services/users.service';
import { ChangePasswordDto, UpdateUserDto } from '@modules/users/dto';

import {
  createMockFile,
  createMockJwtPayload,
  createMockUser,
} from '@common/testing/mock-entities';
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

  describe('update', () => {
    it('should call service.update with userId, dto and return updated user', async () => {
      const id = uuidv7();
      const dto = new UpdateUserDto();
      dto.name = 'Mock Name Updated';

      const mockUser = createMockUser({
        id,
        name: 'Mock Name Updated',
      });

      const jwtPayload = createMockJwtPayload({
        sub: mockUser.id,
        email: mockUser.email,
      });

      vi.mocked(service.update).mockResolvedValue(mockUser);

      const result = await controller.update(jwtPayload, dto);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith({
        userId: jwtPayload.sub,
        updateUserDto: dto,
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateAvatar', () => {
    it('should call service.updateAvatar with userId and file and return user', async () => {
      const mockJwtPayload = createMockJwtPayload();
      const mockUser = createMockUser();
      const mockFile = createMockFile();

      vi.mocked(service.updateAvatar).mockResolvedValue(mockUser);

      const result = await controller.updateAvatar(mockJwtPayload, mockFile);

      expect(service.updateAvatar).toHaveBeenCalledWith({
        userId: mockJwtPayload.sub,
        avatarFile: mockFile,
      });
      expect(service.updateAvatar).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('removeAvatar', () => {
    it('should call service.removeAvatar with userId', async () => {
      const mockJwtPayload = createMockJwtPayload();

      vi.mocked(service.removeAvatar).mockResolvedValue(undefined);

      await controller.removeAvatar(mockJwtPayload);

      expect(service.removeAvatar).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(service.removeAvatar).toHaveBeenCalledTimes(1);
    });
  });

  describe('changePassword', () => {
    it('should call service.changePassword with userId and dto', async () => {
      const dto = new ChangePasswordDto();
      dto.password = 'passwordStrong@123';
      dto.newPassword = 'passwordStrong@123456';
      dto.confirmPassword = 'passwordStrong@123456';

      const mockJwtPayload = createMockJwtPayload();

      vi.mocked(service.changePassword).mockResolvedValue(undefined);

      await controller.changePassword(mockJwtPayload, dto);

      expect(service.changePassword).toHaveBeenCalledWith({
        userId: mockJwtPayload.sub,
        changePasswordDto: dto,
      });
      expect(service.changePassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should call service.remove with userId return void', async () => {
      const id = uuidv7();
      const mockUser = createMockUser({
        id,
        name: 'Mock Name Updated',
      });

      const jwtPayload = createMockJwtPayload({
        sub: mockUser.id,
        email: mockUser.email,
      });

      vi.mocked(service.remove).mockResolvedValue(undefined);

      await controller.remove(jwtPayload);

      expect(service.remove).toHaveBeenCalledWith(jwtPayload.sub);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
