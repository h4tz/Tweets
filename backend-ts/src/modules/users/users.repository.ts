import { Prisma } from '@prisma/client';
import { prisma } from '../../db';

export const UserRepository = {
  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { followers: true, following: true, tweets: true } } },
    });
  },

  usernameOrEmailExists(username: string, email: string) {
    return prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  },
};
