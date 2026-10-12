import { User } from '@prisma/client';

export interface UserCounts {
  _count?: { followers: number; following: number; tweets: number };
}

/** Mirrors Django's UserSerializer (register response). */
export function userSerializer(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

/** Mirrors Django's UserProfileSerializer. */
export function userProfileSerializer(
  user: User & UserCounts,
  viewerId?: number,
  viewerIsFollowing = false,
) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    followers_count: user._count?.followers ?? 0,
    following_count: user._count?.following ?? 0,
    tweets_count: user._count?.tweets ?? 0,
    is_following: viewerId ? viewerIsFollowing : false,
  };
}
