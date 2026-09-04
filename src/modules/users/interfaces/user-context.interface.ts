import { UpdateUserDto } from '@modules/users/dto';

export interface UserContext {
  userId: string;
}

export type UserContextWithUpdateUserDto = UserContext & {
  updateUserDto: UpdateUserDto;
};

export type UserContextWithAvatar = UserContext & {
  avatarFile: Express.Multer.File;
};
