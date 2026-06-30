package com.nexus_hr.nexus.dto;

import jakarta.validation.constraints.Email;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    private String username;

    @Email(message = "Invalid email")
    private String email;
}