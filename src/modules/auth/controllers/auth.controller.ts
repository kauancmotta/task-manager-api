import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '@modules/auth/services/auth.service';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { UsersService } from '@modules/users/services/users.service';
import type { AuthRequest } from '@common/interfaces';
import {
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  VerifyEmailDto,
} from '@modules/auth/dto';
import { GoogleAuthGuard } from '@modules/auth/guards/google.auth.guard';
import type { GoogleProfile, JwtPayload } from '@modules/auth/interfaces';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('/refresh')
  refresh(@Body() refreshDto: RefreshDto) {
    return this.refreshTokensService.rotate(refreshDto.refreshToken);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() logoutDto: LogoutDto) {
    return this.refreshTokensService.revoke(logoutDto.refreshToken);
  }

  @Public()
  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  google(): void {
    // This method body is never executed.
    // GoogleAuthGuard intercepts the request and redirects to Google OAuth2 consent screen.
  }

  @Public()
  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Request() req: AuthRequest<GoogleProfile>) {
    return this.authService.loginWithGoogle(req.user);
  }

  @Public()
  @Get('/verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }
}
