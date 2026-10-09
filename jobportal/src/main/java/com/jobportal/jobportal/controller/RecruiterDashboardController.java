package com.jobportal.jobportal.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.jobportal.dto.RecruiterDashboardDTO;
import com.jobportal.jobportal.service.RecruiterDashboardService;

@RestController
public class RecruiterDashboardController {

    private final RecruiterDashboardService dashboardService;

    public RecruiterDashboardController(
            RecruiterDashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/recruiter")
    public RecruiterDashboardDTO dashboard() {

        String email =
                SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return dashboardService.getDashboard(email);
    }
}