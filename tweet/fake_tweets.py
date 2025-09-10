import os
import django
import random
import sys
from django.db import IntegrityError

# Add the project root to the Python path
# This allows the script to find the 'twitter' module and its settings
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# Set up Django environment.
# You MUST replace 'your_project_name.settings' with the actual name of your project.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'twitter.settings')
django.setup()

from faker import Faker
from django.contrib.auth import get_user_model
# You MUST replace 'your_app_name.models' with the actual name of your app.
from tweet.models import Tweet, Like, Comment, Follow

# Create a Faker instance
fake = Faker()
User = get_user_model()

# --- Configuration ---
NUM_USERS = 50
NUM_TWEETS_PER_USER = 10
NUM_LIKES_PER_USER = 50
NUM_COMMENTS_PER_USER = 30
NUM_FOLLOWS_PER_USER = 15

# --- Main Script ---
def run_populate_script():
    """
    Deletes existing data and creates new fake data for all models.
    """
    print("Deleting existing data...")
    # Exclude the 'admin' user to avoid deleting the superuser account.
    User.objects.all().exclude(username='admin').delete()
    Tweet.objects.all().delete()
    Like.objects.all().delete()
    Comment.objects.all().delete()
    Follow.objects.all().delete()
    print("Deletion complete.")

    # 1. Create Users
    print(f"Creating {NUM_USERS} fake users...")
    users = []
    for _ in range(NUM_USERS):
        user = User.objects.create_user(
            username=fake.user_name(),
            password='password123',
            email=fake.email(),
        )
        users.append(user)
    print("Users created.")

    # 2. Create Tweets
    print("Creating fake tweets...")
    tweets = []
    for user in users:
        for _ in range(NUM_TWEETS_PER_USER):
            tweet = Tweet.objects.create(
                user=user,
                content=fake.text(max_nb_chars=280),
                created_at=fake.date_time_between(start_date='-1y', end_date='now')
            )
            tweets.append(tweet)
    print("Tweets created.")

    # 3. Create Likes
    print("Creating fake likes...")
    for user in users:
        for _ in range(NUM_LIKES_PER_USER):
            random_tweet = random.choice(tweets)
            try:
                Like.objects.create(
                    user=user,
                    tweet=random_tweet,
                )
            except IntegrityError:
                # Handle cases where a user already liked the tweet
                pass
    print("Likes created.")

    # 4. Create Comments
    print("Creating fake comments...")
    for user in users:
        for _ in range(NUM_COMMENTS_PER_USER):
            random_tweet = random.choice(tweets)
            Comment.objects.create(
                user=user,
                tweet=random_tweet,
                content=fake.sentence(),
                created_at=fake.date_time_between(start_date='-1y', end_date='now')
            )
    print("Comments created.")

    # 5. Create Follows
    print("Creating fake follows...")
    for user in users:
        for _ in range(NUM_FOLLOWS_PER_USER):
            followed_user = random.choice(users)
            if user != followed_user:
                try:
                    Follow.objects.create(
                        follower=user,
                        followed=followed_user
                    )
                except IntegrityError:
                    # Handle cases where a user is already following
                    pass
    print("Follows created.")
    print("All data generated successfully!")

if __name__ == '__main__':
    # Make sure to install faker: pip install Faker
    run_populate_script()
