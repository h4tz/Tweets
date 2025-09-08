from django.urls import path 
from .views import (
    RegisterView,
    LoginView,
    TweetListCreateAPIView,
    TweetRetrieveUpdateDestroyAPIView,
    LikeToggleAPIView,
    CommnetListCreateAPIVIew,
    FollowToggleAPIView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/'. LoginView.as_view(), name='login'),
    
    path('tweets/', TweetListCreateAPIView.as_view(),name='tweet-list-create'),
    path('tweets/<int:pk>/', TweetRetrieveUpdateDestroyAPIView.as_view(), name='tweet-retieve-update-destroy'),
    
    path('tweets/<int:tweet_id>/like/', LikeToggleAPIVIew.as_view(), name='like-toggle'),
    path('tweets/<int:tweet_id>/comments/', CommentListCreateAPIView.as_view(),name='comment-list-create'),
    path('users/<int:user_id>/follow/', FollowToggleAPIView.as_view(), name='follow-toggle'),
]