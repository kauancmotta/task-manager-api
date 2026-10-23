import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/users/entities/user.entity';
import { UsersController } from '@modules/users/controllers/users.controller';
import { UsersService } from '@modules/users/services/users.service';
import { StorageModule } from '@common/storage/storage.module';
import { MailModule } from '@common/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    StorageModule,
    MailModule,
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
