package com.jobportal.jobportal.controller;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.jobportal.jobportal.dto.JobRecommendationDTO;
import com.jobportal.jobportal.enums.JobType;
import com.jobportal.jobportal.model.Job;
import com.jobportal.jobportal.service.JobService;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {
	private final JobService jobService;
	
	public JobController(JobService jobService) {
		this.jobService = jobService;
	}
	
	@PostMapping
	public Job createJob(@Valid @RequestBody Job job) throws Exception {
		
		String email = SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
		
		return jobService.createJob(job,email);
	}
	
//	@GetMapping
//	public List<Job> getAllJobs() {
//		return jobService.getAllJobs();
//	}
	
	@GetMapping("/{id}")
	public Job getJobById(@PathVariable Long id){
		return jobService.getJobById(id);
	}
	
	@DeleteMapping("/{jobId}")
	public String deleteJob(@PathVariable Long jobId) {
		String email = SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
		jobService.deleteJob(jobId, email);
		return "Job deleted successfully";
	}
	
	@GetMapping
	public Page<Job> getJobs(Pageable pageable){
	    return jobService.getAllJobs(pageable);
	}
	
	@GetMapping("/search")
	public List<Job> searchJobs(@RequestParam String keyword) {
	    return jobService.searchJobs(keyword);
	}
	
	@PutMapping("/{jobId}")
	public Job updateJob(@PathVariable Long jobId,
	                   @Valid  @RequestBody Job job) {
		String email = SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
	    return jobService.updateJob(jobId, job, email);
	}
	
	@GetMapping("/my-jobs")
	public List<Job> getMyJobs(){

	    String email =
	            SecurityContextHolder
	                    .getContext()
	                    .getAuthentication()
	                    .getName();

	    return jobService.getMyJobs(email);
	}
	
//	@DeleteMapping("/{jobId}")
//	public String deleteJob(@PathVariable Long jobId) {
//
//	    jobService.deleteJob(jobId);
//	    return "Job deleted successfully";
//	}
	
	@GetMapping("/recommended")
	public List<JobRecommendationDTO> getRecommendedJobs(){
		String email = 
				SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
		return jobService.getRecommendedJobs(email);
	}
	
	@GetMapping("/filter")
	public List<Job> filterJobs(

	        @RequestParam(required = false) String title,

	        @RequestParam(required = false) String location,

	        @RequestParam(required = false) String company,

	        @RequestParam(required = false) String skill,

	        @RequestParam(required = false) JobType jobType,

	        @RequestParam(required = false) Integer experience,

	        @RequestParam(required = false) Double minSalary
	){

	    return jobService.filterJobs(
	            title,
	            location,
	            company,
	            skill,
	            jobType,
	            experience,
	            minSalary
	    );
	}
	
	@PutMapping("/{jobId}/close")
	public Job closeJob(@PathVariable Long jobId){
		String email = SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
	    return jobService.closeJob(jobId, email);
	}
	
	@PutMapping("/{jobId}/reopen")
	public Job reopenJob(@PathVariable Long jobId){
		String email = SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
	    return jobService.reopenJob(jobId, email);
	}
	
	@PutMapping("/{jobId}/extend")
	public Job extendExpiry(
	        @PathVariable Long jobId,
	        @RequestParam int days){
		String email = SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getName();
	    return jobService.extendExpiry(jobId, days, email);
	}
}
 