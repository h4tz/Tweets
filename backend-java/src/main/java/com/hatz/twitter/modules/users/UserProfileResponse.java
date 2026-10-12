package com.hatz.twitter.modules.users;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Mirrors Django's UserProfileSerializer. */
public record UserProfileResponse(
    Long id,
    String username,
    String email,
    @JsonProperty("followers_count") long followersCount,
    @JsonProperty("following_count") long followingCount,
    @JsonProperty("tweets_count") long tweetsCount,
    @JsonProperty("is_following") boolean isFollowing) {}
