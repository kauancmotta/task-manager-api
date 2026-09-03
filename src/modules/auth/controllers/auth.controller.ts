import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AuthService } from '@modules/auth/services/auth.service';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { UsersService } from '@modules/users/services/users.service';
import type { AuthRequest } from '@common/interfaces';
import {
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
} from '@modules/auth/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/refresh')
  refresh(@Body() refreshDto: RefreshDto) {
    return this.refreshTokensService.rotate(refreshDto.refreshToken);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() logoutDto: LogoutDto) {
    return this.refreshTokensService.revoke(logoutDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: AuthRequest) {
    return this.usersService.findOne(req.user.sub);
  }
}
