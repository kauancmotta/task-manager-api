import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from '@common/filters/typeorm-exception.filter';
import { AllExceptionsFilter } from '@common/filters/http-exception.filter';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AppValidationPipe } from '@common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix('api');
  app.useLogger(app.get(Logger));
  app.useGlobalGuards(new JwtAuthGuard(new Reflector()));
  app.enableCors();
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(), new TypeOrmExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => console.error(error));
