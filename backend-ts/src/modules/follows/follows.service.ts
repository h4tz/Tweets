import { prisma } from '../../db';
import { ApiError } from '../../errors';

/** Raised when a user tries to follow themselves (Django's FollowYourselfError). */
export class FollowYourselfError extends Error {}

export const FollowRepository = {
  /** get_or_create then delete-if-exists — mirrors Django's toggle_follow. */
  async toggle(followerId: number, followedId: number): Promise<boolean | null> {
    const existing = await prisma.follow.findUnique({
      where: { followerId_followedId: { followerId, followedId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return false; // unfollowed
    }

    try {
      await prisma.follow.create({ data: { followerId, followedId } });
    } catch {
      // unique constraint race — Django returns None -> 409
      return null;
    }
    return true; // followed
  },
};

export const FollowService = {
  async toggleFollow(followerId: number, followedId: number): Promise<boolean | null> {
    const followedUser = await prisma.user.findUnique({ where: { id: followedId } });
    if (!followedUser) throw new ApiError(404, { detail: 'Not found.' });

    if (followerId === followedId) throw new FollowYourselfError('Cannot follow yourself.');

    return FollowRepository.toggle(followerId, followedId);
  },
};
