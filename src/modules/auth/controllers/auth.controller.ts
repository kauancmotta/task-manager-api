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
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';

import { AuthService } from '@modules/auth/services/auth.service';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { UsersService } from '@modules/users/services/users.service';
import type { AuthRequest } from '@common/interfaces';
import {
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '@modules/auth/dto';
import { GoogleAuthGuard } from '@modules/auth/guards/google.auth.guard';
import type { GoogleProfile, JwtPayload } from '@modules/auth/interfaces';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

import {
  SwaggerAuthForgotPasswordDoc,
  SwaggerAuthGetMeDoc,
  SwaggerAuthGoogleDoc,
  SwaggerAuthLoginDoc,
  SwaggerAuthLogoutDoc,
  SwaggerAuthRefreshDoc,
  SwaggerAuthRegisterDoc,
  SwaggerAuthResetPasswordDoc,
  SwaggerAuthVerifyEmailDoc,
} from '@modules/auth/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly usersService: UsersService,
  ) {}

  @SwaggerAuthRegisterDoc()
  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @SwaggerAuthLoginDoc()
  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @SwaggerAuthRefreshDoc()
  @Public()
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() refreshDto: RefreshDto) {
    return this.refreshTokensService.rotate(refreshDto.refreshToken);
  }

  @SwaggerAuthLogoutDoc()
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() logoutDto: LogoutDto) {
    return this.refreshTokensService.revoke(logoutDto.refreshToken);
  }

  @SwaggerAuthGoogleDoc()
  @Public()
  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  google(): void {
    // This method body is never executed.
    // GoogleAuthGuard intercepts the request and redirects to Google OAuth2 consent screen.
  }

  @ApiExcludeEndpoint()
  @Public()
  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Request() req: AuthRequest<GoogleProfile>) {
    return this.authService.loginWithGoogle(req.user);
  }

  @SwaggerAuthVerifyEmailDoc()
  @Public()
  @Get('/verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @SwaggerAuthForgotPasswordDoc()
  @Public()
  @Post('/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @SwaggerAuthResetPasswordDoc()
  @Public()
  @Post('/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @SwaggerAuthGetMeDoc()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }
}
