package com.hatz.twitter.modules.users;

/** Mirrors Django's UserSerializer (register response). */
public record UserResponse(Long id, String username, String email) {}
