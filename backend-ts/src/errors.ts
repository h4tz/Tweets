/**
 * HTTP errors shaped like Django REST Framework responses, so the TS API
 * returns the same bodies as the Django one.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: Record<string, unknown>,
  ) {
    super(String(body.detail ?? 'Error'));
    this.name = 'ApiError';
  }
}

export const notFound = () => new ApiError(404, { detail: 'Not found.' });

export const notAuthenticated = () =>
  new ApiError(401, { detail: 'Authentication credentials were not provided.' });

export const invalidToken = () =>
  new ApiError(401, { detail: 'Given token not valid for any token type' });

export const permissionDenied = () =>
  new ApiError(403, { detail: 'You do not have permission to perform this action.'});

/** DRF-style validation errors: { field: ["message", ...] } */
export class ValidationError extends ApiError {
  constructor(public readonly errors: Record<string, string[]>) {
    super(400, errors);
    this.name = 'ValidationError';
  }
}
