import * as bcrypt from 'bcrypt';

import { SALT_ROUND } from '@common/constants/salt-round';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(SALT_ROUND);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
