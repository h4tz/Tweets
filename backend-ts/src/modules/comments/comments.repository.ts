import { prisma } from '../../db';
import { Cursor, Page, paginate } from '../../lib/pagination';
import { CommentWithRelations } from '../../serializers/comment';

function commentInclude() {
  return {
    user: { include: { _count: { select: { followers: true, following: true, tweets: true } } } },
    _count: { select: { replies: true } },
  };
}

export const CommentRepository = {
  listComments(
    tweetId: number,
    cursor: Cursor | null,
  ): Promise<Page<CommentWithRelations>> {
    return paginate<CommentWithRelations, Record<string, unknown>>({
      cursor,
      baseUrl: `/api/tweets/${tweetId}/comments/`,
      baseWhere: { tweetId },
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
        prisma.comment.findMany({
          ...args,
          include: commentInclude(),
        }) as unknown as Promise<CommentWithRelations[]>,
    });
  },

  getTweet(tweetId: number) {
    return prisma.tweet.findUnique({ where: { id: tweetId } });
  },

  getComment(commentId: number) {
    return prisma.comment.findUnique({ where: { id: commentId } });
  },

  createComment(data: { userId: number; tweetId: number; parentCommentId: number | null; content: string }) {
    return prisma.comment.create({ data });
  },

  getCommentWithRelations(id: number) {
    return prisma.comment.findUnique({
      where: { id },
      include: commentInclude(),
    }) as unknown as Promise<CommentWithRelations | null>;
  },
};
