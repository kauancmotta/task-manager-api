import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { createMockConfigService } from '@common/testing/mock-services';
import { S3StorageService } from '@common/storage/services/s3-storage.service';

const mockSend = vi.fn();

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(function () {
    return { send: mockSend };
  }),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

describe('S3StorageService', () => {
  let service: S3StorageService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        S3StorageService,
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = moduleRef.get(S3StorageService);
  });

  describe('upload', () => {
    it('should upload file to S3 and return file url', async () => {
      const mockFile = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        buffer: Buffer.from('mock-file'),
      } as Express.Multer.File;

      vi.mocked(mockSend).mockResolvedValue({});

      const result = await service.upload(mockFile);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(PutObjectCommand).toHaveBeenCalledTimes(1);
      expect(result).toContain('.png');
    });

    it('should throw when S3 upload fails', async () => {
      const mockFile = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        buffer: Buffer.from('mock-file'),
      } as Express.Multer.File;

      vi.mocked(mockSend).mockRejectedValue(new Error('S3 error'));

      await expect(service.upload(mockFile)).rejects.toThrow('S3 error');
    });
  });

  describe('delete', () => {
    it('should delete file from S3 successfully', async () => {
      vi.mocked(mockSend).mockResolvedValue({});

      await service.delete('https://bucket.s3.amazonaws.com/mock-file.png');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(DeleteObjectCommand).toHaveBeenCalledTimes(1);
    });

    it('should throw when S3 delete fails', async () => {
      vi.mocked(mockSend).mockRejectedValue(new Error('S3 error'));

      await expect(
        service.delete('https://bucket.s3.amazonaws.com/mock-file.png'),
      ).rejects.toThrow('S3 error');
    });
  });
});
