import { prisma } from '../../db';
import { ApiError } from '../../errors';
import { UserRepository } from './users.repository';

export const UserService = {
  /**
   * Mirrors Django's UserProfileSerializer output: profile fields plus
   * follower/following/tweet counts and whether the viewer follows them.
   */
  async getProfile(userId: number, viewerId?: number) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new ApiError(404, { detail: 'Not found.' });

    let isFollowing = false;
    if (viewerId) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followedId: { followerId: viewerId, followedId: userId } },
      });
      isFollowing = follow !== null;
    }

    return { user, isFollowing };
  },
};
