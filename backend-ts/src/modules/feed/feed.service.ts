import { decodeCursor } from '../../lib/pagination';
import { tweetSerializer } from '../../serializers/tweet';
import { FeedRepository } from './feed.repository';

export const FeedService = {
  async listFeed(userId: number, query: { cursor?: string }) {
    const cursor = decodeCursor(query.cursor);
    const page = await FeedRepository.listFeed(userId, cursor, userId);
    return {
      next: page.next,
      previous: page.previous,
      results: page.results.map((t) => tweetSerializer(t, userId)),
    };
  },
};
