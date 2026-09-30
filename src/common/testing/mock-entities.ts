import { uuidv7 } from 'uuidv7';

import { Category } from '@modules/categories/entities/categories.entity';
import { User } from '@modules/users/entities/user.entity';
import {
  AuthResponse,
  AuthResponseRefreshToken,
  JwtPayload,
} from '@modules/auth/interfaces';
import { EmailVerification } from '@modules/auth/entities/email-verification.entity';
import { EmailVerificationTypes } from '@modules/auth/enums';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';
import { TaskAssignee } from '@modules/tasks/entities/task-assignee.entity';
import { Task } from '@modules/tasks/entities/task.entity';
import { TaskStatus } from '@modules/tasks/enums/task-status.enum';
import { PaginatedResponse } from '@common/interfaces';
import { TaskAttachment } from '@modules/tasks/entities/task-attachment.entity';

export const createMockTokens = (
  overrides?: Partial<AuthResponse>,
): AuthResponse => ({
  accessToken: {
    token: 'mock-token',
    expiresAt: new Date(),
    tokenType: 'Bearer',
  },
  refreshToken: {
    token: 'mock-refresh-token',
    expiresAt: new Date(),
  },
  ...overrides,
});

export const createMockAuthRefreshToken = (
  overrides?: Partial<AuthResponseRefreshToken>,
): AuthResponseRefreshToken => ({
  token: 'mock-refresh-token',
  expiresAt: new Date(),
  ...overrides,
});

export const createMockJwtPayload = (
  overrides?: Partial<JwtPayload>,
): JwtPayload => ({
  email: 'mock@email.com',
  sub: 'mock-user-id',
  ...overrides,
});

export const createMockCategory = (overrides?: Partial<Category>): Category =>
  ({
    id: uuidv7(),
    name: 'Mock Name',
    description: 'Mock description',
    color: '#000000',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdByUserId: 'mock-user-id',
    ...overrides,
  }) as Category;

export const createMockUser = (overrides?: Partial<User>): User =>
  ({
    id: uuidv7(),
    name: 'Mock Name',
    email: 'mock@email.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    avatarUrl: null,
    isEmailVerified: true,
    ...overrides,
  }) as User;

export const createMockEmailVerification = (
  overrides?: Partial<EmailVerification>,
): Omit<EmailVerification, 'generateId'> =>
  ({
    id: uuidv7(),
    token: 'mock-email-token',
    type: EmailVerificationTypes.EMAIL_CONFIRMATION,
    userId: 'mock-user-id',
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as EmailVerification;

export const createMockRefreshToken = (
  overrides?: Partial<RefreshToken>,
): Omit<RefreshToken, 'generateId' | 'user'> => ({
  id: uuidv7(),
  refreshToken: 'mock-refresh-token',
  userId: 'mock-user-id',
  expiresAt: new Date(),
  createdAt: new Date(),
  ...overrides,
});

export const createMockFile = (
  overrides?: Partial<Express.Multer.File>,
): Express.Multer.File =>
  ({
    fieldname: 'avatarFile',
    originalname: 'avatar.png',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from(''),
    ...overrides,
  }) as Express.Multer.File;

export const createMockTask = (overrides?: Partial<Task>): Task =>
  ({
    id: uuidv7(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'mock name',
    description: 'mock description',
    status: TaskStatus.TODO,
    priority: 1,
    dueDate: null,
    createdByUserId: 'mock-user-id',
    overdue: false,
    ...overrides,
  }) as Task;

export const createMockTaskAssignee = (
  overrides?: Partial<TaskAssignee>,
): TaskAssignee =>
  ({
    id: uuidv7(),
    createdAt: new Date(),
    updatedAt: new Date(),
    taskId: 'mock-task-id',
    userId: 'mock-user-id',
    ...overrides,
  }) as TaskAssignee;

export const createMockTaskAttachment = (
  overrides?: Partial<TaskAttachment>,
): TaskAttachment =>
  ({
    id: uuidv7(),
    createdAt: new Date(),
    updatedAt: new Date(),
    fileUrl: 'mock-path-file.jpg',
    fileName: 'file.jpg',
    fileSize: 1024,
    mimeType: 'image/jpeg',
    taskId: 'mock-task-id',
    uploadedByUserId: 'mock-user-id',
    ...overrides,
  }) as TaskAttachment;

export const createMockPaginatedResponse = <T>(
  data: T[] = [],
  overrides?: Partial<PaginatedResponse<T>>,
): PaginatedResponse<T> => ({
  data,
  meta: {
    total: data.length,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  },
  ...overrides,
});
