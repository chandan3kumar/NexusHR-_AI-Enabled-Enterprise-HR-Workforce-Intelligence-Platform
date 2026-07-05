package com.nexus_hr.nexus.dto;

import com.nexus_hr.nexus.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String username;
    private String email;
    private Role role;

    private Long id;
    private boolean enabled;
}