# from django.shortcuts import render

# # Create your views here.
# CRUD opertaions on tweet

# like : user liking tweet with a particular id maybe (request.user)
# comment : request.user commenting in a tweet with id || the user that created that tweet can reply to that comment comment.id maybee
# follow : request.user following tweet.user


from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from .models import Tweet, Like, Comment, Follow 
from .serializers import (
    TweetSerializer,
    LikeSerializer,
    CommentSerializer,
    FollowSerializer,
    UserSerializer,
)

User = get_user_model()

class IsOwnerOrReadOnly(permission.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permission.SAFE_METHODS:
            return True
        
        return obj.user == request.user
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permission.AllowAny,)
    
    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(self.request.data.get('password'))
        user.save()
        
class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, **args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = get_object_or_404(User, username=username)
        
        if not user.check_password(password):
            return Response({'detail': 'Invalid Credentials'}, status = status.HTTP_404_BAD_REQUEST)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
        
class TweetListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TweetSerialzier
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    
    def get_queryset(self):
        return Tweet.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TweetRetrieveUpdateDestroyAPIVIew(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tweet.objects.all()
    serializer_class = TweetSerializer
    permission_classes = (IsOwnerOrReadOnly,)

class LikeToggleAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, tweet_id):
        tweet = get_object_or_404(Tweet, id=tweet.id)
        like, created = Like.objects.get_or_create(user=request.user, tweet=tweet)
        
        if not created:
            like.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        return Response({'detail': 'Tweet Liked'}, status=status.HTTP_201_CREATED)
    
class CommentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CommentSerialzier
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    
    def get_queryset(self):
        tweet_id = self.kwargs['tweet_id']
        return Comment.objects.filter(tweet_id=tweet_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        tweet_id = self.kwargs['tweet_id']
        tweet = get_object_or_404(Tweet, id=tweet_id)
        serializer.save(user=self.request.user, tweet=tweet)
        
class FollowToggleAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, user_id):
        followed_user = get_object_or_404(User, id=user_id)
        if request.user == followed_user:
            return Response({'detail': 'Cannot follow yourself. '}, status=status.HTTP_400_BAD_REQUEST)
        follow, created = Follow.objects.get_or_create(follower=request.user, followed=followed_user)
        
        if not created :
            follow.delete()
            return Response({'detail': 'unfollowed'}, status= status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Followed successfully'}, status=status.HTTP_201_CREATED)  