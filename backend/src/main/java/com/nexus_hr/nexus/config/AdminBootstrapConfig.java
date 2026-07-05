package com.nexus_hr.nexus.config;

import com.nexus_hr.nexus.entity.Role;
import com.nexus_hr.nexus.entity.User;
import com.nexus_hr.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapConfig {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.enabled:false}")
    private boolean bootstrapEnabled;

    @Value("${app.bootstrap.admin.username:admin}")
    private String adminUsername;

    @Value("${app.bootstrap.admin.email:admin@nexushr.local}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner bootstrapAdminUser() {
        return args -> {
            if (!bootstrapEnabled || userRepository.existsByRole(Role.ADMIN)) {
                return;
            }
            if (adminPassword == null || adminPassword.isBlank()) {
                log.warn("Admin bootstrap is enabled but ADMIN_BOOTSTRAP_PASSWORD is not set. No admin was created.");
                return;
            }

            User admin = User.builder()
                    .username(adminUsername)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();

            userRepository.save(admin);
            log.info("Bootstrap admin user created. Change this password after first login.");
        };
    }
}
