import bcrypt from 'bcryptjs';

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function checkPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}
