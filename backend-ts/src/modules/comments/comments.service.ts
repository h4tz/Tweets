import { ApiError, ValidationError } from '../../errors';
import { decodeCursor } from '../../lib/pagination';
import { commentSerializer } from '../../serializers/comment';
import { CommentRepository } from './comments.repository';

export const CommentService = {
  async list(tweetId: number, query: { cursor?: string }, viewerId?: number) {
    const cursor = decodeCursor(query.cursor);
    const page = await CommentRepository.listComments(tweetId, cursor);
    return {
      next: page.next,
      previous: page.previous,
      results: page.results.map((c) => commentSerializer(c, viewerId)),
    };
  },

  /**
   * Mirrors Django's CommentListCreateAPIView.perform_create: the tweet must
   * exist, and a parent comment (when given) must belong to the same tweet.
   */
  async create(
    tweetId: number,
    userId: number,
    content: string,
    parentCommentId?: number | null,
    viewerId?: number,
  ) {
    const tweet = await CommentRepository.getTweet(tweetId);
    if (!tweet) throw new ApiError(404, { detail: 'Not found.' });

    let parentComment = null;
    if (parentCommentId != null) {
      parentComment = await CommentRepository.getComment(parentCommentId);
      if (!parentComment) throw new ApiError(404, { detail: 'Not found.' });
      if (parentComment.tweetId !== tweet.id) {
        throw new ValidationError({
          parent_comment: ['Parent comment must belong to the same tweet.'],
        });
      }
    }

    const created = await CommentRepository.createComment({
      userId,
      tweetId,
      parentCommentId: parentComment?.id ?? null,
      content,
    });

    const comment = await CommentRepository.getCommentWithRelations(created.id);
    return commentSerializer(comment!, viewerId);
  },
};
