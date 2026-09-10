import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@modules/users/entities/user.entity';
import { CreateUserDto } from '@modules/users/dto';
import { Logger } from 'nestjs-pino';
import { StorageService } from '@common/storage/storage.interface';
import {
  UserContextWithAvatar,
  UserContextWithChangePasswordDto,
  UserContextWithUpdateUserDto,
} from '@modules/users/interfaces';
import { comparePassword, hashPassword } from '@common/utils';
import { MailService } from '@common/mail/services/mail.service';
import { EMAIL_VERIFICATION_TYPE_DICTIONARY } from '@modules/auth/constants/email-verification-type-dictionary.constant';
import { EmailVerificationTypes } from '@modules/auth/enums';
import { MailTemplates } from '@common/mail/enums';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('STORAGE_SERVICE')
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
  ) {}

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    await this.validateExistEmail(createUserDto.email);

    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);

    this.logger.log(`User ID: ${user.id} created successfully`);

    return user;
  }

  async update({ userId, updateUserDto }: UserContextWithUpdateUserDto) {
    const result = await this.userRepository.update(userId, updateUserDto);

    if (!result.affected) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    this.logger.log(`User ID: ${userId} updated successfully`);

    return this.findOne(userId);
  }

  async updateAvatar({ userId, avatarFile }: UserContextWithAvatar) {
    const user = await this.findOne(userId);

    if (user.avatarUrl) {
      await this.storageService.delete(user.avatarUrl);
    }

    const avatarUrl = await this.storageService.upload(avatarFile);

    await this.userRepository.update(userId, { avatarUrl });

    this.logger.log(`User ID: ${userId} avatar updated successfully`);

    return this.findOne(userId);
  }

  async removeAvatar(id: string) {
    const user = await this.findOne(id);

    if (!user.avatarUrl) {
      throw new NotFoundException(`User ID: ${id} avatar not found`);
    }

    await this.storageService.delete(user.avatarUrl);

    await this.userRepository.update(id, { avatarUrl: null });

    this.logger.log(`User ID: ${id} avatar removed successfully`);
  }

  async changePassword({
    userId,
    changePasswordDto,
  }: UserContextWithChangePasswordDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.id', 'user.email', 'user.password'])
      .where('user.id = :id', { id: userId })
      .getOne();

    const isValid = await comparePassword(
      changePasswordDto.password,
      user?.password ?? '',
    );

    if (!user || !isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = await hashPassword(changePasswordDto.newPassword);

    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    this.logger.log(`User ID: ${user.id} password updated successfully`);

    await this.mailService.sendMail({
      to: user.email,
      subject:
        EMAIL_VERIFICATION_TYPE_DICTIONARY[
          EmailVerificationTypes.PASSWORD_CHANGED
        ],
      template: {
        nameFileTemplate: MailTemplates.PASSWORD_CHANGED,
        variables: {},
      },
    });
  }

  async remove(id: string) {
    const result = await this.userRepository.softDelete({ id });

    if (!result.affected) {
      throw new NotFoundException(`User ${id} not found`);
    }

    this.logger.log(`User ID: ${id} deleted successfully`);
  }

  private async validateExistEmail(email: string) {
    const exists = await this.userRepository.exists({ where: { email } });

    if (exists) {
      throw new ConflictException(`Email "${email}" already exists`);
    }
  }
}
