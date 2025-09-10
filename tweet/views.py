from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from django.db.models import Prefetch

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import IntegrityError


from .pagination import CustomCursorPagination
from .models import Tweet, Like, Comment, Follow 
from .serializers import (
    TweetSerializer,
    LikeSerializer,
    CommentSerializer,
    FollowSerializer,
    UserSerializer,
)

User = get_user_model()

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow only owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request, so we'll always allow GET, HEAD, or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the snippet.
        return obj.user == request.user

class RegisterView(APIView):
    """
    API endpoint for user registration.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        print("Received a POST request for registration.")
        print(f"Request data: {request.data}")
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            print("User registered successfully.")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
class LoginView(APIView):
    """
    API endpoint for user login.
    """
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        try:
            user = get_object_or_404(User, username=username)
        except Exception:
            return Response({'detail': 'User not found.'}, status = status.HTTP_404_NOT_FOUND)
        
        if not user.check_password(password):
            return Response({'detail': 'Invalid Credentials'}, status = status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    
    def get(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
class TweetListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating tweets.
    """
    serializer_class = TweetSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    pagination_class = CustomCursorPagination

    def get_queryset(self):
        print("TweetListCreateAPIView: Fetching all tweets.")
        queryset = Tweet.objects.all().order_by('-created_at')
        print(f"TweetListCreateAPIView: Queryset contains {queryset.count()} tweets.")
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TweetRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, and deleting a single tweet.
    """
    queryset = Tweet.objects.all()
    serializer_class = TweetSerializer
    permission_classes = (IsOwnerOrReadOnly,)

class LikeToggleAPIView(APIView):
    """
    API endpoint to toggle a like on a tweet.
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, tweet_id):
        tweet = get_object_or_404(Tweet, id=tweet_id)
        like, created = Like.objects.get_or_create(user=request.user, tweet=tweet)
        
        if not created:
            like.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        return Response({'detail': 'Tweet Liked'}, status=status.HTTP_201_CREATED)
    
class CommentListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating comments on a tweet.
    """
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    pagination_class = CustomCursorPagination
    
    def get_queryset(self):
        print("CommentListCreateAPIView: Fetching comments for a tweet.")
        tweet_id = self.kwargs['tweet_id']
        queryset = Comment.objects.filter(tweet_id=tweet_id).order_by('-created_at')
        print(f"CommentListCreateAPIView: Queryset contains {queryset.count()} comments.")
        return queryset
    
    def perform_create(self, serializer):
        tweet_id = self.kwargs['tweet_id']
        tweet = get_object_or_404(Tweet, id=tweet_id)
        serializer.save(user=self.request.user, tweet=tweet)
        
class FollowToggleAPIView(APIView):
    """
    API endpoint to toggle following a user.
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, user_id):
        followed_user = get_object_or_404(User, id=user_id)
        if request.user == followed_user:
            return Response({'detail': 'Cannot follow yourself. '}, status=status.HTTP_400_BAD_REQUEST)
        try:
            follow, created = Follow.objects.get_or_create(follower=request.user, followed=followed_user)
        except IntegrityError:
            return Response({'detail': 'Already following this user.'}, status=status.HTTP_409_CONFLICT)
        
        if not created:
            follow.delete()
            return Response({'detail': 'unfollowed'}, status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Followed successfully'}, status=status.HTTP_201_CREATED)
