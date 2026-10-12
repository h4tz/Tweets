import { prisma } from '../../db';
import { Cursor, Page, paginate } from '../../lib/pagination';
import { tweetInclude } from '../tweets/tweets.repository';
import { TweetWithRelations } from '../../serializers/tweet';

export const FeedRepository = {
  /**
   * Mirrors Django's TweetRepository.list_feed_tweets: tweets authored by
   * anyone the given user follows, newest first.
   */
  async listFeed(
    userId: number,
    cursor: Cursor | null,
    viewerId?: number,
  ): Promise<Page<TweetWithRelations>> {
    const followed = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followedId: true },
    });
    const followedIds = followed.map((f) => f.followedId);

    return paginate<TweetWithRelations, Record<string, unknown>>({
      cursor,
      baseUrl: '/api/feed/',
      baseWhere: { userId: { in: followedIds } },
      whereOlder: (c) => ({
        OR: [
          { createdAt: { lt: new Date(c.t) } },
          { createdAt: new Date(c.t), id: { lt: c.id } },
        ],
      }),
      whereNewer: (c) => ({
        OR: [
          { createdAt: { gt: new Date(c.t) } },
          { createdAt: new Date(c.t), id: { gt: c.id } },
        ],
      }),
      findMany: (args) =>
        prisma.tweet.findMany({
          ...args,
          include: tweetInclude(viewerId),
        }) as unknown as Promise<TweetWithRelations[]>,
    });
  },
};
