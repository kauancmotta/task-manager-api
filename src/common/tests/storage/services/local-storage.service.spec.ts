import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

import { createMockConfigService } from '@common/testing/mock-services';
import { LocalStorageService } from '@common/storage/services/local-storage.service';
import { createMockLogger } from '@common/testing/mock-logger';

const { writeFile, unlink, existsSync, mkdirSync } = vi.hoisted(() => ({
  writeFile: vi.fn(),
  unlink: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('fs/promises', () => ({ writeFile, unlink }));
vi.mock('fs', () => ({ existsSync, mkdirSync }));

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LocalStorageService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = moduleRef.get(LocalStorageService);
  });

  describe('upload', () => {
    it('should upload file and return file path', async () => {
      const mockFile = {
        originalname: 'avatar.png',
        buffer: Buffer.from('mock-file'),
      } as Express.Multer.File;

      writeFile.mockResolvedValue(undefined);

      const result = await service.upload(mockFile);

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(result).toContain('.png');
    });

    it('should throw when writeFile fails', async () => {
      const mockFile = {
        originalname: 'avatar.png',
        buffer: Buffer.from('mock-file'),
      } as Express.Multer.File;

      writeFile.mockRejectedValue(new Error('Permission denied'));

      await expect(service.upload(mockFile)).rejects.toThrow(
        'Permission denied',
      );
    });

    it('should upload file and return file path', async () => {
      const mockFile = {
        originalname: 'avatar.png',
        buffer: Buffer.from('mock-file'),
      } as Express.Multer.File;

      existsSync.mockReturnValue(false);
      mkdirSync.mockReturnValue(undefined);
      writeFile.mockResolvedValue(undefined);

      const result = await service.upload(mockFile);

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(result).toContain('.png');
    });
  });

  describe('delete', () => {
    it('should not throw when file does not exist', async () => {
      const error = Object.assign(new Error('file not found'), {
        code: 'ENOENT',
      });
      unlink.mockRejectedValue(error);

      await expect(
        service.delete('uploads/not-found.png'),
      ).resolves.toBeUndefined();
    });

    it('should delete file successfully', async () => {
      unlink.mockResolvedValue(undefined);

      await service.delete('uploads/mock-file.png');

      expect(unlink).toHaveBeenCalledTimes(1);
    });
  });
});
