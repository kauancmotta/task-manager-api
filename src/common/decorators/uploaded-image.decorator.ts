import {
  BadRequestException,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
} from '@nestjs/common';

export const UploadedImage = (keyNameFile: string) =>
  UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        new FileTypeValidator({
          fileType: /image\/(jpeg|png|webp)/,
          errorMessage: 'A imagem deve ser no formato: .jpeg, .png, .webp',
        }),
      ],
      fileIsRequired: true,
      exceptionFactory: (error) =>
        new BadRequestException(error.toString().replace('File', keyNameFile)),
    }),
  );
