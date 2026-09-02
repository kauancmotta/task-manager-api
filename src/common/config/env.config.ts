export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL: string;
  DATABASE_URL: string;
  PORT: number;
  STORAGE_PROVIDER: 'local' | 's3' | 'gcs';
  AWS_S3_BUCKET: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
}
