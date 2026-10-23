import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { StorageService } from '@common/storage/storage.interface';
import { EnvConfig } from '@common/config/env.config';

@Injectable()
export class S3StorageService extends StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    super();
    this.bucket = this.configService.get('AWS_S3_BUCKET', { infer: true });

    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION', { infer: true }),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', {
          infer: true,
        }),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', {
          infer: true,
        }),
      },
    });
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const key = `${randomUUID()}${ext}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: Buffer.from(file.buffer),
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    const region = this.configService.get('AWS_REGION', { infer: true });

    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.split('/').pop() as string;

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
