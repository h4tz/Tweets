from django.db import IntegrityError

from .repositories import (
    CommentRepository,
    FollowRepository,
    LikeRepository,
    TweetRepository,
    UserRepository,
)


class FollowYourselfError(Exception):
    pass


class AuthService:
    @staticmethod
    def get_user_for_login(username):
        return UserRepository.get_user_by_username(username)


class TweetService:
    @staticmethod
    def list_tweets():
        return TweetRepository.list_tweets()

    @staticmethod
    def get_tweet(tweet_id):
        return TweetRepository.get_tweet_by_id(tweet_id)

    @staticmethod
    def list_feed_tweets(user):
        return TweetRepository.list_feed_tweets(user=user)


class LikeService:
    @staticmethod
    def toggle_like(user, tweet_id):
        tweet = TweetRepository.get_tweet_by_id(tweet_id)
        return LikeRepository.toggle_like(user=user, tweet=tweet)


class CommentService:
    @staticmethod
    def list_comments_by_tweet(tweet_id):
        return CommentRepository.list_comments_by_tweet(tweet_id=tweet_id)

    @staticmethod
    def get_tweet_for_comment(tweet_id):
        return TweetRepository.get_tweet_by_id(tweet_id=tweet_id)

    @staticmethod
    def get_comment(comment_id):
        return CommentRepository.get_comment_by_id(comment_id=comment_id)


class FollowService:
    @staticmethod
    def toggle_follow(follower, user_id):
        followed_user = UserRepository.get_user_by_id(user_id=user_id)
        if follower == followed_user:
            raise FollowYourselfError("Cannot follow yourself.")

        try:
            return FollowRepository.toggle_follow(follower=follower, followed=followed_user)
        except IntegrityError:
            return None
