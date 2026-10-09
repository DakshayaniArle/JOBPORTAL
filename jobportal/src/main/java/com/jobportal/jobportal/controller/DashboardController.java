package com.jobportal.jobportal.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.jobportal.dto.CandidateDashboardDTO;
import com.jobportal.jobportal.dto.DashboardResponse;
import com.jobportal.jobportal.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {
	private final DashboardService dashboardService; 
	
	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}
	
	@GetMapping
	public DashboardResponse getDashboard() {
		return dashboardService.getDashboardStats();
	}
	
	@GetMapping("/candidate")
	public CandidateDashboardDTO getCandidateDashboard(){

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return dashboardService
	            .getCandidateDashboard(email);
	}
	
}
