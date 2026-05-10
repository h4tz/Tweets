# Twitter Django API - Layered Architecture

This project now follows a simple layered pattern inside the `tweet` app:

- **Views layer**: handles HTTP request/response concerns.
- **Service layer** (`tweet/services.py`): contains business logic and orchestration.
- **Repository layer** (`tweet/repositories.py`): handles data access (ORM queries).

## Why this structure

- Keeps views thin and easier to read.
- Makes business logic reusable across endpoints.
- Improves testability by isolating logic from framework code.
- Provides cleaner separation of concerns.

## Current flow

1. A request reaches a view in `tweet/views.py`.
2. The view calls the corresponding service method.
3. The service applies business rules and calls repository methods.
4. The repository executes ORM operations and returns model/queryset data.
5. The view returns the HTTP response.

## Implemented modules

- `tweet/repositories.py`
  - `TweetRepository`
  - `CommentRepository`
  - `LikeRepository`
  - `FollowRepository`
  - `UserRepository`

- `tweet/services.py`
  - `AuthService`
  - `TweetService`
  - `LikeService`
  - `CommentService`
  - `FollowService`
  - `FollowYourselfError`

## Refactored endpoints

- Login user lookup (`LoginView`)
- Tweet list (`TweetListCreateAPIView.get_queryset`)
- Like toggle (`LikeToggleAPIView`)
- Comment list/create tweet fetch (`CommentListCreateAPIView`)
- Follow toggle (`FollowToggleAPIView`)

## Next improvements (optional)

- Move `TweetRetrieveUpdateDestroyAPIView` access fully through service/repository.
- Add unit tests for service and repository layers.
- Add consistent custom exceptions for all service errors.
