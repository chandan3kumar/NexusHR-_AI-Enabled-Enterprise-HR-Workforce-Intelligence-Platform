package com.nexus_hr.nexus.controller;

import com.nexus_hr.nexus.service.PayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payslips")
@RequiredArgsConstructor
public class PayslipController {

    private final PayslipService payslipService;

    @GetMapping("/{payrollId}")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long payrollId) {

        byte[] pdf = payslipService.generatePayslip(payrollId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("payslip-" + payrollId + ".pdf")
                        .build()
        );

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}