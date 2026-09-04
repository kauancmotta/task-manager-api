import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { JwtPayload } from '@modules/auth/interfaces';
import { UsersService } from '@modules/users/services/users.service';
import { UploadedImage } from '@common/decorators/uploaded-image.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UpdateUserDto } from '@modules/users/dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/me')
  update(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update({ userId: user.sub, updateUserDto });
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatarFile'))
  updateAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedImage('avatarFile') avatarFile: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar({ userId: user.sub, avatarFile });
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAvatar(@CurrentUser() user: JwtPayload) {
    return this.usersService.removeAvatar(user.sub);
  }

  @Delete('/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload) {
    return this.usersService.remove(user.sub);
  }
}
