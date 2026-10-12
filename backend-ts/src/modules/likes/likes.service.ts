import { prisma } from '../../db';
import { ApiError } from '../../errors';

export const LikeRepository = {
  /** get_or_create then delete-if-exists — mirrors Django's toggle_like. */
  async toggle(userId: number, tweetId: number): Promise<boolean> {
    const existing = await prisma.like.findUnique({
      where: { userId_tweetId: { userId, tweetId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return false; // unliked
    }

    await prisma.like.create({ data: { userId, tweetId } });
    return true; // liked
  },
};

export const LikeService = {
  async toggleLike(userId: number, tweetId: number): Promise<boolean> {
    const tweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
    if (!tweet) throw new ApiError(404, { detail: 'Not found.' });

    return LikeRepository.toggle(userId, tweetId);
  },
};
