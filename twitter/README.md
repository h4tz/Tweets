# filepath: /home/hatz/Dj/DJANGOD/twitter/README.md
# Twitter Clone API

This is a simple Twitter clone API built with Django and Django REST Framework.

## Features

- User registration and JWT authentication.
- Create, read tweets.
- Like, comment on tweets.
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

## API Documentation

The interactive API documentation (Swagger UI) is available at:

[http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)


// ...existing code...
## API Endpoints

A brief overview of the available endpoints. For detailed information and to try them out, see the [Swagger Documentation](http://127.0.0.1:8000/api/schema/swagger-ui/).

*   `/api/register/`: `POST` - Register a new user.
*   `/api/login/`: `POST` - Log in and receive JWT tokens.
*   `/api/tweets/`: `GET`, `POST` - List all tweets or create a new one.
*   `/api/tweets/<id>/`: `GET` - Retrieve a single tweet.
*   `/api/tweets/<id>/like/`: `POST` - Like or unlike a tweet.
*   `/api/tweets/<id>/comments/`: `POST` - Add a comment to a tweet.
*   `/api/users/<id>/follow/`: `POST` - Follow or unfollow a user.