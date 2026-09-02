import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LocalStorageService } from '@common/storage/services/local-storage.service';
import { S3StorageService } from '@common/storage/services/s3-storage.service';
import { StorageService } from '@common/storage/storage.interface';
import { EnvConfig } from '@common/config/env.config';

@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageService,
    S3StorageService,
    {
      provide: 'STORAGE_SERVICE',
      inject: [ConfigService, LocalStorageService, S3StorageService],
      useFactory: (
        configService: ConfigService<EnvConfig, true>,
        localStorageService: LocalStorageService,
        s3StorageService: S3StorageService,
      ): StorageService => {
        const provider = configService.get('STORAGE_PROVIDER', { infer: true });

        const providers: Record<string, StorageService> = {
          local: localStorageService,
          s3: s3StorageService,
        };

        return providers[provider];
      },
    },
  ],
  exports: ['STORAGE_SERVICE'],
})
export class StorageModule {}
