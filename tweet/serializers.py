from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Tweet, Like, Comment, Follow 

# Correctly call the function to get the User model class
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    Handles user registration and data representation.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['id', 'email']
        
    def create(self, validated_data):
        """
        Custom create method to handle user creation with a hashed password.
        """
        user = User.objects.create_user(**validated_data)
        return user
        
class TweetSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = ['id', 'user', 'content', 'created_at', 'updated_at', 'likes_count', 'comments_count', 'is_liked']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'likes_count', 'comments_count', 'is_liked']
        
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
class LikeSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Like
        fields = ['id', 'user', 'tweet']
        read_only_fields = ['user', 'tweet']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'tweet', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'tweet', 'created_at']

class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'followed']
        read_only_fields = ['id', 'follower', 'followed']
