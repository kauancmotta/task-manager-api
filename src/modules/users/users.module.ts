import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/users/entities/user.entity';
import { UsersController } from '@modules/users/controllers/users.controller';
import { UsersService } from '@modules/users/services/users.service';
import { StorageModule } from '@common/storage/storage.module';
import { MailModule } from '@common/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), StorageModule, MailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
