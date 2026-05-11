# filepath: /home/hatz/Dj/DJANGOD/twitter/README.md
# Twitter Clone API

This is a simple Twitter clone API built with Django and Django REST Framework.

## Features

- User registration and JWT authentication.
- User profile and "me" endpoint with follower/following stats.
- Create, list, update, delete tweets.
- Personal feed endpoint with tweets from followed users.
- Like, comment, and threaded replies on tweets.
- Follow/unfollow users.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd twitter
    ```

2.  **Create a virtual environment and activate it:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file** from the `.env.example` (if you create one) or manually add the required variables:
    ```
    SECRET_KEY='your-secret-key'
    DEBUG=True
    ```

5.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```

7.  **Open the web UI (same origin as the API):** [http://127.0.0.1:8000/](http://127.0.0.1:8000/) — register, log in, and use every `/api/` feature from the browser.

## API Documentation

The interactive API documentation (Swagger UI) is available at:

[http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)


// ...existing code...
## API Endpoints

A brief overview of the available endpoints. For detailed information and to try them out, see the [Swagger Documentation](http://127.0.0.1:8000/api/schema/swagger-ui/).

*   `/api/register/`: `POST` - Register a new user.
*   `/api/login/`: `POST` - Log in and receive JWT tokens.
*   `/api/me/`: `GET` - Retrieve the authenticated user's profile.
*   `/api/feed/`: `GET` - Retrieve tweets from users you follow.
*   `/api/tweets/`: `GET`, `POST` - List all tweets or create a new one.
*   `/api/tweets/<id>/`: `GET`, `PATCH`, `DELETE` - Retrieve, update, or delete a single tweet.
*   `/api/tweets/<id>/like/`: `POST` - Like or unlike a tweet.
*   `/api/tweets/<id>/comments/`: `GET`, `POST` - List or add comments to a tweet (`parent_comment` optional for replies).
*   `/api/users/<id>/follow/`: `POST` - Follow or unfollow a user.
*   `/api/users/<id>/`: `GET` - Retrieve a user's profile and follow stats.