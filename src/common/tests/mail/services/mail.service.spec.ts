import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

import { MailService } from '@common/mail/services/mail.service';
import { createMockConfigService } from '@common/testing/mock-services';
import { MailTemplates } from '@common/mail/enums/mail-templates.enum';
import { createMockLogger } from '@common/testing/mock-logger';

const { mockSendMail, createTransport } = vi.hoisted(() => ({
  mockSendMail: vi.fn(),
  createTransport: vi.fn().mockReturnValue({ sendMail: vi.fn() }),
}));

vi.mock('nodemailer', () => ({
  default: { createTransport },
  createTransport,
}));

const { readFile } = vi.hoisted(() => ({
  readFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile,
}));

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    createTransport.mockReturnValue({ sendMail: mockSendMail });

    const moduleRef = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: Logger,
          useValue: createMockLogger(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = moduleRef.get(MailService);
  });

  describe('sendMail', () => {
    it('should compile template and send email successfully', async () => {
      const mockTemplate = '<h1>Hello {{name}}</h1>';
      readFile.mockResolvedValue(mockTemplate);
      mockSendMail.mockResolvedValue({});

      await service.sendMail({
        to: 'mock@email.com',
        subject: 'Mock Subject',
        template: {
          nameFileTemplate: MailTemplates.EMAIL_CONFIRMATION,
          variables: { name: 'Mock Name' },
        },
      });

      expect(readFile).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'mock@email.com',
          subject: 'Mock Subject',
        }),
      );
    });

    it('should throw when template file does not exist', async () => {
      readFile.mockRejectedValue(
        new Error('ENOENT: no such file or directory'),
      );

      await expect(
        service.sendMail({
          to: 'mock@email.com',
          subject: 'Mock Subject',
          template: {
            nameFileTemplate: 'non-existent-template' as MailTemplates,
            variables: {},
          },
        }),
      ).rejects.toThrow('ENOENT: no such file or directory');

      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should throw when transporter fails to send email', async () => {
      const mockTemplate = '<h1>Hello</h1>';
      readFile.mockResolvedValue(mockTemplate);
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendMail({
          to: 'mock@email.com',
          subject: 'Mock Subject',
          template: {
            nameFileTemplate: MailTemplates.EMAIL_CONFIRMATION,
            variables: {},
          },
        }),
      ).rejects.toThrow('SMTP error');
    });

    it('should correctly compile handlebars template with variables', async () => {
      const mockTemplate = '<h1>Hello {{name}}</h1>';
      readFile.mockResolvedValue(mockTemplate);
      mockSendMail.mockResolvedValue({});

      await service.sendMail({
        to: 'mock@email.com',
        subject: 'Mock Subject',
        template: {
          nameFileTemplate: MailTemplates.EMAIL_CONFIRMATION,
          variables: { name: 'Kauan' },
        },
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<h1>Hello Kauan</h1>',
        }),
      );
    });
  });
});
