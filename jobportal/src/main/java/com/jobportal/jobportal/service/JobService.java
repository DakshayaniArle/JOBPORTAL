package com.jobportal.jobportal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.jobportal.jobportal.dto.JobRecommendationDTO;
import com.jobportal.jobportal.enums.JobType;
import com.jobportal.jobportal.exception.JobNotFoundException;
import com.jobportal.jobportal.exception.RecruiterNotFoundException;
import com.jobportal.jobportal.exception.UnauthorizedActionException;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.model.Job;
import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.JobRepository;
import com.jobportal.jobportal.repository.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class JobService {
	
	private final JobRepository jobRepository;
	private final UserRepository userRepository;
	private final JobAlertService jobAlertService;
	
	public JobService(JobRepository jobRepository,UserRepository userRepository,JobAlertService jobAlertService) {
		this.jobRepository = jobRepository;
		this.userRepository = userRepository;
		this.jobAlertService = jobAlertService;
	}
	
	
	public Job createJob(Job job,String email) throws Exception{

	    User recruiter = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RecruiterNotFoundException("Recruiter not found"));

	    job.setRecruiter(recruiter);
	    job.setPostedDate(LocalDate.now());
	    job.setExpiryDate(LocalDate.now().plusDays(30));
	    job.setActive(true);
	    
	    Job savedJob = jobRepository.save(job);
	    jobAlertService.notifyUsers(savedJob);
	    return savedJob;
	}
	
	public List<Job> getAllJobs(){
		return jobRepository.findAll();
	} 
	
	
	public Job getJobById(Long id) {
		Job job = jobRepository.findById(id)
		        .orElseThrow(() ->
		                new JobNotFoundException("Job not found"));

		boolean isRecruiterOrAdmin = false;
		try {
			org.springframework.security.core.Authentication auth =
					org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
			if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
				User viewer = userRepository.findByEmail(auth.getName()).orElse(null);
				if (viewer != null && ("RECRUITER".equalsIgnoreCase(viewer.getRole()) || "ADMIN".equalsIgnoreCase(viewer.getRole()))) {
					isRecruiterOrAdmin = true;
				}
			}
		} catch (Exception ignored) {
		}

		if (!isRecruiterOrAdmin) {
			Long views = job.getViews();
			if (views == null) {
				views = 0L;
			}
			job.setViews(views + 1);
			jobRepository.save(job);
		}
		return job;
	}
	
	public void deleteJob(Job job) {
	    jobRepository.delete(job);
	}
	
	public Page<Job> getAllJobs(Pageable pageable){

	    return jobRepository.findByActiveTrue(pageable);
	}
	public List<Job> getMyJobs(String email){

	    User recruiter = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RecruiterNotFoundException("Recruiter not found"));

	    return jobRepository.findByRecruiter(recruiter);
	}
	
	public List<Job> searchJobs(String keyword) {
	    return jobRepository.findByTitleContainingIgnoreCase(keyword);
	}
	
	private void checkJobOwnership(Job job, String email) {
		User caller = userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		// Admins have full access to modify any job
		if ("ADMIN".equals(caller.getRole())) {
			return;
		}

		// Recruiter can only modify their own job
		if (job.getRecruiter() == null || !job.getRecruiter().getId().equals(caller.getId())) {
			throw new UnauthorizedActionException("You can modify only your own jobs");
		}
	}

	public Job updateJob(Long jobId, Job updatedJob, String email) {

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    checkJobOwnership(job, email);

	    if (updatedJob.getTitle() != null && !updatedJob.getTitle().isBlank()) {
	        job.setTitle(updatedJob.getTitle());
	    }
	    if (updatedJob.getCompany() != null && !updatedJob.getCompany().isBlank()) {
	        job.setCompany(updatedJob.getCompany());
	    }
	    if (updatedJob.getDescription() != null) {
	        job.setDescription(updatedJob.getDescription());
	    }
	    if (updatedJob.getLocation() != null && !updatedJob.getLocation().isBlank()) {
	        job.setLocation(updatedJob.getLocation());
	    }
	    if (updatedJob.getSalary() != null) {
	        job.setSalary(updatedJob.getSalary());
	    }
	    if (updatedJob.getExperience() != null) {
	        job.setExperience(updatedJob.getExperience());
	    }
	    if (updatedJob.getExperienceLevel() != null) {
	        job.setExperienceLevel(updatedJob.getExperienceLevel());
	    }
	    if (updatedJob.getJobType() != null) {
	        job.setJobType(updatedJob.getJobType());
	    }
	    if (updatedJob.getRequiredSkills() != null && !updatedJob.getRequiredSkills().isBlank()) {
	        job.setRequiredSkills(updatedJob.getRequiredSkills());
	    }

	    return jobRepository.save(job);
	}

	public Job updateJob(Long jobId, Job updatedJob) {

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    job.setTitle(updatedJob.getTitle());
	    job.setDescription(updatedJob.getDescription());

	    return jobRepository.save(job);
	}
	
	public void deleteJob(Long jobId, String email) {

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    checkJobOwnership(job, email);

	    jobRepository.deleteById(jobId);
	}

	public void deleteJob(Long jobId) {

	    jobRepository.deleteById(jobId);
	}
	
	public List<JobRecommendationDTO> getRecommendedJobs(String email){
		User user = userRepository.findByEmail(email)
				.orElseThrow(()-> new UserNotFoundException("User not found"));
		
		List<Job> jobs = jobRepository.findAll();
		
		List<JobRecommendationDTO> recommendations = new ArrayList<>();
		
		if(user.getSkill() == null || user.getSkill().isEmpty()) {
			return recommendations;
		}
		
		Set<String> userSkills = new HashSet<>(); 
		
		for(String skill:user.getSkill().split(",")) {
			userSkills.add(skill.trim().toLowerCase());
		}
		
		for(Job job:jobs) {
			
			if(job.getRequiredSkills()==null) {
				continue;
			}
			
			String[] jobSkills =job.getRequiredSkills().split(",");
			
			int matchedSkills =0;
			
			for(String skill:jobSkills) {
				if(userSkills.contains(
						skill.trim().toLowerCase())) {
					matchedSkills++;
				}
			}
			
			int percentage = (matchedSkills * 100) /jobSkills.length;
			
			if(percentage>0) {
			   recommendations.add(
					new JobRecommendationDTO(job, percentage));
			}
			
			recommendations.sort(
					(a,b)->
					Integer.compare(
							b.getMatchPercentage(),
							a.getMatchPercentage()
							)
					);
		}
		
		return recommendations;
	}
	
	public List<Job> filterJobs(
	        String title,
	        String location,
	        String company,
	        String skill,
	        JobType jobType,
	        Integer experience,
	        Double minSalary){

	    return jobRepository.filterJobs(
	            title,
	            location,
	            company,
	            skill,
	            jobType,
	            experience,
	            minSalary
	    );
	}
	
	public Job closeJob(Long jobId, String email){

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    checkJobOwnership(job, email);

	    job.setActive(false);

	    return jobRepository.save(job);
	}

	public Job closeJob(Long jobId){

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    job.setActive(false);

	    return jobRepository.save(job);
	}
	
	public Job reopenJob(Long jobId, String email){

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    checkJobOwnership(job, email);

	    job.setActive(true);

	    job.setExpiryDate(LocalDate.now().plusDays(30));

	    return jobRepository.save(job);
	}

	public Job reopenJob(Long jobId){

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    job.setActive(true);

	    job.setExpiryDate(LocalDate.now().plusDays(30));

	    return jobRepository.save(job);
	}
	
	public Job extendExpiry(Long jobId, int days, String email){

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    checkJobOwnership(job, email);

	    job.setExpiryDate(job.getExpiryDate().plusDays(days));

	    return jobRepository.save(job);
	}

	public Job extendExpiry(Long jobId, int days){

	    Job job = jobRepository.findById(jobId)
	            .orElseThrow(() -> new JobNotFoundException("Job not found"));

	    job.setExpiryDate(job.getExpiryDate().plusDays(days));

	    return jobRepository.save(job);
	}
}
