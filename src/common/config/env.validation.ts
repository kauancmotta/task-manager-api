import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
  ValidateIf,
  IsNotEmpty,
  IsUrl,
  IsOptional,
} from 'class-validator';
import type { StringValue } from 'ms';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

enum StorageProvider {
  Local = 'local',
  S3 = 's3',
}

enum OAuthProvider {
  Enabled = 'true',
  Disabled = 'false',
}

const validateS3StorageProvider = (o: EnvironmentVariables) =>
  o.STORAGE_PROVIDER === StorageProvider.S3;

const validateGoogleOAuth = (o: EnvironmentVariables) =>
  o.GOOGLE_OAUTH_ENABLED === OAuthProvider.Enabled;

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsString()
  @IsUrl({ require_tld: false }) // ← require_tld: false allowed localhost
  APP_URL!: string;

  @IsString()
  DATABASE_URL!: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;
  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN!: StringValue;
  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN!: StringValue;

  @IsEnum(StorageProvider)
  STORAGE_PROVIDER!: StorageProvider;

  @ValidateIf(validateS3StorageProvider)
  @IsString()
  @IsNotEmpty()
  AWS_S3_BUCKET?: string;

  @ValidateIf(validateS3StorageProvider)
  @IsString()
  @IsNotEmpty()
  AWS_REGION?: string;

  @ValidateIf(validateS3StorageProvider)
  @IsString()
  @IsNotEmpty()
  AWS_ACCESS_KEY_ID?: string;

  @ValidateIf(validateS3StorageProvider)
  @IsString()
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsEnum(OAuthProvider)
  @IsOptional()
  GOOGLE_OAUTH_ENABLED?: OAuthProvider;

  @ValidateIf(validateGoogleOAuth)
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID?: string;

  @ValidateIf(validateGoogleOAuth)
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET?: string;

  @ValidateIf(validateGoogleOAuth)
  @IsString()
  @IsNotEmpty()
  GOOGLE_CALLBACK_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
