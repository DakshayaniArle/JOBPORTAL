package com.jobportal.jobportal.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.jobportal.exception.JobNotFoundException;
import com.jobportal.jobportal.exception.ResourceAlreadyExistsException;
import com.jobportal.jobportal.exception.UserNotFoundException;
import com.jobportal.jobportal.model.Job;
import com.jobportal.jobportal.model.SavedJob;
import com.jobportal.jobportal.model.User;
import com.jobportal.jobportal.repository.JobRepository;
import com.jobportal.jobportal.repository.SavedJobRepository;
import com.jobportal.jobportal.repository.UserRepository;
import java.util.*;

@Service
public class SavedJobService {
	public final SavedJobRepository savedJobRepository;
	public final UserRepository userRepository;
	public final JobRepository jobRepository;
	
	public SavedJobService(SavedJobRepository savedJobRepository, UserRepository userRepository,
			JobRepository jobRepository) {
		this.savedJobRepository = savedJobRepository;
		this.userRepository = userRepository;
		this.jobRepository = jobRepository;
	}
	
	public SavedJob savedJob(Long jobId,String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(()-> new UserNotFoundException("User nor Found"));
		Job job = jobRepository.findById(jobId)
				.orElseThrow(()-> new JobNotFoundException("Job nor Found"));
		
		if(savedJobRepository.existsByUserAndJob(user, job)) {
			throw new ResourceAlreadyExistsException("Job already saved");
		}
		
		SavedJob savedJob = new SavedJob();
		savedJob.setUser(user);
		savedJob.setJob(job);
		
		return savedJobRepository.save(savedJob);
	
	
     }
	
	public List<SavedJob> getMySavedJobs(String email){
		User user = userRepository.findByEmail(email)
				.orElseThrow(()-> new UserNotFoundException("User nor Found"));
		
		return savedJobRepository.findByUser(user);
	}
	
	@Transactional 
	public void removeSavedJob(Long jobId,String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(()-> new UserNotFoundException("User nor Found"));
		Job job = jobRepository.findById(jobId)
				.orElseThrow(()-> new JobNotFoundException("Job nor Found"));
		
		savedJobRepository.deleteByUserAndJob(user, job);
	}
}
