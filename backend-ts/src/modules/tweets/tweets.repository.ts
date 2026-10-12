import { prisma } from '../../db';
import { Cursor, Page, paginate } from '../../lib/pagination';
import { TweetWithRelations } from '../../serializers/tweet';

/**
 * Shared Prisma include so tweets serialize with author + counts + viewer
 * like state, matching Django's TweetSerializer nesting.
 */
export function tweetInclude(viewerId?: number) {
  return {
    user: { include: { _count: { select: { followers: true, following: true, tweets: true } } } },
    _count: { select: { likes: true, comments: true } },
    likes: { where: { userId: viewerId ?? -1 }, select: { id: true } },
  };
}

export const TweetRepository = {
  listTweets(cursor: Cursor | null, viewerId?: number): Promise<Page<TweetWithRelations>> {
    return paginate<TweetWithRelations, Record<string, unknown>>({
      cursor,
      baseUrl: '/api/tweets/',
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
        prisma.tweet.findMany({ ...args, include: tweetInclude(viewerId) }) as unknown as Promise<
          TweetWithRelations[]
        >,
    });
  },

  getTweet(id: number, viewerId?: number) {
    return prisma.tweet.findUnique({
      where: { id },
      include: tweetInclude(viewerId),
    }) as unknown as Promise<TweetWithRelations | null>;
  },

  createTweet(userId: number, content: string) {
    return prisma.tweet.create({ data: { userId, content } });
  },

  updateTweet(id: number, content: string) {
    return prisma.tweet.update({ where: { id }, data: { content } });
  },

  deleteTweet(id: number) {
    return prisma.tweet.delete({ where: { id } });
  },
};
