import { Comment, User } from '@prisma/client';
import { UserCounts, userProfileSerializer } from './user';

export interface CommentWithRelations extends Comment {
  user: User & UserCounts;
  _count: { replies: number };
}

/** Mirrors Django's CommentSerializer. */
export function commentSerializer(comment: CommentWithRelations, viewerId?: number) {
  return {
    id: comment.id,
    user: userProfileSerializer(comment.user, viewerId),
    tweet: comment.tweetId,
    parent_comment: comment.parentCommentId,
    content: comment.content,
    created_at: comment.createdAt.toISOString(),
    replies_count: comment._count.replies,
  };
}
