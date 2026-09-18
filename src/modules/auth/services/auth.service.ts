import { DataSource, EntityManager, Repository } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Logger } from 'nestjs-pino';

import {
  hashPassword,
  comparePassword,
  calculateExpiresAt,
  generateToken,
  generateOTP,
} from '@common/utils';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '@modules/auth/dto';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { User } from '@modules/users/entities/user.entity';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@common/config/env.config';
import { TOKEN_TYPE } from '@common/constants/auth.constants';
import { GoogleProfile } from '@modules/auth/interfaces';
import { EmailVerificationsService } from '@modules/auth/services/email-verifications.service';
import { EmailVerificationTypes } from '@modules/auth/enums';
import { MailService } from '@common/mail/services/mail.service';
import {
  buildEmailConfirmationMail,
  buildEmailVerifiedMail,
  buildPasswordChangedMail,
  buildPasswordResetMail,
} from '@common/mail/factories';
import { AppException } from '@common/exceptions/app.exception';
import { ErrorCodes } from '@common/enums/error-codes.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly emailVerificationsService: EmailVerificationsService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    await this.validateExistEmail(email);

    const hash = await hashPassword(password);

    const [tokens, emailToken] = await this.dataSource.transaction(
      async (manager) => {
        const user = this.userRepository.create({
          email,
          name,
          password: hash,
        });
        await manager.save(User, user);

        const tokens = await this.generateAuthTokens(
          user.id,
          user.email,
          manager,
        );

        this.logger.log(`User ID: ${user.id} registered successfully`);

        const emailToken = await this.emailVerificationsService.create({
          userId: user.id,
          type: EmailVerificationTypes.EMAIL_CONFIRMATION,
          token: generateToken(),
          manager,
        });

        return [tokens, emailToken];
      },
    );

    await this.mailService.sendMail(
      buildEmailConfirmationMail({
        to: email,
        variables: {
          appUrl: this.configService.get('APP_URL', { infer: true }),
          expiresIn: this.configService.get('MAIL_EXPIRES_IN', {
            infer: true,
          }),
          token: emailToken,
        },
      }),
    );

    return tokens;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    const isValid = await comparePassword(password, user?.password ?? '');

    if (!user || !isValid) {
      throw new AppException(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isEmailVerified) {
      throw new AppException(
        ErrorCodes.AUTH_EMAIL_NOT_VERIFIED,
        'Email not verified',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.generateAuthTokens(user.id, user.email);
  }

  async loginWithGoogle(googleProfile: GoogleProfile) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: googleProfile.email })
      .orWhere('user.googleId = :googleId', {
        googleId: googleProfile.googleId,
      })
      .getOne();

    if (!user) {
      return await this.registerWithGoogle(googleProfile);
    }

    if (!user.googleId) {
      await this.userRepository.update(user.id, {
        googleId: googleProfile.googleId,
        avatarUrl: googleProfile.avatarUrl,
        isEmailVerified: true,
      });

      this.logger.log(`User ID: ${user.id} Google account linked successfully`);
    }

    return this.generateAuthTokens(user.id, user.email);
  }

  async verifyEmail(token: string) {
    const type = EmailVerificationTypes.EMAIL_CONFIRMATION;

    const emailVerification = await this.emailVerificationsService.validate({
      token,
      type,
    });

    await this.dataSource.transaction(async (manager) => {
      const result = await manager.update(
        User,
        { id: emailVerification.userId },
        { isEmailVerified: true },
      );

      if (!result.affected) {
        throw new AppException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.emailVerificationsService.revoke({
        userId: emailVerification.userId,
        token,
        type,
        manager,
      });

      this.logger.log(
        `User ID: ${emailVerification.userId} email verified successfully`,
      );
    });

    await this.mailService.sendMail(
      buildEmailVerifiedMail({
        to: emailVerification.user.email,
        variables: {
          appUrl: this.configService.get('APP_URL', { infer: true }),
        },
      }),
    );
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.findUserByEmail(forgotPasswordDto.email);

    if (!user) return;

    if (!user.isEmailVerified) {
      throw new AppException(
        ErrorCodes.AUTH_EMAIL_NOT_VERIFIED,
        'Email not verified',
        HttpStatus.FORBIDDEN,
      );
    }

    const token = await this.emailVerificationsService.create({
      userId: user.id,
      token: generateOTP(),
      type: EmailVerificationTypes.PASSWORD_RESET,
    });

    await this.mailService.sendMail(
      buildPasswordResetMail({
        to: forgotPasswordDto.email,
        variables: {
          otp: token,
          expiresIn: this.configService.get('MAIL_EXPIRES_IN', {
            infer: true,
          }),
        },
      }),
    );
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const type = EmailVerificationTypes.PASSWORD_RESET;
    const token = resetPasswordDto.otp;

    const emailVerification = await this.emailVerificationsService.validate({
      token,
      type,
    });

    const hashedPassword = await hashPassword(resetPasswordDto.newPassword);

    await this.dataSource.transaction(async (manager) => {
      const result = await manager.update(
        User,
        { id: emailVerification.userId },
        { password: hashedPassword },
      );

      if (!result.affected) {
        throw new AppException(
          ErrorCodes.USER_NOT_FOUND,
          'User not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.emailVerificationsService.revoke({
        userId: emailVerification.userId,
        token,
        type,
        manager,
      });

      this.logger.log(
        `User ID: ${emailVerification.userId} password reset successfully`,
      );
    });

    await this.mailService.sendMail(
      buildPasswordChangedMail({
        to: emailVerification.user.email,
        variables: {
          appUrl: this.configService.get('APP_URL', { infer: true }),
        },
      }),
    );
  }

  private async registerWithGoogle(googleProfile: GoogleProfile) {
    return await this.dataSource.transaction(async (manager) => {
      const user = this.userRepository.create({
        email: googleProfile.email,
        name: googleProfile.name,
        googleId: googleProfile.googleId,
        avatarUrl: googleProfile.avatarUrl,
        isEmailVerified: true,
      });
      await manager.save(User, user);

      const tokens = await this.generateAuthTokens(
        user.id,
        user.email,
        manager,
      );

      this.logger.log(`User ID: ${user.id} registered successfully`);

      return tokens;
    });
  }

  private async validateExistEmail(email: string) {
    const exists = await this.userRepository.exists({ where: { email } });

    if (exists) {
      throw new AppException(
        ErrorCodes.AUTH_EMAIL_ALREADY_EXISTS,
        'Email already exists',
        HttpStatus.CONFLICT,
      );
    }
  }

  private async findUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: { id: true, isEmailVerified: true },
    });
  }

  private async generateAuthTokens(
    userId: string,
    email: string,
    manager?: EntityManager,
  ) {
    const accessToken = this.generateAccessToken({ sub: userId, email });
    const refreshToken = await this.refreshTokensService.create(
      userId,
      manager,
    );
    return { accessToken, refreshToken };
  }

  private generateAccessToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    const expiresAt = calculateExpiresAt(
      this.configService.get('JWT_EXPIRES_IN', { infer: true }),
    );

    return { token, expiresAt, tokenType: TOKEN_TYPE };
  }
}
