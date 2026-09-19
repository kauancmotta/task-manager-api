import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

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
  ResendEmailDto,
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
  SwaggerAuthGoogleCallbackDoc,
  SwaggerAuthGoogleDoc,
  SwaggerAuthLoginDoc,
  SwaggerAuthLogoutAllDoc,
  SwaggerAuthLogoutDoc,
  SwaggerAuthRefreshDoc,
  SwaggerAuthRegisterDoc,
  SwaggerAuthResendVerificationEmailDoc,
  SwaggerAuthResetPasswordDoc,
  SwaggerAuthVerifyEmailDoc,
} from '@modules/auth/swagger';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@common/config/env.config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService<EnvConfig, true>,
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

  @SwaggerAuthLogoutAllDoc()
  @Post('/logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  logoutAll(@CurrentUser() user: JwtPayload) {
    return this.refreshTokensService.revokeAll(user.sub);
  }

  @SwaggerAuthGoogleDoc()
  @Public()
  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  google(): void {
    // This method body is never executed.
    // GoogleAuthGuard intercepts the request and redirects to Google OAuth2 consent screen.
  }

  @SwaggerAuthGoogleCallbackDoc()
  @Public()
  @Get('/google/callback')
  @HttpCode(HttpStatus.FOUND)
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Request() req: AuthRequest<GoogleProfile>,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.loginWithGoogle(req.user);

    const params = new URLSearchParams({
      accessToken: tokens.accessToken.token,
      accessTokenExpiresAt: tokens.accessToken.expiresAt.toISOString(),
      refreshToken: tokens.refreshToken.token,
      refreshTokenExpiresAt: tokens.refreshToken.expiresAt.toISOString(),
    });

    const FRONTEND_URL = this.configService.get('FRONTEND_URL', {
      infer: true,
    });

    return res.redirect(`${FRONTEND_URL}/auth/callback?${params}`);
  }

  @SwaggerAuthResendVerificationEmailDoc()
  @Public()
  @Post('/resend-verification-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  resendVerificationEmail(@Body() resendEmailDto: ResendEmailDto) {
    return this.authService.resendVerificationEmail(resendEmailDto);
  }

  @SwaggerAuthVerifyEmailDoc()
  @Public()
  @Post('/verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
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
