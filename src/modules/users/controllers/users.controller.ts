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
import { ChangePasswordDto, UpdateUserDto } from '@modules/users/dto';
import { ApiTags } from '@nestjs/swagger';
import {
  SwaggerUserChangePasswordDoc,
  SwaggerUserRemoveAvatarDoc,
  SwaggerUserRemoveDoc,
  SwaggerUserUpdateAvatarDoc,
  SwaggerUserUpdateDoc,
} from '@modules/users/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SwaggerUserUpdateDoc()
  @HttpCode(HttpStatus.OK)
  @Patch('/me')
  update(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update({ userId: user.sub, updateUserDto });
  }

  @SwaggerUserUpdateAvatarDoc()
  @HttpCode(HttpStatus.OK)
  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatarFile'))
  updateAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedImage('avatarFile') avatarFile: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar({ userId: user.sub, avatarFile });
  }

  @SwaggerUserRemoveAvatarDoc()
  @Delete('me/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAvatar(@CurrentUser() user: JwtPayload) {
    return this.usersService.removeAvatar(user.sub);
  }

  @SwaggerUserChangePasswordDoc()
  @Patch('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword({
      userId: user.sub,
      changePasswordDto,
    });
  }

  @SwaggerUserRemoveDoc()
  @Delete('/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload) {
    return this.usersService.remove(user.sub);
  }
}
