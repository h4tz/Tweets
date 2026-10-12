package com.hatz.twitter.modules.users;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository
    extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
  Optional<User> findByUsername(String username);
  boolean existsByUsernameOrEmail(String username, String email);
  boolean existsByUsername(String username);
  boolean existsByEmail(String email);
}
