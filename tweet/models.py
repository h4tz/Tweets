from django.db import models
from django.conf import settings


class Tweet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tweets', verbose_name='Authur')
    content = models.TextField(verbose_name='Tweet Content')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name ='Updated At')
    
    def __str__(self):
        return f'Tweet by {self.user.username} at {self.created_at.strftime("%Y-%m-%d %H:%M")}'
    
    class Meta:
        ordering = ['-created_at']

class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='likes',verbose_name='Liker')
    tweet = models.ForeignKey(Tweet,on_delete=models.CASCADE,related_name='likes',verbose_name='Liked Tweet')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Liked At')
    
    def __str__(self):
        return f'{self.user.username} likes tweet ID {self.tweet.id}'
    
    class Meta:
        unique_together = ('user', 'tweet')

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name = 'comments', verbose_name="Commenter")
    tweet = models.ForeignKey(Tweet,on_delete=models.CASCADE,related_name='comments',verbose_name='Commented Tweet')
    parent_comment = models.ForeignKey('self',on_delete=models.CASCADE,null=True,blank=True, related_name='replies')
    content = models.TextField(verbose_name='Comment Content')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Commented At')
    
    def __str__(self):
        return f' Comment by {self.user.username} on tweet ID {self.tweet.id}'
    
class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following',
        verbose_name="Follower"
    )
    followed = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='followers',
        verbose_name="Followed"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Followed At")

    def __str__(self):
        return f'{self.follower.username} follows {self.followed.username}'
    
    class Meta:
        unique_together = ('follower', 'followed')
