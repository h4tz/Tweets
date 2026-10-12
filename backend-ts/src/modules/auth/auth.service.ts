import { User } from '@prisma/client';
import { ApiError, ValidationError } from '../../errors';
import { generateTokens } from '../../lib/jwt';
import { checkPassword, hashPassword } from '../../lib/password';
import { UserRepository } from '../users/users.repository';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export const AuthService = {
  /**
   * Mirrors Django's RegisterView + UserSerializer.create:
   * password is write-only, min length 8, user created via create_user.
   */
  async register(input: RegisterInput): Promise<User> {
    const existing = await UserRepository.usernameOrEmailExists(input.username, input.email);
    if (existing) {
      const errors: Record<string, string[]> = {};
      if (existing.username === input.username) errors.username = ['user with this username already exists.'];
      if (existing.email === input.email) errors.email = ['user with this email already exists.'];
      throw new ValidationError(errors);
    }

    const hashed = await hashPassword(input.password);
    return UserRepository.create({
      username: input.username,
      email: input.email,
      password: hashed,
    });
  },

  /**
   * Mirrors Django's LoginView: 404 when the user is missing, 400 on a bad
   * password, and simplejwt-style { refresh, access } on success.
   */
  async login(username: string, password: string) {
    const user = await UserRepository.findByUsername(username);
    if (!user) throw new ApiError(404, { detail: 'User not found.' });

    const valid = await checkPassword(password, user.password);
    if (!valid) throw new ApiError(400, { detail: 'Invalid Credentials' });

    return generateTokens(user.id);
  },

  /** Mirrors simplejwt token refresh: issue fresh tokens for a valid refresh token. */
  refresh(userId: number) {
    return generateTokens(userId);
  },
};
