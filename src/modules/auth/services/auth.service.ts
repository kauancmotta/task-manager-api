import { DataSource, Repository } from 'typeorm';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Logger } from 'nestjs-pino';

import {
  hashPassword,
  comparePassword,
  calculateExpiresAt,
} from '@common/utils';
import { LoginDto, RegisterDto } from '@modules/auth/dto';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { User } from '@modules/users/entities/user.entity';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@common/config/env.config';
import { TOKEN_TYPE } from '@common/constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    await this.validateExistEmail(email);

    const hash = await hashPassword(password);

    return await this.dataSource.transaction(async (manager) => {
      const user = this.userRepository.create({
        email,
        name,
        password: hash,
      });
      await manager.save(User, user);

      const accessToken = this.generateAccessToken({
        sub: user.id,
        email,
      });

      const refreshToken = await this.refreshTokensService.create(
        user.id,
        manager,
      );

      this.logger.log(`User ID: ${user.id} registered successfully`);

      return { accessToken, refreshToken };
    });
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
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken({
      sub: user.id,
      email,
    });

    const refreshToken = await this.refreshTokensService.create(user.id);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    const expiresAt = calculateExpiresAt(
      this.configService.get('JWT_EXPIRES_IN', { infer: true }),
    );

    return { token, expiresAt, tokenType: TOKEN_TYPE };
  }

  private async validateExistEmail(email: string) {
    const exists = await this.userRepository.exists({ where: { email } });

    if (exists) {
      throw new ConflictException(`Email "${email}" already exists`);
    }
  }
}
