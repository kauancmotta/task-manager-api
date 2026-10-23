import { Injectable } from '@nestjs/common';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { StorageService } from '@common/storage/storage.interface';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@common/config/env.config';

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly appUrl: string;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {
    super();

    this.appUrl = this.configService.get('APP_URL', { infer: true });

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const filepath = join(this.uploadDir, filename);
    await writeFile(filepath, file.buffer);

    return `${this.appUrl}/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const filename = url.split('/uploads/')[1];
    const filepath = join(this.uploadDir, filename ?? '');

    try {
      await unlink(filepath);
    } catch (error) {
      this.logger.error('Error removing file', (error as Error).message);
    }
  }
}
