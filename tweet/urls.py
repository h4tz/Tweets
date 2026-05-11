from django.urls import path 
from .views import (
    CommentListCreateAPIView,
    FeedTweetListAPIView,
    FollowToggleAPIView,
    LikeToggleAPIView,
    LoginView,
    MeAPIView,
    RegisterView,
    TweetListCreateAPIView,
    TweetRetrieveUpdateDestroyAPIView,
    UserProfileAPIView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeAPIView.as_view(), name='me'),
    path('feed/', FeedTweetListAPIView.as_view(), name='feed'),
    
    path('tweets/', TweetListCreateAPIView.as_view(),name='tweet-list-create'),
    path('tweets/<int:pk>/', TweetRetrieveUpdateDestroyAPIView.as_view(), name='tweet-retrieve-update-destroy'),
    
    path('tweets/<int:tweet_id>/like/', LikeToggleAPIView.as_view(), name='like-toggle'),
    path('tweets/<int:tweet_id>/comments/', CommentListCreateAPIView.as_view(),name='comment-list-create'),
    path('users/<int:user_id>/follow/', FollowToggleAPIView.as_view(), name='follow-toggle'),
    path('users/<int:pk>/', UserProfileAPIView.as_view(), name='user-profile'),
]