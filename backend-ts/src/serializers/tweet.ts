import { Tweet, User } from '@prisma/client';
import { UserCounts, userProfileSerializer } from './user';

export interface TweetWithRelations extends Tweet {
  user: User & UserCounts;
  _count: { likes: number; comments: number };
  likes: { id: number }[];
}

/** Mirrors Django's TweetSerializer. */
export function tweetSerializer(tweet: TweetWithRelations, viewerId?: number) {
  return {
    id: tweet.id,
    user: userProfileSerializer(tweet.user, viewerId),
    content: tweet.content,
    created_at: tweet.createdAt.toISOString(),
    updated_at: tweet.updatedAt.toISOString(),
    likes_count: tweet._count.likes,
    comments_count: tweet._count.comments,
    is_liked: viewerId ? tweet.likes.length > 0 : false,
  };
}
