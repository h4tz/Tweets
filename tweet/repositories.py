from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import Comment, Follow, Like, Tweet

User = get_user_model()


class TweetRepository:
    @staticmethod
    def list_tweets():
        return Tweet.objects.all().order_by("-created_at")

    @staticmethod
    def get_tweet_by_id(tweet_id):
        return get_object_or_404(Tweet, id=tweet_id)

    @staticmethod
    def list_feed_tweets(user):
        followed_ids = Follow.objects.filter(follower=user).values_list("followed_id", flat=True)
        return Tweet.objects.filter(user_id__in=followed_ids).order_by("-created_at")


class CommentRepository:
    @staticmethod
    def list_comments_by_tweet(tweet_id):
        return Comment.objects.filter(tweet_id=tweet_id).order_by("-created_at")

    @staticmethod
    def get_comment_by_id(comment_id):
        return get_object_or_404(Comment, id=comment_id)


class LikeRepository:
    @staticmethod
    def toggle_like(user, tweet):
        like, created = Like.objects.get_or_create(user=user, tweet=tweet)
        if created:
            return True
        like.delete()
        return False


class FollowRepository:
    @staticmethod
    def toggle_follow(follower, followed):
        follow, created = Follow.objects.get_or_create(follower=follower, followed=followed)
        if created:
            return True
        follow.delete()
        return False


class UserRepository:
    @staticmethod
    def get_user_by_username(username):
        return get_object_or_404(User, username=username)

    @staticmethod
    def get_user_by_id(user_id):
        return get_object_or_404(User, id=user_id)
