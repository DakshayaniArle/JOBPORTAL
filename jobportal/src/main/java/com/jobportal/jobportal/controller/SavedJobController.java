package com.jobportal.jobportal.controller;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.jobportal.jobportal.model.SavedJob;
import com.jobportal.jobportal.repository.SavedJobRepository;
import com.jobportal.jobportal.service.SavedJobService;

@RestController
@RequestMapping("/saved-jobs")
public class SavedJobController {
	private final SavedJobService savedJobService;

	public SavedJobController(SavedJobService savedJobService) {
		this.savedJobService = savedJobService;
	}
	
	@PostMapping("/{jobId}")
	public SavedJob saveJob(@PathVariable Long jobId) {
		String email = 
				SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
		
		return savedJobService.savedJob(jobId, email);
	}
	
	@GetMapping("/my")
	public List<SavedJob> getMySavedJobs(){
		String email = 
				SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
		return savedJobService.getMySavedJobs(email);
	}
	
	@DeleteMapping("/{jobId}")
	public String removeSavedJob(@PathVariable Long jobId) {
		String email = 
				SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
		
		savedJobService.removeSavedJob(jobId, email);
		
		return "Saved Job Removed";
	}
	
	
}
