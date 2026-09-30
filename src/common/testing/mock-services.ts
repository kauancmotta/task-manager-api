import { Mock } from 'vitest';

import { CategoriesService } from '@modules/categories/services/categories.service';
import { UsersService } from '@modules/users/services/users.service';
import { StorageService } from '@common/storage/storage.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { RefreshTokensService } from '@modules/auth/services/refresh-tokens.service';
import { EnvConfig } from '@common/config/env.config';
import { MailService } from '@common/mail/services/mail.service';
import { EmailVerificationsService } from '@modules/auth/services/email-verifications.service';
import { JwtService } from '@nestjs/jwt';
import { TaskAssigneesService } from '@modules/tasks/services/task-assignees.service';
import { TasksService } from '@modules/tasks/services/tasks.service';
import { TaskAttachmentsService } from '@modules/tasks/services/task-attachments.service';

export const createMockConfigService = () => ({
  get: vi.fn().mockImplementation((key: keyof EnvConfig) => {
    const config: Partial<EnvConfig> = {
      JWT_SECRET: 'mock-secret',
      JWT_EXPIRES_IN: '30m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      APP_URL: 'http://localhost:3001/api',
      FRONTEND_URL: 'http://localhost:8080',
      MAIL_EXPIRES_IN: '7m',
      MAIL_HOST: 'localhost',
      MAIL_PORT: 1025,
      MAIL_FROM: 'noreply@taskmanager.com',
      NODE_ENV: 'test',
      STORAGE_PROVIDER: 'local',
    };
    return config[key];
  }),
});

export const createMockAuthService = (): Partial<
  Record<keyof AuthService, Mock>
> => ({
  register: vi.fn(),
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  resendVerificationEmail: vi.fn(),
  verifyEmail: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
});

export const createMockRefreshTokensService = (): Partial<
  Record<keyof RefreshTokensService, Mock>
> => ({
  create: vi.fn(),
  validate: vi.fn(),
  rotate: vi.fn(),
  revoke: vi.fn(),
  revokeAll: vi.fn(),
  cleanExpired: vi.fn(),
});

export const createMockEmailVerificationsService = (): Partial<
  Record<keyof EmailVerificationsService, Mock>
> => ({
  create: vi.fn(),
  validate: vi.fn(),
  revoke: vi.fn(),
  revokeAll: vi.fn(),
  cleanExpired: vi.fn(),
});

export const createMockMailService = (): Partial<
  Record<keyof MailService, Mock>
> => ({
  sendMail: vi.fn(),
});

export const createMockCategoriesService = (): Partial<
  Record<keyof CategoriesService, Mock>
> => ({
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
});

export const createMockUsersService = (): Partial<
  Record<keyof UsersService, Mock>
> => ({
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  updateAvatar: vi.fn(),
  removeAvatar: vi.fn(),
  changePassword: vi.fn(),
});

export const createMockStorageService = (): Partial<
  Record<keyof StorageService, Mock>
> => ({
  upload: vi.fn(),
  delete: vi.fn(),
});

export const createMockJwtService = (): Partial<
  Record<keyof JwtService, Mock>
> => ({
  sign: vi.fn().mockReturnValue('mock-token'),
  verify: vi.fn(),
  decode: vi.fn(),
});

export const createMockTasksService = (): Partial<
  Record<keyof TasksService, Mock>
> => ({
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateCategories: vi.fn(),
  updateStatus: vi.fn(),
  remove: vi.fn(),
  removeTaskCategory: vi.fn(),
});

export const createMockTaskAssigneeService = (): Partial<
  Record<keyof TaskAssigneesService, Mock>
> => ({
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
});

export const createMockTaskAttachmentService = (): Partial<
  Record<keyof TaskAttachmentsService, Mock>
> => ({
  findAll: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
});
