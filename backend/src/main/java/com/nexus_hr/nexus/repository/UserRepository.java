package com.nexus_hr.nexus.repository;

import com.nexus_hr.nexus.entity.Role;
import com.nexus_hr.nexus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByRole(Role role);

    Optional<User> findFirstByRole(Role role);
}
