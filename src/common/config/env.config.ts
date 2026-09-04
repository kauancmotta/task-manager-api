import { StringValue } from 'ms';

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL: string;
  DATABASE_URL: string;
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: StringValue;
  JWT_REFRESH_EXPIRES_IN: StringValue;
  STORAGE_PROVIDER: 'local' | 's3' | 'gcs';
  AWS_S3_BUCKET: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  GOOGLE_OAUTH_ENABLED: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
}
