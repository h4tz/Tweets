# What I Learned

## 1) Layered design helps readability

When view files grow, mixing HTTP handling, business logic, and database operations makes maintenance harder. Splitting into service + repository layers makes each part easier to reason about.

## 2) Service layer captures business rules

Rules like "user cannot follow themselves" belong in services, not in repositories. Repositories should stay focused on data access only.

## 3) Repository layer reduces ORM duplication

Common query logic (fetch user/tweet, list comments, toggle records) can be centralized and reused across multiple endpoints.

## 4) Thin views are easier to extend

After refactoring, views mostly validate/authenticate and map service outcomes to response codes. This makes adding features safer.

## 5) Clear boundaries improve testing strategy

Service methods can be unit-tested for behavior and edge cases, while repository methods can be tested for query correctness separately.
