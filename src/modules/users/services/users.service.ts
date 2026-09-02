import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@modules/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '@modules/users/dto';
import { Logger } from 'nestjs-pino';
import { StorageService } from '@common/storage/storage.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('STORAGE_SERVICE')
    private readonly storageService: StorageService,
  ) {}

  async findAll() {
    return this.userRepository.find();
  }

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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(id, updateUserDto);

    if (!result.affected) {
      throw new NotFoundException(`User ${id} not found`);
    }

    this.logger.log(`User ID: ${id} updated successfully`);

    return this.findOne(id);
  }

  async updateAvatar(id: string, avatar: Express.Multer.File) {
    const user = await this.findOne(id);

    if (user.avatarUrl) {
      await this.storageService.delete(user.avatarUrl);
    }

    const avatarUrl = await this.storageService.upload(avatar);

    await this.userRepository.update(id, { avatarUrl });

    this.logger.log(`User ID: ${id} avatar updated successfully`);

    return this.findOne(id);
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
