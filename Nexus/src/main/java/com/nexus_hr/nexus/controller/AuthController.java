package com.nexus_hr.nexus.controller;

import com.nexus_hr.nexus.dto.*;
import com.nexus_hr.nexus.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {

        return ResponseEntity.ok(
                authService.getCurrentUser(authentication.getName())
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(
                authService.updateProfile(authentication.getName(), request)
        );
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        return ResponseEntity.ok(
                authService.changePassword(authentication.getName(), request)
        );
    }

    @PutMapping("/disable/{userId}")
    public ResponseEntity<String> disableUser(
            @PathVariable Long userId,
            Authentication authentication) {

        return ResponseEntity.ok(
                authService.disableUser(userId, authentication.getName())
        );
    }
    @PutMapping("/role/{userId}")
    public ResponseEntity<AuthResponse> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRoleRequest request) {

        return ResponseEntity.ok(authService.updateUserRole(userId, request));
    }

}