import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UsersService } from '@modules/users/services/users.service';
import { UploadedImage } from '@common/decorators/uploaded-image.decorator';
import { UuidParam } from '@common/decorators/uuid-param.decorator';
import { CreateUserDto, UpdateUserDto } from '@modules/users/dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@UuidParam('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(@UuidParam('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  updateAvatar(
    @UuidParam('id') id: string,
    @UploadedImage('avatar') avatar: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(id, avatar);
  }

  @Delete(':id/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAvatar(@UuidParam('id') id: string) {
    return this.usersService.removeAvatar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('id') id: string) {
    return this.usersService.remove(id);
  }
}
