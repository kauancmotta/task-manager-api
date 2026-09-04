import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GoogleStrategy } from '@modules/auth/strategies/google.strategy';

@Module({
  imports: [ConfigModule],
  providers: [GoogleStrategy],
})
export class GoogleAuthModule {}
