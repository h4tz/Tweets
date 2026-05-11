from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Comment, Follow, Like, Tweet

User = get_user_model()


class TwitterFlowAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="alice", password="password123")
        self.user2 = User.objects.create_user(username="bob", password="password123")
        self.login_url = reverse("login")

    def _auth(self, username="alice", password="password123"):
        response = self.client.post(
            self.login_url,
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_register_login_tweet_like_comment_follow_and_feed_flow(self):
        register_response = self.client.post(
            reverse("register"),
            {"username": "charlie", "password": "password123"},
            format="json",
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(register_response.data["username"], "charlie")
        self.assertNotIn("password", register_response.data)

        self._auth(username="alice")

        create_tweet_response = self.client.post(
            reverse("tweet-list-create"),
            {"content": "hello world"},
            format="json",
        )
        self.assertEqual(create_tweet_response.status_code, status.HTTP_201_CREATED)
        tweet_id = create_tweet_response.data["id"]

        like_response = self.client.post(reverse("like-toggle", kwargs={"tweet_id": tweet_id}))
        self.assertEqual(like_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Like.objects.filter(user=self.user1, tweet_id=tweet_id).exists())

        comment_response = self.client.post(
            reverse("comment-list-create", kwargs={"tweet_id": tweet_id}),
            {"content": "nice tweet"},
            format="json",
        )
        self.assertEqual(comment_response.status_code, status.HTTP_201_CREATED)
        parent_comment_id = comment_response.data["id"]

        reply_response = self.client.post(
            reverse("comment-list-create", kwargs={"tweet_id": tweet_id}),
            {"content": "reply", "parent_comment": parent_comment_id},
            format="json",
        )
        self.assertEqual(reply_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(reply_response.data["parent_comment"], parent_comment_id)

        follow_response = self.client.post(reverse("follow-toggle", kwargs={"user_id": self.user2.id}))
        self.assertEqual(follow_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Follow.objects.filter(follower=self.user1, followed=self.user2).exists())

        bob_tweet = Tweet.objects.create(user=self.user2, content="tweet from bob")
        feed_response = self.client.get(reverse("feed"))
        self.assertEqual(feed_response.status_code, status.HTTP_200_OK)
        feed_ids = [item["id"] for item in feed_response.data["results"]]
        self.assertIn(bob_tweet.id, feed_ids)

        me_response = self.client.get(reverse("me"))
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["username"], "alice")

        profile_response = self.client.get(reverse("user-profile", kwargs={"pk": self.user2.id}))
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["username"], "bob")
        self.assertTrue(profile_response.data["is_following"])

    def test_comment_parent_must_belong_to_same_tweet(self):
        self._auth(username="alice")

        tweet1 = Tweet.objects.create(user=self.user1, content="tweet 1")
        tweet2 = Tweet.objects.create(user=self.user1, content="tweet 2")
        parent = Comment.objects.create(user=self.user1, tweet=tweet1, content="parent")

        response = self.client.post(
            reverse("comment-list-create", kwargs={"tweet_id": tweet2.id}),
            {"content": "invalid reply", "parent_comment": parent.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("parent_comment", response.data)
