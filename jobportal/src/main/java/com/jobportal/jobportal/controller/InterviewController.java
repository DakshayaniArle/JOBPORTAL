package com.jobportal.jobportal.controller;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.jobportal.jobportal.dto.InterviewRequest;
import com.jobportal.jobportal.model.Interview;
import com.jobportal.jobportal.service.InterviewService;

@RestController
@RequestMapping("/interviews")
public class InterviewController {
	private final InterviewService interviewService;

	public InterviewController(InterviewService interviewService) {
		this.interviewService = interviewService;
	}
	
	@PostMapping("/schedule")
	public Interview scheduleInterview(
	        @RequestBody InterviewRequest request)
	        throws Exception {

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return interviewService
	            .scheduleInterview(
	                    request,
	                    email);
	}
	
	@GetMapping("/my-interviews")
	public List<Interview> getMyInterviews(){

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return interviewService
	            .getMyInterviews(email);
	}
	
	@GetMapping("/recruiter")
	public List<Interview> getRecruiterInterviews(){

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return interviewService
	            .getRecruiterInterviews(email);
	}
	
}
