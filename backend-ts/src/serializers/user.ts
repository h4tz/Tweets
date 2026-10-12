import { Follow, User } from '@prisma/client';

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

/** True when viewerId follows targetId. */
export async function isFollowing(viewerId: number | undefined, targetId: number): Promise<boolean> {
  if (!viewerId) return false;
  const follow: Follow | null = await import('../db').then(({ prisma }) =>
    prisma.follow.findUnique({
      where: { followerId_followedId: { followerId: viewerId, followedId: targetId } },
    }),
  );
  return follow !== null;
}
