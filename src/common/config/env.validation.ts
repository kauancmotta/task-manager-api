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
} from 'class-validator';

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

const validateS3StorageProvider = (o: EnvironmentVariables) =>
  o.STORAGE_PROVIDER === StorageProvider.S3;

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
