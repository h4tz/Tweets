import { ApiError, permissionDenied } from '../../errors';
import { decodeCursor } from '../../lib/pagination';
import { tweetSerializer } from '../../serializers/tweet';
import { TweetRepository } from './tweets.repository';

export const TweetService = {
  async list(query: { cursor?: string }, viewerId?: number) {
    const cursor = decodeCursor(query.cursor);
    const page = await TweetRepository.listTweets(cursor, viewerId);
    return {
      next: page.next,
      previous: page.previous,
      results: page.results.map((t) => tweetSerializer(t, viewerId)),
    };
  },

  async get(id: number, viewerId?: number) {
    const tweet = await TweetRepository.getTweet(id, viewerId);
    if (!tweet) throw new ApiError(404, { detail: 'Not found.' });
    return tweetSerializer(tweet, viewerId);
  },

  async create(userId: number, content: string, viewerId?: number) {
    const created = await TweetRepository.createTweet(userId, content);
    const tweet = await TweetRepository.getTweet(created.id, viewerId);
    return tweetSerializer(tweet!, viewerId);
  },

  /** IsOwnerOrReadOnly: only the author may update. */
  async update(id: number, content: string, viewerId: number) {
    const tweet = await TweetRepository.getTweet(id, viewerId);
    if (!tweet) throw new ApiError(404, { detail: 'Not found.' });
    if (tweet.userId !== viewerId) throw permissionDenied();

    await TweetRepository.updateTweet(id, content);
    const updated = await TweetRepository.getTweet(id, viewerId);
    return tweetSerializer(updated!, viewerId);
  },

  /** IsOwnerOrReadOnly: only the author may delete. */
  async destroy(id: number, viewerId: number) {
    const tweet = await TweetRepository.getTweet(id, viewerId);
    if (!tweet) throw new ApiError(404, { detail: 'Not found.' });
    if (tweet.userId !== viewerId) throw permissionDenied();

    await TweetRepository.deleteTweet(id);
  },
};
