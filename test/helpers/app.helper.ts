import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { MailService } from '../../src/common/mail/services/mail.service';
import { runMigrations } from './db.helper';

// ---------------------------------------------------------------------------
// Mail / token capture store
// ---------------------------------------------------------------------------

interface CapturedMail {
  to: string;
  token: string;
  type: 'EMAIL_CONFIRMATION' | 'PASSWORD_RESET';
  sentAt: Date;
}

const capturedMails: CapturedMail[] = [];

function detectType(token: string): 'EMAIL_CONFIRMATION' | 'PASSWORD_RESET' {
  return /^\d{6}$/.test(token) ? 'PASSWORD_RESET' : 'EMAIL_CONFIRMATION';
}

export function getLastSentMailToken(
  email: string,
  type: 'EMAIL_CONFIRMATION' | 'PASSWORD_RESET',
): string {
  for (let i = capturedMails.length - 1; i >= 0; i--) {
    const m = capturedMails[i];
    if (m.to === email && m.type === type) return m.token;
  }
  return '';
}

export function clearCapturedMails(): void {
  capturedMails.length = 0;
}

// ---------------------------------------------------------------------------
// App lifecycle helpers
// ---------------------------------------------------------------------------

let app: INestApplication;
let dataSource: DataSource;

export async function setupApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication({ logger: false });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  dataSource = app.get(DataSource);
  await runMigrations(dataSource);

  installMailSpy(moduleFixture);

  return app;
}

// ---------------------------------------------------------------------------
// Mail-spy installation
// ---------------------------------------------------------------------------

function installMailSpy(moduleFixture: TestingModule): void {
  // Use the class itself as the DI token — the correct NestJS way.
  // strict: false searches across all imported modules.
  const mailService = moduleFixture.get(MailService, { strict: false });

  const original = mailService.sendMail.bind(mailService) as (
    ...args: unknown[]
  ) => Promise<void>;

  // MailService.sendMail({ to, subject, template: { nameFileTemplate, variables } })
  // The plaintext token lives in template.variables.
  mailService.sendMail = async function (...args: unknown[]) {
    const ctx = args[0] as {
      to?: string;
      template?: { variables?: Record<string, unknown> };
    };

    const to = (ctx?.to ?? '').trim();
    const token = extractToken(ctx?.template?.variables ?? {});

    if (to && token) {
      capturedMails.push({
        to,
        token,
        type: detectType(token),
        sentAt: new Date(),
      });
    }

    try {
      await original(...args);
    } catch {
      // No SMTP in CI — swallow silently
    }
  };
}

function extractToken(variables: Record<string, unknown>): string {
  if (typeof variables['token'] === 'string' && variables['token'])
    return variables['token'];
  if (typeof variables['otp'] === 'string' && variables['otp'])
    return variables['otp'];
  if (typeof variables['code'] === 'string' && variables['code'])
    return variables['code'];
  return '';
}

export async function teardownApp(): Promise<void> {
  await app?.close();
}

export function getDataSource(): DataSource {
  return dataSource;
}

/**
 * Type-safe body extractor for supertest responses.
 * Breaks the `any` chain so @typescript-eslint/no-unsafe-* rules are satisfied.
 */
export function parseBody<T>(body: unknown): T {
  return body as T;
}
