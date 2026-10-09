package com.jobportal.jobportal.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.jobportal.jobportal.dto.StatusRequest;
import com.jobportal.jobportal.enums.ApplicationStatus;
import com.jobportal.jobportal.model.Application;
import com.jobportal.jobportal.service.ApplicationService;

@RestController
@RequestMapping("/applications")
public class ApplicationController {
	private final ApplicationService applicationService;
	
	public ApplicationController(ApplicationService applicationService) {
		this.applicationService = applicationService;
	}
	 
	@PostMapping("/apply/{jobId}")
	public Application applyJob(@PathVariable Long jobId) throws Exception {
		String email = SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
		
		return applicationService.applyJob(jobId,email);
	}
	
	@GetMapping("/my")
	public List<Application> getMyApplications(Authentication authentication){

	    String email = authentication.getName();

	    return applicationService.getMyApplications(email);
	}
	
	@GetMapping("/job/{jobId}")
	public List<Application> getApplicationsByJob(@PathVariable Long jobId, Authentication authentication) {
	    String email = authentication.getName();
	    return applicationService.getApplicationsByJob(jobId, email);
	}
	
	
	
	@GetMapping("/recruiter/job/{jobId}")
	public List<Application> getApplicantsForMyJob(
	        @PathVariable Long jobId){

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return applicationService.getApplicantsForRecruiterJob(
	            jobId,
	            email
	    );
	}
	
	@PutMapping("/recruiter/{applicationId}/status")
	public Application recruiterUpdateStatus(
	        @PathVariable Long applicationId,
	        @RequestBody StatusRequest request)
	        throws Exception {

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return applicationService.recruiterUpdateStatus(
	            applicationId,
	            request.getStatus(),
	            email
	    );
	}
	
	@PutMapping("/{applicationId}/status")     //ADMIN
	public Application updateStatus(
	        @PathVariable Long applicationId,
	        @RequestParam ApplicationStatus status)
	        throws Exception {

	    return applicationService.updateStatus(
	            applicationId,
	            status
	    );
	}
	
	@PutMapping("/{applicationId}/withdraw")
	public Application withdrawApplication(
	        @PathVariable Long applicationId){

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return applicationService
	            .withdrawApplication(
	                    applicationId,
	                    email);
	}
	
	@PutMapping("/{applicationId}/accept-offer")
	public Application acceptOffer(
	        @PathVariable Long applicationId){

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return applicationService.acceptOffer(
	            applicationId,
	            email);
	}
	
	
	
}
