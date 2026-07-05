package com.nexus_hr.nexus.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.nexus_hr.nexus.entity.Payroll;
import com.nexus_hr.nexus.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class PayslipService {

    private final PayrollRepository payrollRepository;

    public byte[] generatePayslip(Long payrollId) {

        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found with id: " + payrollId));

        if (!Boolean.TRUE.equals(payroll.getApproved())) {
            throw new RuntimeException("Payslip can be generated only after payroll approval");
        }

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
            Font headingFont = new Font(Font.HELVETICA, 14, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 12);

            Paragraph title = new Paragraph("NEXUS HR - PAYSLIP", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Employee Name: " +
                    payroll.getEmployee().getFirstName() + " " + payroll.getEmployee().getLastName(), normalFont));

            document.add(new Paragraph("Month/Year: " + payroll.getMonth() + "/" + payroll.getYear(), normalFont));
            document.add(new Paragraph("Generated Date: " + payroll.getGeneratedDate(), normalFont));
            document.add(new Paragraph("Approved By: " + payroll.getApprovedBy(), normalFont));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Salary Details", headingFont));

            document.add(new Paragraph("Basic Salary: Rs. " + payroll.getBasicSalary(), normalFont));
            document.add(new Paragraph("Working Days: " + payroll.getWorkingDays(), normalFont));
            document.add(new Paragraph("Paid Days: " + payroll.getPaidDays(), normalFont));
            document.add(new Paragraph("Absent Days: " + payroll.getAbsentDays(), normalFont));
            document.add(new Paragraph("Per Day Salary: Rs. " + payroll.getPerDaySalary(), normalFont));
            document.add(new Paragraph("Bonus: Rs. " + payroll.getBonus(), normalFont));
            document.add(new Paragraph("Deductions: Rs. " + payroll.getDeductions(), normalFont));

            document.add(new Paragraph(" "));
            Paragraph netSalary = new Paragraph("Net Salary: Rs. " + payroll.getNetSalary(), headingFont);
            document.add(netSalary);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Status: " + payroll.getStatus(), normalFont));

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate payslip PDF");
        }
    }
}